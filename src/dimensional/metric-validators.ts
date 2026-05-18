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
import { divide } from './algebra.js';
import {
  InvalidMetricRankError,
  MetricSignatureError,
  InvalidKroneckerRankError,
  KroneckerVarianceError,
  PartialDerivativeIndexVarianceError,
  IndexLabelCollisionError,
} from './errors.js';

export interface MetricTensorNode {
  readonly kind: 'metric-tensor';
  readonly name: string;
  readonly indices: ReadonlyArray<TensorIndex>;
  readonly signature: string;
  readonly dim: Dimension;
  /**
   * v0.4.0 numerical-lowering hint: which strategy the numerical engine uses
   * to compute ∂g for Christoffel / ∇_μ. Defaults to 'computed' (use the
   * engine's AD on the metric function). 'zero' = constant metric (∂g=0,
   * Γ=0, ∇_μ=∂_μ). 'supplied' = user provides ∂g components in
   * inputs.metricDerivatives. See v0.4.0-Design.md §4 and §7.
   */
  readonly derivativeStrategy?: 'computed' | 'zero' | 'supplied';
}

/**
 * Result carrier for validateMetricTensor.
 * @public — exported for downstream consumers who type their own validators.
 */
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
 * Symbolic structural check for InverseMetricInconsistencyWarning: a
 * both-lower metric and a both-upper metric should have all-lower and
 * all-upper index variance respectively. Returns a warning note when the
 * structure is wrong, else null. The numerical residual check lives in
 * src/numerical/metric-inverse.ts.
 */
export function checkInverseMetricStructure(
  gLower: MetricTensorNode,
  gUpper: MetricTensorNode,
): string | null {
  const lowerOk = gLower.indices.every((i) => i.variance === 'lower');
  const upperOk = gUpper.indices.every((i) => i.variance === 'upper');
  if (!lowerOk || !upperOk) {
    return `InverseMetricInconsistencyWarning: "${gLower.name}" / "${gUpper.name}" `
      + `do not form a lower/upper inverse pair`;
  }
  return null;
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

/**
 * Result carrier for validateKroneckerDelta.
 * @public — exported for downstream consumers who type their own validators.
 */
export interface KroneckerDeltaValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a kronecker-delta node. Rejects:
 *   - rank ≠ 2 → InvalidKroneckerRankError
 *   - same-variance indices (both upper or both lower) → KroneckerVarianceError
 *   - duplicate index labels (e.g., δ^μ_μ, a trace) → IndexLabelCollisionError
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
  if (a.label === b.label) {
    // δ^μ_μ is a trace (a contraction), not a free-index expression. v0.3.0
    // doesn't yet auto-evaluate kronecker traces; reject as a label collision
    // to surface the ambiguity to the caller (same semantic as v0.2.0
    // tensor-symbol duplicate-label rejection).
    throw new IndexLabelCollisionError(a.label, 2, ['kronecker-delta-trace']);
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

export interface CovariantIndex {
  readonly label: string;
  readonly variance: 'lower';
}

/**
 * ExprNode-like — uses `unknown` for `of`/`wrt` because metric-validators.ts
 * MUST NOT import from validator.ts (would create a module cycle). The
 * validator's case arm threads a callback that knows the real ExprNode type.
 */
export interface TensorPartialDerivativeNode {
  readonly kind: 'tensor-partial-derivative';
  readonly of: unknown;
  readonly wrt: unknown;
  readonly wrtIndex: CovariantIndex;
}

/**
 * Result carrier for validatePartialDerivative.
 * @public — exported for downstream consumers who type their own validators.
 */
export interface PartialDerivativeValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
  readonly role?: Role;
}

/**
 * Per-child validation result the caller supplies via the recursion
 * callback. Mirrors `ChildValidationResult` in tensor.ts — same shape,
 * different home so this module stays decoupled from tensor.ts.
 */
export interface PartialDerivativeChildResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
  readonly role?: Role;
}

/**
 * Validate a tensor-partial-derivative node.
 *
 * Pure-function module-cycle-free pattern (matches `computeContraction`):
 * recursion is injected via the `validateChild` callback. The caller
 * (validator.ts's `infer()` dispatch) supplies a resolver that returns
 * `{dim, freeIndices, role?}` for each child (the `of` and `wrt` operands).
 *
 * Per Part-VIII §VIII.4. Throws:
 *   - PartialDerivativeIndexVarianceError if wrtIndex.variance !== 'lower'
 *   - IndexLabelCollisionError if wrtIndex.label collides with `of`'s free indices
 */
export function validatePartialDerivative(
  node: TensorPartialDerivativeNode,
  validateChild: (child: unknown) => PartialDerivativeChildResult,
): PartialDerivativeValidationResult {
  if (node.wrtIndex.variance !== 'lower') {
    throw new PartialDerivativeIndexVarianceError(node.wrtIndex.label);
  }
  const ofResult = validateChild(node.of);
  const wrtResult = validateChild(node.wrt);

  // Per §VIII.4: discard wrt's own free indices (the operator's index is
  // wrtIndex, not wrt's own indices).
  if (ofResult.freeIndices.has(node.wrtIndex.label)) {
    throw new IndexLabelCollisionError(node.wrtIndex.label, 2, [
      'tensor-partial-derivative.wrtIndex',
      'of.freeIndices',
    ]);
  }

  // Output freeIndices = of.freeIndices ∪ {wrtIndex.label: lower}.
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  for (const [label, counts] of ofResult.freeIndices) {
    freeIndices.set(label, counts);
  }
  freeIndices.set(node.wrtIndex.label, { upper: 0, lower: 1 });

  // Output dim = divide(of.dim, wrt.dim).
  const dim = divide(ofResult.dim, wrtResult.dim);

  // Role: pass through of.role if present; default to 'field' otherwise
  // (Design §13 Q1 locked decision).
  const role: Role = ofResult.role ?? 'field';

  return { dim, freeIndices, role };
}
