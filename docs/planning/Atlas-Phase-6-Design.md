# Atlas Phase 6 — design note: study, scoped release, discovery hypothesis

Authorized by the Sprint 6 entry in [`ACTIVE.md`](ACTIVE.md). Briefs:
[`Atlas-Roadmap-Implementation-Plan.md`](Atlas-Roadmap-Implementation-Plan.md) §Sprint 6.

## 0. What Phase 6 depends on

The study (S6.1) and the ablation (S6.2) score the FROZEN benchmark set, so they are only as good
as that set (Phase 5 design note §0). On an EMPTY set the study script exits 3 and writes nothing:
an empty set is not a study. `scoreCondition`, `pairedRejection` and `scoreAblation` are
unit-tested on synthetic in-memory labels; only a run on real items exercises the end-to-end path
(load the frozen set, score it, write the results file), and "measured" must not be read as
"exercised".

S6.7 moves symbols onto the public API. That is an ADR-level decision, and it belongs to
Mothership ([`Atlas-API-Review.md`](Atlas-API-Review.md)).

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

## 3. `upt atlas` (S6.5) — as built

`upt atlas [<bridge-id>]` prints one bridge with every qualification. **An empty section prints
`none stated` and a regime with no inequality prints `VACUOUS`**, so an absent qualification is
visible as an absence. `formally-proved` is printed with its SCOPE: "the statement above ONLY —
not the bound". Without that line, the pendulum's YES would read as certifying a period bound the
formal statement does not cover. `symbolically-checked` is decided by the witness-results
artifact, which is not shipped in the package, so the command names the symbolic witnesses and
prints no verdict it cannot see. Eve E6 is a test: three bridges (an approximation with a
formalRef, an exact equivalence with an empty regime, and a hyperedge) have every field of their
source record found in the output.

**Three defects found and fixed on the way:**

- **The command-count gate could not see the registry.** It counted commands by parsing
  `upt --help`, which is a STATIC string in `main.ts`, so `upt atlas` ran while `upt help` did not
  list it. The new `listCommandNames()` plus `tests/cli/help-covers-registry.test.ts` compare the
  registry itself with the help text. The first version of that test used a `` that landed as a
  single backslash-b inside a template literal, which is a BACKSPACE, so it reported every command
  undocumented. Its control now checks both directions: an absent name IS reported, and a present
  one is NOT.
- **`upt regime`** accepted only the oscillator family, and **`upt path`** / `findPath` searched
  only it. All three now use `ATLAS_FAMILIES`. `upt path` reads the family off its endpoints and
  refuses a cross-family pair with that reason. Routes stay inside one family, which is stated,
  not hidden.
- The CLI now has 22 data-bearing commands; `CLAUDE.md` and `cli/README.md` are updated, and the
  count gate holds them to the registry.
