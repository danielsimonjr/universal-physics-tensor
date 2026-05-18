# UPT TODO

Durable cross-session task tracker. Update this file as work progresses — checkboxes flip when tasks complete, items move between sections as state changes.

> The in-conversation task tracker (TaskCreate/TaskUpdate) is ephemeral. This file is the source of truth for "what's next" across sessions.

---

## Latest shipped

- **v0.4.6** (2026-05-18) — Minimize/simplify pass. 25 tasks across 5 tracks. 32 audit findings addressed. Suite 1,487/1,496. npm: `universal-physics-tensor@0.4.6`. Commit `46ff0a7`, tag `v0.4.6`.
- **v0.4.5** (2026-05-17) — Refactor + benchmark scaffold. 12 tasks. Bridge-test-helpers DRY consolidation across 39 files. `bench/` infrastructure + AD/BE-37/geodesic baselines. First UPT npm publish ever. Commit `90caf7e`.
- **v0.4.0** (2026-05-15) — Connection layer (Christoffel, ∇_μ, AD) + BE-51 lensing + BE-52 perihelion + RK4 geodesic integrator. Commit `0a6b672`.
- **v0.3.5** (2026-05-14) — Numerical-contraction backend (TensorEngine + Float64Reference + MathTSEngine). Commit `7786027`.

---

## Active queue

### Next release: v0.5.0 — GR Foundations (PLAN READY, EXECUTION QUEUED)

**Status: READY TO EXECUTE.** Design + plan + 2 rounds of Adam+Eve adversarial reconciliation complete in the 2026-05-18 session. Next session can dispatch implementer subagents against the plan.

- [x] ✅ Brainstorm (4 architectural decisions locked: max scope; **Gauss-Legendre 4th-order** symplectic; mixed curvature API; bottom-up sequencing)
- [x] ✅ Design — `docs/planning/v0.5.0-Design.md` (663 lines, post-reconciliation commit `ffc6268`)
- [x] ✅ Adam+Eve design vet — 19 findings applied (most notably: Ruth-4 → GL4 because geodesic Hamiltonian is non-separable; canonical (x,p) state; Ricci contracts on first-lower slot per Carroll; Riemann formula Γ permutation; tolerances relaxed)
- [x] ✅ Plan — `docs/planning/v0.5.0-Implementation-Plan.md` (2,300 lines, commit `45da201`, **25 tasks across 4 phases**)
- [x] ✅ Adam+Eve plan vet — 25 findings applied (most notably: Task 8 ricci slot inversion reintroduced from design and re-fixed; "Newton" iteration is actually Picard, renamed and tolerance bound relaxed to ≤40 iter; tolerances relaxed again for double-precision floor; new Task 0 batches fixture extensions)
- [ ] **Execute v0.5.0** — `superpowers:subagent-driven-development` against the 25-task plan
- [ ] Release: commit → push master → tag → push tag → `npm publish --ignore-scripts --access public`

**Phase breakdown** (per plan):
- **Phase 0** (Task 0): Fixture-API alignment — extend `tests/fixtures/schwarzschild.ts` with `gInverseFn`, `dgInverseFn` (typed `dg[lambda][mu][nu]`), prep all downstream fixture consumers in ONE commit.
- **Phase 1** (Tasks 1-10): Foundations — GL4 (3 sub-tasks: Butcher tableau + Picard stage solver + integrator entry-point), bisection perihelion finder (cubic Hermite interpolation, 1e-9 precision), `RiemannTensorNode` AST + validator + lowering, `ricci()`, `einstein()`, `bianchiResidual()` helpers.
- **Phase 2** (Tasks 11-13): Activations — BE-52 Mercury perihelion `it.skip` flip (±2×10⁻³ relative), BE-37 Shapiro full cross-validation (±2×10⁻³ relative), `evaluateBE37CovariantEikonalNumerical` computes real non-zero `shapiroDelaySec`.
- **Phase 3** (Tasks 14-21): Bridge validation sweep — BE-51/52 structural siblings + ~5 catalog physics anchors + 42-bridge catalog integrity test.
- **Phase 4** (Tasks 22-24): Release.

**Suite target**: ~1530-1560 passing (v0.4.6 baseline: 1487).

**Key execution gotchas baked into the plan**:
- Don't gate every task on full-suite re-run (Windows vitest startup ~3-5 min); scoped vitest in TDD cycles, full-suite only at Task 23 release gate.
- Plan-template imperfections expected (prior releases had wrong tensor-input formats in inline tests); implementers cross-check against existing fixtures.
- `npm publish --ignore-scripts --access public` at Task 24 (suite already verified at Task 23).
- Pre-execution verification gates on Tasks 0, 3, 6, 7, 10, 12 (read source + run prerequisites before TDD cycle).
- Task ordering: Task 13 BEFORE Task 12 (data dependency on `shapiroDelaySec`).

---

## Deferred from prior releases

### From v0.4.0
- [ ] **BE-52 Mercury perihelion geodesic cross-validation** — now Task 11 of v0.5.0 plan. Tolerance ±2×10⁻³ relative (relaxed twice during plan reconciliation for double-precision floor).
- [ ] **BE-37 full Shapiro cross-check** via geodesic integration — now Tasks 12+13 of v0.5.0 plan. Tolerance ±2×10⁻³ relative.

### From v0.4.5
- [ ] **Vitest 4.1.4 async-bench reporter limitation** documented in `docs/architecture/benchmarks.md`. Per-bench hz tables not emitted for async benches; only BENCH Summary ratios. Watch for vitest 4.2+ which may fix this.

### From v0.4.6
- (None — all 32 audit findings landed)

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
