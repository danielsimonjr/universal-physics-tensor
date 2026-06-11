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
 * @see docs/specification/Part-II.md ("Bridge Equation 41: Swampland Distance Conjecture Equation")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 41)
 * @module bridges/equations/be-41-swampland
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
  MASS,
} from '../../dimensional/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

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
const SWAMPLAND_LHS: ExprNode = sym('m_phi', MASS);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateSwampland` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface SwamplandInputs {
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
  validateFiniteInputs(
    input,
    [
      { name: 'm0', min: 0 },
      { name: 'alpha' },
      { name: 'phi' },
      { name: 'phi0' },
      { name: 'M_P', min: 0, excludeMin: true },
    ],
    'evaluateSwampland',
  );
  const { m0, alpha, phi, phi0, M_P } = input;
  const arg = (alpha * Math.abs(phi - phi0)) / M_P;
  return m0 * Math.exp(-arg);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [mass].
 */
/** @internal */
export function validateSwamplandDimensions(): DimensionValidationReport {
  return validateBEDimensions(SWAMPLAND_LHS, SWAMPLAND_RHS, 'BE41');
}
