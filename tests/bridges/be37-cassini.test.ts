import { describe, it, expect } from 'vitest';
import { confrontBE37, CASSINI } from '../../src/bridges/be37-cassini-confrontation.js';
import { runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('confrontBE37 (Cassini Shapiro / PPN gamma)', () => {
  it('predicts gamma = 1 exactly (GR Shapiro form)', () => {
    expect(confrontBE37().predicted_gamma).toBe(1);
  });
  it('observed gamma and sigma match Bertotti 2003', () => {
    expect(CASSINI.observed_gamma).toBeCloseTo(1 + 2.1e-5, 12);
    expect(CASSINI.observed_gamma_sigma).toBeCloseTo(2.3e-5, 12);
  });
  it('residual is ~0.91 sigma, within 1 sigma', () => {
    const r = confrontBE37();
    expect(r.residual_in_sigma).toBeCloseTo(2.1e-5 / 2.3e-5, 6);
    expect(r.withinObserved).toBe(true);
  });
  it('is registered as a value-kind confrontation and lights up DATA_CONFRONTED_IDS', () => {
    const outcome = runConfrontation(37);
    expect(outcome?.kind).toBe('value');
    expect(DATA_CONFRONTED_IDS.has(37)).toBe(true);
  });
});
