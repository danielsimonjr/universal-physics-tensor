# Active Engineering Backlog

This file is the machine-audited backlog for **current code work**. Historical implementation plans under `docs/planning/` are frozen design/review records; their unchecked boxes preserve the state of those documents at the time and are not a live completion ledger.

As of v0.44.1 completion hardening, there are no known unimplemented code tasks that block the repository's stated purpose as a computational laboratory for organizing, composing, evaluating, and confronting physics relations.

The next strategic evolution of the project is defined in [`Scientific-Bridge-Discovery-v1.md`](Scientific-Bridge-Discovery-v1.md) (re-audited against the v0.44.1 tree on 2026-08-19; see [`Scientific-Bridge-Discovery-v1-AUDIT.md`](Scientific-Bridge-Discovery-v1-AUDIT.md)): a phased plan that **freezes** the shipped identification funnel (`upt discover` / `VettedCandidate`) and, separately, adds an experimental expression/residual search pipeline (`src/composition/probe/`, CLI `upt probe`). That roadmap is intentionally separate from this machine-audited release-blocking backlog until individual phases are promoted into active engineering work. Do not treat Tranche A as authorized by this sentence.

Ongoing work that requires domain judgment rather than code completion lives in [`CONTRIBUTING.md`](../../CONTRIBUTING.md). Longer-horizon engineering ideas that are explicitly not release blockers live in [`Future-Production-Hardening.md`](Future-Production-Hardening.md).

## Release-blocking code

No open items.

## Active sprint — Atlas Roadmap Phase 0 (oscillator pilot, target v0.46)

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
