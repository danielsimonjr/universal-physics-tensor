# Active Engineering Backlog

This file is the machine-audited backlog for **current code work**. Historical implementation plans under `docs/planning/` are frozen design/review records; their unchecked boxes preserve the state of those documents at the time and are not a live completion ledger.

As of v0.44.1 completion hardening, there are no known unimplemented code tasks that block the repository's stated purpose as a computational laboratory for organizing, composing, evaluating, and confronting physics relations.

The next strategic evolution of the project is defined in [`Scientific-Bridge-Discovery-v1.md`](Scientific-Bridge-Discovery-v1.md) (re-audited against the v0.44.1 tree on 2026-08-19; see [`Scientific-Bridge-Discovery-v1-AUDIT.md`](Scientific-Bridge-Discovery-v1-AUDIT.md)): a phased plan that **freezes** the shipped identification funnel (`upt discover` / `VettedCandidate`) and, separately, adds an experimental expression/residual search pipeline (`src/composition/probe/`, CLI `upt probe`). That roadmap is intentionally separate from this machine-audited release-blocking backlog until individual phases are promoted into active engineering work. Do not treat Tranche A as authorized by this sentence.

Ongoing work that requires domain judgment rather than code completion lives in [`CONTRIBUTING.md`](../../CONTRIBUTING.md). Longer-horizon engineering ideas that are explicitly not release blockers live in [`Future-Production-Hardening.md`](Future-Production-Hardening.md).

## Release-blocking code

No open items.

## Active sprint — Atlas Roadmap, Sprint 3 (hyperedges, models, and the poster index, target v0.51–v0.52)

> **Heading corrected 2026-09-21.** It read "Phase 0 (oscillator pilot, target v0.46)" while the
> entries below had moved on to Sprint 2 — the ENTRIES were current and only their title was not.
> Worth saying why that is more than cosmetic: this file is the authorization gate, and a reader
> checking what is authorized reads the heading first. Sprint 0's box is open on purpose (two
> ROADMAP §7 exit criteria are unmet and neither is code), so a title naming Phase 0 next to a
> deliberately-open Phase 0 box reads as "still working on Sprint 0" rather than "Sprint 0's box is
> held open while Sprint 2 runs". Two correct signals combining into a wrong impression.
>
> **Heading moved to Sprint 3 on 2026-09-22** when Sprint 3 was promoted. Sprint 2 is CLOSED
> (lead wrap c43b442, CI green); its entry stays below as the record.
>
> **Sprints 4–6 are NOT authorized.** They have briefs in the implementation plan and no entry
> here, which is exactly the state that means "not promoted". This line said "3–6" until 05:50
> today and was made FALSE by the promotion above — a note that is corrected once and then not
> re-checked when the thing it describes moves is the same rot it was written to fix.

- [ ] **Sprint 0 — Oscillator pilot.** Promoted 2026-09-20 by the Lead, which is what authorizes
  [`Atlas-Roadmap-Implementation-Plan.md`](Atlas-Roadmap-Implementation-Plan.md) Sprint 0; nothing
  in that plan is authorized until its sprint is promoted here, and this line is the audited
  ledger (`tools/plan-doc-audit` walks this file only — the `- [ ]` boxes in the plan document
  itself are inert records).
  **Scope:** five typed bridges, one rejection, fifteen executable witnesses (`W1, W1a, W1b, W2,
  W2b, W3, W4, W5, W6, W7, W7b, W7c, W8, W8b, W9`), one complete record, the `(K, δ)` algebra and
  the family's regime records — all under `src/atlas/`, off the public barrel, with no change to
  any existing type. Curation cost is measured per bridge by relation type.
  **Entry conditions:** this line, plus `docs/planning/Atlas-Phase-0-Design.md` existing with Adam
  returning GREEN or a resolved YELLOW on it.
  **Boundaries:** every new symbol under `src/atlas/` is `@internal`; nothing is re-exported from
  `src/index.ts` before Phase 6; `BRIDGE_EQUATIONS` (55 rows) and `CATALOG_GRAPH` (41 edges) do
  not change shape; the pinned funnel counts 132 / 7 / 35 / 20 / 0 / 70 do not move.
  **▶ Status 2026-09-20 — code COMPLETE, box deliberately still OPEN.** All fifteen witnesses pass;
  126 atlas tests inside 384 files / 3,959 tests, exit 0; the JSON artifact is deterministic; the
  boundaries above all held (nothing on `src/index.ts`, 55 rows, 41 edges, funnel counts unmoved).
  The box stays unticked because two exit criteria in [`ROADMAP.md`](../../ROADMAP.md) §7 Phase 0
  are NOT met, and neither is code: **independent physicist review has not happened**, and
  **curation cost was measured per agent, not per bridge** — the scope line above says "per bridge
  by relation type" and that is not what was instrumented
  ([`Atlas-Phase-0-Curation-Cost.md`](Atlas-Phase-0-Curation-Cost.md) states so and does not
  estimate the missing rows). Ticking this on the code alone would record a measurement that was
  never taken. **Sprint 1 is therefore not promoted**; promoting it needs a decision on whether to
  accept the per-agent cost figure or re-measure.
  **Instrumentation fix carried into Sprint 1:** one agent per bridge where bridges are
  independent, or per-bridge start/stop timestamps in each agent's deviation report.

- [x] **Sprint 1 — Relation contracts as an additive overlay.** Promoted 2026-09-20 by the Lead
  under a standing instruction to run Sprints 0–6 continuously. That instruction is the decision
  the Sprint 0 entry above says is needed; recording it here rather than leaving the gap silent.
  **The per-bridge cost gap is addressed, not waived:** every Sprint 1 brief that owns more than
  one unit of work must timestamp per-unit start/stop in its deviation report, so Phase 1 returns
  the per-type measurement §L0.2 asks for and Phase 0 could not supply.
  **Scope:** `relation?`, `conventions?`, `counterexamples?` as OPTIONAL fields on `BridgeEdge`,
  `BridgeEquationEntry` and (`conventions?` only) `CanonicalEquation`; evidence tags **derived,
  never stored**; an `Association` registry; the 8×8 composition table defaulting to
  `no-composite-claim`; one overlay reconciled with the probe's existing `RelationKind` /
  `AuditState`.
  **Entry conditions:** this line, plus `docs/planning/Atlas-Phase-1-Design.md` carrying the
  reconciliation table and the composition matrix, with Adam GREEN or a resolved YELLOW on it.
  **Boundaries:** additive only — an edge or entry without overlay fields must behave
  byte-identically to today; `BRIDGE_EQUATIONS` stays 55 rows and `CATALOG_GRAPH` 41 edges;
  nothing new on `src/index.ts`; `src/composition/probe/types.ts` keeps
  `RelationKind`/`AuditState` and imports nothing from atlas; `docs:deps` reports no new cycle.
  **⚠ Boundary CORRECTED 2026-09-21 06:05.** This line previously said "no row edits", and that was
  wrong — it would have forbidden S1.5, which is the brief whose entire job is adding overlay fields
  to ten catalog rows. The invariant that actually holds is about COUNT and SHAPE, not immutability:
  no row is added or removed (55 stays 55, 41 stays 41), `status` is never touched, and rows gain
  only OPTIONAL overlay fields. Waves 1-2 edited no rows because they had no reason to, and I
  mistook that circumstance for a rule. **A consequence the wrap must not forget:** row edits
  invalidate the deep-equal pin in `tests/bridges/catalog-json.test.ts`, so that suite is EXPECTED
  RED from the moment S1.5 lands until the Lead runs `bun run catalog:json`.

  **▶ WRAPPED 2026-09-21 07:35. Ticked because Sprint 1's OWN scope is delivered; the ROADMAP
  Phase 1 exit criteria are a separate bar, and §7 records which one is NOT met.** On master, CI
  green at 8e8784f. Full suite 393 files / 4,083 tests, typecheck 0. Measured coverage: schema 55 ·
  audited 10 · not-yet-audited 45 · verified 0; atlas 5 bridges, 0 reviewed.
  Three exit criteria met (every field classified, coverage distinguishes the tiers, the five pilot
  bridges re-register). **One NOT met and not claimed:** "Eve spot-checks a random sample against
  the cited sources" — Eve reviewed design and code and returned two findings that both held, but
  she has no access to the papers and checked no citation against its source. I verified four of 22
  myself and confirmed none cites our own docs, which is a WEAKER claim than the criterion makes.
  `verified: 0` is the honest reading of it.
  **Adversarial review earned its place.** Adam caught a contradiction inside the implementation
  plan and an evidence rule that handed out free tags via `{}`; Eve caught a vacuous catalog
  measurement and a semantic clash that exposed a HALF-IMPLEMENTED deliverable — the
  rejection-counterexample link existed only for BE-35 while a special case forced the tag onto
  four other rows from no artifact at all.

- [ ] **Sprint 3 — Hyperedges, models, and the poster index.** Promoted 2026-09-22 05:50 by the Lead
  under the same standing instruction to run Sprints 0–6 continuously. **This line is what authorizes
  the plan's Sprint 3 briefs**; nothing in that document is authorized until its sprint is promoted
  here, and the `- [ ]` box is the audited ledger (`tools/plan-doc-audit` walks this file only).
  **A NOTE ON WHY THIS WAS LATE, corrected 2026-09-22 05:50 by the user.** Sprint 2 closed at 03:30
  and this was not promoted until he asked why I was waiting on him. The standing order already
  covered it, promotion is the Lead's act, and none of the confirm-first walls apply to
  implementation work in this repo.
  My first write-up of this said I had "accepted a peer's framing over a standing user order" and
  that "a peer cannot narrow an authorization the user gave". **That is wrong and the user corrected
  it: Mothership has authority to act on his behalf.** Her judgement that Sprint 3 was his call was a
  legitimate exercise of that authority; it was simply mistaken, which is a different thing and must
  not be recorded as an authority failure.
  **The error was mine and it was narrower.** The charter says that when my judgement and a standing
  order conflict I say so rather than silently complying or silently deviating. I saw the tension
  between "run Sprints 0–6 continuously" and her framing, and I silently complied — I neither raised
  it with her nor acted on the order. Surfacing a conflict costs one message; absorbing it costs a
  sprint.
  **Scope:** `Statement` and `Derivation` (many premises → one conclusion) with a
  compatibility-checked `contextUnion`; the `Model` record promoted from Sprint 0's `AtlasModel`
  (boundary/initial data, symmetry group); `CanonicalEquation.model?`; the sixteen poster entries with
  their hidden supporting nodes; all fifteen Appendix A bridge lines typed as Appendix A types them;
  `upt map --source=poster`.
  **Entry conditions:** this line, plus `docs/planning/Atlas-Phase-3-Design.md` existing with Adam
  returning GREEN or a resolved YELLOW on it.
  **Boundaries:** every new symbol stays `@internal` and off `src/index.ts` before Phase 6; only
  EXACT hyperedges compose, and a composite's premises are the union minus internal conclusions;
  incompatible assumptions are NEVER pooled in a context union; `7 ↔ 16` is an association for the
  historical link only. **No test pins the canonical count at 103** — `registry.test.ts` and
  `seed-l-layer.test.ts` compare against `CANONICAL_EQUATIONS.length`, so the number lives only in
  `CHANGELOG.md`, `ROADMAP.md` and the architecture docs, and adding L1 entries means updating those
  three by hand or the count silently drifts. That is the same second-source-of-truth shape this
  sprint should expect to find more of.

- [ ] **Sprint 2 — Regimes and error-carrying paths.** Promoted 2026-09-21 07:35 by the Lead under
  the standing instruction to run Sprints 0–6 continuously.
  **Scope:** `regime?` on edges and catalog rows BESIDE `ValidityDomain` (never replacing it);
  uniformity fields enforced at admission; machine-checkable horizons queried; `(K, δ)` path bounds
  through `propagateUncertainty`; regime-overlap and uncovered-region reports; the `upt regime` and
  `upt path` verbs; `upt map --relation= --evidence=` filters.
  **Entry conditions:** this line, plus `docs/planning/Atlas-Phase-2-Design.md` with Adam GREEN or
  a resolved YELLOW.
  **Boundaries:** a regime NEVER silently replaces a `ValidityDomain.predicate` — when both are
  present, `evaluateEdge` checks the predicate as today and ADDITIONALLY `regimeHolds` when the
  caller supplies group values. **The GR spine re-expression (`r_s/r`, `v/c`) must leave every
  confrontation number unchanged** — that is this sprint's load-bearing invariant and the one most
  likely to break silently, so it gets a before/after pin rather than a reading. Row/edge counts
  stay 55/41; nothing new on `src/index.ts`.
  **Carried from Phase 1:** Phase 2 supplies the edge data the composition table is waiting on, so
  its four conservative `'no-composite-claim'` rows become revisitable — widening any of them is a
  reviewed change that must fail the pinned cell-count test first.
