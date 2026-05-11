/**
 * Bridge Equation 17 — Einstein-Cartan torsion-spin coupling
 * (squared-invariant scalar reduction).
 *
 * **Original (full Einstein-Cartan field equations).**
 *
 *   R_μν − (1/2) R g_μν + Λ g_μν = (8πG/c⁴) T_μν
 *   T^λ_μν = (8πG/c⁴) S^λ_μν
 *
 * The full EC system is **operator-valued tensor equations** — the LHS of
 * the Einstein equation contains the Ricci tensor R_μν, the Ricci scalar
 * R, the metric g_μν, and the cosmological constant Λ; the algebraic
 * torsion-spin equation involves the rank-3 torsion tensor T^λ_μν
 * (antisymmetric in lower indices) and the rank-3 spin angular momentum
 * density tensor S^λ_μν. None of these tensor objects can be encoded in
 * the UPT AST grammar (`symbol | op (* / + - ^) | integral |
 * derivative`); the grammar has no rank-aware tensor primitive, no
 * Christoffel-symbol / curvature operator, and no antisymmetric-index
 * contraction. The full EC system is **NOT encodable in the scalar AST**.
 *
 * **Encoded reduction (squared-invariant scalar form).** Wave Z-C applies
 * OpenAI's scalar reduction: contract both sides of the algebraic torsion-
 * spin equation with its dual to obtain a scalar invariant. Inverting
 * `T^λ_μν = (8πG/c⁴) S^λ_μν` gives `S^λ_μν = (c⁴/(8πG)) T^λ_μν`, and
 * squaring (contracting against the conjugate index structure):
 *
 *   S²_spin = (c⁴/(8πG))² · T_λμν T^λμν
 *
 * where:
 *   - S²_spin is the squared norm of the spin angular momentum density
 *     tensor (a SCALAR; dim [M²·L⁻²·T⁻²]);
 *   - (c⁴/(8πG))² is a coupling prefactor with dim [M²·L²·T⁻⁴]
 *     (the squared inverse of the Einstein coupling 8πG/c⁴);
 *   - T_λμν T^λμν is a single contracted SCALAR — the AST does not
 *     expand the index sum — with dim [T²·L⁻⁴].
 *
 * **Dimensional bookkeeping (verified by hand):**
 *   - G ~ [L³ M⁻¹ T⁻²], c⁴ ~ [L⁴ T⁻⁴].
 *   - 8πG/c⁴ ~ [T²·M⁻¹·L⁻¹]; (c⁴/(8πG)) ~ [M·L·T⁻²] = [force].
 *   - (c⁴/(8πG))² ~ [M²·L²·T⁻⁴].
 *   - S^λ_μν has dim [angular momentum / volume] = [M·L⁻¹·T⁻¹], so
 *     S² ~ [M²·L⁻²·T⁻²].
 *   - T^λ_μν = (8πG/c⁴) S^λ_μν has dim [T²·M⁻¹·L⁻¹] · [M·L⁻¹·T⁻¹] =
 *     [T·L⁻²]; contraction T_λμν T^λμν ~ [T²·L⁻⁴].
 *   - Cross-check: (c⁴/(8πG))² · (T·T) ~ [M²·L²·T⁻⁴] · [T²·L⁻⁴] =
 *     [M²·L⁻²·T⁻²] ✓ matches S²_spin.
 *
 * **Typed-stub idiom.** Both the prefactor and the contraction are
 * encoded as fresh typed symbols whose `dim` is the dimension-of-the-
 * contraction:
 *   - `c4_over_8piG_squared`: fresh symbol typed `[M²·L²·T⁻⁴]`. Encoding
 *     `(c⁴ / G)²` symbolically and dividing by `(8π)²` would clutter the
 *     AST without adding validation value — the prefactor is a constant
 *     of nature. (Same idiom BE-26 uses for `exp(-WKB_arg)`.)
 *   - `T_torsion_squared`: fresh symbol typed `[T²·L⁻⁴]`. The AST cannot
 *     expand the index-sum contraction T_λμν T^λμν, so it gets a single
 *     typed-stub symbol with the dimension-of-the-contraction. (Same
 *     idiom BE-46 uses for `exp_factor`.)
 *
 * References:
 *   - Cartan 1922 *C. R. Acad. Sci.* 174:593 (original torsion paper).
 *   - Hehl-vonderHeyde-Kerlick-Nester 1976 *Rev. Mod. Phys.* 48:393
 *     (canonical Einstein-Cartan review).
 *   - Shapiro 2002 *Phys. Rep.* 357:113 (arXiv:hep-th/0103093, torsion
 *     in physics — comprehensive review).
 *   - Trautman 2006 in *Encyclopedia of Mathematical Physics*
 *     (arXiv:gr-qc/0606062, modern Einstein-Cartan introduction).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The **original** BE-17 formula is the **full EC system** (Einstein
 *     equation + algebraic torsion-spin equation, both operator-valued
 *     tensor equations) and **CANNOT be encoded** in the scalar AST
 *     grammar — operator-valued tensors (Ricci, Einstein, torsion 3-
 *     tensor) lie outside `symbol | op (* / + - ^) | integral |
 *     derivative`. This module encodes a **squared-invariant scalar
 *     reduction**, NOT the full field equations.
 *   - The reduction `S²_spin = (c⁴/(8πG))² · T_λμν T^λμν` is a
 *     **contracted scalar**, not a full algebraic relation. It captures
 *     **one invariant** of the EC torsion-spin coupling (the squared
 *     norm) but does not encode the field equations themselves — the
 *     Einstein equation, the metric, the cosmological term, and the
 *     rank-3 index structure of T^λ_μν and S^λ_μν are all absent.
 *   - `T_torsion_squared` is a typed-stub for the index-sum contraction
 *     `T_λμν T^λμν`; the AST does not expand the tensor sum. Similarly
 *     `c4_over_8piG_squared` is a typed-stub for the squared coupling
 *     prefactor.
 *   - Status 'speculative' is **not lifted by this encoding**. The
 *     bridge-framing of EC as a cross-categorical bridge between fields
 *     A and B in UPT's catalog is the speculative element (the EC
 *     equations themselves are canonical literature); pinning a Tier-5
 *     squared-invariant AST does not promote the bridge framing.
 *     Promoting 'speculative' → 'established' would require deleting
 *     the status-pin test in `tests/bridges/be-17-encoding.test.ts`
 *     deliberately.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 17: Einstein-Cartan torsion-spin coupling")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 17)
 * @module bridges/equations/be-17-einstein-cartan
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import { Dimension } from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

// --- Dimensions for the typed-stub symbols ---

/**
 * Dimension of the contraction T_λμν T^λμν: [T²·L⁻⁴].
 *
 * Derived from T^λ_μν ~ [T·L⁻²] (the EC torsion has dim [T·L⁻²]):
 *   T·T ~ [T²·L⁻⁴].
 */
const TORSION_SQUARED_DIM: Dimension = {
  L: -4, M: 0, T: 2, I: 0, Theta: 0, N: 0, J: 0,
};

/**
 * Dimension of (c⁴/(8πG))²: [M²·L²·T⁻⁴].
 *
 * (c⁴/(8πG)) ~ [M·L·T⁻²] = [force]; its square ~ [M²·L²·T⁻⁴].
 */
const COUPLING_PREFACTOR_SQUARED_DIM: Dimension = {
  L: 2, M: 2, T: -4, I: 0, Theta: 0, N: 0, J: 0,
};

/**
 * Dimension of S²_spin: [M²·L⁻²·T⁻²].
 *
 * Spin angular momentum density S^λ_μν ~ [M·L⁻¹·T⁻¹] (angular momentum
 * per volume); its square ~ [M²·L⁻²·T⁻²].
 */
const SPIN_DENSITY_SQUARED_DIM: Dimension = {
  L: -2, M: 2, T: -2, I: 0, Theta: 0, N: 0, J: 0,
};

// --- Symbolic AST ---

/**
 * Typed-stub for the contracted scalar `T_λμν T^λμν`.
 *
 * The AST cannot expand the rank-3 antisymmetric-index sum, so the
 * contracted scalar is encoded as a single typed symbol with the
 * dimension-of-the-contraction `[T²·L⁻⁴]`. (Same idiom BE-46 uses for
 * the `exp_factor` stub.)
 */
export const BE17_TORSION_SQUARED_STUB: ExprNode = sym(
  'T_torsion_squared',
  TORSION_SQUARED_DIM,
);

/**
 * Typed-stub for the squared coupling prefactor `(c⁴/(8πG))²`.
 *
 * Encoded as a single typed symbol with dim `[M²·L²·T⁻⁴]`; encoding
 * `(c⁴ / G)²` symbolically and dividing by `(8π)²` would clutter the
 * AST without adding validation value (the prefactor is a constant of
 * nature). (Same idiom BE-26 uses for the WKB-prefactor stub.)
 */
export const BE17_COUPLING_PREFACTOR_SQUARED: ExprNode = sym(
  'c4_over_8piG_squared',
  COUPLING_PREFACTOR_SQUARED_DIM,
);

/**
 * RHS of `S²_spin = (c⁴/(8πG))² · T_λμν T^λμν` as a typed ExprNode tree:
 *
 *   c4_over_8piG_squared · T_torsion_squared
 *
 * Inferred dim: `[M²·L²·T⁻⁴] · [T²·L⁻⁴] = [M²·L⁻²·T⁻²]`.
 */
export const BE17_SPIN_DENSITY_SQUARED_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    BE17_COUPLING_PREFACTOR_SQUARED,
    BE17_TORSION_SQUARED_STUB,
  ],
};

/**
 * LHS: S²_spin is the squared norm of the spin angular momentum
 * density tensor. Dim [M²·L⁻²·T⁻²].
 */
export const BE17_SPIN_DENSITY_SQUARED_LHS: ExprNode = sym(
  'S_spin_squared',
  SPIN_DENSITY_SQUARED_DIM,
);

// --- Numerical evaluator ---

export interface BE17Inputs {
  /**
   * Squared coupling prefactor (c⁴/(8πG))² in SI units [M²·L²·T⁻⁴].
   * Numerically ≈ (1.21×10⁴⁴ N)² ≈ 1.46×10⁸⁸ N² for the SI value
   * of c⁴/(8πG). Must be finite.
   */
  coupling_prefactor_squared: number;
  /**
   * Contracted scalar T_λμν T^λμν in SI units [T²·L⁻⁴]. Must be
   * finite and non-negative (it is a sum of squares).
   */
  torsion_squared: number;
}

/**
 * Evaluate the squared-invariant scalar reduction of the EC torsion-
 * spin coupling:
 *
 *   S²_spin = (c⁴/(8πG))² · T_λμν T^λμν
 *
 * @returns Squared spin density in SI units [M²·L⁻²·T⁻²].
 */
export function evaluateBE17SpinDensitySquared(input: BE17Inputs): number {
  const { coupling_prefactor_squared, torsion_squared } = input;
  if (!Number.isFinite(coupling_prefactor_squared)) {
    throw new RangeError(
      `evaluateBE17SpinDensitySquared: coupling_prefactor_squared must be finite, got ${coupling_prefactor_squared}`,
    );
  }
  if (!Number.isFinite(torsion_squared)) {
    throw new RangeError(
      `evaluateBE17SpinDensitySquared: torsion_squared must be finite, got ${torsion_squared}`,
    );
  }
  if (torsion_squared < 0) {
    throw new RangeError(
      `evaluateBE17SpinDensitySquared: torsion_squared must be non-negative (it is a sum of squares), got ${torsion_squared}`,
    );
  }
  return coupling_prefactor_squared * torsion_squared;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be [M²·L⁻²·T⁻²].
 */
export function validateBE17Dimensions(): DimensionValidationReport {
  const eq = validateEquation(
    BE17_SPIN_DENSITY_SQUARED_LHS,
    BE17_SPIN_DENSITY_SQUARED_RHS,
  );
  const lhs = validate(BE17_SPIN_DENSITY_SQUARED_LHS);
  const rhs = validate(BE17_SPIN_DENSITY_SQUARED_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
