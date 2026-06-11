/**
 * Perihelion-finder × GL4 round-trip integration test (v0.5.0 Task 4 Step 6).
 *
 * Bug B resolution (per task brief): the original plan-template Mercury
 * round-trip used a placeholder initial condition `p: [-1, 0, 0, 0]` that
 * does not describe a bound Schwarzschild orbit (the Legendre transform
 * from orbital E, L to p_t, p_φ is Task 11). Deriving Mercury-scale bound
 * IC here would duplicate Task 11; the round-trip's job is to prove that
 * `integrateGeodesicGL4` + `findPerihelion` **compose correctly**, not to
 * verify Mercury physics.
 *
 * **Option C1 chosen.** We integrate a flat-space (Minkowski) trajectory
 * with an externally-shaped radial coordinate that has an interior turning
 * point. Specifically: we construct a parabolic profile in cartesian-like
 * coordinates so that r(τ) has a guaranteed interior minimum, integrate
 * with GL4, then `findPerihelion` to confirm the composed pipeline picks
 * up the analytic minimum. The minimal flat-space proof case is a particle
 * moving in a straight line that passes a coordinate origin — `r(τ)` of
 * such a trajectory is `√(b² + (v(τ−τ_min))²)`, with `r_min = b` at
 * `τ = τ_min`.
 *
 * For straight-line motion in Minkowski with p_μ = const (η-flat), the GL4
 * integrator's stage equations reduce to `dx^μ/dτ = η^{μν} p_ν`, which is
 * exact in one step regardless of step count. The spatial trajectory in
 * Cartesian-like (t, x, y, z) reads `x^i(τ) = x^i_0 + v^i τ` where
 * `v^i = p_i` (Minkowski η^{ii} = 1). With initial offset `x = b`, `y = 0`
 * and velocity `p_y = v`, the radial coordinate is
 *
 *     r(τ) = √(b² + v² τ²)
 *
 * with perihelion at τ = 0 — but we want an **interior** turning point,
 * so we shift initial τ to be negative and run forward across τ = 0.
 *
 * @module tests/numerical/perihelion-finder-roundtrip.test
 */
import { describe, it, expect } from 'vitest';
import { integrateGeodesicGL4 } from '../../src/numerical/gl4-integrator.js';
import { findPerihelion } from '../../src/numerical/perihelion-finder.js';

describe('Perihelion finder × GL4: flat-space round-trip composition', () => {
  it('locates the interior perihelion of a flat-space straight-line trajectory', () => {
    // Flat Minkowski metric in (t, x, y, z); η^{μν} = diag(−1, 1, 1, 1)
    // for this test (we drop the c² SI factor — irrelevant for composition).
    // v0.9.0 flat layout: Float64Array(16), flat[mu*4+nu] = g^{μν}.
    const gInverseFn = (_x: readonly number[]): Float64Array =>
      Float64Array.from([
        -1, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
      ]);
    // 64 zeros (∂_λ η^μν = 0); flat[lambda*16 + mu*4 + nu].
    const dgInverseFn = (_x: readonly number[]): Float64Array =>
      new Float64Array(64);

    // Trajectory: particle at (x=b, y=−v·T/2) moving with p_y = v. Then
    //   x(τ) = b,  y(τ) = −v·T/2 + v·τ = v·(τ − T/2)
    //   r(τ) = √(b² + v²(τ − T/2)²)   → minimum at τ = T/2.
    const T = 100;
    const b = 5; // closest approach (perihelion radius)
    const v = 1;
    const initialState = {
      x: [0, b, -v * T / 2, 0],
      p: [-1, 0, v, 0], // p_t = −1 (timelike), p_y = v (motion in y)
    };

    const snapshots = integrateGeodesicGL4(initialState, {
      steps: 200,
      tauMax: T,
      gInverseFn,
      dgInverseFn,
    });

    // Our findPerihelion looks at dr/dτ where r = x[1] (the "radial slot").
    // For a flat-space proof of composition we redefine r := x[1] (since
    // x[1] = b is constant here, that won't sign-change). We need r to be
    // the actual Cartesian magnitude — but the production algorithm uses
    // r = x[1] (the radial coordinate index, by convention). So we re-pack
    // the snapshots into a synthetic radial profile that the algorithm
    // can consume: we replace x[1] with √(b² + y²) and synthesise the
    // momentum so that g^{rν} p_ν = dr/dτ. (For an identity g^{rr}=1 this
    // means we put dr/dτ directly into p[1].)
    //
    // This still exercises the find-perihelion side of the composition
    // (sign-change detection, cubic-Hermite, bisection refinement) on
    // GL4-emitted snapshots — the integrator passes through unchanged
    // values (η flat → no momentum drift) so the y-coordinate and time
    // we read back are exactly what GL4 propagated.
    const packed = snapshots.map((s) => {
      const y = s.x[2];
      const r = Math.sqrt(b * b + y * y);
      const dr_dtau = (y * v) / r; // d/dτ [√(b² + (vτ−vT/2)²)] = v²(τ−T/2)/r
      return {
        tau: s.tau,
        x: [s.x[0], r, Math.PI / 2, s.x[3]] as readonly number[],
        p: [-1, dr_dtau, 0, 0] as readonly number[],
      };
    });

    const result = findPerihelion({
      snapshots: packed,
      tauTolerance: 1e-9 * T, // I1: 1e-9 floor
      gInverseFn,
    });

    // Perihelion at τ = T/2 = 50 with r_min = b = 5.
    expect(result.tau).toBeGreaterThan(T * 0.45);
    expect(result.tau).toBeLessThan(T * 0.55);
    expect(Math.abs(result.tau - T / 2)).toBeLessThan(1e-9 * T);
    expect(result.x[1]).toBeCloseTo(b, 6);
    // φ is the x[3] component, which the integrator propagated from 0
    // and which remains 0 throughout (no φ-motion in this IC).
    expect(Number.isFinite(result.phi)).toBe(true);
    expect(result.phi).toBe(0);
  }, /* timeout */ 60_000);
});
