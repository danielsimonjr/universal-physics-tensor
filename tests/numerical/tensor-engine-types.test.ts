import { describe, it, expect } from 'vitest';
import type { TensorEngine, EngineTensor, EinsumSpec } from '../../src/numerical/tensor-engine.js';
import type { NestedArray } from '../../src/numerical/types.js';
import { isEinsumSpec } from '../../src/numerical/tensor-engine.js';

describe('TensorEngine contract surface', () => {
  it('NestedArray accepts nested number arrays', () => {
    const a: NestedArray = [[1, 2], [3, 4]];
    expect(Array.isArray(a)).toBe(true);
  });

  it('isEinsumSpec accepts a well-formed spec', () => {
    const spec: EinsumSpec = {
      contractions: [{ pair: [[0, 1], [1, 0]] }],
      free: [{ operand: 0, axis: 0 }, { operand: 1, axis: 1 }],
    };
    expect(isEinsumSpec(spec)).toBe(true);
  });

  it('isEinsumSpec rejects a spec with a malformed contraction pair', () => {
    expect(isEinsumSpec({ contractions: [{ pair: [[0, 1]] }], free: [] })).toBe(false);
    expect(isEinsumSpec({ contractions: [], free: [{ operand: 0 }] })).toBe(false);
    expect(isEinsumSpec(null)).toBe(false);
  });

  it('EngineTensor exposes a readonly shape', () => {
    const t: EngineTensor = { shape: [2, 2] };
    expect(t.shape).toEqual([2, 2]);
  });
});
