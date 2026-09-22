/**
 * Whole-atlas invariants over EVERY registered family (Phase 4, S4.4–S4.5),
 * and ROADMAP Phase 4's two exit counts.
 *
 * Families may reference each other's models (the wave family ends two bridges
 * at the oscillator family's `model-wave-1d`), so resolution is checked against
 * the union, and ids must be unique across it.
 */

import { describe, expect, it } from 'vitest';
import { ATLAS_FAMILIES } from '../../src/atlas/families.js';

const models = ATLAS_FAMILIES.flatMap((f) => f.models);
const bridges = ATLAS_FAMILIES.flatMap((f) => f.bridges);

describe('ATLAS_FAMILIES — cross-family integrity', () => {
  it('registers the oscillator, diffusion and wave families', () => {
    expect(ATLAS_FAMILIES.map((f) => f.family)).toEqual(['oscillators', 'diffusion', 'waves']);
  });

  it('model ids are unique across the whole atlas', () => {
    const ids = models.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('bridge ids are unique across the whole atlas', () => {
    const ids = bridges.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every bridge premise and conclusion resolves to a model in SOME family', () => {
    const known = new Set(models.map((m) => m.id));
    const dangling: string[] = [];
    for (const b of bridges) {
      for (const id of [...b.premises, b.conclusion]) {
        if (!known.has(id)) dangling.push(`${b.id} → ${id}`);
      }
    }
    expect(dangling).toEqual([]);
  });

  it('every model carries the family it is registered under', () => {
    for (const f of ATLAS_FAMILIES) {
      for (const m of f.models) expect(m.family).toBe(f.family);
    }
  });
});

describe('ROADMAP Phase 4 exit counts', () => {
  it('"≥ 5 relation types" — NOT cut by the scope rule — holds across admitted bridges', () => {
    const types = new Set(bridges.map((b) => b.relation));
    expect(types.size).toBeGreaterThanOrEqual(5);
  });

  it('the bridge count matches the figure the design note records (the ≥ 20 criterion is OPEN, not cut)', () => {
    // Atlas-Phase-4-Design.md §4 records the count and why it is short of 20:
    // the plan's family briefs enumerate only 12 bridges, and the measured
    // curation cost does NOT justify a cut. Pinned so the note cannot drift
    // from the atlas; raise both together.
    expect(bridges).toHaveLength(12);
  });
});
