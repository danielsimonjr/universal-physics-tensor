import { describe, it, expect } from 'vitest';
// flattenNA is internal; import directly from the module path to avoid
// dragging in the entire connection/lowering layer for a comment-fix guard.
import { flattenNA } from '../../src/numerical/connection-lowering-helpers.js';

describe('flattenNA — accuracy preserved after comment fix', () => {
  it('flattens a 2×2 nested array to row-major number[]', () => {
    const nested = [[1, 2], [3, 4]];
    expect(flattenNA(nested)).toEqual([1, 2, 3, 4]);
  });

  it('flattens a depth-1 array (vector) correctly', () => {
    expect(flattenNA([10, 20, 30])).toEqual([10, 20, 30]);
  });

  it('returns a single-element array for a scalar', () => {
    expect(flattenNA(42)).toEqual([42]);
  });
});
