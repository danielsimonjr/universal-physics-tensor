/**
 * Atlas Phase 6, S6.2 — the ablation: four cumulative configurations of the
 * atlas runner. Synthetic in-memory items only.
 */

import { describe, expect, it } from 'vitest';
import {
  ABLATION_CONFIGS,
  FULL_CONFIG,
  runAtlasCondition,
  runAtlasOnItem,
} from '../../src/atlas/benchmark/run-atlas.js';
import { scoreAblation } from '../../src/atlas/benchmark/study.js';
import type { ItemLabel } from '../../src/atlas/benchmark/study.js';
import type { BenchmarkItem } from '../../src/atlas/benchmark/types.js';
import { dim, sym } from '../../src/dimensional/ast-builders.js';
import type { ExprNode } from '../../src/dimensional/ast-types.js';

const L = dim(1);
const T = dim(0, 0, 1);
const speed: ExprNode = { kind: 'op', op: '/', args: [sym('x', L), sym('t', T)] };

const BASE: BenchmarkItem = {
  id: 'base',
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

/** Four invalid items, each caught by exactly ONE instrument. The answers live in LABELS only. */
const ITEMS: BenchmarkItem[] = [
  { ...BASE, id: 'by-types', composedFrom: ['structural-analogy', 'exact-equivalence'] },
  { ...BASE, id: 'by-assumptions', expr: { kind: 'op', op: '/', args: [sym('x', L), sym('0', dim())] } },
  {
    ...BASE,
    id: 'by-conventions',
    conventions: { premise: { heatWorkSign: 'Q-W' }, conclusion: { heatWorkSign: 'Q+W' } },
  },
  { ...BASE, id: 'by-regimes', regime: { ...BASE.regime!, values: { g: 5 } } },
];
const LABELS: ItemLabel[] = [
  { itemId: 'by-types', kind: 'invalid', failureKind: 'analogy-promoted' },
  { itemId: 'by-assumptions', kind: 'invalid', failureKind: 'domain-violation' },
  { itemId: 'by-conventions', kind: 'invalid', failureKind: 'convention-mismatch' },
  { itemId: 'by-regimes', kind: 'invalid', failureKind: 'domain-violation' },
];

describe('ABLATION_CONFIGS', () => {
  it('are the plan’s four, cumulative, ending at the full configuration', () => {
    expect(ABLATION_CONFIGS.map(([n]) => n)).toEqual([
      'types only',
      '+ assumptions',
      '+ dimensions & conventions',
      '+ regimes',
    ]);
    expect(ABLATION_CONFIGS[3]![1]).toEqual(FULL_CONFIG);
  });

  it('each added layer catches exactly the item built for it: 1, 2, 3, 4 rejected', () => {
    const rejected = ABLATION_CONFIGS.map(([, cfg]) =>
      runAtlasCondition(ITEMS, cfg).filter((v) => v.outcome === 'reject').map((v) => v.itemId),
    );
    expect(rejected).toEqual([
      ['by-types'],
      ['by-types', 'by-assumptions'],
      ['by-types', 'by-assumptions', 'by-conventions'],
      ['by-types', 'by-assumptions', 'by-conventions', 'by-regimes'],
    ]);
  });

  it('runAtlasCondition never passes the array INDEX as the config (the map(fn) trap)', () => {
    // items.map(runAtlasOnItem) would hand index 0,1,… to the config parameter.
    const viaCondition = runAtlasCondition(ITEMS).map((v) => v.outcome);
    const viaItem = ITEMS.map((i) => runAtlasOnItem(i).outcome);
    expect(viaCondition).toEqual(viaItem);
  });
});

describe('scoreAblation', () => {
  it('scores each configuration and pairs each against the one before', () => {
    const rows = scoreAblation(
      ABLATION_CONFIGS.map(([name, cfg]) => [name, runAtlasCondition(ITEMS, cfg)] as const),
      LABELS,
    );
    expect(rows.map((r) => r.metrics.invalidRejected)).toEqual([1, 2, 3, 4]);
    expect(rows[0]!.stepOverPrevious).toBeUndefined();
    for (const r of rows.slice(1)) expect(r.stepOverPrevious!.table).toMatchObject({ b: 1, c: 0 });
  });
});
