/**
 * Curvature-derived helpers — Ricci, Einstein, Bianchi (v0.5.0 Phase 1d).
 *
 * Module hosts the layer of GR objects derived by contraction of a
 * `RiemannTensorNode`:
 *
 *   - `ricci(R)`            → R_μν     = R^λ_{λμν}     (this file, Task 7)
 *   - `einstein(R)`         → G_μν     = R_μν − ½ g_μν R   (Task 8 — TBD)
 *   - `bianchiResidual(R)`  → ∇_λ G^{λμ}                  (Task 9 — TBD)
 *
 * Separation rationale (Design §3 Task 1d): the bare `RiemannTensorNode`
 * stays in `connection-validators.ts` next to `CovariantDerivativeNode`
 * (both are *primary* curvature objects: connection + first-derivative).
 * Everything *contracted from* Riemann lives here — keeps the module
 * graph: tensor → metric → connection-validators → curvature.
 *
 * @module dimensional/curvature
 */

import type { Dimension } from './types.js';
import type { CovariantIndex } from './metric-validators.js';
import type { ExprNode } from './validator.js';
import type { RiemannTensorNode } from './connection-validators.js';
import type { MetricTensorNode } from './metric-validators.js';
import { IndexLabelCollisionError } from './errors.js';

// ─────────────────────────────────────────────────────────────────────────────
// RicciTensorNode — new ExprNode kind
// ─────────────────────────────────────────────────────────────────────────────

/**
 * v0.5.0 Task 7: Ricci tensor AST node R_μν.
 *
 * Internally wraps a RiemannTensorNode and represents the contraction
 * R_μν = R^λ_{λμν}. The wrapped Riemann's `upperIndex.label` and
 * `lowerIndices[0].label` are the dummy contraction indices (the λ slot);
 * the output free indices are `mu` and `nu` (cloned from
 * `R.lowerIndices[1]` and `R.lowerIndices[2]` respectively).
 *
 * The node is its own validation arm in validator.ts and its own lowering
 * arm in numerical/lowering.ts — same pattern as RiemannTensorNode (no
 * AST-rewrite; the contraction is a single primitive walked directly).
 *
 * @public
 */
export interface RicciTensorNode {
  readonly kind: 'ricci-tensor';
  /** The Riemann tensor whose first two slots are contracted. */
  readonly riemann: RiemannTensorNode;
}

/**
 * Result of validating a RicciTensorNode.
 * @public
 */
export interface RicciTensorValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a `ricci-tensor` node.
 *
 * Throws:
 *   - IndexLabelCollisionError if the embedded Riemann's two free output
 *     labels (the σ slot — lowerIndices[0] — and the ν slot —
 *     lowerIndices[2]) collide. (The contracted middle slot
 *     lowerIndices[1] is invisible to this check; any label is allowed
 *     there because it's a dummy.)
 *
 * The Riemann sub-node is validated structurally by re-entering its own
 * validator via the `validateRiemannChild` callback (so its signature
 * checks fire), but its free indices are NOT propagated — the ρ slot
 * collapses into the contraction with the μ slot (Carroll Eq. 3.91:
 * `R_μν = R^λ_{μλν}`), and the surviving σ / ν slots become the new
 * free indices of the Ricci tensor.
 */
export function validateRicciTensor(
  node: RicciTensorNode,
  validateRiemannChild: (child: RiemannTensorNode) => {
    dim: Dimension;
    freeIndices: Map<string, { upper: number; lower: number }>;
  },
): RicciTensorValidationResult {
  // Re-validate the embedded Riemann so its signature checks (upperIndex /
  // lowerIndices variance, gLower / gInverse signature, free-index
  // disjointness) fire here too. We discard its freeIndices map: the ρ slot
  // and the μ slot (lowerIndices[1]) are the contraction; the surviving σ
  // (lowerIndices[0]) and ν (lowerIndices[2]) are reconstructed below from
  // the authoritative axis source.
  const rResult = validateRiemannChild(node.riemann);

  // Dim is inherited 1:1 from the Riemann (contraction does not change
  // per-component units — multiplying by δ^ρ_μ is dimensionless).
  const dim = rResult.dim;

  // Surviving free indices: Ricci's μ_out ← lowerIndices[0] (σ slot),
  // Ricci's ν_out ← lowerIndices[2] (ν slot). Contracted middle slot
  // (lowerIndices[1]) is dummied and not surfaced as free.
  const muOutIdx: CovariantIndex = node.riemann.lowerIndices[0];
  const nuOutIdx: CovariantIndex = node.riemann.lowerIndices[2];
  if (muOutIdx.label === nuOutIdx.label) {
    throw new IndexLabelCollisionError(muOutIdx.label, 2, ['ricci-tensor']);
  }

  const freeIndices = new Map<string, { upper: number; lower: number }>();
  freeIndices.set(muOutIdx.label, { upper: 0, lower: 1 });
  freeIndices.set(nuOutIdx.label, { upper: 0, lower: 1 });

  return { dim, freeIndices };
}

// ─────────────────────────────────────────────────────────────────────────────
// ricci() — user-facing constructor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the Ricci tensor R_μν = R^λ_{μλν} as a composite ExprNode.
 *
 * **Convention (Carroll Eq. 3.91).** Contract upper-ρ against the SECOND
 * lower slot — the μ position in R^ρ_σμν, i.e., `lowerIndices[1]` in the
 * RiemannTensorNode storage. The surviving free indices are the σ slot
 * (`lowerIndices[0]`) → Ricci's first free output μ_out, and the ν slot
 * (`lowerIndices[2]`) → Ricci's second free output ν_out.
 *
 * Index mapping after contraction:
 *   - upperIndex (ρ) → contracted with lowerIndices[1] (the μ slot, λ dummy)
 *   - lowerIndices[0] (σ) → Ricci's free output index 0 (μ_out)
 *   - lowerIndices[2] (ν) → Ricci's free output index 1 (ν_out)
 *   Result: R_μν with free indices {σ_label: lower, ν_label: lower}
 *
 * Index-map diagram:
 *   R^ρ  _  σ  _  μ  _  ν       (RiemannTensorNode slots)
 *       ↑           ↑
 *   upper        lower[1]   <- contract these two (ρ = μ = λ)
 *            lower[0]    lower[2]  <- become R_μν free indices
 *
 * **Why not "upper ↔ lowerIndices[0]" (the first-lower trace)?** The trace
 * `R^λ_{λμν}` over the first pair (ρ ↔ σ) is identically zero by the
 * first-pair antisymmetry of the (lowered) Riemann tensor — for any
 * metric, including non-vacuum solutions like de Sitter. The
 * constant-curvature identity `R_μν = (n-1) K g_μν` (Carroll §8.1,
 * `R = 4Λ` in n=4) only matches the upper↔second-lower contraction.
 * The de-Sitter Ricci-scalar test in `tests/dimensional/ricci.test.ts`
 * is the discriminating fixture that pins this convention.
 *
 * The returned tree is a single `ricci-tensor` node wrapping the supplied
 * Riemann. Validator and numerical lowering each have a dedicated arm —
 * no AST rewrite into a `tensor-product`-of-Riemann happens here (the
 * RiemannTensorNode is not contractable in the v0.3.5 tensor-product
 * einsum sense; the contraction is a primitive operation walked directly).
 *
 * @public
 */
export function ricci(R: RiemannTensorNode): ExprNode {
  return { kind: 'ricci-tensor', riemann: R };
}

// ─────────────────────────────────────────────────────────────────────────────
// EinsteinTensorNode — new ExprNode kind (Task 8)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * v0.5.0 Task 8: Einstein tensor AST node G_μν = R_μν − ½ R g_μν.
 *
 * Wraps a `RiemannTensorNode` (contracted via the same Carroll-Eq.-3.91
 * convention as `RicciTensorNode` — see ricci()'s JSDoc) plus the metric
 * pair needed for the scalar trace `R = g^μν R_μν` and the `½ R g_μν`
 * subtraction term. Storage mirrors the `RicciTensorNode` pattern: own
 * validator + lowering arms, no AST rewrite into op('-', ricci, scale·g).
 *
 * Free indices match `R.lowerIndices[0]` and `R.lowerIndices[2]` — same as
 * ricci(R), with the same Carroll-Eq.-3.91 contraction; the embedded
 * Riemann's middle slot lowerIndices[1] is the dummy λ.
 *
 * Dim: {L: -2} — inherited from Riemann/Ricci (both `R_μν` and `R · g_μν`
 * carry 1/L²; subtraction preserves dim).
 *
 * @public
 */
export interface EinsteinTensorNode {
  readonly kind: 'einstein-tensor';
  /** The Riemann tensor whose contraction yields the inner Ricci R_μν. */
  readonly riemann: RiemannTensorNode;
  /** Lower metric g_μν — supplies the `½ R g_μν` subtraction tensor. */
  readonly gLower: MetricTensorNode;
  /** Upper metric g^μν — supplies the scalar trace `R = g^μν R_μν`. */
  readonly gInverse: MetricTensorNode;
}

/**
 * Result of validating an EinsteinTensorNode.
 * @public
 */
export interface EinsteinTensorValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate an `einstein-tensor` node.
 *
 * Delegates structural checks to the embedded Riemann via the
 * `validateRiemannChild` callback (same pattern as `validateRicciTensor`)
 * and reuses `validateRicciTensor` for the surviving free-index labels —
 * an Einstein tensor's free indices are exactly the Ricci tensor's free
 * indices (subtracting `½ R g_μν` with matching {μ_out, ν_out} labels
 * preserves the index structure).
 *
 * The `gLower` / `gInverse` sub-nodes are deliberately NOT propagated as
 * free indices — they are consumed internally by the scalar-trace
 * contraction and the `½ R g_μν` multiplication (same H1 discipline as
 * RiemannTensorNode for its gLower/gInverse fields).
 *
 * Throws:
 *   - Everything `validateRicciTensor` throws (IndexLabelCollisionError on
 *     surviving free-index collision; MetricSignatureError /
 *     PartialDerivativeIndexVarianceError from the inner Riemann).
 */
export function validateEinsteinTensor(
  node: EinsteinTensorNode,
  validateRiemannChild: (child: RiemannTensorNode) => {
    dim: Dimension;
    freeIndices: Map<string, { upper: number; lower: number }>;
  },
): EinsteinTensorValidationResult {
  // Delegate to Ricci validation — the surviving free-index labels and dim
  // are identical (R_μν has the same {μ_out, ν_out} as G_μν, dim {L:-2}).
  const ricciNode: RicciTensorNode = { kind: 'ricci-tensor', riemann: node.riemann };
  const r = validateRicciTensor(ricciNode, validateRiemannChild);

  // Defense in depth: the `½ R g_μν` term involves g_μν, but its free
  // indices are NOT propagated — they are the same {μ_out, ν_out} as Ricci
  // by construction (we contract them down to a 4×4 in the same axis order
  // during lowering). Mirrors H1: gLower / gInverse on RiemannTensorNode.
  return { dim: r.dim, freeIndices: r.freeIndices };
}

// ─────────────────────────────────────────────────────────────────────────────
// einstein() — user-facing constructor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the Einstein tensor G_μν = R_μν − ½ R g_μν as a composite ExprNode.
 *
 * **Convention.** Inherits Carroll Eq. 3.91 from `ricci(R)` — the inner
 * Ricci is computed by contracting upper-ρ of the wrapped Riemann against
 * `lowerIndices[1]` (the middle/μ slot in R^ρ_σμν). The scalar trace is
 * `R = g^μν R_μν` and the subtraction term is `½ R · g_μν`. The result
 * `G_μν` shares free indices {μ_out, ν_out} with `ricci(R)`.
 *
 * **Algebra (sanity check).**
 *   - de Sitter (n=4): `R_μν = Λ g_μν`, `R = 4Λ` ⇒
 *     `G_μν = Λ g_μν − ½·4Λ·g_μν = −Λ g_μν`. Vacuum Einstein equation
 *     `G_μν + Λ g_μν = 0` holds.
 *   - Schwarzschild (vacuum): `R_μν ≡ 0`, `R = 0` ⇒ `G_μν ≡ 0`.
 *   - Trace identity (any metric, n=4): `g^μν G_μν = R − ½·R·4 = −R`.
 *
 * **AST shape.** Single `einstein-tensor` node wrapping `R`, `gLower`,
 * `gInverse`. Validator and numerical lowering each have a dedicated arm;
 * no AST rewrite into `ricci(R) − ½ R g_μν` happens (the subtraction term
 * would need a tensor-valued scalar-multiply that the v0.3.5 tensor-product
 * einsum does not support directly). Same walk-directly pattern as Ricci.
 *
 * **Matter coupling is out of scope.** The vacuum / cosmological-constant
 * tests pin G_μν only; `G_μν = κ T_μν` (Einstein field equations with a
 * stress-energy source) is deferred to v0.6.0+.
 *
 * @public
 */
export function einstein(
  R: RiemannTensorNode,
  g: MetricTensorNode,
  gInverse: MetricTensorNode,
): ExprNode {
  return { kind: 'einstein-tensor', riemann: R, gLower: g, gInverse };
}
