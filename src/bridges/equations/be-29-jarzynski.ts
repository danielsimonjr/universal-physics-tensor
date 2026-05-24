/**
 * Bridge Equation 29 — Jarzynski free-energy difference (canonical
 * 1997 equality, post Wave Y reformulation).
 *
 *   ΔF = −k_B T ln⟨exp(−W / (k_B T))⟩
 *
 * Reference: Jarzynski 1997 *Phys. Rev. Lett.* 78:2690 (canonical
 * non-equilibrium free-energy equality; exact identity for any work
 * protocol connecting two equilibrium states at temperature T).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The Jarzynski equality itself is canonical; the *bridge framing*
 *     — applying it to gravitational work in curved spacetime, the
 *     original BE-29 framing — is the speculative element. The
 *     gravitational-correction term `(β/(2c⁴)) ∫T^μν δg_μν √(-g) d⁴x`
 *     is dropped here as the AST-unencodable extension.
 *   - The AST has no `exp` primitive nor `ln` primitive; the average
 *     `⟨exp(-βW)⟩` is encoded as a single dimensionless symbol stub
 *     `'avg_exp_minus_betaW'`, with the exp argument β·W = W/(k_B T)
 *     exposed as a separate ExprNode `BE29_BETAW_ARG` (verifiable
 *     dimensionless via the dimensional analyzer).
 *   - Both sides have dim [energy]: ΔF [J]; k_B T [J]; ⟨exp(-βW)⟩
 *     dimensionless; ln(dimensionless) dimensionless; product [J]. ✓
 *
 * Numerical bracket: at quasi-static (reversible) work, W = W_rev and
 * ⟨exp(-βW)⟩ = exp(-βW_rev), so ΔF = -k_BT · (-βW_rev) = W_rev. The
 * Jarzynski equality reduces to the equilibrium identity in this limit.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 29")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 29)
 * @module bridges/equations/be-29-jarzynski
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
  ENERGY,
  TEMPERATURE,
} from '../../dimensional/types.js';
import { k_B as DIM_kB } from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

/**
 * Lemma AST: the exp-argument β·W = W/(k_B T), exposed for verification
 * that the exponent is dimensionless.
 *
 * [W]/[k_B T] = [J]/[J] = [1] ✓
 */
export const BE29_BETAW_ARG: ExprNode = {
  kind: 'op', op: '/',
  args: [
    sym('W', ENERGY),
    {
      kind: 'op', op: '*',
      args: [
        sym('k_B', DIM_kB),
        sym('T', TEMPERATURE),
      ],
    },
  ],
};

/**
 * RHS of the Jarzynski equality: `−k_B T · ln⟨exp(-βW)⟩`.
 *
 * The AST has no `ln` primitive; we encode the relation as
 *   `ΔF = -k_B T · L`
 * where `L` is a dimensionless symbol stub representing
 * `ln⟨exp(-W/(k_B T))⟩`. The minus sign is captured by encoding the
 * coefficient as `-1` (a dimensionless symbol stub named `-1`).
 *
 * Both terms multiplicatively combine to dim [energy] = [k_B T].
 */
export const BE29_JARZYNSKI_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('-1', DIMENSIONLESS),
    sym('k_B', DIM_kB),
    sym('T', TEMPERATURE),
    sym('ln_avg_exp_minus_betaW', DIMENSIONLESS),
  ],
};

/** LHS: ΔF has dimension [energy]. */
/** @internal */
export const BE29_JARZYNSKI_LHS: ExprNode = sym('Delta_F', ENERGY);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateJarzynski` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface JarzynskiInputs {
  /**
   * Sample of work values W_i (joules) from N independent realizations
   * of the non-equilibrium protocol (forward direction).
   */
  W_samples_J: ReadonlyArray<number>;
  /** Temperature T (K). Must be > 0 and finite. */
  T_K: number;
}

/**
 * Evaluate the Jarzynski free-energy difference from a sample of work
 * values:
 *
 *   ΔF = −k_B T ln⟨exp(−W / (k_B T))⟩
 *
 * The ensemble average is approximated by the sample mean over the
 * `W_samples_J` array. For a reliable estimate the sample size must be
 * large enough to capture the rare-event tail; the Jarzynski estimator
 * has well-known finite-sample bias for low-temperature / high-work-
 * variance protocols (Park-Schulten 2003 *J. Chem. Phys.* 119:5946).
 *
 * @returns Free-energy difference ΔF in joules.
 */
export function evaluateJarzynski(input: JarzynskiInputs): number {
  // Helper handles the T_K finite-positive guard. The array-shape +
  // per-element checks for W_samples_J stay inline (non-standard:
  // array primitive + per-element loop, not a scalar field).
  validateFiniteInputs(
    input,
    [{ name: 'T_K', min: 0, excludeMin: true }],
    'evaluateJarzynski',
  );
  const { W_samples_J, T_K } = input;
  if (!Array.isArray(W_samples_J) || W_samples_J.length === 0) {
    throw new RangeError(
      'evaluateJarzynski: W_samples_J must be a non-empty array',
    );
  }
  for (const W of W_samples_J) {
    if (!Number.isFinite(W)) {
      throw new RangeError(
        `evaluateJarzynski: every W in W_samples_J must be finite, got ${W}`,
      );
    }
  }
  const { kB } = PhysicalConstants;
  const beta = 1 / (kB * T_K);
  let sum = 0;
  for (const W of W_samples_J) {
    sum += Math.exp(-beta * W);
  }
  const avg = sum / W_samples_J.length;
  return -kB * T_K * Math.log(avg);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [energy].
 */
/** @internal */
export function validateBE29Dimensions(): DimensionValidationReport {
  return validateBEDimensions(BE29_JARZYNSKI_LHS, BE29_JARZYNSKI_RHS, 'BE29');
}
