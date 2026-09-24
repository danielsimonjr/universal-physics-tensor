/**
 * Residual form of a canonical equation: `target − scalarAst`.
 *
 * A canonical entry stores the RIGHT-HAND SIDE of one target (`scalarAst`), for example `m·a` for
 * the target force. A claim, as a user or the benchmark writes it, is a RELATION: `F − m·a`. The
 * structural key of a residual and of a right-hand side can never be equal, so a structural search
 * that compares a claim with `scalarAst` never matches. The criterion 3 study measured this: 0 of
 * 11,125 query × record pairs (pre-registration Amendment 8). Putting the canonical entry in residual
 * form makes both sides the same kind of object.
 *
 * Symbol names are not unified here. The structural key renames every dimensioned symbol to its
 * dimension, so `F` and `force` compare equal there. Symbol overlap still sees the two naming
 * conventions (`k_B` against `boltzmann-constant`), and no alias map bridges them.
 *
 * @module canonical/residual
 * @internal
 */

import type { ExprNode } from '../dimensional/ast-types.js';
import type { CanonicalEquation } from './canonical-equation.js';

/**
 * The residual `target − scalarAst` of a canonical entry, or `undefined` when the entry has no
 * `scalarAst`. The target becomes a symbol with its name and dimension; the right-hand side is the
 * entry's own `scalarAst`, not a copy.
 *
 * @internal
 */
export function canonicalResidual(e: CanonicalEquation): ExprNode | undefined {
  if (e.scalarAst === undefined) return undefined;
  const target: ExprNode = { kind: 'symbol', name: e.dimensional.target.name, dim: e.dimensional.target.dim };
  return { kind: 'op', op: '-', args: [target, e.scalarAst] };
}
