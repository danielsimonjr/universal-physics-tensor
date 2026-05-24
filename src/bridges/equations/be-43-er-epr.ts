/**
 * Bridge Equation 43 — ER=EPR Wormhole-Entropy Bound (canonical
 * Bekenstein-Hawking applied to the Einstein-Rosen bridge minimal
 * cross-section, post Wave P-A R-A3 reformulation).
 *
 *   S_entanglement = A_wormhole / (4 ℓ_P²)         [natural units]
 *   S_entanglement = k_B · A_wormhole / (4 ℓ_P²)   [SI form]
 *
 * Equivalently, since ℓ_P² = ℏ G / c³,
 *   S_entanglement = k_B · c³ · A_wormhole / (4 G ℏ)  [BE-14 form]
 *
 * The form encoded here mirrors BE-14 Ryu-Takayanagi's SI convention
 * exactly so the per-bridge dimensional_signature is `[entropy]` (not
 * `[1]` — a dimensionless bit/nat count would also be physically valid
 * but breaks the cross-bridge convention).
 *
 * Reference: Maldacena & Susskind 2013 *Fortschr. Phys.* 61:781
 * (arXiv:1306.0533; canonical ER=EPR statement). Bekenstein 1973
 * *Phys. Rev. D* 7:2333 (original S ~ A/(4 ℓ_P²) BH-entropy bound).
 * Hawking 1975 *Commun. Math. Phys.* 43:199 (canonical S = A/(4 ℓ_P²)
 * prefactor confirmation).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The Bekenstein-Hawking bound itself is canonical; the *bridge
 *     framing* — that entanglement-entropy structure is *equivalent
 *     to* (not merely correlated with) wormhole geometry in the bulk
 *     dual outside the strict eternal-black-hole / thermofield-double
 *     AdS/CFT regime — is the speculative ER=EPR-extension content.
 *   - The minimal cross-section A_wormhole is a free input; computing
 *     it from a concrete bulk geometry (e.g., Stanford-Susskind 2014
 *     complexity-volume duality) is out of scope for the bridge formula.
 *   - We deliberately mirror BE-14's SI convention (`[entropy]`) rather
 *     than the natural-units form `S = A/(4 ℓ_P²)` (which would round-
 *     trip to `[1]`). Both forms are physically equivalent under
 *     k_B = 1; the SI form is canonical for the catalog.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 43: ER=EPR Wormhole-Entropy Bound")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 43)
 * @see src/bridges/equations/be-14-ryu-takayanagi.ts (mirrored convention)
 * @module bridges/equations/be-43-er-epr
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  AREA,
  DIMENSIONLESS,
  ENTROPY,
} from '../../dimensional/types.js';
import {
  k_B as DIM_kB,
  l_P as DIM_lP,
} from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the ER=EPR wormhole-entropy bound (SI form):
 *   S = k_B · A_wormhole / (4 · ℓ_P²)
 *
 * `[entropy] · [L²] / [L²] = [entropy]` — round-trips to `[entropy]`.
 */
export const BE43_ER_EPR_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      // numerator: k_B · A_wormhole
      kind: 'op', op: '*',
      args: [
        sym('k_B', DIM_kB),
        sym('A_wormhole', AREA),
      ],
    },
    {
      // denominator: 4 · ℓ_P²
      kind: 'op', op: '*',
      args: [
        sym('4', DIMENSIONLESS),
        {
          kind: 'op', op: '^',
          args: [sym('lP', DIM_lP), sym('2', DIMENSIONLESS)],
        },
      ],
    },
  ],
};

/** LHS: S_entanglement has dimension [entropy]. */
export const BE43_ER_EPR_LHS: ExprNode = sym('S_entanglement', ENTROPY);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateEREPRBound` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
export interface EREPRBoundInputs {
  /** Wormhole minimal cross-section area (m²). Must be ≥ 0 and finite. */
  area_m2: number;
}

/**
 * Evaluate the ER=EPR wormhole-entropy bound in SI units:
 *
 *   S_entanglement = k_B · A_wormhole / (4 · ℓ_P²)
 *
 * with ℓ_P² = ℏ G / c³ (Planck-length squared, ~2.612e-70 m²).
 *
 * @returns Entanglement entropy in J/K (SI).
 */
export function evaluateEREPRBound(input: EREPRBoundInputs): number {
  const { area_m2 } = input;
  if (!Number.isFinite(area_m2) || area_m2 < 0) {
    throw new RangeError(
      `evaluateEREPRBound: area_m2 must be a finite non-negative number, got ${area_m2}`,
    );
  }
  const { kB, c, G, hbar } = PhysicalConstants;
  const lP_sq = (hbar * G) / (c * c * c);
  return (kB * area_m2) / (4 * lP_sq);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [entropy].
 */
export function validateBE43Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE43_ER_EPR_LHS, BE43_ER_EPR_RHS);
  const lhs = validate(BE43_ER_EPR_LHS);
  const rhs = validate(BE43_ER_EPR_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
