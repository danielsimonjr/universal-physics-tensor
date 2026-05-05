/**
 * Tests for Bridge Equation 19: Quantum Bounce (LQC modified Friedmann).
 *
 *   H² = (8πG/3) ρ (1 − ρ/ρ_crit) + Λ/3
 *
 * Reference: Ashtekar-Singh 2011 review "Loop Quantum Cosmology: A
 * Status Report" (arXiv:1108.0893). The (1 − ρ/ρ_crit) bounce factor is
 * the LQC modification to standard Friedmann.
 *
 * Honest-claude: status pinned 'speculative' — encoding the dimensional
 * structure does NOT promote the entry. The spec's known issue (rho_crit
 * differs from canonical Ashtekar-Singh value by Barbero-Immirzi gamma
 * factor) is preserved unchanged.
 */
import { describe, it, expect } from 'vitest';
import {
  QUANTUM_BOUNCE_RHS,
  evaluateQuantumBounce,
  validateQuantumBounceDimensions,
} from '../../src/bridges/equations/be-19-quantum-bounce.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { PhysicalConstants } from '../../src/core/types.js';

const be19 = BRIDGE_EQUATIONS.find((e) => e.id === 19);

describe('BE-19 Quantum Bounce (LQC modified Friedmann)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be19).toBeDefined();
    });

    it("status pinned 'speculative' (encoding does not promote)", () => {
      expect(be19!.status).toBe('speculative');
    });

    it('dimensional_signature is set to [T^-2] (rate-squared)', () => {
      expect(be19!.dimensional_signature).toBe('[T^-2]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(QUANTUM_BOUNCE_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers SI dimension [T^-2]', () => {
      const r = validate(QUANTUM_BOUNCE_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[T^-2]');
    });

    it('validateQuantumBounceDimensions reports both sides match', () => {
      const v = validateQuantumBounceDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[T^-2]');
      expect(format(v.rhsDim!)).toBe('[T^-2]');
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(QUANTUM_BOUNCE_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be19!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('ρ = ρ_crit collapses bounce factor to 0; H² = Λ/3', () => {
      // At the bounce, the (1 − ρ/ρ_crit) factor vanishes → H² = Λ/3.
      const Lambda = 1.1056e-52; // observed cosmological constant in m^-2
      // Convert Lambda from [L^-2] to [T^-2] convention used in this form:
      //   in Friedmann H² = Λ_[T^-2] / 3, the [T^-2]-form Λ equals
      //   c² · Λ_[L^-2]. We pass [T^-2]-form directly.
      const Lambda_Tinv2 = Lambda * PhysicalConstants.c * PhysicalConstants.c;
      const H2 = evaluateQuantumBounce({
        rho: 1.0,
        rho_crit: 1.0,
        Lambda_Tinv2,
      });
      expect(H2).toBeCloseTo(Lambda_Tinv2 / 3, 18);
    });

    it('ρ << ρ_crit, Λ = 0 recovers standard Friedmann H² = (8πG/3) ρ', () => {
      const rho = 1.0e-26; // close to current critical density of universe
      const rho_crit = 1.0e96; // arbitrary much-larger value
      const H2 = evaluateQuantumBounce({ rho, rho_crit, Lambda_Tinv2: 0 });
      const H2_classical =
        ((8 * Math.PI * PhysicalConstants.G) / 3) * rho;
      // Bounce correction is (1 - 1e-26/1e96) ≈ 1, exact to 70 digits.
      expect(H2 / H2_classical).toBeCloseTo(1.0, 12);
    });

    it('ρ > ρ_crit gives H² < Λ/3 (bounce factor is negative — pre-bounce branch)', () => {
      // Mathematically the formula admits ρ > ρ_crit (gives negative
      // contribution), though physically the LQC bounce *prevents* this.
      // We test the algebraic property anyway.
      const Lambda_Tinv2 = 1.0e-35;
      const H2 = evaluateQuantumBounce({
        rho: 2.0,
        rho_crit: 1.0,
        Lambda_Tinv2,
      });
      // (8πG/3) · 2 · (1 − 2) = -16πG/3
      expect(H2).toBeLessThan(Lambda_Tinv2 / 3);
    });

    it('current observable universe (ρ ~ 9.5e-27 kg/m³, Λ small) gives H ~ 67 km/s/Mpc', () => {
      // Bracket-check: today's matter+radiation density times standard
      // Friedmann should give Hubble rate near the observed value.
      const rho_today = 9.47e-27; // critical density of universe ~9.47e-27 kg/m^3
      const rho_crit_LQC = 1.0e96; // bounce density >> rho_today, suppression negligible
      const Lambda_Tinv2 = 0; // matter-only; ignores dark energy
      const H2 = evaluateQuantumBounce({
        rho: rho_today,
        rho_crit: rho_crit_LQC,
        Lambda_Tinv2,
      });
      const H = Math.sqrt(H2);
      // H_observed ≈ 2.184e-18 s^-1 (Planck 2018, H_0 = 67.4 km/s/Mpc).
      // Our matter-only computation will approach this if we use the
      // *total* density (matter + radiation + dark energy) — using only
      // matter-equivalent we expect within a factor of ~few.
      expect(H).toBeGreaterThan(1e-19);
      expect(H).toBeLessThan(1e-17);
    });
  });

  describe('input validation', () => {
    it('rejects negative rho', () => {
      expect(() =>
        evaluateQuantumBounce({ rho: -1, rho_crit: 1, Lambda_Tinv2: 0 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive rho_crit', () => {
      expect(() =>
        evaluateQuantumBounce({ rho: 1, rho_crit: 0, Lambda_Tinv2: 0 }),
      ).toThrow(RangeError);
      expect(() =>
        evaluateQuantumBounce({ rho: 1, rho_crit: -1, Lambda_Tinv2: 0 }),
      ).toThrow(RangeError);
    });
  });
});
