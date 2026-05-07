/**
 * Tier-5 AST encoding test for BE-29 — Jarzynski free-energy equality
 * (canonical 1997 form, post Wave Y reformulation).
 *
 * Formula: ΔF = -k_B T ln⟨exp(-W / (k_B T))⟩.
 *
 * @see src/bridges/equations/be-29-jarzynski.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE29_JARZYNSKI_RHS,
  BE29_JARZYNSKI_LHS,
  BE29_BETAW_ARG,
  evaluateJarzynski,
  validateBE29Dimensions,
} from '../../src/bridges/equations/be-29-jarzynski.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { ENERGY, DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

describe('BE-29 Jarzynski free-energy equality — Tier 5 AST encoding', () => {
  const be29 = BRIDGE_EQUATIONS.find((e) => e.id === 29);

  describe('Catalog round-trip', () => {
    it('exists', () => {
      expect(be29).toBeDefined();
    });

    it("dimensional_signature is '[energy]'", () => {
      expect(be29!.dimensional_signature).toBe('[energy]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE29_JARZYNSKI_RHS).inferredDimension;
      expect(inferredDim).not.toBeNull();
      expect(format(inferredDim!)).toBe(be29!.dimensional_signature);
    });

    it("status pinned 'speculative' (gravity-extension framing)", () => {
      expect(be29!.status).toBe('speculative');
    });

    it('formula_latex contains the canonical Jarzynski equality (no gravity-correction integral)', () => {
      expect(be29!.formula_latex).toMatch(/\\Delta F/);
      expect(be29!.formula_latex).toMatch(/\\ln/);
      expect(be29!.formula_latex).not.toMatch(/T\^\{\\mu\\nu\}/);
      expect(be29!.formula_latex).not.toMatch(/\\sqrt\{-g\}/);
    });

    it('references include canonical Jarzynski 1997', () => {
      const refs = be29!.references.join(' | ');
      expect(refs).toMatch(/Jarzynski.*1997/);
      expect(refs).toMatch(/78:2690/);
    });

    it('notes mention Wave Y reformulation', () => {
      expect(be29!.notes).toMatch(/Wave Y/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [energy]', () => {
      const r = validate(BE29_JARZYNSKI_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENERGY);
    });

    it('RHS is [energy]', () => {
      const r = validate(BE29_JARZYNSKI_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENERGY);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE29_JARZYNSKI_LHS, BE29_JARZYNSKI_RHS);
      expect(eq.ok).toBe(true);
    });

    it('exp-argument lemma BE29_BETAW_ARG is dimensionless', () => {
      const r = validate(BE29_BETAW_ARG);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('validateBE29Dimensions reports both sides as [energy]', () => {
      const r = validateBE29Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(ENERGY);
      expect(r.rhsDim).toEqual(ENERGY);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { kB } = PhysicalConstants;
    const T = 300; // 300 K room temperature
    const kT = kB * T; // ≈ 4.14e-21 J

    it('reversible work limit: all W=W_rev → ΔF = W_rev exactly', () => {
      const W_rev = 5 * kT; // 5 k_BT
      const samples = Array.from({ length: 100 }, () => W_rev);
      const dF = evaluateJarzynski({ W_samples_J: samples, T_K: T });
      expect(dF).toBeCloseTo(W_rev, 25);
    });

    it('reversible-work invariant: any constant W gives ΔF = W', () => {
      for (const W of [-3 * kT, 0, 1.5 * kT, 10 * kT]) {
        const samples = [W, W, W, W, W];
        const dF = evaluateJarzynski({ W_samples_J: samples, T_K: T });
        expect(dF).toBeCloseTo(W, 25);
      }
    });

    it('zero work / single sample at W=0 gives ΔF = 0', () => {
      const dF = evaluateJarzynski({ W_samples_J: [0], T_K: T });
      expect(dF).toBeCloseTo(0, 25);
    });

    it('Jensen inequality: ΔF ≤ ⟨W⟩ (second-law constraint)', () => {
      // Generate a non-trivial sample with two work values; Jensen's
      // inequality applied to the convex function exp(-x) gives
      // ⟨exp(-βW)⟩ ≥ exp(-β⟨W⟩), hence ΔF = -kT ln⟨exp(-βW)⟩ ≤ ⟨W⟩.
      const samples = [0.5 * kT, 2.5 * kT];
      const dF = evaluateJarzynski({ W_samples_J: samples, T_K: T });
      const meanW = (samples[0] + samples[1]) / 2;
      expect(dF).toBeLessThanOrEqual(meanW);
    });

    it('ΔF scales with k_B T at fixed dimensionless work β·W', () => {
      // For fixed β·W, the prefactor k_B T scales linearly with T.
      const beta_W_targets = [1.0, 2.0]; // dimensionless
      const samples_T1 = beta_W_targets.map((bW) => bW * kB * T); // β·W same
      const samples_T2 = beta_W_targets.map((bW) => bW * kB * (2 * T));
      const dF1 = evaluateJarzynski({ W_samples_J: samples_T1, T_K: T });
      const dF2 = evaluateJarzynski({ W_samples_J: samples_T2, T_K: 2 * T });
      // ΔF = -k_B T · ln⟨e^{-β·W}⟩, with same ln-term (since β·W matches),
      // so dF2 / dF1 = T2 / T1 = 2.
      expect(dF2 / dF1).toBeCloseTo(2, 12);
    });

    it('temperature dependence: 0 work → ΔF = 0 at any T', () => {
      for (const T_test of [10, 100, 300, 1000]) {
        const dF = evaluateJarzynski({ W_samples_J: [0], T_K: T_test });
        expect(dF).toBeCloseTo(0, 25);
      }
    });

    it('linearity in shift: shifting all W by ΔW shifts ΔF by ΔW', () => {
      // ⟨exp(-β(W+ΔW))⟩ = exp(-βΔW) · ⟨exp(-βW)⟩, so ln-shift = -βΔW,
      // and ΔF_shifted = -kT(-βΔW + ln⟨e^-βW⟩) = ΔW + ΔF_orig.
      const baseSamples = [0.5 * kT, 1.5 * kT, 2.5 * kT];
      const shift = 3 * kT;
      const dF_base = evaluateJarzynski({ W_samples_J: baseSamples, T_K: T });
      const dF_shifted = evaluateJarzynski({
        W_samples_J: baseSamples.map((W) => W + shift),
        T_K: T,
      });
      expect(dF_shifted - dF_base).toBeCloseTo(shift, 22);
    });
  });

  describe('Input validation', () => {
    it('rejects non-positive temperature', () => {
      expect(() => evaluateJarzynski({ W_samples_J: [1], T_K: 0 })).toThrow(RangeError);
      expect(() => evaluateJarzynski({ W_samples_J: [1], T_K: -5 })).toThrow(RangeError);
    });

    it('rejects empty sample array', () => {
      expect(() => evaluateJarzynski({ W_samples_J: [], T_K: 300 })).toThrow(RangeError);
    });

    it('rejects non-finite work values', () => {
      expect(() => evaluateJarzynski({ W_samples_J: [Number.NaN], T_K: 300 })).toThrow(RangeError);
      expect(() => evaluateJarzynski({ W_samples_J: [Number.POSITIVE_INFINITY], T_K: 300 })).toThrow(RangeError);
    });
  });
});
