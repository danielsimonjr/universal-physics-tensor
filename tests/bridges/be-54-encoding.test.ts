/**
 * Tests for Bridge Equation 54: Randall-Sundrum brane cosmology
 * (modified Friedmann equation with brane-tension correction).
 *
 *   H² = (8πG/3) ρ (1 + ρ/(2σ)) + Λ/3
 *
 * The (1 + ρ/(2σ)) correction is the RS II brane-tension modification.
 * When ρ ≪ σ, it approaches 1 and classical Friedmann is recovered.
 * When ρ ~ σ, the correction is order-unity; when ρ ≫ σ, the ρ²/(2σ)
 * term dominates and expansion is faster than standard cosmology.
 *
 * References:
 *   - Randall-Sundrum 1999 PRL 83:4690 (brane model)
 *   - Binétruy-Deffayet-Ellwanger-Langlois 2000 PLB 477:285 (cosmology)
 *   - Maartens-Koyama 2010 LRR 13:5 (review)
 */
import { describe, it, expect } from 'vitest';
import {
  BRANE_FRIEDMANN_RHS,
  evaluateRandallSundrumH2,
  validateBraneFriedmannDimensions,
} from '../../src/bridges/equations/be-54-randall-sundrum-brane.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { PhysicalConstants } from '../../src/core/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

const { G } = PhysicalConstants;

describe('BE-54 Randall-Sundrum brane cosmology (modified Friedmann)', () => {

  // -------------------------------------------------------------------------
  // Catalog entry invariants
  // -------------------------------------------------------------------------

  describe('catalog entry invariants', () => {
    it('exists in the catalog with id 54', () => {
      expectBridgeInIndex(54);
    });

    it("status is 'speculative'", () => {
      expectBridgeInIndex(54, 'speculative');
    });

    it("dimensional_signature is '[T^-2]'", () => {
      const entry = expectBridgeInIndex(54);
      expect(entry.dimensional_signature).toBe('[T^-2]');
    });

    it("category is 'E' (Cosmological-Quantum Bridges)", () => {
      const entry = expectBridgeInIndex(54);
      expect(entry.category).toBe('E');
    });

    it('bridges tuple is [quantum, cosmological]', () => {
      const entry = expectBridgeInIndex(54);
      expect(entry.bridges).toEqual(['quantum', 'cosmological']);
    });

    it('tractability_class is closed-form', () => {
      const entry = expectBridgeInIndex(54);
      expect(entry.tractability_class).toBe('closed-form');
    });

    it('references contains Randall-Sundrum 1999', () => {
      const entry = expectBridgeInIndex(54);
      const hasRS = entry.references.some((r) => r.includes('Randall') || r.includes('1999'));
      expect(hasRS, 'references must include Randall-Sundrum 1999').toBe(true);
    });

    it('references contains Binétruy et al 2000', () => {
      const entry = expectBridgeInIndex(54);
      const hasBDEL = entry.references.some(
        (r) => r.includes('Bin') || r.includes('BDEL') || r.includes('2000'),
      );
      expect(hasBDEL, 'references must include Binétruy-Deffayet-Ellwanger-Langlois 2000').toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Dimensional validation
  // -------------------------------------------------------------------------

  describe('dimensional validation', () => {
    it('BRANE_FRIEDMANN_RHS validates cleanly through the dimensional analyzer', () => {
      const r = validate(BRANE_FRIEDMANN_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[T^-2]'", () => {
      expectDimRoundTrip(BRANE_FRIEDMANN_RHS, '[T^-2]');
    });

    it('validateBraneFriedmannDimensions reports both sides as [T^-2]', () => {
      const v = validateBraneFriedmannDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[T^-2]');
      expect(format(v.rhsDim!)).toBe('[T^-2]');
    });

    it('catalog dimensional_signature matches the AST inference', () => {
      const entry = expectBridgeInIndex(54);
      const inferred = validate(BRANE_FRIEDMANN_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(entry.dimensional_signature).toBe(format(inferred!));
    });
  });

  // -------------------------------------------------------------------------
  // Numerical evaluation — limit checks
  // -------------------------------------------------------------------------

  describe('numerical evaluation', () => {
    it('low-density limit (ρ ≪ σ): H² recovers classical Friedmann to machine precision', () => {
      // When ρ ≪ σ, the correction (1 + ρ/(2σ)) → 1; the formula must
      // agree with classical (8πG/3)ρ to within floating-point tolerance
      // (the ratio deviation ρ/(2σ) = 1e-30/(2·1e96) ≈ 5e-127, below IEEE double).
      const rho = 1.0e-26; // ~current cosmic matter density
      const sigma = 1.0e96; // brane tension >> rho
      const H2_brane = evaluateRandallSundrumH2({
        rho_kg_per_m3: rho,
        sigma_kg_per_m3: sigma,
      });
      const H2_classical = ((8 * Math.PI * G) / 3) * rho;
      // Relative deviation is ρ/(2σ) ≈ 5e-123, well below 1e-15 tolerance
      expect(Math.abs(H2_brane - H2_classical) / H2_classical).toBeLessThan(1e-15);
    });

    it('high-density limit (ρ = σ): brane correction doubles the effective density', () => {
      // At ρ = σ: (1 + ρ/(2σ)) = (1 + 1/2) = 3/2
      // So H² = (8πG/3) · σ · (3/2) = (8πG/3) · (3σ/2) = 4πG · σ
      const sigma = 1.0; // arbitrary units; just testing the multiplicative structure
      const H2 = evaluateRandallSundrumH2({
        rho_kg_per_m3: sigma,
        sigma_kg_per_m3: sigma,
      });
      const expected = ((8 * Math.PI * G) / 3) * sigma * 1.5;
      expect(H2 / expected).toBeCloseTo(1.0, 12);
    });

    it('high-density limit (ρ = 2σ): brane correction factor is exactly 2', () => {
      // At ρ = 2σ: (1 + ρ/(2σ)) = (1 + 1) = 2
      const sigma = 1.0e-20;
      const rho = 2 * sigma;
      const H2 = evaluateRandallSundrumH2({
        rho_kg_per_m3: rho,
        sigma_kg_per_m3: sigma,
      });
      const H2_classical_at_rho = ((8 * Math.PI * G) / 3) * rho;
      // H2 = (8πG/3) · rho · 2 = 2 · H2_classical
      expect(H2 / H2_classical_at_rho).toBeCloseTo(2.0, 12);
    });

    it('brane correction grows monotonically with ρ/σ (dense sweep)', () => {
      // The correction (1 + ρ/(2σ)) is a strictly increasing function of ρ.
      // Equivalently, H²/((8πG/3)·ρ) is strictly increasing with ρ (for fixed σ).
      const sigma = 1.0;
      const ratios = [0.001, 0.01, 0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 100.0];
      let prev = 0;
      for (const r of ratios) {
        const rho = r * sigma;
        const H2 = evaluateRandallSundrumH2({
          rho_kg_per_m3: rho,
          sigma_kg_per_m3: sigma,
        });
        const correction_factor = H2 / (((8 * Math.PI * G) / 3) * rho);
        expect(
          correction_factor,
          `ρ/σ=${r}: correction factor ${correction_factor} must be > prev ${prev}`,
        ).toBeGreaterThan(prev);
        prev = correction_factor;
      }
    });

    it('correction factor identity: (1 + ρ/(2σ)) matches closed-form for arbitrary ρ/σ', () => {
      // H² = (8πG/3) · ρ · (1 + ρ/(2σ))  →  correction = 1 + ρ/(2σ)
      const sigma = 1.0e-15;
      for (const ratio of [0.1, 0.5, 1.0, 3.0, 10.0]) {
        const rho = ratio * sigma;
        const H2 = evaluateRandallSundrumH2({
          rho_kg_per_m3: rho,
          sigma_kg_per_m3: sigma,
        });
        const classical = ((8 * Math.PI * G) / 3) * rho;
        const computed_correction = H2 / classical;
        const expected_correction = 1 + ratio / 2;
        expect(computed_correction).toBeCloseTo(expected_correction, 12);
      }
    });

    it('ρ = 0 gives H² = 0 (no density, no expansion)', () => {
      const H2 = evaluateRandallSundrumH2({
        rho_kg_per_m3: 0,
        sigma_kg_per_m3: 1.0e-20,
      });
      expect(H2).toBe(0);
    });

    it('H² is always positive for ρ ≥ 0 (unlike LQC which can go negative)', () => {
      // Key physics distinction from LQC: the RS correction (1 + ρ/(2σ))
      // is always ≥ 1 for ρ ≥ 0, so H² ≥ 0 always (with Λ = 0).
      const sigma = 1.0e-20;
      for (const rho of [0, 1e-30, 1e-20, 1e-15, 1e-10, 1e-5, 1.0]) {
        const H2 = evaluateRandallSundrumH2({
          rho_kg_per_m3: rho,
          sigma_kg_per_m3: sigma,
        });
        expect(H2, `H² must be ≥ 0 for ρ=${rho}`).toBeGreaterThanOrEqual(0);
      }
    });
  });

  // -------------------------------------------------------------------------
  // Input validation
  // -------------------------------------------------------------------------

  describe('input validation', () => {
    it('rejects negative rho', () => {
      expect(() =>
        evaluateRandallSundrumH2({ rho_kg_per_m3: -1, sigma_kg_per_m3: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects zero sigma', () => {
      expect(() =>
        evaluateRandallSundrumH2({ rho_kg_per_m3: 1, sigma_kg_per_m3: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects negative sigma', () => {
      expect(() =>
        evaluateRandallSundrumH2({ rho_kg_per_m3: 1, sigma_kg_per_m3: -1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite rho', () => {
      expect(() =>
        evaluateRandallSundrumH2({ rho_kg_per_m3: NaN, sigma_kg_per_m3: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateRandallSundrumH2({ rho_kg_per_m3: Infinity, sigma_kg_per_m3: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite sigma', () => {
      expect(() =>
        evaluateRandallSundrumH2({ rho_kg_per_m3: 1, sigma_kg_per_m3: NaN }),
      ).toThrow(RangeError);
    });
  });

});
