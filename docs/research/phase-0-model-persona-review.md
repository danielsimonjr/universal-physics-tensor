# Phase 0 atlas pilot — model-persona review (Fable), not a human physicist

**Reviewer:** a model instance (`claude-fable-5-1`) instructed to act as an independent, skeptical
mathematical physicist. **It is not a human physicist, and this review does not satisfy the
Phase 0 exit criterion "reviewed by an independent physicist".** Mothership approved the run and
ruled that the criterion is to be closed by amendment, never recorded as met (pre-registration
Amendment 7, written once every finding below has its disposition).

**Date:** 2026-09-24. **Scope:** the review brief in `CONTRIBUTING.md` item 0 — five typed relations
between oscillator models, one rejection, and the `(K, δ)` composition law — plus the question for
each relation of whether its witness could pass while the claim is false. **Access:** read-only;
the reviewer recomputed every number in its own scratch scripts and did not run the repository's
tests.

Each finding has a disposition below. A disposition is either a fix at root with a test, or a
statement of why the finding stands, with the evidence.

## Verdicts on the six claims

| # | Claim | Verdict | Summary |
|---|---|---|---|
| 1 | spring↔LC typed `exact-equivalence` | CONFIRM | Both reduce to `u″ + u = 0` with no surviving group; the relation is a conjugacy of flows by an affine map, stronger than an analogy. Keeping the type was right. Two record corrections (D1). |
| 2 | pendulum period error θ₀²/16, horizon `t ≪ 16T₀/θ₀²` | CONFIRM | `T/T₀ = 1 + θ₀²/16 + 11θ₀⁴/3072 + 173θ₀⁶/737280 + …`; at θ₀ = 0.2 the AGM value is 0.002505744229, and the residual over θ₀²/16 matches the next term. The exact-AGM `delta` at the edge (0.0158525311) is correct. |
| 3 | `m → 0` damped oscillator as a SINGULAR limit | CONFIRM, QUALIFY | Tikhonov applies (order 2→1, layer thickness `m/b`); the offsets and velocity errors match the two-root solution. The machine bound is wrong outside `b = k = 1` (D2), and the declared domain is the overdamped set, not the asymptotic regime (Q-d). |
| 4 | chain→wave dispersion error `(qa)²/24` | CONFIRM | `ω_lat/ω_cont = sin x / x`, `x = qa/2`; measured deviations match `−(qa)²/80`. The witness compares two formulas and never integrates the chain (Q-b); `linearity` is unwitnessed (D5). |
| 5 | rejection of cubic-spring↔LC | CONFIRM the verdict, QUALIFY the reason | The surviving group `β x₀²/k` is necessary, not sufficient, evidence. The decisive fact is isochrony: the Duffing period depends on amplitude (6.225 / 6.061 / 5.517 at A = 0.5 / 1 / 2, ε = 0.1), the LC period does not, and no time-rescaling conjugacy can change that (D3). |
| 6 | `(K, δ)` composition, outer-after-inner `(K₂K₁, K₂δ₁ + δ₂)` | CONFIRM | Affine maps `e ↦ Ke + δ` compose associatively with identity `(1, 0)`; 0 violations over 10⁴ random triples. The defining comment has a typo (D4); `K` on the approximation bridges is declared, not derived (Q-c). |

## Findings and dispositions

| ID | Where | Finding | Disposition |
|---|---|---|---|
| D1 | `src/atlas/oscillators/bridges-exact.ts` (`ab-spring-lc`, `ab-spring-rlc`) | `preserves: 'natural frequency'` is false as written: the map rescales time (fixture ω = 2 against 2√2). The `transformation` states two nondimensionalizations, not the spring→LC map. | Fixed. `preserves` now reads "the natural frequency in units of ω0 (ω = 1 in τ = ω0 t)" for both exact bridges, and `transformation` states the composed map `q(t) = (q0/x0)·x(ω_LC t / ω_s)`. The existing witness W1a already carries the evidence: ω_s = 2 and ω_LC = 2√2 differ, and the trajectories agree in τ. |
| D2 | `src/atlas/oscillators/bridges-limits.ts` `dampedOffsetBoundAt` | Returns `2(1+|v₀|)m/b` for any `b`, with no `k` or `x₀`; inside the declared regime (`m = 1e-3, b = 1, k = 100`) the true sup 4.38e-2 exceeds the returned 2e-3 by 22×. | Fixed. `dampedOffsetBoundAt` now requires `k` and `x0` and returns `Infinity` unless `b = k = x0 = 1`, the only normalisation at which the record declares the bound. A generalised formula was not adopted: it would need its own proof over the whole regime. Test: at `k = 100` the true error exceeds the old formula by more than 20× (the finding, reproduced), and the function now refuses there; every existing call passes the normalisation explicitly, so no check turned vacuous. |
| D3 | `src/atlas/oscillators/rejections.ts` `ax-cubic-spring-lc` | The reason says "no change of variables" can make the models equivalent; the witness W3 shows only a surviving group. Isochrony is the decisive fact, and no witness measures it. | pending |
| D4 | `src/atlas/error-algebra.ts` header | The bound is written `|f(x) − f̃(x)| ≤ K|x − x̃| + δ`; the second argument must be `x̃`. | Fixed (comment text; no test can observe a comment). |
| D5 | `src/atlas/oscillators/bridges-coarse.ts` `preserves: 'linearity'` | Unwitnessed, contrary to the Design §12 rule applied elsewhere. | pending |
| D6 | `src/atlas/oscillators/rejections.ts` | `model-lc` is both a premise and the conclusion; Design §3 gives no conclusion. | Fixed. The rejection now has premise `model-cubic-spring` and conclusion `model-lc`, the bridges' convention, and the design note's table matches. New invariant over every family: no rejection lists its conclusion among its premises (RED on the old record). An existing test that pinned the old premises list is updated. |
| D7 | `docs/planning/Atlas-Phase-0-Design.md` "Composition" | The composite bound `(1, θ₀²/16)` is stale; the record declares the exact-AGM value. | Fixed. The design note now gives the composite bound as the pendulum bridge's `(1, δ)`, with `δ` the exact period error at the θ0 = 0.5 edge. |
| D8 | `src/atlas/oscillators/bridges-limits.ts` pendulum `horizonHolds` | Uses the series `4T₀/θ₀²` where the exact period function exists. | pending |
| Q-a | `tests/atlas/oscillators-exact.test.ts` W1b | Tests `x₀·u/x₀ = u`; it cannot fail on any bridge claim. | Fixed. W1b now integrates the dimensioned spring independently from the inverse-mapped initial conditions and requires agreement with `x0·u(ω0 t)` within 1e-8; a negative control maps with a 1% wrong ω0 and must miss by more than 1e-3. The record's W1b description is updated. |
| Q-b | `tests/atlas/oscillators-coarse.test.ts` W9 | Compares two hand-typed formulas; nothing integrates the chain, so it passes with the model's dynamics changed. | pending |
| Q-c | pendulum bound `K = 1` | `K` is a declared number, not a derived Lipschitz constant (law 1). | pending |
| Q-d | `ab-damped-massless` domain | `m k/b² < 1/4` is the overdamped set, not the asymptotic regime: at `m = 0.24` the declared `δ = 3` bounds a true sup of 0.52, true and uninformative. | pending |
| Q-e | pendulum horizon | The horizon uses the π/2-drift time, a quarter of the full-lap time `16T₀/θ₀²`. | pending |

## What the reviewer did not check

The CAS witnesses W1s/W2s and `witness-results.json`; W4/W5 (quantum support); the internals of
`deriveRegimeGroups` and `buckinghamPi` (it solved the exponent systems by hand instead); the Lean
`formalRef` and its axiom gate; `boundPath` and `propagateUncertainty` beyond the lines cited;
whether the suite was green at the reviewed head; the citations' editions.
