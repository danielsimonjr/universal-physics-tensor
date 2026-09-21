/**
 * Atlas Phase 1, S1.3 — evidence tags, DERIVED AT READ TIME.
 *
 * Design note: `docs/planning/Atlas-Phase-1-Design.md` §3 and §4.
 *
 * **The contract of this module: it has no write path.** No record stores an
 * evidence set; every tag is computed from the artifacts a record actually
 * carries, each time it is asked for. A tag is emitted ONLY when the artifact
 * it names is present and passing. There is no default-true tag, no tag
 * derived from another tag, no tag derived from `reviewStatus`, and no tag
 * derived from prose. A record carrying no passing witness derives exactly
 * `{'proposed'}`.
 *
 * ## The empty-set trap (design note §3, Adam A1 RED — confirmed by execution)
 *
 * `convention-checked` is the ONLY rule in the table whose quantifier is
 * universal (`every`). Written as "`conventions` is present AND every declared
 * field is consumed by a witness", it hands the tag to a record with ZERO
 * witnesses, because `conventions = {}` declares nothing and `[].every(…)` is
 * vacuously true. {@link deriveEvidence} therefore requires a NON-EMPTY
 * declaration before the universal runs, and
 * `tests/atlas/derive-evidence.test.ts` pins the empty-object case.
 *
 * **The general rule, for anything added here later:** a universal quantifier
 * in a tag derivation must be paired with a non-emptiness check, or the tag is
 * free. The other rules are existentials (`some`), which are false on the
 * empty set and therefore safe.
 *
 * ## What "passing" means, and why the caller supplies it
 *
 * `Witness` records an id and the test file that runs it; nothing on the
 * record says whether that test passed. Proving it is a filesystem act (see
 * `tests/atlas/evidence-rule.test.ts`, which matches witness ids against test
 * titles), and this module is pure. So the set of passing witness ids is an
 * ARGUMENT. It defaults to EMPTY, never to "all": an unverified witness
 * supports nothing, and defaulting the other way would be precisely the
 * free-tag defect above in a second location.
 *
 * @module atlas/derive-evidence
 * @internal
 */

import type { Conventions, EvidenceTag } from './types.js';

/**
 * The verdict of `adjudicateBridgeEntry` (`src/bridges/membership.ts`),
 * restated structurally so this module takes no dependency on `src/bridges`
 * (the dependency must run one way — design note §1).
 *
 * `tests/atlas/derive-evidence.test.ts` pins this union against the real
 * `BridgeVerdict` at compile time AND at runtime over the live catalog, so a
 * fourth verdict fails the test rather than silently falling through.
 *
 * @internal
 */
export type AdjudicationVerdict = 'bridge' | 'not-a-bridge' | 'unadjudicated';

/**
 * A witness as this derivation reads it.
 *
 * Structural, not an import of `Witness`, for two reasons that are findings in
 * their own right (both reported to the Lead):
 *
 *  - `Witness.kind` is `'symbolic' | 'numeric' | 'formal'` — there is NO
 *    `'dimensional'` member, so `dimension-checked` has no source on today's
 *    data. The kind is widened here to include `'dimensional'` so the rule is
 *    written once and correctly; it simply never fires until such a witness
 *    exists. Widening it is not inventing evidence: no record carries one.
 *  - `Witness` records no list of the convention fields a check consumes, so
 *    `consumes` is optional here. Absent ⇒ the witness consumes nothing ⇒
 *    `convention-checked` cannot be earned. Conservative by construction.
 *
 * @internal
 */
export interface WitnessLike {
  readonly id: string;
  readonly kind: 'symbolic' | 'numeric' | 'formal' | 'dimensional';
  /** Convention fields this check actually consumes, when it declares any. */
  readonly consumes?: readonly (keyof Conventions)[];
}

/**
 * A counterexample as this derivation reads it.
 *
 * `Counterexample` (`src/atlas/types.ts`) carries `description` and `witness`
 * and has NO `resolvedBy` field — so on today's data every counterexample is
 * unresolved. `resolvedBy` is read here as an optional property rather than
 * assumed absent, so that adding it later resolves counterexamples without
 * touching this file. This module adds no field to any type.
 *
 * @internal
 */
export interface CounterexampleLike {
  readonly description?: string;
  readonly witness?: string;
  /** Present and non-empty ⇒ the counterexample is resolved and does not contradict. */
  readonly resolvedBy?: string;
}

/** The artifacts a record carries, all optional. @internal */
export interface EvidenceInput {
  readonly witnesses?: readonly WitnessLike[];
  readonly conventions?: Conventions;
  readonly counterexamples?: readonly CounterexampleLike[];
}

/** The empty passing set — the conservative default. */
const NO_PASSING_WITNESSES: ReadonlySet<string> = new Set<string>();

/** The fields `Conventions` may declare. Kept in one place so the check is total. */
const CONVENTION_FIELDS = [
  'heatWorkSign',
  'metricSignature',
  'fourierNormalization',
  'unitSystem',
  'capacitorChargeSign',
] as const satisfies readonly (keyof Conventions)[];

/** The convention fields a record actually declares (a `undefined` value declares nothing). */
function declaredConventionFields(
  conventions: Conventions | undefined,
): readonly (keyof Conventions)[] {
  if (conventions === undefined) return [];
  return CONVENTION_FIELDS.filter((field) => conventions[field] !== undefined);
}

/**
 * Derive the evidence set of one record.
 *
 * @param record - the artifacts the record carries.
 * @param passingWitnessIds - ids of witnesses VERIFIED to pass. Defaults to
 * empty: an unverified witness supports nothing.
 * @returns a fresh set; never cached, never stored.
 * @internal
 */
export function deriveEvidence(
  record: EvidenceInput,
  passingWitnessIds: ReadonlySet<string> = NO_PASSING_WITNESSES,
): ReadonlySet<EvidenceTag> {
  const tags = new Set<EvidenceTag>();

  const passing = (record.witnesses ?? []).filter((w) => passingWitnessIds.has(w.id));

  // Existentials over the passing witnesses — false on the empty set.
  if (passing.some((w) => w.kind === 'dimensional')) tags.add('dimension-checked');
  if (passing.some((w) => w.kind === 'symbolic')) tags.add('symbolically-checked');
  if (passing.some((w) => w.kind === 'numeric')) tags.add('numerically-supported');

  // The ONE universal in the table — guarded by non-emptiness. See §3 above.
  const declared = declaredConventionFields(record.conventions);
  if (
    declared.length > 0 &&
    declared.every((field) => passing.some((w) => (w.consumes ?? []).includes(field)))
  ) {
    tags.add('convention-checked');
  }

  // Existential: a counterexample with no resolution.
  if (
    (record.counterexamples ?? []).some(
      (c) => c.resolvedBy === undefined || c.resolvedBy === '',
    )
  ) {
    tags.add('contradicted');
  }

  if (tags.size === 0) tags.add('proposed');
  return tags;
}

/**
 * Derive the evidence set of a catalog row, under the adjudication precedence
 * of design note §4. The verdict is supplied by the caller — it comes from
 * `adjudicateBridgeEntry`, which owns the rejected-id registry
 * (`REJECTED_BRIDGE_IDS`). Reading that registry here would make this file a
 * second source of truth about which ids are rejected.
 *
 * | Verdict | Derives |
 * |---|---|
 * | `'not-a-bridge'` | `{'contradicted'}`, regardless of witnesses |
 * | `'unadjudicated'` | `{'proposed'}` only — never a refutation, never support |
 * | `'bridge'` | {@link deriveEvidence} runs normally |
 *
 * @internal
 */
export function deriveEvidenceForVerdict(
  verdict: AdjudicationVerdict,
  record: EvidenceInput,
  passingWitnessIds: ReadonlySet<string> = NO_PASSING_WITNESSES,
): ReadonlySet<EvidenceTag> {
  switch (verdict) {
    case 'not-a-bridge':
      return new Set<EvidenceTag>(['contradicted']);
    case 'unadjudicated':
      return new Set<EvidenceTag>(['proposed']);
    case 'bridge':
      return deriveEvidence(record, passingWitnessIds);
  }
}
