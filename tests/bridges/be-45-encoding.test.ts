/**
 * Tier-5 AST encoding test for BE-45 — Trans-Planckian Censorship
 * Conjecture (TCC) bound on inflationary e-folds.
 *
 *   N_e_max = log(M_P/H_inf) - γ log(r/0.01)
 *
 * Encoded in natural units (M_P, H_inf both energies; ratio
 * dimensionless), following the convention TCC literature uses
 * throughout. Both log arguments are dimensionless, exposed as
 * separate ExprNode lemmas so the dimensionless-stub convention is
 * directly verifiable.
 *
 * Status pin: 'speculative' (γ-correction term and γ-coefficient O(1)
 * are framework-original; canonical Bedroya-Vafa form is just
 * `N_e < ln(M_P/H_inf)`).
 *
 * @see src/bridges/equations/be-45-tcc.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 45")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 45)
 */

import { describe, it, expect } from 'vitest';
import {
  BE45_TCC_RHS,
  BE45_TCC_LHS,
  BE45_LOG_RATIO_ARG_MP_HINF,
  BE45_LOG_RATIO_ARG_R,
  evaluateTCC,
  validateBE45Dimensions,
} from '../../src/bridges/equations/be-45-tcc.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-45 Trans-Planckian Censorship Conjecture — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(45);
    });

    it("dimensional_signature pinned to '[1]'", () => {
      const be45 = expectBridgeInIndex(45);
      expect(be45.dimensional_signature).toBe('[1]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE45_TCC_RHS, '[1]');
    });

    it("status pinned 'speculative'", () => {
      expectBridgeInIndex(45, 'speculative');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is dimensionless', () => {
      const r = validate(BE45_TCC_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('RHS is dimensionless', () => {
      const r = validate(BE45_TCC_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE45_TCC_LHS, BE45_TCC_RHS);
      expect(eq.ok).toBe(true);
    });

    it('M_P/H_inf log argument is dimensionless (natural-units convention)', () => {
      const r = validate(BE45_LOG_RATIO_ARG_MP_HINF);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('r/0.01 log argument is dimensionless', () => {
      const r = validate(BE45_LOG_RATIO_ARG_R);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('validateBE45Dimensions reports both sides as dimensionless', () => {
      const r = validateBE45Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    it('canonical TCC: M_P = 1.22e19 GeV, H_inf = 1e14 GeV (GUT-scale), r = 0.01, γ = 0 → N_e_max ≈ 11.7', () => {
      // log(1.22e19 / 1e14) = log(1.22e5) = ln(1.22e5) ≈ 11.71
      const N = evaluateTCC({
        M_P_GeV: 1.22e19,
        H_inf_GeV: 1e14,
        r: 0.01,
        gamma: 0,
      });
      expect(N).toBeCloseTo(Math.log(1.22e5), 12);
      expect(N).toBeGreaterThan(11);
      expect(N).toBeLessThan(12);
    });

    it('reference value r = 0.01: γ·log(r/0.01) = 0, so N_e_max = log(M_P/H_inf)', () => {
      // log(0.01 / 0.01) = 0
      const N = evaluateTCC({
        M_P_GeV: 1.22e19,
        H_inf_GeV: 1e14,
        r: 0.01,
        gamma: 1.0,
      });
      expect(N).toBeCloseTo(Math.log(1.22e19 / 1e14), 12);
    });

    it('N_e_max increases as M_P/H_inf increases (lower-energy inflation allows more e-folds)', () => {
      const a = evaluateTCC({ M_P_GeV: 1.22e19, H_inf_GeV: 1e14, r: 0.01, gamma: 1 });
      const b = evaluateTCC({ M_P_GeV: 1.22e19, H_inf_GeV: 1e10, r: 0.01, gamma: 1 });
      expect(b).toBeGreaterThan(a);
    });

    it('N_e_max decreases as γ·log(r/0.01) increases (larger r ⇒ stronger constraint)', () => {
      const lo_r = evaluateTCC({ M_P_GeV: 1.22e19, H_inf_GeV: 1e14, r: 0.01, gamma: 1 });
      const hi_r = evaluateTCC({ M_P_GeV: 1.22e19, H_inf_GeV: 1e14, r: 0.1, gamma: 1 });
      expect(hi_r).toBeLessThan(lo_r);
    });

    it('hand-computed: M_P/H_inf = e (natural log), r = 0.01, γ = 0 → N = 1', () => {
      // log(e / 1) = 1; γ·log(0.01/0.01) = 0 → N = 1
      const N = evaluateTCC({
        M_P_GeV: Math.E,
        H_inf_GeV: 1.0,
        r: 0.01,
        gamma: 0,
      });
      expect(N).toBeCloseTo(1.0, 14);
    });

    it('linear in γ at fixed (M_P, H_inf, r): N(γ=2) - log(M_P/H_inf) = 2·(N(γ=1) - log(M_P/H_inf))', () => {
      const M_P = 1.22e19;
      const H = 1e14;
      const r = 0.1; // not 0.01 so the gamma term is non-zero
      const base = Math.log(M_P / H);
      const N1 = evaluateTCC({ M_P_GeV: M_P, H_inf_GeV: H, r, gamma: 1 });
      const N2 = evaluateTCC({ M_P_GeV: M_P, H_inf_GeV: H, r, gamma: 2 });
      expect((N2 - base) / (N1 - base)).toBeCloseTo(2, 12);
    });

    it('Bedroya-Vafa N_e < 137 Solar System bound', () => {
      // Physics anchor (Task 17, v0.5.0 Phase 3e): the often-cited
      // "N_e < 137" upper bound on observable inflationary e-folds is
      // the canonical Bedroya-Vafa 2019 (arXiv:1909.11063) bound
      // `N_e < ln(M_P/H_inf)` evaluated at the LOWEST physically
      // meaningful H_inf scale — the present-epoch Hubble parameter,
      // which corresponds to the dynamical scale of Solar-System and
      // larger structure today (H_0 ≈ 1.4e-42 GeV in natural units,
      // i.e. the H that the trans-Planckian modes have to redshift
      // through to become observable).
      //
      // ln(M_P / H_0) = ln(1.22e19 / 1.4e-42) = ln(8.7e60) ≈ 140
      //
      // The literature variously cites "≈ 137" (Bedroya-Vafa 2019),
      // "≈ 140" (Bedroya-Brandenberger-Loverde-Vafa 2020 *Phys. Rev.
      // D* 101:103502), and "ln(M_P/H_0) ≈ 60-140" depending on
      // which low-energy cutoff is used. We assert the upper-bound
      // window N_e ∈ [60, 145] which covers the entire published
      // range and verifies the dimensional / log-scale physics — NOT
      // a precise pin (Bedroya-Vafa's "137" itself is an
      // order-of-magnitude statement, not a precise constant).
      //
      // Set γ = 0 (no framework-original correction; canonical
      // Bedroya-Vafa form): N_e_max = ln(M_P/H_inf).
      // r = 0.01 (reference value; γ-term contributes 0 even if
      // γ ≠ 0 at this r).
      const N_solar_system = evaluateTCC({
        M_P_GeV: 1.22e19,
        H_inf_GeV: 1.4e-42, // present-epoch Hubble in natural units (~Solar-System dynamical scale)
        r: 0.01,
        gamma: 0,
      });
      // Sanity: ln(1.22e19 / 1.4e-42) = ln(8.71e60) ≈ 140
      expect(N_solar_system).toBeGreaterThan(60);
      expect(N_solar_system).toBeLessThan(145);
      // Tighter check on the canonical Bedroya-Vafa value: within
      // ±5 e-folds of 140 (the canonical published estimate).
      expect(Math.abs(N_solar_system - 140)).toBeLessThan(5);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-positive M_P', () => {
      expect(() =>
        evaluateTCC({ M_P_GeV: 0, H_inf_GeV: 1e14, r: 0.01, gamma: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive H_inf', () => {
      expect(() =>
        evaluateTCC({ M_P_GeV: 1.22e19, H_inf_GeV: 0, r: 0.01, gamma: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive r', () => {
      expect(() =>
        evaluateTCC({ M_P_GeV: 1.22e19, H_inf_GeV: 1e14, r: 0, gamma: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite gamma', () => {
      expect(() =>
        evaluateTCC({ M_P_GeV: 1.22e19, H_inf_GeV: 1e14, r: 0.01, gamma: NaN }),
      ).toThrow(RangeError);
    });
  });
});
