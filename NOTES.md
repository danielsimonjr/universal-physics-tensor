# NOTES.md — stateful (everything here carries an "as of" and is EXPECTED to go stale)

The law is `AGENTS.md`. **This file exists so that status never has to be written into a design
document.** If you are about to put MET / UNMET / a current count / a date into
`docs/planning/*`, it belongs here instead.

Rewrite freely. A stale line here is normal. A stale line in a design doc is a defect, because
nothing validates prose and the next reader cannot tell.

---

## As of 2026-09-22 (evening)

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
  **No LLM or embedding condition exists, so no paired comparison has been made.**
- **Practical value (Phase 5 criterion 5)** is defined as human time and error rate. It is **not
  converted** to a model measurement and stays unmet. Curation cost is recorded as **model cost**
  only: USD 19.34 for the set, about USD 0.15 per authored item.

### Results

- **Every registered witness has a negative control:** 14 numeric and 4 CAS. Of the 12 controls
  written on 2026-09-22, the **9 numeric** wrong hypotheses are **REFUTED** and the **3 CAS** ones
  are **UNRESOLVED, not refuted**. The simplifier cannot reduce `lhs − rhs` to zero, so those
  assert only "not checked". **Never merge those two counts.**
- **Link prediction is NEGATIVE.** Over 20 leave-one-bridge-out trials, text overlap **beats** the
  typed-graph predictor on both recall@10 (0.80 vs 0.70) and MRR (0.42 vs 0.28). This is a result
  and it is reported as one, not softened and not re-run looking for a better answer.

### Open defects and unknowns

- A **flaky test** has never been captured. A large number of green runs is evidence about those
  runs, not about the defect. It stays **OPEN** until captured failing, with its name and output.
- **Sprint 0 closure is unverified.** The Phase 0 curation-cost log said on 2026-09-20 that Sprint
  0 was not closed: `docs-fresh` was red and the wrap checklist was incomplete. `docs-fresh` was
  green on every push checked on 2026-09-22; the wrap checklist has not been re-checked.

### Measured facts about the tree (moved from `CLAUDE.md`; re-measure before quoting)

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

