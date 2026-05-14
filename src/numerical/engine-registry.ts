/**
 * Engine registry — selects the active TensorEngine. Defaults to
 * Float64ReferenceEngine (v0.3.5). MathTSEngine (Task 11) can be set as
 * the active engine, or passed per-call via EvaluateOptions.engine.
 *
 * @module numerical/engine-registry
 */
import type { TensorEngine } from './tensor-engine.js';
import { Float64ReferenceEngine } from './float64-engine.js';

let active: TensorEngine = new Float64ReferenceEngine();

export function getActiveEngine(): TensorEngine {
  return active;
}

export function setActiveEngine(engine: TensorEngine): void {
  active = engine;
}
