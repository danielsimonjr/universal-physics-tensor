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
