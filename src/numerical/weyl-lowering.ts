/**
 * Weyl tensor numerical lowering (v0.6.0 Phase 3, Task 3.2).
 *
 * Formula (n=4, expanded form — design Decision #4):
 *
 *   C^ρ_{σμν} = R^ρ_{σμν}
 *             − (1/2)(δ^ρ_μ R_{σν} − δ^ρ_ν R_{σμ} − g_{σμ} R^ρ_ν + g_{σν} R^ρ_μ)
 *             + (1/6) R (δ^ρ_μ g_{σν} − δ^ρ_ν g_{σμ})
 *
 * Prefactors 1/2 = 1/(n-2) and 1/6 = 1/((n-1)(n-2)) at n=4.
 * n=4 is HARDCODED throughout — no runtime n parameter (Decision #13).
 *
 * F-5 mixed-variance index-raising plan:
 *   1. Accept Riemann R^ρ_{σμν} (upper-mixed), Ricci R_{μν} (all-lower),
 *      Ricci scalar R, covariant metric g_{μν}, and inverse metric g^{μν}
 *      as already-sampled arrays. The CALLER computes these via the v0.5.0
 *      curvature lowering stack.
 *   2. Raise the first Ricci index: R^ρ_ν = g^{ρα} R_{αν}.
 *   3. Assemble Weyl per the formula above.
 *
 * Sanity invariant (not a committed test — verified internally during dev):
 *   In Schwarzschild vacuum (R_{μν} = 0, R = 0) the formula reduces to
 *   C^ρ_{σμν} = R^ρ_{σμν} exactly.
 *
 * @module numerical/weyl-lowering
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Pre-sampled curvature inputs for `computeWeylTensor`.
 *
 * All arrays are at the same coordinate point.  The caller is responsible
 * for computing Riemann/Ricci/R from the v0.5.0 lowering stack before
 * calling this function.
 */
// v0.6.1: dropped export — internal parameter shape for `computeWeylTensor`.
// O-4 (2026-06-11): `metric` / `metricInverse` widened to also accept the
// row-major flat Float64Array(16) layout (`flat[mu*4 + nu]`, v0.9.0 fixture
// convention). Non-breaking — nested number[][] callers unchanged. Each is
// normalized ONCE at `computeWeylTensor` entry.
interface WeylInputs {
  /** Riemann R^ρ_{σμν}, shape [4][4][4][4]. */
  riemann: number[][][][];
  /** Ricci R_{μν} (both-lower), shape [4][4]. */
  ricci: number[][];
  /** Ricci scalar R = g^{μν} R_{μν}. */
  ricciScalar: number;
  /** Covariant metric g_{μν}: nested [4][4] or row-major Float64Array(16). */
  metric: number[][] | Float64Array;
  /** Inverse metric g^{μν}: nested [4][4] or row-major Float64Array(16). */
  metricInverse: number[][] | Float64Array;
}

/**
 * O-4 entry normalizer: unflatten a row-major Float64Array(16) into the
 * nested [4][4] layout the assembly loops consume; nested input passes
 * through untouched. Called ONCE per metric per `computeWeylTensor` call.
 */
function toNested4x4(m: number[][] | Float64Array): number[][] {
  if (!(m instanceof Float64Array)) return m;
  // Bolt: Using manual loops over Array.from to avoid massive TypedArray conversion overhead
  const out = new Array<number[]>(4);
  for (let mu = 0; mu < 4; mu++) {
    const row = new Array<number>(4);
    const base = mu * 4;
    for (let nu = 0; nu < 4; nu++) {
      row[nu] = m[base + nu];
    }
    out[mu] = row;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Index-raising helper
// ---------------------------------------------------------------------------

/**
 * Raise the first (α) index of the all-lower Ricci tensor:
 *
 *   R^ρ_ν = g^{ρα} R_{αν}
 *
 * Returns a 4×4 mixed-variance tensor (first index up, second down).
 */
function raiseRicciFirstIndex(
  ricci: number[][],
  gInv: number[][],
): number[][] {
  // n=4 hardcoded (Decision #13).
  const RicMixed: number[][] = [
    [0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0],
    [0.0, 0.0, 0.0, 0.0],
  ];
  for (let rho = 0; rho < 4; rho++) {
    const gInvRho = gInv[rho];
    for (let a = 0; a < 4; a++) {
      const g_val = gInvRho[a];
      if (g_val !== 0.0) {
        const ricciA = ricci[a];
        RicMixed[rho][0] += g_val * ricciA[0];
        RicMixed[rho][1] += g_val * ricciA[1];
        RicMixed[rho][2] += g_val * ricciA[2];
        RicMixed[rho][3] += g_val * ricciA[3];
      }
    }
  }
  return RicMixed;
}

// ---------------------------------------------------------------------------
// Main Weyl assembler
// ---------------------------------------------------------------------------

/**
 * Compute the Weyl tensor C^ρ_{σμν} from pre-sampled curvature inputs.
 *
 * Returns a 4-deep nested array C[ρ][σ][μ][ν] in the same mixed-variance
 * index order as the Riemann tensor returned by `buildRiemann`.
 *
 * n=4 is HARDCODED (Decision #13). For vacuum spacetimes (R_{μν}=0, R=0)
 * the result equals the Riemann tensor component-for-component (up to
 * floating-point zero-addition noise, which is exactly zero in exact arithmetic).
 *
 * @public
 */
export function computeWeylTensor(input: WeylInputs): number[][][][] {
  const {
    riemann: R,
    ricci: Ric,
    ricciScalar: RS,
  } = input;
  // O-4: normalize possibly-flat metrics ONCE at entry.
  const g = toNested4x4(input.metric);
  const gInv = toNested4x4(input.metricInverse);

  // F-5 Step 1: raise the first Ricci index → R^ρ_ν = g^{ρα} R_{αν}.
  const RicMixed = raiseRicciFirstIndex(Ric, gInv);

  // F-5 Steps 2–3: assemble Weyl per the n=4 expanded formula.
  //
  //   C^ρ_{σμν} = R^ρ_{σμν}
  //             − (1/2)(δ^ρ_μ R_{σν} − δ^ρ_ν R_{σμ} − g_{σμ} R^ρ_ν + g_{σν} R^ρ_μ)
  //             + (1/6) R (δ^ρ_μ g_{σν} − δ^ρ_ν g_{σμ})
  //
  // Prefactor breakdown (n=4):
  //   −1/(n-2)       = −1/2   (the Ricci correction)
  //   +1/((n-1)(n-2)) = +1/6  (the scalar correction)
  const C = new Array<number[][][]>(4);
  const oneSixth = 1.0 / 6.0;

  for (let rho = 0; rho < 4; rho++) {
    const C_rho = new Array<number[][]>(4);
    const RicMixed_rho = RicMixed[rho];
    for (let sigma = 0; sigma < 4; sigma++) {
      const C_rho_sigma = new Array<number[]>(4);
      const R_rho_sigma = R[rho][sigma];
      const g_sigma = g[sigma];
      const Ric_sigma = Ric[sigma];

      for (let mu = 0; mu < 4; mu++) {
        const delta_rho_mu = rho === mu ? 1.0 : 0.0;
        const g_sigma_mu = g_sigma[mu];
        const Ric_sigma_mu = Ric_sigma[mu];
        const RicMixed_rho_mu = RicMixed_rho[mu];

        const RS_delta_rho_mu = RS * delta_rho_mu;
        const RS_g_sigma_mu = RS * g_sigma_mu;

        const arr1 = new Array<number>(4);
        const R_rho_sigma_mu = R_rho_sigma[mu];

        for (let nu = 0; nu < 4; nu++) {
          const delta_rho_nu = rho === nu ? 1.0 : 0.0;
          arr1[nu] =
            R_rho_sigma_mu[nu]
            - 0.5 * (delta_rho_mu * Ric_sigma[nu] - delta_rho_nu * Ric_sigma_mu - g_sigma_mu * RicMixed_rho[nu] + g_sigma[nu] * RicMixed_rho_mu)
            + oneSixth * (RS_delta_rho_mu * g_sigma[nu] - delta_rho_nu * RS_g_sigma_mu);
        }

        C_rho_sigma[mu] = arr1;
      }
      C_rho[sigma] = C_rho_sigma;
    }
    C[rho] = C_rho;
  }

  return C;
}
