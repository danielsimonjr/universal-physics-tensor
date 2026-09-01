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
export {
  CONFRONTATIONS,
  listConfrontations,
  runConfrontation,
  confrontationRigor,
  rigorDistribution,
} from './bridges/confrontations.js';
export type { ConfrontationEntry, RigorTier } from './bridges/confrontations.js';
export type { ConfrontationOutcome } from './bridges/observations/types.js';
export { decidingMeasurement } from './bridges/sensitivity.js';
// Bridge-evaluator dispatch (`upt evaluate`) + axis-discrimination audit (`upt axes`).
export { BRIDGE_EVALUATORS, evaluateBridge } from './bridges/evaluators.js';
export type { EvaluatorSpec } from './bridges/evaluators.js';
export { auditAxisDiscrimination } from './composition/axis-audit.js';
export type { AxisDiscrimination } from './composition/axis-audit.js';
export { AXES } from './composition/axes.js';
export type { AxisSpec } from './composition/axes.js';
export { simplifyObservable } from './composition/expr-simplify.js';
export {
  CANONICAL_EQUATIONS,
  bridgesWithoutCanonicalPartner,
} from './canonical/registry.js';
export { scanLinkages } from './canonical/linkage.js';
export { deriveProposedBridges } from './composition/proposed-bridges.js';

// Experimental Product B (expression / residual search). Not the identification
// funnel (`rankDiscoveries`). CLI `upt probe` only.
export {
  DEFAULT_SEARCH_BUDGET,
  scanFrontier,
  findFrontierGap,
  problemFromResidualGap,
  makeResidualGap,
  loadSearchProblemFromJson,
  parseExprJson,
  runProbeSearch,
  formatProbeReport,
  formatFrontierScan,
  formatFrontierGap,
  suggestDiscriminatingPoint,
  parseDesignBounds,
  runFalsification,
  rankPareto,
} from './composition/probe/index.js';

// Adjudication ledger (composition/adjudication.ts) — annotates discovery
// candidates with recorded human verdicts; never mutates the funnel.
export {
  annotateAdjudications,
  adjudicationFor,
  candidateId,
  ADJUDICATIONS,
} from './composition/adjudication.js';
export type { AnnotatedCandidate, CandidateAdjudication } from './composition/adjudication.js';

// Consequence propagation (composition/consequence.ts) — annotates discovery
// candidates with the entailed/novel-consequence/inconclusive signal; never
// mutates the catalog/graph, never re-orders or re-scores.
export { annotateConsequences } from './composition/consequence.js';
export type {
  ConsequenceAnnotatedCandidate,
  ConsequenceSignal,
  ConsequenceEvidence,
} from './composition/consequence.js';

// Epistemic-grounding ledger (composition/grounding.ts) — a pure, derived view
// over each candidate's falsifier results: which gates passed vs abstained, plus
// the honest no-mechanism/no-data ceiling. Annotation-only; changes no verdict.
export { describeGrounding } from './composition/grounding.js';
export type { CandidateGrounding } from './composition/grounding.js';
