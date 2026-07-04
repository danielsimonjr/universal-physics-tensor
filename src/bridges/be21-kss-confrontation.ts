/**
 * BE-21 × QGP — confront the KSS viscosity bound with the quark-gluon plasma.
 * BE-21 encodes the Kovtun-Son-Starinets universal LOWER bound η/s ≥ ℏ/(4π k_B)
 * (= 1/(4π) ≈ 0.0796 in ℏ/k_B units). The QGP produced at RHIC/LHC — the "most
 * perfect fluid" — has an extracted η/s that SATISFIES and NEARLY SATURATES the
 * bound from above. The extraction (Bayesian hydrodynamics over flow
 * observables) is independent of the bound itself, so this is a genuine
 * confrontation, not a recompute. Consistency-kind: the observed η/s APPROACHES
 * the predicted KSS bound.
 *
 * @module bridges/be21-kss-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';

/** The KSS universal lower bound on η/s, in ℏ/k_B units: 1/(4π). @public */
export const KSS_BOUND = 1 / (4 * Math.PI);

/** A QGP shear-viscosity-to-entropy observation (η/s in ℏ/k_B units). @public */
export interface QGPViscosityObservation {
  /** Representative extracted minimum η/s near T_c (ℏ/k_B units). */
  readonly observed_eta_over_s: number;
  /** The cited extraction band [low, high] (ℏ/k_B units). */
  readonly band: readonly [number, number];
  readonly provenance: ObservationProvenance;
}

/**
 * Bernhard-Moreland-Bass 2019 Bayesian extraction of the QGP η/s from RHIC/LHC
 * flow observables. η/s is temperature-dependent; the extracted minimum near T_c
 * spans ≈ 0.08–0.15 (ℏ/k_B units) across analyses — above and near the KSS bound
 * 1/(4π) ≈ 0.0796. Representative ~0.10.
 *
 * @public
 */
export const QGP_BMB19: QGPViscosityObservation = {
  observed_eta_over_s: 0.1,
  band: [0.08, 0.15],
  provenance: {
    citation:
      'Bernhard, Moreland & Bass 2019, Nature Phys. 15:1113-1117 (Bayesian eta/s extraction from RHIC/LHC heavy-ion flow observables); KSS bound: Kovtun, Son & Starinets 2005, PRL 94:111601',
    year: 2019,
    retrieved: '2026-07-04',
    note: 'eta/s is temperature-dependent; the extracted minimum near T_c spans ~0.08-0.15 (hbar/k_B units) across analyses, representative ~0.10. INDEPENDENT hydrodynamic extraction (flow observables), not a recompute of 1/(4pi). The QGP satisfies and nearly saturates the KSS lower bound — the "most perfect fluid"; the extraction band lower edge approaches the bound.',
  },
};

/** Result of confronting BE-21 with a QGP η/s extraction. @public */
export interface BE21ConfrontationResult {
  /** The KSS lower bound (ℏ/k_B units): 1/(4π). */
  readonly predicted_bound: number;
  /** The observed QGP η/s (ℏ/k_B units). */
  readonly observed_eta_over_s: number;
  /** (observed − bound)/bound — how far above the bound (0 = saturated). */
  readonly fractional_gap: number;
  /** The observed value satisfies the KSS lower bound. */
  readonly satisfiesBound: boolean;
  readonly observation: QGPViscosityObservation;
}

/**
 * Confront BE-21's KSS lower bound with a QGP η/s extraction. The prediction is
 * the bound 1/(4π); the observation approaches it from above.
 *
 * @public
 */
export function confrontBE21(
  obs: QGPViscosityObservation = QGP_BMB19,
): BE21ConfrontationResult {
  const predicted_bound = KSS_BOUND;
  const fractional_gap = (obs.observed_eta_over_s - predicted_bound) / predicted_bound;
  return {
    predicted_bound,
    observed_eta_over_s: obs.observed_eta_over_s,
    fractional_gap,
    satisfiesBound: obs.observed_eta_over_s >= predicted_bound,
    observation: obs,
  };
}
