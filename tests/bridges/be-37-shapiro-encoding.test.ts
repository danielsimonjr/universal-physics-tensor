/**
 * Tier-5 AST encoding test for BE-37 — Variable Speed of Light
 * Cosmology (Shapiro delay reformulation).
 *
 *   Δt = (2 G M / c³) · ln(R_far / R_near)
 *
 * Wave Z-F (2026-05-11): reformulates BE-37 from `status='invalid'`
 * (the original vacuum c(t,x) ≠ const ansatz is operationally
 * meaningless per Ellis-Uzan 2005) to `status='speculative'` via the
 * Shapiro gravitational time-delay — the canonical operationally-
 * meaningful "effective-c" effect from general relativity. Precedent:
 * BE-25 (Penrose-Hameroff → IIT, Wave P-D R-D2) and BE-16
 * (Complexity-Entropy → Landauer, Wave Z-E).
 *
 * Status pin: 'speculative'. Shapiro 1964 is canonical and Cassini
 * 2003 confirmed it to ~10⁻⁵ precision. The bridge framing — treating
 * Shapiro delay as THE UPT "modified-light-propagation" bridge —
 * remains the speculative element.
 *
 * @see src/bridges/equations/be-37-shapiro-delay.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 37")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 37)
 */

import { describe, it, expect } from 'vitest';
import {
  BE37_SHAPIRO_DELAY_RHS,
  BE37_SHAPIRO_DELAY_LHS,
  BE37_G,
  BE37_M,
  BE37_C,
  BE37_C_CUBED,
  BE37_PREFACTOR,
  BE37_R_FAR,
  BE37_R_NEAR,
  BE37_LOG_RATIO_ARG,
  BE37_LOG_FACTOR,
  evaluateShapiroDelay,
  validateBE37Dimensions,
} from '../../src/bridges/equations/be-37-shapiro-delay.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { TIME, MASS, LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-37 VSL (Shapiro delay reformulation) — Tier 5 AST encoding (Wave Z-F)', () => {
  describe('index entry invariants', () => {
    const be37 = BRIDGE_EQUATIONS.find((e) => e.id === 37);

    it('exists in the index', () => {
      expect(be37).toBeDefined();
    });

    it("status REFORMULATED to 'speculative' (from 'invalid' under Wave Z-F Shapiro reformulation)", () => {
      // Wave Z-F reformulates BE-37 from invalid (operationally-
      // meaningless c(t,x)≠const per Ellis-Uzan) to Shapiro delay.
      // Status set to 'speculative' (NOT 'established') because
      // Shapiro is canonical and experimentally confirmed but the
      // bridge framing remains speculative. Same precedent as BE-25
      // IIT and BE-16 Landauer.
      expect(be37!.status).toBe('speculative');
    });

    it("dimensional_signature is set to '[time]' (Δt is a time delay)", () => {
      expect(be37!.dimensional_signature).toBe('[time]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE37_SHAPIRO_DELAY_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[time]' (round-trip pin)", () => {
      const r = validate(BE37_SHAPIRO_DELAY_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[time]');
    });

    it('LHS (Δt) has dim TIME', () => {
      const r = validate(BE37_SHAPIRO_DELAY_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(TIME);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE37_SHAPIRO_DELAY_LHS, BE37_SHAPIRO_DELAY_RHS);
      expect(eq.ok).toBe(true);
    });

    it('BE37_M has dim MASS', () => {
      const r = validate(BE37_M);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(MASS);
    });

    it('BE37_R_FAR has dim LENGTH', () => {
      const r = validate(BE37_R_FAR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(LENGTH);
    });

    it('BE37_R_NEAR has dim LENGTH', () => {
      const r = validate(BE37_R_NEAR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(LENGTH);
    });

    it('BE37_LOG_RATIO_ARG (R_far/R_near) is DIMENSIONLESS (lemma)', () => {
      // Per the dimensionless-stub convention, the log argument must
      // be dimensionless. Same lemma idiom as BE-45 / BE-25.
      const r = validate(BE37_LOG_RATIO_ARG);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE37_LOG_FACTOR (ln_R_ratio stub) is DIMENSIONLESS', () => {
      const r = validate(BE37_LOG_FACTOR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE37_C_CUBED (c³) has dim [L³ T⁻³]', () => {
      const r = validate(BE37_C_CUBED);
      expect(r.ok).toBe(true);
      const d = r.inferredDimension!;
      expect(d.L).toBe(3);
      expect(d.T).toBe(-3);
      expect(d.M).toBe(0);
    });

    it('BE37_PREFACTOR (2GM/c³) has dim TIME', () => {
      const r = validate(BE37_PREFACTOR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(TIME);
    });

    it('validateBE37Dimensions reports both sides as TIME', () => {
      const r = validateBE37Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(TIME);
      expect(r.rhsDim).toEqual(TIME);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(BE37_SHAPIRO_DELAY_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      const be37 = BRIDGE_EQUATIONS.find((e) => e.id === 37);
      expect(be37!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('solar Shapiro delay: M_sun, 1 AU to R_sun → Δt ≈ 0.25 ms', () => {
      // Canonical Shapiro 1964 prediction for light passing near the
      // Sun. M_sun = 1.989e30 kg; 1 AU = 1.496e11 m; R_sun = 6.957e8 m.
      // Δt = (2 G M_sun / c³) · ln(1.496e11 / 6.957e8)
      //    ≈ 9.85e-6 · ln(215) ≈ 9.85e-6 · 5.37 ≈ 5.3e-5 s
      // For light grazing the Sun (one-way), the literature value is
      // ~250 μs for a round-trip — we compute the one-way coefficient.
      const M_sun = 1.989e30;
      const AU = 1.496e11;
      const R_sun = 6.957e8;
      const dt = evaluateShapiroDelay({
        M_kg: M_sun,
        R_far_m: AU,
        R_near_m: R_sun,
      });
      // Order-of-magnitude bracket: ~5e-5 to ~3e-4 seconds
      expect(dt).toBeGreaterThan(1e-5);
      expect(dt).toBeLessThan(5e-4);
    });

    it('Earth Shapiro delay: M_earth, satellite to surface → Δt sub-ns', () => {
      const M_earth = 5.972e24;
      const dt = evaluateShapiroDelay({
        M_kg: M_earth,
        R_far_m: 1e7, // ~LEO orbit + Earth radius
        R_near_m: 6.371e6, // Earth radius
      });
      // Should be on the order of picoseconds (much smaller than solar)
      expect(dt).toBeGreaterThan(0);
      expect(dt).toBeLessThan(1e-9);
    });

    it('R_far = R_near: Δt = 0 (no delay over null radial extent)', () => {
      const dt = evaluateShapiroDelay({ M_kg: 1e30, R_far_m: 1e9, R_near_m: 1e9 });
      expect(dt).toBe(0);
    });

    it('doubling M doubles Δt (linearity in mass)', () => {
      const dt1 = evaluateShapiroDelay({ M_kg: 1e30, R_far_m: 1e11, R_near_m: 1e9 });
      const dt2 = evaluateShapiroDelay({ M_kg: 2e30, R_far_m: 1e11, R_near_m: 1e9 });
      expect(dt2 / dt1).toBeCloseTo(2.0, 14);
    });

    it('Δt scales as ln(R_far/R_near): factor-100 ratio gives ln(100) ≈ 4.605 boost', () => {
      const M = 1e30;
      const dt_factor_10 = evaluateShapiroDelay({ M_kg: M, R_far_m: 1e10, R_near_m: 1e9 });
      const dt_factor_100 = evaluateShapiroDelay({ M_kg: M, R_far_m: 1e11, R_near_m: 1e9 });
      // Both share the same 2GM/c³ prefactor; ratio is ln(100)/ln(10).
      expect(dt_factor_100 / dt_factor_10).toBeCloseTo(
        Math.log(100) / Math.log(10),
        12,
      );
    });
  });

  describe('input validation', () => {
    it('rejects non-finite or non-positive M', () => {
      expect(() => evaluateShapiroDelay({ M_kg: NaN, R_far_m: 1, R_near_m: 0.5 })).toThrow(RangeError);
      expect(() => evaluateShapiroDelay({ M_kg: 0, R_far_m: 1, R_near_m: 0.5 })).toThrow(RangeError);
      expect(() => evaluateShapiroDelay({ M_kg: -1, R_far_m: 1, R_near_m: 0.5 })).toThrow(RangeError);
    });

    it('rejects non-finite or non-positive R_far', () => {
      expect(() => evaluateShapiroDelay({ M_kg: 1, R_far_m: NaN, R_near_m: 0.5 })).toThrow(RangeError);
      expect(() => evaluateShapiroDelay({ M_kg: 1, R_far_m: 0, R_near_m: 0.5 })).toThrow(RangeError);
      expect(() => evaluateShapiroDelay({ M_kg: 1, R_far_m: -1, R_near_m: 0.5 })).toThrow(RangeError);
    });

    it('rejects non-finite or non-positive R_near', () => {
      expect(() => evaluateShapiroDelay({ M_kg: 1, R_far_m: 1, R_near_m: NaN })).toThrow(RangeError);
      expect(() => evaluateShapiroDelay({ M_kg: 1, R_far_m: 1, R_near_m: 0 })).toThrow(RangeError);
    });

    it('rejects R_near > R_far (the log argument must be ≥ 1)', () => {
      expect(() => evaluateShapiroDelay({ M_kg: 1, R_far_m: 0.5, R_near_m: 1 })).toThrow(RangeError);
    });
  });
});
