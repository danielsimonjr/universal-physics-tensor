# UPT TODO

Durable cross-session task tracker. Update this file as work progresses — checkboxes flip when tasks complete, items move between sections as state changes.

> The in-conversation task tracker (TaskCreate/TaskUpdate) is ephemeral. This file is the source of truth for "what's next" across sessions.

---

## Latest shipped

- **v0.6.1** (2026-05-23, on branch `claude/changelog-todo-sync-9PdMg` — tag PENDING) — Minimize / Simplify / Optimize sprint. Six phases (0→3→1→2→5→4 explicit order per Adam+Eve adversarial-review fix). 21 commits. Suite: **1675 passed / 0 failed / 1 skipped / 1 todo** (recovered from a 1672/5-failed master state via Phase 0 cleanup). Highlights: **24 internal-only exports dropped** (bucket-(a)) + **6 `@public` JSDoc tags added** (bucket-(b')) per the v0.6.1-baseline.md per-symbol classification; **`validator.ts` 816→715 LOC** (-101) via new `validator-registry.ts` 3-pattern discriminated-union dispatch; **`lowering.ts` 1015→903 LOC** (-112) via `lowerBianchiResidual` + `lowerWeylTensor` extraction into `curvature-lowering-helpers.ts`; **dep-graph generator** now consumes test imports + parses `package.json exports` field (unused-files 44→2, both intentional ambient .d.ts); **three bench harnesses landed** (PO-1 gl4-picard-alloc, PO-2 ricci-lowering, PD-grid pderiv — carry-forward from v0.5.1's deferred Phase 7); **five pre-existing test failures fixed** (mathts-engine test-file gating × 2, stale 0.5.x version regex, BE-33 formula-latex assertion, missing spec-date marker) + lockfile resync. Adam+Eve adversarial review (Opus subagent fallback per v0.5.1 carry-forward — no llm-gemini/llm-openai MCPs in remote-execution env) caught 3 critical issues before plan-drafting (S1 test-importer misclassification, S2 validator-registry 3-pattern not 2, S3 dep-graph generator semantics). Eve fabrication rate 1/13 (vs v0.5.1's 5/9 baseline). New `mathts-tensor.ambient.d.ts` mirrors v0.5.1 TS-4 precedent for autograd. `npm publish` still blocked on expired `NPM_TOKEN` (carried from v0.6.0). Detail: `docs/planning/v0.6.1-Design.md`, `docs/planning/v0.6.1-Review-Findings.md`, `docs/architecture/v0.6.1-baseline.md`.
- **v0.6.0** (2026-05-20) — Einstein field equation closure + curvature classification + Shapiro investigation. 36 tasks across 4 phases. Killing-vector conserved-charge machinery (`KillingVectorNode`, `ConservedChargeNode`, `verifyKillingEquation`); Einstein field equation now structurally encodable (`StressEnergyTensorNode`, `CosmologicalConstantNode`, `EinsteinFieldEquationNode`) — closes BE-17's "cannot be encoded" docstring gap; Weyl tensor + Kretschmann scalar completing the curvature-classification surface; `CurvatureCompositeNode<K,S>` factory (PD-6 trigger fired on Weyl as 5th curvature primitive). BREAKING: `christoffelFn` returns `Float64Array(64)` (BR-2, 5-6× RK4 speedup); `pderivNumericalFn` default order flipped 2→4 (FD-flip). **PC-1.5 finding**: integrator cleared as Shapiro residual suspect via bit-exact Killing-charge conservation; remaining suspects are null-IC noise + affine-parameter mismatch (documented, deferred per Decision #8). Suite 1693 passed, 179 files. Tag `v0.6.0` at commit `ac0cf06`; `master` since advanced with post-ship maintenance (HEAD `b814a71` at last todo update). **npm publish PENDING — blocked on expired `NPM_TOKEN` (see Active queue); registry still at `0.5.1` until the token is rotated.** **Post-ship maintenance (2026-05-20):** documentation-integrity review (8-batch opus+sonnet team, RLM + honest-claude skills, 63 findings) + 4-phase doc refresh — README was 6 releases stale, 5 architecture docs 2 releases stale, spec catalog count 40→42, all sub-READMEs refreshed; master report `docs/architecture/v0.6.0-doc-integrity-review.md`. Separately, BE-33 Hertz-Millis finite-T exponent corrected `-ν/z → -1/z` + 42-bridge Adam+Eve physics-correctness audit landed (`docs/architecture/BRIDGE-PHYSICS-AUDIT.md`).
- **v0.5.1** (2026-05-19) — Stability/hygiene patch on v0.5.0 GR foundations. 22 task commits across 8 phases. Constants canonicalization (new `src/core/constants.ts` flat exports); diagnostic propagation (`scanForMetricPair` walks v0.5.0 curvature kinds); type-safety hardening (bianchiResidual 6× `any` → `import type`); test-coverage backfill (connection-validators ~250 LOC, fresh-label, flat-Minkowski curvature zero-tests, real Mercury N-orbit Picard); algorithmic dedup (contractRiemannJS, makeSchwarzschildContext); `pderiv.ts` opt-in 4th-order; 5 LC doc-vs-code skews; 7 zombie `it.todo` retired. **Honest framing: PC-1 hypothesis REFUTED** — BE-37 Shapiro residual stayed at 2.51e-4 after constants migration (not <1e-5 as audit predicted); root cause is integrator-driven (see `docs/planning/v0.6.0-Brainstorm.md` "PC-1.5 investigation"). Suite 1595/1597. npm: `universal-physics-tensor@0.5.1`. Tag `v0.5.1`, HEAD `bd98028`.
- **v0.5.0** (2026-05-18) — GR foundations. 25 tasks across 4 phases. GL4 symplectic integrator on canonical (x, p) state (Picard inner solver), bisection perihelion finder, curvature layer (RiemannTensorNode AST + ricci/einstein/bianchiResidual helpers). Both v0.4.0 `it.skip` debts cleared: BE-52 Mercury Δφ to relErr 1.77e-7 (10⁴× tighter than I6 target); BE-37 Shapiro to relErr 1.76e-4. Bridge validation sweep: BE-51/52 structural siblings + BE-17/20/45/46/50 physics anchors + 42-bridge catalog integrity test. Suite 1,554/1,563. npm: `universal-physics-tensor@0.5.0`. Tag `v0.5.0`, HEAD `e2c84b2`.
- **v0.4.6** (2026-05-18) — Minimize/simplify pass. 25 tasks across 5 tracks. 32 audit findings addressed. Suite 1,487/1,496. npm: `universal-physics-tensor@0.4.6`. Commit `46ff0a7`, tag `v0.4.6`.

---

## Active queue

- [ ] **🚧 v0.6.1 tag + push** — sprint complete on branch
      `claude/changelog-todo-sync-9PdMg`; needs a tag `v0.6.1` and a
      master merge before npm publish can be attempted. Pending user
      action: review the branch, bump `package.json` version 0.6.0 →
      0.6.1, commit + tag + push. The Phase 4 doc updates in this
      branch already reflect the v0.6.1 sprint state.
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
- [ ] **GitHub release notes for v0.6.0** — draft from the `CHANGELOG.md`
      `[0.6.0]` section once the npm publish lands (or independently).
- [x] ✅ **v0.6.0 documentation-integrity review + 4-phase doc refresh**
      (2026-05-20). 8-batch opus+sonnet agent team under the `rlm` +
      `honest-claude` skills reviewed all ~60 docs (root + `docs/` + sub-
      READMEs) for accuracy/consistency/staleness. 63 findings (7 CRITICAL,
      33 HIGH, 20 MEDIUM, 3 LOW), all fixed across 4 per-phase commits
      (`da43627`, `50aa5b1`, `fe6d51f`, `b814a71`). Honest headline: the
      v0.6.0 *release* introduced **zero** doc hallucinations — the failure
      mode was accumulated *staleness* no release had refreshed. Master
      report: `docs/architecture/v0.6.0-doc-integrity-review.md`; per-batch
      detail in `docs/architecture/doc-review/`.
- [x] ✅ **BE-33 Hertz-Millis exponent fix + bridge-physics audit**
      (2026-05-20, commits `1c77a1e` + `394d164`). Finite-T correlation
      length corrected `ξ ~ T^(-ν/z)` → `ξ ~ T^(-1/z)` (z sets the
      temperature scaling; ν governs the separate T=0 tuning-parameter
      divergence). Adam+Eve two-model physics-correctness audit of all 42
      bridges landed at `docs/architecture/BRIDGE-PHYSICS-AUDIT.md`.
- [x] ✅ **Vendored developer tooling + C-9 in-tree fix** (2026-05-20,
      commits `384db01` + `9fd4ae9`). Four standalone utilities copied
      from the memoryjs sister repo into `tools/` and retrofitted to UPT:
      `create-dependency-graph` (with the C-9 comment-leak fix landed
      via `stripBraceBlockComments` / `splitBraceSymbols`),
      `plan-doc-audit` (defaults to `docs/planning/`),
      `chunking-for-files`, `compress-for-context`. New npm scripts
      `docs:deps` + `audit:plans` (npx tsx, no new devDep). Root build
      unaffected (tsconfig `rootDir:src` excludes `tools/`).
      `DEPENDENCY_GRAPH.md` regenerated clean — the stale "C-9 unfixed"
      banner is gone.
- [x] ✅ **`docs/planning/UPT v0.70 - Proposals.md`** (2026-05-22, commit
      `b67481b`; `.md` extension added in a follow-up rename).
      v0.7+ architectural reframe grounded in the MathTS
      CHANGELOG: 8 proposals (Intelligent Index layer; sparse semantic
      catalog; typed L+B+E discriminated union; bridge DSL on
      `compileExpr`; `RegimeType` extensions; bridge composition
      research track; bridges-as-workbooks via `.mtsw`; bridge parameter
      AD via `DualTensor`/`TapedTensor`). Honest framing: MathTS is
      peer-level to UPT, not a backend layer; nearly all v0.7 work
      happens inside the UPT repo. Notes/proposals only — no
      commitments. Feeds the "v0.6.0+ horizon" section below.

### v0.5.1 execution lessons (carry-forward for v0.6.0+)

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
- [ ] **PC-1.5 investigation** — BE-37 Shapiro residual floor (currently 2.51e-4). Hypothesis: integrator-driven (GL4 step count at O(h⁴) truncation floor for 1500s coord-time, OR null-IC reconstruction noise from sqrt + sign-choice ~5e-15 abs accumulating). Investigate via: (a) step-count sweep (2048 → 4096 → 8192) to bracket the floor; (b) bench harness for null-IC reconstruction variance. Detail in `docs/planning/v0.6.0-Brainstorm.md`.
- [x] ✅ **BR-2 carry-forward**: `christoffelFn` nested-array → `Float64Array(64)` flat — shipped v0.6.0 Phase 2 (BREAKING, 5-6× RK4 speedup). Carry-forward closed.
- [ ] **AS-3 (optional)** test-side `schwarzschildPin` helper — deferred from v0.5.1; ~65 invocation sites of `schwarzschild*Fn(M)([0, 3*r_s, π/2, 0])` could collapse. v0.5.2 polish if needed.
- [x] ✅ **Bench harnesses (PO-1, PO-2, PD-grid)** — shipped v0.6.1 Phase 5 (2026-05-23, commit `48a7bb1`). All three files landed: `bench/gl4-picard-alloc.bench.ts`, `bench/ricci-lowering.bench.ts`, `bench/pderiv-grid.bench.ts`. Per Decision #5 of the v0.6.1 design, informational-only (no threshold gates) — baselines in `docs/architecture/benchmarks.md` v0.6.1 section. Findings: Ricci contraction is essentially free vs FD-Riemann (1.01× ratio); order=4 pderiv is 2.41× slower than order=2 (acceptable tradeoff for ~10⁴× truncation reduction).

### From v0.6.0
- [ ] **PC-1.5 follow-up** — BE-37 Shapiro residual floor (2.51e-4) root-cause remains open. Integrator cleared as suspect (bit-exact Killing-charge conservation in Phase 1). Remaining suspects: (a) null-IC reconstruction noise from sqrt + sign-choice ~5e-15 absolute accumulating over 1500s coord-time; (b) affine-parameter mismatch between geodesic evaluator and closed-form `evaluateShapiroDelay` convention. Investigate via step-count sweep (2048→4096→8192) and null-IC reconstruction variance bench. Decision #8: measure-and-document, not measure-and-fix.
- [ ] **Near-horizon Kretschmann** — `computeKretschmann` near r=r_s requires Kruskal-Szekeres or Painlevé-Gullstrand coordinates; Schwarzschild coord system diverges. Deferred from v0.6.0 Phase 3 scope.
- [ ] **`TensorEquationNode<LHS,RHS>` generalization** (E-6) — a generic tensor-equation node that subsumes `EinsteinFieldEquationNode` and future field equations. Deferred; the EFE-specific node is sufficient for v0.6.0 use cases.
- [ ] **Kretschmann O(4⁸) symmetry optimization** (P-6) — current `computeKretschmann` evaluates all 256² = 65536 `W_{αβγδ} W^{αβγδ}` pairs; Weyl symmetries reduce the independent count substantially. Deferred; correctness gates pass at current cost.
- [ ] **Bridges assessed but NOT re-encoded in v0.6.0** (Task 4.3 honest-framing — no v0.6.0 primitive meaningfully applies):
  - **BE-13 Einstein-trace** — encodes the *scalar* trace `R = 4Λ − (8πG/c⁴)T` (post-contraction); `EinsteinFieldEquationNode` is a rank-2 *tensor*-equation predicate — structurally distinct, wrapping the scalar gives no gain.
  - **BE-19 quantum-bounce** — encodes the LQC modified Friedmann relation for `H²`; `KretschmannScalarNode` is a curvature-singularity diagnostic with no structural connection to the bounce equation.
  - **BE-39 asymptotic-safety** — β-functions are dimensionless polynomials in dimensionless RG couplings; `WeylTensorNode` is dimensionful `[L⁻²]` — no applicable primitive.
  - **BE-50 Wheeler-Feynman** — encodes a dimensionless gauge-field ratio; no v0.6.0 primitive applies.
  Re-encoding would need new primitives (a scalar-contraction node, an RG-flow node, etc.) — out of v0.6.0 scope. Status pins unchanged per Decision #9.
- [ ] **Dev-dep updates** — `@types/node` 24.12.4/25.x patch/major; `vitest` 4.1.7 patch; `typescript` 6.x major. All non-blocking; deferred to a dedicated hygiene pass.

### From v0.6.0 doc-integrity review (2026-05-20)
- [x] ✅ **C-9 dep-graph generator bug** — FIXED 2026-05-20. The `create-dependency-graph` tool was vendored into `tools/create-dependency-graph/` (from the `memoryjs` sister repo); the comment-as-symbol leak (source-comment text in multi-line `export {…} from` blocks bleeding into re-export symbol rows) was fixed in-tree via `stripBraceBlockComments`/`splitBraceSymbols`. `DEPENDENCY_GRAPH.md` regenerated clean — the stale "C-9 unfixed" banner is gone. Run `npm run docs:deps` to regenerate.
- [ ] **BRIDGE-PHYSICS-AUDIT.md follow-ups** — the 42-bridge Adam+Eve physics audit flagged the "bridge" framing as contested for ~19 entries and several `dimensional_signature` tags as questionable (beyond the BE-33 exponent fix already landed). Not yet triaged into per-bridge actions; a future bridge-correctness pass should work through the audit's verdict table.

### From v0.4.5
- [ ] **Vitest 4.1.4 async-bench reporter limitation** — upstream-blocked. Watch for vitest 4.2+.

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

### Memoryjs-driven audit tooling
Re-runnable codebase analysis via `~/Dropbox/Github/memoryjs/tools/create-dependency-graph`:
```bash
cd ~/Dropbox/Github/memoryjs/tools/create-dependency-graph
npx tsx create-dependency-graph.ts --root="C:/Users/danie/Dropbox/Github/universal-physics-tensor" --include-tests
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

## v0.6.0+ horizon (notes only, no commitments)

- **v0.7+ proposal set** in `docs/planning/UPT v0.70 - Proposals.md` (2026-05-22) — 8 proposals grounded in the MathTS CHANGELOG; ~11-16 weeks non-research engineering, all UPT-repo-local. Read before planning v0.7 scope.
- Faraday-tensor mixed-component-dim BREAKING refactor (3 nodes affected per Part-VIII §VIII.10)
- Browser float32 `TensorEngine` impl
- threejs visualization bootstraps
- TensorJS v1.0: stable public API + numerical surface + declarative viz spec (north star)
