/**
 * Atlas Phase 5, S5.2 — the atlas condition runner.
 *
 * Synthetic in-memory items only; none is a benchmark item (design note §0).
 */

import { describe, expect, it } from 'vitest';
import { runAtlasCondition, runAtlasOnItem } from '../../src/atlas/benchmark/run-atlas.js';
import type { BenchmarkItem } from '../../src/atlas/benchmark/types.js';
import { dim, sym } from '../../src/dimensional/ast-builders.js';
import type { ExprNode } from '../../src/dimensional/ast-types.js';

const L = dim(1);
const T = dim(0, 0, 1);
const speed: ExprNode = { kind: 'op', op: '/', args: [sym('x', L), sym('t', T)] };

/** A fully-specified item that every instrument can run on and clear. */
const CLEAN: BenchmarkItem = {
  id: 'clean',
  kind: 'valid',
  premises: ['p'],
  conclusion: 'c',
  claimedRelation: 'exact-equivalence',
  family: 'waves',
  split: 'in-distribution',
  expr: speed,
  authorship: 'independent',
  source: 'harness test fixture',
  sideConditions: ['t > 0'],
  regime: { inequalities: [{ group: 'g', op: '<', bound: 1 }], values: { g: 0.5 } },
};

describe('accept — only when every instrument ran and cleared', () => {
  it('accepts the fully-specified clean item', () => {
    const v = runAtlasOnItem(CLEAN);
    expect(v.outcome).toBe('accept');
  });

  it('NEVER accepts when any field that feeds a check is absent — abstains instead', () => {
    const { sideConditions: _s, ...noSide } = CLEAN;
    const { regime: _r, ...noRegime } = CLEAN;
    expect(runAtlasOnItem(noSide as BenchmarkItem).outcome).toBe('abstain');
    expect(runAtlasOnItem(noRegime as BenchmarkItem).outcome).toBe('abstain');
  });

  it('an EMPTY regime is "nothing checked", not "checked and held" — abstain', () => {
    const v = runAtlasOnItem({ ...CLEAN, regime: { inequalities: [], values: {} } });
    expect(v.outcome).toBe('abstain');
    expect(v.reasons.join(' ')).toContain('states no inequality');
  });

  it('a regime value that is missing makes the check unrun — abstain, not accept', () => {
    const v = runAtlasOnItem({ ...CLEAN, regime: { inequalities: CLEAN.regime!.inequalities, values: {} } });
    expect(v.outcome).toBe('abstain');
  });

  it('an unguarded divisor is a QUESTION: abstain, not reject', () => {
    const v = runAtlasOnItem({ ...CLEAN, sideConditions: [] });
    expect(v.outcome).toBe('abstain');
    expect(v.reasons.some((r) => r.startsWith('QUESTION: division-unguarded'))).toBe(true);
  });
});

describe('accept needs at least one instrument that RAN — never a vacuous accept', () => {
  const TYPES_ONLY = { types: true, assumptions: false, dimensionsAndConventions: false, regimes: false };

  it('types only, and the item claims no chain: nothing ran, so abstain rather than accept', () => {
    const v = runAtlasOnItem(CLEAN, TYPES_ONLY);
    expect(v.outcome).toBe('abstain');
  });

  it('CONTROL: types only, and the item claims a chain the table clears: that check ran, so accept', () => {
    const chained: BenchmarkItem = { ...CLEAN, composedFrom: ['exact-equivalence', 'exact-equivalence'] };
    expect(runAtlasOnItem(chained, TYPES_ONLY).outcome).toBe('accept');
  });

  it('every instrument off: abstain', () => {
    const none = { types: false, assumptions: false, dimensionsAndConventions: false, regimes: false };
    expect(runAtlasOnItem(CLEAN, none).outcome).toBe('abstain');
  });
});

describe('reject — when an instrument demonstrably fires', () => {
  it('a convention mismatch rejects as convention-mismatch', () => {
    const v = runAtlasOnItem({
      ...CLEAN,
      conventions: { premise: { heatWorkSign: 'Q-W' }, conclusion: { heatWorkSign: 'Q+W' } },
    });
    expect(v.outcome).toBe('reject');
    expect(v.detectedFailure).toBe('convention-mismatch');
  });

  it('a dimensionally inconsistent claim (x + t) rejects, mapped to notation-collision', () => {
    const v = runAtlasOnItem({ ...CLEAN, expr: { kind: 'op', op: '+', args: [sym('x', L), sym('t', T)] } });
    expect(v.outcome).toBe('reject');
    expect(v.detectedFailure).toBe('notation-collision');
  });

  it('a violated regime rejects as domain-violation — even if every other check cleared', () => {
    const v = runAtlasOnItem({ ...CLEAN, regime: { ...CLEAN.regime!, values: { g: 2 } } });
    expect(v.outcome).toBe('reject');
    expect(v.detectedFailure).toBe('domain-violation');
  });

  it('a chain through structural-analogy claimed as exact rejects as analogy-promoted', () => {
    const v = runAtlasOnItem({ ...CLEAN, composedFrom: ['structural-analogy', 'exact-equivalence'] });
    expect(v.detectedFailure).toBe('analogy-promoted');
  });

  it('an exact equivalence claimed from a derivation chain is an overclaim: false-inverse', () => {
    const v = runAtlasOnItem({ ...CLEAN, composedFrom: ['derivation', 'exact-equivalence'] });
    expect(v.outcome).toBe('reject');
    expect(v.detectedFailure).toBe('false-inverse');
  });

  it('an exact equivalence claimed through a restriction drops its condition: omitted-premise', () => {
    const v = runAtlasOnItem({ ...CLEAN, composedFrom: ['restriction', 'exact-equivalence'] });
    expect(v.detectedFailure).toBe('omitted-premise');
  });
});

describe('composition — weaker true claims are not punished', () => {
  it('exact ∘ exact claimed as a DERIVATION clears (exact implies derivation)', () => {
    const v = runAtlasOnItem({
      ...CLEAN,
      claimedRelation: 'derivation',
      composedFrom: ['exact-equivalence', 'exact-equivalence'],
    });
    expect(v.outcome).toBe('accept');
  });

  it('a chain the table declines to compose abstains', () => {
    const v = runAtlasOnItem({ ...CLEAN, composedFrom: ['approximation', 'approximation'] });
    expect(v.outcome).toBe('abstain');
  });
});

describe('runAtlasCondition', () => {
  it('maps items to verdicts in order', () => {
    expect(runAtlasCondition([CLEAN, { ...CLEAN, id: 'b', sideConditions: undefined }]).map((v) => [v.itemId, v.outcome])).toEqual([
      ['clean', 'accept'],
      ['b', 'abstain'],
    ]);
  });
});
