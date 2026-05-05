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
 *     status_text "n ~ (τ_Q/τ_0)^... " in the spec notes).
 *
 * @module bridges/equations/be-34-kibble-zurek
 */

import type { ExprNode } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
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

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

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
 * RHS of Kibble-Zurek with curvature: `(τ_Q/τ_0)^(-1/2) · ε`, where ε is
 * a dimensionless stub for the exp factor. The chosen exponent (−0.5)
 * is the canonical (d, ν, z) = (1, 1, 1) case — dimensional analysis is
 * exponent-agnostic.
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
    sym('exp(-m*c^2/(k_B*T_reh))', DIMENSIONLESS),
  ],
};

/** LHS: n_defect is dimensionless (scaling ratio, no length scale in the formula). */
export const KIBBLE_ZUREK_LHS: ExprNode = sym('n_defect', DIMENSIONLESS);

// --- Numerical evaluator ---

export interface KibbleZurekInputs {
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
  const { tau_Q, tau_0, d, nu, z, m_defect, T_reh } = input;
  if (!Number.isFinite(tau_Q) || tau_Q <= 0) {
    throw new RangeError(
      `evaluateKibbleZurek: tau_Q must be a finite positive number, got ${tau_Q}`,
    );
  }
  if (!Number.isFinite(tau_0) || tau_0 <= 0) {
    throw new RangeError(
      `evaluateKibbleZurek: tau_0 must be a finite positive number, got ${tau_0}`,
    );
  }
  if (!Number.isFinite(d) || !Number.isFinite(nu) || !Number.isFinite(z)) {
    throw new RangeError(
      `evaluateKibbleZurek: d, nu, z must be finite, got ${d}, ${nu}, ${z}`,
    );
  }
  const denom = 1 + z * nu;
  if (denom === 0) {
    throw new RangeError(
      `evaluateKibbleZurek: 1 + z*nu must be non-zero (got ${denom})`,
    );
  }
  if (!Number.isFinite(m_defect) || m_defect < 0) {
    throw new RangeError(
      `evaluateKibbleZurek: m_defect must be a finite non-negative number, got ${m_defect}`,
    );
  }
  if (!Number.isFinite(T_reh) || T_reh <= 0) {
    throw new RangeError(
      `evaluateKibbleZurek: T_reh must be a finite positive number, got ${T_reh}`,
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

export interface DimensionValidationReport {
  ok: boolean;
  lhsDim: Dimension | null;
  rhsDim: Dimension | null;
}

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * dimensionless [1].
 */
export function validateKibbleZurekDimensions(): DimensionValidationReport {
  const eq = validateEquation(KIBBLE_ZUREK_LHS, KIBBLE_ZUREK_RHS);
  const lhs = validate(KIBBLE_ZUREK_LHS);
  const rhs = validate(KIBBLE_ZUREK_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
