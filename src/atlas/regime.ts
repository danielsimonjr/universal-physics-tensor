/**
 * Regime derivation — π-groups as the coordinates a regime is written in.
 *
 * Dimensionless inputs are passed INTO `buckinghamPi` as zero-dimension
 * variables and come back as their own trivial groups, keyed by their own
 * names in `PiGroup.formula`. Nothing is synthesized here. (Measured in
 * design note §10 Q1 by executing `buckinghamPi`; the implementation plan's
 * "plus one trivial group per dimensionless input" would double-add.)
 *
 * @module atlas/regime
 */

import { buckinghamPi } from '../dimensional/buckingham.js';
import type { DimensionalVariable, PiGroup } from '../dimensional/buckingham.js';
import { DIMENSIONLESS } from '../dimensional/types.js';
import type { Regime, RegimeInequality } from './types.js';

/**
 * Derive the regime coordinates of a family, keyed by `PiGroup.formula`.
 *
 * A dimensionally-independent set has no groups and yields an empty record.
 *
 * @internal
 */
export function deriveRegimeGroups(
  family: string,
  parameters: readonly DimensionalVariable[],
  dimensionlessInputs: readonly string[],
): Record<string, PiGroup> {
  const variables: DimensionalVariable[] = [
    ...parameters,
    ...dimensionlessInputs.map((name) => ({ name, dim: DIMENSIONLESS })),
  ];
  if (variables.length === 0) {
    throw new Error(`deriveRegimeGroups(${family}) requires at least one variable`);
  }
  // buckinghamPi rejects duplicate names itself; the message is clearer here.
  const names = variables.map((v) => v.name);
  if (new Set(names).size !== names.length) {
    throw new Error(
      `deriveRegimeGroups(${family}) requires unique names across parameters and ` +
        `dimensionless inputs; got [${names.join(', ')}]`,
    );
  }
  const groups: Record<string, PiGroup> = {};
  for (const group of buckinghamPi(variables).piGroups) groups[group.formula] = group;
  return groups;
}

/** Result of {@link regimeHolds}. @internal */
export interface RegimeCheck {
  readonly ok: boolean;
  /** The inequalities that failed, carried whole so the caller can name them. */
  readonly violated: readonly RegimeInequality[];
}

function satisfies(value: number, ineq: RegimeInequality): boolean {
  switch (ineq.op) {
    case '<':
      return value < ineq.bound;
    case '<=':
      return value <= ineq.bound;
    case '>':
      return value > ineq.bound;
    case '>=':
      return value >= ineq.bound;
  }
}

/**
 * Check a regime against measured group values.
 *
 * A group with no supplied value, or a non-finite one, counts as VIOLATED: an
 * unmeasured coordinate is not evidence that the regime holds.
 *
 * @internal
 */
export function regimeHolds(
  regime: Regime,
  groupValues: Readonly<Record<string, number>>,
): RegimeCheck {
  const violated: RegimeInequality[] = [];
  for (const ineq of regime.inequalities) {
    const value = groupValues[ineq.group];
    if (typeof value !== 'number' || !Number.isFinite(value) || !satisfies(value, ineq)) {
      violated.push(ineq);
    }
  }
  return { ok: violated.length === 0, violated };
}
