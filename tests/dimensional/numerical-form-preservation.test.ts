import { describe, it, expect } from 'vitest';
import { tsym } from '../../src/dimensional/tensor.js';
import { raise, lower } from '../../src/dimensional/metric.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';
import type { MetricTensorNode } from '../../src/dimensional/validator.js';

const gUpper: MetricTensorNode = {
  kind: 'metric-tensor', name: 'gInv',
  indices: [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  signature: '+,-,-,-', dim: DIMENSIONLESS,
};
const gLower: MetricTensorNode = {
  kind: 'metric-tensor', name: 'g',
  indices: [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  signature: '+,-,-,-', dim: DIMENSIONLESS,
};

describe('numericalForm survives metric transforms', () => {
  it('raise() preserves the of-operand numericalForm', () => {
    const v = tsym('V', [{ label: 'mu', variance: 'lower' }], LENGTH, 'field', 'grid');
    const raised = raise(v, gUpper, 'mu');
    // The original tensor-symbol's numericalForm must still be reachable in
    // the resulting AST. A structural JSON scan is robust to raise()'s exact
    // output shape (tensor-product, alpha-converted indices, etc.).
    expect(JSON.stringify(raised)).toContain('"numericalForm":"grid"');
  });

  it('lower() preserves the of-operand numericalForm', () => {
    const v = tsym('V', [{ label: 'mu', variance: 'upper' }], LENGTH, undefined, 'numerical-fn');
    const lowered = lower(v, gLower, 'mu');
    expect(JSON.stringify(lowered)).toContain('"numericalForm":"numerical-fn"');
  });
});
