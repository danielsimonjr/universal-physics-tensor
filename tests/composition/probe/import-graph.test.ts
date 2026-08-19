/**
 * Nothing under src/ may import Family B scorers (hidden truth).
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(fileURLToPath(new URL('.', import.meta.url)), '../../..');

function walk(dir: string, acc: string[] = []): string[] {
  for (const e of readdirSync(dir)) {
    const full = join(dir, e);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (e.endsWith('.ts')) acc.push(full);
  }
  return acc;
}

describe('src must not import Family B scorers', () => {
  it('no src file mentions tests/fixtures/discovery/.../scorer', () => {
    const files = walk(join(root, 'src'));
    const hits: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, 'utf8');
      if (text.includes('fixtures/discovery') && text.includes('scorer')) {
        hits.push(f);
      }
    }
    expect(hits).toEqual([]);
  });
});
