/**
 * SI dimensional signatures of fundamental physical constants.
 *
 * These are *dimensions only* — numerical values for the constants themselves
 * live in `src/core/types.ts` (`PhysicalConstants`). The split is intentional:
 *   - `core/types.ts` owns numeric values (CODATA 2018) for runtime computation.
 *   - this module owns the SI dimensional signatures for the validator.
 *
 * Sources for the dimensional signatures:
 *   - CODATA 2018 / NIST CODATA values: https://physics.nist.gov/cuu/Constants/
 *   - BIPM SI Brochure 9th ed. (2019)
 *   - Planck-unit derivations: Planck (1899); see Wald, "General Relativity"
 *     (1984), §G for the canonical Planck-length / Planck-time relations.
 *
 * @module dimensional/constants
 */

import {
  Dimension,
  LENGTH,
  VELOCITY,
  ACTION,
  CHARGE,
} from './types.js';

/** Reduced Planck constant ℏ — action [M L^2 T^-1]. */
export const hbar: Dimension = ACTION;

/** Speed of light c — velocity [L T^-1]. */
export const c: Dimension = VELOCITY;

/** Newton's gravitational constant G — [L^3 M^-1 T^-2]. */
export const G: Dimension = { L: 3, M: -1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

/** Boltzmann constant k_B — energy / temperature [M L^2 T^-2 Θ^-1]. */
export const k_B: Dimension = { L: 2, M: 1, T: -2, I: 0, Theta: -1, N: 0, J: 0 };

/** Elementary charge e — [T I] (coulombs). */
export const e: Dimension = CHARGE;

// --- Planck-unit shorthand (SI dimensions; numerical values not stored here). ---

/** Planck length ℓ_P — [L]. */
export const l_P: Dimension = LENGTH;
