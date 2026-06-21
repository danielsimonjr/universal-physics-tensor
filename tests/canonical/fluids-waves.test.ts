/**
 * Fluids & waves canonical entries — presence + id smoke test. Dimensional
 * correctness is guarded registry-wide in invariants.test.ts.
 *
 * @module tests/canonical/fluids-waves
 */
import { describe, it, expect } from 'vitest';
import { FLUIDS_WAVES } from '../../src/canonical/entries/fluids-waves.js';

const EXPECTED_IDS = [
  'CE-buoyant-force',
  'CE-density-definition',
  'CE-hydrostatic-pressure',
  'CE-pressure-definition',
  'CE-sound-speed',
  'CE-stokes-drag',
  'CE-wave-speed',
];

describe('FLUIDS_WAVES canonical entries', () => {
  it('has the fluids/waves law set', () => {
    expect(FLUIDS_WAVES.length).toBe(EXPECTED_IDS.length);
    expect(FLUIDS_WAVES.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });
});
