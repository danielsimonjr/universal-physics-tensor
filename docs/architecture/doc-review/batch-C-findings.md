# Batch C — architecture docs — Doc Integrity Findings

**Reviewer**: opus subagent. **Date**: 2026-05-20. **Files**: `API.md`, `ARCHITECTURE.md`, `OVERVIEW.md`, `COMPONENTS.md`, `DATAFLOW.md`, `DEPENDENCY_GRAPH.md`, `benchmarks.md`, `TEST_COVERAGE.md`, `bridge-coverage-audit.md`, `BRIDGE-PHYSICS-AUDIT.md`, `unused-analysis.md`.

## Summary
24 findings: 5 CRITICAL, 11 HIGH, 6 MEDIUM, 2 LOW. **Verdict: the four core narrative docs (API, ARCHITECTURE, OVERVIEW, COMPONENTS) and DATAFLOW are badly stale — all stamped v0.4.0 / 2026-05-16, pre-dating v0.5.0 AND v0.6.0. They omit the entire curvature layer, GL4, perihelion finder, Killing-vector machinery, Einstein-equation nodes, Weyl/Kretschmann, and the CurvatureCompositeNode factory.** DEPENDENCY_GRAPH.md, TEST_COVERAGE.md, unused-analysis.md are v0.5.0-era (2026-05-19) — one release stale. benchmarks.md, bridge-coverage-audit.md, BRIDGE-PHYSICS-AUDIT.md are essentially current.

## Findings

### C-1 — CRITICAL — API.md:whole document
- **Claim**: "**Version**: 0.4.0 / **Last Updated**: 2026-05-16" and the entire export catalog stops at v0.4.0.
- **Verification**: `node -p require('./package.json').version` → `0.6.0`. `src/index.ts` lines 13-211 list the real surface.
- **Reality**: API.md omits ~20 runtime/type exports added in v0.5.0 + v0.6.0. Missing runtime exports: `C_SI G_SI H_SI HBAR_SI K_B_SI E_SI ALPHA M_P_SI L_P_SI T_P_SI H0_SI` (v0.5.1 constants), `integrateGeodesicGL4`, `findPerihelion`, `ricci`, `einstein`, `bianchiResidual` (v0.5.0), `verifyKillingEquation`, `evaluateConservedCharge`, `evaluateEinsteinEquationResidual`, `validateEinsteinFieldEquation`, `validateKretschmannScalar`, `computeKretschmann` (v0.6.0). Missing type exports: `GL4State GL4Snapshot GL4Options PerihelionResult FindPerihelionOptions RicciTensorNode EinsteinTensorNode BianchiResidualNode KillingEquationOptions ChristoffelAccess EinsteinEquationResidualInput MetricClosure Vec4 EinsteinFieldEquationNode EinsteinFieldEquationValidationResult KretschmannScalarNode KretschmannScalarValidationResult`.
- **Verdict**: STALE
- **Suggested fix**: Full rewrite to v0.6.0. Add a "Curvature Layer (v0.5.0)", "Constants (v0.5.1)", and "Killing / Einstein-Equation / Curvature-Invariant Layer (v0.6.0)" section; bump version + date.

### C-2 — CRITICAL — API.md:Bridge Catalog / `BRIDGE_EQUATIONS`
- **Claim**: "The 42-entry bridge-equation catalog." and "### `isActiveStatus(s)` — function ... **Stability**: `@public`"
- **Verification**: `isActiveStatus` IS exported from `src/bridges/index.ts` (DEPENDENCY_GRAPH.md:754, unused-analysis.md:69) but is NOT re-exported from `src/index.ts` — not in lines 44-51 of `src/index.ts`, and absent from `EXPECTED_RUNTIME_EXPORTS` in `tests/api/public-surface.test.ts`.
- **Reality**: `isActiveStatus` is documented in API.md as a `@public` symbol with an import example `import { ... isActiveStatus } from 'universal-physics-tensor'`, but that import fails — the symbol is not on the package's public surface.
- **Verdict**: INACCURACY (also present in DATAFLOW.md Flow 4 line 253, same bad import).
- **Suggested fix**: Either remove `isActiveStatus` from API.md/DATAFLOW.md public docs, or add it to `src/index.ts`. The 42-entry count is correct.

### C-3 — CRITICAL — ARCHITECTURE.md / OVERVIEW.md / COMPONENTS.md — four-layer model omits curvature
- **Claim**: OVERVIEW.md:28-53 "Four-Layer Architecture" diagram tops out at "Layer 4: Numerical Backend ... RK4 geodesic integrator"; ARCHITECTURE.md §System Overview and §Module Organization describe only v0.4.0 modules.
- **Verification**: `src/dimensional/curvature.ts`, `curvature-composite.ts`, `curvature-invariants.ts`, `weyl-validators.ts`, `connection-validators.ts` (RiemannTensorNode) all exist; `src/numerical/gl4-integrator.ts`, `perihelion-finder.ts`, `killing.ts`, `einstein-equation.ts`, `kretschmann.ts`, `christoffel-flat.ts` all exist (verified via `ls` + `grep ^export`).
- **Reality**: A whole curvature subsystem (Riemann/Ricci/Einstein/Bianchi/Weyl/Kretschmann composites + GL4 symplectic integrator + perihelion finder + Killing machinery) is absent from all three top-level architecture narratives. OVERVIEW.md §Roadmap (lines 67-74) still lists "Curvature layer", "Symplectic integrator", "Mercury geodesic", "BE-37 Shapiro (full)" as *future* work — all shipped in v0.5.0/v0.6.0.
- **Verdict**: STALE
- **Suggested fix**: Add a Layer-5 (Curvature) tier; rewrite the roadmap as version history; bump versions/dates.

### C-4 — CRITICAL — COMPONENTS.md:Curvature layer pattern (v0.5.0) — PD-6 extraction trigger fired but doc says "Do NOT extract"
- **Claim**: COMPONENTS.md:333-354 "### Extraction trigger (v0.5.1 PD-6) — **Do NOT extract before the next curvature primitive lands.** ... The extraction trigger is the FIFTH instance ... When the fifth instance is filed, extract the `CurvatureCompositeNode<K, S>` factory ... Until then, the explicit per-kind arms in `lowering.ts` are the right structure".
- **Verification**: `git log --oneline` shows commits `162aa52 feat(dimensional): CurvatureCompositeNode<K,S> factory + registry (Phase 3 Task 3.9)`, then `168fe38 / 95a8d18 / 913984b / af1ffe0` migrating Riemann, Ricci+Einstein, Bianchi, Weyl+Kretschmann onto it, and `a24da70 refactor(lowering): consolidate 6 curvature arms into lowerCurvature dispatcher`. `src/dimensional/curvature-composite.ts` exists.
- **Reality**: The factory the doc says "do NOT extract" has been extracted, all six nodes migrated onto it, and the per-kind lowering arms consolidated into one dispatcher — the exact opposite of the doc's standing instruction. The doc actively misdirects a reader about current code structure.
- **Verdict**: STALE
- **Suggested fix**: Replace the "Proposed extraction shape" / "Extraction trigger" subsections with a description of the shipped `CurvatureCompositeNode<K,S>` factory + `lowerCurvature` dispatcher and the six node kinds (Riemann, Ricci, Einstein, Bianchi, Weyl, Kretschmann).

### C-5 — CRITICAL — ARCHITECTURE.md:Key Statistics / COMPONENTS.md:Overview — file & export counts wrong
- **Claim**: ARCHITECTURE.md:31-48 "Source files | 74 TypeScript files", "Total exports | 407", module table `bridges/ 44`, `dimensional/ 12`, `numerical/ 15`. COMPONENTS.md:22/41 repeats "74 source files", "407 exports", "**Total**: 74 TypeScript files | 407 exports".
- **Verification**: `find src -name "*.ts" | wc -l` → `93`. DEPENDENCY_GRAPH.md:1423 (later snapshot) reports 79 files / 435 exports; even that is now stale (v0.6.0 added killing.ts, einstein-equation.ts ×2, kretschmann.ts, curvature-invariants.ts, curvature-composite.ts, weyl-validators.ts, christoffel-flat.ts). `dimensional/` now has ≥18 files, `numerical/` ≥21.
- **Reality**: All cited counts (74 files, 407 exports, and the per-module file tallies) are two releases behind. Actual src is 93 .ts files.
- **Verdict**: STALE
- **Suggested fix**: Regenerate dependency-graph.json and copy the fresh counts; or state counts as "as of v0.4.0" if the doc is intentionally a v0.4.0 snapshot (it is not — it claims to be the architecture doc).

### C-6 — HIGH — OVERVIEW.md / ARCHITECTURE.md / API.md / COMPONENTS.md / DATAFLOW.md — version stamps
- **Claim**: All five docs carry "**Version**: 0.4.0 / **Last Updated**: 2026-05-16" headers and footers.
- **Verification**: package.json = 0.6.0; v0.5.0, v0.5.1, v0.6.0 all shipped (CHANGELOG, git log).
- **Reality**: Five core architecture docs are stamped two minor releases stale. A reader trusting the stamp would assume the docs describe the shipped library.
- **Verdict**: STALE
- **Suggested fix**: Bump all to 0.6.0 / 2026-05-20 as part of the content updates in C-1/C-3.

### C-7 — HIGH — OVERVIEW.md:Version History — stops at v0.4.0
- **Claim**: OVERVIEW.md:57-63 "## Version History (v0.1.0 → v0.4.0)" ends with the v0.4.0 connection layer.
- **Verification**: CHANGELOG.md + git log: v0.5.0 (GR foundations — GL4, perihelion finder, Riemann/Ricci/Einstein/Bianchi), v0.5.1 (CODATA constants PC-1), v0.6.0 (Killing machinery, StressEnergy/CosmologicalConstant/EinsteinFieldEquation nodes, Weyl+Kretschmann, CurvatureCompositeNode, christoffelFnFlat) all shipped.
- **Reality**: Three releases of history missing.
- **Verdict**: STALE
- **Suggested fix**: Extend the version-history section through v0.6.0.

### C-8 — HIGH — DEPENDENCY_GRAPH.md:whole document — v0.5.0 snapshot, misses v0.6.0
- **Claim**: DEPENDENCY_GRAPH.md:3 "**Version**: 0.5.0 | **Last Updated**: 2026-05-19"; module list line 26-32 "dimensional: 13 files", "numerical: 19 files"; summary line 1423 "Total TypeScript Files | 79".
- **Verification**: `find src -name "*.ts" | wc -l` → 93. v0.6.0 files confirmed present: `src/numerical/killing.ts`, `einstein-equation.ts`, `kretschmann.ts`, `christoffel-flat.ts`; `src/dimensional/einstein-equation.ts`, `curvature-invariants.ts`, `curvature-composite.ts`, `weyl-validators.ts` — none appear in the per-file sections of DEPENDENCY_GRAPH.md.
- **Reality**: The dependency graph is a v0.5.0 snapshot; it predates the v0.6.0 ~14-file addition. The companion `dependency-graph.json` confirms `"version": "0.5.0", "totalFiles": 79`.
- **Verdict**: STALE
- **Suggested fix**: Regenerate the dependency graph (and `dependency-graph.json`) against v0.6.0 HEAD.

### C-9 — HIGH — DEPENDENCY_GRAPH.md:src/index.ts entry — re-export list mangled / stale
- **Claim**: DEPENDENCY_GRAPH.md:1009-1018 the `src/index.ts` re-export block embeds literal source comments as if they were symbol names — e.g. `` `// v0.4.0 additions to the numerical surface\n  DuplicateCoordinateWarning` `` and `` `// v0.5.0 perihelion finder (Task 4)\n  findPerihelion` `` are listed as exported symbols.
- **Verification**: `src/index.ts` lines 194-211 — the comment lines are JS comments inside an `export { ... }`, not symbols. The graph generator's parser swallowed them.
- **Reality**: Generator artifact. Also: this entry omits all v0.6.0 re-exports (`verifyKillingEquation`, `evaluateConservedCharge`, `evaluateEinsteinEquationResidual`, `validateEinsteinFieldEquation`, `validateKretschmannScalar`, `computeKretschmann`) because the snapshot is v0.5.0.
- **Verdict**: INACCURACY (generator bug) + STALE
- **Suggested fix**: Fix the dep-graph tool's comment stripping, then regenerate at v0.6.0.

### C-10 — HIGH — TEST_COVERAGE.md:Summary — counts stale
- **Claim**: TEST_COVERAGE.md:7-14 "Total Source Files | 79", "Total Test Files | 153", "Coverage | 96.2%"; "**Generated**: 2026-05-19".
- **Verification**: `find src -name "*.ts" | wc -l` → 93; `find tests -name "*.test.ts" | wc -l` → 179. Task brief states current suite is 1693 passing across 179 files.
- **Reality**: Source-file and test-file counts are both a release stale (79→93 src, 153→179 test). The 96.2% coverage figure and the "3 files without tests" list are computed off the stale 79-file set, so they no longer hold.
- **Verdict**: STALE
- **Suggested fix**: Regenerate `test-coverage.json` + TEST_COVERAGE.md against v0.6.0; the v0.6.0 files (killing.ts, einstein-equation.ts, kretschmann.ts, etc.) and their tests are absent from the matrix.

### C-11 — HIGH — ARCHITECTURE.md:§Module Organization — `numerical/` description omits v0.5.0+ modules
- **Claim**: ARCHITECTURE.md:94-108 lists numerical-module components: tensor-engine, float64-engine, mathts-engine, lowering, geodesic-integrator, engine-registry — six items, "15 files".
- **Verification**: DEPENDENCY_GRAPH.md numerical section (lines 1022-1300) lists ≥19 files including `gl4-integrator.ts`, `perihelion-finder.ts`, `be37-covariant-eikonal.ts`, `connection-lowering-helpers.ts`, `curvature-lowering-helpers.ts`, `null-ray-integrator.ts`, `strides.ts`, `pderiv.ts`; v0.6.0 adds `killing.ts`, `einstein-equation.ts`, `kretschmann.ts`, `christoffel-flat.ts`.
- **Reality**: The numerical-module narrative is missing the GL4 integrator, perihelion finder, curvature-lowering helpers, and the v0.6.0 trio — the headline features of two releases.
- **Verdict**: STALE
- **Suggested fix**: Rewrite §Module Organization `numerical/` and `dimensional/` subsections against v0.6.0 file list.

### C-12 — HIGH — ARCHITECTURE.md:§Key Types — `ExprNode` union missing curvature node kinds
- **Claim**: ARCHITECTURE.md:122-134 prints the `ExprNode` union ending at `| CovariantDerivativeNode; // added v0.4.0`. COMPONENTS.md:99-101 likewise lists tensor kinds ending at `covariant-derivative`.
- **Verification**: `src/dimensional/validator.ts` (per DEPENDENCY_GRAPH.md:980-981) imports and dispatches `RicciTensorNode, EinsteinTensorNode, BianchiResidualNode` from `./curvature.js` and `RiemannTensorNode` from `./connection-validators.js`; `curvature-invariants.ts` defines `KretschmannScalarNode`, `weyl-validators.ts` defines `WeylTensorNode`, plus v0.6.0 `EinsteinFieldEquationNode`.
- **Reality**: The documented `ExprNode` union omits at minimum `RiemannTensorNode`, `RicciTensorNode`, `EinsteinTensorNode`, `BianchiResidualNode`, `WeylTensorNode`, `KretschmannScalarNode`, `EinsteinFieldEquationNode` — 7 node kinds across v0.5.0/v0.6.0.
- **Verdict**: STALE
- **Suggested fix**: Update the `ExprNode` union snippet and the COMPONENTS.md kind list to the current set.

### C-13 — HIGH — DATAFLOW.md:whole document — v0.4.0, no curvature/GL4/Killing flows
- **Claim**: DATAFLOW.md stamped 0.4.0 / 2026-05-16; five flows documented (validation, numerical eval, AD, catalog query, geodesic integration); Flow 5 covers only RK4 `integrateGeodesic`.
- **Verification**: `integrateGeodesicGL4`, `findPerihelion`, `verifyKillingEquation`, `evaluateEinsteinEquationResidual`, `computeKretschmann` are all shipped public entry points (src/index.ts).
- **Reality**: No data-flow trace for the GL4 symplectic integrator, the perihelion finder, the curvature-node lowering path, the Killing-equation check, or the Einstein-equation residual evaluator. Flow 2's lowering-pass description does not mention curvature-node arms.
- **Verdict**: STALE
- **Suggested fix**: Add flow traces for GL4 / curvature lowering / Einstein-equation residual; bump version.

### C-14 — HIGH — COMPONENTS.md:§Component Dependencies graph — omits v0.5.0/v0.6.0 modules
- **Claim**: COMPONENTS.md:265-289 ASCII dependency tree under `src/index.ts` lists only v0.4.0 modules; line 291 "enforced by the absence of any runtime circular dependency in `dependency-graph.json`".
- **Verification**: `src/index.ts` lines 75-186 import `./dimensional/curvature.js`, `./numerical/killing.js`, `./numerical/einstein-equation.js`, `./dimensional/einstein-equation.js`, `./dimensional/curvature-invariants.js`, `./numerical/kretschmann.js` — none in the COMPONENTS.md tree.
- **Reality**: The dependency tree is a v0.4.0 artifact. (The "0 runtime cycles" claim itself is still corroborated by DEPENDENCY_GRAPH.md:1345.)
- **Verdict**: STALE
- **Suggested fix**: Regenerate the dependency tree from the v0.6.0 graph.

### C-15 — HIGH — unused-analysis.md:Potentially Unused Files — generated against v0.5.0, omits v0.6.0 files
- **Claim**: unused-analysis.md:5-6 "Potentially unused files: 42", "Potentially unused exports: 64"; "**Generated**: 2026-05-19".
- **Verification**: The 42-file list (lines 12-55) ends at `be-50` + `mathts-engine.ts`; no v0.6.0 file appears. `src/numerical/killing.ts` etc. exist as of HEAD.
- **Reality**: Analysis is a v0.5.0 snapshot. It cannot be relied on as a current-state unused-symbol report — v0.6.0 additions are unaudited. (The "be-*.ts unused" entries are a known false-positive class — they are loaded via the catalog/test layer — but that is a pre-existing tool limitation, not new.)
- **Verdict**: STALE
- **Suggested fix**: Regenerate against v0.6.0 HEAD; note the be-*.ts false-positive caveat inline.

### C-16 — MEDIUM — ARCHITECTURE.md:§Bridge Catalog — "v0.4.0 evaluator modules" / "8 evaluator modules"
- **Claim**: ARCHITECTURE.md:37 "Per-bridge evaluator modules | 8 (as of v0.4.0)"; lines 80 + COMPONENTS.md:41 "8 bridge evaluator modules (v0.4.0)"; ARCHITECTURE.md:80 "As of v0.4.0, eight bridge equations have evaluator modules ... The remaining 34 entries exist in the catalog index but have no evaluator module yet."
- **Verification**: `bridge-coverage-audit.md`:17 (2026-05-16, later audit) "With numerical evaluator (export function evaluate*) | **42**" — every bridge has an evaluator. DEPENDENCY_GRAPH.md bridges section confirms `be-11`..`be-50` all export `evaluate*` functions.
- **Reality**: The "8 evaluator modules, 34 with no evaluator" claim is contradicted by the project's own bridge-coverage-audit.md (all 42 have evaluators). The architecture doc was written before the Wave-Z evaluator buildout.
- **Verdict**: CONSISTENCY (ARCHITECTURE.md/COMPONENTS.md vs bridge-coverage-audit.md) + STALE
- **Suggested fix**: Update to "42 bridge evaluator modules"; remove the "34 with no evaluator" sentence.

### C-17 — MEDIUM — API.md:Stability Tiers — `@public-new` tier never updated for v0.5.0/v0.6.0
- **Claim**: API.md:25-31 tier table: "`@public-new` | Added in v0.4.0 ... May be adjusted in v0.5.0".
- **Verification**: v0.5.0 and v0.6.0 shipped; no `@public-v0.5` / `@public-v0.6` tier exists in the doc.
- **Reality**: The stability-tier vocabulary stops at v0.4.0. Newer exports have no documented stability classification at all.
- **Verdict**: STALE
- **Suggested fix**: Generalize the tier model (e.g. "`@public-new` = added in the current minor") or add per-release tiers.

### C-18 — MEDIUM — OVERVIEW.md / API.md / ARCHITECTURE.md — "42 bridge equations" phrasing vs catalog framing
- **Claim**: OVERVIEW.md:10 "machine-readable encoding of 42 bridge equations"; ARCHITECTURE.md:39 "Bridge catalog entries | 42"; API.md:39 "The 42-entry bridge-equation catalog."
- **Verification**: The 42 count is correct (`BRIDGE_EQUATIONS`, IDs 11-52). However `BRIDGE-PHYSICS-AUDIT.md` (2026-05-20) documents that the "bridge" framing itself is contested for ~19 entries and several `dimensional_signature` tags are mislabeled.
- **Reality**: Not a count error — the 42 is right. But the architecture docs present the catalog with no caveat, while the project's own physics audit flags framing/metadata issues. Minor consistency gap, not a hard contradiction.
- **Verdict**: FALSE-ALARM-OK (count verified) — flagged only as a cross-doc consistency note.
- **Suggested fix**: Optional — add a one-line pointer from OVERVIEW.md to BRIDGE-PHYSICS-AUDIT.md.

### C-19 — MEDIUM — TEST_COVERAGE.md:Source Files Without Test Coverage — stale list
- **Claim**: TEST_COVERAGE.md:19-28 "the following 3 source files are not directly imported by any test file: connection-validators.ts, fresh-label.ts, metric-inverse.ts".
- **Verification**: Computed off the 79-file v0.5.0 snapshot. v0.6.0 added ~8 source files whose test-coverage status is unknown to this doc.
- **Reality**: The "3 without tests" figure is only valid for the v0.5.0 file set; v0.6.0 files are unaudited here.
- **Verdict**: STALE
- **Suggested fix**: Regenerate; re-derive the no-coverage list against v0.6.0.

### C-20 — MEDIUM — benchmarks.md:v0.6.0 BR-2 sections — internal-consistency cross-check (mostly OK)
- **Claim**: benchmarks.md:264-335 "v0.6.0 BR-2 post-migration" — pre-BR-2 commit `b6ff122`, post-BR-2 HEAD `6e34310`; speedup table "1000: 9.27→61.31 (+561%)", "5000: 2.24→12.13 (+441%)", "10000: 1.10→6.81 (+519%)", "mean ≈ +507%".
- **Verification**: Recomputed: 61.31/9.27 = 6.61× → +561% ✓; 12.13/2.24 = 5.42× → +442% (doc says +441%, rounding ✓); 6.81/1.10 = 6.19× → +519% ✓. Mean of {561,441,519} = 507% ✓. The v0.6.0 BR-2 pre-migration section (lines 165-261) and post-migration section are both present and appended as expected.
- **Reality**: BR-2 numbers are internally consistent. NOTE: the commit hashes `b6ff122`, `6e34310`, `e83f0d9` were NOT resolved against `git log` (recent log shows different HEADs `50c231b`...`e4b33a1`); cited commits could not be confirmed to exist — marked `UNVERIFIED`.
- **Verdict**: FALSE-ALARM-OK (arithmetic verified) — with an UNVERIFIED note on commit hashes.
- **Suggested fix**: None on the numbers. Optionally verify the three cited commit hashes resolve in the repo history.

### C-21 — MEDIUM — benchmarks.md:title scope — file still titled "AD benchmark baselines established in v0.4.5"
- **Claim**: benchmarks.md:3-5 "This file records AD benchmark baselines established in v0.4.5. These are baselines for regression detection starting in v0.5.0 — no threshold gates exist in v0.4.5."
- **Verification**: The file now also contains v0.6.0 BR-2 sections (lines 165-335) and a Task 2.11 PASS/FAIL gate.
- **Reality**: The intro paragraph describes the file as a v0.4.5 AD-baseline doc, but it has grown into a multi-release benchmark log including a v0.6.0 gate verdict. Intro is understated, not wrong.
- **Verdict**: STALE (intro only — body is current)
- **Suggested fix**: Reword the intro to "records benchmark baselines and per-release gate results from v0.4.5 onward."

### C-22 — LOW — bridge-coverage-audit.md / BRIDGE-PHYSICS-AUDIT.md — version stamps lag HEAD
- **Claim**: bridge-coverage-audit.md "Pre-flight audit for v0.5.0"; BRIDGE-PHYSICS-AUDIT.md:3 "Catalog audited: ... v0.5.1".
- **Verification**: package.json = 0.6.0. The 42-bridge catalog (IDs 11-52) was not changed in v0.6.0 (v0.6.0 added curvature/Killing machinery, not bridges) — git log v0.6.0 commits touch `src/dimensional`, `src/numerical`, and only a BE-17 docstring / BE-20 re-encoding (`6c961a9`).
- **Reality**: Both bridge audits are pinned to pre-v0.6.0 catalog versions, but since the bridge catalog itself is essentially unchanged in v0.6.0, the audits remain substantively valid. Stamps just lag.
- **Verdict**: STALE (cosmetic — content still applicable)
- **Suggested fix**: Add a one-line "still current as of v0.6.0 — catalog unchanged" note rather than a re-audit.

### C-23 — LOW — ARCHITECTURE.md:Module table — `entry/` counted as a module
- **Claim**: ARCHITECTURE.md:34 "Modules | 5 (`bridges`, `core`, `dimensional`, `numerical`, `entry`)".
- **Verification**: DEPENDENCY_GRAPH.md:1424 "Total Modules | 5" — consistent. `src/index.ts` is the sole `entry` file.
- **Reality**: Internally consistent across docs; treating the 1-file entry point as a "module" is a modeling choice, not an error.
- **Verdict**: FALSE-ALARM-OK
- **Suggested fix**: None.

### C-24 — HIGH — API.md:line 6 — "snapshot-tested" claim true but the snapshot is itself stale
- **Claim**: API.md:6 "The public surface is snapshot-tested in `tests/api/public-surface.test.ts`. Any symbol not in that test's `EXPECTED_RUNTIME_EXPORTS` or `ALL_TYPE_EXPORTS` lists is `@internal`."
- **Verification**: `tests/api/public-surface.test.ts` `EXPECTED_RUNTIME_EXPORTS` (lines 23-68) and `ALL_TYPE_EXPORTS` (lines 127-161) cover up to v0.5.1 constants but DO NOT include the v0.6.0 exports (`verifyKillingEquation`, `evaluateConservedCharge`, `evaluateEinsteinEquationResidual`, `validateEinsteinFieldEquation`, `validateKretschmannScalar`, `computeKretschmann`, and the v0.6.0 types). `grep` for `Killing|Kretschmann|EinsteinEquation` in that test → no matches.
- **Reality**: API.md's stated invariant ("not in the test ⇒ @internal") would, taken literally, classify the v0.6.0 public exports as `@internal` — they are genuinely public (re-exported from `src/index.ts`) but the snapshot test was not extended for v0.6.0. This is a test-staleness finding surfaced via the doc; the doc's claim is now misleading.
- **Verdict**: CONSISTENCY (doc invariant vs actual test contents) — root cause is a stale test, outside Batch C scope but flagged for the maintainer.
- **Suggested fix**: Extend `public-surface.test.ts` with the v0.6.0 symbols; then API.md's invariant becomes true again. Until then, soften API.md line 6.
