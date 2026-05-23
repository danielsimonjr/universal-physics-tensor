/**
 * Typed `Cell` discriminated union for `UniversalTensor`'s cell storage.
 *
 * Three variants — `LawCell`, `BridgeCell`, `EmergenceCell` — each
 * carrying a `kind` discriminator that lets TypeScript narrow to the
 * specific variant at every consumption site. Mirrors the v0.6.1
 * validator-registry's discriminated-union pattern at
 * `src/dimensional/validator-registry.ts`.
 *
 * Design doc: `docs/planning/v0.7-Proposal-3-Design.md`.
 * Review findings: `docs/planning/v0.7-Proposal-3-Review-Findings.md`.
 *
 * Migration relationship to `src/core/types.ts`:
 *   - `PhysicalLaw` ↔ `LawCell` (field-shape faithful; `confidence`
 *     flips `number` → string-literal union)
 *   - `BridgeEquation` ↔ `BridgeCell` (same migration)
 *   - `EmergentPhenomenon` ↔ `EmergenceCell` (same migration)
 *
 * The old interfaces are NOT deleted and NOT `@deprecated`-tagged in
 * this sprint (per Eve-R2 + the Phase 0 consumer-import census:
 * 4 in-repo sites still use them). A future v0.7.x sprint migrates
 * those consumers and then adds `@deprecated`.
 *
 * **No `confidenceToStatus` adapter is shipped** (per Eve-R3). The
 * 42-bridge catalog has BOTH a numeric `confidence` AND a curated
 * string `status` field, set independently; an adapter would
 * produce labels that contradict the catalog curation
 * (e.g. `status: 'established'` + `confidence: 0.7` → adapter
 * returns `'speculative'`). Callers must pass the string explicitly
 * at cell-construction sites.
 *
 * @module core/cell
 */

import type {
  PhysicalScale,
  Force,
  Symmetry,
  InformationMeasure,
  TensorIndices,
} from './types.js';

/**
 * Epistemic confidence vocabulary for `Cell` variants. Matches the
 * `'established' | 'speculative' | 'highly-speculative'` portion of
 * `BridgeEquationStatus` from `src/bridges/index.ts:42-46`, minus
 * `'invalid'` — cells in the tensor are by definition active; invalid
 * catalog entries should not be added.
 *
 * @public
 */
export type CellConfidence =
  | 'established'
  | 'speculative'
  | 'highly-speculative';

/**
 * Fields common to every `Cell` variant. Each variant extends this
 * with a `kind` discriminator and variant-specific fields. The
 * `equation` field carries LaTeX-formatted mathematical content
 * (matching the existing `PhysicalLaw.equation` / `BridgeEquation.
 * equation` convention).
 *
 * @public
 */
export interface CellBase {
  /** Unique identifier within the parent `UniversalTensor`. */
  readonly id: string;

  /** Epistemic confidence vocabulary (see `CellConfidence`). */
  readonly confidence: CellConfidence;

  /** Mathematical formulation (LaTeX). */
  readonly equation: string;
}

/**
 * Cell variant representing a known physical law. 1:1 field-shape
 * correspondence with `PhysicalLaw` from `src/core/types.ts:88`,
 * except `confidence` is the string vocabulary (not `number`) and
 * the discriminator `kind: 'law'` is added.
 *
 * @public
 */
export interface LawCell extends CellBase {
  readonly kind: 'law';
  readonly name: string;
  readonly scales: ReadonlyArray<PhysicalScale>;
  readonly forces: ReadonlyArray<Force>;
  readonly symmetries: ReadonlyArray<Symmetry>;
  readonly informationMeasures?: ReadonlyArray<InformationMeasure>;
  readonly dimensions?: ReadonlyArray<number>;
  readonly topologies?: ReadonlyArray<number>;
  readonly references?: ReadonlyArray<string>;
}

/**
 * Cell variant representing a bridge equation between regimes. 1:1
 * field-shape correspondence with `BridgeEquation` from
 * `src/core/types.ts:126`, except `confidence` is the string
 * vocabulary and the discriminator `kind: 'bridge'` is added.
 *
 * @public
 */
export interface BridgeCell extends CellBase {
  readonly kind: 'bridge';
  readonly name: string;
  readonly source: TensorIndices;
  readonly target: TensorIndices;
  readonly validated: boolean;
  readonly description: string;
}

/**
 * Cell variant representing an emergent phenomenon. 1:1 field-shape
 * correspondence with `EmergentPhenomenon` from `src/core/types.ts:155`,
 * except `confidence` is the string vocabulary and the discriminator
 * `kind: 'emergence'` is added. Note: the old interface uses
 * `description` for the mathematical content; `EmergenceCell` carries
 * it as both `equation` (inherited from `CellBase`, mandatory) and
 * `description` (kept for prose-context fidelity, optional).
 *
 * @public
 */
export interface EmergenceCell extends CellBase {
  readonly kind: 'emergence';
  readonly name: string;
  readonly order: number;
  readonly indices: ReadonlyArray<TensorIndices>;
  readonly description?: string;
}

/**
 * The disjoint union of all `Cell` variants. Consumers narrow via
 * `switch (cell.kind)` with an exhaustive `_exhaustive: never` arm.
 *
 * @public
 */
export type Cell = LawCell | BridgeCell | EmergenceCell;

// Phase 2 Task 2.2 adds the `compose(laws, bridges, emergences, config):
// UniversalTensor` factory here, alongside `UniversalTensor.addCell`.
// Held back from Phase 1 because `compose` needs `addCell` to exist.
