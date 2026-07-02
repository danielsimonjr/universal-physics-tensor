# Discovery-Hardening Phase 2 (v0.32.0): Axis Falsifier + Honest Connectivity — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The discovery funnel gains its first mechanism-proxy falsifier (axis-compatibility over stated `RegimeAttributes`, with abstention), a conservatively-adjudicated tag tranche makes it bite, and `map`/`connectors` default to the honest combined graph.

**Architecture:** Per design r2 (`docs/superpowers/specs/2026-07-02-discovery-hardening-phase2-design.md`, Adam GREEN). Sequencing is D0's: enum-fix → gate core → tranche → CLI surfacing → defaults → cleanups → wrap. Every funnel-count change updates the Phase-1 calibration benchmark's `EXPECTED` block in the same commit with a delta list in the commit message.

**Tech Stack:** TypeScript 6 strict ESM, vitest 4. Zero new dependencies.

## Global Constraints

- ESM `.js` suffixes; zero hard deps; scoped vitest per task, full suite only at the release gate (Task 7).
- **Epistemic firewall:** tags and verdicts annotate/gate discovery output only; nothing mutates the catalog, graphs, or proposals.
- **Verdict precedence (design D1, vet-mandated):** `magnitude-clash` → `contradictory` → `axis-clash` → promising/inert. `axisChecked`/`axisClashes` populated on EVERY candidate regardless of winning verdict.
- **Abstention rule:** an axis participates only when BOTH endpoints state it. Information axis never falsifies this phase.
- **Generics never tagged:** `mass`, `radius`, `time`, `temperature`, `energy` (exact list finalized in Task 0) get no `RegimeAttributes`; contestable specifics (`planck-length`, `thermal-wavelength`) stay untagged in this tranche.
- **Wording pin:** user-facing text says "identification falsified (stated regimes differ)" — never "no connection possible".
- CLI reaches the library only via `ctx.api`; goldens re-pin in the same commit as the behavior change; `--json` additive only; errors never emit JSON.
- **Funnel-count coupling (plan-vet r1, Adam HIGH):** ANY commit that changes funnel verdict counts (T2's gate, T3's tranche) re-pins the discover goldens AND the calibration benchmark in that same commit — no broken-CI window. Corollary: the CLI's funnel-line `axis-clash` segment and AXIS-CLASH section land WITH the verdict's introduction (T2), because a 5-verdict library under a 4-bucket funnel line would print counts that don't sum.
- CHANGELOG carries: the TypeScript exhaustive-switch note for the `'axis-clash'` union growth, and the map/connectors default change as the headline.

---

### Task 0: Verification gate (no commit)

**Read:** `src/composition/discovery.ts` (all of `vetInContext`, :289-417), `src/composition/quantity.ts`, 2-3 files under `src/composition/quantities/`, `src/composition/canonical-graph.ts:80-170`, `src/cli/commands/{map,connectors,discover}.ts`, `tests/composition/discovery-calibration.test.ts`, `tests/cli/golden-cases.mjs`.

**Measure and record (report file, no commit):**
- [ ] Current funnel counts at HEAD (expect catalog 132/12/100/20/0 — verify).
- [ ] The quantity names appearing in current cross-cluster candidate pairs (catalog + both sources) — the tranche's candidate scope — and each one's CURRENT `attributes` (most will be empty; list which already state scale/force).
- [ ] **Pre-tranche gate impact:** which candidate pairs would ALREADY axis-clash from existing sparse tags alone (both-stated + different on scale or force). This parameterizes Task 2's benchmark delta.
- [ ] Canonical projected edge kinds pre-D4 (count of `law` vs `bridge` from `canonicalToEdges`) — Task 1 re-measures after the mapping to report the delta (design expects zero).
- [ ] Golden cases invoking `map` and `connectors` (from `golden-cases.mjs` args, the Phase-1 lesson — grep of golden text is misleading) and the discover cases (for Task 4).
- [ ] The exact generic-quantity list to exclude from tagging (start: mass, radius, time, temperature, energy; add any similarly generic names found in the pair scope).
- [ ] Draft tranche table: for each non-generic, non-contestable quantity in scope, the proposed scale/force assignment + one-line rationale + "untagged (ambiguous)" rows. **Deliver this table in the report — the controller runs the design-mandated Adam+Eve adjudication pass on it before Task 3 dispatches.**
- [ ] Confirm `VettedCandidate` is NOT currently root-exported (expected: true — Task 5 co-exports it; if it already is, the surface-snapshot update moves to Task 2).

---

### Task 1: D4 — information-enum reconciliation (lands first)

**Files:** Modify `src/composition/canonical-graph.ts` (`attributesOf`); Test `tests/composition/canonical-graph-information-axis.test.ts` (new).

- [ ] **Step 1 (RED):** test that a canonical equation whose `regime` carries an information measure yields projected endpoint `attributes.information` in kebab form (`vonNeumann`→`'von-neumann'`, `shannon`→`'shannon'`, `kolmogorov`→`'kolmogorov'`, `quantumDiscord`→`'discord'`); pick a real registry equation stating one (Task 0 read identifies one; if none exists in the registry, construct a minimal `CanonicalEquation` literal inline).
- [ ] **Step 2:** implement the 4-entry mapping in `attributesOf` (a `const INFO_MAP: Record<InformationMeasure, RegimeAttributes['information']>`), preserving existing scale/force copying.
- [ ] **Step 3 (GREEN + delta measurement — plan-vet r1 fold, no before/after gymnastics):** scoped test green; then add a test assertion PINNING the post-fix `kind:'law'`/`'bridge'` counts over `CANONICAL_GRAPH`, and compare those pinned values against Task 0's recorded PRE-fix counts (measured at HEAD before this task). Delta goes in the commit message — design expects zero; if kinds DID shift, STOP and report DONE_WITH_CONCERNS with the list (a kind shift changes graph semantics and the controller must adjudicate).
- [ ] **Step 4:** both tsc gates; commit: `fix(composition): canonical projection carries the information axis (enum reconciliation)`

---

### Task 2: D1 — the axis gate + its CLI surfacing (ONE commit; plan-vet r1 restructure)

**Files:** Modify `src/composition/discovery.ts`; Modify `src/cli/commands/discover.ts`; Modify the discover goldens (Task 0's list); Modify `tests/cli/json-contract.test.ts`; Modify `tests/composition/discovery-calibration.test.ts`; Test `tests/composition/axis-gate.test.ts` (new).

The library verdict and its CLI rendering are one behavior change: a 5-verdict funnel under a 4-bucket funnel line would print counts that don't sum, and any funnel-count movement breaks discover goldens. Everything below is one commit.

**Interfaces (Produces):** `VettedCandidate` gains `readonly axisChecked: boolean` and `readonly axisClashes: readonly string[]`; verdict union gains `'axis-clash'`.

- [ ] **Step 1 (RED):** `tests/composition/axis-gate.test.ts` — drive `vetLinkCandidate`/`rankDiscoveries` with an injected minimal graph (the existing tests in `tests/composition/` show the fixture pattern — mirror it) covering: (a) both-stated scale clash → verdict `'axis-clash'`, score −1, `axisClashes: ['scale: quantum ≠ cosmological']`; (b) both-stated agreement → not clashed, `axisChecked: true`; (c) one side silent → abstain (`axisChecked: false` for that axis; verdict unaffected); (d) both silent → abstain; (e) a candidate that is BOTH numerically contradictory AND axis-clashed → verdict `'contradictory'` (precedence) but `axisClashes` still populated; (f) force-axis clash; (g) information mismatch → NO clash (annotation-only), but recorded via `axisChecked`/annotation fields exactly as the design specifies (information never enters `axisClashes`).
- [ ] **Step 2:** implement in `vetInContext`: compute per-axis comparison over `scale` and `force` from the two quantities' `attributes` (resolve the `Quantity` objects the way the surrounding code already does — conform to reality); build `axisClashes` sorted; slot the verdict per the precedence chain at :371-376 (magnitude → contradictory → axis-clash → …); score −1 for axis-clash (the falsified-score branch at :381). Update every internal exhaustive switch over the verdict union.
- [ ] **Step 3 (GREEN):** scoped run of the new test + the Phase-1 files (`tests/composition/adjudication-*.test.ts`).
- [ ] **Step 4 (benchmark):** run `tests/composition/discovery-calibration.test.ts`. If Task 0 predicted pre-tranche clashes, the EXPECTED block changes — update it in THIS commit and put the per-candidate delta list in the commit message. Add the `axis-clash` count to EXPECTED (pre-tranche value, possibly 0). Add the canonical-only `axis-clash = 0` invariant test ("for the current tranche" comment + update protocol, verbatim from the design). (Vacuous-at-introduction is intended — it is the guard rail Task 3 must not break.)
- [ ] **Step 5 (CLI surfacing):** `discover.ts` — funnel line gains the `· N axis-clash` segment in the existing counts' style; new `AXIS-CLASH` section mirroring `MAGNITUDE-CLASH`'s exact format (per-candidate row listing the clashing axis values), printed whenever ≥1 candidate carries the verdict; caption uses the pinned wording "identification falsified (stated regimes differ)". `--json`: verify `axisChecked`/`axisClashes` ride the sanitizer; funnel summary object gains the axis-clash count; add json-contract assertions.
- [ ] **Step 6 (goldens, same commit):** `npm run build`, then re-pin the discover goldens per `tests/cli/golden-capture.mjs`. Every diff must be exactly: the funnel-line segment (+ count movements if pre-tranche clashes exist, cross-checked against Step 4's delta) + the new section where applicable. Phase-1 no-resurface benchmark test must still pass.
- [ ] **Step 7:** scoped `npx vitest run tests/composition/axis-gate.test.ts tests/composition/discovery-calibration.test.ts tests/cli/`; both tsc gates; commit: `feat(composition): axis-compatibility falsifier with abstention (verdict 'axis-clash')`

---

### Task 3: D2 — the adjudicated tag tranche

**PRECONDITION:** the controller has run the Adam+Eve pass on Task 0's tranche table and hands this task the ADJUDICATED table — the brief's table is the spec; assignments not in it must not be made.

**Files:** Modify files under `src/composition/quantities/` (the `attributes` fields of the adjudicated quantities only); Modify `tests/composition/discovery-calibration.test.ts` (EXPECTED — the big delta); Modify the discover goldens (funnel counts move again — same-commit coupling per Global Constraints); Test `tests/composition/attribute-tranche.test.ts` (new integrity test).

- [ ] **Step 1 (RED):** integrity test — for every quantity in the adjudicated table: `attributes` match the table exactly; a rationale comment exists (assert via a table-in-test mirroring name→expected attributes; the rationale lives as a doc comment at the assignment site, and the test pins the assignment values while the review pins the rationale); no generic-list member carries any attribute; all values within the `RegimeAttributes` unions.
- [ ] **Step 2:** apply the assignments with `// rationale: …` comments per the table.
- [ ] **Step 3 (GREEN + benchmark):** integrity test green; re-run calibration benchmark — update EXPECTED same-commit with the full before→after delta (which promising candidates moved to axis-clash — expect `grw-localization-rate ≟ hubble-rate` among them if the adjudicated table tags both; the commit message lists every moved pair). Canonical-only axis-clash must still be 0 — if not, a tag is wrong: fix the tag, never the pin, unless the controller adjudicates otherwise.
- [ ] **Step 4 (goldens, same commit):** `npm run build`, re-pin the discover goldens; every diff must be exactly the count/list movements from Step 3's delta (cross-check pair by pair; seeded-pair movements must keep the adjudication summary line and the Phase-1 no-resurface test coherent).
- [ ] **Step 5:** append the dated tranche section to `docs/research/discovery-precision-calibration.md` (the table + what the gate now kills + what it abstains on).
- [ ] **Step 6:** scoped `tests/composition/ tests/cli/` runs green; both tsc gates; commit: `feat(composition): adjudicated regime-attribute tranche (axis gate becomes load-bearing)`

---

### Task 4: D3 — `both` default for map + connectors

**Files:** Modify `src/cli/commands/map.ts` + `connectors.ts` (per-command default — NOT `graphs.ts:20`); their help text; `cli/README.md` (per-command default table + rationale); `README.md` (examples that imply catalog default for these two); regenerate `docs/architecture/PHYSICS_MAP.md` per its documented generation procedure; re-pin map/connectors goldens (Task 0's list).

- [ ] **Step 1:** flip the two defaults; banner lines already print the resolved source (verify in goldens).
- [ ] **Step 2:** docs per the design's fallout checklist. PHYSICS_MAP.md regeneration commit message states the content change is the intended honest-connectivity default; keep a catalog-only rendering alongside if the doc's existing structure shows variants. **If the documented regeneration procedure is missing or fails, repairing/creating it is IN this task's scope** (plan-vet r1 fold) — report what was repaired.
- [ ] **Step 3:** rebuild; re-pin goldens; every diff explained by the source change alone.
- [ ] **Step 4:** scoped `tests/cli/` green; both tsc gates; commit: `feat(cli)!: map and connectors default to --source=both (honest connectivity)`

---

### Task 5: D5 — cleanups

**Files:** Modify `src/index.ts` (+ public-surface snapshot per protocol); Modify `src/cli/commands/discover.ts`.

- [ ] **Step 1:** co-export `VettedCandidate` (type) + `rankDiscoveries` (value) from `src/index.ts`, matching section conventions; `npx vitest run tests/api/ -u`-style snapshot update ONLY if the api tests' documented protocol says so (mirror the Phase-1 fix's procedure recorded in `.superpowers/sdd/phase1/task-5-report.md`).
- [ ] **Step 2:** `discover.ts`: move `annotateAdjudications(ranked)` inside the non-`--derive` branch; assert via the existing json-contract `--derive` test still green.
- [ ] **Step 3:** scoped `tests/api/ tests/cli/` green; both tsc gates; commit: `feat(composition): co-export VettedCandidate + rankDiscoveries; annotate only on non-derive path`

---

### Task 6: Wrap — docs, CHANGELOG, todo, release gate

- [ ] `CHANGELOG.md` `[Unreleased]`: Added (axis falsifier + tranche + co-exports), Changed (map/connectors both-default HEADLINE; discover funnel line + AXIS-CLASH section; the TypeScript exhaustive-switch note for the verdict union growth), Fixed (information-axis projection).
- [ ] `todo.md`: Phase-2 entry updated; Phase-3 queued next.
- [ ] `npm run docs:deps` regen.
- [ ] Release gate: `npm run build && npm test && npm run smoke` + `npm audit`/`npm outdated` snapshot. Any failure → BLOCKED with verbatim output, no commit.
- [ ] Commit `docs: phase 2 wrap — axis falsifier + honest connectivity recorded`; release ritual (bump 0.32.0 → tag → publish) remains owner-triggered.

---

## Subagent dispatch notes

- Fresh implementer per task; briefs via `scripts/task-brief`; review packages via `scripts/review-package BASE HEAD` (record BASE before dispatch); reviewer must SendMessage its verdict before stopping.
- Model tiers: Task 1 cheap; Tasks 2-4 standard (funnel semantics, golden judgment — Task 2 is the largest task of the phase); Task 5 cheap; Task 6 standard. Final whole-branch review: most capable.
- Reviewer constraint blocks carry verbatim: the firewall, the precedence chain, the abstention rule, the generics-never-tagged list, the wording pin, and goldens-same-commit.
- Controller-run mid-phase gate: the Adam+Eve adjudication of Task 0's tranche table happens BETWEEN Task 2 and Task 3 dispatches.
- Ledger: `.superpowers/sdd/progress.md`, Phase-2 section.

## Plan-vet record (r1 → r2, 2026-07-02)

Adam (gemini-2.5-pro) plan-vet r1: **RED** — HIGH: broken-CI window T3→T4
(discover goldens break the moment funnel counts move; and worse, a 5-verdict
library under a 4-bucket funnel line prints counts that don't sum at T2).
**Folded in r2:** old T4's CLI surfacing merged INTO T2 (verdict + rendering
+ goldens + benchmark = one commit); T3 gains its own same-commit golden
re-pin; the funnel-count coupling promoted to a Global Constraint; T1's
before/after replaced with T0-recorded-before vs pinned-after (MEDIUM #2);
PHYSICS_MAP repair-or-create put in T4's scope (MEDIUM #3); T0 confirms
`VettedCandidate` is not yet root-exported (LOW #4). Tasks renumbered 0-6.
Adam's answer confirmed the T2-before-T3 vacuous invariant and the
between-task tranche adjudication are sound as scheduled.

## Self-review record (writing-plans checklist)

- Design coverage: D0-D6 all mapped to tasks (D0→ordering, D4→T1, D1+CLI→T2, D2→T0+T3, D3→T4, D5→T5, D6→T2/T3 benchmark steps + T3 research appendix; wrap→T6). ✓
- Placeholders: tranche assignments deliberately live in Task 0's measured, then adjudicated, table — a gate, not a TBD; axis-gate fixture pattern deferred to the existing test files' conventions with explicit conform-to-reality instruction. ✓
- Type consistency: `axisChecked`/`axisClashes`/`'axis-clash'` used identically across T2/T4 and the benchmark. ✓
- Known uncertainties (flagged): whether any pre-tranche clashes exist (T0 measures; T2 branches on it); whether a registry equation states an information measure (T1 has the inline-literal fallback); PHYSICS_MAP.md's generation procedure (T5 reads it before regenerating).
