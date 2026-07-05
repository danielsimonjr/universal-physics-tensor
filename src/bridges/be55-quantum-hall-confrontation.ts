/**
 * BE-55 × quantum-Hall universality — confront the TOPOLOGICAL quantization by
 * its material-INDEPENDENCE, not its (post-2019 definitional) value.
 *
 * Post-2019 SI fixes h and e exactly, so R_K = h/e² is exact BY DEFINITION and
 * confronting a measured R_H against h/(Ce²) is circular. The genuine empirical
 * content of the integer quantum Hall effect is that the quantized Hall
 * resistance is UNIVERSAL — identical across completely different materials,
 * because it is set by a topological (Chern) invariant, not material details.
 * The most stringent test: epitaxial graphene vs GaAs/AlGaAs agree to a relative
 * 8.6×10⁻¹¹ (Janssen et al. 2012). Consistency confrontation: the material ratio
 * is 1 to within 8.6×10⁻¹¹. (Adam/Eve vet 2026-07-05: GREEN/GREEN — non-circular.)
 *
 * @module bridges/be55-quantum-hall-confrontation
 */
import type { ObservationProvenance } from './observations/types.js';

/** A quantum-Hall universality (material-independence) observation. @public */
export interface QHUniversalityObservation {
  /** Measured R_H(material A)/R_H(material B) ratio, ≈ 1. */
  readonly observed_ratio: number;
  /** Relative uncertainty on the material-independence (the universality bound). */
  readonly relative_uncertainty: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Janssen et al. 2012 graphene-vs-GaAs universality test: the quantized Hall
 * resistance agrees between epitaxial graphene and a GaAs/AlGaAs heterostructure
 * to a relative 8.6×10⁻¹¹ — the most stringent material-independence test.
 *
 * @public
 */
export const QH_UNIVERSALITY_JANSSEN_2012: QHUniversalityObservation = {
  observed_ratio: 1,
  relative_uncertainty: 8.6e-11,
  provenance: {
    citation:
      'Janssen, Williams, Fletcher, Goebel, Tzalenchuk, Yakimova, Lara-Avila, Kubatkin & Fal’ko 2012, Metrologia 49:294 (arXiv:1105.4055), "Graphene, universality of the quantum Hall effect and redefinition of the SI"',
    year: 2012,
    retrieved: '2026-07-05',
    note: 'Material-INDEPENDENCE test: epitaxial graphene vs GaAs/AlGaAs quantized Hall resistance agree to a relative 8.6e-11 — a non-circular empirical test of the TOPOLOGICAL quantization (post-2019 SI makes R_K=h/e2 exact by definition, so the value itself is not a data test; the universality is). Confirms the Hall conductance is fixed by a Chern invariant, not material details.',
  },
};

/** Result of confronting BE-55 with a universality observation. @public */
export interface BE55ConfrontationResult {
  /** The material-independence ratio a correct topological quantization yields: 1. */
  readonly predicted_ratio: number;
  /** The measured material ratio (≈ 1). */
  readonly observed_ratio: number;
  /** The universality bound (relative) — how tightly the ratio equals 1. */
  readonly relative_uncertainty: number;
  /** The ratio is consistent with 1 within the universality bound. */
  readonly consistent: boolean;
  readonly observation: QHUniversalityObservation;
}

/**
 * Confront BE-55's topological quantization with a material-universality test.
 *
 * @public
 */
export function confrontBE55(
  obs: QHUniversalityObservation = QH_UNIVERSALITY_JANSSEN_2012,
): BE55ConfrontationResult {
  return {
    predicted_ratio: 1,
    observed_ratio: obs.observed_ratio,
    relative_uncertainty: obs.relative_uncertainty,
    consistent: Math.abs(obs.observed_ratio - 1) <= obs.relative_uncertainty,
    observation: obs,
  };
}
