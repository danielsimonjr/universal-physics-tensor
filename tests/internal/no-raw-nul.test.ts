/**
 * No tracked text file may contain a raw NUL byte.
 *
 * One NUL makes grep treat the whole file as binary: it prints "Binary file … matches" in place of
 * the matching lines, and ripgrep skips the file. A search then reports nothing from that file and
 * looks like a clean result. `src/composition/bridge-prediction.ts` carried two raw NULs, written
 * as a pair-key separator, from the commit that created it. Write the character as `\u0000`.
 */

import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const ROOTS = ['src', 'tests', 'tools', 'scripts', 'bench', 'examples', 'docs', 'formal'];
const TEXT = new Set(['.ts', '.mts', '.cts', '.js', '.mjs', '.cjs', '.json', '.md', '.lean', '.yaml', '.yml', '.txt', '.dot', '.svg', '.out']);
const SKIP_DIRS = new Set(['node_modules', 'dist', '.lake']);

function textFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) textFiles(p, out);
    else if (TEXT.has(extname(entry))) out.push(p);
  }
  return out;
}

describe('repository text files', () => {
  const files = ROOTS.flatMap((r) => textFiles(join(root, r)));

  it('the scan covers the source tree', () => {
    expect(files.some((f) => f.endsWith(join('src', 'index.ts')))).toBe(true);
    expect(files.length).toBeGreaterThan(500);
  });

  it('contain no raw NUL byte', () => {
    const withNul = files
      .filter((f) => readFileSync(f).includes(0))
      .map((f) => relative(root, f).replace(/\\/g, '/'));
    expect(withNul).toEqual([]);
  });
});
