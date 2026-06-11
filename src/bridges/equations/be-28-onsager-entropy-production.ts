/**
 * Bridge Equation 28 — Maximum Entropy Production Principle
 * (Onsager linear-response entropy-production scalar reformulation).
 *
 * **Original (un-encodable) form.** The Dewar 2003/2005 variational
 * formulation of MEPP:
 *
 *   δ ∫ [dS/dt - λ Σᵢ Jᵢ Xᵢ - μ(∇·v)] dt = 0
 *
 * is not AST-encodable. It requires three grammar extensions: (1)
 * variational δ-operator over functionals; (2) Lagrange multipliers
 * λ, μ for constraint enforcement; (3) discrete-index sum primitive
 * over species. MEPP itself is also a **contested principle** —
 * Grinstein-Linsker 2007 *J. Phys. A* 40:9717 produced counterexamples
 * to Dewar's information-theoretic derivation, and the principle
 * conflicts with Prigogine's *minimum* entropy production principle
 * for near-equilibrium systems.
 *
 * **Encoded reformulation (Onsager linear-response entropy production).**
 * Wave Z-G (2026-05-11): per user-confirmed design choice after
 * surfacing the relabeling concern, replace the MEPP variational
 * formulation with the canonical **Onsager linear-response
 * entropy-production scalar**:
 *
 *   **σ = Σᵢ Jᵢ Xᵢ**     (typed scalar with dim [entropy/time])
 *
 * where Jᵢ are generalized fluxes (heat, particle, charge) and Xᵢ
 * are their conjugate generalized forces (∇T/T², chemical-potential
 * gradients, electric field, etc.). The discrete index sum is
 * collapsed into a single typed-stub symbol `force_flux_product` —
 * the AST has no discrete-index sum primitive, so the sum-collapsed
 * stub absorbs the multi-species content. Dim `[entropy / time]`
 * = `[L² M T⁻³ Θ⁻¹]` = `[W/K]` (power per kelvin).
 *
 * **⚠ CRITICAL WARNING — Definiendum vs. principle (honest-claude
 * scope, REQUIRED reading).** This reformulation **does NOT encode
 * the Maximum Entropy Production Principle (MEPP).** The original
 * MEPP is a contested **variational principle** asserting that
 * non-equilibrium systems organize to *maximize* entropy production
 * subject to constraints. Due to AST grammar limitations (no
 * variational δ, no Lagrange multiplier, no discrete-index sum),
 * that principle cannot be represented. This equation instead
 * encodes the foundational Onsager / Prigogine **definition** of the
 * entropy production rate (σ) as a sum of flux-force products. This
 * bridge is retained under the BE-28 label for historical continuity,
 * but it represents the *definiendum* of MEPP (the quantity MEPP
 * makes a claim about), NOT the maximization conjecture itself.
 *
 * Wording owed to the Gemini Pro Wave-Z cross-validation
 * consultation (2026-05-11), which independently confirmed the
 * "DEFENSIBLE-WITH-CAVEATS" verdict and recommended this stronger
 * warning prefix. Both OpenAI o3 and Gemini Pro agreed: the
 * relabeling is acceptable *only* because the user explicitly
 * accepted the trade-off via `AskUserQuestion` and the warning is
 * prominent. See Wave Z-G notes in `src/bridges/index.ts` for the
 * full discussion.
 *
 * The reformulation is closer in spirit to a **renaming** of BE-28
 * (from MEPP → Onsager entropy production) than to the BE-25 /
 * BE-16 / BE-37 reformulations, which preserved their bridge labels
 * (consciousness ↔ information; information ↔ thermodynamics;
 * modified light propagation). MEPP's bridge label "Why nature
 * chooses specific NESS" is NOT preserved by Onsager. Wave Z-G is
 * a project-internal decision to "close" BE-28 at the cost of the
 * MEPP semantic content.
 *
 * **AST encoding pattern.** Single typed-stub for the force-flux
 * sum. Dim: `[L² M T⁻³ Θ⁻¹]` (entropy per time, equivalently W/K).
 *
 * Bracket-checks (numerical evaluator):
 *   - σ = 1 W/K: entropy production at the rate of 1 joule of heat
 *     per second per kelvin. Typical of a small heat engine or
 *     dissipative process at room temperature.
 *   - σ ≥ 0: the Second Law in differential form (entropy
 *     production is non-negative for any irreversible process).
 *     The numerical evaluator enforces this with a RangeError.
 *
 * References:
 *   - Onsager 1931 *Phys. Rev.* 37:405 and 38:2265 (reciprocal
 *     relations — the foundational paper).
 *   - de Groot & Mazur 1962 *Non-Equilibrium Thermodynamics*
 *     (canonical textbook).
 *   - Dewar 2003 *J. Phys. A* 36:631 (MEPP information-theoretic
 *     derivation — the original-BE-28 source, now dropped).
 *   - Dewar 2005 *J. Phys. A* 38:L371 (MEPP follow-up).
 *   - Grinstein & Linsker 2007 *J. Phys. A* 40:9717 (MEPP
 *     rebuttal — counterexamples to Dewar's derivation; one of the
 *     reasons MEPP-as-variational-principle is contested).
 *   - Prigogine 1947 *Étude thermodynamique des phénomènes
 *     irréversibles* (minimum-entropy-production for near-
 *     equilibrium — the contrasting principle that conflicts with
 *     MEPP in the linear regime).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes (extended):
 *   - Onsager linear-response is **already implicitly used** by
 *     BE-21 (KSS η/s bound), BE-23 (SYK Planckian resistivity), and
 *     BE-29 (Jarzynski free-energy equality). Encoding BE-28 as
 *     "Onsager force-flux entropy production" creates some content
 *     overlap with those bridges; the distinguishing feature is
 *     that BE-28 encodes the σ scalar itself, not a derived
 *     quantity (transport coefficient or fluctuation theorem).
 *   - The MEPP variational principle is NOT captured. Anyone reading
 *     the encoded scalar should understand that the encoding answers
 *     "what is the entropy production rate?" but NOT "why does
 *     nature select this rate?" — the latter is the actual MEPP
 *     content and remains an open research question (Dewar 2003,
 *     Grinstein-Linsker 2007 rebuttal, Endres 2017 follow-ups).
 *   - The discrete index sum Σᵢ over species is collapsed into a
 *     single typed-stub `force_flux_product`. A future grammar
 *     extension with explicit discrete-index sum primitive could
 *     unfold this stub into an explicit `J_heat·X_heat +
 *     J_particle·X_particle + J_charge·X_charge` expression.
 *   - σ ≥ 0 (Second Law) is enforced by the numerical evaluator but
 *     not by the AST type system — the dimension allows negative
 *     values; the non-negativity is a semantic property.
 *   - The dim [entropy/time] = [L² M T⁻³ Θ⁻¹] = [W/K] is the
 *     **total** entropy production rate (extensive quantity). The
 *     local entropy production density σ_local with dim
 *     [entropy/(volume · time)] = [L⁻¹ M T⁻³ Θ⁻¹] is a different
 *     scalar; the encoding choice is the **total** rate, consistent
 *     with the integral form ∫ J·X d³x = σ_total over the system.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 28")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 28)
 * @module bridges/equations/be-28-onsager-entropy-production
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  Dimension,
} from '../../dimensional/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

// --- Local dim constants ---

/**
 * [L² M T⁻³ Θ⁻¹] = [entropy/time] = [W/K] — total entropy production
 * rate. ENTROPY = {L:2, M:1, T:-2, Θ:-1}; dividing by TIME {T:1}
 * gives this dim.
 */
const ENTROPY_RATE: Dimension = {
  L: 2, M: 1, T: -3, I: 0, Theta: -1, N: 0, J: 0,
};

// --- Symbolic AST ---

/**
 * Symbol for the index-collapsed force-flux product Σᵢ Jᵢ Xᵢ.
 *
 * The AST has no discrete-index sum primitive, so the multi-species
 * sum is encoded as a single typed-stub with the dim of σ itself.
 * Same idiom as BE-17 `T_torsion_squared` (typed-stub for a tensor
 * contraction the AST cannot expand) and BE-46 `exp_factor` (typed-
 * stub for an unexpressible transcendental subexpression).
 *
 * Dim `[entropy/time]` = `[W/K]`.
 */
export const BE28_FORCE_FLUX_PRODUCT: ExprNode = sym(
  'force_flux_product',
  ENTROPY_RATE,
);

/**
 * RHS of `σ = Σᵢ Jᵢ Xᵢ`:
 *
 *   force_flux_product
 *
 * Encoded as a single typed-stub (no internal expansion in the AST).
 * Dim `[entropy/time]`.
 */
export const BE28_ENTROPY_PRODUCTION_RHS: ExprNode = BE28_FORCE_FLUX_PRODUCT;

/** LHS: σ (total entropy production rate). Dim `[entropy/time]`. */
/** @internal */
export const BE28_ENTROPY_PRODUCTION_LHS: ExprNode = sym('sigma', ENTROPY_RATE);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateOnsagerEntropy` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface OnsagerEntropyInputs {
  /** Sum of force-flux products Σᵢ Jᵢ Xᵢ in SI units [W/K]. Must be finite and ≥ 0 (Second Law). */
  force_flux_product_W_per_K: number;
}

/**
 * Evaluate the Onsager linear-response entropy production rate:
 *
 *   σ = Σᵢ Jᵢ Xᵢ
 *
 * The caller supplies the already-summed force-flux product as a
 * scalar; the AST cannot expand the discrete-index sum, so the
 * evaluator takes the sum as input.
 *
 * @returns σ in W/K (joule per second per kelvin). Must be ≥ 0
 *   by the Second Law.
 */
export function evaluateOnsagerEntropyProduction(input: OnsagerEntropyInputs): number {
  // Helper handles the finiteness check. The Second-Law non-negativity
  // guard stays inline because its bespoke prose (referencing the
  // "Second Law" + "sign convention") is pattern-matched by
  // tests/bridges/be-28-onsager-encoding.test.ts at line 159.
  validateFiniteInputs(
    input,
    [{ name: 'force_flux_product_W_per_K' }],
    'evaluateOnsagerEntropyProduction',
  );
  const { force_flux_product_W_per_K } = input;
  if (force_flux_product_W_per_K < 0) {
    throw new RangeError(
      `evaluateOnsagerEntropyProduction: σ ≥ 0 by the Second Law; got ${force_flux_product_W_per_K}. ` +
        `If the input represents a fluctuation that can be negative on short timescales, ` +
        `it is not an entropy production rate — check the sign convention or the choice of conjugate forces.`,
    );
  }
  return force_flux_product_W_per_K;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be `[entropy/time]`.
 */
/** @internal */
export function validateBE28Dimensions(): DimensionValidationReport {
  return validateBEDimensions(
    BE28_ENTROPY_PRODUCTION_LHS,
    BE28_ENTROPY_PRODUCTION_RHS,
    'BE28',
  );
}

