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
