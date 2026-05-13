/**
 * Op-tensor boundary rule tests — Task 7.
 *
 * Per v0.2.0-Design.md §5 and Part-VII §VII.5:
 *   - op '+' / '-' accept tensor operands only when all args share the same
 *     dim AND the same freeIndices map; otherwise throw FreeIndexMismatchError.
 *   - op '*' / '/' reject any operand with non-empty freeIndices
 *     (TensorInScalarOpError); users must use 'tensor-product' for tensor
 *     multiplication.
 *   - op '^' rejects a tensor base (TensorInScalarOpError).
 *
 * Pristine scalar semantics are preserved: scalar+scalar, scalar*scalar,
 * scalar^scalar all behave exactly as in v0.1.0.
 */

import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import {
  TensorInScalarOpError, FreeIndexMismatchError,
} from '../../src/dimensional/errors.js';

const DIM = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

const tsym = (name: string, indices: { label: string; variance: 'upper' | 'lower' }[]): ExprNode =>
  ({ kind: 'tensor-symbol', name, indices, dim: DIM });

describe('op + / - with tensor operands', () => {
  it('accepts two rank-1 tensors with matching free indices', () => {
    // TENSOR-RULE: op-add-requires-matching-shape
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }]);
    const B = tsym('B', [{ label: 'μ', variance: 'upper' }]);
    const sum: ExprNode = { kind: 'op', op: '+', args: [A, B] };
    const result = validate(sum);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
  });

  it('rejects mismatched-variance tensor sums (μ upper vs μ lower)', () => {
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }]);
    const B = tsym('B', [{ label: 'μ', variance: 'lower' }]);
    const sum: ExprNode = { kind: 'op', op: '+', args: [A, B] };
    expect(() => validate(sum)).toThrow(FreeIndexMismatchError);
  });

  it('rejects tensor + scalar', () => {
    const T = tsym('T', [{ label: 'μ', variance: 'upper' }]);
    const s: ExprNode = { kind: 'symbol', name: 's', dim: DIM };
    const sum: ExprNode = { kind: 'op', op: '+', args: [T, s] };
    expect(() => validate(sum)).toThrow(FreeIndexMismatchError);
  });
});

describe('op * / / with tensor operands', () => {
  it('rejects tensor * scalar (must use tensor-product)', () => {
    // TENSOR-RULE: op-multiply-divide-rejects-tensors
    const T = tsym('T', [{ label: 'μ', variance: 'upper' }]);
    const s: ExprNode = { kind: 'symbol', name: 's', dim: DIM };
    const prod: ExprNode = { kind: 'op', op: '*', args: [s, T] };
    expect(() => validate(prod)).toThrow(TensorInScalarOpError);
  });

  it('accepts scalar * scalar (unchanged behavior)', () => {
    const a: ExprNode = { kind: 'symbol', name: 'a', dim: DIM };
    const b: ExprNode = { kind: 'symbol', name: 'b', dim: DIM };
    const prod: ExprNode = { kind: 'op', op: '*', args: [a, b] };
    const result = validate(prod);
    expect(result.ok).toBe(true);
  });
});

describe('op ^ with tensor base', () => {
  it('rejects tensor ^ scalar', () => {
    // TENSOR-RULE: op-power-rejects-tensors
    const T = tsym('T', [{ label: 'μ', variance: 'upper' }]);
    const two: ExprNode = {
      kind: 'symbol', name: '2',
      dim: { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const pow: ExprNode = { kind: 'op', op: '^', args: [T, two] };
    expect(() => validate(pow)).toThrow(TensorInScalarOpError);
  });
});
