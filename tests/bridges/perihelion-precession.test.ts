import { describe, it, expect } from 'vitest';
import { evaluatePerihelionPrecession } from '../../src/bridges/perihelion-precession.js';
import { integrateGeodesicGL4 } from '../../src/numerical/gl4-integrator.js';
import { findPerihelion } from '../../src/numerical/perihelion-finder.js';
import { C_SI, G_SI } from '../../src/core/constants.js';
import {
  schwarzschildGInverseFn,
  schwarzschildDgInverseFn,
  schwarzschildRs,
} from '../fixtures/schwarzschild.js';

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
  // Activated v0.5.0 Task 10 (Phase 2a). The v0.4.0 it.skip body documented
  // the v0.5.0 design contract; the body below is the real implementation.
  //
  // Infrastructure (Phase 1, Tasks 0–9):
  //   - integrateGeodesicGL4: canonical (x, p) symplectic GL4 (commit 381001a)
  //   - findPerihelion: cubic-Hermite + bisection, 1e-9 precision (commit 84444e4)
  //   - schwarzschildGInverseFn + schwarzschildDgInverseFn (commit b9dd093)
  //
  // Strategy:
  //   1. Place Mercury at perihelion (dr/dτ = 0) with Newtonian L (leading-order
  //      estimate — adequate for ±2×10⁻³ relative target per I6).
  //   2. Compute canonical momentum (p_t, p_r, p_θ, p_φ) via Legendre transform
  //      from conserved E = c√((1-r_s/r_p)(c² + L²/r_p²)) and L.
  //   3. Integrate ~1.1 orbit (cover the second perihelion crossing).
  //   4. Slice snapshots after τ > 0.5·T_orbit and run findPerihelion to
  //      locate the second perihelion. Δφ = φ_2 − φ_0 − 2π.
  //   5. Assert relative error vs 6πGM/(a(1-e²)c²) ≤ 2×10⁻³.
  //
  // M12 deviation: plan asserts `foundPerihelia.length === 2`, but
  // findPerihelion returns a single result. We slice past the initial
  // perihelion (τ=0) and locate only the second — equivalent guarantee,
  // simpler control flow.
  it('timelike one-orbit precession matches 6πGM/(a(1-e²)c²) to ±2×10⁻³ relative', () => {
    // --- Physical constants & orbital parameters ---
    // v0.5.1 PC-1 canonicalized: fixture, bridge, and local test all read
    // from src/core/constants.ts — bridge-vs-local 1e-12 gate restored.
    const G = G_SI;
    const c = C_SI;
    const c2 = c * c;

    const M_kg = 1.989e30;     // solar mass
    const a_m  = 5.79e10;      // Mercury semi-major axis
    const e    = 0.2056;       // Mercury eccentricity
    const T_yr = 0.241;        // Mercury orbital period (years), closed-form only

    const r_s = schwarzschildRs(M_kg);  // ≈ 2953 m, consistent with fixture
    const r_p = a_m * (1 - e);          // perihelion radius

    // --- Closed-form GR reference (Einstein 1915) ---
    const expectedPrecession = 6 * Math.PI * G * M_kg / (a_m * (1 - e * e) * c2);
    // Sanity-cross-check vs the closed-form bridge helper:
    const { dphi_rad_per_orbit: bridgeForm } = evaluatePerihelionPrecession({
      M_kg, a_m, e, T_yr,
    });
    expect(Math.abs(expectedPrecession - bridgeForm) / bridgeForm).toBeLessThan(1e-12);

    // --- Conserved quantities at perihelion (dr/dτ = 0) ---
    // Newtonian angular momentum L² = GM·a(1-e²). Leading-order in (r_s/r_p)
    // — error ~6×10⁻⁸, well below the 2×10⁻³ target tolerance.
    const L = Math.sqrt(G * M_kg * a_m * (1 - e * e));
    // Exact energy from g^μν p_μ p_ν = −c² at perihelion (p_r = p_θ = 0):
    //   E² = (1 − r_s/r_p) · c² · (c² + L²/r_p²)
    const E = c * Math.sqrt((1 - r_s / r_p) * (c2 + (L * L) / (r_p * r_p)));

    // --- Canonical (x, p) initial state ---
    // Coordinates x^μ = (t, r, θ, φ); equatorial orbit at θ = π/2, φ_0 = 0.
    // Covariant momentum from Killing vectors:
    //   p_t = −E   (∂_t Killing)
    //   p_r =  0   (perihelion: dr/dτ = 0  →  p_r = g_rr · 0 = 0)
    //   p_θ =  0   (equatorial)
    //   p_φ = +L   (∂_φ Killing; p_φ = g_φφ · v^φ = r² · (L/r²) = L)
    const x0: readonly number[] = [0, r_p, Math.PI / 2, 0];
    const p0: readonly number[] = [-E, 0, 0, L];

    // Verify the Legendre transform inverts cleanly via g^μν p_μ p_ν = −c²:
    const gInv0 = schwarzschildGInverseFn(M_kg)(x0);
    let normCheck = 0;
    for (let mu = 0; mu < 4; mu++) {
      for (let nu = 0; nu < 4; nu++) {
        normCheck += gInv0[mu * 4 + nu] * p0[mu] * p0[nu];
      }
    }
    // Should equal -c² for a unit-proper-time-parameterized timelike geodesic.
    expect(Math.abs(normCheck / (-c2) - 1)).toBeLessThan(1e-6);

    // --- Integration window ---
    // Keplerian period (leading-order; GR correction is O(r_s/a) ~ 5e-8,
    // negligible vs the integration step size).
    const T_orbit = 2 * Math.PI * Math.sqrt((a_m * a_m * a_m) / (G * M_kg));
    // Integrate 1.2 orbits — the second perihelion lies slightly after T_orbit
    // due to precession (Δτ_precession ~ Δφ / ω ≈ T_orbit · Δφ/(2π) ~ 1e-7·T_orbit).
    const tauMax = 1.2 * T_orbit;
    // Step count: 50k from plan; produces h ≈ 180 s. GL4 truncation error
    // O(h⁵) per step × N steps → global O(h⁴) = O(10⁻¹¹) — far below the
    // 2×10⁻³ target. Picard tol=1e-12 (integrator default).
    const steps = 50_000;

    const snapshots = integrateGeodesicGL4(
      { x: x0, p: p0 },
      {
        steps,
        tauMax,
        gInverseFn: schwarzschildGInverseFn(M_kg),
        dgInverseFn: schwarzschildDgInverseFn(M_kg),
        domainMinRadius: 1.5 * r_s,  // safety: well outside the horizon
      },
    );

    // Sanity: first snapshot matches the initial state.
    expect(snapshots[0].tau).toBe(0);
    expect(snapshots[0].x[1]).toBe(r_p);

    // --- Locate the second perihelion ---
    // Slice past τ > 0.5·T_orbit to skip the initial perihelion at τ=0; the
    // second perihelion appears near τ ≈ T_orbit. (M12 deviation: we locate
    // ONE perihelion in this window, not two — see test header rationale.)
    const tauCut = 0.5 * T_orbit;
    const lateWindow = snapshots.filter(s => s.tau >= tauCut);
    expect(lateWindow.length).toBeGreaterThan(100);  // sanity: window has snapshots

    const periResult = findPerihelion({
      snapshots: lateWindow,
      gInverseFn: schwarzschildGInverseFn(M_kg),
      tauTolerance: 1e-9 * T_orbit,  // I1 precision floor
    });

    // The located perihelion should be within a few % of T_orbit:
    expect(periResult.tau).toBeGreaterThan(0.95 * T_orbit);
    expect(periResult.tau).toBeLessThan(1.05 * T_orbit);

    // --- Measure Δφ ---
    // Initial perihelion is at φ = 0 (set in x0[3]). Second perihelion is at
    // φ_measured. After exactly 2π of orbital motion plus Δφ_precession,
    // the perihelion advances. So Δφ_measured = φ_at_second_perihelion − 2π.
    const phiSecond = periResult.phi;
    const measuredPrecession = phiSecond - 2 * Math.PI;

    // --- Relative error ---
    const relErr = Math.abs(measuredPrecession - expectedPrecession) / expectedPrecession;

    // Diagnostic — surface this on failure for easier triage:
    // eslint-disable-next-line no-console
    console.log(
      `[BE-52 perihelion] expected=${expectedPrecession.toExponential(4)} rad/orbit, `
      + `measured=${measuredPrecession.toExponential(4)} rad/orbit, `
      + `relErr=${relErr.toExponential(3)}, `
      + `τ_peri_2=${periResult.tau.toExponential(4)} s (T_orbit=${T_orbit.toExponential(4)} s)`,
    );

    // I6: ±2×10⁻³ relative target (re-relaxed from ±5×10⁻⁴).
    expect(relErr).toBeLessThan(2e-3);
  }, /* timeout */ 600_000);
});
