/**
 * Atlas Phase 5, S5.5 — the pre-registration note is bound to the frozen item set.
 *
 * `docs/research/atlas-benchmark-preregistration.md` records the SHA-256 of the
 * canonical JSON of the frozen items. This test recomputes it from the committed
 * set, so the set cannot change after registration without an amendment to the
 * note — the machine half of "thresholds frozen before any condition runs".
 */

import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadFrozenItems } from '../../src/atlas/benchmark/loader.js';
import { HELD_OUT_FAMILY } from '../../src/atlas/benchmark/types.js';
import { hashCanonical } from '../../src/composition/probe/serialize.js';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const note = readFileSync(resolve(root, 'docs/research/atlas-benchmark-preregistration.md'), 'utf-8');

describe('pre-registration ↔ frozen item set', () => {
  it('the note records the hash of the COMMITTED frozen set', () => {
    const items = loadFrozenItems(resolve(root, 'tests/fixtures/atlas/benchmark'));
    expect(note).toContain(hashCanonical(items));
  });

  it('the CURRENT recorded hash (the last one in the note, after any amendment) is the committed set', () => {
    const all = [...note.matchAll(/`([0-9a-f]{64})`/g)].map((m) => m[1]);
    expect(all.length).toBeGreaterThan(0);
    const items = loadFrozenItems(resolve(root, 'tests/fixtures/atlas/benchmark'));
    expect(all.at(-1)).toBe(hashCanonical(items));
  });

  it('POSITIVE CONTROL: the committed set minus one item would NOT match the recorded hash', () => {
    const items = loadFrozenItems(resolve(root, 'tests/fixtures/atlas/benchmark'));
    expect(items.length).toBeGreaterThan(0);
    expect(note).not.toContain(hashCanonical(items.slice(1)));
  });

  it('names the held-out family the code enforces', () => {
    expect(HELD_OUT_FAMILY).toBe('fluid-statics');
    expect(note.toLowerCase()).toContain('fluid statics');
  });

  it('states all six pre-registered criteria', () => {
    for (const heading of [
      'Zero false promotions',
      'Invalid-bridge rejection',
      'Recall at depth 10',
      'Abstention',
      'Practical value',
      'Curation cost',
    ]) {
      expect(note).toContain(heading);
    }
  });
});
