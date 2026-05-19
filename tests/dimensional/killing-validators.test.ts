// tests/dimensional/killing-validators.test.ts
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import type { KillingVectorNode } from '../../src/dimensional/killing-validators.js';
import type { ConservedChargeNode } from '../../src/dimensional/killing-validators.js';

const DIMENSIONLESS = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const LENGTH_PER_TIME = { L: 1, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 };

describe('KillingVectorNode validator', () => {
  it('rank-1 upper Killing field reports freeIndices μ:upper', () => {
    const xi: KillingVectorNode = {
      kind: 'killing-vector',
      vector: {
        kind: 'tensor-symbol',
        name: 'xi',
        indices: [{ label: 'μ', variance: 'upper' }],
        dim: LENGTH_PER_TIME,
      },
      metric: {
        kind: 'metric-tensor',
        name: 'g',
        indices: [
          { label: 'α', variance: 'lower' },
          { label: 'β', variance: 'lower' },
        ],
        signature: '-,+,+,+',
        dim: DIMENSIONLESS,
      },
    };
    const result = validate(xi as ExprNode);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(LENGTH_PER_TIME);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
  });

  it('rejects rank-2 vector (Killing fields are rank-1)', () => {
    const xi = {
      kind: 'killing-vector',
      vector: {
        kind: 'tensor-symbol',
        name: 'xi',
        indices: [
          { label: 'μ', variance: 'upper' },
          { label: 'ν', variance: 'upper' },
        ],
        dim: DIMENSIONLESS,
      },
      metric: {
        kind: 'metric-tensor',
        name: 'g',
        indices: [
          { label: 'α', variance: 'lower' },
          { label: 'β', variance: 'lower' },
        ],
        signature: '-,+,+,+',
        dim: DIMENSIONLESS,
      },
    } as unknown as ExprNode;
    expect(() => validate(xi)).toThrow(/rank-1/i);
  });

  it('rejects lower-variance vector (Killing is naturally upper)', () => {
    const xi = {
      kind: 'killing-vector',
      vector: {
        kind: 'tensor-symbol',
        name: 'xi',
        indices: [{ label: 'μ', variance: 'lower' }],
        dim: LENGTH_PER_TIME,
      },
      metric: {
        kind: 'metric-tensor',
        name: 'g',
        indices: [
          { label: 'α', variance: 'lower' },
          { label: 'β', variance: 'lower' },
        ],
        signature: '-,+,+,+',
        dim: DIMENSIONLESS,
      },
    } as unknown as ExprNode;
    expect(() => validate(xi)).toThrow(/upper/i);
  });
});

const MOMENTUM_DIM = { L: 1, M: 1, T: -1, I: 0, Theta: 0, N: 0, J: 0 };
const ENERGY_DIM = { L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

describe('ConservedChargeNode validator', () => {
  it('Q = xi^μ p_μ collapses to a scalar with [energy] dim', () => {
    const xi = {
      kind: 'tensor-symbol',
      name: 'xi',
      indices: [{ label: 'μ', variance: 'upper' as const }],
      dim: { L: 1, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const p = {
      kind: 'tensor-symbol',
      name: 'p',
      indices: [{ label: 'μ', variance: 'lower' as const }],
      dim: MOMENTUM_DIM,
    };
    const node: ConservedChargeNode = {
      kind: 'conserved-charge',
      killing: {
        kind: 'killing-vector',
        vector: xi,
        metric: {
          kind: 'metric-tensor',
          name: 'g',
          indices: [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
          signature: '-,+,+,+',
          dim: { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
        },
      },
      momentum: p,
    };
    const result = validate(node as ExprNode);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(ENERGY_DIM);
    expect(result.freeIndices.size).toBe(0);
  });

  it('rejects mismatched index labels (xi and p must contract on same label)', () => {
    const xi = {
      kind: 'tensor-symbol',
      name: 'xi',
      indices: [{ label: 'μ', variance: 'upper' as const }],
      dim: { L: 1, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const p = {
      kind: 'tensor-symbol',
      name: 'p',
      indices: [{ label: 'ν', variance: 'lower' as const }],
      dim: MOMENTUM_DIM,
    };
    const node = {
      kind: 'conserved-charge',
      killing: {
        kind: 'killing-vector',
        vector: xi,
        metric: {
          kind: 'metric-tensor',
          name: 'g',
          indices: [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
          signature: '-,+,+,+',
          dim: { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
        },
      },
      momentum: p,
    } as unknown as ExprNode;
    expect(() => validate(node)).toThrow(/index label/i);
  });
});
