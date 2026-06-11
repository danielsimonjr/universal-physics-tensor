/**
 * Bridge Equation 32 — Quantum Reference Frame (QRF) overlap probability.
 *
 * Original (operator-valued) form:
 *
 *   |ψ⟩_B = ∫ dg U(g) |ψ⟩_A ⊗ |g⟩_frame
 *
 * which is operator-valued and, for non-compact symmetry groups, lacks
 * a normalisable Haar measure (current `tractability_class:
 * 'formally-divergent'`).
 *
 * Encoded scalar reduction (this module): the frame-invariant
 * Born-rule overlap probability between two states related by a
 * (single, implicit) frame transformation U(g):
 *
 *   P_overlap = |⟨ψ_A | U(g) | ψ_B⟩|² = c² + s²
 *
 * where
 *   c = Re ⟨ψ_A | U(g) | ψ_B⟩,
 *   s = Im ⟨ψ_A | U(g) | ψ_B⟩.
 *
 * P_overlap is dimensionless and lies in [0, 1] for normalised states
 * (Born rule). This pins the canonical operationally-meaningful scalar
 * without committing to a specific symmetry group or measure.
 *
 * References:
 *   - Giacomini, Castro-Ruiz & Brukner 2019, Nat. Commun. 10:494
 *     (arXiv:1712.07207): "Quantum mechanics and the covariance of
 *     physical laws in quantum reference frames".
 *   - Vanrietvelde, Hoehn, Giacomini & Castro-Ruiz 2020, Quantum 4:225
 *     (arXiv:1809.00556): "A change of perspective: switching quantum
 *     reference frames via a perspective-neutral framework".
 *   - Bartlett, Rudolph & Spekkens 2007, Rev. Mod. Phys. 79:555
 *     (arXiv:quant-ph/0610030): "Reference frames, superselection
 *     rules, and quantum information".
 *
 * Status: speculative. The Born-rule probability `|⟨ψ_A|U(g)|ψ_B⟩|²`
 * is itself a textbook scalar — what remains speculative is the
 * QRF-bridge framing of BE-32 in this catalog (which gravitational /
 * relational structure the U(g) corresponds to). The encoding pins
 * the math; the QRF-bridge interpretation is the speculative content.
 *
 * Honest-claude scope notes:
 *   - We encode the Born-rule probability for a single (implicit)
 *     group element g. The original group-average `∫ dg ...` is
 *     deferred — it would require committing to a specific symmetry
 *     group and a Haar regulator (or an alternative regulator on a
 *     non-compact group), neither of which is in BE-32 scope.
 *   - The operator-valued U(g) is collapsed to its symbolic real and
 *     imaginary matrix-element components c and s. The AST therefore
 *     does not see the group structure; it only sees two dimensionless
 *     real numbers feeding `c² + s²`.
 *   - Born-rule guard: the numerical evaluator rejects `c² + s² > 1`
 *     (within a small floating-point tolerance) because that would
 *     mean the inputs do not correspond to overlap components of a
 *     normalised state — a signal that the caller has provided
 *     non-physical inputs rather than a genuine derived overlap.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 32: Quantum Reference Frame")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 32)
 * @module bridges/equations/be-32-quantum-reference-frame
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { DIMENSIONLESS } from '../../dimensional/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

// --- Symbolic AST ---

/**
 * Lemma AST: c² where c = Re ⟨ψ_A | U(g) | ψ_B⟩. Both factors are
 * the same dimensionless symbol, so the product is dimensionless.
 */
export const BE32_REAL_PART_SQUARED: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('c', DIMENSIONLESS),
    sym('c', DIMENSIONLESS),
  ],
};

/**
 * Lemma AST: s² where s = Im ⟨ψ_A | U(g) | ψ_B⟩. Dimensionless by
 * construction (matrix elements of a unitary between normalised
 * vectors).
 */
export const BE32_IMAG_PART_SQUARED: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('s', DIMENSIONLESS),
    sym('s', DIMENSIONLESS),
  ],
};

/**
 * RHS of `P_overlap = c² + s²` as a typed ExprNode tree. Both
 * summands are dimensionless, so the sum is dimensionless.
 */
export const BE32_QRF_OVERLAP_RHS: ExprNode = {
  kind: 'op', op: '+',
  args: [
    BE32_REAL_PART_SQUARED,
    BE32_IMAG_PART_SQUARED,
  ],
};

/** LHS: P_overlap is the Born-rule probability — dimensionless ∈ [0,1]. */
const BE32_QRF_OVERLAP_LHS: ExprNode = sym('P_overlap', DIMENSIONLESS);

// --- Numerical evaluator ---

/**
 * Floating-point tolerance for the Born-rule guard. A computed
 * `c² + s²` may slightly exceed 1 due to IEEE-754 rounding even when
 * the inputs are physically a unit vector; we accept up to one ULP-
 * scale slack before rejecting.
 */
const BORN_RULE_EPS = 1e-12;

/**
 * @internal — typed-arg shape for the file-local `evaluateQRFOverlap` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface QRFOverlapInputs {
  /**
   * Real part of ⟨ψ_A | U(g) | ψ_B⟩. Unitless; physically ∈ [-1, 1]
   * for normalised states. Must be finite.
   */
  real_part: number;
  /**
   * Imaginary part of ⟨ψ_A | U(g) | ψ_B⟩. Unitless; physically
   * ∈ [-1, 1] for normalised states. Must be finite.
   */
  imag_part: number;
}

/**
 * Evaluate P_overlap = |⟨ψ_A | U(g) | ψ_B⟩|² = c² + s².
 *
 * Honest-claude:
 *   - Returns the scalar Born-rule probability for a single (implicit)
 *     group element g. There is no group average / `∫ dg` — see the
 *     module-header scope notes.
 *   - Throws RangeError on non-finite inputs and on results that
 *     exceed 1 by more than `BORN_RULE_EPS` (a Born-rule violation
 *     guard catching obviously non-physical caller inputs).
 *
 * @returns P_overlap ∈ [0, 1] (dimensionless probability).
 */
export function evaluateQRFOverlap(input: QRFOverlapInputs): number {
  validateFiniteInputs(
    input,
    [{ name: 'real_part' }, { name: 'imag_part' }],
    'evaluateQRFOverlap',
  );
  const { real_part, imag_part } = input;
  const p = real_part * real_part + imag_part * imag_part;
  // Non-standard post-computation Born-rule check — kept inline because
  // it depends on the computed `p`, not on a single input field, and
  // emits bespoke "Born-rule violation" prose for caller diagnosis.
  if (p > 1.0 + BORN_RULE_EPS) {
    throw new RangeError(
      `evaluateQRFOverlap: Born-rule violation — c² + s² = ${p} > 1 ` +
      `(real_part=${real_part}, imag_part=${imag_part}). Inputs do not ` +
      `correspond to overlap components of a normalised state.`,
    );
  }
  return p;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be DIMENSIONLESS.
 */
function validateBE32Dimensions(): DimensionValidationReport {
  return validateBEDimensions(BE32_QRF_OVERLAP_LHS, BE32_QRF_OVERLAP_RHS, 'BE32');
}

