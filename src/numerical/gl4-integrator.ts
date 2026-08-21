/**
 * Gauss-Legendre 4th-order (GL4) symplectic integrator — types + Butcher
 * tableau scaffold (v0.5.0 Task 1, Phase 1a-i).
 *
 * GL4 is a 2-stage implicit Runge-Kutta method built on the roots of the
 * shifted Legendre polynomial P₂, with order p = 4 and stage order s = 2.
 * It is symplectic for non-separable Hamiltonians — the property that
 * justifies its selection over Ruth-4 for the geodesic Hamiltonian
 *
 *   H(x, p) = ½ g^{μν}(x) p_μ p_ν,
 *
 * which is non-separable because g^{μν} depends on x. (v0.5.0 Decision #2,
 * post-adversarial reconciliation; Sanz-Serna 1988; Hairer/Lubich/Wanner
 * "Geometric Numerical Integration" §II.1.)
 *
 * The state is canonical (x, p) (Decision #3) — covariant momentum
 * p_μ = g_μν dx^ν/dτ — not (x, v). This is what makes the flow symplectic
 * on T*M.
 *
 * This module ships **types + Butcher constants only**. The implicit Picard
 * stage solver lands in Task 2; the integrator entry-point
 * `integrateGeodesicGL4` lands in Task 3.
 *
 * @module numerical/gl4-integrator
 */
import { GL4ConvergenceError, NumericalBackendError } from './errors.js';

const SQRT3_OVER_6 = Math.sqrt(3) / 6;

/**
 * Gauss-Legendre 4th-order quadrature nodes c₁, c₂ — the two roots of the
 * shifted Legendre polynomial P₂(x) on [0,1].
 *
 *   c₁ = ½ − √3/6,   c₂ = ½ + √3/6.
 *
 * @internal — exported for unit tests pinning the Butcher tableau invariants.
 * Public callers should use {@link integrateGeodesicGL4}, not the raw constants.
 */
export const GL4_C: readonly [number, number] = [0.5 - SQRT3_OVER_6, 0.5 + SQRT3_OVER_6];

/**
 * GL4 Butcher matrix a_{ij} — the 2×2 collocation table for the implicit
 * stages:
 *
 *   [ 1/4              1/4 − √3/6 ]
 *   [ 1/4 + √3/6       1/4        ]
 *
 * (Hairer/Lubich/Wanner §II.1, Table 1.1.)
 *
 * @internal — exported for unit tests pinning the Butcher tableau invariants.
 * Public callers should use {@link integrateGeodesicGL4}, not the raw constants.
 */
export const GL4_A: readonly [readonly [number, number], readonly [number, number]] = [
  [0.25, 0.25 - SQRT3_OVER_6],
  [0.25 + SQRT3_OVER_6, 0.25],
];

/**
 * GL4 stage weights — the 2-point Gauss-Legendre quadrature weights on
 * [0,1]:  b₁ = b₂ = ½.
 *
 * @internal — exported for unit tests pinning the Butcher tableau invariants.
 * Public callers should use {@link integrateGeodesicGL4}, not the raw constants.
 */
export const GL4_B: readonly [number, number] = [0.5, 0.5];

/**
 * Canonical (x, p) phase-space state for the geodesic flow on T*M.
 *
 *   x^μ        — coordinate 4-vector
 *   p_μ        — covariant momentum, p_μ = g_μν dx^ν/dτ
 *
 * Decision #3 (v0.5.0): the canonical state is (x, p), not (x, v). The
 * symplectic 2-form ω = dp_μ ∧ dx^μ is preserved by the GL4 flow only on
 * this representation.
 *
 * @public
 */
export interface GL4State {
  /** Coordinate 4-vector x^μ. */
  readonly x: readonly number[];
  /** Covariant momentum p_μ = g_μν v^ν. */
  readonly p: readonly number[];
}

/**
 * Per-step snapshot recorded by the integrator. `v` (the contravariant
 * 4-velocity v^μ = g^{μν} p_ν) is optional — emitted when the caller asks
 * for it, since it requires an extra metric-inverse contraction.
 *
 * @public
 */
export interface GL4Snapshot {
  readonly tau: number;
  readonly x: readonly number[];
  readonly p: readonly number[];
  readonly v?: readonly number[];
}

/**
 * Options for `integrateGeodesicGL4` (lands in Task 3).
 *
 * @public
 */
export interface GL4Options {
  /** Number of integration steps (uniform-step baseline; may be subdivided
   *  by adaptive step-halving). */
  readonly steps: number;
  /** Final proper time τ_max (initial τ = 0). */
  readonly tauMax: number;
  /** Inverse-metric closure (v0.9.0 O-1 flat layout):
   *  `gInverseFn(x)[μ*dim + ν] = g^{μν}(x)`, row-major Float64Array(dim²). */
  readonly gInverseFn: (x: readonly number[]) => Float64Array;
  /**
   * Partial derivatives of the inverse metric.
   * Index order (v0.9.0 O-1 flat layout):
   * `dgInverseFn(x)[lambda*dim² + mu*dim + nu] = ∂_lambda g^{mu nu}` at coords x.
   * (I2: axis semantics pinned here to prevent silent transposition bugs.)
   */
  readonly dgInverseFn: (x: readonly number[]) => Float64Array;
  /** Picard fixed-point tolerance (default chosen in Task 2). */
  readonly picardTol?: number;
  /** Picard fixed-point iteration cap (default chosen in Task 2). */
  readonly picardMaxIter?: number;
  /** Adaptive step-halving floor (I4). If step-halving reaches h_min, throws with diagnostic. */
  readonly hMin?: number;
  /** Minimum radial coordinate (or domain analog) — abort integration if
   *  the trajectory crosses inside this radius (e.g., the Schwarzschild
   *  event horizon at r = r_s). */
  readonly domainMinRadius?: number;
  /**
   * v0.5.1 PD-4: opt-in per-step diagnostics callback. Fires once per
   * successful step with the Picard iteration count consumed and whether
   * adaptive step-halving had to subdivide (an "exhaustion" event from the
   * caller's perspective: the original h failed Picard and was halved).
   *
   * Used by the gated `GL4_LONG=1` Mercury 100-orbit Picard-convergence
   * test to measure the failure fraction across millions of steps without
   * polluting the integrator's return shape for normal callers.
   *
   * - `iterations`: Picard iteration count actually consumed at the
   *   successful step size (always 1..picardMaxIter).
   * - `halvings`: number of step-halvings the step required before
   *   succeeding (0 = first try; ≥1 means original h hit picardMaxIter).
   */
  readonly onStep?: (event: { step: number; iterations: number; halvings: number }) => void;
}

/**
 * Result of `solveGL4Stage` — the two converged stage values plus the
 * iteration count actually consumed. Consumed by the upcoming
 * `integrateGeodesicGL4` step driver (Task 3).
 *
 * v0.6.1: dropped export — internal-only result shape (was already
 * @internal-tagged but had no external consumer).
 */
interface StageSolveResult {
  readonly stageX: readonly [readonly number[], readonly number[]];
  readonly stageP: readonly [readonly number[], readonly number[]];
  readonly stageDx: readonly [readonly number[], readonly number[]];
  readonly stageDp: readonly [readonly number[], readonly number[]];
  readonly iterations: number;
}

/**
 * Picard fixed-point solver for the GL4 implicit stage system.
 *
 * Per Design §3 Task 1a, the implicit system is:
 *   X_i = x_n + h · Σ_j a_{ij} · g^{·ν}(X_j) P_{j,ν}
 *   P_{i,μ} = p_n − h · Σ_j a_{ij} · ½ (∂_μ g^νρ)(X_j) P_{j,ν} P_{j,ρ}
 *
 * Data flow (F15 / M1): stage values (X_j, P_j) at iterate k feed forward
 * to update (X_i, P_i) at iterate k+1. This is Picard iteration (NOT
 * Newton) — no Jacobian assembly or LU decomposition. Convergence is
 * linear with contraction rate ≈ h·|∂f/∂x|. For Mercury (h ≈ 150 s),
 * expect 30–40 iterations at tol=1e-12. GL4's symplecticity is guaranteed
 * by the Butcher tableau, not by the inner solver's convergence speed
 * (Sanz-Serna 1988; Hairer/Lubich/Wanner §II.1).
 *
 * The `dgInverseFn` index order is `dg[λ][μ][ν] = ∂_λ g^{μν}` (Task 0 I2
 * pin, also recorded on `GL4Options.dgInverseFn`). When we evaluate
 * `dp_μ = −½ (∂_μ g^{νρ}) P_ν P_ρ` we therefore read
 * `dgInvAtXj[mu*dim²+nu*dim+rho]` — `mu` is the differentiation axis (λ in the
 * pinned order) and `(nu, rho)` are the upper metric indices.
 *
 * Throws `GL4ConvergenceError` with message matching
 * `/Picard iteration did not converge/` if `picardMaxIter` is exhausted.
 *
 * @internal
 */
export function solveGL4Stage(
  state: GL4State,
  h: number,
  gInverseFn: (x: readonly number[]) => Float64Array,
  dgInverseFn: (x: readonly number[]) => Float64Array,
  opts: { picardTol: number; picardMaxIter: number },
): StageSolveResult {
  const dim = state.x.length;
  // Pre-allocate ping-pong buffers (O-2): both X / P stage pairs as
  // reusable Float64Arrays. The original implementation allocated 4
  // arrays per Picard iteration (up to picardMaxIter = 50 iters per
  // RK4 step); now allocation is once per call and references are
  // swapped per iteration.
  const bufXA: Float64Array[] = [new Float64Array(dim), new Float64Array(dim)];
  const bufXB: Float64Array[] = [new Float64Array(dim), new Float64Array(dim)];
  const bufPA: Float64Array[] = [new Float64Array(dim), new Float64Array(dim)];
  const bufPB: Float64Array[] = [new Float64Array(dim), new Float64Array(dim)];

  // Initial guess: stage values = state values (k=0 of fixed-point iteration).
  bufXA[0].set(state.x); bufXA[1].set(state.x);
  bufPA[0].set(state.p); bufPA[1].set(state.p);
  let X: Float64Array[] = bufXA;
  let P: Float64Array[] = bufPA;
  let Xnew: Float64Array[] = bufXB;
  let Pnew: Float64Array[] = bufPB;

  // Pre-allocate arrays to hoist dxStage and dpStage out of the `i` loop
  const dxStageArr: Float64Array[] = [new Float64Array(dim), new Float64Array(dim)];
  const dpStageArr: Float64Array[] = [new Float64Array(dim), new Float64Array(dim)];

  const hA00 = h * GL4_A[0][0];
  const hA01 = h * GL4_A[0][1];
  const hA10 = h * GL4_A[1][0];
  const hA11 = h * GL4_A[1][1];
  const halfhA00 = 0.5 * hA00;
  const halfhA01 = 0.5 * hA01;
  const halfhA10 = 0.5 * hA10;
  const halfhA11 = 0.5 * hA11;

  for (let k = 0; k < opts.picardMaxIter; k++) {
    // 1. Evaluate metric closures only twice per Picard iteration
    const gInvAtX0 = gInverseFn(X[0] as unknown as readonly number[]);
    const dgInvAtX0 = dgInverseFn(X[0] as unknown as readonly number[]);
    const gInvAtX1 = gInverseFn(X[1] as unknown as readonly number[]);
    const dgInvAtX1 = dgInverseFn(X[1] as unknown as readonly number[]);

    // 2. Precompute dxStage and dpStage for all j and mu (only 8 combinations)
    const p0_st = P[0];
    const p1_st = P[1];

    if (dim === 4) {
      // Bolt: Pre-cache momentum elements into local scalars to eliminate array lookups.
      // This combined with manual loop unrolling completely eliminates loop overhead
      // for 4D spacetime integrations without losing `g !== 0` bailout sparseness benefits.
      const p00 = p0_st[0], p01 = p0_st[1], p02 = p0_st[2], p03 = p0_st[3];
      const p10 = p1_st[0], p11 = p1_st[1], p12 = p1_st[2], p13 = p1_st[3];

      for (let mu = 0; mu < 4; mu++) {
        let dx0 = 0, dp0 = 0, dx1 = 0, dp1 = 0;
        const mu4 = mu * 4;

        let g0, g1, dg0, dg1;
        let pDotTerm0, pDotTerm1;

        let offset = mu * 16;

        // nu = 0
        g0 = gInvAtX0[mu4]; if (g0 !== 0) dx0 += g0 * p00;
        g1 = gInvAtX1[mu4]; if (g1 !== 0) dx1 += g1 * p10;
        dg0 = dgInvAtX0[offset]; dg1 = dgInvAtX1[offset];
        // Guarded like every other rho term, and like master. Assigning
        // unguarded here would compute 0 * p when dg is exactly 0, which is
        // NaN for a non-finite momentum -- manufacturing a divergence signal
        // out of a term that contributes nothing.
        pDotTerm0 = 0; if (dg0 !== 0) { pDotTerm0 = dg0 * p00; }
        pDotTerm1 = 0; if (dg1 !== 0) { pDotTerm1 = dg1 * p10; }
        dg0 = dgInvAtX0[offset+1]; dg1 = dgInvAtX1[offset+1];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p01; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p11; }
        dg0 = dgInvAtX0[offset+2]; dg1 = dgInvAtX1[offset+2];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p02; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p12; }
        dg0 = dgInvAtX0[offset+3]; dg1 = dgInvAtX1[offset+3];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p03; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p13; }
        if (pDotTerm0 !== 0) { dp0 += pDotTerm0 * p00; }
        if (pDotTerm1 !== 0) { dp1 += pDotTerm1 * p10; }

        // nu = 1
        offset += 4;
        g0 = gInvAtX0[mu4+1]; if (g0 !== 0) dx0 += g0 * p01;
        g1 = gInvAtX1[mu4+1]; if (g1 !== 0) dx1 += g1 * p11;
        dg0 = dgInvAtX0[offset]; dg1 = dgInvAtX1[offset];
        // Guarded like every other rho term, and like master. Assigning
        // unguarded here would compute 0 * p when dg is exactly 0, which is
        // NaN for a non-finite momentum -- manufacturing a divergence signal
        // out of a term that contributes nothing.
        pDotTerm0 = 0; if (dg0 !== 0) { pDotTerm0 = dg0 * p00; }
        pDotTerm1 = 0; if (dg1 !== 0) { pDotTerm1 = dg1 * p10; }
        dg0 = dgInvAtX0[offset+1]; dg1 = dgInvAtX1[offset+1];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p01; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p11; }
        dg0 = dgInvAtX0[offset+2]; dg1 = dgInvAtX1[offset+2];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p02; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p12; }
        dg0 = dgInvAtX0[offset+3]; dg1 = dgInvAtX1[offset+3];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p03; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p13; }
        if (pDotTerm0 !== 0) { dp0 += pDotTerm0 * p01; }
        if (pDotTerm1 !== 0) { dp1 += pDotTerm1 * p11; }

        // nu = 2
        offset += 4;
        g0 = gInvAtX0[mu4+2]; if (g0 !== 0) dx0 += g0 * p02;
        g1 = gInvAtX1[mu4+2]; if (g1 !== 0) dx1 += g1 * p12;
        dg0 = dgInvAtX0[offset]; dg1 = dgInvAtX1[offset];
        // Guarded like every other rho term, and like master. Assigning
        // unguarded here would compute 0 * p when dg is exactly 0, which is
        // NaN for a non-finite momentum -- manufacturing a divergence signal
        // out of a term that contributes nothing.
        pDotTerm0 = 0; if (dg0 !== 0) { pDotTerm0 = dg0 * p00; }
        pDotTerm1 = 0; if (dg1 !== 0) { pDotTerm1 = dg1 * p10; }
        dg0 = dgInvAtX0[offset+1]; dg1 = dgInvAtX1[offset+1];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p01; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p11; }
        dg0 = dgInvAtX0[offset+2]; dg1 = dgInvAtX1[offset+2];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p02; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p12; }
        dg0 = dgInvAtX0[offset+3]; dg1 = dgInvAtX1[offset+3];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p03; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p13; }
        if (pDotTerm0 !== 0) { dp0 += pDotTerm0 * p02; }
        if (pDotTerm1 !== 0) { dp1 += pDotTerm1 * p12; }

        // nu = 3
        offset += 4;
        g0 = gInvAtX0[mu4+3]; if (g0 !== 0) dx0 += g0 * p03;
        g1 = gInvAtX1[mu4+3]; if (g1 !== 0) dx1 += g1 * p13;
        dg0 = dgInvAtX0[offset]; dg1 = dgInvAtX1[offset];
        // Guarded like every other rho term, and like master. Assigning
        // unguarded here would compute 0 * p when dg is exactly 0, which is
        // NaN for a non-finite momentum -- manufacturing a divergence signal
        // out of a term that contributes nothing.
        pDotTerm0 = 0; if (dg0 !== 0) { pDotTerm0 = dg0 * p00; }
        pDotTerm1 = 0; if (dg1 !== 0) { pDotTerm1 = dg1 * p10; }
        dg0 = dgInvAtX0[offset+1]; dg1 = dgInvAtX1[offset+1];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p01; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p11; }
        dg0 = dgInvAtX0[offset+2]; dg1 = dgInvAtX1[offset+2];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p02; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p12; }
        dg0 = dgInvAtX0[offset+3]; dg1 = dgInvAtX1[offset+3];
        if (dg0 !== 0) { pDotTerm0 += dg0 * p03; }
        if (dg1 !== 0) { pDotTerm1 += dg1 * p13; }
        if (pDotTerm0 !== 0) { dp0 += pDotTerm0 * p03; }
        if (pDotTerm1 !== 0) { dp1 += pDotTerm1 * p13; }

        dxStageArr[0][mu] = dx0;
        dpStageArr[0][mu] = dp0;
        dxStageArr[1][mu] = dx1;
        dpStageArr[1][mu] = dp1;
      }
    } else {
      for (let mu = 0; mu < dim; mu++) {
        let dx0 = 0, dp0 = 0;
        let dx1 = 0, dp1 = 0;
        const mu_dim = mu * dim;
        const mu_dim_dim = mu_dim * dim;

        for (let nu = 0; nu < dim; nu++) {
          const idx_g = mu_dim + nu;

          // Stage 0
          const g0 = gInvAtX0[idx_g];
          if (g0 !== 0) {
            dx0 += g0 * p0_st[nu];
          }

          // Stage 1
          const g1 = gInvAtX1[idx_g];
          if (g1 !== 0) {
            dx1 += g1 * p1_st[nu];
          }

          let pDotTerm0 = 0;
          let pDotTerm1 = 0;
          const offset = mu_dim_dim + nu * dim;

          for (let rho = 0; rho < dim; rho++) {
            const dgIdx = offset + rho;

            const dg0 = dgInvAtX0[dgIdx];
            if (dg0 !== 0) {
              pDotTerm0 += dg0 * p0_st[rho];
            }

            const dg1 = dgInvAtX1[dgIdx];
            if (dg1 !== 0) {
              pDotTerm1 += dg1 * p1_st[rho];
            }
          }

          if (pDotTerm0 !== 0) {
            dp0 += pDotTerm0 * p0_st[nu];
          }
          if (pDotTerm1 !== 0) {
            dp1 += pDotTerm1 * p1_st[nu];
          }
        }

        dxStageArr[0][mu] = dx0;
        dpStageArr[0][mu] = dp0;
        dxStageArr[1][mu] = dx1;
        dpStageArr[1][mu] = dp1;
      }
    }

    // 3. Accumulate for i and mu
    for (let mu = 0; mu < dim; mu++) {
      const x0 = state.x[mu];
      const p0 = state.p[mu];
      const dx0 = dxStageArr[0][mu];
      const dx1 = dxStageArr[1][mu];
      const dp0 = dpStageArr[0][mu];
      const dp1 = dpStageArr[1][mu];

      Xnew[0][mu] = x0 + hA00 * dx0 + hA01 * dx1;
      Pnew[0][mu] = p0 - halfhA00 * dp0 - halfhA01 * dp1;

      Xnew[1][mu] = x0 + hA10 * dx0 + hA11 * dx1;
      Pnew[1][mu] = p0 - halfhA10 * dp0 - halfhA11 * dp1;
    }

    // Convergence check: max |δX, δP|
    let maxDelta = 0;
    for (let i = 0; i < 2; i++) {
      for (let mu = 0; mu < dim; mu++) {
        maxDelta = Math.max(maxDelta, Math.abs(Xnew[i][mu] - X[i][mu]));
        maxDelta = Math.max(maxDelta, Math.abs(Pnew[i][mu] - P[i][mu]));
      }
    }

    // Ping-pong swap: read-from + write-to buffers exchange roles for next iter.
    [X, Xnew] = [Xnew, X];
    [P, Pnew] = [Pnew, P];

    if (maxDelta < opts.picardTol) {
      // Clone on return — caller may retain references and the next
      // solveGL4Stage call will overwrite our internal buffers.
      // Bolt: Manual loop is significantly faster than Array.from for TypedArrays in tight loops.
      const sX0 = new Array<number>(dim);
      const sX1 = new Array<number>(dim);
      const sP0 = new Array<number>(dim);
      const sP1 = new Array<number>(dim);
      const sDx0 = new Array<number>(dim);
      const sDx1 = new Array<number>(dim);
      const sDp0 = new Array<number>(dim);
      const sDp1 = new Array<number>(dim);
      for (let m = 0; m < dim; m++) {
        sX0[m] = X[0][m];
        sX1[m] = X[1][m];
        sP0[m] = P[0][m];
        sP1[m] = P[1][m];
        sDx0[m] = dxStageArr[0][m];
        sDx1[m] = dxStageArr[1][m];
        sDp0[m] = dpStageArr[0][m];
        sDp1[m] = dpStageArr[1][m];
      }
      return {
        stageX: [sX0, sX1],
        stageP: [sP0, sP1],
        stageDx: [sDx0, sDx1],
        stageDp: [sDp0, sDp1],
        iterations: k + 1,
      };
    }
  }

  throw new GL4ConvergenceError(
    `Picard iteration did not converge in ${opts.picardMaxIter} iterations (maxDelta above picardTol=${opts.picardTol})`,
  );
}

// ---------------------------------------------------------------------------
// Integrator entry-point (Task 3, Phase 1a-iii)
// ---------------------------------------------------------------------------

/**
 * GL4 symplectic integrator on the canonical (x, p) geodesic Hamiltonian.
 *
 *   H(x, p) = ½ g^{μν}(x) p_μ p_ν
 *
 * Drives the implicit Picard stage solver (`solveGL4Stage`) for each step,
 * with **adaptive step-halving on Picard non-convergence** (Adam+Eve I4,
 * replaces the single-retry R8): if Picard fails at step size h, retry at
 * h/2, h/4, … down to `hMin` (default `h · 1e-9`); throw
 * `GL4ConvergenceError` with a diagnostic message only when h_min is also
 * exhausted.
 *
 * Symplecticity (preservation of ω = dp_μ ∧ dx^μ) is a property of the
 * Butcher tableau, not of the inner Picard solver — see Sanz-Serna 1988,
 * Hairer/Lubich/Wanner §II.1. Hamiltonian drift over long integrations is
 * bounded; for non-resonant systems it remains O(h^p) over exponentially
 * long times (`p = 4` for GL4).
 *
 * **Domain guard.** If `domainMinRadius` is provided and `initialState.x[1]`
 * (radial coordinate) is below the bound, throws `NumericalBackendError`
 * synchronously with a `/domain/i`-matching message. The mid-trajectory
 * domain crossing is not checked here — callers needing that supply a
 * `gInverseFn` that throws on out-of-domain input.
 *
 * **Units.** The integrator is metric-agnostic — units follow the units of
 * the supplied `gInverseFn` and `initialState`. For UPT's canonical SI
 * Schwarzschild applications (BE-37 Shapiro delay, BE-52 Mercury):
 *   - `initialState.x` — `(t, r, θ, φ)` in **(s, m, rad, rad)** (SI).
 *   - `initialState.p` — covariant 4-momentum `p_μ = g_μν v^ν` in
 *     **(J·s, kg·m, kg·m², kg·m²)** under the affine normalization
 *     `p_t = −c²` used by `evaluateBE37CovariantEikonalNumerical`.
 *   - `tauMax` — affine-parameter (proper-time for timelike, coordinate-
 *     time-like for the null normalization) extent in **seconds** under
 *     the BE-37 convention; **dimensionless** if the caller chose
 *     geometric units. The integrator does not enforce a choice.
 *   - `domainMinRadius` — radial coordinate lower bound in the same length
 *     units as `initialState.x[1]` (typically **metres** for SI).
 *
 * @param initialState — canonical (x, p) at τ = 0. Units follow the
 *   `gInverseFn` convention (see above).
 * @param options — see {@link GL4Options}:
 *   - `steps` — integer step count (dimensionless).
 *   - `tauMax` — affine-parameter extent (seconds in canonical SI).
 *   - `gInverseFn(x)[μ][ν]` — inverse metric g^{μν}(x).
 *   - `dgInverseFn(x)[λ][μ][ν]` — ∂_λ g^{μν}(x).
 *   - `picardTol` — convergence tolerance (dimensionless, default 1e-12).
 *   - `picardMaxIter` — fixed-point iteration cap (dimensionless, default 50).
 *   - `hMin` — step-halving floor (same units as `tauMax / steps`).
 *   - `domainMinRadius` — radial cutoff (same units as `initialState.x[1]`).
 * @returns `steps + 1` snapshots: index `0` is the initial state, index `n`
 *   is the state after `n` steps (τ = n · h). Each snapshot carries `tau`,
 *   `x`, `p` (and optional `v` = g^{μν} p_ν) in the units chosen above.
 * @throws NumericalBackendError if `initialState.x[1] < domainMinRadius`.
 * @throws GL4ConvergenceError if Picard fails even after step-halving to h_min.
 *
 * @public
 */
export function integrateGeodesicGL4(
  initialState: GL4State,
  options: GL4Options,
): readonly GL4Snapshot[] {
  const {
    steps,
    tauMax,
    gInverseFn,
    dgInverseFn,
    picardTol = 1e-12,
    picardMaxIter = 50,
    hMin,
    domainMinRadius,
    onStep,
  } = options;

  if (domainMinRadius !== undefined && initialState.x[1] < domainMinRadius) {
    throw new NumericalBackendError(
      `GL4 integrator: initial r=${initialState.x[1]} < domainMinRadius=${domainMinRadius} (domain violation)`,
    );
  }

  const h = tauMax / steps;
  const hFloor = hMin ?? h * 1e-9;
  const snapshots: GL4Snapshot[] = [
    { tau: 0, x: initialState.x.slice() as number[], p: initialState.p.slice() as number[] },
  ];
  let x = initialState.x.slice() as number[];
  let p = initialState.p.slice() as number[];

  for (let n = 0; n < steps; n++) {
    // I4: adaptive step-halving loop (not single-retry) on Picard
    // non-convergence. When the full step fails, we advance by the SMALLER
    // converging step and sub-step until the macro-step `h` is covered — the
    // stages are solved at `stepH`, so the state/τ update MUST use `stepH`
    // too (advancing by full `h` after a halved solve destroys accuracy and
    // symplecticity). τ is reported on the fixed `(n+1)·h` grid; only the
    // residual-to-cover accumulator tracks intra-step progress.
    let remaining = h;
    let stepH = h;
    let halvings = 0;
    let lastIterations = 0;
    // Guard against FP residue: treat anything below a tiny fraction of h as done.
    const remainEps = h * 1e-12;
    while (remaining > remainEps) {
      const trialH = Math.min(stepH, remaining);
      let stages: StageSolveResult | undefined;
      let stepSucceeded = false;
      let subH = trialH;
      while (subH >= hFloor) {
        try {
          stages = solveGL4Stage({ x, p }, subH, gInverseFn, dgInverseFn, {
            picardTol,
            picardMaxIter,
          });
          stepSucceeded = true;
          break;
        } catch {
          subH /= 2;
          halvings++;
        }
      }
      if (!stepSucceeded || stages === undefined) {
        throw new GL4ConvergenceError(
          `GL4 integrator: Picard iteration did not converge even at h_min=${hFloor} (step ${n}). Diagnose step-size or metric singularity.`,
        );
      }
      // State is cloned before modification. This avoids modifying the user-provided
      // initial state referenced from the first loop iterations, and ensures that
      // step-halving retries don't cumulatively corrupt `x` and `p`.
      const newX = x.slice();
      const newP = p.slice();

      // Update state using the converged derivatives from the Picard solver.
      // This algebraically factors out redundant closures and tensor contractions.
      // Note: `stages.stageDp` does NOT have the -0.5 factor (see solveGL4Stage logic).
      const b0 = GL4_B[0];
      const b1 = GL4_B[1];
      const dim = newX.length;
      for (let mu = 0; mu < dim; mu++) {
        newX[mu] += subH * (b0 * stages.stageDx[0][mu] + b1 * stages.stageDx[1][mu]);
        newP[mu] += subH * (b0 * (-0.5 * stages.stageDp[0][mu]) + b1 * (-0.5 * stages.stageDp[1][mu]));
      }
      x = newX;
      p = newP;

      remaining -= subH;
      stepH = subH; // keep the converging size for the rest of this macro-step
      lastIterations = stages.iterations;
    }
    snapshots.push({ tau: (n + 1) * h, x: x.slice(), p: p.slice() });
    if (onStep !== undefined) {
      onStep({ step: n, iterations: lastIterations, halvings });
    }
  }

  return snapshots;
}
