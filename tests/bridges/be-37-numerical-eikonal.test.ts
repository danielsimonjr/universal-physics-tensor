import { describe, it, expect } from 'vitest';
import {
  evaluateBE37EikonalNumerical,
  evaluateShapiroDelay,
} from '../../src/bridges/equations/be-37-shapiro-delay.js';

describe('BE-37 numerical eikonal evaluator', () => {
  it('the lowered eikonal LHS g^{μν} ∂_μS ∂_νS is ≈ 0 on a null ray', async () => {
    const { eikonalResidual } = await evaluateBE37EikonalNumerical();
    // The eikonal condition for a null ray: g^{μν} ∂_μS ∂_νS = 0.
    expect(Math.abs(eikonalResidual)).toBeLessThan(1e-9);
  });

  it('the RK4-integrated Shapiro delay matches the closed form to ±1e-9 relative', async () => {
    const { integratedDelay, closedFormDelay } = await evaluateBE37EikonalNumerical();
    const relError = Math.abs(integratedDelay - closedFormDelay) / Math.abs(closedFormDelay);
    expect(relError).toBeLessThan(1e-9);
  });

  it('the closed-form delay used in the cross-check matches evaluateShapiroDelay directly', async () => {
    const { closedFormDelay, scenario } = await evaluateBE37EikonalNumerical();
    // `scenario` is exactly the ShapiroInputs shape { M_kg, R_far_m, R_near_m }.
    expect(closedFormDelay).toBeCloseTo(evaluateShapiroDelay(scenario), 12);
  });
});
