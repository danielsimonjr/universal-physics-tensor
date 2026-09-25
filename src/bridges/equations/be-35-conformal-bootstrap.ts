/**
 * Bridge Equation 35 — Conformal Bootstrap (the crossing equation).
 *
 * Original 4-pt-function form (operator-valued; no scalar reduction
 * without committing to specific operator dimensions):
 *
 *   ⟨O₁(x₁) O₂(x₂) O₃(x₃) O₄(x₄)⟩
 *     = Σ_{Δ, ℓ}  C₁₂^O · C₃₄^O · g_{Δ, ℓ}(u, v)
 *
 * Encoded relation: the crossing equation for four IDENTICAL scalars φ of
 * dimension Δ_φ (Rattazzi, Rychkov, Tonni & Vichi 2008, eq. 4.3, which writes
 * Δ_φ as d):
 *
 *   R_cross = v^Δφ · g(u, v) − u^Δφ · g(v, u)     (= 0 in a consistent CFT)
 *
 * where g is the FULL reduced four-point function,
 * g(u, v) = 1 + Σ_O λ_O² g_O(u, v): the identity plus the sum over the
 * exchanged operators (Rattazzi et al. 2008, eq. 4.4). Crossing holds for that sum, not for a single block,
 * and it holds only with the prefactors. `R_cross` and every symbol are
 * dimensionless: u and v are cross-ratios and g is a ratio of correlators.
 *
 * Test instrument: the generalized free field, g = 1 + u^Δ + (u/v)^Δ,
 * satisfies the equation exactly at every (u, v), and dropping one term breaks
 * it (tests/bridges/be-35-encoding.test.ts). At u = v the equation is zero
 * for ANY g, so the crossing-symmetric point u = v = 1/4 tests nothing.
 *
 * The earlier encoding, `R = C² · [g_block(u, v) − g_block(v, u)]`, had no
 * prefactors and was written for one block; neither is crossing symmetric
 * (census finding F1). It was deprecated in 0.46.0 and removed in 0.47.0, with its
 * evaluator `evaluateCrossingResidual` and `BridgeEquations.crossingResidual`.
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
 * Scope notes:
 *   - g(u, v) and g(v, u) are dimensionless symbol stubs (`g_uv`, `g_vu`),
 *     not analytic forms: the conformal blocks inside g have closed forms only
 *     in 2D and 4D (Dolan-Osborn), and the AST grammar has no
 *     hypergeometric-function node.
 *   - The equation is a CONSTRAINT on the spectrum and the OPE coefficients.
 *     The bootstrap programme's numerical content (positivity bounds on an
 *     infinite tower) is not encoded here.
 *   - Only the identical-scalar case is encoded. Mixed correlators carry
 *     different prefactors.
 *   - Only the x1 ↔ x3 equation (eq. 4.3) is encoded. The x1 ↔ x2 constraint,
 *     g(u, v) = g(u/v, 1/v) (eq. 4.2), is "automatically satisfied for
 *     arbitrary coefficients λ²_O" because every operator in φ × φ has even
 *     spin (Rattazzi et al. 2008, §4). The generalized free field satisfies both.
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

// --- Symbolic AST: the crossing equation ---

/**
 * RHS of the crossing equation for four identical scalars of dimension Δ_φ:
 *
 *   R_cross = v^Δφ · g(u, v) − u^Δφ · g(v, u)
 *
 * The exponent Δ_φ is a symbol, which the grammar allows only on a
 * dimensionless base; u and v are dimensionless cross-ratios.
 */
export const BE35_CROSSING_EQUATION_RHS: ExprNode = {
  kind: 'op', op: '-',
  args: [
    {
      kind: 'op', op: '*',
      args: [
        { kind: 'op', op: '^', args: [sym('v', DIMENSIONLESS), sym('Delta_phi', DIMENSIONLESS)] },
        sym('g_uv', DIMENSIONLESS),
      ],
    },
    {
      kind: 'op', op: '*',
      args: [
        { kind: 'op', op: '^', args: [sym('u', DIMENSIONLESS), sym('Delta_phi', DIMENSIONLESS)] },
        sym('g_vu', DIMENSIONLESS),
      ],
    },
  ],
};

/** LHS: R_cross is dimensionless. */
const BE35_CROSSING_LHS: ExprNode = sym('R_cross', DIMENSIONLESS);

// --- Numerical evaluators ---

/**
 * Inputs of {@link evaluateCrossingEquation}: the cross-ratios, Δφ and the full four-point function at both points.
 *
 * @internal — file-local typed-arg shape, not in the public surface (the v0.7 BE module exports audit, `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4).
 */
interface CrossingEquationInputs {
  /** Cross-ratio u > 0. */
  u: number;
  /** Cross-ratio v > 0. */
  v: number;
  /** The dimension Δ_φ of the four identical scalars. Must be finite. */
  delta_phi: number;
  /** The full reduced four-point function g at (u, v). Must be finite. */
  g_uv: number;
  /** The full reduced four-point function g at the crossed point (v, u). Must be finite. */
  g_vu: number;
}

/**
 * Evaluate the crossing equation `R_cross = v^Δφ · g(u, v) − u^Δφ · g(v, u)`.
 *
 * Zero for a consistent CFT when `g` is the FULL reduced four-point function
 * (identity plus all exchanged operators). Nonzero output means the pair
 * `(g_uv, g_vu)` does not come from a crossing-symmetric four-point function,
 * for example because a term of the sum is missing.
 *
 * @throws RangeError if u or v is not positive, or any input is not finite.
 */
export function evaluateCrossingEquation(input: CrossingEquationInputs): number {
  validateFiniteInputs(
    input,
    [
      { name: 'u', min: 0, excludeMin: true },
      { name: 'v', min: 0, excludeMin: true },
      { name: 'delta_phi' },
      { name: 'g_uv' },
      { name: 'g_vu' },
    ],
    'evaluateCrossingEquation',
  );
  const { u, v, delta_phi, g_uv, g_vu } = input;
  return v ** delta_phi * g_uv - u ** delta_phi * g_vu;
}

// --- Self-validation ---

/**
 * Run the crossing-equation AST through the dimensional analyzer; LHS and RHS
 * should both be DIMENSIONLESS.
 */
function validateBE35Dimensions(): DimensionValidationReport {
  return validateBEDimensions(
    BE35_CROSSING_LHS,
    BE35_CROSSING_EQUATION_RHS,
    'BE35',
  );
}
