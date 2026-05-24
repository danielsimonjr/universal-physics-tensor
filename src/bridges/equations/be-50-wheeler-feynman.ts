/**
 * Bridge Equation 50 — Wheeler-Feynman absorber theory / time-symmetric
 * gauge field.
 *
 *   Original (Wave P-A canonical):
 *     A_μ(x) = (1/2) [A_μ^ret(x) + A_μ^adv(x)]
 *
 *   Encoded reduction (Wave Z, OpenAI scalar reduction):
 *     r_TS = (A_ret − A_adv) / (A_ret + A_adv)
 *
 * The encoded scalar `r_TS` is the *time-symmetry residual*: a
 * dimensionless ratio that vanishes identically (≡ 0) in
 * Wheeler-Feynman absorber theory. Under the absorber boundary
 * condition (every emitted disturbance is fully absorbed by future
 * matter), the half-retarded-plus-half-advanced symmetric form is
 * physically equivalent to retarded-only Maxwell, and the residual
 * captures any deviation from that equivalence as a dimensionless
 * asymmetry parameter.
 *
 * **Structural form available (v0.7)**: `BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL`
 * re-expresses the time-symmetry residual as a `TimeSymmetryPredicateNode`
 * from `src/dimensional/gauge-field.ts`. The structural form makes the
 * "two-arrow-of-time" architecture explicit at the AST level (additive
 * new export; existing scalar exports are unchanged).
 *
 * References:
 *   - Wheeler & Feynman 1945 Rev. Mod. Phys. 17:157 — "Interaction with
 *     the Absorber as the Mechanism of Radiation".
 *   - Wheeler & Feynman 1949 Rev. Mod. Phys. 21:425 — "Classical
 *     Electrodynamics in Terms of Direct Interparticle Action".
 *   - Cramer 1986 Rev. Mod. Phys. 58:647 — "The Transactional
 *     Interpretation of Quantum Mechanics".
 *   - Hoyle & Narlikar 1995 Rev. Mod. Phys. 67:113 — "Cosmology and
 *     action-at-a-distance electrodynamics".
 *
 * Status: highly-speculative. The absorber boundary condition is
 * empirically untested in QFT; the dimensional content of the gauge-
 * field identity (A_ret and A_adv share dim, ratio is dimensionless)
 * is canonical, but the bridge framing as "retrocausal QFT" is
 * conjectural.
 *
 * Honest-claude scope notes:
 *   - The encoded scalar is a **ratio**: it captures the time-symmetry
 *     claim dimensionlessly without committing to a specific gauge-
 *     field SI dim convention (Heaviside-Lorentz vs Gaussian vs SI).
 *   - A_ret and A_adv share dimension by construction (both are
 *     A_μ^ret/adv solutions of the same wave equation with the same
 *     source). We pin them to a generic gauge-field dim — the SI dim
 *     of the magnetic vector potential A: V·s/m = kg·m/(A·s²),
 *     i.e. { L: 1, M: 1, T: -2, I: -1 }.
 *   - The numerator (A_ret − A_adv) and denominator (A_ret + A_adv)
 *     each have gauge-field dim; the ratio is dimensionless [1].
 *   - The "≡ 0" identity-pin assumes the absorber boundary condition;
 *     any non-zero residual measures retrocausal-asymmetry violation.
 *   - This encoding pins only the dimensional structure; it does NOT
 *     bridge the absorber-theory claim to mainstream QFT.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 50: Wheeler-Feynman")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 50)
 * @module bridges/equations/be-50-wheeler-feynman
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import type {
  GaugeFieldNode,
  TimeSymmetryPredicateNode,
} from '../../dimensional/gauge-field.js';

// --- Symbolic AST ---

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * SI dimension of the magnetic vector potential A_μ:
 *   [A] = V·s/m = kg·m/(A·s²) = { L: 1, M: 1, T: -2, I: -1 }.
 *
 * Both A_ret and A_adv share this dim by construction (each is a
 * Liénard-Wiechert-type solution of the same inhomogeneous wave
 * equation with retarded vs advanced Green's function).
 */
export const MAGNETIC_VECTOR_POTENTIAL: Dimension = {
  L: 1, M: 1, T: -2, I: -1, Theta: 0, N: 0, J: 0,
};

/** Retarded gauge field A_μ^ret. Gauge-field dim. */
const BE50_RETARDED_FIELD: ExprNode = sym('A_ret', MAGNETIC_VECTOR_POTENTIAL);

/** Advanced gauge field A_μ^adv. Gauge-field dim. */
const BE50_ADVANCED_FIELD: ExprNode = sym('A_adv', MAGNETIC_VECTOR_POTENTIAL);

/**
 * Numerator of the time-symmetry residual: (A_ret − A_adv).
 * Carries gauge-field dim by virtue of subtracting same-dim operands.
 */
export const BE50_TIME_SYMMETRY_NUMERATOR: ExprNode = {
  kind: 'op', op: '-',
  args: [BE50_RETARDED_FIELD, BE50_ADVANCED_FIELD],
};

/**
 * Denominator of the time-symmetry residual: (A_ret + A_adv).
 * Carries gauge-field dim by virtue of adding same-dim operands.
 *
 * Up to the conventional 1/2 factor in the original Wheeler-Feynman
 * form `A_μ = (1/2)(A_ret + A_adv)`, this is twice the symmetric gauge
 * field. The dimensionless ratio cancels the 1/2, so we encode
 * (A_ret + A_adv) directly.
 */
export const BE50_TIME_SYMMETRY_DENOMINATOR: ExprNode = {
  kind: 'op', op: '+',
  args: [BE50_RETARDED_FIELD, BE50_ADVANCED_FIELD],
};

/**
 * RHS of the time-symmetry residual:
 *   r_TS = (A_ret − A_adv) / (A_ret + A_adv).
 * Dimensionless [1] — gauge-field dim cancels in the ratio.
 */
export const BE50_TIME_SYMMETRY_RESIDUAL_RHS: ExprNode = {
  kind: 'op', op: '/',
  args: [BE50_TIME_SYMMETRY_NUMERATOR, BE50_TIME_SYMMETRY_DENOMINATOR],
};

/**
 * LHS: r_TS — the dimensionless time-symmetry residual scalar.
 * Identically 0 under the Wheeler-Feynman absorber boundary condition.
 */
const BE50_TIME_SYMMETRY_RESIDUAL_LHS: ExprNode = sym('r_TS', DIMENSIONLESS);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateWF` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface WFInputs {
  /** Retarded gauge-field amplitude A_ret in V·s/m (or arbitrary same-unit amplitude). */
  A_retarded: number;
  /** Advanced gauge-field amplitude A_adv in V·s/m (or arbitrary same-unit amplitude). */
  A_advanced: number;
}

/**
 * Evaluate the time-symmetry residual r_TS = (A_ret − A_adv) / (A_ret + A_adv).
 *
 * Honest-claude: returns 0 exactly when A_ret = A_adv (canonical
 * absorber-theory identity), ±1 in the pure-retarded / pure-advanced
 * limits, and is scale-invariant under common rescaling of both
 * fields. Throws RangeError if either input is non-finite or if the
 * sum is exactly zero (division by zero).
 *
 * @returns Dimensionless residual.
 */
export function evaluateWFTimeSymmetry(input: WFInputs): number {
  const { A_retarded, A_advanced } = input;
  if (!Number.isFinite(A_retarded)) {
    throw new RangeError(
      `evaluateWFTimeSymmetry: A_retarded must be finite, got ${A_retarded}`,
    );
  }
  if (!Number.isFinite(A_advanced)) {
    throw new RangeError(
      `evaluateWFTimeSymmetry: A_advanced must be finite, got ${A_advanced}`,
    );
  }
  const denom = A_retarded + A_advanced;
  if (denom === 0) {
    throw new RangeError(
      `evaluateWFTimeSymmetry: A_retarded + A_advanced === 0 (division by zero); ` +
        `the residual is undefined when retarded and advanced amplitudes cancel exactly.`,
    );
  }
  return (A_retarded - A_advanced) / denom;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be DIMENSIONLESS.
 */
function validateBE50Dimensions(): DimensionValidationReport {
  const eq = validateEquation(
    BE50_TIME_SYMMETRY_RESIDUAL_LHS,
    BE50_TIME_SYMMETRY_RESIDUAL_RHS,
  );
  const lhs = validate(BE50_TIME_SYMMETRY_RESIDUAL_LHS);
  const rhs = validate(BE50_TIME_SYMMETRY_RESIDUAL_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}

// --- Structural form (v0.7 BE-50 re-encoding) ---

/**
 * Retarded gauge potential A_μ^ret for the structural predicate.
 *
 * Uses `MAGNETIC_VECTOR_POTENTIAL` dim (SI: V·s/m = kg·m/(A·s²)),
 * matching the scalar encoding's `BE50_RETARDED_FIELD` dim.
 * Arrow-of-time tagged `'retarded'` per the Wheeler-Feynman 1945
 * Liénard-Wiechert retarded Green's function convention.
 */
const BE50_RETARDED_GAUGE_NODE: GaugeFieldNode = {
  kind: 'gauge-field',
  name: 'A_ret',
  arrowOfTime: 'retarded',
  dim: MAGNETIC_VECTOR_POTENTIAL,
};

/**
 * Advanced gauge potential A_μ^adv for the structural predicate.
 *
 * Uses `MAGNETIC_VECTOR_POTENTIAL` dim, matching `BE50_ADVANCED_FIELD`.
 * Arrow-of-time tagged `'advanced'` per the Wheeler-Feynman 1945
 * advanced Green's function convention.
 */
const BE50_ADVANCED_GAUGE_NODE: GaugeFieldNode = {
  kind: 'gauge-field',
  name: 'A_adv',
  arrowOfTime: 'advanced',
  dim: MAGNETIC_VECTOR_POTENTIAL,
};

/**
 * Structural `TimeSymmetryPredicateNode` for Bridge Equation 50.
 *
 * Re-expresses the dimensionless time-symmetry residual
 *
 *   r_TS = (A_ret − A_adv) / (A_ret + A_adv)
 *
 * as a `TimeSymmetryPredicateNode` from `src/dimensional/gauge-field.ts`.
 * The structural form makes explicit:
 *
 *   - The "two-arrow-of-time" architecture (retarded vs advanced).
 *   - The epsilon bound: `1e-2` (Cramer 1986 Rev. Mod. Phys. 58:647
 *     §VII experimental constraint on |r_TS| for electromagnetic
 *     transactions).
 *   - Dimensional consistency: both fields carry `MAGNETIC_VECTOR_POTENTIAL`
 *     dim; the ratio is dimensionless by cancellation.
 *
 * This is an ADDITIVE new export. The existing scalar exports
 * (`BE50_TIME_SYMMETRY_RESIDUAL_RHS`, `BE50_TIME_SYMMETRY_NUMERATOR`,
 * `BE50_TIME_SYMMETRY_DENOMINATOR`, `MAGNETIC_VECTOR_POTENTIAL`,
 * `evaluateWFTimeSymmetry`) are unchanged.
 *
 * Validation: `import { validateTimeSymmetryPredicate } from
 * '../../dimensional/gauge-field.js'` and call
 * `validateTimeSymmetryPredicate(BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL)`.
 *
 * References:
 *   - Wheeler & Feynman 1945 Rev. Mod. Phys. 17:157 §2–3
 *   - Cramer 1986 Rev. Mod. Phys. 58:647 §VII (experimental bound)
 *
 * @public
 */
export const BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL: TimeSymmetryPredicateNode = {
  kind: 'time-symmetry-predicate',
  retarded: BE50_RETARDED_GAUGE_NODE,
  advanced: BE50_ADVANCED_GAUGE_NODE,
  // Cramer 1986 §VII experimental bound on the time-symmetry residual
  // for physical electromagnetic transactions: |r_TS| < 10^-2.
  epsilon: 1e-2,
};
