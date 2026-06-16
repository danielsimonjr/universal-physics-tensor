/**
 * `BridgeEquations` — a convenience facade over the per-bridge evaluators.
 *
 * Every catalogued bridge ships a self-contained `evaluate*()` function in its
 * `src/bridges/equations/be-*.ts` module (plus the two v0.4.0 GR evaluators at
 * `src/bridges/`). Those modules are reachable only by subpath import. This
 * facade gathers them under one root-level object keyed by readable names, so a
 * consumer can write `BridgeEquations.decoherenceRate({...})` from the package
 * root. Each method is a **1:1 pass-through** to the existing pure function —
 * NO new physics, no recomputation; the method name simply mirrors the
 * evaluator (the `evaluate` prefix dropped).
 *
 * Scope honesty (these are NOT changed by the facade):
 *   - Methods backed by a documented typed-stub / reformulation carry that
 *     module's caveats. In particular `onsagerEntropyProduction` (BE-28) encodes
 *     the Onsager σ = ΣJX *definiendum*, NOT the MEPP maximization principle
 *     (see the ⚠ CRITICAL WARNING in be-28-onsager-entropy-production.ts).
 *   - BE-25 maps to the live IIT `intrinsicInformation`; the archived
 *     Penrose-Hameroff `evaluateOrchOR` is deliberately NOT surfaced.
 *   - BE-51 has no evaluator and is intentionally absent (no fabricated physics).
 *     BE-52 is `perihelionPrecession` (the v0.4.0 GR evaluator).
 *
 * The README previously described this as "specified in Parts I–III"; the specs
 * actually specify the physics + AST encodings, not this TypeScript API, so the
 * facade is a deliberate ergonomic layer, not a spec transcription.
 *
 * @module bridges/bridge-equations
 */

import { evaluateDecoherenceRate } from './equations/be-11-decoherence-master.js';
import { evaluateThermalDeBroglie } from './equations/be-12-coherence-length.js';
import { evaluateEinsteinTrace } from './equations/be-13-einstein-trace.js';
import { evaluateRyuTakayanagi, evaluateRyuTakayanagiNatural } from './equations/be-14-ryu-takayanagi.js';
import { evaluateCoarseningLength, evaluateCoarseningLengthSquared } from './equations/be-15-emergence.js';
import { evaluateLandauerEnergy } from './equations/be-16-landauer.js';
import { evaluateBE17SpinDensitySquared } from './equations/be-17-einstein-cartan.js';
import { evaluateHiggsMass } from './equations/be-18-higgs-mass.js';
import { evaluateQuantumBounce } from './equations/be-19-quantum-bounce.js';
import { evaluateCosmologicalConstantDensity } from './equations/be-20-vacuum-energy.js';
import { evaluateKSSBound } from './equations/be-21-kss-bound.js';
import { evaluateTEE } from './equations/be-22-topological-entanglement.js';
import { evaluateSYKResistivity } from './equations/be-23-syk-planckian.js';
import { evaluateFRETEfficiency } from './equations/be-24-foerster-fret.js';
import { evaluateIntrinsicInformation } from './equations/be-25-iit-phi.js';
import { evaluateDNATunneling } from './equations/be-26-dna-tunneling.js';
import { evaluateEffectiveTemperature } from './equations/be-27-effective-temperature.js';
import { evaluateOnsagerEntropyProduction } from './equations/be-28-onsager-entropy-production.js';
import { evaluateJarzynski } from './equations/be-29-jarzynski.js';
import { evaluateBekensteinBound, evaluateFLMFirstLaw } from './equations/be-30-flm-first-law.js';
import { evaluateBenincasaDowker } from './equations/be-31-causal-set-bd.js';
import { evaluateQRFOverlap } from './equations/be-32-quantum-reference-frame.js';
import { evaluateHertzMillis } from './equations/be-33-hertz-millis.js';
import { evaluateKibbleZurek } from './equations/be-34-kibble-zurek.js';
import { evaluateCrossingResidual } from './equations/be-35-conformal-bootstrap.js';
import { evaluateGWSpeedRatio } from './equations/be-36-gw-speed-bound.js';
import { evaluateShapiroDelay } from './equations/be-37-shapiro-delay.js';
import { evaluateMONDForce } from './equations/be-38-mond.js';
import { evaluateBetaG, evaluateBetaLambda } from './equations/be-39-asymptotic-safety.js';
import { evaluateCompositeHiggs } from './equations/be-40-composite-higgs.js';
import { evaluateSwampland } from './equations/be-41-swampland.js';
import { evaluateHawkingTemperature } from './equations/be-42-hawking-temperature.js';
import { evaluateEREPRBound } from './equations/be-43-er-epr.js';
import { evaluateBE44SoftHairCharge } from './equations/be-44-soft-hair.js';
import { evaluateTCC } from './equations/be-45-tcc.js';
import { evaluateWeinbergVilenkinP } from './equations/be-46-multiverse-measure.js';
import { evaluateBBNDark } from './equations/be-47-bbn-dark-sector.js';
import { evaluateGRWLocalization } from './equations/be-48-grw-localization.js';
import { evaluateQuantumDarwinism } from './equations/be-49-quantum-darwinism.js';
import { evaluateWFTimeSymmetry } from './equations/be-50-wheeler-feynman.js';
import { evaluateYangMillsBeta } from './equations/be-53-yang-mills-beta.js';
import { evaluateRandallSundrumH2 } from './equations/be-54-randall-sundrum-brane.js';
import { evaluateGravitationalLensing } from './gravitational-lensing.js';
import { evaluatePerihelionPrecession } from './perihelion-precession.js';

/**
 * Root-level facade keyed by readable method names. Each value is a re-export of
 * the bridge's existing `evaluate*()` function; the bridge ID is in the comment.
 *
 * @public
 */
export const BridgeEquations = {
  decoherenceRate: evaluateDecoherenceRate,                 // BE-11
  thermalDeBroglie: evaluateThermalDeBroglie,               // BE-12
  einsteinTrace: evaluateEinsteinTrace,                     // BE-13
  ryuTakayanagi: evaluateRyuTakayanagi,                     // BE-14
  ryuTakayanagiNatural: evaluateRyuTakayanagiNatural,       // BE-14 (natural units)
  coarseningLength: evaluateCoarseningLength,               // BE-15
  coarseningLengthSquared: evaluateCoarseningLengthSquared, // BE-15 (squared form)
  landauerEnergy: evaluateLandauerEnergy,                   // BE-16
  spinDensitySquared: evaluateBE17SpinDensitySquared,       // BE-17
  higgsMass: evaluateHiggsMass,                             // BE-18
  quantumBounce: evaluateQuantumBounce,                     // BE-19
  cosmologicalConstantDensity: evaluateCosmologicalConstantDensity, // BE-20
  kssBound: evaluateKSSBound,                               // BE-21 (no-arg constant)
  topologicalEntanglementEntropy: evaluateTEE,              // BE-22
  sykResistivity: evaluateSYKResistivity,                   // BE-23
  fretEfficiency: evaluateFRETEfficiency,                   // BE-24
  intrinsicInformation: evaluateIntrinsicInformation,       // BE-25 (IIT; OrchOR archived)
  dnaTunneling: evaluateDNATunneling,                       // BE-26
  effectiveTemperature: evaluateEffectiveTemperature,       // BE-27
  onsagerEntropyProduction: evaluateOnsagerEntropyProduction, // BE-28 (definiendum, NOT MEPP)
  jarzynski: evaluateJarzynski,                             // BE-29
  bekensteinBound: evaluateBekensteinBound,                 // BE-30
  flmFirstLaw: evaluateFLMFirstLaw,                         // BE-30 (first law)
  benincasaDowker: evaluateBenincasaDowker,                 // BE-31
  qrfOverlap: evaluateQRFOverlap,                           // BE-32
  hertzMillis: evaluateHertzMillis,                         // BE-33
  kibbleZurek: evaluateKibbleZurek,                         // BE-34
  crossingResidual: evaluateCrossingResidual,               // BE-35
  gwSpeedRatio: evaluateGWSpeedRatio,                       // BE-36
  shapiroDelay: evaluateShapiroDelay,                       // BE-37
  mondForce: evaluateMONDForce,                             // BE-38
  betaG: evaluateBetaG,                                     // BE-39 (Newton coupling)
  betaLambda: evaluateBetaLambda,                           // BE-39 (cosmological coupling)
  compositeHiggs: evaluateCompositeHiggs,                   // BE-40
  swampland: evaluateSwampland,                             // BE-41
  hawkingTemperature: evaluateHawkingTemperature,           // BE-42
  erEprBound: evaluateEREPRBound,                           // BE-43
  softHairCharge: evaluateBE44SoftHairCharge,               // BE-44
  tcc: evaluateTCC,                                         // BE-45
  weinbergVilenkinP: evaluateWeinbergVilenkinP,             // BE-46
  bbnDark: evaluateBBNDark,                                 // BE-47
  grwLocalization: evaluateGRWLocalization,                 // BE-48
  quantumDarwinism: evaluateQuantumDarwinism,               // BE-49
  wfTimeSymmetry: evaluateWFTimeSymmetry,                   // BE-50
  yangMillsBeta: evaluateYangMillsBeta,                     // BE-53
  randallSundrumH2: evaluateRandallSundrumH2,               // BE-54
  // v0.4.0 GR evaluators (return result objects, not scalars):
  gravitationalLensing: evaluateGravitationalLensing,       // GR lensing
  perihelionPrecession: evaluatePerihelionPrecession,       // BE-52
} as const;
