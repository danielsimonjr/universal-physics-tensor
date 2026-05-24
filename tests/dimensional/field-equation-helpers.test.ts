/**
 * Unit tests for `src/dimensional/field-equation-helpers.ts`.
 *
 * Phase 0 of the `TensorEquationNode<LHS,RHS>` generalization
 * (`docs/architecture/v0.7-tensor-equation-node-design-note.md`).
 * Tests behavior-preserving extraction: every error-message
 * keyword the existing `validateEinsteinFieldEquation` tests
 * pattern-matched against ("index label", "dimension", "symmetry")
 * is preserved.
 *
 * @module tests/dimensional/field-equation-helpers
 */

import { describe, it, expect } from 'vitest';
import {
  validateFreeIndexLabelMatch,
  validateComponentDimension,
  validateTensorSymmetry,
} from '../../src/dimensional/field-equation-helpers.js';
import type { Dimension } from '../../src/dimensional/types.js';

const DIM_L_INV2: Dimension = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const DIM_T_MUV: Dimension = { L: -1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

// ---------------------------------------------------------------------------
// validateFreeIndexLabelMatch
// ---------------------------------------------------------------------------

describe('validateFreeIndexLabelMatch', () => {
  it('passes when labels match in order', () => {
    expect(() => validateFreeIndexLabelMatch(
      'TestEq', 'lhs', ['mu', 'nu'], 'rhs', ['mu', 'nu'],
    )).not.toThrow();
  });

  it('throws with "index label" on a single-axis mismatch', () => {
    expect(() => validateFreeIndexLabelMatch(
      'TestEq', 'G_μν', ['mu', 'nu'], 'T_μν', ['mu', 'rho'],
    )).toThrow(/index label/);
  });

  it('throws when rank differs (rank-2 vs rank-1)', () => {
    expect(() => validateFreeIndexLabelMatch(
      'TestEq', 'lhs', ['mu', 'nu'], 'rhs', ['mu'],
    )).toThrow(/rank mismatch/);
  });

  it('error message includes the equationKind discriminator', () => {
    try {
      validateFreeIndexLabelMatch('MyEquation', 'A', ['x'], 'B', ['y']);
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('MyEquation');
    }
  });

  it('error message includes both tensor names', () => {
    try {
      validateFreeIndexLabelMatch('TestEq', 'AlphaTensor', ['x'], 'BetaTensor', ['y']);
      expect.fail('should have thrown');
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain('AlphaTensor');
      expect(msg).toContain('BetaTensor');
    }
  });

  it('supports rank-1 case (Maxwell-style sourced eq)', () => {
    // ∇_μ F^{μν} = μ₀ J^ν — both sides rank-1 in ν.
    expect(() => validateFreeIndexLabelMatch(
      'MaxwellEq', '∇_μ F^{μν}', ['nu'], 'μ₀ J^ν', ['nu'],
    )).not.toThrow();
  });

  it('supports rank-0 case (scalar equation)', () => {
    // (□ + m²) φ = J — both sides scalar (no free indices).
    expect(() => validateFreeIndexLabelMatch(
      'KleinGordon', '(□+m²)φ', [], 'J', [],
    )).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// validateComponentDimension
// ---------------------------------------------------------------------------

describe('validateComponentDimension', () => {
  it('passes when all 7 base axes match', () => {
    expect(() => validateComponentDimension(
      'TestEq', 'someTensor', DIM_T_MUV, DIM_T_MUV,
    )).not.toThrow();
  });

  it('throws with "dimension" keyword on mismatch', () => {
    expect(() => validateComponentDimension(
      'TestEq', 'T_μν', DIM_L_INV2, DIM_T_MUV,
    )).toThrow(/dimension/);
  });

  it('error message names the equationKind', () => {
    try {
      validateComponentDimension('FooEquation', 'X', DIM_L_INV2, DIM_T_MUV);
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('FooEquation');
    }
  });

  it('error message includes the tensorName', () => {
    try {
      validateComponentDimension('TestEq', 'MyTensor_componentDim', DIM_L_INV2, DIM_T_MUV);
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('MyTensor_componentDim');
    }
  });

  it('error message includes optional explanation', () => {
    try {
      validateComponentDimension(
        'TestEq', 'T_μν', DIM_L_INV2, DIM_T_MUV,
        'so that κT_μν ~ [L⁻²].',
      );
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('κT_μν');
    }
  });

  it('detects mismatch on any single axis (L)', () => {
    const wrong = { ...DIM_T_MUV, L: 0 };
    expect(() => validateComponentDimension(
      'TestEq', 'X', wrong, DIM_T_MUV,
    )).toThrow();
  });

  it('detects mismatch on M axis', () => {
    const wrong = { ...DIM_T_MUV, M: 0 };
    expect(() => validateComponentDimension('TestEq', 'X', wrong, DIM_T_MUV)).toThrow();
  });

  it('detects mismatch on T axis', () => {
    const wrong = { ...DIM_T_MUV, T: 0 };
    expect(() => validateComponentDimension('TestEq', 'X', wrong, DIM_T_MUV)).toThrow();
  });

  it('detects mismatch on Theta axis', () => {
    const wrong = { ...DIM_T_MUV, Theta: 1 };
    expect(() => validateComponentDimension('TestEq', 'X', wrong, DIM_T_MUV)).toThrow();
  });
});

// ---------------------------------------------------------------------------
// validateTensorSymmetry
// ---------------------------------------------------------------------------

describe('validateTensorSymmetry', () => {
  it('passes when symmetry matches', () => {
    expect(() => validateTensorSymmetry(
      'TestEq', 'T_μν', 'symmetric', 'symmetric',
    )).not.toThrow();
  });

  it('throws with "symmetry" keyword on mismatch', () => {
    expect(() => validateTensorSymmetry(
      'TestEq', 'T_μν', 'antisymmetric', 'symmetric',
    )).toThrow(/symmetry/);
  });

  it('error message names actual + expected', () => {
    try {
      validateTensorSymmetry('TestEq', 'T_μν', 'antisymmetric', 'symmetric');
      expect.fail('should have thrown');
    } catch (e) {
      const msg = (e as Error).message;
      expect(msg).toContain('antisymmetric');
      expect(msg).toContain('symmetric');
    }
  });

  it('error message includes the equationKind discriminator', () => {
    try {
      validateTensorSymmetry('SomeEq', 'X', 'a', 'b');
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('SomeEq');
    }
  });

  it('error message includes optional explanation', () => {
    try {
      validateTensorSymmetry(
        'TestEq', 'T_μν', 'antisymmetric', 'symmetric',
        'Both sides must be symmetric.',
      );
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('Both sides must be symmetric');
    }
  });

  it('supports antisymmetric expected (e.g., Maxwell F_μν)', () => {
    expect(() => validateTensorSymmetry(
      'MaxwellEq', 'F_μν', 'antisymmetric', 'antisymmetric',
    )).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Behavior-preservation pinned: existing EFE error-message keywords
// ---------------------------------------------------------------------------

describe('behavior preservation: EFE error-keyword discipline', () => {
  // Pins that the helpers continue to use the same keyword markers the
  // existing validateEinsteinFieldEquation tests rely on. If a future
  // refactor changes these keywords, the EFE tests catch the regression
  // — these tests catch it earlier with a clearer signal.

  it('predicate 1 errors contain "index label"', () => {
    try {
      validateFreeIndexLabelMatch(
        'EinsteinFieldEquationNode', 'G_μν', ['mu', 'nu'], 'T_μν', ['rho', 'sigma'],
      );
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toMatch(/index label/);
    }
  });

  it('predicate 2 errors contain "dimension"', () => {
    try {
      validateComponentDimension(
        'EinsteinFieldEquationNode', 'T_μν componentDim',
        DIM_L_INV2, DIM_T_MUV,
      );
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toMatch(/dimension/);
    }
  });

  it('predicate 3 errors contain "symmetry"', () => {
    try {
      validateTensorSymmetry(
        'EinsteinFieldEquationNode', 'T_μν',
        'antisymmetric', 'symmetric',
      );
      expect.fail('should have thrown');
    } catch (e) {
      expect((e as Error).message).toMatch(/symmetry/);
    }
  });
});
