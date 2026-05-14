import { describe, it, expect } from 'vitest';
import { evaluateNumerical } from '../../src/numerical/index.js';
import type { NumericalInputs } from '../../src/numerical/types.js';
import { tsym, contract } from '../../src/dimensional/tensor.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

describe('numerical correctness — hand-computed references', () => {
  it('2×2 metric contraction g_{ij} v^i v^j', async () => {
    const g: ExprNode = {
      kind: 'metric-tensor', name: 'g',
      indices: [{ label: 'i', variance: 'lower' }, { label: 'j', variance: 'lower' }],
      signature: '+,+', dim: DIMENSIONLESS,
    };
    const vI = tsym('vI', [{ label: 'i', variance: 'upper' }], LENGTH);
    const vJ = tsym('vJ', [{ label: 'j', variance: 'upper' }], LENGTH);
    const node = contract(g, vI, vJ);
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[] | number[][]>([
        ['g', [[2, 0], [0, 3]]], ['vI', [1, 1]], ['vJ', [1, 1]],
      ]),
      dimension: 2,
    };
    // g_ij v^i v^j = 2·1·1 + 3·1·1 = 5
    expect((await evaluateNumerical(node, inputs)).value as number).toBeCloseTo(5, 12);
  });

  it('rank-1 dot product u^i v_i', async () => {
    const u = tsym('u', [{ label: 'i', variance: 'upper' }], LENGTH);
    const v = tsym('v', [{ label: 'i', variance: 'lower' }], LENGTH);
    const inputs: NumericalInputs = {
      tensors: new Map<string, number[]>([['u', [3, 4]], ['v', [3, 4]]]),
      dimension: 2,
    };
    // u^i v_i = 3·3 + 4·4 = 25
    expect((await evaluateNumerical(contract(u, v), inputs)).value as number).toBeCloseTo(25, 12);
  });
});
