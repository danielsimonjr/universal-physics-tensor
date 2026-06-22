/**
 * Kretschmann scalar AST node + validator (v0.6.0 Phase 3, Task 3.5).
 *
 * The Kretschmann scalar (also spelled "Kretschner") is the quadratic
 * curvature invariant:
 *
 *   K = R_{ρσμν} R^{ρσμν}
 *
 * formed by full contraction of the Riemann tensor with itself (all four
 * indices raised on the second factor via the inverse metric). K is a
 * genuine spacetime scalar — coordinate-independent, diff-invariant — and
 * the canonical diagnostic for curvature-singularity detection: K diverges
 * at genuine singularities (Schwarzschild r→0) but is finite at coordinate
 * singularities (Schwarzschild r=r_s).
 *
 * Closed-form for Schwarzschild: K(r) = 48 G² M² / (c⁴ r⁶).
 *
 * Dimensional analysis:
 *   - Riemann component: [L⁻²] (F8/I3 convention in connection-validators.ts)
 *   - K = R × R: [L⁻²] × [L⁻²] = [L⁻⁴]
 *
 * Mirrors the WeylTensorNode pattern in weyl-validators.ts — own validator
 * function; wired via case arm in validator.ts + lowering stub in lowering.ts.
 *
 * @module dimensional/curvature-invariants
 */

import type { Dimension } from './types.js';
import type {
  RiemannTensorNode,
  MetricTensorNode,
  KretschmannScalarNode,
} from './ast-types.js';
import { validateRiemannTensor } from './connection-validators.js';

// The Kretschmann node now lives in the leaf `ast-types.ts`; re-exported.
export type { KretschmannScalarNode } from './ast-types.js';

// ─────────────────────────────────────────────────────────────────────────────
// KretschmannScalarNode — ExprNode kind 'kretschmann-scalar'
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AST node for the Kretschmann scalar K = R_{ρσμν} R^{ρσμν}.
 *
 * `riemann`: the Riemann tensor being contracted with itself. The validator
 *   re-enters its own validator so structural checks (index variance,
 *   metric signature) fire for the embedded sub-node.
 *
 * `metric`: the metric tensor used to raise all four indices on the second
 *   copy of Riemann. Present for downstream numerical consumers
 *   (computeKretschmann in src/numerical/kretschmann.ts). Its free indices
 *   are NOT propagated by the validator (H1 — consumed internally).
 *
 * `componentDim`: [L⁻⁴] — Riemann [L⁻²] squared, hard-coded per F8/I3.
 *
 * @public
 */
/**
 * v0.6.0 Task 3.10d: KretschmannScalarNode expressed via CurvatureCompositeNode<K, S>.
 * The runtime shape is identical — pure type-alias migration.
 */
/**
 * Result of validating a KretschmannScalarNode.
 * @public
 */
export interface KretschmannScalarValidationResult {
  /** [L⁻⁴] — Kretschmann is Riemann-squared in dimension. */
  readonly dim: Dimension;
  /** Empty: K is a scalar (rank-0, all indices contracted). */
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Dimension literal for [L⁻⁴].
 * Kept module-private; callers receive it through the return value.
 */
const DIM_L_NEG4: Dimension = { L: -4, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/**
 * Validate a `kretschmann-scalar` node.
 *
 * Re-enters `validateRiemannTensor` for the embedded `riemann` sub-node
 * (so its index-variance, metric-signature, and label-disjointness checks
 * all fire). Discards the Riemann's free-index map — K is a full contraction
 * and every index disappears. Mirrors the `validateRicciTensor` pattern in
 * curvature.ts for embedded-Riemann structural validation.
 *
 * Throws:
 *   - Everything `validateRiemannTensor` throws (PartialDerivativeIndexVarianceError,
 *     MetricSignatureError, IndexLabelCollisionError) propagated from the
 *     embedded Riemann check.
 *
 * Returns:
 *   - `{ dim: [L⁻⁴], freeIndices: empty Map }` — scalar, no free indices.
 */
export function validateKretschmannScalar(
  node: KretschmannScalarNode,
): KretschmannScalarValidationResult {
  // Re-validate the embedded Riemann. We pass node.riemann directly to
  // validateRiemannTensor (not via a callback, since KretschmannScalarNode
  // does not need to thread an infer() context for its sub-nodes — it only
  // needs the structural checks to fire, and the Riemann validator is
  // self-contained). Mirrors the validateRicciTensor invocation in
  // curvature.ts:validateRicciTensor.
  validateRiemannTensor(node.riemann);

  // K is a scalar: no free indices.
  return {
    dim: DIM_L_NEG4,
    freeIndices: new Map(),
  };
}
