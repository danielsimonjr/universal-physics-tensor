/**
 * Criterion 3, the EMBEDDING condition (pre-registration Amendment 11).
 *
 * Two steps, in the order the pre-registration fixes:
 *
 * 1. `embed` embeds the frozen corpus and queries ONCE with a local Ollama model and writes the vectors
 *    to a file. Records are embedded as they are; queries carry the registered instruction
 *    (`queryInput`). Local embeddings vary run to run, so the file, not the model, is what is scored.
 * 2. `score` refuses to run unless every Amendment 8 pin and every Amendment 11 pin (the code blob, the
 *    vector-file hash, the model and its digest) matches the tree. It then ranks by cosine similarity,
 *    scores recall at depth 10 exactly as the in-process conditions are scored, and applies §6 item 3:
 *    the criterion is met only when the typed structural search's Wilson interval lies above the
 *    embedding condition's point estimate, on PRIMARY pooled over all families.
 *
 * `--variance <file>` scores a second, independent embedding pass beside the frozen one. It is disclosed
 * and never replaces the frozen pass.
 *
 * Run: bun tools/criterion3-study/embedding.ts embed --model <name> --out <file>
 *      bun tools/criterion3-study/embedding.ts score --vectors <file> [--variance <file>] [--write]
 */

import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rankByStructure, type CorpusRecord, type RetrievalQuery } from '../../src/atlas/benchmark/baselines.js';
import {
  amendmentSection,
  frozenHashes,
  pinnedBlobs,
  POOLED,
  scoreConditions,
  type ConditionResult,
  type GroupResult,
  type Ranker,
} from './run.js';

/** The instruction every query carries, in the Qwen3-Embedding query format. Records carry none. */
export const EMBEDDING_INSTRUCTION =
  'Given a physics claim, retrieve the established physical relation that the claim restates or misuses';

/** The text embedded for a query. */
export function queryInput(text: string): string {
  return `Instruct: ${EMBEDDING_INSTRUCTION}\nQuery: ${text}`;
}

/** A vector as little-endian float32, base64-encoded. */
export function encodeVector(v: readonly number[]): string {
  return Buffer.from(Float32Array.from(v).buffer).toString('base64');
}

/** The inverse of `encodeVector`. */
export function decodeVector(s: string): Float32Array {
  const b = Buffer.from(s, 'base64');
  return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}

/** Cosine similarity of two vectors of equal length. */
export function cosine(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) throw new Error(`vector lengths differ: ${a.length} vs ${b.length}`);
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    na += a[i]! * a[i]!;
    nb += b[i]! * b[i]!;
  }
  return na === 0 || nb === 0 ? 0 : dot / Math.sqrt(na * nb);
}

/**
 * A ranker over stored vectors: cosine similarity, best first, ties broken by id (the order the
 * in-process conditions use). Queries are looked up by object identity.
 *
 * @throws Error when a query or a record has no vector.
 */
export function embeddingRanker(
  queryVectors: ReadonlyMap<RetrievalQuery, Float32Array>,
  recordVectors: ReadonlyMap<string, Float32Array>,
): Ranker {
  return (query, corpus) => {
    const q = queryVectors.get(query);
    if (!q) throw new Error(`query has no vector: ${query.text.slice(0, 60)}`);
    return corpus
      .map((r) => {
        const v = recordVectors.get(r.id);
        if (!v) throw new Error(`record ${r.id} has no vector`);
        return { id: r.id, s: cosine(q, v) };
      })
      .sort((a, b) => (b.s !== a.s ? b.s - a.s : a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .map((x) => x.id);
  };
}

/** The §6 item 3 verdict. */
export interface CriterionVerdict {
  readonly met: boolean;
  readonly typedLower: number;
  readonly embeddingRecall: number;
}

/** §6 item 3: met only when the typed search's Wilson interval lies above the embedding point estimate. */
export function criterionVerdict(typed: GroupResult, embedding: GroupResult): CriterionVerdict {
  return { met: typed.lower > embedding.recall, typedLower: typed.lower, embeddingRecall: embedding.recall };
}

/** A frozen embedding pass. Vectors are `encodeVector` strings keyed by record or query id. */
export interface VectorFile {
  readonly model: string;
  readonly digest: string;
  readonly dims: number;
  readonly instruction: string;
  readonly corpus: Readonly<Record<string, string>>;
  readonly queries: Readonly<Record<string, string>>;
}

// Not OLLAMA_HOST: that variable is the server's bind address (for example 0.0.0.0:11434), not a URL.
const OLLAMA = process.env['UPT_OLLAMA_URL'] ?? 'http://localhost:11434';

async function ollamaEmbed(model: string, input: readonly string[]): Promise<number[][]> {
  const res = await fetch(`${OLLAMA}/api/embed`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ model, input }),
  });
  if (!res.ok) throw new Error(`ollama /api/embed: HTTP ${res.status} ${await res.text()}`);
  const body = (await res.json()) as { embeddings?: number[][] };
  if (!Array.isArray(body.embeddings) || body.embeddings.length !== input.length) {
    throw new Error(`ollama /api/embed returned ${body.embeddings?.length ?? 'no'} embeddings for ${input.length} inputs`);
  }
  return body.embeddings;
}

async function ollamaDigest(model: string): Promise<string> {
  const res = await fetch(`${OLLAMA}/api/tags`);
  if (!res.ok) throw new Error(`ollama /api/tags: HTTP ${res.status}`);
  const models = ((await res.json()) as { models: { name: string; digest: string }[] }).models;
  const m = models.find((x) => x.name === model);
  if (!m) throw new Error(`model ${model} is not installed`);
  return m.digest;
}

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = join(ROOT, 'docs/research/criterion3');
const read = (p: string) => JSON.parse(readFileSync(join(DIR, p), 'utf8'));

async function embed(model: string, out: string): Promise<void> {
  const corpus = read('corpus.json') as CorpusRecord[];
  const queries = read('queries.json') as (RetrievalQuery & { id: string })[];
  const digest = await ollamaDigest(model);
  const encodeAll = async (items: readonly { id: string; input: string }[]) => {
    const outMap: Record<string, string> = {};
    let dims = 0;
    for (let i = 0; i < items.length; i += 16) {
      const batch = items.slice(i, i + 16);
      const vs = await ollamaEmbed(model, batch.map((b) => b.input));
      batch.forEach((b, j) => {
        dims = vs[j]!.length;
        outMap[b.id] = encodeVector(vs[j]!);
      });
    }
    return { outMap, dims };
  };
  const c = await encodeAll(corpus.map((r) => ({ id: r.id, input: r.text })));
  const q = await encodeAll(queries.map((x) => ({ id: x.id, input: queryInput(x.text) })));
  if (c.dims !== q.dims) throw new Error(`dims differ: corpus ${c.dims}, queries ${q.dims}`);
  const sorted = (m: Record<string, string>) => Object.fromEntries(Object.entries(m).sort(([a], [b]) => (a < b ? -1 : 1)));
  const file: VectorFile = {
    model,
    digest,
    dims: c.dims,
    instruction: EMBEDDING_INSTRUCTION,
    corpus: sorted(c.outMap),
    queries: sorted(q.outMap),
  };
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, `${JSON.stringify(file, null, 1)}\n`);
  const sha = createHash('sha256').update(readFileSync(out)).digest('hex');
  console.log(`wrote ${out}: ${model} ${digest}, ${c.dims} dims, ${corpus.length} records, ${queries.length} queries, sha256 ${sha}`);
}

function gitBlob(path: string): string {
  const r = spawnSync('git', ['hash-object', path], { cwd: ROOT, encoding: 'utf8' });
  if (r.status !== 0) throw new Error(`git hash-object ${path}: ${r.stderr}`);
  return r.stdout.trim();
}

/** Every pin problem in one amendment: code blobs and frozen file hashes (paths under criterion3/). */
function pinProblems(amendment: string, blobCount: number, hashCount: number, label: string): string[] {
  const problems: string[] = [];
  const blobs = pinnedBlobs(amendment);
  if (blobs.size !== blobCount) problems.push(`expected ${blobCount} pinned code blobs in ${label}, found ${blobs.size}`);
  for (const [path, id] of blobs) {
    const now = gitBlob(path);
    if (now !== id) problems.push(`${path}: blob ${now} is not the pinned ${id}`);
  }
  const hashes = frozenHashes(amendment);
  if (hashes.size !== hashCount) problems.push(`expected ${hashCount} frozen file hashes in ${label}, found ${hashes.size}`);
  for (const [file, h] of hashes) {
    const now = createHash('sha256').update(readFileSync(join(DIR, file))).digest('hex');
    if (now !== h) problems.push(`${file}: sha256 ${now} is not the frozen ${h}`);
  }
  return problems;
}

function score(argv: readonly string[]): number {
  const arg = (name: string) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const vectorsPath = arg('--vectors');
  if (!vectorsPath) {
    console.error('score needs --vectors <file>');
    return 2;
  }
  const note = readFileSync(join(ROOT, 'docs/research/atlas-benchmark-preregistration.md'), 'utf8');
  const a11 = amendmentSection(note, 11);
  const vf = JSON.parse(readFileSync(vectorsPath, 'utf8')) as VectorFile;
  const rel = relative(DIR, resolve(vectorsPath)).replace(/\\/g, '/');
  const problems = [
    ...pinProblems(amendmentSection(note, 8), 4, 7, 'Amendment 8'),
    ...(a11 ? pinProblems(a11, 2, 1, 'Amendment 11') : ['Amendment 11 is not registered']),
  ];
  // The order the pre-registration fixes: no score until the amendment is COMMITTED and its CI is green.
  const a11Commit = arg('--amendment11-commit');
  const a11Ci = arg('--amendment11-ci');
  if (!a11Commit || !a11Ci) problems.push('pass --amendment11-commit <sha> and --amendment11-ci "<run, result, time>"');
  else {
    const anc = spawnSync('git', ['merge-base', '--is-ancestor', a11Commit, 'HEAD'], { cwd: ROOT });
    if (anc.status !== 0) problems.push(`${a11Commit} is not an ancestor of HEAD`);
    const shown = spawnSync('git', ['show', `${a11Commit}:docs/research/atlas-benchmark-preregistration.md`], { cwd: ROOT, encoding: 'utf8' });
    if (shown.status !== 0 || !shown.stdout.includes('**Amendment 11 ')) problems.push(`${a11Commit} does not contain Amendment 11`);
  }
  if (a11) {
    if (!frozenHashes(a11).has(rel)) problems.push(`Amendment 11 does not freeze ${rel}`);
    if (!a11.includes(vf.model)) problems.push(`Amendment 11 does not name the model ${vf.model}`);
    if (!a11.includes(vf.digest.replace(/^sha256:/, ''))) problems.push(`Amendment 11 does not name the digest ${vf.digest}`);
    if (vf.instruction !== EMBEDDING_INSTRUCTION) problems.push('the vector file was embedded with another instruction');
  }
  if (problems.length > 0) {
    console.error(`refusing to score: the tree does not match the pre-registration\n${problems.join('\n')}`);
    return 1;
  }

  const corpus = read('corpus.json') as CorpusRecord[];
  const qRecords = read('queries.json') as (RetrievalQuery & { id: string })[];
  const queries = new Map(qRecords.map((q) => [q.id, { text: q.text, expr: q.expr } as RetrievalQuery]));
  const truth = read('truth.json') as { primary: Record<string, string[]>; secondary: Record<string, string[]> };
  const key = read('queries-key.json') as Record<string, string>;
  const items = JSON.parse(readFileSync(join(ROOT, 'tests/fixtures/atlas/benchmark/public/items.json'), 'utf8')) as { id: string; family: string }[];
  const familyByItem = new Map(items.map((i) => [i.id, i.family]));
  const familyOf = (q: string) => {
    const f = familyByItem.get(key[q] ?? '');
    if (!f) throw new Error(`no family for ${q}`);
    return f;
  };
  const heldOut = 'fluid-statics';

  const rankerOf = (f: VectorFile): Ranker =>
    embeddingRanker(
      new Map([...queries].map(([id, q]) => [q, decodeVector(f.queries[id] ?? '')])),
      new Map(Object.entries(f.corpus).map(([id, s]) => [id, decodeVector(s)])),
    );
  const name = `embedding (${vf.model})`;
  const conditions: [string, Ranker][] = [
    [name, rankerOf(vf)],
    ['typed structural search', rankByStructure],
  ];
  const primary = scoreConditions(corpus, queries, truth.primary, familyOf, heldOut, conditions);
  const secondary = scoreConditions(corpus, queries, truth.secondary, familyOf, heldOut, conditions);
  const pooled = (r: ConditionResult) => r.groups.find((g) => g.group === POOLED)!;
  const verdict = criterionVerdict(pooled(primary[1]!), pooled(primary[0]!));

  let variance: Record<string, unknown> | undefined;
  const variancePath = arg('--variance');
  if (variancePath) {
    const v2 = JSON.parse(readFileSync(variancePath, 'utf8')) as VectorFile;
    if (v2.model !== vf.model || v2.digest !== vf.digest || v2.instruction !== vf.instruction) {
      console.error('the variance pass must use the same model, digest and instruction');
      return 1;
    }
    const cos = [...Object.keys(vf.corpus).map((id) => [vf.corpus[id]!, v2.corpus[id]!]), ...Object.keys(vf.queries).map((id) => [vf.queries[id]!, v2.queries[id]!])].map(
      ([a, b]) => cosine(decodeVector(a!), decodeVector(b!)),
    );
    const identical = Object.keys(vf.corpus).every((id) => vf.corpus[id] === v2.corpus[id]) && Object.keys(vf.queries).every((id) => vf.queries[id] === v2.queries[id]);
    const p2 = scoreConditions(corpus, queries, truth.primary, familyOf, heldOut, [[`${name}, second pass`, rankerOf(v2)]])[0]!;
    const crossed = Object.keys(truth.primary).filter((q) => (primary[0]!.firstCorrectRank[q]! <= 10) !== (p2.firstCorrectRank[q]! <= 10));
    variance = {
      identicalBytes: identical,
      vectors: cos.length,
      minCosine: Math.min(...cos),
      meanCosine: cos.reduce((s, x) => s + x, 0) / cos.length,
      primaryPooled: pooled(p2),
      queriesCrossingTheDepthCut: crossed,
    };
  }

  const pct = (x: number) => `${(100 * x).toFixed(1)}%`;
  const row = (g: GroupResult) => `${g.hits}/${g.n} = ${pct(g.recall)} [${pct(g.lower)}, ${pct(g.upper)}]`;
  const table = (label: string, rs: readonly ConditionResult[]) => [
    `### ${label}`,
    '',
    `| Group | n | ${rs.map((r) => r.condition).join(' | ')} |`,
    `|---|---|${rs.map(() => '---').join('|')}|`,
    ...rs[0]!.groups.map((g, i) => `| ${g.group} | ${g.n} | ${rs.map((r) => row(r.groups[i]!)).join(' | ')} |`),
    '',
  ];
  const md = [
    '## Criterion 3 — the embedding condition and the verdict (pre-registration Amendment 11)',
    '',
    `Scored after Amendment 11 was committed (\`${a11Commit}\`) and its CI was green (${a11Ci}).`,
    '',
    `Model \`${vf.model}\`, digest ${vf.digest.replace(/^sha256:/, '')}, ${vf.dims} dimensions, scored from the frozen vector file \`${rel}\`.`,
    '',
    `**Verdict (§6 item 3, PRIMARY pooled, n = 50): ${verdict.met ? 'MET' : 'NOT MET'}.** The typed structural search's`,
    `Wilson lower bound is ${pct(verdict.typedLower)}; the embedding condition's point estimate is ${pct(verdict.embeddingRecall)}. The`,
    `criterion is met only when the lower bound lies above the point estimate.`,
    '',
    ...table('PRIMARY (n = 50)', primary),
    ...table('SECONDARY (n = 64)', secondary),
    ...(variance
      ? [
          '### Variance: a second, independent embedding pass (disclosed, not scored)',
          '',
          `- Byte-identical to the frozen pass: ${variance['identicalBytes'] ? 'yes' : 'no'}.`,
          `- Cosine between the two passes over ${variance['vectors']} vectors: min ${(variance['minCosine'] as number).toFixed(6)}, mean ${(variance['meanCosine'] as number).toFixed(6)}.`,
          `- PRIMARY pooled on the second pass: ${row(variance['primaryPooled'] as GroupResult)}.`,
          `- Truth queries whose hit at depth 10 differs between the passes: ${(variance['queriesCrossingTheDepthCut'] as string[]).length}.`,
          '',
        ]
      : []),
  ].join('\n');
  process.stdout.write(`${md}\n`);
  if (argv.includes('--write')) {
    const json = { amendment: 11, k: 10, context: { amendmentCommit: a11Commit, amendmentCi: a11Ci }, model: vf.model, digest: vf.digest, dims: vf.dims, vectorFile: rel, verdict, results: { primary, secondary }, ...(variance ? { variance } : {}) };
    writeFileSync(join(DIR, 'results-embedding.json'), `${JSON.stringify(json, (_k, v) => (v === Number.POSITIVE_INFINITY ? 'none' : v), 2)}\n`);
    writeFileSync(join(DIR, 'results-embedding.md'), `${md}\n`);
  }
  return 0;
}

async function main(argv: readonly string[]): Promise<number> {
  const cmd = argv[0];
  const arg = (name: string) => {
    const i = argv.indexOf(name);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  if (cmd === 'embed') {
    const model = arg('--model');
    const out = arg('--out');
    if (!model || !out) {
      console.error('embed needs --model <name> --out <file>');
      return 2;
    }
    await embed(model, resolve(out));
    return 0;
  }
  if (cmd === 'score') return score(argv.slice(1));
  console.error('usage: embedding.ts embed --model <name> --out <file> | score --vectors <file> [--variance <file>] [--write]');
  return 2;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).then(
    (code) => {
      process.exitCode = code;
    },
    (e: unknown) => {
      console.error(e);
      process.exitCode = 1;
    },
  );
}
