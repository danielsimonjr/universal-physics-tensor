/**
 * BE-63 × Chandrasekhar mass — confront ~1.4 M_⊙ against white-dwarf masses.
 *
 * The predicted M_Ch ≈ 1.44 M_⊙ (μ_e=2) matches the observed maximum white-dwarf
 * mass (~1.35 M_⊙, the highest reliably measured) — a consistency confrontation of
 * the degeneracy-pressure upper bound.
 *
 * HONEST CAVEAT (Adam/Eve vet 2026-07-05, both YELLOW): this is an UPPER-BOUND
 * consistency test, not a precision one. Super-Chandrasekhar Type Ia SNe (SN
 * 2006gz/2007if/2009dc) imply progenitor masses up to 2.4–2.8 M_⊙ via rotation
 * and magnetic support — the limit is exceeded in nature under those conditions.
 *
 * @module bridges/be63-chandrasekhar-mass-confrontation
 */
import { evaluateChandrasekharMass } from './be63-chandrasekhar-mass.js';
import type { ObservationProvenance } from './observations/types.js';

/** An observed white-dwarf maximum-mass observation (solar masses). @public */
export interface WhiteDwarfMassObservation {
  /** Highest reliably measured white-dwarf mass (M_⊙). */
  readonly M_observed_solar: number;
  /** Fractional agreement bound. */
  readonly agreement: number;
  readonly provenance: ObservationProvenance;
}

/**
 * The observed white-dwarf maximum mass (~1.35 M_⊙) vs the Chandrasekhar limit.
 *
 * @public
 */
export const WHITE_DWARF_MAX_MASS: WhiteDwarfMassObservation = {
  M_observed_solar: 1.35,
  agreement: 0.12,
  provenance: {
    citation:
      'Shapiro & Teukolsky 1983, Black Holes, White Dwarfs and Neutron Stars §3 (M_Ch=1.44 M_⊙); observed WD max ~1.35 M_⊙; super-Chandrasekhar: Howell et al. 2006, Nature 443:308 (SN 2006gz)',
    year: 1983,
    retrieved: '2026-07-05',
    note: 'UPPER-BOUND consistency: M_Ch≈1.44 M_⊙ matches the observed WD max ~1.35 M_⊙. CAVEAT — super-Chandrasekhar Type Ia SNe (2006gz/2007if/2009dc) imply 2.4-2.8 M_⊙ via rotation/B-support; not a precision test (Adam/Eve YELLOW).',
  },
};

/** Result of confronting BE-63 with a white-dwarf mass observation. @public */
export interface BE63ConfrontationResult {
  /** The Chandrasekhar mass M_Ch (M_⊙) at μ_e=2. */
  readonly predicted_solar: number;
  /** The observed WD maximum mass (M_⊙). */
  readonly observed_solar: number;
  readonly agreement: number;
  readonly consistent: boolean;
  readonly observation: WhiteDwarfMassObservation;
}

/**
 * Confront BE-63's Chandrasekhar mass with the observed white-dwarf maximum.
 *
 * @public
 */
export function confrontBE63(
  obs: WhiteDwarfMassObservation = WHITE_DWARF_MAX_MASS,
): BE63ConfrontationResult {
  const predicted_solar = evaluateChandrasekharMass({ mu_e: 2 }).M_Ch_solar;
  return {
    predicted_solar,
    observed_solar: obs.M_observed_solar,
    agreement: obs.agreement,
    consistent: Math.abs(obs.M_observed_solar - predicted_solar) / predicted_solar <= obs.agreement,
    observation: obs,
  };
}
