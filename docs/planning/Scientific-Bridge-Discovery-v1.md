# Universal Physics Tensor v1.0 — Scientific Bridge Discovery Platform

**Status:** Audited strategic implementation plan  
**Target:** UPT v1.x discovery architecture  
**Purpose:** Evolve UPT from a computational laboratory for organizing, composing, evaluating, and confronting physics relations into a rigorous, reproducible scientific-discovery environment for locating structured gaps in explanatory coverage, generating physically constrained candidate extensions, attempting to falsify them, and identifying measurements that best discriminate surviving hypotheses.

> **Scientific boundary:** UPT is a hypothesis-generation, hypothesis-auditing, and experiment-prioritization instrument. It does not autonomously establish a new law of nature. A machine-generated candidate remains a candidate until independent scientific review, independent evidence, and appropriate replication justify a stronger status.

---

## 0. Audit note: what changed in this corrected plan

This document was re-audited against the actual v0.44.1+ repository after the completion/hardening pass. The original roadmap had a sound scientific direction but several architectural and methodological problems. This revision corrects them before implementation begins.

### 0.1 Findings corrected

1. **Do not build a second UPT inside UPT.** The earlier directory sketch introduced parallel `constraints/`, `discovery/`, and `evidence/` hierarchies even though mature capabilities already live in `src/dimensional/`, `src/composition/`, `src/canonical/`, `src/bridges/`, `src/core/`, and `src/diff/`. New discovery features must extend those modules or add thin orchestration layers above them.
2. **Do not replace existing epistemic types.** `CanonicalEquation` already distinguishes dimensional, scalar-up-to-constant, and fully quantitative support; existing bridge/discovery code already distinguishes established, proposed, adjudicated, and unadjudicated relations. The v1 model therefore adds orthogonal scientific-claim metadata instead of shadowing those types.
3. **Do not call every represented relation a “law.”** The repository contains textbook equations, bridge equations, definitions, approximations, phenomenological relations, hypotheses, and computational predicates. The general metadata type is therefore `ScientificRelationRecord`, with `CanonicalEquation`, `BridgeEquation`, and future candidate objects remaining their domain-specific computational forms.
4. **Generalize the frontier beyond two theories.** A scientific gap can be theory↔observation, relation↔relation, multi-model, regime-transition, parameter, anomaly, missing operator, or missing causal mechanism. `BridgeGap` is replaced by a general `FrontierGap` whose participants and evidence are sets.
5. **Residuals are not always additive.** Discovery must support additive, relative, log-ratio, likelihood, vector/tensor, operator, distributional, and custom residual definitions. `observed - predicted` is only one residual semantics.
6. **Avoid fabricated metadata.** Existing catalog entries must never receive invented assumptions, regimes, citations, or evidence merely to satisfy a schema. Unknown, not-applicable, and not-yet-audited states are explicit values.
7. **Novelty cannot be proven by repository search.** Automated novelty means only “no equivalent found in the indexed comparison set.” Literature review and expert adjudication remain required before any novelty claim.
8. **Formal certificates have scoped meaning.** A theorem/proof backend may certify derivability or inconsistency only inside its supported mathematical fragment and declared assumptions. It must never imply physical truth from formal consistency.
9. **Causality is evidence-typed, not inferred from association by default.** `do(·)` or intervention language is permitted only when an explicit causal model and intervention semantics are present.
10. **Reproducibility is stronger than seed logging but weaker than universal bitwise determinism.** Runs record code, data, environment, solver versions, seeds, tolerances, hardware/backend metadata, and nondeterminism flags. External solvers may be statistically reproducible without being bitwise identical.
11. **External discovery engines are untrusted plugins.** Python/SINDy/PySR/theorem solvers run out of process under explicit resource budgets and a versioned protocol. They propose candidates; UPT performs canonicalization, constraints, evidence evaluation, and status assignment.
12. **Experiment design needs feasibility and safety constraints.** Maximizing model separation alone can recommend impossible, unsafe, unethical, or prohibitively expensive measurements. The optimizer must handle control bounds, costs, nuisance parameters, systematic uncertainty, instrument resolution, and explicit feasibility predicates.
13. **Multiple-hypothesis control is mandatory.** A search over millions of expressions creates a multiple-comparisons problem. Candidate evidence must distinguish exploratory discovery from confirmatory validation and support false-discovery controls or pre-registered holdouts where statistically applicable.
14. **Negative-result memory must be canonicalized.** Rejected syntax alone is insufficient because algebraically equivalent expressions can reappear. Rejections are keyed by canonical fingerprints plus the applicable assumptions/regime/dataset context.
15. **The benchmark suite needs leakage protection and null science.** Rediscovery benchmarks are blind; hidden truth is unavailable to generators. Null datasets, confounded datasets, inconsistent datasets, and no-simple-law cases measure false-positive behavior.
16. **Candidate explosion needs hard resource governance.** Every search has AST-depth, operator, evaluation, wall-clock, memory, candidate-count, and external-process budgets plus deterministic stopping semantics.
17. **Persistence and schema migration were underspecified.** Discovery artifacts require versioned serialization schemas and migration policy before they become public/stable.
18. **The public API must evolve additively first.** Internal experimental APIs remain under explicit experimental namespaces until their data contracts survive at least one complete benchmark and migration cycle.
19. **The active engineering backlog and strategic roadmap must remain separate.** This document is not a release-blocking checklist. Only the currently authorized implementation tranche belongs in `docs/planning/ACTIVE.md`.
20. **“No credible candidate found” is a successful scientific outcome.** The engine must have explicit abstention/no-result states rather than forcing a ranked hypothesis from weak evidence.

These corrections are requirements, not suggestions.

---

## 1. Mission and scientific contract

UPT v1 should answer a more useful question than “what equations can be combined?”

> **Where does the current model set fail to explain, predict, connect, or distinguish the available evidence; what minimal physically admissible hypotheses could close that gap; and what evidence would most efficiently reject or discriminate those hypotheses?**

The intended loop is:

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
                       frontier analysis
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
           explained                    gap found
                                            │
                                            ▼
                                constrained generation
                                            │
                                            ▼
                              canonicalize / deduplicate
                                            │
                                            ▼
                         dimensional / structural / limit gates
                                            │
                                            ▼
                           fit + uncertainty + held-out tests
                                            │
                                            ▼
                                  adversarial falsification
                                            │
                                            ▼
                             equivalence / corpus comparison
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

### 1.1 Claims UPT may make

UPT may report that a candidate is:

- syntactically valid;
- dimensionally valid under specified unit conventions;
- tensor/index structurally valid;
- compatible with named symmetry or conservation constraints;
- derivable from named premises within a supported formal fragment;
- empirically fitted to named data;
- predictive on a held-out dataset;
- robust or fragile under named perturbations;
- consistent or inconsistent with named known limits;
- falsified by a specified counterexample;
- not matched by automated equivalence search in a specified indexed corpus;
- worth expert review under a transparent ranking policy.

### 1.2 Claims UPT must not make autonomously

UPT must not conclude merely from computation that a candidate is:

- a newly discovered law of nature;
- physically true;
- experimentally confirmed when only fit data were used;
- novel in the scientific literature without a documented literature review;
- causal from observational association alone;
- universally valid outside its declared regime;
- proven physically true because a theorem solver found it mathematically consistent.

### 1.3 Required epistemic labels

Every generated scientific claim has a machine-readable status drawn from a deliberately conservative lifecycle:

```ts
export type CandidateStatus =
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

No status named `discovered-law`, `confirmed-law`, or equivalent is created by the automated pipeline.

---

## 2. Architectural principle: extend the existing UPT layers

The v1 discovery platform is an **orchestration and metadata expansion of existing UPT**, not a replacement architecture.

### 2.1 Existing capabilities that remain authoritative

| Concern | Existing home | v1 action |
|---|---|---|
| tensor/regime coordinates | `src/core/` | extend only where necessary |
| textbook/canonical equations | `src/canonical/` | add metadata overlays; do not duplicate registry |
| dimensions and Buckingham-π | `src/dimensional/` | reuse as generation/pruning authority |
| expression AST and dimensional validation | `src/dimensional/` | extend typing incrementally |
| automatic differentiation | `src/diff/` | reuse for sensitivity/Jacobians |
| bridge catalog and evaluators | `src/bridges/` | add evidence/provenance hooks |
| observational confrontation | `src/bridges/` | generalize through adapters, not duplicate |
| quantity graph and composition | `src/composition/` | extend discovery/frontier logic here |
| candidate vetting | `src/composition/discovery.ts` | evolve rather than replace |
| retrodiction/forward evaluation | `src/composition/retrodiction.ts` | reuse in falsification/evidence |
| grounding/adjudication/consequence | `src/composition/` | make first-class pipeline stages |
| public package surface | `src/index.ts` | add only stable, reviewed APIs |

### 2.2 New top-level code is intentionally small

Only cross-cutting concerns that do not naturally belong to an existing physics layer get a new home:

```text
src/
├── research/          # run manifests, schemas, reproducibility, reports
└── data/              # generic scientific dataset abstraction/adapters
```

Everything else lands in an existing subsystem:

```text
src/composition/
  frontier.ts
  residual.ts
  candidate-record.ts
  candidate-store.ts
  experiment-design.ts
  search-budget.ts
  discovery-backend.ts

src/canonical/
  scientific-relation-metadata.ts
  relation-equivalence.ts

src/bridges/
  evidence-profile.ts
  observation-dataset-adapter.ts

src/dimensional/
  physics-typed-grammar.ts
  expression-cost.ts
```

Exact file placement is subject to an ADR in Phase 0; the invariant is **no parallel duplicate subsystem**.

---

## 3. Scientific relation metadata: additive, not a replacement model

UPT already has several computational relation types. v1 adds a normalized metadata envelope that can point to any of them.

```ts
export type RelationKind =
  | 'definition'
  | 'canonical-equation'
  | 'field-equation'
  | 'bridge-equation'
  | 'approximation'
  | 'effective-relation'
  | 'phenomenological-relation'
  | 'computational-predicate'
  | 'candidate-hypothesis';

export type AuditState =
  | 'verified'
  | 'partially-verified'
  | 'not-yet-audited'
  | 'unknown'
  | 'not-applicable';

export interface ScientificRelationRecord {
  readonly relationId: string;
  readonly relationKind: RelationKind;

  /** Reference to an existing canonical/bridge/candidate object. */
  readonly sourceRef: ScientificRelationRef;

  readonly assumptions: readonly AuditedTextClaim[];
  readonly validity: ValidityEnvelope;
  readonly provenance: ProvenanceBundle;
  readonly evidence: EvidenceProfile;
  readonly limits: readonly RelationLimit[];

  /** Metadata schema, independent of package semver. */
  readonly schemaVersion: string;
}
```

### 3.1 No forced migration by fabrication

Existing records are migrated with truthful states:

```ts
{
  assumptions: [],
  validity: { auditState: 'not-yet-audited' },
  provenance: { auditState: 'partially-verified', sources: [...] }
}
```

Missing information is not inferred simply to reach “100% metadata coverage.” Coverage metrics distinguish:

- schema coverage;
- audited coverage;
- verified coverage;
- unknown/not-applicable coverage.

### 3.2 Evidence is a vector, not one confidence number

Existing `confidence` fields remain backward compatible, but new scientific workflows use structured evidence:

```ts
export interface EvidenceProfile {
  readonly theoretical: EvidenceAssessment;
  readonly empirical: EvidenceAssessment;
  readonly replication: EvidenceAssessment;
  readonly regimeCoverage: EvidenceAssessment;
  readonly provenanceQuality: EvidenceAssessment;
}

export interface EvidenceAssessment {
  readonly state: 'supported' | 'mixed' | 'unsupported' | 'unknown' | 'not-applicable';
  readonly rationale?: string;
  readonly sourceIds?: readonly string[];
}
```

No fake precision such as `theoreticalSupport: 0.83` is introduced without a documented statistical interpretation.

---

## 4. Frontier model: represent different kinds of unknowns

The earlier pairwise `BridgeGap(sourceTheory,targetTheory)` model was too narrow. v1 uses a typed frontier object.

```ts
export type FrontierGapKind =
  | 'prediction-residual'
  | 'relation-link'
  | 'regime-transition'
  | 'parameter-tension'
  | 'assumption-conflict'
  | 'missing-operator'
  | 'unexplained-observation'
  | 'model-disagreement'
  | 'causal-mechanism'
  | 'other';

export interface FrontierGap {
  readonly id: string;
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

### 4.1 Frontier detection is conservative

A scanner may identify a **candidate gap**, but expert/domain policy decides whether it is scientifically meaningful. Examples of false gaps that must be suppressed or labelled include:

- unit convention mismatches;
- variable aliases;
- known approximations outside their domain;
- duplicate representations;
- calibration artifacts;
- incompatible experimental definitions;
- numerically insignificant discrepancies;
- look-elsewhere effects.

### 4.2 Identifiability before generation

A gap that cannot constrain any candidate parameters should not trigger an expensive search.

```ts
export interface IdentifiabilityAssessment {
  readonly status: 'identifiable' | 'partially-identifiable' | 'non-identifiable' | 'unknown';
  readonly rank?: number;
  readonly reasons: readonly string[];
}
```

Reuse existing composition identifiability machinery where possible.

---

## 5. Residual semantics

Residual discovery is high priority, but “residual” must be explicit about mathematical meaning.

```ts
export type DiscrepancyKind =
  | 'additive'        // y_obs - y_pred
  | 'relative'        // (y_obs - y_pred) / scale
  | 'log-ratio'       // log(y_obs / y_pred)
  | 'standardized'    // covariance-normalized residual
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

---

## 6. Candidate representation and lifecycle

The existing `VettedCandidate` remains the proven path for quantity-identification candidates. v1 introduces a broader candidate envelope that can wrap a vetted link candidate or a generated expression.

```ts
export type CandidateOrigin =
  | { readonly kind: 'existing-link-vetter'; readonly ref: string }
  | { readonly kind: 'grammar-enumerator'; readonly runId: string }
  | { readonly kind: 'external-backend'; readonly backendId: string; readonly runId: string }
  | { readonly kind: 'human-authored'; readonly source: string };

export interface CandidateHypothesisRecord {
  readonly id: string;
  readonly gapId: string;
  readonly expression: ExprNode | FieldEquationRef | LinkIdentificationRef;
  readonly origin: CandidateOrigin;
  readonly assumptions: readonly AssumptionRef[];
  readonly validity: ValidityEnvelope;
  readonly status: CandidateStatus;
  readonly evaluations: readonly CandidateEvaluationRef[];
  readonly fingerprint: CandidateFingerprint;
  readonly schemaVersion: string;
}
```

### 6.1 Candidate state machine

```text
generated
   │
   ├─ invalid structure ───────────────→ rejected
   ▼
structurally-valid
   │
   ├─ known equivalent ────────────────→ equivalent-known
   │
   ├─ insufficient evidence ───────────→ insufficient-evidence
   ▼
empirically-fit
   │
   ├─ fails holdout ───────────────────→ rejected
   ▼
heldout-supported
   │
   ├─ counterexample / known bound ────→ falsified
   ▼
falsification-survivor
   ▼
expert-review-required
```

Transitions are append-only audit events; historical status is not overwritten.

---

## 7. Physics-typed generation grammar

The existing AST/dimensional validator is the foundation. v1 adds generation-time typing so invalid expressions are avoided rather than generated and discarded.

### 7.1 Required type dimensions

A generated node may carry:

- physical dimension;
- scalar/vector/tensor kind;
- tensor rank;
- covariant/contravariant index variance;
- index space/coordinate chart where applicable;
- real/complex/discrete domain;
- differentiability requirements;
- positivity/non-zero domain restrictions;
- unit-system convention;
- regime constraints.

### 7.2 Basic legality rules

Examples:

\[
[a+b] \Rightarrow [a]=[b],
\]

\[
\log x,\exp x,\sin x \Rightarrow [x]=1,
\]

and tensor contraction requires compatible index spaces and opposite variance when a metric-free contraction is intended.

### 7.3 Generation API

```ts
export interface CandidateGenerator {
  readonly id: string;
  generate(problem: SearchProblem, ctx: SearchContext): AsyncIterable<RawCandidate>;
}
```

`SearchContext` always includes a `SearchBudget`.

---

## 8. Search budgets, stopping, and candidate explosion

No discovery search is unbounded.

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

### 8.1 Search strategy progression

Implement in increasing sophistication:

1. bounded deterministic enumeration;
2. canonical deduplication;
3. dimension/signature indexing;
4. memoized partial-expression evaluation;
5. best-first or beam search using transparent heuristics;
6. optional stochastic/external generators.

The deterministic enumerator is the reference implementation and benchmark oracle for search semantics.

---

## 9. Canonical equivalence and negative-result memory

Different syntax must not be mistaken for different physics.

### 9.1 Fingerprint levels

```ts
export interface CandidateFingerprint {
  readonly syntaxHash: string;
  readonly canonicalAstHash: string;
  readonly dimensionalSignature: string;
  readonly regimeSignature: string;
  readonly assumptionSignature: string;
}
```

Equivalence checks progress from cheapest to strongest:

1. exact syntax;
2. normalized AST;
3. algebraic canonicalization;
4. dimensional equivalence;
5. numerical equivalence on a guarded sample domain;
6. asymptotic equivalence;
7. domain-aware physical equivalence requiring expert rules.

Numerical agreement alone never proves symbolic equivalence.

### 9.2 Rejection registry

```ts
export interface RejectionRecord {
  readonly fingerprint: CandidateFingerprint;
  readonly reason: RejectionReason;
  readonly counterexample?: CounterexampleRef;
  readonly context: EvaluationContextRef;
  readonly timestamp: string;
}
```

A rejection only prunes future candidates in contexts where its assumptions, regime, and evidence remain applicable.

---

## 10. Generation backends

UPT must not depend on one discovery method.

### 10.1 Native deterministic grammar enumeration

Required first because it provides:

- transparent search semantics;
- deterministic regression tests;
- a baseline against which external methods are measured;
- direct integration with UPT dimensions, ASTs, tensors, and canonicalization.

### 10.2 Sparse dynamical identification

Support a backend for systems of the form

\[
\dot{\mathbf x}=\Theta(\mathbf x)\xi
\]

with sparse coefficients. This may be implemented natively for small libraries or through a plugin.

### 10.3 Symbolic regression

PySR-like or other external solvers are optional candidate generators. They never control final UPT status.

### 10.4 Formal algebraic backend

A theorem/optimization backend may operate on a documented fragment such as polynomial equalities/inequalities. A returned certificate means only:

> under premises P and formal semantics S, statement H was derived/verified by backend B version V.

The report must include the exact fragment and assumptions.

### 10.5 Neural residual probes

If neural models are used, their role is exploratory structure detection or surrogate modeling. An opaque model is not serialized as a scientific law. Distillation into an interpretable candidate returns to the ordinary UPT pipeline.

---

## 11. External backend protocol and isolation

External generators are treated as untrusted computational workers.

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

Prefer a newline-delimited JSON or equivalent streaming protocol:

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
- secrets never serialized into run manifests.

---

## 12. Data and observation model

Do not couple discovery algorithms directly to CSV, HDF5, FITS, or remote APIs.

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

### 12.1 Initial adapters

Implement only what benchmark and first-use cases require:

1. in-memory arrays;
2. JSON;
3. CSV.

Add Arrow/Parquet, HDF5, FITS, or domain archives only when a concrete use case exists.

### 12.2 Provenance requirements

A dataset record should support:

- source URI/DOI/accession where available;
- experiment/instrument identity;
- units and coordinate conventions;
- calibration/version information;
- selection/filter pipeline;
- uncertainty/covariance metadata;
- acquisition and processing timestamps when meaningful;
- checksum/content hash;
- license/redistribution constraints;
- transformations performed by UPT.

Raw copyrighted/restricted data is not copied into reports merely because UPT can read it.

---

## 13. Uncertainty and evidence evaluation

Point estimates are insufficient for scientific comparison.

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

### 13.2 Supported propagation ladder

1. exact/analytic propagation when available;
2. first-order Jacobian propagation using existing AD where valid;
3. bootstrap/resampling;
4. Monte Carlo propagation;
5. posterior sample propagation through optional Bayesian adapters.

For a differentiable transform:

\[
\Sigma_y \approx J\Sigma_xJ^T.
\]

Reports must state which method was used and its approximation assumptions.

### 13.3 Exploratory vs confirmatory evidence

Every dataset role is explicit:

```ts
export type DatasetRole =
  | 'exploratory-fit'
  | 'validation-holdout'
  | 'external-replication'
  | 'falsification-only';
```

A candidate cannot receive `heldout-supported` status if the alleged holdout influenced generation, model selection, preprocessing choices, or hyperparameter tuning.

### 13.4 Multiple-hypothesis controls

Where p-values or repeated significance tests are used, record:

- number/family of hypotheses tested;
- correction method (e.g. FDR/FWER) where appropriate;
- selection procedure;
- whether the result is exploratory;
- pre-registration/locked holdout status.

UPT should prefer predictive held-out performance and model comparison over naive “small p-value = discovery” logic.

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

Examples include:

\[
v/c\to0,\quad \hbar\to0,\quad G\to0,\quad r\to\infty,\quad T\to0.
\]

A failed limit is not automatically fatal if the candidate explicitly excludes that domain; instead the validity envelope and claimed scope are checked for consistency. A candidate that claims the domain and fails its required limit is rejected or falsified.

---

## 15. Falsification engine

The scientific value of generation depends on how aggressively UPT can eliminate candidates.

### 15.1 Falsifier contract

```ts
export interface CandidateFalsifier {
  readonly id: string;
  attack(candidate: CandidateHypothesisRecord, ctx: FalsificationContext): Promise<FalsificationResult>;
}
```

### 15.2 Falsifier classes

- dimensional and unit consistency;
- tensor/index legality;
- domain/finiteness/positivity constraints;
- symmetry constraints;
- conservation constraints;
- known limits;
- existing bridge/canonical consistency;
- retrodiction contradictions;
- known observational bounds;
- adversarial parameter sweeps;
- counterexample search;
- numerical conditioning/stability;
- out-of-sample prediction;
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

This turns rejection into reusable scientific information.

---

## 16. Symmetry and conservation discovery

These are later phases because inferring structure is harder than enforcing known structure.

### 16.1 Symmetry discovery

Search a bounded transformation family `T_θ` for approximate invariance:

\[
F(T_\theta x)\approx F(x).
\]

Every result states:

- transformation family searched;
- parameter bounds;
- dataset/regime;
- invariance tolerance;
- whether the symmetry was imposed, inferred, or merely compatible.

### 16.2 Conservation discovery

Search bounded candidate functions `Q` satisfying approximately

\[
\frac{dQ}{dt}=0.
\]

Use held-out trajectories; distinguish exact symbolic conservation from numerical near-conservation.

---

## 17. Regime and transition discovery

A missing bridge can be a missing regime boundary rather than a missing global equation.

```ts
export interface LearnedRegime {
  readonly id: string;
  readonly predicate: RegimePredicate;
  readonly relationRef: ScientificRelationRef;
  readonly evidence: EvidenceProfile;
}

export interface TransitionSurface {
  readonly expression: ExprNode;
  readonly uncertainty?: TransitionUncertainty;
}
```

Focus on dimensionless control parameters where possible. Existing `TensorIndices`, quantity attributes, regime registry, and axis gates remain the vocabulary to which learned regimes must map or propose extensions.

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

If later phases add structural causal models, they must specify:

- graph/model assumptions;
- intervention definition;
- confounder handling;
- identifiability assumptions;
- transportability limitations.

---

## 19. Novelty and literature grounding

### 19.1 Automated novelty is corpus-relative

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

Machine-extracted papers enter a staging store:

```text
source document
     ↓
machine extraction
     ↓
quarantined relation proposal
     ↓
citation/equation verification
     ↓
expert approval
     ↓
trusted/indexed comparison corpus
```

Machine extraction never silently mutates the canonical registry.

### 19.3 Copyright and licensing

Store citations, identifiers, structured facts, permitted snippets, and derived metadata according to source terms. Do not assume permission to redistribute full source documents or large extracted passages.

---

## 20. Experiment design

The goal is not simply maximum numerical separation. The goal is maximum **scientific information under feasible experimental constraints**.

### 20.1 Simple discrimination objective

For two candidates:

\[
J(u)=\frac{|H_1(u)-H_2(u)|}{\sigma_{total}(u)}.
\]

### 20.2 Bayesian information objective

Where predictive distributions are available:

\[
u^*=\arg\max_u \mathbb E[I(H;Y\mid u)].
\]

### 20.3 Required constraints

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

UPT may rank candidate experimental settings, but laboratory safety, ethics, regulatory requirements, and practical design remain human responsibilities.

### 20.4 Report

```text
Experiment proposal XP-103
--------------------------
Compared hypotheses: H-17, H-22
Controls: ...
Predictions: ...
Total uncertainty model: ...
Expected separation/information gain: ...
Feasibility constraints checked: ...
Unmodeled constraints: ...
Recommended precision: ...
Reason this region is informative: ...
```

---

## 21. Reproducible discovery runs

A search is a scientific artifact.

```ts
export interface DiscoveryRunManifest {
  readonly schemaVersion: string;
  readonly runId: string;
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

### 21.1 Reproduction levels

Reports distinguish:

- **bitwise reproducible** — identical bytes expected;
- **numerically reproducible** — results within declared tolerance;
- **statistically reproducible** — stochastic distribution/metrics expected to agree;
- **replayable only** — inputs/environment are recorded but backend nondeterminism prevents a stronger guarantee.

This avoids promising determinism that GPU libraries, external solvers, or floating-point scheduling cannot supply.

---

## 22. Persistence, schemas, and migrations

Before discovery artifacts become a stable public API, define versioned JSON schemas for:

- `ScientificRelationRecord`;
- `FrontierGap`;
- `CandidateHypothesisRecord`;
- `CandidateEvaluation`;
- `RejectionRecord`;
- `DiscoveryRunManifest`;
- experiment-design reports.

### 22.1 Rules

1. Every persisted object carries `schemaVersion`.
2. Parsers reject unknown incompatible major schema versions.
3. Additive optional fields do not require immediate migration.
4. Breaking schema changes get explicit migration functions and fixtures.
5. Golden serialization tests pin canonical representations.
6. Hashes are calculated over a documented canonical serialization.
7. Internal experimental schemas do not imply long-term public API stability.

---

## 23. Benchmark program

UPT must prove it can **rediscover known structure, find planted corrections, and abstain when no credible relation exists** before being trusted on frontier data.

### 23.1 Rediscovery ladder

Suggested sequence:

1. dimensional pendulum scaling;
2. Newtonian relation(s);
3. Kepler scaling;
4. ideal-gas/thermodynamic relation;
5. harmonic oscillator;
6. nonlinear oscillator;
7. simple sparse dynamical system;
8. diffusion/wave PDE fragment;
9. weak-field relativistic relation;
10. synthetic baseline + hidden correction term.

Not every benchmark must use every backend.

### 23.2 Blind benchmark layout

```text
benchmarks/discovery/<case>/
  public/
    observations.*
    constraints.json
    problem.json
  scorer/
    hidden-truth.json
    score.ts
```

Production generators cannot import `scorer/`.

### 23.3 Null-science benchmarks

Required cases:

- pure noise;
- insufficient sample size;
- confounded association;
- incompatible pooled regimes;
- inconsistent measurements;
- high-dimensional underdetermination;
- deliberately no-simple-symbolic-law dataset.

Measure:

- false-candidate rate;
- abstention calibration;
- compute spent before abstention;
- robustness to noise;
- sensitivity to selection bias.

### 23.4 Leakage controls

- hidden truth excluded from package/runtime import graph;
- fixed blind test split inaccessible to generation code;
- benchmark scorer runs after candidate generation;
- provenance records preprocessing decisions;
- benchmark changes require review because tuning against a hidden answer can silently destroy blindness.

---

## 24. Candidate scoring and ranking

Do not hide scientific tradeoffs inside one magic score.

### 24.1 Score vector

A candidate may expose normalized or categorical dimensions for:

- dimensional/structural validity;
- empirical predictive performance;
- limit compatibility;
- robustness;
- parsimony/description length;
- falsifiability;
- corpus distance;
- experiment discriminability;
- evidence independence;
- computational stability.

### 24.2 Pareto first

Default UI/API returns a Pareto frontier or lexicographically documented ranking policy. A scalar score is allowed only when its weights and normalization are explicit in the run manifest.

### 24.3 Complexity

Track more than AST node count:

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

Experimental commands should initially live behind an explicit discovery namespace and may be marked experimental.

```bash
upt frontier scan --problem problem.json
upt frontier show BG-104

upt discover run BG-104 \
  --backend native \
  --budget search-budget.json \
  --seed 42

upt discover candidates DR-00413
upt discover falsify DR-00413 --top 100
upt discover rank DR-00413 --pareto

upt experiment design \
  --run DR-00413 \
  --candidates H-17,H-22 \
  --constraints lab-bounds.json

upt research reproduce DR-00413
```

Programmatic APIs mirror these operations but remain internal/experimental until schemas stabilize.

### 25.1 Example terminal funnel

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

Counts are illustrative, never hard-coded expectations.

---

## 26. Scientist-facing candidate report

Every serious candidate should be explainable without reading internal code.

```text
Hypothesis H-0217
=================
Status: EXPERT REVIEW REQUIRED

Target frontier gap:
  BG-104 — prediction residual

Expression:
  ...

Origin:
  native grammar enumerator
  discovery run DR-00413

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

---

## 27. Corrected implementation phases

The original roadmap began adding new object systems too quickly. The corrected dependency order starts by formally mapping to the existing code.

### Phase 0A — Repository integration ADR and scientific contract

**Goal:** prove exactly where every v1 concept belongs before adding production types.

Deliverables:

- `docs/architecture/adr/` record (or repo-standard equivalent) mapping new concepts to current modules;
- scientific claim vocabulary and prohibited-claim rules;
- inventory of existing `PhysicalLaw`, `BridgeEquation`, `CanonicalEquation`, `VettedCandidate`, confrontation, grounding, adjudication, consequence, retrodiction, regime, and dimensional APIs;
- compatibility/migration decision for legacy scalar `confidence` fields;
- persistence/schema-version policy;
- threat model for external solvers and untrusted datasets.

Acceptance gates:

- no proposed type duplicates an existing authoritative type without a documented reason;
- architecture dependency graph remains acyclic in the proposed direction;
- all persistent/public schema decisions documented;
- no code behavior changes required for Phase 0A.

### Phase 0B — Benchmark and falsification specification

**Goal:** define how success and false discovery are measured before optimizing algorithms.

Deliverables:

- benchmark case format;
- blind scorer boundary;
- at least 3 rediscovery cases;
- at least 3 null-science cases;
- metrics for recovery, false positives, abstention, compute, and robustness.

Acceptance gates:

- generators cannot access hidden truth through normal imports/files exposed in run context;
- a deliberately trivial baseline produces documented baseline scores;
- null cases can return an explicit no-result outcome.

### Phase 1 — Scientific metadata overlay and run schemas

**Goal:** enrich existing relations without replacing them.

Implement:

- `ScientificRelationRecord` metadata envelope;
- audited/unknown/not-applicable states;
- provenance/evidence records;
- `DiscoveryRunManifest` schema;
- canonical serialization and migration fixtures.

Acceptance gates:

- all existing tests pass unchanged unless intentionally extended;
- no existing relation requires fabricated metadata;
- round-trip serialization tests pass;
- legacy APIs remain backward compatible;
- generated metadata can reference both canonical and bridge relations.

### Phase 2 — Frontier analysis integrated with composition

**Goal:** identify searchable scientific gaps using the existing graph.

Implement:

- `FrontierGap`;
- gap scanners for relation-link, model disagreement, and prediction residual cases;
- identifiability/searchability assessments;
- CLI read-only `upt frontier` commands.

Reuse:

- canonical linkage;
- composition graph/components;
- current discovery candidate infrastructure;
- retrodiction;
- axis/regime attributes.

Acceptance gates:

- planted graph gaps recovered in benchmark fixtures;
- aliases/known equivalents do not appear as gaps;
- non-identifiable gaps abstain before search;
- deterministic ordering for identical inputs.

### Phase 3 — Physics-typed bounded native generator

**Goal:** create a transparent reference generator.

Implement:

- generation-time dimensional/structural typing;
- bounded AST enumeration;
- `SearchBudget` and stop reasons;
- canonical fingerprinting/deduplication;
- expression complexity metrics.

Acceptance gates:

- generated expressions are dimensionally valid by construction where the grammar has enough information;
- invalid typed constructions are unrepresentable or rejected before evaluation;
- deterministic seed-independent native enumeration ordering;
- hard candidate/time/evaluation budgets tested;
- no runaway memory on benchmark maxima.

### Phase 4 — Residual/correction discovery

**Goal:** discover minimal corrections to known baselines rather than entire laws from scratch.

Implement discrepancy kinds:

- additive;
- relative/standardized;
- scalar/vector first;
- tensor/operator only after scalar/vector path is stable.

Acceptance gates:

- planted additive and multiplicative/relative corrections recovered in blind tests;
- wrong residual semantics demonstrably produce worse validation results;
- uncertainty/covariance is preserved through standardized residuals;
- no-result case abstains.

### Phase 5 — Evidence, uncertainty, and held-out validation

**Goal:** prevent fit quality from being confused with scientific evidence.

Implement:

- dataset roles;
- covariance-aware fit metrics;
- Jacobian/Monte Carlo uncertainty propagation;
- locked holdout mechanics;
- exploratory/confirmatory reporting;
- multiple-hypothesis metadata.

Acceptance gates:

- holdout leakage tests fail closed;
- uncertainty propagation validated against analytic fixtures;
- selected candidate cannot self-promote using training/selection data;
- reports expose dataset roles and selection count.

### Phase 6 — Known limits and generalized falsification

**Goal:** make candidate rejection a first-class product.

Implement:

- reusable limit specifications;
- retrodiction contradiction adapter;
- parameter-extreme sweeps;
- observational-bound adapter;
- rejection registry keyed by contextual fingerprints.

Acceptance gates:

- planted bad candidates are killed for the intended reason;
- counterexamples are persisted and replayable;
- rejection pruning never crosses incompatible regimes/assumptions;
- false rejection rate measured on valid rediscovery benchmarks.

### Phase 7 — External discovery backend protocol

**Goal:** permit multiple search algorithms without giving them authority over UPT semantics.

Implement:

- versioned worker protocol;
- process isolation/resource limits;
- first external adapter (choose SINDy-like sparse dynamics **or** symbolic regression based on benchmark need, not popularity);
- backend provenance and nondeterminism descriptors.

Acceptance gates:

- malformed/oversized worker output rejected;
- worker timeout/termination tested;
- shell-injection fixtures harmless;
- candidates pass through the same UPT canonicalization/constraint path as native candidates;
- benchmark compares external backend to native baseline.

### Phase 8 — Regime, symmetry, and conservation discovery

**Goal:** discover structure, not just algebraic expressions.

Implement incrementally:

1. regime/changepoint discovery;
2. dimensionless transition variables;
3. bounded symmetry families;
4. bounded conserved-quantity search.

Acceptance gates:

- known synthetic regimes recovered;
- approximate vs exact invariance clearly separated;
- held-out trajectories used for conservation validation;
- inferred structures never silently become hard constraints without review.

### Phase 9 — Experiment discrimination and information design

**Goal:** convert surviving hypotheses into actionable measurement priorities.

Implement:

- deterministic grid/reference optimizer;
- uncertainty-aware separation;
- feasibility predicates;
- cost/nuisance/systematic hooks;
- optional Bayesian information gain after reference behavior is pinned.

Acceptance gates:

- optimizer recovers analytic test optima;
- forbidden/unreachable regions are never recommended;
- systematic uncertainty can reverse rankings in a tested fixture;
- report includes unmodeled feasibility caveats.

### Phase 10 — Scientific corpus comparison and literature staging

**Goal:** improve equivalence/context search without overclaiming novelty.

Implement:

- versioned comparison corpus;
- algebraic/structural nearest-neighbor search;
- quarantine workflow for machine-extracted relations;
- citation/equation/expert verification statuses.

Acceptance gates:

- canonical registry cannot be mutated from unverified extraction path;
- reports use corpus-relative wording;
- known paraphrased/equivalent relations are matched in fixtures;
- licensing/provenance metadata required before corpus promotion.

### Phase 11 — Scientist workbench and visualization

**Goal:** make the full reasoning chain inspectable.

Views:

- known-relation graph;
- frontier/gap map;
- candidate Pareto explorer;
- constraint/falsification matrix;
- provenance/evidence browser;
- experiment-design comparison.

Acceptance gates:

- every UI claim links to underlying machine-readable artifact;
- no UI status is stronger than the stored epistemic status;
- large candidate sets use sampling/aggregation rather than freezing the client.

### Phase 12 — Public API stabilization and v1 release gate

**Goal:** decide what is stable enough to expose as supported v1 API.

Required before promotion:

- schema migration exercise across at least one intentional schema revision;
- benchmark history showing no unexplained regression;
- null-science false-positive targets defined and met;
- package consumer smoke tests for public additions;
- security review of external backend path;
- documentation and worked examples;
- reproducibility report from a clean environment;
- scientific-claim language review.

Only then move selected experimental APIs onto the stable root export surface.

---

## 28. Cross-phase test strategy

Every phase adds tests at four levels where applicable:

1. **unit:** local mathematical/data-model contracts;
2. **property/invariant:** dimensional legality, canonicalization idempotence, serialization stability;
3. **integration:** existing UPT graph + new feature;
4. **scientific benchmark:** blind recovery, planted falsification, or null abstention.

### 28.1 Required invariants

- canonicalization is idempotent;
- candidate fingerprint is stable for canonical equivalent inputs under documented transformations;
- a rejected candidate cannot become accepted merely by serialization/reload;
- unknown evidence never becomes supported through default values;
- holdout data cannot enter generation context;
- no candidate status transition skips required gates;
- all run artifacts reference immutable dataset/code identities;
- identical deterministic inputs produce identical native search ordering;
- budget exhaustion returns a valid partial result plus stop reason;
- no-result is representable everywhere from engine to CLI/report.

---

## 29. Performance plan

Performance optimization comes after semantics are pinned, but resource limits are present from the first generator.

### 29.1 Primary cost centers

- combinatorial AST generation;
- algebraic canonicalization;
- repeated dimensional/type inference;
- repeated numerical evaluation across datasets;
- equivalence checks;
- external process startup/IPC;
- experiment optimization.

### 29.2 Techniques

- signature-index partial expressions;
- memoize canonicalized subtrees;
- hash-cons immutable AST nodes where beneficial;
- vectorize dataset evaluation;
- reuse existing candidate-invariant discovery context patterns;
- cache only with complete context keys (units, regime, assumptions, dataset hash, tolerances);
- stream candidates rather than materialize unbounded arrays;
- benchmark before parallelization;
- use worker pools only after deterministic ordering/reduction semantics are specified.

### 29.3 Performance acceptance

Each search benchmark records:

- candidates generated/sec;
- candidates evaluated/sec;
- peak memory;
- deduplication ratio;
- time per pipeline stage;
- external backend overhead;
- final candidates per unit compute.

The optimization target is not raw equation throughput. It is **credible information per unit compute**.

---

## 30. Security and robustness plan

Discovery introduces new attack surfaces because users may supply expressions, datasets, backend configurations, and external executables.

Required controls:

- never evaluate arbitrary JavaScript from a scientific expression;
- never build shell commands through string concatenation of user input;
- schema-validate manifests and worker messages;
- cap file sizes/row counts where parsers need protection;
- protect against decompression/archive bombs in future adapters;
- avoid unsafe object prototype merging from untrusted JSON;
- constrain filesystem paths to approved roots for worker jobs;
- redact secrets/environment credentials from manifests;
- make network access opt-in for backends;
- treat NaN/Infinity/overflow/underflow explicitly in numerical gates;
- record tolerance policy rather than using scattered magic epsilons;
- fuzz parser/protocol boundaries.

---

## 31. Documentation requirements

Each implemented phase updates:

- architecture component map;
- public/experimental API docs;
- scientific claim semantics;
- reproducibility documentation;
- benchmark results;
- threat model if attack surface changes.

Every scientist-facing feature needs at least one worked example showing:

1. what is known;
2. what data are supplied;
3. what UPT is allowed to infer;
4. what candidate was generated;
5. how it was tested;
6. what failed;
7. what remains uncertain;
8. what measurement would change the conclusion.

---

## 32. Governance and review gates

Some changes need more than ordinary code review.

### Scientific-review required

- changing epistemic status vocabulary;
- promoting a candidate/extracted relation into a trusted corpus;
- changing benchmark hidden truth or scoring in a way that affects historical comparison;
- introducing a new default statistical significance policy;
- changing equivalence rules that can suppress candidates;
- changing hard scientific constraints used in generation.

### Engineering-review required

- public schema changes;
- new external-process capability;
- new network-enabled data/backend adapter;
- persistence migration;
- new concurrency model affecting determinism.

---

## 33. Definition of “useful for frontier science”

UPT v1 is not successful because it emits complicated expressions. It is useful if it can demonstrate all of the following on controlled and then real scientific problems:

1. represent the relevant accepted relations and their validity/provenance without overstating certainty;
2. identify a meaningful discrepancy or connectivity gap;
3. determine whether the gap is sufficiently identifiable to search;
4. generate candidates that are physically typed and bounded by explicit assumptions;
5. remove duplicates and already-known equivalents efficiently;
6. evaluate candidates with uncertainty and truly held-out evidence;
7. recover required established limits;
8. find counterexamples and remember rejected equivalence classes;
9. abstain when evidence is weak or the problem is underdetermined;
10. compare surviving hypotheses transparently rather than hiding tradeoffs in one score;
11. propose feasible measurements that would discriminate them;
12. reproduce the reasoning chain from immutable run artifacts.

The desired scientific object is therefore not merely an equation. It is a traceable chain:

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

---

## 34. First implementation tranche after plan approval

Do **not** begin by integrating a symbolic-regression package.

The first executable tranche should be deliberately small:

### Tranche A

1. Phase 0A repository-integration ADR;
2. scientific claim vocabulary/types internal to the discovery experiment;
3. `DiscoveryRunManifest` v0 schema;
4. two rediscovery benchmark fixtures;
5. two null-science fixtures;
6. baseline benchmark runner using existing discovery/retrodiction/dimensional machinery only.

### Exit criteria

- no production behavior regression;
- no duplicated authoritative subsystem;
- blind benchmark boundary demonstrated;
- no-result/abstention demonstrated;
- run artifact reproducible from a clean checkout;
- CI green;
- architecture review completed before Phase 1 data-model expansion.

This tranche converts the roadmap from aspiration into a measurable scientific-development program while keeping risk low.

---

## 35. Closing design principle

The enduring advantage of UPT should **not** be that it can call a fashionable symbolic-regression or AI model. Those algorithms will change.

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

Generation may be broad. Acceptance must be conservative. Falsification is a feature. Abstention is a valid result. Provenance is part of the result, not decoration.

That combination would make UPT meaningfully more useful to scientists exploring the boundary between known and unknown physics without pretending that computation alone can certify a new law of nature.
