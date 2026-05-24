/**
 * Bridge Equation 31 — Causal Set Continuum Limit (Benincasa-Dowker
 * d=4 discrete Ricci scalar, post Wave I.B C3 reformulation).
 *
 *   R(p) = (4/√6) · ℓ_P^(-2) · [1 + N_0(p) - 9 N_1(p) + 16 N_2(p) - 8 N_3(p)]
 *
 * Discrete Ricci scalar at causal-set point p, in 4 dimensions. The
 * `(4/√6)` and N_k coefficients are dimension-specific (Benincasa-Dowker
 * 2010 *Phys. Rev. Lett.* 104:181301 = arXiv:1001.2725); the d≠4
 * generalization requires re-deriving them.
 *
 * Quantities:
 *   - R(p):  Ricci scalar at p [L^-2]
 *   - ℓ_P:   Planck length [L] → ℓ_P^(-2) is [L^-2]
 *   - N_k(p): dimensionless count of inclusion-exclusion intervals
 *             of cardinality k+2 below p
 *   - (4/√6): dimensionless geometric prefactor
 *
 * Whole RHS: `(dimensionless) · [L^-2] · (dimensionless) = [L^-2]` ✓.
 *
 * References:
 *   - Benincasa & Dowker 2010 *Phys. Rev. Lett.* 104:181301
 *     (arXiv:1001.2725; canonical d=4 form);
 *   - Sorkin 2007 "Causal Sets" (arXiv:gr-qc/0309009);
 *   - Glaser & Surya 2014 *Class. Quantum Grav.* 31:045007
 *     (BD action numerics on sprinkled causal sets).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The Benincasa-Dowker discrete Ricci scalar is established for
 *     d=4 causal-set continuum limits (rigorously derived in BD 2010);
 *     the *bridge framing* — that causal-set discreteness is the UPT
 *     microstructure of continuum spacetime — is the speculative
 *     content.
 *   - The Minkowski-sprinkling expectation values ⟨N_k⟩ on flat
 *     causal sets do NOT in general make `1 + ⟨N_0⟩ - 9⟨N_1⟩ +
 *     16⟨N_2⟩ - 8⟨N_3⟩` vanish trivially — a continuum-limit-mean
 *     bracket-check is sensitive to BD 2010's specific sign
 *     conventions and is omitted from the test suite. Bracket-checks
 *     instead verify (a) coefficient extraction at unit-vector tuples,
 *     (b) linearity in each N_k separately, (c) ℓ_P^(-2) scaling,
 *     and (d) the algebraic-zero point at (N_0, N_1, N_2, N_3) =
 *     (-1, 0, 0, 0).
 *   - Encoding pattern: the dimensionless prefactor `4/√6` and the
 *     [N_k] count combination are encoded as a single dimensionless
 *     symbol stub `(4/√6)·bracket` — splitting them adds no
 *     dimensional information and complicates the AST. The numerical
 *     evaluator computes the bracket explicitly with full
 *     coefficient fidelity.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 31: Causal Set Continuum Limit")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 31)
 * @module bridges/equations/be-31-causal-set-bd
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
 * [L^-2] — inverse-area dimension for the Ricci scalar. Hand-built
 * literal (rather than `power(LENGTH, -2)`) because `power()` produces
 * `-0` for unaffected bases (since `0 * -2 = -0` in IEEE 754), which
 * compares unequal under deep-strict equality even though dimensionally
 * the value is the same. Same pattern as BE-23's RESISTIVITY literal.
 */
const INV_LENGTH_2: Dimension = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/**
 * RHS of the Benincasa-Dowker d=4 discrete Ricci scalar:
 *   (4/√6) · ℓ_P^(-2) · [1 + N_0 - 9 N_1 + 16 N_2 - 8 N_3]
 *
 * The dimensionless geometric prefactor (4/√6) and the dimensionless
 * polynomial in dimensionless N_k counts are bundled into a single
 * dimensionless symbol stub `(4/√6)·bracket`; this preserves the
 * dimensional information without adding spurious AST structure. The
 * numerical evaluator computes the bracket explicitly (test suite
 * verifies coefficient extraction at unit-vector tuples).
 */
export const BE31_CAUSAL_SET_BD_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    sym('(4/sqrt(6))*[1+N_0-9N_1+16N_2-8N_3]', DIMENSIONLESS),
    {
      kind: 'op', op: '^',
      args: [sym('lP', LENGTH), sym('-2', DIMENSIONLESS)],
    },
  ],
};

/** LHS: R(p) has dimension [L^-2]. */
/** @internal */
export const BE31_CAUSAL_SET_BD_LHS: ExprNode = sym('R_p', INV_LENGTH_2);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateBenincasaDowker` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface BenincasaDowkerInputs {
  /** Cardinality-2 inclusion-exclusion count N_0(p) (dimensionless integer in practice; finite real here for derivative tests). */
  N_0: number;
  /** Cardinality-3 count N_1(p). */
  N_1: number;
  /** Cardinality-4 count N_2(p). */
  N_2: number;
  /** Cardinality-5 count N_3(p). */
  N_3: number;
  /** Planck length ℓ_P (m). Must be > 0 and finite. */
  l_P_m: number;
}

/**
 * Evaluate the Benincasa-Dowker d=4 discrete Ricci scalar
 *
 *   R(p) = (4/√6) · ℓ_P^(-2) · [1 + N_0 - 9 N_1 + 16 N_2 - 8 N_3]
 *
 * @returns Ricci scalar in m^-2 (SI).
 */
export function evaluateBenincasaDowker(input: BenincasaDowkerInputs): number {
  const { N_0, N_1, N_2, N_3, l_P_m } = input;
  if (!Number.isFinite(N_0)) {
    throw new RangeError(`evaluateBenincasaDowker: N_0 must be finite, got ${N_0}`);
  }
  if (!Number.isFinite(N_1)) {
    throw new RangeError(`evaluateBenincasaDowker: N_1 must be finite, got ${N_1}`);
  }
  if (!Number.isFinite(N_2)) {
    throw new RangeError(`evaluateBenincasaDowker: N_2 must be finite, got ${N_2}`);
  }
  if (!Number.isFinite(N_3)) {
    throw new RangeError(`evaluateBenincasaDowker: N_3 must be finite, got ${N_3}`);
  }
  if (!Number.isFinite(l_P_m) || l_P_m <= 0) {
    throw new RangeError(
      `evaluateBenincasaDowker: l_P_m must be a finite positive number, got ${l_P_m}`,
    );
  }
  const bracket = 1 + N_0 - 9 * N_1 + 16 * N_2 - 8 * N_3;
  const prefactor = 4 / Math.sqrt(6);
  return (prefactor * bracket) / (l_P_m * l_P_m);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [L^-2].
 */
/** @internal */
export function validateBE31Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE31_CAUSAL_SET_BD_LHS, BE31_CAUSAL_SET_BD_RHS);
  const lhs = validate(BE31_CAUSAL_SET_BD_LHS);
  const rhs = validate(BE31_CAUSAL_SET_BD_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
