import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { RepeatedDummyLabelError } from '../../src/dimensional/errors.js';

const DIM_LENGTH = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

describe('tensor-symbol validation', () => {
  it('rank-1 upper tensor reports correct freeIndices', () => {
    const node: ExprNode = {
      kind: 'tensor-symbol', name: 'V',
      indices: [{ label: 'μ', variance: 'upper' }],
      dim: DIM_LENGTH,
    };
    const result = validate(node);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(DIM_LENGTH);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.size).toBe(1);
  });

  it('rank-2 mixed-variance tensor reports correct freeIndices', () => {
    const node: ExprNode = {
      kind: 'tensor-symbol', name: 'T',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'ν', variance: 'lower' },
      ],
      dim: DIM_LENGTH,
    };
    const result = validate(node);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.size).toBe(2);
  });

  it('repeated label within indices list throws RepeatedDummyLabelError', () => {
    const node: ExprNode = {
      kind: 'tensor-symbol', name: 'T',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'μ', variance: 'upper' },
      ],
      dim: DIM_LENGTH,
    };
    expect(() => validate(node)).toThrow(RepeatedDummyLabelError);
  });

  it('rank-0 tensor-symbol (no indices) is valid and reports empty freeIndices', () => {
    const node: ExprNode = {
      kind: 'tensor-symbol', name: 's',
      indices: [],
      dim: DIM_LENGTH,
    };
    const result = validate(node);
    expect(result.freeIndices.size).toBe(0);
    expect(result.inferredDimension).toEqual(DIM_LENGTH);
  });

  it('tensor-symbol with role=coordinate is valid', () => {
    const node: ExprNode = {
      kind: 'tensor-symbol', name: 'x',
      indices: [{ label: 'μ', variance: 'upper' }],
      dim: DIM_LENGTH,
      role: 'coordinate',
    };
    const result = validate(node);
    expect(result.ok).toBe(true);
  });
});
