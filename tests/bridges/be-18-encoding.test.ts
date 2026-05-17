/**
 * Tier-5 AST encoding test for BE-18 — Higgs-like dark-fermion mass
 * generation (post Wave Y reformulation).
 *
 * Formula: m_dark = g_dark · v_dark (natural units; mass-as-energy).
 *
 * @see src/bridges/equations/be-18-higgs-mass.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE18_HIGGS_MASS_RHS,
  BE18_HIGGS_MASS_LHS,
  evaluateHiggsMass,
  validateBE18Dimensions,
} from '../../src/bridges/equations/be-18-higgs-mass.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { ENERGY } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-18 Higgs-like dark-fermion mass — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(18);
    });

    it("dimensional_signature is '[energy]' (natural-units mass-as-energy)", () => {
      const entry = expectBridgeInIndex(18);
      expect(entry.dimensional_signature).toBe('[energy]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE18_HIGGS_MASS_RHS, '[energy]');
    });

    it("status pinned 'speculative' (dark-sector existence speculative)", () => {
      expectBridgeInIndex(18, 'speculative');
    });

    it('formula_latex contains the canonical m = g·v form', () => {
      const entry = expectBridgeInIndex(18);
      expect(entry.formula_latex).toMatch(/m_\{?\\text\{dark\}\}?/);
      expect(entry.formula_latex).toMatch(/g_\{?\\text\{dark\}\}?/);
      expect(entry.formula_latex).toMatch(/v_\{?\\text\{dark\}\}?/);
    });

    it('references include Peskin-Schroeder', () => {
      const entry = expectBridgeInIndex(18);
      const refs = entry.references.join(' | ');
      expect(refs).toMatch(/Peskin.*Schroeder/);
    });

    it('notes mention Wave Y reformulation', () => {
      const entry = expectBridgeInIndex(18);
      expect(entry.notes).toMatch(/Wave Y/);
      expect(entry.notes).toMatch(/2026-05-07/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [energy]', () => {
      const r = validate(BE18_HIGGS_MASS_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENERGY);
    });

    it('RHS is [energy]', () => {
      const r = validate(BE18_HIGGS_MASS_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENERGY);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE18_HIGGS_MASS_LHS, BE18_HIGGS_MASS_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE18Dimensions reports both sides as ENERGY', () => {
      const r = validateBE18Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(ENERGY);
      expect(r.rhsDim).toEqual(ENERGY);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    it('SM top quark: y_t ≈ 0.99, v_EW = 174 GeV → m_t ≈ 172 GeV (textbook)', () => {
      const m_t = evaluateHiggsMass({ g_dark: 0.99, v_dark_GeV: 174 });
      expect(m_t).toBeCloseTo(172.26, 1);
      // Within 1% of the measured top mass m_t = 172.76 GeV
      expect(m_t).toBeGreaterThan(170);
      expect(m_t).toBeLessThan(175);
    });

    it('SM electron: y_e ≈ 2.94e-6, v_EW = 174 GeV → m_e ≈ 5.11e-4 GeV ≈ 0.511 MeV', () => {
      const m_e = evaluateHiggsMass({ g_dark: 2.94e-6, v_dark_GeV: 174 });
      expect(m_e).toBeCloseTo(5.12e-4, 5);
    });

    it('zero coupling gives zero mass', () => {
      const m = evaluateHiggsMass({ g_dark: 0, v_dark_GeV: 174 });
      expect(m).toBe(0);
    });

    it('zero VEV gives zero mass (no SSB)', () => {
      const m = evaluateHiggsMass({ g_dark: 0.5, v_dark_GeV: 0 });
      expect(m).toBe(0);
    });

    it('linearity in g: doubling g doubles m', () => {
      const m1 = evaluateHiggsMass({ g_dark: 0.5, v_dark_GeV: 174 });
      const m2 = evaluateHiggsMass({ g_dark: 1.0, v_dark_GeV: 174 });
      expect(m2 / m1).toBeCloseTo(2, 14);
    });

    it('linearity in v: doubling v doubles m', () => {
      const m1 = evaluateHiggsMass({ g_dark: 0.5, v_dark_GeV: 174 });
      const m2 = evaluateHiggsMass({ g_dark: 0.5, v_dark_GeV: 348 });
      expect(m2 / m1).toBeCloseTo(2, 14);
    });

    it('algebraic identity: m = g · v', () => {
      const g = 0.7;
      const v = 100;
      expect(evaluateHiggsMass({ g_dark: g, v_dark_GeV: v })).toBeCloseTo(g * v, 14);
    });

    it('handles negative coupling (e.g., conjugate mass term)', () => {
      const m = evaluateHiggsMass({ g_dark: -0.5, v_dark_GeV: 174 });
      expect(m).toBeCloseTo(-87, 6);
    });
  });

  describe('Input validation', () => {
    it('rejects non-finite g_dark', () => {
      expect(() =>
        evaluateHiggsMass({ g_dark: Number.NaN, v_dark_GeV: 174 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite v_dark', () => {
      expect(() =>
        evaluateHiggsMass({ g_dark: 0.5, v_dark_GeV: Number.POSITIVE_INFINITY }),
      ).toThrow(RangeError);
    });
  });
});
