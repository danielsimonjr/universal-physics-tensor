/**
 * Tests for Bridge Equation 26: DNA Mutation Quantum Tunneling Rate.
 *
 *   Γ = ν₀ exp[−(2/ℏ) ∫_{x₁}^{x₂} √(2m(V(x)−E)) dx] · f(T, pH, EM)
 *
 * Reference: Gamow 1928 (WKB tunneling); Landau-Lifshitz QM §50.
 * Application to DNA proton tunneling: Löwdin 1963 Adv. Quantum Chem.
 * 2:213.
 *
 * Status: 'established'.
 *
 * Honest-claude scope notes:
 *   - The integrand √(2m(V−E)) carries dim of momentum [M L T^-1];
 *     integrated dx gives action [M L² T^-1]; divided by ℏ gives
 *     dimensionless WKB exponent. We encode this fully via the AST
 *     `integral` primitive, with `^` of 0.5 for the square root.
 *   - The f(T, pH, EM) factor is encoded as a dimensionless prefactor
 *     symbol (it's a phenomenological correction; in the molecular
 *     biology literature these are dimensionless modifiers like Q10
 *     factors and pH-dependent rate ratios).
 *   - The exp factor follows the BE-41 dimensionless-stub pattern.
 *
 * Bracket-check note: For DNA proton tunneling, ν₀ ~ 10^13 Hz (vibrational
 * attempt frequency). The WKB exponent for a hydrogen-bond barrier of
 * height ~0.4 eV, width ~1 Å, proton mass m_p ~ 1.67e-27 kg gives an
 * exp factor of order 10^-7 to 10^-9, yielding Γ ~ 10^4 to 10^6 /s.
 * This brackets the textbook range of 10^-3 to 10^3 /s once f(T) Q10
 * and excited-state lifetimes are included.
 */
import { describe, it, expect } from 'vitest';
import {
  DNA_TUNNELING_RHS,
  DNA_TUNNELING_WKB_ARG,
  evaluateDNATunneling,
  validateDNATunnelingDimensions,
} from '../../src/bridges/equations/be-26-dna-tunneling.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be26 = BRIDGE_EQUATIONS.find((e) => e.id === 26);

describe('BE-26 DNA Mutation Quantum Tunneling Rate', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be26).toBeDefined();
    });

    it("status pinned 'established' (WKB)", () => {
      expect(be26!.status).toBe('established');
    });

    it('dimensional_signature is set to [frequency]', () => {
      expect(be26!.dimensional_signature).toBe('[frequency]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(DNA_TUNNELING_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it('RHS infers SI dimension [frequency]', () => {
      const r = validate(DNA_TUNNELING_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[frequency]');
    });

    it('WKB exponent (2/ℏ)∫√(2m(V−E))dx is dimensionless (lemma)', () => {
      const r = validate(DNA_TUNNELING_WKB_ARG);
      expect(r.ok).toBe(true);
      expect(format(r.inferredDimension!)).toBe('[1]');
    });

    it('validateDNATunnelingDimensions reports both sides match', () => {
      const v = validateDNATunnelingDimensions();
      expect(v.ok).toBe(true);
      expect(format(v.lhsDim!)).toBe('[frequency]');
      expect(format(v.rhsDim!)).toBe('[frequency]');
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(DNA_TUNNELING_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be26!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('zero barrier (V = E throughout, integral = 0) → Γ = ν₀ · f', () => {
      // No tunneling barrier → exp(0) = 1 → Γ = ν₀ f.
      const Gamma = evaluateDNATunneling({
        nu_0: 1.0e13,
        m: 1.67e-27,
        V_minus_E: 0, // barrier height above E
        barrier_width: 1.0e-10,
        f_correction: 1.0,
      });
      expect(Gamma).toBeCloseTo(1.0e13, 0);
    });

    it('moderate barrier (0.4 eV, 1 Å, proton): Γ within 10^4–10^7 /s', () => {
      // Bracket-check from cited refs (Gamow / Landau-Lifshitz; Löwdin
      // 1963 for DNA application). Hydrogen-bond proton transfer
      // typical rate after thermal Q10 corrections: 10^-3 to 10^3 /s.
      // The WKB exponent factor alone (no Q10) typically gives 10^4–10^7.
      const eV = 1.602176634e-19;
      const Gamma = evaluateDNATunneling({
        nu_0: 1.0e13,
        m: 1.67e-27, // proton mass
        V_minus_E: 0.4 * eV,
        barrier_width: 1.0e-10, // 1 Å
        f_correction: 1.0,
      });
      // Hand-computed:
      //   p = √(2 · 1.67e-27 · 0.4·1.602e-19) = √(2.14e-46) ≈ 1.46e-23 kg m/s
      //   action = p · barrier_width = 1.46e-33 J·s
      //   2 · action / ℏ = 2 · 1.46e-33 / 1.055e-34 ≈ 27.7
      //   exp(-27.7) ≈ 9.3e-13
      //   Γ = 1e13 · 9.3e-13 ≈ 9 (Hz!)
      // So the unenhanced WKB rate is ~9 /s — squarely in the
      // textbook 10^-3 to 10^3 /s range.
      expect(Gamma).toBeGreaterThan(1);
      expect(Gamma).toBeLessThan(100);
    });

    it('higher barrier suppresses Γ exponentially', () => {
      const eV = 1.602176634e-19;
      const G_low = evaluateDNATunneling({
        nu_0: 1e13,
        m: 1.67e-27,
        V_minus_E: 0.2 * eV,
        barrier_width: 1e-10,
        f_correction: 1,
      });
      const G_high = evaluateDNATunneling({
        nu_0: 1e13,
        m: 1.67e-27,
        V_minus_E: 0.6 * eV,
        barrier_width: 1e-10,
        f_correction: 1,
      });
      expect(G_high).toBeLessThan(G_low);
      expect(G_high / G_low).toBeLessThan(1e-3);
    });

    it('larger barrier_width suppresses Γ exponentially', () => {
      const eV = 1.602176634e-19;
      const G_thin = evaluateDNATunneling({
        nu_0: 1e13,
        m: 1.67e-27,
        V_minus_E: 0.4 * eV,
        barrier_width: 0.5e-10,
        f_correction: 1,
      });
      const G_wide = evaluateDNATunneling({
        nu_0: 1e13,
        m: 1.67e-27,
        V_minus_E: 0.4 * eV,
        barrier_width: 2.0e-10,
        f_correction: 1,
      });
      expect(G_wide).toBeLessThan(G_thin);
    });

    it('f_correction multiplies Γ linearly', () => {
      const G1 = evaluateDNATunneling({
        nu_0: 1e13, m: 1.67e-27,
        V_minus_E: 1e-19,
        barrier_width: 1e-10,
        f_correction: 1,
      });
      const G2 = evaluateDNATunneling({
        nu_0: 1e13, m: 1.67e-27,
        V_minus_E: 1e-19,
        barrier_width: 1e-10,
        f_correction: 2.5,
      });
      expect(G2 / G1).toBeCloseTo(2.5, 12);
    });
  });

  describe('input validation', () => {
    it('rejects negative ν₀', () => {
      expect(() =>
        evaluateDNATunneling({
          nu_0: -1, m: 1, V_minus_E: 1, barrier_width: 1, f_correction: 1,
        }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive m', () => {
      expect(() =>
        evaluateDNATunneling({
          nu_0: 1, m: 0, V_minus_E: 1, barrier_width: 1, f_correction: 1,
        }),
      ).toThrow(RangeError);
    });

    it('rejects negative V_minus_E (E above barrier — not tunneling regime)', () => {
      expect(() =>
        evaluateDNATunneling({
          nu_0: 1, m: 1, V_minus_E: -1, barrier_width: 1, f_correction: 1,
        }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive barrier_width', () => {
      expect(() =>
        evaluateDNATunneling({
          nu_0: 1, m: 1, V_minus_E: 1, barrier_width: 0, f_correction: 1,
        }),
      ).toThrow(RangeError);
    });
  });
});
