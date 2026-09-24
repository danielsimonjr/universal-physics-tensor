# Phase 1 citation spot-check — model check with source access

**Checker:** a model instance (Opus) with web and paper access, instructed to compare each sampled
citation comment with the cited source itself. **It is a model's check, not a human's.** It was
approved by Mothership for the Phase 1 criterion "zero fabricated assumptions: spot-check a random
sample against the cited sources".

**Date:** 2026-09-24. **Population:** the 15 `// source:` comments in `src/bridges/index.ts`. (The
repository has 22 `// source:` strings; the other 7 are cross-references to these 15.) **Sample:** 6
of 15, drawn before any checking with `random.Random(20260924).sample(range(15), 6)`, which gave the
comments at lines 537, 1001, 2272, 2383, 2466 and 2496 of `src/bridges/index.ts` as of `c9d5e6f`. The
draw is kept as it fell, although two of the six had been checked from memory before; a redraw would
bias the sample.

## Verdicts

| Line | Bridge | Source | Access | Verdict |
|---|---|---|---|---|
| 537 | BE-11 | Breuer & Petruccione, *The Theory of Open Quantum Systems* (OUP 2002) | search snippets, pp. 116, 136, 146 | PARTIAL |
| 1001 | BE-21 | Kovtun, Son & Starinets, PRL 94, 111601 (2005) | full text (arXiv hep-th/0405231 v2) | PARTIAL |
| 2272 | BE-52 | Einstein 1915, Preuss. Akad. Wiss. 831; Carroll | Einstein: full scan; Carroll: 1997 lecture notes only | PARTIAL |
| 2383 | BE-55 | von Klitzing, Dorda & Pepper, PRL 45, 494 (1980) | full text | PARTIAL |
| 2466 | BE-58 | Nyquist, Phys. Rev. 32, 110 (1928) | full text | PARTIAL; the SI part NOT SUPPORTED |
| 2496 | BE-59 | Josephson, Phys. Lett. 1, 251 (1962) | not accessed (paywall); secondary: Josephson's 1973 Nobel Lecture | UNVERIFIABLE |

**No sampled comment is fully supported.** In every PARTIAL case the physics is right and the
source is the right source, but the comment credits the source with something it does not say.
None of the defects changes a number, a unit system or a relation type on a record.

## Findings and dispositions

| ID | Finding | Disposition |
|---|---|---|
| C1 (537) | The comment says tracing out the environment is "a coarse-graining, not a limit". That label is the repository's; the book derives the Markovian equation under §3.3.1 "Weak-coupling Limit" and uses "coarse-grained" for the time axis. | pending |
| C2 (1001) | The comment says KSS state the bound "in units ħ = k_B = 1" and that the SI value is this repository's conversion. KSS eq. (1) states η/s = ħ/4πk_B ≈ 6.08 × 10⁻¹³ K s with the units restored, and call the bound a conjecture ("We speculate …"). | pending |
| C3 (2272) | The comment says Δφ is derived "from the Schwarzschild orbit equation". Einstein 1915 derives ε = 3πα/(a(1 − e²)) (eqs. 13–14) by successive approximation of the field equations; Schwarzschild's solution came in 1916. The Carroll lecture notes quote the result (eq. 7.56) and refer to Weinberg for the derivation; the book was not seen. `references[]` gives "Carroll 2004 … §7.4", which matches the lecture notes' numbering, not the book's (the book's chapter 7 is perturbation theory). | pending |
| C4 (2383) | The comment says σ_xy = Ce²/h and R_K = h/e² "do not carry over unchanged to Gaussian units". The source does not say this, and it is wrong as to the formula: σ_xy = ie²/h has the same form in Gaussian units. What is SI-specific is the paper's R_H = α⁻¹μ₀c/2i and the values in ohms. | pending |
| C5 (2466) | The comment says the result "is stated for SI electrical quantities". Nyquist's eq. (1), E²dν = 4RkTdν, states no units. The one-sided spectrum is consistent with the paper (it integrates from 0 to ∞) but not discussed. | pending |
| C6 (2496) | The primary paper could not be read. Josephson's Nobel Lecture states ∂(ΔΦ)/∂t = 2eV/ħ and the frequency 2eV/h. | pending |
| X1 (2231, outside the sample) | BE-51 cites "Einstein 1915 Preuss. Akad. Wiss. 844" for the light deflection. Pages 844–847 are the field-equations paper; the doubled deflection is announced on p. 831 of the perihelion paper, which the checker read. | pending |
| X2 (BE-21 name) | The catalog name says "universal lower bound"; KSS present it as a conjecture. The name is verbatim from the specification. | pending |

## Not accessed

Josephson 1962 (paywall); Carroll, *Spacetime and Geometry* (2004), any page; Breuer & Petruccione
beyond search snippets, and its §4.5; Einstein 1915 p. 833 (where α is defined) and pp. 844–847.
