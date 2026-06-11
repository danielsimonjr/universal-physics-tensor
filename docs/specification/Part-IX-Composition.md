# Part IX — Bridge Composition (Research-Track Specification)

> **Status:** Phase A research spec per v0.7+ Proposal 6. This is
> a SPECIFICATION document, not an implementation manifest. The
> composition operator + cascade evaluator are deferred per
> Adam-F2 reconciliation (existing bridge evaluators have ad-hoc
> return shapes with no shared `Observable` contract; a translation
> layer would force design choices that belong in Phase B / v0.9α).
>
> **Phase A goal:** Define what "bridge composition" MEANS in UPT,
> with enough precision that Phase B (v0.9α calibration) can test
> against ≥3 known cross-scale derivations, and Phase C (v0.9β
> stress tests) and Phase D (v1.0 hypothesis generation) inherit
> a clear yes-or-no acceptance bar.

## 1. The composition question

UPT ships a 44-bridge catalog at v0.7. Each bridge declares
`source: TensorIndices → target: TensorIndices` and carries a
formula. A natural follow-up question: **can two bridges be
composed to derive a third relation that the literature confirms?**

Concrete example: bridge `B_A: quantum → mesoscopic`
(decoherence-driven emergence of classical states) + bridge
`B_B: mesoscopic → classical` (statistical-mechanical averaging)
should compose to a `B_B ∘ B_A: quantum → classical` relation
that recovers the standard "quantum→classical" reduction limit.

## 2. Operational definition of composition (Decision #1 locked)

Per P6 Decision #1, "compose" has the following precise meaning
in UPT v0.8+:

> Two bridges `B_A: regime₁ → regime₂` and `B_B: regime₂ → regime₃`
> *compose* to `B_B ∘ B_A: regime₁ → regime₃` if, given a numerical
> instance of an observable in `regime₁` and the parameters of
> both bridges, evaluating `B_A` then `B_B` (cascade) produces an
> output in `regime₃` that matches the literature-known direct
> derivation of the same observable in `regime₃`, to within the
> tolerance the calibration case admits.

Two interpretations locked in priority order:

| # | Interpretation | Status | Layer |
|---|---|---|---|
| (d) | Numerical-cascade composition (B_A's numerical output → B_B's numerical input) | **PRIMARY** | Machinery — `src/composition/` (deferred to Phase B) |
| (b) | Categorical composition (regimes as objects, bridges as morphisms, ∘ as morphism composition, non-commutativity as 2-cells) | **SECONDARY** | Language — this document |
| (a) | Symbolic AST composition | **OUT** for Phase A; revisit Phase B if needed | — |
| (c) | Logical implication | **OUT** (wrong primitive for physics bridges) | — |

The categorical layer (b) is the *language* this definition is
expressed in; the cascade layer (d) is the *machinery* that
produces the numbers.

## 3. Categorical framing (documentation-only)

Following Baez & Stay (2010), Coecke & Kissinger (2017), Fong &
Spivak (2019):

- **Objects.** A regime — an element of the v0.8 `RegimeType`
  registry (`src/core/regime-registry.ts`). Examples
  pre-registered at v0.8: `Axes.scale.quantum`, `Axes.scale.classical`,
  `Axes.force.gravitational`, etc. (18 built-ins; downstream
  packages register more.)
- **Morphisms.** A bridge — an element of UPT's 44-bridge catalog,
  oriented from `source: TensorIndices` to `target: TensorIndices`.
  The morphism is the *equation* + *physics* + *parameter
  specification* (not just a label).
- **Composition (∘).** `B_B ∘ B_A` is defined iff
  `target(B_A) = source(B_B)` (regime tuple identity, NOT just
  axis-name match). The result morphism has
  `source(B_B ∘ B_A) = source(B_A)` and
  `target(B_B ∘ B_A) = target(B_B)`.
- **Identity (id_R).** A regime R's identity morphism — the
  trivial "no-op" bridge from R to R. Phase A leaves this
  unspecified; Phase B may need it for associativity-witness
  tests.
- **2-cells.** Obstructions to commutativity. If `B_C ∘ B_A` and
  `B_C ∘ B_B` give different numerical results for the same
  input observable, the obstruction is a 2-cell (or higher
  natural transformation in the 2-category of physics theories).
  Non-trivial 2-cells are EVIDENCE that the regime taxonomy is
  too coarse — different cascades through ostensibly-equivalent
  intermediate regimes give different answers.

## 4. Cascade-evaluation contract (deferred to Phase B)

Phase B will ship a `compose(B_A, B_B): CompositeBridge` operator
in `src/composition/compose.ts`. Per Adam-F2, the precondition
is a shared `Observable` contract on bridge outputs that does NOT
yet exist at HEAD. The existing evaluators
(`evaluatePerihelionPrecession`, `evaluateGravitationalLensing`,
etc.) return ad-hoc TS interfaces (e.g.,
`PerihelionPrecessionResult` with 6 numeric fields). A composition
operator requires either:

- (a) An `Observable<RegimeT, ValueT>` interface that every
  bridge evaluator returns (breaking change to v0.7+ evaluators);
- (b) A per-bridge-pair `BridgeAdapter` that translates
  `B_A`'s output struct → `B_B`'s input struct (one adapter per
  composable pair — combinatorial blowup); or
- (c) A purely numerical cascade on rank-1 tensors (treat each
  bridge as `numbers → numbers`, lose all type safety).

Phase B will choose between (a) and (b) — the design of that
choice IS Phase B's deliverable.

## 5. Calibration set (Phase B target, named here per Decision #3)

Phase B will test composition against five named cross-scale
derivations (C1-C5). Phase A enumerates them so the Phase B
plan inherits a concrete acceptance bar:

| ID | Source bridge | Target bridge | Cross-scale derivation |
|---|---|---|---|
| C1 | Decoherence master (BE-11) | Coherence length (BE-12) | quantum→classical: decoherence length scaling — **REALIZED 2026-06-11 as CT-3** (Zurek scaling Γ_dec = γ·(Δx/λ_T)², `composeEdges(be12Edge, be11ZurekEdge)`; pre-registered v0.8.0-Design.md §9) |
| C2 | Einstein-Cartan (BE-17) | Newton + special-relativity → weak-field GR | Newtonian limit recovery |
| C3 | Higgs mass (BE-18) | Vacuum energy (BE-20) | electroweak → cosmological-constant problem residue |
| C4 | Hawking temperature (BE-42) | Information bounds | black-hole-thermodynamics → information-theoretic — **REALIZED 2026-06-11 as CT-1** (erasure cost E_min(M) = ℏc³ln2/(8πGM), `composeEdges(be42Edge, be16Edge)`) |
| C5 | Shapiro time delay (BE-37) | Perihelion precession (BE-52) | weak-field GR consistency across observables — **PARTIALLY REALIZED 2026-06-11 as CT-2** (BE-51/52 shared-source ratio 2a(1−e²)/(3πb); the BE-37 pairing remains open) |

All cited BE-IDs verified present in `src/bridges/index.ts` per
the v0.7-p6 Phase A Eve review.

## 6. Success / failure criteria (P6 Decision tag)

The track succeeds if, at v1.0 close, at least one of:

1. **Positive outcome.** ≥3 of C1-C5 reproduced (Phase B), ≥2
   stress tests survived (Phase C), ≥1 novel candidate generated
   for physicist review (Phase D). UPT plausibly claims a
   methodological contribution.

2. **Negative outcome with diagnosis.** Framework fails on C1-C5
   in a way the design can NAME (e.g., "categorical composition
   cannot represent non-commuting order-of-limits"); failure
   published as a research note in the v1.0 white paper. UPT
   plausibly claims a methodological *clarification* — pinning
   down what does NOT compose and why.

The track fails only if Phases A-D end with **no clear yes-or-no**
— a vague "more research needed" that doesn't advance the field.

## 7. Open questions (cross-referenced in
`docs/planning/v0.7-Proposal-6-PhaseA-Open-Questions.md`)

Phase B should not open until at least Q1-Q3 below are resolved
(or explicitly deferred to v0.9α with documented justification):

- **Q1.** Which of (a) shared `Observable` contract vs (b)
  per-pair `BridgeAdapter` is the Phase B composition surface?
- **Q2.** What's the tolerance discipline for "matches the
  literature"? Per-derivation? Or a global epsilon?
- **Q3.** Does composition commute with the existing flux
  rules (BE-coordinate-matching, causality, regime-consistency)?

## 8. Honest scope note

Phase A's *engineering* output this session is THIS document +
the Open-Questions doc + the Adam+Eve review-findings doc. No
TypeScript code ships in `src/composition/` per Adam-F2 (the
translation layer needs to be designed, not improvised). This
preserves the "research track decoupled from release cadence"
framing in P6 Decision #0.
