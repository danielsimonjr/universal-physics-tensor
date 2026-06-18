/**
 * Shared builders for L1 (scalar-AST) canonical entries. Keeps the entry files
 * declarative: `op`/`pow` assemble the `ExprNode`, and `l1` derives the L0
 * fields from the Buckingham engine so `monomial` and `freeDimensionlessGroups`
 * are always consistent.
 *
 * @module canonical/entries/_l1-build
 */
import type { CanonicalEquation } from '../canonical-equation.js';
import type { ExprNode } from '../../dimensional/validator.js';
import type { Dimension } from '../../dimensional/types.js';
import type { DimensionalVariable } from '../../dimensional/buckingham.js';
import { DIMENSIONLESS } from '../../dimensional/types.js';
import { sym } from '../../bridges/equations/_be-helpers.js';
import { dimensionalFields } from '../dimensional-fields.js';

/** Dimension builder. Arg order is (L, M, T, **I**, **Θ**) — note I precedes Θ. */
export const dim = (L = 0, M = 0, T = 0, I = 0, Theta = 0): Dimension => ({
  L,
  M,
  T,
  I,
  Theta,
  N: 0,
  J: 0,
});

export const op = (
  o: '+' | '-' | '*' | '/' | '^',
  args: ExprNode[],
): ExprNode => ({ kind: 'op', op: o, args });

/** `base` raised to the numeric-literal power `n` (a dimensionless exponent). */
export const pow = (base: ExprNode, n: string): ExprNode =>
  op('^', [base, sym(n, DIMENSIONLESS)]);

/** Everything an L1 entry declares except the engine-derived L0 fields. */
export type L1Rest = Omit<
  CanonicalEquation,
  'freeDimensionlessGroups' | 'dimensional'
>;

/** Build an L1 entry; L0 fields are derived from the engine for consistency. */
export const l1 = (
  target: DimensionalVariable,
  governing: readonly DimensionalVariable[],
  rest: L1Rest,
): CanonicalEquation => {
  const { monomial, freeDimensionlessGroups } = dimensionalFields(
    target,
    governing,
  );
  return {
    ...rest,
    freeDimensionlessGroups,
    dimensional: { target, governing, monomial },
  };
};
