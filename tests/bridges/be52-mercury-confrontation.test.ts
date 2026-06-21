/**
 * BE-52 × Mercury — confront the GR perihelion-precession bridge with the
 * classic measured anomalous advance of Mercury's perihelion (the second
 * committed real-data confrontation of an *established* bridge).
 *
 * @module tests/bridges/be52-mercury-confrontation
 */
import { describe, it, expect } from 'vitest';
import {
  confrontBE52,
  MERCURY,
} from '../../src/bridges/be52-mercury-confrontation.js';

describe('confrontBE52 — Mercury perihelion precession', () => {
  it('reproduces the textbook GR prediction ~43 arcsec/century', () => {
    const r = confrontBE52();
    expect(r.predicted_arcsec_per_century).toBeGreaterThan(42.5);
    expect(r.predicted_arcsec_per_century).toBeLessThan(43.5);
  });

  it('agrees with the observed anomalous precession within 1σ', () => {
    const r = confrontBE52();
    expect(r.observed_arcsec_per_century).toBe(MERCURY.observed_precession_arcsec_per_century);
    expect(Math.abs(r.residual_arcsec_per_century)).toBeLessThanOrEqual(
      MERCURY.observed_sigma_arcsec_per_century,
    );
    expect(r.withinObserved).toBe(true);
  });

  it('reports the residual as predicted − observed and carries a citation', () => {
    const r = confrontBE52();
    expect(r.residual_arcsec_per_century).toBeCloseTo(
      r.predicted_arcsec_per_century - r.observed_arcsec_per_century,
      9,
    );
    expect(r.observation.citation).toMatch(/Clemence/);
  });

  it('validates the observation record', () => {
    expect(() => confrontBE52({ ...MERCURY, semi_major_axis_m: -1 })).toThrow(RangeError);
  });
});
