/**
 * explainQuantity — the unified bridge-inference entry point
 * (src/composition/explain.ts). Pins the synthesis of the three
 * primitives: the over-determined + consistent + value-recovered case
 * (hawking-temperature from {mass: M_sun}), the dimensional-sufficiency
 * layer (schwarzschild-radius given {mass, G, c}), the under-determined
 * blocking frontier, and the plain-language summary content.
 */
import { describe, it, expect } from 'vitest';
import { explainQuantity } from '../../src/composition/explain.js';
import { CATALOG_GRAPH, M_SUN_KG } from '../../src/composition/index.js';
import type { BridgeEdge, Quantity } from '../../src/composition/index.js';
import type { Dimension } from '../../src/dimensional/types.js';
import { DIMENSIONLESS, MASS, VELOCITY } from '../../src/dimensional/types.js';

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
  confidence: 'established',
  domain: { description: 'any', predicate: () => true },
  evaluate,
  citation: 'synthetic',
});

const GRAV_CONSTANT: Dimension = {
  L: 3,
  M: -1,
  T: -2,
  I: 0,
  Theta: 0,
  N: 0,
  J: 0,
};

const FULL_GRAPH = CATALOG_GRAPH;

describe('explainQuantity — controlled fixtures', () => {
  it('over-determined + values: classifier + retrodiction + value', () => {
    const edges = [
      edge('e1', ['a'], 't', (i) => i['a'] * 2),
      edge('e2', ['b'], 't', (i) => i['b'] * 3),
    ];
    const x = explainQuantity(edges, 't', { a: 3, b: 2 }); // both → 6
    expect(x.identifiability.verdict).toBe('over-determined');
    expect(x.derivations.map((d) => d.edge).sort()).toEqual(['e1', 'e2']);
    expect(x.consistency?.outcome).toBe('consistent');
    expect(x.recoveredValue).toBeCloseTo(6, 9);
    expect(x.derivations.every((d) => d.value !== undefined)).toBe(true);
    expect(x.summary).toMatch(/over-determined/);
    expect(x.summary).toMatch(/agree|consistency/);
  });

  it('over-determined + DISAGREEING values: summary flags the falsification', () => {
    const edges = [
      edge('e1', ['a'], 't', (i) => i['a'] * 2), // 6
      edge('e2', ['b'], 't', (i) => i['b'] * 1), // 2
    ];
    const x = explainQuantity(edges, 't', { a: 3, b: 2 });
    expect(x.consistency?.outcome).toBe('inconsistent');
    expect(x.summary).toMatch(/DISAGREE|falsification/);
  });

  it('under-determined: reports the blocking frontier', () => {
    const edges = [edge('e', ['c'], 't', (i) => i['c'])];
    const x = explainQuantity(edges, 't', ['a'], { identifications: [] });
    expect(x.identifiability.verdict).toBe('under-determined');
    expect(x.blockingFrontier).toContain('c');
    expect(x.summary).toMatch(/cannot be determined/);
    expect(x.recoveredValue).toBeUndefined();
  });

  it('names-only input: structural + dimensional, no value recovery', () => {
    const edges = [edge('e1', ['a'], 't', (i) => i['a'])];
    const x = explainQuantity(edges, 't', ['a'], { identifications: [] });
    expect(x.identifiability.verdict).toBe('exactly-determined');
    expect(x.recoveredValue).toBeUndefined();
    expect(x.consistency).toBeUndefined();
  });

  it('full-chain: traces a multi-step derivation back to its leaf inputs', () => {
    // c → b → t : the derivation edge et has last-hop source `b`, but its
    // leaf input is `c`.
    const edges = [
      edge('eb', ['c'], 'b', (i) => i['c']),
      edge('et', ['b'], 't', (i) => i['b']),
    ];
    const x = explainQuantity(edges, 't', ['c'], { identifications: [] });
    const d = x.derivations[0];
    expect(d.sources).toEqual(['b']); // last-hop
    expect(d.leafInputs).toEqual(['c']); // full-chain
  });
});

describe('explainQuantity — real 41-edge graph', () => {
  it('hawking-temperature from {mass: M_sun}: over-determined, consistent, value, NOT dimensionally closed', () => {
    const x = explainQuantity(FULL_GRAPH, 'hawking-temperature', {
      mass: M_SUN_KG,
    });
    expect(x.identifiability.verdict).toBe('over-determined');
    expect(new Set(x.derivations.map((d) => d.edge))).toEqual(
      new Set(['be-42', 'be-42-via-rs']),
    );
    expect(x.consistency?.outcome).toBe('consistent');
    expect(x.recoveredValue).toBeGreaterThan(6e-8);
    expect(x.recoveredValue).toBeLessThan(6.3e-8);
    // full-chain: be-42-via-rs's last-hop source is schwarzschild-radius,
    // but it traces back to the mass leaf
    const viaRs = x.derivations.find((d) => d.edge === 'be-42-via-rs')!;
    expect(viaRs.sources).toEqual(['schwarzschild-radius']);
    expect(viaRs.leafInputs).toEqual(['mass']);
    // mass alone (Θ-dim target) is NOT dimensionally sufficient
    expect(x.dimensional?.determined).toBe(false);
    expect(x.summary).toMatch(/do not fix it|dimensionful constants/);
  });

  it('schwarzschild-radius: graph computes it; declaring {G, c} makes it dimensionally closed', () => {
    const x = explainQuantity(
      FULL_GRAPH,
      'schwarzschild-radius',
      ['mass', 'G', 'c'],
      { extraDimensions: { G: GRAV_CONSTANT, c: VELOCITY } },
    );
    // the graph still computes it from mass alone (law edge)
    expect(x.identifiability.verdict).toBe('exactly-determined');
    expect(x.derivations[0].edge).toBe('law-schwarzschild-radius');
    // and dimensional analysis fixes r_s = const · G·M·c⁻²
    expect(x.dimensional?.determined).toBe(true);
    expect(x.dimensional?.monomial).toEqual({ mass: 1, G: 1, c: -2 });
    expect(x.summary).toMatch(/∝/);
  });

  it('a leaf input is reported as given', () => {
    const x = explainQuantity(FULL_GRAPH, 'mass', { mass: M_SUN_KG });
    expect(x.identifiability.verdict).toBe('given');
    expect(x.summary).toMatch(/supplied input/);
  });
});
