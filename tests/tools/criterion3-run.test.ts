/**
 * Criterion 3, step 4 (`tools/criterion3-study/run.ts`): the in-process retrieval conditions.
 *
 * These tests check the scoring on SYNTHETIC inputs whose answers are known: the grouping (the
 * held-out family never enters the in-distribution pool), the hit count against `recallAtK`, and the
 * Wilson interval. They also check that the runner reads the pins and the frozen hashes out of
 * Amendment 8, since a runner that found no pins would check nothing.
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  amendmentSection,
  CONDITIONS,
  diagnostics,
  frozenHashes,
  hitAnatomy,
  IN_DISTRIBUTION,
  pinnedBlobs,
  POOLED,
  renderExploratory,
  renderResults,
  scoreConditions,
  type Ranker,
} from '../../tools/criterion3-study/run.js';
import { wilsonInterval } from '../../src/atlas/benchmark/stats.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const note = readFileSync(resolve(root, 'docs/research/atlas-benchmark-preregistration.md'), 'utf-8');
// Only Amendment 8's own text: a later amendment's pins or hashes must not be read as its.
const amendment = amendmentSection(note, 8);

// A synthetic corpus of 12 records; the "answer" ranker puts the record named in the query text first.
const corpus = Array.from({ length: 12 }, (_, i) => ({ id: `CE-${String(i).padStart(2, '0')}`, text: `record ${i}` }));
const answer: Ranker = (q, c) => {
  const want = q.text;
  return [...c].sort((a, b) => (a.id === want ? -1 : b.id === want ? 1 : a.id < b.id ? -1 : 1)).map((r) => r.id);
};
const reverse: Ranker = (_q, c) => [...c].map((r) => r.id).sort().reverse();

// Four queries: two in "osc", one in "waves", one in the held-out "fluid".
const queries = new Map([
  ['q-1', { text: 'CE-00' }],
  ['q-2', { text: 'CE-01' }],
  ['q-3', { text: 'CE-11' }],
  ['q-4', { text: 'CE-10' }],
]);
const truth = { 'q-1': ['CE-00'], 'q-2': ['CE-01'], 'q-3': ['CE-11'], 'q-4': ['CE-10'] };
const family: Record<string, string> = { 'q-1': 'osc', 'q-2': 'osc', 'q-3': 'waves', 'q-4': 'fluid' };

describe('criterion 3 runner — scoring', () => {
  const [ans, rev] = scoreConditions(corpus, queries, truth, (q) => family[q]!, 'fluid', [
    ['answer', answer],
    ['reverse', reverse],
  ]);

  it('groups: all families, in-distribution (no held-out), each family, then the held-out family', () => {
    expect(ans!.groups.map((g) => [g.group, g.n])).toEqual([
      [POOLED, 4],
      [IN_DISTRIBUTION, 3],
      ['osc', 2],
      ['waves', 1],
      ['fluid (held out)', 1],
    ]);
  });

  it('counts a hit only when a correct reference is in the top 10', () => {
    expect(ans!.groups[0]!.hits).toBe(4);
    // The reverse ranking puts CE-11 and CE-10 at ranks 1-2, and CE-00 and CE-01 at ranks 12 and 11.
    expect(rev!.firstCorrectRank).toEqual({ 'q-1': 12, 'q-2': 11, 'q-3': 1, 'q-4': 2 });
    expect(rev!.groups[0]!.hits).toBe(2);
    expect(rev!.groups.find((g) => g.group === 'osc')!.hits).toBe(0);
  });

  it('reports the Wilson interval of the counted hits', () => {
    const g = rev!.groups[0]!;
    expect(g.recall).toBe(0.5);
    expect([g.lower, g.upper]).toEqual([wilsonInterval(2, 4).lower, wilsonInterval(2, 4).upper]);
  });

  it('throws on a truth query with no query record', () => {
    expect(() => scoreConditions(corpus, new Map(), truth, (q) => family[q]!, 'fluid', [['answer', answer]])).toThrow(/no query record/);
  });

  it('runs the three pre-registered in-process conditions, in the order of §5', () => {
    expect(CONDITIONS.map((c) => c[0])).toEqual(['text retrieval', 'symbol matching', 'typed structural search']);
  });
});

describe('criterion 3 runner — the instrument facts', () => {
  const sym = (name: string) => ({ kind: 'symbol', name, dim: { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 } }) as never;
  const op = (o: string, ...args: unknown[]) => ({ kind: 'op', op: o, args }) as never;
  const dcorpus = [
    { id: 'CE-a', text: 'a', expr: op('*', sym('rho'), sym('g')) },
    { id: 'CE-b', text: 'b' },
  ];
  const dqueries = new Map([
    ['q-1', { text: 'x', expr: op('-', sym('p'), op('*', sym('rho'), sym('g'))) }],
    ['q-2', { text: 'y', expr: op('*', sym('rho'), sym('g')) }],
  ]);
  const dtruth = { 'q-1': ['CE-a'], 'q-2': ['CE-b'] };
  const key = (e: unknown) => JSON.stringify(e);

  it('counts equal structural keys, so a zero is a finding and not an unrun count (positive control)', () => {
    const d = diagnostics(dcorpus, dqueries, dtruth, key);
    expect(d.keyPairs).toBe(2);
    expect(d.keyEqualities).toBe(1);
  });

  it('separates hits that share a symbol from hits placed only by the id tie-break', () => {
    const result = { condition: 'symbol matching', groups: [], firstCorrectRank: { 'q-1': 1, 'q-2': 3 } };
    const a = hitAnatomy(result, dcorpus, dqueries, dtruth);
    expect(a.hits).toBe(2);
    expect(a.sharedNames).toEqual(['g', 'rho']);
    // q-2's reference CE-b has no expression, so it shares nothing: a tie-break hit.
    expect(a.zeroOverlapHits).toEqual(['q-2']);
  });

  it('counts residual queries, references with an expression, and shared symbol names', () => {
    const d = diagnostics(dcorpus, dqueries, dtruth, key);
    expect(d.residualQueries).toBe(1);
    expect(d.truthWithExpr).toBe(1);
    expect(d.truthSharingSymbol).toBe(1);
    expect(d.truthQueries).toBe(2);
  });
});

describe('criterion 3 runner — the pins it enforces', () => {
  it('reads the four pinned code blobs and the seven frozen hashes from Amendment 8', () => {
    expect([...pinnedBlobs(amendment).keys()].sort()).toEqual(
      ['src/atlas/benchmark/baselines.ts', 'src/atlas/benchmark/leakage.ts', 'src/atlas/benchmark/stats.ts', 'src/canonical/normal-form.ts'].sort(),
    );
    expect(frozenHashes(amendment).size).toBe(7);
  });

  it('finds no pins in text that has none (so an empty result is visible, not a pass)', () => {
    expect(pinnedBlobs('no pins here').size).toBe(0);
    expect(frozenHashes('no table here').size).toBe(0);
  });

  it('marks the rendered results INTERIM, with no criterion verdict', () => {
    const [ans] = scoreConditions(corpus, queries, truth, (q) => family[q]!, 'fluid', [['answer', answer]]);
    const md = renderResults([['PRIMARY', [ans!]]], { amendmentCommit: 'x', amendmentCi: 'y' });
    expect(md).toContain('INTERIM');
    expect(md).toContain('no criterion verdict');
    expect(md).not.toMatch(/\bMET\b/);
  });
});

describe('criterion 3 runner — Amendment 9 (EXPLORATORY) support', () => {
  const synthetic = [
    '**Amendment 8 (x) — first.** pins `src/a.ts` ' + 'a'.repeat(40),
    '**Amendment 9 (y) — second.** pins `src/canonical/residual.ts` ' + 'b'.repeat(40) + ' and `tools/x/y.ts` ' + 'c'.repeat(40),
  ].join('\n\n');

  it('reads one amendment only: a later amendment\'s pins never leak into an earlier one', () => {
    expect([...pinnedBlobs(amendmentSection(synthetic, 8)).keys()]).toEqual(['src/a.ts']);
    expect([...pinnedBlobs(amendmentSection(synthetic, 9)).keys()].sort()).toEqual(['src/canonical/residual.ts', 'tools/x/y.ts']);
    expect(amendmentSection(synthetic, 10)).toBe('');
  });

  it('counts the hits a structural key match placed, separately from symbol and tie-break hits', () => {
    const sym = (name: string) => ({ kind: 'symbol', name, dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 } }) as never;
    const c = [
      { id: 'CE-k', text: 'k', expr: sym('a') },
      { id: 'CE-t', text: 't' },
    ];
    const q = new Map([
      ['q-1', { text: 'x', expr: sym('a') }],
      ['q-2', { text: 'y', expr: sym('b') }],
    ]);
    const result = { condition: 'residual', groups: [], firstCorrectRank: { 'q-1': 1, 'q-2': 2 } };
    const a = hitAnatomy(result, c, q, { 'q-1': ['CE-k'], 'q-2': ['CE-t'] }, 10, (e) => JSON.stringify(e));
    expect(a.keyMatchedHits).toEqual(['q-1']);
    expect(a.zeroOverlapHits).toEqual(['q-2']);
  });

  it('renders the exploratory section as POST HOC and EXPLORATORY, never as the criterion', () => {
    const g = { group: 'all families', n: 2, hits: 1, recall: 0.5, lower: 0.1, upper: 0.9 };
    const r = (condition: string) => ({ condition, groups: [g], firstCorrectRank: {} });
    const md = renderExploratory(
      [['PRIMARY', r('typed structural search'), r('typed structural search, residual form')]],
      { keyEqualities: 3, keyPairs: 10, residualQueries: 0, queries: 0, truthWithExpr: 0, truthSharingSymbol: 0, truthQueries: 0 },
      { condition: 'x', hits: 1, sharedNames: [], zeroOverlapHits: [], keyMatchedHits: ['q-1'] },
      { amendmentCommit: 'c', amendmentCi: 'ci' },
    );
    expect(md).toContain('EXPLORATORY and POST HOC');
    expect(md).toContain('NOT the criterion');
    expect(md).toContain('(as pinned)');
    expect(md).not.toMatch(/\bMET\b/);
  });
});
