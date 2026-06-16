# UPT — Claude Code project context

TypeScript ESM library exploring unified physics via a rank-6 tensor.
Full vision in [README.md](README.md). Cross-session task state, release
queue, and repo-specific conventions live in [todo.md](todo.md) — read it
before starting non-trivial work.

## Stack

- **TypeScript 5.9+**, Node ≥18, ESM (`"type": "module"` — relative imports
  must include `.js` extension).
- Test runner: **vitest 4.1.4**. No Python in the codebase.
- Optional deps: `@danielsimonjr/mathts-tensor`, `@danielsimonjr/mathts-autograd`
  (sister repo at `~/Dropbox/Github/Mathts`, branch `main`; both published to npm).

## Commands

| Task | Command | Notes |
|---|---|---|
| Build | `npm run build` | tsc, emits to `dist/` |
| Test | `npm test` | ~15 s on a fast box; **3–5 min cold-start on Windows** |
| Smoke | `npm run smoke` | runs `test-example.js` against built `dist/` |
| Bench | `npm run bench` / `npm run bench:ci` | Vitest bench; baselines in `docs/architecture/benchmarks.md` |
| Publish | `npm publish --ignore-scripts --access public` | **always `--ignore-scripts` on Windows** — skips `prepublishOnly` (vitest cold-start tax) |

## Repo invariants

- Default branch is **`master`**, not `main`. **Direct-push workflow — no PR flow.**
- Release: bump `package.json` → commit → push master → tag `v0.X.Y` → push tag → `npm publish --ignore-scripts --access public`.
- **Release pre-flight (v0.5.1+)**: before `npm publish`, run `npm audit` and `npm outdated`. Address any HIGH/CRITICAL audit findings before tagging. Document the dep-health snapshot in `CHANGELOG.md` under the release header.
- `NPM_TOKEN` is a Windows User-level env var; `.npmrc` uses `${NPM_TOKEN}` interpolation. Rotate at <https://www.npmjs.com/settings/danielsimonjr/tokens>.
- SemVer applies from v0.1.0 (2026-05-12) onward.

## Source map

Top-level layout — see each subsystem's local `README.md` for depth.

| Path | Purpose |
|---|---|
| `src/index.ts` | Public-API manifest (every `@public` symbol). **`MathTSEngine` is intentionally NOT re-exported here** — reachable only via the `universal-physics-tensor/numerical/mathts-engine` subpath. |
| `src/core/` | `UniversalTensor`, runtime law/bridge/emergent-phenomenon types (`tensor.ts`, `types.ts`). |
| `src/bridges/` | 44-bridge catalog (IDs 11–54). `index.ts` is the catalog registry (`BRIDGE_EQUATIONS`); `equations/` holds per-bridge AST modules; v0.4.0 evaluators (`gravitational-lensing.ts`, `perihelion-precession.ts`) sit at this level. |
| `src/dimensional/` | Scalar AST validator over the 7 base SI dimensions (L, M, T, I, Θ, N, J in `types.ts`'s `Dimension` interface; `NAMED_DIMENSIONS` adds 15 named/derived shapes for `format()`). `validator.ts` owns the `ExprNode` union; `algebra.ts` is the dimension calculus; `bridge-check.ts` houses `inferDimensionForBridge` + `EXPECTED_DIMENSION_BY_BRIDGE` (42 entries — IDs 11–50, 53, 54; BE-51/52 are closed-form evaluators without AST encodings). v0.4.0 added `connection.ts` (Christoffel) and `CovariantDerivativeNode`. |
| `src/numerical/` | `TensorEngine` interface + `Float64ReferenceEngine` (zero-dep default) + `MathTSEngine` (optional). AST→engine lowering in `lowering.ts`; geodesic RK4 in `geodesic-integrator.ts`; BE-37 eikonal evaluator in `be37-covariant-eikonal.ts`. |
| `tests/fixtures/schwarzschild.ts` | Canonical GR fixture — extended each release; v0.5.0 adds `gInverseFn`, `dgInverseFn` (typed `dg[lambda][mu][nu]`). |
| `docs/specification/` | Formal spec — core 6 parts (Part-{I..VI}: theoretical foundation, catalog, algorithms, validation, advanced math, governance) + supplements (Part-VII tensor algebra, Part-VIII metric layer, Part-IX composition Phase A, Part-X curvature & field-equation layers). `README.md` there is the index. |
| `docs/planning/v0.X.Y-{Design,Implementation-Plan,Review-Findings}.md` | Per-release artifacts (brainstorm output, plan, Adam+Eve adversarial findings). |
| `docs/architecture/` | Auto-generated dep graph + hand-written architecture + per-release audit reports (e.g., `v0.4.6-minimize-targets.md`, `benchmarks.md`, `bridge-coverage-audit.md`). |
| `bench/` | Vitest bench suites (sanity, AD, BE-37 eikonal, Schwarzschild geodesic). |
| `examples/` | Usage examples; `test-example.js` is the smoke entry. |

## Dimensional AST grammar

Scalar (operator-blind) `ExprNode` primitives: `symbol | op (* / + - ^) | integral | derivative` (plus the v0.4.0 `CovariantDerivativeNode`). The validator enforces:

- `^` arity guard (base, exponent)
- switch-exhaustiveness `never` arm
- integral / derivative shape guards
- `validateInverseMetricPair` consistency between `g` and `g⁻¹` (emits `InverseMetricInconsistencyWarning`)

Round-trip invariant: every catalog entry's encoded RHS validates back to its registered `dimensional_signature` — pinned by `tests/bridges/dimensional-signature-catalog.test.ts`.

## Bridge-encoding patterns (established during Wave Z)

When encoding or reformulating a bridge, prefer these patterns — they avoid grammar extensions:

- **Typed-stubs** for transcendentals / operator-valued interiors. Absorb `log`, `exp`, tensor contractions into a single dimensioned symbol.
- **Squared-form** to avoid fractional exponents (e.g., `S²`, `L² = Γt`, `Q_soft²`).
- **Ensemble-average stubs** for averaged exponentials (Jarzynski `⟨exp(-βW)⟩`).
- **Observational-bound dimensionless ratios** (e.g., GW170817 `|c_GW - c| / c`).
- **Integral primitive** for boundary integrals (BE-26 WKB, BE-44 soft-hair L²-norm).
- **Bridge reformulation** — replace broken/contested formulations with canonical literature forms while preserving the bridge label. Precedents: BE-25 Penrose-Hameroff → IIT Φ_max; BE-16 → Landauer; BE-37 → Shapiro delay; BE-28 → Onsager σ (carries a `⚠ CRITICAL WARNING` docstring — the encoded `σ = Σᵢ Jᵢ Xᵢ` is the *definiendum* of MEPP, not the variational maximization principle).

Status distribution across the 44-bridge catalog: 8 established · 33 speculative · 3 highly-speculative · 0 invalid (re-tallied 2026-06-10 from `src/bridges/index.ts` `status:` fields).

## Workflow gotchas

- **Don't re-run the full suite per task.** Use scoped vitest in TDD cycles; full-suite only at the release gate. Windows cold-start tax (3–5 min) is real and burns the day if treated cavalierly.
- **Plan templates routinely have wrong inline test snippets** — wrong tensor input formats, wrong AST node kinds (`op:'*'` vs `kind:'tensor-product'`), wrong nested-array shapes, fabricated method names (`f64.mul`), or false claims like `evaluateNumericalRaw` "bypasses `validate()`" (it doesn't). **Always cross-check inline test code against existing fixtures before TDD'ing it.** Honest deviation goes in the commit message.
- **Never assume a plan inherits its design's fixes.** v0.5.0's plan reintroduced a ricci-slot bug that the design had already fixed. Adversarial review runs on both artifacts independently.
- **Pre-execution verification gates** are the systemic mitigation. The v0.5.0 plan has them on Tasks 0, 3, 6, 7, 10, 12 — read source + run prerequisites before each TDD cycle.

## Review tier

UPT uses an Adam+Eve adversarial review pair for design / plan / physics-correctness checks. The specific model mapping and invocation conventions live in [todo.md](todo.md) §Conventions — check there rather than duplicating here (it changes more often than this file).

## Current release state

See [todo.md](todo.md) — single source of truth across sessions. As of
2026-06-15: last npm-published is **0.7.3**, package.json at **0.10.0**
(release pending); the branch `claude/bridge-equations-specs-review-4mfy38`
carries unreleased milestones v0.8.0 (composition MVP + GW170817 + adjudication),
v0.9.0 (flat-metric migration 1.56×, S-9 registry, strict type gate),
v0.10.0 (Part-IX Phase C/D closure, uncertainty propagation, graph tranche),
v0.11.0 (namespacing gate, full 41-edge catalog→graph migration, O-4 +
29.8× Kretschmann, KG evaluator, BE-23 confrontation, Rule-3 ERROR), v0.12
(premise-extension tooling — bridge-prediction / discovery loop / coverage
audit / equation-valence; **symbolic bridge composition** = the Observable
contract + MathTS simplification; orphan-connector analysis), v0.13
(symbolic exponents on a dimensionless base; **G-9 increment 1** = the
geometrized boundary adapters), and v0.14 (**distributional/variational grammar
primitives** — the `dirac-delta` + `variational-derivative` scalar `ExprNode`
arms that make BE-15's Model-A Langevin/FDT relation dimensionally expressible;
catalog re-encoding deferred to physicist; grammar applicability tested against
the real catalog — BE-15 fully, BE-46/BE-28 partial with residual barriers
documented). Suite **2576 passing**. **Recommended
release: a single rollup tag at final HEAD** (precedent: v0.5.1→v0.7.0).
Part-IX Phase-B bar (≥3 of C1–C5) MET. Queued next: **G-9 increment 2**
(geometrized fixtures + GR-pipeline fast path + FD order-2 claw-back — own
plan + Adam+Eve vet); C2/C3 calibration targets; the user-only rollup-tag
release; human-physicist review surfaces (CONTRIBUTING.md tasks 1–8; the
CI-1/CI-2 dynamic-scaling call).

When the release state in this file drifts from `todo.md`, **trust `todo.md`**
and update or delete the paragraph above.
