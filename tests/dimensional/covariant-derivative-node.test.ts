import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

const gLower = metric('g',
  [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  DIMENSIONLESS, '+,-,-,-');
const gInverse = metric('gInv',
  [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  DIMENSIONLESS, '+,-,-,-');
const xCoord = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');

describe('covariant-derivative node', () => {
  it('∇_μ V^ν validates as rank-2 with freeIndices {μ:lower, ν:upper}', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower, gInverse,
    };
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(r.freeIndices.size).toBe(2);
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ν')).toEqual({ upper: 1, lower: 0 });
    // Critically: gLower/gInverse's free indices (a, b) MUST NOT appear in the output.
    expect(r.freeIndices.has('a')).toBe(false);
    expect(r.freeIndices.has('b')).toBe(false);
  });

  it('∇_μ S (scalar S) validates as rank-1 with freeIndices {μ:lower}', () => {
    const S = tsym('S', [], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: S, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower, gInverse,
    };
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(r.freeIndices.size).toBe(1);
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
  });

  it('throws when wrtIndex.variance is "upper"', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'upper' } as never,
      gLower, gInverse,
    };
    expect(() => validate(node)).toThrow(/wrtIndex.*lower/i);
  });

  it('throws when gLower variance is not both-lower', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower: gInverse, gInverse,  // both upper → wrong for gLower slot
    };
    expect(() => validate(node)).toThrow(/gLower.*both-lower|covariant metric/i);
  });

  it('throws when gInverse variance is not both-upper', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V, wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower, gInverse: gLower,  // both lower → wrong for gInverse slot
    };
    expect(() => validate(node)).toThrow(/gInverse.*both-upper|inverse metric/i);
  });
});
