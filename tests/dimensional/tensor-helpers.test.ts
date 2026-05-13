import { describe, it, expect } from 'vitest';
import { tsym, scale, contract, tsum } from '../../src/dimensional/tensor.js';
import { validate } from '../../src/dimensional/validator.js';

const DIM = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

describe('tensor API helpers', () => {
  it('tsym constructs a tensor-symbol node', () => {
    const T = tsym('T', [{ label: 'μ', variance: 'upper' }], DIM);
    expect(T.kind).toBe('tensor-symbol');
    expect(T.name).toBe('T');
    expect(T.indices).toEqual([{ label: 'μ', variance: 'upper' }]);
    expect(T.dim).toEqual(DIM);
  });

  it('tsym accepts an optional role', () => {
    const x = tsym('x', [{ label: 'μ', variance: 'upper' }], DIM, 'coordinate');
    expect((x as { role?: string }).role).toBe('coordinate');
  });

  it('scale(scalar, tensor) yields a tensor-product with both', () => {
    const s = { kind: 'symbol' as const, name: 'k', dim: DIM };
    const T = tsym('T', [{ label: 'μ', variance: 'upper' }], DIM);
    const scaled = scale(s, T);
    expect(scaled.kind).toBe('tensor-product');
    expect(scaled.args).toHaveLength(2);
  });

  it('contract(A, B, ...) wraps args in a tensor-product', () => {
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }], DIM);
    const B = tsym('B', [{ label: 'μ', variance: 'lower' }], DIM);
    const C = tsym('C', [{ label: 'ν', variance: 'upper' }], DIM);
    const result = contract(A, B, C);
    expect(result.kind).toBe('tensor-product');
    expect(result.args).toHaveLength(3);
  });

  it('tsum(A, B) yields an op + with strict free-index matching (validates)', () => {
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }], DIM);
    const B = tsym('B', [{ label: 'μ', variance: 'upper' }], DIM);
    const result = tsum(A, B);
    expect(result.kind).toBe('op');
    expect((result as { op: string }).op).toBe('+');
    const validation = validate(result);
    expect(validation.ok).toBe(true);
  });
});
