/**
 * Shared types for the numerical backend. Kept in a tiny module so the
 * TensorEngine interface and the lowering pass share one definition.
 *
 * @module numerical/types
 */

/** A scalar, or arbitrarily nested arrays of scalars. The plain-JS shape
 *  that crosses the public boundary of the numerical module. */
export type NestedArray = number | NestedArray[];
