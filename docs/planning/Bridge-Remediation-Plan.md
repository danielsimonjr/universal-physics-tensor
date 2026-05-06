# Bridge Equation Remediation Plan

> Status: 2026-05-04 | Source: `src/bridges/index.ts` @c276282 + `docs/specification/Part-I.md`, `Part-II.md` | Audit method: programmatic extract via compiled `dist/bridges/index.js` (40 entries, schema-conformant), tier classifier applied per the brief, narrative-concern (R4) gate verified by spot-reading `notes` text per equation.

This document is a prioritized work queue for fixing or dispositioning each of
the 40 bridge equations catalogued in the UPT specification. It does **not**
modify the index itself — index updates are a separate PR (see "Suggested
index updates" below).

Honest-claude posture: tier assignments come from explicit fields in the index
plus narrative status text preserved in each `notes` entry. Where the index is
silent but the spec text raises a substantive concern (Tier R4), that is
flagged. Where the spec text raises no concern beyond being labelled
speculative, the entry lands in R5. No severities or fix-paths were invented.

## Summary

| Tier | Definition                                                    | Count | Cumulative effort estimate                            |
|------|---------------------------------------------------------------|-------|-------------------------------------------------------|
| R0   | Fix-blocking — `established` (or std-ext) WITH known issues   | 3     | ~6-12 hr (3×S/M spec-edits) — **all 3 resolved 2026-05-04** |
| R1   | Fix-if-cheap — `speculative` with `spec-edit` fix only        | 0     | **All 7 resolved 2026-05-01** (3 fixed → R5; 4 re-tiered → R2) |
| R2   | Reformulate — `reformulation`/`unknown` fix path              | 7     | Wave J Tier B (2026-05-05) promoted BE-23, BE-30 from R2 to R3 (algebraic-vacuity / structural-ill-formedness); 7 remaining await domain expert |
| R3   | Unfixable — recommend marking `invalid` or removing           | 4     | **Resolved**: BE-16 (2026-05-01), BE-37 (2026-05-05), BE-23 (2026-05-05 Wave J Tier B1), BE-30 (2026-05-05 Wave J Tier B2) |
| R4   | Narrative-only concerns — extract structured Known Issues     | 16    | ~16-24 hr (1-2hr per entry to encode existing prose)  |
| R5   | Healthy / ready to implement                                  | 12    | +3 from R1 fixes (BE-18, BE-29, BE-47) + BE-11 R0 → R5 |
| **Total** |                                                          | **40**|                                                       |

Status mix in the index: `established` × 9, `speculative` × 24, `highly-speculative` × 7, `standard-extension` × 0. (No spec equations were classified as `standard-extension`; that arm of the type union is currently unused.)

## Work order

Equations are grouped by remediation tier. Within each tier, ordering is by
estimated effort (smallest first) so quick wins surface ahead of deep
reformulations. Effort estimates (XS <1hr, S 1-2hr, M 2-4hr, L 4-8hr,
XL = needs research) are heuristic and explicitly rationaled per row.

### Tier R0 — Fix-blocking (3)

These are catalog entries the spec marks `established` yet ships with explicit
`Known issue` markers. Each needs either a spec edit to fix the issue or a
status downgrade to `speculative` for honesty.

- **BE-11 Decoherence Master Equation** (established, **S**) — **Resolved 2026-05-04 (branch `fix/be-11-decoherence-coupling`).**
  - Issue: auxiliary rate `γ_k(T,λ) = γ_0 exp(-λ/λ_thermal)` was exponentially
    *decreasing* in coupling λ; standard decoherence rates *increase* with
    coupling (Caldeira-Leggett: γ ∝ λ²).
  - **Action taken:** auxiliary rate replaced with the Caldeira-Leggett
    weak-coupling form `γ_k(λ) = γ_0 (λ/λ_0)²` (Caldeira-Leggett 1985,
    Phys. Rev. A 31, 1059, §III.B; Breuer & Petruccione 2002, §3.6) in
    `docs/specification/Part-I.md` BE-11 entry, with a `Corrected on
    2026-05-04` block recording the original form and citation. Index entry
    in `src/bridges/index.ts` updated: `formula_latex` now includes the
    corrected rate, `known_issues` cleared, `references` populated with five
    primary sources, `dimensional_signature` set to `[frequency]` (the
    Lindblad equation has units `[T^-1]`). Status remains `established` (the
    Lindblad form was always solid; only the auxiliary rate was a
    transcription error). Equation now sits in **Tier R5** (healthy).
  - Source: Part-I, Category A.

- **BE-23 Strange Metal — Black Hole Duality** (~~established~~ → **speculative**, status downgraded 2026-05-01) — **Partially addressed; reclassified R0 → R2.**
  - Issue: substituting τ_P = ℏ/(k_B T) into √(ℏ/(k_B T τ_P)) gives √1 = 1
    identically — the third term of the resistivity expression collapses to
    constant B.
  - **2026-05-01 update (branch `fix/be-23-strange-metal-transcription`):** the
    original `spec-edit` recommendation in this audit (replace with
    `√(k_B T · τ_P / ℏ)`) is **also algebraically vacuous** under the same
    substitution. Since `τ_P · k_B T = ℏ` is the *definition* of `τ_P`, every
    monomial built solely from those two factors collapses to a pure number.
    A non-vacuous third term must introduce a second independent scale
    (candidates: τ_el, SYK J, E_F, MSS Lyapunov bound λ_L = 2π k_B T/ℏ).
    Selecting among these is **not a transcription fix** — it is a research
    decision requiring strange-metal/holography expert input.
  - **Action taken in branch:** status downgraded `established` → `speculative`
    in `src/bridges/index.ts`; original vacuous form preserved verbatim in
    `Part-II.md` with a `Known issue (preserved)` block; `known_issues[0]`
    severity changed `other` → `self-refuting`, fixable changed
    `spec-edit` → `reformulation`. Equation now sits in **Tier R2**.
  - Source: Part-II, Category F.

- **BE-48 Objective Collapse Equation (GRW extension)** (established, **S**) — **RESOLVED 2026-05-04**
  - Original issue: localization operator `L_x = exp[-(r-x)² / (2σ²)]` is
    dimensionless as written; standard GRW carries a `(πσ²)^{-3/4}` prefactor
    so the master equation closes dimensionally and λ has units [1/time].
  - Fix path taken (`spec-edit`): added the canonical 3D GRW prefactor
    `(πσ²)^{-3/4}` to `L_x` in both `docs/specification/Part-II.md` and
    `src/bridges/index.ts` (`formula_latex`). Also bumped the rate from the
    unsourced `1e-17 s^-1` to the canonical GRW `1e-16 s^-1`. Status remains
    `established` (canonical typesetting correction, not a reformulation).
    `dimensional_signature` set to `[time^-1]`. Regression test in
    `tests/bridges/be-48-fix.test.ts`.
  - Citations: Ghirardi-Rimini-Weber 1986 Phys. Rev. D 34:470 (original);
    Bassi-Ghirardi 2003 Phys. Rep. 379:257 review (arXiv:quant-ph/0302164).
  - Source: Part-II, Category O.

### Tier R3 — Unfixable, recommend mark invalid (4)

> **Updated 2026-05-05 (Wave J Tier B):** Three additional R3 dispositions
> applied since the 2026-05-01 BE-16 record: BE-37 (VSL, applied 2026-05-05
> per `BE-37-VSL-Disposition-Brief.md`), BE-23 (Strange Metal, Wave J Tier
> B1), and BE-30 (ER=EPR, Wave J Tier B2). All four follow the same pattern:
> (i) the displayed formula is mathematically self-refuting or operationally
> ill-formed; (ii) the proposed-fix path requires a research commitment, not
> a transcription edit; (iii) the canonical-replacement-equation framing
> would be a *new* BE rather than a fix of the present transcription. Status
> pin tests prevent silent re-promotion: `tests/bridges/be-{16,23,30,37}-r3-disposition.test.ts`.

- **BE-23 Strange Metal — Black Hole Duality** (~~speculative~~ → **invalid**, 2026-05-05, Wave J Tier B1)
  - Spec quote (verbatim from Known Issue): the third term `B √(ℏ/(k_B T τ_P))`
    collapses to `B · 1` identically because `τ_P · k_B T = ℏ` is a definitional
    identity. Formula reduces to `ρ(T) = ρ_0 + B + AT` — constant-shifted Drude,
    not Planckian dissipation.
  - Disposition rationale (per Phys iter-1 C2 + Math M-I5 iter-2): a non-vacuous
    third term must introduce a *second* scale (τ_el, SYK J, E_F, MSS λ_L = 2π
    k_B T/ℏ); selecting one is a research-program commitment, not a transcription
    fix. Audit's previously-suggested `√(k_B T · τ_P / ℏ)` collapses identically.
  - Status pin: `tests/bridges/be-23-r3-disposition.test.ts`.

- **BE-30 Entanglement-Geometry Equation (ER=EPR generalized)** (~~highly-speculative~~ → **invalid**, 2026-05-05, Wave J Tier B2)
  - Spec quote (verbatim from Known Issue): four orthogonal defects — (a)
    `Tr_j(ρ_{ij} log ρ_{ij})` is a scalar so `⟨x|...|x⟩` is undefined; (b) LHS
    rank-2 vs RHS scalar mismatch; (c) `|x⟩` non-normalizable; (d) κ ~ ℓ_P²
    gives κ·S units of [L]² but δg should be dimensionless.
  - Disposition rationale (per Math M-C5 + Phys C5 iter-1, re-flagged iter-2):
    no consistent reading. Canonical replacement is the Faulkner-Lewkowycz-
    Maldacena 2013 (arXiv:1307.2892) linear-response formula `δS_EE = ⟨δH_R⟩`,
    which is a *different* equation, not a fix of the current transcription.
  - Status pin: `tests/bridges/be-30-r3-disposition.test.ts`.

### Tier R3 — Original record (1)

> **Disposition decision (2026-05-01):** **Option 1 selected — mark invalid.**
> Rationale: keeps the record visible, flags the problem, preserves the option
> to reformulate later if a clean S vs. S_vN distinction emerges. Implemented
> on branch `chore/bridge-index-followups`: added `'invalid'` to the
> `BridgeEquationStatus` type union; flipped BE-16 `status: 'speculative' →
> 'invalid'`; added regression test in `tests/bridges-index.test.ts` pinning
> the disposition so a future contributor cannot silently re-promote it.

- **BE-16 Complexity-Entropy Production Relation** (~~speculative~~ → **invalid**, 2026-05-01) (~~XL~~ if
  retain; **XS** if remove/mark invalid — XS path taken)
  - Spec/index quote (verbatim from `notes` + `known_issues`):
    > "**Additional Second-Law problem:** combining `I = Tr(ρ log ρ) = -S_vN`
    > with `dS/dt = k_B · C(ρ) · dI/dt` gives `dS/dt = -k_B · C(ρ) · dS_vN/dt`.
    > If S and S_vN are taken to be the same entropy, this forces
    > `dS/dt (1 + k_B C(ρ)) = 0`, i.e., `dS/dt = 0` for any `C(ρ) > -1/k_B`
    > — the equation algebraically forbids entropy change, violating the
    > Second Law. The formula is therefore not merely imprecise; it is
    > self-refuting unless S and S_vN are distinct quantities (which must
    > then be defined separately)."
  - Three known issues are stamped `unfixable-must-mark-invalid`:
    - `self-refuting` — the algebra above.
    - `sign` — `I := Tr(ρ log ρ)` is *negative* von Neumann entropy; sign
      convention in the equation as written should be checked.
    - `undefined-quantity` — circuit complexity `C(ρ)` is not independently
      defined; absent an operational definition (e.g., gate count in a
      universal gate set) the equation degenerates into a definition of
      complexity rather than a falsifiable physical relation.
  - **Owner-decision options:**
    1. **Add `'invalid'` to `BridgeEquationStatus` and mark BE-16 invalid.**
       Cheapest. Preserves traceability — readers can see why something was
       removed and the algebra that refuted it.
    2. **Remove BE-16 entirely from the spec.** Cleaner catalog but loses the
       cautionary value.
    3. **Reformulate.** Requires (a) introducing a distinct symbol for
       entropy vs. von Neumann entropy in two coupled equations, and
       (b) supplying an operational `C(ρ)` definition that monotonicity-bounds
       the result. This is a research project, not a spec edit — XL effort
       and may not converge to a physically defensible form.
  - **Tier-3 author has not pre-decided.** All three options are physically
    defensible given the spec text. Daniel decides.
  - Honest-claude qualifier: the algebraic argument as written assumes
    `S = S_vN` (i.e., that "entropy" in `dS/dt` and "von Neumann entropy" are
    the same quantity). The argument is correct *under that assumption*. A
    reformulation path that explicitly distinguishes thermodynamic S (e.g.,
    coarse-grained Gibbs) from S_vN (microscopic) is mathematically
    consistent — but the spec as currently written does not make that
    distinction, so the "self-refuting" verdict is appropriate for the
    equation *as written*.

### Tier R1 — Fix-if-cheap (originally 7; resolved 2026-05-01)

> **Status: Resolved 2026-05-01 (branch `fix/r1-batch-spec-edits`).** Single
> batch addressed all 7 originally-R1 entries: 3 received clean spec-edit
> fixes and moved to R5; **4 were re-tiered R1 → R2** after the fix loop
> revealed the audit's `spec-edit` classification was optimistic for those
> entries. **STOP-style flag for audit accuracy**: 4 of 7 R1 entries
> systematically over-promoted reformulation work as transcription fixes;
> the audit's R1/R2 boundary should be revisited before further batches.
> Per-entry resolutions:

- **BE-12 Mesoscopic Coherence Length Equation** — **R1 → R2** (preserved).
  No literature interpolation of this form exists; identifying
  `ω_decoherence` with `ω_c` from BE-11 or motivating the cube exponent
  requires inventing physics, not citing it. See commit `8b3f894`.
- **BE-17 Electromagnetic-Gravitational Unification via Torsion** — **R1 → R2**
  (preserved). Three coupled issues — 4-vs-2-index Maxwell mismatch,
  `l_EM` not-a-length, rank-4 vs canonical rank-3 contorsion — each requires
  a structural rewrite, not a typo fix. See commit `cec784e`.
- **BE-18 Non-Abelian Dark Matter Gauge Theory** — **R1 → R5** (FIXED).
  Added missing `|D_μ Φ|²` kinetic term; flipped `+V → −V` to canonical
  L = T − V. Cited Peskin-Schroeder §20.1. Status remains `speculative`
  (form is canonical; the dark-sector physics conjecture is what is
  speculative). See commit `7a5bb9c`.
- **BE-29 Jarzynski Equality Extension to Gravity** — **R1 → R5** (FIXED).
  Replaced ill-defined `g_{μν} dT^{μν}` with the canonical Hilbert action
  variation `T^{μν} δg_{μν} √(−g) d⁴x`; corrected prefactor to
  `1/(2c⁴)` per the standard `T^{μν}` definition. Cited MTW §21.3, Wald
  §E.1. Status remains `speculative` (curved-spacetime Jarzynski
  conjecture is the unverified content). See commit `542d2f4`.
- **BE-31 Causal Set — Continuum Limit** — **R1 → R2** (preserved).
  Audit's own recommendation ("replaced with their published formula") is
  reformulation language. The `V^{2/4}→V^{1/2}` typo *is* a clean
  spec-edit, but cannot ship in isolation because the structurally
  different `(ρ²ℓ_P⁴)^{1/4}` Ricci-correction term (vs. Benincasa-Dowker's
  count-difference formula) needs a structural rewrite. See commit `80a45aa`.
- **BE-37 Variable Speed of Light Cosmology** — **R2 → R3 (INVALID),
  2026-05-05.** Disposition decision per `docs/planning/BE-37-VSL-Disposition-Brief.md`:
  the Ellis-Uzan 2005 operational-meaningfulness critique blocks every
  reformulation path. Original ansatz preserved as historical record;
  status `invalid`. Earlier history: R1 → R2 (preserved as R2 candidate)
  on 2026-05-01 (commit `dd77deN`); R2 → R3 (this commit) closes the
  decision.
- **BE-47 Big Bang Nucleosynthesis — Dark Sector Coupling** — **R1 → R5**
  (FIXED). Added Hubble drag `+3HY` on LHS; replaced single-species
  `n_b²` with species-correct product `n_p n_n` for the canonical
  `p+n→d+γ` two-body reaction. Cited Kolb-Turner §5.2, Steigman 2007,
  Pitrou-Coc-Uzan-Vangioni 2018. Status remains `speculative` (the
  dark-sector coupling extension is the unverified content). See commit
  `bfaac89`.

**Aggregate**: 3 fixed (R1→R5), 4 preserved (R1→R2). Suite grew 126 → 172
passing tests across 7 atomic commits on branch `fix/r1-batch-spec-edits`.

### Tier R2 — Reformulate (9; all gap-specified 2026-05-04)

> **Status: All 9 R2 entries gap-specified 2026-05-04 (branch
> `chore/r2-batch-reformulation-specs`).** Per-bridge structured
> gap-records added to `src/bridges/index.ts` notes, `Part-{I,II}.md`
> "R2 reformulation gap" blocks, and `tests/bridges/be-XX-r2-spec.test.ts`
> regressions. No bridge was promoted to R5 or invalidated to R3 — all
> nine require physics judgment from a domain expert. Originally 5 + 4
> from R1 re-tier on 2026-05-01.
>
> The "domain-expert question" produced for each bridge is the most
> valuable artifact for collaboration; consolidated below.

#### Documented R2 (gap-specified)

| BE | Name | Status | Domain-expert question |
|----|------|--------|------------------------|
| 12 | Mesoscopic Coherence Length | speculative | Which microscopic length should `ξ_0` be (thermal de Broglie / BEC healing / Caldeira-Leggett cutoff), and is `ω_decoherence` = `ω_c` of BE-11 or a distinct decoherence-onset scale? |
| 13 | Landauer-Wheeler Information-Geometry | highly-speculative | Should the bridge be reformulated via Jacobson's thermodynamic derivation, Verlinde's entropic-gravity ansatz, or a from-scratch information-stress-energy tensor with new operational definition? Three non-equivalent paths. |
| 15 | Universal Emergence | speculative | Should the equation be replaced with Hohenberg-Halperin model A/B/C gradient flow, Wetterich exact RG, or Mori-Zwanzig projection? Each yields a different operational equation. |
| 17 | EM-Gravitational Torsion | speculative | What is the correct rank-4 EM RHS (antisymmetrized δ-product Maxwell vs. direct F_{μν}F^{λρ}), which physical length should `l_EM` be (r_e / λ_C / l_P), and how does the rank-3 contorsion couple? |
| 24 | Photosynthesis Coherence | speculative | Should photosynthetic-coherence enhancement be modeled via FRET, HEOM/Redfield, or Lindblad master equation, given Cao et al. 2020 attribute observed FMO oscillations to vibrational rather than electronic coherence? |
| 31 | Causal Set Continuum | speculative | Replace with Benincasa-Dowker count-difference Ricci scalar `R(p) = (4/√6) ℓ_P^{-2} [1 - (N_0 - 9N_1 + 16N_2 - 8N_3)/⟨n(p)⟩]` in d=4; verify constants and dimension-specific adjustment. |
| 33 | Quantum-Classical Critical Point | speculative | Replace with Hertz-Millis canonical scaling `ξ ~ T^{-ν/z}`, choose target universality class (3D Ising / XY / Heisenberg / fermionic Hertz-Millis-Moriya), decide z=1 vs. general-z. |
| 37 | Variable Speed of Light Cosmology | ~~speculative~~ → **invalid** (R3 disposition 2026-05-05) | ~~Pick one of three frameworks~~ → R3-applied: Ellis-Uzan critique survives all three frameworks; no defensible reformulation. See `docs/planning/BE-37-VSL-Disposition-Brief.md`. |
| 38 | Entropic Gravity Correction | speculative | Replace with canonical MOND (Milgrom 1983, recovers √(F_N a_0) by construction), Verlinde 2016 mass-correction (arXiv:1611.02269), or TeVeS relativistic MOND (Bekenstein 2004)? Cross-check with BE-36 (shared a_0). |

**Reclassifications:** none auto-applied. Two flagged for owner attention:

- **BE-37 (VSL)** — **R3 APPLIED 2026-05-05.** Daniel accepted the
  Wave-2 disposition brief recommendation (R3 mark-invalid, confidence 60).
  Ellis-Uzan 2005 critique (operational meaninglessness of bare c(t))
  combined with non-equivalence of the three canonical VSL frameworks
  blocks every reformulation path. Status: `invalid`. Brief at
  `docs/planning/BE-37-VSL-Disposition-Brief.md`.
- All other 8 R2 entries have at least one literature-cited reformulation
  path that is physically defensible; preserved as R2.

### Tier R4 — Narrative-only concerns, needs Known Issue extraction (16)

These have `known_issues: []` in the index but their `notes` (preserved Status
text from the spec) raises specific physical/mathematical concerns. Each entry
needs a structured `KnownIssue` record extracted from the prose so the catalog
no longer hides the concern behind narrative.

For each entry, effort is **S** (1-2 hr): re-read the spec section, distill
into one or more `{severity, description, fixable}` records, propose for index
update.

- **BE-19 Quantum Bounce Equation** — `ρ_crit = 3c²/(8πGℓ_P²)` differs from canonical LQC ρ_crit. (S)
- **BE-20 Vacuum Fluctuation Dark Energy Coupling** — naive evaluation reproduces the cosmological-constant problem (~120 orders of magnitude); spec acknowledges this. (S)
- **BE-22 Topological Entanglement Entropy — QG Link** — finite-T and area-scaling extensions are novel additions not in literature. (S)
- **BE-25 Consciousness — Quantum Information Bridge** — Penrose-Hameroff Orch OR contradicted by Tegmark 2000 / Reimers et al. decoherence calcs (femtosecond timescales vs. ms for cognition). Severity is high; should be encoded. (S)
- **BE-27 Fluctuation-Dissipation Violation in Active Matter** — specific functional form is conjectural; standard concept exists (Cugliandolo 2011) but specific equation is novel. (S)
- **BE-30 Entanglement-Geometry Equation** — Van Raamsdonk/Swingle support general claim but specific formula is speculative. (S)
- **BE-36 MOND — Dark Matter Interpolation Function** — spec says formula is "**not a standard MOND formulation**"; should be encoded as severity. (S)
- **BE-39 Asymptotic Safety in Quantum Gravity** — spec flags the fact this is active research, not confirmed. (S)
- **BE-41 Swampland Distance Conjecture Equation** — same: active research, not confirmed. (S)
- **BE-42 Firewall Complement Principle** — spec: decomposition `|ψ⟩ = a|smooth⟩ + b|firewall⟩` is "tautological" without further structure. (S)
- **BE-43 ER=EPR Wormhole Dynamics** — mixes entropy (dimensionless) with length scale; needs dimensional or unit-bridging note. (S)
- **BE-44 Soft Hair on Black Holes** — based on Hawking-Perry-Strominger 2016; "speculative" status acknowledged. (S)
- **BE-45 Trans-Planckian Censorship Constraint** — formula adds terms beyond canonical Bedroya-Vafa; spec says "non-standard". (S)
- **BE-46 Multiverse Measure Problem** — spec acknowledges untestability. Needs an `untestable` or `interpretational` severity. (S)
- **BE-49 Quantum Darwinism Redundancy** — spec: specific decay form is phenomenological. (S)
- **BE-50 Retrocausal Quantum Field Theory** — spec contains a literal `**Known issue with citations:**` marker that the extractor missed. (S; trivial — already in spec, just needs encoding)

### Tier R5 — Healthy / ready to implement (12)

No known issues recorded and no narrative concerns beyond status labelling.
These are the **candidate pool for Tier 5 implementation work** (the Bridge Eq
14 end-to-end pipeline already in flight is the canonical first consumer).

- **BE-11 Decoherence Master Equation** (established) — R0 fix landed
  2026-05-04 (Caldeira-Leggett `γ_k(λ) = γ_0 (λ/λ_0)²` replaces the
  exponential-decreasing auxiliary rate). See R0 history above.
- **BE-14 Quantum Error Correction Holographic Mapping** (established) — already in flight.
- **BE-18 Non-Abelian Dark Matter Gauge Theory** (speculative) — R1 fix
  landed 2026-05-01 (added `|D_μ Φ|²` kinetic term, flipped `+V → −V`
  for canonical `L = T − V`). See R1 history above.
- **BE-21 AdS/CMT Correspondence Equation** (established).
- **BE-26 DNA Mutation — Quantum Tunneling Rate** (established).
- **BE-28 Maximum Entropy Production Principle** (speculative — clean prose).
- **BE-29 Jarzynski Equality Extension to Gravity** (speculative) — R1
  fix landed 2026-05-01 (replaced ill-defined `g_{μν} dT^{μν}` with the
  canonical Hilbert action variation `T^{μν} δg_{μν} √(−g) d⁴x`,
  prefactor corrected to `1/(2c⁴)`). See R1 history above.
- **BE-32 Quantum Reference Frame Transformation** (speculative — clean prose).
- **BE-34 Kibble-Zurek Mechanism in Curved Spacetime** (established).
- **BE-35 Conformal Bootstrap — Physical Operator Equation** (established).
- **BE-40 Composite Higgs Potential** (established).
- **BE-47 Big Bang Nucleosynthesis — Dark Sector Coupling**
  (speculative) — R1 fix landed 2026-05-01 (added Hubble drag `+3HY` on
  LHS; replaced single-species `n_b²` with species-correct product
  `n_p n_n` for the canonical `p+n→d+γ` two-body reaction). See R1
  history above.

## Dependency observations

The index records exactly one cross-equation dependency: **BE-12 → BE-11** (the
mesoscopic coherence length equation references the decoherence rate from
BE-11). This was already in the index; no update needed.

Searching Parts I-II for the prose patterns "Bridge Eq(uation) N", "from Eq N",
and "see Eq N" confirmed: **no other in-spec cross-references between catalog
entries appear within Parts I-II.** The 40-equation catalog is structurally
flat by design.

Parts IV-VI *do* reference catalog equations as downstream consumers (e.g.,
Part-V applies BE-14, BE-13, BE-24, BE-25; Part-IV targets BE-11, BE-18, BE-19,
BE-20, BE-46; Part-IV § retrocausality references BE-50). These are
*application* references, not derivational dependencies inside the catalog —
BE-14 does not depend on BE-13, etc. They do not belong in the index's
`dependencies[]` field. (If a future "where used" or "applications" field is
added to the schema, the Part IV-VI consumer references would populate it.)

A scan of shared physical symbols across catalog entries surfaced three soft
co-references worth noting (these are shared *physical quantities*, not
equation-level dependencies, and the brief's threshold of "more than 5
divergent dependencies" is **not** met):

- **a_0 (MOND acceleration scale)** appears in both **BE-36** and **BE-38** —
  these are co-related models of the same regime; if either is reformulated,
  the other should be sanity-checked for consistency.
- **M_P (Planck mass)** appears in **BE-41** and **BE-45** — both
  swampland/string-theory bounds; same comment.
- **T_c (critical temperature)** appears in **BE-12** and **BE-22** —
  unrelated physical contexts (mesoscopic coherence vs. topological
  entanglement entropy at finite T); coincidental symbol overlap, not a
  dependency.

### Suggested index updates (separate PR — not modified in this branch)

1. **Eq 50** has an explicit `**Known issue with citations:**` marker in the
   spec that the extractor (`scripts/extract.py`) missed because it only
   scans `**Known issue:**`, `**Additional known issue:**`, and
   `**Bound violation:**`. Update extractor to also catch `**Known issue with
   citations:**` (and any other `**Known issue ...` variant), then
   re-extract.
2. **R4 entries (16 of them)** carry substantive physical concerns in their
   prose that should be encoded as structured `KnownIssue` records. The
   simplest path: a manual pass distilling each entry's notes into 1-3
   `{severity, description, fixable}` records.
3. The `BridgeEquationStatus` union currently includes `'standard-extension'`
   but no entry uses it. Either populate it (some `established` entries are
   really standard extensions of textbook physics) or remove it from the type
   for honesty. Low priority.
4. **Eq 16** likely needs a new status value `'invalid'` if the
   "mark-invalid" disposition is chosen. Type union update + the entry's
   status field flip + a `removed_reason` or `invalidation_note` field
   describing the self-refuting algebra.

## Recommended next steps

1. **R0 + R3 first.** R0 are correctness bugs in equations the spec claims are
   established — these damage the catalog's trust ceiling. R3 (BE-16) is a
   policy decision that blocks any downstream consumer of complexity-entropy
   coupling.
2. **R4 cleanup pass.** 16 equations × ~1-2 hr each, batched. Mostly
   mechanical: re-read spec section, encode existing prose as structured
   `KnownIssue[]`. Extractor improvement (suggested-update #1) handles BE-50
   automatically.
3. **R5 → Tier 5 implementation pool.** Hand the 8 healthy equations to the
   in-flight BE-14 pipeline as the candidate set; they're ready for
   computational embedding work.
4. **R1 batch.** Seven small spec-edits in a single PR; ~1 day of work total.
5. **R2 reformulations.** Case-by-case research items (BE-13 and BE-15 are
   the heaviest); not blocking the pipeline but should be tracked
   individually.

## Verification

Spot-check (per the brief): tier assignments verified against spec text for
BE-11 (R0 — confirmed: Lindblad part is established, auxiliary γ_k issue is
explicit), BE-16 (R3 — confirmed: spec text contains the verbatim
"self-refuting" sentence), BE-23 (R0 — confirmed: τ_P substitution collapses
the radical to 1), BE-48 (R0 — confirmed: GRW prefactor missing),
BE-19 (R4 — confirmed: spec acknowledges ρ_crit deviation from canonical LQC).
All five spot-checks consistent with assigned tier.

`npm run build && npx vitest run` — verified passing before commit (no source
modified; doc-only change).
