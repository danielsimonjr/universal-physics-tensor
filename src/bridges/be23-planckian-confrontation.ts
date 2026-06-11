/**
 * BE-23 × overdoped-cuprate Planckian dissipation — the second
 * real-data confrontation (follows the GW170817 pattern of
 * `be36-gw170817-confrontation.ts`: observation record with citations,
 * a `confront` function that recomputes the published comparison, and
 * honest-finding fields).
 *
 * Published dataset: Legros et al. 2019 *Nature Physics* 15:142,
 * "Universal T-linear resistivity and Planckian dissipation in
 * overdoped cuprates" (arXiv:1805.02512). The paper measures the
 * T-linear resistivity slope across overdoped cuprates (Bi2212,
 * Bi2201, LSCO, Nd-LSCO) and converts it, via the Drude relation
 * ρ = m* / (n e² τ), into a Planckian scattering coefficient α defined by
 *
 *   ℏ/τ = α · k_B T,    finding α ≈ 1 within a factor ~2 (O(1)).
 *
 * ── DATA-ENCODING HONESTY LEVEL: AGGREGATE, NOT PER-MATERIAL ──
 * The per-material α table from Legros et al. was NOT reproduced here:
 * it could not be re-verified against the paper at encoding time
 * (network access to arXiv/Nature unavailable), and reproducing table
 * rows from memory risks fabricating numbers. Per the repo's
 * no-fabricated-literals rule, this module encodes ONLY the paper's
 * abstract-level aggregate claim, conservatively stated as
 * α = 1.0 ± 0.4 (i.e., α is O(1), within roughly a factor of 2 of the
 * Planckian value α = 1, across the materials studied). Anyone with
 * the paper in hand can upgrade `PLANCKIAN_CUPRATES` to per-material
 * rows; the `perMaterialAlphas: null` field is the explicit marker
 * that this upgrade has not happened.
 *
 * ── WHAT IS ACTUALLY CONFRONTED ──
 * BE-23's evaluator (`evaluateSYKResistivity`) computes
 *
 *   ρ(T) = ρ_0 + (m* · k_B T)/(n_e · e² · ℏ) · α_SYK,
 *
 * which is exactly the Drude resistivity with the Planckian rate
 * 1/τ = α_SYK · k_B T / ℏ substituted. So the encoding's α_SYK is the
 * SAME dimensionless α the paper reports, and the supportable test is:
 *   1. Is the published α band consistent with the O(1) assumption the
 *      BE-23 docstring makes for α_SYK? (Operationalized here as the
 *      factor-2 band [0.5, 2] — OUR reading of "O(1)", not a number
 *      from the paper.)
 *   2. Is the evaluator's thermal term algebraically identical to
 *      (m* / (n_e e²)) · (α k_B T/ℏ), i.e., Drude × Planckian-rate?
 *      (`encodedFormConsistent`, checked numerically at an arbitrary
 *      positive parameter point — the parameters cancel structurally,
 *      so no material data is needed or fabricated for this check.)
 * NOT claimed: that UPT/SYK *predicts* α (BE-23 bundles α_SYK as a
 * free O(1) coefficient — status: speculative), nor that agreement
 * here validates the strange-metal/black-hole bridge framing.
 *
 * @module bridges/be23-planckian-confrontation
 */

import { PhysicalConstants } from '../core/types.js';
import { evaluateSYKResistivity } from './equations/be-23-syk-planckian.js';

/**
 * A Planckian-dissipation observation record (aggregate-level).
 *
 * @public
 */
export interface PlanckianObservation {
  /** Materials covered by the study (names only — see `perMaterialAlphas`). */
  readonly materials: readonly string[];
  /** Aggregate Planckian coefficient α (dimensionless, ℏ/τ = α·k_B T). */
  readonly alpha_aggregate: number;
  /** Conservative spread on the aggregate α (dimensionless). */
  readonly alpha_aggregate_err: number;
  /**
   * Per-material {material, alpha, alpha_err} rows. `null` = the
   * paper's table was NOT reproduced (honesty marker — see module doc).
   */
  readonly perMaterialAlphas:
    | readonly { material: string; alpha: number; alpha_err: number }[]
    | null;
  /** 'aggregate' until the per-material table is faithfully transcribed. */
  readonly encodingHonestyLevel: 'aggregate' | 'per-material';
  readonly citation: string;
  readonly honestyNote: string;
}

/**
 * Legros et al. 2019 overdoped-cuprate Planckian-dissipation record,
 * encoded at AGGREGATE honesty level (see module doc for why).
 *
 * @public
 */
export const PLANCKIAN_CUPRATES: PlanckianObservation = {
  materials: ['Bi2212', 'Bi2201', 'LSCO', 'Nd-LSCO'],
  alpha_aggregate: 1.0,
  alpha_aggregate_err: 0.4,
  perMaterialAlphas: null,
  encodingHonestyLevel: 'aggregate',
  citation:
    'Legros et al. 2019 Nature Phys. 15:142 (arXiv:1805.02512), ' +
    '"Universal T-linear resistivity and Planckian dissipation in ' +
    'overdoped cuprates" — abstract-level claim that the T-linear ' +
    'scattering rate is the Planckian rate k_B T/ℏ to within ~×2 ' +
    '(encoded conservatively as α = 1.0 ± 0.4)',
  honestyNote:
    'AGGREGATE encoding only: the per-material α table of Legros et ' +
    'al. 2019 was not reproduced (paper not re-verifiable at encoding ' +
    'time; transcribing from memory risks fabrication). α = 1.0 ± 0.4 ' +
    'encodes the abstract-level "α = O(1), within a factor ~2 of 1" ' +
    'claim. perMaterialAlphas is null until upgraded from the paper.',
};

/**
 * The factor-2 band [0.5, 2] used to operationalize the "α_SYK is
 * O(1)" assumption in BE-23's docstring. This band is UPT's reading of
 * "O(1)" — it is not a number published by Legros et al.
 *
 * @public
 */
export const PLANCKIAN_O1_BAND: readonly [number, number] = [0.5, 2];

/**
 * Result of confronting BE-23 with a Planckian-dissipation observation.
 *
 * @public
 */
export interface BE23ConfrontationResult {
  /** Central aggregate α from the observation record. */
  readonly alphaAggregate: number;
  /** Spread on the aggregate α (echoed; propagated by the *WithUncertainty sibling). */
  readonly alphaAggregateErr: number;
  /** `null` here — per-material rows were not encoded (honesty marker). */
  readonly perMaterialAlphas: PlanckianObservation['perMaterialAlphas'];
  /** The O(1) band [0.5, 2] the verdict is taken against. */
  readonly planckianBand: readonly [number, number];
  /**
   * Whether all encoded α values (here: the single aggregate central
   * value) lie within the O(1) band [0.5, 2] that BE-23's α_SYK
   * presumes. ±1σ band coverage is the *WithUncertainty sibling's job.
   */
  readonly withinPlanckianBand: boolean;
  /** Planckian scattering rate 1/τ = α·k_B·T/ℏ at temperature T (s⁻¹). */
  readonly planckianRateAt: (T_K: number) => number;
  /**
   * Whether `evaluateSYKResistivity`'s thermal term numerically equals
   * the Drude form (m* / (n_e e²)) · planckianRateAt(T) — i.e., the
   * encoded linear-in-T resistivity IS the Planckian-rate Drude
   * resistivity. Checked at an arbitrary positive parameter point
   * (structural identity; no material data involved).
   */
  readonly encodedFormConsistent: boolean;
  /** Relative error of the consistency check above. */
  readonly encodedFormRelErr: number;
  readonly note: string;
  readonly observation: PlanckianObservation;
}

/** Arbitrary positive parameters for the structural Drude≡evaluator check.
 *  NOT material data — the identity holds for any positive values. */
const STRUCTURAL_CHECK = {
  m_star_kg: 9.1093837015e-31, // electron mass, CODATA 2018 (convenience scale)
  n_e_per_m3: 1e28,
  T_K: 100,
} as const;

/**
 * Confront BE-23's Planckian-dissipation encoding with the published
 * overdoped-cuprate α band (the framework's second real-data
 * confrontation, after BE-36 × GW170817).
 *
 * @public
 */
export function confrontBE23(
  obs: PlanckianObservation = PLANCKIAN_CUPRATES,
): BE23ConfrontationResult {
  if (!(Number.isFinite(obs.alpha_aggregate) && obs.alpha_aggregate > 0)) {
    throw new RangeError('confrontBE23: alpha_aggregate must be finite and > 0');
  }
  if (!Array.isArray(obs.materials) || obs.materials.length === 0) {
    throw new RangeError('confrontBE23: materials must be a non-empty array');
  }
  if (obs.perMaterialAlphas !== null) {
    for (const row of obs.perMaterialAlphas) {
      if (!(Number.isFinite(row.alpha) && row.alpha > 0)) {
        throw new RangeError(
          `confrontBE23: per-material alpha for "${row.material}" must be finite and > 0`,
        );
      }
    }
  }

  const { hbar, kB, e } = PhysicalConstants;
  const alpha = obs.alpha_aggregate;
  const planckianRateAt = (T_K: number): number => {
    if (!(Number.isFinite(T_K) && T_K >= 0)) {
      throw new RangeError('planckianRateAt: T_K must be finite and ≥ 0');
    }
    return (alpha * kB * T_K) / hbar;
  };

  // All encoded α values within the O(1) band. At aggregate honesty
  // level there is exactly one: the central value (per-material rows,
  // when encoded, are all checked).
  const alphas =
    obs.perMaterialAlphas !== null
      ? obs.perMaterialAlphas.map((r) => r.alpha)
      : [alpha];
  const [bandLo, bandHi] = PLANCKIAN_O1_BAND;
  const withinPlanckianBand = alphas.every((a) => a >= bandLo && a <= bandHi);

  // Structural check: evaluator thermal term ≡ Drude × Planckian rate.
  const { m_star_kg, n_e_per_m3, T_K } = STRUCTURAL_CHECK;
  const viaEvaluator = evaluateSYKResistivity({
    rho_0: 0,
    m_star_kg,
    n_e_per_m3,
    T_K,
    alpha_SYK: alpha,
  });
  const viaDrude = (m_star_kg / (n_e_per_m3 * e * e)) * planckianRateAt(T_K);
  const encodedFormRelErr = Math.abs(viaEvaluator - viaDrude) / viaDrude;
  const encodedFormConsistent = encodedFormRelErr <= 1e-12;

  return {
    alphaAggregate: alpha,
    alphaAggregateErr: obs.alpha_aggregate_err,
    perMaterialAlphas: obs.perMaterialAlphas,
    planckianBand: PLANCKIAN_O1_BAND,
    withinPlanckianBand,
    planckianRateAt,
    encodedFormConsistent,
    encodedFormRelErr,
    note:
      'AGGREGATE-level confrontation: only the abstract-level α = ' +
      '1.0 ± 0.4 claim of Legros et al. 2019 is encoded; the ' +
      'per-material α table was not reproduced (perMaterialAlphas is ' +
      'null). The verdict tests consistency of the published O(1) α ' +
      'band with BE-23\'s α_SYK = O(1) assumption (band [0.5, 2] is ' +
      'UPT\'s operationalization of "O(1)", not a published number). ' +
      'No claim that SYK/UPT predicts α — BE-23 bundles α_SYK as a ' +
      'free coefficient and remains status: speculative.',
    observation: obs,
  };
}

/**
 * Confrontation result with first-order uncertainty (mirrors
 * `confrontBE36WithUncertainty`).
 *
 * Propagates σ(α) = alpha_aggregate_err only: the Planckian rate is
 * linear in α (∂rate/∂α = k_B T/ℏ), so σ_rate(T) = σ_α·k_B T/ℏ.
 * `withinPlanckianBandAtOneSigma` requires the whole ±1σ interval
 * [α−σ, α+σ] to sit inside [0.5, 2] — the stricter verdict.
 *
 * @public
 */
export interface BE23ConfrontationWithUncertainty
  extends BE23ConfrontationResult {
  /** 1σ on α (echo of alpha_aggregate_err, validated). */
  readonly alphaSigma: number;
  /** 1σ on the Planckian rate at temperature T (s⁻¹): σ_α·k_B·T/ℏ. */
  readonly planckianRateSigmaAt: (T_K: number) => number;
  /** Whether [α−σ, α+σ] ⊆ [0.5, 2] (stricter than the central verdict). */
  readonly withinPlanckianBandAtOneSigma: boolean;
}

/**
 * `confrontBE23` + first-order propagation of the α uncertainty.
 *
 * @public
 */
export function confrontBE23WithUncertainty(
  obs: PlanckianObservation = PLANCKIAN_CUPRATES,
): BE23ConfrontationWithUncertainty {
  const base = confrontBE23(obs);
  const sigma = obs.alpha_aggregate_err;
  if (!(Number.isFinite(sigma) && sigma >= 0)) {
    throw new RangeError(
      'confrontBE23WithUncertainty: alpha_aggregate_err must be finite and ≥ 0',
    );
  }
  const { hbar, kB } = PhysicalConstants;
  const planckianRateSigmaAt = (T_K: number): number => {
    if (!(Number.isFinite(T_K) && T_K >= 0)) {
      throw new RangeError('planckianRateSigmaAt: T_K must be finite and ≥ 0');
    }
    return (sigma * kB * T_K) / hbar;
  };
  const [bandLo, bandHi] = PLANCKIAN_O1_BAND;
  const withinPlanckianBandAtOneSigma =
    base.alphaAggregate - sigma >= bandLo &&
    base.alphaAggregate + sigma <= bandHi;
  return {
    ...base,
    alphaSigma: sigma,
    planckianRateSigmaAt,
    withinPlanckianBandAtOneSigma,
  };
}
