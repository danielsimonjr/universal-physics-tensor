# UPT — Claude Code project context

TypeScript ESM library exploring unified physics via a rank-6 tensor.
Full vision in [README.md](README.md). Cross-session task state, release
queue, and repo-specific conventions live in [todo.md](todo.md) — read it
before starting non-trivial work.

## Stack

- **TypeScript 6.x**, Node ≥18, ESM (`"type": "module"` — relative imports
  must include `.js` extension).
- Test runner: **vitest 4.x**. No Python in the codebase.
- **Zero hard deps.** Optional deps: the `@danielsimonjr/mathts-*` family
  (tensor, autograd, expression, functions, …; sister repo at
  `~/Dropbox/Github/Mathts`, branch `main`) + `@viz-js/viz` (SVG map rendering).
  Everything must degrade gracefully when a peer is absent.

## Commands

| Task | Command | Notes |
|---|---|---|
| Build | `npm run build` | tsc, emits to `dist/` |
| Test | `npm test` | ~15 s on a fast box; **3–5 min cold-start on Windows**; `pretest` runs `tsc` first |
| Single/scoped test | `npx vitest run tests/path/to/file.test.ts` | or `-t "name pattern"`; skips the `tsc` pretest — the default for TDD cycles |
| Long accuracy tests | `$env:GL4_LONG='1'; npx vitest run …` (PowerShell) | GL4/Shapiro sweeps, `it.skip` otherwise; nightly `long-tests` CI job runs them |
| Smoke | `npm run smoke` | runs `test-example.js` against built `dist/` |
| CLI | `node bin/upt.mjs <cmd>` (or `npm run upt --`) | needs `npm run build` first; full reference in `cli/README.md` |
| Dep graph / doc counts | `npm run docs:deps` | regenerates `docs/architecture/` graph + unused/coverage reports |
| Bench | `npm run bench` / `npm run bench:ci` | Vitest bench; baselines in `docs/architecture/benchmarks.md` |
| Publish | `npm publish --ignore-scripts --access public` | **always `--ignore-scripts` on Windows** — skips `prepublishOnly` (vitest cold-start tax) |

## Repo invariants

- Default branch is **`master`**, not `main`. **Direct-push workflow** for local work — no human PR flow (cloud/agent sessions land via auto-PRs).
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
| `src/dimensional/` | Scalar AST validator over the 7 base SI dimensions (L, M, T, I, Θ, N, J in `types.ts`'s `Dimension` interface; `NAMED_DIMENSIONS` adds 15 named/derived shapes for `format()`). **`ast-types.ts` is the leaf module owning the `ExprNode` union + all node interfaces** (the 9 origin modules re-export from it and keep only validation functions — this is what holds type-only circular deps at 0); `ast-builders.ts` is the single source of the `sym`/`dim` AST builders; `validator.ts` is the validation engine; `algebra.ts` is the dimension calculus; `buckingham.ts` the exact-rational Buckingham-π enumerator; `bridge-check.ts` houses `inferDimensionForBridge` + `EXPECTED_DIMENSION_BY_BRIDGE` (BE-51/52 are closed-form evaluators without AST encodings); `dimension-inference.ts` the single-unknown `inferUnknownDimension`; `connection.ts` (Christoffel) requires dimensionless (geometrized) metrics. |
| `src/composition/` | The composition-graph layer (~26 files): `edges/` holds the 41 `BridgeEdge` defs (`catalog-full.ts` is a barrel over four domain files `catalog-{quantum,gravitation-cosmology,fields,condensed-matter}.ts`; `quantities.ts` is a barrel over `quantities/{quantum,…,common}.ts`); `bridge-analysis.ts` (linkage map, priority, orphan connectors), `discovery.ts` + `retrodiction.ts` + `identifiability.ts` (the vetting funnel behind `upt discover`), `compose-symbolic.ts`/`expr-simplify.ts` (symbolic composition), `canonical-graph.ts` (textbook-physics-only graph, `--source=canonical`), `proposed-bridges.ts` (identity-consequence surfacer, firewalled `'unadjudicated'`), `graph-viz*.ts` (`upt map --format=mermaid\|dot\|svg`), `user-equation.ts` (`--equation` injection, never written to the catalog). |
| `src/diff/` | Bridge parameter gradients: `bridge-ast-gradient.ts` (exact reverse-mode AD over the symbolic RHS AST via the autograd peer — evaluators stay plain JS), `bridge-gradient.ts` (numerical central-FD fallback + engine-AD wrapper). |
| `src/cli/` + `bin/upt.mjs` + `src/cli-api.ts` | The `upt` CLI (14 data-bearing commands + `help`/`version`: map/discover/candidates/recover/canonical/explain/eval/derive/…; reference in `cli/README.md`). `bin/upt.mjs` is a ~22-line shim: it resolves and imports `dist/cli/main.js` and maps the returned exit code onto `process.exitCode` (not `process.exit`, so piped stdout isn't truncated). All real logic lives in typed `src/cli/` — the `FlagSpec` parser (`args.ts`) rejects unknown flags with exit 2, the command registry (`command.ts`, `commands/`), the `--json` envelope + non-finite-safe sanitizer (`output.ts`), and `runCli` (`main.ts`, returns an exit code as a value, never calls `process.exit` itself). `main.ts` is the one module that imports the `src/cli-api.ts` barrel; every command reaches it only via the injected `CommandCtx.api`, never by importing it directly — extend the barrel when the CLI needs a new internal module, never deep-import from `src/cli/`. |
| `src/numerical/` | `TensorEngine` interface + `Float64ReferenceEngine` (zero-dep default) + `MathTSEngine` (optional). AST→engine lowering in `lowering.ts`; geodesic RK4 in `geodesic-integrator.ts`; BE-37 eikonal evaluator in `be37-covariant-eikonal.ts`. |
| `src/canonical/` | Canonical-equation registry — the textbook **L-layer** ground truth bridges are validated against. `canonical-equation.ts` owns the `CanonicalEquation` type (L0 dimensional / L1 scalar-AST / L2 field-equation fidelity + `epistemicStatus`/`freeDimensionlessGroups` + `restatesBridge`/`partnerBridges`); `registry.ts` is the assembled array + accessors + coverage helpers; `dimensional-fields.ts` derives L0 fields from the Buckingham engine; `entries/` holds the equation modules; `seed-l-layer.ts` populates the tensor via `addLaw`. `normal-form.ts` is the structural hash (equal up to dimensionless *constants*; named non-constant stubs like `ln⟨e^−βW⟩` are kept distinct) and `linkage.ts` is the bridge↔canonical validator + F4 circularity guard (`classifyLinkage`/`scanLinkages`, surfaced via `upt recover`). |
| `tests/fixtures/schwarzschild.ts` | Canonical GR fixture — extended each release; v0.5.0 adds `gInverseFn`, `dgInverseFn` (typed `dg[lambda][mu][nu]`). |
| `docs/specification/` | Formal spec — core 6 parts (Part-{I..VI}: theoretical foundation, catalog, algorithms, validation, advanced math, governance) + supplements (Part-VII tensor algebra, Part-VIII metric layer, Part-IX composition Phase A, Part-X curvature & field-equation layers, **Part-XI proposed equations** — NON-NORMATIVE machine-derived identity-consequences, unadjudicated). `README.md` there is the index. |
| `docs/planning/v0.X.Y-{Design,Implementation-Plan,Review-Findings}.md` | Per-release artifacts (brainstorm output, plan, Adam+Eve adversarial findings). |
| `docs/architecture/` | Auto-generated dep graph + hand-written architecture + per-release audit reports (e.g., `v0.4.6-minimize-targets.md`, `benchmarks.md`, `bridge-coverage-audit.md`). |
| `bench/` | Vitest bench suites (sanity, AD, BE-37 eikonal, Schwarzschild geodesic). |
| `examples/` | Usage examples; `test-example.js` is the smoke entry. |

## Dimensional AST grammar

Scalar (operator-blind) `ExprNode` primitives: `symbol | op (* / + - ^) | integral (optionally bounded, v0.20) | derivative | transcendental (exp/ln/log/trig, v0.18) | abs (v0.19) | dirac-delta | variational-derivative (v0.14)`, plus the tensor/curvature node families (`CovariantDerivativeNode`, `RiemannTensorNode`, …). The validator enforces:

- `^` arity guard (base, exponent); a non-literal exponent is legal only on a DIMENSIONLESS base (v0.13)
- transcendental args must be dimensionless (`exp(energy)` rejected)
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
2026-07-04: **v0.37.0 is the latest npm release** (registry-verified,
`dist-tags.latest = 0.37.0`; CHANGELOG `[0.37.0] — 2026-07-04`, `package.json`
at **0.37.0**), master at the tag. v0.37.0 is the **PI-instrument program** —
the framework reframed as an honest falsification instrument (a trustworthy *no*,
an extraordinary *yes*). Shipped: the **epistemic-grounding ledger** on every
`upt discover` verdict (which falsifiers passed vs the gaps + the honest ceiling;
`src/composition/grounding.ts`, annotation-only) and the **BE-21 KSS-bound
confrontation** (evidence spine 6 → 7: the QGP nearly saturates 1/4π). **Three
phases resolved to honest not-build / boundary / defer** — a mechanism-proxy gate
and a propose→confront loop are NOT buildable on dimensional candidates without
fabricating physics the catalog lacks (mechanism/data live in the established-
bridge `upt confront` world, not candidate space); BE-53 deferred (numeric b₀ =
fabrication). Flagship results note: `docs/research/pi-instrument-results.md` (the
null-result catalog + evidence spine + frontier, all CLI-reproducible).

Earlier arc: the **L1-sum canonical tier** —
the FIRST non-monomial canonical laws (now **10**: Bernoulli, radioactive decay,
photoelectric, Carnot, Boltzmann factor [v0.35.0], + Lorentz γ, Compton shift,
Rydberg, Snell, Malus [v0.36.0, the harder backlog — filling the special-
relativity + optics gaps]; canonical 93 → 103). Each carries a full L1
`scalarAst`, engine-derived `monomial:null` + `freeGroups≥1` (so F1 holds
unchanged; the exact form lives in the scalarAst, `epistemicStatus` reflects it
not the dimensional under-determination). **Honest scope: all 10 MEASURED to
produce ZERO structural bridge-matches — the value is reference-completeness of
the L-layer, not bridge-validation** (stated without inflation). The **L2 field-
equation tier was NOT built** (FieldEquationNode is Einstein-only; `fieldEquation`
read by nothing but a CLI label = the inert-metadata / E-layer trap). v0.35.0
also shipped the **BE-51 gravitational-lensing confrontation** — the third
classic GR test (data-confronted bridges 5 → 6): all three (Mercury 0.26σ,
Shapiro 0.91σ, lensing 0.67σ) now confront real data within 1σ.

v0.34.0 was the **canonical L-layer expansion 66 → 93** (+41%, 27 monomial
laws; new `condensed-matter` domain). Its lasting artifact is the mapped
**boundary of the monomial L0 model** — sums/transcendentals, hidden length
scales (Poiseuille), dimensionless numbers (Reynolds, α), and pure counts are
excluded and logged (`docs/research/canonical-expansion-candidate-audit.md`);
the L1-sum tier above began encoding that non-monomial backlog.

The prior **discovery-hardening program is COMPLETE** (design:
`docs/superpowers/specs/2026-07-02-discovery-hardening-program-design.md`):
v0.30.0 CLI overhaul; v0.31.0 Phase 1 (adjudication ledger); v0.32.0 Phase 2
(axis falsifier; `map`/`connectors` default `--source=both`); v0.33.0 bundled
Phase 3 (`upt confront`, data-confronted bridges 3 → 5) + Phase 4-Unit-A
(consequence-propagation). Its four remaining items were each evaluated with
grounding + measurement + Adam/Eve vet and **correctly NOT built** — Unit B
(numerology), Phase 5 (statistics-theater), symbolic-deepening (zero yield),
Phase 6/E-layer (category error) — the honest capability ceiling of a funnel
over a sparse monomial catalog (results:
`docs/research/v0.33.0-discovery-hardening-results.md`). **Queued next:** the
L1-sum/L2 field-equation tier (the excluded-law backlog), and the evidence
spine (more real-data confrontations, data-gated). Each new program requires
its own design + Adam/Eve vet + Task-0 gate. Suite **3591 passing / 332 files**
(v0.36.0 gate). History in `CHANGELOG.md` / `todo.md`; counts regenerate with
`npm run docs:deps` (re-measure at HEAD).

When the release state in this file drifts from `todo.md`, **trust `todo.md`**
and update or delete the paragraph above.
