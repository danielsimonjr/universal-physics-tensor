# Universal Physics Tensor — System Architecture

**Version**: 0.6.0
**Last Updated**: 2026-05-20

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Module Organization](#module-organization)
4. [Key Types and Entry Points](#key-types-and-entry-points)
5. [TensorEngine Architecture](#tensorengine-architecture)
6. [Bridge Catalog Architecture](#bridge-catalog-architecture)
7. [Validation Pipeline](#validation-pipeline)
8. [Automatic Differentiation Architecture](#automatic-differentiation-architecture)
9. [Key Design Decisions](#key-design-decisions)
10. [Testing Strategy](#testing-strategy)

---

## System Overview

UPT is a TypeScript library for computational physics organized around two concerns: **symbolic dimensional analysis** (checking that physics equations are dimensionally consistent) and **numerical tensor evaluation** (actually computing their values). These concerns share a common AST — the `ExprNode` union — which serves as the lingua franca between bridge-equation authors, the validator, and the numerical backend.

Since v0.4.0 the library has grown a **general-relativity layer** on top of these two concerns: the v0.4.0 connection layer (Christoffel builder, covariant derivative), the v0.5.0 curvature layer (Riemann/Ricci/Einstein/Bianchi composite nodes, the GL4 symplectic integrator, the perihelion finder), and the v0.6.0 Killing/Einstein-equation/curvature-invariant layer (Killing-vector machinery, the `EinsteinFieldEquationNode` predicate + numerical residual evaluator, Weyl and Kretschmann). All of these reuse the same `ExprNode` AST and `TensorEngine` backend — they add node kinds and evaluator modules, not parallel infrastructure.

### Key Statistics (v0.6.0)

Numbers extracted from `docs/architecture/dependency-graph.json` (authoritative output of the `create-dependency-graph` tool).

| Metric | Value |
|--------|-------|
| Source files | 93 TypeScript files |
| Modules | 5 (`bridges`, `core`, `dimensional`, `numerical`, `entry`) |
| Total exports | 482 |
| Bridge catalog entries | 42 |
| Per-bridge evaluator modules | 42 (every bridge has an `evaluate*` function — see `bridge-coverage-audit.md`) |
| TensorEngine implementations | 2 (`Float64ReferenceEngine`, `MathTSEngine`) |

### Module Distribution

| Module | Files | Responsibility |
|--------|-------|----------------|
| `bridges/` | 44 | Bridge catalog index + per-bridge evaluator modules |
| `dimensional/` | 19 | SI dimensional types, algebra, AST, validator, metric + connection + curvature layer |
| `numerical/` | 26 | TensorEngine interface, engines, lowering, geodesic + GL4 integrators, perihelion finder, Killing/Einstein/Kretschmann evaluators |
| `core/` | 3 | `UniversalTensor` class, `PhysicalConstants` lookup, flat `*_SI` constants |
| `entry/` | 1 | `src/index.ts` — public re-export surface |

---

## Architecture Principles

### 1. AST-First

Every bridge equation is expressed as an `ExprNode` tree. The tree is the artifact — numerical evaluation and dimensional validation are operations applied to it, not the other way around. This design means that a bridge can be validated symbolically without ever touching floating-point arithmetic, and new validators (e.g., a future index-structure checker) can be added without modifying any bridge module.

### 2. Honest Framing

Capabilities that are not implemented are not claimed. The validator explicitly documents what it does not check (index rank, special-function arguments); the bridge catalog marks equations whose status is unclear. AD in v0.4.0 operates on user-supplied function closures, not on `ExprNode` trees directly — the `derivativeStrategy: 'computed'` field on `MetricTensorNode` still uses finite-difference (pderiv) when the metric derivative is needed symbolically.

### 3. Interface + Conformance Suite

The `TensorEngine` interface decouples the evaluation surface from any particular linear-algebra library. Both engines (`Float64ReferenceEngine` and `MathTSEngine`) satisfy a single parameterized conformance suite (`tests/numerical/engine-conformance.test.ts`) that runs the same test cases against either engine. Adding a new engine means implementing the interface and passing the suite — no changes to the evaluator.

### 4. Dependency-Shape Signal

`MathTSEngine` lives behind an `optionalDependency` on `@danielsimonjr/mathts-tensor`. The design intent is for `MathTSEngine` to become the active default when the dep is present, not because it is faster than `Float64ReferenceEngine` today (it may not be), but because it signals the intended dependency shape of the UPT ecosystem and exercises the monorepo boundary between UPT and the MathTS packages.

---

## Module Organization

### `bridges/` (44 files)

The bridges module has two distinct layers that should not be confused:

**Index layer** (`src/bridges/index.ts`): The machine-readable catalog. Contains `BRIDGE_EQUATIONS` — a 42-entry array of `BridgeEquationEntry` objects carrying spec-level metadata (id, name, status, known issues, tractability class, references, dependencies, dimensional signature). This file has no evaluator logic; it is the authoritative source of truth for the catalog. Type exports (`BridgeEquationEntry`, `BridgeEquationStatus`, `BridgeIssueSeverity`, etc.) describe the catalog shape.

**Evaluator layer** (`src/bridges/equations/be-*.ts`): Per-bridge evaluator modules. Each module builds the equation's LHS and RHS as `ExprNode` trees, exports a `validate*Dimensions()` helper that calls `validateEquation(LHS, RHS)`, and exports an `evaluate*()` function that calls `evaluateNumerical()` with a concrete `NumericalInputs` bundle. Following the Wave-Z evaluator buildout, all 42 catalogued bridges (IDs 11–52) now have an evaluator module — see `docs/architecture/bridge-coverage-audit.md`. (The v0.4.0-era doc described only the original eight; that snapshot is superseded.)

### `dimensional/` (19 files)

The dimensional module is the heart of UPT's symbolic layer. Its responsibilities span four areas:

**SI type system** (`types.ts`): The `Dimension` interface — seven base SI dimensions (`L`, `M`, `T`, `I`, `Theta`, `N`, `J`) represented as a record of `number` exponents. Named dimension constants (`LENGTH`, `MASS`, `ENERGY`, etc.) are exported only when they have at least one concrete consumer (a bridge module or a test). This is a deliberate hygiene discipline: unreferenced constants are removed.

**Dimension algebra** (`algebra.ts`): Pure functions (`multiply`, `divide`, `power`, `add`, `subtract`, `equals`, `format`) that operate on `Dimension` values. `add` and `subtract` throw `DimensionMismatchError` if operands disagree — this is the mechanism that catches non-homogeneous equations.

**AST and validator** (`validator.ts`): The `ExprNode` union type (the AST), the `ValidationResult` interface, and the `validate()` / `validateEquation()` entry points. The validator is a recursive tree-walker that calls the algebra functions to infer the dimension at each node. Tensor-aware node kinds (`tensor-symbol`, `tensor-product`, `metric-tensor`, `kronecker-delta`, `tensor-partial-derivative`, `covariant-derivative`) and the curvature/equation node kinds (`riemann-tensor`, `ricci-tensor`, `einstein-tensor`, `bianchi-residual`, `killing-vector`, `conserved-charge`, `stress-energy-tensor`, `cosmological-constant`, `einstein-field-equation`, `weyl-tensor`, `kretschmann-scalar`) delegate to specialized sub-validators in `tensor.ts`, `metric-validators.ts`, `connection-validators.ts`, `curvature.ts`, `weyl-validators.ts`, `curvature-invariants.ts`, and `einstein-equation.ts`. The validator tracks free (uncontracted) indices in a mutable `Map` that threads through the recursion.

**Metric and connection layer** (`metric.ts`, `metric-validators.ts`, `connection.ts`, `connection-validators.ts`): Types and validators for the tensor-specific AST kinds introduced in v0.3.0 (metric tensor, Kronecker delta, tensor partial derivative) and v0.4.0 (covariant derivative, `RiemannTensorNode`). The `christoffel()` function in `connection.ts` builds the Γ^λ_μν formula as a composite `ExprNode` tree from the user-supplied metric nodes.

**Curvature layer** (`curvature.ts`, `curvature-composite.ts`, `curvature-invariants.ts`, `weyl-validators.ts`, `einstein-equation.ts`): The v0.5.0/v0.6.0 GR curvature AST. `curvature.ts` houses the Ricci/Einstein/Bianchi validators and the `ricci`/`einstein`/`bianchiResidual` helpers; `curvature-composite.ts` is the shipped `CurvatureCompositeNode<K,S>` factory + `CURVATURE_KIND_REGISTRY` that all six curvature node kinds (Riemann, Ricci, Einstein, Bianchi, Weyl, Kretschmann) are built from; `curvature-invariants.ts` defines `KretschmannScalarNode` + its validator; `weyl-validators.ts` defines `WeylTensorNode`; `einstein-equation.ts` defines the `EinsteinFieldEquationNode` predicate + `validateEinsteinFieldEquation`.

### `numerical/` (26 files)

The numerical module implements the evaluation backend.

**TensorEngine interface** (`tensor-engine.ts`): The compute contract. Defines `EngineTensor` (an opaque rank-N tensor handle), `EinsumSpec` (the engine-agnostic contraction plan), and `TensorEngine` (the interface both engines satisfy). Also defines `ForwardGradResult` / `ReverseGradResult` and `hasAutogradSupport()`.

**Float64ReferenceEngine** (`float64-engine.ts`): The zero-dependency, Float64Array-backed reference implementation. Naive O(n) algorithms: a correctness baseline, not a performance target. Includes inline dual-number forward-mode AD and tape-recording reverse-mode AD.

**MathTSEngine adapter** (available via the `universal-physics-tensor/numerical/mathts-engine` subpath export, not from the main index): The adapter wrapping `@danielsimonjr/mathts-tensor`. Not imported at main index level to avoid forcing the optional dependency on all consumers.

**Lowering** (`lowering.ts`): Translates an `ExprNode` tree into a sequence of `TensorEngine` calls. This is the bridge between the symbolic layer and the numeric layer.

**Geodesic integrators** (`geodesic-integrator.ts`, `gl4-integrator.ts`): `geodesic-integrator.ts` is the fixed-step RK4 integrator — takes a Christoffel-symbol closure `(x) => Γ[μ][ν][ρ]` and integrates the (x, v) phase-space system forward in proper time. `gl4-integrator.ts` (v0.5.0) is the GL4 (Gauss–Legendre 4th-order) symplectic integrator: an energy-conserving alternative for long-time integration. Neither has a `TensorEngine` dependency — both are self-contained and operate on plain JS arrays.

**Perihelion finder** (`perihelion-finder.ts`): v0.5.0 bisection-based finder that locates the perihelion of a geodesic trajectory; underpins the BE-52 Mercury demonstration.

**Curvature / GR evaluators** (v0.6.0): `killing.ts` provides `verifyKillingEquation` and `evaluateConservedCharge`; `einstein-equation.ts` provides `evaluateEinsteinEquationResidual` (the scale-normalized Einstein field-equation residual); `kretschmann.ts` provides `computeKretschmann` (the O(4⁸) Kretschmann-scalar contraction); `christoffel-flat.ts` provides `christoffelFnFlat` (the flat-layout Christoffel accessor introduced by the BR-2 migration). The lowering of curvature AST node kinds is handled by `curvature-lowering-helpers.ts`.

**Engine registry** (`engine-registry.ts`): `getActiveEngine()` / `setActiveEngine()` — global active-engine management for the `evaluateNumerical()` default-engine path.

### `core/` (3 files)

The core module contains the `UniversalTensor` class (the original high-level facade, predating the dimensional and numerical layers), the `PhysicalConstants` lookup (SI values of G, c, ℏ, k_B, etc.), and `constants.ts` — the v0.5.1 flat CODATA 2018 / SI-defined constants (`C_SI`, `G_SI`, `HBAR_SI`, …), the single source of truth for physical constants across the numerical, dimensional, and bridge layers. The `UniversalTensor`/`PhysicalConstants` parts are the oldest in the codebase and predate the AST-first design; they remain on the public surface for backward compatibility.

---

## Key Types and Entry Points

### `ExprNode` (`src/dimensional/validator.ts`)

The AST union. Every physics expression in UPT is an `ExprNode`:

```typescript
type ExprNode =
  | { kind: 'symbol'; name: string; dim: Dimension }
  | { kind: 'op'; op: '+' | '-' | '*' | '/' | '^'; args: ExprNode[] }
  | { kind: 'integral'; over: ExprNode; integrand: ExprNode }
  | { kind: 'derivative'; of: ExprNode; wrt: ExprNode }
  | TensorSymbolNode
  | TensorProductNode
  | MetricTensorNode
  | KroneckerDeltaNode
  | TensorPartialDerivativeNode
  | CovariantDerivativeNode      // added v0.4.0
  | RiemannTensorNode            // added v0.4.0/v0.5.0
  | RicciTensorNode              // added v0.5.0
  | EinsteinTensorNode           // added v0.5.0
  | BianchiResidualNode          // added v0.5.0
  | KillingVectorNode            // added v0.6.0
  | ConservedChargeNode          // added v0.6.0
  | StressEnergyTensorNode       // added v0.6.0
  | CosmologicalConstantNode     // added v0.6.0
  | EinsteinFieldEquationNode    // added v0.6.0
  | WeylTensorNode               // added v0.6.0
  | KretschmannScalarNode;       // added v0.6.0
```

The `symbol` kind is the leaf: it carries an SI `Dimension` inline. All other kinds build structure from sub-expressions.

### `Dimension` (`src/dimensional/types.ts`)

The seven base SI dimensions as a plain record of exponents. Rational exponents (`1/2` for a square-root dimension) are supported. All dimension algebra is implemented as pure functions over this type.

### `TensorEngine` (`src/numerical/tensor-engine.ts`)

The compute contract. Implementations provide `fromNested`, `toNested`, `einsum`, `matMul`, `transpose`, `reshape`, and element-wise arithmetic. The optional `forwardGrad` / `reverseGrad` methods are the AD surface; `hasAutogradSupport(engine)` guards whether they are present.

### `evaluateNumerical` (`src/numerical/index.ts`)

The main numerical entry point. Takes an `ExprNode` and a `NumericalInputs` bundle (mapping symbol names to concrete tensor values), validates the AST, lowers it to engine calls via `lowering.ts`, and returns a `NumericalResult` carrying the output value, inferred dimension, free indices, and any warnings.

---

## TensorEngine Architecture

The engine architecture follows a strict three-part structure:

**1. Interface** (`tensor-engine.ts`): The `TensorEngine` interface is the only thing the evaluator (`numerical/index.ts`) and the lowering pass (`lowering.ts`) know about. Neither file imports a concrete engine class.

**2. Implementations**: Two implementations exist as of v0.4.0:

- `Float64ReferenceEngine`: Pure TypeScript, Float64Array-backed. Zero runtime dependencies. Available from the main package entry point. Its AD implementation uses dual numbers for forward mode and a tape-record approach for reverse mode, both implemented inline in `float64-engine.ts`.
- `MathTSEngine`: Wraps `@danielsimonjr/mathts-tensor`. Available only via the `universal-physics-tensor/numerical/mathts-engine` exports subpath (a conditional import that keeps the optional dependency tree-shakeable). Its AD delegates to `@danielsimonjr/mathts-autograd`.

**3. Conformance suite**: A parameterized test suite (`tests/numerical/engine-conformance.test.ts`) defines the behavioral contract shared by both engines. The suite is run against each engine independently. Any engine that passes the suite is a valid drop-in for `evaluateNumerical()`.

---

## Bridge Catalog Architecture

Each bridge-equation module (`src/bridges/equations/be-*.ts`) follows a consistent pattern:

1. Import `ExprNode`, `validate`, `validateEquation` from the dimensional module.
2. Build LHS and RHS as `ExprNode` trees using `symbol`, `op`, `integral`, `derivative`, `tensor-product`, and `metric-tensor` nodes as needed.
3. Export the AST constants (e.g., `DECOHERENCE_RATE_LHS`, `DECOHERENCE_RATE_RHS`) so consumers can inspect or extend the trees.
4. Export a `validate*Dimensions(): DimensionValidationReport` helper that calls `validateEquation(LHS, RHS)` and returns `{ ok, lhsDim, rhsDim }`.
5. Export an `evaluate*()` function that wraps `evaluateNumerical()` with a typed input interface, providing caller-friendly error messages and a result type with named fields.

The index module (`src/bridges/index.ts`) re-exports the v0.4.0 flagship evaluator functions (`evaluateGravitationalLensing`, `evaluatePerihelionPrecession`) alongside the `BRIDGE_EQUATIONS` catalog array. Bridge metadata in the catalog (`dimensional_signature`, `status`, `known_issues`) is maintained by hand, informed by the per-module validators — there is no code-generation path from module outputs to catalog entries.

---

## Validation Pipeline

When a caller invokes `validate(node)`:

1. The recursive walker `infer(node, ctx)` traverses the `ExprNode` tree.
2. At each `symbol` leaf, the `dim` field is returned directly.
3. At each `op` node, the algebra functions (`multiply`, `divide`, `power`, `add`, `subtract`) are applied to the children's inferred dimensions. `add` / `subtract` additionally check that all operands share the same free-index signature (enforced since v0.3.1 to prevent tensor+scalar mixups).
4. At tensor-aware nodes, specialized sub-validators handle index tracking and Einstein contraction (`computeContraction` in `tensor.ts`).
5. Violations are accumulated in a mutable `violations: Violation[]` array on the context object. Each violation has a location (tree path string), expected and actual dimensions, a human-readable note, and an optional severity (`'error'` or `'warning'`).
6. `validate()` returns a `ValidationResult` with `ok`, `inferredDimension`, `freeIndices`, and `violations`. `ok` is `false` iff at least one error-severity violation is present.

`evaluateNumerical()` calls `validate()` first and throws `NumericalBackendError` if `ok` is false — numerical evaluation on an invalid AST is not permitted.

---

## Automatic Differentiation Architecture

### What is implemented

Both engines implement optional `forwardGrad` and `reverseGrad` methods on the `TensorEngine` interface. These operate on **user-supplied function closures** of the form `(x: EngineTensor) => EngineTensor`. The caller wraps the computation they want to differentiate in a closure; the engine handles the bookkeeping.

- `forwardGrad(fn, x)` returns `{ value, jacobian }` — the Jacobian-vector product with unit tangent.
- `reverseGrad(fn, x, cotangent?)` returns `{ value, gradient }` — the vector-Jacobian product, defaulting to ones-like cotangent.

Both return `Promise` for uniform async semantics, even though `Float64ReferenceEngine`'s implementations are synchronous internally.

### What is NOT implemented

AD does not differentiate `ExprNode` trees symbolically. When a `MetricTensorNode` carries `derivativeStrategy: 'computed'`, that signals that metric derivatives are computed via finite differences (pderiv), not via automatic differentiation through the engine. Symbolic-tree AD — differentiating an `ExprNode` to produce another `ExprNode` — is not in v0.4.0.

### Float64ReferenceEngine internals

Forward mode uses the dual-number representation: `EngineDualTensor` carries both a primal `Float64Array` and a tangent `Float64Array`. All arithmetic operations propagate both. Reverse mode uses a tape-record approach: a `Tape` object logs operations during the forward pass; `reversePass()` walks the tape backward accumulating gradients.

### MathTSEngine delegation

`MathTSEngine` delegates `forwardGrad` and `reverseGrad` to `@danielsimonjr/mathts-autograd`. The UPT-level contract is the same; the implementation is in the separate `mathts-autograd` package which follows its own release cadence.

---

## Key Design Decisions

- **Dep-shape, not perf**: `MathTSEngine` is the intended default not for performance reasons but to exercise the monorepo dep boundary. `Float64ReferenceEngine` remains the zero-dep fallback and is what `getActiveEngine()` returns when the optional dep is absent.

- **No entry-point coupling to optional deps**: `MathTSEngine` is excluded from the main `src/index.ts` re-export surface. Importing from the main entry point never triggers an optional-dependency resolution error.

- **`christoffel()` builds trees, not values**: The Christoffel formula builder returns an `ExprNode` composite, not a number. This keeps it in the symbolic layer and makes the result inspectable, validatable, and extensible before any numerical evaluation.

- **Validator does not check index rank**: The v0.4.0 validator tracks free indices (label + upper/lower count) but does not enforce rank constraints or catch index-label collisions across unrelated subexpressions. This is documented honestly in the validator's module-level JSDoc. A full index-structure checker is a planned Tier 4.5 follow-up.

- **Honest `'computed'` = pderiv FD**: The `derivativeStrategy: 'computed'` field on `MetricTensorNode` signals to numerical consumers that metric derivatives should be computed via finite differences. It does not mean AD-through-the-metric. This distinction matters for users who expect exact derivatives.

- **Bridge catalog and evaluator layers are separate**: A bridge entry in `BRIDGE_EQUATIONS` can exist without a corresponding `be-*.ts` evaluator module. The catalog is complete; the evaluator coverage is partial. Conflating the two would give a misleading picture of implementation progress.

---

## Testing Strategy

| Directory | Purpose |
|-----------|---------|
| `tests/unit/dimensional/` | Per-function validator and algebra tests |
| `tests/unit/bridges/` | Per-bridge dimension-validation and evaluator tests |
| `tests/numerical/` | Engine conformance suite (runs against both engines) |
| `tests/api/` | Public API stability snapshot (`public-surface.test.ts`) |
| `tests/integration/` | End-to-end flows (AST → validate → evaluate) |

The public API snapshot test (`tests/api/public-surface.test.ts`) enforces that no symbol is added to or removed from the public surface without a deliberate update to the snapshot. It checks both runtime value exports (`Object.keys(root)`) and type-only exports (via source-text grep on `src/index.ts` and `dist/index.d.ts`).

---

See `OVERVIEW.md` for the high-level orientation. See `COMPONENTS.md` for the per-file component breakdown. See `DATAFLOW.md` for concrete data-flow traces. See `API.md` for the public API reference.

---

**Maintained by**: Daniel Simon Jr.
