/**
 * Bridge Equation 11 — Decoherence Master Equation (Lindblad form).
 *
 * The bridge entry's main formula is the GKSL/Lindblad master equation
 *
 *   ∂ρ/∂t = -(i/ℏ)[H, ρ]
 *           + Σ_k γ_k(λ) [ L_k ρ L_k† − ½ {L_k† L_k, ρ} ]
 *
 * with the coupling-dependent rate (corrected 2026-05-04, Caldeira-Leggett
 * weak-coupling form)
 *
 *   γ_k(λ) = γ_0 (λ / λ_0)²
 *
 * where γ_0 is a reference rate (s^-1), λ is the system-environment coupling,
 * and λ_0 is a reference coupling chosen so γ_k(λ_0) = γ_0.
 *
 * References:
 *   - Lindblad, Commun. Math. Phys. 48:119 (1976) — Lindblad form.
 *   - Gorini-Kossakowski-Sudarshan, J. Math. Phys. 17:821 (1976) — GKSL.
 *   - Caldeira & Leggett, Physica A 121, 587 (1983) — system-bath model.
 *   - Caldeira & Leggett, Phys. Rev. A 31, 1059 (1985), §III.B — γ ∝ λ².
 *   - Breuer & Petruccione, *The Theory of Open Quantum Systems* (OUP 2002),
 *     §3.6, §4.5 — weak-coupling derivation.
 *
 * Status: established (within open-quantum-systems theory).
 *
 * Honest-claude scope notes:
 *   - The full Lindblad equation cannot be encoded as a typed ExprNode tree
 *     in this MVP: the analyzer tracks only SI dimensions, not operator
 *     algebra, commutators [H,ρ], or anti-commutators {A,B}. Density
 *     matrices ρ and Lindblad operators L_k carry operator structure that
 *     this analyzer is not designed to validate.
 *   - What we DO encode is the (corrected) auxiliary rate function
 *     γ_k(λ) = γ_0 (λ/λ_0)², which is an honest scalar relation in
 *     [frequency] = [T^-1]. This validates that the corrected rate is
 *     dimensionally consistent and gives downstream code a numerical
 *     evaluator.
 *   - Tier 4.5 follow-up (operator-aware ExprNode): would let us encode the
 *     LHS dρ/dt and the unitary-and-dissipator RHS terms; out of scope for
 *     the R0 audit fix.
 *
 * @see docs/specification/Part-I.md ("Bridge Equation 11: Decoherence Master Equation")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 11)
 * @module bridges/equations/be-11-decoherence-master
 */

import type { ExprNode } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  FREQUENCY,
  DIMENSIONLESS,
} from '../../dimensional/types.js';

// --- Symbolic AST: γ_k(λ) = γ_0 * (λ / λ_0)^2 ---

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the corrected Caldeira-Leggett weak-coupling rate as a typed
 * ExprNode tree:  γ_0 * (λ / λ_0)^2.
 *
 * Both λ and λ_0 share the same (unspecified, but identical) dimension, so
 * the ratio is dimensionless; raising to the 2nd power keeps it
 * dimensionless; multiplying by γ_0 (frequency) gives [frequency].
 *
 * We model λ and λ_0 as DIMENSIONLESS in the AST. Physically the user may
 * choose λ to be a dimensionless coupling (most common) or a coupling with
 * its own dimension; either way the *ratio* λ/λ_0 is dimensionless, so the
 * scalar AST encoding faithfully captures the dimensional content.
 */
export const DECOHERENCE_RATE_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('gamma_0', FREQUENCY),
    {
      kind: 'op', op: '^',
      args: [
        {
          kind: 'op', op: '/',
          args: [sym('lambda', DIMENSIONLESS), sym('lambda_0', DIMENSIONLESS)],
        },
        sym('2', DIMENSIONLESS),
      ],
    },
  ],
};

/** LHS of the equation: a single symbol of dimension [frequency]. */
export const DECOHERENCE_RATE_LHS: ExprNode = sym('gamma_k', FREQUENCY);

// --- Numerical evaluator ---

export interface DecoherenceRateInputs {
  /** Reference rate γ_0 in inverse seconds (s^-1). Must be ≥ 0. */
  gamma0_per_s: number;
  /** System-environment coupling strength (any consistent unit). */
  lambda: number;
  /** Reference coupling λ_0 (same unit as λ). Must be > 0. */
  lambda0: number;
}

/**
 * Evaluate γ_k(λ) = γ_0 * (λ / λ_0)^2 (Caldeira-Leggett weak-coupling form).
 *
 * @returns Decoherence rate in s^-1.
 */
export function evaluateDecoherenceRate(input: DecoherenceRateInputs): number {
  const { gamma0_per_s, lambda, lambda0 } = input;
  if (!Number.isFinite(gamma0_per_s) || gamma0_per_s < 0) {
    throw new RangeError(
      `evaluateDecoherenceRate: gamma0_per_s must be a finite non-negative number, got ${gamma0_per_s}`,
    );
  }
  if (!Number.isFinite(lambda)) {
    throw new RangeError(
      `evaluateDecoherenceRate: lambda must be finite, got ${lambda}`,
    );
  }
  if (!Number.isFinite(lambda0) || lambda0 <= 0) {
    throw new RangeError(
      `evaluateDecoherenceRate: lambda0 must be a finite positive number, got ${lambda0}`,
    );
  }
  const ratio = lambda / lambda0;
  return gamma0_per_s * ratio * ratio;
}

// --- Self-validation ---

export interface DimensionValidationReport {
  ok: boolean;
  lhsDim: Dimension | null;
  rhsDim: Dimension | null;
}

/**
 * Run the rate-function AST through the dimensional analyzer and confirm
 * both sides are [frequency]. Returns the inferred dimensions for
 * traceability.
 */
export function validateDecoherenceRateDimensions(): DimensionValidationReport {
  const eq = validateEquation(DECOHERENCE_RATE_LHS, DECOHERENCE_RATE_RHS);
  const lhs = validate(DECOHERENCE_RATE_LHS);
  const rhs = validate(DECOHERENCE_RATE_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
