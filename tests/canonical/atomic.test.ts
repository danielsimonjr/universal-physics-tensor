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
  'CE-classical-electron-radius',
  'CE-rydberg-energy',
];

describe('ATOMIC canonical entries', () => {
  it('has the atomic derived-constant set', () => {
    expect(ATOMIC.length).toBe(EXPECTED_IDS.length);
    expect(ATOMIC.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });
});
