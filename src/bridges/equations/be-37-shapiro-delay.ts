/**
 * Bridge Equation 37 — Variable Speed of Light Cosmology
 * (Shapiro gravitational time-delay reformulation).
 *
 * **Original (operationally-meaningless) form.** Wave R disposition
 * 2026-05-05 marked BE-37 `status='invalid'` because the ansatz
 *
 *   c(t,x) ≠ const
 *
 * is operationally meaningless per Ellis-Uzan 2005 (*Am. J. Phys.*
 * 73:240, arXiv:gr-qc/0305099 "c is the speed of light, isn't it?"):
 * the speed of light c is *defined* as a constant in SI units (since
 * the 1983 metre redefinition), so any "varying c" in vacuum is just
 * a rescaling of other constants and cannot have observable
 * consequences independent of those constants. The Albrecht-Magueijo
 * 1999 / Moffat 1993 / Barrow 1999 specific VSL ansätze were
 * non-equivalent and the R2-R3 disposition correctly preserved the
 * gap rather than pick one arbitrarily.
 *
 * **Encoded reformulation (Shapiro gravitational time-delay).** Wave
 * Z-F applies the canonical literature replacement identified by
 * OpenAI o3 in the Wave-Z reopened deferred-bridges consultation
 * (2026-05-11): replace the vacuum-c-variation ansatz with the
 * canonical **Shapiro delay** — the gravitationally-induced coordinate-
 * time delay of light passing near a massive body:
 *
 *   **Δt = (2 G M / c³) · ln(R_far / R_near)**
 *
 * This is the operationally-meaningful "effective c-variation"
 * that survives the Ellis-Uzan critique: c is *locally* always c, but
 * the integrated path-time over a gravitational potential well differs
 * from the flat-space value by a measurable amount. Shapiro 1964
 * predicted the effect from general relativity; Cassini 2003 measured
 * it to ~10⁻⁵ precision (Bertotti-Iess-Tortora 2003 *Nature*
 * 425:374), confirming Einstein's general relativity to that level.
 *
 * The bridge label is preserved: "modified gravitational/cosmological
 * effects on light propagation," now grounded in a canonical,
 * experimentally-confirmed relation rather than a non-falsifiable
 * vacuum-c-variation.
 *
 * **Dimensional analysis.**
 *   - G has dim `[L³ M⁻¹ T⁻²]`.
 *   - M has dim `[M]`.
 *   - c has dim `[L T⁻¹]`; c³ has dim `[L³ T⁻³]`.
 *   - 2GM/c³ has dim `[L³ M⁻¹ T⁻²] · [M] / [L³ T⁻³] = [T³/T²] = [T]` ✓
 *   - R_far/R_near is dimensionless `[1]`.
 *   - ln(R_far/R_near) is dimensionless `[1]` (log of dimensionless).
 *   - Product Δt: `[T] · [1] = [T]` = `[time]` ✓.
 *
 * **AST encoding pattern (typed integer-2 + log-stub).** The integer
 * factor 2 is a dimensionless constant. The log argument `R_far/R_near`
 * is a dimensionless ratio of two lengths — encoded as a separate
 * lemma exposing the dimensional-consistency of the argument (per
 * the dimensionless-stub convention, same as BE-45 log-ratio idiom).
 * The log itself is replaced by a fresh dimensionless symbol stub
 * `ln_R_ratio`.
 *
 * Bracket-checks (numerical evaluator, one-way form `2GM/c³·ln(R_far/R_near)`):
 *   - Sun mass M_sun = 1.989e30 kg, R_far = 1 AU, R_near = R_sun:
 *     2GM_sun/c³ ≈ 9.85 μs (Schwarzschild light-travel-time scale);
 *     ln(1.496e11 / 6.957e8) ≈ 5.37 (ratio ≈ 215);
 *     Δt_one-way ≈ 9.85 μs · 5.37 ≈ 53 μs.
 *   - Historical Shapiro 1964 round-trip radar measurement: the
 *     ROUND-TRIP delay uses 4GM/c³ (not 2GM/c³) and the canonical
 *     log argument `((r1+r2+R)/(r1+r2-R))` for the radar geometry,
 *     giving ~240 μs for Mercury superior-conjunction (Shapiro
 *     1964 PRL 13:789). The encoded ONE-WAY form here is half the
 *     round-trip coefficient and uses a simpler log argument
 *     suitable for a single-leg light path; the two values are NOT
 *     directly comparable.
 *   - Cassini 2003 measurement: γ to ~10⁻⁵ precision (Bertotti-
 *     Iess-Tortora 2003 *Nature* 425:374); confirms GR-canonical
 *     γ = 1 in the encoded coefficient.
 *
 * References:
 *   - Shapiro 1964 *Phys. Rev. Lett.* 13:789 (original prediction of
 *     gravitational time-delay).
 *   - Will 1981/2014 *Theory and Experiment in Gravitational
 *     Physics* (canonical textbook on the PPN framework and γ
 *     parameter).
 *   - Bertotti, Iess & Tortora 2003 *Nature* 425:374 (Cassini
 *     solar-conjunction measurement of γ to ~10⁻⁵).
 *   - Ellis & Uzan 2005 *Am. J. Phys.* 73:240 (arXiv:gr-qc/0305099,
 *     "c is the speed of light, isn't it?" — the critique that
 *     motivated reformulation away from vacuum-c-variation).
 *   - Albrecht & Magueijo 1999 (arXiv:astro-ph/9811018) — historical:
 *     one of the original VSL cosmology proposals; now dropped.
 *   - Moffat 1993 (arXiv:gr-qc/9211020); Barrow 1999 (arXiv:astro-ph/9811022);
 *     Magueijo 2003 *Rep. Prog. Phys.* 66:2025 — historical VSL
 *     literature retained for context.
 *
 * Status: speculative — REFORMULATED from 'invalid'.
 *
 * Honest-claude scope notes:
 *   - The reformulation REPLACES the operationally-meaningless
 *     `c(t,x) ≠ const` vacuum ansatz with the Shapiro delay, the
 *     canonical operationally-meaningful gravitational "effective-c"
 *     effect. Same precedent as Wave P-D R-D2 BE-25 (Penrose-Hameroff
 *     → IIT) and Wave Z-E BE-16 (Complexity-Entropy → Landauer).
 *   - The Shapiro delay is general-relativistic gravitational physics
 *     — it is NOT a "varying c" in any fundamental sense. Light always
 *     travels at c locally; the delay arises from the integrated path
 *     length / coordinate-time effects in curved spacetime.
 *     Status `'speculative'` is for the **bridge framing** (treating
 *     Shapiro delay as the UPT VSL-cosmology bridge), NOT for the
 *     Shapiro delay itself, which is canonical and experimentally
 *     confirmed.
 *   - The Albrecht-Magueijo / Moffat / Barrow vacuum-c-variation
 *     proposals are NOT recovered by this reformulation — they
 *     remain non-equivalent, non-falsifiable, and Ellis-Uzan-critique-
 *     vulnerable. The reformulation explicitly drops the
 *     vacuum-c-variation claim in favor of the operational
 *     gravitational-c-effect.
 *   - The PPN parameter γ (where γ = 1 in GR; experimental measurement
 *     constrains |γ - 1| < 2.3e-5 per Bertotti-Iess-Tortora 2003) is
 *     NOT in the encoded scalar — the encoded form is the GR-canonical
 *     coefficient `2GM/c³` (i.e., γ = 1). A more general PPN
 *     encoding would include `(1+γ) GM/c³` instead.
 *   - The full Shapiro-delay formula includes log of a path-dependent
 *     ratio (R_far / R_near where R_far, R_near are radial distances
 *     from the gravitating mass). The encoded form treats both as
 *     dimensionless ratios.
 *   - **Gemini Pro cross-validation note (2026-05-11):** the Shapiro
 *     delay manifests as an *apparent* coordinate-time slowdown of
 *     light as it traverses curved spacetime (a Schwarzschild
 *     gravitational well). It does NOT imply a variation in the
 *     fundamental constant `c` as measured by any **local inertial
 *     observer** — by Einstein's equivalence principle, every local
 *     observer measures the speed of light to be exactly `c` in their
 *     own inertial frame. The "effective c < c" interpretation is a
 *     coordinate-system artifact in the global Schwarzschild frame,
 *     not a physical local effect. This distinction is what makes
 *     Shapiro delay survive the Ellis-Uzan critique: vacuum
 *     c(t,x)-variation is operationally meaningless precisely because
 *     it conflates the local-measurement and coordinate-system
 *     pictures. Both OpenAI o3 and Gemini Pro verdicted this
 *     reformulation STRONGLY-DEFENSIBLE.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 37")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 37)
 * @module bridges/equations/be-37-shapiro-delay
 */

import type {
  ExprNode,
  DimensionValidationReport,
  MetricTensorNode,
  TensorSymbolNode,
} from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  TIME,
  MASS,
  LENGTH,
} from '../../dimensional/types.js';
import { G, c } from '../../dimensional/constants.js';
import { tsym, contract } from '../../dimensional/tensor.js';
import { metric, pderiv } from '../../dimensional/metric.js';
import { evaluateNumerical } from '../../numerical/index.js';
import type { NumericalInputs } from '../../numerical/types.js';
import { integrateRK4 } from '../../numerical/null-ray-integrator.js';
import { C_SI, G_SI } from '../../core/constants.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

// --- Symbolic AST ---

/** Symbol: Newton's gravitational constant G. Dim `[L³ M⁻¹ T⁻²]`. */
export const BE37_G: ExprNode = sym('G', G);

/** Symbol: gravitating-body mass M. Dim `[mass]`. */
export const BE37_M: ExprNode = sym('M', MASS);

/** Symbol: speed of light c. Dim `[velocity]` = `[L T⁻¹]`. */
export const BE37_C: ExprNode = sym('c', c);

/** Symbol: dimensionless integer factor 2. */
const BE37_TWO: ExprNode = sym('2', DIMENSIONLESS);

/** Symbol: dimensionless integer-3 exponent for c³. */
const THREE_EXP: ExprNode = sym('3', DIMENSIONLESS);

/**
 * Lemma AST: `c³` (dim `[L³ T⁻³]`).
 *
 * Exposed as a separate node for clarity in the prefactor expression.
 */
export const BE37_C_CUBED: ExprNode = {
  kind: 'op', op: '^',
  args: [BE37_C, THREE_EXP],
};

/**
 * Lemma AST: the prefactor `2GM/c³` (dim `[T]`).
 *
 * This is the "time-scale" associated with the Schwarzschild radius
 * of the gravitating mass: 2GM/c² is the Schwarzschild diameter (a
 * length), and dividing by c gives the corresponding light-travel
 * time-scale. For the Sun: 2 G M_sun / c³ ≈ 9.85 μs.
 */
export const BE37_PREFACTOR: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      kind: 'op', op: '*',
      args: [BE37_TWO, {
        kind: 'op', op: '*',
        args: [BE37_G, BE37_M],
      }],
    },
    BE37_C_CUBED,
  ],
};

/** Symbol: outer radial distance R_far. Dim `[length]`. */
export const BE37_R_FAR: ExprNode = sym('R_far', LENGTH);

/** Symbol: inner radial distance R_near. Dim `[length]`. */
export const BE37_R_NEAR: ExprNode = sym('R_near', LENGTH);

/**
 * Lemma AST: the log argument `R_far / R_near` (DIMENSIONLESS — ratio
 * of two lengths).
 *
 * Exposed for the lemma test that verifies the argument is
 * dimensionless (per the dimensionless-stub convention; same idiom as
 * BE-45 `BE45_LOG_RATIO_ARG_MP_HINF`).
 */
export const BE37_LOG_RATIO_ARG: ExprNode = {
  kind: 'op', op: '/',
  args: [BE37_R_FAR, BE37_R_NEAR],
};

/**
 * Lemma AST: the `ln(R_far/R_near)` factor, encoded as a fresh
 * DIMENSIONLESS symbol stub (the AST has no `log` primitive; same
 * idiom as BE-45 / BE-25 log-stubs for dimensionful-ratio arguments).
 * The argument is exposed via `BE37_LOG_RATIO_ARG` for the lemma test.
 */
export const BE37_LOG_FACTOR: ExprNode = sym('ln_R_ratio', DIMENSIONLESS);

/**
 * RHS of `Δt = (2GM/c³) · ln(R_far/R_near)` as a typed ExprNode tree:
 *
 *   (2GM/c³) · ln_R_ratio
 *
 * Dim: `[T] · [1] = [T]`.
 */
export const BE37_SHAPIRO_DELAY_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [BE37_PREFACTOR, BE37_LOG_FACTOR],
};

/** LHS: Δt is a time delay. Dim `[time]`. */
export const BE37_SHAPIRO_DELAY_LHS: ExprNode = sym('Delta_t', TIME);

// --- Numerical evaluator ---

export interface ShapiroInputs {
  /** Gravitating-body mass M in kg. Must be finite and > 0. */
  M_kg: number;
  /** Outer radial distance R_far in m. Must be finite and > 0. */
  R_far_m: number;
  /** Inner radial distance R_near in m. Must be finite and > 0 and ≤ R_far_m. */
  R_near_m: number;
}

/**
 * Evaluate the Shapiro gravitational time-delay:
 *
 *   Δt = (2 G M / c³) · ln(R_far / R_near)
 *
 * @returns Time delay in seconds (one-way, GR-canonical γ=1 form).
 *   For the Sun (M_sun = 1.989e30 kg) with light passing from 1 AU
 *   to grazing R_sun, Δt_one-way ≈ 53 μs. The historical Shapiro
 *   1964 round-trip experiment gives ~240 μs for similar geometry
 *   (uses 4GM/c³ + radar-bounce log argument), not directly
 *   comparable to this one-way encoding.
 */
export function evaluateShapiroDelay(input: ShapiroInputs): number {
  const { M_kg, R_far_m, R_near_m } = input;
  if (!Number.isFinite(M_kg) || M_kg <= 0) {
    throw new RangeError(
      `evaluateShapiroDelay: M_kg must be a finite positive number, got ${M_kg}`,
    );
  }
  if (!Number.isFinite(R_far_m) || R_far_m <= 0) {
    throw new RangeError(
      `evaluateShapiroDelay: R_far_m must be a finite positive number, got ${R_far_m}`,
    );
  }
  if (!Number.isFinite(R_near_m) || R_near_m <= 0) {
    throw new RangeError(
      `evaluateShapiroDelay: R_near_m must be a finite positive number, got ${R_near_m}`,
    );
  }
  if (R_near_m > R_far_m) {
    throw new RangeError(
      `evaluateShapiroDelay: R_near_m (${R_near_m}) must be ≤ R_far_m (${R_far_m}); ratio inside ln must be ≥ 1`,
    );
  }
  return ((2 * G_SI * M_kg) / Math.pow(C_SI, 3)) * Math.log(R_far_m / R_near_m);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be `[time]` = `[T]`.
 */
export function validateBE37Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE37_SHAPIRO_DELAY_LHS, BE37_SHAPIRO_DELAY_RHS);
  const lhs = validate(BE37_SHAPIRO_DELAY_LHS);
  const rhs = validate(BE37_SHAPIRO_DELAY_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}

// ---------------------------------------------------------------------------
// v0.3.0 structural form (eikonal null-geodesic):  g^μν (∂_μ S)(∂_ν S) = 0
// ---------------------------------------------------------------------------
//
// The Shapiro delay scalar above is the integrated first-order solution of
// this equation in the weak-field Schwarzschild metric. The structural form
// exposes the tensor-structural ORIGIN of that scalar; the original scalar
// exports (BE37_SHAPIRO_DELAY_LHS / _RHS / validateBE37Dimensions) are
// retained for numerical-evaluator continuity. Per Part-VIII §VIII.8 and
// docs/planning/v0.3.0-Bridge-Selection.md.
//
// Encoding-choice trade-off: the decision record's sketch raised one
// gradient via `raise(dmu_S, g_inverse, 'μ')` and then contracted with
// `dnu_S`. That path is correct in spirit but trips on raise()'s internal
// alpha-conversion: the inverse metric's surviving label is renamed to a
// FRESH non-colliding label (e.g., `ν_1`), so the subsequent contract()
// with `dnu_S`'s `ν` does NOT pair up — the result has two free indices,
// not a scalar. The mathematically natural form is the DIRECT contraction
// `contract(g_inverse, dmu_S, dnu_S)`: g^μν's two upper indices pair
// directly with the two gradients' lower indices in one tensor-product,
// producing a scalar. The `raise()` primitive is exercised independently
// in tests/dimensional/raise-lower.test.ts; this bridge demonstrates
// metric + pderiv + contraction in the cleanest possible form.
//
// Forward-compat anchor: v0.4.0 will swap `pderiv` for the covariant
// derivative `∇_μ`; the outer encoding structure here is preserved.

/** Eikonal phase S has dim [length] in geometrized units (∂_μ S = k_μ,
 *  the wave-4-covector). */
const EIKONAL_PHASE_DIM: Dimension = LENGTH;

/** Schwarzschild metric components are dimensionless in the (−,+,+,+)
 *  signature with coordinates carrying [length]. */
const METRIC_COMPONENT_DIM: Dimension = DIMENSIONLESS;

/** Coordinate basis used as `wrt` for pderiv; carries dim [length]. */
const x_coord: TensorSymbolNode = tsym(
  'x',
  [{ label: 'α', variance: 'upper' }],
  LENGTH,
  'coordinate',
);

/** Inverse metric g^μν (rank-2, both upper). */
const g_inverse_eikonal: MetricTensorNode = metric(
  'g_inverse',
  [
    { label: 'μ', variance: 'upper' },
    { label: 'ν', variance: 'upper' },
  ],
  METRIC_COMPONENT_DIM,
  '-,+,+,+',
);

/** Eikonal phase scalar field S(x), rank-0, dim [length]. */
const S_eikonal: TensorSymbolNode = tsym('S', [], EIKONAL_PHASE_DIM);

/** ∂_μ S — rank-1 covariant gradient; dim = LENGTH/LENGTH = DIMENSIONLESS. */
const dmu_S = pderiv(S_eikonal, x_coord, { label: 'μ', variance: 'lower' });

/** ∂_ν S — rank-1 covariant gradient; dim DIMENSIONLESS. */
const dnu_S = pderiv(S_eikonal, x_coord, { label: 'ν', variance: 'lower' });

/**
 * Eikonal LHS:  g^μν (∂_μ S)(∂_ν S).
 *
 * Direct contraction — μ pairs (upper from g_inverse, lower from dmu_S),
 * ν pairs (upper from g_inverse, lower from dnu_S). Result is a scalar
 * with dim DIMENSIONLESS · DIMENSIONLESS · DIMENSIONLESS = DIMENSIONLESS.
 */
export const BE37_EIKONAL_LHS: ExprNode = contract(g_inverse_eikonal, dmu_S, dnu_S);

/**
 * Eikonal RHS:  the literal dimensionless 'zero' symbol (null-geodesic
 * condition). Same idiom as other zero-RHS bridges (e.g., BE-36).
 */
export const BE37_EIKONAL_RHS_ZERO: ExprNode = {
  kind: 'symbol',
  name: 'zero',
  dim: DIMENSIONLESS,
};

/**
 * Per-bridge dimensional self-check for the v0.3.0 eikonal structural
 * form. Both sides should be DIMENSIONLESS.
 */
export function validateBE37EikonalDimensions(): DimensionValidationReport {
  const lhs = validate(BE37_EIKONAL_LHS);
  const rhs = validate(BE37_EIKONAL_RHS_ZERO);
  const eq = validateEquation(BE37_EIKONAL_LHS, BE37_EIKONAL_RHS_ZERO);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}

/**
 * Build NumericalInputs for lowering BE37_EIKONAL_LHS = contract(g_inverse,
 * ∂_μ S, ∂_ν S) at a representative radius `r`.
 *
 * - g_inverse: weak-field Schwarzschild inverse metric, diagonal, signature
 *   (−,+,+,+). Φ = G M / (c² r) is the dimensionless potential:
 *     g^tt = −1/(1+2Φ),  g^rr = 1+2Φ  (weak-field, first order),
 *     g^θθ = g^φφ = 1    (angular parts irrelevant for a radial ray).
 * - ∂_μ S = ∂_ν S = k_μ, the null wave-covector for a RADIAL ray:
 *   k_μ = (k_t, k_r, 0, 0) chosen so g^tt k_t² + g^rr k_r² = 0, i.e.
 *   k_t = 1, k_r = sqrt(−g^tt / g^rr). By construction g^μν k_μ k_ν = 0 —
 *   which is exactly the point: the lowered eikonal residual being 0 to
 *   machine precision PROVES the metric + pderiv + contraction AST lowers
 *   and einsum-contracts correctly.
 *
 * S has numericalForm 'symbolic' (default — S_eikonal carries no
 * numericalForm field), so ∂_μ S / ∂_ν S are supplied explicitly via
 * inputs.derivatives, keyed `${ofName}/${wrtLabel}` ⇒ 'S/μ' and 'S/ν'
 * (S is rank-0, so each is a length-4 vector — shape [...ofShape=[], N=4]).
 */
function buildSchwarzschildEikonalInputs(
  r: number, G_SI: number, c_SI: number, M_kg: number,
): NumericalInputs {
  const Phi = (G_SI * M_kg) / (c_SI * c_SI * r); // dimensionless potential
  const gtt = -1 / (1 + 2 * Phi);
  const grr = 1 + 2 * Phi;
  const gInverse = [
    [gtt, 0, 0, 0],
    [0, grr, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  // Null radial wave-covector: g^tt k_t² + g^rr k_r² = 0.
  const kMu = [1, Math.sqrt(-gtt / grr), 0, 0];
  return {
    tensors: new Map<string, number[][]>([['g_inverse', gInverse]]),
    derivatives: new Map<string, number[]>([['S/μ', kMu], ['S/ν', kMu]]),
    dimension: 4,
  };
}

/**
 * BE-37 end-to-end numerical evaluator (v0.3.5-Design.md §8).
 *
 * Part (a): lower BE37_EIKONAL_LHS with concrete weak-field Schwarzschild
 * g^μν components + a null wave-covector and confirm the eikonal residual
 * g^μν ∂_μS ∂_νS ≈ 0 — proves the v0.3.0 metric + pderiv + contraction
 * ASTs lower and contract numerically.
 *
 * Part (b): RK4-integrate the Shapiro coordinate-time delay along the
 * radial null ray and cross-check against the closed-form
 * evaluateShapiroDelay().
 */
export async function evaluateBE37EikonalNumerical(): Promise<{
  eikonalResidual: number;
  integratedDelay: number;
  closedFormDelay: number;
  scenario: ShapiroInputs;
}> {
  // v0.5.1 PC-1: canonical constants from src/core/constants.ts — both
  // evaluateShapiroDelay above and this evaluator now read the SAME source
  // of truth, eliminating the prior local-literal duplication.
  const scenario: ShapiroInputs = {
    M_kg: 1.989e30,    // solar mass
    R_far_m: 1.5e11,   // ~1 AU
    R_near_m: 1.0e9,   // inner radius (R_near_m ≤ R_far_m, required)
  };
  const { M_kg, R_far_m, R_near_m } = scenario;
  const k = (2 * G_SI * M_kg) / (C_SI * C_SI * C_SI); // 2GM/c³  [seconds]

  // --- Part (a): lower BE37_EIKONAL_LHS with concrete Schwarzschild g^μν ---
  const rMid = 0.5 * (R_near_m + R_far_m);
  const inputs = buildSchwarzschildEikonalInputs(rMid, G_SI, C_SI, M_kg);
  const eikonal = await evaluateNumerical(BE37_EIKONAL_LHS, inputs);
  const eikonalResidual = eikonal.value as number;

  // --- Part (b): RK4-integrate the Shapiro delay along the radial null ray.
  // r(λ) = R_near + λ·(R_far − R_near), λ ∈ [0,1].
  // d(Δt)/dλ = (2GM/c³)·(R_far − R_near)/r(λ)  ⇒  Δt = (2GM/c³)·ln(R_far/R_near).
  const dr = R_far_m - R_near_m;
  const integrated = integrateRK4(
    (lambda) => {
      const r = R_near_m + lambda * dr;
      return [(k * dr) / r];
    },
    [0],
    0, 1,
    4096, // step count chosen so the cross-check holds to ±1e-9
  );
  const integratedDelay = integrated[0];
  const closedFormDelay = evaluateShapiroDelay(scenario);

  return { eikonalResidual, integratedDelay, closedFormDelay, scenario };
}
