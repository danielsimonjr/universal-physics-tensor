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
 *   - **Known issue (Wave I.B C6, 2026-05-05, registered 2026-05-05):**
 *     the bare WKB rate overshoots observed mutation rates (~10⁻⁸-10⁻¹⁰
 *     /bp/replication) by 2-4 orders. The f(T, pH, EM) prefactor as
 *     labeled does NOT include the dominant biological-mechanism
 *     factors (polymerase proofreading ~10⁻⁵, mismatch repair ~10²);
 *     see BE-26 known_issues entry in src/bridges/index.ts.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 26: DNA Mutation - Quantum Tunneling Rate")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 26)
 * @module bridges/equations/be-26-dna-tunneling
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
  FREQUENCY,
  MASS,
  LENGTH,
  ENERGY,
} from '../../dimensional/types.js';
import { hbar as DIM_hbar } from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

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
const DNA_TUNNELING_LHS: ExprNode = sym('Gamma_mutation', FREQUENCY);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateDNATunneling` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface DNATunnelingInputs {
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
  validateFiniteInputs(
    input,
    [
      { name: 'nu_0', min: 0 },
      { name: 'm', min: 0, excludeMin: true },
      { name: 'V_minus_E', min: 0 },
      { name: 'barrier_width', min: 0, excludeMin: true },
      { name: 'f_correction' },
    ],
    'evaluateDNATunneling',
  );
  const { nu_0, m, V_minus_E, barrier_width, f_correction } = input;
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
/** @internal */
export function validateDNATunnelingDimensions(): DimensionValidationReport {
  return validateBEDimensions(DNA_TUNNELING_LHS, DNA_TUNNELING_RHS, 'BE26');
}
