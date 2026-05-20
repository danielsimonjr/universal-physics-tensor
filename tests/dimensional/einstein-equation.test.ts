/**
 * tests/dimensional/einstein-equation.test.ts
 *
 * Task 2.3 (v0.6.0 Phase 2): EinsteinFieldEquationNode predicate AST + validator.
 *
 * Four test cases per spec:
 *   1. Rank-2 G + Λg = κT with matched μν indices → validates OK
 *   2. Index-label mismatch (LHS μν, RHS αβ) → throws /index label/
 *   3. Dimension mismatch (T_μν given wrong componentDim) → throws /dimension/
 *   4. cosmological: null (Λ-omitted) → still validates OK
 */

import { describe, it, expect } from 'vitest';
import { validateEinsteinFieldEquation } from '../../src/dimensional/einstein-equation.js';
import type { EinsteinFieldEquationNode } from '../../src/dimensional/einstein-equation.js';
import type { EinsteinTensorNode } from '../../src/dimensional/curvature.js';
import type { StressEnergyTensorNode, CosmologicalConstantNode } from '../../src/dimensional/stress-energy-validators.js';
import type { MetricTensorNode } from '../../src/dimensional/metric-validators.js';
import type { RiemannTensorNode } from '../../src/dimensional/connection-validators.js';
import { tsym } from '../../src/dimensional/tensor.js';
import { LENGTH, DIMENSIONLESS } from '../../src/dimensional/types.js';
import { metric } from '../../src/dimensional/metric.js';

// ── Shared dim constants ──────────────────────────────────────────────────────

/** [L⁻²] — per-component dim of G_μν and every EFE term. */
const DIM_L_INV2 = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/** [M·L⁻¹·T⁻²] — energy density / Pa: required T_μν componentDim. */
const ENERGY_DENSITY = { L: -1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

// ── Node builder helpers ──────────────────────────────────────────────────────

/**
 * Build a minimal RiemannTensorNode. The free-index labels are:
 *   upperIndex.label    = 'rho'        (contracted in Ricci/Einstein)
 *   lowerIndices[0].label = muLabel    → Einstein free output μ_out
 *   lowerIndices[1].label = 'lambda'   (contracted in Ricci/Einstein)
 *   lowerIndices[2].label = nuLabel    → Einstein free output ν_out
 *
 * The EinsteinTensorNode validator extracts lowerIndices[0] and [2] as the
 * surviving free indices (Carroll Eq. 3.91 convention).
 */
function buildRiemann(
  muLabel = 'mu',
  nuLabel = 'nu',
  gName = 'g',
  gInvName = 'g_inv',
): RiemannTensorNode {
  const gLower: MetricTensorNode = metric(
    gName,
    [{ label: 'a', variance: 'lower' }, { label: 'b', variance: 'lower' }],
    DIMENSIONLESS,
    '+,-,-,-',
  );
  const gInverse: MetricTensorNode = metric(
    gInvName,
    [{ label: 'a', variance: 'upper' }, { label: 'b', variance: 'upper' }],
    DIMENSIONLESS,
    '+,-,-,-',
  );
  const xCoord = tsym('x', [{ label: 'c', variance: 'upper' }], LENGTH, 'coordinate');
  return {
    kind: 'riemann-tensor',
    upperIndex: { label: 'rho', variance: 'upper' },
    lowerIndices: [
      { label: muLabel, variance: 'lower' },
      { label: 'lambda', variance: 'lower' },
      { label: nuLabel, variance: 'lower' },
    ],
    gLower,
    gInverse,
    xCoord,
  };
}

/**
 * Build an EinsteinTensorNode from a RiemannTensorNode.
 * gLower / gInverse for the ½R·g_μν term reuse the Riemann's embedded metric.
 */
function buildEinstein(
  muLabel = 'mu',
  nuLabel = 'nu',
  gName = 'g',
  gInvName = 'g_inv',
): EinsteinTensorNode {
  const riemann = buildRiemann(muLabel, nuLabel, gName, gInvName);
  return {
    kind: 'einstein-tensor',
    riemann,
    gLower: riemann.gLower,
    gInverse: riemann.gInverse,
  };
}

/**
 * Build a StressEnergyTensorNode with the given index labels and componentDim.
 */
function buildT(
  idx0Label: string,
  idx1Label: string,
  componentDim = ENERGY_DENSITY,
): StressEnergyTensorNode {
  return {
    kind: 'stress-energy',
    symbol: 'T',
    indices: [
      { label: idx0Label, variance: 'lower' },
      { label: idx1Label, variance: 'lower' },
    ],
    symmetry: 'symmetric',
    componentDim,
  };
}

/**
 * Build a CosmologicalConstantNode with dim [L⁻²].
 */
function buildLambda(): CosmologicalConstantNode {
  return {
    kind: 'cosmological-constant',
    symbol: 'Λ',
    dim: DIM_L_INV2,
  };
}

/**
 * Build a MetricTensorNode for the Λ g_μν term (lower-lower, dimensionless).
 */
function buildMetric(name = 'g_metric'): MetricTensorNode {
  return metric(
    name,
    [{ label: 'mu', variance: 'lower' }, { label: 'nu', variance: 'lower' }],
    DIMENSIONLESS,
    '+,-,-,-',
  );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('EinsteinFieldEquationNode validator', () => {
  it('rank-2 G + Λg = κT with matched μν indices passes', () => {
    const node: EinsteinFieldEquationNode = {
      kind: 'einstein-equation',
      lhs: buildEinstein('mu', 'nu'),
      cosmological: buildLambda(),
      metric: buildMetric(),
      rhs: buildT('mu', 'nu'),
      coupling: 'einstein',
    };

    const result = validateEinsteinFieldEquation(node);

    expect(result.dim).toEqual(DIM_L_INV2);
    expect(result.freeIndices.get('mu')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('nu')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.size).toBe(2);
  });

  it('rejects index-label mismatch (LHS μν, RHS αβ)', () => {
    // LHS carries free labels (mu, nu); RHS carries (alpha, beta) — mismatch.
    const node: EinsteinFieldEquationNode = {
      kind: 'einstein-equation',
      lhs: buildEinstein('mu', 'nu'),
      cosmological: null,
      metric: buildMetric(),
      rhs: buildT('alpha', 'beta'),
      coupling: 'einstein',
    };

    expect(() => validateEinsteinFieldEquation(node)).toThrow(/index label/i);
  });

  it('rejects dimension mismatch (T_μν given wrong componentDim)', () => {
    // Give T_μν a componentDim of [L⁻²] instead of [M·L⁻¹·T⁻²] — wrong dim,
    // so (8πG/c⁴)·T would not reduce to [L⁻²].
    const wrongDim = DIM_L_INV2; // [L⁻²] ≠ [M·L⁻¹·T⁻²]
    const node: EinsteinFieldEquationNode = {
      kind: 'einstein-equation',
      lhs: buildEinstein('mu', 'nu'),
      cosmological: null,
      metric: buildMetric(),
      rhs: buildT('mu', 'nu', wrongDim),
      coupling: 'einstein',
    };

    expect(() => validateEinsteinFieldEquation(node)).toThrow(/dimension/i);
  });

  it('cosmological: null (Λ-omitted form) still validates OK', () => {
    // Decision #11: null = Λ-omitted (not Λ=0). Predicate must still pass.
    const node: EinsteinFieldEquationNode = {
      kind: 'einstein-equation',
      lhs: buildEinstein('mu', 'nu'),
      cosmological: null,
      metric: buildMetric(),
      rhs: buildT('mu', 'nu'),
      coupling: 'einstein',
    };

    const result = validateEinsteinFieldEquation(node);

    expect(result.dim).toEqual(DIM_L_INV2);
    expect(result.freeIndices.get('mu')).toEqual({ upper: 0, lower: 1 });
    expect(result.freeIndices.get('nu')).toEqual({ upper: 0, lower: 1 });
  });
});
