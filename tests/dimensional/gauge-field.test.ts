/**
 * Tests for `src/dimensional/gauge-field.ts` — GaugeFieldNode and
 * TimeSymmetryPredicateNode AST primitives for Wheeler-Feynman
 * absorber-theory time-symmetric electrodynamics.
 *
 * Wheeler-Feynman 1945 (Rev. Mod. Phys. 17:157) uses the half-retarded
 * + half-advanced potential A_μ = (1/2)[A_μ^ret + A_μ^adv]. This
 * module provides AST nodes to make the "two-arrow-of-time" structure
 * explicit.
 *
 * @module tests/dimensional/gauge-field
 */

import { describe, it, expect } from 'vitest';
import {
  validateGaugeField,
  validateTimeSymmetryPredicate,
  type GaugeFieldNode,
  type TimeSymmetryPredicateNode,
} from '../../src/dimensional/gauge-field.js';
import type { Dimension } from '../../src/dimensional/types.js';

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const DIMENSIONLESS: Dimension = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/** SI dim of the magnetic vector potential A_μ: V·s/m = kg·m/(A·s²). */
const MAGNETIC_VECTOR_POTENTIAL: Dimension = {
  L: 1, M: 1, T: -2, I: -1, Theta: 0, N: 0, J: 0,
};

/** A different dimension (mass) for mismatch tests. */
const MASS_DIM: Dimension = { L: 0, M: 1, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

function makeRetarded(dim: Dimension = MAGNETIC_VECTOR_POTENTIAL): GaugeFieldNode {
  return { kind: 'gauge-field', name: 'A_ret', arrowOfTime: 'retarded', dim };
}

function makeAdvanced(dim: Dimension = MAGNETIC_VECTOR_POTENTIAL): GaugeFieldNode {
  return { kind: 'gauge-field', name: 'A_adv', arrowOfTime: 'advanced', dim };
}

// ---------------------------------------------------------------------------
// GaugeFieldNode — happy paths
// ---------------------------------------------------------------------------

describe('validateGaugeField — happy paths', () => {
  it('accepts a retarded gauge field with MAGNETIC_VECTOR_POTENTIAL dim', () => {
    expect(() => validateGaugeField(makeRetarded())).not.toThrow();
  });

  it('accepts an advanced gauge field with MAGNETIC_VECTOR_POTENTIAL dim', () => {
    expect(() => validateGaugeField(makeAdvanced())).not.toThrow();
  });

  it('accepts a symmetric gauge field (half-half Wheeler-Feynman combination)', () => {
    const node: GaugeFieldNode = {
      kind: 'gauge-field',
      name: 'A_sym',
      arrowOfTime: 'symmetric',
      dim: MAGNETIC_VECTOR_POTENTIAL,
    };
    expect(() => validateGaugeField(node)).not.toThrow();
  });

  it('accepts a dimensionless gauge field (ratio framing)', () => {
    const node: GaugeFieldNode = {
      kind: 'gauge-field',
      name: 'A_ratio',
      arrowOfTime: 'retarded',
      dim: DIMENSIONLESS,
    };
    expect(() => validateGaugeField(node)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// GaugeFieldNode — predicate failures
// ---------------------------------------------------------------------------

describe('validateGaugeField — predicate failures', () => {
  it('throws when name is empty string', () => {
    const node: GaugeFieldNode = {
      kind: 'gauge-field', name: '', arrowOfTime: 'retarded', dim: MAGNETIC_VECTOR_POTENTIAL,
    };
    expect(() => validateGaugeField(node)).toThrow(/gauge-field/);
  });

  it('throws when name is whitespace-only', () => {
    const node: GaugeFieldNode = {
      kind: 'gauge-field', name: '   ', arrowOfTime: 'retarded', dim: MAGNETIC_VECTOR_POTENTIAL,
    };
    expect(() => validateGaugeField(node)).toThrow(/gauge-field/);
  });

  it('throws when arrowOfTime is invalid (e.g., "forward")', () => {
    const node = {
      kind: 'gauge-field' as const,
      name: 'A',
      arrowOfTime: 'forward' as GaugeFieldNode['arrowOfTime'],
      dim: MAGNETIC_VECTOR_POTENTIAL,
    };
    expect(() => validateGaugeField(node)).toThrow(/gauge-field/);
  });

  it('throws when a dim axis is NaN', () => {
    const node: GaugeFieldNode = {
      kind: 'gauge-field',
      name: 'A_bad',
      arrowOfTime: 'retarded',
      dim: { ...MAGNETIC_VECTOR_POTENTIAL, L: NaN },
    };
    expect(() => validateGaugeField(node)).toThrow(/gauge-field/);
  });

  it('throws when a dim axis is Infinity', () => {
    const node: GaugeFieldNode = {
      kind: 'gauge-field',
      name: 'A_inf',
      arrowOfTime: 'retarded',
      dim: { ...MAGNETIC_VECTOR_POTENTIAL, M: Infinity },
    };
    expect(() => validateGaugeField(node)).toThrow(/gauge-field/);
  });
});

// ---------------------------------------------------------------------------
// TimeSymmetryPredicateNode — happy paths
// ---------------------------------------------------------------------------

describe('validateTimeSymmetryPredicate — happy paths', () => {
  it('accepts canonical Wheeler-Feynman predicate with MAGNETIC_VECTOR_POTENTIAL dims', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: makeAdvanced(),
      epsilon: 1e-10,
    };
    const r = validateTimeSymmetryPredicate(node);
    expect(r.fieldDim).toEqual(MAGNETIC_VECTOR_POTENTIAL);
    expect(r.epsilon).toBe(1e-10);
  });

  it('accepts Cramer 1986 experimental bound (epsilon = 1e-2)', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: makeAdvanced(),
      epsilon: 1e-2,
    };
    const r = validateTimeSymmetryPredicate(node);
    expect(r.epsilon).toBe(1e-2);
  });

  it('accepts dimensionless fields (ratio framing)', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(DIMENSIONLESS),
      advanced: makeAdvanced(DIMENSIONLESS),
      epsilon: Number.EPSILON,
    };
    const r = validateTimeSymmetryPredicate(node);
    expect(r.fieldDim).toEqual(DIMENSIONLESS);
  });

  it('returns fieldDim equal to retarded.dim', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(MASS_DIM),
      advanced: makeAdvanced(MASS_DIM),
      epsilon: 0.1,
    };
    const r = validateTimeSymmetryPredicate(node);
    expect(r.fieldDim).toEqual(MASS_DIM);
  });
});

// ---------------------------------------------------------------------------
// TimeSymmetryPredicateNode — predicate failures
// ---------------------------------------------------------------------------

describe('validateTimeSymmetryPredicate — predicate failures', () => {
  it('throws with "symmetry" when retarded field carries arrowOfTime "advanced"', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: { ...makeRetarded(), arrowOfTime: 'advanced' },
      advanced: makeAdvanced(),
      epsilon: 1e-5,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/symmetry/);
  });

  it('throws with "symmetry" when retarded field carries arrowOfTime "symmetric"', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: { ...makeRetarded(), arrowOfTime: 'symmetric' },
      advanced: makeAdvanced(),
      epsilon: 1e-5,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/symmetry/);
  });

  it('throws with "symmetry" when advanced field carries arrowOfTime "retarded"', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: { ...makeAdvanced(), arrowOfTime: 'retarded' },
      epsilon: 1e-5,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/symmetry/);
  });

  it('throws with "dimension" when retarded and advanced dims mismatch', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(MAGNETIC_VECTOR_POTENTIAL),
      advanced: makeAdvanced(MASS_DIM), // wrong: different dim
      epsilon: 1e-5,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/dimension/);
  });

  it('throws when epsilon = 0 (non-positive)', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: makeAdvanced(),
      epsilon: 0,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/epsilon/);
  });

  it('throws when epsilon is negative', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: makeAdvanced(),
      epsilon: -1e-5,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/epsilon/);
  });

  it('throws when epsilon is Infinity', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: makeAdvanced(),
      epsilon: Infinity,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/epsilon/);
  });

  it('throws when epsilon is NaN', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: makeAdvanced(),
      epsilon: NaN,
    };
    expect(() => validateTimeSymmetryPredicate(node)).toThrow(/epsilon/);
  });
});

// ---------------------------------------------------------------------------
// Error-keyword discipline meta-test
// ---------------------------------------------------------------------------

describe('error-keyword discipline', () => {
  it('arrow-of-time mismatch errors contain "symmetry" keyword', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: { ...makeRetarded(), arrowOfTime: 'advanced' },
      advanced: makeAdvanced(),
      epsilon: 1e-5,
    };
    try {
      validateTimeSymmetryPredicate(node);
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).toMatch(/symmetry/);
      expect((e as Error).message).toContain('TimeSymmetryPredicateNode');
    }
  });

  it('dimension mismatch errors contain "dimension" keyword', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(MAGNETIC_VECTOR_POTENTIAL),
      advanced: makeAdvanced(MASS_DIM),
      epsilon: 1e-5,
    };
    try {
      validateTimeSymmetryPredicate(node);
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).toMatch(/dimension/);
      expect((e as Error).message).toContain('TimeSymmetryPredicateNode');
    }
  });

  it('epsilon errors name the epsilon field in the message', () => {
    const node: TimeSymmetryPredicateNode = {
      kind: 'time-symmetry-predicate',
      retarded: makeRetarded(),
      advanced: makeAdvanced(),
      epsilon: 0,
    };
    try {
      validateTimeSymmetryPredicate(node);
      expect.fail('Should have thrown');
    } catch (e) {
      expect((e as Error).message).toContain('epsilon');
    }
  });
});
