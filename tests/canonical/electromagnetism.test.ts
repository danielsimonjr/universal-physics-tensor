/**
 * Electromagnetism canonical entries — presence + id smoke test. Dimensional
 * correctness (every determinate monomial reproduces its target dimension) is
 * guarded registry-wide in invariants.test.ts.
 *
 * @module tests/canonical/electromagnetism
 */
import { describe, it, expect } from 'vitest';
import { ELECTROMAGNETISM } from '../../src/canonical/entries/electromagnetism.js';

const EXPECTED_IDS = [
  'CE-capacitance-parallel-plate',
  'CE-capacitor-energy',
  // Folded in from the former l1-quantum-em batch file (2026-06-22 god-file
  // split): the two electromagnetism-domain force laws.
  'CE-coulomb',
  'CE-cyclotron-frequency',
  'CE-electrical-power',
  'CE-inductor-energy',
  'CE-larmor-radius',
  'CE-lc-resonance',
  'CE-lorentz-force',
  'CE-magnetic-field-wire',
  'CE-ohm-law',
  'CE-point-charge-field',
  'CE-resistance-material',
];

describe('ELECTROMAGNETISM canonical entries', () => {
  it('has the standard EM/circuit law set', () => {
    expect(ELECTROMAGNETISM.length).toBe(EXPECTED_IDS.length);
    expect(ELECTROMAGNETISM.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });

  it('all are electromagnetism-domain entries', () => {
    for (const e of ELECTROMAGNETISM) expect(e.domain, e.id).toBe('electromagnetism');
  });
});
