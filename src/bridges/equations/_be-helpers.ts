/**
 * Shared helpers for the 43 BE-NN bridge-equation modules in
 * `src/bridges/equations/`. Three behaviour-preserving extractions
 * (v0.7.1 Phase 3 — simplifiers S-1, S-2, S-3):
 *
 *   - `validateFiniteInputs(input, fieldSpecs, evaluatorName)` —
 *     replaces the per-evaluator `Number.isFinite(x) || x <= 0`
 *     boilerplate. ~150 input guards collapse to a single
 *     declarative call per evaluator.
 *
 *   - `validateBEDimensions(lhs, rhs, equationLabel)` — replaces
 *     the per-bridge `validateBE##Dimensions()` wrapper body
 *     (`validateEquation` + 2× `validate` + result-shape build).
 *
 *   - `sym(name, dim)` — replaces the file-local
 *     `const sym = (name, dim) => ({ kind: 'symbol', name, dim })`
 *     factory literally duplicated in all 43 BE-NN modules.
 *
 * Mirrors the structure + JSDoc style of `field-equation-helpers.ts`
 * (the Phase-0 sibling that did the same job for the field-equation
 * predicate AST nodes). Underscore-prefix on the filename signals
 * "shared by siblings inside this directory; not part of the
 * public surface" — same convention as `tests/bridges/_helpers.ts`.
 *
 * @module bridges/equations/_be-helpers
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';

// ---------------------------------------------------------------------------
// Helper 1 — Runtime input validation (S-1)
// ---------------------------------------------------------------------------
// `validateFiniteInputs` (+ `FieldSpec`) moved to the dependency-free leaf
// `numerical/input-validation.ts` so the numerical layer no longer imports
// upward from `bridges`. Re-exported here so every BE-NN evaluator is unchanged.
export { validateFiniteInputs, type FieldSpec } from '../../numerical/input-validation.js';

// ---------------------------------------------------------------------------
// Helper 2 — Per-bridge dimensional self-check (S-2)
// ---------------------------------------------------------------------------

/**
 * Run `validateEquation(lhs, rhs)` + `validate(lhs)` + `validate(rhs)`
 * and pack the result into the canonical `DimensionValidationReport`
 * shape used by every BE-NN's `validate*Dimensions()` wrapper.
 *
 * The `equationLabel` parameter is currently unused at the message
 * level (the existing wrappers don't surface labels in the report;
 * the report is consumed by the dimensional-signature-catalog round-
 * trip test which only reads `lhsDim` / `rhsDim`). It's accepted so
 * future error-context enrichment can attach the label without a
 * signature break.
 *
 * @param lhs - The bridge's encoded LHS AST.
 * @param rhs - The bridge's encoded RHS AST.
 * @param equationLabel - Human label (e.g., `'BE37'`); reserved for
 *   future error-message use.
 *
 * @internal
 */
export function validateBEDimensions(
  lhs: ExprNode,
  rhs: ExprNode,
  _equationLabel: string,
): DimensionValidationReport {
  const eq = validateEquation(lhs, rhs);
  const lhsR = validate(lhs);
  const rhsR = validate(rhs);
  return {
    ok: eq.ok,
    lhsDim: lhsR.inferredDimension,
    rhsDim: rhsR.inferredDimension,
  };
}

// ---------------------------------------------------------------------------
// Helper 3 — Symbol-node factory (S-3) [bug-sensitive]
// ---------------------------------------------------------------------------

/**
 * Build a `kind: 'symbol'` AST node with the given name and dimension.
 *
 * Direct replacement for the file-local factory duplicated in all 43
 * BE-NN modules:
 *
 * ```ts
 * const sym = (name: string, dim: Dimension): ExprNode =>
 *   ({ kind: 'symbol', name, dim });
 * ```
 *
 * **Bug-sensitivity note** (v0.7.1 Phase 3 risk surface): a subtle
 * regression here — wrong `kind` discriminator, missing field, type
 * coercion — affects every BE module silently. Behaviour-preserving
 * extraction must produce a node that is `===`-structurally-equal
 * to the pre-extraction literal:
 *
 *   - `kind` is literally the string `'symbol'`
 *   - `name` is the caller's string, unmodified (no trim, no
 *     case-fold, no whitespace check — the existing factory accepts
 *     any string including `''`, `'-1'`, `'8pi'`, `'α'`)
 *   - `dim` is the caller's `Dimension`, by reference (no clone, no
 *     freeze — matches the existing factory's behaviour)
 *   - the returned node is a fresh object on every call (no memo)
 *
 * @param name - Symbol label. Any string (including the empty string).
 * @param dim - The SI dimension of the symbol.
 *
 * @internal
 */
// Single source of truth in `dimensional/ast-builders`; re-exported here so the
// ~55 BE/canonical modules that import `sym` from `_be-helpers` are unchanged.
export { sym } from '../../dimensional/ast-builders.js';
