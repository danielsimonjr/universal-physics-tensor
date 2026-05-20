/**
 * Tests for KretschmannScalarNode AST + validator (v0.6.0 Phase 3, Task 3.5).
 */
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import type { KretschmannScalarNode } from '../../src/dimensional/curvature-invariants.js';
import type { RiemannTensorNode } from '../../src/dimensional/connection-validators.js';
import type { MetricTensorNode } from '../../src/dimensional/metric-validators.js';

const DIMENSIONLESS: { L: 0; M: 0; T: 0; I: 0; Theta: 0; N: 0; J: 0 } = {
  L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
};

const L_NEG2 = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

const L_NEG4 = { L: -4, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/** Minimal valid RiemannTensorNode for use in sub-node tests. */
function makeRiemann(): RiemannTensorNode {
  return {
    kind: 'riemann-tensor',
    upperIndex: { label: 'rho', variance: 'upper' },
    lowerIndices: [
      { label: 'sigma', variance: 'lower' },
      { label: 'mu', variance: 'lower' },
      { label: 'nu', variance: 'lower' },
    ],
    gLower: {
      kind: 'metric-tensor',
      name: 'g',
      indices: [
        { label: 'a', variance: 'lower' },
        { label: 'b', variance: 'lower' },
      ],
      signature: '-,+,+,+',
      dim: DIMENSIONLESS,
    },
    gInverse: {
      kind: 'metric-tensor',
      name: 'g_inv',
      indices: [
        { label: 'c', variance: 'upper' },
        { label: 'd', variance: 'upper' },
      ],
      signature: '-,+,+,+',
      dim: DIMENSIONLESS,
    },
    xCoord: {
      kind: 'tensor-symbol',
      name: 'x',
      indices: [{ label: 'e', variance: 'upper' }],
      dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    },
  };
}

/** Minimal valid metric tensor for use in sub-node tests (both-lower for index-raise). */
function makeMetric(): MetricTensorNode {
  return {
    kind: 'metric-tensor',
    name: 'g',
    indices: [
      { label: 'p', variance: 'lower' },
      { label: 'q', variance: 'lower' },
    ],
    signature: '-,+,+,+',
    dim: DIMENSIONLESS,
  };
}

describe('KretschmannScalarNode validator', () => {
  it('valid KretschmannScalarNode validates as scalar with [L⁻⁴] dim and empty freeIndices', () => {
    const node: KretschmannScalarNode = {
      kind: 'kretschmann-scalar',
      riemann: makeRiemann(),
      metric: makeMetric(),
    };
    const result = validate(node as unknown as ExprNode);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(L_NEG4);
    expect(result.freeIndices.size).toBe(0);
  });

  it('malformed embedded Riemann (wrong upperIndex variance) causes validator to throw', () => {
    const badRiemann = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'rho', variance: 'lower' }, // WRONG — must be 'upper'
      lowerIndices: [
        { label: 'sigma', variance: 'lower' },
        { label: 'mu', variance: 'lower' },
        { label: 'nu', variance: 'lower' },
      ],
      gLower: {
        kind: 'metric-tensor',
        name: 'g',
        indices: [
          { label: 'a', variance: 'lower' },
          { label: 'b', variance: 'lower' },
        ],
        signature: '-,+,+,+',
        dim: DIMENSIONLESS,
      },
      gInverse: {
        kind: 'metric-tensor',
        name: 'g_inv',
        indices: [
          { label: 'c', variance: 'upper' },
          { label: 'd', variance: 'upper' },
        ],
        signature: '-,+,+,+',
        dim: DIMENSIONLESS,
      },
      xCoord: {
        kind: 'tensor-symbol',
        name: 'x',
        indices: [{ label: 'e', variance: 'upper' }],
        dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
      },
    };
    const node = {
      kind: 'kretschmann-scalar',
      riemann: badRiemann,
      metric: makeMetric(),
    };
    expect(() => validate(node as unknown as ExprNode)).toThrow();
  });
});
