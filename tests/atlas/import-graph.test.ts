/**
 * Nothing under src/ may import the atlas witness scorers (hidden truth).
 *
 * Same guard as `tests/composition/probe/import-graph.test.ts`, applied to the
 * atlas fixture tree: the scoring fixtures are the ground truth the atlas
 * bridges are measured against, so src/ reaching them would let the code under
 * test read its own answer key.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '../..');

function walk(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (e.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

describe('src must not import atlas witness scorers', () => {
  it('no src file mentions tests/fixtures/atlas/.../scorer', () => {
    const files = walk(join(root, 'src'));
    const hits: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      if (text.includes('fixtures/atlas') && text.includes('scorer')) {
        hits.push(f);
      }
    }
    expect(hits).toEqual([]);
  });

  it('walks a non-empty src tree (the guard cannot pass vacuously)', () => {
    expect(walk(join(root, 'src')).length).toBeGreaterThan(0);
  });
});
