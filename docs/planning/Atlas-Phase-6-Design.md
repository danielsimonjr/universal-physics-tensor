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
