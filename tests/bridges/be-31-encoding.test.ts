/**
 * Tier-5 AST encoding test for BE-31 — Causal Set Continuum Limit
 * (Benincasa-Dowker discrete Ricci scalar, d=4).
 *
 *   R(p) = (4/√6) · ℓ_P^(-2) · [1 + N_0(p) - 9 N_1(p) + 16 N_2(p) - 8 N_3(p)]
 *
 * Status pin: 'speculative' (BD discrete Ricci scalar canonical for d=4
 * causal-set continuum limits; bridge framing — causal sets as UPT
 * microstructure — is the speculative content).
 *
 * @see src/bridges/equations/be-31-causal-set-bd.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 31")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 31)
 */

import { describe, it, expect } from 'vitest';
import {
  BE31_CAUSAL_SET_BD_RHS,
  BE31_CAUSAL_SET_BD_LHS,
  evaluateBenincasaDowker,
  validateBE31Dimensions,
} from '../../src/bridges/equations/be-31-causal-set-bd.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { Dimension } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const INV_LENGTH_2: Dimension = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

describe('BE-31 Causal Set Continuum Limit (Benincasa-Dowker) — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    const be31 = BRIDGE_EQUATIONS.find((e) => e.id === 31);

    it('exists', () => {
      expect(be31).toBeDefined();
    });

    it("dimensional_signature pinned to '[L^-2]'", () => {
      expect(be31!.dimensional_signature).toBe('[L^-2]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE31_CAUSAL_SET_BD_RHS).inferredDimension;
      expect(inferredDim).toBeDefined();
      expect(format(inferredDim!)).toBe(be31!.dimensional_signature);
    });

    it("status pinned 'speculative'", () => {
      expect(be31!.status).toBe('speculative');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS has dim [L^-2]', () => {
      const r = validate(BE31_CAUSAL_SET_BD_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(INV_LENGTH_2);
    });

    it('RHS has dim [L^-2]', () => {
      const r = validate(BE31_CAUSAL_SET_BD_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(INV_LENGTH_2);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE31_CAUSAL_SET_BD_LHS, BE31_CAUSAL_SET_BD_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE31Dimensions reports both sides as [L^-2]', () => {
      const r = validateBE31Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(INV_LENGTH_2);
      expect(r.rhsDim).toEqual(INV_LENGTH_2);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const PREFACTOR = 4 / Math.sqrt(6); // ≈ 1.6330
    const lP = 1.616255e-35; // canonical Planck length (m)
    const lP2_inv = 1 / (lP * lP);

    it('all-zero N_k: R(p) = (4/√6) · ℓ_P^(-2) · 1', () => {
      const R = evaluateBenincasaDowker({
        N_0: 0, N_1: 0, N_2: 0, N_3: 0, l_P_m: lP,
      });
      expect(R).toBeCloseTo(PREFACTOR * lP2_inv, -55);
      // Use loose tolerance because lP^-2 ~ 3.8e69, so 14-digit precision
      // means absolute tolerance ~1e55. expect.toBeCloseTo(value, n) means
      // |actual - expected| < 5·10^(-n-1); for very large numbers a
      // ratio-based check is cleaner:
      const ratio = R / (PREFACTOR * lP2_inv);
      expect(ratio).toBeCloseTo(1, 12);
    });

    it('R-vanishing at (N_0, N_1, N_2, N_3) = (-1, 0, 0, 0): bracket = 1 + (-1) = 0 → R = 0', () => {
      // The "1 + N_0 + ..." pattern means N_0 = -1 with all others zero
      // makes the bracket vanish.
      const R = evaluateBenincasaDowker({
        N_0: -1, N_1: 0, N_2: 0, N_3: 0, l_P_m: lP,
      });
      expect(R).toBe(0);
    });

    it('coefficient extraction at (1, 0, 0, 0): R = (4/√6)(1+1) ℓ_P^-2 = (8/√6) ℓ_P^-2', () => {
      const R = evaluateBenincasaDowker({
        N_0: 1, N_1: 0, N_2: 0, N_3: 0, l_P_m: lP,
      });
      const expected = (8 / Math.sqrt(6)) * lP2_inv;
      expect(R / expected).toBeCloseTo(1, 12);
    });

    it('coefficient extraction at (0, 1, 0, 0): R = (4/√6)(1-9) ℓ_P^-2 = -(32/√6) ℓ_P^-2', () => {
      const R = evaluateBenincasaDowker({
        N_0: 0, N_1: 1, N_2: 0, N_3: 0, l_P_m: lP,
      });
      const expected = (4 / Math.sqrt(6)) * (1 - 9) * lP2_inv;
      expect(R / expected).toBeCloseTo(1, 12);
    });

    it('coefficient extraction at (0, 0, 1, 0): R = (4/√6)(1+16) ℓ_P^-2 = (68/√6) ℓ_P^-2', () => {
      const R = evaluateBenincasaDowker({
        N_0: 0, N_1: 0, N_2: 1, N_3: 0, l_P_m: lP,
      });
      const expected = (4 / Math.sqrt(6)) * (1 + 16) * lP2_inv;
      expect(R / expected).toBeCloseTo(1, 12);
    });

    it('coefficient extraction at (0, 0, 0, 1): R = (4/√6)(1-8) ℓ_P^-2 = -(28/√6) ℓ_P^-2', () => {
      const R = evaluateBenincasaDowker({
        N_0: 0, N_1: 0, N_2: 0, N_3: 1, l_P_m: lP,
      });
      const expected = (4 / Math.sqrt(6)) * (1 - 8) * lP2_inv;
      expect(R / expected).toBeCloseTo(1, 12);
    });

    it('linearity in each N_k holding others at zero: R is linear in any single N_k', () => {
      // Holding (N_1, N_2, N_3) = 0, R(N_0) = (4/√6)(1 + N_0) ℓ_P^-2
      // is affine; differences are linear.
      const R0 = evaluateBenincasaDowker({ N_0: 0, N_1: 0, N_2: 0, N_3: 0, l_P_m: lP });
      const R1 = evaluateBenincasaDowker({ N_0: 1, N_1: 0, N_2: 0, N_3: 0, l_P_m: lP });
      const R2 = evaluateBenincasaDowker({ N_0: 2, N_1: 0, N_2: 0, N_3: 0, l_P_m: lP });
      expect((R2 - R0) / (R1 - R0)).toBeCloseTo(2, 12);
    });

    it('hand-computed (N_0, N_1, N_2, N_3) = (1, 1, 1, 1): R = (4/√6)(1+1-9+16-8) ℓ_P^-2 = (4/√6)·1·ℓ_P^-2', () => {
      const R = evaluateBenincasaDowker({
        N_0: 1, N_1: 1, N_2: 1, N_3: 1, l_P_m: lP,
      });
      const expected = (4 / Math.sqrt(6)) * (1 + 1 - 9 + 16 - 8) * lP2_inv;
      expect(R / expected).toBeCloseTo(1, 12);
      // Independent sanity: bracket = 1; so R = (4/√6) ℓ_P^-2
      expect(R / (PREFACTOR * lP2_inv)).toBeCloseTo(1, 12);
    });

    it('ℓ_P^-2 scaling: doubling ℓ_P quarters R for fixed bracket', () => {
      const R_a = evaluateBenincasaDowker({
        N_0: 1, N_1: 0, N_2: 0, N_3: 0, l_P_m: lP,
      });
      const R_b = evaluateBenincasaDowker({
        N_0: 1, N_1: 0, N_2: 0, N_3: 0, l_P_m: 2 * lP,
      });
      expect(R_b / R_a).toBeCloseTo(0.25, 12);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite N_0', () => {
      expect(() =>
        evaluateBenincasaDowker({ N_0: NaN, N_1: 0, N_2: 0, N_3: 0, l_P_m: 1.6e-35 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite N_1', () => {
      expect(() =>
        evaluateBenincasaDowker({ N_0: 0, N_1: Infinity, N_2: 0, N_3: 0, l_P_m: 1.6e-35 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive l_P', () => {
      expect(() =>
        evaluateBenincasaDowker({ N_0: 0, N_1: 0, N_2: 0, N_3: 0, l_P_m: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite l_P', () => {
      expect(() =>
        evaluateBenincasaDowker({ N_0: 0, N_1: 0, N_2: 0, N_3: 0, l_P_m: NaN }),
      ).toThrow(RangeError);
    });
  });
});
