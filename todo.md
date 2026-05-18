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

### Next release: v0.5.0 — bridge-validation + curvature + symplectic

Brainstorm + plan + Adam+Eve vet + subagent-driven execution. North stars: bridges drive the work; MathTS as first-class; integrated scientific environment.

Three scope blocks:

- [ ] **Bridge-validation tasks** (~7-8 tasks per v0.5.0 pre-flight audit at `docs/architecture/bridge-coverage-audit.md`). Bring all 42 bridges to NUMERICAL + structural test parity. BE-51 + BE-52 need a structural sibling; ~5 catalog-only bridges need tighter physics anchors.

- [ ] **Symplectic integrator** (Störmer-Verlet or Ruth 4th-order) + **bisection perihelion finder**. Unlocks the 2 deferred `it.skip` from v0.4.0:
    - [ ] BE-52 Mercury perihelion geodesic cross-validation (currently `it.skip` in `tests/bridges/perihelion-precession.test.ts` — RK4 can't resolve Δφ_GR ≈ 5e-7 rad/orbit at 100-snapshot trajectory granularity).
    - [ ] BE-37 covariant-eikonal full Shapiro cross-check (currently `it.skip` in `tests/dimensional/covariant-derivative-preview.test.ts`).

- [ ] **Curvature layer**: Riemann tensor, Ricci tensor, Bianchi identities. Foundation for v0.6.0+ Einstein field equations + geodesic-deviation work.

### Process for v0.5.0

1. `superpowers:brainstorming` (clarifying questions one at a time; lock points at each section)
2. Save design to `docs/planning/v0.5.0-Design.md`
3. Adam+Eve adversarial review at design lock point — same pattern as v0.4.0/v0.4.5/v0.4.6
4. `superpowers:writing-plans` → `docs/planning/v0.5.0-Implementation-Plan.md`
5. Adam+Eve adversarial vet of the plan
6. Apply review fixes inline
7. `superpowers:subagent-driven-development` execution
8. Release task (last task): commit → push master → tag → push tag → `npm publish --ignore-scripts --access public` (the v0.4.5/v0.4.6 lesson)

---

## Deferred from prior releases

### From v0.4.0
- [ ] **BE-52 Mercury perihelion geodesic cross-validation** (Task 16b in v0.4.0 plan). Currently `it.skip` with v0.5.0 deferral comment in test file. Needs symplectic integrator + bisection perihelion finder.
- [ ] **BE-37 full Shapiro cross-check** via geodesic integration (Task 17 of v0.4.0 plan, second `it.skip`). Same blocker.

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
