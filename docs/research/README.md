# docs/research/

Physicist-facing research artifacts — notes written for external review
rather than internal planning. Unlike `docs/planning/` (per-release
working documents), these are self-contained, citation-anchored, and
honest about scope; the current entry is the v0.10.0 composition note.
- `v0.11.0-novel-candidates.md` — CURRENT Phase-D review surface
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
