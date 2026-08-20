/**
 * Pareto scoring for probe candidates. Does not touch `VettedCandidate.score`.
 *
 * @module composition/probe/scoring
 */

import type { ProbeCandidateRecord, ScoreVector } from './types.js';

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

/** Build a score vector. @internal */
export function scoreCandidate(
  record: ProbeCandidateRecord,
  empirical = 0,
  corpusDistance = 1,
): ScoreVector {
  const parsimony = clamp01(1 / (1 + record.complexity.astNodes / 8));
  const validity = record.fingerprint.dimensionalSignature === 'invalid' ? 0 : 1;
  const robustness = record.status === 'falsification-survivor' ||
    record.status === 'expert-review-required'
    ? 1
    : record.status === 'heldout-supported'
      ? 0.7
      : 0.2;
  return {
    validity,
    empirical: clamp01(empirical),
    parsimony,
    corpusDistance: clamp01(corpusDistance),
    robustness,
  };
}

function dominates(a: ScoreVector, b: ScoreVector): boolean {
  const keys: (keyof ScoreVector)[] = [
    'validity',
    'empirical',
    'parsimony',
    'corpusDistance',
    'robustness',
  ];
  let better = false;
  for (const k of keys) {
    if (a[k] < b[k] - 1e-12) return false;
    if (a[k] > b[k] + 1e-12) better = true;
  }
  return better;
}

export interface RankedCandidate {
  readonly record: ProbeCandidateRecord;
  readonly scores: ScoreVector;
  readonly pareto: boolean;
}

/** Pareto front (non-dominated) plus the rest, stable by id. @internal */
export function rankPareto(
  items: readonly { record: ProbeCandidateRecord; scores: ScoreVector }[],
): RankedCandidate[] {
  return items
    .map((it) => ({
      ...it,
      pareto: !items.some(
        (other) => other.record.id !== it.record.id && dominates(other.scores, it.scores),
      ),
    }))
    .sort((a, b) => Number(b.pareto) - Number(a.pareto) || a.record.id.localeCompare(b.record.id));
}
