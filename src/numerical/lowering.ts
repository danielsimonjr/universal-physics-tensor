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
import type { TensorIndex } from '../dimensional/tensor.js';
import type { Dimension } from '../dimensional/types.js';
import { computeContraction, validateTensorSymbol } from '../dimensional/tensor.js';
import {
  validateMetricTensor,
  validateKroneckerDelta,
  validatePartialDerivative,
} from '../dimensional/metric-validators.js';
import type {
  EngineTensor, TensorEngine, EinsumSpec, EinsumContraction,
} from './tensor-engine.js';
import type { NumericalInputs, NestedArray } from './types.js';
import { NumericalBackendError } from './errors.js';

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
 *  (v0.3.5: `of` is a tensor-symbol) followed by the wrtIndex. */
function operandIndices(node: ContractableNode): ReadonlyArray<TensorIndex> {
  if (node.kind === 'tensor-partial-derivative') {
    const of = node.of as ExprNode;
    if (of.kind !== 'tensor-symbol') {
      throw new NumericalBackendError(
        `lowering: a tensor-partial-derivative operand requires a tensor-symbol 'of' `
        + `in v0.3.5 — got '${of.kind}'`,
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

/**
 * Build the EinsumSpec for a flat tensor-product.
 *
 * CRITICAL (finding #1 of the v0.3.5 adversarial review): this function does
 * NOT decide which indices contract. `computeContraction()` — the v0.2.0
 * symbolic-layer authority, which is variance-aware and applies the
 * implicit-identity-metric rule — already classified every label as
 * contracted or free. buildEinsumSpec only maps those already-classified
 * labels to their (operand, axis) sites. There is exactly one
 * contraction-decision implementation in the codebase.
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
    // Delegate to lowerNode's tensor-partial-derivative case (Task 10 wires
    // it; until then that case throws — so a tensor-product containing a
    // pderiv operand lowers only after Task 10, which is fine: Task 14 / BE-37
    // depends on Task 10 anyway).
    return lowerNode(node, inputs, engine);
  }
  // tensor-symbol / metric-tensor: shape is N per index.
  const shape = node.indices.map(() => N);
  return engine.fromNested(requireValue(node.name, inputs), shape);
}

/** Lower a validated ExprNode to an EngineTensor. */
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
      // (variance-aware, implicit-metric rule — finding #1). buildEinsumSpec
      // only maps the labels it classified to (operand, axis) sites. The
      // recursive validateContractionChild resolves tensor-partial-derivative
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

    case 'tensor-partial-derivative':
      throw new NumericalBackendError(
        'lowering: tensor-partial-derivative numerical evaluation is not implemented until Task 10',
      );

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
