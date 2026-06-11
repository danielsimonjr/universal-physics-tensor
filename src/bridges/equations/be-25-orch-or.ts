/**
 * @deprecated ARCHIVED IN PLACE (2026-06-11, v0.8.0 P-4 archive policy —
 * closes the v0.7.3-deferred "BE-25 archive-or-delete" decision).
 * BE-25's catalog entry was reformulated to IIT Φ_max
 * (`be-25-iit-phi.ts`) after the Tegmark decoherence falsification of
 * Orch-OR (Tegmark 2000 PRE 61:4194). This module is retained as the
 * historical record of the superseded encoding — the same
 * overlay-not-deletion principle as `src/bridges/rejected.ts` — and is
 * exercised only by its legacy pin tests. Do NOT extend it; new BE-25
 * work belongs in the IIT module.
 *
 * ---- original module docs below ----

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
import {
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
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

// --- Symbolic AST: t_OR = ℏ ℓ_P / (Δm c² Δx) ---

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
 * @internal — typed-arg shape for the file-local `evaluateOrchOR` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
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
  validateFiniteInputs(
    input,
    [
      { name: 'delta_m', min: 0, excludeMin: true },
      { name: 'delta_x', min: 0, excludeMin: true },
    ],
    'evaluateOrchOR',
  );
  const { delta_m, delta_x } = input;
  const { hbar, c, lP } = PhysicalConstants;
  return (hbar * lP) / (delta_m * c * c * delta_x);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [time].
 */
/** @internal */
export function validateOrchORDimensions(): DimensionValidationReport {
  return validateBEDimensions(ORCH_OR_LHS, ORCH_OR_RHS, 'BE25_OrchOR');
}
