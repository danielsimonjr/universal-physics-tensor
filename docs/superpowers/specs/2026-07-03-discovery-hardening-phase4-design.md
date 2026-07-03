# Discovery-Hardening Phase 4 (v0.34.0) — Mechanism-Sensitive Signals: Design

**Date:** 2026-07-03 · **Status:** r1 — DRAFT, awaiting Adam/Eve adversarial vet
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

### The verdict (maps onto the ledger)

For a consequence deriving target T:

- **`entailed` (machine)** — the consequence's `normalForm` **matches** a
  canonical equation's `normalForm` for T. The identification re-derives
  known physics: consistent, but not novel falsifiable content. This is the
  machine analog of the ledger's `entailed`.
- **`consequence-contradiction` (machine)** — a canonical equation for T
  exists, the consequence is a valid monomial for T, and their `normalForm`s
  **differ** (a genuine structural disagreement, not a dimensionless-constant
  difference, which `normalForm` already collapses). The identification
  implies two incompatible expressions for one quantity → the machine analog
  of `decoy`. This is a **mechanism-sensitive falsifier**: it can kill a
  candidate that passes dimension, magnitude, AND axis.
- **`novel-consequence`** — the consequence is dimensionally valid, derives a
  T that has **no** canonical equation to compare against, and is not a
  contradiction. The identification implies a genuinely new, non-contradicted
  relation — the strongest `promising` signal. Machine analog of `genuine`
  (a *candidate* for genuine, not a claim of it).
- **`inconclusive`** — no consequence derivable (the monomial-only limit of
  `derivePair`: sums/transcendentals/≠1-free-leaf abstain). No signal;
  verdict unchanged.

### Integration + the epistemic firewall

- New fields on `VettedCandidate` (the map's confirmed plug-in point,
  computed in `vetInContext`): `consequenceSignal:
  'entailed'|'consequence-contradiction'|'novel-consequence'|'inconclusive'`
  and `consequenceEvidence: readonly { target: string; derivedNormalForm:
  string; canonicalMatch: string | null; sourceEquationIds: readonly
  [string,string] }[]`.
- **Firewall (binding):** the machine consequence-signal ANNOTATES discovery
  output. It never mutates `BRIDGE_EQUATIONS`/`CANONICAL_GRAPH`, and it never
  overrides a *human* verdict in the adjudication ledger — if a candidate
  carries a recorded human verdict, that governs; the machine signal is
  advisory context beside it. A machine `consequence-contradiction` is a
  SEPARATE, clearly-labeled signal — it is NOT silently merged into the
  human-sourced `contradictory` verdict, and it is NOT written to
  `adjudication.ts`'s `ADJUDICATIONS` (that array is human-authored only).
- **Verdict/priority effect (conservative):** `consequence-contradiction`
  demotes a candidate below `promising` in the ranked list with the label
  "machine consequence-contradiction (unadjudicated) — review"; `entailed`
  demotes with "machine-entailed (re-derives known physics)";
  `novel-consequence` keeps `promising` and adds a "carries a novel
  consequence" trailer. Nothing is *removed* from the list — everything stays
  reviewable (the never-hidden-bucket rule from Phase 2). The `'unadjudicated'`
  firewall on the underlying `ProposedBridge` is unchanged.

### Benchmark gate (binding)

Adding the consequence signal must pass the Phase-1 calibration benchmark:
known-true recall must not regress, adjudicated decoys must not resurface as
promising, canonical-only `contradictory = 0` must hold. **Task-0 measures the
consequence-signal distribution over the current candidate set BEFORE any
verdict wiring** — we need to see how many candidates it classifies
entailed/contradiction/novel/inconclusive, and confirm no known-true candidate
is machine-classified as contradiction (which would be a false kill). If any
known-true candidate gets `consequence-contradiction`, the wiring is wrong and
the phase stops at Task-0 (the Phase-2 precedent: a measurement gate outranks
a design).

### CLI surface

`upt discover` gains a consequence column/section: promising candidates show
their `consequenceSignal`; a new `--consequences` flag (or reuse `--derive`'s
output) lists the derived consequence + its canonical match/contradiction.
`--json` gains the two additive fields. No new top-level command needed.

---

## Unit B — Bounded Buckingham-π cross-cluster discovery (RECOMMENDED SPLIT)

*Designed here for completeness; recommended to ship as its own release. The
bounding is the load-bearing correctness problem.*

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

- Unit A: fixture identifications with a KNOWN entailed consequence (re-derives
  a canonical equation → `entailed`), a KNOWN contradiction (derives a
  target whose canonical form differs → `consequence-contradiction`), a novel
  case (`novel-consequence`), and a monomial-limit case (`inconclusive`).
  Registry-wide: no candidate carrying a human `genuine`/`deferred` verdict is
  machine-classified `consequence-contradiction`. Calibration benchmark
  byte-identical except the new signal fields.
- Unit B (if kept): enumeration-count assertion (the bounded search issues
  ≤ N `buckinghamPi` calls — a hard cap test, so a future catalog growth
  can't silently make it intractable); a fixture group with a known
  single-invariant π near a constant surfaces; a random group misses.

## Out of scope

Per-equation human verdict layer (the ledger stays identification-keyed —
consequence-propagation is the machine PRE-classifier, not a new human
surface); any catalog promotion by machine; non-monomial consequence
derivation (deferred with `derivePair`'s existing monomial limit); Unit B if
the scope recommendation is accepted.
