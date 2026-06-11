/**
 * v0.8.0 Phase 3 — GW170817 → BE-36 real-data confrontation (T5/G-3).
 *
 * Acceptance per design r2-2: tests pin the EXACTLY-recomputed bounds
 * (+6.502e-16 / −3.0865e-15 at relErr ≤ 1e-3) and assert the published
 * values (+7e-16 / −3e-15, Abbott et al. 2017 ApJL 848:L13) are their
 * 1-significant-figure roundings. No direct percent comparison against
 * the 1-sig-fig published values (Adam A-2).
 */
import { describe, it, expect } from 'vitest';
import {
  confrontBE36,
  GW170817,
} from '../../src/bridges/be36-gw170817-confrontation.js';
import { GW170817_SPEED_BOUND } from '../../src/bridges/equations/be-36-gw-speed-bound.js';

const relErr = (actual: number, expected: number): number =>
  Math.abs(actual - expected) / Math.abs(expected);

/** Round to 1 significant figure (sign-preserving). */
const round1sf = (x: number): number => {
  const exp = Math.floor(Math.log10(Math.abs(x)));
  const mantissa = Math.round(Math.abs(x) / 10 ** exp);
  return Math.sign(x) * mantissa * 10 ** exp;
};

describe('confrontBE36 — GW170817 speed-of-gravity bounds (real data)', () => {
  const result = confrontBE36();

  it('recomputes the upper bound +c·Δt/D = 6.502e-16 (relErr ≤ 1e-3)', () => {
    expect(relErr(result.upperBound, 6.502e-16)).toBeLessThanOrEqual(1e-3);
  });

  it('recomputes the lower bound −c·(10−1.74)/D = −3.0865e-15 (relErr ≤ 1e-3)', () => {
    expect(relErr(result.lowerBound, -3.0865e-15)).toBeLessThanOrEqual(1e-3);
  });

  it('published 1-sig-fig values are the roundings of the recomputed bounds', () => {
    expect(round1sf(result.upperBound)).toBeCloseTo(7e-16, 17);
    expect(round1sf(result.lowerBound)).toBeCloseTo(-3e-15, 16);
  });

  it('uses the conservative 26 Mpc lower distance, not the 40 Mpc central value', () => {
    expect(result.distance_m).toBeCloseTo(26 * 3.0857e22, -20);
    expect(GW170817.distance_central_mpc).toBe(40);
  });

  it('positive side satisfies the encoded |ratio| ≤ 1e-15; negative side honestly does not', () => {
    expect(result.passesEncodedBound).toBe(true);
    expect(result.upperBound).toBeLessThanOrEqual(GW170817_SPEED_BOUND);
    // The asymmetric published bound's negative side exceeds the
    // symmetric encoding — recorded, not hidden.
    expect(Math.abs(result.lowerBound)).toBeGreaterThan(GW170817_SPEED_BOUND);
    expect(result.encodedBoundIsSymmetric).toBe(true);
  });

  it('rejects malformed observations', () => {
    expect(() => confrontBE36({ ...GW170817, dt_obs_s: -1 })).toThrow(RangeError);
    expect(() => confrontBE36({ ...GW170817, distance_lower_mpc: 0 })).toThrow(
      RangeError,
    );
    expect(() =>
      confrontBE36({ ...GW170817, emission_delay_max_s: 1 }),
    ).toThrow(RangeError);
  });
});
