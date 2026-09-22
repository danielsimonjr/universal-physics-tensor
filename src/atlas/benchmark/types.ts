/**
 * Atlas Phase 5, S5.1 — the invalid-bridge benchmark's item schema.
 *
 * Design note: `docs/planning/Atlas-Phase-5-Design.md` §2.
 *
 * ⚠ **No agent authors a frozen item** (design note §0). This file defines the
 * SHAPE an independent author fills in; it contains no items.
 *
 * @module atlas/benchmark/types
 * @internal
 */

import type { ExprNode } from '../../dimensional/ast-types.js';
import type { Conventions, RegimeInequality, RelationType } from '../types.js';

/** The eight failure kinds, sampled evenly (ROADMAP Phase 5). @internal */
export const FAILURE_KINDS = [
  'omitted-premise',
  'domain-violation',
  'convention-mismatch',
  'notation-collision',
  'dimensional-coincidence',
  'non-uniform-limit',
  'false-inverse',
  'analogy-promoted',
] as const;

/** One failure kind. @internal */
export type FailureKind = (typeof FAILURE_KINDS)[number];

/**
 * Who wrote an item. Only `'independent'` may be frozen; `'contested-draft'`
 * is what an agent may produce, into `contested/`, and nothing else.
 *
 * @internal
 */
export type Authorship = 'independent' | 'contested-draft';

/** Which split an item scores in. @internal */
export type BenchmarkSplit = 'in-distribution' | 'held-out';

/**
 * The held-out family. Corrected from the plan's "first-order relaxation",
 * which Phase 0 already encodes as `model-first-order` (design note §4).
 *
 * @internal
 */
export const HELD_OUT_FAMILY = 'fluid-statics';

/**
 * Markers that identify the held-out family in model ids, dynamics and bridge
 * ids. `tests/atlas/benchmark.test.ts` scans the atlas for them, and proves the
 * scan can fire with the ORIGINAL family's markers as a positive control.
 *
 * @internal
 */
export const HELD_OUT_MARKERS: readonly string[] = [
  'hydrostat',
  'buoyan',
  'archimed',
  'pascal',
  'barometric',
  'fluid-static',
  'fluid statics',
];

/** One benchmark item, as its PUBLIC half carries it — never the answer. @internal */
export interface BenchmarkItem {
  readonly id: string;
  readonly kind: 'valid' | 'invalid';
  /** REQUIRED iff `kind === 'invalid'`. */
  readonly failureKind?: FailureKind;
  readonly premises: readonly string[];
  readonly conclusion: string;
  readonly claimedRelation: RelationType;
  readonly family: string;
  readonly split: BenchmarkSplit;
  /** The claimed relation as an AST, so the leakage check can run. */
  readonly expr: ExprNode;
  /** The id of the item this one renames, when it is a renamed-variable variant. */
  readonly renamedVariant?: string;
  readonly authorship: Authorship;
  /** Where the item came from: an erratum, a documented misconception, a textbook. */
  readonly source: string;

  // ── Machine fields (S5.2), all OPTIONAL. The atlas condition can decide only
  // what an item states; an absent field makes its check UNRUN, and an unrun
  // check can never support an accept. ────────────────────────────────────────

  /** The claim's stated side conditions, as prose. `[]` states "none". */
  readonly sideConditions?: readonly string[];
  /** Conventions declared by the premises and by the conclusion. */
  readonly conventions?: {
    readonly premise?: Conventions;
    readonly conclusion?: Conventions;
  };
  /** When the claim is a CHAIN: the two relations composed to reach `claimedRelation`. */
  readonly composedFrom?: readonly [RelationType, RelationType];
  /** The regime the claim is used in: its inequalities and the π-group values at the use site. */
  readonly regime?: {
    readonly inequalities: readonly RegimeInequality[];
    readonly values: Readonly<Record<string, number>>;
  };
}
