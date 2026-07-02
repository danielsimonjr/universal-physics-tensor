/**
 * Centralized Quantity nodes shared across domains or consumed only by
 * `edges/calibration.ts` / `edges/catalog-tranche.ts` (the cross-domain
 * anchor-cluster + tranche edges), plus the two genuinely cross-catalog nodes
 * (`cosmological-constant-curvature`, `ricci-scalar`). Split from the former
 * `quantities.ts` god-file (2026-06-22); re-exported through the `quantities.ts`
 * barrel so every importer is unchanged. Name uniqueness is pinned by
 * tests/composition/quantities.test.ts.
 *
 * @module composition/quantities/common
 */
import type { Quantity } from '../quantity.js';
import {
  AREA,
  DIMENSIONLESS,
  ENTROPY,
  FREQUENCY,
  LENGTH,
  TEMPERATURE,
  TIME,
} from '../../dimensional/types.js';
import {
  ENERGY_DIM,
  MASS_DENSITY,
  T_INV2,
  INV_AREA,
} from './_dims.js';
import { VISCOSITY_OVER_ENTROPY_DENSITY } from '../../bridges/equations/be-21-kss-bound.js';

/** Canonical node for `boundary-entanglement-entropy`. */
// rationale: feeds the Ryu-Takayanagi holographic entanglement-entropy
// bridge; AdS/CFT holographic entropy is a gravitational (bulk-geometry-dual)
// quantity by construction.
export const boundaryEntanglementEntropyQ: Quantity = {
  name: 'boundary-entanglement-entropy',
  symbol: 'S_boundary',
  dim: ENTROPY,
  attributes: { scale: 'quantum', information: 'von-neumann', force: 'gravitational' },
};
/** Canonical node for `brane-tension`. */
export const braneTensionQ: Quantity = {
  name: 'brane-tension',
  symbol: 'σ',
  dim: MASS_DENSITY,
  attributes: { force: 'gravitational' },
};
/** Canonical node for `color-number`. */
export const colorNumberQ: Quantity = {
  name: 'color-number',
  symbol: 'N_c',
  dim: DIMENSIONLESS,
  attributes: { force: 'strong' },
};
/** Canonical node for `critical-density`. */
export const criticalDensityQ: Quantity = {
  name: 'critical-density',
  symbol: 'ρ_crit',
  dim: MASS_DENSITY,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `deflection-angle`. */
export const deflectionAngleQ: Quantity = {
  name: 'deflection-angle',
  symbol: 'α',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `eccentricity`. */
export const eccentricityQ: Quantity = {
  name: 'eccentricity',
  symbol: 'e',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `far-radius`. */
export const farRadiusQ: Quantity = {
  name: 'far-radius',
  symbol: 'R_far',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `flavor-number`. */
export const flavorNumberQ: Quantity = {
  name: 'flavor-number',
  symbol: 'N_f',
  dim: DIMENSIONLESS,
  attributes: { force: 'strong' },
};
/** Canonical node for `gauge-coupling`. */
export const gaugeCouplingQ: Quantity = {
  name: 'gauge-coupling',
  symbol: 'g',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'strong' },
};
/** Canonical node for `grw-localization-rate`. */
export const grwLocalizationRateQ: Quantity = {
  name: 'grw-localization-rate',
  symbol: 'λ_GRW',
  dim: FREQUENCY,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `hawking-temperature`. */
export const hawkingTemperatureQ: Quantity = {
  name: 'hawking-temperature',
  symbol: 'T_H',
  dim: TEMPERATURE,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `hubble-rate-squared`. */
export const hubbleRateSquaredQ: Quantity = {
  name: 'hubble-rate-squared',
  symbol: 'H²',
  dim: T_INV2,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};
/** Canonical node for `impact-parameter`. */
export const impactParameterQ: Quantity = {
  name: 'impact-parameter',
  symbol: 'b',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `landauer-erasure-energy`. */
export const erasureEnergyQ: Quantity = {
  name: 'landauer-erasure-energy',
  symbol: 'E_min',
  dim: ENERGY_DIM,
  attributes: { information: 'shannon' },
};
/** Canonical node for `mass-density`. */
// rationale: BE-19 LQC-bounce input alongside critical-density/
// rescaled-cosmological-constant (both already force: gravitational) — same
// bridge family.
export const massDensityQ: Quantity = {
  name: 'mass-density',
  symbol: 'ρ',
  dim: MASS_DENSITY,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};
/** Canonical node for `minimal-surface-area`. */
export const minimalSurfaceAreaQ: Quantity = {
  name: 'minimal-surface-area',
  symbol: 'A(γ)',
  dim: AREA,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `near-radius`. */
export const nearRadiusQ: Quantity = {
  name: 'near-radius',
  symbol: 'R_near',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `perihelion-advance`. */
export const perihelionAdvanceQ: Quantity = {
  name: 'perihelion-advance',
  symbol: 'Δφ',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `rescaled-cosmological-constant`. */
export const rescaledCosmologicalConstantQ: Quantity = {
  name: 'rescaled-cosmological-constant',
  symbol: 'Λ',
  dim: T_INV2,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `schwarzschild-radius`. */
export const schwarzschildRadiusQ: Quantity = {
  name: 'schwarzschild-radius',
  symbol: 'r_s',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `semi-major-axis`. */
export const semiMajorAxisQ: Quantity = {
  name: 'semi-major-axis',
  symbol: 'a',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `shapiro-delay`. */
export const shapiroDelayQ: Quantity = {
  name: 'shapiro-delay',
  symbol: 'Δt',
  dim: TIME,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `superposition-extent`. */
export const superpositionExtentQ: Quantity = {
  name: 'superposition-extent',
  symbol: 'Δx',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `thermal-de-broglie-wavelength`. */
export const thermalDeBroglieQ: Quantity = {
  name: 'thermal-de-broglie-wavelength',
  symbol: 'λ_T',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `viscosity-entropy-ratio`. */
export const viscosityEntropyRatioQ: Quantity = {
  name: 'viscosity-entropy-ratio',
  symbol: 'η/s',
  dim: VISCOSITY_OVER_ENTROPY_DENSITY,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `yang-mills-beta`. */
export const yangMillsBetaQ: Quantity = {
  name: 'yang-mills-beta',
  symbol: 'β(g)',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'strong' },
};
/** Canonical node for `cosmological-constant-curvature` (Λ, [L⁻²]). */
export const cosmologicalConstantCurvatureQ: Quantity = {
  name: 'cosmological-constant-curvature',
  symbol: 'Λ',
  dim: INV_AREA,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};
/** Canonical node for `ricci-scalar` (R, [L⁻²]). Shared by BE-13/BE-31. */
export const ricciScalarQ: Quantity = {
  name: 'ricci-scalar',
  symbol: 'R',
  dim: INV_AREA,
  attributes: { force: 'gravitational' },
};
