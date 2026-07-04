# PI-Instrument Program · Phase 2 — Mechanism Tier: Design

**Date:** 2026-07-04 · **Status:** ❌ **NOT BUILT — grounding-confirmed.** A
mechanism-proxy falsifier beyond axis-compatibility is not buildable at
meaningful yield without fabricating physics the catalog does not have. The
`mechanismTested: false` ceiling on discovery candidates is documented as
PERMANENT, not a placeholder.

## The question

Phase 2 asked: is there a *defensible* mechanism-proxy discriminator that goes
beyond dimensional matching — one that could flip the grounding ledger's
`mechanismTested` ceiling (Phase 1) by testing whether a proposed identification
a≡b is *mechanistically* plausible, not just dimensionally coincident?

## Grounding verdict (2026-07-04) — NOT buildable

A read-only substrate map (cited to source) established:

1. **The attribute vocabulary is exhausted.** `RegimeAttributes`
   (`quantity.ts:24-33`) is the entire mechanism vocabulary: three hand-assigned
   categorical axes (`scale`, `force`, `information`; `discovery.ts:70` gates the
   first two). The axis gate is exact per-axis equality (`discovery.ts:402-411`),
   not a mechanism model. Coverage: of 131 quantities, only 56 carry both
   scale+force; the gate abstains whenever either endpoint is silent.
2. **The only objective extension does not discriminate.** The one non-judgment
   attribute available — tensor rank / intensive-vs-extensive — is objective but
   provably cannot separate *same-kind, same-dimension* pairs, which is exactly
   what the funnel surfaces: all 7 live `promising` candidates are energy≟energy,
   mass≟mass, or length≟length, sharing rank and intensivity by construction.
3. **New categorical attributes inherit the abstention problem.** The v0.32.0
   axis audit (`discovery-precision-calibration.md:86-162`) deliberately STRIPPED
   the recurring generic endpoints (`mass`, `temperature`, the rate quantities)
   to `{}` under uncertainty discipline (reviewer split ⇒ abstain). Any new
   categorical axis (conserved, field/particle, "role") is as judgment-laden as
   scale/force, would need a fresh 130-node adversarial audit, and would abstain
   on precisely the pairs it is meant to judge — 5 of the 7 survivors already
   carry "axis unresolved" as a gap.
4. **The genuine mechanism signal already exists and honestly abstains.**
   `entailed` (`consequence.ts:57-82`) checks a candidate's consequence against a
   known canonical law (same target + governing set + matching normal form) —
   strictly stronger than a dimension match. It fires on **0 of 7** promising
   (the catalog's cross-domain monomials are not in the registry). The grounding
   ledger already reports this honestly (`entailed` passes, `novel-consequence`
   is a gap) while keeping `mechanismTested: false`.

The framework's own docs already state the ceiling
(`discovery-precision-calibration.md:38-39,51`): the distinguishing information
"is physical mechanism, which the dimensional engine cannot see… precision is not
delivered by gating."

## Decision

**Do NOT ship a new falsifier axis.** Flipping `mechanismTested` would require
encoding interaction/coupling physics the catalog does not have — an un-sourced
fabrication of the kind that killed the E-layer and Unit-B numerology this
session. `mechanismTested: false` is the honest, permanent state for a dimensional
discovery candidate; mechanism lives in the established-bridge world (`upt
confront`), not candidate space. Phase 1's `grounding.ts` comment updated to say
so.

**The constructive redirect the grounding surfaced:** the one defensible
mechanism proxy already in the code is `entailed`, currently starved of canonical
coverage. Growing the canonical registry so `entailed` fires more is the honest
mechanism investment — and the v0.34–0.36 L-layer expansion (66 → 103) was a step
in exactly that direction (though the *coincidence* candidates the funnel surfaces
will never be `entailed`, correctly — they are not real physics). This means the
program's real mechanism-and-data leverage is **Phase 4 (grow the evidence
spine)**, where mechanism and data actually live, not a candidate-space gate.

## Program impact

- Phase 2: not built. `mechanismTested` ceiling documented as permanent.
- Phases 3–5 proceed. Phase 4 (evidence-spine confrontations) is elevated as the
  real mechanism/data work; Phase 3 (propose→confront loop) is reassessed with
  the honest understanding that candidate-space confrontation is mostly
  "unconfrontable" (coincidences have no observable), and Phase 5 (frontier +
  null-result output) synthesizes the honest negatives.
