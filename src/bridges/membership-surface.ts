/**
 * Barrel for the v0.8.0 membership/adjudication public surface —
 * keeps `src/index.ts` to its one-line-per-module convention while
 * the implementation lives in `membership.ts` + `rejected.ts`.
 *
 * @module bridges/membership-surface
 */
export {
  adjudicateBridgeEntry,
  adjudicateCatalog,
} from './membership.js';
export type { BridgeVerdict, CatalogAdjudicationReport } from './membership.js';
export { REJECTED_BRIDGE_ADJUDICATIONS } from './rejected.js';
export type { RejectedBridgeAdjudication } from './rejected.js';
export { REJECTED_BRIDGE_IDS } from './rejected.js';
