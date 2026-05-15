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
} from './bridges/index.js';

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

// v0.3.5 numerical-contraction backend. See docs/planning/v0.3.5-Design.md.
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
} from './numerical/index.js';
