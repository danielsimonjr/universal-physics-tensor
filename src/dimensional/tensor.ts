/**
 * Tensor AST node types and helpers — v0.2.0 algebra layer.
 *
 * Adds the two new ExprNode discriminated-union variants:
 *   - 'tensor-symbol': a named tensor with variance-typed indices
 *   - 'tensor-product': Einstein-summation product over tensor and scalar operands
 *
 * Per docs/specification/Part-VII-Tensor-Algebra.md §VII.1 and §VII.4.
 *
 * @module dimensional/tensor
 */

import type { Dimension } from './types.js';
// Type-only import of ExprNode from validator.ts. The import is erased at
// runtime, so the file-level cycle (validator.ts imports tensor types here,
// and this module references ExprNode for TensorProductNode.args) has no
// runtime cost — TypeScript handles it via `import type`.
import type { ExprNode } from './validator.js';
import { RepeatedDummyLabelError } from './errors.js';

export type Variance = 'upper' | 'lower';
export type Role = 'coordinate' | 'field' | 'constant';

export interface TensorIndex {
  readonly label: string;
  readonly variance: Variance;
}

export interface TensorSymbolNode {
  readonly kind: 'tensor-symbol';
  readonly name: string;
  readonly indices: ReadonlyArray<TensorIndex>;
  readonly dim: Dimension;
  readonly role?: Role;
}

export interface TensorProductNode {
  readonly kind: 'tensor-product';
  readonly args: ReadonlyArray<ExprNode>;
}

/**
 * The kind tags this module contributes to the ExprNode union. Used by
 * validator.ts to compose the full discriminated union via re-export.
 */
export type TensorExprNode = TensorSymbolNode | TensorProductNode;

/**
 * Result shape returned by `validateTensorSymbol`. A minimal carrier for
 * the inferred per-component dimension plus the free-indices map built
 * from the declared indices. The validator's `infer()` adapts this back
 * into its `Dimension | null` return shape and merges `freeIndices` into
 * the outer accumulator.
 */
export interface TensorSymbolValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a tensor-symbol node. Builds the freeIndices map from the
 * declared indices, with one upper / one lower count per label.
 *
 * Throws `RepeatedDummyLabelError` if the indices list contains the same
 * label more than once (e.g., T^μ_μ_μ). Per Part-VII §VII.4
 * (repeated-dummy-label-in-tensor-symbol-rejected TENSOR-RULE).
 *
 * The function is pure: no I/O, no shared state, total over its input
 * (modulo the documented throw). Callers (validator.ts `infer()`) thread
 * the returned freeIndices map up into their accumulator.
 */
export function validateTensorSymbol(
  node: TensorSymbolNode,
): TensorSymbolValidationResult {
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  for (const idx of node.indices) {
    if (freeIndices.has(idx.label)) {
      throw new RepeatedDummyLabelError(node.name, idx.label);
    }
    freeIndices.set(idx.label, {
      upper: idx.variance === 'upper' ? 1 : 0,
      lower: idx.variance === 'lower' ? 1 : 0,
    });
  }
  return { dim: node.dim, freeIndices };
}
