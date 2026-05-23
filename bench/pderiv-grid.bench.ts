/**
 * PD-grid bench — `pderivNumericalFn` order=2 vs order=4 on a Schwarzschild
 * spatial grid.
 *
 * Carried forward from v0.5.1 (deferred per `todo.md` → "Bench harnesses").
 * Cross-validates the v0.6.0 default-order flip (2→4 — FD-flip): does the
 * higher-order default carry a measurable per-call cost relative to the
 * 2nd-order stencil it replaced?
 *
 *   - order=2: 2-point centered stencil [f(x+h) − f(x−h)] / (2h),
 *     2 metric evaluations per derivative.
 *   - order=4: 4-point centered stencil
 *     [−f(x+2h) + 8 f(x+h) − 8 f(x−h) + f(x−2h)] / (12h),
 *     4 metric evaluations per derivative.
 *
 * Naive expectation: ~2× slower at order=4 (twice the metric evaluations).
 * Schwarzschild's g_{μν} closure is cheap, so the actual ratio should be
 * close to the eval-count multiplier.
 *
 * **What this bench is for**: providing a baseline for the "is 4th-order
 * worth it" question. Truncation error at order=4 is ~10⁴× lower on smooth
 * inputs; this bench measures the cost half of that tradeoff.
 *
 * Grid: 3×3 spatial points (r ∈ {2.5 r_s, 5 r_s, 10 r_s}, θ ∈ {π/4, π/2, 3π/4})
 * × 4 partial-derivative directions = 36 derivative calls per iteration.
 *
 * Per v0.6.1 Design Decision #5, informational-only — no threshold gates.
 *
 * @see src/numerical/pderiv.ts  (pderivNumericalFn)
 */
import { bench, describe } from 'vitest';
import {
  schwarzschildGFn,
  schwarzschildRs,
} from '../tests/fixtures/schwarzschild.js';
import { pderivNumericalFn } from '../src/numerical/pderiv.js';

// ---------------------------------------------------------------------------
// Schwarzschild grid (M_sun) — three radii × three polar angles.
// ---------------------------------------------------------------------------

const M_KG = 1.989e30;
const r_s = schwarzschildRs(M_KG);
const G_FN = schwarzschildGFn(M_KG);

const RADII = [2.5 * r_s, 5 * r_s, 10 * r_s];
const THETAS = [Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4];

const GRID_POINTS: ReadonlyArray<[number, number, number, number]> = (() => {
  const points: [number, number, number, number][] = [];
  for (const r of RADII) {
    for (const theta of THETAS) {
      points.push([0, r, theta, 0]);
    }
  }
  return points;
})();

// ---------------------------------------------------------------------------
// Bench suite — sweep order=2 vs order=4 across the 9-point grid × 4 dirs.
// ---------------------------------------------------------------------------

describe('PD-grid: pderivNumericalFn order=2 vs order=4 (Schwarzschild 3×3)', () => {
  bench(
    'pderiv order=2 — 9 points × 4 directions = 36 derivative calls',
    () => {
      for (const x of GRID_POINTS) {
        for (let mu = 0; mu < 4; mu++) {
          pderivNumericalFn(G_FN, x, mu, { order: 2 });
        }
      }
    },
    { iterations: 100, time: 5_000 },
  );

  bench(
    'pderiv order=4 — 9 points × 4 directions = 36 derivative calls (v0.6.0 default)',
    () => {
      for (const x of GRID_POINTS) {
        for (let mu = 0; mu < 4; mu++) {
          pderivNumericalFn(G_FN, x, mu, { order: 4 });
        }
      }
    },
    { iterations: 100, time: 5_000 },
  );
});
