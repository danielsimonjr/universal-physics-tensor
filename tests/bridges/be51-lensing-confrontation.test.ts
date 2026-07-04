/**
 * BE-51 × VLBI gravitational-lensing confrontation — the third classic GR test
 * (deflection of light) in the confrontation registry. Pins the evaluator-driven
 * predicted deflection, the VLBI-γ-derived observed value, the sub-σ residual,
 * and registry wiring (DATA_CONFRONTED_IDS auto-projects the keyset).
 *
 * @module tests/bridges/be51-lensing-confrontation
 */
import { describe, it, expect } from 'vitest';
import {
  confrontBE51,
  VLBI_LAMBERT_2009,
} from '../../src/bridges/be51-lensing-confrontation.js';
import { CONFRONTATIONS, runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('BE-51 gravitational-lensing confrontation', () => {
  it('predicts the ~1.75 arcsec GR solar-limb deflection from the bridge evaluator', () => {
    const r = confrontBE51();
    expect(r.predicted_arcsec).toBeGreaterThan(1.74);
    expect(r.predicted_arcsec).toBeLessThan(1.76);
  });

  it('derives observed = (1+γ)/2 × predicted from the VLBI γ', () => {
    const r = confrontBE51();
    const scaling = (1 + VLBI_LAMBERT_2009.observed_gamma) / 2;
    expect(r.observed_arcsec).toBeCloseTo(scaling * r.predicted_arcsec, 10);
    expect(r.observed_sigma_arcsec).toBeCloseTo(
      (VLBI_LAMBERT_2009.observed_gamma_sigma / 2) * r.predicted_arcsec,
      10,
    );
    expect(r.observed_sigma_arcsec).toBeGreaterThan(0);
  });

  it('agrees with GR within 1σ (γ consistent with 1), residual ≈ 0.67σ', () => {
    const r = confrontBE51();
    expect(r.withinObserved).toBe(true);
    expect(r.residual_in_sigma).toBeLessThanOrEqual(1);
    // (1 − (1+γ)/2) / (γ_σ/2) = |γ−1| / γ_σ = 0.8e-4 / 1.2e-4 = 0.667
    expect(r.residual_in_sigma).toBeCloseTo(0.667, 2);
  });

  it('defaults to the Lambert & Le Poncin-Lafitte 2009 observation', () => {
    const r = confrontBE51();
    expect(r.observation).toBe(VLBI_LAMBERT_2009);
    expect(r.observation.provenance.citation).toMatch(/Lambert/);
    expect(r.observation.provenance.year).toBe(2009);
  });

  it('is registered and folds into DATA_CONFRONTED_IDS', () => {
    expect(CONFRONTATIONS.has(51)).toBe(true);
    expect(CONFRONTATIONS.get(51)?.kind).toBe('value');
    expect(DATA_CONFRONTED_IDS.has(51)).toBe(true);
    expect(DATA_CONFRONTED_IDS.size).toBeGreaterThanOrEqual(6);
    const out = runConfrontation(51);
    expect(out?.kind).toBe('value');
    if (out?.kind === 'value') {
      expect(out.units).toMatch(/arcsec/);
      expect(out.withinObserved).toBe(true);
    }
  });
});
