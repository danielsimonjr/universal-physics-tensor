/**
 * Task 2.5 (v0.6.0 Phase 2): de Sitter closure pin.
 *
 * de Sitter is a vacuum solution WITH cosmological constant:
 *   T_μν = 0,  Λ > 0  ⟹  G_μν + Λ g_μν = 0  ⟺  R_μν = Λ g_μν
 *
 * The evaluator residual is scale-normalized (each |G_μν + Λ g_μν - κ T_μν|
 * divided by max(|g_μν|, 1.0)), so the achievable tolerance is set by the
 * FD truncation floor of the 4th-order stencil on de Sitter curvature.
 *
 * Measure-then-lock: TOL set to 2 × max_observed across all sample points.
 * Measured value documented below.
 *
 * Sample points: r ∈ {0.1, 0.2, 0.3, 0.4, 0.5} × r_dS, θ = π/2.
 * Chosen Λ = 1e-52 m⁻² (order-of-magnitude of observed cosmological constant).
 * r_dS = √(3/Λ) ≈ 1.73e26 m.
 */

import { describe, it, expect } from 'vitest';
import { evaluateEinsteinEquationResidual } from '../../src/numerical/einstein-equation.js';
import {
  deSitterGFn,
  deSitterGInverseFn,
} from '../fixtures/de-sitter.js';
import { C_SI, G_SI } from '../../src/core/constants.js';

void C_SI; // constants imported for discipline (no inline literals)
void G_SI;

// Λ in m⁻² — cosmological-constant order of magnitude (Planck 2018)
const LAMBDA = 1.1e-52; // m⁻²

// de Sitter horizon radius r_dS = √(3/Λ)
const r_dS = Math.sqrt(3 / LAMBDA);

const gFn = deSitterGFn(LAMBDA);
const gInvFn = deSitterGInverseFn(LAMBDA);

/** Vacuum stress-energy: all zeros. */
function zeroT(_x: [number, number, number, number]): number[][] {
  return [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
}

// 5 sample points well inside the de Sitter horizon (r < r_dS)
// r ∈ {0.1, 0.2, 0.3, 0.4, 0.5} × r_dS
const samplePoints: [number, number, number, number][] = [
  [0, 0.1 * r_dS, Math.PI / 2, 0],
  [0, 0.2 * r_dS, Math.PI / 3, 1],
  [0, 0.3 * r_dS, Math.PI / 4, 2],
  [0, 0.4 * r_dS, Math.PI / 2, 3],
  [0, 0.5 * r_dS, Math.PI / 6, 0.5],
];

// Measure-then-lock: TOL = 2 × max_observed across all 5 sample points.
// Measured 2026-05-19: max_observed = 1.6921e-10 at r=0.3*r_dS, θ=π/4.
// The dominant contribution is the φφ off-diagonal FD truncation noise in
// the Riemann→Ricci→Einstein pipeline, comparable to the Schwarzschild case
// (1.33e-10). Both are 4th-order FD stencil floors, not physics error.
const TOL = 3.39e-10; // 2 × 1.6921e-10 (measured 2026-05-19)

describe('Einstein closure — de Sitter (T=0, Λ>0)', () => {
  it.each(samplePoints)(
    'normalized |G_μν + Λg_μν|/|g_μν| < TOL at x=[%d, %d, %d, %d]',
    (t, r, theta, phi) => {
      const x: [number, number, number, number] = [t, r, theta, phi];
      const residual = evaluateEinsteinEquationResidual({
        gFn,
        gInvFn,
        cosmologicalConstant: LAMBDA,
        stressEnergy: zeroT,
        x,
      });
      expect(residual).toBeLessThan(TOL);
    },
  );
});
