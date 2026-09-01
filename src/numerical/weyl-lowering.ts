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
  // Bolt: Explicitly populating a 2D native JS array with unrolled array literal lookup
  // dramatically outperforms multi-dimensional iteration block allocation overhead
  return [
    [m[0], m[1], m[2], m[3]],
    [m[4], m[5], m[6], m[7]],
    [m[8], m[9], m[10], m[11]],
    [m[12], m[13], m[14], m[15]]
  ];
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
  const RicMixed = new Array<number[]>(4);
  const ricci0 = ricci[0];
  const ricci1 = ricci[1];
  const ricci2 = ricci[2];
  const ricci3 = ricci[3];

  for (let rho = 0; rho < 4; rho++) {
    const gInvRho = gInv[rho];

    let r0 = 0.0;
    let r1 = 0.0;
    let r2 = 0.0;
    let r3 = 0.0;

    const g0 = gInvRho[0];
    if (g0 !== 0.0) {
      r0 += g0 * ricci0[0];
      r1 += g0 * ricci0[1];
      r2 += g0 * ricci0[2];
      r3 += g0 * ricci0[3];
    }

    const g1 = gInvRho[1];
    if (g1 !== 0.0) {
      r0 += g1 * ricci1[0];
      r1 += g1 * ricci1[1];
      r2 += g1 * ricci1[2];
      r3 += g1 * ricci1[3];
    }

    const g2 = gInvRho[2];
    if (g2 !== 0.0) {
      r0 += g2 * ricci2[0];
      r1 += g2 * ricci2[1];
      r2 += g2 * ricci2[2];
      r3 += g2 * ricci2[3];
    }

    const g3 = gInvRho[3];
    if (g3 !== 0.0) {
      r0 += g3 * ricci3[0];
      r1 += g3 * ricci3[1];
      r2 += g3 * ricci3[2];
      r3 += g3 * ricci3[3];
    }

    RicMixed[rho] = [r0, r1, r2, r3];
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

    const d_rho_0 = rho === 0 ? 1.0 : 0.0;
    const d_rho_1 = rho === 1 ? 1.0 : 0.0;
    const d_rho_2 = rho === 2 ? 1.0 : 0.0;
    const d_rho_3 = rho === 3 ? 1.0 : 0.0;

    const RM_rho_0 = RicMixed_rho[0];
    const RM_rho_1 = RicMixed_rho[1];
    const RM_rho_2 = RicMixed_rho[2];
    const RM_rho_3 = RicMixed_rho[3];

    // Pre-calculate loop-invariant scalar combinations
    const RS_d_rho_0_six = oneSixth * (d_rho_0 * RS);
    const RS_d_rho_1_six = oneSixth * (d_rho_1 * RS);
    const RS_d_rho_2_six = oneSixth * (d_rho_2 * RS);
    const RS_d_rho_3_six = oneSixth * (d_rho_3 * RS);

    for (let sigma = 0; sigma < 4; sigma++) {
      const C_rho_sigma = new Array<number[]>(4);
      const R_rho_sigma = R[rho][sigma];
      const g_sigma = g[sigma];
      const Ric_sigma = Ric[sigma];

      const g_sig_0 = g_sigma[0];
      const g_sig_1 = g_sigma[1];
      const g_sig_2 = g_sigma[2];
      const g_sig_3 = g_sigma[3];

      const R_sig_0 = Ric_sigma[0];
      const R_sig_1 = Ric_sigma[1];
      const R_sig_2 = Ric_sigma[2];
      const R_sig_3 = Ric_sigma[3];

      for (let mu = 0; mu < 4; mu++) {
        const delta_rho_mu = rho === mu ? 1.0 : 0.0;
        const g_sigma_mu = g_sigma[mu];
        const Ric_sigma_mu = Ric_sigma[mu];
        const RicMixed_rho_mu = RicMixed_rho[mu];

        // Calculate invariant terms dependent on mu for distribution
        const term3 = oneSixth * (RS * delta_rho_mu);
        const term3_0 = term3 * g_sig_0 - RS_d_rho_0_six * g_sigma_mu;
        const term3_1 = term3 * g_sig_1 - RS_d_rho_1_six * g_sigma_mu;
        const term3_2 = term3 * g_sig_2 - RS_d_rho_2_six * g_sigma_mu;
        const term3_3 = term3 * g_sig_3 - RS_d_rho_3_six * g_sigma_mu;

        const term_RicMixed = 0.5 * RicMixed_rho_mu;

        const R_rho_sigma_mu = R_rho_sigma[mu];

        // Explicit unrolling with pre-allocated array initialization
        // Using fast 4-element Array allocation syntax natively
        const arr1 = [
          R_rho_sigma_mu[0]
            - 0.5 * (delta_rho_mu * R_sig_0 - d_rho_0 * Ric_sigma_mu - g_sigma_mu * RM_rho_0) - term_RicMixed * g_sig_0
            + term3_0,
          R_rho_sigma_mu[1]
            - 0.5 * (delta_rho_mu * R_sig_1 - d_rho_1 * Ric_sigma_mu - g_sigma_mu * RM_rho_1) - term_RicMixed * g_sig_1
            + term3_1,
          R_rho_sigma_mu[2]
            - 0.5 * (delta_rho_mu * R_sig_2 - d_rho_2 * Ric_sigma_mu - g_sigma_mu * RM_rho_2) - term_RicMixed * g_sig_2
            + term3_2,
          R_rho_sigma_mu[3]
            - 0.5 * (delta_rho_mu * R_sig_3 - d_rho_3 * Ric_sigma_mu - g_sigma_mu * RM_rho_3) - term_RicMixed * g_sig_3
            + term3_3
        ];

        C_rho_sigma[mu] = arr1;
      }
      C_rho[sigma] = C_rho_sigma;
    }
    C[rho] = C_rho;
  }

  return C;
}
