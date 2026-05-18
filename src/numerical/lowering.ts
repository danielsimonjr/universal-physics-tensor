/**
 * AST → EngineTensor lowering. Walks a validated ExprNode tree and emits
 * TensorEngine calls. The tensor-product case turns computeContraction()'s
 * contractionPairs into an EinsumSpec (v0.3.5-Design.md §5).
 *
 * v0.3.5 scope: flat tensor-products of contractable operands (the three
 * index-carrying nodes + tensor-partial-derivative) + scalar operands.
 * Nested products, integral/derivative numerical eval are out of scope and
 * throw clearly.
 *
 * @module numerical/lowering
 */

import type { ExprNode } from '../dimensional/validator.js';
import { validate } from '../dimensional/validator.js';
import type { TensorIndex, TensorSymbolNode } from '../dimensional/tensor.js';
import type { Dimension } from '../dimensional/types.js';
import { computeContraction, validateTensorSymbol } from '../dimensional/tensor.js';
import { pderivGrid, pderivNumericalFn, pderivSymbolic } from './pderiv.js';
import {
  validateMetricTensor,
  validateKroneckerDelta,
  validatePartialDerivative,
} from '../dimensional/metric-validators.js';
import type { MetricTensorNode } from '../dimensional/metric-validators.js';
import type { CovariantDerivativeNode } from '../dimensional/connection-validators.js';
import type {
  EngineTensor, TensorEngine, EinsumSpec, EinsumContraction,
} from './tensor-engine.js';
import type { NumericalInputs, NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';
import {
  zeroTensor,
  zeroTensorLike,
  flatToNested,
  flattenNA,
  tensorAdd,
  tensorAddScaled,
  computeChristoffelTensor,
  contractChristoffelWithOperand,
  getMetricDerivFlat,
} from './connection-lowering-helpers.js';

/** Operand kinds a flat tensor-product can lower in v0.3.5: the three
 *  index-carrying nodes plus tensor-partial-derivative (whose effective
 *  indices are `of`'s indices followed by its wrtIndex). */
type ContractableNode =
  | Extract<ExprNode, { indices: ReadonlyArray<TensorIndex> }>
  | Extract<ExprNode, { kind: 'tensor-partial-derivative' }>;

function isContractable(node: ExprNode): node is ContractableNode {
  return node.kind === 'tensor-symbol'
    || node.kind === 'metric-tensor'
    || node.kind === 'kronecker-delta'
    || node.kind === 'tensor-partial-derivative';
}

/** The effective index list of a contractable operand, in the SAME axis
 *  order as its lowered EngineTensor. For the three index-carrying nodes
 *  that is `node.indices`. For ∂_μ(of) the lowered tensor has shape
 *  [...ofShape, N] (Task 10), so the effective indices are `of`'s indices
 *  (v0.3.5: `of` is a tensor-symbol or metric-tensor) followed by the wrtIndex. */
function operandIndices(node: ContractableNode): ReadonlyArray<TensorIndex> {
  if (node.kind === 'tensor-partial-derivative') {
    const of = node.of as ExprNode;
    if (of.kind !== 'tensor-symbol' && of.kind !== 'metric-tensor') {
      throw new NumericalBackendError(
        `lowering: a tensor-partial-derivative operand requires a tensor-symbol or `
        + `metric-tensor 'of' in v0.3.5/v0.4.0 — got '${of.kind}'`,
      );
    }
    return [...of.indices, node.wrtIndex];
  }
  return node.indices;
}

function dimensionOf(inputs: NumericalInputs): number {
  return inputs.dimension ?? 4;
}

/** Look up a named tensor's concrete value, or throw. */
function requireValue(name: string, inputs: NumericalInputs): NestedArray {
  const v = inputs.tensors.get(name);
  if (v === undefined) {
    throw new NumericalBackendError(`lowering: no value supplied for "${name}" in inputs.tensors`);
  }
  return v;
}

/** Flatten a NestedArray to a plain number[] and check expected size.
 *  Delegates to the canonical flattenNA() from connection-lowering-helpers. */
function flattenNestedArray(data: NestedArray, expectedSize: number): number[] {
  const out = flattenNA(data);
  if (out.length !== expectedSize) {
    throw new NumericalBackendError(
      `lowering: flattenNestedArray: got ${out.length} elements, expected ${expectedSize}`,
    );
  }
  return out;
}

/**
 * Build the EinsumSpec for a flat tensor-product.
 *
 * NOTE: this function does NOT decide which indices contract. That authority
 * belongs to `computeContraction()` (v0.2.0 symbolic-layer) — variance-aware,
 * implicit-identity-metric rule — which already classified every label as
 * contracted or free. buildEinsumSpec only maps those already-classified
 * labels to their (operand, axis) sites. There is exactly one
 * contraction-decision implementation in the codebase.
 *
 * @internal — cross-module/test use only; not part of the consumer surface.
 */
export function buildEinsumSpec(
  operands: ReadonlyArray<ContractableNode>,
  contractionPairs: ReadonlyArray<{ label: string }>,
  freeIndices: ReadonlyMap<string, { upper: number; lower: number }>,
): EinsumSpec {
  // Map every label to its (operand, axis) sites — via operandIndices() so a
  // tensor-partial-derivative operand contributes its [...of.indices, wrtIndex]
  // effective axes.
  const sites = new Map<string, Array<[number, number]>>();
  operands.forEach((op, opIndex) => {
    operandIndices(op).forEach((idx, axis) => {
      const list = sites.get(idx.label) ?? [];
      list.push([opIndex, axis]);
      sites.set(idx.label, list);
    });
  });

  // Contractions: computeContraction told us exactly which labels contract.
  const contractions: EinsumContraction[] = [];
  for (const { label } of contractionPairs) {
    const locs = sites.get(label);
    if (!locs || locs.length !== 2) {
      throw new NumericalBackendError(
        `buildEinsumSpec: contracted label "${label}" must occur at exactly 2 `
        + `operand sites, found ${locs?.length ?? 0}`,
      );
    }
    contractions.push({ pair: [locs[0], locs[1]] });
  }

  // Free axes in computeContraction's freeIndices order — the symbolic
  // layer's canonical ordering, so the numerical result's axis order
  // matches what the rest of UPT expects.
  const free: Array<{ operand: number; axis: number }> = [];
  for (const label of freeIndices.keys()) {
    const locs = sites.get(label);
    if (!locs || locs.length !== 1) {
      throw new NumericalBackendError(
        `buildEinsumSpec: free label "${label}" must occur at exactly 1 `
        + `operand site, found ${locs?.length ?? 0}`,
      );
    }
    free.push({ operand: locs[0][0], axis: locs[0][1] });
  }

  return { contractions, free };
}

/** Lower a contractable operand to a concrete EngineTensor. */
function lowerContractable(
  node: ContractableNode, inputs: NumericalInputs, engine: TensorEngine,
): EngineTensor {
  const N = dimensionOf(inputs);
  if (node.kind === 'kronecker-delta') return engine.identity(N);
  if (node.kind === 'tensor-partial-derivative') {
    // Delegate to lowerNode, which handles all three numericalForm paths.
    return lowerNode(node, inputs, engine);
  }
  // tensor-symbol / metric-tensor: shape is N per index.
  const shape = node.indices.map(() => N);
  return engine.fromNested(requireValue(node.name, inputs), shape);
}

/** Lower a validated ExprNode to an EngineTensor.
 *  @internal — cross-module/test use only; not part of the consumer surface. */
export function lowerNode(
  node: ExprNode,
  inputs: NumericalInputs,
  engine: TensorEngine,
): EngineTensor {
  switch (node.kind) {
    case 'symbol':
      return engine.fromNested(requireValue(node.name, inputs), []);

    case 'tensor-symbol':
    case 'metric-tensor':
    case 'kronecker-delta':
      return lowerContractable(node, inputs, engine);

    case 'op': {
      if (node.op === '+' || node.op === '-') {
        if (node.args.length === 0) return engine.fromNested(0, []);
        let acc = lowerNode(node.args[0], inputs, engine);
        for (let i = 1; i < node.args.length; i++) {
          const next = lowerNode(node.args[i], inputs, engine);
          acc = node.op === '+' ? engine.add(acc, next) : engine.sub(acc, next);
        }
        return acc;
      }
      // '*' / '/' / '^' are scalar-only. Guard arity so an unvalidated AST
      // surfaces a clean NumericalBackendError instead of a raw TypeError
      // (zero-operand '/') or a silent NaN (wrong-arity '^'). The '*' case
      // with zero args is already fine — reduce(..., 1) returns 1.
      if (node.op === '/' && node.args.length === 0) {
        throw new NumericalBackendError("lowering: op '/' requires at least one operand");
      }
      if (node.op === '^' && node.args.length !== 2) {
        throw new NumericalBackendError(
          `lowering: op '^' requires exactly 2 operands (base, exponent), got ${node.args.length}`,
        );
      }
      // '*' / '/' / '^' are scalar-only (the validator rejects tensor
      // operands). Lower each to rank-0, do the arithmetic in JS, lift back.
      const scalars = node.args.map((a) => {
        const t = lowerNode(a, inputs, engine);
        if (t.shape.length !== 0) {
          throw new NumericalBackendError(
            `lowering: op '${node.op}' got a rank-${t.shape.length} operand — scalar ops require rank-0`,
          );
        }
        return engine.toNested(t) as number;
      });
      let value: number;
      if (node.op === '*') value = scalars.reduce((a, b) => a * b, 1);
      else if (node.op === '/') value = scalars.reduce((a, b) => a / b);
      else value = Math.pow(scalars[0], scalars[1]); // '^'
      return engine.fromNested(value, []);
    }

    case 'tensor-product': {
      for (const arg of node.args) {
        if (arg.kind === 'tensor-product') {
          throw new NumericalBackendError(
            'lowering: nested tensor-product numerical evaluation is not supported in v0.3.5 — '
            + 'flatten the contraction into a single product',
          );
        }
      }
      // Contractable operands (tensor-symbol / metric-tensor / kronecker-delta
      // / tensor-partial-derivative) participate in the einsum; everything
      // else must be a rank-0 scalar factor.
      const operands = node.args.filter(isContractable);
      const scalarArgs = node.args.filter((a) => !isContractable(a));
      // computeContraction is the single authority on WHICH indices contract
      // (variance-aware, implicit-metric rule). See buildEinsumSpec JSDoc.
      // The recursive validateContractionChild resolves tensor-partial-derivative
      // operands via validatePartialDerivative.
      function validateContractionChild(child: ExprNode): {
        dim: Dimension;
        freeIndices: Map<string, { upper: number; lower: number }>;
      } {
        if (child.kind === 'tensor-symbol') return validateTensorSymbol(child);
        if (child.kind === 'metric-tensor') return validateMetricTensor(child);
        if (child.kind === 'kronecker-delta') return validateKroneckerDelta(child);
        if (child.kind === 'tensor-partial-derivative') {
          const r = validatePartialDerivative(child, (g) =>
            validateContractionChild(g as ExprNode),
          );
          return { dim: r.dim, freeIndices: r.freeIndices };
        }
        throw new NumericalBackendError(
          `lowering: unexpected operand '${child.kind}' in tensor-product einsum`,
        );
      }
      const { contractionPairs, freeIndices } = computeContraction(
        operands, validateContractionChild,
      );
      const spec = buildEinsumSpec(operands, contractionPairs, freeIndices);
      const operandTensors = operands.map((n) => lowerContractable(n, inputs, engine));
      let result = engine.einsum(spec, ...operandTensors);
      // Scalar operands multiply the whole contraction.
      for (const s of scalarArgs) {
        const st = lowerNode(s, inputs, engine);
        if (st.shape.length !== 0) {
          throw new NumericalBackendError(
            'lowering: non-scalar non-contractable operand in tensor-product',
          );
        }
        result = engine.scale(result, engine.toNested(st) as number);
      }
      return result;
    }

    case 'tensor-partial-derivative': {
      // v0.3.5/v0.4.0 scope: `of` is a tensor-symbol or metric-tensor.
      // ∂_μ(of) adds the wrtIndex as a trailing axis — the result shape is
      // [...ofShape, N], NOT ofShape. (For BE-37, `of` = the scalar S is
      // rank-0, so ∂_μ S is the rank-1 wave covector k_μ, shape [N].)
      const of = node.of as ExprNode;

      // v0.4.0 extension: metric-tensor pderiv dispatch.
      if (of.kind === 'metric-tensor') {
        const mNode = of as MetricTensorNode;
        const strategy = mNode.derivativeStrategy ?? 'computed';
        const N = dimensionOf(inputs);
        const coordLabel = node.wrtIndex.label;
        const ofShape = mNode.indices.map(() => N);
        const resultShape = [...ofShape, N];

        if (strategy === 'zero') {
          // ∂g = 0 everywhere (constant/flat metric).
          return zeroTensor(resultShape, engine);
        }
        if (strategy === 'supplied') {
          // Look up the N slices ∂_mu g for mu=0..N-1 and stack them as the
          // trailing axis. Key format: `${metricName}/${coordLabel}_${mu}`.
          // Result shape: [...ofShape, N] = [N, N, N] for a rank-2 metric.
          // Build as a flat array then convert to nested for engine.fromNested().
          const size = resultShape.reduce((a, b) => a * b, 1);
          const flat = new Array<number>(size).fill(0);
          // ofShape = [N, N], resultShape = [N, N, N]
          // flat[i*N*N + j*N + mu] = (∂_mu g)[i][j]
          for (let mu = 0; mu < N; mu++) {
            const key = `${mNode.name}/${coordLabel}_${mu}`;
            const slice = inputs.metricDerivatives?.get(key);
            if (slice === undefined) {
              throw new NumericalBackendError(
                `lowering: metric-tensor pderiv with strategy='supplied': ` +
                `no metricDerivatives entry for "${key}"`,
              );
            }
            // Flatten the slice (shape [N,N]) and write into flat at stride N (last axis)
            const flatSlice = flattenNestedArray(slice, N * N);
            for (let ij = 0; ij < N * N; ij++) {
              flat[ij * N + mu] = flatSlice[ij];
            }
          }
          return engine.fromNested(flatToNested(flat, resultShape), resultShape);
        }

        // strategy === 'computed': treat as zero for constant-tensor metrics
        // (the raw metric supplied via inputs.tensors has no coordinate dependence).
        return zeroTensor(resultShape, engine);
      }

      if (of.kind !== 'tensor-symbol') {
        throw new NumericalBackendError(
          `lowering: tensor-partial-derivative numerical eval requires a tensor-symbol `
          + `or metric-tensor 'of' operand in v0.3.5/v0.4.0 — got '${of.kind}'`,
        );
      }
      const sym = of as TensorSymbolNode;
      const form = sym.numericalForm ?? 'symbolic';
      const coordLabel = node.wrtIndex.label;
      const N = dimensionOf(inputs);
      const ofShape = sym.indices.map(() => N);
      const resultShape = [...ofShape, N];

      if (form === 'symbolic') {
        // pderivSymbolic returns the caller-supplied full ∂_μ(of) tensor,
        // which must already be of shape [...ofShape, N].
        const d = pderivSymbolic(sym.name, coordLabel, inputs.derivatives ?? new Map());
        return engine.fromNested(d, resultShape);
      }

      if (form === 'numerical-fn') {
        // v0.3.5: 'numerical-fn' lowering is scoped to a rank-0 `of` (scalar
        // field). ∂_μ ranges over all N coordinate axes — stack the N
        // single-axis derivatives into the rank-1 result. Higher-rank fields
        // under 'numerical-fn' are a v0.4.0 concern.
        if (ofShape.length !== 0) {
          throw new NumericalBackendError(
            `lowering: 'numerical-fn' pderiv lowering supports a rank-0 'of' in v0.3.5; `
            + `"${sym.name}" is rank ${ofShape.length}`,
          );
        }
        const fn = inputs.fields?.get(sym.name);
        if (!fn) {
          throw new NumericalBackendError(
            `lowering: 'numerical-fn' tensor-symbol "${sym.name}" has no field fn in inputs.fields`,
          );
        }
        const coordValues = inputs.coords ? [...inputs.coords.values()] : [];
        const components: number[] = [];
        for (let axis = 0; axis < N; axis++) {
          components.push(pderivNumericalFn(fn, coordValues, axis) as number);
        }
        return engine.fromNested(components, [N]);
      }

      // form === 'grid': the GridField is the field sampled over space, and
      // pderivGrid returns the derivative field sampled on that same grid —
      // result shape is grid.shape. This is a distinct semantic from
      // symbolic/numerical-fn (a sampled derivative field, not a single
      // tensor), kept as the v0.5.0 BSSN forward-compat path. v0.3.5 has no
      // release test driving 'grid' through lowering; pderivGrid itself is
      // unit-tested in Task 10's pderiv.test.ts.
      const grid = inputs.grids?.get(sym.name);
      if (!grid) {
        throw new NumericalBackendError(
          `lowering: 'grid' tensor-symbol "${sym.name}" has no GridField in inputs.grids`,
        );
      }
      const gridAxis = inputs.coords ? [...inputs.coords.keys()].indexOf(coordLabel) : 0;
      const flat = pderivGrid(grid, gridAxis < 0 ? 0 : gridAxis);
      return engine.fromNested(flat.length === 1 ? flat[0] : flat, grid.shape);
    }

    case 'covariant-derivative': {
      // S2(a) fix: `of.freeIndices` does NOT exist on the raw ExprNode.
      // Re-validate the `of` subtree to obtain its free-index structure.
      const covNode = node as CovariantDerivativeNode;
      const ofExpr = covNode.of as ExprNode;
      // TS-2 runtime guard: `covNode.of` is typed as `unknown` (module-cycle
      // prevents ExprNode import in connection-validators.ts). The cast above
      // is unchecked — a malformed AST bypassing validate() would produce a
      // cryptic TypeError at `ofExpr.kind` below. Throw a clear message now.
      if (typeof (ofExpr as { kind?: unknown }).kind !== 'string') {
        throw new NumericalBackendError(
          `lowering: CovariantDerivativeNode.of must have a string 'kind' field ` +
          `(got ${JSON.stringify((ofExpr as Record<string, unknown>).kind)}). ` +
          `Always call validate() before evaluateNumericalRaw().`,
        );
      }
      const ofValidation = validate(ofExpr);
      // Build ordered list of free indices: [{label, variance}].
      // Iterate of.indices (NOT validation.freeIndices Map) — declaration order IS
      // the axis layout. For tensor-symbol and metric-tensor, of.indices is the
      // canonical axis order; the freeIndices Map insertion order is also
      // of.indices order (validateTensorSymbol iterates node.indices), but relying
      // on that is an undocumented invariant. Iterating of.indices directly makes
      // the axis ordering guarantee explicit and safe for future of-kinds.
      const ofFreeIndices: Array<{ label: string; variance: 'upper' | 'lower'; pos: number }> = [];
      const ofIndices = (ofExpr as { indices?: ReadonlyArray<{ label: string; variance: 'upper' | 'lower' }> }).indices;
      if (ofIndices) {
        // tensor-symbol / metric-tensor: iterate the declared indices in order.
        // Each index is either free (present in ofValidation.freeIndices) or
        // contracted (absent — skip). In practice, of.indices for a simple
        // tensor-symbol or metric-tensor has no contracted indices, but we
        // guard with the Map lookup for safety.
        for (const idx of ofIndices) {
          const counts = ofValidation.freeIndices.get(idx.label);
          if (counts === undefined) continue; // contracted — not a free axis
          ofFreeIndices.push({
            label: idx.label,
            variance: idx.variance,
            pos: ofFreeIndices.length,
          });
        }
      } else {
        // Fallback for future of-kinds without .indices (e.g. tensor-product).
        // Map iteration order is insertion order — a best-effort axis ordering.
        let axisPos = 0;
        for (const [label, counts] of ofValidation.freeIndices) {
          for (let i = 0; i < counts.upper; i++) {
            ofFreeIndices.push({ label, variance: 'upper', pos: axisPos++ });
          }
          for (let i = 0; i < counts.lower; i++) {
            ofFreeIndices.push({ label, variance: 'lower', pos: axisPos++ });
          }
        }
      }

      // Lower the operand tensor.
      const ofTensor = lowerNode(ofExpr, inputs, engine);
      const N = dimensionOf(inputs);

      // TS-2 runtime guard: gLower must be a metric-tensor node (validated
      // upstream). A malformed AST bypassing validate() could reach here with
      // a wrong kind, causing a silent wrong-path execution.
      if ((covNode.gLower as { kind?: unknown }).kind !== 'metric-tensor') {
        throw new NumericalBackendError(
          `lowering: CovariantDerivativeNode.gLower must be a metric-tensor node ` +
          `(got kind='${(covNode.gLower as { kind?: unknown }).kind}')`,
        );
      }
      const strategy = (covNode.gLower as MetricTensorNode).derivativeStrategy ?? 'computed';

      // S2(b): strategy='zero' → flat space, Γ=0, ∇_μ T = ∂_μ T.
      // For constant tensors (like a flat metric), ∂_μ T = 0, so result is all zeros.
      // We return a zero tensor of shape [...ofShape, N] (wrt axis appended last).
      if (strategy === 'zero') {
        const outShape = [...ofTensor.shape, N];
        return zeroTensor(outShape, engine);
      }

      // v0.4.0 CRITICAL FIX (Finding #1): 'computed' on a raw-tensor metric means
      // constant metric → Γ = 0 → covariant-derivative = partial derivative only.
      // v0.5.0 will replace this with coordinate-grid finite-difference.
      // This early return MUST come before the Christoffel construction below,
      // because getMetricDerivFlat only accepts 'zero' | 'supplied'; if 'computed'
      // fell through, the type cast was silently wrong at runtime and the function
      // threw NumericalBackendError for every coordinate.
      //
      // Compute partial first so we can return it directly.
      // (partial is also needed by the 'supplied' path below, so we compute it
      //  unconditionally and use the early return only for 'computed'.)
      //
      // UC-2 (v0.4.6): `of` is always tensor-symbol or metric-tensor at this
      // point. validateCovariantDerivative (connection-validators.ts) only
      // accepts those kinds for the 'of' field; any other kind fails dimensional
      // validation before evaluateNumerical reaches lowerNode. A covariant-
      // derivative with a scalar 'of' (ofFreeIndices.length === 0) already
      // returned at the early-return below. The old else-branch ("Scalar or
      // other: partial is zero") was therefore unreachable and is removed here;
      // replaced with an explicit throw to make the invariant visible if a
      // bypass-validate AST construction ever violates it.
      if (ofExpr.kind !== 'tensor-symbol' && ofExpr.kind !== 'metric-tensor') {
        throw new NumericalBackendError(
          `lowering: covariant-derivative 'of' must be tensor-symbol or metric-tensor ` +
          `(got '${(ofExpr as { kind: string }).kind}') — validated nodes cannot reach this point`,
        );
      }
      const pdNode: ExprNode = {
        kind: 'tensor-partial-derivative',
        of: ofExpr,
        wrt: covNode.wrt as ExprNode,
        wrtIndex: covNode.wrtIndex,
      };
      const partial = lowerNode(pdNode, inputs, engine);

      // v0.4.0 spec: 'computed' on a raw-tensor metric = constant metric → Γ = 0.
      // The covariant-derivative reduces to the ordinary partial derivative.
      // v0.5.0 will add coordinate-grid finite-difference here.
      if (strategy === 'computed') {
        return partial;
      }

      // S2(c) + S2(d): Build Christoffel Γ^α_{μν} from metric data and apply
      // the sign rule to all free indices of `of`:
      //   ∇_μ T^α_β = ∂_μ T^α_β + Γ^α_{μλ} T^λ_β − Γ^λ_{μβ} T^α_λ
      //
      // If `of` has no free indices (scalar), no correction needed.
      if (ofFreeIndices.length === 0) {
        return partial;
      }

      // Get metric and inverse metric data.
      const gLowerNode = covNode.gLower as MetricTensorNode;
      const gInverseNode = covNode.gInverse as MetricTensorNode;
      const gInverseData = flattenNestedArray(requireValue(gInverseNode.name, inputs), N * N);

      // coordLabel for metricDerivatives keys (wrtIndex.label of the covariant derivative)
      const coordLabel = covNode.wrtIndex.label;

      // getMetricDeriv(mu): returns flat [N*N] of ∂_{mu} g
      const getMetricDeriv = (mu: number): number[] =>
        getMetricDerivFlat(
          gLowerNode.name,
          coordLabel,
          mu,
          'supplied',
          // ^ strategy can only be 'supplied' here: 'zero' returned at line 457-459,
          //   'computed' returned at line 491-493, scalar 'of' returned at line 500-502.
          // Safe per audit UC-1: 'zero' strategy is short-circuited in earlier guard.
          N,
          inputs.metricDerivatives,
        );

      // Compute Γ^α_{μν} from metric data.
      const GammaTensor = computeChristoffelTensor(gInverseData, getMetricDeriv, N, engine);
      const GammaFlat = flattenNestedArray(engine.toNested(GammaTensor) as NestedArray, N * N * N);

      // Apply the Christoffel correction for each free index of `of`.
      // S2(d) sign rule: upper → +Γ, lower → −Γ.
      const ofFlat = flattenNestedArray(engine.toNested(ofTensor) as NestedArray,
        ofTensor.shape.reduce((a, b) => a * b, 1));
      const ofShapeArr = [...ofTensor.shape];

      let correction = zeroTensorLike(partial, engine);
      for (const freeIdx of ofFreeIndices) {
        const term = contractChristoffelWithOperand(
          GammaFlat,
          ofFlat,
          ofShapeArr,
          freeIdx.pos,
          freeIdx.variance,
          N,
          engine,
        );
        const sign = freeIdx.variance === 'upper' ? 1 : -1;
        correction = tensorAddScaled(correction, term, sign as 1 | -1, engine);
      }

      return tensorAdd(partial, correction, engine);
    }

    case 'integral':
    case 'derivative':
      throw new NumericalBackendError(
        `lowering: '${node.kind}' is not numerically evaluated in v0.3.5 — `
        + 'use tensor-partial-derivative for differentiation',
      );

    default: {
      const _exhaustive: never = node;
      void _exhaustive;
      throw new NumericalBackendError(
        `lowering: unknown ExprNode.kind ${JSON.stringify((node as { kind?: unknown }).kind)}`,
      );
    }
  }
}
