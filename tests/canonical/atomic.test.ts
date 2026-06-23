/**
 * Atomic-scale derived-constant canonical entries — presence + id smoke test.
 * Dimensional correctness is guarded registry-wide in invariants.test.ts.
 *
 * @module tests/canonical/atomic
 */
import { describe, it, expect } from 'vitest';
import { ATOMIC } from '../../src/canonical/entries/atomic.js';

const EXPECTED_IDS = [
  'CE-bohr-magneton',
  // Folded in from the former l1-quantum-em batch file (2026-06-22 god-file
  // split): the quantum-domain monomials (Bohr radius already-adjacent).
  'CE-bohr-radius',
  'CE-classical-electron-radius',
  'CE-de-broglie',
  'CE-planck-einstein',
  'CE-rydberg-energy',
];

describe('ATOMIC canonical entries', () => {
  it('has the atomic derived-constant set', () => {
    expect(ATOMIC.length).toBe(EXPECTED_IDS.length);
    expect(ATOMIC.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });
});
