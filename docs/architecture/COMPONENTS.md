# Universal Physics Tensor — Component Reference

**Version**: 0.4.0
**Last Updated**: 2026-05-16

---

## Table of Contents

1. [Overview](#overview)
2. [Bridge Module](#bridge-module)
3. [Dimensional Module](#dimensional-module)
4. [Numerical Module](#numerical-module)
5. [Core Module](#core-module)
6. [Entry Point](#entry-point)
7. [Component Dependencies](#component-dependencies)

---

## Overview

UPT follows a layered architecture. The 74 source files fall into five modules whose responsibilities are strictly separated: `bridges` catalogs and evaluates physics equations, `dimensional` provides the symbolic layer, `numerical` provides the compute layer, `core` holds legacy high-level utilities, and `entry` is the public re-export surface.

```
┌────────────────────────────────────────────────────────────────┐
│  entry/            │  Public re-export surface (1 file)        │
├────────────────────────────────────────────────────────────────┤
│  bridges/          │  Catalog index + per-bridge evaluators    │
│                    │  (44 files: 1 index + 43 be-* modules)    │
├────────────────────────────────────────────────────────────────┤
│  dimensional/      │  SI types / algebra / AST / validator /   │
│                    │  metric and connection layer (12 files)    │
├────────────────────────────────────────────────────────────────┤
│  numerical/        │  TensorEngine / engines / lowering /      │
│                    │  geodesic integrator (15 files)           │
├────────────────────────────────────────────────────────────────┤
│  core/             │  UniversalTensor class + constants (2)    │
└────────────────────────────────────────────────────────────────┘
```

**Total**: 74 TypeScript files | 407 exports | 42 bridge catalog entries | 8 bridge evaluator modules (v0.4.0)

(Authoritative numbers from `docs/architecture/dependency-graph.json`, generated 2026-05-17.)

---

## Bridge Module

### `BRIDGE_EQUATIONS` array (`src/bridges/index.ts`)

The 42-entry catalog array of `BridgeEquationEntry` objects. Each entry carries: `id` (11–52), `name`, `category` / `category_name`, `bridges` (the two bridged regimes), `status` (`established` / `speculative` / `highly-speculative` / `invalid`), `context` (1–2 sentence summary), `formula_latex`, `source_part`, `known_issues`, `references`, `dependencies` (ids of other bridge entries explicitly referenced), `dimensional_signature` (null for entries not yet dimensionally encoded), and `tractability_class`. The array is the source of truth for catalog metadata; per-bridge evaluator modules supplement it with runnable code.

### `BridgeEquationEntry` type (`src/bridges/index.ts`)

The shape of a single catalog entry. Carries all spec-level metadata described above. Consumers who only need catalog queries (filter by status, look up known issues) import this type and `BRIDGE_EQUATIONS` — they never need to touch the dimensional or numerical layers.

### `BridgeEquationStatus` / `BridgeIssueSeverity` / `BridgeIssueFixable` (`src/bridges/index.ts`)

Discriminated string union types for the `status`, severity, and fixability fields of catalog entries. `isActiveStatus(s)` is a type predicate that excludes the `'invalid'` arm.

### `BridgeTractabilityClass` (`src/bridges/index.ts`)

Classifies how computationally tractable a bridge equation is: `'closed-form'` (O(1) algebraic evaluation), `'numerical-tractable'` (polynomial-time algorithm), `'numerical-asymptotic'` (diverging asymptotic series), `'formally-divergent'` (not Turing-computable, e.g. cosmological constant), `'undefined'` (not yet classified).

### Per-bridge evaluator modules (`src/bridges/equations/be-*.ts`)

Eight modules exist as of v0.4.0, one per implemented bridge equation. Each exports:
- **LHS / RHS AST constants** — the `ExprNode` trees for the left- and right-hand sides.
- **`validate*Dimensions(): DimensionValidationReport`** — calls `validateEquation(LHS, RHS)` and returns `{ ok, lhsDim, rhsDim }`.
- **`evaluate*(inputs): Promise<Result>`** — wraps `evaluateNumerical()` with a typed inputs interface and a named-field result type.
- **Typed inputs interface** — e.g., `DecoherenceRateInputs`, `GravitationalLensingInputs`.

The modules do not share a base class; the pattern is by convention. See `ARCHITECTURE.md §Bridge Catalog Architecture` for the full per-module pattern.

### `evaluateGravitationalLensing` / `evaluatePerihelionPrecession` (`src/bridges/index.ts` re-export)

The v0.4.0 flagship bridge evaluators, re-exported from the main index. Both take typed input bundles and return typed result objects. Inputs include metric parameters (Schwarzschild radius, orbital semi-latus rectum, etc.); outputs include deflection angle (lensing) or precession per orbit (perihelion).

---

## Dimensional Module

### `Dimension` interface (`src/dimensional/types.ts`)

The seven base SI dimensions as a plain record: `{ L, M, T, I, Theta, N, J }` where each field is a `number` exponent. Rational exponents (e.g., `0.5` for a square-root dimension) are supported.

### Named dimension constants (`src/dimensional/types.ts`)

Exported constants for common SI dimensions: `DIMENSIONLESS`, `LENGTH`, `AREA`, `TIME`, `FREQUENCY`, `MASS`, `VELOCITY`, `ACCELERATION`, `FORCE`, `ENERGY`, `POWER`, `ACTION`, `TEMPERATURE`, `ENTROPY`, `CHARGE`. Only constants with at least one concrete consumer (a bridge encoding or a test) are exported. Constants removed during the simplifier pass (e.g., `VOLUME`, `PRESSURE`) are listed in the file comment for reference.

### `multiply` / `divide` / `power` / `add` / `subtract` / `equals` / `format` (`src/dimensional/algebra.ts`)

Pure functions over `Dimension` values. `add` and `subtract` throw `DimensionMismatchError` if the operand dimensions differ — this is the mechanism that makes the validator catch non-homogeneous equations. `format(dim)` returns a human-readable string like `[energy]` by matching against the `NAMED_DIMENSIONS` lookup table.

### `DimensionMismatchError` (`src/dimensional/algebra.ts`)

Thrown by `add` / `subtract` when operand dimensions disagree. Caught inside the validator and converted to a `Violation` entry rather than propagated as an uncaught exception.

### `ExprNode` union (`src/dimensional/validator.ts`)

The AST union type. Covers scalar nodes (`symbol`, `op`, `integral`, `derivative`) and tensor nodes (`tensor-symbol`, `tensor-product`, `metric-tensor`, `kronecker-delta`, `tensor-partial-derivative`, `covariant-derivative`). The `symbol` leaf carries its dimension inline; all other nodes build structure from sub-expressions.

### `validate(node)` (`src/dimensional/validator.ts`)

Walks an `ExprNode` tree, infers SI dimensions at each node, and returns a `ValidationResult`. Tracks free (uncontracted) tensor indices in a mutable `Map`. Returns `ok: false` if any error-severity violation is found.

### `validateEquation(lhs, rhs)` (`src/dimensional/validator.ts`)

Validates two `ExprNode` trees independently and checks that their inferred dimensions agree. Used by per-bridge `validate*Dimensions()` helpers.

### `validateInverseMetricPair(gLower, gUpper)` (`src/dimensional/validator.ts`)

Opt-in structural check: given a lower/upper metric pair, returns warning-severity violations if the index structure suggests the pair is inconsistent. Not folded into `validate()` to keep the hot path lean.

### `ValidationResult` interface (`src/dimensional/validator.ts`)

Return type of `validate()`. Fields: `ok` (boolean), `inferredDimension` (`Dimension | null`), `freeIndices` (`Map<string, {upper, lower}>`), `violations` (`Violation[]`).

### `Violation` interface (`src/dimensional/validator.ts`)

A single dimensional mismatch or structural error. Fields: `location` (tree path string, e.g. `"args[1].args[0]"`), `expected`, `actual` (both `Dimension`), `note` (human-readable), `severity` (`'error' | 'warning'`, defaults to `'error'`).

### `DimensionValidationReport` interface (`src/dimensional/validator.ts`)

The return type used by all per-bridge `validate*Dimensions()` helpers. Fields: `ok`, `lhsDim`, `rhsDim` (both `Dimension | null`). Defined once in the validator to prevent per-bridge redeclaration.

### `inferDimensionForBridge` (`src/dimensional/bridge-check.ts`)

Entry point for the dimensional self-check path used by bridge modules that do not have full LHS/RHS AST encodings. Infers the dimension of a single expression and returns it alongside any violations.

### `TensorSymbolNode` (`src/dimensional/tensor.ts`)

AST node for a named tensor symbol with explicit index structure. Fields: `kind: 'tensor-symbol'`, `name`, `dim`, `indices` (array of `{label, variance: 'upper'|'lower'}`), `role?` (for metric-layer semantics).

### `TensorProductNode` (`src/dimensional/tensor.ts`)

AST node for an Einstein-summation product. `computeContraction(args, validateChild)` implements the contraction algebra: pairs repeated indices, returns the residual free-index map and the product dimension.

### `MetricTensorNode` (`src/dimensional/metric-validators.ts`)

AST node for a metric tensor g_{ab} or g^{ab}. Fields: `kind: 'metric-tensor'`, `name`, `indices` (two entries specifying upper or lower variance), `dim`, `signature` (spacetime signature, e.g. `[-1,1,1,1]`), `derivativeStrategy?` (`'analytic'` or `'computed'`, where `'computed'` means finite-difference in v0.4.0).

### `KroneckerDeltaNode` (`src/dimensional/metric-validators.ts`)

AST node for the Kronecker delta δ^a_b. Dimensionless by definition; tracks the mixed-variance index pair.

### `TensorPartialDerivativeNode` (`src/dimensional/metric-validators.ts`)

AST node for a partial derivative ∂_a T^b. Dimension is `dim(T) / dim(x^a)`.

### `CovariantDerivativeNode` (`src/dimensional/connection-validators.ts`)

v0.4.0 addition. AST node for the covariant derivative ∇_μ T^ν. Validation delegates to `validateCovariantDerivative`, which checks that the connection index is consistent with the tensor's free-index signature.

### `christoffel(gLower, gInverse, upper, lowerA, lowerB, xCoord)` (`src/dimensional/connection.ts`)

Builds the Christoffel symbol Γ^λ_μν formula as a composite `ExprNode` tree. Uses a deterministic fresh-label scheme for the dummy contraction index ρ. Returns an `ExprNode` (not a number) — the result is inspectable, validatable, and passable to `evaluateNumerical()`.

---

## Numerical Module

### `TensorEngine` interface (`src/numerical/tensor-engine.ts`)

The compute contract. Methods: `fromNested`, `toNested`, `einsum`, `matMul`, `transpose`, `reshape`, `add`, `sub`, `mul`, `scale`, `identity`, `normInf`. Optional: `dispose`, `forwardGrad`, `reverseGrad`. All engines satisfy the parameterized conformance suite.

### `EngineTensor` interface (`src/numerical/tensor-engine.ts`)

Opaque rank-N tensor handle. Only exposes `shape: ReadonlyArray<number>`. The concrete backing (`Float64Array`, a MathTS tensor, etc.) is hidden from consumers.

### `EinsumSpec` (`src/numerical/tensor-engine.ts`)

The engine-agnostic einsum plan produced by `lowering.ts`. Contains `contractions` (paired indices to sum over) and `free` (surviving free axes in output order). Passed to `engine.einsum()`.

### `ForwardGradResult` / `ReverseGradResult` (`src/numerical/tensor-engine.ts`)

Return types for the AD methods. `ForwardGradResult` carries `{ value, jacobian }`; `ReverseGradResult` carries `{ value, gradient }`.

### `hasAutogradSupport(engine)` (`src/numerical/tensor-engine.ts`)

Returns `true` iff the engine implements both `forwardGrad` and `reverseGrad`. Use this before invoking AD methods to get a clear capability signal rather than a runtime `TypeError`.

### `EngineCapabilityError` (`src/numerical/tensor-engine.ts`)

Thrown when an AD method is called on an engine that does not implement it, or when `hasAutogradSupport` returns false but the caller invokes an AD method anyway.

### `Float64ReferenceEngine` (`src/numerical/float64-engine.ts`)

The zero-dependency reference implementation of `TensorEngine`. Backed by `Float64Array`. Naive O(n) algorithms throughout — correctness baseline, not a performance target. AD implemented inline: forward mode via dual numbers (`EngineDualTensor` primal + tangent pair), reverse mode via a tape-record approach. Both modes are synchronous internally but return `Promise` for uniform consumer semantics.

### `evaluateNumerical(node, inputs, options?)` (`src/numerical/index.ts`)

The main public entry point for numerical evaluation. Validates the AST first (throws `NumericalBackendError` on failure), then lowers to engine calls via `lowerNode()`, and returns a `NumericalResult` with `value`, `dim`, `freeIndices`, and `warnings`. The optional `engine` field in `options` overrides the active engine.

### `evaluateNumericalRaw(node, inputs, options?)` (`src/numerical/index.ts`)

Like `evaluateNumerical` but returns a `NumericalRawResult` carrying a live `EngineTensor` instead of a plain JS nested array. The caller must call `.dispose()` when done. Intended for chaining workloads where materializing to JS is expensive.

### `NumericalResult` / `NumericalRawResult` (`src/numerical/index.ts`)

Return types for `evaluateNumerical` and `evaluateNumericalRaw`. Both carry `dim`, `freeIndices`, and `warnings` alongside the output value.

### `EvaluateOptions` (`src/numerical/index.ts`)

Per-call options for the `evaluateNumerical*` entry points. Currently one field: `engine?: TensorEngine` to override the globally active engine.

### `NumericalInputs` (`src/numerical/types.ts`)

The input bundle passed to `evaluateNumerical()`. A `Record<string, NestedArray | EngineTensor>` mapping `ExprNode` symbol names to concrete numeric values, plus an optional `grids` field for `GridField` spatial data.

### `lowerNode(node, inputs, engine)` (`src/numerical/lowering.ts`)

The lowering pass. Translates an `ExprNode` tree into a sequence of `TensorEngine` calls and returns the resulting `EngineTensor`. Internal — not exported from the public surface.

### `getActiveEngine()` / `setActiveEngine(engine)` (`src/numerical/engine-registry.ts`)

Global active-engine management. `getActiveEngine()` returns a `Promise<TensorEngine>` — async to allow lazy initialization. `setActiveEngine()` is synchronous. The default engine is `Float64ReferenceEngine`.

### `NumericalBackendError` (`src/numerical/errors.ts`)

Thrown by `evaluateNumerical()` when the AST fails validation or when the lowering pass encounters an inconsistency. Extends the base error class.

### `DuplicateCoordinateWarning` (`src/dimensional/errors.ts`, re-exported via `src/numerical/index.ts`)

A warning-severity signal (not a thrown error) emitted when the same coordinate label appears in conflicting positions in an `ExprNode`. Re-exported from `numerical/index.ts` to keep that as the single public API surface without creating a dimensional→numerical import cycle.

### `evaluateMetricInverse(gUpper, gLower, inputs, options)` (`src/numerical/metric-inverse.ts`)

Numerically checks whether a supplied upper/lower metric pair is consistent (i.e., g^{ab} g_{bc} ≈ δ^a_c). Returns a warning violation if the product deviates beyond tolerance. Called automatically by `evaluateNumerical()` when the AST contains an identifiable metric pair.

### `evaluateBE37CovariantEikonalNumerical(inputs)` (`src/numerical/be37-covariant-eikonal.ts`)

Numerical implementation of the covariant eikonal phase for bridge equation BE-37 (Shapiro delay). Returns the integrated eikonal phase value. Part of the v0.4.0 public surface.

### `integrateGeodesic(inputs)` (`src/numerical/geodesic-integrator.ts`)

RK4 integrator for the geodesic equation. Accepts a `GeodesicIntegratorInputs` bundle with a Christoffel-symbol closure, initial position, initial velocity, proper-time step, and number of steps. Returns a `GeodesicIntegratorResult` with the trajectory as an array of (position, velocity) pairs. No `TensorEngine` dependency — operates on plain JS arrays.

---

## Core Module

### `UniversalTensor` (`src/core/tensor.ts`)

The original high-level tensor facade, predating the dimensional and numerical layers. Provides a typed wrapper around tensor data with metadata (physical scale, associated physical law). Present for backward compatibility and as the class-export on the public surface.

### `PhysicalConstants` (`src/core/types.ts`)

A lookup object of SI physical constants: G (gravitational), c (speed of light), ℏ (reduced Planck), k_B (Boltzmann), and others. Used by bridge evaluator modules that need numerical constant values.

---

## Entry Point

### `src/index.ts`

The single public re-export surface. Every symbol in `ARCHITECTURE.md §Key Types and Entry Points` flows through here. The file is the source of truth for what is and is not part of the public API; the snapshot test `tests/api/public-surface.test.ts` enforces its stability.

`MathTSEngine` is intentionally absent from this file. It is available only via the `universal-physics-tensor/numerical/mathts-engine` exports subpath defined in `package.json`.

---

## Component Dependencies

```
src/index.ts
  ├── src/core/tensor.ts          (UniversalTensor, PhysicalConstants)
  ├── src/bridges/index.ts        (BRIDGE_EQUATIONS, evaluateGravitationalLensing,
  │                                evaluatePerihelionPrecession, catalog types)
  │     └── src/bridges/equations/be-*.ts
  │           ├── src/dimensional/validator.ts  (ExprNode, validate, validateEquation)
  │           ├── src/dimensional/types.ts      (Dimension constants)
  │           └── src/numerical/index.ts        (evaluateNumerical)
  ├── src/dimensional/validator.ts  (ExprNode, validate, validateEquation,
  │                                  validateInverseMetricPair, ValidationResult)
  ├── src/dimensional/types.ts      (Dimension, named constants)
  ├── src/dimensional/algebra.ts    (multiply, divide, power, add, subtract,
  │                                  equals, format, DimensionMismatchError)
  ├── src/dimensional/bridge-check.ts  (inferDimensionForBridge)
  ├── src/dimensional/connection.ts    (christoffel)
  ├── src/numerical/index.ts        (evaluateNumerical, evaluateNumericalRaw,
  │   ├── src/numerical/tensor-engine.ts  (evaluateMetricInverse, NumericalResult,
  │   ├── src/numerical/float64-engine.ts  Float64ReferenceEngine, TensorEngine,
  │   ├── src/numerical/engine-registry.ts  getActiveEngine, setActiveEngine,
  │   ├── src/numerical/lowering.ts         NumericalBackendError, hasAutogradSupport)
  │   ├── src/numerical/metric-inverse.ts
  │   └── src/numerical/be37-covariant-eikonal.ts
  └── src/numerical/geodesic-integrator.ts  (integrateGeodesic)
```

The `dimensional` module does not import from `numerical`. The `numerical` module imports from `dimensional` (for `ExprNode`, `Dimension`, `validate`). The `bridges` module imports from both. The `core` module is standalone. This acyclic import order is intentional and enforced by the absence of any runtime circular dependency in `dependency-graph.json`.

---

**Document Version**: 0.4.0
**Last Updated**: 2026-05-16
**Maintained by**: Daniel Simon Jr.
