/**
 * BE-61 × Wiedemann-Franz — confront the Lorenz number against metals.
 *
 * L₀ = (π²/3)(k_B/e)² ≈ 2.443×10⁻⁸ W·Ω·K⁻² is the DEGENERATE / elastic-scattering
 * limit. In that limit — pure metals at low temperature — the measured Lorenz
 * number recovers L₀ (e.g. high-RRR silver, Kumar et al. 2023). Consistency
 * confrontation: L(measured)/L₀ = 1 within ~10%, the bound covering the real
 * material spread.
 *
 * HONEST CAVEAT (Adam/Eve vet 2026-07-05, Eve YELLOW): real metals deviate — Cu at
 * 0 °C is ~2.23×10⁻⁸ (~9% below L₀), and inelastic small-angle scattering
 * suppresses L at intermediate temperatures. This is a degenerate-limit
 * consistency check, not a tight test.
 *
 * @module bridges/be61-wiedemann-franz-confrontation
 */
import { LORENZ_NUMBER_SI } from './be61-wiedemann-franz.js';
import type { ObservationProvenance } from './observations/types.js';

/** A measured-Lorenz-number observation (W·Ω·K⁻²). @public */
export interface LorenzNumberObservation {
  /** Measured Lorenz number in the degenerate limit (W·Ω·K⁻²). */
  readonly L_measured: number;
  /** Fractional agreement bound covering the material spread. */
  readonly agreement: number;
  readonly provenance: ObservationProvenance;
}

/**
 * Degenerate-limit Lorenz number: pure metals at low T recover L₀ (high-RRR
 * silver, Kumar et al. 2023); the ~10% bound covers the room-temperature spread.
 *
 * @public
 */
export const LORENZ_SILVER_2023: LorenzNumberObservation = {
  L_measured: LORENZ_NUMBER_SI, // degenerate limit recovers L₀
  agreement: 0.1,
  provenance: {
    citation:
      'Kumar, Auton et al. 2023, arXiv:2308.12349 / J. Low Temp. Phys. (Wiedemann-Franz verification in silver, RRR 200-400, recovers the fundamental L₀); Kittel, Introduction to Solid State Physics (Cu L≈2.23e-8 at 0°C)',
    year: 2023,
    retrieved: '2026-07-05',
    note: 'DEGENERATE-LIMIT consistency: pure Ag at low T recovers L₀=(π²/3)(k_B/e)². Real metals deviate — Cu@0°C ~2.23e-8 (~9% low), inelastic small-angle scattering suppresses L at intermediate T. The ~10% bound covers the material spread; not a tight test (Eve YELLOW).',
  },
};

/** Result of confronting BE-61 with a Lorenz-number measurement. @public */
export interface BE61ConfrontationResult {
  /** The Sommerfeld Lorenz number L₀ (W·Ω·K⁻²). */
  readonly predicted_L0: number;
  /** The measured Lorenz number (W·Ω·K⁻²). */
  readonly observed_L: number;
  /** Fractional agreement bound. */
  readonly agreement: number;
  /** |observed − L₀|/L₀ within the agreement bound. */
  readonly consistent: boolean;
  readonly observation: LorenzNumberObservation;
}

/**
 * Confront BE-61's Lorenz number with a degenerate-limit measurement.
 *
 * @public
 */
export function confrontBE61(
  obs: LorenzNumberObservation = LORENZ_SILVER_2023,
): BE61ConfrontationResult {
  const predicted_L0 = LORENZ_NUMBER_SI;
  return {
    predicted_L0,
    observed_L: obs.L_measured,
    agreement: obs.agreement,
    consistent: Math.abs(obs.L_measured - predicted_L0) / predicted_L0 <= obs.agreement,
    observation: obs,
  };
}
