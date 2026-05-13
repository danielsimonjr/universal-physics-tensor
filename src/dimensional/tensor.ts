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
import { DIMENSIONLESS } from './types.js';
import { multiply } from './algebra.js';
// Type-only import of ExprNode from validator.ts. The import is erased at
// runtime, so the file-level cycle (validator.ts imports tensor types here,
// and this module references ExprNode for TensorProductNode.args) has no
// runtime cost — TypeScript handles it via `import type`.
import type { ExprNode } from './validator.js';
import {
  DuplicateIndexLabelError,
  IndexLabelCollisionError,
  VarianceMismatchError,
} from './errors.js';

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
  /**
   * Semantic classification of the tensor, used by v0.3.0+ work
   * (e.g., partial-derivative dispatch). Defaults to 'field' when
   * omitted. v0.2.0 treats this as structural metadata only —
   * no validator behavior depends on it. Per Part-VII §VII.8.
   */
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
 * Throws `DuplicateIndexLabelError` if the indices list contains the same
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
      throw new DuplicateIndexLabelError(node.name, idx.label);
    }
    freeIndices.set(idx.label, {
      upper: idx.variance === 'upper' ? 1 : 0,
      lower: idx.variance === 'lower' ? 1 : 0,
    });
  }
  return { dim: node.dim, freeIndices };
}

/**
 * Result of a tensor-product contraction over a set of operands.
 *
 * Re-exported as part of v0.2.0's TensorJS forward-compatibility contract
 * (§14.2 of v0.2.0-Design.md). The future mathjs / TensorJS numerical
 * backend will call `computeContraction` with the same operand list, pair
 * the returned `contractionPairs` with its own einsum-pattern compiler,
 * and multiply concrete numerical tensors using its dimensions.
 */
export interface ContractionResult {
  /** Resulting per-component dimension (product of operand dims). */
  readonly dim: Dimension;
  /** Free indices remaining after Einstein contraction. */
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
  /** Labels that were contracted (one upper + one lower pair per entry). */
  readonly contractionPairs: ReadonlyArray<{ label: string }>;
}

/**
 * Per-child validation result the caller of `computeContraction` must
 * supply through the `validateChild` callback. Mirrors the local-Map
 * convention pioneered by `validateTensorSymbol`: the child reports its
 * inferred dimension plus a map of label → {upper, lower} counts that
 * `computeContraction` merges and reduces.
 */
export interface ChildValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Pure function that computes the dimension, free-indices map, and
 * contraction pairs for a tensor-product over the given operands.
 *
 * The function is pure and module-cycle-free: it does NOT import
 * `validator.ts`. Recursion is injected via the `validateChild` callback
 * — the caller (typically validator.ts's `infer()` dispatch) supplies a
 * resolver that returns `{dim, freeIndices}` for each child node. The
 * caller is responsible for handling all `ExprNode` kinds in its callback
 * (scalars, tensor-symbols, nested tensor-products, etc.).
 *
 * Critically, the per-child freeIndices maps returned by `validateChild`
 * MUST be local to that child (not shared mutable state). This is what
 * makes nested tensor-products safe: an inner tensor-product reports its
 * post-contraction residual free indices as a local map, and the outer
 * call merges those without ever touching shared accumulator state.
 *
 * Re-exported for the future mathjs backend per v0.2.0-Design.md §14.2.
 *
 * **v0.2.0 limitation — implicit identity metric.** The contraction
 * mechanism here assumes one upper index `μ` paired with one lower index
 * `μ` annihilate (Kronecker delta convention). v0.3.0's metric layer
 * will introduce explicit g_μν / g^μν for raising and lowering — at
 * which point this function's hard-coded pairing rule must generalize
 * to "find labels with mismatched variance, raise/lower via the metric,
 * then contract." Forward-compat callers should NOT assume the v0.2.0
 * rule is permanent.
 *
 * Throws:
 *   - IndexLabelCollisionError if any label appears > 2 times total.
 *   - VarianceMismatchError if a label appears twice with same variance.
 */
export function computeContraction(
  args: ReadonlyArray<ExprNode>,
  validateChild: (node: ExprNode) => ChildValidationResult,
): ContractionResult {
  // Step A: Recursively validate each arg via the injected callback,
  // accumulating product-dimension and merging local freeIndices maps.
  let dim: Dimension = DIMENSIONLESS;
  const merged = new Map<string, { upper: number; lower: number }>();

  for (const arg of args) {
    const child = validateChild(arg);
    dim = multiply(dim, child.dim);
    for (const [label, counts] of child.freeIndices) {
      const existing = merged.get(label) ?? { upper: 0, lower: 0 };
      merged.set(label, {
        upper: existing.upper + counts.upper,
        lower: existing.lower + counts.lower,
      });
    }
  }

  // Step B: Validate label counts (≤2) and pair upper/lower for contraction.
  const contractionPairs: { label: string }[] = [];
  for (const [label, counts] of merged) {
    const total = counts.upper + counts.lower;
    if (total > 2) {
      throw new IndexLabelCollisionError(label, total);
    }
    if (total === 2 && (counts.upper === 0 || counts.lower === 0)) {
      const variance = counts.upper === 2 ? 'upper' : 'lower';
      throw new VarianceMismatchError(label, variance);
    }
    if (counts.upper > 0 && counts.lower > 0) {
      const pairs = Math.min(counts.upper, counts.lower);
      for (let i = 0; i < pairs; i++) contractionPairs.push({ label });
      merged.set(label, {
        upper: counts.upper - pairs,
        lower: counts.lower - pairs,
      });
    }
  }

  // Step C: Drop fully-contracted labels (both counts zero) from the
  // outgoing freeIndices map so callers don't see phantom dummies.
  for (const [label, counts] of Array.from(merged.entries())) {
    if (counts.upper === 0 && counts.lower === 0) merged.delete(label);
  }

  return { dim, freeIndices: merged, contractionPairs };
}

/** Construct a tensor-symbol node. */
export function tsym(
  name: string,
  indices: ReadonlyArray<TensorIndex>,
  dim: Dimension,
  role?: Role,
): TensorSymbolNode {
  return role === undefined
    ? { kind: 'tensor-symbol', name, indices, dim }
    : { kind: 'tensor-symbol', name, indices, dim, role };
}

/** Scale a tensor by a scalar coefficient. Returns a tensor-product. */
export function scale(scalar: ExprNode, tensor: ExprNode): TensorProductNode {
  return { kind: 'tensor-product', args: [scalar, tensor] };
}

/** Contract any number of operands. Returns a tensor-product. */
export function contract(...args: ExprNode[]): TensorProductNode {
  return { kind: 'tensor-product', args };
}

/** Tensor sum via op '+'. Validator enforces matching free indices. */
export function tsum(...args: ExprNode[]): ExprNode {
  return { kind: 'op', op: '+', args };
}
