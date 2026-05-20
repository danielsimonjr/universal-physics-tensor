/**
 * BR-2 profiling baseline: GL4 Mercury 1000-step bench (v0.6.0 Phase 2, Task 2.0).
 *
 * Two bench cases that together isolate the Christoffel-evaluation share of
 * total GL4 integrator wall-time:
 *
 *   (A) "GL4 Mercury 1000 steps (full)" — runs `integrateGeodesicGL4` for
 *       1 000 steps over ~1 Mercury orbital period. This is the full
 *       integrator path: Picard stage solver + metric evaluations + step
 *       updates. Establishes the denominator for the Christoffel fraction.
 *
 *   (B) "Christoffel-only at Mercury sample rate" — runs the nested
 *       Schwarzschild Christoffel closure in a tight loop matching the GL4
 *       step's call rate. For each GL4 step the Picard solver evaluates
 *       gInverseFn and dgInverseFn at ~2 stage points × picardIter ≈ 60
 *       evaluations per step (30 iterations × 2 stages). The Christoffel
 *       closure is structurally equivalent to the dgInverseFn path used
 *       by `updateMomentumFromStages`. This bench runs the closure
 *       CHRISTOFFEL_EVALS_PER_STEP times in a tight loop.
 *
 * Christoffel fraction: f = (Christoffel-only total time) / (Full GL4 total time).
 * Because the Christoffel-only bench measures isolated closure cost × N-evals,
 * the fraction estimate is:
 *
 *   f ≈ (CHRISTOFFEL_EVALS_PER_STEP / full_hz) / (1 / full_hz × time_per_step)
 *     = (christoffel_closure_time × CHRISTOFFEL_EVALS_PER_STEP) / (1 / full_hz)
 *
 * Concretely: if full bench is X hz and christoffel-only bench is Y hz
 * (running CHRISTOFFEL_EVALS_PER_STEP evaluations per call), then:
 *
 *   time_per_GL4_step = 1 / X  (seconds)
 *   time_per_christoffel = 1 / (Y × CHRISTOFFEL_EVALS_PER_STEP)  (seconds)
 *   f = (CHRISTOFFEL_EVALS_PER_STEP / Y) / (1 / X)
 *     = X × CHRISTOFFEL_EVALS_PER_STEP / Y
 *
 * The formula above uses hz directly and avoids requiring absolute time.
 *
 * Initial conditions: canonical Mercury perihelion SI orbit, matching
 * `bench/geodesic-conservation.bench.ts` (Task 1.6) and the GL4_LONG test.
 *
 * Approach (a) from Task 2.0 design: two separate sync bench cases.
 * All inputs pre-built outside bench() callbacks (F4 discipline).
 *
 * @see docs/architecture/benchmarks.md § "v0.6.0 BR-2 baseline (pre-migration)"
 * @see src/numerical/gl4-integrator.ts  (integrateGeodesicGL4)
 * @see tests/fixtures/schwarzschild.ts  (schwarzschildGInverseFn etc.)
 */
import { bench, describe } from 'vitest';
import {
  schwarzschildGInverseFn,
  schwarzschildDgInverseFn,
  schwarzschildChristoffelFn,
  schwarzschildRs,
} from '../tests/fixtures/schwarzschild.js';
import { integrateGeodesicGL4 } from '../src/numerical/gl4-integrator.js';
import { C_SI, G_SI } from '../src/core/constants.js';

// ---------------------------------------------------------------------------
// Physical parameters — Mercury perihelion IC (canonical, SI).
// Identical to bench/geodesic-conservation.bench.ts (Task 1.6) for
// cross-bench consistency.
// ---------------------------------------------------------------------------

const M_KG = 1.989e30;         // Solar mass [kg]
const A_M = 5.79e10;           // Mercury semi-major axis [m]
const E_ORB = 0.2056;          // Mercury orbital eccentricity (dimensionless)

const r_s = schwarzschildRs(M_KG);
const r_p = A_M * (1 - E_ORB); // Perihelion radius [m]

const c = C_SI;
const c2 = c * c;
const G = G_SI;

// Vis-viva angular momentum: L = √(GM·a(1−e²))
const L = Math.sqrt(G * M_KG * A_M * (1 - E_ORB * E_ORB));

// Relativistic energy norm: E = c · √((1 − r_s/r_p)(c² + L²/r_p²))
const E = c * Math.sqrt((1 - r_s / r_p) * (c2 + (L * L) / (r_p * r_p)));

// Canonical state at perihelion: (t=0, r=r_p, θ=π/2, φ=0)
const X0 = [0, r_p, Math.PI / 2, 0] as const;
const P0 = [-E, 0, 0, L] as const;

const INITIAL_STATE = { x: X0, p: P0 };

// Keplerian orbital period [s]: T = 2π √(a³ / GM)
const T_ORBIT = 2 * Math.PI * Math.sqrt((A_M * A_M * A_M) / (G * M_KG));

// ---------------------------------------------------------------------------
// Bench (A): full GL4 integrator — 1000 steps.
//
// 1000 steps over 1 orbital period provides enough arc coverage for the
// Picard solver to reach steady-state convergence while keeping the bench
// under ~1 min on this Windows dev box.
// ---------------------------------------------------------------------------

const STEPS = 1000;
const TAU_MAX = T_ORBIT; // one full orbital period

const G_INV_FN = schwarzschildGInverseFn(M_KG);
const DG_INV_FN = schwarzschildDgInverseFn(M_KG);

// ---------------------------------------------------------------------------
// Bench (B): isolated Christoffel closure — CHRISTOFFEL_EVALS_PER_STEP calls.
//
// GL4 Picard default: picardMaxIter=50, typically converges in ~30-40 iter
// for Mercury (h ≈ T_ORBIT/1000 ≈ 2.4e5 s). Each Picard iteration evaluates
// gInverseFn + dgInverseFn at 2 stage points = 2 calls each per iteration.
// Conservative estimate for Christoffel-equivalent evals:
//   2 stages × ~35 iterations ≈ 70 dgInverseFn calls per step.
// We use 70 as the per-step call count for the Christoffel fraction formula.
//
// Note: the dgInverseFn (Schwarzschild inverse metric partial derivatives)
// and schwarzschildChristoffelFn have comparable arithmetic complexity —
// both compute ~10 distinct trigonometric + reciprocal expressions from the
// same coordinate input. Using the Christoffel closure directly is a slightly
// conservative proxy (Christoffel has more nonzero components).
// ---------------------------------------------------------------------------

const CHRISTOFFEL_EVALS_PER_STEP = 70;

// Pre-build the Christoffel closure + a representative sample point at
// Mercury perihelion (equatorial orbit: θ = π/2).
const CHRISTOFFEL_FN = schwarzschildChristoffelFn(M_KG);
// Sample point: mid-orbit representative near perihelion.
const SAMPLE_X: readonly number[] = [0, r_p, Math.PI / 2, 0];

// ---------------------------------------------------------------------------
// Bench suite
// ---------------------------------------------------------------------------

describe('BR-2 baseline: GL4 Mercury 1000-step profiling', () => {
  bench(
    'GL4 Mercury 1000 steps (full — nested-Christoffel baseline)',
    () => {
      integrateGeodesicGL4(INITIAL_STATE, {
        steps: STEPS,
        tauMax: TAU_MAX,
        gInverseFn: G_INV_FN,
        dgInverseFn: DG_INV_FN,
        domainMinRadius: 1.5 * r_s,
      });
    },
    { benchmarkTimeout: 300_000 }, // 5 min cap; 1000 GL4 steps with Picard
  );

  bench(
    `Christoffel-only at Mercury sample rate (${CHRISTOFFEL_EVALS_PER_STEP} evals/call)`,
    () => {
      // Tight loop mirroring the per-step Christoffel call rate.
      // Each iteration corresponds to one full GL4 step's worth of
      // Christoffel evaluations.
      for (let i = 0; i < CHRISTOFFEL_EVALS_PER_STEP; i++) {
        CHRISTOFFEL_FN(SAMPLE_X);
      }
    },
    { benchmarkTimeout: 60_000 }, // 1 min cap; tight loop is fast
  );
});
