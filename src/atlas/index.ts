/**
 * Atlas Phase 0 barrel — the oscillator pilot.
 *
 * Reachable only through the `universal-physics-tensor/atlas` subpath. Not
 * re-exported from the root `universal-physics-tensor` entry before Phase 6.
 *
 * All symbols are `@internal`: these are throwaway pilot types (design note
 * §4), not a stability contract.
 *
 * ⚠ **THE INVARIANT IS: NEVER THE BARREL.** `src/bridges/` and
 * `src/composition/` must not import THIS FILE — `src/atlas/` imports
 * `bridges/*` and `composition/*`, so a barrel import closes a cycle that
 * `bun run docs:deps` reports. Importing a leaf module (`./types.js`,
 * `./regime.js`, `./composition-table.js`, …) is fine and the tree has always
 * done it, VALUES INCLUDED: `bridges/index.ts:40`, `composition/compose.ts`,
 * `composition/graph-viz.ts`.
 *
 * This comment used to say "TYPES ONLY, and only from `src/atlas/types.js`",
 * which the tree HAS NEVER SATISFIED while `docs:deps` reported 0 cycles.
 * A rule stricter than the invariant it protects gets silently violated by
 * correct code, and the next reader either believes a false description of
 * the tree or "fixes" code that was right. Corrected 2026-09-22 against the
 * same measurement that corrected `CLAUDE.md`.
 *
 * @module atlas
 */

export type {
  RelationType,
  EvidenceTag,
  LimitCharacter,
  RegimeInequality,
  Regime,
  ApproximationBound,
  Witness,
  Counterexample,
  AtlasBridge,
  AtlasRejection,
  FormalFidelity,
  FormalRef,
} from './types.js';
export { MissingHorizonError, MissingLipschitzError } from './types.js';

export type { AtlasModel, ModelId } from './model.js';

export { composeBounds, composeBoundPath, IDENTITY_BOUND } from './error-algebra.js';
export type { BoundPair, ComposedPath } from './error-algebra.js';

export { deriveRegimeGroups, regimeHolds } from './regime.js';
export type { RegimeCheck } from './regime.js';

export {
  CAPACITANCE,
  CUBIC_STIFFNESS,
  DAMPING,
  INDUCTANCE,
  RESISTANCE,
  SPRING_CONSTANT,
} from './oscillators/dimensions.js';

export { ATLAS_MODELS, getAtlasModel } from './oscillators/models.js';

export { OSCILLATOR_FAMILY } from './oscillators/index.js';
export type { AtlasFamily } from './oscillators/index.js';

export { toAtlasJson, ATLAS_RECORD_SCHEMA_VERSION } from './serialize.js';
export type { AtlasRecordJson, JsonValue } from './serialize.js';

export {
  blockingFindings,
  checkApplicability,
} from './applicability.js';
export type {
  ApplicabilityFinding,
  ApplicabilityFindingKind,
  ApplicabilityInput,
  ApplicabilitySeverity,
} from './applicability.js';

export { passingWitnessIds } from './witness-result.js';
export type {
  UnresolvedReason,
  WitnessRunResult,
  WitnessStatus,
} from './witness-result.js';

export { ATLAS_FAMILIES } from './families.js';
export { DIFFUSION_FAMILY } from './diffusion/index.js';
export {
  BRIDGE_HEAT_DIFFUSION,
  BRIDGE_SCHRODINGER_DIFFUSION,
  BRIDGE_WALK_DIFFUSION,
  DIFFUSION_BRIDGES,
} from './diffusion/bridges.js';
export { DIFFUSION_MODELS, getDiffusionModel } from './diffusion/models.js';
export { WAVES_FAMILY } from './waves/index.js';
export {
  BRIDGE_KLEIN_GORDON_WAVE,
  BRIDGE_SOUND_SPEED,
  BRIDGE_STRING_WAVE,
  BRIDGE_WAVE_DALEMBERT,
  WAVE_BRIDGES,
} from './waves/bridges.js';
export { WAVE_MODELS } from './waves/models.js';
export { DIFFUSION_CLOSURE_BRIDGES } from './diffusion/bridges-closure.js';
export { WAVE_CLOSURE_BRIDGES } from './waves/bridges-closure.js';

export { runWitnessRegistry, artifactPassingWitnessIds } from './witness-artifact.js';
export type { WitnessResultRecord, WitnessResultsArtifact } from './witness-artifact.js';

export { WITNESS_REGISTRY } from './witness-specs.js';
export type {
  RegisteredNumericWitness,
  RegisteredSymbolicWitness,
  RegisteredWitness,
} from './witness-specs.js';

export { runSymbolicWitness } from './witness-symbolic.js';
export type { SymbolicSimplifier, SymbolicWitnessSpec } from './witness-symbolic.js';

export { runNumericWitness } from './witness-numeric.js';
export type {
  Convergence,
  NumericWitnessRunResult,
  NumericWitnessSpec,
} from './witness-numeric.js';

export { contextUnion, statementContextUnion } from './statement.js';
export type {
  Context,
  ContextUnionFormed,
  ContextUnionRefused,
  ContextUnionResult,
  NoUnionReason,
  Statement,
  StatementId,
} from './statement.js';

export {
  composeDerivations,
  composeDerivationsOrThrow,
  DerivationCompositionError,
  makeDerivation,
} from './derivation.js';
export type {
  CompositeFormed,
  CompositeRefused,
  Derivation,
  DerivationCompositionResult,
  DerivationId,
  DerivationSpec,
  NoCompositeReason,
} from './derivation.js';
