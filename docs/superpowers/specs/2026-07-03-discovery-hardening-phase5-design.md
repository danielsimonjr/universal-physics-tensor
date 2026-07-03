# Discovery-Hardening Phase 5 (v0.35.0) — Confidence-Weighted Magnitude Gate: Design

**Date:** 2026-07-03 · **Status:** r1 — DRAFT, awaiting Adam/Eve adversarial vet.
**Program:** Phase 5 of the discovery-hardening program.
**Grounded in** the 2026-07-03 substrate map (verified): the magnitude gate
compares `|log10(va) − log10(vb)|` against a flat `maxOrders` (default 3);
`RepresentativeValue = { value, source }` carries **no σ**; the only σ in the
codebase is *observational* (confrontation data); `propagateUncertainty` is
*linear*-space, not log-space.

## The fundamental gap, named up front (the Unit-B lesson)

The program roadmap called this "statistical magnitude gate: σ-level clash;
reuse propagateUncertainty." **The substrate map shows that framing is unsound:
there is no input σ on representative values, and inventing per-value σ's to
compute a p-value would be exactly the Unit-B error — statistics dressed on a
subjective prior.** The honest version cannot and must not claim *statistical
significance*. This design deliberately reframes:

- **NOT** "σ-level clash / p-value" (rejected — no principled σ, no null model).
- **INSTEAD** a **confidence-weighted** magnitude gate: a candidate is falsified
  as `magnitude-clash` when the two endpoints' log-magnitudes differ by more
  than a multiple of their *combined sourcing-confidence width*. The width is
  **honest metadata about how well each value is known**, not a physical σ, and
  the output makes no significance claim.

If even this honest reframing does not measurably improve on the flat
orders-knob (Task-0), Phase 5 ships as a documented negative result (the knob
stays) rather than adding confidence-theater — the same go/no-go as Unit A/B.

## What the confidence width IS (and is not)

Each `RepresentativeValue` gains an OPTIONAL `logWidth?: number` — a **log10
uncertainty reflecting sourcing confidence**, assigned by TIER, not fabricated
per-value:

| tier | example | `logWidth` (log10 units) |
|---|---|---|
| exact constant | c, ħ, G, k_B, e, planck-length | 0 (or omitted → 0) |
| textbook/measured value | bohr-radius, compton-wavelength | ~0.3 |
| order-of-magnitude estimate | most sourced entries | ~1.0 (the module's own "good to ~1 order") |
| anchor-forward-evaluated (no table entry) | graph-derived at the anchor | ~1.5 |

`logWidth` is a **provenance-confidence tier**, defensible and citable in the
`source` string (e.g. "CODATA exact → logWidth 0"; "order-of-magnitude,
logWidth 1"). It is explicitly NOT a claim that the quantity is Gaussian with
that σ — it is "how many decades of slop the sourcing carries." The tiers are a
fixed, small, reviewable set (4 values), not a per-quantity knob.

## The gate

Replace the flat threshold with a width-weighted one:

```
Δ        = |log10(va) − log10(vb)|
width    = sqrt(logWidth(a)² + logWidth(b)²)     // combined sourcing slop
clash    ⟺ Δ > k · max(width, widthFloor)
```

- `k` (fixed, default 3) and `widthFloor` (default 1, the current implicit
  "~1 order" coarseness) are FIXED in code, not runtime flags (anti-tuning,
  the Unit-B #9 mitigation). With `widthFloor = 1` and `k = 3`, a pair of two
  order-of-magnitude estimates (width ≈ 1.4) clashes at Δ > 4.2 — CLOSE to
  today's flat `Δ > 3`, so the default behavior barely moves. The refinement
  bites only where sourcing confidence is HIGH: two exact/textbook values
  (width ≈ 0.4, floored to 1) still clash at Δ > 3, but the *reporting* shows
  the gate ran on high-confidence values. Where one value is anchor-derived
  (width ≈ 1.5), the gate is *less* aggressive (Δ > ~4.7) — honestly reflecting
  that the comparison is on a shakier value.
- The verdict stays `magnitude-clash`; a new `magnitudeWidth` field records the
  combined width so a reviewer sees the confidence the falsification carried.

## The honest value question (what the vet must judge)

Because `widthFloor = 1` keeps the default behavior close to the orders knob,
**the refinement is deliberately modest** — it does NOT manufacture new
falsifications; it makes the existing gate *confidence-aware* (less aggressive
on shaky values, and it surfaces the width so a physicist can weight the
verdict). The honest question the vet must answer: **is confidence-awareness
worth the added `logWidth` substrate + the funnel-behavior change, or is the
flat orders-knob (which is already honest) good enough?** Task-0 measures how
many catalog/canonical verdicts actually change under the width-weighted gate;
if the answer is "≈0 change at the honest defaults," Phase 5 is NOT built (the
knob is fine) and that is the documented result.

## Firewall + benchmark (this one MOVES the funnel, unlike Unit A)

Unlike consequence-propagation (annotation-only), the magnitude gate is a
**funnel falsifier** — changing it CHANGES verdicts, so the Phase-1 calibration
benchmark **will move** and must be re-pinned to the new (measured) counts, with
the benchmark's binding guarantees enforced: **known-true recall must not
regress; adjudicated decoys must not resurface as promising; canonical
`contradictory = 0` must hold.** Task-0 measures the exact count delta first;
any candidate that FLIPS out of `magnitude-clash` into `promising` is inspected
individually (it must be a case where the flat knob was over-aggressive on
low-confidence values, not a real coincidence sneaking through). Ships OPT-IN
(a `--confidence-weighted` flag or off-by-default) until the delta is reviewed —
the flat gate remains the default falsifier until Phase 5 proves its worth.

## Architecture

| File | Responsibility |
|---|---|
| `src/composition/representative-values.ts` (modify) | `RepresentativeValue` gains `logWidth?: number`; assign tiers to existing entries (with the tier in the `source` string). |
| `src/composition/discovery.ts` (modify) | the magnitude gate reads `logWidth`, computes width-weighted clash + `magnitudeWidth`; gated by an opt-in option. |
| `tests/composition/discovery-calibration.test.ts` (modify) | re-pin counts under the width-weighted gate (measured); assert recall/decoy invariants. |

## Out of scope

Any statistical-significance / p-value claim (rejected as unsound); per-quantity
σ knobs; covariance; log-space rework of `propagateUncertainty` (not needed —
the gate does its own log-width combination); making the width-weighted gate the
default before Task-0 review.

## The go/no-go this design commits to

Task-0 measures the verdict-count delta at the honest defaults (`k=3`,
`widthFloor=1`). If the delta is negligible (the honest defaults barely move the
gate — likely, by construction), the recommendation is **do not build Phase 5**;
the flat orders-knob is already honest and the `logWidth` substrate is not worth
its weight. Phase 5 proceeds only if Task-0 shows the confidence-weighting
changes a meaningful, defensible set of verdicts for the better. This design's
most likely honest outcome is its own measured negative result — and that is a
legitimate deliverable, not a failure.
