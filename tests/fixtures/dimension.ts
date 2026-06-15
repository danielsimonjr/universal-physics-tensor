/**
 * Shared test dimension-factory. The `D(L, M, T, Theta)` shorthand for the
 * 7-base `Dimension` record (I, N, J default to 0) recurs across the
 * dimensional / formula test suites; this is the single copy.
 */
import type { Dimension } from '../../src/dimensional/types.js';

/** A `Dimension` from its (L, M, T, Θ) exponents — I, N, J are 0. */
export const D = (L = 0, M = 0, T = 0, Theta = 0): Dimension => ({
  L,
  M,
  T,
  I: 0,
  Theta,
  N: 0,
  J: 0,
});
