/**
 * Tests for Bridge Equation 25: Penrose-Hameroff Orch-OR collapse time.
 *
 *   t_OR = ℏ / E_G = ℏ / (Δm c² Δx / ℓ_P)
 *
 * Reference: Penrose 1996 Gen. Rel. Grav. 28:581; Hameroff-Penrose 1996.
 * As noted in the index entry's known_issues, the Δx/ℓ_P factor is a
 * spurious modification not present in Penrose's original gravitational
 * self-energy form (E_G ~ G(Δm)²/Δx); we encode the spec-as-written.
 *
 * Honest-claude: status pinned 'highly-speculative' — encoding the
 * dimensional structure does NOT promote the entry. Mainstream
 * Tegmark 2000 (arXiv:quant-ph/9907009) decoherence analysis is
 * preserved as a known_issue.
 */
import { describe, it, expect } from 'vitest';
import {
  ORCH_OR_RHS,
  evaluateOrchOR,
  validateOrchORDimensions,
} from '../../src/bridges/equations/be-25-orch-or.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

const be25 = BRIDGE_EQUATIONS.find((e) => e.id === 25);

describe('BE-25 Orch-OR Collapse Time (Penrose-Hameroff)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be25).toBeDefined();
    });

    it("status pinned 'highly-speculative' (encoding does not promote)", () => {
      expect(be25!.status).toBe('highly-speculative');
    });

    it('dimensional_signature is set to [time]', () => {
      expect(be25!.dimensional_signature).toBe('[time]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(ORCH_OR_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers SI dimension [time]', () => {
      const r = validate(ORCH_OR_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[time]');
    });

    it('validateOrchORDimensions reports both sides match', () => {
      const v = validateOrchORDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[time]');
      expect(format(v.rhsDim!)).toBe('[time]');
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(ORCH_OR_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be25!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('1 mg sphere displaced 10 nm: t_OR is millisecond-order', () => {
      // Penrose's canonical bracket: a 1 mg = 1e-6 kg superposition of
      // separation 10 nm = 1e-8 m gives a collapse time near a few ms.
      // The spec form (with the spurious Δx/ℓ_P factor) gives:
      //   t_OR = ℏ ℓ_P / (Δm c² Δx)
      //         ≈ 1.055e-34 · 1.616e-35 / (1e-6 · 9e16 · 1e-8)
      //         ≈ 1.704e-69 / 9e2
      //         ≈ 1.9e-72 s
      // — which is NOT physically Penrose's ms-order result; that is
      // the published critique. We bracket the spec form as written.
      const t = evaluateOrchOR({ delta_m: 1e-6, delta_x: 1e-8 });
      // The spec form gives a hugely sub-Planckian time; assert this
      // (non-physical, but faithful to the spec). The Δx/ℓ_P spurious
      // factor compresses the result by 27 orders of magnitude.
      expect(t).toBeGreaterThan(1e-75);
      expect(t).toBeLessThan(1e-65);
    });

    it('larger Δm gives shorter t_OR (inverse scaling)', () => {
      const t1 = evaluateOrchOR({ delta_m: 1e-9, delta_x: 1e-9 });
      const t2 = evaluateOrchOR({ delta_m: 1e-6, delta_x: 1e-9 });
      // 1000× more mass → 1000× faster collapse.
      expect(t1 / t2).toBeCloseTo(1000, 6);
    });

    it('larger Δx gives shorter t_OR (inverse scaling per spec form)', () => {
      const t1 = evaluateOrchOR({ delta_m: 1e-9, delta_x: 1e-9 });
      const t2 = evaluateOrchOR({ delta_m: 1e-9, delta_x: 1e-6 });
      // 1000× larger Δx → 1000× faster collapse (in the spec form).
      expect(t1 / t2).toBeCloseTo(1000, 6);
    });

    it('Δm = 1 kg, Δx = 1 m: explicit hand-computed value', () => {
      // Hand-computed CODATA cross-check:
      //   t_OR = ℏ · ℓ_P / (Δm · c² · Δx)
      //   ℏ      = 1.054571817e-34
      //   ℓ_P    = 1.616255e-35
      //   c²     = 8.987551787368e16
      //   numerator   = 1.054571817e-34 · 1.616255e-35 ≈ 1.7045e-69
      //   denominator = 1 · 8.9876e16 · 1 = 8.9876e16
      //   t_OR        ≈ 1.7045e-69 / 8.9876e16 ≈ 1.897e-86 s
      const t = evaluateOrchOR({ delta_m: 1.0, delta_x: 1.0 });
      const expected =
        (PhysicalConstants.hbar * PhysicalConstants.lP) /
        (1.0 * PhysicalConstants.c * PhysicalConstants.c * 1.0);
      expect(Math.abs(t - expected) / expected).toBeLessThan(1e-12);
      expect(t).toBeGreaterThan(1e-87);
      expect(t).toBeLessThan(1e-85);
    });
  });

  describe('input validation', () => {
    it('rejects non-positive delta_m', () => {
      expect(() => evaluateOrchOR({ delta_m: 0, delta_x: 1 })).toThrow(RangeError);
      expect(() => evaluateOrchOR({ delta_m: -1, delta_x: 1 })).toThrow(RangeError);
    });

    it('rejects non-positive delta_x', () => {
      expect(() => evaluateOrchOR({ delta_m: 1, delta_x: 0 })).toThrow(RangeError);
      expect(() => evaluateOrchOR({ delta_m: 1, delta_x: -1 })).toThrow(RangeError);
    });
  });
});
