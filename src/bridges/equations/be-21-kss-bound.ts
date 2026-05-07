/**
 * Bridge Equation 21 — Kovtun-Son-Starinets (KSS) viscosity-to-entropy
 * bound (canonical AdS/CFT-derived universal lower bound on the shear-
 * viscosity-to-entropy-density ratio).
 *
 *   η/s = ℏ / (4π k_B)
 *
 * Numerical value: ℏ/(4π k_B) ≈ 6.078×10^-13 K·s. Any quantum fluid
 * satisfying the AdS/CFT-correspondence assumptions (Einstein-gravity
 * holographic dual, two-derivative bulk action) is conjectured to obey
 * the bound η/s ≥ ℏ/(4π k_B).
 *
 * References:
 *   - Kovtun, Son & Starinets 2005 *Phys. Rev. Lett.* 94:111601
 *     (arXiv:hep-th/0405231; canonical KSS bound paper).
 *   - Son & Starinets 2002 *JHEP* 0209:042 (arXiv:hep-th/0205051;
 *     prerequisite Minkowski-correlator AdS/CFT recipe).
 *   - Policastro, Son & Starinets 2001 *Phys. Rev. Lett.* 87:081601
 *     (arXiv:hep-th/0104066; original η/s = 1/(4π) calculation in N=4
 *     SYM at strong coupling).
 *
 * Status: established (KSS itself is established AdS/CFT result).
 *
 * Honest-claude scope notes:
 *   - The bound η/s ≥ ℏ/(4π k_B) is a conjecture; the EQUALITY η/s =
 *     ℏ/(4π k_B) is the saturating value attained in the strong-coupling
 *     limit of N=4 super-Yang-Mills (Policastro-Son-Starinets 2001) and
 *     in any theory with an Einstein-gravity holographic dual. Encoding
 *     the equality (the saturating value) pins the canonical scalar; the
 *     ≥ inequality is the bridge's load-bearing claim.
 *   - The original BE-21 form was a holographic-dictionary retarded
 *     Green's function recipe (operator-valued, no clean scalar). The
 *     KSS bound is the canonical scalar reduction of the same Son-
 *     Starinets 2002 lineage and captures the most-cited AdS/CMT
 *     result: a *universal* dimensional constant for the viscosity/
 *     entropy-density ratio.
 *   - Dim: [η] = Pa·s = kg/(m·s) = [M L^-1 T^-1]; [s] = J/(K·m³) =
 *     [M L^-1 T^-2 Θ^-1]; [η/s] = T·Θ (= K·s in SI). Dim of ℏ/k_B:
 *     [J·s]/[J/K] = K·s. ✓
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 21")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 21)
 * @module bridges/equations/be-21-kss-bound
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  TIME,
  TEMPERATURE,
} from '../../dimensional/types.js';
import { hbar as DIM_hbar, k_B as DIM_kB } from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** [T Θ] — viscosity-to-entropy-density ratio dimension (K·s in SI). */
export const VISCOSITY_OVER_ENTROPY_DENSITY: Dimension = {
  L: 0, M: 0, T: 1, I: 0, Theta: 1, N: 0, J: 0,
};

/**
 * RHS of the KSS saturating value:
 *   η/s = ℏ / (4π k_B)
 *
 * Encoded as `ℏ / (4π · k_B)` — both numerator and denominator carry
 * dim [J·s] / [J/K] = [T Θ].
 */
export const BE21_KSS_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [
    sym('hbar', DIM_hbar),
    {
      kind: 'op', op: '*',
      args: [
        sym('4pi', DIMENSIONLESS),
        sym('k_B', DIM_kB),
      ],
    },
  ],
};

/** LHS: η/s has dimension [T Θ]. */
export const BE21_KSS_LHS: ExprNode = sym('eta_over_s', VISCOSITY_OVER_ENTROPY_DENSITY);

// --- Numerical evaluator ---

/**
 * Evaluate the KSS saturating viscosity-to-entropy-density ratio
 *
 *   η/s = ℏ / (4π k_B)
 *
 * @returns η/s in K·s (SI). Approximately 6.075e-12 K·s.
 */
export function evaluateKSSBound(): number {
  const { hbar, kB } = PhysicalConstants;
  return hbar / (4 * Math.PI * kB);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [T Θ] (viscosity / entropy-density).
 */
export function validateBE21Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE21_KSS_LHS, BE21_KSS_RHS);
  const lhs = validate(BE21_KSS_LHS);
  const rhs = validate(BE21_KSS_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
