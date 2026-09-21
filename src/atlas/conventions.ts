/**
 * Atlas Phase 1 — convention comparison.
 *
 * `Conventions` (`src/atlas/types.ts`) records the sign and unit choices a
 * record depends on. Two records that disagree on one of those choices are not
 * directly comparable, and this module says WHICH keys disagree.
 *
 * **`undefined` is "unknown", never "mismatch", and that asymmetry is the
 * whole design.** A record that declares nothing about the metric signature
 * has not chosen `'+---'`; it has not said. Reporting the absence as a
 * disagreement would manufacture conflicts out of missing data — and because
 * almost every record in the repo declares nothing today, it would manufacture
 * them at scale. The same reasoning that makes design note §3 require a
 * NON-EMPTY `conventions` before `convention-checked` can be derived applies
 * in the mirror here: absence earns neither a tag nor an accusation.
 *
 * A mismatch is therefore reported only when BOTH sides declare the key and
 * the declared values differ.
 *
 * @module atlas/conventions
 */

import type { Conventions } from './types.js';

/** The keys `checkConventions` compares. @internal */
export type ConventionKey = keyof Conventions;

/**
 * Every key of `Conventions`, as values. Written out rather than derived,
 * because a type has no runtime extent; `tests/atlas/conventions.test.ts`
 * pins this list against the interface so a new field cannot be added to
 * `Conventions` and silently skipped by the comparison.
 */
const CONVENTION_KEYS: readonly ConventionKey[] = [
  'heatWorkSign',
  'metricSignature',
  'fourierNormalization',
  'unitSystem',
  'capacitorChargeSign',
];

/**
 * The convention keys on which `a` and `b` DECLARE different values.
 *
 * Returns an empty list when they agree, when either side is absent, and when
 * neither declares a key in common — all four of which are the same statement:
 * nothing here is in conflict.
 *
 * @param a - one record's conventions, or `undefined` when it declares none.
 * @param b - the other record's conventions, or `undefined`.
 * @returns the mismatched keys, in `Conventions` declaration order.
 *
 * @internal
 */
export function checkConventions(
  a: Conventions | undefined,
  b: Conventions | undefined,
): readonly ConventionKey[] {
  if (a === undefined || b === undefined) return [];
  return CONVENTION_KEYS.filter((k) => {
    const av = a[k];
    const bv = b[k];
    // Either side silent ⇒ unknown, not disagreement.
    if (av === undefined || bv === undefined) return false;
    return av !== bv;
  });
}
