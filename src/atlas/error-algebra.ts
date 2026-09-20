/**
 * The Phase 0 error algebra: composition of Lipschitz-plus-offset bounds.
 *
 * With `∘` read as OUTER-AFTER-INNER, a bound `(K, δ)` states
 * `|f(x) − f̃(x)| ≤ K|x − x̃| + δ` in the bound's own norm. Composing an outer
 * map onto an inner one therefore gives
 *
 *     (K_o, δ_o) ∘ (K_i, δ_i) = (K_o·K_i, K_o·δ_i + δ_o)
 *
 * which is associative and NOT commutative. `IDENTITY_BOUND` is the two-sided
 * identity, so `(bounds, ∘, IDENTITY_BOUND)` is a monoid.
 *
 * An exact equivalence contributes `IDENTITY_BOUND` **in the norms these
 * Phase 0 bridges state** — not in every norm (design note §9 YELLOW (a)).
 *
 * @module atlas/error-algebra
 */

import { MissingLipschitzError } from './types.js';

/** The `K`/`delta` pair an `ApproximationBound` composes through. @internal */
export interface BoundPair {
  readonly K: number;
  readonly delta: number;
}

/** The two-sided identity of {@link composeBounds}: an exact, error-free map. @internal */
export const IDENTITY_BOUND: BoundPair = { K: 1, delta: 0 };

/**
 * Compose two bounds, `outer` after `inner`.
 *
 * @internal
 */
export function composeBounds(outer: BoundPair, inner: BoundPair): BoundPair {
  return { K: outer.K * inner.K, delta: outer.K * inner.delta + outer.delta };
}

/** Result of {@link composeBoundPath}. @internal */
export interface ComposedPath {
  readonly bound: BoundPair;
  /**
   * True when the path ended on a step with no Lipschitz constant: `bound`
   * covers the prefix, and nothing is claimed past the final step.
   */
  readonly terminal: boolean;
}

/**
 * Fold a path of bounds in TRAVERSAL order — `[b1, b2]` means b1 then b2, so
 * the composite is `b2 ∘ b1`.
 *
 * A `null` entry is a step whose Lipschitz constant is unknown. It is tolerated
 * only as the LAST entry, where it terminates the claim; anywhere else the
 * composite would be unbounded, and {@link MissingLipschitzError} is thrown
 * rather than a number invented for it.
 *
 * @internal
 */
export function composeBoundPath(bounds: readonly (BoundPair | null)[]): ComposedPath {
  let acc: BoundPair = IDENTITY_BOUND;
  for (let i = 0; i < bounds.length; i++) {
    const step = bounds[i];
    if (step === null) {
      if (i !== bounds.length - 1) {
        throw new MissingLipschitzError(
          `bound path has no Lipschitz constant at step ${i} of ${bounds.length}; ` +
            'an unknown constant is tolerated only as the final step',
        );
      }
      return { bound: acc, terminal: true };
    }
    acc = composeBounds(step, acc);
  }
  return { bound: acc, terminal: false };
}
