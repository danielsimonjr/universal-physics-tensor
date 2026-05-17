/**
 * Tier-5 AST encoding test for BE-40 — Composite Higgs Potential
 * (canonical SO(5)/SO(4) Kaplan-Georgi 1984 / Giudice-Grojean-Pomarol-
 * Rattazzi 2007 SILH form, post Wave J Tier C5 dimensional fix).
 *
 * Formula:
 *   V(h) = -α f⁴ sin²(h/f) + β f⁴ [sin⁴(h/f) - sin²(h/f) cos²(h/f)]
 *
 * V has dim [energy⁴] ≡ [L^8 M^4 T^-8] (natural-unit Lagrangian-density
 * convention, mirrors BE-18). f and h are both [energy]; α, β are
 * dimensionless Wilson coefficients.
 *
 * The AST has no transcendental primitives, so sin/cos terms are
 * encoded as dimensionless symbol stubs. The argument h/f is exposed
 * as `BE40_HIGGS_DIMLESS_ARG` and verified dimensionless.
 *
 * Status pin: 'established' (canonical SO(5)/SO(4) coset structure
 * after Wave J Tier C5 f² → f⁴ dimensional fix).
 *
 * @see src/bridges/equations/be-40-composite-higgs.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 40")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 40)
 */

import { describe, it, expect } from 'vitest';
import {
  BE40_COMPOSITE_HIGGS_RHS,
  BE40_COMPOSITE_HIGGS_LHS,
  BE40_HIGGS_DIMLESS_ARG,
  evaluateCompositeHiggs,
  validateBE40Dimensions,
} from '../../src/bridges/equations/be-40-composite-higgs.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  ENERGY,
} from '../../src/dimensional/types.js';
import { power } from '../../src/dimensional/algebra.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

// V(h) has dim [energy⁴] ≡ [L^8 M^4 T^-8] (mirrors BE-18).
const ENERGY4: Dimension = power(ENERGY, 4);

describe('BE-40 Composite Higgs potential — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(40);
    });

    it('dimensional_signature is [L^8 M^4 T^-8] (energy^4; matches BE-18)', () => {
      const be40 = expectBridgeInIndex(40);
      expect(be40.dimensional_signature).toBe('[L^8 M^4 T^-8]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE40_COMPOSITE_HIGGS_RHS, '[L^8 M^4 T^-8]');
    });

    it("status pinned 'established' (canonical SO(5)/SO(4) coset)", () => {
      expectBridgeInIndex(40, 'established');
    });

    it("tractability_class is 'closed-form'", () => {
      const be40 = expectBridgeInIndex(40);
      expect(be40.tractability_class).toBe('closed-form');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS has dim [energy^4]', () => {
      const r = validate(BE40_COMPOSITE_HIGGS_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENERGY4);
    });

    it('RHS has dim [energy^4]', () => {
      const r = validate(BE40_COMPOSITE_HIGGS_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENERGY4);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE40_COMPOSITE_HIGGS_LHS, BE40_COMPOSITE_HIGGS_RHS);
      expect(eq.ok).toBe(true);
    });

    it('argument h/f is dimensionless (lemma)', () => {
      // Per the dimensionless-stub convention: when an opaque function
      // (here sin and cos) appears, expose its argument and verify the
      // argument is dimensionless. h and f both have dim [energy] so
      // h/f is [1].
      const r = validate(BE40_HIGGS_DIMLESS_ARG);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('validateBE40Dimensions reports both sides as [energy^4]', () => {
      const r = validateBE40Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(ENERGY4);
      expect(r.rhsDim).toEqual(ENERGY4);
    });
  });

  describe('Numerical evaluator — bracket checks (natural units)', () => {
    // Composite Higgs is most natural in natural units (f, h dimensionless
    // in TeV-scale). The numerical evaluator takes f and h dimensionless
    // (natural units) and returns V in those same natural units.

    it('V(h = 0) = 0: sin(0) = 0 kills both terms', () => {
      const V = evaluateCompositeHiggs({ h: 0, f: 1, alpha: 1, beta: 1 });
      expect(V).toBe(0);
    });

    it('V(h = π·f, α=1, β=0) = 0: sin(π) = 0', () => {
      // h/f = π → sin² = 0 → α-term = 0; β = 0 → β-term = 0.
      const V = evaluateCompositeHiggs({ h: Math.PI, f: 1, alpha: 1, beta: 0 });
      expect(V).toBeCloseTo(0, 14);
    });

    it('alpha-only minimum at sin² = 1: V = -α f⁴', () => {
      // h/f = π/2 → sin² = 1, cos² = 0 → β-term = β · f⁴ · (1 - 0) = β f⁴
      // V = -α f⁴ + β f⁴
      const f = 1;
      const alpha = 1;
      const beta = 0;
      const h = (Math.PI / 2) * f;
      const V = evaluateCompositeHiggs({ h, f, alpha, beta });
      const expected = -alpha * Math.pow(f, 4);
      expect(V).toBeCloseTo(expected, 14);
    });

    it('α=β=1 minimum identity at sin² = (α+β)/(4β): V_min = -f⁴ (α+β)²/(8β)', () => {
      // For α=β=1: sin²(h/f) = 2/4 = 1/2 → V_min = -1·(2)²/(8·1) = -0.5 in f⁴
      // This is the textbook minimum of the SILH Higgs potential.
      const f = 1;
      const alpha = 1;
      const beta = 1;
      const sin_sq = (alpha + beta) / (4 * beta); // = 0.5
      const h_min = Math.asin(Math.sqrt(sin_sq)) * f; // h/f = π/4
      const V_min = evaluateCompositeHiggs({ h: h_min, f, alpha, beta });
      const expected = -Math.pow(f, 4) * Math.pow(alpha + beta, 2) / (8 * beta);
      expect(V_min).toBeCloseTo(expected, 14);
      // Also a sanity bracket: V_min should equal -0.5 for α = β = 1.
      expect(V_min).toBeCloseTo(-0.5, 14);
    });

    it('hand-computed: V(h, f, α, β) at arbitrary point', () => {
      const h = 0.3;
      const f = 1.0;
      const alpha = 0.7;
      const beta = 1.3;
      const sin = Math.sin(h / f);
      const cos = Math.cos(h / f);
      const sin_sq = sin * sin;
      const cos_sq = cos * cos;
      const sin_4 = sin_sq * sin_sq;
      const f4 = Math.pow(f, 4);
      const expected = -alpha * f4 * sin_sq + beta * f4 * (sin_4 - sin_sq * cos_sq);
      const got = evaluateCompositeHiggs({ h, f, alpha, beta });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('f⁴ scaling: V(h, 2f, α, β) at scaled h gives 16·V(h/2, f, α, β)', () => {
      // V is f⁴-homogeneous when h/f is held fixed. So scaling f → 2f
      // and h → 2h (keeping h/f fixed) scales V by 2⁴ = 16.
      const args = { alpha: 1, beta: 1, f: 1 };
      const ratio = 0.5; // h/f
      const V1 = evaluateCompositeHiggs({ ...args, h: ratio * args.f });
      const V2 = evaluateCompositeHiggs({ alpha: 1, beta: 1, f: 2, h: ratio * 2 });
      expect(V2 / V1).toBeCloseTo(16, 12);
    });

    it('TeV-scale sanity: f = 1 (TeV unit), α = β = 1, V_min = -0.5 (TeV⁴)', () => {
      // Composite-Higgs natural scale is f ~ 1 TeV. With α = β = 1, the
      // minimum sits at -0.5 in f⁴ units. That's -0.5 TeV⁴.
      const f = 1;
      const h_min = (Math.PI / 4) * f;
      const V = evaluateCompositeHiggs({ h: h_min, f, alpha: 1, beta: 1 });
      expect(V).toBeCloseTo(-0.5, 14);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite f', () => {
      expect(() =>
        evaluateCompositeHiggs({ h: 0.5, f: NaN, alpha: 1, beta: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive f', () => {
      expect(() =>
        evaluateCompositeHiggs({ h: 0.5, f: 0, alpha: 1, beta: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateCompositeHiggs({ h: 0.5, f: -1, alpha: 1, beta: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite h', () => {
      expect(() =>
        evaluateCompositeHiggs({ h: Infinity, f: 1, alpha: 1, beta: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite α or β', () => {
      expect(() =>
        evaluateCompositeHiggs({ h: 0.5, f: 1, alpha: NaN, beta: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateCompositeHiggs({ h: 0.5, f: 1, alpha: 1, beta: NaN }),
      ).toThrow(RangeError);
    });
  });
});
