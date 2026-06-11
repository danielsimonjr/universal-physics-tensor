/**
 * Bridge Equation 12 — Mesoscopic Coherence Length (canonical thermal
 * de Broglie wavelength).
 *
 *   λ_T = √(2π ℏ² / (m k_B T)) ≡ h / √(2π m k_B T)
 *
 * This is the standard textbook thermal de Broglie wavelength for a
 * single particle of mass m at temperature T (Pathria 2011
 * *Statistical Mechanics* 3rd ed. §1.4 eq. 1.4.13; Reif 1965
 * *Fundamentals of Statistical and Thermal Physics* §6;
 * Pitaevskii-Stringari 2003 *Bose-Einstein Condensation* §6). It is
 * the natural length scale below which quantum-statistical effects
 * (Bose / Fermi degeneracy, exchange-induced correlations) become
 * non-negligible relative to classical Boltzmann statistics.
 *
 * Status: speculative.
 *
 * Dimensional check (ℏ-flavor):
 *   - [ℏ²] = (J·s)² = (kg·m²/s)²
 *   - [m k_B T] = kg · J = kg² · m²/s²
 *   - [ℏ²/(m k_B T)] = (kg² m⁴/s²) / (kg² m²/s²) = m²
 *   - √(2π ℏ²/(m k_B T)) = m ✓ ([length])
 *
 * Numerical bracket: H atom (m ≈ 1.67e-27 kg) at 300 K → ~100 pm = 1 Å.
 * (The earlier Wave Q A2 form `λ = ℏ/√(2π m k_B T)` was dimensionally
 * [length] but numerically off by a factor of 2π — gave ~16 pm — and
 * was caught by this AST encoding's textbook bracket-check.)
 *
 * Honest-claude scope notes:
 *   - The formula itself is canonical textbook physics; the *bridge
 *     framing* — using a single-particle thermal de Broglie length as
 *     an N-particle "mesoscopic coherence length" — is the speculative
 *     content. Status remains 'speculative' for this reason.
 *   - Two equivalent canonical forms: ℏ-flavor `√(2π ℏ²/(m k_B T))` and
 *     h-flavor `h/√(2π m k_B T)`. We encode the ℏ-flavor since the
 *     dimensional-analyzer constant set already exports `hbar`; using
 *     `h` would require introducing a new named constant for `2πℏ`.
 *   - Mesoscopic-coherence-length variants in the literature insert
 *     additional N-dependence (number of particles), correlation-time
 *     factors (Caldeira-Leggett dephasing time τ_φ), or system-size
 *     cutoffs; UPT BE-12 does not commit to these — the canonical
 *     thermal-de-Broglie form is the bridge's load-bearing content.
 *
 * @see docs/specification/Part-I.md ("Bridge Equation 12")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 12)
 * @module bridges/equations/be-12-coherence-length
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
  LENGTH,
  MASS,
  TEMPERATURE,
} from '../../dimensional/types.js';
import { hbar as DIM_hbar, k_B as DIM_kB } from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

/**
 * RHS of the canonical thermal de Broglie wavelength:
 *   λ_T = √(2π ℏ²/(m k_B T))
 *
 * Encoded as `(2π · ℏ² / (m k_B T))^{1/2}`. The `^` op handles non-
 * integer numeric exponents (literal 0.5).
 */
export const BE12_COHERENCE_LENGTH_RHS: ExprNode = {
  kind: 'op', op: '^',
  args: [
    {
      // 2π · ℏ² / (m k_B T)
      kind: 'op', op: '/',
      args: [
        {
          kind: 'op', op: '*',
          args: [
            sym('2pi', DIMENSIONLESS),
            {
              // ℏ² = ℏ · ℏ
              kind: 'op', op: '*',
              args: [sym('hbar', DIM_hbar), sym('hbar', DIM_hbar)],
            },
          ],
        },
        {
          kind: 'op', op: '*',
          args: [
            sym('m', MASS),
            sym('k_B', DIM_kB),
            sym('T', TEMPERATURE),
          ],
        },
      ],
    },
    sym('0.5', DIMENSIONLESS),
  ],
};

/** LHS: λ_T has dimension [length]. */
/** @internal */
export const BE12_COHERENCE_LENGTH_LHS: ExprNode = sym('lambda_T', LENGTH);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateThermalDeBroglie` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface ThermalDeBroglieInputs {
  /** Particle mass m (kg). Must be > 0 and finite. */
  m_kg: number;
  /** Temperature T (K). Must be > 0 and finite. */
  T_K: number;
}

/**
 * Evaluate the canonical thermal de Broglie wavelength
 *
 *   λ_T = √(2π ℏ²/(m k_B T))
 *
 * Equivalent textbook form: `h/√(2π m k_B T)`.
 *
 * @returns Wavelength in meters.
 */
export function evaluateThermalDeBroglie(input: ThermalDeBroglieInputs): number {
  validateFiniteInputs(
    input,
    [
      { name: 'm_kg', min: 0, excludeMin: true },
      { name: 'T_K', min: 0, excludeMin: true },
    ],
    'evaluateThermalDeBroglie',
  );
  const { m_kg, T_K } = input;
  const { hbar, kB } = PhysicalConstants;
  return Math.sqrt((2 * Math.PI * hbar * hbar) / (m_kg * kB * T_K));
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [length].
 */
/** @internal */
export function validateBE12Dimensions(): DimensionValidationReport {
  return validateBEDimensions(BE12_COHERENCE_LENGTH_LHS, BE12_COHERENCE_LENGTH_RHS, 'BE12');
}
