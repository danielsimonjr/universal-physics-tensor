import { describe, it, expect } from 'vitest';
import { rowMajorStrides, flatIndex, sameShape } from '../../src/numerical/strides.js';

describe('rowMajorStrides', () => {
  it('scalar shape [] → empty strides', () => {
    expect(rowMajorStrides([])).toEqual([]);
  });

  it('rank-1 shape [4] → [1]', () => {
    expect(rowMajorStrides([4])).toEqual([1]);
  });

  it('rank-2 shape [3, 4] → [4, 1]', () => {
    expect(rowMajorStrides([3, 4])).toEqual([4, 1]);
  });

  it('rank-3 shape [2, 3, 4] → [12, 4, 1]', () => {
    expect(rowMajorStrides([2, 3, 4])).toEqual([12, 4, 1]);
  });

  it('rank-3 shape [4, 4, 4] (Christoffel case) → [16, 4, 1]', () => {
    expect(rowMajorStrides([4, 4, 4])).toEqual([16, 4, 1]);
  });
});

describe('flatIndex', () => {
  it('flat index for [1, 2] in shape [3, 4] (strides [4,1]) → 6', () => {
    const strides = rowMajorStrides([3, 4]);
    expect(flatIndex([1, 2], strides)).toBe(6); // 1*4 + 2*1 = 6
  });

  it('flat index [0, 0] is always 0', () => {
    const strides = rowMajorStrides([4, 4]);
    expect(flatIndex([0, 0], strides)).toBe(0);
  });

  it('flat index [3, 3] in [4, 4] → 15', () => {
    const strides = rowMajorStrides([4, 4]);
    expect(flatIndex([3, 3], strides)).toBe(15); // 3*4 + 3 = 15
  });
});

describe('sameShape', () => {
  it('[3, 4] equals [3, 4]', () => {
    expect(sameShape([3, 4], [3, 4])).toBe(true);
  });

  it('[3, 4] does not equal [4, 3]', () => {
    expect(sameShape([3, 4], [4, 3])).toBe(false);
  });

  it('[] equals []', () => {
    expect(sameShape([], [])).toBe(true);
  });

  it('[4] does not equal [4, 4]', () => {
    expect(sameShape([4], [4, 4])).toBe(false);
  });
});
