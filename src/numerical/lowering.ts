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
import type { CovariantDerivativeNode, RiemannTensorNode } from '../dimensional/connection-validators.js';
import type { RicciTensorNode, EinsteinTensorNode, BianchiResidualNode } from '../dimensional/curvature.js';
import type { WeylTensorNode } from '../dimensional/weyl-validators.js';
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
import {
  christoffelAt,
  dGammaAt,
  buildRiemann,
  bianchiResidualAt,
  contractRiemannJS,
  type MetricFn,
} from './curvature-lowering-helpers.js';
import { computeWeylTensor } from './weyl-lowering.js';

/**
 * v0.5.1 TS-2: module-private type predicate for the `metric-tensor`
 * AST kind. Replaces the duplicated `(n as { kind?: unknown }).kind ===
 * 'metric-tensor'` cast pattern that appeared at the covariant-derivative
 * lowering site; TypeScript narrows `covNode.gLower` to `MetricTensorNode`
 * after the predicate, removing the follow-up `as MetricTensorNode` cast.
 */
function isMetricTensorNode(n: unknown): n is MetricTensorNode {
  return typeof n === 'object' && n !== null
    && (n as { kind?: unknown }).kind === 'metric-tensor';
}

/** Operand kinds a flat tensor-product can lower in v0.3.5: the three
 *  index-carrying nodes plus tensor-partial-derivative (whose effective
 *  indices are `of`'s indices followed by its wrtIndex).
 *
 *  NOTE: Explicitly enumerated rather than structural Extract to avoid
 *  accidentally including future index-carrying nodes (e.g.,
 *  StressEnergyTensorNode) that are not contractable in the einsum sense. */
type ContractableNode =
  | Extract<ExprNode, { kind: 'tensor-symbol' }>
  | Extract<ExprNode, { kind: 'metric-tensor' }>
  | Extract<ExprNode, { kind: 'kronecker-delta' }>
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
      // a wrong kind, causing a silent wrong-path execution. The type
      // predicate narrows covNode.gLower to MetricTensorNode for the rest of
      // this branch — no follow-up cast needed.
      if (!isMetricTensorNode(covNode.gLower)) {
        throw new NumericalBackendError(
          `lowering: CovariantDerivativeNode.gLower must be a metric-tensor node ` +
          `(got kind='${(covNode.gLower as { kind?: unknown }).kind}')`,
        );
      }
      const strategy = covNode.gLower.derivativeStrategy ?? 'computed';

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

      // Get metric and inverse metric data. gLower is already narrowed to
      // MetricTensorNode by the isMetricTensorNode guard above (TS-2);
      // gInverse retains its existing cast because no analogous predicate
      // exists for the inverse-metric kind yet.
      const gLowerNode: MetricTensorNode = covNode.gLower;
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

    case 'ricci-tensor': {
      // v0.5.0 Task 7 — Ricci R_μν = R^λ_{μλν} (Carroll Eq. 3.91). Lowers
      // the embedded Riemann tensor via the 'riemann-tensor' case (so all
      // FD machinery is shared), then contracts upper-ρ with the SECOND
      // lower slot (the μ slot of R^ρ_σμν — i.e., axis index 2 in the
      // [ρ, σ, μ, ν] storage) by summing R[λ][σ][λ][ν] over λ. The
      // surviving free axes are lowerIndices[0] (the σ slot, becoming
      // Ricci's first free index μ_out) and lowerIndices[2] (the ν slot,
      // becoming Ricci's second free index ν_out).
      //
      // Convention note (deviates from the Task 7 prompt's stated S1 rule
      // but agrees with Carroll Eq. 3.91 and the constant-curvature
      // identity R_μν = (n-1)·K·g_μν → R = 4Λ for de Sitter in n=4): the
      // prompt's "contract upper↔lowerIndices[0] (σ)" trace is the
      // first-pair antisymmetric trace `R^λ_λμν`, which is identically
      // zero for the (lowered) Riemann's first-pair antisymmetry — it
      // would zero out the de-Sitter Ricci scalar, contradicting both the
      // closed-form fixture and the test target R_scalar = 4Λ. The
      // mathematically correct contraction that satisfies the de-Sitter
      // test target is upper↔lowerIndices[1] (the middle/μ slot),
      // matching Carroll Eq. 3.91 verbatim.
      //
      // No new AST primitive in the contraction: the inner Riemann
      // returns an [N,N,N,N] EngineTensor; we materialise it via
      // engine.toNested, contract on the JS side, and lift back via
      // engine.fromNested. (Mirrors the philosophy of Task 6: walk the
      // composite node directly, no rewrite into a tensor-product.)
      const ricciNode = node as RicciTensorNode;
      const N = dimensionOf(inputs);
      const innerR = lowerNode(ricciNode.riemann, inputs, engine);
      const flatR = flattenNestedArray(engine.toNested(innerR) as NestedArray, N * N * N * N);

      // Contract R[λ][μ_out][λ][ν_out] → Ricci[μ_out][ν_out] via the shared
      // `contractRiemannJS` helper (AS-1, v0.5.1). On R^ρ_{σμν} stored as
      // R[ρ][σ][μ][ν], the Carroll Eq. 3.91 contraction is upperAxis=0 (ρ)
      // against lowerAxis=2 (μ); free outputs are axes [1, 3] = (σ, ν).
      const ricci2d = contractRiemannJS(flatR, N, {
        upperAxis: 0, lowerAxis: 2, outAxes: [1, 3],
      });
      return engine.fromNested(ricci2d as NestedArray, [N, N]);
    }

    case 'einstein-tensor': {
      // v0.5.0 Task 8 — Einstein G_μν = R_μν − ½ R g_μν.
      //
      // Lowers in three steps and folds them on the JS side (same
      // walk-directly philosophy as ricci-tensor — no AST rewrite into a
      // 'op'/'-' tree with a tensor-valued scalar-multiply, which the
      // v0.3.5 tensor-product einsum does not natively support):
      //
      //   1. Lower the inner ricci-tensor → R_μν   (4×4 number[][])
      //   2. Look up g_μν and g^μν from inputs.tensors (constant raw values
      //      at the coordinate point — same pattern as the riemann-tensor
      //      case uses for `xCoord` / inputs.fields).
      //   3. Compute scalar R = Σ_{μν} g^{μν} R_{μν} on the JS side.
      //   4. Form G_{μν} = R_{μν} − ½ R · g_{μν} elementwise.
      //
      // Trace identity g^μν G_μν = −R is preserved EXACTLY in the
      // arithmetic (modulo cancellation noise) because both R and the
      // ½ R g_μν trace term are constructed from the same `Ric` and `g`
      // matrices — the test pins this to machine precision.
      const eNode = node as EinsteinTensorNode;
      const N = dimensionOf(inputs);

      // Step 1: inner Ricci R_μν via the ricci-tensor case (which itself
      // walks the riemann-tensor case for ∂Γ etc).
      const ricciNodeInner: RicciTensorNode = {
        kind: 'ricci-tensor', riemann: eNode.riemann,
      };
      const innerR = lowerNode(ricciNodeInner, inputs, engine);
      const Ric = engine.toNested(innerR) as number[][];

      // Step 2: g_μν and g^μν from inputs.tensors (raw constant matrices at
      // the test coordinate point). Mirrors how ricci-tensor's de-Sitter
      // closed-form test sources its metrics.
      const gFlat = flattenNestedArray(requireValue(eNode.gLower.name, inputs), N * N);
      const gInvFlat = flattenNestedArray(requireValue(eNode.gInverse.name, inputs), N * N);

      // Step 3: scalar R = Σ g^{μν} R_{μν}.
      let Rscalar = 0;
      for (let mu = 0; mu < N; mu++) {
        for (let nu = 0; nu < N; nu++) {
          Rscalar += gInvFlat[mu * N + nu] * Ric[mu][nu];
        }
      }

      // Step 4: G_{μν} = R_{μν} − ½ R · g_{μν}.
      const G: number[][] = Array.from({ length: N }, () => new Array<number>(N).fill(0));
      const halfR = 0.5 * Rscalar;
      for (let mu = 0; mu < N; mu++) {
        for (let nu = 0; nu < N; nu++) {
          G[mu][nu] = Ric[mu][nu] - halfR * gFlat[mu * N + nu];
        }
      }
      return engine.fromNested(G as NestedArray, [N, N]);
    }

    case 'bianchi-residual': {
      // v0.5.0 Task 9 — Bianchi-identity residual B_{λμνρσ}.
      //
      // Approach 1 (full ∇, not raw ∂): cyclic sum
      //   B_{λμνρσ} = ∇_λ R_{μνρσ} + ∇_μ R_{νλρσ} + ∇_ν R_{λμρσ}
      // where each ∇_λ R_{μνρσ} is computed with the four Christoffel-
      // correction terms (one per lower index of R). All FD/contraction
      // arithmetic happens in the helper module — this case just wires
      // x / metric closures from `inputs` to `bianchiResidualAt`.
      //
      // The result is a 5-deep nested array [N][N][N][N][N] with index order
      // B[λ][μ][ν][ρ][σ]. Returned as an EngineTensor of shape [N,N,N,N,N];
      // callers (typically bianchiResidual().evaluate) materialise via
      // engine.toNested.
      //
      // Walks the node directly — no AST rewrite into an op('+') of pderiv
      // products. Matches Task 6/7/8 walk-directly philosophy.
      const bNode = node as BianchiResidualNode;
      const rNode = bNode.riemann;
      const N = dimensionOf(inputs);

      // Coordinate value: same convention as the riemann-tensor case.
      const xCoordName = rNode.xCoord.name;
      const xRaw = requireValue(xCoordName, inputs);
      const x = flattenNestedArray(xRaw, N);

      // Coordinate-dependent metric closures.
      const gName = rNode.gLower.name;
      const gInvName = rNode.gInverse.name;
      const gFn = inputs.fields?.get(gName) as MetricFn | undefined;
      const gInverseFn = inputs.fields?.get(gInvName) as MetricFn | undefined;
      if (!gFn || !gInverseFn) {
        throw new NumericalBackendError(
          `lowering: bianchi-residual numerical evaluation requires coordinate-` +
          `dependent metric closures in inputs.fields for "${gName}" and "${gInvName}". ` +
          `Got fields=[${[...(inputs.fields?.keys() ?? [])].join(',')}].`,
        );
      }

      const B = bianchiResidualAt(x, gFn, gInverseFn, N, engine);
      return engine.fromNested(B as NestedArray, [N, N, N, N, N]);
    }

    case 'riemann-tensor': {
      // v0.5.0 Task 6 (Phase 1c-ii). Walks the node directly (no AST rewrite
      // into pderiv-of-Γ): evaluates Γ(x) via the v0.4.0
      // `computeChristoffelTensor` helper, then computes ∂Γ via centered FD
      // (M11 — pderiv-style, not a new AST kind or AD pass).
      const rNode = node as RiemannTensorNode;
      const N = dimensionOf(inputs);

      // Coordinate value: read from inputs.tensors[xCoord.name] (a flat
      // number[] of length N). This mirrors the test fixture's
      // 'x' tensor convention.
      const xCoordName = rNode.xCoord.name;
      const xRaw = requireValue(xCoordName, inputs);
      const x = flattenNestedArray(xRaw, N);

      // Coordinate-dependent metric closures: required for ∂g (inner FD) and
      // ∂Γ (outer FD). Looked up by name in inputs.fields.
      const gName = rNode.gLower.name;
      const gInvName = rNode.gInverse.name;
      const gFn = inputs.fields?.get(gName) as MetricFn | undefined;
      const gInverseFn = inputs.fields?.get(gInvName) as MetricFn | undefined;
      if (!gFn || !gInverseFn) {
        throw new NumericalBackendError(
          `lowering: riemann-tensor numerical evaluation requires coordinate-` +
          `dependent metric closures in inputs.fields for "${gName}" and "${gInvName}" ` +
          `(constant-metric Riemann is identically zero — the test wouldn't fire here). ` +
          `Got fields=[${[...(inputs.fields?.keys() ?? [])].join(',')}].`,
        );
      }

      // Γ^ρ_{σν}(x) and ∂_λ Γ^ρ_{σν}(x).
      const gamma = christoffelAt(x, gFn, gInverseFn, N, engine);
      const dGamma = dGammaAt(x, gFn, gInverseFn, N, engine);

      // R[ρ][σ][μ][ν] per the Carroll formula (Adam+Eve F4-S3).
      const R = buildRiemann(gamma, dGamma, N);

      // Materialise back into an EngineTensor in [N,N,N,N] shape.
      return engine.fromNested(R as NestedArray, [N, N, N, N]);
    }

    case 'killing-vector': {
      // v0.6.0 Task 1.1: KillingVectorNode symbolic AST added. Numerical
      // evaluation (verifyKillingEquation / evaluateConservedCharge) is
      // deferred to Task 1.3 (src/numerical/killing.ts). Until then, the
      // lowering layer raises a descriptive error so callers get a clear
      // signal instead of the generic 'unknown kind' message.
      throw new NumericalBackendError(
        `lowering: 'killing-vector' numerical evaluation is not yet implemented ` +
        `(Task 1.3). Use verifyKillingEquation() from src/numerical/killing.ts.`,
      );
    }

    case 'conserved-charge': {
      // v0.6.0 Task 1.2: ConservedChargeNode symbolic AST added. Numerical
      // evaluation (evaluateConservedCharge) is deferred to Task 1.3
      // (src/numerical/killing.ts). Raises a descriptive error so callers
      // get a clear signal instead of the generic 'unknown kind' message.
      throw new NumericalBackendError(
        `lowering: 'conserved-charge' numerical evaluation is not yet implemented ` +
        `(Task 1.3). Use evaluateConservedCharge() from src/numerical/killing.ts.`,
      );
    }

    case 'stress-energy': {
      // v0.6.0 Task 2.1: StressEnergyTensorNode symbolic AST added. Full
      // numerical evaluation (T_μν from a perfect-fluid or explicit component
      // map) is deferred to Task 2.4 (src/numerical/einstein-equation.ts).
      // Raises a descriptive error so callers get a clear signal instead of
      // the generic 'unknown kind' message from the exhaustiveness guard.
      throw new NumericalBackendError(
        `lowering: 'stress-energy' numerical evaluation is not yet implemented ` +
        `(Task 2.4). Use the Einstein-equation evaluator in src/numerical/einstein-equation.ts.`,
      );
    }

    case 'cosmological-constant': {
      // v0.6.0 Task 2.1: CosmologicalConstantNode symbolic AST added. Numerical
      // evaluation (inject Λ as a scalar into the Einstein equation) is deferred
      // to Task 2.4 (src/numerical/einstein-equation.ts).
      throw new NumericalBackendError(
        `lowering: 'cosmological-constant' numerical evaluation is not yet implemented ` +
        `(Task 2.4). Use the Einstein-equation evaluator in src/numerical/einstein-equation.ts.`,
      );
    }

    case 'einstein-equation': {
      // v0.6.0 Task 2.3: EinsteinFieldEquationNode predicate AST added. Numerical
      // evaluation (G_μν + Λ g_μν = κ T_μν residual tensor) is deferred to
      // Task 2.4 (src/numerical/einstein-equation.ts).
      throw new NumericalBackendError(
        `lowering: 'einstein-equation' numerical evaluation is not yet implemented ` +
        `(Task 2.4). Use the Einstein-equation evaluator in src/numerical/einstein-equation.ts.`,
      );
    }

    case 'weyl-tensor': {
      // v0.6.0 Task 3.2 — Weyl C^ρ_{σμν} from Riemann + Ricci + R via
      // explicit index-raise (F-5).
      //
      // Approach (mirrors einstein-tensor / riemann-tensor walk-directly philosophy):
      //   1. Read the coordinate array from inputs.tensors['x'] (same convention
      //      as the riemann-tensor arm).
      //   2. Read metric closures g and g^{-1} from inputs.fields by the metric
      //      node's name and '${name}_inv' respectively. The inverse name
      //      convention follows the einstein-equation evaluator's 'g' / 'g_inv'
      //      pattern.
      //   3. Compute Riemann R^ρ_{σμν} via christoffelAt + dGammaAt + buildRiemann
      //      (same FD pipeline as riemann-tensor and einstein-tensor arms).
      //   4. Compute Ricci R_{μν} by contracting R^λ_{μλν} (upperAxis=0, lowerAxis=2).
      //   5. Compute Ricci scalar R = Σ g^{μν} R_{μν} using the point-sample of g_inv.
      //   6. Read point-sample of g from inputs.tensors[metricName].
      //   7. Call computeWeylTensor with all five pre-sampled arrays.
      //
      // Naming convention (must match the caller's inputs map):
      //   inputs.tensors[metricName]          — g_{μν} at x
      //   inputs.tensors[metricName + '_inv'] — g^{μν} at x
      //   inputs.tensors['x']                 — coordinate 4-vector
      //   inputs.fields[metricName]           — coordinate-dependent g closure
      //   inputs.fields[metricName + '_inv']  — coordinate-dependent g^{-1} closure
      const weylNode = node as WeylTensorNode;
      const N = dimensionOf(inputs);
      const metricName = weylNode.metric.name;
      const metricInvName = `${metricName}_inv`;

      // Coordinate vector.
      const xRaw = requireValue('x', inputs);
      const x = flattenNestedArray(xRaw, N);

      // Metric closures for the FD pipeline.
      const gFn = inputs.fields?.get(metricName) as MetricFn | undefined;
      const gInverseFn = inputs.fields?.get(metricInvName) as MetricFn | undefined;
      if (!gFn || !gInverseFn) {
        throw new NumericalBackendError(
          `lowering: weyl-tensor requires coordinate-dependent metric closures in ` +
          `inputs.fields for "${metricName}" and "${metricInvName}". ` +
          `Got fields=[${[...(inputs.fields?.keys() ?? [])].join(',')}].`,
        );
      }

      // Step 3: Riemann R^ρ_{σμν} via the FD pipeline.
      const gamma = christoffelAt(x, gFn, gInverseFn, N, engine);
      const dGamma = dGammaAt(x, gFn, gInverseFn, N, engine);
      const Rup = buildRiemann(gamma, dGamma, N);

      // Step 4: Ricci R_{μν} = R^λ_{μλν} (Carroll Eq. 3.91).
      // contractRiemannJS requires a flat input — flatten the nested Riemann.
      const flatRup = flattenNestedArray(Rup as unknown as NestedArray, N * N * N * N);
      const Ric = contractRiemannJS(flatRup, N, {
        upperAxis: 0, lowerAxis: 2, outAxes: [1, 3],
      });

      // Step 5: Ricci scalar R = Σ_{μν} g^{μν} R_{μν}.
      const gInvFlat = flattenNestedArray(requireValue(metricInvName, inputs), N * N);
      let Rscalar = 0;
      for (let mu = 0; mu < N; mu++) {
        for (let nu = 0; nu < N; nu++) {
          Rscalar += gInvFlat[mu * N + nu] * Ric[mu][nu];
        }
      }

      // Step 6: point-sample of covariant metric.
      const gFlat = flattenNestedArray(requireValue(metricName, inputs), N * N);
      const gMat: number[][] = Array.from({ length: N }, (_, i) =>
        Array.from({ length: N }, (__, j) => gFlat[i * N + j]),
      );
      const gInvMat: number[][] = Array.from({ length: N }, (_, i) =>
        Array.from({ length: N }, (__, j) => gInvFlat[i * N + j]),
      );

      // Step 7: assemble Weyl via the F-5 formula.
      const C = computeWeylTensor({
        riemann: Rup,
        ricci: Ric,
        ricciScalar: Rscalar,
        metric: gMat,
        metricInverse: gInvMat,
      });

      return engine.fromNested(C as NestedArray, [N, N, N, N]);
    }

    default: {
      const _exhaustive: never = node;
      void _exhaustive;
      throw new NumericalBackendError(
        `lowering: unknown ExprNode.kind ${JSON.stringify((node as { kind?: unknown }).kind)}`,
      );
    }
  }
}
