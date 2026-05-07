/**
 * Tier-5 AST encoding test for BE-49 — Quantum Darwinism mutual-information decay.
 *
 * Form: I(S:F_k) = I(S:E) - α k^(-β)  (leading-order asymptotic for the
 * spec's `O(k^-α)` correction; β pinned to 1 — the standard
 * good-information-broadcasting regime per Zurek 2009).
 *
 * Status pin: 'speculative' (Quantum Darwinism formalism canonical;
 * specific algebraic decay form is a phenomenological-ansatz extension).
 *
 * @see src/bridges/equations/be-49-quantum-darwinism.ts
 * @see docs/specification/Part-II.md ("Bridge Equation 49")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 49)
 */

import { describe, it, expect } from 'vitest';
import {
  BE49_QUANTUM_DARWINISM_RHS,
  BE49_QUANTUM_DARWINISM_LHS,
  evaluateQuantumDarwinism,
  validateBE49Dimensions,
} from '../../src/bridges/equations/be-49-quantum-darwinism.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-49 Quantum Darwinism mutual-information decay — Tier 5 AST encoding', () => {
  describe('Catalog round-trip', () => {
    const be49 = BRIDGE_EQUATIONS.find((e) => e.id === 49);

    it('exists', () => {
      expect(be49).toBeDefined();
    });

    it("dimensional_signature pinned to '[1]'", () => {
      expect(be49!.dimensional_signature).toBe('[1]');
    });

    it('round-trips: format(infer(RHS)) === dimensional_signature', () => {
      const inferredDim = validate(BE49_QUANTUM_DARWINISM_RHS).inferredDimension;
      expect(inferredDim).toBeDefined();
      expect(format(inferredDim!)).toBe(be49!.dimensional_signature);
    });

    it("status pinned 'speculative'", () => {
      expect(be49!.status).toBe('speculative');
    });
  });

  describe('Dimensional structure', () => {
    it('LHS is dimensionless', () => {
      const r = validate(BE49_QUANTUM_DARWINISM_LHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('RHS is dimensionless', () => {
      const r = validate(BE49_QUANTUM_DARWINISM_RHS);
      expect(r.ok).toBe(true);
      expect(r.inferredDimension).toEqual(DIMENSIONLESS);
    });

    it('full equation validates', () => {
      const eq = validateEquation(BE49_QUANTUM_DARWINISM_LHS, BE49_QUANTUM_DARWINISM_RHS);
      expect(eq.ok).toBe(true);
    });

    it('validateBE49Dimensions reports both sides as dimensionless', () => {
      const r = validateBE49Dimensions();
      expect(r.ok).toBe(true);
      expect(r.lhsDim).toEqual(DIMENSIONLESS);
      expect(r.rhsDim).toEqual(DIMENSIONLESS);
    });
  });

  describe('Numerical evaluator — bracket checks', () => {
    it('identity at k = 1: I(S:F_1) = I(S:E) - α', () => {
      // k = 1, β = 1 → k^(-β) = 1 → I = I_SE - α
      const I_SE = 1.0;
      const alpha = 0.1;
      const I = evaluateQuantumDarwinism({ I_SE, alpha, k: 1, beta: 1 });
      expect(I).toBeCloseTo(I_SE - alpha, 14);
    });

    it('I(S:F_k) → I(S:E) as k → ∞', () => {
      const I_SE = 1.0;
      const alpha = 0.1;
      const I_huge = evaluateQuantumDarwinism({ I_SE, alpha, k: 1e12, beta: 1 });
      expect(I_huge).toBeCloseTo(I_SE, 10);
    });

    it('monotonic increase in k for fixed (α, I_SE, β=1)', () => {
      const I_SE = 1.0;
      const alpha = 0.1;
      const ks = [1, 2, 5, 10, 100, 1000];
      const Is = ks.map((k) =>
        evaluateQuantumDarwinism({ I_SE, alpha, k, beta: 1 }),
      );
      for (let i = 1; i < Is.length; i++) {
        expect(Is[i]).toBeGreaterThan(Is[i - 1]);
      }
    });

    it('hand-computed: I_SE = 1, α = 0.5, k = 2, β = 1 → I = 1 - 0.5/2 = 0.75', () => {
      const I = evaluateQuantumDarwinism({ I_SE: 1, alpha: 0.5, k: 2, beta: 1 });
      expect(I).toBeCloseTo(0.75, 14);
    });

    it('β = 2 case: I_SE = 1, α = 1, k = 2, β = 2 → I = 1 - 1/4 = 0.75', () => {
      // Demonstrates evaluator is β-agnostic even though AST pins β = 1.
      const I = evaluateQuantumDarwinism({ I_SE: 1, alpha: 1, k: 2, beta: 2 });
      expect(I).toBeCloseTo(0.75, 14);
    });

    it('linear in α at fixed (k, β): I_SE - I scales linearly with α', () => {
      const I_SE = 1.0;
      const k = 5;
      const beta = 1;
      const I_a1 = evaluateQuantumDarwinism({ I_SE, alpha: 0.1, k, beta });
      const I_a2 = evaluateQuantumDarwinism({ I_SE, alpha: 0.2, k, beta });
      expect((I_SE - I_a2) / (I_SE - I_a1)).toBeCloseTo(2, 12);
    });

    it('large-k decay rate: ratio (I_SE - I(2k))/(I_SE - I(k)) = 2^(-β) for β = 1', () => {
      const I_SE = 1.0;
      const alpha = 0.1;
      const k = 10;
      const I_k = evaluateQuantumDarwinism({ I_SE, alpha, k, beta: 1 });
      const I_2k = evaluateQuantumDarwinism({ I_SE, alpha, k: 2 * k, beta: 1 });
      const ratio = (I_SE - I_2k) / (I_SE - I_k);
      expect(ratio).toBeCloseTo(0.5, 12); // 2^(-1) = 1/2
    });
  });

  describe('Numerical evaluator — input validation', () => {
    it('rejects non-finite I_SE', () => {
      expect(() =>
        evaluateQuantumDarwinism({ I_SE: NaN, alpha: 0.1, k: 1, beta: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite alpha', () => {
      expect(() =>
        evaluateQuantumDarwinism({ I_SE: 1, alpha: Infinity, k: 1, beta: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-positive k', () => {
      expect(() =>
        evaluateQuantumDarwinism({ I_SE: 1, alpha: 0.1, k: 0, beta: 1 }),
      ).toThrow(RangeError);
    });

    it('rejects non-finite beta', () => {
      expect(() =>
        evaluateQuantumDarwinism({ I_SE: 1, alpha: 0.1, k: 1, beta: NaN }),
      ).toThrow(RangeError);
    });
  });
});
