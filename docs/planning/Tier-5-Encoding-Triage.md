# Tier-5 AST-Encoding Triage Memo (Wave 1)

**Date:** 2026-05-04
**Branch:** `tier-5/wave-1`
**Author:** Tier-5 rollout agent (Opus 4.7, 1M context)
**Master baseline:** `6cadffb`, 240 tests passing, 6 entries with
`dimensional_signature` (BE-11, 14, 18, 29, 47, 48); only BE-11 and BE-14
have AST encodings.

## Scope

This memo triages bridge equations BE-15 through BE-50 against the
current operator-blind AST (`src/dimensional/validator.ts`). Honest-
claude rule: if a bridge's *spec form* requires primitives the AST does
not have (operator algebra, tensor indices, path integrals, functional
derivatives, inequalities), it is marked unencodable rather than forced.
Bridges flagged for R2 reformulation in their `notes` are also excluded;
encoding their broken spec form would lock in the gap.

## Encodability key

- `yes-ready` — the spec formula is a scalar/algebraic relation (or a
  WKB-style 1D integral / classical scalar potential / Friedmann-style)
  the current AST can carry without lying. No R2 gap-spec block.
- `yes-after-symbol-stub` — same as `yes-ready` but the encoding requires
  introducing one new named-`Dimension` constant (e.g. luminosity
  density, etc.).
- `no-operator-algebra` — needs commutators, density matrices, Lindblad
  ops, bras/kets, or quantum mutual info as primitives.
- `no-tensor` — needs free tensor indices (R_μν, T^μν, F_μν, g^rr/√g^tt).
- `no-path-integral` — needs `∫ dμ[g,φ]` or other functional integration.
- `no-functional` — needs functional/variational derivatives (`δ∫(...)dt = 0`).
- `no-inequality` — formula is an inequality, not an equation.
- `no-r2-gap` — the entry's `notes` field contains a "What would
  unblock a real fix" R2 gap-spec block; encoding the broken form
  would lock in the gap and contradict the audit chain.

## Triage table

| BE | Status | Encodable | Why / What's blocking |
|----|--------|-----------|------------------------|
| 15 | speculative | `no-r2-gap` | R2 gap-spec block on emergence equation; framework selection (Hohenberg-Halperin / Wetterich / Mori-Zwanzig) is a physics decision. |
| 16 | invalid | `no-r2-gap` | INVALID per disposition; algebraically self-refuting. |
| 17 | speculative | `no-r2-gap` | R2 gap-spec block; rank mismatch + undefined ℓ_EM + rank-3 vs rank-4 contorsion. |
| 18 | speculative | `no-tensor` | Lagrangian density with covariant derivatives `D_μ Φ`, gauge field `G^a_μν G^{aμν}`, Dirac spinor; `dimensional_signature` already populated by hand but no tensor-aware AST. |
| 19 | speculative | `yes-ready` | Pure scalar Friedmann `H² = (8πG/3)ρ(1−ρ/ρ_c) + Λ/3`. |
| 20 | speculative | `no-operator-algebra` | The 3-momentum integral `∫d³k (ℏω_k/2)ζ(k/k_UV)` is a vacuum-fluctuation sum over modes; the AST treats integration as multiply, but the integration measure `d³k` is not an `ExprNode` and `ω_k` requires a dispersion relation symbol. Could be encoded but bracket-check leads into the cosmological-constant problem; not first-wave material. |
| 21 | established | `no-tensor` | `(g^rr/√g^tt)` — explicit metric components, retarded Green's function with limit and partial derivatives in radial coordinate. |
| 22 | speculative | `no-r2-gap` | (effectively) — `log(A/l_P²)` term is itself flagged as area-law-doubled; finite-T extension not derived. Even if treated as raw, the log of a length-ratio requires explicit dimensionless-handling that the AST does not enforce on log arguments. Best to wait. |
| 23 | speculative | `no-r2-gap` | R2 reformulation; third term vacuous under τ_P substitution. |
| 24 | speculative | `no-r2-gap` | R2 reformulation; multiplicative form admits η > 1. |
| 25 | highly-speculative | `yes-ready` | `t_OR = ℏ/(Δm c² Δx/ℓ_P)` — short scalar identity. The known issue (spurious Δx/ℓ_P factor vs. Penrose's E_G ~ G(Δm)²/Δx) is documented in `known_issues` but is *not* an R2 gap-spec block; the formula in `formula_latex` is the published Hameroff-Penrose-extended ansatz, and we encode what's there with status pinned as `highly-speculative`. |
| 26 | established | `yes-ready` | WKB tunneling rate `Γ = ν_0 exp(−(2/ℏ)∫√(2m(V−E))dx) · f(T,pH,EM)`. The integral sub-expression is encodable (1D over dx); `f(T,pH,EM)` is treated as an opaque dimensionless prefactor. |
| 27 | speculative | `no-operator-algebra` | The susceptibility `χ(ω)` involves a Fourier integral over `⟨δF(t)δx(0)⟩` — a correlation function that is operator-valued in the standard formulation. Could attempt as classical, but the formula's intent is operator-correlation; encoding would mislead. |
| 28 | speculative | `no-functional` | Variational principle `δ∫(...)dt = 0`; the AST has no functional-derivative primitive. |
| 29 | speculative | `no-tensor` | Already has `dimensional_signature: '[energy]'` from R1, but the integral `∫T^μν δg_μν √(−g) d⁴x` is over a tensor contraction; tensor-blind AST cannot validate the integrand's index structure. |
| 30 | highly-speculative | `no-r2-gap` | R2 reformulation; LHS rank-2 vs RHS scalar mismatch + ill-defined operator structure. |
| 31 | speculative | `no-r2-gap` | R2 reformulation; (ρ²ℓ_P⁴)^{1/4} vs Ricci [L^−2] mismatch + V^{2/4} typo, but full fix is structural rewrite to Benincasa-Dowker. |
| 32 | speculative | `no-path-integral` | `\|ψ⟩_B = ∫dg U(g)\|ψ⟩_A ⊗ \|g⟩_frame` — group-integration over a quantum frame; no operator/group primitive in the AST. |
| 33 | speculative | `no-r2-gap` | R2 reformulation; wrong T → 0 limit + dynamic exponent z absent. |
| 34 | established | `yes-ready` | `n_defect = (τ_Q/τ_0)^{−dν/(1+zν)} · exp(−m c²/(k_B T_reh))`. Pure scalar; non-trivial exponent involves dimensionless ratios + Boltzmann factor. |
| 35 | established | `no-tensor` | 4-point CFT correlator `⟨O₁O₂O₃O₄⟩ = Σ C₁₂ C₃₄ g_{Δ,ℓ}(u,v)` — operator-valued correlation function with conformal block structure; no scalar reduction. |
| 36 | speculative | `no-r2-gap` | (effectively) — hybrid linear blend is bespoke ansatz, not standard MOND; the issue says "reformulation". |
| 37 | speculative | `no-r2-gap` | R2 reformulation; c(t) ansatz original to framework. |
| 38 | speculative | `no-r2-gap` | R2 reformulation; entropic-gravity form fails deep-MOND limit. |
| 39 | speculative | `no-functional` | Functional renormalization-group flow at the schematic level only; truncation must be specified. |
| 40 | established | `yes-ready` | Composite Higgs potential `V(h) = −αf² sin²(h/f) + βf⁴[sin⁴(h/f) − sin²(h/f)cos²(h/f)]`. Treating `sin(h/f)`, `cos(h/f)` as dimensionless symbols (since h/f is dimensionless), the potential is a polynomial in those × powers of f. The status_text in `notes` flags "dimensionally inhomogeneous as written" — we MUST verify the encoding is dimensionally homogeneous; if not, this becomes `no-r2-gap`. **Verified during encoding scratch:** treating sin/cos as dimensionless yields `[energy²]`-vs-`[energy⁴]` mixing — inhomogeneous. **Re-classified `no-r2-gap`** post-investigation. |
| 41 | speculative | `yes-ready` | Swampland `m(φ) = m₀ exp(−α\|φ−φ₀\|/M_P)` — pure scalar exponential. |
| 42 | highly-speculative | `no-operator-algebra` | Quantum state superposition `\|ψ⟩ = α\|smooth⟩ + β\|firewall⟩`; no scalar reduction. |
| 43 | highly-speculative | `no-r2-gap` | R2-equivalent issues: dimensional + sign issues flagged spec-edit but no concrete fix proposed; mixing dimensionless `S_entanglement` with stress-energy integral. |
| 44 | speculative | `no-tensor` | Soft-hair charge with explicit complex-coordinate 2-form integration `dz ∧ dz̄`; no differential-form primitive. |
| 45 | speculative | `no-inequality` | TCC bound `N_e < log(M_P/H_inf) − γ log(r/0.01)` — inequality, not equation. |
| 46 | highly-speculative | `no-path-integral` | Multiverse measure `P[O] = ∫dμ[g,φ] W[g,φ] δ(...)` — functional integration with undefined measure. |
| 47 | speculative | `yes-ready` | Already has `dimensional_signature: '[L^-3 T^-1]'`. ODE balance `dY/dt + 3HY = ⟨σv⟩_SM n_p n_n − ⟨σv⟩_dark n_χ² ε_transfer`. Encode each term and check balance. |
| 48 | established | `no-operator-algebra` | Already has `dimensional_signature: '[frequency]'` (rate-form), but the GRW master equation has commutator `[H,ρ]`, anti-commutator `{L^†L,ρ}`, density matrix ρ, position operator r̂; cannot encode in AST. (Hand-computed `[frequency]` is honest at the rate level.) |
| 49 | speculative | `no-operator-algebra` | Quantum mutual information `I(S:F_k)`; not a primitive in the AST. |
| 50 | highly-speculative | `no-tensor` | Action `S = ∫d⁴x [L_forward + L_backward + λφ_+φ_-δ⁴(x−x_m)]` — Lagrangian densities; no tensor field primitive. |

## Triage breakdown

- **`yes-ready` (5):** BE-19, BE-25, BE-26, BE-34, BE-41, BE-47.
- **`yes-after-symbol-stub` (0):** none in this triage.
- **`no-r2-gap` (12):** BE-15, BE-16, BE-17, BE-22, BE-23, BE-24, BE-30,
  BE-31, BE-33, BE-36, BE-37, BE-38, BE-40, BE-43.
- **`no-operator-algebra` (5):** BE-20, BE-27, BE-42, BE-48, BE-49.
- **`no-tensor` (5):** BE-18, BE-21, BE-29, BE-35, BE-44, BE-50.
- **`no-functional` (2):** BE-28, BE-39.
- **`no-path-integral` (2):** BE-32, BE-46.
- **`no-inequality` (1):** BE-45.

(BE-40 was re-classified from `yes-ready` to `no-r2-gap` during scratch:
the spec form mixes `[energy²]` and `[energy⁴]` terms unless one
postulates `sin²(h/f)` to be dimensionless *and* `α`, `β` to absorb
hidden powers of f². The `notes` field already calls this out as
"dimensionally inhomogeneous as written," so encoding the broken form
would lock in the gap. Honest-claude: skip.)

## Wave-1 plan

The 6 `yes-ready` candidates that pass the (a) `yes-ready` × (b)
not-R2-gap × (c) bracket-checkable triple gate:

1. **BE-19** Quantum Bounce — Friedmann + bounce term; bracket-check: at
   `ρ = ρ_crit`, RHS reduces to `Λ/3`; at `Λ = 0, ρ << ρ_crit`, recovers
   standard Friedmann.
2. **BE-25** Orch-OR collapse time — `t_OR = ℏ/(Δm c² Δx/ℓ_P)`; bracket-
   check: 1 mg sphere displaced 10 nm gives ~ms. Status pin
   `highly-speculative` (does not promote).
3. **BE-26** DNA mutation tunneling — WKB rate; bracket-check: hydrogen-
   bond proton transfer ~10^-3 to 10^3 /s.
4. **BE-34** Kibble-Zurek with curvature — defect density per Planck
   volume; bracket-check: `τ_Q = τ_0` with full Boltzmann gives `n_defect
   = exp(−m c²/(k_B T_reh))`.
5. **BE-41** Swampland distance — `m(φ₀) = m₀` (identity at the
   reference point), `m → 0` as `α(φ−φ₀)/M_P → ∞`.
6. **BE-47** BBN dark-sector coupling — already has
   `dimensional_signature: '[L^-3 T^-1]'`; encode each term of the ODE and
   verify the balance.

These six are atomic, bracket-checkable, and not on the R2 gap list.
Each gets one TDD-strict commit.

## Skipped explicitly

- **BE-22** (topological entanglement) — `log(ξ/a)` and `log(A/l_P²)`
  require careful dimensionless-handling.
- **BE-43** (wormhole dynamics) — `S_entanglement` is operator-derived.
- **BE-45** (TCC bound) — inequality.
- **BE-49** (Quantum Darwinism) — quantum mutual information not in AST.
- **BE-40** (Composite Higgs) — re-classified `no-r2-gap` after scratch.

## Future waves

After Wave 1, BE-39 might become encodable if a functional-derivative
primitive lands, BE-21 if the AST learns metric-component-blind tensor
contractions, and BE-20 if a dispersion-relation primitive lands.
Daniel will decide.
