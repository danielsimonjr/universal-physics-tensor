/**
 * Tier-5 STRUCTURAL test for BE-37 — v0.3.0 metric-layer encoding.
 *
 * Asserts that the v0.3.0 eikonal null-geodesic form
 *
 *   g^μν (∂_μ S)(∂_ν S) = 0
 *
 * is dimensionally homogeneous, contracts to a scalar (no free indices),
 * and is structurally grounded in the v0.3.0 metric-layer primitives
 * (`metric-tensor` and `tensor-partial-derivative` AST kinds).
 *
 * The v0.2.1 scalar form `Δt = (2GM/c³) · ln(R_far/R_near)` continues to
 * live alongside this structural form as the numerical-evaluator surface;
 * it is exercised by tests/bridges/be-37-shapiro-encoding.test.ts. THIS
 * test covers the v0.3.0 STRUCTURAL ORIGIN of that scalar — the
 * null-geodesic eikonal in curved spacetime.
 *
 * Per docs/planning/v0.3.0-Implementation-Plan.md Task 13,
 * docs/planning/v0.3.0-Bridge-Selection.md (Pareto choice rationale),
 * and docs/specification/Part-VIII-Metric-Layer.md §VIII.8.
 *
 * @see src/bridges/equations/be-37-shapiro-delay.ts
 */

import { describe, it, expect } from 'vitest';
import {
  BE37_EIKONAL_LHS,
  BE37_EIKONAL_RHS_ZERO,
  validateBE37EikonalDimensions,
} from '../../src/bridges/equations/be-37-shapiro-delay.js';
import { validate, validateEquation } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { DIMENSIONLESS } from '../../src/dimensional/types.js';

/** Small recursive helper: does the AST contain a node with the given kind? */
function hasKind(node: unknown, target: string): boolean {
  if (node === null || typeof node !== 'object') return false;
  const n = node as { kind?: string; args?: unknown[]; of?: unknown; wrt?: unknown };
  if (n.kind === target) return true;
  if (Array.isArray(n.args)) {
    for (const child of n.args) {
      if (hasKind(child, target)) return true;
    }
  }
  // tensor-partial-derivative carries its operands on `of` / `wrt`, not `args`.
  if (n.of !== undefined && hasKind(n.of, target)) return true;
  if (n.wrt !== undefined && hasKind(n.wrt, target)) return true;
  return false;
}

describe('BE-37 Shapiro — v0.3.0 eikonal STRUCTURAL form (Task 13)', () => {
  it('validateEquation(LHS, RHS_ZERO) reports ok with zero violations', () => {
    const result = validateEquation(BE37_EIKONAL_LHS, BE37_EIKONAL_RHS_ZERO);
    expect(result.ok).toBe(true);
    expect(result.violations).toEqual([]);
  });

  it('validateBE37EikonalDimensions returns ok with both sides DIMENSIONLESS', () => {
    const report = validateBE37EikonalDimensions();
    expect(report.ok).toBe(true);
    expect(report.lhsDim).toEqual(DIMENSIONLESS);
    expect(report.rhsDim).toEqual(DIMENSIONLESS);
  });

  it('both sides have no free indices (eikonal LHS is a scalar contraction; RHS is the literal zero)', () => {
    const lhs = validate(BE37_EIKONAL_LHS);
    const rhs = validate(BE37_EIKONAL_RHS_ZERO);
    expect(lhs.ok).toBe(true);
    expect(rhs.ok).toBe(true);
    expect(lhs.freeIndices.size).toBe(0);
    expect(rhs.freeIndices.size).toBe(0);
  });

  it("AST contains both 'metric-tensor' and 'tensor-partial-derivative' kinds (proves v0.3.0 surface)", () => {
    // Structural assertion: the LHS isn't faking out the metric-layer
    // surface — it actually instantiates both new AST node kinds added
    // in v0.3.0. This is the load-bearing claim that BE-37's structural
    // form genuinely exercises the metric-layer primitives.
    expect(hasKind(BE37_EIKONAL_LHS, 'metric-tensor')).toBe(true);
    expect(hasKind(BE37_EIKONAL_LHS, 'tensor-partial-derivative')).toBe(true);
  });
});
