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
 * density tensor S^λ_μν. The algebraic torsion-spin half IS structurally
 * encodable — see "Structural encoding" below.
 *
 * **v0.6.0 note:** The Einstein-equation half is now also structurally
 * encodable via `EinsteinFieldEquationNode` (Phase 2 Task 2.3). This
 * module encodes the torsion-spin scalar reduction (the algebraically
 * tractable half of the EC system); the EFE half is not re-encoded here
 * because the bridge's dimensional verdict and status live on the
 * torsion-spin invariant, not on the EFE. Decision #9 (v0.6.0-Design.md)
 * pins the status unchanged: AST closure ≠ physics validation.
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
 *   - T_λμν T^λμν is the Einstein contraction of the rank-3 torsion
 *     tensor against its dual — encoded structurally in v0.2.0 as a
 *     `tensor-product` over two `tensor-symbol` nodes — yielding a
 *     scalar with dim [T²·L⁻⁴].
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
 * **Structural encoding (v0.2.0).** The torsion contraction
 * `T_λμν T^λμν` is now encoded as a structural `tensor-product` over
 * two `tensor-symbol` nodes:
 *   - `T_lower`: tensor-symbol named `T_torsion` with three lower
 *     indices (λ, μ, ν), per-component dim `[T·L⁻²]`.
 *   - `T_upper`: tensor-symbol named `T_torsion` with three upper
 *     indices (λ, μ, ν), per-component dim `[T·L⁻²]`.
 *   - `contract(T_lower, T_upper)` yields a `tensor-product` node that
 *     the validator structurally verifies: each index label appears
 *     exactly twice (once upper, once lower), so all three indices are
 *     fully contracted and the result is a scalar with dim
 *     `[T·L⁻²] · [T·L⁻²] = [T²·L⁻⁴]`. The validator emits no violations
 *     and reports an empty `freeIndices` map.
 *
 * **All-lower / all-upper representational choice.** The canonical
 * literature form of the rank-3 torsion tensor is the mixed-variance
 * `T^λ_μν` (one upper index, two lower indices, antisymmetric in the
 * lower pair). The v0.2.0 encoding instead represents the contraction
 * using an "all-lower" `T_λμν` and an "all-upper" `T^λμν` and contracts
 * the matching label pairs. This is **mathematically valid**: the
 * scalar invariant `T_λμν T^λμν` is the same scalar whether you write
 * it as `T^λ_μν · T_λ^μν`, `T_λ^μν · T^λ_μν`, or as the all-lower /
 * all-upper product used here — Einstein summation over each
 * upper-lower pair produces the same number, because raising or lowering
 * an index with the metric just shuffles which factor carries the upper
 * variant. The all-lower / all-upper split was chosen because v0.2.0's
 * algebra layer matches contraction pairs by `(label, variance)` and
 * does not yet model the metric tensor that would convert between
 * mixed-variance representations. Readers translating to the canonical
 * `T^λ_μν` form should note that the structural verdict (rank-3,
 * fully contracted, scalar) is preserved across the choice — only the
 * surface variance labeling differs.
 *
 * **Implicit dimensionless-metric assumption.** v0.2.0 treats
 * `T_lower` and `T_upper` as having the **same per-component
 * dimension** (`[T·L⁻²]`). This is mathematically equivalent to
 * assuming the metric tensor `g_μν` is dimensionless — the standard
 * convention in the (-,+,+,+) signature used throughout the UPT
 * catalog. Under that convention raising an index via
 * `T^λ_μν = g_μα g_νβ T^λαβ` (or its rank-3 analog) preserves the
 * per-component dimension because `g` contributes a dimensionless
 * factor per index raised. In geometrized units (where `g` carries
 * `[L²]` per index pair) or in any convention where the metric is
 * not dimensionless, the raising / lowering operation would multiply
 * the per-component dimension by `g.dim` per index pair, and the
 * `[T·L⁻²] === [T·L⁻²]` equality between `T_lower.dim` and
 * `T_upper.dim` would no longer hold. v0.3.0 introduces the metric
 * tensor as an explicit AST primitive (per v0.2.0-Design.md §2 / §12
 * "metric layer") and will revisit this case with explicit dimension
 * tracking through raise/lower operations.
 *
 * The squared coupling prefactor `(c⁴/(8πG))²` remains a typed-stub
 * symbol — encoding it structurally adds no validation value because
 * it is a fixed constant of nature (not an indexed tensor). Per the
 * same idiom BE-26 uses for the WKB prefactor.
 *
 * **v0.1.0 → v0.2.0 migration.** v0.1.0 used a single typed-stub
 * `T_torsion_squared` (a scalar `symbol` with hand-computed dim
 * `[T²·L⁻⁴]`). v0.2.0 removes that stub and replaces it with the
 * structural form. The dimensional verdict on `BE17_SPIN_DENSITY_SQUARED_RHS`
 * is unchanged ([M²·L⁻²·T⁻²]); the AST shape is the only change. Per
 * v0.2.0-Design.md §14.5, stub removals are technically BREAKING per
 * SemVer (downstream consumers importing `BE17_TORSION_SQUARED_STUB`
 * by name will no longer compile), even though v0.2.0 is pre-1.0 and
 * a minor bump is permitted.
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
 *     equation + algebraic torsion-spin equation). This module encodes a
 *     **squared-invariant scalar reduction** of the torsion-spin half,
 *     NOT the full field equations. The Einstein-equation half, which
 *     previously could not be encoded (v0.2.0 lacked curvature/Riemann
 *     primitives), CAN now be expressed structurally via
 *     `EinsteinFieldEquationNode` (v0.6.0 Phase 2 Task 2.3). The bridge
 *     still encodes the torsion-spin scalar reduction because that is the
 *     dimensionally tractable half; the EFE half is not added here (it
 *     would require constructing a full Riemann + metric sub-tree with no
 *     numerical evaluator attached to this module).
 *   - The reduction `S²_spin = (c⁴/(8πG))² · T_λμν T^λμν` is a
 *     **contracted scalar**, not a full algebraic relation. It captures
 *     **one invariant** of the EC torsion-spin coupling (the squared
 *     norm) but does not encode the field equations themselves — the
 *     Einstein equation, the metric, and the cosmological term are
 *     absent.
 *   - In v0.2.0 the rank-3 index structure of `T_λμν T^λμν` IS
 *     encoded structurally (three explicit indices in upper and lower
 *     variance, contracted by the algebra layer). The antisymmetry of
 *     `T^λ_μν` in its lower indices is NOT enforced — the v0.2.0
 *     algebra layer is a Tier-1 "type-checker for tensor algebra,"
 *     not a full symbolic tensor calculator. Antisymmetry would be
 *     enforced by a future symmetry-tag system (out of scope for
 *     v0.2.0).
 *   - `c4_over_8piG_squared` remains a typed-stub for the squared
 *     coupling prefactor (a constant of nature; no index structure to
 *     encode). Same idiom BE-26 uses for the WKB prefactor.
 *   - Status 'speculative' is **not lifted by this encoding**. The
 *     bridge-framing of EC as a cross-categorical bridge between fields
 *     A and B in UPT's catalog is the speculative element (the EC
 *     equations themselves are canonical literature); pinning a Tier-5
 *     structurally-encoded AST does not promote the bridge framing.
 *     Promoting 'speculative' → 'established' would require deleting
 *     the status-pin test in `tests/bridges/be-17-encoding.test.ts`
 *     deliberately.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 17: Einstein-Cartan torsion-spin coupling")
 * @see docs/specification/Part-VII-Tensor-Algebra.md (v0.2.0 tensor algebra layer)
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 17)
 * @module bridges/equations/be-17-einstein-cartan
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import { Dimension } from '../../dimensional/types.js';
import { tsym, contract } from '../../dimensional/tensor.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

// --- Dimensions ---

/**
 * Per-component dimension of the rank-3 torsion tensor `T^λ_μν`: [T·L⁻²].
 *
 * Derived from the algebraic torsion-spin equation
 * `T^λ_μν = (8πG/c⁴) S^λ_μν`:
 *   - 8πG/c⁴ ~ [T²·M⁻¹·L⁻¹];
 *   - S^λ_μν ~ [M·L⁻¹·T⁻¹] (angular momentum per volume);
 *   - product ~ [T·L⁻²].
 *
 * The contraction `T_λμν T^λμν` is then a SCALAR with dim
 * [T·L⁻²] · [T·L⁻²] = [T²·L⁻⁴], verified structurally by the v0.2.0
 * algebra layer.
 */
const TORSION_COMPONENT_DIM: Dimension = {
  L: -2, M: 0, T: 1, I: 0, Theta: 0, N: 0, J: 0,
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
 * Tensor-symbol node for the rank-3 torsion tensor with three LOWER
 * indices: `T_λμν`. Per-component dim `[T·L⁻²]`.
 */
const T_lower = tsym(
  'T_torsion',
  [
    { label: 'λ', variance: 'lower' },
    { label: 'μ', variance: 'lower' },
    { label: 'ν', variance: 'lower' },
  ],
  TORSION_COMPONENT_DIM,
);

/**
 * Tensor-symbol node for the rank-3 torsion tensor with three UPPER
 * indices: `T^λμν`. Per-component dim `[T·L⁻²]`.
 */
const T_upper = tsym(
  'T_torsion',
  [
    { label: 'λ', variance: 'upper' },
    { label: 'μ', variance: 'upper' },
    { label: 'ν', variance: 'upper' },
  ],
  TORSION_COMPONENT_DIM,
);

/**
 * Structural encoding of the torsion-tensor contraction `T_λμν T^λμν`
 * as a `tensor-product` over `T_lower` and `T_upper`. Each index label
 * (λ, μ, ν) appears exactly twice — once upper, once lower — so the
 * v0.2.0 algebra layer fully contracts all three and emits a SCALAR
 * with dim `[T·L⁻²] · [T·L⁻²] = [T²·L⁻⁴]` and empty `freeIndices` map.
 *
 * Replaces the v0.1.0 `T_torsion_squared` typed-stub (a scalar `symbol`
 * with hand-computed dim).
 */
export const BE17_TORSION_CONTRACTION: ExprNode = contract(T_lower, T_upper);

/**
 * Typed-stub for the squared coupling prefactor `(c⁴/(8πG))²`.
 *
 * Encoded as a single typed symbol with dim `[M²·L²·T⁻⁴]`; encoding
 * `(c⁴ / G)²` symbolically and dividing by `(8π)²` would clutter the
 * AST without adding validation value (the prefactor is a constant of
 * nature; it has no index structure to encode structurally). Same idiom
 * BE-26 uses for the WKB-prefactor stub.
 */
export const BE17_COUPLING_PREFACTOR_SQUARED: ExprNode = sym(
  'c4_over_8piG_squared',
  COUPLING_PREFACTOR_SQUARED_DIM,
);

/**
 * RHS of `S²_spin = (c⁴/(8πG))² · T_λμν T^λμν` as a structural
 * `tensor-product` over the scalar prefactor and the fully-contracted
 * torsion scalar:
 *
 *   contract(c4_over_8piG_squared, contract(T_lower, T_upper))
 *
 * Inferred dim: `[M²·L²·T⁻⁴] · [T²·L⁻⁴] = [M²·L⁻²·T⁻²]`. Both factors
 * are scalars at the outer contraction (the inner contract reduces to
 * a scalar), so the outer `tensor-product` is dimensionally equivalent
 * to a scalar product. Encoding it as a `tensor-product` (not a scalar
 * `op '*'`) keeps the RHS structurally consistent with v0.2.0's tensor
 * algebra layer.
 */
export const BE17_SPIN_DENSITY_SQUARED_RHS: ExprNode = contract(
  BE17_COUPLING_PREFACTOR_SQUARED,
  BE17_TORSION_CONTRACTION,
);

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
   * Numerical value of the contracted scalar `T_λμν T^λμν` in SI units
   * [T²·L⁻⁴]. Must be finite and non-negative (it is a sum of squares).
   *
   * The structural encoding lives in the AST
   * (`BE17_TORSION_CONTRACTION`, a `tensor-product` over `T_lower` and
   * `T_upper`); the evaluator accepts the contracted-scalar value as a
   * single number, identical to the v0.1.0 interface.
   */
  torsion_squared: number;
}

/**
 * Evaluate the squared-invariant scalar reduction of the EC torsion-
 * spin coupling:
 *
 *   S²_spin = (c⁴/(8πG))² · T_λμν T^λμν
 *
 * The structural change introduced in v0.2.0 lives in the AST, not in
 * the evaluator — the input interface is unchanged from v0.1.0.
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
