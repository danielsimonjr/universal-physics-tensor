/**
 * Catalog-full edges — the v0.11 headline: migrate the remaining catalog
 * bridges (those with a USABLE numerical evaluator) to composition-graph
 * `BridgeEdge`s, extending the v0.8.0 calibration + v0.10.0 catalog-tranche
 * sets. Each edge wraps an EXISTING validated catalog evaluator (the catalog
 * stays authoritative — design D-4) and carries a first-class validity
 * domain (G-8) mirroring exactly what the wrapped evaluator enforces.
 *
 * Quantity-name discipline (v0.11 namespacing gate, Option D): every node is
 * defined ONCE in `src/composition/quantities.ts`. Where the physics matches
 * an existing canonical node we REUSE it (`relaxation-rate`, `decoherence-rate`,
 * `temperature`, `mass`, `mass-density`); where the name would collide but the
 * physics DIFFERS we pick a distinct name — e.g. BE-23/BE-26 carrier/proton
 * masses become `effective-mass` / `tunneling-mass`, NOT the gravitational
 * `mass`. BE-13 and BE-31 share the `ricci-scalar` target (both produce the
 * scalar curvature R [L⁻²]).
 *
 * NOT-A-BRIDGE entries — NO edges created (per src/bridges/rejected.ts
 * REJECTED_BRIDGE_IDS): BE-28 (Onsager/MEPP), BE-29 (Jarzynski), BE-32
 * (quantum reference frames), BE-35 (conformal bootstrap), BE-40 (composite
 * Higgs). Rejected adjudications are not bridges and get no graph edge.
 *
 * Other skips (no scalar-Record evaluator): BE-44 soft-hair — its evaluator
 * `evaluateBE44SoftHairCharge` takes a `number[]` news-sample array + grid
 * spacing, not a `Record<string, number>` of scalar quantities, so it cannot
 * be lowered onto the (sources → scalars) edge contract without an array
 * quantity primitive the graph does not yet have.
 *
 * @module composition/edges/catalog-full
 */

import { evaluateDecoherenceRate } from '../../bridges/equations/be-11-decoherence-master.js';
import { evaluateEinsteinTrace } from '../../bridges/equations/be-13-einstein-trace.js';
import { evaluateCoarseningLength } from '../../bridges/equations/be-15-emergence.js';
import { evaluateBE17SpinDensitySquared } from '../../bridges/equations/be-17-einstein-cartan.js';
import { evaluateHiggsMass } from '../../bridges/equations/be-18-higgs-mass.js';
import { evaluateCosmologicalConstantDensity } from '../../bridges/equations/be-20-vacuum-energy.js';
import { evaluateTEE } from '../../bridges/equations/be-22-topological-entanglement.js';
import { evaluateSYKResistivity } from '../../bridges/equations/be-23-syk-planckian.js';
import { evaluateFRETEfficiency } from '../../bridges/equations/be-24-foerster-fret.js';
import { evaluateIntrinsicInformation } from '../../bridges/equations/be-25-iit-phi.js';
import { evaluateDNATunneling } from '../../bridges/equations/be-26-dna-tunneling.js';
import { evaluateEffectiveTemperature } from '../../bridges/equations/be-27-effective-temperature.js';
import { evaluateFLMFirstLaw } from '../../bridges/equations/be-30-flm-first-law.js';
import { evaluateBenincasaDowker } from '../../bridges/equations/be-31-causal-set-bd.js';
import { evaluateHertzMillis } from '../../bridges/equations/be-33-hertz-millis.js';
import { evaluateKibbleZurek } from '../../bridges/equations/be-34-kibble-zurek.js';
import { evaluateGWSpeedRatio } from '../../bridges/equations/be-36-gw-speed-bound.js';
import { evaluateMONDForce } from '../../bridges/equations/be-38-mond.js';
import { evaluateBetaG } from '../../bridges/equations/be-39-asymptotic-safety.js';
import { evaluateSwampland } from '../../bridges/equations/be-41-swampland.js';
import { evaluateEREPRBound } from '../../bridges/equations/be-43-er-epr.js';
import { evaluateTCC } from '../../bridges/equations/be-45-tcc.js';
import { evaluateWeinbergVilenkinP } from '../../bridges/equations/be-46-multiverse-measure.js';
import { evaluateBBNDark } from '../../bridges/equations/be-47-bbn-dark-sector.js';
import { evaluateQuantumDarwinism } from '../../bridges/equations/be-49-quantum-darwinism.js';
import { evaluateWFTimeSymmetry } from '../../bridges/equations/be-50-wheeler-feynman.js';
import type { BridgeEdge } from '../edge.js';
import type { ExprNode } from '../../dimensional/validator.js';
import type { Dimension } from '../../dimensional/types.js';
import { LENGTH, TEMPERATURE, DIMENSIONLESS } from '../../dimensional/types.js';
import {
  activeNoiseEnergyQ,
  advancedFieldAmplitudeQ,
  anthropicModelParameterQ,
  anthropicProbabilityQ,
  areaLawCoefficientQ,
  attemptFrequencyQ,
  barrierHeightQ,
  barrierWidthQ,
  biologicalRateCorrectionQ,
  boundaryLengthQ,
  carrierDensityQ,
  causalSetCount0Q,
  causalSetCount1Q,
  causalSetCount2Q,
  causalSetCount3Q,
  coarseningLengthQ,
  conditionalProbabilityQ,
  cosmologicalConstantCurvatureQ,
  cosmologicalConstantDimensionlessQ,
  couplingPrefactorSquaredQ,
  darkFermionMassQ,
  darkReactionRateCoefficientQ,
  darkSpeciesDensityQ,
  darwinismDecayExponentQ,
  darwinismMagnitudeQ,
  decoherenceRateQ,
  defectDensityQ,
  defectRestMassQ,
  donorAcceptorDistanceQ,
  dynamicExponentZQ,
  effectiveMassQ,
  effectiveTemperatureQ,
  entanglementEntropyVariationQ,
  foersterRadiusQ,
  fragmentCountQ,
  fragmentMutualInformationQ,
  fretEfficiencyQ,
  gravitationalWaveSpeedQ,
  gwPhotonSpeedRatioQ,
  hubbleRateQ,
  inflationHubbleEnergyQ,
  intrinsicInformationQ,
  lambdaMassDensityQ,
  landscapeParameterQ,
  marginalProbabilityQ,
  maxEfoldsQ,
  measureNormalizationQ,
  microscopicRelaxationTimeQ,
  modelAMobilityQ,
  modularHamiltonianVariationQ,
  mondAccelerationScaleQ,
  mondForceQ,
  mutationRateQ,
  massQ,
  neutronDensityQ,
  newtonCouplingBetaQ,
  newtonCouplingQ,
  newtonianForceQ,
  nucleonYieldDensityQ,
  nucleonYieldRateQ,
  planckLengthQ,
  planckMassEnergyQ,
  planckMassQ,
  protonDensityQ,
  quantumCorrelationLengthQ,
  quenchTimescaleQ,
  referenceCorrelationLengthQ,
  referenceCouplingQ,
  referenceMassQ,
  referenceTemperatureQ,
  reheatingTemperatureQ,
  relaxationRateQ,
  residualResistivityQ,
  resistivityQ,
  retardedFieldAmplitudeQ,
  ricciScalarQ,
  scalarFieldReferenceQ,
  scalarFieldValueQ,
  smReactionRateCoefficientQ,
  spatialDimensionQ,
  spinDensitySquaredQ,
  staticExponentNuQ,
  stressEnergyTraceQ,
  subsystemEntanglementEntropyQ,
  swamplandCoefficientQ,
  swamplandTowerMassQ,
  sykCoefficientQ,
  systemEnvironmentCouplingQ,
  tccCorrectionCoefficientQ,
  temperatureQ,
  tensorToScalarRatioQ,
  timeQ,
  timeSymmetryResidualQ,
  topologicalEntanglementEntropyQ,
  torsionContractionScalarQ,
  totalMutualInformationQ,
  transferEfficiencyQ,
  truncationCoefficientAQ,
  truncationCoefficientBQ,
  truncationCoefficientCQ,
  tunnelingMassQ,
  vacuumExpectationValueQ,
  wormholeCrossSectionAreaQ,
  wormholeEntanglementEntropyQ,
  yukawaCouplingQ,
} from '../quantities.js';

const isFin = Number.isFinite;

// --- Symbolic forms (v0.24 — clean-monomial bridges for the identity-consequence
// surfacer). Leaves are source-quantity names + CONSTANTS tokens; dims match the
// Quantity/CONSTANTS dim. Drift-guarded against `evaluate` in
// symbolic-composition.test.ts (SYMBOLIC_EDGES). ---
const symN = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });
const ENERGY_DIM: Dimension = { L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
const VELOCITY_DIM: Dimension = { L: 1, M: 0, T: -1, I: 0, Theta: 0, N: 0, J: 0 };
const GRAV_DIM: Dimension = { L: 3, M: -1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
const LAMBDA_CURV_DIM: Dimension = { L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };

/** m_dark = yukawa-coupling · vacuum-expectation-value (g·v). */
const BE18_SYMBOLIC: ExprNode = {
  kind: 'op',
  op: '*',
  args: [symN('yukawa-coupling', DIMENSIONLESS), symN('vacuum-expectation-value', ENERGY_DIM)],
};

/** ρ_Λ = c²·cosmological-constant-curvature / (8π·G). */
const BE20_SYMBOLIC: ExprNode = {
  kind: 'op',
  op: '/',
  args: [
    {
      kind: 'op',
      op: '*',
      args: [
        { kind: 'op', op: '^', args: [symN('c', VELOCITY_DIM), symN('2', DIMENSIONLESS)] },
        symN('cosmological-constant-curvature', LAMBDA_CURV_DIM),
      ],
    },
    { kind: 'op', op: '*', args: [symN('8pi', DIMENSIONLESS), symN('G', GRAV_DIM)] },
  ],
};

/**
 * BE-11 canonical decoherence master rate (Caldeira-Leggett weak-coupling
 * form): (relaxation-rate, system-environment-coupling, reference-coupling) →
 * γ_k = γ_0 (λ/λ_0)². Wraps `evaluateDecoherenceRate` (γ_0 in s⁻¹, λ/λ_0 in
 * any consistent unit; returns s⁻¹). DISTINCT from {@link be11ZurekEdge}: that
 * one is the SPATIAL specialization (λ₀ = thermal de Broglie wavelength); this
 * is the bare coupling-ratio master rate. Both wrap the same evaluator but on
 * different source quantities.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be11Edge: BridgeEdge = {
  id: 'be-11-master',
  beId: 11,
  kind: 'bridge',
  label: 'Decoherence master rate γ_k = γ_0 (λ/λ_0)²',
  sources: [relaxationRateQ, systemEnvironmentCouplingQ, referenceCouplingQ],
  target: decoherenceRateQ,
  confidence: 'established',
  domain: {
    description: 'γ_0 ≥ 0, λ finite, λ_0 > 0',
    predicate: (i) =>
      isFin(i['relaxation-rate']) &&
      i['relaxation-rate'] >= 0 &&
      isFin(i['system-environment-coupling']) &&
      isFin(i['reference-coupling']) &&
      i['reference-coupling'] > 0,
  },
  evaluate: (i) =>
    evaluateDecoherenceRate({
      gamma0_per_s: i['relaxation-rate'],
      lambda: i['system-environment-coupling'],
      lambda0: i['reference-coupling'],
    }),
  citation: 'Caldeira & Leggett 1983 Physica A 121:587; Lindblad 1976 CMP 48:119',
};

/**
 * BE-13 trace of Einstein equations: (cosmological-constant-curvature,
 * stress-energy-trace) → R = 4Λ − (8πG/c⁴) T. Wraps `evaluateEinsteinTrace`
 * (Λ in m⁻², T in J/m³; returns R in m⁻²). Shares the `ricci-scalar` target
 * with {@link be31Edge}.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be13Edge: BridgeEdge = {
  id: 'be-13',
  beId: 13,
  kind: 'bridge',
  label: 'Einstein trace R = 4Λ − (8πG/c⁴) T',
  sources: [cosmologicalConstantCurvatureQ, stressEnergyTraceQ],
  target: ricciScalarQ,
  confidence: 'speculative',
  domain: {
    description: 'Λ and T finite (all SI)',
    predicate: (i) =>
      isFin(i['cosmological-constant-curvature']) &&
      isFin(i['stress-energy-trace']),
  },
  evaluate: (i) =>
    evaluateEinsteinTrace({
      Lambda_per_m2: i['cosmological-constant-curvature'],
      T_trace_J_per_m3: i['stress-energy-trace'],
    }),
  citation: 'Jacobson 1995 PRL 75:1260; MTW Gravitation §17.4',
};

/**
 * BE-15 Kawasaki-Gunton coarsening length: (model-a-mobility, time) →
 * L(t) = √(Γ t). Wraps `evaluateCoarseningLength` (Γ in m²/s, t in s; returns
 * m). Endpoints differ in `scale` (microscale kinetic coefficient → emergent
 * correlation length): a bridge.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be15Edge: BridgeEdge = {
  id: 'be-15',
  beId: 15,
  kind: 'bridge',
  label: 'Model A coarsening length L(t) = √(Γ t)',
  sources: [modelAMobilityQ, timeQ],
  target: coarseningLengthQ,
  confidence: 'speculative',
  domain: {
    description: 'Γ > 0 and t > 0 (all SI)',
    predicate: (i) =>
      isFin(i['model-a-mobility']) &&
      i['model-a-mobility'] > 0 &&
      isFin(i['time']) &&
      i['time'] > 0,
  },
  evaluate: (i) =>
    evaluateCoarseningLength({ gamma: i['model-a-mobility'], t: i['time'] }),
  citation: 'Kawasaki & Gunton 1976 PRA 13:2294; Hohenberg & Halperin 1977 RMP 49:435',
};

/**
 * BE-17 Einstein-Cartan torsion-spin squared invariant:
 * (einstein-coupling-prefactor-squared, torsion-contraction-scalar) →
 * S²_spin = (c⁴/8πG)² · T_λμν T^λμν. Wraps `evaluateBE17SpinDensitySquared`
 * (prefactor in [M²L²T⁻⁴], contraction in [T²L⁻⁴]; returns [M²L⁻²T⁻²]).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be17Edge: BridgeEdge = {
  id: 'be-17',
  beId: 17,
  kind: 'bridge',
  label: 'Einstein-Cartan S²_spin = (c⁴/8πG)² · T·T',
  sources: [couplingPrefactorSquaredQ, torsionContractionScalarQ],
  target: spinDensitySquaredQ,
  confidence: 'speculative',
  domain: {
    description: 'prefactor finite, torsion contraction ≥ 0 (sum of squares)',
    predicate: (i) =>
      isFin(i['einstein-coupling-prefactor-squared']) &&
      isFin(i['torsion-contraction-scalar']) &&
      i['torsion-contraction-scalar'] >= 0,
  },
  evaluate: (i) =>
    evaluateBE17SpinDensitySquared({
      coupling_prefactor_squared: i['einstein-coupling-prefactor-squared'],
      torsion_squared: i['torsion-contraction-scalar'],
    }),
  citation: 'Hehl et al. 1976 RMP 48:393; Cartan 1922 C. R. Acad. Sci. 174:593',
};

/**
 * BE-18 Higgs-like dark mass generation: (yukawa-coupling,
 * vacuum-expectation-value) → m_dark = g_dark · v_dark (natural units;
 * mass-as-energy). Wraps `evaluateHiggsMass` (g dimensionless, v in GeV;
 * returns GeV).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be18Edge: BridgeEdge = {
  id: 'be-18',
  beId: 18,
  kind: 'bridge',
  label: 'Higgs-like dark mass m_dark = g_dark · v_dark',
  sources: [yukawaCouplingQ, vacuumExpectationValueQ],
  target: darkFermionMassQ,
  confidence: 'speculative',
  domain: {
    description: 'g_dark and v_dark finite',
    predicate: (i) =>
      isFin(i['yukawa-coupling']) && isFin(i['vacuum-expectation-value']),
  },
  evaluate: (i) =>
    evaluateHiggsMass({
      g_dark: i['yukawa-coupling'],
      v_dark_GeV: i['vacuum-expectation-value'],
    }),
  symbolic: BE18_SYMBOLIC,
  citation: 'Peskin & Schroeder 1995 QFT §20.1',
};

/**
 * BE-20 cosmological-constant mass density:
 * cosmological-constant-curvature → ρ_Λ = c² Λ / (8πG). Wraps
 * `evaluateCosmologicalConstantDensity` (Λ in m⁻²; returns kg/m³). Reuses the
 * BE-13/BE-31 `cosmological-constant-curvature` source node (the same Λ in
 * [L⁻²]).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be20Edge: BridgeEdge = {
  id: 'be-20',
  beId: 20,
  kind: 'bridge',
  label: 'Cosmological-constant density ρ_Λ = c² Λ / (8πG)',
  sources: [cosmologicalConstantCurvatureQ],
  target: lambdaMassDensityQ,
  confidence: 'speculative',
  domain: {
    description: 'Λ ≥ 0 and finite (m⁻²)',
    predicate: (i) =>
      isFin(i['cosmological-constant-curvature']) &&
      i['cosmological-constant-curvature'] >= 0,
  },
  evaluate: (i) =>
    evaluateCosmologicalConstantDensity({
      Lambda_per_m2: i['cosmological-constant-curvature'],
    }),
  symbolic: BE20_SYMBOLIC,
  citation: 'Carroll 2001 Living Rev. Relativity 4:1; Planck 2020 A&A 641:A6',
};

/**
 * BE-22 topological entanglement entropy: (area-law-coefficient,
 * boundary-length, topological-entanglement-entropy) → S(R) = α·L − γ (nats).
 * Wraps `evaluateTEE` (α in m⁻¹, L in m, γ in nats; returns nats).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be22Edge: BridgeEdge = {
  id: 'be-22',
  beId: 22,
  kind: 'bridge',
  label: 'Topological entanglement entropy S(R) = α·L − γ',
  sources: [areaLawCoefficientQ, boundaryLengthQ, topologicalEntanglementEntropyQ],
  target: subsystemEntanglementEntropyQ,
  confidence: 'speculative',
  domain: {
    description: 'α finite, L ≥ 0, γ finite',
    predicate: (i) =>
      isFin(i['area-law-coefficient']) &&
      isFin(i['boundary-length']) &&
      i['boundary-length'] >= 0 &&
      isFin(i['topological-entanglement-entropy']),
  },
  evaluate: (i) =>
    evaluateTEE({
      alpha_per_meter: i['area-law-coefficient'],
      perimeter_m: i['boundary-length'],
      gamma: i['topological-entanglement-entropy'],
    }),
  citation: 'Kitaev & Preskill 2006 PRL 96:110404; Levin & Wen 2006 PRL 96:110405',
};

/**
 * BE-23 SYK Planckian resistivity: (residual-resistivity, effective-mass,
 * carrier-density, temperature, syk-coefficient) →
 * ρ(T) = ρ_0 + (m* k_B T)/(n_e e² ℏ) · α_SYK. Wraps `evaluateSYKResistivity`
 * (SI; returns Ω·m). Uses `effective-mass` (carrier band mass), DISTINCT from
 * the gravitational `mass` node — the namespacing gate in action. Reuses the
 * canonical `temperature` node.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be23Edge: BridgeEdge = {
  id: 'be-23',
  beId: 23,
  kind: 'bridge',
  label: 'SYK Planckian resistivity ρ(T) = ρ_0 + (m* k_B T)/(n_e e² ℏ)·α_SYK',
  sources: [residualResistivityQ, effectiveMassQ, carrierDensityQ, temperatureQ, sykCoefficientQ],
  target: resistivityQ,
  confidence: 'speculative',
  domain: {
    description: 'ρ_0 ≥ 0, m* > 0, n_e > 0, T ≥ 0, α_SYK finite',
    predicate: (i) =>
      isFin(i['residual-resistivity']) &&
      i['residual-resistivity'] >= 0 &&
      isFin(i['effective-mass']) &&
      i['effective-mass'] > 0 &&
      isFin(i['carrier-density']) &&
      i['carrier-density'] > 0 &&
      isFin(i['temperature']) &&
      i['temperature'] >= 0 &&
      isFin(i['syk-coefficient']),
  },
  evaluate: (i) =>
    evaluateSYKResistivity({
      rho_0: i['residual-resistivity'],
      m_star_kg: i['effective-mass'],
      n_e_per_m3: i['carrier-density'],
      T_K: i['temperature'],
      alpha_SYK: i['syk-coefficient'],
    }),
  citation: 'Sachdev & Ye 1993 PRL 70:3339; Hartnoll 2015 Nature Phys. 11:54',
};

/**
 * BE-24 Förster FRET efficiency: (donor-acceptor-distance, foerster-radius) →
 * η = R_0⁶/(R_0⁶ + R⁶). Wraps `evaluateFRETEfficiency` (R, R_0 in m; returns
 * dimensionless ∈ [0,1]).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be24Edge: BridgeEdge = {
  id: 'be-24',
  beId: 24,
  kind: 'bridge',
  label: 'FRET efficiency η = R_0⁶/(R_0⁶ + R⁶)',
  sources: [donorAcceptorDistanceQ, foersterRadiusQ],
  target: fretEfficiencyQ,
  confidence: 'speculative',
  domain: {
    description: 'R > 0 and R_0 > 0',
    predicate: (i) =>
      isFin(i['donor-acceptor-distance']) &&
      i['donor-acceptor-distance'] > 0 &&
      isFin(i['foerster-radius']) &&
      i['foerster-radius'] > 0,
  },
  evaluate: (i) =>
    evaluateFRETEfficiency({
      R: i['donor-acceptor-distance'],
      R_0: i['foerster-radius'],
    }),
  citation: 'Förster 1948 Ann. Phys. 437:55; Lakowicz 2006 Princ. Fluoresc. Spectrosc. Ch.13',
};

/**
 * BE-25 IIT intrinsic information (the IIT module, NOT orch-or):
 * (conditional-probability, marginal-probability) → ii = p_cond·log₂(p_cond/p_marg).
 * Wraps `evaluateIntrinsicInformation` (both ∈ [0,1]; returns bits). Note the
 * evaluator throws RangeError on the KL singularity p_cond>0, p_marg=0; the
 * domain rejects that case so `evaluateEdge` surfaces a DomainViolationError
 * instead.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be25Edge: BridgeEdge = {
  id: 'be-25',
  beId: 25,
  kind: 'bridge',
  label: 'IIT intrinsic information ii = p(s̃|s)·log₂[p(s̃|s)/p(s̃)]',
  sources: [conditionalProbabilityQ, marginalProbabilityQ],
  target: intrinsicInformationQ,
  confidence: 'speculative',
  domain: {
    description: 'p_cond, p_marg ∈ [0,1]; not (p_cond>0 and p_marg=0) (KL singularity)',
    predicate: (i) => {
      const pc = i['conditional-probability'];
      const pm = i['marginal-probability'];
      if (!isFin(pc) || pc < 0 || pc > 1) return false;
      if (!isFin(pm) || pm < 0 || pm > 1) return false;
      if (pc > 0 && pm === 0) return false;
      return true;
    },
  },
  evaluate: (i) =>
    evaluateIntrinsicInformation({
      p_cond: i['conditional-probability'],
      p_marg: i['marginal-probability'],
    }),
  citation: 'Tononi 2008 Biol. Bull. 215:216; Oizumi, Albantakis & Tononi 2014 PLoS Comput. Biol. 10:e1003588',
};

/**
 * BE-26 DNA mutation tunneling rate: (attempt-frequency, tunneling-mass,
 * barrier-height, barrier-width, biological-rate-correction) →
 * Γ = ν₀ exp[−(2/ℏ)√(2m(V−E))·L]·f. Wraps `evaluateDNATunneling` (SI; returns
 * s⁻¹). `tunneling-mass` is the proton mass, DISTINCT from gravitational `mass`.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be26Edge: BridgeEdge = {
  id: 'be-26',
  beId: 26,
  kind: 'bridge',
  label: 'DNA tunneling Γ = ν₀ exp[−(2/ℏ)√(2m(V−E))·L]·f',
  sources: [attemptFrequencyQ, tunnelingMassQ, barrierHeightQ, barrierWidthQ, biologicalRateCorrectionQ],
  target: mutationRateQ,
  // Catalog index status: field is authoritative (CLAUDE.md). BE-26's
  // module docstring says 'established' but the registry pins 'speculative'.
  confidence: 'speculative',
  domain: {
    description: 'ν₀ ≥ 0, m > 0, V−E ≥ 0, barrier-width > 0, f finite',
    predicate: (i) =>
      isFin(i['attempt-frequency']) &&
      i['attempt-frequency'] >= 0 &&
      isFin(i['tunneling-mass']) &&
      i['tunneling-mass'] > 0 &&
      isFin(i['barrier-height']) &&
      i['barrier-height'] >= 0 &&
      isFin(i['barrier-width']) &&
      i['barrier-width'] > 0 &&
      isFin(i['biological-rate-correction']),
  },
  evaluate: (i) =>
    evaluateDNATunneling({
      nu_0: i['attempt-frequency'],
      m: i['tunneling-mass'],
      V_minus_E: i['barrier-height'],
      barrier_width: i['barrier-width'],
      f_correction: i['biological-rate-correction'],
    }),
  citation: 'Löwdin 1963 Adv. Quantum Chem. 2:213; Gamow 1928',
};

/**
 * BE-27 Cugliandolo-Kurchan effective temperature: (temperature,
 * active-noise-energy) → T_eff = T(1 + Σ_active/(k_B T)). Wraps
 * `evaluateEffectiveTemperature` (T in K, Σ in J; returns K). Reuses the
 * canonical `temperature` node.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be27Edge: BridgeEdge = {
  id: 'be-27',
  beId: 27,
  kind: 'bridge',
  label: 'Effective temperature T_eff = T(1 + Σ_active/(k_B T))',
  sources: [temperatureQ, activeNoiseEnergyQ],
  target: effectiveTemperatureQ,
  confidence: 'speculative',
  domain: {
    description: 'T > 0 and Σ_active finite',
    predicate: (i) =>
      isFin(i['temperature']) &&
      i['temperature'] > 0 &&
      isFin(i['active-noise-energy']),
  },
  evaluate: (i) =>
    evaluateEffectiveTemperature({
      T_K: i['temperature'],
      Sigma_active_J: i['active-noise-energy'],
    }),
  citation: 'Cugliandolo & Kurchan 1993 J. Phys. A 26:L401',
};

/**
 * BE-30 FLM first law of entanglement entropy: modular-hamiltonian-variation →
 * δS_EE = δ⟨H_R⟩. Wraps `evaluateFLMFirstLaw` (nats; tautological identity).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be30Edge: BridgeEdge = {
  id: 'be-30',
  beId: 30,
  kind: 'bridge',
  label: 'FLM first law δS_EE = δ⟨H_R⟩',
  sources: [modularHamiltonianVariationQ],
  target: entanglementEntropyVariationQ,
  confidence: 'speculative',
  domain: {
    description: 'δ⟨H_R⟩ finite (nats)',
    predicate: (i) => isFin(i['modular-hamiltonian-variation']),
  },
  evaluate: (i) =>
    evaluateFLMFirstLaw({ delta_avg_H_R: i['modular-hamiltonian-variation'] }),
  citation: 'Faulkner, Lewkowycz & Maldacena 2013 JHEP 11:074; Blanco et al. 2013 JHEP 08:060',
};

/**
 * BE-31 Benincasa-Dowker discrete Ricci scalar (d=4): (causal-set-count-0..3,
 * planck-length) → R(p) = (4/√6)ℓ_P⁻²·[1 + N_0 − 9N_1 + 16N_2 − 8N_3]. Wraps
 * `evaluateBenincasaDowker` (N_k dimensionless, ℓ_P in m; returns m⁻²). Shares
 * the `ricci-scalar` target with {@link be13Edge}.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be31Edge: BridgeEdge = {
  id: 'be-31',
  beId: 31,
  kind: 'bridge',
  label: 'Benincasa-Dowker R(p) = (4/√6)ℓ_P⁻²·[1+N_0−9N_1+16N_2−8N_3]',
  sources: [causalSetCount0Q, causalSetCount1Q, causalSetCount2Q, causalSetCount3Q, planckLengthQ],
  target: ricciScalarQ,
  confidence: 'speculative',
  domain: {
    description: 'N_0..N_3 finite, ℓ_P > 0',
    predicate: (i) =>
      isFin(i['causal-set-count-0']) &&
      isFin(i['causal-set-count-1']) &&
      isFin(i['causal-set-count-2']) &&
      isFin(i['causal-set-count-3']) &&
      isFin(i['planck-length']) &&
      i['planck-length'] > 0,
  },
  evaluate: (i) =>
    evaluateBenincasaDowker({
      N_0: i['causal-set-count-0'],
      N_1: i['causal-set-count-1'],
      N_2: i['causal-set-count-2'],
      N_3: i['causal-set-count-3'],
      l_P_m: i['planck-length'],
    }),
  citation: 'Benincasa & Dowker 2010 PRL 104:181301',
};

/**
 * BE-33 Hertz-Millis correlation length: (reference-correlation-length,
 * temperature, reference-temperature, static-exponent-nu, dynamic-exponent-z) →
 * ξ(T) = ξ_0 (T/T_0)^(−1/z). Wraps `evaluateHertzMillis` (SI; returns m). The
 * evaluator's `nu` is retained for API stability but does not enter the
 * formula. Reuses the canonical `temperature` node.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
/**
 * Faithful Hertz-Millis correlation length ξ_0·(T/T_0)^(−1/z) as a composition
 * `symbolic` form (v0.13 — symbolic exponents). The exponent −1/z is
 * input-dependent on the DIMENSIONLESS base T/T_0, which the literal-exponent
 * grammar could not express (the catalog AST `BE33_HERTZ_MILLIS_RHS` pins z=1
 * with a literal `^(-1)`; it is left UNCHANGED). Leaves are graph-quantity
 * names; drift-guarded against `evaluateHertzMillis`. BE-33 composes with
 * nothing — this is a demonstration of the now-expressible faithful encoding.
 */
const BE33_HERTZ_MILLIS_SYMBOLIC: ExprNode = {
  kind: 'op',
  op: '*',
  args: [
    symN('reference-correlation-length', LENGTH),
    {
      kind: 'op',
      op: '^',
      args: [
        { kind: 'op', op: '/', args: [symN('temperature', TEMPERATURE), symN('reference-temperature', TEMPERATURE)] },
        { kind: 'op', op: '/', args: [symN('-1', DIMENSIONLESS), symN('dynamic-exponent-z', DIMENSIONLESS)] },
      ],
    },
  ],
};

export const be33Edge: BridgeEdge = {
  id: 'be-33',
  beId: 33,
  kind: 'bridge',
  label: 'Hertz-Millis correlation length ξ(T) = ξ_0 (T/T_0)^(−1/z)',
  sources: [referenceCorrelationLengthQ, temperatureQ, referenceTemperatureQ, staticExponentNuQ, dynamicExponentZQ],
  target: quantumCorrelationLengthQ,
  confidence: 'speculative',
  domain: {
    description: 'ξ_0 > 0, T > 0, T_0 > 0, ν finite, z ≠ 0',
    predicate: (i) =>
      isFin(i['reference-correlation-length']) &&
      i['reference-correlation-length'] > 0 &&
      isFin(i['temperature']) &&
      i['temperature'] > 0 &&
      isFin(i['reference-temperature']) &&
      i['reference-temperature'] > 0 &&
      isFin(i['static-exponent-nu']) &&
      isFin(i['dynamic-exponent-z']) &&
      i['dynamic-exponent-z'] !== 0,
  },
  evaluate: (i) =>
    evaluateHertzMillis({
      xi_0_m: i['reference-correlation-length'],
      T_K: i['temperature'],
      T_0_K: i['reference-temperature'],
      nu: i['static-exponent-nu'],
      z: i['dynamic-exponent-z'],
    }),
  symbolic: BE33_HERTZ_MILLIS_SYMBOLIC,
  citation: 'Hertz 1976 PRB 14:1165; Millis 1993 PRB 48:7183; Sachdev 2011 QPT 2nd ed. Ch.11',
};

/**
 * BE-34 Kibble-Zurek defect density: (quench-timescale,
 * microscopic-relaxation-time, spatial-dimension, static-exponent-nu,
 * dynamic-exponent-z, defect-rest-mass, reheating-temperature) →
 * n = (τ_Q/τ_0)^(−dν/(1+zν))·exp(−mc²/(k_B T_reh)). Wraps `evaluateKibbleZurek`
 * (SI; returns dimensionless). Reuses BE-33's `static-exponent-nu` and
 * `dynamic-exponent-z` nodes (same critical exponents).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be34Edge: BridgeEdge = {
  id: 'be-34',
  beId: 34,
  kind: 'bridge',
  label: 'Kibble-Zurek n = (τ_Q/τ_0)^(−dν/(1+zν))·exp(−mc²/k_B T_reh)',
  sources: [
    quenchTimescaleQ,
    microscopicRelaxationTimeQ,
    spatialDimensionQ,
    staticExponentNuQ,
    dynamicExponentZQ,
    defectRestMassQ,
    reheatingTemperatureQ,
  ],
  target: defectDensityQ,
  confidence: 'established',
  domain: {
    description: 'τ_Q>0, τ_0>0, d/ν/z finite, m_defect≥0, T_reh>0, 1+zν≠0',
    predicate: (i) =>
      isFin(i['quench-timescale']) &&
      i['quench-timescale'] > 0 &&
      isFin(i['microscopic-relaxation-time']) &&
      i['microscopic-relaxation-time'] > 0 &&
      isFin(i['spatial-dimension']) &&
      isFin(i['static-exponent-nu']) &&
      isFin(i['dynamic-exponent-z']) &&
      isFin(i['defect-rest-mass']) &&
      i['defect-rest-mass'] >= 0 &&
      isFin(i['reheating-temperature']) &&
      i['reheating-temperature'] > 0 &&
      1 + i['dynamic-exponent-z'] * i['static-exponent-nu'] !== 0,
  },
  evaluate: (i) =>
    evaluateKibbleZurek({
      tau_Q: i['quench-timescale'],
      tau_0: i['microscopic-relaxation-time'],
      d: i['spatial-dimension'],
      nu: i['static-exponent-nu'],
      z: i['dynamic-exponent-z'],
      m_defect: i['defect-rest-mass'],
      T_reh: i['reheating-temperature'],
    }),
  citation: 'Kibble 1976 J. Phys. A 9:1387; Zurek 1985 Nature 317:505',
};

/**
 * BE-36 GW170817 graviton-photon speed ratio: gravitational-wave-speed →
 * (c_GW − c)/c. Wraps `evaluateGWSpeedRatio` (c_GW in m/s; returns
 * dimensionless signed ratio).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be36Edge: BridgeEdge = {
  id: 'be-36',
  beId: 36,
  kind: 'bridge',
  label: 'GW170817 speed ratio (c_GW − c)/c',
  sources: [gravitationalWaveSpeedQ],
  target: gwPhotonSpeedRatioQ,
  confidence: 'speculative',
  domain: {
    description: 'c_GW > 0 and finite',
    predicate: (i) =>
      isFin(i['gravitational-wave-speed']) &&
      i['gravitational-wave-speed'] > 0,
  },
  evaluate: (i) =>
    evaluateGWSpeedRatio({ c_GW_m_per_s: i['gravitational-wave-speed'] }),
  citation: 'Abbott et al. 2017 ApJ Lett. 848:L13; Boran et al. 2018 PRD 97:041501',
};

/**
 * BE-38 Milgrom MOND force: (newtonian-force, mass, mond-acceleration-scale) →
 * F = F_N·ν(z), z = F_N/(m a_0). Wraps `evaluateMONDForce` (SI; returns N).
 * Reuses the gravitational `mass` node (the test particle's gravitational mass).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be38Edge: BridgeEdge = {
  id: 'be-38',
  beId: 38,
  kind: 'bridge',
  label: 'MOND force F = F_N·ν(F_N/(m a_0))',
  sources: [newtonianForceQ, massQ, mondAccelerationScaleQ],
  target: mondForceQ,
  confidence: 'speculative',
  domain: {
    description: 'F_N > 0, m > 0, a_0 > 0',
    predicate: (i) =>
      isFin(i['newtonian-force']) &&
      i['newtonian-force'] > 0 &&
      isFin(i['mass']) &&
      i['mass'] > 0 &&
      isFin(i['mond-acceleration-scale']) &&
      i['mond-acceleration-scale'] > 0,
  },
  evaluate: (i) =>
    evaluateMONDForce({
      F_N_newton: i['newtonian-force'],
      m_kg: i['mass'],
      a_0_m_per_s2: i['mond-acceleration-scale'],
    }),
  citation: 'Milgrom 1983 ApJ 270:365; Famaey & McGaugh 2012 Living Rev. Relativity 15:10',
};

/**
 * BE-39 asymptotic-safety β_g: (newton-coupling-dimensionless,
 * cosmological-constant-dimensionless, truncation-coefficient-a/b/c) →
 * β_g = 2g + A g² + B g³ − C g²λ. Wraps `evaluateBetaG` (all dimensionless).
 * The module also ships `evaluateBetaLambda`; this edge wraps the β_g branch.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be39Edge: BridgeEdge = {
  id: 'be-39',
  beId: 39,
  kind: 'bridge',
  label: 'Asymptotic safety β_g = 2g + A g² + B g³ − C g²λ',
  sources: [
    newtonCouplingQ,
    cosmologicalConstantDimensionlessQ,
    truncationCoefficientAQ,
    truncationCoefficientBQ,
    truncationCoefficientCQ,
  ],
  target: newtonCouplingBetaQ,
  confidence: 'speculative',
  domain: {
    description: 'g, λ, A, B, C all finite',
    predicate: (i) =>
      isFin(i['newton-coupling-dimensionless']) &&
      isFin(i['cosmological-constant-dimensionless']) &&
      isFin(i['truncation-coefficient-a']) &&
      isFin(i['truncation-coefficient-b']) &&
      isFin(i['truncation-coefficient-c']),
  },
  evaluate: (i) =>
    evaluateBetaG({
      g: i['newton-coupling-dimensionless'],
      lambda: i['cosmological-constant-dimensionless'],
      A: i['truncation-coefficient-a'],
      B: i['truncation-coefficient-b'],
      C: i['truncation-coefficient-c'],
    }),
  citation: 'Reuter 1998 PRD 57:971; Reuter & Weyer 2009 Gen. Rel. Grav. 41:983',
};

/**
 * BE-41 Swampland distance conjecture: (reference-mass, swampland-coefficient,
 * scalar-field-value, scalar-field-reference, planck-mass) →
 * m(φ) = m₀ exp(−α|φ−φ₀|/M_P). Wraps `evaluateSwampland` (consistent units;
 * returns same unit as m₀).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be41Edge: BridgeEdge = {
  id: 'be-41',
  beId: 41,
  kind: 'bridge',
  label: 'Swampland tower mass m(φ) = m₀ exp(−α|φ−φ₀|/M_P)',
  sources: [referenceMassQ, swamplandCoefficientQ, scalarFieldValueQ, scalarFieldReferenceQ, planckMassQ],
  target: swamplandTowerMassQ,
  confidence: 'speculative',
  domain: {
    description: 'm₀ ≥ 0, α/φ/φ₀ finite, M_P > 0',
    predicate: (i) =>
      isFin(i['reference-mass']) &&
      i['reference-mass'] >= 0 &&
      isFin(i['swampland-coefficient']) &&
      isFin(i['scalar-field-value']) &&
      isFin(i['scalar-field-reference']) &&
      isFin(i['planck-mass']) &&
      i['planck-mass'] > 0,
  },
  evaluate: (i) =>
    evaluateSwampland({
      m0: i['reference-mass'],
      alpha: i['swampland-coefficient'],
      phi: i['scalar-field-value'],
      phi0: i['scalar-field-reference'],
      M_P: i['planck-mass'],
    }),
  citation: 'Ooguri & Vafa 2007 Nucl. Phys. B 766:21; Vafa 2005 (hep-th/0509212)',
};

/**
 * BE-43 ER=EPR wormhole-entropy bound: wormhole-cross-section-area →
 * S = k_B A / (4 ℓ_P²). Wraps `evaluateEREPRBound` (A in m²; returns J/K).
 * Mirrors BE-14's SI convention; uses a distinct `wormhole-*` source/target so
 * it does not silently fuse with the BE-14 Ryu-Takayanagi nodes (different
 * geometry: bulk minimal surface vs. ER bridge cross-section).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be43Edge: BridgeEdge = {
  id: 'be-43',
  beId: 43,
  kind: 'bridge',
  label: 'ER=EPR entropy S = k_B A_wh / (4 ℓ_P²)',
  sources: [wormholeCrossSectionAreaQ],
  target: wormholeEntanglementEntropyQ,
  confidence: 'speculative',
  domain: {
    description: 'A_wh ≥ 0 and finite',
    predicate: (i) =>
      isFin(i['wormhole-cross-section-area']) &&
      i['wormhole-cross-section-area'] >= 0,
  },
  evaluate: (i) =>
    evaluateEREPRBound({ area_m2: i['wormhole-cross-section-area'] }),
  citation: 'Maldacena & Susskind 2013 Fortschr. Phys. 61:781; Bekenstein 1973 PRD 7:2333',
};

/**
 * BE-45 TCC max e-folds: (planck-mass-energy, inflation-hubble-energy,
 * tensor-to-scalar-ratio, tcc-correction-coefficient) →
 * N_e_max = ln(M_P/H_inf) − γ ln(r/0.01). Wraps `evaluateTCC` (M_P, H_inf in
 * GeV-equivalent natural units; returns dimensionless e-folds).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be45Edge: BridgeEdge = {
  id: 'be-45',
  beId: 45,
  kind: 'bridge',
  label: 'TCC e-folds N_e_max = ln(M_P/H_inf) − γ ln(r/0.01)',
  sources: [planckMassEnergyQ, inflationHubbleEnergyQ, tensorToScalarRatioQ, tccCorrectionCoefficientQ],
  target: maxEfoldsQ,
  confidence: 'speculative',
  domain: {
    description: 'M_P > 0, H_inf > 0, r > 0, γ finite',
    predicate: (i) =>
      isFin(i['planck-mass-energy']) &&
      i['planck-mass-energy'] > 0 &&
      isFin(i['inflation-hubble-energy']) &&
      i['inflation-hubble-energy'] > 0 &&
      isFin(i['tensor-to-scalar-ratio']) &&
      i['tensor-to-scalar-ratio'] > 0 &&
      isFin(i['tcc-correction-coefficient']),
  },
  evaluate: (i) =>
    evaluateTCC({
      M_P_GeV: i['planck-mass-energy'],
      H_inf_GeV: i['inflation-hubble-energy'],
      r: i['tensor-to-scalar-ratio'],
      gamma: i['tcc-correction-coefficient'],
    }),
  citation: 'Bedroya & Vafa 2019 (arXiv:1909.11063)',
};

/**
 * BE-46 Weinberg-Vilenkin anthropic probability: (measure-normalization,
 * anthropic-model-parameter, landscape-parameter) → P(Λ) = A exp(−α/Λ). Wraps
 * `evaluateWeinbergVilenkinP` (all dimensionless; returns dimensionless P).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be46Edge: BridgeEdge = {
  id: 'be-46',
  beId: 46,
  kind: 'bridge',
  label: 'Anthropic probability P(Λ) = A exp(−α/Λ)',
  sources: [measureNormalizationQ, anthropicModelParameterQ, landscapeParameterQ],
  target: anthropicProbabilityQ,
  confidence: 'highly-speculative',
  domain: {
    description: 'A, α finite, Λ > 0',
    predicate: (i) =>
      isFin(i['measure-normalization']) &&
      isFin(i['anthropic-model-parameter']) &&
      isFin(i['landscape-parameter']) &&
      i['landscape-parameter'] > 0,
  },
  evaluate: (i) =>
    evaluateWeinbergVilenkinP({
      normalization: i['measure-normalization'],
      alpha: i['anthropic-model-parameter'],
      lambda: i['landscape-parameter'],
    }),
  citation: 'Vilenkin 1995 PRL 74:846; Weinberg 1987 PRL 59:2607',
};

/**
 * BE-47 BBN dark-sector Boltzmann rate: (hubble-rate, nucleon-yield-density,
 * sm-reaction-rate-coefficient, proton-density, neutron-density,
 * dark-reaction-rate-coefficient, dark-species-density, transfer-efficiency) →
 * dY/dt = ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε − 3HY. Wraps `evaluateBBNDark`
 * (SI; returns m⁻³ s⁻¹).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be47Edge: BridgeEdge = {
  id: 'be-47',
  beId: 47,
  kind: 'bridge',
  label: 'BBN dark-sector dY/dt = ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε − 3HY',
  sources: [
    hubbleRateQ,
    nucleonYieldDensityQ,
    smReactionRateCoefficientQ,
    protonDensityQ,
    neutronDensityQ,
    darkReactionRateCoefficientQ,
    darkSpeciesDensityQ,
    transferEfficiencyQ,
  ],
  target: nucleonYieldRateQ,
  confidence: 'speculative',
  domain: {
    description: 'all eight Boltzmann inputs finite',
    predicate: (i) =>
      isFin(i['hubble-rate']) &&
      isFin(i['nucleon-yield-density']) &&
      isFin(i['sm-reaction-rate-coefficient']) &&
      isFin(i['proton-density']) &&
      isFin(i['neutron-density']) &&
      isFin(i['dark-reaction-rate-coefficient']) &&
      isFin(i['dark-species-density']) &&
      isFin(i['transfer-efficiency']),
  },
  evaluate: (i) =>
    evaluateBBNDark({
      H: i['hubble-rate'],
      Y: i['nucleon-yield-density'],
      sigmav_SM: i['sm-reaction-rate-coefficient'],
      n_p: i['proton-density'],
      n_n: i['neutron-density'],
      sigmav_dark: i['dark-reaction-rate-coefficient'],
      n_chi: i['dark-species-density'],
      eps_transfer: i['transfer-efficiency'],
    }),
  citation: 'Kolb & Turner 1990 §5.2; Pitrou et al. 2018 Phys. Rep. 754:1',
};

/**
 * BE-49 quantum-Darwinism mutual-information decay: (total-mutual-information,
 * darwinism-magnitude, fragment-count, darwinism-decay-exponent) →
 * I(S:F_k) = I(S:E) − α k^(−β). Wraps `evaluateQuantumDarwinism` (all
 * dimensionless; the evaluator is β-agnostic).
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be49Edge: BridgeEdge = {
  id: 'be-49',
  beId: 49,
  kind: 'bridge',
  label: 'Quantum Darwinism I(S:F_k) = I(S:E) − α k^(−β)',
  sources: [totalMutualInformationQ, darwinismMagnitudeQ, fragmentCountQ, darwinismDecayExponentQ],
  target: fragmentMutualInformationQ,
  confidence: 'speculative',
  domain: {
    description: 'I(S:E), α, β finite; k > 0',
    predicate: (i) =>
      isFin(i['total-mutual-information']) &&
      isFin(i['darwinism-magnitude']) &&
      isFin(i['fragment-count']) &&
      i['fragment-count'] > 0 &&
      isFin(i['darwinism-decay-exponent']),
  },
  evaluate: (i) =>
    evaluateQuantumDarwinism({
      I_SE: i['total-mutual-information'],
      alpha: i['darwinism-magnitude'],
      k: i['fragment-count'],
      beta: i['darwinism-decay-exponent'],
    }),
  citation: 'Zurek 2009 Nat. Phys. 5:181; Blume-Kohout & Zurek 2006 PRA 73:062310',
};

/**
 * BE-50 Wheeler-Feynman time-symmetry residual: (retarded-field-amplitude,
 * advanced-field-amplitude) → r_TS = (A_ret − A_adv)/(A_ret + A_adv). Wraps
 * `evaluateWFTimeSymmetry` (any consistent amplitude unit; returns
 * dimensionless). The evaluator throws RangeError when A_ret + A_adv = 0; the
 * domain rejects that case so `evaluateEdge` surfaces DomainViolationError.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 */
export const be50Edge: BridgeEdge = {
  id: 'be-50',
  beId: 50,
  kind: 'bridge',
  label: 'Wheeler-Feynman residual r_TS = (A_ret − A_adv)/(A_ret + A_adv)',
  sources: [retardedFieldAmplitudeQ, advancedFieldAmplitudeQ],
  target: timeSymmetryResidualQ,
  confidence: 'highly-speculative',
  domain: {
    description: 'A_ret, A_adv finite and A_ret + A_adv ≠ 0',
    predicate: (i) =>
      isFin(i['retarded-field-amplitude']) &&
      isFin(i['advanced-field-amplitude']) &&
      i['retarded-field-amplitude'] + i['advanced-field-amplitude'] !== 0,
  },
  evaluate: (i) =>
    evaluateWFTimeSymmetry({
      A_retarded: i['retarded-field-amplitude'],
      A_advanced: i['advanced-field-amplitude'],
    }),
  citation: 'Wheeler & Feynman 1945 RMP 17:157; Cramer 1986 RMP 58:647',
};

/**
 * All catalog-full edges, in catalog-id order. Convenience array for the
 * drift-guard test and downstream graph assembly.
 *
 * Root-reachable via the {@link CATALOG_FULL_EDGES} array (one root
 * export for the 26-edge tranche — root-surface budget decision).
 *
 * @public
 */
export const CATALOG_FULL_EDGES: readonly BridgeEdge[] = [
  be11Edge,
  be13Edge,
  be15Edge,
  be17Edge,
  be18Edge,
  be20Edge,
  be22Edge,
  be23Edge,
  be24Edge,
  be25Edge,
  be26Edge,
  be27Edge,
  be30Edge,
  be31Edge,
  be33Edge,
  be34Edge,
  be36Edge,
  be38Edge,
  be39Edge,
  be41Edge,
  be43Edge,
  be45Edge,
  be46Edge,
  be47Edge,
  be49Edge,
  be50Edge,
];
