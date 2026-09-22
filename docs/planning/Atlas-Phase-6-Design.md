# Atlas Phase 6 — design note: study, scoped release, discovery hypothesis

Authorized by the Sprint 6 entry in [`ACTIVE.md`](ACTIVE.md). Briefs:
[`Atlas-Roadmap-Implementation-Plan.md`](Atlas-Roadmap-Implementation-Plan.md) §Sprint 6.

## 0. What Phase 6 can and cannot do today

The study (S6.1) and the ablation (S6.2) score the FROZEN benchmark set. That set is empty until
independent authors exist (Phase 5 design note §0). **The study script's behaviour on the empty set
was MEASURED: it exits 3 and writes nothing. Its behaviour on a NON-empty set has NEVER RUN.**
`scoreCondition`, `pairedRejection` and `scoreAblation` are unit-tested on synthetic in-memory
labels. The end-to-end path (load a real frozen set, score it, write the results file) has not
been exercised, and "measured" must not be read as "exercised". The first run on real items is
also that path's first test.

S6.7 moves symbols onto the public API. That is an ADR-level decision, so the review is written
and sent to Mothership, and nothing is applied.

## 1. Link prediction (S6.3) — the one result

The full result, method and caveats are in
[`docs/research/atlas-link-prediction.md`](../research/atlas-link-prediction.md), bound to
`tests/atlas/link-prediction.test.ts`. That test recomputes every figure and fails on
disagreement.

In one line: over 20 leave-one-bridge-out trials, the typed-graph predictor (common neighbours)
does NOT beat a word-overlap baseline. Recall@10 is 0.70 against 0.80, the paired difference is
−0.10 with an interval spanning zero, and the MRR is 0.28 against 0.42. Both predictors sit only
modestly above a high chance level of 0.456. **Hypothesis not supported.**

Two corrections to the naive method were made before any number was recorded:

- **2 pairs were excluded.** Their endpoints stay adjacent through another bridge (Langevin →
  Fick appears in two bridges), so the held-out conclusion could not even be a candidate. They
  are counted, not dropped silently.
- **Chance level and MRR are reported.** Each query has about 20 candidates, so a random ranking
  hits the top 10 almost half the time. A bare recall@10 would read as success.

## 2. Versioned export (S6.4) — as built

`bun run atlas:json` writes the per-family artifacts and now also writes:

- **`data/atlas/atlas.json`**, every family under one version stamp. `schemaVersion` stays `'0'`,
  because Phase 4's only field change (`formalRef`) is additive and optional, and the plan bumps
  to v1 only on a breaking change.
- **`data/atlas/atlas.jsonld`**, the JSON-LD projection. Ids are stable URNs
  (`urn:upt:atlas:model:<id>`, `…:bridge:<id>`), so no id depends on a host that could move.
  Bridges are `prov:Entity` with `prov:wasDerivedFrom` pointing at their premises, and their
  citations are `dcterms:source`.
- **`data/atlas/qudt-resolution.json`**, the checked-in resolution table. Every IRI returned HTTP
  200 on the probe date, and a positive control (Mass → 200) and a negative control (a fabricated
  name → 404) show that the probe can tell the difference. **10 of the 54 parameters are
  deliberately blank.** SpringConstant, FlexuralRigidity and DampingCoefficient return 404.
  MassPerTime matches the DIMENSION of a damping coefficient but means a mass flow rate, so it is
  not used. The table is keyed by (model, parameter) because `kappa` is a spring constant in
  `model-chain` and a thermal conductivity in `model-heat`, which is a notation collision in the
  atlas's own data. The export THROWS on a parameter with no entry rather than exporting it blank.

`tests/atlas/export.test.ts` pins freshness, URN uniqueness, endpoint resolution, table coverage,
the collision and the unresolved set. It lives beside `atlas-json.test.ts` rather than inside it,
which is a deviation from the plan's wording.
