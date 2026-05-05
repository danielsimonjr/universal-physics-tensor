/**
 * Bridge Equation 14 — Ryu-Takayanagi (Quantum Error Correction Holographic Mapping).
 *
 * The bridge entry's `formula_latex` shows the holographic-quantum-error-
 * correction code-subspace map; the *physical content* the spec ascribes to
 * BE-14 (per `notes` and the cited reference) is the Ryu-Takayanagi formula:
 *
 *   S_boundary = Area(γ) / (4 G_N ℏ)            [natural units, k_B = 1]
 *   S_boundary = k_B c^3 Area(γ) / (4 G_N ℏ)    [SI units]
 *
 * γ is the bulk minimal surface anchored to the boundary subregion whose
 * von-Neumann entropy is being computed.
 *
 * Reference: S. Ryu and T. Takayanagi, "Holographic derivation of entanglement
 * entropy from AdS/CFT," Phys. Rev. Lett. 96, 181602 (2006); arXiv:hep-th/0603001.
 *
 * Status: established (within AdS/CFT). This module exposes:
 *   - the ExprNode AST encoding the SI-form RHS,
 *   - a numerical evaluator in SI units,
 *   - a numerical evaluator in natural units,
 *   - a self-validation helper that runs the AST through the dimensional
 *     analyzer and returns ENTROPY = M L^2 T^-2 Theta^-1 on success.
 *
 * Honest-claude scope notes:
 *   - We do NOT compute the minimal surface area; the area is an input.
 *     Computing γ from a bulk metric is a separate (much harder) problem
 *     and is out of scope for the bridge formula itself.
 *   - The SI evaluator and the natural-unit evaluator agree only up to the
 *     CODATA roundoff in ℓ_P vs (ℏG/c^3)^(1/2) (~1e-4); see the test for
 *     the cross-check.
 *
 * @see docs/specification/Part-I.md ("Bridge Equation 14: Quantum Error Correction Holographic Mapping")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 14)
 * @module bridges/equations/be-14-ryu-takayanagi
 */

import type { ExprNode } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  AREA,
  DIMENSIONLESS,
  ENTROPY,
} from '../../dimensional/types.js';
import {
  k_B as DIM_kB,
  c as DIM_c,
  G as DIM_G,
  hbar as DIM_hbar,
} from '../../dimensional/constants.js';
import { PhysicalConstants } from '../../core/types.js';

// --- Symbolic AST: RHS = k_B * c^3 * A / (4 * G * ℏ) ---

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/** RHS of the SI-form Ryu-Takayanagi formula as a typed ExprNode tree. */
export const RYU_TAKAYANAGI_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      // numerator: k_B * c^3 * A
      kind: 'op', op: '*',
      args: [
        sym('k_B', DIM_kB),
        {
          kind: 'op', op: '^',
          args: [sym('c', DIM_c), sym('3', DIMENSIONLESS)],
        },
        sym('A', AREA),
      ],
    },
    {
      // denominator: 4 * G_N * ℏ
      kind: 'op', op: '*',
      args: [
        sym('4', DIMENSIONLESS),
        sym('G_N', DIM_G),
        sym('hbar', DIM_hbar),
      ],
    },
  ],
};

/** LHS of the equation: a single symbol of dimension [entropy]. */
export const RYU_TAKAYANAGI_LHS: ExprNode = sym('S_boundary', ENTROPY);

// --- Numerical evaluators ---

export interface RyuTakayanagiInputs {
  /** Minimal-surface area γ in SI square metres. Must be ≥ 0. */
  area_m2: number;
}

/**
 * Evaluate S_boundary = k_B c^3 A / (4 G_N ℏ) in SI units.
 *
 * @returns Boundary von-Neumann entropy in J/K.
 */
export function evaluateRyuTakayanagi(input: RyuTakayanagiInputs): number {
  const { area_m2 } = input;
  if (!Number.isFinite(area_m2) || area_m2 < 0) {
    throw new RangeError(
      `evaluateRyuTakayanagi: area_m2 must be a finite non-negative number, got ${area_m2}`,
    );
  }
  const { kB, c, G, hbar } = PhysicalConstants;
  return (kB * c * c * c * area_m2) / (4 * G * hbar);
}

export interface RyuTakayanagiNaturalInputs {
  /** Area measured in Planck areas (ℓ_P^2). Must be ≥ 0. */
  area_planck: number;
}

/**
 * Evaluate S = A / 4 in natural units (G = ℏ = c = k_B = 1), with the area
 * input expressed in Planck areas.
 *
 * @returns Dimensionless entropy.
 */
export function evaluateRyuTakayanagiNatural(input: RyuTakayanagiNaturalInputs): number {
  const { area_planck } = input;
  if (!Number.isFinite(area_planck) || area_planck < 0) {
    throw new RangeError(
      `evaluateRyuTakayanagiNatural: area_planck must be a finite non-negative number, got ${area_planck}`,
    );
  }
  return area_planck / 4;
}

// --- Self-validation ---

export interface DimensionValidationReport {
  ok: boolean;
  lhsDim: Dimension | null;
  rhsDim: Dimension | null;
}

/**
 * Run the AST through the dimensional analyzer and confirm both sides are
 * [entropy]. Returns the inferred dimensions for traceability.
 */
export function validateRyuTakayanagiDimensions(): DimensionValidationReport {
  const eq = validateEquation(RYU_TAKAYANAGI_LHS, RYU_TAKAYANAGI_RHS);
  const lhs = validate(RYU_TAKAYANAGI_LHS);
  const rhs = validate(RYU_TAKAYANAGI_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
