/**
 * Bridge Equation 36 — GW170817 graviton-speed bound (post Wave Y
 * reformulation).
 *
 *   |c_GW − c| / c  ≤  10⁻¹⁵
 *
 * The empirical constraint from the GW170817 binary-neutron-star
 * merger / GRB170817A coincidence: the gravitational-wave speed and
 * the photon speed agree to ~1 part in 10¹⁵, derived from the 1.74 s
 * arrival-time difference over the CONSERVATIVE 26 Mpc lower distance
 * bound (40 Mpc is the central luminosity distance; the paper's speed
 * constraint uses 26 Mpc — Abbott et al. 2017 *ApJ Lett.* 848:L13 §3;
 * Boran et al. 2018 *Phys. Rev. D* 97:041501). The published bound is
 * ASYMMETRIC: −3×10⁻¹⁵ ≤ (c_GW − c)/c ≤ +7×10⁻¹⁶ (the lower side
 * assumes a 10 s intrinsic EM-emission delay). The symmetric
 * |·| ≤ 10⁻¹⁵ encoded here is a simplification whose negative side is
 * slightly tighter than the published −3×10⁻¹⁵ — see
 * `src/bridges/be36-gw170817-confrontation.ts` (v0.8.0) for the
 * recomputed-from-data confrontation. This bound rules out or strongly
 * constrains TeVeS-class theories that generically predict c_GW ≠ c.
 *
 * The encoded scalar is the dimensionless ratio (c_GW − c)/c
 * (signed). The bound itself is `|·| ≤ 10⁻¹⁵`; for GR (c_GW = c
 * exactly), the LHS is 0.
 *
 * References:
 *   - Abbott et al. (LIGO/Virgo + INTEGRAL Collaborations) 2017 *ApJ
 *     Lett.* 848:L13 (arXiv:1710.05832; multi-messenger GW170817 +
 *     GRB170817A coincidence; |Δv|/c ≲ 10⁻¹⁵).
 *   - Boran, Desai, Kahya & Woodard 2018 *Phys. Rev. D* 97:041501
 *     (arXiv:1710.06168; GW170817 constraint on TeVeS-class theories).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The TeVeS framework (Bekenstein 2004, the original BE-36 form)
 *     is preserved as the bridge framing; the GW170817 dimensionless
 *     ratio is the AST-encodable scalar bound.
 *   - For GR (c_GW = c), the encoded ratio is 0 ≤ 10⁻¹⁵ ✓ (trivially).
 *   - For TeVeS variants where c_GW ≠ c, the |ratio| must be bounded
 *     above by 10⁻¹⁵ to remain consistent with GW170817.
 *   - The AST encodes the signed ratio (c_GW − c)/c; the absolute
 *     value is computed in the numerical evaluator (Math.abs).
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 36")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 36)
 * @module bridges/equations/be-36-gw-speed-bound
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
  VELOCITY,
} from '../../dimensional/types.js';
import { PhysicalConstants } from '../../core/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

/**
 * RHS of the GW170817 dimensionless ratio:
 *   ratio = (c_GW − c) / c
 *
 * Both numerator and denominator are velocities; ratio is
 * DIMENSIONLESS.
 */
export const BE36_GW_SPEED_RATIO_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      kind: 'op', op: '-',
      args: [
        sym('c_GW', VELOCITY),
        sym('c', VELOCITY),
      ],
    },
    sym('c', VELOCITY),
  ],
};

/** LHS: signed dimensionless graviton-photon speed-difference ratio. */
/** @internal */
export const BE36_GW_SPEED_RATIO_LHS: ExprNode = sym('delta_v_over_c', DIMENSIONLESS);

/** Canonical GW170817 upper bound on |Δv|/c. */
export const GW170817_SPEED_BOUND = 1e-15;

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateGWSpeedRatio` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface GWSpeedRatioInputs {
  /** Gravitational-wave speed c_GW (m/s). Must be > 0 and finite. */
  c_GW_m_per_s: number;
}

/**
 * Evaluate the signed dimensionless ratio (c_GW − c)/c.
 *
 * @returns Signed ratio. For GR, c_GW = c exactly and ratio = 0.
 */
export function evaluateGWSpeedRatio(input: GWSpeedRatioInputs): number {
  validateFiniteInputs(
    input,
    [{ name: 'c_GW_m_per_s', min: 0, excludeMin: true }],
    'evaluateGWSpeedRatio',
  );
  const { c_GW_m_per_s } = input;
  const { c } = PhysicalConstants;
  return (c_GW_m_per_s - c) / c;
}

/**
 * Check whether a candidate c_GW satisfies the GW170817 bound
 * |(c_GW − c)/c| ≤ 10⁻¹⁵.
 *
 * @returns true if |ratio| is at or below the bound.
 */
export function satisfiesGW170817Bound(input: GWSpeedRatioInputs): boolean {
  return Math.abs(evaluateGWSpeedRatio(input)) <= GW170817_SPEED_BOUND;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * DIMENSIONLESS.
 */
/** @internal */
export function validateBE36Dimensions(): DimensionValidationReport {
  return validateBEDimensions(BE36_GW_SPEED_RATIO_LHS, BE36_GW_SPEED_RATIO_RHS, 'BE36');
}
