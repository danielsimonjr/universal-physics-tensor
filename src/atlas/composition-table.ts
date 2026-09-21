/**
 * The composition table for `RelationType` — a literal 8×8 matrix.
 *
 * `composeRelation(first, second)` answers: if one bridge asserts `first` and a
 * second bridge asserts `second`, what relation does the chain assert? The
 * argument order is the `First ∘ Second` column order of design note
 * `docs/planning/Atlas-Phase-1-Design.md` §2.1.
 *
 * **The table is a deliberate UNDER-approximation of Blueprint v2 §4.2.** Every
 * cell not named in §2.1 is `'no-composite-claim'`, because a wrong composite
 * type is a false physical claim while silence is only silence. Eight of the
 * sixty-four cells are defined; the remaining fifty-six are silent, and the
 * reasons for the notable silences are §2.2.
 *
 * Two cells the implementation plan asserts are NOT defined here, on the
 * authority of the design note (§0 and §2.2 item 5):
 *
 * - `exact-equivalence ∘ approximation`, either order. An exact equivalence
 *   contributes `IDENTITY_BOUND` only *in the norm a given bridge states* (see
 *   `./error-algebra.ts`), and no field in Sprint 1 records a norm, so
 *   norm-compatibility cannot be checked. A `norm?` field unblocks it in
 *   Phase 2.
 * - `structural-analogy ∘ structural-analogy`. Analogy is not transitive: the
 *   shared structure can dilute to nothing across a chain.
 *
 * Widening this table is a reviewed act — `tests/atlas/composition-table.test.ts`
 * pins the count of silent cells.
 *
 * Pure: no I/O, no registry reads, and no import from `src/composition/`.
 *
 * @module atlas/composition-table
 */

import type { RelationType } from './types.js';

/** What `composeRelation` returns when the chain asserts nothing. @internal */
export type NoCompositeClaim = 'no-composite-claim';

/** The result of composing two relations. @internal */
export type CompositionResult = RelationType | NoCompositeClaim;

/** @internal */
export const NO_COMPOSITE_CLAIM: NoCompositeClaim = 'no-composite-claim';

/**
 * Every row of every column, written out. `Record<RelationType, …>` makes the
 * exhaustiveness structural: a ninth `RelationType` member fails to compile
 * here rather than silently acquiring a row of `'no-composite-claim'`.
 *
 * @internal
 */
export const COMPOSITION_TABLE: Readonly<
  Record<RelationType, Readonly<Record<RelationType, CompositionResult>>>
> = {
  derivation: {
    derivation: 'derivation',
    'exact-equivalence': 'derivation',
    restriction: NO_COMPOSITE_CLAIM,
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': NO_COMPOSITE_CLAIM,
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
  'exact-equivalence': {
    derivation: 'derivation',
    'exact-equivalence': 'exact-equivalence',
    restriction: 'restriction',
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': NO_COMPOSITE_CLAIM,
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
  restriction: {
    derivation: NO_COMPOSITE_CLAIM,
    'exact-equivalence': 'restriction',
    restriction: 'restriction',
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': NO_COMPOSITE_CLAIM,
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
  approximation: {
    derivation: NO_COMPOSITE_CLAIM,
    'exact-equivalence': NO_COMPOSITE_CLAIM,
    restriction: NO_COMPOSITE_CLAIM,
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': NO_COMPOSITE_CLAIM,
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
  'coarse-graining': {
    derivation: NO_COMPOSITE_CLAIM,
    'exact-equivalence': NO_COMPOSITE_CLAIM,
    restriction: NO_COMPOSITE_CLAIM,
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': 'coarse-graining',
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
  'analytic-continuation': {
    derivation: NO_COMPOSITE_CLAIM,
    'exact-equivalence': NO_COMPOSITE_CLAIM,
    restriction: NO_COMPOSITE_CLAIM,
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': NO_COMPOSITE_CLAIM,
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
  'structural-analogy': {
    derivation: NO_COMPOSITE_CLAIM,
    'exact-equivalence': NO_COMPOSITE_CLAIM,
    restriction: NO_COMPOSITE_CLAIM,
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': NO_COMPOSITE_CLAIM,
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
  'deformation-quantization': {
    derivation: NO_COMPOSITE_CLAIM,
    'exact-equivalence': NO_COMPOSITE_CLAIM,
    restriction: NO_COMPOSITE_CLAIM,
    approximation: NO_COMPOSITE_CLAIM,
    'coarse-graining': NO_COMPOSITE_CLAIM,
    'analytic-continuation': NO_COMPOSITE_CLAIM,
    'structural-analogy': NO_COMPOSITE_CLAIM,
    'deformation-quantization': NO_COMPOSITE_CLAIM,
  },
};

/**
 * The relation a chain of two bridges asserts, or `'no-composite-claim'` when
 * this sprint declines to assert one. A table lookup — no rules, no inference.
 *
 * @internal
 */
export function composeRelation(
  first: RelationType,
  second: RelationType,
): CompositionResult {
  return COMPOSITION_TABLE[first][second];
}
