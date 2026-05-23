/**
 * Differentiable-bridge specs — v0.9 Proposal 8 Phase 2.
 *
 * Four representative `BridgeDiffSpec` registrations covering the
 * easy-AD subset of the 42-bridge catalog:
 *   - BE-37 Shapiro time delay
 *   - BE-52 Mercury perihelion precession
 *   - BE-42 Hawking temperature
 *   - BE-11 Decoherence rate
 *
 * Per P8 Eve M1-M3 reconciliation, every evaluator is called with
 * its actual struct-arg shape (NOT positional args). The exact
 * signatures were verified at HEAD:
 *   evaluateShapiroDelay(input: ShapiroInputs): number
 *   evaluatePerihelionPrecession(input: PerihelionPrecessionInputs):
 *     PerihelionPrecessionResult
 *   evaluateHawkingTemperature(input: HawkingTemperatureInputs): number
 *   evaluateDecoherenceRate(input: DecoherenceRateInputs): number
 *
 * Perihelion returns a struct; we wrap with a selector to extract
 * `dphi_rad_per_orbit` as the scalar output.
 *
 * @module diff/bridge-specs
 */

import type { BridgeDiffSpec } from './bridge-gradient.js';
import { evaluateShapiroDelay, type ShapiroInputs } from '../bridges/equations/be-37-shapiro-delay.js';
import {
  evaluatePerihelionPrecession,
  type PerihelionPrecessionInputs,
} from '../bridges/perihelion-precession.js';
import { evaluateHawkingTemperature, type HawkingTemperatureInputs } from '../bridges/equations/be-42-hawking-temperature.js';
import { evaluateDecoherenceRate, type DecoherenceRateInputs } from '../bridges/equations/be-11-decoherence-master.js';

/**
 * BE-37 — Shapiro time delay. Differentiable in: `M_kg` (lensing
 * mass), `R_far_m` (outer radial distance), `R_near_m` (inner
 * radial distance).
 *
 * @public
 */
export const BE37_SHAPIRO_DIFF: BridgeDiffSpec<ShapiroInputs> = {
  bridgeId: 'BE-37',
  name: 'Shapiro time delay',
  paramNames: ['M_kg', 'R_far_m', 'R_near_m'] as const,
  defaults: {},
  evaluate: evaluateShapiroDelay,
};

/**
 * BE-52 — Mercury perihelion precession. Differentiable in:
 * `M_kg` (central mass), `a_m` (semi-major axis), `e`
 * (eccentricity). Scalar output: `dphi_rad_per_orbit`.
 *
 * @public
 */
export const BE52_PERIHELION_DIFF: BridgeDiffSpec<PerihelionPrecessionInputs> = {
  bridgeId: 'BE-52',
  name: 'Perihelion precession (Δφ_rad_per_orbit)',
  paramNames: ['M_kg', 'a_m', 'e'] as const,
  defaults: { T_yr: 1 },
  evaluate: (input: PerihelionPrecessionInputs) =>
    evaluatePerihelionPrecession(input).dphi_rad_per_orbit,
};

/**
 * BE-42 — Hawking temperature. Differentiable in: `M_kg` (black-
 * hole mass).
 *
 * @public
 */
export const BE42_HAWKING_DIFF: BridgeDiffSpec<HawkingTemperatureInputs> = {
  bridgeId: 'BE-42',
  name: 'Hawking temperature',
  paramNames: ['M_kg'] as const,
  defaults: {},
  evaluate: evaluateHawkingTemperature,
};

/**
 * BE-11 — Decoherence rate (Caldeira-Leggett weak-coupling form).
 * Differentiable in: `gamma0_per_s` (reference rate), `lambda`
 * (system-environment coupling), `lambda0` (reference coupling).
 *
 * @public
 */
export const BE11_DECOHERENCE_DIFF: BridgeDiffSpec<DecoherenceRateInputs> = {
  bridgeId: 'BE-11',
  name: 'Decoherence rate',
  paramNames: ['gamma0_per_s', 'lambda', 'lambda0'] as const,
  defaults: {},
  evaluate: evaluateDecoherenceRate,
};

/**
 * All differentiable bridge specs shipped in v0.9. Consumers can
 * iterate this to enumerate the AD-capable subset of the catalog.
 *
 * @public
 */
export const DIFFERENTIABLE_BRIDGE_SPECS = [
  BE37_SHAPIRO_DIFF,
  BE52_PERIHELION_DIFF,
  BE42_HAWKING_DIFF,
  BE11_DECOHERENCE_DIFF,
] as const;
