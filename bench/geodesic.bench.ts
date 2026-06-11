/**
 * Schwarzschild radial geodesic integration benchmark.
 *
 * Scenario: cycloid-radial infall — same inputs as the v0.4.0 Task 14
 * conformance test in tests/numerical/schwarzschild-radial-geodesic.test.ts.
 * M = M_sun, r₀ = 100·r_s, η_final = 0.5, domainMinRadius = 3·r_s.
 *
 * Three RK4 step counts: 1k, 5k, 10k.
 * - 1k: v0.4.5 baseline (fast measurement).
 * - 5k: matches the Task 14 conformance test step count.
 * - 10k: establishes the scaling curve for v0.5.0 symplectic-integrator
 *   comparison (2× the conformance count).
 *
 * v0.4.5: no threshold gates — baseline establishment only.
 *
 * FIXTURE ISOLATION (F3): imports from bench/fixtures/schwarzschild.ts,
 *   not from tests/ — bench/ must be self-contained (build-safe and
 *   publish-safe; tests/ is excluded from the npm tarball).
 *
 * BENCH TIMEOUT (F11): historically raised to 30 000 ms via `benchmarkTimeout`
 *   in bench()'s third argument. Vitest 4 removed that option (tinybench
 *   `time` / `iterations` govern run length instead), so it was dropped here.
 *
 * SETUP HOISTING (F4): all inputs (Christoffel closure, initial conditions)
 *   are constructed outside bench() callbacks — measures RK4 cost only, not
 *   allocator/GC cost for computing the initial state.
 *
 * @see src/numerical/geodesic-integrator.ts  (integrateGeodesic)
 * @see bench/fixtures/schwarzschild.ts        (Christoffel closure, bench-local copy)
 * @see tests/numerical/schwarzschild-radial-geodesic.test.ts (conformance test)
 */
import { bench, describe } from 'vitest';
import { integrateGeodesic } from '../src/numerical/geodesic-integrator.js';  // F12
import { schwarzschildChristoffelFn, schwarzschildRs } from './fixtures/schwarzschild.js';

// ---------------------------------------------------------------------------
// Physical parameters — canonical solar-infall scenario (F17).
// Exact values match tests/numerical/schwarzschild-radial-geodesic.test.ts.
// ---------------------------------------------------------------------------

const M_KG = 1.989e30;                // solar mass (kg)
const r_s  = schwarzschildRs(M_KG);  // Schwarzschild radius (m)
const r0   = 100 * r_s;              // initial orbital radius (m)

// Cycloid proper-time endpoint: τ_final = cyc_tau(η=0.5)
//   cyc_tau(η) = (r0/2) · sqrt(r0/r_s) · (η + sin η) / c
const C_SI      = 2.998e8;
const ETA_FINAL = 0.5;
const TAU_END   = (r0 / 2) * Math.sqrt(r0 / r_s) * (ETA_FINAL + Math.sin(ETA_FINAL)) / C_SI;

// Initial 4-velocity: Schwarzschild normalisation u^μ u_μ = −c².
// For radial infall: v0 = [1/√(1 − r_s/r₀), 0, 0, 0].
// At r₀=100·r_s this gives dt/dτ ≈ 1.005 (not 1).
const V0: readonly [number, number, number, number] = [
  1 / Math.sqrt(1 - r_s / r0),
  0,
  0,
  0,
];

// ---------------------------------------------------------------------------
// Setup hoisted outside bench callbacks (F4 discipline).
// Christoffel closure and input bundle are computed once at module load.
// ---------------------------------------------------------------------------

const CHRISTOFFEL_FN = schwarzschildChristoffelFn(M_KG);

const INFALL_INPUTS_BASE = {
  christoffelFn:   CHRISTOFFEL_FN,
  x0:              [0, r0, Math.PI / 2, 0] as readonly [number, number, number, number],
  v0:              V0,
  tauStart:        0,
  tauEnd:          TAU_END,
  domainMinRadius: 3 * r_s,
} as const;

// ---------------------------------------------------------------------------
// Bench suites — one describe per step count.
// ---------------------------------------------------------------------------

describe('Schwarzschild radial infall — 1k RK4 steps', () => {
  bench(
    'integrateGeodesic (1 000 steps)',
    () => {
      integrateGeodesic({ ...INFALL_INPUTS_BASE, steps: 1_000 });
    },
  );
});

describe('Schwarzschild radial infall — 5k RK4 steps', () => {
  bench(
    'integrateGeodesic (5 000 steps)',
    () => {
      integrateGeodesic({ ...INFALL_INPUTS_BASE, steps: 5_000 });
    },
  );
});

describe('Schwarzschild radial infall — 10k RK4 steps', () => {
  bench(
    'integrateGeodesic (10 000 steps)',
    () => {
      integrateGeodesic({ ...INFALL_INPUTS_BASE, steps: 10_000 });
    },
  );
});
