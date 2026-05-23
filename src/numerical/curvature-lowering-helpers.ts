/**
 * Numerical helpers for Riemann-curvature lowering (Task 6 [U] / v0.5.0 1c-ii).
 *
 * Mirrors `connection-lowering-helpers.ts`: produces Γ and ∂Γ tensors from
 * coordinate-dependent metric closures, then assembles the Riemann tensor via
 * the corrected (Carroll-Ch.3 §3.4 / Adam+Eve F4-S3) formula:
 *
 *   R^ρ_{σμν} = ∂_μ Γ^ρ_{σν} − ∂_ν Γ^ρ_{σμ} + Σ_λ (Γ^ρ_{λμ} Γ^λ_{σν} − Γ^ρ_{λν} Γ^λ_{σμ})
 *
 * Index conventions (pinned via JSDoc + a runtime assert):
 *   - Γ[ρ][σ][ν] = Γ^ρ_{σν}  (matches computeChristoffelTensor's [α][μ][ν] with
 *     σ ↔ μ — i.e., the SECOND axis is σ, the THIRD is ν, per Carroll Ch.5).
 *   - dGamma[λ][ρ][σ][ν] = ∂_λ Γ^ρ_{σν}     (I3)
 *   - R[ρ][σ][μ][ν] = R^ρ_{σμν}              (Carroll)
 *
 * NOTE on the σ/μ swap vs `computeChristoffelTensor`:
 *   `computeChristoffelTensor` was authored for v0.4.0 covariant-derivative
 *   lowering, which sums Γ^α_{μλ} T^λ over the middle index `μ` (the wrt index
 *   of the cov-deriv). v0.5.0 Riemann needs σ in the SECOND-lower slot of every
 *   Γ. Because Γ is symmetric in its two lower indices (Christoffel symmetry),
 *   the two storage conventions are numerically identical — we use the
 *   existing [α][middle][last] storage and access it with σ in the middle slot.
 *
 * The fast path uses the v0.4.0 `computeChristoffelTensor` infrastructure
 * (no new tensor-engine code) and the v0.4.0 `pderivNumericalFn` pattern
 * (centered finite differences). M11: ∂Γ is computed by repeated centered
 * finite-differences on `christoffel()`, not a new AST node type or AD pass.
 *
 * @module numerical/curvature-lowering-helpers
 */

import type { EngineTensor, TensorEngine } from './tensor-engine.js';
import type { NestedArray, NumericalInputs } from './types.js';
import { NumericalBackendError } from './errors.js';
import { computeChristoffelTensor, flattenNA } from './connection-lowering-helpers.js';
import { pderivNumericalFn } from './pderiv.js';
import type { BianchiResidualNode } from '../dimensional/curvature.js';
import type { WeylTensorNode } from '../dimensional/weyl-validators.js';
import { computeWeylTensor } from './weyl-lowering.js';

/** A coordinate-dependent rank-2 closure: f(x) → N×N as a NestedArray
 *  (number[][] or any nested form that `flattenNA` can flatten). */
export type MetricFn = (x: ReadonlyArray<number>) => NestedArray;

/**
 * dGamma[λ][ρ][σ][ν] = ∂_λ Γ^ρ_{σν} at the given coordinates (I3).
 *
 * 4-deep nested number array — readonly to mark this as an output container
 * the helper produces but does not mutate after construction.
 *
 * v0.6.1: dropped `export` — file-internal only (used by `dGammaAt` +
 * `buildRiemann` + `riemannLowerAt`).
 */
type DGammaTensor = readonly (readonly (readonly (readonly number[])[])[])[];

/** Gamma[ρ][σ][ν] = Γ^ρ_{σν} — same index order as `computeChristoffelTensor`
 *  output (just renamed for the Riemann use).
 *  v0.6.1: dropped `export` — file-internal only. */
type GammaTensor = readonly (readonly (readonly number[])[])[];

// ---------------------------------------------------------------------------
// Finite-difference step
// ---------------------------------------------------------------------------

/**
 * Step size for finite differences on the Christoffel function.
 *
 * Inner step (∂g for one Γ evaluation) uses the v0.4.0 default
 * `1e-6·max(|x|,1)` via `pderivNumericalFn`-style centered FD. This gives ∂g
 * with relative precision ≈ 1e-11 on Schwarzschild components (verified by
 * inspection at r=3·r_s).
 *
 * Outer step (∂Γ for one R evaluation) is `1e-4·max(|x|,1)` and we use a
 * **4th-order centered stencil**:
 *
 *   f'(x) ≈ [−f(x+2h) + 8 f(x+h) − 8 f(x-h) + f(x-2h)] / (12 h)
 *
 * Truncation O(h⁴) instead of O(h²). At h=0.886 m (r=3·r_s, M=M_sun),
 * truncation ≈ h⁴·Γ⁽⁵⁾/Γ ~ 1e-13 relative, round-off ε·|Γ|/h ~ 1e-15 relative.
 * Both sit well below the 1e-9 gate.
 *
 * The 2nd-order outer FD that v0.4.0 covariant-derivative lowering uses
 * leaves ~3e-6 relative error on R^t_{rtr} due to noise propagation through
 * the c²-scaled g_{tt} component — 4th-order outer FD recovers the precision.
 */
function outerStep(x: number): number {
  return 1e-4 * Math.max(Math.abs(x), 1);
}

/**
 * Build a flat ∂_μ g sampler around point x using a **4th-order centered
 * stencil**:
 *
 *   ∂_μ g ≈ [−g(x+2h) + 8 g(x+h) − 8 g(x−h) + g(x−2h)] / (12 h)
 *
 * Returned function matches the `getMetricDeriv` signature expected by
 * `computeChristoffelTensor`.
 *
 * Inner step `h_i = 1e-3·max(|x|,1)` is intentionally LARGER than the v0.4.0
 * 1e-6 default to compensate for the c²·g_{tt} ~ 6e16 cancellation noise: a
 * 4th-order stencil at h_i ≈ 8.86 m around r=3·r_s gives truncation
 * O(h_i⁴·g⁽⁵⁾) ~ 1e-13 relative on each ∂g component while keeping round-off
 * ε|g|/h_i ~ 1e-15 relative — orders below the 1e-9 component-match gate.
 */
function makeInnerGradFn(
  gFn: MetricFn,
  x0: ReadonlyArray<number>,
  N: number,
): (mu: number) => number[] {
  // v0.5.1 PD-7: delegates to the shared `pderivNumericalFn(..., {order: 4})`
  // 4th-order centered stencil. The explicit `h = 1e-3·max(|x|,1)` override
  // is load-bearing: the c²·g_{tt} cancellation noise on Schwarzschild
  // demands a larger step than the v0.5.0-default 1e-4 to balance truncation
  // vs round-off at the ≤1e-9 component-match gate. (See module JSDoc.)
  return (mu: number): number[] => {
    const xc = x0[mu];
    const h = 1e-3 * Math.max(Math.abs(xc), 1);
    const d = pderivNumericalFn(gFn, x0, mu, { order: 4, h });
    const flat = Array.isArray(d) ? (d as number[]) : [d as number];
    if (flat.length !== N * N) {
      throw new NumericalBackendError(
        `curvature-lowering: metric closure returned wrong shape — expected ${N * N}, ` +
        `got ${flat.length}`,
      );
    }
    return flat;
  };
}

/**
 * Compute Γ^ρ_{σν} at coordinate x. Internally builds a centered-FD ∂g sampler
 * around x and delegates to `computeChristoffelTensor` (the v0.4.0 helper).
 *
 * Returns a fully-materialised 3-deep nested array Γ[ρ][σ][ν]. (We do NOT keep
 * the EngineTensor wrapper because we immediately rebuild dGamma and R as
 * plain nested arrays — round-tripping through the engine on every FD sample
 * would dominate the cost.)
 */
export function christoffelAt(
  x: ReadonlyArray<number>,
  gFn: MetricFn,
  gInverseFn: MetricFn,
  N: number,
  engine: TensorEngine,
): number[][][] {
  const gInvFlat = flattenNA(gInverseFn(x));
  if (gInvFlat.length !== N * N) {
    throw new NumericalBackendError(
      `curvature-lowering: gInverseFn returned wrong shape — expected ${N * N}, got ${gInvFlat.length}`,
    );
  }
  const gradFn = makeInnerGradFn(gFn, x, N);
  const tensor = computeChristoffelTensor(gInvFlat, gradFn, N, engine);
  const nested = engine.toNested(tensor) as NestedArray;
  engine.dispose?.(tensor);

  // Cast to the expected nested shape; computeChristoffelTensor produces
  // shape [N,N,N] so this is structurally [ρ][middle][last]. We treat
  // [middle] as σ and [last] as ν (Christoffel symmetry makes the two
  // lower-slot conventions numerically interchangeable).
  return nested as number[][][];
}

/**
 * dGamma[λ][ρ][σ][ν] = ∂_λ Γ^ρ_{σν} via centered FD on `christoffelAt`. (I3)
 *
 * Includes a runtime index-assert verifying `dGamma[1][1][1][1]` is finite
 * before returning (catches silent shape-permutation bugs introduced by future
 * edits to `computeChristoffelTensor`'s output ordering).
 */
export function dGammaAt(
  x: ReadonlyArray<number>,
  gFn: MetricFn,
  gInverseFn: MetricFn,
  N: number,
  engine: TensorEngine,
): DGammaTensor {
  // Allocate dGamma[λ][ρ][σ][ν]
  const dGamma: number[][][][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () =>
      Array.from({ length: N }, () => new Array<number>(N).fill(0)),
    ),
  );

  // v0.5.1 PD-7: 4th-order centered stencil via the shared
  // `pderivNumericalFn(..., {order: 4})` (h = 1e-4·max(|x|,1) default matches
  // the v0.5.0 `outerStep`). Each axis returns a flat number[] of length N³;
  // unflatten into the `dGamma[λ][ρ][σ][ν]` axis-0 slab.
  const christFn = (xs: ReadonlyArray<number>): NestedArray =>
    christoffelAt(xs, gFn, gInverseFn, N, engine);
  for (let lam = 0; lam < N; lam++) {
    const d = pderivNumericalFn(christFn, x, lam, { order: 4 });
    const flat = Array.isArray(d) ? (d as number[]) : [d as number];
    if (flat.length !== N * N * N) {
      throw new NumericalBackendError(
        `dGammaAt: christoffelAt derivative shape mismatch — expected ${N * N * N}, got ${flat.length}`,
      );
    }
    const N2 = N * N;
    for (let rho = 0; rho < N; rho++) {
      for (let sigma = 0; sigma < N; sigma++) {
        for (let nu = 0; nu < N; nu++) {
          dGamma[lam][rho][sigma][nu] = flat[rho * N2 + sigma * N + nu];
        }
      }
    }
  }

  // I3 runtime index-assert: verify the container is populated as expected.
  // dGamma[1][1][1][1] is ∂_r Γ^r_{rr} for Schwarzschild — a non-trivial real
  // number, so a `Number.isFinite` check catches both shape regressions and
  // numerical blow-ups.
  const probe = dGamma[1]?.[1]?.[1]?.[1];
  if (typeof probe !== 'number' || !Number.isFinite(probe)) {
    throw new NumericalBackendError(
      `curvature-lowering: dGamma index-assert failed — dGamma[1][1][1][1] is ` +
      `${probe} (expected finite number). Shape regression in christoffelAt?`,
    );
  }

  return dGamma as DGammaTensor;
}

/**
 * Build the full 4×4×4×4 Riemann tensor R^ρ_{σμν} from Γ and ∂Γ per the
 * Carroll formula (Adam+Eve F4-S3):
 *
 *   R[ρ][σ][μ][ν] = ∂_μ Γ[ρ][σ][ν] − ∂_ν Γ[ρ][σ][μ]
 *                 + Σ_λ (Γ[ρ][λ][μ] Γ[λ][σ][ν] − Γ[ρ][λ][ν] Γ[λ][σ][μ])
 *
 * σ in the SECOND lower slot of each Γ (F4/S3 correction).
 */
export function buildRiemann(
  gamma: GammaTensor,
  dGamma: DGammaTensor,
  N: number,
): number[][][][] {
  const R: number[][][][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () =>
      Array.from({ length: N }, () => new Array<number>(N).fill(0)),
    ),
  );

  for (let rho = 0; rho < N; rho++) {
    for (let sigma = 0; sigma < N; sigma++) {
      for (let mu = 0; mu < N; mu++) {
        for (let nu = 0; nu < N; nu++) {
          // ∂_μ Γ^ρ_{σν} − ∂_ν Γ^ρ_{σμ}
          let value = dGamma[mu][rho][sigma][nu] - dGamma[nu][rho][sigma][mu];
          // Σ_λ (Γ^ρ_{λμ} Γ^λ_{σν} − Γ^ρ_{λν} Γ^λ_{σμ})
          for (let lam = 0; lam < N; lam++) {
            value += gamma[rho][lam][mu] * gamma[lam][sigma][nu]
                  -  gamma[rho][lam][nu] * gamma[lam][sigma][mu];
          }
          R[rho][sigma][mu][nu] = value;
        }
      }
    }
  }

  return R;
}

// ---------------------------------------------------------------------------
// v0.5.0 Task 9: helpers for bianchiResidual()
// ---------------------------------------------------------------------------

/**
 * Compute the upper-Riemann tensor R^ρ_{σμν} at coordinate x using the same
 * Γ + ∂Γ pipeline as the riemann-tensor lowering case. Encapsulates the
 * full christoffelAt + dGammaAt + buildRiemann sequence so callers (Task 9
 * Bianchi residual) can sample R at perturbed coordinates without
 * re-implementing the FD machinery.
 */
function riemannUpperAt(
  x: ReadonlyArray<number>,
  gFn: MetricFn,
  gInverseFn: MetricFn,
  N: number,
  engine: TensorEngine,
): number[][][][] {
  const gamma = christoffelAt(x, gFn, gInverseFn, N, engine);
  const dGamma = dGammaAt(x, gFn, gInverseFn, N, engine);
  return buildRiemann(gamma, dGamma, N);
}

/**
 * Lower the upper-ρ index of R^ρ_{σμν} via the covariant metric g_{aρ}:
 *
 *   R_{aσμν} = Σ_ρ g_{aρ} R^ρ_{σμν}
 *
 * Output index order: `[a][σ][μ][ν]` — all four lower. (a is the freshly
 * lowered index in the first slot.)
 */
function lowerFirstIndex(
  R: number[][][][],
  gLowerFlat: ReadonlyArray<number>,
  N: number,
): number[][][][] {
  const Rlow: number[][][][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () =>
      Array.from({ length: N }, () => new Array<number>(N).fill(0)),
    ),
  );
  for (let a = 0; a < N; a++) {
    for (let sig = 0; sig < N; sig++) {
      for (let mu = 0; mu < N; mu++) {
        for (let nu = 0; nu < N; nu++) {
          let sum = 0;
          for (let rho = 0; rho < N; rho++) {
            sum += gLowerFlat[a * N + rho] * R[rho][sig][mu][nu];
          }
          Rlow[a][sig][mu][nu] = sum;
        }
      }
    }
  }
  return Rlow;
}

/**
 * Sample the all-lower Riemann tensor R_{αβγδ}(x) — combines `riemannUpperAt`
 * with `lowerFirstIndex` for the single-coordinate evaluation. Used both as
 * the base sample and (with perturbed x) as the FD inputs for ∂_λ R_{αβγδ}.
 */
export function riemannLowerAt(
  x: ReadonlyArray<number>,
  gFn: MetricFn,
  gInverseFn: MetricFn,
  N: number,
  engine: TensorEngine,
): number[][][][] {
  const Rup = riemannUpperAt(x, gFn, gInverseFn, N, engine);
  const gFlat = flattenNA(gFn(x));
  if (gFlat.length !== N * N) {
    throw new NumericalBackendError(
      `bianchi-residual: gFn returned wrong shape — expected ${N * N}, got ${gFlat.length}`,
    );
  }
  return lowerFirstIndex(Rup, gFlat, N);
}

/**
 * Compute ∂_λ R_{αβγδ}(x) via a 4th-order centered stencil on
 * `riemannLowerAt`. Index order: `dR[λ][α][β][γ][δ] = ∂_λ R_{αβγδ}`.
 *
 * Uses the same outer step (`outerStep`) as Task 6's dGammaAt so the
 * FD-noise compounding pattern matches. This is one extra layer of FD on top
 * of the Christoffel-of-Christoffel double-FD already inside `riemannLowerAt`
 * — total: ∂(∂(∂g)) at 4th order in each layer. Empirical noise floor reached
 * by the per-component value is documented in the test report.
 */
function dRiemannLowerAt(
  x: ReadonlyArray<number>,
  gFn: MetricFn,
  gInverseFn: MetricFn,
  N: number,
  engine: TensorEngine,
): number[][][][][] {
  const dR: number[][][][][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () =>
      Array.from({ length: N }, () =>
        Array.from({ length: N }, () => new Array<number>(N).fill(0)),
      ),
    ),
  );

  // v0.5.1 PD-7: 4th-order centered stencil via the shared
  // `pderivNumericalFn(..., {order: 4})` — default h = 1e-4·max(|x|,1) matches
  // the v0.5.0 `outerStep`. Each axis call returns a flat number[] of length
  // N⁴ (riemannLowerAt produces [N,N,N,N]); unflatten into the
  // `dR[λ][a][b][c][d]` axis-0 slab.
  const RlowerFn = (xs: ReadonlyArray<number>): NestedArray =>
    riemannLowerAt(xs, gFn, gInverseFn, N, engine);
  const N2 = N * N;
  const N3 = N * N * N;
  for (let lam = 0; lam < N; lam++) {
    const flat = pderivNumericalFn(RlowerFn, x, lam, { order: 4 }) as number[];
    if (!Array.isArray(flat) || flat.length !== N2 * N2) {
      throw new NumericalBackendError(
        `dRiemannLowerAt: derivative shape mismatch — expected ${N2 * N2}, got ${
          Array.isArray(flat) ? flat.length : 'scalar'
        }`,
      );
    }
    for (let a = 0; a < N; a++) {
      for (let b = 0; b < N; b++) {
        for (let c = 0; c < N; c++) {
          for (let d = 0; d < N; d++) {
            dR[lam][a][b][c][d] = flat[a * N3 + b * N2 + c * N + d];
          }
        }
      }
    }
  }

  return dR;
}

/**
 * Compute ∇_λ R_{μνρσ} via partial + Christoffel-correction terms (Approach 1).
 *
 *   ∇_λ R_{μνρσ} = ∂_λ R_{μνρσ}
 *                  − Γ^α_{λμ} R_{ανρσ}
 *                  − Γ^α_{λν} R_{μαρσ}
 *                  − Γ^α_{λρ} R_{μνασ}
 *                  − Γ^α_{λσ} R_{μνρα}
 *
 * Index order: `covR[λ][μ][ν][ρ][σ] = ∇_λ R_{μνρσ}`.
 *
 * Approach choice (full ∇, not raw ∂): the second Bianchi identity
 * ∇_{[λ} R_{μν]ρσ} = 0 is the canonical statement. Using raw ∂ would give a
 * residual dominated by the (cyclic-non-cancelling) Christoffel-correction
 * terms, masking the identity check with O(1) algebraic clutter. Full ∇
 * makes the test a genuine self-consistency check of the lowered Riemann.
 */
export function covariantDerivRiemannLowerAt(
  x: ReadonlyArray<number>,
  gFn: MetricFn,
  gInverseFn: MetricFn,
  N: number,
  engine: TensorEngine,
): number[][][][][] {
  const gamma = christoffelAt(x, gFn, gInverseFn, N, engine);
  const R = riemannLowerAt(x, gFn, gInverseFn, N, engine);
  const dR = dRiemannLowerAt(x, gFn, gInverseFn, N, engine);

  const covR: number[][][][][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () =>
      Array.from({ length: N }, () =>
        Array.from({ length: N }, () => new Array<number>(N).fill(0)),
      ),
    ),
  );

  for (let lam = 0; lam < N; lam++) {
    for (let mu = 0; mu < N; mu++) {
      for (let nu = 0; nu < N; nu++) {
        for (let rho = 0; rho < N; rho++) {
          for (let sig = 0; sig < N; sig++) {
            let value = dR[lam][mu][nu][rho][sig];
            // Subtract Γ^α_{λμ} R_{ανρσ} (correction for the μ index)
            // Subtract Γ^α_{λν} R_{μαρσ} (correction for the ν index)
            // Subtract Γ^α_{λρ} R_{μνασ} (correction for the ρ index)
            // Subtract Γ^α_{λσ} R_{μνρα} (correction for the σ index)
            for (let a = 0; a < N; a++) {
              value -= gamma[a][lam][mu] * R[a][nu][rho][sig];
              value -= gamma[a][lam][nu] * R[mu][a][rho][sig];
              value -= gamma[a][lam][rho] * R[mu][nu][a][sig];
              value -= gamma[a][lam][sig] * R[mu][nu][rho][a];
            }
            covR[lam][mu][nu][rho][sig] = value;
          }
        }
      }
    }
  }

  return covR;
}

/**
 * Build the second-Bianchi-identity residual (cyclic over first three indices):
 *
 *   B_{λμνρσ} = ∇_λ R_{μνρσ} + ∇_μ R_{νλρσ} + ∇_ν R_{λμρσ}
 *
 * Carroll Eq. 3.95: B ≡ 0 in any (torsion-free) Lorentzian manifold. The
 * residual measures the FD-truncation + cancellation noise on the lowered
 * Riemann tensor through one extra ∂ layer.
 *
 * Index order: `B[λ][μ][ν][ρ][σ]` — all five lower.
 */
export function bianchiResidualAt(
  x: ReadonlyArray<number>,
  gFn: MetricFn,
  gInverseFn: MetricFn,
  N: number,
  engine: TensorEngine,
): number[][][][][] {
  const covR = covariantDerivRiemannLowerAt(x, gFn, gInverseFn, N, engine);

  const B: number[][][][][] = Array.from({ length: N }, () =>
    Array.from({ length: N }, () =>
      Array.from({ length: N }, () =>
        Array.from({ length: N }, () => new Array<number>(N).fill(0)),
      ),
    ),
  );

  for (let lam = 0; lam < N; lam++) {
    for (let mu = 0; mu < N; mu++) {
      for (let nu = 0; nu < N; nu++) {
        for (let rho = 0; rho < N; rho++) {
          for (let sig = 0; sig < N; sig++) {
            B[lam][mu][nu][rho][sig] =
              covR[lam][mu][nu][rho][sig]   // ∇_λ R_{μνρσ}
              + covR[mu][nu][lam][rho][sig] // ∇_μ R_{νλρσ}
              + covR[nu][lam][mu][rho][sig]; // ∇_ν R_{λμρσ}
          }
        }
      }
    }
  }

  return B;
}

/**
 * JS-side contraction of a flat 4-axis tensor R[a][b][c][d] (length N⁴, row-major)
 * down to a 2-tensor by summing one upper axis against one lower axis.
 *
 * Configuration:
 *   - `upperAxis`: the axis index (0..3) that contracts WITH `lowerAxis` (dummy slot).
 *   - `lowerAxis`: the partner axis (0..3) forming the dummy pair.
 *   - `outAxes`:   the two surviving axes [i, j] that become the (free output)
 *                  rows/cols of the returned N×N matrix.
 *
 * For Carroll Eq. 3.91 Ricci R_μν = R^λ_{μλν} on Riemann stored as R[ρ][σ][μ][ν]:
 *   contractRiemannJS(flatR, N, { upperAxis: 0, lowerAxis: 2, outAxes: [1, 3] })
 * sums `R[λ][μ_out][λ][ν_out]` over λ.
 *
 * Pre-flattened input convention: row-major `R[a][b][c][d] = flatR[a*N³ + b*N² + c*N + d]`.
 * (Matches `flattenNestedArray` output for an [N,N,N,N] EngineTensor.)
 *
 * @internal — extracted from `lowering.ts` ricci-tensor arm (AS-1, v0.5.1). Kept
 * deliberately narrow (4-axis source → 2-axis output) to match the v0.5.0 GR
 * curvature pipeline; generalisation deferred to v0.6.0 if Weyl/Kretschmann
 * arrives (see `docs/architecture/COMPONENTS.md` curvature-layer pattern note).
 */
export function contractRiemannJS(
  flatR: ReadonlyArray<number>,
  N: number,
  config: {
    upperAxis: 0 | 1 | 2 | 3;
    lowerAxis: 0 | 1 | 2 | 3;
    outAxes: readonly [number, number];
  },
): number[][] {
  const { upperAxis, lowerAxis, outAxes } = config;
  if (upperAxis === lowerAxis) {
    throw new NumericalBackendError(
      `contractRiemannJS: upperAxis (${upperAxis}) and lowerAxis (${lowerAxis}) must differ`,
    );
  }
  const [outA, outB] = outAxes;
  if (outA === outB) {
    throw new NumericalBackendError(
      `contractRiemannJS: outAxes [${outA},${outB}] must be distinct`,
    );
  }
  if (outA === upperAxis || outA === lowerAxis || outB === upperAxis || outB === lowerAxis) {
    throw new NumericalBackendError(
      `contractRiemannJS: outAxes [${outA},${outB}] must not overlap dummy pair [${upperAxis},${lowerAxis}]`,
    );
  }
  if (flatR.length !== N * N * N * N) {
    throw new NumericalBackendError(
      `contractRiemannJS: flatR length ${flatR.length} != N⁴ = ${N * N * N * N}`,
    );
  }

  // Row-major strides for R[a][b][c][d].
  const N2 = N * N;
  const N3 = N * N * N;
  const strides = [N3, N2, N, 1] as const;
  const strideDummy = strides[upperAxis] + strides[lowerAxis];
  const strideOutA = strides[outA];
  const strideOutB = strides[outB];

  const out: number[][] = Array.from({ length: N }, () => new Array<number>(N).fill(0));
  for (let i = 0; i < N; i++) {
    const baseI = i * strideOutA;
    for (let j = 0; j < N; j++) {
      const baseIJ = baseI + j * strideOutB;
      let sum = 0;
      for (let lam = 0; lam < N; lam++) {
        sum += flatR[baseIJ + lam * strideDummy];
      }
      out[i][j] = sum;
    }
  }
  return out;
}


// ===========================================================================
// v0.6.1 Phase 2 Proposal 2 — Arm extractions from lowering.ts
// ===========================================================================
//
// Two FD pipelines (`bianchi-residual` and `weyl-tensor`) were inlined as
// switch arms in `lowering.ts`'s `lowerCurvature` dispatcher. Each was a
// self-contained block of input-resolution + helper-pipeline + result-wrap
// boilerplate; together they accounted for ~125 LOC of lowering.ts. Moving
// them here (a) keeps the dispatcher readable, (b) co-locates the FD
// machinery with its consumers, and (c) makes the per-arm pipeline
// independently unit-testable in the future.

/** Resolve `inputs.dimension ?? 4`. Internal-only convenience for the arm helpers. */
function _dimensionOf(inputs: NumericalInputs): number {
  return inputs.dimension ?? 4;
}

/** Look up a named tensor's concrete value, or throw. Internal-only. */
function _requireValue(name: string, inputs: NumericalInputs): NestedArray {
  const v = inputs.tensors.get(name);
  if (v === undefined) {
    throw new NumericalBackendError(`curvature-lowering: no value supplied for "${name}" in inputs.tensors`);
  }
  return v;
}

/** Flatten + size-check (delegates to `flattenNA`). Internal-only. */
function _flattenNestedArray(data: NestedArray, expectedSize: number): number[] {
  const out = flattenNA(data);
  if (out.length !== expectedSize) {
    throw new NumericalBackendError(
      `curvature-lowering: flatten got ${out.length} elements, expected ${expectedSize}`,
    );
  }
  return out;
}

/**
 * Lower a `bianchi-residual` AST node to a 5-rank EngineTensor B_{λμνρσ}.
 *
 * Extracted from `lowering.ts` `lowerCurvature` switch arm in v0.6.1 Phase 2.
 * Wires `inputs.tensors[xCoord.name]` (the coordinate vector) and
 * `inputs.fields[gLower.name]` / `inputs.fields[gInverse.name]` (the metric
 * closures) into the existing `bianchiResidualAt` FD helper.
 *
 * Approach (cyclic ∇R sum):
 *   B_{λμνρσ} = ∇_λ R_{μνρσ} + ∇_μ R_{νλρσ} + ∇_ν R_{λμρσ}
 * Each ∇_λ R_{μνρσ} is computed with the four Christoffel-correction terms.
 *
 * @returns engine.fromNested(B, [N,N,N,N,N])
 */
export function lowerBianchiResidual(
  node: BianchiResidualNode,
  inputs: NumericalInputs,
  engine: TensorEngine,
): EngineTensor {
  const rNode = node.riemann;
  const N = _dimensionOf(inputs);
  const x = _flattenNestedArray(_requireValue(rNode.xCoord.name, inputs), N);
  const gFn = inputs.fields?.get(rNode.gLower.name) as MetricFn | undefined;
  const gInverseFn = inputs.fields?.get(rNode.gInverse.name) as MetricFn | undefined;
  if (!gFn || !gInverseFn) {
    throw new NumericalBackendError(
      `lowering: bianchi-residual numerical evaluation requires coordinate-` +
      `dependent metric closures in inputs.fields for "${rNode.gLower.name}" ` +
      `and "${rNode.gInverse.name}". ` +
      `Got fields=[${[...(inputs.fields?.keys() ?? [])].join(',')}].`,
    );
  }
  const B = bianchiResidualAt(x, gFn, gInverseFn, N, engine);
  return engine.fromNested(B as NestedArray, [N, N, N, N, N]);
}

/**
 * Lower a `weyl-tensor` AST node to a 4-rank EngineTensor C^ρ_{σμν}.
 *
 * Extracted from `lowering.ts` `lowerCurvature` switch arm in v0.6.1 Phase 2.
 * Implements the F-5 Weyl-formula pipeline:
 *
 *   1. Resolve `x`, `g`, `g_inv`, `g(x)`, `g_inv(x)` from `inputs`.
 *   2. Compute Riemann R^ρ_{σμν} via `christoffelAt` + `dGammaAt` + `buildRiemann`.
 *   3. Contract Ricci R_{μν} = R^λ_{μλν} via `contractRiemannJS`.
 *   4. Compute Ricci scalar R = Σ_{μν} g^{μν} R_{μν}.
 *   5. Assemble Weyl via `computeWeylTensor({...})` using the F-5 formula.
 *
 * Naming convention (must match the caller's inputs map):
 *   inputs.tensors[metricName]          — g_{μν} at x
 *   inputs.tensors[metricName + '_inv'] — g^{μν} at x
 *   inputs.tensors['x']                 — coordinate 4-vector
 *   inputs.fields[metricName]           — coordinate-dependent g closure
 *   inputs.fields[metricName + '_inv']  — coordinate-dependent g^{-1} closure
 *
 * @returns engine.fromNested(C, [N,N,N,N])
 */
export function lowerWeylTensor(
  node: WeylTensorNode,
  inputs: NumericalInputs,
  engine: TensorEngine,
): EngineTensor {
  const N = _dimensionOf(inputs);
  const metricName = node.metric.name;
  const metricInvName = `${metricName}_inv`;

  const x = _flattenNestedArray(_requireValue('x', inputs), N);
  const gFn = inputs.fields?.get(metricName) as MetricFn | undefined;
  const gInverseFn = inputs.fields?.get(metricInvName) as MetricFn | undefined;
  if (!gFn || !gInverseFn) {
    throw new NumericalBackendError(
      `lowering: weyl-tensor requires coordinate-dependent metric closures in ` +
      `inputs.fields for "${metricName}" and "${metricInvName}". ` +
      `Got fields=[${[...(inputs.fields?.keys() ?? [])].join(',')}].`,
    );
  }

  // Step 1-2: Riemann R^ρ_{σμν} via FD pipeline.
  const gamma = christoffelAt(x, gFn, gInverseFn, N, engine);
  const dGamma = dGammaAt(x, gFn, gInverseFn, N, engine);
  const Rup = buildRiemann(gamma, dGamma, N);

  // Step 3: Ricci R_{μν} = R^λ_{μλν} (Carroll Eq. 3.91).
  const flatRup = _flattenNestedArray(Rup as unknown as NestedArray, N * N * N * N);
  const Ric = contractRiemannJS(flatRup, N, {
    upperAxis: 0, lowerAxis: 2, outAxes: [1, 3],
  });

  // Step 4: Ricci scalar R = Σ_{μν} g^{μν} R_{μν}.
  const gInvFlat = _flattenNestedArray(_requireValue(metricInvName, inputs), N * N);
  let Rscalar = 0;
  for (let mu = 0; mu < N; mu++) {
    for (let nu = 0; nu < N; nu++) {
      Rscalar += gInvFlat[mu * N + nu] * Ric[mu][nu];
    }
  }

  // Step 5: point-sample of covariant metric + inverse, then assemble.
  const gFlat = _flattenNestedArray(_requireValue(metricName, inputs), N * N);
  const gMat: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (__, j) => gFlat[i * N + j]),
  );
  const gInvMat: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: N }, (__, j) => gInvFlat[i * N + j]),
  );

  const C = computeWeylTensor({
    riemann: Rup,
    ricci: Ric,
    ricciScalar: Rscalar,
    metric: gMat,
    metricInverse: gInvMat,
  });
  return engine.fromNested(C as NestedArray, [N, N, N, N]);
}
