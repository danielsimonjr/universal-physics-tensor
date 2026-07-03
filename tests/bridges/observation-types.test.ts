import { describe, it, expect } from 'vitest';
import { residualInSigma, combineInQuadrature } from '../../src/bridges/observations/types.js';

describe('residualInSigma', () => {
  it('computes |predicted - observed| / sigma', () => {
    // be-37 Cassini: predicted gamma = 1, observed = 1 + 2.1e-5, sigma = 2.3e-5
    expect(residualInSigma(1, 1 + 2.1e-5, 2.3e-5)).toBeCloseTo(2.1e-5 / 2.3e-5, 10);
  });
  it('throws on non-finite or non-positive sigma', () => {
    expect(() => residualInSigma(1, 1, 0)).toThrow(RangeError);
    expect(() => residualInSigma(1, 1, -1)).toThrow(RangeError);
    expect(() => residualInSigma(1, 1, Number.NaN)).toThrow(RangeError);
  });
});

describe('combineInQuadrature', () => {
  it('combines components as sqrt(sum of squares)', () => {
    // SPARC-style: stat 0.02, sys 0.24 -> sqrt(0.02^2 + 0.24^2)
    expect(combineInQuadrature([
      { label: 'stat', value: 0.02 },
      { label: 'sys', value: 0.24 },
    ])).toBeCloseTo(Math.hypot(0.02, 0.24), 12);
  });
  it('throws on an empty component list', () => {
    expect(() => combineInQuadrature([])).toThrow(RangeError);
  });
});
