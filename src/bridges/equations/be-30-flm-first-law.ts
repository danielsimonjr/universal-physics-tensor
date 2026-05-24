/**
 * Bridge Equation 30 — FLM first law of entanglement entropy
 * (Faulkner-Lewkowycz-Maldacena 2013, Wave Y AST-encoding).
 *
 *   δS_EE(R) = δ⟨H_R⟩
 *
 * The first-law-of-entanglement-entropy linear-response identity:
 * for a small perturbation of the global state, the variation of the
 * entanglement entropy on a region R equals the variation of the
 * expectation value of the modular Hamiltonian H_R for that region.
 * This is the canonical CFT-bulk-loop input for Faulkner-Lewkowycz-
 * Maldacena's bulk one-loop correction to Ryu-Takayanagi.
 *
 * References:
 *   - Faulkner, Lewkowycz & Maldacena 2013 *JHEP* 11:074
 *     (arXiv:1307.2892; canonical FLM bulk-entanglement-entropy
 *     correction; uses δS_EE = ⟨δH_R⟩ as input).
 *   - Blanco, Casini, Hung, Myers 2013 *JHEP* 08:060
 *     (arXiv:1305.3182; canonical statement of the first law of
 *     entanglement entropy).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - Both sides are dimensionless (in nats; or k_B-rescaled to entropy
 *     units of [J/K]). The encoding pins the dimensionless convention
 *     (S_EE in nats; modular Hamiltonian expectation in nats).
 *   - The equation is a TAUTOLOGY in the sense that δS_EE / δ⟨H_R⟩ = 1
 *     by construction. The encoding nonetheless pins the dimensional
 *     structure (both sides DIMENSIONLESS) and the scalar relation; the
 *     bracket-check tests verify only the trivial linear-response
 *     identity, not a non-trivial physical prediction.
 *   - As a non-trivial secondary cross-check, the Bekenstein universal
 *     entropy bound `S_EE ≤ 2π R E / (ℏc)` is exposed via a separate
 *     evaluator `evaluateBekensteinBound` for sanity-checking
 *     entanglement-entropy magnitudes.
 *   - The full operator structure of H_R is the bridge framing; the
 *     scalar first-law identity is the AST-encodable content.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 30")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 30)
 * @module bridges/equations/be-30-flm-first-law
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import { PhysicalConstants } from '../../core/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the FLM first-law identity:
 *   δS_EE = δ⟨H_R⟩
 *
 * Both sides are dimensionless (S_EE in nats; modular-Hamiltonian
 * expectation rescaled to nats).
 */
export const BE30_FLM_RHS: ExprNode = sym('delta_avg_H_R', DIMENSIONLESS);

/** LHS: δS_EE has dimension [1] (nats). */
export const BE30_FLM_LHS: ExprNode = sym('delta_S_EE', DIMENSIONLESS);

// --- Numerical evaluator (linear-response identity) ---

/**
 * @internal — typed-arg shape for the file-local `evaluateFLMFirstLaw` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface FLMFirstLawInputs {
  /**
   * Variation of the modular-Hamiltonian expectation value δ⟨H_R⟩, in
   * nats (dimensionless). Must be finite.
   */
  delta_avg_H_R: number;
}

/**
 * Evaluate the FLM first-law identity δS_EE = δ⟨H_R⟩ — a tautology by
 * construction.
 *
 * @returns Variation of entanglement entropy in nats.
 */
export function evaluateFLMFirstLaw(input: FLMFirstLawInputs): number {
  const { delta_avg_H_R } = input;
  if (!Number.isFinite(delta_avg_H_R)) {
    throw new RangeError(
      `evaluateFLMFirstLaw: delta_avg_H_R must be finite, got ${delta_avg_H_R}`,
    );
  }
  return delta_avg_H_R;
}

// --- Secondary evaluator: Bekenstein universal entropy bound ---

/**
 * @internal — typed-arg shape for the file-local `evaluateBekensteinBound` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface BekensteinBoundInputs {
  /** Region radius R (m). Must be > 0 and finite. */
  R_m: number;
  /** Total energy E in the region (J). Must be > 0 and finite. */
  E_J: number;
}

/**
 * Evaluate the Bekenstein universal entropy bound
 *
 *   S_EE ≤ 2π R E / (ℏ c)
 *
 * (Bekenstein 1981 *Phys. Rev. D* 23:287). Returns the *upper bound*
 * on S_EE in nats. Used as a sanity-check on the FLM linear-response
 * identity (which is a tautology by itself; the bound provides a
 * non-trivial physical magnitude check).
 *
 * @returns Bekenstein upper bound on entropy in nats.
 */
export function evaluateBekensteinBound(input: BekensteinBoundInputs): number {
  const { R_m, E_J } = input;
  if (!Number.isFinite(R_m) || R_m <= 0) {
    throw new RangeError(
      `evaluateBekensteinBound: R_m must be a finite positive number, got ${R_m}`,
    );
  }
  if (!Number.isFinite(E_J) || E_J <= 0) {
    throw new RangeError(
      `evaluateBekensteinBound: E_J must be a finite positive number, got ${E_J}`,
    );
  }
  const { hbar, c } = PhysicalConstants;
  return (2 * Math.PI * R_m * E_J) / (hbar * c);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * DIMENSIONLESS.
 */
export function validateBE30Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE30_FLM_LHS, BE30_FLM_RHS);
  const lhs = validate(BE30_FLM_LHS);
  const rhs = validate(BE30_FLM_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
