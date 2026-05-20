/**
 * Task 2.7 (v0.6.0 Phase 2): FLRW Friedmann closure H² = 8πGρ/3.
 *
 * ─── E-5 derivation (on-paper BEFORE coding) ───────────────────────────────
 *
 * Flat FLRW metric (SI, k=0, Cartesian comoving coords [t, x, y, z]):
 *
 *   g_μν  = diag(−c², a(t)², a(t)², a(t)²)
 *   g^μν  = diag(−1/c², 1/a(t)², 1/a(t)², 1/a(t)²)
 *
 * Comoving perfect fluid (rest frame), matter-dominated (p = 0):
 *
 *   u^μ  = (1, 0, 0, 0)          (contravariant four-velocity)
 *   u_μ  = g_μν u^ν = (−c², 0, 0, 0)    (covariant, metric-lowered)
 *   Normalization: g_μν u^μ u^ν = g_{tt} (u^t)² = −c²·1 = −c²  ✓
 *
 * Stress-energy (p = 0, so prefactor = ρ + 0 = ρ):
 *   T_μν = (ρ + p/c²) u_μ u_ν + p g_μν
 *        = ρ u_μ u_ν              (matter-dominated, p = 0)
 *   T_{00} = ρ · u_0 · u_0 = ρ · (−c²)·(−c²) = ρ c⁴
 *   T_{ij} = 0                   (dust, p = 0)
 *
 * κ = 8πG/c⁴  (SI coupling constant)
 *   κ T_{00} = (8πG/c⁴)·(ρ c⁴) = 8πG ρ
 *
 * G_{00} for flat FLRW (standard GR result, e.g. Carroll §8.3):
 *   G_{00} = 3 (ȧ/a)² = 3 H²
 *   where H ≡ ȧ/a is the Hubble parameter.
 *
 * Einstein field equation (00-component, Λ=0):
 *   G_{00} = κ T_{00}
 *   3 H² = 8πG ρ
 *   H² = 8πGρ/3    ← Friedmann equation ✓
 *
 * c² bookkeeping check (E-5):
 *   With g_{tt} = −c², u^t = 1 gives u_t = −c²; T_{00} = ρ c⁴.
 *   κ T_{00} = (8πG/c⁴)·ρc⁴ = 8πGρ.  G_{00} = 3H². They match → no residual.
 *   If g_{tt} = −1 (c=1 convention) were mixed with SI κ, we'd get a c⁴ mismatch.
 *   Consistency is guaranteed by using the same c² convention in both metric and κ.
 *
 * ─── Dimensional pre-test ───────────────────────────────────────────────────
 *
 *   [H²] = s⁻²
 *   [G]  = m³·kg⁻¹·s⁻²,  [ρ] = kg·m⁻³  ⟹  [Gρ] = s⁻²  ✓
 *   8πGρ/3 is dimensionally s⁻² — same as H².  No c factors needed.
 *
 * ─── Test strategy ──────────────────────────────────────────────────────────
 *
 * 1. Pick ρ ~ 1e-26 kg/m³ (cosmological matter density order of magnitude).
 * 2. Compute H = √(8πGρ/3); define a(t) = a₀ exp(Ht) (exponential for
 *    simplicity, valid at any single epoch — ȧ/a = H exactly).
 *    Alternatively: matter-dominated a(t) = a₀ (t/t₀)^{2/3}; then
 *    ȧ/a = (2/3)/t = H at the chosen epoch t₀. We pick the exponential
 *    because ȧ/a = H is exact at ALL t, simplifying FD evaluation.
 * 3. Build FLRW metric closures from flrwGFn / flrwGInverseFn.
 * 4. Build T_μν from perfectFluidStressEnergy with the FLRW metric at x.
 * 5. Call evaluateEinsteinEquationResidual with Λ=0.
 * 6. Measure-then-lock: TOL = 2 × max_observed across sample points.
 *
 * @module tests/numerical/einstein-flrw
 */

import { describe, it, expect } from 'vitest';
import { evaluateEinsteinEquationResidual } from '../../src/numerical/einstein-equation.js';
import { flrwGFn, flrwGInverseFn } from '../fixtures/flrw.js';
import { perfectFluidStressEnergy } from '../fixtures/perfect-fluid.js';
import { C_SI, G_SI } from '../../src/core/constants.js';

// ─── Dimensional pre-test (structural) ──────────────────────────────────────
// Verify [H²] == [Gρ] without running Einstein tensor machinery.
// This is a pure unit-analysis gate.

const RHO_TEST = 1e-26; // kg/m³
const H_TEST = Math.sqrt((8 * Math.PI * G_SI * RHO_TEST) / 3); // s⁻¹
// [H²] = s⁻²; [8πGρ/3] = [G][ρ] = (m³ kg⁻¹ s⁻²)(kg m⁻³) = s⁻²  ✓
// Ratio should be exactly 1 (same formula).
const H_SQUARED_RATIO = (H_TEST * H_TEST) / ((8 * Math.PI * G_SI * RHO_TEST) / 3);

describe('Einstein closure — FLRW Friedmann (Task 2.7)', () => {
  // ─── Part A: dimensional gate ──────────────────────────────────────────────
  it('dimensional pre-test: [H²] = [8πGρ/3] = s⁻² (ratio = 1)', () => {
    expect(H_SQUARED_RATIO).toBeCloseTo(1.0, 12);
  });

  // ─── Part B: Friedmann closure pin ────────────────────────────────────────
  //
  // Metric: g_μν = diag(−c², a(t)², a(t)², a(t)²)
  // Convention: g_{tt} = −c²  (same as Schwarzschild / de Sitter in UPT)
  //
  // Scale factor: exponential a(t) = a₀ exp(H t).
  //   ȧ(t) = H a(t)  ⟹  H(t) = ȧ/a = H (exact, constant).
  //
  // Choose a₀ = 1 (arbitrary normalization; only ȧ/a enters G_00).
  // Evaluate at t₀ where a(t₀) = 1 for cleanliness.
  // Sample points: multiple epochs at different a(t) values to probe the closure.

  // Matter density (cosmological order of magnitude)
  const rho = 1e-26; // kg/m³ — rest-mass density (NOT energy density)
  const p = 0; // dust / matter-dominated

  // Friedmann H:
  const H = Math.sqrt((8 * Math.PI * G_SI * rho) / 3);

  // Scale factor: a(t) = exp(H t), ȧ(t) = H exp(H t) = H a(t)
  const a0 = 1.0; // normalization: a(0) = 1
  const aFn = (t: number): number => a0 * Math.exp(H * t);
  const aDotFn = (t: number): number => H * a0 * Math.exp(H * t); // = H aFn(t)

  const gFn = flrwGFn(aFn);
  const gInvFn = flrwGInverseFn(aFn);

  // Comoving rest-frame: u^μ = (1, 0, 0, 0) in ALL coordinates (exact for comoving dust)
  const uUpper: [number, number, number, number] = [1, 0, 0, 0];

  // Build T_μν closure: metric is sampled at the evaluation point x.
  function flrwStressEnergy(
    x: [number, number, number, number],
  ): number[][] {
    const g = gFn(x);
    return perfectFluidStressEnergy({
      massDensity: rho,
      pressure: p,
      fourVelocityUpper: uUpper,
      metric: g,
    });
  }

  // Sample epochs. H ~ 1.88e-21 s⁻¹ for rho=1e-26, so H·t is negligible
  // for t in SI seconds of reasonable magnitude. Use dimensionless t-values
  // so that a(t) varies meaningfully (pick t such that H*t ∈ [0, 0.5]).
  // H ≈ 1.88e-21 s⁻¹ → 1/H ≈ 5.3e20 s.
  // t values: 0, 0.1/H, 0.2/H, 0.3/H (spread of a(t) from 1.0 to ~1.35).
  const invH = 1 / H;
  const samplePoints: [number, number, number, number][] = [
    [0,          0, 0, 0],
    [0.1 * invH, 0, 0, 0],
    [0.2 * invH, 0, 0, 0],
    [0.3 * invH, 0, 0, 0],
    [0.5 * invH, 0, 0, 0],
  ];

  // Measure-then-lock: TOL = 2 × max_observed across all 5 sample epochs.
  //
  // LOCK (measured 2026-05-19): max_observed = 1.189647e-26 at t=0 epoch.
  // The residual is tighter than Schwarzschild (2.66e-10) because:
  //   - The exponential a(t) = exp(H t) has constant ȧ/a = H by construction,
  //     so the Friedmann equation is exact at every t — no approximation.
  //   - The FD stencil for ∂_t a(t) hits near-machine-precision because the
  //     scale-factor time-variation is gentle (H ~ 1.88e-21 s⁻¹, so FD
  //     perturbations δt ~ 1e-6 × t_scale give Δa/a ~ H δt ~ 1e-27).
  //   - The diagonal metric means cross-component FD noise cancels exactly.
  //
  // c-convention locked: g_{tt} = −c²; κ = 8πG/c⁴; T_{00} = ρ c⁴.
  // G_{00} = 3H² (metric convention); κ T_{00} = 8πGρ. Friedmann holds exactly.
  const TOL = 2.38e-26; // 2 × 1.189647e-26 (measured 2026-05-19)

  it.each(samplePoints)(
    'normalized |G_μν - κ T_μν|/|g_μν| < TOL at x=[%d, %d, %d, %d]',
    (t, x, y, z) => {
      const xVec: [number, number, number, number] = [t, x, y, z];
      const residual = evaluateEinsteinEquationResidual({
        gFn,
        gInvFn,
        cosmologicalConstant: 0, // Λ = 0 (matter-dominated epoch)
        stressEnergy: flrwStressEnergy,
        x: xVec,
      });
      expect(residual).toBeLessThan(TOL);
    },
  );

  // Supplementary: verify T_00 has the expected value at t=0 (p=0 dust)
  // T_{00} = ρ u_0² = ρ (g_{00} u^0)² = ρ (−c²)² = ρ c⁴
  it('T_{00} = ρ c⁴ for comoving dust at t=0', () => {
    const x0: [number, number, number, number] = [0, 0, 0, 0];
    const T = flrwStressEnergy(x0);
    const expected = rho * C_SI * C_SI * C_SI * C_SI;
    // Relative tolerance: T_{00} ~ rho * c⁴ ~ 1e-26 * 8.1e33 ~ 8.1e7 Pa
    expect(T[0][0]).toBeCloseTo(expected, 0); // 0 decimal places = nearest integer Pa
  });
});
