/**
 * Tests for Bridge Equation 32: Quantum Reference Frame (QRF) overlap.
 *
 * Original spec:   |ψ⟩_B = ∫ dg U(g) |ψ⟩_A ⊗ |g⟩_frame   (operator-valued)
 * Encoded scalar:  P_overlap = |⟨ψ_A | U(g) | ψ_B⟩|² = c² + s²
 *
 * References: Giacomini-Castro-Ruiz-Brukner 2019 Nat. Commun. 10:494
 * (arXiv:1712.07207); Vanrietvelde et al. 2020 Quantum 4:225;
 * Bartlett-Rudolph-Spekkens 2007 RMP 79:555.
 *
 * Honest-claude scope notes:
 *   - The encoding is the Born-rule probability for a single (implicit)
 *     group element g. The group-average `∫ dg` is deferred — it would
 *     require committing to a specific group and a Haar regulator.
 *   - U(g) is collapsed symbolically to its real / imaginary
 *     matrix-element components c and s; the AST does not see group
 *     structure, only `c² + s²`.
 *   - Status pinned 'speculative' — Born's rule itself is established,
 *     but the QRF-bridge framing of BE-32 in this catalog (which
 *     gravitational / relational structure U(g) corresponds to) is
 *     unbridged in the literature. The encoding pins the math; the
 *     QRF-bridge interpretation is the speculative content. Promoting
 *     'speculative' → 'established' requires deleting the status-pin
 *     test below deliberately (BE-22/BE-23 honest-archaeology pattern).
 */
import { describe, it, expect } from 'vitest';
import {
  BE32_QRF_OVERLAP_RHS,
  BE32_REAL_PART_SQUARED,
  BE32_IMAG_PART_SQUARED,
  evaluateQRFOverlap,
} from '../../src/bridges/equations/be-32-quantum-reference-frame.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be32 = BRIDGE_EQUATIONS.find((e) => e.id === 32);

describe('BE-32 Quantum Reference Frame overlap (Born-rule scalar reduction)', () => {
  describe('index entry invariants', () => {
    it('exists in the index', () => {
      expect(be32).toBeDefined();
    });

    it("status pinned 'speculative' (encoding does NOT promote)", () => {
      // Born's rule itself is established, but the QRF-bridge framing
      // of BE-32 in this catalog requires identifying which physical
      // gravitational / relational structure U(g) corresponds to. The
      // encoding pins the math; the bridge framing is the speculative
      // content. Promoting 'speculative' → 'established' requires
      // deleting this test deliberately.
      expect(be32!.status).toBe('speculative');
    });

    it('dimensional_signature is set to [1] (Born-rule probability is dimensionless)', () => {
      expect(be32!.dimensional_signature).toBe('[1]');
    });
  });

  describe('dimensional validation', () => {
    it('AST validates cleanly through the dimensional analyzer', () => {
      const r = validate(BE32_QRF_OVERLAP_RHS);
      expect(r.ok).toBe(true);
      expect(r.violations).toEqual([]);
    });

    it("RHS infers SI dimension '[1]' (round-trip pin)", () => {
      const r = validate(BE32_QRF_OVERLAP_RHS);
      expect(r.inferredDimension).not.toBeNull();
      expect(format(r.inferredDimension!)).toBe('[1]');
    });

    it('BE32_REAL_PART_SQUARED (c²) is dimensionless', () => {
      const r = validate(BE32_REAL_PART_SQUARED);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('BE32_IMAG_PART_SQUARED (s²) is dimensionless', () => {
      const r = validate(BE32_IMAG_PART_SQUARED);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('bridge index dimensional_signature matches the AST inference', () => {
      const inferred = validate(BE32_QRF_OVERLAP_RHS).inferredDimension;
      expect(inferred).not.toBeNull();
      expect(be32!.dimensional_signature).toBe(format(inferred!));
    });
  });

  describe('numerical evaluation', () => {
    it('identity overlap (c=1, s=0) returns P = 1.0', () => {
      // ⟨ψ_A|U(g)|ψ_B⟩ = 1 + 0i corresponds to U(g)|ψ_B⟩ = |ψ_A⟩
      // (states agree under the frame map). Born probability = 1.
      const P = evaluateQRFOverlap({ real_part: 1.0, imag_part: 0.0 });
      expect(P).toBeCloseTo(1.0, 14);
    });

    it('orthogonal (c=0, s=0) returns P = 0.0', () => {
      // Vanishing matrix element ⟨ψ_A|U(g)|ψ_B⟩ = 0 means the two
      // states are orthogonal under U(g): zero overlap probability.
      const P = evaluateQRFOverlap({ real_part: 0.0, imag_part: 0.0 });
      expect(P).toBe(0.0);
    });

    it('Pythagorean unit-normalisation: c=0.6, s=0.8 → P = 1.0', () => {
      // (3,4,5) Pythagorean triple scaled to the unit circle: 0.6²+0.8²=1.
      // A canonical numerical anchor that the c²+s² accumulation is right
      // — any sign or operator typo lands on a different float.
      const P = evaluateQRFOverlap({ real_part: 0.6, imag_part: 0.8 });
      expect(P).toBeCloseTo(1.0, 14);
    });

    it('half-amplitude (c=1/√2, s=0) returns P = 0.5', () => {
      // ⟨ψ_A|U(g)|ψ_B⟩ = 1/√2 + 0i corresponds to a 50/50 superposition
      // overlap. P = (1/√2)² = 1/2.
      const P = evaluateQRFOverlap({ real_part: 1 / Math.sqrt(2), imag_part: 0.0 });
      expect(P).toBeCloseTo(0.5, 14);
    });
  });

  describe('input validation', () => {
    it('rejects non-finite real_part', () => {
      expect(() =>
        evaluateQRFOverlap({ real_part: NaN, imag_part: 0.0 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite imag_part', () => {
      expect(() =>
        evaluateQRFOverlap({ real_part: 0.0, imag_part: Infinity }),
      ).toThrow(RangeError);
    });

    it('rejects Born-rule violation (c=2, s=0 → P = 4 > 1)', () => {
      // c=2, s=0 yields c²+s² = 4, which cannot correspond to a
      // normalised-state overlap. The Born-rule guard must trip.
      expect(() =>
        evaluateQRFOverlap({ real_part: 2.0, imag_part: 0.0 }),
      ).toThrow(RangeError);
    });
  });
});
