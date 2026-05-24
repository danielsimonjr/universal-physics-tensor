/**
 * Renormalization-group (RG) flow primitives — `RGCouplingNode` +
 * `BetaFunctionNode` (v0.7 BE-X re-encoding sprint).
 *
 * Encodes the structure of a Wilsonian / functional-RG flow on the
 * space of *dimensionless* couplings. The motivating physics context
 * is the asymptotic-safety program for quantum gravity (Reuter 1998
 * *Phys. Rev. D* 57:971, arXiv:hep-th/9605030; Niedermaier-Reuter 2006
 * *Living Rev. Relativity* 9:5 for the canonical review), in which RG
 * flow on the space of dimensionless couplings `g_n = G_n(k)·k^{d_n}`
 * is governed by polynomial β-functions
 *
 *     β_n(g_1, g_2, …) ≡ k ∂_k g_n
 *
 * and a viable UV-complete theory is signalled by the existence of a
 * non-Gaussian fixed point `(g_1*, g_2*, …)` at which every β_n
 * vanishes simultaneously. The structural distinction made here:
 *
 *   - `RGCouplingNode` represents a single dimensionless coupling
 *     (`g`, `λ`, …) — a labelled handle, dim hardcoded to
 *     DIMENSIONLESS for type-system symmetry with other AST nodes.
 *   - `BetaFunctionNode` represents one β-function of a multi-coupling
 *     flow: it carries the FULL coupling vector (the flow direction),
 *     a `target` selector picking out which coupling's β-function this
 *     node represents, the polynomial expression in those couplings,
 *     and an optional UV / IR fixed-point pin.
 *
 * The polynomial expression is a standard `ExprNode` built from
 * dimensionless symbols + the existing `op (+ * / ^ -)` primitives;
 * `validateBetaFunction` delegates dimensional checking to the existing
 * `validate()` from `validator.ts` and verifies the result reduces to
 * DIMENSIONLESS.
 *
 * These primitives are NOT (yet) added to the `ExprNode` union — they
 * live as a standalone predicate-level structure that callers compose
 * adjacent to the existing AST. BE-39's polynomial RHS continues to be
 * encoded as plain `op`-trees for catalog round-trip; the structural
 * `BetaFunctionNode` wrapper supplies the higher-level RG-flow
 * semantics on top.
 *
 * @module dimensional/rg-flow
 */

import type { ExprNode } from './validator.js';
import { validate } from './validator.js';
import type { Dimension } from './types.js';
import { DIMENSIONLESS } from './types.js';
import { equals } from './algebra.js';

// ─────────────────────────────────────────────────────────────────────────────
// RGCouplingNode
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AST node for a single dimensionless RG coupling (e.g. `g`, `λ`).
 *
 * By RG-discipline every coupling appearing in a β-function expression
 * is dimensionless: physical dimensionful couplings `G_n` are made
 * dimensionless via the RG scale `k` (e.g. `g = G·k²`, `λ = Λ/k²`).
 * The `dim` field is therefore hardcoded to `DIMENSIONLESS`; it is
 * exposed for type-system symmetry with `{ kind: 'symbol' }` so a
 * future ExprNode-union integration is mechanical.
 *
 * @public
 */
export interface RGCouplingNode {
  readonly kind: 'rg-coupling';
  /** Coupling name, e.g. `'g'`, `'lambda'`. Non-empty. */
  readonly name: string;
  /** Always `DIMENSIONLESS` — RG-discipline invariant. */
  readonly dim: Dimension;
}

/**
 * Construct an `RGCouplingNode` with the dimensionless invariant
 * pre-applied. Convenience helper — callers may also build the node
 * literal directly.
 *
 * @public
 */
export function rgCoupling(name: string): RGCouplingNode {
  return { kind: 'rg-coupling', name, dim: DIMENSIONLESS };
}

/**
 * Validate an `RGCouplingNode`.
 *
 * Predicates:
 *   1. `name` is a non-empty string (dimension validators reject empty
 *      labels because they make error messages unintelligible).
 *   2. `dim` is `DIMENSIONLESS` (RG-discipline invariant; physical
 *      dimension is absorbed into the running scale `k`).
 *
 * Throws an `Error` with `"name"` / `"dimension"` in the message on
 * failure.
 *
 * @public
 */
export function validateRGCoupling(node: RGCouplingNode): void {
  if (typeof node.name !== 'string' || node.name.length === 0) {
    throw new Error(
      `RGCouplingNode: invalid name — must be a non-empty string ` +
        `(got ${JSON.stringify(node.name)}).`,
    );
  }
  if (!equals(node.dim, DIMENSIONLESS)) {
    throw new Error(
      `RGCouplingNode: dimension mismatch — coupling '${node.name}' must ` +
        `be DIMENSIONLESS by RG-discipline (got ${JSON.stringify(node.dim)}). ` +
        `Physical dimension should be absorbed into the running scale k.`,
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// BetaFunctionNode
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AST node for a single β-function in a multi-coupling RG flow.
 *
 * Fields:
 *   - `couplings` — the full coupling vector `(g_1, g_2, …)`; this is
 *     the flow direction. Every coupling must appear here, even those
 *     that do not enter the polynomialExpansion of this specific
 *     β-function (so that the cross-coupling dependency structure is
 *     captured at the type level).
 *   - `target` — the coupling whose β-function this node represents.
 *     MUST be one of `couplings` (by name).
 *   - `polynomialExpansion` — the explicit β(couplings) expression as
 *     a standard `ExprNode`. Must reduce to `DIMENSIONLESS` via the
 *     existing `validate()`.
 *   - `fixedPoint` — optional UV / IR fixed-point pin, one numeric
 *     value per coupling in the same order as `couplings`. When
 *     present, `fixedPoint.length === couplings.length` is enforced.
 *
 * The polynomial form follows Reuter 1998 + the Niedermaier-Reuter 2006
 * review: each β_n is a polynomial in the dimensionless couplings,
 * truncated at some power dictated by the chosen truncation scheme
 * (e.g. canonical Einstein-Hilbert truncation for gravity).
 *
 * @public
 */
export interface BetaFunctionNode {
  readonly kind: 'beta-function';
  readonly couplings: ReadonlyArray<RGCouplingNode>;
  readonly target: RGCouplingNode;
  readonly polynomialExpansion: ExprNode;
  readonly fixedPoint?: ReadonlyArray<number>;
}

/**
 * Result of validating a `BetaFunctionNode`.
 *
 * `dim` is always `DIMENSIONLESS` (a β-function of dimensionless
 * couplings is itself dimensionless: `β = k ∂_k g` with both `g` and
 * `k ∂_k log(k)` dimensionless). `targetName` is the validated target
 * coupling label, useful for downstream RG-flow assembly.
 *
 * @public
 */
export interface BetaFunctionValidationResult {
  readonly dim: Dimension;
  readonly targetName: string;
}

/**
 * Validate a `BetaFunctionNode`.
 *
 * Predicates:
 *
 *   1. **Coupling list non-empty**: `couplings.length >= 1`. A flow
 *      with no couplings has no β-function to define.
 *   2. **Every coupling is well-formed**: each entry passes
 *      `validateRGCoupling`. Names must be unique.
 *   3. **Target ∈ couplings**: `target.name` appears in
 *      `couplings.map(c => c.name)`. Throws an Error scoped
 *      `'BetaFunctionNode: target …'` on miss.
 *   4. **Polynomial dimensionless**: `validate(polynomialExpansion)`
 *      succeeds and yields `DIMENSIONLESS`. Anything else throws with
 *      `'dimension'` in the message.
 *   5. **Fixed-point length match** (if `fixedPoint` is set):
 *      `fixedPoint.length === couplings.length`. Each value must be
 *      finite. Throws scoped `'BetaFunctionNode: fixedPoint …'` on
 *      mismatch.
 *
 * @public
 */
export function validateBetaFunction(
  node: BetaFunctionNode,
): BetaFunctionValidationResult {
  // ── Predicate 1: coupling list non-empty ───────────────────────────────────
  if (node.couplings.length === 0) {
    throw new Error(
      `BetaFunctionNode: coupling list is empty — an RG flow requires ` +
        `at least one coupling. Define the flow direction in 'couplings'.`,
    );
  }

  // ── Predicate 2: every coupling is well-formed; names unique ──────────────
  const seen = new Set<string>();
  for (const c of node.couplings) {
    validateRGCoupling(c);
    if (seen.has(c.name)) {
      throw new Error(
        `BetaFunctionNode: duplicate coupling name '${c.name}' in ` +
          `couplings list. Each RGCouplingNode must have a unique name.`,
      );
    }
    seen.add(c.name);
  }

  // ── Predicate 3: target is one of the couplings ───────────────────────────
  validateRGCoupling(node.target);
  if (!seen.has(node.target.name)) {
    throw new Error(
      `BetaFunctionNode: target coupling '${node.target.name}' is not in ` +
        `the couplings list [${[...seen].join(', ')}]. The target must be ` +
        `one of the flow-direction couplings.`,
    );
  }

  // ── Predicate 4: polynomialExpansion validates to DIMENSIONLESS ───────────
  const polyResult = validate(node.polynomialExpansion);
  if (!polyResult.ok || polyResult.inferredDimension === null) {
    const noteSummary = polyResult.violations
      .map((v) => v.note)
      .join('; ');
    throw new Error(
      `BetaFunctionNode: polynomialExpansion failed dimension inference ` +
        `for target '${node.target.name}' — ${noteSummary || 'no detail available'}.`,
    );
  }
  if (!equals(polyResult.inferredDimension, DIMENSIONLESS)) {
    throw new Error(
      `BetaFunctionNode: dimension mismatch — polynomialExpansion for ` +
        `target '${node.target.name}' must be DIMENSIONLESS (β-function of ` +
        `dimensionless couplings), got ${JSON.stringify(polyResult.inferredDimension)}.`,
    );
  }

  // ── Predicate 5: fixed-point length agrees with couplings count ───────────
  if (node.fixedPoint !== undefined) {
    if (node.fixedPoint.length !== node.couplings.length) {
      throw new Error(
        `BetaFunctionNode: fixedPoint length mismatch — got ` +
          `${node.fixedPoint.length} value(s) but couplings list has ` +
          `${node.couplings.length}. Provide one fixed-point coordinate ` +
          `per coupling in the same order as 'couplings'.`,
      );
    }
    for (let i = 0; i < node.fixedPoint.length; i++) {
      const v = node.fixedPoint[i];
      if (!Number.isFinite(v)) {
        throw new Error(
          `BetaFunctionNode: fixedPoint[${i}] (coupling ` +
            `'${node.couplings[i].name}') is not finite (got ${v}).`,
        );
      }
    }
  }

  return { dim: DIMENSIONLESS, targetName: node.target.name };
}
