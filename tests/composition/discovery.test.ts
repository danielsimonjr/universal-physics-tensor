/**
 * Direction 2 — the discovery loop (vet link candidates through the
 * inference suite). Controlled fixtures pin the three verdicts:
 *   - promising      — the identification merges two components AND unlocks
 *                      new determinable quantities, staying consistent.
 *   - contradictory  — the identification makes a node over-determined and
 *                      its two derivations DISAGREE (a falsification).
 *   - inert          — consistent but structurally idle.
 * The real-graph block pins the funnel over CATALOG_GRAPH.
 */
import { describe, it, expect } from 'vitest';
import {
  vetLinkCandidate,
  rankDiscoveries,
} from '../../src/composition/discovery.js';
import type { LinkCandidate } from '../../src/composition/bridge-analysis.js';
import { CATALOG_GRAPH } from '../../src/composition/index.js';
import type { BridgeEdge, Quantity } from '../../src/composition/index.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

const q = (name: string): Quantity => ({
  name,
  symbol: name,
  dim: DIMENSIONLESS,
  attributes: {},
});

const edge = (
  id: string,
  sourceNames: string[],
  targetName: string,
  evaluate: (i: Record<string, number>) => number,
): BridgeEdge => ({
  id,
  beId: null,
  kind: 'bridge',
  label: id,
  sources: sourceNames.map(q),
  target: q(targetName),
  confidence: 'speculative',
  domain: { description: 'any', predicate: () => true },
  evaluate,
  citation: 'synthetic',
});

const cand = (a: string, b: string): LinkCandidate => ({
  a,
  b,
  dim: '[energy]',
  touchesCore: false,
  sameKind: false,
  sharedToken: null,
});

const noBase = { identifications: [] as const };

describe('vetLinkCandidate — controlled verdicts', () => {
  it('PROMISING: merges two components and unlocks new quantities', () => {
    // chain 1: x → a ; chain 2: b → y. Identifying a≡b bridges them.
    const edges = [
      edge('e1', ['x'], 'a', (i) => i['x'] * 2),
      edge('e2', ['b'], 'y', (i) => i['b'] * 3),
    ];
    const r = vetLinkCandidate(edges, cand('a', 'b'), {
      groundTruth: { x: 2 },
      ...noBase,
    });
    expect(r.mergesComponents).toBe(true);
    expect(r.unlocksFromAnchor).toEqual(['b', 'y']);
    expect(r.numericallyConsistent).toBe(true);
    expect(r.verdict).toBe('promising');
    expect(r.score).toBeGreaterThan(0);
  });

  it('CONTRADICTORY: the identification makes a node disagree with itself', () => {
    // x → a → t (t = 20x). A second route b → t (t = 5b) only fires once
    // a≡b feeds b = a = 2x, giving t = 10x ≠ 20x.
    const edges = [
      edge('e1', ['x'], 'a', (i) => i['x'] * 2),
      edge('e3', ['a'], 't', (i) => i['a'] * 10),
      edge('e4', ['b'], 't', (i) => i['b'] * 5),
    ];
    const r = vetLinkCandidate(edges, cand('a', 'b'), {
      groundTruth: { x: 1 },
      ...noBase,
    });
    expect(r.numericallyConsistent).toBe(false);
    expect(r.inconsistentNodes).toContain('t');
    expect(r.verdict).toBe('contradictory');
    expect(r.score).toBeLessThan(0);
  });

  it('INERT: consistent but a and b are already in one component', () => {
    const edges = [
      edge('e1', ['x'], 'a', (i) => i['x'] * 2),
      edge('e2', ['a'], 'b', (i) => i['a'] * 3),
    ];
    const r = vetLinkCandidate(edges, cand('a', 'b'), {
      groundTruth: { x: 2 },
      ...noBase,
    });
    expect(r.mergesComponents).toBe(false);
    expect(r.unlocksFromAnchor).toEqual([]);
    expect(r.numericallyConsistent).toBe(true);
    expect(r.verdict).toBe('inert');
  });
});

describe('rankDiscoveries — real CATALOG_GRAPH funnel', () => {
  const ranked = rankDiscoveries(CATALOG_GRAPH);

  it('vets every proposed candidate (132) and tags each with a verdict', () => {
    expect(ranked.length).toBe(132);
    const verdicts = new Set(ranked.map((r) => r.verdict));
    for (const v of verdicts) {
      expect(['promising', 'inert', 'contradictory', 'magnitude-clash']).toContain(v);
    }
  });

  it('is ranked promising-first, then by score (non-increasing within a verdict)', () => {
    const RANK = {
      promising: 0,
      inert: 1,
      'magnitude-clash': 2,
      contradictory: 3,
    } as const;
    for (let i = 1; i < ranked.length; i++) {
      const prev = ranked[i - 1];
      const cur = ranked[i];
      expect(RANK[prev.verdict]).toBeLessThanOrEqual(RANK[cur.verdict]);
      if (prev.verdict === cur.verdict) {
        expect(prev.score).toBeGreaterThanOrEqual(cur.score);
      }
    }
  });

  it('contradictory candidates carry the falsifying node and never rank promising', () => {
    for (const r of ranked) {
      if (r.verdict === 'contradictory') {
        expect(r.numericallyConsistent).toBe(false);
        expect(r.inconsistentNodes.length).toBeGreaterThan(0);
      }
    }
  });
});
