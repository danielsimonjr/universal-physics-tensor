/**
 * Tests for Bridge Equation 34: Kibble-Zurek Mechanism with Curvature.
 *
 *   n_defect = (τ_Q / τ_0)^(−dν/(1 + zν)) · exp(−m_defect c² / (k_B T_reh))
 *
 * Reference: Kibble 1976 J. Phys. A 9:1387; Zurek 1985 Nature 317:505.
 * The exp(−m c²/(k_B T_reh)) Boltzmann suppression for curved-spacetime
 * defects is the additive part flagged as 'Established extension' in
 * the spec.
 *
 * Status: 'established'.
 *
 * Honest-claude scope notes:
 *   - The Kibble-Zurek scaling exponent is a *number* depending on the
 *     universality class (d, ν, z). The AST `^` op requires a numeric
 *     symbol exponent. We encode the *dimensional structure*: the base
 *     (τ_Q/τ_0) is dimensionless and any real-numbered power is also
 *     dimensionless, so the result is dimensionless regardless of the
 *     specific (d, ν, z). For the bracket-check we use the canonical
 *     (d, ν, z) = (1, 1, 1) → exponent = -1/2.
 *   - The Boltzmann factor exp(−m c²/(k_B T_reh)) follows the same
 *     dimensionless-exp-stub pattern as BE-41.
 *   - n_defect is encoded as DIMENSIONLESS (it is the bare scaling
 *     ratio with no length scale in the formula).
 */
import { describe, it, expect } from 'vitest';
import {
  KIBBLE_ZUREK_RHS,
  KIBBLE_ZUREK_EXP_ARG,
  evaluateKibbleZurek,
  validateKibbleZurekDimensions,
} from '../../src/bridges/equations/be-34-kibble-zurek.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

const be34 = BRIDGE_EQUATIONS.find((e) => e.id === 34);

describe('BE-34 Kibble-Zurek Mechanism in Curved Spacetime', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be34).toBeDefined();
    });

    it("status pinned 'established' in the index", () => {
      expect(be34!.status).toBe('established');
    });

    it('dimensional_signature is set to [1] (dimensionless scaling)', () => {
      expect(be34!.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(KIBBLE_ZUREK_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers SI dimension [1] (dimensionless)', () => {
      const r = validate(KIBBLE_ZUREK_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[1]');
    });

    it('Boltzmann arg m c² / (k_B T_reh) is dimensionless (lemma)', () => {
      const r = validate(KIBBLE_ZUREK_EXP_ARG);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[1]');
    });

    it('validateKibbleZurekDimensions reports both sides match', () => {
      const v = validateKibbleZurekDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[1]');
      expect(format(v.rhsDim!)).toBe('[1]');
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(KIBBLE_ZUREK_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be34!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('τ_Q = τ_0, m_defect = 0 → n_defect = 1', () => {
      // Pure scaling identity: ratio = 1, no Boltzmann suppression.
      const n = evaluateKibbleZurek({
        tau_Q: 1.0,
        tau_0: 1.0,
        d: 3,
        nu: 0.6299, // 3D Ising
        z: 1,
        m_defect: 0,
        T_reh: 1.0,
      });
      expect(n).toBeCloseTo(1.0, 12);
    });

    it('Slow quench (τ_Q >> τ_0) → fewer defects (Kibble-Zurek scaling)', () => {
      // Larger τ_Q with negative exponent → smaller n.
      const n_fast = evaluateKibbleZurek({
        tau_Q: 1,
        tau_0: 1,
        d: 1,
        nu: 1,
        z: 1,
        m_defect: 0,
        T_reh: 1,
      });
      const n_slow = evaluateKibbleZurek({
        tau_Q: 100,
        tau_0: 1,
        d: 1,
        nu: 1,
        z: 1,
        m_defect: 0,
        T_reh: 1,
      });
      expect(n_slow).toBeLessThan(n_fast);
      // d=ν=z=1 → exponent = -1/(1+1) = -1/2; (100)^(-0.5) = 0.1
      expect(n_slow).toBeCloseTo(0.1, 10);
    });

    it('Heavy defect at low T_reh → exponential suppression', () => {
      // For m c² / (k_B T_reh) of moderate size (e.g., ~50–700), exp
      // factor is small but representable in IEEE 754 (smallest positive
      // double ~ 5e-324, so |arg| < ~745 stays positive).
      // Pick m c²/(k_B T) ~ 100: e.g., T_reh chosen so arg ≈ 100.
      const m = 1.0e-30; // ~ electron-scale
      const T_reh = 660; // gives arg = m c²/(k_B T) ≈ 8.99e-14 / 9.11e-21 ≈ 9870
      // ^ that's still ~9870; pick larger T to get arg small enough.
      // Recompute: arg = (1e-30)(9e16)/((1.38e-23)(660)) = 9e-14/9.11e-21 ≈ 9870
      // Need arg ≈ 100 → T = (1e-30)(9e16)/((1.38e-23)(100)) = 9e-14/(1.38e-21) ≈ 6.5e7 K
      const T_reh_real = 6.5e7;
      const n = evaluateKibbleZurek({
        tau_Q: 1,
        tau_0: 1,
        d: 3,
        nu: 1,
        z: 1,
        m_defect: m,
        T_reh: T_reh_real,
      });
      void T_reh;
      // arg ≈ 100, exp(-100) ≈ 3.7e-44 — well within IEEE 754 range, > 0.
      expect(n).toBeLessThan(1e-30);
      expect(n).toBeGreaterThan(0);
    });

    it('Hand-computed CODATA cross-check for τ_Q=10, τ_0=1, m_defect=0', () => {
      // d=3, ν=1, z=1 → exponent = -3/(1+1) = -3/2.
      // n = 10^(-3/2) = 1/sqrt(1000) ≈ 0.0316
      const n = evaluateKibbleZurek({
        tau_Q: 10,
        tau_0: 1,
        d: 3,
        nu: 1,
        z: 1,
        m_defect: 0,
        T_reh: 1,
      });
      expect(n).toBeCloseTo(Math.pow(10, -1.5), 12);
    });

    it('Boltzmann argument matches CODATA arithmetic', () => {
      // For m_proton at T = 1e10 K (early universe radiation era):
      // m_p c² ≈ 1.5e-10 J, k_B T ≈ 1.38e-13 J → arg ≈ 1085 → exp(-1085) ≈ 0.
      // But we test the arg itself: m c² / (k_B T) = (1.5e-10) / (1.38e-13) ≈ 1086.
      const m_p = 1.67262e-27; // proton mass kg
      const T = 1e10;
      const arg = (m_p * PhysicalConstants.c * PhysicalConstants.c)
                  / (PhysicalConstants.kB * T);
      expect(arg).toBeGreaterThan(1080);
      expect(arg).toBeLessThan(1090);
    });
  });

  describe('input validation', () => {
    it('rejects non-positive tau_Q or tau_0', () => {
      expect(() =>
        evaluateKibbleZurek({
          tau_Q: 0, tau_0: 1, d: 1, nu: 1, z: 1, m_defect: 0, T_reh: 1,
        }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateKibbleZurek({
          tau_Q: 1, tau_0: 0, d: 1, nu: 1, z: 1, m_defect: 0, T_reh: 1,
        }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive T_reh', () => {
      expect(() =>
        evaluateKibbleZurek({
          tau_Q: 1, tau_0: 1, d: 1, nu: 1, z: 1, m_defect: 1, T_reh: 0,
        }),
      ).toThrow(RangeError);
    });

    it('rejects 1 + z*ν = 0 (singular exponent)', () => {
      expect(() =>
        evaluateKibbleZurek({
          tau_Q: 1, tau_0: 1, d: 1, nu: -1, z: 1, m_defect: 0, T_reh: 1,
        }),
      ).toThrow(RangeError);
    });
  });
});
