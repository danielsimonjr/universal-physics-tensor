/**
 * Per-kind validation for v0.3.0 metric-layer AST nodes.
 *
 * Mirrors the pattern of `validateTensorSymbol` in tensor.ts: each
 * validator is a pure function returning a local `{dim, freeIndices}`
 * carrier that validator.ts merges into its InferContext accumulator.
 *
 * Per docs/specification/Part-VIII-Metric-Layer.md §VIII.2-§VIII.4.
 *
 * @module dimensional/metric-validators
 */

import type { Dimension } from './types.js';
import type { Variance, Role, TensorIndex } from './tensor.js';
import {
  InvalidMetricRankError,
  MetricSignatureError,
  InvalidKroneckerRankError,
  KroneckerVarianceError,
} from './errors.js';

export interface MetricTensorNode {
  readonly kind: 'metric-tensor';
  readonly name: string;
  readonly indices: ReadonlyArray<TensorIndex>;
  readonly signature: string;
  readonly dim: Dimension;
}

export interface MetricTensorValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/** Parse / validate a metric signature string like '+,-,-,-' or '+,+,+'. */
function isValidSignature(signature: string): boolean {
  if (signature.length === 0) return false;
  const parts = signature.split(',');
  return parts.every((p) => p === '+' || p === '-');
}

/**
 * Validate a metric-tensor node. Rejects:
 *   - rank ≠ 2 → InvalidMetricRankError
 *   - mixed-variance indices → MetricSignatureError
 *   - duplicate index labels (e.g., g_μμ) → MetricSignatureError
 *   - malformed/empty signature string → MetricSignatureError
 *
 * Per Part-VIII §VIII.2.
 */
export function validateMetricTensor(
  node: MetricTensorNode,
): MetricTensorValidationResult {
  if (node.indices.length !== 2) {
    throw new InvalidMetricRankError(node.name, node.indices.length);
  }
  const [a, b] = node.indices;
  if (a.variance !== b.variance) {
    throw new MetricSignatureError(
      node.name,
      `mixed-variance indices ('${a.variance}' vs '${b.variance}') are not allowed; ` +
        `use raise() / lower() helpers to traverse variance, or kronecker-delta for δ^μ_ν`,
    );
  }
  if (a.label === b.label) {
    throw new MetricSignatureError(
      node.name,
      `duplicate index label '${a.label}'; a metric's two indices must have distinct labels`,
    );
  }
  if (!isValidSignature(node.signature)) {
    throw new MetricSignatureError(
      node.name,
      `signature '${node.signature}' is malformed; expected '+,-,-,-' or '+,+,+' format`,
    );
  }
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  for (const idx of node.indices) {
    freeIndices.set(idx.label, {
      upper: idx.variance === 'upper' ? 1 : 0,
      lower: idx.variance === 'lower' ? 1 : 0,
    });
  }
  return { dim: node.dim, freeIndices };
}

export interface KroneckerDeltaNode {
  readonly kind: 'kronecker-delta';
  readonly indices: ReadonlyArray<TensorIndex>;
  readonly dim: Dimension;
}

export interface KroneckerDeltaValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a kronecker-delta node. Rejects:
 *   - rank ≠ 2 → InvalidKroneckerRankError
 *   - same-variance indices (both upper or both lower) → KroneckerVarianceError
 *
 * Per Part-VIII §VIII.3.
 */
export function validateKroneckerDelta(
  node: KroneckerDeltaNode,
): KroneckerDeltaValidationResult {
  if (node.indices.length !== 2) {
    throw new InvalidKroneckerRankError(node.indices.length);
  }
  const [a, b] = node.indices;
  if (a.variance === b.variance) {
    throw new KroneckerVarianceError(a.variance);
  }
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  for (const idx of node.indices) {
    freeIndices.set(idx.label, {
      upper: idx.variance === 'upper' ? 1 : 0,
      lower: idx.variance === 'lower' ? 1 : 0,
    });
  }
  return { dim: node.dim, freeIndices };
}
