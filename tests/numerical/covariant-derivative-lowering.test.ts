/**
 * Task 12 [U]: covariant-derivative numerical lowering.
 *
 * Test 1 — derivativeStrategy='zero' (flat space)
 *   ∇_μ g_νρ ≡ 0 everywhere: all-zeros result.
 *
 * Test 2 — derivativeStrategy='supplied'
 *   ∇_μ V^ν with explicit ∂_0 g_{11}=1 → ∇_0 V^1 = 0.5.
 */

import { describe, it, expect } from 'vitest';
import { evaluateNumerical } from '../../src/numerical/index.js';
import {
  buildCovariantDerivativeOfMetricNode_FlatSpace,
  buildChristoffelAST_HandCraftedMetric,
} from '../fixtures/flat-cov-deriv.js';

describe('Covariant-derivative lowering — three derivativeStrategy paths', () => {
  it("derivativeStrategy='zero' (flat space) → ∇_μ g_νρ ≡ 0", async () => {
    const ast = buildCovariantDerivativeOfMetricNode_FlatSpace();
    const result = await evaluateNumerical(ast, {
      tensors: new Map([
        ['g', [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['g_inv', [[-1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['x', [0, 0, 0, 0]],
      ]),
      dimension: 4,
    });
    // ∇_μ g_νρ with strategy='zero' returns a zero tensor of the appropriate rank.
    // Flatten result.value and check all zeros.
    const flat: number[] = [];
    const walk = (v: unknown): void => {
      if (typeof v === 'number') flat.push(v);
      else if (Array.isArray(v)) v.forEach(walk);
    };
    walk(result.value);
    // shape is [N,N,N] (ν, ρ axes from g, μ axis appended) = [4,4,4] → 64 elements
    expect(flat.length).toBe(64);
    for (const v of flat) expect(v).toBeCloseTo(0, 12);
  });

  it("derivativeStrategy='supplied' → reads inputs.metricDerivatives, Γ^1_{0,1}=0.5", async () => {
    // ∇_μ V^ν: V^ν=[0,1,0,0] (constant), g=diag(1,1,1,1), ∂_0 g_{11}=1.
    // Γ^1_{μ,1} = (1/2) g^{11} ∂_μ g_{11}: Γ^1_{0,1}=0.5, all others zero.
    // ∇_μ V^ν = ∂_μ V^ν + Γ^ν_{μ,λ} V^λ = 0 + Γ^ν_{μ,1} * 1
    //   → ∇_0 V^1 = Γ^1_{0,1} = 0.5 (only nonzero entry)
    const ast = buildChristoffelAST_HandCraftedMetric();
    // metricDerivatives keyed 'g/μ_0', 'g/μ_1', ... for ∂_mu g (μ is the wrtIndex.label)
    const zeroSlice = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    const result = await evaluateNumerical(ast, {
      tensors: new Map([
        ['g', [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['g_inv', [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['x', [0, 0, 0, 0]],
        ['V', [0, 1, 0, 0]],   // V^ν = δ^ν_1
      ]),
      // ∂_μ g — keyed 'g/μ_0', 'g/μ_1', 'g/μ_2', 'g/μ_3'
      metricDerivatives: new Map([
        ['g/μ_0', [[0, 0, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],  // ∂_0 g_{11}=1
        ['g/μ_1', zeroSlice],
        ['g/μ_2', zeroSlice],
        ['g/μ_3', zeroSlice],
      ]),
      // ∂_μ V^ν = 0 (constant vector) — keyed 'V/μ' (wrtIndex.label)
      derivatives: new Map([
        ['V/μ', [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
      ]),
      dimension: 4,
    });

    // Result is ∇_μ V^ν, shape [4,4] with axes [ν (upper), μ (lower)]
    // (the wrtIndex axis 'μ' is appended as the last axis).
    //
    // With ∂_0 g_{11}=1, g=diag(1,1,1,1), V=[0,1,0,0]:
    //   Γ^1_{0,1} = 0.5  → ∇_0 V^1 = 0.5  (output[ν=1][μ=0])
    //   Γ^0_{1,1} = −0.5 → ∇_1 V^0 = −0.5 (output[ν=0][μ=1])
    //   all others = 0
    expect(result.warnings.filter((w) => w.severity === 'error')).toHaveLength(0);
    const v = result.value as number[][];
    expect(Array.isArray(v)).toBe(true);
    // shape [4,4] = ν × μ
    const flat: number[] = [];
    const walk = (x: unknown): void => {
      if (typeof x === 'number') flat.push(x);
      else if (Array.isArray(x)) x.forEach(walk);
    };
    walk(result.value);
    expect(flat.length).toBe(16);
    // Primary check: Γ^1_{0,1} correction → ∇_0 V^1 = 0.5
    expect(v[1][0]).toBeCloseTo(0.5, 10);
    // Cross-check: Γ^0_{1,1} = −0.5 → ∇_1 V^0 = −0.5
    expect(v[0][1]).toBeCloseTo(-0.5, 10);
    // All other entries should be zero
    const nonzero = flat.filter((x) => Math.abs(x) > 1e-10);
    expect(nonzero.length).toBe(2);
  });
});
