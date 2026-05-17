/**
 * Tier-5 AST encoding test for BE-48 — GRW mass-amplified localization
 * rate (CSL extension, post Wave Y reformulation).
 *
 * Formula: λ_GRW(m) = λ_0 · (m / m_0), with λ_0 ≈ 10⁻¹⁶ /s and m_0 =
 * nucleon mass.
 *
 * @see src/bridges/equations/be-48-grw-localization.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE48_GRW_LOCALIZATION_RHS,
  BE48_GRW_LOCALIZATION_LHS,
  evaluateGRWLocalization,
  validateBE48Dimensions,
} from '../../src/bridges/equations/be-48-grw-localization.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { FREQUENCY } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-48 GRW mass-amplified localization rate — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(48);
    });

    it("dimensional_signature is '[frequency]'", () => {
      const be48 = expectBridgeInIndex(48);
      expect(be48.dimensional_signature).toBe('[frequency]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE48_GRW_LOCALIZATION_RHS, '[frequency]');
    });

    it("status pinned 'speculative' (Wave Y reformulation: bridge framing speculative)", () => {
      expectBridgeInIndex(48, 'speculative');
    });

    it('formula_latex contains the canonical mass-amplified rate form', () => {
      const be48 = expectBridgeInIndex(48);
      expect(be48.formula_latex).toMatch(/\\lambda_\{?\\text\{GRW\}\}?\(m\)/);
      expect(be48.formula_latex).toMatch(/\\lambda_0/);
      expect(be48.formula_latex).toMatch(/m_0/);
    });

    it('formula_latex no longer carries the full Lindblad master equation', () => {
      const be48 = expectBridgeInIndex(48);
      const f = be48.formula_latex;
      expect(f).not.toMatch(/\\rho/);
      expect(f).not.toMatch(/L_x/);
      expect(f).not.toMatch(/H,\\rho/);
    });

    it('references include canonical GRW 1986 + CSL Pearle/Ghirardi', () => {
      const be48 = expectBridgeInIndex(48);
      const refs = be48.references.join(' | ');
      expect(refs).toMatch(/Ghirardi.*Rimini.*Weber 1986/);
      expect(refs).toMatch(/Pearle 1989/);
    });

    it('notes mention Wave Y reformulation', () => {
      const be48 = expectBridgeInIndex(48);
      expect(be48.notes).toMatch(/Wave Y/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [frequency]', () => {
      const r = validate(BE48_GRW_LOCALIZATION_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(FREQUENCY);
    });

    it('RHS is [frequency]', () => {
      const r = validate(BE48_GRW_LOCALIZATION_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(FREQUENCY);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE48_GRW_LOCALIZATION_LHS, BE48_GRW_LOCALIZATION_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE48Dimensions reports both sides as [frequency]', () => {
      const r = validateBE48Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(FREQUENCY);
      expect(r.rhsDim).toEqual(FREQUENCY);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const m_p = 1.67e-27; // nucleon mass kg
    const m_e = 9.109e-31; // electron mass kg

    it('single-nucleon (m = m_0) gives λ = λ_0 ≈ 1e-16 /s', () => {
      const lambda = evaluateGRWLocalization({ m_kg: m_p });
      expect(lambda).toBeCloseTo(1e-16, 25);
    });

    it('electron (m_e ≈ m_p/1836) gives λ ≈ 5×10⁻²⁰ /s', () => {
      const lambda = evaluateGRWLocalization({ m_kg: m_e });
      // m_e/m_p ≈ 5.45e-4; λ_0 × that = 5.45e-20 /s
      expect(lambda).toBeGreaterThan(4e-20);
      expect(lambda).toBeLessThan(7e-20);
    });

    it('macroscopic 1 gram object gives λ ≈ 6×10⁷ /s (rapid collapse)', () => {
      const lambda = evaluateGRWLocalization({ m_kg: 1e-3 });
      // (1e-3 / 1.67e-27) × 1e-16 = 5.99e7 /s
      expect(lambda).toBeGreaterThan(5e7);
      expect(lambda).toBeLessThan(7e7);
    });

    it('linearity in mass: λ(2m) = 2 λ(m)', () => {
      const m_ref = 1e-20;
      const l1 = evaluateGRWLocalization({ m_kg: m_ref });
      const l2 = evaluateGRWLocalization({ m_kg: 2 * m_ref });
      expect(l2 / l1).toBeCloseTo(2, 14);
    });

    it('linearity in mass for arbitrary factor', () => {
      const m_ref = 1e-15;
      const l_ref = evaluateGRWLocalization({ m_kg: m_ref });
      for (const alpha of [0.1, 5, 1000, 1e9]) {
        const l_alpha = evaluateGRWLocalization({ m_kg: alpha * m_ref });
        expect(l_alpha / l_ref).toBeCloseTo(alpha, 6);
      }
    });

    it('λ_0 override: doubling λ_0 doubles the rate', () => {
      const l1 = evaluateGRWLocalization({ m_kg: m_p, lambda_0_per_s: 1e-16 });
      const l2 = evaluateGRWLocalization({ m_kg: m_p, lambda_0_per_s: 2e-16 });
      expect(l2 / l1).toBeCloseTo(2, 14);
    });

    it('m_0 override: halving m_0 doubles the rate', () => {
      const l1 = evaluateGRWLocalization({ m_kg: m_p, m_0_kg: m_p });
      const l2 = evaluateGRWLocalization({ m_kg: m_p, m_0_kg: m_p / 2 });
      expect(l2 / l1).toBeCloseTo(2, 14);
    });

    it('λ_0 = 0 gives zero localization rate', () => {
      const lambda = evaluateGRWLocalization({ m_kg: m_p, lambda_0_per_s: 0 });
      expect(lambda).toBe(0);
    });
  });

  describe('Input validation', () => {
    it('rejects zero or negative mass', () => {
      expect(() => evaluateGRWLocalization({ m_kg: 0 })).toThrow(RangeError);
      expect(() => evaluateGRWLocalization({ m_kg: -1 })).toThrow(RangeError);
    });

    it('rejects non-finite mass', () => {
      expect(() => evaluateGRWLocalization({ m_kg: Number.NaN })).toThrow(RangeError);
      expect(() => evaluateGRWLocalization({ m_kg: Number.POSITIVE_INFINITY })).toThrow(RangeError);
    });

    it('rejects non-positive m_0', () => {
      expect(() => evaluateGRWLocalization({ m_kg: 1, m_0_kg: 0 })).toThrow(RangeError);
      expect(() => evaluateGRWLocalization({ m_kg: 1, m_0_kg: -1 })).toThrow(RangeError);
    });

    it('rejects negative or non-finite lambda_0', () => {
      expect(() => evaluateGRWLocalization({ m_kg: 1, lambda_0_per_s: -1e-16 })).toThrow(RangeError);
      expect(() => evaluateGRWLocalization({ m_kg: 1, lambda_0_per_s: Number.NaN })).toThrow(RangeError);
    });
  });
});
