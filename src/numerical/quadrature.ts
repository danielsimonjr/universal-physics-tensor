/**
 * Gauss–Legendre quadrature — shared between the numerical AST lowering and the
 * traced reverse-mode-AD lowering of definite `integral` nodes.
 *
 * 16-point Gauss–Legendre on [−1, 1]: exact for polynomials of degree ≤ 31, and
 * highly accurate for smooth integrands (√, exp, trig away from singularities).
 * It is NOT reliable for highly oscillatory integrands or singularities at/near
 * the bounds — those are out of scope for the differentiable-integral feature.
 *
 * The affine map from [−1, 1] to [a, b] is x = (b−a)/2·ξ + (a+b)/2 with Jacobian
 * (b−a)/2, so ∫ₐᵇ f dx ≈ (b−a)/2 · Σᵢ wᵢ·f(xᵢ). For b < a the (b−a)/2 factor is
 * negative, giving the correct signed integral (∫ₐᵇ = −∫ᵦᵃ).
 *
 * @module numerical/quadrature
 */

/** A Gauss–Legendre abscissa/weight pair on the reference interval [−1, 1]. */
export interface GaussLegendreNode {
  readonly node: number;
  readonly weight: number;
}

/**
 * 16-point Gauss–Legendre nodes and weights on [−1, 1] (Σ weights = 2). Standard
 * tabulated values (Abramowitz & Stegun Table 25.4); symmetric about 0.
 */
export const GAUSS_LEGENDRE_16: ReadonlyArray<GaussLegendreNode> = [
  { node: -0.9894009349916499, weight: 0.0271524594117541 },
  { node: -0.9445750230732326, weight: 0.0622535239386479 },
  { node: -0.8656312023878318, weight: 0.0951585116824928 },
  { node: -0.755404408355003, weight: 0.1246289712555339 },
  { node: -0.6178762444026438, weight: 0.1495959888165767 },
  { node: -0.4580167776572274, weight: 0.1691565193950025 },
  { node: -0.2816035507792589, weight: 0.1826034150449236 },
  { node: -0.0950125098376374, weight: 0.1894506104550685 },
  { node: 0.0950125098376374, weight: 0.1894506104550685 },
  { node: 0.2816035507792589, weight: 0.1826034150449236 },
  { node: 0.4580167776572274, weight: 0.1691565193950025 },
  { node: 0.6178762444026438, weight: 0.1495959888165767 },
  { node: 0.755404408355003, weight: 0.1246289712555339 },
  { node: 0.8656312023878318, weight: 0.0951585116824928 },
  { node: 0.9445750230732326, weight: 0.0622535239386479 },
  { node: 0.9894009349916499, weight: 0.0271524594117541 },
];

/**
 * Evaluate the definite integral ∫ₐᵇ f(x) dx by 16-point Gauss–Legendre
 * quadrature. `f` is sampled at the 16 mapped abscissae.
 */
export function integrateGaussLegendre(
  f: (x: number) => number,
  a: number,
  b: number,
): number {
  const half = (b - a) / 2;
  const mid = (a + b) / 2;
  let sum = 0;
  for (const { node, weight } of GAUSS_LEGENDRE_16) {
    sum += weight * f(half * node + mid);
  }
  return half * sum;
}
