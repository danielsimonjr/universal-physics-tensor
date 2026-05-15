/**
 * Fixture builders for Task 12 covariant-derivative lowering tests.
 *
 * buildCovariantDerivativeOfMetricNode_FlatSpace —
 *   ∇_μ g_νρ with strategy='zero' (flat space, all-zero Christoffel).
 *   Result must be shape [4,4,4,4] (or [4,4,4]), all zeros.
 *
 * buildCovDerivOfVectorNode_Supplied —
 *   ∇_μ V^ν with strategy='supplied' and explicit ∂_0 g_{11}=1.
 *   With V^ν = [0,1,0,0] (constant) and g = diag(1,1,1,1):
 *     Γ^1_{0,1} = (1/2) g^{11} ∂_0 g_{11} = 0.5
 *   Result: ∇_0 V^1 = ∂_0 V^1 + Γ^1_{0,λ} V^λ = 0 + Γ^1_{0,1}·1 = 0.5
 *
 * buildChristoffelAST_HandCraftedMetric —
 *   Returns the same ∇_μ V^ν node as above (plan compatibility alias).
 */

import type { ExprNode } from '../../src/dimensional/validator.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { metric } from '../../src/dimensional/metric.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

/** Flat-space metric with derivativeStrategy='zero': Γ=0, ∇_μ=∂_μ.
 *  For a constant metric, ∂_μ g_νρ=0 so ∇_μ g_νρ=0. */
export function buildCovariantDerivativeOfMetricNode_FlatSpace(): ExprNode {
  const gLower = metric(
    'g',
    [{ label: 'ν', variance: 'lower' }, { label: 'ρ', variance: 'lower' }],
    DIMENSIONLESS,
    '+,-,-,-',
    'zero',
  );
  const gInverse = metric(
    'g_inv',
    [{ label: 'ν', variance: 'upper' }, { label: 'ρ', variance: 'upper' }],
    DIMENSIONLESS,
    '+,-,-,-',
    'zero',
  );
  const xCoord = tsym('x', [{ label: 'σ', variance: 'upper' }], DIMENSIONLESS, 'coordinate');

  return {
    kind: 'covariant-derivative',
    of: gLower,
    wrt: xCoord,
    wrtIndex: { label: 'μ', variance: 'lower' },
    gLower,
    gInverse,
  };
}

/**
 * ∇_μ V^ν with derivativeStrategy='supplied'.
 *
 * V^ν = [0,1,0,0] (constant), g = diag(1,1,1,1), ∂_0 g_{11} = 1.
 *
 * Expected result: ∇_0 V^1 = Γ^1_{0,1}·V^1 = 0.5·1 = 0.5
 * (all other components zero since ∂_μ V^ν = 0 and only Γ^1_{0,1} ≠ 0).
 */
export function buildCovDerivOfVectorNode_Supplied(): ExprNode {
  const gLower = metric(
    'g',
    [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
    DIMENSIONLESS,
    '+,-,-,-',
    'supplied',
  );
  const gInverse = metric(
    'g_inv',
    [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
    DIMENSIONLESS,
    '+,-,-,-',
    'supplied',
  );
  // V^ν is the operand vector (constant, numericalForm='symbolic' with zero derivatives)
  const V = tsym('V', [{ label: 'ν', variance: 'upper' }], DIMENSIONLESS);
  const xCoord = tsym('x', [{ label: 'σ', variance: 'upper' }], DIMENSIONLESS, 'coordinate');

  return {
    kind: 'covariant-derivative',
    of: V,
    wrt: xCoord,
    wrtIndex: { label: 'μ', variance: 'lower' },
    gLower,
    gInverse,
  };
}

/** Plan compatibility alias: same as buildCovDerivOfVectorNode_Supplied. */
export function buildChristoffelAST_HandCraftedMetric(): ExprNode {
  return buildCovDerivOfVectorNode_Supplied();
}
