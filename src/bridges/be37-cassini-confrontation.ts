/**
 * BE-37 × Cassini — confront the Shapiro-delay bridge with the Cassini
 * radio-link measurement of the PPN parameter γ (Bertotti, Iess & Tortora
 * 2003). BE-37 encodes the γ=1 general-relativistic Shapiro delay, so the
 * bridge PREDICTS γ = 1 exactly; the confrontation observable is the
 * measured γ. This is the framework's first Shapiro/PPN data confrontation
 * (be-37 has a numerical validation anchor but no data confrontation before
 * this). Value-kind.
 *
 * @module bridges/be37-cassini-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';
import { residualInSigma } from './observations/types.js';

/** A PPN-γ observation record. @public */
export interface CassiniObservation {
  /** Measured PPN parameter γ (dimensionless). */
  readonly observed_gamma: number;
  /** 1σ on the measured γ. */
  readonly observed_gamma_sigma: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Cassini 2002 solar-conjunction Shapiro-delay determination of γ:
 * γ = 1 + (2.1 ± 2.3)×10⁻⁵ (Bertotti-Iess-Tortora 2003, Nature 425:374).
 *
 * @public
 */
export const CASSINI: CassiniObservation = {
  observed_gamma: 1 + 2.1e-5,
  observed_gamma_sigma: 2.3e-5,
  provenance: {
    citation: 'Bertotti, Iess & Tortora 2003, Nature 425:374-376 (Cassini radio-link Shapiro delay, June 2002 solar conjunction)',
    year: 2003,
    retrieved: '2026-07-02',
    note: 'BE-37 encodes the gamma=1 GR Shapiro form, so the predicted PPN gamma is exactly 1; the observable confronted is Cassini gamma.',
  },
};

/** Result of confronting BE-37 with a PPN-γ measurement. @public */
export interface BE37ConfrontationResult {
  /** BE-37 predicts γ = 1 (GR Shapiro form). */
  readonly predicted_gamma: number;
  readonly observed_gamma: number;
  readonly residual_in_sigma: number;
  readonly withinObserved: boolean;
  readonly observation: CassiniObservation;
}

/**
 * Confront BE-37's γ=1 Shapiro prediction with the Cassini γ measurement.
 *
 * @public
 */
export function confrontBE37(obs: CassiniObservation = CASSINI): BE37ConfrontationResult {
  const predicted_gamma = 1;
  const residual_in_sigma = residualInSigma(predicted_gamma, obs.observed_gamma, obs.observed_gamma_sigma);
  return {
    predicted_gamma,
    observed_gamma: obs.observed_gamma,
    residual_in_sigma,
    withinObserved: residual_in_sigma <= 1,
    observation: obs,
  };
}
