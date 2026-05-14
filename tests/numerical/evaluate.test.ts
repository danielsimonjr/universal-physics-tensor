import { describe, it, expect } from 'vitest';
import { evaluateNumerical, evaluateNumericalRaw } from '../../src/numerical/index.js';
import type { NumericalInputs } from '../../src/numerical/types.js';
import { tsym, contract } from '../../src/dimensional/tensor.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

describe('evaluateNumerical', () => {
  it('evaluates a flat contraction to plain JS', async () => {
    const gInv: ExprNode = {
      kind: 'metric-tensor', name: 'gInv',
      indices: [{ label: 'i', variance: 'upper' }, { label: 'j', variance: 'upper' }],
      signature: '+,+', dim: DIMENSIONLESS,
    };
    const v = tsym('v', [{ label: 'j', variance: 'lower' }], LENGTH);
    const node = contract(gInv, v);
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[] | number[][]>([
        ['gInv', [[0.5, 0], [0, 0.25]]], ['v', [10, 20]],
      ]),
      dimension: 2,
    };
    const result = await evaluateNumerical(node, inputs);
    expect(result.value).toEqual([5, 5]);
    expect(result.warnings).toEqual([]);
  });

  it('throws when the AST is dimensionally invalid', async () => {
    const bad: ExprNode = {
      kind: 'op', op: '+',
      args: [
        { kind: 'symbol', name: 'L', dim: LENGTH },
        { kind: 'symbol', name: 'T', dim: { ...LENGTH, T: 1 } },
      ],
    };
    await expect(
      evaluateNumerical(bad, { tensors: new Map([['L', 1], ['T', 1]]) }),
    ).rejects.toThrow(/not dimensionally valid|violation/i);
  });

  it('evaluateNumericalRaw returns a live EngineTensor', async () => {
    const node = tsym('v', [{ label: 'j', variance: 'upper' }], LENGTH);
    const inputs: NumericalInputs = { tensors: new Map([['v', [1, 2]]]), dimension: 2 };
    const raw = await evaluateNumericalRaw(node, inputs);
    expect(raw.value.shape).toEqual([2]);
    expect(() => raw.dispose()).not.toThrow(); // no-op for pure-JS engines
  });
});
