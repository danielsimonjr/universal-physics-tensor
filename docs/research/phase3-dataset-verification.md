# Phase 3 Task-0 — Dataset & Formulation Verification

**Date:** 2026-07-02 · **Feeds:** the Phase-3 implementation plan (confrontation
datasets must be primary-source-verified before any test pins a number).
**Method:** each candidate confrontation checked on two axes — (1) does the
bridge's OWN encoding support the confrontation (gate #2, the BE-28 lesson),
and (2) is the dataset value verifiable against its primary source (gate #1).
Sourcing via web search/fetch; paywalled specifics are marked as residuals to
transcribe from the paper at TDD time, never fabricated.

## Verdict summary

| id | confrontation | bridge encoding (grep-verified) | dataset status | verdict |
|---|---|---|---|---|
| be-16 | Landauer erasure heat → k_BT ln2 | `E_min = k_B T ln2` (evaluator) ✓ | Bérut 2012 verified qualitatively; exact Fig.4 asymptote paywalled | **IN** (consistency) — 1 residual |
| be-37 | Shapiro delay / PPN γ | γ=1 Shapiro delay form ✓ | Cassini γ=1+(2.1±2.3)e-5 **fully verified** | **IN** (value) — NEW, strong |
| be-48 | GRW rate vs collapse-model bound | `λ_GRW=λ_0·(m/m_0)`, λ_0=1e-16/s ✓ | LISA-Pathfinder CSL bound verified; **citation corrected** | **IN** (upper-bound) — model caveat |
| be-23 | Planckian α per material | `τ=ħ/(α k_B T)` ✓ | α≈1 verified; per-material rows paywalled | **IN** (table) — per-row residuals |
| be-38 | deep-MOND limit vs SPARC RAR | Milgrom force law, `a_0` INPUT ✓ | a_0=1.20e-10 verified | **CONTINGENT** — see note |
| be-12 | (BEC onset) | `λ_T=h/√(2πmkT)`, **no density n** | — | **DROP** — unconfrontable |
| be-42 | (Hawking temperature) | `T_H=ℏc³/8πGMk_B` ✓ but ~6e-8 K | no measured Hawking temp exists | **DROP** — unconfrontable |
| be-27 | (effective temperature) | `T_eff=T(1+Σ_active/k_BT)`, free Σ_active | — | **DROP** — parameter absorbs residual |

**Confrontation count: 3 → 6 firm (be-16, be-37, be-48, + be-23 extended to a
table), or 3 → 7 if be-38 clears its contingency.** The "broaden the target
list" directive yielded one strong new confrontation (be-37/Cassini, an
established bridge not previously data-confronted) and confirmed that the
other Tier-1 candidates (be-42, be-27) are unconfrontable — itself a
result: it shows *why* the empirical spine is thin (most speculative bridges
predict unobservable or free-parameter-absorbed quantities).

## Verified datasets (primary sources)

- **be-37 Cassini Shapiro (fully verified, strongest addition).** Bertotti,
  Iess & Tortora, *Nature* 425:374–376 (2003). PPN γ = 1 + (2.1 ± 2.3)×10⁻⁵
  from the June-2002 solar-conjunction radio-link Shapiro delay. be-37 encodes
  the γ=1 GR Shapiro form, so the confrontation observable is the PPN γ: the
  bridge predicts γ=1 exactly; residual = (1 − 1.000021)/0.000023 ≈ −0.91σ →
  **within 1σ**. be-37 is NOT in `DATA_CONFRONTED_IDS` today (it has a
  numerical validation anchor, not a data confrontation), so this is genuinely
  new. Value-kind.

- **be-48 LISA-Pathfinder collapse bound (verified; CITATION CORRECTED).**
  Carlesso, Bassi, Falferi & Vinante, arXiv **1606.03637**, *Phys. Rev. D*
  **95**:084054 (2017) — **the design-r1 citation "PRD 94:124036" was WRONG.**
  Bound: λ_CSL ≤ (2.96 ± 0.12)×10⁻⁸ s⁻¹ at correlation length r_C = 100 nm,
  frequency band 0.7–20 mHz; underlying data Armano et al., *PRL* 116:231101
  (2016). **Model caveat (must be in the confrontation docstring):** the bound
  is on the *CSL* rate; be-48 encodes the *GRW* single-nucleon rate
  λ_0 = 10⁻¹⁶ s⁻¹. GRW's rate sits ~8 orders below the exclusion → NOT
  excluded (upper-bound satisfied), but this is a weak/consistency check: the
  same LISA-Pathfinder bound overlaps Adler's proposed floor 10⁻⁸±² s⁻¹, i.e.
  GRW's original rate predicts no observable collapse — the experiment can only
  *fail to exclude* it, not confirm it. Upper-bound-kind, honestly caveated.

- **be-38 SPARC a₀ (value verified; confrontation contingent).** McGaugh,
  Lelli & Schombert, *PRL* 117:201101 (2016), arXiv 1609.05917. Radial
  acceleration relation characteristic scale g† = a₀ = 1.20×10⁻¹⁰ m s⁻²
  (combined 1σ ≈ 0.24–0.26×10⁻¹⁰ over 2693 points / 153 galaxies).
  **Contingency (Task-0 gate #1 special case):** be-38 encodes the Milgrom
  force law with `a_0` an INPUT; the honest confrontation is the bridge's
  deep-MOND limit `F → √(F_N·m·a_0)` reproducing the RAR `g_obs=√(g_bar·a_0)`.
  Whether this is a genuine confrontation or reduces to feeding the
  SPARC-fit a₀ back in (reproduction, not confrontation) must be decided at
  the be-38 TDD cycle against the paper's binned (g_bar, g_obs) table. If it
  reduces to a₀-reproduction, **be-38 drops** (→ 3→6).

## Residuals (verified qualitatively; specific number needs the paper at TDD)

- **be-16 Bérut asymptote.** Bérut et al., *Nature* 483:187–189 (2012),
  "Experimental verification of Landauer's principle." Triple-source-verified
  that the mean dissipated heat *saturates at the Landauer bound k_BT ln2 in
  the long-cycle limit*. The specific closest-approach value (Fig. 4) and its
  error bar are behind the Nature/HAL paywall (three fetch attempts blocked).
  Consistency-kind confrontation: assert the measured asymptote approaches
  k_BT ln2 from above at T≈300 K; the exact `approaches`/`fractionalGap`
  numbers are transcribed from Fig. 4 at the be-16 TDD cycle (or supplied by
  the owner). **Do not fabricate.**
- **be-23 per-material α rows.** Bruin et al., *Science* 339:804 (2013);
  Legros et al., *Nat. Phys.* 15:142 (2019). Verified: α ≈ 1 (order unity)
  across cuprates/heavy-fermions/2D systems. The per-material α values +
  uncertainties for the table rows are transcribed from the papers' figures
  at the be-23 TDD cycle.

## Dropped (unconfrontable — verified by reading the encoding)

- **be-12** encodes `λ_T = h/√(2πmkT)` (a length of m,T). No density `n`, so
  the BEC-onset criterion `nλ³≈2.612` tests an equation the bridge doesn't
  hold; and a bare `λ_T` value is not a directly-measured observable
  (computing it = reproduction, excluded by G-3). Deferred to a future
  many-body-coherence BE entry (the module's own `known_issue`).
- **be-42** encodes `T_H = ℏc³/(8πGMk_B)` — real, but ≈6.17×10⁻⁸ K for a
  solar-mass BH. No astrophysical Hawking temperature has ever been measured
  (analogue-gravity systems measure an analogue T, a category mismatch with
  the astrophysical formula). Reproduction of the textbook value ≠
  confrontation. DROP.
- **be-27** encodes `T_eff = T(1 + Σ_active/(k_BT))` with `Σ_active` a
  system-specific free parameter that absorbs any residual — a confrontation
  can always be fit, so it carries no falsification power. DROP (defer until a
  parameter-free active-matter prediction exists).

## Plan implications

1. The observation registry ships records for **be-16, be-37, be-48, be-23**
   (be-38 gated at its TDD cycle). be-37's numbers are fully pinnable now.
2. **Fix the be-48 citation** to PRD 95:084054 / arXiv 1606.03637 in the
   confrontation module and any doc that repeats the r1 "94:124036".
3. Each confrontation task re-pins the `priority`/`coverage` goldens (the
   scorecard's DATA column grows) — NOT the funnel calibration benchmark,
   which is orthogonal and stays byte-identical.
4. Residual numbers (be-16 Fig.4, be-23 rows) are transcribed from the papers
   at their TDD cycles or supplied by the owner — flagged in each task brief.
