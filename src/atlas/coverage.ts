/**
 * Atlas Phase 1, S1.3 — evidence coverage, counted BY TAG.
 *
 * Design note `docs/planning/Atlas-Phase-1-Design.md` §3: *"Any future commit
 * that appears to raise a row's evidence without adding a witness is a bug,
 * and the coverage report is what makes it visible: it reports counts BY TAG,
 * so a jump is legible."*
 *
 * A single "how many records have evidence" total would hide exactly the
 * movement this report exists to expose — one tag inflating while another
 * drains reads as no change at all. So the report is per tag, every tag is
 * present with an explicit zero, and `records` is reported beside the counts
 * (the counts do not sum to it: a record carries several tags).
 *
 * Pure: no I/O, no catalog import, no caching.
 *
 * @module atlas/coverage
 * @internal
 */

import type { EvidenceTag } from './types.js';

/** Every `EvidenceTag`, so a report always names all of them. @internal */
export const ALL_EVIDENCE_TAGS = [
  'proposed',
  'reviewed',
  'dimension-checked',
  'convention-checked',
  'symbolically-checked',
  'numerically-supported',
  'formally-proved',
  'empirically-supported',
  'contradicted',
  'unresolved',
] as const satisfies readonly EvidenceTag[];

/** Counts by tag over a set of records. @internal */
export interface EvidenceCoverage {
  /** How many records were counted. */
  readonly records: number;
  /** One entry per `EvidenceTag`, zero included. Counts overlap by design. */
  readonly byTag: Readonly<Record<EvidenceTag, number>>;
}

/**
 * Count derived evidence sets by tag.
 *
 * @param evidenceSets - one derived set per record, e.g. the output of
 * `deriveEvidence` mapped over a catalog. Deriving is the caller's job; this
 * function never derives, so it cannot disagree with the derivation.
 * @internal
 */
export function summarizeEvidence(
  evidenceSets: Iterable<ReadonlySet<EvidenceTag>>,
): EvidenceCoverage {
  const byTag = Object.fromEntries(ALL_EVIDENCE_TAGS.map((t) => [t, 0])) as Record<
    EvidenceTag,
    number
  >;
  let records = 0;
  for (const set of evidenceSets) {
    records += 1;
    for (const tag of set) byTag[tag] += 1;
  }
  return { records, byTag };
}
