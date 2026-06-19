# Universal Physics Tensor — System Architecture

**Version**: 0.23.0 (package.json `0.23.0`; latest CHANGELOG release `[0.23.0]`) + unreleased post-0.23.0 work toward v0.24.0
**Last Updated**: 2026-06-19

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

v0.8.0 adds a **composition layer** beside the catalog: `src/composition/` is a graph-lite `Quantity`/`BridgeEdge`/`composeEdges` layer (with pre-registered calibration edges, including the first diagonal-law edge) whose first derived result (CT-1) chains BE-42∘BE-16 to E_min(M) = ℏc³ln2/(8πGM). v0.8.0 also makes catalog membership computable: `src/bridges/membership.ts` is the criterion, `src/bridges/rejected.ts` is the negative catalog (NOT-A-BRIDGE entries), and `src/bridges/be36-gw170817-confrontation.ts` is the first real-data confrontation. A generated JSON catalog artifact (`data/bridge-catalog.json`, `npm run catalog:json`) and a GitHub Actions CI workflow (`.github/workflows/ci.yml`) round out the release.

Three further milestones sit on top of v0.8.0 (all unreleased; a single rollup tag at final HEAD is the recommended release):

- **v0.9.0 (flat-metric hygiene sprint)**: the Schwarzschild fixture and Painlevé–Gullstrand metric closures migrated from nested `number[][]` to row-major `Float64Array` (`MetricFnFlat`; 1.56× single / 1.62× batch on the GL4 stage solve — see `benchmarks.md`); the five deferred-evaluator arms in `lowerNode` collapsed into `DEFERRED_EVALUATOR_REGISTRY` (S-9); a whole-repo strict typecheck gate (`tsc -p tsconfig.tests.json`) was introduced and its legacy-error baseline driven to empty.
- **v0.10.0 (Part-IX Phase C/D closure)**: `enumerateCompositions` (the Phase-D enumerator) and `propagateUncertainty` (first-order, central-difference-Jacobian uncertainty propagation, incl. `confrontBE36WithUncertainty`) landed in `src/composition/`; the graph grew 9 → 15 edges via `edges/catalog-tranche.ts`; flux Rule 3 (Causality) was promoted WARNING → ERROR in `src/core/flux-rules.ts`; dated v0.4.x–v0.7.x records moved to `docs/architecture/archive/`.
- **v0.11.0 sprint (open items)**: the namespacing gate (`CompositionAliasError` name-collision rule, `SOURCE_ALIAS_DISPOSITIONS` disposition registry, centralized `quantities.ts` with 131 uniqueness-pinned `Quantity` nodes); the full catalog→graph migration (`edges/catalog-full.ts`, +26 edges → 41 total); O-4 (`computeKretschmann`/`WeylInputs` widened to `number[][] | Float64Array`) plus the exact factored index-raising rewrite (29.8× — see `benchmarks.md`); the Klein-Gordon dispersion evaluator (`src/numerical/klein-gordon.ts`); and the second real-data confrontation (`src/bridges/be23-planckian-confrontation.ts`, BE-23 vs. overdoped-cuprate Planckian dissipation).

### Key Statistics (v0.23.0 + unreleased post-0.23.0 work)

Numbers extracted from `docs/architecture/dependency-graph.json` (authoritative output of the `create-dependency-graph` tool; regenerated 2026-06-19).

| Metric | Value |
|--------|-------|
| Source files | 176 TypeScript files |
| Modules | 8 (`bridges`, `canonical`, `composition`, `core`, `diff`, `dimensional`, `numerical`, `entry`) |
| Total exports | 1259 (492 re-exports) |
| Bridge catalog entries | 44 (IDs 11–54) |
| Per-bridge evaluator modules | 44 (every bridge has an `evaluate*` function — see `bridge-coverage-audit.md`) |
| Composition-graph edges | 41 `BridgeEdge` constants (9 calibration + 6 catalog-tranche + 26 catalog-full), assembled once as the public `CATALOG_GRAPH` |
| TensorEngine implementations | 2 (`Float64ReferenceEngine`, `MathTSEngine`) |

### Module Distribution

| Module | Files | Responsibility |
|--------|-------|----------------|
| `bridges/` | 56 | Bridge catalog index + per-bridge evaluator modules + the (v0.14) `BridgeEquations` convenience facade gathering every `evaluate*()` under readable method names + membership criterion / negative catalog (v0.8.0) + GW170817 (v0.8.0) and BE-23 Planckian (v0.11) data confrontations + the (internal) empirical-coverage audit (v0.12) |
| `canonical/` | 11 | Canonical-equation registry — the textbook **L-layer** ground truth bridges are validated against: the `CanonicalEquation` type (L0/L1/L2 fidelity), the assembled registry + accessors + coverage helpers, the Buckingham-derived L0 fields, the per-equation entry modules, the structural normal-form hash + bridge↔canonical linkage (the F4 circularity guard; stub-identity-tagged so `ln2` ≠ `ln⟨e^−βW⟩`), and the tensor seeder |
| `composition/` | 27 | Graph-lite `Quantity`/`BridgeEdge`/`composeEdges` layer (v0.8.0) + centralized quantity nodes, alias dispositions, Phase-D enumerator, uncertainty propagation, the identifiability classifier, the retrodiction harness, the unified `explainQuantity` entry point, the (internal) bridge-analysis triage + linkage-map + link-candidate layer, the 41-edge graph assembled as `CATALOG_GRAPH`, (v0.23) the canonical-only graph `CANONICAL_GRAPH` that runs the discovery funnel on standard physics alone, (v0.12) the internal `UniversalTensor`-backed bridge-prediction + the candidate-vetting discovery loop (with anchor-derived + sourced representative-value magnitude gating), (unreleased) the **identity-consequence surfacer** `proposed-bridges.ts` (`deriveProposedBridges`/`PROPOSED_BRIDGES` — `upt discover --derive`), and (v0.12) SYMBOLIC composition — `composeSymbolic` over optional `symbolic` ExprNode forms, the Observable contract, the scalar `evalExpr` + `substitute` primitives, and the optional MathTS-backed `simplifyExpr`/`simplifyObservable` (v0.10–v0.12) |
| `dimensional/` | 28 | SI dimensional types, algebra, AST, validator, metric + connection + curvature layer + the Buckingham-π enumerator + the (internal) dimension-spec parser |
| `numerical/` | 39 | TensorEngine interface, engines, lowering, geodesic + GL4 integrators, perihelion finder, Killing/Einstein/Kretschmann evaluators, Klein-Gordon dispersion evaluator (v0.11), the (internal) scalar-formula parser — self-contained (Path B) + MathTS-backed (Path A) behind a `FormulaParser` registry, plus the formula dimensional checker (Phase 2, default-on via either parser AST), the geometrized-units boundary adapters (`toGeometrized`/`fromGeometrized`/`geometrizedFactor`, dimension-functor-driven `G^M·c^(T−2M)`) — internal in v0.13 (G-9 increment 1), promoted to the public API in v0.14 (G-9 increment 2); the default-pipeline migration (increment 3) was declined as a measured no-precision-win — and (unreleased) the new `input-validation.ts` leaf (input validator moved here from `bridges/` to drop the `numerical→bridges` upward dependency; `grid-field.ts` is now a thin re-export with `GridField` moved into `numerical/types.ts`) |
| `core/` | 11 | `UniversalTensor` class, `PhysicalConstants` lookup, flat `*_SI` constants, v0.7 `LabeledTensor`/`Cell`/regime-registry layer (flux Rule 3 ERROR-tier since v0.10.0; v0.14 added `LabeledTensor`'s explicit `axisOrder` invariant + `axisOf` and the `mergeAxes`/`splitAxis` rank-changing reshape) |
| `diff/` | 3 | v0.7 bridge-gradient layer — analytic `bridgeGradient`, the AST-gradient path (`bridgeGradientAST`), and the bridge specs |
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

### `bridges/` (56 files)

The bridges module has two distinct layers that should not be confused:

**Index layer** (`src/bridges/index.ts`): The machine-readable catalog. Contains `BRIDGE_EQUATIONS` — a 44-entry array of `BridgeEquationEntry` objects carrying spec-level metadata (id, name, status, known issues, tractability class, references, dependencies, dimensional signature). This file has no evaluator logic; it is the authoritative source of truth for the catalog. Type exports (`BridgeEquationEntry`, `BridgeEquationStatus`, `BridgeIssueSeverity`, etc.) describe the catalog shape.

**Evaluator layer** (`src/bridges/equations/be-*.ts`): Per-bridge evaluator modules. Each module builds the equation's LHS and RHS as `ExprNode` trees, exports a `validate*Dimensions()` helper that calls `validateEquation(LHS, RHS)`, and exports an `evaluate*()` function that calls `evaluateNumerical()` with a concrete `NumericalInputs` bundle. Following the Wave-Z evaluator buildout, all 44 catalogued bridges (IDs 11–54) now have an evaluator module — see `docs/architecture/bridge-coverage-audit.md`. (The v0.4.0-era doc described only the original eight; that snapshot is superseded.)

**Membership layer** (v0.8.0): `src/bridges/membership.ts` makes catalog membership computable — *a bridge is an edge whose endpoint quantities differ in at least one regime attribute* (`adjudicateBridgeEntry` / `adjudicateCatalog`). `src/bridges/rejected.ts` is the negative catalog: BE-28/29/32/35/40 are adjudicated NOT-A-BRIDGE there, while BE-44/46/50 remain contested/unadjudicated. The v0.8.0 Phase-4 adjudication **reversed** BE-42 (Hawking temperature) from NOT-A-BRIDGE back to a bridge (`['gravity','quantum']`). Full disposition: `docs/architecture/v0.8.0-catalog-adjudication.md`.

**Confrontation layer** (v0.8.0 → v0.11): `src/bridges/be36-gw170817-confrontation.ts` (v0.8.0) is the first real-data confrontation — GW170817 against the BE-36 GW-speed bound (with `confrontBE36WithUncertainty` added in v0.10.0). `src/bridges/be23-planckian-confrontation.ts` (v0.11) is the second — BE-23 SYK Planckian dissipation against overdoped-cuprate data (Legros et al. 2019; honest-aggregate encoding), `confrontBE23` / `confrontBE23WithUncertainty`.

### `composition/` (27 files, v0.8.0 → v0.23)

The graph-lite composition layer: `quantity.ts` (`Quantity` + `RegimeAttributes` + `regimesDiffer`), `edge.ts` (`BridgeEdge` with confidence and validity domain; also `CompositionAliasError`), `compose.ts` (`composeEdges` — the composition operator; note it is **not** named `compose`, which is the v0.7 Cell factory; since v0.11 it enforces the name-collision rule via `SOURCE_ALIAS_DISPOSITIONS` / `AliasDisposition`), `consistency.ts` (`consistencyRatio`), `quantities.ts` (v0.11 — the centralized quantity-node registry: 131 uniqueness-pinned `Quantity` constants, one object per canonical name; internal — not re-exported from the barrel), `enumerate.ts` (v0.10.0 — `enumerateCompositions`, the Phase-D candidate enumerator; its report partitions alias-colliding pairs into `requiresDisposition`), `uncertainty.ts` (v0.10.0 — `propagateUncertainty`, first-order central-difference-Jacobian propagation), `identifiability.ts` (`classifyIdentifiability` / `classifyAll` / `forwardClosure` — the structural over/exactly/under-determined classifier over the directed edge hypergraph; counts independent derivations of a target from a known set, with a target-removed closure excluding circular self-support), `retrodiction.ts` (`retrodict` / `retrodictNode` — the framework's own falsification benchmark: mask an over-determined node, recompute it via each independent derivation from ground-truth inputs, and check the predictions agree; the over-determined verdict made numerical), `explain.ts` (`explainQuantity` — the unified entry point that synthesizes the identifiability classifier, the retrodiction harness, and the dimensional Buckingham-π layer into one `QuantityExplanation` with a plain-language summary: how the graph computes a target, whether the redundant derivations agree, the recovered value, and whether the known set is dimensionally sufficient), `bridge-analysis.ts` (INTERNAL — not on the public surface: `dimensionalFreedom` / `attemptDerivation` / `anchoringDistance` / `bridgePriority`, the structural-triage layer that ranks speculative bridges by *decidability* against the established core — a review-priority tool explicitly NOT a credibility score; surfaced by `npm run bridge-priority`), `compose-surface.ts` (v0.11 barrel for the namespacing-gate symbols), and three edge files under `edges/`: `calibration.ts` (9 edges — `be11ZurekEdge`, `be12Edge`, `be16Edge`, `be37Edge`, `be42Edge`, `be42ViaRsEdge`, `be51Edge`, `be52Edge`, plus `lawSchwarzschildRadius`, the first diagonal-law edge), `catalog-tranche.ts` (v0.10.0 T5 — 6 edges: BE-14/19/21/48/53/54), and `catalog-full.ts` (v0.11 — 26 edges completing the catalog→graph migration; `CATALOG_FULL_EDGES`). `catalog-graph.ts` assembles all three edge files into the single public `CATALOG_GRAPH` constant — the one source of truth the CLI and tests consume instead of rebuilding the edge list. `canonical-graph.ts` (v0.23) is the bridge-free counterpart: it projects the canonical-equation registry into the same `BridgeEdge` vocabulary as `CANONICAL_GRAPH` (constants baked into the evaluators, dimension-guarded), so the discovery/analysis funnel can run on standard physics alone (`upt discover --source=canonical`). Total graph: **41 edges**. BE-28/29/32/35/40 get no edges (NOT-A-BRIDGE per the negative catalog); BE-44 is skipped (array-input evaluator incompatible with the scalar-Record edge contract). The CT-1 calibration target derives E_min(M) = ℏc³ln2/(8πGM) from the BE-42∘BE-16 chain; CT-3 (v0.9.0) derives the Zurek decoherence scaling from BE-12∘BE-11.

### `dimensional/` (28 files)

The dimensional module is the heart of UPT's symbolic layer. Its responsibilities span four areas:

**SI type system** (`types.ts`): The `Dimension` interface — seven base SI dimensions (`L`, `M`, `T`, `I`, `Theta`, `N`, `J`) represented as a record of `number` exponents. Named dimension constants (`LENGTH`, `MASS`, `ENERGY`, etc.) are exported only when they have at least one concrete consumer (a bridge module or a test). This is a deliberate hygiene discipline: unreferenced constants are removed.

**Dimension algebra** (`algebra.ts`): Pure functions (`multiply`, `divide`, `power`, `add`, `subtract`, `equals`, `format`) that operate on `Dimension` values. `add` and `subtract` throw `DimensionMismatchError` if operands disagree — this is the mechanism that catches non-homogeneous equations.

**Scalar-formula parser** (`numerical/formula.ts`, `formula-mathts.ts`, `formula-registry.ts`, all INTERNAL): lets the `upt` CLI evaluate user-supplied closed-form scalar equations. `formula.ts` is the dependency-free, safe Path B parser; `formula-mathts.ts` is the MathTS-backed Path A parser (over `@danielsimonjr/mathts-functions`'s assembled mathjs engine, dynamically imported via the `mathts-functions.ambient.d.ts` optional-peer pattern); `formula-registry.ts` selects MathTS when it is installed and smoke-tests clean, else falls back to Path B — both behind the one `FormulaParser` interface, proven interchangeable by a shared conformance suite (their one accepted divergence: MathTS recognizes Euler's `e`).

**Buckingham-π enumerator** (`buckingham.ts`): `buckinghamPi` enumerates the dimensionless groups of a variable set (exact rational arithmetic — the null space of the dimension matrix; n − r groups), and `dimensionallyDetermines` answers whether a target is fixed by a governing set UP TO A DIMENSIONLESS CONSTANT, returning the (possibly rational) monomial. The principled primitive for the identifiability classifier's exactly-determined case; the result types carry FORM only — no value or constant field — enforcing the honest boundary between dimensional analysis and numerology. Pins the canonical results (pendulum T = const·√(L/g); r_s = const·GM/c²). `dimension-spec.ts` (INTERNAL) parses human dimension strings (named dims, constants, or explicit `L^3.M^-1.T^-2`) into `Dimension`s, so CLI users can declare a custom equation's dimensions without TypeScript.

**AST and validator** (`validator.ts`): The `ExprNode` union type (the AST), the `ValidationResult` interface, and the `validate()` / `validateEquation()` entry points. The validator is a recursive tree-walker that calls the algebra functions to infer the dimension at each node. Tensor-aware node kinds (`tensor-symbol`, `tensor-product`, `metric-tensor`, `kronecker-delta`, `tensor-partial-derivative`, `covariant-derivative`) and the curvature/equation node kinds (`riemann-tensor`, `ricci-tensor`, `einstein-tensor`, `bianchi-residual`, `killing-vector`, `conserved-charge`, `stress-energy-tensor`, `cosmological-constant`, `einstein-field-equation`, `weyl-tensor`, `kretschmann-scalar`) delegate to specialized sub-validators in `tensor.ts`, `metric-validators.ts`, `connection-validators.ts`, `curvature.ts`, `weyl-validators.ts`, `curvature-invariants.ts`, and `einstein-equation.ts`. The validator tracks free (uncontracted) indices in a mutable `Map` that threads through the recursion.

**Metric and connection layer** (`metric.ts`, `metric-validators.ts`, `connection.ts`, `connection-validators.ts`): Types and validators for the tensor-specific AST kinds introduced in v0.3.0 (metric tensor, Kronecker delta, tensor partial derivative) and v0.4.0 (covariant derivative, `RiemannTensorNode`). The `christoffel()` function in `connection.ts` builds the Γ^λ_μν formula as a composite `ExprNode` tree from the user-supplied metric nodes.

**Curvature layer** (`curvature.ts`, `curvature-composite.ts`, `curvature-invariants.ts`, `weyl-validators.ts`, `einstein-equation.ts`): The v0.5.0/v0.6.0 GR curvature AST. `curvature.ts` houses the Ricci/Einstein/Bianchi validators and the `ricci`/`einstein`/`bianchiResidual` helpers; `curvature-composite.ts` is the shipped `CurvatureCompositeNode<K,S>` factory + `CURVATURE_KIND_REGISTRY` that all six curvature node kinds (Riemann, Ricci, Einstein, Bianchi, Weyl, Kretschmann) are built from; `curvature-invariants.ts` defines `KretschmannScalarNode` + its validator; `weyl-validators.ts` defines `WeylTensorNode`; `einstein-equation.ts` defines the `EinsteinFieldEquationNode` predicate + `validateEinsteinFieldEquation`.

### `numerical/` (39 files, v0.3.5 → unreleased)

The numerical module implements the evaluation backend.

**TensorEngine interface** (`tensor-engine.ts`): The compute contract. Defines `EngineTensor` (an opaque rank-N tensor handle), `EinsumSpec` (the engine-agnostic contraction plan), and `TensorEngine` (the interface both engines satisfy). Also defines `ForwardGradResult` / `ReverseGradResult` and `hasAutogradSupport()`.

**Float64ReferenceEngine** (`float64-engine.ts`): The zero-dependency, Float64Array-backed reference implementation. Naive O(n) algorithms: a correctness baseline, not a performance target. Includes inline dual-number forward-mode AD and tape-recording reverse-mode AD.

**MathTSEngine adapter** (available via the `universal-physics-tensor/numerical/mathts-engine` subpath export, not from the main index): The adapter wrapping `@danielsimonjr/mathts-tensor`. Not imported at main index level to avoid forcing the optional dependency on all consumers.

**Lowering** (`lowering.ts`): Translates an `ExprNode` tree into a sequence of `TensorEngine` calls. This is the bridge between the symbolic layer and the numeric layer. Since v0.9.0 (S-9) the deferred-evaluator node kinds are dispatched through `DEFERRED_EVALUATOR_REGISTRY` — a registry-consulting default arm with compile-time exhaustiveness — instead of five hand-written switch arms.

**Geodesic integrators** (`geodesic-integrator.ts`, `gl4-integrator.ts`): `geodesic-integrator.ts` is the fixed-step RK4 integrator — takes a Christoffel-symbol closure `(x) => Γ[μ][ν][ρ]` and integrates the (x, v) phase-space system forward in proper time. `gl4-integrator.ts` (v0.5.0) is the GL4 (Gauss–Legendre 4th-order) symplectic integrator: an energy-conserving alternative for long-time integration. Neither has a `TensorEngine` dependency — both are self-contained and operate on plain JS arrays.

**Perihelion finder** (`perihelion-finder.ts`): v0.5.0 bisection-based finder that locates the perihelion of a geodesic trajectory; underpins the BE-52 Mercury demonstration.

**Curvature / GR evaluators** (v0.6.0): `killing.ts` provides `verifyKillingEquation` and `evaluateConservedCharge`; `einstein-equation.ts` provides `evaluateEinsteinEquationResidual` (the scale-normalized Einstein field-equation residual); `kretschmann.ts` provides `computeKretschmann` (the Kretschmann-scalar contraction — since the v0.11 O-4 pass it accepts `number[][] | Float64Array` metric inputs and uses an exact factored index-raising algorithm, 29.8× over the naive O(4⁸) contraction; see `benchmarks.md`); `christoffel-flat.ts` provides `christoffelFnFlat` (the flat-layout Christoffel accessor introduced by the BR-2 migration). The lowering of curvature AST node kinds is handled by `curvature-lowering-helpers.ts` (home of the v0.9.0 `MetricFnFlat` alias — metric closures returning row-major `Float64Array(16)`, the layout the Schwarzschild fixture and Painlevé–Gullstrand metrics migrated to in v0.9.0).

**Klein-Gordon dispersion evaluator** (`klein-gordon.ts`, v0.11): `evaluateKGDispersionResidual` + `verifyKleinGordonPlaneWave` — the plane-wave-sector numerical companion to the dimensional layer's `KleinGordonEquationNode` (G-7 closure).

**Engine registry** (`engine-registry.ts`): `getActiveEngine()` / `setActiveEngine()` — global active-engine management for the `evaluateNumerical()` default-engine path.

### `core/` (11 files)

The core module contains the `UniversalTensor` class (the original high-level facade, predating the dimensional and numerical layers), the `PhysicalConstants` lookup (SI values of G, c, ℏ, k_B, etc.), and `constants.ts` — the v0.5.1 flat CODATA 2018 / SI-defined constants (`C_SI`, `G_SI`, `HBAR_SI`, …), the single source of truth for physical constants across the numerical, dimensional, and bridge layers. The `UniversalTensor`/`PhysicalConstants` parts are the oldest in the codebase and predate the AST-first design; they remain on the public surface for backward compatibility. v0.7.x added the intelligent-index / regime layer here (`labeled-tensor.ts`, `axes-registry.ts`, `universal-index.ts`, `cell.ts`, `flux-rules.ts`, `regime-registry.ts` and the regime builtins) — see `docs/architecture/intelligent-index-tutorial.md`. In the unreleased post-0.23.0 DGT refactor, the former `cell.ts`↔`tensor.ts` runtime cycle was eliminated by co-locating the `compose()` factory with `UniversalTensor` in `tensor.ts`; runtime circular dependencies are now **0**. Two type-only cycles remain (`validator.ts`↔`tensor.ts` and `validator.ts`↔`curvature.ts` — the recursive-AST `ExprNode` union; erased at runtime, documented intentional).

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

The index module (`src/bridges/index.ts`) re-exports the v0.4.0 flagship evaluator functions (`evaluateGravitationalLensing`, `evaluatePerihelionPrecession`) alongside the `BRIDGE_EQUATIONS` catalog array. Bridge metadata in the catalog (`dimensional_signature`, `status`, `known_issues`) is maintained by hand, informed by the per-module validators — there is no code-generation path from module outputs to catalog entries. Since v0.8.0 the catalog is also published as a generated JSON artifact (`data/bridge-catalog.json`, regenerated via `npm run catalog:json` and schema-checked against `data/bridge-catalog.schema.json`), and bridge-vs-law membership is adjudicated mechanically by `membership.ts` with the `rejected.ts` negative catalog as overlay (see `v0.8.0-catalog-adjudication.md`).

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

- **Bridge catalog and evaluator layers are separate**: A bridge entry in `BRIDGE_EQUATIONS` can exist without a corresponding `be-*.ts` evaluator module. (Since the Wave-Z buildout the two happen to coincide — all 44 catalogued bridges have evaluators — but the layers remain architecturally distinct, and conflating them would give a misleading picture if they ever diverge again.)

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

Since v0.8.0 the suite also includes fast-check property tests (e.g., dimension-algebra and composition properties) and runs in CI via `.github/workflows/ci.yml` — build + full test suite on push, plus (since v0.10.0) the strict whole-repo typecheck gate `npx tsc -p tsconfig.tests.json` (introduced in v0.9.0 as a diff-gate against 71 baselined legacy errors; the baseline was driven to empty in the v0.9.0 second pass, so the gate is now fully strict). Suite size (2026-06-19, package.json 0.23.0 + `[Unreleased]` work): **2841 passed / 4 skipped / 1 todo** (2846 tests) across 277 test files (276 passed + 1 skipped); `tsc` clean. Test coverage 92.0% (162/176 source files directly imported by a test — see `TEST_COVERAGE.md`). Contribution conventions live in `CONTRIBUTING.md` (new in v0.8.0).

---

See `OVERVIEW.md` for the high-level orientation. See `COMPONENTS.md` for the per-file component breakdown. See `DATAFLOW.md` for concrete data-flow traces. See `API.md` for the public API reference.

---

**Maintained by**: Daniel Simon Jr.
