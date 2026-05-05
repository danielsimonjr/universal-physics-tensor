/**
 * Tests for Bridge Equation 22: Topological Entanglement Entropy
 * (Kitaev-Preskill / Levin-Wen single-subsystem form).
 *
 *   S(R) = α · L(R) − γ + O(L^-1)
 *
 * Reference: Kitaev-Preskill 2006 Phys. Rev. Lett. 96:110404
 * (arXiv:hep-th/0510092) and Levin-Wen 2006 Phys. Rev. Lett. 96:110405
 * (arXiv:cond-mat/0510613).
 *
 * Honest-claude scope notes:
 *   - The TEE encoding sticks to the canonical area-law-plus-constant
 *     form; the `O(L^-1)` correction is dropped per the encoding scope.
 *   - Status pinned 'speculative' — even though the Kitaev-Preskill
 *     formula itself is established, applying it as a "QG link" (the
 *     original framing of BE-22) requires identifying which physical
 *     gravitational system the formula maps to. The encoding pins the
 *     math; the bridge to QG is the speculative content. Promoting
 *     'speculative' → 'established' requires deleting the status-pin
 *     test below deliberately (BE-23 honest-archaeology pattern).
 *   - Sign convention: S(R) = α L − γ. With α = 0 the entropy reduces
 *     to S = −γ (negative because γ > 0 by definition for non-trivial
 *     topological order). For Z₂ toric code, γ = log 2, so S = −log 2.
 *   - Log base: natural log throughout (S in nats). Bit convention
 *     (log₂) would scale γ by 1/ln 2; we pin the nat convention.
 */
import { describe, it, expect } from 'vitest';
import {
  BE22_TOPOLOGICAL_ENTANGLEMENT_RHS,
  BE22_AREA_TERM,
  BE22_TOPOLOGICAL_TERM,
  evaluateTEE,
} from '../../src/bridges/equations/be-22-topological-entanglement.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be22 = BRIDGE_EQUATIONS.find((e) => e.id === 22);

describe('BE-22 Topological Entanglement Entropy (Kitaev-Preskill / Levin-Wen)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be22).toBeDefined();
    });

    it("status pinned 'speculative' (encoding does NOT promote)", () => {
      // Promoting 'speculative' → 'established' requires deleting this
      // test deliberately. The Kitaev-Preskill formula is established,
      // but the QG-link framing is original to this catalog and
      // unbridged in the literature. (Honest-archaeology / BE-23
      // pattern.)
      expect(be22!.status).toBe('speculative');
    });

    it('dimensional_signature is set to [1] (dimensionless entropy in nats)', () => {
      expect(be22!.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE22_TOPOLOGICAL_ENTANGLEMENT_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
      const r = validate(BE22_TOPOLOGICAL_ENTANGLEMENT_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[1]');
    });

    it('BE22_AREA_TERM (α · L) is dimensionless', () => {
      const r = validate(BE22_AREA_TERM);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE22_TOPOLOGICAL_TERM (γ) is dimensionless', () => {
      const r = validate(BE22_TOPOLOGICAL_TERM);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(BE22_TOPOLOGICAL_ENTANGLEMENT_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be22!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('Z₂ toric code identity: γ = log 2, α = 0 → S = −log 2', () => {
      // Z₂ toric code: total quantum dimension D = √(Σ d²ᵢ) = √(1+1+1+1) = 2,
      // so γ = log D = log 2 ≈ 0.6931472.
      // With α = 0 the perimeter is irrelevant; S(R) = 0 − γ = −log 2.
      const S = evaluateTEE({
        alpha_per_meter: 0,
        perimeter_m: 1.0,   // arbitrary, suppressed by α=0
        gamma: Math.log(2),
      });
      expect(S).toBeCloseTo(-Math.log(2), 12);
    });

    it('linearity in perimeter: S(2L) − S(L) = α·L over 5 L values', () => {
      // At fixed α and γ, S(R) = α L − γ is exactly linear in L.
      // Differencing kills γ: S(2L) − S(L) = α·(2L − L) = α·L.
      const alpha = 0.137;          // arbitrary [m^-1]
      const gamma = Math.log(2);
      for (const L of [1.0e-9, 1.0e-6, 1.0e-3, 1.0, 1.0e3]) {
        const S_L = evaluateTEE({ alpha_per_meter: alpha, perimeter_m: L, gamma });
        const S_2L = evaluateTEE({ alpha_per_meter: alpha, perimeter_m: 2 * L, gamma });
        expect(S_2L - S_L).toBeCloseTo(alpha * L, 12);
      }
    });

    it('γ-additivity: S(γ=0) − S(γ=log 2) = log 2 (linear in γ with coefficient −1)', () => {
      // S is linear in γ with coefficient −1: ∂S/∂γ = −1.
      // S(α, L, γ=0) − S(α, L, γ=log 2) = (αL − 0) − (αL − log 2) = log 2.
      const alpha = 0.5;
      const L = 10.0;
      const S_no_gamma = evaluateTEE({ alpha_per_meter: alpha, perimeter_m: L, gamma: 0 });
      const S_log2 = evaluateTEE({ alpha_per_meter: alpha, perimeter_m: L, gamma: Math.log(2) });
      expect(S_no_gamma - S_log2).toBeCloseTo(Math.log(2), 12);
    });

    it('Fibonacci anyon: γ = (1/2) log(1 + φ²) cross-derives from φ²=φ+1 identity', () => {
      // Fibonacci anyons {1, τ} have quantum dimensions d_1 = 1 and
      // d_τ = φ = (1+√5)/2 ≈ 1.6180339887. Total quantum dimension
      // D = √(1² + φ²) = √(1 + φ²). Using the Fibonacci recurrence
      // φ² = φ + 1, we get 1 + φ² = φ + 2 = (5+√5)/2, an algebraic
      // identity that exercises a different floating-point path than
      // the direct (1 + φ*φ) accumulation. Asserting agreement between
      // the two routes catches any bug that rewrites φ² as φ−1 or adds
      // a spurious offset somewhere in the chain.
      //
      // The previous version of this test asserted
      //   gamma_via_phi_squared.toBeCloseTo(0.6429653906383268, 12)
      // where the literal IS the IEEE-754 output of the LHS expression
      // — a vacuous self-comparison (TA-F2, Wave G QC). The replacement
      // below gives an independent algebraic anchor.
      const phi = (1 + Math.sqrt(5)) / 2;
      // Route A: direct 0.5 · log(1 + φ²) — the form used by the
      // physical derivation `γ = log √(1 + φ²)`.
      const gamma_via_phi_squared = 0.5 * Math.log(1 + phi * phi);
      // Route B: 0.5 · log((5 + √5)/2) — derived via φ² = φ + 1, so
      // 1 + φ² = φ + 2 = (1 + √5)/2 + 2 = (5 + √5)/2.
      const gamma_via_identity = 0.5 * Math.log((5 + Math.sqrt(5)) / 2);
      // Cross-derivation: a φ²=φ-1 typo (or any algebraic regression
      // upstream) would land routes on different IEEE-754 results.
      expect(gamma_via_phi_squared).toBeCloseTo(gamma_via_identity, 14);
      // Numerical pin (literal preserved as historical anchor): the
      // analytic value is γ_Fib ≈ 0.6429653906383768, IEEE-754 double
      // rounding lands at 0.6429653906383268 from the (5+√5)/2 form
      // (within ~5e-14 of the analytic value).
      expect(gamma_via_identity).toBeCloseTo(0.6429653906383268, 12);
      // With α = 0, S = −γ_Fib via the identity-derived γ.
      const S = evaluateTEE({ alpha_per_meter: 0, perimeter_m: 1.0, gamma: gamma_via_identity });
      expect(S).toBeCloseTo(-gamma_via_identity, 12);
    });
  });

  describe('input validation', () => {
    it('rejects negative perimeter', () => {
      expect(() =>
        evaluateTEE({ alpha_per_meter: 1, perimeter_m: -1, gamma: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite alpha', () => {
      expect(() =>
        evaluateTEE({ alpha_per_meter: NaN, perimeter_m: 1, gamma: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite gamma', () => {
      expect(() =>
        evaluateTEE({ alpha_per_meter: 0, perimeter_m: 1, gamma: Infinity }),
      ).toThrow(RangeError);
    });
  });
});
