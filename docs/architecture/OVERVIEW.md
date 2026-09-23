# Universal Physics Tensor — Project Overview

---

## What Is This?

Universal Physics Tensor (UPT) is a **TypeScript dimensional-analyzer and bridge-equation library** for exploring unified physics through tensor formalism. It provides machine-readable encoding of 55 bridge equations that connect distinct physics regimes (quantum to classical, gravity to gauge, thermodynamics to information theory), paired with a layered computational backend that can validate, symbolically analyze, and numerically evaluate those equations.

The library serves two audiences: researchers who want to query the bridge-equation catalog and catch dimensional errors in novel formulations, and implementors who want to evaluate tensor contractions numerically, compute Christoffel symbols, or integrate geodesics in an arbitrary Lorentzian manifold.

---

## North Stars

Four goals govern every design choice in UPT:

1. **Bridges drive the work.** The 55 bridge equations in `src/bridges/` are the scientific core. Tooling, tests, and new capabilities exist to serve the catalog, not the other way around. A new feature earns its place by enabling or improving a bridge encoding.

2. **MathTS first-class.** `@danielsimonjr/mathts-tensor` is the preferred numerical backend. The `TensorEngine` interface keeps UPT backend-agnostic, but the selection of MathTSEngine as the intended default (when the optional dep is present) is a deliberate signal about the dependency shape of the ecosystem, not a performance claim.

3. **Integrated scientific environment.** UPT aims to be a self-contained environment for computational physics — Christoffel symbols, geodesic integration, curvature (Riemann/Ricci/Einstein/Weyl/Kretschmann), Killing-vector and Einstein-field-equation machinery, and symbolic composition and simplification (`src/composition/compose-symbolic.ts`, `src/composition/expr-simplify.ts`) — all sharing a common AST and type system.

4. **An honest falsification instrument.** The **PI-instrument program** reframed UPT explicitly as an instrument a physicist can stake a claim on: a trustworthy **no** and an extraordinary **yes**. The *no* is `upt discover`'s vetting funnel plus the epistemic-grounding ledger (`src/composition/grounding.ts`, which falsifiers actually passed vs. the gaps, on every verdict) — across every review round it has adjudicated **0 of 8** machine-surfaced candidate bridges as genuine, and a separate connector-adjudication pass found **0 of 7** candidate graph connectors genuine (the isolated-bridge frontier is isolated by physics, not vocabulary, not a vocabulary gap the tool can close). The *yes* is the evidence spine (`upt confront`): **19** real-data confrontations of catalog bridges (15 established, 4 speculative), including all three classic tests of general relativity — Mercury perihelion (0.26σ), Shapiro delay (0.91σ), gravitational lensing (0.67σ) — each within 1σ, honestly read as precision GR at ~10⁻⁵ across two independent PPN parameters (γ twice, β once) rather than nineteen equal confirmations.

---

## Five-Layer Architecture

UPT is organized into five conceptual layers that build on each other:

```
┌──────────────────────────────────────────────────────────────┐
│  Layer 5: Curvature / GR                                     │
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
│  BRIDGE_EQUATIONS (55 entries) + per-bridge evaluator        │
│  modules (be-*.ts) + BridgeEquationEntry metadata type +     │
│  membership criterion / negative catalog                     │
└──────────────────────────────────────────────────────────────┘
```

A bridge equation module at Layer 1 builds AST nodes at Layer 2, validates them with the dimensional algebra, optionally raises/lowers indices using Layer 3 metric primitives, and can be numerically evaluated through Layer 4. Layer 5 (the curvature / general-relativity layer) is built on top of Layers 2–4: its curvature node kinds are `ExprNode` members with their own validators and lowering arms, and its integrators reuse the same Christoffel-closure convention as the Layer-4 RK4 solver. Callers who only want catalog metadata (status, known issues, references) never touch layers 2–5.

Beside the layers sits a **composition graph** (`src/composition/`): bridges as `BridgeEdge` objects over `Quantity` endpoints, composable via `composeEdges`, with pre-registered calibration edges (including the first diagonal-law edge, `lawSchwarzschildRadius`). Its first derived result (CT-1) chains BE-42∘BE-16 to E_min(M) = ℏc³ln2/(8πGM). Catalog membership is computable (`src/bridges/membership.ts` + the `src/bridges/rejected.ts` negative catalog — see `v0.8.0-catalog-adjudication.md`), and GW170817 vs. BE-36 is a real-data confrontation. The graph has **41 edges**, a Phase-D candidate enumerator (`enumerateCompositions`), first-order uncertainty propagation (`propagateUncertainty`), and a name-collision namespacing gate (`CompositionAliasError` + `SOURCE_ALIAS_DISPOSITIONS` over 131 centralized `Quantity` nodes in `quantities.ts`); BE-23 vs. cuprate Planckian dissipation is another data confrontation. The 55-bridge catalog (41 graph edges) is validated against the **canonical L-layer** (`src/canonical/`, 107 equations — the textbook ground truth the catalog's bridges are checked against), and the real-data confrontations form an **evidence spine** of 19 (`upt confront` / `upt coverage`), carried in `src/bridges/confrontations.ts` + per-bridge `be*-confrontation.ts` evaluators.

---

## History and plans

What shipped, and when, is in `CHANGELOG.md`. Planned work is in `ROADMAP.md` and `todo.md`, and
the per-release planning docs are under `docs/planning/`.

See `ARCHITECTURE.md` for detailed module design. See `COMPONENTS.md` for per-file component breakdown. See `DATAFLOW.md` for concrete data-flow traces through the system. See `API.md` for the public API reference.

---

**Maintained by**: Daniel Simon Jr.

## Verification

Generated by `repo_map.py map`.
Regenerate: `python repo_map.py map <repo> --out <dir>` · Check: `python repo_map.py check <repo> --docs docs/architecture`

| Claim | Value | Source |
|---|---|---|
| totalSourceFiles | 845 | dependency-graph.json |
| totalExports | 3003 | dependency-graph.json |
| entryRoots | 5 | dependency-graph.json |

**Lines of code are not a gated claim.** They change on almost every edit, so a gated figure
would fail on every push and teach readers to update it without reading it. The current figure,
with its source and the date it was measured, is in `NOTES.md`. The gate holds only claims that
change when the STRUCTURE changes.

**Two scopes, both correct.** The table above is **whole-repository** — `repo_map` counts
every TypeScript file git tracks, including `tests/`, `bench/`, `examples/` and `tools/`. The prose in this
document uses the **`src/` scope** produced by this repository's own generator
(`bun run docs:deps`): 348 files, 2446 exports, 1229 of them re-exports. 845 and 348 do not
contradict each other; they answer different questions. Every figure states its scope.

> The `src/`-scope figures above are read from `statistics` in the generated
> `dependency-graph.json`, and **must be re-read from it after any regeneration** — they are the
> one place in this document where a generated number is restated in prose, so they go stale
> silently. The whole-repository figures in the table belong to `repo_map.py` and its own check
> gate; do not hand-edit them here.

**Claims the gate cannot hold.** Catalog figures — 55 bridge entries (IDs 11–65; 19
established, 33 speculative, 3 highly-speculative), 107 canonical equations, 41
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

