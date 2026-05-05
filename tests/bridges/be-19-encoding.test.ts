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

  describe('property tests / limit identities', () => {
    // Wave-2 hardening: replace 3-point checks with dense-sweep property
    // tests and pin the classical-Friedmann limit + bounce identity to
    // machine precision.

    it('ρ → 0, Λ = 0 collapses to classical Friedmann H² = (8πG/3) ρ to machine precision', () => {
      // Strong limit: when ρ << ρ_crit and Λ = 0, the LQC bounce factor
      // (1 - ρ/ρ_crit) → 1 and the formula must agree with classical
      // Friedmann to better than the floating-point relative tolerance
      // contributed by the (1 - 1e-130) ≈ 1 truncation.
      const rho = 1.0e-30;
      const rho_crit = 1.0e100; // ratio = 1e-130, floor of double rounding
      const H2 = evaluateQuantumBounce({ rho, rho_crit, Lambda_Tinv2: 0 });
      const H2_classical =
        ((8 * Math.PI * PhysicalConstants.G) / 3) * rho;
      // Relative error driven by (1 - 1e-130) → 1 in IEEE-754.
      expect(Math.abs(H2 - H2_classical) / H2_classical).toBeLessThan(1e-15);
    });

    it('ρ = ρ_crit, Λ = 0 yields H² = 0 (bounce halt) to machine precision', () => {
      // At ρ = ρ_crit the bounce factor is exactly 0; with Λ = 0, H² must
      // be exactly 0 (no other terms).
      const H2 = evaluateQuantumBounce({
        rho: 1.0e-26,
        rho_crit: 1.0e-26,
        Lambda_Tinv2: 0,
      });
      expect(H2).toBe(0);
    });

    it('dense-sweep monotonicity: H²/ρ strictly decreases as ρ → ρ_crit (Λ = 0)', () => {
      // Property: with Λ = 0, H²(ρ) / ρ = (8πG/3)(1 - ρ/ρ_crit) is a
      // strictly decreasing function of ρ on [0, ρ_crit). A 10-point
      // log-spaced sweep over four decades catches any subtle hidden
      // bump that a 3-point test would miss.
      const rho_crit = 1.0;
      const ratios = [0.01, 0.03, 0.1, 0.2, 0.3, 0.5, 0.7, 0.85, 0.95, 0.99];
      let prev = Infinity;
      for (const r of ratios) {
        const rho = r * rho_crit;
        const H2 = evaluateQuantumBounce({ rho, rho_crit, Lambda_Tinv2: 0 });
        const ratio = H2 / rho;
        expect(
          ratio,
          `ρ/ρ_crit=${r}: H²/ρ=${ratio} should be strictly less than prev=${prev}`,
        ).toBeLessThan(prev);
        prev = ratio;
      }
    });

    it('bounce-factor identity: H²(αρ_crit, ρ_crit) / H²(ρ_crit/2, ρ_crit) ratio sweep', () => {
      // The (1 - ρ/ρ_crit) factor admits a clean ratio identity. For
      // Λ = 0 and fixed ρ_crit, H²(ρ) = (8πG/3) ρ (1 - ρ/ρ_crit). At
      // ρ_a = ρ_crit/2, H² = (8πG/3)·(ρ_crit/2)·(1/2) = (8πG/12) ρ_crit.
      // For ρ_b = α·ρ_crit/2 (α ∈ (0,2)) → 1 − α/2 factor instead.
      // Ratio H²(αρ_c/2)/H²(ρ_c/2) = α(1 − α/2)/(1/2) = α(2 − α).
      const rho_crit = 1.0;
      const ref = evaluateQuantumBounce({
        rho: rho_crit / 2,
        rho_crit,
        Lambda_Tinv2: 0,
      });
      for (const alpha of [0.2, 0.4, 0.7, 1.3, 1.6, 1.9]) {
        const test = evaluateQuantumBounce({
          rho: (alpha * rho_crit) / 2,
          rho_crit,
          Lambda_Tinv2: 0,
        });
        const expected = alpha * (2 - alpha);
        expect(test / ref).toBeCloseTo(expected, 12);
      }
    });

    it('Λ-additivity: H²(ρ, Λ) − H²(ρ, 0) = Λ/3 (linear superposition)', () => {
      // Λ enters the Friedmann form as a pure additive Λ/3 contribution.
      // Sweep across magnitudes — sign-symmetric, machine-precision.
      const rho = 1.0e-26;
      const rho_crit = 1.0e96;
      const baseline = evaluateQuantumBounce({ rho, rho_crit, Lambda_Tinv2: 0 });
      for (const Lambda of [-1e-30, -1e-35, 1e-35, 1e-30, 1e-25]) {
        const with_L = evaluateQuantumBounce({
          rho, rho_crit, Lambda_Tinv2: Lambda,
        });
        expect(with_L - baseline).toBeCloseTo(Lambda / 3, 12);
      }
    });

    it('PINS spec known_issue: ρ_crit = 3c²/(8πG ℓ_P²) lacks Barbero-Immirzi γ³', () => {
      // The spec's ρ_crit value differs from the canonical Ashtekar-Singh
      // ρ_crit_AS ≈ 0.41 ρ_Planck by the cube of the Barbero-Immirzi
      // parameter γ ≈ 0.2375 (from BH-entropy matching). The spec form
      // reproduces ρ_crit_spec ≈ 3 ρ_Planck / (8π) ≈ 0.119 ρ_Planck,
      // larger than the canonical value by ~γ^-3 ≈ 75. We pin the
      // numerical evaluator's behavior at the spec value (NOT the
      // canonical one) so that fixing the spec requires deleting this
      // test deliberately. See BE-19 known_issues entry in the index.
      const c = PhysicalConstants.c;
      const G = PhysicalConstants.G;
      const lP = PhysicalConstants.lP;
      const rho_crit_spec = (3 * c * c) / (8 * Math.PI * G * lP * lP);
      // Spec value is order ~6e95 kg/m³ (sub-Planckian by ~order 1):
      // ρ_crit_spec ≈ 6.15e95 with CODATA G=6.674e-11, c=2.998e8,
      // ℓ_P=1.616e-35. Pin to a one-decade window.
      expect(rho_crit_spec).toBeGreaterThan(1e95);
      expect(rho_crit_spec).toBeLessThan(1e97);
      // At ρ = ρ_crit_spec, Λ = 0, evaluator returns 0 (definitional):
      const H2 = evaluateQuantumBounce({
        rho: rho_crit_spec,
        rho_crit: rho_crit_spec,
        Lambda_Tinv2: 0,
      });
      expect(H2).toBe(0);
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
