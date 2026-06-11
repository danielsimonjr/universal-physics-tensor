/**
 * Centralized Quantity nodes — ONE object per canonical name (v0.11
 * namespacing gate, acceptance criterion 6). Per the Adam vet
 * (A-2/A-6.3), per-edge-module node definitions had drifted into
 * duplicate-name distinct-object pairs: 'mass' across
 * calibration/catalog-tranche, and two 'temperature' nodes within
 * calibration itself. Name uniqueness is pinned by
 * tests/composition/quantities.test.ts.
 *
 * Centralization removes the false-positive collision class; it does
 * NOT decide composition-level aliasing questions — those are
 * dispositions (compose.ts `SOURCE_ALIAS_DISPOSITIONS`).
 *
 * @module composition/quantities
 */

import {
  AREA,
  DIMENSIONLESS,
  ENTROPY,
  FORCE,
  FREQUENCY,
  LENGTH,
  MASS,
  TEMPERATURE,
  TIME,
} from '../dimensional/types.js';
import type { Dimension } from '../dimensional/types.js';
import { VISCOSITY_OVER_ENTROPY_DENSITY } from '../bridges/equations/be-21-kss-bound.js';
import type { Quantity } from './quantity.js';

/** Joule [M L² T⁻²] — local alias for readability. */
const ENERGY_DIM: Dimension = { L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
/** [T⁻¹] alias. */
const FREQUENCY_DIM = FREQUENCY;
/** Mass-density [M L⁻³] (kg/m³) — BE-19/BE-54 shared convention. */
const MASS_DENSITY: Dimension = { L: -3, M: 1, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
/** [T⁻²] (s⁻²) — H² and the c²-rescaled cosmological constant. */
const T_INV2: Dimension = { L: 0, M: 0, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

// --- v0.11 catalog-full dimension aliases ---

/** [L⁻²] — Ricci scalar / cosmological-constant curvature (inverse area). */
const INV_AREA: Dimension = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
/** [L⁻¹] — inverse length (TEE area-law coefficient). */
const INV_LENGTH: Dimension = { L: -1, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
/** [M L⁻¹ T⁻²] — energy density (stress-energy trace). */
const ENERGY_DENSITY: Dimension = { L: -1, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
/** [L² T⁻¹] — Model A kinetic coefficient (mobility). */
const MOBILITY: Dimension = { L: 2, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 };
/** [L³ M T⁻³ I⁻²] — electrical resistivity (Ω·m). */
const RESISTIVITY: Dimension = { L: 3, M: 1, T: -3, I: -2, Theta: 0, N: 0, J: 0 };
/** [L⁻³] — number density. */
const NUMBER_DENSITY: Dimension = { L: -3, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
/** [L⁻³ T⁻¹] — number-density rate (Boltzmann dY/dt). */
const NUMBER_DENSITY_RATE: Dimension = { L: -3, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 };
/** [L¹ M¹ T⁻² I⁻¹] — magnetic vector potential A_μ (V·s/m). */
const VECTOR_POTENTIAL: Dimension = { L: 1, M: 1, T: -2, I: -1, Theta: 0, N: 0, J: 0 };
/** [M² L² T⁻⁴] — squared Einstein-coupling inverse (c⁴/8πG)². */
const COUPLING_PREFACTOR_SQUARED: Dimension = { L: 2, M: 2, T: -4, I: 0, Theta: 0, N: 0, J: 0 };
/** [T² L⁻⁴] — torsion-contraction scalar T_λμν T^λμν. */
const TORSION_CONTRACTION: Dimension = { L: -4, M: 0, T: 2, I: 0, Theta: 0, N: 0, J: 0 };
/** [M² L⁻² T⁻²] — squared spin angular-momentum density. */
const SPIN_DENSITY_SQUARED: Dimension = { L: -2, M: 2, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
/** Energy [M L² T⁻²] — joule (BE-18 VEV/mass, natural-units energy). */
const ENERGY_DIM2: Dimension = ENERGY_DIM;

/** Canonical node for `boundary-entanglement-entropy`. */
export const boundaryEntanglementEntropyQ: Quantity = {
  name: 'boundary-entanglement-entropy',
  symbol: 'S_boundary',
  dim: ENTROPY,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};

/** Canonical node for `brane-tension`. */
export const braneTensionQ: Quantity = {
  name: 'brane-tension',
  symbol: 'σ',
  dim: MASS_DENSITY,
  attributes: { force: 'gravitational' },
};

/** Canonical node for `color-number`. */
export const colorNumberQ: Quantity = {
  name: 'color-number',
  symbol: 'N_c',
  dim: DIMENSIONLESS,
  attributes: { force: 'strong' },
};

/** Canonical node for `critical-density`. */
export const criticalDensityQ: Quantity = {
  name: 'critical-density',
  symbol: 'ρ_crit',
  dim: MASS_DENSITY,
  attributes: { scale: 'quantum', force: 'gravitational' },
};

/** Canonical node for `decoherence-rate`. */
export const decoherenceRateQ: Quantity = {
  name: 'decoherence-rate',
  symbol: 'Γ_dec',
  dim: FREQUENCY_DIM,
  attributes: { scale: 'classical' },
};

/** Canonical node for `deflection-angle`. */
export const deflectionAngleQ: Quantity = {
  name: 'deflection-angle',
  symbol: 'α',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `eccentricity`. */
export const eccentricityQ: Quantity = {
  name: 'eccentricity',
  symbol: 'e',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `far-radius`. */
export const farRadiusQ: Quantity = {
  name: 'far-radius',
  symbol: 'R_far',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `flavor-number`. */
export const flavorNumberQ: Quantity = {
  name: 'flavor-number',
  symbol: 'N_f',
  dim: DIMENSIONLESS,
  attributes: { force: 'strong' },
};

/** Canonical node for `gauge-coupling`. */
export const gaugeCouplingQ: Quantity = {
  name: 'gauge-coupling',
  symbol: 'g',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'strong' },
};

/** Canonical node for `grw-localization-rate`. */
export const grwLocalizationRateQ: Quantity = {
  name: 'grw-localization-rate',
  symbol: 'λ_GRW',
  dim: FREQUENCY,
  attributes: { scale: 'quantum' },
};

/** Canonical node for `hawking-temperature`. */
export const hawkingTemperatureQ: Quantity = {
  name: 'hawking-temperature',
  symbol: 'T_H',
  dim: TEMPERATURE,
  attributes: { scale: 'quantum', force: 'gravitational' },
};

/** Canonical node for `hubble-rate-squared`. */
export const hubbleRateSquaredQ: Quantity = {
  name: 'hubble-rate-squared',
  symbol: 'H²',
  dim: T_INV2,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};

/** Canonical node for `impact-parameter`. */
export const impactParameterQ: Quantity = {
  name: 'impact-parameter',
  symbol: 'b',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `landauer-erasure-energy`. */
export const erasureEnergyQ: Quantity = {
  name: 'landauer-erasure-energy',
  symbol: 'E_min',
  dim: ENERGY_DIM,
  attributes: { information: 'shannon' },
};

/** Canonical node for `mass`. */
export const massQ: Quantity = {
  name: 'mass',
  symbol: 'M',
  dim: MASS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `mass-density`. */
export const massDensityQ: Quantity = {
  name: 'mass-density',
  symbol: 'ρ',
  dim: MASS_DENSITY,
  attributes: { scale: 'cosmological' },
};

/** Canonical node for `minimal-surface-area`. */
export const minimalSurfaceAreaQ: Quantity = {
  name: 'minimal-surface-area',
  symbol: 'A(γ)',
  dim: AREA,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `near-radius`. */
export const nearRadiusQ: Quantity = {
  name: 'near-radius',
  symbol: 'R_near',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `perihelion-advance`. */
export const perihelionAdvanceQ: Quantity = {
  name: 'perihelion-advance',
  symbol: 'Δφ',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `relaxation-rate`. */
export const relaxationRateQ: Quantity = {
  name: 'relaxation-rate',
  symbol: 'γ_relax',
  dim: FREQUENCY_DIM,
  attributes: { scale: 'classical' },
};

/** Canonical node for `rescaled-cosmological-constant`. */
export const rescaledCosmologicalConstantQ: Quantity = {
  name: 'rescaled-cosmological-constant',
  symbol: 'Λ',
  dim: T_INV2,
  attributes: { scale: 'cosmological' },
};

/** Canonical node for `schwarzschild-radius`. */
export const schwarzschildRadiusQ: Quantity = {
  name: 'schwarzschild-radius',
  symbol: 'r_s',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `semi-major-axis`. */
export const semiMajorAxisQ: Quantity = {
  name: 'semi-major-axis',
  symbol: 'a',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `shapiro-delay`. */
export const shapiroDelayQ: Quantity = {
  name: 'shapiro-delay',
  symbol: 'Δt',
  dim: TIME,
  attributes: { scale: 'classical', force: 'gravitational' },
};

/** Canonical node for `superposition-extent`. */
export const superpositionExtentQ: Quantity = {
  name: 'superposition-extent',
  symbol: 'Δx',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};

/** Canonical node for `temperature`. */
export const temperatureQ: Quantity = {
  name: 'temperature',
  symbol: 'T',
  dim: TEMPERATURE,
  attributes: { scale: 'classical' },
};

/** Canonical node for `thermal-de-broglie-wavelength`. */
export const thermalDeBroglieQ: Quantity = {
  name: 'thermal-de-broglie-wavelength',
  symbol: 'λ_T',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};

/** Canonical node for `viscosity-entropy-ratio`. */
export const viscosityEntropyRatioQ: Quantity = {
  name: 'viscosity-entropy-ratio',
  symbol: 'η/s',
  dim: VISCOSITY_OVER_ENTROPY_DENSITY,
  attributes: { scale: 'quantum' },
};

/** Canonical node for `yang-mills-beta`. */
export const yangMillsBetaQ: Quantity = {
  name: 'yang-mills-beta',
  symbol: 'β(g)',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'strong' },
};

// ===========================================================================
// v0.11 catalog-full nodes (catalog-full.ts edges). New canonical names; the
// namespacing gate forbids reusing an existing name for a physically distinct
// quantity, so e.g. BE-23's carrier `effective-mass` is a SEPARATE node from
// the gravitational `mass`.
// ===========================================================================

// --- BE-11 generic decoherence-master ---

/** Canonical node for `system-environment-coupling` (BE-11 λ; dimensionless). */
export const systemEnvironmentCouplingQ: Quantity = {
  name: 'system-environment-coupling',
  symbol: 'λ',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};

/** Canonical node for `reference-coupling` (BE-11 λ₀; dimensionless). */
export const referenceCouplingQ: Quantity = {
  name: 'reference-coupling',
  symbol: 'λ₀',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};

// --- BE-13 / BE-31 Einstein trace + causal-set Ricci scalar ---

/** Canonical node for `cosmological-constant-curvature` (Λ, [L⁻²]). */
export const cosmologicalConstantCurvatureQ: Quantity = {
  name: 'cosmological-constant-curvature',
  symbol: 'Λ',
  dim: INV_AREA,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};

/** Canonical node for `stress-energy-trace` (T = g^μν T_μν, energy density). */
export const stressEnergyTraceQ: Quantity = {
  name: 'stress-energy-trace',
  symbol: 'T',
  dim: ENERGY_DENSITY,
  attributes: { force: 'gravitational' },
};

/** Canonical node for `ricci-scalar` (R, [L⁻²]). Shared by BE-13/BE-31. */
export const ricciScalarQ: Quantity = {
  name: 'ricci-scalar',
  symbol: 'R',
  dim: INV_AREA,
  attributes: { force: 'gravitational' },
};

/** Canonical node for `causal-set-count-0` (N_0, dimensionless). */
export const causalSetCount0Q: Quantity = {
  name: 'causal-set-count-0',
  symbol: 'N_0',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `causal-set-count-1` (N_1, dimensionless). */
export const causalSetCount1Q: Quantity = {
  name: 'causal-set-count-1',
  symbol: 'N_1',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `causal-set-count-2` (N_2, dimensionless). */
export const causalSetCount2Q: Quantity = {
  name: 'causal-set-count-2',
  symbol: 'N_2',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `causal-set-count-3` (N_3, dimensionless). */
export const causalSetCount3Q: Quantity = {
  name: 'causal-set-count-3',
  symbol: 'N_3',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `planck-length` (ℓ_P, [L]). */
export const planckLengthQ: Quantity = {
  name: 'planck-length',
  symbol: 'ℓ_P',
  dim: LENGTH,
  attributes: { scale: 'quantum', force: 'gravitational' },
};

// --- BE-15 Model A coarsening ---

/** Canonical node for `model-a-mobility` (Γ, [L²/T]). */
export const modelAMobilityQ: Quantity = {
  name: 'model-a-mobility',
  symbol: 'Γ',
  dim: MOBILITY,
  attributes: { scale: 'mesoscopic', force: 'emergent' },
};
/** Canonical node for `time` (t, [T]). */
export const timeQ: Quantity = {
  name: 'time',
  symbol: 't',
  dim: TIME,
  attributes: {},
};
/** Canonical node for `coarsening-length` (L(t), [L]). */
export const coarseningLengthQ: Quantity = {
  name: 'coarsening-length',
  symbol: 'L(t)',
  dim: LENGTH,
  attributes: { scale: 'mesoscopic', force: 'emergent' },
};

// --- BE-17 Einstein-Cartan torsion-spin ---

/** Canonical node for `einstein-coupling-prefactor-squared` ((c⁴/8πG)²). */
export const couplingPrefactorSquaredQ: Quantity = {
  name: 'einstein-coupling-prefactor-squared',
  symbol: '(c⁴/8πG)²',
  dim: COUPLING_PREFACTOR_SQUARED,
  attributes: { force: 'gravitational' },
};
/** Canonical node for `torsion-contraction-scalar` (T_λμν T^λμν). */
export const torsionContractionScalarQ: Quantity = {
  name: 'torsion-contraction-scalar',
  symbol: 'T·T',
  dim: TORSION_CONTRACTION,
  attributes: { force: 'gravitational' },
};
/** Canonical node for `spin-density-squared` (S²_spin). */
export const spinDensitySquaredQ: Quantity = {
  name: 'spin-density-squared',
  symbol: 'S²_spin',
  dim: SPIN_DENSITY_SQUARED,
  attributes: { force: 'gravitational' },
};

// --- BE-18 Higgs-like dark mass ---

/** Canonical node for `yukawa-coupling` (g_dark, dimensionless). */
export const yukawaCouplingQ: Quantity = {
  name: 'yukawa-coupling',
  symbol: 'g_dark',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'weak' },
};
/** Canonical node for `vacuum-expectation-value` (v_dark, energy). */
export const vacuumExpectationValueQ: Quantity = {
  name: 'vacuum-expectation-value',
  symbol: 'v_dark',
  dim: ENERGY_DIM2,
  attributes: { scale: 'quantum', force: 'weak' },
};
/** Canonical node for `dark-fermion-mass` (m_dark, energy / natural units). */
export const darkFermionMassQ: Quantity = {
  name: 'dark-fermion-mass',
  symbol: 'm_dark',
  dim: ENERGY_DIM2,
  attributes: { scale: 'quantum', force: 'weak' },
};

// --- BE-20 cosmological-constant density ---

/** Canonical node for `lambda-mass-density` (ρ_Λ, [M L⁻³]). */
export const lambdaMassDensityQ: Quantity = {
  name: 'lambda-mass-density',
  symbol: 'ρ_Λ',
  dim: MASS_DENSITY,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};

// --- BE-22 topological entanglement entropy ---

/** Canonical node for `area-law-coefficient` (α, [L⁻¹]). */
export const areaLawCoefficientQ: Quantity = {
  name: 'area-law-coefficient',
  symbol: 'α',
  dim: INV_LENGTH,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};
/** Canonical node for `boundary-length` (L(R), [L]). */
export const boundaryLengthQ: Quantity = {
  name: 'boundary-length',
  symbol: 'L(R)',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `topological-entanglement-entropy` (γ, dimensionless). */
export const topologicalEntanglementEntropyQ: Quantity = {
  name: 'topological-entanglement-entropy',
  symbol: 'γ',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};
/** Canonical node for `subsystem-entanglement-entropy` (S(R), nats). */
export const subsystemEntanglementEntropyQ: Quantity = {
  name: 'subsystem-entanglement-entropy',
  symbol: 'S(R)',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};

// --- BE-23 SYK Planckian resistivity ---

/** Canonical node for `residual-resistivity` (ρ_0, Ω·m). */
export const residualResistivityQ: Quantity = {
  name: 'residual-resistivity',
  symbol: 'ρ_0',
  dim: RESISTIVITY,
  attributes: { scale: 'classical', force: 'electromagnetic' },
};
/** Canonical node for `effective-mass` (m*, carrier band mass — DISTINCT from gravitational `mass`). */
export const effectiveMassQ: Quantity = {
  name: 'effective-mass',
  symbol: 'm*',
  dim: MASS,
  attributes: { scale: 'quantum', force: 'electromagnetic' },
};
/** Canonical node for `carrier-density` (n_e, [L⁻³]). */
export const carrierDensityQ: Quantity = {
  name: 'carrier-density',
  symbol: 'n_e',
  dim: NUMBER_DENSITY,
  attributes: { scale: 'quantum', force: 'electromagnetic' },
};
/** Canonical node for `syk-coefficient` (α_SYK, dimensionless O(1)). */
export const sykCoefficientQ: Quantity = {
  name: 'syk-coefficient',
  symbol: 'α_SYK',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `resistivity` (ρ(T), Ω·m). */
export const resistivityQ: Quantity = {
  name: 'resistivity',
  symbol: 'ρ',
  dim: RESISTIVITY,
  attributes: { scale: 'classical', force: 'electromagnetic' },
};

// --- BE-24 FRET efficiency ---

/** Canonical node for `donor-acceptor-distance` (R, [L]). */
export const donorAcceptorDistanceQ: Quantity = {
  name: 'donor-acceptor-distance',
  symbol: 'R',
  dim: LENGTH,
  attributes: { scale: 'mesoscopic' },
};
/** Canonical node for `foerster-radius` (R_0, [L]). */
export const foersterRadiusQ: Quantity = {
  name: 'foerster-radius',
  symbol: 'R_0',
  dim: LENGTH,
  attributes: { scale: 'mesoscopic' },
};
/** Canonical node for `fret-efficiency` (η, dimensionless ∈ [0,1]). */
export const fretEfficiencyQ: Quantity = {
  name: 'fret-efficiency',
  symbol: 'η',
  dim: DIMENSIONLESS,
  attributes: { scale: 'mesoscopic' },
};

// --- BE-25 IIT intrinsic information ---

/** Canonical node for `conditional-probability` (p(s̃|s), dimensionless). */
export const conditionalProbabilityQ: Quantity = {
  name: 'conditional-probability',
  symbol: 'p(s̃|s)',
  dim: DIMENSIONLESS,
  attributes: { information: 'shannon' },
};
/** Canonical node for `marginal-probability` (p(s̃), dimensionless). */
export const marginalProbabilityQ: Quantity = {
  name: 'marginal-probability',
  symbol: 'p(s̃)',
  dim: DIMENSIONLESS,
  attributes: { information: 'shannon' },
};
/** Canonical node for `intrinsic-information` (ii, bits — dimensionless). */
export const intrinsicInformationQ: Quantity = {
  name: 'intrinsic-information',
  symbol: 'ii',
  dim: DIMENSIONLESS,
  attributes: { information: 'shannon' },
};

// --- BE-26 DNA tunneling ---

/** Canonical node for `attempt-frequency` (ν₀, [T⁻¹]). */
export const attemptFrequencyQ: Quantity = {
  name: 'attempt-frequency',
  symbol: 'ν₀',
  dim: FREQUENCY,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `tunneling-mass` (m, proton mass — DISTINCT from gravitational `mass`). */
export const tunnelingMassQ: Quantity = {
  name: 'tunneling-mass',
  symbol: 'm',
  dim: MASS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `barrier-height` (V−E, energy). */
export const barrierHeightQ: Quantity = {
  name: 'barrier-height',
  symbol: 'V−E',
  dim: ENERGY_DIM2,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `barrier-width` (L, [L]). */
export const barrierWidthQ: Quantity = {
  name: 'barrier-width',
  symbol: 'L_barrier',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `biological-rate-correction` (f(T,pH,EM), dimensionless). */
export const biologicalRateCorrectionQ: Quantity = {
  name: 'biological-rate-correction',
  symbol: 'f',
  dim: DIMENSIONLESS,
  attributes: { scale: 'mesoscopic' },
};
/** Canonical node for `mutation-rate` (Γ_mutation, [T⁻¹]). */
export const mutationRateQ: Quantity = {
  name: 'mutation-rate',
  symbol: 'Γ_mut',
  dim: FREQUENCY,
  attributes: { scale: 'mesoscopic' },
};

// --- BE-27 effective temperature ---

/** Canonical node for `active-noise-energy` (Σ_active, energy). */
export const activeNoiseEnergyQ: Quantity = {
  name: 'active-noise-energy',
  symbol: 'Σ_active',
  dim: ENERGY_DIM2,
  attributes: { scale: 'mesoscopic', force: 'emergent' },
};
/** Canonical node for `effective-temperature` (T_eff, [Θ]). */
export const effectiveTemperatureQ: Quantity = {
  name: 'effective-temperature',
  symbol: 'T_eff',
  dim: TEMPERATURE,
  attributes: { scale: 'mesoscopic', force: 'emergent' },
};

// --- BE-30 FLM first law ---

/** Canonical node for `modular-hamiltonian-variation` (δ⟨H_R⟩, nats). */
export const modularHamiltonianVariationQ: Quantity = {
  name: 'modular-hamiltonian-variation',
  symbol: 'δ⟨H_R⟩',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};
/** Canonical node for `entanglement-entropy-variation` (δS_EE, nats). */
export const entanglementEntropyVariationQ: Quantity = {
  name: 'entanglement-entropy-variation',
  symbol: 'δS_EE',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};

// --- BE-33 Hertz-Millis correlation length ---

/** Canonical node for `reference-correlation-length` (ξ_0, [L]). */
export const referenceCorrelationLengthQ: Quantity = {
  name: 'reference-correlation-length',
  symbol: 'ξ_0',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `reference-temperature` (T_0, [Θ]). */
export const referenceTemperatureQ: Quantity = {
  name: 'reference-temperature',
  symbol: 'T_0',
  dim: TEMPERATURE,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `static-exponent-nu` (ν, dimensionless). */
export const staticExponentNuQ: Quantity = {
  name: 'static-exponent-nu',
  symbol: 'ν',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `dynamic-exponent-z` (z, dimensionless). */
export const dynamicExponentZQ: Quantity = {
  name: 'dynamic-exponent-z',
  symbol: 'z',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `quantum-correlation-length` (ξ_quantum, [L]). */
export const quantumCorrelationLengthQ: Quantity = {
  name: 'quantum-correlation-length',
  symbol: 'ξ_quantum',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};

// --- BE-34 Kibble-Zurek ---

/** Canonical node for `quench-timescale` (τ_Q, [T]). */
export const quenchTimescaleQ: Quantity = {
  name: 'quench-timescale',
  symbol: 'τ_Q',
  dim: TIME,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `microscopic-relaxation-time` (τ_0, [T]). */
export const microscopicRelaxationTimeQ: Quantity = {
  name: 'microscopic-relaxation-time',
  symbol: 'τ_0',
  dim: TIME,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `spatial-dimension` (d, dimensionless). */
export const spatialDimensionQ: Quantity = {
  name: 'spatial-dimension',
  symbol: 'd',
  dim: DIMENSIONLESS,
  attributes: {},
};
/** Canonical node for `defect-rest-mass` (m_defect, [M]). */
export const defectRestMassQ: Quantity = {
  name: 'defect-rest-mass',
  symbol: 'm_defect',
  dim: MASS,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `reheating-temperature` (T_reh, [Θ]). */
export const reheatingTemperatureQ: Quantity = {
  name: 'reheating-temperature',
  symbol: 'T_reh',
  dim: TEMPERATURE,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `defect-density` (n_defect, dimensionless scaling). */
export const defectDensityQ: Quantity = {
  name: 'defect-density',
  symbol: 'n_defect',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological' },
};

// --- BE-36 GW170817 speed bound ---

/** Canonical node for `gravitational-wave-speed` (c_GW, velocity). */
export const gravitationalWaveSpeedQ: Quantity = {
  name: 'gravitational-wave-speed',
  symbol: 'c_GW',
  dim: { L: 1, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 },
  attributes: { scale: 'cosmological', force: 'gravitational' },
};
/** Canonical node for `gw-photon-speed-ratio` ((c_GW−c)/c, dimensionless). */
export const gwPhotonSpeedRatioQ: Quantity = {
  name: 'gw-photon-speed-ratio',
  symbol: 'Δv/c',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};

// --- BE-38 MOND ---

/** Canonical node for `newtonian-force` (F_N, [N]). */
export const newtonianForceQ: Quantity = {
  name: 'newtonian-force',
  symbol: 'F_N',
  dim: FORCE,
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `mond-acceleration-scale` (a_0, [L T⁻²]). */
export const mondAccelerationScaleQ: Quantity = {
  name: 'mond-acceleration-scale',
  symbol: 'a_0',
  dim: { L: 1, M: 0, T: -2, I: 0, Theta: 0, N: 0, J: 0 },
  attributes: { scale: 'classical', force: 'gravitational' },
};
/** Canonical node for `mond-force` (F, [N]). */
export const mondForceQ: Quantity = {
  name: 'mond-force',
  symbol: 'F',
  dim: FORCE,
  attributes: { scale: 'classical', force: 'gravitational' },
};

// --- BE-39 asymptotic safety ---

/** Canonical node for `newton-coupling-dimensionless` (g = G k², dimensionless). */
export const newtonCouplingQ: Quantity = {
  name: 'newton-coupling-dimensionless',
  symbol: 'g',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `cosmological-constant-dimensionless` (λ = Λ/k², dimensionless). */
export const cosmologicalConstantDimensionlessQ: Quantity = {
  name: 'cosmological-constant-dimensionless',
  symbol: 'λ',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `truncation-coefficient-a` (A, dimensionless). */
export const truncationCoefficientAQ: Quantity = {
  name: 'truncation-coefficient-a',
  symbol: 'A',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `truncation-coefficient-b` (B, dimensionless). */
export const truncationCoefficientBQ: Quantity = {
  name: 'truncation-coefficient-b',
  symbol: 'B',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `truncation-coefficient-c` (C, dimensionless). */
export const truncationCoefficientCQ: Quantity = {
  name: 'truncation-coefficient-c',
  symbol: 'C',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `newton-coupling-beta` (β_g, dimensionless). */
export const newtonCouplingBetaQ: Quantity = {
  name: 'newton-coupling-beta',
  symbol: 'β_g',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};

// --- BE-41 swampland ---

/** Canonical node for `reference-mass` (m₀, [M]). */
export const referenceMassQ: Quantity = {
  name: 'reference-mass',
  symbol: 'm₀',
  dim: MASS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `swampland-coefficient` (α, dimensionless O(1)). */
export const swamplandCoefficientQ: Quantity = {
  name: 'swampland-coefficient',
  symbol: 'α_swamp',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `scalar-field-value` (φ, [M] canonically normalized). */
export const scalarFieldValueQ: Quantity = {
  name: 'scalar-field-value',
  symbol: 'φ',
  dim: MASS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `scalar-field-reference` (φ₀, [M]). */
export const scalarFieldReferenceQ: Quantity = {
  name: 'scalar-field-reference',
  symbol: 'φ₀',
  dim: MASS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `planck-mass` (M_P, [M]). */
export const planckMassQ: Quantity = {
  name: 'planck-mass',
  symbol: 'M_P',
  dim: MASS,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `swampland-tower-mass` (m(φ), [M]). */
export const swamplandTowerMassQ: Quantity = {
  name: 'swampland-tower-mass',
  symbol: 'm(φ)',
  dim: MASS,
  attributes: { scale: 'quantum' },
};

// --- BE-43 ER=EPR ---

/** Canonical node for `wormhole-cross-section-area` (A_wormhole, [L²]). */
export const wormholeCrossSectionAreaQ: Quantity = {
  name: 'wormhole-cross-section-area',
  symbol: 'A_wh',
  dim: AREA,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `wormhole-entanglement-entropy` (S, J/K). */
export const wormholeEntanglementEntropyQ: Quantity = {
  name: 'wormhole-entanglement-entropy',
  symbol: 'S_ER',
  dim: ENTROPY,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};

// --- BE-45 TCC ---

/** Canonical node for `inflation-hubble-energy` (H_inf, energy / natural units). */
export const inflationHubbleEnergyQ: Quantity = {
  name: 'inflation-hubble-energy',
  symbol: 'H_inf',
  dim: ENERGY_DIM2,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};
/** Canonical node for `planck-mass-energy` (M_P in energy units, natural units). */
export const planckMassEnergyQ: Quantity = {
  name: 'planck-mass-energy',
  symbol: 'M_P(E)',
  dim: ENERGY_DIM2,
  attributes: { scale: 'quantum', force: 'gravitational' },
};
/** Canonical node for `tensor-to-scalar-ratio` (r, dimensionless). */
export const tensorToScalarRatioQ: Quantity = {
  name: 'tensor-to-scalar-ratio',
  symbol: 'r',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};
/** Canonical node for `tcc-correction-coefficient` (γ, dimensionless O(1)). */
export const tccCorrectionCoefficientQ: Quantity = {
  name: 'tcc-correction-coefficient',
  symbol: 'γ_tcc',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `max-efolds` (N_e_max, dimensionless). */
export const maxEfoldsQ: Quantity = {
  name: 'max-efolds',
  symbol: 'N_e_max',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};

// --- BE-46 multiverse measure ---

/** Canonical node for `measure-normalization` (A, dimensionless). */
export const measureNormalizationQ: Quantity = {
  name: 'measure-normalization',
  symbol: 'A_norm',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `anthropic-model-parameter` (α, dimensionless). */
export const anthropicModelParameterQ: Quantity = {
  name: 'anthropic-model-parameter',
  symbol: 'α_anth',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `landscape-parameter` (Λ, dimensionless ratio component). */
export const landscapeParameterQ: Quantity = {
  name: 'landscape-parameter',
  symbol: 'Λ_land',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `anthropic-probability` (P(Λ), dimensionless). */
export const anthropicProbabilityQ: Quantity = {
  name: 'anthropic-probability',
  symbol: 'P(Λ)',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological' },
};

// --- BE-47 BBN dark-sector Boltzmann ---

/** Canonical node for `hubble-rate` (H, [T⁻¹]). */
export const hubbleRateQ: Quantity = {
  name: 'hubble-rate',
  symbol: 'H',
  dim: FREQUENCY,
  attributes: { scale: 'cosmological', force: 'gravitational' },
};
/** Canonical node for `nucleon-yield-density` (Y, [L⁻³]). */
export const nucleonYieldDensityQ: Quantity = {
  name: 'nucleon-yield-density',
  symbol: 'Y',
  dim: NUMBER_DENSITY,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `sm-reaction-rate-coefficient` (⟨σv⟩_SM, [L³ T⁻¹]). */
export const smReactionRateCoefficientQ: Quantity = {
  name: 'sm-reaction-rate-coefficient',
  symbol: '⟨σv⟩_SM',
  dim: { L: 3, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 },
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `proton-density` (n_p, [L⁻³]). */
export const protonDensityQ: Quantity = {
  name: 'proton-density',
  symbol: 'n_p',
  dim: NUMBER_DENSITY,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `neutron-density` (n_n, [L⁻³]). */
export const neutronDensityQ: Quantity = {
  name: 'neutron-density',
  symbol: 'n_n',
  dim: NUMBER_DENSITY,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `dark-reaction-rate-coefficient` (⟨σv⟩_dark, [L³ T⁻¹]). */
export const darkReactionRateCoefficientQ: Quantity = {
  name: 'dark-reaction-rate-coefficient',
  symbol: '⟨σv⟩_dark',
  dim: { L: 3, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 },
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `dark-species-density` (n_χ, [L⁻³]). */
export const darkSpeciesDensityQ: Quantity = {
  name: 'dark-species-density',
  symbol: 'n_χ',
  dim: NUMBER_DENSITY,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `transfer-efficiency` (ε, dimensionless). */
export const transferEfficiencyQ: Quantity = {
  name: 'transfer-efficiency',
  symbol: 'ε',
  dim: DIMENSIONLESS,
  attributes: { scale: 'cosmological' },
};
/** Canonical node for `nucleon-yield-rate` (dY/dt, [L⁻³ T⁻¹]). */
export const nucleonYieldRateQ: Quantity = {
  name: 'nucleon-yield-rate',
  symbol: 'dY/dt',
  dim: NUMBER_DENSITY_RATE,
  attributes: { scale: 'cosmological' },
};

// --- BE-49 quantum Darwinism ---

/** Canonical node for `total-mutual-information` (I(S:E), dimensionless). */
export const totalMutualInformationQ: Quantity = {
  name: 'total-mutual-information',
  symbol: 'I(S:E)',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};
/** Canonical node for `darwinism-magnitude` (α, dimensionless prefactor). */
export const darwinismMagnitudeQ: Quantity = {
  name: 'darwinism-magnitude',
  symbol: 'α_QD',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `fragment-count` (k, dimensionless). */
export const fragmentCountQ: Quantity = {
  name: 'fragment-count',
  symbol: 'k',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `darwinism-decay-exponent` (β, dimensionless). */
export const darwinismDecayExponentQ: Quantity = {
  name: 'darwinism-decay-exponent',
  symbol: 'β_QD',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum' },
};
/** Canonical node for `fragment-mutual-information` (I(S:F_k), dimensionless). */
export const fragmentMutualInformationQ: Quantity = {
  name: 'fragment-mutual-information',
  symbol: 'I(S:F_k)',
  dim: DIMENSIONLESS,
  attributes: { scale: 'quantum', information: 'von-neumann' },
};

// --- BE-50 Wheeler-Feynman ---

/** Canonical node for `retarded-field-amplitude` (A_ret, [A] = V·s/m). */
export const retardedFieldAmplitudeQ: Quantity = {
  name: 'retarded-field-amplitude',
  symbol: 'A_ret',
  dim: VECTOR_POTENTIAL,
  attributes: { force: 'electromagnetic' },
};
/** Canonical node for `advanced-field-amplitude` (A_adv, [A] = V·s/m). */
export const advancedFieldAmplitudeQ: Quantity = {
  name: 'advanced-field-amplitude',
  symbol: 'A_adv',
  dim: VECTOR_POTENTIAL,
  attributes: { force: 'electromagnetic' },
};
/** Canonical node for `time-symmetry-residual` (r_TS, dimensionless). */
export const timeSymmetryResidualQ: Quantity = {
  name: 'time-symmetry-residual',
  symbol: 'r_TS',
  dim: DIMENSIONLESS,
  attributes: { force: 'electromagnetic' },
};
