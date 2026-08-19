# Universal Physics Tensor — Public API Reference

> The public surface is snapshot-tested in `tests/api/public-surface.test.ts`. Any symbol not in that test's `EXPECTED_RUNTIME_EXPORTS` (217 entries) or `ALL_TYPE_EXPORTS` (116 entries) lists is `@internal` and may change without notice.

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
10. [Composition / Membership / Confrontation Layer (v0.8.0)](#composition--membership--confrontation-layer-v080)
11. [Phase C/D, Namespacing Gate, and v0.11 Additions (v0.9.0 → v0.11)](#phase-cd-namespacing-gate-and-v011-additions-v090--v011)
12. [Canonical-Equation Registry (the L-layer)](#canonical-equation-registry-the-l-layer)
13. [Discovery Adjudication Ledger and Consequence Propagation (v0.31 → v0.33)](#discovery-adjudication-ledger-and-consequence-propagation-v031--v033)
14. [Real-Data Confrontation Subsystem (v0.28 → v0.40)](#real-data-confrontation-subsystem-v028--v040)
15. [Epistemic-Grounding Ledger (v0.37)](#epistemic-grounding-ledger-v037)
16. [Core](#core)
17. [Type-Only Exports](#type-only-exports)

---

## Stability Tiers

| Tier | Meaning | Version guarantee |
|------|---------|-------------------|
| `@public` | Stable surface — symbols whose behavioral contract has settled across at least one minor release | Breaking changes require a major-version bump |
| `@public-new` | Added in the most recent minor release(s) — behavioral contract is settled but the wider design is still evolving | May be adjusted in a subsequent minor release with a CHANGELOG note |
| `@internal` | Implementation detail — not re-exported from `src/index.ts` | May change at any time |

`@public-new` is a rolling tier: it tracks the current minor-release frontier rather than a fixed version. The v0.4.0 connection layer, the v0.5.0 curvature layer, the v0.5.1 constants, the v0.6.0 Killing/Einstein-equation/curvature-invariant exports, the v0.7.x intelligent-index/regime and bridge-gradient exports, the v0.8.0 composition/membership/confrontation exports, and the v0.10.0–v0.11 enumeration/uncertainty/namespacing-gate/Klein-Gordon/BE-23 exports were each `@public-new` when they shipped and graduate to `@public` once a following minor release leaves their contracts unchanged.

> **Coverage note**: the v0.7.x additions (`LabeledTensor`, `Cell`/regime registry, `bridgeGradient`, catalog adapter, BE-53/54 evaluators) are on the snapshot-tested public surface but are documented in their own tutorials (`intelligent-index-tutorial.md`, `bridge-gradient-tutorial.md`) rather than enumerated per-symbol here. The v0.8.0 additions are summarized in [§10](#composition--membership--confrontation-layer-v080); the v0.9.0 → v0.11 additions in [§11](#phase-cd-namespacing-gate-and-v011-additions-v090--v011). The v0.12–v0.14 additions are likewise on the surface but deferred to the snapshot test + `CHANGELOG.md`: the `composeSymbolic`/Observable symbolic-composition layer (v0.12), the public geometrized-units adapters `toGeometrized`/`fromGeometrized`/`geometrizedFactor`/`NonGeometrizableDimensionError` (v0.14, G-9 increment 2), the `BridgeEquations` evaluator facade (v0.14), and the `LabeledTensor` `axisOrder`/`axisOf` + `mergeAxes`/`splitAxis` extension with its `AxisOrderError`/`AxisMergeError`/`AxisSplitError` (v0.14). The v0.28 → v0.40 discovery-hardening / PI-instrument program additions (adjudication ledger, consequence propagation, the unified confrontation registry, the epistemic-grounding ledger) are itemized in [§12](#discovery-adjudication-ledger-and-consequence-propagation-v031--v033), [§13](#real-data-confrontation-subsystem-v028--v040), and [§14](#epistemic-grounding-ledger-v037). `tests/api/public-surface.test.ts` remains the authoritative enumeration (217 must-be-present runtime entries + 116 type-only symbols; the full runtime surface snapshot pins 245).

All symbols in this document are `@public` unless annotated otherwise.

---

## Bridge Catalog

### `BRIDGE_EQUATIONS` — constant array

The 44-entry bridge-equation catalog (IDs 11–54). Also published as a generated JSON artifact, `data/bridge-catalog.json` (`npm run catalog:json`).

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

Full list: `C_SI` (speed of light), `G_SI` (Newtonian gravitation), `H_SI` (Planck), `HBAR_SI` (reduced Planck), `K_B_SI` (Boltzmann), `E_SI` (elementary charge), `ALPHA` (fine-structure constant, dimensionless), `M_P_SI` (Planck mass), `L_P_SI` (Planck length), `T_P_SI` (Planck time), `H0_SI` (Hubble constant), `M_SUN_SI` (solar mass, added v0.8.0), `M_E_SI` (electron mass, added v0.11).

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

Numerical contraction of the Kretschmann scalar — uses the v0.11 O-4 factored index-raising algorithm (4×4⁵, replacing the earlier O(4⁸) naive contraction), diagnostic/sample-point use only. Exported via `numerical/kretschmann`.

**Kind**: function
**Stability**: `@public-new`

> The `WeylTensorNode` AST kind and the `CurvatureCompositeNode<K,S>` factory also ship in v0.6.0, but are `@internal` to the main package entry — the Weyl validator is not re-exported from `src/index.ts`. See `COMPONENTS.md §Curvature composite factory`.

---

## Composition / Membership / Confrontation Layer (v0.8.0)

The v0.8.0 release added the composition graph (`src/composition/`), the computable bridge-membership criterion + negative catalog (`src/bridges/membership.ts`, `src/bridges/rejected.ts`), and the GW170817 real-data confrontation. All symbols below are `@public-new` and re-exported from `src/index.ts`.

### Composition graph (`src/composition/`)

- **`composeEdges(...)`** — the composition operator: chains compatible `BridgeEdge`s into a derived edge. Note the name — `composeEdges`, **not** `compose` (`compose` is the v0.7 Cell factory).
- **`evaluateEdge(...)`** — apply a single edge's transfer function.
- **`regimesDiffer(a, b)`** — graph-native membership criterion over two `Quantity` endpoints.
- **`consistencyRatio(...)`** — compare a composed chain against an independent route.
- **`minConfidence(...)`** / **`QUANTITY_IDENTIFICATIONS`** — confidence combination and quantity-identification table used by `composeEdges`.
- **`CompositionDimensionError`** / **`CompositionJunctionError`** / **`DomainViolationError`** — error classes for incompatible compositions.
- **Calibration edges** — `be16Edge`, `be42Edge`, `be42ViaRsEdge`, `be51Edge`, `be52Edge`, `lawSchwarzschildRadius` (the first diagonal-law edge), and the `M_SUN_KG` anchor constant; v0.9.0 added `be12Edge`, `be11ZurekEdge` (CT-3), and `be37Edge` (CT-4). The CT-1 target derives E_min(M) = ℏc³ln2/(8πGM) from BE-42∘BE-16.
- **Catalog edges** — the v0.10.0 tranche `be14Edge`/`be19Edge`/`be21Edge`/`be48Edge`/`be53Edge`/`be54Edge` (individually on the root surface) and the v0.11 `CATALOG_FULL_EDGES` array (26 more edges; the array is the root surface — per-edge exports stay at the composition barrel) bring the graph to 41 edges. See [§11](#phase-cd-namespacing-gate-and-v011-additions-v090--v011).

```typescript
import { composeEdges, be42Edge, be16Edge } from 'universal-physics-tensor';

const eMinOfM = composeEdges(be42Edge, be16Edge);  // M → T_H → E_min
```

### Membership criterion + negative catalog (`src/bridges/membership*.ts`, `rejected.ts`)

- **`adjudicateBridgeEntry(entry)`** — returns a `BridgeVerdict` (`'bridge' | 'not-a-bridge' | 'unadjudicated'`) for one catalog entry (tuple proxy + rejected-registry overlay).
- **`adjudicateCatalog(...)`** — whole-catalog adjudication; returns a `CatalogAdjudicationReport`.
- **`REJECTED_BRIDGE_ADJUDICATIONS`** / **`REJECTED_BRIDGE_IDS`** — the negative catalog: BE-28/29/32/35/40 adjudicated NOT-A-BRIDGE with reasons. BE-42 was REVERSED to a bridge (`['gravity','quantum']`) by the v0.8.0 Phase-4 adjudication; BE-44/46/50 remain contested/unadjudicated. See `docs/architecture/v0.8.0-catalog-adjudication.md`.

### GW170817 confrontation (`src/bridges/be36-gw170817-confrontation.ts`)

- **`confrontBE36(...)`** — confronts the BE-36 GW-speed bound with a `GWSpeedObservation`; returns a `BE36ConfrontationResult`.
- **`GW170817`** — the multi-messenger observation constant (the first real-data record in the codebase).

Type-only additions: `Quantity`, `RegimeAttributes`, `BridgeEdge`, `EdgeConfidence`, `ValidityDomain`, `ComposeOptions`, `QuantityIdentification`, `BridgeVerdict`, `CatalogAdjudicationReport`, `RejectedBridgeAdjudication`, `BE36ConfrontationResult`, `GWSpeedObservation`.

---

## Phase C/D, Namespacing Gate, and v0.11 Additions (v0.9.0 → v0.11)

Everything in this section is `@public-new` and re-exported from `src/index.ts` unless noted otherwise.

### Phase-D enumeration + uncertainty propagation (v0.10.0)

- **`enumerateCompositions(...)`** — the Phase-D candidate enumerator: walks all ordered edge pairs, attempts composition, and returns an `EnumerationReport` of `CompositionCandidate`s (split into registered vs. novel against `REGISTERED_COMPOSITION_IDS`), failures with attribution, and (since v0.11) alias collisions held at the gate (`requiresDisposition`, typed `DispositionRequired`).
- **`propagateUncertainty(...)`** — first-order uncertainty propagation via a central-difference Jacobian over an edge's transfer function; returns an `UncertaintyResult`. Works on composed edges for free.
- **`confrontBE36WithUncertainty(...)`** — GW170817 confrontation with propagated observational uncertainty (returns `BE36ConfrontationWithUncertainty`).
- **`classifyIdentifiability(edges, known, target, opts?)`** / **`classifyAll(...)`** / **`forwardClosure(...)`** — the structural identifiability classifier. Counts a target's independent derivations from a known-quantity set and returns an `IdentifiabilityResult` with an `IdentifiabilityVerdict` of `under-determined` / `exactly-determined` / `over-determined` / `given` (the over-determined surplus are falsifiable consistency constraints). Structural, not parametric; honors `QUANTITY_IDENTIFICATIONS`; excludes circular self-support. Types: `IdentifiabilityVerdict`, `IdentifiabilityResult`, `IdentifiabilityOptions`.
- **`retrodict(edges, groundTruth, opts?)`** / **`retrodictNode(...)`** — the retrodiction harness (the framework's own falsification benchmark). Masks each over-determined node, recomputes it via every independent derivation from `groundTruth` values, and scores the spread (`consistent` / `inconsistent` / `single` / `unrecoverable`; headline `allConsistent`). Optional `references` add external-value scoring. Pass bar pre-registered (spread ≤ 1e-6). Types: `RetrodictionOutcome`, `RetrodictionPrediction`, `RetrodictionResult`, `RetrodictionReport`, `RetrodictionOptions`.
- **`explainQuantity(edges, target, known, opts?)`** — the unified entry point synthesizing the three primitives above into one `QuantityExplanation`: the identifiability verdict, per-derivation values + the consistency check (when `known` is a `name → value` map), the dimensional sufficiency of the known set (Buckingham-π), and a plain-language `summary`. `known` may be a name list (structural + dimensional only) or values (adds recovery + consistency); `extraDimensions` declares dims for non-graph knowns (raw `G`, `c`, …). Types: `QuantityExplanation`, `DerivationExplanation`, `ExplainOptions`.

```typescript
import { enumerateCompositions, CATALOG_FULL_EDGES } from 'universal-physics-tensor';

const report = enumerateCompositions([...edges]);
// report.candidates / report.requiresDisposition / failure buckets
```

### Namespacing gate (v0.11)

- **`CompositionAliasError`** — thrown by `composeEdges` when both operands carry a same-named source quantity and no disposition is recorded.
- **`SOURCE_ALIAS_DISPOSITIONS`** — the reviewable registry of per-composition `AliasDisposition`s (`'shared'` or `{renameSecond}` with input remap); `composeEdges(…, { aliases })` is the per-call escape hatch.
- Type-only: `AliasDisposition`, `DispositionRequired`.
- The 131 centralized `Quantity` node constants in `src/composition/quantities.ts` are `@internal` (consumed by the edge files; not on the composition barrel or root surface).

### Klein-Gordon dispersion evaluator (v0.11)

- **`evaluateKGDispersionResidual(input)`** / **`verifyKleinGordonPlaneWave(input)`** — plane-wave-sector dispersion check ω² = c²k² + (mc²/ℏ)². Types: `KGDispersionResidualInput`, `KGPlaneWaveVerifyInput`, `KGPlaneWaveVerifyResult`.

### BE-23 Planckian data confrontation (v0.11)

- **`confrontBE23(...)`** / **`confrontBE23WithUncertainty(...)`** — BE-23 SYK Planckian dissipation vs. the overdoped-cuprate aggregate (Legros et al. 2019). Constants: `PLANCKIAN_CUPRATES` (a `PlanckianObservation`), `PLANCKIAN_O1_BAND`. Result types: `BE23ConfrontationResult`, `BE23ConfrontationWithUncertainty`.

### v0.9.0 surface notes

The v0.9.0 flat-metric sprint was mostly internal/fixture-level: `MetricFnFlat` and `DEFERRED_EVALUATOR_REGISTRY` are `@internal` (not on the root surface); the Painlevé–Gullstrand `Float64Array` migration was BREAKING only for subpath importers of `numerical/painleve-gullstrand-metric`.

---

## Canonical-Equation Registry (the L-layer)

The **L-layer**: the textbook-physics "answer key" the catalog bridges are
validated against (Π = L + B + E). Each `CanonicalEquation` is multi-fidelity —
L0 dimensional signature / L1 scalar-AST / L2 field-equation — with
epistemic-honesty (`epistemicStatus`) and provenance fields. 103 equations at the
current head. All symbols below are re-exported from `src/index.ts`; verify the
authoritative set in `tests/api/public-surface.test.ts`.

### Registry and accessors (`src/canonical/registry.ts`)

- **`CANONICAL_EQUATIONS`** — the assembled array of all `CanonicalEquation`
  entries (the L-layer registry).
- **`CANONICAL_BY_ID`** — a `Map` of equation id → `CanonicalEquation`.
- **`canonicalById(id)`** — look up a single equation by id.
- **`canonicalByDomain(domain)`** — all equations in a `CanonicalDomain`
  (mechanics, EM/circuits, fluids/waves, thermo, quantum/atomic, gravitation,
  cosmology, condensed-matter).
- **`partneredBridgeIds()`** — bridge ids that have a canonical partner.
- **`bridgesWithoutCanonicalPartner()`** — the complementary coverage gap (bridge
  ids with no canonical partner).

### Seeding the tensor (`src/canonical/seed-l-layer.ts`)

- **`canonicalToLaw(eq)`** — convert a `CanonicalEquation` to a `PhysicalLaw`.
- **`seedCanonicalLaws(tensor)`** — populate a `UniversalTensor`'s L-layer from
  the registry via `addLaw`.
- **`CANONICAL_TENSOR_CONFIG`** — the tensor configuration used for L-layer
  seeding.

### Canonical graph (`src/composition/`)

- **`CANONICAL_GRAPH`** — the textbook-physics-only composition graph (the
  `--source=canonical` graph; 103 `law` edges).
- **`canonicalToEdges(...)`** — derive graph edges from canonical equations.
- **`CANONICAL_CONSTANTS`** — the canonical physical-constant set used by the
  canonical graph.

### Structural normal form and linkage (`src/canonical/`)

- **`normalForm(node)`** / **`structurallyEqual(a, b)`** — the structural hash
  (equal up to dimensionless *constants*; named non-constant stubs like
  `ln⟨e^−βW⟩` are kept distinct) and its equality predicate
  (`src/canonical/normal-form.ts`).
- **`classifyLinkage(...)`** / **`scanLinkages(...)`** — the bridge↔canonical
  validator with the F4 circularity guard: distinguishes a genuine `recovers`
  from a `restates-canonical` self-reference (`src/canonical/linkage.ts`, surfaced
  via `upt recover`).

Types: **`CanonicalEquation`**, **`CanonicalDomain`**, **`EpistemicStatus`**,
**`CanonicalForms`**, **`FieldEquationNode`** (`canonical-equation.ts`);
**`LinkageResult`**, **`RecoveryOutcome`** (`linkage.ts`).

## Discovery Adjudication Ledger and Consequence Propagation (v0.31 → v0.33)

The discovery-hardening program (v0.31.0–v0.33.0) layered review memory and a
machine pre-classifier on top of the existing discovery funnel
(`rankDiscoveries`, `src/composition/discovery.ts`) — annotation-only passes
that never mutate the catalog, graphs, or funnel verdicts.

### Discovery funnel entry point

**`rankDiscoveries(...)`** — the discovery funnel's entry point (vets
link-candidate identifications against the inference suite). Exported from
the package root since v0.32.0 alongside `VettedCandidate`, so consumers can
build the adjudication/consequence/grounding annotators' input via public API
without reaching into `src/composition/discovery.js`.

**Kind**: function
**Stability**: `@public-new`

Type-only: `VettedCandidate` — the funnel's per-candidate output shape
(`dim`, `numericallyConsistent`, `magnitudeChecked`/`ordersApart`,
`axisChecked`/`axisClashes`, and the `verdict` discriminant:
`magnitude-clash` / `contradictory` / `axis-clash` / `promising` / `inert`).

Product B (`upt probe`, `src/composition/probe/`) is **not** on this root surface.
Import `universal-physics-tensor/probe` for the experimental barrel, or use the CLI.
Those symbols are `@internal` and may change without a major version bump.

### Adjudication ledger (v0.31.0)

Human verdicts on identification hypotheses (`a ≟ b`) as review memory — once
a physicist has disposed of a candidate, the funnel must not re-surface it as
fresh. Verdicts never mutate the catalog or graphs; they annotate discovery
output only.

- **`candidateId(a, b)`** — stable order-normalized identity for an
  identification hypothesis (`a~b`, sorted).
- **`ADJUDICATIONS`** — the seeded verdict array.
- **`adjudicationFor(a, b)`** — look up the verdict for an identification,
  order-insensitive.
- **`annotateAdjudications(candidates)`** — attaches each candidate's recorded
  verdict, if any; a pure map that preserves order and length.

```typescript
import { rankDiscoveries, annotateAdjudications } from 'universal-physics-tensor';

const ranked = rankDiscoveries(/* ... */);
const annotated = annotateAdjudications(ranked);
// annotated[i].adjudication?.verdict — 'genuine' | 'decoy' | 'entailed' | 'deferred'
```

**Kind**: functions + constant
**Stability**: `@public-new`

Type-only: `AdjudicationVerdict`, `CandidateAdjudication`, `AnnotatedCandidate`.

### Consequence propagation (v0.33.0)

A post-pass annotator over ranked candidates (mirrors `annotateAdjudications`):
for each `promising` candidate, derives its monomial algebraic consequence and
compares it against the canonical registry to label it `entailed` (re-derives
known physics), `novel-consequence` (valid, no canonical match), or
`inconclusive` (no monomial consequence derivable).

- **`annotateConsequences(candidates)`** — generic over the input candidate
  type (`<T extends VettedCandidate>`), so it composes with
  `annotateAdjudications`'s output without losing fields.
- **`classifyProposal(proposal, canonical?)`** — classifies one derived
  proposal against the canonical registry (defaults to `CANONICAL_EQUATIONS`).

**Kind**: functions
**Stability**: `@public-new`

Type-only: `ConsequenceSignal` (`'entailed' | 'novel-consequence' | 'inconclusive'`),
`ConsequenceEvidence`, `ConsequenceAnnotatedCandidate`.

---

## Real-Data Confrontation Subsystem (v0.28 → v0.40)

`upt confront` and its underlying registry — the catalog's real-data spine.
Built incrementally from the first established-bridge confrontation (BE-52 ×
Mercury, v0.28.0) through the v0.33.0 unified registry to the v0.40.0 honesty
fix (the BE-36 one-sided caveat). Nine bridges are data-confronted as of
v0.40.0: BE-11, 21, 23, 35, 36, 37, 48, 51, 52.

### Typed observation + outcome layer (`src/bridges/observations/types.ts`, v0.33.0)

- **`ConfrontationOutcome`** — the normalized result, discriminated on `kind`
  so each confrontation carries only the fields it can honestly populate:
  - `'value'` — `predicted`/`observed`/`sigma`/`residualInSigma`/`withinObserved`.
  - `'upper-bound'` — `predicted`/`bound`/`satisfied`, plus an optional
    **`caveat`** field (added v0.40.0) surfacing an honesty note such as a
    one-sided pass against a symmetric encoded bound (BE-36).
  - `'consistency'` — `predicted`/`approaches`/`fractionalGap`.
  - `'table'` — a `rows` array of per-row value comparisons.
  - Every arm also carries `units` and `provenance`.
- **`residualInSigma(predicted, observed, sigma)`** — `|predicted − observed|`
  in units of the observed 1σ.
- **`combineInQuadrature(components)`** — combined 1σ from named
  `SigmaComponent[]` (root-sum-square).

**Kind**: functions + discriminated-union type
**Stability**: `@public-new`

Type-only: `ObservationProvenance` (citation/year/retrieved/note — mandatory
on every observation record), `SigmaComponent`, `ObservationKind`
(`'value' | 'upper-bound' | 'consistency' | 'table'`).

### Unified registry (`src/bridges/confrontations.ts`, v0.33.0)

```typescript
import { CONFRONTATIONS, listConfrontations, runConfrontation } from 'universal-physics-tensor';

for (const entry of listConfrontations()) {
  const outcome = entry.run();
  // outcome.kind discriminates the shape — see ConfrontationOutcome above
}

const be36 = runConfrontation(36); // ConfrontationOutcome | undefined
```

- **`CONFRONTATIONS`** — the registry (`ReadonlyMap<number, ConfrontationEntry>`,
  keyed by bridge id).
- **`listConfrontations()`** — all entries, ascending bridge-id order.
- **`runConfrontation(bridgeId)`** — run one confrontation; `undefined` if the
  id is not registered.

**Kind**: functions + constant
**Stability**: `@public-new`

Type-only: `ConfrontationEntry` (`bridgeId`, `title`, `kind`, `run()`).

### Per-bridge confrontations

Each wraps a bridge's own evaluator/formula against an independently-sourced
observation. All are `@public-new` and individually re-exported from
`src/index.ts` (in addition to being reachable via the unified registry
above).

| Bridge | Function | Observation constant | Kind | Added |
|---|---|---|---|---|
| BE-52 (Mercury perihelion) | `confrontBE52` | `MERCURY` | value | v0.28.0 |
| BE-37 (Shapiro delay) | `confrontBE37` | `CASSINI` | value | v0.33.0 |
| BE-48 (GRW collapse rate) | `confrontBE48` | `LISA_PATHFINDER_CSL` | upper-bound | v0.33.0 |
| BE-51 (light deflection) | `confrontBE51` | `VLBI_LAMBERT_2009` | value | v0.35.0 |
| BE-21 (KSS viscosity bound) | `confrontBE21` | `KSS_BOUND`, `QGP_BMB19` | consistency | v0.37.0 |
| BE-35 (conformal bootstrap) | `confrontBE35` | `BOOTSTRAP_NU`, `BOOTSTRAP_NU_SIGMA`, `ISING_PELISSETTO_VICARI_2002` | value | v0.38.0 |
| BE-11 (collisional decoherence) | `confrontBE11` | `DECOHERENCE_EXPERIMENTAL_TOLERANCE`, `COLLISIONAL_HORNBERGER_2003` | consistency | v0.39.0 |
| BE-36 (GW speed, GW170817) | `confrontBE36` / `confrontBE36WithUncertainty` | `GW170817` | upper-bound | v0.8.0 |
| BE-23 (Planckian dissipation) | `confrontBE23` / `confrontBE23WithUncertainty` | `PLANCKIAN_CUPRATES`, `PLANCKIAN_O1_BAND` | value | v0.11 |

BE-36 and BE-23 predate the unified `ConfrontationOutcome` shape (their native
result types — `BE36ConfrontationResult`, `BE23ConfrontationResult`, etc. —
stay the direct return type of their own `confront*` functions; the registry
above adapts them to `ConfrontationOutcome` internally) and are already
documented in [§10](#composition--membership--confrontation-layer-v080) and
[§11](#phase-cd-namespacing-gate-and-v011-additions-v090--v011).

Each of the other seven confrontation functions' own result type is also
`@public-new` and exported: `BE52ConfrontationResult`/`PerihelionObservation`,
`BE37ConfrontationResult`/`CassiniObservation`,
`BE51ConfrontationResult`/`VLBIDeflectionObservation`,
`BE48ConfrontationResult`/`CollapseBoundObservation`,
`BE21ConfrontationResult`/`QGPViscosityObservation`,
`BE35ConfrontationResult`/`IsingExponentObservation`,
`BE11ConfrontationResult`/`CollisionalDecoherenceObservation`.

```typescript
import { confrontBE52, MERCURY } from 'universal-physics-tensor';

const result = confrontBE52();
// result.predicted_arcsec_per_century / result.observed_arcsec_per_century
// result.residual_in_sigma / result.withinObserved
```

### Deciding-measurement elasticity (`src/bridges/sensitivity.ts`, v0.33.0)

**`decidingMeasurement(bridgeId)`** — for a value-kind confrontation, ranks
its numeric inputs by dimensionless log-sensitivity
`E_i = |∂P/∂x_i|·x_i/P` (central finite differences, descending) — which
input the prediction depends on MOST STRONGLY, not which dominates the
uncertainty budget. Returns `[]` for a non-value-kind or unregistered id.

```typescript
import { decidingMeasurement } from 'universal-physics-tensor';

const ranking = decidingMeasurement(52); // Elasticity[], descending by |E_i|
// ranking[0] — the input BE-52's prediction depends on most strongly
```

**Kind**: function
**Stability**: `@public-new`

Type-only: `Elasticity` (`{ input: string; elasticity: number }`).

---

## Epistemic-Grounding Ledger (v0.37)

A pure, derived view over a `VettedCandidate`'s already-computed falsifier
results — part of the PI-instrument program (v0.37.0), reframing the
discovery funnel as an honest falsification instrument (a trustworthy *no*,
an extraordinary *yes*). Annotation-only: it changes no verdict, score, or
count.

**`describeGrounding(candidate, consequence?)`** — derives the ledger from a
candidate's existing falsifier results (and, optionally, its
`ConsequenceSignal` from `annotateConsequences`). Reports which gates
actually ran a real comparison and the candidate survived (`passed`) versus
gates that could not test it or produced an unadjudicated result (`gaps`),
plus the honest, permanent ceiling for a dimensional discovery candidate:
`mechanismTested: false` (axis-compatibility is a regime proxy, not a
mechanism test) and `dataTested: false` (candidates are unconfrontable until
promoted to an established bridge).

```typescript
import { describeGrounding } from 'universal-physics-tensor';

const grounding = describeGrounding(candidate);
// grounding.passed  — e.g. ['numerical-consistency', 'magnitude (2.1 orders)']
// grounding.gaps    — e.g. ['axis (regime attributes unresolved)']
// grounding.mechanismTested === false
// grounding.dataTested === false
```

**Kind**: function
**Stability**: `@public-new`

Type-only: `CandidateGrounding`.

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

> The table below enumerates through v0.6.0. The v0.7.x type additions, the v0.8.0 additions listed in [§10](#composition--membership--confrontation-layer-v080), the v0.10.0–v0.11 additions listed in [§11](#phase-cd-namespacing-gate-and-v011-additions-v090--v011), the v0.12–v0.14 additions (symbolic composition, the public geometrized adapters, the `BridgeEquations` facade, and the `LabeledTensor` axis-order / `mergeAxes`-`splitAxis` extension), and the v0.28 → v0.40 additions listed in [§12](#discovery-adjudication-ledger-and-consequence-propagation-v031--v033)–[§14](#epistemic-grounding-ledger-v037) are all pinned by `tests/api/public-surface.test.ts` (116 type-only symbols total) but not rowed in the table below.

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

**Maintained by**: Daniel Simon Jr.

## Verification

Generated by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/architecture`

| Claim | Value | Source |
|---|---|---|
| totalExports | 2103 | dependency-graph.json |
| unusedExportsCount | 25 | dependency-graph.json |

**`unusedExportsCount` is not a deletion list.** It counts exports with no importer *inside
this repository*. This is a published library: its public surface exists for consumers who are
not in the graph. Confirm with a second method before removing anything.
