# Discovery-Funnel Precision — a Calibration (and why not to tighten the gate)

**Date:** 2026-06-21. Synthesis of the "funnel precision" frontier, grounded in this
session's two adjudication passes.

## The question

`upt discover` over the full graph (catalog ∪ canonical, 439 candidates) leaves **51
"promising"** identifications after its falsifiers (magnitude-clash + consistency).
That is a large review surface. Should the gate be *tightened* so fewer dimensional
coincidences reach "promising"?

## Two empirical facts

**1. The magnitude gate is threshold-insensitive.** Sweeping `--max-orders` 1 → 12
moves "promising" only 48 → 58 (and `contradictory` stays 0 throughout). The gate
falsifies genuine scale clashes (~61) but the surviving count barely responds to the
knob — the residue is not threshold-limited.

**2. Adjudication of the survivors yields zero genuine links.** Across this session,
**8** auto-surfaced candidates were put to independent Adam + Eve physics review:

| Source | Candidates | Genuine |
|---|---|---|
| Proposed equations (`discover --derive`, `proposed-equations-adjudication.md`) | 5 | 0 |
| Orphan connectors (`connectors`, `orphan-connector-adjudication.md`) | 3 | 0 |
| **Total** | **8** | **0** |

(1 of the 8, `hν=mc²`, is *recognized* physics — but already entailed by the L-layer,
so not a new link.)

## Why tightening the gate is the wrong lever

The precision ceiling is **structural, not tunable**. Dimensional — even same-*kind*
(shared-token) — matching is a weak prior: two quantities sharing a dimension and a
name fragment are *usually different physics* (a coarsening length is not a critical
ξ; a Förster radius is not a Schwarzschild radius). No magnitude threshold separates
"real cross-domain link" from "dimensional coincidence", because the distinguishing
information is *physical mechanism*, which the dimensional engine cannot see.

Worse, a tighter gate would falsify the **cross-domain** candidates specifically —
which is exactly what UPT exists to surface. The funnel *should* propose
`information ↔ quantum` or `cosmology ↔ thermo` pairings; suppressing them to raise
apparent precision would defeat the framework's purpose. The one falsifier that is
safe to keep strict is **consistency** (`contradictory`, which correctly stays 0:
standard physics is self-consistent) — but that catches contradictions, not
coincidences.

## Conclusion

Precision is **not** delivered by gating; it is delivered by the **firewall +
human adjudication** discipline — and this session is the evidence that the
discipline works: 8 candidates surfaced, independently reviewed, **0 false positives
promoted**, catalog untouched. The correct posture for `upt discover` is therefore
unchanged: it is a **review-queue generator**, not a discovery engine, and its output
carries `unadjudicated` until a physicist disposes of it. No gate change is made.

The actionable improvements live elsewhere (and were pursued this session): grounding
established bridges in real data (`be52-mercury-confrontation.ts`, the
empirical-grounding frontier) and adjudicating the standing candidate sets to closure
(the two adjudication notes above).

## Reproduce

```bash
for N in 1 3 6 12; do node bin/upt.mjs discover --source=both --max-orders=$N | grep funnel; done
```

## 2026-07-02 update — verdicts moved into code

The 8 adjudication verdicts this note is grounded in (the two adjudication
passes tabulated above) now live in code, not just prose:
`src/composition/adjudication.ts` seeds all 8 as `CandidateAdjudication`
entries, keyed by an order-normalized quantity-name pair. `upt discover`
annotates every candidate against this ledger and folds the `decoy`/`entailed`
verdicts out of the printed PROMISING list by default (`--show-adjudicated`
re-lists them); `--json` always carries the full annotation, folded or not.
This makes the "0 genuine" finding above an operational property of the CLI,
not just a one-time review record — the funnel no longer re-surfaces a
candidate a physicist has already disposed of. `tests/composition/
discovery-calibration.test.ts` is the standing regression gate: it pins the
funnel counts and the 8 seeded verdicts, so any future change to the funnel,
the graph, or the ledger that shifts this calibration fails loudly instead of
silently drifting.

## 2026-07-02 update — D2 regime-attribute audit (adjudicated)

Phase-2 D2 audited every registry-backed `Quantity.attributes` value touched
by a cross-cluster candidate pair (59 quantities from `composition/
quantities/*.ts`, the union of the 132-catalog and 439-both candidate name
sets — see `.superpowers/sdd/phase2/audit-table-draft.md` for the full
per-quantity table and rationale). Adjudicated by controller + Adam
(gemini-2.5-pro, GREEN) + Eve (o3, YELLOW), 2026-07-02. Net changes, applied
in `src/composition/quantities/{fields,condensed-matter,quantum,common,
gravitation-cosmology}.ts`:

- **4 STRIPS** (generic / adjudicator-split rows reduced to `attributes: {}`
  or with the contested axis removed): `mass` (was `{scale: classical,
  force: gravitational}` — spans classical gravitating mass and quantum
  scalar-field mass; the fold test fails), `temperature` (was `{scale:
  classical}` — also resolves the `hawking-temperature → temperature`
  `QUANTITY_IDENTIFICATIONS` fold conflict), `decoherence-rate` and
  `relaxation-rate` (BE-11; `scale` only — Adam kept-classical vs Eve
  quantum, adjudicated split → abstain per the design's uncertainty
  discipline).
- **5 COMPLETES** (missing `force` axis filled, all unanimous, standard
  usage): `boundary-entanglement-entropy` → `force: gravitational`
  (Ryu–Takayanagi holographic entropy is an AdS/CFT quantity by
  construction), `donor-acceptor-distance` and `foerster-radius` →
  `force: electromagnetic` (FRET is dipole–dipole coupling), `mass-density`
  → `force: gravitational` (BE-19 LQC-bounce family, alongside
  `critical-density`/`rescaled-cosmological-constant`), `wormhole-
  entanglement-entropy` → `force: gravitational` (ER=EPR family, alongside
  `wormhole-cross-section-area`).
- **1 REJECTED completion:** `boundary-length`'s proposed `force:
  gravitational` fill was rejected on review — it is BE-22's topological-
  entanglement-entropy input (condensed-matter topological order), not the
  Ryu–Takayanagi/horizon family the drafter attributed it to. Kept as-is
  (`{scale: quantum}`).
- **All other keeps stand**, unannotated (the adjudication record's explicit
  call, to avoid keep-comment churn across ~50 unchanged nodes).

**Resolver semantics (Option A, unanimous):** a not-yet-built identity gate
must resolve a candidate name's effective attributes from **registry
`Quantity.attributes` only**, folded through `QUANTITY_IDENTIFICATIONS` with
conflict → abstain per axis; canonical per-equation `regime` stamps
(`canonical-graph.ts`'s `attributesOf`) never feed it — they are
equation-context, not quantity identity. This was adopted specifically
because the pre-audit registry/canonical asymmetry (Task-0 Finding F1: the
bare canonical variable `mass` picks up 20 canonical-stamped attribute
instances beyond its 8 registry-graph ones) would otherwise make the
`--source=both` gate behave inconsistently with `--source=catalog`.

**Would-clash re-measurement** (D1's per-axis rule — both endpoints state a
value, values disjoint → clash, else abstain — applied under Option-A
resolution to the live candidate-pair lists, pre- vs post-audit attributes):

| source | pairs | promising | would-clash (pre → post) | promising → clash (pre → post) |
|---|---|---|---|---|
| catalog | 132 | 12 | 90 → 80 | 7 → **5** |
| both (Option-A) | 439 | 51 | 81 → 71 | 12 → **10** |

Catalog flip list (5 of 12 promising pairs, unchanged by the audit — none of
the 9 changed rows alters this list, it was already implied by the
pre-existing tags on `grw-localization-rate`/`hubble-rate`/`mutation-rate`/
`schwarzschild-radius`/`boundary-length`/`coarsening-length`/
`thermal-wavelength`):

`grw-localization-rate ≟ hubble-rate`, `grw-localization-rate ≟
mutation-rate`, `schwarzschild-radius ≟ boundary-length`,
`schwarzschild-radius ≟ coarsening-length`, `thermal-wavelength ≟
coarsening-length`.

**Reverted (not a new flip — the design's intended correction):** `mass ≟
scalar-field-reference` and `mass ≟ scalar-field-value`, both axis-clashed
pre-audit purely on `mass`'s now-stripped generic tag. Under Option A this
reversion holds on **both** `catalog` and `both` — the F1 asymmetry the
draft flagged (mass's strip "not propagating" to `--source=both`) does not
survive once the resolver ignores canonical stamps entirely, as intended.

**Honest gap vs. the pre-adjudication draft:** the draft (written before
Option A was mandated) predicted "the same 5 catalog flips carry over" to
`both`. Re-measured directly against the actual 439-pair candidate list:
only 3 of the 5 (`grw-localization-rate ≟ hubble-rate`,
`grw-localization-rate ≟ mutation-rate`, `schwarzschild-radius ≟
boundary-length`) are even present as `both`-source candidate pairs;
`schwarzschild-radius ≟ coarsening-length` and `thermal-wavelength ≟
coarsening-length` are absent from the 439-pair set entirely (the
`coarsening-length` cluster does not generate as a cross-cluster candidate
once canonical equations are included in the graph). The `both`-source
promising→clash bucket (12 → 10) is smaller than the catalog one for this
structural reason, not because the audit under-covers it.

None of this moves `upt discover`'s printed funnel counts in this commit —
no gate consumes `attributes` yet (`discovery.ts` untouched); the numbers
above are the calibration `discover.ts`'s eventual axis-clash gate (D3+)
must reproduce.
