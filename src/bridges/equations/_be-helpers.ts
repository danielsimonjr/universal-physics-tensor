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
import type { Dimension } from '../../dimensional/types.js';

// ---------------------------------------------------------------------------
// Helper 1 — Runtime input validation (S-1)
// ---------------------------------------------------------------------------

/**
 * Declarative spec for a single field of an evaluator's `input` record.
 *
 * The default behaviour (no `min`/`max`) only verifies finiteness
 * (`Number.isFinite`). The bound predicates compose with `Number.isFinite`
 * so the resulting error always reads "finite ⟨adj⟩ number" — drop-in
 * compatible with the existing BE-NN per-evaluator message format
 * `"<evaluator>: <field> must be a finite <adjective> number, got <v>"`.
 *
 * The intentional simplicity: no closed-form domain constraints (e.g.,
 * `R_near ≤ R_far`). Anything beyond per-field range checks stays inline
 * in the evaluator (honesty policy — see commit message).
 *
 * @internal
 */
interface FieldSpec {
  /** Field name on the `input` record (e.g., `'M_kg'`). */
  readonly name: string;
  /** Inclusive lower bound (default `-Infinity`). */
  readonly min?: number;
  /** Inclusive upper bound (default `Infinity`). */
  readonly max?: number;
  /** Strict `>` instead of `≥` at the lower bound. */
  readonly excludeMin?: boolean;
  /** Strict `<` instead of `≤` at the upper bound. */
  readonly excludeMax?: boolean;
  /** Explicit override — when `min === 0` and you want to permit zero. */
  readonly allowZero?: boolean;
  /**
   * Optional domain-specific noun phrase (e.g., 'probability', 'angle').
   * When set, replaces the auto-generated "in range [a, b]" prose:
   *   "<evaluator>: <field> must be a finite <description> number, got <v>"
   *
   * v0.7.1 Phase 4 Task 4.4 — Eve E4 fix. Restores the pre-extraction
   * BE-25-iit-phi "probability" domain noun without reverting the
   * helper-based migration.
   *
   * @internal
   */
  readonly description?: string;
}

/**
 * Compose the adjective phrase that appears in the error message,
 * picked to match the existing per-BE-NN prose conventions:
 *
 *   - `min=0, excludeMin=true`  → "positive"        (i.e., `> 0`)
 *   - `min=0`                   → "non-negative"    (i.e., `≥ 0`)
 *   - bounded but not a 0-pin   → "in range [a, b]" (closed/open as set)
 *   - unbounded                 → ""                (just "finite")
 */
function describeRange(spec: FieldSpec): string {
  // Caller-supplied domain noun (e.g., 'probability') takes priority
  // over the auto-generated range prose. Yields:
  //   "<evaluator>: <field> must be a finite <description> number, got <v>"
  // E.g., for BE-25 IIT p_cond / p_marg:
  //   "evaluateIntrinsicInformation: p_cond must be a finite probability number, got -0.1"
  if (spec.description !== undefined) return `${spec.description} `;

  const hasMin = spec.min !== undefined;
  const hasMax = spec.max !== undefined;
  const lowOpen = !!spec.excludeMin;
  const highOpen = !!spec.excludeMax;

  // The two ubiquitous zero-pinned shapes — keep these phrasings exactly
  // as the existing 42 BE-NN evaluators emit them.
  if (hasMin && !hasMax && spec.min === 0 && !spec.allowZero) {
    if (lowOpen) return 'positive ';   // "finite positive number"
    return 'non-negative ';           // "finite non-negative number"
  }

  if (!hasMin && !hasMax) return '';   // "finite number"

  const lo = hasMin ? spec.min : -Infinity;
  const hi = hasMax ? spec.max : Infinity;
  const lb = lowOpen ? '(' : '[';
  const rb = highOpen ? ')' : ']';
  return `in range ${lb}${lo}, ${hi}${rb} `;
}

/**
 * Validate every field of `input` named by `fieldSpecs`. Throws a
 * `RangeError` on the first violation with a message that contains
 * the keywords (`"finite"`, plus `"positive"` / `"non-negative"` /
 * `"in range"`) the existing per-BE-NN tests pattern-match against.
 *
 * The error message format matches the pre-extraction convention:
 *
 *   `<evaluatorName>: <fieldName> must be a finite <range> number, got <value>`
 *
 * Sample existing prose this preserves:
 *
 *   `evaluateShapiroDelay: M_kg must be a finite positive number, got -1`
 *   `evaluateLandauerEnergy: temperature_K must be a finite non-negative number, got -1`
 *   `evaluateQuantumBounce: Lambda_Tinv2 must be finite, got NaN`
 *
 * @param input - The evaluator's input record.
 * @param fieldSpecs - The per-field range specs to enforce.
 * @param evaluatorName - The calling function's name (e.g.,
 *   `'evaluateShapiroDelay'`), used as the error-message prefix.
 *
 * @internal
 */
export function validateFiniteInputs<T extends object>(
  input: T,
  fieldSpecs: ReadonlyArray<FieldSpec>,
  evaluatorName: string,
): void {
  for (const spec of fieldSpecs) {
    const raw = (input as Record<string, unknown>)[spec.name];
    const value = raw as number;

    if (typeof value !== 'number' || !Number.isFinite(value)) {
      const range = describeRange(spec);
      throw new RangeError(
        `${evaluatorName}: ${spec.name} must be a finite ${range}number, got ${String(value)}`,
      );
    }

    if (spec.min !== undefined) {
      const violatesMin = spec.excludeMin ? value <= spec.min : value < spec.min;
      if (violatesMin) {
        const range = describeRange(spec);
        throw new RangeError(
          `${evaluatorName}: ${spec.name} must be a finite ${range}number, got ${value}`,
        );
      }
    }

    if (spec.max !== undefined) {
      const violatesMax = spec.excludeMax ? value >= spec.max : value > spec.max;
      if (violatesMax) {
        const range = describeRange(spec);
        throw new RangeError(
          `${evaluatorName}: ${spec.name} must be a finite ${range}number, got ${value}`,
        );
      }
    }
  }
}

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
export function sym(name: string, dim: Dimension): ExprNode {
  return { kind: 'symbol', name, dim };
}
