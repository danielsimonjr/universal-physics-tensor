/**
 * Bridge Equation 25 — Consciousness ↔ Information Integration (IIT Φ).
 *
 * Encodes the **inner intrinsic-information form** from Integrated
 * Information Theory (Tononi; Oizumi-Albantakis-Tononi 2014 IIT 3.0;
 * Albantakis et al. 2023 IIT 4.0):
 *
 *   ii(s, s̃) = p(s̃ | s) · log₂[ p(s̃ | s) / p(s̃) ]
 *
 * where `s` is a candidate-substrate state and `s̃` a successor state
 * in its transition probability matrix (TPM). `ii(s, s̃)` measures, in
 * bits, the irreducibility of the conditional probability `p(s̃|s)`
 * against the substrate-marginal `p(s̃)`.
 *
 * The full canonical Φ_max formula is
 *
 *   Φ_max(S) = min_{θ ∈ partitions(S)} [ ii(s, s̃) - ii_θ(s, s̃) ]
 *
 * The outer `min_θ` is the **minimum information partition (MIP)** —
 * a discrete optimization over the set of bipartitions of the
 * substrate. The UPT AST grammar (`symbol | op (* / + - ^) | integral |
 * derivative`) has no `min` primitive over a discrete index set, so the
 * MIP outer structure is **deferred grammar-extension** (same status
 * as BE-15 stochastic noise and BE-28 Lagrange multipliers). This
 * module encodes the **inner** ii(s, s̃) — the kernel that the MIP
 * minimizes — as DIMENSIONLESS.
 *
 * **Bits is a pseudo-unit, not an SI dimension.** Φ and ii have units
 * of bits when log₂ is used (or nats with ln, hartleys with log₁₀).
 * Bits is not in the SI 7-base system; it is the LHS of a unit-free
 * pure number when measured in the canonical IIT convention. The
 * dimensional analyzer therefore types ii as DIMENSIONLESS `[1]`. The
 * encoding committee preserves the "bits" semantics by docstring
 * convention; the validator only enforces that all components are
 * dimensionally consistent.
 *
 * **Dimensionless-stub pattern for log₂.** The AST has no `log`
 * primitive. Following the same idiom as BE-26 (exp(-WKB)), BE-41
 * (exp(...)), BE-45 (log()), BE-46 (exp()), and BE-50 (no log/exp;
 * algebraic), we encode `log₂[p(s̃|s)/p(s̃)]` as a fresh DIMENSIONLESS
 * symbol stub `log2_ratio_ii` and expose the inner ratio
 * `p(s̃|s)/p(s̃)` separately as `BE25_LOG_RATIO_ARG` so a lemma test
 * can verify the argument is dimensionless directly.
 *
 * **AST structure (multiplicative, not additive — note the difference
 * from BE-45).** BE-45's RHS `log(M_P/H_inf) − γ·log(r/0.01)` is a
 * *sum* of two log-stubs. BE-25's `p(s̃|s) · log₂[p(s̃|s)/p(s̃)]` is a
 * *product* — a probability times a log-stub. Both are encoded with
 * the same fresh-symbol-stub convention; only the outer operator
 * differs.
 *
 * Bracket-checks (numerical evaluator computes ii(s,s̃) = p_cond ·
 * log₂(p_cond/p_marg)):
 *   - Maximum irreducibility (p_cond = 1, p_marg → 0⁺): ii → +∞;
 *   - No irreducibility (p_cond = p_marg, e.g. both 0.5):
 *     ii = 0.5 · log₂(1) = 0;
 *   - "Surprise" case (p_cond = 0.5, p_marg = 0.25):
 *     ii = 0.5 · log₂(2) = 0.5 bits;
 *   - Shannon-zero (p_cond = 0, p_marg arbitrary): ii = 0 (limit);
 *   - Impossible-joint (p_cond > 0, p_marg = 0): KL-divergence
 *     diverges — caller error (RangeError thrown).
 *
 * References:
 *   - Tononi 2008 *Biol. Bull.* 215:216 (canonical original IIT
 *     formulation; integrated information as a measure of
 *     consciousness).
 *   - Oizumi, Albantakis & Tononi 2014 *PLoS Comput. Biol.* 10:e1003588
 *     (IIT 3.0; calculable Φ via earth-mover's distance / Wasserstein
 *     metric over partitions; minimum information partition; the
 *     canonical computational-IIT reference).
 *   - Albantakis, Barbosa, Findlay, Grasso, Haun, Marshall, Mayner,
 *     Zaeemzadeh, Boly, Juel, Sasai, Fujii, David, Bjørndahl, Lemmon,
 *     Allen, Mosquera, Ladd, Hassan, Hendren, Kim, Yu, Tian, Chen,
 *     Tsuchiya & Tononi 2023 *PLoS Comput. Biol.* 19:e1011465
 *     (arXiv:2212.14787; IIT 4.0 with explicit axiom-postulate
 *     framework).
 *   - Wikipedia "Phi (integrated information theory)" / "Integrated
 *     information theory" (canonical Φ formula via MIP and intrinsic
 *     information ii(s,s̃) = p(s̃|s) log₂[p(s̃|s)/p(s̃)]).
 *   - Aaronson 2014 blog "Why I am not an integrated information
 *     theorist" (computational counterexamples yielding arbitrarily
 *     large Φ for systems generally not regarded as conscious;
 *     canonical contested-framework citation).
 *
 * Status: speculative (NOT lifted by this encoding).
 *
 * Honest-claude scope notes:
 *   - This module encodes the **inner** ii(s, s̃) only. The outer
 *     `min_θ` over partitions (MIP) and the partition-conditional
 *     `ii_θ` lemma are NOT encoded — both require a `min`-over-index-
 *     set grammar extension that the UPT AST does not currently
 *     support. The same deferral applies to BE-15 (stochastic noise)
 *     and BE-28 (Lagrange multipliers).
 *   - Status 'speculative' is **not lifted by this encoding**. IIT
 *     itself is calculable and well-defined; the bridge framing
 *     (consciousness ↔ maximally-integrated-information) is contested
 *     by Aaronson 2014 (computational counterexamples) and Doerig
 *     2019 (unfolding argument). Pinning a Tier-5 AST does not
 *     promote the bridge claim.
 *   - The 0·log(0) = 0 limit (p_cond → 0) is enforced by the
 *     numerical evaluator following Shannon's canonical convention
 *     and Oizumi-Albantakis-Tononi 2014. The p_marg = 0 with
 *     p_cond > 0 case (KL-divergence singularity) is rejected with
 *     RangeError because the joint outcome is physically inconsistent
 *     (the system did transition to s̃ but the marginal says s̃ is
 *     impossible).
 *   - Φ_max is exponential in substrate size (EXPTIME); the numerical
 *     evaluator here only computes ii for a single (s, s̃) pair, not
 *     the outer MIP minimization. Computing Φ_max for substrates with
 *     more than ~10 elements is intractable in practice.
 *   - **Encoded form vs. IIT 4.0 canonical metric (Wave-Z final-review
 *     scope note, 2026-05-11):** the encoded
 *     `ii(s,s̃) = p(s̃|s) · log₂[p(s̃|s)/p(s̃)]` is the *pointwise-KL*
 *     / Wikipedia / IIT-pedagogical simplified form of the intrinsic
 *     information. IIT 3.0 (Oizumi-Albantakis-Tononi 2014) and IIT 4.0
 *     (Albantakis et al. 2023) use the **earth-mover's distance**
 *     (Wasserstein metric) as the canonical irreducibility measure on
 *     the cause-effect repertoire, NOT the pointwise log-ratio. The
 *     two agree in spirit and give qualitatively similar Φ rankings
 *     for small systems but differ quantitatively. The encoded log-
 *     ratio is preferred here because (a) it has a closed-form scalar
 *     reduction the AST grammar can express, and (b) it is the form
 *     most commonly cited in introductory IIT references. Encoding
 *     the Wasserstein metric would require a transport-plan primitive
 *     the UPT AST does not have.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 25: Consciousness — Information Integration Bridge")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 25)
 * @see src/bridges/equations/be-25-orch-or.ts (archived; legacy Penrose-Hameroff form)
 * @module bridges/equations/be-25-iit-phi
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  DIMENSIONLESS,
} from '../../dimensional/types.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

// --- Symbolic AST ---

/**
 * Lemma AST: the conditional probability `p(s̃|s)` (DIMENSIONLESS,
 * ∈ [0, 1]).
 *
 * Exposed as a separate node so it can be reused inside both
 * `BE25_LOG_RATIO_ARG` and `BE25_INTRINSIC_INFORMATION_RHS`. The
 * validator only sees its dimension (DIMENSIONLESS); the [0, 1] range
 * is a semantic property enforced by the numerical evaluator's
 * input-validation guards, not the type system.
 */
export const BE25_P_CONDITIONAL: ExprNode = sym('p_cond', DIMENSIONLESS);

/**
 * Lemma AST: the marginal probability `p(s̃)` (DIMENSIONLESS, ∈ [0, 1]).
 *
 * Same convention as `BE25_P_CONDITIONAL`: dimension is DIMENSIONLESS;
 * the [0, 1] range is enforced numerically, not type-theoretically.
 */
export const BE25_P_MARGINAL: ExprNode = sym('p_marg', DIMENSIONLESS);

/**
 * Lemma AST: the log₂ argument `p(s̃|s) / p(s̃)` (DIMENSIONLESS, the
 * ratio of two probabilities).
 *
 * Exposed for the lemma test that verifies the argument is
 * dimensionless (per the dimensionless-stub convention; see
 * `src/dimensional/README.md` "Encoding transcendental functions").
 */
export const BE25_LOG_RATIO_ARG: ExprNode = {
  kind: 'op', op: '/',
  args: [
    BE25_P_CONDITIONAL,
    BE25_P_MARGINAL,
  ],
};

/**
 * Lemma AST: the `log₂[p(s̃|s) / p(s̃)]` factor, encoded as a fresh
 * DIMENSIONLESS symbol stub `log2_ratio_ii` (the AST has no `log`
 * primitive; following the BE-26 / BE-41 / BE-45 / BE-46 dimensionless-
 * stub idiom). The actual log argument is exposed separately via
 * `BE25_LOG_RATIO_ARG` so the lemma test can verify it is
 * dimensionless.
 */
export const BE25_LOG2_FACTOR: ExprNode = sym('log2_ratio_ii', DIMENSIONLESS);

/**
 * RHS of `ii(s, s̃) = p(s̃|s) · log₂[p(s̃|s) / p(s̃)]` as a typed
 * ExprNode tree:
 *
 *   p_cond · log2_ratio_ii
 *
 * `log2_ratio_ii` is a DIMENSIONLESS symbol stub for `log₂(...)`; the
 * argument `p_cond / p_marg` is exposed via `BE25_LOG_RATIO_ARG` and
 * verified dimensionless directly. The product of two dimensionless
 * symbols is DIMENSIONLESS — same shape as BE-46's `A · exp_factor`.
 */
export const BE25_INTRINSIC_INFORMATION_RHS: ExprNode = {
  kind: 'op', op: '*',
  args: [
    BE25_P_CONDITIONAL,
    BE25_LOG2_FACTOR,
  ],
};

/**
 * LHS: ii(s, s̃) is in bits (DIMENSIONLESS in the SI sense — bits is
 * a pseudo-unit not in the SI 7-base system).
 */
/** @internal */
export const BE25_INTRINSIC_INFORMATION_LHS: ExprNode = sym('ii', DIMENSIONLESS);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateIntrinsicInformation` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface IntrinsicInformationInputs {
  /** Conditional probability p(s̃|s) ∈ [0, 1]. Must be finite. */
  p_cond: number;
  /** Marginal probability p(s̃) ∈ (0, 1]. Must be finite. When `p_cond > 0`, must be > 0 (KL-divergence singularity rejected). */
  p_marg: number;
}

/**
 * Evaluate the inner intrinsic information of a (s, s̃) transition
 * pair:
 *
 *   ii(s, s̃) = p_cond · log₂(p_cond / p_marg)
 *
 * Edge cases (Shannon convention; matches Oizumi-Albantakis-Tononi
 * 2014 IIT 3.0):
 *
 *   - p_cond = 0: returns 0 (the canonical limit 0 · log(0) = 0).
 *     The value of p_marg is not consulted in this branch.
 *   - p_cond > 0 and p_marg = 0: throws RangeError. The joint outcome
 *     is physically inconsistent — the system did transition to s̃
 *     but the marginal says s̃ has zero probability; the KL-divergence
 *     diverges to +∞.
 *   - p_cond = p_marg: returns 0 (no irreducibility — conditional
 *     equals marginal means s̃ was no more or less likely given s).
 *
 * @returns Intrinsic information in bits (dimensionless; can be
 *   negative when p_cond < p_marg — i.e., conditioning on s makes s̃
 *   less likely than the unconditional marginal).
 */
export function evaluateIntrinsicInformation(input: IntrinsicInformationInputs): number {
  // Use the helper for the finite + bounded-range check; the cross-field
  // KL-divergence singularity (p_cond > 0 && p_marg = 0) stays inline
  // because it carries a domain-meaningful explanation that the generic
  // helper cannot capture.
  validateFiniteInputs(
    input,
    [
      { name: 'p_cond', min: 0, max: 1, allowZero: true, description: 'probability' },
      { name: 'p_marg', min: 0, max: 1, allowZero: true, description: 'probability' },
    ],
    'evaluateIntrinsicInformation',
  );
  const { p_cond, p_marg } = input;
  // Shannon convention: 0 · log(0/anything) = 0 (the canonical limit).
  // Return 0 BEFORE consulting p_marg so the p_cond = 0 / p_marg = 0
  // joint zero does not raise.
  if (p_cond === 0) return 0;
  // p_cond > 0 here; p_marg = 0 is the KL-divergence singularity.
  if (p_marg === 0) {
    throw new RangeError(
      `evaluateIntrinsicInformation: p_marg = 0 with p_cond = ${p_cond} > 0 ` +
        `is the KL-divergence singularity (impossible-joint-event); ` +
        `the system transitioned to s̃ but the marginal says s̃ has zero probability.`,
    );
  }
  return p_cond * Math.log2(p_cond / p_marg);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; LHS and RHS should
 * both be DIMENSIONLESS.
 */
/** @internal */
export function validateBE25Dimensions(): DimensionValidationReport {
  return validateBEDimensions(
    BE25_INTRINSIC_INFORMATION_LHS,
    BE25_INTRINSIC_INFORMATION_RHS,
    'BE25',
  );
}

