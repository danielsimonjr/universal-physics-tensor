/**
 * Tests for Bridge Equation 41: Swampland Distance Conjecture.
 *
 *   m(φ) = m₀ exp(−α |φ − φ₀| / M_P)
 *
 * Reference: Vafa 2005 "The String Landscape and the Swampland"
 * (arXiv:hep-th/0509212); Ooguri-Vafa 2007.
 *
 * Status: 'speculative'.
 *
 * Honest-claude scope notes:
 *   - The current AST has no 'exp' primitive. We encode the bare
 *     mass-relation as `m₀ · ε` where ε is a dimensionless
 *     `exp(...)` factor; the dimensionless-ness of the argument
 *     `α(φ−φ₀)/M_P` is asserted as a separate lemma test.
 *   - φ is encoded with dim of [mass] (treating it as a canonically
 *     normalized scalar field with units of energy/c² in natural-c=1
 *     conventions, equivalent to mass in SI). This matches M_P (Planck
 *     mass) so the argument is dimensionless.
 */
import { describe, it, expect } from 'vitest';
import {
  SWAMPLAND_RHS,
  SWAMPLAND_EXP_ARG,
  evaluateSwampland,
  validateSwamplandDimensions,
} from '../../src/bridges/equations/be-41-swampland.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be41 = BRIDGE_EQUATIONS.find((e) => e.id === 41);

describe('BE-41 Swampland Distance Conjecture', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be41).toBeDefined();
    });

    it("status pinned 'speculative' (encoding does not promote)", () => {
      expect(be41!.status).toBe('speculative');
    });

    it('dimensional_signature is set to [mass]', () => {
      expect(be41!.dimensional_signature).toBe('[mass]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(SWAMPLAND_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers SI dimension [mass]', () => {
      const r = validate(SWAMPLAND_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[mass]');
    });

    it('exp argument α(φ−φ₀)/M_P is dimensionless (lemma)', () => {
      const r = validate(SWAMPLAND_EXP_ARG);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[1]');
    });

    it('validateSwamplandDimensions reports both sides match', () => {
      const v = validateSwamplandDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[mass]');
      expect(format(v.rhsDim!)).toBe('[mass]');
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(SWAMPLAND_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be41!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('φ = φ₀ recovers m(φ₀) = m₀ (reference-point identity)', () => {
      const m = evaluateSwampland({
        m0: 1.0e-25,
        alpha: 1.0,
        phi: 5.0,
        phi0: 5.0,
        M_P: 1.0,
      });
      expect(m).toBe(1.0e-25);
    });

    it('φ → ∞ drives m(φ) → 0 (tower descent)', () => {
      const m = evaluateSwampland({
        m0: 1.0,
        alpha: 1.0,
        phi: 100,
        phi0: 0,
        M_P: 1.0,
      });
      // exp(-100) ≈ 3.7e-44 — verify the order
      expect(m).toBeLessThan(1e-40);
      expect(m).toBeGreaterThan(0);
    });

    it('|φ − φ₀| = M_P / α gives m = m₀ / e (exact)', () => {
      // exp(-1) = 1/e
      const m = evaluateSwampland({
        m0: 1.0,
        alpha: 1.0,
        phi: 1.0,
        phi0: 0,
        M_P: 1.0,
      });
      expect(m).toBeCloseTo(1 / Math.E, 12);
    });

    it('symmetric in (φ - φ₀): |φ − φ₀| sign-independent', () => {
      const m_pos = evaluateSwampland({
        m0: 1.0,
        alpha: 0.7,
        phi: 1.5,
        phi0: 0.5,
        M_P: 1.0,
      });
      const m_neg = evaluateSwampland({
        m0: 1.0,
        alpha: 0.7,
        phi: -0.5,
        phi0: 0.5,
        M_P: 1.0,
      });
      expect(m_pos).toBeCloseTo(m_neg, 14);
    });

    it('larger α → faster mass decay (sensitivity)', () => {
      const m1 = evaluateSwampland({
        m0: 1.0,
        alpha: 0.5,
        phi: 2.0,
        phi0: 0,
        M_P: 1.0,
      });
      const m2 = evaluateSwampland({
        m0: 1.0,
        alpha: 1.0,
        phi: 2.0,
        phi0: 0,
        M_P: 1.0,
      });
      expect(m2).toBeLessThan(m1);
    });
  });

  describe('input validation', () => {
    it('rejects negative m0', () => {
      expect(() =>
        evaluateSwampland({ m0: -1, alpha: 1, phi: 0, phi0: 0, M_P: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive M_P', () => {
      expect(() =>
        evaluateSwampland({ m0: 1, alpha: 1, phi: 0, phi0: 0, M_P: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateSwampland({ m0: 1, alpha: 1, phi: 0, phi0: 0, M_P: -1 }),
      ).toThrow(RangeError);
    });
  });
});
