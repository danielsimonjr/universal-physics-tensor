/**
 * Tests for connection-lowering-helpers.ts
 *
 * Finding #4 (Task 12 review): consolidate duplicate flatten implementations.
 * flattenNA (canonical) lives in connection-lowering-helpers.ts; the old
 * flattenNestedArray in lowering.ts now delegates to it.
 *
 * Round-trip test: flattenNA and flatToNested are mutual inverses.
 */

import { describe, it, expect } from 'vitest';
import { flattenNA, flatToNested } from '../../src/numerical/connection-lowering-helpers.js';
import type { NestedArray } from '../../src/numerical/types.js';

describe('connection-lowering-helpers — flatten / flatToNested round-trip', () => {
  it('flattenNA and flatToNested are inverses for rank-3 shape [2,2,2]', () => {
    const original: NestedArray = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
    const flat = flattenNA(original);
    expect(flat).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    const restored = flatToNested(flat, [2, 2, 2]);
    expect(restored).toEqual(original);
  });

  it('flattenNA handles rank-0 (scalar)', () => {
    const flat = flattenNA(42 as NestedArray);
    expect(flat).toEqual([42]);
  });

  it('flatToNested handles rank-1', () => {
    const nested = flatToNested([1, 2, 3], [3]);
    expect(nested).toEqual([1, 2, 3]);
  });

  it('flattenNA and flatToNested are inverses for rank-2 shape [3,2]', () => {
    const original: NestedArray = [[1, 2], [3, 4], [5, 6]];
    const flat = flattenNA(original);
    expect(flat).toEqual([1, 2, 3, 4, 5, 6]);
    const restored = flatToNested(flat, [3, 2]);
    expect(restored).toEqual(original);
  });
});
