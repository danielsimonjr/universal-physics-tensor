/**
 * BE-21 × QGP KSS-bound confrontation — the "most perfect fluid". Pins the KSS
 * lower bound 1/(4π), the QGP η/s satisfying + nearly saturating it, and the
 * registry wiring (DATA_CONFRONTED_IDS auto-projects the keyset, now 7).
 *
 * @module tests/bridges/be21-kss-confrontation
 */
import { describe, it, expect } from 'vitest';
import {
  confrontBE21,
  KSS_BOUND,
  QGP_BMB19,
} from '../../src/bridges/be21-kss-confrontation.js';
import { CONFRONTATIONS, runConfrontation } from '../../src/bridges/confrontations.js';
import { DATA_CONFRONTED_IDS } from '../../src/bridges/confrontation-coverage.js';

describe('BE-21 KSS viscosity-bound confrontation', () => {
  it('predicts the KSS lower bound η/s = 1/(4π) ≈ 0.0796', () => {
    expect(KSS_BOUND).toBeCloseTo(1 / (4 * Math.PI), 12);
    expect(confrontBE21().predicted_bound).toBeCloseTo(0.07958, 4);
  });

  it('the QGP η/s satisfies and nearly saturates the bound (gap ≈ 26%)', () => {
    const r = confrontBE21();
    expect(r.satisfiesBound).toBe(true);
    expect(r.observed_eta_over_s).toBeGreaterThanOrEqual(r.predicted_bound);
    expect(r.fractional_gap).toBeCloseTo(0.257, 2);
    // "nearly saturates" — within a small O(1) factor, not orders of magnitude
    expect(r.fractional_gap).toBeLessThan(1);
  });

  it('defaults to the Bernhard-Moreland-Bass 2019 extraction with a cited band', () => {
    const r = confrontBE21();
    expect(r.observation).toBe(QGP_BMB19);
    expect(r.observation.provenance.citation).toMatch(/Bernhard/);
    expect(r.observation.provenance.citation).toMatch(/Kovtun/); // the bound's source
    expect(r.observation.band[0]).toBeLessThan(r.observation.band[1]);
  });

  it('is registered as a consistency confrontation (DATA_CONFRONTED_IDS now 7)', () => {
    expect(CONFRONTATIONS.has(21)).toBe(true);
    expect(CONFRONTATIONS.get(21)?.kind).toBe('consistency');
    expect(DATA_CONFRONTED_IDS.has(21)).toBe(true);
    expect(DATA_CONFRONTED_IDS.size).toBe(7);
    const out = runConfrontation(21);
    expect(out?.kind).toBe('consistency');
    if (out?.kind === 'consistency') {
      expect(out.predicted).toBeCloseTo(1 / (4 * Math.PI), 6);
      expect(out.approaches).toBeGreaterThan(out.predicted);
    }
  });
});
