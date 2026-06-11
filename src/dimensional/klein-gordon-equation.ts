/**
 * Klein-Gordon scalar field equation AST node.
 *
 * Phase 1 of the TensorEquationNode<LHS, RHS> generalization
 * (`docs/architecture/archive/v0.7-tensor-equation-node-design-note.md`).
 * First new field-equation node to use the Phase 0 field-equation
 * helpers shipped in commit `5cd860a`.
 *
 * Represents the predicate
 *
 *     (□ + m²) φ = J
 *
 * where `□ = g^μν ∇_μ ∇_ν` is the d'Alembertian (wave operator),
 * `m` is the field's mass, and `J` is an optional rank-0 source
 * (set to `null` for the homogeneous form `(□ + m²) φ = 0`).
 *
 * The node validates three structural requirements (mirroring
 * `EinsteinFieldEquationNode`'s pattern):
 *
 *   1. **Free-index agreement** — LHS and RHS are both rank-0
 *      (scalar). Trivial case of the rank-N invariant.
 *   2. **Per-component dim equality** — LHS and RHS must have the
 *      same `Dimension`. The wave-operator's component dim equals
 *      the field's `[fieldDim] · [L^-2]`; m² has dim `[L^-2]`; so
 *      the LHS bracket combines to `[fieldDim · L^-2]`. The source
 *      J must match that.
 *   3. **Symmetry agreement** — scalar fields have no symmetry
 *      structure; both sides carry the trivial `'scalar'` marker.
 *
 * Note: this is a PREDICATE node like EinsteinFieldEquationNode —
 * not a value-producing expression. Numerical content for the free-
 * field plane-wave sector lives in `src/numerical/klein-gordon.ts`
 * (`evaluateKGDispersionResidual`, `verifyKleinGordonPlaneWave` —
 * the SI dispersion relation ω² = c²k² + (mc²/ℏ)²). A full FD
 * wave-operator evaluator `□φ` on coordinate grids (a separate
 * `lowerKleinGordon` step like the curvature pipeline) remains
 * out of scope / future work.
 *
 * @module dimensional/klein-gordon-equation
 */

import type { Dimension } from './types.js';
import {
  validateFreeIndexLabelMatch,
  validateComponentDimension,
  validateTensorSymmetry,
} from './field-equation-helpers.js';

/**
 * Scalar field node — a typed wrapper around a rank-0 (scalar) AST
 * value with explicit dimension + symmetry markers. Minimal so the
 * Klein-Gordon predicate validator can check shape without
 * recursing into the field's internal AST.
 *
 * @public
 */
export interface ScalarFieldNode {
  /** Discriminator: 'scalar-field'. */
  readonly kind: 'scalar-field';
  /** Human-readable field name (e.g., 'phi', 'sigma'). */
  readonly name: string;
  /** SI dimension of the scalar field value. */
  readonly dim: Dimension;
  /** Symmetry tag — 'scalar' for un-indexed scalar fields. */
  readonly symmetry: 'scalar';
}

/**
 * AST node for `(□ + m²) φ = J`.
 *
 * Fields:
 *   - `field`       — φ (ScalarFieldNode). The free field whose
 *                     dynamics this equation pins.
 *   - `mass`        — m² (scalar with dim [L^-2]). Required.
 *   - `source`      — J (ScalarFieldNode | null). Null for the
 *                     homogeneous Klein-Gordon (free-field) form.
 *   - `coupling`    — tag 'klein-gordon' (no inline numeric).
 *
 * Per-component dim of every term: `[field.dim · L^-2]` (the wave
 * operator + mass term + source all share this composite dimension).
 *
 * @public
 */
export interface KleinGordonEquationNode {
  readonly kind: 'klein-gordon-equation';
  readonly field: ScalarFieldNode;
  readonly mass: ScalarFieldNode; // m² with dim [L^-2]
  readonly source: ScalarFieldNode | null;
  readonly coupling: 'klein-gordon';
}

/**
 * Result of validating a `KleinGordonEquationNode`. Mirrors
 * `EinsteinFieldEquationValidationResult` shape.
 *
 * @public
 */
export interface KleinGordonEquationValidationResult {
  /** Composite per-component dim: `[field.dim · L^-2]`. */
  readonly dim: Dimension;
  /** Empty free-indices map (rank-0 equation). */
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/** The dimensional contribution of `□ + m²`: `[L^-2]`. */
const WAVE_OPERATOR_DIM_FACTOR: Dimension = {
  L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
};

/**
 * Compose `[field.dim] × [L^-2]` (component-wise sum of exponents).
 */
function composeWaveOperatorDim(fieldDim: Dimension): Dimension {
  return {
    L: fieldDim.L + WAVE_OPERATOR_DIM_FACTOR.L,
    M: fieldDim.M + WAVE_OPERATOR_DIM_FACTOR.M,
    T: fieldDim.T + WAVE_OPERATOR_DIM_FACTOR.T,
    I: fieldDim.I + WAVE_OPERATOR_DIM_FACTOR.I,
    Theta: fieldDim.Theta + WAVE_OPERATOR_DIM_FACTOR.Theta,
    N: fieldDim.N + WAVE_OPERATOR_DIM_FACTOR.N,
    J: fieldDim.J + WAVE_OPERATOR_DIM_FACTOR.J,
  };
}

/**
 * Validate a `klein-gordon-equation` node.
 *
 * Three predicates (mirroring the field-equation-helpers pattern):
 *
 *   1. **Free-index agreement** — trivially passes (both sides are
 *      rank-0; `validateFreeIndexLabelMatch` with empty arrays).
 *   2. **Per-component dim equality** — m² and source J must
 *      match the wave-operator's contribution.
 *   3. **Symmetry agreement** — all participants are 'scalar'.
 *
 * Errors carry the keywords 'index label', 'dimension', 'symmetry'
 * (consumers pattern-matching on the EFE error vocabulary stay
 * green).
 *
 * @public
 */
export function validateKleinGordonEquation(
  node: KleinGordonEquationNode,
): KleinGordonEquationValidationResult {
  const composedDim = composeWaveOperatorDim(node.field.dim);

  // Predicate 1: free-index agreement (trivially: both rank-0).
  validateFreeIndexLabelMatch(
    'KleinGordonEquationNode',
    '(□+m²)φ',
    [],
    node.source ? 'J' : '0',
    [],
  );

  // Predicate 2a: m² dimension must be [L^-2] (mass-squared as a
  // wave-operator term contributes this).
  validateComponentDimension(
    'KleinGordonEquationNode',
    'mass term m².dim',
    node.mass.dim,
    WAVE_OPERATOR_DIM_FACTOR,
    'm² is the mass-squared term in (□+m²)φ; must have dim [L^-2] to combine with the wave operator.',
  );

  // Predicate 2b: source J dimension must equal the composed
  // wave-operator-acting-on-field dim. Skipped if source is null
  // (homogeneous form).
  if (node.source !== null) {
    validateComponentDimension(
      'KleinGordonEquationNode',
      'source J.dim',
      node.source.dim,
      composedDim,
      'J must match (□+m²)φ on the LHS, which has dim [field.dim · L^-2].',
    );
  }

  // Predicate 3: symmetry agreement — all 'scalar'.
  validateTensorSymmetry(
    'KleinGordonEquationNode',
    'field φ',
    node.field.symmetry,
    'scalar',
    'Klein-Gordon is a scalar field equation.',
  );
  validateTensorSymmetry(
    'KleinGordonEquationNode',
    'mass m²',
    node.mass.symmetry,
    'scalar',
    'm² is a scalar parameter.',
  );
  if (node.source !== null) {
    validateTensorSymmetry(
      'KleinGordonEquationNode',
      'source J',
      node.source.symmetry,
      'scalar',
      'Klein-Gordon source J is a scalar.',
    );
  }

  return {
    dim: composedDim,
    freeIndices: new Map(),
  };
}
