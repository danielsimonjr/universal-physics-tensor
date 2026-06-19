/**
 * Klein-Gordon dispersion-relation numerical evaluator (G-7 debt closure).
 *
 * Companion to the symbolic predicate `KleinGordonEquationNode`
 * (`src/dimensional/klein-gordon-equation.ts`, Part-X §X.5): the predicate
 * pins structure + dimensions of `(□ + m²)φ = J`; this module supplies the
 * numerical content for the *free-field plane-wave sector*.
 *
 * A plane wave φ ~ exp(i(k·x − ωt)) solves the free Klein-Gordon equation
 * `(□ + m²)φ = 0` iff the dispersion relation holds
 * (Peskin & Schroeder 1995, *An Introduction to Quantum Field Theory*,
 * §2.1 — ω_k² = |k|² + m² in natural units; restoring SI factors):
 *
 *   ω² = c² k² + (m c² / ℏ)²
 *
 * where ω_C = m c² / ℏ is the (angular) Compton frequency of the field
 * quantum. The evaluator returns the **scale-normalized residual**
 *
 *   r = (ω² − c²k² − ω_C²) / (ω² + c²k² + ω_C²)
 *
 * which is dimensionless, bounded in (−1, 1), and zero iff the plane wave
 * solves the free KG equation — the same residual-normalization discipline
 * as `evaluateEinsteinEquationResidual` (src/numerical/einstein-equation.ts),
 * adapted to the algebraic (no-FD) plane-wave case.
 *
 * Scope note (honesty policy): this closes the dispersion-relation slice of
 * the missing-evaluator debt only. A full finite-difference wave-operator
 * evaluator `□φ` on coordinate grids (the analogue of the curvature lowering
 * pipeline) remains future work.
 *
 * @module numerical/klein-gordon
 */

import { C_SI, HBAR_SI } from '../core/constants.js';
import { validateFiniteInputs } from './input-validation.js';

/**
 * Input bag for {@link evaluateKGDispersionResidual}.
 *
 * @public
 */
export interface KGDispersionResidualInput {
  /** Angular frequency ω of the plane wave (rad/s). Must be > 0 and finite. */
  readonly omega_per_s: number;
  /** Wavenumber magnitude |k| (m⁻¹). Must be ≥ 0 and finite. */
  readonly k_per_m: number;
  /** Field-quantum mass m (kg). Must be ≥ 0 and finite (0 = massless field). */
  readonly mass_kg: number;
}

/**
 * Input bag for {@link verifyKleinGordonPlaneWave}.
 *
 * @public
 */
export interface KGPlaneWaveVerifyInput {
  /** Field-quantum mass m (kg). Must be ≥ 0 and finite (0 = massless field). */
  readonly mass_kg: number;
  /** Wavenumber magnitude |k| (m⁻¹). Must be ≥ 0 and finite. */
  readonly k_per_m: number;
  /**
   * Maximum tolerated |residual| for the closure check.
   * Default 1e-12 (the algebraic round-trip lands at the few-ULP level,
   * ≲ 1e-15; 1e-12 leaves ~3 orders of headroom, mirroring the
   * measure-then-lock convention of `verifyKillingEquation`).
   */
  readonly tolerance?: number;
}

/**
 * Result of {@link verifyKleinGordonPlaneWave}.
 *
 * @public
 */
export interface KGPlaneWaveVerifyResult {
  /** The exact dispersion root ω = √(c²k² + (mc²/ℏ)²) (rad/s). */
  readonly omega_per_s: number;
  /** Scale-normalized dispersion residual at the constructed ω (dimensionless). */
  readonly residual: number;
  /** Whether |residual| ≤ tolerance. */
  readonly withinTolerance: boolean;
}

/**
 * Evaluate the dimensionless free-field Klein-Gordon dispersion residual
 *
 *   r = (ω² − c²k² − (m c²/ℏ)²) / (ω² + c²k² + (m c²/ℏ)²)
 *
 * r = 0 iff the plane wave φ ~ exp(i(k·x − ωt)) solves the free KG equation
 * (□ + m²)φ = 0 — i.e. iff ω² = c²k² + (mc²/ℏ)² (Peskin & Schroeder 1995
 * §2.1, ω_k² = |k|² + m² in natural units, SI factors restored).
 *
 * The denominator ω² + c²k² + ω_C² is strictly positive on the validated
 * domain (ω > 0), so r is well-defined, dimensionless, and bounded in
 * (−1, 1): r → +1 for ω far above the mass shell, r → −1 far below.
 *
 * @param input - ω (rad/s, > 0), |k| (m⁻¹, ≥ 0), m (kg, ≥ 0).
 * @returns Dimensionless residual r ∈ (−1, 1); 0 on the mass shell.
 *
 * @example
 * ```typescript
 * import { evaluateKGDispersionResidual } from 'universal-physics-tensor/numerical/klein-gordon';
 * import { C_SI } from 'universal-physics-tensor';
 *
 * // Massless field: ω = ck is exactly on shell.
 * const k = 1e7; // m⁻¹
 * const r = evaluateKGDispersionResidual({
 *   omega_per_s: C_SI * k,
 *   k_per_m: k,
 *   mass_kg: 0,
 * });
 * // r === 0
 * ```
 *
 * @public
 */
export function evaluateKGDispersionResidual(
  input: KGDispersionResidualInput,
): number {
  validateFiniteInputs(
    input,
    [
      { name: 'omega_per_s', min: 0, excludeMin: true },
      { name: 'k_per_m', min: 0 },
      { name: 'mass_kg', min: 0 },
    ],
    'evaluateKGDispersionResidual',
  );
  const { omega_per_s, k_per_m, mass_kg } = input;

  const omega2 = omega_per_s * omega_per_s;
  const ck = C_SI * k_per_m;
  const ck2 = ck * ck;
  // Compton angular frequency ω_C = m c² / ℏ (rad/s).
  const omegaC = (mass_kg * C_SI * C_SI) / HBAR_SI;
  const omegaC2 = omegaC * omegaC;

  return (omega2 - ck2 - omegaC2) / (omega2 + ck2 + omegaC2);
}

/**
 * Closure check for the free Klein-Gordon plane-wave sector (the algebraic
 * analogue of `verifyKillingEquation`'s residual-plus-tolerance pattern):
 * construct the exact positive dispersion root
 *
 *   ω = √(c²k² + (m c²/ℏ)²)
 *
 * (Peskin & Schroeder 1995 §2.1) and feed it back through
 * {@link evaluateKGDispersionResidual}, verifying the residual closes to ~0.
 * Round-trip error is pure IEEE-754 rounding (one sqrt + one squaring over
 * identical intermediates), so |residual| lands at the few-ULP level.
 *
 * Degenerate-domain guard: `mass_kg` and `k_per_m` must not both be zero
 * (ω = 0 is outside the evaluator's ω > 0 domain — there is no zero-frequency
 * plane wave).
 *
 * @param input - m (kg, ≥ 0), |k| (m⁻¹, ≥ 0), optional tolerance (default 1e-12).
 * @returns `{ omega_per_s, residual, withinTolerance }`.
 *
 * @example
 * ```typescript
 * import { verifyKleinGordonPlaneWave } from 'universal-physics-tensor/numerical/klein-gordon';
 *
 * // Electron-mass scalar at k = 1e10 m⁻¹.
 * const { omega_per_s, residual, withinTolerance } = verifyKleinGordonPlaneWave({
 *   mass_kg: 9.1093837015e-31,
 *   k_per_m: 1e10,
 * });
 * // omega_per_s ≈ 7.83e20 rad/s, |residual| ≲ 1e-15, withinTolerance === true
 * ```
 *
 * @public
 */
export function verifyKleinGordonPlaneWave(
  input: KGPlaneWaveVerifyInput,
): KGPlaneWaveVerifyResult {
  validateFiniteInputs(
    input,
    [
      { name: 'mass_kg', min: 0 },
      { name: 'k_per_m', min: 0 },
    ],
    'verifyKleinGordonPlaneWave',
  );
  if (input.tolerance !== undefined) {
    validateFiniteInputs(
      input,
      [{ name: 'tolerance', min: 0, excludeMin: true }],
      'verifyKleinGordonPlaneWave',
    );
  }
  const { mass_kg, k_per_m } = input;
  if (mass_kg === 0 && k_per_m === 0) {
    throw new RangeError(
      'verifyKleinGordonPlaneWave: mass_kg and k_per_m must not both be zero (degenerate ω = 0 has no plane-wave solution)',
    );
  }
  const tolerance = input.tolerance ?? 1e-12;

  // Same intermediates as the residual evaluator (ck, ω_C) so the round-trip
  // cancels to the IEEE-754 floor rather than accumulating re-association noise.
  const ck = C_SI * k_per_m;
  const omegaC = (mass_kg * C_SI * C_SI) / HBAR_SI;
  const omega_per_s = Math.sqrt(ck * ck + omegaC * omegaC);

  const residual = evaluateKGDispersionResidual({
    omega_per_s,
    k_per_m,
    mass_kg,
  });

  return {
    omega_per_s,
    residual,
    withinTolerance: Math.abs(residual) <= tolerance,
  };
}
