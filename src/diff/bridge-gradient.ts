/**
 * Bridge-parameter differentiation — v0.9 Proposal 8 core layer.
 *
 * Wraps catalog bridge evaluators (typed scalar functions with
 * named-field struct inputs like `evaluateShapiroDelay(input:
 * ShapiroInputs): number`) into the shape expected by
 * `TensorEngine.reverseGrad`: `(paramTensor: EngineTensor) →
 * outputScalar`. Returns gradients with respect to a chosen subset
 * of the bridge's input parameters.
 *
 * Per P8 Decision #1, this lives in `src/diff/` (NOT in
 * `src/bridges/`), keeping bridge evaluators untouched. The AD
 * dependency `mathts-autograd` is in `optionalDependencies`; this
 * module throws `EngineCapabilityError` via the existing
 * `MathTSEngine.reverseGrad` call-site pattern (degrades gracefully
 * when the peer is absent).
 *
 * Per P8 Adam-H1 + Eve verification: the autograd peer may not be
 * installed in CI (npm install --include=optional required). Tests
 * use `hasAutogradSupport(engine)` to skip the real-AD assertions
 * when the peer isn't present.
 *
 * @module diff/bridge-gradient
 */

import type { EngineTensor, TensorEngine } from '../numerical/tensor-engine.js';
import { hasAutogradSupport } from '../numerical/tensor-engine.js';
import { EngineCapabilityError } from '../numerical/errors.js';

/**
 * Specification of a differentiable bridge: which parameters can
 * vary, in what order they get packed into a 1-D parameter
 * tensor, how to unpack the tensor back into the bridge's input
 * struct, and the bridge evaluator itself.
 *
 * `paramNames` is the canonical pack/unpack order. For
 * `evaluateShapiroDelay(input: { r: number; b: number; M: number })`
 * with `paramNames: ['r', 'b', 'M']`, the gradient returned by
 * `bridgeGradient` has shape `[3]` with entries
 * `[dS/dr, dS/db, dS/dM]` in that order.
 *
 * @public
 */
export interface BridgeDiffSpec<Input> {
  /** Bridge identifier (e.g., 'BE-37'). Used in error messages. */
  readonly bridgeId: string;
  /** Display name (e.g., 'Shapiro time delay'). */
  readonly name: string;
  /**
   * Pack/unpack order: which Input keys correspond to which axis
   * of the parameter tensor. All names must be present in the
   * frozen `Input` struct as `number`-valued keys.
   */
  readonly paramNames: ReadonlyArray<keyof Input & string>;
  /**
   * Fill in the non-differentiable input fields (those NOT in
   * `paramNames`). Returns the full struct merged from `defaults`
   * + the unpacked differentiable params. Typed as
   * `Partial<Input>` for ergonomics — runtime check in
   * `bridgeGradient` would catch missing required defaults if
   * the bridge evaluator needs them.
   */
  readonly defaults: Partial<Input>;
  /** The bridge's scalar evaluator. */
  readonly evaluate: (input: Input) => number;
}

/**
 * Result of `bridgeGradient`. `value` is the bridge's scalar
 * output at the supplied parameter point; `gradient` is the
 * 1-D `EngineTensor` of partial derivatives in `paramNames`
 * order.
 *
 * @public
 */
export interface BridgeGradientResult {
  readonly value: number;
  readonly gradient: EngineTensor;
}

/**
 * Compute the gradient of a bridge evaluator with respect to its
 * differentiable parameters via reverse-mode AD. The supplied
 * `params` map must contain every key in `spec.paramNames`.
 *
 * Throws `EngineCapabilityError` if the engine doesn't support
 * autograd (the standard graceful-degradation path from v0.4.0;
 * see `MathTSEngine.reverseGrad`).
 *
 * @public
 */
export async function bridgeGradient<Input>(
  spec: BridgeDiffSpec<Input>,
  engine: TensorEngine,
  params: Record<string, number>,
): Promise<BridgeGradientResult> {
  if (!hasAutogradSupport(engine)) {
    throw new EngineCapabilityError(engine.name, 'reverseGrad');
  }

  // Pack params into a 1-D tensor in spec.paramNames order.
  const packed: number[] = spec.paramNames.map((k) => {
    const v = params[k];
    if (typeof v !== 'number') {
      throw new TypeError(
        `bridgeGradient: ${spec.bridgeId}: missing or non-numeric param '${k}' ` +
        `(got ${typeof v}). All paramNames must be numbers in the params object.`,
      );
    }
    return v;
  });
  const paramTensor = engine.fromNested(packed, [packed.length]);

  // Build the (paramTensor) → scalar function the engine's
  // reverseGrad expects. The function unpacks the tensor back
  // into the bridge's Input struct, calls evaluate, and returns
  // a rank-0 tensor.
  const fn = (x: EngineTensor): EngineTensor => {
    const unpacked = engine.toNested(x) as number[];
    const input = { ...spec.defaults } as unknown as Input;
    spec.paramNames.forEach((k, i) => {
      (input as Record<string, unknown>)[k] = unpacked[i];
    });
    const scalar = spec.evaluate(input);
    return engine.fromNested(scalar, []);
  };

  const { value, gradient } = await engine.reverseGrad!(fn, paramTensor);
  const valueNumber = engine.toNested(value) as number;
  return { value: valueNumber, gradient };
}

/**
 * Convenience: unpack a 1-D gradient tensor into a named-field
 * record matching the spec's `paramNames` order.
 *
 * @public
 */
export function gradientToNamed<Input>(
  spec: BridgeDiffSpec<Input>,
  gradient: EngineTensor,
  engine: TensorEngine,
): Record<string, number> {
  const arr = engine.toNested(gradient) as number[];
  const out: Record<string, number> = {};
  spec.paramNames.forEach((k, i) => {
    out[k] = arr[i];
  });
  return out;
}
