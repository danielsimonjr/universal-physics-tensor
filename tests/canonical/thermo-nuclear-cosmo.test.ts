/**
 * Thermo/nuclear/cosmo canonical entries — presence + id smoke test.
 * Dimensional correctness is guarded registry-wide in invariants.test.ts.
 *
 * @module tests/canonical/thermo-nuclear-cosmo
 */
import { describe, it, expect } from 'vitest';
import { THERMO_NUCLEAR_COSMO } from '../../src/canonical/entries/thermo-nuclear-cosmo.js';

const EXPECTED_IDS = [
  'CE-half-life',
  'CE-heat-capacity',
  'CE-hubble-distance',
  // Folded in from the former l1-gravity-thermo / l1-quantum-em batch files
  // (2026-06-22 god-file split): the thermodynamic / statistical monomials.
  'CE-ideal-gas',
  'CE-jarzynski',
  'CE-landauer',
  'CE-stefan-boltzmann',
  'CE-wien',
].sort();

describe('THERMO_NUCLEAR_COSMO canonical entries', () => {
  it('has the thermo/nuclear/cosmo law set', () => {
    expect(THERMO_NUCLEAR_COSMO.length).toBe(EXPECTED_IDS.length);
    expect(THERMO_NUCLEAR_COSMO.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });
});
