/**
 * Tier-5 AST encoding test for BE-17 — Einstein-Cartan torsion-spin
 * coupling (squared-invariant scalar reduction).
 *
 *   S²_spin = (c⁴/(8πG))² · T_λμν T^λμν
 *
 * Original BE-17 is the FULL Einstein-Cartan field equations
 * (Einstein equation R_μν − (1/2)R g_μν + Λ g_μν = (8πG/c⁴) T_μν plus
 * algebraic torsion-spin coupling T^λ_μν = (8πG/c⁴) S^λ_μν), which
 * involve operator-valued tensors (Ricci, Einstein, rank-3 torsion)
 * that the UPT AST grammar (`symbol | op (* / + - ^) | integral |
 * derivative`) cannot directly express. Wave Z-C applies OpenAI's
 * scalar reduction: contract both sides of the torsion-spin equation
 * with its dual to obtain a scalar invariant, which IS encodable.
 *
 * Status pin: 'speculative'. The bridge-framing of EC as a cross-
 * categorical bridge in UPT's catalog is the speculative element;
 * pinning a Tier-5 squared-invariant AST does NOT promote the framing.
 *
 * @see src/bridges/equations/be-17-einstein-cartan.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 17")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 17)
 */

import { describe, it, expect } from 'vitest';
import {
  BE17_SPIN_DENSITY_SQUARED_RHS,
  BE17_SPIN_DENSITY_SQUARED_LHS,
  BE17_COUPLING_PREFACTOR_SQUARED,
  BE17_TORSION_CONTRACTION,
  evaluateBE17SpinDensitySquared,
  validateBE17Dimensions,
} from '../../src/bridges/equations/be-17-einstein-cartan.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { Dimension } from '../../src/dimensional/types.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

/** Expected dim of S²_spin = (c⁴/(8πG))² · T_λμν T^λμν: [M²·L⁻²·T⁻²]. */
const SPIN_DENSITY_SQUARED: Dimension = {
  L: -2, M: 2, T: -2, I: 0, Theta: 0, N: 0, J: 0,
};

/** Expected dim of the contraction T_λμν T^λμν: [T²·L⁻⁴]. */
const TORSION_SQUARED: Dimension = {
  L: -4, M: 0, T: 2, I: 0, Theta: 0, N: 0, J: 0,
};

/** Expected dim of (c⁴/(8πG))²: [M²·L²·T⁻⁴]. */
const COUPLING_PREFACTOR_SQUARED: Dimension = {
  L: 2, M: 2, T: -4, I: 0, Theta: 0, N: 0, J: 0,
};

/** Formatted string the validator emits for [M²·L⁻²·T⁻²]. */
const EXPECTED_SIGNATURE = format(SPIN_DENSITY_SQUARED);

describe('BE-17 Einstein-Cartan torsion-spin (squared-invariant reduction) — Tier 5 AST encoding', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expectBridgeInIndex(17);
    });

    it("status pinned 'speculative' (encoding does NOT promote)", () => {
      // The EC equations themselves are canonical (Cartan 1922; Hehl-
      // vonderHeyde-Kerlick-Nester 1976); the bridge-framing of EC as
      // a cross-categorical bridge in UPT's catalog is the speculative
      // element. Promoting 'speculative' → 'established' requires
      // deleting this test deliberately.
      expectBridgeInIndex(17, 'speculative');
    });

    it("dimensional_signature is set to the formatted custom dim (round-trip pin)", () => {
      const be17 = expectBridgeInIndex(17);
      expect(be17.dimensional_signature).toBe(EXPECTED_SIGNATURE);
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE17_SPIN_DENSITY_SQUARED_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers [M²·L⁻²·T⁻²] (round-trip pin)', () => {
      const r = validate(BE17_SPIN_DENSITY_SQUARED_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(r.inferredDimension).toEqual(SPIN_DENSITY_SQUARED);
      expect(format(r.inferredDimension!)).toBe(EXPECTED_SIGNATURE);
    });

    it('LHS (S_spin_squared) has dim [M²·L⁻²·T⁻²]', () => {
      const r = validate(BE17_SPIN_DENSITY_SQUARED_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(SPIN_DENSITY_SQUARED);
    });

    it('full equation validates (LHS and RHS dims match)', () => {
      const eq = validateEquation(
        BE17_SPIN_DENSITY_SQUARED_LHS,
        BE17_SPIN_DENSITY_SQUARED_RHS,
      );
      expect(eq.ok).toBe(true);
    });

    it('BE17_TORSION_CONTRACTION validates structurally as a scalar with dim [T²·L⁻⁴]', () => {
      // v0.2.0 structural encoding: the contraction `T_λμν T^λμν` is a
      // tensor-product over two tensor-symbol nodes (three lower vs.
      // three upper indices). All three indices contract; the validator
      // emits no violations, reports an empty freeIndices map, and
      // infers dim [T·L⁻²] · [T·L⁻²] = [T²·L⁻⁴]. Replaces the v0.1.0
      // `BE17_TORSION_SQUARED_STUB` typed-stub.
      const r = validate(BE17_TORSION_CONTRACTION);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
      expect(r.freeIndices.size).toBe(0);
      expect(r.inferredDimension).toEqual(TORSION_SQUARED);
    });

    it('BE17_COUPLING_PREFACTOR_SQUARED has dim [M²·L²·T⁻⁴]', () => {
      const r = validate(BE17_COUPLING_PREFACTOR_SQUARED);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(COUPLING_PREFACTOR_SQUARED);
    });

    it('validateBE17Dimensions reports OK with both sides at [M²·L⁻²·T⁻²]', () => {
      const r = validateBE17Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(SPIN_DENSITY_SQUARED);
      expect(r.rhsDim).toEqual(SPIN_DENSITY_SQUARED);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      expectDimRoundTrip(BE17_SPIN_DENSITY_SQUARED_RHS, EXPECTED_SIGNATURE);
    });
  });

  describe('numerical evaluation', () => {
    it('trivial multiplication: prefactor=1, torsion²=1 → S² = 1', () => {
      const S2 = evaluateBE17SpinDensitySquared({
        coupling_prefactor_squared: 1.0,
        torsion_squared: 1.0,
      });
      expect(S2).toBeCloseTo(1.0, 14);
    });

    it('hand-computed: prefactor=2, torsion²=3 → S² = 6', () => {
      const S2 = evaluateBE17SpinDensitySquared({
        coupling_prefactor_squared: 2.0,
        torsion_squared: 3.0,
      });
      expect(S2).toBeCloseTo(6.0, 14);
    });

    it('torsion² = 0 → S² = 0 (zero-spin limit)', () => {
      const S2 = evaluateBE17SpinDensitySquared({
        coupling_prefactor_squared: 1.46e88, // SI value of (c⁴/(8πG))²
        torsion_squared: 0.0,
      });
      expect(S2).toBe(0);
    });

    it('linearity in coupling_prefactor_squared: doubling doubles S²', () => {
      const torsion_squared = 7.3;
      const S2a = evaluateBE17SpinDensitySquared({
        coupling_prefactor_squared: 1.0,
        torsion_squared,
      });
      const S2b = evaluateBE17SpinDensitySquared({
        coupling_prefactor_squared: 2.0,
        torsion_squared,
      });
      expect(S2b / S2a).toBeCloseTo(2.0, 14);
    });

    it('linearity in torsion_squared: doubling doubles S²', () => {
      const coupling_prefactor_squared = 1.5;
      const S2a = evaluateBE17SpinDensitySquared({
        coupling_prefactor_squared,
        torsion_squared: 1.0,
      });
      const S2b = evaluateBE17SpinDensitySquared({
        coupling_prefactor_squared,
        torsion_squared: 2.0,
      });
      expect(S2b / S2a).toBeCloseTo(2.0, 14);
    });
  });

  describe('input validation', () => {
    it('rejects non-finite coupling_prefactor_squared', () => {
      expect(() =>
        evaluateBE17SpinDensitySquared({
          coupling_prefactor_squared: NaN,
          torsion_squared: 1,
        }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateBE17SpinDensitySquared({
          coupling_prefactor_squared: Infinity,
          torsion_squared: 1,
        }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite torsion_squared', () => {
      expect(() =>
        evaluateBE17SpinDensitySquared({
          coupling_prefactor_squared: 1,
          torsion_squared: NaN,
        }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateBE17SpinDensitySquared({
          coupling_prefactor_squared: 1,
          torsion_squared: Infinity,
        }),
      ).toThrow(RangeError);
    });

    it('rejects negative torsion_squared (it is a sum of squares)', () => {
      expect(() =>
        evaluateBE17SpinDensitySquared({
          coupling_prefactor_squared: 1,
          torsion_squared: -1,
        }),
      ).toThrow(RangeError);
    });
  });
});
