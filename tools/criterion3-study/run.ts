/**
 * Criterion 3, step 4: run the three IN-PROCESS retrieval conditions on the frozen inputs.
 *
 * Pre-registration Amendment 8 froze the corpus, the queries, the labels and the truth sets, the
 * scoring, and the code that ranks and scores, all before any condition ran. This runner:
 *
 * - refuses to run unless every file hash and every pinned code blob in Amendment 8 matches the tree;
 * - ranks every truth query with text retrieval, symbol matching and typed structural search
 *   (`src/atlas/benchmark/baselines.ts`, as built);
 * - scores recall at depth 10 with Wilson 95% intervals, on PRIMARY and on SECONDARY: pooled over all
 *   families (the criterion's pool), pooled over the in-distribution families, per family, and for
 *   the held-out family separately;
 * - counts the hits itself AND through `recallAtK`, and throws if the two disagree;
 * - records, per query, the rank of the first correct reference, so every number can be audited.
 *
 * The embedding condition does not run here, so there is no criterion verdict: the results are
 * INTERIM.
 *
 * Run: bun tools/criterion3-study/run.ts [--write]
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  rankBySymbolOverlap,
  rankByStructure,
  rankByTextOverlap,
  recallAtK,
  type CorpusRecord,
  type Ranking,
  type RetrievalQuery,
} from '../../src/atlas/benchmark/baselines.js';
import { leakageKey } from '../../src/atlas/benchmark/leakage.js';
import { wilsonInterval } from '../../src/atlas/benchmark/stats.js';
import { CANONICAL_EQUATIONS } from '../../src/canonical/registry.js';
import { residualCorpus } from './residual-corpus.js';

/** A ranking function of the pre-registered in-process conditions. */
export type Ranker = (query: RetrievalQuery, corpus: readonly CorpusRecord[]) => Ranking;

/** The three in-process conditions, in the order of pre-registration §5. */
export const CONDITIONS: readonly (readonly [string, Ranker])[] = [
  ['text retrieval', rankByTextOverlap],
  ['symbol matching', rankBySymbolOverlap],
  ['typed structural search', rankByStructure],
];

/** Recall at depth k for one group of queries. */
export interface GroupResult {
  readonly group: string;
  readonly n: number;
  readonly hits: number;
  readonly recall: number;
  readonly lower: number;
  readonly upper: number;
}

/** One condition's results on one truth set. */
export interface ConditionResult {
  readonly condition: string;
  readonly groups: readonly GroupResult[];
  /** Per query: the 1-based rank of the first correct reference in the full ranking. */
  readonly firstCorrectRank: Readonly<Record<string, number>>;
}

/** The label of the pooled group that the criterion is evaluated on. */
export const POOLED = 'all families';
/** The label of the in-distribution pooled group. */
export const IN_DISTRIBUTION = 'in-distribution families';

/**
 * Score every condition on one truth set. `familyOf` maps a query id to its family; the held-out
 * family is scored only in its own group and in the all-families pool.
 *
 * @throws Error when a truth query has no query record, or when the hit count and `recallAtK` disagree.
 */
export function scoreConditions(
  corpus: readonly CorpusRecord[],
  queries: ReadonlyMap<string, RetrievalQuery>,
  truth: Readonly<Record<string, readonly string[]>>,
  familyOf: (queryId: string) => string,
  heldOut: string,
  conditions: readonly (readonly [string, Ranker])[] = CONDITIONS,
  k = 10,
): ConditionResult[] {
  const ids = Object.keys(truth).sort();
  for (const q of ids) if (!queries.has(q)) throw new Error(`truth query ${q} has no query record`);
  const families = [...new Set(ids.map(familyOf))].sort();
  const groups: [string, string[]][] = [
    [POOLED, ids],
    [IN_DISTRIBUTION, ids.filter((q) => familyOf(q) !== heldOut)],
    ...families.filter((f) => f !== heldOut).map((f): [string, string[]] => [f, ids.filter((q) => familyOf(q) === f)]),
    [`${heldOut} (held out)`, ids.filter((q) => familyOf(q) === heldOut)],
  ];
  return conditions.map(([condition, rank]) => {
    const rankings = new Map<string, Ranking>(ids.map((q) => [q, rank(queries.get(q)!, corpus)]));
    const firstCorrectRank: Record<string, number> = {};
    for (const q of ids) {
      const r = rankings.get(q)!;
      const i = r.findIndex((id) => truth[q]!.includes(id));
      firstCorrectRank[q] = i < 0 ? Number.POSITIVE_INFINITY : i + 1;
    }
    const out: GroupResult[] = [];
    for (const [group, members] of groups) {
      if (members.length === 0) continue;
      const hits = members.filter((q) => firstCorrectRank[q]! <= k).length;
      // Second method: the scorer the pre-registration names must agree with the direct count.
      const viaScorer = recallAtK(rankings, new Map(members.map((q) => [q, truth[q]!])), k);
      if (Math.abs(viaScorer - hits / members.length) > 1e-12) {
        throw new Error(`${condition} / ${group}: counted ${hits}/${members.length} but recallAtK gave ${viaScorer}`);
      }
      const w = wilsonInterval(hits, members.length);
      out.push({ group, n: members.length, hits, recall: hits / members.length, lower: w.lower, upper: w.upper });
    }
    return { condition, groups: out, firstCorrectRank };
  });
}

/** Facts about the instrument, computed from the same inputs, reported beside the results. */
export interface Diagnostics {
  /** Query × record pairs, both with an expression, whose leakage keys are equal. */
  readonly keyEqualities: number;
  readonly keyPairs: number;
  /** Queries whose expression is a top-level difference (an `lhs − rhs` residual). */
  readonly residualQueries: number;
  readonly queries: number;
  /** Truth queries with at least one correct reference that HAS an expression. */
  readonly truthWithExpr: number;
  /** Truth queries sharing at least one symbol name with a correct reference. */
  readonly truthSharingSymbol: number;
  readonly truthQueries: number;
}

function symbolNames(node: unknown, out = new Set<string>()): Set<string> {
  const n = node as { kind?: string; name?: string; args?: unknown[]; arg?: unknown } | undefined;
  if (!n) return out;
  if (n.kind === 'symbol' && typeof n.name === 'string') {
    // As in baselines.ts: numeric literals are not symbols a reader would match on.
    if (!Number.isFinite(Number(n.name))) out.add(n.name);
  } else if (n.kind === 'op' && n.args) for (const a of n.args) symbolNames(a, out);
  else if (n.arg) symbolNames(n.arg, out);
  return out;
}

/**
 * Compute the instrument facts. `key` is the structural key the typed search compares
 * (`leakageKey` from `src/atlas/benchmark/leakage.ts`).
 */
export function diagnostics(
  corpus: readonly CorpusRecord[],
  queries: ReadonlyMap<string, RetrievalQuery>,
  truth: Readonly<Record<string, readonly string[]>>,
  key: (expr: NonNullable<RetrievalQuery['expr']>) => string,
): Diagnostics {
  const withExpr = corpus.filter((r) => r.expr !== undefined);
  const recordKeys = withExpr.map((r) => key(r.expr!));
  let keyEqualities = 0;
  let keyPairs = 0;
  let residualQueries = 0;
  for (const q of queries.values()) {
    if (q.expr === undefined) continue;
    const e = q.expr as { kind?: string; op?: string };
    if (e.kind === 'op' && e.op === '-') residualQueries++;
    const k = key(q.expr);
    for (const rk of recordKeys) {
      keyPairs++;
      if (rk === k) keyEqualities++;
    }
  }
  const byId = new Map(corpus.map((r) => [r.id, r]));
  let truthWithExpr = 0;
  let truthSharingSymbol = 0;
  for (const [q, ids] of Object.entries(truth)) {
    const refs = ids.map((id) => byId.get(id)).filter((r): r is CorpusRecord => r?.expr !== undefined);
    if (refs.length > 0) truthWithExpr++;
    const qs = symbolNames(queries.get(q)?.expr);
    if (refs.some((r) => [...symbolNames(r.expr)].some((s) => qs.has(s)))) truthSharingSymbol++;
  }
  return { keyEqualities, keyPairs, residualQueries, queries: queries.size, truthWithExpr, truthSharingSymbol, truthQueries: Object.keys(truth).length };
}

/** What a condition's hits rest on: the symbol names they share, and hits that share none. */
export interface HitAnatomy {
  readonly condition: string;
  readonly hits: number;
  /** Symbol names shared between a hit query and a correct reference, over all hits, sorted. */
  readonly sharedNames: readonly string[];
  /** Hits whose query shares NO symbol name with any correct reference: placed by the id tie-break. */
  readonly zeroOverlapHits: readonly string[];
}

/**
 * Analyse the top-k hits of one condition. With `key`, also count the hits whose query key equals the
 * key of a correct reference: the hits the STRUCTURAL tier placed.
 */
export function hitAnatomy(
  result: ConditionResult,
  corpus: readonly CorpusRecord[],
  queries: ReadonlyMap<string, RetrievalQuery>,
  truth: Readonly<Record<string, readonly string[]>>,
  k = 10,
  key?: (expr: NonNullable<RetrievalQuery['expr']>) => string,
): HitAnatomy & { readonly keyMatchedHits?: readonly string[] } {
  const byId = new Map(corpus.map((r) => [r.id, r]));
  const shared = new Set<string>();
  const zero: string[] = [];
  const keyed: string[] = [];
  let hits = 0;
  for (const [q, rank] of Object.entries(result.firstCorrectRank).sort()) {
    if (!(rank <= k)) continue;
    hits++;
    const qe = queries.get(q)?.expr;
    const qs = symbolNames(qe);
    const names = (truth[q] ?? []).flatMap((id) => [...symbolNames(byId.get(id)?.expr)].filter((s) => qs.has(s)));
    if (names.length === 0) zero.push(q);
    for (const n of names) shared.add(n);
    if (key && qe !== undefined) {
      const qk = key(qe);
      if ((truth[q] ?? []).some((id) => byId.get(id)?.expr !== undefined && key(byId.get(id)!.expr!) === qk)) keyed.push(q);
    }
  }
  const base = { condition: result.condition, hits, sharedNames: [...shared].sort(), zeroOverlapHits: zero };
  return key ? { ...base, keyMatchedHits: keyed } : base;
}

/**
 * The text of Amendment `n` in the pre-registration note: from its heading to the next amendment's,
 * or to the end. A later amendment's pins must never be read as an earlier one's. Empty when absent.
 */
export function amendmentSection(note: string, n: number): string {
  const start = note.indexOf(`**Amendment ${n} `);
  if (start < 0) return '';
  const next = note.indexOf(`**Amendment ${n + 1} `, start);
  return next < 0 ? note.slice(start) : note.slice(start, next);
}

/** The pinned code blobs an amendment records: `path` → git blob id, for paths under `src/` or `tools/`. */
export function pinnedBlobs(amendment: string): Map<string, string> {
  return new Map([...amendment.matchAll(/`((?:src|tools)\/[\w/.-]+\.ts)` ([0-9a-f]{40})/g)].map((m) => [m[1]!, m[2]!]));
}

/** The frozen file hashes Amendment 8 records: file → SHA-256. */
export function frozenHashes(amendment: string): Map<string, string> {
  return new Map([...amendment.matchAll(/^\| ([\w./-]+\.json) \| ([0-9a-f]{64}) \|$/gm)].map((m) => [m[1]!, m[2]!]));
}

const pct = (x: number) => `${(100 * x).toFixed(1)}%`;

/** The results as Markdown: one table per truth set, marked INTERIM, then the computed instrument facts. */
export function renderResults(
  sets: readonly (readonly [string, readonly ConditionResult[]])[],
  context: { readonly amendmentCommit: string; readonly amendmentCi: string },
  diag?: Diagnostics,
  anatomy: readonly HitAnatomy[] = [],
): string {
  const lines = [
    '## Criterion 3 — recall at depth 10 (INTERIM, pre-registration Amendment 8)',
    '',
    '**INTERIM: there is no criterion verdict yet.** The criterion compares typed structural search with',
    'the EMBEDDING condition, and the embedding condition has not run: it waits for LLMBench, and it',
    'will be scored from frozen vectors. The three in-process conditions below ran after Amendment 8',
    `was committed (\`${context.amendmentCommit}\`) and its CI run was green (${context.amendmentCi}).`,
    '',
    'MODEL labels (two blind `claude-opus-5-5` labelers), not human labels. Recall at depth 10 with Wilson',
    '95% intervals. The criterion is evaluated on PRIMARY, all families. Fluid statics is the held-out family.',
    'Reproduce: `bun tools/criterion3-study/run.ts --write`. The runner checks the file hashes and the code',
    'blobs that Amendment 8 pins, so a rerun scores the same inputs with the same ranking code.',
    '',
  ];
  for (const [set, results] of sets) {
    lines.push(`### ${set}`, '', `| Group | n | ${results.map((r) => r.condition).join(' | ')} |`, `|---|---|${results.map(() => '---').join('|')}|`);
    for (let g = 0; g < results[0]!.groups.length; g++) {
      const row = results.map((r) => {
        const x = r.groups[g]!;
        return `${x.hits}/${x.n} = ${pct(x.recall)} [${pct(x.lower)}, ${pct(x.upper)}]`;
      });
      const head = results[0]!.groups[g]!;
      lines.push(`| ${head.group} | ${head.n} | ${row.join(' | ')} |`);
    }
    lines.push('');
  }
  if (diag) {
    lines.push(
      '### Instrument facts (computed by the runner from the same inputs; PRIMARY)',
      '',
      `- **The typed structural tier never fires.** The structural keys of a query and a record are equal in ${diag.keyEqualities} of the ${diag.keyPairs} query × record pairs. Typed structural search therefore reduces to its symbol-overlap tie-break, which is why its column equals symbol matching.`,
      `- **The two sides encode different things.** ${diag.residualQueries} of ${diag.queries} queries store the claim as a residual \`lhs − rhs\` (a top-level difference). A canonical \`scalarAst\` stores the right-hand side of one target. The normal forms of a residual and of a right-hand side are never equal.`,
      `- **Symbol names follow different conventions.** A query writes physics notation (\`k_B\`, \`rho_0\`); a canonical entry writes descriptive names (\`boltzmann-constant\`, \`density\`). ${diag.truthSharingSymbol} of ${diag.truthQueries} truth queries share at least one symbol name with a correct reference.`,
      `- **Some references have no expression.** ${diag.truthWithExpr} of ${diag.truthQueries} truth queries have a correct reference with an expression. The others cannot be found by either expression condition.`,
      ...anatomy.map(
        (a) =>
          `- **What the ${a.condition} hits rest on.** Its ${a.hits} hits share the symbol name(s) ${a.sharedNames.map((n) => `\`${n}\``).join(', ') || '(none)'} with a correct reference. ${a.zeroOverlapHits.length} hit(s) (${a.zeroOverlapHits.join(', ') || 'none'}) share no name and reach the top 10 only through the id tie-break.`,
      ),
      '- These are facts about the pre-registered conditions as pinned. The conditions are not changed after the',
      '  results; a corrected structural condition would need its own amendment and would be exploratory.',
      '',
    );
  }
  return lines.join('\n');
}

/**
 * The EXPLORATORY section (Amendment 9), separate from the pinned results: the corrected condition
 * beside the pinned typed search, then its computed instrument facts.
 */
export function renderExploratory(
  sets: readonly (readonly [string, ConditionResult, ConditionResult])[],
  diag: Diagnostics,
  anatomy: HitAnatomy & { readonly keyMatchedHits?: readonly string[] },
  context: { readonly amendmentCommit: string; readonly amendmentCi: string },
): string {
  const lines = [
    '## Criterion 3 — EXPLORATORY, post hoc: typed structural search on residual forms (pre-registration Amendment 9)',
    '',
    '**EXPLORATORY and POST HOC. This is NOT the criterion, and it never replaces it.** Amendment 9 registered',
    'this condition after the in-process results above were seen. The criterion verdict stays on the',
    'conditions as pinned in Amendment 8. The corrected condition compares each claim, as stored',
    '(`lhs − rhs`), with each canonical entry in residual form (`target − scalarAst`). The structural key',
    `and the scoring are unchanged. It ran after Amendment 9 was committed (\`${context.amendmentCommit}\`)`,
    `and its CI run was green (${context.amendmentCi}). Same truth sets, same pool, same metric.`,
    '',
  ];
  for (const [set, pinned, corrected] of sets) {
    lines.push(`### ${set}`, '', `| Group | n | ${pinned.condition} (as pinned) | ${corrected.condition} (EXPLORATORY) |`, '|---|---|---|---|');
    for (let g = 0; g < pinned.groups.length; g++) {
      const a = pinned.groups[g]!;
      const b = corrected.groups[g]!;
      lines.push(`| ${a.group} | ${a.n} | ${a.hits}/${a.n} = ${pct(a.recall)} [${pct(a.lower)}, ${pct(a.upper)}] | ${b.hits}/${b.n} = ${pct(b.recall)} [${pct(b.lower)}, ${pct(b.upper)}] |`);
    }
    lines.push('');
  }
  const keyed = anatomy.keyMatchedHits ?? [];
  lines.push(
    '### Instrument facts for the EXPLORATORY condition (computed by the runner; PRIMARY)',
    '',
    `- **Structural keys now match in ${diag.keyEqualities} of the ${diag.keyPairs} query × record pairs** (0 as pinned).`,
    `- **Of its ${anatomy.hits} hits, ${keyed.length} were placed by a structural key match** (${keyed.join(', ') || 'none'}); the rest came from the symbol-overlap tie-break.`,
    `- ${anatomy.zeroOverlapHits.length} hit(s) (${anatomy.zeroOverlapHits.join(', ') || 'none'}) share no symbol name with a correct reference and match no key: they reach the top 10 only through the id tie-break.`,
    '- **Stated limitation:** no symbol-alias map was added. Query notation (`k_B`, `rho_0`) and canonical names',
    '  (`boltzmann-constant`, `density`) still differ in the symbol-overlap tier. An alias map would be a knob',
    '  fitted to these results.',
    '',
  );
  return lines.join('\n');
}

// ---------------------------------------------------------------- I/O (the command line)

function git(root: string, args: readonly string[]): string {
  const r = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git ${args.join(' ')}: ${r.stderr}`);
  return r.stdout.trim();
}

function main(argv: readonly string[]): number {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const dir = join(root, 'docs/research/criterion3');
  const note = readFileSync(join(root, 'docs/research/atlas-benchmark-preregistration.md'), 'utf8');
  const amendment = amendmentSection(note, 8);

  const problems: string[] = [];
  const blobs = pinnedBlobs(amendment);
  if (blobs.size !== 4) problems.push(`expected 4 pinned code blobs in Amendment 8, found ${blobs.size}`);
  for (const [path, id] of blobs) {
    const now = git(root, ['hash-object', path]);
    if (now !== id) problems.push(`${path}: blob ${now} is not the pinned ${id}`);
  }
  const hashes = frozenHashes(amendment);
  if (hashes.size !== 7) problems.push(`expected 7 frozen file hashes in Amendment 8, found ${hashes.size}`);
  for (const [file, h] of hashes) {
    const now = createHash('sha256').update(readFileSync(join(dir, file))).digest('hex');
    if (now !== h) problems.push(`${file}: sha256 ${now} is not the frozen ${h}`);
  }
  if (problems.length > 0) {
    console.error(`refusing to run: the tree does not match Amendment 8\n${problems.join('\n')}`);
    return 1;
  }

  const read = (p: string) => JSON.parse(readFileSync(join(dir, p), 'utf8'));
  const corpus = read('corpus.json') as CorpusRecord[];
  const queries = new Map((read('queries.json') as (RetrievalQuery & { id: string })[]).map((q) => [q.id, { text: q.text, expr: q.expr }]));
  const truth = read('truth.json') as { primary: Record<string, string[]>; secondary: Record<string, string[]> };
  const key = read('queries-key.json') as Record<string, string>;
  const items = JSON.parse(readFileSync(join(root, 'tests/fixtures/atlas/benchmark/public/items.json'), 'utf8')) as { id: string; family: string }[];
  const familyByItem = new Map(items.map((i) => [i.id, i.family]));
  const familyOf = (q: string) => {
    const f = familyByItem.get(key[q] ?? '');
    if (!f) throw new Error(`no family for ${q}`);
    return f;
  };
  const heldOut = 'fluid-statics';

  const primary = scoreConditions(corpus, queries, truth.primary, familyOf, heldOut);
  const secondary = scoreConditions(corpus, queries, truth.secondary, familyOf, heldOut);
  const context = { amendmentCommit: 'd99dcc9', amendmentCi: 'run 36028162207, success, 2026-09-24T16:36:15Z' };
  const diag = diagnostics(corpus, queries, truth.primary, leakageKey);
  const anatomy = primary
    .filter((r) => r.condition !== 'text retrieval')
    .map((r) => hitAnatomy(r, corpus, queries, truth.primary));
  const md = renderResults(
    [
      ['PRIMARY (n = 50: the exact-agreement non-empty queries)', primary],
      ['SECONDARY (n = 64: PRIMARY plus the 14 partial overlaps, truth = the intersection)', secondary],
    ],
    context,
    diag,
    anatomy,
  );
  // EXPLORATORY (Amendment 9): runs only when Amendment 9 is registered and its pins match.
  let exploratory: Record<string, unknown> | undefined;
  let mdExploratory = '';
  const a9 = amendmentSection(note, 9);
  if (a9) {
    const arg = (name: string) => {
      const i = argv.indexOf(name);
      return i >= 0 ? argv[i + 1] : undefined;
    };
    const a9Commit = arg('--amendment9-commit');
    const a9Ci = arg('--amendment9-ci');
    const pins9 = pinnedBlobs(a9);
    const p9: string[] = [];
    if (!a9Commit || !a9Ci) p9.push('Amendment 9 is registered: pass --amendment9-commit <sha> and --amendment9-ci "<run, result, time>"');
    if (pins9.size !== 2) p9.push(`expected 2 pinned code blobs in Amendment 9, found ${pins9.size}`);
    for (const [path, id] of pins9) {
      const now = git(root, ['hash-object', path]);
      if (now !== id) p9.push(`${path}: blob ${now} is not the pinned ${id}`);
    }
    if (p9.length > 0) {
      console.error(`refusing to run the EXPLORATORY condition: the tree does not match Amendment 9\n${p9.join('\n')}`);
      return 1;
    }
    const residual = residualCorpus(corpus, new Map(CANONICAL_EQUATIONS.map((e) => [e.id, e])));
    const corrected: [string, Ranker][] = [['typed structural search, residual form', rankByStructure]];
    const cPrimary = scoreConditions(residual, queries, truth.primary, familyOf, heldOut, corrected)[0]!;
    const cSecondary = scoreConditions(residual, queries, truth.secondary, familyOf, heldOut, corrected)[0]!;
    const pinnedTyped = (rs: readonly ConditionResult[]) => rs.find((r) => r.condition === 'typed structural search')!;
    const diag9 = diagnostics(residual, queries, truth.primary, leakageKey);
    const anatomy9 = hitAnatomy(cPrimary, residual, queries, truth.primary, 10, leakageKey);
    const context9 = { amendmentCommit: a9Commit!, amendmentCi: a9Ci! };
    mdExploratory = renderExploratory(
      [
        ['PRIMARY (n = 50)', pinnedTyped(primary), cPrimary],
        ['SECONDARY (n = 64)', pinnedTyped(secondary), cSecondary],
      ],
      diag9,
      anatomy9,
      context9,
    );
    exploratory = {
      amendment: 9,
      postHoc: true,
      context: context9,
      pinnedBlobs: Object.fromEntries(pins9),
      diagnostics: diag9,
      hitAnatomy: anatomy9,
      results: { primary: cPrimary, secondary: cSecondary },
    };
  }

  const json = {
    amendment: 8,
    interim: true,
    k: 10,
    context,
    pinnedBlobs: Object.fromEntries(blobs),
    frozenHashes: Object.fromEntries(hashes),
    diagnostics: diag,
    hitAnatomy: anatomy,
    results: { primary, secondary },
    ...(exploratory ? { exploratory } : {}),
  };
  const all = mdExploratory ? `${md}\n${mdExploratory}` : md;
  process.stdout.write(`${all}\n`);
  if (argv.includes('--write')) {
    writeFileSync(join(dir, 'results-interim.json'), `${JSON.stringify(json, (_k, v) => (v === Number.POSITIVE_INFINITY ? 'none' : v), 2)}\n`);
    writeFileSync(join(dir, 'results-interim.md'), `${all}\n`);
  }
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
