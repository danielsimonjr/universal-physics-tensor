# NOTES.md — stateful (everything here carries an "as of" and is EXPECTED to go stale)

The law is `AGENTS.md`. **This file exists so that status never has to be written into a design
document.** If you are about to put MET / UNMET / a current count / a date into
`docs/planning/*`, it belongs here instead.

Rewrite freely. A stale line here is normal. A stale line in a design doc is a defect, because
nothing validates prose and the next reader cannot tell.

---

## As of 2026-09-23

### Phase exit criteria — kept separate from "tasks landed"

Those are different claims and merging them produces a false green.

- **Phase 4.** ≥ 20 bridges across ≥ 5 relation types: **met**, 20 bridges and 6 types.
  Zero `formally-proved` without a `formalRef`: **met by construction**. ≥ 5 bridges with a
  reviewed `formalRef`: **1 of 5**. The one counterpart is in Physlib (`ab-pendulum-linear`).
  Physlib has no further real counterpart, so the rest need proofs authored out of tree, in the
  `PhysJS` repo, which is **held by the owner**. Not startable from here.
- **Phase 5.** The frozen set is **no longer empty**: 125 frozen and 3 contested items, all
  MODEL-authored and MODEL-rated (`claude-fable-5-1`, pre-registration Amendment 2). Model-rater
  kappa: **0.984** valid/invalid, **0.978** nine-category. That is agreement between two
  instances of ONE model, not human inter-rater reliability.
- **Phase 6.** The study success path has **run once** on the non-empty set. It exposed two
  defects, both fixed: the validator rejected every "x = 0", and the atlas condition accepted items
  that no instrument had checked. Result: the atlas rejects **6 of 61** invalid items, all with the
  right failure kind, abstains on **116 of 125**, **1** wrong accept and **1** false reject.
  **Criterion 2 (atlas vs the best LOCAL LLM, Amendment 4): NOT MET.** qwen3.8:27b rejected 51/61
  invalid items against the atlas's 6/61; the interval for the difference is −73.8%
  [−82.7%, −58.7%]. The atlas made 1 wrong accept against 9–13 for the models, by abstaining on
  116/125. gemma4:26b returned empty answers
  on 64/125 items under the frozen 8,192-token context.
- **Criterion 3 (recall@10, typed structural search vs embeddings): INTERIM, no verdict** (as of
  2026-09-24; pre-registration Amendment 8). The in-process conditions ran on PRIMARY (n = 50, MODEL
  labels): text retrieval 34/50 = 68.0% [54.2%, 79.2%]; symbol matching and typed structural search
  both 12/50 = 24.0% [14.3%, 37.4%], and 0/30 on the in-distribution families. The typed structural
  tier never fired (0 of 11,125 key equalities): 123/125 queries are `lhs − rhs` residuals and the
  corpus stores right-hand sides. Every expression-condition hit is fluid statics, sharing only `g`
  (one hit is an id tie-break). The embedding condition waits for LLMBench
  (`docs/research/atlas-study-results.md`).
  EXPLORATORY, post hoc (Amendment 9): with the corpus in residual form, `target − scalarAst`, typed
  structural search is still 12/50 = 24.0% on PRIMARY and 0/30 in-distribution. The keys now match in
  4 of 11,125 pairs, and all 4 are correct references. The remaining misses are real formula
  differences, not a representation mismatch. It never replaces the criterion.
- **Baseline construction (from that run):** a reasoning model needs a context that holds its
  reasoning AND its answer. With `num_ctx` 8192, gemma4:26b's reasoning filled the context on 64/125
  items and left the answer empty. Size the context per model before freezing a baseline config.
- **Owner decisions (2026-09-23):** exported atlas data is CC BY 4.0 (`LICENSE-DATA`) and the code
  stays MIT; one maintainer across all families, by choice; no hosted frontier-LLM run (Amendment
  5); reviewer time is not measured, because there are no independent human reviewers.
- **Amended 2026-09-23 by Mothership under the owner's delegation** (pre-registration Amendment 6,
  ROADMAP §7): the reported κ is MODEL agreement and human κ is NOT MEASURED; criterion 5 (practical
  value, human time and error rate) is NOT MEASURED; per-bridge curation cost (Phases 0 and 4,
  criterion 6) is NOT MEASURED, and the reported cost is the MODEL cost, USD 19.34 for the set, about
  USD 0.15 per authored item. These are amendments, not met criteria.
- **Phase 0 independent physicist review: AMENDED 2026-09-24** (pre-registration Amendment 7). NOT
  MEASURED (no human reviewer). A model-persona review (Fable) returned 13 findings; 9 are fixed with
  tests and 4 stand with evidence (`docs/research/phase-0-model-persona-review.md`).

### Separate from the criteria above

- **Uniformity.** `ApproximationBound.uniformity` is required (`readonly string[] | null`).
  `boundPath` returns `uniformity-unanalysed` and no number when any bound on the path has
  `null` or `[]`. Construction does not throw. `propagateUncertainty` does not implement this
  gate.
- **Architecture-docs gate in CI: decided, not pending** (owner, relayed by Mothership 2026-09-23). No
  credential, no publish, no copy of the private `skills` tooling. The gate stays in the pre-push hook.
  The architecture docs are updated by hand from the data of this repository's own
  `tools/create-dependency-graph`, until `repo-tools` replaces that tool.
- **Still not startable here:** the other four reviewed `formalRef`s; an independent physicist
  review; per-bridge person-hours (the logs are per agent / per batch); embeddings (no worker);
  a separate data licence (owner decision).
- **Standing physicist-review surfaces** (moved from `docs/architecture/OVERVIEW.md` on 2026-09-23;
  not re-checked then): the CONTRIBUTING.md tasks; the contested BE-44/46/50 adjudications; the
  C2/C3 calibration targets; the CI-1/CI-2 dynamic-scaling call; and the §XXVII-B adjudication of the
  Part-XI machine-derived proposals.
- **Composition table** remains 56 silent cells. Widening was not done.
- **`8 → 12`** direction is unresolved. The poster records it as one approximation, `d-8-to-12`.

### Results

- **Every registered witness has a negative control:** 14 numeric and 4 CAS. Of the 12 controls
  written on 2026-09-22, the **9 numeric** wrong hypotheses are **REFUTED** and the **3 CAS** ones
  are **UNRESOLVED, not refuted**. The simplifier cannot reduce `lhs − rhs` to zero, so those
  assert only "not checked". **Never merge those two counts.**
- **Link prediction is NEGATIVE.** Over 20 leave-one-bridge-out trials, text overlap **beats** the
  typed-graph predictor on both recall@10 (0.80 vs 0.70) and MRR (0.42 vs 0.28). This is a result
  and it is reported as one, not softened and not re-run looking for a better answer.

### Open defects and unknowns

- A **flaky test WAS captured failing** on 2026-09-23 19:50, in the pre-push gate for `e1b7bea`
  (a docs-only commit): `tests/composition/probe/coverage-backfill.test.ts > backend nonzero exit +
  store illegal transition > reports worker stderr on nonzero exit`, `AssertionError: expected 'worker
  timed out after 1000ms' to match /exited 2/` (line 464). The test gives `runBackendWorker` a
  1000 ms budget to spawn `node -e "process.exit(2)"`; the budget includes process start-up, and a bare
  spawn of that command measured 843–4307 ms on the loaded host at the time. It was a wall-clock race by
  design. Whether it is the flaky test seen before is unknown. **Race removed** in the item-1 fix (see
  `CHANGELOG.md`): the test now drives a fake worker with no clock; five real-worker siblings in the
  same race class use a named 30 s hang guard. A real-process test can still lose to a start-up
  longer than that guard.
- **Sprint 0 closure is unverified.** The Phase 0 curation-cost log said on 2026-09-20 that Sprint
  0 was not closed: `docs-fresh` was red and the wrap checklist was incomplete. `docs-fresh` was
  green on every push checked on 2026-09-22; the wrap checklist has not been re-checked.

### Measured facts about the tree (moved from `CLAUDE.md`; re-measure before quoting)

- **Lines of code (whole repository):** 135,606, from `repo_map` `totalLinesOfCode`, measured
  2026-09-23 at `67caf85`. Not gated; see `docs/architecture/OVERVIEW.md`.
- **Toolchain:** TypeScript `^7.0.2` (verified 2026-09-22). The full suite ran 4,659 tests at
  `cbf2e40` (2026-09-22); it took about 58 s warm when measured on 2026-09-21.
- **Bridge catalog** (measured 2026-09-21 from the built registries): 55 bridges, IDs 11–65, which
  project to 41 composition-graph edges. 13 are AST-less (BE-51, 52, 55…65), and 17 have no graph
  edge (BE-28, 29, 32, 35, 40, 44, 55…65). `upt map` finds 23 connected components: one anchored
  cluster of 16, two small clusters, and 20 isolated bridges. Status distribution (re-tallied
  2026-07-05): 19 established, 33 speculative, 3 highly speculative, 0 invalid.
- **Axes:** `RegimeAttributes` carries six axes (scale, force, information, symmetry, topology,
  statistics). `GATE_AXES` is scale and force; topology, symmetry and statistics are typed and
  wired but ungated, for thin coverage.
- **CLI:** the `upt` CLI (22 data-bearing commands + `help`/`version`).
- **Atlas families:** oscillators 9 models, 5 bridges, 1 rejection; diffusion 8 models, 8 bridges;
  waves 7 models, 7 bridges.
- **Atlas import sites** (measured 2026-09-22): value imports at `bridges/index.ts:40`
  (`deriveRegimeGroups`), `composition/compose.ts:46-47` (`composition-table`, `conventions`) and
  `composition/graph-viz.ts:28` (`derive-evidence`); type-only imports from `atlas/types.ts` at
  `bridges/index.ts:36`, `composition/compose.ts:48`, `composition/edge.ts:24`, `graph-viz.ts:24`
  and `uncertainty.ts:25`.
  `docs:deps` reports 0 circular dependencies.
- **Dependabot PRs open against the lockfile problem** described in `MEMORY.md` (Stack): UPT #177–181.

