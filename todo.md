# UPT TODO

Durable cross-session task tracker. Update this file as work progresses — checkboxes flip when tasks complete, items move between sections as state changes.

> The in-conversation task tracker (TaskCreate/TaskUpdate) is ephemeral. This file is the source of truth for "what's next" across sessions.

---

## Active queue

- [ ] **🚧 v0.7.2 hygiene sprint — READY FOR EXECUTION (next session)** — branch `claude/changelog-todo-sync-9PdMg`, baseline HEAD `6e57c1b` (design r2 + plan r1 + Adam+Eve design vets all landed). Perf-focused sprint carrying v0.7.1's deferred O-1 + O-6 + the v0.7.1-simplify-brainstorm S-9. **Design vetted YELLOW by both Adam (3H/7M/3L at `8f74e95`) + Eve (1H/4M/6L at `c142634`); all HIGH findings closed in design r2 (`9c92d11`).** Plan r1 (`6e57c1b`) operationalizes the design into 15 tasks across 5 phases (+ Phase 0 baseline).
      
      **Sprint goals** (per design r2):
      - **O-6 PG metric** Float64Array migration (Phase 1 pilot — small surface, ~5 callsites).
      - **O-1 Schwarzschild fixture** Float64Array migration (Phase 3 high-volume — ~53 non-comment callsites across ~20 files including 6 hot-path `src/` consumers per Adam A-3).
      - **S-9** lowerNode 5-arm deferred-cluster consolidation via registry dispatch (Phase 4).
      
      **Sprint task queue** (consume design r2 + plan r1 — DO NOT re-design):
      1. **Phase 0** (1 commit, ~30 min): Tasks 0.1-0.6 baseline + per-candidate empirical verification. Re-grep with Adam A-1 revised regex (catches variable-indexed callsites — true count ~109 raw / ~53 non-comment). Re-bench v0.7.1 PO-1 baseline (5% drift gate). Deliverable: `docs/architecture/v0.7.2-baseline.md`.
      2. **Phase 1** (3 commits, ~1-2 hr): PG pilot — `MetricFnFlat` + `MetricFn` union alias; PG fixture BREAKING(public) migration; consumer rewrite + R-1b off-diagonal pin in `tests/numerical/painleve-gullstrand-curvature.test.ts`.
      3. **Phase 2** (2 commits, ~30-45 min): mid-cycle Adam+Eve vet (SERIAL dispatch per Decision #9 — Adam first, Eve on post-Adam HEAD). Reports at `docs/architecture/v0.7.2-phase-1-{adam,eve}-vet.md`.
      4. **Phase 3** (5 commits, ~3-4 hr): Schwarzschild high-volume — fixture migration BREAKING(fixture) + 6-file hot-path `src/` consumer rewrite (gl4-integrator, weyl-lowering, perihelion-finder, killing, null-ic, be37-covariant-eikonal — these BYPASS flattenNA per Adam A-3) + Batch A tests/numerical+dimensional + Batch B tests/fixtures + R-1 / R-1c regression pins.
      5. **Phase 4** (2 commits, ~1 hr): S-9 DEFERRED_EVALUATOR_REGISTRY landing + 5-arm default-arm consolidation + exhaustiveness test per Adam A-8 mitigation against silent prose drift.
      6. **Phase 5** (2 commits, ~1 hr): combined bench gate per Decision #6 3-tier (STRETCH ≥2× / SHIP-WITH-NOTE 1.5-2× / INVESTIGATE 1-1.5× / STOP <1×) + `npm audit` + `npm outdated` pre-flight per CLAUDE.md release discipline + CHANGELOG + todo wrap. Version bump per Decision #2: `v0.7.2` is a placeholder; publishable release MUST be `v0.8.0` minor bump (PG `@public` BREAKING — semver compliance).
      
      **Expected sprint totals**: 15 commits; suite 2103 → 2111 (+8 net new from R-1/R-1b/R-1c/S-9-exhaustiveness pins); net code LOC −45 to −60 from S-9.
      
      **Execution discipline** (per plan §0):
      - Worktree fork-point preamble MANDATORY in every agent brief (Decision #4 + Adam A-13 uncommitted-changes guard).
      - Default dispatch model: **direct execution OR serial subagent** (per Decision #9 + Eve E9 v0.7.1 parallel-agent-friction lesson). Parallel-subagent is the EXCEPTION.
      - Adam+Eve vet pairs always SERIAL (Adam first, commit + push, Eve on post-Adam HEAD).
      - Pre-execution verification gate at every TASK start (re-grep / re-read per the v0.5.0+ pattern).
      - Honest-claude framing: every commit message that deviates from the plan documents the deviation.
      
      **Optional pre-execution gate**: dispatch Adam+Eve plan-vet (serial per Decision #9) before Phase 0. Plan-vet checklist at `docs/planning/v0.7.2-Implementation-Plan.md:872-890`. Not strictly required since design r2 already vetted, but plan-vet catches plan-vs-design drift early.
      
      **Carry-forward to v0.7.3 (explicitly deferred per design r2 §1)**:
      - Sibling fixtures (de-sitter, flrw, minkowski) Float64Array migration (per Decision #8 — MetricFn union accommodates them staying nested-array for now).
      - O-4 `christoffelAt` flat-path migration (per Adam A-10 — touches engine boundary, distinct shape from O-1/O-6).
      - M-13 / M-14 dep-graph generator gap-fill (per Eve E5).
      - BE-25 archive-or-delete catalog-archive-policy decision (per Eve E5).
      - MathTSEngine optional-peer install / CI documentation (P8 AD path's `describe.skipIf(true)` debt from v0.7).
      - Re-export PG in `src/index.ts` or strip `@public` tag (close M-2 deferral, per Adam A-7 out-of-scope recommendation).
      
      **Reference docs** (read these before starting):
      - Design r2: `docs/planning/v0.7.2-Design.md`
      - Plan r1: `docs/planning/v0.7.2-Implementation-Plan.md`
      - Adam design vet: `docs/architecture/v0.7.2-design-adam-vet.md`
      - Eve design vet: `docs/architecture/v0.7.2-design-eve-vet.md`
      - v0.7.1 wrap (what shipped + what was deferred): `CHANGELOG.md` `[Unreleased]` block

- [x] ✅ **v0.7.1 hygiene sprint — Phases 0-6 COMPLETE (O-1 deferred to v0.7.2)** — branch `claude/changelog-todo-sync-9PdMg`, HEAD `84115fa` (pre-tag). Suite **2103 passed / 0 failed / 5 skipped / 1 todo** (+47 net new from 2056 sprint baseline). 26 sprint commits across 6 phases + 1 mid-cycle vet pair. All four mid-cycle Adam+Eve adversarial-review gates passed (design pair pre-sprint, Phase 3 mid-cycle pair — `af8c813` Adam GREEN 0H/0M/2L + `1023210` Eve YELLOW 0H/3M/3L with E1+E2 fixed same-commit; no other vets needed since Phase 4/5/6 changes were behaviour-preserving + bench-only). Phase 1+2 → minimize sweep (M-1 surface restoration + guard test + dep-graph tooling fix; M-3+M-4+M-5 mass-annotation pass); Phase 3 → BE-NN triple-extraction (`_be-helpers.ts` 3 helpers + 43 unit tests; 43 BE modules migrated; rg-flow.ts migrated to `validateComponentDimension`); Phase 4 → validator+lowering coherence (S-5+S-6 dedup; S-13 RiemannChildCallback consolidation; S-14 mergeFreeIndices brainstorm-stale 5×→actual 8× — extracted all 8; Eve E4 prose regression fixed via FieldSpec.description override + 3 new tests); Phase 5 → O-2 Picard ping-pong buffer pre-alloc (bench-measured **1.27× speedup** on solveGL4Stage; below the brainstorm's "2-5×" prediction which assumed paired O-1); Phase 6 → 2 new measure-only bench harnesses (kretschmann-symmetry, painleve-gullstrand-pipeline) + benchmarks.md append. Version bump 0.7.0 → 0.7.1 SKIPPED per user directive (publish still blocked on token rotation). **v0.7.2 sprint queued above carries O-1 + O-6 + S-9 forward; design r2 + plan r1 vetted and ready.**
- [x] ✅ **v0.7-series tag strategy + push** — RESOLVED 2026-05-25. User picked **Option 1 (single v0.7.0 rolling everything)**. Bumped `package.json` 0.6.0 → 0.7.0, committed (`dc800c2`), tagged `v0.7.0`, pushed master + tag, published to npm. v0.6.1 hygiene work folded into v0.7.0 changelog as a subsumed section. See `## Latest shipped` for full disposition.
- [x] ✅ **v0.7 release pre-flight checks** — EXECUTED 2026-05-23 (commit `5cd860a`). All five blocking checks pass: `npm audit` 0 vulnerabilities; `npm outdated` shows 2 deferred majors (typescript 6.x, @types/node 25.x) within-range deps up-to-date; tsc strict clean; suite 1879/0/5/1 (post helper-extraction); `npm run smoke` exits 0. Verdict: READY TO TAG. Full report at `docs/architecture/v0.7-release-preflight-log.md`. Optional `npm run bench:ci` recommended pre-tag for baseline refresh (now feasible via the vitest 4.1.7 reporter fix).
- [x] ✅ **v0.6.1 tag + push** — SUPERSEDED 2026-05-25 by v0.7.0 single-tag ship. v0.6.1 content is in the v0.7.0 changelog as the `## [0.6.1 — subsumed into 0.7.0]` section.
- [x] ✅ **v0.6.0 npm publish — superseded 2026-05-25 by v0.7.0 single-tag ship.** Token rotation (1 of 3 blockers) resolved earlier this session; the remaining two blockers (version mismatch + stale dist/) became moot when the user chose Option 1 (single v0.7.0) — version bumped 0.6.0 → 0.7.0, fresh dist/ built (468 files / 3.1 MB, replacing the 12-file / 67-KB v0.1.0-era stale build), and tag/publish executed against the new label. Registry now at 0.7.0; v0.6.0 was never published independently and is documented as subsumed in `CHANGELOG.md`. Historical detail below for reference.

      Original blocker entry preserved for context:
      **🚧 v0.6.0 npm publish — token rotated 2026-05-25; two additional blockers surfaced.**
      v0.6.0 is code-complete at tag `v0.6.0` (`ac0cf06`): all 36 tasks
      executed, suite 1693 green, build/smoke/audit clean, version bumped,
      tag and `master` pushed. **Token (1 of 3 blockers): RESOLVED 2026-05-25** —
      new Automation token (`npm_`-prefixed, 40 chars) installed via
      `[Environment]::SetEnvironmentVariable('NPM_TOKEN', '<new>', 'User')`;
      `npm whoami` → `danielsimonjr`; `npm token list` shows a single active
      token (id `38b1e9`, created 2026-05-25). **NEW blockers surfaced
      during the rotation session — must resolve before any publish:**
      1. **Version mismatch.** `package.json` is at `0.6.0` but HEAD is
         14 commits past tag `v0.6.0`, carrying the entire v0.7-series
         sprint (commits `552df56` ← `67b37c4` ← ... ← `ac0cf06`).
         Running `npm publish` from `master`/HEAD would ship v0.7-era
         code labeled as `0.6.0` — a semver violation that would also
         confuse `mathts-tensor`/`mathts-autograd` peer consumers.
      2. **`dist/` is wildly stale.** Only 12 files / 67 KB present (just
         `core/types.*` + `index.*` from a v0.1.0-era build). Current
         source has full `bridges/`, `dimensional/`, `numerical/`, `diff/`
         subsystems missing from the build output. The `--ignore-scripts`
         Windows workaround silently bypasses the `prepublishOnly:
         "tsc && vitest run"` hook, so `npm publish` never auto-rebuilds.
      **Two viable paths from here (see this turn's diagnosis):**
      - **(A) Publish v0.6.0 from the tag.** `git worktree add ../upt-v060 v0.6.0`
        → in that worktree: `npm install` + `npm run build` +
        `npm publish --ignore-scripts --access public`. Honors the
        existing tag literally; tag, registry, and published code all
        match. Returns master untouched.
      - **(B) Skip v0.6.0, ship v0.7-series instead.** Resolves todo
        "v0.7-series tag strategy" first — single v0.7.0 vs. split
        v0.7.0/v0.8.0/v0.9.0-alpha. Then bump `package.json`, tag,
        build, publish from that fresh tag. Reaches the latest code on
        npm in one shot.
      Registry currently shows `0.5.1`; no partial-publish state to
      clean up. Whichever path: confirm `npm whoami` still works in the
      publish shell, then `npm view universal-physics-tensor version`
      should report the new version post-publish.
- [x] ✅ **GitHub release notes for v0.6.0 + v0.6.1 + v0.7-series** — EXECUTED 2026-05-25 using the Option 1 body from `docs/architecture/v0.7-release-notes-draft.md` (with suite count refreshed from 2056 → 2103). Release live at <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.0>. Options 2 and 3 from the draft remain as historical reference.

(Completed `[x]` items previously listed here — v0.6.0 doc-integrity
review, BE-33 fix + bridge-physics audit, vendored tooling + C-9 fix,
UPT v0.70 proposals doc, all v0.6.1 sprint phases — are subsumed by
the v0.6.0 and v0.6.1 release entries in "Latest shipped" above and
the corresponding `CHANGELOG.md` `[Unreleased]` block. Removed here
to keep the queue focused on still-open work.)

### v0.7 follow-up execution lessons (carry-forward for v0.8.0+)

- **Verify carry-forward release-note numbers at HEAD before scoping work.** Three audits in the v0.7 follow-up session (PC-1.5, AS-3, BE-module exports triage) all found their carry-forward numbers stale: PC-1.5 Shapiro residual was 4 orders of magnitude better than documented (2.28e-8 vs 2.51e-4); AS-3 site count was 1 order of magnitude smaller (8 vs ~65); BE-module export count was 40% inflated (61 vs ~85). Generalizes the v0.6.1 "verify what tooling actually does" lesson: it also applies to release-note prose and todo-list numeric estimates. **Pattern**: any todo item with a numeric scope estimate, re-run the producing tool/grep at HEAD before treating the number as the work envelope. Stale numbers in carry-forward notes are the default — fresh re-measurement is always cheaper than misallocating session time.

### v0.6.1 execution lessons (carry-forward for v0.7.0+)

- **Verify what tooling flags actually DO, not just that they exist.** Track-C recon for v0.6.1 verified `--include-tests` was wired in the generator's CLI. Adam+Eve verified the flag's existence. But empirically running the generator with the flag showed it triggered a separate test-coverage REPORT and did NOT feed `detectUnused` (test parsing happened after the unused-detection scan). Caught at Phase 0 baseline run, not Adam+Eve review. **Pattern**: for any "this flag/setting/script does X" claim, the design's adversarial review must include a runtime empirical check, not just a code-presence grep.
- **Test-imports count as external in TypeScript ESM.** The v0.6.1 design's original bucket-(a) "internal-only" definition included "symbols used only by tests" — but `tsc` does not treat `tests/` imports as internal. Dropping `export` on a test-imported symbol breaks the build. Adam+Eve S1 caught this with grep-verified file:line evidence. **Pattern**: four buckets, not three. The (a') "test-only importer, keep export + @internal JSDoc" bucket is the correct treatment.
- **The "11 arms follow identical pattern" claim is the v0.5.0 ricci-slot trap re-played.** The v0.6.1 design said 10 validator arms had identical shape; verified at validator.ts:592-740 showed 11 arms across 3 patterns (3 pass riemann-child closure, 3 are scalar/skip-merge, 5 are standard). A boolean `propagateFreeIndices: boolean` flag would have produced the v0.5.0 ricci-slot bug shape — silent miscompute. **Pattern**: registry-driven dispatch contracts must use a discriminated union (`pattern: 'A' | 'B' | 'C'`) so the per-arm callback shape typechecks exhaustively, not a flag-bag.
- **Eve fabrication rate dropped 5/9 → 1/13.** The v0.5.1 retrospective ("always grep-verify Eve's specific-evidence claims") was applied consistently in v0.6.1: every Eve claim with a file:line citation got an immediate `grep -rn` before being accepted as load-bearing. Net result: only 1 fabrication (E-R10 — a speculative claim that `tools/plan-doc-audit/` imports from `src/`, verified false in 5 seconds). The discipline works.
- **Phase 0 baseline capture saved the sprint.** Before any code change, Phase 0 ran `npm test` against `master`-HEAD and found 5 pre-existing test failures (1672/5-failed, not the v0.6.0-tag's 1693/0). Without that capture, the sprint would have shipped on top of broken master, and the "suite stays green" goal would have meant something different (or been silently fudged). **Pattern**: always re-baseline against HEAD at sprint start; never trust the previous-release's CHANGELOG number as the "current" state.

### v0.5.1 execution lessons (carry-forward — still relevant)

- **Audit hypothesis can be empirically wrong.** PC-1's prediction that `c_SI` drift dominates the BE-37 Shapiro residual was REFUTED via Tasks 1+4 measurement. The constants canonicalization was still net-positive hygiene but the residual is integrator-driven. Pattern: every audit prediction with a numerical target should be RED-test-verified before being declared "shipped". Honest negative results are valuable.
- **Eve (OpenAI o3) hallucinated 5/9 audit-vet challenges.** Fabricated `src/core/constants.ts` (didn't exist pre-Phase-1), NYC coverage report (no NYC), BE-60 v0.6.x branch (no such bridge), JIT micro-benchmarks (none), v0.5.0-rc2 (no rc tags). See `feedback_eve_o3_hallucinations.md`. **Always grep-verify Eve's specific-evidence claims.** Use her for severity-recalibration judgment (3/3 correct there) not fact-claim verification.
- **The c²-cancellation noise pattern is the v0.5.1 silent footgun.** It manifested twice: Task 16 (Minkowski curvature tests) had to switch to unitless `c=1` fixture; Task 4 (Schwarzschild fixture migration) had to escalate by migrating 3 consumer test files because the cycloid blew up at relErr 3.4e-6. Anywhere SI metric carries `c²` scale (~6e16 on g_tt), 2nd-order FD propagation is at risk. PD-7's opt-in 4th-order `pderiv` is the v0.5.1 mitigation; future bridges differentiating `c²·g_tt` should use `{ order: 4 }`.
- **Multi-agent file-disjoint parallelism is a real strategy.** Phases ran in parallel-batches (Phase 1 + my Phase-3 doc edits concurrently) with zero merge conflicts because we strictly partitioned file scope. CHANGELOG.md was the single read-modify-write contention point — kept sequential.
- **Adam+Eve MCP availability is fragile.** llm-gemini and llm-openai MCPs disconnected mid-cycle; required `/kill-plugins` + `/reload-plugins` recovery. For v0.6.0+ adversarial vets, consider Opus subagents as a built-in fallback (per Daniel's v0.5.1 directive when MCP was down).

### Notable v0.5.0 execution lessons (load-bearing for v0.6.0+ planning)

- **Two plan-correctness bugs slipped past Adam+Eve adversarial review** and were only caught at TDD-RED:
  1. Schwarzschild Riemann formula: plan template wrote leading-order `2GM/r³`, correct coordinate-basis form is `r_s/(r²(r-r_s))` (off ~33% at r=3·r_s). Caught Task 0. Memory: `feedback_v0_5_0_plan_template_riemann_bug.md`.
  2. Ricci contraction slot: plan + design + S1 correction all wrote `lowerIndices[0]`, correct is `lowerIndices[1]` (Carroll Eq. 3.91). Caught Task 7 via de-Sitter `R=4Λ` failing to vanish. Memory: `feedback_v0_5_0_ricci_contraction_bug.md`.
- **4th-order finite-difference stencils** required for ≤1e-9 Riemann lowering accuracy — the c²·g_tt ~ 6e16 scale causes catastrophic cancellation at 2nd-order. v0.4.0 `pderiv` defaults need scrutiny anywhere SI-c² metrics are differentiated.
- **Curvature-layer pattern** (first-class AST node `{kind, …refs}` + walk-directly lowering; no AST rewrite, no contraction-graph) crystallized across Riemann/Ricci/Einstein/Bianchi. Next curvature-layer addition (Weyl? Bianchi-2nd-form?) is the threshold to extract a shared `CurvatureCompositeNode<K,S>` factory.
- **GL4 + Picard inner solver** is shape-agnostic: null geodesics worked without Picard pathology (Task 12). Mercury matched GR closed-form to 7 sig figs (Task 10). The symplectic Hamiltonian flow does not care whether `g^μν p_μ p_ν` is timelike or null.
- **Cross-bridge `c` constant inconsistency** discovered Task 11: `src/numerical/be37-covariant-eikonal.ts` uses `c = 2.998e8`; `evaluateShapiroDelay` uses exact `299792458`. Dominant ~1.8e-4 BE-37 residual. **v0.5.0+ cleanup item.**

---

## Latest shipped

- **v0.7.2** (2026-05-25) — **SHIPPED TO NPM.** Patch release fixing latent `MathTSEngine` AD-dispatch bugs surfaced by the typed-function EOVERRIDE resolution. Two bug patterns fixed: Pattern A (6 failures, real integration bug in `src/numerical/mathts-engine.ts` add/sub/mul/scale — never dispatched DualTensor/TapedTensor inputs to the autograd peer despite documentation saying it should); Pattern B (2 failures, absence-tests in `mathts-engine-typing.test.ts` that ran when the peer was actually present). Suite: 2103 → **2126 passed (+23 net new AD conformance tests now running)**. Tag `v0.7.2` at commit `1dd372f`. GitHub release: <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.2>. **Partial close of P8 horizon item**: AD conformance suite now runs against MathTSEngine whenever peer is installed. **Lesson captured (v0.8+ execution lesson)**: deferred test enablement via `.skipIf(true)` is silent debt — the gate prevents validation in EVERY environment (local, CI, peer-installed contributor). Right pattern is `describe.skipIf(!peerPresent)`, not `.skipIf(true)`.
- **typed-function EOVERRIDE fix** (2026-05-25, sister repo `~/Dropbox/Github/typed-function` commit `5711dab`) — **SHIPPED**. Resolved upstream blocker preventing UPT's `@danielsimonjr/mathts-*` optional peers from installing. Bumped `@rollup/plugin-terser` ^0.4.4 → ^1.0.0 + `rollup` 4.53.3 → ^4.60.2 to match override intent; pruned redundant override entries; rebuilt `build/` artifacts under new majors. Tests: 1684/0 in typed-function. Pushed to `origin/develop`. The fix propagates to all downstream MathTS consumers globally without requiring republish, since `mathts-core@0.1.2` references typed-function via the GitHub URL (resolves to default-branch HEAD at install time).
- **Sister-repo hygiene sweep** (2026-05-25, post-v0.7.2):
  - **workerpool** (`~/Dropbox/github/workerpool` commit `9faaf33` → `origin/master`): dropped redundant `@rollup/plugin-terser` + `rollup` override entries (direct devDeps already matched at `^1.0.0` / `^4.60.2` per earlier commit `cb20784`). Pattern parity with the typed-function cleanup. No behavior change.
  - **MathTS** (`~/Dropbox/github/Mathts` commit `b9a940d` → `origin/main`): closed MathTS-side TODO #7 — fixed `tensor/tests/contraction-sequence.test.ts:304` 16-tensor DP test that was being killed at vitest's default 5000ms before its `elapsed < 10_000` assertion ran. Added `{ timeout: 15_000 }` as the **2nd argument** to `it()` per Vitest 4's API (the MathTS TODO entry had suggested the trailing-options 3rd-argument form, which was deprecated in Vitest 3 and is a hard error in Vitest 4). Also updated MathTS's TODO.md to flag the API change for future readers — a concrete instance of the "documented fix recipes also decay across major framework versions" pattern (close cousin of the [numeric-claims-decay convention](#numeric-claims-in-todo-entries-decay-faster-than-checkbox-state) added today).
- **v0.7.1** (2026-05-25) — **SHIPPED TO NPM.** Patch release: dev-dep validation under newer toolchain. No source changes. Refreshed installed deps to v0.7.0's declared versions (`@types/node` 25.9.1, `typescript` 6.0.3, `vitest` 4.1.7), rebuilt `dist/` under TS 6.0.3 (v0.7.0's `dist/` was TS-5.9-compiled despite the `^6.0.3` declaration — half-state closed). Full suite re-validated: 2103/0/5/1, no regressions. Tag `v0.7.1` at commit `438db4c`. Tarball: 471 files / 563.9 KB / 2.1 MB unpacked. GitHub release: <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.1>. Known limitation documented: MathTS optional peers can't install due to upstream `typed-function` EOVERRIDE — tracked as a new "fix typed-function" item in the active queue.
- **v0.7.0** (2026-05-25) — **SHIPPED TO NPM.** Single tag rolling everything from v0.5.1 → 0.7.0: v0.6.0 work (never published) + v0.6.1 hygiene sprint (never tagged) + six v0.7-series proposals (P3/P2/P1/P5/P8/P6-A) + v0.7 hygiene follow-up + v0.7.1 hygiene sprint. Registry jumps 0.5.1 → 0.7.0. Tag `v0.7.0` at commit `dc800c2`; preceded by `c8ebdb1` (Windows backslash fix for the v0.7.1 public-surface guard test, caught at release-gate run on Windows). Suite **2103 passed / 0 failed / 5 skipped / 1 todo**, 0 audit findings. npm publish via Automation token (rotated earlier this session — see todo #4 resolution). Tarball: 471 files / 563.9 KB / 2.1 MB unpacked. GitHub release: <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.0>. Tag-strategy decision was Option 1 (single v0.7.0); Options 2/3 from `docs/architecture/v0.7-release-notes-draft.md` remain as historical record.
- **v0.7-series sprint** (2026-05-23, on branch `claude/changelog-todo-sync-9PdMg` — **tag shipped 2026-05-25 as v0.7.0**). **Six v0.7-series proposals shipped in one session**, stacked on the still-untagged v0.6.1 work:
  - **P3** — Typed `Cell` discriminated union (`src/core/cell.ts`): `Cell = LawCell | BridgeCell | EmergenceCell`, `compose(laws, bridges, emergences, config)` factory. 7 public symbols. Per Eve-R2/R3: `CellConfidence` is string-literal union; legacy `PhysicalLaw.confidence: number` stays autonomous. `UniversalTensor.addCell(cell)` exhaustive dispatch.
  - **P2** — Sparse semantic catalog + flux rules (`src/core/flux-rules.ts`, `src/bridges/catalog-adapter.ts`): 3-rule registry with `_exhaustive: never` dispatch (Rule 1 = dimensional-consistency from catalog adapter per Decision #3 resolving Adam-V3; Rule 2 = L/B/E coordinate matching ERROR-tier; Rule 3 = causality WARNING-tier). `UniversalTensor` gets 4 new methods: `populatedCount`, `populatedCells`, `unpopulatedNeighborhoods`, `fluxDiagnostics`. `catalogToCells` / `scanCatalog` / `ingestCatalog` two-pass adapter per Decision #11. **Empirical (Eve-R1 lesson held)**: live BRIDGE_EQUATIONS catalog passes Rule 1 with 0 errors; 5 submittable + 37 unsubmitted (per strict `PhysicalScale` mapping; freeform `microscale`/`information`/`Newtonian gravity`/etc. labels filtered). 10 public symbols. **Redrafted once** after first Adam+Eve pass caught 3 SHOWSTOPPER issues (Adam-V2 compile-blocking, Eve-R1 empirical, Eve-R7 storage-design); redraft Adam+Eve = 0 HIGH READY.
  - **P1** — Intelligent Index layer (`src/core/universal-index.ts`, `axes-registry.ts`, `labeled-tensor.ts`): `UniversalIndex<Axis>` + branded `UniversalIndexId` (UUID); `Axes` module-singleton with 18 frozen references (4 scales + 5 forces + 5 symmetries + 4 info measures); `LabeledTensor<L>` wrapper composing `EngineTensor + TensorEngine + labels`; `contract(other)` matches by `UniversalIndexId` equality (Decision #3). 4 error classes. BE-52 single-bridge demo at `src/bridges/perihelion-precession-labeled.ts` (Cross-Phase Invariant 4 verified preserved: zero edits to `TensorSymbolNode` / `computeContraction` / `src/bridges/equations/`). 12 public symbols.
  - **P5** (ahead of v0.8 target) — `RegimeType` extension system (`src/core/regime-registry.ts`, `regimes-builtins.ts`, `regime-rule-install.ts`): `defineRegime` + 6 per-axis convenience APIs + lookup helpers + 18 v0.6 built-ins pre-registered. Sibling-registry pattern for `attachRegimesToCell` (per Adam-M1: avoids breaking P3 surface + adapter round-trip). `FluxRuleKind` extended with `'regime-consistency'` (per Eve-M2 union extension); rule body installed via registered-callable pattern (avoids circular import). `RegimeCollisionError` with idempotent re-registration. 16 public symbols.
  - **P8** (ahead of v0.9 target) — Bridge Parameter AD (`src/diff/bridge-gradient.ts`, `bridge-specs.ts`): `bridgeGradient(spec, engine, params)` async wrapper over `MathTSEngine.reverseGrad`; 4 differentiable bridge specs (BE-11, BE-37, BE-42, BE-52) using verified struct-arg signatures (per Eve M1-M3 reconciliation). `gradientToNamed` unpack helper. Graceful degradation via `EngineCapabilityError`. **Honest scope** (per Adam-H1): `node_modules/@danielsimonjr/` empty in sandboxed dev env (`npm install --include=optional` was no-op against registry-less env); real-AD tests `describe.skipIf(true)`-marked, run on consumer envs with peer installed. `Float64ReferenceEngine` AD-tracing limitation documented (dual-numbers can't trace plain-JS bridge math). 7 public symbols.
  - **P6 Phase A** (research-track, docs-only per Adam-F2) — Bridge Composition spec at `docs/specification/Part-IX-Composition.md` (avoiding Part-VII collision per Eve-E2). Defines composition as numerical-cascade primary + categorical secondary (Decision #1). Names C1-C5 calibration set for Phase B (BE-IDs verified). Open-Questions doc with 5 questions for Phase B (Q1 surface, Q2 tolerance, Q3 flux interaction, Q4 identity, Q5 v1.0 escalation). Adam+Eve review-findings doc. Phase A optional `src/composition/` prototype DEFERRED — existing bridge evaluators have ad-hoc TS return shapes with no shared `Observable` contract; translation-layer design IS Phase B's deliverable.
  - **Session totals**: 1675 → **1853 passed (+178 net new tests)**, 0 failed, 2 skipped (P8 real-AD), 1 todo. 11 new test files, 10 new source files, 9 new docs. Public surface: +44 symbols. 6 Adam+Eve adversarial-review cycles (1 redraft on P2). Opus-subagent stand-ins per session pragma (Gemini/OpenAI MCP tools unavailable). HEAD `9fa940f`.
  - **Tag strategy (user's call)** — three options laid out in `CHANGELOG.md`:
    1. Single v0.7.0 (everything in one release).
    2. Split v0.7.0 (P3+P2+P1) / v0.8.0 (P5 + P6 Phase A) / v0.9.0-alpha (P8, alpha while autograd-peer CI install is documented).
    3. Some other partitioning.
- **v0.6.1** (2026-05-23, on branch `claude/changelog-todo-sync-9PdMg` — tag PENDING) — Minimize / Simplify / Optimize sprint. Six phases (0→3→1→2→5→4 explicit order per Adam+Eve adversarial-review fix). 21 commits. Suite: **1675 passed / 0 failed / 1 skipped / 1 todo** (recovered from a 1672/5-failed master state via Phase 0 cleanup). Highlights: **24 internal-only exports dropped** (bucket-(a)) + **6 `@public` JSDoc tags added** (bucket-(b')) per the v0.6.1-baseline.md per-symbol classification; **`validator.ts` 816→715 LOC** (-101) via new `validator-registry.ts` 3-pattern discriminated-union dispatch; **`lowering.ts` 1015→903 LOC** (-112) via `lowerBianchiResidual` + `lowerWeylTensor` extraction into `curvature-lowering-helpers.ts`; **dep-graph generator** now consumes test imports + parses `package.json exports` field (unused-files 44→2, both intentional ambient .d.ts); **three bench harnesses landed** (PO-1 gl4-picard-alloc, PO-2 ricci-lowering, PD-grid pderiv — carry-forward from v0.5.1's deferred Phase 7); **five pre-existing test failures fixed** (mathts-engine test-file gating × 2, stale 0.5.x version regex, BE-33 formula-latex assertion, missing spec-date marker) + lockfile resync. Adam+Eve adversarial review (Opus subagent fallback per v0.5.1 carry-forward — no llm-gemini/llm-openai MCPs in remote-execution env) caught 3 critical issues before plan-drafting (S1 test-importer misclassification, S2 validator-registry 3-pattern not 2, S3 dep-graph generator semantics). Eve fabrication rate 1/13 (vs v0.5.1's 5/9 baseline). New `mathts-tensor.ambient.d.ts` mirrors v0.5.1 TS-4 precedent for autograd. `npm publish` still blocked on expired `NPM_TOKEN` (carried from v0.6.0). Detail: `docs/planning/v0.6.1-Design.md`, `docs/planning/v0.6.1-Review-Findings.md`, `docs/architecture/v0.6.1-baseline.md`.
- **v0.6.0** (2026-05-20) — Einstein field equation closure + curvature classification + Shapiro investigation. 36 tasks across 4 phases. Killing-vector conserved-charge machinery (`KillingVectorNode`, `ConservedChargeNode`, `verifyKillingEquation`); Einstein field equation now structurally encodable (`StressEnergyTensorNode`, `CosmologicalConstantNode`, `EinsteinFieldEquationNode`) — closes BE-17's "cannot be encoded" docstring gap; Weyl tensor + Kretschmann scalar completing the curvature-classification surface; `CurvatureCompositeNode<K,S>` factory (PD-6 trigger fired on Weyl as 5th curvature primitive). BREAKING: `christoffelFn` returns `Float64Array(64)` (BR-2, 5-6× RK4 speedup); `pderivNumericalFn` default order flipped 2→4 (FD-flip). **PC-1.5 finding**: integrator cleared as Shapiro residual suspect via bit-exact Killing-charge conservation; remaining suspects are null-IC noise + affine-parameter mismatch (documented, deferred per Decision #8). Suite 1693 passed, 179 files. Tag `v0.6.0` at commit `ac0cf06`; `master` since advanced with post-ship maintenance (HEAD `b814a71` at last todo update). **npm publish PENDING — blocked on expired `NPM_TOKEN` (see Active queue); registry still at `0.5.1` until the token is rotated.** **Post-ship maintenance (2026-05-20):** documentation-integrity review (8-batch opus+sonnet team, RLM + honest-claude skills, 63 findings) + 4-phase doc refresh — README was 6 releases stale, 5 architecture docs 2 releases stale, spec catalog count 40→42, all sub-READMEs refreshed; master report `docs/architecture/v0.6.0-doc-integrity-review.md`. Separately, BE-33 Hertz-Millis finite-T exponent corrected `-ν/z → -1/z` + 42-bridge Adam+Eve physics-correctness audit landed (`docs/architecture/BRIDGE-PHYSICS-AUDIT.md`).
- **v0.5.1** (2026-05-19) — Stability/hygiene patch on v0.5.0 GR foundations. 22 task commits across 8 phases. Constants canonicalization (new `src/core/constants.ts` flat exports); diagnostic propagation (`scanForMetricPair` walks v0.5.0 curvature kinds); type-safety hardening (bianchiResidual 6× `any` → `import type`); test-coverage backfill (connection-validators ~250 LOC, fresh-label, flat-Minkowski curvature zero-tests, real Mercury N-orbit Picard); algorithmic dedup (contractRiemannJS, makeSchwarzschildContext); `pderiv.ts` opt-in 4th-order; 5 LC doc-vs-code skews; 7 zombie `it.todo` retired. **Honest framing: PC-1 hypothesis REFUTED** — BE-37 Shapiro residual stayed at 2.51e-4 after constants migration (not <1e-5 as audit predicted); root cause is integrator-driven (see `docs/planning/v0.6.0-Brainstorm.md` "PC-1.5 investigation"). Suite 1595/1597. npm: `universal-physics-tensor@0.5.1`. Tag `v0.5.1`, HEAD `bd98028`.
- **v0.5.0** (2026-05-18) — GR foundations. 25 tasks across 4 phases. GL4 symplectic integrator on canonical (x, p) state (Picard inner solver), bisection perihelion finder, curvature layer (RiemannTensorNode AST + ricci/einstein/bianchiResidual helpers). Both v0.4.0 `it.skip` debts cleared: BE-52 Mercury Δφ to relErr 1.77e-7 (10⁴× tighter than I6 target); BE-37 Shapiro to relErr 1.76e-4. Bridge validation sweep: BE-51/52 structural siblings + BE-17/20/45/46/50 physics anchors + 42-bridge catalog integrity test. Suite 1,554/1,563. npm: `universal-physics-tensor@0.5.0`. Tag `v0.5.0`, HEAD `e2c84b2`.

(Older releases — v0.4.6 and earlier — rolled off into `CHANGELOG.md` for historical record.)

---

## Deferred from prior releases

### From v0.4.0
- [x] ✅ **BE-52 Mercury perihelion geodesic cross-validation** — shipped Task 10 of v0.5.0. relErr 1.77e-7 (10⁴× tighter than ±2×10⁻³ target).
- [x] ✅ **BE-37 full Shapiro cross-check** via geodesic integration — shipped Tasks 11+12 of v0.5.0. relErr 1.76e-4.

### From v0.4.5
- [x] ✅ **Vitest 4.1.4 async-bench reporter limitation** — CLOSED 2026-05-23 (v0.7 follow-up). Bumped vitest 4.1.4 → 4.1.7 (commit `28f6f8b`). Re-running `bench/be37-eikonal.bench.ts` (the original v0.4.5 reporter-limitation case) at 4.1.7 confirms async benches now report the full per-bench hz table (e.g., `evaluateBE37EikonalNumerical 4,258.52 hz` with p75/p99/p995/p999 distribution; covariant-eikonal `2.18 hz`). The "watch for 4.2+" note resolved at 4.1.x patch. **Fourth stale carry-forward in this session** (after PC-1.5, AS-3, BE-module exports).

### From v0.4.6
- (None — all 32 audit findings landed)

### From v0.5.0
- [x] ✅ **`c` constant canonicalization** — shipped v0.5.1 Theme A (Tasks 0-4). New `src/core/constants.ts`. **BUT PC-1 hypothesis REFUTED**: BE-37 Shapiro residual still 2.51e-4 (not <1e-5 as predicted). Real cause is integrator-driven — see `docs/planning/v0.6.0-Brainstorm.md` "PC-1.5 investigation".
- [x] ✅ **`schwarzschildRiemannFn` fixture is COMPLETE** — CLOSED 2026-05-25 via post-v0.7.0 audit (HonestClaude + RLM verification pass). Original todo claim "8 of 256 entries populated" was stale by an OOM (v0.5.0-era count). Current state per `tests/fixtures/schwarzschild.ts:297` docstring: **12 independent physical values × 2 (antisymmetric partner) = 24 non-zero entries** — the mathematically complete set for Schwarzschild coordinate-basis mixed-index Riemann, with Carroll *Spacetime and Geometry* App. B + Hartle *Gravity* Ch. 9 textbook citations confirming canonicity. No additional consumer needs identified.
- [x] ✅ **Plan/design Ricci-slot bug** — annotated v0.5.0-Implementation-Plan.md with post-S1 addendum in v0.5.1 (Task PD-3/LC-2).
- [x] ✅ **GL4_LONG=1 Mercury 100-orbit Picard-convergence test** — wired in v0.5.1 Task 17 (PD-4). `solveGL4Stage` has iteration counter; gated test asserts `failureFraction < 0.001`. Default 20-orbit (~6 min); `GL4_LONG_ORBITS=100 GL4_LONG=1` for release-prep.

### From v0.5.1
- [x] ✅ **PC-1.5 investigation** — CLOSED 2026-05-23 (v0.7 session). Step-count sweep (2048/4096/8192) shows BE-37 Shapiro relErr at **~2.3e-8** — 4 orders of magnitude tighter than the carried-forward 2.51e-4 number. Non-monotone in step count → FP arithmetic floor, not integrator truncation. Improvement was a side effect of v0.6.0's BR-2 christoffelFn → Float64Array(64) migration (`5c786cc`) that was never re-measured end-to-end at the time. Findings doc: `docs/architecture/v0.7-pc15-shapiro-floor.md`. Smoke gate at `tests/numerical/be37-shapiro-step-sweep.test.ts` asserts relErr stays in `[1e-10, 1e-6]` band; long-run sweep gated behind `GL4_LONG=1`.
- [x] ✅ **BR-2 carry-forward**: `christoffelFn` nested-array → `Float64Array(64)` flat — shipped v0.6.0 Phase 2 (BREAKING, 5-6× RK4 speedup). Carry-forward closed.
- [x] ✅ **AS-3 `schwarzschildPin` helper** — AUDITED 2026-05-23 (v0.7 follow-up), closed WON'T-DO. The v0.5.1 estimate ("~65 invocation sites") was stale by an order of magnitude. Actual count via `grep -rnE "Fn\(M[a-zA-Z0-9_]*\)\(\[" tests/` is **8 sites** total. At that count the inline `schwarzschildFn(M)([0, r, PI_2, 0])` pattern is clearer than a `schwarzschildPin(M, r).dgInverse` abstraction; helper is overkill. Stale-claim audit: another instance of the pattern PC-1.5 surfaced (carry-forward numbers re-verify at HEAD).
- [x] ✅ **Bench harnesses (PO-1, PO-2, PD-grid)** — shipped v0.6.1 Phase 5 (2026-05-23, commit `48a7bb1`). All three files landed: `bench/gl4-picard-alloc.bench.ts`, `bench/ricci-lowering.bench.ts`, `bench/pderiv-grid.bench.ts`. Per Decision #5 of the v0.6.1 design, informational-only (no threshold gates) — baselines in `docs/architecture/benchmarks.md` v0.6.1 section. Findings: Ricci contraction is essentially free vs FD-Riemann (1.01× ratio); order=4 pderiv is 2.41× slower than order=2 (acceptable tradeoff for ~10⁴× truncation reduction).

### From v0.6.0
- [x] ✅ **PC-1.5 follow-up** — CLOSED 2026-05-23 (v0.7 session). See v0.5.1-deferred entry above + `docs/architecture/v0.7-pc15-shapiro-floor.md`. The v0.6.0 BR-2 christoffelFn refactor silently resolved the residual; HEAD measurement shows ~2.3e-8 relErr (FP floor), not 2.51e-4. Decision #8's "measure-and-document, not measure-and-fix" held — measurement was the entire work; no code path modified.
- [x] ✅ **Near-horizon Kretschmann** — CLOSED 2026-05-23 (v0.7 follow-up). Painlevé-Gullstrand implementation shipped: `src/numerical/painleve-gullstrand-metric.ts` (closed-form PG metric + inverse; ~120 LOC). The architectural question dissolved during implementation — `computeKretschmann` is already coordinate-agnostic (takes raw arrays); the existing FD pipeline (christoffelAt + dGammaAt + buildRiemann from curvature-lowering-helpers.ts) assembles Riemann from any metric fn supplied. PG is the only new code at the engine level. Single test file (`tests/numerical/painleve-gullstrand-curvature.test.ts`, 9 tests across 2 describe blocks) covers far-field/mid-range/near-horizon/AT-horizon/inside-horizon Kretschmann + metric-inverse identity + asymptotic flatness. Original design-note scope (~600 LOC across 4 files) over-estimated; actual ~300 LOC. Per the v0.7 stale-carry-forward pattern, even the design-note estimates need rechecking.
- [x] ✅ **`TensorEquationNode<LHS,RHS>` Phase 0 + Phase 1** — Phase 0 SHIPPED 2026-05-23 (commit `5cd860a`, helper extraction + 25 unit tests). Phase 1 SHIPPED 2026-05-23 (this round): `KleinGordonEquationNode` for `(□+m²)φ = J` as the first new field-equation demonstrator. Uses all 3 field-equation-helpers per the design pattern; validator body is THIN (~30-40 LOC) vs the ~80 LOC of pre-extraction `validateEinsteinFieldEquation`. 9 KG tests + the existing EFE tests both stay green (error-keyword vocabulary `"index label"` / `"dimension"` / `"symmetry"` pinned across the helper extraction). Suite 1888 → 1897 (+9).
- [ ] **Kretschmann O(4⁸) symmetry optimization** (P-6) — current `computeKretschmann` evaluates all 256² = 65536 `W_{αβγδ} W^{αβγδ}` pairs; Weyl symmetries reduce the independent count substantially. Deferred; correctness gates pass at current cost.
- [x] ✅ **Catalog extension — BE-53 + BE-54** (2026-05-24, parallel-agent dispatch sibling to the BE-X re-encoding sprint):
  - **BE-53 Yang-Mills one-loop β-function** (sonnet, commits `bedd385` + `acae340`): structural dual of BE-39's NGFP via the same `BetaFunctionNode` primitive (asymptotic-freedom UV-FP at g*=0). QCD value b₀=7 pinned; pure SU(3) b₀=11; asymptotic-freedom boundary at N_f≈16.5 (SU(3)). Status: `'established'` (Nobel 2004). +32 tests.
  - **BE-54 Randall-Sundrum brane cosmology** (sonnet, commits `0ef5253` + `c400185` + my follow-up `b8153f6`): exercises BE-19's `FriedmannEquationNode` `'brane'` variant slot. Brane-tension correction `(1+ρ/(2σ))` is dimensionless; correction=3/2 at ρ=σ; H²≥0 always. Status: `'speculative'` (real framework, experimentally unconstrained). +32 tests (incl. 7 from the structural follow-up I added when the agent's worktree was too stale to see `friedmann-equation.ts`).
  - 5 catalog-length-pin conflicts resolved cleanly during cherry-pick (BE-53 worktree forked from `ccda66a`, BE-54 from `fb7ff8b`; both bumped 42 → 43 from their fork-points; resolved manually to 44).
  - Suite: 2017 → 2056 (+39). Catalog now **44 entries** (40 original + BE-51/52/53/54 post-spec extensions).
  - Pattern observation: agent worktree fork-points vary by launch time. Pre-flight `git merge-base` check helps surface but doesn't fix the issue; the harness creates worktrees from a non-current point. **Recommended for next parallel dispatch**: have agents do `git pull origin claude/changelog-todo-sync-9PdMg` + `git rebase` as the FIRST step if their worktree HEAD doesn't match `origin/...HEAD`.
- [x] ✅ **Bridges assessed but NOT re-encoded in v0.6.0 — ALL 4 SHIPPED 2026-05-24** via parallel-agent dispatch (2× sonnet, 2× opus, isolated worktrees). Per `docs/architecture/v0.7-be-x-reencoding-design-note.md`. Each agent ran independently; cherry-picked back onto the main branch with zero conflicts. Per-bridge results:
  - **BE-13 Einstein-trace** (sonnet, commits `55a59af` + `f57fad5`): `TensorTraceNode` + `TracableTensorNode` structural-interface input (mirrors Klein-Gordon's ScalarFieldNode pattern); `BE13_T_TRACE_NODE` additive-new-export. +20 tests.
  - **BE-19 quantum-bounce** (opus, commits `5ebffa8` + `af27132`): `FriedmannEquationNode` with 5-variant discriminator (`classical | lqc | brane | dgp | massive`); `BE19_LQC_FRIEDMANN_STRUCTURAL` additive-new-export. +23 tests. Recommends Randall-Sundrum brane cosmology as next variant exerciser.
  - **BE-39 asymptotic-safety** (opus, commits `76afe1e` + `5e7e812`): `BetaFunctionNode` + `RGCouplingNode`; `BE39_BETA_G_STRUCTURAL` + `BE39_BETA_LAMBDA_STRUCTURAL` additive-new-exports. +28 tests. **Honest deviation**: agent's worktree forked from pre-v0.7 baseline (b67481b); improvised against `einstein-equation.ts` instead of `field-equation-helpers.ts`. Functional output correct; future cleanup migrates to helpers pattern. Recommends BE-26 Yang-Mills β-function as next RG entry.
  - **BE-50 Wheeler-Feynman** (sonnet, commits `3860d7b` + `e8d3df0`): `GaugeFieldNode` + `TimeSymmetryPredicateNode` with `arrowOfTime` discriminator; `BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL` additive-new-export. +24 tests.
  All used additive-new-export strategy — legacy AST exports unchanged; legacy tests untouched. Net suite: 1897 → 1992 (+95). Lessons-log entry: verify `git merge-base` of worktree branches BEFORE agent starts (BE-39 surfaced this — its worktree forked from master not the working branch).
- [x] ✅ **Dev-dep updates — VALIDATED + SHIPPED as v0.7.1** (2026-05-25). `npm install --include=optional` refreshed `@types/node` 24.12.2 → 25.9.1, `typescript` 5.9.3 → 6.0.3, `vitest` 4.1.4 → 4.1.7. Full suite re-validated under the new toolchain (2103/0/5/1 — no regressions). `dist/` rebuilt with TS 6.0.3 (v0.7.0's dist/ was TS-5.9-compiled despite the `^6.0.3` declaration). Tag `v0.7.1` at `438db4c`; npm registry now at 0.7.1; GitHub release at <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.1>.
- [x] ✅ **Fix `typed-function` EOVERRIDE blocker** — CLOSED 2026-05-25 (typed-function commit `5711dab` pushed to origin/develop; surfaced and fixed during v0.7.1 dev-dep validation). MathTS optional-peer chain now installs cleanly in UPT. Surfaced latent MathTSEngine integration bugs that v0.7.2 then fixed — see `## Latest shipped` for full disposition.

### From v0.6.1 (2026-05-23)
- [x] ✅ **`it.todo` cleanup pass** — AUDITED 2026-05-23 (v0.7 follow-up). 11 references checked: **4 real skip/todo lines, all intentional and documented** (3 × `describe.skip` for optional-dep absent in mathts-engine-typing / engine-conformance × 2; 1 × `it.todo` in catalog-integrity.test.ts:137 pinning the BE-42 "N/A as currently encoded" placeholder). **7 comment-references, all useful historical narrative** (gl4-integrator GL4_LONG gating note; the new be37-shapiro-step-sweep gate; covariant-eikonal-real test geometry-deviation rationale citing Task 11 history; perihelion-precession v0.4.0 reactivation note; tensor-spec-vs-impl drift-guard pattern docs; tensor-symbol v0.5.1 PD-9 cleanup banner; covariant-derivative-preview v0.3.5 reactivation note). No zombie `it.todo()` calls found; no code changes needed.
- [x] ✅ **Newly-surfaced BE-module internal exports** — TRIAGED 2026-05-23 (v0.7 follow-up). Re-running `npm run docs:deps` at HEAD found **61 unused BE-module exports** (not the v0.6.1 estimate of "~85" — 40% inflation, same stale-carry-forward pattern as PC-1.5 and AS-3). Applied bucket-(a) drops to **20 confirmed-no-external-consumer constants/functions** across 14 files (11× `*_LHS` AST builders, 2× `*_FIELD`, 1× `*_CONSTANT`, 1× `*_DIM`, 1× `BE37_TWO`, 3× `validate*Dimensions`, 1× extra `*_LHS`). The remaining **44 `*Inputs` interfaces** are bucket-(a') deferred to a future `@internal`-tag annotation pass (rationale: future-promotion path, test ergonomics, naming-discriminator signal — see audit doc). Build clean, suite unchanged. Audit doc: `docs/architecture/v0.7-be-module-exports-audit.md`.
- [x] ✅ **`lowering.ts` LOC target** — CLOSED 2026-05-23 (v0.7 follow-up, commit `1ce7dc3`). Extracted `tensor-partial-derivative` + `covariant-derivative` arms (~298 LOC) into new `src/numerical/derivative-lowering.ts` (341 LOC) + `src/numerical/lowering-utils.ts` (72 LOC). Track-B's medium-risk forward-import concern resolved via thunk pattern (`recur: LowerNodeRecur` parameter). `lowering.ts` 903 → 597 LOC (beat the ≤890 target by 293). Suite + build unchanged.

### From v0.6.0 doc-integrity review (2026-05-20)
- [x] ✅ **C-9 dep-graph generator bug** — FIXED 2026-05-20. The `create-dependency-graph` tool was vendored into `tools/create-dependency-graph/` (from the `memoryjs` sister repo); the comment-as-symbol leak (source-comment text in multi-line `export {…} from` blocks bleeding into re-export symbol rows) was fixed in-tree via `stripBraceBlockComments`/`splitBraceSymbols`. `DEPENDENCY_GRAPH.md` regenerated clean — the stale "C-9 unfixed" banner is gone. Run `npm run docs:deps` to regenerate.
- [ ] **BRIDGE-PHYSICS-AUDIT.md per-bridge follow-ups** — the 42-bridge Adam+Eve physics audit flagged ~19 contested framings + several questionable `dimensional_signature` tags. **v0.7 follow-up FULL DISPOSITION (2026-05-23 + 2026-05-24)**:
      - ✅ Audit §1 `encoded_form` field added to BridgeEquationEntry + applied to BE-13/47/48 (commit `3ad5404`).
      - ✅ Audit §3 unknown↔unknown bridge naming applied (commit `e9e870c`): 17 renamed + 9 NOT-A-BRIDGE classified per the user-approved proposals doc.
      - ✅ Audit §5 status recalibration applied (commit `9d2c20c`): 1 status flip (BE-14 demoted) + 3 audit-considered notes footnotes (BE-16/29/40) + 1 deferral (BE-34 coupled to Boltzmann dispute).
      - ✅ Audit §4 BE-34 Boltzmann factor: notes-only audit-followup documenting the non-canonical extension (commit `e9e870c`).
      - ✅ BE-33 (`−ν/z` → `−1/z`) literature check: discovered already-corrected on 2026-05-20 (7th stale carry-forward).
      - ✅ **BRIDGE-PHYSICS-AUDIT v2 shipped 2026-05-24** (`docs/architecture/BRIDGE-PHYSICS-AUDIT-v2.md`, commits `77cd02e` Adam + Eve append): parallel Adam+Eve opus reviewers against the post-v0.7 catalog state (now 44 bridges with BE-53/54 extensions). 5 actionable findings from Adam + 13 gap findings from Eve. Highest-priority v2 findings closed in same commit cycle:
        - ✅ **Eve-E1** (silent test-coverage gap — `EXPECTED_DIMENSION_BY_BRIDGE` didn't register BE-53/54; verification test still pinned `.toBe(40)` and iterated ids 11-50 only) FIXED commit `e2ae944` — added [53, DIMENSIONLESS] + [54, T_INV2]; test now expects 42 with extended id range.
        - ✅ **Eve-E13** (pre-tag stale pins — `1854` references in pre-tag-flow docs while HEAD is 2056) FIXED commit `e2ae944` — refreshed `v0.7-release-preflight-log.md` + `v0.7-release-notes-draft.md` to HEAD counts.
      - ✅ **Adam-MEDIUM `encoded_form` mass-population** SHIPPED 2026-05-24 (commit `6fcf9fd`): applied to 12 of the 13 candidates (BE-17/18/20/21/27/29/32/35/36/44/46/50). BE-42 explicitly skipped (its AST encodes T_H scalar directly with no reduction; its NOT-A-BRIDGE reclassification is a separate Adam-HIGH finding still deferred). Catalog now has 15 of 44 entries with `encoded_form` set (BE-13/47/48 from prior + 12 new).
      - ⏸ **Deferred to user physics-judgment session (v0.8)**:
        - Adam-HIGH BE-42 Hawking T NOT-A-BRIDGE reversal: Adam argues it's the archetypal quantum↔gravity bridge (contains ℏ + G); Adam himself flagged for Eve-perspective second opinion before applying.
        - Adam-MEDIUM BE-29 Jarzynski NOT-A-BRIDGE reconsider: similar single-reviewer concern as BE-42.
        - Eve-E8 marginal BE-22/31 rename review.
        - ✅ Eve-E10 BE-54 arXiv refs CLOSED 2026-05-25 (commit `014fe03`). User-confirmed via PDF (sandbox blocks arxiv.org outbound): the citation paired `arXiv:hep-ph/9905221` (RS-I "A Large Mass Hierarchy…" PRL 83:3370) with PRL 83:4690 (which is actually RS-II "An Alternative to Compactification", `arXiv:hep-th/9906064`). BE-54 encodes the RS-II single-brane model per docstring line 11 — fixed arXiv ID + added title. Other two refs (BDEL `hep-th/9910219`; Maartens-Koyama review `1004.3962`) unverified but format-plausible.
        - Eve-E2-E6 stale carry-forward in 4 historical docs (be-module-exports-audit, etc. — historical records, low-priority refresh).
        - Eve-E9 consolidate stale-carry-forward retrospective into one v0.8 doc.

---

## Conventions

### Repo state
- **UPT repo**: `~/Dropbox/Github/universal-physics-tensor`, branch `master` (NOT `main`). Direct-push workflow, no PR flow.
- **MathTS sister repo**: `~/Dropbox/Github/Mathts`, branch `main`. Houses `@danielsimonjr/mathts-tensor` and `@danielsimonjr/mathts-autograd`. Both published to npm.
- **npm publish on Windows**: use `npm publish --ignore-scripts --access public` to bypass the slow `prepublishOnly` hook (vitest startup on Windows ~3-5 min; the suite is verified at every task commit, so re-running it at publish time is redundant).
- **NPM_TOKEN**: stored at Windows User-level env var. `~/.npmrc` and `~/Dropbox/Github/Mathts/.npmrc` use `${NPM_TOKEN}` interpolation. Token rotation: regenerate at https://www.npmjs.com/settings/danielsimonjr/tokens, then `[Environment]::SetEnvironmentVariable('NPM_TOKEN', '<new>', 'User')`.

### Plan + audit doc locations
- `docs/planning/v0.X.Y-Design.md` — design (per brainstorming skill)
- `docs/planning/v0.X.Y-Implementation-Plan.md` — implementation plan (per writing-plans skill)
- `docs/planning/v0.X.Y-Review-Findings.md` — Adam+Eve adversarial review findings
- `docs/architecture/` — auto-generated dependency graph + hand-written architecture docs + per-release audit reports (e.g., `v0.4.6-minimize-targets.md`, `bridge-coverage-audit.md`)

### Reasoning tier
- For UPT specifically, **Adam (Gemini 2.5 Pro) + Eve (OpenAI o3)** are the default review-tier models. Invoke liberally on design review, adversarial cross-check, physics-correctness verification.
- MCP llm-tools are TEXT-ONLY — inline source content into the `prompt` string when asking Adam/Eve to verify code claims.

### Vendored audit tooling (in-tree since v0.6.0 maintenance)
Re-runnable codebase analysis via the in-tree `tools/` directory.
The dep-graph generator was vendored from the memoryjs sister repo in
commit `384db01` (v0.6.0 post-ship maintenance); v0.6.1 Phase 3 then
taught its `detectUnused` to consume test-file imports and to parse
`package.json` `exports` for subpath reachability.

```bash
# Regenerate the dependency graph + unused analysis + test-coverage report.
# v0.6.1: docs:deps now passes --include-tests by default.
npm run docs:deps

# Scan plan docs for stale/unchecked checkboxes.
npm run audit:plans
```

Re-run before any future minimize/audit/refactor release.

### Plan-template imperfections (known pattern)
Plan-writing subagents produce illustrative inline test templates that often have wrong tensor-input formats / wrong AST node kinds / wrong method names. Implementers at execution time MUST cross-check against existing fixtures and correct as needed; honest deviation documented in commit message. Examples from v0.4.5/v0.4.6: incorrect nested-array shapes in covariant-derivative tests, `op:'*'` vs `kind:'tensor-product'`, `evaluateNumericalRaw` claim to bypass `validate()` (it doesn't), wrong method names (`f64.mul` vs actual). Pre-execution verification gates on risky tasks are the systemic mitigation — the v0.5.0 plan has these on Tasks 0, 3, 6, 7, 10, 12.

### Adam+Eve review process for design and plan docs
Both design AND plan get adversarial-reviewed. For v0.5.0: design caught 19 findings (notably the Ruth-4-not-symplectic-on-non-separable-Hamiltonian showstopper that Adam missed but Eve caught); plan caught 25 MORE findings including the ricci-slot reintroduction (plan-writing reintroduced a bug the design had fixed) and the Picard-masquerading-as-Newton showstopper. **Never assume the plan inherits the design's fixes** — review the plan independently.

### Numeric claims in todo entries decay faster than checkbox state

A todo that says "fix the bug" stays accurate until the bug is fixed. A todo that says "fix the 65 sites where X happens" becomes increasingly fictional as the codebase evolves — refactors merge sites, deletions remove them, additions inflate them. **Every silent-staleness finding so far has been a numeric drift**, not a forgotten checkbox:

| Carry-forward | Stated number | Actual at re-measurement | Drift |
|---|---|---|---|
| PC-1.5 Shapiro residual | 2.51e-4 | 2.28e-8 | 4 OOM (3 releases stale) |
| AS-3 `schwarzschildPin` sites | ~65 | 8 | 1 OOM |
| BE-module unused exports | ~85 | 61 | 40% inflated |
| `schwarzschildRiemannFn` populated entries | 8 of 256 | 24 of 256 (mathematically complete) | 1 OOM |
| Unknown↔unknown bridge count | ~9 | 26 | 3× |
| Near-horizon Kretschmann scope | ~600 LOC across 4 files | ~300 LOC | 2× over |

**Convention**: when a todo entry cites a number, suffix it with the date the number was measured, e.g., *"65 sites (as of 2026-05-19)"*. This signals to future readers that the number is a snapshot, not a live measurement, and re-checking at HEAD is the first action before treating the number as work scope.

This applies to: counts of files/sites/symbols/tests, performance numbers (residuals, speedups, LOC budgets), and any other claim that would be invalidated by an unrelated refactor. It does NOT need to apply to canonical/fixed constants (e.g., "42-bridge catalog" is a structural cardinality, not a measurement).

**Re-baseline trigger**: before scoping any work whose effort estimate depends on a cited number, re-run the producing tool (`grep`, `npm run docs:deps`, `wc -l`, bench harness) at HEAD. If the number drifts by more than ~20%, update the todo entry's date suffix in the same commit that closes or re-scopes the item.

### How to update this file
- When a task completes: flip `[ ]` → `[x]` AND move it to the "Latest shipped" section if it represents a release
- When a new task is identified: add it to the appropriate section (active queue / deferred)
- Keep the "Latest shipped" section to 3-5 entries; older releases roll off into `CHANGELOG.md` for historical record
- Commit this file alongside the work it tracks (it's NOT in `.gitignore`)

---

## Post-v0.7 horizon (notes only, no commitments)

- **v0.7+ proposal set** in `docs/planning/UPT v0.70 - Proposals.md` (2026-05-22) — 8 proposals grounded in the MathTS CHANGELOG. **Status (2026-05-23 session):**
  - P1 (Intelligent Index): ✓ SHIPPED on v0.7-series branch
  - P2 (Sparse semantic catalog): ✓ SHIPPED on v0.7-series branch
  - P3 (Typed L+B+E): ✓ SHIPPED on v0.7-series branch
  - P4 (Bridge DSL): BLOCKED on `mathts-expression` peer install
  - P5 (`RegimeType`): ✓ SHIPPED ahead of v0.8 target
  - P6 (Bridge composition): **Phase A shipped** as docs-only research spec (`Part-IX-Composition.md`); Phases B/C/D are v0.9α / v0.9β / v1.0
  - P7 (Workbooks): BLOCKED on `mathts-workbook` peer install
  - P8 (Bridge param AD): ✓ SHIPPED ahead of v0.9 target (real-AD tests skip-marked pending CI peer install)
- **P6 Phase B** (v0.9α calibration) — five open questions in `docs/planning/v0.7-Proposal-6-PhaseA-Open-Questions.md` (Q1 composition surface, Q2 tolerance, Q3 flux interaction, Q4 identity, Q5 v1.0 escalation) need Phase B answers before opening `src/composition/` code.
- **P8 real-AD test enablement** — when CI installs `@danielsimonjr/mathts-autograd` (the optional peer), remove `.skipIf(true)` in `tests/diff/bridge-gradient.test.ts` and add AD-vs-analytic gradient assertions per the v0.9 design's Phase 2 spec.
- **P5 closed-taxonomy follow-up** — v0.9 per-bridge physics review to decide which new physics regimes (classical-mechanics, QFT, GR, cosmology, condensed-matter, statistical-mechanics, information-theoretic, …) to add as built-ins beyond the 18 v0.6-shipped values. Per P5 Decision #1 (research task, not engineering).
- Faraday-tensor mixed-component-dim BREAKING refactor (3 nodes affected per Part-VIII §VIII.10)
- Browser float32 `TensorEngine` impl
- threejs visualization bootstraps
- TensorJS v1.0: stable public API + numerical surface + declarative viz spec (north star)
