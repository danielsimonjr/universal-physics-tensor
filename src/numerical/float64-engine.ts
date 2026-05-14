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

/** Iterate every multi-index of `shape` in row-major order, calling `visit`
 *  with a fresh index array each step. */
function forEachIndex(shape: ReadonlyArray<number>, visit: (idx: number[]) => void): void {
  if (shape.length === 0) { visit([]); return; }
  const idx = new Array<number>(shape.length).fill(0);
  const total = Float64Tensor.sizeOf(shape);
  for (let n = 0; n < total; n++) {
    visit(idx);
    for (let k = shape.length - 1; k >= 0; k--) {
      if (++idx[k] < shape[k]) break;
      idx[k] = 0;
    }
  }
}

function flatIndex(idx: ReadonlyArray<number>, strides: ReadonlyArray<number>): number {
  let f = 0;
  for (let k = 0; k < idx.length; k++) f += idx[k] * strides[k];
  return f;
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

  reshape(t: EngineTensor, shape: ReadonlyArray<number>): EngineTensor {
    const f = asF64(t, 'reshape');
    if (Float64Tensor.sizeOf(shape) !== f.data.length) {
      throw new NumericalBackendError(
        `reshape: size mismatch — [${f.shape}] (${f.data.length}) -> [${shape}]`,
      );
    }
    // Row-major storage is order-preserving: same data buffer, new shape.
    return new Float64Tensor([...shape], f.data.slice());
  }

  transpose(t: EngineTensor, perm?: ReadonlyArray<number>): EngineTensor {
    const f = asF64(t, 'transpose');
    const rank = f.shape.length;
    const p = perm ?? Array.from({ length: rank }, (_, i) => rank - 1 - i);
    if (p.length !== rank) {
      throw new NumericalBackendError(`transpose: perm length ${p.length} != rank ${rank}`);
    }
    const outShape = p.map((axis) => f.shape[axis]);
    const inStrides = Float64Tensor.rowMajorStrides(f.shape);
    const out = new Float64Array(f.data.length);
    const outStrides = Float64Tensor.rowMajorStrides(outShape);
    forEachIndex(outShape, (outIdx) => {
      // outIdx[k] is the value of original axis p[k]; map back to input index.
      const inIdx = new Array<number>(rank);
      for (let k = 0; k < rank; k++) inIdx[p[k]] = outIdx[k];
      out[flatIndex(outIdx, outStrides)] = f.data[flatIndex(inIdx, inStrides)];
    });
    return new Float64Tensor(outShape, out);
  }

  matMul(a: EngineTensor, b: EngineTensor): EngineTensor {
    const fa = asF64(a, 'matMul');
    const fb = asF64(b, 'matMul');
    if (fa.shape.length !== 2 || fb.shape.length !== 2) {
      throw new NumericalBackendError(
        `matMul: both operands must be rank-2 — got [${fa.shape}], [${fb.shape}]`,
      );
    }
    const [m, k] = fa.shape;
    const [k2, n] = fb.shape;
    if (k !== k2) {
      throw new NumericalBackendError(`matMul: inner dimension mismatch ${k} != ${k2}`);
    }
    const out = new Float64Array(m * n);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let p = 0; p < k; p++) sum += fa.data[i * k + p] * fb.data[p * n + j];
        out[i * n + j] = sum;
      }
    }
    return new Float64Tensor([m, n], out);
  }

  einsum(spec: EinsumSpec, ...operands: EngineTensor[]): EngineTensor {
    const ops = operands.map((o, i) => asF64(o, `einsum (operand ${i})`));
    const inStrides = ops.map((o) => Float64Tensor.rowMajorStrides(o.shape));

    // Each free axis -> one output index variable; each contraction -> one
    // summed index variable. Determine the size of every variable and the
    // (operand, axis) sites that read it.
    const freeSizes = spec.free.map((fa) => {
      const op = ops[fa.operand];
      if (!op) throw new NumericalBackendError(`einsum: free axis references missing operand ${fa.operand}`);
      return op.shape[fa.axis];
    });
    const contractSizes = spec.contractions.map((c) => {
      const [[oa, axa], [ob, axb]] = c.pair;
      const sa = ops[oa]?.shape[axa];
      const sb = ops[ob]?.shape[axb];
      if (sa === undefined || sb === undefined || sa !== sb) {
        throw new NumericalBackendError(
          `einsum: contraction pair size mismatch — (${oa},${axa})=${sa} vs (${ob},${axb})=${sb}`,
        );
      }
      return sa;
    });

    const outShape = freeSizes;
    const outStrides = Float64Tensor.rowMajorStrides(outShape);
    const out = new Float64Array(Float64Tensor.sizeOf(outShape));

    // Guard (finding #2): every axis of a rank-≥1 operand MUST appear in the
    // spec as either a free axis or a contracted axis. An unreferenced axis
    // would silently read index 0 on every iteration — a wrong result. A
    // rank-0 operand legitimately participates in nothing: it contributes its
    // scalar value data[0] as a factor to every output element. That is the
    // documented, intended behaviour — only rank-≥1 operands are guarded.
    for (let o = 0; o < ops.length; o++) {
      if (ops[o].shape.length === 0) continue; // rank-0 scalar factor — allowed
      const covered = new Set<number>();
      spec.free.forEach((fa) => { if (fa.operand === o) covered.add(fa.axis); });
      spec.contractions.forEach((c) => {
        const [[oa, axa], [ob, axb]] = c.pair;
        if (oa === o) covered.add(axa);
        if (ob === o) covered.add(axb);
      });
      if (covered.size !== ops[o].shape.length) {
        throw new NumericalBackendError(
          `einsum: operand ${o} (rank ${ops[o].shape.length}) has axes not referenced `
          + `by the spec — every rank-≥1 operand axis must be a free or contracted axis`,
        );
      }
    }

    // For a given assignment of (free vars, contract vars), compute the flat
    // index into each operand by summing the contributions of every axis that
    // reads a variable.
    const operandFlatIndex = (
      opIndex: number, freeVals: ReadonlyArray<number>, contractVals: ReadonlyArray<number>,
    ): number => {
      const idx = new Array<number>(ops[opIndex].shape.length).fill(0);
      spec.free.forEach((fa, v) => { if (fa.operand === opIndex) idx[fa.axis] = freeVals[v]; });
      spec.contractions.forEach((c, v) => {
        const [[oa, axa], [ob, axb]] = c.pair;
        if (oa === opIndex) idx[axa] = contractVals[v];
        if (ob === opIndex) idx[axb] = contractVals[v];
      });
      return flatIndex(idx, inStrides[opIndex]);
    };

    forEachIndex(outShape, (freeVals) => {
      let acc = 0;
      forEachIndex(contractSizes, (contractVals) => {
        let product = 1;
        for (let o = 0; o < ops.length; o++) {
          product *= ops[o].data[operandFlatIndex(o, freeVals, contractVals)];
        }
        acc += product;
      });
      out[flatIndex(freeVals, outStrides)] = acc;
    });

    return new Float64Tensor(outShape, out);
  }
}
