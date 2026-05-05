/**
 * Bridge-index integration scaffold.
 *
 * The 40 bridges in `src/bridges/index.ts` carry `formula_latex` strings but
 * not yet a machine-evaluable AST — that encoding is Tier 5 work, one bridge
 * at a time. For Tier 4 (this MVP) we only expose the helper that, given a
 * hand-supplied `ExprNode`, returns the inferred SI dimension or `null` if
 * the expression is dimensionally inconsistent.
 *
 * Once Tier 5 begins, callers can plug the inferred dim into the bridge
 * entry's `dimensional_signature` field (currently null for all 40).
 *
 * @module dimensional/bridge-check
 */

import { Dimension } from './types.js';
import { ExprNode, validate } from './validator.js';

/**
 * Infer the SI dimensional signature of a bridge equation expression.
 *
 * @param bridgeId  The 1-based id from `BRIDGE_EQUATIONS` (e.g. 11..50).
 *                  Currently unused — reserved for future per-bridge metadata
 *                  (e.g. expected dimension lookups for cross-checking).
 * @param expr      Hand-encoded ExprNode AST for the equation's RHS (or LHS).
 * @returns The inferred SI dimension, or `null` if the expression is
 *          dimensionally inconsistent.
 */
export function inferDimensionForBridge(
  bridgeId: number,
  expr: ExprNode,
): Dimension | null {
  // bridgeId is currently a pass-through for traceability; it is not consulted
  // because there is no per-bridge expected-dimension table yet (Tier 5).
  void bridgeId;
  const r = validate(expr);
  if (!r.ok) return null;
  return r.inferredDimension;
}
