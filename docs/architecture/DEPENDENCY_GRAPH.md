# universal-physics-tensor - Dependency Graph

**Version**: 0.6.0 | **Last Updated**: 2026-05-24

This document provides a comprehensive dependency graph of all files, components, imports, functions, and variables in the codebase.

---

## Table of Contents

1. [Overview](#overview)
2. [Bridges Dependencies](#bridges-dependencies)
3. [Core Dependencies](#core-dependencies)
4. [Diff Dependencies](#diff-dependencies)
5. [Dimensional Dependencies](#dimensional-dependencies)
6. [Entry Dependencies](#entry-dependencies)
7. [Numerical Dependencies](#numerical-dependencies)
8. [Dependency Matrix](#dependency-matrix)
9. [Circular Dependency Analysis](#circular-dependency-analysis)
10. [Visual Dependency Graph](#visual-dependency-graph)
11. [Summary Statistics](#summary-statistics)

---

## Overview

The codebase is organized into the following modules:

- **bridges**: 48 files
- **core**: 11 files
- **diff**: 2 files
- **dimensional**: 26 files
- **entry**: 1 file
- **numerical**: 30 files

---

## Bridges Dependencies

### `src/bridges/catalog-adapter.ts` - Catalog adapter: ingests the 42-entry `BRIDGE_EQUATIONS` array into

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./index.js` | `BridgeEquationEntry` | Import (type-only) |
| `../core/cell.js` | `BridgeCell, CellConfidence` | Import (type-only) |
| `../core/tensor.js` | `UniversalTensor` | Import (type-only) |
| `../core/flux-rules.js` | `FluxDiagnostic, FluxReport` | Import (type-only) |
| `../dimensional/bridge-check.js` | `EXPECTED_DIMENSION_BY_BRIDGE` | Import |
| `../dimensional/algebra.js` | `format` | Import |
| `../core/types.js` | `PhysicalScale, TensorIndices` | Import (type-only) |

**Exports:**
- Classes: `CatalogIngestionError`
- Interfaces: `CatalogEntryStatus`, `CatalogIngestionReport`
- Functions: `catalogToCells`, `scanCatalog`, `ingestCatalog`, `ingestionReportToFluxReport`

---

### `src/bridges/equations/be-11-decoherence-master.ts` - Bridge Equation 11 — Decoherence Master Equation (Lindblad form).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, FREQUENCY, DIMENSIONLESS` | Import |

**Exports:**
- Interfaces: `DecoherenceRateInputs`
- Functions: `evaluateDecoherenceRate`, `validateDecoherenceRateDimensions`
- Constants: `DECOHERENCE_RATE_RHS`

---

### `src/bridges/equations/be-12-coherence-length.ts` - Bridge Equation 12 — Mesoscopic Coherence Length (canonical thermal

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, LENGTH, MASS, TEMPERATURE` | Import |
| `../../dimensional/constants.js` | `hbar, k_B` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `ThermalDeBroglieInputs`
- Functions: `evaluateThermalDeBroglie`, `validateBE12Dimensions`
- Constants: `BE12_COHERENCE_LENGTH_RHS`, `BE12_COHERENCE_LENGTH_LHS`

---

### `src/bridges/equations/be-13-einstein-trace.ts` - Bridge Equation 13 — Trace of Einstein equations (Jacobson 1995

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |
| `../../dimensional/constants.js` | `c, G` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |
| `../../dimensional/tensor-trace.js` | `TensorTraceNode` | Import (type-only) |
| `../../dimensional/stress-energy-validators.js` | `StressEnergyTensorNode` | Import (type-only) |

**Exports:**
- Interfaces: `EinsteinTraceInputs`
- Functions: `evaluateEinsteinTrace`, `validateBE13Dimensions`
- Constants: `RICCI_SCALAR_DIM`, `BE13_EINSTEIN_TRACE_RHS`, `BE13_EINSTEIN_TRACE_LHS`, `BE13_STRESS_ENERGY_NODE`, `BE13_T_TRACE_NODE`

---

### `src/bridges/equations/be-14-ryu-takayanagi.ts` - Bridge Equation 14 — Ryu-Takayanagi (Quantum Error Correction Holographic Mapping).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, AREA, DIMENSIONLESS, ENTROPY` | Import |
| `../../dimensional/constants.js` | `k_B, c, G, hbar` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `RyuTakayanagiInputs`, `RyuTakayanagiNaturalInputs`
- Functions: `evaluateRyuTakayanagi`, `evaluateRyuTakayanagiNatural`, `validateRyuTakayanagiDimensions`
- Constants: `RYU_TAKAYANAGI_RHS`

---

### `src/bridges/equations/be-15-emergence.ts` - Bridge Equation 15 — Universal Emergence Equation (Hohenberg-Halperin

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, TIME, AREA` | Import |

**Exports:**
- Interfaces: `CoarseningInputs`
- Functions: `evaluateCoarseningLength`, `evaluateCoarseningLengthSquared`, `validateBE15Dimensions`
- Constants: `BE15_MOBILITY`, `BE15_TIME`, `BE15_COARSENING_LENGTH_SQUARED_RHS`, `BE15_COARSENING_LENGTH_SQUARED_LHS`

---

### `src/bridges/equations/be-16-landauer.ts` - Bridge Equation 16 — Complexity-Entropy Production Relation

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, ENERGY, TEMPERATURE` | Import |
| `../../dimensional/constants.js` | `k_B` | Import |

**Exports:**
- Interfaces: `LandauerInputs`
- Functions: `evaluateLandauerEnergy`, `validateBE16Dimensions`
- Constants: `BE16_BOLTZMANN`, `BE16_TEMPERATURE`, `BE16_LN2`, `BE16_LANDAUER_RHS`, `BE16_LANDAUER_LHS`

---

### `src/bridges/equations/be-17-einstein-cartan.ts` - Bridge Equation 17 — Einstein-Cartan torsion-spin coupling

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension` | Import |
| `../../dimensional/tensor.js` | `tsym, contract` | Import |

**Exports:**
- Interfaces: `BE17Inputs`
- Functions: `evaluateBE17SpinDensitySquared`, `validateBE17Dimensions`
- Constants: `BE17_TORSION_CONTRACTION`, `BE17_COUPLING_PREFACTOR_SQUARED`, `BE17_SPIN_DENSITY_SQUARED_RHS`, `BE17_SPIN_DENSITY_SQUARED_LHS`

---

### `src/bridges/equations/be-18-higgs-mass.ts` - Bridge Equation 18 — Higgs-like dark-fermion mass generation

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, ENERGY` | Import |

**Exports:**
- Interfaces: `HiggsMassInputs`
- Functions: `evaluateHiggsMass`, `validateBE18Dimensions`
- Constants: `BE18_HIGGS_MASS_RHS`, `BE18_HIGGS_MASS_LHS`

---

### `src/bridges/equations/be-19-quantum-bounce.ts` - Bridge Equation 19 — Quantum Bounce (LQC modified Friedmann).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |
| `../../dimensional/constants.js` | `G` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |
| `../../dimensional/friedmann-equation.js` | `FriedmannEquationNode` | Import (type-only) |
| `../../dimensional/klein-gordon-equation.js` | `ScalarFieldNode` | Import (type-only) |

**Exports:**
- Interfaces: `QuantumBounceInputs`
- Functions: `evaluateQuantumBounce`, `validateQuantumBounceDimensions`
- Constants: `QUANTUM_BOUNCE_RHS`, `BE19_LQC_FRIEDMANN_STRUCTURAL`

---

### `src/bridges/equations/be-20-vacuum-energy.ts` - Bridge Equation 20 — Observed cosmological-constant mass density

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/stress-energy-validators.js` | `CosmologicalConstantNode` | Import (type-only) |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |
| `../../dimensional/constants.js` | `c, G` | Import |
| `../../dimensional/algebra.js` | `power` | Import |
| `../../dimensional/types.js` | `LENGTH` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `CosmologicalConstantInputs`
- Functions: `evaluateCosmologicalConstantDensity`, `validateBE20Dimensions`
- Constants: `INV_LENGTH_2`, `MASS_DENSITY`, `BE20_VACUUM_ENERGY_RHS`, `BE20_VACUUM_ENERGY_LHS`

---

### `src/bridges/equations/be-21-kss-bound.ts` - Bridge Equation 21 — Kovtun-Son-Starinets (KSS) viscosity-to-entropy

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, TIME, TEMPERATURE` | Import |
| `../../dimensional/constants.js` | `hbar, k_B` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Functions: `evaluateKSSBound`, `validateBE21Dimensions`
- Constants: `VISCOSITY_OVER_ENTROPY_DENSITY`, `BE21_KSS_RHS`, `BE21_KSS_LHS`

---

### `src/bridges/equations/be-22-topological-entanglement.ts` - Bridge Equation 22 — Topological Entanglement Entropy

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, LENGTH` | Import |

**Exports:**
- Interfaces: `TEEInputs`
- Functions: `evaluateTEE`
- Constants: `BE22_AREA_TERM`, `BE22_TOPOLOGICAL_TERM`, `BE22_TOPOLOGICAL_ENTANGLEMENT_RHS`

---

### `src/bridges/equations/be-23-syk-planckian.ts` - Bridge Equation 23 — Strange-Metal / Black-Hole duality (SYK

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, LENGTH, MASS, TEMPERATURE` | Import |
| `../../dimensional/algebra.js` | `multiply, power` | Import |
| `../../dimensional/constants.js` | `hbar, k_B, e` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `SYKResistivityInputs`
- Functions: `evaluateSYKResistivity`, `validateBE23Dimensions`
- Constants: `BE23_SYK_THERMAL_TERM`, `BE23_SYK_RESISTIVITY_RHS`, `BE23_SYK_RESISTIVITY_LHS`

---

### `src/bridges/equations/be-24-foerster-fret.ts` - Bridge Equation 24 — Förster Resonance Energy Transfer (FRET) efficiency.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, LENGTH` | Import |

**Exports:**
- Interfaces: `FRETEfficiencyInputs`
- Functions: `evaluateFRETEfficiency`, `validateBE24Dimensions`
- Constants: `BE24_FRET_EFFICIENCY_RHS`, `BE24_FRET_EFFICIENCY_LHS`

---

### `src/bridges/equations/be-25-iit-phi.ts` - Bridge Equation 25 — Consciousness ↔ Information Integration (IIT Φ).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |

**Exports:**
- Interfaces: `IntrinsicInformationInputs`
- Functions: `evaluateIntrinsicInformation`, `validateBE25Dimensions`
- Constants: `BE25_P_CONDITIONAL`, `BE25_P_MARGINAL`, `BE25_LOG_RATIO_ARG`, `BE25_LOG2_FACTOR`, `BE25_INTRINSIC_INFORMATION_RHS`, `BE25_INTRINSIC_INFORMATION_LHS`

---

### `src/bridges/equations/be-25-orch-or.ts` - ============================================================================

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, TIME, MASS, LENGTH` | Import |
| `../../dimensional/constants.js` | `hbar, c, l_P` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `OrchORInputs`
- Functions: `evaluateOrchOR`, `validateOrchORDimensions`
- Constants: `ORCH_OR_RHS`

---

### `src/bridges/equations/be-26-dna-tunneling.ts` - Bridge Equation 26 — DNA Mutation Quantum Tunneling Rate.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, FREQUENCY, MASS, LENGTH, ENERGY` | Import |
| `../../dimensional/constants.js` | `hbar` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `DNATunnelingInputs`
- Functions: `evaluateDNATunneling`, `validateDNATunnelingDimensions`
- Constants: `DNA_TUNNELING_WKB_ARG`, `DNA_TUNNELING_RHS`

---

### `src/bridges/equations/be-27-effective-temperature.ts` - Bridge Equation 27 — Cugliandolo-Kurchan effective temperature

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, ENERGY, TEMPERATURE` | Import |
| `../../dimensional/constants.js` | `k_B` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `EffectiveTemperatureInputs`
- Functions: `evaluateEffectiveTemperature`, `validateBE27Dimensions`
- Constants: `BE27_TEFF_RHS`, `BE27_TEFF_LHS`

---

### `src/bridges/equations/be-28-onsager-entropy-production.ts` - Bridge Equation 28 — Maximum Entropy Production Principle

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension` | Import |

**Exports:**
- Interfaces: `OnsagerEntropyInputs`
- Functions: `evaluateOnsagerEntropyProduction`, `validateBE28Dimensions`
- Constants: `BE28_FORCE_FLUX_PRODUCT`, `BE28_ENTROPY_PRODUCTION_RHS`, `BE28_ENTROPY_PRODUCTION_LHS`

---

### `src/bridges/equations/be-29-jarzynski.ts` - Bridge Equation 29 — Jarzynski free-energy difference (canonical

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, ENERGY, TEMPERATURE` | Import |
| `../../dimensional/constants.js` | `k_B` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `JarzynskiInputs`
- Functions: `evaluateJarzynski`, `validateBE29Dimensions`
- Constants: `BE29_BETAW_ARG`, `BE29_JARZYNSKI_RHS`, `BE29_JARZYNSKI_LHS`

---

### `src/bridges/equations/be-30-flm-first-law.ts` - Bridge Equation 30 — FLM first law of entanglement entropy

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `FLMFirstLawInputs`, `BekensteinBoundInputs`
- Functions: `evaluateFLMFirstLaw`, `evaluateBekensteinBound`, `validateBE30Dimensions`
- Constants: `BE30_FLM_RHS`, `BE30_FLM_LHS`

---

### `src/bridges/equations/be-31-causal-set-bd.ts` - Bridge Equation 31 — Causal Set Continuum Limit (Benincasa-Dowker

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, LENGTH` | Import |

**Exports:**
- Interfaces: `BenincasaDowkerInputs`
- Functions: `evaluateBenincasaDowker`, `validateBE31Dimensions`
- Constants: `BE31_CAUSAL_SET_BD_RHS`, `BE31_CAUSAL_SET_BD_LHS`

---

### `src/bridges/equations/be-32-quantum-reference-frame.ts` - Bridge Equation 32 — Quantum Reference Frame (QRF) overlap probability.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |

**Exports:**
- Interfaces: `QRFOverlapInputs`
- Functions: `evaluateQRFOverlap`
- Constants: `BE32_REAL_PART_SQUARED`, `BE32_IMAG_PART_SQUARED`, `BE32_QRF_OVERLAP_RHS`

---

### `src/bridges/equations/be-33-hertz-millis.ts` - Bridge Equation 33 — Quantum-Classical Critical Point Mapping

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, LENGTH, TEMPERATURE` | Import |

**Exports:**
- Interfaces: `HertzMillisInputs`
- Functions: `evaluateHertzMillis`, `validateBE33Dimensions`
- Constants: `BE33_HERTZ_MILLIS_RHS`, `BE33_HERTZ_MILLIS_LHS`

---

### `src/bridges/equations/be-34-kibble-zurek.ts` - Bridge Equation 34 — Kibble-Zurek Mechanism in Curved Spacetime.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, TIME, MASS, TEMPERATURE` | Import |
| `../../dimensional/constants.js` | `c, k_B` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `KibbleZurekInputs`
- Functions: `evaluateKibbleZurek`, `validateKibbleZurekDimensions`
- Constants: `KIBBLE_ZUREK_EXP_ARG`, `KIBBLE_ZUREK_RHS`

---

### `src/bridges/equations/be-35-conformal-bootstrap.ts` - Bridge Equation 35 — Conformal Bootstrap (crossing-symmetry residual).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |

**Exports:**
- Interfaces: `CrossingResidualInputs`
- Functions: `evaluateCrossingResidual`
- Constants: `BE35_FORWARD_BLOCK`, `BE35_CROSSED_BLOCK`, `BE35_CROSSING_RESIDUAL_RHS`

---

### `src/bridges/equations/be-36-gw-speed-bound.ts` - Bridge Equation 36 — GW170817 graviton-speed bound (post Wave Y

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, VELOCITY` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `GWSpeedRatioInputs`
- Functions: `evaluateGWSpeedRatio`, `satisfiesGW170817Bound`, `validateBE36Dimensions`
- Constants: `BE36_GW_SPEED_RATIO_RHS`, `BE36_GW_SPEED_RATIO_LHS`, `GW170817_SPEED_BOUND`

---

### `src/bridges/equations/be-37-shapiro-delay.ts` - Bridge Equation 37 — Variable Speed of Light Cosmology

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport, MetricTensorNode, TensorSymbolNode` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, TIME, MASS, LENGTH` | Import |
| `../../dimensional/constants.js` | `G, c` | Import |
| `../../dimensional/tensor.js` | `tsym, contract` | Import |
| `../../dimensional/metric.js` | `metric, pderiv` | Import |
| `../../numerical/index.js` | `evaluateNumerical` | Import |
| `../../numerical/types.js` | `NumericalInputs` | Import (type-only) |
| `../../numerical/null-ray-integrator.js` | `integrateRK4` | Import |
| `../../core/constants.js` | `C_SI, G_SI` | Import |

**Exports:**
- Interfaces: `ShapiroInputs`
- Functions: `evaluateShapiroDelay`, `validateBE37Dimensions`, `validateBE37EikonalDimensions`, `evaluateBE37EikonalNumerical`
- Constants: `BE37_G`, `BE37_M`, `BE37_C`, `BE37_C_CUBED`, `BE37_PREFACTOR`, `BE37_R_FAR`, `BE37_R_NEAR`, `BE37_LOG_RATIO_ARG`, `BE37_LOG_FACTOR`, `BE37_SHAPIRO_DELAY_RHS`, `BE37_SHAPIRO_DELAY_LHS`, `BE37_EIKONAL_LHS`, `BE37_EIKONAL_RHS_ZERO`

---

### `src/bridges/equations/be-38-mond.ts` - Bridge Equation 38 — Modified Newtonian Dynamics (MOND), canonical

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, ACCELERATION, FORCE, MASS` | Import |

**Exports:**
- Interfaces: `MONDForceInputs`
- Functions: `evaluateMONDForce`, `validateBE38Dimensions`
- Constants: `BE38_MOND_NU_ARG`, `BE38_MOND_FORCE_RHS`, `BE38_MOND_FORCE_LHS`

---

### `src/bridges/equations/be-39-asymptotic-safety.ts` - Bridge Equation 39 — Asymptotic Safety in Quantum Gravity (functional

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |
| `../../dimensional/rg-flow.js` | `BetaFunctionNode, RGCouplingNode` | Import (type-only) |
| `../../dimensional/rg-flow.js` | `rgCoupling` | Import |

**Exports:**
- Interfaces: `BetaGInputs`, `BetaLambdaInputs`
- Functions: `evaluateBetaG`, `evaluateBetaLambda`, `validateBE39Dimensions`
- Constants: `BE39_BETA_G_RHS`, `BE39_BETA_G_LHS`, `BE39_BETA_LAMBDA_RHS`, `BE39_BETA_LAMBDA_LHS`, `BE39_COUPLING_G`, `BE39_COUPLING_LAMBDA`, `BE39_BETA_G_STRUCTURAL`, `BE39_BETA_LAMBDA_STRUCTURAL`

---

### `src/bridges/equations/be-40-composite-higgs.ts` - Bridge Equation 40 — Composite Higgs Potential

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, ENERGY` | Import |
| `../../dimensional/algebra.js` | `power` | Import |

**Exports:**
- Interfaces: `CompositeHiggsInputs`
- Functions: `evaluateCompositeHiggs`, `validateBE40Dimensions`
- Constants: `BE40_HIGGS_DIMLESS_ARG`, `BE40_COMPOSITE_HIGGS_RHS`, `BE40_COMPOSITE_HIGGS_LHS`

---

### `src/bridges/equations/be-41-swampland.ts` - Bridge Equation 41 — Swampland Distance Conjecture.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, MASS` | Import |

**Exports:**
- Interfaces: `SwamplandInputs`
- Functions: `evaluateSwampland`, `validateSwamplandDimensions`
- Constants: `SWAMPLAND_EXP_ARG`, `SWAMPLAND_RHS`

---

### `src/bridges/equations/be-42-hawking-temperature.ts` - Bridge Equation 42 — Hawking temperature (canonical 1975 derivation,

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, MASS, TEMPERATURE` | Import |
| `../../dimensional/constants.js` | `hbar, c, G, k_B` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `HawkingTemperatureInputs`
- Functions: `evaluateHawkingTemperature`, `validateBE42Dimensions`
- Constants: `BE42_HAWKING_TEMPERATURE_RHS`, `BE42_HAWKING_TEMPERATURE_LHS`

---

### `src/bridges/equations/be-43-er-epr.ts` - Bridge Equation 43 — ER=EPR Wormhole-Entropy Bound (canonical

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, AREA, DIMENSIONLESS, ENTROPY` | Import |
| `../../dimensional/constants.js` | `k_B, l_P` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |

**Exports:**
- Interfaces: `EREPRBoundInputs`
- Functions: `evaluateEREPRBound`, `validateBE43Dimensions`
- Constants: `BE43_ER_EPR_RHS`, `BE43_ER_EPR_LHS`

---

### `src/bridges/equations/be-44-soft-hair.ts` - Bridge Equation 44 — Soft Hair on Black Holes (Hawking-Perry-Strominger

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, LENGTH, TIME` | Import |
| `../../dimensional/algebra.js` | `divide, multiply` | Import |

**Exports:**
- Interfaces: `BE44SoftHairInputs`
- Functions: `evaluateBE44SoftHairCharge`, `validateBE44Dimensions`
- Constants: `SOFT_HAIR_SQUARED`, `BE44_NEWS_TENSOR`, `BE44_NEWS_SQUARED`, `BE44_SOFT_HAIR_INTEGRAL_RHS`, `BE44_SOFT_HAIR_CHARGE_SQUARED_LHS`

---

### `src/bridges/equations/be-45-tcc.ts` - Bridge Equation 45 — Trans-Planckian Censorship Conjecture (TCC) bound

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, ENERGY` | Import |

**Exports:**
- Interfaces: `TCCInputs`
- Functions: `evaluateTCC`, `validateBE45Dimensions`
- Constants: `BE45_LOG_RATIO_ARG_MP_HINF`, `BE45_LOG_RATIO_ARG_R`, `BE45_TCC_RHS`, `BE45_TCC_LHS`

---

### `src/bridges/equations/be-46-multiverse-measure.ts` - Bridge Equation 46 — Multiverse Measure Problem

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |

**Exports:**
- Interfaces: `AnthropicInputs`
- Functions: `evaluateWeinbergVilenkinP`, `validateBE46Dimensions`
- Constants: `BE46_EXP_ARGUMENT`, `BE46_EXP_FACTOR`, `BE46_NORMALIZATION`, `BE46_ANTHROPIC_PROBABILITY_RHS`, `BE46_ANTHROPIC_PROBABILITY_LHS`

---

### `src/bridges/equations/be-47-bbn-dark-sector.ts` - Bridge Equation 47 — BBN Dark-Sector-Coupling Boltzmann ODE.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS, TIME, FREQUENCY` | Import |

**Exports:**
- Interfaces: `BBNDarkInputs`
- Functions: `evaluateBBNDark`, `validateBBNDarkDimensions`
- Constants: `BBN_DARK_DYDT_TERM`, `BBN_DARK_HUBBLE_TERM`, `BBN_DARK_SM_TERM`, `BBN_DARK_DARK_TERM`, `BBN_DARK_LHS`, `BBN_DARK_RHS`

---

### `src/bridges/equations/be-48-grw-localization.ts` - Bridge Equation 48 — GRW mass-amplified localization rate

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, FREQUENCY, MASS` | Import |

**Exports:**
- Interfaces: `GRWLocalizationInputs`
- Functions: `evaluateGRWLocalization`, `validateBE48Dimensions`
- Constants: `BE48_GRW_LOCALIZATION_RHS`, `BE48_GRW_LOCALIZATION_LHS`

---

### `src/bridges/equations/be-49-quantum-darwinism.ts` - Bridge Equation 49 — Quantum Darwinism redundancy / mutual-information

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |

**Exports:**
- Interfaces: `QuantumDarwinismInputs`
- Functions: `evaluateQuantumDarwinism`, `validateBE49Dimensions`
- Constants: `BE49_QUANTUM_DARWINISM_RHS`, `BE49_QUANTUM_DARWINISM_LHS`

---

### `src/bridges/equations/be-50-wheeler-feynman.ts` - Bridge Equation 50 — Wheeler-Feynman absorber theory / time-symmetric

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |
| `../../dimensional/gauge-field.js` | `GaugeFieldNode, TimeSymmetryPredicateNode` | Import (type-only) |

**Exports:**
- Interfaces: `WFInputs`
- Functions: `evaluateWFTimeSymmetry`
- Constants: `MAGNETIC_VECTOR_POTENTIAL`, `BE50_TIME_SYMMETRY_NUMERATOR`, `BE50_TIME_SYMMETRY_DENOMINATOR`, `BE50_TIME_SYMMETRY_RESIDUAL_RHS`, `BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL`

---

### `src/bridges/equations/be-53-yang-mills-beta.ts` - Bridge Equation 53 — Yang-Mills one-loop β-function (asymptotic freedom).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode` | Import (type-only) |
| `../../dimensional/types.js` | `DIMENSIONLESS` | Import |
| `../../dimensional/rg-flow.js` | `BetaFunctionNode, RGCouplingNode` | Import (type-only) |
| `../../dimensional/rg-flow.js` | `rgCoupling` | Import |

**Exports:**
- Interfaces: `YangMillsBetaInputs`
- Functions: `evaluateYangMillsBeta`, `computeB0`
- Constants: `BE53_COUPLING_G`, `BE53_BETA_G_RHS`, `BE53_BETA_G_LHS`, `BE53_BETA_G_STRUCTURAL`

---

### `src/bridges/equations/be-54-randall-sundrum-brane.ts` - Bridge Equation 54 — Randall-Sundrum Brane Cosmology (modified Friedmann).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../../dimensional/validator.js` | `ExprNode, DimensionValidationReport` | Import (type-only) |
| `../../dimensional/validator.js` | `validate, validateEquation` | Import |
| `../../dimensional/types.js` | `Dimension, DIMENSIONLESS` | Import |
| `../../dimensional/constants.js` | `G` | Import |
| `../../core/types.js` | `PhysicalConstants` | Import |
| `../../dimensional/friedmann-equation.js` | `FriedmannEquationNode` | Import (type-only) |
| `../../dimensional/klein-gordon-equation.js` | `ScalarFieldNode` | Import (type-only) |

**Exports:**
- Interfaces: `RandallSundrumInputs`
- Functions: `evaluateRandallSundrumH2`, `validateBraneFriedmannDimensions`
- Constants: `BRANE_FRIEDMANN_RHS`, `BE54_BRANE_FRIEDMANN_STRUCTURAL`

---

### `src/bridges/gravitational-lensing.ts` - BE-?? Gravitational Lensing — Eddington 1919 weak-field deflection.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../core/constants.js` | `C_SI, G_SI` | Import |

**Exports:**
- Interfaces: `GravitationalLensingInputs`, `GravitationalLensingResult`
- Functions: `evaluateGravitationalLensing`

---

### `src/bridges/index.ts` - Universal Physics Tensor — Bridge Equation Index

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./gravitational-lensing.js` | `evaluateGravitationalLensing, type GravitationalLensingInputs, type GravitationalLensingResult` | Re-export |
| `./perihelion-precession.js` | `evaluatePerihelionPrecession, type PerihelionPrecessionInputs, type PerihelionPrecessionResult` | Re-export |

**Exports:**
- Interfaces: `KnownIssue`, `BridgeEquationEntry`
- Functions: `isActiveStatus`
- Constants: `BRIDGE_EQUATIONS`
- Re-exports: `evaluateGravitationalLensing`, `type GravitationalLensingInputs`, `type GravitationalLensingResult`, `evaluatePerihelionPrecession`, `type PerihelionPrecessionInputs`, `type PerihelionPrecessionResult`
- Default: `BRIDGE_EQUATIONS`

---

### `src/bridges/perihelion-precession-labeled.ts` - BE-52 (Mercury perihelion precession) — `LabeledTensor` demo

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../core/labeled-tensor.js` | `LabeledTensor` | Import |
| `../core/axes-registry.js` | `Axes` | Import |
| `../numerical/tensor-engine.js` | `TensorEngine` | Import (type-only) |
| `./perihelion-precession.js` | `evaluatePerihelionPrecession, PerihelionPrecessionInputs, PerihelionPrecessionResult` | Import |

**Exports:**
- Functions: `evaluatePerihelionPrecessionLabeled`

---

### `src/bridges/perihelion-precession.ts` - BE-52 Mercury Perihelion Precession — Einstein 1915.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../core/constants.js` | `C_SI, G_SI` | Import |

**Exports:**
- Interfaces: `PerihelionPrecessionInputs`, `PerihelionPrecessionResult`
- Functions: `evaluatePerihelionPrecession`

---

## Core Dependencies

### `src/core/axes-registry.ts` - `Axes` singleton registry — module-load-stable `UniversalIndex`

**External Dependencies:**
| Package | Import |
|---------|--------|
| `@danielsimonjr/universal-physics-tensor` | `Axes` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./universal-index.js` | `makeIndex` | Import |
| `./universal-index.js` | `UniversalIndex` | Import (type-only) |
| `./types.js` | `PhysicalScale, Force, Symmetry, InformationMeasure` | Import (type-only) |

**Exports:**
- Interfaces: `AxesRegistry`
- Constants: `Axes`

---

### `src/core/cell.ts` - Typed `Cell` discriminated union for `UniversalTensor`'s cell storage.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `PhysicalScale, Force, Symmetry, InformationMeasure, TensorIndices, TensorConfig, PhysicalLaw, BridgeEquation, EmergentPhenomenon` | Import (type-only) |
| `./tensor.js` | `UniversalTensor` | Import |

**Exports:**
- Interfaces: `CellBase`, `LawCell`, `BridgeCell`, `EmergenceCell`
- Functions: `compose`, `numberToCellConfidence`, `lawToCell`, `bridgeToCell`, `emergenceToCell`

---

### `src/core/constants.ts` - Canonical CODATA 2018 + SI-defined physical constants for UPT (v0.5.1).

**Exports:**
- Constants: `C_SI`, `G_SI`, `H_SI`, `HBAR_SI`, `K_B_SI`, `E_SI`, `ALPHA`, `M_P_SI`, `L_P_SI`, `T_P_SI`, `H0_SI`

---

### `src/core/flux-rules.ts` - Flux-rule scaffolding for v0.7 Proposal 2 — Sparse Semantic Catalog.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./cell.js` | `Cell, BridgeCell, LawCell, EmergenceCell` | Import (type-only) |
| `./types.js` | `PhysicalScale` | Import (type-only) |

**Exports:**
- Classes: `FluxViolationError`
- Interfaces: `FluxDiagnostic`, `FluxReport`, `FluxRuleResult`, `FluxRule`
- Functions: `checkLBECoordinate`, `checkCausality`, `runRules`, `installRegimeConsistencyRule`, `checkRegimeConsistency`
- Constants: `V07_CELL_RULES`

---

### `src/core/labeled-tensor.ts` - `LabeledTensor` — engine-level tensor wrapped with

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../numerical/tensor-engine.js` | `EngineTensor, TensorEngine, EinsumSpec` | Import (type-only) |
| `../dimensional/errors.js` | `UPTError` | Import |
| `./universal-index.js` | `AxisName, UniversalIndex, UniversalIndexId` | Import (type-only) |

**Exports:**
- Classes: `LabeledTensorConstructionError`, `AxisMismatchError`, `IdentityConflictError`, `RankPreservationError`, `LabeledTensor`
- Functions: `canonicalLabelOrder`

---

### `src/core/regime-registry.ts` - `RegimeType` extension system — v0.8 Proposal 5.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./universal-index.js` | `AxisName` | Import (type-only) |

**Exports:**
- Classes: `RegimeCollisionError`
- Interfaces: `RegimeProvenance`, `RegimeValueBase`, `RegimeSpec`
- Functions: `defineRegime`, `lookupRegime`, `listRegimesByAxis`, `provenanceFor`, `attachRegimesToCell`, `getCellRegimes`, `_resetRegistryForTesting`
- Constants: `defineScale`, `defineForce`, `defineSymmetry`, `defineInformation`, `defineDimension`, `defineTopology`

---

### `src/core/regime-rule-install.ts` - Wiring: installs P5's `RegimeConsistency` rule body into the

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./flux-rules.js` | `installRegimeConsistencyRule, FluxRuleResult` | Import |
| `./regime-registry.js` | `getCellRegimes` | Import |
| `./cell.js` | `Cell` | Import (type-only) |
| `./universal-index.js` | `AxisName` | Import (type-only) |

---

### `src/core/regimes-builtins.ts` - Built-in regime registrations — Phase 2 of v0.8 Proposal 5.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./regime-registry.js` | `defineRegime` | Import |
| `./types.js` | `PhysicalScale, Force, Symmetry, InformationMeasure` | Import (type-only) |

---

### `src/core/tensor.ts` - Universal Physics Tensor

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `TensorConfig, TensorIndices, PhysicalLaw, BridgeEquation, EmergentPhenomenon, PhysicalScale, Force` | Import (type-only) |
| `./cell.js` | `Cell, CellConfidence, LawCell, BridgeCell, EmergenceCell` | Import (type-only) |
| `./cell.js` | `lawToCell, bridgeToCell, emergenceToCell` | Import |
| `./flux-rules.js` | `FluxRule, FluxReport, FluxDiagnostic` | Import (type-only) |
| `./flux-rules.js` | `runRules, V07_CELL_RULES, FluxViolationError` | Import |

**Exports:**
- Classes: `UniversalTensor`

---

### `src/core/types.ts` - Core types for Universal Physics Tensor Framework

**Exports:**
- Interfaces: `TensorConfig`, `TensorIndices`, `PhysicalLaw`, `BridgeEquation`, `EmergentPhenomenon`
- Constants: `PhysicalConstants`

---

### `src/core/universal-index.ts` - Universal index — persistent-identity carrier for physics axes.

**Exports:**
- Interfaces: `UniversalIndex`, `MakeIndexOptions`
- Functions: `makeIndex`

---

## Diff Dependencies

### `src/diff/bridge-gradient.ts` - Bridge-parameter differentiation — v0.9 Proposal 8 core layer.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../numerical/tensor-engine.js` | `EngineTensor, TensorEngine` | Import (type-only) |
| `../numerical/tensor-engine.js` | `hasAutogradSupport` | Import |
| `../numerical/errors.js` | `EngineCapabilityError` | Import |

**Exports:**
- Interfaces: `BridgeDiffSpec`, `BridgeGradientResult`
- Functions: `bridgeGradient`, `gradientToNamed`

---

### `src/diff/bridge-specs.ts` - Differentiable-bridge specs — v0.9 Proposal 8 Phase 2.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./bridge-gradient.js` | `BridgeDiffSpec` | Import (type-only) |
| `../bridges/equations/be-37-shapiro-delay.js` | `evaluateShapiroDelay, ShapiroInputs` | Import |
| `../bridges/perihelion-precession.js` | `evaluatePerihelionPrecession, PerihelionPrecessionInputs` | Import |
| `../bridges/equations/be-42-hawking-temperature.js` | `evaluateHawkingTemperature, HawkingTemperatureInputs` | Import |
| `../bridges/equations/be-11-decoherence-master.js` | `evaluateDecoherenceRate, DecoherenceRateInputs` | Import |

**Exports:**
- Constants: `BE37_SHAPIRO_DIFF`, `BE52_PERIHELION_DIFF`, `BE42_HAWKING_DIFF`, `BE11_DECOHERENCE_DIFF`, `DIFFERENTIABLE_BRIDGE_SPECS`

---

## Dimensional Dependencies

### `src/dimensional/algebra.ts` - Dimensional algebra: per-base-exponent arithmetic.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension, NAMED_DIMENSIONS` | Import |
| `./errors.js` | `DimensionMismatchError` | Import |

**Exports:**
- Functions: `multiply`, `divide`, `power`, `equals`, `add`, `subtract`, `format`

---

### `src/dimensional/bridge-check.ts` - Bridge-index integration scaffold.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension, DIMENSIONLESS, ENERGY, ENTROPY, FREQUENCY, TIME, MASS, LENGTH, AREA, FORCE, TEMPERATURE` | Import |
| `./validator.js` | `ExprNode, validate` | Import |
| `./algebra.js` | `equals, multiply, power` | Import |

**Exports:**
- Functions: `inferDimensionForBridge`
- Constants: `EXPECTED_DIMENSION_BY_BRIDGE`

---

### `src/dimensional/connection-validators.ts` - Per-kind validation for v0.4.0 connection-layer AST nodes.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./tensor.js` | `Role, TensorSymbolNode` | Import (type-only) |
| `./algebra.js` | `divide` | Import |
| `./metric-validators.js` | `MetricTensorNode, CovariantIndex, PartialDerivativeChildResult` | Import (type-only) |
| `./errors.js` | `PartialDerivativeIndexVarianceError, MetricSignatureError, DuplicateCoordinateWarning, IndexLabelCollisionError` | Import |
| `./curvature-composite.js` | `CurvatureCompositeNode` | Import (type-only) |

**Exports:**
- Interfaces: `UpperIndex`, `CovariantDerivativeNode`
- Functions: `validateCovariantDerivative`, `validateRiemannTensor`

---

### `src/dimensional/connection.ts` - v0.4.0 connection-layer helpers (composite-formula builders that produce

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `DIMENSIONLESS` | Import |
| `./tensor.js` | `contract, tsym` | Import |
| `./tensor.js` | `TensorSymbolNode` | Import (type-only) |
| `./metric.js` | `metric, pderiv` | Import |
| `./metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `./validator.js` | `ExprNode` | Import (type-only) |
| `./fresh-label.js` | `freshLabel` | Import |

**Exports:**
- Functions: `christoffel`

---

### `src/dimensional/constants.ts` - SI dimensional signatures of fundamental physical constants.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension, LENGTH, VELOCITY, ACTION, CHARGE` | Import |

**Exports:**
- Constants: `hbar`, `c`, `G`, `k_B`, `e`, `l_P`

---

### `src/dimensional/curvature-composite.ts` - Curvature composite-AST factory (v0.6.0 Phase 3, Task 3.9).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |

**Exports:**
- Interfaces: `CurvatureKindSpec`
- Constants: `CURVATURE_KIND_REGISTRY`

---

### `src/dimensional/curvature-invariants.ts` - Kretschmann scalar AST node + validator (v0.6.0 Phase 3, Task 3.5).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./connection-validators.js` | `RiemannTensorNode` | Import (type-only) |
| `./connection-validators.js` | `validateRiemannTensor` | Import |
| `./metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `./curvature-composite.js` | `CurvatureCompositeNode` | Import (type-only) |

**Exports:**
- Interfaces: `KretschmannScalarValidationResult`
- Functions: `validateKretschmannScalar`

---

### `src/dimensional/curvature.ts` - Curvature-derived helpers — Ricci, Einstein, Bianchi (v0.5.0 Phase 1d).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./metric-validators.js` | `CovariantIndex` | Import (type-only) |
| `./validator.js` | `ExprNode` | Import (type-only) |
| `./connection-validators.js` | `RiemannTensorNode` | Import (type-only) |
| `./metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `./errors.js` | `IndexLabelCollisionError` | Import |
| `./curvature-composite.js` | `CurvatureCompositeNode` | Import (type-only) |
| `../numerical/tensor-engine.js` | `TensorEngine` | Import (type-only) |
| `../numerical/types.js` | `NumericalInputs, NestedArray` | Import (type-only) |

**Exports:**
- Interfaces: `RicciTensorValidationResult`, `EinsteinTensorValidationResult`, `BianchiResidualValidationResult`
- Functions: `validateRicciTensor`, `ricci`, `validateEinsteinTensor`, `einstein`, `validateBianchiResidual`, `bianchiResidual`

---

### `src/dimensional/einstein-equation.ts` - Einstein field equation AST node (v0.6.0 Phase 2, Task 2.3).

**External Dependencies:**
| Package | Import |
|---------|--------|
| `universal-physics-tensor` | `validateEinsteinFieldEquation` |
| `universal-physics-tensor` | `*   EinsteinFieldEquationNode, *   EinsteinTensorNode, *   StressEnergyTensorNode, *` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./metric-validators.js` | `CovariantIndex` | Import (type-only) |
| `./metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `./curvature.js` | `EinsteinTensorNode` | Import (type-only) |
| `./stress-energy-validators.js` | `StressEnergyTensorNode, CosmologicalConstantNode` | Import (type-only) |
| `./field-equation-helpers.js` | `validateFreeIndexLabelMatch, validateComponentDimension, validateTensorSymmetry` | Import |

**Exports:**
- Interfaces: `EinsteinFieldEquationNode`, `EinsteinFieldEquationValidationResult`
- Functions: `validateEinsteinFieldEquation`

---

### `src/dimensional/errors.ts` - UPT error hierarchy. All UPT-source errors subclass UPTError so

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import |

**Exports:**
- Classes: `UPTError`, `DimensionMismatchError`, `DuplicateIndexLabelError`, `IndexLabelCollisionError`, `VarianceMismatchError`, `TensorInScalarOpError`, `FreeIndexMismatchError`, `TensorProductChildInferenceError`, `InvalidMetricRankError`, `MetricSignatureError`, `InvalidKroneckerRankError`, `KroneckerVarianceError`, `PartialDerivativeIndexVarianceError`, `DuplicateCoordinateWarning`

---

### `src/dimensional/field-equation-helpers.ts` - Shared validation helpers for field-equation predicate AST nodes

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |

**Exports:**
- Functions: `validateFreeIndexLabelMatch`, `validateComponentDimension`, `validateTensorSymmetry`

---

### `src/dimensional/fresh-label.ts` - Shared deterministic fresh-label utility used by both metric.ts (raise/lower)

**Exports:**
- Functions: `freshLabel`

---

### `src/dimensional/friedmann-equation.ts` - Friedmann equation AST node — modified-cosmology predicate.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./klein-gordon-equation.js` | `ScalarFieldNode` | Import (type-only) |
| `./field-equation-helpers.js` | `validateFreeIndexLabelMatch, validateComponentDimension, validateTensorSymmetry` | Import |

**Exports:**
- Interfaces: `FriedmannEquationNode`, `FriedmannEquationValidationResult`
- Functions: `validateFriedmannEquation`

---

### `src/dimensional/gauge-field.ts` - Gauge-field AST primitives for Wheeler-Feynman absorber-theory

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./field-equation-helpers.js` | `validateComponentDimension` | Import |

**Exports:**
- Interfaces: `GaugeFieldNode`, `TimeSymmetryPredicateNode`, `TimeSymmetryPredicateValidationResult`
- Functions: `validateGaugeField`, `validateTimeSymmetryPredicate`

---

### `src/dimensional/killing-validators.ts` - Killing-vector machinery (v0.6.0 Phase 1, Tasks 1.1–1.2).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./tensor.js` | `TensorSymbolNode` | Import (type-only) |
| `./metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `./algebra.js` | `multiply` | Import |

**Exports:**
- Interfaces: `KillingVectorNode`, `ConservedChargeNode`
- Functions: `validateKillingVector`, `validateConservedCharge`

---

### `src/dimensional/klein-gordon-equation.ts` - Klein-Gordon scalar field equation AST node.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./field-equation-helpers.js` | `validateFreeIndexLabelMatch, validateComponentDimension, validateTensorSymmetry` | Import |

**Exports:**
- Interfaces: `ScalarFieldNode`, `KleinGordonEquationNode`, `KleinGordonEquationValidationResult`
- Functions: `validateKleinGordonEquation`

---

### `src/dimensional/metric-validators.ts` - Per-kind validation for v0.3.0 metric-layer AST nodes.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./tensor.js` | `Variance, Role, TensorIndex` | Import (type-only) |
| `./algebra.js` | `divide` | Import |
| `./errors.js` | `InvalidMetricRankError, MetricSignatureError, InvalidKroneckerRankError, KroneckerVarianceError, PartialDerivativeIndexVarianceError, IndexLabelCollisionError` | Import |

**Exports:**
- Interfaces: `MetricTensorNode`, `MetricTensorValidationResult`, `KroneckerDeltaNode`, `KroneckerDeltaValidationResult`, `CovariantIndex`, `TensorPartialDerivativeNode`, `PartialDerivativeValidationResult`, `PartialDerivativeChildResult`
- Functions: `checkInverseMetricStructure`, `validateMetricTensor`, `validateKroneckerDelta`, `validatePartialDerivative`

---

### `src/dimensional/metric.ts` - User-facing constructors and ergonomic helpers for v0.3.0 metric-layer

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./types.js` | `DIMENSIONLESS` | Import |
| `./fresh-label.js` | `freshLabel` | Import |
| `./tensor.js` | `TensorIndex` | Import (type-only) |
| `./tensor.js` | `TensorProductNode` | Import (type-only) |
| `./metric-validators.js` | `MetricTensorNode, KroneckerDeltaNode, TensorPartialDerivativeNode, CovariantIndex` | Import (type-only) |
| `./validator.js` | `ExprNode` | Import (type-only) |
| `./validator.js` | `validate` | Import |
| `./errors.js` | `MetricSignatureError, UPTError` | Import |

**Exports:**
- Functions: `metric`, `kronecker`, `pderiv`, `raise`, `lower`

---

### `src/dimensional/rg-flow.ts` - Renormalization-group (RG) flow primitives — `RGCouplingNode` +

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./validator.js` | `ExprNode` | Import (type-only) |
| `./validator.js` | `validate` | Import |
| `./types.js` | `Dimension` | Import (type-only) |
| `./types.js` | `DIMENSIONLESS` | Import |
| `./algebra.js` | `equals` | Import |

**Exports:**
- Interfaces: `RGCouplingNode`, `BetaFunctionNode`, `BetaFunctionValidationResult`
- Functions: `rgCoupling`, `validateRGCoupling`, `validateBetaFunction`

---

### `src/dimensional/stress-energy-validators.ts` - Stress-energy tensor and cosmological constant AST nodes (v0.6.0 Phase 2).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./metric-validators.js` | `CovariantIndex` | Import (type-only) |

**Exports:**
- Interfaces: `StressEnergyTensorNode`, `CosmologicalConstantNode`
- Functions: `validateStressEnergyTensor`, `validateCosmologicalConstant`

---

### `src/dimensional/tensor-trace.ts` - TensorTraceNode — structural tensor-trace operator for rank-2 tensors.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `./field-equation-helpers.js` | `validateComponentDimension, validateTensorSymmetry` | Import |

**Exports:**
- Interfaces: `TracableTensorNode`, `TensorTraceNode`, `TensorTraceValidationResult`, `TensorTraceOptions`
- Functions: `validateTensorTrace`

---

### `src/dimensional/tensor.ts` - Tensor AST node types and helpers — v0.2.0 algebra layer.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./types.js` | `DIMENSIONLESS` | Import |
| `./algebra.js` | `multiply` | Import |
| `./validator.js` | `ExprNode` | Import (type-only) |
| `./errors.js` | `DuplicateIndexLabelError, IndexLabelCollisionError, VarianceMismatchError` | Import |

**Exports:**
- Interfaces: `TensorIndex`, `TensorSymbolNode`, `TensorProductNode`, `ChildValidationResult`
- Functions: `validateTensorSymbol`, `computeContraction`, `tsym`, `scale`, `contract`, `tsum`

---

### `src/dimensional/types.ts` - SI dimensional types.

**Exports:**
- Interfaces: `Dimension`
- Constants: `DIMENSIONLESS`, `LENGTH`, `AREA`, `TIME`, `FREQUENCY`, `MASS`, `VELOCITY`, `ACCELERATION`, `FORCE`, `ENERGY`, `POWER`, `ACTION`, `TEMPERATURE`, `ENTROPY`, `CHARGE`, `NAMED_DIMENSIONS`

---

### `src/dimensional/validator-registry.ts` - Validator registry for curvature- and GR-object node kinds.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./connection-validators.js` | `RiemannTensorNode` | Import (type-only) |
| `./connection-validators.js` | `validateRiemannTensor` | Import |
| `./curvature.js` | `validateRicciTensor, validateEinsteinTensor, validateBianchiResidual` | Import |
| `./killing-validators.js` | `validateKillingVector, validateConservedCharge` | Import |
| `./stress-energy-validators.js` | `validateStressEnergyTensor, validateCosmologicalConstant` | Import |
| `./einstein-equation.js` | `validateEinsteinFieldEquation` | Import |
| `./weyl-validators.js` | `validateWeylTensor` | Import |
| `./curvature-invariants.js` | `validateKretschmannScalar` | Import |

**Exports:**
- Functions: `lookupValidatorEntry`, `dispatchValidator`, `shouldPropagateFreeIndices`

---

### `src/dimensional/validator.ts` - Validator: walks an ExprNode tree and infers / checks SI dimensions.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension, DIMENSIONLESS` | Import |
| `./algebra.js` | `multiply, divide, power, add, subtract, equals, format, DimensionMismatchError` | Import |
| `./errors.js` | `TensorInScalarOpError, FreeIndexMismatchError, TensorProductChildInferenceError` | Import |
| `./tensor.js` | `TensorSymbolNode, TensorProductNode, ChildValidationResult` | Import (type-only) |
| `./tensor.js` | `validateTensorSymbol, computeContraction` | Import |
| `./metric-validators.js` | `MetricTensorNode, KroneckerDeltaNode, TensorPartialDerivativeNode, PartialDerivativeChildResult` | Import (type-only) |
| `./metric-validators.js` | `validateMetricTensor, validateKroneckerDelta, validatePartialDerivative, checkInverseMetricStructure` | Import |
| `./connection-validators.js` | `CovariantDerivativeNode, RiemannTensorNode` | Import (type-only) |
| `./connection-validators.js` | `validateCovariantDerivative` | Import |
| `./curvature.js` | `RicciTensorNode, EinsteinTensorNode, BianchiResidualNode` | Import (type-only) |
| `./killing-validators.js` | `KillingVectorNode, ConservedChargeNode` | Import (type-only) |
| `./stress-energy-validators.js` | `StressEnergyTensorNode, CosmologicalConstantNode` | Import (type-only) |
| `./einstein-equation.js` | `EinsteinFieldEquationNode` | Import (type-only) |
| `./weyl-validators.js` | `WeylTensorNode` | Import (type-only) |
| `./curvature-invariants.js` | `KretschmannScalarNode` | Import (type-only) |
| `./validator-registry.js` | `lookupValidatorEntry, dispatchValidator, shouldPropagateFreeIndices` | Import |
| `./tensor.js` | `TensorSymbolNode, TensorProductNode` | Re-export |
| `./metric-validators.js` | `MetricTensorNode, KroneckerDeltaNode, TensorPartialDerivativeNode` | Re-export |
| `./connection-validators.js` | `CovariantDerivativeNode, RiemannTensorNode, UpperIndex` | Re-export |
| `./curvature.js` | `RicciTensorNode, EinsteinTensorNode, BianchiResidualNode` | Re-export |
| `./killing-validators.js` | `KillingVectorNode, ConservedChargeNode` | Re-export |
| `./stress-energy-validators.js` | `StressEnergyTensorNode, CosmologicalConstantNode` | Re-export |
| `./einstein-equation.js` | `EinsteinFieldEquationNode` | Re-export |
| `./weyl-validators.js` | `WeylTensorNode` | Re-export |
| `./curvature-invariants.js` | `KretschmannScalarNode` | Re-export |

**Exports:**
- Interfaces: `Violation`, `ValidationResult`, `DimensionValidationReport`
- Functions: `validate`, `validateInverseMetricPair`, `validateEquation`
- Re-exports: `TensorSymbolNode`, `TensorProductNode`, `MetricTensorNode`, `KroneckerDeltaNode`, `TensorPartialDerivativeNode`, `CovariantDerivativeNode`, `RiemannTensorNode`, `UpperIndex`, `RicciTensorNode`, `EinsteinTensorNode`, `BianchiResidualNode`, `KillingVectorNode`, `ConservedChargeNode`, `StressEnergyTensorNode`, `CosmologicalConstantNode`, `EinsteinFieldEquationNode`, `WeylTensorNode`, `KretschmannScalarNode`

---

### `src/dimensional/weyl-validators.ts` - Per-kind validation for the v0.6.0 WeylTensorNode.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `Dimension` | Import (type-only) |
| `./metric-validators.js` | `MetricTensorNode, CovariantIndex` | Import (type-only) |
| `./connection-validators.js` | `UpperIndex` | Import (type-only) |
| `./errors.js` | `PartialDerivativeIndexVarianceError, IndexLabelCollisionError` | Import |
| `./curvature-composite.js` | `CurvatureCompositeNode` | Import (type-only) |

**Exports:**
- Functions: `validateWeylTensor`

---

## Entry Dependencies

### `src/index.ts` - Universal Physics Tensor Framework

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./core/regime-rule-install.js` | `*` | Import |
| `./core/regimes-builtins.js` | `*` | Import |
| `./core/tensor.js` | `UniversalTensor` | Re-export |
| `./core/constants.js` | `C_SI, G_SI, H_SI, HBAR_SI, K_B_SI, E_SI, ALPHA, M_P_SI, L_P_SI, T_P_SI, H0_SI` | Re-export |
| `./core/types.js` | `TensorConfig, TensorIndices, PhysicalLaw, BridgeEquation, EmergentPhenomenon, PhysicalScale, Force, Symmetry, InformationMeasure` | Re-export |
| `./core/types.js` | `PhysicalConstants` | Re-export |
| `./core/cell.js` | `Cell, CellBase, CellConfidence, LawCell, BridgeCell, EmergenceCell` | Re-export |
| `./core/cell.js` | `compose` | Re-export |
| `./core/flux-rules.js` | `FluxDiagnostic, FluxReport` | Re-export |
| `./core/flux-rules.js` | `FluxViolationError` | Re-export |
| `./bridges/catalog-adapter.js` | `CatalogEntryStatus, CatalogIngestionReport` | Re-export |
| `./bridges/catalog-adapter.js` | `catalogToCells, scanCatalog, ingestCatalog, ingestionReportToFluxReport, CatalogIngestionError` | Re-export |
| `./core/universal-index.js` | `AxisName, UniversalIndex, UniversalIndexId, MakeIndexOptions` | Re-export |
| `./core/universal-index.js` | `makeIndex` | Re-export |
| `./core/axes-registry.js` | `AxesRegistry` | Re-export |
| `./core/axes-registry.js` | `Axes` | Re-export |
| `./core/labeled-tensor.js` | `LabeledTensor, LabeledTensorConstructionError, AxisMismatchError, IdentityConflictError, RankPreservationError` | Re-export |
| `./core/regime-registry.js` | `RegimeProvenance, RegimeValueBase, RegimeSpec` | Re-export |
| `./core/regime-registry.js` | `defineRegime, defineScale, defineForce, defineSymmetry, defineInformation, defineDimension, defineTopology, lookupRegime, listRegimesByAxis, provenanceFor, attachRegimesToCell, getCellRegimes, RegimeCollisionError` | Re-export |
| `./diff/bridge-gradient.js` | `BridgeDiffSpec, BridgeGradientResult` | Re-export |
| `./diff/bridge-gradient.js` | `bridgeGradient, gradientToNamed` | Re-export |
| `./diff/bridge-specs.js` | `BE37_SHAPIRO_DIFF, BE52_PERIHELION_DIFF, BE42_HAWKING_DIFF, BE11_DECOHERENCE_DIFF, DIFFERENTIABLE_BRIDGE_SPECS` | Re-export |
| `./bridges/index.js` | `BRIDGE_EQUATIONS` | Re-export |
| `./bridges/index.js` | `BridgeEquationEntry, BridgeEquationStatus, BridgeIssueSeverity, BridgeIssueFixable, KnownIssue` | Re-export |
| `./bridges/index.js` | `evaluateGravitationalLensing, type GravitationalLensingInputs, type GravitationalLensingResult, evaluatePerihelionPrecession, type PerihelionPrecessionInputs, type PerihelionPrecessionResult` | Re-export |
| `./dimensional/connection.js` | `christoffel` | Re-export |
| `./dimensional/validator.js` | `CovariantDerivativeNode` | Re-export |
| `./dimensional/curvature.js` | `ricci` | Re-export |
| `./dimensional/validator.js` | `RicciTensorNode` | Re-export |
| `./dimensional/curvature.js` | `einstein` | Re-export |
| `./dimensional/validator.js` | `EinsteinTensorNode` | Re-export |
| `./dimensional/curvature.js` | `bianchiResidual` | Re-export |
| `./dimensional/validator.js` | `BianchiResidualNode` | Re-export |
| `./numerical/killing.js` | `verifyKillingEquation, evaluateConservedCharge` | Re-export |
| `./numerical/killing.js` | `KillingEquationOptions, ChristoffelAccess` | Re-export |
| `./numerical/geodesic-integrator.js` | `integrateGeodesic, type GeodesicIntegratorInputs, type GeodesicIntegratorResult` | Re-export |
| `./dimensional/tensor-trace.js` | `TracableTensorNode, TensorTraceNode, TensorTraceValidationResult, TensorTraceOptions` | Re-export |
| `./dimensional/tensor-trace.js` | `validateTensorTrace` | Re-export |
| `./dimensional/friedmann-equation.js` | `FriedmannVariant, FriedmannEquationNode, FriedmannEquationValidationResult` | Re-export |
| `./dimensional/friedmann-equation.js` | `validateFriedmannEquation` | Re-export |
| `./dimensional/rg-flow.js` | `RGCouplingNode, BetaFunctionNode, BetaFunctionValidationResult` | Re-export |
| `./dimensional/rg-flow.js` | `rgCoupling, validateRGCoupling, validateBetaFunction` | Re-export |
| `./dimensional/gauge-field.js` | `ArrowOfTime, GaugeFieldNode, TimeSymmetryPredicateNode, TimeSymmetryPredicateValidationResult` | Re-export |
| `./dimensional/gauge-field.js` | `validateGaugeField, validateTimeSymmetryPredicate` | Re-export |
| `./dimensional/klein-gordon-equation.js` | `ScalarFieldNode, KleinGordonEquationNode, KleinGordonEquationValidationResult` | Re-export |
| `./dimensional/klein-gordon-equation.js` | `validateKleinGordonEquation` | Re-export |
| `./dimensional/types.js` | `Dimension` | Re-export |
| `./dimensional/types.js` | `DIMENSIONLESS, LENGTH, AREA, TIME, FREQUENCY, MASS, VELOCITY, ACCELERATION, FORCE, ENERGY, POWER, ACTION, TEMPERATURE, ENTROPY, CHARGE` | Re-export |
| `./dimensional/algebra.js` | `multiply, divide, power, add, subtract, equals, format, DimensionMismatchError` | Re-export |
| `./dimensional/validator.js` | `ExprNode, ValidationResult, Violation` | Re-export |
| `./dimensional/validator.js` | `validate, validateEquation, validateInverseMetricPair` | Re-export |
| `./dimensional/bridge-check.js` | `inferDimensionForBridge` | Re-export |
| `./numerical/einstein-equation.js` | `evaluateEinsteinEquationResidual` | Re-export |
| `./numerical/einstein-equation.js` | `EinsteinEquationResidualInput, MetricClosure, Vec4` | Re-export |
| `./dimensional/einstein-equation.js` | `validateEinsteinFieldEquation` | Re-export |
| `./dimensional/einstein-equation.js` | `EinsteinFieldEquationNode, EinsteinFieldEquationValidationResult` | Re-export |
| `./dimensional/curvature-invariants.js` | `KretschmannScalarNode, KretschmannScalarValidationResult` | Re-export |
| `./dimensional/curvature-invariants.js` | `validateKretschmannScalar` | Re-export |
| `./numerical/kretschmann.js` | `computeKretschmann` | Re-export |
| `./numerical/index.js` | `evaluateNumerical, evaluateNumericalRaw, evaluateMetricInverse, Float64ReferenceEngine, getActiveEngine, setActiveEngine, NumericalBackendError, DuplicateCoordinateWarning, EngineCapabilityError, hasAutogradSupport, evaluateBE37CovariantEikonalNumerical, integrateGeodesicGL4, findPerihelion` | Re-export |
| `./numerical/index.js` | `NumericalResult, NumericalRawResult, EvaluateOptions, NumericalInputs, TensorEngine, EngineTensor, EinsumSpec, NestedArray, GridField, ForwardGradResult, ReverseGradResult, GL4State, GL4Snapshot, GL4Options, PerihelionResult, FindPerihelionOptions` | Re-export |

**Exports:**
- Re-exports: `UniversalTensor`, `C_SI`, `G_SI`, `H_SI`, `HBAR_SI`, `K_B_SI`, `E_SI`, `ALPHA`, `M_P_SI`, `L_P_SI`, `T_P_SI`, `H0_SI`, `TensorConfig`, `TensorIndices`, `PhysicalLaw`, `BridgeEquation`, `EmergentPhenomenon`, `PhysicalScale`, `Force`, `Symmetry`, `InformationMeasure`, `PhysicalConstants`, `Cell`, `CellBase`, `CellConfidence`, `LawCell`, `BridgeCell`, `EmergenceCell`, `compose`, `FluxDiagnostic`, `FluxReport`, `FluxViolationError`, `CatalogEntryStatus`, `CatalogIngestionReport`, `catalogToCells`, `scanCatalog`, `ingestCatalog`, `ingestionReportToFluxReport`, `CatalogIngestionError`, `AxisName`, `UniversalIndex`, `UniversalIndexId`, `MakeIndexOptions`, `makeIndex`, `AxesRegistry`, `Axes`, `LabeledTensor`, `LabeledTensorConstructionError`, `AxisMismatchError`, `IdentityConflictError`, `RankPreservationError`, `RegimeProvenance`, `RegimeValueBase`, `RegimeSpec`, `defineRegime`, `defineScale`, `defineForce`, `defineSymmetry`, `defineInformation`, `defineDimension`, `defineTopology`, `lookupRegime`, `listRegimesByAxis`, `provenanceFor`, `attachRegimesToCell`, `getCellRegimes`, `RegimeCollisionError`, `BridgeDiffSpec`, `BridgeGradientResult`, `bridgeGradient`, `gradientToNamed`, `BE37_SHAPIRO_DIFF`, `BE52_PERIHELION_DIFF`, `BE42_HAWKING_DIFF`, `BE11_DECOHERENCE_DIFF`, `DIFFERENTIABLE_BRIDGE_SPECS`, `BRIDGE_EQUATIONS`, `BridgeEquationEntry`, `BridgeEquationStatus`, `BridgeIssueSeverity`, `BridgeIssueFixable`, `KnownIssue`, `evaluateGravitationalLensing`, `type GravitationalLensingInputs`, `type GravitationalLensingResult`, `evaluatePerihelionPrecession`, `type PerihelionPrecessionInputs`, `type PerihelionPrecessionResult`, `christoffel`, `CovariantDerivativeNode`, `ricci`, `RicciTensorNode`, `einstein`, `EinsteinTensorNode`, `bianchiResidual`, `BianchiResidualNode`, `verifyKillingEquation`, `evaluateConservedCharge`, `KillingEquationOptions`, `ChristoffelAccess`, `integrateGeodesic`, `type GeodesicIntegratorInputs`, `type GeodesicIntegratorResult`, `TracableTensorNode`, `TensorTraceNode`, `TensorTraceValidationResult`, `TensorTraceOptions`, `validateTensorTrace`, `FriedmannVariant`, `FriedmannEquationNode`, `FriedmannEquationValidationResult`, `validateFriedmannEquation`, `RGCouplingNode`, `BetaFunctionNode`, `BetaFunctionValidationResult`, `rgCoupling`, `validateRGCoupling`, `validateBetaFunction`, `ArrowOfTime`, `GaugeFieldNode`, `TimeSymmetryPredicateNode`, `TimeSymmetryPredicateValidationResult`, `validateGaugeField`, `validateTimeSymmetryPredicate`, `ScalarFieldNode`, `KleinGordonEquationNode`, `KleinGordonEquationValidationResult`, `validateKleinGordonEquation`, `Dimension`, `DIMENSIONLESS`, `LENGTH`, `AREA`, `TIME`, `FREQUENCY`, `MASS`, `VELOCITY`, `ACCELERATION`, `FORCE`, `ENERGY`, `POWER`, `ACTION`, `TEMPERATURE`, `ENTROPY`, `CHARGE`, `multiply`, `divide`, `power`, `add`, `subtract`, `equals`, `format`, `DimensionMismatchError`, `ExprNode`, `ValidationResult`, `Violation`, `validate`, `validateEquation`, `validateInverseMetricPair`, `inferDimensionForBridge`, `evaluateEinsteinEquationResidual`, `EinsteinEquationResidualInput`, `MetricClosure`, `Vec4`, `validateEinsteinFieldEquation`, `EinsteinFieldEquationNode`, `EinsteinFieldEquationValidationResult`, `KretschmannScalarNode`, `KretschmannScalarValidationResult`, `validateKretschmannScalar`, `computeKretschmann`, `evaluateNumerical`, `evaluateNumericalRaw`, `evaluateMetricInverse`, `Float64ReferenceEngine`, `getActiveEngine`, `setActiveEngine`, `NumericalBackendError`, `DuplicateCoordinateWarning`, `EngineCapabilityError`, `hasAutogradSupport`, `evaluateBE37CovariantEikonalNumerical`, `integrateGeodesicGL4`, `findPerihelion`, `NumericalResult`, `NumericalRawResult`, `EvaluateOptions`, `NumericalInputs`, `TensorEngine`, `EngineTensor`, `EinsumSpec`, `NestedArray`, `GridField`, `ForwardGradResult`, `ReverseGradResult`, `GL4State`, `GL4Snapshot`, `GL4Options`, `PerihelionResult`, `FindPerihelionOptions`

---

## Numerical Dependencies

### `src/numerical/be37-covariant-eikonal.ts` - v0.5.0 BE-37 covariant-eikonal numerical evaluator.

**External Dependencies:**
| Package | Import |
|---------|--------|
| `universal-physics-tensor` | `evaluateBE37CovariantEikonalNumerical, G_SI, C_SI` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./gl4-integrator.js` | `integrateGeodesicGL4` | Import |
| `../core/constants.js` | `C_SI, G_SI` | Import |
| `./null-ic.js` | `reconstructNullPr` | Import |

**Exports:**
- Interfaces: `BE37CovariantEikonalInputs`, `BE37CovariantEikonalResult`
- Functions: `evaluateBE37CovariantEikonalNumerical`

---

### `src/numerical/christoffel-flat.ts` - Flat-array Christoffel evaluator (v0.6.0 Phase 2, Task 2.8 — BR-2 BREAKING).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../core/constants.js` | `C_SI, G_SI` | Import |

**Exports:**
- Functions: `encodeChristoffelIndex`, `christoffelFnFlat`

---

### `src/numerical/connection-lowering-helpers.ts` - Numerical helpers for covariant-derivative lowering (Task 12 [U]).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./tensor-engine.js` | `EngineTensor, TensorEngine` | Import (type-only) |
| `./types.js` | `NestedArray` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./strides.js` | `rowMajorStrides, flatIndex, sameShape` | Import |

**Exports:**
- Functions: `flattenNA`, `zeroTensorLike`, `zeroTensor`, `flatToNested`, `tensorAdd`, `tensorAddScaled`, `computeChristoffelTensor`, `contractChristoffelWithOperand`, `getMetricDerivFlat`

---

### `src/numerical/curvature-lowering-helpers.ts` - Numerical helpers for Riemann-curvature lowering (Task 6 [U] / v0.5.0 1c-ii).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./tensor-engine.js` | `EngineTensor, TensorEngine` | Import (type-only) |
| `./types.js` | `NestedArray, NumericalInputs` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./connection-lowering-helpers.js` | `computeChristoffelTensor, flattenNA` | Import |
| `./pderiv.js` | `pderivNumericalFn` | Import |
| `../dimensional/curvature.js` | `BianchiResidualNode` | Import (type-only) |
| `../dimensional/weyl-validators.js` | `WeylTensorNode` | Import (type-only) |
| `./weyl-lowering.js` | `computeWeylTensor` | Import |

**Exports:**
- Functions: `christoffelAt`, `dGammaAt`, `buildRiemann`, `riemannLowerAt`, `covariantDerivRiemannLowerAt`, `bianchiResidualAt`, `contractRiemannJS`, `lowerBianchiResidual`, `lowerWeylTensor`

---

### `src/numerical/derivative-lowering.ts` - Derivative-arm lowering — extracted from `lowering.ts`'s switch

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../dimensional/validator.js` | `ExprNode` | Import (type-only) |
| `../dimensional/validator.js` | `validate` | Import |
| `../dimensional/tensor.js` | `TensorSymbolNode` | Import (type-only) |
| `../dimensional/metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `../dimensional/connection-validators.js` | `CovariantDerivativeNode` | Import (type-only) |
| `./pderiv.js` | `pderivGrid, pderivNumericalFn, pderivSymbolic` | Import |
| `./tensor-engine.js` | `EngineTensor, TensorEngine` | Import (type-only) |
| `./types.js` | `NumericalInputs, NestedArray` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./connection-lowering-helpers.js` | `zeroTensor, zeroTensorLike, flatToNested, tensorAdd, tensorAddScaled, computeChristoffelTensor, contractChristoffelWithOperand, getMetricDerivFlat` | Import |
| `./lowering-utils.js` | `isMetricTensorNode, dimensionOf, requireValue, flattenNestedArray` | Import |

**Exports:**
- Functions: `lowerTensorPartialDerivative`, `lowerCovariantDerivative`

---

### `src/numerical/einstein-equation.ts` - Einstein field equation residual evaluator (v0.6.0 Phase 2, Task 2.4).

**External Dependencies:**
| Package | Import |
|---------|--------|
| `universal-physics-tensor` | `evaluateEinsteinEquationResidual` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../dimensional/validator.js` | `ExprNode` | Import (type-only) |
| `./types.js` | `NumericalInputs, NestedArray` | Import (type-only) |
| `./lowering.js` | `lowerNode` | Import |
| `./float64-engine.js` | `Float64ReferenceEngine` | Import |
| `../dimensional/metric.js` | `metric` | Import |
| `../dimensional/tensor.js` | `tsym` | Import |
| `../dimensional/types.js` | `LENGTH, DIMENSIONLESS` | Import |
| `../core/constants.js` | `C_SI, G_SI` | Import |
| `../tests/fixtures/schwarzschild.js` | `*   schwarzschildGFn, *   schwarzschildGInverseFn, *   schwarzschildRs, *` | Import |

**Exports:**
- Interfaces: `EinsteinEquationResidualInput`
- Functions: `evaluateEinsteinEquationResidual`

---

### `src/numerical/engine-registry.ts` - Engine registry — selects the active TensorEngine. v0.4.0: when both

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./tensor-engine.js` | `TensorEngine` | Import (type-only) |
| `./float64-engine.js` | `Float64ReferenceEngine` | Import |

**Exports:**
- Functions: `getActiveEngine`, `setActiveEngine`, `resetEngineForTesting`

---

### `src/numerical/errors.ts` - Numerical-backend error type. Subclass of UPTError so downstream

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../dimensional/errors.js` | `UPTError` | Import |

**Exports:**
- Classes: `NumericalBackendError`, `EngineCapabilityError`, `GL4ConvergenceError`

---

### `src/numerical/float64-engine.ts` - Float64ReferenceEngine — the pure-TypeScript, Float64Array-backed

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./tensor-engine.js` | `EngineTensor, TensorEngine, EinsumSpec, ForwardGradResult, ReverseGradResult` | Import (type-only) |
| `./types.js` | `NestedArray` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./strides.js` | `rowMajorStrides, flatIndex, sameShape` | Import |

**Exports:**
- Classes: `Float64ReferenceEngine`

---

### `src/numerical/geodesic-integrator.ts` - Fixed-step RK4 integrator for the geodesic equation in an arbitrary

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./errors.js` | `NumericalBackendError` | Import |

**Exports:**
- Interfaces: `GeodesicIntegratorInputs`, `GeodesicIntegratorResult`
- Functions: `integrateGeodesic`

---

### `src/numerical/gl4-integrator.ts` - Gauss-Legendre 4th-order (GL4) symplectic integrator — types + Butcher

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./errors.js` | `GL4ConvergenceError, NumericalBackendError` | Import |

**Exports:**
- Interfaces: `GL4State`, `GL4Snapshot`, `GL4Options`
- Functions: `solveGL4Stage`, `integrateGeodesicGL4`
- Constants: `GL4_C`, `GL4_A`, `GL4_B`

---

### `src/numerical/grid-field.ts` - GridField — a sampled field on a regular grid, for the 'grid' numericalForm

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `NestedArray` | Import (type-only) |

---

### `src/numerical/index.ts` - Public surface of the UPT numerical-contraction backend (v0.3.5).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../dimensional/types.js` | `Dimension` | Import (type-only) |
| `../dimensional/validator.js` | `ExprNode, Violation` | Import (type-only) |
| `../dimensional/validator.js` | `validate` | Import |
| `./tensor-engine.js` | `EngineTensor, TensorEngine` | Import (type-only) |
| `./types.js` | `NumericalInputs, NestedArray` | Import (type-only) |
| `./lowering.js` | `lowerNode` | Import |
| `./engine-registry.js` | `getActiveEngine` | Import |
| `./errors.js` | `NumericalBackendError` | Import |
| `./metric-inverse.js` | `evaluateMetricInverse, scanForMetricPair` | Import |
| `./tensor-engine.js` | `TensorEngine, EngineTensor, EinsumSpec, ForwardGradResult, ReverseGradResult` | Re-export |
| `./tensor-engine.js` | `hasAutogradSupport, EngineCapabilityError` | Re-export |
| `./types.js` | `NumericalInputs, NestedArray` | Re-export |
| `./grid-field.js` | `GridField` | Re-export |
| `./float64-engine.js` | `Float64ReferenceEngine` | Re-export |
| `./engine-registry.js` | `getActiveEngine, setActiveEngine` | Re-export |
| `./errors.js` | `NumericalBackendError` | Re-export |
| `../dimensional/errors.js` | `DuplicateCoordinateWarning` | Re-export |
| `./be37-covariant-eikonal.js` | `evaluateBE37CovariantEikonalNumerical` | Re-export |
| `./be37-covariant-eikonal.js` | `BE37CovariantEikonalInputs, BE37CovariantEikonalResult` | Re-export |
| `./gl4-integrator.js` | `integrateGeodesicGL4` | Re-export |
| `./gl4-integrator.js` | `GL4State, GL4Snapshot, GL4Options` | Re-export |
| `./perihelion-finder.js` | `findPerihelion` | Re-export |
| `./perihelion-finder.js` | `PerihelionResult, FindPerihelionOptions` | Re-export |

**Exports:**
- Interfaces: `NumericalResult`, `NumericalRawResult`, `EvaluateOptions`
- Functions: `evaluateNumerical`, `evaluateNumericalRaw`
- Re-exports: `TensorEngine`, `EngineTensor`, `EinsumSpec`, `ForwardGradResult`, `ReverseGradResult`, `hasAutogradSupport`, `EngineCapabilityError`, `NumericalInputs`, `NestedArray`, `GridField`, `Float64ReferenceEngine`, `getActiveEngine`, `setActiveEngine`, `NumericalBackendError`, `DuplicateCoordinateWarning`, `evaluateBE37CovariantEikonalNumerical`, `BE37CovariantEikonalInputs`, `BE37CovariantEikonalResult`, `integrateGeodesicGL4`, `GL4State`, `GL4Snapshot`, `GL4Options`, `findPerihelion`, `PerihelionResult`, `FindPerihelionOptions`

---

### `src/numerical/killing.ts` - Killing-equation numerical verification (v0.6.0 Phase 1, Task 1.3).

**External Dependencies:**
| Package | Import |
|---------|--------|
| `universal-physics-tensor` | `verifyKillingEquation` |
| `universal-physics-tensor` | `evaluateConservedCharge` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./pderiv.js` | `pderivNumericalFn` | Import |
| `../tests/fixtures/schwarzschild.js` | `*   schwarzschildKillingT, *   schwarzschildGFn, *   schwarzschildChristoffelFn, *   schwarzschildRs, *` | Import |
| `../tests/fixtures/schwarzschild.js` | `schwarzschildKillingT` | Import |

**Exports:**
- Interfaces: `KillingEquationOptions`
- Functions: `verifyKillingEquation`, `evaluateConservedCharge`

---

### `src/numerical/kretschmann.ts` - Kretschmann scalar numerical contraction (v0.6.0 Phase 3, Task 3.6).

**External Dependencies:**
| Package | Import |
|---------|--------|
| `universal-physics-tensor` | `computeKretschmann, G_SI, C_SI` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../tests/fixtures/schwarzschild.js` | `*   schwarzschildGFn, *   schwarzschildGInverseFn, *   schwarzschildRs, *` | Import |
| `../src/numerical/curvature-lowering-helpers.js` | `riemannLowerAt` | Import |
| `../src/numerical/float64-engine.js` | `Float64ReferenceEngine` | Import |

**Exports:**
- Functions: `computeKretschmann`

---

### `src/numerical/lowering-utils.ts` - Shared private utilities for the `numerical/lowering*.ts` modules.

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `NumericalInputs, NestedArray` | Import (type-only) |
| `../dimensional/metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./connection-lowering-helpers.js` | `flattenNA` | Import |

**Exports:**
- Functions: `isMetricTensorNode`, `dimensionOf`, `requireValue`, `flattenNestedArray`

---

### `src/numerical/lowering.ts` - AST → EngineTensor lowering. Walks a validated ExprNode tree and emits

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../dimensional/validator.js` | `ExprNode` | Import (type-only) |
| `../dimensional/validator.js` | `validate` | Import |
| `../dimensional/tensor.js` | `TensorIndex, TensorSymbolNode` | Import (type-only) |
| `../dimensional/types.js` | `Dimension` | Import (type-only) |
| `../dimensional/tensor.js` | `computeContraction, validateTensorSymbol` | Import |
| `./pderiv.js` | `pderivGrid, pderivNumericalFn, pderivSymbolic` | Import |
| `../dimensional/metric-validators.js` | `validateMetricTensor, validateKroneckerDelta, validatePartialDerivative` | Import |
| `../dimensional/metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `../dimensional/connection-validators.js` | `CovariantDerivativeNode, RiemannTensorNode` | Import (type-only) |
| `../dimensional/curvature.js` | `RicciTensorNode, EinsteinTensorNode, BianchiResidualNode` | Import (type-only) |
| `../dimensional/weyl-validators.js` | `WeylTensorNode` | Import (type-only) |
| `../dimensional/curvature-invariants.js` | `KretschmannScalarNode` | Import (type-only) |
| `../dimensional/curvature-composite.js` | `CurvatureKind` | Import (type-only) |
| `./tensor-engine.js` | `EngineTensor, TensorEngine, EinsumSpec, EinsumContraction` | Import (type-only) |
| `./types.js` | `NumericalInputs, NestedArray` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./connection-lowering-helpers.js` | `zeroTensor, zeroTensorLike, flatToNested, flattenNA, tensorAdd, tensorAddScaled, computeChristoffelTensor, contractChristoffelWithOperand, getMetricDerivFlat` | Import |
| `./curvature-lowering-helpers.js` | `christoffelAt, dGammaAt, buildRiemann, contractRiemannJS, // v0.6.1 Phase 2: the bianchi-residual + weyl-tensor arms moved into
  // these two helpers (full FD pipeline + result-wrap).
  lowerBianchiResidual, lowerWeylTensor, MetricFn` | Import |
| `./lowering-utils.js` | `isMetricTensorNode, dimensionOf, requireValue, flattenNestedArray` | Import |
| `./derivative-lowering.js` | `lowerTensorPartialDerivative, lowerCovariantDerivative` | Import |

**Exports:**
- Functions: `lowerNode`

---

### `src/numerical/mathts-autograd.ambient.d.ts` - Ambient module declaration for the optional peer dependency

---

### `src/numerical/mathts-engine.ts` - MathTSEngine — a TensorEngine implementation backed by

**External Dependencies:**
| Package | Import |
|---------|--------|
| `@danielsimonjr/mathts-tensor` | `Tensor` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./tensor-engine.js` | `EngineTensor, TensorEngine, EinsumSpec, ForwardGradResult, ReverseGradResult` | Import (type-only) |
| `./types.js` | `NestedArray` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./tensor-engine.js` | `EngineCapabilityError` | Import |

**Exports:**
- Classes: `MathTSEngine`

---

### `src/numerical/mathts-tensor.ambient.d.ts` - Ambient module declaration for the optional peer dependency

**Exports:**
- Classes: `Tensor`

---

### `src/numerical/metric-inverse.ts` - InverseMetricInconsistencyWarning — numerical path. Builds g⁻¹ and g as

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../dimensional/validator.js` | `ExprNode, Violation` | Import (type-only) |
| `../dimensional/metric-validators.js` | `MetricTensorNode` | Import (type-only) |
| `../dimensional/types.js` | `DIMENSIONLESS` | Import |
| `./tensor-engine.js` | `TensorEngine` | Import (type-only) |
| `./types.js` | `NumericalInputs` | Import (type-only) |
| `./engine-registry.js` | `getActiveEngine` | Import |
| `./errors.js` | `NumericalBackendError` | Import |

**Exports:**
- Functions: `evaluateMetricInverse`, `scanForMetricPair`

---

### `src/numerical/null-ic.ts` - Null initial-condition (null-IC) reconstruction helper (v0.6.0 Phase 1, Task 1.5).

**Exports:**
- Functions: `reconstructNullPr`

---

### `src/numerical/null-ray-integrator.ts` - Fixed-step classical RK4 integrator for affine-parameterized null

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./errors.js` | `NumericalBackendError` | Import |

**Exports:**
- Functions: `integrateRK4`

---

### `src/numerical/painleve-gullstrand-metric.ts` - Painlevé-Gullstrand (PG) metric for Schwarzschild spacetime —

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../core/constants.js` | `C_SI, G_SI` | Import |

**Exports:**
- Functions: `painleveGullstrandGFn`, `painleveGullstrandGInverseFn`

---

### `src/numerical/pderiv.ts` - Numerical partial derivative — two-way dispatch (v0.3.5-Design.md §6).

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./grid-field.js` | `GridField` | Import (type-only) |
| `./types.js` | `NestedArray` | Import (type-only) |
| `./errors.js` | `NumericalBackendError` | Import |
| `./connection-lowering-helpers.js` | `flattenNA` | Import |

**Exports:**
- Functions: `pderivGrid`, `pderivNumericalFn`, `pderivSymbolic`, `metricDerivSupplied`

---

### `src/numerical/perihelion-finder.ts` - Bisection perihelion finder via cubic-Hermite interpolation on cached

**External Dependencies:**
| Package | Import |
|---------|--------|
| `universal-physics-tensor` | `findPerihelion, integrateGeodesicGL4` |

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `../tests/fixtures/schwarzschild.js` | `*   schwarzschildChristoffelFn, *   schwarzschildGInverseFn, *   schwarzschildRs, *` | Import |

**Exports:**
- Interfaces: `PerihelionResult`, `FindPerihelionOptions`
- Functions: `findPerihelion`

---

### `src/numerical/strides.ts` - Shared stride and flat-index utilities for row-major tensor storage.

**Exports:**
- Functions: `rowMajorStrides`, `flatIndex`, `sameShape`

---

### `src/numerical/tensor-engine.ts` - The TensorEngine contract — the compute interface both v0.3.5 engines

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./types.js` | `NestedArray` | Import (type-only) |
| `./errors.js` | `EngineCapabilityError` | Import |

**Exports:**
- Interfaces: `EngineTensor`, `EinsumContraction`, `EinsumSpec`, `ForwardGradResult`, `ReverseGradResult`, `TensorEngine`
- Functions: `hasAutogradSupport`, `isEinsumSpec`

---

### `src/numerical/types.ts` - Shared types for the numerical backend. Kept in a tiny module so the

**Internal Dependencies:**
| File | Imports | Type |
|------|---------|------|
| `./grid-field.js` | `GridField` | Import (type-only) |

---

### `src/numerical/weyl-lowering.ts` - Weyl tensor numerical lowering (v0.6.0 Phase 3, Task 3.2).

**Exports:**
- Functions: `computeWeylTensor`

---

## Dependency Matrix

### File Import/Export Matrix

| File | Imports From | Exports To |
|------|--------------|------------|
| `catalog-adapter` | 7 files | 1 files |
| `be-11-decoherence-master` | 2 files | 1 files |
| `be-12-coherence-length` | 4 files | 0 files |
| `be-13-einstein-trace` | 6 files | 0 files |
| `be-14-ryu-takayanagi` | 4 files | 0 files |
| `be-15-emergence` | 2 files | 0 files |
| `be-16-landauer` | 3 files | 0 files |
| `be-17-einstein-cartan` | 3 files | 0 files |
| `be-18-higgs-mass` | 2 files | 0 files |
| `be-19-quantum-bounce` | 6 files | 0 files |
| `be-20-vacuum-energy` | 6 files | 0 files |
| `be-21-kss-bound` | 4 files | 0 files |
| `be-22-topological-entanglement` | 2 files | 0 files |
| `be-23-syk-planckian` | 5 files | 0 files |
| `be-24-foerster-fret` | 2 files | 0 files |
| `be-25-iit-phi` | 2 files | 0 files |
| `be-25-orch-or` | 4 files | 0 files |
| `be-26-dna-tunneling` | 4 files | 0 files |
| `be-27-effective-temperature` | 4 files | 0 files |
| `be-28-onsager-entropy-production` | 2 files | 0 files |
| `be-29-jarzynski` | 4 files | 0 files |
| `be-30-flm-first-law` | 3 files | 0 files |
| `be-31-causal-set-bd` | 2 files | 0 files |
| `be-32-quantum-reference-frame` | 2 files | 0 files |
| `be-33-hertz-millis` | 2 files | 0 files |
| `be-34-kibble-zurek` | 4 files | 0 files |
| `be-35-conformal-bootstrap` | 2 files | 0 files |
| `be-36-gw-speed-bound` | 3 files | 0 files |
| `be-37-shapiro-delay` | 9 files | 1 files |
| `be-38-mond` | 2 files | 0 files |

---

## Circular Dependency Analysis

**5 circular dependencies detected:**

- **Runtime cycles**: 1 (require attention)
- **Type-only cycles**: 4 (safe, no runtime impact)

### Runtime Circular Dependencies

These cycles involve runtime imports and may cause issues:

- src/core/cell.ts -> src/core/tensor.ts -> src/core/cell.ts

### Type-Only Circular Dependencies

These cycles only involve type imports and are safe (erased at runtime):

- src/core/cell.ts -> src/core/tensor.ts -> src/core/flux-rules.ts -> src/core/cell.ts
- src/dimensional/validator.ts -> src/dimensional/tensor.ts -> src/dimensional/validator.ts
- src/dimensional/validator.ts -> src/dimensional/curvature.ts -> src/dimensional/validator.ts
- src/numerical/types.ts -> src/numerical/grid-field.ts -> src/numerical/types.ts

---

## Visual Dependency Graph

```mermaid
graph TD
    subgraph Bridges
        N0[catalog-adapter]
        N1[be-11-decoherence-master]
        N2[be-12-coherence-length]
        N3[be-13-einstein-trace]
        N4[be-14-ryu-takayanagi]
        N5[...43 more]
    end

    subgraph Core
        N6[axes-registry]
        N7[cell]
        N8[constants]
        N9[flux-rules]
        N10[labeled-tensor]
        N11[...6 more]
    end

    subgraph Diff
        N12[bridge-gradient]
        N13[bridge-specs]
    end

    subgraph Dimensional
        N14[algebra]
        N15[bridge-check]
        N16[connection-validators]
        N17[connection]
        N18[constants]
        N19[...21 more]
    end

    subgraph Entry
        N20[index]
    end

    subgraph Numerical
        N21[be37-covariant-eikonal]
        N22[christoffel-flat]
        N23[connection-lowering-helpers]
        N24[curvature-lowering-helpers]
        N25[derivative-lowering]
        N26[...25 more]
    end

    N0 --> N7
    N0 --> N9
    N0 --> N15
    N0 --> N14
    N2 --> N18
    N3 --> N18
    N4 --> N18
    N9 --> N7
    N13 --> N12
    N13 --> N1
    N15 --> N14
    N16 --> N14
    N20 --> N8
    N20 --> N7
    N20 --> N9
    N20 --> N0
    N20 --> N6
    N20 --> N10
    N20 --> N12
    N20 --> N13
    N20 --> N17
    N20 --> N14
    N20 --> N15
    N21 --> N8
    N22 --> N8
    N24 --> N23
    N25 --> N16
    N25 --> N23
```

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Total TypeScript Files | 118 |
| Total Modules | 6 |
| Total Lines of Code | 27025 |
| Total Exports | 708 |
| Total Re-exports | 248 |
| Total Classes | 29 |
| Total Interfaces | 140 |
| Total Functions | 232 |
| Total Type Guards | 3 |
| Total Enums | 0 |
| Type-only Imports | 184 |
| Runtime Circular Deps | 1 |
| Type-only Circular Deps | 4 |

---

*Last Updated*: 2026-05-24
*Version*: 0.6.0
