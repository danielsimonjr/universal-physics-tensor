/**
 * Geometrized (G = c = 1) Schwarzschild fixture — G-9 increment 2.
 *
 * The x⁰ = ct chart (the standard NR choice): all g_μν components are
 * DIMENSIONLESS, and the mass enters as a LENGTH `M_geom = G·M_kg/c²` metres
 * (obtain it from an SI mass via `toGeometrized(M_kg, MASS)`). The metric is
 *
 *   g_tt = −(1 − 2M/r),  g_rr = (1 − 2M/r)⁻¹,  g_θθ = r²,  g_φφ = r² sin²θ
 *   r_s = 2M,   f = 1 − r_s/r
 *
 * This is a DIFFERENT coordinate chart from the SI fixture
 * (`tests/fixtures/schwarzschild.ts`), which uses x⁰ = t with an explicit c² in
 * `g_tt = −f·c²` — NOT a unit-rescale of the same chart. The Kretschmann scalar
 * `K = 48 M²/r⁶` is invariant under the constant single-axis x⁰-rescale, so both
 * fixtures yield the same numerical `K` at matched (r, θ). Only `gFn` +
 * `gInverseFn` are provided — the Kretschmann path
 * (christoffelAt → riemannLowerAt → computeKretschmann) consumes exactly those.
 *
 * `tests/fixtures/` is not shipped; this is test-support code.
 *
 * @module tests/fixtures/schwarzschild-geometrized
 */

/** Geometrized Schwarzschild radius r_s = 2M (M, r, r_s all in metres). */
export function schwarzschildGeometrizedRs(M_geom: number): number {
  return 2 * M_geom;
}

interface GeoContext {
  r: number;
  sinT2: number;
  f: number;
}

function makeContext(M_geom: number, x: ReadonlyArray<number>): GeoContext {
  const r = x[1];
  const theta = x[2];
  const sinT = Math.sin(theta);
  const f = 1 - schwarzschildGeometrizedRs(M_geom) / r;
  return { r, sinT2: sinT * sinT, f };
}

/**
 * Covariant geometrized Schwarzschild metric closure g_{μν}(x) for mass M_geom
 * (metres), in the x⁰ = ct chart. All components dimensionless.
 */
export function schwarzschildGeometrizedGFn(
  M_geom: number,
): (x: ReadonlyArray<number>) => number[][] {
  return function schwarzschildGeometrizedG(x: ReadonlyArray<number>): number[][] {
    const { r, sinT2, f } = makeContext(M_geom, x);
    const g: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    g[0][0] = -f; // x⁰ = ct: no c² (cf. SI fixture's −f·c²)
    g[1][1] = 1 / f;
    g[2][2] = r * r;
    g[3][3] = r * r * sinT2;
    return g;
  };
}

/**
 * Contravariant geometrized metric g^{μν}(x), row-major `Float64Array(16)`
 * (flat[μ*4 + ν]) — the layout `computeKretschmann` accepts directly. Mutually
 * consistent with `schwarzschildGeometrizedGFn` (g_{μν} g^{μν} = 4).
 */
export function schwarzschildGeometrizedGInverseFn(
  M_geom: number,
): (x: ReadonlyArray<number>) => Float64Array {
  return function schwarzschildGeometrizedGInverse(x: ReadonlyArray<number>): Float64Array {
    const { r, sinT2, f } = makeContext(M_geom, x);
    const gInv = new Float64Array(16);
    gInv[0 * 4 + 0] = -1 / f;
    gInv[1 * 4 + 1] = f;
    gInv[2 * 4 + 2] = 1 / (r * r);
    gInv[3 * 4 + 3] = 1 / (r * r * sinT2);
    return gInv;
  };
}

/**
 * Closed-form geometrized Kretschmann scalar K = 48 M²/r⁶ (M, r in metres;
 * K in m⁻⁴). The c=G=1 specialization of the SI form K = 48 G²M²/(c⁴r⁶) under
 * M_geom = GM/c².
 */
export function schwarzschildGeometrizedKretschmann(M_geom: number, r: number): number {
  return (48 * M_geom * M_geom) / Math.pow(r, 6);
}
