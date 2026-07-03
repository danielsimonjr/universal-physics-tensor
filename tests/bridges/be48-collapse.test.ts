import { describe, it, expect } from 'vitest';
import { confrontBE48, LISA_PATHFINDER_CSL } from '../../src/bridges/be48-collapse-confrontation.js';
import { runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('confrontBE48 (GRW rate vs LISA-Pathfinder CSL bound)', () => {
  it('predicted single-nucleon GRW rate is 1e-16 /s', () => {
    expect(confrontBE48().predicted_rate_per_s).toBeCloseTo(1e-16, 26);
  });
  it('bound is the Carlesso 2016 CSL value 2.96e-8 /s', () => {
    expect(LISA_PATHFINDER_CSL.bound_rate_per_s).toBeCloseTo(2.96e-8, 12);
  });
  it('the GRW rate is far below the bound: not excluded (satisfied)', () => {
    const r = confrontBE48();
    expect(r.satisfied).toBe(true);
    expect(r.predicted_rate_per_s).toBeLessThan(LISA_PATHFINDER_CSL.bound_rate_per_s);
  });
  it('is registered as upper-bound kind and lights up DATA_CONFRONTED_IDS', () => {
    expect(runConfrontation(48)?.kind).toBe('upper-bound');
    expect(DATA_CONFRONTED_IDS.has(48)).toBe(true);
  });
});
