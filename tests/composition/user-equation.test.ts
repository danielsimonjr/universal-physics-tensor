/**
 * User-equation injection — parse a free-form `TARGET = EXPR` into a junction
 * (target + source quantities), resolve user symbols to the catalog vocabulary
 * (literal or `_`↔`-` swap), suggest near-misses, and report where the injected
 * junction lands in a built `VizModel`.
 *
 * @module tests/composition/user-equation
 */
import { describe, it, expect } from 'vitest';
import {
  parseUserEquation,
  resolveToCatalogName,
  suggestQuantities,
  suggestByDimension,
  equationLanding,
  analyzeUserEquation,
  UserEquationError,
} from '../../src/composition/user-equation.js';
import {
  LENGTH, MASS, TIME, VELOCITY, ACCELERATION, ENERGY, FREQUENCY,
} from '../../src/dimensional/types.js';
import { buildVizModel } from '../../src/composition/graph-viz.js';
import type { VizJunction } from '../../src/composition/graph-viz.js';
import type { BridgeEdge } from '../../src/composition/edge.js';
import type { Quantity } from '../../src/composition/quantity.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

const q = (name: string): Quantity => ({ name, symbol: name, dim: DIMENSIONLESS, attributes: {} });
const edge = (id: string, src: string[], tgt: string): BridgeEdge => ({
  id, beId: null, kind: 'bridge', label: id,
  sources: src.map(q), target: q(tgt),
  confidence: 'speculative',
  domain: { description: 'any', predicate: () => true },
  evaluate: () => 0, citation: 'synthetic',
});

describe('parseUserEquation', () => {
  it('splits TARGET = EXPR and extracts source quantities', async () => {
    const e = await parseUserEquation('period = 2*pi*sqrt(length/gravity)');
    expect(e.target).toBe('period');
    expect([...e.sources].sort()).toEqual(['gravity', 'length']);
    expect(e.text).toContain('period =');
  });

  it('strips physics constants (h, c, k_B), numbers, pi, and functions', async () => {
    const e = await parseUserEquation('photon_energy = h * nu');
    expect(e.target).toBe('photon_energy');
    expect(e.sources).toEqual(['nu']); // h removed as a constant
  });

  it('preserves underscores in quantity names', async () => {
    const e = await parseUserEquation('x = secondary_mass * c');
    expect(e.sources).toEqual(['secondary_mass']); // c removed; underscore kept
  });

  it('rejects a missing "="', async () => {
    await expect(parseUserEquation('period 2*pi')).rejects.toThrow(UserEquationError);
  });

  it('rejects an empty target', async () => {
    await expect(parseUserEquation('  = length')).rejects.toThrow(UserEquationError);
  });

  it('rejects an RHS with no source quantities (only constants/numbers)', async () => {
    await expect(parseUserEquation('x = 2*pi*c')).rejects.toThrow(UserEquationError);
  });
});

describe('resolveToCatalogName', () => {
  const names = new Set(['photon-energy', 'impact_parameter', 'mass']);
  it('matches a literal name', () => {
    expect(resolveToCatalogName('mass', names)).toBe('mass');
    expect(resolveToCatalogName('photon-energy', names)).toBe('photon-energy');
    expect(resolveToCatalogName('impact_parameter', names)).toBe('impact_parameter');
  });
  it('matches via the _<->- swap (both directions)', () => {
    expect(resolveToCatalogName('photon_energy', names)).toBe('photon-energy');
    expect(resolveToCatalogName('impact-parameter', names)).toBe('impact_parameter');
  });
  it('returns null for an unmatched name', () => {
    expect(resolveToCatalogName('unknown-thing', names)).toBeNull();
  });
});

describe('suggestQuantities', () => {
  const names = ['temperature', 'mass', 'time', 'photon-energy', 'energy'];
  it('puts the closest catalog name first for a near miss', () => {
    expect(suggestQuantities('temperatur', names)[0]).toBe('temperature');
  });
  it('respects the k limit', () => {
    expect(suggestQuantities('e', names, 2).length).toBeLessThanOrEqual(2);
  });

  it('filters out spurious short-name matches (relevance gate)', () => {
    // a typo of "length" must not suggest unrelated short names like "a"/"nu".
    const got = suggestQuantities('lenth', ['length', 'a', 'nu', 'mass']);
    expect(got).toContain('length');
    expect(got).not.toContain('a');
    expect(got).not.toContain('nu');
  });
});

describe('suggestByDimension', () => {
  const ENERGY = { L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
  const cat = new Map([
    ['photon-energy', ENERGY],
    ['erasure-energy', ENERGY],
    ['mass', MASS],
    ['length', LENGTH],
  ]);
  it('returns catalog names of the matching dimension, sorted', () => {
    expect(suggestByDimension(ENERGY, cat)).toEqual(['erasure-energy', 'photon-energy']);
  });
  it('excludes non-matching dimensions and respects k', () => {
    expect(suggestByDimension(ENERGY, cat, 1)).toEqual(['erasure-energy']);
    expect(suggestByDimension(MASS, cat)).toEqual(['mass']);
  });
});

describe('equationLanding', () => {
  // a→b (e1), b→d (e2) form one cluster {e1,e2} sharing b; x→y (e3) is isolated.
  const FIXTURE: BridgeEdge[] = [
    edge('e1', ['a'], 'b'),
    edge('e2', ['b'], 'd'),
    edge('e3', ['x'], 'y'),
  ];

  it('reports the cluster a connected user equation joins', () => {
    const user: VizJunction = {
      id: 'user-equation', label: 'd = a + g', status: 'user',
      sources: ['a'], target: 'd', // shares a and d with the {e1,e2} cluster
    };
    const model = buildVizModel(FIXTURE, { extraJunctions: [user] });
    const landing = equationLanding(model, 'user-equation');
    expect(landing.isolated).toBe(false);
    expect(landing.connectedJunctionIds).toEqual(
      expect.arrayContaining(['e1', 'e2']),
    );
    expect(landing.sharedQuantities).toEqual(
      expect.arrayContaining(['a', 'd']),
    );
  });

  it('reports isolation when the equation shares no quantity', () => {
    const user: VizJunction = {
      id: 'user-equation', label: 'p = u + v', status: 'user',
      sources: ['u'], target: 'p',
    };
    const model = buildVizModel(FIXTURE, { extraJunctions: [user] });
    const landing = equationLanding(model, 'user-equation');
    expect(landing.isolated).toBe(true);
    expect(landing.clusterSize).toBe(1);
    expect(landing.connectedJunctionIds).toEqual([]);
  });
});

describe('analyzeUserEquation — dimensional validation + hints', () => {
  const cat = new Map([
    ['period', TIME], ['length', LENGTH], ['gravity', ACCELERATION],
    ['mass', MASS], ['speed', VELOCITY], ['photon-energy', ENERGY],
    ['frequency', FREQUENCY],
  ]);

  it('reports a dimensionally consistent equation', async () => {
    const a = await analyzeUserEquation('period = length / speed', cat);
    expect(a.parseError).toBeNull();
    expect(a.consistent).toBe(true);
  });

  it('flags a dimensional mismatch (period = mass)', async () => {
    const a = await analyzeUserEquation('period = mass', cat);
    expect(a.parseError).toBeNull();
    expect(a.consistent).toBe(false);
  });

  it('infers a single unknown\'s dimension for a dimension-based hint', async () => {
    // period = unknown / gravity ⟹ unknown is a velocity ⟹ suggest "speed".
    const a = await analyzeUserEquation('period = uu / gravity', cat);
    const hint = a.hints.find((h) => h.name === 'uu');
    expect(hint?.byDimension).toBe(true);
    expect(hint?.suggestions).toContain('speed');
  });

  it('gives physics constants their real dimensions (h carries action)', async () => {
    // photon_energy = h * nu ⟹ nu is a frequency (NOT energy), proving h's
    // dimension (action) was supplied to the parser.
    const a = await analyzeUserEquation('photon_energy = h * nu', cat);
    const hint = a.hints.find((h) => h.name === 'nu');
    expect(hint?.byDimension).toBe(true);
    expect(hint?.suggestions).toContain('frequency');
  });

  it('reports a parseError on a non-homogeneous RHS', async () => {
    const a = await analyzeUserEquation('period = length + gravity', cat);
    expect(a.parseError).not.toBeNull();
    expect(a.rhsDimension).toBeNull();
  });

  it('throws UserEquationError on a structurally malformed equation', async () => {
    await expect(analyzeUserEquation('no equals', cat)).rejects.toThrow(UserEquationError);
  });
});
