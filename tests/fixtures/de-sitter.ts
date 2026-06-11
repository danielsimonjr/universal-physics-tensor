/**
 * de Sitter spacetime closed-form fixture for v0.5.0 Task 7 (`ricci()`).
 *
 * Coordinates: x^μ = [t, r, θ, φ]  (μ = 0,1,2,3)
 * Metric signature: mostly-plus −+++ (Carroll convention — mirrors
 * `tests/fixtures/schwarzschild.ts`, including the c² factor on g_{tt}).
 *
 * Static de Sitter in spherical "static patch" coordinates with cosmological
 * constant Λ:
 *
 *   f(r)    = 1 − Λ r² / 3
 *   g_{tt}  = −f(r) c²
 *   g_{rr}  =  1 / f(r)
 *   g_{θθ}  =  r²
 *   g_{φφ}  =  r² sin²θ
 *   off-diagonals = 0
 *
 * The inverse is diagonal by symmetry of g.
 *
 * **Constant-curvature Riemann (maximally symmetric space).** For any
 * maximally symmetric n-manifold of constant curvature K = Λ/(n−1) — here
 * n = 4, K = Λ/3 — the Riemann tensor has the closed form
 *
 *   R^ρ_{σμν} = K (δ^ρ_μ g_{σν} − δ^ρ_ν g_{σμ})    (Carroll Ch. 8 §8.1, Wald §6.1)
 *              = (Λ/3) (δ^ρ_μ g_{σν} − δ^ρ_ν g_{σμ})
 *
 * Implied:
 *
 *   R_μν       = R^λ_{μλν}        = (n−1) K g_μν = Λ g_μν   (in n = 4)
 *   R (scalar) = g^μν R_μν        = n(n−1) K     = 4 Λ      (in n = 4)
 *
 * The Ricci-scalar identity `R = 4Λ` is the **test target** for Task 7's
 * de-Sitter coverage of `ricci()`.
 *
 * **Why c² on g_tt for de Sitter?** Λ is a 1/L² quantity; the metric
 * components carry their usual SI units (g_{tt} has units of velocity²,
 * the rest are dimensionless) — same convention as Schwarzschild. The c²
 * factor is **not** absorbed into Λ; the test passes Λ in m⁻² and reads
 * R_scalar in m⁻². The contraction `g^μν R_μν` cancels the c² in the
 * `μ = ν = 0` slot (g^{tt} carries 1/c², R_{tt} carries c²).
 *
 * **Factory closure pattern.** Each exported function takes `Lambda`
 * (in m⁻²) and returns a closure `(x) => ...`. Mirrors the
 * Schwarzschild-fixture factory pattern. No `domainMinRadius` guard —
 * callers stay inside r < √(3/Λ) (the de-Sitter horizon).
 *
 * @module tests/fixtures/de-sitter
 */

// v0.6.0 Task 2.5: canonical CODATA constant (PC-1 discipline — no inline literals).
import { C_SI as c_SI } from '../../src/core/constants.js';
const c2_SI = c_SI * c_SI; // m² s⁻²

/**
 * Returns the covariant de-Sitter metric closure g_{μν}(x) for cosmological
 * constant Λ (in m⁻²). Mostly-plus −+++ signature with the same c²-on-g_{tt}
 * SI convention as Schwarzschild.
 *
 *   g_{tt}  = −(1 − Λ r²/3) c²
 *   g_{rr}  =  1 / (1 − Λ r²/3)
 *   g_{θθ}  =  r²
 *   g_{φφ}  =  r² sin²θ
 */
export function deSitterGFn(
  Lambda: number,
): (x: ReadonlyArray<number>) => number[][] {
  return function deSitterG(x: ReadonlyArray<number>): number[][] {
    const r = x[1];
    const theta = x[2];
    const f = 1 - (Lambda * r * r) / 3;
    const sinT = Math.sin(theta);

    const g: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    g[0][0] = -f * c2_SI;
    g[1][1] = 1 / f;
    g[2][2] = r * r;
    g[3][3] = r * r * sinT * sinT;
    return g;
  };
}

/**
 * Returns the contravariant de-Sitter metric closure g^{μν}(x) for
 * cosmological constant Λ. Diagonal inverse of `deSitterGFn`.
 *
 *   g^{tt}  = −1 / ((1 − Λ r²/3) c²)
 *   g^{rr}  =  (1 − Λ r²/3)
 *   g^{θθ}  =  1 / r²
 *   g^{φφ}  =  1 / (r² sin²θ)
 *
 * Mutually consistent with `deSitterGFn`: g_{μν} g^{μν} = 4.
 */
export function deSitterGInverseFn(
  Lambda: number,
): (x: ReadonlyArray<number>) => Float64Array {
  // O-4 sibling-fixture unification (2026-06-11): returns row-major
  // Float64Array(16), flat[mu*4 + nu] = g^{μν} (Decision #1 layout —
  // mirrors the v0.9.0 O-1 schwarzschildGInverseFn migration; BREAKING
  // for fixture-internal callers only — tests/fixtures/ is not shipped).
  return function deSitterGInverse(x: ReadonlyArray<number>): Float64Array {
    const r = x[1];
    const theta = x[2];
    const f = 1 - (Lambda * r * r) / 3;
    const sinT = Math.sin(theta);

    const gInv = new Float64Array(16);
    gInv[0 * 4 + 0] = -1 / (f * c2_SI);
    gInv[1 * 4 + 1] = f;
    gInv[2 * 4 + 2] = 1 / (r * r);
    gInv[3 * 4 + 3] = 1 / (r * r * sinT * sinT);
    return gInv;
  };
}

/**
 * Returns the partial derivatives of the inverse de-Sitter metric.
 * Index order: dg[lambda][mu][nu] = ∂_lambda g^{mu nu} evaluated at coords x.
 *
 * (Matches the Schwarzschild fixture's TSDoc-pinned index order — I2.)
 *
 * Non-zero entries (radial / polar derivatives of the diagonal):
 *
 *   f  = 1 − Λr²/3,   df/dr = −2Λr/3
 *
 *   dg[1][0][0] = ∂_r g^{tt}  = −(2Λr / (3 f² c²))
 *   dg[1][1][1] = ∂_r g^{rr}  = −(2Λr / 3)
 *   dg[1][2][2] = ∂_r g^{θθ}  = −2 / r³
 *   dg[1][3][3] = ∂_r g^{φφ}  = −2 / (r³ sin²θ)
 *   dg[2][3][3] = ∂_θ g^{φφ}  = −2 cosθ / (r² sin³θ)
 *
 * Derivation of `dg[1][0][0]` sign:
 *   g^{tt} = −1/(f c²) = −(c²)^{−1} f^{−1}
 *   ∂_r g^{tt} = −(c²)^{−1} · (−f^{−2}) · (df/dr)
 *              = (c²)^{−1} · f^{−2} · (−2Λr/3)
 *              = −2Λr / (3 f² c²)
 *
 * (`dg[0][·][·]` and unlisted entries are zero — static, axisymmetric.)
 */
export function deSitterDgInverseFn(
  Lambda: number,
): (x: ReadonlyArray<number>) => Float64Array {
  // O-4 sibling-fixture unification (2026-06-11): returns row-major
  // Float64Array(64), flat[lambda*16 + mu*4 + nu] = ∂_λ g^{μν}
  // (Decision #1 layout — mirrors schwarzschildDgInverseFn).
  return function deSitterDgInverse(
    x: ReadonlyArray<number>,
  ): Float64Array {
    const r = x[1];
    const theta = x[2];
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const f = 1 - (Lambda * r * r) / 3;

    const dg = new Float64Array(64);

    // ∂_r entries (axis 1)
    dg[1 * 16 + 0 * 4 + 0] = -(2 * Lambda * r) / (3 * f * f * c2_SI);
    dg[1 * 16 + 1 * 4 + 1] = -(2 * Lambda * r) / 3;
    dg[1 * 16 + 2 * 4 + 2] = -2 / (r * r * r);
    dg[1 * 16 + 3 * 4 + 3] = -2 / (r * r * r * sinT * sinT);

    // ∂_θ entry (axis 2)
    dg[2 * 16 + 3 * 4 + 3] = (-2 * cosT) / (r * r * sinT * sinT * sinT);

    return dg;
  };
}

/**
 * Returns the closed-form de-Sitter Riemann tensor closure
 * R^ρ_{σμν}(x; Λ). Constant-curvature form (small enough to populate all
 * 256 entries since the formula is one Kronecker times the metric):
 *
 *   R^ρ_{σμν} = (Λ/3) (δ^ρ_μ g_{σν} − δ^ρ_ν g_{σμ})
 *
 * Index order: `R[rho][sigma][mu][nu]` — ρ upper, σ/μ/ν lower
 * (matches `schwarzschildRiemannFn`).
 */
export function deSitterRiemannFn(
  Lambda: number,
): (x: ReadonlyArray<number>) => number[][][][] {
  const gFn = deSitterGFn(Lambda);

  return function deSitterRiemann(
    x: ReadonlyArray<number>,
  ): number[][][][] {
    const g = gFn(x);
    const K = Lambda / 3;

    const R: number[][][][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => [0, 0, 0, 0]),
      ),
    );

    for (let rho = 0; rho < 4; rho++) {
      for (let sigma = 0; sigma < 4; sigma++) {
        for (let mu = 0; mu < 4; mu++) {
          for (let nu = 0; nu < 4; nu++) {
            const deltaRhoMu = rho === mu ? 1 : 0;
            const deltaRhoNu = rho === nu ? 1 : 0;
            R[rho][sigma][mu][nu] =
              K * (deltaRhoMu * g[sigma][nu] - deltaRhoNu * g[sigma][mu]);
          }
        }
      }
    }
    return R;
  };
}

// ---------------------------------------------------------------------------
// v0.6.0 Task 2.5 — canonical alias names used by the einstein-desitter test.
// deSitterGFn is the primary; deSitterMetricFn is the aliased entry-point
// name requested by the task spec to mirror the task-description signature.
// ---------------------------------------------------------------------------

/** Alias for `deSitterGFn` — covariant metric closure (Task 2.5 entry point). */
export const deSitterMetricFn = deSitterGFn;
