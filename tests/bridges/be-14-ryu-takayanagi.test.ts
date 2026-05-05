/**
 * Tests for Bridge Equation 14: Ryu-Takayanagi entropy formula.
 *
 *   S = k_B c^3 Area(γ) / (4 G_N ℏ)        [SI]
 *   S = Area(γ) / (4 G_N ℏ)                 [natural units, k_B = 1]
 *
 * Reference: Ryu, S. & Takayanagi, T. (2006), arXiv:hep-th/0603001.
 *
 * Honest-claude policy: every numerical "expected" value here is either
 *   (a) trivially derivable from the formula itself (linearity, A=0), or
 *   (b) computed from CODATA fundamental constants and a published
 *       astrophysical input (solar-mass Schwarzschild radius), with the
 *       computation shown in-comment so the reader can audit it.
 * No "magic" reference numbers are used.
 */

import { describe, it, expect } from 'vitest';
import {
  RYU_TAKAYANAGI_RHS,
  evaluateRyuTakayanagi,
  evaluateRyuTakayanagiNatural,
  validateRyuTakayanagiDimensions,
} from '../../src/bridges/equations/be-14-ryu-takayanagi.js';
import { ENTROPY } from '../../src/dimensional/types.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

describe('Bridge Equation 14 — Ryu-Takayanagi (Quantum Error Correction Holographic Mapping)', () => {
  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(RYU_TAKAYANAGI_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers SI dimension [entropy] = M L^2 T^-2 Theta^-1', () => {
      const r = validate(RYU_TAKAYANAGI_RHS);
      expect(r.inferredDimension).toEqual(ENTROPY);
    });

    it('validateRyuTakayanagiDimensions reports ok with both sides in [entropy]', () => {
      const v = validateRyuTakayanagiDimensions();
      expect(v.ok).toBe(true);
      expect(v.lhsDim).toEqual(ENTROPY);
      expect(v.rhsDim).toEqual(ENTROPY);
    });

    it('bridge index entry for BE-14 has dimensional_signature consistent with the AST', () => {
      const be14 = BRIDGE_EQUATIONS.find((b) => b.id === 14);
      expect(be14).toBeDefined();
      const inferred = validate(RYU_TAKAYANAGI_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be14!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation (SI)', () => {
    it('A = 0 yields S = 0 (trivial limit)', () => {
      expect(evaluateRyuTakayanagi({ area_m2: 0 })).toBe(0);
    });

    it('S(2A) = 2 S(A) (linearity)', () => {
      const A = 1.0e10;
      const sA = evaluateRyuTakayanagi({ area_m2: A });
      const s2A = evaluateRyuTakayanagi({ area_m2: 2 * A });
      // Linearity is exact in floating point (single multiply), but allow tiny ulp.
      expect(s2A / sA).toBeCloseTo(2.0, 12);
    });

    it('Schwarzschild solar-mass black hole entropy ~ 1.45e54 J/K', () => {
      // Derive from CODATA constants + IAU 2015 nominal solar mass.
      // M_sun = 1.98892e30 kg (IAU 2015 nominal solar mass parameter
      // GM_sun = 1.3271244e20 m^3/s^2 → M_sun = GM/G ≈ 1.989e30 kg).
      const M_sun = 1.98892e30;
      const { c, G } = PhysicalConstants;
      const r_s = (2 * G * M_sun) / (c * c); // ≈ 2952 m
      const A = 4 * Math.PI * r_s * r_s;     // ≈ 1.095e8 m^2

      const S = evaluateRyuTakayanagi({ area_m2: A });

      // Independently computed reference using the formula directly:
      //   S_ref = k_B c^3 A / (4 G ℏ)
      //   ≈ (1.381e-23)(2.694e25)(1.095e8) / (4 · 6.674e-11 · 1.055e-34)
      //   ≈ 4.073e10 / 2.815e-44
      //   ≈ 1.447e54 J/K
      // Carroll, "Spacetime and Geometry", §6.6 (Bekenstein-Hawking entropy)
      // gives S_BH ~ 10^54 J/K for a solar-mass black hole; our 1.45e54
      // is within an order of magnitude of that textbook estimate.
      expect(S).toBeGreaterThan(1.3e54);
      expect(S).toBeLessThan(1.6e54);

      // Cross-check: the value should be within ±2% of the in-test reference.
      const S_ref =
        (PhysicalConstants.kB * c * c * c * A) /
        (4 * G * PhysicalConstants.hbar);
      expect(Math.abs(S - S_ref) / S_ref).toBeLessThan(0.02);
    });

    it('Planck-area patch yields S = k_B / 4 ≈ 3.45e-24 J/K', () => {
      // For A = ℓ_P^2, S = k_B c^3 ℓ_P^2 / (4 G ℏ).
      // Using ℓ_P^2 = ℏ G / c^3, this reduces to k_B / 4.
      const lP2 = PhysicalConstants.lP * PhysicalConstants.lP;
      const S = evaluateRyuTakayanagi({ area_m2: lP2 });
      const expected = PhysicalConstants.kB / 4;
      // Tolerance accounts for the small CODATA roundoff in ℓ_P vs (ℏG/c^3)^(1/2).
      expect(S).toBeGreaterThan(0.99 * expected);
      expect(S).toBeLessThan(1.01 * expected);
    });
  });

  describe('natural-units cross-check', () => {
    it('S_natural(A_in_planck_areas) = A / 4 (dimensionless)', () => {
      // In natural units (G = ℏ = c = k_B = 1), S = A / 4 with A measured
      // in Planck areas.
      expect(evaluateRyuTakayanagiNatural({ area_planck: 0 })).toBe(0);
      expect(evaluateRyuTakayanagiNatural({ area_planck: 4 })).toBe(1);
      expect(evaluateRyuTakayanagiNatural({ area_planck: 12 })).toBe(3);
    });

    it('SI evaluation agrees with natural-unit form when k_B is stripped', () => {
      // For an arbitrary area A (m^2), the dimensionless entropy is
      //   S/k_B = c^3 A / (4 G ℏ) = A / (4 ℓ_P^2)   [exact identity]
      // because ℓ_P^2 = ℏG/c^3.
      // Equivalently: S_natural(A / ℓ_P^2) = S_SI(A) / k_B.
      const A = 7.3e9;
      const A_planck = A / (PhysicalConstants.lP * PhysicalConstants.lP);
      const S_si_dimless = evaluateRyuTakayanagi({ area_m2: A }) / PhysicalConstants.kB;
      const S_natural = evaluateRyuTakayanagiNatural({ area_planck: A_planck });
      // Match to within ~10^-4 (set by CODATA roundoff in lP vs ℏ,G,c).
      expect(Math.abs(S_si_dimless - S_natural) / S_natural).toBeLessThan(1e-4);
    });
  });
});
