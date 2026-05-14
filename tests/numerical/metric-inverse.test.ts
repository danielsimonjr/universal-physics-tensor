import { describe, it, expect } from 'vitest';
import { evaluateMetricInverse, evaluateNumerical } from '../../src/numerical/index.js';
import type { NumericalInputs } from '../../src/numerical/types.js';
import type { MetricTensorNode } from '../../src/dimensional/validator.js';
import { contract } from '../../src/dimensional/tensor.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

const gLower: MetricTensorNode = {
  kind: 'metric-tensor', name: 'g',
  indices: [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  signature: '+,+', dim: DIMENSIONLESS,
};
const gUpper: MetricTensorNode = {
  kind: 'metric-tensor', name: 'gInv',
  indices: [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  signature: '+,+', dim: DIMENSIONLESS,
};

describe('evaluateMetricInverse', () => {
  it('a true inverse pair has residual norm ~0 and no warning', async () => {
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[][]>([
        ['g', [[2, 0], [0, 4]]],
        ['gInv', [[0.5, 0], [0, 0.25]]],
      ]),
      dimension: 2,
    };
    const r = await evaluateMetricInverse(gUpper, gLower, inputs);
    expect(r.residualNorm).toBeLessThan(1e-12);
    expect(r.warning).toBeUndefined();
  });

  it('a non-inverse pair exceeds tolerance and produces a warning-severity Violation', async () => {
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[][]>([
        ['g', [[2, 0], [0, 4]]],
        ['gInv', [[1, 0], [0, 1]]], // NOT the inverse of g
      ]),
      dimension: 2,
    };
    const r = await evaluateMetricInverse(gUpper, gLower, inputs);
    expect(r.residualNorm).toBeGreaterThan(1e-10);
    expect(r.warning?.severity).toBe('warning');
  });

  it('evaluateNumerical surfaces the numerical warning when the AST contains a non-inverse metric pair', async () => {
    // contract(gUpper, gLower): both metrics reachable in one AST; the scan
    // finds the lower/upper pair and runs the numerical residual check.
    const node = contract(gUpper, gLower);
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[][]>([
        ['g', [[2, 0], [0, 4]]],
        ['gInv', [[1, 0], [0, 1]]], // NOT the inverse of g
      ]),
      dimension: 2,
    };
    const result = await evaluateNumerical(node, inputs);
    expect(result.warnings.some((w) => w.note.includes('InverseMetricInconsistencyWarning'))).toBe(true);
  });

  it('evaluateNumerical surfaces NO inverse-metric warning for a true inverse pair', async () => {
    const node = contract(gUpper, gLower);
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[][]>([
        ['g', [[2, 0], [0, 4]]],
        ['gInv', [[0.5, 0], [0, 0.25]]], // the true inverse
      ]),
      dimension: 2,
    };
    const result = await evaluateNumerical(node, inputs);
    expect(result.warnings.some((w) => w.note.includes('InverseMetricInconsistencyWarning'))).toBe(false);
  });
});
