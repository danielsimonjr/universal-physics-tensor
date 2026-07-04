/**
 * BE-51 × VLBI — confront the gravitational-lensing bridge with the modern
 * VLBI determination of the PPN parameter γ via solar light deflection
 * (Lambert & Le Poncin-Lafitte 2009). BE-51 encodes the γ=1 GR deflection
 * α = 4GM/(bc²), so the bridge PREDICTS the solar-limb deflection at γ=1
 * (≈ 1.75 arcsec, computed by `evaluateGravitationalLensing`). The observed
 * deflection is the VLBI-measured γ applied to that same limb baseline — a
 * genuine test of γ vs 1 through light *deflection*, complementary to be-37's
 * γ via Shapiro *delay* (the same PPN parameter through two independent
 * experiments: radio-source astrometry vs spacecraft ranging). This is the
 * third classic test of general relativity in the confrontation registry,
 * joining be-52 (Mercury perihelion) and be-37 (Shapiro delay). Value-kind.
 *
 * @module bridges/be51-lensing-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';
import { residualInSigma } from './observations/types.js';
import { evaluateGravitationalLensing } from './gravitational-lensing.js';

/** Solar mass (kg), IAU/CODATA nominal — matches be-37/be-52 usage. Internal:
 *  the confrontation's fixed baseline, not part of the public surface. */
const SOLAR_MASS_KG = 1.989e30;
/** Solar radius (m) — the grazing-ray impact parameter (matches be-37). Internal. */
const SOLAR_RADIUS_M = 6.957e8;

/** A VLBI PPN-γ (light-deflection) observation record. @public */
export interface VLBIDeflectionObservation {
  /** Measured PPN parameter γ (dimensionless). */
  readonly observed_gamma: number;
  /** 1σ on the measured γ. */
  readonly observed_gamma_sigma: number;
  readonly provenance: ObservationProvenance;
}

/**
 * VLBI solar light-deflection determination of γ:
 * γ − 1 = (−0.8 ± 1.2)×10⁻⁴ (Lambert & Le Poncin-Lafitte 2009, A&A 499:331;
 * compiled in Will 2014, Living Rev. Relativity 17:4).
 *
 * @public
 */
export const VLBI_LAMBERT_2009: VLBIDeflectionObservation = {
  observed_gamma: 1 - 0.8e-4,
  observed_gamma_sigma: 1.2e-4,
  provenance: {
    citation:
      'Lambert & Le Poncin-Lafitte 2009, A&A 499:331-336 (geodetic VLBI light-deflection determination of PPN gamma); compiled in Will 2014, Living Rev. Relativity 17:4',
    year: 2009,
    retrieved: '2026-07-04',
    note: 'BE-51 encodes the gamma=1 GR deflection alpha=4GM/(bc^2); predicted is the solar-limb deflection from evaluateGravitationalLensing(M_sun, R_sun). Observed = measured (1+gamma)/2 applied to that same limb baseline (the baseline is pure physical constants, not GR theory), so this is a genuine test of gamma vs 1 via deflection — complementary to be-37 (gamma via Shapiro delay).',
  },
};

/** Result of confronting BE-51 with a VLBI deflection measurement. @public */
export interface BE51ConfrontationResult {
  /** GR (γ=1) solar-limb deflection from the bridge evaluator (arcsec). */
  readonly predicted_arcsec: number;
  /** Observed deflection: (1+γ)/2 × predicted (arcsec). */
  readonly observed_arcsec: number;
  /** 1σ on the observed deflection (arcsec). */
  readonly observed_sigma_arcsec: number;
  readonly residual_in_sigma: number;
  readonly withinObserved: boolean;
  readonly observation: VLBIDeflectionObservation;
}

/**
 * Confront BE-51's GR solar-limb deflection with the VLBI γ measurement.
 * The predicted value comes from the bridge's own evaluator; the observed
 * value is the measured (1+γ)/2 scaling of that same baseline.
 *
 * @public
 */
export function confrontBE51(
  obs: VLBIDeflectionObservation = VLBI_LAMBERT_2009,
): BE51ConfrontationResult {
  const predicted_arcsec = evaluateGravitationalLensing({
    M_kg: SOLAR_MASS_KG,
    b_m: SOLAR_RADIUS_M,
  }).alpha_arcsec;
  const scaling = (1 + obs.observed_gamma) / 2;
  const observed_arcsec = scaling * predicted_arcsec;
  const observed_sigma_arcsec = (obs.observed_gamma_sigma / 2) * predicted_arcsec;
  const residual_in_sigma = residualInSigma(
    predicted_arcsec,
    observed_arcsec,
    observed_sigma_arcsec,
  );
  return {
    predicted_arcsec,
    observed_arcsec,
    observed_sigma_arcsec,
    residual_in_sigma,
    withinObserved: residual_in_sigma <= 1,
    observation: obs,
  };
}
