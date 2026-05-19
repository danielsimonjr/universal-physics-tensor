/**
 * v0.5.1 Task 7 (PD-7): opt-in 4th-order stencil for `pderivNumericalFn`.
 *
 * Backwards-compat: omitting `order` keeps the v0.3.5 2nd-order centered
 * stencil with adaptive h = 1e-6·max(|x|,1).
 * Opt-in: `order: 4` switches to the 4-point centered stencil
 *   f'(x) ≈ (−f(x+2h) + 8 f(x+h) − 8 f(x−h) + f(x−2h)) / (12 h)
 * with adaptive h = 1e-4·max(|x|,1) (the regime where O(h⁴) advantage
 * materialises vs round-off on this domain).
 */
import { describe, it, expect } from 'vitest';
import { pderivNumericalFn } from '../../src/numerical/pderiv.js';

describe('pderivNumericalFn — order parameter (PD-7)', () => {
  it('defaults to 2nd-order (backwards-compat)', () => {
    const f = (x: ReadonlyArray<number>) => x[0] ** 3;
    const dfx = pderivNumericalFn(f, [1.0], 0);
    // 2nd-order at h≈1e-6: truncation O(h²)·f''' ~ 1e-12; round-off ε|f|/h ~ 1e-10.
    // f'(1) = 3 — within ~1e-7 in practice.
    expect(typeof dfx).toBe('number');
    expect(Math.abs((dfx as number) - 3.0)).toBeLessThan(1e-5);
  });

  it('supports 4th-order opt-in (≤1e-9 on a smooth cubic)', () => {
    const f = (x: ReadonlyArray<number>) => x[0] ** 3;
    const dfx = pderivNumericalFn(f, [1.0], 0, { order: 4 });
    expect(typeof dfx).toBe('number');
    // 4th-order at h≈1e-4: truncation O(h⁴) on a polynomial = 0 modulo round-off.
    expect(Math.abs((dfx as number) - 3.0)).toBeLessThan(1e-9);
  });

  it('supports vector-field arrays (rank-2 components) at order=4', () => {
    // Smooth rank-2 field: g(x) = [[x², 0], [0, x³]]
    const g = (x: ReadonlyArray<number>) => [[x[0] ** 2, 0], [0, x[0] ** 3]];
    const dg = pderivNumericalFn(g, [1.0], 0, { order: 4 });
    // Expected: dg/dx = [[2, 0], [0, 3]] — as flat order [2, 0, 0, 3].
    expect(Array.isArray(dg)).toBe(true);
    const flat = dg as number[];
    expect(flat.length).toBe(4);
    expect(Math.abs(flat[0] - 2.0)).toBeLessThan(1e-9);
    expect(Math.abs(flat[1])).toBeLessThan(1e-12);
    expect(Math.abs(flat[2])).toBeLessThan(1e-12);
    expect(Math.abs(flat[3] - 3.0)).toBeLessThan(1e-9);
  });

  it('rejects unsupported order values', () => {
    const f = (x: ReadonlyArray<number>) => x[0];
    expect(() =>
      pderivNumericalFn(f, [1.0], 0, { order: 3 as unknown as 2 | 4 }),
    ).toThrow(/order/i);
  });

  it('supports explicit h override (load-bearing for inner-FD step in curvature lowering)', () => {
    // h override matters where the default adaptive step doesn't balance
    // truncation vs round-off — e.g. c²-scaled g_tt cancellation noise.
    const f = (x: ReadonlyArray<number>) => x[0] ** 3;
    const dfx = pderivNumericalFn(f, [1.0], 0, { order: 4, h: 1e-3 });
    expect(typeof dfx).toBe('number');
    expect(Math.abs((dfx as number) - 3.0)).toBeLessThan(1e-9);
  });
});
