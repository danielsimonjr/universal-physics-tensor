/**
 * Index-order guard tests for the Schwarzschild fixture (v0.5.0 Task 0).
 *
 * Locks the convention `dg[lambda][mu][nu] = ∂_lambda g^{mu nu}` (Adam+Eve
 * finding I2 — fixture-transposition guard) and pins the Riemann closed-form
 * at a concrete coordinate (M7) so index-permutation regressions in Tasks 5+
 * are caught here, not downstream.
 *
 * Convention reminder (mostly-plus −+++, SI with c² in g_{tt}, Carroll Ch. 5).
 */

import { describe, it, expect } from 'vitest';
import {
  schwarzschildRs,
  schwarzschildGFn,
  schwarzschildGInverseFn,
  schwarzschildDgInverseFn,
  schwarzschildRiemannFn,
} from './schwarzschild.js';

const M_sun = 1.989e30;
const PI_2 = Math.PI / 2;

describe('Schwarzschild fixture v0.5.0 API alignment (Task 0)', () => {
  describe('dgInverseFn: index-order convention dg[λ][μ][ν] = ∂_λ g^{μν}', () => {
    it('dg[0][1][1] = ∂_t g^{rr} = 0 (Schwarzschild is static)', () => {
      const r = 3 * schwarzschildRs(M_sun);
      const dg = schwarzschildDgInverseFn(M_sun)([0, r, PI_2, 0]);
      // Axis 0 is the ∂_t component; g^{rr} sits at [1][1].
      expect(dg[0][1][1]).toBe(0);
    });

    it('dg[2][1][1] = ∂_θ g^{rr} = 0 (Schwarzschild is θ-independent in g^{rr})', () => {
      const r = 3 * schwarzschildRs(M_sun);
      const dg = schwarzschildDgInverseFn(M_sun)([0, r, PI_2, 0]);
      expect(dg[2][1][1]).toBe(0);
    });

    it('dg[1][1][1] = ∂_r g^{rr} = r_s/r² is non-zero (radial dependence lives here)', () => {
      const r_s = schwarzschildRs(M_sun);
      const r = 3 * r_s;
      const dg = schwarzschildDgInverseFn(M_sun)([0, r, PI_2, 0]);
      // g^{rr} = (1 − r_s/r) ⇒ ∂_r g^{rr} = r_s / r²
      expect(dg[1][1][1]).toBeCloseTo(r_s / (r * r), 12);
    });

    it('dg[1][0][0] = ∂_r g^{tt} = +r_s/(r²(1−r_s/r)²c²) — POSITIVE (v0.5.0 Task 3 sign fixup)', () => {
      // Regression test for the Task 0 sign bug. The wrong sign reverses
      // the radial force in the GL4 geodesic flow and causes test
      // particles to drift outward instead of falling inward.
      const c2 = 2.998e8 * 2.998e8;
      const r_s = schwarzschildRs(M_sun);
      const r = 3 * r_s;
      const f = 1 - r_s / r;
      const dg = schwarzschildDgInverseFn(M_sun)([0, r, PI_2, 0]);
      const expected = r_s / (r * r * f * f * c2);
      expect(dg[1][0][0]).toBeCloseTo(expected, 12);
      expect(dg[1][0][0]).toBeGreaterThan(0);
    });
  });

  describe('gFn ↔ gInverseFn round-trip: g_{μν} g^{μν} = 4 (dim spacetime)', () => {
    it('contracts to 4 on the diagonal Schwarzschild metric', () => {
      const r = 5 * schwarzschildRs(M_sun);
      const x = [0, r, PI_2, 1.3];
      const g = schwarzschildGFn(M_sun)(x);
      const gInv = schwarzschildGInverseFn(M_sun)(x);

      let trace = 0;
      for (let mu = 0; mu < 4; mu++) {
        for (let nu = 0; nu < 4; nu++) {
          trace += g[mu][nu] * gInv[mu][nu];
        }
      }
      expect(trace).toBeCloseTo(4, 12);
    });
  });

  describe('schwarzschildRiemannFn (M7 pinning + antisymmetry)', () => {
    it('R^t_{rtr}(r=6M, M=M_☉) matches the analytic Schwarzschild value to ≤1e-10', () => {
      const r_s = schwarzschildRs(M_sun);
      const r = 6 * (M_sun * 6.6743e-11) / (2.998e8 * 2.998e8); // 6M (geometric)
      // Equivalent: r = 3 * r_s (since r_s = 2M)
      const r_check = 3 * r_s;
      expect(r).toBeCloseTo(r_check, 6);

      // Derived closed form (Carroll Ch. 5 / direct computation):
      //   R^t_{rtr} = r_s / (r² (r − r_s))
      // (Note: plan template wrote "2GM/r³", which is the orthonormal-frame
      //  or leading-order value; the coordinate-basis closed form is the one
      //  above. See commit message for honest deviation note.)
      const expected = r_s / (r_check * r_check * (r_check - r_s));

      const R = schwarzschildRiemannFn(M_sun)([0, r_check, PI_2, 0]);
      const actual = R[0][1][0][1]; // [ρ=t][σ=r][μ=t][ν=r]

      const relErr = Math.abs((actual - expected) / expected);
      expect(relErr).toBeLessThanOrEqual(1e-10);
    });

    it('R^θ_{φθφ}(r, θ=π/2) = (r_s/r) · sin²θ', () => {
      const r_s = schwarzschildRs(M_sun);
      const r = 3 * r_s;
      const theta = PI_2;
      const expected = (r_s / r) * Math.sin(theta) ** 2;

      const R = schwarzschildRiemannFn(M_sun)([0, r, theta, 0]);
      const actual = R[2][3][2][3]; // [ρ=θ][σ=φ][μ=θ][ν=φ]

      const relErr = Math.abs((actual - expected) / expected);
      expect(relErr).toBeLessThanOrEqual(1e-12);
    });

    it('antisymmetry: R^ρ_{σμν} = −R^ρ_{σνμ} (last two indices)', () => {
      const r_s = schwarzschildRs(M_sun);
      const R = schwarzschildRiemannFn(M_sun)([0, 3 * r_s, PI_2, 0]);
      // Probe the two non-zero components.
      expect(R[0][1][0][1]).toBeCloseTo(-R[0][1][1][0], 14);
      expect(R[2][3][2][3]).toBeCloseTo(-R[2][3][3][2], 14);
    });
  });
});
