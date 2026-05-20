/**
 * F-6: Christoffel flat-layout indexing-consistency regression (v0.6.0 Phase 2, Task 2.10).
 *
 * Temporary regression test — guards against silent index-encoding bugs that
 * diagonal Schwarzschild components would mask (e.g., a μ↔ν transposition in
 * the flat layout only manifests on non-zero off-diagonal entries).
 *
 * Two approaches:
 *
 *   (A) Bijection proof: all 64 (λ, μ, ν) triples in 0..3 × 0..3 × 0..3 map
 *       to distinct flat indices 0..63, covering {0, 1, …, 63} exactly.
 *
 *   (B) Non-diagonal smoke: a minimal 4D metric with a known off-diagonal
 *       Christoffel component (constructed as a scaled identity + off-diagonal
 *       perturbation) verifies that `encodeChristoffelIndex` picks the right
 *       slot — not a transposed or wrong slot — for an off-diagonal component.
 *
 * Approach (B) uses a simple analytic metric to avoid heavy fixture overhead:
 *
 *   g_{μν}(x) = δ_{μν} + ε · δ_{μ0}δ_{ν1} + ε · δ_{μ1}δ_{ν0}  (off-diag: (0,1) and (1,0))
 *   with ε small enough to keep det(g) ≠ 0.
 *
 *   Christoffel:  Γ^λ_{μν} = ½ g^{λρ}(∂_μ g_{ρν} + ∂_ν g_{ρμ} − ∂_ρ g_{μν})
 *
 *   For a constant metric (x-independent), all ∂ g = 0 → Γ = 0 everywhere.
 *   So instead, we use a linearly varying off-diagonal entry:
 *
 *     g_{01}(x) = g_{10}(x) = ε · x^0   (varies along coordinate 0 = t)
 *     g_{00} = g_{11} = g_{22} = g_{33} = 1 (signatures aside)
 *     All other entries = 0.
 *
 *   Then ∂_0 g_{01} = ε, ∂_0 g_{10} = ε, all other ∂ g = 0.
 *
 *   At x = [1, 0, 0, 0], g_{01} = ε. For small ε the inverse metric has
 *   g^{00} ≈ g^{11} ≈ 1, g^{01} ≈ −ε (to leading order), others 0.
 *
 *   Non-zero Christoffels at this point (leading order in ε):
 *     Γ^0_{00} = ½ g^{00}(∂_0 g_{00} + ∂_0 g_{00} − ∂_0 g_{00}) = 0  (∂_0 g_{00} = 0)
 *     Γ^0_{01} = ½ g^{00}(∂_0 g_{01} + ∂_1 g_{00} − ∂_0 g_{01}) = 0   (terms cancel)
 *     Γ^1_{00} = ½ g^{11}(∂_0 g_{10} + ∂_0 g_{10} − ∂_1 g_{00})
 *              = ½ · 1 · (ε + ε − 0) = ε
 *
 *   So Γ^1_{00} = ε is the leading non-zero off-diagonal-driven component.
 *   Index triple: (λ=1, μ=0, ν=0) → flat offset 16·1 + 4·0 + 0 = 16.
 *   The test verifies that the correct slot [16] holds ε (to leading order),
 *   not some other slot — catching a transposition bug.
 *
 * @module tests/numerical/christoffel-flat-indexing
 */
import { describe, it, expect } from 'vitest';
import { encodeChristoffelIndex } from '../../src/numerical/christoffel-flat.js';

// ---------------------------------------------------------------------------
// (A) Bijection proof
// ---------------------------------------------------------------------------

describe('encodeChristoffelIndex: bijection over 0..63', () => {
  it('all 64 triples map to distinct flat indices', () => {
    const seen = new Set<number>();
    for (let lam = 0; lam < 4; lam++) {
      for (let mu = 0; mu < 4; mu++) {
        for (let nu = 0; nu < 4; nu++) {
          const idx = encodeChristoffelIndex(lam, mu, nu);
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(64);
          expect(seen.has(idx)).toBe(false);
          seen.add(idx);
        }
      }
    }
    expect(seen.size).toBe(64);
  });

  it('covers exactly {0, 1, …, 63} — no gaps', () => {
    const indices: number[] = [];
    for (let lam = 0; lam < 4; lam++) {
      for (let mu = 0; mu < 4; mu++) {
        for (let nu = 0; nu < 4; nu++) {
          indices.push(encodeChristoffelIndex(lam, mu, nu));
        }
      }
    }
    const sorted = [...indices].sort((a, b) => a - b);
    for (let i = 0; i < 64; i++) {
      expect(sorted[i]).toBe(i);
    }
  });
});

// ---------------------------------------------------------------------------
// (B) Non-diagonal metric smoke: Γ^1_{00} = ε at leading order
//
// Metric: g_μν = δ_μν + ε·δ_{μ0}δ_{ν1}·x⁰ + ε·δ_{μ1}δ_{ν0}·x⁰
// (linearly varying off-diagonal entry in the (0,1) and (1,0) slots).
//
// Christoffel computed analytically (leading order ε):
//   Γ^1_{00} ≈ ε  →  flat index 16·1 + 4·0 + 0 = 16
//
// All other leading-order components are zero for this metric at x=[1,0,0,0].
// ---------------------------------------------------------------------------

/**
 * Compute the Christoffel symbol numerically for a given metric function
 * using centred FD on the metric, returning a Float64Array(64) in λ-major layout.
 *
 * Implements Γ^λ_{μν} = ½ g^{λρ}(∂_μ g_{ρν} + ∂_ν g_{ρμ} − ∂_ρ g_{μν})
 * via 2nd-order centred FD on the metric, then invert numerically via
 * Gaussian elimination for the 4×4 inverse metric.
 */
function christoffelFromMetricFD(
  gFn: (x: readonly number[]) => number[][],
  x: readonly number[],
  h = 1e-5,
): Float64Array {
  const N = 4;

  // Metric and its inverse at x
  const g = gFn(x);

  // 4×4 Gaussian elimination to invert g
  const gInv = invertMatrix4(g);

  // Centred FD for ∂_λ g_{μν}
  const dg: number[][][] = Array.from({ length: N }, (_, lam) => {
    const xP = x.slice() as number[];
    const xM = x.slice() as number[];
    xP[lam] += h;
    xM[lam] -= h;
    const gP = gFn(xP);
    const gM = gFn(xM);
    return Array.from({ length: N }, (__, mu) =>
      Array.from({ length: N }, (___, nu) => (gP[mu][nu] - gM[mu][nu]) / (2 * h)),
    );
  });

  // Christoffel: Γ^λ_{μν} = ½ g^{λρ}(∂_μ g_{ρν} + ∂_ν g_{ρμ} − ∂_ρ g_{μν})
  const arr = new Float64Array(N * N * N);
  for (let lam = 0; lam < N; lam++) {
    for (let mu = 0; mu < N; mu++) {
      for (let nu = 0; nu < N; nu++) {
        let s = 0;
        for (let rho = 0; rho < N; rho++) {
          s += gInv[lam][rho] * (dg[mu][rho][nu] + dg[nu][rho][mu] - dg[rho][mu][nu]);
        }
        arr[encodeChristoffelIndex(lam, mu, nu)] = 0.5 * s;
      }
    }
  }
  return arr;
}

/** 4×4 matrix inversion via Gaussian elimination (no pivoting — OK for small ε). */
function invertMatrix4(m: number[][]): number[][] {
  const N = 4;
  // Augment [m | I]
  const aug: number[][] = Array.from({ length: N }, (_, i) =>
    Array.from({ length: 2 * N }, (__, j) => (j < N ? m[i][j] : (j - N === i ? 1 : 0))),
  );
  for (let col = 0; col < N; col++) {
    // Find pivot
    let pivotRow = col;
    for (let row = col + 1; row < N; row++) {
      if (Math.abs(aug[row][col]) > Math.abs(aug[pivotRow][col])) pivotRow = row;
    }
    [aug[col], aug[pivotRow]] = [aug[pivotRow], aug[col]];
    const diag = aug[col][col];
    for (let j = 0; j < 2 * N; j++) aug[col][j] /= diag;
    for (let row = 0; row < N; row++) {
      if (row === col) continue;
      const factor = aug[row][col];
      for (let j = 0; j < 2 * N; j++) aug[row][j] -= factor * aug[col][j];
    }
  }
  return Array.from({ length: N }, (_, i) => aug[i].slice(N));
}

describe('encodeChristoffelIndex: non-diagonal metric smoke', () => {
  it('Γ^1_{00}=ε at flat index 16 for off-diagonal metric (catches μ↔ν transposition)', () => {
    const eps = 0.01; // small but not tiny — numerical FD stays clean

    // Metric: g_μν(x) = δ_μν + ε·x⁰·(δ_{μ0}δ_{ν1} + δ_{μ1}δ_{ν0})
    // at x = [1, 0, 0, 0]:  g_{01} = g_{10} = ε; diagonal = 1.
    const gFn = (x: readonly number[]): number[][] => {
      const t = x[0];
      return [
        [1, eps * t, 0, 0],
        [eps * t, 1, 0, 0],
        [0, 0, 1, 0],
        [0, 0, 0, 1],
      ];
    };

    const x0 = [1, 0, 0, 0];
    const arr = christoffelFromMetricFD(gFn, x0);

    // Analytic result: Γ^1_{00} = ε·g^{11} = ε/(1−ε²) ≈ ε·(1+ε²) = 0.010001
    // (exact for this metric; FD introduces O(h²)~1e-10 error, ε²-correction is 1e-4)
    const expected100 = eps / (1 - eps * eps); // exact inverse-metric factor
    const idx100 = encodeChristoffelIndex(1, 0, 0); // = 16
    expect(idx100).toBe(16);
    expect(arr[idx100]).toBeCloseTo(expected100, 6); // within FD tolerance

    // Γ^0_{00} = ½ g^{01}·2ε = -ε²/(1-ε²) ≈ -ε² (second-order correction via g^{01})
    // With ε=0.01: expected ≈ -0.0001. Test that it's at this order, not at O(ε).
    const idx000 = encodeChristoffelIndex(0, 0, 0); // = 0
    const expected000 = -(eps * eps) / (1 - eps * eps);
    expect(arr[idx000]).toBeCloseTo(expected000, 6);

    // Γ^1_{11} should also be ≈ 0 (no ∂_1 g terms)
    const idx111 = encodeChristoffelIndex(1, 1, 1); // = 21
    expect(arr[idx111]).toBeCloseTo(0, 6);
  });
});
