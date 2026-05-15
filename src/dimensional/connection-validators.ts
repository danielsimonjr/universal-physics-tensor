/**
 * Per-kind validation for v0.4.0 connection-layer AST nodes.
 *
 * Mirrors the pattern of `metric-validators.ts`: each validator is a pure
 * function returning a local `{dim, freeIndices, role?}` carrier that
 * validator.ts merges into its InferContext accumulator.
 *
 * Per docs/specification/Part-IX-Connection-Layer.md (to be written in
 * Task 18) and v0.4.0-Design.md §4 + §7.
 *
 * @module dimensional/connection-validators
 */

import type { Dimension } from './types.js';
import type { Role } from './tensor.js';
import { divide } from './algebra.js';
import type {
  MetricTensorNode,
  CovariantIndex,
  PartialDerivativeChildResult,
} from './metric-validators.js';
import {
  PartialDerivativeIndexVarianceError,
  MetricSignatureError,
} from './errors.js';

/**
 * ExprNode-like — uses `unknown` for `of`/`wrt` because connection-validators.ts
 * MUST NOT import from validator.ts (module cycle). The validator's case arm
 * threads a callback that knows the real ExprNode type.
 */
export interface CovariantDerivativeNode {
  readonly kind: 'covariant-derivative';
  readonly of: unknown;
  readonly wrt: unknown;
  readonly wrtIndex: CovariantIndex;
  readonly gLower: MetricTensorNode;
  readonly gInverse: MetricTensorNode;
}

export interface CovariantDerivativeValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
  readonly role?: Role;
}

/**
 * Validate a covariant-derivative node. Pure-function module-cycle-free
 * pattern (matches validatePartialDerivative). Recursion via the
 * `validateChild` callback supplied by the caller (validator.ts's
 * `infer()` dispatch).
 *
 * Throws:
 *   - PartialDerivativeIndexVarianceError if wrtIndex.variance !== 'lower'
 *   - MetricSignatureError if gLower is not both-lower or gInverse is not both-upper
 *
 * Note: the gLower / gInverse free indices are CONSUMED INTERNALLY by the
 * Christoffel formula's contractions and do NOT propagate upward. The
 * output freeIndices is just `of.freeIndices ∪ {wrtIndex.label: lower}`
 * (same structural rule as tensor-partial-derivative).
 */
export function validateCovariantDerivative(
  node: CovariantDerivativeNode,
  validateChild: (child: unknown) => PartialDerivativeChildResult,
): CovariantDerivativeValidationResult {
  if (node.wrtIndex.variance !== 'lower') {
    throw new PartialDerivativeIndexVarianceError(node.wrtIndex.label);
  }
  if (
    node.gLower.indices[0].variance !== 'lower' ||
    node.gLower.indices[1].variance !== 'lower'
  ) {
    throw new MetricSignatureError(
      node.gLower.name,
      `covariant-derivative requires gLower to be both-lower (got ` +
      `[${node.gLower.indices[0].variance}, ${node.gLower.indices[1].variance}])`,
    );
  }
  if (
    node.gInverse.indices[0].variance !== 'upper' ||
    node.gInverse.indices[1].variance !== 'upper'
  ) {
    throw new MetricSignatureError(
      node.gInverse.name,
      `covariant-derivative requires gInverse to be both-upper (got ` +
      `[${node.gInverse.indices[0].variance}, ${node.gInverse.indices[1].variance}])`,
    );
  }

  const ofResult = validateChild(node.of);
  const wrtResult = validateChild(node.wrt);

  // gLower and gInverse are validated via validateChild ONLY for their dim
  // sanity-check; their free indices are deliberately discarded — the
  // Christoffel contractions inside ∇_μ consume them internally.
  // (We don't even need to call validateChild on them; their dims are
  // structurally known and any malformed metric would have failed the
  // signature checks above.)

  // Per §VIII.4 (pderiv-label-collision-rejected analog):
  // wrtIndex.label must not collide with of.freeIndices.
  //
  // I1 HYBRID DECISION: throw by default (soundness > friendliness);
  // env var UPT_ALLOW_COORD_SHADOW=1 downgrades to process.emitWarning.
  // Task 13 covers BOTH paths (default throws; env=1 warns).
  if (ofResult.freeIndices.has(node.wrtIndex.label)) {
    const conflict = node.wrtIndex.label;
    if (typeof process !== 'undefined' && process.env?.UPT_ALLOW_COORD_SHADOW === '1') {
      // Lazy-import to avoid module cycle with src/numerical/index.ts.
      // Reconstruct the warning class locally (the canonical export lives
      // in src/numerical/index.ts per Task 13).
      const w: Error = Object.assign(
        new Error(
          `Covariant-derivative wrt='${conflict}' collides with existing free index ` +
          `'${conflict}' of the operand; result will silently misbehave. ` +
          `Rename the operand's free index or pick a different wrt label.`,
        ),
        { name: 'DuplicateCoordinateWarning' },
      );
      process.emitWarning(w);
    } else {
      throw new MetricSignatureError(
        `covariant-derivative`,
        `wrt='${conflict}' shadows an existing free index '${conflict}'. ` +
        `Rename the operand's free index or set UPT_ALLOW_COORD_SHADOW=1 to ` +
        `downgrade to a warning.`,
      );
    }
  }

  // Output freeIndices = of.freeIndices ∪ {wrtIndex.label: lower}.
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  for (const [label, counts] of ofResult.freeIndices) freeIndices.set(label, counts);
  freeIndices.set(node.wrtIndex.label, { upper: 0, lower: 1 });

  // Output dim = divide(of.dim, wrt.dim) — same as pderiv.
  const dim = divide(ofResult.dim, wrtResult.dim);

  // Role passthrough: propagate of.role only when the child has one; omit
  // otherwise. Mirrors the `role?: Role` optional declaration on
  // CovariantDerivativeValidationResult — don't force a 'field' default when
  // the child has no role (e.g. a plain scalar operand).
  return ofResult.role !== undefined
    ? { dim, freeIndices, role: ofResult.role }
    : { dim, freeIndices };
}
