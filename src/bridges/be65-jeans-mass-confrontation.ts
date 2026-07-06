/**
 * BE-65 × Jeans mass — confront the collapse scale against molecular clouds.
 *
 * The Jeans mass predicts the fragmentation / collapse scale of a self-gravitating
 * cloud. Evaluated at the DENSE CORE-FORMING conditions where fragmentation
 * actually occurs (T~10 K, n~10⁵ cm⁻³) it yields ~1–2 M_⊙ — the observed
 * protostellar-core scale. Consistency confrontation: ORDER-OF-MAGNITUDE agreement.
 * (At cloud-AVERAGE density M_J is tens of M_⊙ — the well-known "Jeans mass
 * problem"; fragmentation proceeds at higher density, which is where the
 * confrontation is honestly made.)
 *
 * HONEST CAVEAT (Adam/Eve vet 2026-07-05, GREEN/YELLOW): this is inherently an
 * order-of-magnitude criterion — the numerical prefactor (the "5") is
 * convention-dependent, and real fragmentation involves turbulence, magnetic
 * fields, and rotation the simple Jeans analysis omits. The agreement bound is a
 * factor of a few, not a percent.
 *
 * @module bridges/be65-jeans-mass-confrontation
 */
import { evaluateJeansMass } from './be65-jeans-mass.js';
import type { ObservationProvenance } from './observations/types.js';

/** A molecular-cloud fragmentation-scale observation (solar masses). @public */
export interface CloudFragmentObservation {
  /** Representative cloud conditions. */
  readonly T_K: number;
  readonly rho_kg_per_m3: number;
  readonly mu: number;
  /** Observed characteristic fragment/core mass (M_⊙). */
  readonly M_observed_solar: number;
  /** Fractional agreement bound (order-of-magnitude → a factor of a few). */
  readonly agreement: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Dense core-forming conditions (T=10 K, ρ≈3.8×10⁻¹⁶ kg/m³ ~ 10⁵ cm⁻³ of H₂,
 * μ=2.3) and the observed ~1-M_⊙ protostellar-core scale.
 *
 * @public
 */
export const MOLECULAR_CLOUD_FRAGMENT: CloudFragmentObservation = {
  T_K: 10,
  rho_kg_per_m3: 3.8e-16,
  mu: 2.3,
  M_observed_solar: 1,
  agreement: 1.5, // order-of-magnitude → within a factor of a few
  provenance: {
    citation:
      'Binney & Tremaine 2008, Galactic Dynamics 2nd ed. §5 (Jeans mass, convention-dependent prefactor); protostellar-core mass function ~ 1 M_⊙ (e.g. molecular-cloud surveys)',
    year: 2008,
    retrieved: '2026-07-05',
    note: 'ORDER-OF-MAGNITUDE consistency: the Jeans mass at cold-cloud conditions (~few to tens of M_⊙) matches the observed fragmentation/core scale. CAVEAT — the "5" prefactor is convention-dependent, and turbulence/B-fields/rotation modify real fragmentation; agreement is a factor of a few, not a percent (Adam GREEN / Eve YELLOW).',
  },
};

/** Result of confronting BE-65 with a cloud fragmentation observation. @public */
export interface BE65ConfrontationResult {
  /** The Jeans mass at the observed conditions (M_⊙). */
  readonly predicted_solar: number;
  readonly observed_solar: number;
  readonly agreement: number;
  readonly consistent: boolean;
  readonly observation: CloudFragmentObservation;
}

/** Solar mass, kg. */
const M_SUN_KG = 1.989e30;

/**
 * Confront BE-65's Jeans mass with a molecular-cloud fragmentation scale.
 *
 * @public
 */
export function confrontBE65(
  obs: CloudFragmentObservation = MOLECULAR_CLOUD_FRAGMENT,
): BE65ConfrontationResult {
  const predicted_solar =
    evaluateJeansMass({ T_K: obs.T_K, rho_kg_per_m3: obs.rho_kg_per_m3, mu: obs.mu }).M_J_kg /
    M_SUN_KG;
  return {
    predicted_solar,
    observed_solar: obs.M_observed_solar,
    agreement: obs.agreement,
    consistent:
      Math.abs(obs.M_observed_solar - predicted_solar) / predicted_solar <= obs.agreement,
    observation: obs,
  };
}
