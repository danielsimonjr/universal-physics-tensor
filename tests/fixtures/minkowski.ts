/**
 * Minkowski-spacetime closures for v0.5.1 NEW-1 flat-curvature zero-tests.
 *
 * Coordinates: x^μ = [t, x, y, z]  (μ = 0,1,2,3) — Cartesian.
 * Metric signature: mostly-plus −+++ (Carroll convention).
 *
 * Two variants:
 *   - SI (`minkowskiGFn`, `minkowskiGInverseFn`):   g_{tt} = −c², g_{ii} = 1.
 *   - Unitless (`unitlessMinkowski*`):              g_{tt} = −1,  g_{ii} = 1.
 *
 * Curvature: ALL components zero (Minkowski is the canonical flat-spacetime
 * vacuum). The closed-form fixtures here are x-independent: dg, Γ, R all
 * return zero arrays of the correct rank.
 *
 * **Unitless rationale (matches the documented Bianchi-residual precedent):**
 * the SI c²-on-g_tt convention is correct but pushes FD-truncation
 * cancellation noise per machine-epsilon to O(c²·eps) ≈ O(10) absolute in
 * any composite curvature contraction that touches the t–t slot. The exact
 * same problem is documented at length in
 * `tests/dimensional/bianchi-residual.test.ts` JSDoc and resolved there by
 * using a `unitlessSchwarzschildGFn` rescaling. Since Minkowski curvature
 * is identically zero in any unit system, the metric-rescaling-invariant
 * curvature identities (Riemann ≡ 0, Ricci ≡ 0, Bianchi ≡ 0) survive the
 * c → 1 rescaling exactly. We use the unitless variant in the Task 16
 * tests so the ≤1e-12 machine-precision assertion can fire cleanly.
 *
 * **Purpose (NEW-1, Adam's miss-case finding):** a flat-spacetime
 * end-to-end sanity test for the v0.5.0 GR pipeline. If any Riemann /
 * Ricci / Einstein / Bianchi evaluator returns non-zero (above the
 * documented machine-precision floor) on Minkowski, that's a latent
 * convention bug.
 *
 * @module tests/fixtures/minkowski
 */

import { C_SI } from '../../src/core/constants.js';

const c2_SI = C_SI * C_SI; // m² s⁻²

/**
 * Returns the SI Minkowski covariant metric g_{μν} = diag(−c², 1, 1, 1).
 * x-independent — closure ignores its argument.
 */
export function minkowskiGFn(): (x: ReadonlyArray<number>) => number[][] {
  return function minkowskiG(_x: ReadonlyArray<number>): number[][] {
    return [
      [-c2_SI, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  };
}

/**
 * Returns the SI Minkowski contravariant metric g^{μν} = diag(−1/c², 1, 1, 1).
 * Mutually consistent with `minkowskiGFn`: g_{μν} g^{μν} = 4.
 */
export function minkowskiGInverseFn(): (x: ReadonlyArray<number>) => Float64Array {
  // O-4 sibling-fixture unification (2026-06-11): returns row-major
  // Float64Array(16), flat[mu*4 + nu] = g^{μν} (Decision #1 layout —
  // mirrors the v0.9.0 O-1 schwarzschildGInverseFn migration; BREAKING
  // for fixture-internal callers only — tests/fixtures/ is not shipped).
  return function minkowskiGInverse(_x: ReadonlyArray<number>): Float64Array {
    const gInv = new Float64Array(16);
    gInv[0 * 4 + 0] = -1 / c2_SI;
    gInv[1 * 4 + 1] = 1;
    gInv[2 * 4 + 2] = 1;
    gInv[3 * 4 + 3] = 1;
    return gInv;
  };
}

/**
 * Unitless (c=1) Minkowski covariant metric g_{μν} = diag(−1, 1, 1, 1).
 *
 * Use this variant for curvature zero-tests (NEW-1). The Bianchi-residual
 * test's `unitlessSchwarzschildGFn` JSDoc documents the same c²-cancellation
 * noise problem and resolves it identically — curvature identities are
 * metric-rescaling-invariant, so a c=1 metric is physically equivalent for
 * any "curvature ≡ 0" assertion.
 */
export function unitlessMinkowskiGFn(): (x: ReadonlyArray<number>) => number[][] {
  return function unitlessMinkowskiG(_x: ReadonlyArray<number>): number[][] {
    return [
      [-1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  };
}

/**
 * Unitless (c=1) Minkowski contravariant metric g^{μν} = diag(−1, 1, 1, 1).
 * Self-inverse: g_{μν} g^{μν} = 4 (each diagonal pair contributes −1·−1 + 1·1 + ... = 4).
 */
export function unitlessMinkowskiGInverseFn(): (x: ReadonlyArray<number>) => Float64Array {
  // O-4 sibling-fixture unification (2026-06-11): returns row-major
  // Float64Array(16), flat[mu*4 + nu] = g^{μν} (Decision #1 layout).
  return function unitlessMinkowskiGInverse(_x: ReadonlyArray<number>): Float64Array {
    const gInv = new Float64Array(16);
    gInv[0 * 4 + 0] = -1;
    gInv[1 * 4 + 1] = 1;
    gInv[2 * 4 + 2] = 1;
    gInv[3 * 4 + 3] = 1;
    return gInv;
  };
}

/**
 * Returns ∂_λ g^{μν} for Minkowski — all zeros (metric is x-independent).
 * Index order matches Schwarzschild: dg[lambda][mu][nu]. Convention-agnostic
 * (SI or unitless — both have x-independent g).
 */
export function minkowskiDgInverseFn(): (x: ReadonlyArray<number>) => Float64Array {
  // O-4 sibling-fixture unification (2026-06-11): returns row-major
  // Float64Array(64), flat[lambda*16 + mu*4 + nu] = ∂_λ g^{μν} — all zero
  // (Decision #1 layout — mirrors schwarzschildDgInverseFn).
  return function minkowskiDgInverse(_x: ReadonlyArray<number>): Float64Array {
    return new Float64Array(64); // zero-initialised
  };
}

/**
 * Returns Γ^μ_{νρ} for Minkowski (Cartesian) — all zeros. Index order
 * Γ[mu][nu][rho], matching {@link schwarzschildChristoffelFn}.
 */
export function minkowskiChristoffelFn(): (x: ReadonlyArray<number>) => number[][][] {
  return function minkowskiChristoffel(_x: ReadonlyArray<number>): number[][][] {
    return Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () => [0, 0, 0, 0]),
    );
  };
}

/**
 * Returns R^ρ_{σμν} for Minkowski — all 256 components zero. Index order
 * R[rho][sigma][mu][nu], matching {@link schwarzschildRiemannFn}.
 */
export function minkowskiRiemannFn(): (x: ReadonlyArray<number>) => number[][][][] {
  return function minkowskiRiemann(_x: ReadonlyArray<number>): number[][][][] {
    return Array.from({ length: 4 }, () =>
      Array.from({ length: 4 }, () =>
        Array.from({ length: 4 }, () => [0, 0, 0, 0]),
      ),
    );
  };
}
