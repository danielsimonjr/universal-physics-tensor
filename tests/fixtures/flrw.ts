/**
 * FLRW (Friedmann–Lemaître–Robertson–Walker) spacetime fixture (v0.6.0 Phase 2, Task 2.7).
 *
 * Flat (k=0) FLRW in Cartesian comoving coordinates x^μ = [t, x, y, z].
 * Metric signature: mostly-plus −+++ with explicit c² on g_{tt}.
 *
 *   g_μν  = diag(−c², a(t)², a(t)², a(t)²)
 *   g^μν  = diag(−1/c², 1/a(t)², 1/a(t)², 1/a(t)²)
 *
 * **Convention consistency (E-5):** g_{tt} = −c² matches the Schwarzschild /
 * de-Sitter convention used throughout UPT (not the c=1 convention). The
 * stress-energy prefactor (ρ + p/c²) in `perfectFluidStressEnergy` already
 * encodes Carroll's SI-explicit form; no extra c factors needed.
 *
 * **Covariant-derivative structure.** Only ∂_t is nonzero for FLRW
 * (spatial homogeneity). The FD stencils in the Einstein-tensor evaluator
 * sample these via the coordinate-dependent metric closure.
 *
 * @module tests/fixtures/flrw
 */

import { C_SI } from '../../src/core/constants.js';

const c2 = C_SI * C_SI; // m² s⁻²

/**
 * Factory that returns the covariant FLRW metric closure g_{μν}(x) given a
 * scale-factor function `aFn(t)` and its time derivative `aDotFn(t)`.
 *
 * The closure ignores the spatial coordinates (x, y, z) — flat FLRW is
 * spatially homogeneous and isotropic; only `t = x[0]` matters.
 *
 *   g_{tt} = −c²          (constant)
 *   g_{ii} = a(t)²        (i = 1, 2, 3)
 *   off-diagonal = 0
 *
 * @param aFn - Scale factor a(t) > 0.
 */
export function flrwGFn(
  aFn: (t: number) => number,
): (x: ReadonlyArray<number>) => number[][] {
  return function flrwG(x: ReadonlyArray<number>): number[][] {
    const t = x[0];
    const a = aFn(t);
    const a2 = a * a;

    const g: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    g[0][0] = -c2;
    g[1][1] = a2;
    g[2][2] = a2;
    g[3][3] = a2;
    return g;
  };
}

/**
 * Factory that returns the contravariant FLRW metric closure g^{μν}(x).
 * Exact inverse of `flrwGFn`.
 *
 *   g^{tt} = −1/c²
 *   g^{ii} = 1/a(t)²   (i = 1, 2, 3)
 *
 * @param aFn - Scale factor a(t) > 0.
 */
export function flrwGInverseFn(
  aFn: (t: number) => number,
): (x: ReadonlyArray<number>) => number[][] {
  return function flrwGInverse(x: ReadonlyArray<number>): number[][] {
    const t = x[0];
    const a = aFn(t);
    const a2 = a * a;

    const gInv: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    gInv[0][0] = -1 / c2;
    gInv[1][1] = 1 / a2;
    gInv[2][2] = 1 / a2;
    gInv[3][3] = 1 / a2;
    return gInv;
  };
}

/**
 * Factory that returns the partial-derivative tensor of the contravariant
 * FLRW metric, ∂_λ g^{μν}(x). Index order: dg[lambda][mu][nu].
 *
 * For flat FLRW only time-derivatives are non-zero (spatial homogeneity):
 *
 *   ∂_t g^{tt}  = 0                     (g^{tt} = −1/c² is constant)
 *   ∂_t g^{ii}  = −2ȧ / a³             (i = 1, 2, 3)
 *
 * Derivation: g^{ii} = a⁻² ⟹ ∂_t g^{ii} = −2a⁻³ ȧ = −2ȧ/a³.
 *
 * @param aFn    - Scale factor a(t) > 0.
 * @param aDotFn - Time derivative ȧ(t) = da/dt.
 */
export function flrwDgInverseFn(
  aFn: (t: number) => number,
  aDotFn: (t: number) => number,
): (x: ReadonlyArray<number>) => number[][][] {
  return function flrwDgInverse(x: ReadonlyArray<number>): number[][][] {
    const t = x[0];
    const a = aFn(t);
    const aDot = aDotFn(t);
    const dgi_dt = (-2 * aDot) / (a * a * a); // ∂_t g^{ii}

    const dg: number[][][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    );

    // Only λ=0 (time) entries are nonzero; spatial components are constant.
    dg[0][1][1] = dgi_dt;
    dg[0][2][2] = dgi_dt;
    dg[0][3][3] = dgi_dt;

    return dg;
  };
}
