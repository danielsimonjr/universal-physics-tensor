# Unused Files and Exports Analysis

**Generated**: 2026-05-19

## Summary

- **Potentially unused files**: 42
- **Potentially unused exports**: 64

## Potentially Unused Files

These files are not imported by any other file in the codebase:

- `src/bridges/equations/be-11-decoherence-master.ts`
- `src/bridges/equations/be-12-coherence-length.ts`
- `src/bridges/equations/be-13-einstein-trace.ts`
- `src/bridges/equations/be-14-ryu-takayanagi.ts`
- `src/bridges/equations/be-15-emergence.ts`
- `src/bridges/equations/be-16-landauer.ts`
- `src/bridges/equations/be-17-einstein-cartan.ts`
- `src/bridges/equations/be-18-higgs-mass.ts`
- `src/bridges/equations/be-19-quantum-bounce.ts`
- `src/bridges/equations/be-20-vacuum-energy.ts`
- `src/bridges/equations/be-21-kss-bound.ts`
- `src/bridges/equations/be-22-topological-entanglement.ts`
- `src/bridges/equations/be-23-syk-planckian.ts`
- `src/bridges/equations/be-24-foerster-fret.ts`
- `src/bridges/equations/be-25-iit-phi.ts`
- `src/bridges/equations/be-25-orch-or.ts`
- `src/bridges/equations/be-26-dna-tunneling.ts`
- `src/bridges/equations/be-27-effective-temperature.ts`
- `src/bridges/equations/be-28-onsager-entropy-production.ts`
- `src/bridges/equations/be-29-jarzynski.ts`
- `src/bridges/equations/be-30-flm-first-law.ts`
- `src/bridges/equations/be-31-causal-set-bd.ts`
- `src/bridges/equations/be-32-quantum-reference-frame.ts`
- `src/bridges/equations/be-33-hertz-millis.ts`
- `src/bridges/equations/be-34-kibble-zurek.ts`
- `src/bridges/equations/be-35-conformal-bootstrap.ts`
- `src/bridges/equations/be-36-gw-speed-bound.ts`
- `src/bridges/equations/be-37-shapiro-delay.ts`
- `src/bridges/equations/be-38-mond.ts`
- `src/bridges/equations/be-39-asymptotic-safety.ts`
- `src/bridges/equations/be-40-composite-higgs.ts`
- `src/bridges/equations/be-41-swampland.ts`
- `src/bridges/equations/be-42-hawking-temperature.ts`
- `src/bridges/equations/be-43-er-epr.ts`
- `src/bridges/equations/be-44-soft-hair.ts`
- `src/bridges/equations/be-45-tcc.ts`
- `src/bridges/equations/be-46-multiverse-measure.ts`
- `src/bridges/equations/be-47-bbn-dark-sector.ts`
- `src/bridges/equations/be-48-grw-localization.ts`
- `src/bridges/equations/be-49-quantum-darwinism.ts`
- `src/bridges/equations/be-50-wheeler-feynman.ts`
- `src/numerical/mathts-engine.ts`

## Potentially Unused Exports

These exports are not imported by any other file in the codebase:

### `src/bridges/gravitational-lensing.ts`

- `GravitationalLensingInputs` (interface)
- `GravitationalLensingResult` (interface)

### `src/bridges/index.ts`

- `isActiveStatus` (function)
- `KnownIssue` (interface)
- `BridgeEquationEntry` (interface)
- `BridgeEquationStatus` (type)
- `BridgeIssueSeverity` (type)
- `BridgeIssueFixable` (type)
- `BridgeTractabilityClass` (type)

### `src/bridges/perihelion-precession.ts`

- `PerihelionPrecessionInputs` (interface)
- `PerihelionPrecessionResult` (interface)

### `src/core/types.ts`

- `Symmetry` (type)
- `InformationMeasure` (type)

### `src/dimensional/bridge-check.ts`

- `EXPECTED_DIMENSION_BY_BRIDGE` (constant)

### `src/dimensional/connection-validators.ts`

- `UpperIndex` (interface)
- `CovariantDerivativeValidationResult` (interface)
- `RiemannTensorValidationResult` (interface)

### `src/dimensional/curvature.ts`

- `RicciTensorValidationResult` (interface)
- `EinsteinTensorValidationResult` (interface)
- `BianchiResidualValidationResult` (interface)

### `src/dimensional/metric-validators.ts`

- `MetricTensorValidationResult` (interface)
- `KroneckerDeltaValidationResult` (interface)
- `PartialDerivativeValidationResult` (interface)

### `src/dimensional/metric.ts`

- `kronecker` (function)
- `raise` (function)
- `lower` (function)

### `src/dimensional/tensor.ts`

- `scale` (function)
- `tsum` (function)
- `TensorSymbolValidationResult` (interface)
- `ContractionResult` (interface)
- `TensorExprNode` (type)

### `src/dimensional/validator.ts`

- `ValidationResult` (interface)

### `src/numerical/be37-covariant-eikonal.ts`

- `BE37CovariantEikonalInputs` (interface)
- `BE37CovariantEikonalResult` (interface)

### `src/numerical/curvature-lowering-helpers.ts`

- `outerStep` (function)
- `riemannUpperAt` (function)
- `lowerFirstIndex` (function)
- `riemannLowerAt` (function)
- `dRiemannLowerAt` (function)
- `covariantDerivRiemannLowerAt` (function)
- `FlatMatrix` (type)
- `DGammaTensor` (type)
- `GammaTensor` (type)

### `src/numerical/engine-registry.ts`

- `resetEngineForTesting` (function)

### `src/numerical/geodesic-integrator.ts`

- `GeodesicIntegratorInputs` (interface)
- `GeodesicIntegratorResult` (interface)

### `src/numerical/gl4-integrator.ts`

- `solveGL4Stage` (function)
- `GL4State` (interface)
- `GL4Snapshot` (interface)
- `GL4Options` (interface)
- `StageSolveResult` (interface)
- `GL4_C` (constant)
- `GL4_A` (constant)
- `GL4_B` (constant)

### `src/numerical/index.ts`

- `NumericalResult` (interface)
- `NumericalRawResult` (interface)
- `EvaluateOptions` (interface)

### `src/numerical/lowering.ts`

- `buildEinsumSpec` (function)

### `src/numerical/null-ray-integrator.ts`

- `ODESystem` (type)

### `src/numerical/pderiv.ts`

- `metricDerivSupplied` (function)

### `src/numerical/perihelion-finder.ts`

- `PerihelionResult` (interface)
- `FindPerihelionOptions` (interface)

### `src/numerical/tensor-engine.ts`

- `isEinsumSpec` (function)
- `EinsumFreeAxis` (interface)

