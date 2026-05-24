/**
 * Bridge Equation 39 — Asymptotic Safety in Quantum Gravity (functional
 * renormalization-group β-functions in the canonical Einstein-Hilbert
 * truncation).
 *
 *   β_g = 2g + A·g² + B·g³ − C·g²·λ + O(g⁴)
 *   β_λ = −2λ + D·λ² − E·g·λ − F·g² + O(λ³, g³)
 *
 * Where g ≡ G(k)·k² is the dimensionless Newton coupling, λ ≡ Λ(k)/k²
 * is the dimensionless cosmological constant, and (A, B, C, D, E, F)
 * are truncation-scheme-dependent coefficients (Reuter 1998
 * *Phys. Rev. D* 57:971, arXiv:hep-th/9605030; Reuter-Weyer 2009
 * *Gen. Rel. Grav.* 41:983 for the canonical EH-truncation values;
 * Codello-Percacci-Rahmede 2009 review of sign conventions).
 *
 * Status: speculative.
 *
 * **v0.7 BE-X re-encoding** — the preferred structural form is now
 * `BE39_BETA_G_STRUCTURAL` / `BE39_BETA_LAMBDA_STRUCTURAL` (added below),
 * which wraps the polynomial ExprNode in a `BetaFunctionNode` carrying the
 * (g, λ) coupling vector + target + optional NGFP fixed-point pin. The
 * legacy `BE39_BETA_G_RHS` / `BE39_BETA_G_LHS` exports remain unchanged
 * for catalog round-trip and existing-test compatibility.
 *
 * Honest-claude scope notes:
 *   - The β-functions are dimensionless functions of dimensionless
 *     couplings (g, λ). Both LHS and RHS infer to DIMENSIONLESS;
 *     dim_signature: '[1]'.
 *   - Coefficients (A, B, C, D, E, F) are NOT universal — they depend
 *     on the truncation scheme, the regulator function R_k, and the
 *     gauge-fixing. Different schemes yield different numerical
 *     coefficients. Calling them "universal" was misleading; the
 *     spec's known_issues entry (Wave L Tier I5) documents this.
 *   - The AST encodes β_g as the canonical RHS for the catalog
 *     round-trip; β_λ has the same dimensional structure
 *     (dimensionless polynomial in dimensionless g and λ) and is
 *     numerically evaluable separately via `evaluateBetaLambda`.
 *   - At the Gaussian fixed point (g, λ) = (0, 0), both β-functions
 *     vanish — the "trivial fixed point" of the RG flow.
 *   - The non-Gaussian fixed point (NGFP) is the conjectural UV-
 *     attractive fixed point that motivates the asymptotic-safety
 *     program: numerical truncation studies find g_* ≈ 0.7, λ_* ≈ 0.4
 *     (in some sign conventions) for the canonical EH truncation, but
 *     the values are scheme-dependent.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 39: Asymptotic Safety in Quantum Gravity")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 39)
 * @see src/dimensional/rg-flow.ts (BetaFunctionNode + RGCouplingNode)
 * @module bridges/equations/be-39-asymptotic-safety
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import { Dimension, DIMENSIONLESS } from '../../dimensional/types.js';
import type { BetaFunctionNode, RGCouplingNode } from '../../dimensional/rg-flow.js';
import { rgCoupling } from '../../dimensional/rg-flow.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the canonical β_g equation:
 *   β_g = 2g + A·g² + B·g³ − C·g²·λ
 *
 * All symbols are dimensionless. The result is dimensionless (β-functions
 * are derivatives of dimensionless couplings w.r.t. log of energy scale).
 *
 * Encoded as an explicit sum of terms with a `-1` dimensionless stub for
 * the unary minus on the C·g²·λ term (the AST's `op '-'` is binary).
 */
export const BE39_BETA_G_RHS: ExprNode = {
  kind: 'op', op: '+',
  args: [
    {
      // 2g
      kind: 'op', op: '*',
      args: [sym('2', DIMENSIONLESS), sym('g', DIMENSIONLESS)],
    },
    {
      // A · g²
      kind: 'op', op: '*',
      args: [
        sym('A', DIMENSIONLESS),
        {
          kind: 'op', op: '^',
          args: [sym('g', DIMENSIONLESS), sym('2', DIMENSIONLESS)],
        },
      ],
    },
    {
      // B · g³
      kind: 'op', op: '*',
      args: [
        sym('B', DIMENSIONLESS),
        {
          kind: 'op', op: '^',
          args: [sym('g', DIMENSIONLESS), sym('3', DIMENSIONLESS)],
        },
      ],
    },
    {
      // -C · g² · λ  (encoded as a single dimensionless symbol stub
      // 'minus_C_g2_lambda' to keep the binary-op structure clean; the
      // sign is captured in the symbol name)
      kind: 'op', op: '*',
      args: [
        sym('-C', DIMENSIONLESS),
        {
          kind: 'op', op: '^',
          args: [sym('g', DIMENSIONLESS), sym('2', DIMENSIONLESS)],
        },
        sym('lambda', DIMENSIONLESS),
      ],
    },
  ],
};

/** LHS: β_g is dimensionless. */
/** @internal */
export const BE39_BETA_G_LHS: ExprNode = sym('beta_g', DIMENSIONLESS);

/**
 * RHS of the canonical β_λ equation:
 *   β_λ = −2λ + D·λ² − E·g·λ − F·g²
 *
 * All symbols are dimensionless. Mirrors the β_g encoding pattern —
 * unary minus on a leading term is absorbed into a dimensionless symbol
 * stub (`-2`) for the binary-op grammar.
 *
 * Added in v0.7 BE-X re-encoding to support the `BetaFunctionNode`
 * structural form below.
 */
export const BE39_BETA_LAMBDA_RHS: ExprNode = {
  kind: 'op', op: '+',
  args: [
    {
      // -2λ
      kind: 'op', op: '*',
      args: [sym('-2', DIMENSIONLESS), sym('lambda', DIMENSIONLESS)],
    },
    {
      // D · λ²
      kind: 'op', op: '*',
      args: [
        sym('D', DIMENSIONLESS),
        {
          kind: 'op', op: '^',
          args: [sym('lambda', DIMENSIONLESS), sym('2', DIMENSIONLESS)],
        },
      ],
    },
    {
      // -E · g · λ
      kind: 'op', op: '*',
      args: [
        sym('-E', DIMENSIONLESS),
        sym('g', DIMENSIONLESS),
        sym('lambda', DIMENSIONLESS),
      ],
    },
    {
      // -F · g²
      kind: 'op', op: '*',
      args: [
        sym('-F', DIMENSIONLESS),
        {
          kind: 'op', op: '^',
          args: [sym('g', DIMENSIONLESS), sym('2', DIMENSIONLESS)],
        },
      ],
    },
  ],
};

/** LHS: β_λ is dimensionless. */
/** @internal */
export const BE39_BETA_LAMBDA_LHS: ExprNode = sym('beta_lambda', DIMENSIONLESS);

// ─────────────────────────────────────────────────────────────────────────────
// v0.7 BE-X re-encoding — structural BetaFunctionNode wrappers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Shared coupling vector for BE-39. The asymptotic-safety EH-truncation
 * RG flow runs on the two-coupling space (g, λ); both β-functions live
 * on this same flow direction, so the same `RGCouplingNode` instances
 * are reused below.
 *
 * @public
 */
export const BE39_COUPLING_G: RGCouplingNode = rgCoupling('g');

/** @public */
export const BE39_COUPLING_LAMBDA: RGCouplingNode = rgCoupling('lambda');

/**
 * Structural β_g — the preferred v0.7+ encoding. Wraps `BE39_BETA_G_RHS`
 * in a `BetaFunctionNode` carrying the full (g, λ) coupling vector and
 * a Gaussian fixed-point pin at (0, 0). The non-Gaussian fixed point is
 * scheme-dependent and not pinned here; downstream consumers may
 * construct their own scheme-specific `BetaFunctionNode` with a numerical
 * NGFP value via Reuter-Weyer 2009 or Codello-Percacci-Rahmede 2009.
 *
 * @public
 */
export const BE39_BETA_G_STRUCTURAL: BetaFunctionNode = {
  kind: 'beta-function',
  couplings: [BE39_COUPLING_G, BE39_COUPLING_LAMBDA],
  target: BE39_COUPLING_G,
  polynomialExpansion: BE39_BETA_G_RHS,
  fixedPoint: [0, 0], // Gaussian fixed point (trivial)
};

/**
 * Structural β_λ — the preferred v0.7+ encoding. Wraps `BE39_BETA_LAMBDA_RHS`
 * in a `BetaFunctionNode`. Same (g, λ) coupling vector as β_g (the RG flow
 * is shared between the two β-functions); target is `λ`. Gaussian fixed
 * point pinned at (0, 0) for symmetry with β_g.
 *
 * @public
 */
export const BE39_BETA_LAMBDA_STRUCTURAL: BetaFunctionNode = {
  kind: 'beta-function',
  couplings: [BE39_COUPLING_G, BE39_COUPLING_LAMBDA],
  target: BE39_COUPLING_LAMBDA,
  polynomialExpansion: BE39_BETA_LAMBDA_RHS,
  fixedPoint: [0, 0], // Gaussian fixed point (trivial)
};

// --- Numerical evaluator for β_g ---

/**
 * @internal — typed-arg shape for the file-local `evaluateBetaG` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface BetaGInputs {
  /** Dimensionless Newton coupling g = G(k)·k². Must be finite. */
  g: number;
  /** Dimensionless cosmological constant λ = Λ(k)/k². Must be finite. */
  lambda: number;
  /** Truncation-scheme coefficient A (g² term). Must be finite. */
  A: number;
  /** Truncation-scheme coefficient B (g³ term). Must be finite. */
  B: number;
  /** Truncation-scheme coefficient C (g²λ cross-coupling). Must be finite. */
  C: number;
}

/**
 * Evaluate the β-function for the dimensionless Newton coupling:
 *
 *   β_g = 2g + A·g² + B·g³ − C·g²·λ
 *
 * @returns Dimensionless β_g value.
 */
export function evaluateBetaG(input: BetaGInputs): number {
  const { g, lambda, A, B, C } = input;
  for (const [name, val] of [['g', g], ['lambda', lambda], ['A', A], ['B', B], ['C', C]] as const) {
    if (!Number.isFinite(val)) {
      throw new RangeError(
        `evaluateBetaG: ${name} must be finite, got ${val}`,
      );
    }
  }
  return 2 * g + A * g * g + B * g * g * g - C * g * g * lambda;
}

// --- Numerical evaluator for β_λ ---

/**
 * @internal — typed-arg shape for the file-local `evaluateBetaLambda` function; not in the v0.7 public surface. See `docs/architecture/v0.7-be-module-exports-audit.md` §4.
 */
interface BetaLambdaInputs {
  /** Dimensionless Newton coupling g. Must be finite. */
  g: number;
  /** Dimensionless cosmological constant λ. Must be finite. */
  lambda: number;
  /** Truncation-scheme coefficient D (λ² term). Must be finite. */
  D: number;
  /** Truncation-scheme coefficient E (g·λ cross-coupling). Must be finite. */
  E: number;
  /** Truncation-scheme coefficient F (g² term, Wave S addition). Must be finite. */
  F: number;
}

/**
 * Evaluate the β-function for the dimensionless cosmological constant:
 *
 *   β_λ = −2λ + D·λ² − E·g·λ − F·g²
 *
 * The −F·g² term was added in Wave S (per Math iter-7 IMP-6); its
 * presence is required for the canonical Einstein-Hilbert truncation
 * to fix the non-Gaussian fixed point's λ_* value.
 *
 * @returns Dimensionless β_λ value.
 */
export function evaluateBetaLambda(input: BetaLambdaInputs): number {
  const { g, lambda, D, E, F } = input;
  for (const [name, val] of [['g', g], ['lambda', lambda], ['D', D], ['E', E], ['F', F]] as const) {
    if (!Number.isFinite(val)) {
      throw new RangeError(
        `evaluateBetaLambda: ${name} must be finite, got ${val}`,
      );
    }
  }
  return -2 * lambda + D * lambda * lambda - E * g * lambda - F * g * g;
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * DIMENSIONLESS.
 */
/** @internal */
export function validateBE39Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE39_BETA_G_LHS, BE39_BETA_G_RHS);
  const lhs = validate(BE39_BETA_G_LHS);
  const rhs = validate(BE39_BETA_G_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
