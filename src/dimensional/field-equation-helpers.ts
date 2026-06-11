/**
 * Shared validation helpers for field-equation predicate AST nodes
 * (`EinsteinFieldEquationNode`, and future `MaxwellEquationNode`,
 * `KleinGordonEquationNode`, etc.).
 *
 * Per `docs/architecture/archive/v0.7-tensor-equation-node-design-note.md`
 * Phase 0 — extract the 3 invariant checks from
 * `validateEinsteinFieldEquation` so future field equations get
 * them for free, instead of copy-pasting the predicate bodies.
 * Investment-upfront pattern: same shape as v0.6.1's
 * validator-registry refactor.
 *
 * Three helpers, all behavior-preserving extractions:
 *
 *   - `validateFreeIndexLabelMatch` — checks lhs and rhs carry
 *     the same free-index labels in the same order. Generic over
 *     rank (works for rank-1 Maxwell `∇_μ F^{μν}`, rank-2 EFE,
 *     etc.).
 *
 *   - `validateComponentDimension` — checks a tensor's
 *     `componentDim` matches an expected `Dimension`. Generic
 *     over which tensor and what equation context.
 *
 *   - `validateTensorSymmetry` — checks a tensor's `symmetry`
 *     field equals an expected value. Generic over tensor +
 *     equation context.
 *
 * @module dimensional/field-equation-helpers
 */

import type { Dimension } from './types.js';

// ---------------------------------------------------------------------------
// Helper 1 — Free-index label agreement
// ---------------------------------------------------------------------------

/**
 * Assert that the LHS and RHS of a field-equation predicate carry
 * the same free-index labels in the same order.
 *
 * Throws `Error` with `"index label"` in the message (matches the
 * existing `validateEinsteinFieldEquation` error prose, so any
 * test pattern-matching that string stays green).
 *
 * @param equationKind - Discriminator for the error message
 *   (e.g., `'EinsteinFieldEquationNode'`, `'MaxwellEquationNode'`).
 * @param lhsName - Human label for the LHS in the error (e.g., `'G_μν'`).
 * @param lhsLabels - Free-index labels from the LHS, in axis order.
 * @param rhsName - Human label for the RHS (e.g., `'T_μν'`).
 * @param rhsLabels - Free-index labels from the RHS, in axis order.
 *
 * @internal
 */
export function validateFreeIndexLabelMatch(
  equationKind: string,
  lhsName: string,
  lhsLabels: ReadonlyArray<string>,
  rhsName: string,
  rhsLabels: ReadonlyArray<string>,
): void {
  if (lhsLabels.length !== rhsLabels.length) {
    throw new Error(
      `${equationKind}: index label rank mismatch — LHS ${lhsName} has ` +
      `${lhsLabels.length} free indices (${lhsLabels.join(', ')}) but RHS ` +
      `${rhsName} has ${rhsLabels.length} (${rhsLabels.join(', ')}). ` +
      `Both sides must carry the same rank.`,
    );
  }
  for (let i = 0; i < lhsLabels.length; i++) {
    if (lhsLabels[i] !== rhsLabels[i]) {
      throw new Error(
        `${equationKind}: index label mismatch — LHS ${lhsName} has free ` +
        `indices (${lhsLabels.join(', ')}) but RHS ${rhsName} has ` +
        `(${rhsLabels.join(', ')}). Both sides must carry the same lower ` +
        `index labels in the same axis order.`,
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Helper 2 — Per-component dimensional equality
// ---------------------------------------------------------------------------

/**
 * Assert that an `actual: Dimension` equals an `expected: Dimension`
 * across all seven base SI axes (L, M, T, I, Theta, N, J).
 *
 * Throws `Error` with `"dimension"` in the message (matches the
 * existing error prose convention).
 *
 * @param equationKind - Discriminator (e.g., `'EinsteinFieldEquationNode'`).
 * @param tensorName - Human label for the tensor being checked
 *   (e.g., `'T_μν componentDim'`).
 * @param actual - The actual `Dimension` from the AST node.
 * @param expected - The expected `Dimension`.
 * @param explanation - Optional trailing message explaining why
 *   this dimension is required (e.g., `"so that (8πG/c⁴)·T_μν ~ [L⁻²]"`).
 *
 * @internal
 */
export function validateComponentDimension(
  equationKind: string,
  tensorName: string,
  actual: Dimension,
  expected: Dimension,
  explanation?: string,
): void {
  if (
    actual.L !== expected.L ||
    actual.M !== expected.M ||
    actual.T !== expected.T ||
    actual.I !== expected.I ||
    actual.Theta !== expected.Theta ||
    actual.N !== expected.N ||
    actual.J !== expected.J
  ) {
    const tail = explanation ? ` ${explanation}` : '';
    throw new Error(
      `${equationKind}: dimension mismatch — ${tensorName} must be ` +
      `${JSON.stringify(expected)} but got ${JSON.stringify(actual)}.${tail}`,
    );
  }
}

// ---------------------------------------------------------------------------
// Helper 3 — Tensor symmetry agreement
// ---------------------------------------------------------------------------

/**
 * Assert that a tensor's `symmetry` field equals `expected`.
 *
 * Throws `Error` with `"symmetry"` in the message.
 *
 * @param equationKind - Discriminator (e.g., `'EinsteinFieldEquationNode'`).
 * @param tensorName - Human label (e.g., `'T_μν'`).
 * @param actual - The tensor's actual `symmetry` value.
 * @param expected - The required `symmetry` value (e.g., `'symmetric'`).
 * @param explanation - Optional trailing message (e.g., `"Both sides of
 *   the EFE are symmetric in (μ,ν)"`).
 *
 * @internal
 */
export function validateTensorSymmetry(
  equationKind: string,
  tensorName: string,
  actual: string,
  expected: string,
  explanation?: string,
): void {
  if (actual !== expected) {
    const tail = explanation ? ` ${explanation}` : '';
    throw new Error(
      `${equationKind}: symmetry mismatch — ${tensorName} must have ` +
      `symmetry: '${expected}' (got '${actual}').${tail}`,
    );
  }
}
