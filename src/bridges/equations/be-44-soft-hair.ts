/**
 * Bridge Equation 44 — Soft Hair on Black Holes (Hawking-Perry-Strominger
 * 2016) — squared-norm scalar reduction.
 *
 *   Q_soft² = ∫_{𝒤^±} (∂_u C_{zz̄})² dμ
 *
 * The integrated squared news at null infinity — the natural BMS-invariant
 * L²-norm of the soft-hair charge integrand. This is a SCALAR REDUCTION of
 * the operator-valued BMS supertranslation charge
 *
 *   Q_soft^± = ∫_{𝒤^±} (∂_u C_{zz̄}) Y^z dz ∧ dz̄
 *
 * which the AST grammar cannot directly encode (C_{zz̄} is an operator-
 * valued asymptotic-shear field at null infinity; Y^z is a BMS
 * supertranslation parameter; the integrand is genuinely operator-valued
 * and the celestial-2-sphere geometry is not in the AST primitives).
 *
 * What IS encodable: the squared norm reduction uses only the `integral`
 * primitive (same machinery as BE-26 WKB), integrating over the u-direction
 * with the celestial-2-sphere implicit and Y^z absorbed into the measure.
 * The resulting scalar Q_soft² is the BMS-invariant L²-norm of the news
 * field at 𝒤^±, a standard derived quantity in the soft-theorem literature.
 *
 * Dimensional analysis (BMS-shear convention; Hawking-Perry-Strominger
 * 2016 §2; Strominger 2018 lectures §2.10):
 *   - C_{zz̄}    asymptotic shear at null infinity — dim [L] in SI
 *               (a metric-perturbation coefficient at 𝒤^±; dimensionless
 *               in natural units where length and time are unified, but
 *               SI carries [L] under the standard Bondi-frame convention).
 *   - ∂_u C    news tensor — dim [L/T] = [L T^-1] (u is retarded time).
 *   - (∂_u C)²  squared news — dim [L² T^-2].
 *   - dμ       3-volume measure on 𝒤^± in the reduced encoding is the
 *               u-coordinate measure of dim [T]; the celestial-2-sphere
 *               z,z̄ stereographic coordinates are dimensionless and
 *               implicit (their contribution to dμ is dimensionless).
 *   - ∫(∂_u C)² dμ  squared soft-hair charge — dim [L² T^-1].
 *
 * Status: 'speculative' (encoding does NOT promote).
 *
 * Honest-claude scope notes:
 *   - The ORIGINAL BE-44 formula `Q_soft^± = ∫_{𝒤^±} (∂_u C_{zz̄}) Y^z
 *     dz ∧ dz̄` is OPERATOR-VALUED: C_{zz̄} is an asymptotic shear field
 *     at null infinity (a Hilbert-space-valued tensor field, not a
 *     c-number); Y^z is a BMS supertranslation parameter (a function/
 *     vector field on the celestial sphere indexing an infinite family of
 *     charges). The AST grammar's `symbol`, `op`, `integral`, `derivative`
 *     primitives have no representation for field operators or BMS
 *     symmetry parameters.
 *   - This encoding is a **SQUARED-NORM SCALAR REDUCTION** (the L²-norm
 *     of the news at null infinity), which IS encodable via the `integral`
 *     primitive but does **NOT** encode the BMS charge structure itself.
 *     The full Q_soft^± charge labelled by Y^z and the celestial-2-sphere
 *     geometry (z, z̄ stereographic coordinates) are NOT represented.
 *   - The supertranslation parameter Y^z drops out of the squared norm
 *     (it would multiply (∂_u C)² in any "intensity" definition only if
 *     the encoding also folded in |Y|²; we omit Y entirely, treating the
 *     reduction as the bare news squared norm). For a Y-weighted version,
 *     promote (∂_u C)² → (∂_u C · Y^z)·conj — outside the present scope.
 *   - The celestial-2-sphere measure (with dz ∧ dz̄ a 2-form on the
 *     sphere) is implicit and dimensionless under the stereographic
 *     coordinate convention; only the u-direction contributes a
 *     dimensionful measure element [T].
 *   - The numerical evaluator implements TRAPEZOIDAL quadrature on a
 *     uniform u-grid — an approximation, not exact integration. Convergence
 *     is O(du²) for smooth news profiles.
 *   - Status remains 'speculative' — this encoding does NOT promote the
 *     bridge to 'established'; the bridge framing (soft-hair charges as
 *     UPT information-paradox resolution) is the speculative element. The
 *     squared-norm reduction is a standard observable in the soft-theorem
 *     literature (Strominger 2018 §2.10) but does not encode the BMS
 *     charge algebra.
 *
 * References:
 *   - Hawking, Perry & Strominger 2016 *Phys. Rev. Lett.* 116:231301
 *     (arXiv:1601.00921; original soft-hair-on-black-holes proposal)
 *   - Hawking, Perry & Strominger 2017 *JHEP* 1705:161 (arXiv:1611.09175;
 *     BMS supertranslation details)
 *   - Bondi, van der Burg & Metzner 1962 *Proc. R. Soc. Lond. A* 269:21
 *     (foundational BMS asymptotic-symmetry paper)
 *   - Strominger 2014 *JHEP* 1407:152 (arXiv:1312.2229; BMS as gauge
 *     symmetry of asymptotically-flat gravity)
 *   - Strominger 2018 *Lectures on the Infrared Structure of Gravity and
 *     Gauge Theory* (Princeton; arXiv:1703.05448; §2.10 discusses the
 *     news-squared L²-norm)
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 44: Soft Hair on Black Holes")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 44)
 * @module bridges/equations/be-44-soft-hair
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  LENGTH,
  TIME,
} from '../../dimensional/types.js';
import { divide, multiply } from '../../dimensional/algebra.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** News-tensor velocity dim: ∂_u C with dim [L/T] = [L T^-1]. */
const NEWS_DIM: Dimension = divide(LENGTH, TIME);

/** Squared-news dim: (∂_u C)² with dim [L² T^-2]. */
const NEWS_SQUARED_DIM: Dimension = multiply(NEWS_DIM, NEWS_DIM);

/** Soft-hair squared-charge dim: ∫(∂_u C)² du with dim [L² T^-1]. */
export const SOFT_HAIR_SQUARED: Dimension = multiply(NEWS_SQUARED_DIM, TIME);

/**
 * News tensor symbol: ∂_u C_{zz̄}. The u-derivative of the asymptotic
 * shear at null infinity. Dim [L T^-1] (velocity-like rate of change of
 * the shear).
 */
export const BE44_NEWS_TENSOR: ExprNode = sym('partial_u_C', NEWS_DIM);

/**
 * Squared news: (∂_u C) · (∂_u C). Dim [L² T^-2]. Encoded as an
 * explicit `op: '*'` product (rather than `op: '^'` with exponent 2)
 * because both factors are the same symbol and the validator infers
 * [L² T^-2] cleanly from multiplication.
 */
export const BE44_NEWS_SQUARED: ExprNode = {
  kind: 'op', op: '*',
  args: [BE44_NEWS_TENSOR, BE44_NEWS_TENSOR],
};

/**
 * RHS: ∫_{𝒤^±} (∂_u C)² du. The celestial-2-sphere measure dz ∧ dz̄ is
 * dimensionless under the standard stereographic convention and is
 * absorbed implicitly; only the u-direction contributes a dimensionful
 * measure element [T]. Resulting dim: [L² T^-2] · [T] = [L² T^-1].
 */
export const BE44_SOFT_HAIR_INTEGRAL_RHS: ExprNode = {
  kind: 'integral',
  over: sym('u', TIME),
  integrand: BE44_NEWS_SQUARED,
};

/** LHS: Q_soft² has dim [L² T^-1]. */
export const BE44_SOFT_HAIR_CHARGE_SQUARED_LHS: ExprNode = sym(
  'Q_soft_squared',
  SOFT_HAIR_SQUARED,
);

// --- Numerical evaluator (trapezoidal quadrature) ---

export interface BE44SoftHairInputs {
  /**
   * Samples of ∂_u C on a uniform u-grid (SI units [m/s], i.e. [L/T]).
   * Length must be ≥ 2 (minimum two grid points to define a trapezoid).
   * All entries must be finite.
   */
  news_samples: number[];
  /**
   * Uniform spacing du between samples (SI units [s]). Must be > 0 and
   * finite.
   */
  du: number;
}

/**
 * Evaluate Q_soft² = ∫(∂_u C)² du via trapezoidal quadrature on a uniform
 * u-grid.
 *
 * The trapezoidal rule for a uniform grid `samples[0..N-1]` with spacing
 * `du` reads
 *
 *   ∫f du ≈ du · [f₀/2 + f₁ + f₂ + … + f_{N-2} + f_{N-1}/2]
 *
 * We apply it to f(u) = (samples[i])². This is an O(du²) approximation;
 * not exact. Returned value has SI dim [L² T^-1] = [m²/s].
 *
 * @throws RangeError if news_samples is empty, has fewer than 2 entries,
 *                   contains non-finite values, or du is non-positive
 *                   or non-finite.
 */
export function evaluateBE44SoftHairCharge(input: BE44SoftHairInputs): number {
  const { news_samples, du } = input;
  if (!Array.isArray(news_samples)) {
    throw new RangeError(
      `evaluateBE44SoftHairCharge: news_samples must be an array, got ${typeof news_samples}`,
    );
  }
  if (news_samples.length < 2) {
    throw new RangeError(
      `evaluateBE44SoftHairCharge: news_samples must have at least 2 entries (trapezoid needs both endpoints), got length ${news_samples.length}`,
    );
  }
  if (!Number.isFinite(du) || du <= 0) {
    throw new RangeError(
      `evaluateBE44SoftHairCharge: du must be a finite positive number, got ${du}`,
    );
  }
  for (let i = 0; i < news_samples.length; i++) {
    if (!Number.isFinite(news_samples[i])) {
      throw new RangeError(
        `evaluateBE44SoftHairCharge: news_samples[${i}] is not finite, got ${news_samples[i]}`,
      );
    }
  }
  // Trapezoidal sum of f² on uniform grid: du · [f₀²/2 + Σ_inner fᵢ² + f_{N-1}²/2].
  const N = news_samples.length;
  let acc = 0.5 * news_samples[0]! * news_samples[0]!;
  for (let i = 1; i < N - 1; i++) {
    acc += news_samples[i]! * news_samples[i]!;
  }
  acc += 0.5 * news_samples[N - 1]! * news_samples[N - 1]!;
  return acc * du;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should both
 * be [L² T^-1].
 */
export function validateBE44Dimensions(): DimensionValidationReport {
  const eq = validateEquation(
    BE44_SOFT_HAIR_CHARGE_SQUARED_LHS,
    BE44_SOFT_HAIR_INTEGRAL_RHS,
  );
  const lhs = validate(BE44_SOFT_HAIR_CHARGE_SQUARED_LHS);
  const rhs = validate(BE44_SOFT_HAIR_INTEGRAL_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
