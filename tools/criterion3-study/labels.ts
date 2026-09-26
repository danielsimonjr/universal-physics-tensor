/**
 * Criterion 3, step 3: derive the truth sets from the two blind labelers' files.
 *
 * Two model labelers (run by Mothership outside this repository, blind to `src/atlas/`) listed,
 * per query, the corpus ids that the claim restates or misuses, or none. This module turns their
 * files into the truth sets that the pre-registration amendment freezes:
 *
 * - PRIMARY: the queries where both labelers gave the SAME non-empty set; truth = that set.
 * - SECONDARY (a pre-registered sensitivity analysis): PRIMARY plus the queries where the two
 *   non-empty sets overlap but differ; truth = their INTERSECTION.
 * - Excluded: `bothNone` (both labelers said none) and `oneNone` (one said none). The partial
 *   overlaps are excluded from PRIMARY only.
 *
 * It also computes the agreement figures the amendment reports (exact-set agreement, mean Jaccard).
 * It runs no retrieval condition.
 *
 * Run: bun tools/criterion3-study/labels.ts --labels <dir>
 * (copies the three label files into docs/research/criterion3/labels/ and writes truth.json)
 */

import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/** One labeler's file, reduced to what the derivation reads. */
export interface LabelerFile {
  readonly labeler: string;
  readonly model: string;
  readonly queries_sha256: string;
  readonly corpus_sha256: string;
  readonly labels: Readonly<Record<string, { readonly ids: readonly string[] }>>;
}

/** The truth sets and the agreement figures. */
export interface Truth {
  readonly primary: Record<string, string[]>;
  readonly secondary: Record<string, string[]>;
  readonly excluded: { readonly bothNone: string[]; readonly oneNone: string[]; readonly partialOverlap: string[] };
  readonly agreement: {
    readonly queries: number;
    readonly exactSet: number;
    readonly exactSetRate: number;
    readonly meanJaccard: number;
    readonly meanJaccardExcludingBothNone: number;
  };
}

const sorted = (s: Iterable<string>): string[] => [...s].sort();

/** Jaccard index of two id sets; two empty sets agree completely (1). */
export function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  return inter / (a.size + b.size - inter);
}

/**
 * Derive the truth sets from labelers A and B over the given query ids. Every query must be
 * labelled by both, and every id must be in the corpus, or the derivation throws: a missing label
 * would silently shrink the denominator.
 */
export function deriveTruth(a: LabelerFile, b: LabelerFile, queryIds: readonly string[], corpusIds: ReadonlySet<string>): Truth {
  const primary: Record<string, string[]> = {};
  const secondary: Record<string, string[]> = {};
  const bothNone: string[] = [];
  const oneNone: string[] = [];
  const partialOverlap: string[] = [];
  let exact = 0;
  const jac: number[] = [];
  const jacNonEmpty: number[] = [];
  for (const q of queryIds) {
    const la = a.labels[q];
    const lb = b.labels[q];
    if (!la || !lb) throw new Error(`query ${q} is not labelled by both labelers`);
    const sa = new Set(la.ids);
    const sb = new Set(lb.ids);
    for (const id of [...sa, ...sb]) if (!corpusIds.has(id)) throw new Error(`query ${q}: ${id} is not a corpus id`);
    const j = jaccard(sa, sb);
    jac.push(j);
    const same = sa.size === sb.size && [...sa].every((x) => sb.has(x));
    if (same) exact++;
    if (sa.size === 0 && sb.size === 0) {
      bothNone.push(q);
      continue;
    }
    jacNonEmpty.push(j);
    if (same) {
      primary[q] = sorted(sa);
      secondary[q] = sorted(sa);
    } else if (sa.size === 0 || sb.size === 0) {
      oneNone.push(q);
    } else {
      const inter = [...sa].filter((x) => sb.has(x));
      if (inter.length > 0) {
        partialOverlap.push(q);
        secondary[q] = sorted(inter);
      } else {
        // Two non-empty disjoint sets: contested, like one-none. None occur in the frozen labels.
        oneNone.push(q);
      }
    }
  }
  const mean = (xs: readonly number[]) => (xs.length === 0 ? Number.NaN : xs.reduce((s, x) => s + x, 0) / xs.length);
  return {
    primary,
    secondary,
    excluded: { bothNone, oneNone, partialOverlap },
    agreement: {
      queries: queryIds.length,
      exactSet: exact,
      exactSetRate: exact / queryIds.length,
      meanJaccard: mean(jac),
      meanJaccardExcludingBothNone: mean(jacNonEmpty),
    },
  };
}

// ---------------------------------------------------------------- I/O (the command line)

const sha256 = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');

function main(argv: readonly string[]): number {
  const i = argv.indexOf('--labels');
  const src = i >= 0 ? argv[i + 1] : undefined;
  if (!src) {
    console.error('usage: bun tools/criterion3-study/labels.ts --labels <dir>');
    return 2;
  }
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const dir = join(root, 'docs/research/criterion3');
  const dest = join(dir, 'labels');
  mkdirSync(dest, { recursive: true });
  for (const f of ['labeler-A.json', 'labeler-B.json', 'agreed-labels.json']) copyFileSync(join(src, f), join(dest, f));

  const read = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
  const freeze = read(join(dir, 'freeze.json'));
  const a = read(join(dest, 'labeler-A.json')) as LabelerFile;
  const b = read(join(dest, 'labeler-B.json')) as LabelerFile;
  for (const l of [a, b]) {
    if (l.queries_sha256 !== freeze.files['queries.json'].sha256 || l.corpus_sha256 !== freeze.files['corpus.json'].sha256) {
      throw new Error(`labeler ${l.labeler} labelled different inputs than the frozen ones`);
    }
  }
  const queryIds = (read(join(dir, 'queries.json')) as { id: string }[]).map((q) => q.id);
  const corpusIds = new Set((read(join(dir, 'corpus.json')) as { id: string }[]).map((r) => r.id));
  const truth = deriveTruth(a, b, queryIds, corpusIds);
  const text = `${JSON.stringify(truth, null, 2)}\n`;
  writeFileSync(join(dir, 'truth.json'), text);
  const hashes = Object.fromEntries(
    ['labels/labeler-A.json', 'labels/labeler-B.json', 'labels/agreed-labels.json', 'truth.json'].map((f) => [f, sha256(readFileSync(join(dir, f)))]),
  );
  console.log(JSON.stringify({ counts: { primary: Object.keys(truth.primary).length, secondary: Object.keys(truth.secondary).length, ...Object.fromEntries(Object.entries(truth.excluded).map(([k, v]) => [k, v.length])) }, agreement: truth.agreement, hashes }, null, 2));
  return 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main(process.argv.slice(2));
}
