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
    [m[12], m[13], m[14], m[15]],
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
  // Bolt: Unrolled loops for fixed small dimension avoids iteration overhead.
  const g0 = gInv[0]; const g1 = gInv[1]; const g2 = gInv[2]; const g3 = gInv[3];
  const r0 = ricci[0]; const r1 = ricci[1]; const r2 = ricci[2]; const r3 = ricci[3];

  const rm0 = [0.0, 0.0, 0.0, 0.0];
  const rm1 = [0.0, 0.0, 0.0, 0.0];
  const rm2 = [0.0, 0.0, 0.0, 0.0];
  const rm3 = [0.0, 0.0, 0.0, 0.0];

  if (g0[0] !== 0.0) { rm0[0] += g0[0] * r0[0]; rm0[1] += g0[0] * r0[1]; rm0[2] += g0[0] * r0[2]; rm0[3] += g0[0] * r0[3]; }
  if (g0[1] !== 0.0) { rm0[0] += g0[1] * r1[0]; rm0[1] += g0[1] * r1[1]; rm0[2] += g0[1] * r1[2]; rm0[3] += g0[1] * r1[3]; }
  if (g0[2] !== 0.0) { rm0[0] += g0[2] * r2[0]; rm0[1] += g0[2] * r2[1]; rm0[2] += g0[2] * r2[2]; rm0[3] += g0[2] * r2[3]; }
  if (g0[3] !== 0.0) { rm0[0] += g0[3] * r3[0]; rm0[1] += g0[3] * r3[1]; rm0[2] += g0[3] * r3[2]; rm0[3] += g0[3] * r3[3]; }

  if (g1[0] !== 0.0) { rm1[0] += g1[0] * r0[0]; rm1[1] += g1[0] * r0[1]; rm1[2] += g1[0] * r0[2]; rm1[3] += g1[0] * r0[3]; }
  if (g1[1] !== 0.0) { rm1[0] += g1[1] * r1[0]; rm1[1] += g1[1] * r1[1]; rm1[2] += g1[1] * r1[2]; rm1[3] += g1[1] * r1[3]; }
  if (g1[2] !== 0.0) { rm1[0] += g1[2] * r2[0]; rm1[1] += g1[2] * r2[1]; rm1[2] += g1[2] * r2[2]; rm1[3] += g1[2] * r2[3]; }
  if (g1[3] !== 0.0) { rm1[0] += g1[3] * r3[0]; rm1[1] += g1[3] * r3[1]; rm1[2] += g1[3] * r3[2]; rm1[3] += g1[3] * r3[3]; }

  if (g2[0] !== 0.0) { rm2[0] += g2[0] * r0[0]; rm2[1] += g2[0] * r0[1]; rm2[2] += g2[0] * r0[2]; rm2[3] += g2[0] * r0[3]; }
  if (g2[1] !== 0.0) { rm2[0] += g2[1] * r1[0]; rm2[1] += g2[1] * r1[1]; rm2[2] += g2[1] * r1[2]; rm2[3] += g2[1] * r1[3]; }
  if (g2[2] !== 0.0) { rm2[0] += g2[2] * r2[0]; rm2[1] += g2[2] * r2[1]; rm2[2] += g2[2] * r2[2]; rm2[3] += g2[2] * r2[3]; }
  if (g2[3] !== 0.0) { rm2[0] += g2[3] * r3[0]; rm2[1] += g2[3] * r3[1]; rm2[2] += g2[3] * r3[2]; rm2[3] += g2[3] * r3[3]; }

  if (g3[0] !== 0.0) { rm3[0] += g3[0] * r0[0]; rm3[1] += g3[0] * r0[1]; rm3[2] += g3[0] * r0[2]; rm3[3] += g3[0] * r0[3]; }
  if (g3[1] !== 0.0) { rm3[0] += g3[1] * r1[0]; rm3[1] += g3[1] * r1[1]; rm3[2] += g3[1] * r1[2]; rm3[3] += g3[1] * r1[3]; }
  if (g3[2] !== 0.0) { rm3[0] += g3[2] * r2[0]; rm3[1] += g3[2] * r2[1]; rm3[2] += g3[2] * r2[2]; rm3[3] += g3[2] * r2[3]; }
  if (g3[3] !== 0.0) { rm3[0] += g3[3] * r3[0]; rm3[1] += g3[3] * r3[1]; rm3[2] += g3[3] * r3[2]; rm3[3] += g3[3] * r3[3]; }

  return [rm0, rm1, rm2, rm3];
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

    const RM_rho_0 = RicMixed_rho[0];
    const RM_rho_1 = RicMixed_rho[1];
    const RM_rho_2 = RicMixed_rho[2];
    const RM_rho_3 = RicMixed_rho[3];
    const R_rho = R[rho];

    for (let sigma = 0; sigma < 4; sigma++) {
      const R_rho_sigma = R_rho[sigma];
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

      const rs_six = oneSixth * RS;

      const sig_term_0 = -0.5 * R_sig_0 + rs_six * g_sig_0;
      const sig_term_1 = -0.5 * R_sig_1 + rs_six * g_sig_1;
      const sig_term_2 = -0.5 * R_sig_2 + rs_six * g_sig_2;
      const sig_term_3 = -0.5 * R_sig_3 + rs_six * g_sig_3;

      const r_rho_sigma_0 = R_rho_sigma[0];
      const g_sigma_0_half = 0.5 * g_sig_0;
      const ric_mixed_rho_0_half = 0.5 * RicMixed_rho[0];
      const mu_term_0 = 0.5 * R_sig_0 - rs_six * g_sig_0;

      let v00 = r_rho_sigma_0[0] + g_sigma_0_half * RM_rho_0 - g_sig_0 * ric_mixed_rho_0_half;
      let v01 = r_rho_sigma_0[1] + g_sigma_0_half * RM_rho_1 - g_sig_1 * ric_mixed_rho_0_half;
      let v02 = r_rho_sigma_0[2] + g_sigma_0_half * RM_rho_2 - g_sig_2 * ric_mixed_rho_0_half;
      let v03 = r_rho_sigma_0[3] + g_sigma_0_half * RM_rho_3 - g_sig_3 * ric_mixed_rho_0_half;

      if (rho === 0) {
        v00 += sig_term_0 + mu_term_0;
        v01 += sig_term_1;
        v02 += sig_term_2;
        v03 += sig_term_3;
      } else if (rho === 1) v01 += mu_term_0;
      else if (rho === 2) v02 += mu_term_0;
      else if (rho === 3) v03 += mu_term_0;

      const r_rho_sigma_1 = R_rho_sigma[1];
      const g_sigma_1_half = 0.5 * g_sig_1;
      const ric_mixed_rho_1_half = 0.5 * RicMixed_rho[1];
      const mu_term_1 = 0.5 * R_sig_1 - rs_six * g_sig_1;

      let v10 = r_rho_sigma_1[0] + g_sigma_1_half * RM_rho_0 - g_sig_0 * ric_mixed_rho_1_half;
      let v11 = r_rho_sigma_1[1] + g_sigma_1_half * RM_rho_1 - g_sig_1 * ric_mixed_rho_1_half;
      let v12 = r_rho_sigma_1[2] + g_sigma_1_half * RM_rho_2 - g_sig_2 * ric_mixed_rho_1_half;
      let v13 = r_rho_sigma_1[3] + g_sigma_1_half * RM_rho_3 - g_sig_3 * ric_mixed_rho_1_half;

      if (rho === 1) {
        v10 += sig_term_0;
        v11 += sig_term_1 + mu_term_1;
        v12 += sig_term_2;
        v13 += sig_term_3;
      } else if (rho === 0) v10 += mu_term_1;
      else if (rho === 2) v12 += mu_term_1;
      else if (rho === 3) v13 += mu_term_1;

      const r_rho_sigma_2 = R_rho_sigma[2];
      const g_sigma_2_half = 0.5 * g_sig_2;
      const ric_mixed_rho_2_half = 0.5 * RicMixed_rho[2];
      const mu_term_2 = 0.5 * R_sig_2 - rs_six * g_sig_2;

      let v20 = r_rho_sigma_2[0] + g_sigma_2_half * RM_rho_0 - g_sig_0 * ric_mixed_rho_2_half;
      let v21 = r_rho_sigma_2[1] + g_sigma_2_half * RM_rho_1 - g_sig_1 * ric_mixed_rho_2_half;
      let v22 = r_rho_sigma_2[2] + g_sigma_2_half * RM_rho_2 - g_sig_2 * ric_mixed_rho_2_half;
      let v23 = r_rho_sigma_2[3] + g_sigma_2_half * RM_rho_3 - g_sig_3 * ric_mixed_rho_2_half;

      if (rho === 2) {
        v20 += sig_term_0;
        v21 += sig_term_1;
        v22 += sig_term_2 + mu_term_2;
        v23 += sig_term_3;
      } else if (rho === 0) v20 += mu_term_2;
      else if (rho === 1) v21 += mu_term_2;
      else if (rho === 3) v23 += mu_term_2;

      const r_rho_sigma_3 = R_rho_sigma[3];
      const g_sigma_3_half = 0.5 * g_sig_3;
      const ric_mixed_rho_3_half = 0.5 * RicMixed_rho[3];
      const mu_term_3 = 0.5 * R_sig_3 - rs_six * g_sig_3;

      let v30 = r_rho_sigma_3[0] + g_sigma_3_half * RM_rho_0 - g_sig_0 * ric_mixed_rho_3_half;
      let v31 = r_rho_sigma_3[1] + g_sigma_3_half * RM_rho_1 - g_sig_1 * ric_mixed_rho_3_half;
      let v32 = r_rho_sigma_3[2] + g_sigma_3_half * RM_rho_2 - g_sig_2 * ric_mixed_rho_3_half;
      let v33 = r_rho_sigma_3[3] + g_sigma_3_half * RM_rho_3 - g_sig_3 * ric_mixed_rho_3_half;

      if (rho === 3) {
        v30 += sig_term_0;
        v31 += sig_term_1;
        v32 += sig_term_2;
        v33 += sig_term_3 + mu_term_3;
      } else if (rho === 0) v30 += mu_term_3;
      else if (rho === 1) v31 += mu_term_3;
      else if (rho === 2) v32 += mu_term_3;

      C_rho[sigma] = [
        [v00, v01, v02, v03],
        [v10, v11, v12, v13],
        [v20, v21, v22, v23],
        [v30, v31, v32, v33],
      ];
    }
    C[rho] = C_rho;
  }

  return C;
}
