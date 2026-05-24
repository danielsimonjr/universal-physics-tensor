/**
 * Bridge Equation 33 — Quantum-Classical Critical Point Mapping
 * (Hertz-Millis finite-temperature correlation-length scaling).
 *
 *   ξ_quantum(T) = ξ_0 · (T/T_0)^(-1/z)
 *
 * z = 1 (Lorentz-invariant QCP) → exponent -1/z = -1.
 *
 * Reference: Hertz 1976 *Phys. Rev. B* 14:1165 (original Hertz-Millis
 * theory); Millis 1993 *Phys. Rev. B* 48:7183 (Hertz-Millis at finite-T);
 * Sondhi-Girvin-Carini-Shahar 1997 *Rev. Mod. Phys.* 69:315; Sachdev
 * 2011 *Quantum Phase Transitions* 2nd ed. Ch. 11.
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - **Exponent corrected 2026-05-20.** The earlier encoding used the
 *     exponent -ν/z (pinned -0.71 for "3D Heisenberg, ν≈0.71"). That was
 *     wrong: at a quantum critical point the *spatial correlation length
 *     as a function of temperature* scales as ξ ~ T^(-1/z). The dynamic
 *     exponent z alone sets the temperature dependence (temperature fixes
 *     the thermal length L_T ~ T^(-1/z)); the correlation-length exponent
 *     ν governs the *T=0 tuning-parameter* divergence ξ ~ |g-g_c|^(-ν), a
 *     different axis. ν cancels out of the scaling function at the
 *     critical coupling. Confirmed by literature check against the
 *     QCP-scaling reviews (cond-mat/0503298 states ξ ~ (T/Tc)^(-1/z)
 *     explicitly) — this closes the prior `notes` honest-claude flag that
 *     the -ν/z vs -1/z convention was not WebFetch-confirmed.
 *   - The AST `^` op requires a literal-numeric exponent. We pin the
 *     symbolic exponent to -1 (the z = 1 Lorentz-invariant case).
 *   - Dimensional analysis is exponent-agnostic anyway: a dimensionless
 *     ratio raised to any real number stays dimensionless, so the
 *     exponent value only fixes the bracket-check scaling, not the
 *     dimensional inference.
 *   - Universality-class caveat: canonical itinerant Hertz-Millis sits
 *     *above its upper critical dimension* (mean-field exponents; z = 2
 *     antiferromagnetic / z = 3 ferromagnetic per Millis 1993). The
 *     "3D Heisenberg, z = 1" framing is a z = 1 Lorentz-invariant QCP
 *     (e.g. an insulating quantum antiferromagnet), not itinerant
 *     Hertz-Millis — see the `known_issues` entry on the catalog index.
 *     The exponent fix above is independent of universality class:
 *     ξ ~ T^(-1/z) holds whatever (ν, z) are.
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
 *   ξ_0 · (T/T_0)^(-1/z)
 *
 * The dimensionless ratio T/T_0 is raised to -1 (= -1/z for the z = 1
 * Lorentz-invariant case); the result remains [length] because
 * (1)^anything = 1 and we multiply by ξ_0 [L].
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
        sym('-1', DIMENSIONLESS), // -1/z, pinned z = 1
      ],
    },
  ],
};

/** LHS: ξ has dimension [length]. */
export const BE33_HERTZ_MILLIS_LHS: ExprNode = sym('xi_quantum', LENGTH);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateHertzMillis` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface HertzMillisInputs {
  /** Reference correlation length ξ_0 (m). Must be > 0 and finite. */
  xi_0_m: number;
  /** Temperature T (K). Must be > 0 and finite. */
  T_K: number;
  /** Reference temperature T_0 (K). Must be > 0 and finite. */
  T_0_K: number;
  /**
   * Static correlation-length exponent ν (dimensionless). Retained as an
   * input for API stability and physical completeness — ν is the exponent
   * of the *T=0 tuning-parameter* divergence ξ ~ |g-g_c|^(-ν). As of the
   * 2026-05-20 exponent correction it does NOT enter the finite-T
   * correlation-length formula, which is ξ ~ (T/T_0)^(-1/z). Still
   * validated as finite if supplied.
   */
  nu: number;
  /** Dynamic exponent z (dimensionless, must be non-zero; e.g. 1 for a Lorentz-invariant QCP). */
  z: number;
}

/**
 * Evaluate the Hertz-Millis finite-temperature correlation length
 *
 *   ξ(T) = ξ_0 · (T/T_0)^(-1/z)
 *
 * The temperature dependence at the quantum critical coupling is set by
 * the dynamic exponent z alone — see the module docstring for why ν does
 * not appear (corrected 2026-05-20). The result is independent of `nu`.
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
  return xi_0_m * Math.pow(T_K / T_0_K, -1 / z);
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
