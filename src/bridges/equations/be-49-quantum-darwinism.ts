/**
 * Bridge Equation 49 — Quantum Darwinism redundancy / mutual-information
 * decay (Zurek 2009 *Nat. Phys.* 5:181 framework).
 *
 *   I(S:F_k) = I(S:E) - α · k^(-β)
 *
 * Spec form is `I(S:F_k) = I(S:E) - O(k^-α)` (asymptotic-O notation,
 * not a precise formula). For the AST encoding we commit to the
 * leading-order power-law correction `α · k^(-β)`, where α is a
 * dimensionless magnitude prefactor and β is a dimensionless decay
 * exponent. This disambiguates the spec's overloaded "α" (which
 * denoted the exponent under the O-notation): in this encoding
 * α = magnitude, β = decay exponent.
 *
 * All quantities are dimensionless:
 *   - I(S:F_k):   mutual information between system S and a k-fragment
 *                 of environment E (bits / nats — dimensionless either way)
 *   - I(S:E):     system-environment total mutual information [1]
 *   - α:          dimensionless magnitude prefactor
 *   - k:          dimensionless fragment count
 *   - β:          dimensionless decay exponent (positive ⇒ actual decay)
 *   - k^(-β):     dimensionless ⇒ dimensionless
 *
 * The AST `^` op requires a literal-numeric exponent. We pin the
 * symbolic exponent to **β = 1** (standard mutual-information large-k
 * decay; "good information broadcasting" regime per Zurek 2009 review)
 * — same convention as BE-34 Kibble-Zurek's d=ν=z=1 commitment and
 * BE-33 Hertz-Millis's 3D Heisenberg pin. Other β values would
 * require a different encoded module; the numerical evaluator,
 * however, accepts arbitrary β so non-canonical regimes remain
 * computable without touching the AST.
 *
 * References:
 *   - Zurek 2009 *Nat. Phys.* 5:181 (canonical Quantum Darwinism review);
 *   - Blume-Kohout & Zurek 2006 *Phys. Rev. A* 73:062310
 *     (arXiv:quant-ph/0505031; quantum mutual information in
 *     many-fragment environments);
 *   - Korbicz, Horodecki & Horodecki 2014 *Phys. Rev. Lett.* 112:120402
 *     (arXiv:1305.3527; spectrum-broadcast structure).
 *
 * Status: speculative.
 *
 * Honest-claude scope notes:
 *   - The Zurek Quantum Darwinism *framework* is canonical; the
 *     specific algebraic decay form `I(S:F_k) = I(S:E) - α k^(-β)` is
 *     a phenomenological-ansatz extension (the spec's `O(k^-α)` is
 *     asymptotic notation, not a precise formula). Both α and β are
 *     free fitting parameters.
 *   - Dimensional analysis is exponent-agnostic: a dimensionless
 *     quantity raised to any real number stays dimensionless, so the
 *     β = 1 pin only fixes the bracket-check scaling, not the
 *     dimensional inference.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 49: Quantum Darwinism Redundancy")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 49)
 * @module bridges/equations/be-49-quantum-darwinism
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import { validate, validateEquation } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
} from '../../dimensional/types.js';

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });

/**
 * RHS of the Quantum-Darwinism mutual-information decay:
 *   I(S:E) - α · k^(-1)
 *
 * Pinned to β = 1 (the canonical large-k decay exponent for
 * good-information-broadcasting regimes). All operands are
 * dimensionless; the result is dimensionless.
 */
export const BE49_QUANTUM_DARWINISM_RHS: ExprNode = {
  kind: 'op', op: '-',
  args: [
    sym('I_SE', DIMENSIONLESS),
    {
      kind: 'op', op: '*',
      args: [
        sym('alpha', DIMENSIONLESS),
        {
          kind: 'op', op: '^',
          args: [sym('k', DIMENSIONLESS), sym('-1', DIMENSIONLESS)],
        },
      ],
    },
  ],
};

/** LHS: I(S:F_k) is dimensionless. */
export const BE49_QUANTUM_DARWINISM_LHS: ExprNode = sym('I_S_Fk', DIMENSIONLESS);

// --- Numerical evaluator ---

export interface QuantumDarwinismInputs {
  /** Total system-environment mutual information I(S:E). Must be finite. */
  I_SE: number;
  /** Dimensionless magnitude prefactor α. Must be finite. */
  alpha: number;
  /** Dimensionless fragment count k. Must be > 0 and finite. */
  k: number;
  /** Dimensionless decay exponent β. Must be finite. */
  beta: number;
}

/**
 * Evaluate the Quantum-Darwinism mutual-information decay
 *
 *   I(S:F_k) = I(S:E) - α · k^(-β)
 *
 * The evaluator is β-agnostic: caller passes β directly. The AST
 * exponent is pinned to β = 1 (canonical large-k decay); other β
 * values are computable here without touching the AST.
 *
 * @returns Dimensionless mutual information I(S:F_k).
 */
export function evaluateQuantumDarwinism(input: QuantumDarwinismInputs): number {
  const { I_SE, alpha, k, beta } = input;
  if (!Number.isFinite(I_SE)) {
    throw new RangeError(
      `evaluateQuantumDarwinism: I_SE must be finite, got ${I_SE}`,
    );
  }
  if (!Number.isFinite(alpha)) {
    throw new RangeError(
      `evaluateQuantumDarwinism: alpha must be finite, got ${alpha}`,
    );
  }
  if (!Number.isFinite(k) || k <= 0) {
    throw new RangeError(
      `evaluateQuantumDarwinism: k must be a finite positive number, got ${k}`,
    );
  }
  if (!Number.isFinite(beta)) {
    throw new RangeError(
      `evaluateQuantumDarwinism: beta must be finite, got ${beta}`,
    );
  }
  return I_SE - alpha * Math.pow(k, -beta);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * dimensionless.
 */
export function validateBE49Dimensions(): DimensionValidationReport {
  const eq = validateEquation(BE49_QUANTUM_DARWINISM_LHS, BE49_QUANTUM_DARWINISM_RHS);
  const lhs = validate(BE49_QUANTUM_DARWINISM_LHS);
  const rhs = validate(BE49_QUANTUM_DARWINISM_RHS);
  return {
    ok: eq.ok,
    lhsDim: lhs.inferredDimension,
    rhsDim: rhs.inferredDimension,
  };
}
