/**
 * Bridge Equation 19 — Quantum Bounce (LQC modified Friedmann).
 *
 *   H² = (8πG/3) ρ (1 − ρ/ρ_crit) + Λ/3
 *
 * H is the Hubble parameter [T^-1], ρ is energy/mass density [M L^-3],
 * ρ_crit is the LQC bounce critical density [M L^-3], and Λ is the
 * cosmological constant expressed in [T^-2] form (i.e. c² · Λ_[L^-2]).
 *
 * Reference: Ashtekar-Singh 2011 review "Loop Quantum Cosmology: A
 * Status Report" (arXiv:1108.0893). The (1 − ρ/ρ_crit) bounce factor is
 * the LQC correction to standard Friedmann; at ρ = ρ_crit, H² = Λ/3 and
 * the universe momentarily halts before re-expanding.
 *
 * Status: speculative — LQC-inspired. Reformulated 2026-05-05 (Wave I.B C1)
 * to the canonical Ashtekar-Pawlowski-Singh γ-dependent form:
 *   ρ_crit = (√3 / (32π² γ³ ℓ_P²)) · (c²/G),   γ ≈ 0.2375
 * which yields ρ_crit ≈ 0.41 ρ_Planck ≈ 2.1×10⁹⁶ kg/m³ (Ashtekar-Pawlowski-
 * Singh 2006 *Phys. Rev. D* 74:084003, arXiv:gr-qc/0607039; Ashtekar-Singh
 * review arXiv:1108.0893; Meissner 2004 γ-fix gr-qc/0407052). The earlier
 * dimensional-estimate ρ_crit = 3c²/(8πGℓ_P²) (~6.2×10⁹⁵ kg/m³) was off
 * by ~3.4× because it omitted the γ³ Barbero-Immirzi factor.
 *
 * Reformulated 2026-05-06 (Wave P-A Tier 0-2, per Math iter-5 CRIT-2):
 * docstring prefactor synced from "16π²" to "32π²" to match Part-I §6
 * (Wave N Tier B reconciliation) and the formula_latex in
 * src/bridges/index.ts BE-19. The "16π²" form yielded ~0.82 ρ_Planck
 * (factor-of-2 off the canonical 0.41 ρ_Planck literature value).
 *
 * The AST takes ρ_crit as a free numerical input — the formula change in
 * the spec/index does NOT require re-encoding here. Tests pinning the
 * old "spec form" numerical value have been updated alongside this fix.
 *
 * Honest-claude scope notes:
 *   - We model Λ as a symbol in [T^-2]. The standard GR `Λ` has SI
 *     dimension [L^-2]; the rescaling `Λ_[T^-2] = c² Λ_[L^-2]` is the
 *     natural convention when writing `H² = ... + Λ/3` (compare Ryden,
 *     "Introduction to Cosmology" 2nd ed., §6, Eq. 6.32).
 *   - The bounce factor `1 - ρ/ρ_crit` is encoded as `(1 [dimensionless])
 *     - (ρ/ρ_crit)` so the AST '+/-' rule is satisfied.
 *
 * @see docs/specification/Part-I.md ("Bridge Equation 19: Quantum Bounce Equation")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 19)
 * @module bridges/equations/be-19-quantum-bounce
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import { G as DIM_G } from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

// --- Symbolic AST ---

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** Mass-density [M L^-3]. */
const MASS_DENSITY: Dimension = {
  L: -3, M: 1, T: 0, I: 0, Theta: 0, N: 0, J: 0,
};

/** [T^-2] dimension for Λ in the c²-rescaled Friedmann form. */
const T_INV2: Dimension = {
  L: 0, M: 0, T: -2, I: 0, Theta: 0, N: 0, J: 0,
};

// Note: this module rescales Λ from its raw GR form [L^-2] into [T^-2]
// via the standard `Λ_[T^-2] = c² · Λ_[L^-2]` convention (Ryden, "Intro
// to Cosmology" 2nd ed. §6, Eq. 6.32). A future encoding that wants raw
// Λ_[L^-2] should re-import LENGTH and remove the c² rescaling on the
// Lambda symbol.

/**
 * RHS of `H² = (8πG/3) ρ (1 - ρ/ρ_crit) + Λ/3` as a typed ExprNode tree.
 */
export const QUANTUM_BOUNCE_RHS: ExprNode = {
  kind: 'op', op: '+',
  args: [
    {
      // (8πG/3) · ρ · (1 − ρ/ρ_crit)
      kind: 'op', op: '*',
      args: [
        {
          // 8π/3 — dimensionless prefactor (folded into single symbol)
          kind: 'op', op: '/',
          args: [
            sym('8pi', DIMENSIONLESS),
            sym('3', DIMENSIONLESS),
          ],
        },
        sym('G', DIM_G),
        sym('rho', MASS_DENSITY),
        {
          // (1 − ρ/ρ_crit)
          kind: 'op', op: '-',
          args: [
            sym('1', DIMENSIONLESS),
            {
              kind: 'op', op: '/',
              args: [
                sym('rho', MASS_DENSITY),
                sym('rho_crit', MASS_DENSITY),
              ],
            },
          ],
        },
      ],
    },
    {
      // Λ / 3
      kind: 'op', op: '/',
      args: [
        sym('Lambda', T_INV2),
        sym('3', DIMENSIONLESS),
      ],
    },
  ],
};

/** LHS: H² has dimension [T^-2]. */
const QUANTUM_BOUNCE_LHS: ExprNode = {
  kind: 'op', op: '^',
  args: [sym('H', { L: 0, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 }), sym('2', DIMENSIONLESS)],
};

// --- Numerical evaluator ---

export interface QuantumBounceInputs {
  /** Mass-energy density ρ in kg/m³. Must be ≥ 0. */
  rho: number;
  /** LQC bounce critical density ρ_crit in kg/m³. Must be > 0. */
  rho_crit: number;
  /** Cosmological constant Λ in [T^-2] (= c² Λ_[L^-2]). */
  Lambda_Tinv2: number;
}

/**
 * Evaluate H² = (8πG/3) ρ (1 − ρ/ρ_crit) + Λ/3.
 *
 * @returns H² in [s^-2].
 */
export function evaluateQuantumBounce(input: QuantumBounceInputs): number {
  const { rho, rho_crit, Lambda_Tinv2 } = input;
  if (!Number.isFinite(rho) || rho < 0) {
    throw new RangeError(
      `evaluateQuantumBounce: rho must be a finite non-negative number, got ${rho}`,
    );
  }
  if (!Number.isFinite(rho_crit) || rho_crit <= 0) {
    throw new RangeError(
      `evaluateQuantumBounce: rho_crit must be a finite positive number, got ${rho_crit}`,
    );
  }
  if (!Number.isFinite(Lambda_Tinv2)) {
    throw new RangeError(
      `evaluateQuantumBounce: Lambda_Tinv2 must be finite, got ${Lambda_Tinv2}`,
    );
  }
  const { G } = PhysicalConstants;
  const bounce = 1 - rho / rho_crit;
  return ((8 * Math.PI * G) / 3) * rho * bounce + Lambda_Tinv2 / 3;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS = H² and RHS together
 * should both be [T^-2].
 */
export function validateQuantumBounceDimensions(): DimensionValidationReport {
  const eq = validateEquation(QUANTUM_BOUNCE_LHS, QUANTUM_BOUNCE_RHS);
  const lhs = validate(QUANTUM_BOUNCE_LHS);
  const rhs = validate(QUANTUM_BOUNCE_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
