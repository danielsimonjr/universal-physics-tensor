/**
 * Tier-5 AST encoding test for BE-27 — Cugliandolo-Kurchan effective
 * temperature in non-equilibrium / active-matter systems (post Wave Y
 * reformulation).
 *
 * Formula: T_eff = T · (1 + Σ_active / (k_B T)).
 *
 * @see src/bridges/equations/be-27-effective-temperature.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE27_TEFF_RHS,
  BE27_TEFF_LHS,
  evaluateEffectiveTemperature,
  validateBE27Dimensions,
} from '../../src/bridges/equations/be-27-effective-temperature.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { TEMPERATURE } from '../../src/dimensional/types.js';
import { PhysicalConstants } from '../../src/core/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-27 Cugliandolo-Kurchan effective temperature — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(27);
    });

    it("dimensional_signature is '[temperature]'", () => {
      const entry = expectBridgeInIndex(27);
      expect(entry.dimensional_signature).toBe('[temperature]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE27_TEFF_RHS, '[temperature]');
    });

    it("status pinned 'speculative'", () => {
      expectBridgeInIndex(27, 'speculative');
    });

    it('formula_latex contains T_eff = T·(1 + Σ_active/(k_BT)) form', () => {
      const entry = expectBridgeInIndex(27);
      const f = entry.formula_latex;
      expect(f).toMatch(/T_\{?\\text\{eff\}\}?/);
      expect(f).toMatch(/\\Sigma_\{?\\text\{active\}\}?/);
      expect(f).toMatch(/k_B T/);
    });

    it('references include canonical Cugliandolo 2011 review', () => {
      const entry = expectBridgeInIndex(27);
      const refs = entry.references.join(' | ');
      expect(refs).toMatch(/Cugliandolo 2011/);
    });

    it('notes mention Wave Y reformulation', () => {
      const entry = expectBridgeInIndex(27);
      expect(entry.notes).toMatch(/Wave Y/);
      expect(entry.notes).toMatch(/2026-05-07/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [temperature]', () => {
      const r = validate(BE27_TEFF_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(TEMPERATURE);
    });

    it('RHS is [temperature]', () => {
      const r = validate(BE27_TEFF_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(TEMPERATURE);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE27_TEFF_LHS, BE27_TEFF_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE27Dimensions reports both sides as TEMPERATURE', () => {
      const r = validateBE27Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(TEMPERATURE);
      expect(r.rhsDim).toEqual(TEMPERATURE);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { kB } = PhysicalConstants;
    const T = 300; // 300 K

    it('passive equilibrium: Σ_active = 0 → T_eff = T', () => {
      const T_eff = evaluateEffectiveTemperature({
        T_K: T,
        Sigma_active_J: 0,
      });
      expect(T_eff).toBe(T);
    });

    it('active = k_B T (one thermal unit) → T_eff = 2T', () => {
      const T_eff = evaluateEffectiveTemperature({
        T_K: T,
        Sigma_active_J: kB * T,
      });
      expect(T_eff).toBeCloseTo(2 * T, 12);
    });

    it('active = 4 k_B T → T_eff = 5T', () => {
      const T_eff = evaluateEffectiveTemperature({
        T_K: T,
        Sigma_active_J: 4 * kB * T,
      });
      expect(T_eff).toBeCloseTo(5 * T, 12);
    });

    it('linearity in Σ_active: ΔT_eff ∝ ΔΣ_active at fixed T', () => {
      const T_eff_0 = evaluateEffectiveTemperature({ T_K: T, Sigma_active_J: 0 });
      const T_eff_1 = evaluateEffectiveTemperature({
        T_K: T,
        Sigma_active_J: kB * T,
      });
      const T_eff_2 = evaluateEffectiveTemperature({
        T_K: T,
        Sigma_active_J: 2 * kB * T,
      });
      expect(T_eff_1 - T_eff_0).toBeCloseTo(T_eff_2 - T_eff_1, 12);
    });

    it('cooling regime: negative Σ_active reduces T_eff', () => {
      const T_eff = evaluateEffectiveTemperature({
        T_K: T,
        Sigma_active_J: -0.5 * kB * T,
      });
      expect(T_eff).toBeCloseTo(0.5 * T, 12);
    });

    it('algebraic identity: T_eff = T + Σ_active/k_B (after factoring T)', () => {
      const Sigma = 3 * kB * T;
      const T_eff = evaluateEffectiveTemperature({
        T_K: T,
        Sigma_active_J: Sigma,
      });
      expect(T_eff).toBeCloseTo(T + Sigma / kB, 12);
    });

    it('different T scaling: T_eff(2T, Σ) = 2T + Σ/k_B', () => {
      const Sigma = 1e-22; // J
      const T_eff = evaluateEffectiveTemperature({
        T_K: 600,
        Sigma_active_J: Sigma,
      });
      expect(T_eff).toBeCloseTo(600 + Sigma / kB, 8);
    });
  });

  describe('Input validation', () => {
    it('rejects non-positive T', () => {
      expect(() =>
        evaluateEffectiveTemperature({ T_K: 0, Sigma_active_J: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateEffectiveTemperature({ T_K: -1, Sigma_active_J: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite Σ_active', () => {
      expect(() =>
        evaluateEffectiveTemperature({
          T_K: 300,
          Sigma_active_J: Number.NaN,
        }),
      ).toThrow(RangeError);
    });
  });
});
