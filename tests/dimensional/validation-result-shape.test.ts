import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';

describe('ValidationResult.freeIndices for scalar nodes', () => {
  it('symbol node returns empty freeIndices map', () => {
    const node: ExprNode = {
      kind: 'symbol', name: 'x',
      dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const result = validate(node);
    expect(result.freeIndices).toBeInstanceOf(Map);
    expect(result.freeIndices.size).toBe(0);
  });

  it('op + (scalar) returns empty freeIndices map', () => {
    const a: ExprNode = {
      kind: 'symbol', name: 'a',
      dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const b: ExprNode = {
      kind: 'symbol', name: 'b',
      dim: { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    };
    const sum: ExprNode = { kind: 'op', op: '+', args: [a, b] };
    const result = validate(sum);
    expect(result.freeIndices.size).toBe(0);
    expect(result.ok).toBe(true);
  });
});
