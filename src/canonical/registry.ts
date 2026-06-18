/**
 * The canonical-equation registry — the queryable index of the L-layer.
 * Seeded incrementally by `entries/*` modules (Tasks 2,4,5,9); this file owns
 * the assembled array, the id map, and the accessors.
 *
 * @module canonical/registry
 */
import type { CanonicalEquation, CanonicalDomain } from './canonical-equation.js';
import { DIMENSIONAL_CLASSICS } from './entries/dimensional-classics.js';

/** Every canonical equation in the registry. */
export const CANONICAL_EQUATIONS: readonly CanonicalEquation[] = [
  ...DIMENSIONAL_CLASSICS,
];

/** Id → entry. */
export const CANONICAL_BY_ID: Readonly<Record<string, CanonicalEquation>> =
  Object.fromEntries(CANONICAL_EQUATIONS.map((e) => [e.id, e]));

/** The entry with id `id`, or `undefined`. */
export function canonicalById(id: string): CanonicalEquation | undefined {
  return CANONICAL_BY_ID[id];
}

/** Every entry in `domain`. */
export function canonicalByDomain(
  domain: CanonicalDomain,
): readonly CanonicalEquation[] {
  return CANONICAL_EQUATIONS.filter((e) => e.domain === domain);
}
