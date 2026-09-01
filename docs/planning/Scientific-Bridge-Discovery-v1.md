# Universal Physics Tensor — Scientific Bridge Discovery Program (v1)

**Status:** Codebase-grounded strategic implementation plan (second audit, 2026-08-19)  
**Package at audit:** `universal-physics-tensor@0.44.1` on `master`  
**Target:** a multi-release **0.x program** (this document’s “v1” is the program name, not an npm `1.0.0` bump)  
**Purpose:** give UPT a scientifically conservative way to (a) keep its existing coincidence-rejecting identification funnel honest, and (b) add a *separate* expression/residual search pipeline that locates structured gaps, generates physically constrained candidates, attempts to falsify them, and ranks measurements that would discriminate survivors.

> **Scientific boundary:** UPT is a hypothesis-generation, hypothesis-auditing, and experiment-prioritization instrument. It does not autonomously establish a new law of nature. A machine-generated candidate remains a candidate until independent scientific review, independent evidence, and appropriate replication justify a stronger status.

> **SemVer boundary:** Historical notes in `todo.md` use “v1.0” for an unrelated P6 composition milestone. This program does **not** retarget that milestone, does **not** imply `package.json` → `1.0.0`, and does **not** stabilize new public APIs before Phase 12. Until then every new type, CLI verb, and schema is experimental and off `src/index.ts`.

---

## 0. Audit history

This document has been audited twice. Trust this revision over the 2026-08 first-pass rewrite and over the original roadmap.

### 0.1 First correction (kept)

The original roadmap had a sound scientific direction but proposed a parallel UPT-inside-UPT. Those corrections remain binding:

1. Do not build a second UPT inside UPT (`constraints/`, `discovery/`, `evidence/` hierarchies).
2. Do not replace existing epistemic types (`CanonicalEquation.epistemicStatus`, `BridgeEquationStatus`, `VettedCandidate.verdict`, `AdjudicationVerdict`).
3. Do not call every represented relation a “law.”
4. Generalize the frontier beyond two theories.
5. Residuals are not always additive.
6. Avoid fabricated metadata.
7. Novelty cannot be proven by repository search.
8. Formal certificates have scoped meaning.
9. Causality is evidence-typed, not inferred from association.
10. Reproducibility is stronger than seed logging, weaker than universal bitwise determinism.
11. External discovery engines are untrusted plugins.
12. Experiment design needs feasibility and safety constraints.
13. Multiple-hypothesis control is mandatory.
14. Negative-result memory must be canonicalized.
15. Benchmarks need leakage protection and null science.
16. Candidate explosion needs hard resource governance.
17. Persistence needs versioned schemas.
18. Public API evolves additively first.
19. The active engineering backlog and this roadmap stay separate (`docs/planning/ACTIVE.md`).
20. “No credible candidate found” is a successful scientific outcome.

### 0.2 Second audit (2026-08-19) — what the first pass still got wrong

The first rewrite was reviewed as a standalone design. Re-reading `src/`, `cli/`, `docs/research/`, and the frozen discovery-hardening / PI-instrument results shows the plan still proposed a **second discovery product on top of a mature identification funnel**, while talking as if that funnel should be “evolved.” That is a category error. Concrete collisions:

| # | First-pass claim | What the repo actually has | Binding correction |
|---|---|---|---|
| 1 | “Evolve `src/composition/discovery.ts` rather than replace it.” | `discovery.ts` vets **quantity identifications** `a ≡ b`. It is a coincidence-rejector with pinned funnel counts (`tests/composition/discovery-calibration.test.ts`: catalog 132 / 7 promising / 35 inert / 20 magnitude-clash / 0 contradictory / 70 axis-clash) and **0/8 genuine** human adjudications. | **Freeze the identification funnel.** Expression/residual search is a new pipeline in new files. Do not morph `VettedCandidate` into an equation generator. |
| 2 | CLI `upt discover run`, `upt discover candidates`, `upt discover falsify`. | `upt discover` already exists and is the identification vetter. `upt candidates` already exists (raw same-dimension pairs). The CLI is a **flat** verb registry (`src/cli/command.ts`); there is no nested-subcommand dispatcher. | New work uses a new verb `upt probe`. Never hijack `discover` / `candidates` / `ground` / `connectors` / `predict`. |
| 3 | `IdentifiabilityAssessment.status = identifiable \| …` with optional `rank`. | `classifyIdentifiability` answers a **graph-structural** question (`given` / `under-determined` / `exactly-determined` / `over-determined`) over `BridgeEdge`s. It is not Jacobian rank of free parameters vs data. | Keep both concepts. Do not reuse the existing type for parametric identifiability. |
| 4 | New `src/research/` and `src/data/`. | `docs/research/` is the scientist-facing research corpus. Repo-root `data/` already holds `bridge-catalog.json` + `bridge-catalog.schema.json`. `src/` has ten physics modules and no generic “data” layer. | No `src/research/`, no `src/data/`. Run schemas live next to the existing catalog artifact pattern under `data/`. Probe code lives under `src/composition/probe/`. |
| 5 | `docs/architecture/adr/` for Phase 0A. | There is **no** ADR directory. Repo standard is `docs/planning/<Name>-Design.md` (+ Implementation-Plan + Review-Findings) and, for SDD programs, `docs/superpowers/specs/`. | Phase 0A writes `docs/planning/Scientific-Bridge-Discovery-v1-Integration.md`. |
| 6 | Tranche A “two rediscovery fixtures” + “existing discovery/retrodiction/dimensional machinery only” + §23 pendulum/Newton/Kepler ladder. | Existing machinery cannot rediscover a pendulum equation. It can rediscover/reject `a ≡ b`. The pendulum ladder needs a generator that does not exist until Phase 3. | Split fixtures by product. Tranche A scores **hand-authored** expression candidates against blind fixtures; it does not rebuild `discovery-calibration.test.ts`. |
| 7 | Phase 3 generates; Phase 5 adds holdouts and multiple-hypothesis control. | Discovery-hardening Unit B was **cancelled** because a coincidence generator produced ~730 expected chance hits. Generating first and calibrating later repeats that failure. | Budgets, abstention, holdout isolation, and MHC *metadata* ship with the first generator. Full FDR machinery can deepen later; uncalibrated search cannot ship first. |
| 8 | Phase 11 “scientist workbench and visualization.” | `upt map --format=mermaid\|dot\|svg` already exists. `docs/planning/Future-Production-Hardening.md` parks interactive viz in a **separate future repo**. | Phase 11 is CLI reports + reuse of `graph-viz`. No in-package workbench UI. |
| 9 | Python/SINDy/PySR as generation backends. | `CLAUDE.md`: TypeScript ESM, vitest, **no Python in the codebase**, zero hard deps. Optional peers degrade gracefully. | External solvers are user-supplied out-of-process executables. This repo never vendors Python, SINDy, or PySR. Native TypeScript enumerator is the only in-tree generator. |
| 10 | `relationKind: 'field-equation'` beside `'canonical-equation'`. | `CanonicalEquation` already has L0/L1/L2 fidelity (`dimensional` / `scalarAst` / `fieldEquation`). `FieldEquationNode` is **Einstein-only** and is not a general discovery IR. | Overlay metadata; do not fork L2 into a sibling kind. Do not build field-equation search on an unread Einstein-only node. |
| 11 | Inventory `PhysicalLaw` as textbook ground truth. | `PhysicalLaw` / core `BridgeEquation` are the **legacy tensor-cell** surface (`src/core/types.ts`) with numeric `confidence`. Textbook ground truth is `CanonicalEquation`. Catalog status is `BridgeEquationStatus`. Eve already forbade a `confidenceToStatus` adapter (`src/core/cell.ts`). | Overlay targets `CanonicalEquation` and catalog `BridgeEquationEntry`. Leave numeric `confidence` in place. Do not reopen the adapter. |
| 12 | New equivalence engine / rejection registry / evidence profile / dataset / uncertainty ladder as if greenfield. | Already shipped: `canonical/normal-form.ts`, `canonical/linkage.ts`, `composition/adjudication.ts`, `bridges/rejected.ts`, `bridges/observations/types.ts`, `bridges/confrontations.ts` (`ConfrontationOutcome` + `residualInSigma` + rigor hierarchy), `composition/uncertainty.ts`, `diff/bridge-ast-gradient.ts`, `composition/proposed-bridges.ts` (`status: 'unadjudicated'`), `composition/grounding.ts`, `composition/consequence.ts`, `composition/user-equation.ts`, `composition/enumerate.ts` (pairwise **edge** composition, not AST search). | Extend those modules. Do not duplicate them under new names. |
| 13 | “Reuse existing identifiability / discovery / grounding as pipeline stages of equation search.” | PI-instrument Phases 2–3 measured **permanent ceilings** on identification candidates: `mechanismTested: false`, `dataTested: false`. A propose→confront loop over dimensional candidates was **not buildable**. | Those ceilings remain for Product A. Product B (expression search) may fit data only when the candidate is an actual expression against an actual dataset, and still cannot call that a new law. |
| 14 | Example ids `BG-104`. | Catalog ids are `be-NN` / `CE-*`. `BG-` looks like a leftover `BridgeGap`. | Frontier ids are `fg-*`. Probe runs are `dr-*`. Expression hypotheses are `h-*`. |
| 15 | Single `CandidateHypothesisRecord.status` plus “transitions are append-only.” | A single overwritten field is not an audit log. | Persist an append-only `statusHistory` (or event log) *and* a derived current status. |
| 16 | `ScientificRelationRecord` as the general type wrapping everything. | Three computational relation types plus two review-surface types already exist. A fourth envelope is justified only as **optional overlay**, never as a replacement model and never as a forced 100% migration. | Phase 1 may introduce the overlay. Existing records default to `not-yet-audited` / empty assumptions. Coverage metrics distinguish schema vs audited vs verified. |
| 17 | Discovery-hardening closed with “the honest move is to stop adding discovery machinery” on the monomial identification funnel. | Still true for Product A. | Product A is frozen except bugfixes and catalog-driven pin updates. Product B is allowed only because it is a different scientific question (residual/expression search with data), and only if Task-0 measurements show non-noise yield or honest abstention. |
| 18 | `rankDiscoveries` / `VettedCandidate` described as internal. | Both are **already on the public surface** (`src/index.ts`). `describeGrounding` and `classifyIdentifiability` are too. | Additive public API only. Do not break or semantically overload these exports. |
| 19 | Top-level `benchmarks/discovery/`. | `bench/` is the Vitest performance harness. `tests/composition/discovery-calibration.test.ts` is the identification calibration gate. | Expression-search fixtures live at `tests/fixtures/discovery/<case>/{public,scorer}/`. |
| 20 | Phase 8 “symmetry discovery” adjacent to `axes.ts`. | Rank-7 symmetry/topology/statistics axes **classify but do not gate** (`checked=0/fires=0`). Inferred symmetries are a different problem. | Inferred structure never silently flips `gated: true` on an axis. |

These corrections are requirements, not suggestions.

---

## 1. Mission and scientific contract

UPT should answer a more useful question than “what equations can be combined?”

> **Where does the current model set fail to explain, predict, connect, or distinguish the available evidence; what minimal physically admissible hypotheses could close that gap; and what evidence would most efficiently reject or discriminate those hypotheses?**

That question splits into **two products**. Mixing them is how the first-pass plan would have destroyed a working coincidence-rejector.

### 1.1 Product A — identification funnel (shipped, frozen)

**Question:** are two same-dimension quantities in different graph clusters the same physical quantity?

**Loop (already implemented):**

```text
proposeLinkCandidates (upt candidates)
        │
        ▼
rankDiscoveries (upt discover)
  magnitude → numerical consistency (retrodict) → axis-clash → structural unlock
        │
        ├─ annotateAdjudications (review memory)
        ├─ annotateConsequences (entailed / novel-consequence / inconclusive)
        └─ describeGrounding (passed vs gaps; mechanismTested=false; dataTested=false)
        │
        ▼
human adjudication (genuine / decoy / entailed / deferred)
        │
        └── firewall: no machine verdict mutates BRIDGE_EQUATIONS or CANONICAL_EQUATIONS
```

**Honest result at HEAD:** UPT is a rigorous coincidence-rejector on this question (0 genuine identifications). Further Product A machinery was evaluated and correctly **not built** (cross-cluster Buckingham-π numerology, statistical magnitude gate, non-monomial symbolic deepening, E-layer coarse-graining, mechanism-proxy on candidates, propose→confront on candidates). See `docs/research/v0.33.0-discovery-hardening-results.md` and `docs/research/pi-instrument-results.md`.

Product A changes in this program are limited to: bugfixes, catalog-driven calibration-pin updates, and *read-only* wrapping of its outputs as `FrontierGap` objects of kind `relation-link`.

### 1.2 Product B — expression / residual search (new)

**Question:** given a baseline relation (or none) plus observations, what minimal physically typed correction or relation is admissible, and what would kill it?

**Loop (to build):**

```text
Existing UPT knowledge graph
  canonical relations + bridges + quantities + regimes + constraints
                       │
                       ├──────────────┐
                       ▼              ▼
                 observations     assumptions
                       │              │
                       └──────┬───────┘
                              ▼
                       frontier analysis (wrap Product A where the gap is a link;
                                         new scanners only for residuals / model disagreement)
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
           explained                    gap found
                                            │
                                            ▼
                         identifiability gate (graph-structural and/or parametric)
                                            │
                                            ▼
                                constrained generation (native enumerator first)
                                            │
                                            ▼
                              canonicalize / deduplicate (normal-form.ts)
                                            │
                                            ▼
                         dimensional / structural / limit gates
                                            │
                                            ▼
                           fit + uncertainty + locked hold-out
                                            │
                                            ▼
                                  adversarial falsification
                                            │
                                            ▼
                          corpus comparison (canonical + catalog + normalForm)
                                            │
                                            ▼
                          candidate set or explicit abstention
                                            │
                                            ▼
                              discriminating experiment design
                                            │
                                            ▼
                                      new evidence
```

Product B is the only place grammar enumeration, residual search, external solvers, experiment design, and run manifests belong.

### 1.3 Claims UPT may make (either product)

UPT may report that a candidate is:

- syntactically valid;
- dimensionally valid under specified unit conventions;
- tensor/index structurally valid;
- compatible with named symmetry or conservation constraints **that were imposed**;
- derivable from named premises within a supported formal fragment;
- empirically fitted to named data with an explicit dataset role;
- predictive on a locked held-out dataset that did not influence generation or selection;
- robust or fragile under named perturbations;
- consistent or inconsistent with named known limits;
- falsified by a specified counterexample;
- not matched by automated equivalence search in a specified indexed corpus;
- worth expert review under a transparent ranking policy;
- **not found** — abstention under a named stop reason.

### 1.4 Claims UPT must not make autonomously

UPT must not conclude merely from computation that a candidate is:

- a newly discovered law of nature;
- physically true;
- experimentally confirmed when only fit data were used;
- novel in the scientific literature without a documented literature review;
- causal from observational association alone;
- universally valid outside its declared regime;
- proven physically true because a theorem solver found it mathematically consistent;
- a genuine quantity identification (`a ≡ b`) without human adjudication;
- mechanism-tested, if it is a Product A dimensional candidate.

### 1.5 Required epistemic labels (Product B)

Every **generated** scientific claim has a machine-readable status drawn from a deliberately conservative lifecycle. This enum is **orthogonal** to `VettedCandidate.verdict` and `AdjudicationVerdict` and must not absorb them.

```ts
export type ProbeCandidateStatus =
  | 'generated'
  | 'structurally-valid'
  | 'empirically-fit'
  | 'heldout-supported'
  | 'falsification-survivor'
  | 'expert-review-required'
  | 'rejected'
  | 'falsified'
  | 'equivalent-known'
  | 'insufficient-evidence';
```

No status named `discovered-law`, `confirmed-law`, `genuine`, or equivalent is created by the automated Product B pipeline. Promotion of a survivor into the catalog still requires the Part-VI §XXVII-B human firewall (citation + review), the same firewall Product A already enforces.

---

## 2. Architectural principle: two products, existing layers, no parallel UPT

The v1 discovery **platform** is an orchestration and metadata expansion of existing UPT, not a replacement architecture — but “orchestration” does not mean stuffing equation search into `discovery.ts`.

### 2.1 Existing capabilities that remain authoritative

| Concern | Existing home | v1 action |
|---|---|---|
| legacy tensor-cell types (`PhysicalLaw`, core `BridgeEquation`, `EmergentPhenomenon`) | `src/core/types.ts`, `src/core/cell.ts` | leave in place; do not treat as L-layer ground truth |
| Cell confidence vocabulary | `CellConfidence` (no `confidenceToStatus` adapter — Eve-R3) | do not reopen |
| textbook/canonical equations | `src/canonical/` (`CanonicalEquation`, L0/L1/L2, `epistemicStatus`) | optional metadata overlay; do not duplicate registry |
| structural hash / F4 circularity | `src/canonical/normal-form.ts` | **the** cheap algebraic fingerprint for Product B |
| bridge↔canonical linkage | `src/canonical/linkage.ts`, `upt recover` | reuse as known-equivalent / limit partner checks |
| dimensions, Buckingham-π, AST, validator | `src/dimensional/` (`ast-types.ts` owns `ExprNode`) | generation-time typing extends this grammar; no parallel grammar |
| user-authored equations | `src/composition/user-equation.ts`, `upt map --equation` | injection path for human-authored Product B candidates |
| automatic differentiation | `src/diff/` (`bridgeGradientAST`, numerical FD fallback) | reuse for parametric Jacobians where the candidate is an `ExprNode` |
| first-order independent-input σ propagation | `src/composition/uncertainty.ts` (`propagateUncertainty`) | reuse; covariance-aware path is new and must be explicit |
| bridge catalog + evaluators | `src/bridges/index.ts`, per-bridge modules | add provenance hooks only; never auto-mutate |
| observational confrontation | `src/bridges/observations/types.ts`, `confrontations.ts`, `upt confront` | **the** empirical spine; Product B datasets adapt *to* this model, they do not replace it |
| negative catalog | `src/bridges/rejected.ts` | keep; Product B rejections are a different keyed store |
| quantity graph, axes, identifiability, retrodiction | `src/composition/` | Product A stays here; Product B reads these, does not overwrite them |
| identification vetting | `src/composition/discovery.ts`, `upt discover` | **frozen Product A** |
| raw link proposals | `src/composition/bridge-analysis.ts`, `upt candidates` | wrap as `relation-link` gaps only |
| isolated-bridge frontier | `upt connectors` | wrap as `relation-link` / connectivity gaps |
| empty-regime hypotheses | `upt predict` | wrap as `regime-transition` / missing-link gaps |
| grounding ledger | `src/composition/grounding.ts`, `upt ground` | Product A only; do not claim `dataTested` on dimensional IDs |
| adjudication ledger | `src/composition/adjudication.ts` | Product A review memory; do not key expression rejections here |
| identity-consequence proposals | `src/composition/proposed-bridges.ts`, `upt discover --derive` | stays `unadjudicated`; never a catalog write path |
| pairwise **edge** enumeration | `src/composition/enumerate.ts` | not an AST generator; do not rename or overload |
| map rendering | `src/composition/graph-viz.ts`, `upt map` | Phase 11 reuses this |
| public package surface | `src/index.ts` | add only after Phase 12; probe types stay off-root |
| CLI | `src/cli/` flat `registerCommand` | one new verb `probe`; no nested-registry rewrite required (`positionals` already exist) |
| JSON catalog artifact + schema | `data/bridge-catalog.json`, `data/bridge-catalog.schema.json` | pattern to copy for run manifests |
| performance benches | `bench/` | not a discovery-science fixture tree |
| identification calibration gate | `tests/composition/discovery-calibration.test.ts` | frozen Product A pins |

### 2.2 Binding ceilings from completed programs

These are not backlog items. They are **scope boundaries**:

1. **Product A is a coincidence-rejector, not a unification engine.** 0/8 genuine. Do not add gates whose only effect is to manufacture a `genuine` or a `promising` that the existing falsifiers would have killed.
2. **No mechanism test on dimensional identification candidates.** `mechanismTested` stays `false`. Axis-compatibility is a regime proxy.
3. **No data confrontation on dimensional identification candidates.** `dataTested` stays `false` until a candidate is promoted (human + citation) into an established bridge.
4. **No cross-cluster Buckingham-π “constant hunter.”** Measured numerology (~730 expected chance hits). Multiple-hypothesis control exists because this happened.
5. **No E-layer coarse-graining encoded as `CanonicalEquation`.** Category error; accepted boundary.
6. **`FieldEquationNode` is Einstein-only and unread as a discovery IR.** L2 field-equation search is out of scope until a non-inert field-equation consumer exists.
7. **Rank-7 axes (symmetry / topology / statistics) classify; they do not gate** until `auditAxisDiscrimination` shows they fire. Inferred symmetries do not flip `gated`.
8. **Catalog is code.** Machine extraction, probe runs, and datasets never silently write `BRIDGE_EQUATIONS`, `CANONICAL_EQUATIONS`, or `ADJUDICATIONS`.
9. **Zero hard dependencies.** Optional peers already used: `@danielsimonjr/mathts-*`, `@viz-js/viz`. Probe backends follow the same degrade-to-absent rule.
10. **No Python in this repository.** External workers are opt-in executables the operator provides.

### 2.3 Where new code goes

Only Product B orchestration that does not belong inside an existing physics file gets a new home, and that home is a **subfolder of composition**, not a new top-level module:

```text
src/composition/probe/          # Product B only; name chosen so it cannot be
                                # confused with discovery.ts (Product A)
  types.ts                      # ProbeCandidateStatus, SearchBudget, FrontierGap, …
  run-manifest.ts               # DiscoveryRunManifest v0
  frontier.ts                   # wrappers over candidates/connectors/predict + residual gaps
  residual.ts                   # DiscrepancyDefinition
  generator.ts                  # native bounded enumerator (Phase 3)
  fingerprint.ts                # wraps canonical/normal-form.ts + extra signatures
  candidate-store.ts            # append-only status history + rejection registry (expressions)
  search-budget.ts
  backend-protocol.ts           # types + validation; no in-tree worker implementations
  experiment-design.ts          # Phase 9
  scoring.ts                    # Pareto vector for probe candidates only

src/canonical/
  scientific-relation-metadata.ts   # optional overlay (Phase 1); does not replace CanonicalEquation

src/bridges/observations/
  types.ts                      # EXISTS — extend, do not fork
  dataset.ts                    # ScientificDataset adapters when Product B needs them (Phase 4/5)
```

**Forbidden new trees:** `src/research/`, `src/data/`, `src/constraints/`, `src/discovery/`, `src/evidence/`, `docs/architecture/adr/`, top-level `benchmarks/`.

Exact filenames may shift in the Phase 0A integration note; the invariant is **no parallel duplicate subsystem** and **no Product A file becoming a Product B God-object**.

`src/cli/commands/probe.ts` is the single new command module. It dispatches on `args.positionals[0]` (`scan` / `show` / `run` / …). That matches the existing parser (unknown tokens become positionals) and does not require a nested command registry.

---

## 3. Scientific relation metadata: additive overlay, not a replacement model

UPT already has several computational relation types. Product B may add a normalized metadata envelope that *points at* them. It does not become the registry.

```ts
export type RelationKind =
  | 'definition'
  | 'canonical-equation'      // CanonicalEquation (L0/L1/L2 live on that object)
  | 'bridge-equation'         // catalog BridgeEquationEntry
  | 'approximation'
  | 'effective-relation'
  | 'phenomenological-relation'
  | 'computational-predicate'
  | 'candidate-hypothesis'    // Product B only
  | 'quantity-identification'; // Product A VettedCandidate; never auto-promoted

export type AuditState =
  | 'verified'
  | 'partially-verified'
  | 'not-yet-audited'
  | 'unknown'
  | 'not-applicable';

export interface ScientificRelationRecord {
  readonly relationId: string;
  readonly relationKind: RelationKind;
  readonly sourceRef: ScientificRelationRef;
  readonly assumptions: readonly AuditedTextClaim[];
  readonly validity: ValidityEnvelope;
  readonly provenance: ProvenanceBundle;
  readonly evidence: EvidenceProfile;
  readonly limits: readonly RelationLimit[];
  readonly schemaVersion: string;
}
```

`field-equation` is **not** a `RelationKind`. A canonical entry with `fieldEquation` set is still `canonical-equation`; consumers read `CanonicalEquation.epistemicStatus` and the optional `fieldEquation` field.

### 3.1 No forced migration by fabrication

Existing records, if wrapped at all, migrate with truthful states:

```ts
{
  assumptions: [],
  validity: { auditState: 'not-yet-audited' },
  provenance: { auditState: 'partially-verified', sources: [/* existing references[] */] }
}
```

`CanonicalEquation.assumptions` is already `readonly string[]`. The overlay may cite those strings; it may not invent new ones to look complete.

Coverage metrics distinguish schema coverage, audited coverage, verified coverage, and unknown/not-applicable coverage.

### 3.2 Evidence is a vector, and quantitative confrontation stays quantitative

Existing numeric `confidence` fields on `PhysicalLaw` / core `BridgeEquation` remain backward compatible and are **not** interpreted as posterior probabilities.

`upt confront` already reports `residualInSigma`, `withinObserved`, rigor tier (`stringent` | `moderate` | `loose`), and optional `caveat` (BE-36 one-sided bound). Product B must not collapse that into a categorical `theoreticalSupport: 0.83` or even into a five-way `supported/mixed` that hides the residual.

```ts
export interface EvidenceProfile {
  readonly theoretical: EvidenceAssessment;
  readonly empirical: EvidenceAssessment;
  readonly replication: EvidenceAssessment;
  readonly regimeCoverage: EvidenceAssessment;
  readonly provenanceQuality: EvidenceAssessment;
  /** Present when a ConfrontationOutcome or probe fit exists; never a substitute for it. */
  readonly quantitativeRef?: {
    readonly confrontationBridgeId?: number;
    readonly residualKind?: DiscrepancyKind;
    readonly residualSummary?: string;
  };
}

export interface EvidenceAssessment {
  readonly state: 'supported' | 'mixed' | 'unsupported' | 'unknown' | 'not-applicable';
  readonly rationale?: string;
  readonly sourceIds?: readonly string[];
}
```

No fake precision such as `theoreticalSupport: 0.83` without a documented statistical interpretation.

---

## 4. Frontier model: wrap what already scans, then add residual gaps

The pairwise `BridgeGap(sourceTheory,targetTheory)` model was too narrow. v1 uses a typed frontier object. **Most “relation-link” and “missing-regime” gaps are already scanned.**

```ts
export type FrontierGapKind =
  | 'prediction-residual'     // Product B; needs observations + a baseline predictor
  | 'relation-link'           // WRAP proposeLinkCandidates / connectors
  | 'regime-transition'       // WRAP predictMissingBridges (empty scale×force cells)
  | 'parameter-tension'
  | 'assumption-conflict'
  | 'missing-operator'
  | 'unexplained-observation'
  | 'model-disagreement'      // two named predictors of the same observable
  | 'causal-mechanism'        // only with an explicit causal model (Phase 8+; default unused)
  | 'other';

export interface FrontierGap {
  readonly id: string;        // fg-*
  readonly kind: FrontierGapKind;
  readonly participants: readonly ScientificRelationRef[];
  readonly observations: readonly ObservationRef[];
  readonly regimes: readonly RegimeRef[];
  readonly assumptions: readonly AssumptionRef[];
  readonly constraints: readonly ConstraintRef[];
  readonly discrepancy?: DiscrepancyDefinition;
  readonly evidence: GapEvidence;
  readonly identifiability: IdentifiabilityAssessment;
  readonly searchability: SearchabilityAssessment;
  readonly status: 'identified' | 'searchable' | 'underdetermined' | 'resolved' | 'retired';
}
```

Phase 2 scanners, in order:

1. **Wrap Product A** — each `LinkCandidate` / connector / `predictMissingBridges` row can be projected to a `FrontierGap` with stable `fg-*` ids derived from existing candidate ids (`candidateId(a,b)` already exists). Aliases in `QUANTITY_IDENTIFICATIONS` / `SOURCE_ALIAS_DISPOSITIONS` are not gaps.
2. **Prediction residual** — only when a named baseline (bridge evaluator, canonical scalarAst, or user equation) plus a `ScientificDataset` exist. This is the first *new* scanner and it is Product B’s actual opening.
3. **Model disagreement** — only when two named predictors share an observable. Do not invent a second model to create a gap.

Do not implement `missing-operator` or `causal-mechanism` scanners in early phases; they have no honest data source in the current catalog.

### 4.1 Frontier detection is conservative

A scanner may identify a **candidate gap**, but expert/domain policy decides whether it is scientifically meaningful. Suppress or label:

- unit convention mismatches (the quantity graph already documents GeV vs J and bits/nats hazards);
- variable aliases (`QUANTITY_IDENTIFICATIONS`);
- known approximations outside their domain (`ValidityDomain` on edges);
- duplicate representations (`normalForm` / `classifyLinkage`);
- calibration artifacts;
- incompatible experimental definitions;
- numerically insignificant discrepancies;
- look-elsewhere effects (MHC metadata).

### 4.2 Identifiability before generation

A gap that cannot constrain any candidate must not trigger an expensive search. Two **different** questions:

```ts
export type IdentifiabilityKind = 'graph-structural' | 'parametric';

export interface IdentifiabilityAssessment {
  readonly kind: IdentifiabilityKind;
  /** Product A / relation-link: reuse classifyIdentifiability(). */
  readonly graph?: IdentifiabilityResult;
  /** Product B: Jacobian / design-matrix rank vs locked observations. */
  readonly parametric?: {
    readonly status: 'identifiable' | 'partially-identifiable' | 'non-identifiable' | 'unknown';
    readonly rank?: number;
    readonly nParameters?: number;
    readonly nIndependentObservations?: number;
    readonly reasons: readonly string[];
  };
}
```

`graph-structural` `under-determined` is a successful abstention for relation-link search. `parametric` `non-identifiable` is a successful abstention for expression search. Do not translate one into the other.

---

## 5. Residual semantics

Residual discovery is the highest-value *new* Product B capability. “Residual” must be explicit about mathematical meaning. Existing `residualInSigma` is **absolute additive scalar** `|y_pred − y_obs| / σ` and remains the confrontation spine’s function. Product B may choose a different discrepancy per run; it must not silently replace `residualInSigma`.

```ts
export type DiscrepancyKind =
  | 'additive'        // y_obs - y_pred
  | 'relative'        // (y_obs - y_pred) / scale
  | 'log-ratio'       // log(y_obs / y_pred)
  | 'standardized'    // covariance-normalized residual (generalizes residualInSigma)
  | 'likelihood'      // -log p(data | model)
  | 'vector'
  | 'tensor'
  | 'distributional'
  | 'operator'
  | 'custom';

export interface DiscrepancyDefinition {
  readonly kind: DiscrepancyKind;
  readonly observableIds: readonly string[];
  readonly covarianceRef?: string;
  readonly implementationRef?: string;
}
```

Examples:

\[
\Delta y = y_{obs}-y_{0},
\qquad
r = \Sigma^{-1/2}(y_{obs}-y_0),
\qquad
\Delta \mathcal L = \mathcal L-\mathcal L_0.
\]

The engine searches for the **smallest useful correction under the chosen discrepancy semantics**, not automatically an additive term.

Phase 4 implements `additive`, `relative`, and `standardized` on scalars first. `vector` next. `tensor` / `operator` / `distributional` / `custom` only after the scalar path has blind-benchmark evidence.

---

## 6. Candidate representation and lifecycle

`VettedCandidate` remains the Product A object. Product B introduces a **discriminated** envelope. One record type with `expression: ExprNode | FieldEquationRef | LinkIdentificationRef` is how the first-pass plan smuggled Product A into Product B. Do not do that.

```ts
export type ProbeCandidateOrigin =
  | { readonly kind: 'grammar-enumerator'; readonly runId: string }
  | { readonly kind: 'external-backend'; readonly backendId: string; readonly runId: string }
  | { readonly kind: 'human-authored'; readonly source: string }; // user-equation.ts / --equation

export type ProbeCandidateBody =
  | { readonly kind: 'scalar-expr'; readonly expression: ExprNode }
  | { readonly kind: 'correction'; readonly baselineRef: ScientificRelationRef; readonly correction: ExprNode; readonly discrepancy: DiscrepancyDefinition };

export interface ProbeCandidateRecord {
  readonly id: string;                 // h-*
  readonly gapId: string;              // fg-*
  readonly body: ProbeCandidateBody;
  readonly origin: ProbeCandidateOrigin;
  readonly assumptions: readonly AssumptionRef[];
  readonly validity: ValidityEnvelope;
  readonly status: ProbeCandidateStatus;          // derived from history
  readonly statusHistory: readonly StatusEvent[]; // append-only
  readonly evaluations: readonly CandidateEvaluationRef[];
  readonly fingerprint: CandidateFingerprint;
  readonly complexity: ComplexityMetrics;
  readonly schemaVersion: string;
}
```

Quantity identifications stay `VettedCandidate`. If a UI wants a unified inbox, it is a **view** over both types, not a common persisted record.

### 6.1 Product B state machine

```text
generated
   │
   ├─ invalid structure ───────────────→ rejected
   ▼
structurally-valid
   │
   ├─ known equivalent (normalForm / linkage / corpus) → equivalent-known
   │
   ├─ no data / non-identifiable ──────→ insufficient-evidence
   ▼
empirically-fit          (exploratory-fit dataset only)
   │
   ├─ fails locked holdout ────────────→ rejected
   ▼
heldout-supported
   │
   ├─ counterexample / known bound ────→ falsified
   ▼
falsification-survivor
   ▼
expert-review-required
```

Typed-by-construction generation may enter at `structurally-valid`. Theoretical-only candidates (no dataset) must stop at `insufficient-evidence` or `equivalent-known`; they cannot skip into `heldout-supported`.

`StatusEvent` is the audit object (`from`, `to`, `reason`, `runId`, `timestamp`). Reloading a record recomputes `status` as the last event’s `to`; a rejected candidate cannot become accepted by serialization round-trip.

---

## 7. Physics-typed generation grammar

The existing AST/dimensional validator is the foundation (`src/dimensional/ast-types.ts`, `validator.ts`). Product B adds **generation-time** typing so invalid expressions are avoided rather than generated and discarded. This is not a second grammar file named `physics-typed-grammar.ts`. The enumerator consults the same `validate()` rules:

- `[a+b]` requires `[a]=[b]`;
- `log` / `exp` / `sin` require dimensionless arguments (already enforced);
- `^` with a non-literal exponent is legal only on a dimensionless base (already enforced);
- tensor contraction requires compatible index spaces (existing tensor validators).

Generation may carry additional *search* attributes (positivity, regime, unit convention) as enumerator state, not as a shadow type system.

### 7.1 Generation API

```ts
export interface CandidateGenerator {
  readonly id: string;
  generate(problem: SearchProblem, ctx: SearchContext): AsyncIterable<RawCandidate>;
}
```

`SearchContext` always includes a `SearchBudget`. The native enumerator is deterministic and seed-independent in visit order. Stochastic backends declare `deterministic: 'seeded' | 'no'`.

---

## 8. Search budgets, stopping, and candidate explosion

No Product B search is unbounded. Product A is already finite (catalog pair set); do not invent AST-depth budgets for `rankDiscoveries`.

```ts
export interface SearchBudget {
  readonly maxCandidates: number;
  readonly maxAstDepth: number;
  readonly maxOperators: number;
  readonly maxDerivativeOrder: number;
  readonly maxEvaluations: number;
  readonly maxWallClockMs: number;
  readonly maxResidentMemoryBytes?: number;
  readonly maxExternalProcesses?: number;
}
```

A search terminates with an explicit reason:

```ts
export type SearchStopReason =
  | 'exhausted-space'
  | 'candidate-limit'
  | 'evaluation-limit'
  | 'time-limit'
  | 'memory-limit'
  | 'cancelled'
  | 'sufficient-candidates'
  | 'non-identifiable'
  | 'no-credible-candidate';
```

Budget exhaustion returns a **valid partial result** plus `stopReason`. `no-credible-candidate` is a successful scientific outcome.

### 8.1 Search strategy progression

Implement in increasing sophistication:

1. bounded deterministic enumeration (reference implementation and benchmark oracle);
2. canonical deduplication via `normalForm` + probe fingerprints;
3. dimension/signature indexing;
4. memoized partial-expression evaluation;
5. best-first or beam search using transparent heuristics recorded in the run manifest;
6. optional stochastic/external generators (Phase 7; never in-tree Python).

---

## 9. Canonical equivalence and negative-result memory

Different syntax must not be mistaken for different physics. **Start from `normalForm()`.** It already hashes scalar `ExprNode`s up to dimensionless multiplicative constants while keeping named non-constant stubs distinct.

### 9.1 Fingerprint levels

```ts
export interface CandidateFingerprint {
  readonly syntaxHash: string;
  readonly canonicalAstHash: string;      // normalForm()
  readonly dimensionalSignature: string;  // format(validate(...))
  readonly regimeSignature: string;
  readonly assumptionSignature: string;
}
```

Equivalence checks progress from cheapest to strongest:

1. exact syntax;
2. `normalForm` / normalized AST;
3. `classifyLinkage` against canonical/bridge partners;
4. dimensional equivalence;
5. numerical equivalence on a guarded sample domain;
6. asymptotic / declared-limit equivalence;
7. domain-aware physical equivalence requiring expert rules.

Numerical agreement alone never proves symbolic equivalence.

### 9.2 Two rejection registries

Do not merge these:

| Registry | Keys | Owner | Product |
|---|---|---|---|
| `ADJUDICATIONS` | `candidateId(a,b)` | `composition/adjudication.ts` | A |
| `REJECTED_BRIDGE_ADJUDICATIONS` | BE id | `bridges/rejected.ts` | catalog membership |
| `ProbeRejectionRecord` (new) | `CandidateFingerprint` + evaluation context | `composition/probe/candidate-store.ts` | B |

```ts
export interface ProbeRejectionRecord {
  readonly fingerprint: CandidateFingerprint;
  readonly reason: RejectionReason;
  readonly counterexample?: CounterexampleRef;
  readonly context: EvaluationContextRef;
  readonly timestamp: string;
}
```

A Product B rejection only prunes future candidates in contexts where its assumptions, regime, and evidence remain applicable.

---

## 10. Generation backends

UPT must not depend on one discovery method. It also must not pretend Python lives in this repo.

### 10.1 Native deterministic grammar enumeration (required, first, in-tree)

Provides transparent search semantics, deterministic regression tests, a baseline against which any later backend is measured, and direct integration with UPT dimensions, ASTs, tensors, and `normalForm`.

### 10.2 Sparse dynamical identification (optional, out of process)

A backend for \(\dot{\mathbf x}=\Theta(\mathbf x)\xi\) may exist as a **user-supplied worker** speaking the Phase 7 protocol. No SINDy dependency is added to `package.json`. A tiny native TS library for *benchmark-scale* sparse linear systems is allowed only if Task-0 shows the native enumerator cannot represent the planted dynamics case.

### 10.3 Symbolic regression (optional, out of process)

PySR-like solvers are optional candidate generators the operator installs. They never control final UPT status. They are not shipped.

### 10.4 Formal algebraic backend (optional, out of process)

A theorem/optimization backend may operate on a documented fragment such as polynomial equalities/inequalities. A returned certificate means only:

> under premises P and formal semantics S, statement H was derived/verified by backend B version V.

The report must include the exact fragment and assumptions. Consistency is not physical truth.

### 10.5 Neural residual probes (optional, last)

If neural models are used, their role is exploratory structure detection or surrogate modeling. An opaque model is not serialized as a scientific relation. Distillation into an `ExprNode` returns to the ordinary Product B pipeline.

---

## 11. External backend protocol and isolation

External generators are untrusted computational workers. Types live in `src/composition/probe/backend-protocol.ts`. Implementations of workers do **not** live in this repository.

```ts
export interface DiscoveryBackendDescriptor {
  readonly protocolVersion: string;
  readonly backendId: string;
  readonly backendVersion: string;
  readonly capabilities: readonly BackendCapability[];
  readonly deterministic: 'yes' | 'seeded' | 'no' | 'unknown';
}
```

### 11.1 Protocol

Newline-delimited JSON (or equivalent) streaming:

```text
UPT ── SearchProblem + budget + data handles ──▶ worker
UPT ◀─ candidate stream + diagnostics + provenance ─ worker
```

### 11.2 Safety/resource rules

- no shell interpolation from scientific expressions;
- argument arrays rather than shell strings;
- timeouts and process termination;
- temporary isolated working directories;
- explicit file allowlists;
- no network access by default for local backends;
- maximum output size;
- schema validation on every returned candidate;
- hashes for backend executables/environments when practicable;
- secrets never serialized into run manifests;
- worker code is not a package dependency and is not vendored.

---

## 12. Data and observation model

Do not couple Product B algorithms to CSV, HDF5, FITS, or remote APIs. Do not create `src/data/`.

Extend `src/bridges/observations/`:

```ts
export interface ScientificDataset {
  readonly id: string;
  readonly schemaVersion: string;
  readonly metadata: DatasetMetadata;
  readonly provenance: DatasetProvenance;
  readonly covariance?: CovarianceModelRef;
  observations(): AsyncIterable<Observation>;
}
```

`ObservationProvenance` already requires citation, year, retrieved date, optional note. Dataset provenance is a superset (DOI, instrument, units, calibration, filters, checksum, license, UPT transforms). Reuse the existing fields instead of inventing a parallel citation object.

Committed spine observations stay as they are: TypeScript modules behind `CONFRONTATIONS`. Product B datasets are for probe runs and benchmarks, not a rewrite of `upt confront`.

### 12.1 Initial adapters

Implement only what benchmark and first-use cases require:

1. in-memory arrays;
2. JSON (including the public side of `tests/fixtures/discovery/<case>/public/`);
3. CSV.

Add Arrow/Parquet, HDF5, FITS, or domain archives only when a concrete use case exists.

### 12.2 Provenance and copyright

A dataset record should support source URI/DOI/accession, experiment/instrument identity, units and coordinate conventions, calibration/version, selection/filter pipeline, uncertainty/covariance, timestamps when meaningful, checksum, license, and transforms performed by UPT.

Raw copyrighted/restricted data is not copied into reports merely because UPT can read it. `data/bridge-catalog.json` remains a generated projection of **in-repo** catalog facts, not a dump of external papers.

---

## 13. Uncertainty and evidence evaluation

Point estimates are insufficient. Two existing tools already cover the first rungs:

1. `propagateUncertainty` — independent-input Gaussian, first-order, central-difference Jacobian on a `BridgeEdge` (explicitly **no covariance**);
2. `bridgeGradientAST` — exact reverse-mode AD over a symbolic RHS when the autograd peer is present; numerical FD otherwise.

Product B’s ladder, with method named in the run report:

1. exact/analytic propagation when available;
2. first-order Jacobian using `bridgeGradientAST` / `propagateUncertainty` where valid;
3. bootstrap/resampling;
4. Monte Carlo;
5. optional Bayesian adapters (not in-tree priors pretending to be physics).

For a differentiable transform:

\[
\Sigma_y \approx J\Sigma_xJ^T.
\]

Reports must state which method was used and its approximation assumptions. Introducing covariance is a **new** feature; until it exists, `standardized` residuals with a non-diagonal \(\Sigma\) are unsupported and must abstain rather than silently using diagonal σ.

### 13.1 Measurement representation

```ts
export interface MeasurementUncertainty {
  readonly statistical?: number;
  readonly systematic?: number;
  readonly calibration?: number;
  readonly covarianceRef?: string;
  readonly distributionRef?: string;
}
```

This sits beside `SigmaComponent` (`label` + `value`, combined in quadrature). Prefer `SigmaComponent[]` when the confrontation-style breakdown is enough.

### 13.2 Exploratory vs confirmatory evidence

```ts
export type DatasetRole =
  | 'exploratory-fit'
  | 'validation-holdout'
  | 'external-replication'
  | 'falsification-only';
```

A candidate cannot receive `heldout-supported` if the alleged holdout influenced generation, model selection, preprocessing, or hyperparameter tuning. **This rule is in force from the first generator, not from a later “evidence phase.”**

### 13.3 Multiple-hypothesis controls

Where p-values or repeated significance tests are used, record number/family of hypotheses tested, correction method (FDR/FWER) where appropriate, selection procedure, whether the result is exploratory, and pre-registration/locked holdout status.

Prefer predictive held-out performance and model comparison over “small p-value = discovery.” The Unit B π-group fiasco is the worked example: a 4.3% background hit rate on 16,979 groups is not evidence.

---

## 14. Known-limit and structural inheritance engine

Candidates extending established physics should often recover accepted descriptions in their domains of validity.

```ts
export interface RelationLimit {
  readonly id: string;
  readonly description: string;
  readonly transform: LimitTransform;
  readonly expectedRelationRef?: ScientificRelationRef;
  readonly comparison: LimitComparisonPolicy;
}
```

Examples: \(v/c\to 0\), \(\hbar\to 0\), \(G\to 0\), \(r\to\infty\), \(T\to 0\).

A failed limit is not automatically fatal if the candidate explicitly excludes that domain; the validity envelope and claimed scope are checked for consistency. A candidate that claims the domain and fails its required limit is rejected or falsified.

Do not encode E-layer coarse-graining as canonical equations to make this look populated. Limits that cannot be computed from existing `scalarAst` / evaluators are `not-applicable`, not fabricated.

---

## 15. Falsification engine

Product A already falsifies: magnitude-clash, numerical contradiction (`retrodict`), axis-clash, adjudication decoys, consequence `entailed`. Product B adds expression-level attacks. Do not reimplement Product A gates inside Product B except by **calling** them when the candidate implies an identification.

### 15.1 Falsifier contract

```ts
export interface CandidateFalsifier {
  readonly id: string;
  attack(candidate: ProbeCandidateRecord, ctx: FalsificationContext): Promise<FalsificationResult>;
}
```

### 15.2 Falsifier classes (Product B)

- dimensional and unit consistency (`validate`);
- tensor/index legality (existing tensor validators);
- domain/finiteness/positivity;
- imposed (not inferred) symmetry / conservation;
- known limits;
- `normalForm` / `classifyLinkage` known-equivalent;
- retrodiction contradictions when the candidate is lowered onto the graph;
- observational bounds via confrontation adapters;
- adversarial parameter sweeps;
- counterexample search;
- numerical conditioning/stability;
- locked out-of-sample prediction;
- regime-boundary violations.

### 15.3 Counterexample first

Whenever possible, store a concrete counterexample rather than only a score:

```text
candidate H-217 rejected
reason: weak-field limit violation
counterexample:
  parameter point: ...
  expected: ...
  predicted: ...
  tolerance: ...
```

---

## 16. Symmetry and conservation discovery (late, Task-0 gated)

These are later phases because inferring structure is harder than enforcing known structure. They are **not** a way to populate ungated `axes.ts` entries.

Every inferred-symmetry result states: transformation family searched, parameter bounds, dataset/regime, invariance tolerance, and whether the symmetry was imposed, inferred, or merely compatible. Inferred structures never silently become hard constraints and never flip `AxisSpec.gated`.

Conservation search uses held-out trajectories and distinguishes exact symbolic conservation from numerical near-conservation.

If Task-0 on synthetic regimes shows only noise, this phase is cancelled rather than expanded.

---

## 17. Regime and transition discovery

A missing bridge can be a missing regime boundary rather than a missing global equation. `upt predict` already ranks empty `(scale × force)` cells as structural hypotheses. Product B may learn a `RegimePredicate` from data, but learned regimes must **map to** `RegimeAttributes` / `GATE_AXES` vocabulary or propose an extension that goes through `auditAxisDiscrimination` before gating.

There are two regime systems in the repo (`core/regime-registry.ts` vs `composition/axes.ts`). Learned regimes bind to the **composition** attribute layer (the one the funnel actually uses), not to `TensorIndices.topology?: number`.

---

## 18. Causal evidence layer

Causal metadata is optional and deliberately strict.

```ts
export type EvidenceMode =
  | 'theoretical-derivation'
  | 'observational'
  | 'interventional'
  | 'simulation'
  | 'synthetic-benchmark';
```

A relation can record causal direction only when supported by an explicit causal model or intervention semantics. UPT must not translate correlation or predictive usefulness into causal language automatically.

Core flux Rule 3 (causality) is an **ERROR-tier catalog ingestion rule**, not a `do(·)` calculus. Do not overload it.

---

## 19. Novelty and literature grounding

### 19.1 Automated novelty is corpus-relative

The indexed comparison corpus for v1 **is the in-repo L-layer + B-layer**: `CANONICAL_EQUATIONS`, `BRIDGE_EQUATIONS`, and their `normalForm` hashes. Phase 10 may add a versioned external index; until then reports must name this corpus.

```ts
export interface CorpusComparisonResult {
  readonly corpusId: string;
  readonly corpusVersion: string;
  readonly exactMatches: readonly Match[];
  readonly algebraicMatches: readonly Match[];
  readonly structuralNeighbors: readonly Match[];
  readonly searchedAt: string;
}
```

Allowed automated wording:

> “No equivalent was found in corpus C version V under equivalence procedures E.”

Disallowed automated wording:

> “This equation is novel to physics.”

### 19.2 Literature ingestion quarantine

Machine-extracted papers enter a staging store. They never write the canonical registry. Expert approval is required before a relation enters the trusted comparison corpus. This is the same firewall as `proposed-bridges.ts` (`status: 'unadjudicated'` is not a member of `BridgeEquationStatus`).

### 19.3 Copyright and licensing

Store citations, identifiers, structured facts, permitted snippets, and derived metadata according to source terms. Do not assume permission to redistribute full source documents.

---

## 20. Experiment design

The goal is maximum **scientific information under feasible experimental constraints**, not maximum numerical separation.

Product B may rank settings. Laboratory safety, ethics, regulatory requirements, and practical design remain human responsibilities. The optimizer must never recommend a forbidden or unmodeled-unsafe region.

```ts
export interface ExperimentDesignConstraints {
  readonly controlBounds: Readonly<Record<string, NumericInterval>>;
  readonly instrumentResolution?: Readonly<Record<string, number>>;
  readonly forbiddenRegions?: readonly ParameterRegion[];
  readonly feasibility?: FeasibilityPredicateRef;
  readonly costModel?: CostModelRef;
  readonly nuisanceParameters?: readonly string[];
  readonly systematicModel?: SystematicModelRef;
}
```

Simple discrimination objective for two candidates:

\[
J(u)=\frac{|H_1(u)-H_2(u)|}{\sigma_{total}(u)}.
\]

Bayesian expected information gain is optional and only after a deterministic grid/reference optimizer is pinned.

This phase has **no existing lab/instrument model in UPT**. It is greenfield and comes after surviving Product B hypotheses exist. It is meaningless on Product A dimensional coincidences (there is no implied observable — that is why `dataTested` is permanently false there).

---

## 21. Reproducible discovery runs

A Product B search is a scientific artifact. Product A runs are already reproducible as `upt discover --json` over a git commit; they do not need this manifest unless wrapped.

```ts
export interface DiscoveryRunManifest {
  readonly schemaVersion: string;
  readonly runId: string;                 // dr-*
  readonly repositoryCommit: string;
  readonly problemHash: string;
  readonly datasetHashes: readonly string[];
  readonly backendDescriptors: readonly DiscoveryBackendDescriptor[];
  readonly randomSeeds: Readonly<Record<string, string | number>>;
  readonly tolerances: Readonly<Record<string, number>>;
  readonly environment: EnvironmentFingerprint;
  readonly searchBudget: SearchBudget;
  readonly startedAt: string;
  readonly completedAt?: string;
  readonly stopReason?: SearchStopReason;
  readonly nondeterminism: readonly NondeterminismSource[];
}
```

JSON Schema lives at `data/schemas/discovery-run.v0.json`, following `data/bridge-catalog.schema.json` (`schemaVersion` independent of `packageVersion`).

Reproduction levels: bitwise, numerical (declared tolerance), statistical, replayable-only. Do not promise determinism GPU libraries or external solvers cannot supply.

---

## 22. Persistence, schemas, and migrations

The catalog remains TypeScript source of truth. Probe artifacts are the first persisted *run* objects. Versioned JSON schemas before anything is public:

- `DiscoveryRunManifest`
- `FrontierGap`
- `ProbeCandidateRecord` (+ `StatusEvent`)
- `CandidateEvaluation`
- `ProbeRejectionRecord`
- experiment-design reports
- optional `ScientificRelationRecord`

Rules: every persisted object carries `schemaVersion`; parsers reject unknown incompatible majors; additive optional fields do not require immediate migration; breaking changes get explicit migration functions and fixtures; golden serialization tests pin canonical representations; hashes use a documented canonical serialization; experimental schemas do not imply public API stability.

`npm run catalog:json` is **not** the probe-run store. Do not overload it.

---

## 23. Benchmark program

UPT must prove it can **rediscover known structure, find planted corrections, and abstain when no credible relation exists** before being trusted on frontier data.

### 23.1 Two benchmark families (do not mix)

**Family A (already shipped).** Identification calibration:

- `tests/composition/discovery-calibration.test.ts`
- canonical-only `contradictory = 0`
- catalog funnel pins
- adjudicated decoys never resurface unannotated

Do not rebuild this under a new tree. Do not use it as a pendulum-equation rediscovery bench.

**Family B (new).** Expression / residual search under `tests/fixtures/discovery/<case>/`:

```text
tests/fixtures/discovery/<case>/
  public/
    observations.json
    constraints.json
    problem.json
  scorer/
    hidden-truth.json
    score.ts
```

`src/**` cannot import `scorer/`. The test runner (under `tests/`) is the only scorer importer. A production generator that reaches hidden truth through any path fails CI.

Suggested Family B ladder (not every backend, not Tranche A’s job to implement all ten):

1. dimensional pendulum scaling;
2. Newtonian relation(s);
3. Kepler scaling;
4. ideal-gas/thermodynamic relation;
5. harmonic oscillator;
6. nonlinear oscillator;
7. simple sparse dynamical system;
8. diffusion/wave PDE fragment (only if the grammar honestly supports it);
9. weak-field relativistic relation (only if a baseline evaluator exists);
10. synthetic baseline + hidden correction term.

Tranche A implements **(1) or (2)** plus **(10) specified**, plus null cases, with a runner that scores **hand-authored** candidates (no generator yet).

### 23.2 Null-science benchmarks (Family B)

Required cases: pure noise; insufficient sample size; confounded association; incompatible pooled regimes; inconsistent measurements; high-dimensional underdetermination; deliberately no-simple-symbolic-law dataset.

Measure: false-candidate rate; abstention calibration; compute spent before abstention; robustness to noise; sensitivity to selection bias.

### 23.3 Leakage controls

Hidden truth excluded from `src/` import graph; fixed blind split inaccessible to generation; scorer runs after candidate generation; provenance records preprocessing; benchmark changes require scientific-review (tuning against a hidden answer destroys blindness).

---

## 24. Candidate scoring and ranking

Do not hide scientific tradeoffs inside one magic score. `VettedCandidate.score` already exists for Product A ranking (“worth a physicist’s minute”). **Leave it.** Product B uses a Pareto vector on `ProbeCandidateRecord` only.

A probe candidate may expose:

- dimensional/structural validity;
- empirical predictive performance (by dataset role);
- limit compatibility;
- robustness;
- parsimony (`ComplexityMetrics`);
- falsifiability;
- corpus distance;
- experiment discriminability;
- evidence independence;
- computational stability.

Default API returns a Pareto frontier or a lexicographically documented ranking policy recorded in the run manifest. A scalar is allowed only with explicit weights.

```ts
export interface ComplexityMetrics {
  readonly astNodes: number;
  readonly operators: number;
  readonly freeParameters: number;
  readonly derivativeOrder: number;
  readonly tensorRank?: number;
  readonly descriptionLength?: number;
}
```

---

## 25. CLI and programmatic workflow

Experimental Product B commands live under **one new verb**. Existing verbs keep their current meaning forever unless a later SemVer-major explicitly deprecates them.

### 25.1 Frozen verbs (Product A + spine)

`upt discover`, `upt candidates`, `upt connectors`, `upt ground`, `upt predict`, `upt recover`, `upt confront`, `upt map`, `upt derive`, `upt canonical`, `upt coverage`, `upt audit`, `upt explain`, `upt eval`, `upt evaluate`, `upt symbolic`, `upt priority`, `upt axes`.

### 25.2 New experimental verb

```bash
upt probe scan --problem problem.json
upt probe show fg-104
upt probe run fg-104 --backend native --budget search-budget.json --seed 42
upt probe candidates dr-00413
upt probe falsify dr-00413 --top 100
upt probe rank dr-00413 --pareto
upt probe design --run dr-00413 --candidates h-17,h-22 --constraints lab-bounds.json
upt probe reproduce dr-00413
```

Help text must open with: this is experimental expression/residual search; it is **not** `upt discover`. Epistemics trailer required (same pattern as `discover.ts` / `candidates.ts`).

Implementation: `src/cli/commands/probe.ts` registered like every other command; subverb is `positionals[0]`. Unknown subverb → exit 2. `--json` envelope via existing `emitJson`. Reach internals only through `CommandCtx.api` — extend `src/cli-api.ts`, never deep-import from `src/cli/`.

Programmatic APIs mirror these operations under an experimental namespace (`universal-physics-tensor/probe` subpath, **not** the root export) until Phase 12.

### 25.3 Example terminal funnel (illustrative counts, never pins)

```text
Search space (bounded grammar)             2,400,000 potential forms
Generated before budget stop                 250,000
Dimension/type valid                          31,420
Canonical unique                               8,106
Known-equivalent removed                       6,774
Empirically competitive                          143
Held-out supported                                 18
Falsification survivors                            4
Expert-review candidates                           3
Abstained / insufficient evidence                  1
```

---

## 26. Scientist-facing candidate report

Every serious Product B candidate should be explainable without reading internal code. The report must not use stronger language than `ProbeCandidateStatus`.

```text
Hypothesis H-0217
=================
Status: EXPERT REVIEW REQUIRED

Target frontier gap:
  fg-104 — prediction residual

Expression:
  ...

Origin:
  native grammar enumerator
  discovery run dr-00413

Assumptions / validity envelope:
  ...

Constraint results:
  dimensional              PASS
  tensor/index              PASS
  declared symmetry         PASS
  conservation              NOT TESTED

Evidence:
  exploratory fit           D-17
  locked holdout            D-21
  independent replication   NONE

Uncertainty method:
  ...

Known-limit tests:
  5 pass / 0 fail / 1 not applicable

Automated corpus comparison:
  no algebraic equivalent found in corpus C@V
  nearest indexed relation: ...
  SCIENTIFIC NOVELTY NOT ESTABLISHED

Falsification:
  27 attacks passed
  2 inconclusive
  0 counterexamples found

Most discriminating feasible measurement:
  XP-19

Conclusion:
  Candidate survived the configured computational checks.
  Independent scientific review and evidence are required.
```

Product A reports stay as they are (`upt discover` / `upt ground` trailers). Do not reprint identification candidates in this template as if they were generated laws.

---

## 27. Implementation phases

Every phase that would generate, rank, or promote candidates has a **Task-0 measurement gate** with explicit **not-build** authority (project convention: design → Adam+Eve vet → Task-0 → TDD). “Not build” is a successful phase outcome when the measurement says so.

### Phase 0A — Integration design note and scientific contract

**Goal:** map every v1 concept onto current modules before adding production types.

Deliverables:

- `docs/planning/Scientific-Bridge-Discovery-v1-Integration.md` (repo-standard design note, not a fictional ADR folder);
- scientific claim vocabulary and prohibited-claim rules;
- inventory of `PhysicalLaw`, `Cell`, `BridgeEquationEntry`, `CanonicalEquation`, `VettedCandidate`, `AdjudicationVerdict`, `CandidateGrounding`, `ConfrontationOutcome`, `IdentifiabilityResult`, `ProposedBridge`, `UserEquation`, retrodiction, regimes (`axes.ts` vs `regime-registry.ts`), and dimensional APIs;
- recorded decision: numeric `confidence` stays; no `confidenceToStatus` adapter;
- persistence/schema-version policy copying `data/bridge-catalog.schema.json`;
- threat model for external solvers and untrusted datasets;
- Adam+Eve review of this plan + the integration note before any Product B code lands.

Acceptance:

- no proposed type duplicates an authoritative type without a documented reason;
- architecture dependency graph remains acyclic (`composition/probe` may import canonical/dimensional/bridges/diff; it must not become a new cycle);
- no code behavior changes required for Phase 0A.

### Phase 0B — Benchmark and falsification specification (Family B)

**Goal:** define how success and false discovery are measured before optimizing algorithms.

Deliverables:

- fixture directory format under `tests/fixtures/discovery/`;
- import-graph rule (`src` ↛ `scorer`);
- at least two rediscovery cases specified as public observations + hidden truth;
- at least two null-science cases;
- metrics for recovery, false positives, abstention, compute, robustness;
- a runner that can score a **hand-authored** `ExprNode` (via `validate` + a documented trivial fitter) so the scientific loop exists before a generator.

Acceptance:

- generators cannot access hidden truth through normal imports;
- trivial baseline scores are documented;
- noise fixture returns explicit no-result;
- Family A calibration tests still pass unchanged.

### Phase 1 — Run schemas and optional metadata overlay

**Goal:** persist probe runs without replacing relation types.

Implement:

- `DiscoveryRunManifest` v0 + `data/schemas/discovery-run.v0.json`;
- `ProbeCandidateRecord` / `StatusEvent` types (experimental);
- optional `ScientificRelationRecord` overlay with audited/unknown/not-applicable states;
- canonical serialization fixtures.

Acceptance:

- all existing tests pass unless intentionally extended;
- no existing relation requires fabricated metadata;
- round-trip serialization tests pass;
- `src/index.ts` unchanged;
- `upt discover` golden CLI tests unchanged.

### Phase 2 — Frontier analysis as wrappers + residual gaps

**Goal:** identify searchable gaps without cloning Product A.

Implement:

- `FrontierGap`;
- wrappers over `proposeLinkCandidates`, connectors, and `predictMissingBridges`;
- one new scanner: prediction-residual when a baseline + dataset exist;
- identifiability assessments using the split `graph-structural` / `parametric` type;
- read-only `upt probe scan` / `upt probe show`.

Acceptance:

- planted residual gaps recovered in Family B fixtures;
- registered aliases do not appear as relation-link gaps;
- non-identifiable gaps abstain before search;
- deterministic ordering for identical inputs;
- Product A CLI output byte-stable except documented additive `--json` fields (default: no change).

### Phase 3 — Physics-typed bounded native generator

**Goal:** create a transparent reference generator with scientific controls already on.

Implement:

- generation-time use of existing validator rules;
- bounded AST enumeration;
- `SearchBudget` and stop reasons;
- fingerprints (`normalForm` + extras);
- `ComplexityMetrics`;
- dataset-role isolation (holdout not in `SearchContext`);
- MHC metadata (family size = candidates actually tested);
- abstention path.

Acceptance:

- generated expressions are dimensionally valid by construction where the grammar has enough information;
- deterministic native enumeration ordering;
- hard candidate/time/evaluation budgets tested;
- no runaway memory on benchmark maxima;
- noise fixture → `no-credible-candidate` rather than a ranked false law;
- import-graph test: `src/composition/probe/**` does not import fixture scorers.

### Phase 4 — Residual/correction discovery

**Goal:** discover minimal corrections to known baselines rather than entire laws from scratch.

Implement discrepancy kinds `additive`, `relative`, `standardized` (diagonal σ first). Covariance-standardized residuals abstain until a covariance model exists.

Acceptance:

- planted additive and relative corrections recovered in blind tests;
- wrong residual semantics demonstrably produce worse locked-holdout results;
- no-result case abstains.

### Phase 5 — Deepen uncertainty (not the first time holdouts exist)

**Goal:** prevent fit quality from being confused with scientific evidence — *strengthen* what Phase 3–4 already isolated.

Implement: covariance-aware fit when a \(\Sigma\) is supplied; Jacobian via existing AD; Monte Carlo; multiple-hypothesis *corrections* (FDR/FWER) where p-values are used; reports that expose dataset roles and selection count.

Acceptance:

- holdout leakage tests fail closed (already required in Phase 3; this phase adds more attacks);
- uncertainty propagation validated against analytic fixtures;
- selected candidate cannot self-promote using training/selection data.

### Phase 6 — Known limits and generalized Product B falsification

**Goal:** make expression-candidate rejection first-class.

Implement: reusable limit specifications; retrodiction adapter when a candidate lowers onto the graph; observational-bound adapter **calling** `upt confront` machinery, not copying it; `ProbeRejectionRecord` store.

Acceptance:

- planted bad candidates are killed for the intended reason;
- counterexamples persist and replay;
- rejection pruning never crosses incompatible regimes/assumptions;
- false-rejection rate measured on valid Family B rediscovery fixtures;
- `ADJUDICATIONS` remains Product A only.

### Phase 7 — External discovery backend protocol

**Goal:** permit multiple search algorithms without giving them authority over UPT semantics.

Implement: versioned worker protocol; process isolation/resource limits; **no in-tree worker**. CI tests use a fixture executable (e.g. a Node script under `tests/fixtures/discovery-workers/`) that speaks the protocol.

Acceptance:

- malformed/oversized worker output rejected;
- timeout/termination tested;
- shell-injection fixtures harmless;
- candidates pass through the same canonicalization/constraint path as native candidates;
- Family B compares the fixture worker to the native baseline;
- `package.json` dependencies unchanged (still zero hard deps).

### Phase 8 — Regime, symmetry, and conservation discovery

**Goal:** discover structure, not just algebraic expressions.

Task-0 first. Implement incrementally only if synthetic recovery is real: changepoints / dimensionless control parameters; bounded symmetry families; bounded conserved-quantity search.

Acceptance:

- known synthetic regimes recovered **or the phase is cancelled**;
- approximate vs exact invariance separated;
- held-out trajectories for conservation;
- `axes.ts` `gated` flags unchanged unless `auditAxisDiscrimination` earns a flip in a separate, catalog-tagging piece of work.

### Phase 9 — Experiment discrimination

**Goal:** convert surviving Product B hypotheses into measurement priorities.

Implement: deterministic grid/reference optimizer; uncertainty-aware separation; feasibility predicates; cost/nuisance/systematic hooks; optional information gain after reference behavior is pinned.

Acceptance:

- optimizer recovers analytic test optima;
- forbidden regions never recommended;
- systematic uncertainty can reverse rankings in a tested fixture;
- report includes unmodeled feasibility caveats.

### Phase 10 — Corpus comparison and literature staging

**Goal:** improve equivalence/context search without overclaiming novelty.

Implement: versioned comparison over `CANONICAL_EQUATIONS` + `BRIDGE_EQUATIONS` + `normalForm` first; optional extra index later; quarantine workflow; citation/equation/expert verification statuses.

Acceptance:

- canonical registry cannot be mutated from unverified extraction;
- reports use corpus-relative wording;
- known paraphrased/equivalent relations match in fixtures;
- licensing/provenance required before any extra-corpus promotion.

### Phase 11 — Scientist-facing inspectability (CLI, not a workbench)

**Goal:** make the Product B reasoning chain inspectable.

Views (text/`--json`, plus existing `upt map` where a graph is the right object):

- known-relation graph (reuse `upt map`);
- frontier/gap list (`upt probe scan`);
- candidate Pareto (`upt probe rank`);
- constraint/falsification matrix;
- provenance/evidence browser as nested `--json`;
- experiment-design comparison.

Acceptance:

- every CLI claim links to a machine-readable artifact;
- no status stronger than stored epistemic status;
- large candidate sets sample/aggregate rather than dumping unbounded arrays;
- **no** Three.js/workbench/UI package in this repository (`Future-Production-Hardening.md` still owns that parking lot).

### Phase 12 — Experimental API review; optional public promotion

**Goal:** decide what is stable enough to expose. This may remain 0.x.

Required before any root-export promotion:

- schema migration exercise across at least one intentional schema revision;
- Family B history with no unexplained regression;
- null-science false-positive targets defined and met;
- package consumer smoke tests for public additions;
- security review of the external backend path;
- documentation and worked examples;
- reproducibility report from a clean environment;
- scientific-claim language review;
- explicit decision on whether npm `1.0.0` is warranted (default: **no**; UPT 1.0 is a separate product decision).

---

## 28. Cross-phase test strategy

Every phase adds tests at four levels where applicable:

1. **unit:** local mathematical/data-model contracts;
2. **property/invariant:** dimensional legality, canonicalization idempotence, serialization stability;
3. **integration:** existing UPT graph + new feature, **without** changing Family A pins accidentally;
4. **scientific benchmark:** Family B blind recovery, planted falsification, or null abstention.

Use scoped vitest in TDD (`npx vitest run tests/...`). Full suite is a release/gate operation, not a per-task default (`CLAUDE.md`).

### 28.1 Required invariants

- `normalForm` remains idempotent;
- probe fingerprint is stable for canonical-equivalent inputs under documented transformations;
- a rejected probe candidate cannot become accepted merely by serialization/reload;
- unknown evidence never becomes supported through default values;
- holdout data cannot enter generation context;
- no probe status transition skips required gates;
- all run artifacts reference immutable dataset/code identities;
- identical deterministic inputs produce identical native search ordering;
- budget exhaustion returns a valid partial result plus stop reason;
- no-result is representable from engine to CLI/report;
- Family A calibration pins change only in the same commit as a justified catalog/funnel change;
- `src/index.ts` export surface is unchanged until Phase 12;
- `upt discover` / `upt candidates` / `upt ground` help semantics are unchanged.

---

## 29. Performance plan

Performance optimization comes after semantics are pinned, but resource limits are present from the first generator.

Primary cost centers: combinatorial AST generation; algebraic canonicalization (`normalForm`); repeated dimensional inference; repeated numerical evaluation; equivalence checks; external process IPC; experiment optimization.

Techniques: signature-index partial expressions; memoize canonicalized subtrees; hash-cons immutable AST nodes where beneficial; vectorize dataset evaluation; reuse Product A’s candidate-invariant `DiscoveryContext` *pattern* (do not reuse the object — different problem); cache only with complete context keys (units, regime, assumptions, dataset hash, tolerances); stream candidates; benchmark before parallelization; worker pools only after deterministic reduction semantics are specified.

Optimization target: **credible information per unit compute**, not raw equation throughput. Record candidates generated/sec, evaluated/sec, peak memory, deduplication ratio, time per stage, backend overhead.

Reuse `bench/` for microbenchmarks of `normalForm` / enumerator hot paths. Do not put hidden scientific truth in `bench/`.

---

## 30. Security and robustness plan

Product B introduces new attack surfaces (expressions, datasets, backend configs, external executables). Required controls:

- never evaluate arbitrary JavaScript from a scientific expression (lower through existing `evalExpr` / engines only);
- never build shell commands through string concatenation of user input;
- schema-validate manifests and worker messages;
- cap file sizes/row counts;
- protect against decompression bombs in future adapters;
- avoid unsafe object prototype merging from untrusted JSON;
- constrain filesystem paths to approved roots for worker jobs;
- redact secrets from manifests;
- network access opt-in for backends;
- treat NaN/Infinity/overflow/underflow explicitly (the finiteness-guard discipline already applied in numerical/diff layers);
- record tolerance policy rather than scattered magic epsilons;
- fuzz parser/protocol boundaries.

---

## 31. Documentation requirements

Each implemented phase updates: architecture component map (`docs/architecture/` via `npm run docs:deps` where graphs change); experimental API docs; scientific claim semantics; reproducibility documentation; Family B results; threat model if attack surface changes; `cli/README.md` (new `probe` section, existing `discover` section untouched in meaning); `CLAUDE.md` source-map row for `src/composition/probe/` when that folder appears.

Every scientist-facing feature needs at least one worked example showing: what is known; what data are supplied; what UPT is allowed to infer; what candidate was generated; how it was tested; what failed; what remains uncertain; what measurement would change the conclusion.

---

## 32. Governance and review gates

Project convention: both the design and the implementation plan get independent Adam+Eve review; the plan does not inherit the design’s fixes (`todo.md` §Conventions). This document is the program design. Phase 0A’s integration note is the module-mapping design. Code phases get Task-0 gates.

### Scientific-review required

- changing epistemic status vocabulary (`ProbeCandidateStatus`, `AdjudicationVerdict`, `BridgeEquationStatus`, `EpistemicStatus`);
- promoting a candidate/extracted relation into a trusted corpus or catalog;
- changing Family B hidden truth or scoring in a way that affects historical comparison;
- introducing a new default statistical significance policy;
- changing equivalence rules that can suppress candidates (`normalForm` semantics);
- changing hard scientific constraints used in generation;
- flipping any `AxisSpec.gated` flag.

### Engineering-review required

- public schema changes;
- new external-process capability;
- new network-enabled data/backend adapter;
- persistence migration;
- new concurrency model affecting determinism;
- any change to `src/index.ts` export surface;
- any semantic change to `upt discover`.

---

## 33. Definition of “useful for frontier science”

UPT v1 (the program) is useful if it can demonstrate all of the following, **without weakening Product A’s honest no**:

1. represent accepted relations and their validity/provenance without overstating certainty;
2. identify a meaningful discrepancy or connectivity gap (wrapping existing scanners where they already do this);
3. determine whether the gap is identifiable enough to search (correct identifiability kind);
4. generate candidates that are physically typed and bounded by explicit assumptions;
5. remove duplicates and already-known equivalents via `normalForm` / linkage;
6. evaluate candidates with uncertainty and truly held-out evidence;
7. recover required established limits when claimed;
8. find counterexamples and remember rejected equivalence classes in the right registry;
9. abstain when evidence is weak or the problem is underdetermined;
10. compare surviving hypotheses transparently rather than hiding tradeoffs in one score;
11. propose feasible measurements that would discriminate **expression** hypotheses;
12. reproduce the reasoning chain from immutable run artifacts.

The desired scientific object is a traceable chain:

\[
\boxed{
\text{gap}
\rightarrow
\text{candidate}
\rightarrow
\text{constraints}
\rightarrow
\text{evidence}
\rightarrow
\text{falsification}
\rightarrow
\text{discriminating prediction}
}
\]

A Product A identification that remains a decoy is also a successful chain: gap → candidate → falsification → stop.

---

## 34. First implementation tranche after plan approval

Do **not** begin by integrating a symbolic-regression package. Do **not** begin by editing `discovery.ts`. Do **not** begin by adding `upt discover run`.

### Tranche A (deliberately small)

1. Phase 0A integration design note (`docs/planning/Scientific-Bridge-Discovery-v1-Integration.md`) — module map, two-product split, CLI contract, schema policy, threat model.
2. Adam+Eve review of this plan + the integration note (project convention). Findings folded here or into a `*-Review-Findings.md` sibling before code.
3. Experimental types internal to `src/composition/probe/types.ts` + `run-manifest.ts` — **not** re-exported from `src/index.ts`.
4. `DiscoveryRunManifest` v0 JSON Schema at `data/schemas/discovery-run.v0.json`.
5. Family B fixture skeleton: two rediscovery cases (pendulum scaling **or** Newtonian; plus a planted additive correction spec) and two null cases (pure noise; no-simple-law), each with `public/` + `scorer/`.
6. Baseline **hand-authored** scorer runner under `tests/` that validates an `ExprNode` with existing `validate()`, evaluates with existing `evalExpr` / engines, and demonstrates abstention on the noise fixture.
7. Import-graph test: nothing under `src/` imports `tests/fixtures/discovery/**/scorer/**`.
8. Document Family A’s existing `discovery-calibration.test.ts` as the frozen identification baseline (cite, do not clone).

### Exit criteria

- no production behavior regression (`upt discover`, public exports, Family A pins);
- no duplicated authoritative subsystem;
- blind Family B boundary demonstrated (hand-authored candidate + hidden scorer);
- no-result/abstention demonstrated on noise;
- run-manifest schema round-trips;
- CI green on the new tests + existing suite at the release/gate sense (scoped vitest during TDD);
- architecture/scientific review completed before Phase 1 overlay expansion;
- `docs/planning/ACTIVE.md` still contains **no** release-blocking probe tasks until a tranche is explicitly promoted.

This tranche converts the roadmap from aspiration into a measurable scientific-development program while keeping risk low and leaving the coincidence-rejector intact.

---

## 35. Closing design principle

The enduring advantage of UPT should **not** be that it can call a fashionable symbolic-regression or AI model. Those algorithms will change. `Future-Production-Hardening.md` already parked that temptation once; this program un-parks only the conservative core: typed search, honest evidence, and falsification.

The durable advantage should be that UPT knows, in a machine-auditable way:

\[
\boxed{
\text{what is represented as known},
\quad
\text{what assumptions make it valid},
\quad
\text{where explanation becomes incomplete},
\quad
\text{what a proposed bridge must respect},
\quad
\text{what evidence could kill it},
\quad
\text{and what experiment would distinguish survivors}.
}
\]

Generation may be broad. Acceptance must be conservative. Falsification is a feature. Abstention is a valid result. Provenance is part of the result, not decoration. Product A’s trustworthy *no* is not a defect to be patched with a generator.

That combination would make UPT meaningfully more useful to scientists exploring the boundary between known and unknown physics without pretending that computation alone can certify a new law of nature, and without dismantling the identification funnel that already earned that honesty.
