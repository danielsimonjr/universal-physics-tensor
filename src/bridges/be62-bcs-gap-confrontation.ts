/**
 * BE-62 × BCS gap ratio — confront 2Δ(0)/(k_B T_c) = 3.528 against superconductors.
 *
 * The weak-coupling BCS prediction 2π/e^γ ≈ 3.528 is matched by weak-coupling
 * elemental superconductors (Sn ≈ 3.5, Al ≈ 3.4). Consistency confrontation: the
 * weak-coupling class clusters near 3.528 within ~5%.
 *
 * HONEST CAVEAT (Adam/Eve vet 2026-07-05, Eve YELLOW): 3.528 is the WEAK-COUPLING
 * limit. Real conventional superconductors range from a little below 3.5 (Al) to
 * ~4.3 (strong-coupling Pb) and higher — Eliashberg strong-coupling corrections
 * raise the ratio. This is a material-class consistency check, not a tight test.
 *
 * @module bridges/be62-bcs-gap-confrontation
 */
import { BCS_GAP_RATIO } from './be62-bcs-gap.js';
import type { ObservationProvenance } from './observations/types.js';

/** A measured BCS gap-ratio observation (2Δ/k_B T_c). @public */
export interface BCSRatioObservation {
  /** Representative measured 2Δ(0)/(k_B T_c) for the weak-coupling class. */
  readonly ratio_measured: number;
  /** Fractional agreement bound for the weak-coupling class. */
  readonly agreement: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Weak-coupling elemental superconductors (Sn ≈ 3.5) cluster near the BCS 3.528;
 * strong-coupling (Pb ≈ 4.3) deviates upward.
 *
 * @public
 */
export const BCS_RATIO_TIN: BCSRatioObservation = {
  ratio_measured: 3.5, // Sn, weak-coupling
  agreement: 0.05,
  provenance: {
    citation:
      'Tinkham 1996, Introduction to Superconductivity 2nd ed. §3.4 (weak-coupling 2Δ/k_BT_c=3.528); Carbotte 1990, Rev. Mod. Phys. 62:1027 (Al ~3.4, Sn ~3.5, strong-coupling Pb ~4.3)',
    year: 1996,
    retrieved: '2026-07-05',
    note: 'WEAK-COUPLING consistency: Sn ~3.5, Al ~3.4 cluster near the BCS 3.528. MATERIAL-SPREAD caveat — the ratio ranges from below 3.5 (Al) to ~4.3 (strong-coupling Pb) and higher; Eliashberg strong-coupling corrections raise it. Not a tight test (Eve YELLOW).',
  },
};

/** Result of confronting BE-62 with a gap-ratio measurement. @public */
export interface BE62ConfrontationResult {
  /** The weak-coupling BCS ratio 2π/e^γ ≈ 3.528. */
  readonly predicted_ratio: number;
  /** The measured ratio. */
  readonly observed_ratio: number;
  /** Fractional agreement bound. */
  readonly agreement: number;
  /** |observed − 3.528|/3.528 within the agreement bound. */
  readonly consistent: boolean;
  readonly observation: BCSRatioObservation;
}

/**
 * Confront BE-62's BCS gap ratio with a weak-coupling measurement.
 *
 * @public
 */
export function confrontBE62(obs: BCSRatioObservation = BCS_RATIO_TIN): BE62ConfrontationResult {
  return {
    predicted_ratio: BCS_GAP_RATIO,
    observed_ratio: obs.ratio_measured,
    agreement: obs.agreement,
    consistent: Math.abs(obs.ratio_measured - BCS_GAP_RATIO) / BCS_GAP_RATIO <= obs.agreement,
    observation: obs,
  };
}
