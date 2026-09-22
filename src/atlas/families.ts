/**
 * Every registered atlas family, in the order they were built.
 *
 * Gates that must cover the WHOLE atlas (the evidence rule, admission, the
 * JSON artifacts) iterate this list rather than naming one family, so a new
 * family is checked the moment it is registered here. A gate that named
 * `OSCILLATOR_FAMILY` directly would pass forever over a family it never read.
 *
 * @module atlas/families
 */

import { DIFFUSION_FAMILY } from './diffusion/index.js';
import { OSCILLATOR_FAMILY } from './oscillators/index.js';
import { WAVES_FAMILY } from './waves/index.js';
import type { AtlasFamily } from './oscillators/index.js';

/** All atlas families. @internal */
export const ATLAS_FAMILIES: readonly AtlasFamily[] = [
  OSCILLATOR_FAMILY,
  DIFFUSION_FAMILY,
  WAVES_FAMILY,
];
