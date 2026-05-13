/**
 * UPT error hierarchy. All UPT-source errors subclass UPTError so
 * downstream consumers (mathjs, threejs, TensorJS) can discriminate
 * with `err instanceof UPTError`.
 *
 * @module dimensional/errors
 */

import { Dimension } from './types.js';

/** Base class for all UPT-source errors. */
export class UPTError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UPTError';
    // Restore prototype chain (needed for instanceof after ES5 transpilation).
    Object.setPrototypeOf(this, UPTError.prototype);
  }
}

/**
 * Thrown by add/sub and equation-level checks when dimensions disagree.
 * (Moved from src/dimensional/algebra.ts as part of the v0.2.0 UPTError
 * refactor. Behavior unchanged.)
 */
export class DimensionMismatchError extends UPTError {
  public readonly expected: Dimension;
  public readonly actual: Dimension;
  constructor(message: string, expected: Dimension, actual: Dimension) {
    super(message);
    this.name = 'DimensionMismatchError';
    this.expected = expected;
    this.actual = actual;
    Object.setPrototypeOf(this, DimensionMismatchError.prototype);
  }
}

/**
 * Thrown when a tensor-symbol's indices list contains the same label
 * more than once (e.g., T^μ_μ_μ). Per Part-VII §VII.4.
 *
 * NOTE: this error fires on DECLARATION-TIME duplicates within a single
 * tensor-symbol's indices list. Those indices are *free*, not "dummy"
 * (a dummy index in tensor calculus is one that is summed over). The
 * earlier name `RepeatedDummyLabelError` was a misnomer; that alias is
 * preserved below for backward compatibility but is @deprecated.
 */
export class DuplicateIndexLabelError extends UPTError {
  public readonly tensorName: string;
  public readonly label: string;
  constructor(tensorName: string, label: string) {
    super(
      `Tensor '${tensorName}' has repeated index label '${label}'. ` +
      `A label may appear at most twice (once upper, once lower) within ` +
      `a single tensor-symbol's indices list.`,
    );
    this.name = 'DuplicateIndexLabelError';
    this.tensorName = tensorName;
    this.label = label;
    Object.setPrototypeOf(this, DuplicateIndexLabelError.prototype);
  }
}

/**
 * @deprecated Renamed to {@link DuplicateIndexLabelError}. The old name
 * will be removed in v0.3.0. v0.2.0 introduced the error with a misnomer
 * ("dummy" implies summed-over in tensor calculus; this error fires on
 * declaration-time duplicates, which are free indices).
 */
export const RepeatedDummyLabelError = DuplicateIndexLabelError;

/**
 * Thrown when an index label appears more than twice across a
 * tensor-product's operands. Einstein contraction requires exactly two
 * occurrences (one upper + one lower) per dummy label. Per Part-VII §VII.4.
 */
export class IndexLabelCollisionError extends UPTError {
  public readonly label: string;
  public readonly totalCount: number;
  /**
   * Tensor names that contributed occurrences of the colliding label,
   * if the caller has them available. May be undefined for callers that
   * don't track per-operand provenance.
   */
  public readonly sources?: ReadonlyArray<string>;
  constructor(
    label: string,
    totalCount: number,
    sources?: ReadonlyArray<string>,
  ) {
    const sourceClause =
      sources && sources.length > 0
        ? ` (sources: ${sources.join(', ')})`
        : '';
    super(
      `Index label '${label}' appears ${totalCount} times across the ` +
      `tensor-product operands${sourceClause} (max allowed: 2 for Einstein ` +
      `contraction). Rename one of the offending indices.`,
    );
    this.name = 'IndexLabelCollisionError';
    this.label = label;
    this.totalCount = totalCount;
    this.sources = sources;
    Object.setPrototypeOf(this, IndexLabelCollisionError.prototype);
  }
}

/**
 * Thrown when an index label appears twice in a tensor-product but both
 * occurrences share the same variance (both upper or both lower). v0.2.0
 * has no metric tensor available to raise/lower indices, so such a
 * contraction is rejected at validation time. Per Part-VII §VII.4.
 */
export class VarianceMismatchError extends UPTError {
  public readonly label: string;
  public readonly variance: 'upper' | 'lower';
  constructor(label: string, variance: 'upper' | 'lower') {
    super(
      `Index label '${label}' appears twice but both with variance '${variance}'. ` +
      `Einstein contraction requires one upper and one lower; v0.2.0 has no ` +
      `metric to raise/lower indices, so this contraction is rejected.`,
    );
    this.name = 'VarianceMismatchError';
    this.label = label;
    this.variance = variance;
    Object.setPrototypeOf(this, VarianceMismatchError.prototype);
  }
}

/**
 * Thrown by `op '*'` / `'/'` / `'^'` when an operand carries non-empty
 * freeIndices. Scalar operators in v0.2.0 are strict: any tensor-valued
 * operand must instead pass through `tensor-product`. Per Part-VII §VII.5
 * (op-tensor boundary rules).
 */
export class TensorInScalarOpError extends UPTError {
  public readonly op: string;
  constructor(op: string) {
    super(
      `Operator '${op}' is scalar-only; received a tensor argument with ` +
      `non-empty freeIndices. Use 'tensor-product' for tensor multiplication.`,
    );
    this.name = 'TensorInScalarOpError';
    this.op = op;
    Object.setPrototypeOf(this, TensorInScalarOpError.prototype);
  }
}

/**
 * Thrown by `op '+'` / `'-'` when the operand freeIndices maps differ.
 * Addition / subtraction across tensors requires identical free-index
 * signatures (same labels, same per-label upper/lower counts). Per
 * Part-VII §VII.5.
 */
export class FreeIndexMismatchError extends UPTError {
  constructor(message: string) {
    super(message);
    this.name = 'FreeIndexMismatchError';
    Object.setPrototypeOf(this, FreeIndexMismatchError.prototype);
  }
}

/**
 * Thrown by the validator's tensor-product child resolver when a non-tensor
 * operand to a `tensor-product` fails dimension inference. Subclassing
 * UPTError (rather than throwing a plain `Error`) preserves the §14.7
 * forward-compat invariant that downstream consumers can discriminate
 * UPT-source errors with `err instanceof UPTError`.
 */
export class TensorProductChildInferenceError extends UPTError {
  constructor(message: string) {
    super(message);
    this.name = 'TensorProductChildInferenceError';
    Object.setPrototypeOf(this, TensorProductChildInferenceError.prototype);
  }
}
