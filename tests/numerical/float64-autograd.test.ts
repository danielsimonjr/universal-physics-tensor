import { describe, it, expect } from 'vitest';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';
import { hasAutogradSupport } from '../../src/numerical/tensor-engine.js';

describe('Float64ReferenceEngine: forward/reverse AD', () => {
  const engine = new Float64ReferenceEngine();

  it('hasAutogradSupport returns true post-implementation', () => {
    expect(hasAutogradSupport(engine)).toBe(true);
  });

  it('forwardGrad: fn(x) = x·x — Jacobian = diag(2x)', async () => {
    const x = engine.fromNested([2, 3, 4], [3]);
    const fn = (t: typeof x) => engine.mul(t, t);
    const { value, jacobian } = await engine.forwardGrad!(fn, x);
    expect(engine.toNested(value)).toEqual([4, 9, 16]);
    expect(jacobian.shape).toEqual([3, 3]);
    const J = engine.toNested(jacobian) as number[][];
    expect(J[0][0]).toBeCloseTo(4, 12);
    expect(J[1][1]).toBeCloseTo(6, 12);
    expect(J[2][2]).toBeCloseTo(8, 12);
    expect(J[0][1]).toBeCloseTo(0, 12);
  });

  it('reverseGrad: fn(x) = x·x — gradient = 2x · cotangent', async () => {
    const x = engine.fromNested([2, 3, 4], [3]);
    const fn = (t: typeof x) => engine.mul(t, t);
    const cotangent = engine.fromNested([1, 1, 1], [3]);
    const { gradient } = await engine.reverseGrad!(fn, x, cotangent);
    const g = engine.toNested(gradient) as number[];
    expect(g[0]).toBeCloseTo(4, 12);
    expect(g[1]).toBeCloseTo(6, 12);
    expect(g[2]).toBeCloseTo(8, 12);
  });

  it('reverseGrad: default cotangent (ones) for scalar value', async () => {
    const x = engine.fromNested(5, []);
    const fn = (t: typeof x) => engine.mul(t, t);
    const { value, gradient } = await engine.reverseGrad!(fn, x);
    expect(engine.toNested(value)).toBe(25);
    expect(engine.toNested(gradient)).toBeCloseTo(10, 12);
  });
});
