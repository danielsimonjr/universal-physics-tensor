/**
 * Bridge Equation 34 — Kibble-Zurek Mechanism in Curved Spacetime.
 *
 *   n_defect = (τ_Q / τ_0)^(−dν/(1+zν)) · exp(−m_defect c² / (k_B T_reh))
 *
 * Reference: Kibble 1976 J. Phys. A 9:1387; Zurek 1985 Nature 317:505.
 * The exp(−m c²/(k_B T_reh)) Boltzmann suppression for curved-spacetime
 * defects is the additive 'Established extension' from the spec.
 *
 * Status: established.
 *
 * Honest-claude scope notes:
 *   - The AST `^` op requires a numeric symbol exponent. We encode the
 *     CANONICAL (d, ν, z) = (1, 1, 1) case → exponent = −1/2 in the
 *     symbolic AST. The dimensional answer is the same for any real
 *     exponent (dimensionless ratio raised to a number is dimensionless),
 *     so the encoded RHS is dimensionally faithful for ALL universality
 *     classes; the chosen `-0.5` only fixes the bracket-check scaling.
 *   - The Boltzmann factor exp(−m c²/(k_B T_reh)) is encoded as a
 *     dimensionless symbol stub (BE-41 pattern). The exp argument
 *     `m c² / (k_B T_reh)` is exposed as a separate ExprNode
 *     `KIBBLE_ZUREK_EXP_ARG` and verified dimensionless.
 *   - LHS `n_defect` is encoded DIMENSIONLESS — the formula has no
 *     length scale, so n is a pure scaling ratio (consistent with
 *     status_text "n ~ (τ_Q/τ_0)^... " in the spec notes). The spec
 *     form's missing `1/a^d` prefactor (the canonical n_defect should
 *     be `[L]^(-d)`) is now tracked as a structured `severity:
 *     'dimensional'` `KnownIssue` on the bridge index entry — see
 *     `src/bridges/index.ts` BE-34 `known_issues[0]`.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 34: Kibble-Zurek Mechanism in Curved Spacetime")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 34)
 * @module bridges/equations/be-34-kibble-zurek
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
  TIME,
  MASS,
  TEMPERATURE,
} from '../../dimensional/types.js';
import {
  c as DIM_c,
  k_B as DIM_kB,
} from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

/**
 * Lemma AST: the Boltzmann argument m_defect c² / (k_B T_reh).
 */
export const KIBBLE_ZUREK_EXP_ARG: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      // numerator: m · c²
      kind: 'op', op: '*',
      args: [
        sym('m_defect', MASS),
        {
          kind: 'op', op: '^',
          args: [sym('c', DIM_c), sym('2', DIMENSIONLESS)],
        },
      ],
    },
    {
      // denominator: k_B · T_reh
      kind: 'op', op: '*',
      args: [
        sym('k_B', DIM_kB),
        sym('T_reh', TEMPERATURE),
      ],
    },
  ],
};

/**
 * RHS of Kibble-Zurek with curvature: `(τ_Q/τ_0)^(-1/2) · exp(−m c²/(k_B T_reh))`.
 * The exp factor is encoded faithfully with the `transcendental` grammar node
 * (v0.18) — `exp(−1 · KIBBLE_ZUREK_EXP_ARG)` — so m_defect, c, k_B, T_reh inside
 * the Boltzmann argument are visible to differentiation. `exp` of a DIMENSIONLESS
 * argument is DIMENSIONLESS, so the inferred RHS dimension (and the round-trip
 * dimensional_signature) is unchanged from the former symbol stub. The chosen
 * (τ_Q/τ_0) exponent (−0.5) is the canonical (d, ν, z) = (1, 1, 1) case —
 * dimensional analysis is exponent-agnostic.
 */
export const KIBBLE_ZUREK_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    {
      kind: 'op', op: '^',
      args: [
        {
          kind: 'op', op: '/',
          args: [sym('tau_Q', TIME), sym('tau_0', TIME)],
        },
        sym('-0.5', DIMENSIONLESS), // canonical d=ν=z=1 exponent
      ],
    },
    {
      kind: 'transcendental',
      fn: 'exp',
      arg: {
        kind: 'op', op: '*',
        args: [sym('-1', DIMENSIONLESS), KIBBLE_ZUREK_EXP_ARG],
      },
    },
  ],
};

/** LHS: n_defect is dimensionless (scaling ratio, no length scale in the formula). */
const KIBBLE_ZUREK_LHS: ExprNode = sym('n_defect', DIMENSIONLESS);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateKibbleZurek` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface KibbleZurekInputs {
  /** Quench timescale τ_Q (s). Must be > 0. */
  tau_Q: number;
  /** Microscopic relaxation time τ_0 (s). Must be > 0. */
  tau_0: number;
  /** Spatial dimension d (typically 1, 2, 3). */
  d: number;
  /** Static correlation-length exponent ν. */
  nu: number;
  /** Dynamic exponent z. */
  z: number;
  /** Defect rest mass (kg). Must be ≥ 0. */
  m_defect: number;
  /** Reheating temperature (K). Must be > 0. */
  T_reh: number;
}

/**
 * Evaluate n_defect = (τ_Q / τ_0)^(−dν/(1+zν)) · exp(−m c²/(k_B T_reh)).
 *
 * @returns Dimensionless n_defect.
 */
export function evaluateKibbleZurek(input: KibbleZurekInputs): number {
  // Helper covers 6 of the 7 per-field standard checks. The
  // cross-field `(1 + z*nu) !== 0` constraint stays inline.
  validateFiniteInputs(
    input,
    [
      { name: 'tau_Q', min: 0, excludeMin: true },
      { name: 'tau_0', min: 0, excludeMin: true },
      { name: 'd' },
      { name: 'nu' },
      { name: 'z' },
      { name: 'm_defect', min: 0 },
      { name: 'T_reh', min: 0, excludeMin: true },
    ],
    'evaluateKibbleZurek',
  );
  const { tau_Q, tau_0, d, nu, z, m_defect, T_reh } = input;
  const denom = 1 + z * nu;
  if (denom === 0) {
    throw new RangeError(
      `evaluateKibbleZurek: 1 + z*nu must be non-zero (got ${denom})`,
    );
  }
  const exponent = -(d * nu) / denom;
  const ratio = tau_Q / tau_0;
  const scaling = Math.pow(ratio, exponent);
  const { c, kB } = PhysicalConstants;
  const arg = (m_defect * c * c) / (kB * T_reh);
  return scaling * Math.exp(-arg);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * dimensionless [1].
 */
/** @internal */
export function validateKibbleZurekDimensions(): DimensionValidationReport {
  return validateBEDimensions(KIBBLE_ZUREK_LHS, KIBBLE_ZUREK_RHS, 'BE34');
}
