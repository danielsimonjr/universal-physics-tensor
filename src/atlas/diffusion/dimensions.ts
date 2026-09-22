/**
 * Dimension constants the diffusion family needs that the canonical entry
 * files declare MODULE-LOCAL and do not export.
 *
 * Redefined here with the same `dim(...)` arguments as their sources, the same
 * discipline as `oscillators/dimensions.ts`. `tests/atlas/diffusion.test.ts`
 * asserts the values against the canonical registry, so a future divergence
 * fails a test rather than silently forking the physics.
 *
 * @module atlas/diffusion/dimensions
 */

import { dim } from '../../dimensional/ast-builders.js';
import type { Dimension } from '../../dimensional/types.js';

/** m²/s, `L^2 T^-1` — `src/canonical/entries/thermo-nuclear-cosmo.ts:44`. @internal */
export const DIFFUSIVITY: Dimension = dim(2, 0, -1);

/** W·m⁻¹·K⁻¹, `L M T^-3 Θ^-1` — `src/canonical/entries/thermo-nuclear-cosmo.ts:42`. @internal */
export const THERMAL_CONDUCTIVITY: Dimension = dim(1, 1, -3, 0, -1);

/** kg/m³, `L^-3 M` — `src/canonical/entries/thermo-nuclear-cosmo.ts:43`. @internal */
export const DENSITY: Dimension = dim(-3, 1);

/** J·kg⁻¹·K⁻¹, `L^2 T^-2 Θ^-1` — `src/canonical/entries/thermo-nuclear-cosmo.ts:35`. @internal */
export const SPECIFIC_HEAT: Dimension = dim(2, 0, -2, 0, -1);
