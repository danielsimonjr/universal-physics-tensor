/**
 * Bridge Equation 20 — Observed cosmological-constant mass density
 * (canonical FRW form, post Wave Y reformulation).
 *
 *   ρ_Λ = c² Λ / (8π G)
 *
 * The mass density associated with the observed cosmological constant
 * Λ ≈ 1.1×10⁻⁵² m⁻² (Planck 2018; Aghanim et al. 2020). With the
 * canonical FRW prefactor c²/(8π G), Λ ≈ 1.1e-52 m⁻² gives
 * ρ_Λ ≈ 5.4×10⁻²⁷ kg/m³, matching the observed dark-energy density
 * (≈70% of the critical density at the present epoch).
 *
 * Reference: Carroll 2001 *Living Rev. Relativity* 4:1
 * (arXiv:astro-ph/0004075; canonical cosmological-constant review);
 * Weinberg 1989 *Rev. Mod. Phys.* 61:1 (the cosmological-constant
 * problem). Planck Collaboration (Aghanim et al.) 2020 *A&A* 641:A6
 * (Λ measurement from CMB).
 *
 * Status: speculative (the bridge framing — using the observed CC as
 * a quantum-cosmological bridge — is the speculative element).
 *
 * Honest-claude scope notes:
 *   - This formula sidesteps the formally-divergent ∫d³k vacuum-
 *     fluctuation integral that the original BE-20 carried. The
 *     vacuum-fluctuation problem (the 10¹²⁰ discrepancy between the
 *     QFT estimate and observation) remains the unfixed cosmological-
 *     constant problem, documented in known_issues. The observed
 *     ρ_Λ is the canonical scalar that replaces the divergent integral
 *     as the AST-encodable bridge content.
 *   - Dim: [c² Λ] = L² T⁻² · L⁻² = T⁻²; [1/G] = M T² L⁻³;
 *     [c² Λ / G] = M T² L⁻³ · T⁻² = M L⁻³ ✓ (mass density).
 *   - The energy-density form ρ_Λ c² = c⁴ Λ / (8π G) ≈ 7×10⁻¹⁰ J/m³
 *     is the alternate convention; both forms are physically
 *     equivalent. We encode the mass-density form here.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 20")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 20)
 * @module bridges/equations/be-20-vacuum-energy
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import { c as DIM_c, G as DIM_G } from '../../dimensional/constants.js';
import { power } from '../../dimensional/algebra.js';
import { LENGTH } from '../../dimensional/types.js';
import { PhysicalConstants } from '../../core/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** [L⁻²] — cosmological-constant Λ has dimension of inverse area. */
const INV_LENGTH_2: Dimension = power(LENGTH, -2);

/** [M L⁻³] — mass density (kg/m³). */
export const MASS_DENSITY: Dimension = {
  L: -3, M: 1, T: 0, I: 0, Theta: 0, N: 0, J: 0,
};

/**
 * RHS of the cosmological-constant mass density:
 *   ρ_Λ = c² Λ / (8π G)
 */
export const BE20_VACUUM_ENERGY_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      // numerator: c² · Λ
      kind: 'op', op: '*',
      args: [
        {
          kind: 'op', op: '^',
          args: [sym('c', DIM_c), sym('2', DIMENSIONLESS)],
        },
        sym('Lambda', INV_LENGTH_2),
      ],
    },
    {
      // denominator: 8π · G
      kind: 'op', op: '*',
      args: [
        sym('8pi', DIMENSIONLESS),
        sym('G', DIM_G),
      ],
    },
  ],
};

/** LHS: ρ_Λ has dimension [M L⁻³] (mass density, kg/m³). */
export const BE20_VACUUM_ENERGY_LHS: ExprNode = sym('rho_Lambda', MASS_DENSITY);

// --- Numerical evaluator ---

export interface CosmologicalConstantInputs {
  /**
   * Cosmological constant Λ (m⁻²). Default: 1.1×10⁻⁵² m⁻² (Planck 2018
   * canonical value). Must be ≥ 0 and finite.
   */
  Lambda_per_m2?: number;
}

const DEFAULT_LAMBDA = 1.1e-52; // Planck 2018 canonical value (m^-2)

/**
 * Evaluate the mass density associated with the observed cosmological
 * constant
 *
 *   ρ_Λ = c² Λ / (8π G)
 *
 * @returns Mass density in kg/m³.
 */
export function evaluateCosmologicalConstantDensity(
  input: CosmologicalConstantInputs = {},
): number {
  const { Lambda_per_m2 = DEFAULT_LAMBDA } = input;
  if (!Number.isFinite(Lambda_per_m2) || Lambda_per_m2 < 0) {
    throw new RangeError(
      `evaluateCosmologicalConstantDensity: Lambda_per_m2 must be finite and non-negative, got ${Lambda_per_m2}`,
    );
  }
  const { c, G } = PhysicalConstants;
  return (c * c * Lambda_per_m2) / (8 * Math.PI * G);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [M L⁻³] (mass density).
 */
export function validateBE20Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE20_VACUUM_ENERGY_LHS, BE20_VACUUM_ENERGY_RHS);
  const lhs = validate(BE20_VACUUM_ENERGY_LHS);
  const rhs = validate(BE20_VACUUM_ENERGY_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
