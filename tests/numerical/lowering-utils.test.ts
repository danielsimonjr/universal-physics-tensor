/**
 * Coverage for the shared `numerical/lowering-utils` helpers and
 * `metric-inverse`'s `scanForMetricPair` (including its null arms) — both were
 * exercised only indirectly through the lowering dispatcher.
 */
import { describe, it, expect } from 'vitest';
import {
  isMetricTensorNode,
  dimensionOf,
  requireValue,
  flattenNestedArray,
} from '../../src/numerical/lowering-utils.js';
import { scanForMetricPair } from '../../src/numerical/metric-inverse.js';
import { metric } from '../../src/dimensional/metric.js';
import { tsym } from '../../src/dimensional/tensor.js';
import type { NumericalInputs } from '../../src/numerical/types.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS, LENGTH } from '../../src/dimensional/types.js';

const gLower = metric('g',
  [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  DIMENSIONLESS, '+,-,-,-');
const gUpper = metric('gInv',
  [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  DIMENSIONLESS, '+,-,-,-');

describe('lowering-utils', () => {
  describe('isMetricTensorNode', () => {
    it('accepts a metric-tensor node, rejects others / null / non-objects', () => {
      expect(isMetricTensorNode(gLower)).toBe(true);
      expect(isMetricTensorNode({ kind: 'op', op: '*', args: [] })).toBe(false);
      expect(isMetricTensorNode(null)).toBe(false);
      expect(isMetricTensorNode(42)).toBe(false);
      expect(isMetricTensorNode(undefined)).toBe(false);
    });
  });

  describe('dimensionOf', () => {
    const base: NumericalInputs = { tensors: new Map() };
    it('defaults to 4 when dimension is absent', () => {
      expect(dimensionOf(base)).toBe(4);
    });
    it('returns the supplied dimension', () => {
      expect(dimensionOf({ ...base, dimension: 3 })).toBe(3);
    });
  });

  describe('requireValue', () => {
    const inputs: NumericalInputs = { tensors: new Map([['g', [1, 2, 3, 4]]]) };
    it('returns the named tensor value', () => {
      expect(requireValue('g', inputs)).toEqual([1, 2, 3, 4]);
    });
    it('throws when the name is absent', () => {
      expect(() => requireValue('missing', inputs)).toThrow(/no value supplied for "missing"/);
    });
  });

  describe('flattenNestedArray', () => {
    it('flattens and returns when the size matches', () => {
      expect(flattenNestedArray([[1, 2], [3, 4]], 4)).toEqual([1, 2, 3, 4]);
    });
    it('throws on a size mismatch', () => {
      expect(() => flattenNestedArray([[1, 2], [3, 4]], 9)).toThrow(/got 4 elements, expected 9/);
    });
  });
});

describe('scanForMetricPair', () => {
  it('finds an all-lower + all-upper pair in a product', () => {
    const node: ExprNode = { kind: 'op', op: '*', args: [gLower, gUpper] };
    const pair = scanForMetricPair(node);
    expect(pair).not.toBeNull();
    expect(pair!.gLower.name).toBe('g');
    expect(pair!.gUpper.name).toBe('gInv');
  });

  it('returns null when only a lower metric is present (null arm)', () => {
    const node: ExprNode = { kind: 'op', op: '*', args: [gLower, gLower] };
    expect(scanForMetricPair(node)).toBeNull();
  });

  it('returns null when no metric is present at all (null arm)', () => {
    const node = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    expect(scanForMetricPair(node as ExprNode)).toBeNull();
  });
});
