/**
 * Bridge Equation 27 — Cugliandolo-Kurchan effective temperature
 * (active-noise-corrected scalar form, post Wave Y reformulation).
 *
 *   T_eff = T · (1 + Σ_active / (k_B T))
 *
 * The effective temperature in non-equilibrium / active-matter systems
 * (Cugliandolo-Kurchan 1993 *J. Phys. A* 26:L401; Cugliandolo 2011
 * *J. Phys. A* 44:483001 review). For systems driven by an active
 * noise source, the Fluctuation-Dissipation Theorem (FDT) is violated;
 * the effective temperature `T_eff(ω)` rescales T to recover an FDT-
 * like relation `χ''(ω) = (ω/2 k_B T_eff) S(ω)`. The encoded scalar
 * form linearizes the active-noise correction as `T · Σ_active/(k_B T)`,
 * which captures the leading-order FDT violation amplitude.
 *
 * References:
 *   - Cugliandolo & Kurchan 1993 *J. Phys. A* 26:L401 (canonical
 *     fluctuation-dissipation in glasses; effective-temperature
 *     framework).
 *   - Cugliandolo 2011 *J. Phys. A* 44:483001 (review).
 *   - Marchetti et al. 2013 *Rev. Mod. Phys.* 85:1143 (active-matter
 *     hydrodynamics; canonical reference for active-noise-driven
 *     T_eff).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The CK effective-temperature framework is canonical for glasses
 *     and slow-relaxation systems; the *bridge framing* — applying it
 *     as a UPT non-equilibrium-statmech bridge — is the speculative
 *     element.
 *   - The encoded scalar form `T_eff = T(1 + Σ_active/(k_B T))` is a
 *     leading-order linearization of the full Cugliandolo-Kurchan FDT
 *     violation. It collapses to T_eff = T when Σ_active = 0 (passive
 *     equilibrium); it grows linearly with Σ_active for fixed T.
 *   - Σ_active represents the active-noise contribution in
 *     active-matter systems (e.g., self-propelled colloids, swimming
 *     bacteria). Energy dimension follows from the requirement that
 *     Σ_active/(k_B T) be dimensionless.
 *   - Dim: [T_eff] = Θ; [T] = Θ; [Σ_active/(k_B T)] = energy/energy
 *     = [1]; product T · [1] = [Θ]. ✓
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 27")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 27)
 * @module bridges/equations/be-27-effective-temperature
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  ENERGY,
  TEMPERATURE,
} from '../../dimensional/types.js';
import { k_B as DIM_kB } from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the Cugliandolo-Kurchan effective-temperature scalar form:
 *   T_eff = T · (1 + Σ_active / (k_B T))
 *
 * Encoded as `T · (1 + Σ_active/(k_B T))`. The `1` and `Σ_active/(k_BT)`
 * are both dimensionless, so their sum is dimensionless; multiplying by
 * T yields [Θ].
 */
export const BE27_TEFF_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('T', TEMPERATURE),
    {
      kind: 'op', op: '+',
      args: [
        sym('1', DIMENSIONLESS),
        {
          kind: 'op', op: '/',
          args: [
            sym('Sigma_active', ENERGY),
            {
              kind: 'op', op: '*',
              args: [
                sym('k_B', DIM_kB),
                sym('T', TEMPERATURE),
              ],
            },
          ],
        },
      ],
    },
  ],
};

/** LHS: T_eff has dimension [temperature]. */
export const BE27_TEFF_LHS: ExprNode = sym('T_eff', TEMPERATURE);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateEffectiveTemperature` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface EffectiveTemperatureInputs {
  /** Bath temperature T (K). Must be > 0 and finite. */
  T_K: number;
  /**
   * Active-noise contribution Σ_active (J). May be 0 (passive
   * equilibrium) or positive (driven active matter). Must be finite.
   */
  Sigma_active_J: number;
}

/**
 * Evaluate the effective temperature
 *
 *   T_eff = T · (1 + Σ_active / (k_B T))
 *
 * @returns Effective temperature in K.
 */
export function evaluateEffectiveTemperature(
  input: EffectiveTemperatureInputs,
): number {
  const { T_K, Sigma_active_J } = input;
  if (!Number.isFinite(T_K) || T_K <= 0) {
    throw new RangeError(
      `evaluateEffectiveTemperature: T_K must be a finite positive number, got ${T_K}`,
    );
  }
  if (!Number.isFinite(Sigma_active_J)) {
    throw new RangeError(
      `evaluateEffectiveTemperature: Sigma_active_J must be finite, got ${Sigma_active_J}`,
    );
  }
  const { kB } = PhysicalConstants;
  return T_K * (1 + Sigma_active_J / (kB * T_K));
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [temperature].
 */
export function validateBE27Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE27_TEFF_LHS, BE27_TEFF_RHS);
  const lhs = validate(BE27_TEFF_LHS);
  const rhs = validate(BE27_TEFF_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
