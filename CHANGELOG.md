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
  (Wolfram 2002 *A New Kind of Science*; Israeli-Goldenfeld 2006
  *Phys. Rev. Lett.* 92:074105) as the correct bridging argument: some
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
  disambiguated (Wave I.A C2b).** Per Researcher I-1 (Wave H paper
  review), `arXiv:hep-th/0205052` resolves to *Policastro, Son &
  Starinets* "From AdS/CFT correspondence to hydrodynamics" *JHEP*
  0209:043 (three-author), but the BE-21 prose attributed it to "Son
  and Starinets 2002" (two-author). The substantive content of BE-21 —
  the explicit retarded-Green's-function recipe `G_R = -i lim r^{2Δ-d}
  (g^rr/√g^tt) ∂_r φ / φ_0` — is the canonical recipe from
  *Son & Starinets* 2002 *Phys. Rev. D* 65:104021 (arXiv:hep-th/0205051),
  the genuine two-author paper. Decision: change the arXiv ID
  (0205052 → 0205051) and keep "Son and Starinets" attribution in the
  prose; preserve the companion 0205052 paper as a secondary reference
  (it applies the same recipe to hydrodynamics). Updated both
  `src/bridges/index.ts` BE-21 entry (`references[]` and `notes`) and
  the Part-II.md status block. Iqbal-Liu 2008 retained as a third
  AdS/CMT-review reference. No code or test changes.
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
  `known_issues[]` arrays: 26 entries (BE 12, 13, 15, 16, 17, 19, 20,
  22, 23, 24, 25, 27, 30, 31, 33, 34, 36, 37, 38, 39, 42, 43, 45, 46,
  49, 50). Both the §"What remains to be done" bullet and the
  "Framework Statistics" trailer updated from 24 → 26 with the corrected
  ID list and a sentence pinning where the count came from. The prior
  list reflected a pre-Wave-G snapshot before R0/R1 fixes promoted
  BE-11/18/29/47 to R5 and R4 narrative-only concerns were extracted
  into structured records. No code or test changes.
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

