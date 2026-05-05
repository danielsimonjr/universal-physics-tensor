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

// Machine-readable bridge equation index — the 40 catalogued spec equations.
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

// Dimensional analyzer (Tier 4) — SI dimension propagation through bridge
// equations expressed as ExprNode trees. See src/dimensional/README.md.
export type { Dimension } from './dimensional/types.js';
export {
  DIMENSIONLESS,
  LENGTH,
  AREA,
  VOLUME,
  TIME,
  FREQUENCY,
  MASS,
  VELOCITY,
  ACCELERATION,
  FORCE,
  MOMENTUM,
  ANGULAR_MOMENTUM,
  ENERGY,
  POWER,
  ACTION,
  PRESSURE,
  DENSITY,
  TEMPERATURE,
  ENTROPY,
  CHARGE,
  VOLTAGE,
  ELECTRIC_FIELD,
  MAGNETIC_FIELD,
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
export { validate, validateEquation } from './dimensional/validator.js';
export { inferDimensionForBridge } from './dimensional/bridge-check.js';
