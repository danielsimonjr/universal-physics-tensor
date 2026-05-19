/**
 * Killing-vector machinery (v0.6.0 Phase 1, Task 1.1).
 *
 * A Killing vector ξ^μ generates an isometry of the metric. The defining
 * equation is the Killing equation
 *
 *     ∇_μ ξ_ν + ∇_ν ξ_μ = 0
 *
 * (Carroll Eq. 3.174). Validation here is symbolic (rank + variance only);
 * the operator-valued check happens at lowering time in
 * `src/numerical/killing.ts::verifyKillingEquation`.
 *
 * @module dimensional/killing-validators
 */

import type { Dimension } from './types.js';
import type { TensorSymbolNode } from './tensor.js';
import type { MetricTensorNode } from './metric-validators.js';

/**
 * AST node for a Killing vector ξ^μ. Rank-1 upper-variance tensor with
 * an attached metric reference (the metric whose isometry ξ generates).
 *
 * Component-dim is free (typically `[L·T⁻¹]` for spatial Killing fields,
 * dimensionless for time-translation if c=1 normalization, or `[L]` for
 * dimensionally-pure spatial isometries).
 *
 * @public
 */
export interface KillingVectorNode {
  readonly kind: 'killing-vector';
  readonly vector: TensorSymbolNode;
  readonly metric: MetricTensorNode;
}

export interface KillingVectorValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a `killing-vector` node.
 *
 * Throws:
 *   - Error if vector is not rank-1 (Killing fields are rank-1 by definition).
 *   - Error if vector variance is not 'upper' (canonical Killing form is upper;
 *     lower form is obtained by metric-lowering at lowering-time).
 */
export function validateKillingVector(
  node: KillingVectorNode,
): KillingVectorValidationResult {
  if (node.vector.indices.length !== 1) {
    throw new Error(
      `KillingVectorNode: expected rank-1 vector, got rank-${node.vector.indices.length}`,
    );
  }
  const idx = node.vector.indices[0];
  if (idx.variance !== 'upper') {
    throw new Error(
      `KillingVectorNode: expected upper variance, got '${idx.variance}'`,
    );
  }
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  freeIndices.set(idx.label, { upper: 1, lower: 0 });
  return { dim: node.vector.dim, freeIndices };
}
