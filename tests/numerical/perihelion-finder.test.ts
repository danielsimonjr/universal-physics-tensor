/**
 * Perihelion-finder tests — v0.5.0 Task 4 (Phase 1b).
 *
 * Three structural tests per Design §3 Task 1b:
 *   1. Parabolic synthetic → perihelion at τ = T/2 to ≤1e-9 × T (I1).
 *   2. M3 bracket-width warning emitted when bracket span < 2·h_snap.
 *   3. Throws when no sign-change exists in the snapshot range.
 *
 * Bug A resolution (per task brief): the original plan-template cycloid
 * `r(τ) = (r0/2)(1 + cos(πτ/T))` has its minimum at τ = T (where r → 0),
 * not at τ = T/2. We use a **parabolic** synthetic instead:
 *
 *   r(τ) = r_min + k · (τ − T/2)²
 *
 * with `dr/dτ = 2k(τ − T/2)` — linear in τ, sign-change exactly at T/2,
 * so the cubic-Hermite interpolant nails the root to machine precision.
 *
 * @module tests/numerical/perihelion-finder.test
 */
import { describe, it, expect, vi } from 'vitest';
import { findPerihelion } from '../../src/numerical/perihelion-finder.js';

describe('Perihelion finder: synthetic + structural tests', () => {
  it('finds perihelion τ of parabolic synthetic to ≤1e-9 × T (I1 precision floor)', () => {
    // Parabolic synthetic: r(τ) = r_min + k(τ − T/2)²
    //   dr/dτ = 2k(τ − T/2)         (linear, sign-change at τ = T/2)
    //
    // We encode dr/dτ in the radial momentum p_r so the algorithm's
    // dr/dτ_i = g^{rν}(x_i) p_{i,ν} extraction (with identity metric)
    // reads p_r directly. This isolates the cubic-Hermite interpolation
    // logic from any metric-pullback bugs.
    const T = 1000;
    const r_min = 1e10;
    const k = 1.0;
    const tauExpected = T / 2;
    const N = 101; // 100 intervals, h_snap = T/100 = 10
    const snapshots = Array.from({ length: N }, (_, i) => {
      const tau = (i * T) / (N - 1);
      const r = r_min + k * (tau - tauExpected) ** 2;
      const dr_dtau = 2 * k * (tau - tauExpected);
      return { tau, x: [0, r, Math.PI / 2, 0], p: [-1, dr_dtau, 0, 0] };
    });
    // Identity-like inverse metric: g^{rr} = 1 so g^{rν} p_ν = p_r.
    // v0.9.0 flat layout: Float64Array(16), flat[mu*4+nu] = g^{μν}.
    const gInverseFn = (_x: readonly number[]): Float64Array =>
      Float64Array.from([
        -1, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
      ]);

    const result = findPerihelion({
      snapshots,
      tauTolerance: 1e-9 * T, // I1: 1e-9 × T (88 µs for Mercury)
      gInverseFn,
    });

    expect(result.tau).toBeGreaterThan(0);
    expect(result.tau).toBeLessThan(T);
    // M2: quantitative precision assertion. For a parabolic dr/dτ profile
    // the cubic-Hermite interpolant is exact (overkill — degree 3 hits a
    // degree-1 polynomial root analytically), so this should be at or
    // below 1e-9 × T = 1e-6 with margin.
    expect(Math.abs(result.tau - tauExpected)).toBeLessThan(1e-9 * T);
    // The returned state's phi component is the φ coordinate (x[3]).
    expect(result.phi).toBe(0);
  });

  it('emits PerihelionBracketWidthWarning when bracket is narrower than 2·h_snap (M3)', () => {
    const warnSpy = vi
      .spyOn(process, 'emitWarning')
      .mockImplementation(() => undefined);

    // Build snapshots whose median Δτ is large (h_snap = 1.0), but place
    // the actual sign-change bracket at a very narrow span (Δτ = 0.001):
    //   snapshots: τ=0, 1, 2, 3, 3.001, 4, 5  (7 snapshots)
    // dr/dτ goes negative up through τ=3, then positive at τ=3.001.
    // Bracket span = 0.001 < 2 · h_snap (=2.0) → warning expected.
    const gInverseFn = (_x: readonly number[]): Float64Array =>
      Float64Array.from([
        -1, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
      ]);
    const tightSnapshots = [
      { tau: 0,     x: [0, 1e10 + 3, Math.PI / 2, 0], p: [-1, -3.0,  0, 0] },
      { tau: 1,     x: [0, 1e10 + 2, Math.PI / 2, 0], p: [-1, -2.0,  0, 0] },
      { tau: 2,     x: [0, 1e10 + 1, Math.PI / 2, 0], p: [-1, -1.0,  0, 0] },
      { tau: 3,     x: [0, 1e10,     Math.PI / 2, 0], p: [-1, -0.001, 0, 0] },
      { tau: 3.001, x: [0, 1e10,     Math.PI / 2, 0], p: [-1,  0.001, 0, 0] },
      { tau: 4,     x: [0, 1e10 + 1, Math.PI / 2, 0], p: [-1,  1.0,  0, 0] },
      { tau: 5,     x: [0, 1e10 + 2, Math.PI / 2, 0], p: [-1,  2.0,  0, 0] },
    ];

    expect(() =>
      findPerihelion({
        snapshots: tightSnapshots,
        tauTolerance: 1e-9,
        gInverseFn,
      }),
    ).not.toThrow();

    // M3: confirm the warning fired with the canonical name.
    const calls = warnSpy.mock.calls;
    const matched = calls.some((call) => {
      // process.emitWarning supports (warning, name?) and
      // (warning, { type, code, detail }).
      const second = call[1];
      if (typeof second === 'string') return second === 'PerihelionBracketWidthWarning';
      if (second && typeof second === 'object' && 'type' in second) {
        return (second as { type?: string }).type === 'PerihelionBracketWidthWarning';
      }
      return false;
    });
    expect(matched).toBe(true);

    warnSpy.mockRestore();
  });

  it('throws "no perihelion bracket" if no sign-change exists in the snapshot range', () => {
    const gInverseFn = (_x: readonly number[]): Float64Array =>
      Float64Array.from([
        -1, 0, 0, 0,
         0, 1, 0, 0,
         0, 0, 1, 0,
         0, 0, 0, 1,
      ]);
    const monotonicSnapshots = Array.from({ length: 10 }, (_, i) => ({
      tau: i,
      x: [0, 1e10 + i, Math.PI / 2, 0],
      // dr/dτ strictly positive — no sign-change anywhere.
      p: [-1, 1, 0, 0] as readonly number[],
    }));
    expect(() =>
      findPerihelion({
        snapshots: monotonicSnapshots,
        tauTolerance: 1e-10,
        gInverseFn,
      }),
    ).toThrow(/no perihelion bracket/i);
  });
});
