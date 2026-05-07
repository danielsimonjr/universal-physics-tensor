/**
 * Tier-5 AST encoding test for BE-20 — observed cosmological-constant
 * mass density (canonical FRW form, post Wave Y reformulation).
 *
 * Formula: ρ_Λ = c² Λ / (8π G).
 *
 * @see src/bridges/equations/be-20-vacuum-energy.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE20_VACUUM_ENERGY_RHS,
  BE20_VACUUM_ENERGY_LHS,
  MASS_DENSITY,
  evaluateCosmologicalConstantDensity,
  validateBE20Dimensions,
} from '../../src/bridges/equations/be-20-vacuum-energy.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

describe('BE-20 observed cosmological-constant mass density — Tier 5 AST encoding', () => {
  const be20 = BRIDGE_EQUATIONS.find((e) => e.id === 20);

  describe('Catalog round-trip', () => {
    it('exists', () => {
      expect(be20).toBeDefined();
    });

    it("dimensional_signature is '[L^-3 M]' (mass density)", () => {
      expect(be20!.dimensional_signature).toBe('[L^-3 M]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE20_VACUUM_ENERGY_RHS).inferredDimension;
      expect(inferredDim).not.toBeNull();
      expect(format(inferredDim!)).toBe(be20!.dimensional_signature);
    });

    it("status pinned 'speculative' (bridge framing speculative)", () => {
      expect(be20!.status).toBe('speculative');
    });

    it('formula_latex contains the canonical ρ_Λ = c²Λ/(8πG) form', () => {
      expect(be20!.formula_latex).toMatch(/\\rho_\{?\\Lambda\}?/);
      expect(be20!.formula_latex).toMatch(/c\^2/);
      expect(be20!.formula_latex).toMatch(/\\Lambda/);
      expect(be20!.formula_latex).toMatch(/8\\pi G/);
    });

    it('formula_latex no longer carries the divergent ∫d³k vacuum-fluctuation integral', () => {
      const f = be20!.formula_latex;
      expect(f).not.toMatch(/\\int d\^3k/);
      expect(f).not.toMatch(/\\hbar\\omega_k/);
      expect(f).not.toMatch(/k_\{?\\text\{UV\}\}?/);
    });

    it('references include canonical Carroll 2001 + Planck 2020', () => {
      const refs = be20!.references.join(' | ');
      expect(refs).toMatch(/Carroll 2001/);
      expect(refs).toMatch(/Planck/);
    });

    it('notes mention Wave Y reformulation', () => {
      expect(be20!.notes).toMatch(/Wave Y/);
      expect(be20!.notes).toMatch(/2026-05-07/);
    });

    it('known_issues preserves the cosmological-constant problem framing', () => {
      const desc = be20!.known_issues.map((i) => i.description).join(' | ');
      // Matches "10^120", "10¹²⁰", or any concatenation of the digits "120".
      // The Unicode superscripts ¹²⁰ are encoded inline in the index.ts
      // description; we accept either ASCII or Unicode form.
      expect(desc).toMatch(/cosmological-constant problem/);
      expect(desc).toMatch(/10[¹²⁰\^0-9]+|discrepancy/);
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [L^-3 M]', () => {
      const r = validate(BE20_VACUUM_ENERGY_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(MASS_DENSITY);
    });

    it('RHS is [L^-3 M]', () => {
      const r = validate(BE20_VACUUM_ENERGY_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(MASS_DENSITY);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE20_VACUUM_ENERGY_LHS, BE20_VACUUM_ENERGY_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE20Dimensions reports both sides as MASS_DENSITY', () => {
      const r = validateBE20Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(MASS_DENSITY);
      expect(r.rhsDim).toEqual(MASS_DENSITY);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { c, G } = PhysicalConstants;

    it('default Λ (Planck 2018) gives ρ_Λ ≈ 5-6×10⁻²⁷ kg/m³', () => {
      // With Λ = 1.1e-52 m⁻², ρ_Λ = c²·Λ/(8πG) ≈ 5.9e-27 kg/m³.
      // Literature commonly cites ~5.4e-27 with Λ ≈ 1.0e-52; both fall
      // in the same order of magnitude.
      const rho = evaluateCosmologicalConstantDensity();
      expect(rho).toBeGreaterThan(5.0e-27);
      expect(rho).toBeLessThan(7.0e-27);
    });

    it('Λ = 0 gives ρ_Λ = 0 (no cosmological constant)', () => {
      const rho = evaluateCosmologicalConstantDensity({ Lambda_per_m2: 0 });
      expect(rho).toBe(0);
    });

    it('linearity in Λ: ρ(2Λ) = 2 ρ(Λ)', () => {
      const r1 = evaluateCosmologicalConstantDensity({ Lambda_per_m2: 1e-52 });
      const r2 = evaluateCosmologicalConstantDensity({ Lambda_per_m2: 2e-52 });
      expect(r2 / r1).toBeCloseTo(2, 14);
    });

    it('linearity for arbitrary Λ-factor', () => {
      const ref = evaluateCosmologicalConstantDensity({ Lambda_per_m2: 1e-52 });
      for (const alpha of [0.1, 5, 100, 1e6]) {
        const r_alpha = evaluateCosmologicalConstantDensity({
          Lambda_per_m2: alpha * 1e-52,
        });
        expect(r_alpha / ref).toBeCloseTo(alpha, 6);
      }
    });

    it('algebraic identity: ρ_Λ = c²Λ/(8πG)', () => {
      const Lambda = 1.5e-52;
      const rho = evaluateCosmologicalConstantDensity({ Lambda_per_m2: Lambda });
      const expected = (c * c * Lambda) / (8 * Math.PI * G);
      expect(rho).toBeCloseTo(expected, 25);
    });

    it('positivity for any positive Λ', () => {
      for (const Lam of [1e-60, 1e-52, 1e-40, 1.0]) {
        const r = evaluateCosmologicalConstantDensity({ Lambda_per_m2: Lam });
        expect(r).toBeGreaterThan(0);
        expect(Number.isFinite(r)).toBe(true);
      }
    });

    it('energy-density alternate: ρ_Λc² with default Λ ≈ 7×10⁻¹⁰ J/m³', () => {
      const rho_kg = evaluateCosmologicalConstantDensity();
      const rho_J = rho_kg * c * c;
      // Should be in the textbook 4-9 × 10^-10 J/m³ range.
      expect(rho_J).toBeGreaterThan(4e-10);
      expect(rho_J).toBeLessThan(9e-10);
    });
  });

  describe('Input validation', () => {
    it('rejects negative Λ', () => {
      expect(() =>
        evaluateCosmologicalConstantDensity({ Lambda_per_m2: -1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite Λ', () => {
      expect(() =>
        evaluateCosmologicalConstantDensity({ Lambda_per_m2: Number.NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateCosmologicalConstantDensity({
          Lambda_per_m2: Number.POSITIVE_INFINITY,
        }),
      ).toThrow(RangeError);
    });
  });
});
