/**
 * Task 6 (v0.5.0 Phase 1c-ii): RiemannTensorNode numerical lowering.
 *
 * Coverage:
 *   - Component match vs the analytic Schwarzschild fixture for populated
 *     entries (≤1e-9 relative).
 *   - Quantitative antisymmetry on the LOWERED tensor (not the fixture):
 *     R^ρ_{σμν} = −R^ρ_{σνμ} for all μ<ν. (Walking analytic-only would be
 *     vacuous — the Task 0 fixture populates ~8 of 256 entries.)
 *
 * Scope (Task 0 fixture-pragmatic minimum):
 *   - schwarzschildRiemannFn populates only R^t_{rtr}, R^θ_{φθφ} and their
 *     last-two antisymmetric partners; all other 248/256 entries are 0.
 *   - The component-match loop skips fixture-zero entries via the
 *     `< 1e-30` guard: lowering may produce additional non-trivial
 *     Schwarzschild components (e.g. R^r_{θrθ}) — those are correct, not bugs.
 *   - Antisymmetry is asserted on the FULL lowered tensor — every R[ρ][σ][·][·]
 *     slab must be skew-symmetric in the last two indices.
 *
 * Bug-A note (plan reconciliation): the plan's R^t_{rtr} = 2GM/r³ shorthand is
 * the orthonormal-frame / leading-order value (~33% off at r=3·r_s). The
 * coordinate-basis Carroll formula `r_s/(r²(r-r_s))` is what the Task 0
 * fixture pins and what coordinate-basis lowering produces.
 */

import { describe, it, expect } from 'vitest';
import { evaluateNumerical } from '../../src/numerical/index.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';
import {
  schwarzschildRs,
  schwarzschildGFn,
  schwarzschildGInverseFn,
  schwarzschildRiemannFn,
} from '../fixtures/schwarzschild.js';

/** Build the Riemann AST. Names ('g', 'g_inv', 'x') match the inputs map. */
function buildRiemannNode(): ExprNode {
  const gLower = metric(
    'g',
    [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
    DIMENSIONLESS,
    '+,-,-,-',
  );
  const gInverse = metric(
    'g_inv',
    [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
    DIMENSIONLESS,
    '+,-,-,-',
  );
  const xCoord = tsym('x', [{ label: 'c', variance: 'upper' }], LENGTH, 'coordinate');

  return {
    kind: 'riemann-tensor',
    upperIndex: { label: 'rho', variance: 'upper' },
    lowerIndices: [
      { label: 'sigma', variance: 'lower' },
      { label: 'mu', variance: 'lower' },
      { label: 'nu', variance: 'lower' },
    ],
    gLower,
    gInverse,
    xCoord,
  };
}

describe('RiemannTensorNode numerical lowering on Schwarzschild', () => {
  it('matches analytic Schwarzschild Riemann components to ≤1e-9 relative', async () => {
    const M_sun = 1.989e30;
    const r_s = schwarzschildRs(M_sun);
    const x = [0, 3 * r_s, Math.PI / 2, 0];
    const analytic = schwarzschildRiemannFn(M_sun)(x);

    const node = buildRiemannNode();
    const gFn = schwarzschildGFn(M_sun);
    const gInverseFn = schwarzschildGInverseFn(M_sun);

    const result = await evaluateNumerical(node, {
      tensors: new Map([
        // Concrete metric values at x (sampled — used only as a fallback /
        // sanity-check; the real coordinate-dependent eval comes from fields).
        ['g', gFn(x) as unknown as number[][]],
        ['g_inv', gInverseFn(x) as unknown as number[][]],
        ['x', x],
      ]),
      fields: new Map([
        ['g', (xs: ReadonlyArray<number>) => gFn(xs) as unknown as number[][]],
        ['g_inv', (xs: ReadonlyArray<number>) => gInverseFn(xs) as unknown as number[][]],
      ]),
      dimension: 4,
    });

    const lowered = result.value as unknown as number[][][][];
    expect(Array.isArray(lowered)).toBe(true);
    expect(lowered.length).toBe(4);

    for (let rho = 0; rho < 4; rho++)
      for (let sigma = 0; sigma < 4; sigma++)
        for (let mu = 0; mu < 4; mu++)
          for (let nu = 0; nu < 4; nu++) {
            const expected = analytic[rho][sigma][mu][nu];
            if (Math.abs(expected) < 1e-30) continue;
            const actual = lowered[rho][sigma][mu][nu];
            const relErr = Math.abs(actual - expected) / Math.abs(expected);
            expect(relErr).toBeLessThan(1e-9);
          }
  });

  it('R^ρ_σμν = −R^ρ_σνμ (last-two-lower antisymmetry) on the LOWERED tensor', async () => {
    const M_sun = 1.989e30;
    const r_s = schwarzschildRs(M_sun);
    const x = [0, 3 * r_s, Math.PI / 2, 0];

    const node = buildRiemannNode();
    const gFn = schwarzschildGFn(M_sun);
    const gInverseFn = schwarzschildGInverseFn(M_sun);

    const result = await evaluateNumerical(node, {
      tensors: new Map([
        ['g', gFn(x) as unknown as number[][]],
        ['g_inv', gInverseFn(x) as unknown as number[][]],
        ['x', x],
      ]),
      fields: new Map([
        ['g', (xs: ReadonlyArray<number>) => gFn(xs) as unknown as number[][]],
        ['g_inv', (xs: ReadonlyArray<number>) => gInverseFn(xs) as unknown as number[][]],
      ]),
      dimension: 4,
    });

    const lowered = result.value as unknown as number[][][][];

    // M1: quantitative antisymmetry on the full lowered tensor.
    let maxAsymmetry = 0;
    for (let rho = 0; rho < 4; rho++)
      for (let sigma = 0; sigma < 4; sigma++)
        for (let mu = 0; mu < 4; mu++)
          for (let nu = mu + 1; nu < 4; nu++) {
            const sym = lowered[rho][sigma][mu][nu] + lowered[rho][sigma][nu][mu];
            maxAsymmetry = Math.max(maxAsymmetry, Math.abs(sym));
          }
    expect(maxAsymmetry).toBeLessThan(1e-14);
  });
});
