import { describe, it, expect } from 'vitest';
import { lowerNode } from '../../src/numerical/lowering.js';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';
import type { NumericalInputs } from '../../src/numerical/types.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym, contract } from '../../src/dimensional/tensor.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

const engine = new Float64ReferenceEngine();

describe('lowerNode', () => {
  it('lowers a scalar symbol to a rank-0 tensor', () => {
    const node: ExprNode = { kind: 'symbol', name: 'x', dim: LENGTH };
    const inputs: NumericalInputs = { tensors: new Map([['x', 3.5]]) };
    const t = lowerNode(node, inputs, engine);
    expect(t.shape).toEqual([]);
    expect(engine.toNested(t)).toBe(3.5);
  });

  it('lowers a tensor-symbol to a tensor of the right shape', () => {
    const node = tsym('V', [{ label: 'mu', variance: 'upper' }], LENGTH);
    const inputs: NumericalInputs = { tensors: new Map([['V', [1, 2, 3, 4]]]), dimension: 4 };
    const t = lowerNode(node, inputs, engine);
    expect(t.shape).toEqual([4]);
    expect(engine.toNested(t)).toEqual([1, 2, 3, 4]);
  });

  it('lowers a kronecker-delta to the identity', () => {
    const node: ExprNode = {
      kind: 'kronecker-delta',
      indices: [{ label: 'mu', variance: 'upper' }, { label: 'nu', variance: 'lower' }],
      dim: DIMENSIONLESS,
    };
    const t = lowerNode(node, { tensors: new Map(), dimension: 2 }, engine);
    expect(engine.toNested(t)).toEqual([[1, 0], [0, 1]]);
  });

  it('lowers a flat tensor-product to an einsum contraction (g^{ij} v_j -> w^i)', () => {
    const gInv: ExprNode = {
      kind: 'metric-tensor', name: 'gInv',
      indices: [{ label: 'i', variance: 'upper' }, { label: 'j', variance: 'upper' }],
      signature: '+,+', dim: DIMENSIONLESS,
    };
    const v = tsym('v', [{ label: 'j', variance: 'lower' }], LENGTH);
    const node = contract(gInv, v);
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[] | number[][]>([
        ['gInv', [[0.5, 0], [0, 0.25]]],
        ['v', [10, 20]],
      ]),
      dimension: 2,
    };
    const t = lowerNode(node, inputs, engine);
    expect(engine.toNested(t)).toEqual([5, 5]); // [0.5*10, 0.25*20]
  });

  it('throws a clear error on a nested tensor-product', () => {
    const inner = contract(tsym('a', [{ label: 'k', variance: 'upper' }], LENGTH));
    const outer = contract(inner, tsym('b', [{ label: 'k', variance: 'lower' }], LENGTH));
    expect(() => lowerNode(outer, { tensors: new Map() }, engine))
      .toThrow(/nested tensor-product/);
  });

  it('throws a clear NumericalBackendError on zero-operand division and wrong-arity power', () => {
    expect(() =>
      lowerNode({ kind: 'op', op: '/', args: [] }, { tensors: new Map() }, engine),
    ).toThrow(/op '\/' requires at least one operand/);
    expect(() =>
      lowerNode(
        { kind: 'op', op: '^', args: [{ kind: 'symbol', name: 'x', dim: DIMENSIONLESS }] },
        { tensors: new Map([['x', 2]]) },
        engine,
      ),
    ).toThrow(/op '\^' requires exactly 2 operands/);
  });
});
