/**
 * Axis-discrimination audit — the anti-inert-metadata gate. Confirms the gated
 * axes (scale/force) fire, the new axes abstain (thin coverage → correctly
 * ungated), and that gate ⟺ measured discrimination holds.
 * @module tests/composition/axis-audit
 */
import { describe, it, expect } from 'vitest';
import { auditAxisDiscrimination } from '../../src/composition/axis-audit.js';
import { CATALOG_GRAPH } from '../../src/composition/catalog-graph.js';

describe('auditAxisDiscrimination', () => {
  const report = auditAxisDiscrimination(CATALOG_GRAPH);
  const by = (axis: string) => report.find((r) => r.axis === axis)!;

  it('audits every registry axis', () => {
    expect(report.map((r) => r.axis)).toEqual([
      'scale', 'force', 'information', 'symmetry', 'topology', 'statistics',
    ]);
  });

  it('the gated axes (scale, force) actually FIRE on the catalog', () => {
    expect(by('scale').gated).toBe(true);
    expect(by('scale').fires).toBeGreaterThan(0);
    expect(by('scale').discriminates).toBe(true);
    expect(by('force').gated).toBe(true);
    expect(by('force').fires).toBeGreaterThan(0);
  });

  it('the new axes are UNGATED and do not yet fire (thin coverage — honest)', () => {
    for (const axis of ['symmetry', 'topology', 'statistics']) {
      expect(by(axis).gated).toBe(false);
      expect(by(axis).fires).toBe(0);
      expect(by(axis).discriminates).toBe(false);
    }
  });

  it('INVARIANT: no axis is gated without measured discrimination', () => {
    // The whole point — a gate must be earned by firing, never asserted by vision.
    for (const r of report) {
      if (r.gated) expect(r.discriminates).toBe(true);
    }
  });

  it('clashRate is fires/checked and bounded [0,1]', () => {
    for (const r of report) {
      expect(r.clashRate).toBeGreaterThanOrEqual(0);
      expect(r.clashRate).toBeLessThanOrEqual(1);
      if (r.checked > 0) expect(r.clashRate).toBeCloseTo(r.fires / r.checked, 10);
    }
  });
});
