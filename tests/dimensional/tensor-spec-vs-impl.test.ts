/**
 * Spec ↔ implementation drift guard for Part-VII Tensor Algebra.
 *
 * Per v0.2.0-Design.md §8: bidirectional guard.
 *   (a) Every `<!-- TENSOR-RULE: <id> -->` marker in Part-VII MUST be
 *       referenced by at least one *.test.ts (as `TENSOR-RULE: <id>` either
 *       in a comment or in an `it.todo(...)` title).
 *   (b) Every `TENSOR-RULE: <id>` reference in tests MUST correspond to a
 *       real marker in Part-VII (catches typos / renames that escape
 *       review).
 *
 * Implementation note (Windows / MSYS2 path-translation):
 *   The plan's draft pseudocode used `execSync('grep -r ...')`. On this
 *   repo (Windows host, Git-Bash interop layer) MSYS2 silently rewrites
 *   leading-slash absolute paths and the `--include` glob in ways that
 *   break the search. To stay portable we enumerate `tests/**\/*.test.ts`
 *   via `fs.readdirSync` + `fs.readFileSync` and search in-process with a
 *   regex. No shell-out; no platform-conditional code.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const SPEC_PATH = resolve(
  __dirname,
  '../../docs/specification/Part-VII-Tensor-Algebra.md',
);
const SPEC_PART_VIII = resolve(
  __dirname,
  '../../docs/specification/Part-VIII-Metric-Layer.md',
);
const TESTS_DIR = resolve(__dirname, '..');

const SPEC_MARKER_RE = /<!-- TENSOR-RULE: ([\w-]+) -->/g;
const TEST_REF_RE = /TENSOR-RULE: ([\w-]+)/g;

/** Extract all TENSOR-RULE marker IDs from the spec markdown. */
function extractSpecRules(specPath: string = SPEC_PATH): string[] {
  const text = readFileSync(specPath, 'utf-8');
  const ids: string[] = [];
  let m: RegExpExecArray | null;
  SPEC_MARKER_RE.lastIndex = 0;
  while ((m = SPEC_MARKER_RE.exec(text)) !== null) ids.push(m[1]);
  return ids;
}

/** Recursively enumerate *.test.ts files under TESTS_DIR. */
function listTestFiles(root: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(root)) {
    const full = join(root, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      out.push(...listTestFiles(full));
    } else if (entry.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

/** Build a Map<ruleId, file[]> from every TENSOR-RULE reference in tests. */
function indexTestReferences(): Map<string, string[]> {
  const refs = new Map<string, string[]>();
  for (const file of listTestFiles(TESTS_DIR)) {
    const text = readFileSync(file, 'utf-8');
    // Exclude this drift-guard file from the search — its own regex
    // constants ("TENSOR-RULE: ([\\w-]+)") would otherwise match.
    if (file.endsWith('tensor-spec-vs-impl.test.ts')) continue;
    let m: RegExpExecArray | null;
    TEST_REF_RE.lastIndex = 0;
    while ((m = TEST_REF_RE.exec(text)) !== null) {
      const id = m[1];
      const existing = refs.get(id) ?? [];
      if (!existing.includes(file)) existing.push(file);
      refs.set(id, existing);
    }
  }
  return refs;
}

describe('Part-VII tensor-algebra spec ↔ implementation drift guard', () => {
  it('every TENSOR-RULE marker in Part-VII is referenced by at least one test', () => {
    const rules = extractSpecRules();
    expect(rules.length, 'Part-VII has zero TENSOR-RULE markers').toBeGreaterThan(0);
    const refs = indexTestReferences();
    const orphans: string[] = [];
    for (const ruleId of rules) {
      const referencing = refs.get(ruleId) ?? [];
      if (referencing.length === 0) orphans.push(ruleId);
    }
    expect(
      orphans,
      `Spec markers without any test reference: ${orphans.join(', ')}`,
    ).toEqual([]);
  });

  it('every TENSOR-RULE reference in tests corresponds to a real spec marker', () => {
    // Per v0.3.0-Design.md §8: test references are valid if they match a
    // marker in EITHER Part-VII (this guard's primary spec) OR Part-VIII
    // (covered by part-viii-spec-vs-impl.test.ts).
    const specRules = new Set([
      ...extractSpecRules(SPEC_PATH),
      ...extractSpecRules(SPEC_PART_VIII),
    ]);
    const refs = indexTestReferences();
    const phantoms: { id: string; files: string[] }[] = [];
    for (const [id, files] of refs) {
      if (!specRules.has(id)) phantoms.push({ id, files });
    }
    expect(
      phantoms,
      `Test references to non-existent spec markers: ${
        phantoms.map(p => `${p.id} (in ${p.files.join(', ')})`).join('; ')
      }`,
    ).toEqual([]);
  });
});
