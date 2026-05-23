/**
 * Universal Physics Tensor Framework
 *
 * Computational framework for exploring unified physics through tensor formalism
 *
 * @packageDocumentation
 */

export { UniversalTensor } from './core/tensor.js';
// v0.5.1 — canonical flat CODATA 2018 / SI-defined constants (PC-1).
// Single source of truth across numerical, dimensional, and bridge layers.
// See src/core/constants.ts and docs/planning/v0.5.1-Implementation-Plan.md.
export {
  C_SI,
  G_SI,
  H_SI,
  HBAR_SI,
  K_B_SI,
  E_SI,
  ALPHA,
  M_P_SI,
  L_P_SI,
  T_P_SI,
  H0_SI,
} from './core/constants.js';
export type {
  TensorConfig,
  TensorIndices,
  PhysicalLaw,
  BridgeEquation,
  EmergentPhenomenon,
  PhysicalScale,
  Force,
  Symmetry,
  InformationMeasure,
} from './core/types.js';
export { PhysicalConstants } from './core/types.js';

// v0.7 Proposal 3 — Typed `Cell` discriminated union (storage-layer
// surface). `PhysicalLaw` / `BridgeEquation` / `EmergentPhenomenon`
// above remain the legacy surface (consumers haven't migrated yet);
// the new `Cell` union is the preferred forward-looking shape.
export type {
  Cell,
  CellBase,
  CellConfidence,
  LawCell,
  BridgeCell,
  EmergenceCell,
} from './core/cell.js';
export { compose } from './core/cell.js';

// v0.7 Proposal 2 — Sparse semantic catalog (flux rules + adapter).
// Per Decision #9, only the consumer-facing types are re-exported;
// FluxRule / FluxRuleKind / FluxRuleResult stay @internal.
export type {
  FluxDiagnostic,
  FluxReport,
} from './core/flux-rules.js';
export { FluxViolationError } from './core/flux-rules.js';
export type {
  CatalogEntryStatus,
  CatalogIngestionReport,
} from './bridges/catalog-adapter.js';
export {
  catalogToCells,
  scanCatalog,
  ingestCatalog,
  ingestionReportToFluxReport,
  CatalogIngestionError,
} from './bridges/catalog-adapter.js';

// v0.7 Proposal 1 — Intelligent Index layer (UniversalIndex + Axes
// + LabeledTensor wrapper). Per Decision #10, 10 public symbols.
// MergedLabels<L,R> and canonicalLabelOrder stay @internal.
export type {
  AxisName,
  UniversalIndex,
  UniversalIndexId,
  MakeIndexOptions,
} from './core/universal-index.js';
export { makeIndex } from './core/universal-index.js';
export type { AxesRegistry } from './core/axes-registry.js';
export { Axes } from './core/axes-registry.js';
export {
  LabeledTensor,
  LabeledTensorConstructionError,
  AxisMismatchError,
  IdentityConflictError,
  RankPreservationError,
} from './core/labeled-tensor.js';

// v0.8 Proposal 5 — RegimeType extension system. Per P5 Decision #1,
// ship the mechanism + the 18 v0.6-shipped values pre-registered;
// closed taxonomy of new physics-regime built-ins deferred to v0.9.
export type {
  RegimeProvenance,
  RegimeValueBase,
  RegimeSpec,
} from './core/regime-registry.js';
export {
  defineRegime,
  defineScale,
  defineForce,
  defineSymmetry,
  defineInformation,
  defineDimension,
  defineTopology,
  lookupRegime,
  listRegimesByAxis,
  provenanceFor,
  attachRegimesToCell,
  getCellRegimes,
  RegimeCollisionError,
} from './core/regime-registry.js';
// Phase 4 wiring side-effect: installs the regime-consistency rule.
import './core/regime-rule-install.js';
// Phase 2 side-effect: pre-registers the 18 built-in regimes.
import './core/regimes-builtins.js';

// Machine-readable bridge equation index — the 40+ catalogued equations.
// `BridgeEquationEntry` is intentionally a different shape from the runtime
// `BridgeEquation` interface above; the entry captures spec-level metadata
// (status, known issues, references, dependencies), while `BridgeEquation`
// describes a runtime bridge between two tensor regimes.
export { BRIDGE_EQUATIONS } from './bridges/index.js';
export type {
  BridgeEquationEntry,
  BridgeEquationStatus,
  BridgeIssueSeverity,
  BridgeIssueFixable,
  KnownIssue,
} from './bridges/index.js';

// v0.4.0 bridge implementations (evaluator functions beyond the spec catalog)
export {
  evaluateGravitationalLensing,
  type GravitationalLensingInputs,
  type GravitationalLensingResult,
  evaluatePerihelionPrecession,
  type PerihelionPrecessionInputs,
  type PerihelionPrecessionResult,
} from './bridges/index.js';

// v0.4.0 connection layer — Christoffel formula builder and covariant derivative
// AST node type. `christoffel` is public because bridge modules and downstream
// callers compose Γ trees directly; `CovariantDerivativeNode` is the structural
// type for the new ∇_μ AST kind.
export { christoffel } from './dimensional/connection.js';
// CovariantDerivativeNode is re-exported from validator.ts (which holds the union);
// importing from there avoids creating a separate source-of-truth.
export type { CovariantDerivativeNode } from './dimensional/validator.js';

// v0.5.0 curvature layer — Ricci tensor helper (Task 7). `ricci(R)` wraps a
// RiemannTensorNode and produces the contracted R_μν = R^λ_{λμν} as a
// composite ExprNode (own validator + lowering arms).
export { ricci } from './dimensional/curvature.js';
export type { RicciTensorNode } from './dimensional/validator.js';

// v0.5.0 curvature layer — Einstein tensor helper (Task 8). `einstein(R, g,
// gInverse)` wraps a RiemannTensorNode + metric pair and produces the
// composite G_μν = R_μν − ½ R g_μν as an ExprNode (own validator +
// lowering arms — no AST rewrite). Vacuum-Einstein scope; matter-coupled
// `G_μν = κ T_μν` is deferred to v0.6.0+.
export { einstein } from './dimensional/curvature.js';
export type { EinsteinTensorNode } from './dimensional/validator.js';

// v0.5.0 curvature layer — Bianchi residual helper (Task 9). `bianchiResidual(R)`
// returns {residual, evaluate, evaluateMax} for the cyclic second-Bianchi-identity
// check ∇_{[λ} R_{μν]ρσ} = 0. Closes Phase 1 — Foundations.
export { bianchiResidual } from './dimensional/curvature.js';
export type { BianchiResidualNode } from './dimensional/validator.js';

// v0.6.0 Phase 1 — Killing-vector machinery (Task 1.3).
// `verifyKillingEquation` checks the Killing equation ∇_μ ξ_ν + ∇_ν ξ_μ = 0
// numerically at a point using a hybrid impl (exact Christoffels + analytic
// metric derivatives). `evaluateConservedCharge` evaluates Q = ξ^μ p_μ along
// a geodesic. `ChristoffelAccess` is the layout-agnostic Christoffel accessor
// type that insulates consumers from the Phase 2 BR-2 flat-layout migration.
export {
  verifyKillingEquation,
  evaluateConservedCharge,
} from './numerical/killing.js';
export type {
  KillingEquationOptions,
  ChristoffelAccess,
} from './numerical/killing.js';

// v0.4.0 geodesic integrator (RK4 solver — headline feature of v0.4.0)
export {
  integrateGeodesic,
  type GeodesicIntegratorInputs,
  type GeodesicIntegratorResult,
} from './numerical/geodesic-integrator.js';

// Dimensional analyzer (Tier 4) — SI dimension propagation through bridge
// equations expressed as ExprNode trees. See src/dimensional/README.md.
// Every symbol re-exported in this block is `@public` — the consumer-facing
// dimensional/metric surface (stabilised in v0.3.0).
export type { Dimension } from './dimensional/types.js';
export {
  DIMENSIONLESS,
  LENGTH,
  AREA,
  TIME,
  FREQUENCY,
  MASS,
  VELOCITY,
  ACCELERATION,
  FORCE,
  ENERGY,
  POWER,
  ACTION,
  TEMPERATURE,
  ENTROPY,
  CHARGE,
} from './dimensional/types.js';
export {
  multiply,
  divide,
  power,
  add,
  subtract,
  equals,
  format,
  DimensionMismatchError,
} from './dimensional/algebra.js';
export type { ExprNode, ValidationResult, Violation } from './dimensional/validator.js';
export { validate, validateEquation, validateInverseMetricPair } from './dimensional/validator.js';
export { inferDimensionForBridge } from './dimensional/bridge-check.js';

// v0.6.0 Phase 2 Task 2.4 — Einstein-equation numerical evaluator.
// `evaluateEinsteinEquationResidual` computes the scale-normalized max residual
// |G_μν + Λ g_μν − κ T_μν| / |g_μν| at a coordinate point. Accepts metric
// closures + stress-energy closure; returns a dimensionless relative residual.
// For Schwarzschild vacuum (T=0, Λ=0) the residual is the FD truncation floor
// (~1e-10 relative at 4th-order stencil accuracy).
export {
  evaluateEinsteinEquationResidual,
} from './numerical/einstein-equation.js';
export type {
  EinsteinEquationResidualInput,
  MetricClosure,
  Vec4,
} from './numerical/einstein-equation.js';

// v0.6.0 Phase 2 Task 2.3 — EinsteinFieldEquationNode predicate AST + validator.
// Represents G_μν + Λ g_μν = (8πG/c⁴) T_μν as a structurally-validated AST node.
// Validator checks: free-index agreement, per-component dim equality [L⁻²],
// and symmetry agreement (Decision #3 + #11).
export { validateEinsteinFieldEquation } from './dimensional/einstein-equation.js';
export type {
  EinsteinFieldEquationNode,
  EinsteinFieldEquationValidationResult,
} from './dimensional/einstein-equation.js';

// v0.6.0 Phase 3 Task 3.5 — KretschmannScalarNode AST + validator.
// K = R_{ρσμν} R^{ρσμν} is the canonical curvature invariant; scalar (rank-0),
// dim [L⁻⁴]. Diverges at genuine singularities; finite at coordinate ones.
export type {
  KretschmannScalarNode,
  KretschmannScalarValidationResult,
} from './dimensional/curvature-invariants.js';
export { validateKretschmannScalar } from './dimensional/curvature-invariants.js';

// v0.6.0 Phase 3 Task 3.6 — Kretschmann scalar numerical contraction.
// O(4⁸) = 65536 multiplications per call — diagnostic/sample-point use only.
export { computeKretschmann } from './numerical/kretschmann.js';

// Numerical-contraction backend (v0.3.5+). See docs/planning/v0.3.5-Design.md
// and docs/planning/v0.4.0-Implementation-Plan.md (v0.4.0 additions below).
// Every symbol below is `@public` — the consumer-facing (TensorJS) surface.
// `MathTSEngine` is intentionally NOT re-exported here: it lives behind the
// `@danielsimonjr/mathts-tensor` optionalDependency and is reachable only via
// the `universal-physics-tensor/numerical/mathts-engine` exports subpath.
export {
  evaluateNumerical,
  evaluateNumericalRaw,
  evaluateMetricInverse,
  Float64ReferenceEngine,
  getActiveEngine,
  setActiveEngine,
  NumericalBackendError,
  // v0.4.0 additions to the numerical surface
  DuplicateCoordinateWarning,
  EngineCapabilityError,
  hasAutogradSupport,
  evaluateBE37CovariantEikonalNumerical,
  // v0.5.0 GL4 symplectic integrator
  integrateGeodesicGL4,
  // v0.5.0 perihelion finder (Task 4)
  findPerihelion,
} from './numerical/index.js';
export type {
  NumericalResult,
  NumericalRawResult,
  EvaluateOptions,
  NumericalInputs,
  TensorEngine,
  EngineTensor,
  EinsumSpec,
  NestedArray,
  GridField,
  // v0.4.0 type additions
  ForwardGradResult,
  ReverseGradResult,
  // v0.5.0 GL4 type additions
  GL4State,
  GL4Snapshot,
  GL4Options,
  // v0.5.0 perihelion-finder type additions (Task 4)
  PerihelionResult,
  FindPerihelionOptions,
} from './numerical/index.js';
