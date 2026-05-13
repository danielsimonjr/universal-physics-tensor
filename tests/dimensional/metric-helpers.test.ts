import { describe, it, expect } from 'vitest';
import { metric, kronecker, pderiv } from '../../src/dimensional/metric.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

const LENGTH = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

describe('metric() helper', () => {
  it('constructs a metric-tensor with the given fields', () => {
    const g = metric(
      'g',
      [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      DIMENSIONLESS,
      '+,-,-,-',
    );
    expect(g.kind).toBe('metric-tensor');
    expect(g.name).toBe('g');
    expect(g.indices.length).toBe(2);
    expect(g.signature).toBe('+,-,-,-');
    expect(g.dim).toEqual(DIMENSIONLESS);
  });
});

describe('kronecker() helper', () => {
  it('constructs δ^μ_ν with default DIMENSIONLESS dim', () => {
    const delta = kronecker('μ', 'ν');
    expect(delta.kind).toBe('kronecker-delta');
    expect(delta.indices.length).toBe(2);
    expect(delta.indices[0]).toEqual({ label: 'μ', variance: 'upper' });
    expect(delta.indices[1]).toEqual({ label: 'ν', variance: 'lower' });
    expect(delta.dim).toEqual(DIMENSIONLESS);
  });

  it('accepts explicit dim override', () => {
    const delta = kronecker('μ', 'ν', LENGTH);
    expect(delta.dim).toEqual(LENGTH);
  });
});

describe('pderiv() helper', () => {
  it('constructs a tensor-partial-derivative with covariant wrtIndex', () => {
    const phi = tsym('phi', [], DIMENSIONLESS);
    const x = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');
    const d = pderiv(phi, x, { label: 'μ', variance: 'lower' });
    expect(d.kind).toBe('tensor-partial-derivative');
    expect(d.of).toBe(phi);
    expect(d.wrt).toBe(x);
    expect(d.wrtIndex).toEqual({ label: 'μ', variance: 'lower' });
  });
});
