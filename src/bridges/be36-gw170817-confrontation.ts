/**
 * BE-36 × GW170817 — the first real-data confrontation (v0.8.0 T5,
 * per docs/planning/v0.8.0-Design.md §4 + r2-2/r2-3).
 *
 * Recomputes the published GW170817/GRB 170817A graviton-speed bounds
 * from the observation record and confronts BE-36's encoded bound:
 *
 *   upper = +c·Δt_obs / D          (attributes the whole observed
 *                                   1.74 s lag to faster GW travel)
 *   lower = −c·(t_delay,max − Δt_obs) / D
 *                                  (assumes a 10 s intrinsic EM
 *                                   emission delay, of which only
 *                                   1.74 s materialized)
 *
 * with the paper's CONSERVATIVE lower distance bound D = 26 Mpc
 * (not the 40 Mpc central value). Published result:
 * −3×10⁻¹⁵ ≤ (c_GW − c)/c ≤ +7×10⁻¹⁶ (1 significant figure;
 * Abbott et al. 2017 ApJL 848:L13 §3, arXiv:1710.05832).
 *
 * BE-36's encoded bound is SYMMETRIC (|ratio| ≤ 10⁻¹⁵,
 * `GW170817_SPEED_BOUND`); the published bound is asymmetric and its
 * negative side (−3×10⁻¹⁵) lies OUTSIDE the symmetric encoding.
 * `passesEncodedBound` therefore refers to the positive (GW-faster)
 * side only — see the result fields for the honest breakdown.
 *
 * @module bridges/be36-gw170817-confrontation
 */

import { C_SI } from '../core/constants.js';
import { GW170817_SPEED_BOUND } from './equations/be-36-gw-speed-bound.js';

/** Metres per megaparsec (repo-conventional literal, cf. H0_SI). */
const MPC_M = 3.0857e22;

/**
 * A multi-messenger speed-bound observation record.
 *
 * @public
 */
export interface GWSpeedObservation {
  /** Observed GW-merger → EM-onset lag (s). */
  readonly dt_obs_s: number;
  /** 1σ uncertainty on the lag (s). */
  readonly dt_obs_err_s: number;
  /** Central luminosity distance (Mpc). */
  readonly distance_central_mpc: number;
  /** Conservative LOWER distance bound used for the speed constraint (Mpc). */
  readonly distance_lower_mpc: number;
  /** Maximum assumed intrinsic EM-emission delay (s). */
  readonly emission_delay_max_s: number;
  readonly citation: string;
}

/**
 * The GW170817 / GRB 170817A observation (LIGO/Virgo + Fermi-GBM +
 * INTEGRAL).
 *
 * @public
 */
export const GW170817: GWSpeedObservation = {
  dt_obs_s: 1.74,
  dt_obs_err_s: 0.05,
  distance_central_mpc: 40,
  distance_lower_mpc: 26,
  emission_delay_max_s: 10,
  citation:
    'Abbott et al. 2017 ApJ Lett. 848:L13 (arXiv:1710.05832), §3 ' +
    '"Speed of Gravity"',
};

/**
 * Result of confronting BE-36 with a speed-bound observation.
 *
 * @public
 */
export interface BE36ConfrontationResult {
  /** Recomputed upper bound on (c_GW − c)/c (positive, GW-faster side). */
  readonly upperBound: number;
  /** Recomputed lower bound on (c_GW − c)/c (negative, GW-slower side). */
  readonly lowerBound: number;
  /** Conservative distance used (m). */
  readonly distance_m: number;
  /**
   * Whether the recomputed POSITIVE side satisfies BE-36's encoded
   * |ratio| ≤ 1e-15. The encoded bound is symmetric; the published
   * negative side (−3e-15) does not satisfy it — see `note`.
   */
  readonly passesEncodedBound: boolean;
  /** BE-36's encoded bound is two-sided (`Math.abs`). */
  readonly encodedBoundIsSymmetric: true;
  readonly encodedBound: number;
  readonly note: string;
  readonly observation: GWSpeedObservation;
}

/**
 * Recompute the GW170817-style speed bounds from an observation record
 * and confront BE-36's encoded bound (v0.8.0 G-3 — the framework's
 * first confrontation with real experimental data rather than
 * reproduction of a closed form).
 *
 * @public
 */
export function confrontBE36(
  obs: GWSpeedObservation = GW170817,
): BE36ConfrontationResult {
  if (!(Number.isFinite(obs.dt_obs_s) && obs.dt_obs_s > 0)) {
    throw new RangeError('confrontBE36: dt_obs_s must be finite and > 0');
  }
  if (!(Number.isFinite(obs.distance_lower_mpc) && obs.distance_lower_mpc > 0)) {
    throw new RangeError(
      'confrontBE36: distance_lower_mpc must be finite and > 0',
    );
  }
  if (
    !(
      Number.isFinite(obs.emission_delay_max_s) &&
      obs.emission_delay_max_s >= obs.dt_obs_s
    )
  ) {
    throw new RangeError(
      'confrontBE36: emission_delay_max_s must be finite and ≥ dt_obs_s ' +
        '(the lower bound assumes the intrinsic delay exceeds the observed lag)',
    );
  }

  const distance_m = obs.distance_lower_mpc * MPC_M;
  const upperBound = (C_SI * obs.dt_obs_s) / distance_m;
  const lowerBound =
    (-C_SI * (obs.emission_delay_max_s - obs.dt_obs_s)) / distance_m;

  return {
    upperBound,
    lowerBound,
    distance_m,
    passesEncodedBound: upperBound <= GW170817_SPEED_BOUND,
    encodedBoundIsSymmetric: true,
    encodedBound: GW170817_SPEED_BOUND,
    note:
      'The encoded BE-36 bound |ratio| ≤ 1e-15 is a symmetric ' +
      'simplification; the published bound is asymmetric ' +
      '(−3e-15 ≤ ratio ≤ +7e-16) and its negative side exceeds the ' +
      'symmetric encoding. passesEncodedBound refers to the positive ' +
      'side only.',
    observation: obs,
  };
}
