/**
 * Canonical CODATA 2018 + SI-defined physical constants for UPT (v0.5.1).
 *
 * Single source of truth for fundamental physical constants used across the
 * numerical, dimensional, and bridge layers. Replaces the truncated local
 * literals (`c_SI = 2.998e8`, etc.) that drifted across `src/numerical/`,
 * `src/bridges/`, and `tests/fixtures/` — see audit `PC-1` in
 * `docs/architecture/archive/v0.5.1-audit.md`.
 *
 * Values use:
 *   • Exact-SI definitions (`C_SI`, `H_SI`, `K_B_SI`, `E_SI`) where the
 *     2019 SI redefinition fixed their values exactly.
 *   • CODATA 2018 best estimates for measured constants (`G_SI`, `HBAR_SI`,
 *     `ALPHA`, Planck units).
 *   • Planck 2018 best estimate for `H0_SI`.
 *
 * The `PhysicalConstants` namespace in `src/core/types.ts` is retained for
 * backwards-compat; new code should prefer these flat exports.
 *
 * @module core/constants
 * @public
 */

/** Speed of light in vacuum (m/s). Exact SI definition since 1983. */
export const C_SI = 299792458;

/** Newtonian gravitational constant (m³ kg⁻¹ s⁻²). CODATA 2018. */
export const G_SI = 6.67430e-11;

/** Planck constant (J·s). Exact SI definition since 2019. */
export const H_SI = 6.62607015e-34;

/** Reduced Planck constant h/(2π) (J·s). CODATA 2018. */
export const HBAR_SI = 1.054571817e-34;

/** Boltzmann constant (J/K). Exact SI definition since 2019. */
export const K_B_SI = 1.380649e-23;

/** Elementary charge (C). Exact SI definition since 2019. */
export const E_SI = 1.602176634e-19;

/** Fine-structure constant α (dimensionless). CODATA 2018. */
export const ALPHA = 7.2973525693e-3;

/** Planck mass √(ℏc/G) (kg). CODATA 2018. */
export const M_P_SI = 2.176434e-8;

/** Planck length √(ℏG/c³) (m). CODATA 2018. */
export const L_P_SI = 1.616255e-35;

/** Planck time √(ℏG/c⁵) (s). CODATA 2018. */
export const T_P_SI = 5.391247e-44;

/**
 * Hubble parameter H₀ (s⁻¹).
 *
 * Planck 2018 TT,TE,EE+lowE+lensing best estimate: 67.4 km/s/Mpc, converted
 * to SI using 1 Mpc = 3.0857×10²² m.
 */
export const H0_SI = 67.4e3 / 3.0857e22;

/**
 * Solar mass (kg). IAU 2015 nominal value rounded to the
 * repo-conventional literal (used by the BE-42 docstring, the
 * bridge-gradient tests, and the v0.8.0 calibration edges).
 * @public
 */
export const M_SUN_SI = 1.989e30;

/**
 * Electron mass (kg), CODATA 2018. Added for the v0.11 namespacing
 * gate's criterion-3 pin (λ_T of an electron at the Hawking
 * temperature — see the Adam vet A-5).
 * @public
 */
export const M_E_SI = 9.1093837015e-31;
