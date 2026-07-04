/**
 * BE-11 × matter-wave interferometry — confront the decoherence master equation
 * with collisional decoherence. BE-11 is the Lindblad decoherence master
 * equation (a general framework; the confrontable quantity is a decoherence
 * RATE). Its cleanest quantitative confrontation is the collisional decoherence
 * of C70 fullerenes in a Talbot-Lau interferometer (Hornberger et al. 2003): the
 * parameter-free decoherence-theory prediction of the "decoherence pressure" p₀
 * reproduces the measured p₀ across NINE background gases (H₂, D₂, He, Ne, Ar,
 * Kr, Xe, N₂, CH₄ — masses and interaction strengths spanning ~2 orders of
 * magnitude) within the ~15% experimental uncertainty.
 *
 * This is a CONSISTENCY confrontation (the BE-23 style: agreement within error),
 * not a precise single-σ residual — the paper confronts theory vs experiment in a
 * figure (Fig 3), so there is no clean tabulated pair, and this module encodes
 * only the paper's explicitly-stated agreement (parameter-free, 9 gases, ~15%).
 * IMPORTANT: an Adam/Eve number-sourcing pass returned FABRICATED cross-sections
 * (490/510 Å² and 420/400 Å²) that do not appear in the paper; the numbers here
 * were verified against the arXiv source (quant-ph/0303093), not the reviewers.
 *
 * @module bridges/be11-decoherence-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';

/** The experimental uncertainty on the decoherence pressure p₀ (~15%). @public */
export const DECOHERENCE_EXPERIMENTAL_TOLERANCE = 0.15;

/** A collisional-decoherence theory-vs-experiment agreement observation. @public */
export interface CollisionalDecoherenceObservation {
  /** Number of background gases confronted. */
  readonly gasCount: number;
  /** Measured p₀(theory)/p₀(experiment) ratio, ≈ 1 within the tolerance. */
  readonly observed_ratio: number;
  /** Experimental fractional uncertainty on p₀. */
  readonly tolerance: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Hornberger et al. 2003 collisional-decoherence confrontation: parameter-free
 * decoherence theory reproduces the measured decoherence pressure p₀ across 9
 * gases within the ~15% experimental uncertainty.
 *
 * @public
 */
export const COLLISIONAL_HORNBERGER_2003: CollisionalDecoherenceObservation = {
  gasCount: 9,
  observed_ratio: 1.0,
  tolerance: DECOHERENCE_EXPERIMENTAL_TOLERANCE,
  provenance: {
    citation:
      'Hornberger, Uttenthaler, Brezger, Hackermuller, Arndt & Zeilinger 2003, Phys. Rev. Lett. 90:160401 (arXiv:quant-ph/0303093), "Collisional Decoherence Observed in Matter Wave Interferometry"',
    year: 2003,
    retrieved: '2026-07-04',
    note: 'PARAMETER-FREE decoherence theory ("our calculation, which contains no adjustable parameters, agrees well") reproduces the measured decoherence pressure p0 for 9 background gases (H2, D2, He, Ne, Ar, Kr, Xe, N2, CH4; masses/interaction strengths span ~2 orders of magnitude) within the ~15% experimental uncertainty (pressure measurement; theory uncertainty ~5%). CONSISTENCY confrontation (agreement within error, BE-23 style), NOT a precise residual: the paper confronts in a figure (Fig 3), no clean tabulated pair. Numbers verified against the arXiv source, NOT reviewers (an Adam/Eve pass returned fabricated cross-sections absent from the paper).',
  },
};

/** Result of confronting BE-11 with collisional-decoherence data. @public */
export interface BE11ConfrontationResult {
  /** The p₀ ratio a correct parameter-free theory yields: 1. */
  readonly predicted_ratio: number;
  /** The measured p₀(theory)/p₀(experiment) ratio. */
  readonly observed_ratio: number;
  /** |observed − predicted| — the central departure from perfect agreement. */
  readonly fractional_gap: number;
  /** The agreement holds within the experimental tolerance. */
  readonly withinTolerance: boolean;
  readonly observation: CollisionalDecoherenceObservation;
}

/**
 * Confront BE-11's decoherence master equation with collisional-decoherence data.
 * The parameter-free theory reproduces the measured decoherence pressure within
 * the experimental tolerance across the confronted gases.
 *
 * @public
 */
export function confrontBE11(
  obs: CollisionalDecoherenceObservation = COLLISIONAL_HORNBERGER_2003,
): BE11ConfrontationResult {
  const predicted_ratio = 1.0;
  const fractional_gap = Math.abs(obs.observed_ratio - predicted_ratio);
  return {
    predicted_ratio,
    observed_ratio: obs.observed_ratio,
    fractional_gap,
    withinTolerance: fractional_gap <= obs.tolerance,
    observation: obs,
  };
}
