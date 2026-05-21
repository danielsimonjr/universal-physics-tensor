# Universal Physics Tensor — Public API Reference

**Version**: 0.6.0
**Last Updated**: 2026-05-20

> The public surface is snapshot-tested in `tests/api/public-surface.test.ts`. Any symbol not in that test's `EXPECTED_RUNTIME_EXPORTS` or `ALL_TYPE_EXPORTS` lists is `@internal` and may change without notice.

---

## Table of Contents

1. [Stability Tiers](#stability-tiers)
2. [Bridge Catalog](#bridge-catalog)
3. [Constants (v0.5.1)](#constants-v051)
4. [Dimensional Types and Algebra](#dimensional-types-and-algebra)
5. [AST and Validator](#ast-and-validator)
6. [Numerical Backend](#numerical-backend)
7. [Connection Layer (v0.4.0)](#connection-layer-v040)
8. [Curvature Layer (v0.5.0)](#curvature-layer-v050)
9. [Killing / Einstein-Equation / Curvature-Invariant Layer (v0.6.0)](#killing--einstein-equation--curvature-invariant-layer-v060)
10. [Core](#core)
11. [Type-Only Exports](#type-only-exports)

---

## Stability Tiers

| Tier | Meaning | Version guarantee |
|------|---------|-------------------|
| `@public` | Stable surface — symbols whose behavioral contract has settled across at least one minor release | Breaking changes require a major-version bump |
| `@public-new` | Added in the most recent minor release(s) — behavioral contract is settled but the wider design is still evolving | May be adjusted in a subsequent minor release with a CHANGELOG note |
| `@internal` | Implementation detail — not re-exported from `src/index.ts` | May change at any time |

`@public-new` is a rolling tier: it tracks the current minor-release frontier rather than a fixed version. The v0.4.0 connection layer, the v0.5.0 curvature layer, the v0.5.1 constants, and the v0.6.0 Killing/Einstein-equation/curvature-invariant exports were each `@public-new` when they shipped and graduate to `@public` once a following minor release leaves their contracts unchanged.

All symbols in this document are `@public` unless annotated otherwise.

---

## Bridge Catalog

### `BRIDGE_EQUATIONS` — constant array

The 42-entry bridge-equation catalog.

**Kind**: constant (`BridgeEquationEntry[]`)
**Stability**: `@public`

```typescript
import { BRIDGE_EQUATIONS } from 'universal-physics-tensor';

// All established bridges
const established = BRIDGE_EQUATIONS.filter(e => e.status === 'established');

// Bridges bridging quantum and classical regimes
const qc = BRIDGE_EQUATIONS.filter(e =>
  e.bridges.includes('quantum') && e.bridges.includes('classical')
);
```

### `isActiveStatus(s)` — function

Type predicate that returns `true` for any status that is not `'invalid'`. Use to exclude deprecated catalog entries from active-research filters.

**Kind**: function
**Stability**: `@internal` to the main package entry — **not** re-exported from `src/index.ts`. `isActiveStatus` is defined in `src/bridges/index.ts`; it is reachable only via the bridges subpath, not via a top-level `import { isActiveStatus } from 'universal-physics-tensor'`. To filter out invalid entries from the main-package surface, compare `status` directly.

```typescript
import { BRIDGE_EQUATIONS } from 'universal-physics-tensor';

// isActiveStatus is not on the main public surface — compare status directly:
const active = BRIDGE_EQUATIONS.filter(e => e.status !== 'invalid');
```

### `evaluateGravitationalLensing(inputs)` — function `@public-new`

Evaluates the gravitational lensing deflection angle (bridge equation BE-51, Schwarzschild weak-field approximation).

**Kind**: async function
**Stability**: `@public-new`

```typescript
import { evaluateGravitationalLensing } from 'universal-physics-tensor';

const result = await evaluateGravitationalLensing({
  M: 1.989e30,  // kg — solar mass
  b: 6.96e8,    // m — impact parameter (solar radius for grazing ray)
  // additional metric parameters per GravitationalLensingInputs
});
// result.deflectionAngle: deflection in radians
```

### `evaluatePerihelionPrecession(inputs)` — function `@public-new`

Evaluates the general-relativistic perihelion precession per orbit (bridge equation BE-52).

**Kind**: async function
**Stability**: `@public-new`

```typescript
import { evaluatePerihelionPrecession } from 'universal-physics-tensor';

const result = await evaluatePerihelionPrecession({
  M: 1.989e30,     // kg — central mass
  a: 5.79e10,      // m — orbital semi-major axis
  e: 0.205,        // eccentricity
});
// result.precessionPerOrbit: radians per orbit
```

---

## Constants (v0.5.1)

Canonical flat CODATA 2018 / SI-defined physical constants — the single source of truth across the numerical, dimensional, and bridge layers (PC-1). Defined in `src/core/constants.ts`; each is a bare `number` in SI units.

**Kind**: constants (`number`)
**Stability**: `@public-new` (added v0.5.1)

```typescript
import { C_SI, G_SI, HBAR_SI, K_B_SI } from 'universal-physics-tensor';

const rs = 2 * G_SI * solarMass / (C_SI ** 2);  // Schwarzschild radius
```

Full list: `C_SI` (speed of light), `G_SI` (Newtonian gravitation), `H_SI` (Planck), `HBAR_SI` (reduced Planck), `K_B_SI` (Boltzmann), `E_SI` (elementary charge), `ALPHA` (fine-structure constant, dimensionless), `M_P_SI` (Planck mass), `L_P_SI` (Planck length), `T_P_SI` (Planck time), `H0_SI` (Hubble constant).

These are distinct from the legacy `PhysicalConstants` lookup object (see [Core](#core)); the `*_SI` constants are the preferred current surface.

---

## Dimensional Types and Algebra

### `Dimension` — type

The seven base SI dimensions as a record of exponents.

**Kind**: interface
**Stability**: `@public`

```typescript
import type { Dimension } from 'universal-physics-tensor';

const energy: Dimension = { L: 2, M: 1, T: -2, I: 0, Theta: 0, N: 0, J: 0 };
```

### Named dimension constants

Pre-built `Dimension` constants for common SI units.

**Kind**: constants
**Stability**: `@public`

```typescript
import { ENERGY, LENGTH, TIME, MASS, VELOCITY } from 'universal-physics-tensor';

// ENERGY ≡ { L:2, M:1, T:-2, ... }
// LENGTH ≡ { L:1, M:0, T:0, ... }
```

Full list: `DIMENSIONLESS`, `LENGTH`, `AREA`, `TIME`, `FREQUENCY`, `MASS`, `VELOCITY`, `ACCELERATION`, `FORCE`, `ENERGY`, `POWER`, `ACTION`, `TEMPERATURE`, `ENTROPY`, `CHARGE`.

### `multiply(a, b)` / `divide(a, b)` / `power(a, n)` — functions

Combine two `Dimension` values according to SI dimension algebra.

**Kind**: pure functions
**Stability**: `@public`

```typescript
import { multiply, divide, power, MASS, VELOCITY } from 'universal-physics-tensor';

const momentum = multiply(MASS, VELOCITY);        // kg·m/s
const kineticE  = multiply(MASS, power(VELOCITY, 2)); // J (up to factor 1/2)
```

### `add(a, b)` / `subtract(a, b)` — functions

Return the common `Dimension` if both operands agree; throw `DimensionMismatchError` otherwise.

**Kind**: pure functions
**Stability**: `@public`

```typescript
import { add, ENERGY } from 'universal-physics-tensor';

add(ENERGY, ENERGY); // returns ENERGY
add(ENERGY, LENGTH); // throws DimensionMismatchError
```

### `equals(a, b)` / `format(d)` — functions

`equals` compares two `Dimension` values. `format` returns a human-readable string (e.g., `"[energy]"`, `"L^2·M·T^-2"`).

**Kind**: pure functions
**Stability**: `@public`

```typescript
import { equals, format, ENERGY } from 'universal-physics-tensor';

equals(ENERGY, ENERGY); // true
format(ENERGY);          // '[energy]'
```

### `DimensionMismatchError` — error class

Thrown by `add` / `subtract` when operand dimensions disagree.

**Kind**: error class
**Stability**: `@public`

---

## AST and Validator

### `validate(node)` — function

Walks an `ExprNode` tree, infers SI dimensions, and returns a `ValidationResult`.

**Kind**: function
**Stability**: `@public`

```typescript
import { validate } from 'universal-physics-tensor';
import type { ExprNode } from 'universal-physics-tensor';
import { ENERGY } from 'universal-physics-tensor';

const node: ExprNode = { kind: 'symbol', name: 'E', dim: ENERGY };
const result = validate(node);
// result.ok === true
// result.inferredDimension === ENERGY
// result.violations === []
```

### `validateEquation(lhs, rhs)` — function

Validates two `ExprNode` trees independently and checks dimensional homogeneity.

**Kind**: function
**Stability**: `@public`

```typescript
import { validateEquation } from 'universal-physics-tensor';

const result = validateEquation(lhsNode, rhsNode);
// result.ok === false if lhs dim ≠ rhs dim
```

### `validateInverseMetricPair(gLower, gUpper)` — function

Opt-in structural check for a lower/upper metric pair. Returns warning-severity violations if the index structure suggests inconsistency.

**Kind**: function
**Stability**: `@public`

```typescript
import { validateInverseMetricPair } from 'universal-physics-tensor';

const warnings = validateInverseMetricPair(gLowerNode, gUpperNode);
// [] if structurally consistent, [Violation] if inconsistent
```

### `inferDimensionForBridge(node)` — function

Infers the dimension of a single expression. Used by bridge modules that do not have full LHS/RHS AST encodings.

**Kind**: function
**Stability**: `@public`

---

## Numerical Backend

### `evaluateNumerical(node, inputs, options?)` — function

Validates an `ExprNode` AST and evaluates it numerically. Throws `NumericalBackendError` if the AST is invalid.

**Kind**: async function
**Stability**: `@public`

```typescript
import { evaluateNumerical, Float64ReferenceEngine } from 'universal-physics-tensor';
import type { NumericalInputs } from 'universal-physics-tensor';

const inputs: NumericalInputs = {
  E: [[1.0, 0.0], [0.0, 1.0]],  // 2×2 identity
  m: [[9.109e-31]],              // electron mass
};
const result = await evaluateNumerical(myNode, inputs);
// result.value — NestedArray (plain JS)
// result.dim   — inferred Dimension
// result.warnings — Violation[] (non-fatal)
```

### `evaluateNumericalRaw(node, inputs, options?)` — function

Like `evaluateNumerical` but returns a live `EngineTensor` for chaining. Call `.dispose()` when done.

**Kind**: async function
**Stability**: `@public`

### `evaluateMetricInverse(gUpper, gLower, inputs, options?)` — function

Numerically checks g^{ab} g_{bc} ≈ δ^a_c. Returns `{ warning?: Violation }`.

**Kind**: async function
**Stability**: `@public`

### `Float64ReferenceEngine` — class

The zero-dependency `TensorEngine` implementation. Default engine when no active engine has been set.

**Kind**: class (implements `TensorEngine`)
**Stability**: `@public`

```typescript
import { Float64ReferenceEngine, setActiveEngine } from 'universal-physics-tensor';

setActiveEngine(new Float64ReferenceEngine());
```

### `getActiveEngine()` / `setActiveEngine(engine)` — functions

Global active-engine management for the `evaluateNumerical()` default-engine path.

**Kind**: functions
**Stability**: `@public`

### `hasAutogradSupport(engine)` — function `@public-new`

Returns `true` iff the engine implements both `forwardGrad` and `reverseGrad`. Always check before invoking AD methods.

**Kind**: function
**Stability**: `@public-new`

```typescript
import { hasAutogradSupport, EngineCapabilityError } from 'universal-physics-tensor';

if (!hasAutogradSupport(engine)) {
  throw new EngineCapabilityError(engine.name, 'forwardGrad');
}
const { value, jacobian } = await engine.forwardGrad!(fn, x);
```

### `NumericalBackendError` — error class

Thrown by `evaluateNumerical()` when the AST fails validation or the lowering pass encounters an inconsistency.

**Kind**: error class
**Stability**: `@public`

### `EngineCapabilityError` — error class `@public-new`

Thrown when an AD method is invoked on an engine that does not implement it.

**Kind**: error class
**Stability**: `@public-new`

### `DuplicateCoordinateWarning` — warning class `@public-new`

A non-fatal warning (not thrown) emitted when duplicate coordinate labels are detected. Appears in `NumericalResult.warnings`.

**Kind**: warning class
**Stability**: `@public-new`

### `evaluateBE37CovariantEikonalNumerical(inputs)` — function `@public-new`

Numerical evaluation of the covariant eikonal phase for bridge equation BE-37 (Shapiro delay).

**Kind**: async function
**Stability**: `@public-new`

---

## Connection Layer (v0.4.0)

### `christoffel(gLower, gInverse, upper, lowerA, lowerB, xCoord)` — function `@public-new`

Builds the Christoffel symbol Γ^λ_μν as a composite `ExprNode` tree. Returns an AST node, not a number — it can be validated and passed to `evaluateNumerical()`.

**Kind**: function
**Stability**: `@public-new`

```typescript
import { christoffel } from 'universal-physics-tensor';

// Build Γ^t_rr for Schwarzschild metric
const gamma = christoffel(
  gLowerNode,    // MetricTensorNode (covariant)
  gUpperNode,    // MetricTensorNode (contravariant)
  't',           // free upper index λ
  'r',           // first free lower index μ
  'r',           // second free lower index ν
  xCoordNode,    // TensorSymbolNode for coordinate
);
// gamma is an ExprNode — pass to evaluateNumerical()
```

### `integrateGeodesic(inputs)` — function `@public-new`

RK4 integrator for the geodesic equation in an arbitrary Lorentzian manifold. No `TensorEngine` dependency.

**Kind**: function (synchronous)
**Stability**: `@public-new`

```typescript
import { integrateGeodesic } from 'universal-physics-tensor';

const result = integrateGeodesic({
  christoffelFn: (x) => schwarzschildChristoffel(x, rs),
  x0: [0, 100 * rs, Math.PI / 2, 0],  // start at r = 100·r_s
  v0: [1 / Math.sqrt(1 - rs / (100 * rs)), 0, 0, 0],
  dτ: 1.0,
  nSteps: 1000,
});
// result.trajectory: Array<{ x: [t,r,θ,φ], v: [dt/dτ, …] }>
```

---

## Curvature Layer (v0.5.0)

The v0.5.0 GR-foundations release added the curvature layer: composite `ExprNode` helpers for the Ricci/Einstein/Bianchi objects, the GL4 symplectic integrator, and the perihelion finder.

### `ricci(R)` — function `@public-new`

Wraps a `RiemannTensorNode` and produces the contracted Ricci tensor R_μν = R^λ_{λμν} as a composite `ExprNode` (own validator + lowering arms — no AST rewrite).

**Kind**: function
**Stability**: `@public-new`

### `einstein(R, g, gInverse)` — function `@public-new`

Wraps a `RiemannTensorNode` plus a metric pair and produces the composite Einstein tensor G_μν = R_μν − ½ R g_μν as an `ExprNode`. Vacuum-Einstein scope.

**Kind**: function
**Stability**: `@public-new`

### `bianchiResidual(R)` — function `@public-new`

Returns `{ residual, evaluate, evaluateMax }` for the cyclic second-Bianchi-identity check ∇_{[λ} R_{μν]ρσ} = 0.

**Kind**: function
**Stability**: `@public-new`

### `integrateGeodesicGL4(...)` — function `@public-new`

The GL4 (Gauss–Legendre 4th-order) symplectic integrator for the geodesic equation — an energy-conserving alternative to the RK4 `integrateGeodesic` for long-time integration. Returns a `GL4State` trajectory; per-step snapshots are `GL4Snapshot`, options are `GL4Options`. Exported via `numerical/index`.

**Kind**: function
**Stability**: `@public-new`

### `findPerihelion(...)` — function `@public-new`

Bisection-based perihelion finder over a geodesic trajectory; returns a `PerihelionResult`. Options are `FindPerihelionOptions`. Exported via `numerical/index`.

**Kind**: function
**Stability**: `@public-new`

---

## Killing / Einstein-Equation / Curvature-Invariant Layer (v0.6.0)

The v0.6.0 release added Killing-vector machinery, the Einstein field-equation node + numerical residual, and the Kretschmann curvature invariant.

### `verifyKillingEquation(...)` — function `@public-new`

Numerically checks the Killing equation ∇_μ ξ_ν + ∇_ν ξ_μ = 0 at a point, using a hybrid implementation (exact Christoffels + analytic metric derivatives). Options are `KillingEquationOptions`; the layout-agnostic Christoffel accessor type is `ChristoffelAccess`. Exported via `numerical/killing`.

**Kind**: function
**Stability**: `@public-new`

### `evaluateConservedCharge(...)` — function `@public-new`

Evaluates the conserved charge Q = ξ^μ p_μ along a geodesic. Exported via `numerical/killing`.

**Kind**: function
**Stability**: `@public-new`

### `validateEinsteinFieldEquation(node)` — function `@public-new`

Structural validator for an `EinsteinFieldEquationNode` (the AST predicate for G_μν + Λ g_μν = (8πG/c⁴) T_μν). Checks free-index agreement, per-component dim equality [L⁻²], and symmetry agreement. Returns an `EinsteinFieldEquationValidationResult`. Exported via `dimensional/einstein-equation`.

**Kind**: function
**Stability**: `@public-new`

### `evaluateEinsteinEquationResidual(input)` — function `@public-new`

Computes the scale-normalized max residual |G_μν + Λ g_μν − κ T_μν| / |g_μν| at a coordinate point. Accepts metric closures (`MetricClosure`) + a stress-energy closure (`EinsteinEquationResidualInput`, `Vec4`); returns a dimensionless relative residual. For Schwarzschild vacuum the residual is the finite-difference truncation floor (~1e-10 relative). Exported via `numerical/einstein-equation`.

**Kind**: function
**Stability**: `@public-new`

### `validateKretschmannScalar(node)` — function `@public-new`

Structural validator for a `KretschmannScalarNode` (K = R_{ρσμν} R^{ρσμν}; scalar, dim [L⁻⁴]). Returns a `KretschmannScalarValidationResult`. Exported via `dimensional/curvature-invariants`.

**Kind**: function
**Stability**: `@public-new`

### `computeKretschmann(...)` — function `@public-new`

Numerical contraction of the Kretschmann scalar — O(4⁸) = 65536 multiplications per call, diagnostic/sample-point use only. Exported via `numerical/kretschmann`.

**Kind**: function
**Stability**: `@public-new`

> The `WeylTensorNode` AST kind and the `CurvatureCompositeNode<K,S>` factory also ship in v0.6.0, but are `@internal` to the main package entry — the Weyl validator is not re-exported from `src/index.ts`. See `COMPONENTS.md §Curvature composite factory`.

---

## Core

### `UniversalTensor` — class

The original high-level tensor facade. Provides a typed wrapper around tensor data with metadata.

**Kind**: class
**Stability**: `@public`

### `PhysicalConstants` — constant object

SI values of fundamental physical constants: G, c, ℏ, k_B, and others.

**Kind**: constant
**Stability**: `@public`

```typescript
import { PhysicalConstants } from 'universal-physics-tensor';

const rs = 2 * PhysicalConstants.G * solarMass / (PhysicalConstants.c ** 2);
```

---

## Type-Only Exports

The following are type-only symbols erased at runtime. They appear in `src/index.ts` as `export type { ... }` and in `dist/index.d.ts` but are not present in `Object.keys(root)`.

| Symbol | Module | Added | Description |
|--------|--------|-------|-------------|
| `Dimension` | `dimensional/types` | v0.3.0 | Seven-component SI dimension record |
| `ExprNode` | `dimensional/validator` | v0.3.0 | The AST union type |
| `ValidationResult` | `dimensional/validator` | v0.3.0 | Return type of `validate()` |
| `Violation` | `dimensional/validator` | v0.3.0 | Single dimensional mismatch entry |
| `TensorEngine` | `numerical/tensor-engine` | v0.3.5 | The compute contract interface |
| `EngineTensor` | `numerical/tensor-engine` | v0.3.5 | Opaque rank-N tensor handle |
| `EinsumSpec` | `numerical/tensor-engine` | v0.3.5 | Engine-agnostic contraction plan |
| `NumericalResult` | `numerical/index` | v0.3.5 | Return type of `evaluateNumerical()` |
| `NumericalRawResult` | `numerical/index` | v0.3.5 | Return type of `evaluateNumericalRaw()` |
| `EvaluateOptions` | `numerical/index` | v0.3.5 | Per-call options for the evaluator |
| `NumericalInputs` | `numerical/types` | v0.3.5 | Input bundle mapping names to tensors |
| `NestedArray` | `numerical/types` | v0.3.5 | Recursive `number | NestedArray[]` type |
| `GridField` | `numerical/grid-field` | v0.3.5 | Spatial grid data for `NumericalInputs.grids` |
| `BridgeEquationEntry` | `bridges/index` | v0.3.0 | Single catalog entry shape |
| `BridgeEquationStatus` | `bridges/index` | v0.3.0 | Status discriminated union |
| `BridgeIssueSeverity` | `bridges/index` | v0.3.0 | Known-issue severity |
| `BridgeIssueFixable` | `bridges/index` | v0.3.0 | Known-issue fixability |
| `KnownIssue` | `bridges/index` | v0.3.0 | Single known-issue entry |
| `GravitationalLensingInputs` | `bridges/index` | v0.4.0 `@public-new` | Input type for `evaluateGravitationalLensing` |
| `GravitationalLensingResult` | `bridges/index` | v0.4.0 `@public-new` | Result type for `evaluateGravitationalLensing` |
| `PerihelionPrecessionInputs` | `bridges/index` | v0.4.0 `@public-new` | Input type for `evaluatePerihelionPrecession` |
| `PerihelionPrecessionResult` | `bridges/index` | v0.4.0 `@public-new` | Result type for `evaluatePerihelionPrecession` |
| `GeodesicIntegratorInputs` | `numerical/geodesic-integrator` | v0.4.0 `@public-new` | Input bundle for `integrateGeodesic` |
| `GeodesicIntegratorResult` | `numerical/geodesic-integrator` | v0.4.0 `@public-new` | Return type of `integrateGeodesic` |
| `CovariantDerivativeNode` | `dimensional/validator` | v0.4.0 `@public-new` | AST node for ∇_μ |
| `ForwardGradResult` | `numerical/tensor-engine` | v0.4.0 `@public-new` | Return type of `engine.forwardGrad()` |
| `ReverseGradResult` | `numerical/tensor-engine` | v0.4.0 `@public-new` | Return type of `engine.reverseGrad()` |
| `GL4State` | `numerical/index` | v0.5.0 `@public-new` | GL4 integrator trajectory state |
| `GL4Snapshot` | `numerical/index` | v0.5.0 `@public-new` | Per-step GL4 snapshot |
| `GL4Options` | `numerical/index` | v0.5.0 `@public-new` | GL4 integrator options |
| `PerihelionResult` | `numerical/index` | v0.5.0 `@public-new` | Return type of `findPerihelion` |
| `FindPerihelionOptions` | `numerical/index` | v0.5.0 `@public-new` | Options for `findPerihelion` |
| `RicciTensorNode` | `dimensional/validator` | v0.5.0 `@public-new` | AST node for R_μν (via `ricci`) |
| `EinsteinTensorNode` | `dimensional/validator` | v0.5.0 `@public-new` | AST node for G_μν (via `einstein`) |
| `BianchiResidualNode` | `dimensional/validator` | v0.5.0 `@public-new` | AST node for the Bianchi residual |
| `KillingEquationOptions` | `numerical/killing` | v0.6.0 `@public-new` | Options for `verifyKillingEquation` |
| `ChristoffelAccess` | `numerical/killing` | v0.6.0 `@public-new` | Layout-agnostic Christoffel accessor |
| `EinsteinEquationResidualInput` | `numerical/einstein-equation` | v0.6.0 `@public-new` | Input bundle for `evaluateEinsteinEquationResidual` |
| `MetricClosure` | `numerical/einstein-equation` | v0.6.0 `@public-new` | Metric-closure callback type |
| `Vec4` | `numerical/einstein-equation` | v0.6.0 `@public-new` | 4-vector coordinate tuple |
| `EinsteinFieldEquationNode` | `dimensional/einstein-equation` | v0.6.0 `@public-new` | AST node for the Einstein field equation |
| `EinsteinFieldEquationValidationResult` | `dimensional/einstein-equation` | v0.6.0 `@public-new` | Return type of `validateEinsteinFieldEquation` |
| `KretschmannScalarNode` | `dimensional/curvature-invariants` | v0.6.0 `@public-new` | AST node for the Kretschmann scalar |
| `KretschmannScalarValidationResult` | `dimensional/curvature-invariants` | v0.6.0 `@public-new` | Return type of `validateKretschmannScalar` |
| `TensorConfig` / `TensorIndices` | `core/types` | v0.1.0 | Core tensor metadata types |
| `PhysicalLaw` / `BridgeEquation` / `EmergentPhenomenon` | `core/types` | v0.1.0 | High-level physics ontology types |
| `PhysicalScale` / `Force` / `Symmetry` / `InformationMeasure` | `core/types` | v0.1.0 | High-level physics ontology types |

---

See `ARCHITECTURE.md` for module design context. See `COMPONENTS.md` for per-component breakdown. See `DATAFLOW.md` for concrete data-flow traces through the system.

---

**Document Version**: 0.6.0
**Last Updated**: 2026-05-20
**Maintained by**: Daniel Simon Jr.
