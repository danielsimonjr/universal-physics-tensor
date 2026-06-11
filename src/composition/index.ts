/**
 * Composition graph (v0.8.0) — graph-lite `Quantity` / `BridgeEdge` /
 * `composeEdges()` beside the catalog (NOT replacing it; the catalog
 * in `src/bridges/index.ts` stays authoritative).
 *
 * See docs/planning/v0.8.0-Design.md and the calibration edges in
 * `./edges/calibration.js` for the pre-registered CT-1/CT-1b/CT-2
 * targets.
 *
 * @module composition
 */

export type { Quantity, RegimeAttributes } from './quantity.js';
export { regimesDiffer } from './quantity.js';

export type { BridgeEdge, EdgeConfidence, ValidityDomain } from './edge.js';
export {
  CompositionDimensionError,
  CompositionJunctionError,
  DomainViolationError,
  evaluateEdge,
} from './edge.js';

export type { ComposeOptions, QuantityIdentification } from './compose.js';
export {
  composeEdges,
  minConfidence,
  QUANTITY_IDENTIFICATIONS,
} from './compose.js';

export { consistencyRatio } from './consistency.js';

export {
  be16Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  lawSchwarzschildRadius,
  M_SUN_KG,
} from './edges/calibration.js';
