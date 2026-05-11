/**
 * Bridge Equation 16 — Complexity-Entropy Production Relation
 * (Landauer's principle reformulation).
 *
 * **Original (self-refuting) form.** Wave L Tier E1 marked BE-16
 * `status='invalid'` because the ansatz
 *
 *   dS/dt = k_B · C(ρ) · ∂I/∂t
 *
 * is algebraically self-refuting: combining the von Neumann
 * identification `I = -S_vN` with the master relation gives
 * `dS/dt · (1 + k_B C(ρ)) = 0`, forcing `dS/dt = 0` for any
 * `C(ρ) > -1/k_B`. The circuit complexity `C(ρ)` is also not
 * independently defined; the equation is effectively a definition
 * of complexity in terms of an entropy-to-information ratio rather
 * than a falsifiable physical relation.
 *
 * **Encoded reformulation (Landauer's principle).** Wave Z-E applies
 * the canonical literature replacement identified by OpenAI o3 in
 * the Wave-Z-E consultation (2026-05-11): drop the broken `C(ρ)`
 * ansatz in favor of **Landauer's principle**, the canonical
 * information-↔-thermodynamics bridge:
 *
 *   **E_min = k_B · T · ln(2)**
 *
 * the minimum thermodynamic energy required to erase one bit of
 * information at temperature T. Landauer 1961 derived this from the
 * Second Law as a fundamental thermodynamic cost of *logical
 * irreversibility*; Bérut 2012 and Jun 2014 experimentally
 * confirmed the relation to within ~10% in single-particle and
 * single-electron bit-erasure experiments.
 *
 * The bridge label `microscale → emergent` (computational complexity
 * ↔ thermodynamic entropy production) is captured directly: at the
 * microscale, bits are abstract logical quantities; at the emergent
 * thermodynamic scale, bit erasure has a definite, measurable energy
 * cost set by k_BT. The connection is unambiguous (unlike the broken
 * `C(ρ)` form) and well-tested experimentally.
 *
 * **Dimensional analysis.**
 *   - k_B has dim `[energy/temperature]` = `[L² M T⁻² Θ⁻¹]`.
 *   - T has dim `[temperature]` = `[Θ]`.
 *   - ln(2) is dimensionless (the natural log of a dimensionless
 *     numerical constant ≈ 0.693).
 *   - Product: `[L² M T⁻² Θ⁻¹] · [Θ] · [1] = [L² M T⁻²]` = `[energy]`.
 *
 * **AST encoding pattern (no log-stub needed).** Unlike BE-25 (log₂
 * of a ratio of probabilities) or BE-45 (log of a ratio of energies),
 * the Landauer formula has `ln(2)` where 2 is a CONCRETE numerical
 * constant. ln(2) ≈ 0.693 is a pure dimensionless number — encoded
 * as a single DIMENSIONLESS symbol `ln_2_constant`. No inner-argument
 * lemma test is needed because the argument is a literal number, not
 * a dimensionful ratio.
 *
 * Bracket-checks (numerical evaluator):
 *   - T = 300 K (room temperature): E_min ≈ 2.87 × 10⁻²¹ J ≈
 *     1.79 × 10⁻² eV per bit ≈ 18 meV/bit. Bérut 2012 confirmed
 *     this scale.
 *   - T = 0: E_min = 0 (thermal noise floor vanishes).
 *   - T → ∞: E_min → ∞ (consistent with thermal-noise dominance).
 *
 * References:
 *   - Landauer 1961 *IBM J. Res. Dev.* 5:183 (original principle).
 *   - Bennett 1973 *IBM J. Res. Dev.* 17:525 (reversible
 *     computation; complementary).
 *   - Bennett 1982 *Int. J. Theor. Phys.* 21:905 (review of the
 *     thermodynamics of computation).
 *   - Bérut, Arakelyan, Petrosyan, Ciliberto, Dillenschneider, Lutz
 *     2012 *Nature* 483:187 (first experimental confirmation —
 *     single colloidal-bead bit erasure).
 *   - Jun, Gavrilov, Bechhoefer 2014 *Phys. Rev. Lett.* 113:190601
 *     (precision test, ~3% accuracy).
 *   - Yan, Sagawa, Murch, Quan 2018 *Phys. Rev. Lett.* 120:080507
 *     (quantum extension).
 *
 * Status: speculative — REFORMULATED from 'invalid'.
 *
 * Honest-claude scope notes:
 *   - The reformulation REPLACES the broken `dS/dt = k_B·C(ρ)·∂I/∂t`
 *     ansatz with Landauer's principle. This is the same precedent as
 *     BE-25 (Penrose-Hameroff Orch-OR → IIT Φ_max, Wave P-D R-D2):
 *     drop the broken formulation, replace with a canonical
 *     literature form that addresses the same bridge label
 *     (`microscale → emergent`).
 *   - The Landauer principle is canonical and experimentally tested
 *     physics; status `'speculative'` is for the **bridge framing**
 *     (treating Landauer's energy bound as the UPT microscale-↔-
 *     emergent bridge), NOT for Landauer's principle itself.
 *     Landauer is well-established; the UPT bridge claim is the
 *     speculative element.
 *   - The previous BE-16 ansatz attempted to bridge *computational
 *     complexity* `C(ρ)` to entropy. Landauer bridges *information
 *     erasure* (one bit) to energy. These are related but different:
 *     Landauer is a *lower bound* on a *minimum* energy, not a
 *     proportionality between *complexity* and *entropy production
 *     rate*. The reformulation captures the spirit of the bridge
 *     label (information ↔ thermodynamics) but not the original
 *     formula's intended structure.
 *   - The full Margolus-Levitin time bound (`τ_min ≥ πℏ/(2E)`),
 *     Bremermann's limit, and Bennett's reversible-computation
 *     bound are alternative canonical bridges with different scope.
 *     Landauer is the simplest and most-cited; reformulating to
 *     Landauer is the most parsimonious move. Future BE entries
 *     could encode the Margolus-Levitin and Bremermann bounds as
 *     separate bridges.
 *   - Quantum extensions of Landauer (Reeb-Wolf 2014; Yan et al.
 *     2018) refine the bound for non-Markovian / coherent erasure
 *     processes. The encoded form is the **classical Landauer
 *     bound**; quantum corrections (Δ(quantum coherence)) are not
 *     in scope.
 *
 * @see docs/specification/Part-I.md ("Bridge Equation 16")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 16)
 * @module bridges/equations/be-16-landauer
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  ENERGY,
  TEMPERATURE,
} from '../../dimensional/types.js';
import { k_B } from '../../dimensional/constants.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

// --- Symbolic AST ---

/**
 * Symbol for Boltzmann's constant k_B. Dim `[energy/temperature]`.
 *
 * Imported from `src/dimensional/constants.ts` rather than declared
 * here so the dim follows the project-wide convention.
 */
export const BE16_BOLTZMANN: ExprNode = sym('k_B', k_B);

/**
 * Symbol for thermodynamic temperature T. Dim `[temperature]`.
 */
export const BE16_TEMPERATURE: ExprNode = sym('T', TEMPERATURE);

/**
 * Symbol for the dimensionless constant ln(2) ≈ 0.693.
 *
 * Encoded as a single DIMENSIONLESS symbol with literal value (the
 * argument is a concrete number, not a dimensionful ratio, so no
 * inner-argument lemma test is needed — unlike BE-25's log of
 * `p_cond/p_marg` or BE-45's log of `M_P/H_inf`).
 */
export const BE16_LN2: ExprNode = sym('ln_2_constant', DIMENSIONLESS);

/**
 * RHS of `E_min = k_B · T · ln(2)` as a typed ExprNode tree:
 *
 *   k_B · T · ln(2)
 *
 * Dim: `[energy/temperature] · [temperature] · [1] = [energy]`.
 */
export const BE16_LANDAUER_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    {
      kind: 'op', op: '*',
      args: [BE16_BOLTZMANN, BE16_TEMPERATURE],
    },
    BE16_LN2,
  ],
};

/**
 * LHS: E_min is the minimum thermodynamic energy per bit erased.
 * Dim `[energy]`.
 */
export const BE16_LANDAUER_LHS: ExprNode = sym('E_min', ENERGY);

// --- Numerical evaluator ---

export interface LandauerInputs {
  /** Thermodynamic temperature T in kelvin. Must be finite and ≥ 0. */
  temperature_K: number;
}

/**
 * Evaluate the Landauer minimum energy per bit erased:
 *
 *   E_min = k_B · T · ln(2)
 *
 * @returns Minimum energy in joules per bit. For T = 300 K (room
 *   temperature) this gives approximately 2.87 × 10⁻²¹ J ≈ 18 meV.
 */
export function evaluateLandauerEnergy(input: LandauerInputs): number {
  const { temperature_K } = input;
  if (!Number.isFinite(temperature_K) || temperature_K < 0) {
    throw new RangeError(
      `evaluateLandauerEnergy: temperature_K must be a finite non-negative number, got ${temperature_K}`,
    );
  }
  const k_B_SI = 1.380649e-23; // J/K (exact SI definition, 2019 redefinition)
  return k_B_SI * temperature_K * Math.LN2;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be `[energy]`.
 */
export function validateBE16Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE16_LANDAUER_LHS, BE16_LANDAUER_RHS);
  const lhs = validate(BE16_LANDAUER_LHS);
  const rhs = validate(BE16_LANDAUER_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
