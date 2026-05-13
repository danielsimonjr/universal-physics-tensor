import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';

const DIM = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

describe('AST → JSON → AST round-trip (per §14.6)', () => {
  function roundTrip(node: ExprNode): ExprNode {
    return JSON.parse(JSON.stringify(node));
  }

  it('tensor-symbol survives JSON round-trip', () => {
    const original: ExprNode = {
      kind: 'tensor-symbol', name: 'T',
      indices: [
        { label: 'μ', variance: 'upper' },
        { label: 'ν', variance: 'lower' },
      ],
      dim: DIM,
      role: 'field',
    };
    const restored = roundTrip(original);
    expect(restored).toEqual(original);
    const result = validate(restored);
    expect(result.freeIndices.size).toBe(2);
  });

  it('tensor-product survives JSON round-trip', () => {
    const A: ExprNode = {
      kind: 'tensor-symbol', name: 'A',
      indices: [{ label: 'μ', variance: 'upper' }],
      dim: DIM,
    };
    const B: ExprNode = {
      kind: 'tensor-symbol', name: 'B',
      indices: [{ label: 'μ', variance: 'lower' }],
      dim: DIM,
    };
    const prod: ExprNode = { kind: 'tensor-product', args: [A, B] };
    const restored = roundTrip(prod);
    expect(restored).toEqual(prod);
    const result = validate(restored);
    expect(result.freeIndices.size).toBe(0);  // fully contracted
  });

  it('nested tensor-product survives round-trip', () => {
    const A: ExprNode = {
      kind: 'tensor-symbol', name: 'A',
      indices: [{ label: 'μ', variance: 'upper' }],
      dim: DIM,
    };
    const inner: ExprNode = { kind: 'tensor-product', args: [A] };
    const outer: ExprNode = { kind: 'tensor-product', args: [inner] };
    const restored = roundTrip(outer);
    expect(restored).toEqual(outer);
  });
});
