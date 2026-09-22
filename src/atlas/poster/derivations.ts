/**
 * Atlas Phase 3 — the poster's typed edges.
 *
 * `ROADMAP.md` Phase 3 states FIFTEEN bridge lines. This module records all
 * fifteen, each in the container its type demands, and {@link POSTER_LINES} is
 * the table that makes "all fifteen, correctly typed" a checkable claim rather
 * than a reading of the source.
 *
 * ## Three containers, because the lines are three different acts
 *
 * - **{@link POSTER_DERIVATIONS}** — a `Derivation` asserts `premises ⊢
 *   conclusion`. Most lines are this.
 * - **`./associations.ts`** — `7 ↔ 16` is an **association for the historical
 *   link only**, and `3, 14 → *` is association only. An `Association` makes
 *   no composite claim and is not a graph edge (`../association.ts`), which is
 *   exactly the content of those two lines.
 * - **{@link POSTER_CONSTRAINTS}** — `5, 16 → 8` *"constrain but do not
 *   determine"*. Neither of the other two containers can say that. A
 *   `Derivation` would assert that 5 and 16 YIELD 8, which is the claim the
 *   line explicitly denies; an `Association` would say only that the three
 *   resemble each other, which drops the constraint. **This third container is
 *   a correction to the S3.3 brief**, which allows only derivations and
 *   associations; recording `5, 16 → 8` as a derivation would have been the
 *   overclaim the sprint exists to prevent. The variational route the line
 *   names — Einstein–Hilbert — IS a derivation, and it is recorded as one.
 *
 * ## One derivation has no premises, and that is the honest form
 *
 * `d-4-commutator` records the line *"`4` derivation from the commutator and
 * Cauchy–Schwarz, no time-dependent equation needed"*. Its two inputs are not
 * poster entries, and they are not among the five hidden nodes `ROADMAP.md`
 * names. Inventing `statement-canonical-commutator` to fill the premise slot
 * would be the invention §5 of the design note forbids, so the inputs are
 * recorded as `sideConditions` and the premise set is empty. The empty set
 * does not assert that entry 4 follows from nothing — `sideConditions` carries
 * what it follows from — and {@link validatePosterRelations} pins that this is
 * the ONLY empty-premise record, so a second one cannot appear unnoticed.
 *
 * ## Witnesses
 *
 * `Derivation` has no `witnesses` field (`../derivation.ts` is Wave 1's and is
 * not mine to widen), so {@link POSTER_WITNESSES} is a side table keyed by
 * derivation id. The two Sprint 0 witnesses land where `ROADMAP.md` puts them:
 * W4 (chirped Gaussian) on `13 ↔ 4`, W5 (Wick rotation) on `6 ↔ 13`.
 *
 * @module atlas/poster/derivations
 */

import { makeDerivation } from '../derivation.js';
import type { Derivation, DerivationId } from '../derivation.js';
import type { StatementId } from '../statement.js';
import type { Witness } from '../types.js';
import { POSTER_ASSOCIATIONS, ASSOCIATION_ONLY_PAIRS } from './associations.js';
import { POSTER_REGISTRY, posterId } from './statements.js';

/**
 * `5, 16 → 8`: premises that CONSTRAIN a target without determining it.
 *
 * It has no `relation`, no `conclusion` and no context union, because it
 * concludes nothing. `alternativeRoute` names what does determine the target,
 * so the record cannot be read as "and nothing else does".
 *
 * @internal
 */
export interface PosterConstraint {
  readonly id: string;
  readonly premises: readonly StatementId[];
  /** What the premises constrain. NOT a conclusion. */
  readonly constrains: StatementId;
  /** Why the premises fall short of determining it. */
  readonly note: string;
  /** The derivation id that DOES reach the target, when one is recorded. */
  readonly alternativeRoute?: DerivationId;
}

/** Where a poster line is recorded. @internal */
export type LineContainer = 'derivation' | 'association' | 'constraint';

/**
 * One of the fifteen `ROADMAP.md` Phase 3 bridge lines, and the records that
 * carry it.
 *
 * @internal
 */
export interface PosterLine {
  /** `'L1'` … `'L15'`, in the order `ROADMAP.md` lists them. */
  readonly id: string;
  /** The line as `ROADMAP.md` writes it, in substance. */
  readonly line: string;
  /** Every container this line lands in. */
  readonly containers: readonly LineContainer[];
  /** Ids of the records, across those containers. */
  readonly records: readonly string[];
}

const d = (
  id: DerivationId,
  relation: Derivation['relation'],
  premises: readonly StatementId[],
  conclusion: StatementId,
  sideConditions: readonly string[],
): Derivation =>
  makeDerivation({ id, relation, premises, conclusion, sideConditions }, POSTER_REGISTRY);

/**
 * The poster's derivation hyperedges.
 *
 * Each `relation` is the type `ROADMAP.md` names for its line, and each
 * `sideConditions` list carries that line's qualifications — including the
 * ones that say what the edge does NOT give, because a qualification dropped
 * here is a claim widened silently.
 *
 * @internal
 */
export const POSTER_DERIVATIONS: readonly Derivation[] = [
  // L1 — "10 → 9 restriction plus separate frame content in 9".
  d('d-10-to-9', 'restriction', [posterId(10)], posterId(9), [
    'restriction to net force zero',
    "entry 9's inertial-frame content is SEPARATE and is not supplied by this restriction",
  ]),

  // L2 — "11 → momentum conservation for isolated particle systems (converse
  // fails; translation symmetry gives the field-inclusive version under action
  // and boundary assumptions)". Two records: the line states two routes.
  d('d-11-to-momentum', 'derivation', [posterId(11)], 'statement-momentum-conservation', [
    'isolated particle system',
    'the converse FAILS: momentum conservation does not give the third law',
    'fails naively when fields carry momentum',
  ]),
  d(
    'd-noether-to-momentum-fields',
    'derivation',
    ['statement-action-principle', 'statement-noether'],
    'statement-momentum-conservation-fields',
    [
      'spatial translation symmetry of a stated action',
      'stated boundary conditions',
      'this is the FIELD-INCLUSIVE version; it does not run through entry 11',
    ],
  ),

  // L3 — "1 ↔ energy conservation via Noether for autonomous models, which
  // defines neither heat nor a global energy in curved spacetime".
  d(
    'd-1-energy-conservation',
    'exact-equivalence',
    [posterId(1), 'statement-noether'],
    'statement-energy-conservation',
    [
      'autonomous model (no explicit time dependence)',
      'it defines NEITHER heat NOR work',
      'it gives NO global energy in curved spacetime',
    ],
  ),

  // L4 — "8 → 12 approximation (weak field, slow motion, near-stationary,
  // negligible Λ) then restriction to a point source". Recorded as ONE
  // approximation rather than two composed edges: the intermediate statement
  // (the weak-field field equation) is neither a poster entry nor one of the
  // five named hidden nodes, so a node for it would be invented. The two
  // stages are stated, in order, in the side conditions.
  d('d-8-to-12', 'approximation', [posterId(8)], posterId(12), [
    'weak field',
    'slow motion',
    'near-stationary',
    'negligible Λ',
    'THEN restriction to a point source',
  ]),

  // L5 — "16 → 5, 10 approximation in v/c, regular, needing E = γmc²,
  // p = γmv, F = dp/dt". One conclusion per record: a `Derivation` has one.
  d('d-16-to-5', 'approximation', [posterId(16)], posterId(5), [
    'expansion in v/c',
    'regular limit',
    'needs E = γmc², p = γmv, F = dp/dt',
  ]),
  d('d-16-to-10', 'approximation', [posterId(16)], posterId(10), [
    'expansion in v/c',
    'regular limit',
    'needs E = γmc², p = γmv, F = dp/dt',
  ]),

  // L6 (derivation half) — "the derivation route is a hyperedge {full Maxwell
  // system, spacetime structure} → 16, never from 7 alone". The historical
  // half of this line is an ASSOCIATION; see ./associations.ts.
  d(
    'd-maxwell-spacetime-to-16',
    'derivation',
    ['statement-maxwell-system', 'statement-lorentz-group'],
    posterId(16),
    [
      'the full Maxwell SYSTEM, never entry 7 alone',
      "'spacetime structure' is recorded as statement-lorentz-group; " +
        'ROADMAP.md names five hidden nodes and that is the one it can be',
    ],
  ),

  // L7 (the route that DOES determine 8) — "Einstein–Hilbert is a separate
  // variational route". The constraint half is in POSTER_CONSTRAINTS.
  d('d-einstein-hilbert-to-8', 'derivation', ['statement-action-principle'], posterId(8), [
    'the Einstein–Hilbert action',
    'variation with respect to the metric',
    'this route is SEPARATE from the 5, 16 constraint',
  ]),

  // L8 — "6 ↔ 15 linearity preserves superposition, Hilbert-space kinematics
  // supplies it". Typed one way only: the reverse is not this edge, because
  // superposition comes from the kinematics rather than from entry 6.
  d('d-6-to-15', 'derivation', [posterId(6)], posterId(15), [
    'linearity of the evolution equation preserves superposition',
    'Hilbert-space KINEMATICS supplies superposition; entry 6 does not',
  ]),

  // L9 — "4 derivation from the commutator and Cauchy–Schwarz, no
  // time-dependent equation needed". Premise set deliberately EMPTY; see the
  // module note.
  d('d-4-commutator', 'derivation', [], posterId(4), [
    'the canonical commutator [x, p] = iħ',
    'the Cauchy–Schwarz inequality',
    'NO time-dependent equation is needed; this route does not run through entry 6',
    'the two inputs are neither poster entries nor named hidden nodes, so no premise ' +
      'statement exists for them and none is invented',
  ]),

  // L10 — "13 ↔ 4: a Gaussian *family* saturates the bound, a Gaussian
  // density does not (Sprint 0 check 4)". Exact-equivalence because the
  // saturation is an EQUALITY at α = 0, which W4 computes exactly.
  d('d-13-4-saturation', 'exact-equivalence', [posterId(13)], posterId(4), [
    'a Gaussian FAMILY (parameterized by its width) saturates σ_x σ_p = ħ/2',
    'a Gaussian DENSITY does not: the chirped Gaussian is Gaussian in |ψ|² and ' +
      'has σ_x σ_p = (ħ/2)√(1 + 16α²s⁴) > ħ/2 for α ≠ 0',
    'σ > 0',
  ]),

  // L11 — "6 ↔ 13 analytic continuation to the heat semigroup for
  // self-adjoint, lower-bounded H, Gaussian kernel only when V = 0
  // (Sprint 0 check 5)".
  d('d-6-13-wick', 'analytic-continuation', [posterId(6)], posterId(13), [
    'self-adjoint H',
    'lower-bounded H',
    'the kernel is GAUSSIAN only when V = 0',
  ]),

  // L12 — "2 → 13 two routes (central limit, maximum entropy), neither from
  // Boltzmann alone".
  d(
    'd-2-13-central-limit',
    'derivation',
    [posterId(2), 'statement-central-limit-theorem'],
    posterId(13),
    [
      'independent, identically distributed summands of finite variance',
      'NOT from entry 2 alone: the theorem is the second premise',
      'σ > 0',
    ],
  ),
  d('d-2-13-maximum-entropy', 'derivation', [posterId(2)], posterId(13), [
    'maximum entropy subject to a fixed mean and variance',
    'NOT from entry 2 alone: the constraint set is an added input, and it is not a ' +
      'statement in this index',
    'σ > 0',
  ]),

  // L13 — "2 → 1 needs a microscopic energy model, an ensemble choice, and
  // definitions of heat and work".
  d('d-2-to-1', 'derivation', [posterId(2)], posterId(1), [
    'a microscopic energy model',
    'an ensemble choice',
    'definitions of heat and work',
  ]),

  // L14 — "6 → 10 Ehrenfest, exact for affine forces, approximate for
  // localized packets, distinct from the singular ħ → 0 limit". Two records:
  // one exact, one approximate. One record could carry only one relation
  // type, and the line states both.
  d('d-6-to-10-ehrenfest-exact', 'derivation', [posterId(6)], posterId(10), [
    'affine forces (F linear in x), for which the Ehrenfest relation is EXACT',
    'distinct from the singular ħ → 0 limit',
  ]),
  d('d-6-to-10-ehrenfest-approx', 'approximation', [posterId(6)], posterId(10), [
    'localized wave packets, for which the Ehrenfest relation is APPROXIMATE',
    'distinct from the singular ħ → 0 limit',
  ]),
];

/**
 * `5, 16 → 8` — the one line that asserts a constraint and denies a
 * derivation. See the module note for why it gets its own container.
 *
 * @internal
 */
export const POSTER_CONSTRAINTS: readonly PosterConstraint[] = [
  {
    id: 'c-5-16-constrain-8',
    premises: [posterId(5), posterId(16)],
    constrains: posterId(8),
    note:
      'entries 5 and 16 CONSTRAIN the field equations but do not determine them; ' +
      'Einstein–Hilbert is a separate variational route',
    alternativeRoute: 'd-einstein-hilbert-to-8',
  },
];

/**
 * The Sprint 0 witnesses, attached where `ROADMAP.md` Phase 3 puts them.
 *
 * A side table rather than a field, because `Derivation` is Wave 1's record
 * and widening it is not this brief's scope.
 *
 * @internal
 */
export const POSTER_WITNESSES: Readonly<Record<DerivationId, readonly Witness[]>> = {
  'd-13-4-saturation': [
    { id: 'W4', kind: 'numeric', test: 'tests/atlas/quantum-support.test.ts' },
  ],
  'd-6-13-wick': [
    {
      id: 'W5',
      kind: 'numeric',
      test: 'tests/atlas/quantum-support.test.ts',
      tolerance: '1e-4 sup-norm ratio on the stated interval',
    },
  ],
};

/**
 * The fifteen lines, and where each one is recorded.
 *
 * The table is the deliverable "all fifteen, correctly typed" in checkable
 * form: {@link validatePosterRelations} resolves every `records` id in every
 * `containers` entry, so a line that lost its record, or a record that moved
 * to the wrong container, is a failure rather than a reading.
 *
 * @internal
 */
export const POSTER_LINES: readonly PosterLine[] = [
  {
    id: 'L1',
    line: '10 → 9 restriction plus separate frame content in 9',
    containers: ['derivation'],
    records: ['d-10-to-9'],
  },
  {
    id: 'L2',
    line:
      '11 → momentum conservation for isolated particle systems (converse fails; ' +
      'translation symmetry gives the field-inclusive version)',
    containers: ['derivation'],
    records: ['d-11-to-momentum', 'd-noether-to-momentum-fields'],
  },
  {
    id: 'L3',
    line: '1 ↔ energy conservation via Noether for autonomous models',
    containers: ['derivation'],
    records: ['d-1-energy-conservation'],
  },
  {
    id: 'L4',
    line:
      '8 → 12 approximation (weak field, slow motion, near-stationary, negligible Λ) ' +
      'then restriction to a point source',
    containers: ['derivation'],
    records: ['d-8-to-12'],
  },
  {
    id: 'L5',
    line: '16 → 5, 10 approximation in v/c, regular, needing E = γmc², p = γmv, F = dp/dt',
    containers: ['derivation'],
    records: ['d-16-to-5', 'd-16-to-10'],
  },
  {
    id: 'L6',
    line:
      '7 ↔ 16 ASSOCIATION for the historical link only — the derivation route is the ' +
      'hyperedge {full Maxwell system, spacetime structure} → 16, never from 7 alone',
    containers: ['association', 'derivation'],
    records: ['a-7-16-historical', 'd-maxwell-spacetime-to-16'],
  },
  {
    id: 'L7',
    line: '5, 16 → 8 constrain but do not determine (Einstein–Hilbert is a separate route)',
    containers: ['constraint', 'derivation'],
    records: ['c-5-16-constrain-8', 'd-einstein-hilbert-to-8'],
  },
  {
    id: 'L8',
    line: '6 ↔ 15 linearity preserves superposition, Hilbert-space kinematics supplies it',
    containers: ['derivation'],
    records: ['d-6-to-15'],
  },
  {
    id: 'L9',
    line: '4 derivation from the commutator and Cauchy–Schwarz, no time-dependent equation',
    containers: ['derivation'],
    records: ['d-4-commutator'],
  },
  {
    id: 'L10',
    line: '13 ↔ 4 a Gaussian family saturates the bound, a Gaussian density does not',
    containers: ['derivation'],
    records: ['d-13-4-saturation'],
  },
  {
    id: 'L11',
    line:
      '6 ↔ 13 analytic continuation to the heat semigroup for self-adjoint, lower-bounded H, ' +
      'Gaussian kernel only when V = 0',
    containers: ['derivation'],
    records: ['d-6-13-wick'],
  },
  {
    id: 'L12',
    line: '2 → 13 two routes (central limit, maximum entropy), neither from Boltzmann alone',
    containers: ['derivation'],
    records: ['d-2-13-central-limit', 'd-2-13-maximum-entropy'],
  },
  {
    id: 'L13',
    line: '2 → 1 needs a microscopic energy model, an ensemble choice, and heat and work',
    containers: ['derivation'],
    records: ['d-2-to-1'],
  },
  {
    id: 'L14',
    line:
      '6 → 10 Ehrenfest, exact for affine forces, approximate for localized packets, ' +
      'distinct from the singular ħ → 0 limit',
    containers: ['derivation'],
    records: ['d-6-to-10-ehrenfest-exact', 'd-6-to-10-ehrenfest-approx'],
  },
  {
    id: 'L15',
    line: '3, 14 → * association only',
    containers: ['association'],
    records: ['a-3-association-only', 'a-14-association-only'],
  },
];

/** One defect {@link validatePosterRelations} found. @internal */
export interface PosterProblem {
  readonly kind:
    | 'unknown-statement'
    | 'no-context-union'
    | 'association-typed-as-derivation'
    | 'missing-record'
    | 'wrong-container'
    | 'unexpected-empty-premises';
  readonly detail: string;
}

/** Is `id` recorded in `container`? */
function recordExists(container: LineContainer, id: string): boolean {
  if (container === 'derivation') return POSTER_DERIVATIONS.some((x) => x.id === id);
  if (container === 'constraint') return POSTER_CONSTRAINTS.some((x) => x.id === id);
  return POSTER_ASSOCIATIONS.some((x) => x.id === id);
}

/** The only derivation entitled to an empty premise set. See the module note. */
const EMPTY_PREMISE_DERIVATION: DerivationId = 'd-4-commutator';

/**
 * Every defect this index can have that a type cannot catch.
 *
 * Six checks, and the third is the one the S3.3 brief singles out:
 *
 * 1. **Unknown statement.** Every premise and conclusion resolves in
 *    `POSTER_REGISTRY`.
 * 2. **No context union.** A derivation whose premises do not pool states no
 *    claim; `makeDerivation` records that rather than throwing, so a record
 *    carrying a refusal would otherwise sit in the list looking like an edge.
 * 3. **An association typed as a derivation.** `7 ↔ 16` and `3, 14 → *` are
 *    associations. If a derivation ever links either pair — in either
 *    direction — the distinction has been lost, and it is the distinction
 *    that carries the physics: the route to 16 runs from the full Maxwell
 *    system, *never from 7 alone*.
 * 4. **Missing record / 5. wrong container.** Every id in
 *    {@link POSTER_LINES} exists, in one of the containers its line declares.
 * 6. **Unexpected empty premises.** Exactly one record may have none.
 *
 * Returns problems rather than throwing, so a caller sees ALL of them at once
 * — a thrown first defect hides the rest, and this list is checked as a whole.
 *
 * @internal
 */
export function validatePosterRelations(): readonly PosterProblem[] {
  const problems: PosterProblem[] = [];

  for (const der of POSTER_DERIVATIONS) {
    for (const sid of [...der.premises, der.conclusion]) {
      if (!POSTER_REGISTRY.has(sid)) {
        problems.push({
          kind: 'unknown-statement',
          detail: `derivation '${der.id}' references unknown statement '${sid}'`,
        });
      }
    }
    if (der.contextUnion.kind === 'no-union') {
      problems.push({
        kind: 'no-context-union',
        detail:
          `derivation '${der.id}' has no context union ` +
          `(${der.contextUnion.reason}: ${der.contextUnion.detail}), so it states no claim`,
      });
    }
    if (der.premises.length === 0 && der.id !== EMPTY_PREMISE_DERIVATION) {
      problems.push({
        kind: 'unexpected-empty-premises',
        detail:
          `derivation '${der.id}' has no premises; only '${EMPTY_PREMISE_DERIVATION}' may, ` +
          'and its two inputs are recorded in its side conditions',
      });
    }

    for (const [a, b] of ASSOCIATION_ONLY_PAIRS) {
      const touches =
        (der.premises.includes(a) && der.conclusion === b) ||
        (der.premises.includes(b) && der.conclusion === a);
      if (touches) {
        problems.push({
          kind: 'association-typed-as-derivation',
          detail:
            `derivation '${der.id}' links '${a}' and '${b}', which ROADMAP.md Phase 3 ` +
            'records as an ASSOCIATION only; a derivation here asserts a route the line denies',
        });
      }
    }
  }

  for (const line of POSTER_LINES) {
    for (const id of line.records) {
      const where = line.containers.filter((c) => recordExists(c, id));
      if (where.length === 0) {
        const anywhere = (['derivation', 'association', 'constraint'] as const).filter((c) =>
          recordExists(c, id),
        );
        problems.push(
          anywhere.length > 0
            ? {
                kind: 'wrong-container',
                detail:
                  `line ${line.id} declares '${id}' in ${line.containers.join('/')} ` +
                  `but it is recorded in ${anywhere.join('/')}`,
              }
            : {
                kind: 'missing-record',
                detail: `line ${line.id} declares '${id}', which is recorded nowhere`,
              },
        );
      }
    }
  }

  return problems;
}
