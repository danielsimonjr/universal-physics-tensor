// CALIBRATION BENCHMARK — the regression gate for every funnel change.
// (1) canonical-only self-consistency, (2) HEAD funnel counts,
// (3) adjudicated decoys never resurface unannotated, (4) seed integrity.
// A diff in these pins is a MEASURED funnel change: justify it in the
// commit message and update docs/research/discovery-precision-calibration.md.
import { describe, it, expect } from 'vitest';
import { rankDiscoveries } from '../../src/composition/discovery.js';
import { CANONICAL_GRAPH } from '../../src/composition/canonical-graph.js';
import { CATALOG_GRAPH } from '../../src/composition/catalog-graph.js';
import {
  ADJUDICATIONS,
  annotateAdjudications,
} from '../../src/composition/adjudication.js';

const count = (cands: readonly { verdict: string }[], v: string) =>
  cands.filter((c) => c.verdict === v).length;

describe('discovery calibration benchmark', () => {
  it('canonical-only funnel is self-consistent (contradictory = 0)', () => {
    const cands = rankDiscoveries(CANONICAL_GRAPH);
    expect(count(cands, 'contradictory')).toBe(0);
  });

  // ── THE PINNED COUNTS ────────────────────────────────────────────────
  // Deliberate trade (vet r1, Adam #7 / Eve #5): exact pins DO break on
  // legitimate catalog edits — that is the point. A funnel-count change is a
  // MEASURED behavior change; update this ONE block in the same commit and
  // say why in the commit message. Fill from Task 0's measurement.
  const EXPECTED = {
    catalog: { total: 132, promising: 12, inert: 100, clash: 20, contradictory: 0 },
  };

  it('catalog funnel counts are pinned at HEAD', () => {
    const cands = rankDiscoveries(CATALOG_GRAPH);
    expect(cands.length).toBe(EXPECTED.catalog.total);
    expect(count(cands, 'promising')).toBe(EXPECTED.catalog.promising);
    expect(count(cands, 'inert')).toBe(EXPECTED.catalog.inert);
    expect(count(cands, 'magnitude-clash')).toBe(EXPECTED.catalog.clash);
    expect(count(cands, 'contradictory')).toBe(EXPECTED.catalog.contradictory);
  });

  it('adjudicated decoys never surface as unannotated promising', () => {
    // Guards the WIRING, not the physics (vet r1, Adam's tautology probe):
    // this fails when id construction or name resolution drifts so a seeded
    // pair surfaces as promising without its annotation attaching. The
    // combined graph is used deliberately — the widest candidate surface —
    // independent of what the CLI's default --source is (that is a UX
    // decision; this is a library invariant).
    const both = [...CATALOG_GRAPH, ...CANONICAL_GRAPH];
    const annotated = annotateAdjudications(rankDiscoveries(both));
    const escaped = annotated.filter(
      (c) =>
        c.verdict === 'promising' &&
        c.adjudication === undefined &&
        ADJUDICATIONS.some((a) => a.id === `${[c.a, c.b].sort().join('~')}`),
    );
    expect(escaped).toEqual([]);
  });

  it('seed pairs resolve against the live graph or say why not', () => {
    // Guards silent name drift: every adjudication either names two live
    // quantities, or its grounds explain the unresolved doc-name.
    const live = new Set(
      [...CATALOG_GRAPH, ...CANONICAL_GRAPH].flatMap((e) => [
        e.target.name,
        ...e.sources.map((s) => s.name),
      ]),
    );
    for (const a of ADJUDICATIONS) {
      const [lo, hi] = a.id.split('~');
      const resolved = live.has(lo) && live.has(hi);
      if (!resolved) expect(a.grounds).toMatch(/doc name|not currently surfaced/iu);
    }
  });
});
