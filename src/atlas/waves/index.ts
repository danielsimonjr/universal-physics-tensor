/**
 * Wave-family assembly (Atlas Phase 4, S4.5).
 *
 * Assembly only: this module defines no physics and no numbers of its own.
 *
 * @module atlas/waves
 */

import type { AtlasFamily } from '../oscillators/index.js';
import { WAVE_BRIDGES } from './bridges.js';
import { WAVE_MODELS, WAVES_FAMILY_NAME } from './models.js';

/**
 * The wave family: six models, four bridges, no rejections. Two bridges end at
 * `model-wave-1d`, which the oscillator family owns.
 *
 * @internal
 */
export const WAVES_FAMILY: AtlasFamily = {
  family: WAVES_FAMILY_NAME,
  models: WAVE_MODELS,
  bridges: WAVE_BRIDGES,
  rejections: [],
};
