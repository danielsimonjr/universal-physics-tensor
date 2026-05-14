/**
 * GridField — a sampled field on a regular grid, for the 'grid' numericalForm
 * finite-difference path. See v0.3.5-Design.md §5.
 *
 * @module numerical/grid-field
 */
import type { NestedArray } from './types.js';

/**
 * A sampled field on a regular grid — part of the public `NumericalInputs`
 * contract (`NumericalInputs.grids`), consumed by the 'grid' numericalForm
 * finite-difference path.
 * @public
 */
export interface GridField {
  /** Per-axis sample count, e.g. [64, 64, 64]. */
  readonly shape: ReadonlyArray<number>;
  /** Per-axis physical spacing Δx for the finite-difference stencil. */
  readonly spacing: ReadonlyArray<number>;
  /** Sampled field values as a nested array of `shape`. */
  readonly data: NestedArray;
  /** Stencil boundary policy. v0.3.5 ships 'clamp' and 'periodic'. */
  readonly boundary: 'clamp' | 'periodic';
}
