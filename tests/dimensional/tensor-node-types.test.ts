import { describe, it, expect } from 'vitest';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { Dimension } from '../../src/dimensional/types.js';

describe('tensor AST node types', () => {
  it('tensor-symbol is a valid ExprNode', () => {
    const dim: Dimension = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    const node: ExprNode = {
      kind: 'tensor-symbol',
      name: 'T',
      indices: [{ label: 'μ', variance: 'upper' }],
      dim,
    };
    expect(node.kind).toBe('tensor-symbol');
  });

  it('tensor-symbol supports the optional role field', () => {
    const dim: Dimension = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    const fieldNode: ExprNode = {
      kind: 'tensor-symbol',
      name: 'g',
      indices: [{ label: 'μ', variance: 'lower' }, { label: 'ν', variance: 'lower' }],
      dim,
      role: 'constant',
    };
    expect((fieldNode as { role?: string }).role).toBe('constant');
  });

  it('tensor-product is a valid ExprNode', () => {
    const dim: Dimension = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
    const left: ExprNode = {
      kind: 'tensor-symbol', name: 'A', indices: [{ label: 'μ', variance: 'upper' }], dim,
    };
    const right: ExprNode = {
      kind: 'tensor-symbol', name: 'B', indices: [{ label: 'μ', variance: 'lower' }], dim,
    };
    const node: ExprNode = { kind: 'tensor-product', args: [left, right] };
    expect(node.kind).toBe('tensor-product');
    expect(node.args).toHaveLength(2);
  });
});
