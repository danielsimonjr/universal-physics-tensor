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

const SQRT3_OVER_6 = Math.sqrt(3) / 6;

/**
 * Gauss-Legendre 4th-order quadrature nodes c₁, c₂ — the two roots of the
 * shifted Legendre polynomial P₂(x) on [0,1].
 *
 *   c₁ = ½ − √3/6,   c₂ = ½ + √3/6.
 *
 * @public
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
 * @public
 */
export const GL4_A: readonly [readonly [number, number], readonly [number, number]] = [
  [0.25, 0.25 - SQRT3_OVER_6],
  [0.25 + SQRT3_OVER_6, 0.25],
];

/**
 * GL4 stage weights — the 2-point Gauss-Legendre quadrature weights on
 * [0,1]:  b₁ = b₂ = ½.
 *
 * @public
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
  /** Inverse-metric closure: `gInverseFn(x)[μ][ν] = g^{μν}(x)`. */
  readonly gInverseFn: (x: readonly number[]) => readonly (readonly number[])[];
  /**
   * Partial derivatives of the inverse metric.
   * Index order: `dgInverseFn(x)[lambda][mu][nu] = ∂_lambda g^{mu nu}` at coords x.
   * (I2: axis semantics pinned here to prevent silent transposition bugs.)
   */
  readonly dgInverseFn: (x: readonly number[]) => readonly (readonly (readonly number[])[])[];
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
}
