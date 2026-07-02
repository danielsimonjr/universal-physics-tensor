/**
 * Canonical graph information axis — verify that the projection carries
 * the information regime attribute with proper enum conversion.
 *
 * The canonical `Regime.information` uses camelCase (`vonNeumann`,
 * `shannon`, `kolmogorov`, `quantumDiscord`), while the composition graph's
 * `RegimeAttributes.information` uses kebab-case (`'von-neumann'`,
 * `'shannon'`, `'kolmogorov'`, `'discord'`). The adapter must map all four.
 */
import { describe, it, expect } from 'vitest';
import { CANONICAL_BY_ID } from '../../src/canonical/registry.js';
import { canonicalToEdges } from '../../src/composition/canonical-graph.js';
import type { CanonicalEquation } from '../../src/canonical/canonical-equation.js';
import { LENGTH, DIMENSIONLESS, ENERGY } from '../../src/dimensional/types.js';

describe('canonical-graph information axis', () => {
  // CE-landauer has information: 'shannon'
  it('projects shannon information measure to kebab-case', () => {
    const eq = CANONICAL_BY_ID['CE-landauer'];
    if (!eq) {
      throw new Error('CE-landauer not found in registry');
    }
    expect(eq.regime.information).toBe('shannon');
    const [edge] = canonicalToEdges([eq]);
    expect(edge.target.attributes.information).toBe('shannon');
  });

  // Create a test equation with vonNeumann (found in relativity.ts)
  it('projects vonNeumann information measure to kebab-case', () => {
    // Construct a minimal equation for testing
    const minimalVonNeumann: CanonicalEquation = {
      id: 'CE-test-vonneumann',
      name: 'Test von Neumann entropy',
      domain: 'quantum',
      formula_latex: 'S = A',
      epistemicStatus: 'dimensional',
      freeDimensionlessGroups: 0,
      dimensional: {
        target: { name: 'entropy', dim: ENERGY },
        governing: [{ name: 'area', dim: LENGTH }],
        monomial: { area: 2 },
      },
      regime: { information: 'vonNeumann' },
      assumptions: [],
      references: ['test'],
      partnerBridges: [],
    };
    const [edge] = canonicalToEdges([minimalVonNeumann]);
    expect(edge.target.attributes.information).toBe('von-neumann');
  });

  it('projects kolmogorov information measure to kebab-case', () => {
    const minimalKolmogorov: CanonicalEquation = {
      id: 'CE-test-kolmogorov',
      name: 'Test Kolmogorov complexity',
      domain: 'quantum',
      formula_latex: 'K = L',
      epistemicStatus: 'dimensional',
      freeDimensionlessGroups: 0,
      dimensional: {
        target: { name: 'complexity', dim: LENGTH },
        governing: [{ name: 'length', dim: LENGTH }],
        monomial: { length: 1 },
      },
      regime: { information: 'kolmogorov' },
      assumptions: [],
      references: ['test'],
      partnerBridges: [],
    };
    const [edge] = canonicalToEdges([minimalKolmogorov]);
    expect(edge.target.attributes.information).toBe('kolmogorov');
  });

  it('projects quantumDiscord information measure to discord (kebab-case)', () => {
    const minimalDiscord: CanonicalEquation = {
      id: 'CE-test-discord',
      name: 'Test quantum discord',
      domain: 'quantum',
      formula_latex: 'D = E',
      epistemicStatus: 'dimensional',
      freeDimensionlessGroups: 0,
      dimensional: {
        target: { name: 'discord', dim: DIMENSIONLESS },
        governing: [{ name: 'entanglement', dim: DIMENSIONLESS }],
        monomial: { entanglement: 0 },
      },
      regime: { information: 'quantumDiscord' },
      assumptions: [],
      references: ['test'],
      partnerBridges: [],
    };
    const [edge] = canonicalToEdges([minimalDiscord]);
    expect(edge.target.attributes.information).toBe('discord');
  });

  it('carries information attribute to all endpoint quantities (target + sources)', () => {
    const minimalWithSources: CanonicalEquation = {
      id: 'CE-test-all-sources',
      name: 'Test with sources',
      domain: 'quantum',
      formula_latex: 'S = a b',
      epistemicStatus: 'dimensional',
      freeDimensionlessGroups: 0,
      dimensional: {
        target: { name: 'entropy', dim: ENERGY },
        governing: [
          { name: 'area', dim: LENGTH },
          { name: 'boltzmann', dim: ENERGY },
        ],
        monomial: { area: 2, boltzmann: 1 },
      },
      regime: { information: 'vonNeumann' },
      assumptions: [],
      references: ['test'],
      partnerBridges: [],
    };
    const [edge] = canonicalToEdges([minimalWithSources]);
    // target should have the information attribute
    expect(edge.target.attributes.information).toBe('von-neumann');
    // all sources should have the information attribute
    for (const source of edge.sources) {
      expect(source.attributes.information).toBe('von-neumann');
    }
  });
});
