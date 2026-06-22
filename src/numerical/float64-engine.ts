/**
 * Float64ReferenceEngine — the pure-TypeScript, Float64Array-backed
 * TensorEngine implementation. v0.3.5's default engine. Zero runtime
 * dependencies. Naive O(n) algorithms: a correctness baseline, not a
 * performance target (v0.3.5-Design.md §13). MathTSEngine (Task 11) is
 * the performance answer.
 *
 * @module numerical/float64-engine
 */

import type { EngineTensor, TensorEngine, EinsumSpec, ForwardGradResult, ReverseGradResult } from './tensor-engine.js';
import type { NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';
import { rowMajorStrides, flatIndex, sameShape } from './strides.js';

// ---------------------------------------------------------------------------
// Private: forward-mode AD via dual numbers
// ---------------------------------------------------------------------------

/**
 * EngineDualTensor — a primal Float64Array + per-element tangent, both of
 * the same length. Implements the dual-number rules:
 *   (a, a') + (b, b') = (a+b, a'+b')
 *   (a, a') - (b, b') = (a-b, a'-b')
 *   (a, a') * (b, b') = (a·b, a·b' + a'·b)   [alias case: 2a·a']
 *   scale((a, a'), k)  = (k·a, k·a')
 *
 * S5 fix: `.data` returns the primal so that engine ops that reach into
 * `EngineTensor.data` still work structurally (AD-aware branches detect
 * `'tangent' in arg` BEFORE falling through to primal paths).
 *
 * @internal
 */
class EngineDualTensor {
  constructor(
    readonly shape: ReadonlyArray<number>,
    readonly primal: Float64Array,
    readonly tangent: Float64Array,
  ) {}

  /** S5 fix: primal acts as `.data` for structurally-compatible dispatch. */
  get data(): Float64Array { return this.primal; }

  add(other: EngineDualTensor): EngineDualTensor {
    const p = new Float64Array(this.primal.length);
    const t = new Float64Array(this.tangent.length);
    for (let i = 0; i < p.length; i++) {
      p[i] = this.primal[i] + other.primal[i];
      t[i] = this.tangent[i] + other.tangent[i];
    }
    return new EngineDualTensor(this.shape, p, t);
  }

  sub(other: EngineDualTensor): EngineDualTensor {
    const p = new Float64Array(this.primal.length);
    const t = new Float64Array(this.tangent.length);
    for (let i = 0; i < p.length; i++) {
      p[i] = this.primal[i] - other.primal[i];
      t[i] = this.tangent[i] - other.tangent[i];
    }
    return new EngineDualTensor(this.shape, p, t);
  }

  /**
   * Elementwise mul with I3 alias check: `if (this === other)` applies
   * (a·a)' = 2·a·a' directly instead of the split path.
   */
  mul(other: EngineDualTensor): EngineDualTensor {
    const p = new Float64Array(this.primal.length);
    const t = new Float64Array(this.tangent.length);
    if (this === other) {
      for (let i = 0; i < p.length; i++) {
        p[i] = this.primal[i] * this.primal[i];
        t[i] = 2 * this.primal[i] * this.tangent[i];
      }
    } else {
      for (let i = 0; i < p.length; i++) {
        p[i] = this.primal[i] * other.primal[i];
        t[i] = this.tangent[i] * other.primal[i] + this.primal[i] * other.tangent[i];
      }
    }
    return new EngineDualTensor(this.shape, p, t);
  }

  scale(k: number): EngineDualTensor {
    const p = new Float64Array(this.primal.length);
    const t = new Float64Array(this.tangent.length);
    for (let i = 0; i < p.length; i++) {
      p[i] = this.primal[i] * k;
      t[i] = this.tangent[i] * k;
    }
    return new EngineDualTensor(this.shape, p, t);
  }
}

// ---------------------------------------------------------------------------
// Private: reverse-mode AD via tape
// ---------------------------------------------------------------------------

type BackwardFn = (outputGrad: Float64Array) => void;

interface TapeNode {
  readonly inputIds: ReadonlyArray<number>;
  readonly backward: BackwardFn;
  readonly outputGradSlot: Float64Array;
}

/**
 * EngineTape — records op backward closures during the forward pass.
 *
 * S3 fix: disjoint ID namespaces. `allocate()` returns `nextInputId--`
 * (negatives ← inputs); `record()` returns `nextOpId++` (non-negatives ← ops).
 * Eliminates the collision that arises when id = nodes.length + some constant
 * eventually wraps around with op ids.
 *
 * E19 fix: `backward()` uses `slot.set(outputGrad)` to overwrite the seed slot
 * (not +=), so re-invoking backward() is idempotent and avoids double-counting.
 *
 * @internal
 */
class EngineTape {
  private nodes: TapeNode[] = [];
  private inputGradSlots = new Map<number, Float64Array>();
  private nextOpId = 0;
  private nextInputId = -1; // negatives = inputs; non-negatives = ops

  allocate(size: number): { id: number; gradSlot: Float64Array } {
    const id = this.nextInputId--;
    const gradSlot = new Float64Array(size);
    this.inputGradSlots.set(id, gradSlot);
    return { id, gradSlot };
  }

  record(
    inputIds: ReadonlyArray<number>,
    outputSize: number,
    backward: BackwardFn,
  ): { id: number; gradSlot: Float64Array } {
    const outputGradSlot = new Float64Array(outputSize);
    const id = this.nextOpId++;
    this.nodes.push({ inputIds, backward, outputGradSlot });
    this.inputGradSlots.set(id, outputGradSlot);
    return { id, gradSlot: outputGradSlot };
  }

  /** E19 fix: overwrite (not +=) the seed slot, then walk tape in reverse. */
  backward(outputId: number, outputGrad: Float64Array): void {
    const slot = this.inputGradSlots.get(outputId);
    if (!slot) {
      throw new NumericalBackendError(`EngineTape.backward: unknown outputId ${outputId}`);
    }
    slot.set(outputGrad); // E19 fix: overwrite, not accumulate
    for (let n = this.nodes.length - 1; n >= 0; n--) {
      this.nodes[n].backward(this.nodes[n].outputGradSlot);
    }
  }

  getInputGrad(id: number): Float64Array | undefined {
    return this.inputGradSlots.get(id);
  }
}

/**
 * EngineTapedTensor — a primal Float64Array + tape reference + node id.
 * Arithmetic methods register backward closures on the shared tape.
 *
 * S5 fix: `.data` returns the primal for structural compatibility with ops
 * that reach into `EngineTensor.data`.
 *
 * I3 fix: `mul()` checks `if (this === other)` and accumulates
 * `2·outputGrad·primal` instead of the aliasing-accident path.
 *
 * @internal
 */
class EngineTapedTensor {
  constructor(
    readonly shape: ReadonlyArray<number>,
    readonly primal: Float64Array,
    readonly tape: EngineTape,
    readonly id: number,
  ) {}

  /** S5 fix: primal acts as `.data` for structurally-compatible dispatch. */
  get data(): Float64Array { return this.primal; }

  static fromInput(t: EngineTensor & { data: Float64Array }, tape: EngineTape): EngineTapedTensor {
    const { id } = tape.allocate(t.data.length);
    return new EngineTapedTensor(t.shape, new Float64Array(t.data), tape, id);
  }

  add(other: EngineTapedTensor): EngineTapedTensor {
    const out = new Float64Array(this.primal.length);
    for (let i = 0; i < out.length; i++) out[i] = this.primal[i] + other.primal[i];
    const thisGradSlot = this.tape.getInputGrad(this.id)!;
    const otherGradSlot = this.tape.getInputGrad(other.id)!;
    const { id } = this.tape.record([this.id, other.id], out.length, (outputGrad) => {
      for (let i = 0; i < outputGrad.length; i++) {
        thisGradSlot[i] += outputGrad[i];
        otherGradSlot[i] += outputGrad[i];
      }
    });
    return new EngineTapedTensor(this.shape, out, this.tape, id);
  }

  sub(other: EngineTapedTensor): EngineTapedTensor {
    const out = new Float64Array(this.primal.length);
    for (let i = 0; i < out.length; i++) out[i] = this.primal[i] - other.primal[i];
    const thisGradSlot = this.tape.getInputGrad(this.id)!;
    const otherGradSlot = this.tape.getInputGrad(other.id)!;
    const { id } = this.tape.record([this.id, other.id], out.length, (outputGrad) => {
      for (let i = 0; i < outputGrad.length; i++) {
        thisGradSlot[i] += outputGrad[i];
        otherGradSlot[i] -= outputGrad[i];
      }
    });
    return new EngineTapedTensor(this.shape, out, this.tape, id);
  }

  /**
   * I3 fix: explicit alias check. When `this === other`, accumulate
   * `2·outputGrad·primal` (d(a²)/da = 2a via VJP) instead of the
   * split-path that relies on aliasing accidents.
   */
  mul(other: EngineTapedTensor): EngineTapedTensor {
    const out = new Float64Array(this.primal.length);
    for (let i = 0; i < out.length; i++) out[i] = this.primal[i] * other.primal[i];
    const thisPrimal = this.primal;
    const otherPrimal = other.primal;
    const thisGradSlot = this.tape.getInputGrad(this.id)!;
    const otherGradSlot = this.tape.getInputGrad(other.id)!;
    const isAliased = this === other;
    const { id } = this.tape.record([this.id, other.id], out.length, (outputGrad) => {
      for (let i = 0; i < outputGrad.length; i++) {
        if (isAliased) {
          thisGradSlot[i] += 2 * outputGrad[i] * thisPrimal[i];
        } else {
          thisGradSlot[i] += outputGrad[i] * otherPrimal[i];
          otherGradSlot[i] += outputGrad[i] * thisPrimal[i];
        }
      }
    });
    return new EngineTapedTensor(this.shape, out, this.tape, id);
  }

  scale(k: number): EngineTapedTensor {
    const out = new Float64Array(this.primal.length);
    for (let i = 0; i < out.length; i++) out[i] = this.primal[i] * k;
    const thisGradSlot = this.tape.getInputGrad(this.id)!;
    const { id } = this.tape.record([this.id], out.length, (outputGrad) => {
      for (let i = 0; i < outputGrad.length; i++) {
        thisGradSlot[i] += outputGrad[i] * k;
      }
    });
    return new EngineTapedTensor(this.shape, out, this.tape, id);
  }
}

/** Row-major Float64Array-backed tensor. `strides[k]` is the flat-index
 *  step for axis k. Rank-0 has shape [] and a length-1 data array.
 *  @internal — concrete EngineTensor of Float64ReferenceEngine; consumers
 *  operate on the opaque `EngineTensor` handle, not this class. */
class Float64Tensor implements EngineTensor {
  constructor(
    readonly shape: ReadonlyArray<number>,
    readonly data: Float64Array,
  ) {}

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
  const strides = rowMajorStrides(t.shape);
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

/**
 * Shared AD dispatch for the elementwise binary ops (`add`/`sub`/`mul`):
 * forward-mode (dual) and reverse-mode (tape) operands route to the tracing
 * classes' own same-named method; everything else falls through to the primal
 * Float64 kernel. `instanceof` is safe — both AD classes are private to this
 * module and cannot be confused with unrelated types (TS-3). The dual/tape
 * `add`/`sub`/`mul` share one signature, so the `a[method](b)` call is type-safe.
 */
function adBinary(
  a: EngineTensor,
  b: EngineTensor,
  method: 'add' | 'sub' | 'mul',
  prim: (x: number, y: number) => number,
): EngineTensor {
  if (a instanceof EngineDualTensor && b instanceof EngineDualTensor) {
    return a[method](b) as unknown as EngineTensor;
  }
  if (a instanceof EngineTapedTensor && b instanceof EngineTapedTensor) {
    return a[method](b) as unknown as EngineTensor;
  }
  return elementwise(asF64(a, method), asF64(b, method), method, prim);
}

/**
 * The pure-TypeScript, zero-dependency `TensorEngine` — the correctness
 * baseline and conformance reference. Fallback engine in v0.4.0+: active
 * when @danielsimonjr/mathts-tensor is not installed (see engine-registry.ts).
 * Was the default in v0.3.5 before MathTSEngine was introduced.
 * @public
 */
export class Float64ReferenceEngine implements TensorEngine {
  readonly name = 'Float64ReferenceEngine';

  fromNested(data: NestedArray, shape: ReadonlyArray<number>): EngineTensor {
    return new Float64Tensor(shape, flatten(data, shape));
  }

  toNested(t: EngineTensor): NestedArray {
    return rebuild(asF64(t, 'toNested'));
  }

  add(a: EngineTensor, b: EngineTensor): EngineTensor {
    return adBinary(a, b, 'add', (x, y) => x + y);
  }
  sub(a: EngineTensor, b: EngineTensor): EngineTensor {
    return adBinary(a, b, 'sub', (x, y) => x - y);
  }
  mul(a: EngineTensor, b: EngineTensor): EngineTensor {
    return adBinary(a, b, 'mul', (x, y) => x * y);
  }
  scale(t: EngineTensor, k: number): EngineTensor {
    // AD dispatch: dual path (forward-mode)
    if (t instanceof EngineDualTensor) {
      return t.scale(k) as unknown as EngineTensor;
    }
    // AD dispatch: tape path (reverse-mode)
    if (t instanceof EngineTapedTensor) {
      return t.scale(k) as unknown as EngineTensor;
    }
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
    const inStrides = rowMajorStrides(f.shape);
    const out = new Float64Array(f.data.length);
    const outStrides = rowMajorStrides(outShape);
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
    const inStrides = ops.map((o) => rowMajorStrides(o.shape));

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
    const outStrides = rowMajorStrides(outShape);
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

    // Precompute per-operand axis → free/contract variable mappings.
    // operandFlatIndex iterates these small arrays rather than spec.free/contractions.
    type AxisMap = { varIdx: number; axis: number };
    const freeAxesByOp: AxisMap[][] = ops.map(() => []);
    const contractAxesByOp: AxisMap[][] = ops.map(() => []);

    spec.free.forEach((fa, v) => {
      freeAxesByOp[fa.operand].push({ varIdx: v, axis: fa.axis });
    });
    spec.contractions.forEach((c, v) => {
      const [[oa, axa], [ob, axb]] = c.pair;
      contractAxesByOp[oa].push({ varIdx: v, axis: axa });
      contractAxesByOp[ob].push({ varIdx: v, axis: axb });
    });

    // For a given assignment of (free vars, contract vars), compute the flat
    // index into each operand using the precomputed per-operand axis maps.
    const operandFlatIndex = (
      opIndex: number, freeVals: ReadonlyArray<number>, contractVals: ReadonlyArray<number>,
    ): number => {
      const idx = new Array<number>(ops[opIndex].shape.length).fill(0);
      for (const { varIdx, axis } of freeAxesByOp[opIndex]) idx[axis] = freeVals[varIdx];
      for (const { varIdx, axis } of contractAxesByOp[opIndex]) idx[axis] = contractVals[varIdx];
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

  // -------------------------------------------------------------------------
  // Forward-mode AD (Jacobian-vector product via dual numbers)
  // -------------------------------------------------------------------------

  /**
   * Compute the value and full Jacobian of `fn` at point `x` using
   * forward-mode automatic differentiation (dual numbers).
   *
   * Returns `{ value, jacobian }` where `jacobian.shape = [...value.shape, ...x.shape]`
   * (row-major). `jacobian.data[kY * xSize + kX] = ∂y[kY] / ∂x[kX]`.
   *
   * Guard: if `fn` returns a non-EngineDualTensor, throws a clear error
   * ("AD-traceable" guard, reconciliation fix S6/I2).
   */
  async forwardGrad(
    fn: (x: EngineTensor) => EngineTensor,
    x: EngineTensor,
  ): Promise<ForwardGradResult> {
    const xData = (x as Float64Tensor).data;
    const xSize = xData.length;

    // Probe with zero tangent to learn the output shape.
    const xDualZero = new EngineDualTensor(x.shape, new Float64Array(xData), new Float64Array(xSize));
    const yProbeRaw = fn(xDualZero as unknown as EngineTensor);
    if (!('tangent' in yProbeRaw)) {
      throw new NumericalBackendError(
        'Float64ReferenceEngine.forwardGrad: fn must be AD-traceable — its return must ' +
        'propagate through EngineDualTensor arithmetic (use engine.add/sub/mul/scale on ' +
        'the argument). A plain-tensor return loses the tangent and corrupts the Jacobian.',
      );
    }
    const yProbe = yProbeRaw as unknown as EngineDualTensor;
    const ySize = yProbe.primal.length;

    const jacobianShape = [...yProbe.shape, ...x.shape];
    const jacobianData = new Float64Array(jacobianShape.reduce((a, b) => a * b, 1));

    // Sweep each input flat-index kX. Build a unit-tangent dual, run fn,
    // scatter the tangent into the Jacobian column.
    for (let kX = 0; kX < xSize; kX++) {
      const tan = new Float64Array(xSize);
      tan[kX] = 1;
      const xDualUnit = new EngineDualTensor(x.shape, new Float64Array(xData), tan);
      const yDualRaw = fn(xDualUnit as unknown as EngineTensor);
      if (!('tangent' in yDualRaw)) {
        throw new NumericalBackendError(
          'Float64ReferenceEngine.forwardGrad: fn lost AD trace mid-sweep (returned non-dual tensor)',
        );
      }
      const yDual = yDualRaw as unknown as EngineDualTensor;
      for (let kY = 0; kY < ySize; kY++) {
        jacobianData[kY * xSize + kX] = yDual.tangent[kY];
      }
    }

    return {
      value: new Float64Tensor(yProbe.shape, new Float64Array(yProbe.primal)) as EngineTensor,
      jacobian: new Float64Tensor(jacobianShape, jacobianData) as EngineTensor,
    };
  }

  // -------------------------------------------------------------------------
  // Reverse-mode AD (vector-Jacobian product via tape)
  // -------------------------------------------------------------------------

  /**
   * Compute the value and gradient (VJP) of `fn` at point `x` using
   * reverse-mode automatic differentiation (tape).
   *
   * `cotangent` defaults to ones-like(value). For non-scalar outputs,
   * cotangent.shape must match value.shape.
   *
   * Guard: if `fn` returns a non-EngineTapedTensor, throws a clear error.
   */
  async reverseGrad(
    fn: (x: EngineTensor) => EngineTensor,
    x: EngineTensor,
    cotangent?: EngineTensor,
  ): Promise<ReverseGradResult> {
    const tape = new EngineTape();
    const xF64 = x as Float64Tensor;
    const xTaped = EngineTapedTensor.fromInput(xF64, tape);

    const yRaw = fn(xTaped as unknown as EngineTensor);
    if (!('tape' in yRaw)) {
      throw new NumericalBackendError(
        'Float64ReferenceEngine.reverseGrad: fn must be AD-traceable — its return must ' +
        'propagate through EngineTapedTensor arithmetic (use engine.add/sub/mul/scale on ' +
        'the argument). A plain-tensor return loses the tape and corrupts the gradient.',
      );
    }
    const yTaped = yRaw as unknown as EngineTapedTensor;

    const value = new Float64Tensor(yTaped.shape, new Float64Array(yTaped.primal)) as EngineTensor;

    // Resolve cotangent.
    let ctData: Float64Array;
    if (cotangent === undefined) {
      ctData = new Float64Array(yTaped.primal.length).fill(1);
    } else {
      if (
        cotangent.shape.length !== value.shape.length ||
        !cotangent.shape.every((v, i) => v === value.shape[i])
      ) {
        throw new NumericalBackendError(
          `Float64ReferenceEngine.reverseGrad: cotangent shape [${cotangent.shape}] ` +
          `!= value shape [${value.shape}]`,
        );
      }
      ctData = new Float64Array((cotangent as Float64Tensor).data);
    }

    // E19 fix: backward() uses slot.set(outputGrad) — see EngineTape.backward.
    tape.backward(yTaped.id, ctData);

    const xGrad = tape.getInputGrad(xTaped.id)!;
    return {
      value,
      gradient: new Float64Tensor(x.shape, new Float64Array(xGrad)) as EngineTensor,
    };
  }
}
