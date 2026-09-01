# Universal Physics Tensor — Project Overview

---

## What Is This?

Universal Physics Tensor (UPT) is a **TypeScript dimensional-analyzer and bridge-equation library** for exploring unified physics through tensor formalism. It provides machine-readable encoding of 44 bridge equations that connect distinct physics regimes (quantum to classical, gravity to gauge, thermodynamics to information theory), paired with a layered computational backend that can validate, symbolically analyze, and numerically evaluate those equations.

The library serves two audiences: researchers who want to query the bridge-equation catalog and catch dimensional errors in novel formulations, and implementors who want to evaluate tensor contractions numerically, compute Christoffel symbols, or integrate geodesics in an arbitrary Lorentzian manifold.

---

## North Stars

Three goals govern every design choice in UPT:

1. **Bridges drive the work.** The 44 bridge equations in `src/bridges/` are the scientific core. Tooling, tests, and new capabilities exist to serve the catalog, not the other way around. A new feature earns its place by enabling or improving a bridge encoding.

2. **MathTS first-class.** `@danielsimonjr/mathts-tensor` is the preferred numerical backend. The `TensorEngine` interface keeps UPT backend-agnostic, but the selection of MathTSEngine as the intended default (when the optional dep is present) is a deliberate signal about the dependency shape of the ecosystem, not a performance claim.

3. **Integrated scientific environment.** UPT aims to be a self-contained environment for computational physics — Christoffel symbols, geodesic integration, curvature (Riemann/Ricci/Einstein/Weyl/Kretschmann), Killing-vector and Einstein-field-equation machinery, and eventually symbolic manipulation — all sharing a common AST and type system. The curvature and GR layers shipped across v0.5.0 and v0.6.0.

4. **An honest falsification instrument.** The v0.37.0 **PI-instrument program** reframed UPT explicitly as an instrument a physicist can stake a claim on: a trustworthy **no** and an extraordinary **yes**. The *no* is `upt discover`'s vetting funnel plus the epistemic-grounding ledger (`src/composition/grounding.ts`, which falsifiers actually passed vs. the gaps, on every verdict) — across every review round it has adjudicated **0 of 8** machine-surfaced candidate bridges as genuine, and a separate connector-adjudication pass found **0 of 7** candidate graph connectors genuine (the isolated-bridge frontier is isolated by physics, not vocabulary, not a vocabulary gap the tool can close). The *yes* is the evidence spine (`upt confront`): **9** real-data confrontations of established bridges, including all three classic tests of general relativity — Mercury perihelion (0.26σ), Shapiro delay (0.91σ), gravitational lensing (0.67σ) — each within 1σ, honestly read as precision GR at ~10⁻⁵ across two independent PPN parameters (γ twice, β once) rather than nine equal confirmations.

---

## Five-Layer Architecture

UPT is organized into five conceptual layers that build on each other:

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 5: Curvature / GR (v0.5.0 + v0.6.0)                   │
│  Riemann / Ricci / Einstein / Bianchi / Weyl / Kretschmann   │
│  composite nodes + CurvatureCompositeNode<K,S> factory +     │
│  GL4 symplectic integrator + perihelion finder + Killing     │
│  machinery + EinsteinFieldEquationNode + Einstein residual   │
├──────────────────────────────────────────────────────────────┤
│  Layer 4: Numerical Backend                                  │
│  TensorEngine interface + Float64ReferenceEngine +           │
│  MathTSEngine adapter (optional) + AD (forwardGrad /         │
│  reverseGrad) + RK4 geodesic integrator                      │
├──────────────────────────────────────────────────────────────┤
│  Layer 3: Metric / Connection                                │
│  MetricTensorNode / KroneckerDeltaNode / christoffel()       │
│  builder / CovariantDerivativeNode / inverse-metric check    │
├──────────────────────────────────────────────────────────────┤
│  Layer 2: Dimensional AST + Algebra                          │
│  ExprNode union / validate() / validateEquation() /          │
│  SI Dimension algebra (multiply / divide / power / format)   │
├──────────────────────────────────────────────────────────────┤
│  Layer 1: Bridge Catalog                                     │
│  BRIDGE_EQUATIONS (44 entries) + per-bridge evaluator        │
│  modules (be-*.ts) + BridgeEquationEntry metadata type +     │
│  membership criterion / negative catalog (v0.8.0)            │
└──────────────────────────────────────────────────────────────┘
```

A bridge equation module at Layer 1 builds AST nodes at Layer 2, validates them with the dimensional algebra, optionally raises/lowers indices using Layer 3 metric primitives, and can be numerically evaluated through Layer 4. Layer 5 (the curvature / general-relativity layer, added across v0.5.0 and v0.6.0) is built on top of Layers 2–4: its curvature node kinds are `ExprNode` members with their own validators and lowering arms, and its integrators reuse the same Christoffel-closure convention as the Layer-4 RK4 solver. Callers who only want catalog metadata (status, known issues, references) never touch layers 2–5.

Beside the layers, v0.8.0 added a **composition graph** (`src/composition/`): bridges as `BridgeEdge` objects over `Quantity` endpoints, composable via `composeEdges`, with pre-registered calibration edges (including the first diagonal-law edge, `lawSchwarzschildRadius`). Its first derived result (CT-1) chains BE-42∘BE-16 to E_min(M) = ℏc³ln2/(8πGM). The same release made catalog membership computable (`src/bridges/membership.ts` + the `src/bridges/rejected.ts` negative catalog — see `v0.8.0-catalog-adjudication.md`) and shipped the first real-data confrontation (GW170817 vs. BE-36). The graph has since grown to **41 edges** (v0.10.0 catalog tranche + v0.11 full catalog→graph migration), gained a Phase-D candidate enumerator (`enumerateCompositions`), first-order uncertainty propagation (`propagateUncertainty`), and a name-collision namespacing gate (`CompositionAliasError` + `SOURCE_ALIAS_DISPOSITIONS` over 131 centralized `Quantity` nodes in `quantities.ts`); a second data confrontation (BE-23 vs. cuprate Planckian dissipation) landed in v0.11. The 44-bridge catalog (41 graph edges) is validated against the **canonical L-layer** (`src/canonical/`, 103 equations as of v0.36.0 — the textbook ground truth the catalog's bridges are checked against; see the Version History below), and the graph's real-data confrontations have grown into an **evidence spine** of 9 (`upt confront` / `upt coverage`), carried in `src/bridges/confrontations.ts` + per-bridge `be*-confrontation.ts` evaluators.

---

## Version History

UPT began as a typed bridge-equation catalog — a machine-readable encoding of the UPT specification's bridge equations, each carrying status, known-issue annotations, dimensional signatures, and literature references. Versions 0.1–0.2 established this catalog along with the `UniversalTensor` core class and the `PhysicalConstants` lookup table.

Version 0.3.0 added the dimensional AST: `ExprNode`, the `validate()` function, and the full SI dimension algebra. This made it possible to check whether a proposed bridge equation is dimensionally homogeneous — catching sign errors, missing factors, and undefined quantities that the spec had not yet resolved. Version 0.3.5 added the numerical-contraction backend: the `TensorEngine` interface, the zero-dependency `Float64ReferenceEngine`, and the `MathTSEngine` adapter backed by `@danielsimonjr/mathts-tensor`. Both engines satisfy a parameterized conformance suite that lives alongside the library.

Version 0.4.0 shipped the **connection layer**: the `christoffel()` formula builder, the `CovariantDerivativeNode` AST kind, and the `derivativeStrategy` field on `MetricTensorNode` for specifying how metric derivatives are computed. It also added automatic differentiation (`forwardGrad` / `reverseGrad` on `TensorEngine`), the `integrateGeodesic` RK4 solver, and two new bridge implementations (BE-51 gravitational lensing, BE-52 perihelion precession). Versions 0.4.5 and 0.4.6 were consolidation releases — the Wave-Z evaluator buildout (an `evaluate*` function for every catalogued bridge) and refactor/minimize passes.

Version 0.5.0 shipped the **GR-foundations / curvature layer**: the GL4 (Gauss–Legendre 4th-order) symplectic integrator as an energy-conserving alternative to RK4, the bisection-based perihelion finder, the `RiemannTensorNode` AST kind, and the `ricci` / `einstein` / `bianchiResidual` composite-node helpers (Ricci tensor, Einstein tensor, second-Bianchi-identity residual). It also activated BE-52 (Mercury perihelion advance from numerical integration) and BE-37 (Shapiro delay).

Version 0.5.1 (PC-1) added the **flat constants layer**: the canonical CODATA 2018 / SI-defined `*_SI` constants (`C_SI`, `G_SI`, `HBAR_SI`, …) as the single source of truth for physical constants across the numerical, dimensional, and bridge layers.

Version 0.6.0 shipped the **Killing / Einstein-equation / curvature-invariant layer**: Killing-vector machinery (`verifyKillingEquation`, `evaluateConservedCharge`), the `StressEnergyTensorNode` / `CosmologicalConstantNode` / `EinsteinFieldEquationNode` AST kinds plus the `evaluateEinsteinEquationResidual` numerical residual evaluator, the Weyl tensor and Kretschmann scalar (`computeKretschmann`, `validateKretschmannScalar`), the extracted `CurvatureCompositeNode<K,S>` factory consolidating all six curvature node kinds, and `christoffelFnFlat` (the flat-layout Christoffel accessor from the BR-2 migration).

The v0.7.x line grew the catalog to 44 entries (BE-53 Yang–Mills β-function, BE-54 Randall–Sundrum brane), added the intelligent-index / regime layer in `core/` (`LabeledTensor`, `Cell`, regime registry — see `intelligent-index-tutorial.md`), and the `diff/` bridge-gradient layer (`bridgeGradient` — see `bridge-gradient-tutorial.md`), alongside a catalog-wide physics-correctness audit pass (`BRIDGE-PHYSICS-AUDIT-v2.md`).

Version 0.8.0 shipped the **composition graph** (`src/composition/` — `Quantity`/`BridgeEdge`/`composeEdges` + calibration edges; CT-1 derives E_min(M) = ℏc³ln2/(8πGM) from BE-42∘BE-16), the **graph-native membership criterion + negative catalog** (`src/bridges/membership.ts`, `src/bridges/rejected.ts`; BE-42 reversed to a `['gravity','quantum']` bridge, BE-28/29/32/35/40 NOT-A-BRIDGE — see `v0.8.0-catalog-adjudication.md`), the **GW170817 real-data confrontation** of BE-36, the generated JSON catalog artifact (`data/bridge-catalog.json`), GitHub Actions CI, `CONTRIBUTING.md`, and fast-check property tests.

Version 0.9.0 (unreleased milestone) was the **flat-metric hygiene sprint**: the Schwarzschild fixture and Painlevé–Gullstrand metric closures migrated to row-major `Float64Array` (`MetricFnFlat`; 1.56× single / 1.62× batch on the GL4 stage solve), the `DEFERRED_EVALUATOR_REGISTRY` consolidation in `lowering.ts` (S-9), the whole-repo strict typecheck gate (`tsc -p tsconfig.tests.json`, baseline driven to empty), and the CT-3/CT-4 calibration targets (`be12Edge`/`be11ZurekEdge`/`be37Edge`) that put Part-IX's Phase-B success bar (≥3 of C1–C5) at MET.

Version 0.10.0 (unreleased; the recommended single rollup tag) closed **Part-IX Phases C and D**: stress tests ST-1/ST-2, the `enumerateCompositions` Phase-D enumerator (2 novel candidates over the then-15-edge graph — `docs/research/v0.10.0-novel-candidates.md`), `propagateUncertainty` + `confrontBE36WithUncertainty`, the catalog-tranche edges (graph 9 → 15), the **flux Rule 3 (Causality) WARNING → ERROR promotion**, the strict CI typecheck gate, and the `docs/architecture/archive/` move of dated v0.4.x–v0.7.x records.

The v0.11.0 sprint (unreleased, on top of v0.10.0) executed the open items: the **namespacing gate** (`CompositionAliasError`, `SOURCE_ALIAS_DISPOSITIONS`, centralized `quantities.ts` — 131 uniqueness-pinned `Quantity` nodes), the **full catalog→graph migration** (15 → 41 edges via `edges/catalog-full.ts`; Phase-D over the full graph surfaced 7 novel candidates — `docs/research/v0.11.0-novel-candidates.md`), **O-4 + the 29.8× Kretschmann factored index-raising**, the **Klein-Gordon dispersion evaluator** (`src/numerical/klein-gordon.ts`), and the **BE-23 Planckian data confrontation** (`confrontBE23`, the second real-data check).

The **v0.12 work** (unreleased) advanced the original tensor-maps-physics premise with a suite of internal analysis + generative tools (all REVIEW SURFACES, never automated discovery): the four premise-extension directions — the equation-level valence check in `validateEquation`, the `UniversalTensor`-backed bridge-prediction (`upt predict`), the candidate-vetting **discovery loop** (`upt discover`), and the empirical-coverage audit (`upt coverage`); **symbolic bridge composition** — the Observable contract (`composeSymbolic` over optional `symbolic` ExprNode forms, the scalar `evalExpr`/`substitute` primitives) plus optional MathTS-backed `simplifyExpr`/`simplifyObservable`; and the **orphan-connector analysis** (`upt connectors`) with its corrected finding that the strongest candidate CI-1 is an over-determination, not a composition.

The **v0.13 work** (unreleased) added two bounded, Adam+Eve-vetted foundation pieces: **symbolic exponents on a dimensionless base** (the `^` arm now accepts an input-dependent exponent when the base is dimensionless — `dimensionless^dimensionless = dimensionless` — letting BE-33 carry its faithful `(T/T₀)^(−1/z)` form), and **G-9 increment 1**: the geometrized-units boundary adapters (`src/numerical/geometrized.ts` — `toGeometrized`/`fromGeometrized`, the dimension functor driving `G^M·c^(T−2M)`), the self-contained foundation of the units-normalization layer.

The **v0.14 work** (unreleased) — all Adam+Eve-vetted — added: the **distributional/variational grammar primitives** (`dirac-delta` + `variational-derivative` scalar `ExprNode` arms, taking the union to 23 node kinds, making BE-15's Model-A Langevin/FDT relation dimensionally expressible); the **`BridgeEquations` convenience facade** over the per-bridge evaluators; **G-9 increment 2** (the geometrized adapters promoted to the public API, a geometrized Schwarzschild fixture, and an SI↔geometrized equivalence test) — while **increment 3** (routing the default GR pipeline onto geometrized units) was DECLINED on measured evidence of no precision win (geometrized far-field curvature was, if anything, worse); and a `LabeledTensor` foundation pair — the **explicit `axisOrder` invariant** (`axisOrder` field + `axisOf`, fixing a latent transpose/contract axis-order desync) and the **`mergeAxes`/`splitAxis`** rank-changing reshape built on it. Plus an unused-export cull and a `unitless*`→`geometrized*` fixture-name consolidation. Several queued items were investigated and found to be physicist-curation rather than engineering (C2/C3 calibration targets; the regime-builtins taxonomy) or superseded (the Kretschmann O(4⁸) symmetry optimization).

The **v0.15 → v0.23 arc** (all released; CHANGELOG `[0.15.0]`…`[0.23.0]`) shipped as
the v0.8.0→v0.23.0 rollup: the **canonical-equation L-layer** (`src/canonical/` —
the textbook ground truth bridges are validated against: the `CanonicalEquation`
L0/L1/L2 type, the Buckingham-derived dimensional fields, the structural
`normal-form` hash, and the **bridge↔canonical linkage** with the F4 circularity
guard, surfaced by `upt recover`), and assorted grammar/quality work.

**Version 0.24.0** added the **identity-consequence surfacer**
(`src/composition/proposed-bridges.ts`; `upt discover --derive` → machine-derived
candidate relations held OUT of the catalog pending §XXVII-B review — see spec
**Part-XI**) and the **canonical-only discovery graph** (`CANONICAL_GRAPH` — `upt
discover --source=canonical` runs the funnel on standard physics alone), alongside
canonical-graph quality fixes (magnitude-gate sourcing, variable-name unification,
the declared compton↔de-Broglie link) and DGT-guided refactors (the
`core/tensor↔cell` runtime cycle removed by co-locating `compose()` with
`UniversalTensor` in `tensor.ts`; the `numerical→bridges` upward dependency dropped
by moving the input validator to a new leaf `src/numerical/input-validation.ts` —
runtime cycles now **0**; two type-only cycles remain: `validator.ts`↔`tensor.ts`
and `validator.ts`↔`curvature.ts`, both the recursive-AST `ExprNode` union, erased
at runtime, documented intentional).

**Versions 0.25.0–0.27.0** shipped a parser-consolidation + visualization arc:
v0.25.0 added physics-map visualization (`upt map --format=mermaid|dot|svg`,
`src/composition/graph-viz.ts` plus the optional `@viz-js/viz`-backed SVG
renderer); v0.26.0 factored out `parsePhysics` (the single
string→dimensional-`ExprNode` entry point over the MathTS-or-built-in front end),
closed the scalar grammar gap (faithful `transcendental`/`abs` nodes), added
single-unknown dimensional inference, and made `upt map --equation` dimensionally
aware; v0.27.0 completed the parser consolidation by unifying the two
structurally-parallel transpilers onto one normalized parse node (`PNode`) so
`ExprNode` is unambiguously the single semantic IR. (v0.26.0/v0.27.0 were
GitHub-only releases — npm `latest` jumped 0.25.0 → 0.28.0.)

**Version 0.28.0** folded the parser-consolidation arc into its npm publish
alongside a second Adam+Eve canonical-L-layer expansion (26 → 66 equations across
six domains). **Version 0.29.0** (the "three frontiers" release) added the
**BE-52 Mercury-perihelion confrontation** — the catalog's first
established-bridge real-data confrontation (data-confronted bridges 2 → 3) —
plus three adjudication passes that closed the discovery pipeline's early
candidate sets: 8 auto-surfaced discovery candidates and the 5 machine-derived
Part-XI proposed equations both adjudicated **0 genuine/promoted**, and the first
orphan-connector adjudication round (**0 of 3 genuine**) — establishing that the
isolated bridge tail is isolated by physics, not vocabulary.

**Version 0.30.0** shipped the **CLI overhaul**: `bin/upt.mjs` was ported from an
untyped monolith to a typed `src/cli/` module tree (compiled to `dist/cli/`),
reduced to a ~22-line shim that only resolves `dist/cli/main.js` and maps the
returned exit code onto `process.exitCode` (`runCli()` itself never calls
`process.exit`); every data-bearing command gained `--json` (one envelope, a
non-finite-safe sanitizer); `--source=catalog|canonical|both` extended across all
8 graph-analysis commands; and commands reach internals only through the injected
`CommandCtx.api` (the `src/cli-api.ts` barrel), never by importing `src/cli/`
internals directly.

**Versions 0.31.0–0.33.0** completed the **discovery-hardening program**:
v0.31.0 added the adjudication ledger; v0.32.0 added the axis falsifier and made
`map`/`connectors`/`discover` default to `--source=both`; v0.33.0 bundled the
**`upt confront`** subsystem (real-data confrontations of established bridges)
and consequence-propagation (`annotateConsequences`). Its four remaining
candidate items — a numerology unit, a statistics-theater phase,
symbolic-deepening, and an E-layer/Phase-6 category error — were each evaluated
and correctly NOT built: the honest capability ceiling of a funnel over a sparse
monomial catalog (`docs/research/v0.33.0-discovery-hardening-results.md`).

**Versions 0.34.0–0.36.0** grew the canonical L-layer **66 → 103 equations**:
v0.34.0 added 27 new monomial laws (+41%), including a new `condensed-matter`
domain, and mapped the boundary of the monomial L0 model (sums, transcendentals,
hidden length scales, dimensionless numbers, and pure counts are excluded and
logged); v0.35.0–v0.36.0 then encoded that non-monomial backlog as the first
**L1-sum canonical tier** — 10 famous non-monomial laws (Bernoulli, radioactive
decay, the photoelectric equation, Carnot efficiency, the Boltzmann factor, the
Lorentz factor, Compton shift, the Rydberg formula, Snell's law, Malus's law) —
each carrying a full L1 `scalarAst` with engine-derived `monomial:null` +
`freeGroups ≥ 1`, measured to produce **zero structural bridge-matches**
(reference-completeness of the L-layer, not bridge-validation, stated without
inflation). v0.35.0 also added the **BE-51 gravitational-lensing confrontation**,
completing the third classic GR test (data-confronted bridges 5 → 6).

**Version 0.37.0** shipped the **PI-instrument program**, reframing UPT as an
honest falsification instrument (a trustworthy *no*, an extraordinary *yes* —
see North Stars above): the **epistemic-grounding ledger** on every `upt
discover` verdict (`src/composition/grounding.ts`, `describeGrounding` — which
falsifiers passed vs. the gaps, annotation-only) and the **BE-21 KSS
viscosity-bound confrontation** (data-confronted bridges 6 → 7 — the quark-gluon
plasma nearly saturates the 1/4π bound). A mechanism-tier gate and a
propose→confront loop were each evaluated and resolved to honest not-build /
boundary — not buildable on dimensional candidates without fabricating physics
the catalog lacks; BE-53 (Yang–Mills β vs. α_s running) was deferred for the
same reason.

**Versions 0.38.0–0.40.0** grew the evidence spine to **9** and hardened its
honesty: v0.38.0 found **0 of 7** candidate graph connectors genuine on
adjudication (the isolated-bridge frontier is isolated by physics, not
vocabulary) and grew the spine instead with the **BE-35 conformal-bootstrap
confrontation** (spine 7 → 8); v0.39.0 added the **BE-11 collisional-decoherence
confrontation** (spine 8 → 9), notable for an adversarial-review catch — both
reviewers returned fabricated cross-sections that fetching the primary arXiv
source disproved; v0.40.0 made `upt confront` surface the **BE-36 one-sided
caveat** (a pass that tests only half of an asymmetric bound no longer reads as a
clean two-sided one) and recorded the spine's honest rigor hierarchy — precision
GR at ~10⁻⁵ across two independent PPN parameters (γ twice, via Shapiro delay and
lensing; β once, via Mercury), not nine equal confirmations.

---

## Roadmap

The v0.5.0/v0.6.0 GR work landed the curvature, symplectic-integrator, Mercury-geodesic, and Shapiro-delay items that were the original v0.5.0+ roadmap; v0.7.x landed the intelligent-index and bridge-gradient layers; v0.8.0 landed the composition graph and the catalog adjudication; v0.9.0–v0.11.0 landed the flat-metric migration, Part-IX Phase C/D closure, and the full catalog→graph migration; v0.12–v0.13 landed the premise-extension + symbolic-composition tooling and the first two bounded foundation pieces (symbolic exponents; G-9 increment 1, the geometrized adapters); v0.14 landed the distributional/variational grammar primitives, the `BridgeEquations` facade, G-9 increment 2 (public geometrized adapters), and the `LabeledTensor` axis-order fix + `mergeAxes`/`splitAxis` (G-9 increment 3's default-pipeline migration was declined as a measured no-precision-win); **v0.15→v0.23** landed the canonical-equation L-layer + bridge↔canonical linkage (all released); **v0.24** landed the identity-consequence surfacer, the canonical-only discovery graph, and DGT-guided refactors; **v0.25–v0.27** landed physics-map visualization and the parser-consolidation arc; **v0.28–v0.29** landed a second canonical-L-layer expansion (26→66) and the first established-bridge real-data confrontation; **v0.30** landed the CLI overhaul; **v0.31–v0.33** completed the discovery-hardening program (adjudication ledger, axis falsifier, `upt confront`, consequence propagation); **v0.34–v0.36** grew the canonical L-layer 66→103 (the condensed-matter domain, the L1-sum non-monomial tier) and added the BE-51 lensing confrontation; **v0.37** landed the PI-instrument program (the epistemic-grounding ledger, the BE-21 KSS confrontation, reframing UPT as an honest falsification instrument); and **v0.38–v0.40** grew the evidence spine to 9 real-data confrontations (BE-35, BE-11) while hardening its honesty (the 0-of-7 connector adjudication, the BE-36 one-sided caveat, the rigor-hierarchy framing). The standing **physicist-review** surfaces remain (CONTRIBUTING.md tasks; the contested BE-44/46/50 adjudications; the C2/C3 calibration targets; the CI-1/CI-2 dynamic-scaling call) plus the §XXVII-B adjudication of the Part-XI machine-derived proposals. The forward roadmap is tracked in `todo.md` and the per-release planning docs under `docs/planning/`.

See `ARCHITECTURE.md` for detailed module design. See `COMPONENTS.md` for per-file component breakdown. See `DATAFLOW.md` for concrete data-flow traces through the system. See `API.md` for the public API reference.

---

**Maintained by**: Daniel Simon Jr.

## Verification

Generated by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/architecture`

| Claim | Value | Source |
|---|---|---|
| totalSourceFiles | 703 | dependency-graph.json |
| totalLinesOfCode | 109613 | dependency-graph.json |
| totalExports | 2373 | dependency-graph.json |
| entryRoots | 4 | dependency-graph.json |

**Two scopes, both correct.** The table above is **whole-repository** — `repo_map` counts
every TypeScript file git tracks, including `tests/`, `bench/`, `examples/` and `tools/`. The prose in this
document uses the **`src/` scope** produced by this repository's own generator
(`npm run docs:deps`): 290 files, 1967 exports, 986 of them re-exports. 703 and 290 do not
contradict each other; they answer different questions. Every figure states its scope.

**Claims the gate cannot hold.** Catalog figures — 55 bridge entries (IDs 11–65; 19
established, 33 speculative, 3 highly-speculative), 103 canonical equations, 41
composition-graph edges, 19 real-data confrontations — are properties of the physics catalog,
not of the dependency graph. They were measured by importing the built package and reading
`BRIDGE_EQUATIONS`, `CANONICAL_EQUATIONS`, `CATALOG_GRAPH` and `listConfrontations()` directly,
not taken from any metric. Re-measure the same way; `repo_map` cannot check them.

---

## Product A vs Product B (expression search)

`upt discover` remains the **quantity-identification** funnel (`VettedCandidate`, `a ≡ b`).
That funnel is frozen: it is not an AST generator. **Product B** (`src/composition/probe/`,
CLI `upt probe`, experimental subpath `universal-physics-tensor/probe`) searches scalar
expressions against residuals under a budget, with exploratory/holdout isolation and
corpus-relative novelty wording. Relation-link gaps stay Product A — `upt probe run`
abstains (`non-identifiable`) and redirects to `upt discover`. See
`docs/planning/Scientific-Bridge-Discovery-v1-Integration.md`.

