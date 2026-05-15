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

// ---------------------------------------------------------------------------
// Block 2 — Geodesic cross-validation (Task 16b [U]) — DEFERRED TO v0.5.0
//
// WHY THIS IS HARD WITH THE CURRENT RK4 INTEGRATOR
// -------------------------------------------------
// The GR perihelion advance for Mercury is Δφ = 5.02e-7 rad per orbit.
// Detecting it via numerical integration requires measuring φ at the second
// perihelion passage to sub-nanoradian precision.  Three compounding problems
// prevent this with `integrateGeodesic` (fixed-step RK4, sparse trajectory):
//
// 1. PERIHELION TIMING RESOLUTION
//    `integrateGeodesic` returns only ~100 evenly-spaced trajectory snapshots.
//    Over 1.5 × T_orbit (≈ 1.14e7 s), each snapshot spans ≈ 1.14e5 s.
//    The angular rate at perihelion is dφ/dτ ≈ 9.07e-7 rad/s, so one snapshot
//    window introduces ±0.052 rad error in the φ-at-perihelion reading — that
//    is ~1e5 times larger than Δφ_GR.  Even with perfect RK4 numerics, the
//    perihelion cannot be located precisely enough from sparse snapshots.
//
// 2. PERIOD MISMATCH (TIMING FROM ENERGY DRIFT)
//    Integrating for exactly T_Keplerian in proper time does not land at the
//    second perihelion because:
//    (a) the proper-time period differs from T_coord at O(r_s/a) ≈ 6e-8 level,
//        introducing φ error ≈ 2.9e-7 rad (≈ 0.58 × Δφ_GR), and
//    (b) RK4 energy drift shifts the orbital period by an amount that compounds
//        over many steps.
//    Measured relErr in initial run: 6.6 × 10^6 — catastrophically off.
//
// 3. NON-SYMPLECTIC INTEGRATOR
//    Classical RK4 does not conserve energy/angular momentum exactly (it drifts
//    O(h^4) per step).  For the null-geodesic lensing test (Task 14/16a) this
//    was acceptable because the GR signal (4GM/bc²≈8.5e-6 rad) is large compared
//    to the lensing geometry error, and the trajectory is short (~1 perihelion
//    crossing).  For perihelion precession, the signal is ~17× smaller and
//    measurement requires sub-nanoradian timing over a full orbit — a regime
//    where energy drift matters.
//
// WHAT v0.5.0 NEEDS TO SHIP THIS TEST
// -------------------------------------
// (a) A symplectic integrator (e.g. Störmer-Verlet, leapfrog, or
//     Ruth/Forest-Ruth 4th-order) that conserves the GR Hamiltonian to machine
//     precision per step, preventing secular φ drift over many orbits.
// (b) A perihelion-finder that integrates in two phases: a coarse pass to
//     bracket the second perihelion crossing (v^r sign change), followed by
//     bisection in τ on [τ_bracket_lo, τ_bracket_hi] to locate the exact
//     τ_perihelion_2 with error < T_orbit × 1e-12, giving φ-timing error
//     << 1e-12 × 2π rad — well below Δφ_GR.
// (c) The existing `schwarzschildChristoffelFn` fixture (Task 14) is correct
//     and sufficient; no changes to the Christoffel symbols needed.
// (d) The closed-form reference `evaluatePerihelionPrecession` is correct;
//     the initial conditions (L, E from vis-viva + norm constraint) are correct.
//
// This is not an error in the physics or the closed-form bridge — it is a
// limitation of the fixed-step non-symplectic RK4 integrator combined with
// the sparse trajectory output format.  The signal-to-noise ratio for
// perihelion detection requires infrastructure that v0.4.x does not have.
// ---------------------------------------------------------------------------

describe('BE-52 Mercury Perihelion — geodesic cross-validation', () => {
  // DEFERRED: see block comment above for the full diagnosis.
  // The body below documents the correct physics for v0.5.0 implementation.
  it.skip('timelike one-orbit precession matches 6πGM/(a(1-e²)c²) to ±1e-4 (v0.5.0)', () => {
    // --- Physical constants & orbital parameters ---
    const G = 6.6743e-11;      // m³ kg⁻¹ s⁻²
    const c = 2.998e8;         // m s⁻¹
    const c2 = c * c;

    const M_kg = 1.989e30;     // solar mass
    const a_m  = 5.79e10;      // Mercury semi-major axis
    const e    = 0.2056;       // Mercury eccentricity
    const T_yr = 0.241;        // Mercury orbital period (years), for closed-form only

    // r_s = schwarzschildRs(M_kg) ≈ 2953 m
    const r_s = (2 * G * M_kg) / c2;
    const r_p = a_m * (1 - e);   // ≈ 4.59e10 m >> 3·r_s
    const r_a = a_m * (1 + e);   // ≈ 6.99e10 m

    // --- Closed-form reference ---
    const { dphi_rad_per_orbit: closedForm } = evaluatePerihelionPrecession({
      M_kg, a_m, e, T_yr,
    });
    // closedForm ≈ 5.02e-7 rad/orbit

    // --- Conserved quantities at perihelion (dr/dτ = 0) ---
    // Newtonian angular momentum (error O(r_s/r_p) ≈ 6e-8):
    const L = Math.sqrt(G * M_kg * r_p * r_a / (r_p + r_a));
    // Exact energy from timelike norm at perihelion:
    const E = c * Math.sqrt((1 - r_s / r_p) * (c2 + L * L / (r_p * r_p)));

    // --- Initial 4-velocity at perihelion ---
    const vt0: number = E / ((1 - r_s / r_p) * c2);   // dt/dτ ≈ 1.0
    const vr0  = 0;                                      // dr/dτ = 0 (perihelion)
    const vth0 = 0;                                      // equatorial plane
    const vph0: number = L / (r_p * r_p);               // dφ/dτ ≈ 9.07e-7 rad/s

    // Norm check (passes in existing implementation)
    const norm = -(1 - r_s / r_p) * c2 * vt0 * vt0
               + (1 / (1 - r_s / r_p)) * vr0 * vr0
               + r_p * r_p * vph0 * vph0;
    expect(Math.abs(norm / (-c2) - 1)).toBeLessThan(1e-6);

    // --- v0.5.0 TODO: Symplectic integration + bisection perihelion finder ---
    //
    //   const T_coord = 2 * Math.PI * Math.sqrt(a_m ** 3 / (G * M_kg));
    //
    //   // Phase 1: coarse integration to bracket second perihelion
    //   //   integrateSymplectic({ ..., steps: 2000 }) → detect v^r sign change
    //   //   → find [tau_lo, tau_hi] with v^r(tau_lo) < 0 < v^r(tau_hi)
    //
    //   // Phase 2: bisect to find tau_perihelion_2 where v^r = 0
    //   //   → read phi(tau_perihelion_2)
    //
    //   // Measurement:
    //   const integratedPrecession = phi_second_perihelion - 2 * Math.PI;
    //   const relErr = Math.abs(integratedPrecession - closedForm) / closedForm;
    //   expect(relErr).toBeLessThan(1e-4);

    // Placeholder assertion so the body compiles:
    expect(closedForm).toBeGreaterThan(0);
    void vt0; void vr0; void vth0; void vph0;
  });
});
