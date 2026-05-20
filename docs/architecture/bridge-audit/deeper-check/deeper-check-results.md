# Bridge Audit — Deeper Check on 3 Contested Physics-Content Disputes

**Date:** 2026-05-20. Focused second pass on BE-31, BE-33, BE-34 — the disputes the first audit pass could not resolve. Each sent to Adam (Gemini 2.5 Pro) and Eve (OpenAI o3) with the dispute stated neutrally (no "Adam said / Eve said" attribution).

---

## BE-31 — Benincasa-Dowker discrete Ricci scalar coefficients

**Catalog form:** `R(p) = (4/√6) ℓ_P⁻² [1 + N₀ − 9N₁ + 16N₂ − 8N₃]`

- **Adam (high confidence):** the catalog form is the modern canonical d=4 Benincasa-Dowker expression. Argued the *original* 2010 PRL used a different "good choice" of coefficients (up to N₂ only, constant −4), and the catalog form is the later-standardized version. Reviewer B's sign-flipped form is wrong. **⚠ Adam cited "D'Ariano & Dowker, arXiv:2105.08390, Eq. 11" as support — this appears to be a fabricated citation; do not trust it.**
- **Eve (medium confidence):** the catalog form IS the published 2010 PRL form (claimed "Eq. 9"). Reviewer B's sign-flipped form is wrong.

**Resolution:** both models agree the catalog formula is correct and the sign-flipped alternative is wrong. Provenance detail contested. Adam fabricated a supporting reference. **To fully close: verify against arXiv:1001.2725 directly.** Low priority — formula likely fine.

---

## BE-33 — Hertz-Millis finite-temperature correlation-length exponent

**Catalog form:** `ξ_quantum(T) ~ ξ₀ (T/T₀)^(−ν/z)`

- **Adam (high confidence):** exponent should be `−1/z`, NOT `−ν/z`. Full scaling-hypothesis derivation: `ξ(δ,T) = |δ|^(−ν) Φ(T/|δ|^(νz))`; requiring δ-independence at the critical point (δ→0) forces the scaling function's large-argument power to be `−1/z`, and ν cancels entirely.
- **Eve (high confidence):** same conclusion, `ξ(T)|_{g=g_c} ∝ T^(−1/z)`. Same RG-scaling derivation (`b = T^(−1/z)`). ν governs the T=0 detuning axis only.

**Resolution: CONFIRMED ERROR.** Both models, independently, high confidence, identical derivation. The catalog's `−ν/z` exponent is wrong; it should be `−1/z`. With z=1, that is simply `ξ ~ T⁻¹`. Actionable fix.

---

## BE-34 — Kibble-Zurek Boltzmann factor

**Catalog form:** `n_defect = (1/aᵈ)(τ_Q/τ₀)^(−dν/(1+zν)) · exp(−m c²/(k_B T_reh))`

- **Adam (high confidence):** the Boltzmann factor CAN be legitimate. `n ≈ n_KZM × P(formation)`, where `P ~ exp(−mc²/kT_reh)` is the probability of mustering enough thermal energy to create a massive defect core when reheating caps the energy budget (relevant for GUT-scale defects with `mc² ≳ kT_reh`). Catalog authors "not necessarily making a conceptual error."
- **Eve (high confidence):** it is double-counting. KZM (non-equilibrium freeze-out) and Boltzmann statistics (equilibrium thermal population) are distinct mechanisms — they combine additively or sequentially, NOT multiplicatively. No peer-reviewed source presents `n = n_KZ × exp(−m/T)`. Non-canonical; remove it or justify it separately.

**Resolution: UNRESOLVED.** Genuine high-confidence disagreement. Both agree the factor is not canonical KZM. Author decision: document the justification (Adam's argument) and rebut Eve's additive-vs-multiplicative objection, or remove the factor.

---

## Method note

The deeper check is still two AI reasoning models recalling physics — not the primary literature. Where they converge with a self-contained, checkable derivation (BE-33), confidence is high. Where one fabricated a citation (BE-31 / Adam), that is a reminder to verify specific equation-number and arXiv-ID claims against the actual papers. BE-31's definitive close is one WebFetch of arXiv:1001.2725 away.
