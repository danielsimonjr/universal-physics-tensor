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
  buildCovDerivOfVectorNode_Computed,
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

  it("derivativeStrategy='computed' (default) with constant metric → partial only, no crash", async () => {
    // Pre-fix: this crashed at runtime because 'computed' was type-cast to 'supplied'
    // and getMetricDerivFlat threw NumericalBackendError for missing metricDerivatives.
    //
    // Post-fix (v0.4.0 spec): 'computed' on a raw-tensor metric = constant metric
    // → Γ = 0 → covariant-derivative = partial derivative only.
    //
    // Setup: V^ν = [0,1,0,0] constant, g=diag(1,1,1,1), no metricDerivatives supplied.
    // ∂_μ V^ν = 0 (supplied via derivatives map), Γ = 0 → ∇_μ V^ν = 0 everywhere.
    const ast = buildCovDerivOfVectorNode_Computed();
    const result = await evaluateNumerical(ast, {
      tensors: new Map([
        ['g', [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['g_inv', [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]]],
        ['x', [0, 0, 0, 0]],
        ['V', [0, 1, 0, 0]],
      ]),
      // No metricDerivatives — 'computed' must NOT require them (was the crash source).
      derivatives: new Map([
        ['V/μ', [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]],
      ]),
      dimension: 4,
    });
    expect(result.warnings.filter((w) => w.severity === 'error')).toHaveLength(0);
    // Result shape [4,4] = ν × μ, all zeros (constant V, Γ=0)
    const flat: number[] = [];
    const walk = (x: unknown): void => {
      if (typeof x === 'number') flat.push(x);
      else if (Array.isArray(x)) x.forEach(walk);
    };
    walk(result.value);
    expect(flat.length).toBe(16);
    for (const v of flat) expect(v).toBeCloseTo(0, 10);
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
    // Derivation: V^β = (0,1,0,0), g = diag(1,1,1,1) Euclidean, only ∂_0 g_{11}=1 nonzero.
    //
    // Christoffel formula: Γ^α_{μν} = (1/2) g^{αρ} (∂_μ g_{ρν} + ∂_ν g_{ρμ} − ∂_ρ g_{μν})
    //
    // Γ^1_{0,1}: α=1, μ=0, ν=1 → (1/2) g^{11} (∂_0 g_{11} + ∂_1 g_{10} − ∂_1 g_{01})
    //           = (1/2)·1·(1 + 0 − 0) = 0.5
    //   ∇_0 V^1 = ∂_0 V^1 + Γ^1_{0,β} V^β = 0 + Γ^1_{0,1}·1 = +0.5  ✓ (v[1][0])
    //
    // Γ^0_{1,1}: α=0, μ=1, ν=1 → (1/2) g^{00} (∂_1 g_{01} + ∂_1 g_{01} − ∂_0 g_{11})
    //           = (1/2)·(+1)·(0 + 0 − 1) = −0.5   [g_{00}=+1 Euclidean, NOT Minkowski]
    //   ∇_1 V^0 = ∂_1 V^0 + Γ^0_{1,β} V^β = 0 + Γ^0_{1,1}·1 = −0.5  ✓ (v[0][1])
    //
    // A reviewer claimed v[0][1] should be 0 — that is INCORRECT. Γ^0_{1,1} = −0.5
    // for the Euclidean (all +1 diagonal) metric when ∂_0 g_{11}=1. Both assertions
    // are physically correct; do NOT change them.
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
