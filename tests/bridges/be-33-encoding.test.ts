/**
 * Tier-5 AST encoding test for BE-33 — Hertz-Millis correlation length
 * (canonical scaling, post Wave P-A R-A2 reformulation).
 *
 * Formula: ξ(T) = ξ_0 · (T/T_0)^(-ν/z), with z = 1 and ν ≈ 0.71 for the
 * 3D Heisenberg universality class → exponent -0.71.
 *
 * The AST `^` op requires a literal-numeric exponent; we pin to the
 * 3D Heisenberg case and document that other classes (3D Ising z=1
 * ν≈0.63; 3D XY z=1 ν≈0.67; fermionic Hertz-Millis-Moriya z=2-3) are
 * scheme-dependent and require separate BE entries. Same pattern as
 * BE-34 Kibble-Zurek's d=ν=z=1 commitment.
 *
 * Status pin: 'speculative' (canonical Hertz-Millis scaling, but the
 * 3D Heisenberg universality-class commitment remains a framework
 * choice).
 *
 * @see src/bridges/equations/be-33-hertz-millis.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 33")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 33)
 */

import { describe, it, expect } from 'vitest';
import {
  BE33_HERTZ_MILLIS_RHS,
  BE33_HERTZ_MILLIS_LHS,
  evaluateHertzMillis,
  validateBE33Dimensions,
} from '../../src/bridges/equations/be-33-hertz-millis.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { LENGTH } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-33 Hertz-Millis correlation length — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    const be33 = BRIDGE_EQUATIONS.find((e) => e.id === 33);

    it('exists', () => {
      expect(be33).toBeDefined();
    });

    it('dimensional_signature is [length] (round-trips through validator)', () => {
      expect(be33!.dimensional_signature).toBe('[length]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE33_HERTZ_MILLIS_RHS).inferredDimension;
      expect(inferredDim).toBeDefined();
      expect(format(inferredDim!)).toBe(be33!.dimensional_signature);
    });

    it("status pinned 'speculative' (universality-class framework choice)", () => {
      expect(be33!.status).toBe('speculative');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [length]', () => {
      const r = validate(BE33_HERTZ_MILLIS_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(LENGTH);
    });

    it('RHS is [length]', () => {
      const r = validate(BE33_HERTZ_MILLIS_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(LENGTH);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE33_HERTZ_MILLIS_LHS, BE33_HERTZ_MILLIS_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE33Dimensions reports both sides as [length]', () => {
      const r = validateBE33Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(LENGTH);
      expect(r.rhsDim).toEqual(LENGTH);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    it('identity at T = T_0: ξ(T_0) = ξ_0', () => {
      const xi = evaluateHertzMillis({
        xi_0_m: 1e-9,
        T_K: 5.0,
        T_0_K: 5.0,
        nu: 0.71,
        z: 1,
      });
      expect(xi).toBeCloseTo(1e-9, 14);
    });

    it('power law: ξ(α·T_0)/ξ_0 = α^(-ν/z)', () => {
      const xi_0 = 1e-9;
      const T_0 = 1.0;
      const nu = 0.71;
      const z = 1;
      for (const alpha of [0.5, 2, 4, 10, 100]) {
        const xi = evaluateHertzMillis({
          xi_0_m: xi_0,
          T_K: alpha * T_0,
          T_0_K: T_0,
          nu,
          z,
        });
        const expected = xi_0 * Math.pow(alpha, -nu / z);
        expect(xi).toBeCloseTo(expected, 14);
      }
    });

    it('decreasing in T: ξ(2 T_0) < ξ(T_0)', () => {
      const args = { xi_0_m: 1e-9, T_0_K: 1.0, nu: 0.71, z: 1 };
      const xi_T0 = evaluateHertzMillis({ ...args, T_K: 1.0 });
      const xi_2T0 = evaluateHertzMillis({ ...args, T_K: 2.0 });
      expect(xi_2T0).toBeLessThan(xi_T0);
    });

    it('QCP divergence: T → 0⁺ → ξ → ∞', () => {
      // ξ ~ T^{-0.71} — diverges as T → 0.
      const xi_low = evaluateHertzMillis({
        xi_0_m: 1e-9,
        T_K: 1e-6,
        T_0_K: 1.0,
        nu: 0.71,
        z: 1,
      });
      const xi_lower = evaluateHertzMillis({
        xi_0_m: 1e-9,
        T_K: 1e-9,
        T_0_K: 1.0,
        nu: 0.71,
        z: 1,
      });
      expect(xi_lower).toBeGreaterThan(xi_low);
    });

    it('3D Heisenberg exponent: ξ(2 T_0) / ξ_0 ≈ 2^(-0.71) ≈ 0.611', () => {
      // 3D Heisenberg universality class: z = 1, ν ≈ 0.71
      const xi = evaluateHertzMillis({
        xi_0_m: 1.0,
        T_K: 2.0,
        T_0_K: 1.0,
        nu: 0.71,
        z: 1,
      });
      expect(xi).toBeCloseTo(Math.pow(2, -0.71), 14);
      // Sanity bracket: 2^(-0.71) ≈ 0.611
      expect(xi).toBeGreaterThan(0.6);
      expect(xi).toBeLessThan(0.62);
    });

    it('hand-computed: ξ(T) = ξ_0 · (T/T_0)^(-ν/z)', () => {
      const xi_0 = 5e-10;
      const T = 7.5;
      const T_0 = 3.0;
      const nu = 0.71;
      const z = 1;
      const expected = xi_0 * Math.pow(T / T_0, -nu / z);
      const got = evaluateHertzMillis({ xi_0_m: xi_0, T_K: T, T_0_K: T_0, nu, z });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('alternative class (3D Ising z=1 ν=0.63): ξ(2 T_0)/ξ_0 ≈ 2^(-0.63) ≈ 0.647', () => {
      // The evaluator is universality-class-agnostic; only the AST
      // exponent is pinned to 3D Heisenberg.
      const xi = evaluateHertzMillis({
        xi_0_m: 1.0,
        T_K: 2.0,
        T_0_K: 1.0,
        nu: 0.63,
        z: 1,
      });
      expect(xi).toBeCloseTo(Math.pow(2, -0.63), 14);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite T', () => {
      expect(() =>
        evaluateHertzMillis({ xi_0_m: 1e-9, T_K: NaN, T_0_K: 1, nu: 0.71, z: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive T', () => {
      expect(() =>
        evaluateHertzMillis({ xi_0_m: 1e-9, T_K: 0, T_0_K: 1, nu: 0.71, z: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateHertzMillis({ xi_0_m: 1e-9, T_K: -1, T_0_K: 1, nu: 0.71, z: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive T_0', () => {
      expect(() =>
        evaluateHertzMillis({ xi_0_m: 1e-9, T_K: 1, T_0_K: 0, nu: 0.71, z: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive xi_0', () => {
      expect(() =>
        evaluateHertzMillis({ xi_0_m: 0, T_K: 1, T_0_K: 1, nu: 0.71, z: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects z = 0 (would divide by zero)', () => {
      expect(() =>
        evaluateHertzMillis({ xi_0_m: 1e-9, T_K: 1, T_0_K: 1, nu: 0.71, z: 0 }),
      ).toThrow(RangeError);
    });
  });
});
