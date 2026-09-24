# Atlas invalid-bridge benchmark — pre-registration

**Status: REGISTERED 2026-09-22, thresholds FROZEN, item set EMPTY. No condition has been run.**

This note is written before any condition is scored. It fixes what counts as success. After
registration, a change to a threshold, the held-out family, the raters or the frozen item set is
an AMENDMENT: it gets its own dated section below and its own commit, and it never silently
edits the text above it. Design: `docs/planning/Atlas-Phase-5-Design.md`.

## 1. The frozen item set

| Field | Value |
|---|---|
| Location | `tests/fixtures/atlas/benchmark/public/items.json` |
| Items | **0** |
| SHA-256 of the canonical JSON | `4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945` |

`tests/atlas/benchmark-preregistration.test.ts` recomputes this hash from the committed items
and fails if they differ, so the set cannot change without an amendment to this note. The
hash above is the SHA-256 of `[]`. It was checked by a second method (`printf '[]' | sha256sum`).

**The set is empty because no agent may author a frozen item.** Items must come from
physicists who have not read `src/atlas/`, drawing on textbook errata and documented
misconceptions. **Until they exist, no result may be reported.** A condition scored against an
empty set produces no measurement, and presenting it as one would be the defect this note
exists to prevent.

## 2. Raters

| Rater | Name | Has read `src/atlas/`? |
|---|---|---|
| 1 | **TO BE NAMED** | must be "no" |
| 2 | **TO BE NAMED** | must be "no" |

Cohen's κ between the two raters is reported BEFORE freezing (ROADMAP Phase 5 exit criterion).
Disputed items go to `contested/` and are not frozen.

## 3. Held-out family

**Fluid statics**: hydrostatic pressure, buoyancy, Pascal's principle, and the barometric
formula. The plan named first-order relaxation, but Phase 0 already encodes it as
`model-first-order` (design note §4). Fluid statics must not be added to `src/atlas/` while the
benchmark is live, and `tests/atlas/benchmark.test.ts` enforces that with a positive control.

## 4. Failure taxonomy and sampling

The eight kinds are omitted premise, domain violation, convention mismatch, notation collision,
dimensional coincidence, non-uniform limit presented as uniform, false inverse, and analogy
promoted to equivalence. **Sampled evenly:** each kind gets ⌊N_invalid/8⌋ items, and any
remainder is assigned by the independent authors before freezing. Valid and invalid items are
balanced, with N_valid = N_invalid.

## 5. Conditions

| Condition | Where it runs |
|---|---|
| Atlas (`runAtlasCondition`) | in process, deterministic |
| Text retrieval, symbol matching, typed structural search | in process, deterministic |
| Embeddings | out of process, `backend-shapes.ts` |
| LLM baselines (the best one is the comparison) | out of process, `backend-shapes.ts` |

A condition's malformed response is an ERROR and is reported, never defaulted.

## 6. Pre-stated criteria

These are fixed now. "Pass" means the criterion is met on the frozen set.

1. **Zero false promotions to `formally-proved`.** A single instance blocks release.
   `formally-proved` is derived from `formalRef.fidelity`, and the file allow-list lint forbids
   spelling it anywhere a record could set it.
2. **Invalid-bridge rejection, atlas vs the BEST LLM baseline.** The comparison is paired over the
   same invalid items, using the Newcombe method-10 95% interval for the difference in rejection
   rate, which must EXCLUDE ZERO. McNemar's exact p is reported alongside, but the interval is
   the criterion.
3. **Recall at depth 10, atlas-side typed structural search vs embeddings.** Reported with Wilson
   intervals. The criterion is that the typed search's interval lies above the embedding
   condition's point estimate.
4. **Abstention is reported for every condition and preferred to a wrong accept.** A condition's
   wrong-accept rate is reported beside its accuracy, never folded into it.
5. **Practical value.** This is time and error rate when tracing a known derivation with the
   atlas vs with ordinary references, over the same tasks with human participants. The protocol
   is fixed by amendment before any participant is run. **No participant protocol exists yet,
   and this criterion cannot be scored without one.**
6. **Curation cost.** This is person-hours per admitted bridge, by relation type. Phase 4 recorded
   batch-level wall-clock only (about 2–6 minutes per bridge, agent-curated). Per-bridge timing by
   human curators is required here.

## 7. Power

At an assumed 0.8 accuracy the 95% Wilson half-width is ±10.0 points with 60 items per class and
±5.5 points with 200 (`powerReport`). **If curation cost makes 200 per class unreachable, the
study reports the interval it can afford and does not make the claim it cannot support.**

## 8. Amendments

**Amendment 1 (2026-09-22) — disclosed limitation of the held-out-family control (§3).** The positive
control that shows the absence scan can fire uses the marker `first-order`, and that marker was chosen
AFTER it was known that `model-first-order` exists in the atlas. It therefore proves only that the
matcher fires; it does NOT prove that the original held-out family's marker list would have detected
the leakage. The absence of fluid statics from `src/atlas/` is unaffected (measured directly), and no
threshold, rater, family or item changes. The frozen-set hash in §1 is unchanged.

**On ordering.** This note was registered while the frozen item set was EMPTY, before any condition
ran. That is the intended order — method fixed before data — not a gap. The study has NOT been
conducted: no result exists yet.

**Amendment 2 (2026-09-22) — MODEL authors and MODEL raters; the frozen set is no longer empty.**
The owner removed the human requirement ("use a fable model"). This changes §1 and §2. The
thresholds, the held-out family and the criteria in §3–§7 do not change.

- **Who.** Every author, encoder and rater is an instance of `claude-fable-5-1`. No human authored
  or rated an item. The kappa below is agreement between two MODEL instances, not human
  inter-rater reliability.
- **Isolation, enforced by the launch and recorded per call.** Each instance is a separate
  `claude -p` process with no tools, no MCP servers, no settings sources, no auto-memory, a
  replaced system prompt, and a working directory outside the repository. Each of the 32 calls
  stores the launch's own `init` record (`tools: []`, `mcp_servers: []`, the model id) next to its
  exact prompt and reply in `tests/fixtures/atlas/benchmark/provenance/`. The pipeline refuses any
  reply whose `init` record shows a tool or an MCP server. Prompts: `scripts/atlas-benchmark-models.mjs`.
- **Roles.** The AUTHOR wrote 128 items (16 per batch, two batches per family, 8 valid and 8
  invalid per batch, each failure kind once per batch). It saw the domain names, the relation-type
  definitions and the failure-kind definitions, and no atlas content. The ENCODER turned each
  item's public prose into the machine fields and never saw the answer, the explanation or the
  source. RATER A and RATER B are separate instances with no shared context. Each saw only the
  public prose. The session that ran the pipeline has read `src/atlas/`, so it authored, encoded
  and rated nothing.
- **Kappa, over all 128 items, before the freeze.** Binary (valid/invalid): **0.984**
  (2×2 = [[66, 1], [0, 61]]). Nine categories (valid plus the eight kinds): **0.978**. Agreement
  with the author's key: rater A 125/128, rater B 126/128. **All three roles are the same model**,
  so this high agreement is partly shared model judgement. It does not show that humans would
  agree.
- **Freeze rule.** An item is frozen when rater A, rater B and the author give the same
  valid/invalid verdict and its encoding is well formed. Otherwise it goes to `contested/`.
  Result: **125 frozen** (64 valid, 61 invalid; 32 held-out) and **3 contested**. All 3
  contested items are `omitted-premise` items, so that kind has 5 frozen items and every other
  kind has 8. Cross-split leakage: none found.
- **Frozen set.** SHA-256 of the canonical JSON: `0274f3cd275981434a6b8cac358a31b44bd1c38846a70f0ec7b9d72d12ce74a3`.
- **Criterion 6 (curation cost) is measured as MODEL cost, not human person-hours:** USD 19.34
  for the whole set (author 10.78, encoder 5.45, raters 3.11), about USD 0.15 per authored item.
  **Criterion 5 (practical value) is not converted.** It is defined as human time and error rate,
  a model's run is neither, and it stays unmet.
- **Criteria 2 and 3 cannot be scored yet.** They compare the atlas against LLM and embedding
  conditions, and no out-of-process worker exists. Also, the public item schema carries `kind` and
  `failureKind` (the answer). This must move to the scorer half before any such condition reads
  `public/items.json`.

**Amendment 3 (2026-09-22) — the answer leaves the public half.** The public item schema carried
`kind` and `failureKind`, which are the answer. The atlas condition never read them, but any LLM
or embedding condition fed `public/items.json` would have read the key. Both fields now live only
in `scorer/labels.json`; the loader refuses a public item that carries either, and
`validateLabels` checks the key against the set. The items, the labels, the freeze and every
count are unchanged. A rerun of the study produced a byte-identical results file.

- **Frozen set.** SHA-256 of the canonical JSON: `6ab7c2c32358ebbddfdc73cad118095fdf33f4770c07230f622febe2eeedc8d8`.

**Amendment 4 (2026-09-22) — criterion 2 runs on LOCAL LLM baselines; criterion 3 is not run.**
This amendment is committed before the first model call. The owner chose to spend nothing, so
the LLM baselines for criterion 2 are local Ollama models, not a hosted frontier model. The run
configuration is frozen in `tests/fixtures/atlas/benchmark/conditions/llm-local.config.json`:
the three models with their digests, the options (temperature 0, fixed seed, `num_ctx` 8192), the
exact prompt, one item per call, and the public fields only.

- **"Best LLM baseline" is defined before the run:** the model with the highest balanced accuracy,
  `(validAccepted/nValid + invalidRejected/nInvalid)/2`. A model that rejects everything
  maximizes rejection without being a better judge, and balanced accuracy does not reward it.
  Ties break on the invalid-rejection count, then on the model name.
- **The criterion is unchanged:** the Newcombe method-10 95% interval for the atlas's rejection
  rate minus the best baseline's, paired over the same invalid items, must lie above zero.
- **Limit, stated before the result:** a local model is a weaker "best LLM baseline" than a hosted
  frontier model. A MET result here says the atlas beats these three local models. It does not say
  the atlas beats the best available LLM.
- **A malformed reply is an error, recorded and scored as unanswered.** It is never defaulted.
- **Criterion 3 is NOT run.** It needs a reference corpus and an atlas-blind correct-reference
  label per item, and the set as built has neither. That task must be designed before it runs.

**Amendment 5 (2026-09-23) — the hosted frontier-LLM condition is not run.** By the owner's
decision, no hosted frontier model is run as an LLM baseline, and no money is spent on one. This is
a deliberate decision, not an omission. Criterion 2 stands as run in Amendment 4, against local
models. Its result (NOT MET) and its stated limit, that local models are weaker baselines than a
frontier model, are unchanged. No threshold, item, rater or hash changes.

**Amendment 6 (2026-09-23) — three criteria AMENDED by Mothership under the owner's delegation.**
The owner delegated these three decisions to Mothership, and Mothership made them on 2026-09-23.
Each criterion as written needs people that this study does not have.

- **Kappa (§2, the ROADMAP Phase 5 exit criterion).** The reported kappa is MODEL agreement:
  **0.984** valid/invalid and **0.978** over the nine categories, between two isolated instances of
  one model (Amendment 2). It is labelled exactly so wherever it is reported. Human kappa is NOT
  MEASURED, because there are no independent human raters. The rater role is not filled with model
  personas: two personas of one model family are not independent raters. The two rows of §2 stay
  "TO BE NAMED", and that is the honest state.
- **Criterion 5 (practical value).** NOT MEASURED. There are no human participants, and a model's
  time is not a user's time. This matches the owner's amendment of reviewer time in Phase 6.
- **Criterion 6 (curation cost).** Person-hours per admitted bridge are NOT MEASURED: the work was
  dispatched per agent, and there are no human curators. The reported cost is the MODEL cost from
  Amendment 2, USD 19.34 for the set (about USD 0.15 per authored item), labelled as model cost. The
  same amendment applies to the per-bridge curation-cost exit criteria of ROADMAP Phases 0 and 4.

No threshold, item, rater assignment or hash changes. The results already reported are unchanged.

**Amendment 7 (2026-09-24) — the Phase 0 independent-physicist review is AMENDED by Mothership under
the owner's delegation.** This amendment records a ROADMAP Phase 0 exit criterion here, beside
Amendment 6, so that every amended criterion is in one log. Independent human physicist review is
NOT MEASURED: there is no human reviewer. A model-persona review (Fable) was run on 2026-09-24
through the `CONTRIBUTING.md` review brief. It confirmed the physics of all six claims and returned
13 findings (8 defects, 5 qualifications); 9 are fixed with tests and 4 stand with evidence. Each
finding and its disposition is in `docs/research/phase-0-model-persona-review.md`. The persona review
is labelled as a model's work everywhere it is cited, and the criterion is closed by amendment, not
met. No threshold, item, rater assignment or hash changes.

**Amendment 8 (2026-09-24) — criterion 3 is RUN on a model-labelled reference corpus. Its inputs,
labels and scoring are frozen here, before any condition runs.** Amendment 4 did not run criterion 3:
the set had no reference corpus and no atlas-blind correct-reference label per item. Mothership's
design (`Dropbox/_fleet/specs/2026-09-24-upt-criterion3-design.md`) supplies both. This amendment is
committed, and its CI run is green, before any retrieval condition runs.

- **The task.** Given a claim from the benchmark, find the standard-physics relation that the claim
  restates or misuses.
- **Corpus.** The 107 canonical L-layer entries (`src/canonical/entries/`) at commit
  c144150a39283e88144d218952283ac6aa224341. A record's text is the name, the domain and the
  assumptions. Its expression is the `scalarAst`, present for 89 entries. The fields that name atlas
  bridges or models are left out. The corpus is the canonical registry, not the atlas, so the atlas
  does not search itself.
- **Queries.** The 125 frozen items. A query's text is the premises, then the conclusion. Its
  expression is the item's `expr`. The verdict and answer fields are left out. **The item ids and the
  file order carried the verdict**: in 7 of the 8 authoring batches, items 01-08 are valid. So each
  query has an opaque id, `q-001` to `q-125`, in the order of SHA-256(`upt-criterion3-2026-09-24` +
  item id). The key back to the items stays in this repository and was not given to the labelers.
- **Labels are MODEL labels, not human labels.** Two blind `claude-opus-5-5` labelers ran on the ZBOOK
  outside this repository. Their only inputs were the two files above, and Mothership audited every
  tool call they made for blindness. Each labeler listed, per query, the corpus ids that the claim
  restates or misuses, or "none".
- **Agreement.** Exact-set agreement is 99/125 = 0.792 (50 non-empty, 49 both "none"). The mean
  Jaccard index is 0.847, and 0.748 without the both-"none" queries. In 14 queries the two sets
  overlap but differ. In 12 queries one labeler said "none".
- **Truth.** PRIMARY: the 50 queries where both labelers gave the same non-empty set; the truth is
  that set. SECONDARY, a pre-registered sensitivity analysis: PRIMARY plus the 14 partial overlaps,
  with the truth equal to the INTERSECTION of the two sets (n = 64). Excluded: the 26 contested
  queries (the 14 partial overlaps, from PRIMARY only, and the 12 one-"none") and the 49 both-"none".
- **Where the truth falls.** PRIMARY: fluid statics 20, oscillators 12, waves 12, diffusion 6.
  SECONDARY: fluid statics 30, oscillators 13, waves 14, diffusion 7. Fluid statics is the held-out
  family (§3), and fluid statics makes up 40% of PRIMARY.
- **Coverage is a finding in its own right.** 49 of the 125 claims have no registry counterpart that
  either labeler could name. 19 of those 49 are diffusion items.
- **Conditions.** The three in-process conditions of §5 run as built: text retrieval
  (`rankByTextOverlap`), symbol matching (`rankBySymbolOverlap`) and typed structural search
  (`rankByStructure`), with `recallAtK` and `wilsonInterval`. These git blob ids pin the ranking and scoring
  code. The runner refuses to run on other code:
  `src/atlas/benchmark/baselines.ts` e3b579413c800cb52d112399070c93ddbd5d1dee,
  `src/atlas/benchmark/leakage.ts` af32f9ea7367f228a65236db636f7aab49210bcd,
  `src/canonical/normal-form.ts` 5f52b355e84fa10a03128cc7f4a3796f8b0b15bb,
  `src/atlas/benchmark/stats.ts` 0f873161cdea6fa125327505a8446696fd16fbea.
- **The embedding condition** is local only, because the owner declined spend. It runs after
  LLMBench is done, on the model that LLMBench's final class-6 result ranks best on search. The
  corpus and the queries are embedded ONCE, and the condition is scored from the stored vectors.
  Local embeddings are not deterministic run to run. The model name, its digest and the vector-file
  hash are registered in a further amendment BEFORE the embedding condition is scored.
- **Scoring.** Recall at depth 10 per condition, with Wilson 95% intervals. A query with no ranking
  counts as a miss. Results are given for PRIMARY and SECONDARY, pooled over all families, per family,
  and for the in-distribution families pooled (PRIMARY n = 30). Fluid statics is reported separately.
- **The criterion (§6, item 3) is evaluated on PRIMARY, pooled over all families (n = 50).** The
  wording of §6 does not name a pool, so the pool is fixed here, before any result is seen.
- **Power.** At n = 50 and a recall of 0.8, the Wilson 95% interval is [0.670, 0.888], a half-width
  of about ±0.109. This half-width is wider than the design's ±0.07. At n = 64 it is about ±0.097.
- **The word "valid".** All 3 query texts that contain the word "valid" are valid items. The verdict
  is never a label and is never scored, so the word cannot raise recall in any condition. The frozen
  text is left unchanged.
- **Until the embedding condition runs there is no criterion verdict.** In-process results are
  reported as INTERIM.

These SHA-256 values freeze the files. A test binds each value to its committed file under
`docs/research/criterion3/`. The values have no back quotes, because the test of §1 reads the LAST
back-quoted hash in this note as the item-set hash. The item-set hash does not change.

| File | SHA-256 |
|---|---|
| corpus.json | 232062ff9fd0e6c1f3fcc56d489c0c1de92c4db6370c8696eb42b4463a4f2fcc |
| queries.json | dea19d47606ca6c59eb5e73fb2487a111c9d38cca17a0e0603dc39c38cc367f0 |
| queries-key.json | c97e8bd1babc2ca2bd2439711290370988d92c36921c08b4ebe08ff75230043a |
| labels/labeler-A.json | f92df3899db581b07c2fb28718cb7b84702722ccc07f0786332b17e01d4ed29f |
| labels/labeler-B.json | f36b9ee2b0ded763685a7600d7462f8e49dee0665c7562fdfef06bcb6502265f |
| labels/agreed-labels.json | 8737cfc28577263f0164674223aabb44e588a697f4206235b3259df91a0c5c67 |
| truth.json | 06756dd14cc7f663d592749ac3e5777ccecbfac7f7dd647c696adf052b1b274e |

No threshold, item or rater assignment changes.
