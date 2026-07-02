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
- **Funnel-count coupling (plan-vet r1, Adam HIGH):** ANY commit that changes funnel verdict counts re-pins the discover goldens AND the calibration benchmark in that same commit — no broken-CI window. In the r3 ordering only ONE commit moves funnel counts: Task 3's gate (Task 2's audit changes predict-side behavior but no funnel verdicts — verified in its Step 4). Corollary: the CLI's funnel-line `axis-clash` segment and AXIS-CLASH section land WITH the verdict's introduction (Task 3), because a 5-verdict library under a 4-bucket funnel line would print counts that don't sum.
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
- [ ] **Step 2:** implement the 4-entry mapping in `attributesOf` (a `const INFO_MAP: Record<InformationMeasure, RegimeAttributes['information']>`), preserving existing scale/force copying. Record in the module docstring the design-r3 fact: `toEdge` hardcodes `kind:'law'` and `regimesDiffer` has no call sites — this fix is annotation-correctness only (Task 0 verified law=66/bridge=0; no kind path exists, no delta to measure).
- [ ] **Step 3:** scoped test green; both tsc gates; commit: `fix(composition): canonical projection carries the information axis (enum reconciliation)`

---

### Task 2: D2 — the attribute AUDIT (r3 pivot; runs BEFORE the gate)

**PRECONDITION:** the controller has run the Adam+Eve adjudication over the FULL audit table (keep/strip/change for every already-tagged in-scope quantity + Task-0's 6 second-axis proposals + the generic-strip list + fold-conflict resolutions) and hands this task the ADJUDICATED table — it is the spec; changes not in it must not be made.

**Files:** Modify files under `src/composition/quantities/` (the `attributes` fields per the adjudicated table ONLY); Test `tests/composition/attribute-audit.test.ts` (new integrity test) + a new `upt predict` EXPECTED-style pin test (design r4, Eve #1); NO changes to discovery.ts or the CLI (the gate does not exist yet — funnel counts do NOT move in this commit).

- [ ] **Step 1 (consumer enumeration, design r4):** grep-enumerate every runtime consumer of quantity `attributes` (known: `bridge-prediction.ts`/`upt predict`; `canonical-graph.ts` projection; check whether `src/bridges/membership.ts` COMPUTES membership from attributes or merely documents the criterion — if computed, pin its outputs before stripping). Record findings in the report.
- [ ] **Step 2 (RED):** integrity test — every quantity in the adjudicated table carries exactly the table's attributes; every generic-list member carries NO attributes; all values within the `RegimeAttributes` unions. Plus the predict pin test: capture current `upt predict`-level placements (via the library: `placeQuantity`/`buildRegimeTensor` outputs for the affected quantities) as the BEFORE state in the test file's comment, assert the AFTER state per the table.
- [ ] **Step 3:** apply the table — strips (mass, temperature, and the adjudicated generics), changes, keeps (annotate keeps with `// audit 2026-07-02: kept — <rationale>` where the table gives one), the 6 completions with `// rationale: …` comments.
- [ ] **Step 4 (GREEN + blast radius):** integrity + predict-pin tests green; run any predict/regime goldens found in Step 1 and re-pin in this commit if they move; run the calibration benchmark — its counts must be UNCHANGED (no gate exists; if counts move, something unexpected consumes attributes in the funnel — STOP, report).
- [ ] **Step 5 (would-clash re-measurement, design r4):** re-run Task-0's would-be-gate measurement against the audited attributes; record "would-clash 90 → N (catalog) / 332 → M (both)" + the exact pair lists in the report and commit message. Task 3's benchmark delta MUST match this prediction.
- [ ] **Step 6:** append the dated audit section to `docs/research/discovery-precision-calibration.md` (the adjudicated table + strips + the would-clash movement).
- [ ] **Step 7:** scoped `tests/composition/` + both tsc gates; commit: `feat(composition): adjudicated regime-attribute audit (strip generics, resolve conflicts, complete axes)`

---

### Task 3: D1 — the axis gate + its CLI surfacing (ONE commit; runs AFTER the audit)

**Files:** Modify `src/composition/discovery.ts`; Modify `src/cli/commands/discover.ts`; Modify the discover goldens (Task 0's list); Modify `tests/cli/json-contract.test.ts`; Modify `tests/composition/discovery-calibration.test.ts`; Test `tests/composition/axis-gate.test.ts` (new).

The library verdict and its CLI rendering are one behavior change: a 5-verdict funnel under a 4-bucket funnel line would print counts that don't sum, and any funnel-count movement breaks discover goldens. Everything below is one commit.

**Interfaces (Produces):** `VettedCandidate` gains `readonly axisChecked: boolean` and `readonly axisClashes: readonly string[]`; verdict union gains `'axis-clash'`.

- [ ] **Step 1 (RED):** `tests/composition/axis-gate.test.ts` — drive `vetLinkCandidate`/`rankDiscoveries` with an injected minimal graph (the existing tests in `tests/composition/` show the fixture pattern — mirror it) covering: (a) both-stated scale clash → verdict `'axis-clash'`, score −1, `axisClashes: ['scale: quantum ≠ cosmological']`; (b) both-stated agreement → not clashed, `axisChecked: true`; (c) one side silent → abstain (`axisChecked: false` for that axis; verdict unaffected); (d) both silent → abstain; (e) a candidate that is BOTH numerically contradictory AND axis-clashed → verdict `'contradictory'` (precedence) but `axisClashes` still populated; (f) force-axis clash; (g) information mismatch → NO clash (annotation-only), but recorded via `axisChecked`/annotation fields exactly as the design specifies (information never enters `axisClashes`); (h) fold-conflict abstention — a node whose folded contributors disagree on an axis (fixture: the temperature fold, design r4/Eve #5) counts that axis as UNSTATED.
- [ ] **Step 2:** implement in `vetInContext`: effective attributes come from ONE exported resolver living with the QUANTITY_IDENTIFICATIONS fold data (design r4 single-resolver mandate) — it resolves a candidate name through the fold and drops any axis its contributors disagree on; the gate imports it, never reimplements it. Compute per-axis comparison over `scale` and `force`; build `axisClashes` sorted; slot the verdict per the precedence chain at :371-376 (magnitude → contradictory → axis-clash → …); score −1 for axis-clash (the falsified-score branch at :381). Update every internal exhaustive switch over the verdict union.
- [ ] **Step 3 (GREEN):** scoped run of the new test + the Phase-1 files (`tests/composition/adjudication-*.test.ts`).
- [ ] **Step 4 (benchmark):** run `tests/composition/discovery-calibration.test.ts`. The EXPECTED block changes NOW (the gate re-verdicts against the audited tags): update counts in THIS commit, and the delta MUST match Task 2 Step 5's would-clash prediction pair-for-pair — any mismatch means the gate or the resolver is wrong; STOP and investigate, never adjust the prediction. Pin the new `axis-clash` count AND the machine-readable LIST of pairs that flipped verdict (design r4, Eve #6). Add the canonical-only `axis-clash = 0` invariant ("for the current audit" comment + update protocol, verbatim from the design).
- [ ] **Step 5 (CLI surfacing):** `discover.ts` — funnel line gains the `· N axis-clash` segment in the existing counts' style; new `AXIS-CLASH` section mirroring `MAGNITUDE-CLASH`'s exact format (per-candidate row listing the clashing axis values), printed whenever ≥1 candidate carries the verdict; caption uses the pinned wording "identification falsified (stated regimes differ)". `--json`: verify `axisChecked`/`axisClashes` ride the sanitizer; funnel summary object gains the axis-clash count; add json-contract assertions.
- [ ] **Step 6 (goldens, same commit):** `npm run build`, then re-pin the discover goldens per `tests/cli/golden-capture.mjs`. Every diff must be exactly: the funnel-line segment (+ count movements if pre-tranche clashes exist, cross-checked against Step 4's delta) + the new section where applicable. Phase-1 no-resurface benchmark test must still pass.
- [ ] **Step 7:** scoped `npx vitest run tests/composition/axis-gate.test.ts tests/composition/discovery-calibration.test.ts tests/cli/`; both tsc gates; commit: `feat(composition): axis-compatibility falsifier with abstention (verdict 'axis-clash')`

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
- Controller-run mid-phase gate: the Adam+Eve adjudication of the FULL audit table (drafted from Task 0's data over the whole existing attribute surface) happens BEFORE Task 2 dispatches (r3 ordering: audit precedes gate).
- Ledger: `.superpowers/sdd/progress.md`, Phase-2 section.

## Task-0 revision record (r2 → r3, 2026-07-02)

Task 0 measured a substrate that invalidated the design's r2 premises (dense
registry: 68% pre-existing would-clash, 7/12 promising flips; mass/temperature/
planck-length already tagged; regimesDiffer uncalled; post-fold candidate
names with a temperature conflict; predict-side attribute consumers). Design
went r3/r4 (Adam GREEN; Eve YELLOW dispositions incl. two verified
fabrications rejected); the plan restructured to match: Task 2 is now the
attribute AUDIT (strip generics + adjudicated keep/strip/change + predict
pin + would-clash re-measurement), Task 3 is the gate (single shared
fold-resolver; benchmark delta must match the audit's prediction
pair-for-pair; flipped-pair list pinned machine-readably; fold-conflict
test case (h)); T1's dead delta-ceremony dropped; the audit-table
adjudication moved BEFORE Task 2.

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
