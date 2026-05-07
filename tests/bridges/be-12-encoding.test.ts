/**
 * Tier-5 AST encoding test for BE-12 — Mesoscopic Coherence Length
 * (canonical thermal de Broglie wavelength, post Wave P-B + Wave Q A2).
 *
 * Formula: λ_T = ℏ / √(2π m k_B T)
 *
 * Status pin: 'speculative' (formula canonical, mesoscopic-coherence
 * bridge framing speculative; promotion requires deleting this test
 * along with the status change).
 *
 * @see src/bridges/equations/be-12-coherence-length.ts
 * @see docs/specification/Part-I.md ("Bridge Equation 12")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 12)
 */

import { describe, it, expect } from 'vitest';
import {
  BE12_COHERENCE_LENGTH_RHS,
  BE12_COHERENCE_LENGTH_LHS,
  evaluateThermalDeBroglie,
  validateBE12Dimensions,
} from '../../src/bridges/equations/be-12-coherence-length.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { LENGTH } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

describe('BE-12 thermal de Broglie wavelength — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    const be12 = BRIDGE_EQUATIONS.find((e) => e.id === 12);

    it('exists', () => {
      expect(be12).toBeDefined();
    });

    it('dimensional_signature is [length] (round-trips through validator)', () => {
      expect(be12!.dimensional_signature).toBe('[length]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE12_COHERENCE_LENGTH_RHS).inferredDimension;
      expect(inferredDim).toBeDefined();
      expect(format(inferredDim!)).toBe(be12!.dimensional_signature);
    });

    it("status pinned 'speculative' (canonical formula, bridge framing speculative)", () => {
      // Promotion to 'established' requires deleting this assertion along
      // with the status change so the choice is explicit. Same precedent
      // as BE-22 (Kitaev-Preskill canonical, framing speculative).
      expect(be12!.status).toBe('speculative');
    });

    it("tractability_class is 'closed-form' (single algebraic relation)", () => {
      expect(be12!.tractability_class).toBe('closed-form');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is [length]', () => {
      const r = validate(BE12_COHERENCE_LENGTH_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(LENGTH);
    });

    it('RHS is [length]', () => {
      const r = validate(BE12_COHERENCE_LENGTH_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(LENGTH);
    });

    it('full equation validates', () => {
      const eq = validateEquation(
        BE12_COHERENCE_LENGTH_LHS,
        BE12_COHERENCE_LENGTH_RHS,
      );
      expect(eq.ok).toBe(true);
    });

    it('validateBE12Dimensions reports both sides as [length]', () => {
      const r = validateBE12Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(LENGTH);
      expect(r.rhsDim).toEqual(LENGTH);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    const { hbar, kB } = PhysicalConstants;

    it('hydrogen atom at 300 K gives λ_T ~ 100 pm = 1 Å (textbook value)', () => {
      // Hydrogen mass 1.6735e-27 kg; T = 300 K
      // λ_T = √(2π ℏ²/(m k_B T))
      //     = √(2π · (1.0546e-34)² / (1.6735e-27 · 1.380649e-23 · 300))
      //     ≈ 1.00e-10 m = 100 pm = 1 Å
      // (Pathria 2011 *Statistical Mechanics* 3rd ed. eq. 1.4.13.)
      const lambda = evaluateThermalDeBroglie({
        m_kg: 1.6735e-27,
        T_K: 300,
      });
      expect(lambda).toBeGreaterThan(80e-12);    // > 80 pm
      expect(lambda).toBeLessThan(120e-12);      // < 120 pm
    });

    it('electron at 300 K gives λ_T ~ 4-5 nm', () => {
      // Electron mass 9.10938356e-31 kg; T = 300 K
      // λ_T(electron, 300K) = √(2π ℏ²/(m_e k_B T)) ≈ 4.3 nm
      // (Heavier than hydrogen by factor √(m_p/m_e) ≈ 43)
      const lambda = evaluateThermalDeBroglie({
        m_kg: 9.10938356e-31,
        T_K: 300,
      });
      expect(lambda).toBeGreaterThan(3e-9);      // > 3 nm
      expect(lambda).toBeLessThan(6e-9);         // < 6 nm
    });

    it('cross-check at low T: hydrogen at 1 K, λ scales by √300', () => {
      // λ_T ∝ 1/√T
      const lambda300 = evaluateThermalDeBroglie({
        m_kg: 1.6735e-27,
        T_K: 300,
      });
      const lambda1 = evaluateThermalDeBroglie({
        m_kg: 1.6735e-27,
        T_K: 1,
      });
      const ratio = lambda1 / lambda300;
      expect(ratio).toBeCloseTo(Math.sqrt(300), 6);
    });

    it('analytical identity: λ_T(αm, T) / λ_T(m, T) = 1/√α', () => {
      // λ_T ∝ 1/√m
      const m_ref = 1e-27;
      const T = 300;
      const lambda_ref = evaluateThermalDeBroglie({ m_kg: m_ref, T_K: T });
      for (const alpha of [0.5, 2, 4, 9, 16]) {
        const lambda_alpha = evaluateThermalDeBroglie({
          m_kg: alpha * m_ref,
          T_K: T,
        });
        const ratio = lambda_alpha / lambda_ref;
        expect(ratio).toBeCloseTo(1 / Math.sqrt(alpha), 12);
      }
    });

    it('analytical identity: λ_T(m, αT) / λ_T(m, T) = 1/√α', () => {
      const m = 1e-27;
      const T_ref = 300;
      const lambda_ref = evaluateThermalDeBroglie({ m_kg: m, T_K: T_ref });
      for (const alpha of [0.5, 2, 10, 100, 0.01]) {
        const lambda_alpha = evaluateThermalDeBroglie({
          m_kg: m,
          T_K: alpha * T_ref,
        });
        const ratio = lambda_alpha / lambda_ref;
        expect(ratio).toBeCloseTo(1 / Math.sqrt(alpha), 12);
      }
    });

    it('hand-computed value: m=1e-27 kg, T=300 K → λ_T = √(2π ℏ²/(m k_B T))', () => {
      const m = 1e-27;
      const T = 300;
      const expected = Math.sqrt((2 * Math.PI * hbar * hbar) / (m * kB * T));
      const got = evaluateThermalDeBroglie({ m_kg: m, T_K: T });
      expect(got).toBeCloseTo(expected, 14);
    });

    it('cross-derivation: ℏ-flavor and h-flavor agree to numerical precision', () => {
      // λ_T = √(2π ℏ²/(m k_B T)) = h/√(2π m k_B T) since h = 2πℏ
      const m = 1.6735e-27;
      const T = 300;
      const lambda_hbar = evaluateThermalDeBroglie({ m_kg: m, T_K: T });
      const h = 2 * Math.PI * hbar;
      const lambda_h = h / Math.sqrt(2 * Math.PI * m * kB * T);
      expect(lambda_hbar).toBeCloseTo(lambda_h, 14);
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite m', () => {
      expect(() =>
        evaluateThermalDeBroglie({ m_kg: NaN, T_K: 300 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateThermalDeBroglie({ m_kg: Infinity, T_K: 300 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive m', () => {
      expect(() =>
        evaluateThermalDeBroglie({ m_kg: 0, T_K: 300 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateThermalDeBroglie({ m_kg: -1, T_K: 300 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite T', () => {
      expect(() =>
        evaluateThermalDeBroglie({ m_kg: 1e-27, T_K: NaN }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive T', () => {
      expect(() =>
        evaluateThermalDeBroglie({ m_kg: 1e-27, T_K: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateThermalDeBroglie({ m_kg: 1e-27, T_K: -1 }),
      ).toThrow(RangeError);
    });
  });
});
