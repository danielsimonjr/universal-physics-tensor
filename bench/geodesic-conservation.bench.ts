/**
 * PC-1.5 geodesic-conservation diagnostic bench (v0.6.0 Phase 1, Task 1.6).
 *
 * Mercury 100-orbit GL4 integration recording max|ΔE/E| and max|ΔL/L|
 * (conserved-charge drift via Killing-vector contractions).
 *
 * This bench provides the "conservation axis" of the PC-1.5 investigation:
 * if the 2.51e-4 Shapiro residual floor is dominated by accumulating
 * symplectic drift rather than null-IC reconstruction noise, the max|ΔE/E|
 * trajectory should scale with step count in a predictable GL4 pattern.
 *
 * Initial conditions (canonical Mercury perihelion, SI units):
 *   a = 5.79e10 m, e = 0.2056
 *   r_p = a(1-e) = 4.598e10 m (perihelion)
 *   L = √(GM·a(1−e²))  (Newtonian orbital angular momentum)
 *   E = c · √((1 − r_s/r_p)(c² + L²/r_p²))  (relativistic energy norm)
 *   p_t = −E, p_r = 0, p_θ = 0, p_φ = L  (canonical at perihelion)
 *
 * Step budget: 10 orbits × 500 steps/orbit = 5000 GL4 steps (default).
 * Override via GL4_BENCH_ORBITS env var for deeper investigation.
 * (50k steps/orbit reproduces the GL4_LONG test; 500 steps/orbit is the
 * bench-friendly budget — sufficient to measure the conservation trend.)
 *
 * Conserved charges via Killing vectors (src/numerical/killing.ts):
 *   Q_t = ξ^μ_t · p_μ = p_t   (timelike Killing — energy)
 *   Q_φ = ξ^μ_φ · p_μ = p_φ   (axial Killing — angular momentum)
 *
 * @see src/numerical/killing.ts  (evaluateConservedCharge)
 * @see src/numerical/gl4-integrator.ts  (integrateGeodesicGL4)
 * @see tests/fixtures/schwarzschild.ts  (fixture API)
 * @see docs/architecture/pc-1.5-shapiro-residual-floor.md
 */
import { bench, describe } from 'vitest';
import {
  schwarzschildGInverseFn,
  schwarzschildDgInverseFn,
  schwarzschildRs,
  schwarzschildKillingT,
  schwarzschildKillingPhi,
} from '../tests/fixtures/schwarzschild.js';
import { integrateGeodesicGL4 } from '../src/numerical/gl4-integrator.js';
import { evaluateConservedCharge } from '../src/numerical/killing.js';
import { C_SI, G_SI } from '../src/core/constants.js';

// ---------------------------------------------------------------------------
// Physical parameters — Mercury perihelion IC (canonical, SI).
// Matches the GL4_LONG test in tests/numerical/gl4-integrator.test.ts.
// All inputs constructed outside bench() callbacks (F4 discipline).
// ---------------------------------------------------------------------------

const M_KG = 1.989e30;        // Solar mass [kg]
const A_M = 5.79e10;          // Mercury semi-major axis [m]
const E_ORB = 0.2056;         // Mercury orbital eccentricity (dimensionless)

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

// Bench-friendly budget: 10 orbits × 500 steps/orbit = 5000 GL4 steps.
// (Full GL4_LONG uses 50k steps/orbit; 500 steps/orbit still captures the
//  linear drift slope for the PC-1.5 investigation while keeping the bench
//  under ~2 min wall-clock on a Windows dev box with Picard overhead.)
// To run a 100-orbit deep investigation: set GL4_BENCH_ORBITS=100.
const ORBITS = Number(process.env.GL4_BENCH_ORBITS ?? 10);
const STEPS_PER_ORBIT = 500;
const STEPS = ORBITS * STEPS_PER_ORBIT;
const TAU_MAX = ORBITS * T_ORBIT;

const G_INV_FN = schwarzschildGInverseFn(M_KG);
const DG_INV_FN = schwarzschildDgInverseFn(M_KG);

// Killing-vector factories (coordinate-independent; built once).
const XI_T_FN = schwarzschildKillingT;
const XI_PHI_FN = schwarzschildKillingPhi;

// Initial charges (used to compute relative drift).
const Q_T_0 = evaluateConservedCharge(XI_T_FN, P0 as [number, number, number, number], X0 as [number, number, number, number]);
const Q_PHI_0 = evaluateConservedCharge(XI_PHI_FN, P0 as [number, number, number, number], X0 as [number, number, number, number]);

// ---------------------------------------------------------------------------
// Bench suite
// ---------------------------------------------------------------------------

describe('PC-1.5: Mercury 100-orbit conservation diagnostic', () => {
  bench(
    `GL4 ${ORBITS} orbits × ${STEPS_PER_ORBIT} steps/orbit — max|ΔE/E| + max|ΔL/L|`,
    () => {
      const snapshots = integrateGeodesicGL4(INITIAL_STATE, {
        steps: STEPS,
        tauMax: TAU_MAX,
        gInverseFn: G_INV_FN,
        dgInverseFn: DG_INV_FN,
        domainMinRadius: 1.5 * r_s,
      });

      // Walk snapshots and accumulate max relative drift.
      let maxDeltaE_over_E = 0;
      let maxDeltaL_over_L = 0;

      for (const snap of snapshots) {
        const x = snap.x as [number, number, number, number];
        const p = snap.p as [number, number, number, number];

        const Q_T = evaluateConservedCharge(XI_T_FN, p, x);
        const Q_PHI = evaluateConservedCharge(XI_PHI_FN, p, x);

        const dE = Math.abs((Q_T - Q_T_0) / Q_T_0);
        const dL = Math.abs((Q_PHI - Q_PHI_0) / Q_PHI_0);

        if (dE > maxDeltaE_over_E) maxDeltaE_over_E = dE;
        if (dL > maxDeltaL_over_L) maxDeltaL_over_L = dL;
      }

      // Emit the PC-1.5 diagnostic values to stdout during bench run.
      // These are NOT assertions — the bench records the floor for the
      // pc-1.5-shapiro-residual-floor.md write-up.
      if (process.env.PC15_VERBOSE === '1') {
        console.log(
          `[PC-1.5 conservation] max|ΔE/E|=${maxDeltaE_over_E.toExponential(3)}` +
          `  max|ΔL/L|=${maxDeltaL_over_L.toExponential(3)}` +
          `  steps=${STEPS}  orbits=${ORBITS}`,
        );
      }
    },
    // benchmarkTimeout (10 min cap) dropped — removed in vitest 4; tinybench
    // `time`/`iterations` govern run length instead.
  );
});
