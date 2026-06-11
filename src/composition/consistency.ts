/**
 * Composition graph — shared-source consistency relations (v0.8.0
 * CT-2, per docs/planning/v0.8.0-Design.md §2).
 *
 * `consistencyRatio` is a PARALLEL graph operation, honestly distinct
 * from sequential composition: two edges that share source quantities
 * are evaluated on the same inputs and their quotient taken. When the
 * shared quantities cancel algebraically (as G, M, c do between BE-51
 * lensing and BE-52 perihelion precession), the ratio is a
 * parameter-free consistency relation — varying the shared inputs must
 * leave it invariant.
 *
 * @module composition/consistency
 */

import type { BridgeEdge } from './edge.js';
import { evaluateEdge } from './edge.js';

/**
 * Domain-checked quotient `a(inputs) / b(inputs)` of two edges sharing
 * source quantities. Throws {@link DomainViolationError} if either
 * edge's validity domain rejects the inputs.
 *
 * @public
 */
export function consistencyRatio(
  a: BridgeEdge,
  b: BridgeEdge,
  inputs: Record<string, number>,
): number {
  return evaluateEdge(a, inputs) / evaluateEdge(b, inputs);
}
