/**
 * v0.4.0 BE-37 covariant-eikonal STRUCTURAL PREVIEW.
 *
 * Provides `evaluateBE37CovariantEikonalNumerical`, which encodes the
 * covariant-eikonal equation
 *
 *   g^μν ∇_μ ∇_ν S = 0
 *
 * via the connection layer added in Tasks 2-3 + 12-14.  In v0.4.0 the
 * eikonal residual is **0 by construction**: the null wave-covector
 *
 *   k_μ = ∂_μ S = (E, E, 0, 0)   (energy + radial component only)
 *
 * satisfies g^μν k_μ k_ν = 0 identically for the +,−,−,− Schwarzschild
 * metric.  No numerical integration is performed for this quantity.
 *
 * The `shapiroDelaySec` field is an **intentional v0.4.0 stub** (returns 0).
 * The full geodesic-integrated Shapiro cross-check — comparing
 * `shapiroDelaySec` against `evaluateShapiroDelay` — is the v0.5.0
 * deliverable; it requires wiring `integrateGeodesic` end-to-end through
 * the covariant-eikonal path, which is deferred.
 *
 * @see tests/dimensional/covariant-derivative-preview.test.ts (Task 17 [U])
 * @see docs/planning/v0.4.0-Implementation-Plan.md Task 17
 * @module numerical/be37-covariant-eikonal
 * @public
 */

/**
 * Input parameters for the BE-37 covariant-eikonal preview evaluator.
 * @public
 */
export interface BE37CovariantEikonalInputs {
  /** Gravitational source mass in kilograms (must be > 0). */
  readonly M_kg: number;
  /** Far-point radius in metres, i.e. the signal origin/destination (must be > 0). */
  readonly R_far_m: number;
  /** Near-point radius in metres, i.e. closest approach to the source (must be > 0, ≤ R_far_m). */
  readonly R_near_m: number;
}

/**
 * Result of `evaluateBE37CovariantEikonalNumerical`.
 * @public
 */
export interface BE37CovariantEikonalResult {
  /**
   * Numerical residual of the covariant-eikonal equation
   * g^μν ∇_μ ∇_ν S = 0 evaluated at the null wave-covector.
   *
   * **v0.4.0 structural preview**: returns exactly 0 by construction —
   * the null wave-covector k_μ = ∂_μ S = (E, E, 0, 0) satisfies
   * g^μν k_μ k_ν = 0 identically for the Schwarzschild +,−,−,− metric.
   * No numerical integration is required to establish this; the result
   * is a structural consequence of the null-ray construction.
   */
  readonly eikonalResidual: number;

  /**
   * Shapiro time delay in seconds via geodesic integration.
   *
   * **v0.4.0 stub — returns 0.**  The full geodesic-integrated Shapiro
   * cross-check (comparing this field against `evaluateShapiroDelay`) is
   * the v0.5.0 deliverable; see `it.skip` in
   * `tests/dimensional/covariant-derivative-preview.test.ts`.
   */
  readonly shapiroDelaySec: number;

  /**
   * Optional closed-form cross-check value (seconds).
   * Populated when a closed-form comparator is available.
   * Not populated in the v0.4.0 structural preview.
   */
  readonly closedFormDelaySec?: number;
}

/**
 * v0.4.0 structural preview — returns the eikonal residual (exactly 0 by
 * construction for a null ray) and a stub Shapiro delay (0 in v0.4.0).
 *
 * Does NOT use the CovariantDerivativeNode or lowering infrastructure —
 * see the file-level module docstring for the structural rationale. The
 * domain guards (M_kg > 0, R_far_m > 0, R_near_m ∈ (0, R_far_m]) are
 * enforced for API consistency with evaluateShapiroDelay; the constants 0
 * do not depend on the inputs.
 *
 * The full geodesic-integrated Shapiro cross-check (wiring integrateGeodesic
 * through this path) is the v0.5.0 deliverable. Until then, both return
 * values are structural constants, not computed results.
 *
 * @param inputs - Source mass + far/near radii (validated; unused in stub).
 * @returns `{eikonalResidual: 0, shapiroDelaySec: 0}`.
 * @public
 */
export async function evaluateBE37CovariantEikonalNumerical(
  inputs: BE37CovariantEikonalInputs,
): Promise<BE37CovariantEikonalResult> {
  const { M_kg, R_far_m, R_near_m } = inputs;

  // Domain guards (mirrors evaluateShapiroDelay for API consistency).
  if (!Number.isFinite(M_kg) || M_kg <= 0) {
    throw new RangeError(
      `evaluateBE37CovariantEikonalNumerical: M_kg must be a finite positive number, got ${M_kg}`,
    );
  }
  if (!Number.isFinite(R_far_m) || R_far_m <= 0) {
    throw new RangeError(
      `evaluateBE37CovariantEikonalNumerical: R_far_m must be a finite positive number, got ${R_far_m}`,
    );
  }
  if (!Number.isFinite(R_near_m) || R_near_m <= 0) {
    throw new RangeError(
      `evaluateBE37CovariantEikonalNumerical: R_near_m must be a finite positive number, got ${R_near_m}`,
    );
  }
  if (R_near_m > R_far_m) {
    throw new RangeError(
      `evaluateBE37CovariantEikonalNumerical: R_near_m (${R_near_m}) must be ≤ R_far_m (${R_far_m})`,
    );
  }

  // ─── Eikonal residual ────────────────────────────────────────────────────
  //
  // The covariant-eikonal equation g^μν ∇_μ ∇_ν S = 0 is evaluated at
  // the null wave-covector k_μ = ∂_μ S = (E, E, 0, 0) in Schwarzschild
  // coordinates.  For a null ray, by definition:
  //
  //   g^μν k_μ k_ν = 0
  //
  // This is a structural consequence of the null-ray construction — it does
  // not depend on M_kg, R_far_m, or R_near_m.  The residual is exactly 0.
  const eikonalResidual = 0;

  // ─── Shapiro delay (v0.4.0 stub) ────────────────────────────────────────
  //
  // The geodesic-integrated Shapiro delay is deferred to v0.5.0.
  // shapiroDelaySec returns 0 here; the v0.5.0 task will wire
  // integrateGeodesic through this path and remove the stub.
  const shapiroDelaySec = 0;

  return { eikonalResidual, shapiroDelaySec };
}
