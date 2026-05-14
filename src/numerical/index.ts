/**
 * Public surface of the UPT numerical-contraction backend (v0.3.5).
 * See docs/planning/v0.3.5-Design.md §5.
 *
 * @module numerical
 */
import type { Dimension } from '../dimensional/types.js';
import type { ExprNode, Violation } from '../dimensional/validator.js';
import { validate } from '../dimensional/validator.js';
import type { EngineTensor, TensorEngine } from './tensor-engine.js';
import type { NumericalInputs, NestedArray } from './types.js';
import { lowerNode } from './lowering.js';
import { getActiveEngine } from './engine-registry.js';
import { NumericalBackendError } from './errors.js';

export type { TensorEngine, EngineTensor, EinsumSpec } from './tensor-engine.js';
export type { NumericalInputs, NestedArray } from './types.js';
export { Float64ReferenceEngine } from './float64-engine.js';
export { getActiveEngine, setActiveEngine } from './engine-registry.js';
export { NumericalBackendError } from './errors.js';

export interface NumericalResult {
  readonly value: NestedArray;
  readonly dim: Dimension;
  readonly freeIndices: ReadonlyMap<string, { upper: number; lower: number }>;
  readonly warnings: ReadonlyArray<Violation>;
}

export interface NumericalRawResult {
  readonly value: EngineTensor;
  readonly dim: Dimension;
  readonly freeIndices: ReadonlyMap<string, { upper: number; lower: number }>;
  readonly warnings: ReadonlyArray<Violation>;
  dispose(): void;
}

export interface EvaluateOptions {
  readonly engine?: TensorEngine;
}

/** Validate the AST and return (engine, validation result) or throw. */
function prepare(node: ExprNode, options?: EvaluateOptions) {
  const vr = validate(node);
  if (!vr.ok) {
    throw new NumericalBackendError(
      `evaluateNumerical: the AST is not dimensionally valid — `
      + `${vr.violations.length} violation(s): `
      + vr.violations.map((v) => `[${v.location}] ${v.note}`).join('; '),
    );
  }
  const engine = options?.engine ?? getActiveEngine();
  const warnings = vr.violations.filter((v) => v.severity === 'warning');
  return { engine, dim: vr.inferredDimension as Dimension, freeIndices: vr.freeIndices, warnings };
}

/** Evaluate a validated AST to plain JS. */
export async function evaluateNumerical(
  node: ExprNode,
  inputs: NumericalInputs,
  options?: EvaluateOptions,
): Promise<NumericalResult> {
  const { engine, dim, freeIndices, warnings } = prepare(node, options);
  const tensor = lowerNode(node, inputs, engine);
  return { value: engine.toNested(tensor), dim, freeIndices, warnings };
}

/** Evaluate to a live EngineTensor for chaining workloads. */
export async function evaluateNumericalRaw(
  node: ExprNode,
  inputs: NumericalInputs,
  options?: EvaluateOptions,
): Promise<NumericalRawResult> {
  const { engine, dim, freeIndices, warnings } = prepare(node, options);
  const tensor = lowerNode(node, inputs, engine);
  return {
    value: tensor,
    dim,
    freeIndices,
    warnings,
    dispose: () => { engine.dispose?.(tensor); },
  };
}
