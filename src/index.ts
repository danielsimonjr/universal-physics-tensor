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
