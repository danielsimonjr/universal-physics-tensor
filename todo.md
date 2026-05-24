# UPT TODO

Durable cross-session task tracker. Update this file as work progresses — checkboxes flip when tasks complete, items move between sections as state changes.

> The in-conversation task tracker (TaskCreate/TaskUpdate) is ephemeral. This file is the source of truth for "what's next" across sessions.

---

## Latest shipped

- **v0.7-series sprint** (2026-05-23, on branch `claude/changelog-todo-sync-9PdMg` — tag PENDING). **Six v0.7-series proposals shipped in one session**, stacked on the still-untagged v0.6.1 work:
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

## Active queue

- [ ] **🚧 v0.7-series tag strategy + push** — six proposals shipped
      on branch `claude/changelog-todo-sync-9PdMg` (commits
      `9fa940f` ← `060ce41` ← `5dbd2a8` ← `c6f9ae3` ← `3ca7d87`
      ← `489640f` ← ... back through v0.6.1). Three tag-split
      options laid out in `CHANGELOG.md` `[Unreleased]`:
      1. Single **v0.7.0** rolling everything (P3+P2+P1+P5+P8+P6-A).
      2. Split **v0.7.0** (P3+P2+P1 Foundation Consolidation) +
         **v0.8.0** (P5 + P6 Phase A Extension Surface) +
         **v0.9.0-alpha** (P8 Bridge AD; alpha until autograd-peer
         CI install documented).
      3. Some other partitioning.
      v0.6.1 was never tagged in isolation — it folds into whichever
      v0.7.x split the user picks. Pending: review branch, decide
      tag strategy, bump `package.json` (currently 0.6.0), commit +
      tag(s) + push tag(s).
- [ ] **🚧 v0.7 release pre-flight checks** (per CLAUDE.md release
      discipline): `npm audit` (expect 0 HIGH/CRITICAL), `npm
      outdated`, document dep-health snapshot in `CHANGELOG.md` under
      the chosen release header. Suite + build + smoke all green at
      branch HEAD (1853 / 0 / 2 skip / 1 todo, 188 test files).
- [ ] **🚧 v0.6.1 tag + push** (subsumed by v0.7-series tag strategy
      above) — left here in case user wants v0.6.1 to ship
      independently before v0.7.x; otherwise close as superseded.
- [ ] **🚧 v0.6.0 npm publish — BLOCKED on expired `NPM_TOKEN`.** v0.6.0 is
      code-complete: all 36 tasks executed, suite 1693 green, build/smoke/audit
      clean, version bumped, committed (`ac0cf06`), tag `v0.6.0` created and
      pushed, `master` pushed to GitHub. The final `npm publish
      --ignore-scripts --access public` returned **404 on PUT** (npm's
      signature for invalid auth on an existing package); `npm whoami` →
      **401 Unauthorized**. The `NPM_TOKEN` env var is set (40 chars) but the
      token is expired/revoked. **Resolution (user action — token rotation is
      not automatable):**
      1. Regenerate at <https://www.npmjs.com/settings/danielsimonjr/tokens>
      2. `[Environment]::SetEnvironmentVariable('NPM_TOKEN', '<new>', 'User')`
      3. `npm publish --ignore-scripts --access public` (fresh shell, so the
         updated User env var is picked up), then `npm view
         universal-physics-tensor version` should report `0.6.0`.
      Nothing destructive occurred — registry still shows `0.5.1`; the tagged
      tree publishes cleanly once the token is valid.
- [ ] **GitHub release notes for v0.6.0 + v0.6.1** — draft from the
      `CHANGELOG.md` `[Unreleased]` section once the npm publish lands
      (or independently — both releases ship from the same `[Unreleased]`
      block).

(Completed `[x]` items previously listed here — v0.6.0 doc-integrity
review, BE-33 fix + bridge-physics audit, vendored tooling + C-9 fix,
UPT v0.70 proposals doc, all v0.6.1 sprint phases — are subsumed by
the v0.6.0 and v0.6.1 release entries in "Latest shipped" above and
the corresponding `CHANGELOG.md` `[Unreleased]` block. Removed here
to keep the queue focused on still-open work.)

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

## Deferred from prior releases

### From v0.4.0
- [x] ✅ **BE-52 Mercury perihelion geodesic cross-validation** — shipped Task 10 of v0.5.0. relErr 1.77e-7 (10⁴× tighter than ±2×10⁻³ target).
- [x] ✅ **BE-37 full Shapiro cross-check** via geodesic integration — shipped Tasks 11+12 of v0.5.0. relErr 1.76e-4.

### From v0.4.5
- [ ] **Vitest 4.1.4 async-bench reporter limitation** documented in `docs/architecture/benchmarks.md`. Per-bench hz tables not emitted for async benches; only BENCH Summary ratios. Watch for vitest 4.2+ which may fix this.

### From v0.4.6
- (None — all 32 audit findings landed)

### From v0.5.0
- [x] ✅ **`c` constant canonicalization** — shipped v0.5.1 Theme A (Tasks 0-4). New `src/core/constants.ts`. **BUT PC-1 hypothesis REFUTED**: BE-37 Shapiro residual still 2.51e-4 (not <1e-5 as predicted). Real cause is integrator-driven — see `docs/planning/v0.6.0-Brainstorm.md` "PC-1.5 investigation".
- [ ] **`schwarzschildRiemannFn` fixture is pragmatic-minimum** (8 of 256 entries populated). Deferred — out of v0.5.1 scope, carry to v0.6.0 if needed for new RiemannTensorNode consumers.
- [x] ✅ **Plan/design Ricci-slot bug** — annotated v0.5.0-Implementation-Plan.md with post-S1 addendum in v0.5.1 (Task PD-3/LC-2).
- [x] ✅ **GL4_LONG=1 Mercury 100-orbit Picard-convergence test** — wired in v0.5.1 Task 17 (PD-4). `solveGL4Stage` has iteration counter; gated test asserts `failureFraction < 0.001`. Default 20-orbit (~6 min); `GL4_LONG_ORBITS=100 GL4_LONG=1` for release-prep.

### From v0.5.1
- [x] ✅ **PC-1.5 investigation** — CLOSED 2026-05-23 (v0.7 session). Step-count sweep (2048/4096/8192) shows BE-37 Shapiro relErr at **~2.3e-8** — 4 orders of magnitude tighter than the carried-forward 2.51e-4 number. Non-monotone in step count → FP arithmetic floor, not integrator truncation. Improvement was a side effect of v0.6.0's BR-2 christoffelFn → Float64Array(64) migration (`5c786cc`) that was never re-measured end-to-end at the time. Findings doc: `docs/architecture/v0.7-pc15-shapiro-floor.md`. Smoke gate at `tests/numerical/be37-shapiro-step-sweep.test.ts` asserts relErr stays in `[1e-10, 1e-6]` band; long-run sweep gated behind `GL4_LONG=1`.
- [x] ✅ **BR-2 carry-forward**: `christoffelFn` nested-array → `Float64Array(64)` flat — shipped v0.6.0 Phase 2 (BREAKING, 5-6× RK4 speedup). Carry-forward closed.
- [ ] **AS-3 (optional)** test-side `schwarzschildPin` helper — deferred from v0.5.1; ~65 invocation sites of `schwarzschild*Fn(M)([0, 3*r_s, π/2, 0])` could collapse. v0.5.2 polish if needed.
- [x] ✅ **Bench harnesses (PO-1, PO-2, PD-grid)** — shipped v0.6.1 Phase 5 (2026-05-23, commit `48a7bb1`). All three files landed: `bench/gl4-picard-alloc.bench.ts`, `bench/ricci-lowering.bench.ts`, `bench/pderiv-grid.bench.ts`. Per Decision #5 of the v0.6.1 design, informational-only (no threshold gates) — baselines in `docs/architecture/benchmarks.md` v0.6.1 section. Findings: Ricci contraction is essentially free vs FD-Riemann (1.01× ratio); order=4 pderiv is 2.41× slower than order=2 (acceptable tradeoff for ~10⁴× truncation reduction).

### From v0.6.0
- [x] ✅ **PC-1.5 follow-up** — CLOSED 2026-05-23 (v0.7 session). See v0.5.1-deferred entry above + `docs/architecture/v0.7-pc15-shapiro-floor.md`. The v0.6.0 BR-2 christoffelFn refactor silently resolved the residual; HEAD measurement shows ~2.3e-8 relErr (FP floor), not 2.51e-4. Decision #8's "measure-and-document, not measure-and-fix" held — measurement was the entire work; no code path modified.
- [ ] **Near-horizon Kretschmann** — `computeKretschmann` near r=r_s requires Kruskal-Szekeres or Painlevé-Gullstrand coordinates; Schwarzschild coord system diverges. Deferred from v0.6.0 Phase 3 scope.
- [ ] **`TensorEquationNode<LHS,RHS>` generalization** (E-6) — a generic tensor-equation node that subsumes `EinsteinFieldEquationNode` and future field equations. Deferred; the EFE-specific node is sufficient for v0.6.0 use cases.
- [ ] **Kretschmann O(4⁸) symmetry optimization** (P-6) — current `computeKretschmann` evaluates all 256² = 65536 `W_{αβγδ} W^{αβγδ}` pairs; Weyl symmetries reduce the independent count substantially. Deferred; correctness gates pass at current cost.
- [ ] **Bridges assessed but NOT re-encoded in v0.6.0** (Task 4.3 honest-framing — no v0.6.0 primitive meaningfully applies):
  - **BE-13 Einstein-trace** — encodes the *scalar* trace `R = 4Λ − (8πG/c⁴)T` (post-contraction); `EinsteinFieldEquationNode` is a rank-2 *tensor*-equation predicate — structurally distinct, wrapping the scalar gives no gain.
  - **BE-19 quantum-bounce** — encodes the LQC modified Friedmann relation for `H²`; `KretschmannScalarNode` is a curvature-singularity diagnostic with no structural connection to the bounce equation.
  - **BE-39 asymptotic-safety** — β-functions are dimensionless polynomials in dimensionless RG couplings; `WeylTensorNode` is dimensionful `[L⁻²]` — no applicable primitive.
  - **BE-50 Wheeler-Feynman** — encodes a dimensionless gauge-field ratio; no v0.6.0 primitive applies.
  Re-encoding would need new primitives (a scalar-contraction node, an RG-flow node, etc.) — out of v0.6.0 scope. Status pins unchanged per Decision #9.
- [ ] **Dev-dep updates** — `@types/node` 24.12.4/25.x patch/major; `vitest` 4.1.7 patch; `typescript` 6.x major. All non-blocking; deferred at v0.6.0; deferred again in v0.6.1 (out of "hygiene only, no upgrades" scope). Next: a dedicated dep-bump release (v0.6.2 or v0.7.0 prep).

### From v0.6.1 (2026-05-23)
- [ ] **`it.todo` cleanup pass** — 11 `it.todo`/`it.skip`/`describe.skip` references in `tests/`. v0.6.1 Decision #8 explicitly out-of-scope (deferred). Worth a future pass: confirm each is intentional vs. forgotten; the 2 real-skip cases (GL4 long-run, AD-conformance optional-dep) are likely permanent, the other 9 are comment-references that could be deleted for clarity.
- [ ] **Newly-surfaced BE-module internal exports** — Phase 3's `detectUnused` fix surfaced ~85 previously-file-unused exports inside `src/bridges/equations/be-NN-*.ts` (`*_LHS` constants, `validate*Dimensions` functions, `*Inputs` interfaces). These were not in scope for v0.6.1 Phase 1 (which targeted only the original 79-symbol list). A future bridge-encoding-cleanup pass should triage them per the same (a)/(a')/(b) bucket policy. Detail in `docs/architecture/v0.6.1-baseline.md`.
- [ ] **`lowering.ts` LOC target slightly missed** — sprint goal was "≤890 LOC"; landed at 903 (13 over budget; under the 900 sprint-floor). Phase 2 Proposal 3 (extracting `tensor-partial-derivative` + `covariant-derivative` arms into a new `derivative-lowering.ts` module) is the path; deferred from v0.6.1 per the Track-B recon's medium-risk classification (recursive `lowerNode` call from the covariant-derivative arm requires forward-import or thunk).

### From v0.6.0 doc-integrity review (2026-05-20)
- [x] ✅ **C-9 dep-graph generator bug** — FIXED 2026-05-20. The `create-dependency-graph` tool was vendored into `tools/create-dependency-graph/` (from the `memoryjs` sister repo); the comment-as-symbol leak (source-comment text in multi-line `export {…} from` blocks bleeding into re-export symbol rows) was fixed in-tree via `stripBraceBlockComments`/`splitBraceSymbols`. `DEPENDENCY_GRAPH.md` regenerated clean — the stale "C-9 unfixed" banner is gone. Run `npm run docs:deps` to regenerate.
- [ ] **BRIDGE-PHYSICS-AUDIT.md per-bridge follow-ups** — the 42-bridge Adam+Eve physics audit flagged ~19 contested framings + several questionable `dimensional_signature` tags. Not yet triaged into per-bridge actions; a future bridge-correctness pass should work through the audit's verdict table.

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
