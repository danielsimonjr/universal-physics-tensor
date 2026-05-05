/**
 * Bridge-index integration scaffold.
 *
 * The 40 bridges in `src/bridges/index.ts` carry `formula_latex` strings
 * but only a handful (BE-11, BE-14 today) have a machine-evaluable AST.
 * The encoding is Tier 5 work, one bridge at a time.
 *
 * `inferDimensionForBridge(id, expr)` runs `validate()` on the AST. If
 * the supplied `id` is registered in `EXPECTED_DIMENSION_BY_BRIDGE`, the
 * inferred dim is also cross-checked against the expected one — a
 * mismatch returns `null` (a real "bridge expected ENTROPY but got
 * AREA" error). If the id is not registered, the inferred dim is
 * returned unchanged (current MVP behaviour for entries with no
 * dimensional_signature yet).
 *
 * @module dimensional/bridge-check
 */

import { Dimension, ENTROPY, FREQUENCY } from './types.js';
import { ExprNode, validate } from './validator.js';
import { equals } from './algebra.js';

/**
 * Per-bridge expected SI dimension lookup. Seeded with the entries that
 * have an AST encoding registered in `src/bridges/equations/`. Add new
 * rows as Tier-5 AST encodings land — every entry whose
 * `dimensional_signature` is non-null and corresponds to a named SI
 * dimension is a candidate. Entries with bracketed-product signatures
 * (e.g. BE-18 `[L^8 M^4 T^-8]`) can also be added by constructing the
 * appropriate `Dimension` literal.
 */
export const EXPECTED_DIMENSION_BY_BRIDGE: ReadonlyMap<number, Dimension> = new Map<number, Dimension>([
  [11, FREQUENCY],
  [14, ENTROPY],
]);

/**
 * Infer the SI dimensional signature of a bridge equation expression.
 *
 * @param bridgeId  The id from `BRIDGE_EQUATIONS` (11..50). If present
 *                  in `EXPECTED_DIMENSION_BY_BRIDGE` the inferred dim
 *                  is cross-checked against the expected; mismatch =>
 *                  null. If absent, the inferred dim is returned as-is.
 * @param expr      Hand-encoded ExprNode AST for the equation's RHS
 *                  (or LHS).
 * @returns The inferred SI dimension, or `null` if the expression is
 *          dimensionally inconsistent or fails the per-bridge expected
 *          dimension check.
 */
export function inferDimensionForBridge(
  bridgeId: number,
  expr: ExprNode,
): Dimension | null {
  const r = validate(expr);
  if (!r.ok || r.inferredDimension === null) return null;
  const expected = EXPECTED_DIMENSION_BY_BRIDGE.get(bridgeId);
  if (expected !== undefined && !equals(r.inferredDimension, expected)) {
    return null;
  }
  return r.inferredDimension;
}
