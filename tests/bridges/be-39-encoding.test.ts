/**
 * Tier-5 AST encoding test for BE-39 — Asymptotic Safety in Quantum
 * Gravity (functional renormalization-group β-functions).
 *
 * Form (canonical Reuter Einstein-Hilbert truncation):
 *   β_g = 2g + A·g² + B·g³ − C·g²·λ + O(g⁴)
 *   β_λ = −2λ + D·λ² − E·g·λ − F·g² + O(λ³, g³)
 *
 * Where g, λ are the dimensionless Newton coupling and cosmological
 * constant respectively, and A, B, C, D, E, F are truncation-scheme-
 * dependent coefficients (Reuter 1998 *Phys. Rev. D* 57:971;
 * Reuter-Weyer 2009 *Gen. Rel. Grav.* 41:983 for the canonical EH-
 * truncation values).
 *
 * The AST encodes β_g as the canonical RHS (β_λ has the same
 * dimensional structure — both are dimensionless functions of
 * dimensionless g and λ).
 *
 * Status pin: 'speculative'.
 *
 * @see src/bridges/equations/be-39-asymptotic-safety.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 39")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 39)
 */

import { describe, it, expect } from 'vitest';
import {
  BE39_BETA_G_RHS,
  BE39_BETA_G_LHS,
  evaluateBetaG,
  evaluateBetaLambda,
  validateBE39Dimensions,
} from '../../src/bridges/equations/be-39-asymptotic-safety.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-39 asymptotic safety β-functions — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(39);
    });

    it('dimensional_signature is [1] (β-functions of dimensionless couplings)', () => {
      const be39 = expectBridgeInIndex(39);
      expect(be39.dimensional_signature).toBe('[1]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE39_BETA_G_RHS, '[1]');
    });

    it("status pinned 'speculative'", () => {
      expectBridgeInIndex(39, 'speculative');
    });

    it("tractability_class is 'numerical-tractable'", () => {
      const be39 = expectBridgeInIndex(39);
      expect(be39.tractability_class).toBe('numerical-tractable');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS β_g is dimensionless', () => {
      const r = validate(BE39_BETA_G_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('RHS is dimensionless (polynomial in dimensionless g, λ)', () => {
      const r = validate(BE39_BETA_G_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE39_BETA_G_LHS, BE39_BETA_G_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE39Dimensions reports both sides as DIMENSIONLESS', () => {
      const r = validateBE39Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    // Reuter-Weyer 2009 EH-truncation canonical values (cf. Codello-
    // Percacci-Rahmede 2009 for sign-convention review). These are
    // scheme-dependent; the values below are one representative
    // EH-truncation set.
    const A = -11 / (3 * Math.PI);   // Reuter 1998 sign-conv.; loosely O(1)
    const B = 0;                     // higher-order, often dropped
    const C = -2 / Math.PI;          // canonical mixed-coupling
    const D = 0;                     // often zero in EH at one-loop
    const E = 1 / Math.PI;
    const F = 1 / (4 * Math.PI);

    it('Gaussian fixed point: β_g(g=0, λ=0) = 0', () => {
      const beta = evaluateBetaG({ g: 0, lambda: 0, A, B, C });
      expect(beta).toBeCloseTo(0, 14);
    });

    it('Gaussian fixed point: β_λ(g=0, λ=0) = 0', () => {
      const beta = evaluateBetaLambda({ g: 0, lambda: 0, D, E, F });
      expect(beta).toBeCloseTo(0, 14);
    });

    it('linear response near Gaussian: β_g ≈ 2g for small g, λ=0', () => {
      const small = 1e-10;
      const beta = evaluateBetaG({ g: small, lambda: 0, A, B, C });
      // β_g = 2g + A g² + B g³ ≈ 2g for g → 0 (the A g² and B g³ terms
      // are second-order; ratio β_g/(2g) → 1 as g → 0)
      expect(beta / (2 * small)).toBeCloseTo(1, 8);
    });

    it('linear response near Gaussian: β_λ ≈ -2λ for small λ, g=0', () => {
      const small = 1e-10;
      const beta = evaluateBetaLambda({ g: 0, lambda: small, D, E, F });
      // β_λ = -2λ + D λ² - E g λ - F g² ≈ -2λ for g=0, λ → 0
      expect(beta / (-2 * small)).toBeCloseTo(1, 8);
    });

    it('β_g is identically polynomial: closed-form match at g=0.1, λ=0.1', () => {
      const g = 0.1;
      const lambda = 0.1;
      const expected = 2 * g + A * g * g + B * g * g * g - C * g * g * lambda;
      const got = evaluateBetaG({ g, lambda, A, B, C });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('β_λ -F·g² term: at g=0.1, λ=0, β_λ = -F·g² (purely from the Fg² term)', () => {
      const beta = evaluateBetaLambda({ g: 0.1, lambda: 0, D, E, F });
      expect(beta).toBeCloseTo(-F * 0.01, 14);
    });

    it('β_g linearity in A: doubling A doubles the A-coefficient contribution', () => {
      // β_g = 2g + A g² + B g³ - C g² λ. Difference of β_g(2A) - β_g(A) = A·g²
      const g = 0.1;
      const lambda = 0.1;
      const beta_A = evaluateBetaG({ g, lambda, A: A, B, C });
      const beta_2A = evaluateBetaG({ g, lambda, A: 2 * A, B, C });
      expect(beta_2A - beta_A).toBeCloseTo(A * g * g, 14);
    });

    it('mixed-coupling sign: β_g has -C g² λ term so increasing λ decreases β_g (for C > 0)', () => {
      // With C = -2/π (negative), the term -C g² λ = +(2/π) g² λ,
      // so increasing λ INCREASES β_g. Verify monotonicity in the
      // sign convention as encoded.
      const g = 0.1;
      const beta_lo = evaluateBetaG({ g, lambda: 0.0, A, B, C });
      const beta_hi = evaluateBetaG({ g, lambda: 0.5, A, B, C });
      // The -C term with C negative means coefficient is +|C|, so
      // beta_hi > beta_lo. Either direction is fine — pin the actual
      // C-convention behaviour.
      const delta = beta_hi - beta_lo;
      // Should equal (-C) · g² · 0.5 = (2/π) · 0.01 · 0.5
      expect(delta).toBeCloseTo(-C * g * g * 0.5, 12);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite g', () => {
      expect(() =>
        evaluateBetaG({ g: NaN, lambda: 0, A: 1, B: 1, C: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite λ', () => {
      expect(() =>
        evaluateBetaG({ g: 0, lambda: Infinity, A: 1, B: 1, C: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite coefficients', () => {
      expect(() =>
        evaluateBetaG({ g: 0, lambda: 0, A: NaN, B: 1, C: 1 }),
      ).toThrow(RangeError);
    });
  });
});
