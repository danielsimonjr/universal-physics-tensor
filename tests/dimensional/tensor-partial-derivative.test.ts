import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { divide } from '../../src/dimensional/algebra.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import {
  PartialDerivativeIndexVarianceError,
  IndexLabelCollisionError,
} from '../../src/dimensional/errors.js';
import type { TensorPartialDerivativeNode } from '../../src/dimensional/metric-validators.js';

const LENGTH = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const POTENTIAL = { L: 2, M: 1, T: -3, I: -1, Theta: 0, N: 0, J: 0 }; // V

describe('tensor-partial-derivative AST node', () => {
  // TENSOR-RULE: pderiv-rank-equals-of-rank-plus-one
  // TENSOR-RULE: pderiv-wrtIndex-always-lower
  // TENSOR-RULE: pderiv-dim-divides-by-wrt-dim
  // TENSOR-RULE: pderiv-ignores-wrt-own-indices
  // TENSOR-RULE: pderiv-label-collision-rejected
  // TENSOR-RULE: pderiv-role-inherits-from-of
  // TENSOR-RULE: pderiv-free-indices-union
  it('infers dim = divide(of.dim, wrt.dim) for scalar of', () => {
    // φ is a scalar (rank-0 tensor-symbol); x is a coordinate.
    const phi = tsym('phi', [], POTENTIAL);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const grad_phi: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: phi,
      wrt: x,
      wrtIndex: { label: 'μ', variance: 'lower' },
    };
    const result = validate(grad_phi);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(divide(POTENTIAL, LENGTH));
    expect(result.freeIndices.size).toBe(1);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
  });

  it('increases rank by 1 (of: rank-1 → result: rank-2)', () => {
    const A = tsym('A', [{ label: 'ν', variance: 'upper' }], POTENTIAL);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const dA: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: A,
      wrt: x,
      wrtIndex: { label: 'μ', variance: 'lower' },
    };
    const result = validate(dA);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(2);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 1, lower: 0 });
  });

  it('rejects upper wrtIndex with PartialDerivativeIndexVarianceError', () => {
    const phi = tsym('phi', [], POTENTIAL);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const bad: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: phi,
      wrt: x,
      wrtIndex: { label: 'μ', variance: 'upper' as 'lower' }, // type-cast for the bad case
    };
    expect(() => validate(bad)).toThrow(PartialDerivativeIndexVarianceError);
  });

  it('rejects label collision between wrtIndex and of free indices', () => {
    // A^μ then ∂_μ A^μ — collision on label 'μ'.
    const A = tsym('A', [{ label: 'μ', variance: 'upper' }], POTENTIAL);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const bad: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: A,
      wrt: x,
      wrtIndex: { label: 'μ', variance: 'lower' },
    };
    expect(() => validate(bad)).toThrow(IndexLabelCollisionError);
  });

  it('ignores wrt own free indices (per Part-VIII §VIII.4)', () => {
    // wrt has free index α:upper, but the operator's index is μ:lower.
    // The output should have ONLY μ:lower as the new free index (α is NOT propagated).
    const phi = tsym('phi', [], POTENTIAL);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const dPhi: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: phi,
      wrt: x,
      wrtIndex: { label: 'μ', variance: 'lower' },
    };
    const result = validate(dPhi);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.has('α')).toBe(false);
    expect(result.freeIndices.has('μ')).toBe(true);
  });

  it('inherits role from of when of is a tensor-symbol with role', () => {
    // This test will be re-asserted in Task 7 once helpers exist; here we verify
    // the validator's behavior on a raw node.
    const phi = tsym('phi', [], POTENTIAL, 'field');
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const dPhi: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: phi,
      wrt: x,
      wrtIndex: { label: 'μ', variance: 'lower' },
    };
    // Role-inheritance is a structural property; validator doesn't expose it
    // on ValidationResult, but the node's own `role` is read in v0.4.0 work.
    // Here we just assert ok and that the validation succeeds.
    const result = validate(dPhi);
    expect(result.ok).toBe(true);
  });

  it('handles nested pderiv (∂_ν ∂_μ φ — second derivative)', () => {
    const phi = tsym('phi', [], POTENTIAL);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const dPhi: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: phi,
      wrt: x,
      wrtIndex: { label: 'μ', variance: 'lower' },
    };
    const d2Phi: TensorPartialDerivativeNode = {
      kind: 'tensor-partial-derivative',
      of: dPhi,
      wrt: x,
      wrtIndex: { label: 'ν', variance: 'lower' },
    };
    const result = validate(d2Phi);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(2);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
    // dim should be POTENTIAL / LENGTH²
    expect(result.inferredDimension).toEqual(
      divide(divide(POTENTIAL, LENGTH), LENGTH),
    );
  });
});
