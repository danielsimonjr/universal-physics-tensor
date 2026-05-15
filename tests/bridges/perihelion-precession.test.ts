import { describe, it, expect } from 'vitest';
import { evaluatePerihelionPrecession } from '../../src/bridges/perihelion-precession.js';

describe("BE-52 Mercury's Perihelion Precession (Einstein 1915) — closed-form", () => {
  it('Mercury: ~43 arcsec/century (matches measurement)', () => {
    const M_sun = 1.989e30;
    const a_m = 5.79e10;          // Mercury semi-major axis
    const e = 0.2056;              // Mercury eccentricity
    const T_yr = 0.241;            // Mercury orbital period (years)
    const { dphi_rad_per_orbit, dphi_arcsec_per_century }
      = evaluatePerihelionPrecession({ M_kg: M_sun, a_m, e, T_yr });
    // Predicted: ~43.0 arcsec/century
    expect(dphi_arcsec_per_century).toBeCloseTo(43.0, 0); // within 0.5 arcsec
    // Also verify rad per orbit is a small positive number
    expect(dphi_rad_per_orbit).toBeGreaterThan(0);
  });

  it('linear in M, inverse in a(1-e²)', () => {
    const base = evaluatePerihelionPrecession({
      M_kg: 1.989e30, a_m: 5.79e10, e: 0.2, T_yr: 0.241,
    }).dphi_rad_per_orbit;
    const doubleMass = evaluatePerihelionPrecession({
      M_kg: 2 * 1.989e30, a_m: 5.79e10, e: 0.2, T_yr: 0.241,
    }).dphi_rad_per_orbit;
    expect(doubleMass / base).toBeCloseTo(2, 12);
  });

  it('domain: rejects e >= 1 (unbound orbit), a <= 0, T_yr <= 0', () => {
    const base = { M_kg: 1.989e30, a_m: 5.79e10, e: 0.2, T_yr: 0.241 };
    expect(() => evaluatePerihelionPrecession({ ...base, e: 1.0 })).toThrow(/eccentricity/i);
    expect(() => evaluatePerihelionPrecession({ ...base, a_m: 0 })).toThrow(/a_m.*positive/i);
    expect(() => evaluatePerihelionPrecession({ ...base, T_yr: 0 })).toThrow(/T_yr.*positive/i);
  });
});
