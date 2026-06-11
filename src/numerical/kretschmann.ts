/**
 * Kretschmann scalar numerical contraction (v0.6.0 Phase 3, Task 3.6;
 * factored-raising optimization 2026-06-11).
 *
 * Computes K = R_{ρσμν} R^{ρσμν} from the fully-lowered Riemann tensor and
 * the inverse metric by raising all four indices on the second Riemann factor.
 *
 * **PERFORMANCE (2026-06-11 optimization)**: the original implementation
 * raised all four indices inside the contraction loop — O(4⁸) = 65536
 * inner products (~327k multiplications). The current implementation
 * factors the four-index raise into FOUR successive single-index raisings
 * (4 × 4⁵ = 4096 multiply-adds) plus one 256-term contraction — a ~70×
 * reduction in multiplications that is EXACT for arbitrary input (pure
 * reassociation of the sums; no Riemann-symmetry assumption). See the
 * algorithm notes inside {@link computeKretschmann}.
 *
 * @module numerical/kretschmann
 */

/**
 * Kretschmann invariant K = R_{ρσμν} R^{ρσμν}.
 *
 * Algorithm:
 *   1. Raise all four indices on the second Riemann factor:
 *      R^{ρσμν} = g^{ρα} g^{σβ} g^{μγ} g^{νδ} R_{αβγδ}
 *      — factored as four successive single-index raisings (see below).
 *   2. Contract:
 *      K = Σ_{ρσμν} R_{ρσμν} · R^{ρσμν}
 *
 * **Factored raising (exact, input-shape-agnostic).** The naive raise is a
 * rank-8 contraction, O(4⁸). Because the four metric factors each touch a
 * single Riemann index, the sum factors exactly:
 *
 *   T1^ρ_{βγδ}  = g^{ρα} R_{αβγδ}        (axis-0 raise, 4⁵ = 1024 mult-adds)
 *   T2^{ρσ}_{γδ} = g^{σβ} T1^ρ_{βγδ}     (axis-1 raise, 1024)
 *   T3^{ρσμ}_δ  = g^{μγ} T2^{ρσ}_{γδ}    (axis-2 raise, 1024)
 *   R^{ρσμν}    = g^{νδ} T3^{ρσμ}_δ      (axis-3 raise, 1024)
 *
 * This is a pure reassociation of the quadruple sum — mathematically
 * identical for ARBITRARY (even non-antisymmetric) `riemannLower` input,
 * which matters because the FD-built Riemann is only approximately
 * antisymmetric.
 *
 * **Rejected alternative — symmetry pair-iteration.** Under EXACT Riemann
 * antisymmetry (R_{ρσμν} = −R_{σρμν} = −R_{ρσνμ}) all components with
 * ρ = σ or μ = ν vanish and the survivors come in sign-pairs, so the
 * contraction collapses to the 6×6 independent index PAIRS:
 *
 *   K = 4 · Σ_{ρ<σ} Σ_{μ<ν} R_{ρσμν} R^{ρσμν}
 *
 * (each unordered pair contributes 4 ordered combinations whose sign
 * factors square away: (−1)·(−1) = +1). That formula is NOT identical to
 * the full sum for arbitrary input — the FD pipeline produces small
 * antisymmetry violations — so it was rejected in favour of the factored
 * raise, which needs no input-symmetry assumption.
 *
 * @param riemannLower - R_{ρσμν}: all-lower Riemann tensor, shape [4][4][4][4].
 *   Obtain by lowering R^ρ_{σμν} via g_{ρα}: R_{αβγδ} = g_{αρ} R^ρ_{βγδ}.
 * @param metricInverse - g^{αβ}: inverse metric. Either nested `number[][]`
 *   (shape [4][4]) or row-major `Float64Array(16)` with `flat[mu*4 + nu]`
 *   (the v0.9.0 fixture layout). Normalized ONCE at entry — O-4 widening,
 *   non-breaking for existing nested callers.
 * @returns K, a scalar. Dimension [L⁻⁴] (Riemann is [L⁻²] per F8/I3 convention).
 *
 * @example
 * ```typescript
 * import { computeKretschmann, G_SI, C_SI } from 'universal-physics-tensor';
 * import {
 *   schwarzschildGFn,
 *   schwarzschildGInverseFn,
 *   schwarzschildRs,
 * } from '../tests/fixtures/schwarzschild.js';
 * import { riemannLowerAt } from '../src/numerical/curvature-lowering-helpers.js';
 * import { Float64ReferenceEngine } from '../src/numerical/float64-engine.js';
 *
 * const M = 1.989e30;
 * const r_s = schwarzschildRs(M);
 * const r = 5 * r_s;
 * const x: [number, number, number, number] = [0, r, Math.PI / 2, 0];
 *
 * const engine = new Float64ReferenceEngine();
 * const rLower = riemannLowerAt(x, schwarzschildGFn(M), schwarzschildGInverseFn(M), 4, engine);
 * const gInv = schwarzschildGInverseFn(M)(x); // Float64Array(16) — accepted directly
 * const K = computeKretschmann(rLower, gInv);
 *
 * // Schwarzschild closed-form: K = 48 G² M² / (c⁴ r⁶)
 * const K_analytic = 48 * G_SI**2 * M**2 / (C_SI**4 * r**6);
 * // |K - K_analytic| / K_analytic < 1e-4
 * ```
 *
 * @public
 */
export function computeKretschmann(
  riemannLower: number[][][][],
  metricInverse: number[][] | Float64Array,
): number {
  // O-4: normalize the inverse metric ONCE at entry to row-major flat
  // g[mu*4 + nu]. Float64Array inputs pass through without copying.
  let gInv: Float64Array;
  if (metricInverse instanceof Float64Array) {
    gInv = metricInverse;
  } else {
    gInv = new Float64Array(16);
    for (let mu = 0; mu < 4; mu++) {
      for (let nu = 0; nu < 4; nu++) {
        gInv[mu * 4 + nu] = metricInverse[mu][nu];
      }
    }
  }

  // Flatten R_{αβγδ} once to row-major strides [64, 16, 4, 1].
  const R = new Float64Array(256);
  for (let a = 0; a < 4; a++) {
    const Ra = riemannLower[a];
    for (let b = 0; b < 4; b++) {
      const Rab = Ra[b];
      for (let c = 0; c < 4; c++) {
        const Rabc = Rab[c];
        const base = a * 64 + b * 16 + c * 4;
        R[base] = Rabc[0];
        R[base + 1] = Rabc[1];
        R[base + 2] = Rabc[2];
        R[base + 3] = Rabc[3];
      }
    }
  }

  // Four successive single-index raisings (each 4⁵ = 1024 mult-adds).
  // Axis-0 raise: T1[ρ,β,γ,δ] = Σ_α g^{ρα} R[α,β,γ,δ]
  const T1 = new Float64Array(256);
  for (let rho = 0; rho < 4; rho++) {
    for (let rest = 0; rest < 64; rest++) {
      let s = 0;
      for (let a = 0; a < 4; a++) {
        s += gInv[rho * 4 + a] * R[a * 64 + rest];
      }
      T1[rho * 64 + rest] = s;
    }
  }

  // Axis-1 raise: T2[ρ,σ,γ,δ] = Σ_β g^{σβ} T1[ρ,β,γ,δ]
  const T2 = new Float64Array(256);
  for (let rho = 0; rho < 4; rho++) {
    for (let sigma = 0; sigma < 4; sigma++) {
      for (let rest = 0; rest < 16; rest++) {
        let s = 0;
        for (let b = 0; b < 4; b++) {
          s += gInv[sigma * 4 + b] * T1[rho * 64 + b * 16 + rest];
        }
        T2[rho * 64 + sigma * 16 + rest] = s;
      }
    }
  }

  // Axis-2 raise: T3[ρ,σ,μ,δ] = Σ_γ g^{μγ} T2[ρ,σ,γ,δ]
  const T3 = new Float64Array(256);
  for (let head = 0; head < 16; head++) {
    for (let mu = 0; mu < 4; mu++) {
      for (let d = 0; d < 4; d++) {
        let s = 0;
        for (let c = 0; c < 4; c++) {
          s += gInv[mu * 4 + c] * T2[head * 16 + c * 4 + d];
        }
        T3[head * 16 + mu * 4 + d] = s;
      }
    }
  }

  // Axis-3 raise fused with the final contraction:
  //   R^{ρσμν} = Σ_δ g^{νδ} T3[ρ,σ,μ,δ];  K = Σ R_{ρσμν} R^{ρσμν}
  let K = 0;
  for (let head = 0; head < 64; head++) {
    for (let nu = 0; nu < 4; nu++) {
      let raised = 0;
      for (let d = 0; d < 4; d++) {
        raised += gInv[nu * 4 + d] * T3[head * 4 + d];
      }
      K += R[head * 4 + nu] * raised;
    }
  }
  return K;
}
