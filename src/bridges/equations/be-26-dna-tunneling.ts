/**
 * Bridge Equation 26 — DNA Mutation Quantum Tunneling Rate.
 *
 *   Γ_mutation = ν₀ exp[−(2/ℏ) ∫_{x₁}^{x₂} √(2m(V(x)−E)) dx] · f(T, pH, EM)
 *
 * Standard WKB tunneling rate (Gamow 1928; Landau-Lifshitz QM §50)
 * applied to DNA base-pair tautomerization via proton tunneling
 * (Löwdin 1963 Adv. Quantum Chem. 2:213).
 *
 * Status: established.
 *
 * Honest-claude scope notes:
 *   - The AST has no `exp` primitive; we encode the relation as
 *     `ν₀ · ε · f` where ε is a dimensionless symbol stub for
 *     `exp(-WKB_arg)`, and we expose the WKB argument
 *     `(2/ℏ)∫√(2m(V−E))dx` as a separate ExprNode `DNA_TUNNELING_WKB_ARG`
 *     so the dimensionless-ness of the exp argument can be verified
 *     directly. (Same pattern as BE-41 / BE-34.)
 *   - The integrand √(2m(V−E)) is encoded with `^` of 0.5 (the
 *     validator accepts non-integer numeric exponents). Result is
 *     [M^{1/2}(M L² T^-2)^{1/2}] = [M L T^-1] (momentum), as expected.
 *   - f(T, pH, EM) is encoded as a dimensionless symbol; in the
 *     literature this is a Q10-temperature factor times pH-dependent
 *     rate ratio times EM-field-induced perturbation, all dimensionless.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 26: DNA Mutation - Quantum Tunneling Rate")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 26)
 * @module bridges/equations/be-26-dna-tunneling
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  FREQUENCY,
  MASS,
  LENGTH,
  ENERGY,
} from '../../dimensional/types.js';
import { hbar as DIM_hbar } from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * Lemma AST: the WKB exponent (2/ℏ) · ∫ √(2m(V−E)) dx, exposed for
 * verification that it is dimensionless.
 */
export const DNA_TUNNELING_WKB_ARG: ExprNode = {
  kind: 'op', op: '*',
  args: [
    {
      // (2/ℏ)
      kind: 'op', op: '/',
      args: [
        sym('2', DIMENSIONLESS),
        sym('hbar', DIM_hbar),
      ],
    },
    {
      // ∫ √(2m(V−E)) dx
      kind: 'integral',
      over: sym('x', LENGTH),
      integrand: {
        // √(2m(V−E)) = (2m(V−E))^{1/2}
        kind: 'op', op: '^',
        args: [
          {
            kind: 'op', op: '*',
            args: [
              sym('2', DIMENSIONLESS),
              sym('m', MASS),
              sym('V_minus_E', ENERGY),
            ],
          },
          sym('0.5', DIMENSIONLESS),
        ],
      },
    },
  ],
};

/**
 * RHS of the WKB tunneling rate: `ν₀ · ε · f`, where ε is a
 * dimensionless symbol stub for exp(-DNA_TUNNELING_WKB_ARG) and f is the
 * dimensionless f(T, pH, EM) prefactor.
 */
export const DNA_TUNNELING_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('nu_0', FREQUENCY),
    sym('exp(-WKB_arg)', DIMENSIONLESS),
    sym('f(T,pH,EM)', DIMENSIONLESS),
  ],
};

/** LHS: Γ has dimension [frequency]. */
export const DNA_TUNNELING_LHS: ExprNode = sym('Gamma_mutation', FREQUENCY);

// --- Numerical evaluator ---

export interface DNATunnelingInputs {
  /** Attempt frequency ν₀ (s^-1). Must be ≥ 0. */
  nu_0: number;
  /** Tunneling-particle mass m (kg). Must be > 0. */
  m: number;
  /** Effective barrier height V−E (J). Must be ≥ 0; assumes constant V. */
  V_minus_E: number;
  /** Barrier width x₂−x₁ (m). Must be > 0. */
  barrier_width: number;
  /** Dimensionless f(T,pH,EM) prefactor. Must be finite. */
  f_correction: number;
}

/**
 * Evaluate Γ = ν₀ exp[−(2/ℏ) · √(2m(V−E)) · L] · f, assuming a
 * rectangular barrier of width L (so the integral collapses to
 * √(2m(V−E)) · L).
 *
 * @returns Tunneling rate in s^-1.
 */
export function evaluateDNATunneling(input: DNATunnelingInputs): number {
  const { nu_0, m, V_minus_E, barrier_width, f_correction } = input;
  if (!Number.isFinite(nu_0) || nu_0 < 0) {
    throw new RangeError(
      `evaluateDNATunneling: nu_0 must be a finite non-negative number, got ${nu_0}`,
    );
  }
  if (!Number.isFinite(m) || m <= 0) {
    throw new RangeError(
      `evaluateDNATunneling: m must be a finite positive number, got ${m}`,
    );
  }
  if (!Number.isFinite(V_minus_E) || V_minus_E < 0) {
    throw new RangeError(
      `evaluateDNATunneling: V_minus_E must be a finite non-negative number, got ${V_minus_E}`,
    );
  }
  if (!Number.isFinite(barrier_width) || barrier_width <= 0) {
    throw new RangeError(
      `evaluateDNATunneling: barrier_width must be a finite positive number, got ${barrier_width}`,
    );
  }
  if (!Number.isFinite(f_correction)) {
    throw new RangeError(
      `evaluateDNATunneling: f_correction must be finite, got ${f_correction}`,
    );
  }
  const { hbar } = PhysicalConstants;
  const p = Math.sqrt(2 * m * V_minus_E);   // momentum-like
  const action = p * barrier_width;         // [J·s]
  const wkb = (2 / hbar) * action;          // dimensionless
  return nu_0 * Math.exp(-wkb) * f_correction;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [frequency].
 */
export function validateDNATunnelingDimensions(): DimensionValidationReport {
  const eq = validateEquation(DNA_TUNNELING_LHS, DNA_TUNNELING_RHS);
  const lhs = validate(DNA_TUNNELING_LHS);
  const rhs = validate(DNA_TUNNELING_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
