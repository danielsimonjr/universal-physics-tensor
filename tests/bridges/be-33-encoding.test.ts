/**
 * Tier-5 AST encoding test for BE-33 — Hertz-Millis correlation length
 * (canonical scaling, post Wave P-A R-A2 reformulation).
 *
 * Formula: ξ(T) = ξ_0 · (T/T_0)^(-1/z), with z = 1 → exponent -1.
 *
 * Exponent corrected 2026-05-20 (bridge physics audit): the finite-T
 * correlation length at a quantum critical point scales as ξ ~ T^(-1/z) —
 * the dynamic exponent z alone sets the temperature dependence; ν is the
 * separate T=0 tuning-parameter exponent and does NOT enter. The AST `^`
 * op requires a literal-numeric exponent; we pin to the z = 1 case (-1).
 *
 * Status pin: 'speculative' (the universality-class label remains a
 * framework choice — see the BE-33 known_issues on the catalog index).
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
import { LENGTH } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-33 Hertz-Millis correlation length — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(33);
    });

    it('dimensional_signature is [length] (round-trips through validator)', () => {
      const be33 = expectBridgeInIndex(33);
      expect(be33.dimensional_signature).toBe('[length]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE33_HERTZ_MILLIS_RHS, '[length]');
    });

    it("status pinned 'speculative' (universality-class framework choice)", () => {
      expectBridgeInIndex(33, 'speculative');
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

    it('power law: ξ(α·T_0)/ξ_0 = α^(-1/z)', () => {
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
        const expected = xi_0 * Math.pow(alpha, -1 / z);
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
      // ξ ~ T^{-1/z} — diverges as T → 0.
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

    it('z=1 exponent: ξ(2 T_0) / ξ_0 = 2^(-1/z) = 0.5', () => {
      // Corrected 2026-05-20: ξ ~ T^(-1/z); z = 1 → exponent -1 → 2^(-1) = 0.5.
      const xi = evaluateHertzMillis({
        xi_0_m: 1.0,
        T_K: 2.0,
        T_0_K: 1.0,
        nu: 0.71,
        z: 1,
      });
      expect(xi).toBeCloseTo(0.5, 14);
    });

    it('z=2 exponent: ξ(4 T_0) / ξ_0 = 4^(-1/z) = 0.5', () => {
      // z dependence: 4^(-1/2) = 0.5.
      const xi = evaluateHertzMillis({
        xi_0_m: 1.0,
        T_K: 4.0,
        T_0_K: 1.0,
        nu: 0.5,
        z: 2,
      });
      expect(xi).toBeCloseTo(0.5, 14);
    });

    it('hand-computed: ξ(T) = ξ_0 · (T/T_0)^(-1/z)', () => {
      const xi_0 = 5e-10;
      const T = 7.5;
      const T_0 = 3.0;
      const nu = 0.71;
      const z = 1;
      const expected = xi_0 * Math.pow(T / T_0, -1 / z);
      const got = evaluateHertzMillis({ xi_0_m: xi_0, T_K: T, T_0_K: T_0, nu, z });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('result is independent of ν (corrected 2026-05-20: exponent is -1/z, not -ν/z)', () => {
      // Regression guard for the exponent correction: ν must NOT affect
      // the finite-T correlation length. ξ ~ T^(-1/z) — z only.
      const base = { xi_0_m: 1.0, T_K: 2.0, T_0_K: 1.0, z: 1 };
      const xiA = evaluateHertzMillis({ ...base, nu: 0.63 });
      const xiB = evaluateHertzMillis({ ...base, nu: 0.71 });
      const xiC = evaluateHertzMillis({ ...base, nu: 1.0 });
      expect(xiA).toBe(xiB);
      expect(xiB).toBe(xiC);
      expect(xiA).toBeCloseTo(0.5, 14); // 2^(-1/z), z = 1
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
