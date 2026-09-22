/**
 * Atlas Phase 3 — `Derivation` (a hyperedge) and multicategory composition.
 *
 * A `Derivation` is many premises and one conclusion. Composing two of them is
 * the operation design note `docs/planning/Atlas-Phase-3-Design.md` §0 names as
 * the one that can silently produce a false claim, and it states the invariant
 * this module exists to enforce:
 *
 * > A hyperedge composes only when EVERY premise edge is exact, and the
 * > composite's premises are the union of the inputs' premises MINUS the
 * > internal conclusions.
 *
 * Four gates enforce it, and each one is a reason to refuse:
 *
 * 1. **Consumption.** `second` must actually consume `first`'s conclusion. If
 *    it does not, the two are unrelated hyperedges and gluing them would
 *    assert a chain that was never drawn.
 * 2. **Relation.** `composeRelation` decides, exactly as it does for a binary
 *    chain. **A hyperedge cannot launder a pair the binary table refuses**
 *    (§3): if the two relations land on one of the fifty-six
 *    `'no-composite-claim'` cells, the hyperedge carries no claim either. This
 *    is also where "only exact hyperedges compose" is enforced — the table's
 *    eight defined cells ARE that set, and re-deciding exactness here with a
 *    second rule would be a second place for it to rot.
 * 3. **Context.** The union over every statement involved must EXIST.
 *    `statementContextUnion` returns a refusal rather than a merge when it
 *    does not, and that refusal propagates: no union, no composite.
 * 4. **Premises.** The composite's premises are `first.premises ∪
 *    second.premises` minus the internal conclusions — here, `first.conclusion`.
 *
 * ## Why the primary API returns a union and does not throw
 *
 * The S3.1 brief says composition "throws". The design note (§2) says the
 * refusal "is the correct output rather than an error", and requires the
 * result type to make "these do not compose" expressible WITHOUT a number or a
 * conclusion attached — mirroring `boundPath`'s no-claim. Both are served
 * here: {@link composeDerivations} returns a discriminated union, and
 * {@link composeDerivationsOrThrow} is a thin strict wrapper for callers that
 * genuinely want a failure. The union is primary because it is the shape a
 * caller cannot misread — a refusal has no `.derivation` to read.
 *
 * Pure: no I/O, no registry reads beyond the map a caller passes in.
 *
 * @module atlas/derivation
 */

import { composeRelation, NO_COMPOSITE_CLAIM } from './composition-table.js';
import type { CompositionResult } from './composition-table.js';
import { statementContextUnion } from './statement.js';
import type { ContextUnionResult, Statement, StatementId } from './statement.js';
import type { RelationType } from './types.js';

/** A `Derivation` id — `'d-noether-energy'`, … . @internal */
export type DerivationId = string;

/**
 * Many premises, one conclusion.
 *
 * `contextUnion` is a FIELD rather than a method because it is checked once,
 * at construction, and carried: a record whose premises do not pool is a
 * record that states no claim, and that fact travels with it.
 *
 * @internal
 */
export interface Derivation {
  readonly id: DerivationId;
  readonly relation: RelationType;
  readonly premises: readonly StatementId[];
  readonly conclusion: StatementId;
  readonly sideConditions: readonly string[];
  /** CHECKED, never merged. A `'no-union'` here means this record claims nothing. */
  readonly contextUnion: ContextUnionResult;
}

/** A `Derivation` without its checked union — what {@link makeDerivation} takes. @internal */
export type DerivationSpec = Omit<Derivation, 'contextUnion'>;

/**
 * Build a `Derivation`, checking the context union of its premises AND its
 * conclusion.
 *
 * The conclusion is included deliberately: a conclusion stated in a context
 * incompatible with its own premises is exactly the false claim §0 warns
 * about, and leaving it out would let one through.
 *
 * @throws RangeError via `statementContextUnion` if an id does not resolve.
 * @internal
 */
export function makeDerivation(
  spec: DerivationSpec,
  registry: ReadonlyMap<StatementId, Statement>,
): Derivation {
  return {
    ...spec,
    contextUnion: statementContextUnion([...spec.premises, spec.conclusion], registry),
  };
}

/** Why two hyperedges do not compose. @internal */
export type NoCompositeReason =
  /** `second` does not consume `first`'s conclusion. */
  | 'not-consumed'
  /** The binary composition table refuses the pair of relations. */
  | 'no-composite-claim'
  /** The statements involved have no context union. */
  | 'no-context-union'
  /** One of the inputs already states no claim of its own. */
  | 'input-states-no-claim';

/** The composite hyperedge. @internal */
export interface CompositeFormed {
  readonly kind: 'composite';
  readonly derivation: Derivation;
}

/** The two hyperedges do NOT compose, and this is why. @internal */
export interface CompositeRefused {
  readonly kind: 'no-composite';
  readonly reason: NoCompositeReason;
  readonly detail: string;
}

/** The result of {@link composeDerivations}. @internal */
export type DerivationCompositionResult = CompositeFormed | CompositeRefused;

/** Thrown by {@link composeDerivationsOrThrow}. Carries the refusal verbatim. @internal */
export class DerivationCompositionError extends Error {
  readonly reason: NoCompositeReason;
  constructor(refusal: CompositeRefused) {
    super(refusal.detail);
    this.name = 'DerivationCompositionError';
    this.reason = refusal.reason;
  }
}

/**
 * Compose `first` then `second` into one hyperedge, or refuse and say why.
 *
 * `D1: {A, B} ⊢ C` composed with `D2: {C, E} ⊢ F` yields `{A, B, E} ⊢ F`:
 * `C` is the internal conclusion and leaves the composite's premises.
 *
 * Premise ORDER is `first`'s surviving premises followed by `second`'s, each
 * de-duplicated on first appearance. Stable rather than sorted, so a composite
 * reads in the order the derivation was performed.
 *
 * @param id - the composite's id. Supplied by the caller rather than derived
 *   from the inputs, because a generated id would be a new identifier the
 *   registry does not know about.
 * @internal
 */
export function composeDerivations(
  id: DerivationId,
  first: Derivation,
  second: Derivation,
  registry: ReadonlyMap<StatementId, Statement>,
): DerivationCompositionResult {
  // ── Gate 0: an input that claims nothing composes to nothing ──────────────
  for (const [label, d] of [
    ['first', first],
    ['second', second],
  ] as const) {
    if (d.contextUnion.kind === 'no-union') {
      return {
        kind: 'no-composite',
        reason: 'input-states-no-claim',
        detail:
          `${label} derivation '${d.id}' has no context union ` +
          `(${d.contextUnion.reason}: ${d.contextUnion.detail}), so it states no claim to compose`,
      };
    }
  }

  // ── Gate 1: `second` must consume `first`'s conclusion ────────────────────
  if (!second.premises.includes(first.conclusion)) {
    return {
      kind: 'no-composite',
      reason: 'not-consumed',
      detail:
        `'${second.id}' does not take '${first.conclusion}' as a premise ` +
        `(its premises are ${second.premises.map((p) => `'${p}'`).join(', ')}), ` +
        `so '${first.id}' does not feed it`,
    };
  }

  // ── Gate 2: the binary table governs, and a hyperedge cannot launder it ───
  const relation: CompositionResult = composeRelation(first.relation, second.relation);
  if (relation === NO_COMPOSITE_CLAIM) {
    return {
      kind: 'no-composite',
      reason: NO_COMPOSITE_CLAIM,
      detail:
        `'${first.id}' (${first.relation}) then '${second.id}' (${second.relation}) ` +
        'composes to no relation; a hyperedge cannot assert what the binary table refuses',
    };
  }

  // ── Gate 4 (computed before gate 3 so the union covers the right set) ─────
  // The composite's premises: the union of the inputs' premises MINUS the
  // internal conclusions. `first.conclusion` is the only internal one for a
  // two-input composition; it is removed from BOTH sides, so a premise that
  // `first` also happened to require does not survive as an input it no longer
  // needs.
  const internal = new Set<StatementId>([first.conclusion]);
  const premises: StatementId[] = [];
  for (const p of [...first.premises, ...second.premises]) {
    if (internal.has(p)) continue;
    if (premises.includes(p)) continue;
    premises.push(p);
  }

  // ── Gate 3: the pooled context must exist over EVERY statement involved ───
  // Every statement, not just the surviving premises: the internal conclusion
  // is what the two halves meet at, and an incompatibility there is exactly
  // the one that would vanish from the composite's own field.
  const involved = [
    ...new Set([
      ...first.premises,
      first.conclusion,
      ...second.premises,
      second.conclusion,
    ]),
  ];
  const union = statementContextUnion(involved, registry);
  if (union.kind === 'no-union') {
    return {
      kind: 'no-composite',
      reason: 'no-context-union',
      detail:
        `'${first.id}' and '${second.id}' have no context union ` +
        `(${union.reason}: ${union.detail})`,
    };
  }

  return {
    kind: 'composite',
    derivation: {
      id,
      relation,
      premises,
      conclusion: second.conclusion,
      sideConditions: [
        ...new Set([...first.sideConditions, ...second.sideConditions]),
      ],
      contextUnion: union,
    },
  };
}

/**
 * {@link composeDerivations}, throwing on refusal.
 *
 * For callers that treat a refusal as a failure. Prefer the union-returning
 * form: a thrown error is easy to catch and discard, and a discarded refusal
 * is how a composite gets used anyway.
 *
 * @throws DerivationCompositionError on any refusal.
 * @internal
 */
export function composeDerivationsOrThrow(
  id: DerivationId,
  first: Derivation,
  second: Derivation,
  registry: ReadonlyMap<StatementId, Statement>,
): Derivation {
  const result = composeDerivations(id, first, second, registry);
  if (result.kind === 'no-composite') throw new DerivationCompositionError(result);
  return result.derivation;
}
