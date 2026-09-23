/**
 * `checkKillingEquation` — the verdict-bearing sibling of `verifyKillingEquation`.
 *
 * `verifyKillingEquation` returns the raw max residual |∇_μ ξ_ν + ∇_ν ξ_μ| in the metric's units
 * and never reads `KillingEquationOptions.tolerance`. `checkKillingEquation` honours the tolerance
 * on a RELATIVE residual, residual / max(max|g_μν(x)|, 1), the normalization
 * `evaluateEinsteinEquationResidual` uses. With SI Schwarzschild (g_tt ≈ −c² ≈ −9e16) an exact
 * Killing field leaves an ABSOLUTE residual as large as 2.44e-4, so an absolute 1e-10 default would
 * report exact Killing fields as failing; the relative residual is ~3e-21.
 *
 * Every pinned number below was measured under vitest on Node (the test runtime). Measured with Bun
 * (JavaScriptCore), one sample point gave 1.19e-7 where V8 gives exactly 0: the two engines' trig
 * differ by an ULP and an IEEE cancellation amplifies it. Re-measure pins under Node, never Bun.
 */
import { describe, expect, it } from 'vitest';
import {
  schwarzschildChristoffelFn,
  schwarzschildGFn,
  schwarzschildKillingPhi,
  schwarzschildKillingT,
  schwarzschildRs,
} from '../fixtures/schwarzschild.js';
import { checkKillingEquation, verifyKillingEquation } from '../../src/numerical/killing.js';

const M_SUN = 1.989e30;
const r_s = schwarzschildRs(M_SUN);
type V4 = [number, number, number, number];

const chrAt = (x: V4) => {
  const arr = schwarzschildChristoffelFn(M_SUN)(x);
  return (l: number, m: number, n: number) => arr[16 * l + 4 * m + n];
};
const g = schwarzschildGFn(M_SUN);
const scaleAt = (x: V4) => Math.max(...g(x).flat().map(Math.abs), 1);

// The points the decision named (3/10/100/1000 r_s) plus the existing suite's 5 r_s point.
const POINTS: V4[] = [
  [0, 3 * r_s, Math.PI / 2, 0],
  [0, 5 * r_s, Math.PI / 3, 1],
  [0, 10 * r_s, Math.PI / 4, 2],
  [0, 100 * r_s, Math.PI / 2, 3],
  [0, 1000 * r_s, Math.PI / 6, 0.5],
];

// A constant radial field ξ = ∂_r is NOT a Killing field of Schwarzschild.
const radial = () => () => [0, 1, 0, 0] as V4;

describe('checkKillingEquation', () => {
  it.each(POINTS)('exact Killing fields pass the default tolerance at (t=%d, r=%d, θ, φ)', (...p) => {
    const x = p as unknown as V4;
    for (const xi of [schwarzschildKillingT, schwarzschildKillingPhi]) {
      const c = checkKillingEquation(xi, g, chrAt, x);
      expect(c.withinTolerance).toBe(true);
      expect(c.relativeResidual).toBeLessThanOrEqual(1e-10);
    }
  });

  it('residual is identical to verifyKillingEquation; relativeResidual divides by max(max|g|, 1)', () => {
    for (const x of POINTS) {
      for (const xi of [schwarzschildKillingT, schwarzschildKillingPhi, radial]) {
        const c = checkKillingEquation(xi, g, chrAt, x);
        expect(c.residual).toBe(verifyKillingEquation(xi, g, chrAt, x));
        expect(c.relativeResidual).toBe(c.residual / scaleAt(x));
      }
    }
  });

  it('verifyKillingEquation is unchanged: pinned absolute residuals (Node-measured)', () => {
    // Default path, ξ = ∂_t. These are machine precision RELATIVE to g_tt ≈ −9e16.
    expect(verifyKillingEquation(schwarzschildKillingT, g, chrAt, POINTS[0])).toBe(0.000244140625);
    expect(verifyKillingEquation(schwarzschildKillingT, g, chrAt, POINTS[2])).toBe(0.000030517578125);
    expect(verifyKillingEquation(schwarzschildKillingT, g, chrAt, POINTS[1])).toBe(0);
  });

  it('a non-Killing field fails the default; a looser tolerance passes the same case', () => {
    const x = POINTS[2];
    const strict = checkKillingEquation(radial, g, chrAt, x);
    expect(strict.withinTolerance).toBe(false);
    const loose = checkKillingEquation(radial, g, chrAt, x, { tolerance: strict.relativeResidual * 2 });
    expect(loose.withinTolerance).toBe(true);
  });

  it('a tighter tolerance fails a case the default passes', () => {
    const x = POINTS[0]; // ∂_t at 3 r_s: relative residual > 0 but far below 1e-10
    const d = checkKillingEquation(schwarzschildKillingT, g, chrAt, x);
    expect(d.relativeResidual).toBeGreaterThan(0);
    expect(d.withinTolerance).toBe(true);
    const tight = checkKillingEquation(schwarzschildKillingT, g, chrAt, x, { tolerance: d.relativeResidual / 2 });
    expect(tight.withinTolerance).toBe(false);
  });

  it.each([0, -1e-10, Number.NaN, Number.POSITIVE_INFINITY])('rejects tolerance %s with a RangeError', (tol) => {
    expect(() => checkKillingEquation(schwarzschildKillingT, g, chrAt, POINTS[0], { tolerance: tol })).toThrow(RangeError);
  });
});
