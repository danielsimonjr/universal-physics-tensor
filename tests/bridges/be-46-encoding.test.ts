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
import { format } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-46 Multiverse Measure Problem (Weinberg-Vilenkin reduction) — Tier 5 AST encoding', () => {
  describe('index entry invariants', () => {
    const be46 = BRIDGE_EQUATIONS.find((e) => e.id === 46);

    it('exists in the index', () => {
      expect(be46).toBeDefined();
    });

    it("status pinned 'highly-speculative' (encoding does NOT promote)", () => {
      // The measure problem is unsolved; Weinberg-Vilenkin is one
      // proposal among several (proper-time cutoff, scale-factor
      // cutoff, causal-patch, Hartle-Hawking no-boundary all give
      // different P(Λ) shapes). Promoting 'highly-speculative' →
      // 'speculative' or 'established' requires deleting this test
      // deliberately.
      expect(be46!.status).toBe('highly-speculative');
    });

    it("dimensional_signature is set to '[1]' (P is a probability)", () => {
      expect(be46!.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE46_ANTHROPIC_PROBABILITY_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
      const r = validate(BE46_ANTHROPIC_PROBABILITY_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[1]');
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
      const inferred = validate(BE46_ANTHROPIC_PROBABILITY_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      const be46 = BRIDGE_EQUATIONS.find((e) => e.id === 46);
      expect(be46!.dimensional_signature).toBe(format(inferred!));
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
