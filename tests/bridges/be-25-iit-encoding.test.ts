/**
 * Tier-5 AST encoding test for BE-25 — Consciousness ↔ Information
 * Integration (IIT inner intrinsic-information form).
 *
 *   ii(s, s̃) = p(s̃|s) · log₂[ p(s̃|s) / p(s̃) ]
 *
 * Wave Z-B (2026-05-07): encodes the inner ii(s, s̃) kernel that the
 * full Φ_max formula minimizes over partitions. The outer MIP `min_θ`
 * is deferred as a grammar extension (same status as BE-15 and BE-28).
 *
 * Status pin: 'speculative'. IIT itself is calculable; the bridge
 * framing (consciousness ↔ maximally-integrated information) is
 * contested by Aaronson 2014 and Doerig 2019. Pinning a Tier-5 AST
 * does NOT promote the bridge claim.
 *
 * NOTE: this test file is separate from `be-25-encoding.test.ts`,
 * which exercises the *archived* legacy Penrose-Hameroff
 * `be-25-orch-or.ts` module for validator-infrastructure regression
 * only. The two test files coexist; only this one is load-bearing
 * for the IIT bridge-index claim.
 *
 * @see src/bridges/equations/be-25-iit-phi.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 25")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 25)
 */

import { describe, it, expect } from 'vitest';
import {
  BE25_INTRINSIC_INFORMATION_RHS,
  BE25_INTRINSIC_INFORMATION_LHS,
  BE25_P_CONDITIONAL,
  BE25_P_MARGINAL,
  BE25_LOG_RATIO_ARG,
  BE25_LOG2_FACTOR,
  evaluateIntrinsicInformation,
  validateBE25Dimensions,
} from '../../src/bridges/equations/be-25-iit-phi.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-25 IIT inner intrinsic information ii(s,s̃) — Tier 5 AST encoding (Wave Z-B)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expectBridgeInIndex(25);
    });

    it("status pinned 'speculative' (encoding does NOT promote)", () => {
      // IIT is calculable; the bridge framing is contested
      // (Aaronson 2014, Doerig 2019). Promoting 'speculative' →
      // 'established' requires deleting this test deliberately.
      expectBridgeInIndex(25, 'speculative');
    });

    it("dimensional_signature is set to '[1]' (ii is in bits — pseudo-unit, dimensionless in SI)", () => {
      const be25 = expectBridgeInIndex(25);
      expect(be25.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE25_INTRINSIC_INFORMATION_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
      expectDimRoundTrip(BE25_INTRINSIC_INFORMATION_RHS, '[1]');
    });

    it('LHS (ii) is dimensionless', () => {
      const r = validate(BE25_INTRINSIC_INFORMATION_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(
        BE25_INTRINSIC_INFORMATION_LHS,
        BE25_INTRINSIC_INFORMATION_RHS,
      );
      expect(eq.ok).toBe(true);
    });

    it('BE25_LOG_RATIO_ARG (p_cond / p_marg) is dimensionless (dimensionless-stub convention)', () => {
      const r = validate(BE25_LOG_RATIO_ARG);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE25_LOG2_FACTOR (log2_ratio_ii stub) is dimensionless', () => {
      const r = validate(BE25_LOG2_FACTOR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE25_P_CONDITIONAL (p_cond) is dimensionless', () => {
      const r = validate(BE25_P_CONDITIONAL);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE25_P_MARGINAL (p_marg) is dimensionless', () => {
      const r = validate(BE25_P_MARGINAL);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('validateBE25Dimensions reports both sides as dimensionless', () => {
      const r = validateBE25Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      expectDimRoundTrip(BE25_INTRINSIC_INFORMATION_RHS, '[1]');
    });
  });

  describe('numerical evaluation', () => {
    it('no irreducibility (p_cond = p_marg = 0.5): ii = 0', () => {
      // log₂(0.5/0.5) = log₂(1) = 0 → ii = 0.5 · 0 = 0.
      const ii = evaluateIntrinsicInformation({ p_cond: 0.5, p_marg: 0.5 });
      expect(ii).toBe(0);
    });

    it('"surprise" case (p_cond = 0.5, p_marg = 0.25): ii = 0.5 bits', () => {
      // log₂(0.5/0.25) = log₂(2) = 1 → ii = 0.5 · 1 = 0.5.
      const ii = evaluateIntrinsicInformation({ p_cond: 0.5, p_marg: 0.25 });
      expect(ii).toBeCloseTo(0.5, 14);
    });

    it('Shannon-zero limit (p_cond = 0): ii = 0 (regardless of p_marg)', () => {
      // The 0 · log(0/anything) = 0 limit is enforced before the
      // p_marg = 0 check, so the joint zero does not raise.
      expect(evaluateIntrinsicInformation({ p_cond: 0, p_marg: 0.5 })).toBe(0);
      expect(evaluateIntrinsicInformation({ p_cond: 0, p_marg: 0 })).toBe(0);
      expect(evaluateIntrinsicInformation({ p_cond: 0, p_marg: 1.0 })).toBe(0);
    });

    it('negative-information case (p_cond < p_marg): ii < 0', () => {
      // log₂(0.25/0.5) = log₂(0.5) = -1 → ii = 0.25 · (-1) = -0.25.
      // Conditional probability LOWER than marginal means s̃ was made
      // less likely by conditioning on s — a "negative-surprise"
      // / repulsion signal in IIT terminology.
      const ii = evaluateIntrinsicInformation({ p_cond: 0.25, p_marg: 0.5 });
      expect(ii).toBeCloseTo(-0.25, 14);
    });

    it('hand-computed: p_cond = 1, p_marg = 0.5 → ii = log₂(2) = 1 bit', () => {
      const ii = evaluateIntrinsicInformation({ p_cond: 1.0, p_marg: 0.5 });
      expect(ii).toBeCloseTo(1.0, 14);
    });

    it('hand-computed: p_cond = 0.25, p_marg = 0.25 → ii = 0', () => {
      const ii = evaluateIntrinsicInformation({ p_cond: 0.25, p_marg: 0.25 });
      expect(ii).toBe(0);
    });

    it('hand-computed: p_cond = 0.75, p_marg = 0.5 → ii = 0.75 · log₂(1.5) ≈ 0.4387', () => {
      const ii = evaluateIntrinsicInformation({ p_cond: 0.75, p_marg: 0.5 });
      expect(ii).toBeCloseTo(0.75 * Math.log2(1.5), 14);
      // log₂(1.5) = 0.5849625007211562; 0.75 · log₂(1.5) = 0.43872187554086717
      expect(ii).toBeCloseTo(0.43872187554086717, 12);
    });

    it('monotone in p_cond at fixed p_marg = 0.5: ii(p_cond) grows for p_cond ∈ [0.5, 1]', () => {
      // For p_marg = 0.5 and p_cond ∈ [0.5, 1], ii is non-negative
      // and monotonically increasing in p_cond.
      const samples = [0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
      const values = samples.map((p_cond) =>
        evaluateIntrinsicInformation({ p_cond, p_marg: 0.5 }),
      );
      for (let i = 1; i < values.length; i++) {
        expect(values[i]).toBeGreaterThan(values[i - 1]);
      }
    });
  });

  describe('input validation', () => {
    it('rejects KL-divergence singularity (p_cond > 0, p_marg = 0)', () => {
      // The system transitioned to s̃ but the marginal says s̃ has
      // zero probability — physically inconsistent joint outcome.
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: 0.5, p_marg: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: 1.0, p_marg: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite p_cond', () => {
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: NaN, p_marg: 0.5 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: Infinity, p_marg: 0.5 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite p_marg', () => {
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: 0.5, p_marg: NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: 0.5, p_marg: Infinity }),
      ).toThrow(RangeError);
    });

    it('rejects p_cond outside [0, 1]', () => {
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: -0.1, p_marg: 0.5 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: 1.1, p_marg: 0.5 }),
      ).toThrow(RangeError);
    });

    it('rejects p_marg outside [0, 1]', () => {
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: 0.5, p_marg: -0.1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateIntrinsicInformation({ p_cond: 0.5, p_marg: 1.1 }),
      ).toThrow(RangeError);
    });
  });
});
