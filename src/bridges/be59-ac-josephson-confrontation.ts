/**
 * BE-59 × Josephson voltage standard — confront the UNIVERSALITY, not the
 * (post-2019 definitional) K_J.
 *
 * K_J = 2e/h is exact by the SI, so confronting its value is circular. The
 * empirical content is that the Josephson frequency-to-voltage relation is
 * UNIVERSAL — independent of junction material, geometry, and temperature. This
 * universality is what lets Josephson arrays realise the volt reproducibly:
 * international comparisons of independently-built Josephson standards agree to
 * parts in 10⁹ or better. Consistency confrontation: the junction-to-junction
 * ratio is 1 to within ~1×10⁻⁹. (Adam/Eve vet 2026-07-05: GREEN/GREEN.)
 *
 * @module bridges/be59-ac-josephson-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';

/** A Josephson-volt universality (junction-independence) observation. @public */
export interface JosephsonUniversalityObservation {
  /** Measured V(junction A)/V(junction B) ratio at the same drive, ≈ 1. */
  readonly observed_ratio: number;
  /** Relative agreement bound (the universality reproducibility). */
  readonly relative_uncertainty: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Josephson-voltage-standard universality: independently-realised Josephson
 * standards (different junction materials/arrays) agree at the parts-in-10⁹
 * level — a non-circular test of the 2e/h relation's material-independence.
 *
 * @public
 */
export const JOSEPHSON_UNIVERSALITY_BIPM: JosephsonUniversalityObservation = {
  observed_ratio: 1,
  relative_uncertainty: 1e-9,
  provenance: {
    citation:
      'Kautz 1996, Rep. Prog. Phys. 59:935 ("Noise, chaos, and the Josephson voltage standard"); BIPM international comparisons of Josephson voltage standards',
    year: 1996,
    retrieved: '2026-07-05',
    note: 'Josephson-volt UNIVERSALITY: independently-built Josephson standards (different junction materials/geometries) agree to parts in 10^9 or better — a non-circular test of f=2eV/h (post-2019 SI makes K_J=2e/h exact by definition; the material-independence is the empirical content). Conservative 1e-9 bound; the best comparisons reach ~1e-10 to 1e-11.',
  },
};

/** Result of confronting BE-59 with a universality observation. @public */
export interface BE59ConfrontationResult {
  readonly predicted_ratio: number;
  readonly observed_ratio: number;
  readonly relative_uncertainty: number;
  readonly consistent: boolean;
  readonly observation: JosephsonUniversalityObservation;
}

/**
 * Confront BE-59's Josephson relation with a junction-universality test.
 *
 * @public
 */
export function confrontBE59(
  obs: JosephsonUniversalityObservation = JOSEPHSON_UNIVERSALITY_BIPM,
): BE59ConfrontationResult {
  return {
    predicted_ratio: 1,
    observed_ratio: obs.observed_ratio,
    relative_uncertainty: obs.relative_uncertainty,
    consistent: Math.abs(obs.observed_ratio - 1) <= obs.relative_uncertainty,
    observation: obs,
  };
}
