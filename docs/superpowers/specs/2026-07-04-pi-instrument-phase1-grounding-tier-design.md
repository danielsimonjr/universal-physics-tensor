# PI-Instrument Program · Phase 1 — Epistemic-Grounding Tier: Design

**Date:** 2026-07-04 · **Status:** r1 — DRAFT, awaiting Adam/Eve vet.
**Program:** "PI instrument" — make the framework an honest falsification
instrument a scientist can stake a claim on. Phase 1 of 5 (grounding tier →
mechanism tier → propose→confront loop → evidence spine → frontier output).

## The PI need this serves

Every discovery verdict must tell a PI **how much weight it bears** — not just
`promising` / `magnitude-clash`, but *which falsifiers actually tested it, which
abstained, and the honest ceiling of that vetting*. A candidate that is
`promising` because the magnitude gate ABSTAINED (no representative value) is
weaker than one that PASSED it — and today the CLI shows both identically. The
PI's core need ("a trustworthy no, an extraordinary yes") starts with making the
provenance of every verdict legible.

## What this is (and is NOT)

- **IS:** a pure, derived **grounding record** consolidating the falsifier
  results ALREADY computed on every `VettedCandidate` (magnitude checked/
  abstained + orders-apart, axis checked/clashes, numerical consistency,
  subsuming, consequence annotation) into: the gates it CLEARED (ran + passed),
  the gates that ABSTAINED (couldn't test — the gaps a PI cares about most), the
  strongest cleared **tier**, and the honest **ceiling** (`mechanismTested:
  false`, `dataTested: false` — flipped by Phases 2 and 3).
- **IS NOT:** any change to verdicts, scores, counts, or the funnel. Like
  consequence-propagation (Phase 4-Unit-A), this is **annotation-only** — the
  calibration benchmark and every funnel count are untouched. It adds NO new
  machinery and NO new physics; it surfaces existing vetting honestly.

## Design — a pure function, no state change

`describeGrounding(c: VettedCandidate): CandidateGrounding` in a new
`src/composition/grounding.ts` (pure, no imports of engine/discovery state):

```
interface CandidateGrounding {
  readonly clearedGates: readonly string[];   // ran a real comparison AND survived
  readonly abstainedGates: readonly string[]; // could NOT test this candidate (the gaps)
  readonly tier: GroundingTier;               // strongest gate cleared
  readonly mechanismTested: boolean;          // false until Phase 2
  readonly dataTested: boolean;               // false until Phase 3
}
type GroundingTier =
  | 'dimensional-only'      // only the shared-dimension + structural checks ran
  | 'magnitude-vetted'      // the magnitude gate ran and passed
  | 'axis-vetted'           // axis-compatibility ran and passed (mechanism PROXY)
  | 'consequence-classified'; // a symbolic consequence was derived + classified
```

Derivation (all from existing fields — no recomputation):
- **numerical-consistency** always ran → `clearedGates` if `numericallyConsistent`.
- **magnitude**: `magnitudeChecked` → cleared as `magnitude (N orders ≤ threshold)`;
  else `abstainedGates += 'magnitude (no representative value)'`.
  If `magnitudeUsedAnchor`, note the value was anchor-forward-evaluated (weaker).
- **axis-compatibility**: `axisChecked && axisClashes.length===0` → cleared
  (`axis-vetted`, the strongest *mechanism-proxy* available today); `!axisChecked`
  → `abstainedGates += 'axis (regime attributes unresolved on one/both sides)'`.
- **consequence** (from the existing `consequence` annotation, if present):
  `entailed`/`novel-consequence` → cleared (`consequence-classified`);
  `inconclusive` → `abstainedGates += 'consequence (algebraically too thin)'`.
- `tier` = the strongest cleared, in the order above.
- `mechanismTested` / `dataTested`: **hardcoded false** in Phase 1 — the honest
  ceiling. Axis-compatibility is a *proxy*, not a mechanism test; NO candidate is
  data-confronted. These flip only when Phases 2/3 land, so the record is
  future-proofed and never over-claims today.

**The honesty guard (the load-bearing rule):** a gate is `cleared` ONLY if it ran
a real comparison. A candidate whose magnitude gate abstained is NOT
"magnitude-vetted" — it goes to `abstainedGates`. The tier reflects what was
actually TESTED, never what was merely applicable. This is the whole point: it
must expose the WEAKNESS (abstentions), not paper over it.

## Exposure

- `upt discover` (text): a per-`promising` grounding trailer, e.g.
  `[grounding: axis-vetted · cleared: consistency, magnitude(0.3 orders), axis · abstained: — · ceiling: no mechanism/data test]`.
- `--json`: a `grounding` object on each candidate (already-sanitized envelope).
- No change to the funnel summary line or the non-promising verdict rendering
  (keep the review surface uncluttered; grounding shows where a PI would spend time).

## Architecture

| File | Responsibility |
|---|---|
| `src/composition/grounding.ts` (create) | `CandidateGrounding` type + pure `describeGrounding(candidate)`. |
| `src/cli-api.ts` (extend) | export `describeGrounding` for the CLI barrel. |
| `src/cli/commands/discover.ts` (modify) | render the grounding trailer per promising candidate; add to `--json`. |
| `tests/composition/grounding.test.ts` | per-branch: abstained magnitude ⇒ NOT magnitude-vetted; axis-clash ⇒ axis in neither cleared-nor-abstained-as-passed; tier ordering; mechanism/data always false. |
| CLI `discover` goldens | re-pin (the promising trailer gains the grounding line). |

## Firewall + go/no-go

Annotation-only: funnel verdicts/scores/counts and the calibration benchmark are
untouched (assert unchanged). **Task-0:** apply `describeGrounding` to the live
funnel's 7 catalog `promising` candidates and show the records — confirm they are
honest (every abstention surfaced, no over-claim) and genuinely legible to a PI.
If the tier ever reads stronger than what actually ran, that is the bug this
design exists to prevent — fix or don't ship. Proceeds only if the Task-0
records are honest and the benchmark is unmoved.
