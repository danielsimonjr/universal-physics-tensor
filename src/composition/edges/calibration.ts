/**
 * Calibration edges — catalog-backed `BridgeEdge` wrappers for the
 * v0.8.0 pre-registered composition targets (CT-1, CT-1b, CT-2; see
 * docs/planning/v0.8.0-Design.md §2).
 *
 * Each edge wraps an EXISTING catalog evaluator (the catalog stays
 * authoritative — design D-4) and carries the first-class validity
 * domain the catalog previously kept only as prose (G-8).
 *
 * `lawSchwarzschildRadius` is the first diagonal-law edge (P-1):
 * BE-1–10 laws are not individually catalogued, but composition chains
 * need them as connective tissue — its endpoints SHARE regime
 * attributes (classical/gravitational), the complement of the bridge
 * criterion.
 *
 * @module composition/edges/calibration
 */

import { C_SI, G_SI, HBAR_SI, K_B_SI, M_SUN_SI } from '../../core/constants.js';
import {
  DIMENSIONLESS,
  FREQUENCY,
  LENGTH,
  MASS,
  TEMPERATURE,
} from '../../dimensional/types.js';
import type { Dimension } from '../../dimensional/types.js';
import { evaluateHawkingTemperature } from '../../bridges/equations/be-42-hawking-temperature.js';
import { evaluateDecoherenceRate } from '../../bridges/equations/be-11-decoherence-master.js';
import { evaluateThermalDeBroglie } from '../../bridges/equations/be-12-coherence-length.js';
import { evaluateLandauerEnergy } from '../../bridges/equations/be-16-landauer.js';
import { evaluateGravitationalLensing } from '../../bridges/gravitational-lensing.js';
import { evaluatePerihelionPrecession } from '../../bridges/perihelion-precession.js';
import type { BridgeEdge } from '../edge.js';
import type { Quantity } from '../quantity.js';

/**
 * Solar mass (kg) — alias of `M_SUN_SI` from `src/core/constants.ts`
 * (promoted there in the v0.8.0 punch-list; this re-export keeps the
 * original public name stable).
 *
 * @public
 */
export const M_SUN_KG = M_SUN_SI;

/** s⁻¹: frequency/rate dimension, local alias for readability. */
const FREQUENCY_DIM = FREQUENCY;

/** Joule: energy dimension, local alias for readability. */
const ENERGY_DIM: Dimension = { L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };

// --- Quantity nodes ---

const massQ: Quantity = {
  name: 'mass',
  symbol: 'M',
  dim: MASS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

const schwarzschildRadiusQ: Quantity = {
  name: 'schwarzschild-radius',
  symbol: 'r_s',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

const hawkingTemperatureQ: Quantity = {
  name: 'hawking-temperature',
  symbol: 'T_H',
  dim: TEMPERATURE,
  attributes: { scale: 'quantum', force: 'gravitational' },
};

const temperatureQ: Quantity = {
  name: 'temperature',
  symbol: 'T',
  dim: TEMPERATURE,
  attributes: { scale: 'classical' },
};

const erasureEnergyQ: Quantity = {
  name: 'landauer-erasure-energy',
  symbol: 'E_min',
  dim: ENERGY_DIM,
  attributes: { information: 'shannon' },
};

const impactParameterQ: Quantity = {
  name: 'impact-parameter',
  symbol: 'b',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

const semiMajorAxisQ: Quantity = {
  name: 'semi-major-axis',
  symbol: 'a',
  dim: LENGTH,
  attributes: { scale: 'classical', force: 'gravitational' },
};

const eccentricityQ: Quantity = {
  name: 'eccentricity',
  symbol: 'e',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

const deflectionAngleQ: Quantity = {
  name: 'deflection-angle',
  symbol: 'α',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

const perihelionAdvanceQ: Quantity = {
  name: 'perihelion-advance',
  symbol: 'Δφ',
  dim: DIMENSIONLESS,
  attributes: { scale: 'classical', force: 'gravitational' },
};

// --- Edges ---

/**
 * BE-42 Hawking temperature as a graph edge: mass → hawking-temperature.
 * Endpoints differ in `scale` (classical → quantum): a bridge under the
 * graph-native criterion — the mechanical resolution of the deferred
 * BE-42 NOT-A-BRIDGE dispute.
 *
 * @public
 */
export const be42Edge: BridgeEdge = {
  id: 'be-42',
  beId: 42,
  kind: 'bridge',
  label: 'Hawking temperature T_H = ℏc³/(8πGMk_B)',
  sources: [massQ],
  target: hawkingTemperatureQ,
  confidence: 'highly-speculative',
  domain: {
    description: 'M > 0 and finite (positive black-hole mass)',
    predicate: (i) => Number.isFinite(i['mass']) && i['mass'] > 0,
  },
  evaluate: (i) => evaluateHawkingTemperature({ M_kg: i['mass'] }),
  citation: 'Hawking 1975 CMP 43:199',
};

/**
 * BE-16 Landauer bound as a graph edge: temperature → erasure energy.
 * Endpoints differ in stated axes (thermal/classical → information):
 * a bridge.
 *
 * @public
 */
export const be16Edge: BridgeEdge = {
  id: 'be-16',
  beId: 16,
  kind: 'bridge',
  label: "Landauer's bound E_min = k_B T ln2",
  sources: [temperatureQ],
  target: erasureEnergyQ,
  confidence: 'speculative',
  domain: {
    description: 'T ≥ 0 and finite (thermodynamic temperature)',
    predicate: (i) => Number.isFinite(i['temperature']) && i['temperature'] >= 0,
  },
  evaluate: (i) => evaluateLandauerEnergy({ temperature_K: i['temperature'] }),
  citation: 'Landauer 1961 IBM JRD 5:183',
};

/**
 * Diagonal-law edge (P-1): Schwarzschild radius r_s = 2GM/c². Endpoints
 * share regime attributes (classical/gravitational) — a law, not a
 * bridge. `beId: null`: the GR diagonal is not individually catalogued.
 *
 * @public
 */
export const lawSchwarzschildRadius: BridgeEdge = {
  id: 'law-schwarzschild-radius',
  beId: null,
  kind: 'law',
  label: 'Schwarzschild radius r_s = 2GM/c²',
  sources: [massQ],
  target: schwarzschildRadiusQ,
  confidence: 'established',
  domain: {
    description: 'M > 0 and finite',
    predicate: (i) => Number.isFinite(i['mass']) && i['mass'] > 0,
  },
  evaluate: (i) => (2 * G_SI * i['mass']) / (C_SI * C_SI),
  citation: 'Schwarzschild 1916; Carroll 2004 Spacetime and Geometry §5.4',
};

/**
 * BE-42 re-parameterized through the horizon radius:
 * T_H = ℏc/(4π k_B r_s) — algebraically identical to the M-form under
 * r_s = 2GM/c² (verified in the Adam vet, checklist 4). Used by the
 * CT-1b three-edge chain to demonstrate laws as connective tissue.
 *
 * @public
 */
export const be42ViaRsEdge: BridgeEdge = {
  id: 'be-42-via-rs',
  beId: 42,
  kind: 'bridge',
  label: 'Hawking temperature T_H = ℏc/(4π k_B r_s)',
  sources: [schwarzschildRadiusQ],
  target: hawkingTemperatureQ,
  confidence: 'highly-speculative',
  domain: {
    description: 'r_s > 0 and finite',
    predicate: (i) =>
      Number.isFinite(i['schwarzschild-radius']) && i['schwarzschild-radius'] > 0,
  },
  evaluate: (i) =>
    (HBAR_SI * C_SI) / (4 * Math.PI * K_B_SI * i['schwarzschild-radius']),
  citation: 'Hawking 1975 CMP 43:199 (r_s parameterization)',
};

/**
 * BE-51 Eddington lensing as a graph edge: (mass, impact-parameter) →
 * deflection angle. Wraps the v0.4.0 evaluator, extracting `alpha_rad`
 * from its result object (Adam A-10).
 *
 * @public
 */
export const be51Edge: BridgeEdge = {
  id: 'be-51',
  beId: 51,
  kind: 'bridge',
  label: 'Gravitational lensing α = 4GM/(bc²)',
  sources: [massQ, impactParameterQ],
  target: deflectionAngleQ,
  confidence: 'established',
  domain: {
    description: 'M > 0, b > 0, and weak field b ≥ 10·r_s',
    predicate: (i) =>
      Number.isFinite(i['mass']) &&
      i['mass'] > 0 &&
      Number.isFinite(i['impact-parameter']) &&
      i['impact-parameter'] > 0 &&
      i['impact-parameter'] >= (10 * 2 * G_SI * i['mass']) / (C_SI * C_SI),
  },
  evaluate: (i) =>
    evaluateGravitationalLensing({ M_kg: i['mass'], b_m: i['impact-parameter'] })
      .alpha_rad,
  citation: 'Dyson, Eddington & Davidson 1920 Phil. Trans. R. Soc. A 220:291',
};

/**
 * BE-52 perihelion precession as a graph edge: (mass, semi-major-axis,
 * eccentricity) → advance per orbit. Wraps the v0.4.0 evaluator,
 * extracting `dphi_rad_per_orbit`; forwards `T_yr: 1` — the evaluator
 * requires a positive period but the per-orbit advance does not use it
 * (Adam A-10).
 *
 * @public
 */
export const be52Edge: BridgeEdge = {
  id: 'be-52',
  beId: 52,
  kind: 'bridge',
  label: 'Perihelion precession Δφ = 6πGM/(a(1−e²)c²)',
  sources: [massQ, semiMajorAxisQ, eccentricityQ],
  target: perihelionAdvanceQ,
  confidence: 'established',
  domain: {
    description: 'M > 0, a > 0, 0 ≤ e < 1 (bound elliptical orbit)',
    predicate: (i) =>
      Number.isFinite(i['mass']) &&
      i['mass'] > 0 &&
      Number.isFinite(i['semi-major-axis']) &&
      i['semi-major-axis'] > 0 &&
      Number.isFinite(i['eccentricity']) &&
      i['eccentricity'] >= 0 &&
      i['eccentricity'] < 1,
  },
  evaluate: (i) =>
    evaluatePerihelionPrecession({
      M_kg: i['mass'],
      a_m: i['semi-major-axis'],
      e: i['eccentricity'],
      T_yr: 1,
    }).dphi_rad_per_orbit,
  citation: 'Einstein 1915 Preuss. Akad. Wiss. 831',
};

// --- CT-3 (C1) edges — registered in v0.8.0-Design.md §9 BEFORE this code ---

const temperatureSourceQ: Quantity = {
  name: 'temperature',
  symbol: 'T',
  dim: TEMPERATURE,
  attributes: { scale: 'classical' },
};

const thermalDeBroglieQ: Quantity = {
  name: 'thermal-de-broglie-wavelength',
  symbol: 'λ_T',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};

const relaxationRateQ: Quantity = {
  name: 'relaxation-rate',
  symbol: 'γ_relax',
  dim: FREQUENCY_DIM,
  attributes: { scale: 'classical' },
};

const superpositionExtentQ: Quantity = {
  name: 'superposition-extent',
  symbol: 'Δx',
  dim: LENGTH,
  attributes: { scale: 'quantum' },
};

const decoherenceRateQ: Quantity = {
  name: 'decoherence-rate',
  symbol: 'Γ_dec',
  dim: FREQUENCY_DIM,
  attributes: { scale: 'classical' },
};

/**
 * BE-12 thermal de Broglie wavelength as a graph edge:
 * (mass, temperature) → λ_T. Endpoints differ in `scale`
 * (classical inputs → quantum length): a bridge.
 *
 * @public
 */
export const be12Edge: BridgeEdge = {
  id: 'be-12',
  beId: 12,
  kind: 'bridge',
  label: 'Thermal de Broglie wavelength λ_T = √(2πℏ²/(m k_B T))',
  sources: [massQ, temperatureSourceQ],
  target: thermalDeBroglieQ,
  confidence: 'speculative',
  domain: {
    description: 'm > 0 and T > 0 (massive particle, finite temperature)',
    predicate: (i) =>
      Number.isFinite(i['mass']) &&
      i['mass'] > 0 &&
      Number.isFinite(i['temperature']) &&
      i['temperature'] > 0,
  },
  evaluate: (i) =>
    evaluateThermalDeBroglie({ m_kg: i['mass'], T_K: i['temperature'] }),
  citation: 'Pathria 2011 Statistical Mechanics §7.1; de Broglie 1924',
};

/**
 * BE-11's Caldeira-Leggett quadratic-coupling rate γ₀·(λ/λ₀)²
 * realized for SPATIAL superpositions: the reference coupling λ₀ IS
 * the thermal de Broglie wavelength (the CT-3 physics judgment —
 * Zurek 1991 Phys. Today 44(10):36; Zurek 2003 RMP 75:715 §III.E).
 * Γ_dec = γ_relax · (Δx/λ_T)².
 *
 * @public
 */
export const be11ZurekEdge: BridgeEdge = {
  id: 'be-11-zurek',
  beId: 11,
  kind: 'bridge',
  label: 'Zurek/CL spatial decoherence rate Γ_dec = γ_relax (Δx/λ_T)²',
  sources: [relaxationRateQ, superpositionExtentQ, thermalDeBroglieQ],
  target: decoherenceRateQ,
  confidence: 'established',
  domain: {
    description: 'γ_relax ≥ 0, Δx > 0, λ_T > 0',
    predicate: (i) =>
      Number.isFinite(i['relaxation-rate']) &&
      i['relaxation-rate'] >= 0 &&
      Number.isFinite(i['superposition-extent']) &&
      i['superposition-extent'] > 0 &&
      Number.isFinite(i['thermal-de-broglie-wavelength']) &&
      i['thermal-de-broglie-wavelength'] > 0,
  },
  evaluate: (i) =>
    evaluateDecoherenceRate({
      gamma0_per_s: i['relaxation-rate'],
      lambda: i['superposition-extent'],
      lambda0: i['thermal-de-broglie-wavelength'],
    }),
  citation:
    'Caldeira & Leggett 1983 Physica A 121:587; Zurek 1991 Phys. Today 44(10):36',
};
