/**
 * Numerical helpers for covariant-derivative lowering (Task 12 [U]).
 *
 * These functions compute Christoffel symbols and tensor corrections from raw
 * metric data WITHOUT going through the christoffel() composite AST. The
 * composite AST is designed for symbolic/dimensional use; numerical lowering
 * builds Γ directly from metric components and metric-derivative arrays.
 *
 * All helpers are engine-agnostic: they operate on flat number[] arrays and
 * produce EngineTensor results via the engine.fromNested() interface.
 *
 * @module numerical/connection-lowering-helpers
 */

import type { EngineTensor, TensorEngine } from './tensor-engine.js';
import type { NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';

// ---------------------------------------------------------------------------
// Flat-array utilities
// ---------------------------------------------------------------------------

/**
 * Flatten a NestedArray to a plain number[] in row-major order.
 * Canonical implementation. `flattenNestedArray` in lowering.ts is NOT a
 * duplicate — it delegates here and adds an expectedSize invariant check
 * (throws NumericalBackendError if the flattened count mismatches). This
 * function deliberately omits that check for callers that do not know the
 * expected count ahead of time.
 */
export function flattenNA(data: NestedArray): number[] {
  if (typeof data === 'number') return [data];
  const out: number[] = [];
  const walk = (n: NestedArray): void => {
    if (typeof n === 'number') out.push(n);
    else for (const c of n) walk(c);
  };
  walk(data);
  return out;
}

// ---------------------------------------------------------------------------
// S2(c) helpers — specified by the Task 12 plan
// ---------------------------------------------------------------------------

/**
 * Build a properly-nested zero array matching the given shape.
 * engine.fromNested() expects nested arrays, not flat arrays, for rank > 1.
 */
function buildNestedZeros(shape: ReadonlyArray<number>): NestedArray {
  if (shape.length === 0) return 0;
  if (shape.length === 1) return new Array<number>(shape[0]).fill(0);
  const inner = buildNestedZeros(shape.slice(1));
  // Deep-clone each inner node so they are independent arrays.
  const cloneNested = (n: NestedArray): NestedArray => {
    if (typeof n === 'number') return n;
    return (n as NestedArray[]).map(cloneNested);
  };
  return Array.from({ length: shape[0] }, () => cloneNested(inner));
}

/**
 * Return a same-shape EngineTensor whose data is all zeros.
 * S2(c) helper spec: returns a fresh zero tensor of the same shape as t.
 */
export function zeroTensorLike(t: EngineTensor, engine: TensorEngine): EngineTensor {
  const shape = [...t.shape];
  return engine.fromNested(buildNestedZeros(shape), shape);
}

/**
 * Return an all-zero EngineTensor of the given shape.
 */
export function zeroTensor(shape: ReadonlyArray<number>, engine: TensorEngine): EngineTensor {
  return engine.fromNested(buildNestedZeros([...shape]), [...shape]);
}

/**
 * Convert a flat number[] to a properly-nested NestedArray matching `shape`.
 * Exported for use in lowering.ts where the engine requires nested structure.
 */
export function flatToNested(flat: number[], shape: ReadonlyArray<number>): NestedArray {
  return flatToNestedImpl(flat, shape);
}

function flatToNestedImpl(flat: number[], shape: ReadonlyArray<number>): NestedArray {
  if (shape.length === 0) return flat[0] ?? 0;
  if (shape.length === 1) return flat.slice();
  const stride = flat.length / shape[0];
  const result: NestedArray[] = [];
  for (let i = 0; i < shape[0]; i++) {
    result.push(flatToNestedImpl(flat.slice(i * stride, (i + 1) * stride), shape.slice(1)));
  }
  return result;
}

/**
 * Elementwise a + b; throws on shape mismatch.
 * S2(c) helper spec.
 */
export function tensorAdd(a: EngineTensor, b: EngineTensor, engine: TensorEngine): EngineTensor {
  if (!sameShape(a.shape, b.shape)) {
    throw new NumericalBackendError(
      `tensorAdd: shape mismatch [${a.shape}] vs [${b.shape}]`,
    );
  }
  return engine.add(a, b);
}

/**
 * Elementwise a[i] + sign * b[i]; throws on shape mismatch.
 * S2(c) helper spec.
 */
export function tensorAddScaled(
  a: EngineTensor,
  b: EngineTensor,
  sign: 1 | -1,
  engine: TensorEngine,
): EngineTensor {
  if (!sameShape(a.shape, b.shape)) {
    throw new NumericalBackendError(
      `tensorAddScaled: shape mismatch [${a.shape}] vs [${b.shape}]`,
    );
  }
  if (sign === 1) return engine.add(a, b);
  return engine.sub(a, b);
}

function sameShape(
  a: ReadonlyArray<number>,
  b: ReadonlyArray<number>,
): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

// ---------------------------------------------------------------------------
// Christoffel numerical computation
// ---------------------------------------------------------------------------

/**
 * Compute the full Christoffel symbol Γ^α_{μν} from raw metric arrays.
 *
 *   Γ^α_{μν} = (1/2) g^{αρ} (∂_μ g_{ρν} + ∂_ν g_{ρμ} − ∂_ρ g_{μν})
 *
 * Returns an EngineTensor of shape [N, N, N] indexed [α][μ][ν] (row-major).
 *
 * @param gInverseFlat  Flat [N*N] array for g^{αρ} (row-major, α outer)
 * @param getMetricDeriv  Function (mu: number) => flat [N*N] ∂_{mu} g (row-major)
 * @param N  Dimension
 * @param engine  Active TensorEngine
 */
export function computeChristoffelTensor(
  gInverseFlat: number[],
  getMetricDeriv: (mu: number) => number[],
  N: number,
  engine: TensorEngine,
): EngineTensor {
  // Output: Gamma[alpha][mu][nu] stored in row-major order
  const size = N * N * N;
  const Gamma = new Array<number>(size).fill(0);

  for (let alpha = 0; alpha < N; alpha++) {
    for (let mu = 0; mu < N; mu++) {
      for (let nu = 0; nu < N; nu++) {
        let sum = 0;
        const dmu = getMetricDeriv(mu);  // ∂_μ g_{ρν} — shape [N,N], ρ outer
        const dnu = getMetricDeriv(nu);  // ∂_ν g_{ρμ}
        for (let rho = 0; rho < N; rho++) {
          const gInvAlphaRho = gInverseFlat[alpha * N + rho]; // g^{α ρ}
          const drho = getMetricDeriv(rho);                   // ∂_ρ g_{μν}
          // ∂_μ g_{ρν} → index [ρ,ν] in flat ∂_μ g
          const term1 = dmu[rho * N + nu];
          // ∂_ν g_{ρμ} → index [ρ,μ] in flat ∂_ν g
          const term2 = dnu[rho * N + mu];
          // ∂_ρ g_{μν} → index [μ,ν] in flat ∂_ρ g
          const term3 = drho[mu * N + nu];
          sum += gInvAlphaRho * (term1 + term2 - term3);
        }
        Gamma[alpha * N * N + mu * N + nu] = 0.5 * sum;
      }
    }
  }

  return engine.fromNested(flatToNestedImpl(Gamma, [N, N, N]), [N, N, N]);
}

// ---------------------------------------------------------------------------
// Contraction of Γ with the operand tensor
// ---------------------------------------------------------------------------

/**
 * Contract Γ^α_{μλ} or Γ^λ_{μα} with the operand tensor along the axis
 * corresponding to `freeIdxPos` (the position of the contracted free index
 * in the operand's flat axis list).
 *
 * S2(c) spec — explicit loop body:
 *
 * Upper case (∇_μ T^α_β):
 *   out[α, μ, β, ...] += Γ[α, μ, λ] * T[λ_at_pos, β, ...]
 *   i.e., contract over λ (axis `freeIdxPos` of T, axis 2 of Γ)
 *
 * Lower case (∇_μ T_α_β):
 *   out[α, μ, β, ...] += Γ[λ, μ, α] * T[λ_at_pos, β, ...]
 *   i.e., contract over λ (axis `freeIdxPos` of T, axis 0 of Γ)
 *   and α indexes the fixed axis of Γ at position 2.
 *
 * Shape conventions (all row-major):
 *   Gamma: shape [N, N, N] — [α or λ, μ, ν or α]
 *   ofFlat: flat [totalSize] with strides computed from `ofShape`
 *   outputShape: same as the partial-derivative output: [N, ...ofShape]
 *     (wrt axis prepended, the freeIdxPos axis contracted out,
 *      all other axes kept — but since ∇_μ output equals ∂_μ output shape,
 *      we match that shape exactly)
 *
 * @param GammaFlat  Flat [N^3] Γ^α_{μν} — [α][μ][ν] row-major
 * @param ofFlat     Flat operand data, shape `ofShape`
 * @param ofShape    Shape of the operand tensor
 * @param freeIdxPos Position (0-based) of the free index being contracted in `ofShape`
 * @param variance   'upper' → Γ^α_{μλ} contracts λ; 'lower' → Γ^λ_{μα} contracts λ
 * @param N          Dimension
 * @param engine     Active TensorEngine
 *
 * Returns an EngineTensor of shape [N, ...ofShape_without_freeIdxPos]
 * i.e., the same shape as the partial-derivative output (wrt axis first, others follow).
 */
export function contractChristoffelWithOperand(
  GammaFlat: number[],
  ofFlat: number[],
  ofShape: ReadonlyArray<number>,
  freeIdxPos: number,
  variance: 'upper' | 'lower',
  N: number,
  engine: TensorEngine,
): EngineTensor {
  // Output shape: [N (wrt/mu axis), ...ofShape with freeIdxPos axis removed and
  //               replaced by the alpha axis of the Christoffel]
  // Concretely: output has the same shape as ∂_μ T which is [...ofShape, N]
  // with wrtIndex appended. But freeIdx is now contracted (replaced by α):
  // upper: T had axis freeIdxPos as α (upper) → output keeps α at same position, prepends μ
  // lower: T had axis freeIdxPos as α (lower) → output keeps α at same position, prepends μ
  //
  // The output axis order matches ∂_μ T: [...ofShape, N] (wrt axis last? or first?)
  // Actually ∂_μ appends wrt as the LAST axis per v0.3.5 design.
  // So output shape of ∇_μ T = [...ofShape, N] where N is the wrt axis.
  // But the correction term must have the same shape.
  //
  // For the correction: we keep all of T's axes, with freeIdxPos contracting,
  // and add a new μ axis (last, like ∂_μ). The α index replaces the contracted
  // position (same position in the output as freeIdxPos was in T).
  //
  // Output shape = [...ofShape, N] where ofShape[freeIdxPos] stays (α replaces λ)
  // and the last axis N is the μ axis.

  const rank = ofShape.length;
  const outShape = [...ofShape, N]; // [...T_shape, mu]
  const outSize = outShape.reduce((a, b) => a * b, 1);
  const out = new Array<number>(outSize).fill(0);

  // Build strides for ofFlat and out
  const ofStrides = buildStrides(ofShape);
  const outStrides = buildStrides(outShape);

  // Iterate over all output indices
  forEachMultiIndex(outShape, (outIdx) => {
    const mu = outIdx[rank]; // last axis of output is μ
    // The other axes map to T's indices, with freeIdxPos being the α/result axis
    const alpha = outIdx[freeIdxPos]; // the "free" index value (α for upper, α for lower)

    let sum = 0;
    for (let lam = 0; lam < N; lam++) {
      // Build T's index: same as outIdx[0..rank-1] but with freeIdxPos = lam
      const tIdx = outIdx.slice(0, rank);
      tIdx[freeIdxPos] = lam;
      const tFlat = flatIndex(tIdx, ofStrides);

      let gammaFlat: number;
      if (variance === 'upper') {
        // Γ^α_{μλ} — shape [α][μ][λ]
        gammaFlat = alpha * N * N + mu * N + lam;
      } else {
        // Γ^λ_{μα} — shape [λ][μ][α]
        gammaFlat = lam * N * N + mu * N + alpha;
      }

      sum += GammaFlat[gammaFlat] * ofFlat[tFlat];
    }

    out[flatIndex(outIdx, outStrides)] = sum;
  });

  return engine.fromNested(flatToNestedImpl(out, outShape), outShape);
}

// ---------------------------------------------------------------------------
// Internal utilities
// ---------------------------------------------------------------------------

function buildStrides(shape: ReadonlyArray<number>): number[] {
  const strides = new Array<number>(shape.length);
  let s = 1;
  for (let k = shape.length - 1; k >= 0; k--) {
    strides[k] = s;
    s *= shape[k];
  }
  return strides;
}

function flatIndex(idx: ReadonlyArray<number>, strides: ReadonlyArray<number>): number {
  let f = 0;
  for (let k = 0; k < idx.length; k++) f += idx[k] * strides[k];
  return f;
}

function forEachMultiIndex(
  shape: ReadonlyArray<number>,
  visit: (idx: number[]) => void,
): void {
  if (shape.length === 0) { visit([]); return; }
  const idx = new Array<number>(shape.length).fill(0);
  const total = shape.reduce((a, b) => a * b, 1);
  for (let n = 0; n < total; n++) {
    visit([...idx]);
    for (let k = shape.length - 1; k >= 0; k--) {
      if (++idx[k] < shape[k]) break;
      idx[k] = 0;
    }
  }
}

// ---------------------------------------------------------------------------
// Metric-partial-derivative lookup (for 'supplied' strategy)
// ---------------------------------------------------------------------------

/**
 * Look up ∂_{mu} g from inputs.metricDerivatives.
 * Key format: `${metricName}/μ_${mu}` (e.g. 'g/μ_0' for ∂_0 g).
 * Returns a flat [N*N] array.
 *
 * Strategy 'zero': returns [N*N] zeros.
 * Strategy 'supplied': looks up the key; throws if absent.
 */
export function getMetricDerivFlat(
  metricName: string,
  coordLabel: string,
  mu: number,
  strategy: 'zero' | 'supplied',
  N: number,
  metricDerivatives: ReadonlyMap<string, NestedArray> | undefined,
): number[] {
  if (strategy === 'zero') {
    return new Array<number>(N * N).fill(0);
  }
  // strategy === 'supplied'
  const key = `${metricName}/${coordLabel}_${mu}`;
  const d = metricDerivatives?.get(key);
  if (d === undefined) {
    throw new NumericalBackendError(
      `connection-lowering: no metric derivative supplied for "${key}" — ` +
      `a covariant-derivative with derivativeStrategy='supplied' requires ` +
      `inputs.metricDerivatives to contain "${key}" (flat [N×N] of ∂_{${mu}} g)`,
    );
  }
  const flat = flattenNA(d);
  if (flat.length !== N * N) {
    throw new NumericalBackendError(
      `connection-lowering: metricDerivatives["${key}"] has ${flat.length} elements, ` +
      `expected ${N * N} (N=${N})`,
    );
  }
  return flat;
}
