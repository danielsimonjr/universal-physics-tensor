/**
 * Bridge Equation 48 — GRW mass-amplified localization rate
 * (Continuous Spontaneous Localization mass-dependence, post Wave Y
 * reformulation).
 *
 *   λ_GRW(m) = λ_0 · (m / m_0)
 *
 * The mass-amplification mechanism in objective-collapse models: a
 * particle of mass m localizes at rate proportional to m/m_0, where
 * m_0 is the nucleon mass and λ_0 ≈ 10⁻¹⁶ /s is the canonical GRW
 * single-nucleon rate.
 *
 * References:
 *   - Ghirardi, Rimini & Weber 1986 *Phys. Rev. D* 34:470 (canonical
 *     GRW objective-collapse master equation; original 1986 form).
 *   - Pearle 1989 *Phys. Rev. A* 39:2277 (Continuous Spontaneous
 *     Localization extension; introduces mass-density-coupled noise).
 *   - Ghirardi, Pearle & Rimini 1990 *Phys. Rev. A* 42:78 (CSL with
 *     mass-amplification mechanism: rate λ ∝ m/m_0 for composite
 *     systems with N nucleons).
 *   - Bassi & Ghirardi 2003 *Phys. Rep.* 379:257 (review).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The full GRW master equation (encoded in formula_latex of BE-48
 *     entry, not here) is the operator-valued Lindblad form
 *     dρ/dt = -(i/ℏ)[H,ρ] + λ ∫d³x [L_x ρ L_x† - (1/2){L_x† L_x, ρ}].
 *     The Wave Y reformulation encodes only the scalar localization
 *     RATE λ_GRW(m), parallel to BE-11 encoding only the Caldeira-
 *     Leggett rate γ_k(λ) and not the full Lindblad master equation.
 *   - λ_0 = 10⁻¹⁶ /s is the canonical single-nucleon rate (per the
 *     1986 GRW Phys. Rev. D 34:470). Earlier proposals (10⁻¹⁷ /s)
 *     are superseded by experimental constraints (Adler 2007 *J.
 *     Phys. A* 40:2935).
 *   - Bracket: λ_GRW(electron) = (m_e/m_p) × 10⁻¹⁶ ≈ 5×10⁻²⁰ /s
 *     (negligible for individual electrons); λ_GRW(macroscopic 1 g)
 *     = (10⁻³ kg / 1.67×10⁻²⁷ kg) × 10⁻¹⁶ ≈ 6×10⁷ /s (rapid collapse,
 *     no macroscopic Schrödinger-cat states).
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 48")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 48)
 * @module bridges/equations/be-48-grw-localization
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  FREQUENCY,
  MASS,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the mass-amplified GRW localization rate:
 *   λ_GRW(m) = λ_0 · (m / m_0)
 *
 * λ_0 has dim [frequency] = [T⁻¹]; (m / m_0) is dimensionless. Product
 * is [frequency].
 */
export const BE48_GRW_LOCALIZATION_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('lambda_0', FREQUENCY),
    {
      kind: 'op', op: '/',
      args: [
        sym('m', MASS),
        sym('m_0', MASS),
      ],
    },
  ],
};

/** LHS: λ_GRW(m) has dimension [frequency] = [T⁻¹]. */
export const BE48_GRW_LOCALIZATION_LHS: ExprNode = sym('lambda_GRW', FREQUENCY);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateGRWLocalization` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface GRWLocalizationInputs {
  /** Object mass m (kg). Must be > 0 and finite. */
  m_kg: number;
  /**
   * Reference mass m_0 (kg). Default: nucleon mass m_p ≈ 1.67×10⁻²⁷ kg
   * (standard GRW choice).
   */
  m_0_kg?: number;
  /**
   * Single-nucleon localization rate λ_0 (1/s). Default: 1×10⁻¹⁶ /s
   * (canonical GRW 1986 value, per Ghirardi-Rimini-Weber Phys. Rev. D
   * 34:470).
   */
  lambda_0_per_s?: number;
}

const DEFAULT_M_0_KG = 1.67e-27; // proton/nucleon mass
const DEFAULT_LAMBDA_0 = 1e-16; // canonical GRW 1986 rate (per second)

/**
 * Evaluate the GRW mass-amplified localization rate
 *
 *   λ_GRW(m) = λ_0 · (m / m_0)
 *
 * @returns Localization rate in 1/s.
 */
export function evaluateGRWLocalization(input: GRWLocalizationInputs): number {
  const {
    m_kg,
    m_0_kg = DEFAULT_M_0_KG,
    lambda_0_per_s = DEFAULT_LAMBDA_0,
  } = input;
  if (!Number.isFinite(m_kg) || m_kg <= 0) {
    throw new RangeError(
      `evaluateGRWLocalization: m_kg must be a finite positive number, got ${m_kg}`,
    );
  }
  if (!Number.isFinite(m_0_kg) || m_0_kg <= 0) {
    throw new RangeError(
      `evaluateGRWLocalization: m_0_kg must be a finite positive number, got ${m_0_kg}`,
    );
  }
  if (!Number.isFinite(lambda_0_per_s) || lambda_0_per_s < 0) {
    throw new RangeError(
      `evaluateGRWLocalization: lambda_0_per_s must be a finite non-negative number, got ${lambda_0_per_s}`,
    );
  }
  return lambda_0_per_s * (m_kg / m_0_kg);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [frequency].
 */
export function validateBE48Dimensions(): DimensionValidationReport {
  const eq = validateEquation(
    BE48_GRW_LOCALIZATION_LHS,
    BE48_GRW_LOCALIZATION_RHS,
  );
  const lhs = validate(BE48_GRW_LOCALIZATION_LHS);
  const rhs = validate(BE48_GRW_LOCALIZATION_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
