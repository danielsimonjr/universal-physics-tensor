/**
 * BE-52 × Mercury — confront the GR perihelion-precession bridge with the
 * classic measured anomalous advance of Mercury's perihelion.
 *
 * This is the catalog's second committed real-data confrontation, and the first
 * for an *established* bridge: BE-52 encodes Einstein's 1915 result
 * `Δφ = 6πGM/(a(1−e²)c²)`, whose Mercury value (~43″/century) was the original
 * empirical triumph of general relativity. We recompute the bridge's prediction
 * from Mercury's orbital elements and confront it with the *observed* anomalous
 * precession — the residual left after subtracting the Newtonian planetary
 * perturbations (Le Verrier / Newcomb / Clemence).
 *
 *   observed anomalous advance: 43.11 ± 0.45 ″/century (Clemence 1947); the
 *   modern GR value is 42.98 ″/century, comfortably inside this band.
 *
 * @module bridges/be52-mercury-confrontation
 */

import { evaluatePerihelionPrecession } from './perihelion-precession.js';

/**
 * A perihelion-precession observation record for a planet.
 *
 * @public
 */
export interface PerihelionObservation {
  /** Central mass (kg) — the Sun for Mercury. */
  readonly central_mass_kg: number;
  /** Orbital semi-major axis (m). */
  readonly semi_major_axis_m: number;
  /** Orbital eccentricity (0 ≤ e < 1). */
  readonly eccentricity: number;
  /** Orbital period (Julian years). */
  readonly period_yr: number;
  /** Measured ANOMALOUS perihelion advance (″/Julian century) — the GR residual. */
  readonly observed_precession_arcsec_per_century: number;
  /** 1σ uncertainty on the observed anomalous advance (″/century). */
  readonly observed_sigma_arcsec_per_century: number;
  readonly citation: string;
}

/**
 * Mercury's orbital elements + the classic measured anomalous perihelion
 * advance. Orbital elements: NASA planetary fact sheet (J2000). Observed
 * anomalous advance: Clemence's determination.
 *
 * @public
 */
export const MERCURY: PerihelionObservation = {
  central_mass_kg: 1.98892e30,
  semi_major_axis_m: 5.79091e10,
  eccentricity: 0.205630,
  period_yr: 0.2408467, // 87.969 d / 365.25
  observed_precession_arcsec_per_century: 43.11,
  observed_sigma_arcsec_per_century: 0.45,
  citation:
    'Clemence 1947, Rev. Mod. Phys. 19:361 (anomalous advance 43.11±0.45 ″/cy); ' +
    'orbital elements NASA Mercury fact sheet (J2000); Einstein 1915 SPAW 831.',
};

/**
 * Result of confronting BE-52 with a measured perihelion advance.
 *
 * @public
 */
export interface BE52ConfrontationResult {
  /** BE-52's GR prediction for this orbit (″/Julian century). */
  readonly predicted_arcsec_per_century: number;
  /** The measured anomalous advance (″/century). */
  readonly observed_arcsec_per_century: number;
  /** predicted − observed (″/century). */
  readonly residual_arcsec_per_century: number;
  /** |residual| in units of the observed 1σ. */
  readonly residual_in_sigma: number;
  /** Whether the prediction lies within 1σ of the observation. */
  readonly withinObserved: boolean;
  readonly observation: PerihelionObservation;
}

/**
 * Recompute BE-52's GR perihelion advance for an orbit and confront it with the
 * measured anomalous precession (G-3: confrontation with real data, not
 * reproduction of a closed form — here for an established bridge).
 *
 * @public
 */
export function confrontBE52(
  obs: PerihelionObservation = MERCURY,
): BE52ConfrontationResult {
  if (!(Number.isFinite(obs.observed_sigma_arcsec_per_century) && obs.observed_sigma_arcsec_per_century > 0)) {
    throw new RangeError('confrontBE52: observed_sigma must be finite and > 0');
  }
  // evaluatePerihelionPrecession validates mass/axis/eccentricity/period.
  const pred = evaluatePerihelionPrecession({
    M_kg: obs.central_mass_kg,
    a_m: obs.semi_major_axis_m,
    e: obs.eccentricity,
    T_yr: obs.period_yr,
  });
  const predicted = pred.dphi_arcsec_per_century;
  const observed = obs.observed_precession_arcsec_per_century;
  const residual = predicted - observed;
  const residual_in_sigma =
    Math.abs(residual) / obs.observed_sigma_arcsec_per_century;
  return {
    predicted_arcsec_per_century: predicted,
    observed_arcsec_per_century: observed,
    residual_arcsec_per_century: residual,
    residual_in_sigma,
    withinObserved: residual_in_sigma <= 1,
    observation: obs,
  };
}
