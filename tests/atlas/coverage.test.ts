/**
 * Atlas Phase 1, S1.3 — the coverage report makes an unearned jump LEGIBLE.
 *
 * Design note `docs/planning/Atlas-Phase-1-Design.md` §3. The property under
 * test is per-tag visibility: a single total would hide one tag rising while
 * another falls, which is the exact movement this report exists to expose.
 */

import { describe, it, expect } from 'vitest';

import { ALL_EVIDENCE_TAGS, summarizeEvidence } from '../../src/atlas/coverage.js';
import { deriveEvidenceForVerdict } from '../../src/atlas/derive-evidence.js';
import type { EvidenceTag } from '../../src/atlas/types.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { adjudicateBridgeEntry } from '../../src/bridges/membership.js';
import { REJECTED_BRIDGE_IDS } from '../../src/bridges/rejected.js';

const set = (...tags: EvidenceTag[]): ReadonlySet<EvidenceTag> => new Set(tags);

describe('summarizeEvidence', () => {
  it('reports every tag, including the zeroes', () => {
    const report = summarizeEvidence([]);
    expect(report.records).toBe(0);
    expect(Object.keys(report.byTag).sort()).toEqual([...ALL_EVIDENCE_TAGS].sort());
    for (const tag of ALL_EVIDENCE_TAGS) expect(report.byTag[tag]).toBe(0);
  });

  it('counts per tag, not per record — a record with two tags counts in both', () => {
    const report = summarizeEvidence([set('symbolically-checked', 'numerically-supported')]);
    expect(report.records).toBe(1);
    expect(report.byTag['symbolically-checked']).toBe(1);
    expect(report.byTag['numerically-supported']).toBe(1);
    expect(report.byTag.proposed).toBe(0);
  });

  it('makes a swap legible: proposed falls as a checked tag rises', () => {
    const before = summarizeEvidence([set('proposed'), set('proposed')]);
    const after = summarizeEvidence([set('proposed'), set('symbolically-checked')]);
    expect(before.records).toBe(after.records);
    expect(before.byTag.proposed).toBe(2);
    expect(after.byTag.proposed).toBe(1);
    expect(after.byTag['symbolically-checked']).toBe(1);
  });

  it('is pure — the same input twice gives equal, non-identical reports', () => {
    const input = [set('proposed')];
    const a = summarizeEvidence(input);
    const b = summarizeEvidence(input);
    expect(a).toEqual(b);
    expect(a).not.toBe(b);
  });
});

describe('coverage of the live catalog — the Sprint 1 baseline', () => {
  it('is 55 rows: every non-rejected row proposed, every rejected row contradicted', () => {
    const report = summarizeEvidence(
      BRIDGE_EQUATIONS.map((e) => deriveEvidenceForVerdict(adjudicateBridgeEntry(e), e)),
    );
    const rejectedInCatalog = BRIDGE_EQUATIONS.filter((e) => REJECTED_BRIDGE_IDS.has(e.id)).length;
    expect(report.records).toBe(55);
    expect(report.byTag.contradicted).toBe(rejectedInCatalog);
    expect(report.byTag.proposed).toBe(55 - rejectedInCatalog);
    for (const tag of ALL_EVIDENCE_TAGS) {
      if (tag === 'proposed' || tag === 'contradicted') continue;
      expect(report.byTag[tag]).toBe(0);
    }
  });
});
