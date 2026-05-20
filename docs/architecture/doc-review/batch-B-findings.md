# Batch B — root docs — Doc Integrity Findings
**Reviewer**: opus subagent. **Date**: 2026-05-20. **Files**: README.md, CLAUDE.md, CHANGELOG.md, todo.md, docs/README.md.

## Summary
9 findings: 1 CRITICAL, 3 HIGH, 4 MEDIUM, 1 LOW. README.md is badly stale (still says "Current Version: v0.4.5", 6 releases behind); CLAUDE.md "Current release state" paragraph is stale but self-disclaims; CHANGELOG/todo.md are accurate on v0.6.0 with one dangling doc reference.

## Findings

### B-1 — CRITICAL — README.md:170-197 (Development Status)
- **Claim**: "**Current Version:** v0.4.5 (released 2026-05-17). Refactor + benchmark scaffold release." plus full v0.4.5/v0.4.0 metric tables and "Deferred to v0.5.0: Faraday-cascade BREAKING changes, symplectic geodesic integrator…"
- **Verification**: `package.json` version = `0.6.0`; `git tag -l` shows v0.4.5, v0.4.6, v0.5.0, v0.5.1, v0.6.0 all shipped; v0.5.0 already delivered the GL4 symplectic integrator + bisection perihelion finder (todo.md "Latest shipped" / CHANGELOG `[0.5.0]`).
- **Reality**: Current version is v0.6.0. The README "Development Status" section is six releases stale — it describes v0.4.5 as current and lists v0.5.0 features as future work that has long since shipped.
- **Verdict**: STALE
- **Suggested fix**: Rewrite "Development Status" to lead with v0.6.0 (Einstein field equation closure + curvature classification). Drop the "Deferred to v0.5.0" paragraphs. Either trim the per-version tables to the latest 1-2 releases or move the history to CHANGELOG.

### B-2 — HIGH — CHANGELOG.md:25 ([0.6.0] Changed (BREAKING))
- **Claim**: "Migration guide: `docs/architecture/br2-christoffelfn-migration.md`."
- **Verification**: `ls docs/architecture/` + `find docs -iname "*br2*" -o -iname "*br-2*"` — no match anywhere under `docs/`.
- **Reality**: The referenced migration guide does not exist. (The PC-1.5 doc cited at line 21, `docs/architecture/pc-1.5-shapiro-residual-floor.md`, DOES exist — verified.)
- **Verdict**: INACCURACY (dangling reference)
- **Suggested fix**: Either create `docs/architecture/br2-christoffelfn-migration.md` or remove the "Migration guide:" sentence; the inline `christoffel[16*λ + 4*μ + ν]` instruction in the same bullet already conveys the essential migration.

### B-3 — HIGH — README.md:134, 142 (Documentation / bridge range)
- **Claim**: "the complete bridge equation catalog (Bridge Equations 11–50)" and "Bridge Equations 21-50".
- **Verification**: `grep -c "id:" src/bridges/index.ts` → 43 (one is `BRIDGE_EQUATIONS` decl); CLAUDE.md, todo.md and README's own v0.4.5 table all state 42 bridges, IDs **11–52**.
- **Reality**: Catalog spans IDs 11–52 (42 bridges). README repeatedly says "11–50", contradicting its own v0.4.5 table ("IDs 11-52") and CLAUDE.md.
- **Verdict**: CONSISTENCY / STALE
- **Suggested fix**: Change "11–50" → "11–52" and "21-50" → "21-52" in the Documentation section (lines 134, 142). Note these ranges describe spec Part-I/II markdown; if the spec markdown genuinely stops at 50, clarify that wording instead.

### B-4 — HIGH — README.md:227-231 ("Catalog closed at 40/40")
- **Claim**: "✅ Catalog closed at 40/40 (v0.1.0…)"; "Test suite | **1161 / 1161** passing across 68 files"; "AST encodings | **40 / 40**".
- **Verification**: Current suite is 1693 passed / 179 files (CHANGELOG `[0.6.0]` line 43, todo.md line 11); catalog is 42 bridges. The 40/40 and 1161/68 figures were the v0.1.0 snapshot.
- **Reality**: These are historical v0.1.0 numbers presented in current-tense "Development Status". They are not wrong *for v0.1.0* but are misleading in a section a reader treats as current state.
- **Verdict**: STALE
- **Suggested fix**: Move the v0.1.0 / Wave-Z historical block to CHANGELOG or clearly date-stamp it as a historical milestone, not current status.

### B-5 — MEDIUM — CLAUDE.md:87-94 (Current release state)
- **Claim**: "As of the last update there: v0.4.6 shipped (2026-05-18), v0.5.0 plan queued at `docs/planning/v0.5.0-Implementation-Plan.md` (25 tasks…)."
- **Verification**: v0.5.0, v0.5.1, v0.6.0 all tagged and shipped; todo.md "Latest shipped" lists v0.6.0 (2026-05-20).
- **Reality**: The paragraph is three releases stale. It is self-disclaiming ("When the release state … drifts from `todo.md`, trust `todo.md`") so a reader is steered correctly, but the stale text remains.
- **Verdict**: STALE
- **Suggested fix**: Per the file's own instruction, update the paragraph to "v0.6.0 shipped (2026-05-20)" or delete it and rely solely on the todo.md pointer.

### B-6 — MEDIUM — CLAUDE.md:74 (Bridge-encoding patterns)
- **Claim**: "Status distribution across the 40-bridge Wave-Z closure: 6 established · 31 speculative · 3 highly-speculative · 0 invalid."
- **Verification**: Catalog has 42 bridges (`grep -c "id:"` → 43 incl. decl line; CLAUDE.md source map itself says "42-bridge catalog"). 6+31+3 = 40.
- **Reality**: The status distribution sums to 40, not the current 42. It is the Wave-Z/v0.1.0-era snapshot; 2 bridges (BE-51, BE-52) added later are unaccounted.
- **Verdict**: STALE
- **Suggested fix**: Re-tally status across all 42 entries in `src/bridges/index.ts` and update, or label the line explicitly as the "40-bridge Wave-Z closure snapshot" historical figure.

### B-7 — MEDIUM — CLAUDE.md:23 + README.md:166-168 (Benchmarks baseline version)
- **Claim**: CLAUDE.md Commands table: "baselines in `docs/architecture/benchmarks.md`"; README: "v0.4.5 baseline results… These are correctness-first baselines, not optimization targets — no threshold gates in v0.4.5. Thresholds and comparative analysis are v0.5.0 scope."
- **Verification**: `docs/architecture/benchmarks.md` exists. v0.5.0 has shipped; CHANGELOG `[0.6.0]` cites a "5-6× RK4 speedup" — comparative perf analysis now exists.
- **Reality**: README's "Thresholds … are v0.5.0 scope" is stale forward-looking text; v0.5.0/v0.6.0 already passed.
- **Verdict**: STALE
- **Suggested fix**: Update the README Benchmarks paragraph to reflect current baseline version and note v0.6.0's measured RK4 speedup, or remove the "v0.5.0 scope" forward reference.

### B-8 — MEDIUM — CHANGELOG.md:43 ([0.6.0] suite count)
- **Claim**: "Suite: 1595 (v0.5.1) → **1693 passed** … 179 files, 1 skip + 1 todo."
- **Verification**: `git ls-files "tests/**/*.test.ts" | wc -l` → 177 test files at current `master` HEAD (50c231b). Brief states the current suite is 1693 passing / 1 skip / 1 todo / 179 files. The 1693/1-skip/1-todo figures match exactly.
- **Reality**: Test counts match the verifying brief exactly. The "179 files" figure is plausible (vitest counts may include non-`.test.ts` suites or the 177 `.test.ts` count differs from vitest's file tally) — not independently confirmable via `git ls-files` alone, but consistent with todo.md and the brief.
- **Verdict**: FALSE-ALARM-OK
- **Suggested fix**: none (counts are corroborated by the review brief and todo.md; the 177-vs-179 gap is within expected `git ls-files` vs vitest file-count discrepancy).

### B-9 — LOW — todo.md:11,20 vs git (v0.6.0 HEAD ref)
- **Claim**: todo.md: "Tag `v0.6.0` + `master` pushed to GitHub, HEAD `ac0cf06`."
- **Verification**: `git rev-list -n1 v0.6.0` → `ac0cf06` (correct — tag commit); current `master` HEAD is `50c231b` (one later commit: "docs(todo): track blocked v0.6.0 npm publish"). `git cat-file -t ac0cf06` → commit (resolves).
- **Reality**: `ac0cf06` is accurate as the v0.6.0 *tag* commit. Current branch HEAD has since advanced to `50c231b`. The todo.md sentence reads as "v0.6.0 HEAD" so it is correct in context, but a reader could conflate it with branch HEAD.
- **Verdict**: FALSE-ALARM-OK (minor ambiguity only)
- **Suggested fix**: Optionally clarify "v0.6.0 tag commit `ac0cf06`" to distinguish from branch HEAD; not required.

## Notes on items checked clean
- docs/README.md — verified clean; all six `specification/Part-*.md` and three `planning/*.md` files it links exist; no version-specific or staleness claims.
- CLAUDE.md "Source map" table — every path verified present (`src/index.ts`, `src/core/{tensor,types}.ts`, `src/bridges/{index.ts,equations/,gravitational-lensing.ts,perihelion-precession.ts}`, `src/dimensional/{validator,algebra,bridge-check,connection}.ts`, `src/numerical/{lowering,geodesic-integrator,be37-covariant-eikonal,mathts-engine}.ts`, `tests/fixtures/schwarzschild.ts`, `bench/`, `examples/`). `EXPECTED_DIMENSION_BY_BRIDGE` = 40 entries (matches). `MathTSEngine` not re-exported from `src/index.ts` (matches). Descriptions accurate.
- CLAUDE.md npm scripts — `build`, `test`, `smoke`, `bench`, `bench:ci` all exist in `package.json`. `.ruff_cache` / "No Python" note still valid (no Python in repo).
- CHANGELOG `[0.6.0]` BREAKING claims verified: `pderivNumericalFn` default `order = options?.order ?? 4` (`src/numerical/pderiv.ts:106`) — the 2→4 flip is real; `schwarzschildChristoffelFn` returns `Float64Array(64)` (`tests/fixtures/schwarzschild.ts:83-87`) — the flat-array claim is real; `christoffelFnFlat` exists (`src/numerical/christoffel-flat.ts:55`). New v0.6.0 source modules `killing.ts`, `einstein-equation.ts`, `kretschmann.ts`, `weyl-lowering.ts`, `curvature-composite.ts` all present.
- todo.md npm-publish-pending status — consistent with CLAUDE.md (registry at 0.5.1, token expired); internally consistent with CHANGELOG.
