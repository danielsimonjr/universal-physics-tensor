# Batch A — v0.6.0-cycle docs — Doc Integrity Findings
**Reviewer**: opus subagent. **Date**: 2026-05-20. **Files**: `docs/planning/v0.6.0-Brainstorm.md`, `docs/planning/v0.6.0-Design.md`, `docs/planning/v0.6.0-Implementation-Plan.md`, `docs/planning/v0.6.0-Review-Findings.md`, `docs/planning/v0.6.0-Plan-Review-Findings.md`, `docs/architecture/pc-1.5-shapiro-residual-floor.md`.

## Summary
9 findings: 0 CRITICAL, 3 HIGH, 4 MEDIUM, 2 LOW. The 6 docs are largely accurate — all cited SHAs exist, all 6 bridge IDs/descriptions are correct, the Kretschmann `K(r_s)` formula reconciliation is sound, and test counts verify. The main issues are planning-vs-execution divergences in BR-2 (GL4 was wrongly targeted; the plan/design predicted RK4+GL4 migration) and the `pc-1.5` finding doc, which presents anticipated bench results as if observed and overstates its conservation-test scope.

## Findings

### A-1 — HIGH — pc-1.5-shapiro-residual-floor.md:§Findings (Findings 2 & 3)
- **Claim**: "Empirical observation expected from the bench: the residual likely plateaus around step count 2048–4096 at ~2.5e-4..." and Finding 2's "Residual behavior across step counts (recorded in bench output, not in this doc...)". Finding 3 similarly describes variance behavior in hypothetical/future tense.
- **Verification**: Read entire doc; the doc is dated 2026-05-19 and titled "Phase 1 finding". Finding 1 reports concrete measured values (`max|ΔE/E| = 0.000e+0`, commit `9e812be` — verified: `9e812be` = "test(killing): Mercury Q-drift bit-exact conservation pin"). Findings 2 and 3 contain no measured numbers — only "expected", "likely", "candidate".
- **Reality**: A doc presented as a completed Phase 1 *finding* mixes one real measured result (Finding 1) with two findings that are purely predictive ("expected to approach", "likely plateaus"). The bench harnesses exist (commit `23e90ff`) but the doc never reports their actual output, only what it anticipates.
- **Verdict**: INACCURACY (current-tense overclaim — a "finding" doc presenting predictions as findings).
- **Suggested fix**: Either insert the actual bench output tables for Findings 2 & 3, or relabel them explicitly as "Hypothesis (bench output pending human review)" so a reader does not mistake prediction for measurement.

### A-2 — HIGH — v0.6.0-Design.md:Decision #6 / Phase 2 Migrations / line 267
- **Claim**: "Migrate `tests/fixtures/schwarzschild.ts`, `computeChristoffelTensor`, and the RK4 + GL4 integrators in one coordinated commit." Line 267: "`src/numerical/connection-lowering-helpers.ts` — `computeChristoffelTensor` internals consume flat shape."
- **Verification**: `git log -1 5c786cc` (Task 2.9 migration commit) states: "No changes to GL4 integrator (uses gInverseFn/dgInverseFn, not christoffelFn). No changes to connection-lowering-helpers.ts (computeChristoffelTensor returns EngineTensor, not a christoffelFn closure)." `git log -1 9576839` (Task 2.11 gate) states: "GL4 integrator has zero christoffel references and was the wrong target for Task 2.0's bench."
- **Reality**: The Design predicted BR-2 would touch GL4 and `computeChristoffelTensor`; execution discovered both are unaffected by `christoffelFn` shape. This is an honest design *prediction* that turned out wrong — but the Design doc still reads as a current-state plan asserting these migrations.
- **Verdict**: STALE (honest prediction superseded by execution; doc not corrected post-cycle).
- **Suggested fix**: Add a post-cycle note to Design Decision #6 / Phase 2 Migrations: "Execution found GL4 and `computeChristoffelTensor` do not consume `christoffelFn` — BR-2 touched only the RK4 path. See commits 5c786cc, 9576839."

### A-3 — HIGH — v0.6.0-Implementation-Plan.md:Modified files table / Task 2.9
- **Claim**: Modified-files table lists `src/numerical/connection-lowering-helpers.ts` (Phase 2, "Consume `christoffelFnFlat`") and `src/numerical/geodesic-integrator.ts` (Phase 2, "RK4 + GL4 consume flat Christoffel"). Task 2.9 E-2 migration list items 1-3 enumerate `connection-lowering-helpers.ts` `computeChristoffelTensor` and both RK4 and GL4 sites.
- **Verification**: Same as A-2 — commit `5c786cc` explicitly states `connection-lowering-helpers.ts` and GL4 were NOT changed.
- **Reality**: The plan's explicit "must update ALL of these" migration checklist (E-2) names files that execution confirmed are not on the BR-2 path. The plan inherited the design's wrong assumption.
- **Verdict**: STALE (plan migration list inaccurate; corrected only at execution time).
- **Suggested fix**: Mark Task 2.9 items 1 and 3 (and the modified-files table rows) as "execution-corrected: not actually on the christoffelFn path".

### A-4 — MEDIUM — v0.6.0-Design.md:Phase 2 / line 240-242 (E-5 layout race)
- **Claim**: "Phase 2 Task 0 prototypes *two* layouts — λ-major `(λ,μ,ν) → 16λ + 4μ + ν` and ν-major `(λ,μ,ν) → 16ν + 4μ + λ` — and microbench-races them... The winning layout locks the breaking ABI; the loser is documented in `docs/architecture/benchmarks.md`."
- **Verification**: `git log -1 5c786cc` states the migration uses "λ-major layout (16λ + 4μ + ν)" with no mention of a race. Task 2.0 commit `c4d942f` is "bench(br-2): Mercury 1000-step baseline + Amdahl breakdown" — a baseline, not a layout race.
- **Reality**: The design specified a two-layout microbench race; execution appears to have locked λ-major directly without a documented race against ν-major. This is a design prediction not carried out as written (acceptable as scope reduction, but the doc still asserts the race happened/will happen).
- **Verdict**: STALE (design plan element not executed as specified).
- **Suggested fix**: Note in Design that the ν-major race was not run; λ-major was adopted directly.

### A-5 — MEDIUM — v0.6.0-Design.md:line 425 / v0.6.0-Implementation-Plan.md:line 28,2470
- **Claim**: Design Cross-Phase Invariant 1: "Baseline 1595/1597 (v0.5.1). Target ~1700+ after Phase 1–3 additions." Plan: "baseline 1595/1597 from v0.5.1"; Task 4.4: "full suite green (count ≥ 1700, per design target)."
- **Verification**: `git log -1 6c961a9` (final Phase 4 commit) states "Full suite: 1693 passed / 1 skipped". The task brief confirms v0.6.0 ended at 1693 passing.
- **Reality**: The v0.5.1 baseline is cited as "1595/1597" but the v0.5.1 release commit context (per CLAUDE.md "Baseline 1595/1597") — the final v0.6.0 count of 1693 falls short of the "~1700+" / "≥1700" target. This is a prediction (a target), so not a hallucination, but Plan Task 4.4's "count ≥ 1700" is a hard gate the release did not meet (1693 < 1700).
- **Verdict**: INACCURACY (Task 4.4 states `≥1700` as an expected gate; actual 1693 — the gate as written would have failed).
- **Suggested fix**: Soften Task 4.4 to "count materially above the v0.5.1 baseline (actual: 1693)"; targets in the Design are fine as predictions.

### A-6 — MEDIUM — v0.6.0-Design.md:line 425 (baseline test count internal consistency)
- **Claim**: Design says v0.5.1 baseline "1595/1597". Plan Task 1.1 expects "count ≥ 1598 (baseline 1595 + 3 new)"; Task 1.3 "≥ 1610"; Task 1.2 "≥ 1600".
- **Verification**: Commit `5c786cc` (Task 2.9, mid-Phase-2) reports "1652 passed". Final `6c961a9` reports 1693. The arithmetic baseline 1595 + cumulative additions through Phase 3 is internally consistent with reaching ~1693.
- **Reality**: Internally consistent. The "1595/1597" notation (passing/total) is used consistently across Design and Plan. No contradiction.
- **Verdict**: FALSE-ALARM-OK.
- **Suggested fix**: none — accurate.

### A-7 — MEDIUM — v0.6.0-Brainstorm.md:line 18-21 (BR-2 carry-forward provenance)
- **Claim**: "Profiling during v0.5.1's bench-harness discussion (deferred to v0.5.2 — see Phase 7 Tasks 27-29 in `v0.5.1-Implementation-Plan.md`) suggested a 2–3× speedup is plausible..."
- **Verification**: `Glob docs/planning/v0.5.1-Implementation-Plan.md` — file existence not confirmed in this batch (out of batch scope); the "Phase 7 Tasks 27-29" reference is to a v0.5.1 doc not under review.
- **Reality**: Cannot verify the cross-reference to `v0.5.1-Implementation-Plan.md` Phase 7 Tasks 27-29 without reading that file. The "2-3× speedup is plausible" was a Brainstorm-stage estimate; execution achieved ~5× on the RK4 path (commit `9576839`), so the estimate was conservative — not wrong.
- **Verdict**: UNVERIFIED (cross-ref to out-of-batch v0.5.1 doc).
- **Suggested fix**: none required for accuracy; a Batch-B/C reviewer should confirm `v0.5.1-Implementation-Plan.md` Phase 7 Tasks 27-29 exist.

### A-8 — LOW — v0.6.0-Implementation-Plan.md:line 12 (HEAD SHA reference)
- **Claim**: "Source of truth: `docs/planning/v0.6.0-Design.md` (HEAD `7799c82`) — design + Decisions #1–#13".
- **Verification**: `git cat-file -t 7799c82` → `commit` (exists). Design doc line 5 cites "HEAD at design time: `3d73a52`" and Review-Findings line 4 cites design reviewed "@ `41e98b5`"; Plan-Review-Findings line 4 cites plan reviewed "@ `d77d473`". All four SHAs verified to exist.
- **Reality**: The Plan labels `7799c82` as the Design doc's "HEAD" — `7799c82` is a real commit, but the Design's own stated design-time HEAD is `3d73a52` and the reviewed-revision is `41e98b5`. The `7799c82` label is a snapshot pointer (the commit at which the Plan was written referencing the post-vet Design), which is plausible but the "(HEAD `7799c82`)" annotation is ambiguous — it reads as the Design doc's HEAD when it is more likely the repo HEAD when the Plan was drafted.
- **Verdict**: CONSISTENCY (minor — ambiguous SHA annotation; not a fabrication, the SHA is real).
- **Suggested fix**: Clarify whether `7799c82` is the repo HEAD at plan-draft time or the Design doc's last-modified commit.

### A-9 — LOW — v0.6.0-Design.md:line 5 vs Review-Findings.md:line 4
- **Claim**: Design line 5: "HEAD at design time: `3d73a52` (v0.5.1 closure commit)." Review-Findings line 4: "Reviewed doc: `docs/planning/v0.6.0-Design.md` @ `41e98b5`."
- **Verification**: `git log --oneline` confirms `3d73a52` = "docs(release): v0.5.1 shipped". `git cat-file -t 41e98b5` → commit (exists).
- **Reality**: Consistent — the Design was authored at HEAD `3d73a52` and the Design doc itself was committed at `41e98b5` (the revision Adam+Eve reviewed). Two different SHAs for two different things (repo HEAD vs doc commit), both correct and non-contradictory.
- **Verdict**: FALSE-ALARM-OK.
- **Suggested fix**: none — accurate.
