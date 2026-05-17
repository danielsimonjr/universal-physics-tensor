/**
 * Tier-5 AST encoding test for BE-15 — Universal Emergence Equation
 * (Hohenberg-Halperin Model A, Kawasaki-Gunton coarsening scaling-law
 * reduction).
 *
 *   L(t)² = Γ · t       (equivalently L(t) = √(Γ t))
 *
 * Wave Z-D (2026-05-11): encodes the late-stage coarsening length-scale
 * of Model A as an exact algebraic relation. The full Langevin equation
 * (gradient flow + FDT-balanced δ-correlated noise + functional H[φ])
 * is OUTSIDE the encoding — it requires grammar extensions (Dirac δ,
 * functional δ-derivative, functional integration over field space).
 *
 * Status pin: 'speculative'. Model A is canonical condensed-matter
 * physics; the bridge framing — committing to Model A's coarse-graining
 * as the UPT microscale-↔-emergent bridge — remains the speculative
 * element. Pinning a Tier-5 AST does NOT promote the bridge claim.
 *
 * Honest-claude: this is the **late-stage asymptotic** coarsening law,
 * exact in the Allen-Cahn linear regime and in the scaling regime of
 * the nonlinear theory; for early-time transients and near-critical
 * behavior it is corrected by RG factors (Bray 1994 §3).
 *
 * @see src/bridges/equations/be-15-emergence.ts
 * @see docs/specification/Part-I.md ("Bridge Equation 15")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 15)
 */

import { describe, it, expect } from 'vitest';
import {
  BE15_COARSENING_LENGTH_SQUARED_RHS,
  BE15_COARSENING_LENGTH_SQUARED_LHS,
  BE15_MOBILITY,
  BE15_TIME,
  evaluateCoarseningLength,
  evaluateCoarseningLengthSquared,
  validateBE15Dimensions,
} from '../../src/bridges/equations/be-15-emergence.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { TIME, AREA } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-15 Universal Emergence Equation (Kawasaki-Gunton coarsening) — Tier 5 AST encoding (Wave Z-D)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expectBridgeInIndex(15);
    });

    it("status pinned 'speculative' (encoding does NOT promote)", () => {
      // Model A is canonical CMP; the bridge framing remains the
      // speculative element. Promoting requires deleting this test
      // deliberately.
      expectBridgeInIndex(15, 'speculative');
    });

    it("dimensional_signature is set to '[area]' (L² has dim L²)", () => {
      // format() emits the named alias '[area]' for the dim {L:2}.
      const be15 = expectBridgeInIndex(15);
      expect(be15.dimensional_signature).toBe('[area]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE15_COARSENING_LENGTH_SQUARED_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[area]' (round-trip pin)", () => {
      const r = validate(BE15_COARSENING_LENGTH_SQUARED_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[area]');
    });

    it('LHS (L_squared) has dim AREA', () => {
      const r = validate(BE15_COARSENING_LENGTH_SQUARED_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(AREA);
    });

    it('full equation L² = Γ·t validates', () => {
      const eq = validateEquation(
        BE15_COARSENING_LENGTH_SQUARED_LHS,
        BE15_COARSENING_LENGTH_SQUARED_RHS,
      );
      expect(eq.ok).toBe(true);
    });

    it('BE15_MOBILITY (Γ) has dim [L^2 T^-1]', () => {
      const r = validate(BE15_MOBILITY);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[L^2 T^-1]');
    });

    it('BE15_TIME (t) has dim TIME', () => {
      const r = validate(BE15_TIME);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(TIME);
    });

    it('validateBE15Dimensions reports both sides as AREA', () => {
      const r = validateBE15Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(AREA);
      expect(r.rhsDim).toEqual(AREA);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      expectDimRoundTrip(BE15_COARSENING_LENGTH_SQUARED_RHS, '[area]');
    });
  });

  describe('numerical evaluation', () => {
    it('Γ=1 m²/s, t=1 s → L = 1 m, L² = 1 m²', () => {
      expect(evaluateCoarseningLength({ gamma: 1, t: 1 })).toBeCloseTo(1.0, 14);
      expect(evaluateCoarseningLengthSquared({ gamma: 1, t: 1 })).toBeCloseTo(1.0, 14);
    });

    it('Γ=1 m²/s, t=100 s → L = 10 m, L² = 100 m²', () => {
      expect(evaluateCoarseningLength({ gamma: 1, t: 100 })).toBeCloseTo(10.0, 12);
      expect(evaluateCoarseningLengthSquared({ gamma: 1, t: 100 })).toBeCloseTo(100.0, 12);
    });

    it('doubling Γ at fixed t scales L by √2 (z = 2 dynamic critical exponent)', () => {
      const L1 = evaluateCoarseningLength({ gamma: 1, t: 1 });
      const L2 = evaluateCoarseningLength({ gamma: 2, t: 1 });
      expect(L2 / L1).toBeCloseTo(Math.SQRT2, 14);
    });

    it('doubling t at fixed Γ scales L by √2', () => {
      const L1 = evaluateCoarseningLength({ gamma: 1, t: 1 });
      const L2 = evaluateCoarseningLength({ gamma: 1, t: 2 });
      expect(L2 / L1).toBeCloseTo(Math.SQRT2, 14);
    });

    it('quadrupling t at fixed Γ scales L by 2', () => {
      const L1 = evaluateCoarseningLength({ gamma: 1, t: 1 });
      const L2 = evaluateCoarseningLength({ gamma: 1, t: 4 });
      expect(L2 / L1).toBeCloseTo(2.0, 14);
    });

    it('L² evaluator equals Γ·t exactly', () => {
      const cases = [
        { gamma: 1.5, t: 2.5 },
        { gamma: 0.1, t: 1000 },
        { gamma: 1e-6, t: 1e6 },
      ];
      for (const c of cases) {
        expect(evaluateCoarseningLengthSquared(c)).toBeCloseTo(c.gamma * c.t, 12);
      }
    });

    it('L evaluator equals sqrt(L² evaluator) — round-trip consistency', () => {
      const cases = [
        { gamma: 1.5, t: 2.5 },
        { gamma: 0.1, t: 1000 },
        { gamma: 1e-6, t: 1e6 },
      ];
      for (const c of cases) {
        const L = evaluateCoarseningLength(c);
        const L_squared = evaluateCoarseningLengthSquared(c);
        expect(L * L).toBeCloseTo(L_squared, 12);
      }
    });
  });

  describe('input validation', () => {
    it('rejects non-finite gamma', () => {
      expect(() => evaluateCoarseningLength({ gamma: NaN, t: 1 })).toThrow(RangeError);
      expect(() => evaluateCoarseningLength({ gamma: Infinity, t: 1 })).toThrow(RangeError);
    });

    it('rejects non-positive gamma', () => {
      expect(() => evaluateCoarseningLength({ gamma: 0, t: 1 })).toThrow(RangeError);
      expect(() => evaluateCoarseningLength({ gamma: -1, t: 1 })).toThrow(RangeError);
    });

    it('rejects non-finite t', () => {
      expect(() => evaluateCoarseningLength({ gamma: 1, t: NaN })).toThrow(RangeError);
      expect(() => evaluateCoarseningLength({ gamma: 1, t: Infinity })).toThrow(RangeError);
    });

    it('rejects non-positive t (coarsening law is late-time asymptotic; t=0 has no coarsening)', () => {
      expect(() => evaluateCoarseningLength({ gamma: 1, t: 0 })).toThrow(RangeError);
      expect(() => evaluateCoarseningLength({ gamma: 1, t: -1 })).toThrow(RangeError);
    });

    it('squared evaluator rejects the same invalid inputs', () => {
      expect(() => evaluateCoarseningLengthSquared({ gamma: NaN, t: 1 })).toThrow(RangeError);
      expect(() => evaluateCoarseningLengthSquared({ gamma: 1, t: 0 })).toThrow(RangeError);
    });
  });
});
