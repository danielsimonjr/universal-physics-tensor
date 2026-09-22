# Atlas link prediction — the one result (ROADMAP Phase 6, S6.3)

**Reproducer:** `bunx vitest run tests/atlas/link-prediction.test.ts`. That test recomputes every
number below from the live atlas and fails if this note disagrees with it.

**Hypothesis under test:** the typed model graph carries structure that predicts held-out bridges
better than the models' own descriptions do.

**Method.** The graph is the 24 models of all registered families, joined by the premise→conclusion
pairs of the 20 bridges. The test is leave-one-bridge-out. For each held-out pair, both predictors
rank the conclusion among every model not already adjacent to the premise. The **structural**
predictor ranks by common neighbours, then same family, then id. The **text** baseline ranks by
word-overlap of the dynamics and state-space descriptions. **2 pairs were excluded** because their
endpoints stay adjacent through another bridge (both Langevin → Fick), so they are not missing
links. That leaves **20 trials**.

## Result

| Predictor | recall@10 | 95% Wilson | MRR |
|---|---|---|---|
| structural (common neighbours) | 14/20 = 0.70 | [0.481, 0.855] | 0.282 |
| text overlap | 16/20 = 0.80 | [0.584, 0.919] | 0.424 |
| random ranking (chance) | 0.456 | — | — |

Paired over the same 20 trials, the structural − text difference is −0.10, with a 95% Newcombe
interval of [−0.355, 0.172]. McNemar's exact p is 0.727.

**The hypothesis is NOT supported.** On this graph the typed neighbourhood does not beat plain word
overlap. The point estimate is lower, the interval spans zero, and its MRR is two-thirds of the
text baseline's. Both predictors sit only modestly above chance, and chance is high at 0.456,
because each query has only about 20 candidates.

## What this result cannot carry

- The graph is SMALL and IN-DISTRIBUTION. The agent that runs the test also curated it. This is a
  statement about how this representation behaves on its own content. It is not a discovery claim,
  not a hub or gap claim, and not evidence about physics outside the atlas.
- The text baseline is flattered by the curation. Model descriptions written by one author share
  vocabulary across the models they connect: "wave", "string", "diffusion".
- recall@10 on about 20 candidates is weakly discriminating. MRR is the more informative column.
- Product A (`src/composition/discovery.ts`) is untouched. A test pins that nothing under
  `src/atlas/` imports it.
