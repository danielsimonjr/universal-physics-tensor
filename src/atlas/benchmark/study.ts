/**
 * Atlas Phase 6, S6.1 — scoring a benchmark condition against the answer key.
 *
 * Design note: `docs/planning/Atlas-Phase-5-Design.md` §9.
 *
 * This module receives the answer key as an ARGUMENT. It never reads the scorer
 * half of the fixture tree itself: the import guard forbids any `src/` path into
 * it. The orchestration script (`scripts/run-atlas-study.mjs`) loads the labels
 * and passes them in.
 *
 * **An empty item set produces NO metrics, not zero metrics.** `scoreCondition`
 * throws on it: a table of zeros and NaNs from an empty set is indistinguishable,
 * at a glance, from a condition that failed everything.
 *
 * @module atlas/benchmark/study
 * @internal
 */

import type { FailureKind } from './types.js';
import { mcnemar, pairedDifferenceInterval, wilsonInterval } from './stats.js';
import type { Interval, McNemarResult } from './stats.js';

/** One condition's answer for one item. @internal */
export interface ConditionAnswer {
  readonly itemId: string;
  readonly outcome: 'accept' | 'reject' | 'abstain';
  readonly detectedFailure?: FailureKind;
}

/** The answer key for one item — scorer-side, never in the public half. @internal */
export interface ItemLabel {
  readonly itemId: string;
  readonly kind: 'valid' | 'invalid';
  /** For an invalid item: the failure kind a correct rejection names. */
  readonly failureKind?: FailureKind;
}

/** A condition's metrics on the frozen set. @internal */
export interface ConditionMetrics {
  readonly condition: string;
  readonly nValid: number;
  readonly nInvalid: number;
  /** Invalid items rejected, with its Wilson interval. */
  readonly invalidRejected: number;
  readonly invalidRejectionInterval: Interval;
  /** Of the rejected invalid items, how many named the right failure kind. */
  readonly kindNamedCorrectly: number;
  /** Invalid items ACCEPTED: the error the benchmark exists to count. */
  readonly wrongAccepts: number;
  /** Valid items accepted. */
  readonly validAccepted: number;
  /** Valid items rejected. */
  readonly falseRejects: number;
  /** All abstentions, reported and never folded into accuracy. */
  readonly abstentions: number;
  /** Items the condition did not answer at all: counted, never dropped. */
  readonly unanswered: number;
}

/**
 * Score one condition against the answer key.
 *
 * @throws Error when the key is empty (no measurement exists), or when an answer
 * names an item the key does not contain.
 * @internal
 */
export function scoreCondition(
  condition: string,
  answers: readonly ConditionAnswer[],
  labels: readonly ItemLabel[],
): ConditionMetrics {
  if (labels.length === 0) {
    throw new Error(`scoreCondition(${condition}): the answer key is empty — there is nothing to measure`);
  }
  const byId = new Map(answers.map((a) => [a.itemId, a]));
  const labelIds = new Set(labels.map((l) => l.itemId));
  for (const a of answers) {
    if (!labelIds.has(a.itemId)) throw new Error(`scoreCondition(${condition}): answer for unknown item ${a.itemId}`);
  }
  let nValid = 0;
  let nInvalid = 0;
  let invalidRejected = 0;
  let kindNamedCorrectly = 0;
  let wrongAccepts = 0;
  let validAccepted = 0;
  let falseRejects = 0;
  let abstentions = 0;
  let unanswered = 0;
  for (const label of labels) {
    const answer = byId.get(label.itemId);
    if (answer === undefined) unanswered++;
    else if (answer.outcome === 'abstain') abstentions++;
    if (label.kind === 'valid') {
      nValid++;
      if (answer?.outcome === 'accept') validAccepted++;
      if (answer?.outcome === 'reject') falseRejects++;
    } else {
      nInvalid++;
      if (answer?.outcome === 'accept') wrongAccepts++;
      if (answer?.outcome === 'reject') {
        invalidRejected++;
        if (answer.detectedFailure !== undefined && answer.detectedFailure === label.failureKind) {
          kindNamedCorrectly++;
        }
      }
    }
  }
  return {
    condition,
    nValid,
    nInvalid,
    invalidRejected,
    invalidRejectionInterval:
      nInvalid === 0 ? { lower: Number.NaN, upper: Number.NaN } : wilsonInterval(invalidRejected, nInvalid),
    kindNamedCorrectly,
    wrongAccepts,
    validAccepted,
    falseRejects,
    abstentions,
    unanswered,
  };
}

/** The paired comparison of two conditions' rejection of invalid items. @internal */
export interface PairedRejection {
  readonly conditionA: string;
  readonly conditionB: string;
  readonly table: { readonly a: number; readonly b: number; readonly c: number; readonly d: number };
  readonly difference: Interval & { readonly diff: number };
  readonly mcnemar: McNemarResult;
  /** The pre-registered criterion: the interval for A − B excludes zero, above it. */
  readonly aBetterExcludingZero: boolean;
}

/**
 * Compare two conditions on the SAME invalid items. An item counts as "right"
 * for a condition when it was rejected; an unanswered item is "wrong", not dropped.
 *
 * @throws Error when there are no invalid items.
 * @internal
 */
export function pairedRejection(
  conditionA: string,
  answersA: readonly ConditionAnswer[],
  conditionB: string,
  answersB: readonly ConditionAnswer[],
  labels: readonly ItemLabel[],
): PairedRejection {
  const invalid = labels.filter((l) => l.kind === 'invalid');
  if (invalid.length === 0) throw new Error('pairedRejection: no invalid items to compare on');
  const rejectedBy = (answers: readonly ConditionAnswer[]): Set<string> =>
    new Set(answers.filter((x) => x.outcome === 'reject').map((x) => x.itemId));
  const ra = rejectedBy(answersA);
  const rb = rejectedBy(answersB);
  let a = 0;
  let b = 0;
  let c = 0;
  let d = 0;
  for (const l of invalid) {
    const x = ra.has(l.itemId);
    const y = rb.has(l.itemId);
    if (x && y) a++;
    else if (x) b++;
    else if (y) c++;
    else d++;
  }
  const table = { a, b, c, d };
  const difference = pairedDifferenceInterval(table);
  return {
    conditionA,
    conditionB,
    table,
    difference,
    mcnemar: mcnemar(table),
    aBetterExcludingZero: difference.lower > 0,
  };
}

/** One row of the ablation: a configuration's metrics and its step over the previous one. @internal */
export interface AblationRow {
  readonly configuration: string;
  readonly metrics: ConditionMetrics;
  /** Paired rejection of THIS configuration vs the previous one; absent for the first. */
  readonly stepOverPrevious?: PairedRejection;
}

/**
 * Score a sequence of named condition runs as an ablation: each row is scored,
 * and each row after the first is compared, paired on the same invalid items,
 * against the row before it — so the table shows what each added layer bought.
 *
 * @internal
 */
export function scoreAblation(
  runs: ReadonlyArray<readonly [string, readonly ConditionAnswer[]]>,
  labels: readonly ItemLabel[],
): AblationRow[] {
  const rows: AblationRow[] = [];
  for (let i = 0; i < runs.length; i++) {
    const [name, answers] = runs[i]!;
    const metrics = scoreCondition(name, answers, labels);
    if (i === 0) rows.push({ configuration: name, metrics });
    else {
      const [prevName, prevAnswers] = runs[i - 1]!;
      rows.push({
        configuration: name,
        metrics,
        stepOverPrevious: pairedRejection(name, answers, prevName, prevAnswers, labels),
      });
    }
  }
  return rows;
}
