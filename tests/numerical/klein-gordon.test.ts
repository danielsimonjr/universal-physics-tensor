/**
 * Klein-Gordon dispersion-relation evaluator tests (G-7 debt closure).
 *
 * Pins the free-field plane-wave dispersion residual
 *
 *   r = (ω² − c²k² − (mc²/ℏ)²) / (ω² + c²k² + (mc²/ℏ)²)
 *
 * (Peskin & Schroeder 1995 §2.1: ω_k² = |k|² + m² in natural units;
 * SI factors restored) and the verifyKleinGordonPlaneWave closure check.
 *
 * Expected values are recomputed by hand IN THIS FILE from the same
 * constants (C_SI, HBAR_SI) — no oracle copied from the implementation.
 *
 * @module tests/numerical/klein-gordon
 */
import { describe, it, expect } from 'vitest';
import {
  evaluateKGDispersionResidual,
  verifyKleinGordonPlaneWave,
} from '../../src/numerical/klein-gordon.js';
import { C_SI, HBAR_SI } from '../../src/core/constants.js';

// Electron mass (kg), CODATA 2018: m_e = 9.1093837015(28)e-31 kg.
// Local literal on purpose — parallel work owns src/core/constants.ts.
const M_E_KG = 9.1093837015e-31;

describe('evaluateKGDispersionResidual', () => {
  it('(a) massless limit: ω = ck is exactly on shell (residual 0 to 1e-15)', () => {
    const ks = [1, 1e3, 1e7, 1e12]; // m⁻¹
    for (const k of ks) {
      const r = evaluateKGDispersionResidual({
        omega_per_s: C_SI * k,
        k_per_m: k,
        mass_kg: 0,
      });
      expect(Math.abs(r)).toBeLessThanOrEqual(1e-15);
    }
  });

  it('(b) electron at k = 1e10 m⁻¹: hand-computed ω closes to ≤ 1e-15', () => {
    const k = 1e10; // m⁻¹
    // Hand-built from the SI dispersion ω² = c²k² + (m_e c²/ℏ)²:
    const ck = C_SI * k;
    const omegaC = (M_E_KG * C_SI * C_SI) / HBAR_SI; // Compton angular freq
    const omegaExpected = Math.sqrt(ck * ck + omegaC * omegaC);

    // Sanity on the hand value itself: ω_C ≈ 7.76e20 rad/s, ck ≈ 3.0e18,
    // so ω is mass-dominated (ω ≈ ω_C to ~1e-5).
    expect(omegaExpected).toBeGreaterThan(omegaC);
    expect(omegaExpected / omegaC).toBeCloseTo(1, 4);

    const r = evaluateKGDispersionResidual({
      omega_per_s: omegaExpected,
      k_per_m: k,
      mass_kg: M_E_KG,
    });
    expect(Math.abs(r)).toBeLessThanOrEqual(1e-15);
  });

  it('(c) deliberately wrong ω (1% off shell) yields |residual| > 1e-3', () => {
    const k = 1e10;
    const ck = C_SI * k;
    const omegaC = (M_E_KG * C_SI * C_SI) / HBAR_SI;
    const omegaExact = Math.sqrt(ck * ck + omegaC * omegaC);

    for (const factor of [1.01, 0.99]) {
      const r = evaluateKGDispersionResidual({
        omega_per_s: factor * omegaExact,
        k_per_m: k,
        mass_kg: M_E_KG,
      });
      // (f²−1)/(f²+1) ≈ ±0.00995 for f = 1 ± 0.01.
      expect(Math.abs(r)).toBeGreaterThan(1e-3);
    }
  });

  it('(d) rejects non-finite and out-of-domain inputs', () => {
    const good = { omega_per_s: 1e15, k_per_m: 1e6, mass_kg: 0 };

    // ω must be finite and strictly positive.
    expect(() =>
      evaluateKGDispersionResidual({ ...good, omega_per_s: 0 }),
    ).toThrow(/omega_per_s must be a finite positive number/);
    expect(() =>
      evaluateKGDispersionResidual({ ...good, omega_per_s: -1 }),
    ).toThrow(/omega_per_s must be a finite positive number/);
    expect(() =>
      evaluateKGDispersionResidual({ ...good, omega_per_s: NaN }),
    ).toThrow(/omega_per_s/);
    expect(() =>
      evaluateKGDispersionResidual({ ...good, omega_per_s: Infinity }),
    ).toThrow(/omega_per_s/);

    // k must be finite and ≥ 0.
    expect(() =>
      evaluateKGDispersionResidual({ ...good, k_per_m: -1 }),
    ).toThrow(/k_per_m must be a finite non-negative number/);
    expect(() =>
      evaluateKGDispersionResidual({ ...good, k_per_m: NaN }),
    ).toThrow(/k_per_m/);

    // m must be finite and ≥ 0.
    expect(() =>
      evaluateKGDispersionResidual({ ...good, mass_kg: -1e-30 }),
    ).toThrow(/mass_kg must be a finite non-negative number/);
    expect(() =>
      evaluateKGDispersionResidual({ ...good, mass_kg: Infinity }),
    ).toThrow(/mass_kg/);
  });
});

describe('verifyKleinGordonPlaneWave', () => {
  it('constructs the exact dispersion root and closes within tolerance', () => {
    const k = 1e10;
    const ck = C_SI * k;
    const omegaC = (M_E_KG * C_SI * C_SI) / HBAR_SI;
    const omegaExpected = Math.sqrt(ck * ck + omegaC * omegaC);

    const result = verifyKleinGordonPlaneWave({
      mass_kg: M_E_KG,
      k_per_m: k,
    });
    expect(result.omega_per_s).toBe(omegaExpected);
    expect(Math.abs(result.residual)).toBeLessThanOrEqual(1e-15);
    expect(result.withinTolerance).toBe(true);
  });

  it('massless field: ω = ck (photon-like dispersion)', () => {
    const k = 2.5e6;
    const result = verifyKleinGordonPlaneWave({ mass_kg: 0, k_per_m: k });
    const relErr = Math.abs(result.omega_per_s - C_SI * k) / (C_SI * k);
    expect(relErr).toBeLessThanOrEqual(1e-15);
    expect(Math.abs(result.residual)).toBeLessThanOrEqual(1e-15);
    expect(result.withinTolerance).toBe(true);
  });

  it('(e) non-relativistic limit: ω ≈ mc²/ℏ + ℏk²/2m at k = 1e-4·mc/ℏ (relErr ≤ 1e-6)', () => {
    // k << mc/ℏ ⇒ ω = ω_C √(1 + (ℏk/mc)²) ≈ mc²/ℏ + ℏk²/(2m)
    // (rest-mass frequency + non-relativistic kinetic term; next correction
    //  is −ω_C·(ℏk/mc)⁴/8 ≈ 1.25e-17 relative at ℏk/mc = 1e-4).
    const kCompton = (M_E_KG * C_SI) / HBAR_SI; // mc/ℏ, inverse reduced Compton wavelength
    const k = 1e-4 * kCompton;

    const { omega_per_s } = verifyKleinGordonPlaneWave({
      mass_kg: M_E_KG,
      k_per_m: k,
    });

    const omegaNonRel =
      (M_E_KG * C_SI * C_SI) / HBAR_SI + (HBAR_SI * k * k) / (2 * M_E_KG);
    const relErr = Math.abs(omega_per_s - omegaNonRel) / omega_per_s;
    expect(relErr).toBeLessThanOrEqual(1e-6);
  });

  it('honors a caller-supplied tight tolerance', () => {
    const result = verifyKleinGordonPlaneWave({
      mass_kg: M_E_KG,
      k_per_m: 1e10,
      tolerance: 1e-15,
    });
    expect(result.withinTolerance).toBe(true);
  });

  it('input-validation rejections', () => {
    expect(() =>
      verifyKleinGordonPlaneWave({ mass_kg: -1, k_per_m: 1 }),
    ).toThrow(/mass_kg must be a finite non-negative number/);
    expect(() =>
      verifyKleinGordonPlaneWave({ mass_kg: NaN, k_per_m: 1 }),
    ).toThrow(/mass_kg/);
    expect(() =>
      verifyKleinGordonPlaneWave({ mass_kg: M_E_KG, k_per_m: -1 }),
    ).toThrow(/k_per_m must be a finite non-negative number/);
    expect(() =>
      verifyKleinGordonPlaneWave({ mass_kg: M_E_KG, k_per_m: 1, tolerance: 0 }),
    ).toThrow(/tolerance must be a finite positive number/);
    expect(() =>
      verifyKleinGordonPlaneWave({ mass_kg: M_E_KG, k_per_m: 1, tolerance: NaN }),
    ).toThrow(/tolerance/);
    // Degenerate ω = 0: both m and k zero.
    expect(() =>
      verifyKleinGordonPlaneWave({ mass_kg: 0, k_per_m: 0 }),
    ).toThrow(/must not both be zero/);
  });
});
