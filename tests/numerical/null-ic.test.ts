/**
 * Null initial-condition reconstruction (`reconstructNullPr`): solve
 * g^μν p_μ p_ν = 0 for the inward radial momentum p_r, given p_t and p_φ in the
 * equatorial plane. Covers the happy path (real root, inward sign) and the
 * error path (impact parameter too large → no real solution).
 */
import { describe, it, expect } from 'vitest';
import { reconstructNullPr } from '../../src/numerical/null-ic.js';

// Flat row-major g^{μν} = gInv[μ*4 + ν]; only the diagonal g^tt(0), g^rr(5),
// g^φφ(15) are read. A simple −,+,+,+ inverse: g^tt=−1, g^rr=1, g^φφ=1.
function diagInverse(gtt: number, grr: number, gphph: number): Float64Array {
  const g = new Float64Array(16);
  g[0] = gtt; // [0][0]
  g[5] = grr; // [1][1]
  g[15] = gphph; // [3][3]
  return g;
}

describe('reconstructNullPr', () => {
  it('returns the inward (negative) root satisfying the null condition', () => {
    const gInv = diagInverse(-1, 1, 1);
    // numerator = −(−1)·p_t² − (1)·p_φ² = 4 − 1 = 3 ; p_r = −√(3/1)
    const p_r = reconstructNullPr(gInv, 2, 1);
    expect(p_r).toBeCloseTo(-Math.sqrt(3), 12);
    expect(p_r).toBeLessThan(0); // inward
  });

  it('satisfies g^tt p_t² + g^rr p_r² + g^φφ p_φ² = 0 at the returned p_r', () => {
    const gInv = diagInverse(-1, 1, 1);
    const p_t = 3;
    const p_phi = 1.5;
    const p_r = reconstructNullPr(gInv, p_t, p_phi);
    const H = gInv[0] * p_t * p_t + gInv[5] * p_r * p_r + gInv[15] * p_phi * p_phi;
    expect(H).toBeCloseTo(0, 10);
  });

  it('scales p_r by g^rr correctly', () => {
    // g^rr = 4 → p_r = −√(numerator/4); numerator = 4 − 1 = 3 → −√0.75
    const gInv = diagInverse(-1, 4, 1);
    expect(reconstructNullPr(gInv, 2, 1)).toBeCloseTo(-Math.sqrt(3 / 4), 12);
  });

  it('throws RangeError when the impact parameter is too large (no real p_r)', () => {
    const gInv = diagInverse(-1, 1, 1);
    // numerator = −(−1)·1 − 1·4 = 1 − 4 = −3 < 0
    expect(() => reconstructNullPr(gInv, 1, 2)).toThrow(RangeError);
    expect(() => reconstructNullPr(gInv, 1, 2)).toThrow(/no real p_r|impact parameter/i);
  });
});
