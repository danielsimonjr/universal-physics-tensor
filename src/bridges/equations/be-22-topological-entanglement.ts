/**
 * Bridge Equation 22 — Topological Entanglement Entropy
 * (Kitaev-Preskill / Levin-Wen single-subsystem form).
 *
 *   S(R) = α · L(R) − γ + O(L^-1)
 *
 * S(R) is the von Neumann entanglement entropy of subsystem R
 * (dimensionless, in nats); α is a non-universal area-law coefficient
 * with dim [L^-1]; L(R) is the perimeter (boundary length) of R, dim [L];
 * γ is the topological entanglement entropy (dimensionless). For an
 * abelian topological phase, γ = log D where D = √(Σᵢ d²ᵢ) is the
 * total quantum dimension. For the Z₂ toric code, D = 2 and γ = log 2.
 *
 * References:
 *   - Kitaev-Preskill 2006 Phys. Rev. Lett. 96:110404
 *     (arXiv:hep-th/0510092): "Topological entanglement entropy".
 *   - Levin-Wen 2006 Phys. Rev. Lett. 96:110405
 *     (arXiv:cond-mat/0510613): "Detecting topological order in a
 *     ground state wave function".
 *
 * Status: speculative. The Kitaev-Preskill formula itself is
 * established in condensed-matter / topological-order literature.
 * The "QG link" framing (originally BE-22 in this catalog) is
 * original to UPT and not in either reference: applying TEE to
 * quantum gravity requires identifying which gravitational degree of
 * freedom the boundary R bounds, which has not been committed to
 * within UPT scope. The encoding pins the math; the bridge to QG is
 * the speculative content.
 *
 * Honest-claude scope notes:
 *   - The `O(L^-1)` correction is dropped per the encoding scope; we
 *     encode only the leading area + topological terms.
 *   - The AST has no dedicated way to express "S(R) is dimensionless
 *     because each term is dimensionless"; we encode the RHS as
 *     `α · L − γ`, which the validator infers as DIMENSIONLESS
 *     because (α [L^-1]) · (L [L]) = [1] and γ is [1]. The lemma
 *     terms `BE22_AREA_TERM = α · L` and `BE22_TOPOLOGICAL_TERM = γ`
 *     are exposed for direct per-term verification.
 *   - Sign convention follows Kitaev-Preskill: TEE enters with a
 *     minus sign so that γ > 0 for non-trivial topological order.
 *   - Log base: natural log (entropy in nats). Bit-convention (log₂)
 *     would scale γ by 1/ln 2; the numerical evaluator does not pick
 *     a base — the caller passes γ directly.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 22: Topological Entanglement Entropy")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 22)
 * @module bridges/equations/be-22-topological-entanglement
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  LENGTH,
} from '../../dimensional/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

// --- Symbolic AST ---

/** Inverse-length [L^-1] dimension for the area-law coefficient α. */
const INV_LENGTH: Dimension = {
  L: -1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
};

/**
 * Lemma AST: the area-law term `α · L`. Exposed for direct dimensional
 * verification — should infer to DIMENSIONLESS.
 */
export const BE22_AREA_TERM: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('alpha', INV_LENGTH),
    sym('L', LENGTH),
  ],
};

/**
 * Lemma AST: the topological term γ (already dimensionless by
 * definition; exposed for symmetry with BE22_AREA_TERM).
 */
export const BE22_TOPOLOGICAL_TERM: ExprNode = sym('gamma', DIMENSIONLESS);

/**
 * RHS of `S(R) = α · L − γ` as a typed ExprNode tree. The
 * `+ O(L^-1)` correction is dropped per the encoding scope.
 */
export const BE22_TOPOLOGICAL_ENTANGLEMENT_RHS: ExprNode = {
  kind: 'op', op: '-',
  args: [
    BE22_AREA_TERM,
    BE22_TOPOLOGICAL_TERM,
  ],
};

/** LHS: S(R) is dimensionless (entropy in nats). */
const BE22_TOPOLOGICAL_ENTANGLEMENT_LHS: ExprNode = sym('S_R', DIMENSIONLESS);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateTEE` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface TEEInputs {
  /** Non-universal area-law coefficient α in m^-1. Must be finite. */
  alpha_per_meter: number;
  /** Boundary length L(R) in metres. Must be ≥ 0. */
  perimeter_m: number;
  /** Topological entanglement entropy γ (nats). Must be finite. */
  gamma: number;
}

/**
 * Evaluate S(R) = α · L − γ in nats.
 *
 * Honest-claude: returns the leading-order Kitaev-Preskill form
 * exactly; the `O(L^-1)` finite-size correction is not modelled. For
 * the Z₂ toric code, γ = log 2 ≈ 0.693; for Fibonacci, γ ≈ 0.643.
 *
 * @returns S in nats (dimensionless).
 */
export function evaluateTEE(input: TEEInputs): number {
  validateFiniteInputs(
    input,
    [
      { name: 'alpha_per_meter' },
      { name: 'perimeter_m', min: 0 },
      { name: 'gamma' },
    ],
    'evaluateTEE',
  );
  const { alpha_per_meter, perimeter_m, gamma } = input;
  return alpha_per_meter * perimeter_m - gamma;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be DIMENSIONLESS.
 */
function validateTEEDimensions(): DimensionValidationReport {
  return validateBEDimensions(
    BE22_TOPOLOGICAL_ENTANGLEMENT_LHS,
    BE22_TOPOLOGICAL_ENTANGLEMENT_RHS,
    'BE22',
  );
}
