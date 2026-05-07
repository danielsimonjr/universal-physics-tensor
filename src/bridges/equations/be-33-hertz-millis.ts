/**
 * Bridge Equation 33 — Quantum-Classical Critical Point Mapping
 * (Hertz-Millis canonical scaling, 3D Heisenberg universality class).
 *
 *   ξ_quantum(T) = ξ_0 · (T/T_0)^(-ν/z)
 *
 * Pinned to 3D Heisenberg: z = 1, ν ≈ 0.71 → exponent -ν/z ≈ -0.71.
 *
 * Reference: Hertz 1976 *Phys. Rev. B* 14:1165 (original Hertz-Millis
 * theory); Millis 1993 *Phys. Rev. B* 48:7183 (canonical scaling
 * ξ ~ T^{-ν/z}); Sondhi-Girvin-Carini-Shahar 1997 *Rev. Mod. Phys.*
 * 69:315; Sachdev 2011 *Quantum Phase Transitions* 2nd ed. Ch. 11.
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The Hertz-Millis scaling form ξ ~ T^{-ν/z} is canonical for QCPs;
 *     the *3D Heisenberg pin* (z = 1, ν ≈ 0.71) is a deliberate
 *     framework commitment. Alternative universality classes
 *     (3D Ising z=1 ν≈0.63; 3D XY z=1 ν≈0.67; fermionic Hertz-Millis-
 *     Moriya z=2-3) give different exponents and would each warrant
 *     separate BE entries.
 *   - The AST `^` op requires a literal-numeric exponent. We pin the
 *     symbolic exponent to -0.71 (3D Heisenberg) — same convention as
 *     BE-34 Kibble-Zurek's d=ν=z=1 commitment. The numerical evaluator
 *     remains universality-class-agnostic (caller passes ν, z directly).
 *   - Dimensional analysis is exponent-agnostic anyway: a dimensionless
 *     ratio raised to any real number stays dimensionless, so the
 *     -0.71 exponent only fixes the bracket-check scaling, not the
 *     dimensional inference.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 33: Quantum-Classical Critical Point Mapping")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 33)
 * @module bridges/equations/be-33-hertz-millis
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  LENGTH,
  TEMPERATURE,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of Hertz-Millis correlation length:
 *   ξ_0 · (T/T_0)^(-0.71)
 *
 * The dimensionless ratio T/T_0 is raised to -0.71 (3D Heisenberg, z=1
 * ν≈0.71); the result remains [length] because (1)^anything = 1 and
 * we multiply by ξ_0 [L].
 */
export const BE33_HERTZ_MILLIS_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('xi_0', LENGTH),
    {
      kind: 'op', op: '^',
      args: [
        {
          kind: 'op', op: '/',
          args: [
            sym('T', TEMPERATURE),
            sym('T_0', TEMPERATURE),
          ],
        },
        sym('-0.71', DIMENSIONLESS), // canonical 3D Heisenberg -ν/z
      ],
    },
  ],
};

/** LHS: ξ has dimension [length]. */
export const BE33_HERTZ_MILLIS_LHS: ExprNode = sym('xi_quantum', LENGTH);

// --- Numerical evaluator ---

export interface HertzMillisInputs {
  /** Reference correlation length ξ_0 (m). Must be > 0 and finite. */
  xi_0_m: number;
  /** Temperature T (K). Must be > 0 and finite. */
  T_K: number;
  /** Reference temperature T_0 (K). Must be > 0 and finite. */
  T_0_K: number;
  /** Static correlation-length exponent ν (dimensionless, e.g. 0.71 for 3D Heisenberg). */
  nu: number;
  /** Dynamic exponent z (dimensionless, must be non-zero; e.g. 1 for 3D Heisenberg). */
  z: number;
}

/**
 * Evaluate the Hertz-Millis correlation length
 *
 *   ξ(T) = ξ_0 · (T/T_0)^(-ν/z)
 *
 * The evaluator is universality-class-agnostic: caller passes (ν, z).
 * The AST exponent is pinned to the 3D Heisenberg case (-0.71); other
 * classes are computable here without touching the AST.
 *
 * @returns Correlation length in metres.
 */
export function evaluateHertzMillis(input: HertzMillisInputs): number {
  const { xi_0_m, T_K, T_0_K, nu, z } = input;
  if (!Number.isFinite(xi_0_m) || xi_0_m <= 0) {
    throw new RangeError(
      `evaluateHertzMillis: xi_0_m must be a finite positive number, got ${xi_0_m}`,
    );
  }
  if (!Number.isFinite(T_K) || T_K <= 0) {
    throw new RangeError(
      `evaluateHertzMillis: T_K must be a finite positive number, got ${T_K}`,
    );
  }
  if (!Number.isFinite(T_0_K) || T_0_K <= 0) {
    throw new RangeError(
      `evaluateHertzMillis: T_0_K must be a finite positive number, got ${T_0_K}`,
    );
  }
  if (!Number.isFinite(nu)) {
    throw new RangeError(
      `evaluateHertzMillis: nu must be finite, got ${nu}`,
    );
  }
  if (!Number.isFinite(z) || z === 0) {
    throw new RangeError(
      `evaluateHertzMillis: z must be a finite non-zero number, got ${z}`,
    );
  }
  return xi_0_m * Math.pow(T_K / T_0_K, -nu / z);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [length].
 */
export function validateBE33Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE33_HERTZ_MILLIS_LHS, BE33_HERTZ_MILLIS_RHS);
  const lhs = validate(BE33_HERTZ_MILLIS_LHS);
  const rhs = validate(BE33_HERTZ_MILLIS_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
