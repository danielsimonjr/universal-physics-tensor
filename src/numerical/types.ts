/**
 * Shared types for the numerical backend. Kept in a tiny module so the
 * TensorEngine interface and the lowering pass share one definition.
 *
 * @module numerical/types
 */

/** A scalar, arbitrarily nested arrays of scalars, or a flat
 *  `Float64Array` (admitted v0.9.0 Task 1.1 for the O-1/O-6
 *  flat-metric migrations — `flattenNA` iterates leaves with
 *  `for...of`, which Float64Array satisfies at runtime). The plain-JS
 *  shape that crosses the public boundary of the numerical module.
 *  @public */
export type NestedArray = number | NestedArray[] | Float64Array;

import type { GridField } from './grid-field.js';

/** Concrete inputs for a numerical evaluation. See v0.3.5-Design.md §5.
 *  @public */
export interface NumericalInputs {
  /** Component values per tensor-symbol / metric-tensor / scalar-symbol, by name. */
  readonly tensors: ReadonlyMap<string, NestedArray>;
  /** Index dimensionality N for kronecker-delta (and any node whose size is
   *  not otherwise determined). Defaults to 4 (spacetime) when omitted. */
  readonly dimension?: number;
  /** For 'numerical-fn' tensor-symbols (Task 10). */
  readonly fields?: ReadonlyMap<string, (coords: ReadonlyArray<number>) => NestedArray>;
  /** For 'grid' tensor-symbols (Task 10). */
  readonly grids?: ReadonlyMap<string, GridField>;
  /** Explicit pre-computed derivatives for 'symbolic' tensor-symbols under a
   *  pderiv, keyed `${symbolName}/${coordLabel}` (Task 10). */
  readonly derivatives?: ReadonlyMap<string, NestedArray>;
  /** Coordinate values for partial-derivative evaluation (Task 10). */
  readonly coords?: ReadonlyMap<string, number>;
  /**
   * v0.4.0: for metric-tensor nodes with derivativeStrategy='supplied' under
   * a christoffel/covariant-derivative lowering. Keyed `${metricName}/${coordLabel}`
   * (e.g., 'g/μ'). Each value is the full metric Jacobian slice — shape [N,N]
   * for the partial derivative of an N×N metric w.r.t. one coordinate.
   */
  readonly metricDerivatives?: ReadonlyMap<string, NestedArray>;
}
