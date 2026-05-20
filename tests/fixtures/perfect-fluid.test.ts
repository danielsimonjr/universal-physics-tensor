/**
 * Unit tests for `perfectFluidStressEnergy` (Task 2.6).
 *
 * Physics reference: Carroll, §4.3, Eq. 4.36.
 * T_μν = (ρ + p/c²) u_μ u_ν + p g_μν,  u_μ = g_μν u^ν.
 *
 * F-2 lock: ρ is MASS density [kg/m³], NOT energy density.
 */

import { describe, it, expect } from 'vitest';
import { perfectFluidStressEnergy } from './perfect-fluid.js';
import { C_SI } from '../../src/core/constants.js';

const c2 = C_SI * C_SI; // m² s⁻²
const c4 = c2 * c2;     // m⁴ s⁻⁴

describe('perfectFluidStressEnergy', () => {
  /**
   * Test (a): rest-frame T_00 with p = 0.
   *
   * Setup: g_μν = diag(-c², 1, 1, 1), u^μ = (1, 0, 0, 0).
   *   u_μ = g_μα u^α → u_0 = g_00 · 1 = -c², u_1=u_2=u_3=0.
   *   T_00 = (ρ + 0) · (-c²)(-c²) + 0 · g_00
   *         = ρ · c⁴.
   *
   * Note: In SI g_tt = -c² so g_μν u^μ u^ν = -c² for a massive particle
   * normalized to u^μ u_μ = -c² (Carroll §4.1). Here u^t = 1, so the
   * normalization is g_μν u^μ u^ν = -c²·1² = -c² ✓.
   */
  it('(a) rest-frame T_00 = ρ c⁴ for p=0 in diag(-c²,1,1,1) metric', () => {
    const rho = 1e3; // 1000 kg/m³ (water)
    const p = 0;
    const g: number[][] = [
      [-c2, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    const uUp: [number, number, number, number] = [1, 0, 0, 0];
    const T = perfectFluidStressEnergy({
      massDensity: rho,
      pressure: p,
      fourVelocityUpper: uUp,
      metric: g,
    });
    // T_00 = ρ·c⁴ = 1000 × (299792458)⁴ ≈ 8.09e50
    expect(T[0][0]).toBeCloseTo(rho * c4, -40);
    // Off-diagonals must be zero (rest frame, isotropic)
    expect(T[0][1]).toBe(0);
    expect(T[1][0]).toBe(0);
    // Spatial components: T_ii = p g_ii = 0
    expect(T[1][1]).toBe(0);
    expect(T[2][2]).toBe(0);
    expect(T[3][3]).toBe(0);
  });

  /**
   * Test (b): pressure contribution shows up in spatial diagonal entries.
   *
   * Setup: g_μν = diag(-c², 1, 1, 1), u^μ = (1, 0, 0, 0), ρ = 0.
   *   u_μ = (-c², 0, 0, 0).
   *   T_00 = (0 + p/c²) c⁴ + p(-c²) = p·c² − p·c² = 0.
   *   T_11 = (0 + p/c²) · 0 · 0 + p·1 = p.
   *   T_22 = p, T_33 = p.
   *
   * This verifies the p g_μν term populates spatial slots correctly.
   */
  it('(b) pressure-only T_11 = T_22 = T_33 = p for ρ=0 in diag(-c²,1,1,1)', () => {
    const rho = 0;
    const p = 1e5; // 1 bar in Pa
    const g: number[][] = [
      [-c2, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
    const uUp: [number, number, number, number] = [1, 0, 0, 0];
    const T = perfectFluidStressEnergy({
      massDensity: rho,
      pressure: p,
      fourVelocityUpper: uUp,
      metric: g,
    });
    // T_00 = 0 (pressure cancellation: p·c² − p·c² = 0)
    expect(Math.abs(T[0][0])).toBeLessThan(1e-6 * p * c2);
    // Spatial diagonals: T_ii = p
    expect(T[1][1]).toBeCloseTo(p, 1);
    expect(T[2][2]).toBeCloseTo(p, 1);
    expect(T[3][3]).toBeCloseTo(p, 1);
    // Off-diagonals zero
    expect(T[0][1]).toBe(0);
    expect(T[1][2]).toBe(0);
  });
});
