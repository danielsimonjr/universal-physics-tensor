/**
 * Atlas Phase 3 — the poster's two association-only lines.
 *
 * An `Association` (`../association.ts`) records that two things SHARE
 * something and asserts **no relation**, **no composite claim**, and **no
 * graph edge**. `ROADMAP.md` Phase 3 puts exactly two of its fifteen lines in
 * that category, and both are here:
 *
 * - **`7 ↔ 16` — the historical link ONLY.** `kind: 'historical-influence'`,
 *   which is the value that says "influence, not derivation". The derivation
 *   route to 16 exists and is recorded as a hyperedge from the FULL Maxwell
 *   system in `./derivations.ts`; this record exists so the resemblance
 *   between one Maxwell equation and special relativity stops being
 *   re-surfaced as if it were that route.
 * - **`3, 14 → *` — association only.** The line states no target, so the
 *   target is recorded as {@link UNSPECIFIED_TARGET} rather than guessed. Two
 *   records, one per entry: the line says each of 3 and 14 is association-only,
 *   NOT that 3 and 14 are associated with each other — pairing them would be a
 *   claim no source makes.
 *
 * `kind` is assigned the way `../association.ts` insists: mechanically, from
 * what the line says, never as a fresh per-pair physics judgement.
 * `ASSOCIATIONS` in that module is seeded from the `'decoy'` adjudications and
 * is pinned by test against the live ledger, so these records live here rather
 * than being appended to it.
 *
 * @module atlas/poster/associations
 */

import type { Association } from '../association.js';
import type { StatementId } from '../statement.js';

/**
 * The second member of a `3, 14 → *` association: the line's `*`, which names
 * no target.
 *
 * A sentinel rather than a real id, because inventing a target would invent
 * the association. Any consumer that draws these edges must treat it as "no
 * target recorded" and not resolve it.
 *
 * @internal
 */
export const UNSPECIFIED_TARGET = '*';

/**
 * The poster's association records.
 *
 * `citation` is `ROADMAP.md` with its Phase 3 section, because that is the
 * source these came from — `../association.ts` requires the note's origin, and
 * the adjudication ledger is not it.
 *
 * @internal
 */
export const POSTER_ASSOCIATIONS: readonly Association[] = [
  {
    id: 'a-7-16-historical',
    kind: 'historical-influence',
    between: ['poster-7', 'poster-16'],
    note:
      'Historical link only. Entry 7 influenced special relativity historically; it does ' +
      'NOT derive it. The derivation route is the hyperedge {full Maxwell system, spacetime ' +
      'structure} → 16, never from 7 alone.',
    citation: 'ROADMAP.md § Phase 3 — Hyperedges, models, and the poster as a typed index',
  },
  {
    id: 'a-3-association-only',
    kind: 'shared-structure',
    between: ['poster-3', UNSPECIFIED_TARGET],
    note:
      'Association only. ROADMAP.md Phase 3 states "3, 14 → * association only" and names ' +
      'no target; the target is recorded as unspecified rather than guessed.',
    citation: 'ROADMAP.md § Phase 3 — Hyperedges, models, and the poster as a typed index',
  },
  {
    id: 'a-14-association-only',
    kind: 'shared-structure',
    between: ['poster-14', UNSPECIFIED_TARGET],
    note:
      'Association only. ROADMAP.md Phase 3 states "3, 14 → * association only" and names ' +
      'no target; the target is recorded as unspecified rather than guessed.',
    citation: 'ROADMAP.md § Phase 3 — Hyperedges, models, and the poster as a typed index',
  },
];

/**
 * Statement pairs that may NEVER appear as a derivation, in either direction.
 *
 * Derived from the records above rather than restated, so the guard and the
 * data cannot drift apart: adding an association adds the prohibition.
 * Pairs whose second member is {@link UNSPECIFIED_TARGET} are excluded —
 * there is no second statement to forbid an edge to, and a sentinel in a
 * pair-matcher would silently match nothing while looking like a guard.
 *
 * Consumed by `validatePosterRelations` in `./derivations.ts`.
 *
 * @internal
 */
export const ASSOCIATION_ONLY_PAIRS: readonly (readonly [StatementId, StatementId])[] =
  POSTER_ASSOCIATIONS.filter((a) => a.between[1] !== UNSPECIFIED_TARGET).map(
    (a) => [a.between[0], a.between[1]] as const,
  );
