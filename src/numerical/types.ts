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

/**
 * A sampled field on a regular grid — part of the public `NumericalInputs`
 * contract (`NumericalInputs.grids`), consumed by the 'grid' numericalForm
 * finite-difference path. Defined here in the leaf types module (it only needs
 * `NestedArray`); re-exported from `./grid-field.js` for backward compatibility,
 * which keeps this module a dependency leaf (no `types ↔ grid-field` cycle).
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
