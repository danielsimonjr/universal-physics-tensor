/**
 * Task 2.4 (v0.6.0 Phase 2): Schwarzschild vacuum closure pin.
 *
 * Schwarzschild is a vacuum solution of the Einstein field equations:
 *   T_μν = 0,  Λ = 0  ⟹  G_μν ≡ 0
 *
 * The evaluator should return a residual near zero (FD truncation floor).
 * 13 sample points: 10 standard + 3 near-horizon (E-9 augmentation).
 *
 * E-4 measure-then-lock: TOL is set to 2 × max_observed across all 13 points.
 * The measured value and date are recorded in the comment below.
 *
 * P-4 TDD RED step: a stub returning 1.0 was confirmed to FAIL on all points
 * before the real evaluator was implemented (2026-05-19).
 */

import { describe, it, expect } from 'vitest';
import { evaluateEinsteinEquationResidual } from '../../src/numerical/einstein-equation.js';
import {
  schwarzschildRs,
  schwarzschildGFn,
  schwarzschildGInverseFn,
} from '../fixtures/schwarzschild.js';
import { C_SI, G_SI } from '../../src/core/constants.js';

const M_SUN = 1.989e30; // kg
const r_s = schwarzschildRs(M_SUN);

const gFn = schwarzschildGFn(M_SUN);
const gInvFn = schwarzschildGInverseFn(M_SUN);

/** Vacuum stress-energy: all zeros. */
function zeroT(_x: [number, number, number, number]): number[][] {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

// 13 sample points: 10 standard + 3 near-horizon (E-9 augmentation)
const samplePoints: [number, number, number, number][] = [
  [0, 3 * r_s, Math.PI / 2, 0],
  [0, 5 * r_s, Math.PI / 3, 1],
  [0, 10 * r_s, Math.PI / 4, 2],
  [0, 100 * r_s, Math.PI / 2, 3],
  [0, 1000 * r_s, Math.PI / 6, 0.5],
  [0, 4 * r_s, Math.PI / 2, 0.7],
  [0, 6 * r_s, Math.PI / 3, 1.2],
  [0, 8 * r_s, Math.PI / 4, 2.3],
  [0, 50 * r_s, Math.PI / 5, 0.1],
  [0, 200 * r_s, Math.PI / 2.5, 1.8],
  // E-9 near-horizon points
  [0, 2.05 * r_s, Math.PI / 2, 0],
  [0, 2.1 * r_s, Math.PI / 3, 1],
  [0, 2.5 * r_s, Math.PI / 4, 2],
];

// E-4 measure-then-lock: TOL = 2 × max_observed across all 13 sample points.
// Measured 2026-05-19: max_observed = 1.3283e-10 at r=5*r_s (off-diagonal
// |G_φφ|/|g_φφ| dominated by 4th-order FD truncation on Riemann components).
// Normalization: each |G_μν| divided by max(|g_μν|, 1) — see evaluator JSDoc.
const TOL = 2.66e-10; // 2 × 1.33e-10 (measured 2026-05-19)

describe('Einstein vacuum closure — Schwarzschild (T=0, Λ=0)', () => {
  void C_SI; // constants imported for documentation / discipline (no inline literals)
  void G_SI;

  it.each(samplePoints)(
    'normalized |G_μν|/|g_μν| < TOL at x=[%d, %d, %d, %d]',
    (t, r, theta, phi) => {
      const x: [number, number, number, number] = [t, r, theta, phi];
      const residual = evaluateEinsteinEquationResidual({
        gFn,
        gInvFn,
        cosmologicalConstant: 0,
        stressEnergy: zeroT,
        x,
      });
      expect(residual).toBeLessThan(TOL);
    },
  );
});
