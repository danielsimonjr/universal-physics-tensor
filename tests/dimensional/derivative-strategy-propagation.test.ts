/**
 * Regression tests: derivativeStrategy must propagate through raise()/lower().
 *
 * Finding #1 (BLOCKER, confidence 95) from Task 1 review: raise() and lower()
 * built renamedGInverse/renamedG as plain object literals that copied
 * kind/name/indices/signature/dim but silently dropped derivativeStrategy.
 */
import { describe, it, expect } from 'vitest';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric, raise, lower } from '../../src/dimensional/metric.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

const g_inv_zero = metric(
  'g_inv',
  [
    { label: 'μ', variance: 'upper' },
    { label: 'ν', variance: 'upper' },
  ],
  DIMENSIONLESS,
  '+,-,-,-',
  'zero',
);

const g_zero = metric(
  'g',
  [
    { label: 'μ', variance: 'lower' },
    { label: 'ν', variance: 'lower' },
  ],
  DIMENSIONLESS,
  '+,-,-,-',
  'zero',
);

const g_inv_plain = metric(
  'g_inv',
  [
    { label: 'μ', variance: 'upper' },
    { label: 'ν', variance: 'upper' },
  ],
  DIMENSIONLESS,
  '+,-,-,-',
);

const g_plain = metric(
  'g',
  [
    { label: 'μ', variance: 'lower' },
    { label: 'ν', variance: 'lower' },
  ],
  DIMENSIONLESS,
  '+,-,-,-',
);

describe('propagates derivativeStrategy through raise()/lower()', () => {
  it('raise(): embedded metric retains derivativeStrategy: "zero" when source has it', () => {
    const A_lower = tsym('A', [{ label: 'μ', variance: 'lower' }], DIMENSIONLESS);
    const raised = raise(A_lower, g_inv_zero, 'μ');
    // The first arg of the tensor-product is the renamed metric node.
    const embeddedMetric = raised.args[0] as typeof g_inv_zero;
    expect(embeddedMetric.derivativeStrategy).toBe('zero');
  });

  it('raise(): embedded metric has NO derivativeStrategy when source has none', () => {
    const A_lower = tsym('A', [{ label: 'μ', variance: 'lower' }], DIMENSIONLESS);
    const raised = raise(A_lower, g_inv_plain, 'μ');
    const embeddedMetric = raised.args[0] as typeof g_inv_plain;
    expect('derivativeStrategy' in embeddedMetric).toBe(false);
  });

  it('lower(): embedded metric retains derivativeStrategy: "zero" when source has it', () => {
    const A_upper = tsym('A', [{ label: 'μ', variance: 'upper' }], DIMENSIONLESS);
    const lowered = lower(A_upper, g_zero, 'μ');
    const embeddedMetric = lowered.args[0] as typeof g_zero;
    expect(embeddedMetric.derivativeStrategy).toBe('zero');
  });

  it('lower(): embedded metric has NO derivativeStrategy when source has none', () => {
    const A_upper = tsym('A', [{ label: 'μ', variance: 'upper' }], DIMENSIONLESS);
    const lowered = lower(A_upper, g_plain, 'μ');
    const embeddedMetric = lowered.args[0] as typeof g_plain;
    expect('derivativeStrategy' in embeddedMetric).toBe(false);
  });
});
