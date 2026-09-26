/**
 * The pre-push gates must judge the commit being pushed, not the working tree.
 *
 * The gates read the working tree: `tsc -p tsconfig.tests.json` compiles `tests/**`, vitest runs
 * every test file on disk, and the tests read `data/`, `bin/`, `docs/`, `formal/`, `NOTES.md` and
 * more. An untracked or modified file anywhere is therefore judged although it is not in the push:
 * a stray untracked test once failed the typecheck, and an unpushed edit could pass it. The
 * pre-push hook runs this check first and refuses while the working tree differs from HEAD.
 *
 * The check covers the whole tree rather than a list of paths: a list has to be kept complete by
 * hand, and one missing entry is a silent hole. Gitignored files are not reported.
 *
 * Run: `bun tools/gate-inputs/gate-inputs.ts` (exit 1 and a list when files are dirty).
 */

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Untracked (not ignored) or modified files in the working tree, staged or not, as
 * repository-relative paths with forward slashes, sorted.
 */
export function dirtyGateInputs(root: string): string[] {
  const out = execFileSync('git', ['-C', root, 'status', '--porcelain=v1', '-z', '--untracked-files=all'], {
    encoding: 'utf-8',
    maxBuffer: 64 * 1024 * 1024,
  });
  const paths: string[] = [];
  const entries = out.split('\0');
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i]!;
    if (entry.length < 4) continue;
    const status = entry.slice(0, 2);
    paths.push(entry.slice(3));
    // A rename or copy is followed by its source path as a separate entry.
    if (status.includes('R') || status.includes('C')) i++;
  }
  return paths.sort();
}

function main(): number {
  const root = resolve(fileURLToPath(import.meta.url), '../../..');
  const dirty = dirtyGateInputs(root);
  if (dirty.length === 0) return 0;
  console.error('PRE-PUSH GATE REFUSED: the working tree differs from HEAD, and the gates would read these files:');
  for (const p of dirty) console.error(`  ${p}`);
  console.error('Commit them, move them out of the repository, or gitignore them.');
  return 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = main();
}
