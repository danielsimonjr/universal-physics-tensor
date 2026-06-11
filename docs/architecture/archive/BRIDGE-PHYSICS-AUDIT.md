# UPT Bridge Catalog — Physics-Correctness Audit

**Generated:** 2026-05-20
**Catalog audited:** `universal-physics-tensor` v0.5.1, the 42-bridge `BRIDGE_EQUATIONS` registry
**Method:** each bridge reviewed independently by two frontier reasoning models — Adam (Gemini 2.5 Pro) and Eve (OpenAI o3) — on six axes: dimensional consistency, canonical correctness, bridge legitimacy, status calibration, strongest objection, overall verdict. 84 reviews total. Verdicts then categorized, and every concrete "error" claim mechanically re-checked.

---

## Read this first — what this audit is and is not

- **It is** a two-model physics-reasoning second opinion, with the concrete dimensional claims independently verified by hand.
- **It is NOT** peer review, and not a physicist's certification. Where the two models disagreed, or made claims requiring the primary literature, this report says so rather than picking a winner.
- The reviewers were deliberately prompted to be skeptical ("the authors WANT errors found"). That pressure inflates raw "SERIOUS-ISSUES" counts — which is exactly why the headline below is the *categorized* picture, not the raw verdict tally.
- **Verification tiers used below:** `[VERIFIED]` = re-checked by hand and confirmed; `[CONTESTED]` = the two models disagreed and it was not resolved; `[REVIEWER-CLAIM]` = a physics-content claim from one or both models that needs a literature check before acting.

---

## Headline

**The equations are sound. The framing is the weak point.** This audit confirms, from the physics side, the same conclusion the theory-vs-implementation reconciliation reached from the code side.

- **0 INVALID verdicts across all 84 reviews.** Neither model judged any bridge's *equation* to be wrong physics.
- **4 bridges are essentially sound** with no significant issue: BE-19 (Quantum Bounce / LQC), BE-20 (Cosmological-constant density), BE-51 (Gravitational Lensing), BE-52 (Mercury Perihelion).
- Of the per-bridge "physics or framing" classification: **9 bridges** have genuinely physics-side issues, **17** are purely *framing/metadata*, **16** are mixed. The dominant failure mode is the catalog's framing and metadata, not its physics.
- The single most common concrete defect is the **`bridges` metadata field reading `unknown <-> unknown`** — flagged on ~9 entries. For a catalog whose unit is the "bridge equation," an entry that cannot name the two regimes it bridges has not earned the label.

---

## Issue breakdown (42 bridges)

| Category | Count | Bridges | What it means |
|---|---|---|---|
| framing-overreach | 7 | BE-24, 25, 26, 30, 38, 43, 46 | Equation is fine; the catalog's interpretation/claims exceed what it supports |
| dimensional-or-formula-error | 11 | BE-14,15,17,28,31,32,33,34,35,44,50 | A reviewer claimed a concrete formula/dimension bug — **see §1-§2: after code inspection, the signature claims were retracted; only BE-33 survives as a candidate** |
| bridge-incoherence | 5 | BE-18, 22, 36, 37, 42 | The entry doesn't actually connect two distinct physical regimes |
| ansatz-as-law | 5 | BE-11, 21, 23, 45, 49 | A phenomenological/ad-hoc form is presented as an established law |
| broken-metadata | 4 | BE-12, 27, 39, 41 | `unknown <-> unknown` bridges field, wrong category, etc. |
| none-sound | 4 | BE-19, 20, 51, 52 | No significant issue |
| encoding-reduction | 3 | BE-13, 47, 48 | The encoded formula is a reduction that drops physical content |
| status-miscalibration | 3 | BE-16, 29, 40 | The established/speculative label is wrong for the physics |

---

## 1. Dimensional-signature findings — RETRACTED after code inspection (2026-05-20)

> **Correction.** An earlier version of this section claimed "5 verified dimensional-signature mislabels" (BE-14, 15, 17, 34, 35). On inspecting the actual AST encoding modules in `src/bridges/equations/`, **that claim was wrong and is withdrawn.**

**Why the error happened.** The audit assessed each bridge's `dimensional_signature` against its `formula_latex`. But the catalog uses those two fields for two different things:
- `formula_latex` — the **full, original, human-facing physics formula** (often the un-encodable form).
- `dimensional_signature` — the dimensional analyzer's verdict on the **encoded AST** in `src/bridges/equations/be-NN-*.ts`, which is frequently a deliberate *scalar reduction* of that formula.

The audit's reviewers were given `formula_latex` but never the encoded AST, so they (correctly) flagged that the displayed formula doesn't match the signature — not realizing the signature was never describing the displayed formula. The first version of this section repeated that mistake instead of catching it.

**What the code actually shows** (each module's encoded RHS re-read 2026-05-20):

| Bridge | Encoded relation (the AST that `dimensional_signature` describes) | Signature | Verdict |
|---|---|---|---|
| BE-14 | Ryu-Takayanagi entropy `S = k_B c³ A / (4Gℏ)` | `[entropy]` | **Correct** |
| BE-15 | Kawasaki-Gunton coarsening law `L² = Γ·t` | `[area]` | **Correct** (`[L²/T]·[T]=[L²]`) |
| BE-17 | Squared spin-density invariant `S²_spin = (c⁴/8πG)²·T_λμν T^λμν` | `[L⁻²M²T⁻²]` | **Correct** |
| BE-34 | Dimensionless KZM scaling ratio (the `1/aᵈ` prefactor deliberately dropped) | `[1]` | **Correct for the encoding**; the `[L⁻ᵈ]` gap vs the canonical form is **already a logged `known_issue`** on the entry |
| BE-35 | Crossing-symmetry residual `R_cross = C²·[g(u,v)−g(v,u)]` | `[1]` | **Correct** (C and g both dimensionless) |

**No dimensional-signature fix is required for these five.** The signatures are internally consistent with the encodings and are pinned green by `tests/bridges/dimensional-signature-catalog.test.ts`.

### The real finding underneath: a `formula_latex` ↔ encoded-relation transparency gap

The genuine issue is presentational. A catalog entry displays one formula (`formula_latex`) but the dimensional machinery validates a *different*, reduced relation — and **nothing in the entry flags this**. A reader, an auditor, or an AI seeing `formula_latex` (BE-17's full Einstein-Cartan system) next to `dimensional_signature` (`[L⁻²M²T⁻²]`, the squared-spin-density scalar) will reasonably conclude they are inconsistent. The per-module docstrings explain the reduction thoroughly; the catalog entry does not.

**Recommended fix (documentation, not physics):** add an `encoded_form` field (or a one-line `encoding_note`) to entries whose AST encodes a reduction, stating what relation `dimensional_signature` actually describes. This would have prevented every false finding in this section — and makes the catalog honest about the formula/encoding distinction it already (correctly) maintains internally.

---

## 2. The one surviving signature/formula candidate — BE-33

Of the eleven raw "dimensional-or-formula-error" verdicts, after code inspection (§1) and the deeper check (§4), exactly **one** is a live candidate:

- **BE-33** (Hertz-Millis): the module genuinely encodes the exponent `−ν/z` (pinned `−0.71`, with the evaluator computing `−nu/z`). The deeper check (§4) — both models, high confidence — argues the finite-T correlation length at the quantum-critical coupling should scale as `T^(−1/z)`, ν dropping out. **This is a real candidate error, but do not change it on the audit's authority alone:** Hertz-Millis sits above its upper critical dimension, where hyperscaling fails and finite-T scaling is genuinely subtle. Verify against Millis 1993 (*Phys. Rev. B* 48:7183) and Sachdev Ch. 11 directly.

The other raw verdicts (BE-28, BE-31, BE-32, BE-44, BE-50) did not survive vetting — see §4 and the notes below: BE-28's signature actually matches `dS/dt`; BE-50 was a pure `[1]` notation ambiguity; BE-31/32/44 were Adam-vs-Eve disagreements with no resolved error.

**Take-away:** the audit's *framing/metadata* findings (§3) are sound — they assess catalog fields the reviewers actually saw. The *dimensional* findings were not, because the signature is downstream of an AST the audit never inspected. Net real dimensional/formula findings: **one candidate (BE-33), pending literature check** — plus the structural `formula_latex`/encoding transparency recommendation above.

---

## 3. The systemic issue — framing & metadata (~19 bridges)

This is the real, repeated finding, and it is structural rather than a list of bugs:

- **`unknown <-> unknown` bridge metadata** (BE-27, 39, 41, 42, and implicated in ~9 reviews). The catalog's atomic unit is a "bridge equation," yet these entries leave the two bridged regimes unnamed. Either name them or acknowledge the entry is "an important equation in regime X" rather than a bridge.
- **bridge-incoherence** (BE-18, 22, 36, 37, 42): the equation is real physics but does not connect two regimes. BE-18 describes a relation *internal* to one hypothetical dark sector. BE-42 (Hawking temperature) is canonical physics mis-filed under "Information Paradox Resolutions" — and as Adam noted, the Hawking formula *creates* the information paradox, it does not resolve it.
- **framing-overreach** (BE-24, 25, 26, 30, 38, 43, 46): the equation holds but the catalog's surrounding claim exceeds it. BE-25 (IIT Φ as "consciousness") drew the sharpest split — Adam SOUND, Eve SERIOUS, citing the standard objection that high-Φ systems can be built that are intuitively non-conscious.
- **encoding-reduction** (BE-13, 47, 48): the encoded scalar is a *reduction* that drops physical content — BE-13 encodes only the scalar trace of the Einstein equation (1 of 10 components).

None of these are "the physics is wrong." All are "the catalog claims more, or labels more sloppily, than the equation supports." Tightening them is what would most raise the framework's credibility.

---

## 4. Physics-content disputes — deeper second pass (2026-05-20)

The three contested physics-content findings were sent back to Adam and Eve in a focused, neutrally-worded second pass (the dispute stated without attribution). Results:

### BE-33 — candidate error: the catalog exponent is likely wrong `[two-model convergence; literature check still advised]`

The catalog has `ξ_quantum(T) ~ ξ₀(T/T₀)^(−ν/z)` (the module encodes the pinned `−0.71`). **Both models, independently, at high confidence, with the same derivation, conclude the exponent should be `−1/z`, not `−ν/z`.** The scaling argument: at the quantum-critical coupling there is no T=0 detuning, so the correlation-length exponent ν drops out of the scaling function entirely; temperature alone sets the length scale `L_T ~ T^(−1/z)`. ν governs the *T=0 tuning-parameter* divergence (`ξ ~ |g−g_c|^(−ν)`), a different axis. **Caveat before changing it:** the catalog cites Millis 1993 as the source for `−ν/z`, and Hertz-Millis sits *above its upper critical dimension*, where hyperscaling fails and finite-T scaling is genuinely subtle (Eve flagged "without dangerously irrelevant variables"). The standard textbook QCP result is `T^(−1/z)`, but verify against Millis 1993 / Sachdev Ch. 11 directly before editing — this is a physics-content change, not a typo fix.

### BE-31 — LIKELY RESOLVED in the catalog's favor `[CONTESTED provenance]`

Both models now **agree** the catalog form `(4/√6)ℓ⁻²[1 + N₀ − 9N₁ + 16N₂ − 8N₃]` is the correct canonical Benincasa-Dowker d=4 expression, and that the sign-flipped alternative is wrong. They disagree only on *provenance* (whether it is verbatim the 2010 PRL or a later standardized form). **Honesty flag:** in arguing this, Adam cited a specific supporting paper — "D'Ariano & Dowker, arXiv:2105.08390, Eq. 11" — which appears to be **a fabricated citation** (that author pairing/identifier could not be corroborated). Eve self-rated only "medium" confidence. **Net:** the BE-31 formula is probably fine and low-priority, but for certainty, verify directly against Benincasa & Dowker 2010 (arXiv:1001.2725) — do not rely on the models' recollection of equation numbers.

### BE-34 — STILL UNRESOLVED: high-confidence disagreement `[CONTESTED]`

Both models agree the `exp(−m c²/k_B T_reh)` Boltzmann factor is **not part of the canonical (kinematic) Kibble-Zurek mechanism**. They split, both at high confidence, on whether it is a *defensible extension*:
- **Adam:** it can be legitimate — `n ≈ n_KZM × P(formation)`, where the exponential is the probability of mustering enough thermal energy (`~m c²`) to form a massive defect core when `T_reh` caps the energy budget. Constructs a physical justification.
- **Eve:** it is double-counting — KZM (non-equilibrium freeze-out) and Boltzmann statistics (equilibrium) are different mechanisms that "contribute additively or in sequence, not multiplicatively." States no peer-reviewed source presents `n = n_KZ × exp(−m/T)`.

**Decision for the author:** if the Boltzmann factor is a deliberate UPT modeling choice, document the justification (Adam's energetic-constraint argument) and address Eve's additive-vs-multiplicative objection. If not, remove it — the canonical KZM is the power law alone.

---

## 5. Status recalibration

The `status` field is mis-calibrated in both directions:

- **Under-rated** (canonical physics labeled merely "speculative"): **BE-16** Landauer's principle (experimentally verified), **BE-29** Jarzynski equality (canonical 1997, experimentally verified). Promote toward 'established'.
- **Over-rated** (labeled 'established' but really research-program / hybrid): **BE-14** HQECC mapping, **BE-34** Kibble-Zurek-in-curved-spacetime hybrid, **BE-40** Composite Higgs. Demote toward 'speculative'. Also BE-28, 33, 44, 45, 47 carry verdicts suggesting their labels are slightly strong.

---

## 6. Reviewer disagreements (14 of 42)

The two-model design did its job — it surfaced genuine uncertainty rather than a false consensus. Bridges where Adam and Eve diverged: BE-13, 15, 16, 18, 19, 23, 25, 30, 31, 39, 41, 48, 49, 50. The pattern: Eve is harsher on weak-bridge / ad-hoc-ansatz entries; Adam is harsher on metadata and status problems. Where they diverged, treat the verdict as "uncertain," not settled.

## Honesty notes

- 84/84 reviews completed; 2 needed one retry for output truncation. Models: Gemini 2.5 Pro, OpenAI o3.
- The categorization subagents flagged ~24 reviewer citations (specific equation numbers like "Carroll Eq. X", external values like the BICEP/Keck `r < 0.036` bound) as **not independently verified** — they were not in the prompts. None looked like wholesale fabrications, but **verify any specific equation-number or numerical claim before acting on it.**
- This audit assessed each bridge *in isolation* from its catalog entry. It did not run the repo's evaluators or tests; the code-side behavior is covered by the separate `THEORY-VS-IMPLEMENTATION.md` reconciliation.

## What to do with this

> Reordered 2026-05-20 after the §1 retraction. There is **no verified-safe quick-fix list** — the dimensional-signature "mislabels" were withdrawn (§1). What remains:

1. **Documentation fix (real, low-risk):** add an `encoded_form` / `encoding_note` field to entries whose AST encodes a *reduction* of the displayed `formula_latex`, so the catalog is transparent about what `dimensional_signature` actually describes (§1). This is the genuine structural finding and it prevents future false audits.
2. **Investigate BE-33:** verify the `−ν/z` → `−1/z` exponent question against Millis 1993 / Sachdev Ch. 11 (§2, §4). If confirmed, it is a physics-content change touching `formula_latex` + the `−0.71` AST pin + the module docstring + tests.
3. **Investigate BE-34:** decide whether the Kibble-Zurek Boltzmann factor is a deliberate extension (document it) or should be removed (§4) — Adam and Eve disagree.
4. **Metadata / framing (the audit's sound findings):** name the `unknown <-> unknown` bridge fields (~9 entries); recalibrate status — promote BE-16/BE-29, demote the over-rated 'established' entries (§5).
   **2026-05-23 (v0.7 follow-up) — attempted status recalibrations REVERTED.** A solo pass tried to apply the 5 recalibrations (promote BE-16/BE-29, demote BE-14/BE-34/BE-40) but found that 6 existing tests (`tests/bridges/be-16-landauer-encoding.test.ts`, `be-29-encoding.test.ts`, `be-29-fix.test.ts`, `be-34-encoding.test.ts`, plus `bridges-index.test.ts`) pin the current statuses with **deliberate documented rationale**: "REFORMULATED to 'speculative' under Wave Z-E Landauer's principle (per OpenAI o3 consultation)", "gravity-extension framing is the speculative element", "status pinned 'established' in the index". The audit's recommendations conflict with prior reformulations recorded in the test suite. Resolving requires reading both the audit verdict AND the prior reformulation rationale, then making a per-bridge editorial call — NOT solo-doable in a single-Claude pass. Recommended path: review each of the 5 in turn with the audit doc + the test-file commentary side-by-side; flip status AND update the test rationale, or accept the existing reformulation as authoritative.
5. **Structural:** the recurring `bridge-incoherence` / `framing-overreach` findings say the "bridge" concept is the framework's softest claim. Decide per entry whether it is genuinely a two-regime bridge or simply an important equation — and label accordingly. That single discipline would resolve the largest share of this audit's findings.

> **Honest summary of this audit's accuracy:** its *framing and metadata* findings (§3, §5) are reliable — they assess catalog fields directly. Its *dimensional* findings (the original §1) were **not** — they were judged against `formula_latex` while the signature describes a different encoded AST, and were withdrawn on code inspection. Of 11 raw "formula error" verdicts, one candidate (BE-33) survives, pending a literature check. Treat the audit as a strong map of *framing* weaknesses and a weak map of *formula* errors.
