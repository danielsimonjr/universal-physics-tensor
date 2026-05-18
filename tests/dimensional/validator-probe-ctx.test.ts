import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS, LENGTH } from '../../src/dimensional/types.js';

describe('validator: probeCtx warning propagation', () => {
  it('validate completes without throwing for a simple power expression', () => {
    // A numeric exponent is the common case — validate should succeed cleanly.
    const base = {
      kind: 'tensor-symbol' as const,
      name: 'r',
      indices: [],
      dim: LENGTH,
      numericalForm: 'grid' as const,
    };
    const expr = {
      kind: 'op' as const,
      op: '^' as const,
      args: [base, { kind: 'tensor-symbol' as const, name: '2', indices: [], dim: DIMENSIONLESS }],
    };
    // Should not throw; validates a simple r^2 expression.
    expect(() => validate(expr as any)).not.toThrow();
  });
});
