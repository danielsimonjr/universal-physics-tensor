# Lean Sprint — simplify / minimize / optimize

**Date:** 2026-06-14 · **Branch:** `claude/bridge-equations-specs-review-4mfy38`
· **Scope:** post-v0.8–v0.11 codebase-lean pass. No behavior change; the full
suite (2477 passing) is the gate, unchanged before and after.

## Motivation & deep-dive findings

Ran the dependency-graph tool (`npm run docs:deps`) and read the resulting
`unused-analysis.md` / `DEPENDENCY_GRAPH.md`. The structure is already clean:

- **0 potentially-unused files**, **0 import cycles**.
- Hot paths already optimized and benched (29.8× Kretschmann, 1.56× flat-metric).

So there is almost no *algorithmic* headroom. The real lean wins are
**deduplication** (the same construct rebuilt in many places) and **surface
trimming** (exports nothing outside their module imports). The dep tool flagged
**37** potentially-unused exports — a mix of genuine internals, `@public`
symbols, and false positives (test/CLI-via-dist consumers the tool can't see).

## Items (all implemented)

| ID | Kind | Change |
|----|------|--------|
| **S1** | dedup | The 41-edge graph was hand-rebuilt in ~10 places (every composition test, `bin/upt.mjs`, analysis defaults). Extract one `CATALOG_GRAPH` constant (`src/composition/catalog-graph.ts`), re-export `@public`. |
| **S2** | dedup | `bridge-derivation-audit.test.ts` carried private copies of `deriveBridge` / `freeParameters` / `subsetsBySize` / `makeInputs` that duplicate `bridge-analysis.ts`'s `attemptDerivation` / `dimensionalFreedom`. Import the real engine; map the status names (`decoy-only`→`decoy`, `unclosable`→`open`) and re-express "admits a closure" as `dimensionalFreedom === 0`. |
| **S3** | dedup | The `D(L,M,T,Θ)` dimension factory was copied across dimensional test files → single `tests/fixtures/dimension.ts`. |
| **S4** | dedup | `linkageMap` + `proposeLinkCandidates` rebuilt an identical `QUANTITY_IDENTIFICATIONS` canonicalizer (+ `quantitiesOf`). Extract `quantityCanonicalizer()` / `quantitiesOf()`. **Preserve** `anchoringDistance`'s raw-name behavior — its distance-0/∞ contract is pinned by `bridge-priority.test.ts`. |
| **M1** | trim | Un-export 5 internal-only symbols: `createFormulaDimensionChecker`, `createMathtsFormulaParser`, `FUNDAMENTAL_CONSTANTS`, `DATA_CONFRONTED_BE_IDS`, `NamedConstant`. |
| **M2** | trim | Triage the remaining flagged exports → un-export 5 confirmed internal-only: `numberToCellConfidence`, `checkRegimeConsistency`, BE-20's `INV_LENGTH_2`, `bianchiResidualAt`, `MetricFnNested`. |

## What was deliberately NOT touched

- **`FieldSpec`** (param of exported `validateFiniteInputs`) and
  **`LowerNodeRecur`** (param of exported `lowerCovariantDerivative`): the dep
  tool flags them, but they are parameters of **exported** functions. With
  `declaration: true` (the build emits `.d.ts`), un-exporting them is a
  hard tsc error (TS4023/4078). Retained.
- **`bridge-analysis` result-type interfaces** (`DerivationResult`,
  `BridgePriorityEntry`, `LinkageCluster`, `LinkageMap`, `LinkCandidate`,
  `DerivationStatus`, `Grounding`, `Tier`): return types of the module's
  exported functions — same `.d.ts` constraint.
- **`lowerBianchiResidual`**: dep-tool false negative — it *is* imported by
  `src/numerical/lowering.ts`. Left as-is.
- All `@public` / `PRE_V071`-tracked surface (`*ValidationResult`,
  `GeodesicIntegratorInputs/Result`, `GravitationalLensingInputs/Result`,
  `CurvatureKindSpec`, `BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL`).

## Outcome

- Unused-export count (dep tool): **37 → 27**. Source files **147 → 148**
  (one new module, `catalog-graph.ts`). Total exports **1135 → 1130**.
- Gates: `tsc --noEmit` ✓, `tsc -p tsconfig.tests.json` ✓, full vitest
  **2477 passing** (unchanged), build + smoke ✓, `upt candidates` / `upt
  explain` ✓. Public-surface snapshot updated for the one intentional
  addition (`CATALOG_GRAPH`).
