/**
 * Witnesses W7 / W7b / W7c / W8 / W8b for the two approximation bridges.
 *
 * `K(k)` is evaluated by the arithmetic-geometric mean, NOT by a truncated
 * hypergeometric series. The residual W7 asserts is itself a
 * fourth-significant-figure quantity, and a four-term series gives
 * `K = 1.575079505` against the AGM's `1.574732341` — wrong in the fourth
 * decimal, which propagates straight into a wrong residual.
 *
 * @module tests/atlas/oscillators-limits
 */

import { describe, expect, it } from 'vitest';

import {
  AB_DAMPED_MASSLESS,
  AB_PENDULUM_LINEAR,
  LIMIT_BRIDGES,
  makeApproximation,
} from '../../src/atlas/oscillators/bridges-limits.js';
import { MissingHorizonError } from '../../src/atlas/types.js';
import type { ApproximationBound } from '../../src/atlas/types.js';
import { rk4 } from './_ode.js';

/** Arithmetic-geometric mean of two positive reals. */
function agm(a0: number, b0: number): number {
  let a = a0;
  let b = b0;
  for (let i = 0; i < 60; i++) {
    const an = (a + b) / 2;
    const bn = Math.sqrt(a * b);
    if (an === a && bn === b) break;
    a = an;
    b = bn;
  }
  return a;
}

/** Complete elliptic integral of the first kind, `K(k) = π / (2·AGM(1, √(1−k²)))`. */
function ellipticK(k: number): number {
  return Math.PI / (2 * agm(1, Math.sqrt(1 - k * k)));
}

/** Exact pendulum period ratio `T/T0 = (2/π) K(sin(θ0/2))`. */
function periodRatio(theta0: number): number {
  return (2 / Math.PI) * ellipticK(Math.sin(theta0 / 2));
}

const THETA0 = 0.2;
/** `ω0 = 1` throughout, so `T0 = 2π` and a "cycle" is `2π` of linear phase. */
const T0 = 2 * Math.PI;

describe('ab-pendulum-linear — W7: relative period error and its residual', () => {
  it('reproduces the AGM elliptic integral at θ0 = 0.2', () => {
    const k = Math.sin(THETA0 / 2);
    expect(k).toBeCloseTo(0.09983341664682815, 15);
    expect(ellipticK(k)).toBeCloseTo(1.574732340625072, 12);
  });

  it('measures T/T0 − 1 ∈ [0.002505, 0.002507]', () => {
    const rel = periodRatio(THETA0) - 1;
    expect(rel).toBeGreaterThan(0.002505);
    expect(rel).toBeLessThan(0.002507);
  });

  it('leaves a residual over θ0²/16 of [5.70e-6, 5.76e-6], explained by the next series term', () => {
    const residual = periodRatio(THETA0) - 1 - THETA0 ** 2 / 16;
    expect(residual).toBeGreaterThan(5.7e-6);
    expect(residual).toBeLessThan(5.76e-6);

    const nextTerm = (11 * THETA0 ** 4) / 3072;
    expect(Math.abs(residual - nextTerm)).toBeLessThan(2e-8);
  });

  it('states θ0²/16 as the bound delta at the edge of the parameter range', () => {
    expect(AB_PENDULUM_LINEAR.bound?.delta).toBeCloseTo(0.5 ** 2 / 16, 15);
    expect(AB_PENDULUM_LINEAR.bound?.limitCharacter).toBe('regular');
  });
});

describe('ab-pendulum-linear — W7b: the approximation is NON-UNIFORM in time', () => {
  it('reaches π/2 of phase drift after ~100 cycles at θ0 = 0.2', () => {
    const driftPerCycle = 2 * Math.PI * (periodRatio(THETA0) - 1);
    const cycles = Math.PI / 2 / driftPerCycle;
    expect(cycles).toBeGreaterThan(99);
    expect(cycles).toBeLessThan(101);
  });

  it('has a horizon that excludes 200 T0 and admits 10 T0', () => {
    const bound = AB_PENDULUM_LINEAR.bound;
    expect(bound).toBeDefined();
    expect(bound?.horizonHolds(200 * T0, { T0, theta0: THETA0 })).toBe(false);
    expect(bound?.horizonHolds(10 * T0, { T0, theta0: THETA0 })).toBe(true);
  });
});

describe('ab-pendulum-linear — W7c: RK4 cross-check of the accumulated phase lag', () => {
  it('lags the linear grid by the elliptic prediction, within 0.05°', () => {
    const cycles = 100;
    const stepsPerCycle = 20_000;
    // Sampling every 20th step brackets each crossing to T0/1000; the function
    // is locally linear at a zero, so the interpolation error is ~1e-6 degrees.
    const sampleEvery = 20;
    const { samples } = rk4(
      (_t, y) => [y[1], -Math.sin(y[0])],
      [THETA0, 0],
      0,
      cycles * T0,
      cycles * stepsPerCycle,
      sampleEvery,
    );

    const target = cycles * T0;
    let crossing = Number.NaN;
    let bestGap = Number.POSITIVE_INFINITY;
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1];
      const b = samples[i];
      if (a.y[0] === 0 || a.y[0] > 0 !== b.y[0] > 0) {
        const tc = a.t + ((b.t - a.t) * a.y[0]) / (a.y[0] - b.y[0]);
        if (Math.abs(tc - target) < bestGap) {
          bestGap = Math.abs(tc - target);
          crossing = tc;
        }
      }
    }
    expect(Number.isFinite(crossing)).toBe(true);

    // Pair the measured crossing with its OWN index n (t = (n + ½)T/2 on the
    // nonlinear period), then compare against the linear grid at that same n.
    const ratio = periodRatio(THETA0);
    const n = Math.round(crossing / ((ratio * T0) / 2) - 0.5);
    const gridT = (n + 0.5) * (T0 / 2);

    const lagDeg = (360 * (crossing - gridT)) / T0;
    const predictedDeg = 360 * (cycles - cycles / ratio);
    expect(predictedDeg).toBeGreaterThan(89.9);
    expect(predictedDeg).toBeLessThan(90.0);
    expect(Math.abs(lagDeg - predictedDeg)).toBeLessThan(0.05);
  }, 30_000);
});

/** Characteristic roots of `m r² + b r + k = 0`, overdamped (real, distinct). */
function roots(m: number, b: number, k: number): { slow: number; fast: number } {
  const disc = Math.sqrt(b * b - 4 * m * k);
  return { slow: (-b + disc) / (2 * m), fast: (-b - disc) / (2 * m) };
}

describe('ab-damped-massless — W8: the order drops and the roots separate', () => {
  it.each([1e-1, 1e-2, 1e-3])('splits into a slow and a fast root at m = %s', (m) => {
    const b = 1;
    const k = 1;
    const { slow, fast } = roots(m, b, k);
    expect(Math.abs(slow + k / b)).toBeLessThan(2 * m);
    expect(Math.abs(fast * m + b)).toBeLessThan(2 * m);
  });

  it('records the limit as singular', () => {
    expect(AB_DAMPED_MASSLESS.bound?.limitCharacter).toBe('singular');
    expect(AB_DAMPED_MASSLESS.bound?.norm).toBe('sup |x − x_reduced| for t ≥ 5 m/b');
  });
});

describe('ab-damped-massless — W8b: the lost initial condition shows in the VELOCITY', () => {
  const m = 1e-3;
  const b = 1;
  const k = 1;

  /** Exact two-root solution of `m x″ + b x′ + k x = 0`, `x(0)=1, x′(0)=v0`. */
  function full(v0: number): { x: (t: number) => number; v: (t: number) => number } {
    const { slow, fast } = roots(m, b, k);
    const A = (v0 - fast) / (slow - fast);
    const B = (slow - v0) / (slow - fast);
    return {
      x: (t) => A * Math.exp(slow * t) + B * Math.exp(fast * t),
      v: (t) => A * slow * Math.exp(slow * t) + B * fast * Math.exp(fast * t),
    };
  }

  const reducedX = (t: number): number => Math.exp((-k / b) * t);
  const reducedV = (t: number): number => (-k / b) * Math.exp((-k / b) * t);

  it.each([0, 5])(
    'holds the position within 2(1+v0)m across the whole outer region, v0 = %s',
    (v0) => {
      const { x } = full(v0);
      const t0 = (5 * m) / b;
      let sup = 0;
      for (let i = 0; i <= 20_000; i++) {
        const t = t0 + (i * (10 - t0)) / 20_000;
        sup = Math.max(sup, Math.abs(x(t) - reducedX(t)));
      }
      expect(sup).toBeGreaterThan(0);
      expect(sup).toBeLessThan(2 * (1 + v0) * m);
    },
  );

  it('misses the velocity by O(1) inside the layer and recovers it outside', () => {
    const { v } = full(5);
    expect(Math.abs(v((0.5 * m) / b) - reducedV((0.5 * m) / b))).toBeGreaterThan(1);
    expect(Math.abs(v((5 * m) / b) - reducedV((5 * m) / b))).toBeLessThan(0.05);
  });

  it('has a horizon that excludes the boundary layer and admits the outer region', () => {
    const bound = AB_DAMPED_MASSLESS.bound;
    expect(bound?.horizonHolds((0.5 * m) / b, { m, b })).toBe(false);
    expect(bound?.horizonHolds((5 * m) / b, { m, b })).toBe(true);
  });
});

describe('both bridges carry a mandatory horizon', () => {
  it.each(LIMIT_BRIDGES)('$id states prose and machine horizons', (bridge) => {
    expect(bridge.relation).toBe('approximation');
    const bound = bridge.bound;
    expect(bound).toBeDefined();
    expect(bound?.horizon.trim()).not.toBe('');
    expect(typeof bound?.horizonHolds).toBe('function');
  });

  it('refuses to construct an approximation bound with an empty horizon', () => {
    const empty: ApproximationBound = {
      K: 1,
      delta: 0.1,
      norm: 'relative period error',
      domain: 'θ0 ≤ 0.5 rad',
      horizon: '   ',
      horizonHolds: () => true,
      limitCharacter: 'regular',
    };
    expect(() => makeApproximation(empty)).toThrow(MissingHorizonError);
  });
});
