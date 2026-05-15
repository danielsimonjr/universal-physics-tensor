import { describe, it, expect } from 'vitest';
import { metricDerivSupplied } from '../../src/numerical/pderiv.js';

describe('metricDerivSupplied (derivativeStrategy: supplied path)', () => {
  it('returns the explicit pre-supplied ∂g for the given coord', () => {
    const derivs = new Map<string, number[][]>([
      ['g/μ', [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
    ]);
    expect(metricDerivSupplied('g', 'μ', derivs))
      .toEqual([[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]);
  });

  it('throws a clear error when the derivative is absent', () => {
    expect(() => metricDerivSupplied('g', 'μ', new Map()))
      .toThrow(/no metric derivative supplied for "g\/μ"/);
  });
});
