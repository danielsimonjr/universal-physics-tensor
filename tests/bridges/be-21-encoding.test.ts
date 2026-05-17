/**
 * Tier-5 AST encoding test for BE-21 — KSS viscosity-to-entropy bound.
 *
 * Formula: η/s = ℏ / (4π k_B) ≈ 6.075×10⁻¹² K·s.
 *
 * Status pin: 'established' (KSS itself is established AdS/CFT result;
 * bridge-framing reformulation is documented in known_issues).
 *
 * @see src/bridges/equations/be-21-kss-bound.ts
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 21)
 */

import { describe, it, expect } from 'vitest';
import {
  BE21_KSS_RHS,
  BE21_KSS_LHS,
  VISCOSITY_OVER_ENTROPY_DENSITY,
  evaluateKSSBound,
  validateBE21Dimensions,
} from '../../src/bridges/equations/be-21-kss-bound.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { PhysicalConstants } from '../../src/core/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-21 KSS viscosity-to-entropy bound — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(21);
    });

    it("dimensional_signature is '[T Theta]' (round-trips through validator)", () => {
      const be21 = expectBridgeInIndex(21);
      expect(be21.dimensional_signature).toBe('[T Theta]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE21_KSS_RHS, '[T Theta]');
    });

    it("status pinned 'established' (KSS itself is established)", () => {
      expectBridgeInIndex(21, 'established');
    });

    it('formula_latex contains the canonical KSS scalar form', () => {
      const be21 = expectBridgeInIndex(21);
      expect(be21.formula_latex).toMatch(/\\eta/);
      expect(be21.formula_latex).toMatch(/4\\pi k_B/);
    });

    it('references include the canonical KSS 2005 paper', () => {
      const be21 = expectBridgeInIndex(21);
      const refs = be21.references.join(' | ');
      expect(refs).toMatch(/Kovtun.*Son.*Starinets/i);
      expect(refs).toMatch(/0405231/);
    });

    it('notes mention Wave Y reformulation', () => {
      const be21 = expectBridgeInIndex(21);
      expect(be21.notes).toMatch(/Wave Y/);
      expect(be21.notes).toMatch(/2026-05-07/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [T Θ]', () => {
      const r = validate(BE21_KSS_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(VISCOSITY_OVER_ENTROPY_DENSITY);
    });

    it('RHS is [T Θ]', () => {
      const r = validate(BE21_KSS_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(VISCOSITY_OVER_ENTROPY_DENSITY);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE21_KSS_LHS, BE21_KSS_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE21Dimensions reports both sides as [T Θ]', () => {
      const r = validateBE21Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(VISCOSITY_OVER_ENTROPY_DENSITY);
      expect(r.rhsDim).toEqual(VISCOSITY_OVER_ENTROPY_DENSITY);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { hbar, kB } = PhysicalConstants;

    it('evaluates to ≈ 6.078e-13 K·s (canonical KSS textbook value)', () => {
      const v = evaluateKSSBound();
      // ℏ/(4π k_B) ≈ 6.078e-13 K·s. Use a permissive tolerance pinned to
      // 1e-15 (the precision is set by ℏ and k_B both having ~9 significant
      // figures in CODATA 2018).
      expect(v).toBeGreaterThan(6.07e-13);
      expect(v).toBeLessThan(6.09e-13);
    });

    it('matches the algebraic identity ℏ/(4π k_B)', () => {
      const v = evaluateKSSBound();
      const expected = hbar / (4 * Math.PI * kB);
      expect(v).toBeCloseTo(expected, 14);
    });

    it('value is positive and finite', () => {
      const v = evaluateKSSBound();
      expect(v).toBeGreaterThan(0);
      expect(Number.isFinite(v)).toBe(true);
    });

    it('value is much smaller than 1 K·s (universal bound on quantum fluids)', () => {
      const v = evaluateKSSBound();
      expect(v).toBeLessThan(1e-10);
    });

    it('value is greater than 1e-14 K·s (sanity floor)', () => {
      const v = evaluateKSSBound();
      expect(v).toBeGreaterThan(1e-14);
    });

    it('hand-derived: ℏ ≈ 1.055e-34, k_B ≈ 1.381e-23, ratio ≈ 7.64e-12, divide by 4π → ~6.08e-13', () => {
      const ratio = hbar / kB;
      const v = ratio / (4 * Math.PI);
      expect(v).toBeCloseTo(evaluateKSSBound(), 25);
      expect(v).toBeGreaterThan(6.0e-13);
      expect(v).toBeLessThan(6.2e-13);
    });

    it('AST RHS structure: hbar in numerator, (4pi · k_B) in denominator', () => {
      // Pin the structure: top-level is division; numerator is hbar symbol;
      // denominator is multiplication of '4pi' and 'k_B'.
      expect(BE21_KSS_RHS.kind).toBe('op');
      if (BE21_KSS_RHS.kind === 'op') {
        expect(BE21_KSS_RHS.op).toBe('/');
        expect(BE21_KSS_RHS.args.length).toBe(2);
        const [num, den] = BE21_KSS_RHS.args;
        expect(num.kind).toBe('symbol');
        if (num.kind === 'symbol') expect(num.name).toBe('hbar');
        expect(den.kind).toBe('op');
        if (den.kind === 'op') expect(den.op).toBe('*');
      }
    });
  });
});
