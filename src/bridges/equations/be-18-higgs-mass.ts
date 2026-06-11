/**
 * Bridge Equation 18 — Higgs-like dark-fermion mass generation
 * (post Wave Y reformulation).
 *
 *   m_dark = g_dark · v_dark
 *
 * Yukawa-coupling-times-VEV mass-generation relation, in natural units
 * (ℏ = c = 1) where masses are quoted as energies. Standard Model
 * analog: m_top ≈ y_t · v_EW with v_EW = 246 GeV / √2 = 174 GeV.
 *
 * Reference: Peskin & Schroeder 1995 *An Introduction to Quantum Field
 * Theory* §20.1 (canonical non-Abelian + complex-scalar SSB Lagrangian
 * giving fermion-mass generation via Yukawa-VEV coupling).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - Encoded in **natural units** (mass-as-energy convention; particle-
 *     physics standard). The full SI conversion would be m_dark · c² =
 *     g_dark · v_dark; the natural-units form `m = g·v` is the canonical
 *     particle-physics statement.
 *   - The full BE-18 Lagrangian (gauge kinetic term, |D_μΦ|², fermion
 *     bilinear, scalar potential) is the bridge framing; the scalar
 *     mass-generation relation is the AST-encoded bridge content.
 *   - SM bracket: top-quark mass m_t ≈ 173 GeV with y_t ≈ 0.99,
 *     v_EW = 246 GeV / √2 ≈ 174 GeV → m_t = 0.99 · 174 ≈ 172 GeV ✓
 *     within 1% of measured value.
 *   - Dim: [g_dark] dimensionless; [v_dark] = energy (in natural units;
 *     SI: [v] = energy = [M L² T⁻²]); [m_dark] = energy. ✓
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 18")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 18)
 * @module bridges/equations/be-18-higgs-mass
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
  ENERGY,
} from '../../dimensional/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

/**
 * RHS of the Higgs-like mass-generation relation:
 *   m_dark = g_dark · v_dark
 *
 * In natural units, [v_dark] = energy and [g_dark] is dimensionless,
 * so the product has dim [energy].
 */
export const BE18_HIGGS_MASS_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('g_dark', DIMENSIONLESS),
    sym('v_dark', ENERGY),
  ],
};

/** LHS: m_dark has dimension [energy] in natural units. */
/** @internal */
export const BE18_HIGGS_MASS_LHS: ExprNode = sym('m_dark', ENERGY);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateHiggsMass` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface HiggsMassInputs {
  /** Dimensionless Yukawa coupling g_dark (= y in SM convention). Must be finite. */
  g_dark: number;
  /** VEV v_dark in GeV (or any consistent energy unit). Must be finite. */
  v_dark_GeV: number;
}

/**
 * Evaluate the Higgs-like mass-generation relation
 *
 *   m_dark = g_dark · v_dark
 *
 * @returns Dark-fermion mass in GeV (same unit as v_dark).
 */
export function evaluateHiggsMass(input: HiggsMassInputs): number {
  validateFiniteInputs(
    input,
    [{ name: 'g_dark' }, { name: 'v_dark_GeV' }],
    'evaluateHiggsMass',
  );
  const { g_dark, v_dark_GeV } = input;
  return g_dark * v_dark_GeV;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [energy] (natural-units mass-as-energy convention).
 */
/** @internal */
export function validateBE18Dimensions(): DimensionValidationReport {
  return validateBEDimensions(BE18_HIGGS_MASS_LHS, BE18_HIGGS_MASS_RHS, 'BE18');
}
