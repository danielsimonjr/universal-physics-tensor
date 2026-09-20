/**
 * Dimension constants the oscillator pilot needs that the canonical entry
 * files declare MODULE-LOCAL and do not export.
 *
 * They are redefined here with the same `dim(...)` arguments, quoted from
 * source in design note §10 Q2. `tests/atlas/models.test.ts` asserts the
 * values, so a future divergence in an entry file fails a test.
 *
 * `FREQUENCY`, `MASS`, `LENGTH`, `VELOCITY` and `ACCELERATION` are importable
 * from `src/dimensional/types.ts` and are NOT redefined here.
 *
 * @module atlas/oscillators/dimensions
 */

import { dim } from '../../dimensional/ast-builders.js';
import type { Dimension } from '../../dimensional/types.js';

/** farad, `L^-2 M^-1 T^4 I^2` — `src/canonical/entries/electromagnetism.ts:42`. @internal */
export const CAPACITANCE: Dimension = dim(-2, -1, 4, 2);

/** henry, `L^2 M T^-2 I^-2` — `src/canonical/entries/electromagnetism.ts:43`. @internal */
export const INDUCTANCE: Dimension = dim(2, 1, -2, -2);

/** ohm, `L^2 M T^-3 I^-2` — `src/canonical/entries/electromagnetism.ts:40`. @internal */
export const RESISTANCE: Dimension = dim(2, 1, -3, -2);

/**
 * `M T^-2` — defined TWICE, identically, at
 * `src/canonical/entries/mechanics.ts:35` and
 * `src/canonical/entries/fluids-waves.ts:48`. One definition here; the test
 * asserts agreement with both.
 *
 * @internal
 */
export const SPRING_CONSTANT: Dimension = dim(0, 1, -2);

/** `M T^-1` — the `b` of `m x'' + b x' + k x = 0`. @internal */
export const DAMPING: Dimension = dim(0, 1, -1);

/** `M L^-2 T^-2` — the `β` of `m x'' + k x + β x³ = 0`. @internal */
export const CUBIC_STIFFNESS: Dimension = dim(-2, 1, -2);
