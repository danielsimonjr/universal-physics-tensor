/**
 * Quantum-side support functions for Phase 3's `deformation-quantization` and
 * `analytic-continuation` bridges. Phase 0 records NO quantum bridge: these
 * are the two closed forms the later bridges will need, landed early so their
 * witnesses (W4, W5) exist before the records that cite them.
 *
 * @module atlas/witnesses/quantum-support
 */

/**
 * Uncertainty product σx σp of the chirped Gaussian
 * `ψ(x) = N exp(−x²/4s² + i α x²)`.
 *
 * Writing `ψ ~ exp(−A x²)` with `A = 1/(4 s²) − i α` gives `σx = s` and
 * `σp = (ħ/2s) √(1 + 16 α² s⁴)`, so the product is
 * `(ħ/2) √(1 + 16 α² s⁴)`. The chirp raises the product above the
 * Heisenberg floor without changing the position spread; at `α = 0` it is
 * exactly `ħ/2`.
 *
 * @internal
 */
export function chirpedGaussianUncertaintyProduct(s: number, alpha: number, hbar = 1): number {
  return (hbar / 2) * Math.sqrt(1 + 16 * alpha * alpha * s * s * s * s);
}

/** Coefficients of the Wick-rotated Schrödinger equation. @internal */
export interface WickRotatedCoefficients {
  /** Coefficient of ∇²φ: ħ/(2m). */
  readonly diffusion: number;
  /** Sign of the potential (reaction) term: −1. */
  readonly reactionSign: number;
  /** Magnitude scale of the potential term: 1/ħ. */
  readonly reactionScale: number;
}

/**
 * Wick rotation `t = −i τ` turns `i ħ ∂_t ψ = −(ħ²/2m) ∇²ψ + V ψ` into the
 * reaction–diffusion equation `∂_τ φ = (ħ/2m) ∇²φ − V φ / ħ`.
 *
 * The returned coefficients are that equation's: diffusivity `ħ/(2m)`, and a
 * reaction term of sign `−1` and scale `1/ħ`.
 *
 * @internal
 */
export function wickRotatedSchrodingerCoefficients(
  hbar: number,
  m: number,
): WickRotatedCoefficients {
  return { diffusion: hbar / (2 * m), reactionSign: -1, reactionScale: 1 / hbar };
}

/**
 * Free-particle heat kernel of the Wick-rotated equation with `V = 0`:
 * `φ(x, τ) = (s²/σ(τ))^{1/2} exp(−x²/(4 σ(τ)))` with
 * `σ(τ) = s² + ħ τ / (2 m)`. Normalised so `φ(x, 0)` is the `α = 0` Gaussian
 * of {@link chirpedGaussianUncertaintyProduct} up to a constant.
 *
 * @internal
 */
export function wickRotatedFreeKernel(
  x: number,
  tau: number,
  s: number,
  hbar: number,
  m: number,
): number {
  const sigma = s * s + (hbar * tau) / (2 * m);
  return Math.sqrt((s * s) / sigma) * Math.exp(-(x * x) / (4 * sigma));
}
