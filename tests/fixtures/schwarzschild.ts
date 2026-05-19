/**
 * Schwarzschild-spacetime Christoffel-symbol closure for Task 14 [U] tests.
 *
 * Coordinates: x^μ = [t, r, θ, φ]  (μ = 0,1,2,3)
 * Metric signature: mostly-plus −+++ (Carroll convention)
 * r_s = 2GM/c²  (Schwarzschild radius)
 *
 * Nonzero independent Christoffel components (Carroll Ch. 5 / Hartle Ch. 9):
 *
 *   Γ^t_{tr} = Γ^t_{rt} = r_s / (2r(r − r_s))
 *   Γ^r_{tt} = c² r_s(r − r_s) / (2r³)        (SI: c² factor from g_{tt}=−(1−r_s/r)c²)
 *   Γ^r_{rr} = −r_s / (2r(r − r_s))
 *   Γ^r_{θθ} = −(r − r_s)
 *   Γ^r_{φφ} = −(r − r_s) sin²θ
 *   Γ^θ_{rθ} = Γ^θ_{θr} = 1/r
 *   Γ^θ_{φφ} = −sin θ cos θ
 *   Γ^φ_{rφ} = Γ^φ_{φr} = 1/r
 *   Γ^φ_{θφ} = Γ^φ_{φθ} = cos θ / sin θ
 *
 * Note on units: Carroll uses c=1 natural units throughout. The geodesic
 * equation dv^μ/dτ = −Γ^μ_{νρ} v^ν v^ρ is coordinate-agnostic; the c factors
 * cancel when the Christoffel tensor is expressed in the same coordinate system
 * as the velocity 4-vector (Weinberg, Gravitation and Cosmology, §6.3).
 * The numerical test sets physical constants (G, c, M_kg) but the Christoffel
 * closure operates in SI-like units — the radial infall dynamics reduce to the
 * same cycloid form in any consistent unit system.
 *
 * @module tests/fixtures/schwarzschild
 */

// v0.5.1 PC-1: canonical CODATA / exact-SI constants from src/core/constants.ts.
// Previously used truncated `c_SI = 2.998e8`; canonicalizing to the exact
// SI value `C_SI = 299792458` is the second leg of the PC-1 hypothesis
// verification (Task 1 covariant-eikonal saw NO drop; Task 4 fixture
// migration is the remaining experimental discriminator).
import { C_SI as c_SI, G_SI } from '../../src/core/constants.js';
const c2_SI = c_SI * c_SI; // m² s⁻²

/**
 * Returns the Schwarzschild radius for a gravitational mass M_kg (SI).
 */
export function schwarzschildRs(M_kg: number): number {
  return (2 * G_SI * M_kg) / (c_SI * c_SI);
}

/**
 * Returns a Christoffel-symbol closure for the Schwarzschild metric at a
 * given gravitational mass M_kg (SI).
 *
 * The closure maps coordinate 4-vector x = [t, r, θ, φ] to a [4][4][4]
 * array of Γ^μ_{νρ} values.  All components are symmetric in {ν, ρ}.
 *
 * The closure has no magic properties — the test passes `domainMinRadius`
 * explicitly (E11 fix); no r_s monkey-patch on the function object.
 */
export function schwarzschildChristoffelFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][][] {
  const r_s = schwarzschildRs(M_kg);

  return function schwarzschildGamma(x: ReadonlyArray<number>): number[][][] {
    const r = x[1];
    const theta = x[2];

    // Initialise to zero
    const G: number[][][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    );

    const f = 1 - r_s / r;           // (r − r_s)/r
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const sinT2 = sinT * sinT;

    // Γ^t_{tr} = Γ^t_{rt}  (μ=0, ν=0 rho=1 and μ=0, ν=1, rho=0)
    const Gt_tr = r_s / (2 * r * (r - r_s));
    G[0][0][1] = Gt_tr;
    G[0][1][0] = Gt_tr;

    // Γ^r_{tt}  (μ=1, ν=0, rho=0)
    // SI factor: g_{tt} = -(1-r_s/r)c², so Γ^r_{tt} = c²·r_s·(r-r_s)/(2r³)
    G[1][0][0] = (c2_SI * r_s * (r - r_s)) / (2 * r * r * r);

    // Γ^r_{rr}  (μ=1, ν=1, rho=1)
    G[1][1][1] = -r_s / (2 * r * (r - r_s));

    // Γ^r_{θθ}  (μ=1, ν=2, rho=2)
    G[1][2][2] = -(r - r_s);

    // Γ^r_{φφ}  (μ=1, ν=3, rho=3)
    G[1][3][3] = -(r - r_s) * sinT2;

    // Γ^θ_{rθ} = Γ^θ_{θr}  (μ=2, {ν,rho}={1,2})
    G[2][1][2] = 1 / r;
    G[2][2][1] = 1 / r;

    // Γ^θ_{φφ}  (μ=2, ν=3, rho=3)
    G[2][3][3] = -sinT * cosT;

    // Γ^φ_{rφ} = Γ^φ_{φr}  (μ=3, {ν,rho}={1,3})
    G[3][1][3] = 1 / r;
    G[3][3][1] = 1 / r;

    // Γ^φ_{θφ} = Γ^φ_{φθ}  (μ=3, {ν,rho}={2,3})
    const cotT = cosT / sinT;
    G[3][2][3] = cotT;
    G[3][3][2] = cotT;

    // Suppress unused-variable warning (f is conceptually present but
    // the components above use (r - r_s) directly for clarity).
    void f;

    return G;
  };
}

// ---------------------------------------------------------------------------
// v0.5.0 fixture-API alignment (Task 0)
// ---------------------------------------------------------------------------
//
// These four exports (gFn, gInverseFn, dgInverseFn, riemannFn) are added in a
// single pre-task so Tasks 1, 5, and 7 can consume them without piecemeal
// extension (Adam+Eve M4). All use the same SI convention as
// `schwarzschildChristoffelFn` above — g_{tt} carries c², g_{rr} does not.
// ---------------------------------------------------------------------------

/**
 * Returns a covariant Schwarzschild metric closure g_{μν}(x) for mass M_kg.
 *
 * Signature: mostly-plus −+++ (Carroll). Coordinates x^μ = [t, r, θ, φ].
 *
 *   g_{tt}  = −(1 − r_s/r) c²       (SI; c² mirrors the Γ^r_{tt} convention)
 *   g_{rr}  =  1 / (1 − r_s/r)
 *   g_{θθ}  =  r²
 *   g_{φφ}  =  r² sin²θ
 *   off-diagonals = 0.
 *
 * Domain assumes r > r_s (outside the horizon). No domain guard — callers
 * pass `domainMinRadius` explicitly (E11 convention).
 */
export function schwarzschildGFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][] {
  const r_s = schwarzschildRs(M_kg);

  return function schwarzschildG(x: ReadonlyArray<number>): number[][] {
    const r = x[1];
    const theta = x[2];
    const f = 1 - r_s / r;
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
 * Returns a contravariant Schwarzschild metric closure g^{μν}(x) for mass M_kg.
 *
 * By diagonal symmetry of {@link schwarzschildGFn}:
 *
 *   g^{tt}  = −1 / ((1 − r_s/r) c²)
 *   g^{rr}  =  (1 − r_s/r)
 *   g^{θθ}  =  1 / r²
 *   g^{φφ}  =  1 / (r² sin²θ)
 *   off-diagonals = 0.
 *
 * Mutually consistent with `schwarzschildGFn`: contracting g_{μν} g^{μν} = 4.
 */
export function schwarzschildGInverseFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][] {
  const r_s = schwarzschildRs(M_kg);

  return function schwarzschildGInverse(x: ReadonlyArray<number>): number[][] {
    const r = x[1];
    const theta = x[2];
    const f = 1 - r_s / r;
    const sinT = Math.sin(theta);

    const gInv: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    gInv[0][0] = -1 / (f * c2_SI);
    gInv[1][1] = f;
    gInv[2][2] = 1 / (r * r);
    gInv[3][3] = 1 / (r * r * sinT * sinT);
    return gInv;
  };
}

/**
 * Returns the partial derivatives of the inverse metric.
 * Index order: dg[lambda][mu][nu] = ∂_lambda g^{mu nu} evaluated at coords x.
 * Only ∂_r is non-zero for Schwarzschild in (t, r, θ, φ) coordinates.
 *
 * @example
 *   // Schwarzschild: ∂_t g^{rr} = 0 (static metric)
 *   expect(schwarzschildDgInverseFn(M)([0, r, PI/2, 0])[0][1][1]).toBe(0);
 *
 * Closed-form non-zero entries (radial derivatives of the diagonal):
 *   dg[1][0][0] = ∂_r g^{tt}  = +r_s / (r² (1 − r_s/r)² c²)
 *   dg[1][1][1] = ∂_r g^{rr}  =  r_s / r²
 *   dg[1][2][2] = ∂_r g^{θθ}  = −2 / r³
 *   dg[1][3][3] = ∂_r g^{φφ}  = −2 / (r³ sin²θ)
 *   dg[2][3][3] = ∂_θ g^{φφ}  = −2 cosθ / (r² sin³θ)
 *
 * Derivation of `dg[1][0][0]` sign (v0.5.0 Task 3 fixup):
 *   g^{tt} = −1/((1−r_s/r) c²) = −(c²)^{−1} (1−r_s/r)^{−1}
 *   ∂_r g^{tt} = −(c²)^{−1} · (−1)(1−r_s/r)^{−2} · (r_s/r²)
 *              = +r_s / (r² (1−r_s/r)² c²)
 *   (Task 0 originally wrote this with a wrong sign; uncovered by the GL4
 *   cycloid radial-infall test in Task 3 — the wrong sign reverses the
 *   radial force and the particle drifts outward instead of falling in.)
 *
 * (All `dg[0][·][·]` and unlisted entries are zero — static, axisymmetric.)
 */
export function schwarzschildDgInverseFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][][] {
  const r_s = schwarzschildRs(M_kg);

  return function schwarzschildDgInverse(
    x: ReadonlyArray<number>,
  ): number[][][] {
    const r = x[1];
    const theta = x[2];
    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const f = 1 - r_s / r;

    const dg: number[][][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    );

    // ∂_r entries (axis 1)
    dg[1][0][0] = r_s / (r * r * f * f * c2_SI);
    dg[1][1][1] = r_s / (r * r);
    dg[1][2][2] = -2 / (r * r * r);
    dg[1][3][3] = -2 / (r * r * r * sinT * sinT);

    // ∂_θ entry (axis 2)
    dg[2][3][3] = (-2 * cosT) / (r * r * sinT * sinT * sinT);

    return dg;
  };
}

/**
 * Returns a closure for the Schwarzschild Riemann tensor R^ρ_{σμν}(x).
 *
 * Index order: `R[rho][sigma][mu][nu]` — ρ upper, σ/μ/ν lower (Carroll Ch. 3
 * convention, §5.1 of v0.5.0 Design). Definition (S3, post-reconciliation):
 *
 *   R^ρ_{σμν} = ∂_μ Γ^ρ_{σν} − ∂_ν Γ^ρ_{σμ} + Γ^ρ_{λμ} Γ^λ_{σν} − Γ^ρ_{λν} Γ^λ_{σμ}.
 *
 * **Scope (v0.5.0 Task 0 — pragmatic minimum).** This fixture populates ONLY
 * the components required to support:
 *   - the M7 pinning vitest (`R^t_{rtr}` and last-two antisymmetric partners),
 *   - the `R^θ_{φθφ}` smoke check,
 *   - and their antisymmetric `μ↔ν` partners.
 * Every other entry is zero. The full numerical-vs-analytic 256-component
 * sweep lands in Task 5/6 once `RiemannTensorNode` lowering exists; this
 * fixture's job is to pin index order + canonical components, not to be an
 * analytic Riemann engine.
 *
 * Closed-form (coordinate basis, SI units inherit from {@link
 * schwarzschildChristoffelFn} — no extra c² factor at the Riemann level for
 * the populated components, since `Γ^r_{tt}` does not appear in `R^t_{rtr}`):
 *
 *   R^t_{rtr}     =  r_s / (r² (r − r_s))
 *   R^θ_{φθφ}     =  (r_s / r) · sin²θ
 *
 * Antisymmetric partners (last two indices: `R^ρ_{σνμ} = −R^ρ_{σμν}`) are
 * filled symmetrically.
 *
 * **Honest deviation from plan template.** v0.5.0-Design.md §3 Task 1c reads
 * the pinning value as `R^t_rtr(r=6M) = 2GM/(6M)³` — that's the leading-order
 * / orthonormal-frame value. The coordinate-basis closed form derived from
 * the corrected (S3) Carroll formula is `r_s/(r²(r−r_s))`; the test pins
 * that value. The plan's formula is wrong by a factor of (r−r_s)/r at finite
 * r; both agree to leading order as r → ∞.
 */
export function schwarzschildRiemannFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][][][] {
  const r_s = schwarzschildRs(M_kg);

  return function schwarzschildRiemann(
    x: ReadonlyArray<number>,
  ): number[][][][] {
    const r = x[1];
    const theta = x[2];
    const sinT = Math.sin(theta);
    const sinT2 = sinT * sinT;

    // 4×4×4×4 zero tensor
    const R: number[][][][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => [0, 0, 0, 0]),
      ),
    );

    // R^t_{rtr} = r_s / (r² (r − r_s))    [ρ=0, σ=1, μ=0, ν=1]
    const Rt_rtr = r_s / (r * r * (r - r_s));
    R[0][1][0][1] = Rt_rtr;
    R[0][1][1][0] = -Rt_rtr; // antisymmetric in last two

    // R^θ_{φθφ} = (r_s/r) sin²θ            [ρ=2, σ=3, μ=2, ν=3]
    const Rth_pthp = (r_s / r) * sinT2;
    R[2][3][2][3] = Rth_pthp;
    R[2][3][3][2] = -Rth_pthp; // antisymmetric in last two

    return R;
  };
}

