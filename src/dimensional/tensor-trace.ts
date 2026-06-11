/**
 * TensorTraceNode — structural tensor-trace operator for rank-2 tensors.
 *
 * Per `docs/architecture/archive/v0.7-be-x-reencoding-design-note.md` §"BE-13 —
 * TensorTraceNode for the Einstein trace". First of four BE-X re-encoding
 * primitives planned for the v0.7 sprint.
 *
 * Represents the contraction
 *
 *     T = T^μ_μ = g^μν T_μν
 *
 * where `g^μν` is the inverse metric (upper-upper, dimensionless) and
 * `T_μν` is a rank-2 lower-lower tensor (e.g., the stress-energy tensor).
 * The result is a scalar whose SI dimension equals the component dimension
 * of the tensor being traced (the inverse metric is dimensionless, so it
 * passes the tensor's dimension through unchanged).
 *
 * This node is a PREDICATE node in the same family as
 * `EinsteinFieldEquationNode` and `KleinGordonEquationNode` — not a
 * value-producing expression. It documents the structural relationship
 * "this scalar arose by contracting a rank-2 tensor with the inverse
 * metric" so that downstream symbolic consumers (bridge cross-validators,
 * dimensional-signature catalog round-trips) can inspect the trace
 * structure rather than treating it as an opaque stub symbol.
 *
 * @module dimensional/tensor-trace
 */

import type { Dimension } from './types.js';
import type { MetricTensorNode } from './metric-validators.js';
import {
  validateComponentDimension,
  validateTensorSymmetry,
} from './field-equation-helpers.js';

// ---------------------------------------------------------------------------
// TracableTensorNode — minimal structural interface
// ---------------------------------------------------------------------------

/**
 * Minimal interface for rank-2 tensors that can be traced via
 * `TensorTraceNode`. Any rank-2 lower-lower node satisfies this:
 * `TensorSymbolNode` (with `.dim` aliased to `componentDim` by callers),
 * `StressEnergyTensorNode`, or custom rank-2 nodes.
 *
 * Fields:
 *   - `indices`      — Exactly two index slots; each must carry `variance: 'lower'`.
 *   - `componentDim` — SI dimension of a single component of the tensor.
 *   - `symmetry`     — Symmetry tag (`'symmetric'`, `'antisymmetric'`,
 *                      `'none'`, or other string). Checked to be
 *                      `'symmetric'` by `validateTensorTrace`'s default
 *                      predicate (physical stress-energy and Ricci tensors
 *                      are symmetric; caller may override via the options
 *                      argument if tracing a non-symmetric rank-2 tensor).
 *
 * @public
 */
export interface TracableTensorNode {
  readonly indices: ReadonlyArray<{ readonly variance: string }>;
  readonly componentDim: Dimension;
  readonly symmetry: string;
}

// ---------------------------------------------------------------------------
// TensorTraceNode
// ---------------------------------------------------------------------------

/**
 * AST node for the trace operation `T = g^μν T_μν`.
 *
 * Fields:
 *   - `tensor`  — The rank-2 lower-lower tensor being traced (e.g., `T_μν`).
 *   - `metric`  — The inverse metric `g^μν` (rank-2 upper-upper,
 *                 dimensionless) used for the contraction.
 *
 * The resulting scalar has `dim = tensor.componentDim` (the inverse metric
 * is dimensionless, so the trace carries the tensor's component dimension
 * unchanged).
 *
 * @public
 */
export interface TensorTraceNode {
  /** Discriminator: 'tensor-trace'. */
  readonly kind: 'tensor-trace';
  /** The rank-2 lower-lower tensor being traced. */
  readonly tensor: TracableTensorNode;
  /** The inverse metric `g^μν` supplying the upper-upper contraction. */
  readonly metric: MetricTensorNode;
}

// ---------------------------------------------------------------------------
// TensorTraceValidationResult
// ---------------------------------------------------------------------------

/**
 * Result of validating a `TensorTraceNode`. The trace collapses all
 * free indices — the result is a scalar.
 *
 * @public
 */
export interface TensorTraceValidationResult {
  /** SI dimension of the resulting scalar. Equals `tensor.componentDim`. */
  readonly dim: Dimension;
  /** Empty free-indices map (trace is rank-0). */
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

// ---------------------------------------------------------------------------
// validateTensorTrace
// ---------------------------------------------------------------------------

/**
 * Options for `validateTensorTrace`.
 *
 * @public
 */
export interface TensorTraceOptions {
  /**
   * Expected symmetry of the tensor being traced. Defaults to
   * `'symmetric'` (appropriate for T_μν, R_μν, G_μν, etc.). Pass a
   * different value if tracing a non-symmetric rank-2 tensor.
   */
  readonly expectedTensorSymmetry?: string;
}

/** The SI dimension of a dimensionless metric g^μν: all zeros. */
const DIMENSIONLESS_DIM: Dimension = {
  L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
};

/**
 * Validate a `tensor-trace` node.
 *
 * Three structural predicates (using the field-equation-helpers pattern):
 *
 *   1. **Index variance** — `tensor.indices` must be exactly 2, each
 *      `variance === 'lower'` (rank-2 lower-lower). Error keyword: `"index"`.
 *   2. **Metric variance** — `metric.indices` must be exactly 2, each
 *      `variance === 'upper'` (rank-2 upper-upper inverse form). The metric
 *      must be dimensionless; error keyword: `"dimension"`.
 *   3. **Tensor symmetry** — `tensor.symmetry` must equal the expected
 *      symmetry (default `'symmetric'`). Error keyword: `"symmetry"`.
 *
 * Returns the scalar result dimension (`tensor.componentDim`) with an
 * empty `freeIndices` map.
 *
 * Errors carry the keywords `"index"`, `"dimension"`, or `"symmetry"` per
 * the field-equation-helpers error-vocabulary convention, so consumer
 * pattern-matching on those strings stays consistent across equation nodes.
 *
 * @public
 */
export function validateTensorTrace(
  node: TensorTraceNode,
  options: TensorTraceOptions = {},
): TensorTraceValidationResult {
  const expectedSymmetry = options.expectedTensorSymmetry ?? 'symmetric';

  // Predicate 1a: tensor must be rank-2.
  if (node.tensor.indices.length !== 2) {
    throw new Error(
      `TensorTraceNode: index rank error — tensor must be rank-2 ` +
      `(got rank-${node.tensor.indices.length}). ` +
      `Only rank-2 lower-lower tensors can be traced via g^μν contraction.`,
    );
  }

  // Predicate 1b: both tensor index slots must be lower.
  for (let i = 0; i < node.tensor.indices.length; i++) {
    const idx = node.tensor.indices[i];
    if (idx.variance !== 'lower') {
      throw new Error(
        `TensorTraceNode: index variance error — tensor.indices[${i}] ` +
        `must have variance 'lower' (got '${idx.variance}'). ` +
        `The trace g^μν T_μν requires T to be lower-lower.`,
      );
    }
  }

  // Predicate 2a: metric must be rank-2.
  if (node.metric.indices.length !== 2) {
    throw new Error(
      `TensorTraceNode: index rank error — metric must be rank-2 ` +
      `(got rank-${node.metric.indices.length}).`,
    );
  }

  // Predicate 2b: both metric index slots must be upper.
  for (let i = 0; i < node.metric.indices.length; i++) {
    const idx = node.metric.indices[i];
    if (idx.variance !== 'upper') {
      throw new Error(
        `TensorTraceNode: index variance error — metric.indices[${i}] ` +
        `must have variance 'upper' (got '${idx.variance}'). ` +
        `The inverse metric g^μν must be upper-upper for the contraction.`,
      );
    }
  }

  // Predicate 2c: the inverse metric must be dimensionless.
  validateComponentDimension(
    'TensorTraceNode',
    'metric (g^μν) dim',
    node.metric.dim,
    DIMENSIONLESS_DIM,
    'The inverse metric g^μν is dimensionless; the trace dimension equals the tensor component dimension.',
  );

  // Predicate 3: tensor symmetry check.
  validateTensorSymmetry(
    'TensorTraceNode',
    'tensor',
    node.tensor.symmetry,
    expectedSymmetry,
    `Physical rank-2 tensors eligible for Einstein-trace contraction are ${expectedSymmetry}.`,
  );

  return {
    dim: node.tensor.componentDim,
    freeIndices: new Map(),
  };
}
