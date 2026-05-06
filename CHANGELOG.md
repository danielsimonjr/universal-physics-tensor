# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
**SemVer is not yet authoritative**: UPT is in pre-formalization, with no
published artifact and no external consumers. The first tagged release
(`v0.1.0`) will land when Tier-5 AST encodings cover the catalog or when
the project is first published — whichever comes first. Until then,
breaking changes may land on master without a version bump; track
work-in-progress via this file's `[Unreleased]` section and the master log.

## [Unreleased]

### Added
- **Wave P-A R-A4 — BE-50 reformulated to canonical Wheeler-Feynman half-retarded-plus-half-advanced form.**
  - Replaced the broken `S = ∫d⁴x [L_forward(φ_+) + L_backward(φ_-) +
    λφ_+ φ_- δ⁴(x − x_m)]` action (variationally ill-posed at the δ⁴
    single-point interaction) with the canonical Wheeler-Feynman 1945
    absorber-theory gauge-field form:
    `A_μ(x) = (1/2)[A_μ^ret(x) + A_μ^adv(x)]`
    The action is then standard Maxwell + matter + interaction with
    this gauge-field expression.
  - WebFetch on Wikipedia Wheeler-Feynman_absorber_theory confirmed the
    canonical form: "the resulting field is E_tot(x,t) = Σ_n [E_n^ret +
    E_n^adv]/2" (gauge-field analogue is the A_μ form above). The
    "absorber" boundary condition (every emitted radiation absorbed
    somewhere) makes this physically equivalent to standard retarded-
    only Maxwell, per Wheeler & Feynman's original argument.
  - References: Wheeler-Feynman 1945 RMP 17:157; Wheeler-Feynman 1949
    RMP 21:425; Cramer 1986 RMP 58:647 transactional interpretation;
    Hoyle-Narlikar 1995 RMP 67:113 cosmological-absorber.
  - Status: invalid → highly-speculative (canonical W-F form is
    rigorously defined; the absorber boundary condition is empirically
    untested in QFT). tractability_class: formally-divergent →
    numerical-tractable.
  - Replaced `tests/bridges/be-50-r3-disposition.test.ts` (5
    assertions) with `tests/bridges/be-50-reformulation.test.ts` (8
    assertions). Tests 439 → 442 (+3 net from this commit).

- **Wave P-A R-A3 — BE-43 reformulated to canonical ER=EPR wormhole-entropy bound.**
  - Replaced the broken `dℓ_wormhole/dt = -γ S_entanglement + δ ∫ T_μν
    u^μ u^ν dV` form (sign-backwards + dimensional malformedness) with
    the canonical ER=EPR wormhole-entropy-bound form:
    `S_entanglement ~ A_wormhole / (4 ℓ_P²)` — the Bekenstein-Hawking
    bound applied to the minimal cross-section of an Einstein-Rosen
    bridge. References: Maldacena-Susskind 2013 arXiv:1306.0533 (ER=EPR
    canonical statement); Bekenstein 1973 PRD 7:2333; Hawking 1975 CMP
    43:199; Susskind-Stanford 2014 arXiv:1408.2823 (complexity-volume
    duality companion).
  - WebFetch on arXiv:1306.0533 returned the abstract confirming ER=EPR
    equivalence statement: "two distant black holes...connected through
    the interior via a wormhole...interpreted as maximally entangled
    states of two black holes that form a complex EPR pair."
  - Status: invalid → speculative (canonical bound, ER=EPR framing
    remains conjectural outside thermofield-double AdS/CFT regime).
    tractability_class: undefined → numerical-tractable.
  - Honest-claude flag: WebFetch returned abstract only; the
    `S ~ A/(4ℓ_P²)` form is canonical Bekenstein-Hawking applied to the
    ER bridge cross-section, but the precise ER=EPR-paper equation was
    not WebFetch-confirmed.
  - Replaced `tests/bridges/be-43-r3-disposition.test.ts` (6 assertions)
    with `tests/bridges/be-43-reformulation.test.ts` (7 assertions).

- **Wave P-A R-A2 — BE-33 reformulated to canonical Hertz-Millis scaling (3D Heisenberg pin).**
  - Replaced the broken `ξ_quantum(T) = ξ_classical / √(1 + (E_0/k_B T)²)`
    ansatz (wrong T → 0 limit; absent dynamic exponent z) with the
    canonical Hertz-Millis scaling form `ξ ~ T^{-ν/z}`, pinned to **3D
    Heisenberg universality class (z=1, ν≈0.71)** as the canonical
    reference case. References: Hertz 1976 PRB 14:1165, Millis 1993 PRB
    48:7183, Sondhi-Girvin-Carini-Shahar 1997 RMP 69:315, Sachdev 2011
    *Quantum Phase Transitions* 2nd ed. Ch. 11. Alternative classes
    (Ising / XY / fermionic HMM) deferred to future expansions.
  - Status: invalid → speculative. tractability_class: undefined →
    numerical-tractable.
  - Honest-claude flag: WebFetch on Sachdev review and Wikipedia did not
    return the canonical T^{-ν/z} form directly; commitment to ξ ~
    T^{-ν/z} (rather than the simpler ξ ~ T^{-1/z}) follows the textbook
    convention but the precise form is not WebFetch-confirmed.
  - Replaced `tests/bridges/be-33-r3-disposition.test.ts` with
    `tests/bridges/be-33-reformulation.test.ts` (8 assertions).

- **Wave P-A R-A1 — BE-30 reformulated to canonical FLM first-law / linear-response form (Math iter-5 strategic pivot).**
  - Replaced the structurally ill-formed
    `g_{μν}(x) = η_{μν} + κ Σ_{ij} ⟨x|Tr_j(ρ_{ij} log ρ_{ij})|x⟩` form
    (LHS-RHS rank/type mismatch, non-normalizable |x⟩, dimensionally
    wrong κ) with the canonical first-law-of-entanglement / FLM
    linear-response form: `δS_EE(R) = ⟨δH_R⟩`, where H_R is the modular
    Hamiltonian of the reduced density matrix on region R. Reference
    verified via WebFetch on Blanco-Casini-Hung-Myers 2013
    (arXiv:1305.3182): "ΔS = ΔH for the first order variation of the
    entanglement entropy ΔS and the expectation value of the modular
    Hamiltonian ΔH". FLM 2013 (arXiv:1307.2892) uses this as the
    linear-response input to bulk one-loop corrections in AdS/CFT.
  - Status: invalid → speculative (canonical formula, speculative
    QG-emergence framing — using the linear-response identity as basis
    for ER=EPR-style entanglement-geometry equivalence outside the
    strict AdS/CFT regime).
  - tractability_class: undefined → numerical-tractable.
  - Replaced `tests/bridges/be-30-r3-disposition.test.ts` with
    `tests/bridges/be-30-reformulation.test.ts` (BE-22/BE-38 pattern,
    8 assertions). Test count 437 → 438.
  - Bridge-Remediation-Plan.md: BE-30 R3 → R5-leaning.

### Changed
- **Wave P-A Tier 0-4 — Part-I §1.3 invariant 4 empty-pairs hedge (Phys iter-5 C3).**
  - Added a hedge note to §1.3 invariant 4 (Correspondence Principle):
    the `lim_{ℏ→0}` predicate cannot be exercised because BEs 1-10 (the
    implicit diagonal laws — Schrödinger, Newton, Maxwell, Einstein, SM)
    are not currently encoded as explicit quantum/classical pairs in
    `BRIDGE_EQUATIONS`, and BEs 11-50 do not present pair structure.
    The iteration is over the empty set; the invariant is vacuously
    satisfied. Hedge clarifies invariant 4 as a forward-looking
    specification, becoming operational only once Tier-5 work adds
    explicit pair rows (e.g., a `classical_partner_id?: number` field).

### Fixed
- **Wave P-A Tier 0-3 — BE-25 quantitative-failure check restructured as alternatives (Phys iter-5 C2).**
  - Part-II §G "Quantitative failure check" for BE-25 (Penrose-Hameroff
    Orch-OR) was previously stating both Tegmark (decoherence) and
    Penrose-form (formula-malformedness) falsifications as
    simultaneously-applicable. They are alternatives under different
    coherence assumptions: (a) under Penrose's canonical E_G ~
    G(Δm)²/Δx, Tegmark's decoherence ~10⁻¹³ s rules out the mechanism;
    (b) under the framework's E_G = Δm c² Δx / ℓ_P, the formula itself
    yields sub-Planckian t_OR (~10⁻⁵⁵ s), foreclosing the coherence
    assumption Tegmark presupposes. Restructured to "either (a) or (b),
    not both — the bridge fails under either canonical interpretation."
    BE-25 notes in src/bridges/index.ts updated to reference the
    restructure. R3-invalid disposition unchanged. All 437 tests pass.
- **Wave P-A Tier 0-2 — BE-19 AST docstring 32π² prefactor sync (Math iter-5 CRIT-2).**
  - `src/bridges/equations/be-19-quantum-bounce.ts` docstring prefactor
    updated from `√3/(16π²γ³)` to `√3/(32π²γ³)` to match Part-I §6 and
    `formula_latex` in `src/bridges/index.ts` BE-19. Wave N Tier B
    reconciled the spec to 32π² (yielding canonical 0.41 ρ_Planck) but
    missed this AST docstring; it still claimed "16π² → 0.41 ρ_Planck"
    which is internally inconsistent (16π² yields ~0.82 ρ_Planck).
    All 437 tests still pass; no behavioral change.

### Changed
- **Wave P-A Tier 0-1 — Part-V Conclusion R3-list pointer-only (Math iter-5 CRIT-1).**
  - Replaced stale hard-coded list of 7 R3-invalid bridges (cited as of Wave J/L)
    in Part-V Conclusion line 1205 with a pointer to `src/bridges/index.ts` as
    the single source of truth. Wave N Tier C escalations (BE-12, 13, 15, 17,
    24, 33, 36) had propagated to Part-VI but missed Part-V; the actual
    catalog had 14 R3-invalid bridges at the time of the iter-5 review,
    not 7. Pointer-only approach eliminates the drift class entirely
    (matches Wave N-completion D5 pattern).
- **Wave N-completion Tier E — minor polish from iter-4 (LaTeX, glossary, citations).**
  - **E2 [Phys MINOR]:** BE-27 FDT prefactor verification note added —
    classical FDT canonical forms (Kubo 1966, Callen-Welton 1951) cited;
    the displayed `1/(k_B T_eff)` prefactor outside an integral over
    cross-correlator `⟨δF δx⟩` is non-standard (canonical forms use
    auto-correlators); flagged as schematic.
  - **E3 [Phys MINOR]:** BE-39 asymptotic-safety A sign convention note
    added — `+A g²` follows the convention where `A > 0` is required for
    the non-Gaussian UV fixed point; sign conventions vary across the
    literature (Reuter-Weyer 2009, Codello-Percacci-Rahmede 2009 differ in
    factors-of-2π absorption).
  - **E4 [Phys MINOR]:** Part-IV §11.1.1 undefined `f` and `𝓞` symbols
    — added a Symbol-definition note clarifying that `f[Π(x)] → g_{μν}(x)`
    is schematic and that `𝓞` in `Tr[Π†𝓞Π]` is a not-here-specified
    symmetry generator (per the catalog-framing scope note).
  - **E5 [Researcher MINOR]:** Glossary `n` row added BE-20 entry (integer
    mode index in vacuum-fluctuation mode-sum, paired with `ζ(k/k_UV)`).
  - **E6 [Researcher MINOR]:** Verified BE-39 Reuter 1998 already cites
    arXiv:hep-th/9605030 in `references[]`; spec-body Status note now
    includes the arXiv ID inline for parity.
  - **E7 [Researcher MINOR]:** Framework-stats string ("~498K chars") was
    triplicated across Part-V conclusion, Part-VI §28 paragraph, and
    Part-VI §29 stats block. Designated Part-VI §29 as single source of
    truth; Part-V conclusion + Part-VI §28 paragraph now point to it.
  - **E8 [Phys/Researcher consistency]:** Part-IV §11.1.2 displayed
    holographic bound `I ≤ A/(4ℓ_P²)` updated to `I ≤ A_H/(4ℓ_P²)` to
    match the §11.1.2 scope note (which says it should be Hubble-horizon
    area `A_H` per Conjecture 8.1, Part-III §VIII).
  - **E1:** No specific LaTeX cosmetic instance was flagged with a precise
    location in iter-4; deferred until a concrete example surfaces.
- **Wave N-completion Tier D — 8 mechanical IMPORTANT fixes (iter-4 batch).**
  - **D1 [Phys IMPORTANT]:** Part-V §19.3.1 split bare `[S]` (Entropy/Action
    overload) into `[S_E]` (J/K) and `[S_A]` (J·s) — different SI dimensions
    were conflated, making the dimensional-consistency checker (§19.3.2)
    ill-defined.
  - **D2 [Math IMP-2]:** Part-I glossary η row corrected — η_{μν} appears
    in BE-30 (ER=EPR generalized), not BE-21 as previously stated.
  - **D3 [Math IMP-3]:** Part-I §1.3 invariant 1 explicitly clarified as a
    *typo-detector* on the AST round-trip — does NOT validate physical
    correctness; downstream physics-level checks (`references[]`,
    `known_issues[]`, `bridges/*-fix.test.ts`) are what catch sign / canonical
    / attribution errors.
  - **D4 [Researcher IMPORTANT]:** Part-III preamble Algorithm 3 / 3A / 3B
    reconciliation note refreshed — reconciliation completed in Wave J Tier
    E4 / Wave L; struck stale "pending reconciliation" framing.
  - **D5 [Researcher IMPORTANT]:** Part-VI §29 hard-coded 27-entry BE-list
    (line 722) and "27 BEs" framework-stat (line 737) replaced with single
    pointer to `src/bridges/index.ts`. Wave L Tier H3 had eliminated the
    same duplication from Part-V; this closes the regression vector.
  - **D6 [Researcher IMPORTANT]:** Part-I glossary T-stress-energy row now
    includes BE-13 (was BE-29, BE-30, BE-43; now BE-13, BE-29, BE-30, BE-43).
  - **D7 [Researcher IMPORTANT]:** Part-VI §29 algorithm-count claim "11
    formally numbered (Algorithms 1-11)" corrected to **12 numbered sections**
    (1, 2, 3A, 3B, 4, 5, 6, 7, 8, 9, 10, 11) — the 3A/3B split makes it 12
    not 11.
  - **D8 [Researcher IMPORTANT]:** Part-V conclusion algorithm-count
    statement reconciled with Part-VI §29 (12 distinct numbered sections).
- **Wave N-completion Tier C7 — BE-36 R3 invalidation (Phys iter-4 IMPORTANT).**
  BE-36 (MOND — Dark Matter Interpolation, hybrid linear blend) promoted
  from 'speculative' to 'invalid' per R3 disposition. The hybrid linear
  blend `F = F_N μ(a/a_0) + F_DM (1 − μ(a/a_0))` is bespoke to this
  framework and not in any cited MOND literature. Standard MOND
  (Milgrom 1983 *Astrophys. J.* 270:365) uses `μ(a/a_0)·a = a_Newtonian`
  as an implicit single-acceleration relation, not a linear blend. Same
  defect class as the original BE-38 ansatz, which was reformulated to
  canonical Milgrom `μ(x) = x/√(1+x²)` in Wave I.B C4. Since BE-38 now
  covers canonical MOND, BE-36 has no remaining role and any salvage
  would duplicate BE-38. Status pin:
  `tests/bridges/be-36-r3-disposition.test.ts`.
- **Wave N-completion Tier C6 — BE-33 R3 invalidation (Phys iter-4 IMPORTANT).**
  BE-33 (Quantum-Classical Critical Point Mapping) promoted from
  'speculative' to 'invalid' per R3 disposition. Two coupled defects:
  (1) the ansatz `ξ_quantum(T) = ξ_classical / √(1 + (E_0/k_B T)²)` gives
  the wrong T → 0 limit (ξ → 0 instead of canonical Hertz-Millis
  divergence ξ ~ T^{-ν/z}); (2) the dynamic exponent z is absent from the
  displayed formula. Reformulation requires replacing the entire ansatz
  AND committing to a universality class (3D Ising / XY / Heisenberg /
  fermionic Hertz-Millis-Moriya); each gives different (ν, z). Two
  coupled physics decisions; neither is a transcription fix. Status pin:
  `tests/bridges/be-33-r3-disposition.test.ts`. Deleted obsolete
  `be-33-r2-spec.test.ts`.
- **Wave N Tier C5 — BE-24 R3 invalidation (Phys iter-4 IMPORTANT).** BE-24
  (Quantum Coherence in Photosynthesis Efficiency) promoted from
  'speculative' to 'invalid' per R3 disposition. Two orthogonal unfixable
  defects: (1) multiplicative form admits η > 1 for κ ∈ [0.1, 0.3] —
  bound-violation; not in any cited literature. (2) Cao 2020 *Sci. Adv.*
  consensus reassigns observed FMO oscillations as vibrational rather than
  electronic. Reformulation requires committing to FRET / HEOM / Lindblad
  AND addressing the vibrational reassignment. Status pin:
  `tests/bridges/be-24-r3-disposition.test.ts`. Deleted obsolete
  `be-24-r2-spec.test.ts`.
- **Wave N Tier C4 — BE-17 R3 invalidation (Phys iter-4 IMPORTANT).** BE-17
  (EM-Gravitational Torsion) promoted from 'speculative' to 'invalid' per
  R3 disposition. Three orthogonal structural defects (4-vs-2 index
  mismatch; ℓ_EM = √(ℏc/e²) not a length in SI; rank-3 vs rank-4
  contorsion confusion) each alone would warrant R3. Wave L Tier I8 had
  recorded the R3 evaluation but kept 'speculative' pending domain-expert
  review; Wave N Tier C4 promotes to 'invalid'. Status pin:
  `tests/bridges/be-17-r3-disposition.test.ts`. Deleted obsolete
  `be-17-preserve.test.ts` and `be-17-r2-spec.test.ts`.
- **Wave N Tier C3 — BE-15 R3 invalidation (Phys iter-4 IMPORTANT).** BE-15
  (Universal Emergence Equation) promoted from 'speculative' to 'invalid'
  per R3 disposition. LHS (∂O_macro/∂t, a macroscopic-observable rate) and
  RHS (F[{O_micro}], an RG-flow functional) describe disjoint physical
  objects evolving along different parameter axes (real time vs RG scale).
  Three non-equivalent literature reformulations exist (Hohenberg-Halperin
  / Wetterich / Mori-Zwanzig); selecting one is a research commitment.
  Status pin: `tests/bridges/be-15-r3-disposition.test.ts`. Deleted
  obsolete `be-15-r2-spec.test.ts`.
- **Wave N Tier C2 — BE-13 R3 invalidation (Phys iter-4 IMPORTANT).** BE-13
  (Landauer-Wheeler Information-Geometry Equation) promoted from
  'highly-speculative' to 'invalid' per R3 disposition. The "Landauer-
  Wheeler" framing is a category error — Landauer's principle is a 0+1-dim
  thermodynamic bound, not a stress-energy tensor sourcing curvature. The
  three canonical literature paths (Jacobson 1995 / Verlinde 2011 /
  Padmanabhan 2010) all *eliminate* I_μν rather than introduce it.
  Reformulation cannot patch the present form; each path gives a different
  equation. Status pin: `tests/bridges/be-13-r3-disposition.test.ts`.
  Deleted obsolete `be-13-r2-spec.test.ts`. Updated Part-I.md BE-13 Status
  block, Bridge-Remediation-Plan.md R3 record.
- **Wave N Tier C1 — BE-12 R3 invalidation (Phys iter-4 IMPORTANT).** BE-12
  (Mesoscopic Coherence Length) promoted from 'speculative' to 'invalid'
  per R3 disposition. Three orthogonal undefined-quantity defects (ξ_0,
  ω_decoherence, cube exponent in N_c) require coupled physics judgments
  that no domain-expert reformulation arrived for in the iter-3→iter-4
  window. Status pin: `tests/bridges/be-12-r3-disposition.test.ts`. Deleted
  obsolete `be-12-preserve.test.ts` and `be-12-r2-spec.test.ts`. Updated
  Part-I.md BE-12 Status block, Bridge-Remediation-Plan.md R3 record.

### Fixed
- **Wave N Tier B — BE-19 ρ_crit prefactor reconciliation (Math IMP-1 +
  Researcher I-3 iter-4 CONV-1).** The Wave-I.B-C1 reformulation displayed
  `ρ_crit = √3 / (16π²γ³ℓ_P²) · c²/G`, which with γ=0.2375 evaluates to
  ~0.82 ρ_Planck — but the prose claim everywhere has been ρ_crit ≈
  0.41 ρ_Planck (matching Ashtekar-Pawlowski-Singh 2006 PRD 74:084003 and
  the Ashtekar-Singh 2011 review arXiv:1108.0893). Resolved by changing
  the displayed prefactor from `16π²γ³` to `32π²γ³` (canonical APS form);
  the prose value 0.41 ρ_Planck is preserved because it was already
  correct. Updated `formula_latex` and `notes` in `src/bridges/index.ts`,
  the displayed equation in `docs/specification/Part-I.md` BE-19 (with
  retrospective correction note), and the BE-19 encoding test
  `tests/bridges/be-19-encoding.test.ts` (PINS canonical APS form
  description and the dimensionless-coefficient bracket [0.35, 0.50]
  that pins the 0.41 numerical claim).
- **Wave N Tier A6 — BE-30 FLM venue typo (Researcher iter-4 C2).** BE-30
  R3 disposition cited Faulkner-Lewkowycz-Maldacena 2013 as
  "*JHEP* 1408:074"; the canonical venue is **JHEP 11:074 (2013)**,
  matching BE-43's reference form. Fixed in `src/bridges/index.ts` BE-30
  references[] (line ~797) and `docs/specification/Part-II.md` BE-30
  Status block (with retrospective venue-correction note dated 2026-05-06).
- **Wave N Tier A5 — BE-40 author attribution (Researcher iter-4 C1).**
  arXiv:hep-ph/0703164 ("The Strongly-Interacting Light Higgs", *JHEP*
  0706:045) was previously mis-attributed to
  "Contino-Grojean-Moretti-Piccinini-Rattazzi 2007"; the canonical author
  list is **Giudice-Grojean-Pomarol-Rattazzi 2007** (verified against the
  arXiv abstract). Fixed in `src/bridges/index.ts` BE-40 entry (references
  + comment), Part-II.md BE-40 prose + corrected-on block, and CHANGELOG
  Wave J Tier C5 retrospective note.

### Changed
- **Wave N Tier A2 — REPAIR_INCONSISTENCY clearly schema-only (CS iter-4
  C2).** Strengthened the Algorithm 1 hedge note in Part-I §IV with a loud
  WARNING block that says: no termination guarantee, no implementation,
  schema-only — and added a parallel new sub-section Part-IV §12.2.1.2
  ("REPAIR_INCONSISTENCY is schema-only — no implementation, no
  termination guarantee") that ties the schema to the audit-tier
  R0/R1/R2/R3 dispositioning system + hand-applied repair waves
  (Waves F–N) as the actual repair workflow.
- **Wave N Tier A1+A3+A4 — Part-III §VIII complexity-formalism cleanup
  (CS iter-4 C1 + C3 + C4).** Struck the formal-looking class chain
  `P ⊆ NP ⊆ PSPACE ⊆ TENSOR ⊆ EXPSPACE ⊆ ELEMENTARY` and the
  **TENSOR-COMPLETE** problem list ("Bridge Equation Satisfiability,"
  etc.) per the option-(b) recommendation in CS iter-4 reviewer comments.
  Replaced with prose acknowledging the satisfiability question is
  *informally analogous* to SAT but UPT does not commit to a complexity
  classification; concrete tractability information lives on each
  `BridgeEquation`'s `tractability_class` field, and the canonical
  classification is the tree-width story in Part-V §XXV.1.1
  (Markov-Shi 2008). Algorithm 6's LINEAR/QUADRATIC/EXPONERTIAL hedge
  note rewritten to declare those labels schematic placeholders for the
  tree-width framing rather than a competing classification. Part-III
  preamble status note updated to reflect the deletion and Algorithm
  3/3A/3B reconciliation completion.
- **Wave L Tier J — minor polish (Math + Phys + Researcher MINOR iter-3).**
  - **Glossary expansion (Math iter-3 minor):** added entries for `T`
    (temperature vs stress-energy tensor vs time collisions across BE-11/12/
    13/15/23/26/27/29/33/34 vs BE-30/43/29 vs BE-50/§1.3), `n` (mutation
    rate vs defect density vs species number density), `k` (Lindblad sum
    index vs Boltzmann constant `k_B` vs mode index), and `α_fs`
    (fine-structure constant disambiguated from per-bridge α coefficients).
  - **§3.1 CPT clarification (Math iter-3 minor):** added a clarification
    note that `CPT : Π → Π + O(ℓ_P/L)` reads CPT as an operation on per-cell
    quantum-field content (not as the identity on Π), consistent with the
    per-cell reading of §1.3 invariants. Tied to the catalog-framing
    commitment in §1.1.
  - BE-44 supertranslation/superrotation Y^z (Math iter-3) — applied in
    Tier I6 above.
  - Algorithm 6 LINEAR/QUADRATIC/EXPONENTIAL — already has Wave J Tier E4
    hedge note in Part-III §VIII; no further action.
- **Wave L Tier I — per-bridge clarifications (Math IMPORTANT + Phys IMPORTANT iter-3).**
  - **I1 BE-22 α-dimension circularity flag (Phys I3 iter-3):** new
    known_issue documenting that the AST encoding's `[1]` round-trip is
    only valid when α is *given* dimension `[L^{-1}]` a priori; the d=2
    spatial-dimension assumption is inferred from α's dimension, not
    independently specified.
  - **I2 BE-29 Hilbert action specifics (Phys I2 iter-3):** new known_issue
    making explicit that the gravitational-work term uses the
    Einstein-Hilbert action variation per MTW §21.3 / Wald §E.1, with
    explicit T^{μν} := (2/√(-g))·δ(√(-g)L_matter)/δg_{μν}, and that
    Gibbons-Hawking-York boundary terms are not included.
  - **I3 BE-32 measure unspecified (Phys I5 iter-3):** new known_issue
    flagging that the dg integral presupposes a Haar measure but no group
    is specified, and Haar measures diverge for non-compact groups
    (translations, boosts) without regularization.
  - **I4 BE-34 dimensional fix completed in formula (Phys I6 iter-3):**
    `formula_latex` updated to include the explicit `1/a^d` prefactor
    (previously only documented in glossary; the formula_latex itself
    omitted it). LHS dimensions `[L]^(-d)` now recovered. Part-II §BE-34
    prose Status block updated.
  - **I5 BE-39 "universal" → "scheme-dependent" coefficients (Phys I7
    iter-3):** new known_issue clarifying that A, B, C, D, E in the
    truncated β-functions are scheme-dependent (Einstein-Hilbert / f(R) /
    Wetterich-type / regulator / gauge-fixing), not universal. Reuter-Weyer
    2009 truncation values cited as canonical scheme.
  - **I6 BE-44 supertranslation/superrotation Y^z disambiguation (Math
    iter-3 + Phys M4):** new known_issue specifying that Y^z is the
    superrotation form (vector field on celestial sphere); supertranslation
    case has Y^z replaced by scalar f(z, z̄). Hawking-Perry-Strominger 2017
    cited.
  - **I7 BE-12 R3 evaluation (Math iter-3 IMPORTANT):** new known_issue
    documenting that ξ_0, ω_decoherence, and the cube exponent in N_c
    constitute a structural defect; Wave L decision is to **keep
    'speculative'** rather than R3-disposition (formula serves as a
    placeholder; demoting would lose it without offering an alternative).
  - **I8 BE-17 R3 evaluation (Math iter-3 IMPORTANT):** new known_issue
    documenting the three orthogonal structural defects (4-vs-2 indices,
    l_EM not a length, rank-4 vs rank-3 contorsion); Wave L decision is to
    **keep 'speculative'** as a research-program placeholder.
  - **Test update:** `tests/bridges/be-17-preserve.test.ts` known_issues
    count assertion 3 → 4 (Wave L Tier I8 added a 4th entry; all remain
    'reformulation'-fixable).
- **Wave L Tier H — citation hygiene continuation.**
  - **H1 (4 empty `references[]` populated, per Researcher iter-3 I-3):**
    BE-23 (Strange Metal — historical citation chain retained despite R3
    invalidation: Maldacena-Shenker-Stanford 2016, Sachdev-Ye 1993,
    Hartnoll 2015), BE-34 (Kibble-Zurek: Kibble 1976, Zurek 1985, del Campo
    & Zurek 2014), BE-46 (Multiverse measure: Linde-Linde-Mezhlumian 1994,
    Vilenkin 1995, Garriga-Vilenkin 2001, Freivogel 2011), BE-48 (GRW:
    Ghirardi-Rimini-Weber 1986, Bassi-Ghirardi 2003, Bassi et al. 2013).
  - **H2 Verlinde SciPost year (2016 → 2017):** SciPost Phys. 2:016 was
    published in 2017 although the arXiv submission (1611.02269) was 2016.
    Updated in Part-II §BE-36 prose, src/bridges/index.ts BE-36
    references[], and BE-36 known_issue description.
  - **H3 Part-V conclusion BE-list (line 1218 stale):** the hard-coded BE
    list at "Correct the known equation errors..." was inconsistent with
    HEAD. Replaced with a forward pointer to `src/bridges/index.ts` (the
    source of truth) plus the current count (27, Wave L Tier F2) and a
    note that 7 are R3-invalid.
  - **H4 Glossary cross-reference fix:** "A | Part-I §3.2, §11.1.2" →
    "Part-I §3.2, Part-IV §11.1.2" (the earlier reference was malformed —
    §11.1.2 lives in Part-IV, not Part-I). Per Researcher iter-3 I-1.
- **Wave L Tier G — Wave J E/G residuals.**
  - **G1 Part-III §VIII heading:** "Information-Theoretic Bounds and
    Complexity Analysis" → "Catalog Tractability and Information-Theoretic
    Bounds" (per CS C3 iter-3) — applied in Tier A above; the formal-class
    language was already hedged informal in Wave I.B D6 / Wave J Tier E1 and
    the heading is now aligned.
  - **G2 tractability_class population (10 new entries, per CS C2 iter-3):**
    BE-12 → 'formally-divergent' (novel formula; no literature derivation),
    BE-13 → 'formally-divergent' (Landauer-Wheeler I_μν not constructible
    per Phys C2),
    BE-15 → 'formally-divergent' (RG functional + observable mix; no
    operational form per Phys C3),
    BE-17 → 'formally-divergent' (Einstein-Cartan with rank-mismatched EM
    coupling),
    BE-21 → 'closed-form' (AdS/CMT Green's function with explicit
    dimensional signature, computable at tree level),
    BE-27 → 'numerical-tractable' (frequency-domain susceptibility from
    MD/Langevin simulations),
    BE-28 → 'formally-divergent' (variational principle ill-posed without
    constraint surface, per Phys I4),
    BE-32 → 'formally-divergent' (Haar measure undefined for non-compact
    groups, per Phys I5),
    BE-35 → 'numerical-tractable' (conformal bootstrap is a numerical SDP
    procedure tractable in practice),
    BE-44 → 'numerical-tractable' (soft-hair surface integrals are
    numerically computable per remediation-plan note).
    Remaining 'undefined' entries are intentionally undefined for now
    (BE-43, BE-50: now R3-invalid; BE-30, BE-37, BE-23, BE-16: also
    R3-invalid; the rest still need physics-judgment input).
  - **G3 Part-VI §28.3 speculative-algorithms warning header:** added per
    Math M-I6 iter-2 (propagated from Part-IV §12.3 / Wave J Tier E3
    pattern). Cosmic-engineering subsections now carry an explicit
    speculative-pseudocode warning header in addition to the prior
    "IMPORTANT CAVEAT" block.
  - **G4 Definition 8.1 distribution clarification:** applied in Tier A
    above (uniform-on-populated explicit; alternatives Gibbs, MaxEnt,
    empirical-mass listed).
- **Wave L Tier F — regressions caught (Researcher iter-3).**
  - **F1 Israeli-Goldenfeld year:** corrected `2006 *Phys. Rev. Lett.* 92:074105`
    → `2004 *Phys. Rev. Lett.* 92:074105`. Wave I.B D5 introduced the wrong
    year when adding the reference. Verified via APS, PubMed, arXiv:nlin/0309047.
    Updated Part-IV §11.2.1 line 174 and CHANGELOG references (Wave I.B D5
    entry).
  - **F2 known_issues count off-by-one:** Part-VI line 714 (count "26") and
    line 729 (list with BE-19 stale) were inconsistent with Wave I.A C3 fix
    that only touched CHANGELOG line 320. Both Part-VI lines now corrected
    to count 27 with BE-19 → BE-26 and BE-29 added to the list (BE-29 was
    previously missed; it carries a Wave J Tier D4 known_issue). CHANGELOG
    line 636 entry similarly corrected 26 → 27 with BE-29 added.
- **Wave L Tier E — R3 dispositions (BE-25 cascade, BE-43, BE-50).**
  Three new R3 invalid dispositions per iter-3 Phys CRITICAL findings (C4, C7, C8).
  - **E1 (BE-43, Phys C7 iter-3):** wormhole length DECREASES with entanglement
    (sign backwards from Maldacena-Susskind ER=EPR), plus dimensional
    malformedness (entropy + stress-energy integral cannot combine into
    length/time without unphysical coefficient roles). Same structural-
    malformedness pattern as already-invalidated BE-30 (Wave J Tier B2).
    Recommended replacement: FLM 2013 entanglement-wedge construction.
    Status: 'highly-speculative' → 'invalid'. Two known_issues marked
    'unfixable-must-mark-invalid'.
  - **E2 (BE-50, Phys C8 iter-3):** δ⁴(x − x_m) action term variationally
    ill-posed. Single-point distributional source produces non-finite-action
    EOM solutions, boundary conditions for backward sector unspecified, no
    stress-energy tensor or Hamiltonian. Genuine Wheeler-Feynman absorber
    theory integrates over absorber world-lines, not a single point. Status:
    'highly-speculative' → 'invalid'. New unfixable known_issue added; prior
    Wave I.A C5 attribution context retained.
  - **E3 (BE-25 cascade, Phys C4 iter-3 — completes deferred Wave J Tier B3):**
    BE-25 (Penrose-Hameroff Orch-OR) dispositioned R3-invalid on two
    orthogonal grounds: (1) Tegmark 2000 *Phys. Rev. E* 61:4194 decoherence-
    time falsification (10-order gap microtubule ~10⁻¹³ s vs cognition
    ~10⁻³ s); (2) formula's spurious Δx/ℓ_P factor not in Penrose's canonical
    E_G ~ G(Δm)²/Δx. Cascade: **excised three downstream sections** — Part-IV
    §12.3 (Consciousness Engineering pseudocode + ENGINEER_CONSCIOUSNESS
    algorithm), Part-V §21.2.2 (CONSCIOUSNESS_STATE_MONITOR device specs),
    Part-VI §28.2 (clinical-protocol pseudocode for Depression / ADHD / PTSD /
    Alzheimer's / Anesthesia + Cognitive Augmentation). Each excision leaves
    a one-paragraph replacement noting that future quantum-cognition claims
    require a separate validated mechanistic basis (e.g., IIT/PCI as suggested
    by the iter-1 Neurologist).
  - **Tests:** 3 new R3 status-pin test files (be-25/43/50-r3-disposition.test.ts)
    mirroring the BE-30/37 templates. Updated stale BE-25 status pin in
    be-25-encoding.test.ts (was pinning 'highly-speculative'; now 'invalid').
  - **Documents updated:** Part-II BE-25/43/50 prose Status blocks all reflect
    R3 disposition with cross-references to test files.
    Bridge-Remediation-Plan.md R3 row count 4 → 7 with new entries listed.
- **Wave L Tier D — Wave J Tier A residuals (catalog-framing follow-up).**
  Per CONV-4 iter-3 (Math C1, CS C1, Phys implicit) — Wave J Tier A scope-note
  approach left three residuals.
  - **D1 §1.2 vs §3.3 `+` ambiguity:** the `+` in `Π = L + B + E` (§1.2) is
    disjoint union of catalog entries; the `+` in the §3.3 RG-flow expansion
    `β_0 + β_1 Π + β_2 Π² + …` is algebraic-polynomial inside per-cell coupling
    content. Same character, different operations. Both §1.2 and §3.3 now carry
    a clarification note explicitly disambiguating these and stating that there
    is no aggregate algebraic operation on the catalog as a whole.
  - **D2 §1.3 invariant 1 (dimensional consistency) clarified as self-consistency
    check:** per Math C2 iter-3, the AST-validator-level check is a
    necessary-but-not-sufficient self-consistency assertion (the encoding is
    consistent with its declared signature), not a derivation of physics from
    first principles. The physics-level dimensional correctness is enforced by
    the per-BE `references[]` field plus prose. Note added to invariant 1.
  - **D3 Algorithm 3A scope note:** added in Wave L Tier B (above) — every
    Hilbert-space-style operation in the algorithm body is now schematic, with
    the per-cell catalog rewrite documented in Appendix B (Part-IV).
- **Wave L Tier C — Consistency matrix C_ij entry-construction recipe (2-way convergent CRITICAL per iter-3).**
  Per CONV-3 iter-3 (Math C3 + Phys C5), the balance-theoretic check (Harary 1953,
  Wave J Tier C6) is well-defined structurally but operationally empty without a
  recipe for assigning the actual `C_ij ∈ {-1, 0, +1}` values to the 780
  off-diagonal pairs.
  - **Added Part-II §6.2.1 "Entry-construction recipe — illustrative":**
    candidate recipe based on shared fundamental constants, symbol-family overlap,
    and dimensional compatibility; explicit caveats that the recipe is
    illustrative, not authoritative, and that full population requires per-pair
    physics judgment.
  - **Two worked example pairs:**
    - BE-11 (Caldeira-Leggett decoherence) vs BE-19 (LQC bounce) → `C_{11,19} = 0`
      (operationally independent: shared `ℏ` is too marginal, dimensional
      categories differ, no mutual prediction).
    - BE-22 (entanglement-entropy area scaling) vs BE-14 (Ryu-Takayanagi) →
      `C_{22,14} = +1` (mutually reinforcing: BE-22 is the (1+1)D limit of BE-14
      RT formula).
  - **Part-V §19.2 cross-reference:** added a forward pointer to Part-II §6.2.1
    so the balance-theoretic check is now reachable from both halves of the spec
    via the same recipe.
- **Wave L Tier B — Hilbert-space sketches relegated to Appendix B (3-way convergent CRITICAL per iter-3).**
  Per CONV-2 iter-3 (Math C5, CS I4 + C1, Phys partial), three reviewers found the
  Wave J Tier A scope-note approach insufficient: tensor-style operations on `Π`
  (`⟨Πᵢ|Πⱼ⟩`, `Tr[Π†OΠ]`, `‖Π‖_F`, `‖Π_∞‖²`, `lim_{ℏ→0} Π_quantum`, functor `F: 𝒫 → ℋ`,
  `⊗_{n=0}^∞ ℋ_n`, `⟨ψ, Dψ⟩`) continued to read as operational inside algorithm bodies
  and displayed formulas because the existing scope notes were paragraphs away.
  Wave L Tier B chose **Option B (relegation)** over Option A (cleanup):
  - **Added Part-IV Appendix B "Hilbert-Space Analogies (Non-Load-Bearing)":**
    catalogues every body occurrence of Hilbert-space-style notation, gives the
    per-cell catalog rewrite for each (table B.1), and indexes by body location
    (table B.2). Single-named relegation point; Option B chosen because Option A
    (per-cell rewriting throughout) would require extensive prose rewrite that
    risks losing expository value.
  - **Body scope notes strengthened:** Part-I §Algorithm 3A (NEW scope note),
    Part-IV §11.1.1 / §11.1.2 (NEW or strengthened), §14.1.3 (NEW),
    Part-V §17.1 / §17.2 / §17.3 / §24.1.1 (strengthened) — each now points
    explicitly to "Appendix B (Part-IV)" so a reader who lands inside a body
    formula can immediately find the operational catalog meaning.
  - **Algorithm 3A schematic rendering:** the body's `‖Π - transformed‖_F` and
    `lim_{ℏ→0} Π_quantum = Π_classical` are now explicitly tagged as schematic;
    the operational form (per-cell, identical to the rephrased Part-I §1.3
    invariant 4 from Wave J) is documented in the new scope note. The implemented
    validator (`VALIDATE_DIMENSIONS` in `src/dimensional/validator.ts`) operates
    per-cell already.
  - **§11.1.2 holographic bound aligned with Tier A:** the `I ≤ A/(4ℓ_P²)`
    holographic-information bound is now cross-referenced to the new
    Hubble-horizon form `A_H = 4π/H₀²` per Conjecture 8.1 in Part-III §VIII
    (Wave L Tier A; Phys I9 iter-3).
- **Wave L Tier A — Conjecture 8.1 comprehensive rewrite (3-way convergent CRITICAL per iter-3).**
  Per CONV-1 iter-3 (Math C4 + CS C4/C5 + Phys C1), Part-III §VIII Conjecture 8.1
  comprehensively rewritten:
  - **Hubble-horizon area replaces `A_universe`:** the previous form invoked
    `A_universe / (4ℓ_P²)`, which is a category error — there is no global
    cosmological boundary in dS-like spacetime. Replaced with the
    Gibbons-Hawking de Sitter horizon area `A_H = 4π / H₀²`
    (Gibbons-Hawking 1977 *Phys. Rev. D* 15:2738), associated with the cosmic
    event horizon of a comoving observer. The displayed inequality now reads
    `I(Π) ≤ max(0, A_H/(4ℓ_P²) − S_entanglement[H_3])`.
  - **`H_3` replaces `∂ universe`:** the entanglement-entropy correction is now
    taken across the spatial 3-slice intersected with the Hubble horizon
    (`H_3`), replacing the ill-defined `∂ universe`.
  - **Positivity floor `max(0, …)`:** the previous unclamped difference
    `A_H/(4ℓ_P²) − S_entanglement[H_3]` could in principle be negative
    (CS C5); positivity in dS is itself a sub-conjecture, not a derived
    inequality. The `max(0, …)` clamp ensures a structural floor of zero.
  - **Quantitative-triviality caveat made explicit:** under the
    uniform-on-populated pin (Definition 8.1), `I(Π) ≈ 5.32 bits` while the
    RHS is ~10¹²² bits — the bound is so loose it carries no quantitative
    content at present catalog resolution. The conjecture is now explicitly
    framed as a **structural** statement, not an operational test condition
    (Math C4, CS C4 iter-3).
  - **§VIII heading reformulated:** "Information-Theoretic Bounds and
    Complexity Analysis" → "Catalog Tractability and Information-Theoretic
    Bounds" (Wave L Tier G1, per CS C3 iter-3) — the formal-class language
    was already hedged informal in Wave I.B D6 / Wave J Tier E1; the heading
    is now aligned.
  - **Definition 8.1 distribution made explicit:** the uniform-on-populated
    pin now states explicit alternatives (Gibbs, MaxEnt, empirical-mass)
    that the spec does not commit to (Wave L Tier G4, per Math C4 iter-3).
- **Wave J Tier H — minor polish.**
  Per iter-2 Math M-M1, M-M3, M-M4 + Phys M6:
  - **BE-19 ρ_crit parenthesization:** added explicit parentheses to disambiguate
    `(√3/(16π²γ³ℓ_P²)) · (c²/G)` from the alternative reading.
  - **BE-44 zar{z} → \bar{z}:** the alt-text was corrupted by three `\x08` (backspace) bytes
    that turned `\bar{z}` into `zar{z}` in three places. Fixed via byte-level rewrite.
    Strengthened where-clause to define `N_{z\bar{z}} := ∂_u C_{z\bar{z}}` matching standard
    Bondi-Strominger convention.
  - **BE-20 inline-vs-prose mismatch:** displayed inline LaTeX previously rendered `n ≥ 2`
    while alt-text and prose said `n > 0`. The prose is correct (any `n > 0` makes
    `exp(-(x/x_c)^n)` faster-than-polynomial); replaced inline LaTeX with `n > 0`.
  - **Algorithm 3A/3B duplicate numbering:** already disambiguated in earlier waves
    ("Algorithm 3B extends Part-I Algorithm 3A"); confirmed not a duplicate; no further
    action.
  - **Bekenstein 1981 vs Bekenstein-Hawking 1973 conflation:** addressed in Tier D8
    (§12.2.2 restructure) where Bekenstein's universal bound `S ≤ 2π k_B R E /(ℏc)` is
    distinguished from the Bekenstein-Hawking area form `A/(4ℓ_P²)`.
- **Wave J Tier F + G — references[] population and tractability_class population.**
  - **Tier F (10 entries):** populated `references[]` from prose-Status citations for BE-23
    (R3 dispositioned in Tier B; FLM added), BE-27, BE-32, BE-35, BE-36, BE-39, BE-40 (already
    in Tier C5), BE-42, BE-44, BE-49. Each new reference includes a brief annotation indicating
    which content it grounds. Per Researcher iter-2 finding I-3.
  - **Tier G (5 entries):** populated `tractability_class` for entries with clear literature
    tractability:
    - BE-20 (vacuum-fluctuation dark energy) → `'formally-divergent'` (the integral is the
      cosmological-constant problem; ~10^120-off naive evaluation).
    - BE-46 (multiverse measure problem) → `'formally-divergent'` (path-integral measure dμ[g,φ]
      not Turing-computable; the measure is itself the unsolved problem).
    - BE-50 (retrocausal QFT) → `'formally-divergent'` (distributional δ⁴(x - x_m) coupling in
      the action; both-sector path integral not Turing-computable).
    - BE-29 (Jarzynski-gravity) → `'numerical-tractable'` (already applied in Tier D4).
    - BE-39 (asymptotic safety) → `'numerical-tractable'` (already applied in Tier F via the
      truncated functional RG flow).
- **Wave J Tier E — algorithmic spec hedges.**
  Per iter-2 reviewer findings (CS C1, C3, C4, C8, I2, I5, I8; Math M-I3, M-I4):
  - **E1:** TENSOR-COMPLETE / `P ⊆ NP ⊆ PSPACE ⊆ TENSOR ⊆ EXPSPACE` chain — strengthened the
    Wave I.B D6 hedge note in Part-III §VIII to apply explicitly to ALL body usages of
    "TENSOR-COMPLETE" or the chain. Body chain header now reads "(informal, illustrative — not
    formal)". Per CS C3.
  - **E2:** Algorithm 1 (`INFER_BRIDGE_EQUATIONS`, `REPAIR_INCONSISTENCY`) — added prominent
    "Hedge note" header tagging the algorithm as a schema, not an algorithm; flagged
    uncomputable subroutines as **ORACLE** calls; clarified that only `VALIDATE_DIMENSIONS` is
    actually implemented. Per CS C1.
  - **E3:** Speculative `ENGINEER_*` algorithms (Part-IV §12.3, §12.4, §13.2) — added a
    front-loaded "Speculative-algorithms warning header" at the start of §12.3 covering all
    such blocks. Tagged as expository sketches, not implementable. Per CS C4.
  - **E4:** Algorithm 6 LINEAR/QUADRATIC/EXPONENTIAL classification — added Hedge note
    pointing to Part-V §XXV.1.1 treewidth framing as the principled alternative; classification
    marked schematic until pinned to concrete tensor-network properties. Per CS I2.
  - **E5:** "Theorem 8.1" Holographic Bound — relabeled **Conjecture 8.1**; "Proof Sketch" →
    "Plausibility Argument"; each step annotated with its non-rigor (Bekenstein 1981 vs
    Bekenstein-Hawking 1973 conflation; RT applies in AdS not dS; inclusion-exclusion over
    cosmological patches non-rigorous). Per Math M-I3.
  - **E6:** Definition 8.1 Tensor Information Content — added "Distribution-pin note" stating
    the spec assumes the **uniform-on-populated-cells** distribution; alternative distributions
    (e.g., empirical mass via confidence_score) are out of scope. Per Math M-I4.
  - **E7:** §III.2.4 (Part-I §3.2 item 4) — strengthened the "no UPT-committed bound" hedge:
    no general upper bound on circuit complexity in terms of entropy alone is possible
    (entropy is unitary-invariant; circuit complexity is not; cannot be related by a
    state-independent function). Per CS I5.
  - **E8:** §1.3 modal "must satisfy" language — weakened to "is checked by the dimensional
    validator for the AST-encoded subset; un-encoded equations are unchecked." The validator's
    actual scope is bounded (dimensional_signature for AST-encoded entries); gauge / unitarity
    / correspondence are content-level and not machine-checked. Per CS C8 + I8.
- **Wave J Tier D — notation/scope/glossary completeness pass.**
  Per iter-2 reviewer findings (Math M-I1, M-I2, M-C2, M-C3, M-I6, Phys C7, CS C5, CS C6, Math/CS I1):
  - **D1 (already in Tier A commit):** Part-I §1.3 invariants 2-4 rephrased as per-cell validator
    contracts mirroring Item 1's pattern.
  - **D2:** Notation glossary in Part-I Appendix A extended with 7 missing polyvalent symbols
    (σ, A, S, F, g, H, a) per Math M-I1. Each row pins which BE uses the symbol in which sense.
  - **D3:** BE-22 known_issues — added "Spatial-dimension scope" entry noting the Kitaev-Preskill
    formula `S(R) = αL − γ` implicitly fixes d=2 (perimeter L, α [L^{-1}]); higher-d generalizes
    to area `[L^{d-1}]` and `α [L^{-(d-1)}]`. Per Math M-C2.
  - **D4:** BE-29 known_issues — added "Factorization assumption" entry: the Jarzynski-gravity
    factorization ⟨exp(-βW)⟩ = exp(-βΔF)·exp(-βW_grav) requires W_grav to be deterministic
    (external protocol metric) or self-averaging; spec is now explicit that δg_{μν} is the
    deterministic experimentalist-imposed protocol. Per Math M-C3 + Phys I10. Bonus: updated
    `tractability_class` from `'undefined'` to `'numerical-tractable'` (anticipates Tier G).
  - **D5:** BE-13 known_issues — added "Landauer attribution mismatch" entry: only the
    k_B T ln 2 prefactor is Landauer-derived; the curvature-generating I_μν tensor and its
    sourcing of Einstein's equations is a separate ansatz that should be relabeled
    "Landauer-inspired" or rederived via Padmanabhan 2010 emergent-gravity. Per CS C5.
    Added Padmanabhan 2010 to references[]. Per Math M-I10.
  - **D6:** BE-22 known_issues — added "Log-base convention" entry: S(R) is in **nats**;
    γ = ln(D); to convert to bits multiply by 1/ln(2). Per CS C6.
  - **D7:** Part-IV §11.2.1 — replaced the formal cardinality claim `|𝒞(Π)| < |𝒰(Π)|` with a
    runtime/algorithmic-cost framing. The cardinality formalism is finite-vs-finite under §1.1
    (Π is a finite catalog) and "strict and unbridgeable" has no clear meaning there; the
    irreducibility content is about shortcut-vs-direct-simulation cost inside cell-content
    dynamics, not about catalog cardinality. Per Math M-M9 + CS I1.
  - **D8:** Part-IV §12.2.2 — replaced the conflation "Computational Power ≤ (E·T/ℏ)·(V/ℓ_P³)"
    (which mislabeled an op-count as power AND used V/ℓ_P³ where Bekenstein gives A/ℓ_P²) with
    three separately-stated bounds: Margolus-Levitin power bound (2E/πℏ ops/sec); Lloyd
    cosmic-ops total bound; Bekenstein-Bousso entropy ≤ A/(4ℓ_P²) holographic bound. Per
    Math M-I6.
- **Wave J Tier C — tracker drift fixes + BE-40 dimensional fix + §6.2/§19.2 SUPERSEDED reconciliation.**
  Per iter-2 Researcher findings (C1-C4) + Phys C-NEW + CONV-2:
  - **C1 (verified via WebFetch arXiv abstract page):** Son-Starinets 2002 venue corrected
    `Phys. Rev. D 65:104021` → `JHEP 0209:042` (3 locations: Part-II.md BE-21 status block,
    `src/bridges/index.ts` BE-21 references, CHANGELOG.md). The Wave I.A pass mistakenly
    recorded the wrong venue when disambiguating from the three-author Policastro paper.
  - **C2:** Iqbal & Liu citation year `2008` → `2009` (arXiv 0903.2596 is March 2009;
    *Fortsch. Phys.* 57 is the 2009 volume).
  - **C3:** Stale prose known-issue lists at Part-VI.md:848 and CHANGELOG.md:381 swapped
    BE-19 → BE-26. Wave I.B C1 emptied BE-19's `known_issues[]` (reformulation cleared
    the gap stub); Wave I.B C6 added the polymerase-fidelity issue to BE-26.
  - **C4:** `Bridge-Remediation-Plan.md` summary table updated R3 count `0 → 4` and R2
    count `9 → 7` to reflect Wave J Tier B (BE-23, BE-30) + Wave-pre-J (BE-37) + 2026-05-01
    (BE-16) R3 dispositions. Added Tier R3 detail entries for BE-23 and BE-30.
  - **C5 (per Phys C-NEW iter-2 + Phys I7 iter-2):** BE-40 first-term coefficient
    `-α f²` → `-α f⁴` for dimensional homogeneity. Standard composite-Higgs potentials
    (Kaplan-Georgi 1984; Giudice-Grojean-Pomarol-Rattazzi 2007 — see Wave N Tier A5 for
    the author-attribution correction; this earlier entry mis-attributed the arXiv ID) have
    V(h) = α f⁴ sin² + β f⁴ sin⁴ with both α, β dimensionless. Updated `formula_latex`
    in `src/bridges/index.ts`, the displayed equation in Part-II.md, and the status text;
    populated BE-40 `references[]` (3 entries).
  - **C6 (per CONV-2 + Phys C6 + Math M-I8):** §6.2 / §19.2 SUPERSEDED reconciliation.
    Both sections now point to the **balance-theoretic** replacement as the canonical
    operational checker; the Gram-form alternative is retired (the embedding was
    unspecified, leaving the check parametric per Math M-I8). Pinned `C_ii := +1`
    diagonal convention. (Tier A commit added the §19.2 update; this commit completes
    the §6.2 cross-reference to commit to a single replacement form.)
- **Wave J Tier B1 — BE-23 (Strange Metal — Black Hole Duality) R3 mark-invalid disposition.**
  Per Phys iter-1 C2 + Math M-I5 iter-2 paper review. The third term
  `B √(ℏ/(k_B T τ_P))` collapses to `B · 1` identically because `τ_P · k_B T = ℏ` is a
  definitional identity, so any monomial built from those two scales alone is fixed.
  The displayed formula has the same content as `ρ(T) = ρ_0 + B + AT` — constant-shifted
  Drude form, not Planckian dissipation. Promoted from R2 to R3 invalid: a non-vacuous
  third term must introduce a second scale (τ_el, SYK J, E_F, MSS λ_L), which is a
  research commitment rather than a transcription fix. Status `'speculative'` →
  `'invalid'`; `KnownIssue.fixable` → `'unfixable-must-mark-invalid'`. Notes lead with
  "INVALID per disposition decision 2026-05-05 (Wave J Tier B1)". Spec section update
  at Part-II BE-23. Status-pin test at `tests/bridges/be-23-r3-disposition.test.ts`
  (replaces obsolete `be-23-fix.test.ts` R2-pin). Bridge-Remediation-Plan.md updated.
- **Wave J Tier B2 — BE-30 (ER=EPR / Entanglement-Geometry) R3 mark-invalid disposition.**
  Per Math M-C5 + Phys C5 iter-1, re-flagged iter-2. The displayed equation has four
  orthogonal defects: (a) `Tr_j(ρ_{ij} log ρ_{ij})` is a scalar so `⟨x|...|x⟩` is
  undefined on it; (b) LHS rank-2 vs RHS scalar — index mismatch; (c) `|x⟩`
  non-normalizable; (d) κ·S has units [L]² but δg_{μν} should be dimensionless.
  No consistent reading. The canonical replacement is the Faulkner-Lewkowycz-Maldacena
  2013 (arXiv:1307.2892) linear-response formula `δS_EE = ⟨δH_R⟩`, which is a *different*
  equation, not a fix. Status `'highly-speculative'` → `'invalid'`; both `KnownIssue`
  entries promoted to `'unfixable-must-mark-invalid'`. Notes lead with "INVALID per
  disposition decision 2026-05-05 (Wave J Tier B2)". Spec section update at Part-II
  BE-30. Status-pin test at `tests/bridges/be-30-r3-disposition.test.ts`. Added FLM
  reference. Bridge-Remediation-Plan.md updated.
- **Wave J Tier A — committed to "labeled multi-index catalog" framing for `Π` throughout the spec.**
  Three independent fresh-eyes reviewers (iter-2 Math M-C1, Phys C7, CS C2) re-rediscovered the
  long-running incoherence: §1.1 demoted `Π` to a labeled multi-index catalog (no inner product,
  `+` is disjoint union), but downstream sections (Part-IV §11.1.1 `⟨Π_i|Π_j⟩` / `Tr[Π†OΠ]`,
  Part-V §17.1 functor-to-**Hilb**, §17.2 `Π = ⊗ℋ_n`, §17.3 spectral triple, §24.1.1 `‖Π_∞‖² < ∞`)
  used genuine Hilbert-space structure on `Π`. To stop the loop from rediscovering this every
  iteration, the framing is committed unambiguously: `Π` has no inner product, no global norm,
  no functorial Hilbert-space codomain, no aggregate `ℏ → 0` limit. Per-section impacts:
  - Part-I §1.1: promoted the demotion from caveat to definition; section title is now "Tensor
    Definition (labeled multi-index catalog)"; added a "Framing commitment" preamble pointing all
    affected sections back to §1.1.
  - Part-I §1.3: rephrased Items 2-4 (Gauge Invariance, Unitarity, Correspondence Principle) as
    per-cell validator contracts mirroring the Wave I.B D11 pattern for Item 1. The earlier
    compact equations on `Π`-as-a-whole were vacuous as top-level invariants; the per-equation
    reading is the operational one.
  - Part-IV §11.1.1: strengthened the existing scope note to a "Catalog-framing scope note"
    explicitly tagging `|Π_i⟩`, `⟨Π_i|Π_j⟩`, `Tr[Π†OΠ]` as notational analogies retained for
    historical/expository continuity, NOT operational mathematical objects.
  - Part-V §17.1, §17.2, §17.3: added Catalog-framing scope notes at section heads. The
    functor `F : 𝒫 → ℋ` is recast as a separately-defined construction on cell contents, NOT
    a structural property of `Π`; the `Π = ⊗ℋ_n` infinite tensor product and spectral-triple
    constructions are tagged expository.
  - Part-V §19.2: propagated the SUPERSEDED tag from Part-II §6.2 to the consistency-matrix
    formulation (per CONV-2 / Tier C6). Committed to the balance-theoretic replacement (Harary
    1953); retired the Gram-form alternative (per Math M-I8 the embedding was unspecified).
    Pinned `C_ii := +1` diagonal convention.
  - Part-V §24.1.1: added Catalog-framing scope note explaining that `‖Π_∞‖² < ∞` is, per the
    catalog framing, a per-cell condition (`‖content(c)‖² < ∞` for normalizable-content cells),
    not a global aggregate norm.
  Project name "Universal Physics Tensor" stays as a brand label; the technical content is a
  catalog, not a tensor in the multilinear-map or Hilbert-space sense. Per iter-2 SYNTHESIS.md
  CONV-1.

### Added
- **`tractability_class` field added to `BridgeEquationEntry` schema (Wave I.B D10).**
  Per CS reviewer I5 (Wave H paper review). Bridge tractability ranges
  from O(1) closed-form (BE-19, BE-25, BE-41) to formally divergent
  (BE-20 cosmological-constant integral, BE-50 distributional path
  integral) — but the schema had no field to record this distinction,
  so contributors had no machine-readable way to flag which entries
  UPT does not claim to compute. Added a new `BridgeTractabilityClass`
  enum to `src/bridges/index.ts`:
  `'closed-form' | 'numerical-tractable' | 'numerical-asymptotic' |
  'formally-divergent' | 'undefined'`. Added a non-null
  `tractability_class` field to `BridgeEquationEntry`. Populated all 40
  entries: the 9 AST-encoded bridges with concrete classes (BE-11
  closed-form, BE-14 closed-form, BE-19 closed-form, BE-22 closed-form,
  BE-25 closed-form, BE-26 numerical-tractable, BE-34 closed-form,
  BE-41 closed-form, BE-47 numerical-tractable); the remaining 31
  entries default to `'undefined'` pending future classification. New
  test block in `tests/bridges-index.test.ts` (5 tests) asserts: every
  entry has the field; values are from the valid enum; the 9 encoded
  bridges are not 'undefined'; the default is in use; the specific
  expected classes are pinned. TDD-strict (RED → GREEN). Net test
  count: 398 → 403 (+5).

### Documentation
- **Part-I §1.3 — replaced vacuous Dimensional Consistency equation (Wave I.B D11).**
  Per Mathematician M-C2 (Wave H paper review). The earlier displayed
  equation `[Π^{αβγδεζ}] = [Π^{α'β'γ'δ'ε'ζ'}] when connected by
  symmetry` was vacuous as a top-level invariant: the multi-index
  labels span genuinely different physical kinds (a Lagrangian density
  and a decoherence rate carry different SI dimensions), and "connected
  by symmetry" does not pick out a unique equivalence class on the
  catalog. The scope-note already conceded the per-equation reading.
  Replaced with a concrete per-bridge property:
  `format(infer(rhs(e))) === e.dimensional_signature` for every entry
  with a non-null signature, machine-checked by the validator and
  pinned by `tests/bridges/dimensional-signature-catalog.test.ts`. No
  code or test changes.
- **Part-I Appendix A — added Notation Glossary for cross-bridge reused symbols (Wave I.B D9).**
  Per Researcher I-6 (Wave H paper review). Symbols `α`, `β`, `γ`, `η`,
  `λ`, `μ`, `ν`, `ρ`, `σ`, `τ`, `φ`, `χ`, `ω`, `ξ`, `ζ`, `Δ`, `Λ`, `κ`
  are reused across BE-11 through BE-50 with distinct per-bridge
  meanings. Added a new "Notation Glossary" appendix at the end of
  Part-I.md listing 49 row-entries covering 18 polyvalent symbols, each
  with bridge ID, per-bridge meaning, and a literature reference. The
  table does not replace per-bridge `where:` clauses (those remain
  authoritative) — its purpose is solely to flag the polyvalence so a
  reader who sees `ξ` in BE-12 and `ξ` in BE-43 has a canonical place
  to confirm they refer to different physical quantities (coherence
  length vs wormhole circumference). Symbols with a single canonical
  meaning across the catalog (`ℏ`, `c`, `G`, `k_B`, `M_P`, `ℓ_P`, etc.)
  are explicitly omitted as unambiguous. No code or test changes.
- **Part-III §VIII — hedged informal `P ⊆ NP ⊆ PSPACE ⊆ TENSOR ⊆ EXPSPACE` complexity chain (Wave I.B D6).**
  Per CS C2 (Wave H paper review). The chain was presented as flat
  without acknowledging that TENSOR is not a formal complexity class
  (no machine model, no completeness reductions, no hardness results).
  Added a hedge paragraph immediately preceding the chain stating that
  TENSOR is illustrative, not formal; that UPT does not define a
  Turing-machine model or hardness reductions for tensor-bridge-equation
  evaluation; and that specific bridge equations have their own
  tractability classes (see Wave I.B D10 `tractability_class` field
  per BE entry — concrete and machine-checked even though TENSOR
  itself is not formalized). No code or test changes.
- **Part-IV §11.2.1 — Gödel→Wolfram irreducibility for the right bridging argument (Wave I.B D5).**
  Per Mathematician M-I (Wave H paper review). The earlier "Plausibility
  argument" invoked Gödel's incompleteness as the bridge from formal
  systems to physical computability — which is the wrong route (Gödel
  applies to consistent r.e. formal systems containing arithmetic and
  concerns derivability of *statements*, not computability of *physical
  quantities*). Rewrote to use **Wolfram computational irreducibility**
  (Wolfram 2002 *A New Kind of Science*; Israeli-Goldenfeld 2004
  *Phys. Rev. Lett.* 92:074105 — year corrected from 2006 to 2004 in
  Wave L Tier F1, per Researcher C2 iter-3) as the correct bridging argument: some
  dynamical systems (chaotic dynamics, RG flows past fixed points,
  generic many-body interactions) admit no closed-form shortcut over
  direct simulation, which is consistent with the framework's
  pervasive use of efficient algorithms (Lindblad / RT / WKB) for
  special cases. No code or test changes.
- **Part-III §VIII.1 Definition 8.1 — corrected mutual-information double-count (Wave I.B D4).**
  Per Mathematician M-I (Wave H paper review). The earlier bound
  `I(Π) ≤ Σ log_2|H_i| + Σ_{i<j} I(H_i:H_j) + Σ_{i<j<k} I(H_i:H_j:H_k)
  + ...` double-counted: it added bivariate, trivariate, etc. mutual
  information *on top of* the marginal-sum bound, but the correct
  canonical form is just the subadditivity inequality
  `I(Π) ≤ Σ_i log_2|H_i|` (Cover-Thomas §2.5, MacKay §2.5). Higher-order
  correlation terms are *deficits* below this bound (the total
  correlation / multi-information), not additive contributions above.
  Replaced the displayed bound and added prose explaining the
  inclusion-exclusion identity for total correlation. No code or test
  changes.
- **Part-IV §12.2.1.1 — promoted validator scope limits from code to spec (Wave I.B D3).**
  Per CS C4 (Wave H paper review). Part-I §IV Algorithm 1 procedures
  `VALIDATE_DIMENSIONS` and `VERIFY_GLOBAL_CONSISTENCY` (and Algorithm 3A
  `VALIDATE_TENSOR_CONSISTENCY`) overpromised: the implementation in
  `src/dimensional/validator.ts` is operator-blind (no quantum
  operators, no tensor index structure, no special-function argument
  checks, no path-integral measures), and only addresses the
  DIMENSIONAL constraint of the four listed
  (DIMENSIONAL/GAUGE/UNITARITY/CORRESPONDENCE). Added a new §12.2.1.1
  "Scope Limitations" subsection that explicitly states what the
  validator validates (scalar AST primitives over SI dimensions),
  what it does NOT validate (quantum operators, tensor indices,
  special-function args, path-integral measures), and references
  `src/dimensional/README.md` §"What's NOT in MVP" as the canonical
  list. No code or test changes.
- **Part-IV §12.2.1 — hedged "Non-Turing Computability" capability claim (Wave I.B D2).**
  Per CS C3 (Wave H paper review). The original bullet "Non-Turing
  Computability: Access to uncomputable functions" contradicted the
  framework's own pervasive use of Lindblad master equations,
  Ryu-Takayanagi prescriptions, WKB integrals, and similar
  Turing-bounded constructions. Removed the bullet and replaced the
  capabilities list with hedged language: UPT's catalog includes
  equations whose closed-form solutions are not algorithmic
  (perturbative-QED divergence, asymptotic series, distributional path
  integrals), but UPT does not claim to compute these; the framework's
  algorithmic surface (dimensional analyzer + bridge-equation catalog)
  is Turing-bounded. Non-algorithmic content is documented per-bridge
  in the `tractability_class` field (introduced in Wave I.B D10). The
  NP-Complete and Quantum-Gravity-Computation bullets are also hedged
  to acknowledge their speculative status. No code or test changes.
- **Part-I §3.2.4 — removed non-universal `C(ρ) ≤ exp(S(ρ))` bound (Wave I.B D1).**
  Per Mathematician M-C3 + CS C5 (Wave H paper review). The bound fails
  for pure states (S = 0 ⇒ exp(0) = 1, but pure states can have
  arbitrarily high circuit complexity — e.g., the output of a hard
  quantum circuit). The replacement `C(ρ) ≤ dim ℋ` is also vacuous when
  `dim ℋ` is infinite. Removed the displayed inequality from the
  fundamental-information-bounds list and replaced with prose noting
  that a general upper bound on circuit complexity in terms of entropy
  is open; operator-norm bounds (Brown-Susskind) and entropy-based
  heuristics give different scalings depending on gate set and circuit
  model. UPT does not commit to a specific bound here. Added
  Brown-Susskind 2018 (arXiv:1706.03788) reference for holographic
  complexity bounds. No code or test changes.

### Changed
- **BE-26 polymerase-fidelity gap registered as known_issue (Wave I.B C6).**
  Per Evo Biologist IMP-1 + IMP-2 (Wave H paper review). The BE-26 WKB
  tunneling formula `Γ = ν_0 · exp(-WKB) · f(T, pH, EM)` was tagged
  `established` (the WKB form is canonical), but the bare WKB rate with
  reasonable barrier parameters overshoots observed DNA mutation rates
  (~10⁻⁸-10⁻¹⁰ /bp/replication) by 2-4 orders of magnitude. The
  `f(T, pH, EM)` prefactor — labeled in the AST module as "Q10 × pH ×
  EM-perturbation" — silently absorbs the dominant biological-mechanism
  corrections (polymerase proofreading ~10⁻⁵, mismatch repair ~10²)
  without naming them. Added a `phenomenological-ansatz` /
  `reformulation`-fixable known_issue describing the gap, prescribing
  two defensible paths: factor `f = f_proofreading × f_repair ×
  f_environment` explicitly, or replace tunneling-as-mutation-mechanism
  with the mainstream polymerase-fidelity model in which
  tunneling-induced tautomers are one error source dominated by
  polymerase mistakes and corrected by repair. Updated
  `src/bridges/index.ts` BE-26 (`known_issues`), Part-II.md spec body
  Status block, and the `src/bridges/equations/be-26-dna-tunneling.ts`
  JSDoc. The `established` status is preserved (WKB is canonical); the
  framing gap is tagged at the `known_issues` level. No code changes.
- **BE-38 reformulated to canonical Milgrom MOND interpolation μ(x) = x/√(1+x²) (Wave I.B C4).**
  Per Physicist I12 (Wave H paper review). The original
  `F = F_N[1 + α√(a₀/a) tanh(√(a/a₀))]` interpolation failed the deep-MOND
  limit: in the `a → 0` limit `tanh(√(a/a₀)) ≈ √(a/a₀)`, so the bracket
  becomes `1 + α` (Newtonian), not the required `√(F_N a₀)`. Replaced
  with the canonical Milgrom 1983 (*Astrophys. J.* 270:365) MOND
  interpolation `μ(x) = x/√(1+x²)`, `x = a/a₀`, which recovers Newtonian
  scaling for `a >> a₀` and deep-MOND scaling `F → √(F_N a₀)` for
  `a << a₀` by construction. The Verlinde 2016 mass-correction variant
  (arXiv:1611.02269) and TeVeS relativistic completion (Bekenstein 2004)
  are non-equivalent reformulation paths and are documented in
  `references[]` for future work. Updated `src/bridges/index.ts` BE-38
  (`formula_latex`, `known_issues`, `notes`) and Part-II.md spec body.
  The R2-gap-spec block is replaced with a per-bridge phenomenological-
  ansatz issue that flags MOND as empirically motivated (rotation-curve
  fits) but lacking first-principles derivation. Per Wave-G honest-
  archaeology precedent, the obsolete `tests/bridges/be-38-r2-spec.test.ts`
  is deleted and replaced by `tests/bridges/be-38-reformulation.test.ts`
  (8 tests). Net test count: 395 → 398 (+3).
- **BE-31 reformulated to canonical Benincasa-Dowker d=4 form (Wave I.B C3).**
  Per Mathematician M-I + Physicist I9 (Wave H paper review). The
  original `R = (2/√π)(N/V^{2/4} - k_1 - k_2(ρ²ℓ_P⁴)^{1/4})` form had
  both a `V^{2/4}→V^{1/2}` typo and a dimensional mismatch in the
  `(ρ²ℓ_P⁴)^{1/4}` term against Ricci-scalar dimensions `[L^{-2}]`, and
  was not derivable from any standard causal-set construction. Replaced
  with the canonical Benincasa-Dowker 2010 (*Phys. Rev. Lett.*
  104:181301; arXiv:1001.2725) d=4 inclusion-exclusion formula:
  `R(p) = (4/√6) ℓ_P^{-2} [1 + N_0(p) - 9 N_1(p) + 16 N_2(p) - 8 N_3(p)]`,
  where `N_k(p)` counts causal-set inclusive intervals of cardinality
  `k+2` below `p`. The earlier R2-gap-spec block proposed a
  `/⟨n(p)⟩`-divided variant which is incorrect; the published BD form is
  additive (no sprinkling-density division). Status remains
  *speculative* — the d≠4 generalization requires re-deriving
  coefficients, and the bridge-equation framing (causal sets as UPT
  microstructure) is original to this catalog. Updated
  `src/bridges/index.ts` BE-31 (`formula_latex`, `known_issues`,
  `notes`) and Part-II.md spec body. The R1→R2-tier `dimensional`
  known_issue is replaced with a `phenomenological-ansatz`
  known_issue tagged for the framing, not the math. Per the Wave-G
  honest-archaeology precedent (BE-37 R3), the obsolete R2-pin tests
  `tests/bridges/be-31-{preserve,r2-spec}.test.ts` are deleted and
  replaced by `tests/bridges/be-31-reformulation.test.ts` (8 tests
  verifying the new canonical form). Net test count: 398 → 395 (−3).
- **BE-21 dimensional signature sign — `[L]^{2Δ−d}` → `[L]^{d−2Δ}` (Wave I.B C2a).**
  Per Mathematician M-C4 (Wave H paper review). The Part-II spec stated
  `[G_R] = [L]^{2Δ−d}`, which is the exponent of the *bulk-radial factor*
  `r^{2Δ−d}` that appears in the limit recipe — not the dimension of the
  result `G_R(ω,k)` itself. The canonical momentum-space convention is
  `[L]^{d−2Δ}`: the two-point function `⟨O(x)O(0)⟩_R ~ |x|^{−2Δ}` has
  dim `[L]^{−2Δ}`, and Fourier-transforming with d-dimensional measure
  `dt d^{d−1}x` (dim `[L]^d`) gives `G_R(ω,k)` dim `[L]^{d−2Δ}`. Updated
  Part-II spec body; BE-21 in `src/bridges/index.ts` has
  `dimensional_signature: null` (no AST module), so no round-trip test is
  involved. `notes` field expanded to record the sign correction. No
  test changes.
- **BE-19 ρ_crit reformulated to canonical Ashtekar-Pawlowski-Singh form (Wave I.B C1).**
  Per Physicist I4 (Wave H paper review), the BE-19 critical density was
  stated as `ρ_crit = 3c²/(8πGℓ_P²) ≈ 6.2×10⁹⁵ kg/m³` — a dimensional
  estimate omitting the Barbero-Immirzi γ³ factor that appears in the
  canonical Loop Quantum Cosmology derivation. Replaced with the
  Ashtekar-Pawlowski-Singh form `ρ_crit = (√3/(16π²γ³ℓ_P²))·(c²/G)`
  (Ashtekar-Pawlowski-Singh 2006 *Phys. Rev. D* 74:084003,
  arXiv:gr-qc/0607039), which uses the Barbero-Immirzi parameter γ ≈
  0.2375 (Meissner 2004 *Class. Quantum Grav.* 21:5245,
  arXiv:gr-qc/0407052, fixed by black-hole-entropy matching) and yields
  the canonical literature value cited as `≈ 0.41 ρ_Planck ≈ 2.1×10⁹⁶
  kg/m³` (Ashtekar-Singh review arXiv:1108.0893). Updated `formula_latex`
  and Part-I.md spec body. The prior `phenomenological-ansatz`
  known_issue documenting this discrepancy is removed (issue resolved by
  promotion into the canonical formula). References array gained the
  APS and Meissner papers. The AST module BE-19 takes ρ_crit as a free
  numerical input, so the formula change does not require re-encoding;
  the existing test that pinned the deprecated form's numerical value
  has been retitled "PINS deprecated spec form" and a parallel
  "PINS canonical APS form" test has been added (398 tests, +1).
- **BE-50 attribution corrected — Wheeler-Feynman absorber theory
  primary (Wave I.A C5).** Per Physicist I17 (Wave H paper review),
  BE-50 (Retrocausal Quantum Field Theory) was attributed to
  Cramer / Aharonov-Vaidman, but the Wheeler-Feynman absorber-theory
  attribution is more accurate for the Lagrangian form
  `L_forward(φ_+) + L_backward(φ_-)`. Updated `references[]` and the
  Part-II.md status block: Wheeler-Feynman 1945 *Rev. Mod. Phys.*
  17:157 is now the primary reference; Wheeler-Feynman 1949
  *Rev. Mod. Phys.* 21:425 added as the canonical companion paper;
  Cramer 1986 *Rev. Mod. Phys.* 58:647 retained as a secondary modern
  reference (the standard prose lineage from Wheeler-Feynman). The
  Aharonov-Vaidman two-state vector formalism is *removed* because it
  is a separate retrodictive-measurement formalism over standard QM,
  not a retrocausal QFT, and is not load-bearing for the action here.
  The novel `λ φ_+ φ_- δ^4(x - x_m)` coupling term remains marked as
  original to this framework. No code or test changes.
- **BE-21 citation correction — Son-Starinets vs Policastro-Son-Starinets
  disambiguated (Wave I.A C2b; venue corrected Wave J Tier C1+C2 2026-05-05).**
  Per Researcher I-1 (Wave H paper review), `arXiv:hep-th/0205052` resolves to
  *Policastro, Son & Starinets* "From AdS/CFT correspondence to hydrodynamics"
  *JHEP* 0209:043 (three-author), but the BE-21 prose attributed it to "Son and
  Starinets 2002" (two-author). The substantive content of BE-21 — the explicit
  retarded-Green's-function recipe `G_R = -i lim r^{2Δ-d} (g^rr/√g^tt) ∂_r φ /
  φ_0` — is the canonical recipe from *Son & Starinets* 2002 *JHEP* 0209:042
  (arXiv:hep-th/0205051), the genuine two-author paper. Decision: change the
  arXiv ID (0205052 → 0205051) and keep "Son and Starinets" attribution in the
  prose; preserve the companion 0205052 paper as a secondary reference (it
  applies the same recipe to hydrodynamics). **Venue corrected 2026-05-05 (Wave
  J Tier C1, per Researcher iter-2 95% conf):** the Wave I.A pass mistakenly
  recorded the venue as *Phys. Rev. D* 65:104021; verification against the
  arXiv abstract page confirms the actual venue is *JHEP* 0209:042. Iqbal-Liu
  year corrected 2008 → 2009 (Wave J Tier C2): arXiv 0903.2596 is March 2009
  and *Fortsch. Phys.* 57 is a 2009 volume. Updated `src/bridges/index.ts`
  BE-21 entry (`references[]`) and the Part-II.md status block. No code or
  test changes.
- **BE-24 `references[]` expanded (Wave I.A E4).** Per Evo Biologist
  IMP-3 (Wave H paper review), BE-24 (Quantum Coherence in
  Photosynthesis Efficiency) cited the Cao 2020 *Sci. Adv.* consensus
  update but was missing two key entries in the literature trail:
  Thyrhaug et al. 2018 *Nat. Chem.* 10:780 (the FMO 2D-spectroscopy
  reinterpretation that reassigns long-lived oscillations to
  vibrational rather than electronic coherence) and Wilkins & Dattani
  2015 *J. Chem. Theory Comput.* 11:3411 (HEOM benchmarking that
  constrains electronic-coherence-lifetime claims). Both appended to
  the existing 6-entry list. No code or test changes.
- **BE-28 `references[]` populated (Wave I.A E3).** Per Researcher I-5
  (Wave H paper review), BE-28 (Maximum Entropy Production Principle)
  shipped with empty `references[]` despite the Part-II prose body
  citing Dewar 2003/2005, the Grinstein-Linsker 2007 rebuttal, and
  Prigogine's contrasting minimum-entropy-production principle. Added
  full citations for all four. No code or test changes.
- **BE-26 `references[]` populated (Wave I.A E2).** Per Researcher I-4
  and Evo Biologist IMP-2 (Wave H paper review), BE-26 (DNA Mutation —
  Quantum Tunneling Rate) shipped with empty `references[]` despite
  the `notes` field naming Gamow 1928 and Landau-Lifshitz §50 as the
  WKB sources and Löwdin 1963 being the canonical biological
  application. Populated with: Gamow 1928 *Z. Phys.* 51:204 (alpha-decay
  tunneling), Löwdin 1963 *Rev. Mod. Phys.* 35:724 (proton tunneling in
  DNA H-bonds), Landau-Lifshitz QM §50 (canonical WKB), and Lujan,
  Williams & Kunkel 2016 *Cold Spring Harb. Perspect. Biol.* 8:a019745
  (replication-error fidelity / polymerase proofreading + MMR — the
  competing classical-error pathway flagged by Evo Biologist IMP-2 as
  a missing review). No code or test changes.
- **BE-25 `references[]` populated (Wave I.A E1).** Per Researcher I-3
  and Neurologist C-2 (Wave H paper review), `BRIDGE_EQUATIONS[N=25]`
  shipped with `references: ['arXiv:quant-ph/9907009']` (Tegmark only)
  despite the Part-II prose body citing Penrose-Hameroff and the
  Neurologist flagging Reimers/McKemmish 2009 as mandatory follow-ups
  to Tegmark. Added Penrose & Hameroff 1996 *Math. Comput. Simul.*
  40:453 (original Orch-OR proposal), upgraded the Tegmark entry to a
  full citation, and added Reimers et al. 2009 *PNAS* 106:4219
  (Fröhlich-condensate critique) and McKemmish et al. 2009 *Phys. Rev.
  E* 80:021912 (consolidated biological-feasibility critique). No code
  or test changes.

### Documentation
- **Part-VI BEs-with-issues count corrected from actual catalog (Wave
  I.A D12).** Per Mathematician M-I (Wave H paper review), Part-VI's
  conclusion section under-counted entries with open issues. Verified
  the actual count by walking `src/bridges/index.ts` for non-empty
  `known_issues[]` arrays: 27 entries (BE 12, 13, 15, 16, 17, 20,
  22, 23, 24, 25, 26, 27, 29, 30, 31, 33, 34, 36, 37, 38, 39, 42, 43, 45,
  46, 49, 50; updated Wave J Tier C3 2026-05-05: BE-19 → BE-26 — Wave
  I.B C1 emptied BE-19, Wave I.B C6 added polymerase-fidelity issue to
  BE-26; **further updated Wave L Tier F2 2026-05-05 per Researcher
  C1 iter-3:** count corrected 26 → 27 — BE-29 was previously missed,
  it carries a Wave J Tier D4 known_issue and should appear in the
  list). Both the §"What remains to be done" bullet and the "Framework
  Statistics" trailer updated 24 → 26 (Wave I.A D12) and now 26 → 27
  (Wave L Tier F2) with the corrected ID list and a sentence pinning
  where the count came from. The prior list reflected a pre-Wave-G
  snapshot before R0/R1 fixes promoted BE-11/18/29/47 to R5 and R4
  narrative-only concerns were extracted into structured records.
- **Part-V §21.2 "DNA Repair" → "DNA Mutation" framing reversal (Wave
  I.A D8).** Per Evo Biologist MIN-3 (Wave H paper review), the
  Quantum-Biology-Therapeutics bullet under Part-V §21.2.1 read "DNA
  Repair Enhancement: Quantum tunneling optimization" — but BE-26's
  mechanism is mutation, not repair. Tunneling produces tautomeric
  base-pair errors; it does not repair them. Bullet retitled "DNA
  Mutation Rate" with body rewritten to clarify tunneling drives
  mutation with WKB rate competitive against polymerase proofreading
  and mismatch-repair fidelity. The §21.2 caveat block's parallel quote
  list updated correspondingly ("DNA repair enhancement" →
  "DNA mutation-rate modulation"). No code or test changes.
- **BE-39 LaTeX line-break fix (Wave I.A D7).** `formula_latex` in
  `src/bridges/index.ts` BE-39 (Asymptotic Safety) and the corresponding
  rendered-formula block in `docs/specification/Part-II.md` had a single
  backslash (`\`) between the `β_g` and `β_λ` lines of the
  `\begin{align}...\end{align}` block instead of the required double
  backslash (`\\`) line break. Without the line break the renderer
  collapses the two lines into one, garbling the output. Fixed in both
  the index entry's escaped-string source (`\\\\` in TS template literal
  → `\\` in rendered LaTeX) and the spec markdown's URL-encoded SVG src
  (`%5C` → `%5C%5C`) plus alt-text. No code or test changes.
- **Tracker housekeeping (Wave I.A F1+F2).** CHANGELOG line 211 corrected
  from "6 of 40 entries with `dimensional_signature` populated" to
  "12 of 40" — the actual count at HEAD (BE-11, 14, 18, 19, 22, 25, 26,
  29, 34, 41, 47, 48), verified via `grep -c "dimensional_signature: \`"
  src/bridges/index.ts`. `docs/planning/Bridge-Remediation-Plan.md` R5
  list at line 266 expanded from 8 to 12 entries — the summary table
  already claimed 12, but the explicit re-list omitted the 4 bridges
  whose R0/R1 fixes had promoted them to R5 (BE-11 from R0,
  BE-18/29/47 from R1). Cross-references to R0/R1 fix-history blocks
  added so the audit trail is contiguous. No code or test changes.

### Added
- **Orphan `dimensional_signature` catalog invariant test (TA-F1, Wave G QC).** New `tests/bridges/orphan-dimensional-signature.test.ts` enforces a dual invariant: every entry whose `dimensional_signature` is non-null must EITHER (a) have a registered AST module in `dimensional-signature-catalog.test.ts` or (b) appear in the explicit `ORPHAN_DIMENSIONAL_SIGNATURES` allowlist `{18, 29, 48}`. The round-trip catalog test only iterates entries with AST modules, so a typo or accidental revert of an orphan signature was previously silently uncovered (BE-18 `[L^8 M^4 T^-8]`, BE-29 `[energy]`, BE-48 `[frequency]`). Test pins each orphan's exact signature, asserts no double-coverage between the encoded and orphan sets, and provides an `uncovered` diagnostic that names the offending id when a contributor adds a new `dimensional_signature` without registering or orphan-listing it.

### Changed
- **BE-22 `known_issue` severity retagged 'phenomenological-ansatz' → 'other' (CR-F4, Wave G QC).** The post-reformulation BE-22 `KnownIssue` framed the residual gap as `phenomenological-ansatz`, but the Kitaev-Preskill formula itself is canonical (not an ansatz) — the issue is the *QG-link framing* (which gravitational degree of freedom the boundary R bounds is unspecified). `'other'` is the closest correct fit from the existing `BridgeIssueSeverity` enum (`'self-refuting' | 'dimensional' | 'index-structure' | 'sign' | 'undefined-quantity' | 'phenomenological-ansatz' | 'other'`). Single-token edit to `src/bridges/index.ts` BE-22 entry; explanatory inline comment added describing the rationale. No test pinned the prior severity, so no test changes were required.
- **BE-34 (Kibble-Zurek) dimensional gap promoted from prose-in-`notes` to structured `KnownIssue` (CR-F2, Wave G QC).** The Part-II spec markdown documents that the LHS `n_defect` should have dim `[L]^(-d)` (defects per unit d-volume), not `DIMENSIONLESS` — the canonical Kibble-Zurek form is `n ~ ξ^(-d)` and a microscopic length scale (e.g. lattice spacing `a`) must appear as a `1/a^d` prefactor. BE-19 (Barbero-Immirzi γ³) and BE-25 (spurious Δx/ℓ_P) carry their gaps as `KnownIssue` entries; BE-34 was not symmetric — the prose lived only in `notes`. Added `severity: 'dimensional'`, `fixable: 'reformulation'` `KnownIssue` to BE-34 in `src/bridges/index.ts`. Updated `src/bridges/equations/be-34-kibble-zurek.ts` JSDoc to reference the new structured entry. New BE-34 test asserts `known_issues` carries at least one `dimensional` entry whose description references both `[L]^(-d)` and the `1/a^d` prefactor — string-checked so a casual edit that loses the substantive content fails the test.

### Refactored
- **BE-19 module imports cleaned (SIMP-F1 / CR-F3, Wave G QC).** `MASS` was imported from `dimensional/types.js` but never referenced in `src/bridges/equations/be-19-quantum-bounce.ts`. `LENGTH` was kept alive only by a `void LENGTH;` "speculative-future" marker — Karpathy's "no speculative abstractions" rule says delete it (`git log` carries the rationale if a future contributor needs the alternative encoding). Both imports removed; the `void LENGTH;` line replaced with a one-paragraph comment explaining the c²-rescaled Λ convention (Ryden 2nd ed. §6, Eq. 6.32) and the path to re-add LENGTH if a future encoding wants raw `Λ_[L^-2]` form. Pure cleanup — no behavior change.
- **`DimensionValidationReport` lifted from 9 byte-identical copies into `src/dimensional/validator.ts` (SIMP-F2, Wave G QC).** The shared interface (`{ ok, lhsDim, rhsDim }`) was previously redeclared identically in BE-11, BE-14, BE-19, BE-22, BE-25, BE-26, BE-34, BE-41, BE-47. Per Karpathy: single semantic meaning + 9 consumers + future encodings will use it = clean extraction. Each module now imports the type from `validator.js` (alongside `ExprNode`); the local declaration is deleted. Pure structural change — no behavior delta. Test count unchanged (396).

### Fixed (tests)
- **BE-22 Fibonacci anyon test: vacuous self-comparison replaced with cross-derivation (TA-F2, Wave G QC).** The Fibonacci anyon γ test in `tests/bridges/be-22-encoding.test.ts` previously asserted `gamma_fib.toBeCloseTo(0.6429653906383268, 12)` where the literal IS the IEEE-754 output of the JS expression `0.5 * Math.log(1 + phi*phi)` — a tautology. Replaced with two independent algebraic derivations that exercise different floating-point paths: Route A `0.5 · log(1 + φ²)` (direct) and Route B `0.5 · log((5+√5)/2)` (using φ² = φ + 1 from the Fibonacci recurrence). The new cross-check `expect(routeA).toBeCloseTo(routeB, 14)` catches an algebraic typo (e.g., `φ² = 2φ` would land routes ~0.08 apart), where the previous self-comparison passed vacuously. The literal pin is preserved as a historical anchor at digit 12 against `routeB`.

### Fixed
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended for the 7 new Wave-1 / Wave-2 AST encodings (CR-F1, Wave G QC).** The cross-check map in `src/dimensional/bridge-check.ts` was previously only seeded with `[11, FREQUENCY], [14, ENTROPY]`; Wave-1 added BE-19, 25, 26, 34, 41, 47 and Wave-2 added BE-22 without registering the expected dim, so `inferDimensionForBridge(id, expr)` silently fell through for 7 of 9 registered encodings. Added entries: BE-19 → `[T^-2]`, BE-22 → `DIMENSIONLESS`, BE-25 → `TIME`, BE-26 → `FREQUENCY`, BE-34 → `DIMENSIONLESS`, BE-41 → `MASS`, BE-47 → `[L^-3 T^-1]`. The bracketed-product entries (BE-19, BE-47) use ad-hoc `Dimension` literals constructed via `multiply` / `power`. New tests in `tests/dimensional/bridge-check.test.ts` cover each new id (correct AST returns the expected dim; deliberately-wrong AST returns `null`) plus a size-floor guard pinning the map to 9 entries so future encodings cannot land without a corresponding row.

### Changed
- **BE-22 (Topological Entanglement Entropy — QG Link) reformulated to canonical Kitaev-Preskill / Levin-Wen form (R2 → R5-leaning, 2026-05-05).** Replaced the originally-stated three-term form `S_topo = -γ + α log(ξ/a) + β(T/T_c)^ν log(A/ℓ_P²)` — which had area-law-doubled and finite-T extension issues and was not derivable from any standard TEE construction — with the canonical single-subsystem form `S(R) = α L(R) − γ + O(L^-1)` (Kitaev-Preskill 2006 *Phys. Rev. Lett.* 96:110404, arXiv:hep-th/0510092; Levin-Wen 2006 *Phys. Rev. Lett.* 96:110405, arXiv:cond-mat/0510613). `dimensional_signature` populated `[1]` (dimensionless entropy in nats). `known_issues` collapsed from two `spec-edit` entries to one `phenomenological-ansatz` / `reformulation` entry that documents the remaining QG-link gap. References added (Kitaev-Preskill, Levin-Wen). Status remains `speculative` — the formula itself is established, but the "QG link" framing is original to this catalog and not in either reference. Spec section in `docs/specification/Part-II.md` updated with the new formula and an AST-encoding callout.
- **BE-37 (Variable Speed of Light Cosmology) status: speculative → invalid (R3 disposition, 2026-05-05).** Daniel accepted the Wave-2 disposition brief's recommendation. Two independent obstructions block reformulation: (1) Ellis-Uzan 2005 operational-meaninglessness critique (arXiv:gr-qc/0305099) — bare c(t) has no falsifiable content without specifying which c varies and which dimensionless constant ratio is changing; (2) the three canonical VSL formulations (Albrecht-Magueijo, Moffat, Barrow) are non-equivalent and none cleanly survives the Ellis-Uzan critique. Original c(t) ansatz preserved as historical record. Two known_issues with `fixable: 'unfixable-must-mark-invalid'` (`src/bridges/index.ts`). Spec section in `docs/specification/Part-II.md` and `docs/planning/Bridge-Remediation-Plan.md` updated. Replaces obsolete R2-pin tests `tests/bridges/be-37-{preserve,r2-spec}.test.ts` (deleted) with `tests/bridges/be-37-r3-disposition.test.ts` (added). Honest-archaeology pattern: disposition change requires deleting the prior pins, making the choice explicit.

### Documentation
- v0.1.0 release procedure runbook at `docs/planning/v0.1.0-Release-Procedure.md`. Documents trigger conditions, pre-cut checklist, the cut steps (CHANGELOG rename, version confirm, tag, push), post-cut tasks, and explicit anti-patterns ("do not cut because package.json already reads 0.1.0," "do not pre-write release notes"). Current-readiness section notes mechanical readiness is in place after BE-22 lands; the cut decision is the project owner's.
- BE-37 VSL Disposition Brief at `docs/planning/BE-37-VSL-Disposition-Brief.md`.
  Synthesizes the Ellis-Uzan critique (`Am. J. Phys.` 73:240, 2005;
  arXiv:gr-qc/0305099) against varying-c cosmologies and compares to the
  current BE-37 ansatz `c(t) = c_0[1 + ε(t/t_P)^n exp(-t/t_c)]`.
  Recommended call: **R3 (mark-invalid) with confidence 60**, but framed
  as a recommendation, not a decision. Brief unblocks task #98 (pending
  since Wave F). WebFetch returned only the paper abstract; the body
  argument is reconstructed from background knowledge with an explicit
  honest-claude verification flag for Daniel.
- Documented the dimensionless-stub convention for transcendental
  functions in `src/dimensional/README.md`. The AST has no `exp`/`log`/
  `sin`/etc. primitives; the convention is: encode `f · exp(arg)` as
  `f · ε` (ε a `DIMENSIONLESS` symbol), expose `arg` as a separate
  ExprNode named `<MODULE>_<FN>_ARG`, and add a lemma test asserting
  the argument is dimensionless. Used in BE-26 (`WKB_ARG`),
  BE-34 (`EXP_ARG`), BE-41 (`EXP_ARG`). Renamed two test descriptions
  ("WKB exponent..." and "Boltzmann arg...") to the canonical
  `'exp argument ... is dimensionless (lemma)'` form so the lemma
  anchor is grep-discoverable.

### Changed
- Spec ↔ AST cross-references (Wave-2 Phase B): each of the 8
  AST-encoded bridge modules (BE-11, 14, 19, 25, 26, 34, 41, 47) now
  carries `@see` JSDoc lines pointing to the relevant
  `docs/specification/Part-{I,II}.md` section and to the
  `BRIDGE_EQUATIONS` index entry. Each corresponding spec section
  carries a callout block linking back to the module file. The
  `src/bridges/README.md` now lists all 8 encoded bridges in a
  status/signature/module table with a pointer to the Tier-5 triage
  memo for the rest. 16 cross-references in total (8 bridges × 2
  directions).

### Added
- BE-22 (Topological Entanglement Entropy / Kitaev-Preskill) AST encoding at
  `src/bridges/equations/be-22-topological-entanglement.ts`. Encodes
  `S(R) = α · L(R) − γ` with α as a symbol of dim `[L^-1]`, L as dim
  `[L]`, and γ as `DIMENSIONLESS`; the `+ O(L^-1)` finite-size
  correction is dropped per encoding scope. `BE22_AREA_TERM` and
  `BE22_TOPOLOGICAL_TERM` are exposed as separate ExprNodes for
  per-term dimensional verification (both infer to `DIMENSIONLESS`).
  Numerical evaluator with bracket-checks: Z₂ toric code identity
  (γ = log 2, S = −log 2 to 1e-12); Fibonacci anyon γ = (1/2) log(1+φ²)
  ≈ 0.6429653906 hand-computed and pinned; perimeter linearity
  identity `S(2L) − S(L) = α·L` swept across 5 L values; γ-additivity
  identity. Status pinned `speculative` (the formula is established;
  the QG-link framing remains original). `dimensional_signature` set
  to `[1]`. New test file at `tests/bridges/be-22-encoding.test.ts`.
- BE-47 property tests (Wave-2 hardening): rate-balance condition (SM
  source = dark sink → dY/dt = -3HY) pinned to 1e-12; per-coupling
  linearity (dY/dt linear in <σv>_SM, <σv>_dark, ε) verified by three
  independent doubling tests; quadratic n_χ-scaling identity over 5 α
  values; Hubble-drag 10-point monotonic-decrease sweep. 4 new tests
  added to `tests/bridges/be-47-encoding.test.ts` (13 → 17).
- BE-41 property tests (Wave-2 hardening): pin second e-fold
  m(φ₀ + 2M_P/α) = m₀·e⁻² and fifth e-fold m₀·e⁻⁵; multiplicative
  e-fold-ratio identity m_{n+1}/m_n = 1/e across 6 consecutive folds;
  dense 10-point monotonic decrease sweep; α-rescaling identity
  m(α=2,Δφ=L) = m(α=1,Δφ=2L) over 5 L values. 5 new tests added to
  `tests/bridges/be-41-encoding.test.ts` (15 → 20).
- BE-34 property tests (Wave-2 hardening): scaling-power identity
  n(α·τ_Q)/n(τ_Q) = α^(-dν/(1+zν)) verified at d=ν=z=1 (α^(-1/2)) over
  6 α values and at d=3, ν=z=1 (α^(-3/2)) over 5 α values, both pinned
  to 1e-12 relative; Boltzmann factorization identity n(m,T)/n(0,T) =
  exp(-mc²/k_BT) verified across 3 masses to 1e-10; 10-point dense
  monotonicity sweep in τ_Q. 4 new tests added to
  `tests/bridges/be-34-encoding.test.ts` (16 → 20).
- BE-26 property tests (Wave-2 hardening): exact barrier-collapse
  identity (V → E → Γ = ν₀ · f) over 4 f values, exponential-decay
  ratio identity Γ(2L)/Γ(L) = exp(−(2/ℏ)pL) over 5 barrier widths
  (pinned to 1e-10 relative), and dense 10-point monotonicity sweeps
  in both V−E and barrier_width. 4 new tests added to
  `tests/bridges/be-26-encoding.test.ts` (17 → 21).
- BE-25 property tests (Wave-2 hardening): divergence sweeps for Δm → 0
  and Δx → 0 (6-point monotonic strict-growth each), pure-inverse
  identity sweeps for both Δm and Δx (8 log-spaced points each, ratio
  pinned to 1e-12 relative), and a `PINS spec known_issue` test that
  compares t_OR_spec vs. the naive Penrose self-energy form
  ℏΔx/(G(Δm)²) to make the spurious Δx/ℓ_P factor's effect explicit.
  5 new tests added to `tests/bridges/be-25-encoding.test.ts` (13 → 18).
- BE-19 property tests (Wave-2 hardening): dense-sweep monotonicity of
  H²/ρ over 10 log-spaced ρ values, machine-precision pinning of the
  classical Friedmann limit (ρ → 0, Λ = 0 → H² = (8πG/3)ρ to 1e-15
  relative), exact bounce-halt identity (ρ = ρ_crit, Λ = 0 → H² = 0),
  bounce-factor ratio identity α(2−α) over 6 α values, Λ-additivity
  superposition test over 5 Λ values, and a `PINS spec known_issue` test
  that nails down the spec's ρ_crit = 3c²/(8πG ℓ_P²) value (~6.15e95
  kg/m³) so a deliberate edit is required before promotion. 5 new
  tests added to `tests/bridges/be-19-encoding.test.ts` (14 → 19).
- BE-47 (BBN Dark-Sector-Coupling Boltzmann ODE) AST encoding at
  `src/bridges/equations/be-47-bbn-dark-sector.ts`. Full ODE encoded
  `dY/dt + 3HY = ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε_transfer` with
  every term (dY/dt, 3HY, SM source, dark sink) exposed as a separate
  ExprNode and per-term dim verified `[L^-3 T^-1]`. Numerical evaluator
  with bracket-checks for pure Hubble dilution, pure SM source, pure
  dark sink, and full balance (dY/dt = 0). Status pinned `speculative`
  (base form canonical Kolb-Turner; dark-sector term is the unverified
  extension). `dimensional_signature` was already `[L^-3 T^-1]` (R1
  hand-encoded); the AST now backs it.
- BE-26 (DNA Mutation Quantum Tunneling Rate / WKB) AST encoding at
  `src/bridges/equations/be-26-dna-tunneling.ts`. Encodes
  `Γ = ν₀ exp[−(2/ℏ)∫√(2m(V−E))dx] · f(T,pH,EM)`. The WKB exponent is
  fully encoded via the AST `integral` primitive with `^` of 0.5 for the
  square root, exposed as `DNA_TUNNELING_WKB_ARG` and verified
  dimensionless via lemma test. Bracket-check with proton mass / 0.4 eV
  barrier / 1 Å width gives Γ ~ 10 /s — squarely in the textbook
  10^-3 to 10^3 /s range for hydrogen-bond proton transfer (Löwdin 1963;
  Gamow 1928; Landau-Lifshitz QM §50). Status pinned `established`.
  `dimensional_signature` set to `[frequency]`.
- BE-34 (Kibble-Zurek Mechanism in Curved Spacetime) AST encoding at
  `src/bridges/equations/be-34-kibble-zurek.ts`. Encodes
  `n_defect = (τ_Q/τ_0)^(−dν/(1+zν)) · exp(−m c²/(k_B T_reh))` with a
  canonical (d=ν=z=1) numeric exponent for the AST `^` op (dimensional
  answer is exponent-agnostic). Boltzmann argument exposed as
  `KIBBLE_ZUREK_EXP_ARG` and verified dimensionless. Numerical evaluator
  with bracket-checks: τ_Q=τ_0 → n=1, slow-quench scaling, hand-computed
  τ_Q=10 case (n=10^-1.5). Status pinned `established`.
  `dimensional_signature` set to `[1]`.
- BE-41 (Swampland Distance Conjecture) AST encoding at
  `src/bridges/equations/be-41-swampland.ts`. Encodes
  `m(φ) = m₀ · exp(−α|φ−φ₀|/M_P)` as `m₀ · ε` where ε is a dimensionless
  symbol stub for the exp factor (the AST has no `exp` primitive); the
  exp argument is exposed separately as `SWAMPLAND_EXP_ARG` and verified
  dimensionless via a lemma test. Numerical evaluator with bracket-checks
  (φ = φ₀ → m₀ identity, φ → ∞ tower descent, |φ−φ₀| = M_P/α → m₀/e).
  Status pinned `speculative`. `dimensional_signature` set to `[mass]`.
- BE-25 (Penrose-Hameroff Orch-OR collapse time) AST encoding at
  `src/bridges/equations/be-25-orch-or.ts`. Encodes the spec-as-written
  scalar identity `t_OR = ℏ ℓ_P / (Δm c² Δx)`, with numerical evaluator
  and bracket-checks. Status pinned `highly-speculative`; the
  documented spec issue (spurious Δx/ℓ_P factor vs. Penrose's
  E_G ~ G(Δm)²/Δx) is preserved unchanged. `dimensional_signature` set
  to `[time]`.
- BE-19 (Quantum Bounce / LQC modified Friedmann) AST encoding at
  `src/bridges/equations/be-19-quantum-bounce.ts`. Encodes
  `H² = (8πG/3)ρ(1 − ρ/ρ_crit) + Λ/3` as a scalar relation, with
  numerical evaluator and bracket-checks against ρ = ρ_crit (→ Λ/3 limit)
  and ρ << ρ_crit, Λ = 0 (→ classical Friedmann limit). Status pinned
  `speculative`; the spec issue (ρ_crit vs canonical Ashtekar-Singh value
  with Barbero-Immirzi γ factor) is preserved unchanged.
  `dimensional_signature` set to `[T^-2]`.
- `tests/bridges/dimensional-signature-catalog.test.ts` — catalog-wide
  invariant test: every BE entry whose AST RHS is encoded in
  `src/bridges/equations/` must round-trip through the dimensional
  analyzer back to the registered `dimensional_signature` string.
  Currently covers BE-11 and BE-14; auto-extends as Tier-5 AST encodings
  land (test-analyzer F12).
- `isActiveStatus(status)` typed predicate exported from
  `src/bridges/index.ts`. Returns `true` for `established | speculative
  | highly-speculative`, `false` for `invalid`. Use as
  `BRIDGE_EQUATIONS.filter((e) => isActiveStatus(e.status))` to exclude
  deprecated/self-refuting entries (BE-16 today) from active-research
  summaries (type-design Critical-Hole).
- Catalog-level R2 invariant: any entry whose `notes` contains a "What
  would unblock a real fix" block has only `reformulation`-fixable
  known issues and is not `'established'` (test-analyzer F5).
- Catalog-level cross-field invariant: `status: 'invalid'` ⇔ ≥1
  `known_issue` with `fixable: 'unfixable-must-mark-invalid'`
  (type-design F-02).
- `tests/bridges/spec-vs-index.test.ts` — closes the spec↔index drift
  gap. For each entry whose `notes` advertise a "Corrected on
  YYYY-MM-DD" or "R2 reformulation gap" block, parses the spec
  markdown section and asserts the corresponding marker appears there
  too. Catches the class of bug where a contributor updates the spec
  but forgets the index, or vice versa (test-analyzer F4).

### Changed
- `inferDimensionForBridge(bridgeId, expr)` now consults the new
  `EXPECTED_DIMENSION_BY_BRIDGE` lookup map. When the id is registered
  (BE-11 → FREQUENCY, BE-14 → ENTROPY at HEAD), the inferred dim is
  cross-checked against the expected and a mismatch returns `null`.
  Unknown ids fall through to the inferred dim unchanged. The previously
  unused `bridgeId` parameter is now load-bearing
  (`src/dimensional/bridge-check.ts`).
- `src/dimensional/README.md` updated to reflect Tier-5 progress: 12 of
  40 entries now have `dimensional_signature` populated (BE-11, 14, 18,
  19, 22, 25, 26, 29, 34, 41, 47, 48), BE-11/14 have full AST encodings,
  and `inferDimensionForBridge` is now the cross-checking entry point.
- `src/bridges/README.md` and `src/bridges/index.ts` header updated:
  the previous "`dimensional_signature` is null for every entry" claim
  was no longer true (6 entries are populated). The corrected text
  also pins that populated strings are exactly what `format()` emits,
  never free-form prose (comment-analyzer #1, #2).
- BE-16 `known_issues` de-duplicated. The three records (severities
  `self-refuting`, `sign`, `undefined-quantity`) previously carried an
  identical 1500-char combined description; each now carries the
  per-severity slice of the original text. The spec markdown's
  `**Known issues:**` paragraph remains the archival source
  (comment-analyzer #3 — extractor artifact).
- BE-18 `dimensional_signature` corrected from `'[energy]^4'` to
  `'[L^8 M^4 T^-8]'`. The framework's `format()` does not synthesise
  named-power forms like `[energy]^4`; the canonical bracketed product
  is what an AST-based round-trip will actually produce
  (`src/bridges/index.ts`).
- BE-47 `dimensional_signature` corrected from
  `'[number-density][time]^-1'` to `'[L^-3 T^-1]'`. There is no
  `number-density` entry in `NAMED_DIMENSIONS`, and `format()` does not
  emit two-bracket concatenated forms anywhere; the bracketed product
  is the canonical output for the L^-3 T^-1 shape
  (`src/bridges/index.ts`).
- BE-48 `dimensional_signature` corrected from `'[time^-1]'` to
  `'[frequency]'`. The framework's `NAMED_DIMENSIONS` lookup picks
  `frequency` for the {T:-1, ...} shape, so `format()` always emits
  `'[frequency]'`; `'[time^-1]'` is not a form `format()` produces.
  Aligns with BE-11 which already uses `'[frequency]'` for the same
  Lindblad-rate signature
  (`src/bridges/index.ts`, `tests/bridges/be-48-fix.test.ts`).
- BE-11 monotonicity test replaced with a dense 10-point λ sweep and a
  quadratic-ratio identity test (4 α values, 12-decimal precision). The
  previous 3-point monotonic check trivially fit any function with a
  hidden bump (test-analyzer F7).
- BE-14 Schwarzschild test no longer self-cross-checks against the same
  formula. Replaced with a hand-computed CODATA literal (1.4467e54 J/K
  to ±0.5%); the derivation is shown in a comment block so a future
  CODATA revision that nudges k_B, G, or ℏ at the 4th sig fig will
  surface as a test failure (test-analyzer F8).
- New catalog test pins the 15 canonical category-letter → name
  mappings against the spec (`### Category X: <Name>` headers in
  docs/specification/Part-{I,II}.md). The previous unique-counts test
  would silently pass a wholesale rename; this one wouldn't
  (test-analyzer F11).
- New test for `validateEquation`: when LHS itself has an internal
  violation, the surfaced violation's `location` is prefixed with
  `lhs` (test-analyzer F13). Pure test addition — the path-prefix
  logic already works correctly, this pins it against future drift.
- Two new dimensional-algebra tests: `(a * b) / a = b` (multiply ∘
  divide commutes), and `(L^2)^(1/2) = L` (fractional exponents work).
  The fractional exponent path was previously untested (only 0, 1,
  -1, 2 were exercised); both pass without code changes
  (test-analyzer F14).
- Three `format()` tests for LENGTH, ENERGY, inverse-time replaced
  their disjunctive matchers (`'[L]' || includes('length')` etc.) with
  single-branch pins to the actual deterministic output (`'[length]'`,
  `'[energy]'`, `'[frequency]'`). The disjunctive form silently
  accepted a future refactor that flipped the rendering; the pin
  doesn't (test-analyzer F6).
- Renamed two enum-validation tests in `tests/bridges-index.test.ts`
  to "runtime values match the TS enum (catches `as` casts)" with a
  comment explaining their actual scope. Their previous "all X are
  valid enum values" phrasing read as a behavioural check but was
  really a runtime-cast guard (test-analyzer F10).

### Fixed
- `validator.infer()` no longer crashes with `TypeError` when an `^` op
  node is passed zero or one arguments. The `^` branch now records a
  shape violation and returns `null` if `args.length !== 2`, matching
  the defensive style used by the other operator branches
  (`src/dimensional/validator.ts`).
- `validator.infer()` now exhaustively guards `switch (node.kind)` with a
  `default` arm. A malformed AST whose `kind` is not one of the four
  supported variants previously caused `validate()` to silently report
  `ok: true, inferredDimension: undefined`; it now records an "unknown
  ExprNode.kind" violation and returns `ok: false`. `validate()` also
  hardens the `ok` guard against an `undefined` inferred dim
  (`src/dimensional/validator.ts`).
- `validator.infer()` `integral` / `derivative` arms guard against missing
  required fields (`integrand`/`over` and `of`/`wrt` respectively).
  Hand-built or JSON-loaded nodes that omit a field used to crash with
  `TypeError`; they now record a shape violation and return `null`
  (`src/dimensional/validator.ts`).
- `validator.infer()` `^` non-symbol-exponent violation now reports the
  inferred exponent-expression dimension in `actual` (instead of
  `DIMENSIONLESS === expected`, which made the violation look like a
  no-op to consumers comparing the two). Falls back to `DIMENSIONLESS`
  only if the exponent expression itself fails inference cleanly
  (`src/dimensional/validator.ts`).

### Removed
- 8 unused named-dimension constants from `src/dimensional/types.ts`
  and `src/index.ts` re-exports: `VOLUME`, `MOMENTUM`,
  `ANGULAR_MOMENTUM`, `PRESSURE`, `DENSITY`, `VOLTAGE`,
  `ELECTRIC_FIELD`, `MAGNETIC_FIELD`. None had any non-self reference
  in `src/` or `tests/`. Their `NAMED_DIMENSIONS` rows were removed
  too, so `format()`'s lookup table now maps only to dimensions with
  active consumers. Re-add precisely when a bridge encoding or test
  references one (simplifier F-01).
- The `'angular_momentum'` row in `NAMED_DIMENSIONS` is replaced by
  `'action'` (same SI shape J·s). `hbar` is the canonical action-typed
  consumer, so when `format()` renders that shape it now returns
  `'[action]'` rather than `'[angular_momentum]'`.

