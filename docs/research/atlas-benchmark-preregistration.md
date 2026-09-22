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
