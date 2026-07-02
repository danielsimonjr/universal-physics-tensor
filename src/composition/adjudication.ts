/**
 * Adjudication ledger for machine-surfaced discovery candidates.
 *
 * Human verdicts on identification hypotheses (`a ≟ b`) are REVIEW MEMORY:
 * once a physicist has disposed of a candidate, the funnel must not
 * re-surface it as fresh. Verdicts NEVER mutate the catalog or graphs
 * (the epistemic firewall) — they annotate discovery output only.
 *
 * Keyed by the order-normalized quantity-name pair. Proposed equations
 * (`upt discover --derive`) inherit the verdict of the identification they
 * were derived from (`derivedFrom.identification`).
 *
 * @module composition/adjudication
 */

/** Quantity names are ASCII kebab-case slugs; enforced so `~` cannot collide
 *  (Adam/Eve vet r1: guard the character-set assumption, don't assume it). */
const SLUG = /^[a-z0-9][a-z0-9-]*$/u;

/**
 * Stable identity for an identification hypothesis: the two quantity names,
 * sorted, joined with `~`. Deliberately excludes score/verdict/dimension so
 * ids survive funnel-internal changes. NOT rename-proof: a quantity rename
 * (alias disposition) must update `ADJUDICATIONS` in the SAME commit — the
 * calibration benchmark's seed-resolution test enforces this.
 *
 * @public
 */
export function candidateId(a: string, b: string): string {
  if (!SLUG.test(a) || !SLUG.test(b)) {
    throw new Error(
      `candidateId: quantity names must be kebab-case slugs (got '${a}', '${b}')`,
    );
  }
  return a <= b ? `${a}~${b}` : `${b}~${a}`;
}
