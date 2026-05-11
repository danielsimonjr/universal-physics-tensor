/**
 * Tier-5 AST encoding test for BE-28 — Maximum Entropy Production
 * Principle (Onsager linear-response entropy-production scalar
 * reformulation).
 *
 *   σ = Σᵢ Jᵢ Xᵢ          (typed scalar, dim [entropy/time] = [W/K])
 *
 * Wave Z-G (2026-05-11): reformulates BE-28 from MEPP's variational
 * formulation (which requires variational-δ + Lagrange-multiplier +
 * discrete-sum grammar primitives the UPT AST does not have) to
 * Onsager linear-response. **User-confirmed design choice** after
 * the relabeling concern was surfaced via AskUserQuestion: this
 * reformulation does NOT capture MEPP's variational maximization
 * claim. The encoded form answers "what is the entropy production
 * rate?" but NOT "why does nature select this rate?" The latter is
 * the actual MEPP content and remains an open research question.
 *
 * Status: 'speculative'. Onsager linear-response is canonical and
 * uncontested; the bridge framing — treating Onsager σ as THE UPT
 * NESS-selection bridge — is the speculative element (and is
 * arguably mislabeled, see honest-claude scope notes in the module).
 *
 * @see src/bridges/equations/be-28-onsager-entropy-production.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 28")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 28)
 */

import { describe, it, expect } from 'vitest';
import {
  BE28_ENTROPY_PRODUCTION_RHS,
  BE28_ENTROPY_PRODUCTION_LHS,
  BE28_FORCE_FLUX_PRODUCT,
  evaluateOnsagerEntropyProduction,
  validateBE28Dimensions,
} from '../../src/bridges/equations/be-28-onsager-entropy-production.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-28 Onsager linear-response entropy production — Tier 5 AST encoding (Wave Z-G)', () => {
  describe('index entry invariants', () => {
    const be28 = BRIDGE_EQUATIONS.find((e) => e.id === 28);

    it('exists in the index', () => {
      expect(be28).toBeDefined();
    });

    it("status pinned 'speculative' (encoding does NOT lift, and MEPP relabeling concerns are documented)", () => {
      // The encoding does not capture MEPP's variational content.
      // Status 'speculative' reflects both (a) the bridge framing
      // (Onsager σ as the UPT NESS-selection bridge) and (b) the
      // relabeling concern (Onsager ≠ MEPP). Honest-claude scope
      // notes in the module document the trade-off.
      expect(be28!.status).toBe('speculative');
    });

    it("dimensional_signature is set to '[L^2 M T^-3 Theta^-1]' (= [W/K] = entropy/time)", () => {
      expect(be28!.dimensional_signature).toBe('[L^2 M T^-3 Theta^-1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE28_ENTROPY_PRODUCTION_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[L^2 M T^-3 Theta^-1]' (entropy rate; round-trip pin)", () => {
      const r = validate(BE28_ENTROPY_PRODUCTION_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[L^2 M T^-3 Theta^-1]');
    });

    it('LHS (σ) has dim [entropy/time]', () => {
      const r = validate(BE28_ENTROPY_PRODUCTION_LHS);
      expect(r.ok).toBe(true);
      const d = r.inferredDimension!;
      expect(d.L).toBe(2);
      expect(d.M).toBe(1);
      expect(d.T).toBe(-3);
      expect(d.Theta).toBe(-1);
    });

    it('full equation σ = Σ J·X validates', () => {
      const eq = validateEquation(BE28_ENTROPY_PRODUCTION_LHS, BE28_ENTROPY_PRODUCTION_RHS);
      expect(eq.ok).toBe(true);
    });

    it('BE28_FORCE_FLUX_PRODUCT (index-collapsed Σᵢ Jᵢ Xᵢ) has the entropy-rate dim', () => {
      // The typed-stub absorbs the discrete index sum (AST has no
      // sum primitive). Same idiom as BE-17 T_torsion_squared.
      const r = validate(BE28_FORCE_FLUX_PRODUCT);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension!.L).toBe(2);
      expect(r.inferredDimension!.M).toBe(1);
      expect(r.inferredDimension!.T).toBe(-3);
      expect(r.inferredDimension!.Theta).toBe(-1);
    });

    it('validateBE28Dimensions reports both sides match', () => {
      const r = validateBE28Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(r.rhsDim);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(BE28_ENTROPY_PRODUCTION_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      const be28 = BRIDGE_EQUATIONS.find((e) => e.id === 28);
      expect(be28!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('σ = 1 W/K (heat engine bracket): returns 1', () => {
      const sigma = evaluateOnsagerEntropyProduction({
        force_flux_product_W_per_K: 1.0,
      });
      expect(sigma).toBe(1.0);
    });

    it('σ = 0 (reversible limit): returns 0', () => {
      const sigma = evaluateOnsagerEntropyProduction({
        force_flux_product_W_per_K: 0,
      });
      expect(sigma).toBe(0);
    });

    it('σ = 1e-9 W/K (low-dissipation bracket, e.g. quantum-coherent transport)', () => {
      const sigma = evaluateOnsagerEntropyProduction({
        force_flux_product_W_per_K: 1e-9,
      });
      expect(sigma).toBeCloseTo(1e-9, 18);
    });

    it('σ = 1e6 W/K (high-dissipation bracket, e.g. furnace)', () => {
      const sigma = evaluateOnsagerEntropyProduction({
        force_flux_product_W_per_K: 1e6,
      });
      expect(sigma).toBe(1e6);
    });
  });

  describe('input validation (Second Law enforcement)', () => {
    it('rejects negative σ (violates the Second Law)', () => {
      expect(() =>
        evaluateOnsagerEntropyProduction({ force_flux_product_W_per_K: -1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite σ', () => {
      expect(() =>
        evaluateOnsagerEntropyProduction({ force_flux_product_W_per_K: NaN }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateOnsagerEntropyProduction({ force_flux_product_W_per_K: Infinity }),
      ).toThrow(RangeError);
    });

    it('error message for negative σ references the Second Law and sign convention', () => {
      try {
        evaluateOnsagerEntropyProduction({ force_flux_product_W_per_K: -0.5 });
        expect.fail('should have thrown');
      } catch (e) {
        expect((e as Error).message).toMatch(/Second Law|sign convention/i);
      }
    });
  });
});
