/**
 * Tier-5 AST encoding test for BE-43 — ER=EPR wormhole-entropy bound
 * (canonical Bekenstein-Hawking applied to the Einstein-Rosen bridge
 * minimal cross-section, post Wave P-A R-A3 reformulation).
 *
 * Formula: S_entanglement = A_wormhole / (4 ℓ_P²)  [natural units]
 *   ≡  k_B · A_wormhole / (4 ℓ_P²)                  [SI form]
 *
 * Mirrors BE-14 Ryu-Takayanagi's SI convention: BE-14's
 * `dimensional_signature` is `[entropy]` (k_B c³ A / (4 G_N ℏ));
 * BE-43 here uses the equivalent k_B · A / (4 ℓ_P²) form (since
 * ℓ_P² = ℏ G/c³, the prefactor c³/(G ℏ) reduces to 1/ℓ_P²).
 *
 * Status pin: 'speculative' (Bekenstein-Hawking bound canonical;
 * UPT ER=EPR-equivalence framing extension speculative).
 *
 * @see src/bridges/equations/be-43-er-epr.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 43")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 43)
 */

import { describe, it, expect } from 'vitest';
import {
  BE43_ER_EPR_RHS,
  BE43_ER_EPR_LHS,
  evaluateEREPRBound,
  validateBE43Dimensions,
} from '../../src/bridges/equations/be-43-er-epr.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { ENTROPY } from '../../src/dimensional/types.js';
import { PhysicalConstants } from '../../src/core/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-43 ER=EPR wormhole-entropy bound — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    it('exists', () => {
      expectBridgeInIndex(43);
    });

    it('dimensional_signature is [entropy] (round-trips through validator, mirrors BE-14)', () => {
      const be43 = expectBridgeInIndex(43);
      expect(be43.dimensional_signature).toBe('[entropy]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      expectDimRoundTrip(BE43_ER_EPR_RHS, '[entropy]');
    });

    it("status pinned 'speculative' (canonical BH bound, ER=EPR framing speculative)", () => {
      expectBridgeInIndex(43, 'speculative');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [entropy]', () => {
      const r = validate(BE43_ER_EPR_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENTROPY);
    });

    it('RHS is [entropy]', () => {
      const r = validate(BE43_ER_EPR_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(ENTROPY);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE43_ER_EPR_LHS, BE43_ER_EPR_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE43Dimensions reports both sides as [entropy]', () => {
      const r = validateBE43Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(ENTROPY);
      expect(r.rhsDim).toEqual(ENTROPY);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { kB, c, G, hbar } = PhysicalConstants;
    // Planck length squared: ℓ_P² = ℏ G / c³
    const lP_sq = (hbar * G) / (c * c * c);

    it('linearity: S(2A) = 2·S(A)', () => {
      const A = 1e-20;
      const S1 = evaluateEREPRBound({ area_m2: A });
      const S2 = evaluateEREPRBound({ area_m2: 2 * A });
      expect(S2 / S1).toBeCloseTo(2, 14);
    });

    it('linearity: S(α·A) = α·S(A) for arbitrary α', () => {
      const A_ref = 1e-30;
      const S_ref = evaluateEREPRBound({ area_m2: A_ref });
      for (const alpha of [0.5, 3, 7, 100, 1e6]) {
        const S_alpha = evaluateEREPRBound({ area_m2: alpha * A_ref });
        expect(S_alpha / S_ref).toBeCloseTo(alpha, 12);
      }
    });

    it('S(0) = 0 (vanishing area gives vanishing entropy)', () => {
      const S = evaluateEREPRBound({ area_m2: 0 });
      expect(S).toBe(0);
    });

    it('solar-mass black hole: A = 4π r_s² with r_s ≈ 2950 m gives S ~ 10⁵⁵ J/K', () => {
      // Schwarzschild radius for a 1 M_sun = 1.989e30 kg black hole:
      // r_s = 2 G M / c² ≈ 2 · 6.674e-11 · 1.989e30 / (3e8)² ≈ 2950 m
      // Horizon area: A = 4π r_s² ≈ 4π · 2950² ≈ 1.094e8 m²
      // S = k_B A / (4 ℓ_P²) where ℓ_P² ≈ 2.612e-70 m²
      // S ≈ 1.381e-23 · 1.094e8 / (4 · 2.612e-70) ≈ 1.45e54 J/K
      // (Bekenstein-Hawking textbook value: ~1.5e54 J/K for solar-mass BH.)
      const M_sun = 1.989e30;
      const r_s = (2 * G * M_sun) / (c * c);
      const A = 4 * Math.PI * r_s * r_s;
      const S = evaluateEREPRBound({ area_m2: A });
      // Should be in the 10^54 to 10^55 J/K range — textbook BH entropy.
      expect(S).toBeGreaterThan(1e54);
      expect(S).toBeLessThan(1e55);
    });

    it('agrees with BE-14 Ryu-Takayanagi SI form k_B c³ A/(4 G ℏ) at the same area', () => {
      // BE-43's k_B A/(4 ℓ_P²) and BE-14's k_B c³ A/(4 G ℏ) are equivalent
      // since ℓ_P² = ℏG/c³. Cross-check numerically.
      const A = 1e-20;
      const S_43 = evaluateEREPRBound({ area_m2: A });
      const S_14 = (kB * c * c * c * A) / (4 * G * hbar);
      // Should agree to within CODATA roundoff (~1e-12 relative).
      expect(S_43 / S_14).toBeCloseTo(1, 6);
    });

    it('hand-computed: S(A) = k_B A / (4 ℓ_P²)', () => {
      const A = 1e-25;
      const expected = (kB * A) / (4 * lP_sq);
      const got = evaluateEREPRBound({ area_m2: A });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('Planck-area unit: A = ℓ_P² gives S = k_B/4', () => {
      // Sanity check: a Planck-area cross-section corresponds to S = k_B/4
      // — one quarter Boltzmann-constant of entropy.
      const S = evaluateEREPRBound({ area_m2: lP_sq });
      expect(S).toBeCloseTo(kB / 4, 28);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite area', () => {
      expect(() =>
        evaluateEREPRBound({ area_m2: NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateEREPRBound({ area_m2: Infinity }),
      ).toThrow(RangeError);
    });

    it('rejects negative area', () => {
      expect(() =>
        evaluateEREPRBound({ area_m2: -1 }),
      ).toThrow(RangeError);
    });

    it('accepts zero area (S(0) = 0)', () => {
      expect(() =>
        evaluateEREPRBound({ area_m2: 0 }),
      ).not.toThrow();
    });
  });
});
