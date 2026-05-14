/**
 * Float64ReferenceEngine — the pure-TypeScript, Float64Array-backed
 * TensorEngine implementation. v0.3.5's default engine. Zero runtime
 * dependencies. Naive O(n) algorithms: a correctness baseline, not a
 * performance target (v0.3.5-Design.md §13). MathTSEngine (Task 11) is
 * the performance answer.
 *
 * @module numerical/float64-engine
 */

import type { EngineTensor, TensorEngine, EinsumSpec } from './tensor-engine.js';
import type { NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';

/** Row-major Float64Array-backed tensor. `strides[k]` is the flat-index
 *  step for axis k. Rank-0 has shape [] and a length-1 data array. */
export class Float64Tensor implements EngineTensor {
  constructor(
    readonly shape: ReadonlyArray<number>,
    readonly data: Float64Array,
  ) {}

  static rowMajorStrides(shape: ReadonlyArray<number>): number[] {
    const strides = new Array<number>(shape.length);
    let acc = 1;
    for (let k = shape.length - 1; k >= 0; k--) {
      strides[k] = acc;
      acc *= shape[k];
    }
    return strides;
  }

  static sizeOf(shape: ReadonlyArray<number>): number {
    return shape.reduce((a, b) => a * b, 1);
  }
}

function flatten(data: NestedArray, shape: ReadonlyArray<number>): Float64Array {
  const size = Float64Tensor.sizeOf(shape);
  const out = new Float64Array(size);
  let cursor = 0;
  const walk = (node: NestedArray, depth: number): void => {
    if (depth === shape.length) {
      if (typeof node !== 'number') {
        throw new NumericalBackendError(
          `fromNested: expected a number at depth ${depth}, got ${typeof node}`,
        );
      }
      out[cursor++] = node;
      return;
    }
    if (!Array.isArray(node) || node.length !== shape[depth]) {
      throw new NumericalBackendError(
        `fromNested: shape mismatch at depth ${depth} — expected length ${shape[depth]}`,
      );
    }
    for (const child of node) walk(child, depth + 1);
  };
  walk(data, 0);
  if (cursor !== size) {
    throw new NumericalBackendError(`fromNested: filled ${cursor} of ${size} elements`);
  }
  return out;
}

function rebuild(t: Float64Tensor): NestedArray {
  if (t.shape.length === 0) return t.data[0];
  const strides = Float64Tensor.rowMajorStrides(t.shape);
  const build = (depth: number, offset: number): NestedArray => {
    if (depth === t.shape.length - 1) {
      const row: number[] = [];
      for (let i = 0; i < t.shape[depth]; i++) row.push(t.data[offset + i]);
      return row;
    }
    const out: NestedArray[] = [];
    for (let i = 0; i < t.shape[depth]; i++) {
      out.push(build(depth + 1, offset + i * strides[depth]));
    }
    return out;
  };
  return build(0, 0);
}

function asF64(t: EngineTensor, op: string): Float64Tensor {
  if (!(t instanceof Float64Tensor)) {
    throw new NumericalBackendError(`Float64ReferenceEngine.${op}: operand is not a Float64Tensor`);
  }
  return t;
}

function sameShape(a: ReadonlyArray<number>, b: ReadonlyArray<number>): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function elementwise(
  a: Float64Tensor, b: Float64Tensor, op: string, f: (x: number, y: number) => number,
): Float64Tensor {
  if (!sameShape(a.shape, b.shape)) {
    throw new NumericalBackendError(
      `Float64ReferenceEngine.${op}: shape mismatch [${a.shape}] vs [${b.shape}]`,
    );
  }
  const out = new Float64Array(a.data.length);
  for (let i = 0; i < a.data.length; i++) out[i] = f(a.data[i], b.data[i]);
  return new Float64Tensor(a.shape, out);
}

export class Float64ReferenceEngine implements TensorEngine {
  readonly name = 'Float64ReferenceEngine';

  fromNested(data: NestedArray, shape: ReadonlyArray<number>): EngineTensor {
    return new Float64Tensor(shape, flatten(data, shape));
  }

  toNested(t: EngineTensor): NestedArray {
    return rebuild(asF64(t, 'toNested'));
  }

  add(a: EngineTensor, b: EngineTensor): EngineTensor {
    return elementwise(asF64(a, 'add'), asF64(b, 'add'), 'add', (x, y) => x + y);
  }
  sub(a: EngineTensor, b: EngineTensor): EngineTensor {
    return elementwise(asF64(a, 'sub'), asF64(b, 'sub'), 'sub', (x, y) => x - y);
  }
  mul(a: EngineTensor, b: EngineTensor): EngineTensor {
    return elementwise(asF64(a, 'mul'), asF64(b, 'mul'), 'mul', (x, y) => x * y);
  }
  scale(t: EngineTensor, k: number): EngineTensor {
    const f = asF64(t, 'scale');
    const out = new Float64Array(f.data.length);
    for (let i = 0; i < f.data.length; i++) out[i] = f.data[i] * k;
    return new Float64Tensor(f.shape, out);
  }

  identity(n: number): EngineTensor {
    const out = new Float64Array(n * n);
    for (let i = 0; i < n; i++) out[i * n + i] = 1;
    return new Float64Tensor([n, n], out);
  }

  normInf(t: EngineTensor): number {
    const f = asF64(t, 'normInf');
    let max = 0;
    for (let i = 0; i < f.data.length; i++) {
      const a = Math.abs(f.data[i]);
      if (a > max) max = a;
    }
    return max;
  }

  // --- tensor ops: filled in Task 5 ---
  einsum(_spec: EinsumSpec, ..._operands: EngineTensor[]): EngineTensor {
    throw new NumericalBackendError('Float64ReferenceEngine.einsum: not implemented until Task 5');
  }
  matMul(_a: EngineTensor, _b: EngineTensor): EngineTensor {
    throw new NumericalBackendError('Float64ReferenceEngine.matMul: not implemented until Task 5');
  }
  transpose(_t: EngineTensor, _perm?: ReadonlyArray<number>): EngineTensor {
    throw new NumericalBackendError('Float64ReferenceEngine.transpose: not implemented until Task 5');
  }
  reshape(_t: EngineTensor, _shape: ReadonlyArray<number>): EngineTensor {
    throw new NumericalBackendError('Float64ReferenceEngine.reshape: not implemented until Task 5');
  }
}
