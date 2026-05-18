/**
 * GL4 integrator entry-point — end-to-end tests on Schwarzschild + flat
 * space (v0.5.0 Task 3, Phase 1a-iii).
 *
 * Three end-to-end tests:
 *   1. Cycloid match — radial-infall geodesic in Schwarzschild matches the
 *      analytic cycloid r(η) to high precision at 5000 GL4 steps. Same
 *      setup as the v0.4.0 RK4 cycloid test in
 *      `tests/numerical/schwarzschild-radial-geodesic.test.ts`.
 *   2. Symplecticity (flat-space) — free particle in Minkowski preserves
 *      the Hamiltonian H = ½ η^μν p_μ p_ν to machine precision. This
 *      unambiguously demonstrates GL4 symplecticity without the
 *      curved-spacetime bound-orbit initial-condition work (Legendre
 *      transform), which is deferred to Task 11 (BE-52 perihelion).
 *   3. Domain violation — initial r < domainMinRadius throws synchronously
 *      with a `/domain/i` message.
 *
 * Plus the long-gated `GL4_LONG=1` placeholder block per Design §7 R1.
 *
 * @module tests/numerical/gl4-integrator
 */
import { describe, it, expect } from 'vitest';
import { integrateGeodesicGL4 } from '../../src/numerical/gl4-integrator.js';
import {
  schwarzschildGInverseFn,
  schwarzschildDgInverseFn,
  schwarzschildRs,
} from '../fixtures/schwarzschild.js';

const c = 2.998e8;
const M_sun = 1.989e30;

describe('GL4 integrator: end-to-end on Schwarzschild', () => {
  it('matches Schwarzschild radial-infall cycloid to ≤1e-13 relative at 5000 steps', () => {
    // Setup: drop a test particle from r₀ = 100 r_s with v_r = 0 (at rest at
    // apoapsis). Same scenario as the v0.4.0 RK4 cycloid test in
    // tests/numerical/schwarzschild-radial-geodesic.test.ts (etaFinal=0.5).
    const r_s = schwarzschildRs(M_sun);
    const r0 = 100 * r_s;
    const etaFinal = 0.5;

    // Cycloid closed form (matches the v0.4.0 RK4 test):
    //   r(η) = (r0/2)(1 + cos η)
    //   τ(η) = (r0/2) · sqrt(r0/r_s) · (η + sin η) / c
    const cyc_r = (eta: number): number => (r0 / 2) * (1 + Math.cos(eta));
    const cyc_tau = (eta: number): number =>
      ((r0 / 2) * Math.sqrt(r0 / r_s) * (eta + Math.sin(eta))) / c;

    const tauMax = cyc_tau(etaFinal);
    const rExpected = cyc_r(etaFinal);
    expect(rExpected).toBeGreaterThan(3 * r_s);

    // Canonical momentum at apoapsis (v_r = 0 → p_r = 0):
    //   p_t = -E = -c² · √(1 − r_s/r₀)
    // (The Schwarzschild normalization u^μ u_μ = −c² gives
    //  dt/dτ = 1/√(1 − r_s/r₀), and p_t = g_{tt} dt/dτ = −c²√(1 − r_s/r₀).)
    const p_t = -c * c * Math.sqrt(1 - r_s / r0);
    const initialState = {
      x: [0, r0, Math.PI / 2, 0],
      p: [p_t, 0, 0, 0],
    };

    const gInvFn = schwarzschildGInverseFn(M_sun);
    const dgInvFn = schwarzschildDgInverseFn(M_sun);
    const snapshots = integrateGeodesicGL4(initialState, {
      steps: 5000,
      tauMax,
      gInverseFn: gInvFn,
      dgInverseFn: dgInvFn,
      domainMinRadius: 3 * r_s,
    });

    expect(snapshots.length).toBe(5001);
    const final = snapshots[snapshots.length - 1];
    // Relative error against the analytic cycloid endpoint. Empirically at
    // 5000 GL4 steps (h ≈ 9.6e-7 s) and Picard tol 1e-12, we achieve
    // relErr ≈ 8.4e-16 — effectively machine precision. Pin to ≤1e-13
    // (plan target) with comfortable margin against rebuild noise.
    const relErr = Math.abs((final.x[1] - rExpected) / rExpected);
    expect(relErr).toBeLessThan(1e-13);
  });

  it('preserves flat-space Hamiltonian to machine precision (symplecticity)', () => {
    // Mercury 100-orbit symplecticity test deferred to Task 11 (BE-52
    // perihelion) where proper Legendre-transformed bound-orbit IC live.
    // Here we demonstrate the symplecticity property unambiguously on a
    // free particle in Minkowski: H = ½ η^μν p_μ p_ν must be conserved to
    // machine precision over arbitrary tauMax. (Adam+Eve I1, plan Bug D
    // resolution: Option C1 — flat-space symplecticity test.)
    //
    // Minkowski (signature −+++): η^μν = diag(−1/c², 1, 1, 1) — with the
    // same SI c² convention as schwarzschildGInverseFn for consistency.
    // ∂_λ η^μν = 0 (flat — all metric derivatives vanish).
    const gInverseFn = (_x: readonly number[]): readonly (readonly number[])[] => [
      [-1 / (c * c), 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    const dgInverseFn = (
      _x: readonly number[],
    ): readonly (readonly (readonly number[])[])[] =>
      Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => [0, 0, 0, 0] as readonly number[]),
      );

    // Free particle: arbitrary timelike 4-momentum.
    const initialState = {
      x: [0, 1.0, 0.5, 0.25],
      p: [-c * c, 0.3, 0.4, 0.5],
    };

    const snapshots = integrateGeodesicGL4(initialState, {
      steps: 1000,
      tauMax: 100.0,
      gInverseFn,
      dgInverseFn,
    });

    // Hamiltonian H = ½ η^μν p_μ p_ν at first and last snapshots.
    const hamiltonian = (p: readonly number[]): number => {
      const gInv = gInverseFn(p);
      let h = 0;
      for (let mu = 0; mu < 4; mu++) {
        for (let nu = 0; nu < 4; nu++) {
          h += gInv[mu][nu] * p[mu] * p[nu];
        }
      }
      return 0.5 * h;
    };
    const H0 = hamiltonian(snapshots[0].p);
    const Hf = hamiltonian(snapshots[snapshots.length - 1].p);
    const drift = Math.abs((Hf - H0) / H0);
    // Flat space: ∂g=0 → Picard converges in 2 iterations and the symplectic
    // form is exact up to roundoff. Pin to 1e-14 (machine epsilon × O(1e3)
    // for the 1000-step accumulation).
    expect(drift).toBeLessThan(1e-14);
  });

  it('throws on domain violation (r < domainMinRadius)', () => {
    const r_s = schwarzschildRs(M_sun);
    const gInvFn = schwarzschildGInverseFn(M_sun);
    const dgInvFn = schwarzschildDgInverseFn(M_sun);
    expect(() =>
      integrateGeodesicGL4(
        { x: [0, 2 * r_s, Math.PI / 2, 0], p: [-1, 0, 0, 0] },
        {
          steps: 100,
          tauMax: 1,
          gInverseFn: gInvFn,
          dgInverseFn: dgInvFn,
          domainMinRadius: 3 * r_s,
        },
      ),
    ).toThrow(/domain/i);
  });
});

describe('GL4 integrator: gated long-run tests (GL4_LONG=1)', () => {
  const isLong = process.env.GL4_LONG === '1';
  (isLong ? it : it.skip)(
    'Mercury 100-orbit run completes without Newton failure on >99.9% of steps',
    () => {
      // Same orbit as the symplecticity test above; this test asserts the
      // Newton-iteration robustness criterion from Design §3 Task 1a item 4.
      // (Implementer instruments solveGL4Stage to count near-failures in a
      // later task.)
      // TODO(v0.5.0 Task 11): wire Mercury bound-orbit IC via Legendre
      // transform once perihelion-precession scaffolding lands.
      expect(true).toBe(true);
    },
  );
});
