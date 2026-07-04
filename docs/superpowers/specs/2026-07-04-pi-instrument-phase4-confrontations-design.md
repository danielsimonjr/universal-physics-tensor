# PI-Instrument Program · Phase 4 — Evidence-Spine Confrontations (BE-21, BE-53): Design

**Date:** 2026-07-04 · **Status:** r1 — DRAFT, awaiting Adam/Eve data-confirmation vet.
**Program:** Phase 4 — grow the evidence spine (the real mechanism+data work,
per the Phase 2 not-build redirect). Two new confrontations of established
bridges, both on OPEN data. Mirrors the be-51 shovel-ready pattern.

## The confrontation-vs-reproduction guard (load-bearing)

Each confronts a bridge's own prediction against an INDEPENDENT measurement, not
a recompute of the bridge's formula. Both qualify (see per-bridge below). The
observed values + citations are what the vet must CONFIRM — I must not hardcode a
misremembered number (the be-51 lesson: the vet corrected my draft's error bars).

## BE-21 — KSS viscosity bound vs the quark-gluon plasma (the clean one)

- **Bridge:** `η/s = ℏ/(4π k_B)` (KSS 2005), the universal LOWER BOUND on
  shear-viscosity-to-entropy-density. Predicted bound (in ℏ/k_B units):
  **1/(4π) ≈ 0.0796**.
- **Confrontation (upper-bound / satisfaction kind, like be-36/be-48):** the QGP
  produced at RHIC/LHC is the "most perfect fluid" — its extracted η/s sits just
  ABOVE the KSS bound. The bridge predicts η/s ≥ 1/(4π); the observation is that
  the measured QGP η/s **satisfies and nearly saturates** the bound.
- **Observed (VET TO CONFIRM the value + σ + citation):** heavy-ion Bayesian
  extractions give η/s ≈ **1–2.5 × (1/4π)** near T_c, i.e. η/s ≈ 0.08–0.20 in
  ℏ/k_B units. Candidate primary citations: Kovtun-Son-Starinets 2005 (PRL
  94:111601, the bound); a QGP η/s extraction — Bernhard, Moreland & Bass 2019
  (Nature Phys. 15:1113, Bayesian) or the RHIC "perfect fluid" white papers
  (2005). **The vet must confirm a defensible representative observed η/s + its
  uncertainty band + a real primary citation.**
- **Legitimacy:** the QGP η/s is an INDEPENDENT experimental extraction (from
  flow observables), not a recompute of ℏ/4πk_B. A genuine confrontation.
- **Encoding:** `confrontBE21()` → a value-or-bound outcome: predicted bound
  0.0796, observed η/s band, `satisfied = observed ≥ bound`. Mirror
  `be48-collapse-confrontation.ts` (bound kind) or a `value`/`consistency` kind.

## BE-53 — Yang-Mills β-function vs the running of α_s (needs care)

- **Bridge:** `β(g) = −b₀g³/16π²`, `b₀ = (11/3)C₂(G) − (4/3)T(R)N_f`. For QCD
  SU(3) (C₂(G)=3, T(R)=½): **b₀ = 11 − (2/3)N_f**. Predicts ASYMPTOTIC FREEDOM
  (b₀ > 0 ⇒ α_s decreases with energy) for N_f < 16.5.
- **Confrontation (consistency kind):** the world-average strong coupling RUNS
  DOWN with energy exactly as an asymptotically-free b₀ > 0 requires. One-loop:
  `1/α_s(Q) = 1/α_s(M_Z) + (b₀/2π)·ln(Q/M_Z)`. Given two measured α_s values at
  different scales, the implied b₀ is compared to the predicted b₀.
- **Observed (VET TO CONFIRM — highest fabrication risk):** PDG world average
  **α_s(M_Z) = 0.1179 ± 0.0009**; a second-scale measurement (e.g. α_s at ~1–2
  GeV from τ decays, α_s(m_τ) ≈ 0.31, or a high-scale point). **The vet must (a)
  confirm the exact PDG α_s(M_Z) and a defensible second-scale α_s + citation,
  (b) confirm the correct N_f for the scale range (flavor thresholds), and (c)
  decide whether a clean one-loop b₀-extraction confrontation is honest or
  whether BE-53 should be a simpler SIGN-of-running consistency check
  (asymptotic freedom confirmed) to avoid over-precise fabrication.**
- **Legitimacy:** measured α_s at different scales is an independent set of
  experiments; comparing the implied running to the predicted b₀ is a genuine
  confrontation (not a recompute of the β-function).
- **Fallback if the b₀-extraction is too fabrication-prone:** a `consistency`-kind
  confrontation asserting only the QUALITATIVE prediction (b₀ > 0 ⇒ α_s runs
  down) against the measured fact that α_s(high) < α_s(M_Z) — honest, less
  precise, no invented error bars.

## Architecture (per confrontation, after vet confirms data)

Mirror be-51: `src/bridges/be21-kss-confrontation.ts` / `be53-running-confrontation.ts`
(OBSERVED const + `confrontBEnn()`), register in `confrontations.ts`
(DATA_CONFRONTED_IDS auto-projects 6 → 8), test each, add to the public surface,
regenerate catalog-json + confront/coverage goldens.

## Go/no-go

BE-21 is buildable now (clean bound-satisfaction, open data) pending the vet
confirming a representative η/s + citation. BE-53 proceeds ONLY if the vet
confirms a defensible, non-fabricated observed comparison (the b₀-extraction OR
the sign-of-running fallback); if neither is defensible without invented
precision, BE-53 is deferred (honest) and Phase 4 ships BE-21 alone. No fabricated
number ships.
