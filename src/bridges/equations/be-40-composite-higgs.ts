/**
 * Bridge Equation 40 — Composite Higgs Potential
 * (canonical SO(5)/SO(4) coset / SILH form, post Wave J Tier C5
 * dimensional fix).
 *
 *   V(h) = -α f⁴ sin²(h/f) + β f⁴ [sin⁴(h/f) - sin²(h/f) cos²(h/f)]
 *
 * V has dim [energy⁴] (natural-unit Lagrangian-density convention; same
 * SI shape as BE-18, [L^8 M^4 T^-8]). f is the pseudo-Goldstone decay
 * constant (typically TeV-scale); h is the Higgs field; both have dim
 * [energy]. α, β are dimensionless Wilson coefficients; the trig
 * functions sin/cos take the dimensionless argument h/f.
 *
 * Reference: Kaplan & Georgi 1984 *Phys. Lett. B* 136:183 (composite
 * Higgs as pseudo-Goldstone boson; original SO(5)/SO(4) construction);
 * Giudice, Grojean, Pomarol & Rattazzi 2007 *JHEP* 0706:045
 * (arXiv:hep-ph/0703164; canonical SILH effective Lagrangian).
 *
 * Status: established (after Wave J Tier C5 f² → f⁴ dimensional fix).
 *
 * Honest-claude scope notes:
 *   - The AST has no transcendental primitives. The four trig terms
 *     `sin²(h/f)`, `cos²(h/f)`, `sin⁴(h/f)`, `sin²(h/f)·cos²(h/f)` are
 *     each encoded as dimensionless symbol stubs. The argument h/f is
 *     exposed as `BE40_HIGGS_DIMLESS_ARG` for the lemma test.
 *   - Working in natural units (f, h dimensionless TeV-scale) is the
 *     particle-physics convention; the numerical evaluator takes f, h
 *     as bare numbers and returns V in those same natural units.
 *   - The minimum at sin²(h/f) = (α+β)/(4β) gives `V_min = -f⁴·(α+β)²/
 *     (8β)`; for α = β = 1, V_min = -f⁴/2.
 *
 * @see docs/specification/Part-II.md ("Bridge Equation 40: Composite Higgs Potential")
 * @see src/bridges/index.ts BRIDGE_EQUATIONS.find(e => e.id === 40)
 * @module bridges/equations/be-40-composite-higgs
 */

import type { ExprNode, DimensionValidationReport } from '../../dimensional/validator.js';
import {
  Dimension,
  DIMENSIONLESS,
  ENERGY,
} from '../../dimensional/types.js';
import { power } from '../../dimensional/algebra.js';
import { sym, validateFiniteInputs, validateBEDimensions } from './_be-helpers.js';

/** [energy⁴] = [L^8 M^4 T^-8]. */
const ENERGY4: Dimension = power(ENERGY, 4);

/**
 * Lemma AST: the dimensionless argument h/f for the trig functions.
 *
 * h and f both have dim [energy], so h/f is dimensionless.
 */
export const BE40_HIGGS_DIMLESS_ARG: ExprNode = {
  kind: 'op', op: '/',
  args: [
    sym('h', ENERGY),
    sym('f', ENERGY),
  ],
};

/** f⁴ — energy^4 prefactor common to both terms. */
const F4: ExprNode = {
  kind: 'op', op: '^',
  args: [sym('f', ENERGY), sym('4', DIMENSIONLESS)],
};

/**
 * RHS of the SILH composite-Higgs potential:
 *
 *   V = -α·f⁴·sin²(h/f) + β·f⁴·(sin⁴(h/f) - sin²(h/f)·cos²(h/f))
 *
 * Encoded with dimensionless stubs for the four trig combinations
 * (`sin²`, `cos²`, `sin⁴`, `sin²cos²`). The LHS argument h/f is
 * exposed separately as `BE40_HIGGS_DIMLESS_ARG`.
 */
export const BE40_COMPOSITE_HIGGS_RHS: ExprNode = {
  kind: 'op', op: '+',
  args: [
    {
      // -α · f⁴ · sin²(h/f)
      // Encode the unary minus as multiplication by a dimensionless '-1' stub.
      kind: 'op', op: '*',
      args: [
        sym('-1', DIMENSIONLESS),
        sym('alpha', DIMENSIONLESS),
        F4,
        sym('sin^2(h/f)', DIMENSIONLESS),
      ],
    },
    {
      // β · f⁴ · (sin⁴(h/f) - sin²(h/f)·cos²(h/f))
      kind: 'op', op: '*',
      args: [
        sym('beta', DIMENSIONLESS),
        F4,
        {
          kind: 'op', op: '-',
          args: [
            sym('sin^4(h/f)', DIMENSIONLESS),
            sym('sin^2(h/f)*cos^2(h/f)', DIMENSIONLESS),
          ],
        },
      ],
    },
  ],
};

/** LHS: V(h) has dim [energy⁴]. */
/** @internal */
export const BE40_COMPOSITE_HIGGS_LHS: ExprNode = sym('V', ENERGY4);

// --- Numerical evaluator ---

/**
 * @internal — typed-arg shape for the file-local `evaluateCompositeHiggs` function; not in the v0.7 public surface. See `docs/architecture/archive/v0.7-be-module-exports-audit.md` §4.
 */
interface CompositeHiggsInputs {
  /** Higgs field h (natural units, e.g. TeV). Must be finite. */
  h: number;
  /** Pseudo-Goldstone decay constant f (natural units, e.g. TeV). Must be > 0 and finite. */
  f: number;
  /** Dimensionless Wilson coefficient α. Must be finite. */
  alpha: number;
  /** Dimensionless Wilson coefficient β. Must be finite. */
  beta: number;
}

/**
 * Evaluate the SILH composite-Higgs potential
 *
 *   V(h) = -α f⁴ sin²(h/f) + β f⁴ [sin⁴(h/f) - sin²(h/f) cos²(h/f)]
 *
 * in natural units (f, h dimensionless). Result V is in those same
 * natural units (e.g. TeV⁴).
 *
 * @returns V(h) in natural-unit f⁴-scale.
 */
export function evaluateCompositeHiggs(input: CompositeHiggsInputs): number {
  validateFiniteInputs(
    input,
    [
      { name: 'f', min: 0, excludeMin: true },
      { name: 'h' },
      { name: 'alpha' },
      { name: 'beta' },
    ],
    'evaluateCompositeHiggs',
  );
  const { h, f, alpha, beta } = input;
  const arg = h / f;
  const s = Math.sin(arg);
  const c = Math.cos(arg);
  const s2 = s * s;
  const c2 = c * c;
  const s4 = s2 * s2;
  const f4 = Math.pow(f, 4);
  return -alpha * f4 * s2 + beta * f4 * (s4 - s2 * c2);
}

// --- Self-validation ---

/**
 * Run the AST through the dimensional analyzer; both sides should be
 * [energy⁴].
 */
/** @internal */
export function validateBE40Dimensions(): DimensionValidationReport {
  return validateBEDimensions(BE40_COMPOSITE_HIGGS_LHS, BE40_COMPOSITE_HIGGS_RHS, 'BE40');
}
