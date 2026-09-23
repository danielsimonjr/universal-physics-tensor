/**
 * Atlas Phase 5, S5.1 — item schema, loader and leakage checks.
 *
 * Design note: `docs/planning/Atlas-Phase-5-Design.md`.
 *
 * Every item built in THIS FILE is a synthetic test fixture for the harness, held
 * in memory. None is written to the fixture tree, and none may be copied into
 * the frozen set: no agent authors a frozen item (design note §0).
 */

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  checkRenamedVariants,
  findCrossSplitLeakage,
  leakageKey,
} from '../../src/atlas/benchmark/leakage.js';
import {
  BenchmarkAdmissionError,
  loadContestedDrafts,
  loadFrozenItems,
  validateItems,
} from '../../src/atlas/benchmark/loader.js';
import { HELD_OUT_FAMILY, HELD_OUT_MARKERS } from '../../src/atlas/benchmark/types.js';
import type { BenchmarkItem } from '../../src/atlas/benchmark/types.js';
import { ATLAS_FAMILIES } from '../../src/atlas/families.js';
import { sym, dim } from '../../src/dimensional/ast-builders.js';
import type { ExprNode } from '../../src/dimensional/ast-types.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const benchmarkDir = resolve(root, 'tests/fixtures/atlas/benchmark');

const L = dim(1);
const T = dim(0, 0, 1);
const div = (a: ExprNode, b: ExprNode): ExprNode => ({ kind: 'op', op: '/', args: [a, b] });

/** A synthetic item for harness tests. Never a benchmark item. */
function item(over: Partial<BenchmarkItem> & Pick<BenchmarkItem, 'id'>): BenchmarkItem {
  return {
    kind: 'valid',
    premises: ['synthetic premise'],
    conclusion: 'synthetic conclusion',
    claimedRelation: 'derivation',
    family: 'waves',
    split: 'in-distribution',
    expr: div(sym('x', L), sym('t', T)),
    authorship: 'independent',
    source: 'harness test fixture',
    ...over,
  };
}

function walkTs(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walkTs(full, acc);
    else if (e.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

/** Does this source text reach the benchmark's answer half? */
const reachesScorer = (text: string): boolean => /fixtures\/atlas\/benchmark\/scorer/.test(text);

describe('import guard — no src file may read the answer half', () => {
  it('POSITIVE CONTROL: the matcher fires on a path into the scorer half', () => {
    expect(reachesScorer("readFileSync('tests/fixtures/atlas/benchmark/scorer/labels.json')")).toBe(true);
    expect(reachesScorer("readFileSync('tests/fixtures/atlas/benchmark/public/items.json')")).toBe(false);
  });

  it('no file under src/ reaches it', () => {
    const files = walkTs(resolve(root, 'src'));
    expect(files.length).toBeGreaterThan(100);
    const hits = files.filter((f) => reachesScorer(readFileSync(f, 'utf-8')));
    expect(hits).toEqual([]);
  });
});

describe('leakageKey — renamed variables collide, different claims do not', () => {
  it('x/t and y/s — which normalForm alone keeps apart — share a key', () => {
    expect(leakageKey(div(sym('x', L), sym('t', T)))).toBe(leakageKey(div(sym('y', L), sym('s', T))));
  });

  it('x/t and t/x do not', () => {
    expect(leakageKey(div(sym('x', L), sym('t', T)))).not.toBe(leakageKey(div(sym('t', T), sym('x', L))));
  });

  it('a dimensionless constant factor does not separate two claims (normalForm drops it)', () => {
    const doubled: ExprNode = { kind: 'op', op: '*', args: [sym('2', dim()), div(sym('x', L), sym('t', T))] };
    expect(leakageKey(doubled)).toBe(leakageKey(div(sym('y', L), sym('s', T))));
  });
});

describe('findCrossSplitLeakage', () => {
  it('flags a held-out item whose claim, renamed, is already in the in-distribution split', () => {
    const leak = findCrossSplitLeakage([
      item({ id: 'in-1' }),
      item({
        id: 'out-1',
        split: 'held-out',
        family: HELD_OUT_FAMILY,
        expr: div(sym('h', L), sym('tau', T)),
      }),
    ]);
    expect(leak).toHaveLength(1);
    expect([...leak[0]!.ids].sort()).toEqual(['in-1', 'out-1']);
  });

  it('does not flag two same-split items, or two different claims across splits', () => {
    expect(findCrossSplitLeakage([item({ id: 'a' }), item({ id: 'b' })])).toEqual([]);
    expect(
      findCrossSplitLeakage([
        item({ id: 'a' }),
        item({
          id: 'b',
          split: 'held-out',
          family: HELD_OUT_FAMILY,
          expr: div(sym('t', T), sym('x', L)),
        }),
      ]),
    ).toEqual([]);
  });
});

describe('checkRenamedVariants — a variant lives in the SAME split as its original', () => {
  it('passes a correct variant', () => {
    expect(
      checkRenamedVariants([item({ id: 'o' }), item({ id: 'v', renamedVariant: 'o', expr: div(sym('y', L), sym('s', T)) })]),
    ).toEqual([]);
  });

  it('flags a variant split away from its original, a missing original, and a mislabelled "variant"', () => {
    const problems = checkRenamedVariants([
      item({ id: 'o' }),
      item({ id: 'v1', renamedVariant: 'o', split: 'held-out', family: HELD_OUT_FAMILY }),
      item({ id: 'v2', renamedVariant: 'gone' }),
      item({ id: 'v3', renamedVariant: 'o', expr: div(sym('t', T), sym('x', L)) }),
    ]);
    expect(problems.map((p) => [p.id, p.problem])).toEqual([
      ['v1', 'different-split'],
      ['v2', 'missing-original'],
      ['v3', 'not-same-claim'],
    ]);
  });
});

describe('validateItems — the schema and the independence rule', () => {
  it('refuses a contested draft in the FROZEN set, and an independent item in the CONTESTED set', () => {
    expect(validateItems([item({ id: 'd', authorship: 'contested-draft' })], true).map((p) => p.id)).toEqual(['d']);
    expect(validateItems([item({ id: 'i' })], false).map((p) => p.id)).toEqual(['i']);
  });

  it('an invalid item must name a known failure kind; a valid one must not name any', () => {
    const problems = validateItems(
      [
        item({ id: 'no-kind', kind: 'invalid' }),
        item({ id: 'bad-kind', kind: 'invalid', failureKind: 'made-up' as never }),
        item({ id: 'valid-with-kind', failureKind: 'domain-violation' }),
        item({ id: 'ok', kind: 'invalid', failureKind: 'analogy-promoted' }),
      ],
      true,
    );
    expect(problems.map((p) => p.id)).toEqual(['no-kind', 'bad-kind', 'valid-with-kind']);
  });

  it('the held-out split is exactly the held-out family', () => {
    const problems = validateItems(
      [item({ id: 'a', split: 'held-out' }), item({ id: 'b', family: HELD_OUT_FAMILY })],
      true,
    );
    expect(problems.map((p) => p.id)).toEqual(['a', 'b']);
  });

  it('duplicate ids are refused', () => {
    expect(validateItems([item({ id: 'x' }), item({ id: 'x' })], true).map((p) => p.problem)).toContain('duplicate id');
  });
});

describe('the committed fixture tree', () => {
  it('the frozen and contested sets load and are NON-empty (model-authored, Amendment 2)', () => {
    // Was: both EMPTY, because no agent could author a frozen item. The owner
    // lifted that on 2026-09-22; the items are MODEL-authored by an atlas-blind
    // instance, and loadFrozenItems still refuses any non-'independent' item.
    const frozen = loadFrozenItems(benchmarkDir);
    const contested = loadContestedDrafts(benchmarkDir);
    expect(frozen.length).toBeGreaterThan(0);
    expect(contested.length).toBeGreaterThan(0);
    for (const item of frozen) expect(item.source).toMatch(/^model-authored \(claude-fable-5-1, atlas-blind\)/);
  });

  it('BenchmarkAdmissionError carries every problem, not just the first', () => {
    const err = new BenchmarkAdmissionError([
      { id: 'a', problem: 'p1' },
      { id: 'b', problem: 'p2' },
    ]);
    expect(err.message).toContain('a: p1');
    expect(err.message).toContain('b: p2');
  });
});

describe('the held-out family is absent from src/atlas/', () => {
  const scanText = ATLAS_FAMILIES.flatMap((f) => [
    ...f.models.flatMap((m) => [m.id, m.dynamics, m.stateSpace]),
    ...f.bridges.map((b) => b.id),
  ]).map((s) => s.toLowerCase());

  const scan = (markers: readonly string[]): string[] =>
    scanText.filter((text) => markers.some((m) => text.includes(m)));

  it('POSITIVE CONTROL: the scan FINDS the plan’s original held-out family, first-order relaxation', () => {
    // model-first-order (b x′ + k x = 0) is why the family was changed.
    expect(scan(['first-order'])).toContain('model-first-order');
  });

  it(`no model id, dynamics, state space or bridge id names ${HELD_OUT_FAMILY}`, () => {
    expect(scan(HELD_OUT_MARKERS)).toEqual([]);
  });
});
