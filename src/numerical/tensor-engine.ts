/**
 * The TensorEngine contract — the compute interface both v0.3.5 engines
 * (Float64ReferenceEngine, MathTSEngine) satisfy. See docs/planning/
 * v0.3.5-Design.md §3, §5.
 *
 * `EngineTensor` is an opaque handle; consumers operate on it only through
 * a TensorEngine. The lowering pass (lowering.ts) builds an `EinsumSpec`
 * from `computeContraction()`'s `contractionPairs` and hands it to
 * `engine.einsum()`.
 *
 * @module numerical/tensor-engine
 */

import type { NestedArray } from './types.js';

/** Opaque rank-N tensor handle. Each engine backs it with its own storage
 *  (Float64Array, a MathTS Tensor, a future WASM offset); consumers see
 *  only the shape.
 *  @public */
export interface EngineTensor {
  readonly shape: ReadonlyArray<number>;
}

/** One contracted index: the two (operand, axis) coordinates that the
 *  Einstein summation pairs and sums over.
 *  @internal */
export interface EinsumContraction {
  readonly pair: readonly [readonly [number, number], readonly [number, number]];
}

/** One surviving (free) index in the einsum output, in output-axis order.
 *  @internal */
export interface EinsumFreeAxis {
  readonly operand: number;
  readonly axis: number;
}

/** The engine-agnostic einsum plan produced by lowering.ts.
 *  @public */
export interface EinsumSpec {
  readonly contractions: ReadonlyArray<EinsumContraction>;
  readonly free: ReadonlyArray<EinsumFreeAxis>;
}

/** The compute contract. Float64ReferenceEngine and MathTSEngine implement it.
 *  @public */
export interface TensorEngine {
  readonly name: string;

  fromNested(data: NestedArray, shape: ReadonlyArray<number>): EngineTensor;
  toNested(t: EngineTensor): NestedArray;

  einsum(spec: EinsumSpec, ...operands: EngineTensor[]): EngineTensor;
  matMul(a: EngineTensor, b: EngineTensor): EngineTensor;
  transpose(t: EngineTensor, perm?: ReadonlyArray<number>): EngineTensor;
  reshape(t: EngineTensor, shape: ReadonlyArray<number>): EngineTensor;

  add(a: EngineTensor, b: EngineTensor): EngineTensor;
  sub(a: EngineTensor, b: EngineTensor): EngineTensor;
  mul(a: EngineTensor, b: EngineTensor): EngineTensor;
  scale(t: EngineTensor, k: number): EngineTensor;

  identity(n: number): EngineTensor;
  normInf(t: EngineTensor): number;

  /** Optional — no-op for pure-JS engines; a future native engine implements
   *  real disposal. evaluateNumerical() never relies on it. */
  dispose?(t: EngineTensor): void;
}

/** Runtime guard for EinsumSpec — used at the lowering→engine boundary so a
 *  malformed spec fails loudly rather than producing a wrong-shape tensor.
 *  @internal */
export function isEinsumSpec(x: unknown): x is EinsumSpec {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as { contractions?: unknown; free?: unknown };
  if (!Array.isArray(s.contractions) || !Array.isArray(s.free)) return false;
  for (const c of s.contractions) {
    if (typeof c !== 'object' || c === null) return false;
    const pair = (c as { pair?: unknown }).pair;
    if (!Array.isArray(pair) || pair.length !== 2) return false;
    for (const coord of pair) {
      if (!Array.isArray(coord) || coord.length !== 2) return false;
      if (typeof coord[0] !== 'number' || typeof coord[1] !== 'number') return false;
    }
  }
  for (const f of s.free) {
    if (typeof f !== 'object' || f === null) return false;
    const fa = f as { operand?: unknown; axis?: unknown };
    if (typeof fa.operand !== 'number' || typeof fa.axis !== 'number') return false;
  }
  return true;
}
