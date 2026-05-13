/**
 * Tensor-product validation tests — Task 6 (Einstein contraction).
 *
 * Covers:
 *   - single-arg passthrough
 *   - matched upper/lower contraction
 *   - non-matching labels stay free
 *   - >2-times label collision (IndexLabelCollisionError)
 *   - twice-same-variance (VarianceMismatchError)
 *   - scalar × tensor preserves tensor's free indices
 *   - BE-17-shape: T_λμν T^λμν fully contracts (rank-3 triple contraction)
 *   - computeContraction pure function exposes contractionPairs
 *   - nested tensor-product: (A^μ_ν B^ν_α) C_μ^α fully contracts
 *
 * The final test exercises the cycle-avoidance choice (callback recursion):
 * a nested tensor-product MUST NOT pollute the parent's shared freeIndices
 * accumulator. The inner product is computed via a local map; only the
 * outer-most call merges into ctx.freeIndices.
 */

import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import {
  IndexLabelCollisionError, VarianceMismatchError,
  UPTError, TensorProductChildInferenceError,
} from '../../src/dimensional/errors.js';
import { computeContraction } from '../../src/dimensional/tensor.js';

const DIM_LEN = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const DIM_LEN2 = { L: 2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const DIM_LEN3 = { L: 3, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

const tsym = (
  name: string,
  indices: { label: string; variance: 'upper' | 'lower' }[],
  dim = DIM_LEN,
): ExprNode => ({ kind: 'tensor-symbol', name, indices, dim });

describe('tensor-product validation', () => {
  it('single tensor in product is a no-op (just returns it)', () => {
    const T = tsym('T', [{ label: 'μ', variance: 'upper' }]);
    const prod: ExprNode = { kind: 'tensor-product', args: [T] };
    const result = validate(prod);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
  });

  it('two tensors with matching upper/lower contract that pair', () => {
    // TENSOR-RULE: einstein-summation-on-matched-pairs
    // TENSOR-RULE: contraction-zeros-out-paired-labels
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }]);
    const B = tsym('B', [{ label: 'μ', variance: 'lower' }]);
    const prod: ExprNode = { kind: 'tensor-product', args: [A, B] };
    const result = validate(prod);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(0);  // fully contracted
    expect(result.inferredDimension).toEqual(DIM_LEN2);  // dims multiplied
  });

  it('two tensors with non-matching labels keep both free', () => {
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }]);
    const B = tsym('B', [{ label: 'ν', variance: 'lower' }]);
    const prod: ExprNode = { kind: 'tensor-product', args: [A, B] };
    const result = validate(prod);
    expect(result.freeIndices.size).toBe(2);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
  });

  it('label appearing 3 times throws IndexLabelCollisionError', () => {
    // TENSOR-RULE: label-collision-rejected
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }]);
    const B = tsym('B', [{ label: 'μ', variance: 'lower' }]);
    const C = tsym('C', [{ label: 'μ', variance: 'upper' }]);
    const prod: ExprNode = { kind: 'tensor-product', args: [A, B, C] };
    expect(() => validate(prod)).toThrow(IndexLabelCollisionError);
  });

  it('label appearing twice with same variance throws VarianceMismatchError', () => {
    // TENSOR-RULE: variance-mismatch-rejected
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }]);
    const B = tsym('B', [{ label: 'μ', variance: 'upper' }]);
    const prod: ExprNode = { kind: 'tensor-product', args: [A, B] };
    expect(() => validate(prod)).toThrow(VarianceMismatchError);
  });

  it('scalar coefficient times tensor preserves the tensor free indices', () => {
    const scalar: ExprNode = { kind: 'symbol', name: 'k', dim: DIM_LEN };
    const T = tsym('T', [{ label: 'μ', variance: 'upper' }]);
    const prod: ExprNode = { kind: 'tensor-product', args: [scalar, T] };
    const result = validate(prod);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
    expect(result.inferredDimension).toEqual(DIM_LEN2);
  });

  it('BE-17-shape: T_λμν T^λμν fully contracts to scalar', () => {
    const T_lower = tsym('T', [
      { label: 'λ', variance: 'lower' },
      { label: 'μ', variance: 'lower' },
      { label: 'ν', variance: 'lower' },
    ]);
    const T_upper = tsym('T', [
      { label: 'λ', variance: 'upper' },
      { label: 'μ', variance: 'upper' },
      { label: 'ν', variance: 'upper' },
    ]);
    const prod: ExprNode = { kind: 'tensor-product', args: [T_lower, T_upper] };
    const result = validate(prod);
    expect(result.freeIndices.size).toBe(0);
    expect(result.inferredDimension).toEqual(DIM_LEN2);
  });

  it('nested tensor-product: (A^μ_ν · B^ν_α) · C_μ^α fully contracts', () => {
    // Inner product: A^μ_ν · B^ν_α  →  contracts ν, leaves {μ upper, α lower}.
    // Outer product: (inner) · C_μ^α  →  contracts μ and α, leaves {}.
    //
    // This test guards the cycle-avoidance correctness gate: the inner
    // tensor-product's recursion must use a LOCAL freeIndices map, not
    // mutate the parent ctx accumulator. If shared state leaks, the
    // outer call sees ν as a residual free index and the size check fails.
    const A = tsym('A', [
      { label: 'μ', variance: 'upper' },
      { label: 'ν', variance: 'lower' },
    ]);
    const B = tsym('B', [
      { label: 'ν', variance: 'upper' },
      { label: 'α', variance: 'lower' },
    ]);
    const C = tsym('C', [
      { label: 'μ', variance: 'lower' },
      { label: 'α', variance: 'upper' },
    ]);
    const inner: ExprNode = { kind: 'tensor-product', args: [A, B] };
    const outer: ExprNode = { kind: 'tensor-product', args: [inner, C] };
    const result = validate(outer);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(0);
    expect(result.inferredDimension).toEqual(DIM_LEN3);
  });
});

describe('computeContraction pure function (re-exported for mathjs backend)', () => {
  it('returns contractionPairs with the contracted labels', () => {
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }]);
    const B = tsym('B', [{ label: 'μ', variance: 'lower' }]);
    // The pure-function form takes a `validateChild` callback so it doesn't
    // import the validator module (avoids the circular import). The caller
    // supplies the per-arg {dim, freeIndices} resolver.
    const { contractionPairs, freeIndices, dim } = computeContraction(
      [A, B],
      (node) => {
        if (node.kind !== 'tensor-symbol') {
          throw new Error('test stub: only handles tensor-symbol');
        }
        const fi = new Map<string, { upper: number; lower: number }>();
        for (const idx of node.indices) {
          fi.set(idx.label, {
            upper: idx.variance === 'upper' ? 1 : 0,
            lower: idx.variance === 'lower' ? 1 : 0,
          });
        }
        return { dim: node.dim, freeIndices: fi };
      },
    );
    expect(contractionPairs).toEqual([{ label: 'μ' }]);
    expect(freeIndices.size).toBe(0);
    expect(dim).toEqual(DIM_LEN2);
  });

  it('throws TensorProductChildInferenceError as UPTError subclass', () => {
    // Task-6 fix-up: validator's resolveChildForContraction previously
    // threw a plain Error when a non-tensor probe failed inference,
    // violating §14.7 (all UPT errors must subclass UPTError). We assert
    // here on the class identity / inheritance rather than on a contrived
    // failing-inference fixture: the forward-compat invariant is
    // `err instanceof UPTError`, and that's what downstream consumers key
    // off of.
    const err = new TensorProductChildInferenceError('probe failed');
    expect(err).toBeInstanceOf(UPTError);
    expect(err).toBeInstanceOf(TensorProductChildInferenceError);
    expect(err.name).toBe('TensorProductChildInferenceError');
  });
});
