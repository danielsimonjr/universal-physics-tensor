/**
 * Task 2.12 pin test: `pderivNumericalFn` default order is 4 as of v0.6.0.
 *
 * Discriminating test: ∂_x(x³) at x=1.
 * - 4th-order centered stencil captures cubics exactly modulo round-off
 *   (the O(h⁴) term on a degree-3 polynomial is zero analytically), so
 *   relErr < 1e-9 is achievable.
 * - 2nd-order at default h = 1e-6·max(|x|,1) carries O(h²)·f'''(x) ~ 6e-13
 *   truncation error plus round-off O(ε·f/h) ~ 1e-10; practical deviation
 *   from exact is ~1e-7 to 1e-10 — outside the 1e-10 threshold below.
 *
 * RED before the flip (default=2 still carries residual noise > 1e-10),
 * GREEN after (default=4 hits near-machine-precision on this polynomial).
 */
import { describe, it, expect } from 'vitest';
import { pderivNumericalFn } from '../../src/numerical/pderiv.js';

describe('pderivNumericalFn default order is 4 (v0.6.0 FD flip, Task 2.12)', () => {
  it('cubic ∂_x(x³) at x=1 is near-exact (relErr < 1e-11) without explicit order', () => {
    // 4th-order FD on a cubic: truncation error = 0 analytically;
    // residual is pure round-off ~ 1e-12 to 1e-13.
    // 2nd-order FD at h=1e-6·max(|x|,1): empirically ~8e-11 at x=1 — above 1e-11.
    // Threshold 1e-11 is tight enough to discriminate: RED with default=2, GREEN with default=4.
    const f = ([x]: ReadonlyArray<number>) => x * x * x;
    const dfdx = pderivNumericalFn(f, [1], 0) as number;
    expect(typeof dfdx).toBe('number');
    // exact answer is 3·x² = 3 at x=1
    expect(Math.abs(dfdx - 3)).toBeLessThan(1e-11);
  });
});
