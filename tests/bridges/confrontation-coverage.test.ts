/**
 * Direction 4 — empirical-spine coverage audit. Pins the catalog's
 * grounding profile: the data-confronted bridges (BE-23, BE-36, BE-37,
 * BE-52), the tier partition summing to the full 44, and the gap counts the
 * physicist review (CONTRIBUTING.md) should target. Reads the catalog/graph
 * only — no fabricated data.
 */
import { describe, it, expect } from 'vitest';
import { auditCoverage } from '../../src/bridges/confrontation-coverage.js';
import type { GroundingTier } from '../../src/bridges/confrontation-coverage.js';

const TIERS: GroundingTier[] = [
  'data-confronted',
  'graph-computable',
  'encoded-only',
  'thin',
];

describe('auditCoverage — catalog grounding profile', () => {
  const report = auditCoverage();

  it('audits all 44 catalogued bridges, sorted by id', () => {
    expect(report.total).toBe(44);
    expect(report.bridges).toHaveLength(44);
    const ids = report.bridges.map((b) => b.id);
    expect(ids).toEqual([...ids].sort((a, b) => a - b));
  });

  it('identifies exactly the four data-confronted bridges (BE-23, BE-36, BE-37, BE-52)', () => {
    const confronted = report.bridges
      .filter((b) => b.hasDataConfrontation)
      .map((b) => b.id);
    expect(confronted).toEqual([23, 36, 37, 52]);
    expect(report.withoutDataConfrontation).toBe(40);
    for (const id of [23, 36, 37, 52]) {
      expect(report.bridges.find((b) => b.id === id)?.tier).toBe('data-confronted');
    }
  });

  it('partitions every bridge into one tier; the tiers sum to 44', () => {
    for (const b of report.bridges) expect(TIERS).toContain(b.tier);
    const sum = TIERS.reduce((n, t) => n + report.byTier[t], 0);
    expect(sum).toBe(44);
    expect(report.byTier['data-confronted']).toBe(4);
  });

  it('thin bridges are exactly those without a dimensional signature', () => {
    for (const b of report.bridges) {
      expect(b.tier === 'thin').toBe(!b.dimensionalSignaturePresent);
    }
    expect(report.thinBridges).toEqual(
      report.bridges.filter((b) => !b.dimensionalSignaturePresent).map((b) => b.id),
    );
  });

  it('a computable, dimensionally-encoded bridge (BE-42) is graph-computable', () => {
    const be42 = report.bridges.find((b) => b.id === 42)!;
    expect(be42.hasGraphEdge).toBe(true);
    expect(be42.dimensionalSignaturePresent).toBe(true);
    expect(be42.tier).toBe('graph-computable');
  });
});
