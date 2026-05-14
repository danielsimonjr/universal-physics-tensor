/**
 * v0.3.1 audit fix: integral/derivative recursion must NOT leak the
 * integrand/derivand's free indices into the parent's freeIndices Map.
 *
 * Before the fix, validator.ts used shallow `{ ...ctx, path: ... }` spreads
 * when recursing into `node.integrand` / `node.over` / `node.of` / `node.wrt`.
 * Because `ctx.freeIndices` is a Map (shared by reference), a tensor-valued
 * child would silently dump its free indices into the caller's accumulator.
 *
 * Fix uses `inferArgLocal()` so each child gets a fresh local freeIndices Map.
 *
 * v0.3.0 does not define tensor-integral or tensor-derivative semantics
 * (those would require Part-IX); the operators are treated as dimensional
 * scalars here and any tensor free-index from a child stays local.
 */

import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import type { Dimension } from '../../src/dimensional/types.js';

const LENGTH: Dimension = { L: 1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
const FORCE: Dimension = { L: 1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

describe('integral/derivative do not leak tensor free indices (v0.3.1 audit fix)', () => {
  it('integral over a tensor-valued integrand does not leak free indices to parent', () => {
    const expr = {
      kind: 'integral' as const,
      integrand: tsym('T', [{ label: 'μ', variance: 'upper' }], FORCE),
      over: { kind: 'symbol' as const, name: 'x', dim: LENGTH },
    };
    const result = validate(expr);
    expect(result.freeIndices.has('μ')).toBe(false);
    expect(result.freeIndices.size).toBe(0);
  });

  it('derivative of a tensor-valued of does not leak free indices to parent', () => {
    const expr = {
      kind: 'derivative' as const,
      of: tsym('T', [{ label: 'μ', variance: 'upper' }], FORCE),
      wrt: { kind: 'symbol' as const, name: 'x', dim: LENGTH },
    };
    const result = validate(expr);
    expect(result.freeIndices.has('μ')).toBe(false);
    expect(result.freeIndices.size).toBe(0);
  });
});
