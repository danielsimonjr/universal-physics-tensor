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
