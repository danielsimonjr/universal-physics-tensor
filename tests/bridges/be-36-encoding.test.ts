/**
 * Tier-5 AST encoding test for BE-36 — GW170817 graviton-speed bound
 * (post Wave Y reformulation).
 *
 * Formula: |c_GW − c|/c ≤ 10⁻¹⁵ (Abbott et al. 2017 ApJ Lett. 848:L13;
 * Boran et al. 2018 PRD 97:041501).
 *
 * @see src/bridges/equations/be-36-gw-speed-bound.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE36_GW_SPEED_RATIO_RHS,
  BE36_GW_SPEED_RATIO_LHS,
  GW170817_SPEED_BOUND,
  evaluateGWSpeedRatio,
  satisfiesGW170817Bound,
  validateBE36Dimensions,
} from '../../src/bridges/equations/be-36-gw-speed-bound.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

describe('BE-36 GW170817 graviton-speed bound — Tier 5 AST encoding', () => {
  const be36 = BRIDGE_EQUATIONS.find((e) => e.id === 36);

  describe('Catalog round-trip', () => {
    it('exists', () => {
      expect(be36).toBeDefined();
    });

    it("dimensional_signature is '[1]' (dimensionless ratio)", () => {
      expect(be36!.dimensional_signature).toBe('[1]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE36_GW_SPEED_RATIO_RHS).inferredDimension;
      expect(inferredDim).not.toBeNull();
      expect(format(inferredDim!)).toBe(be36!.dimensional_signature);
    });

    it("status pinned 'speculative'", () => {
      expect(be36!.status).toBe('speculative');
    });

    it('formula_latex contains |c_GW - c|/c ≤ 10⁻¹⁵ form', () => {
      const f = be36!.formula_latex;
      expect(f).toMatch(/c_\{?\\text\{GW\}\}?/);
      expect(f).toMatch(/10\^\{?-15\}?/);
    });

    it('references include GW170817 (Abbott 2017)', () => {
      const refs = be36!.references.join(' | ');
      expect(refs).toMatch(/Abbott.*2017|GW170817/);
      expect(refs).toMatch(/1710\.05832|1710\.06168/);
    });

    it('notes mention Wave Y reformulation', () => {
      expect(be36!.notes).toMatch(/Wave Y|2026-05-07/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is DIMENSIONLESS', () => {
      const r = validate(BE36_GW_SPEED_RATIO_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('RHS is DIMENSIONLESS', () => {
      const r = validate(BE36_GW_SPEED_RATIO_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE36_GW_SPEED_RATIO_LHS, BE36_GW_SPEED_RATIO_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE36Dimensions reports both sides as DIMENSIONLESS', () => {
      const r = validateBE36Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { c } = PhysicalConstants;

    it('GR limit: c_GW = c → ratio = 0 ≤ 10⁻¹⁵ (trivially)', () => {
      const r = evaluateGWSpeedRatio({ c_GW_m_per_s: c });
      expect(r).toBe(0);
      expect(satisfiesGW170817Bound({ c_GW_m_per_s: c })).toBe(true);
    });

    it('GW170817 bound constant is 10⁻¹⁵', () => {
      expect(GW170817_SPEED_BOUND).toBe(1e-15);
    });

    it('within bound: c_GW = c·(1 + 5×10⁻¹⁶) is well inside the bound', () => {
      const c_GW = c * (1 + 5e-16);
      expect(satisfiesGW170817Bound({ c_GW_m_per_s: c_GW })).toBe(true);
    });

    it('above bound: c_GW = c·(1 + 10⁻¹⁰) violates the bound', () => {
      const c_GW = c * (1 + 1e-10);
      expect(satisfiesGW170817Bound({ c_GW_m_per_s: c_GW })).toBe(false);
    });

    it('below speed of light by 10⁻¹⁰ also violates (signed-symmetric bound)', () => {
      const c_GW = c * (1 - 1e-10);
      const r = evaluateGWSpeedRatio({ c_GW_m_per_s: c_GW });
      expect(r).toBeLessThan(0);
      expect(satisfiesGW170817Bound({ c_GW_m_per_s: c_GW })).toBe(false);
    });

    it('linearity at small Δ: ratio ≈ (c_GW - c) / c', () => {
      const delta = 1; // 1 m/s deviation
      const r = evaluateGWSpeedRatio({ c_GW_m_per_s: c + delta });
      // Match within FP precision (~1e-16 relative)
      expect(r).toBeCloseTo(delta / c, 12);
    });

    it('positive deviation: c_GW > c gives positive ratio', () => {
      const r = evaluateGWSpeedRatio({ c_GW_m_per_s: c * 1.01 });
      expect(r).toBeCloseTo(0.01, 14);
    });

    it('negative deviation: c_GW < c gives negative ratio', () => {
      const r = evaluateGWSpeedRatio({ c_GW_m_per_s: c * 0.99 });
      expect(r).toBeCloseTo(-0.01, 14);
    });
  });

  describe('Input validation', () => {
    it('rejects non-positive c_GW', () => {
      expect(() => evaluateGWSpeedRatio({ c_GW_m_per_s: 0 })).toThrow(RangeError);
      expect(() => evaluateGWSpeedRatio({ c_GW_m_per_s: -1 })).toThrow(RangeError);
    });

    it('rejects non-finite c_GW', () => {
      expect(() =>
        evaluateGWSpeedRatio({ c_GW_m_per_s: Number.NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateGWSpeedRatio({ c_GW_m_per_s: Number.POSITIVE_INFINITY }),
      ).toThrow(RangeError);
    });
  });
});
