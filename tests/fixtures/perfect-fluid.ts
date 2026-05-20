/**
 * Perfect-fluid stress-energy tensor fixture (v0.6.0 Phase 2, Task 2.6).
 *
 * Formula (Carroll §4.3, Eq. 4.36):
 *
 *   T_μν = (ρ + p/c²) u_μ u_ν + p g_μν
 *
 * where the covariant four-velocity is obtained by metric-lowering:
 *   u_μ = g_μν u^ν.
 *
 * **F-2 lock (design §F-2 reconciliation):**
 *   `massDensity` (ρ) is the REST-MASS density in [kg/m³] — NOT energy density.
 *   The energy density would be ρc², but per the F-2 convention the formula
 *   already accounts for units via the explicit (ρ + p/c²) prefactor, consistent
 *   with Carroll's presentation in SI units with the c² kept explicit.
 *
 * @module tests/fixtures/perfect-fluid
 */

import { C_SI } from '../../src/core/constants.js';

/**
 * Input bag for `perfectFluidStressEnergy`.
 *
 * @public
 */
export interface PerfectFluidInputs {
  /**
   * Rest-mass density ρ in kg/m³.
   *
   * **MASS density, NOT energy density.** The energy density (ρ c²) emerges
   * automatically from the (ρ + p/c²) u_μ u_ν term when evaluated in a
   * metric where g_μν u^μ u^ν = -c² (Carroll normalization). Pass raw
   * kg/m³ here — do NOT pre-multiply by c².
   */
  massDensity: number;

  /**
   * Isotropic pressure p in Pa (= kg·m⁻¹·s⁻²).
   */
  pressure: number;

  /**
   * Contravariant four-velocity u^μ = [u^t, u^r, u^θ, u^φ].
   *
   * Must satisfy the normalization g_μν u^μ u^ν = -c² for massive particles
   * (Carroll §4.1 — timelike worldlines). For a particle at rest in a frame
   * with g_μν = diag(-c², 1, 1, 1), the normalized rest-frame four-velocity
   * is u^μ = (1, 0, 0, 0).
   */
  fourVelocityUpper: [number, number, number, number];

  /**
   * Covariant metric tensor g_μν as a 4×4 matrix (same coordinate system as
   * `fourVelocityUpper`). Mostly-plus signature (−,+,+,+) assumed.
   */
  metric: number[][];
}

/**
 * Compute the perfect-fluid stress-energy tensor T_μν.
 *
 * Returns a 4×4 matrix:
 *   T_μν = (ρ + p/c²) u_μ u_ν + p g_μν
 *
 * where u_μ = g_μα u^α (metric-lowering of `fourVelocityUpper`).
 *
 * @param input - fluid state and geometry (see {@link PerfectFluidInputs})
 * @returns 4×4 covariant stress-energy tensor
 *
 * @public
 */
export function perfectFluidStressEnergy(input: PerfectFluidInputs): number[][] {
  const { massDensity: rho, pressure: p, fourVelocityUpper: uUp, metric: g } = input;

  const c2 = C_SI * C_SI; // (299792458)² m² s⁻²

  // Lower the four-velocity: u_μ = g_μα u^α
  const uLow: [number, number, number, number] = [0, 0, 0, 0];
  for (let mu = 0; mu < 4; mu++) {
    let s = 0;
    for (let nu = 0; nu < 4; nu++) {
      s += g[mu][nu] * uUp[nu];
    }
    uLow[mu] = s;
  }

  // T_μν = (ρ + p/c²) u_μ u_ν + p g_μν
  const prefactor = rho + p / c2;
  const T: number[][] = [
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ];
  for (let mu = 0; mu < 4; mu++) {
    for (let nu = 0; nu < 4; nu++) {
      T[mu][nu] = prefactor * uLow[mu] * uLow[nu] + p * g[mu][nu];
    }
  }
  return T;
}
