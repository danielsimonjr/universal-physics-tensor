/**
 * Bridge Equation 46 — Multiverse Measure Problem
 * (Weinberg-Vilenkin anthropic-probability scalar reduction).
 *
 * **Original (formally divergent) form.**
 *
 *   P[O] = ∫ dμ[g, φ] W[g, φ] δ(O − O[g, φ])
 *
 * The integration measure dμ over the space of all spacetime metrics
 * and field configurations is not Turing-computable, and the weighting
 * factor W is itself the **unsolved measure problem** — the equation's
 * own subject. As written, the original BE-46 is not a closed-form
 * mathematical object that can be encoded in the UPT AST grammar
 * (`symbol | op (* / + - ^) | integral | derivative` — there is no
 * functional integral over the space of metrics). It is included in
 * the catalog as a flagged formally-divergent entry whose role is to
 * surface the bridge-framing question, not to be evaluated.
 *
 * **Encoded reduction (Weinberg-Vilenkin form).** Wave Z applies
 * OpenAI's scalar reduction: instead of encoding the full path
 * integral, we encode the most-cited specific anthropic-probability
 * proposal — the Weinberg-Vilenkin form for a cosmological-constant-
 * like landscape parameter Λ:
 *
 *   P(Λ) = A · exp(−α / Λ)
 *
 * where:
 *   - P(Λ) is a probability ∈ [0, 1] (DIMENSIONLESS by definition);
 *   - A is a normalization constant (DIMENSIONLESS; scheme-dependent —
 *     it depends on the integrating-out cutoff used to render the
 *     underlying measure finite);
 *   - α is a model parameter, and Λ is the landscape parameter; the
 *     ratio α/Λ must be dimensionless for the exponential to be
 *     mathematically meaningful, so we encode α and Λ both as
 *     DIMENSIONLESS symbols (treating them as ratio components in the
 *     dimensionless argument).
 *
 * **Dimensionless-stub pattern for exp.** The AST has no `exp`
 * primitive. Following the same pattern as BE-26 (exp(-WKB)), BE-41
 * (exp(...)) and BE-45 (log()), we encode `exp(−α/Λ)` as a fresh
 * DIMENSIONLESS symbol stub `exp_factor` and expose the exp-argument
 * `−α/Λ` separately as `BE46_EXP_ARGUMENT` so the lemma test can
 * verify it is dimensionless directly. The stub does NOT enforce that
 * the argument is dimensionless — that is a property the encoding
 * committee enforces by construction.
 *
 * Bracket-checks (numerical evaluator computes P(Λ) = A·exp(−α/Λ)):
 *   - At Λ = α (the e-folding point): P = A · exp(−1) ≈ A · 0.368;
 *   - For large Λ (Λ ≫ α): P → A (exponential suppression vanishes,
 *     Λ-large limit dominates);
 *   - For small Λ (Λ ≪ α): P → 0 (exponential suppression is severe).
 *
 * References:
 *   - Linde, Linde & Mezhlumian 1994 *Phys. Rev. D* 49:1783
 *     (arXiv:gr-qc/9306035; volume-weighting and scale-factor cutoff
 *     measure proposals).
 *   - Vilenkin 1995 *Phys. Rev. Lett.* 74:846 (arXiv:gr-qc/9406010;
 *     proper-time cutoff measure; canonical anthropic-probability
 *     formulation).
 *   - Garriga & Vilenkin 2001 *Phys. Rev. D* 64:023507; comparative
 *     analysis of measure proposals.
 *   - Freivogel 2011 *Class. Quantum Grav.* 28:204007
 *     (arXiv:1105.0244; review of the measure-problem proposals;
 *     canonical reference for the unsolved-problem framing).
 *   - Weinberg 1987 *Phys. Rev. Lett.* 59:2607 (canonical anthropic
 *     prediction for the cosmological constant — the physical
 *     motivation for the `exp(−α/Λ)` form).
 *
 * Status: highly-speculative.
 *
 * Honest-claude scope notes:
 *   - This module encodes ONE specific measure proposal — the
 *     Weinberg-Vilenkin / `exp(−α/Λ)` form. Alternative measures
 *     (proper-time cutoff, scale-factor cutoff, causal-patch,
 *     Hartle-Hawking no-boundary) give DIFFERENT P(Λ) shapes; the
 *     measure problem is unsolved precisely because there is no
 *     consensus first-principles derivation that picks out one.
 *   - The exp argument α/Λ is dimensionless **by the dimensionless-
 *     stub convention**; α and Λ are encoded as DIMENSIONLESS symbols
 *     because they appear as ratio components of a dimensionless
 *     scalar. In a more elaborate encoding α and Λ might carry
 *     [energy^4] (cosmological-constant density) and cancel; that is
 *     not modelled here.
 *   - The normalization A is itself a scheme-dependent quantity (it
 *     depends on the integrating-out cutoff applied to the underlying
 *     measure to render it finite). The numerical evaluator takes A
 *     as a free input.
 *   - Status 'highly-speculative' is **not lifted by this encoding**.
 *     Pinning a Tier-5 AST does not promote the bridge framing — the
 *     measure problem remains unsolved, and `exp(−α/Λ)` is one
 *     proposal among several. Promoting 'highly-speculative' →
 *     'speculative' or 'established' would require deleting the
 *     status-pin test in `tests/bridges/be-46-encoding.test.ts`
 *     deliberately.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 46: Multiverse Measure Problem")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 46)
 * @module bridges/equations/be-46-multiverse-measure
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

// --- Symbolic AST ---

/**
 * Lemma AST: the exp argument `−α / Λ` (DIMENSIONLESS).
 *
 * Encoded as `(0 - α) / Λ` so the binary-subtract/divide validator can
 * walk the tree; an equivalent encoding `(-1) · (α/Λ)` via a
 * dimensionless `neg_one` would also be valid. Both α and Λ carry the
 * DIMENSIONLESS dimension (they are ratio components of a dimensionless
 * scalar — see module-header honest-claude notes).
 *
 * Exposed for the lemma test that verifies the exp argument is
 * dimensionless (per the dimensionless-stub convention).
 */
export const BE46_EXP_ARGUMENT: ExprNode = {
  kind: 'op', op: '/',
  args: [
    {
      kind: 'op', op: '-',
      args: [
        sym('0', DIMENSIONLESS),
        sym('alpha', DIMENSIONLESS),
      ],
    },
    sym('Lambda', DIMENSIONLESS),
  ],
};

/**
 * Lemma AST: the `exp(−α/Λ)` factor, encoded as a fresh DIMENSIONLESS
 * symbol stub `exp_factor` (the AST has no `exp` primitive; following
 * BE-26, BE-41, BE-45 dimensionless-stub idiom). The actual exp
 * argument is exposed separately via `BE46_EXP_ARGUMENT` so the lemma
 * test can verify it is dimensionless.
 */
export const BE46_EXP_FACTOR: ExprNode = sym('exp_factor', DIMENSIONLESS);

/**
 * Lemma AST: the normalization constant A (DIMENSIONLESS;
 * scheme-dependent — depends on the cutoff used to render the
 * underlying measure finite).
 */
export const BE46_NORMALIZATION: ExprNode = sym('A', DIMENSIONLESS);

/**
 * RHS of `P(Λ) = A · exp(−α/Λ)` as a typed ExprNode tree:
 *
 *   A · exp_factor
 *
 * `exp_factor` is a DIMENSIONLESS symbol stub for `exp(−α/Λ)`; the
 * argument `−α/Λ` is exposed via `BE46_EXP_ARGUMENT` and verified
 * dimensionless directly.
 */
export const BE46_ANTHROPIC_PROBABILITY_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    BE46_NORMALIZATION,
    BE46_EXP_FACTOR,
  ],
};

/** LHS: P(Λ) is a probability, DIMENSIONLESS by definition (P ∈ [0, 1]). */
export const BE46_ANTHROPIC_PROBABILITY_LHS: ExprNode = sym('P_Lambda', DIMENSIONLESS);

// --- Numerical evaluator ---

export interface AnthropicInputs {
  /** Normalization constant A (dimensionless; scheme-dependent). Must be finite. */
  normalization: number;
  /** Model parameter α (dimensionless ratio component). Must be finite. */
  alpha: number;
  /** Landscape parameter Λ (dimensionless ratio component). Must be finite and > 0. */
  lambda: number;
}

/**
 * Evaluate the Weinberg-Vilenkin anthropic probability:
 *
 *   P(Λ) = A · exp(−α / Λ)
 *
 * @returns Dimensionless probability (caller is responsible for
 * ensuring the chosen (A, α, Λ) yield P ∈ [0, 1] — the function does
 * not clamp).
 */
export function evaluateWeinbergVilenkinP(input: AnthropicInputs): number {
  const { normalization, alpha, lambda } = input;
  if (!Number.isFinite(normalization)) {
    throw new RangeError(
      `evaluateWeinbergVilenkinP: normalization must be finite, got ${normalization}`,
    );
  }
  if (!Number.isFinite(alpha)) {
    throw new RangeError(
      `evaluateWeinbergVilenkinP: alpha must be finite, got ${alpha}`,
    );
  }
  if (!Number.isFinite(lambda) || lambda <= 0) {
    throw new RangeError(
      `evaluateWeinbergVilenkinP: lambda must be a finite positive number, got ${lambda}`,
    );
  }
  return normalization * Math.exp(-alpha / lambda);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be DIMENSIONLESS.
 */
export function validateBE46Dimensions(): DimensionValidationReport {
  const eq = validateEquation(
    BE46_ANTHROPIC_PROBABILITY_LHS,
    BE46_ANTHROPIC_PROBABILITY_RHS,
  );
  const lhs = validate(BE46_ANTHROPIC_PROBABILITY_LHS);
  const rhs = validate(BE46_ANTHROPIC_PROBABILITY_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
