import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';
import {
  InvalidMetricRankError,
  MetricSignatureError,
} from '../../src/dimensional/errors.js';
import type { MetricTensorNode } from '../../src/dimensional/metric-validators.js';

describe('metric-tensor AST node', () => {
  const g_lower: MetricTensorNode = {
    kind: 'metric-tensor',
    name: 'g',
    indices: [
      { label: 'μ', variance: 'lower' },
      { label: 'ν', variance: 'lower' },
    ],
    signature: '+,-,-,-',
    dim: DIMENSIONLESS,
  };

  const g_upper: MetricTensorNode = {
    kind: 'metric-tensor',
    name: 'g_inv',
    indices: [
      { label: 'μ', variance: 'upper' },
      { label: 'ν', variance: 'upper' },
    ],
    signature: '+,-,-,-',
    dim: DIMENSIONLESS,
  };

  it('validates a well-formed covariant metric (both lower)', () => {
    const result = validate(g_lower);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(DIMENSIONLESS);
    expect(result.freeIndices.size).toBe(2);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
  });

  it('validates a well-formed contravariant metric (both upper)', () => {
    const result = validate(g_upper);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.get('μ')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('ν')).toEqual({ upper: 1, lower: 0 });
  });

  it('rejects rank-1 metric with InvalidMetricRankError', () => {
    const bad: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g',
      indices: [{ label: 'μ', variance: 'lower' }],
      signature: '+,-,-,-',
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(InvalidMetricRankError);
  });

  it('rejects rank-3 metric with InvalidMetricRankError', () => {
    const bad: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g',
      indices: [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
        { label: 'λ', variance: 'lower' },
      ],
      signature: '+,-,-,-',
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(InvalidMetricRankError);
  });

  it('rejects mixed-variance metric with MetricSignatureError', () => {
    const bad: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'ν', variance: 'lower' },
      ],
      signature: '+,-,-,-',
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(MetricSignatureError);
  });

  it('rejects empty signature with MetricSignatureError', () => {
    const bad: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g',
      indices: [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      signature: '',
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(MetricSignatureError);
  });

  it('rejects malformed signature with MetricSignatureError', () => {
    const bad: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g',
      indices: [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      signature: '+,X,-,-',
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(MetricSignatureError);
  });

  it('allows user-specified non-DIMENSIONLESS dim', () => {
    const lengthSquared: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g_line',
      indices: [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      signature: '+,-,-,-',
      dim: { L: 2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const result = validate(lengthSquared);
    expect(result.ok).toBe(true);
    expect(result.inferredDimension).toEqual(lengthSquared.dim);
  });

  it('rejects duplicate label within metric (e.g., g_μμ)', () => {
    const bad: MetricTensorNode = {
      kind: 'metric-tensor',
      name: 'g',
      indices: [
        { label: 'μ', variance: 'lower' },
        { label: 'μ', variance: 'lower' },
      ],
      signature: '+,-,-,-',
      dim: DIMENSIONLESS,
    };
    expect(() => validate(bad)).toThrow(MetricSignatureError);
  });
});
