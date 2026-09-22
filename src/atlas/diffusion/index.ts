/**
 * Diffusion-family assembly (Atlas Phase 4, S4.4).
 *
 * Assembly only: this module defines no physics and no numbers of its own.
 *
 * @module atlas/diffusion
 */

import type { AtlasFamily } from '../oscillators/index.js';
import { DIFFUSION_BRIDGES } from './bridges.js';
import { DIFFUSION_FAMILY_NAME, DIFFUSION_MODELS } from './models.js';

/**
 * The diffusion family: four models, three bridges, no rejections.
 *
 * @internal
 */
export const DIFFUSION_FAMILY: AtlasFamily = {
  family: DIFFUSION_FAMILY_NAME,
  models: DIFFUSION_MODELS,
  bridges: DIFFUSION_BRIDGES,
  rejections: [],
};
