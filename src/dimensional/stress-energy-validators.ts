/**
 * Stress-energy tensor and cosmological constant AST nodes (v0.6.0 Phase 2).
 *
 * Locked to lower-lower variance (Decision #2). Symmetry locked as
 * explicit field (Decision #12). Antisymmetric T_μν⁺ (Belinfante-Rosenfeld)
 * deferred to v0.7.0+.
 *
 * @module dimensional/stress-energy-validators
 */

import type { Dimension } from './types.js';
import type {
  CovariantIndex,
  StressEnergyTensorNode,
  CosmologicalConstantNode,
} from './ast-types.js';

// Node types now live in the leaf `ast-types.ts`; re-exported for compat.
export type { StressEnergyTensorNode, CosmologicalConstantNode } from './ast-types.js';

/**
 * AST node for the stress-energy tensor T_μν. Rank-2 lower-lower locked
 * (Decision #2). Symmetric (Decision #12).
 *
 * componentDim is the SI dimension of a single component: [M·L⁻¹·T⁻²]
 * (energy density = Pa = kg·m⁻¹·s⁻²).
 *
 * @public
 */
// v0.6.1: dropped export — internal-only validation-result shape.
interface StressEnergyValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a `stress-energy` node.
 *
 * Throws:
 *   - Error if rank ≠ 2 (T_μν is a rank-2 tensor by definition).
 *   - Error if any index variance ≠ 'lower' (lower-lower locked per Decision #2).
 *
 * Returns `{dim: componentDim, freeIndices: {idx0: {lower:1}, idx1: {lower:1}}}`.
 */
export function validateStressEnergyTensor(
  node: StressEnergyTensorNode,
): StressEnergyValidationResult {
  if (node.indices.length !== 2) {
    throw new Error(
      `StressEnergyTensorNode: expected rank-2, got rank-${node.indices.length}`,
    );
  }
  for (const idx of node.indices) {
    if (idx.variance !== 'lower') {
      throw new Error(
        `StressEnergyTensorNode: only lower-lower variance supported in v0.6.0 (got '${idx.variance}')`,
      );
    }
  }
  const freeIndices = new Map<string, { upper: number; lower: number }>();
  freeIndices.set(node.indices[0].label, { upper: 0, lower: 1 });
  freeIndices.set(node.indices[1].label, { upper: 0, lower: 1 });
  return { dim: node.componentDim, freeIndices };
}

// v0.6.1: dropped export — internal-only validation-result shape.
interface CosmologicalConstantValidationResult {
  readonly dim: Dimension;
  readonly freeIndices: Map<string, { upper: number; lower: number }>;
}

/**
 * Validate a `cosmological-constant` node.
 *
 * Throws:
 *   - Error if dim ≠ [L⁻²] (check L === -2 && M === 0 && T === 0).
 *
 * Returns `{dim, freeIndices: empty}` (scalar — no free indices).
 */
export function validateCosmologicalConstant(
  node: CosmologicalConstantNode,
): CosmologicalConstantValidationResult {
  if (node.dim.L !== -2 || node.dim.M !== 0 || node.dim.T !== 0) {
    throw new Error(
      `CosmologicalConstantNode: expected dim [L⁻²], got ${JSON.stringify(node.dim)}`,
    );
  }
  return { dim: node.dim, freeIndices: new Map() };
}
