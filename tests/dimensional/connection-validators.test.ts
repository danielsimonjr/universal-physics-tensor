/**
 * UC-1 (v0.5.1 Task 14): Per-throw-path unit coverage on
 * `src/dimensional/connection-validators.ts`.
 *
 * Targets `validateCovariantDerivative` (5 paths) and `validateRiemannTensor`
 * (6 paths) — ~250 LOC of critical-path GR foundation that v0.5.0 shipped
 * with only happy-path coverage via the integration-level
 * covariant-derivative-node + riemann-tensor tests.
 *
 * Spec: docs/planning/v0.5.1-Implementation-Plan.md Task 14 / Design Decision #4.
 */
import { describe, it, expect, afterEach } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';
import {
  PartialDerivativeIndexVarianceError,
  MetricSignatureError,
  IndexLabelCollisionError,
} from '../../src/dimensional/errors.js';

const gLower = metric(
  'g',
  [
    { label: 'a', variance: 'lower' },
    { label: 'b', variance: 'lower' },
  ],
  DIMENSIONLESS,
  '+,-,-,-',
);
const gInverse = metric(
  'gInv',
  [
    { label: 'a', variance: 'upper' },
    { label: 'b', variance: 'upper' },
  ],
  DIMENSIONLESS,
  '+,-,-,-',
);
const xCoord = tsym('x', [{ label: 'α', variance: 'upper' }], LENGTH, 'coordinate');

describe('validateCovariantDerivative (per-throw-path)', () => {
  afterEach(() => {
    delete process.env['UPT_ALLOW_COORD_SHADOW'];
  });

  it('happy path: ∇_μ V^ν returns {freeIndices, dim} with both indices propagated', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V,
      wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower,
      gInverse,
    };
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(r.freeIndices.size).toBe(2);
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ν')).toEqual({ upper: 1, lower: 0 });
    // dim = of.dim / wrt.dim = L / L = dimensionless.
    expect(r.inferredDimension).toEqual({
      L: 0,
      M: 0,
      T: 0,
      I: 0,
      Theta: 0,
      N: 0,
      J: 0,
    });
  });

  it('throws PartialDerivativeIndexVarianceError when wrtIndex.variance is "upper"', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V,
      wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'upper' } as never,
      gLower,
      gInverse,
    };
    expect(() => validate(node)).toThrow(PartialDerivativeIndexVarianceError);
  });

  it('throws MetricSignatureError when gLower is not both-lower (passed an upper-upper metric)', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V,
      wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower: gInverse, // upper-upper in the lower slot → wrong
      gInverse,
    };
    expect(() => validate(node)).toThrow(MetricSignatureError);
    expect(() => validate(node)).toThrow(/gLower.*both-lower/i);
  });

  it('throws MetricSignatureError when gInverse is not both-upper (passed a lower-lower metric)', () => {
    const V = tsym('V', [{ label: 'ν', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V,
      wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower,
      gInverse: gLower, // lower-lower in the upper slot → wrong
    };
    expect(() => validate(node)).toThrow(MetricSignatureError);
    expect(() => validate(node)).toThrow(/gInverse.*both-upper/i);
  });

  it('throws MetricSignatureError when wrtIndex label collides with operand free-index (default behavior, no UPT_ALLOW_COORD_SHADOW)', () => {
    // V has free 'μ'; wrtIndex is also 'μ' → shadow collision.
    delete process.env['UPT_ALLOW_COORD_SHADOW'];
    const V = tsym('V', [{ label: 'μ', variance: 'upper' }], LENGTH);
    const node: ExprNode = {
      kind: 'covariant-derivative',
      of: V,
      wrt: xCoord,
      wrtIndex: { label: 'μ', variance: 'lower' },
      gLower,
      gInverse,
    };
    expect(() => validate(node)).toThrow(MetricSignatureError);
    expect(() => validate(node)).toThrow(/shadows.*free index/i);
  });
});

describe('validateRiemannTensor (per-throw-path)', () => {
  it('happy path: R^ρ_σμν returns 4 free indices and dim {L: -2}', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'ρ', variance: 'upper' },
      lowerIndices: [
        { label: 'σ', variance: 'lower' },
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    const r = validate(node);
    expect(r.ok).toBe(true);
    expect(r.freeIndices.size).toBe(4);
    expect(r.freeIndices.get('ρ')).toEqual({ upper: 1, lower: 0 });
    expect(r.freeIndices.get('σ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('μ')).toEqual({ upper: 0, lower: 1 });
    expect(r.freeIndices.get('ν')).toEqual({ upper: 0, lower: 1 });
    expect(r.inferredDimension).toEqual({
      L: -2,
      M: 0,
      T: 0,
      I: 0,
      Theta: 0,
      N: 0,
      J: 0,
    });
  });

  it('throws PartialDerivativeIndexVarianceError when upperIndex.variance is "lower"', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'ρ', variance: 'lower' as never },
      lowerIndices: [
        { label: 'σ', variance: 'lower' },
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    expect(() => validate(node)).toThrow(PartialDerivativeIndexVarianceError);
    expect(() => validate(node)).toThrow(/upperIndex.*upper/i);
  });

  it('throws PartialDerivativeIndexVarianceError when any lowerIndices entry is "upper"', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'ρ', variance: 'upper' },
      lowerIndices: [
        { label: 'σ', variance: 'lower' },
        { label: 'μ', variance: 'upper' as never },
        { label: 'ν', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    expect(() => validate(node)).toThrow(PartialDerivativeIndexVarianceError);
    expect(() => validate(node)).toThrow(/lowerIndices\[1\].*lower/i);
  });

  it('throws MetricSignatureError when gLower signature is wrong (upper-upper passed)', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'ρ', variance: 'upper' },
      lowerIndices: [
        { label: 'σ', variance: 'lower' },
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      gLower: gInverse, // wrong: upper-upper
      gInverse,
      xCoord,
    };
    expect(() => validate(node)).toThrow(MetricSignatureError);
    expect(() => validate(node)).toThrow(/gLower.*both-lower/i);
  });

  it('throws MetricSignatureError when gInverse signature is wrong (lower-lower passed)', () => {
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'ρ', variance: 'upper' },
      lowerIndices: [
        { label: 'σ', variance: 'lower' },
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
      ],
      gLower,
      gInverse: gLower, // wrong: lower-lower
      xCoord,
    };
    expect(() => validate(node)).toThrow(MetricSignatureError);
    expect(() => validate(node)).toThrow(/gInverse.*both-upper/i);
  });

  it('throws IndexLabelCollisionError when two of the 4 own free labels collide (M9 internal disjointness, NOT all-globally-distinct)', () => {
    // upper ρ collides with lower σ as both 'μ' — would imply implicit contraction
    // R^μ_μνλ which is Ricci-tensor's job, not a bare Riemann.
    const node: ExprNode = {
      kind: 'riemann-tensor',
      upperIndex: { label: 'μ', variance: 'upper' },
      lowerIndices: [
        { label: 'μ', variance: 'lower' },
        { label: 'ν', variance: 'lower' },
        { label: 'λ', variance: 'lower' },
      ],
      gLower,
      gInverse,
      xCoord,
    };
    expect(() => validate(node)).toThrow(IndexLabelCollisionError);
  });
});
