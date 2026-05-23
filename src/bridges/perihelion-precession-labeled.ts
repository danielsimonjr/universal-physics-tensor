/**
 * BE-52 (Mercury perihelion precession) — `LabeledTensor` demo
 * entry point for v0.7 Proposal 1.
 *
 * This is the single-bridge demonstration of the Intelligent Index
 * pattern (Phase 4 of P1). It does NOT modify the existing
 * `evaluatePerihelionPrecession` evaluator — that path stays
 * untouched per Cross-Phase Invariant 4. Instead, this module
 * adds an *alternative* entry point that returns a
 * `LabeledTensor` carrying `Axes`-registered identity on each
 * tensor axis.
 *
 * The point of the demo: show that a bridge evaluator can be
 * re-surfaced through the wrapper without rewriting its physics
 * core. Downstream consumers can then `contract()` results from
 * two bridges that share an `Axes.scale.*` identity, and the
 * contraction matches by physics-axis identity rather than by
 * coincidental string labels.
 *
 * @module bridges/perihelion-precession-labeled
 */

import { LabeledTensor } from '../core/labeled-tensor.js';
import { Axes } from '../core/axes-registry.js';
import type { TensorEngine } from '../numerical/tensor-engine.js';
import {
  evaluatePerihelionPrecession,
  type PerihelionPrecessionInputs,
  type PerihelionPrecessionResult,
} from './perihelion-precession.js';

/**
 * Alternative BE-52 entry point that returns the three perihelion-
 * advance quantities as a rank-1 `LabeledTensor` of length 3,
 * tagged with `Axes.scale.classical` (orbital mechanics lives at
 * the classical scale).
 *
 * The returned tensor's single axis carries the `Axes.scale.classical`
 * identity. Downstream consumers can contract this result with
 * another `LabeledTensor` whose axis also carries
 * `Axes.scale.classical` — the contraction will match by id, not
 * by axis-name string equality.
 *
 * Axis-0 entries (in fixed order): [`dphi_rad_per_orbit`,
 * `dphi_arcsec_per_orbit`, `dphi_arcsec_per_century`].
 *
 * @public
 */
export function evaluatePerihelionPrecessionLabeled(
  inputs: PerihelionPrecessionInputs,
  engine: TensorEngine,
): {
  readonly raw: PerihelionPrecessionResult;
  readonly labeled: LabeledTensor;
} {
  const raw = evaluatePerihelionPrecession(inputs);
  const tensor = engine.fromNested(
    [raw.dphi_rad_per_orbit, raw.dphi_arcsec_per_orbit, raw.dphi_arcsec_per_century],
    [3],
  );
  const labeled = new LabeledTensor(tensor, engine, {
    // Single axis carries the classical-scale identity from the
    // module-singleton Axes registry. Same reference across all
    // import sites; two demo bridges using Axes.scale.classical
    // will contract together.
    scale: Axes.scale.classical,
  });
  return { raw, labeled };
}
