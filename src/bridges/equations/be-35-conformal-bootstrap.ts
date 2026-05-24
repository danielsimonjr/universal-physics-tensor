/**
 * Bridge Equation 35 — Conformal Bootstrap (crossing-symmetry residual).
 *
 * Original 4-pt-function form (operator-valued; no scalar reduction
 * without committing to specific operator dimensions):
 *
 *   ⟨O₁(x₁) O₂(x₂) O₃(x₃) O₄(x₄)⟩
 *     = Σ_{Δ, ℓ}  C₁₂^O · C₃₄^O · g_{Δ, ℓ}(u, v)
 *
 * Encoded reduction (Wave Z — OpenAI scalar-reduction proposal): for a
 * unitarily-truncated single-block contribution `B(u, v) = C² · g_{Δ,ℓ}(u, v)`,
 * crossing symmetry of the 4-pt function requires `B(u, v) = B(v, u)`. The
 * residual
 *
 *   R_cross = C² · [ g_block(u, v) − g_block(v, u) ]
 *
 * is identically zero for any consistent CFT. At the crossing-symmetric
 * point u = v = 1/4 the residual collapses to the operational identity
 * `R_cross|_{u=v=1/4} ≡ 0`.
 *
 * R_cross is DIMENSIONLESS: C is dimensionless when the operators are
 * unit-normalized in their two-point functions, and g_block(u, v) is a
 * dimensionless special function of dimensionless cross-ratios.
 *
 * References:
 *   - Rattazzi-Rychkov-Tonni-Vichi 2008 JHEP 0812:031
 *     (arXiv:0807.0004): "Bounding scalar operator dimensions in 4D CFT".
 *   - Poland-Rychkov-Vichi 2019 Rev. Mod. Phys. 91:015002
 *     (arXiv:1805.04405): "The conformal bootstrap: theory, numerical
 *     techniques, and applications".
 *   - Dolan-Osborn 2001 Nucl. Phys. B 599:459: "Conformal four-point
 *     functions and the operator product expansion".
 *   - Kos-Poland-Simmons-Duffin 2014 JHEP 1406:091: "Bootstrapping the
 *     O(N) vector models".
 *
 * Status: established. The crossing-symmetry equation is canonical CFT
 * bootstrap content; pinning it as 'established' in the catalog reflects
 * that the *symmetry identity* has decades of literature support.
 *
 * Honest-claude scope notes:
 *   - Single-block reduction. The real bootstrap programme sums an
 *     infinite (Δ, ℓ) tower with positivity / unitarity constraints —
 *     that spectrum-fitting is the load-bearing numerical content of
 *     bootstrap papers and is NOT captured here. Encoding only the
 *     crossing residual pins the symmetry but not the spectrum work.
 *   - OPE coefficients C are scheme-dependent normalizations. We
 *     assume operators are unit-normalized in their two-point function,
 *     which makes C dimensionless. Other normalization conventions
 *     (e.g., absorbing a Δ-dependent factor into C) shift the literal
 *     numerical value of C without altering R_cross = 0.
 *   - Conformal-block special functions g_{Δ,ℓ}(u, v) are encoded as
 *     dimensionless symbol stubs (`g_block_uv`, `g_block_vu`) — NOT as
 *     their analytic-function expressions. Closed forms exist in 2D and
 *     4D (Dolan-Osborn) but live outside the AST grammar (which has no
 *     hypergeometric-function node).
 *   - The identity is symbolic. Numerically evaluating with arbitrary
 *     g_uv ≠ g_vu yields a nonzero residual: that does NOT signal a
 *     bootstrap violation — it signals that the caller passed a pair
 *     that is not a legitimate (u, v) ↔ (v, u) crossing pair from the
 *     same conformal block. The residual is a *test instrument*.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 35: Conformal Bootstrap")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 35)
 * @module bridges/equations/be-35-conformal-bootstrap
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

// --- Symbolic AST ---

/**
 * Lemma AST: forward-channel block `C² · g_block(u, v)`.
 *
 * Both factors are dimensionless: C is the OPE coefficient under
 * unit-normalized operators; g_block(u, v) is the conformal block
 * (dimensionless function of dimensionless cross-ratios u, v).
 */
export const BE35_FORWARD_BLOCK: ExprNode = {
  kind: 'op', op: '*',
  args: [
    {
      kind: 'op', op: '^',
      args: [
        sym('C', DIMENSIONLESS),
        // Numeric-literal exponent: the validator parses the symbol's
        // `name` via Number(), so the literal text must be a finite
        // number ('2'), not a word ('two').
        sym('2', DIMENSIONLESS),
      ],
    },
    sym('g_block_uv', DIMENSIONLESS),
  ],
};

/**
 * Lemma AST: crossed-channel block `C² · g_block(v, u)`. Same shape as
 * BE35_FORWARD_BLOCK with cross-ratios swapped — exposed for direct
 * dimensional verification and for differencing in the residual.
 */
export const BE35_CROSSED_BLOCK: ExprNode = {
  kind: 'op', op: '*',
  args: [
    {
      kind: 'op', op: '^',
      args: [
        sym('C', DIMENSIONLESS),
        sym('2', DIMENSIONLESS),
      ],
    },
    sym('g_block_vu', DIMENSIONLESS),
  ],
};

/**
 * RHS of the crossing-symmetry residual:
 *
 *   R_cross = C² · g_block(u, v) − C² · g_block(v, u)
 *
 * encoded as the difference of the two lemma blocks. Both summands are
 * dimensionless, so the result infers DIMENSIONLESS through the
 * dimensional analyzer.
 */
export const BE35_CROSSING_RESIDUAL_RHS: ExprNode = {
  kind: 'op', op: '-',
  args: [
    BE35_FORWARD_BLOCK,
    BE35_CROSSED_BLOCK,
  ],
};

/** LHS: R_cross is dimensionless. */
const BE35_CROSSING_RESIDUAL_LHS: ExprNode = sym('R_cross', DIMENSIONLESS);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateCrossingResidual` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface CrossingResidualInputs {
  /** OPE coefficient C (dimensionless under unit-normalized operators). Must be finite. */
  ope_coefficient: number;
  /** Conformal block g_block(u, v) at (u, v). Must be finite. */
  g_block_uv: number;
  /** Conformal block g_block(v, u) at the crossed point. Must be finite. */
  g_block_vu: number;
}

/**
 * Evaluate the crossing-symmetry residual
 *
 *   R_cross = C² · ( g_block(u, v) − g_block(v, u) )
 *
 * Honest-claude: for a *legitimate* crossing pair from a single block,
 * g_uv = g_vu and the residual is exactly zero. Nonzero output for
 * arbitrary inputs does not signal a CFT violation; it signals that the
 * pair (g_uv, g_vu) is not from the same block under a u ↔ v swap.
 */
export function evaluateCrossingResidual(input: CrossingResidualInputs): number {
  validateFiniteInputs(
    input,
    [
      { name: 'ope_coefficient' },
      { name: 'g_block_uv' },
      { name: 'g_block_vu' },
    ],
    'evaluateCrossingResidual',
  );
  const { ope_coefficient, g_block_uv, g_block_vu } = input;
  return ope_coefficient * ope_coefficient * (g_block_uv - g_block_vu);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be DIMENSIONLESS.
 */
function validateBE35Dimensions(): DimensionValidationReport {
  return validateBEDimensions(
    BE35_CROSSING_RESIDUAL_LHS,
    BE35_CROSSING_RESIDUAL_RHS,
    'BE35',
  );
}
