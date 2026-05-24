/**
 * Einstein field equation AST node (v0.6.0 Phase 2, Task 2.3).
 *
 * Represents the predicate
 *
 *     G_μν + Λ g_μν = (8πG/c⁴) T_μν
 *
 * as a first-class structural node in the ExprNode union. The node is a
 * predicate (an equation), not a value-producing expression — it validates
 * the three structural requirements (Decision #3):
 *
 *   1. **Free-index agreement** — G_μν and T_μν must be rank-(0,2) lower-lower
 *      with the SAME index labels.
 *   2. **Per-component dim equality** — each term reduces to [L⁻²]:
 *        G_μν ~ [L⁻²]
 *        (8πG/c⁴) T_μν ~ [T²·M⁻¹·L⁻¹] · [M·L⁻¹·T⁻²] = [L⁻²]
 *        Λ g_μν ~ [L⁻²] · dimensionless = [L⁻²]
 *   3. **Symmetry agreement** — both sides symmetric in (μ,ν). T_μν has
 *      `symmetry: 'symmetric'`; G_μν is symmetric by construction.
 *
 * The coupling constant `8πG/c⁴` is represented symbolically by the tag
 * `coupling: 'einstein'` (Decision #3). No inline numeric value — mirrors
 * the constants-discipline requirement.
 *
 * @module dimensional/einstein-equation
 */

import type { Dimension } from './types.js';
import type { CovariantIndex } from './metric-validators.js';
import type { MetricTensorNode } from './metric-validators.js';
import type { EinsteinTensorNode } from './curvature.js';
import type { StressEnergyTensorNode, CosmologicalConstantNode } from './stress-energy-validators.js';
import {
  validateFreeIndexLabelMatch,
  validateComponentDimension,
  validateTensorSymmetry,
} from './field-equation-helpers.js';

// ─────────────────────────────────────────────────────────────────────────────
// EinsteinFieldEquationNode
// ─────────────────────────────────────────────────────────────────────────────

/**
 * AST node for the Einstein field equation G_μν + Λ g_μν = (8πG/c⁴) T_μν.
 *
 * Fields:
 *   - `lhs`          — G_μν (EinsteinTensorNode, shipped in v0.5.0)
 *   - `cosmological` — CosmologicalConstantNode for the Λ term; null when the
 *                      Λ-free form `G_μν = (8πG/c⁴) T_μν` is intended
 *                      (Decision #11: null = Λ-omitted, not Λ=0).
 *   - `metric`       — g_μν for the `Λ g_μν` cosmological term.
 *   - `rhs`          — T_μν (StressEnergyTensorNode).
 *   - `coupling`     — tag `'einstein'` representing 8πG/c⁴ (symbolic only).
 *
 * @public
 */
export interface EinsteinFieldEquationNode {
  readonly kind: 'einstein-equation';
  readonly lhs: EinsteinTensorNode;
  readonly cosmological: CosmologicalConstantNode | null;
  readonly metric: MetricTensorNode;
  readonly rhs: StressEnergyTensorNode;
  readonly coupling: 'einstein';
}

/**
 * Result of validating an EinsteinFieldEquationNode.
 *
 * The equation as a whole is a rank-2 lower-lower tensor identity,
 * so `freeIndices` carries the same {μ: lower, ν: lower} pair as G_μν and T_μν.
 * `dim` is [L⁻²] — the common per-component dimension of every term.
 *
 * @public
 */
export interface EinsteinFieldEquationValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

// Expected per-component dimension of every term: [L⁻²].
const DIM_L_INV2: Dimension = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

// Expected dimension of T_μν components: [M·L⁻¹·T⁻²] (energy density / Pa).
// (8πG/c⁴) ~ [T²·M⁻¹·L⁻¹]; product = [M·L⁻¹·T⁻²] × [T²·M⁻¹·L⁻¹] = [L⁻²] ✓
const DIM_T_MUV: Dimension = { L: -1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

/**
 * Extract the free-index labels from an EinsteinTensorNode.
 *
 * The Einstein tensor's free indices come from its embedded Riemann's
 * lowerIndices[0] (σ slot) and lowerIndices[2] (ν slot) — the surviving
 * indices after the Carroll Eq. 3.91 contraction. These become G_μν's
 * own μ_out and ν_out labels.
 */
function einsteinFreeIndexLabels(lhs: EinsteinTensorNode): [string, string] {
  const mu = lhs.riemann.lowerIndices[0].label;
  const nu = lhs.riemann.lowerIndices[2].label;
  return [mu, nu];
}

/**
 * Validate an `einstein-equation` node.
 *
 * Checks three predicates (Decision #3):
 *
 * 1. **Free-index agreement** — G_μν (lhs) and T_μν (rhs) must share the
 *    same two lower index labels (extracted from EinsteinTensorNode's embedded
 *    Riemann, following the Carroll Eq. 3.91 contraction convention).
 *    Throws an Error with "index label" in the message on mismatch.
 *
 * 2. **Per-component dim equality** — T_μν.componentDim must equal
 *    [M·L⁻¹·T⁻²] so that (8πG/c⁴)·T_μν ~ [L⁻²]. Throws an Error with
 *    "dimension" in the message on mismatch.
 *
 * 3. **Symmetry agreement** — T_μν must have `symmetry: 'symmetric'`. Throws
 *    an Error with "symmetry" in the message if not.
 *
 * Note: `lhs.riemann` structural validation is intentionally deferred to the
 * `einstein-tensor` case arm in `validator.ts::infer()` — this function is
 * a pure predicate-level check, not a full recursive walk.
 *
 * @example
 * ```typescript
 * import { validateEinsteinFieldEquation } from 'universal-physics-tensor';
 * import type {
 *   EinsteinFieldEquationNode,
 *   EinsteinTensorNode,
 *   StressEnergyTensorNode,
 * } from 'universal-physics-tensor';
 *
 * // Minimal vacuum EFE node (G_μν = κ T_μν with T = perfect-fluid)
 * const efeNode: EinsteinFieldEquationNode = {
 *   kind: 'einstein-equation',
 *   lhs: { ... } as EinsteinTensorNode,    // G_μν from einstein()
 *   cosmological: null,                     // Λ = 0
 *   metric: { kind: 'metric-tensor', ... },
 *   rhs: {
 *     kind: 'stress-energy-tensor',
 *     indices: [
 *       { label: 'mu', variance: 'lower' },
 *       { label: 'nu', variance: 'lower' },
 *     ],
 *     fluidType: 'perfect-fluid',
 *     symmetry: 'symmetric',
 *     componentDim: { L: -1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 },
 *   },
 *   coupling: 'einstein',
 * };
 *
 * const result = validateEinsteinFieldEquation(efeNode);
 * // result.dim = { L: -2, M: 0, T: 0, ... }  ([L⁻²])
 * // result.freeIndices.get('mu') = { upper: 0, lower: 1 }
 * ```
 *
 * @public
 */
export function validateEinsteinFieldEquation(
  node: EinsteinFieldEquationNode,
): EinsteinFieldEquationValidationResult {
  // v0.7 follow-up Phase 0 (`docs/architecture/v0.7-tensor-equation-node-
  // design-note.md`): the three predicates below are now thin
  // delegations to `field-equation-helpers.ts`. Behavior preserved —
  // error messages contain the same "index label" / "dimension" /
  // "symmetry" keywords any test pattern-matches against.

  const [lhsMu, lhsNu] = einsteinFreeIndexLabels(node.lhs);

  // ── Predicate 1: free-index label agreement ───────────────────────────────
  validateFreeIndexLabelMatch(
    'EinsteinFieldEquationNode',
    'G_μν',
    [lhsMu, lhsNu],
    'T_μν',
    [node.rhs.indices[0].label, node.rhs.indices[1].label],
  );

  // ── Predicate 2: per-component dim equality ────────────────────────────────
  validateComponentDimension(
    'EinsteinFieldEquationNode',
    'T_μν componentDim',
    node.rhs.componentDim,
    DIM_T_MUV,
    `(should be [M·L⁻¹·T⁻²] / energy density so that (8πG/c⁴)·T_μν ~ [L⁻²]; ` +
      `per-component dim of every EFE term must reduce to [L⁻²]).`,
  );

  // ── Predicate 3: symmetry agreement ───────────────────────────────────────
  validateTensorSymmetry(
    'EinsteinFieldEquationNode',
    'T_μν',
    node.rhs.symmetry,
    'symmetric',
    `Both sides of the EFE are symmetric in (μ,ν).`,
  );

  // All predicates passed — return the equation's rank-2 lower-lower identity.
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  freeIndices.set(lhsMu, { upper: 0, lower: 1 });
  freeIndices.set(lhsNu, { upper: 0, lower: 1 });

  return { dim: DIM_L_INV2, freeIndices };
}
