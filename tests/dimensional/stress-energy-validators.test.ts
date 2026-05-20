// tests/dimensional/stress-energy-validators.test.ts
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import type { StressEnergyTensorNode } from '../../src/dimensional/stress-energy-validators.js';

const ENERGY_DENSITY_DIM = { L: -1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

describe('StressEnergyTensorNode validator', () => {
  it('symmetric T_μν reports freeIndices {μ:lower, ν:lower}', () => {
    const T: StressEnergyTensorNode = {
      kind: 'stress-energy',
      symbol: 'T',
      indices: [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      symmetry: 'symmetric',
      componentDim: ENERGY_DENSITY_DIM,
    };
    const r = validate(T as ExprNode);
    expect(r.ok).toBe(true);
    expect(r.inferredDimension).toEqual(ENERGY_DENSITY_DIM);
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
  });

  it('rejects rank ≠ 2', () => {
    const T = {
      kind: 'stress-energy',
      symbol: 'T',
      indices: [{ label: 'μ', variance: 'lower' }],
      symmetry: 'symmetric',
      componentDim: ENERGY_DENSITY_DIM,
    } as unknown as ExprNode;
    expect(() => validate(T)).toThrow(/rank-2/i);
  });

  it('rejects non-lower variance (v0.6.0 lock per Decision #2)', () => {
    const T = {
      kind: 'stress-energy',
      symbol: 'T',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'ν', variance: 'lower' },
      ],
      symmetry: 'symmetric',
      componentDim: ENERGY_DENSITY_DIM,
    } as unknown as ExprNode;
    expect(() => validate(T)).toThrow(/lower-lower/i);
  });
});
