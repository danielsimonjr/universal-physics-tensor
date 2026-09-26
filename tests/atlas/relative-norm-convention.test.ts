/**
 * The normalization convention of every RELATIVE approximation bound in the atlas
 * (persona finding W1, 2026-09-25).
 *
 * Each relative `delta` divides the gap between the exact and the reduced model by the
 * REDUCED model's value. That convention was stated nowhere, and one counterexample read
 * it the other way: `ab-kg-schrodinger` said the non-relativistic kinetic frequency is
 * "17% too high" at x = 1, where it is 20.7% above the exact value (17.2% is the gap over
 * its own value).
 *
 * Every exact and reduced value below is computed here from closed-form physics, never
 * read from the record. Each case asserts BOTH that `delta` equals the gap over the
 * reduced value AND that it differs from the gap over the exact value, so the test can
 * tell the two conventions apart and cannot pass under the other one.
 */

import { describe, expect, it } from 'vitest';
import { ATLAS_FAMILIES } from '../../src/atlas/families.js';

/** Complete elliptic integral K(k) of modulus k, by the arithmetic-geometric mean. */
function ellipticK(k: number): number {
  let a = 1;
  let b = Math.sqrt(1 - k * k);
  for (let i = 0; i < 40; i++) [a, b] = [(a + b) / 2, Math.sqrt(a * b)];
  return Math.PI / (2 * a);
}

const bridge = (id: string) => {
  for (const f of ATLAS_FAMILIES) {
    const b = f.bridges.find((x) => x.id === id);
    if (b !== undefined) return b;
  }
  throw new Error(`no atlas bridge ${id}`);
};

const SUFFIX = "normalized by the value of the reduced model";

/** [bridge id, exact value, reduced value] at the edge of each declared domain. */
const CASES: ReadonlyArray<readonly [string, number, number]> = [
  // Pendulum at θ0 = 0.5: T/T0 = 2K(sin(θ0/2))/π, reduced T/T0 = 1.
  ['ab-pendulum-linear', (2 * ellipticK(Math.sin(0.25))) / Math.PI, 1],
  // Telegraph → Fick at ε = τDq² = 0.05, τ = 1: slow rate (1 − √(1 − 4ε))/2 against Dq² = ε.
  ['ab-telegraph-diffusion', (1 - Math.sqrt(1 - 4 * 0.05)) / 2, 0.05],
  // Telegraph → wave at ε = 25, τ = 1: frequency √(4ε − 1)/2 against √ε.
  ['ab-telegraph-wave', Math.sqrt(4 * 25 - 1) / 2, Math.sqrt(25)],
  // Klein–Gordon → wave at ω₀/(ck) = 0.1: phase velocity c√(1 + r²) against c (c = 1).
  ['ab-klein-gordon-wave', Math.sqrt(1 + 0.1 ** 2), 1],
  // Klein–Gordon → Schrödinger at x = 0.1: ω₀(√(1 + x²) − 1) against ω₀x²/2 (ω₀ = 1).
  ['ab-kg-schrodinger', Math.sqrt(1 + 0.1 ** 2) - 1, 0.1 ** 2 / 2],
  // Stiff → flexible string at β = 0.01: phase velocity √(1 + β) against 1.
  ['ab-stiff-string', Math.sqrt(1 + 0.01), 1],
];

describe('every relative approximation bound is normalized by the reduced model (W1)', () => {
  for (const [id, exact, reduced] of CASES) {
    it(`${id}: delta = |exact − reduced| / reduced, and the norm says so`, () => {
      const b = bridge(id);
      const gap = Math.abs(exact - reduced);
      expect(b.bound?.delta).toBeCloseTo(gap / reduced, 12);
      // The other convention differs by more than the tolerance, so this case discriminates.
      expect(Math.abs(gap / reduced - gap / exact)).toBeGreaterThan(1e-6);
      expect(b.bound?.norm).toContain(SUFFIX);
    });
  }
});

describe('the ab-kg-schrodinger counterexample states the excess over the EXACT value (W1)', () => {
  it('at x = 1 the reduced ω₀/2 is 20.7% above the exact ω₀(√2 − 1), and 17.2% of its own value', () => {
    const exact = Math.SQRT2 - 1;
    const reduced = 0.5;
    expect(((reduced - exact) / exact) * 100).toBeCloseTo(20.71, 2);
    expect(((reduced - exact) / reduced) * 100).toBeCloseTo(17.16, 2);
    const text = bridge('ab-kg-schrodinger').counterexamples.map((c) => c.description).join(' ');
    expect(text).toContain('20.7% above the exact');
    expect(text).not.toMatch(/17% too high/);
  });
});
