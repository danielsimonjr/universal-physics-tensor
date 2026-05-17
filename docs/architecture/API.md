# Universal Physics Tensor — Public API Reference

**Version**: 0.4.0
**Last Updated**: 2026-05-16

> The public surface is snapshot-tested in `tests/api/public-surface.test.ts`. Any symbol not in that test's `EXPECTED_RUNTIME_EXPORTS` or `ALL_TYPE_EXPORTS` lists is `@internal` and may change without notice.

---

## Table of Contents

1. [Stability Tiers](#stability-tiers)
2. [Bridge Catalog](#bridge-catalog)
3. [Dimensional Types and Algebra](#dimensional-types-and-algebra)
4. [AST and Validator](#ast-and-validator)
5. [Numerical Backend](#numerical-backend)
6. [Connection Layer (v0.4.0)](#connection-layer-v040)
7. [Core](#core)
8. [Type-Only Exports](#type-only-exports)

---

## Stability Tiers

| Tier | Meaning | Version guarantee |
|------|---------|-------------------|
| `@public` | Stable surface — symbols present since ≤ v0.3.0 | Breaking changes require a major-version bump |
| `@public-new` | Added in v0.4.0 — behavioral contract is settled but the wider design is still evolving | May be adjusted in v0.5.0 with a minor-version note |
| `@internal` | Implementation detail — not re-exported from `src/index.ts` | May change at any time |

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
**Stability**: `@public`

```typescript
import { BRIDGE_EQUATIONS, isActiveStatus } from 'universal-physics-tensor';

const active = BRIDGE_EQUATIONS.filter(e => isActiveStatus(e.status));
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
| `TensorConfig` / `TensorIndices` | `core/types` | v0.1.0 | Core tensor metadata types |
| `PhysicalLaw` / `BridgeEquation` / `EmergentPhenomenon` | `core/types` | v0.1.0 | High-level physics ontology types |
| `PhysicalScale` / `Force` / `Symmetry` / `InformationMeasure` | `core/types` | v0.1.0 | High-level physics ontology types |

---

See `ARCHITECTURE.md` for module design context. See `COMPONENTS.md` for per-component breakdown. See `DATAFLOW.md` for concrete data-flow traces through the system.

---

**Document Version**: 0.4.0
**Last Updated**: 2026-05-16
**Maintained by**: Daniel Simon Jr.
