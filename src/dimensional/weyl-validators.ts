/**
 * Per-kind validation for the v0.6.0 WeylTensorNode.
 *
 * The Weyl tensor C^ρ_{σμν} is the trace-free part of the Riemann tensor.
 * In 4D (n=4) expanded (non-antisymmetrized-bracket) form:
 *
 *   C^ρ_{σμν} = R^ρ_{σμν}
 *             − (1/2)(δ^ρ_μ R_{σν} − δ^ρ_ν R_{σμ} − g_{σμ} R^ρ_ν + g_{σν} R^ρ_μ)
 *             + (1/6) R (δ^ρ_μ g_{σν} − δ^ρ_ν g_{σμ})
 *
 * The prefactors are 1/(n−2) = 1/2 and 1/((n−1)(n−2)) = 1/6 at n=4.
 * Numerical lowering is handled by Task 3.2 (src/numerical/weyl-lowering.ts);
 * this module is purely the AST node interface + symbolic validator.
 *
 * Index convention: C^ρ_{σμν} — one upper (ρ), three lower (σ, μ, ν).
 * Same as RiemannTensorNode; shares the same [L⁻²] dimensional signature.
 *
 * Mirrors connection-validators.ts:RiemannTensorNode / validateRiemannTensor.
 *
 * @module dimensional/weyl-validators
 */

import type { Dimension } from './types.js';
import type { MetricTensorNode, CovariantIndex } from './metric-validators.js';
import type { UpperIndex } from './connection-validators.js';
import {
  PartialDerivativeIndexVarianceError,
  IndexLabelCollisionError,
} from './errors.js';
import type { CurvatureCompositeNode } from './curvature-composite.js';

/**
 * AST node for the Weyl curvature tensor C^ρ_{σμν}.
 *
 * Decision #4 (v0.6.0-Design.md): index shape = 1 upper + 3 lower, same as
 * RiemannTensorNode. Decision #13: no `dimension: 4` field — n=4 is
 * hardcoded in the numerical lowering implementation.
 *
 * H1 (v0.4.0 pattern from connection-validators.ts): `metric` is present
 * for downstream numerical consumers but its free indices are NOT propagated
 * by the validator — they are consumed internally by the Weyl formula's
 * contractions.
 */
/**
 * v0.6.0 Task 3.10d: WeylTensorNode expressed via CurvatureCompositeNode<K, S>.
 * The runtime shape is identical — pure type-alias migration.
 */
export type WeylTensorNode = CurvatureCompositeNode<'weyl-tensor', {
  /** Metric g_{μν} (both-lower). Present for numerical lowering consumers. */
  readonly metric: MetricTensorNode;
  /** Contravariant (upper) index ρ. */
  readonly upperIndex: UpperIndex;
  /** Three covariant (lower) indices [σ, μ, ν]. */
  readonly lowerIndices: readonly [CovariantIndex, CovariantIndex, CovariantIndex];
  /**
   * Dimensional signature of each component: [L⁻²], same as Riemann.
   * Hard-coded by the caller per F8/I3 convention — the validator verifies
   * structural correctness, not this value.
   */
  readonly componentDim: Dimension;
}>;

// v0.6.1: dropped export — internal-only validation-result shape.
interface WeylTensorValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a weyl-tensor node.
 *
 * Structurally mirrors validateRiemannTensor (connection-validators.ts):
 * same 1-up-3-down index structure, same [L⁻²] dim, same M9 disjointness
 * check on the four free labels.
 *
 * Throws:
 *   - PartialDerivativeIndexVarianceError if upperIndex.variance !== 'upper'
 *     or any lowerIndices[i].variance !== 'lower'
 *   - IndexLabelCollisionError if the 4 free-index labels {ρ, σ, μ, ν}
 *     are not pairwise distinct
 *
 * H1 (v0.4.0 pattern): `metric` is NOT validated via a validateChild
 * callback here — its structural content is consumed by the numerical
 * lowering layer; only its index-variance signature matters, and this
 * validator does not check it (same discipline as validateRiemannTensor
 * for gLower/gInverse/xCoord).
 */
export function validateWeylTensor(
  node: WeylTensorNode,
): WeylTensorValidationResult {
  // Variance checks — mirrors validateRiemannTensor's pattern exactly.
  if (node.upperIndex.variance !== 'upper') {
    throw new PartialDerivativeIndexVarianceError(
      `weyl-tensor: upperIndex '${node.upperIndex.label}' must be 'upper', ` +
        `got '${(node.upperIndex as { variance: string }).variance}'`,
    );
  }
  for (let i = 0; i < 3; i++) {
    const idx = node.lowerIndices[i] as { label: string; variance: string };
    if (idx.variance !== 'lower') {
      throw new PartialDerivativeIndexVarianceError(
        `weyl-tensor: lowerIndices[${i}] '${idx.label}' must be 'lower', ` +
          `got '${idx.variance}'`,
      );
    }
  }

  // M9: disjointness check on the four free labels {ρ, σ, μ, ν}.
  // Repeated labels would imply an implicit contraction that belongs to
  // a different tensor node. We deliberately do NOT compare against the
  // metric's dummy indices (H1-suppressed).
  const labels = [
    node.upperIndex.label,
    node.lowerIndices[0].label,
    node.lowerIndices[1].label,
    node.lowerIndices[2].label,
  ];
  const seen = new Set<string>();
  for (const label of labels) {
    if (seen.has(label)) {
      throw new IndexLabelCollisionError(label, 2, ['weyl-tensor']);
    }
    seen.add(label);
  }

  // Build free-index map: ρ → upper, σ/μ/ν → lower.
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  freeIndices.set(node.upperIndex.label, { upper: 1, lower: 0 });
  for (const idx of node.lowerIndices) {
    freeIndices.set(idx.label, { upper: 0, lower: 1 });
  }

  // F8/I3: Weyl carries the same inverse-length-squared dimension as Riemann.
  // Hard-coded — identical for every Weyl tensor regardless of metric dim
  // (metric is dimensionless per UPT convention).
  const dim: Dimension = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

  return { dim, freeIndices };
}
