# Scientific Bridge Discovery v1 — Plan Audit Record

This audit accompanies `Scientific-Bridge-Discovery-v1.md`.

## Scope

The roadmap was reviewed twice. The first pass (commit `c9cac28`) treated the original roadmap as a standalone design and fixed architectural overreach (parallel subsystems, “law” vocabulary, additive residuals, unbounded search). The **second pass (2026-08-19)** re-read the live v0.44.1 tree — `src/composition/discovery.ts`, `identifiability.ts`, `grounding.ts`, `adjudication.ts`, `uncertainty.ts`, `proposed-bridges.ts`, `user-equation.ts`, `enumerate.ts`, `axes.ts`, `canonical/{canonical-equation,normal-form,linkage}.ts`, `core/{types,cell}.ts`, `bridges/{observations/types,confrontations,rejected}.ts`, `src/cli/commands/*`, `data/bridge-catalog.schema.json`, `docs/research/{v0.33.0-discovery-hardening-results,pi-instrument-results}.md`, `docs/planning/{ACTIVE,Future-Production-Hardening}.md`, and `tests/composition/discovery-calibration.test.ts` — and corrected remaining collisions with shipped behavior and prior not-build decisions.

## First-pass corrections (still binding)

- Removed parallel `constraints/`, `discovery/`, and `evidence/` subsystems.
- Replaced universal `ScientificLaw` with an additive metadata envelope.
- Generalized pairwise `BridgeGap` into typed `FrontierGap`.
- Generalized residuals beyond additive subtraction.
- Made unknown/not-applicable/not-yet-audited metadata explicit.
- Restricted automated novelty, formal certificates, and causal language.
- Added exploratory-vs-confirmatory roles, holdout leakage prevention, MHC, canonicalized negative-result memory, hard search budgets, abstention, external-backend isolation, versioned schemas, blind + null-science benchmarks, experiment feasibility constraints, and graded reproducibility language.

## Second-pass findings (folded into the plan; none deferred)

1. **Two products, not one evolved funnel.** `discovery.ts` vets quantity identifications `a ≡ b` (pinned 132 / 7 / 35 / 20 / 0 / 70; 0/8 genuine). Expression/residual search is a different scientific question. Plan now freezes Product A and puts Product B in `src/composition/probe/`.
2. **CLI collision.** `upt discover`, `upt candidates`, `upt ground`, `upt connectors`, `upt predict` already exist. The CLI is a flat `registerCommand` map with positionals, not nested subcommands. New work is `upt probe <subverb>`.
3. **Identifiability mismatch.** `classifyIdentifiability` is graph-structural (`given` / `under-determined` / `exactly-determined` / `over-determined`), not parametric Jacobian rank. Plan now has a split assessment type.
4. **Forbidden new trees.** No `src/research/`, `src/data/`, `docs/architecture/adr/`, or top-level `benchmarks/` (conflicts with `docs/research/`, repo-root `data/`, planning-doc convention, and `bench/`).
5. **Tranche A / §23 contradiction.** Existing machinery cannot rediscover a pendulum equation. Family A calibration stays where it is; Family B fixtures are scored from hand-authored candidates before any generator exists.
6. **Phase-order MHC/holdout bug.** Discovery-hardening Unit B was cancelled as numerology (~730 expected chance hits). Generating in Phase 3 and adding MHC in Phase 5 would repeat that. Controls ship with the first generator.
7. **Phase 11 workbench contradicts** `Future-Production-Hardening.md` (viz in a separate repo) and duplicates `upt map`. Phase 11 is CLI + existing graph-viz.
8. **No Python in this repository** (`CLAUDE.md`, zero hard deps). External solvers are user-supplied workers; CI uses a fixture executable, never vendored SINDy/PySR.
9. **`field-equation` is not a sibling relation kind.** `CanonicalEquation` already carries L0/L1/L2; `FieldEquationNode` is Einstein-only and unread as a discovery IR.
10. **`PhysicalLaw` is legacy tensor-cell**, not L-layer ground truth. Eve already forbade `confidenceToStatus`. Plan records that decision instead of reopening it.
11. **Greenfield-named engines already exist:** `normal-form.ts`, `linkage.ts`, `adjudication.ts`, `rejected.ts`, `observations/types.ts`, `confrontations.ts` (`residualInSigma` + rigor hierarchy), `uncertainty.ts`, `diff/bridge-ast-gradient.ts`, `proposed-bridges.ts`, `user-equation.ts`, `enumerate.ts` (edge pairs, not AST search). Plan extends them.
12. **PI-instrument ceilings remain for Product A:** `mechanismTested: false`, `dataTested: false`; propose→confront on dimensional candidates was not-build.
13. **Id prefix `BG-*` dropped** (leftover BridgeGap). Use `fg-*` / `dr-*` / `h-*`.
14. **Append-only status requires `statusHistory`**, not a single overwritten `status` field.
15. **`rankDiscoveries` / `VettedCandidate` / `describeGrounding` / `classifyIdentifiability` are already on `src/index.ts`.** Probe types stay off-root until Phase 12.
16. **Rank-7 axes classify but do not gate.** Inferred symmetries must not flip `AxisSpec.gated`.
17. **“v1” is a program name**, not npm `1.0.0`, and not the historical P6 composition “v1.0” in `todo.md`.
18. **Task-0 + not-build authority** on every generating phase, matching project convention (design → Adam+Eve → Task-0 → TDD).
19. **Two rejection registries** (Product A `ADJUDICATIONS` vs Product B fingerprint store) plus `rejected.ts` for catalog membership — not one merged ledger.
20. **`enumerate.ts` is pairwise edge composition**, not a grammar enumerator. The native Product B enumerator is new code in `probe/generator.ts`.

## Review outcome

The corrected roadmap is suitable to drive a **Product B** implementation tranche subject to Phase 0A’s integration note and Adam+Eve review. Product A remains frozen. Strategic phases stay out of `docs/planning/ACTIVE.md` until a tranche is explicitly authorized.

Nothing from the second-pass finding list was deferred: each item is a binding requirement in the plan text.
