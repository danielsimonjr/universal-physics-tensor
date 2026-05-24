/**
 * Tier-5 AST encoding test for BE-53 — Yang-Mills one-loop β-function
 * (asymptotic freedom).
 *
 * Physics:
 *   β(g) = −b₀ g³ / (16π²) + O(g⁵)
 *   b₀ = (11/3) N_c − (2/3) N_f      [for SU(N_c) fundamental]
 *
 * Key invariants under test:
 *   - UV fixed point at g* = 0: β(0) = 0 for all b₀.
 *   - Asymptotic freedom direction: β(g) < 0 for g > 0, b₀ > 0.
 *   - QCD (SU(3), N_f = 6): b₀ = 7, β(g) = −7 g³/(16π²).
 *   - Pure SU(3) (N_f = 0): b₀ = 11.
 *   - Asymptotic-freedom boundary: b₀ = 0 at N_f = (11/2) N_c = 16.5 (SU(3)).
 *   - Single-coupling structural form validates via `validateBetaFunction`.
 *   - Structural dual of BE-39: identical AST shape, different fixed-point physics.
 *
 * References:
 *   - Gross & Wilczek 1973 *Phys. Rev. Lett.* 30:1343
 *   - Politzer 1973 *Phys. Rev. Lett.* 30:1346
 *   - Peskin & Schroeder 1995 §16
 *
 * @see src/bridges/equations/be-53-yang-mills-beta.ts
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 53)
 * @see src/dimensional/rg-flow.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE53_COUPLING_G,
  BE53_BETA_G_RHS,
  BE53_BETA_G_LHS,
  BE53_BETA_G_STRUCTURAL,
  evaluateYangMillsBeta,
  computeB0,
} from '../../src/bridges/equations/be-53-yang-mills-beta.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { validateBetaFunction } from '../../src/dimensional/rg-flow.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-53 Yang-Mills one-loop β-function — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('BE-53 exists in the catalog', () => {
      expectBridgeInIndex(53);
    });

    it("status pinned 'established' (Nobel-Prize-winning physics)", () => {
      expectBridgeInIndex(53, 'established');
    });

    it("dimensional_signature is '[1]' (β(g) = k ∂_k g is dimensionless — same as BE-39)", () => {
      const be53 = expectBridgeInIndex(53);
      expect(be53.dimensional_signature).toBe('[1]');
    });

    it('category is L (Quantum Field Theory Extensions)', () => {
      const be53 = expectBridgeInIndex(53);
      expect(be53.category).toBe('L');
      expect(be53.category_name).toBe('Quantum Field Theory Extensions');
    });

    it('bridges tuple is [quantum, classical] (UV-IR running)', () => {
      const be53 = expectBridgeInIndex(53);
      expect(be53.bridges).toEqual(['quantum', 'classical']);
    });

    it("tractability_class is 'closed-form'", () => {
      const be53 = expectBridgeInIndex(53);
      expect(be53.tractability_class).toBe('closed-form');
    });

    it('formula_latex includes beta and b_0', () => {
      const be53 = expectBridgeInIndex(53);
      expect(be53.formula_latex).toContain('beta');
      expect(be53.formula_latex).toContain('b_0');
    });

    it('references include Gross-Wilczek 1973 and Politzer 1973', () => {
      const be53 = expectBridgeInIndex(53);
      const refs = be53.references.join(' ');
      expect(refs).toMatch(/Gross.*Wilczek.*1973|Wilczek.*Gross.*1973/);
      expect(refs).toMatch(/Politzer.*1973/);
    });
  });

  describe('Dimensional structure', () => {
    it('RHS β(g) polynomial is dimensionless', () => {
      expectDimRoundTrip(BE53_BETA_G_RHS, '[1]');
    });

    it('LHS β_g is dimensionless', () => {
      const r = validate(BE53_BETA_G_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation LHS = RHS validates (both dimensionless)', () => {
      const eq = validateEquation(BE53_BETA_G_LHS, BE53_BETA_G_RHS);
      expect(eq.ok).toBe(true);
    });
  });

  describe('Structural BetaFunctionNode form — single-coupling flow', () => {
    it('BE53_BETA_G_STRUCTURAL validates via validateBetaFunction', () => {
      const r = validateBetaFunction(BE53_BETA_G_STRUCTURAL);
      expect(r.dim).toEqual(DIMENSIONLESS);
      expect(r.targetName).toBe('g');
    });

    it('couplings list has exactly one coupling (g)', () => {
      expect(BE53_BETA_G_STRUCTURAL.couplings).toHaveLength(1);
      expect(BE53_BETA_G_STRUCTURAL.couplings[0].name).toBe('g');
    });

    it('target coupling is g', () => {
      expect(BE53_BETA_G_STRUCTURAL.target.name).toBe('g');
      expect(BE53_BETA_G_STRUCTURAL.target).toBe(BE53_COUPLING_G);
    });

    it('fixedPoint pins the UV fixed point at g* = 0 (asymptotic freedom)', () => {
      expect(BE53_BETA_G_STRUCTURAL.fixedPoint).toEqual([0]);
    });

    it('coupling instance is BE53_COUPLING_G (shared reference)', () => {
      expect(BE53_BETA_G_STRUCTURAL.couplings[0]).toBe(BE53_COUPLING_G);
    });
  });

  describe('b₀ coefficient — computeB0', () => {
    it('QCD: b₀(N_c=3, N_f=6) = 7', () => {
      expect(computeB0(3, 6)).toBeCloseTo(7, 12);
    });

    it('pure SU(3): b₀(N_c=3, N_f=0) = 11', () => {
      expect(computeB0(3, 0)).toBeCloseTo(11, 12);
    });

    it('asymptotic-freedom boundary: b₀(N_c=3, N_f=16.5) ≈ 0', () => {
      // N_f = (11/2) N_c = 16.5 for SU(3)
      expect(computeB0(3, 16.5)).toBeCloseTo(0, 12);
    });

    it('SU(2): b₀(N_c=2, N_f=0) = 22/3', () => {
      expect(computeB0(2, 0)).toBeCloseTo(22 / 3, 12);
    });
  });

  describe('Numerical evaluator — evaluateYangMillsBeta', () => {
    it('UV fixed point: β(g=0) = 0 for any b₀ > 0 (QCD)', () => {
      const beta = evaluateYangMillsBeta({ g: 0, N_c: 3, N_f: 6 });
      expect(beta).toBeCloseTo(0, 15);
    });

    it('asymptotic freedom direction: β(g=1) < 0 for QCD (b₀ = 7 > 0)', () => {
      const beta = evaluateYangMillsBeta({ g: 1.0, N_c: 3, N_f: 6 });
      expect(beta).toBeLessThan(0);
    });

    it('QCD one-loop: β(g=1, N_c=3, N_f=6) = −7/(16π²)', () => {
      const expected = -7 / (16 * Math.PI * Math.PI);
      const got = evaluateYangMillsBeta({ g: 1.0, N_c: 3, N_f: 6 });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('pure SU(3) (N_f=0): β(g=1) = −11/(16π²)', () => {
      const expected = -11 / (16 * Math.PI * Math.PI);
      const got = evaluateYangMillsBeta({ g: 1.0, N_c: 3, N_f: 0 });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('asymptotic-freedom boundary: β(g, N_f=16.5) ≈ 0 for any g (b₀ = 0)', () => {
      // When b₀ = 0, the one-loop β-function vanishes identically.
      const g = 0.5;
      const beta = evaluateYangMillsBeta({ g, N_c: 3, N_f: 16.5 });
      expect(beta).toBeCloseTo(0, 12);
    });

    it('scales as g³: doubling g multiplies β by 8', () => {
      const b1 = evaluateYangMillsBeta({ g: 0.1, N_c: 3, N_f: 6 });
      const b2 = evaluateYangMillsBeta({ g: 0.2, N_c: 3, N_f: 6 });
      expect(b2 / b1).toBeCloseTo(8, 12);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite g', () => {
      expect(() =>
        evaluateYangMillsBeta({ g: NaN, N_c: 3, N_f: 6 }),
      ).toThrow(RangeError);
    });

    it('rejects Infinity g', () => {
      expect(() =>
        evaluateYangMillsBeta({ g: Infinity, N_c: 3, N_f: 6 }),
      ).toThrow(RangeError);
    });

    it('rejects N_c ≤ 0', () => {
      expect(() =>
        evaluateYangMillsBeta({ g: 1, N_c: 0, N_f: 6 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite N_c', () => {
      expect(() =>
        evaluateYangMillsBeta({ g: 1, N_c: NaN, N_f: 6 }),
      ).toThrow(RangeError);
    });

    it('rejects N_f < 0', () => {
      expect(() =>
        evaluateYangMillsBeta({ g: 1, N_c: 3, N_f: -1 }),
      ).toThrow(RangeError);
    });
  });
});
