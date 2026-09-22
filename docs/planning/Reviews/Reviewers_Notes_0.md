# Reviewers' Notes 0 — UPT Atlas, Sprint 2 (Eve E2)

**Date:** 2026-09-22 · **Target:** the Atlas layer at `67c0250`..`a7ac08d` · **Orchestrator:** Starship (lead)

## Panel composition, and an honest gap

| Reviewer | Model | Status |
|---|---|---|
| Eve (adversarial adjudicator) | OpenAI `o3` | **DELIVERED** — verdict DO NOT APPROVE |
| Physicist | fable | running at write time; no findings received |
| Mathematician | fable | idle, **no report delivered** |
| Researcher | fable | idle, **no report delivered** |
| Computer Scientist | fable | idle, **no report delivered** |

**The convergence pass this round is DEGENERATE and that is stated rather than hidden.** The skill
marks cross-agent convergence as REQUIRED and as the highest-signal step, because an issue raised by
two specialists independently is worth more than either verdict alone. With one source there is
nothing to converge. Everything below is Eve's, plus the lead's own verification where it exists —
and where the lead disagrees, that disagreement is recorded as a disagreement, not arbitrated away.

## CRITICAL

| # | Issue | Source | Verified by the lead? |
|---|---|---|---|
| 1 | Quadrature of a deterministic bias with a statistical sigma is **not defensible**. `sqrt(σ² + δ²)` understates the envelope because δ is a worst-case BIAS, not a zero-mean random variable. Options: keep them separate (`stochasticSigma`, `deterministicDelta`); or if one number is mandatory, ADD them; or return a distribution supporting affine translation by ±δ. | Eve | Not yet — the second independent reading of the same defect (an earlier panel raised it; both now agree) |
| 2 | ~~The K-less-middle-edge safeguard is dead code~~ **REFUTED BY THE LEAD, 2026-09-22.** The guard is exercised TWICE with the exact shape Eve called unreachable: `tests/atlas/error-algebra.test.ts:61` passes `composeBoundPath([b(2,1), null, b(3,2)])` and asserts the throw, and `tests/atlas/path-bound.test.ts:277` builds three bridges with the MIDDLE one carrying no bound and asserts `MissingLipschitzError`. It is NOT dead code and NOT unobserved. | Eve | **REFUTED** — and her fix (register an identity self-equivalence per model) would have added synthetic bridges to a PHYSICS catalogue to make reachable a test that already exists. Not adopted. |

## IMPORTANT

| # | Issue | Source | Verified by the lead? |
|---|---|---|---|
| 3 | **The horizon test in the brief is not sharp.** Machine form trips at `4·T0/θ0²` = 100; prose scale is `16·T0/θ0²` = 400. Testing at t=1000 exceeds BOTH, so it passes even if the machine form is wrong. Sharper: test between them. | Eve | **CONFIRMED BY MEASUREMENT.** t=99 → all hold; t=101 → NOT all hold. The enforced boundary is 100, i.e. the machine form. |
| 4 | Narrowing ab-damped-massless's DOMAIN to b=k=1 is "an expedient, not a fix" — it hides that the bridge gives no uniform error control for variable damping. δ should be a function of b (or of `m·k/b²`), with `deltaAt` promoted from nice-to-have to the SOURCE of the sup. | Eve | **LEAD DISAGREES — recorded, not arbitrated.** See disagreements below. |
| 5 | `approximation ∘ exact-equivalence = no-composite-claim` is **not intrinsically too strong — the METADATA is missing.** With a recorded `preservesNorm` on exact-equivalence bridges the composite is legitimate and equals the first edge's (K, δ), since the second contributes (1,0). The brief is STALE; the implementation is correct given present metadata. | Eve | Reasoning accepted; the field does not exist today |
| 6 | Tests still refer to the legacy scalar δ while `deltaAt` now exists — risk of divergence. Add a property-based test asserting `sup deltaAt ≥ delta` over the declared domain. | Eve | Not yet run |
| 7 | IDENTITY_BOUND is "the identity only in the norm a bridge states", but many bridges state no norm — silently promoting an implementation-defined default metric. Every bridge carrying a bound should be required to name its norm. | Eve | Not yet audited |

## Eve's recommendation the lead judges WRONG, and why

Eve calls the 4× prose/machine gap a likely "copy-paste slip from the π/2 derivation" and recommends
auditing every other horizon for the same error. **The quarter is deliberate and documented.** The
source states that at `16·T0/θ0²` accumulated phase drift reaches a full 2π — the approximation has
LAPPED — so `t < 16·T0/θ0²` is not a horizon at all; `≪` carries the claim and `<` cannot render it.
`4·T0/θ0²` is the π/2-drift time, and **W7b independently measures 99.77 cycles at θ0 = 0.2**, which
matches the boundary measured here between t=99 and t=101. Eve was given this rationale in the brief
and flagged it anyway.

The audit Eve recommends is still worth doing — for the OPPOSITE reason. Any horizon whose machine
form EQUALS its prose scale is the suspicious one, because `<` on a `≪` scale is not a horizon.

## Disagreements (reported as-is)

**Item 4 — domain narrowing.** Eve: an expedient that hides a real limitation. The lead and
Mothership: a smaller TRUE claim beats a larger FALSE one, and it is the exact inverse of the
original defect, where a fixture value was dressed as a general bound. Both positions agree the
END state is δ as a function of the dimensionless group; they disagree on whether the current state
is a fix or a waypoint. **Eve is right that it should not be left here.**

## Aggregate verdict

**DO NOT APPROVE Sprint 2 as complete.** Two CRITICAL items stand, one of them (quadrature) now
raised independently by two reviews. The sprint's CODE is green — typecheck exit 0, 4229 passing —
and that is not the question: the question is whether the contracts say true things, and on two
counts they do not yet.

## Method note for the next round

All four fable reviewers were briefed "research-only — do NOT edit any files", per the skill's
template. The skill ALSO carries a survival protocol: "append your findings as you finish EACH item
— never hold results in memory for a single write at the end", because an agent can die silently
taking every finding with it. **Those two instructions contradict each other**, and this round lost
three reports to exactly that. Next round: give reviewers an append-only findings file OUTSIDE the
repo, which satisfies both.

## Correction: why Eve's CRITICAL 2 was wrong, and whose fault that is

**Mine.** The brief inlined the contracts, the CLI behaviour and the measured numbers, and said
NOTHING about test coverage. Worse, item (d) was worded as "I could not construct a 3-hop path with
a K-less edge in the middle through the CLI" — true of the CLI, and she generalised it to "the
safeguard is presently untestable, therefore de-facto dead code". **That generalisation is sound
reasoning from the evidence she was given.** An adversarial reviewer handed partial evidence will
confidently fill the gap, and the confidence is not a defect in the reviewer.

What remains true and narrower: the guard cannot be reached through the CLI, because no catalogue
path has an unbounded interior edge. That is a CLI-surface coverage observation, not dead code, and
it does not justify changing a physics catalogue.

**Rule for the next round: state what IS covered, not only what was tried and failed.** A reviewer
cannot distinguish "untested" from "I did not look" unless the brief says which.
