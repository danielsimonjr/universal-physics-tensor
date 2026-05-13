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
 */
export class RepeatedDummyLabelError extends UPTError {
  public readonly tensorName: string;
  public readonly label: string;
  constructor(tensorName: string, label: string) {
    super(
      `Tensor '${tensorName}' has repeated index label '${label}'. ` +
      `A label may appear at most twice (once upper, once lower) within ` +
      `a single tensor-symbol's indices list.`,
    );
    this.name = 'RepeatedDummyLabelError';
    this.tensorName = tensorName;
    this.label = label;
    Object.setPrototypeOf(this, RepeatedDummyLabelError.prototype);
  }
}

/**
 * Thrown when an index label appears more than twice across a
 * tensor-product's operands. Einstein contraction requires exactly two
 * occurrences (one upper + one lower) per dummy label. Per Part-VII §VII.4.
 */
export class IndexLabelCollisionError extends UPTError {
  public readonly label: string;
  public readonly totalCount: number;
  constructor(label: string, totalCount: number) {
    super(
      `Index label '${label}' appears ${totalCount} times across the ` +
      `tensor-product operands (max allowed: 2 for Einstein contraction). ` +
      `Rename one of the offending indices.`,
    );
    this.name = 'IndexLabelCollisionError';
    this.label = label;
    this.totalCount = totalCount;
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
