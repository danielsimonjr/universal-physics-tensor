# UPT TODO

Durable cross-session task tracker. Update this file as work progresses — checkboxes flip when tasks complete, items move between sections as state changes.

> The in-conversation task tracker (TaskCreate/TaskUpdate) is ephemeral. This file is the source of truth for "what's next" across sessions.

---

## Latest shipped

- **v0.5.0** (2026-05-18) — GR foundations. 25 tasks across 4 phases. GL4 symplectic integrator on canonical (x, p) state (Picard inner solver), bisection perihelion finder, curvature layer (RiemannTensorNode AST + ricci/einstein/bianchiResidual helpers). Both v0.4.0 `it.skip` debts cleared: BE-52 Mercury Δφ to relErr 1.77e-7 (10⁴× tighter than I6 target); BE-37 Shapiro to relErr 1.76e-4. Bridge validation sweep: BE-51/52 structural siblings + BE-17/20/45/46/50 physics anchors + 42-bridge catalog integrity test. Suite 1,554/1,563. npm: `universal-physics-tensor@0.5.0`. Tag `v0.5.0`, HEAD `e2c84b2`.
- **v0.4.6** (2026-05-18) — Minimize/simplify pass. 25 tasks across 5 tracks. 32 audit findings addressed. Suite 1,487/1,496. npm: `universal-physics-tensor@0.4.6`. Commit `46ff0a7`, tag `v0.4.6`.
- **v0.4.5** (2026-05-17) — Refactor + benchmark scaffold. 12 tasks. Bridge-test-helpers DRY consolidation across 39 files. `bench/` infrastructure + AD/BE-37/geodesic baselines. First UPT npm publish ever. Commit `90caf7e`.
- **v0.4.0** (2026-05-15) — Connection layer (Christoffel, ∇_μ, AD) + BE-51 lensing + BE-52 perihelion + RK4 geodesic integrator. Commit `0a6b672`.

---

## Active queue

(Empty — v0.5.0 shipped 2026-05-18. Next release brainstorming TBD.)

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
- [ ] **`c` constant canonicalization across bridge modules.** `src/numerical/be37-covariant-eikonal.ts` uses `2.998e8`; `evaluateShapiroDelay` uses exact `299792458`. Causes ~1.8e-4 residual on BE-37 cross-check. Fold into one shared `c_SI` constant.
- [ ] **`schwarzschildRiemannFn` fixture is pragmatic-minimum** (8 of 256 entries populated). v0.5.0 lowering produces 16+ legitimate non-zero components (Task 6 finding). Backfill the fixture so future `RiemannTensorNode` users can compare against a complete analytical reference.
- [ ] **Plan/design Ricci-slot bug** is still in `docs/planning/v0.5.0-Design.md` and `docs/planning/v0.5.0-Implementation-Plan.md` as a historical artifact. Decide whether to addendum-correct in a doc-only commit or leave as-is (commit `76628c4` is the load-bearing reference).
- [ ] **GL4_LONG=1 Mercury 100-orbit Picard-convergence test** still placeholder-stubbed in `tests/numerical/gl4-integrator.test.ts`. Instrument `solveGL4Stage` with iteration-count tracking + run the long suite to demonstrate the >99.9% step-success criterion.

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

- Faraday-tensor mixed-component-dim BREAKING refactor (3 nodes affected per Part-VIII §VIII.10)
- Browser float32 `TensorEngine` impl
- threejs visualization bootstraps
- TensorJS v1.0: stable public API + numerical surface + declarative viz spec (north star)
