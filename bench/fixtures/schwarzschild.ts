/**
 * Schwarzschild-spacetime Christoffel-symbol closure — bench-local copy.
 *
 * Source: copied verbatim from tests/fixtures/schwarzschild.ts (v0.4.0 Task 14).
 * NOT imported from tests/ — bench/ must be self-contained (F3: build-safe and
 * publish-safe; tests/ is excluded from the npm tarball).
 *
 * Coordinates: x^μ = [t, r, θ, φ]  (μ = 0,1,2,3)
 * Metric signature: mostly-plus −+++ (Carroll convention)
 * r_s = 2GM/c²  (Schwarzschild radius)
 *
 * Nonzero independent Christoffel components (Carroll Ch. 5 / Hartle Ch. 9):
 *
 *   Γ^t_{tr} = Γ^t_{rt} = r_s / (2r(r − r_s))
 *   Γ^r_{tt} = c² r_s(r − r_s) / (2r³)
 *   Γ^r_{rr} = −r_s / (2r(r − r_s))
 *   Γ^r_{θθ} = −(r − r_s)
 *   Γ^r_{φφ} = −(r − r_s) sin²θ
 *   Γ^θ_{rθ} = Γ^θ_{θr} = 1/r
 *   Γ^θ_{φφ} = −sin θ cos θ
 *   Γ^φ_{rφ} = Γ^φ_{φr} = 1/r
 *   Γ^φ_{θφ} = Γ^φ_{φθ} = cos θ / sin θ
 *
 * @module bench/fixtures/schwarzschild
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
 * BR-2 (v0.6.0 Task 2.9): migrated from nested number[][][] to Float64Array(64).
 * Layout: λ-major — index (λ, μ, ν) → 16·λ + 4·μ + ν.
 *
 * The closure maps coordinate 4-vector x = [t, r, θ, φ] to a Float64Array
 * of 64 elements containing Γ^μ_{νρ} values.
 */
export function schwarzschildChristoffelFn(
  M_kg: number,
): (x: ReadonlyArray<number>) => Float64Array {
  const r_s = schwarzschildRs(M_kg);

  return function schwarzschildGamma(x: ReadonlyArray<number>): Float64Array {
    const r = x[1];
    const theta = x[2];

    const arr = new Float64Array(64); // zero-initialised by default
    const dr_factor = r - r_s;

    const sinT = Math.sin(theta);
    const cosT = Math.cos(theta);
    const sinT2 = sinT * sinT;

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

    return arr;
  };
}
