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

const G_SI = 6.6743e-11;   // m³ kg⁻¹ s⁻²
const c_SI = 2.998e8;      // m s⁻¹
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
