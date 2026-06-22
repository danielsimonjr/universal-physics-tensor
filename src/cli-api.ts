/**
 * CLI-facing barrel — the single stable entrypoint `bin/upt.mjs` imports.
 *
 * The CLI needs a handful of `@internal` analysis/composition/canonical
 * functions that are deliberately NOT on the public surface (so they are not in
 * the root `index.ts`). Previously `bin/upt.mjs` reached into ~10 deep `dist/`
 * module paths to get them, coupling the CLI to the internal file layout — any
 * module move silently broke the CLI. This barrel re-exports everything the CLI
 * uses from one place, so layout changes touch only this file and `bin/upt.mjs`
 * imports a single `dist/cli-api.js`.
 *
 * @internal — a CLI-support barrel; NOT re-exported from the root index, so it
 * stays off the consumer-facing public surface.
 *
 * @module cli-api
 */

// Public-API symbols (already on the root surface).
export {
  explainQuantity,
  CATALOG_GRAPH,
  CANONICAL_GRAPH,
  M_SUN_KG,
  composeSymbolic,
  be42Edge,
  be16Edge,
  lawSchwarzschildRadius,
  be42ViaRsEdge,
  format,
  buildVizModel,
  renderDotToSvg,
  equationLanding,
  analyzeUserEquation,
  buckinghamPi,
  dimensionallyDetermines,
} from './index.js';

// Internal analysis surface (bridge-analysis.ts).
export {
  bridgePriority,
  attemptDerivation,
  dimensionalFreedom,
  linkageMap,
  proposeLinkCandidates,
  proposeOrphanConnectors,
} from './composition/bridge-analysis.js';

// Other internal modules the CLI drives.
export {
  getFormulaParser,
  getFormulaParserKind,
  getFormulaDimensionChecker,
} from './numerical/formula-registry.js';
export { parseDimensionSpec } from './dimensional/dimension-spec.js';
export { predictMissingBridges } from './composition/bridge-prediction.js';
export { rankDiscoveries } from './composition/discovery.js';
export { auditCoverage } from './bridges/confrontation-coverage.js';
export { simplifyObservable } from './composition/expr-simplify.js';
export {
  CANONICAL_EQUATIONS,
  bridgesWithoutCanonicalPartner,
} from './canonical/registry.js';
export { scanLinkages } from './canonical/linkage.js';
export { deriveProposedBridges } from './composition/proposed-bridges.js';
