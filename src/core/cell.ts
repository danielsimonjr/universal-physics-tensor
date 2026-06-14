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
  TensorConfig,
  PhysicalLaw,
  BridgeEquation,
  EmergentPhenomenon,
} from './types.js';
import { UniversalTensor } from './tensor.js';

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

/**
 * Factory: build a populated `UniversalTensor` from three typed cell
 * arrays plus a `TensorConfig`.
 *
 * Makes the "'+' in Π = L + B + E is disjoint union, not algebraic"
 * invariant concrete: the only way to construct a populated
 * `UniversalTensor` from typed cells is to pass three typed arrays.
 * There is no `add(c1: Cell, c2: Cell): Cell` because cells never
 * compose at the cell level — composition happens at the tensor
 * level (Proposals 2 and 6 territory).
 *
 * **Provenance note**: the proposals doc §4.2 line 299 sketches
 * `compose(L, B, E): UniversalTensor` without a `config` argument.
 * This signature closes a proposals-doc gap — `UniversalTensor`'s
 * constructor requires `rank` / `scales` / `forces`, none of which
 * can be inferred from the three cell arrays alone. `compose` is
 * this sprint's invention, not a proposals-doc commitment.
 *
 * @public
 */
export function compose(
  laws: ReadonlyArray<LawCell>,
  bridges: ReadonlyArray<BridgeCell>,
  emergences: ReadonlyArray<EmergenceCell>,
  config: TensorConfig,
): UniversalTensor {
  const tensor = new UniversalTensor(config);
  for (const law of laws) tensor.addCell(law);
  for (const bridge of bridges) tensor.addCell(bridge);
  for (const emergence of emergences) tensor.addCell(emergence);
  return tensor;
}

// ---------------------------------------------------------------------------
// Inverse adapters (legacy interface → Cell variant)
// ---------------------------------------------------------------------------
// Used by UniversalTensor.populatedCells() (Phase 2 Task 2.1) to resolve
// stored cell-IDs back to Cell objects. Counterparts to the forward
// adapters (cellToLaw / cellToBridge / cellToEmergence) at tensor.ts.
//
// The numeric `confidence: number` from the legacy interfaces is bucketed
// back into the string vocabulary via `numberToCellConfidence`. This is
// the lossy direction Eve-R3 flagged — but in THIS direction, the call
// site is "we have a legacy entry that was already in the tensor; bucket
// its numeric confidence into the closest string label". Per Decision #6
// fan-out semantics, this can only happen for entries that round-tripped
// through `addCell` (where the original string was authoritative) OR
// entries added via the legacy `addLaw`/`addBridge`/`addEmergence` paths
// (where the consumer chose a number directly). The bucketing matches
// the forward `statusToConfidenceNumber` in tensor.ts: 0.95→established,
// 0.6→speculative, 0.3→highly-speculative; thresholds chosen to make
// the standard round-trip exact.

/**
 * Inverse of `statusToConfidenceNumber` at tensor.ts:48-58. Buckets a
 * numeric confidence in [0,1] back to the string vocabulary. Used by
 * the inverse adapters below.
 *
 * @internal
 */
function numberToCellConfidence(n: number): CellConfidence {
  if (n >= 0.8) return 'established';
  if (n >= 0.4) return 'speculative';
  return 'highly-speculative';
}

/**
 * Adapter: `PhysicalLaw` (legacy) → `LawCell`. Used by
 * `UniversalTensor.populatedCells()`.
 *
 * @internal
 */
export function lawToCell(law: PhysicalLaw): LawCell {
  return {
    kind: 'law',
    id: law.id,
    name: law.name,
    equation: law.equation,
    confidence: numberToCellConfidence(law.confidence),
    scales: law.scales,
    forces: law.forces,
    symmetries: law.symmetries,
    ...(law.informationMeasures ? { informationMeasures: law.informationMeasures } : {}),
    ...(law.dimensions ? { dimensions: law.dimensions } : {}),
    ...(law.topologies ? { topologies: law.topologies } : {}),
    ...(law.references ? { references: law.references } : {}),
  };
}

/**
 * Adapter: `BridgeEquation` (legacy) → `BridgeCell`. Used by
 * `UniversalTensor.populatedCells()`.
 *
 * @internal
 */
export function bridgeToCell(b: BridgeEquation): BridgeCell {
  return {
    kind: 'bridge',
    id: b.id,
    name: b.name,
    equation: b.equation,
    confidence: numberToCellConfidence(b.confidence),
    source: b.source,
    target: b.target,
    validated: b.validated,
    description: b.description,
  };
}

/**
 * Adapter: `EmergentPhenomenon` (legacy) → `EmergenceCell`. The
 * legacy `description` field holds the mathematical content (LaTeX);
 * we surface it as `equation` and leave `description` undefined
 * unless the legacy entry had a "math\n\nprose" split (per the
 * forward `cellToEmergence` adapter convention).
 *
 * @internal
 */
export function emergenceToCell(p: EmergentPhenomenon): EmergenceCell {
  // Split convention: if description contains "\n\n", treat the part
  // before as equation and after as prose; otherwise the whole field
  // is the equation.
  const splitIdx = p.description.indexOf('\n\n');
  const equation = splitIdx === -1 ? p.description : p.description.slice(0, splitIdx);
  const description = splitIdx === -1 ? undefined : p.description.slice(splitIdx + 2);

  return {
    kind: 'emergence',
    id: p.id,
    name: p.name,
    equation,
    confidence: numberToCellConfidence(p.confidence),
    order: p.order,
    indices: p.indices,
    ...(description ? { description } : {}),
  };
}
