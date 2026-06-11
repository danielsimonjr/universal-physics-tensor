/**
 * First-order uncertainty propagation through composition edges
 * (v0.10.0 T4 — fulfills the improvement plan's G-3 carrier claim:
 * "edges carry uncertainties, and uncertainty propagates through
 * composition").
 *
 *   σ_out² = Σᵢ (∂f/∂xᵢ · σᵢ)²        (independent-input Gaussian,
 *                                       first order)
 *
 * Partials are central differences with a relative step
 * h = 1e-6·max(|xᵢ|, 1e-30). Because composed edges ARE `BridgeEdge`s
 * (design D-2 closure), chains need no extra machinery — propagate on
 * the composed edge directly.
 *
 * Scope honesty: independent inputs only (no covariance matrix), first
 * order only (no curvature term). Adequate for the scalar closed-form
 * edges in the graph today; revisit both if correlated observables or
 * strongly nonlinear edges land.
 *
 * @module composition/uncertainty
 */

import type { BridgeEdge } from './edge.js';
import { evaluateEdge } from './edge.js';

/** Result of a propagation. @public */
export interface UncertaintyResult {
  /** Central value f(x) (domain-checked). */
  readonly value: number;
  /** Propagated 1σ standard deviation. */
  readonly sigma: number;
  /** Per-input partial derivatives ∂f/∂xᵢ (central difference). */
  readonly partials: Readonly<Record<string, number>>;
}

/**
 * Propagate independent 1σ input uncertainties through an edge.
 *
 * `sigmas` keys are source-quantity names; inputs absent from `sigmas`
 * (or with σ = 0) contribute no variance but still get a partial.
 * The central value is domain-checked (`evaluateEdge`); the stencil
 * evaluations use the raw evaluator — a ±h step that exits the
 * validity domain near its boundary would otherwise poison the
 * derivative with a thrown error rather than a number.
 *
 * @public
 */
export function propagateUncertainty(
  edge: BridgeEdge,
  inputs: Record<string, number>,
  sigmas: Record<string, number>,
): UncertaintyResult {
  const value = evaluateEdge(edge, inputs);

  const partials: Record<string, number> = {};
  let variance = 0;

  for (const source of edge.sources) {
    const name = source.name;
    const x = inputs[name];
    if (!Number.isFinite(x)) {
      throw new RangeError(
        `propagateUncertainty: input '${name}' is not a finite number`,
      );
    }
    const h = 1e-6 * Math.max(Math.abs(x), 1e-30);
    const plus = edge.evaluate({ ...inputs, [name]: x + h });
    const minus = edge.evaluate({ ...inputs, [name]: x - h });
    const partial = (plus - minus) / (2 * h);
    partials[name] = partial;

    const sigma = sigmas[name] ?? 0;
    if (sigma < 0 || !Number.isFinite(sigma)) {
      throw new RangeError(
        `propagateUncertainty: sigma for '${name}' must be finite and ≥ 0`,
      );
    }
    if (sigma > 0) variance += partial * partial * sigma * sigma;
  }

  return { value, sigma: Math.sqrt(variance), partials };
}
