/**
 * BE-35 × 3D Ising conformal-bootstrap confrontation. Pins the bootstrap ν
 * prediction, the experimental (NOT Monte-Carlo) observed exponent, the within-1σ
 * agreement, and the registry wiring (DATA_CONFRONTED_IDS now 8).
 *
 * @module tests/bridges/be35-bootstrap-confrontation
 */
import { describe, it, expect } from 'vitest';
import {
  confrontBE35,
  BOOTSTRAP_NU,
  ISING_PELISSETTO_VICARI_2002,
} from '../../src/bridges/be35-bootstrap-confrontation.js';
import { CONFRONTATIONS, runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('BE-35 conformal-bootstrap 3D-Ising confrontation', () => {
  it('predicts the bootstrap correlation-length exponent ν = 0.629971', () => {
    expect(BOOTSTRAP_NU).toBeCloseTo(0.629971, 6);
    expect(confrontBE35().predicted_nu).toBe(BOOTSTRAP_NU);
  });

  it('the bootstrap prediction agrees with the measured exponent within 1σ (~0.015σ)', () => {
    const r = confrontBE35();
    expect(r.observed_nu).toBeCloseTo(0.63, 3);
    expect(r.observed_sigma).toBeCloseTo(0.002, 6);
    expect(r.residual_in_sigma).toBeCloseTo(0.0145, 3);
    expect(r.withinObserved).toBe(true);
  });

  it('uses the EXPERIMENTAL exponent (Pelissetto-Vicari), not Monte-Carlo', () => {
    const r = confrontBE35();
    expect(r.observation).toBe(ISING_PELISSETTO_VICARI_2002);
    expect(r.observation.provenance.citation).toMatch(/Pelissetto/);
    expect(r.observation.provenance.citation).toMatch(/Kos/); // the bootstrap source
    // the honest theory-vs-data guard: MC was deliberately excluded
    expect(r.observation.provenance.note).toMatch(/theory-vs-theory/);
  });

  it('is registered as a value confrontation', () => {
    expect(CONFRONTATIONS.has(35)).toBe(true);
    expect(CONFRONTATIONS.get(35)?.kind).toBe('value');
    expect(DATA_CONFRONTED_IDS.has(35)).toBe(true);
    expect(DATA_CONFRONTED_IDS.size).toBeGreaterThanOrEqual(8);
    const out = runConfrontation(35);
    expect(out?.kind).toBe('value');
    if (out?.kind === 'value') {
      expect(out.withinObserved).toBe(true);
      expect(out.residualInSigma).toBeLessThan(1);
    }
  });
});
