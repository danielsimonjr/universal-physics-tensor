# docs/research/

Physicist-facing research artifacts — notes written for external review
rather than internal planning. Unlike `docs/planning/` (per-release
working documents), these are self-contained, citation-anchored, and
honest about scope; the current entry is the v0.10.0 composition note.
- `v0.23.0-canonical-only-baseline.md` — the discovery funnel pointed at the
  canonical L-layer ALONE (no bridges): the standard-physics consistency
  baseline. 11 map components (anchored cluster of 16), funnel 33 candidates →
  2 flagged coincidences (`erasure-energy`/`free-energy-difference ≟
  photon-energy`) · 5 genuine scale clashes · **0 contradictory**. Records the
  three 2026-06-18 fixes (magnitude-gate sourcing, canonical name unification,
  declared compton↔de-Broglie link). `upt {map,discover} --source=canonical`;
  pinned by `tests/composition/canonical-graph.test.ts`.
- `v0.11.0-novel-candidates.md` — Phase-D review surface
  (41-edge graph: 7 novel candidates + 1 collision awaiting an
  AliasDisposition). Supersedes the v0.10.0 report (kept for
  provenance).
- `Dimensional-Derivation-Benchmark.md` — known physics equations
  (pendulum, Kepler, Planck scales, Compton, thermal de Broglie,
  Schwarzschild, Reynolds) re-derived by the Buckingham-π engine; every
  row is verbatim engine output, pinned by
  `tests/dimensional/derivation-benchmark.test.ts`.
- `Bridge-Equation-Dimensional-Audit.md` — the engine pointed at the
  catalog itself: of 41 bridge edges, 11 are dimensional consequences
  (with famous prefactors — ln 2, 1/4π, 1/8π, √2π — recovered by matching
  the derived form against each evaluator), 5 are decoys, 25 are
  unclosable. Pinned by `tests/dimensional/bridge-derivation-audit.test.ts`.
- `Bridge-Priority-Scorecard.md` — a structural-triage ranking of the
  speculative bridges by *decidability against established physics*
  (grounding + complexity + anchoring + data-confrontation flag, Tiers
  1/2/3). Explicitly NOT a credibility score. `npm run bridge-priority`;
  pinned by `tests/composition/bridge-priority.test.ts`.
- `Catalog-Linkage-Map.md` — how the equations connect: connected
  components of the catalog graph by shared quantity (23 components — one
  dominant anchored cluster of 16 hubbed on mass/temperature, two small
  clusters, 20 isolated). `upt map`; pinned by
  `tests/composition/linkage-map.test.ts`.
- `Linkage-Candidate-Proposals.md` — using the map to propose candidate
  cross-cluster links for physicist review: 132 same-dimension candidates
  funnel to ~3 genuinely motivated (the critical-dynamics correlation
  length). The funnel quantifies the false-positive rate of dimensional
  matching. `upt candidates`; pinned by
  `tests/composition/link-candidates.test.ts`.
- `BE-29-Landauer-Recovery.md` — the pre-fix scan's single *undeclared*
  structural match: BE-29 (Jarzynski) appeared to recover CE-landauer's
  `k_B T ln(·)` form. Argues it is a shared functional form (the `ln` factor —
  `ln 2` vs `ln⟨e^−βW⟩` — is physically substantive), not a partnership. Both
  fixes it recommends are now applied: a canonical Jarzynski entry
  (`CE-jarzynski`) as BE-29's true partner, and stub-identity tagging in
  `normal-form.ts` that demotes the form-coincidence to `dimensional-only`.
  `upt recover`; pinned by `tests/canonical/{linkage,normal-form}.test.ts`.
