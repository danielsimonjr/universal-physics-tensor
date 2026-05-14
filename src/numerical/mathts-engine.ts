/**
 * MathTSEngine — a TensorEngine implementation backed by
 * @danielsimonjr/mathts-tensor's rank-N Tensor. The second v0.3.5 engine;
 * becomes UPT's default in v0.4.0 (v0.3.5-Design.md §12).
 *
 * Thin adapter: it translates the TensorEngine contract onto the MathTS
 * Tensor's methods. Both engines pass the identical engine-conformance
 * suite, which is what guarantees behavioural parity across the two repos.
 *
 * @module numerical/mathts-engine
 */
import { Tensor } from '@danielsimonjr/mathts-tensor';
import type { EngineTensor, TensorEngine, EinsumSpec } from './tensor-engine.js';
import type { NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';

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
 * `TensorEngine` backed by `@danielsimonjr/mathts-tensor`'s rank-N Tensor —
 * the second v0.3.5 engine; becomes UPT's default in v0.4.0.
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
}
