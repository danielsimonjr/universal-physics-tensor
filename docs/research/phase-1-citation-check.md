# Phase 1 citation spot-check — model check with source access

**Checker:** a model instance (Opus) with web and paper access, instructed to compare each sampled
citation comment with the cited source itself. **It is a model's check, not a human's.** Mothership
approved it for the Phase 1 criterion "zero fabricated assumptions: spot-check a random
sample against the cited sources".

**Date:** 2026-09-24.

**Population:** the 15 `// source:` comments in `src/bridges/index.ts`. The repository has 22
`// source:` strings, and the other 7 refer to these 15.

**Sample:** 6 of 15. The draw used `random.Random(20260924).sample(range(15), 6)` before any check. It
gave the comments at lines 537, 1001, 2272, 2383, 2466 and 2496 of `src/bridges/index.ts` as of
`c9d5e6f`. The draw is kept as it fell. The author had checked two of the six from memory before, but a
redraw would bias the sample.

## Verdicts

| Line | Bridge | Source | Access | Verdict |
|---|---|---|---|---|
| 537 | BE-11 | Breuer & Petruccione, *The Theory of Open Quantum Systems* (OUP 2002) | search snippets, pp. 116, 136, 146 | PARTIAL |
| 1001 | BE-21 | Kovtun, Son & Starinets, PRL 94, 111601 (2005) | full text (arXiv hep-th/0405231 v2) | PARTIAL |
| 2272 | BE-52 | Einstein 1915, Preuss. Akad. Wiss. 831; Carroll | Einstein: full scan; Carroll: 1997 lecture notes only | PARTIAL |
| 2383 | BE-55 | von Klitzing, Dorda & Pepper, PRL 45, 494 (1980) | full text | PARTIAL |
| 2466 | BE-58 | Nyquist, Phys. Rev. 32, 110 (1928) | full text | PARTIAL; the SI part NOT SUPPORTED |
| 2496 | BE-59 | Josephson, Phys. Lett. 1, 251 (1962) | not accessed (paywall); secondary: Josephson's 1973 Nobel Lecture | UNVERIFIABLE |

**No sampled comment is fully supported.** In every PARTIAL case, the physics is right and the
source is the right source. But the comment credits the source with something it does not say.
None of the defects changes a number, a unit system or a relation type on a record.

## Findings and dispositions

| ID | Finding | Disposition |
|---|---|---|
| C1 (537) | The comment says tracing out the environment is "a coarse-graining, not a limit". That label is the repository's; the book derives the Markovian equation under §3.3.1 "Weak-coupling Limit" and uses "coarse-grained" for the time axis. | Fixed. The comment now quotes what the book states (partial trace, p. 116; τ_B ≪ τ_R, p. 136; the "Weak-coupling Limit" framing) and says that the type `coarse-graining` is this repository's classification. |
| C2 (1001) | The comment says KSS state the bound "in units ħ = k_B = 1" and that the SI value is this repository's conversion. KSS eq. (1) states η/s = ħ/4πk_B ≈ 6.08 × 10⁻¹³ K s with the units restored, and call the bound a conjecture ("We speculate …"). | Fixed. The comment now cites KSS eq. (1) with ħ and k_B restored, says the SI value is theirs, and says the bound is conjectured. `unitSystem: 'SI'` stands: the row's saturating value 6.078e-13 K·s is an SI value. |
| C3 (2272) | The comment says Δφ is derived "from the Schwarzschild orbit equation". Einstein 1915 derives ε = 3πα/(a(1 − e²)) (eqs. 13–14) by successive approximation of the field equations; Schwarzschild's solution came in 1916. The Carroll lecture notes ~~quote the result (eq. 7.56)~~ give the apsidal frequency ω_a as eq. (7.56) (RETRACTED by the census: that is not Δφ per orbit) and refer to Weinberg for the derivation; the book was not seen. `references[]` gives "Carroll 2004 … §7.4", which matches the lecture notes' numbering, not the book's (the book's chapter 7 is perturbation theory). | Fixed. The comment now says Einstein 1915 derived ε = 3πα/(a(1 − e²)) by successive approximation, and that the transformation describes the textbook Schwarzschild route. `references[]` now cites Carroll's lecture notes gr-qc/9712019 eq. (7.56), which the checker read, in place of "Carroll 2004 … §7.4". |
| C4 (2383) | The comment says σ_xy = Ce²/h and R_K = h/e² "do not carry over unchanged to Gaussian units". The source does not say this, and it is wrong as to the formula: σ_xy = ie²/h has the same form in Gaussian units. What is SI-specific is the paper's R_H = α⁻¹μ₀c/2i and the values in ohms. | Fixed. The comment now says the paper reports R_H = α⁻¹μ₀c/2i in ohms, that σ_xy = Ce²/h has the same form in Gaussian units, and that what is SI is this row's values. `unitSystem: 'SI'` stands on that ground. |
| C5 (2466) | The comment says the result "is stated for SI electrical quantities". Nyquist's eq. (1), E²dν = 4RkTdν, states no units. The one-sided spectrum is consistent with the paper (it integrates from 0 to ∞) but not discussed. | Fixed. The comment now says ~~Nyquist states no units~~ (RETRACTED by the census: he states frequency in "cycles per second", p. 112), that the SI reading is this repository's choice, and that the paper's positive-frequency integration is consistent with a one-sided spectrum but does not discuss it. |
| C6 (2496) | The primary paper could not be read. Josephson's Nobel Lecture states ∂(ΔΦ)/∂t = 2eV/ħ and the frequency 2eV/h. | Stands as UNVERIFIABLE against the cited paper, which is paywalled. The claim agrees with Josephson's own 1973 Nobel Lecture (eq. 4 and the frequency 2eV/h). The comment is unchanged. |
| X1 (2231, outside the sample) | BE-51 cites "Einstein 1915 Preuss. Akad. Wiss. 844" for the light deflection. Pages 844–847 are the field-equations paper; the doubled deflection is announced on p. 831 of the perihelion paper, which the checker read. | Fixed. `references[]` and the comment now cite p. 831 (the perihelion paper, which announces the doubled deflection); the comment says Einstein 1915 worked by successive approximation. The unverified section number "§8.5" for Carroll is removed. |
| X2 (BE-21 name) | The catalog name says "universal lower bound"; KSS present it as a conjecture. The name is verbatim from the specification. | Stands. `BridgeEquationEntry.name` is verbatim spec heading text by design, so a rename is a change to the specification. The conjecture status is now stated in the overlay comment beside the value (C2). |

## Not accessed by the sample check

Josephson 1962 (paywall); Carroll, *Spacetime and Geometry* (2004), any page; Breuer & Petruccione
beyond search snippets, and its §4.5; Einstein 1915 p. 833 (where α is defined) and pp. 844–847.

## What the sample says about the rest

Five of six sampled comments credit their source with something it does not say. The defect has one
form: the repository's own derivation, convention or classification, written as the source's statement. The
sample is small, but a rate of 5 in 6 means the nine unsampled comments probably carry the same defect.
Checking them is filed in `todo.md` for Mothership's decision.

## Census of all 15 comments

**Ruling (Mothership, 2026-09-24), recorded verbatim:** "Phase 1 'zero fabricated assumptions': NOT
met by the sample - 5 of 6 attributions were overclaimed, and that is what the criterion exists to
catch, even though no physics assumption was fabricated. After the census it may be recorded MET only
if all 15 are checked with 0 remaining overclaims; C6 (Josephson, paywalled) is disclosed by name as
unverifiable, not counted as checked."

**Method.** Model checks with source access, same tier as the sample (Opus). Each pass compared every
statement that a comment attributes to a source with the source. The author applied the fixes. A new
pass then checked the fixed text. The loop stopped when the last check of each comment found no
overclaim. The author checked the last edits against the downloaded sources.

| Pass | Scope | Result |
|---|---|---|
| Sample | 6 of 15 (above) | 5 partial, 1 unverifiable |
| 1 | the 9 unsampled comments | 7 partially supported, 2 supported |
| 2 | all 15, after the pass-1 fixes | 5 overclaims remain, all in the pass-1 rewrites |
| 3 | all 15, after the pass-2 fixes | 4 overclaims remain; 2 of them are in the sample's own fixes (C3, C5) |
| 4 | the 8 items changed after pass 3 | 1 overclaim, in text that pass 3 had proposed |
| Author | the pass-4 fix and 4 further edits (BE-11, BE-37, BE-55 access note, BE-59 locator) | checked against the downloaded source text |

**The same defect recurred in every pass.** Each rewrite paraphrased a source. Each paraphrase
added a word that the source did not use ("first order", "states no units", "writes n as a Chern
number"). The loop converged only when each comment quoted its source verbatim, gave the page or
equation, and labelled everything else as THIS repository's.

### Final verdicts

Lines are those of `src/bridges/index.ts` in the commit that records this census.

| Line | Bridge | Source | Last check of the final text | Access for that check | Verdict |
|---|---|---|---|---|---|
| 537 | BE-11 | Breuer & Petruccione 2002 | sample (snippets); pass 4 (table of contents); author | search snippets of pp. 116, 136, 146; table of contents | no overclaim; **snippets only**, disclosed in the comment |
| 994 | BE-21 | Kovtun, Son & Starinets 2005 | pass 3 | full text | OK |
| 1009 | BE-21 | Kovtun, Son & Starinets 2005, eq. (1) | pass 3 | full text | OK |
| 1572 | BE-35 | Rattazzi et al. 2008; Poland, Rychkov & Vichi 2019 | pass 4 | full text of both | OK |
| 1590 | BE-35 | in-repo registry (`rejected.ts`, beId 35) | pass 3, and `tests/bridges/overlay-registry-quote.test.ts` | full | OK |
| 1713 | BE-37 | Shapiro 1964 | author | full scan | OK |
| 2133 | BE-48 | Bassi & Ghirardi 2003 (Ghirardi, Pearle & Rimini 1990: metadata only, disclosed) | pass 3 | full text of the review | OK |
| 2255 | BE-51 | Einstein 1915 (Carroll: not seen, disclosed) | pass 3; `references[]` pass 4 | full scan | OK |
| 2296 | BE-52 | Einstein 1915; Carroll, gr-qc/9712019 | pass 4 | full text of both | OK |
| 2403 | BE-55 | Thouless et al. 1982 (abstract only, disclosed); 2016 Nobel scientific background | author, after pass 4 | TKNN abstract; Nobel background full text | OK: only the abstract is attributed to TKNN, and it is quoted |
| 2419 | BE-55 | von Klitzing, Dorda & Pepper 1980 | pass 4 | full text | OK |
| 2493 | BE-58 | Nyquist 1928 | pass 3 | full scan | OK |
| 2506 | BE-58 | Nyquist 1928, eq. (1) | pass 4 | full scan | OK |
| 2540 | BE-59 | Josephson 1962 (C6) | none possible | paywalled; not read | **UNVERIFIABLE**, disclosed in the comment by name; the 1973 Nobel Lecture statements are checked |
| 2551 | BE-59 | BIPM SI Brochure, 9th edition | pass 3 | full text (version 4.01) | OK |

The census also changed `references[]` strings, and pass 3 or 4 checked each one. They are in BE-48
(Pearle 1989, Ghirardi, Pearle & Rimini 1990, Bassi & Ghirardi 2003), BE-51 (Einstein 1915, Carroll
2004) and BE-52 (Carroll's notes). BE-48's first `known_issues` sentence was changed with them. No number, unit system or relation
type depended on any changed text.

### Outcome against the ruling

- **0 overclaims remain** in the last check of each comment.
- **13 comments are checked**: 12 on full text, and BE-55 (TKNN) within its disclosed access.
- **BE-11 is checked on search snippets only.** Every statement it attributes matches a verbatim
  snippet that the sample check read. Passes 3 and 4 could not reach the snippets again (the search
  returned a CAPTCHA), so that reading cannot be repeated now. Whether snippet access counts as
  "checked" is Mothership's ruling.
- **C6 (Josephson 1962)** is disclosed by name as unverifiable and is not counted as checked.
- **One OK verdict is weaker evidence than it looks.** Pass 2 passed three comments that pass 3
  rejected (BE-52, BE-55 TKNN, BE-58). Most final texts carry one OK verdict from one pass.

### Findings outside the citation text

- **F1.** BE-35's encoded residual `C²·[g(u,v) − g(v,u)]` omits the `v^d` / `u^d` prefactors of
  Rattazzi et al. eq. (4.3), and crossing holds for the sum over operators, not for one block. Filed in
  `todo.md`.
- **F2.** BE-48's `name` (verbatim spec heading) and `context` still credit the linear law to CSL.
  Filed in `todo.md`.

## Mechanical quote check

**Ruling (Mothership, 2026-09-24), recorded verbatim:** "BE-11 (snippet access): COUNTS AS CHECKED for
its attributed statements - each matched verbatim source text at a named page (116, 136, 146). Record
it as 'checked on search-snippet access, not full text' by name." And: "one final pass of a DIFFERENT
KIND ... for every quoted span, an exact string match against the downloaded source text (normalise
whitespace and hyphenation only), and every page / equation number confirmed. No re-judging of
wording. Where the source is snippet-only (BE-11) or unread (C6), mark it as such rather than
matching." And: "If every quote matches: record Phase 1 'zero fabricated assumptions' as MET, with
BE-11 (snippet access) and C6 (unverifiable, paywalled) disclosed by name."

**Method.** `bun run atlas:quote-check -- --sources <dir> --write` (`tools/citation-quote-check/`).
`docs/research/phase-1-citation-claims.json` lists every quoted span and locator of the 15 comments
as a claim, with the source URL and the SHA-256 of each downloaded file. The output is
`docs/research/phase-1-citation-quote-check.out.md`. The check runs these tests:

- **Span:** an exact string match. The match ignores whitespace and joins or keeps a line-end
  hyphen. It also maps Unicode compatibility forms and typographic quotes to their plain characters,
  which changes the encoding and not the wording.
- **Label:** an equation number `(N)` must be the last token of its line. The label must not follow
  "Eq.", "Gl." or "equation". The label must be within a few lines of an anchor from that equation.
- **Page:** a claimed printed page must show its number in the running head of that page.
- **Section:** a span must lie between the body heading of its section and the next heading.
- **Negative control:** each span, each label anchor and each order span is tried again with its
  longest word reversed. That mutation must not match.
- **Tools:** xpdf `pdftotext` (default and raw modes) and `tesseract` OCR of the listed page images
  extract the text.
- **CI:** the CI test checks the matcher and the grading logic. It checks that every token of the
  comments has a claim. It also checks that the output was produced from the current manifest and
  the current checker code.

**Result:** PASS. 43 checks MATCH, and all 44 controls held. **Every quoted span in the 15 comments
matches its source**, except the BE-11 spans, which are declared snippet-only.

| Grade | Count | Claims |
|---|---|---|
| MATCH | 43 | every other quote, page, equation and section locator |
| SNIPPET-ONLY | 6 | BE-11: the p. 146 quote, the pages 116, 136 and 146, and the source. The book title (Crossref), its section 3.3.1 heading, and "p. 136 lies in section 3.3.1" (table of contents: 130 to 137) are MATCH. |
| REFERENCED | 2 | BE-37 eq. (1). No extraction reads Shapiro's printed label (OCR reads "a)"). The paper's own text on p. 789 says "The right-hand side of Eq. (1)". |
| BOT-WALL | 1 | BE-55 von Klitzing eq. 4. APS serves the open-access PDF behind a bot check, and automation stops there. |
| UNREAD | 1 | BE-59 Josephson 1962 (C6), paywalled. The comment says so. |

**For the owner to check in a browser:**

1. von Klitzing, Dorda & Pepper 1980, Phys. Rev. Lett. 45:494: is eq. (4) R_H = α⁻¹μ₀c/2i?
2. Shapiro 1964, Phys. Rev. Lett. 13:789, p. 789: is the displayed delay equation labelled (1)?

**Limits of the method.**

- The author chose the label anchors and the section headings after reading the sources.
  They show that a label sits beside that text, and that a quote lies in that section. They do not
  show that a paraphrase is right, because judging wording was out of scope for this pass.
- A printed page number is the PDF page plus a declared offset. The legible running head confirms it
  on every claimed page.
- p. 847 has no legible running head (OCR reads 84'). The end of the range pp. 844-847 therefore
  rests on the Wikisource record.
- A model code review of the tool found 6 defects before the recorded run, and all 6 are fixed. The
  most serious let a REFERENCED grade ignore the claimed page.

### Outcome

**Phase 1 "zero fabricated assumptions": MET**, by Mothership's ruling, because every quote matches.
The following are disclosed by name:

- **BE-11:** checked on search-snippet access, not full text.
- **C6 (Josephson 1962):** unverifiable, because the paper is paywalled.
- **Two equation numbers that are not confirmed by machine:**
  - von Klitzing eq. 4: publisher bot wall.
  - Shapiro's printed label (1): not machine-readable.

  Both are on the owner's list above.
