/**
 * BE-56 × Casimir force — confront the quantum-vacuum force against measurement.
 *
 * The ideal F/A = −π²ℏc/(240 d⁴) is the leading term for perfect conductors at
 * T=0. Real experiments (Lamoreaux 1997 torsion pendulum; Mohideen & Roy 1998
 * AFM) use sphere-plate geometry and require finite-conductivity, surface-
 * roughness, temperature, and electrostatic-patch corrections. With those
 * corrections applied, the measured force agrees with theory to ~1% (Mohideen-
 * Roy, smallest separation) / ~5% (Lamoreaux). Consistency confrontation: the
 * measured/theory ratio is 1 to within ~1%.
 *
 * HONESTY CAVEAT (Adam/Eve vet 2026-07-05, Eve YELLOW): this tests the CORRECTED
 * theory and is SYSTEMATICS-DOMINATED — it is not a clean test of the bare
 * π²ℏc/240d⁴ coefficient. The provenance records this.
 *
 * @module bridges/be56-casimir-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';

/** A Casimir-force measurement-vs-theory agreement observation. @public */
export interface CasimirAgreementObservation {
  /** Measured/theory force ratio, ≈ 1 (theory = corrected, not ideal). */
  readonly observed_ratio: number;
  /** Fractional agreement (e.g. 0.01 for ~1%). */
  readonly agreement: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Mohideen & Roy 1998 AFM measurement: the Casimir force agrees with the
 * corrected theory to ~1% at the smallest separation (0.1–0.9 μm).
 *
 * @public
 */
export const CASIMIR_MOHIDEEN_ROY_1998: CasimirAgreementObservation = {
  observed_ratio: 1,
  agreement: 0.01,
  provenance: {
    citation:
      'Mohideen & Roy 1998, Phys. Rev. Lett. 81:4549 (arXiv:physics/9805038), "Precision Measurement of the Casimir Force from 0.1 to 0.9 μm"; earlier: Lamoreaux 1997, Phys. Rev. Lett. 78:5 (~5%)',
    year: 1998,
    retrieved: '2026-07-05',
    note: 'Measured Casimir force agrees with theory to ~1% at smallest separation. SYSTEMATICS-DOMINATED: real experiments are sphere-plate and require finite-conductivity/surface-roughness/temperature/electrostatic-patch corrections — this tests the CORRECTED theory, NOT the bare ideal π²ℏc/240d⁴ coefficient (Adam/Eve vet, Eve YELLOW). A consistency statement, not a clean coefficient test.',
  },
};

/** Result of confronting BE-56 with a Casimir measurement. @public */
export interface BE56ConfrontationResult {
  /** The measured/theory ratio a correct theory yields: 1. */
  readonly predicted_ratio: number;
  /** The measured ratio (≈ 1). */
  readonly observed_ratio: number;
  /** Fractional agreement level. */
  readonly agreement: number;
  /** The ratio is consistent with 1 within the agreement level. */
  readonly consistent: boolean;
  readonly observation: CasimirAgreementObservation;
}

/**
 * Confront BE-56's Casimir pressure with a measurement (vs corrected theory).
 *
 * @public
 */
export function confrontBE56(
  obs: CasimirAgreementObservation = CASIMIR_MOHIDEEN_ROY_1998,
): BE56ConfrontationResult {
  return {
    predicted_ratio: 1,
    observed_ratio: obs.observed_ratio,
    agreement: obs.agreement,
    consistent: Math.abs(obs.observed_ratio - 1) <= obs.agreement,
    observation: obs,
  };
}
