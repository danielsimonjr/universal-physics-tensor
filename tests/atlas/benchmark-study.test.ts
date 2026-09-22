/**
 * Atlas Phase 6, S6.1 — scoring conditions and the paired comparison.
 * Synthetic in-memory labels and answers only.
 */

import { describe, expect, it } from 'vitest';
import { pairedRejection, scoreCondition } from '../../src/atlas/benchmark/study.js';
import type { ConditionAnswer, ItemLabel } from '../../src/atlas/benchmark/study.js';

const LABELS: ItemLabel[] = [
  { itemId: 'v1', kind: 'valid' },
  { itemId: 'v2', kind: 'valid' },
  { itemId: 'i1', kind: 'invalid', failureKind: 'domain-violation' },
  { itemId: 'i2', kind: 'invalid', failureKind: 'analogy-promoted' },
  { itemId: 'i3', kind: 'invalid', failureKind: 'false-inverse' },
];

describe('scoreCondition', () => {
  it('POSITIVE CONTROL: counts every cell, and keeps wrong accepts, abstentions and unanswered apart', () => {
    const answers: ConditionAnswer[] = [
      { itemId: 'v1', outcome: 'accept' },
      { itemId: 'v2', outcome: 'reject' },
      { itemId: 'i1', outcome: 'reject', detectedFailure: 'domain-violation' },
      { itemId: 'i2', outcome: 'accept' },
      // i3 unanswered
    ];
    const m = scoreCondition('c', answers, LABELS);
    expect(m).toMatchObject({
      nValid: 2,
      nInvalid: 3,
      invalidRejected: 1,
      kindNamedCorrectly: 1,
      wrongAccepts: 1,
      validAccepted: 1,
      falseRejects: 1,
      abstentions: 0,
      unanswered: 1,
    });
  });

  it('a rejection naming the WRONG kind still counts as rejected, but not as kind-correct', () => {
    const m = scoreCondition('c', [{ itemId: 'i1', outcome: 'reject', detectedFailure: 'false-inverse' }], LABELS);
    expect(m.invalidRejected).toBe(1);
    expect(m.kindNamedCorrectly).toBe(0);
  });

  it('an EMPTY answer key is an error — no measurement exists, so no zeros are reported', () => {
    expect(() => scoreCondition('c', [], [])).toThrow(/nothing to measure/);
  });

  it('an answer for an item not in the key is an error, not ignored', () => {
    expect(() => scoreCondition('c', [{ itemId: 'ghost', outcome: 'accept' }], LABELS)).toThrow(/unknown item/);
  });
});

describe('pairedRejection — the pre-registered comparison', () => {
  it('builds the 2×2 on the SAME invalid items; unanswered counts as not rejected', () => {
    const atlas: ConditionAnswer[] = [
      { itemId: 'i1', outcome: 'reject' },
      { itemId: 'i2', outcome: 'reject' },
    ];
    const llm: ConditionAnswer[] = [{ itemId: 'i1', outcome: 'reject' }];
    const r = pairedRejection('atlas', atlas, 'llm', llm, LABELS);
    expect(r.table).toEqual({ a: 1, b: 1, c: 0, d: 1 });
    expect(r.difference.diff).toBeCloseTo(1 / 3, 12);
    // Three items cannot exclude zero: the criterion is honestly NOT met.
    expect(r.aBetterExcludingZero).toBe(false);
  });

  it('refuses a key with no invalid items', () => {
    expect(() => pairedRejection('a', [], 'b', [], [{ itemId: 'v', kind: 'valid' }])).toThrow(/no invalid items/);
  });
});
