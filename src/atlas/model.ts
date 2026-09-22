/**
 * The `Model` record — Phase 3's promotion of the Phase 0 `AtlasModel`.
 *
 * ROADMAP Phase 3 makes the MODEL the unit rather than the equation: state
 * space, dynamics, observables, parameters, boundary/initial data, symmetry
 * group where known, regime. This module is the record's new home; the nine
 * Phase 0 fields are carried over unchanged and three are added.
 *
 * **`boundaryData`, `initialData` and `symmetryGroup` are all OPTIONAL**
 * (`docs/planning/Atlas-Phase-3-Design.md` §4, which supersedes the
 * implementation plan's wording on the first two). No boundary or initial
 * data is recorded for the nine oscillator models, so a required field would
 * force either fabricated values or empty ones asserting "there are none".
 * `oscillators/models.ts` refuses exactly that fabrication for `inequalities`.
 * **An absent field says "not recorded"; a present empty one says "there are
 * none", and only one of those is true here** — so the nine literals stay
 * byte-identical and record nothing they do not have a source for.
 *
 * `src/atlas/serialize.ts` enumerates model fields explicitly, so a model
 * carrying none of the three serializes byte-identically to Phase 0's
 * committed `data/atlas/oscillators.json`.
 *
 * @module atlas/model
 */

import type { DimensionalVariable } from '../dimensional/buckingham.js';
import type { Regime } from './types.js';

/**
 * One model in the atlas.
 *
 * The first nine fields are Phase 0's `AtlasModel` verbatim. The last three
 * are the Phase 3 additions and are omitted, never emptied, when unrecorded.
 *
 * @internal
 */
export interface AtlasModel {
  /** `'model-spring'`, `'model-lc'`, … */
  readonly id: string;
  readonly family: string;
  readonly stateSpace: string;
  /** Display form of the ODE. */
  readonly dynamics: string;
  readonly observables: readonly string[];
  /** Dimensioned parameters. */
  readonly parameters: readonly DimensionalVariable[];
  /** `'theta0'`, `'qa'` — declared with the zero dimension. */
  readonly dimensionlessInputs: readonly string[];
  /** `'CE-simple-harmonic-frequency'`, … — must resolve in `CANONICAL_EQUATIONS`. */
  readonly canonicalRefs: readonly string[];
  readonly regime: Regime;

  // ── Phase 3 additions (OPTIONAL; a model without them is unchanged) ─────
  /**
   * Boundary conditions the model is posed with, each as its stated display
   * form (`'u(0, t) = u(L, t) = 0'`). **Omit when none is recorded** — an
   * empty array would claim the model has no boundary conditions.
   */
  readonly boundaryData?: readonly string[];
  /**
   * Initial conditions the model is posed with (`'x(0) = x₀'`). Omit when
   * none is recorded; see `boundaryData`.
   */
  readonly initialData?: readonly string[];
  /**
   * The symmetry group where it is known, as stated (`'SO(2)'`,
   * `'time translation'`). Omit when unknown — Phase 3 records only
   * symmetries a source states.
   */
  readonly symmetryGroup?: string;
}

/** A `Model`'s id, as `CanonicalEquation.model` references it. @internal */
export type ModelId = string;
