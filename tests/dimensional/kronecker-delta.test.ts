import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';
import {
  InvalidKroneckerRankError,
  KroneckerVarianceError,
} from '../../src/dimensional/errors.js';
import type { KroneckerDeltaNode } from '../../src/dimensional/metric-validators.js';

describe('kronecker-delta AST node', () => {
  const delta_μν: KroneckerDeltaNode = {
    kind: 'kronecker-delta',
    indices: [
      { label: 'μ', variance: 'upper' },
      { label: 'ν', variance: 'lower' },
    ],
    dim: DIMENSIONLESS,
  };

  it('validates the canonical δ^μ_ν', () => {
    const result = validate(delta_μν);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(DIMENSIONLESS);
    expect(result.freeIndices.size).toBe(2);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
  });

  it('validates lower-then-upper order (δ_ν^μ)', () => {
    const reversed: KroneckerDeltaNode = {
      kind: 'kronecker-delta',
      indices: [
        { label: 'ν', variance: 'lower' },
        { label: 'μ', variance: 'upper' },
      ],
      dim: DIMENSIONLESS,
    };
    const result = validate(reversed);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
  });

  it('rejects rank-1 kronecker with InvalidKroneckerRankError', () => {
    const bad: KroneckerDeltaNode = {
      kind: 'kronecker-delta',
      indices: [{ label: 'μ', variance: 'upper' }],
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(InvalidKroneckerRankError);
  });

  it('rejects rank-3 kronecker with InvalidKroneckerRankError', () => {
    const bad: KroneckerDeltaNode = {
      kind: 'kronecker-delta',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'ν', variance: 'lower' },
        { label: 'λ', variance: 'upper' },
      ],
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(InvalidKroneckerRankError);
  });

  it('rejects both-upper kronecker with KroneckerVarianceError', () => {
    const bad: KroneckerDeltaNode = {
      kind: 'kronecker-delta',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'ν', variance: 'upper' },
      ],
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(KroneckerVarianceError);
  });

  it('rejects both-lower kronecker with KroneckerVarianceError', () => {
    const bad: KroneckerDeltaNode = {
      kind: 'kronecker-delta',
      indices: [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(KroneckerVarianceError);
  });

  it('allows user-specified non-DIMENSIONLESS dim (rare but valid)', () => {
    const lengthly: KroneckerDeltaNode = {
      kind: 'kronecker-delta',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'ν', variance: 'lower' },
      ],
      dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const result = validate(lengthly);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(lengthly.dim);
  });
});
