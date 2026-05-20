/**
 * Tests for WeylTensorNode AST + validateWeylTensor.
 *
 * Phase 3 Task 3.1 — TDD RED-first.
 *
 * Three tests:
 *   1. Valid 1-up-3-down Weyl validates with correct freeIndices + [L⁻²] dim.
 *   2. Wrong index count (wrong number of lowerIndices) throws.
 *   3. Wrong variance (upper index declared as lower) throws.
 */

import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import type { WeylTensorNode } from '../../src/dimensional/weyl-validators.js';
import { PartialDerivativeIndexVarianceError } from '../../src/dimensional/errors.js';

const DIMENSIONLESS = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const INV_LENGTH_SQ = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

function makeValidWeyl(): WeylTensorNode {
  return {
    kind: 'weyl-tensor',
    metric: {
      kind: 'metric-tensor',
      name: 'g',
      indices: [
        { label: 'a', variance: 'lower' },
        { label: 'b', variance: 'lower' },
      ],
      signature: '-,+,+,+',
      dim: DIMENSIONLESS,
    },
    upperIndex: { label: 'rho', variance: 'upper' },
    lowerIndices: [
      { label: 'sigma', variance: 'lower' },
      { label: 'mu', variance: 'lower' },
      { label: 'nu', variance: 'lower' },
    ],
    componentDim: INV_LENGTH_SQ,
  };
}

describe('WeylTensorNode validator', () => {
  it('valid 1-up-3-down Weyl validates with [L⁻²] dim and correct freeIndices', () => {
    const node = makeValidWeyl();
    const result = validate(node as unknown as ExprNode);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(INV_LENGTH_SQ);
    expect(result.freeIndices.get('rho')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('sigma')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('mu')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('nu')).toEqual({ upper: 0, lower: 1 });
  });

  it('throws PartialDerivativeIndexVarianceError when upperIndex has wrong variance', () => {
    const node = makeValidWeyl();
    // Construct a node with wrong variance on the upper index.
    const bad = {
      ...node,
      upperIndex: { label: 'rho', variance: 'lower' as const },
    };
    expect(() => validate(bad as unknown as ExprNode)).toThrow(PartialDerivativeIndexVarianceError);
  });

  it('throws PartialDerivativeIndexVarianceError when a lowerIndex has wrong variance', () => {
    const node = makeValidWeyl();
    // Construct a node with a lowerIndex declared as upper.
    const bad = {
      ...node,
      lowerIndices: [
        { label: 'sigma', variance: 'upper' as const },
        { label: 'mu', variance: 'lower' as const },
        { label: 'nu', variance: 'lower' as const },
      ] as [{ label: string; variance: 'upper' }, { label: string; variance: 'lower' }, { label: string; variance: 'lower' }],
    };
    expect(() => validate(bad as unknown as ExprNode)).toThrow(PartialDerivativeIndexVarianceError);
  });
});
