/**
 * Killing-vector machinery (v0.6.0 Phase 1, Tasks 1.1–1.2).
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
import type {
  TensorSymbolNode,
  MetricTensorNode,
  KillingVectorNode,
  ConservedChargeNode,
} from './ast-types.js';
import { multiply } from './algebra.js';

// Node types now live in the leaf `ast-types.ts`; re-exported for compat.
export type { KillingVectorNode, ConservedChargeNode } from './ast-types.js';

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
// v0.6.1: dropped export — internal-only validation-result shape.
interface KillingVectorValidationResult {
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

// ---------------------------------------------------------------------------
// Task 1.2 — ConservedChargeNode
// ---------------------------------------------------------------------------

/**
 * AST node for the conserved charge Q = ξ^μ p_μ along a geodesic
 * (Carroll Eq. 3.175).
 *
 * **Sign convention**: the node encodes the raw contraction `ξ^μ p_μ`.
 * In (-,+,+,+) signature with the timelike Killing vector ξ^μ_t = (1,0,0,0),
 * `p_t < 0` for forward-time motion of massive particles, so the "physical
 * energy" of common usage is `E = -Q` (Carroll Eq. 8.30). The PC-1.5
 * diagnostic uses magnitude `|ΔQ / Q|` to be sign-agnostic.
 *
 * @public
 */
// v0.6.1: dropped export — internal-only validation-result shape.
interface ConservedChargeValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a `conserved-charge` node.
 *
 * Throws:
 *   - Error if momentum is not rank-1.
 *   - Error if the Killing-vector index label does not match the momentum
 *     index label (they must contract on the same label).
 *   - Error if momentum variance is not 'lower' (Q = ξ^μ p_μ requires the
 *     upper Killing field to contract with the lower momentum).
 *
 * Returns a scalar result (empty freeIndices) with dimension
 * `dim(ξ) × dim(p)` via the `multiply` algebra helper.
 */
export function validateConservedCharge(
  node: ConservedChargeNode,
): ConservedChargeValidationResult {
  if (node.momentum.indices.length !== 1) {
    throw new Error(
      `ConservedChargeNode: expected rank-1 momentum, got rank-${node.momentum.indices.length}`,
    );
  }
  const xiLabel = node.killing.vector.indices[0].label;
  const pLabel = node.momentum.indices[0].label;
  if (xiLabel !== pLabel) {
    throw new Error(
      `ConservedChargeNode: index label mismatch — Killing '${xiLabel}' vs momentum '${pLabel}'`,
    );
  }
  if (node.momentum.indices[0].variance !== 'lower') {
    throw new Error(
      `ConservedChargeNode: momentum must have lower variance to contract with upper Killing field`,
    );
  }
  // dim(Q) = dim(ξ) × dim(p)
  const dim = multiply(node.killing.vector.dim, node.momentum.dim);
  // Q = ξ^μ p_μ is a full contraction — no free indices remain (scalar).
  return { dim, freeIndices: new Map() };
}
