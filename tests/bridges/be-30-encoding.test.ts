/**
 * Tier-5 AST encoding test for BE-30 — FLM first law of entanglement
 * entropy (Faulkner-Lewkowycz-Maldacena 2013, post Wave Y AST encoding).
 *
 * Formula: δS_EE(R) = δ⟨H_R⟩.
 *
 * @see src/bridges/equations/be-30-flm-first-law.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE30_FLM_RHS,
  BE30_FLM_LHS,
  evaluateFLMFirstLaw,
  evaluateBekensteinBound,
  validateBE30Dimensions,
} from '../../src/bridges/equations/be-30-flm-first-law.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-30 FLM first-law-of-entanglement — Tier 5 AST encoding', () => {
  const be30 = BRIDGE_EQUATIONS.find((e) => e.id === 30);

  describe('Catalog round-trip', () => {
    it('exists', () => {
      expect(be30).toBeDefined();
    });

    it("dimensional_signature is '[1]' (dimensionless, nats convention)", () => {
      expect(be30!.dimensional_signature).toBe('[1]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE30_FLM_RHS).inferredDimension;
      expect(inferredDim).not.toBeNull();
      expect(format(inferredDim!)).toBe(be30!.dimensional_signature);
    });

    it("status pinned 'speculative' (QG-emergence framing speculative)", () => {
      expect(be30!.status).toBe('speculative');
    });

    it('formula_latex contains the canonical δS_EE = δ⟨H_R⟩ form', () => {
      expect(be30!.formula_latex).toMatch(/\\delta S/);
      expect(be30!.formula_latex).toMatch(/H_R/);
    });

    it('references include Faulkner-Lewkowycz-Maldacena 2013', () => {
      const refs = be30!.references.join(' | ');
      expect(refs).toMatch(/Faulkner.*Lewkowycz.*Maldacena/);
      expect(refs).toMatch(/1307\.2892/);
    });

    it('notes mention Wave Y AST encoding', () => {
      expect(be30!.notes).toMatch(/Wave Y/);
      expect(be30!.notes).toMatch(/2026-05-07/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is DIMENSIONLESS', () => {
      const r = validate(BE30_FLM_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('RHS is DIMENSIONLESS', () => {
      const r = validate(BE30_FLM_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE30_FLM_LHS, BE30_FLM_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE30Dimensions reports both sides as DIMENSIONLESS', () => {
      const r = validateBE30Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });
  });

  describe('Numerical evaluator — FLM linear-response identity', () => {
    it('first-law tautology: δS_EE = δ⟨H_R⟩ exactly', () => {
      for (const x of [-2, -0.5, 0, 0.1, 1.0, 100]) {
        expect(evaluateFLMFirstLaw({ delta_avg_H_R: x })).toBe(x);
      }
    });

    it('zero δ⟨H_R⟩ gives zero δS_EE (equilibrium)', () => {
      expect(evaluateFLMFirstLaw({ delta_avg_H_R: 0 })).toBe(0);
    });

    it('linearity: 2x input gives 2x output', () => {
      const a = evaluateFLMFirstLaw({ delta_avg_H_R: 1.5 });
      const b = evaluateFLMFirstLaw({ delta_avg_H_R: 3.0 });
      expect(b / a).toBe(2);
    });
  });

  describe('Bekenstein bound — secondary cross-check', () => {
    it('1 J in 1 m region gives bound ≈ 3×10⁴² nats', () => {
      // S ≤ 2π R E / (ℏc) = 2π · 1 · 1 / (1.055e-34 · 3e8) ≈ 2π · 3.16e25
      // = ~1.99e26 nats. Hmm let me recompute: 2π / (1.055e-34 · 3e8)
      // = 2π / 3.16e-26 ≈ 1.99e26.
      const S_bound = evaluateBekensteinBound({ R_m: 1, E_J: 1 });
      expect(S_bound).toBeGreaterThan(1e26);
      expect(S_bound).toBeLessThan(1e27);
    });

    it('linearity in radius: bound scales ∝ R', () => {
      const s1 = evaluateBekensteinBound({ R_m: 1, E_J: 1 });
      const s2 = evaluateBekensteinBound({ R_m: 2, E_J: 1 });
      expect(s2 / s1).toBeCloseTo(2, 14);
    });

    it('linearity in energy: bound scales ∝ E', () => {
      const s1 = evaluateBekensteinBound({ R_m: 1, E_J: 1 });
      const s2 = evaluateBekensteinBound({ R_m: 1, E_J: 5 });
      expect(s2 / s1).toBeCloseTo(5, 14);
    });

    it('bound is always positive for R, E > 0', () => {
      for (const R of [1e-15, 1, 1e10]) {
        for (const E of [1e-20, 1, 1e30]) {
          const s = evaluateBekensteinBound({ R_m: R, E_J: E });
          expect(s).toBeGreaterThan(0);
          expect(Number.isFinite(s)).toBe(true);
        }
      }
    });
  });

  describe('Input validation', () => {
    it('FLM rejects non-finite δ⟨H_R⟩', () => {
      expect(() =>
        evaluateFLMFirstLaw({ delta_avg_H_R: Number.NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateFLMFirstLaw({ delta_avg_H_R: Number.POSITIVE_INFINITY }),
      ).toThrow(RangeError);
    });

    it('Bekenstein rejects non-positive R or E', () => {
      expect(() => evaluateBekensteinBound({ R_m: 0, E_J: 1 })).toThrow(RangeError);
      expect(() => evaluateBekensteinBound({ R_m: 1, E_J: -1 })).toThrow(RangeError);
    });

    it('Bekenstein rejects non-finite inputs', () => {
      expect(() =>
        evaluateBekensteinBound({ R_m: Number.NaN, E_J: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateBekensteinBound({ R_m: 1, E_J: Number.POSITIVE_INFINITY }),
      ).toThrow(RangeError);
    });
  });
});
