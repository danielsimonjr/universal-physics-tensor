# Discovery-Hardening Phase 4 (v0.34.0) — Mechanism-Sensitive Signals: Design

**Date:** 2026-07-03 · **Status:** r2 — Adam RED + Eve YELLOW (r1); the shared
HIGH (unsound contradiction logic) confirmed and corrected, scope split
accepted, findings adjudicated below. Awaiting re-vet.
**Program:** Phase 4 (P2 + P5) of
`docs/superpowers/specs/2026-07-02-discovery-hardening-program-design.md`.
**Premise:** the funnel's falsifiers to date (dimension, magnitude, axis) are
all *structural proxies* — none follows what an identification a≡b actually
*implies*. Every adjudication round scored 0/8 genuine; the missing capability
is a signal that reads mechanism. This phase adds the first two.

**Substrate verified at HEAD** (full capability map in the design record
below; grounded, not assumed — the Phase-3 lesson): `deriveProposedBridges`
already derives identity-consequences as validated `ProposedBridge` ASTs but
only *dedups* them by `normalForm`; `normalForm`/`structurallyEqual` are the
right comparators and collapse dimensionless constants; `buckinghamPi` is an
exact-rational null-space enumerator with **no bounds of any kind**;
`proposeLinkCandidates` generates equal-dimension cross-cluster pairs only.

---

## Scope recommendation (the key open decision)

The program bundles Phase 4 as P2 (consequence propagation) **+** P5 (bounded
Buckingham-π). The substrate map shows they share **no code**: Unit A builds on
`deriveProposedBridges`+`normalForm`; Unit B needs a new dimension-spanning
tuple generator over `buckinghamPi` plus a bounding primitive that does not
exist. Unit A is a focused extension of a working path; Unit B's bounding is a
distinct hard problem (the program vet already flagged it Eve-HIGH:
"naive enumeration over 131 quantities is intractable").

**Recommendation: ship Unit A as v0.34.0; split Unit B to its own design +
release (v0.34.1 or Phase 4b).** Rationale: (1) they're independent
subsystems — the writing-plans scope-check says split; (2) Unit A alone is a
complete, valuable, benchmark-measurable release (the machine pre-classifier
for the adjudication ledger); (3) Unit B's bounding deserves a focused design
+ its own Adam/Eve vet rather than riding A's; (4) the Phase-3 precedent
favors honest smaller scopes over an inflated one. **This is an owner/vet
decision** — both units are designed below so either path is ready. If the
owner keeps them bundled, the plan carries both with Unit B's bounding as the
gating risk.

**r2: the split is now ACCEPTED (Adam LOW #7 + Eve concur — functionally
independent, no shared code, B's bounding warrants its own cycle).** Unit A is
v0.34.0. Unit B (below) is deferred to its own design; its arbitrary-bound
findings (K, tolerance, RREF load, single-invariant recall — Adam #3, Eve
#8/#9/#10) are dispositioned THERE, not here. Eve #11 ("split leaves a
half-feature / 404s") is rejected: nothing in v0.34.0 calls a bounded-π helper
because it isn't built — there is no dangling reference to gate.

---

## Unit A — Consequence propagation (the machine pre-classifier)

### The idea

The adjudication ledger (Phase 1) records *human* verdicts: `genuine` /
`decoy` / `entailed` / `deferred`. Consequence propagation computes the
**machine analog** of `entailed` vs `decoy` vs `novel`, automatically, for
every promising candidate — focusing the human review without replacing it.

Given a promising candidate a≡b, `deriveProposedBridges` already produces the
consequence: the `ProposedBridge` obtained by treating a≡b as equating two
source equations and solving for a leaf, as a dimensionally-validated
`scalarAst` with a `normalForm`. Unit A adds **the comparison step that does
not exist today**: hash the consequence's `normalForm` and compare it against
the `normalForm` of every canonical equation for the *same target quantity*.

### The verdict (r2 — unsound contradiction signal DROPPED)

**r1's `consequence-contradiction` was unsound** (Adam #1, Eve #1, both HIGH):
it treated "two differing valid monomials for the same target T" as a
contradiction, but a quantity legitimately has many valid expressions over
*different governing sets* (E=mc², E=hf, E=k_BT) whose `normalForm`s differ
without any contradiction. A `normalForm` mismatch is NOT a falsification.
r2 removes that signal entirely; the sound signals are:

For a consequence deriving target T (with governing set G):

- **`entailed`** — the consequence's `normalForm` **exactly matches** a
  canonical equation's `normalForm` for the SAME target T **and the same
  governing set G** (not merely the same target — the r1 error was comparing
  across governing sets). An exact structural match over identical inputs
  means the identification re-derives that known equation: consistent, not
  novel. Machine analog of the ledger's `entailed`. This match is SOUND
  because `normalForm` already collapses dimensionless-constant and
  commutative-reordering differences (substrate-verified — this is why Eve's
  r1 "c²m vs mc² would mis-fire" concern is refuted: reordering hashes equal).
- **`novel-consequence`** — the consequence is dimensionally valid and no
  canonical equation matches it over any governing set. A new, non-contradicted
  relation candidate. Machine analog of a *candidate for* `genuine` (never a
  claim of genuineness).
- **`consequence-invalid`** — substituting a≡b into the source equation
  produces a **dimensionally invalid** AST (the `validate` step rejects it).
  This is the ONLY sound machine contradiction: it's a hard type error, not a
  structural preference. (It largely overlaps what the existing dimensional
  validator + retrodiction already catch; consequence-propagation surfaces it
  at the symbolic-substitution step. It is NOT a `normalForm` mismatch.)
- **`inconclusive`** — no consequence derivable (the monomial-only limit of
  `derivePair`: sums/transcendentals/≠1-free-leaf abstain, per Adam #2 /
  Eve #6 — expected to be the majority; see the yield note). No signal.

### Integration + the epistemic firewall

- New fields on `VettedCandidate` (the map's confirmed plug-in point,
  computed in `vetInContext`): `consequenceSignal:
  'entailed'|'novel-consequence'|'consequence-invalid'|'inconclusive'` and
  `consequenceEvidence: readonly { target: string; governing: readonly
  string[]; derivedNormalForm: string; canonicalMatch: string | null;
  sourceEquationIds: readonly [string,string] }[]`. **`consequenceSignal` is a
  SEPARATE field — the existing `verdict` enum
  (`promising|inert|contradictory|magnitude-clash|axis-clash`) is UNCHANGED**
  (Eve #7: no old consumer of `verdict` sees a new member, nothing crashes).
- **Graph source (r2 — Adam #4 / Eve #3, the source-mismatch fix):**
  consequence-propagation runs on the SAME graph as the funnel it annotates —
  catalog candidates (`rankDiscoveries(CATALOG_GRAPH)`) compared against the
  **canonical registry** as the reference equation set (the canonical L-layer
  is the "known physics" oracle, independent of which candidate graph is being
  vetted). The r1 text implied `deriveProposedBridges`'s CANONICAL_GRAPH
  default; r2 makes the candidate source explicit and per-funnel, and the
  canonical reference is the registry, not the candidate graph — so Task-0
  measures on exactly the surface the CATALOG benchmark guards.
- **Annotation-ONLY, zero ordering effect (r2 — Adam #5 / Eve #5, the masking
  fix):** consequence-signals are displayed columns/trailers ONLY. They do
  **not** re-order the ranked list and do **not** change `score` or `verdict`.
  A candidate keeps exactly the position its structural verdict gave it; the
  consequence-signal appears beside it. This removes the "demote below a
  display fold → hidden" risk entirely (a re-order, even without deletion,
  could mask a candidate; annotation cannot). A future release MAY wire the
  signal into ordering, but only after the benchmark calibrates it — not in
  this phase.
- **Firewall (binding):** the machine signal ANNOTATES output; never mutates
  `BRIDGE_EQUATIONS`/`CANONICAL_GRAPH`; never overrides a human ledger verdict
  (human wins if present); never written to `adjudication.ts`'s
  `ADJUDICATIONS` (human-authored only). The `'unadjudicated'` firewall on the
  underlying `ProposedBridge` is unchanged.

### Benchmark gate + Task-0 (binding)

Because consequence-signals are annotation-only (no ordering/score/verdict
effect), the Phase-1 calibration benchmark is **byte-identical except for the
two new additive fields** — the funnel counts (132/7/35/20/0/70) cannot move.
That is the primary safety property: a mis-classified signal cannot regress
recall or resurface a decoy, because it changes no ranking. (This is the r2
answer to the false-kill risk — annotation can't kill.)

**Task-0 measures** the consequence-signal distribution over
`rankDiscoveries(CATALOG_GRAPH)`'s promising set (and canonical): how many
`entailed` / `novel-consequence` / `consequence-invalid` / `inconclusive`.

**Positive-control reference (r2 — Eve #4, replacing the vacuous guard):** the
"no false kill" guard was vacuous because the funnel has 0/8 genuine
candidates. r2 replaces it with a CONCRETE positive control that DOES exist:
the **established/data-confronted relations** (the 8 established bridges + the
5 confronted ones) and the **8 human-seeded ledger verdicts**. Task-0 asserts
that when consequence-propagation is run over KNOWN-GOOD identity relations
drawn from these (e.g. a canonical equation fed its own governing set), it
classifies them `entailed` (exact self-match), NOT `consequence-invalid` — a
fixture positive control that is non-vacuous. If a known-good relation is
machine-classified `consequence-invalid`, the substitution/validation wiring
is wrong and the phase stops at Task-0 (Phase-2 precedent: a measurement gate
outranks a design). Since signals are annotation-only, this guards
*correctness of the signal*, not *safety of the funnel* (which is guaranteed
by the byte-identical benchmark).

### Yield note (Adam #2 / Eve #6 — expected-low, and that's acceptable)

`derivePair` is monomial-only, so a large fraction of candidates will be
`inconclusive`. **Low yield is an acceptable outcome, not a failure:** even a
handful of `entailed` detections (candidates that merely re-derive known
physics) is a real review-focusing signal, and `novel-consequence` flags the
few most-interesting candidates. Task-0 reports the actual yield; if it is
literally zero `entailed`+`novel` across both graphs, the feature ships as a
measured-negative-result annotation (honest) rather than being cut — but the
owner is told the yield at Task-0 so the ship/defer call is informed.

### CLI surface

`upt discover` gains a consequence column/section: promising candidates show
their `consequenceSignal`; a new `--consequences` flag (or reuse `--derive`'s
output) lists the derived consequence + its canonical match/contradiction.
`--json` gains the two additive fields. No new top-level command needed.

---

## Unit B — Bounded Buckingham-π cross-cluster discovery (SPLIT — deferred to its own design)

*r2: the split is accepted. This section is preserved as the STARTING POINT
for Unit B's own design + Adam/Eve vet (a future release, v0.34.1 or Phase 4b),
NOT part of v0.34.0. The arbitrary-bound findings below (K, tolerance, RREF
load, single-invariant recall) are explicitly deferred to that design, where
each bound gets a calibration methodology. Do not implement Unit B from this
design.*

### The idea

The 20 isolated bridges share no quantity with the core. A dimensionless
π-group linking an isolated bridge's quantity to core quantities — especially
one whose numeric value lands near a recognizable constant (1, 2π, ln 2,
α ≈ 1/137) — is a hint of a hidden relation the equal-dimension pair generator
cannot see (it only pairs *equal*-dimension quantities; π-groups span
*unequal* dimensions).

### The bounding (Eve-HIGH from the program vet — the crux)

`buckinghamPi` has no bounds; a search over 131 quantities choose ≤4 is ~10⁷
groups — intractable. The bound has THREE layers, all mandatory:

1. **Seed from the frontier, not the whole catalog.** Enumerate only groups
   that contain ≥1 quantity from an **isolated or small-cluster bridge** (the
   discovery target — the things we want to connect). This is ~20 seed
   quantities, not 131.
2. **Bounded companion pool.** Extend each seed with quantities drawn ONLY
   from a small curated pool P: the fundamental constants (c, ħ, G, k_B, e —
   the 5 already in `FUNDAMENTAL_CONSTANT_SUBSETS`) plus the anchored-cluster
   **hub** quantities (the highest-degree core nodes, capped at K, K≈15).
   Groups are `{seed} ∪ (subset of P of size ≤3)` → ≤ 20 × Σ_{k≤3} C(20,k) ≈
   20 × 1350 ≈ 27k `buckinghamPi` calls, each on ≤4 exact-rational rows.
   Tractable and cheap.
3. **Rank cutoff → single invariant.** Keep only groups whose `buckinghamPi`
   verdict is `'single-invariant'` (exactly one π-group, n−r=1). Multi-invariant
   groups are dimensional coincidences with too many free exponents to be a
   meaningful relation.

### The discovery filter (what makes it a signal, not noise)

Of the surviving single-invariant groups, surface ONLY those whose π-group,
numerically evaluated at the quantities' `RepresentativeValue`s, lies within a
tight relative tolerance of a **recognizable constant** from a fixed table
{1, 2π, 4π, ½, ln 2, α, 1/α, √2π, …}. This is both the discovery signal AND a
natural final bound (almost all random π-groups miss every named constant).
Each hit is an `'unadjudicated'` review item — NEVER a catalog entry (same
firewall as `proposed-bridges`).

### Honest-degenerate warning (binding)

A π-group near a constant is a **coincidence-heavy** signal — `bridge-analysis`
already documents "same dimension is a WEAK prior," and π-near-a-constant is
weaker still. The output must carry the epistemics banner that these are
numerology candidates for a physicist to reject or investigate, not
discoveries; the research note (P10) records the yield honestly (expected:
mostly rejected).

### Why split

Unit B needs: a dimension-spanning tuple generator (generalizing
`proposeLinkCandidates` from equal-dim pairs), a bounded enumeration primitive
(none exists), the recognizable-constant table + tolerance calibration, and
its own benchmark line. That is a full design + vet's worth of surface,
independent of Unit A. Bundling risks Unit A's clean release on Unit B's
bounding.

## Program invariants (bind both units)

- **Epistemic firewall:** no machine signal mutates the catalog or graphs;
  the `'unadjudicated'` firewall and the human-only `ADJUDICATIONS` array are
  unchanged; machine signals annotate output and never override human verdicts.
- **Benchmark-gated:** neither unit merges without the Phase-1 calibration
  benchmark passing (recall, decoy-resurfacing, canonical `contradictory=0`).
- **Zero hard deps; peer degradation:** `normalForm`/`buckinghamPi`/
  `deriveProposedBridges` are all peer-independent (only the *simplifier* uses
  a peer). Unit A's consequence derivation does not require the mathts peer.
- **Per-unit Task-0 gate:** measure before wiring (Unit A: consequence-signal
  distribution + no known-true false-contradiction; Unit B: enumeration count
  + tolerance calibration) before any verdict/score change.

## Testing

- Unit A: fixture identifications with (i) a KNOWN entailed consequence — feed
  a canonical equation its own governing set, expect exact self-match →
  `entailed` (the positive control); (ii) a `novel-consequence` case (valid
  consequence, no canonical match); (iii) a `consequence-invalid` case (a
  substitution that yields a dimensionally-invalid AST); (iv) a monomial-limit
  case (sum RHS → `inconclusive`). Assert `entailed` requires BOTH same-target
  AND same-governing-set match (the r1-bug regression test: two valid monomials
  for the same target over DIFFERENT governing sets must NOT be flagged as any
  contradiction — they are simply not-matched, i.e. `novel-consequence` or
  `inconclusive`, never a kill). Calibration benchmark byte-identical except the
  two additive fields; funnel counts unchanged (annotation-only).
- Unit B (if kept): enumeration-count assertion (the bounded search issues
  ≤ N `buckinghamPi` calls — a hard cap test, so a future catalog growth
  can't silently make it intractable); a fixture group with a known
  single-invariant π near a constant surfaces; a random group misses.

## Out of scope

Per-equation human verdict layer (the ledger stays identification-keyed —
consequence-propagation is the machine PRE-classifier, not a new human
surface); any catalog promotion by machine; non-monomial consequence
derivation (deferred with `derivePair`'s existing monomial limit); wiring
consequence-signals into ordering/score (deferred until benchmark-calibrated —
r2 keeps them annotation-only); **Unit B entirely** (its own design + vet).

## Adjudication record — Adam RED + Eve YELLOW (r1), 2026-07-03

Both reviewers hit the same core HIGH; it was a genuine logic error (the vet's
purpose). Findings adjudicated against the verified substrate map (Eve
concretes grep-checked per calibration):

**CONFIRMED → folded into r2:**
- **Unsound `consequence-contradiction`** (Adam #1, Eve #1, both HIGH).
  Differing `normalForm` for the same target ≠ contradiction (E=mc² vs E=hf).
  DROPPED. `entailed` now requires same-target AND same-governing-set exact
  match; the only sound contradiction is `consequence-invalid` (a
  dimensionally-invalid substitution). Regression test pins the r1 bug.
- **Graph source mismatch** (Adam #4, Eve #3, HIGH). Consequence-propagation
  runs per-funnel on the same graph the benchmark guards (CATALOG_GRAPH for
  the catalog funnel); the canonical registry is the reference oracle, not the
  candidate source.
- **Vacuous false-kill guard** (Eve #4, HIGH). Replaced with a concrete
  positive control (established/confronted relations + seeded ledger verdicts
  self-classify `entailed`); and the deeper fix — signals are annotation-only,
  so the funnel benchmark is byte-identical and a mis-classification cannot
  regress recall at all.
- **Re-order can mask below a fold** (Adam #5, Eve #5, MEDIUM). Signals are
  annotation-only — zero ordering/score/verdict effect. Never-hidden by
  construction.
- **Monomial-only low yield** (Adam #2, Eve #6, MEDIUM). Acknowledged;
  measured at Task-0; low yield is an acceptable measured result, not a cut.
- **New-label enum-break** (Eve #7, MEDIUM). `consequenceSignal` is a separate
  field; the `verdict` enum is unchanged — no consumer breaks.
- **Scope split** (Adam #7 LOW + both). ACCEPTED — Unit A is v0.34.0; Unit B
  gets its own design; its bound-calibration findings (Adam #3, Eve #8/#9/#10)
  disposition there.

**REJECTED (with grounds):**
- **`normalForm` ordering false-fire** (Eve #2, HIGH). Substrate-refuted: the
  map states `normalForm` collapses product nesting and commutative `*`/`+`
  reordering, so `c²m` and `mc²` hash EQUAL. Fabricated concern; not folded.
- **Split leaves a 404/half-feature** (Eve #11, LOW). No code in v0.34.0
  references a bounded-π helper (it isn't built) — no dangling reference.

**Net:** the vet caught a real logic error and the corrected design is
SIMPLER — consequence-propagation is now a sound, annotation-only `entailed`/
`novel` pre-classifier for the ledger, with the funnel benchmark provably
untouched. Re-vet before a plan.
