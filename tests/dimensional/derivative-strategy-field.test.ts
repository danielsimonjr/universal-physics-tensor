import { describe, it, expect } from 'vitest';
import { metric } from '../../src/dimensional/metric.js';
import type { MetricTensorNode } from '../../src/dimensional/metric-validators.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

describe('MetricTensorNode.derivativeStrategy', () => {
  it('metric() omits derivativeStrategy when not supplied', () => {
    const g = metric('g',
      [{ label: 'μ', variance: 'lower' }, { label: 'ν', variance: 'lower' }],
      DIMENSIONLESS, '+,-,-,-');
    expect('derivativeStrategy' in g).toBe(false);
  });

  it('metric() carries derivativeStrategy when supplied', () => {
    const g = metric('g',
      [{ label: 'μ', variance: 'lower' }, { label: 'ν', variance: 'lower' }],
      DIMENSIONLESS, '+,-,-,-', 'zero');
    expect(g.derivativeStrategy).toBe('zero');
  });

  it('derivativeStrategy survives JSON round-trip', () => {
    const g = metric('g',
      [{ label: 'μ', variance: 'lower' }, { label: 'ν', variance: 'lower' }],
      DIMENSIONLESS, '+,-,-,-', 'supplied');
    const round: MetricTensorNode = JSON.parse(JSON.stringify(g));
    expect(round.derivativeStrategy).toBe('supplied');
  });
});
