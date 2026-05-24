/**
 * ============================================================================
 *  ARCHIVED MODULE — DO NOT USE FOR BE-25 DIMENSIONAL CLAIMS
 *  Archived 2026-05-06 (Wave Q B2, per CS iter-6 C2).
 *
 *  This module encodes the dropped Penrose-Hameroff `t_OR` collapse-time
 *  form. BE-25 was reformulated to canonical IIT Φ_max in Wave P-D R-D2
 *  (2026-05-06). The IIT form is substrate-agnostic and Φ has no SI
 *  dimension (units are bits when log₂ is used), so this AST is no
 *  longer load-bearing for any bridge-equation claim.
 *
 *  The module is preserved for historical traceability and for
 *  regression-testing the dimensional analyzer (via
 *  `tests/bridges/be-25-encoding.test.ts`). It has been removed from
 *  `EXPECTED_DIMENSION_BY_BRIDGE` (`src/dimensional/bridge-check.ts`)
 *  and from the round-trip `dimensional-signature-catalog.test.ts`.
 * ============================================================================
 *
 * Bridge Equation 25 — Penrose-Hameroff Orch-OR Collapse Time (DROPPED).
 *
 *   t_OR = ℏ / E_G = ℏ / (Δm c² Δx / ℓ_P) = ℏ ℓ_P / (Δm c² Δx)
 *
 * Where Δm is the mass difference between the superposed states and Δx
 * is their separation. The denominator quantity E_G is interpreted as
 * a gravitational self-energy.
 *
 * Reference: Penrose 1996 Gen. Rel. Grav. 28:581; Hameroff-Penrose 1996.
 *
 * Status: archived (was 'highly-speculative' before Wave L Tier E3
 * 'invalid' before Wave P-D R-D2 IIT reformulation).
 *
 * Honest-claude scope notes:
 *   - The spec's E_G = Δm c² Δx / ℓ_P contains a Δx/ℓ_P factor not
 *     present in Penrose's original gravitational self-energy
 *     E_G ~ G(Δm)²/Δx — see the BE-25 known_issues entry. We encode
 *     the spec-as-written; the bracket-check therefore gives a
 *     sub-Planckian collapse time, NOT Penrose's ms-order prediction.
 *     This is faithful to the spec and consistent with the documented
 *     issue.
 *   - Mainstream Tegmark 2000 (arXiv:quant-ph/9907009) decoherence
 *     analysis is also preserved as a known_issue on the entry; this
 *     module does not address that critique.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 25: Consciousness - Quantum Information Bridge")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 25)
 * @module bridges/equations/be-25-orch-or
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  TIME,
  MASS,
  LENGTH,
} from '../../dimensional/types.js';
import {
  hbar as DIM_hbar,
  c as DIM_c,
  l_P as DIM_lP,
} from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

// --- Symbolic AST: t_OR = ℏ ℓ_P / (Δm c² Δx) ---

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the Orch-OR collapse-time formula as a typed ExprNode tree.
 *
 * t_OR = (ℏ · ℓ_P) / (Δm · c² · Δx)
 *
 * This is the algebraic re-arrangement of `ℏ / (Δm c² Δx / ℓ_P)`; the
 * spec-form is preserved in the encoding but written with the inverse
 * brought out so the AST has a clean numerator / denominator structure.
 */
export const ORCH_OR_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      // numerator: ℏ · ℓ_P
      kind: 'op', op: '*',
      args: [
        sym('hbar', DIM_hbar),
        sym('l_P', DIM_lP),
      ],
    },
    {
      // denominator: Δm · c² · Δx
      kind: 'op', op: '*',
      args: [
        sym('Delta_m', MASS),
        {
          kind: 'op', op: '^',
          args: [sym('c', DIM_c), sym('2', { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 })],
        },
        sym('Delta_x', LENGTH),
      ],
    },
  ],
};

/** LHS: t_OR has dimension [time]. */
const ORCH_OR_LHS: ExprNode = sym('t_OR', TIME);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateOrchOR` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface OrchORInputs {
  /** Mass difference Δm in kg. Must be > 0. */
  delta_m: number;
  /** Spatial separation Δx in m. Must be > 0. */
  delta_x: number;
}

/**
 * Evaluate t_OR = ℏ ℓ_P / (Δm c² Δx).
 *
 * @returns Orch-OR collapse time in seconds.
 */
export function evaluateOrchOR(input: OrchORInputs): number {
  const { delta_m, delta_x } = input;
  if (!Number.isFinite(delta_m) || delta_m <= 0) {
    throw new RangeError(
      `evaluateOrchOR: delta_m must be a finite positive number, got ${delta_m}`,
    );
  }
  if (!Number.isFinite(delta_x) || delta_x <= 0) {
    throw new RangeError(
      `evaluateOrchOR: delta_x must be a finite positive number, got ${delta_x}`,
    );
  }
  const { hbar, c, lP } = PhysicalConstants;
  return (hbar * lP) / (delta_m * c * c * delta_x);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [time].
 */
export function validateOrchORDimensions(): DimensionValidationReport {
  const eq = validateEquation(ORCH_OR_LHS, ORCH_OR_RHS);
  const lhs = validate(ORCH_OR_LHS);
  const rhs = validate(ORCH_OR_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
