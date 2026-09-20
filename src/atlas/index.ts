/**
 * Atlas Phase 0 barrel — the oscillator pilot.
 *
 * Reachable only through the `universal-physics-tensor/atlas` subpath. Not
 * re-exported from the root `universal-physics-tensor` entry before Phase 6.
 *
 * All symbols are `@internal`: these are throwaway pilot types (design note
 * §4), not a stability contract.
 *
 * ⚠ `src/bridges/index.ts` and `src/composition/edge.ts` may import atlas
 * TYPES ONLY, and only from `src/atlas/types.js` — never from this barrel.
 * `src/atlas/` imports `bridges/*` and `composition/*`, so a barrel import
 * closes a cycle that `bun run docs:deps` reports.
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
  AtlasModel,
  Counterexample,
  AtlasBridge,
  AtlasRejection,
} from './types.js';
export { MissingHorizonError, MissingLipschitzError } from './types.js';

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
