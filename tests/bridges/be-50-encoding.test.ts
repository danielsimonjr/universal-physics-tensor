/**
 * Tests for Bridge Equation 50: Wheeler-Feynman absorber theory /
 * time-symmetric gauge field.
 *
 *   Original (Wave P-A canonical):
 *     A_μ = (1/2)(A_μ^ret + A_μ^adv)
 *
 *   Encoded reduction (Wave Z, OpenAI scalar reduction):
 *     r_TS = (A_ret − A_adv) / (A_ret + A_adv)
 *
 * References: Wheeler & Feynman 1945 Rev. Mod. Phys. 17:157;
 * Wheeler & Feynman 1949 Rev. Mod. Phys. 21:425; Cramer 1986
 * Rev. Mod. Phys. 58:647; Hoyle & Narlikar 1995 Rev. Mod. Phys.
 * 67:113.
 *
 * Honest-claude scope notes:
 *   - r_TS is a *ratio*, dimensionless by construction; the gauge-
 *     field dim of (A_ret ± A_adv) cancels.
 *   - Under the Wheeler-Feynman absorber boundary condition,
 *     A_ret = A_adv on physical states, so r_TS ≡ 0; deviations
 *     measure retrocausal-asymmetry violation.
 *   - Status pinned 'highly-speculative': the dimensional content is
 *     canonical, but the bridge framing as "retrocausal QFT" is
 *     conjectural and the absorber boundary condition is empirically
 *     untested in QFT.
 */
import { describe, it, expect } from 'vitest';
import {
  BE50_TIME_SYMMETRY_RESIDUAL_RHS,
  BE50_TIME_SYMMETRY_NUMERATOR,
  BE50_TIME_SYMMETRY_DENOMINATOR,
  MAGNETIC_VECTOR_POTENTIAL,
  evaluateWFTimeSymmetry,
} from '../../src/bridges/equations/be-50-wheeler-feynman.js';
import { validate } from '../../src/dimensional/validator.js';
import { expectBridgeInIndex, expectDimRoundTrip } from './_helpers.js';

describe('BE-50 Wheeler-Feynman absorber theory (time-symmetric gauge field)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expectBridgeInIndex(50);
    });

    it("status pinned 'highly-speculative'", () => {
      // The dimensional content (gauge-field dim of A_ret/A_adv,
      // dimensionless ratio) is canonical, but the absorber boundary
      // condition is empirically untested in QFT and the
      // retrocausal-QFT framing is conjectural.
      expectBridgeInIndex(50, 'highly-speculative');
    });

    it('dimensional_signature is set to [1] (dimensionless residual ratio)', () => {
      const be50 = expectBridgeInIndex(50);
      expect(be50.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE50_TIME_SYMMETRY_RESIDUAL_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
      expectDimRoundTrip(BE50_TIME_SYMMETRY_RESIDUAL_RHS, '[1]');
    });

    it('numerator (A_ret − A_adv) carries gauge-field dim', () => {
      const r = validate(BE50_TIME_SYMMETRY_NUMERATOR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(MAGNETIC_VECTOR_POTENTIAL);
    });

    it('denominator (A_ret + A_adv) carries gauge-field dim', () => {
      const r = validate(BE50_TIME_SYMMETRY_DENOMINATOR);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(MAGNETIC_VECTOR_POTENTIAL);
    });
  });

  describe('numerical evaluation', () => {
    it('time-symmetric (A_ret = A_adv): residual = 0 (absorber-theory identity)', () => {
      // Canonical Wheeler-Feynman identity: under the absorber
      // boundary condition, A_ret = A_adv on physical states, so the
      // residual vanishes identically.
      const r_TS = evaluateWFTimeSymmetry({ A_retarded: 1.0, A_advanced: 1.0 });
      expect(r_TS).toBe(0);
    });

    it('pure retarded (A_adv = 0): residual = +1', () => {
      // Limit of pure retarded propagation (standard Maxwell radiation
      // reaction): r_TS = (A_ret − 0)/(A_ret + 0) = +1.
      const r_TS = evaluateWFTimeSymmetry({ A_retarded: 1.0, A_advanced: 0.0 });
      expect(r_TS).toBe(1);
    });

    it('pure advanced (A_ret = 0): residual = −1', () => {
      // Limit of pure advanced propagation (anti-causal): r_TS =
      // (0 − A_adv)/(0 + A_adv) = −1.
      const r_TS = evaluateWFTimeSymmetry({ A_retarded: 0.0, A_advanced: 1.0 });
      expect(r_TS).toBe(-1);
    });

    it('antisymmetric under ret ↔ adv swap: residual negates', () => {
      // Swapping retarded and advanced amplitudes negates the
      // numerator while leaving the denominator unchanged, so the
      // residual flips sign. Property tested across 5 random-ish pairs.
      const pairs: Array<[number, number]> = [
        [0.7, 0.2],
        [3.5, 1.1],
        [1e-6, 4.2],
        [42.0, -3.7], // negative amplitudes physically possible (signed projection)
        [-0.5, 0.9],
      ];
      for (const [a, b] of pairs) {
        const r_ab = evaluateWFTimeSymmetry({ A_retarded: a, A_advanced: b });
        const r_ba = evaluateWFTimeSymmetry({ A_retarded: b, A_advanced: a });
        expect(r_ab).toBeCloseTo(-r_ba, 14);
      }
    });

    it('scale-invariant under common rescaling: r_TS(k·A_ret, k·A_adv) = r_TS(A_ret, A_adv)', () => {
      // The ratio cancels any common scale factor k > 0, so r_TS is
      // invariant under uniform rescaling of both fields. This is the
      // dimensionless-ratio property that motivates the encoding.
      const A_ret = 0.6;
      const A_adv = 0.25;
      const baseline = evaluateWFTimeSymmetry({ A_retarded: A_ret, A_advanced: A_adv });
      for (const k of [1e-9, 1e-3, 1.0, 137.036, 1e6]) {
        const scaled = evaluateWFTimeSymmetry({
          A_retarded: k * A_ret,
          A_advanced: k * A_adv,
        });
        expect(scaled).toBeCloseTo(baseline, 14);
      }
    });
  });

  describe('input validation', () => {
    it('rejects non-finite A_retarded', () => {
      expect(() =>
        evaluateWFTimeSymmetry({ A_retarded: NaN, A_advanced: 1 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateWFTimeSymmetry({ A_retarded: Infinity, A_advanced: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite A_advanced', () => {
      expect(() =>
        evaluateWFTimeSymmetry({ A_retarded: 1, A_advanced: NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateWFTimeSymmetry({ A_retarded: 1, A_advanced: -Infinity }),
      ).toThrow(RangeError);
    });

    it('rejects A_retarded + A_advanced === 0 (division by zero)', () => {
      // Symmetric cancellation: A_ret = −A_adv → denominator = 0.
      expect(() =>
        evaluateWFTimeSymmetry({ A_retarded: 1, A_advanced: -1 }),
      ).toThrow(RangeError);
      // Trivial double-zero case.
      expect(() =>
        evaluateWFTimeSymmetry({ A_retarded: 0, A_advanced: 0 }),
      ).toThrow(RangeError);
    });
  });
});
