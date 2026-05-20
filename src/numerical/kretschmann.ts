/**
 * Kretschmann scalar numerical contraction (v0.6.0 Phase 3, Task 3.6).
 *
 * Computes K = R_{ρσμν} R^{ρσμν} from the fully-lowered Riemann tensor and
 * the inverse metric by raising all four indices on the second Riemann factor.
 *
 * **PERFORMANCE WARNING**: O(4⁸) = 65536 multiplications per call. Acceptable
 * for diagnostic / sample-point use, but DO NOT call inside tight integration
 * loops (10⁶ steps × 65k ops = ~6.5e10 ops). Future optimization (v0.7.0
 * candidate): exploit Riemann symmetries to reduce to ~20 independent
 * components × symmetric weighting; estimated speedup ~12×. Tracked in
 * v0.6.0 brainstorm carry-forward.
 *
 * @module numerical/kretschmann
 */

/**
 * Kretschmann invariant K = R_{ρσμν} R^{ρσμν}.
 *
 * Algorithm:
 *   1. Raise all four indices on the second Riemann factor:
 *      R^{ρσμν} = g^{ρα} g^{σβ} g^{μγ} g^{νδ} R_{αβγδ}
 *   2. Contract:
 *      K = Σ_{ρσμν} R_{ρσμν} · R^{ρσμν}
 *
 * The outer sum has 4⁴ = 256 terms; each inner raise requires 4⁴ = 256
 * metric products, giving the O(4⁸) = 65536 total multiplications.
 *
 * @param riemannLower - R_{ρσμν}: all-lower Riemann tensor, shape [4][4][4][4].
 *   Obtain by lowering R^ρ_{σμν} via g_{ρα}: R_{αβγδ} = g_{αρ} R^ρ_{βγδ}.
 * @param metricInverse - g^{αβ}: inverse metric, shape [4][4].
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
 * const gInv = schwarzschildGInverseFn(M)(x);
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
  metricInverse: number[][],
): number {
  // Raise: R^{ρσμν} = g^{ρα} g^{σβ} g^{μγ} g^{νδ} R_{αβγδ}
  // Then K = R_{ρσμν} R^{ρσμν} (sum over all 4⁴ = 256 components)
  let K = 0;
  for (let rho = 0; rho < 4; rho++) {
    for (let sigma = 0; sigma < 4; sigma++) {
      for (let mu = 0; mu < 4; mu++) {
        for (let nu = 0; nu < 4; nu++) {
          let raised = 0;
          for (let a = 0; a < 4; a++) {
            for (let b = 0; b < 4; b++) {
              for (let c = 0; c < 4; c++) {
                for (let d = 0; d < 4; d++) {
                  raised += metricInverse[rho][a] * metricInverse[sigma][b]
                          * metricInverse[mu][c] * metricInverse[nu][d]
                          * riemannLower[a][b][c][d];
                }
              }
            }
          }
          K += riemannLower[rho][sigma][mu][nu] * raised;
        }
      }
    }
  }
  return K;
}
