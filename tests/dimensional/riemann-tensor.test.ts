/**
 * Task 5 (v0.5.0 Phase 1c-i): RiemannTensorNode AST + validator.
 *
 * Spec: docs/planning/v0.5.0-Implementation-Plan.md §Task 5, Design §3 Task 1c.
 *
 * Pin-point fixture pin (M7) lives in tests/fixtures/schwarzschild.test.ts
 * (added in Task 0 with the coordinate-basis Carroll-formula
 * R^t_{rtr} = r_s/(r²(r-r_s))). Not re-pinned here — the plan template's
 * leading-order 2GM/(6M)³ shorthand is off ~33% at finite r and was
 * superseded by Task 0's closed form.
 */
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';

const gLower = metric('g',
  [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
  DIMENSIONLESS, '+,-,-,-');
const gInverse = metric('gInv',
  [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
  DIMENSIONLESS, '+,-,-,-');
const xCoord = tsym('x', [{ label: 'c', variance: 'upper' }], LENGTH, 'coordinate');

describe('RiemannTensorNode validator + dim', () => {
  it('produces free-indices {ρ: upper, σ: lower, μ: lower, ν: lower} and dim {L: -2}', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'rho', variance: 'upper' },
      lowerIndices: [
        { label: 'sigma', variance: 'lower' },
        { label: 'mu', variance: 'lower' },
        { label: 'nu', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    const result = validate(node);
    expect(result.ok).toBe(true);
    expect(result.freeIndices.size).toBe(4);
    expect(result.freeIndices.get('rho')).toEqual({ upper: 1, lower: 0 });
    expect(result.freeIndices.get('sigma')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('mu')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('nu')).toEqual({ upper: 0, lower: 1 });
    expect(result.inferredDimension).toEqual({ L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 });
    // H1 suppression: gLower/gInverse/xCoord free indices (a, b, c) MUST NOT leak.
    expect(result.freeIndices.has('a')).toBe(false);
    expect(result.freeIndices.has('b')).toBe(false);
    expect(result.freeIndices.has('c')).toBe(false);
  });

  it('throws when upperIndex.variance is "lower"', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'rho', variance: 'lower' as never },
      lowerIndices: [
        { label: 'sigma', variance: 'lower' },
        { label: 'mu', variance: 'lower' },
        { label: 'nu', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    expect(() => validate(node)).toThrow(/upperIndex.*upper|riemann.*upper/i);
  });

  it('throws when any lowerIndices entry is upper', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'rho', variance: 'upper' },
      lowerIndices: [
        { label: 'sigma', variance: 'lower' },
        { label: 'mu', variance: 'upper' as never },
        { label: 'nu', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    expect(() => validate(node)).toThrow(/lowerIndices.*lower|riemann.*lower/i);
  });

  it('throws when two free indices on the riemann node share a label (e.g. ρ collides with σ)', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'mu', variance: 'upper' },
      lowerIndices: [
        { label: 'mu', variance: 'lower' },
        { label: 'nu', variance: 'lower' },
        { label: 'lam', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    // Free-index disjointness on the riemann-tensor's own 4 labels:
    // upper 'mu' + lower 'mu' would be a contraction, not a free-index node.
    expect(() => validate(node)).toThrow(/duplicate|collision|disjoint|riemann/i);
  });
});
