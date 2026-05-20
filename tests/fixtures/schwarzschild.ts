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
 * Shared coordinate-derived context for the five Schwarzschild fixture closures.
 *
 * Computes the Schwarzschild radius `r_s = 2GM/c²` plus the trig + radial
 * pre-evaluations (`sinθ`, `cosθ`, `sin²θ`, `f = 1 − r_s/r`) consumed
 * verbatim by every Schwarzschild metric / Christoffel / Riemann closure.
 *
 * Extracted in v0.5.1 (AS-2) to deduplicate the identical opening block
 * that previously sat at the top of `schwarzschildChristoffelFn`,
 * `schwarzschildGFn`, `schwarzschildGInverseFn`, `schwarzschildDgInverseFn`,
 * `schwarzschildRiemannFn`. Module-private — fixture API surface unchanged.
 */
function makeSchwarzschildContext(M_kg: number, x: ReadonlyArray<number>) {
  const r_s = schwarzschildRs(M_kg);
  const r = x[1];
  const theta = x[2];
  const sinT = Math.sin(theta);
  const cosT = Math.cos(theta);
  const sinT2 = sinT * sinT;
  const f = 1 - r_s / r;
  return { r_s, r, theta, sinT, cosT, sinT2, f };
}

/**
 * Returns a Christoffel-symbol closure for the Schwarzschild metric at a
 * given gravitational mass M_kg (SI).
 *
 * BR-2 (v0.6.0 Task 2.9): migrated from nested number[][][] to Float64Array(64).
 * Layout: λ-major — index (λ, μ, ν) → 16·λ + 4·μ + ν.
 *
 * The closure maps coordinate 4-vector x = [t, r, θ, φ] to a Float64Array
 * of 64 elements containing Γ^μ_{νρ} values. Delegates to christoffelFnFlat
 * (same formulas, same SI constants, verified by Task 2.8 test).
 *
 * The closure has no magic properties — the test passes `domainMinRadius`
 * explicitly (E11 fix); no r_s monkey-patch on the function object.
 */
export function schwarzschildChristoffelFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => Float64Array {
  return function schwarzschildGamma(x: ReadonlyArray<number>): Float64Array {
    const { r_s, r, sinT, cosT, sinT2, f } = makeSchwarzschildContext(M_kg, x);

    const arr = new Float64Array(64); // zero-initialised by default
    const dr_factor = r - r_s;

    const Gt_tr       = r_s / (2 * r * dr_factor);
    const Gr_tt       = (c2_SI * r_s * dr_factor) / (2 * r * r * r);
    const Gr_rr       = -r_s / (2 * r * dr_factor);
    const Gr_thth     = -dr_factor;
    const Gr_phiphi   = -dr_factor * sinT2;
    const Gth_rth     = 1 / r;
    const Gth_phiphi  = -sinT * cosT;
    const Gphi_rphi   = 1 / r;
    const Gphi_thphi  = cosT / sinT;

    // Layout: 16·λ + 4·μ + ν
    arr[16*0 + 4*0 + 1] = Gt_tr;       // Γ^t_{tr}
    arr[16*0 + 4*1 + 0] = Gt_tr;       // Γ^t_{rt}
    arr[16*1 + 4*0 + 0] = Gr_tt;       // Γ^r_{tt}
    arr[16*1 + 4*1 + 1] = Gr_rr;       // Γ^r_{rr}
    arr[16*1 + 4*2 + 2] = Gr_thth;     // Γ^r_{θθ}
    arr[16*1 + 4*3 + 3] = Gr_phiphi;   // Γ^r_{φφ}
    arr[16*2 + 4*1 + 2] = Gth_rth;     // Γ^θ_{rθ}
    arr[16*2 + 4*2 + 1] = Gth_rth;     // Γ^θ_{θr}
    arr[16*2 + 4*3 + 3] = Gth_phiphi;  // Γ^θ_{φφ}
    arr[16*3 + 4*1 + 3] = Gphi_rphi;   // Γ^φ_{rφ}
    arr[16*3 + 4*3 + 1] = Gphi_rphi;   // Γ^φ_{φr}
    arr[16*3 + 4*2 + 3] = Gphi_thphi;  // Γ^φ_{θφ}
    arr[16*3 + 4*3 + 2] = Gphi_thphi;  // Γ^φ_{φθ}

    // Suppress unused-variable warning (f is conceptually present via the
    // dr_factor alias; keep void to silence the linter).
    void f;

    return arr;
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
  return function schwarzschildG(x: ReadonlyArray<number>): number[][] {
    const { r, sinT2, f } = makeSchwarzschildContext(M_kg, x);

    const g: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    g[0][0] = -f * c2_SI;
    g[1][1] = 1 / f;
    g[2][2] = r * r;
    g[3][3] = r * r * sinT2;
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
  return function schwarzschildGInverse(x: ReadonlyArray<number>): number[][] {
    const { r, sinT2, f } = makeSchwarzschildContext(M_kg, x);

    const gInv: number[][] = [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ];
    gInv[0][0] = -1 / (f * c2_SI);
    gInv[1][1] = f;
    gInv[2][2] = 1 / (r * r);
    gInv[3][3] = 1 / (r * r * sinT2);
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
  return function schwarzschildDgInverse(
    x: ReadonlyArray<number>,
  ): number[][][] {
    const { r_s, r, sinT, cosT, sinT2, f } = makeSchwarzschildContext(M_kg, x);

    const dg: number[][][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    );

    // ∂_r entries (axis 1)
    dg[1][0][0] = r_s / (r * r * f * f * c2_SI);
    dg[1][1][1] = r_s / (r * r);
    dg[1][2][2] = -2 / (r * r * r);
    dg[1][3][3] = -2 / (r * r * r * sinT2);

    // ∂_θ entry (axis 2)
    dg[2][3][3] = (-2 * cosT) / (r * r * sinT * sinT2);

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
  return function schwarzschildRiemann(
    x: ReadonlyArray<number>,
  ): number[][][][] {
    const { r_s, r, sinT2 } = makeSchwarzschildContext(M_kg, x);

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

// ---------------------------------------------------------------------------
// v0.6.0 Phase 1 Task 1.3 — Schwarzschild Killing-vector fixtures
// ---------------------------------------------------------------------------

/**
 * Time-translation Killing field factory ξ^μ_t = (1, 0, 0, 0).
 *
 * Coordinate-independent: returns the same upper-index components at every
 * point in the exterior Schwarzschild spacetime. The metric isometry is
 * ∂/∂t. Conserved charge for a geodesic particle is E = −p_t (Carroll Eq. 8.30;
 * the minus sign arises from the (−,+,+,+) metric signature).
 *
 * Usage:
 *   const xiT = schwarzschildKillingT();
 *   const components = xiT([t, r, theta, phi]); // → [1, 0, 0, 0]
 */
export function schwarzschildKillingT(): (
  x: [number, number, number, number],
) => [number, number, number, number] {
  return (_x) => [1, 0, 0, 0];
}

/**
 * Axial Killing field factory ξ^μ_φ = (0, 0, 0, 1).
 *
 * Coordinate-independent: returns the same upper-index components at every
 * point in the exterior Schwarzschild spacetime. The metric isometry is
 * ∂/∂φ. Conserved charge for a geodesic particle is L = p_φ (angular
 * momentum about the symmetry axis, Carroll Eq. 8.30).
 *
 * Usage:
 *   const xiPhi = schwarzschildKillingPhi();
 *   const components = xiPhi([t, r, theta, phi]); // → [0, 0, 0, 1]
 */
export function schwarzschildKillingPhi(): (
  x: [number, number, number, number],
) => [number, number, number, number] {
  return (_x) => [0, 0, 0, 1];
}

/**
 * Returns a closure for the partial derivatives of the covariant Schwarzschild
 * metric `∂_λ g_{μν}(x)`.
 *
 * Index order: dg[lambda][mu][nu] = ∂_lambda g_{mu nu}.
 * Only ∂_r (axis 1) and ∂_θ (axis 2) are non-zero for Schwarzschild in
 * (t, r, θ, φ) coordinates (static, axisymmetric metric).
 *
 * Non-zero closed-form entries (SI units, same conventions as
 * {@link schwarzschildGFn}):
 *
 *   dg[1][0][0] = ∂_r g_{tt} = −c² r_s / r²
 *   dg[1][1][1] = ∂_r g_{rr} = −r_s / (r² (1 − r_s/r)²)
 *   dg[1][2][2] = ∂_r g_{θθ} = 2r
 *   dg[1][3][3] = ∂_r g_{φφ} = 2r sin²θ
 *   dg[2][3][3] = ∂_θ g_{φφ} = 2r² sin θ cos θ
 *
 * Derivations:
 *   g_{tt} = −(1−r_s/r)c²  ⟹  ∂_r g_{tt} = −c²(∂_r(−r_s/r)·(−1)) = −c²·r_s/r²
 *   g_{rr} = 1/(1−r_s/r)   ⟹  ∂_r g_{rr} = −(r_s/r²)/(1−r_s/r)² = −r_s/(r²f²)
 *
 * Used by {@link verifyKillingEquation} (dMetricFn path) to avoid c²-scale
 * floating-point cancellation in the FD path for the Schwarzschild time-translation
 * Killing vector.
 */
export function schwarzschildDgFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => number[][][] {
  return function schwarzschildDg(
    x: ReadonlyArray<number>,
  ): number[][][] {
    const { r_s, r, sinT, cosT, sinT2, f } = makeSchwarzschildContext(M_kg, x);

    const dg: number[][][] = Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    );

    // ∂_r entries (axis 1)
    dg[1][0][0] = -c2_SI * r_s / (r * r);
    dg[1][1][1] = -r_s / (r * r * f * f);
    dg[1][2][2] = 2 * r;
    dg[1][3][3] = 2 * r * sinT2;

    // ∂_θ entry (axis 2).
    // Natural form: ∂_θ(r²sin²θ) = 2r²sinθcosθ. Residual at irrational θ
    // (e.g. π/3) reaches ~eps*r²*sinθcosθ ≈ 3e-8 due to IEEE 754 rounding in
    // (cosθ/sinθ)*sinθ² vs sinθ*cosθ — this is machine-precision floor, not
    // an algorithm error.
    dg[2][3][3] = 2 * r * r * sinT * cosT;

    return dg;
  };
}

