# Atlas Phase 0 — curation cost log

**Purpose.** Sprint 0's measurable output. The pilot exists to measure what a typed relation costs
to curate **by relation type**, because that number gates Sprint 4 and Sprint 5 scope
([`Atlas-Roadmap-Implementation-Plan.md`](Atlas-Roadmap-Implementation-Plan.md) §L0.2).

**Source:** the Sprint 0 session record.

---

## ⚠ Read this before using the numbers

The design note's own honesty rule for this table says: *"Hours are recorded as measured wall-clock
attributable to the bridge, not estimated afterwards from memory. A bridge whose cost cannot be
separated from another's is recorded as a shared row with both ids and said so."*

**Per-bridge cost was NOT instrumented, and I am not going to invent it.** Work was dispatched
per-agent, not per-bridge, so the finest honest granularity is **per agent**, and several agents
owned two or three bridges. Splitting an agent's wall-clock across its bridges by intuition would
manufacture exactly the number this table exists to measure — the same failure as the citation
theatre removed from `bridges-exact.ts` on the same evening.

**What is measured:** Lead wall-clock between commits, and each agent's file/test output. **What is
not:** per-bridge authoring hours, and reviewer hours attributable to a single bridge.

**Instrumentation fix for Sprint 1:** dispatch one agent per bridge where the bridges are
independent, or require each agent to timestamp its own per-bridge start/stop in its deviation
report. Either makes the row honest without extra Lead effort.

---

## Measured — per agent

| Agent | Relation type(s) | Bridges / artefacts owned | Wall-clock (dispatch → boundary) | Tests added |
|---|---|---|---|---|
| S0.1 | — (foundation) | types, error algebra, regime, 9 models, dimensions | ~40 min | 3 files |
| S0.2 | — (foundation) | RK4 helper, `./atlas` subpath, schema, 2 guards | ~40 min (parallel with S0.1) | 4 files |
| S0.3 | `exact-equivalence` ×2 | `ab-spring-lc`, `ab-damped-rlc` | ~35 min (parallel) | 1 file, W1/W1a/W1b/W2/W2b |
| S0.4 | `approximation` ×2 (one regular, one **singular**) | `ab-pendulum-linear`, `ab-damped-massless` | ~35 min (parallel) | 1 file, W7/W7b/W7c/W8/W8b |
| S0.5 | `coarse-graining` ×1 + **rejection** ×1 | `ab-chain-wave`, `ax-cubic-spring-lc`, quantum support | ~35 min (parallel) | 2 files, W3/W4/W5/W9 |
| S0.6 | — (assembly) | family, serialize, emitter, evidence rule | ~25 min | 4 files |

Waves 1–3 spanned roughly **19:45 → 20:28** of Lead wall-clock, three parallel agents at the widest
point. Totals: **14 test files, 126 atlas tests**, inside a full suite of **384 files / 3,959 tests**.

## Measured — review cost, which is NOT per-bridge either

| Reviewer | Stage | Scope | Found |
|---|---|---|---|
| Adam (Gemini 2.5 Pro) | pre-implementation | design note + all S0 briefs | **1 RED** — the plan's own W6 arithmetic, `(30,17)` → `(30,32)` — and 3 YELLOW |
| Eve (OpenAI o3), early cross-check | pre-implementation | the same numeric claims, Adam's verdict withheld | confirmed 20/21; **wrong** on the W7 residual, from a series-truncated `K` |
| Eve (OpenAI o3), E0 | post-implementation | items 1–7 from first principles | **every numeric item confirmed**; challenged the *type* of `ab-spring-lc` |

## The finding this table is actually for

**Relation type did not drive cost in Sprint 0; SPECIFICATION QUALITY did.** All three bridge agents
took about the same wall-clock regardless of whether they were implementing an exact equivalence, a
singular approximation or a coarse-graining. The two defects that cost real time were both in the
**plan**, not in any bridge:

1. the W6 arithmetic error, caught by Adam before implementation;
2. `deriveRegimeGroups` double-adding dimensionless inputs, caught by measuring `buckinghamPi`
   rather than reading it.

Each would have produced a confidently wrong test. Neither is a function of relation type.

**Implication for Sprint 4/5 scoping:** budget adversarial review of the *specification* at least as
heavily as implementation, and do not assume an exotic relation type costs more to curate than a
simple one. On this evidence it does not — a wrong number in the brief costs more than a hard
bridge.
