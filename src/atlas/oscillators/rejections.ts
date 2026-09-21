/**
 * The Phase 0 REJECTION record: a claimed bridge the atlas records as refuted,
 * together with the witness that refutes it.
 *
 * `ax-cubic-spring-lc` claims the cubic (Duffing-type) spring
 * `m x″ + k x + β x³ = 0` is exactly equivalent to the LC circuit
 * `L q″ + q/C = 0`. It is not. The cubic spring's variable set
 * {m, k, β, x0} carries exactly ONE dimensionless group, `β x0² / k`, which
 * measures the nonlinearity and has no counterpart on the LC side: the LC
 * variable set is dimensionally independent and admits no group at all. A
 * surviving group with no image cannot be matched by any change of variables,
 * so no exact equivalence exists.
 *
 * @module atlas/oscillators/rejections
 */

import type { AtlasRejection } from '../types.js';

/** The rejected bridges of the oscillator pilot. @internal */
export const ATLAS_REJECTIONS: readonly AtlasRejection[] = [
  {
    id: 'ax-cubic-spring-lc',
    claimed: 'exact-equivalence',
    premises: ['model-cubic-spring', 'model-lc'],
    conclusion: 'model-lc',
    reason:
      'The cubic spring retains one dimensionless group, β x0² / k, that measures ' +
      'its nonlinearity. The LC variable set is dimensionally independent and has ' +
      'no group to match it, so no change of variables can make the two models ' +
      'exactly equivalent. A nonlinear oscillator cannot be an exact image of a ' +
      'linear one.',
    survivingGroup: 'β x0² / k',
    witnesses: [
      {
        id: 'W3',
        kind: 'symbolic',
        test: 'tests/atlas/oscillators-coarse.test.ts',
        tolerance: 'exact integer π-group exponents; LC verdict dimensionally-independent',
      },
    ],
  },
];

/** Look up a rejection by id, throwing on an unknown one. @internal */
export function getAtlasRejection(id: string): AtlasRejection {
  const found = ATLAS_REJECTIONS.find((r) => r.id === id);
  if (found === undefined) throw new Error(`unknown atlas rejection id: ${id}`);
  return found;
}
