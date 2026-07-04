/**
 * BE-35 × 3D Ising — confront the conformal-bootstrap prediction of the 3D Ising
 * critical exponent against experiment. BE-35 encodes the conformal-bootstrap
 * crossing equation; its flagship empirical consequence is the 3D Ising
 * universality-class critical exponents, which the numerical bootstrap pins
 * parameter-free. The correlation-length exponent ν = 1/(3 − Δ_ε) (from the
 * bootstrap operator dimension Δ_ε) confronts the ν measured at real 3D-Ising
 * critical points (liquid-vapor / binary-fluid systems) — an INDEPENDENT
 * determination, not a recompute.
 *
 * Honest caveat: the experimental precision (±0.002) is far coarser than the
 * bootstrap (±0.000004), so this confirms CONSISTENCY (the parameter-free CFT
 * prediction agrees with a real critical system) rather than stress-testing the
 * bootstrap. See the BE-35 confrontation design.
 *
 * @module bridges/be35-bootstrap-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';
import { residualInSigma } from './observations/types.js';

/** The conformal-bootstrap prediction of the 3D Ising ν exponent. @public */
export const BOOTSTRAP_NU = 0.629971;
/** 1σ on the bootstrap ν (from Δ_ε = 1.412625(10)). @public */
export const BOOTSTRAP_NU_SIGMA = 0.000004;

/** An independent measurement of the 3D-Ising correlation-length exponent ν. @public */
export interface IsingExponentObservation {
  /** Measured correlation-length exponent ν. */
  readonly observed_nu: number;
  /** 1σ uncertainty on ν. */
  readonly sigma: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Experimental 3D-Ising correlation-length exponent ν, averaged over liquid-vapor
 * and binary-fluid critical points (systems in the 3D Ising universality class).
 * ν = 0.630 ± 0.002.
 *
 * @public
 */
export const ISING_PELISSETTO_VICARI_2002: IsingExponentObservation = {
  observed_nu: 0.63,
  sigma: 0.002,
  provenance: {
    citation:
      'Pelissetto & Vicari 2002, Phys. Rep. 368:549 ("Critical phenomena and renormalization-group theory"); experimental average over liquid-vapor / binary-fluid critical points (3D Ising universality class). Bootstrap prediction: Kos, Poland, Simmons-Duffin & Vichi 2016, JHEP 08:036 (arXiv:1603.04436), Delta_epsilon = 1.412625(10)',
    year: 2002,
    retrieved: '2026-07-04',
    note: 'INDEPENDENT determination (real critical systems), not a recompute of the bootstrap. Experimental precision (+/-0.002) is far coarser than the bootstrap (+/-0.000004): this confirms consistency of the parameter-free CFT prediction with a physical critical system, not a precision stress-test. Monte-Carlo values (e.g. Hasenbusch 2010, 0.63002(10)) were deliberately NOT used for the observed slot — bootstrap-vs-MC would be theory-vs-theory, not a data confrontation.',
  },
};

/** Result of confronting BE-35 with a measured 3D-Ising exponent. @public */
export interface BE35ConfrontationResult {
  /** Bootstrap-predicted ν. */
  readonly predicted_nu: number;
  /** Measured ν. */
  readonly observed_nu: number;
  /** 1σ on the measured ν. */
  readonly observed_sigma: number;
  /** |predicted − observed| in units of the observed 1σ. */
  readonly residual_in_sigma: number;
  /** The prediction lies within 1σ of the measurement. */
  readonly withinObserved: boolean;
  readonly observation: IsingExponentObservation;
}

/**
 * Confront BE-35's conformal-bootstrap 3D-Ising ν against a measured exponent.
 *
 * @public
 */
export function confrontBE35(
  obs: IsingExponentObservation = ISING_PELISSETTO_VICARI_2002,
): BE35ConfrontationResult {
  const residual_in_sigma = residualInSigma(BOOTSTRAP_NU, obs.observed_nu, obs.sigma);
  return {
    predicted_nu: BOOTSTRAP_NU,
    observed_nu: obs.observed_nu,
    observed_sigma: obs.sigma,
    residual_in_sigma,
    withinObserved: residual_in_sigma <= 1,
    observation: obs,
  };
}
