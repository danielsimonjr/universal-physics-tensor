/**
 * Bridge Equation 15 — Universal Emergence Equation (Hohenberg-Halperin
 * Model A, Kawasaki-Gunton coarsening scaling-law reduction).
 *
 * **Original (un-encodable) form.** Canonical Model A gradient flow:
 *
 *   ∂φ/∂t = -Γ δH/δφ + ζ(x,t)
 *   ⟨ζ(x,t) ζ(x',t')⟩ = 2 Γ k_B T δ(x-x') δ(t-t')
 *   H[φ] = ∫ d³x [½(∇φ)² + V(φ)]
 *
 * Three grammar barriers: (1) Dirac-delta correlators for ⟨ζζ⟩;
 * (2) functional derivative δH/δφ; (3) functional integration `H[φ]`
 * over field configurations. The UPT AST grammar
 * (`symbol | op (* / + - ^) | integral | derivative`) provides none of
 * these primitives. The full Model A Langevin equation therefore
 * cannot be encoded as a closed-form scalar relation.
 *
 * **Encoded reduction (Kawasaki-Gunton coarsening scaling law).**
 * Wave Z-D applies OpenAI's scalar reduction: the late-stage
 * Kawasaki-Gunton coarsening length-scale of Model A satisfies
 *
 *   **L(t)² = Γ · t**     (equivalently L(t) = √(Γ t))
 *
 * a closed-form algebraic relation that IS expressible in the AST
 * grammar. This is the canonical z = 2 dynamic-critical-exponent
 * scaling for non-conserved order parameters — the signature
 * dynamical content that distinguishes Model A from Model B
 * (conserved density, z ≈ 3, L(t) ~ (Γt)^{1/3}) and from Model H
 * (fluid, z ≈ 3 with additional flow corrections).
 *
 * The bridge label `microscale → emergent` is captured directly: at
 * the microscale Γ is a kinetic coefficient with dim [L²/T] (set by
 * the local relaxation dynamics); at the emergent scale L(t) is the
 * characteristic correlation length grown by domain-wall annihilation
 * over time t. Kawasaki-Gunton (1976) derived this scaling from the
 * Allen-Cahn equation; it is reproduced by the linear Model A
 * relaxation of long-wavelength modes.
 *
 * **Squared-form encoding.** We encode `L² = Γ · t` rather than
 * `L = √(Γ t)` because the AST's `^` operator requires dimensionless
 * exponents, and a non-integer power-1/2 on a dimensionful base
 * (`(Γt)^{1/2}`) would require a `sqrt` primitive the grammar does
 * not provide. The squared form is an exact algebraic equality whose
 * dimensions check directly: Γ [L²/T] · t [T] = [L²] = dim(L²).
 * Same pattern as BE-17 (Einstein-Cartan): the squared invariant
 * lives in the AST; the root lives in the numerical evaluator.
 *
 * Bracket-checks (numerical evaluator computes L(t) = √(Γt)):
 *   - Γ = 1 m²/s, t = 1 s: L = 1 m.
 *   - Γ = 1 m²/s, t = 100 s: L = 10 m.
 *   - Γ scaling: doubling Γ at fixed t scales L by √2.
 *   - t scaling: doubling t at fixed Γ scales L by √2.
 *
 * References:
 *   - Hohenberg & Halperin 1977 *Rev. Mod. Phys.* 49:435 (canonical
 *     critical-dynamics classification: Model A purely-dissipative).
 *   - Kawasaki & Gunton 1976 *Phys. Rev. A* 13:2294 (coarsening
 *     theory of non-conserved order parameter; original L(t) ~ √(Γt)
 *     derivation).
 *   - Allen & Cahn 1979 *Acta Metall.* 27:1085 (Allen-Cahn equation
 *     and motion-by-mean-curvature derivation of L(t) ~ √(Γt)).
 *   - Bray 1994 *Adv. Phys.* 43:357 (canonical review of coarsening
 *     dynamics; comprehensive treatment of all Hohenberg-Halperin
 *     models and their scaling laws).
 *   - Chaikin & Lubensky 1995 *Principles of Condensed Matter
 *     Physics* Ch. 8 (standard textbook reference).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - This module encodes ONE scalar invariant of Model A — the
 *     late-stage coarsening length-scale. The full Langevin equation
 *     (gradient flow + FDT-balanced noise), the field-space
 *     Hamiltonian H[φ], the functional derivative δH/δφ, and the
 *     δ-correlated noise structure are all OUTSIDE the encoding.
 *   - The relation `L² = Γt` is the **late-stage asymptotic** scaling
 *     of the correlation length for non-conserved order parameters.
 *     It is exact in the linear (Allen-Cahn) regime and in the
 *     scaling regime of the nonlinear theory; for early-time
 *     transients and near-critical behavior it is corrected by
 *     logarithms and renormalization-group factors (Bray 1994 §3).
 *     The encoding does NOT capture these corrections.
 *   - Status 'speculative' is **not lifted by this encoding**. Model
 *     A itself is canonical condensed-matter physics; the *bridge
 *     framing* — committing to Model A's specific coarse-graining as
 *     the UPT microscale-↔-emergent bridge — remains the speculative
 *     element. The original UPT "Universal Emergence" claim is
 *     explicitly dropped (Wave P-D R-D1): Model B, C, H each require
 *     their own bridge entry.
 *   - Other Model-A scalars considered but NOT chosen (per OpenAI o3
 *     Wave Z-D consultation 2026-05-11):
 *     * Zero-mode equipartition `⟨|φ_k|²⟩ = k_BT / (Γ ω_k)` is
 *       generic statistical mechanics (applies to any linearized
 *       field theory at equilibrium) and does not encode Model A's
 *       dynamics specifically. Rejected as physics-losing /
 *       mislabeling.
 *     * Fluctuation-dissipation amplitude `D = 2Γk_BT` is the FDT
 *       coefficient but loses all dynamical content. Rejected.
 *     * Equal-time spatial correlation `C(r) ~ exp(-r/ξ)` would
 *       require an `exp` stub and a typed ξ symbol; less direct
 *       coverage of the dynamics than L(t). Acceptable alternative
 *       but Kawasaki-Gunton is more diagnostic of the z=2 dynamic
 *       critical exponent.
 *
 * @see docs/specification/Part-I.md ("Bridge Equation 15: Universal Emergence Equation")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 15)
 * @module bridges/equations/be-15-emergence
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  TIME,
  AREA,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

// --- Local dim constants ---

/**
 * [L²·T⁻¹] — Model A kinetic coefficient Γ. The coarsening law
 * L²(t) = Γt has its dimensional consistency precisely encoded here:
 * [L²/T] · [T] = [L²]. Γ is sometimes called the Onsager kinetic
 * coefficient or the mobility in Model A; the SI numerical value
 * depends on the order parameter's specific physical interpretation.
 */
const MOBILITY: Dimension = { L: 2, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 };

// --- Symbolic AST ---

/**
 * Symbol for the Model A kinetic coefficient Γ. Dim [L²/T].
 *
 * Exposed for the lemma test that verifies the typed dim.
 */
export const BE15_MOBILITY: ExprNode = sym('Gamma', MOBILITY);

/**
 * Symbol for time t. Dim [T].
 *
 * Exposed for the lemma test that verifies the typed dim.
 */
export const BE15_TIME: ExprNode = sym('t', TIME);

/**
 * RHS of `L(t)² = Γ · t` as a typed ExprNode tree:
 *
 *   Γ · t
 *
 * Dim: [L²/T] · [T] = [L²] = [AREA]. The squared-length form is the
 * AST-encodable algebraic relation; the root `L(t) = √(Γt)` is
 * computed in the numerical evaluator.
 */
export const BE15_COARSENING_LENGTH_SQUARED_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    BE15_MOBILITY,
    BE15_TIME,
  ],
};

/**
 * LHS: `L(t)²` is the squared coarsening length, dim [L²] = [AREA].
 */
export const BE15_COARSENING_LENGTH_SQUARED_LHS: ExprNode = sym(
  'L_squared',
  AREA,
);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateCoarsening` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
export interface CoarseningInputs {
  /** Model A kinetic coefficient Γ in [m²/s]. Must be finite and > 0. */
  gamma: number;
  /** Time t in [s]. Must be finite and > 0. */
  t: number;
}

/**
 * Evaluate the Kawasaki-Gunton coarsening length:
 *
 *   L(t) = √(Γ · t)
 *
 * @returns Coarsening length L(t) in [m] (SI). For Γ in m²/s and t in
 *   seconds, the result is in meters.
 */
export function evaluateCoarseningLength(input: CoarseningInputs): number {
  const { gamma, t } = input;
  if (!Number.isFinite(gamma) || gamma <= 0) {
    throw new RangeError(
      `evaluateCoarseningLength: gamma must be a finite positive number, got ${gamma}`,
    );
  }
  if (!Number.isFinite(t) || t <= 0) {
    throw new RangeError(
      `evaluateCoarseningLength: t must be a finite positive number, got ${t}`,
    );
  }
  return Math.sqrt(gamma * t);
}

/**
 * Evaluate the squared coarsening length:
 *
 *   L(t)² = Γ · t
 *
 * Useful for AST round-trip checks and avoiding the square-root step.
 */
export function evaluateCoarseningLengthSquared(input: CoarseningInputs): number {
  const { gamma, t } = input;
  if (!Number.isFinite(gamma) || gamma <= 0) {
    throw new RangeError(
      `evaluateCoarseningLengthSquared: gamma must be a finite positive number, got ${gamma}`,
    );
  }
  if (!Number.isFinite(t) || t <= 0) {
    throw new RangeError(
      `evaluateCoarseningLengthSquared: t must be a finite positive number, got ${t}`,
    );
  }
  return gamma * t;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be [AREA] = [L²].
 */
export function validateBE15Dimensions(): DimensionValidationReport {
  const eq = validateEquation(
    BE15_COARSENING_LENGTH_SQUARED_LHS,
    BE15_COARSENING_LENGTH_SQUARED_RHS,
  );
  const lhs = validate(BE15_COARSENING_LENGTH_SQUARED_LHS);
  const rhs = validate(BE15_COARSENING_LENGTH_SQUARED_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
