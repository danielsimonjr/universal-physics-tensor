import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

describe('tensor.ts Step C: fully-contracted label removal', () => {
  it('contracted label is not in freeIndices of the product', () => {
    // T^a_b * S^b_c — label 'b' contracts; result has freeIndices {a, c}
    const T = tsym('T', [
      { label: 'a', variance: 'upper' as const },
      { label: 'b', variance: 'lower' as const },
    ], DIMENSIONLESS);
    const S = tsym('S', [
      { label: 'b', variance: 'upper' as const },
      { label: 'c', variance: 'lower' as const },
    ], DIMENSIONLESS);
    const product = { kind: 'tensor-product' as const, args: [T, S] };
    const result = validate(product as any);
    expect(result.freeIndices.has('b')).toBe(false);
    expect(result.freeIndices.has('a')).toBe(true);
    expect(result.freeIndices.has('c')).toBe(true);
  });
});
