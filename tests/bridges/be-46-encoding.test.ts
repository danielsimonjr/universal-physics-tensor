/**
 * Tier-5 AST encoding test for BE-46 — Multiverse Measure Problem
 * (Weinberg-Vilenkin anthropic-probability scalar reduction).
 *
 *   P(Λ) = A · exp(−α / Λ)
 *
 * Original BE-46 was the formally-divergent path-integral form
 * `P[O] = ∫ dμ[g, φ] W[g, φ] δ(O − O[g, φ])`. Wave Z applies OpenAI's
 * scalar reduction to the most-cited specific anthropic-probability
 * proposal (Weinberg 1987 / Vilenkin 1995), which IS encodable in the
 * UPT AST grammar.
 *
 * Status pin: 'highly-speculative'. The measure problem is unsolved;
 * Weinberg-Vilenkin is one specific proposal (the most-cited but not
 * unique). Pinning a Tier-5 AST does NOT promote the bridge framing.
 *
 * @see src/bridges/equations/be-46-multiverse-measure.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 46")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 46)
 */

import { describe, it, expect } from 'vitest';
import {
  BE46_ANTHROPIC_PROBABILITY_RHS,
  BE46_ANTHROPIC_PROBABILITY_LHS,
  BE46_EXP_ARGUMENT,
  BE46_EXP_FACTOR,
  BE46_NORMALIZATION,
  evaluateWeinbergVilenkinP,
  validateBE46Dimensions,
} from '../../src/bridges/equations/be-46-multiverse-measure.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-46 Multiverse Measure Problem (Weinberg-Vilenkin reduction) — Tier 5 AST encoding', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expectBridgeInIndex(46);
    });

    it("status pinned 'highly-speculative' (encoding does NOT promote)", () => {
      // The measure problem is unsolved; Weinberg-Vilenkin is one
      // proposal among several (proper-time cutoff, scale-factor
      // cutoff, causal-patch, Hartle-Hawking no-boundary all give
      // different P(Λ) shapes). Promoting 'highly-speculative' →
      // 'speculative' or 'established' requires deleting this test
      // deliberately.
      expectBridgeInIndex(46, 'highly-speculative');
    });

    it("dimensional_signature is set to '[1]' (P is a probability)", () => {
      const be46 = expectBridgeInIndex(46);
      expect(be46.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE46_ANTHROPIC_PROBABILITY_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
      expectDimRoundTrip(BE46_ANTHROPIC_PROBABILITY_RHS, '[1]');
    });

    it('LHS (P_Lambda) is dimensionless', () => {
      const r = validate(BE46_ANTHROPIC_PROBABILITY_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(
        BE46_ANTHROPIC_PROBABILITY_LHS,
        BE46_ANTHROPIC_PROBABILITY_RHS,
      );
      expect(eq.ok).toBe(true);
    });

    it('BE46_EXP_ARGUMENT (−α/Λ) is dimensionless (dimensionless-stub convention)', () => {
      const r = validate(BE46_EXP_ARGUMENT);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE46_EXP_FACTOR (exp_factor stub) is dimensionless', () => {
      const r = validate(BE46_EXP_FACTOR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE46_NORMALIZATION (A) is dimensionless', () => {
      const r = validate(BE46_NORMALIZATION);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('validateBE46Dimensions reports both sides as dimensionless', () => {
      const r = validateBE46Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      expectDimRoundTrip(BE46_ANTHROPIC_PROBABILITY_RHS, '[1]');
    });
  });

  describe('numerical evaluation', () => {
    it('e-folding point Λ = α: P = A · exp(−1) ≈ A · 0.3679', () => {
      // At Λ = α, the argument −α/Λ = −1, so exp(−α/Λ) = 1/e.
      const A = 1.0;
      const alpha = 2.5; // arbitrary
      const P = evaluateWeinbergVilenkinP({
        normalization: A,
        alpha,
        lambda: alpha,
      });
      expect(P).toBeCloseTo(A * Math.exp(-1), 14);
      expect(P).toBeCloseTo(0.3678794411714423, 12);
    });

    it('large-Λ limit (Λ = 1000 α): P → A (suppression vanishes)', () => {
      // For Λ ≫ α, −α/Λ → 0⁻ and exp(−α/Λ) → 1, so P → A.
      const A = 0.7;
      const alpha = 1.0;
      const lambda = 1000 * alpha;
      const P = evaluateWeinbergVilenkinP({
        normalization: A,
        alpha,
        lambda,
      });
      // exp(−1/1000) ≈ 1 − 1e-3 + … → P/A ≈ 0.999000
      expect(P).toBeCloseTo(A * Math.exp(-1 / 1000), 14);
      expect(P / A).toBeGreaterThan(0.999);
      expect(P / A).toBeLessThanOrEqual(1.0);
    });

    it('small-Λ limit (Λ = 0.1 α): P = A · exp(−10) ≈ A · 4.54e-5 (severe suppression)', () => {
      const A = 1.0;
      const alpha = 1.0;
      const lambda = 0.1 * alpha; // Λ ≪ α
      const P = evaluateWeinbergVilenkinP({
        normalization: A,
        alpha,
        lambda,
      });
      expect(P).toBeCloseTo(A * Math.exp(-10), 14);
      // exp(−10) ≈ 4.5399929762484854e-5
      expect(P).toBeCloseTo(4.5399929762484854e-5, 18);
    });

    it('linearity in normalization: doubling A doubles P at fixed (α, Λ)', () => {
      const alpha = 3.7;
      const lambda = 1.4;
      const P1 = evaluateWeinbergVilenkinP({ normalization: 1.0, alpha, lambda });
      const P2 = evaluateWeinbergVilenkinP({ normalization: 2.0, alpha, lambda });
      expect(P2 / P1).toBeCloseTo(2.0, 14);
    });

    it('hand-computed: A = 1, α = 0, Λ = 1 → P = exp(0) = 1', () => {
      // α = 0: argument is 0, exp(0) = 1, so P = A.
      const P = evaluateWeinbergVilenkinP({
        normalization: 1.0,
        alpha: 0,
        lambda: 1.0,
      });
      expect(P).toBeCloseTo(1.0, 14);
    });

    it('Weinberg 1987 Λ_obs window probability', () => {
      // Physics anchor (Task 18, v0.5.0 Phase 3f): Weinberg's
      // canonical anthropic prediction (Weinberg 1987 *Phys. Rev.
      // Lett.* 59:2607) is that the observed cosmological constant
      // Λ_obs lies within an order of magnitude of the anthropic
      // upper bound Λ_max set by galaxy formation (Λ_max ~ 100·ρ_m
      // at galaxy-formation epoch).
      //
      // In the Weinberg-Vilenkin parameterization P(Λ) = A·exp(−α/Λ),
      // identifying α with the anthropic scale and Λ with the
      // observed Λ_obs, Weinberg's prediction "Λ_obs ~ Λ_max" maps
      // to α/Λ_obs ~ 1, so the anthropic probability at the observed
      // value is
      //
      //   P(Λ_obs) ≈ A · exp(−1) ≈ 0.368 · A
      //
      // With normalization A = 1 (uniform prior on the anthropic
      // ensemble), the canonical Weinberg-window probability is
      // ~0.37 — of order 1, NOT exponentially suppressed. This is the
      // central anthropic-prediction success: the observed value falls
      // in the "natural" anthropic window, not in the
      // exponentially-suppressed tail (Λ_obs ≪ α, severe suppression)
      // or the exponentially-unsuppressed tail (Λ_obs ≫ α, P → A).
      //
      // Reference: Vilenkin 1995 *Phys. Rev. Lett.* 74:846 (canonical
      // proper-time-cutoff measure formulation); Weinberg 1987 (the
      // physical motivation). The 'highly-speculative' status pin
      // remains: the measure problem is unsolved and the exp(−α/Λ)
      // form is one proposal among several (proper-time cutoff,
      // scale-factor cutoff, causal-patch, Hartle-Hawking
      // no-boundary all give different P(Λ) shapes).
      //
      // Tolerance: ±10% around the canonical exp(−1) ≈ 0.368 value.
      // This is a hand-computed identity (P(α) = A · 1/e exactly),
      // so the loose tolerance accommodates the order-of-magnitude
      // framing of "Weinberg's prediction = observed Λ is in the
      // anthropic window of order α" rather than requiring α = Λ_obs
      // exactly.
      const A = 1.0;
      const Lambda_obs_over_alpha = 1.0; // canonical Weinberg prediction: Λ_obs ~ α
      const P_window = evaluateWeinbergVilenkinP({
        normalization: A,
        alpha: 1.0,
        lambda: 1.0 / Lambda_obs_over_alpha, // = α since ratio = 1
      });
      const canonical = Math.exp(-1);
      expect(P_window).toBeCloseTo(canonical, 12);
      // Order-of-1, not exponentially-suppressed
      expect(P_window).toBeGreaterThan(0.3);
      expect(P_window).toBeLessThan(0.5);
      // ±10% Weinberg-window band around the canonical exp(-1)
      expect(Math.abs(P_window - canonical) / canonical).toBeLessThan(0.1);
    });
  });

  describe('input validation', () => {
    it('rejects non-finite normalization', () => {
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: NaN, alpha: 1, lambda: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: Infinity, alpha: 1, lambda: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite alpha', () => {
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: 1, alpha: NaN, lambda: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: 1, alpha: Infinity, lambda: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite lambda', () => {
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: 1, alpha: 1, lambda: NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: 1, alpha: 1, lambda: Infinity }),
      ).toThrow(RangeError);
    });

    it('rejects lambda = 0 (division by zero)', () => {
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: 1, alpha: 1, lambda: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects negative lambda (the Λ → 0 limit must approach from above)', () => {
      expect(() =>
        evaluateWeinbergVilenkinP({ normalization: 1, alpha: 1, lambda: -1 }),
      ).toThrow(RangeError);
    });
  });
});
