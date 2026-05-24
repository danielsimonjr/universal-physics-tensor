/**
 * Bridge Equation 38 — Modified Newtonian Dynamics (MOND), canonical
 * Milgrom (1983) interpolation form.
 *
 *   F = F_N · ν(z)        where  z = F_N / (m · a_0)
 *   ν(z) = √[(1 + √(1 + 4/z²)) / 2]
 *
 * Equivalent to the implicit Milgrom relation:
 *   μ(a/a_0) · a = a_N    where  μ(x) = x / √(1 + x²)
 *
 * Limits:
 *   - Newtonian (F_N >> m·a_0, z → ∞):    F → F_N
 *   - Deep-MOND (F_N << m·a_0, z → 0):    F → √(m · F_N · a_0)
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The interpolation function `μ(x) = x/√(1+x²)` and the explicit
 *     ν-form for F/F_N are canonical Milgrom 1983 / Famaey-McGaugh 2012
 *     content; the *bridge framing* (using MOND as a UPT
 *     dark-sector/baryonic-gravity bridge) is the speculative element.
 *   - The AST has no inverse-function primitive for μ⁻¹, so we encode
 *     the explicit force form `F = F_N · ν(z)` with `ν(z)` as an
 *     opaque dimensionless symbol stub. The argument
 *     `z = F_N/(m·a_0)` is exposed as a separate ExprNode
 *     `BE38_MOND_NU_ARG` so its dimensionlessness can be verified
 *     directly (same dimensionless-stub pattern as BE-26 / BE-41).
 *   - The numerical evaluator computes ν(z) explicitly using the
 *     closed form `ν(z) = √[(1+√(1+4/z²))/2]`, so the bracket-checks
 *     are exact (within machine precision).
 *   - GW170817 strongly constrains generic relativistic-MOND completions
 *     (TeVeS gravitational-wave speed deviates from c); see BE-36 for
 *     the relativistic completion bridge and its known issue.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 38: Entropic Gravity Correction Term")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 38)
 * @module bridges/equations/be-38-mond
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  ACCELERATION,
  FORCE,
  MASS,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * Lemma AST: the dimensionless ν-argument
 *   z = F_N / (m · a_0)
 *
 * Exposed for the lemma test that verifies the argument is
 * dimensionless (per the dimensionless-stub convention; see
 * `src/dimensional/README.md` "Encoding transcendental functions").
 */
export const BE38_MOND_NU_ARG: ExprNode = {
  kind: 'op', op: '/',
  args: [
    sym('F_N', FORCE),
    {
      kind: 'op', op: '*',
      args: [
        sym('m', MASS),
        sym('a_0', ACCELERATION),
      ],
    },
  ],
};

/**
 * RHS of the Milgrom MOND force law:
 *   F = F_N · ν(z)
 *
 * Encoded as `F_N · ν_stub` where ν_stub is a dimensionless symbol;
 * the argument z is exposed separately as `BE38_MOND_NU_ARG`.
 */
export const BE38_MOND_FORCE_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('F_N', FORCE),
    sym('nu(z)', DIMENSIONLESS),
  ],
};

/** LHS: F has dimension [force]. */
/** @internal */
export const BE38_MOND_FORCE_LHS: ExprNode = sym('F', FORCE);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateMONDForce` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface MONDForceInputs {
  /** Newtonian force F_N (N). Must be > 0 and finite. */
  F_N_newton: number;
  /** Test-particle mass m (kg). Must be > 0 and finite. */
  m_kg: number;
  /** MOND scale a_0 (m/s²). Canonical value ≈ 1.2e-10. Must be > 0 and finite. */
  a_0_m_per_s2: number;
}

/**
 * Compute the MOND-modified force using the canonical Milgrom (1983)
 * interpolation `μ(x) = x/√(1+x²)`:
 *
 *   F = F_N · ν(z),  z = F_N / (m · a_0)
 *   ν(z) = √[(1 + √(1 + 4/z²)) / 2]
 *
 * Limits (verifiable by inspection):
 *   - z → ∞: ν → 1, so F → F_N (Newtonian)
 *   - z → 0: ν → √(2/z) → ∞, but F = F_N·ν → √(F_N · m · a_0) (deep-MOND)
 *
 * @returns Force in newtons.
 */
export function evaluateMONDForce(input: MONDForceInputs): number {
  const { F_N_newton, m_kg, a_0_m_per_s2 } = input;
  if (!Number.isFinite(F_N_newton) || F_N_newton <= 0) {
    throw new RangeError(
      `evaluateMONDForce: F_N_newton must be a finite positive number, got ${F_N_newton}`,
    );
  }
  if (!Number.isFinite(m_kg) || m_kg <= 0) {
    throw new RangeError(
      `evaluateMONDForce: m_kg must be a finite positive number, got ${m_kg}`,
    );
  }
  if (!Number.isFinite(a_0_m_per_s2) || a_0_m_per_s2 <= 0) {
    throw new RangeError(
      `evaluateMONDForce: a_0_m_per_s2 must be a finite positive number, got ${a_0_m_per_s2}`,
    );
  }
  const z = F_N_newton / (m_kg * a_0_m_per_s2);
  const nu = Math.sqrt((1 + Math.sqrt(1 + 4 / (z * z))) / 2);
  return F_N_newton * nu;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [force].
 */
/** @internal */
export function validateBE38Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE38_MOND_FORCE_LHS, BE38_MOND_FORCE_RHS);
  const lhs = validate(BE38_MOND_FORCE_LHS);
  const rhs = validate(BE38_MOND_FORCE_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
