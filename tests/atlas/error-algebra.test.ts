/**
 * Witness W6 — the error algebra is an associative, non-commutative monoid
 * under outer-after-inner composition.
 *
 * The reversed-order value asserted here is `(30, 32)`, NOT the `(30, 17)`
 * printed in the implementation plan. See design note §9 RED: inner
 * `(3,2)∘(2,1) = (6,5)`, then `(5,7)∘(6,5)` gives `K = 5·6 = 30`,
 * `delta = 5·5 + 7 = 32`. Re-derived here by executing the rule.
 */
import { describe, it, expect } from 'vitest';
import {
  composeBounds,
  composeBoundPath,
  IDENTITY_BOUND,
} from '../../src/atlas/error-algebra.js';
import { MissingLipschitzError } from '../../src/atlas/types.js';

const b = (K: number, delta: number) => ({ K, delta });

describe('composeBounds', () => {
  it('composes outer-after-inner as K_o·K_i, K_o·δ_i + δ_o', () => {
    expect(composeBounds(b(2, 1), b(3, 2))).toEqual({ K: 6, delta: 5 });
  });

  it('is associative on a triple (W6)', () => {
    const left = composeBounds(b(2, 1), composeBounds(b(3, 2), b(5, 7)));
    const right = composeBounds(composeBounds(b(2, 1), b(3, 2)), b(5, 7));
    expect(left).toEqual({ K: 30, delta: 47 });
    expect(right).toEqual({ K: 30, delta: 47 });
    expect(left).toEqual(right);
  });

  it('is NOT commutative — the reversed order gives (30, 32) (W6)', () => {
    const reversed = composeBounds(b(5, 7), composeBounds(b(3, 2), b(2, 1)));
    expect(composeBounds(b(3, 2), b(2, 1))).toEqual({ K: 6, delta: 5 });
    expect(reversed).toEqual({ K: 30, delta: 32 });
    expect(reversed).not.toEqual({ K: 30, delta: 47 });
  });

  it('has IDENTITY_BOUND as a two-sided identity', () => {
    expect(composeBounds(IDENTITY_BOUND, b(3, 2))).toEqual(b(3, 2));
    expect(composeBounds(b(3, 2), IDENTITY_BOUND)).toEqual(b(3, 2));
    expect(IDENTITY_BOUND).toEqual({ K: 1, delta: 0 });
  });
});

describe('composeBoundPath', () => {
  it('folds an empty path to the identity, non-terminal', () => {
    expect(composeBoundPath([])).toEqual({ bound: IDENTITY_BOUND, terminal: false });
  });

  it('folds a path outer-after-inner in traversal order', () => {
    // [b1, b2] is b1 then b2, i.e. b2 ∘ b1.
    expect(composeBoundPath([b(2, 1), b(3, 2)])).toEqual({
      bound: { K: 6, delta: 5 },
      terminal: false,
    });
  });

  it('throws MissingLipschitzError when a null is not last', () => {
    expect(() => composeBoundPath([b(2, 1), null, b(3, 2)])).toThrow(MissingLipschitzError);
  });

  it('returns terminal for a trailing null, carrying the prefix bound', () => {
    expect(composeBoundPath([b(2, 1), b(3, 2), null])).toEqual({
      bound: composeBounds(b(3, 2), b(2, 1)),
      terminal: true,
    });
  });

  it('folding (2, 0.1) ten times gives K = 1024 (W6)', () => {
    const path = Array.from({ length: 10 }, () => b(2, 0.1));
    const { bound, terminal } = composeBoundPath(path);
    expect(bound.K).toBe(1024);
    expect(terminal).toBe(false);
    // delta = 0.1 · (2^9 + 2^8 + … + 2^0) = 0.1 · 1023
    expect(bound.delta).toBeCloseTo(102.3, 10);
  });
});
