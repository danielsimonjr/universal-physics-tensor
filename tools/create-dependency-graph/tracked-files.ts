/**
 * The files that `create-dependency-graph` may read: the git index, not the disk.
 *
 * The generator used to walk the directories, so an untracked scratch file in the working tree
 * entered the committed docs (it did: a stray `tests/tmp/*.test.ts` was recorded in
 * `test-coverage.json`). A clone and the CI runner only ever see tracked files, so the generator
 * reads those. Stage a new file (`git add` or `git add -N`) before regenerating to include it.
 */

import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

/** A normalized key for a path: absolute, forward slashes, case-folded on Windows. */
function key(path: string): string {
  const p = resolve(path).replace(/\\/g, '/');
  return process.platform === 'win32' ? p.toLowerCase() : p;
}

/**
 * Every file in the git index under `root`, as normalized keys. Throws when `root` is not in a git
 * work tree: reading the disk instead would bring back the defect this module removes.
 */
export function trackedFiles(root: string): Set<string> {
  let out: string;
  try {
    out = execFileSync('git', ['-C', root, 'ls-files', '-z', '--cached'], {
      encoding: 'utf-8',
      maxBuffer: 64 * 1024 * 1024,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (err) {
    throw new Error(
      `create-dependency-graph reads tracked files only, and 'git ls-files' failed in ${root}: ${(err as Error).message}`,
    );
  }
  return new Set(
    out
      .split('\0')
      .filter((rel) => rel.length > 0)
      .map((rel) => key(resolve(root, rel))),
  );
}

/** Whether `path` is in the set that `trackedFiles` returned. */
export function isTracked(tracked: ReadonlySet<string>, path: string): boolean {
  return tracked.has(key(path));
}
