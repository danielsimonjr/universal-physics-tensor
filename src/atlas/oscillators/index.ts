/**
 * Oscillator-family assembly (Atlas Phase 0, S0.6).
 *
 * Collects the W1/W2 records — the nine models, the five bridges and the one
 * rejection — into the single value the JSON projection serializes. Assembly
 * only: this module defines no physics and no numbers of its own, so a change
 * to a bridge is a change in ONE place.
 *
 * The design note calls this file `family.ts` (§1 layout); the S0.6 brief
 * places it at `oscillators/index.ts`. The brief is followed, because the
 * package's `exports` map and every other barrel in this tree use `index.ts`.
 *
 * @module atlas/oscillators
 */

import type { AtlasBridge, AtlasModel, AtlasRejection } from '../types.js';
import { ATLAS_MODELS } from './models.js';
import { BRIDGE_SPRING_LC, BRIDGE_DAMPED_RLC } from './bridges-exact.js';
import { LIMIT_BRIDGES } from './bridges-limits.js';
import { BRIDGE_CHAIN_WAVE } from './bridges-coarse.js';
import { ATLAS_REJECTIONS } from './rejections.js';

/**
 * One atlas family: its models, the bridges between them, and the claimed
 * bridges that were refuted. A rejection is evidence, not an omission, so it
 * travels with the family rather than being dropped.
 *
 * @internal
 */
export interface AtlasFamily {
  /** `'oscillators'`. */
  readonly family: string;
  readonly models: readonly AtlasModel[];
  readonly bridges: readonly AtlasBridge[];
  readonly rejections: readonly AtlasRejection[];
}

/**
 * The oscillator pilot family, in design-note order: the two exact
 * equivalences, the two approximations, then the coarse-graining.
 *
 * @internal
 */
export const OSCILLATOR_FAMILY: AtlasFamily = {
  family: 'oscillators',
  models: ATLAS_MODELS,
  bridges: [
    BRIDGE_SPRING_LC,
    BRIDGE_DAMPED_RLC,
    ...LIMIT_BRIDGES,
    BRIDGE_CHAIN_WAVE,
  ],
  rejections: ATLAS_REJECTIONS,
};
