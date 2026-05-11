/**
 * Tests for Bridge Equation 44: Soft Hair on Black Holes — squared-norm
 * scalar reduction.
 *
 *   Q_soft² = ∫_{𝒤^±} (∂_u C_{zz̄})² dμ
 *
 * Reference: Hawking-Perry-Strominger 2016 (arXiv:1601.00921); Strominger
 * 2018 lecture notes §2.10 (news-squared L²-norm).
 *
 * Status: 'speculative'.
 *
 * Honest-claude scope notes:
 *   - The original BE-44 formula `Q_soft^± = ∫ ∂_u C_{zz̄} Y^z dz∧dz̄`
 *     is operator-valued and cannot be encoded in the AST. The encoded
 *     form is the SQUARED-NORM L² reduction, integrating only over the
 *     u-direction. The celestial-2-sphere geometry (z, z̄) and BMS
 *     parameter Y^z are NOT in the AST.
 *   - The numerical evaluator is trapezoidal (O(du²)), not exact.
 *
 * Wave Z-C 2026-05-07.
 */
import { describe, it, expect } from 'vitest';
import {
  BE44_NEWS_TENSOR,
  BE44_NEWS_SQUARED,
  BE44_SOFT_HAIR_INTEGRAL_RHS,
  BE44_SOFT_HAIR_CHARGE_SQUARED_LHS,
  SOFT_HAIR_SQUARED,
  evaluateBE44SoftHairCharge,
  validateBE44Dimensions,
} from '../../src/bridges/equations/be-44-soft-hair.js';
import { validate } from '../../src/dimensional/validator.js';
import { format, equals } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be44 = BRIDGE_EQUATIONS.find((e) => e.id === 44);

describe('BE-44 Soft Hair on Black Holes (squared-norm reduction)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be44).toBeDefined();
    });

    it("status pinned 'speculative' (BMS charge framing is conjectural; squared-norm reduction is canonical)", () => {
      // Status stays 'speculative' — the AST encoding does not promote.
      // The BMS soft-hair-as-UPT-bridge framing is the speculative element.
      expect(be44!.status).toBe('speculative');
    });

    it('dimensional_signature is set to [L^2 T^-1]', () => {
      // Q_soft² = ∫(∂_u C)² du with dim [L T^-1]² · [T] = [L² T^-1].
      expect(be44!.dimensional_signature).toBe('[L^2 T^-1]');
    });
  });

  describe('dimensional validation', () => {
    it('RHS AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE44_SOFT_HAIR_INTEGRAL_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('LHS AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE44_SOFT_HAIR_CHARGE_SQUARED_LHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('news tensor ∂_u C has dim [velocity] (= [L T^-1])', () => {
      // format() emits the named alias '[velocity]' for the dim
      // {L:1, T:-1} per src/dimensional/types.ts named-dim table.
      const r = validate(BE44_NEWS_TENSOR);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[velocity]');
    });

    it('squared news (∂_u C)² has dim [L^2 T^-2]', () => {
      const r = validate(BE44_NEWS_SQUARED);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[L^2 T^-2]');
    });

    it('RHS integral infers SI dimension [L^2 T^-1]', () => {
      const r = validate(BE44_SOFT_HAIR_INTEGRAL_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[L^2 T^-1]');
    });

    it('SOFT_HAIR_SQUARED export equals the inferred RHS dimension', () => {
      const r = validate(BE44_SOFT_HAIR_INTEGRAL_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(equals(r.inferredDimension!, SOFT_HAIR_SQUARED)).toBe(true);
    });

    it('validateBE44Dimensions reports both sides match', () => {
      const v = validateBE44Dimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[L^2 T^-1]');
      expect(format(v.rhsDim!)).toBe('[L^2 T^-1]');
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(BE44_SOFT_HAIR_INTEGRAL_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be44!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation (trapezoidal quadrature)', () => {
    it('constant news = 1 on grid u ∈ [0, 1] with du = 0.5 → Q² = 1.0', () => {
      // Trapezoid: du · [f₀²/2 + f₁²/2 + … endpoints halved]
      // Samples [1, 1, 1] at u=0,0.5,1.0 → du=0.5
      // ∫1² du from 0 to 1 = 1. Trapezoid gives 0.5·(0.5 + 1 + 0.5) = 1.0.
      const Q2 = evaluateBE44SoftHairCharge({
        news_samples: [1, 1, 1],
        du: 0.5,
      });
      expect(Q2).toBeCloseTo(1.0, 12);
    });

    it('constant news = 1 on two-point grid with du = 1 → Q² = 1.0', () => {
      // Two-point trapezoid: du · (f₀² + f₁²)/2 = 1 · (1 + 1)/2 = 1.0.
      const Q2 = evaluateBE44SoftHairCharge({
        news_samples: [1, 1],
        du: 1,
      });
      expect(Q2).toBeCloseTo(1.0, 12);
    });

    it('linearity in news²: scaling news by k scales Q² by k²', () => {
      const baseline = evaluateBE44SoftHairCharge({
        news_samples: [1, 2, 3, 2, 1],
        du: 0.25,
      });
      for (const k of [0.5, 2.0, 3.7, 10.0]) {
        const scaled = evaluateBE44SoftHairCharge({
          news_samples: [k, 2 * k, 3 * k, 2 * k, k],
          du: 0.25,
        });
        expect(scaled / baseline).toBeCloseTo(k * k, 10);
      }
    });

    it('linearity in du: scaling du by α scales Q² by α (for fixed samples)', () => {
      // With samples fixed, Q² is linear in du.
      const Q1 = evaluateBE44SoftHairCharge({
        news_samples: [1, 2, 1],
        du: 1.0,
      });
      const Q2 = evaluateBE44SoftHairCharge({
        news_samples: [1, 2, 1],
        du: 2.5,
      });
      expect(Q2 / Q1).toBeCloseTo(2.5, 12);
    });

    it('hand-computed pyramid news pattern: samples=[0,1,2,1,0], du=1 → Q²=?', () => {
      // f² = [0, 1, 4, 1, 0]
      // Trapezoid: du · [0/2 + 1 + 4 + 1 + 0/2] = 1 · 6 = 6.
      const Q2 = evaluateBE44SoftHairCharge({
        news_samples: [0, 1, 2, 1, 0],
        du: 1,
      });
      expect(Q2).toBe(6);
    });

    it('hand-computed non-zero endpoints: samples=[2, 0, 2], du=1 → Q²=4', () => {
      // f² = [4, 0, 4]
      // Trapezoid: 1 · [4/2 + 0 + 4/2] = 1 · 4 = 4.
      const Q2 = evaluateBE44SoftHairCharge({
        news_samples: [2, 0, 2],
        du: 1,
      });
      expect(Q2).toBe(4);
    });

    it('vanishing news (all zeros) → Q² = 0', () => {
      const Q2 = evaluateBE44SoftHairCharge({
        news_samples: [0, 0, 0, 0, 0],
        du: 0.1,
      });
      expect(Q2).toBe(0);
    });

    it('Q² is sign-invariant: negating news leaves Q² unchanged (squared norm)', () => {
      const pos = evaluateBE44SoftHairCharge({
        news_samples: [1, 2, 3, 4],
        du: 0.5,
      });
      const neg = evaluateBE44SoftHairCharge({
        news_samples: [-1, -2, -3, -4],
        du: 0.5,
      });
      expect(neg).toBeCloseTo(pos, 12);
    });

    it('Q² is non-negative for any real news samples', () => {
      // Property test: integrand (∂_u C)² ≥ 0 pointwise, so Q² ≥ 0.
      for (const samples of [
        [0.1, -0.2, 0.3],
        [-5, 5, -5, 5],
        [1e-9, 1e-9, 1e-9],
        [1e3, -2e3, 1e3],
      ]) {
        const Q2 = evaluateBE44SoftHairCharge({
          news_samples: samples,
          du: 0.7,
        });
        expect(Q2).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('input validation', () => {
    it('rejects non-array news_samples', () => {
      expect(() =>
        evaluateBE44SoftHairCharge({
          news_samples: null as unknown as number[],
          du: 1,
        }),
      ).toThrow(RangeError);
    });

    it('rejects empty news_samples', () => {
      expect(() =>
        evaluateBE44SoftHairCharge({ news_samples: [], du: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects single-sample news_samples (trapezoid needs two points)', () => {
      expect(() =>
        evaluateBE44SoftHairCharge({ news_samples: [1], du: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive du', () => {
      expect(() =>
        evaluateBE44SoftHairCharge({ news_samples: [1, 1], du: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateBE44SoftHairCharge({ news_samples: [1, 1], du: -1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite du', () => {
      expect(() =>
        evaluateBE44SoftHairCharge({ news_samples: [1, 1], du: NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateBE44SoftHairCharge({ news_samples: [1, 1], du: Infinity }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite sample values', () => {
      expect(() =>
        evaluateBE44SoftHairCharge({
          news_samples: [1, NaN, 1],
          du: 0.5,
        }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateBE44SoftHairCharge({
          news_samples: [1, Infinity, 1],
          du: 0.5,
        }),
      ).toThrow(RangeError);
    });
  });
});
