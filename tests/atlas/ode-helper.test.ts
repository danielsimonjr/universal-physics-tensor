/**
 * Pins the accuracy and the sampling contract of the atlas RK4 helper, and
 * cross-checks its final state against the in-tree `integrateRK4`.
 */
import { describe, it, expect } from 'vitest';
import { rk4 } from './_ode.js';
import { integrateRK4 } from '../../src/numerical/null-ray-integrator.js';

describe('rk4: accuracy', () => {
  it("reproduces exp(-t) for y' = -y to 1e-12 relative at 1000 steps over [0, 1]", () => {
    const { y } = rk4((_t, s) => [-s[0]], [1], 0, 1, 1000);
    const exact = Math.exp(-1);
    expect(Math.abs(y[0] - exact) / Math.abs(exact)).toBeLessThan(1e-12); // measured 1.09e-14
  });

  it("reproduces cos(t) for y'' = -y as a 2-vector to 1e-10 at t = 2π with 4000 steps", () => {
    const twoPi = 2 * Math.PI;
    // state = [x, v]; x' = v, v' = -x. x(0) = 1, v(0) = 0 => x(t) = cos t.
    const { y, samples } = rk4((_t, s) => [s[1], -s[0]], [1, 0], 0, twoPi, 4000);
    expect(Math.abs(y[0] - Math.cos(twoPi))).toBeLessThan(1e-10); // measured 3.33e-16
    expect(Math.abs(y[1] - -Math.sin(twoPi))).toBeLessThan(1e-10); // measured 3.19e-13

    // The whole sampled trajectory tracks cos, not just the endpoint.
    let worst = 0;
    for (const s of samples) worst = Math.max(worst, Math.abs(s.y[0] - Math.cos(s.t)));
    expect(worst).toBeLessThan(1e-10); // measured 2.46e-13
  });

  it("agrees with integrateRK4 to 1e-12 on y' = -y", () => {
    const f = (_t: number, s: readonly number[]) => [-s[0]];
    const mine = rk4(f, [1], 0, 1, 1000).y;
    const theirs = integrateRK4(f, [1], 0, 1, 1000);
    expect(Math.abs(mine[0] - theirs[0])).toBeLessThan(1e-12); // measured exactly 0
  });
});

describe('rk4: sampling contract', () => {
  it('includes t0 and t1, and samples every step by default', () => {
    const { samples } = rk4((_t, s) => [-s[0]], [1], 0, 1, 10);
    expect(samples).toHaveLength(11);
    expect(samples[0].t).toBe(0);
    expect(samples[0].y).toEqual([1]);
    expect(samples[samples.length - 1].t).toBe(1);
  });

  it('honours sampleEvery while still including both endpoints', () => {
    const { samples, y } = rk4((_t, s) => [-s[0]], [1], 0, 1, 100, 25);
    // t0, then steps 25/50/75, then t1 (step 100 is the endpoint, not duplicated).
    expect(samples.map((s) => s.t)).toEqual([0, 0.25, 0.5, 0.75, 1]);
    expect(samples[samples.length - 1].y).toEqual(y);
  });

  it('includes both endpoints even when sampleEvery exceeds the step count', () => {
    const { samples } = rk4((_t, s) => [-s[0]], [1], 0, 1, 4, 999);
    expect(samples.map((s) => s.t)).toEqual([0, 1]);
  });

  it('does not alias the internal state into the samples', () => {
    const { samples } = rk4((_t, s) => [-s[0]], [1], 0, 1, 4);
    samples[0].y[0] = 12345;
    expect(samples[1].y[0]).not.toBe(12345);
  });

  it('rejects a non-positive or non-integer step count', () => {
    expect(() => rk4((_t, s) => [-s[0]], [1], 0, 1, 0)).toThrow(RangeError);
    expect(() => rk4((_t, s) => [-s[0]], [1], 0, 1, 2.5)).toThrow(RangeError);
  });

  it('rejects a non-positive or non-integer sampleEvery', () => {
    expect(() => rk4((_t, s) => [-s[0]], [1], 0, 1, 10, 0)).toThrow(RangeError);
    expect(() => rk4((_t, s) => [-s[0]], [1], 0, 1, 10, 1.5)).toThrow(RangeError);
  });
});
