/**
 * The solar gravitational parameter used by the GR confrontations (Mothership ruling on persona
 * finding L6, 2026-09-25).
 *
 * BE-51 used G × 1.989e30 kg and BE-52 used G × 1.98892e30 kg for GM☉. With G = 6.67430e-11 those
 * are 3.0e-4 and 2.6e-4 above the IAU 2015 nominal (GM)☉ = 1.3271244e20 m³ s⁻² (Resolution B3).
 * For BE-51 the offset, 5.2e-4 arcsec, is five times the VLBI 1σ on the deflection. The
 * confrontations now take GM☉ from the nominal value. The residuals do not move: BE-51 tests only
 * γ, and BE-52 moves from 0.263σ to 0.288σ.
 *
 * Every expected number below is computed here from the constants, never read back from the
 * code under test.
 */

import { describe, expect, it } from 'vitest';
import { GM_SUN_SI, GM_SUN_SOURCE, G_SI, C_SI } from '../../src/core/constants.js';
import { confrontBE51 } from '../../src/bridges/be51-lensing-confrontation.js';
import { confrontBE52, MERCURY } from '../../src/bridges/be52-mercury-confrontation.js';
import { confrontBE37 } from '../../src/bridges/be37-cassini-confrontation.js';

const ARCSEC_PER_RAD = (180 / Math.PI) * 3600;

describe('the nominal solar gravitational parameter', () => {
  it('is the IAU 2015 Resolution B3 value, and names its source', () => {
    expect(GM_SUN_SI).toBe(1.3271244e20);
    expect(GM_SUN_SOURCE).toMatch(/IAU 2015 Resolution B3/);
  });
});

describe('the GR confrontations use it', () => {
  it('BE-51: the solar-limb deflection is 4 GM☉ / (c² R☉) with the nominal GM☉', () => {
    const expected = ((4 * 1.3271244e20) / (C_SI * C_SI * 6.957e8)) * ARCSEC_PER_RAD;
    expect(expected).toBeCloseTo(1.75119032556, 10);
    expect(Math.abs(confrontBE51().predicted_arcsec / expected - 1)).toBeLessThan(1e-12);
  });

  it('BE-51: the residual is unchanged, because it tests only γ', () => {
    expect(confrontBE51().residual_in_sigma).toBeCloseTo(2 / 3, 9);
  });

  it('BE-52: Mercury’s central mass gives G·M = the nominal GM☉', () => {
    expect(Math.abs((G_SI * MERCURY.central_mass_kg) / 1.3271244e20 - 1)).toBeLessThan(1e-15);
    const a = 5.79091e10;
    const e = 0.20563;
    const perOrbit = (6 * Math.PI * 1.3271244e20) / (a * (1 - e * e) * C_SI * C_SI);
    const expected = (perOrbit * ARCSEC_PER_RAD * 100) / 0.2408467;
    expect(expected).toBeCloseTo(42.9805618623, 9);
    expect(Math.abs(confrontBE52().predicted_arcsec_per_century / expected - 1)).toBeLessThan(1e-12);
  });

  it('BE-37 does not depend on GM☉: its prediction is the PPN γ = 1 of the γ = 1 Shapiro form', () => {
    expect(confrontBE37().predicted_gamma).toBe(1);
  });
});
