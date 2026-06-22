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
| `src/bridges/` | 44-bridge catalog (IDs 11–54). `index.ts` is the catalog registry (`BRIDGE_EQUATIONS`); `equations/` holds per-bridge AST modules; v0.4.0 evaluators (`gravitational-lensing.ts`, `perihelion-precession.ts`) sit at this level. **Catalog ≠ graph:** the 44 catalog bridges project to **41 composition-graph edges** (`CATALOG_GRAPH`), and that graph is sparse — `upt map` finds **23 connected components**: one anchored cluster of 16, two small clusters, and a long tail of **20 isolated bridges** that share no quantity with any other edge. The rank-6 tensor framing is aspirational about connectivity the catalog does not yet have; most cross-cluster "links" are dimensional coincidences (see `upt discover` / `docs/research/`). `descriptor.ts` (`getBridge`/`BRIDGE_DESCRIPTORS`) is the unified facade JOINing the three id-keyed registries (metadata + RHS AST + graph edges) into one per-bridge view, guarded against cross-registry drift. |
| `src/dimensional/` | Scalar AST validator over the 7 base SI dimensions (L, M, T, I, Θ, N, J in `types.ts`'s `Dimension` interface; `NAMED_DIMENSIONS` adds 15 named/derived shapes for `format()`). `validator.ts` owns the `ExprNode` union; `algebra.ts` is the dimension calculus; `bridge-check.ts` houses `inferDimensionForBridge` + `EXPECTED_DIMENSION_BY_BRIDGE` (42 entries — IDs 11–50, 53, 54; BE-51/52 are closed-form evaluators without AST encodings). v0.4.0 added `connection.ts` (Christoffel) and `CovariantDerivativeNode`. |
| `src/numerical/` | `TensorEngine` interface + `Float64ReferenceEngine` (zero-dep default) + `MathTSEngine` (optional). AST→engine lowering in `lowering.ts`; geodesic RK4 in `geodesic-integrator.ts`; BE-37 eikonal evaluator in `be37-covariant-eikonal.ts`. |
| `src/canonical/` | Canonical-equation registry — the textbook **L-layer** ground truth bridges are validated against. `canonical-equation.ts` owns the `CanonicalEquation` type (L0 dimensional / L1 scalar-AST / L2 field-equation fidelity + `epistemicStatus`/`freeDimensionlessGroups` + `restatesBridge`/`partnerBridges`); `registry.ts` is the assembled array + accessors + coverage helpers; `dimensional-fields.ts` derives L0 fields from the Buckingham engine; `entries/` holds the equation modules; `seed-l-layer.ts` populates the tensor via `addLaw`. `normal-form.ts` is the structural hash (equal up to dimensionless *constants*; named non-constant stubs like `ln⟨e^−βW⟩` are kept distinct) and `linkage.ts` is the bridge↔canonical validator + F4 circularity guard (`classifyLinkage`/`scanLinkages`, surfaced via `upt recover`). |
| `tests/fixtures/schwarzschild.ts` | Canonical GR fixture — extended each release; v0.5.0 adds `gInverseFn`, `dgInverseFn` (typed `dg[lambda][mu][nu]`). |
| `docs/specification/` | Formal spec — core 6 parts (Part-{I..VI}: theoretical foundation, catalog, algorithms, validation, advanced math, governance) + supplements (Part-VII tensor algebra, Part-VIII metric layer, Part-IX composition Phase A, Part-X curvature & field-equation layers, **Part-XI proposed equations** — NON-NORMATIVE machine-derived identity-consequences, unadjudicated). `README.md` there is the index. |
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
2026-06-21: **v0.29.0 is the latest release** (CHANGELOG `[0.29.0] — 2026-06-21`),
`package.json` is at **0.29.0**, **published to npm**. v0.29.0 is the "three
frontiers" release: the catalog's first **established-bridge real-data confrontation**
(`confrontBE52` — BE-52 vs Mercury's anomalous perihelion, within 1σ; data-confronted
bridges 2 → 3) plus four research/adjudication notes (proposed-equations + orphan
connectors adjudicated to 0 genuine; discovery-precision calibration). v0.28.0 had
shipped the completed parser-consolidation program (Phase 1 = v0.26.0 `parsePhysics` +
dimensional `--equation`; Phase 2 = v0.27.0 single-IR transpiler), the
bridges-vs-canonical follow-up (the `thermal-de-broglie-wavelength ≡
thermal-wavelength` alias + the `dimensionAdjacency` review surface), and the
**Adam+Eve canonical-L-layer expansion 26 → 66 equations** (mechanics, EM/circuits,
fluids/waves, thermo, quantum/atomic). It builds
on the long v0.8.0→v0.25.0 arc (composition graph, data confrontations, catalog
adjudication, the full 41-edge catalog→graph migration, symbolic-composition
tooling, the G-9 geometrized adapters, the distributional/variational +
symbolic-exponent grammar, the AST bridge-gradient path, the **canonical-equation
L-layer** with bridge↔canonical linkage, the **identity-consequence surfacer**,
and the **physics-map visualization** `upt map --format=mermaid|dot|svg`).
Codebase at v0.29.0:
**187 source files / 8 modules / 1335 exports** (`docs/architecture/`,
regenerate with `npm run docs:deps`); suite **2949 passing**. v0.26.0 added
**`upt map --equation`** — inject your own equation, **dimensionally validated**,
with a dimension-based "did you mean?" — backed by the public **`parsePhysics`**
(string → dimensional `ExprNode`, MathTS-or-built-in) and single-unknown
**`inferUnknownDimension`** (`src/dimensional/dimension-inference.ts`), plus the
closed scalar grammar gap (faithful `transcendental`/`abs` nodes). v0.27.0
consolidated the ASTs — `formula-dimension.ts`'s two transpilers unified through a
normalized parse node so **`ExprNode` is the single semantic IR** (parse-trees are
transient; `CompiledFormula`'s evaluator kept). Runtime
circular deps **0**, type-only cycles **2**. For the live milestone list, read
`todo.md`.

When the release state in this file drifts from `todo.md`, **trust `todo.md`**
and update or delete the paragraph above.
