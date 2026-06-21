/**
 * Dimension-adjacency review surface: for quantities absent from a reference
 * vocabulary BY NAME but matching a reference quantity BY DIMENSION, list the
 * same-dimension candidates. A review surface for finding name-divergent true
 * aliases (like `thermal-de-broglie-wavelength ≡ thermal-wavelength`) and gaps —
 * NOT an auto-merge (same dimension ≠ same quantity).
 *
 * @module tests/composition/dimension-adjacency
 */
import { describe, it, expect } from 'vitest';
import { dimensionAdjacency } from '../../src/composition/dimension-adjacency.js';
import { MASS, TEMPERATURE, ENERGY, DIMENSIONLESS } from '../../src/dimensional/types.js';

const ref = new Map([
  ['mass', MASS],
  ['temperature', TEMPERATURE],
  ['photon-energy', ENERGY],
]);

describe('dimensionAdjacency', () => {
  it('surfaces a name-divergent quantity that dimension-matches a reference one', () => {
    const out = dimensionAdjacency(
      [{ name: 'effective-temperature', dim: TEMPERATURE }],
      ref,
    );
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('effective-temperature');
    expect(out[0].candidates).toContain('temperature');
  });

  it('excludes quantities whose NAME already matches the reference vocabulary', () => {
    const out = dimensionAdjacency([{ name: 'mass', dim: MASS }], ref);
    expect(out).toHaveLength(0);
  });

  it('excludes dimensionless quantities (too generic to be a useful candidate)', () => {
    const out = dimensionAdjacency([{ name: 'some-coupling', dim: DIMENSIONLESS }], ref);
    expect(out).toHaveLength(0);
  });

  it('excludes quantities whose dimension matches nothing in the reference', () => {
    const charge = { L: 0, M: 0, T: 1, I: 1, Theta: 0, N: 0, J: 0 }; // [charge]
    const out = dimensionAdjacency([{ name: 'gizmo', dim: charge }], ref);
    expect(out).toHaveLength(0);
  });

  it('de-duplicates repeated quantity names and sorts candidates', () => {
    const out = dimensionAdjacency(
      [
        { name: 'active-noise-energy', dim: ENERGY },
        { name: 'active-noise-energy', dim: ENERGY },
      ],
      new Map([
        ['photon-energy', ENERGY],
        ['erasure-energy', ENERGY],
      ]),
    );
    expect(out).toHaveLength(1);
    expect(out[0].candidates).toEqual(['erasure-energy', 'photon-energy']);
  });
});
