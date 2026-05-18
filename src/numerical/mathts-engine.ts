/**
 * MathTSEngine — a TensorEngine implementation backed by
 * @danielsimonjr/mathts-tensor's rank-N Tensor. Became UPT's default in
 * v0.4.0 when both optional peers (@danielsimonjr/mathts-tensor and
 * @danielsimonjr/mathts-autograd) are installed; see engine-registry.ts.
 *
 * Thin adapter: it translates the TensorEngine contract onto the MathTS
 * Tensor's methods. Both engines pass the identical engine-conformance
 * suite, which is what guarantees behavioural parity across the two repos.
 *
 * @module numerical/mathts-engine
 */
import { Tensor } from '@danielsimonjr/mathts-tensor';
import type { EngineTensor, TensorEngine, EinsumSpec, ForwardGradResult, ReverseGradResult } from './tensor-engine.js';
import type { NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';
import { EngineCapabilityError } from './tensor-engine.js';

/** EngineTensor handle wrapping a MathTS Tensor. */
class MathTSEngineTensor implements EngineTensor {
  constructor(readonly inner: Tensor) {}
  get shape(): ReadonlyArray<number> { return this.inner.shape; }
}

function unwrap(t: EngineTensor, op: string): Tensor {
  if (!(t instanceof MathTSEngineTensor)) {
    throw new NumericalBackendError(`MathTSEngine.${op}: operand is not a MathTSEngineTensor`);
  }
  return t.inner;
}

/**
 * `TensorEngine` backed by `@danielsimonjr/mathts-tensor`'s rank-N Tensor.
 * Became UPT's default in v0.4.0 when both optional peers are installed.
 *
 * @public — reachable only via the
 * `universal-physics-tensor/numerical/mathts-engine` exports subpath; requires
 * the `@danielsimonjr/mathts-tensor` optional dependency. Intentionally NOT
 * re-exported from the root barrel.
 */
export class MathTSEngine implements TensorEngine {
  readonly name = 'MathTSEngine';

  fromNested(data: NestedArray, shape: ReadonlyArray<number>): EngineTensor {
    return new MathTSEngineTensor(Tensor.fromNested(data, shape));
  }
  toNested(t: EngineTensor): NestedArray {
    return unwrap(t, 'toNested').toNested();
  }

  einsum(spec: EinsumSpec, ...operands: EngineTensor[]): EngineTensor {
    const inner = operands.map((o, i) => unwrap(o, `einsum (operand ${i})`));
    return new MathTSEngineTensor(Tensor.einsum(spec, ...inner));
  }
  matMul(a: EngineTensor, b: EngineTensor): EngineTensor {
    return new MathTSEngineTensor(unwrap(a, 'matMul').matMul(unwrap(b, 'matMul')));
  }
  transpose(t: EngineTensor, perm?: ReadonlyArray<number>): EngineTensor {
    return new MathTSEngineTensor(unwrap(t, 'transpose').transpose(perm));
  }
  reshape(t: EngineTensor, shape: ReadonlyArray<number>): EngineTensor {
    return new MathTSEngineTensor(unwrap(t, 'reshape').reshape(shape));
  }

  add(a: EngineTensor, b: EngineTensor): EngineTensor {
    return new MathTSEngineTensor(unwrap(a, 'add').add(unwrap(b, 'add')));
  }
  sub(a: EngineTensor, b: EngineTensor): EngineTensor {
    return new MathTSEngineTensor(unwrap(a, 'sub').sub(unwrap(b, 'sub')));
  }
  mul(a: EngineTensor, b: EngineTensor): EngineTensor {
    return new MathTSEngineTensor(unwrap(a, 'mul').mul(unwrap(b, 'mul')));
  }
  scale(t: EngineTensor, k: number): EngineTensor {
    return new MathTSEngineTensor(unwrap(t, 'scale').scale(k));
  }

  identity(n: number): EngineTensor {
    return new MathTSEngineTensor(Tensor.identity(n));
  }
  normInf(t: EngineTensor): number {
    return unwrap(t, 'normInf').normInf();
  }

  // ---------------------------------------------------------------------------
  // Internal helpers for AD boundary conversions
  // ---------------------------------------------------------------------------

  /** Unwrap an EngineTensor to its underlying MathTS Tensor (for the AD boundary). */
  private toMathTSTensor(t: EngineTensor): Tensor {
    return unwrap(t, 'toMathTSTensor');
  }

  /** Wrap a MathTS Tensor (returned by autograd) back as an EngineTensor. */
  private fromMathTSTensor(t: Tensor): EngineTensor {
    return new MathTSEngineTensor(t);
  }

  // ---------------------------------------------------------------------------
  // Forward-mode AD (Jacobian-vector product)
  // ---------------------------------------------------------------------------

  /**
   * Forward-mode automatic differentiation via a lazy-imported
   * `@danielsimonjr/mathts-autograd`. Throws `EngineCapabilityError` if the
   * optional dependency is absent.
   *
   * S1 fix: `fn` is passed UNCHANGED to `autograd.forwardGrad`. The autograd
   * package wraps `x` as a DualTensor internally; MathTSEngine's arithmetic
   * methods (mul/add/sub/scale) must dispatch DualTensor inputs through to
   * mathts-autograd's dual arithmetic — there must be no fn-wrapping at the
   * boundary, which would strip DualTensor instrumentation and silence the
   * AD trace.
   */
  async forwardGrad(
    fn: (x: EngineTensor) => EngineTensor,
    x: EngineTensor,
  ): Promise<ForwardGradResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let autograd: any;
    // @ts-ignore — @danielsimonjr/mathts-autograd is an optional dependency;
    // tsc cannot resolve it when not installed. The try/catch handles absence
    // at runtime; EngineCapabilityError is thrown when the package is absent.
    try { autograd = await import('@danielsimonjr/mathts-autograd'); }
    catch { throw new EngineCapabilityError('MathTSEngine', 'forwardGrad'); }

    // S1 fix: pass fn UNCHANGED. autograd.forwardGrad wraps x as a DualTensor;
    // MathTSEngine's arithmetic methods (mul/add/sub/scale) MUST dispatch
    // DualTensor inputs to mathts-autograd's dual arithmetic (same dispatch
    // story Float64ReferenceEngine has, via `'tangent' in arg`). Wrapping fn
    // at the boundary strips the instrumentation — the v0 sketch's bug.
    const xMathts = this.toMathTSTensor(x);
    const { value, jacobian } = await autograd.forwardGrad(fn as any, xMathts as any);
    return {
      value: this.fromMathTSTensor(value),
      jacobian: this.fromMathTSTensor(jacobian),
    };
  }

  // ---------------------------------------------------------------------------
  // Reverse-mode AD (vector-Jacobian product)
  // ---------------------------------------------------------------------------

  /**
   * Reverse-mode automatic differentiation via a lazy-imported
   * `@danielsimonjr/mathts-autograd`. Throws `EngineCapabilityError` if the
   * optional dependency is absent.
   *
   * S1 fix: `fn` is passed UNCHANGED (see forwardGrad note above). The
   * autograd package wraps `x` as a TapedTensor; MathTSEngine's op methods
   * must dispatch TapedTensor inputs to mathts-autograd's tape arithmetic via
   * `'tape' in arg` branching.
   */
  async reverseGrad(
    fn: (x: EngineTensor) => EngineTensor,
    x: EngineTensor,
    cotangent?: EngineTensor,
  ): Promise<ReverseGradResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let autograd: any;
    // @ts-ignore — @danielsimonjr/mathts-autograd is an optional dependency;
    // tsc cannot resolve it when not installed. The try/catch handles absence
    // at runtime; EngineCapabilityError is thrown when the package is absent.
    try { autograd = await import('@danielsimonjr/mathts-autograd'); }
    catch { throw new EngineCapabilityError('MathTSEngine', 'reverseGrad'); }

    // S1 fix: pass fn UNCHANGED (see forwardGrad note above). autograd.reverseGrad
    // wraps x as a TapedTensor; MathTSEngine's mul/add/sub/scale dispatch
    // TapedTensor inputs to mathts-autograd's tape arithmetic via `'tape' in arg`.
    const xMathts = this.toMathTSTensor(x);
    const ctMathts = cotangent ? this.toMathTSTensor(cotangent) : undefined;
    const { value, gradient } = await autograd.reverseGrad(fn as any, xMathts as any, ctMathts as any);
    return {
      value: this.fromMathTSTensor(value),
      gradient: this.fromMathTSTensor(gradient),
    };
  }
}
