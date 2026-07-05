# Condensed-Matter Bridge Cluster + Honest Axis Measurement (Approach C): Design

**Date:** 2026-07-05 · **Status:** r1 — approved (Approach C), for Adam/Eve vet then implementation.

## Motivation

The v0.41.0 axis expansion typed the Topology and Quantum-Statistics axes but left them
**ungated** — no graph coverage. This is the first branch-physics expansion that tests
whether they earn a gate, anchored where be-55 (quantum Hall) already sits: condensed
matter. The design has two deliverables, and the honesty is in keeping them separate:

1. **Spine growth (the guaranteed value):** four established, data-confrontable
   condensed-matter bridges — a coherent cluster completing the quantum metrology
   triangle plus the canonical fractional/thermal/superconducting results.
2. **An honest, *pre-measured* axis outcome (the anti-inflation deliverable):** grounding
   already shows there is **no fermion↔boson same-dimension pair** among the 131 graph
   quantities (only 2 fermionic + 1 bosonic exist), and topology has the same emptiness.
   So the statistics/topology axes **cannot fire on this graph** — the physics that carries
   them (quantized invariants, closed-form quantizations) is exactly the physics that does
   not graph-connect. The expansion **verifies this by measurement** rather than hoping the
   axes light up. Predicted outcome: the axes stay `fires=0` and remain ungated — a
   published proof they *classify but do not gate* for a monomial catalog.

## Part 1 — Four established bridges (BE-59…62), closed-form-evaluator pattern

Same pattern as BE-51/52/55…58: catalog entry + evaluator + `EXPECTED_DIMENSION_BY_BRIDGE`
+ orphan-signature allowlist, no AST round-trip. Each gets a data confrontation with a
**non-circular** framing (post-2019 SI fixes R_K and K_J, so raw values are definitional —
confront universality / the metrology-triangle / the fraction, as be-55 did).

| id | bridge | equation | evaluator out | confrontation (non-circular) | axis tag (vet-adjudicated) |
|---|---|---|---|---|---|
| BE-59 | **AC Josephson** | f = 2eV/h (K_J=2e/h) | frequency [T⁻¹] | metrology-triangle / K_J universality (Josephson-voltage-standard reproducibility, ppb) | statistics: bosonic (Cooper pair, q=2e) |
| BE-60 | **Fractional QH (Laughlin ν=⅓)** | σ_xy = (1/3)·e²/h | conductance [L⁻²M⁻¹T³I²] | the measured ⅓ fraction (Tsui-Störmer-Gossard 1982; topological order, not R_K) | topology: chern · statistics: anyonic |
| BE-61 | **Wiedemann-Franz** | κ/σT = L₀ = π²/3·(k_B/e)² | Lorenz number [V²K⁻²] | measured Lorenz number in metals vs L₀=2.44×10⁻⁸ | (candidate fermionic — vet) |
| BE-62 | **BCS gap ratio** | 2Δ(0) = 3.528 k_B T_c | energy | measured 2Δ/k_BT_c across conventional superconductors ≈ 3.5 | (Cooper-pair statistics ambiguous — vet) |

**Physics-correctness flags for the vet (honest-claude):** BE-59/60 confrontations MUST NOT
confront the post-2019-definitional values (K_J, R_K) — that is circular; confront
universality/the-fraction. BE-62's and BE-61's statistics tag is genuinely ambiguous (a
bosonic Cooper condensate of fermionic electrons); **strip to no-tag under vet disagreement**,
per the attribute-audit discipline. Every bridge runs the Adam/Eve physics vet before encoding
(the BE-55…58 precedent; reviewer-supplied numbers verified against the primary source).

Catalog **48 → 52**; established **12 → 16**; evidence spine **12 → 16** (all four are
data-confrontable, unlike be-57 Unruh). Metrology narrative: be-55 (R_K=h/e²) + be-58 (k_B via
JNT) + **be-59 (K_J=2e/h)** are the three quantum electrical standards — the cluster completes
the triangle.

## Part 2 — Honest graph-quantity tagging (classification, not gating)

Tag the honestly-taggable **graph** quantities (not the closed-form bridge quantities — those
never enter the funnel) with their statistics/topology, routed through the attribute-audit
governance pin: the electron-gas quantities (`fermi-energy`, `fermi-velocity`, `carrier-density`,
`drift-velocity`…) → `statistics: fermionic`; any photon/phonon/plasmon quantity → `bosonic`.
Source every tag; strip under uncertainty. This is for **classification completeness**, and it
is the coverage the audit measures.

## Part 3 — Run the audit, report the measured outcome

Re-run `auditAxisDiscrimination(CATALOG_GRAPH)`. **Predicted (from grounding): statistics and
topology show `fires=0`** — even with honest fermionic tags, no fermion↔boson dimensional
coincidence exists to clash, so they stay ungated. Update the axis-audit test to pin the new
`checked` counts and the still-`fires=0` result, and write a short research note
(`docs/research/`) recording the measured ceiling: *the rank-7 axes classify but do not gate on
a monomial condensed-matter catalog, because topological/statistical physics is closed-form and
does not graph-connect.* If — against prediction — an axis fires, flip its gate (the payoff), and
the note records that instead. **No gate flips without measured firing.**

## Testing & invariants

- Per-bridge: `tests/bridges/be-59…62-*.test.ts` (evaluator + confrontation + catalog entry),
  the closed-form-bridge test-file requirement.
- Invariant count updates (the BE-55…58 checklist, re-applied): catalog 48→52, established
  12→16, `DATA_CONFRONTED_IDS` 12→16, membership 40→44 bridges, `EXPECTED_DIMENSION_BY_BRIDGE`
  46→50, orphan allowlist +4, IDs 11→62 contiguous, catalog-json + goldens + public-surface
  snapshot regen.
- Axis-audit test: new `checked` counts pinned; `fires=0` invariant for statistics/topology
  preserved (or a gate flip if measured).
- Full gate + DGT clean.

## Non-goals (YAGNI + honesty)

- No forced graph connectivity to make an axis fire (Approach B — rejected as fabrication).
- No AST encodings (closed-form evaluators only).
- No new axes; no SI-dimension change.
- The four bridges are the scope — not an open-ended condensed-matter sweep. Quantum spin Hall
  (ℤ₂ TI) is deferred to a later cluster (keeps this vet-able in one pass).
