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
