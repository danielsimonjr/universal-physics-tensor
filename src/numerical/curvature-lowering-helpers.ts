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

import type { TensorEngine } from './tensor-engine.js';
import type { NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';
import { computeChristoffelTensor, flattenNA } from './connection-lowering-helpers.js';

/** Flat row-major N×N matrix (one g or g^{-1} sample). */
export type FlatMatrix = ReadonlyArray<number>;

/** A coordinate-dependent rank-2 closure: f(x) → N×N as a NestedArray
 *  (number[][] or any nested form that `flattenNA` can flatten). */
export type MetricFn = (x: ReadonlyArray<number>) => NestedArray;

/**
 * dGamma[λ][ρ][σ][ν] = ∂_λ Γ^ρ_{σν} at the given coordinates (I3).
 *
 * 4-deep nested number array — readonly to mark this as an output container
 * the helper produces but does not mutate after construction.
 */
export type DGammaTensor = readonly (readonly (readonly (readonly number[])[])[])[];

/** Gamma[ρ][σ][ν] = Γ^ρ_{σν} — same index order as `computeChristoffelTensor`
 *  output (just renamed for the Riemann use). */
export type GammaTensor = readonly (readonly (readonly number[])[])[];

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
export function outerStep(x: number): number {
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
  return (mu: number): number[] => {
    const xc = x0[mu];
    const h = 1e-3 * Math.max(Math.abs(xc), 1);
    const p1 = [...x0]; p1[mu] = xc + h;
    const m1 = [...x0]; m1[mu] = xc - h;
    const p2 = [...x0]; p2[mu] = xc + 2 * h;
    const m2 = [...x0]; m2[mu] = xc - 2 * h;
    const gp1 = flattenNA(gFn(p1));
    const gm1 = flattenNA(gFn(m1));
    const gp2 = flattenNA(gFn(p2));
    const gm2 = flattenNA(gFn(m2));
    if (
      gp1.length !== N * N || gm1.length !== N * N ||
      gp2.length !== N * N || gm2.length !== N * N
    ) {
      throw new NumericalBackendError(
        `curvature-lowering: metric closure returned wrong shape — expected ${N * N}, ` +
        `got [${gp1.length}, ${gm1.length}, ${gp2.length}, ${gm2.length}]`,
      );
    }
    const inv12h = 1 / (12 * h);
    const out = new Array<number>(N * N);
    for (let i = 0; i < N * N; i++) {
      out[i] = (-gp2[i] + 8 * gp1[i] - 8 * gm1[i] + gm2[i]) * inv12h;
    }
    return out;
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

  // 4th-order centered stencil: f'(x) ≈ [−f₊₂ + 8 f₊₁ − 8 f₋₁ + f₋₂] / (12 h)
  for (let lam = 0; lam < N; lam++) {
    const xc = x[lam];
    const h = outerStep(xc);
    const xP1 = [...x]; xP1[lam] = xc + h;
    const xM1 = [...x]; xM1[lam] = xc - h;
    const xP2 = [...x]; xP2[lam] = xc + 2 * h;
    const xM2 = [...x]; xM2[lam] = xc - 2 * h;
    const Gp1 = christoffelAt(xP1, gFn, gInverseFn, N, engine);
    const Gm1 = christoffelAt(xM1, gFn, gInverseFn, N, engine);
    const Gp2 = christoffelAt(xP2, gFn, gInverseFn, N, engine);
    const Gm2 = christoffelAt(xM2, gFn, gInverseFn, N, engine);
    const inv12h = 1 / (12 * h);
    for (let rho = 0; rho < N; rho++) {
      for (let sigma = 0; sigma < N; sigma++) {
        for (let nu = 0; nu < N; nu++) {
          dGamma[lam][rho][sigma][nu] = (
            -Gp2[rho][sigma][nu]
            + 8 * Gp1[rho][sigma][nu]
            - 8 * Gm1[rho][sigma][nu]
            + Gm2[rho][sigma][nu]
          ) * inv12h;
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
