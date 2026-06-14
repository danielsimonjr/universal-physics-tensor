/**
 * Catalog linkage map (src/composition/bridge-analysis.ts) — pins the
 * connected-component structure: one dominant anchored cluster hubbed on
 * mass/temperature, two small thematic clusters, and an isolated tail.
 */
import { describe, it, expect } from 'vitest';
import { linkageMap } from '../../src/composition/bridge-analysis.js';
import type { BridgeEdge } from '../../src/composition/index.js';
import {
  be11ZurekEdge, be12Edge, be16Edge, be37Edge, be42Edge, be42ViaRsEdge,
  be51Edge, be52Edge, lawSchwarzschildRadius, be14Edge, be19Edge, be21Edge,
  be48Edge, be53Edge, be54Edge, CATALOG_FULL_EDGES,
} from '../../src/composition/index.js';

const GRAPH: BridgeEdge[] = [
  be11ZurekEdge, be12Edge, be16Edge, be37Edge, be42Edge, be42ViaRsEdge,
  be51Edge, be52Edge, lawSchwarzschildRadius, be14Edge, be19Edge, be21Edge,
  be48Edge, be53Edge, be54Edge, ...CATALOG_FULL_EDGES,
];

const m = linkageMap(GRAPH);

describe('linkageMap — component structure', () => {
  it('partitions the 41-edge graph into 23 components (20 isolated)', () => {
    expect(m.componentCount).toBe(23);
    expect(m.isolated.length).toBe(20);
    expect(m.clusters.reduce((n, c) => n + c.size, 0)).toBe(GRAPH.length);
  });

  it('reports the 11 directed compositions over the graph', () => {
    expect(m.compositions).toBe(11);
  });

  it('has one dominant ANCHORED cluster of 16, hubbed on mass + temperature', () => {
    const big = m.clusters[0];
    expect(big.size).toBe(16);
    expect(big.anchored).toBe(true);
    expect(big.hubs).toEqual(expect.arrayContaining(['mass', 'temperature', 'schwarzschild-radius']));
    // it links established GR to speculative thermal/quantum bridges
    expect(big.edges).toEqual(expect.arrayContaining(['be-42', 'be-51', 'be-52', 'be-16', 'be-12']));
    expect(big.statusMix.established).toBe(5);
  });

  it('has the cosmological-constant cluster (be-13/be-20/be-31)', () => {
    const cc = m.clusters.find((c) => c.edges.includes('be-13'));
    expect(cc?.size).toBe(3);
    expect(cc?.edges).toEqual(expect.arrayContaining(['be-13', 'be-20', 'be-31']));
    expect(cc?.hubs).toEqual(expect.arrayContaining(['ricci-scalar']));
  });

  it('has the Friedmann/Hubble cluster (be-19/be-54)', () => {
    const fr = m.clusters.find((c) => c.edges.includes('be-19'));
    expect(fr?.size).toBe(2);
    expect(fr?.edges).toEqual(expect.arrayContaining(['be-19', 'be-54']));
  });

  it('lists the isolated bridges (e.g. nucleosynthesis, swampland, Yang-Mills)', () => {
    expect(m.isolated).toEqual(expect.arrayContaining(['be-47', 'be-41', 'be-53']));
    // clusters are sorted largest-first
    for (let i = 1; i < m.clusters.length; i++) {
      expect(m.clusters[i].size).toBeLessThanOrEqual(m.clusters[i - 1].size);
    }
  });
});
