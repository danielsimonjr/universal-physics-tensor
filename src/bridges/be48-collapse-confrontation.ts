/**
 * BE-48 × LISA-Pathfinder — confront the GRW mass-amplified localization
 * rate with the experimental upper bound on spontaneous-collapse rates
 * (Carlesso et al. 2016). BE-48 encodes the GRW single-nucleon rate
 * λ₀ = 10⁻¹⁶ s⁻¹; LISA-Pathfinder bounds the CSL rate at
 * λ ≤ 2.96×10⁻⁸ s⁻¹ (r_C = 100 nm). The GRW rate sits ~8 orders below the
 * exclusion → NOT excluded. Upper-bound-kind.
 *
 * MODEL CAVEAT: GRW and CSL are related-but-distinct collapse models; this
 * is a fail-to-exclude, not a confirmation (GRW's original rate predicts no
 * observable collapse). The same bound overlaps Adler's proposed floor
 * 10⁻⁸±² s⁻¹.
 *
 * @module bridges/be48-collapse-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';
import { evaluateGRWLocalization } from './equations/be-48-grw-localization.js';

/** A collapse-rate upper-bound observation. @public */
export interface CollapseBoundObservation {
  /** Experimental upper bound on the collapse rate (s⁻¹). */
  readonly bound_rate_per_s: number;
  /** 1σ on the bound (s⁻¹). */
  readonly bound_sigma_per_s: number;
  /** Correlation length the bound is quoted at (m). */
  readonly r_C_m: number;
  readonly provenance: ObservationProvenance;
}

/**
 * LISA-Pathfinder CSL upper bound: λ ≤ (2.96 ± 0.12)×10⁻⁸ s⁻¹ at
 * r_C = 100 nm (Carlesso et al. 2016, arXiv 1606.03637 / PRD 95:084054;
 * data Armano et al. 2016, PRL 116:231101).
 *
 * @public
 */
export const LISA_PATHFINDER_CSL: CollapseBoundObservation = {
  bound_rate_per_s: 2.96e-8,
  bound_sigma_per_s: 0.12e-8,
  r_C_m: 1e-7,
  provenance: {
    citation: 'Carlesso, Bassi, Falferi & Vinante 2016, arXiv:1606.03637 / Phys. Rev. D 95:084054 (2017); LISA-Pathfinder data Armano et al. 2016, PRL 116:231101',
    year: 2016,
    retrieved: '2026-07-02',
    note: 'CSL bound; BE-48 encodes the GRW single-nucleon rate. GRW rate ~8 orders below the exclusion: fail-to-exclude, NOT a confirmation. The bound overlaps Adler 10^-8±2 /s.',
  },
};

/** Result of confronting BE-48 with a collapse-rate bound. @public */
export interface BE48ConfrontationResult {
  /** GRW single-nucleon rate λ₀ (s⁻¹) = evaluateGRWLocalization at m = m_0. */
  readonly predicted_rate_per_s: number;
  readonly bound_rate_per_s: number;
  /** predicted ≤ bound (not excluded). */
  readonly satisfied: boolean;
  readonly observation: CollapseBoundObservation;
}

/**
 * Confront BE-48's GRW single-nucleon rate with an experimental collapse
 * bound. The single-nucleon rate is `evaluateGRWLocalization` at m = m_0
 * (mass ratio 1), i.e. exactly λ₀.
 *
 * @public
 */
export function confrontBE48(obs: CollapseBoundObservation = LISA_PATHFINDER_CSL): BE48ConfrontationResult {
  const m_0 = 1.67e-27; // nucleon mass, the GRW reference
  const predicted_rate_per_s = evaluateGRWLocalization({ m_kg: m_0, m_0_kg: m_0 });
  return {
    predicted_rate_per_s,
    bound_rate_per_s: obs.bound_rate_per_s,
    satisfied: predicted_rate_per_s <= obs.bound_rate_per_s,
    observation: obs,
  };
}
