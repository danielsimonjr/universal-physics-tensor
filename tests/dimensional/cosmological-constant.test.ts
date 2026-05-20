// tests/dimensional/cosmological-constant.test.ts
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import type { CosmologicalConstantNode } from '../../src/dimensional/stress-energy-validators.js';

describe('CosmologicalConstantNode', () => {
  it('Λ with dim [L⁻²] validates as scalar', () => {
    const Lambda: CosmologicalConstantNode = {
      kind: 'cosmological-constant',
      symbol: 'Λ',
      dim: { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
      value: 1.1056e-52,
    };
    const r = validate(Lambda as ExprNode);
    expect(r.ok).toBe(true);
    expect(r.inferredDimension).toEqual(Lambda.dim);
    expect(r.freeIndices.size).toBe(0);
  });

  it('rejects wrong dim', () => {
    const bad = {
      kind: 'cosmological-constant',
      symbol: 'Λ',
      dim: { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 },
    } as unknown as ExprNode;
    expect(() => validate(bad)).toThrow(/L⁻²|\[L\^-2\]/);
  });
});
