/**
 * Painlevé-Gullstrand (PG) metric for Schwarzschild spacetime —
 * regular at the event horizon.
 *
 * Per `docs/architecture/v0.7-near-horizon-kretschmann-design-note.md`
 * (v0.7 follow-up to v0.6.0's deferred "Near-horizon Kretschmann"
 * item). Schwarzschild coordinates have a coordinate singularity at
 * `r = r_s` (the event horizon); `g_rr = 1/(1−r_s/r) → ∞`. The
 * Painlevé-Gullstrand coordinate system is regular at the horizon
 * (and everywhere outside the curvature singularity at `r=0`).
 *
 * Coordinate transform (closed-form, no implicit-function solve):
 *
 *     T = t + 2√(r·r_s) + r_s·ln|(√r − √r_s)/(√r + √r_s)|
 *
 * In PG coordinates (T, r, θ, φ):
 *
 *     ds² = -(1 − r_s/r) dT² + 2√(r_s/r) dT dr + dr² + r² dΩ²
 *
 * Matrix form:
 *
 *     g_μν = [[-(1−r_s/r),  √(r_s/r),  0,       0          ],
 *             [ √(r_s/r),    1,         0,       0          ],
 *             [ 0,           0,         r²,      0          ],
 *             [ 0,           0,         0,       r² sin²θ   ]]
 *
 * Inverse (closed-form via 2x2 block inverse on the (T,r) block,
 * det = -1):
 *
 *     g^μν = [[-1,           √(r_s/r),  0,       0           ],
 *             [ √(r_s/r),    (1−r_s/r), 0,       0           ],
 *             [ 0,           0,         1/r²,    0           ],
 *             [ 0,           0,         0,       1/(r² sin²θ)]]
 *
 * Verification at the horizon:
 *
 *     r → r_s:  g_TT → 0, g_Tr → 1, g_rr → 1 (all finite)
 *               g^rr → 0, g^Tr → 1, g^TT → -1 (all finite)
 *
 * Compare to Schwarzschild where g_rr → ∞. The Kretschmann
 * scalar K = R_μνρσ R^μνρσ is computed via the existing
 * `numerical/kretschmann.ts` (coordinate-agnostic — takes raw
 * arrays) fed by Riemann assembled from these closed-form metric
 * functions via the existing FD pipeline. At r=r_s the analytic
 * value `K = 48 G²M²/(c⁴ r_s⁶) = 12/r_s⁴` (in c=G=1 units) is
 * recovered numerically without coordinate-singularity blowup.
 *
 * Reference: MTW §31.4 ("Lemaître coordinates" + the
 * Painlevé-Gullstrand variant); Carroll §5.7.
 *
 * @module numerical/painleve-gullstrand-metric
 */

import { C_SI, G_SI } from '../core/constants.js';

/**
 * Schwarzschild radius `r_s = 2 G M / c²` for a body of mass `M`.
 * Inlined here to avoid an out-of-rootDir import on the test
 * fixture's `schwarzschildRs` helper. Same formula.
 *
 * @internal
 */
function schwarzschildRs(M_kg: number): number {
  return (2 * G_SI * M_kg) / (C_SI * C_SI);
}

/**
 * Builds a Painlevé-Gullstrand metric function `g_μν(T, r, θ, φ)`
 * for a Schwarzschild black hole of mass `M_kg`.
 *
 * The returned function maps a 4-tuple coordinate point to the
 * 4×4 lower-lower metric. Closed-form; no FD; regular at r=r_s.
 *
 * @public
 */
export function painleveGullstrandGFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][] {
  const r_s = schwarzschildRs(M_kg);
  return function pgG(x: ReadonlyArray<number>): number[][] {
    const r = x[1];
    const theta = x[2];
    if (!(r > 0)) {
      throw new RangeError(`painleveGullstrandGFn: r must be > 0, got ${r}`);
    }
    const rho = r_s / r;
    const sqrtRho = Math.sqrt(rho);
    const sinTheta = Math.sin(theta);
    return [
      [-(1 - rho), sqrtRho, 0, 0],
      [sqrtRho, 1, 0, 0],
      [0, 0, r * r, 0],
      [0, 0, 0, r * r * sinTheta * sinTheta],
    ];
  };
}

/**
 * Builds a Painlevé-Gullstrand inverse-metric function `g^μν(T, r,
 * θ, φ)`. Closed-form (2×2 block inverse on the (T, r) block,
 * det = -1; angular block is trivially diagonal).
 *
 * At r=r_s, g^rr=0 (the horizon's coordinate-regularity signature
 * in PG: NO divergence). At r→∞, g^rr → 1 (asymptotic flatness).
 *
 * @public
 */
export function painleveGullstrandGInverseFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][] {
  const r_s = schwarzschildRs(M_kg);
  return function pgGInv(x: ReadonlyArray<number>): number[][] {
    const r = x[1];
    const theta = x[2];
    if (!(r > 0)) {
      throw new RangeError(`painleveGullstrandGInverseFn: r must be > 0, got ${r}`);
    }
    const rho = r_s / r;
    const sqrtRho = Math.sqrt(rho);
    const sinTheta = Math.sin(theta);
    return [
      [-1, sqrtRho, 0, 0],
      [sqrtRho, 1 - rho, 0, 0],
      [0, 0, 1 / (r * r), 0],
      [0, 0, 0, 1 / (r * r * sinTheta * sinTheta)],
    ];
  };
}
