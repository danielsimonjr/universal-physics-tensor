/**
 * UC-2 regression guard (v0.4.6): the `else` branch at lowering.ts lines 482-486
 * (strategy=zero path: "Scalar or other: partial derivative is zero") is dead.
 *
 * A validated CovariantDerivativeNode always has `of.kind` equal to
 * 'tensor-symbol' or 'metric-tensor' — validateCovariantDerivative in
 * connection-validators.ts enforces this before evaluateNumerical is called.
 * Any other kind fails dimensional validation and never reaches lowerNode.
 *
 * This test uses the strategy='zero' path (flat-space metric) with a
 * tensor-symbol operand and confirms:
 *  1. evaluateNumerical completes without error (if-branch fires, else-branch
 *     does NOT fire → no wrong-path behaviour).
 *  2. Result shape matches the expected [4,4,4] (two metric indices + wrt axis),
 *     documenting the normal output so any regression is immediately visible.
 *
 * TDD honesty: like UC-1, this is a PRE-GREEN guard. The if-branch already works;
 * the else-branch is dead today. The test documents the invariant and will catch
 * future drift if the dead-branch removal is ever accidentally reverted.
 */
import { describe, it, expect } from 'vitest';
import { evaluateNumerical } from '../../src/numerical/index.js';
import { buildCovariantDerivativeOfMetricNode_FlatSpace } from '../fixtures/flat-cov-deriv.js';

describe('lowering: covariant-derivative else branch is dead (UC-2)', () => {
  it('strategy=zero + of.kind=metric-tensor: if-branch fires, result is all-zero [4,4,4]', async () => {
    // Uses derivativeStrategy='zero' (Γ=0, flat space). The operand `of` is a
    // metric-tensor node — one of the two kinds that enter the if-branch.
    // The else-branch ("Scalar or other: partial is zero") cannot fire here.
    const ast = buildCovariantDerivativeOfMetricNode_FlatSpace();
    const result = await evaluateNumerical(ast, {
      tensors: new Map([
        ['g',     [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['g_inv', [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['x', [0, 0, 0, 0]],
      ]),
      dimension: 4,
    });

    // Flatten and check: shape is [ν, ρ, μ] = [4, 4, 4] → 64 elements all zero.
    const flat: number[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === 'number') flat.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
    };
    walk(result.value);

    // 64 elements → confirms the if-branch (tensor-partial-derivative path) ran,
    // not the else-branch which used `ofTensor.shape` (a [4,4] shape → 16 elements).
    expect(flat.length).toBe(64);
    for (const v of flat) expect(v).toBeCloseTo(0, 12);
  });
});
