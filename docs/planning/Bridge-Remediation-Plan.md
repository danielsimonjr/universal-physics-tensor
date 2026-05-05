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
| R0   | Fix-blocking — `established` (or std-ext) WITH known issues   | 3     | ~6-12 hr (3×S/M spec-edits)                           |
| R1   | Fix-if-cheap — `speculative` with `spec-edit` fix only        | 7     | ~7-14 hr (7×S spec-edits, can be batched)             |
| R2   | Reformulate — `reformulation`/`unknown` fix path              | 5     | ~25-40 hr (research + rewrite, case-by-case)          |
| R3   | Unfixable — recommend marking `invalid` or removing           | 1     | ~XS (decision) + S (apply)                            |
| R4   | Narrative-only concerns — extract structured Known Issues     | 16    | ~16-24 hr (1-2hr per entry to encode existing prose)  |
| R5   | Healthy / ready to implement                                  | 8     | n/a (these feed Tier 5 implementation work)           |
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

### Tier R3 — Unfixable, recommend mark invalid (1)

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

### Tier R1 — Fix-if-cheap (7)

Speculative entries whose Known Issues are all `fixable: 'spec-edit'`. These
are typographical / transcription / clarification fixes. Batch in a single PR
once approved.

- **BE-12 Mesoscopic Coherence Length Equation** (S) — `N_c = (E_int/(k_B T))³` cube exponent unmotivated; either justify or revise. Depends on BE-11.
- **BE-18 Non-Abelian Dark Matter Gauge Theory** (S) — `other/spec-edit` issue (citation/derivation gap; see notes).
- **BE-29 Jarzynski Equality Extension to Gravity** (S) — undefined quantity flagged.
- **BE-31 Causal Set — Continuum Limit** (S) — dimensional clarification needed.
- **BE-37 Variable Speed of Light Cosmology** (S) — spec-edit category.
- **BE-47 Big Bang Nucleosynthesis — Dark Sector Coupling** (S) — spec-edit.
- **BE-17 Electromagnetic-Gravitational Unification via Torsion** (M) — three coupled `spec-edit` issues: dimensional, index-structure, undefined-quantity. Requires careful index hygiene; a touch above S because the issues interact.

### Tier R2 — Reformulate (5)

Issues marked `reformulation` or `unknown` fix-path; these require physics
content rework, not just spec polish.

- **BE-13 Landauer-Wheeler Information-Geometry Equation** (highly-speculative, **L**) — information stress-energy tensor `I_μν` does not close dimensionally; rebuild from a foundational ansatz.
- **BE-15 Universal Emergence Equation** (speculative, **L**) — RG β-function dimensionality mismatch with `∂O_macro/∂t`; phenomenological-ansatz flag. Functional form needs replacement.
- **BE-24 Quantum Coherence in Photosynthesis Efficiency** (speculative, **M**) — formula admits η_transfer > 1, exceeding the stated bound. Requires re-deriving with explicit η ≤ 1 enforcement.
- **BE-33 Quantum-Classical Critical Point Mapping** (speculative, **M**) — exponent `z` appears in where-clause but not in formula; `T → 0` limit gives ξ_quantum → 0 (wrong direction).
- **BE-38 Entropic Gravity Correction Term** (speculative, **L**) — proposed interpolation does not reproduce deep-MOND scaling `F ∝ √(F_N a₀)` in `a → 0` limit. Functional rework needed.

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

### Tier R5 — Healthy / ready to implement (8)

No known issues recorded and no narrative concerns beyond status labelling.
These are the **candidate pool for Tier 5 implementation work** (the Bridge Eq
14 end-to-end pipeline already in flight is the canonical first consumer).

- **BE-14 Quantum Error Correction Holographic Mapping** (established) — already in flight.
- **BE-21 AdS/CMT Correspondence Equation** (established).
- **BE-26 DNA Mutation — Quantum Tunneling Rate** (established).
- **BE-28 Maximum Entropy Production Principle** (speculative — clean prose).
- **BE-32 Quantum Reference Frame Transformation** (speculative — clean prose).
- **BE-34 Kibble-Zurek Mechanism in Curved Spacetime** (established).
- **BE-35 Conformal Bootstrap — Physical Operator Equation** (established).
- **BE-40 Composite Higgs Potential** (established).

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
