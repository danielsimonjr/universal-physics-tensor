/**
 * User-facing constructors and ergonomic helpers for v0.3.0 metric-layer
 * AST nodes. The substantive logic (alpha-conversion) lives in raise() /
 * lower() (added in Task 8 — this file's initial revision contains only
 * the trivial constructors).
 *
 * Per docs/specification/Part-VIII-Metric-Layer.md §VIII.5 (raise/lower
 * contract) and §VIII.1 (grammar).
 *
 * @module dimensional/metric
 */

import type { Dimension } from './types.js';
import { DIMENSIONLESS } from './types.js';
import type { TensorIndex } from './tensor.js';
import type {
  MetricTensorNode,
  KroneckerDeltaNode,
  TensorPartialDerivativeNode,
  CovariantIndex,
} from './metric-validators.js';
import type { ExprNode } from './validator.js';

/** Construct a metric-tensor node. */
export function metric(
  name: string,
  indices: ReadonlyArray<TensorIndex>,
  dim: Dimension,
  signature: string,
): MetricTensorNode {
  return { kind: 'metric-tensor', name, indices, signature, dim };
}

/**
 * Construct a Kronecker delta δ^upperLabel_lowerLabel.
 * Parameter order: upper first, lower second (canonical δ^μ_ν).
 * dim defaults to DIMENSIONLESS (Design §13 Q3 locked).
 */
export function kronecker(
  upperLabel: string,
  lowerLabel: string,
  dim: Dimension = DIMENSIONLESS,
): KroneckerDeltaNode {
  return {
    kind: 'kronecker-delta',
    indices: [
      { label: upperLabel, variance: 'upper' },
      { label: lowerLabel, variance: 'lower' },
    ],
    dim,
  };
}

/**
 * Construct a tensor-partial-derivative. wrtIndex.variance MUST be 'lower'
 * — TypeScript enforces this via the CovariantIndex type.
 */
export function pderiv(
  of: ExprNode,
  wrt: ExprNode,
  wrtIndex: CovariantIndex,
): TensorPartialDerivativeNode {
  return { kind: 'tensor-partial-derivative', of, wrt, wrtIndex };
}
