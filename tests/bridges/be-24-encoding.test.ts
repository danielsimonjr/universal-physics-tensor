/**
 * Tier-5 AST encoding test for BE-24 — Förster FRET transfer efficiency
 * (canonical Förster 1948 / Lakowicz form, post Wave P-C R-C2
 * reformulation).
 *
 * Formula: η = R_0⁶/(R_0⁶ + R⁶) = 1/(1 + (R/R_0)⁶)  ∈ [0,1]
 *
 * BE-24 has TWO formulas in the index:
 *   - rate     k_FRET = (1/τ_D)·(R_0/R)⁶   (dim [T^-1])
 *   - efficiency η = R_0⁶/(R_0⁶ + R⁶)      (dim [1])
 * We encode the EFFICIENCY η since it's bound-respecting (η ∈ [0,1])
 * and is the natural FRET observable in donor-acceptor distance
 * measurements.
 *
 * Status pin: 'speculative' (Förster formulas canonical;
 * UPT quantum-biology bridge framing speculative).
 *
 * @see src/bridges/equations/be-24-foerster-fret.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 24")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 24)
 */

import { describe, it, expect } from 'vitest';
import {
  BE24_FRET_EFFICIENCY_RHS,
  BE24_FRET_EFFICIENCY_LHS,
  evaluateFRETEfficiency,
  validateBE24Dimensions,
} from '../../src/bridges/equations/be-24-foerster-fret.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-24 Förster FRET efficiency — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(24);
    });

    it('dimensional_signature is [1] (round-trips through validator)', () => {
      const be24 = expectBridgeInIndex(24);
      expect(be24.dimensional_signature).toBe('[1]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE24_FRET_EFFICIENCY_RHS, '[1]');
    });

    it("status pinned 'speculative' (canonical formula, bridge framing speculative)", () => {
      expectBridgeInIndex(24, 'speculative');
    });

    it("tractability_class is 'closed-form'", () => {
      const be24 = expectBridgeInIndex(24);
      expect(be24.tractability_class).toBe('closed-form');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is dimensionless', () => {
      const r = validate(BE24_FRET_EFFICIENCY_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('RHS is dimensionless', () => {
      const r = validate(BE24_FRET_EFFICIENCY_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(
        BE24_FRET_EFFICIENCY_LHS,
        BE24_FRET_EFFICIENCY_RHS,
      );
      expect(eq.ok).toBe(true);
    });

    it('validateBE24Dimensions reports both sides as dimensionless', () => {
      const r = validateBE24Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    it('Förster radius definition: η(R = R_0) = 1/2', () => {
      // The Förster radius R_0 is *defined* as the donor-acceptor distance
      // at which η = 1/2.
      const eta = evaluateFRETEfficiency({ R: 5e-9, R_0: 5e-9 });
      expect(eta).toBeCloseTo(0.5, 14);
    });

    it('close-range limit: R << R_0 → η → 1', () => {
      const eta = evaluateFRETEfficiency({ R: 1e-10, R_0: 5e-9 });
      // (R/R_0)^6 = (0.02)^6 = 6.4e-11 — η ≈ 1
      expect(eta).toBeGreaterThan(0.999999999);
      expect(eta).toBeLessThanOrEqual(1);
    });

    it('long-range limit: R >> R_0 → η → 0 (sextic falloff)', () => {
      const eta = evaluateFRETEfficiency({ R: 5e-7, R_0: 5e-9 });
      // (R/R_0)^6 = 100^6 = 1e12 — η ≈ 1e-12
      expect(eta).toBeLessThan(1e-11);
      expect(eta).toBeGreaterThanOrEqual(0);
    });

    it('R = 2·R_0 gives η = 1/65 ≈ 0.01538', () => {
      // (R/R_0)^6 = 2^6 = 64; η = 1/(1+64) = 1/65
      const eta = evaluateFRETEfficiency({ R: 1e-8, R_0: 5e-9 });
      expect(eta).toBeCloseTo(1 / 65, 14);
    });

    it('R = R_0/2 gives η = 64/65 ≈ 0.9846', () => {
      // (R/R_0)^6 = (1/2)^6 = 1/64; η = 1/(1+1/64) = 64/65
      const eta = evaluateFRETEfficiency({ R: 2.5e-9, R_0: 5e-9 });
      expect(eta).toBeCloseTo(64 / 65, 14);
    });

    it('bound-respecting: η ∈ [0,1] for all positive R, R_0', () => {
      // Sweep across many regimes; η must always be in [0,1].
      const points = [
        { R: 1e-12, R_0: 5e-9 },
        { R: 1e-9, R_0: 5e-9 },
        { R: 5e-9, R_0: 5e-9 },
        { R: 1e-8, R_0: 5e-9 },
        { R: 1e-6, R_0: 5e-9 },
        { R: 1, R_0: 1 },
        { R: 1e6, R_0: 1 },
      ];
      for (const p of points) {
        const eta = evaluateFRETEfficiency(p);
        expect(eta).toBeGreaterThanOrEqual(0);
        expect(eta).toBeLessThanOrEqual(1);
      }
    });

    it('monotone-decreasing in R at fixed R_0', () => {
      const R_0 = 5e-9;
      const Rs = [1e-9, 2e-9, 5e-9, 1e-8, 5e-8, 1e-7];
      const etas = Rs.map((R) => evaluateFRETEfficiency({ R, R_0 }));
      for (let i = 1; i < etas.length; i++) {
        expect(etas[i]).toBeLessThan(etas[i - 1]);
      }
    });

    it('scale invariance: η depends only on the ratio R/R_0', () => {
      // η = 1/(1 + (R/R_0)^6) — only the ratio matters.
      const eta1 = evaluateFRETEfficiency({ R: 5e-9, R_0: 1e-8 });
      const eta2 = evaluateFRETEfficiency({ R: 5e-3, R_0: 1e-2 });  // same ratio, different absolute scale
      expect(eta1).toBeCloseTo(eta2, 14);
    });

    it('hand-computed: η(R, R_0) = 1/(1 + (R/R_0)^6) at arbitrary point', () => {
      const R = 7.5e-9;
      const R_0 = 5e-9;
      const expected = 1 / (1 + Math.pow(R / R_0, 6));
      const got = evaluateFRETEfficiency({ R, R_0 });
      expect(got).toBeCloseTo(expected, 14);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite R', () => {
      expect(() =>
        evaluateFRETEfficiency({ R: NaN, R_0: 5e-9 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateFRETEfficiency({ R: Infinity, R_0: 5e-9 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive R', () => {
      expect(() =>
        evaluateFRETEfficiency({ R: 0, R_0: 5e-9 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateFRETEfficiency({ R: -1e-9, R_0: 5e-9 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite R_0', () => {
      expect(() =>
        evaluateFRETEfficiency({ R: 5e-9, R_0: NaN }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive R_0', () => {
      expect(() =>
        evaluateFRETEfficiency({ R: 5e-9, R_0: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateFRETEfficiency({ R: 5e-9, R_0: -1e-9 }),
      ).toThrow(RangeError);
    });
  });
});
