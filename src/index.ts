/**
 * Universal Physics Tensor Framework
 *
 * Computational framework for exploring unified physics through tensor formalism
 *
 * @packageDocumentation
 */

export { UniversalTensor } from './core/tensor.js';
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
} from './numerical/index.js';
