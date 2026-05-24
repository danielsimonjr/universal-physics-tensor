/**
 * Bridge Equation 24 — Förster Resonance Energy Transfer (FRET) efficiency.
 *
 *   η = R_0⁶ / (R_0⁶ + R⁶)  ≡  1 / (1 + (R/R_0)⁶)
 *
 * R is the donor-acceptor distance, R_0 is the Förster radius (typically
 * 2-10 nm; defined as the distance at which η = 1/2). η ∈ [0,1] by
 * construction.
 *
 * BE-24's catalog `formula_latex` carries TWO formulas — the
 * dipole-dipole transfer rate `k_FRET = (1/τ_D)·(R_0/R)⁶` (dim [T^-1])
 * and the bound-respecting efficiency `η` (dimensionless). We encode
 * the EFFICIENCY here because:
 *   - it is the natural FRET observable in donor-acceptor distance
 *     measurements;
 *   - η ∈ [0,1] by construction (no bound-violation regime to worry
 *     about);
 *   - it round-trips cleanly to `[1]` through the validator without
 *     needing a τ_D dimensional symbol.
 *
 * Reference: Förster 1948 *Ann. Phys. (Leipzig)* 437:55 (canonical FRET
 * derivation). Lakowicz 2006 *Principles of Fluorescence Spectroscopy*
 * 3rd ed. Ch. 13 (textbook reference for both k_FRET and η forms).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The Förster formulas are canonical; the *bridge framing* (using
 *     FRET as a UPT quantum ↔ biological bridge) is the speculative
 *     element. Same convention as BE-22 (Kitaev-Preskill canonical,
 *     QG framing speculative) and BE-38 (Milgrom MOND canonical, UPT
 *     framing speculative).
 *   - FRET is incoherent (incoherent dipole-dipole rate, no
 *     quantum-coherent enhancement); the long-running quantum-coherence-
 *     in-photosynthesis question (Engel 2007 vs. Cao 2020 / Duan 2017
 *     / Thyrhaug 2018) is contested. UPT pins FRET as the canonical
 *     baseline — see BE-24 `known_issues` for the contested-coherence
 *     reformulation candidate.
 *   - The Förster radius R_0 is itself set by `R_0⁶ ∝ κ² Q_D J / n⁴`
 *     (orientation factor κ², donor quantum yield Q_D, spectral overlap
 *     J, refractive index n). UPT does not commit to a specific
 *     R_0-decomposition; R_0 is treated as a free input.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 24: Quantum Coherence in Photosynthesis Efficiency")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 24)
 * @module bridges/equations/be-24-foerster-fret
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  LENGTH,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the FRET efficiency:
 *   η = R_0⁶ / (R_0⁶ + R⁶)
 *
 * Encoded directly: numerator R_0⁶ and denominator R_0⁶ + R⁶, both with
 * dim [L^6]. The ratio is dimensionless. The sextic powers use the `^`
 * op with literal-numeric exponent 6.
 */
export const BE24_FRET_EFFICIENCY_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      // R_0^6
      kind: 'op', op: '^',
      args: [sym('R_0', LENGTH), sym('6', DIMENSIONLESS)],
    },
    {
      // R_0^6 + R^6  (both terms are [L^6])
      kind: 'op', op: '+',
      args: [
        {
          kind: 'op', op: '^',
          args: [sym('R_0', LENGTH), sym('6', DIMENSIONLESS)],
        },
        {
          kind: 'op', op: '^',
          args: [sym('R', LENGTH), sym('6', DIMENSIONLESS)],
        },
      ],
    },
  ],
};

/** LHS: η is dimensionless. */
/** @internal */
export const BE24_FRET_EFFICIENCY_LHS: ExprNode = sym('eta_transfer', DIMENSIONLESS);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateFRETEfficiency` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface FRETEfficiencyInputs {
  /** Donor-acceptor distance R (m). Must be > 0 and finite. */
  R: number;
  /** Förster radius R_0 (m). Must be > 0 and finite. */
  R_0: number;
}

/**
 * Evaluate the FRET transfer efficiency
 *
 *   η = 1 / (1 + (R/R_0)⁶)  ∈ [0, 1]
 *
 * Equivalent canonical form: η = R_0⁶/(R_0⁶ + R⁶).
 *
 * @returns Dimensionless efficiency η ∈ [0, 1].
 */
export function evaluateFRETEfficiency(input: FRETEfficiencyInputs): number {
  const { R, R_0 } = input;
  if (!Number.isFinite(R) || R <= 0) {
    throw new RangeError(
      `evaluateFRETEfficiency: R must be a finite positive number, got ${R}`,
    );
  }
  if (!Number.isFinite(R_0) || R_0 <= 0) {
    throw new RangeError(
      `evaluateFRETEfficiency: R_0 must be a finite positive number, got ${R_0}`,
    );
  }
  const ratio = R / R_0;
  const ratio6 = Math.pow(ratio, 6);
  return 1 / (1 + ratio6);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * dimensionless.
 */
/** @internal */
export function validateBE24Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE24_FRET_EFFICIENCY_LHS, BE24_FRET_EFFICIENCY_RHS);
  const lhs = validate(BE24_FRET_EFFICIENCY_LHS);
  const rhs = validate(BE24_FRET_EFFICIENCY_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
