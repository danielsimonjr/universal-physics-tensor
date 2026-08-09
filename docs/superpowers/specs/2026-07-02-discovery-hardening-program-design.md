# Discovery-Hardening Program — Design (10 proposals → 6 releases)

**Date:** 2026-07-02 · **Status:** r2 — Adam (gemini-2.5-pro) YELLOW + Eve (o3)
YELLOW, all accepted findings folded (see the review record in the Phase-1
plan; the plan carries the finding-by-finding disposition)
**Premise served:** UPT's promise is *bridge-equation discovery through tensor
formalism*. Three deficits are documented in the repo's own research corpus:

1. **Structural precision ceiling** — the funnel's falsifiers (dimension +
   magnitude) cannot see mechanism; every adjudication round to date scored
   **0 of 8 candidates genuine** (`docs/research/discovery-precision-calibration.md`,
   `proposed-equations-adjudication.md`, `orphan-connector-adjudication.md`).
2. **Thin empirical spine** — 3 of 44 bridges data-confronted; the scorecard
   concedes the data column is "the only real credibility signal"
   (`docs/research/Bridge-Priority-Scorecard.md`, `upt coverage`).
3. **Decorative formalism** — of the rank-6 tensor's axes, only *dimension*
   does inference work; of Π = L + B + E, the E layer has types but no
   machinery (`upt map`: 23 components, 20 isolated bridges — "a hub-and-spoke
   star", `docs/research/Catalog-Linkage-Map.md`).

## Program invariants (bind every phase)

- **Epistemic firewall preserved.** No machine verdict ever mutates the
  catalog or graphs. Adjudications annotate discovery *output*; promotion to
  the catalog remains a human act (`promoteProposal` + physicist review).
- **Benchmark-gated funnel changes.** After Phase 1 lands the calibration
  benchmark, no discovery/vetting change merges without running it: known-true
  recall must not regress; adjudicated decoys must not resurface as promising;
  canonical-only `contradictory = 0` must hold.
- **Zero hard deps; graceful peer degradation** (repo invariant).
- **Per-release Design + Adam/Eve vet.** This document orders the program;
  each phase after Phase 1 gets its own design + adversarial vet before
  execution (todo.md §Conventions). Phase 1's executable plan is
  `docs/superpowers/plans/2026-07-02-discovery-hardening-phase1.md`.

## Phase map (proposal № → release)

| Phase | Release | Proposals | Deliverable | Why this order |
|---|---|---|---|---|
| 1 | v0.31.0 | P9 | Adjudication ledger (stable candidate IDs, seeded with the 8 reviewed verdicts) + CI calibration benchmark | Build the measuring instrument **before** changing the engine; verdicts stop evaporating |
| 2 | v0.32.0 | P1 + P6 | Axis-coordinate registry (scale/force/symmetry/information per quantity) + axis-compatibility scoring in `vetLinkCandidate`; `--source=both` default for connectivity analyses + definitional law-edges | The direct attack on the precision ceiling, measured against Phase 1's benchmark; connectivity becomes honest |
| 3 | v0.33.0 | P3 + P7 | `data/` pinned-dataset registry + `upt confront` + new confrontations (be-16 Bérut 2012, be-12 cold-atom, be-48 LISA-Pathfinder bound, be-38 SPARC, be-23 per-material α) + sensitivity-ranked "deciding measurement" output via `src/diff/` | Widens the only real credibility channel; scorecard Tier-1 names the targets |
| 4 | v0.34.0 | P2 + P5 | Consequence propagation (substitute a≡b through `composeSymbolic`, check consequences vs canonical `normal-form`) + Buckingham-π cross-cluster discovery mode (`buckingham.ts` over cluster boundaries, surface π ≈ 1/2π/ln2/α). **π-search MUST be bounded** (vet r1, Eve HIGH): cluster-frontier pairs only, max group size ≤4, dimension-space rank cutoff — exact bounds set in this phase's own design; naive enumeration over 131 quantities is intractable | First mechanism-sensitive signals; needs Phase 2's axis data and Phase 1's benchmark |
| 5 | v0.35.0 | P4 | `RepresentativeValue` gains log-space uncertainty; magnitude-clash becomes statistical (σ-level, not a knob); chain propagation reuses existing `propagateUncertainty`. **Caveat (vet r1):** σ on order-of-magnitude estimates is a subjective prior — the statistical gate ships opt-in and its docs must say so until calibrated against the confrontation data from Phase 3 | Data-model change touching many quantities — isolated release; `uncertainty.ts` (v0.10.0) already does edge-level propagation |
| 6 | v0.36.0 | P8 | E-layer: 3–5 canonical coarse-graining relations as *directed limit-edges* (N→∞, ℏ→0, long-wavelength metadata); funnel learns the edge type | Largest physics-judgment surface; mandatory own design + physicist review |
| ∥ | ongoing | P10 | Machine-readable release artifact (catalog + candidates + adjudications, extends `data/bridge-catalog.json`) after Phase 1; research note; GitHub issue templates for CONTRIBUTING review tasks; **user-only:** Zenodo DOI + physicist outreach (queued since v0.10) | Code parts unblock after Phase 1; outreach is the user's call |

## Design decisions already grounded in source

- Candidate identity = order-normalized quantity-name pair (`a≟b`, sorted).
  Names are stable slugs in the composition graph; no content hash needed.
  Verdicts must survive funnel-internal changes, so the ID deliberately
  excludes score/verdict/dimension.
- Registry pattern follows `SOURCE_ALIAS_DISPOSITIONS`
  (`src/composition/compose.ts:119-149`) and `src/bridges/rejected.ts`:
  reviewable typed data with rationale + citation, not config.
- The 8 seed verdicts come from `proposed-equations-adjudication.md` (PE-1..5)
  and `orphan-connector-adjudication.md` (CI-1..3). **Name-drift risk:** doc
  names (e.g. `erasure-energy`) may differ from live graph names
  (`landauer-erasure-energy`); Phase 1 Task 0 verifies each pair against the
  live graph before seeding.
- `VettedCandidate` (`src/composition/discovery.ts:73-141`) is the integration
  point; CLI stays thin behind `ctx.api` (v0.30.0 architecture).
- **The ledger adjudicates identifications, not derived equations** (vet r1):
  a `decoy` identification invalidates every equation derived from it; an
  `entailed` identification marks derived equations as consequences of known
  physics. A per-equation verdict layer is deliberately NOT built until a
  real case demands it (YAGNI) — Phase 4's consequence-propagation design
  revisits this.
- **Relationship to `src/bridges/rejected.ts`** (vet r1): rejected.ts
  adjudicates catalog *membership* ("is BE-x a bridge?"); the new
  `adjudication.ts` adjudicates discovery *candidates* ("is a≡b genuine?").
  Different objects, no overlap; each module's docstring cross-references the
  other.
- **Rename convention:** quantity renames / alias dispositions must update
  `ADJUDICATIONS` in the same commit; the calibration benchmark's
  seed-resolution test is the enforcement.

## Out of scope (whole program)

New physics claims; catalog mutations by machine; REPL/visual work beyond the
existing map; the Three.js repo (separate project decision).
