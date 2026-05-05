/**
 * Bridge Equation 41 — Swampland Distance Conjecture.
 *
 *   m(φ) = m₀ exp(−α |φ − φ₀| / M_P)
 *
 * As one moves in scalar-field-space by a Planck distance ~M_P, an
 * infinite tower of states becomes exponentially light. α is an
 * O(1) dimensionless coefficient.
 *
 * Reference: Vafa 2005 "The String Landscape and the Swampland"
 * (arXiv:hep-th/0509212); Ooguri-Vafa 2007 Nucl. Phys. B 766:21.
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The current AST has no `exp` primitive. We encode the relation
 *     `m(φ) = m₀ · ε` where ε is a dimensionless symbol named
 *     `exp(-α|φ-φ₀|/M_P)`, and we expose the exp ARGUMENT as a
 *     separate ExprNode `SWAMPLAND_EXP_ARG` so a downstream consumer
 *     (and the test suite) can verify the argument is dimensionless.
 *     This pattern preserves the structural information that an exp
 *     factor is present and that its argument carries no dimension,
 *     without lying that the AST 'understands' exp.
 *   - φ is encoded with dim of [mass] (canonically normalized scalar
 *     field; matches M_P).
 *
 * @module bridges/equations/be-41-swampland
 */

import type { ExprNode } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  MASS,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * Lemma AST: the exp argument α(φ−φ₀)/M_P, exposed for verification
 * that it is dimensionless.
 */
export const SWAMPLAND_EXP_ARG: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('alpha', DIMENSIONLESS),
    {
      kind: 'op', op: '/',
      args: [
        // |φ − φ₀| — the absolute value preserves dimension; we encode
        // the difference and rely on numerical evaluator for |·|.
        {
          kind: 'op', op: '-',
          args: [
            sym('phi', MASS),
            sym('phi_0', MASS),
          ],
        },
        sym('M_P', MASS),
      ],
    },
  ],
};

/**
 * RHS of the Swampland mass relation: `m₀ · ε`, where ε is a
 * dimensionless symbol standing for exp(SWAMPLAND_EXP_ARG).
 */
export const SWAMPLAND_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('m_0', MASS),
    sym('exp(-alpha*|phi-phi_0|/M_P)', DIMENSIONLESS),
  ],
};

/** LHS: m(φ) has dimension [mass]. */
export const SWAMPLAND_LHS: ExprNode = sym('m_phi', MASS);

// --- Numerical evaluator ---

export interface SwamplandInputs {
  /** Reference mass m₀. Must be ≥ 0 (any consistent unit; output in same unit). */
  m0: number;
  /** Dimensionless O(1) coefficient α. */
  alpha: number;
  /** Scalar-field value φ (any consistent unit; must match phi0 and M_P). */
  phi: number;
  /** Scalar-field reference φ₀. */
  phi0: number;
  /** Planck mass M_P (same unit as phi, phi0). Must be > 0. */
  M_P: number;
}

/**
 * Evaluate m(φ) = m₀ · exp(−α |φ − φ₀| / M_P).
 *
 * @returns m in the same unit as m0.
 */
export function evaluateSwampland(input: SwamplandInputs): number {
  const { m0, alpha, phi, phi0, M_P } = input;
  if (!Number.isFinite(m0) || m0 < 0) {
    throw new RangeError(
      `evaluateSwampland: m0 must be a finite non-negative number, got ${m0}`,
    );
  }
  if (!Number.isFinite(alpha)) {
    throw new RangeError(`evaluateSwampland: alpha must be finite, got ${alpha}`);
  }
  if (!Number.isFinite(phi) || !Number.isFinite(phi0)) {
    throw new RangeError(
      `evaluateSwampland: phi/phi0 must be finite, got ${phi}/${phi0}`,
    );
  }
  if (!Number.isFinite(M_P) || M_P <= 0) {
    throw new RangeError(
      `evaluateSwampland: M_P must be a finite positive number, got ${M_P}`,
    );
  }
  const arg = (alpha * Math.abs(phi - phi0)) / M_P;
  return m0 * Math.exp(-arg);
}

// --- Self-validation ---

export interface DimensionValidationReport {
  ok: boolean;
  lhsDim: Dimension | null;
  rhsDim: Dimension | null;
}

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [mass].
 */
export function validateSwamplandDimensions(): DimensionValidationReport {
  const eq = validateEquation(SWAMPLAND_LHS, SWAMPLAND_RHS);
  const lhs = validate(SWAMPLAND_LHS);
  const rhs = validate(SWAMPLAND_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
