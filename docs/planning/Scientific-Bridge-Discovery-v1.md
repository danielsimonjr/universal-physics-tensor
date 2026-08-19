# Universal Physics Tensor v1.0 — Scientific Bridge Discovery Platform

**Status:** Strategic implementation plan  
**Target:** UPT v1.x discovery architecture  
**Purpose:** Evolve UPT from a computational laboratory for organizing and confronting known physics relations into a rigorous, reproducible scientific-discovery environment for identifying structured gaps between known theories and observations, generating physically constrained candidate bridges, aggressively falsifying them, and designing measurements that distinguish surviving hypotheses.

---

## 1. Mission and scientific contract

UPT v1.0 should answer a more useful question than “what equations can be combined?”

> **Where does established physics stop being sufficient, what is the smallest physically admissible extension that could explain the discrepancy, and what observation would distinguish that extension from competing explanations?**

The target discovery loop is:

```text
Known physics
    +
Experimental / observational evidence
    +
Mathematical and physical constraints
    +
Explicit epistemic provenance
    ↓
Structured unknowns / frontier gaps
    ↓
Candidate bridge hypotheses
    ↓
Constraint pruning
    ↓
Empirical fitting and uncertainty analysis
    ↓
Known-limit recovery
    ↓
Aggressive falsification
    ↓
Novelty / equivalence analysis
    ↓
Surviving hypotheses
    ↓
Discriminating experiment design
    ↓
New evidence
    ↺
```

UPT must remain scientifically conservative. It may identify a **candidate**, a **potentially novel relation**, or a **surviving hypothesis**. It must not automatically label a generated expression a “new law of physics.” Promotion to stronger epistemic status requires explicit evidence and, where appropriate, human scientific review.

### 1.1 Non-goals

UPT v1.0 is not intended to:

- claim a Theory of Everything;
- replace peer review or experimental replication;
- use LLM plausibility as evidence;
- treat curve fit quality as proof of physical truth;
- silently elevate literature extraction into accepted physics;
- hide uncertainty, assumptions, regimes, provenance, or failed tests;
- optimize primarily for the number of equations generated.

The optimization target is closer to **information gained per hypothesis investigated**.

---

# 2. Core conceptual model: the Knowledge Frontier

The central new abstraction is the **Knowledge Frontier**.

For a baseline theory or theory set \(T\), observations \(D\), and known constraints \(C\), define a frontier object representing what is not adequately explained:

\[
\mathcal{F}(T,D,C)
= \text{Observed structure} - \text{Consequences adequately explained by }T.
\]

The subtraction is conceptual, not necessarily numeric. A frontier can contain:

- numerical residuals;
- unexplained scaling behavior;
- missing mappings between theories;
- incompatible assumptions;
- unexplained regime transitions;
- inconsistent symmetry structures;
- missing conservation structure;
- unexplained dimensionless ratios;
- parameter tensions;
- weakly constrained domains;
- contradictions between datasets;
- phenomena with no accepted bridge relation.

UPT should make ignorance machine-readable.

---

# 3. First-class scientific objects

## 3.1 Epistemic status

Every law, relation, extracted expression, and generated candidate must carry an explicit epistemic status.

```ts
export type EpistemicStatus =
  | 'axiom'
  | 'definition'
  | 'derived'
  | 'empirical-law'
  | 'effective-theory'
  | 'approximation'
  | 'phenomenological'
  | 'conjecture'
  | 'candidate'
  | 'falsified'
  | 'superseded';
```

No public scientific object may omit this status.

## 3.2 Evidence profile

Evidence must be decomposed rather than represented by one opaque confidence number.

```ts
export interface EvidenceProfile {
  theoreticalSupport?: number;
  experimentalSupport?: number;
  replicationStrength?: number;
  regimeCoverage?: number;
  provenanceQuality?: number;
  uncertaintyQuality?: number;
  independentDatasets?: number;
  notes?: string[];
}
```

Numeric fields should be documented as normalized ranking aids, not probabilities of truth unless a formally defined Bayesian model justifies that interpretation.

## 3.3 ScientificLaw

Existing bridge/canonical relations should gradually map into a richer object model.

```ts
export interface ScientificLaw {
  id: LawId;
  name: string;
  expression: PhysicsAST;

  quantities: QuantityId[];
  constants: ConstantId[];
  dimensions: DimensionalSignature;

  assumptions: Assumption[];
  regimes: Regime[];
  symmetries: SymmetryConstraint[];
  conservationLaws: ConservationConstraint[];

  boundaryConditions?: BoundaryCondition[];
  initialConditions?: InitialCondition[];
  limitingCases: LimitCase[];

  epistemicStatus: EpistemicStatus;
  evidence: EvidenceProfile;
  references: Citation[];
  derivedFrom: LawId[];
  falsificationHistory: FalsificationResult[];
}
```

## 3.4 Theory

```ts
export interface Theory {
  id: TheoryId;
  name: string;
  laws: LawId[];
  assumptions: Assumption[];
  regimes: Regime[];
  symmetries: SymmetryConstraint[];
  ontology?: OntologyEntry[];
  evidence: EvidenceProfile;
  references: Citation[];
}
```

The distinction between a law and theory matters because frontier gaps may occur between collections of mutually supporting relations rather than individual equations.

## 3.5 BridgeGap

`BridgeGap` becomes the central discovery target.

```ts
export interface BridgeGap {
  id: GapId;
  sourceTheories: TheoryId[];
  targetTheories: TheoryId[];

  sharedQuantities: QuantityId[];
  overlapRegime?: Regime;
  knownConstraints: Constraint[];

  incompatibleAssumptions: AssumptionConflict[];
  unexplainedObservations: ObservationId[];
  residuals: Residual[];
  missingRelations: MissingRelation[];

  informationValueEstimate?: number;
  experimentalAccessibility?: number;
  underdeterminationEstimate?: number;

  status:
    | 'identified'
    | 'searching'
    | 'candidate-found'
    | 'unresolved'
    | 'closed';
}
```

A gap is not itself evidence of new physics. It is an explicit representation of an unresolved mapping or discrepancy.

---

# 4. Residual-first discovery

The preferred discovery strategy should often search for **correction terms** rather than entire laws from scratch.

For observations \(y_{obs}\) and a trusted baseline prediction \(y_0\):

\[
y_{obs} = y_0 + \Delta.
\]

Search for:

\[
\Delta = f(x_1,\ldots,x_n).
\]

At a field/theory level:

\[
\mathcal{L} = \mathcal{L}_0 + \Delta\mathcal{L}
\]

or

\[
G_{\mu\nu}=8\pi G T_{\mu\nu}+\Delta_{\mu\nu}.
\]

The ranking objective should favor minimal extensions:

\[
H^*=\arg\min_H
\left[
E_{data}(H)
+\lambda C(H)
+\mu D(H,T_0)
\right]
\]

where:

- \(E_{data}\): disagreement with observations;
- \(C(H)\): symbolic/model complexity;
- \(D(H,T_0)\): theory distance from the accepted baseline.

### 4.1 Residual types

Support, in order:

1. scalar residuals;
2. vector residuals;
3. tensor residuals;
4. time-series residuals;
5. spatial fields;
6. spatiotemporal fields;
7. residual operators / PDE terms.

### 4.2 Acceptance criteria

- Baseline predictions and residual definitions must preserve units and tensor structure.
- Residual extraction must propagate uncertainty.
- A candidate must never receive credit for re-learning the baseline term already supplied to the discovery problem.
- Synthetic benchmarks must demonstrate recovery of planted perturbations over multiple signal-to-noise levels.

---

# 5. Physics-typed expression grammar

UPT should generate physically legal expressions by construction wherever possible.

Create:

```text
src/discovery/grammar/
  scalar.ts
  vector.ts
  tensor.ts
  differential.ts
  integral.ts
  transcendental.ts
  operator-rules.ts
  unit-rules.ts
  symmetry-rules.ts
  grammar.ts
```

## 5.1 Dimensional rules

Examples:

- addition/subtraction requires compatible dimensions;
- `exp`, `log`, `sin`, `cos`, etc. require dimensionless arguments unless a domain-specific transformed representation explicitly defines otherwise;
- powers of dimensionful quantities require legal exponents;
- constants preserve declared dimensions;
- derivatives update dimensional signatures correctly;
- integral measures contribute their dimensions explicitly.

## 5.2 Tensor rules

- tensor addition requires compatible rank, variance, and index spaces;
- contractions require compatible paired indices;
- free indices must match across equality relations;
- metric raising/lowering must preserve declared coordinate/index spaces;
- scalar-only functions may not silently consume non-scalars;
- symmetry metadata should prune impossible index arrangements.

## 5.3 Grammar budgets

Every search must expose hard limits:

```ts
export interface GrammarBudget {
  maxDepth: number;
  maxNodes: number;
  maxConstants: number;
  maxDerivativeOrder: number;
  maxIntegralDepth: number;
  allowedOperators: OperatorKind[];
}
```

This is necessary for reproducibility and computational cost control.

### 5.4 Target gate

For grammar-generated candidates, target >99.9% structural and dimensional legality before empirical evaluation.

---

# 6. Multi-backend hypothesis generation

UPT should own the **scientific constraints and candidate lifecycle**, while allowing multiple search engines to propose expressions.

```ts
export interface HypothesisGenerator {
  readonly id: string;
  generate(
    problem: DiscoveryProblem,
    constraints: ConstraintSet,
    options: SearchOptions,
  ): AsyncIterable<CandidateHypothesis>;
}
```

## 6.1 Backend A — deterministic grammar enumeration

This is the reference implementation and must ship first.

Responsibilities:

- enumerate legal ASTs;
- canonicalize expressions early;
- prune dimensional/tensor violations before construction;
- prune known-equivalent candidates;
- prune candidates matching the negative-result registry;
- produce deterministic output for a fixed configuration.

This backend provides a scientifically transparent baseline against which more sophisticated methods are measured.

## 6.2 Backend B — sparse dynamical discovery

Adapter architecture for SINDy-like workflows:

\[
\dot{\mathbf{x}} = \Theta(\mathbf{x})\boldsymbol{\xi}
\]

with sparse coefficient vector \(\boldsymbol{\xi}\).

UPT should construct or constrain \(\Theta\) from its physics grammar rather than blindly accepting arbitrary libraries.

## 6.3 Backend C — symbolic regression

External symbolic-regression engines may propose candidates, but every result must be re-imported into UPT’s AST and pass the same constraint pipeline.

No backend can bypass:

- dimensional validation;
- tensor validation;
- known-limit tests;
- provenance;
- uncertainty-aware empirical evaluation;
- novelty/equivalence checks.

## 6.4 Backend D — theorem-constrained polynomial search

For suitable polynomial/rational domains, provide an optional backend that searches under background equalities/inequalities and emits derivability or consistency certificates where the mathematics permits.

## 6.5 Backend E — neural residual probe

Neural models may be used as exploratory residual approximators:

\[
\Delta \approx f_\theta(x)
\]

but are not promoted as symbolic physical laws. The intended workflow is:

```text
neural residual probe
    ↓
structure / saliency / symmetry clues
    ↓
symbolic distillation
    ↓
UPT candidate lifecycle
```

---

# 7. Candidate hypothesis model and lifecycle

```ts
export interface CandidateHypothesis {
  id: HypothesisId;
  targetGap: GapId;
  expression: PhysicsAST;

  origin: {
    generator: string;
    runId: string;
    seed?: number;
    parents?: HypothesisId[];
  };

  assumptions: Assumption[];
  applicableRegimes: Regime[];

  dimensionalStatus: ConstraintResult;
  tensorStatus: ConstraintResult;
  symmetryStatus: ConstraintResult;
  conservationStatus: ConstraintResult;
  causalityStatus: ConstraintResult;

  limits: LimitTest[];
  fit?: EmpiricalFitResult;
  complexity: ComplexityMetrics;
  novelty?: NoveltyAssessment;
  falsification: FalsificationResult[];
  provenance: ProvenanceRecord[];

  status: CandidateStatus;
}
```

Recommended lifecycle:

```text
GENERATED
  ↓
STRUCTURALLY_VALID
  ↓
DIMENSIONALLY_VALID
  ↓
SYMMETRY_VALID
  ↓
KNOWN_LIMITS_VALID
  ↓
EMPIRICALLY_FIT
  ↓
CROSS_VALIDATED
  ↓
NOVELTY_CHECKED
  ↓
FALSIFICATION_SURVIVOR
  ↓
EXPERIMENT_PROPOSED
  ↓
SCIENTIST_REVIEWED
```

Possible terminal exits:

```text
STRUCTURE_FAILURE
DIMENSION_FAILURE
SYMMETRY_FAILURE
CONSERVATION_FAILURE
LIMIT_FAILURE
EMPIRICALLY_REJECTED
OVERFIT
KNOWN_EQUIVALENT
FALSIFIED
INSUFFICIENT_EVIDENCE
```

State transitions must be auditable and deterministic from recorded evidence where possible.

---

# 8. Regime discovery

Many physical laws are effective descriptions valid only in specific regions. UPT must therefore search not only for equations but for regime boundaries.

Represent piecewise physics as:

\[
f(x)=
\begin{cases}
f_1(x),&x\in R_1\\
f_2(x),&x\in R_2.
\end{cases}
\]

The missing scientific object may be the transition surface:

\[
R_1 \leftrightarrow R_2.
\]

```ts
export interface RegimeDiscoveryResult {
  regimes: LearnedRegime[];
  transitionSurfaces: TransitionSurface[];
  controllingGroups: DimensionlessGroup[];
  confidence: number;
}
```

Initial algorithms:

- changepoint detection;
- piecewise regression;
- clustering in dimensionless-variable space;
- residual discontinuity analysis;
- model-selection comparison between single-law and piecewise-law hypotheses.

Acceptance tests should include planted phase/regime transitions and smooth crossover cases.

---

# 9. Dimensionless-group discovery

Build a dedicated Buckingham-\(\Pi\) subsystem on top of UPT’s dimensional infrastructure.

Given \(n\) variables and a dimensional-rank matrix of rank \(r\), generate \(n-r\) independent dimensionless groups where applicable.

```ts
export interface DimensionlessGroup {
  expression: PhysicsAST;
  exponents: Record<QuantityId, Rational>;
  basisId: string;
}
```

Discovery should preferentially search relationships in dimensionless space:

\[
\Pi_1 = F(\Pi_2,\ldots,\Pi_k).
\]

This subsystem should also support identifying likely transition parameters, e.g. a regime change near \(\Pi\approx1\).

---

# 10. Symmetry and conservation discovery

## 10.1 Symmetry discovery

```ts
export interface SymmetryDiscoveryEngine {
  infer(
    data: ScientificDataset,
    hypothesis?: CandidateHypothesis,
  ): Promise<SymmetryCandidate[]>;
}
```

Initial transformation families:

- translation;
- rotation;
- scaling;
- permutation;
- parity/discrete transformations;
- domain-specific linear transformations.

Later extensions may support richer Lie/group and gauge-like structures.

The discovered symmetry becomes an input constraint for subsequent searches.

## 10.2 Conserved quantity discovery

Search candidate quantities \(Q\) satisfying approximately:

\[
\frac{dQ}{dt}\approx0.
\]

Use grammar-constrained candidates and uncertainty-aware thresholds.

Candidate dynamics and candidate conserved quantities should constrain each other iteratively.

---

# 11. Causal and intervention metadata

UPT must distinguish passive correlation from intervention evidence.

```ts
export type EvidenceMode =
  | 'observational'
  | 'interventional'
  | 'simulation'
  | 'theoretical-derivation';

export interface CausalRelation {
  cause: QuantityId;
  effect: QuantityId;
  mode: EvidenceMode;
  confounders?: QuantityId[];
  evidence: EvidenceRef[];
}
```

The initial implementation does not need a complete causal-inference framework. The first goal is epistemic hygiene: hypotheses supported only by observational correlations must not be reported as if intervention evidence exists.

---

# 12. Uncertainty and covariance

Every empirical subsystem must become uncertainty-aware.

```ts
export interface Measurement {
  value: number;
  unit?: Unit;
  uncertainty?: {
    statistical?: number;
    systematic?: number;
    calibration?: number;
  };
  covarianceRef?: string;
}
```

Support in stages:

1. independent Gaussian errors;
2. covariance matrices;
3. Monte Carlo propagation;
4. bootstrap confidence intervals;
5. posterior samples / Bayesian adapters;
6. interval arithmetic where scientifically useful.

For differentiable transforms:

\[
\Sigma_y \approx J\Sigma_xJ^T.
\]

Acceptance criteria:

- no empirical ranking may silently discard available uncertainty;
- likelihood/fit metrics must state their uncertainty model;
- candidate reports must distinguish statistical and systematic uncertainty where supplied;
- held-out evaluation must preserve train/test provenance.

---

# 13. Equivalence, novelty, and theory distance

Generating millions of mathematically equivalent expressions is both computationally wasteful and scientifically misleading.

## 13.1 Equivalence levels

Implement progressively:

1. syntactic canonicalization;
2. algebraic normalization;
3. dimensional equivalence;
4. constant-factor/rescaling equivalence;
5. variable-substitution equivalence;
6. numerical equivalence over admissible domains;
7. asymptotic equivalence;
8. physical special-case equivalence.

```ts
export interface EquivalenceResult {
  level: EquivalenceLevel;
  equivalent: boolean;
  witness?: EquivalenceWitness;
}
```

## 13.2 Novelty assessment

```ts
export interface NoveltyAssessment {
  exactKnownEquivalent?: LawId;
  nearestKnownRelations: SimilarRelation[];
  knownSpecialCase?: LawId;
  structuralDistance: number;
  literatureStatus: 'unchecked' | 'searched' | 'potentially-novel' | 'known';
}
```

The phrase **potentially novel** is preferred until literature and expert verification are complete.

## 13.3 Theory distance

Define an interpretable composite distance:

\[
D(H,T)=
 w_sD_{structure}
+w_pD_{parameters}
+w_yD_{symmetry}
+w_aD_{assumptions}
+w_rD_{predictions}.
\]

This enables a “minimal deformation” search: find the least radical extension that explains the unresolved evidence.

---

# 14. Known-limit recovery

A serious bridge hypothesis should inherit established physics in regimes where established physics is known to work.

Create:

```text
src/discovery/limits/
  limit-case.ts
  evaluator.ts
  asymptotic.ts
  registry.ts
```

```ts
export interface LimitCase {
  id: string;
  name: string;
  substitutions: LimitSubstitution[];
  expectedLaw?: LawId;
  expectedExpression?: PhysicsAST;
  tolerance: number;
}
```

Examples include:

- \(v/c\to0\);
- \(\hbar\to0\);
- \(G\to0\);
- weak-field limits;
- large-distance limits;
- low/high temperature limits;
- thermodynamic limits;
- continuum limits.

CLI target:

```bash
upt hypothesis limits H-183
```

Output should clearly distinguish `PASS`, `FAIL`, `INCONCLUSIVE`, and `NOT_APPLICABLE`.

---

# 15. Aggressive falsification engine

UPT should allocate at least as much engineering attention to destroying hypotheses as generating them.

```ts
export interface Falsifier {
  readonly id: string;
  attack(
    hypothesis: CandidateHypothesis,
    context: FalsificationContext,
  ): AsyncIterable<FalsificationResult>;
}
```

Initial falsifiers:

- dimensional consistency;
- tensor/index consistency;
- required symmetries;
- conservation laws;
- known limits;
- known experimental bounds;
- extreme-parameter sweeps;
- non-finite/unphysical output detection;
- numerical stability;
- cross-dataset generalization;
- out-of-distribution checks;
- counterexample search;
- literature-bound checks.

## 15.1 Maximum-disagreement search

For a candidate \(H\), baseline \(T_0\), controls \(x\), and measurement uncertainty \(\sigma\):

\[
x^*=\arg\max_x
\frac{|H(x)-T_0(x)|}{\sigma(x)}.
\]

UPT should search existing datasets around \(x^*\) first. If reliable measurements already contradict the candidate, reject it before proposing a new experiment.

## 15.2 Negative Result Registry

Rejected hypotheses are valuable scientific/computational memory.

```ts
export interface RejectedHypothesis {
  canonicalExpression: PhysicsAST;
  failureReason: FailureReason;
  failedConstraint?: Constraint;
  counterexample?: DatasetSlice;
  equivalentCandidates: HypothesisId[];
  runId: string;
}
```

Future searches should prune equivalent rejected candidates where the rejection remains applicable.

---

# 16. Experiment design

When multiple hypotheses survive, UPT should identify measurements that maximize discrimination.

For hypotheses \(H_1,\ldots,H_n\) and controllable experimental settings \(u\), first implement a practical separation metric:

\[
u^*=\arg\max_u
\frac{\max_{i,j}|H_i(u)-H_j(u)|}{\sigma_{measurement}(u)}.
\]

Later implement expected information gain:

\[
u^*=\arg\max_u I(H;Y\mid u).
\]

```ts
export interface ExperimentProposal {
  id: ExperimentProposalId;
  hypotheses: HypothesisId[];
  controls: ControlSetting[];
  predictedMeasurements: PredictedMeasurement[];
  requiredPrecision: MeasurementPrecision;
  expectedSeparation?: number;
  expectedInformationGain?: number;
  feasibility?: FeasibilityAssessment;
}
```

CLI target:

```bash
upt experiment design \
  --hypotheses H17,H22,H38 \
  --controls temperature,field
```

UPT should report the control region, required precision, predicted candidate separation, and assumptions used by the optimization.

---

# 17. Scientific data subsystem

Create a stable internal abstraction before adding many source-specific integrations.

```text
src/data/
  dataset.ts
  observation.ts
  schema.ts
  provenance.ts
  csv.ts
  json.ts
  arrow.ts
```

```ts
export interface ScientificDataset {
  metadata: DatasetMetadata;
  schema: ObservableSchema[];
  provenance: DataProvenance;
  covariance?: CovarianceModel;
  samples(): AsyncIterable<Observation>;
}
```

File/data adapters should be added in this order:

1. CSV;
2. JSON/JSONL;
3. Arrow/Parquet;
4. HDF5 adapter;
5. FITS adapter;
6. remote dataset manifests/plugins.

## 17.1 Dataset provenance

Every dataset should be able to record:

- source institution/repository;
- DOI/URL/identifier;
- experiment/instrument;
- calibration version;
- acquisition time range;
- processing pipeline;
- selection criteria;
- units;
- uncertainty model;
- license;
- content checksum.

Discovery runs must reference immutable dataset checksums.

---

# 18. Literature grounding and provenance

Literature integration must be explicitly staged:

```text
paper / preprint
    ↓
machine extraction
    ↓
proposed structured relation
    ↓
citation verification
    ↓
equation/context verification
    ↓
scientist approval / accepted repository object
```

```ts
export type LiteratureExtractionStatus =
  | 'machine-extracted'
  | 'citation-verified'
  | 'equation-verified'
  | 'scientist-approved';
```

No language model output may silently become an `empirical-law` or accepted `ScientificLaw`.

Literature adapters should be plugins, not hard-coded dependencies of the core discovery engine.

---

# 19. Candidate scoring and Pareto ranking

Avoid a single “truth score.” Use a vector:

\[
\mathbf S(H)=
(S_D,S_E,S_S,S_C,S_L,S_R,S_N,S_F,S_P,S_X)
\]

where:

- \(S_D\): dimensional/tensor validity;
- \(S_E\): empirical support;
- \(S_S\): symmetry compatibility;
- \(S_C\): conservation compatibility;
- \(S_L\): known-limit recovery;
- \(S_R\): robustness/generalization;
- \(S_N\): novelty;
- \(S_F\): falsifiability;
- \(S_P\): parsimony;
- \(S_X\): experimental discriminability.

Default ranking should expose a Pareto frontier and allow scientists to choose weighting profiles explicitly.

No hidden default weighting should masquerade as an objective scientific ordering.

---

# 20. Reproducible discovery runs

Every search is a persistent, reproducible scientific object.

```ts
export interface DiscoveryRun {
  id: DiscoveryRunId;
  gitCommit: string;
  packageVersion: string;
  randomSeed?: number;

  problem: DiscoveryProblem;
  generatorConfigs: GeneratorConfig[];
  datasetChecksums: DatasetChecksum[];
  constraints: ConstraintSet;
  softwareVersions: VersionManifest;

  candidateIds: HypothesisId[];
  startedAt: string;
  completedAt?: string;
}
```

CLI targets:

```bash
upt discover run problem.yaml --seed 42
upt discover reproduce DR-00413
upt discover report DR-00413
```

For deterministic backends, reproduction should regenerate an identical canonical candidate set for identical inputs and software versions.

For nondeterministic/external backends, UPT must record all available seeds and solver versions and clearly state reproducibility limitations.

---

# 21. Benchmark program

No frontier-discovery claim should be trusted until UPT can rediscover known physics and reject false structure under blind conditions.

Create:

```text
benchmarks/discovery/
  level-01-algebra/
  level-02-dimensional/
  level-03-kepler/
  level-04-thermodynamics/
  level-05-dynamics/
  level-06-pdes/
  level-07-relativity/
  level-08-hidden-correction/
  null-science/
```

## 21.1 Rediscovery ladder

### Level 1 — simple algebra
Recover relations equivalent to \(F=ma\).

### Level 2 — dimensional reconstruction
Recover pendulum scaling \(T\propto\sqrt{L/g}\).

### Level 3 — orbital scaling
Recover Kepler-like \(T^2\propto a^3\).

### Level 4 — thermodynamics
Recover selected equations of state from synthetic/noisy data.

### Level 5 — dynamical systems
Recover harmonic oscillator, Duffing, and selected low-dimensional nonlinear dynamics.

### Level 6 — PDEs
Recover diffusion, wave, and Burgers-like equations from generated data.

### Level 7 — relativity
Recover selected weak-field/known-limit relationships under constrained search spaces.

### Level 8 — hidden correction
Generate data from:

\[
T=T_0+\epsilon\Delta T
\]

and evaluate whether UPT identifies \(\Delta T\) as signal, across noise and sampling regimes.

This is the most strategically important benchmark because it directly approximates the intended frontier workflow.

## 21.2 Blind protocol

Ground truth must be inaccessible to the discovery process:

```text
benchmark-case/
  observed.json
  constraints.json
  known-baseline.json
  hidden/
    ground-truth.json
```

The runner sees only observations, baseline knowledge, and declared constraints. Scoring reads `hidden/` after discovery completes.

## 21.3 Null-science benchmarks

Include datasets where no simple physical bridge should be inferred:

- pure noise;
- confounded correlations;
- inconsistent datasets;
- underdetermined systems;
- multiple-comparison traps;
- interpolation artifacts.

Metrics must include false-discovery rate, not only rediscovery success.

---

# 22. Proposed source architecture

```text
src/
├── epistemology/
│   ├── evidence.ts
│   ├── status.ts
│   └── provenance.ts
├── knowledge/
│   ├── law.ts
│   ├── theory.ts
│   ├── assumptions.ts
│   └── graph.ts
├── frontier/
│   ├── gap.ts
│   ├── residual.ts
│   ├── regime-gap.ts
│   └── scanner.ts
├── discovery/
│   ├── problem.ts
│   ├── candidate.ts
│   ├── run.ts
│   ├── grammar/
│   ├── generators/
│   ├── sparse/
│   ├── symbolic/
│   ├── residual/
│   ├── symmetry/
│   ├── regimes/
│   └── limits/
├── constraints/
│   ├── dimensions/
│   ├── tensors/
│   ├── symmetry/
│   ├── conservation/
│   ├── causality/
│   └── limits/
├── evidence/
│   ├── fitting/
│   ├── uncertainty/
│   ├── cross-validation/
│   └── robustness/
├── falsification/
│   ├── engine.ts
│   ├── counterexample.ts
│   ├── extreme-regime.ts
│   ├── known-data.ts
│   └── rejected-registry.ts
├── experiment/
│   ├── discrimination.ts
│   ├── information-gain.ts
│   └── optimizer.ts
├── novelty/
│   ├── equivalence.ts
│   ├── distance.ts
│   └── registry.ts
├── data/
│   ├── dataset.ts
│   ├── provenance.ts
│   └── adapters/
└── research/
    ├── manifest.ts
    ├── report.ts
    └── reproduce.ts
```

Existing dimensional, numerical, bridge, canonical, composition, CLI, and tensor infrastructure should be reused rather than duplicated.

---

# 23. CLI and public API roadmap

## 23.1 CLI

```bash
upt frontier scan
upt frontier rank
upt frontier show BG-104

upt discover run problem.yaml --seed 42
upt discover reproduce DR-00413
upt discover report DR-00413

upt hypothesis show H-0217
upt hypothesis limits H-0217
upt hypothesis falsify H-0217
upt hypothesis compare H-0217 H-0222

upt experiment design --hypotheses H-0217,H-0222 --controls temperature,field
```

## 23.2 Programmatic API

```ts
const frontier = await upt.frontier.scan({ theories, datasets });

const run = await upt.discovery.run({
  gap: frontier.gaps[0],
  generators: ['enumerator'],
  constraints,
  seed: 42,
});

const survivors = await upt.falsification.attack(run.candidates);

const experiment = await upt.experiment.design({
  hypotheses: survivors.slice(0, 3),
  controls,
});
```

All CLI operations should call the same library APIs; no scientific logic should exist only in CLI code.

---

# 24. Candidate scientific report

Every serious candidate should render a standardized report:

```text
Hypothesis: H-0217
Scientific status: UNADJUDICATED CANDIDATE

Target gap:
BG-104

Expression:
ΔL = ...

Origin:
residual symbolic enumeration
Discovery run: DR-413

Background theory:
T-12, T-19, T-44

Dimensional consistency: PASS
Tensor consistency:      PASS
Symmetry constraints:    4/4 PASS
Conservation checks:     3/3 PASS

Known limits:
5 PASS
1 INCONCLUSIVE
0 FAIL

Empirical datasets:
D-17, D-21, D-89

Fit improvement:
...

Held-out validation:
PASS

Parameter uncertainty:
...

Nearest known relation:
BE-37

Novelty status:
POTENTIALLY NOVEL — literature verification incomplete

Falsification:
27 PASS
2 INCONCLUSIVE
0 FAIL

Most discriminating proposed measurement:
XP-19

Independent replication:
NONE

Scientific conclusion:
Interesting candidate requiring independent experimental and literature validation.
```

The report format should make unsupported leaps difficult to hide.

---

# 25. Implementation phases and dependency order

## Phase 0 — scientific discovery contract

**Deliverables**

- `docs/scientific-discovery-contract.md`;
- terminology and epistemic-state definitions;
- claim-language rules;
- reproducibility requirements;
- required provenance fields;
- allowed status transitions.

**Acceptance gates**

- every candidate-producing subsystem references the contract;
- no candidate can be automatically promoted to accepted-law status;
- machine-extracted literature cannot bypass verification stages.

## Phase 1 — epistemology and knowledge model

**Deliverables**

- `EpistemicStatus`;
- `EvidenceProfile`;
- `ScientificLaw`;
- `Theory`;
- `Assumption` / `Regime`;
- provenance records;
- compatibility adapters for existing bridge/canonical objects.

**Acceptance gates**

- existing public APIs remain backward-compatible where feasible;
- all bridge equations can be projected into the richer model;
- no exposed mapped law lacks epistemic status;
- serialization round-trips are deterministic.

## Phase 2 — Knowledge Frontier / BridgeGap

**Deliverables**

- `BridgeGap`;
- assumption conflict detector;
- regime-overlap evaluator;
- residual descriptors;
- frontier scanner and ranking;
- CLI `frontier` commands.

**Acceptance gates**

- planted synthetic missing-bridge cases are correctly identified;
- gap reports enumerate constraints and conflicting assumptions;
- ranking is reproducible and weighting is explicit.

## Phase 3 — physics-typed grammar

**Deliverables**

- grammar core;
- dimension-aware generation;
- tensor-aware generation;
- legal transcendental/operator rules;
- complexity budgets;
- canonicalization hooks.

**Acceptance gates**

- >99.9% generated candidates are valid by construction in benchmark grammars;
- no known dimension/tensor regression in existing UPT tests;
- generation is deterministic for fixed configuration.

## Phase 4 — deterministic baseline discovery

**Deliverables**

- `DiscoveryProblem`;
- `CandidateHypothesis`;
- deterministic enumerator;
- candidate lifecycle;
- basic parsimony ranking;
- run manifests.

**Acceptance gates**

- Level 1–3 rediscovery benchmarks pass at defined success thresholds;
- repeated fixed-input runs return identical canonical candidates;
- equivalent expressions are deduplicated.

## Phase 5 — residual/correction-term discovery

**Deliverables**

- scalar/vector/tensor residual extraction;
- uncertainty-preserving residual datasets;
- residual hypothesis generator;
- theory-distance penalty;
- planted-correction benchmarks.

**Acceptance gates**

- Level 8 planted corrections recovered across an agreed SNR matrix;
- baseline-only terms are not rewarded as discoveries;
- false-positive rate measured on null residuals.

## Phase 6 — backend plugin interface

**Deliverables**

- `HypothesisGenerator` plugin contract;
- sparse dynamics adapter;
- symbolic-regression adapter;
- optional theorem-constrained backend;
- normalized AST import pipeline.

**Acceptance gates**

- every external candidate passes the same UPT constraints;
- backend version/configuration recorded in run manifest;
- backend failures cannot corrupt core runs.

## Phase 7 — uncertainty, fitting, and robustness

**Deliverables**

- uncertainty propagation;
- covariance support;
- train/validation/test provenance;
- cross-validation;
- bootstrap utilities;
- robust candidate scoring.

**Acceptance gates**

- no available uncertainty silently dropped;
- empirical metrics state their likelihood/error assumptions;
- overfit synthetic candidates are rejected on held-out data.

## Phase 8 — limits and falsification

**Deliverables**

- known-limit registry;
- asymptotic/numerical limit evaluator;
- falsifier interface;
- parameter-extreme search;
- counterexample search;
- rejected-hypothesis registry.

**Acceptance gates**

- planted bad theories fail the intended tests;
- rejected equivalent candidates are pruned in future runs;
- failure witnesses are persisted and reportable.

## Phase 9 — regime, symmetry, conservation discovery

**Deliverables**

- changepoint/piecewise regime detection;
- dimensionless control-group discovery;
- first symmetry inference engines;
- conserved-quantity candidate search.

**Acceptance gates**

- benchmark transition surfaces recovered within tolerance;
- symmetry/conservation discoveries feed back into search constraints;
- uncertainty-aware thresholds prevent trivial false conservation claims.

## Phase 10 — experiment design

**Deliverables**

- maximum-separation optimizer;
- measurement-precision model;
- expected information gain extension;
- experiment report object;
- CLI/API support.

**Acceptance gates**

- synthetic competing hypotheses yield expected discriminating regions;
- infeasible/undefined domains are excluded;
- uncertainty is included in discrimination metrics.

## Phase 11 — scientific data and literature plugins

**Deliverables**

- dataset plugin system;
- Arrow/Parquet + scientific format adapters;
- remote manifest support;
- literature extraction/verification workflow;
- citation provenance.

**Acceptance gates**

- immutable input checksums recorded;
- machine-extracted equations remain explicitly unverified until promoted;
- external source failures degrade gracefully.

## Phase 12 — scientist workbench

**Deliverables**

- frontier graph visualization;
- candidate Pareto explorer;
- constraint/falsification matrix;
- evidence/provenance browser;
- experiment-design interface;
- reproducible run export.

**Acceptance gates**

- every visible claim links back to source evidence/run state;
- UI does not invent scientific status beyond core data model;
- candidate comparisons expose tradeoffs rather than one opaque score.

---

# 26. Testing strategy

Each new module requires:

1. unit tests;
2. property/invariant tests where mathematically appropriate;
3. integration tests against existing UPT objects;
4. deterministic serialization tests;
5. adversarial/negative tests;
6. benchmark coverage;
7. package/public-surface tests for exported APIs.

High-value invariants include:

- dimensional validity preserved by grammar construction;
- canonicalization idempotence;
- equivalence relation reflexivity/symmetry/transitivity where the level mathematically supports it;
- uncertainty covariance remains positive semidefinite within numerical tolerance;
- fixed-seed discovery determinism;
- no mutation of canonical law registries during hypothesis search;
- falsification results never promote epistemic status;
- hidden benchmark truth never enters discovery inputs.

---

# 27. Performance strategy

Discovery can be combinatorial. Performance must be designed in rather than patched later.

Required techniques:

- canonicalize before expensive evaluation;
- dimensional/tensor pruning at grammar expansion time;
- hash-cons AST nodes where useful;
- cache invariant subexpressions;
- memoize equivalence checks;
- beam/budget-based enumeration;
- cost-aware candidate queues;
- parallel evaluation with deterministic aggregation;
- optional worker-thread/process pools;
- early stopping when falsification succeeds;
- persisted negative-result pruning.

Benchmark metrics:

- candidates generated/sec;
- valid candidates/sec;
- duplicates pruned/sec;
- expensive empirical fits avoided by constraints;
- memory per million candidate nodes;
- reproducibility under parallel execution.

---

# 28. Security and robustness

Scientific data and plugin execution introduce new attack surfaces.

Requirements:

- no arbitrary code evaluation from candidate expressions;
- AST evaluator uses a closed operator registry;
- external backends run behind explicit adapters;
- file parsers enforce size/resource limits;
- remote manifests validate checksums;
- user-provided expressions cannot inject shell commands;
- CLI never interpolates untrusted scientific strings into shell execution;
- serialized runs are schema validated;
- plugin provenance/version recorded;
- optional sandboxing documented for heavyweight external solvers.

---

# 29. Documentation deliverables

UPT v1.0 should ship with:

```text
docs/
  scientific-discovery-contract.md
  discovery/
    concepts.md
    frontier.md
    residual-discovery.md
    grammar.md
    hypothesis-lifecycle.md
    uncertainty.md
    falsification.md
    experiment-design.md
    reproducibility.md
    benchmarks.md
```

Every major algorithm should document:

- assumptions;
- mathematical formulation;
- failure modes;
- computational complexity;
- uncertainty behavior;
- epistemic interpretation;
- reproducibility guarantees.

---

# 30. Release criteria for a credible UPT v1.0 discovery platform

UPT should not call the discovery platform v1.0-ready until all of the following are true:

1. every scientific object has explicit epistemic status and provenance;
2. existing bridge/canonical laws map into the richer knowledge model;
3. `BridgeGap` frontier discovery works on controlled benchmark cases;
4. grammar enumeration produces physically typed candidates by construction;
5. deterministic discovery runs are reproducible;
6. residual discovery passes hidden-correction benchmarks;
7. null-science cases have measured and acceptably low false-discovery rates;
8. uncertainty is propagated through empirical ranking;
9. known-limit checks are first-class gates;
10. falsification produces persisted failure witnesses;
11. equivalent/rejected candidates are deduplicated/pruned;
12. competing survivors can drive a discriminating experiment proposal;
13. all public candidate reports expose assumptions, evidence, failures, and unresolved tests;
14. package/build/type/test/security/docs-fresh gates remain green;
15. long-running scientific validation has a reproducible scheduled/manual CI path.

---

# 31. Recommended immediate implementation order

The first five engineering milestones should be implemented in this exact order:

1. **Scientific/epistemic contract and rich `ScientificLaw` model.**
2. **Knowledge Frontier and `BridgeGap` representation.**
3. **Physics-typed candidate grammar.**
4. **Residual/correction-term discovery.**
5. **Known-limit and falsification engine.**

Only after these foundations should UPT invest heavily in ML or external symbolic-regression engines.

The durable advantage of UPT should not be that it contains another optimizer. Its advantage should be that it knows, explicitly and audibly, **what physical constraints a candidate must satisfy, what evidence supports it, where it applies, what would falsify it, and what experiment would tell us more**.

---

# 32. End-state definition

The desired end state is a system capable of representing three things simultaneously:

\[
\boxed{
\text{what we know},\qquad
\text{what we do not know},\qquad
\text{what evidence would change our minds}
}
\]

A mature UPT workflow should therefore transform:

```text
known laws + observations
```

into:

```text
structured frontier gaps
```

then into:

```text
physically admissible candidate bridges
```

then into:

```text
survivors after falsification
```

and finally into:

```text
specific measurements capable of increasing scientific information.
```

That is the intended scientific identity of UPT v1.0: **a computational cartographer of the frontier between known and unknown physics, coupled to a falsification and experiment-design engine.**
