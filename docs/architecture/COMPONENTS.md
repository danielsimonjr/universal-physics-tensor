# Universal Physics Tensor — Component Reference

**Version**: 0.27.0 (package.json `0.27.0`; latest CHANGELOG release `[0.27.0]`)
**Last Updated**: 2026-06-20

---

## Table of Contents

1. [Overview](#overview)
2. [Bridge Module](#bridge-module)
3. [Composition Module (v0.8.0 → v0.13)](#composition-module-v080--v013)
4. [Canonical Module (v0.11+)](#canonical-module-v011)
5. [Dimensional Module](#dimensional-module)
6. [Numerical Module](#numerical-module)
7. [Curvature / GR Module (v0.5.0 → v0.6.0)](#curvature--gr-module-v050--v060)
8. [Core Module](#core-module)
9. [Entry Point](#entry-point)
10. [Component Dependencies](#component-dependencies)
11. [Curvature composite layer (v0.5.0 → v0.6.0)](#curvature-composite-layer-v050--v060)

---

## Overview

UPT follows a layered architecture. The 187 source files fall into eight modules whose responsibilities are strictly separated: `bridges` catalogs, evaluates, and (since v0.8.0) adjudicates physics equations, `canonical` is the textbook L-layer registry bridges are validated against (v0.11+), `composition` is the graph-lite bridge-composition layer (v0.8.0, grown through v0.11 to the full 41-edge graph, plus the canonical-only graph that runs the discovery funnel on standard physics alone), `dimensional` provides the symbolic layer (including the connection + curvature AST), `numerical` provides the compute layer (including the GR integrators and evaluators), `core` holds legacy high-level utilities, the flat constants, and the v0.7 intelligent-index / regime layer, `diff` is the v0.7 bridge-gradient layer, and `entry` is the public re-export surface.

```
┌────────────────────────────────────────────────────────────────┐
│  entry/            │  Public re-export surface (1 file)        │
├────────────────────────────────────────────────────────────────┤
│  bridges/          │  Catalog index + per-bridge evaluators +  │
│                    │  membership criterion / negative catalog  │
│                    │  + GW170817 + BE-23 Planckian data        │
│                    │  confrontations (57 files)                │
├────────────────────────────────────────────────────────────────┤
│  canonical/        │  Canonical L-layer registry + entries +   │
│                    │  dimensional fields + normal-form hash +  │
│                    │  bridge↔canonical linkage (F4 guard) +    │
│                    │  tensor seeder (16 files, v0.11+)         │
├────────────────────────────────────────────────────────────────┤
│  composition/      │  Quantity / BridgeEdge / composeEdges +   │
│                    │  centralized quantities + alias           │
│                    │  dispositions + enumerator + uncertainty  │
│                    │  + identifiability + retrodiction +       │
│                    │  explainQuantity + bridge-analysis +      │
│                    │  discovery + CATALOG_GRAPH (30 files)     │
├────────────────────────────────────────────────────────────────┤
│  dimensional/      │  SI types / algebra / AST / validator /   │
│                    │  metric, connection, curvature layer +    │
│                    │  Buckingham-π + dim-spec (29 files)       │
├────────────────────────────────────────────────────────────────┤
│  numerical/        │  TensorEngine / engines / lowering /      │
│                    │  RK4 + GL4 integrators / perihelion       │
│                    │  finder / Killing / Einstein / Kretschmann│
│                    │  / Klein-Gordon / formula / geometrized    │
│                    │  (39 files)                               │
├────────────────────────────────────────────────────────────────┤
│  core/             │  UniversalTensor class + PhysicalConstants│
│                    │  + flat *_SI constants + v0.7 Labeled-    │
│                    │  Tensor / Cell / regime layer (11 files)  │
├────────────────────────────────────────────────────────────────┤
│  diff/             │  bridgeGradient + AST gradient + bridge   │
│                    │  specs (3 files, v0.7)                    │
└────────────────────────────────────────────────────────────────┘
```

**Total**: 187 TypeScript files | 1335 exports (545 re-exports) | 44 bridge catalog entries (IDs 11–54) | 44 bridge evaluator modules (every catalogued bridge has an `evaluate*` function) | 41 composition-graph edges (+ 66 canonical-only `law` edges via `CANONICAL_GRAPH`) | 3 real-data confrontations (BE-23, BE-36, BE-52)

(Authoritative numbers from `docs/architecture/dependency-graph.json`, regenerated 2026-06-19 (`npm run docs:deps`) after the discovery-funnel hardening + the `CE-jarzynski` canonical entry + normal-form stub-identity tagging.)

---

## Bridge Module

### `BRIDGE_EQUATIONS` array (`src/bridges/index.ts`)

The 44-entry catalog array of `BridgeEquationEntry` objects. Each entry carries: `id` (11–54), `name`, `category` / `category_name`, `bridges` (the two bridged regimes), `status` (`established` / `speculative` / `highly-speculative` / `invalid`), `context` (1–2 sentence summary), `formula_latex`, `source_part`, `known_issues`, `references`, `dependencies` (ids of other bridge entries explicitly referenced), `dimensional_signature` (null for entries not yet dimensionally encoded), and `tractability_class`. The array is the source of truth for catalog metadata; per-bridge evaluator modules supplement it with runnable code.

### `BridgeEquationEntry` type (`src/bridges/index.ts`)

The shape of a single catalog entry. Carries all spec-level metadata described above. Consumers who only need catalog queries (filter by status, look up known issues) import this type and `BRIDGE_EQUATIONS` — they never need to touch the dimensional or numerical layers.

### `BridgeEquationStatus` / `BridgeIssueSeverity` / `BridgeIssueFixable` (`src/bridges/index.ts`)

Discriminated string union types for the `status`, severity, and fixability fields of catalog entries. `isActiveStatus(s)` is a type predicate that excludes the `'invalid'` arm — note it is defined in `src/bridges/index.ts` but is **not** re-exported from `src/index.ts`, so it is not on the main package's public surface.

### `BridgeTractabilityClass` (`src/bridges/index.ts`)

Classifies how computationally tractable a bridge equation is: `'closed-form'` (O(1) algebraic evaluation), `'numerical-tractable'` (polynomial-time algorithm), `'numerical-asymptotic'` (diverging asymptotic series), `'formally-divergent'` (not Turing-computable, e.g. cosmological constant), `'undefined'` (not yet classified).

### Per-bridge evaluator modules (`src/bridges/equations/be-*.ts`)

Following the Wave-Z evaluator buildout, every catalogued bridge (all 44, IDs 11–54) has an evaluator module — see `docs/architecture/bridge-coverage-audit.md`. Each exports:
- **LHS / RHS AST constants** — the `ExprNode` trees for the left- and right-hand sides.
- **`validate*Dimensions(): DimensionValidationReport`** — calls `validateEquation(LHS, RHS)` and returns `{ ok, lhsDim, rhsDim }`.
- **`evaluate*(inputs): Promise<Result>`** — wraps `evaluateNumerical()` with a typed inputs interface and a named-field result type.
- **Typed inputs interface** — e.g., `DecoherenceRateInputs`, `GravitationalLensingInputs`.

The modules do not share a base class; the pattern is by convention. See `ARCHITECTURE.md §Bridge Catalog Architecture` for the full per-module pattern.

### `BridgeEquations` facade (`src/bridges/bridge-equations.ts`, v0.14)

A root-level convenience object gathering every per-bridge `evaluate*()` function under readable method names — e.g. `BridgeEquations.decoherenceRate({...})` (BE-11), `.hawkingTemperature({ M_kg })` (BE-42). Each method is a 1:1 pass-through to the existing pure evaluator (no new physics); TypeScript infers the per-method input/return types structurally, so it adds exactly one runtime export. The archived BE-25 OrchOR is excluded (BE-25 maps to the live IIT `intrinsicInformation`); BE-51 has no evaluator and is intentionally absent.

### `evaluateGravitationalLensing` / `evaluatePerihelionPrecession` (`src/bridges/index.ts` re-export)

The v0.4.0 flagship bridge evaluators, re-exported from the main index. Both take typed input bundles and return typed result objects. Inputs include metric parameters (Schwarzschild radius, orbital semi-latus rectum, etc.); outputs include deflection angle (lensing) or precession per orbit (perihelion).

### `adjudicateBridgeEntry` / `adjudicateCatalog` (`src/bridges/membership.ts`, v0.8.0)

The computable bridge-membership criterion: *a bridge is an edge whose endpoint quantities differ in at least one regime attribute; a law is an edge whose endpoints share all stated regime attributes*. For catalog entries the `bridges: [a, b]` tuple is the proxy, with the negative catalog as overlay. Returns a `BridgeVerdict` (`'bridge' | 'not-a-bridge' | 'unadjudicated'`) per entry, or a whole-catalog `CatalogAdjudicationReport`. Re-exported from `src/index.ts` directly from `membership.ts` (the interim `membership-surface.ts` barrel was merged away in the v0.8.0 pre-tag punch-list).

### `REJECTED_BRIDGE_ADJUDICATIONS` / `REJECTED_BRIDGE_IDS` (`src/bridges/rejected.ts`, v0.8.0)

The negative catalog — entries adjudicated NOT-A-BRIDGE with per-id reasons: BE-28, BE-29, BE-32, BE-35, BE-40. The v0.8.0 Phase-4 adjudication REVERSED BE-42 (Hawking temperature) to a bridge (`['gravity','quantum']`); BE-44/46/50 remain contested/unadjudicated. Full disposition: `docs/architecture/v0.8.0-catalog-adjudication.md`.

### `confrontBE36` / `GW170817` (`src/bridges/be36-gw170817-confrontation.ts`, v0.8.0)

The first real-data confrontation in the codebase: the GW170817 multi-messenger observation (`GW170817`, a `GWSpeedObservation` constant) confronted against the BE-36 GW-speed bound. Returns a `BE36ConfrontationResult`. Re-exported from `src/index.ts`. v0.10.0 added `confrontBE36WithUncertainty`, which propagates the observational uncertainty (Δt = 1.74±0.05 s) through `propagateUncertainty`.

### `confrontBE23` / `PLANCKIAN_CUPRATES` (`src/bridges/be23-planckian-confrontation.ts`, v0.11)

The second real-data confrontation: BE-23 SYK Planckian dissipation against the overdoped-cuprate aggregate of Legros et al. 2019 (`PLANCKIAN_CUPRATES`, a `PlanckianObservation` constant; `PLANCKIAN_O1_BAND` is the O(1) acceptance band). Honest-aggregate encoding — no fabricated per-material table. `confrontBE23` returns a `BE23ConfrontationResult`; `confrontBE23WithUncertainty` adds first-order uncertainty propagation. All re-exported from `src/index.ts`.

---

## Composition Module (v0.8.0 → v0.13)

The graph-lite bridge-composition layer (`src/composition/`): bridges as typed graph edges over physical quantities, composable into multi-bridge chains. Now 31 files; the graph stands at **41 edges** (9 calibration + 6 catalog-tranche + 26 catalog-full).

### `Quantity` / `RegimeAttributes` / `regimesDiffer` (`src/composition/quantity.ts`)

A `Quantity` is a graph endpoint — a physical quantity with a `Dimension` and stated regime attributes. `regimesDiffer(a, b)` is the graph-native form of the membership criterion.

### `BridgeEdge` / `EdgeConfidence` / `ValidityDomain` (`src/composition/edge.ts`)

A directed edge between two `Quantity` endpoints carrying the bridge's transfer function, confidence tier, and validity domain. `evaluateEdge` applies an edge; the `CompositionDimensionError` / `CompositionJunctionError` / `DomainViolationError` classes also live here, joined in v0.11 by `CompositionAliasError` (thrown when a name collision between composed operands' source quantities has no recorded disposition).

### `composeEdges(...)` (`src/composition/compose.ts`)

The composition operator — chains compatible edges into a derived edge, checking junction compatibility and quantity identification (`QUANTITY_IDENTIFICATIONS`, `QuantityIdentification`) and combining confidence tiers via `minConfidence`. Note the name: `composeEdges`, **not** `compose` (`compose` is the v0.7 Cell factory in `core/`). Since v0.11 it enforces the **namespacing gate** (Option D): same-named source quantities across the two operands throw `CompositionAliasError` unless an `AliasDisposition` (`'shared'` or `{renameSecond}` with input remap) is recorded in the reviewable `SOURCE_ALIAS_DISPOSITIONS` registry or passed via `opts.aliases`.

### `consistencyRatio(...)` (`src/composition/consistency.ts`)

Compares a composed chain's prediction against an independent direct route and returns the dimensionless ratio.

### Centralized quantity nodes (`src/composition/quantities.ts`, v0.11)

The single home of every graph endpoint: **131** `Quantity` constants (`export const *Q: Quantity`), one object per canonical name, with name uniqueness pinned by `tests/composition/quantities.test.ts`. Naming judgments where the physics differs from an existing node are recorded here (e.g., BE-23/BE-26 carrier/proton masses are `effective-mass` / `tunneling-mass`, not the gravitational `mass`). Internal — the nodes are consumed by the edge files and are not re-exported from the composition barrel.

### `enumerateCompositions(...)` (`src/composition/enumerate.ts`, v0.10.0)

The Phase-D candidate enumerator: walks all ordered edge pairs, attempts composition, and returns an `EnumerationReport` partitioning the pairs into valid `CompositionCandidate`s (split against `REGISTERED_COMPOSITION_IDS` into registered vs. novel), dimension/junction failures, and — since v0.11 — `requiresDisposition` (`DispositionRequired[]`: alias collisions correctly held at the namespacing gate). Over the 15-edge v0.10.0 graph it surfaced 2 novel candidates (`docs/research/v0.10.0-novel-candidates.md`); over the full 41-edge graph, 11 compositions with 7 novel candidates (`docs/research/v0.11.0-novel-candidates.md`).

### `propagateUncertainty(...)` (`src/composition/uncertainty.ts`, v0.10.0)

First-order uncertainty propagation via a central-difference Jacobian over an edge's transfer function — works on composed edges for free. Returns an `UncertaintyResult`. Underpins `confrontBE36WithUncertainty` and `confrontBE23WithUncertainty`.

### `classifyIdentifiability(...)` / `classifyAll(...)` / `forwardClosure(...)` (`src/composition/identifiability.ts`)

The structural identifiability classifier. Given a known-quantity-name set and a target name over an edge set, it counts the target's INDEPENDENT derivations and returns an `IdentifiabilityResult` with a four-way `IdentifiabilityVerdict`: `under-determined` (target unreachable — with a `blockingFrontier` of upstream gaps), `exactly-determined` (one derivation), `over-determined` (≥2 — the surplus are falsifiable consistency constraints), or `given` (target in the known set). `forwardClosure` is the monotone determinability primitive (honoring `QUANTITY_IDENTIFICATIONS` as directed name-equivalences, mirroring `composeEdges`); derivation counting uses a target-removed closure to exclude circular self-support. Structural, not parametric — see `docs/planning/Identifiability-Classifier-Design-Note.md`. Real-graph anchor: from `{mass}`, `hawking-temperature` is over-determined (be-42 and be-42-via-rs).

### `retrodict(...)` / `retrodictNode(...)` (`src/composition/retrodiction.ts`)

The framework's own falsification benchmark — the numerical counterpart of the identifiability classifier's `over-determined` verdict. Given ground-truth quantity values, it MASKS each over-determined node (recomputes source values over the graph with every edge into that node removed), recovers the node via each independent derivation through the domain-checked `evaluateEdge`, and scores the relative spread of the predictions. Outcomes: `consistent` (≥2 derivations agree ≤ tolerance), `inconsistent` (disagree — a real falsification), `single`, `unrecoverable`. Returns a `RetrodictionReport` with the headline `allConsistent` gate; `classifyAll` is the feeder for the swept node set. Optional external `references` add textbook-value scoring (`referencePass`). Pass bar pre-registered (spread ≤ 1e-6) in `docs/planning/Retrodiction-Harness-Design-Note.md`. Pre-registered anchor: from `{mass: M_sun}`, `hawking-temperature` is `consistent` (be-42 vs be-42-via-rs agree to float precision) and recovers the ≈ 6.17×10⁻⁸ K solar-mass value.

### `explainQuantity(...)` (`src/composition/explain.ts`)

The unified "explain this quantity" entry point — synthesizes the three inference primitives into one `QuantityExplanation`. Given a target and a known set (names, or `name → value`), it runs the identifiability classifier (how the graph computes the target), the retrodiction harness (whether the redundant derivations agree, and the recovered value — when values are supplied), and the dimensional Buckingham-π layer (`dimensionallyDetermines` on the known set — whether the inputs are dimensionally sufficient, independent of the graph), and composes a plain-language `summary`. The three answer complementary questions: e.g. for `hawking-temperature` from `{mass: M_sun}` the summary reports it is over-determined (be-42, be-42-via-rs), the derivations agree, the value is ≈ 6.17×10⁻⁸ K, AND that mass alone is not dimensionally sufficient (the evaluator carries ℏ, c, G, k_B). Per-derivation values come from the retrodiction predictions; `extraDimensions` lets the dimensional layer test a known set richer than the graph's nodes (e.g. raw `G`, `c`). Each derivation is reported full-chain: `leafInputs` traces the immediate `sources` back through every intermediate to the leaf inputs (e.g. be-42-via-rs's last-hop source `schwarzschild-radius` traces to the `mass` leaf), with an optional `dimensionalForm` monomial in those leaves. Surfaced for non-TypeScript users by the `upt` CLI (`bin/upt.mjs`, `npm run upt -- explain <quantity> …`, or `npm run explain`).

### `bridge-analysis.ts` (INTERNAL — not on the public surface)

A meta/analysis layer (like the catalog adjudicator) that combines the dimensional engine with the graph to TRIAGE the speculative bridges by *decidability against established physics* — `dimensionalFreedom` (free dimensionless parameters), `attemptDerivation` (does the equation re-derive as a recognized monomial with a clean constant — `grounded`/`empirical`/`decoy`/`open`), `anchoringDistance` (graph distance to the established-confidence core), and `bridgePriority` (the composite scorecard, Tier 1–3). Deliberately NOT re-exported from `src/index.ts`. **Explicitly a review/confrontation-priority ranking, NOT a credibility score** — the signals are orthogonal to whether a bridge is true (the docstring and `docs/research/Bridge-Priority-Scorecard.md` carry the caveat). Surfaced by `npm run bridge-priority`; pinned by `tests/composition/bridge-priority.test.ts`.

It also hosts `linkageMap(edges)` — the connected-component map of the catalog graph (edges linked by shared quantities, honoring `QUANTITY_IDENTIFICATIONS`): clusters (largest first, each with its status mix, link hubs, and an `anchored` flag), the isolated tail, and the composition count. Reveals the catalog's hub-and-spoke structure — one dominant anchored cluster of 16 hubbed on `mass`/`temperature`, two small thematic clusters, 20 isolated edges. Surfaced by `upt map`; recorded in `docs/research/Catalog-Linkage-Map.md`; pinned by `tests/composition/linkage-map.test.ts`. A structural map, NOT a credibility signal.

And `proposeLinkCandidates(edges)` — using the map to propose candidate identifications: every pair of quantities in DIFFERENT clusters sharing a non-dimensionless dimension (the kind of link the Hawking-temperature ≡ temperature identification was), tagged with `touchesCore` and `sameKind` (shared name token). ⚠ A coincidence-heavy REVIEW SURFACE, NOT discovered bridges: 132 candidates → 98 core-touching → 36 same-kind, of which ~34 are still coincidences (`decoherence-rate ≟ hubble-rate`) or pairs the catalog deliberately keeps distinct (`effective-mass ≠ mass`); the genuinely-motivated few (e.g. `coarsening-length ≟ quantum-correlation-length`, linking the isolated Model-A coarsening bridge to the Kibble–Zurek cluster) go to human review. Surfaced by `upt candidates`; written up in `docs/research/Linkage-Candidate-Proposals.md`; pinned by `tests/composition/link-candidates.test.ts`.

### `compose-surface.ts` barrel (v0.11)

The surface barrel for the namespacing-gate symbols (`CompositionAliasError`, `SOURCE_ALIAS_DISPOSITIONS`, `AliasDisposition`, `DispositionRequired`) — keeps `src/index.ts` one-import-per-area while the implementations live in `edge.ts` / `compose.ts` / `enumerate.ts`.

### Calibration edges (`src/composition/edges/calibration.ts`)

Pre-registered edges for the calibration targets: `be16Edge` (Landauer), `be42Edge` / `be42ViaRsEdge` (Hawking T), `be51Edge` (lensing), `be52Edge` (perihelion), the v0.9.0 CT-3/CT-4 additions `be12Edge` (thermal de Broglie), `be11ZurekEdge` (Zurek decoherence), and `be37Edge` (Shapiro delay), plus `lawSchwarzschildRadius` — the first **diagonal-law edge** (same-regime endpoints: a law, not a bridge, under the membership criterion) — and the `M_SUN_KG` anchor constant (alias of `M_SUN_SI` from `core/constants.ts`). The CT-1 target derives E_min(M) = ℏc³ln2/(8πGM) from the BE-42∘BE-16 chain; CT-3 derives the Zurek decoherence scaling from BE-12∘BE-11.

### Catalog-tranche edges (`src/composition/edges/catalog-tranche.ts`, v0.10.0)

Six catalog-backed edges wrapping existing validated evaluators — `be14Edge`, `be19Edge`, `be21Edge`, `be48Edge` (KSS, the first nullary edge), `be53Edge`, `be54Edge` — each with value pins, domain tests, and a catalog-status drift guard.

### Catalog-full edges (`src/composition/edges/catalog-full.ts`, v0.11)

The remaining 26 catalog bridges as edges (`CATALOG_FULL_EDGES`), completing the catalog→graph migration to 41 edges. Each wraps an existing validated catalog evaluator (the catalog stays authoritative) and carries a first-class validity domain mirroring what the wrapped evaluator enforces. No edges for the NOT-A-BRIDGE entries BE-28/29/32/35/40 (per `rejected.ts`); BE-44 is skipped honestly (its evaluator takes a `number[]` news-sample array, incompatible with the scalar-Record edge contract).

### Assembled graph (`src/composition/catalog-graph.ts`)

`CATALOG_GRAPH` — the 9 calibration + 6 catalog-tranche + 26 catalog-full edges assembled once into a single `readonly BridgeEdge[]`. This is the public, canonical 41-edge graph; the CLI (`bin/upt.mjs`) and the composition test suites consume it directly rather than each rebuilding the edge list from its constituent imports.

---

## Canonical Module (v0.11+)

The textbook **L-layer** registry (`src/canonical/`, 16 files): the standard-physics "answer key" the catalog bridges are validated against (Π = L + B + E). Currently **66 canonical equations** (mechanics, EM/circuits, fluids/waves, thermo, quantum/atomic, gravitation, cosmology), grouped into per-domain `entries/` modules.

### `CanonicalEquation` type (`src/canonical/canonical-equation.ts`)

One textbook law with its fidelity tier — L0 (dimensional), L1 (scalar-AST), or L2 (field-equation) — plus `epistemicStatus`, `freeDimensionlessGroups`, the L0 `dimensional` fields, and the F4 disambiguators `partnerBridges` / `restatesBridge` (the latter names the bridge a law literally restates, so the linkage guard can discount the trivial X≡X match).

### `CANONICAL_EQUATIONS` registry + accessors (`src/canonical/registry.ts`)

The assembled array plus `canonicalById` / `canonicalByDomain`, the coverage helpers `partneredBridgeIds` / `bridgesWithoutCanonicalPartner` (36 bridges currently have no canonical partner), and `seedCanonicalLaws` / `CANONICAL_TENSOR_CONFIG` for populating the tensor. Entry modules live in `entries/`, grouped by physics domain (`dimensional-classics.ts`, `relativity.ts`, `mechanics.ts`, `electromagnetism.ts`, `fluids-waves.ts`, `thermo-nuclear-cosmo.ts`, `atomic.ts`, built on the shared `_l1-build.ts` helper); L0 fields are derived from the Buckingham engine in `dimensional-fields.ts`.

### `normalForm` / `structurallyEqual` (`src/canonical/normal-form.ts`)

The structural hash — "the same relation up to dimensionless **constants**." Numeric literals and registered constants (`ln2`, `4pi`, …) are dropped; a dimensionless symbol that is NOT a recognized constant is kept as a distinct `stub:<name>` token (so a functional stub like `ln⟨e^−βW⟩` does not collapse onto `ln2`).

### `classifyLinkage` / `scanLinkages` (`src/canonical/linkage.ts`)

The "validate against standard physics" engine + the **F4 circularity guard**. Each bridge↔canonical pair classifies as `restates-canonical` (a declared X≡X, NOT a discovery), `recovers` (an undeclared structural match), `dimensional-only`, or `unrelated`. `upt recover` surfaces the scan.

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

### `buckinghamPi` / `dimensionallyDetermines` (`src/dimensional/buckingham.ts`)

The Buckingham-π enumerator — the principled primitive for the identifiability classifier's exactly-determined case. `buckinghamPi(variables)` builds the dimension matrix (7 SI base rows × variables), computes its rank and a basis of its null space via EXACT rational arithmetic, and returns the n − r dimensionless π-groups (integer exponents) with a `BuckinghamVerdict` (`dimensionally-independent` / `single-invariant` / `multiple-invariants`). `dimensionallyDetermines(target, governing)` answers whether the target is fixed UP TO A DIMENSIONLESS CONSTANT — true iff the governing set is dimensionally independent and the target's dimension lies in its span — returning the (possibly rational) monomial. The result types carry FORM only (no value or constant field) — the honest boundary between dimensional analysis and numerology. Pins the canonical results: pendulum T = const·√(L/g), Schwarzschild r_s = const·GM/c² (and that mass alone does NOT determine r_s — G and c are required). Throws `RationalizationError` on duplicate names, an empty set, or a non-rational exponent. Design: `docs/planning/Bridge-Inference-Epistemics-Note.md` (build target 1).

### `parseDimensionSpec` (`src/dimensional/dimension-spec.ts`, INTERNAL)

Turns a human dimension string into a `Dimension`: a named dimension (`length`, `velocity`, …, case-insensitive), a fundamental constant by SI dimension (`hbar`, `c`, `G`, `k_B`, `e` — exact-case so `G` ≠ `g`), or explicit base exponents (`L^3.M^-1.T^-2`, fractional exponents allowed). Lets the `upt` CLI accept user-declared dimensions without TypeScript; throws `DimensionSpecError` on bad input. Not on the public surface.

### `ExprNode` union (`src/dimensional/validator.ts`)

The AST union type — **23 node kinds** (v0.14). Covers scalar nodes (`symbol`, `op`, `integral`, `derivative`, and the v0.14 distributional/variational primitives `dirac-delta` and `variational-derivative`), tensor nodes (`tensor-symbol`, `tensor-product`, `metric-tensor`, `kronecker-delta`, `tensor-partial-derivative`, `covariant-derivative`), and the curvature / equation node kinds added in v0.5.0/v0.6.0 (`riemann-tensor`, `ricci-tensor`, `einstein-tensor`, `bianchi-residual`, `killing-vector`, `conserved-charge`, `stress-energy-tensor`, `cosmological-constant`, `einstein-field-equation`, `weyl-tensor`, `kretschmann-scalar`). The `op '^'` arm also accepts an input-dependent exponent on a dimensionless base (v0.13). The `symbol` leaf carries its dimension inline; all other nodes build structure from sub-expressions.

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

### `parseFormula` / `FormulaParser` (`src/numerical/formula.ts`, INTERNAL)

A self-contained, dependency-free recursive-descent parser/evaluator for closed-form scalar physics expressions (`hbar*c^3/(8*pi*G*M*k_B)`) — Path B of the "use the CLI with your own equations" work. SAFE by construction: no `eval`/Function/property access, only arithmetic over numbers, a fixed function whitelist (`sqrt`/`exp`/`ln`/`sin`/…), the constants `pi`/`tau`, and caller-supplied variables (an unknown symbol is a `FormulaError`, never an implicit global). `parse(expr)` returns a `CompiledFormula` exposing its free `variables` and `evaluate(scope)`. It sits behind the `FormulaParser` interface. Not on the public surface; surfaced by `upt eval` / `upt derive --formula`.

### `formula-mathts.ts` / `formula-registry.ts` (Path A, INTERNAL)

The MathTS-backed `FormulaParser` (Path A) and the selector that chooses it. `formula-mathts.ts` wraps `@danielsimonjr/mathts-functions`'s assembled mathjs engine (`parse(expr).evaluate(scope)`), loaded dynamically through the `mathts-functions.ambient.d.ts` optional-peer declaration (mirroring `mathts-engine.ts`); free variables are the symbol nodes minus function callees minus MathTS's own built-ins, and a scalar-only guard rejects non-number results so MathTS types never leak through the seam. `formula-registry.ts` (`getFormulaParser` / `getFormulaParserKind`, mirroring `engine-registry.ts`) returns the MathTS parser when the peer is installed and passes a smoke test, else falls back silently to Path B (suppressing MathTS's WASM-fallback chatter on load). The two are proven interchangeable by the shared `tests/numerical/formula-conformance.ts` suite run against both; their one accepted divergence is that MathTS recognizes Euler's `e` as a constant. The `upt` CLI consumes the registry, with `--debug` printing the active parser.

### `formula-dimension.ts` (MathTS Phase 2, INTERNAL)

Dimensionally CHECKS a user's formula by transpiling its MathTS AST into UPT's own dimensional `ExprNode` and running `validate()` — unifying string→AST (MathTS) with AST→dimension (UPT). `createFormulaDimensionChecker(parse)` / `loadFormulaDimensionChecker()` return a `check(expr, dims)` that reports homogeneity and the inferred `Dimension` (or a `FormulaDimensionError`). The transpile maps constants→dimensionless symbols, variables→their declared dim (`pi`/`tau`/`e` dimensionless), `+−*/`→`op`, `^`/`sqrt`/`pow`→power ops (constant exponents only), `abs`→passthrough, and transcendentals (`exp`/`log`/`sin`/…) via the project's typed-stub pattern (dimensionless argument required → dimensionless result). **Default-on:** there are two transpilers over a shared core — one for the MathTS AST (Path A) and one for the Path B AST (exposed via `parseFormulaToAst`/`evalFormulaAst`) — so `getFormulaDimensionChecker()` returns a checker whether or not the MathTS peer is installed (both transpile to the same `ExprNode`; a builtin↔mathts parity test pins the agreement). Surfaced in `upt derive --formula` (e.g. the pendulum reports `formula dimension: [time] ✓ matches target`; `length + gravity` is reported not homogeneous). Phase 2 of the MathTS integration; design in `docs/planning/Formula-Dimensional-Check-Design-Note.md`.

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

The lowering pass. Translates an `ExprNode` tree into a sequence of `TensorEngine` calls and returns the resulting `EngineTensor`. Internal — not exported from the public surface. Since v0.9.0 (S-9) the five deferred-evaluator node kinds dispatch through `DEFERRED_EVALUATOR_REGISTRY` (a registry-consulting default arm with compile-time exhaustiveness via `Exclude<…> → never`) instead of hand-written switch arms; the registry is likewise internal.

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

### `toGeometrized` / `fromGeometrized` / `geometrizedFactor` / `NonGeometrizableDimensionError` (`src/numerical/geometrized.ts`, v0.14)

The geometrized-units (G = c = 1) boundary adapters. `geometrizedFactor(dim)` is the single conversion factor `G^M·c^(T−2M)` driven mechanically by the `Dimension` exponent vector (the dimension functor); `toGeometrized(valueSI, dim)` multiplies and `fromGeometrized` divides. A nonzero electromagnetic/thermal/molar/luminous exponent (I/Θ/N/J) throws `NonGeometrizableDimensionError`. INTERNAL in v0.13 (G-9 increment 1); promoted to the public API in v0.14 (G-9 increment 2). The default GR pipeline stays SI (increment 3 declined — measured no precision win).

### `integrateGeodesic(inputs)` (`src/numerical/geodesic-integrator.ts`)

RK4 integrator for the geodesic equation. Accepts a `GeodesicIntegratorInputs` bundle with a Christoffel-symbol closure, initial position, initial velocity, proper-time step, and number of steps. Returns a `GeodesicIntegratorResult` with the trajectory as an array of (position, velocity) pairs. No `TensorEngine` dependency — operates on plain JS arrays.

### `integrateGeodesicGL4(...)` (`src/numerical/gl4-integrator.ts`)

v0.5.0 addition. The GL4 (Gauss–Legendre 4th-order) symplectic integrator for the geodesic equation — an implicit, energy-conserving alternative to RK4 for long-time integration. Returns a `GL4State` trajectory; per-step snapshots are `GL4Snapshot`, options `GL4Options`. Re-exported from the main index via `numerical/index`.

### `findPerihelion(...)` (`src/numerical/perihelion-finder.ts`)

v0.5.0 addition. Bisection-based finder that locates the perihelion radius along a geodesic trajectory; returns a `PerihelionResult`. Underpins the BE-52 Mercury perihelion-advance demonstration.

### `evaluateKGDispersionResidual` / `verifyKleinGordonPlaneWave` (`src/numerical/klein-gordon.ts`, v0.11)

The Klein-Gordon dispersion evaluator (plane-wave sector; G-7 closure). `evaluateKGDispersionResidual` computes the relative residual of the dispersion relation ω² = c²k² + (mc²/ℏ)²; `verifyKleinGordonPlaneWave` checks a plane-wave candidate against it. The numerical companion to the dimensional layer's `KleinGordonEquationNode` / `validateKleinGordonEquation`. Both re-exported from `src/index.ts`.

### Flat-metric layout (v0.9.0)

The v0.9.0 hygiene sprint migrated metric closures to row-major `Float64Array`: `MetricFnFlat` (`(x) => Float64Array(16)`, defined in `curvature-lowering-helpers.ts`), the Painlevé–Gullstrand closures `painleveGullstrandGFn` / `painleveGullstrandGInverseFn`, and the canonical Schwarzschild fixture (`tests/fixtures/schwarzschild.ts` — `gInverseFn` → `Float64Array(16)`, `dgInverseFn` → `Float64Array(64)`, layout `flat[λ*16+μ*4+ν]`). Hot-path consumers (GL4 Picard loops, perihelion finder, null-ic, BE-37 eikonal) use dim-stride indexing; the GL4 stage solve gained 1.56× single / 1.62× batch (see `benchmarks.md`).

---

## Curvature / GR Module (v0.5.0 → v0.6.0)

The curvature subsystem spans both `dimensional/` (AST nodes + validators) and `numerical/` (evaluators). The composite AST node kinds and the `CurvatureCompositeNode<K,S>` factory are described in detail under [Curvature composite layer](#curvature-composite-layer-v050--v060).

### `ricci(R)` / `einstein(R, g, gInverse)` / `bianchiResidual(R)` (`src/dimensional/curvature.ts`)

v0.5.0 composite-node helpers. `ricci` produces the contracted R_μν = R^λ_{λμν}; `einstein` produces G_μν = R_μν − ½ R g_μν (vacuum scope); `bianchiResidual` returns `{ residual, evaluate, evaluateMax }` for the cyclic second-Bianchi-identity check. Each returns an `ExprNode` composite. All three are re-exported from `src/index.ts`.

### `CURVATURE_KIND_REGISTRY` / `CurvatureCompositeNode<K,S>` (`src/dimensional/curvature-composite.ts`)

v0.6.0. The shared composite-node factory type and the kind registry that all six curvature node kinds are built from, and that the consolidated `lowerCurvature` dispatcher walks.

### `validateKretschmannScalar` / `KretschmannScalarNode` (`src/dimensional/curvature-invariants.ts`)

v0.6.0. The Kretschmann scalar AST node (K = R_{ρσμν} R^{ρσμν}; scalar, dim [L⁻⁴]) and its structural validator. `validateKretschmannScalar` is re-exported from `src/index.ts`.

### `validateWeylTensor` / `WeylTensorNode` (`src/dimensional/weyl-validators.ts`)

v0.6.0. The Weyl tensor AST node (trace-free part of Riemann) and its validator. The validator is `@internal` — not re-exported from `src/index.ts`.

### `validateEinsteinFieldEquation` / `EinsteinFieldEquationNode` (`src/dimensional/einstein-equation.ts`)

v0.6.0. The Einstein field-equation predicate AST node (G_μν + Λ g_μν = (8πG/c⁴) T_μν) and its structural validator — checks free-index agreement, per-component dim equality [L⁻²], and symmetry agreement. `validateEinsteinFieldEquation` is re-exported from `src/index.ts`.

### `verifyKillingEquation` / `evaluateConservedCharge` (`src/numerical/killing.ts`)

v0.6.0 Killing-vector machinery. `verifyKillingEquation` numerically checks the Killing equation ∇_μ ξ_ν + ∇_ν ξ_μ = 0 at a point (hybrid impl — exact Christoffels + analytic metric derivatives). `evaluateConservedCharge` evaluates Q = ξ^μ p_μ along a geodesic. Options type `KillingEquationOptions`; the layout-agnostic Christoffel accessor type is `ChristoffelAccess`. Both functions re-exported from `src/index.ts`.

### `evaluateEinsteinEquationResidual(input)` (`src/numerical/einstein-equation.ts`)

v0.6.0. Computes the scale-normalized max Einstein field-equation residual |G_μν + Λ g_μν − κ T_μν| / |g_μν| at a coordinate point. Accepts metric closures (`MetricClosure`, `Vec4`) + a stress-energy closure (`EinsteinEquationResidualInput`); returns a dimensionless relative residual. For Schwarzschild vacuum the residual is the finite-difference truncation floor (~1e-10 relative). Re-exported from `src/index.ts`.

### `computeKretschmann(...)` (`src/numerical/kretschmann.ts`)

v0.6.0. Numerical contraction of the Kretschmann scalar. The v0.11 O-4 pass widened its metric-inverse input to `number[][] | Float64Array` (non-breaking; `WeylInputs` in `weyl-lowering.ts` was widened the same way) and replaced the naive O(4⁸) = 65536-multiplication contraction with an exact factored index-raising algorithm (4×4⁵ — no symmetry assumption) for a **29.8×** compute speedup (pins < 1e-15; see `benchmarks.md`). Re-exported from `src/index.ts`.

### `christoffelFnFlat` (`src/numerical/christoffel-flat.ts`)

v0.6.0 (BR-2 migration). The flat-layout Christoffel accessor — provides a layout-agnostic Christoffel-symbol closure consumed by the GR evaluators.

---

## Core Module

### `UniversalTensor` (`src/core/tensor.ts`)

The original high-level tensor facade, predating the dimensional and numerical layers. Provides a typed wrapper around tensor data with metadata (physical scale, associated physical law). Present for backward compatibility and as the class-export on the public surface.

### `PhysicalConstants` (`src/core/types.ts`)

A lookup object of SI physical constants: G (gravitational), c (speed of light), ℏ (reduced Planck), k_B (Boltzmann), and others. Used by bridge evaluator modules that need numerical constant values. Predates the flat `*_SI` constants below.

### Flat `*_SI` constants (`src/core/constants.ts`)

v0.5.1 (PC-1) addition. The canonical CODATA 2018 / SI-defined physical constants as bare `number` values in SI units — `C_SI`, `G_SI`, `H_SI`, `HBAR_SI`, `K_B_SI`, `E_SI`, `ALPHA` (dimensionless), `M_P_SI`, `L_P_SI`, `T_P_SI`, `H0_SI`, plus the later anchors `M_SUN_SI` (solar mass, v0.8.0) and `M_E_SI` (electron mass, v0.11). This is the single source of truth for physical constants across the numerical, dimensional, and bridge layers. All re-exported from `src/index.ts`.

### v0.7 intelligent-index / regime layer (`src/core/labeled-tensor.ts`, `axes-registry.ts`, `universal-index.ts`, `cell.ts`, `flux-rules.ts`, `regime-registry.ts`, …)

The v0.7.x additions to `core/`: `LabeledTensor` (semantic axis labels — see `docs/architecture/intelligent-index-tutorial.md`), the axes/universal-index registries, and the `Cell`/flux-rule/regime-registry machinery (the `compose` Cell factory lives here — not to be confused with the v0.8.0 `composeEdges` composition operator). Flux **Rule 3 (Causality) was promoted WARNING → ERROR in v0.10.0**: a reverse-arrow `BridgeCell` (coarser→finer scale) now fail-atomics at `addCell` unless whitelisted (the live catalog was verified clean — zero reverse arrows — before promotion). The sibling v0.7 `diff/` module holds `bridgeGradient` + the bridge specs (see `docs/architecture/bridge-gradient-tutorial.md`).

**v0.14 `LabeledTensor` extensions.** An explicit `axisOrder: readonly string[]` field (label keys in engine-axis order) is now the authoritative label↔axis mapping, queried via `axisOf(key)` — fixing a latent desync where `transpose`/`contract` could leave the engine axes in a non-sorted order while the old code assumed sorted-key positions (`AxisOrderError` guards a bad explicit order; backward-compatible optional 4th constructor param). On top of it, `mergeAxes(keys, merged)` / `splitAxis(key, parts)` add rank-changing reshape (fuse a contiguous run of engine axes into one caller-labelled axis, and its inverse), guarded by `AxisMergeError` / `AxisSplitError`. All four error classes are `@public`.

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
  ├── src/core/constants.ts       (flat *_SI constants — v0.5.1)
  ├── src/composition/index.ts    (composeEdges, BridgeEdge, calibration + tranche +
  │                                catalog-full edges, CATALOG_FULL_EDGES,
  │                                enumerateCompositions, propagateUncertainty — v0.8.0→v0.11)
  ├── src/composition/compose-surface.ts  (CompositionAliasError,
  │                                SOURCE_ALIAS_DISPOSITIONS — v0.11)
  ├── src/bridges/membership.ts   (adjudicateBridgeEntry, adjudicateCatalog,
  │                                REJECTED_BRIDGE_* — v0.8.0)
  ├── src/bridges/be36-gw170817-confrontation.ts  (confrontBE36, GW170817 — v0.8.0;
  │                                confrontBE36WithUncertainty — v0.10.0)
  ├── src/bridges/be23-planckian-confrontation.ts (confrontBE23, PLANCKIAN_CUPRATES — v0.11)
  ├── src/numerical/klein-gordon.ts  (evaluateKGDispersionResidual,
  │                                verifyKleinGordonPlaneWave — v0.11)
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
  ├── src/dimensional/bridge-check.ts   (inferDimensionForBridge)
  ├── src/dimensional/connection.ts     (christoffel)
  ├── src/dimensional/curvature.ts      (ricci, einstein, bianchiResidual — v0.5.0)
  ├── src/dimensional/einstein-equation.ts     (validateEinsteinFieldEquation — v0.6.0)
  ├── src/dimensional/curvature-invariants.ts  (validateKretschmannScalar — v0.6.0)
  ├── src/numerical/index.ts        (evaluateNumerical, evaluateNumericalRaw,
  │   ├── src/numerical/tensor-engine.ts   evaluateMetricInverse, NumericalResult,
  │   ├── src/numerical/float64-engine.ts  Float64ReferenceEngine, TensorEngine,
  │   ├── src/numerical/engine-registry.ts getActiveEngine, setActiveEngine,
  │   ├── src/numerical/lowering.ts        NumericalBackendError, hasAutogradSupport,
  │   ├── src/numerical/gl4-integrator.ts  integrateGeodesicGL4, findPerihelion)
  │   ├── src/numerical/perihelion-finder.ts
  │   ├── src/numerical/metric-inverse.ts
  │   └── src/numerical/be37-covariant-eikonal.ts
  ├── src/numerical/geodesic-integrator.ts  (integrateGeodesic)
  ├── src/numerical/killing.ts              (verifyKillingEquation, evaluateConservedCharge — v0.6.0)
  ├── src/numerical/einstein-equation.ts    (evaluateEinsteinEquationResidual — v0.6.0)
  └── src/numerical/kretschmann.ts          (computeKretschmann — v0.6.0)
```

The `dimensional` module does not import from `numerical`. The `numerical` module imports from `dimensional` (for `ExprNode`, `Dimension`, `validate`). The `bridges` module imports from both; `composition` imports from `dimensional`, `bridges` (the wrapped catalog evaluators), and `core` (constants). This acyclic inter-module import order is intentional. As of the 2026-06-19 refactor there are **no runtime circular dependencies** in `dependency-graph.json`: the former intra-`core` `cell.ts` ↔ `tensor.ts` pair was removed by co-locating the `compose()` factory with `UniversalTensor`, and the `numerical → bridges` upward import (a generic input-validator) was dropped by moving it to a `numerical` leaf. Two type-only cycles remain (`validator.ts` ↔ `tensor.ts`/`curvature.ts` — the recursive-AST `ExprNode` union, erased at runtime and documented as intentional). For the authoritative, fully-enumerated per-file dependency graph, see `DEPENDENCY_GRAPH.md` (regenerated 2026-06-19).

---

## Curvature composite layer (v0.5.0 → v0.6.0)

UPT's curvature subsystem is a family of "first-class composite AST node"
kinds — each a member of the `ExprNode` union with its own validator and a
lowering arm. The v0.5.0 GR-foundations release introduced four
(`RiemannTensorNode`, `RicciTensorNode`, `EinsteinTensorNode`,
`BianchiResidualNode`); v0.6.0 added two more (`WeylTensorNode`,
`KretschmannScalarNode`). The six kinds are:

| Node                    | Validator                                         | Lowering arm (`lowering.ts`)        |
|-------------------------|---------------------------------------------------|-------------------------------------|
| `RiemannTensorNode`     | `connection-validators.ts:validateRiemannTensor`  | case `'riemann-tensor'`             |
| `RicciTensorNode`       | `curvature.ts:validateRicciTensor`                | case `'ricci-tensor'`               |
| `EinsteinTensorNode`    | `curvature.ts:validateEinsteinTensor`             | case `'einstein-tensor'`            |
| `BianchiResidualNode`   | `curvature.ts:validateBianchiResidual`            | case `'bianchi-residual'`           |
| `WeylTensorNode`        | `weyl-validators.ts:validateWeylTensor`           | case `'weyl-tensor'`                |
| `KretschmannScalarNode` | `curvature-invariants.ts:validateKretschmannScalar` | case `'kretschmann-scalar'`       |

Each node wraps an inner `RiemannTensorNode` (or builds the coordinate-basis
Riemann directly), carries explicit references to the metric pair (`gLower`,
`gInverse`) used for index-raising and Christoffel/∂Γ assembly, and lowers by
materialising the inner Riemann via `engine.toNested`, contracting on the JS
side, and lifting back via `engine.fromNested` (the "walk-directly
philosophy", v0.5.0 Task 6 — no AST rewrite into a `tensor-product` einsum).

### The `CurvatureCompositeNode<K,S>` factory (shipped)

When the v0.5.1 PD-6 extraction trigger fired (the Weyl tensor and the
Kretschmann scalar — the fifth and sixth instances — were filed in v0.6.0),
the shared factory was extracted into **`src/dimensional/curvature-composite.ts`**.
That file now defines:

- `CurvatureKind` — the discriminated union of the six `kind` strings.
- `CurvatureCompositeNode<K extends CurvatureKind, S extends object>` — the
  shared composite-node factory type. `K` discriminates the node kind; `S`
  carries the per-kind extra slots (e.g., the metric pair for Einstein, the
  trace slots for Weyl). It is an intersection type (P-1 fix), not a fixed
  three-variant shape.
- `CurvatureKindSpec` + `CURVATURE_KIND_REGISTRY` — a registry mapping each
  `CurvatureKind` to its spec, used by the consolidated lowering dispatcher.

All six curvature node kinds are defined as instantiations of
`CurvatureCompositeNode<K,S>`. The six per-kind lowering arms were
consolidated into a single `lowerCurvature` dispatcher in `lowering.ts`,
which walks `node.kind` and dispatches via `CURVATURE_KIND_REGISTRY`. The
v0.4.0-era "do NOT extract" instruction (the factory was premature while only
four instances existed) has been satisfied and superseded — the factory and
dispatcher are the current structure.

---

**Document Version**: 0.27.0
**Last Updated**: 2026-06-20
**Maintained by**: Daniel Simon Jr.
