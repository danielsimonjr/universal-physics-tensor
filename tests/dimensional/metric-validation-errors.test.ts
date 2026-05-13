import { describe, it, expect } from 'vitest';
import {
  UPTError,
  InvalidMetricRankError,
  MetricSignatureError,
  InvalidKroneckerRankError,
  KroneckerVarianceError,
  PartialDerivativeIndexVarianceError,
} from '../../src/dimensional/errors.js';

describe('v0.3.0 metric-layer error subclasses', () => {
  it('InvalidMetricRankError is a UPTError subclass with rank context', () => {
    const err = new InvalidMetricRankError('g', 3);
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(UPTError);
    expect(err).toBeInstanceOf(InvalidMetricRankError);
    expect(err.name).toBe('InvalidMetricRankError');
    expect(err.tensorName).toBe('g');
    expect(err.actualRank).toBe(3);
    expect(err.message).toContain('metric');
    expect(err.message).toContain('rank-2');
  });

  it('MetricSignatureError accepts reason text', () => {
    const err = new MetricSignatureError('g', 'mixed-variance indices not allowed');
    expect(err).toBeInstanceOf(UPTError);
    expect(err.name).toBe('MetricSignatureError');
    expect(err.tensorName).toBe('g');
    expect(err.reason).toBe('mixed-variance indices not allowed');
    expect(err.message).toContain('g');
    expect(err.message).toContain('mixed-variance');
  });

  it('InvalidKroneckerRankError fires on non-rank-2', () => {
    const err = new InvalidKroneckerRankError(3);
    expect(err).toBeInstanceOf(UPTError);
    expect(err.name).toBe('InvalidKroneckerRankError');
    expect(err.actualRank).toBe(3);
    expect(err.message).toContain('Kronecker');
  });

  it('KroneckerVarianceError fires on same-variance pair', () => {
    const err = new KroneckerVarianceError('upper');
    expect(err).toBeInstanceOf(UPTError);
    expect(err.name).toBe('KroneckerVarianceError');
    expect(err.bothVariance).toBe('upper');
    expect(err.message).toContain('Kronecker');
    expect(err.message).toContain('upper');
  });

  it('PartialDerivativeIndexVarianceError fires when wrtIndex is upper', () => {
    const err = new PartialDerivativeIndexVarianceError('μ');
    expect(err).toBeInstanceOf(UPTError);
    expect(err.name).toBe('PartialDerivativeIndexVarianceError');
    expect(err.label).toBe('μ');
    expect(err.message).toContain('μ');
    expect(err.message).toContain('lower');
  });
});
