# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
from v0.1.0 onward.

## [Unreleased]

### Added — canonical-only discovery (run the analysis without bridges)

- **`CANONICAL_GRAPH` / `canonicalToEdges` / `CANONICAL_CONSTANTS`**
  (`src/composition/canonical-graph.ts`): project the standard-physics L-layer
  (`CANONICAL_EQUATIONS`) into the composition-graph edge vocabulary, so the
  existing discovery/analysis funnel can run on textbook physics **alone**, with
  the speculative 44-bridge catalog excluded. The bridge-free counterpart to
  `CATALOG_GRAPH`. Each canonical equation becomes an `established` `law` edge;
  universal constants (G, c, ℏ, k_B, ε₀, σ_sb, b, e, m_e) are **baked into the
  evaluator** (parity with the bridge graph — they are not graph nodes), so the
  candidate proposer stays about physical observables and the numeric filter
  fires from the standard `{ mass }` anchor. Constant-baking is **dimension-
  guarded**: a governing name is baked only if its name *and* dimension match,
  preventing a future same-named variable (e.g. eccentricity `e`) from being
  silently replaced by a constant. The dimensional monomial supplies the power
  law (leading dimensionless constant taken as 1); where dimensions cannot pin a
  monomial (`monomial: null`, e.g. Newton's two same-dim masses) the edge
  carries a NaN evaluator, so `retrodict` abstains rather than polluting the
  consistency check. Exported from the public manifest alongside `CATALOG_GRAPH`.
- **CLI `--source=catalog|canonical|both`** on `upt discover` / `candidates` /
  `map` (`bin/upt.mjs`): `canonical` runs the funnel on standard physics alone;
  `both` uses the bridges plus the canonical established-physics backbone;
  `catalog` (default) is unchanged. `upt discover --source=canonical` surfaces
  textbook-only cross-domain candidates (e.g. `compton-wavelength ≟
  de-broglie-wavelength`) and doubles as a **regression harness**: discovery on
  canonical-only yields **0 `contradictory`** verdicts (standard physics, fed to
  the inference suite, stays self-consistent), pinned in
  `tests/composition/canonical-graph.test.ts`.

### Changed — architecture-doc counts refreshed from the dependency graph

- Re-ran `npm run docs:deps` and reconciled the hand-maintained current-state
  docs against its reports: **174 source files · 1245 exports (489 re-exports)**,
  composition module **26 files**, and the live suite **2806 passing across 275
  files** (coverage 160/174 = 92.0%). Updated `README.md`,
  `docs/architecture/ARCHITECTURE.md` (stats table, per-module headers, the
  module-distribution table, suite-size line, `package.json` 0.22.0 → 0.23.0),
  and the `docs/architecture/COMPONENTS.md` ASCII module diagram. The generated
  `DEPENDENCY_GRAPH.md` / `TEST_COVERAGE.md` / `dependency-graph.{json,yaml}`
  reports were already current. Historical `docs/planning/*` artifacts are
  point-in-time records and were left unchanged.

### Added — identity-consequence surfacer (`discover --derive`), v0.24.0 pilot

- New internal module `src/composition/proposed-bridges.ts`:
  `deriveProposedBridges()` turns each canonical-only `promising` discovery
  identification into the ONE algebraic relation it implies, by **monomial
  elimination** of the two source equations' `scalarAst` forms. The pilot emits a
  single honest proposal — the "Landauer photon" `ν = (k_B·ln2/h)·T`
  (`[frequency]`, ≈ 4.33 THz at 300 K) — from `erasure-energy ≟ photon-energy`
  (`CE-landauer = CE-planck-einstein`). Surfaced via `upt discover --derive`
  (paired with `--source=canonical`; `propose`/`derive` command names were already
  taken). Pinned by `tests/composition/proposed-bridges.test.ts`.
- A proposal is the algebraic consequence of an **UNADJUDICATED** identification —
  NOT a new relation and NOT a bridge (Part-VI §XXVII-B). Epistemic firewall:
  `ProposedBridge.status` is the literal `'unadjudicated'` (NOT a
  `BridgeEquationStatus`); the type omits every physics-judgment field; the
  generator never writes `BRIDGE_EQUATIONS` (pinned by a reference-identity +
  content-hash test) and proposals never enter `CANONICAL_GRAPH`. Two
  admissibility gates: both sources must have a non-null `dimensional.monomial`
  (determinate) and be `epistemicStatus: 'fully-quantitative'` — the latter gates
  out `CE-jarzynski` (its prefactor is an operator-valued stub), so the pilot is
  one proposal, not two near-duplicates.
- `promoteProposal(proposal, {citation, status, reviewRef})` gates promotion: it
  THROWS `MissingEvidenceError` unless every human input is present (operationalises
  "null, not guessed") and does NOT synthesise a catalog entry.
- New registry accessor `canonicalByTarget(name)` (`src/canonical/registry.ts`).
- **`PROPOSED_BRIDGES` review surface** (`toProposedEntry` / `ProposedBridgeEntry`):
  renders each derived proposal into the catalog's field shape — `name`,
  `category` (`Z` / "Machine-Derived Identity Consequences"), `bridges` (the source
  domains, e.g. `['information','quantum']`), `context`, `formula_latex`,
  `dimensional_signature`, honest `references` (a derivation note + clearly-tagged
  SOURCE-equation citations, never a fabricated citation for the derived relation),
  and `known_issues` — but in its OWN registry with `status: 'unadjudicated'`.
  `BRIDGE_EQUATIONS` stays the faithful 44-bridge spec encoding and is never
  mutated (per the chosen "separate surface" disposition; the Landauer photon is a
  dimensional coincidence, not spec physics).
- **Widened scope:** `deriveProposedBridges()` is now candidate-set-agnostic —
  `discover --derive` forwards whichever `--source=catalog|canonical|both` graph is
  selected. Honest boundary: a candidate yields a proposal only when both endpoints
  are canonical targets (a bridge→scalarAst adapter for non-canonical endpoints
  remains future work).
- **`dedupByNormalForm`:** collapses proposals that derive the same relation (equal
  `normalForm` up to dimensionless constants AND equal target dimension) into one,
  recording the collapsed identifications in `alsoDerivableFrom` (Design §9 #2).
- Design, plan, and the Adam+Eve adversarial review under
  `docs/planning/v0.24.0-{Design,Implementation-Plan,Review-Findings}.md`.

### Added — declared compton↔de-Broglie link + canonical-only baseline note

- Registered `de-broglie-wavelength → compton-wavelength` in
  `QUANTITY_IDENTIFICATIONS` (`src/composition/compose.ts`). The Compton
  wavelength is the de Broglie wavelength in the relativistic limit `p = mc`, so
  at the composition graph's quantity-KIND resolution they name one matter-
  wavelength node. Folded ONTO `compton-wavelength` (the anchor-determinable,
  sourced node) so the genuine `planck-length ≟ compton-wavelength` scale clash
  survives the magnitude gate. Effect on `--source=canonical`: the
  correspondence moves from a re-discovered `promising` candidate to a declared
  link, de-Broglie's edge joins the anchored cluster (cluster 15 → 16 edges; map
  12 → 11 components), and the funnel drops to 33 candidates → 2 promising, still
  0 contradictory. No bridge uses either name, so the bridge composition engine
  is unaffected. Pinned in `tests/composition/canonical-graph.test.ts`.
- Added `docs/research/v0.23.0-canonical-only-baseline.md` (indexed in
  `docs/research/README.md`): the canonical-equation L-layer run on its own as
  the standard-physics consistency baseline — 11 map components, funnel 33 → 2
  flagged coincidences (`erasure-energy`/`free-energy-difference ≟
  photon-energy`) · 5 genuine clashes · 0 contradictory — recording the three
  2026-06-18 discovery-quality fixes.

### Changed — unified canonical variable names (de-fragments the graph)

- Renamed the fragmented governing-variable aliases in `src/canonical/entries/*`
  to the shared graph vocabulary: **`T` → `temperature`** (Landauer, Jarzynski,
  Stefan–Boltzmann, ideal-gas, Wien) and **`M` → `mass`** (Hawking, light-
  deflection, perihelion). Newton's `m_1`/`m_2` became `mass`/`secondary-mass` —
  not both `mass`, because `buckinghamPi` requires unique governing names and the
  two distinct masses are exactly the free mass-ratio that keeps Newton's
  `monomial: null`. Only the `dimensional.governing` names changed; the
  `scalarAst` leaf symbols are left as-is so `normalForm`/linkage (and the
  `restates-canonical` recoveries) are unaffected. Effect on `--source=canonical`:
  the linkage map de-fragments (14 → 12 components; anchored cluster 8 → 15 edges;
  composition chains 1 → 5) and discovery drops the namespace-artifact candidates
  (`mass ≟ m_1`, `mass ≟ m_2`, `temperature ≟ T`) — funnel 66 → 44 candidates,
  still 0 contradictory. Pinned in `tests/composition/canonical-graph.test.ts`.

### Fixed — discovery magnitude gate false-rejected atomic-scale links

- Added sourced representative values for `compton-wavelength` (2.43e-12 m) and
  `bohr-radius` (5.29e-11 m) to `src/composition/representative-values.ts`. The
  magnitude gate previously had no sourced value for these, so it fell back to
  evaluating them at the `{ mass: M_sun }` anchor — which makes a `1/mass`
  quantity like the Compton wavelength absurdly small (~10⁻⁷³ m) and produced a
  spurious ~61-order `magnitude-clash` against the (fixed) Bohr radius. With real
  magnitudes the gate sees the two atomic scales ~1 order apart and no longer
  falsifies the link (it becomes `inert`). The genuine clashes
  (`planck-length ≟ bohr-radius` ~24 orders, etc.) are unaffected. Surfaced by
  running `upt discover --source=canonical`; pinned in
  `tests/composition/canonical-graph.test.ts`.

### Added — CLI documentation

- **`cli/README.md`**: a full reference for the `upt` command-line tool — all 15
  commands and their aliases, the `--source=catalog|canonical|both` flag, the
  three ways to run it, input syntax, flags, exit codes, and troubleshooting.
  The root README's Quick Start now links to it and lists the `canonical` /
  `recover` / `discover --source=canonical` commands.

## [0.23.0] — 2026-06-18

Dependency health (release pre-flight): `npm audit` → 0 vulnerabilities;
`npm outdated` → none. No dependency changes in this release.

### Added — canonical tranche growth (general relativity)

- Three standard-physics GR canonical entries: **Hawking temperature**
  `T_H = ℏc³/(8πGMk_B)` (restates bridge 42 — a 2nd F4 `restates-canonical` with
  exact numerical recovery), **Eddington light-deflection** `α = 4GM/(c²b)`
  (partners bridge 51), and **Einstein perihelion precession**
  `Δφ = 6πGM/(c²a(1−e²))` (partners bridge 52). Registry 22 → 25 entries;
  coverage gap 39 → 37; `restates-canonical` links 1 → 2.

### Added — Jarzynski canonical partner (BE-29)

- **`CE-jarzynski`** (`ΔF = −k_B T ln⟨exp(−W/k_B T)⟩`, domain `statistical`,
  `epistemicStatus: 'scalar-up-to-constant'`): the L-layer partner BE-29 lacked.
  `restatesBridge: '29'`, so the scan reports `CE-jarzynski ≡ bridge 29` as a
  declared restatement (BE-29's own ground truth). Registry 25 → 26 entries;
  coverage gap 37 → 36; `restates-canonical` links 2 → 3.
  See `docs/research/BE-29-Landauer-Recovery.md`.

### Changed — normal-form stub-identity tagging

- `normalForm` (`src/canonical/normal-form.ts`) now distinguishes a dimensionless
  **constant** (numeric literal, registered constant `ln2`/`4pi`, spelled-out
  `\d*pi`/`ln_2_constant`) from a dimensionless **stub** (any other named
  dimensionless symbol — a parameter or a functional like `ln⟨e^−βW⟩`). Constants
  stay droppable "up to a factor"; stubs are kept as distinct `stub:<name>` tokens.
  Effect: the two BE-29 form-coincidences (`CE-landauer ~ 29`, `CE-jarzynski ~ 16`)
  demote from `recovers` to `dimensional-only` (ln2 ≠ ln⟨e^−βW⟩ — a substantive
  factor, not a constant), while the three declared restatements (Landauer↔16,
  Hawking↔42, Jarzynski↔29) are preserved. **This supersedes the [0.22.0] note
  below describing `Landauer ~ bridge 29` as a `recovers`.**

### Changed — discovery funnel hardening

- `discover` magnitude gate now falls back to a quantity's value **at the
  registered anchor** (via `forwardEvaluate`) when the static representative-value
  table has no entry — so graph-derived quantities (`schwarzschild-radius`,
  `thermal-de-broglie-wavelength`) stop abstaining, falsifying scale-clashes like
  `schwarzschild-radius ≟ foerster-radius` and `mass ≟ planck-mass`.
- A generic↔specialization identification whose one name is a strict hyphen-token
  subset of the other (`mass` ⊂ `reference-mass`) is barred from `promising`
  (demoted to inert) as near-tautological.
- Sourced BE-24/BE-26 representative values added (`donor-acceptor-distance` ~5 nm,
  `barrier-width` ~1 Å, `barrier-height` ~0.2 eV, `tunneling-mass` = proton);
  speculative-scale quantities deliberately keep abstaining (documented).
- Net real-graph funnel: **23 → 12 promising · 6 → 20 magnitude-clash**.

### Docs

- Regenerated the dependency-graph + test-coverage reports (`npm run docs:deps`)
  and refreshed the drifted hand-written stats in ARCHITECTURE / COMPONENTS /
  README / CLAUDE: 173 source files, 8 modules (the `canonical` module is now
  documented), 1236 exports, suite ~2796. Added a COMPONENTS Canonical-Module
  section + the `BE-29-Landauer-Recovery.md` research note.

### Deferred — composition-derived recovery

- Extending linkage from "bridge RHS *equals* a canonical up to a factor" to "a
  *composed chain* derives a canonical" is **deferred as premature**: only 5 of
  41 composition edges carry a symbolic form, and the one registered chain (CT-1,
  Hawking-temp ∘ Landauer) composes to a mass-expression that matches no canonical.
  Revisit once symbolic-form coverage and the canonical tranche grow.

## [0.22.0] — 2026-06-18

Dependency health (release pre-flight): `npm audit` → 0 vulnerabilities;
`npm outdated` → none. No dependency changes in this release.

### Added — bridge↔canonical linkage + discovery kinds + CLI (Sub-projects B/C/D)

- **B — `src/canonical/linkage.ts`**: validate bridges against standard physics.
  `normalForm` (`src/canonical/normal-form.ts`) is a structural hash *up to
  dimensionless multiplicative factors* (flatten products, drop dimensionless
  factors, sort commutative operands, keep exponents). `classifyLinkage` /
  `scanLinkages` compare each canonical scalar-AST against each bridge RHS:
  dimensional + structural + best-effort numerical recovery (agreement up to a
  constant factor). The **F4 circularity guard**: a structural match is
  `restates-canonical` (a trivial X≡X, NOT a discovery) only when the canonical's
  `restatesBridge` names that bridge; otherwise it's a genuine `recovers`. Real
  scan: Landauer ≡ bridge 16 (`restates-canonical`, recovery exact); Landauer ~
  bridge 29 Jarzynski (`recovers` — both are `energy = k_B·T·dimensionless`); 17
  `dimensional-only`. Exported from the package root.
- **C — discovery canonical kinds**: `VettedCandidate` gains `canonicalKinds`
  (standard-physics domains whose canonical *target* shares the candidate's
  dimension — the alignable axis across the two namespaces) and `touchesCanonical`
  (an endpoint is a canonical quantity name). Both additive/informational — no
  verdict or score change.
- **D — CLI**: `upt canonical` lists the registry (fidelity, domain, partners,
  coverage gap); `upt recover` runs the linkage scan, grouping
  `restates-canonical` / `recovers` / `dimensional-only`.

### Added — canonical-equation registry (Sub-project A)

- New `src/canonical/` module: a `CanonicalEquation` type and queryable registry
  (`CANONICAL_EQUATIONS`, `CANONICAL_BY_ID`, `canonicalById`, `canonicalByDomain`)
  — the ground-truth L-layer of the tensor (Π = L + B + E), the textbook *answer
  key* that bridge equations are validated against. Entries carry multi-fidelity
  encodings (L0 dimensional / L1 scalar-AST / L2 field-equation) plus
  epistemic-honesty fields (`epistemicStatus`, `freeDimensionlessGroups`) and
  provenance (`restatesBridge`, `partnerBridges`). Design + Adam/Eve review:
  `docs/planning/Canonical-Equation-Registry-A-*.md`.
- **22 canonical entries** seeded: 9 dimensional classics (pendulum, Kepler III,
  Schwarzschild radius, string wave speed, Planck length/mass/time, Compton,
  thermal de Broglie); L1 gravity/thermo (Bekenstein–Hawking area-form, Landauer,
  Newton, Stefan–Boltzmann flux, ideal gas); L1 quantum/EM (Coulomb,
  Planck–Einstein, de Broglie, Bohr radius, Wien, Lorentz-force magnitude); the
  Einstein field equation at L2 (a validated `EinsteinFieldEquationNode`) and the
  Friedmann equation at L1.
- L0 fields (`monomial`, `freeDimensionlessGroups`) are **derived from the
  Buckingham-π engine** so they are consistent by construction
  (`monomial !== null ⟺ freeDimensionlessGroups === 0`). Forms dimensions cannot
  pin (Newton, Coulomb, Bekenstein–Hawking) carry a free group; their scalar-AST
  is the authority. Numeric-prefactor tests guard area-vs-radius, log-base, and
  flux-vs-power slips that dimensional validation cannot catch.
- `seedCanonicalLaws` + `canonicalToLaw` populate the (previously empty) tensor
  L-layer; `CANONICAL_TENSOR_CONFIG` provides axes covering every canonical
  regime. Coverage helpers (`partneredBridgeIds`, `bridgesWithoutCanonicalPartner`)
  log the 39 catalog bridges that still lack a canonical correspondence partner.
- Added constants `epsilon_0`, derived `sigma_sb`, `h` (Planck), and `b` (Wien
  displacement, new `B_WIEN_SI`) to `src/composition/symbolic-constants.ts` so the
  Coulomb/Bohr/Stefan–Boltzmann/Planck–Einstein/de-Broglie/Wien scalar-ASTs
  evaluate numerically, not just dimensionally. The full registry is re-exported
  from the package root.

### Added — discovery order-of-magnitude falsifier

- `discover` now applies a **magnitude gate**: an identification `a ≡ b` is
  rejected as a new `magnitude-clash` verdict when both quantities have a
  representative value and those values differ by more than N orders of
  magnitude (`DiscoveryOptions.maxOrdersOfMagnitude`, default 3). This is the
  falsifier the single-anchor `retrodict` check structurally cannot make — it
  cannot evaluate the quantities a dimensional coincidence "unlocks", so it
  never contradicts them. New `src/composition/representative-values.ts` holds a
  sourced, order-of-magnitude table (`REPRESENTATIVE_VALUES` + `representativeValue`)
  for **scale-specific quantities only** — generic `mass`/`energy`/`length` are
  intentionally absent (no single representative scale → the gate abstains).
- It is a **partial** falsifier: it abstains (`magnitudeChecked: false`,
  `ordersApart: null`) whenever either value is unknown, so it never
  false-rejects on missing data. On the real catalog it falsifies 6 scale-clash
  decoys (e.g. `landauer-erasure-energy ≟ planck-mass-energy` ~29.8 orders)
  while correctly leaving genuinely close coincidences
  (`grw-localization-rate ≟ hubble-rate` ~1.7 orders) for physicist review.
- `VettedCandidate` gains `ordersApart` and `magnitudeChecked`; `upt discover`
  reports the `magnitude-clash` group with the orders-apart gap. The
  representative-value table is injectable via `DiscoveryOptions.representativeValues`
  so the forthcoming canonical-equation registry can supply it centrally.

### Fixed

- `bin/upt.mjs` failed to load on Windows (`Could not load the built package` /
  `Only URLs with a scheme in: file, data, and node are supported … Received
  protocol 'c:'`). Node's ESM dynamic `import()` rejects bare absolute Windows
  paths; the `dist()` path helper now returns a `file://` URL via `pathToFileURL`.
  All 13 CLI subcommands (`audit`, `predict`, `discover`, `coverage`, …) now run
  on Windows.

## [0.21.0] — 2026-06-17

### Changed — BE-26 (DNA tunneling): faithful Gamow-exponential re-encoding

- The first real-bridge use of the v0.20 differentiable definite integral. BE-26's
  WKB exponent `(2/ℏ)∫√(2m(V−E))dx` now carries explicit barrier-endpoint bounds
  `x₁, x₂` (definite integral), and the Gamow factor is encoded as
  `transcendental(exp, −1·WKB)` instead of an `exp(-WKB_arg)` symbol stub. Because
  the integrand `√(2m(V−E))` is constant in x (`V_minus_E` is a constant ENERGY
  symbol, not `V(x)`), 16-pt Gauss–Legendre is **exact** and equals
  `√(2m(V−E))·(x₂−x₁)` — matching the canonical rectangular-barrier evaluator
  (asserted to <1e-9 rel. err.).
- `bridgeGradientASTById('BE-26', …)` now differentiates the tunneling rate
  **exactly** w.r.t. m, V_minus_E, x₁, x₂ (physical signs verified: ∂Γ/∂m,
  ∂Γ/∂(V−E), ∂Γ/∂x₂ < 0; the `f(T,pH,EM)` interpolation factor stays an opaque
  stub). The `exp` of the DIMENSIONLESS WKB exponent is DIMENSIONLESS, so the
  round-trip dimensional_signature (`[frequency]`) is unchanged.
- Adam + Eve both GREEN; both noted the encoding is *more* honest than the prior
  bound-less integral (which implied a `V(x)` generality the `V_minus_E` symbol
  never had). Domain guards (caller's): `V_minus_E ≥ 0`, `m > 0`, `x₂ ≥ x₁`
  (Eve: `∂Γ/∂x₁ = −∂Γ/∂x₂`, verified).

### Dep-health (release pre-flight)

- `npm audit` → **0 vulnerabilities**.

## [0.20.0] — 2026-06-17

### Added — differentiable definite integrals (`integral` node + Gauss–Legendre)

- The `integral` node gains **optional** `lower`/`upper` bound fields. With bounds
  it is a *definite* integral: numerically evaluable and reverse-mode-AD
  differentiable. Bound-less integrals are unchanged (abstract / dimensional-only;
  existing BE-26, BE-44 unaffected).
- New `src/numerical/quadrature.ts` — 16-point Gauss–Legendre (`integrateGaussLegendre`,
  `GAUSS_LEGENDRE_16`). Both the numerical lowering and the traced AD lowering
  evaluate `∫ₐᵇ f dx ≈ (b−a)/2·Σ wᵢ·f(xᵢ)`, scope-binding the integration variable
  to each abscissa.
- `bridgeGradientAST` now differentiates definite integrals: the Leibniz
  parameter-gradient `∂/∂θ ∫ f dx = ∫ ∂f/∂θ dx` and the boundary-term
  bound-gradient `∂/∂b`. Built from traced ops so AD handles both with no
  special-casing; a scoped bound-variable environment supports **nested** `∫∫`.
  `astDifferentiableBridgeIds`/coverage predicate accept bounded integrals.
- Validator: definite-integral bounds must match the integration variable's
  dimension; the integral's dimension is `dim(integrand)·dim(over)` as before.

**Honesty (Adam-vetted):** the gradient is **exact for the quadrature**, which
*approximates* the true integral for non-polynomial integrands (exact for constant
or polynomial-degree-≤31 integrands; the bound-gradient `∂Q/∂b` likewise
approximates `f(b)` exactly only in that regime). Fixed n=16 GL is unreliable for
highly oscillatory integrands or singularities at the bounds — out of scope.
Differentiating w.r.t. the integration variable is rejected.

Note: BE-26 (WKB `∫√(2m(V−E))dx`) could now be re-encoded with explicit barrier
bounds to expose m, V−E (its `f(T,pH,EM)` interpolation factor stays a stub) — that
is a per-bridge physics-modelling decision, deferred to its own change.

### Clarified — dimensionful fractional powers were never actually "deferred"

The v0.18.0/v0.19.0 notes described `sqrt`/`cbrt` of a **dimensionful** quantity as
deferred, "needing rational-exponent Dimension algebra." That was inaccurate, and
this corrects the record:

- The `Dimension` exponents are already `number` (the algebra was built for rational
  exponents), and `^` with a **numeric-literal** exponent already works on a
  dimensionful base — `(m)^0.5` validates to `[M^0.5]`, lowers numerically, and is
  exactly differentiable (`TapedTensor.pow(k)` handles fractional `k`). BE-12
  (thermal de Broglie `λ_T ∝ T^(−1/2)`) has been exactly AD-differentiable all
  along. New regression guard: `tests/dimensional/dimensionful-power-ad.test.ts`.
- What does *not* exist is a dedicated `sqrt`/`cbrt` **node**, but that would be
  pure ergonomic sugar (redundant with `^0.5` / `^(1/3)`) — not a capability gap.
- The genuinely un-AD-able bridges (BE-26, BE-29, BE-38, and structurally BE-17/20/44)
  are blocked by **non-scalar structure** — integrals (BE-26 WKB `∫√…dx`), ensemble
  averages (BE-29 `⟨…⟩`), interpolation-function stubs (BE-26 `f()`, BE-38 `ν(z)`),
  tensors (BE-17), and special nodes (BE-20/44) — not by fractional powers.
  `bridgeGradientNumerical` already serves their gradients (finite differences over
  the plain-JS evaluator). Closed-form AST-AD for those is research-level
  (differentiating integrals / interpolations) and out of scope.

## [0.19.0] — 2026-06-16

### Added — `abs` scalar-AST node

- New `ExprNode` member `{ kind: 'abs', arg }` — absolute value `|x|`. Unlike the
  transcendentals, abs is **dimension-preserving** (`[|x|] = [x]`), so it gets its
  own node rather than being a `TranscendentalFn`. Wired through the validator,
  numerical lowering (`Math.abs`), traced AD lowering (→ `TapedTensor.abs`,
  adjoint `sign(x)`), and the coverage predicate. Lets bridges encode `|φ−φ₀|`
  etc. with the inner variables visible to differentiation.

### Changed — faithful re-encodings (BE-25, BE-40, BE-41, BE-45, BE-46)

The remaining transcendental-stub bridges whose expansion **exposes real
variables** (Adam's guideline) are now encoded with grammar nodes instead of
opaque typed-stub symbols, so `bridgeGradientASTById` differentiates them exactly:

- **BE-25** (IIT Φ): `log2_ratio_ii` stub → `transcendental(log2, p_cond/p_marg)`.
- **BE-40** (composite Higgs): the `sin²`/`sin⁴`/`sin²cos²` stubs → `sin`/`cos`
  `transcendental` nodes over `h/f`.
- **BE-41** (Swampland): `exp(−α|φ−φ₀|/M_P)` stub → `transcendental(exp, …)` with
  the new `abs` node, exposing α, φ, φ₀, M_P.
- **BE-45** (TCC): the two `log(…)` stubs → `transcendental(ln, …)` (natural log,
  matching the evaluator) over the exposed dimensionless ratios.
- **BE-46** (anthropic measure): `exp_factor` stub → `transcendental(exp, −α/Λ)`.

All are dimension-preserving, so every bridge's round-trip `format(infer(rhs))`
== `dimensional_signature` is unchanged (the 42-bridge round-trip still passes).

### Not expanded (genuinely not exposable)

- **BE-29** (ln⟨e^(−βW)⟩) — the ensemble average stays an opaque stub.
- **BE-26** (DNA tunneling) — its WKB argument has `sqrt` of a *dimensionful*
  quantity (the deferred rational-exponent case) plus an interpolation-function
  stub `f(T,pH,EM)`. **BE-38** likewise carries an interpolation stub `ν(z)`.

### Dep-health (release pre-flight)

- `npm audit` → **0 vulnerabilities**.

## [0.18.0] — 2026-06-16

### Added — `transcendental` scalar-AST node (widens exact-AD coverage)

- New `ExprNode` member `{ kind: 'transcendental', fn, arg }` + the `@public`
  `TranscendentalFn` type (`exp`/`ln`/`log2`/`log10`/`sin`/`cos`/`tan`/`sinh`/
  `cosh`/`tanh`). Dimensional rule: the argument must be **dimensionless** and the
  result is **dimensionless** (a function's Taylor series only sums across like
  dimensions when its argument is dimensionless); a tensor argument is rejected.
  Wired through the dimension validator, the numerical lowering (`Math.*`), the
  traced AD lowering (→ `mathts-autograd` `TapedTensor` methods — finally
  exercising the 0.2.0 transcendental ops), and the `astDifferentiableBridgeIds`
  coverage predicate.
- This lets bridges encode `exp`/`log`/`trig` of a real sub-expression instead of
  an opaque typed-stub symbol, so the **inner variables become visible to
  differentiation**. Grammar design vetted by Adam (YELLOW → addressed: see
  deferral below; and the "only expand a stub if it exposes the inner variables"
  guideline, which governed the re-encoding batch).

### Changed — faithful re-encodings (BE-37, BE-34)

- **BE-37 (Shapiro delay):** the `ln_R_ratio` stub symbol → `transcendental(ln,
  R_far/R_near)`. `bridgeGradientASTById('BE-37', 'R_far'|'R_near', …)` now gives
  the exact ∂Δt/∂R.
- **BE-34 (Kibble-Zurek):** the `exp(−m c²/(k_B T_reh))` stub symbol →
  `transcendental(exp, −1 · (m c²/(k_B T_reh)))`, exposing m_defect, c, k_B, T_reh.
- Both are dimension-preserving (the transcendental factor stays dimensionless), so
  every bridge's round-trip `format(infer(rhs))` == `dimensional_signature` is
  unchanged (the 42-bridge round-trip test still passes).

### Deferred

- `sqrt`/`cbrt` of a **dimensionful** argument (`D ↦ D^(1/2)`) is intentionally NOT
  part of this node — it needs rational-exponent Dimension algebra, a separate
  foundational change. Adam flagged this; it is logged as a follow-up.

### Dep-health (release pre-flight)

- `npm audit` → **0 vulnerabilities**.

## [0.17.0] — 2026-06-16

### Added — by-id bridge gradients + an RHS-AST registry

- `src/bridges/rhs-registry.ts`: `BRIDGE_RHS_BY_ID` — one `id → RHS ExprNode` map
  for all 42 AST-encoded bridges (ids 11–50, 53, 54), plus `parseBridgeId`
  (accepts `42`, `'42'`, `'BE-42'`). Previously this id↔RHS mapping was duplicated
  inside the dimensional round-trip test; it's now a single source of truth.
- `bridgeGradientASTById(bridgeId, varName, bindings)` (`@public`): the ergonomic
  entry point requested as a follow-up — `bridgeGradientASTById('BE-42', 'M', { M })`
  resolves the RHS from the registry and delegates to `bridgeGradientAST`. Throws
  for ids with no encoded AST (e.g. BE-51/52, closed-form).
- `astDifferentiableBridgeIds()` (`@public`): returns the catalogued bridge ids
  whose encoded RHS is entirely in the differentiable scalar grammar
  (`symbol` + `op(+ − * / ^)`) — i.e. those `bridgeGradientASTById` differentiates
  exactly. Bridges encoded with integral/tensor/curvature nodes (or whose physics
  hides behind a typed-stub symbol) are excluded.

### Changed

- `tests/bridges/dimensional-signature-catalog.test.ts` now derives its cases from
  `BRIDGE_RHS_BY_ID` instead of re-listing 42 imports (−92 lines), so the round-trip
  both validates each encoding and guards the registry against drift.

### Dep-health (release pre-flight)

- `npm audit` → **0 vulnerabilities**.

## [0.16.0] — 2026-06-16

### Added — `bridgeGradientAST` (exact bridge gradients via AD over the RHS AST)

- `bridgeGradientAST(rhs, varName, bindings)` + `ASTGradientResult` (both
  `@public`, exported from `src/index.ts`): reverse-mode automatic
  differentiation of a bridge's **symbolic RHS AST** (`*_RHS: ExprNode`),
  lowered through `@danielsimonjr/mathts-autograd`'s `TapedTensor` ops. The
  chosen variable is bound to a traced input; every other symbol resolves to a
  constant tape leaf (caller `bindings` → named physical constants → numeric
  literal). The gradient is **exact** (machine precision), not a finite-
  difference approximation — and the plain-JS evaluators stay untouched (P8
  Decision #1). Requires the optional mathts-autograd peer (throws
  `EngineCapabilityError` when absent).
- Scope: the dimensional scalar grammar is `symbol` + `op(+ − * / ^)` —
  transcendentals are absorbed into typed-stub *symbols*, so a stub-encoded
  bridge differentiates with respect to its stub; faithfully-expanded encodings
  (e.g. BE-42 `ℏc³/(8πGM·k_B)`) differentiate exactly. `^` exponents must be
  constant. Validated on BE-42 (`dT_H/dM = −T_H/M`, exact) and cross-checked
  against both the plain-JS evaluator and `bridgeGradientNumerical`; gradient
  accumulation for repeated-variable expressions is covered.

  This closes the long-standing "bridge gradients aren't AD-differentiable" gap
  for faithfully-encoded bridges — the payoff for the
  `@danielsimonjr/mathts-autograd@0.2.0` op-surface work. (`bridgeGradient`'s
  engine path remains unable to trace the plain-JS evaluators; `bridgeGradientAST`
  is the AD answer, `bridgeGradientNumerical` the general fallback.)

### Changed

- Bump the optional `@danielsimonjr/mathts-autograd` peer floor `^0.1.1` →
  `^0.2.0` (currency; the traced lowering uses `divide`/`pow`/`mul`/`add`, all
  present since 0.1.x, so this is hygiene, not a hard requirement).

### Dep-health (release pre-flight)

- `npm audit` → **0 vulnerabilities**.

## [0.15.0] — 2026-06-16

### Added — `bridgeGradientNumerical` (the supported bridge-gradient path)

- `bridgeGradientNumerical(spec, params, opts?)` + `BridgeNumericalGradientResult`
  (both `@public`, exported from `src/index.ts`): a **central finite-difference**
  gradient for the catalog's plain-JS bridge evaluators. Engine-free and
  synchronous. Relative step `h = max(|x|,1)·cbrt(eps)` (the central-diff optimum;
  `sqrt(eps)` is the forward-diff optimum) with the representable-denominator trick
  `dx = (x+h)−(x−h)` so the perturbation survives rounding at astrophysical scales
  (e.g. `M ≈ 2e30 kg`). Same param-validation contract as `bridgeGradient`; gradient
  returned keyed by `paramName`. Design vetted by Adam (YELLOW→addressed: cbrt-eps
  step). Closes the long-skipped real-gradient test placeholder.

### Fixed — honest AD-limitation framing for `bridgeGradient`

- `bridgeGradient` (reverse/forward-mode AD) **cannot** differentiate the plain-JS
  catalog evaluators — empirically it throws even with `MathTSEngine` + autograd
  (the `TapedTensor` does not survive `engine.toNested`; tape/dual AD only sees
  engine-traced ops). Corrected the previously-optimistic comments in
  `bridge-gradient.ts`, `index.ts`, and the test suite that implied installing the
  autograd peer would make AD work. Documented the two distinct failure modes
  (peer-absent → `EngineCapabilityError`; peer-present → still throws).
- Replaced the `describe.skipIf(true)` placeholder (`expect(true).toBe(true)`) with
  real analytic cross-checks: BE-42 Hawking `dT_H/dM = −T_H/M`; BE-11 decoherence
  multi-param `γ = γ₀(λ/λ₀)²`; plus a MathTSEngine regression guard that documents
  the AD limitation. Suite **2625 passing** (+5).

### Tooling — plan-doc audit excludes Brainstorm docs

- `tools/plan-doc-audit` (a non-shipped dev tool) now skips `*-Brainstorm.md`
  ("not promises" idea lists, not completion ledgers) via the new
  `isAuditablePlanDoc` predicate — a brainstorm item naming an existing symbol as
  the TARGET of a gated/future task (e.g. PO-2 `pderiv` opt, NOT implemented) was
  being mis-flagged flip-eligible. Flipped 7 audit-verified-complete checkboxes in
  the v0.2.0/v0.3.0 implementation-plans + findings. `audit:plans` dry-run now
  exits 0.

### Dep-health (release pre-flight)

- `npm audit` → **0 vulnerabilities** (unchanged from 0.14.0; no dependency
  changes in this release).

## [0.14.0] — 2026-06-16

**Single rollup release at final HEAD** — the first npm publish since `0.7.3`.
Subsumes the milestone sections `[0.8.0]` … `[0.11.0]` below (all marked
UNRELEASED — they were never individually published) plus the v0.12 / v0.13 /
v0.14 work recorded in this section (precedent: `0.7.0` rolled up `0.6.1`). The
`package.json` version field, which had lagged at `0.10.0` while feature work
reached v0.14, is reconciled to `0.14.0` here.

**Dep-health snapshot (release pre-flight):** `npm audit` → **0 vulnerabilities**.
Optional `@danielsimonjr/mathts-*` peers updated to latest in-range and the full
suite re-validated against them: autograd 0.1.3, core 0.1.4, expression 0.2.4,
functions 0.2.7, matrix 0.1.6, parallel 0.2.2, tensor 0.1.3, wasm 0.1.3,
workerpool 0.2.0; dev `vitest` 4.1.9. Gates green on Node: `tsc` (src), `tsc -p
tsconfig.tests.json` (strict), `vitest run` (**2620 passing**, 5 intentional
skips + 1 todo), the `GL4_LONG=1` release-prep tier (8 passing), and `smoke`.

### Added — `LabeledTensor.mergeAxes` / `splitAxis` (rank-changing reshape)

Closes the long-deferred rank-changing-reshape gap (`RankPreservationError`'s
"a future `mergeAxes` / `splitAxis` helper" promise). Built on the new explicit
`axisOrder` invariant; design + Adam (design) + Eve (implementation) vet:
`docs/planning/v0.14-MergeAxes-SplitAxis-Design.md`.

- `mergeAxes(keys, merged)` fuses a CONTIGUOUS run of ENGINE axes into one axis
  carrying a caller-supplied label (rank R → R−(k−1)); `splitAxis(key, parts)` is
  the inverse (rank R → R+(parts−1)). Both are pure `engine.reshape` +
  label/axisOrder bookkeeping; the caller owns the new axis identities (no
  composite-id synthesized).
- Axes are addressed in ENGINE-axis space via `axisOf` (not sorted keys), so
  `mergeAxes` is correct on a transposed OR contract-derived (non-sorted)
  `axisOrder` — the contiguity check is over engine positions, which is the only
  run `engine.reshape` (storage-adjacent fusion) can losslessly merge.
- New `@public` errors `AxisMergeError` / `AxisSplitError` (exported, in the
  runtime surface). Guards: <2 keys/parts, unknown key, non-contiguous run,
  duplicate keys, key/id collision with a surviving axis, non-integer/non-positive
  part size, size-product mismatch (pre-engine), and — Eve Y1 — two split parts
  sharing one id (which would otherwise build a `contract`-illegal tensor).
- 15 tests: data-identity merge/split, transposed-tensor merge, merge-on-contract-
  result, merge-all→rank-1, uneven split (6→[2,3]), merged-key-reuse, full error
  surface, and merge∘split / split∘merge round-trips. Full suite **2620 passing**
  (+15); tsc src + tests, build, smoke clean.

### Fixed — `LabeledTensor` explicit axis-order invariant (foundation)

Replaces the implicit "engine axis = sorted-key position" assumption with an
explicit, authoritative `axisOrder` field, fixing a latent desync that `transpose`
and `contract` could introduce. Design + Adam (GREEN) + Eve (YELLOW→resolved):
`docs/planning/v0.14-LabeledTensor-AxisOrder-Design.md`. The prerequisite the
`mergeAxes`/`splitAxis` vet surfaced — now unblocking that follow-up.

- **The defect:** `transpose` permuted the engine axes but returned unchanged
  labels; since `canonicalLabelOrder` sorts the same keys to the same order, the
  engine-axis order silently diverged from the assumed sorted order. `contract`
  independently could diverge — it built the result tensor in einsum-free-emission
  order but mapped labels via sorted keys. Latent (no shipped consumer does
  transpose-then-contract), so this is correctness-enablement, not an active-bug
  fix.
- **The fix:** a `public readonly axisOrder: readonly string[]` (label keys in
  engine-axis order) maintained by every operation, plus `axisOf(key): number`
  as the safe label→position accessor. The constructor takes an OPTIONAL 4th
  `axisOrder` param defaulting to `canonicalLabelOrder` (sorted) — fully
  backward-compatible (every existing 3-arg caller builds sorted-order tensors;
  the sole src consumer is rank-1). `transpose` now computes its permutation
  against the current `axisOrder` and sets the result's order; `contract` maps
  via each operand's `axisOrder` and emits a parallel `resultAxisOrder`;
  `reshape` carries `axisOrder` through. New `AxisOrderError` (`@public`) for a
  non-permutation `axisOrder`.
- **Eve Y1 (bundled bug fix):** the `contract` key-collision suffix only guarded
  the un-suffixed key, so it could overwrite an existing suffixed key (duplicate
  result key). Now it loops until a free key, keeping result keys unique and
  `resultAxisOrder` a valid permutation.
- **Why not the zero-API "re-canonicalize" alternative (Eve Y2):** it would make
  `transpose` unable to expose a permuted `.tensor`, breaking the existing test
  that asserts `transposed.tensor.shape` reflects the permutation — a worse
  public-API change than an additive optional param + field.
- Public surface: one new runtime export (`AxisOrderError`) + an additive
  optional ctor param / readonly field / method on the already-`@public`
  `LabeledTensor` (no other export-name change). MathTS einsum free-axis order is
  assumed `spec.free`-ordered (as the current code already requires) and verified
  only in the gated optional-dep suite. Full suite **2605 passing** (+10); tsc
  src + tests, build, smoke clean.

### Decided — G-9 increment 3: default-pipeline migration DECLINED; fixtures consolidated

The queued "route the DEFAULT GR pipeline onto geometrized units + subsume the
`unitless*` fixtures" was re-examined and split (disposition + Adam challenge-vet:
`docs/planning/v0.14-G9-Increment3-Disposition.md`).

- **Default-pipeline migration — DECLINED (evidence-based).** Its premise (c=G=1
  improves FD precision) is refuted: per-component relative FD error is provably
  unit-invariant (the FD step is coordinate-keyed, identical in both charts), and
  it is MEASURED no-better — Adam reproduced the geometrized Kretschmann
  apples-to-apples and the far-field error DIVERGES with r (relErr 0.40 at
  r=1000·r_s vs SI's ~3.8e-8), an intrinsic signal-to-baseline catastrophe. The
  dynamical consumers (GL4, perihelion, BE-37 eikonal) use analytic closures, not
  FD, and `E=−p_t≈9e16` is conserved bit-exact (cyclic-coordinate momentum the
  symplectic update never touches), so there is no long-integration benefit
  either. The pipeline is already convention-agnostic (one internal pipeline +
  boundary adapters), so there is no dual-path maintenance cost to remove.
  Re-deriving the whole GR pipeline's unit convention for a measured-absent (and
  far-field-negative) precision win is a strictly losing trade. The SI pipeline
  stays the default; the geometrized layer remains the optional boundary API from
  increment 2.
- **Fixture-name consolidation — DONE.** Hard-renamed every `unitless*` (c=1)
  closure to the `geometrized*` convention name so the test suite carries exactly
  two conventions (SI + geometrized) with consistent naming: the shared
  `geometrizedMinkowski{,GInverse}Fn` (`tests/fixtures/minkowski.ts`) + its one
  importer, and the test-local `geometrizedDeSitter*` / `geometrizedSchwarzschild*`
  closures in `bianchi-residual.test.ts` (Adam YELLOW: these carried the same
  `unitless` name and would otherwise leave the rename half-done). Byte-identical
  bodies; test-only (not shipped); no `src/` behavior change, no public-surface
  change. (The unrelated "Unitless" = dimensionless usages, e.g. BE-32 overlap
  parts, are a different meaning and untouched.)

### Added — G-9 increment 2 (geometrized boundary, additive core)

The additive, vettable core of the geometrized-units increment 2 (design:
`docs/planning/v0.14-G9-Increment2-Design.md`, Adam YELLOW + Eve YELLOW, all
findings folded). Builds on increment-1's `geometrized.ts` adapters.

- **Public geometrized adapters.** `toGeometrized` / `fromGeometrized` /
  `geometrizedFactor` / `NonGeometrizableDimensionError` re-tagged `@internal` →
  `@public` and exported from `src/index.ts` — the boundary API for running the
  GR pipeline in geometrized (G = c = 1) units. Four new runtime exports
  (`EXPECTED_RUNTIME_EXPORTS` + snapshot + the `@public`-tag invariant all
  satisfied).
- **Geometrized-native Schwarzschild fixture** (`tests/fixtures/schwarzschild-geometrized.ts`):
  the x⁰ = ct chart (all g_μν dimensionless), mass as a geometrized length
  `M_geom = G·M/c²`, shipping `gFn` + `gInverseFn` (the Kretschmann path's
  inputs). Honestly a DISTINCT chart from the SI x⁰ = t fixture (which carries an
  explicit c² in g_tt), not a unit-rescale of it.
- **SI ↔ geometrized equivalence test** exercising the adapter where it has teeth
  — the MASS input (`M_geom = toGeometrized(M_sun, MASS) = G·M_sun/c² ≈ 1477 m`,
  factor `G/c²`), NOT the K output (K is L⁻⁴ ⟹ factor 1, a no-op). The
  geometrized fixture validates against its own closed form `K = 48 M_geom²/r⁶`
  through the full FD pipeline, matches the SI fixture's K at matched (r, θ), and
  the two closed forms coincide exactly (`48 G²M²/(c⁴r⁶) = 48 M_geom²/r⁶`).
- **Scope honesty.** The FD order-2 claw-back deliverable was CUT (Eve): per-
  component relative FD error is provably unit-invariant, so it tests nothing
  about geometrization and is already covered by `pderiv-order*.test.ts`.
  STRICTLY ADDITIVE — the SI pipeline default is untouched. Increment 3 (deferred,
  own plan+vet): subsuming the `unitless*` fixture family + routing the DEFAULT
  GR pipeline onto the geometrized fast path. Full suite **2595 passing** (+11);
  tsc src + tests clean; build + smoke green.

### Deferred / won't-do (honest dispositions, this cycle)

- **`mergeAxes` / `splitAxis` (rank-changing reshape) — DEFERRED, blocked.** The
  Adam vet (RED, `docs/planning/v0.14-MergeAxes-SplitAxis-Design.md`) found the
  feature would sit on a pre-existing `LabeledTensor` latent: `canonicalLabelOrder`
  (sorted keys) is assumed to track engine axis order, but `transpose`
  (`labeled-tensor.ts:297`) returns labels unchanged after permuting engine axes,
  desyncing them (and `contract`'s result labels aren't sorted either). The
  helpers can't correctly map label keys to engine axes without first fixing that
  invariant — a foundation change to `LabeledTensor`'s internal model with its own
  blast radius. Not shipped; the design note records the spec to resume from.
- **C2 / C3 calibration targets — NOT engineering (physics-blocked).** C2
  (Einstein-Cartan Newtonian limit) needs weak-field-limit machinery that does
  not exist AND a physicist's derivation (BE-17 encodes a torsion-norm scalar
  containing none of the quantities a Newtonian limit relates). C3 (Higgs→Λ
  residue) has no closed-form relation or literature anchor in the repo — the
  edges share no quantity and the cosmological-constant "residue" is the famous
  unsolved problem, not a derivation. Implementing either would require
  fabricating physics; both stay on the human-physicist surface.
- **Kretschmann O(4⁸) symmetry optimization (P-6) — SUPERSEDED (won't-do).** The
  factored-raising optimization already shipped (O-4, ~70×/29.8×), the pipeline is
  now FD-dominated, and the symmetry-pair reduction was explicitly rejected for
  correctness — it is NOT identical to the full sum for the FD-built Riemann
  tensors (small antisymmetry violations), per the rationale in `kretschmann.ts`.
- **Regime-builtins taxonomy — physicist surface (research task).** Source
  comments + todo flag it "per P5 Decision #1, research task not engineering / a
  per-bridge physics review." The mechanism (`defineRegime`) is shipped; the
  taxonomy DECISION (which physics regimes to add) is a physicist's call.

### Internal — unused-export cull (hygiene)

Dropped the vestigial `export` keyword on seven symbols that the dependency-graph
analysis flagged as exported-but-never-imported and that are used only within
their own module: `FormulaDimensionError` / `FormulaDimensionResult`
(`formula-dimension.ts`), `FormulaParserKind` (`formula-registry.ts`),
`LowerNodeRecur` (`derivative-lowering.ts`, `@internal`), `FieldSpec`
(`_be-helpers.ts`, `@internal`), `BridgeCoverage` / `CoverageReport`
(`confrontation-coverage.ts`). Each verified to have zero importers across
`src/`/`tests/`/`bench/`/`examples/`/`bin/` and to be absent from the public
manifest and the `@public`-tag guard lists before de-export. Potentially-unused
exports 39 → 32. No behavior change; tsc src + tests clean, full suite unchanged.
(The `src/composition/*` result/option types the analysis also flags are
deliberate API surface for the in-progress symbolic-composition tranche and were
left exported.)

### Added — `BridgeEquations` convenience facade (v0.14)

A root-level `BridgeEquations` object (`src/bridges/bridge-equations.ts`, re-exported
from `src/index.ts`) gathers every per-bridge `evaluate*()` function under readable
method names — e.g. `BridgeEquations.decoherenceRate({...})` (BE-11),
`BridgeEquations.hawkingTemperature({ M_kg })` (BE-42). Closes the README's
long-standing "computable bridge solvers not yet implemented" note.

- **1:1 pass-through, zero new physics.** Each method is a re-export of the
  existing pure evaluator; TypeScript infers the per-method input/return types
  structurally, so no new named input-type exports hit the public surface — the
  facade adds exactly ONE runtime export. 48 methods across BE-11–54 (some
  bridges expose two evaluators) plus the two v0.4.0 GR evaluators.
- **Honest scope:** BE-25 maps to the live IIT `intrinsicInformation` (the
  archived Penrose-Hameroff `evaluateOrchOR` is deliberately NOT surfaced);
  `onsagerEntropyProduction` (BE-28) carries its module's ⚠ CRITICAL WARNING
  (the σ=ΣJX definiendum, not the MEPP principle); BE-51 has no evaluator and is
  intentionally absent (no fabricated physics).
- Corrects the README example note: the facade is a convenience layer over the
  evaluators, not a verbatim Parts I–III spec API (the spec specifies the
  physics + AST encodings, not this TypeScript class).
- Public-surface snapshot + `EXPECTED_RUNTIME_EXPORTS` updated for the single new
  `BridgeEquations` export. Full suite **2584 passing** (+8); tsc src + tests clean.

### Added — distributional / variational grammar primitives (v0.14)

Two new scalar `ExprNode` arms close the standing roadmap item "grammar
extensions for genuinely-deferred primitives", making the Model-A Langevin /
fluctuation-dissipation relation BE-15 documented as un-encodable DIMENSIONALLY
EXPRESSIBLE. Design + Adam (GREEN) + Eve (YELLOW→GREEN) vet:
`docs/planning/v0.14-Distributional-Grammar-Design.md`.

- `{ kind: 'dirac-delta', arg }` → `[δ(x)] = [x]⁻¹` (`power(dim(arg), −1)`),
  since `∫δ(x)dx = 1`. A dimensionless arg gives a dimensionless δ; the 3-D
  `δ³(x)` is an `op '*'` of three single-arg nodes (→ `L⁻³`).
- `{ kind: 'variational-derivative', functional, field, over }` →
  `[δF/δφ] = [F]/([φ]·[μ])` (`divide(divide([F],[φ]),[μ])`), since
  `δF = ∫(δF/δφ)δφ dμ`. `over` carries the measure dimension `[dμ]` — the dual
  of `integral`, which MULTIPLIES by `[over]`.
- Both arms are SCALAR (a tensor-valued child is rejected with
  `TensorInScalarOpError`, contributing no free indices) and NON-numerical
  (`lowering` throws `NumericalBackendError`, alongside `integral`/`derivative`).
  Inline union members like `integral`/`derivative` ⟹ **zero public-surface
  change** (no `ALL_TYPE_EXPORTS`/runtime-snapshot delta).
- Demonstration (uncontested physics): the full Model-A FDT relation
  `⟨ζζ⟩ = 2Γk_BT δ³(x)δ(t)` and the Langevin `∂φ/∂t = −Γ δH/δφ` both validate
  homogeneous through the new grammar; a deliberately non-homogeneous variant
  (drop one `δ(t)`) is correctly rejected. BE-15's docstring records barriers 1
  (Dirac-δ correlators) and 2 (functional derivative) now LIFTED, with the
  bare-Langevin Γ (`[φ]²L³T⁻¹E⁻¹`) disambiguated from the docstring's existing
  coarsening Γ (`L²/T`). The CATALOG re-encoding that would USE the grammar —
  BE-15's faithful Langevin form, BE-28's faithful MEPP maximization (its σ=ΣJX
  carries a CRITICAL WARNING it is the definiendum, not the principle) — is a
  physics-curation decision deferred to a physicist; barrier 3 (functional
  integration over field configurations) remains out of scope.
- Node-kind count 21 → 23. No new src files (edits only); full suite **2566
  passing** (+16). `tsc --noEmit` clean (src + tests).
- **Catalog applicability verified** (`tests/bridges/catalog-grammar-applicability.test.ts`,
  +10). A survey of all 44 bridges + the known-laws catalog found three entries
  whose canonical forms involve the new constructs; the grammar is pointed at
  each, using only docstring-stated/derivable dimensions: **BE-15** (Model A
  Langevin + FDT) is FULLY expressible (both primitives, homogeneous); **BE-46**
  (Weinberg-Vilenkin anthropic measure) — the observable-fixing `δ(O−O[g,φ])` is
  expressible (`[O]⁻¹`), but the functional metric-integral stays barrier-3
  (out of scope); **BE-28** (MEPP/Onsager) — the variational-δ is expressible on
  the entropy-production functional `∫σ dt` (`σ=[W/K]` stated, → dimensionless),
  but the Lagrange-multiplier + discrete-index-sum remain beyond the two
  primitives (the docstring's ⚠ CRITICAL WARNING holds). Regression: the three
  bridges' currently-encoded RHS still validate and use NEITHER new kind —
  catalog re-encoding stays correctly deferred to a physicist. Full suite
  **2576 passing**.

### Added — geometrized-units boundary adapters (G-9 increment 1, v0.13)

The first, self-contained increment of the long-queued G-9 units-normalization
layer (design: `docs/planning/v0.10.0-Units-Normalization-Design-Note.md`,
Adam-vetted r2; plan: `docs/planning/v0.13-G9-Adapters-Plan.md`, Eve-vetted).

- `src/numerical/geometrized.ts` (internal): `toGeometrized`/`fromGeometrized`/
  `geometrizedFactor` convert a scalar between SI and geometrized (G = c = 1)
  units, driven MECHANICALLY by the `Dimension` exponent vector — the factor is
  `G^M·c^(T−2M)` (each kg → G/c² metres, each second → c metres), no
  per-quantity hand-table. `NonGeometrizableDimensionError` (extends `UPTError`)
  rejects a nonzero I/Θ/N/J exponent (only c and G are in scope).
- Eve caught that the design's M_sun pin literal (1476.6 m) was IAU-nominal and
  disagrees with the repo's `M_SUN_SI`; the test pins against the computed
  `G_SI·M_SUN_SI/C_SI² = 1477.06 m`. Pins (Eve-verified): 1 s → c (exact), c →
  geometrized-1 (exact), length-identity, mass-energy self-consistency, the
  round-trip property (≤1 ulp), and the domain guard. 9 tests.
- ADDITIVE, zero blast radius. Increment 2 (deferred, its own plan+vet):
  geometrized fixtures + subsuming the ad-hoc `unitless` c=1 family, routing the
  GR pipeline onto the geometrized fast path, and the FD order-2 claw-back. No
  public-surface change. src 156→157; full suite 2550 passing (+9).

### Changed — symbolic exponents on a dimensionless base (v0.13)

A bounded core-grammar extension to the `^` `ExprNode` arm: a NON-literal
(input-dependent) exponent is now accepted **when the base is dimensionless** —
sound because `dimensionless^(dimensionless) = dimensionless`, so the result
dimension is statically inferable without the exponent's value. Literal
exponents (any base, e.g. `c^3`) are unchanged; a dimensionful base with a
non-literal exponent still violates (the pinned shape). Design + Adam+Eve
adversarial vet in `docs/planning/v0.13-Symbolic-Exponent-Design.md` (both
YELLOW; all r2/r3 revisions folded in — the tensor-exponent throw, the
null short-circuit, and the existing-edge authoring were the load-bearing
catches; claims grep-verified).

- `validator.ts` `^` arm: literal → `power(baseDim, n)` (unchanged); non-literal
  + dimensionless base → require the exponent dimensionless (+ tensor-exponent
  throw + null short-circuit) → `DIMENSIONLESS`; non-literal + dimensionful base
  → violation. `evalExpr` `^` relaxed to `finite(Math.pow(evalExpr(base),
  evalExpr(exp)), node)` (literal behavior byte-identical).
- **Consumer:** BE-33 (Hertz-Millis) previously *pinned z=1* to use a literal
  `^(-1)` ("the AST `^` op requires a literal-numeric exponent"). `be33Edge`
  now carries the FAITHFUL `symbolic` form `ξ_0·(T/T_0)^(−1/z)` (exponent
  `−1/z`, z an input), dim-validated to `[length]` and drift-guarded against
  `evaluateHertzMillis` with z = 2. The catalog AST `BE33_HERTZ_MILLIS_RHS` is
  unchanged (round-trip preserved). `simplify` gracefully no-ops on variable
  exponents. 9 tests; full suite 2541 passing (+9, no regressions).
- This is valuable independently (faithful scaling-law encodings) but does NOT
  make CI-1 checkable — CI-1 is an over-determination, not a composition.

### Added — orphan-connector analysis (v0.12)

Uses the v0.12 feature map (`upt discover`/`predict`/`coverage`/`symbolic`) to
analyze the catalog's **isolated bridges** and propose / reject candidate
identifications — the catalog's structural frontier (20 of 41 edges are
isolated).

- **`proposeOrphanConnectors`** (`src/composition/bridge-analysis.ts`, internal;
  `upt connectors`): intersects the cross-cluster same-dimension candidates with
  the linkage map's isolated/anchored partition — a *connector* joins an
  isolated (orphan) bridge to the anchored core. Of the 20 orphans, **7 carry a
  same-kind connector; 12 are dimensionally unconnectable**. 6 tests.
- **Finding** (`docs/research/Orphan-Connector-Analysis.md`; spec Part-IX §9
  note): the structural view independently re-derives **CI-1/CI-2** (BE-15
  Model-A coarsening → BE-33/34 criticality) as the only motivated connectors,
  and physics-review **rejects every other** with grounded reasoning (BE-22
  TEE is gapped — no correlation length; a Förster radius is not a horizon; a
  proton tunneling mass is not a strange-metal carrier; the `hubble-rate ≡
  decoherence-rate` decoy). A quantified negative: the orphan frontier is
  decoy-dominated, and the catalog's real growth edge is the **12 unconnectable
  orphans** (need NEW bridges, not re-labeling). Also documents that a "rich"
  multi-quantity discovery anchor turns all 132 candidates contradictory (the
  consistency check needs a physically-consistent seed — the numeric channel is
  anchor-limited by design). Nothing registered in `QUANTITY_IDENTIFICATIONS`.
- **Correction (CI-1 is over-determination, not composition).** A follow-on
  investigation of "test CI-1 by symbolic derivation" found the framing wrong:
  `coarsening-length` and `quantum-correlation-length` are only ever *targets*
  (never sources), so identifying them merges two independent derivations
  (Model-A dynamics vs Hertz-Millis statics) — not a chain — and
  `composeSymbolic` does not apply. Confirmation is a physicist's
  dynamic-scaling judgment, not more tooling. BE-33/34 are additionally
  grammar-blocked (their powers are the critical exponents ν/z themselves; the
  `^` arm admits only literal exponents). Documented in the research note +
  Part-IX §9; a bounded "symbolic exponent on a dimensionless base" grammar
  extension is noted as a possible future foundation cycle.

### Added — premise-extension directions (v0.12)

Four extensions that advance the original premise — *use the tensor concept
to MAP physics and DERIVE bridges/connections* — by wiring the existing
verification primitives into generative tools and closing one
author-flagged gap. Design: `docs/planning/v0.12.0-Premise-Extensions-Design.md`.
The three new analysis layers are INTERNAL (off `src/index.ts`, like
`bridge-analysis.ts`) and reached by the CLI via `dist/` subpaths; each is a
REVIEW SURFACE for physicist judgment, never automated discovery.

- **Direction 3 — equation-level valence homogeneity** (`validateEquation`,
  `src/dimensional/validator.ts`). The validator already tracked tensor
  `freeIndices` but `validateEquation` *deferred* comparing the two sides of
  an equation (the "Task 7" TODO). It now checks that LHS and RHS share the
  same free-index signature, so a rank-2 tensor equated to a scalar is
  rejected even when the SI dimensions match — the spec's "Bridge Eq 17"
  index-rank mismatch the header said it couldn't catch. Scalar (typed-stub)
  equations are unaffected; full suite unchanged. 5 tests.
- **Direction 1 — the namesake made operational** (`bridge-prediction.ts`,
  internal; `upt predict`). Projects `CATALOG_GRAPH` onto the (scale × force)
  regime plane, populates a real `UniversalTensor` from it (the catalog's
  structure finally carried by the namesake), and ranks the EMPTY regime
  cells between well-connected regimes as undiscovered-link hypotheses
  (triadic closure). Real graph: 40/41 edges placed onto 15 regimes. 8 tests.
- **Direction 2 — the discovery loop** (`discovery.ts`, internal;
  `upt discover`). Vets each `proposeLinkCandidates` output by hypothesizing
  the identification `a≡b` and testing it with the existing primitives:
  does it merge two graph components (`linkageMap`/union-find), unlock
  quantities from an anchor (`forwardClosure`), and stay numerically
  consistent (`retrodict` — the strong filter)? Ranks
  `promising`/`inert`/`contradictory`. Real funnel: 132 candidates →
  26 promising · 106 inert · 0 contradictory. 6 tests.
- **Direction 4 — empirical-spine coverage audit**
  (`confrontation-coverage.ts`, internal; `upt coverage`). Audits each
  catalogued bridge's grounding tier — `data-confronted` /
  `graph-computable` / `encoded-only` / `thin` — reading the catalog, graph,
  and confrontation modules; **fabricates nothing**. Targets the
  CONTRIBUTING.md physicist review. Real catalog: 2 data-confronted, 36
  graph-computable, 6 encoded-only, 0 thin. 5 tests.

CLI gains `upt predict`, `upt discover`, `upt coverage`.

### Added — symbolic bridge composition (the Observable contract, v0.12)

Pushes composition from NUMERIC-only (`composeEdges` chains `evaluate`
closures) to SYMBOLIC: composing two bridges produces a new `ExprNode` that is
dimensionally validated and numerically evaluable. Resolves the Part-IX §4
Observable-contract deferral with a fourth option the spec did not enumerate —
an OPTIONAL `symbolic` ExprNode on a bridge edge, composed by AST substitution
(non-breaking; no per-pair adapters; retains dimensional type-safety). Design +
Adam+Eve adversarial vet in
`docs/planning/v0.12.0-Symbolic-Composition-Design.md` (both YELLOW; all 13
r2/r3 revisions folded in, Eve's claims grep-verified).

- **`composeSymbolic(first, second)`** (`@public`) substitutes `first`'s
  `symbolic` form into the junction leaf of `second`'s and returns an
  **`Observable`** — `{ name, symbol, dim, expr, leaves, evaluate }`, the
  shared return contract the spec said was missing. The composed AST is
  dimensionally validated (`equals` against `second.target.dim`); a
  zero-occurrence junction throws (silent-no-op guard, Adam A-3); strict
  `evaluate` input (Eve EVE-1); pure symbolic value, not domain-checked
  (use `composeEdges` for domain-checked numeric values).
- **`symbolic?: ExprNode`** — an optional, additive field on `BridgeEdge`
  whose leaves are source-quantity NAMES + a constant registry. Authored for
  the CT-1/CT-1b chain edges (`be42Edge`, `be16Edge`, `be42ViaRsEdge`,
  `lawSchwarzschildRadius`). A drift-guard test binds each symbolic form to its
  numeric evaluator at relative tolerance (Adam A-2).
- Internal primitives (`@internal`): `evalExpr` (the missing scalar-`ExprNode`
  value evaluator), `substitute` (returns `{expr, count}`), and the `CONSTANTS`
  registry (single-sourced from `core/constants.js`).
- Marquee: `composeSymbolic(be42Edge, be16Edge)` yields the CT-1 energy
  `E_min = k_B·(ℏc³/8πG·mass·k_B)·ln2` (validated `[energy]`); CT-1b recovers
  the solar-mass Hawking temperature `6.17e-8 K` symbolically — both matching
  the numeric `composeEdges` pipeline to float precision. CLI: `upt symbolic`.
  19 tests.

### Added — optional MathTS-backed simplification (v0.12)

The symbolic-composition feature shipped with UNSIMPLIFIED composed ASTs
(CT-1's `k_B` uncancelled). This supplement folds them via
`@danielsimonjr/mathts-functions`' `simplify` (the same optional peer the
Path-A formula parser loads), behind the established Path-A/Path-B contract —
absent peer degrades to a no-op. Design + Adam+Eve adversarial vet in
`docs/planning/v0.12.0-Symbolic-Simplification-Design.md` (both YELLOW; all 11
r2/r3 revisions folded in, claims grep-verified, the round-trip + node API
runtime-verified). Full MathTS perspective: `mathts-expression`/`-functions`
are a mathjs-lineage CAS (`parse`/`simplify`/`derivative`); `mathts-core` also
ships a units engine + exact arithmetic (`BigNumber`/`Fraction`) — noted but
out of scope (UPT's ℤ⁷ `Dimension` is bespoke).

- **`simplifyExpr` / `simplifyObservable`** (`src/composition/expr-simplify.ts`,
  internal; `upt symbolic --simplify`). Gensym-renders a scalar `ExprNode`
  FULLY PARENTHESIZED (no precedence ambiguity — Eve EVE-A), `parse`+`simplify`,
  walks the result back integer-exponent-strict (Adam/Eve HIGH-1). THREE guards
  make the black-box CAS safe: dimensional `equals`, structural subset (no leaf
  invented — Adam HIGH-2), and numeric agreement over ≥2 synthesized probes
  (Adam CRITICAL-2; `<2` finite ⇒ no-op, never vacuous-pass — Eve EVE-C). A
  representable result that disagrees THROWS `SimplificationError`; anything
  unrepresentable/unverifiable/absent degrades gracefully.
- Marquee: `upt symbolic --simplify` reduces CT-1's
  `k_B·(ℏc³/8πG·mass·k_B)·ln2` → `ℏc³·ln2/(8πG·mass)` (k_B cancels), value +
  dimension preserved. CT-1b currently no-ops (a MathTS `simplify` BigInt bug
  on `a/(b/c²)` — caught and degraded, the best-effort contract working). 6
  tests. No public-surface change (internal). `makeObservable` extracted in
  `compose-symbolic.ts` so a simplified Observable gets a fresh strict closure
  (Adam HIGH-3).

### Added

- **`CATALOG_GRAPH`** (`src/composition/catalog-graph.ts`; `@public`,
  re-exported from `src/index.ts`): the 41-edge composition graph (9
  calibration + 6 catalog-tranche + 26 catalog-full) assembled once into a
  single `readonly BridgeEdge[]`. Previously the full edge list was
  hand-rebuilt in ~10 places (every composition test, `bin/upt.mjs`, the
  analysis defaults); those now import the one constant. Part of the lean
  sprint below.
- **Link-candidate proposals** (`proposeLinkCandidates` in
  `src/composition/bridge-analysis.ts`; `upt candidates`;
  `docs/research/Linkage-Candidate-Proposals.md`): uses the linkage map to
  propose candidate cross-cluster identifications — pairs of quantities in
  different clusters sharing a non-dimensionless dimension (the kind of
  link the Hawking-temperature ≡ temperature identification was), tagged
  `touchesCore` / `sameKind`. The result quantifies the false-positive
  rate of dimensional matching one last time: **132 candidates → 98
  core-touching → 36 same-kind**, of which ~34 are still coincidences
  (`decoherence-rate ≟ hubble-rate`) or pairs the catalog deliberately
  keeps distinct (`effective-mass ≠ mass`); **≈3 are genuinely motivated**
  (the critical-dynamics correlation length / timescale, which would link
  the isolated Model-A coarsening bridge to the Kibble–Zurek cluster).
  Explicitly a REVIEW SURFACE for human adjudication (Part-VI §XXVII-B),
  NOT discovered bridges. Internal. 6 tests. The three motivated
  candidates are recorded in the formal spec as **Part-IX §9 (Phase-D
  candidate identifications — PROPOSED, UNADJUDICATED)** — none registered
  in `QUANTITY_IDENTIFICATIONS`; promotion needs a physicist's judgment.
- **Catalog linkage map** (`linkageMap` in
  `src/composition/bridge-analysis.ts`; `upt map`;
  `docs/research/Catalog-Linkage-Map.md`): the capstone of the
  bridge-inference toolset — maps how the catalog's equations connect via
  shared quantities (honoring `QUANTITY_IDENTIFICATIONS`). Connected
  components reveal a hub-and-spoke structure: **23 components** over the
  41 edges — one dominant **anchored cluster of 16** (GR + thermal/quantum,
  hubbed on `mass`/`temperature`, 5 established edges), a 3-edge
  cosmological-constant cluster, a 2-edge Friedmann cluster, and **20
  isolated** edges; 11 compose into chains. The single Hawking-temperature
  identification is what fuses the gravitational and thermodynamic
  sub-clusters. A structural map, explicitly NOT a credibility signal.
  Internal — not on the public surface. 6 tests.

### Changed

- **Lean sprint — simplify / minimize / dedup (no behavior change).** A
  codebase-lean pass after the v0.8–v0.11 buildout (dep-graph deep dive;
  `docs/planning/Lean-Sprint-Plan.md`). The structure was already clean (0
  dead files, 0 cycles), so the wins are deduplication and surface
  trimming, all gated by the full suite (2477 passing, unchanged):
  - **S1** — the 41-edge graph, formerly rebuilt in ~10 places, is now the
    single `CATALOG_GRAPH` constant (see Added); every composition test +
    `bin/upt.mjs` consume it.
  - **S2** — `tests/dimensional/bridge-derivation-audit.test.ts` reused its
    own private copies of `deriveBridge` / `freeParameters` / `subsetsBySize`
    / `makeInputs`; it now imports `attemptDerivation` / `dimensionalFreedom`
    from `bridge-analysis.ts` (the engine those copies duplicated).
  - **S3** — the `D(L,M,T,Θ)` dimension-factory copied across the dimensional
    test files is now the single `tests/fixtures/dimension.ts`.
  - **S4** — `linkageMap` / `proposeLinkCandidates` shared the same
    `QUANTITY_IDENTIFICATIONS` canonicalizer + `quantitiesOf`; both are now
    extracted helpers (`anchoringDistance` deliberately keeps its raw-name
    behavior — its distance contract is pinned).
  - **M1 / M2** — un-exported 10 internal-only symbols never imported across
    a module boundary (`createFormulaDimensionChecker`,
    `createMathtsFormulaParser`, `FUNDAMENTAL_CONSTANTS`,
    `DATA_CONFRONTED_BE_IDS`, `NamedConstant`, `numberToCellConfidence`,
    `checkRegimeConsistency`, BE-20's `INV_LENGTH_2`, `bianchiResidualAt`,
    `MetricFnNested`). Flagged-but-retained: `FieldSpec` / `LowerNodeRecur`
    (params of exported functions — un-exporting breaks `.d.ts` emit) and the
    `bridge-analysis` result-type interfaces (return types of exported
    functions). Dep-tool unused-export count: 37 → 27.
- **Formula dimensional check is now default-on (no MathTS peer needed).**
  The check previously required the MathTS AST; the Path B parser's own AST
  is now exposed (`parseFormulaToAst` / `evalFormulaAst`, `@internal`) and a
  second transpiler (`transpilePathB`) feeds the same dimensional core. So
  `getFormulaDimensionChecker()` always returns a checker — MathTS AST when
  the peer is installed, the built-in AST otherwise — both transpiling to
  the same `ExprNode` (a builtin↔mathts parity test pins the agreement).
  `upt derive --formula` reports the dimension/homogeneity regardless of
  whether MathTS is installed.

### Added

- **Formula dimensional check (MathTS Phase 2)** — `upt derive --formula`
  now reports whether a user's formula is dimensionally HOMOGENEOUS and
  what dimension it has, not just the prefactor. New internal module
  `src/numerical/formula-dimension.ts` transpiles the MathTS formula AST
  (Path A) into UPT's own dimensional `ExprNode` and runs `validate()` —
  unifying string→AST (MathTS) with AST→dimension (UPT). Constants→
  dimensionless, variables→declared dim, `sqrt`/`pow`/`^`→power ops
  (constant exponents), `abs`→passthrough, transcendentals via the
  typed-stub pattern (dimensionless argument required). The pendulum
  `2*pi*sqrt(length/gravity)` reports `[time] ✓ matches target`;
  `length + gravity` is reported not homogeneous; `sin(length)` is
  rejected; the Hawking formula infers `[temperature]`. MathTS-only (needs
  the AST) — `getFormulaDimensionChecker()` returns `null` under Path B.
  Design: `docs/planning/Formula-Dimensional-Check-Design-Note.md`. 9
  tests.
- **MathTS-backed formula parser (Path A)** — the `upt` formula commands
  now use `@danielsimonjr/mathts-functions`'s mathjs engine when the
  optional peers are installed, falling back to the self-contained Path B
  parser otherwise. New internal modules: `formula-mathts.ts` (the
  MathTS-backed `FormulaParser`, dynamically loaded via the
  `mathts-functions.ambient.d.ts` optional-peer pattern; scalar-only
  guard; free-variable extraction over the MathTS AST) and
  `formula-registry.ts` (`getFormulaParser`/`getFormulaParserKind` — picks
  MathTS when it smoke-tests clean, else Path B; suppresses MathTS's
  WASM-fallback chatter). The two parsers are proven interchangeable by a
  shared conformance suite (`formula-conformance.ts`) run against both
  (`*.builtin.test.ts` / `*.mathts.test.ts`); their one accepted
  divergence is `e` (MathTS = Euler's number, Path B = a free variable).
  The CLI consumes the registry; `--debug` prints the active parser. The
  upstream blocker is resolved — `mathts-core@0.1.3` exports `Unit`,
  `mathts-functions@0.2.2` ships the assembled engine; the MathTS packages
  stay in `optionalDependencies` (UPT keeps zero hard dependencies, and
  builds/tests green with the peers absent). 47 tests.
- **Custom equations in the CLI (Path B)** — non-TypeScript users can now
  feed their OWN equations:
  - `src/numerical/formula.ts` (internal): a self-contained, dependency-
    free recursive-descent parser/evaluator for closed-form scalar
    expressions behind a `FormulaParser` interface (so a MathTS-backed
    parser — Path A — can be swapped in later). SAFE: no `eval`, only
    arithmetic + a function whitelist + caller-supplied variables; an
    unknown symbol is an error, never an implicit global. 11 tests.
  - `src/dimensional/dimension-spec.ts` (internal): parses human dimension
    strings (named dims, constants `hbar`/`c`/`G`/`k_B`/`e` exact-case so
    `G`≠`g`, or explicit `L^3.M^-1.T^-2`) into `Dimension`s. 6 tests.
  - CLI: `upt eval "<formula>" name=value …` evaluates a user formula;
    `upt derive <target:dim> <var:dim> … [--formula "<expr>"]` derives a
    user equation's dimensional form and, with `--formula`, verifies it
    and recovers the dimensionless prefactor (e.g. the pendulum
    `2*pi*sqrt(length/gravity)` → period ∝ length^0.5·gravity^-0.5,
    prefactor ≈ 2π). Both internal modules; no public-surface change.
- **Unified `upt` CLI** (`bin/upt.mjs`, wired as a `package.json` `bin`):
  one entry point for non-TypeScript users with three subcommands —
  `upt explain <quantity> [name=value …]`, `upt priority`, `upt audit` —
  plus `help` and a no-arg demo. Installable (`npx universal-physics-tensor
  <cmd>` once published; `bin` added to the `files` whitelist). Consolidates
  and replaces the separate `examples/explain.mjs` and
  `examples/bridge-priority.mjs` scripts; `npm run explain` /
  `npm run bridge-priority` are kept as aliases, and `npm run upt -- <cmd>`
  is added.
- **Bridge-priority scorecard** (`src/composition/bridge-analysis.ts`,
  internal; `examples/bridge-priority.mjs` / `npm run bridge-priority`;
  `docs/research/Bridge-Priority-Scorecard.md`): a structural-triage tool
  ranking the speculative bridges by how DECIDABLE they are against
  established physics — three engine signals (`grounding` via
  `attemptDerivation`, `complexity` via `dimensionalFreedom`, `anchoring`
  via `anchoringDistance` to the established-confidence core) plus a
  catalog-joined data-confrontation flag, partitioned into Tiers 1/2/3
  (8/6/18 of the 32 non-established bridges). **Explicitly a
  review/confrontation-priority ranking, NOT a credibility score** — the
  signals are orthogonal to truth (a highly-speculative bridge sits in
  Tier 1; established physics is "unclosable"), and the module docstring,
  CLI, doc, and tests all carry the caveat. Internal — not added to the
  public surface. 11 tests.
- **Dimensional-complexity spectrum + orthogonality finding** (extends
  the bridge audit): grades each non-derived bridge by its number of free
  dimensionless parameters (minimal-span constant subset, then leftover
  π-groups − 1) — turning the flat "25 unclosable" into a spectrum (0→6).
  11 of them are exactly one dimensionless ratio from a monomial,
  **including the established Mercury perihelion (be-52) and Shapiro
  delay (be-37)**. Cross-tabulated against catalog `status`, the audit
  buckets are shown to be ORTHOGONAL to credibility (the unclosable
  bucket holds 5 established bridges; the derived bucket is 8/11
  speculative) — the doc now carries an explicit "not a credibility
  score; do not prune/rank by it" caveat. 5 added tests.
- **Bridge-equation dimensional audit**
  (`tests/dimensional/bridge-derivation-audit.test.ts` +
  `docs/research/Bridge-Equation-Dimensional-Audit.md`): points the
  Buckingham-π engine at all 41 catalog bridge edges and classifies each
  by attempting to derive it — find a fundamental-constant subset that
  dimensionally closes the target, then verify the monomial against the
  bridge's own evaluator (constant ratio = match). Result: **11 derived,
  5 decoy-only, 25 unclosable.** For the derived ones, the numerical
  match recovers the dimensionless prefactor the engine cannot supply —
  ln 2 (Landauer), 1/4π (KSS bound and Hawking-via-r_s), 1/8π (vacuum
  energy ρ_Λ = Λc²/8πG), 2 (Schwarzschild), √(2π) (thermal de Broglie),
  4 (R = 4Λ). The decoy cases (e.g. be-42 direct → the rest-mass
  temperature Mc²/k_B, not the Hawking temperature ∝ 1/M; be-27 →
  additive, not a monomial) are the vivid confirmation that dimensional
  matching is a form filter, not a discovery engine. 10 tests.
- **Dimensional-derivation benchmark**
  (`tests/dimensional/derivation-benchmark.test.ts` +
  `docs/research/Dimensional-Derivation-Benchmark.md`): nine known
  physics equations re-derived by the Buckingham-π engine — pendulum
  period, Kepler's third law, Schwarzschild radius, string-wave speed,
  the Planck length/mass/time, the Compton wavelength, and the thermal de
  Broglie wavelength (BE-12) — plus the Reynolds number as a dimensionless
  group. Each asserts the engine recovers the textbook monomial (rational
  exponents exact); the research doc records the verbatim engine output.
  Guards that the engine keeps reproducing classical dimensional analysis
  — and, in the negative cases, keeps refusing to invent missing
  constants (Schwarzschild from `{mass}` alone → not determined). 11
  tests.

- **`explainQuantity` — unified bridge-inference entry point**
  (`src/composition/explain.ts`): synthesizes the three primitives into
  one `QuantityExplanation`. Given a target and a known set (names, or
  `name → value`), it runs the identifiability classifier (how the graph
  computes the target), the retrodiction harness (whether the redundant
  derivations agree + the recovered value, when values are supplied), and
  the Buckingham-π layer (`dimensionallyDetermines` — whether the known
  set is dimensionally sufficient, independent of the graph), and emits a
  plain-language `summary`. The three answer complementary questions: for
  `hawking-temperature` from `{mass: M_sun}` the summary reports
  over-determined (be-42, be-42-via-rs), derivations agree, value
  ≈ 6.17×10⁻⁸ K, AND that mass alone is not dimensionally sufficient (the
  evaluator carries ℏ, c, G, k_B). `extraDimensions` lets the dimensional
  layer test a known set richer than the graph's nodes. Completes the
  bridge-inference suite: all three primitives plus the unifying entry
  point. (Surface 163→164; snapshot updated.)
  - **Full-chain (leaf-to-target) derivations:** each
    `DerivationExplanation` now carries `leafInputs` (the immediate
    last-hop `sources` traced back through every intermediate to the leaf
    inputs) and an optional `dimensionalForm` (the target as a monomial
    in those leaves, when they dimensionally fix it). E.g. be-42-via-rs's
    last-hop source is `schwarzschild-radius` but its leaf input is
    `mass`.
  - **CLI example** (`examples/explain.mjs`, `npm run explain`): surfaces
    the one-line `summary` for non-TypeScript users —
    `node examples/explain.mjs hawking-temperature mass=1.989e30`.

- **Identifiability classifier** (`src/composition/identifiability.ts` —
  `classifyIdentifiability`, `classifyAll`, `forwardClosure`): a
  STRUCTURAL classifier over the directed composition hypergraph. Given a
  known-quantity set and a target, it counts independent derivations and
  returns the epistemics-note trichotomy — `under-determined` (decline),
  `exactly-determined` (solve), `over-determined` (the surplus
  derivations are falsifiable consistency constraints), plus `given`.
  Honors `QUANTITY_IDENTIFICATIONS` in the forward closure (mirroring
  `composeEdges`); excludes circular self-support via a target-removed
  closure; reports a `blockingFrontier` of upstream gaps for
  under-determined targets. Real-graph anchor: from `{mass}`,
  `hawking-temperature` is over-determined (be-42 and be-42-via-rs both
  fire — schwarzschild-radius is itself derivable from mass), and
  `landauer-erasure-energy` is determinable ONLY with the registered
  hawking-temperature ≡ temperature identification. Structural, not
  parametric (documented limitation). 15 tests; 3 runtime exports added
  to the public surface (snapshot updated).
- **Retrodiction harness** (`src/composition/retrodiction.ts` —
  `retrodict`, `retrodictNode`): the framework's own falsification
  benchmark and the numerical counterpart of the classifier's
  over-determined verdict. Masks an over-determined node (recomputes
  source values with every edge into it removed), recovers it via each
  independent derivation through the domain-checked `evaluateEdge`, and
  scores the relative spread — `consistent` / `inconsistent` (a
  falsification: two encodings of one quantity disagree) / `single` /
  `unrecoverable`, with a headline `allConsistent` gate. Optional
  external `references` add textbook-value scoring. Pass bar
  PRE-REGISTERED (relative spread ≤ 1e-6) in
  `docs/planning/Retrodiction-Harness-Design-Note.md`. Pre-registered
  first-run anchor (passing): from `{mass: M_sun}`, `hawking-temperature`
  is over-determined and `consistent` — be-42 (T_H = ℏc³/8πGMk_B) and
  be-42-via-rs (T_H = ℏc/4πk_B·r_s, r_s = 2GM/c² from the law edge) agree
  to float precision — and recovers the ≈ 6.17×10⁻⁸ K solar-mass value.
  10 tests; 2 runtime exports (surface 158→160; snapshot updated).
- **Buckingham-π enumerator** (`src/dimensional/buckingham.ts` —
  `buckinghamPi`, `dimensionallyDetermines`, `RationalizationError`): the
  principled primitive for the classifier's exactly-determined case.
  `buckinghamPi` returns the n − r dimensionless groups of a variable set
  (the null space of the dimension matrix, computed in EXACT rational
  arithmetic) with a `dimensionally-independent` / `single-invariant` /
  `multiple-invariants` verdict; `dimensionallyDetermines(target,
  governing)` reports whether the target is fixed UP TO A DIMENSIONLESS
  CONSTANT and returns the (possibly rational) monomial. The result types
  carry FORM only — no value or constant field anywhere — enforcing the
  honest boundary between dimensional analysis and numerology. Pins the
  canonical results: pendulum T = const·√(L/g), Schwarzschild
  r_s = const·GM/c², and that mass alone does NOT determine r_s (G and c
  are required — dimensional analysis correctly exposes the dimensionful
  constants the graph's law edge smuggles in). 11 tests; 3 runtime
  exports (surface 160→163; snapshot updated).
- **Bridge-inference epistemics note** + design notes
  (`docs/planning/Bridge-Inference-Epistemics-Note.md`,
  `Identifiability-Classifier-Design-Note.md`,
  `Retrodiction-Harness-Design-Note.md`): the (A) constraint-propagation
  vs (B) discovery split, the identifiability trichotomy, the
  retrodiction benchmark, and structural-analogy-over-variable-
  similarity. All three build targets are now implemented — the
  classifier (Consequence 1), the retrodiction harness (Consequence 2),
  and the Buckingham-π enumerator.

### Security

- **Removed the `@yao-pkg/pkg` dev-dependency from the three `tools/`
  utilities** (`create-dependency-graph`, `chunking-for-files`,
  `compress-for-context`). It existed only for a `build:exe` script that
  packaged each tool into an unused, never-committed Windows `.exe` — the
  tools are run via `npx tsx`/`node` (and `create-dependency-graph`
  resolves `js-yaml` from the root `node_modules`), so the `.exe` path was
  dead. The dependency transitively pulled **esbuild 0.27.7**, vulnerable to
  GHSA-gv7w-rqvm-qjhr (NPM_CONFIG_REGISTRY RCE, **high**) and
  GHSA-g7r4-m6w7-qqqr (Windows dev-server arbitrary file read, **low**) —
  the two Dependabot alerts on the default branch. Every `@yao-pkg/pkg`
  release (through the current 6.20.0) still pins `esbuild@^0.27.3`, all of
  which fall in the vulnerable `0.17.0–0.28.0` range (patched only in
  0.28.1), so there was no upgrade path; removing the dead build path is the
  fix. Also deleted the inconsistently-committed
  `tools/create-dependency-graph/package-lock.json` (its two sibling tools
  never committed one — it was the sole manifest Dependabot could scan). The
  `tools/` manifests now carry only `js-yaml` + `typescript` + `@types/*`,
  matching the documented "minimal / zero deps" intent in `tools/README.md`.

### Changed — dependency refresh

- **Within-range dependency refresh** (`npm update`, root lockfile only — no
  `package.json` range changes): `@danielsimonjr/mathts-expression`
  0.2.1→0.2.2, `@danielsimonjr/mathts-functions` 0.2.2→0.2.3, `@types/node`
  25.9.1→25.9.3, `vitest` 4.1.7→4.1.8 (plus their transitives; 21 packages,
  no net-new). Dep-health snapshot at this HEAD: **`npm audit` = 0
  vulnerabilities**, **`npm outdated` = clean**. Full suite (2477 passing),
  both `tsc` gates, build, and smoke re-verified green on the new pins.

---

## [0.11.0] — 2026-06-11 (UNRELEASED — open-items sprint; single final tag still recommended)

Team execution of the todo's open code items (3 waves, 6 agents + direct).

### Added

- **Namespacing gate (Option D, per the Adam-vetted r2):**
  `CompositionAliasError` name-collision rule; `SOURCE_ALIAS_DISPOSITIONS`
  reviewable registry (+ `aliases` option, `renameSecond` with the
  vet-mandated input remap); centralized `quantities.ts` (131 nodes,
  ONE object per canonical name, uniqueness-pinned); `M_E_SI`; all six
  acceptance criteria pass incl. the λ_T(m_e, T_H) = 3.0012×10⁻⁴ m pins.
- **Full catalog→graph migration: 15 → 41 edges** (+26 in
  catalog-full.ts; 5 NOT-A-BRIDGE entries skipped per the negative
  catalog; BE-44 honestly skipped — array-input evaluator). Naming
  judgments recorded (`effective-mass`, `tunneling-mass` ≠ `mass`).
  Phase-D over the full 41-edge graph: 11 compositions, **7 novel candidates**
  (docs/research/v0.11.0-novel-candidates.md), 1 collision correctly
  held at the gate.
- **O-4 + Kretschmann optimization:** computeKretschmann/WeylInputs
  widened (non-breaking); shims removed; sibling fixtures unified to
  Float64Array; exact factored index-raising (4×4⁵, no symmetry
  assumption) → **29.8× compute speedup** (pins < 1e-15 incl. random
  non-symmetric input).
- **Klein-Gordon dispersion evaluator** (plane-wave sector;
  `evaluateKGDispersionResidual` + `verifyKleinGordonPlaneWave`; 18
  tests; Part-X updated honestly).
- **BE-23 Planckian data confrontation** (`confrontBE23` ± uncertainty)
  vs Legros et al. 2019 — HONEST AGGREGATE encoding (per-material table
  not fabricated when unverifiable; machine-readable honesty marker).
- **G-9 note Adam-vetted** (YELLOW; r2 applied — corrected conversion
  formula, x⁰=ct, FD unit-invariance finding reframes criterion (b);
  implementation queued v0.12).

---

## [0.10.0] — 2026-06-11 (UNRELEASED — recommended single tag at final HEAD, rolling up 0.8.0/0.9.0)

Part-IX Phase C/D closure + uncertainty propagation + graph growth.
Plan: `docs/planning/v0.10.0-Improvement-Plan.md` (pre-registrations
committed before implementations, per the P-3 discipline).

### Added

- **Phase C stress tests (Part-IX §6 bar MET):** ST-1 — the dimension
  functor refuses λ_T→temperature even under a forced human
  identification; ST-2 — photon grazing AT r_s composes type-validly
  and fails at the weak-field DOMAIN with correct attribution.
- **Phase D enumerator (≥1 novel candidate bar MET):**
  `enumerateCompositions` over the 15-edge graph → 6 valid
  compositions, 4 registered (completeness check), **2 novel** —
  review surface at `docs/research/v0.10.0-novel-candidates.md`.
  Mechanically surfaced finding: same-named quantities ALIAS across
  composed operands (`be-42>>be-12` feeds one 'mass' to both
  black-hole and particle slots) — per-edge namespacing is the v0.11
  design question; the clean candidate `be-42-via-rs>>be-12`
  (λ_T at T_H(r_s)) is the first machine-proposed relation awaiting
  physicist review.
- **Uncertainty propagation (the G-3 claim, delivered):**
  `propagateUncertainty` (first-order, central-difference Jacobian) —
  works on composed edges for free (D-2 closure);
  `confrontBE36WithUncertainty` propagates Δt = 1.74±0.05 s →
  σ ≈ 1.9e-17 on the positive bound (not uncertainty-fragile at ±3σ).
- **Graph tranche (9 → 15 edges):** be14/19/21/48/53/54 wrapping
  existing validated evaluators (value pins + domain tests + catalog
  status drift guard; KSS is the first nullary edge).
- **Research note** (`docs/research/v0.10.0-Composition-Research-Note.md`)
  with verified registration-precedes-implementation SHA pairs.
- **CI**: strict whole-repo typecheck gate (`tsc -p tsconfig.tests.json`)
  added to the workflow.

### Changed — post-audit decisions (user, 2026-06-11)

- **Flux Rule 3 (Causality) promoted WARNING → ERROR** (the v0.7
  "deferred to v0.8" decision, finally made): a reverse-arrow
  BridgeCell (coarser→finer scale) now fail-atomics at `addCell`;
  deliberate reverse bridges go through the causality whitelist (design
  review). Live catalog verified clean before promotion (23/23
  submittable cells, zero reverse arrows). 3 test pins updated.
- **Architecture archive**: dated v0.4.x–v0.7.x records (audits,
  baselines, vets, release drafts — 28 files + 2 dirs) moved to
  `docs/architecture/archive/` with a point-in-time README; ~73
  referencing files' paths rewritten. Forcing incident: the same-day
  task audit took two stale claims from these files as current.
- **v0.11 namespacing gate**: design note r1 vetted **RED** by Adam
  (the same-object carve-out was factually wrong — be-42>>be-12 and
  ST-2 are object-identical) → r2 adopts the pure name-collision rule
  + `SOURCE_ALIAS_DISPOSITIONS` + Quantity-node centralization
  prerequisite. The 29-edge migration is gated on r2's six acceptance
  criteria.

### Notes

- Version bumped 0.8.0 → 0.10.0; the 0.8.0/0.9.0 milestones below roll
  into the single v0.10.0 tag (v0.5.1→v0.7.0 precedent). CLAUDE.md +
  todo refreshed.

---

## [0.9.0] — 2026-06-11 (UNRELEASED milestone — Float64Array hygiene sprint)

The renumbered hygiene sprint (planned as "v0.7.2"; renumbered per
v0.8.0 design r2-6). Suite 2186 → **2194 passed** (+11 net new pins
over the v0.8.0 release: R-1b, R-1×2, R-1c, S-9×8, −3 superseded).

### Changed

- **O-6**: `painleveGullstrandGFn`/`GInverseFn` → row-major
  `Float64Array(16)` (BREAKING for subpath importers only; PG is the
  M-2 deferral, not in the root manifest). R-1b off-diagonal
  transpose pin added.
- **O-1**: Schwarzschild fixture `schwarzschildGInverseFn` →
  `Float64Array(16)`, `schwarzschildDgInverseFn` → `Float64Array(64)`
  (`flat[λ*16+μ*4+ν]`, Decision #1 layout); hot-path consumers
  rewritten with dim-stride indexing (gl4-integrator Picard loops,
  perihelion-finder, null-ic, be37-covariant-eikonal local builders);
  17 test/bench files migrated (flat reads, unflatten shims at the
  number[][] O-4 boundaries, flat test builders). R-1/R-1c pins added.
  Scope corrections: killing.ts NOT migrated (lower-metric providers,
  outside O-1); computeWeylTensor/computeKretschmann stay nested (O-4
  deferred). Sibling fixtures stay nested (Decision #8).
- **S-9**: the 5 deferred-evaluator arms in `lowerNode` collapsed into
  `DEFERRED_EVALUATOR_REGISTRY` + registry-consulting default arm, with
  compile-time exhaustiveness (`Exclude<…> → never`) + 8 runtime pins.
- **Bench gate (Decision #6, same-machine ratios)**: PO-1 solveGL4Stage
  **1.56× single / 1.62× batch** → SHIP-WITH-NOTE (1.5–2× band).

### Added

- `MetricFnFlat` / `MetricFnNested` aliases; `NestedArray` admits
  `Float64Array` (runtime-safe: `flattenNA` iterates leaves).
- `tsconfig.tests.json` whole-repo typecheck **diff-gate** (first run
  baselined 71 preexisting legacy errors —
  `docs/architecture/v0.9.0-tsc-tests-baseline.txt`; gate = no NEW
  errors). Known blind spot recorded: `as unknown as` casts (two such
  files broke at runtime only and were fixed).
- Phase docs: `v0.9.0-baseline.md`, `v0.9.0-phase-1-vet.md` (mid-cycle
  vet YELLOW; H-1 silent-NaN PG bench fixed pre-Phase-3).

### Added — CT-3 (Part-IX C1 realized)

- `be12Edge` + `be11ZurekEdge` calibration edges;
  `composeEdges(be12Edge, be11ZurekEdge)` derives the Zurek
  decoherence scaling Γ_dec = γ·Δx²·m·k_B·T/(2πℏ²) (relErr ≤ 1e-12;
  the classic ~10⁴⁰ macroscopicity anchor pinned). Pre-registered in
  v0.8.0-Design.md §9 in a commit PRECEDING the implementation —
  Part-IX's Phase-B bar (≥3 of C1–C5) now stands at C1 ✓, C4 ✓,
  C5-partial.

### Added — second pass (all remaining improvement-plan suggestions)

- **CT-4 (C5 complete) → Part-IX Phase-B bar MET** (≥3 of C1–C5: C1
  CT-3, C4 CT-1, C5 CT-2+CT-4 — every target pre-registered before
  implementation): `be37Edge` + the parameter-free cross-observable
  ratio Δt/Δφ = a(1−e²)ln(R_far/R_near)/(3πc).
- **G-4**: speculative application/risk essays relocated from Part-V/VI
  to `docs/essays/` (Part-VI 770 → 299 lines); Status-Promotion
  Protocol kept in core as §XXVII-B.
- **Type gate fully strict**: all 71 legacy tests/bench type errors
  fixed (vitest-4 `benchmarkTimeout` removals, sanctioned
  `as unknown as` for deliberate-malformed entries, `.js` import fix,
  `as const` kind literals); the diff-gate baseline is now EMPTY.
- **BE-25 orch-or module archived in place** (@deprecated banner, P-4
  overlay-not-deletion) — closes the deferred archive-or-delete item.
- **G-9 design note** shipped (`v0.10.0-Units-Normalization-Design-Note.md`)
  + todo queue entry; implementation deliberately deferred one cycle
  (one foundation change per cycle — the metric-layout migration just
  landed under the same pipeline).

### Fixed

- PG pipeline bench silently benched NaN post-migration (vet H-1) —
  unflatten shim added; semantic validity restored.

---

## [0.8.0] — 2026-06-11

Composition MVP + first real-data confrontation + catalog adjudication.

**Dep-health snapshot (release pre-flight):** `npm audit` — 0
vulnerabilities; `npm outdated` — @types/node 25.9.1→25.9.3 and vitest
4.1.7→4.1.8 (both within-range patches, deferred). Suite **2182
passed / 0 failed / 5 skipped / 1 todo** (209 files); tsc + build +
smoke clean.

> Version adjudication (design r2-6): this body of work owns the
> **v0.8.0** label; the Float64Array hygiene sprint queued in `todo.md`
> (whose own Decision #2 had claimed v0.8.0) renumbers to v0.9.0.
> Implements `docs/planning/v0.8.0-Improvement-Plan.md` top picks via
> `v0.8.0-Design.md` r2 (Adam-vetted) + 8-phase plan. Suite
> 2126 → **2181 passed** (+55; 209 files); tsc/build/smoke clean.

### Added — composition graph (G-1, G-8, P-1, P-3; Part-IX Phase B)

- **`src/composition/`** — graph-lite layer beside the catalog:
  `Quantity` (sparse regime attributes), `BridgeEdge` (n-ary sources,
  first-class `ValidityDomain` predicates — G-8), `composeEdges()`
  (junction by name or reviewable `QUANTITY_IDENTIFICATIONS`; exact
  ℤ⁷ dimension-functor check; min-confidence demotion; domain piping),
  `consistencyRatio()`, typed composition errors. 16 new public
  exports. The operator is `composeEdges` — `compose` remains the v0.7
  Cell factory.
- **Pre-registered targets all passing** (registered in the design
  BEFORE implementation):
  - **CT-1**: `composeEdges(be42Edge, be16Edge)` DERIVES the erasure
    cost at the horizon, E_min(M) = ℏc³ln2/(8πGM), to relErr ≤ 1e-12 —
    the first literature-anchored relation the framework derives rather
    than encodes (Hawking 1975 ∘ Landauer 1961, through the recorded
    T_H ≡ T identification). Realizes Part-IX C4.
  - **CT-1b**: 3-edge chain through the first diagonal-LAW edge
    (Schwarzschild radius, P-1) ≡ direct composition ≡ closed form.
  - **CT-2**: BE-51/BE-52 shared-source consistency ratio
    α/Δφ = 2a(1−e²)/(3πb), M-independent across 3 decades.

### Added — GW170817 → BE-36 real-data confrontation (G-3)

- `confrontBE36()` + the `GW170817` observation record recompute the
  published speed-of-gravity bounds (+6.502e-16 / −3.0865e-15 from
  Δt = 1.74 s, D = 26 Mpc conservative, delay ∈ [0,10] s; published
  +7e-16 / −3e-15 verified as their 1-sig-fig roundings). Honest
  finding: BE-36's encoded symmetric |ratio| ≤ 1e-15 is violated by the
  published asymmetric bound's negative side — recorded in the result
  object and the corrected BE-36 docstring (40 → 26 Mpc derivation).

### Added — membership criterion + negative catalog (G-2, P-4)

- `src/bridges/membership.ts`: *a bridge is an edge whose endpoint
  quantities differ in ≥1 regime attribute* — computable, with the
  `rejected.ts` negative catalog as adjudication overlay.
- Nine `['unknown','unknown']` entries adjudicated (44 → 36 bridges /
  5 not-a-bridge / 3 contested): **BE-42 REVERSED to a bridge**
  (`['gravity','quantum']`; resolves the deferred Adam-HIGH dispute —
  submittable count 22 → 23); BE-28/29/32/35/40 NOT-A-BRIDGE upheld
  with reasons + citations (BE-29 resolves the deferred Adam-MEDIUM
  reconsider); BE-44/46/50 contested, recorded as standing
  physicist-review tasks. Report:
  `docs/architecture/v0.8.0-catalog-adjudication.md`.

### Added — infrastructure (G-5, G-6, G-10, P-2, P-5)

- **CI**: `.github/workflows/ci.yml` (Node 20: npm ci + tsc + vitest)
  — first CI in the repo.
- **Property-based tests**: `fast-check` devDep; dimensional-algebra
  abelian-group laws + composition meet-semilattice/associativity laws.
- **JSON catalog artifact**: `data/bridge-catalog.json` + schema +
  `npm run catalog:json` + freshness drift-guard (catalog edits fail
  until regenerated) — the physicist-facing review surface.
- **CONTRIBUTING.md**: six bounded physicist tasks + dev quick-start.
- **Part-VI §XXX-B Status-Promotion Protocol**: LLM consensus never
  sufficient; `established` requires a human-verifiable literature
  anchor; data-driven promotions must be re-runnable.

### Changed — post-vet punch-list (pre-tag cleanups)

- `composeEdges` no longer double-evaluates the first edge (the
  composed `evaluate` computes the intermediate once and checks both
  domains inline; the standalone domain predicate keeps the documented
  D-5 behavior).
- Composed edges now carry `identificationUsed` provenance when the
  junction matched via a quantity identification rather than a name
  (the previously unused `findJunction` return, surfaced).
- `membership-surface.ts` barrel removed — the negative catalog
  re-exports travel with `membership.ts` directly.
- Solar mass promoted to `core/constants.ts` as `M_SUN_SI` (new public
  export); `M_SUN_KG` remains as a stable alias.

### Fixed

- `tools/create-dependency-graph` undeclared `js-yaml` dependency
  (preexisting; generator failed on fresh installs) — added as devDep;
  dependency graph + TEST_COVERAGE regenerated with the new modules.
- Living architecture docs refreshed at the post-implementation gate
  (ARCHITECTURE/OVERVIEW/COMPONENTS/API/DATAFLOW: 44-bridge counts,
  v0.8.0 layers, suite numbers; COMPONENTS' false "no runtime circular
  dependency" claim corrected — `core/cell.ts` ↔ `core/tensor.ts`
  exists); BRIDGE-PHYSICS-AUDIT-v2 got an append-only disposition
  update.

---

## [0.7.3] — 2026-05-25

**Patch release: expanded MathTS optional-peer surface.** No source changes; declaration-only.

Following today's MathTS monorepo release sweep (6 new workspace packages published to npm — see [Mathts/TODO.md item #1](https://github.com/danielsimonjr/MathTS)), UPT now declares the full MathTS ecosystem as opt-in peers. This is **aspirational declaration**: UPT source doesn't yet consume any of the new packages, but the declarations signal roadmap intent and let consumers pre-install the peer chain they'd need for future UPT features. None of these are required to use UPT — `MathTSEngine` only activates when `mathts-tensor` + `mathts-autograd` are present (unchanged behavior from v0.7.0).

### Added (optionalDependencies)

- `@danielsimonjr/mathts-expression@^0.2.0` — unblocks the P4 Bridge DSL horizon item per `todo.md` (was "BLOCKED on `mathts-expression` peer install" before this release)
- `@danielsimonjr/mathts-matrix@^0.1.3` — for future matrix-engine alternatives
- `@danielsimonjr/mathts-functions@^0.2.1` — special functions for future physics-numerics integrations
- `@danielsimonjr/mathts-parallel@^0.2.0` — for the future browser/multi-core `TensorEngine` horizon item
- `@danielsimonjr/mathts-workerpool@^0.2.0` — worker-pool primitive backing the parallel path
- `@danielsimonjr/mathts-wasm@^0.1.3` — WASM acceleration for future hot-path numerics

### Dep-health snapshot (release pre-flight, 2026-05-25)

- `npm install --include=optional`: 16 new packages added (6 MathTS + 10 transitive), 0 vulnerabilities
- `npm run build`: clean (TS 6.0.3)
- `npm test`: **2126 passed / 0 failed / 5 skipped / 1 todo** — identical to v0.7.2 (no source change → no test-surface change)

### Honest accounting

- **Why declare without code?** The declarations remove the "BLOCKED on peer install" qualifier from the P4 Bridge DSL horizon item (and analogous future items for parallel/wasm). They also let consumers `npm install universal-physics-tensor && npm install @danielsimonjr/mathts-expression` cleanly, surfacing future integrations earlier in the development cycle. The downside is "aspirational dep declaration" — these declarations create maintenance signal even before they're used.
- **What does NOT change**: UPT's actual runtime behavior, public API, MathTSEngine integration. v0.7.3 = v0.7.2 + 6 lines in `package.json`.

---

## [0.7.2] — 2026-05-25

**Patch release: MathTS AD integration fix surfaced by the typed-function EOVERRIDE resolution.** Fixes 8 newly-activated test failures that had been hidden behind `.skipIf(true)` peer-gating since v0.4.0.

### Context

The typed-function EOVERRIDE fix (`danielsimonjr/typed-function#5711dab`, pushed earlier this session) finally allowed the `@danielsimonjr/mathts-*` optional-peer chain to install cleanly in UPT. That install activated 23 previously-skipped MathTS integration tests — of which 8 immediately failed, revealing two latent bugs that had been invisible since the integration code was written:

### Fixed

- **`MathTSEngine.add/sub/mul/scale` lacked AD-dispatch (Pattern A — 6 failures).** When the AD path lifts the input `x` to a `DualTensor` (forward) or `TapedTensor` (reverse) from `@danielsimonjr/mathts-autograd`, the engine's arithmetic methods receive the wrapped tensor. The S1-fix comments in the code documented the intended dispatch pattern but the dispatch was never *implemented* — `unwrap()` threw `NumericalBackendError: MathTSEngine.mul: operand is not a MathTSEngineTensor` instead of routing to `DualTensor.mul` / `TapedTensor.mul`. Fix: duck-typed dispatch (`'tangent' in arg` for forward, `'tape' in arg` for reverse) mirroring `Float64ReferenceEngine`'s `instanceof EngineDualTensor / EngineTapedTensor` pattern, but using runtime structural checks since `mathts-autograd` is an optional peer and cannot be statically imported.
- **`mathts-engine-typing.test.ts` ran absence-path tests when peer was present (Pattern B — 2 failures).** Tests literally named *"forwardGrad throws EngineCapabilityError when mathts-autograd is absent"* fired their assertions when the peer was *present*, getting `NumericalBackendError` instead of `EngineCapabilityError` (because `forwardGrad` was called with a `Float64Tensor`, which `unwrap()` rejects). Fix: gate these tests behind an additional `autogradAbsent` check; skip them with a clearly-named placeholder when the peer is present.

### Validation

- **Suite: 2103 (v0.7.1) → 2126 passed (+23 net new tests activated)**, 0 failed, 5 skipped (3 PC-1.5 long-run + 1 mathts-engine-typing absence-path + 1 other), 1 todo. The +23 are the engine-conformance MathTS half (now running both Float64 and MathTS engines through the same AD contract) and the `mathts-autograd.test.ts` adapter check.
- `npm install --include=optional` cleanly populates `node_modules/@danielsimonjr/` with `mathts-autograd`, `mathts-core`, `mathts-tensor` — the first time this has worked locally since the EOVERRIDE was introduced.
- `npm audit`: 0 vulnerabilities.

### Honest accounting

- **The bugs predate v0.7.2** — they have been latent in UPT's `MathTSEngine` since v0.4.0 (when the peer-gated tests were first marked `.skipIf(true)`). v0.7.2 is the patch release in which they were both *discovered* and *fixed*. Consumers who previously imported `MathTSEngine` and used the AD methods (`forwardGrad`/`reverseGrad`) with a real `@danielsimonjr/mathts-autograd` install would have hit the Pattern A bug. v0.7.2 fixes that.
- **Lesson**: deferred test enablement that depends on an optional peer is a special kind of silent debt — the gate (`.skipIf(true)`) prevents validation in *every* environment (local, CI, peer-installed contributor) until the gate itself is reconsidered. The right pattern for peer-gated tests is `describe.skipIf(!peerPresent)`, not `.skipIf(true)`. Captured as a v0.8 execution lesson in `todo.md`.

### Closes

- The "P8 real-AD test enablement" horizon item in `todo.md` is now *partially live*: the engine-conformance AD contract runs against `MathTSEngine` whenever the peer is present. The remaining open work is the v0.9 Phase 2 spec (AD-vs-analytic gradient assertions for specific bridge equations).

---

## [0.7.1] — 2026-05-25

**Patch release: dev-dep validation under newer toolchain.** No source changes. The published `dist/` is rebuilt with TypeScript 6.0.3 (v0.7.0 published with `^6.0.3` declared but `dist/` was built with TS 5.9.3 — see honest accounting in the v0.7.0 entry). Closes the declared-but-not-installed half-state surfaced in the post-v0.7.0 audit.

### Changed

- **Dev-dep installs refreshed** to match declarations in `package.json`. Prior state: `@types/node@24.12.2`, `typescript@5.9.3`, `vitest@4.1.4` installed; declared `^25.9.1` / `^6.0.3` / `^4.1.7`. Post-install state: all three at declared versions. Full suite (2103/0/5/1) re-validated under the new toolchain — no regressions.
- **`dist/` rebuilt under TS 6.0.3** + `@types/node` 25.9.1. Output layout unchanged (468 files / 3.1 MB across `core`/`bridges`/`dimensional`/`numerical`/`diff`), but emitted `.d.ts` / `.js` bytes differ subtly between TS major versions. Consumers in TS-strict mode may pick up newer type-only constructs (TS 6's emit conventions). No API surface change.
- **`package-lock.json`** regenerated to reflect the resolved-version updates.

### Dep-health snapshot (release pre-flight, 2026-05-25)

- `npm audit`: **0 vulnerabilities**
- `npm outdated`: clean — no outdated deps in the `^X` range
- `npm run build`: clean (TS 6.0.3 strict mode)
- `npm test`: **2103 passed / 0 failed / 5 skipped / 1 todo** under vitest 4.1.7

### Known limitation (carried into 0.7.1; documented for future-resolution)

- **MathTS optional peers (`@danielsimonjr/mathts-tensor`, `@danielsimonjr/mathts-autograd`) cannot be installed locally** due to an upstream `EOVERRIDE` conflict in `typed-function` (a transitive dep of `mathts-core`): typed-function's own `package.json` has `overrides: { "@rollup/plugin-terser": "^0.4.4" }` that conflicts with a direct dependency in the same file, causing `npm install` to silently skip the optional peers (and their dependents). Consumers who try `npm install universal-physics-tensor` will see the same skip — UPT itself works fine since the peers are optional and gated by runtime presence-checks (e.g., `tests/numerical/mathts-engine-*` files use the `optional-dep` gating pattern). The fix lives upstream in `~/Dropbox/Github/typed-function/package.json` — re-publishing typed-function with the override conflict resolved would unblock the full MathTS install chain. Tracked as a follow-up; the P8 horizon item ("real-AD test enablement when CI installs the autograd peer") is also blocked on this.

---

## [0.7.0] — 2026-05-25

**Tag decision**: single v0.7.0 rolling everything (per user, 2026-05-25) — subsumes the v0.6.0 tag (never published to npm) plus the v0.6.1 hygiene sprint (never tagged) plus the six v0.7-series proposals plus the v0.7 hygiene follow-up plus the v0.7.1 hygiene sprint. Jumps registry 0.5.1 → 0.7.0.

**Dep-health snapshot (release pre-flight, 2026-05-25)**:
- `npm audit`: **0 vulnerabilities**
- `npm outdated`: 3 deferred majors (@types/node 25.x, typescript 6.x — both devDeps, both flagged for a dedicated dep-bump release; vitest declared at 4.1.7 with installed 4.1.4 — install lag, non-blocking for publish since vitest is a devDep)
- `tsc --noEmit`: clean
- `npm run build`: clean (468 files / 3.1 MB across all five subsystems, replacing the stale v0.1.0-era dist/)
- `npm test`: 2103 passed / 0 failed / 5 skipped / 1 todo (after Windows path-separator fix landed for the v0.7.1 public-surface guard test)

**Six v0.7-series proposals shipped + v0.7 hygiene/audit follow-up sprint + v0.7.1 hygiene sprint**, on branch `claude/changelog-todo-sync-9PdMg` (now merged to master). Suite carried from **1675 (post v0.6.1 phases) → 2103 (+428 net new tests across the full v0.7 cycle)**, 0 failed throughout. Public surface delta: **+44 symbols** across the six proposals (P3: 7, P2: 10, P1: 12, P5: 16, P8: 7, P6: 0 docs-only) plus the v0.7 follow-up additions (Klein-Gordon equation node, Painlevé-Gullstrand metric, field-equation helpers — see "v0.7 hygiene follow-up" below). All six proposals went through an Adam+Eve adversarial-review cycle (Opus-subagent stand-ins per session pragma — Gemini/OpenAI MCP tools unavailable), with redraft+re-vet on P2 for 3 SHOWSTOPPER-class findings caught in first pass.

### v0.7 hygiene + audit follow-up sprint (2026-05-23)

After the six proposals shipped, a focused hygiene sprint worked down the backlog of carry-forwards, audits, and design notes. **Pattern observation: 7 of N audit-recommendation references in this sprint were stale by at least 40% from HEAD reality** — memorialized as the v0.7 execution lesson "verify carry-forward release-note numbers by re-running the tool at HEAD before treating them as work scope" (`todo.md` → execution lessons).

Stale-carry-forward closures:
- **PC-1.5 Shapiro residual** (3-release carry-forward): documented 2.51e-4, actual at HEAD **2.28e-8** — 4 orders of magnitude tighter. v0.6.0 BR-2 christoffelFn→Float64Array(64) refactor silently fixed it; never re-measured. Smoke gate `tests/numerical/be37-shapiro-step-sweep.test.ts` pins relErr in `[1e-10, 1e-6]`; long-run sweep gated behind `GL4_LONG=1`. Findings doc: `docs/architecture/v0.7-pc15-shapiro-floor.md`.
- **AS-3 `schwarzschildPin` helper** (v0.5.1 carry-forward): documented ~65 invocation sites, actual at HEAD **8**. Closed WON'T-DO — helper overkill at that scale.
- **BE-module exports triage** (v0.6.1 Phase 3 carry-forward): documented ~85 unused exports, actual at HEAD **61**. Applied bucket-(a) drops on 20 confirmed-zero-importer constants/validators across 14 BE files; bucket-(a') `@internal` JSDoc annotation pass on the remaining 40 `*Inputs` interfaces. Audit doc: `docs/architecture/v0.7-be-module-exports-audit.md`.
- **Vitest 4.1.4 async-bench reporter limitation** (v0.4.5 carry-forward): closed at vitest 4.1.7 (patched via dep bump). Async benches now print full per-bench hz tables (4,258.52 hz for BE-37 RK4; 2.18 hz for covariant-eikonal).
- **Unknown↔unknown bridge count "~9"** (BRIDGE-PHYSICS-AUDIT §3): actual count at HEAD **26**. Inventory compiled at `docs/architecture/v0.7-unknown-unknown-bridges-inventory.md`.
- **Near-horizon Kretschmann scope estimate** (in-session design note): estimated ~600 LOC across 4 files; actual implementation **~300 LOC** (the architectural question dissolved because `computeKretschmann` was already coordinate-agnostic).
- **BE-33 `−ν/z` exponent fix** (BRIDGE-PHYSICS-AUDIT §4 audit recommendation): already corrected to `-1/z` on 2026-05-20 before the audit recommendation was even written — the audit doc itself was stale.

`lowering.ts` v0.6.1 sprint-target miss (903 vs ≤890 LOC) closed:
- Extracted `tensor-partial-derivative` + `covariant-derivative` arms (~298 LOC) into new `src/numerical/derivative-lowering.ts` (341 LOC) + `src/numerical/lowering-utils.ts` (72 LOC). Track-B's medium-risk forward-import concern resolved via thunk pattern (`recur: LowerNodeRecur` parameter — acyclic module graph). `lowering.ts` 903 → **597 LOC** (beat ≤890 target by 293).

Painlevé-Gullstrand near-horizon Kretschmann (v0.6.0 deferred item):
- `src/numerical/painleve-gullstrand-metric.ts` (closed-form PG metric + inverse; regular at r=r_s). The architectural question "parallel pipeline vs flag vs `*PG` family" dissolved during implementation — `computeKretschmann` already takes raw arrays (coordinate-agnostic). 9 tests cover far-field through inside-horizon: at r=r_s exactly (Schwarzschild-coords-impossible), inside r=0.5·r_s (also Schwarzschild-coords-impossible). Closes 3-release deferred work.

TensorEquationNode<LHS,RHS> generalization (v0.6.0 E-6 deferred):
- **Phase 0** (helper extraction): `src/dimensional/field-equation-helpers.ts` with `validateFreeIndexLabelMatch` / `validateComponentDimension` / `validateTensorSymmetry`. `validateEinsteinFieldEquation` refactored to delegate (behavior-preserving; error keywords `"index label"` / `"dimension"` / `"symmetry"` pinned).
- **Phase 1** (first new field-equation node): `src/dimensional/klein-gordon-equation.ts` — `KleinGordonEquationNode` for `(□+m²)φ = J`. Thin validator (~40 LOC) demonstrates the Phase 0 helper-extraction's payoff vs the pre-extraction ~80 LOC body.
- Phase 1+ for BE-13/19/39/50 re-encodings (TensorTraceNode, FriedmannEquationNode, BetaFunctionNode, GaugeFieldNode + TimeSymmetryPredicateNode) design-noted at `docs/architecture/v0.7-be-x-reencoding-design-note.md` for follow-up sessions. Recommended order: BE-13 → BE-39 → BE-50 → BE-19.

BRIDGE-PHYSICS-AUDIT §1 + §3 + §4 + §5 follow-ups:
- **§1 structural finding**: added optional `encoded_form?: string` field to `BridgeEquationEntry` documenting WHAT the AST encoding represents when it differs from `formula_latex`. Applied to BE-13, BE-47, BE-48 (the encoding-reductions the audit identified).
- **§3 unknown↔unknown naming**: 17 bridges renamed to mappable regime pairs; 9 classified NOT-A-BRIDGE per audit §3 bridge-incoherence. Per-bridge `notes:` footnotes with confidence tier + rationale. Conflict-analysis doc at `docs/architecture/v0.7-bridge-status-recalibration-analysis.md`; physics-judgment proposals doc at `docs/architecture/v0.7-physics-judgment-proposals.md`.
- **§4 BE-34 Boltzmann factor**: notes append documenting Adam's cosmological-KZM-with-massive-defects rationale (Linde 1990) + Eve's mechanism-conflict concern. Status stays `'speculative'` to flag the multiplicative-combination element.
- **§5 status recalibration**: 1 status flip (BE-14 `'established'` → `'speculative'`) + 3 notes footnotes (BE-16/29/40 keep current status with audit-considered rationale) + 1 deferral (BE-34 coupled to Boltzmann dispute).

Dev-dep bumps (major + patches):
- `typescript`: 5.9.3 → **6.0.3** (major; one-line tsconfig fix `"types": ["node"]` resolved the `process`/`console`/`globalThis.crypto` regressions).
- `@types/node`: 24.12.2 → **25.9.1** (major; same tsconfig fix).
- `vitest`: 4.1.4 → 4.1.7 (patch; side-benefit: closed the v0.4.5 async-bench reporter limitation).

Pre-flight log shipped at `docs/architecture/v0.7-release-preflight-log.md`. All 5 blocking pre-tag checks pass (npm audit 0 vulnerabilities; npm outdated within-range deps up-to-date; tsc strict clean; smoke OK). **Pre-tag verdict: READY** when user decides on tag-strategy option.

### v0.7.1 hygiene sprint — Phases 0-6 COMPLETE (with O-1 deferred) (2026-05-25)

Sprint working down the 42-candidate Minimize/Simplify/Optimize brainstorm at `docs/planning/v0.7.1-brainstorm-{minimize,simplify,optimize}.md` against the consolidated 6-phase design at `docs/planning/v0.7.1-Design.md`. All six phases landed; one optimize-axis candidate (O-1, Schwarzschild fixture Float64Array migration) deferred to v0.7.2 due to ~20+ direct-index callsite churn. Suite: 2057 (Phase 0 baseline) → **2103 passed / 0 failed / 5 skipped / 1 todo** (+46 net new). No public-surface deletion; net-add only per design Decision #2.

**Phase 0** (baseline + per-candidate verification, `49cf47f`):
- Captured suite/build baseline at HEAD `f11eee1`. Documented 3 drifts: M-1 candidate is 5 modules not 7 (field-equation-helpers + validator-registry have NO `@public` tags — correctly internal); M-3 candidate is 45 *Inputs interfaces not ~37; M-5 candidate is 30 validators (broader than just BE-NN names). Design adjusted accordingly before Phase 1 dispatch. Baseline doc: `docs/architecture/v0.7.1-baseline.md`.

**Phase 1** (Surface restoration M-1 + guard test + tooling, `288a45c`):
- New invariant test `tests/api/public-tag-vs-index-invariant.test.ts` walks `src/**/*.ts`, parses every `@public`-tagged declaration, and asserts each is reachable from `src/index.ts`. Allowlist `PRE_V071_ACCEPTED_DRIFT` (44 entries) freezes pre-existing debt so future drift fails the build.
- 5 v0.7 primitive modules re-exported from `src/index.ts`: `tensor-trace`, `friedmann-equation`, `rg-flow`, `gauge-field`, `klein-gordon-equation` (closes M-1).
- `tools/create-dependency-graph/create-dependency-graph.ts` patches: M-13 `reExportNamedRegex` now matches `export type { ... } from`; M-14a side-effect-only imports (`import './foo.js'`) now parsed; M-14b `.ambient.d.ts` files skipped in unused-file detection. Result: 95 → 60 captured unused exports; 4 → 0 unused files.

**Phase 2** (Mass-annotation pass M-3 + M-4 + M-5, `b951580` + `8bffcef` + `8fc13d8` + `9f246eb`):
- 42 of 45 `*Inputs` interfaces had `export` dropped (3 retained: `DecoherenceRateInputs`, `ShapiroInputs`, `HawkingTemperatureInputs` — actual consumers in `src/diff/bridge-specs.ts`). 3 batches.
- 33 `*_LHS` constants + 39 `validate*Dimensions` functions tagged `/** @internal */` (M-4 + M-5).

**Phase 3 complete** (BE-NN triple-extraction, HIGHEST-STAKES, `2748566` + `cae3976` + `da98b98` + `094e03e` + `1eb7798` + `29f4041`):
- Task 3.1: `src/bridges/equations/_be-helpers.ts` — 3 shared helpers (`validateFiniteInputs`, `validateBEDimensions`, `sym` factory) + 43 unit tests. Closes S-1 (`sym` factory duplicated across all 43 BE modules) + S-2 (input-validation boilerplate) + S-3 (`validateEquation` + `validate(LHS)` + `validate(RHS)` triple-redundancy).
- Task 3.2 batches 1-4: applied helpers to BE-11..54 (43 BE modules — full catalog migrated). Cumulative net diff across helpers + tests + migration + rg-flow: **+746 / -1071 LOC** (net -325 LOC; migration-only: +514 / -1071). Re-measured at HEAD `b6cc8df` (Eve E2 honesty fix).
- Task 3.3: `src/dimensional/rg-flow.ts` `validateRGCoupling` Predicate 2 + `validateBetaFunction` Predicate 4 migrated from inline `equals(...) → throw` blocks to `validateComponentDimension` from `field-equation-helpers.ts`. Closes S-8 + BRIDGE-PHYSICS-AUDIT v2 Adam-MEDIUM #2 simultaneously.

**Honest-claude per-module deviations** (batch 4, expected per design):
- **BE-44 (soft-hair)**: array shape checks (`Array.isArray`, per-element loop on `news_samples[i]`) stayed inline — `FieldSpec` doesn't drill into array elements. Only `du` migrated.
- **BE-48 (GRW)**: optional fields with defaults — a `resolved` object applied defaults before the helper call.
- **BE-50 (Wheeler-Feynman)**: `denom === 0` division-by-zero guard stayed inline (relational, not per-field range).
- **BE-53 (Yang-Mills)**: file-local `sym` had a different signature (`(name) → DIMENSIONLESS-pinned`); each call rewritten to `sym(name, DIMENSIONLESS)`. No `validateBE53Dimensions` exists in this module.
- **BE-41 (swampland)**: combined `phi/phi0` finite-check split into two `FieldSpec` entries — tests assert only `RangeError`, safe.

**Mid-cycle Adam+Eve vet** (commits `af8c813` Adam + `1023210` Eve, opus subagent stand-ins per session pragma):

- **Adam — GREEN** (0 HIGH / 0 MEDIUM / 2 LOW). Verdict: Phase 4 may proceed. `sym()` factory (design's flagged highest-risk extraction) is a 1:1 literal reproduction with 14 dedicated unit tests pinning kind/name/dim preservation. `validateBEDimensions` LHS/RHS order correct across all spot-checked modules. `validateFiniteInputs` semantics preserved. `rg-flow` Task 3.3 preserves `actual=node.dim, expected=DIMENSIONLESS` order. 2 LOWs: BE-48 GRW destructure-default switched to `??` nullish-coalesce (equivalent for TS callers, only differs for JS callers passing `null`); cosmetic error-message prose drift. Report: `docs/architecture/v0.7.1-phase3-adam-vet.md`.

- **Eve — YELLOW** (0 HIGH / 3 MEDIUM / 3 LOW). Verdict: Phase 4 unblocked, 3 honesty fixes recommended. **E1 fixed in this CHANGELOG**: Phase 3 commit-hash citations had cited the agent-worktree hashes (`f5ebe51` etc.) instead of the cherry-picked hashes on `claude/changelog-todo-sync-9PdMg` (`2748566` etc.). **E2 fixed in this CHANGELOG**: LOC count was `+500 / -1057` claimed vs `+746 / -1071` actual at HEAD (Eve's `+529 / -1086` migration-only number used a different commit pair; my re-measurement at HEAD `b6cc8df` is `+514 / -1071` migration-only). **E4 deferred to Phase 4 ride-along**: BE-25-iit-phi error message regressed from "must be a finite probability in [0,1]" to grammatically awkward "must be a finite in range [0,1] number" — domain noun "probability" lost. Helper needs a `description` adjective override; tests still pass (RangeError class only). Report: `docs/architecture/v0.7.1-phase3-eve-vet.md`.

Eve's fabrication rate ~0% — every finding has a file:line citation + re-runnable verification; 3 of 8 brief axes explicitly returned "NO FINDING after check" (axes 2/6/7+8) rather than padding.

**Phase 4 complete** (Simplify Phase B, `25d43dd` + `2a86611` + `94c2e82` + `7ffd975`, 4 commits + 3 net-new tests):
- Task 4.1 (`25d43dd`): S-5 + S-6 dedup cleanup. Dropped 3 private helpers (`_dimensionOf`/`_requireValue`/`_flattenNestedArray`) from `curvature-lowering-helpers.ts:599-621`; route through public equivalents in `lowering-utils.ts`. Dropped `dimEquals` re-impl from `friedmann-equation.ts:167`; use existing `equals` from `dimensional/algebra.ts`.
- Task 4.2 (`2a86611`): S-13 pattern-B validator consolidation. Extracted `RiemannChildCallback` type alias to `curvature.ts` (NOT `validator-registry.ts` — would create import cycle); `@internal`-tagged (initial `@public` caught by the Phase 1 `public-tag-vs-index-invariant` guard test). 3 inline callback shapes consolidated.
- Task 4.3 (`94c2e82`): S-14 `mergeFreeIndices` dedup. **Brainstorm count was STALE** (predicted 5×, actual at HEAD **8×**); extracted helper + replaced all 8 instances. The 2 surviving `for (const [label, counts] of ...)` loops (in `freeIndicesEqual` + `formatFreeIndices`) are equality/stringify — not merges — left untouched.
- Task 4.4 (`7ffd975`): Eve E4 BE-25 prose regression fix. Added `description?: string` optional field to `FieldSpec` in `_be-helpers.ts`; `describeRange()` prefers it over auto-generated "in range" prose. BE-25 callsite updated; +3 unit tests (range-branch, non-finite branch, bound-check-still-fires).

**Phase 5 partial** (Optimize Paired Commit, `707a2f7`, O-2 only):
- Task 5.2 (`707a2f7`): O-2 Picard ping-pong buffer pre-allocation in `solveGL4Stage`. Replaced 4 per-iteration `number[][]` allocations (worst-case 50 iter × 4 allocs/iter = ~200 allocs/step) with 8 pre-allocated `Float64Array` buffers swapped by parity. Caller-safe via clone-on-return (2 small allocs/converged step).
- **Bench-measured speedup** (`bench/gl4-picard-alloc.bench.ts`): single GL4 stage **2742.39 hz → 3490.50 hz = 1.27×**; 100-stage batch **27.34 → 35.30 hz = 1.29×**. Below the brainstorm's "2-5×" target — that prediction assumed paired O-1.
- **O-1 DEFERRED to v0.7.2**: Schwarzschild fixture `gInverseFn` / `dgInverseFn` migration to `Float64Array(16)` / `Float64Array(64)` is the BR-2 sibling, but the migration surface is ~20+ callsites including many tests with direct `gInv[μ][ν]` and `dg[λ][μ][ν]` indexing that need coordinated rewriting. Parallel-agent dispatch hit infrastructure friction (subagent reported edits being reverted; could not land); the work needs a dedicated session. O-6 PG ride-along likewise deferred.

**Phase 6 complete** (`84115fa`, bench harness additions + benchmarks doc):
- New bench `bench/kretschmann-symmetry.bench.ts` — O-3 baseline (compute-only Kretschmann @ Mercury + near-horizon; full FD-build-+-Kretschmann pipeline). Future symmetry-exploiting variant target (Riemann has 20 indep components in 4D, not 256).
- New bench `bench/painleve-gullstrand-pipeline.bench.ts` — O-6 baseline (PG metric closures across far-field / AT-horizon / inside-horizon + full PG → Riemann → Kretschmann pipeline).
- `docs/architecture/benchmarks.md` appended with v0.7.1 PO-1 post-O-2 numbers (1.27×/1.29× speedup) + the O-3/O-6 bench-harness pointers (no per-machine baseline tables — informational only per design Decision #5).

Version bump 0.7.0 → 0.7.1 SKIPPED per user directive (publish still blocked on token rotation).

**Sprint totals**: 198 → 200 + 2 skipped test files; 2056 → **2103 passed / 0 failed / 5 skipped / 1 todo** (+47 net new from `_be-helpers` unit tests + Phase 4 + Phase 6); 26 sprint commits; 2 new bench harnesses; 2 new mid-cycle vet docs; 4 Adam+Eve review cycles (1 mid-cycle pair + 2 pre-sprint pairs implicit in the brainstorm review). All carry-forward CHANGELOG/todo numbers re-measured at HEAD per the v0.7 stale-carry-forward lesson; Eve E1+E2 honesty fixes applied same-commit-cycle.

### v0.7 BRIDGE-PHYSICS-AUDIT v2 (2026-05-24, parallel Adam+Eve opus reviewers)

Re-audit of the post-v0.7 catalog state (now 44 bridges with BE-53/54 extensions + 17 unknown↔unknown renames + 5 status recalibrations + audit-§1 `encoded_form` field). Adam (per-bridge content review, ~550 LOC) + Eve (red-team gap-finding across 6 axes, ~326 LOC) co-authored `docs/architecture/BRIDGE-PHYSICS-AUDIT-v2.md`.

**Headline verdict**: catalog deltas physics-check clean (**0 INVALID equations**). Five Adam-actionable findings + 13 Eve-gap findings; 2 highest-priority closed same commit cycle.

**Closed immediately** (commit `e2ae944`):

- **Eve-E1** (silent test-coverage gap): `EXPECTED_DIMENSION_BY_BRIDGE` in `src/dimensional/bridge-check.ts` did not register BE-53/54; the verification test pinned `.toBe(40)` and iterated ids 11-50 only. The catalog-extension protocol step from `orphan-dimensional-signature.test.ts:37-43` was silently skipped during BE-53/54 ship. **Fixed**: added `[53, DIMENSIONLESS]` (Yang-Mills β of dimensionless coupling) + `[54, T_INV2]` (Randall-Sundrum H² has dim [T^-2]). Test updated to `.toBe(42)` with extended id range. Closes a latent correctness-regression risk — future BE-NN entries that miss the protocol step will now FAIL this assertion instead of silently skipping.
- **Eve-E13** (pre-tag stale pins): Test-count `1854` cited in 3 places across `v0.7-release-preflight-log.md` + `v0.7-release-notes-draft.md` (pre-tag-flow docs); HEAD count is 2056 (+202 drift across the BE-X sprint, BE-53/54 catalog extensions, and the E1 fix). **Fixed**: refreshed both pre-tag docs to HEAD counts; header banner notes the 2026-05-24 update + E13 origin.

**Adam findings deferred to user physics-judgment session** (v0.8 ride-alongs):

- **Adam-HIGH** BE-42 Hawking temperature NOT-A-BRIDGE reversal — Adam argues T_H = ℏc³/(8πGMk_B) IS the archetypal quantum↔gravity bridge (contains ℏ + G in one scalar; undefined without either regime); v0.7 conflated "mis-filed in wrong category" (audit §3 framing finding) with "not a bridge". Recommendation: `bridges: ['quantum', 'gravity']` + drop NOT-A-BRIDGE marker. Adam flagged for Eve-perspective second opinion before applying.
- **Adam-MEDIUM** `encoded_form` mass-population to 13 more entries (BE-17/18/20/21/27/29/32/35/36/42/44/46/50) — selective application re-creates the v1 §1 transparency gap the field was added to close. Mechanical pass; ~30-60 min focused work.
- **Adam-MEDIUM** BE-29 Jarzynski NOT-A-BRIDGE reconsider — Adam argues Jarzynski IS a non-eq ↔ eq bridge; "single-regime statmech" undersells the content. Same single-reviewer caveat as BE-42.

**Eve gap findings deferred** (low-priority ride-alongs):

- Eve-E2-E6 stale carry-forward in 4 historical docs (be-module-exports-audit.md etc.); records of point-in-time state, not pre-tag references.
- Eve-E7 documented as already-deferred — BE-28/33/44/45/47 "slightly strong" demotion question.
- Eve-E8 BE-22/31 marginal renames.
- Eve-E10 BE-54 arXiv refs (arxiv.org returned 403 to WebFetch; needs manual cross-check).
- Eve-E9 consolidate stale-carry-forward retrospective.

### v0.7 catalog extension (2026-05-24, parallel-agent dispatch, sibling to BE-X sprint)

Two new catalog entries shipped via parallel-agent dispatch — exercising the AST primitives the BE-X agents just shipped:

- **BE-53 — Yang-Mills one-loop β-function** (sonnet, `bedd385` + `acae340`): single-coupling `BetaFunctionNode` with `fixedPoint: [0]` (asymptotic-freedom UV-FP). Structural dual of BE-39's two-coupling NGFP — demonstrates the primitives are flow-direction-agnostic. QCD `b₀=7` (`N_c=3, N_f=6`), pure SU(3) `b₀=11`, asymptotic-freedom boundary at `N_f ≈ 16.5`. Status: `'established'` (Nobel 2004 — Gross/Politzer/Wilczek). 32 tests.
- **BE-54 — Randall-Sundrum brane cosmology** (sonnet, `0ef5253` + `c400185` + follow-up `b8153f6`): exercises BE-19's `'brane'` variant of `FriedmannEquationNode`. Brane-tension correction `(1 + ρ/(2σ))` is dimensionless; `H² ≥ 0` always. Status: `'speculative'` (real framework, experimentally unconstrained). 32 tests (24 raw-AST + 7 structural follow-up + 1 catalog-round-trip).

Catalog: 42 → **44 entries** (BE-51/52 from v0.4.0 + BE-53/54 from v0.7). Suite: 2017 → 2056 (+39 from this batch).

**Pattern note**: agent worktrees forked from variable points (BE-53 from `ccda66a`, saw `rg-flow.ts`; BE-54 from `fb7ff8b`, didn't see `friedmann-equation.ts` and fell back to raw-AST). The 5 catalog-length-pin conflicts during the BE-53 cherry-pick all resolved cleanly. Lesson logged: pre-flight `git merge-base` check helps but doesn't fix; future parallel dispatches should have agents `git pull` + `git rebase` if their worktree HEAD doesn't match `origin/...HEAD`.

### v0.7 BE-X re-encoding sprint (2026-05-24, parallel-agent dispatch)

All four BE-X re-encodings the user approved shipped via parallel-agent dispatch (2× sonnet, 2× opus, isolated worktrees per agent). Each agent ran independently; cherry-picked back onto the main branch with zero conflicts. Suite: 1897 → **1992** (+95).

- **BE-13 (Einstein trace, sonnet)** — `TensorTraceNode` + `TracableTensorNode` structural-interface input. `BE13_T_TRACE_NODE` additive export. +20 tests. (`55a59af` + `f57fad5`)
- **BE-19 (LQC quantum-bounce, opus)** — `FriedmannEquationNode` with 5-variant discriminator (`classical | lqc | brane | dgp | massive`). `BE19_LQC_FRIEDMANN_STRUCTURAL` additive export. +23 tests. Validator pinned to `[M·L^-3]` mass-density convention per BE-19's existing encoding. Agent recommends Randall-Sundrum brane cosmology as next variant exerciser. (`5ebffa8` + `af27132`)
- **BE-39 (asymptotic safety, opus)** — `BetaFunctionNode` + `RGCouplingNode` AST primitives. `BE39_BETA_G_STRUCTURAL` + `BE39_BETA_LAMBDA_STRUCTURAL` additive exports. +28 tests. **Honest deviation**: worktree forked from pre-v0.7 baseline (b67481b); agent improvised against pre-Phase-0 `einstein-equation.ts` instead of the `field-equation-helpers.ts` it didn't see. Functional output correct; style mismatch is a future-cleanup item. Agent recommends BE-26 Yang-Mills β-function as next RG-related BE. (`76afe1e` + `5e7e812`)
- **BE-50 (Wheeler-Feynman, sonnet)** — `GaugeFieldNode` + `TimeSymmetryPredicateNode` with `arrowOfTime` discriminator. `BE50_TIME_SYMMETRY_PREDICATE_STRUCTURAL` additive export with ε=1e-2 (Cramer 1986 §VII experimental bound). +24 tests. (`3860d7b` + `e8d3df0`)

All four used additive-new-export strategy — legacy AST exports + tests unchanged. Zero regressions; build clean (tsc 6.0.3 strict).

Cumulative public-surface delta from the BE-X batch: +4 AST primitive types (`TensorTraceNode`, `FriedmannEquationNode`, `BetaFunctionNode`, `TimeSymmetryPredicateNode`) + 4 helper types (`TracableTensorNode`, `RGCouplingNode`, `GaugeFieldNode`, `ScalarFieldNode` shared) + their validators. None promoted to `src/index.ts` yet (would require coordinated public-surface decision — deferred to tag-time review).

Execution-lesson logged: **verify `git merge-base` of agent worktree branches BEFORE agent starts**. BE-39's worktree forked from `master` rather than the working branch, causing the agent to write against a 200-commit-stale baseline. The functional output worked because the agent's improvisation against pre-Phase-0 code paths happens to cherry-pick cleanly onto the post-Phase-0 base, but the style/architectural deviation is a clear signal — pre-flight a worktree fork-point check in future parallel dispatches.

### v0.8 Proposal 5 — RegimeType Extension System (`src/core/regime-registry.ts`)

### v0.8 Proposal 5 — RegimeType Extension System (`src/core/regime-registry.ts`)

- **`defineRegime(spec)`** + six per-axis convenience APIs (`defineScale` / `defineForce` / `defineSymmetry` / `defineInformation` / `defineDimension` / `defineTopology`) + lookup helpers (`lookupRegime`, `listRegimesByAxis`, `provenanceFor`). Per P5 Decision #1, ships the extension MECHANISM only; closed taxonomy of NEW physics-regime built-ins deferred to v0.9 per-bridge physics review.
- **`src/core/regimes-builtins.ts`** — pre-registers the 18 v0.6-shipped closed-union values at module load (4 scales, 5 forces, **5 symmetries per Eve-M1 correction — NOT 4+placeholder**, 4 information measures). Integer axes (dimension, topology) ship no built-ins (wildcards per P1 census + P5 Decision #4).
- **`attachRegimesToCell(cellId, regimes)` / `getCellRegimes(cellId)`** — per-cell regime attachment via **sibling registry keyed by cell id** (per Adam-M1 resolution: avoids breaking P3's `BridgeCell` surface AND the `cellToBridge` adapter round-trip that would strip unknown fields).
- **`FluxRuleKind` extended** with `'regime-consistency'` discriminator (per Eve-M2 reconciliation): explicit union extension + dispatch case + `_exhaustive: never` re-verification. `src/core/regime-rule-install.ts` installs the rule body via a registered-callable pattern (no circular import); fires WARNING tier on cell-regime mismatch.
- **`RegimeCollisionError`** thrown on `(axis, tag)` re-registration with mismatched content. Idempotent for identical re-registrations per Eve-L1.
- Suite: 1813 → 1835 (+22).

### v0.9 Proposal 8 — Bridge Parameter Differentiation (`src/diff/bridge-gradient.ts`)

- **`bridgeGradient(spec, engine, params)`** — async; reverse-mode AD wrapper over `MathTSEngine.reverseGrad` (which delegates to optional peer `@danielsimonjr/mathts-autograd`). Returns `{ value: number, gradient: EngineTensor }`. Throws `EngineCapabilityError` when engine lacks AD support (graceful degradation per the v0.4.0 pattern).
- **`gradientToNamed(spec, gradient, engine)`** — unpack helper. Returns `Record<string, number>` keyed by `paramNames`.
- **`BridgeDiffSpec<Input>`** — spec shape with `bridgeId`, `name`, `paramNames`, `defaults`, `evaluate`. Per Decision #1, lives in `src/diff/` (new directory); doesn't touch `src/bridges/`.
- **Four representative specs shipped** (per P8 Eve M1-M3 reconciliation, using verified struct-arg signatures from HEAD):
  - `BE11_DECOHERENCE_DIFF` (`gamma0_per_s, lambda, lambda0`)
  - `BE37_SHAPIRO_DIFF` (`M_kg, R_far_m, R_near_m`)
  - `BE42_HAWKING_DIFF` (`M_kg`)
  - `BE52_PERIHELION_DIFF` (`M_kg, a_m, e` + `T_yr` in defaults; scalar selector extracts `dphi_rad_per_orbit`)
- **Engine-capability matrix** (per audit doc):
  - `Float64ReferenceEngine`: has AD methods but dual-number AD cannot trace plain-JS bridge math (documented honest limitation).
  - `MathTSEngine` + `mathts-autograd` installed: full AD via computational-graph IR.
  - No-AD mock: `EngineCapabilityError` from `bridgeGradient`'s capability check.
- **P8 Adam-H1 honest scope note**: `node_modules/@danielsimonjr/` was EMPTY in the dev env (sandboxed, no registry pull); `npm install --include=optional` was a no-op. Real-AD tests are `describe.skipIf(true)`-marked until the peer is installed in a consumer env. Graceful-degradation surface is fully tested.
- Suite: 1835 → 1853 (+18 + 1 intentional skip).
- Docs: `docs/architecture/v0.7-p8-bridge-gradient-audit.md` (Phase 3) + `docs/architecture/bridge-gradient-tutorial.md` (Phase 4).

### PC-1.5 closure — BE-37 Shapiro residual at FP floor (3-release carry-forward resolved)

- Investigation completed via step-count sweep at HEAD. BE-37 Shapiro relErr at default 2048 GL4 steps is **~2.3e-8** — 4 orders of magnitude tighter than the carry-forward 2.51e-4 number. Sweep at 2048/4096/8192 is non-monotone (2.28e-8 → 5.02e-8 → 2.28e-8), the canonical signature of having hit the FP arithmetic floor rather than integrator truncation. If it were truncation-bound, doubling steps would reduce relErr by ~16× (GL4 is 4th-order). It does not.
- Root cause of the silent fix: v0.6.0's **BR-2 BREAKING refactor** (commit `5c786cc`) migrated `christoffelFn` from nested `number[4][4][4]` to flat `Float64Array(64)` for the 5–6× RK4 speedup. The numerical-stability side effect (fewer intermediate allocations = fewer cumulative round-off injection chances) was never re-measured end-to-end. v0.6.0 PC-1.5 status note said "integrator cleared as suspect" but did not report the residual; v0.6.1/v0.7 release notes inherited the stale 2.51e-4 number unverified.
- Smoke gate: `tests/numerical/be37-shapiro-step-sweep.test.ts` asserts relErr stays in `[1e-10, 1e-6]` band at default steps (catches both improvement and regression). Long-run sweep (`GL4_LONG=1`) reproduces the three step-count numbers for future regression checks.
- Findings doc: `docs/architecture/v0.7-pc15-shapiro-floor.md`.
- Suite: +1 net test (smoke gate; long-run sweep skipped by default).

### v0.8+ Proposal 6 Phase A — Bridge Composition Research Track (docs-only)

- **`docs/specification/Part-IX-Composition.md`** — Phase A research spec (avoiding the existing Part-VII/VIII numbering per Eve-E2). Defines composition operationally: numerical-cascade primary, categorical secondary. Names C1-C5 calibration set with BE-ID citations verified against `src/bridges/index.ts`.
- **`docs/planning/v0.7-Proposal-6-PhaseA-Open-Questions.md`** — five questions Phase B must answer (Q1 composition surface, Q2 tolerance, Q3 flux-rule interaction, Q4 identity morphism, Q5 v1.0 escalation).
- **`docs/planning/v0.7-Proposal-6-PhaseA-Review-Findings.md`** — Adam+Eve reconciliation. Per Adam-F2, the optional `src/composition/` prototype is SKIPPED in Phase A — existing bridge evaluators return ad-hoc TS interfaces with no shared `Observable` contract; the translation-layer design IS Phase B's deliverable.
- Suite: unchanged (docs-only).

### v0.7-p3 — Typed `Cell` discriminated union (`src/core/cell.ts`)

- **`Cell` union** = `LawCell | BridgeCell | EmergenceCell`. Storage-layer surface for `UniversalTensor.addCell(cell)`. Per Eve-R2 / Eve-R3 reconciliation, `confidence` is a string-literal union (`'established' | 'speculative' | 'highly-speculative'`) on the cell variants, NOT a number — the legacy `PhysicalLaw.confidence: number` stays as-is on the legacy interface to preserve catalog-vs-cell autonomy.
- **`compose(laws, bridges, emergences, config)` factory** — disjoint-union construction; consumers build a populated `UniversalTensor` from three typed arrays in one call.
- Public exports added: `Cell`, `CellBase`, `CellConfidence`, `LawCell`, `BridgeCell`, `EmergenceCell` (6 types) + `compose` (1 function) = **7 new public symbols**.
- `UniversalTensor.addCell(cell)` accepts the discriminated union with `_exhaustive: never` default arm.

### v0.7-p2 — Sparse semantic catalog + flux rules

- **`src/core/flux-rules.ts`** — 3-rule registry with `_exhaustive: never` dispatch over `FluxRuleKind = 'dimensional-consistency' | 'lbe-coordinate' | 'causality'`. Rule 2 (L/B/E coordinate matching) is ERROR-tier — throws `FluxViolationError` from `addCell` with fail-atomic rollback. Rule 3 (Causality) is WARNING-tier in v0.7 — emits diagnostic but does not throw; classifies bridges as forward/lateral/reverse via the `SCALE_ORDER` partial-order on `PhysicalScale`. Rule 1 (Dimensional Consistency) fires from the catalog adapter, NOT `addCell` (Decision #3 resolves Adam-V3: `Cell` variants don't carry `dimensional_signature`).
- **`UniversalTensor` integration** — 4 new methods:
  - `populatedCount()` returns unique-coordinate count (fan-out included per Decision #6).
  - `populatedCells()` returns deduped `ReadonlyArray<Cell>` via new inverse adapters `lawToCell` / `bridgeToCell` / `emergenceToCell`.
  - `unpopulatedNeighborhoods()` enumerates single-axis-flip neighbors per Decision #10; integer axes (`dimension`, `topology`) are wildcards.
  - `fluxDiagnostics()` re-runs the rule set across all populated cells; idempotent (no mutable `pendingDiagnostics` field — Eve-R8 resolution).
- **`src/bridges/catalog-adapter.ts`** — `catalogToCells(entries)` pure mapper + `scanCatalog(entries)` best-effort variant + `ingestCatalog(tensor, entries)` strict two-pass (Decision #11). Live BRIDGE_EQUATIONS catalog passes through with **5 submittable / 37 unsubmitted** (entries whose freeform `bridges:` axis labels don't map to the strict `PhysicalScale` union — `microscale`, `emergent`, `information`, `physical`, `consciousness`, `gravity`, `dark-sector`, `condensed-matter`, `holography`, `field-A/B`, `Newtonian gravity`, `general relativity`). Future v0.8 RegimeType (Proposal 5) widens the mappable set.
- **Empirical finding (Eve-R1 lesson held):** structural `dimensional_signature: null` count at HEAD = 0. The whole proposals-doc-attached claim of "1 null in BE-15" was prose inside `notes:`, not a structural field. Rule 1's ERROR-tier configuration is empirically safe at HEAD.
- Public exports added: `FluxDiagnostic`, `FluxReport`, `CatalogEntryStatus`, `CatalogIngestionReport` (4 types) + `FluxViolationError`, `catalogToCells`, `scanCatalog`, `ingestCatalog`, `ingestionReportToFluxReport`, `CatalogIngestionError` (6 values) = **10 new public symbols**. Kept `@internal`: `FluxRule`, `FluxRuleKind`, `FluxRuleResult`.

### v0.7-p1 — Intelligent Index Layer

- **`src/core/universal-index.ts`** — `UniversalIndex<Axis extends AxisName>` with branded `UniversalIndexId` (UUID via `crypto.randomUUID()`). Per Eve verification (proposals doc has zero `prime` / `arrow` mentions), v0.7.0 ships only the §2.2 sketch fields: `id`, `axis`, `name`, `tags?`, `limits?`, `notes?`. `prime`/`arrow` (ITensor parity) explicitly deferred to v0.8.0+.
- **`src/core/axes-registry.ts`** — `Axes` module singleton, 18 frozen `UniversalIndex` references at module load (4 scales + 5 forces + 5 symmetries + 4 information measures, per Phase 0 census). Same object across all import sites; `Object.freeze` outer + inner.
- **`src/core/labeled-tensor.ts`** — wrapper class composing `EngineTensor` + `TensorEngine` + labels record. `contract(other)` matches strictly by `UniversalIndexId` equality (Decision #3); two indices with same axis/name but distinct ids do NOT contract. Per Decision #1 (adapter-on-top), `TensorSymbolNode` and `computeContraction` remain UNCHANGED — verified at HEAD via diff-grep. 4 error classes: `LabeledTensorConstructionError`, `AxisMismatchError`, `IdentityConflictError`, `RankPreservationError`.
- **`src/bridges/perihelion-precession-labeled.ts`** — Phase 4 single-bridge demo. Additive `evaluatePerihelionPrecessionLabeled(inputs, engine)` entry point wraps the three perihelion-advance quantities in a rank-1 `LabeledTensor` tagged with `Axes.scale.classical`. Original `evaluatePerihelionPrecession` evaluator untouched (Cross-Phase Invariant 4 preserved).
- **`docs/architecture/intelligent-index-tutorial.md`** — five-minute walkthrough.
- Public exports added: `AxisName`, `UniversalIndex`, `UniversalIndexId`, `MakeIndexOptions`, `AxesRegistry` (5 types) + `makeIndex`, `Axes`, `LabeledTensor`, plus 4 error classes (7 values) = **12 new public symbols**.

### Adversarial review notes (v0.7 session)

- **P3**: design + plan reviewed by Adam (Gemini 2.5 Pro proxy via Opus subagent) + Eve (OpenAI o3 proxy via Opus subagent). All findings reconciled before TDD.
- **P2**: design caught 17 findings across two passes (Adam-V1..V11 + Eve-R1..R19); 3 SHOWSTOPPER-class issues (Adam-V2 compile-blocking, Eve-R1 empirical, Eve-R7 storage-design contradiction) forced a complete redraft of the design before TDD opened. Redraft Adam+Eve pass: 0 HIGH findings, READY verdict.
- **P1**: design Adam+Eve pass during Phase 0 — Adam 0 HIGH / 1 MEDIUM / 3 LOW (Risk 4 falsified at HEAD: `src/numerical/mathts-engine.ts:71-74` shows `einsum(spec, ...)` forwards directly — engine-agnostic claim is empirically dissolved). Eve 1 HIGH (Phase 0 Task 0.4 type-only header doesn't compile as non-abstract class — RESOLVED by dropping the task, Phase 1 writes actual implementation directly) / 2 MEDIUM (Symmetry=5 not 4+placeholder; public-API undercount) / 2 LOW.

### Cross-Phase Invariants verified at HEAD

- `TensorSymbolNode` and `computeContraction` UNCHANGED (P1 invariant 4 + 5) — `git diff` against the v0.7-p1 baseline commit (`090a3ae`) shows zero edits under `src/dimensional/`, `src/numerical/lowering*`, or `src/bridges/equations/`.
- `TensorEngine` interface UNCHANGED across all three proposals.
- v0.6.1 minimize discipline acknowledged: P2 + P1 net-add 22 public symbols; each carries `@public` JSDoc per Decision #10.

### Suite + build

- **Build clean** (tsc strict) at every commit.
- **Suite: 1675 (P3 start) → 1813 passed (+138 net new)**, 0 failed, 1 skipped, 1 todo across 186 test files + 2 skipped (`mathts-engine` optional-dep gated).
- **Pre-tag steps EXECUTED 2026-05-25** (the original session deferred these; ship session completed them):
  - `npm audit` — 0 vulnerabilities.
  - `npm outdated` — 2 deferred majors (`@types/node` 25.x, `typescript` 6.x; both devDeps). Documented for a future dep-bump release.
  - Version bump `0.6.0 → 0.7.0` in `package.json` (commit `dc800c2`).
  - Tag `v0.7.0` + push to origin (commit `dc800c2`).
  - `npm publish --ignore-scripts --access public` — succeeded; tarball 471 files / 563.9 KB / 2.1 MB unpacked. Registry: `0.5.1 → 0.7.0`.
  - GitHub release published at <https://github.com/danielsimonjr/universal-physics-tensor/releases/tag/v0.7.0> using the Option 1 body from `docs/architecture/v0.7-release-notes-draft.md`.

### Fixed at release gate (2026-05-25)

- **Windows backslash bug in v0.7.1 public-surface guard** (`tests/api/public-tag-vs-index-invariant.test.ts:318`, commit `c8ebdb1`). `node:path` `relative()` returns OS-native separators; the test's `^src\/` regex didn't match Windows backslash paths, falsely flagging `MathTSEngine` as unreachable from the public surface even though it is reachable via the `./numerical/mathts-engine` subpath export. Cross-platform failure mode: test would pass on Linux/macOS, fail on Windows — slipped past the original v0.7.1 sprint because that sprint's full-suite gate was run on a non-Windows env. Caught at the v0.7.0 release-gate run on Windows. One-line fix: normalize backslashes to forward slashes during path derivation. **Lesson**: release gates should be platform-matrix'd, not single-platform.
- **Stale `dist/` directory bypassed by `--ignore-scripts` publish workflow** (release prep, not a code commit). The Windows `--ignore-scripts` workaround for `prepublishOnly` (skipping the vitest cold-start tax) also silently skips the `tsc` build, so a stale `dist/` from an old build would ship verbatim. Caught at release prep: `dist/` contained 12 files / 67 KB of v0.1.0-era output while source had grown to bridges/dimensional/numerical/diff subsystems. Fix: explicit `rm -rf dist/ && npm run build` before publish (468 files / 3.1 MB fresh build). Not a recurring fix yet — future-resilient pattern would be splitting `prepublishOnly` into `prepack` (fast tsc, runs even with `--ignore-scripts` alternatives) + `prepublishOnly` (slow vitest gate).

---

## [0.6.1 — subsumed into 0.7.0]

Target tag: **v0.6.1** — Minimize / Simplify / Optimize sprint on top of v0.6.0, plus the rolled-up post-v0.6.0-tag maintenance work (bridge physics audit, doc-integrity review, vendored tooling, BE-33 fix, C-9 fix, 4-phase doc refresh, v0.7+ proposals doc) that was waiting in `[Unreleased]` for a tag. Six sprint phases on branch `claude/changelog-todo-sync-9PdMg`, suite preserved at **1675 passed / 0 failed / 1 skipped / 1 todo** (recovered from a 1672/5-failed master-HEAD state via Phase 0 cleanup). No new public-API surface. 24 internal-only exports removed — none had external importers (verified via grep across `src/`, `tests/`, `bench/`, `examples/`, `tools/`), so no downstream consumer is affected.

### Added

- **`src/dimensional/validator-registry.ts`** (Phase 2) — extracted from `validator.ts`'s `infer()` switch. The 11 curvature/GR-object arms (riemann-tensor, ricci-tensor, einstein-tensor, bianchi-residual, killing-vector, conserved-charge, stress-energy, cosmological-constant, einstein-equation, weyl-tensor, kretschmann-scalar) dispatch through a discriminated-union registry keyed on a three-pattern tag: (A) single-arg validator with freeIndices propagation; (B) two-arg validator with riemann-child closure, propagate freeIndices; (C) single-arg validator, scalar result, skip merge. The discriminated union forces every future GR-object addition to declare its pattern at compile-time, blocking the v0.5.0 ricci-slot-bug shape (silent miscompute from a "follow the pattern" arm with the wrong free-index policy).
- **`src/numerical/curvature-lowering-helpers.ts`** — two new exports `lowerBianchiResidual` + `lowerWeylTensor` (Phase 2). Extracted from `lowering.ts`'s `lowerCurvature` switch arms; each arm previously ran ~40-85 LOC of input-resolution + FD-pipeline + result-wrap boilerplate, now reduced to a single type-narrowed dispatch in `lowering.ts`.
- **`src/numerical/mathts-tensor.ambient.d.ts`** (Phase 0) — ambient module declaration for the optional peer `@danielsimonjr/mathts-tensor`. Mirrors the v0.5.1 TS-4 precedent for `mathts-autograd.ambient.d.ts`. Closes the build-fails-without-peer gap caught at sprint baseline (`tsc` was failing at `src/numerical/engine-registry.ts:43` and `src/numerical/mathts-engine.ts:13` with TS2307 in environments without the sister-repo dep installed). Declares `Tensor` as a class with index-signature `any` members; real typing from `node_modules/@danielsimonjr/mathts-tensor` takes precedence when the peer IS installed.
- **`bench/gl4-picard-alloc.bench.ts`** (Phase 5, PO-1) — Mercury-perihelion `solveGL4Stage` allocation diagnostic. Baseline at HEAD: 2,742 hz / 0.365 ms mean (single stage), 27.3 hz / 36.6 ms mean (100-stage batch). Per-stage cost is steady-state (single×100 ratio ≈ 100×).
- **`bench/ricci-lowering.bench.ts`** (Phase 5, PO-2) — Schwarzschild-fixture Riemann → Ricci pipeline diagnostic. Baseline at HEAD: Riemann-only 2,303 hz / 0.434 ms; full pipeline (Riemann + Ricci contraction) 2,331 hz / 0.429 ms. **Finding**: the Ricci contraction is essentially free vs the FD-Riemann assembly (1.01× ratio).
- **`bench/pderiv-grid.bench.ts`** (Phase 5, PD-grid) — Schwarzschild 3×3 grid sweep across order=2 vs order=4 centered stencils. Baseline at HEAD: order=2 20,244 hz / 1.36 μs per derivative call; order=4 8,388 hz / 3.31 μs per call. **Ratio**: order=4 is 2.41× slower than order=2 — favorable tradeoff for the ~10⁴× truncation-error reduction on smooth inputs that motivated the v0.6.0 default-order flip.
- **`docs/architecture/v0.6.1-baseline.md`** (Phase 0) — per-symbol export classification table (24 drops + 15 test-only + 30 public + 10 already-`@public`-tagged-no-importer); suite-count + dep-health baseline at master-HEAD vs v0.6.0 tag; explicit design-correction note for Phase 3 (the `--include-tests` flag did the wrong thing — empirically verified).
- **`docs/planning/v0.6.1-Design.md`** + **`docs/planning/v0.6.1-Review-Findings.md`** — sprint design doc + Adam+Eve adversarial-review findings (3 critical issues caught and reconciled before plan-drafting).
- **`docs/architecture/benchmarks.md`** — new "v0.6.1 baselines (PO-1 / PO-2 / PD-grid)" subsection capturing the three bench files' numbers + interpretation.
- **6 `@public` JSDoc tags** added at the declaration sites for symbols already re-exported by `src/index.ts` but missing the explicit marker: `BridgeEquationStatus` (`src/bridges/index.ts`), `Symmetry` and `InformationMeasure` (`src/core/types.ts`), `scale` (`src/dimensional/tensor.ts`), `Vec4` (`src/numerical/einstein-equation.ts`), `KillingEquationOptions` (`src/numerical/killing.ts`).
- **42-bridge physics-correctness audit** (`docs/architecture/BRIDGE-PHYSICS-AUDIT.md`, commit `1c77a1e`). Two-model review (Gemini 2.5 Pro + OpenAI o3) of every entry in the `BRIDGE_EQUATIONS` catalog with per-verdict honesty vetting and a deeper literature-grounded pass on contested findings. Headline: **0 INVALID verdicts** — no bridge equation is wrong physics. Systemic weakness is framing/metadata (unknown↔unknown bridge fields, status mis-calibration, bridge-incoherence), not the equations. The original dimensional-signature findings were RETRACTED after inspecting encoding modules — the audit had judged `dimensional_signature` against `formula_latex` while it actually describes the (reduced) encoded AST; §1 documents the retraction and reframes as a `formula_latex`↔encoding transparency gap. Ships with raw data: 84 model responses, prompts, categorizations, deeper-check transcript, and `FIX-SPEC.md`.
- **v0.6.0 documentation-integrity review** (`docs/architecture/v0.6.0-doc-integrity-review.md` + per-batch detail in `docs/architecture/doc-review/batch-{A..H}-findings.md`, commit `4c4cfb6`). 8-batch parallel review by an opus+sonnet agent team governed by the `rlm` skill (partition ~60 docs, aggregate without context rot) and `honest-claude` skill (grep-verify every claim, cite file:line, mark UNVERIFIED not guess). 63 reconciled findings (7 CRITICAL, 33 HIGH, 20 MEDIUM, 3 LOW). Honest headline: the v0.6.0 release work did NOT introduce doc hallucinations — Batch A (the 6 v0.6.0-cycle docs) found 0 critical, 0 fabrications. The real problem was accumulated *staleness* in long-lived current-state docs not refreshed across v0.4.6→v0.6.0 (README 6 releases stale; 5 architecture docs at v0.4.0; spec said 40 bridges vs actual 42; all 3 sub-READMEs omitted v0.6.0 additions). Agent-error rate 1.4% (vs 55% Eve-vet baseline) — the grep-verify-or-mark-UNVERIFIED discipline held.
- **`docs/planning/UPT v0.70 - Proposals.md`** (commit `b67481b`, 2026-05-22; renamed to add the `.md` extension in a follow-up commit). Architectural reframe for v0.7+ grounded in the MathTS CHANGELOG (rather than the earlier draft which assumed MathTS internals). Eight proposals: (1) Intelligent Index layer, (2) Sparse semantic catalog, (3) Typed L+B+E discriminated union, (4) Bridge DSL on `compileExpr`, (5) `RegimeType` extension system, (6) Bridge composition research track, (7) Bridge-as-workbook authoring via `.mtsw`, (8) Bridge parameter AD via `DualTensor`/`TapedTensor`. Honest framing in §0/§12: MathTS is *peer-level* to UPT, not a backend layer; nearly all v0.7 work happens inside the UPT repo consuming what MathTS already ships. Total non-research engineering: 11-16 weeks. Notes/proposals only — no commitments.
- **Vendored developer tooling under `tools/`** (commit `384db01`): `create-dependency-graph` (one-dep dep-graph generator, retrofitted to UPT), `plan-doc-audit` (zero-dep stub-aware plan-checkbox auditor, defaults to `docs/planning/`), `chunking-for-files` (large-file splitter/merger), `compress-for-context` (context compressor). Adds `tools/README.md` index, `.gitignore` entries for `tools/**/node_modules` + `tools/**/dist`, and two npm scripts: `docs:deps` (regenerate dep graph) + `audit:plans` (scan plan docs for unchecked checkboxes). All tools typecheck clean; root `npm run build` unaffected (tsconfig `rootDir:src` excludes `tools/`).

### Changed

- **`tools/create-dependency-graph/create-dependency-graph.ts`** (Phase 3) — two semantic improvements to the reachability analysis:
    - `detectUnused(files, testFiles?, exportsReachable?)` now accepts an optional test-files array and unions their imports into the importedFiles / importedSymbols sets. Eliminates the ~40 false-positive "unused" reports for `src/bridges/equations/be-NN-*.ts` modules (they're imported by per-bridge encoding tests, not by `src/bridges/index.ts`). The pre-existing `--include-tests` flag previously triggered a separate test-coverage report but did NOT feed `detectUnused` — Phase 0 caught this empirically.
    - New `resolveExportsReachable(pkg)` helper reverse-maps `package.json` `exports` subpaths (e.g. `"./numerical/mathts-engine"`) to their source paths (`src/numerical/mathts-engine.ts`) and marks them implicitly reachable. Eliminates the `mathts-engine.ts` false-positive (declared in `exports` but never re-exported via `src/index.ts`).
- **`package.json`** `scripts.docs:deps` — now passes `--include-tests` by default so the Phase 3 reachability fix is active without remembering the flag.
- **`src/dimensional/validator.ts`** — 816 → 715 LOC (-101). The 11-arm curvature/GR-object dispatch consolidated into a single fall-through `case` that delegates to `validator-registry.ts`. Pure refactor — no behavioral change; existing `tests/dimensional/*` cover all 11 kinds.
- **`src/numerical/lowering.ts`** — 1015 → 903 LOC (-112). The `bianchi-residual` and `weyl-tensor` arms shrank from ~40 / ~85 LOC each to one-line type-narrowed dispatches.
- **`src/numerical/curvature-lowering-helpers.ts`** — 579 → 737 LOC (+158, absorbs the two extracted arm bodies + three tiny file-private utility helpers `_dimensionOf`, `_requireValue`, `_flattenNestedArray` that mirror their lowering.ts counterparts).
- **`docs/specification/Part-II.md`** BE-33 block (Phase 0) — added the "Corrected on 2026-05-20 (commit `394d164`, bridge physics audit)" marker the spec-vs-index test asserts must be present alongside the index's notes block; updated the mathematical-formulation image + alt-text to the corrected `−1/z` form.
- **`tests/dimensional/part-viii-spec-vs-impl.test.ts`** (Phase 0) — relaxed the stale `/^0\.5\./` package-version pin to `/^0\./` (TENSOR-RULE: v030-additive-semver-minor-bump intent is pre-1.0 additive-semver, not specifically the 0.5.x line).
- **`tests/bridges/be-33-reformulation.test.ts`** (Phase 0) — `formula_latex` assertion inverted to match the 2026-05-20 BE-33 correction: now asserts the `−1/z` form is present AND the `ν` symbol is absent (ν-independence regression guard).
- **`tests/numerical/engine-conformance.mathts.test.ts`** + **`tests/numerical/mathts-engine-typing.test.ts`** (Phase 0) — added `describe.skip-when-optional-dep-absent` gating consistent with the pattern at `tests/numerical/engine-conformance.test.ts:20`. Without the gating, missing the optional peer `@danielsimonjr/mathts-tensor` caused the test file itself to fail to load (0 tests counted), masking suite state.
- **`package-lock.json`** (Phase 0) — resynced from `version: 0.1.0` (stale) to `version: 0.6.0`; added the `optionalDependencies` entries that landed in `package.json` somewhere between v0.4.x and v0.6.0 but were never reflected in the lockfile. Unblocks `npm ci`.
- **`docs/architecture/DEPENDENCY_GRAPH.md`** + **`dependency-graph.{json,yaml}`** + **`unused-analysis.md`** + **`TEST_COVERAGE.md`** — regenerated at sprint-final HEAD reflecting Phase 1/2/3 changes. Unused-files count went 44 → 2 (both intentional ambient `.d.ts`); unused-exports count went 79 → 101 (higher-resolution analysis, see Internal section below).

### Removed (Internal-only)

24 symbols (no external importers anywhere — verified per-symbol in Phase 0) had their `export` keyword dropped. Bodies retained as file-local where internal callers exist; `FlatMatrix` deleted entirely (zero internal callers).

| File | Symbols dropped |
|---|---|
| `src/bridges/index.ts` | `BridgeTractabilityClass` |
| `src/dimensional/connection-validators.ts` | `CovariantDerivativeValidationResult`, `RiemannTensorValidationResult` |
| `src/dimensional/killing-validators.ts` | `KillingVectorValidationResult`, `ConservedChargeValidationResult` |
| `src/dimensional/stress-energy-validators.ts` | `StressEnergyValidationResult`, `CosmologicalConstantValidationResult` |
| `src/dimensional/weyl-validators.ts` | `WeylTensorValidationResult` |
| `src/dimensional/tensor.ts` | `TensorSymbolValidationResult`, `ContractionResult`, `TensorExprNode` |
| `src/dimensional/validator.ts` | Re-export of `TensorExprNode` removed (the union had no downstream consumer). |
| `src/numerical/curvature-lowering-helpers.ts` | `outerStep`, `riemannUpperAt`, `lowerFirstIndex`, `dRiemannLowerAt`, `FlatMatrix` (deleted), `DGammaTensor`, `GammaTensor` |
| `src/numerical/gl4-integrator.ts` | `StageSolveResult` |
| `src/numerical/lowering.ts` | `buildEinsumSpec` |
| `src/numerical/null-ray-integrator.ts` | `ODESystem` |
| `src/numerical/pderiv.ts` | `PderivOptions` |
| `src/numerical/tensor-engine.ts` | `EinsumFreeAxis` (the `isEinsumSpec` predicate is test-imported and stays exported) |
| `src/numerical/weyl-lowering.ts` | `WeylInputs` |

### Fixed

- **BE-33 Hertz-Millis finite-temperature correlation-length exponent corrected: `−ν/z` → `−1/z`** (commit `394d164`). The encoded scaling `ξ_quantum(T) ~ ξ₀(T/T₀)^(−ν/z)` conflated the two axes of quantum-critical scaling. At a quantum critical point the *temperature* dependence of the spatial correlation length is set by the dynamic exponent `z` alone — `ξ ~ T^(−1/z)` — because temperature fixes the thermal length `L_T ~ T^(−1/z)`; the correlation-length exponent `ν` governs the separate *T=0 tuning-parameter* divergence `ξ ~ |g−g_c|^(−ν)` and cancels out of the scaling function at the critical coupling. Confirmed by a literature check against the QCP-scaling reviews (`cond-mat/0503298` states `ξ ~ (T/Tc)^(−1/z)` explicitly; Hertz 1976; Millis 1993). Changed: the AST exponent pin (`−0.71` → `−1`), `evaluateHertzMillis` (now computes `−1/z`; the `nu` input is retained for API stability and is still validated, but no longer affects the result — a future breaking cleanup may remove it), `formula_latex`, the Millis-1993 reference annotation, and `tests/bridges/be-33-encoding.test.ts` (the universality-class-dependent bracket test replaced with a `z`-dependence test and a `ν`-independence regression guard). The dimensional-signature round-trip is unaffected (a dimensionless ratio raised to any exponent stays dimensionless). A second `known_issue` was added flagging that the entry's "Hertz-Millis / 3D Heisenberg, z=1, ν≈0.71" universality-class label is itself questionable — canonical *itinerant* Hertz-Millis sits above its upper critical dimension with mean-field exponents (z=2 AFM / z=3 FM). Source: bridge physics audit, `docs/architecture/BRIDGE-PHYSICS-AUDIT.md` §2/§4.
- **C-9 dep-graph generator bug** (in-tree fix via the vendored `tools/create-dependency-graph/`, commit `384db01`). Source-comment text inside multi-line `export { ... } from` blocks was leaking into re-export symbol rows of `DEPENDENCY_GRAPH.md`; added `stripBraceBlockComments` + `splitBraceSymbols` so comments are stripped while `type X` re-exports are preserved.
- **5 pre-existing master-HEAD test failures** that predate the sprint (Phase 0 cleanup, commit `0da412f`): two `mathts-engine` test files failing to LOAD due to missing optional peer + no skip-gating; stale `/^0\.5\./` package-version pin (TENSOR-RULE v030-additive-semver-minor-bump); BE-33 reformulation test asserting `ν/z` form after the 2026-05-20 fix removed it; missing "Corrected on 2026-05-20" marker in `docs/specification/Part-II.md`. Plus the lockfile resync. **Suite went 1672 / 5-failed → 1675 / 0-failed before any Phase 1+ work**.
- **Build broken without optional peer** (`tsc` TS2307 at `engine-registry.ts:43` + `mathts-engine.ts:13`) — closed by the new `mathts-tensor.ambient.d.ts`.

### Docs

- **Phase 1 — current-state corrections** (commit `da43627`): README/CHANGELOG/CLAUDE.md/bridges-README brought from "Current Version: v0.4.5" / "40 bridges" up to v0.6.0 / 42 bridges baseline.
- **Phase 2 — architecture-doc refresh** (commit `50aa5b1`): C-1..C-24 findings — `API.md`, `ARCHITECTURE.md`, `COMPONENTS.md`, `DATAFLOW.md`, `OVERVIEW.md`, `TEST_COVERAGE.md`, `benchmarks.md`, `unused-analysis.md` advanced from v0.4.0 stamps through v0.6.0 (curvature layer added, `CurvatureCompositeNode` factory documented as extracted, stale "do not extract" guidance removed).
- **Phase 3 — spec + sub-README staleness** (commit `fe6d51f`): D-1..D-8 (Part-II BE-37 rewritten Shapiro-delay; BE-36 GW170817 graviton-speed bound promoted to mathematical formulation; spec-scope notes on IDs 11–50 vs codebase-only IDs 51–52; Part-IV §12.2.1/14.1.3 reconciled; AST-grammar 21-kind union acknowledged), E-1..E-5 (Part-VII/VIII forward-pointer notes, dim-refactor deferral acknowledged, `RepeatedDummyLabelError` → `DuplicateIndexLabelError`, v0.3.0 module count, "revisited" pointer), F-3..F-8 (sub-READMEs: `src/bridges/README.md`, `src/dimensional/README.md`, `bench/README.md` all advanced through v0.6.0).
- **Phase 4 — historical banners + arithmetic + v0.6.0 cycle notes** (commit `b814a71`): G-1..G-4 (Tier-5 yes-ready bucket label 7→8; BE-37 SUPERSEDED banner; BE-40 re-bucketed R5→R2 in Bridge-Remediation-Plan; v0.4.0-Review-Findings showstoppers 5→6 with S5 Eve-only note), H-1..H-4 (refactor/minimize-targets counts, severity-row alignment, audit PD-delta correction), A-1..A-5 (pc-1.5 finding sections prefixed "Hypothesis (bench output pending):" — predictions not measurements; v0.6.0-Design/Plan post-cycle notes acknowledging GL4 + computeChristoffelTensor do NOT consume `christoffelFn` (BR-2 touched only the RK4 path); E-5 ν-major race not run, λ-major adopted directly; Task 4.4 count gate softened to actual 1693 baseline).
- **CLAUDE.md** (Phase 4) — removed the `.ruff_cache (stale)` mention (directory no longer exists); updated "Current release state" block to v0.6.1-prep posture. Bridge-status distribution (8 established / 31 speculative / 3 highly-speculative / 0 invalid) verified UNCHANGED at HEAD — no re-tally needed.

### Internal — sprint metadata

- **Phase architecture**: six phases in explicit order 0 → 3 → 1 → 2 → 5 → 4 (Phase 0 baseline + cleanup; Phase 3 tooling fix first so Phase 1 metric drop is cleanly attributable; Phase 4 doc refresh last so it reflects final state). 21 sprint commits.
- **LOC delta**: net source LOC reduction across `validator.ts` + `lowering.ts` is **-213 LOC**; `curvature-lowering-helpers.ts` absorbed +158 LOC; new `validator-registry.ts` is 174 LOC. **Net total: +119 LOC** for substantially better factor structure (the registry's discriminated union is the load-bearing piece — adding a new GR-object node-kind is now a compile-time decision).
- **Adam+Eve adversarial review** ran on the design doc per Decision #9, using the v0.5.1 carry-forward "Opus subagent fallback" pattern (no `llm-gemini`/`llm-openai` MCPs in this remote-execution environment). Three critical findings caught + reconciled before plan-drafting and before any code changed:
    - **S1 (HIGH)** — test-imported symbols were misclassified as "internal-only" in the original recon. Verified via grep: `EXPECTED_DIMENSION_BY_BRIDGE`, `GL4_C/A/B`, `riemannLowerAt`, `covariantDerivRiemannLowerAt` all test-imported. Dropping `export` would have broken the build. Fix: four-bucket policy with a new (a') bucket = "test-only importer, keep `export` + `@internal`".
    - **S2 (HIGH)** — the validator-registry pattern claim ("10 arms, identical pattern") was wrong. Actually **11 arms across 3 patterns**: three pass a riemann-child closure (ricci/einstein/bianchi), three are scalar and skip freeIndices merge (conserved-charge/cosmological-constant/kretschmann-scalar), five are standard. Same shape as the v0.5.0 ricci-slot bug. Fix: discriminated-union registry contract on `pattern: 'A' | 'B' | 'C'` with exhaustive typecheck.
    - **S3 (HIGH)** — Track-C premise was wrong. The BE-equation modules are NOT imported by `src/bridges/index.ts` (only referenced as prose inside `notes:` string-literals). The `--include-tests` flag existed but triggered a coverage report; it did NOT feed `detectUnused`. Fix: extended `detectUnused(files, testFiles?)` to consume test imports.

  Eve fabrication rate: **1/13** (E-R10 was a speculative claim about `tools/plan-doc-audit/` importing from `src/`; verified false). Much better than v0.5.1's 5/9 baseline. Adam verified-arithmetic errors caught (V1/V2/V6/V9/V10) all confirmed by file-counting. Full reconciliation: `docs/planning/v0.6.1-Review-Findings.md`.

- **Per-symbol export classification**: 79 unused exports at sprint baseline classified into four buckets — (a) UNUSED no `@public` → drop export (24 symbols); (a') test-only importer → keep export, no action (15 symbols, now naturally hidden after Phase 3); (b-orphan) `@public`-tagged with no current importer → no action (10 symbols, intentional surface); (b) re-exported by `src/index.ts` → add `@public` if missing (6 added, 15 already had it); plus 9 parser-misses inspected manually. Detail in `docs/architecture/v0.6.1-baseline.md`.

### Dependency health

- `npm audit`: **0 vulnerabilities** (unchanged from v0.6.0 release gate).
- `npm outdated`: dev-deps only — `@types/node` 24.12.2→24.12.4 (patch available) / 25.x (major available, deferred from v0.6.0); `vitest` 4.1.4→4.1.7 (patch, deferred from v0.6.0); `typescript` 5.9.3 → 6.0.3 (major, deferred from v0.6.0). No HIGH/CRITICAL findings; all deferred as non-blocking per v0.6.1's "hygiene only, no upgrades" scope.

### Metrics

| Measure | v0.6.0 tag | master HEAD pre-sprint | v0.6.1 sprint-final |
|---|---:|---:|---:|
| Tests passed | 1693 | 1672 | **1675** |
| Tests failed | 0 | 3 | **0** |
| Test files failing to load | 0 | 2 | **0** (gated when optional dep absent) |
| Tests skipped | 1 | 1 | **1** |
| Unused exports (dep-graph) | 79 | 79 | **101** ✱ |
| Unused files (dep-graph) | 44 | 44 | **2** ✱✱ |
| `src/numerical/lowering.ts` LOC | 1015 | 1015 | **903** |
| `src/dimensional/validator.ts` LOC | 816 | 816 | **715** |
| `npm audit` HIGH/CRITICAL | 0 | 0 | **0** |

✱ The export count went UP because Phase 3's `detectUnused` fix surfaced previously-file-unused BE-equation module internals (`*_LHS` constants, `validate*Dimensions` functions) for individual accounting. Higher-resolution measurement, not regression. The 24 Phase-1 drops dropped out cleanly.

✱✱ The 2 remaining "unused" files are `src/numerical/mathts-autograd.ambient.d.ts` + `src/numerical/mathts-tensor.ambient.d.ts` — both intentional ambient `.d.ts` files consumed globally by tsc rather than via explicit `import`.

### Still pending

- **v0.6.0 npm publish remains BLOCKED** on expired `NPM_TOKEN`. Registry still shows `0.5.1`; tag `v0.6.0` at `ac0cf06` and the upcoming `v0.6.1` will both publish cleanly once the token is rotated. User action — see `todo.md` Active queue.
- **v0.6.1 tag** — sprint is code-complete on branch `claude/changelog-todo-sync-9PdMg`; pending user action: bump `package.json` 0.6.0 → 0.6.1, commit + tag `v0.6.1` + merge to master + push.
- **GitHub release notes for v0.6.0 + v0.6.1** — to be drafted from this `[Unreleased]` block once npm publish lands (or independently).

## [0.6.0] — 2026-05-20

v0.6.0 is the "Einstein field equation closure + curvature classification + Shapiro investigation" release. 36 tasks across 4 phases. Phase 1 delivered the Killing-vector conserved-charge machinery (`KillingVectorNode`, `ConservedChargeNode`, `verifyKillingEquation`, `evaluateConservedCharge`) — the first structural encoding of a continuous symmetry and its Noether charge on the UPT tensor. Phase 2 closed the long-standing gap that BE-17's docstring documented as impossible: the Einstein field equation is now structurally encodable via `StressEnergyTensorNode`, `CosmologicalConstantNode`, `EinsteinFieldEquationNode`, and `validateEinsteinFieldEquation` / `evaluateEinsteinEquationResidual`, enabling matter-coupled G_μν = κ T_μν encoding alongside the vacuum case shipped in v0.5.0. Phase 3 completed the curvature-classification surface with `WeylTensorNode`, `KretschmannScalarNode`, `computeKretschmann`, and the `CurvatureCompositeNode<K,S>` factory extracted from the now-five-instance curvature pattern — the PD-6 trigger that had been deferred since v0.5.0 fired when Weyl arrived as the 5th curvature primitive. `CURVATURE_KIND_REGISTRY` provides introspection across all curvature node kinds. Phase 4 was release-prep: BR-2 `christoffelFn` flat-array refactor (BREAKING, 5-6× RK4 speedup), `pderivNumericalFn` default order flip 2→4 (FD-flip), JSDoc backfill, bridge re-encoding audit, and PC-1.5 Shapiro investigation closure.

### Added

- `KillingVectorNode` AST kind + `ConservedChargeNode` AST kind — first structural encoding of continuous symmetries and their Noether charges on the UPT tensor. `evaluateConservedCharge` numerical evaluator. `verifyKillingEquation` checks the Killing equation `∇_μ ξ_ν + ∇_ν ξ_μ = 0` numerically.
- `StressEnergyTensorNode`, `CosmologicalConstantNode`, `EinsteinFieldEquationNode` — closes the structural-encoding gap documented in BE-17's docstring ("cannot be encoded"). `validateEinsteinFieldEquation` and `evaluateEinsteinEquationResidual` for matter-coupled and vacuum cases.
- `WeylTensorNode` + `KretschmannScalarNode` + `computeKretschmann` — completes the curvature-classification surface (Riemann → Ricci → Einstein → Bianchi → Weyl/Kretschmann).
- `CurvatureCompositeNode<K,S>` factory + `CURVATURE_KIND_REGISTRY` — extracted from the five-instance curvature pattern; PD-6 extraction trigger fired on Weyl as 5th curvature primitive.
- `christoffelFnFlat` — `Float64Array(64)` flat variant (λ-major `16λ+4μ+ν` encoding) for callers that want maximum allocation efficiency without the BR-2 breaking change on the legacy nested-array path (both surfaces exported during transition).
- New fixtures: Schwarzschild Killing vectors (t-translation + φ-rotation conservation), perfect-fluid stress-energy, de Sitter cosmological-constant, FLRW.
- PC-1.5 investigation finding document: `docs/architecture/pc-1.5-shapiro-residual-floor.md`.

### Changed (BREAKING)

- **`christoffelFn` / `schwarzschildChristoffelFn` now return `Float64Array(64)` (λ-major `16λ+4μ+ν` encoding) instead of nested `number[4][4][4]`.** BR-2 carry-forward from v0.5.1. Verified bit-identical on all existing bridge and fixture tests; RK4/GL4 integrator measured **5-6× faster** (eliminates ~160k nested-array allocations per 10k-step geodesic call). Callers that indexed into `christoffel[λ][μ][ν]` must migrate to `christoffel[16*λ + 4*μ + ν]`.
- **`pderivNumericalFn` default `order` flipped `2 → 4`** (FD-flip). The 4th-order centered stencil `(−f(x+2h)+8f(x+h)−8f(x−h)+f(x−2h))/(12h)` is now the default; callers that relied on `order: 2` behavior must pass `{ order: 2 }` explicitly. Motivation: the c²·g_tt ≈ 6e16 scale on SI Schwarzschild metrics causes catastrophic cancellation at 2nd-order; every new curvature consumer is safer with 4th-order as the default. Truncation error ~10⁴× lower on smooth inputs.

### Honest framing

- **PC-1.5 investigation (Decision #8: measure-and-document, not measure-and-fix)**: Phase 1 established via bit-exact Killing-charge conservation that the BE-37 Shapiro residual (2.51e-4) is NOT integrator-drift-driven — conserved charges are bit-stable across 10k-step geodesic runs. Remaining suspects are null-IC reconstruction noise (sqrt + sign-choice ~5e-15 absolute accumulating over 1500s coord-time) and affine-parameter mismatch between geodesic and closed-form evaluator conventions. The integrator was cleared as a suspect. See `docs/architecture/pc-1.5-shapiro-residual-floor.md`. Full remediation (null-IC noise sweep + affine-parameter axis) deferred per Decision #8.
- **Bridge re-encoding (Task 4.3)**: Only BE-20 had a genuine v0.6.0 re-encoding (`CosmologicalConstantNode`). BE-13, BE-17, BE-19, BE-39, and BE-50 were assessed and honestly NOT re-encoded — no applicable new primitive maps to their encoded forms. BE-17's "cannot be encoded" docstring claim was corrected (the claim was false post-v0.6.0). Per Decision #9, NO bridge status pins were promoted from `speculative` → `established`: structural encoding is necessary but not sufficient for a status upgrade; observational/experimental grounding must be established independently.

### Adam+Eve adversarial review

- Design vet: 12 findings reconciled, 1 Eve hallucination rejected (Weyl tensor prefactor — Eve fabricated a specific literature value with high confidence; grep-verification found no such source). See `docs/planning/v0.6.0-Review-Findings.md`.
- Plan vet: 13 findings reconciled, 2 Eve hallucinations rejected. See `docs/planning/v0.6.0-Plan-Review-Findings.md`.

### Dependency health

- `npm audit`: **0 vulnerabilities**.
- `npm outdated`: dev-deps only — `@types/node` 24.12.2→24.12.4 (patch available) / 25.x (major available, deferred); `vitest` 4.1.4→4.1.7 (patch, deferred); `typescript` 5.9.3 / 6.x major available (deferred). No HIGH/CRITICAL findings; all deferred as non-blocking.

Suite: 1595 (v0.5.1) → **1693 passed** (+98 net new tests counting the pre-existing-fix delta), 179 files, 1 skip + 1 todo (both pre-existing).

## [0.5.1] — 2026-05-19

Stability / hygiene patch on top of v0.5.0's GR foundations release. Constants canonicalization (new `src/core/constants.ts` flat exports — `PhysicalConstants` namespace retained for backwards-compat); diagnostic-warning propagation through the curvature pipeline (`scanForMetricPair` now walks v0.5.0 curvature node kinds); backfilled test coverage on heaviest v0.5.0 additions (connection-validators ~250 LOC per-throw, fresh-label, flat-Minkowski curvature zero-tests, real Mercury N-orbit Picard convergence); type-safety hardening on `bianchiResidual` public surface (6× `any` → `import type`); algorithmic dedup (contractRiemannJS helper extracted from Ricci/Einstein arms; makeSchwarzschildContext helper extracted from 5 fixture closures); `pderiv.ts` opt-in 4th-order centered stencil; 7 zombie `it.todo` markers retired; 5 doc-vs-code skews fixed (LC-1 RicciTensorNode JSDoc per Carroll Eq. 3.91, LC-3 engine-registry version literal, LC-4 connection-validators Part-IX qualifier, LC-7 einstein() JSDoc, LC-8 null-ray-integrator module description); v0.5.0 plan annotated with post-S1 Ricci-slot addendum.

**Honest framing**: PC-1 hypothesis (audit prediction that `c_SI` drift dominates BE-37 Shapiro residual) was empirically **REFUTED** — residual stayed at 2.51e-4 after both BE-37 and fixture migrations; the actual residual floor is integrator-driven (GL4 step count or null-IC reconstruction). Constants canonicalization is still net-positive hygiene (single source of truth) but does NOT improve numerical results as predicted. Investigation deferred to v0.5.2 / v0.6.0 ("PC-1.5" — see `docs/planning/v0.6.0-Brainstorm.md`).

**Adam+Eve adversarial vetting** was performed on the audit phase only (`docs/architecture/v0.5.1-audit.md` reconciliation section); Adam=Gemini 2.5 Pro caught 5 net-new findings + 1 severity bump; Eve=OpenAI o3 fabricated 5/9 challenges (memory: `feedback_eve_o3_hallucinations.md`). Design and plan adversarial vets pending MCP availability — will land as follow-up commits.

**BR-2 deferred** to v0.6.0 (christoffelFn nested-array → Float64Array(64), breaking).

### Detailed change list

### Added
- `GL4Options.onStep` — opt-in per-step diagnostics callback receiving
  `{step, iterations, halvings}`. Fires once per successful integrator
  step; lets gated long-run tests (and external tooling) measure Picard
  convergence statistics without changing the integrator's primary
  return shape. Used by the new gated `GL4_LONG=1` Mercury N-orbit
  Picard-convergence test in `tests/numerical/gl4-integrator.test.ts`,
  which replaces the v0.5.0 `expect(true).toBe(true)` stub with a real
  IC computation (vis-viva L + Legendre-transform E at perihelion) and
  asserts `failureFraction = steps_with_halving / steps < 0.001`.
  Default orbit count: 20 (~1M steps, ~6 min wall clock); release-prep
  100-orbit run via `GL4_LONG_ORBITS=100 GL4_LONG=1`. Gated path not
  exercised in commit (default `it.skip`); release-prep gates this for
  manual run. PD-4.
- `tests/dimensional/minkowski-curvature.test.ts` — flat-spacetime
  zero-tests on the entire v0.5.0 curvature pipeline (5 tests). All
  curvature objects (R^ρ_{σμν}, R_μν, G_μν, R-scalar, Bianchi residual
  max) must be identically zero (≤1e-12 machine-precision) on a flat
  Minkowski metric. Adam's miss-case finding — every prior curvature test
  lives on a curved fixture where FD truncation hides convention bugs.
  Uses a new unitless (c=1) Minkowski variant in
  `tests/fixtures/minkowski.ts` (rescaling-invariance same precedent as
  `unitlessSchwarzschildGFn` in the Bianchi-residual test; SI variant
  also exported for non-curvature consumers) (NEW-1).
- Unit coverage for `freshLabel` (Part-VIII §VIII.5 TENSOR-RULE
  raise-lower-fresh-label-deterministic). 6 new tests in
  `tests/dimensional/fresh-label.test.ts` pinning: always-suffixed
  `<base>_1`, increment-on-collision, determinism, unicode base,
  high-counter gap skip-down (UC-2).
- Per-function unit coverage on `src/dimensional/connection-validators.ts`
  (~250 LOC, heaviest v0.5.0 critical-path validator). 11 new tests in
  `tests/dimensional/connection-validators.test.ts` covering every
  `validateCovariantDerivative` + `validateRiemannTensor` throw path plus
  happy path (UC-1).
- `pderivNumericalFn` now accepts a `PderivOptions` parameter with
  `order?: 2 | 4` (default `2`, opt-in `4`) and `h?: number` explicit step
  override. `order: 4` activates the 4-point centered stencil
  `(−f(x+2h) + 8 f(x+h) − 8 f(x−h) + f(x−2h)) / (12 h)` with adaptive step
  `h = 1e-4·max(|x|,1)` (the regime where the O(h⁴) truncation advantage
  materialises vs round-off on smooth inputs). `order: 2` preserves the
  v0.3.5 default `h = 1e-6·max(|x|,1)` for backwards compat. The `h`
  override is load-bearing for `curvature-lowering-helpers.ts`'s inner ∂g
  sampler (1e-3 step to balance c²·g_tt cancellation noise). PD-7.

### Removed
- 7 zombie `it.todo` markers referencing shipped milestones (PD-9 / UC-5 /
  AS-5): two `v0.4.0` Christoffel/covariant-derivative todos from
  `covariant-derivative-preview.test.ts` (both shipped in v0.4.0); three
  `v0.3.0–v0.3.5` storage-order / dimension-uniformity / pderiv-preview
  todos from `tensor-symbol.test.ts` (all shipped); and the entire
  `inverse-metric-consistency.test.ts` file (two v0.3.5 todos — the
  `InverseMetricInconsistencyWarning` they referenced ships in
  `src/dimensional/validator.ts` `scanForMetricPair` and is actively
  tested in `tests/numerical/metric-inverse{,-curvature-walk}.test.ts`).
  The legitimate `it.todo` at `tests/bridges/catalog-integrity.test.ts:137`
  (BE-42 Hawking-temperature, no geodesic content yet) is preserved.

### Changed
- `docs/planning/v0.6.0-Brainstorm.md` — seeded v0.6.0 brainstorm doc
  capturing v0.5.1 carry-forward items: BR-2 `christoffelFn`
  flat-`Float64Array(64)` return shape (breaking; 2–3× RK4/GL4 speedup),
  PD-6 curvature-layer extraction triggers (Weyl/Kretschmann/Bianchi-2nd-
  form/Riemann–Cartan torsion piece), deferred performance items
  PO-2/PO-3, NEW-3 JSDoc polish, and the v0.5.1 empirical finding that
  the PC-1 hypothesis was **REFUTED** — BE-37 Shapiro residual stayed
  at 2.51e-4 post-constants-migration, identifying integrator-driven
  causes (GL4 step count, null-IC reconstruction) as the new
  PC-1.5 investigation target for v0.5.2 or v0.6.0. BR-2.
- `tests/dimensional/duplicate-coord-warning.test.ts` and
  `tests/dimensional/covariant-derivative-node.test.ts` — the
  `UPT_ALLOW_COORD_SHADOW=1` paths previously installed a forwarding
  `process.emitWarning` wrapper that captured `DuplicateCoordinateWarning`
  AND forwarded to the original emitter, surfacing the (intentional)
  warning to stderr during the test run. Migrated to
  `vi.spyOn(process, 'emitWarning').mockImplementation(() => {})` so the
  spy captures call args for assertions but the warning does not surface
  to stderr. Behavior under test unchanged; suite stderr cleaner. PD-8.
- `src/numerical/gl4-integrator.ts` — `GL4_C`, `GL4_A`, `GL4_B`
  Butcher-tableau constants retagged from `@public` to `@internal` in
  their JSDoc. They remain `export`s (test files import them to pin
  invariants), but the JSDoc taxonomy now correctly reflects that they
  are test-only knobs — public callers should use `integrateGeodesicGL4`.
  `solveGL4Stage` and `StageSolveResult` were already `@internal` per
  v0.5.0. UC-3.
- `CLAUDE.md` Repo invariants — added release pre-flight checklist:
  run `npm audit` and `npm outdated` before `npm publish`; address any
  HIGH/CRITICAL audit findings before tagging; document the dep-health
  snapshot in CHANGELOG. v0.5.1 snapshot (this release): `npm audit` =
  **0 vulnerabilities**; `npm outdated` = 4 entries — `@types/node`
  24.12.2 → 25.9.0 (major, dev only), `typescript` 5.9.3 → 6.0.3 (major,
  dev only), `vitest` 4.1.4 → 4.1.6 (patch), `@danielsimonjr/mathts-autograd`
  MISSING / 0.1.0 (optional peer, expected; auto-install gated). No
  HIGH/CRITICAL action required. NEW-5.
- `docs/architecture/COMPONENTS.md` — added "Curvature layer pattern
  (v0.5.0)" section documenting the four-instance composite-AST pattern
  (Riemann/Ricci/Einstein/Bianchi), the proposed
  `CurvatureCompositeNode<K, S>` extraction shape, and the explicit
  extraction trigger (5th curvature primitive — Weyl tensor, Kretschmann
  scalar, Bianchi-2nd-form, or Riemann–Cartan torsion piece). Premature
  abstraction risk dominates marginal LOC savings while v0.5.0's
  curvature surface is the only consumer (PD-6).
- `tests/fixtures/schwarzschild.ts` — extracted module-private
  `makeSchwarzschildContext(M_kg, x)` helper consumed by all five fixture
  closures (`schwarzschildChristoffelFn`, `schwarzschildGFn`,
  `schwarzschildGInverseFn`, `schwarzschildDgInverseFn`,
  `schwarzschildRiemannFn`). Pre-evaluates `r_s = 2GM/c²`, `r`, `θ`,
  `sinθ`, `cosθ`, `sin²θ`, `f = 1 − r_s/r` once per call. Eliminates the
  six-line opening boilerplate duplicated across the five closures
  (~30 LOC). Fixture public API unchanged; all 10 fixture-consumer test
  files remain green at v0.5.0 tolerances. AS-2.
- `src/numerical/lowering.ts` ricci-tensor arm: the hand-rolled
  4-axis-flat → 2-axis JS contraction is now delegated to a new
  `contractRiemannJS(flatR, N, {upperAxis, lowerAxis, outAxes})` helper
  in `src/numerical/curvature-lowering-helpers.ts`. The Einstein arm
  benefits transitively (it lowers its inner Ricci through the same
  case). Tolerances unchanged: Schwarzschild vacuum Ricci ≤5e-9 normalized
  per component; de Sitter R-scalar identity to ≤1e-14; Einstein
  G_μν + Λ g_μν ≤1e-10 relErr; trace identity g^μν G_μν = −R to
  ≤1e-14; Bianchi residual vacuum ≤1e-6. AS-1.
- `src/numerical/curvature-lowering-helpers.ts` migrated: the three
  hand-coded 4th-order stencils (`makeInnerGradFn`, `dGammaAt` outer FD,
  `dRiemannLowerAt` outer FD) now delegate to the shared
  `pderivNumericalFn(..., {order: 4})` rather than each rolling their own
  ±h, ±2h evaluation + flatten + `(−f₊₂ + 8 f₊₁ − 8 f₋₁ + f₋₂)/(12 h)`
  loop. Net effect: −44 LOC in the curvature helper, one canonical
  4th-order code path, identical numerical output. Riemann-lowering
  ≤1e-9 relErr gate verified post-migration on Schwarzschild
  (`tests/numerical/riemann-tensor-lowering.test.ts`). PD-7.

### Fixed
- `InverseMetricInconsistencyWarning` now fires for inconsistent metric pairs
  inside `covariant-derivative`, `riemann-tensor`, `ricci-tensor`,
  `einstein-tensor`, `bianchi-residual` AST nodes (PC-3). Previously silent on
  the entire v0.4.0+v0.5.0 GR pipeline — `scanForMetricPair` only walked the
  pre-curvature `op`/`tensor-product`/`integral`/`derivative`/
  `tensor-partial-derivative` arms, so every curvature node was a black box to
  the diagnostic. Adam's severity upgrade post-vet (MEDIUM → HIGH) flagged
  this as "a validation mechanism that doesn't run is worse than no validation
  at all." Future-extensibility comment added to the walker; v0.6.0+ curvature
  kinds need explicit arms. v0.5.1 Task 6.

### Refactored
- `tests/fixtures/schwarzschild.ts` migrated from local `G_SI = 6.6743e-11; c_SI = 2.998e8;`
  literals to `import { C_SI as c_SI, G_SI } from '../../src/core/constants.js';`.
  Three downstream test files (`tests/fixtures/schwarzschild.test.ts`,
  `tests/numerical/gl4-integrator.test.ts`,
  `tests/numerical/schwarzschild-radial-geodesic.test.ts`) also migrated:
  each held its OWN local `c = 2.998e8` literal driving the analytic
  cycloid / `r_s` baseline. When only the fixture canonicalized, the
  baselines drifted relative to the integrator's `r_s` and the cycloid
  relErr blew from ~8×10⁻¹⁶ to ~3.4×10⁻⁶ (escalation triggered per plan
  Step 4). Migrating these three consumers restored machine precision —
  empirical cycloid relErr post-canonicalization = **2.94×10⁻¹⁵** at 5000
  GL4 steps (well under the 1×10⁻¹³ gate). **Honest plan deviation**:
  Phase 1 Task 4 spec assumed fixture-only migration; the three consumer
  test files needed in-the-same-commit migration. Also restores
  `tests/bridges/perihelion-precession.test.ts` 1e-12 bridge-vs-local
  cross-check gate (was relaxed to 1e-4 in v0.5.1 Task 2's transitional
  window). **PC-1 second-leg discriminator**: BE-37 covariant-eikonal
  Shapiro relErr **= 2.51×10⁻⁴ post-Task-4 — identical to post-Task-1**.
  Task 1's hypothesis that the fixture's truncated c was the remaining
  dominant contributor is therefore ALSO refuted; the residual floor is
  GL4 step-count / null-IC reconstruction, not constants drift. v0.5.1
  Task 4.

### Changed
- `src/bridges/gravitational-lensing.ts` (BE-51) and `src/bridges/perihelion-precession.ts`
  (BE-52) migrated from local `const G_SI = 6.6743e-11; const c_SI = 2.998e8;`
  literals to `import { C_SI as c_SI, G_SI } from '../core/constants.js';`.
  Renamed via import alias (`C_SI as c_SI`) so the algebraic bodies (which
  use lower-case `c_SI` to match the formula notation) remain untouched.
  BE-52 Mercury one-orbit precession relErr **unchanged at 1.77×10⁻⁷**
  (v0.5.0 baseline) — Mercury isn't impact-parameter-grazing geometry where
  the c² drift matters most, as predicted. **Transitional window note**:
  `tests/bridges/perihelion-precession.test.ts` relaxes the bridge-vs-local
  cross-check from 1e-12 to 1e-4 because the test still uses the
  Schwarzschild fixture's truncated `c = 2.998e8` for GL4 internal
  consistency; Task 4 will canonicalize the fixture and restore 1e-12.
  v0.5.1 Task 2.

### Refactored
- `src/bridges/equations/be-37-shapiro-delay.ts` migrated to canonical
  constants from `src/core/constants.ts`. Replaces two local `c_SI = 299792458`
  literals (lines 305, 485) and two local `G_SI = 6.67430e-11` literals
  (lines 304, 484) with `import { C_SI, G_SI } from '../../core/constants.js'`.
  Migration is **cosmetic only** — values are bit-identical (the file
  already used the exact SI definition and CODATA 2018 value); this
  eliminates the duplication, not a value drift. Helper function
  `buildSchwarzschildEikonalInputs(r, G_SI, c_SI, M_kg)` retains its
  internal parameter names (shadowing is local-scope only). v0.5.1 Task 3.

### Fixed
- BE-37 covariant-eikonal Shapiro residual: `src/numerical/be37-covariant-eikonal.ts`
  migrated from truncated `c_SI = 2.998e8` / `G = 6.6743e-11` to canonical
  `C_SI = 299792458` (exact SI) / `G_SI = 6.67430e-11` (CODATA 2018) imports
  from `src/core/constants.ts`. Dropped the now-obsolete LC-5 "matches
  tests/fixtures/schwarzschild.ts" comment at the old line 38 (Task 5 folded
  in — both consumers now read from `src/core/constants.ts`). **PC-1 verdict
  — REFUTED, not confirmed.** Pre-migration empirical Shapiro relErr was
  `1.76×10⁻⁴` (v0.5.0 Task 11); post-migration relErr is `2.51×10⁻⁴` —
  essentially unchanged-or-worse. The PC-1 audit hypothesis that the
  truncated `c_SI` in this file dominated the residual is therefore wrong:
  canonicalizing the constant did NOT collapse the residual to <1e-5 as
  predicted. The dominant residual contributor lies elsewhere (most likely
  `tests/fixtures/schwarzschild.ts` still on `c_SI = 2.998e8` — addressed
  by Task 4; or a genuine GL4-step / null-IC reconstruction floor). The
  test still clears the ±2×10⁻³ gate. v0.5.1 Task 1.

### Added
- `src/core/constants.ts` flat CODATA 2018 + SI-defined physical-constants
  module. Exports `C_SI`, `G_SI`, `H_SI`, `HBAR_SI`, `K_B_SI`, `E_SI`,
  `ALPHA`, `M_P_SI`, `L_P_SI`, `T_P_SI`, `H0_SI` — single source of truth
  for the constants previously duplicated across `src/numerical/`,
  `src/bridges/`, and `tests/fixtures/`. Re-exported from `src/index.ts`.
  Addresses audit `PC-1` (constant drift between `2.998e8` truncated and
  `299792458` exact `c_SI` across 8 files). `PhysicalConstants` namespace
  in `src/core/types.ts` retained for backwards-compat. v0.5.1 Task 0.

## [0.5.0] — 2026-05-18

> GR foundations: GL4 symplectic integrator on canonical (x, p) state (Picard inner solver); bisection perihelion finder; curvature layer (RiemannTensorNode AST + ricci/einstein/bianchiResidual helpers); two v0.4.0 `it.skip` debts cleared (BE-52 Mercury Δφ to ±2×10⁻³ relative, BE-37 full Shapiro to ±2×10⁻³ relative); bridge validation sweep (BE-51/52 structural siblings; BE-17/20/45/46/50 physics anchors; catalog-integrity invariant). Adam+Eve adversarial review: 25 findings reconciled.

### Changed
- BE-20 ρ_Λ tolerance tightened from 2× wide to ±5% around Planck 2018 anchor (5.96e-27 kg/m³). v0.5.0 Task 16 (Phase 3d). Replaces the v0.4.x bracket assertion `5e-27 < ρ < 7e-27` (2× wide) with `|ρ − 5.96e-27| / 5.96e-27 < 0.05` against the Planck 2018 anchor (Aghanim et al. 2020 *A&A* 641:A6). Empirical ρ at default Λ=1.1e-52 m⁻² is ≈5.89e-27 kg/m³, within ~1.2% of the anchor — well within the ±5% gate. Audit recommendation #3. Honest framing: if a future refactor drifts outside ±5%, that is a new physics finding to escalate, NOT a threshold-softening target.

### Added
- Catalog-level integrity test (`tests/bridges/catalog-integrity.test.ts`). v0.5.0 Task 20 (Phase 3h, audit recommendation #5). Codifies three suite-level invariants in M1-quantitative form (no `expect(true).toBe(true)`): (1) `BRIDGE_EQUATIONS.length === 42` via the authoritative registry (not a filesystem scan — spec/index drift is separately pinned by `tests/bridges/spec-vs-index.test.ts`); (2) for each entry in `BRIDGE_EQUATIONS`, at least one `tests/bridges/be-NN-*.test.ts` exists (filename pattern, case-insensitive; all 42 bridges currently pass); (3) for each Schwarzschild-spacetime bridge in `[BE-37, BE-51, BE-52]`, at least one `tests/bridges/*.test.ts` both imports the evaluator and contains a literal `integrateGeodesic` or `integrateGeodesicGL4` call — locating Task 10's `tests/bridges/perihelion-precession.test.ts` (BE-52 GL4), Task 11/12's `tests/bridges/gravitational-lensing.test.ts` (BE-51 RK4), and `tests/bridges/be-37-numerical-eikonal.test.ts` (BE-37 indirectly via `evaluateBE37CovariantEikonalNumerical`, whose body invokes `integrateGeodesicGL4`). **Honest plan-deviation on BE-42**: the v0.5.0 Task 20 spec lists BE-42 as a fourth Schwarzschild-spacetime bridge, but the Wave Y 2026-05-07 reformulation replaced the original firewall-complement Hilbert-space ansatz with the canonical Hawking temperature scalar `T_H = ℏc³/(8πGMk_B)` — a closed-form thermodynamic scalar with no geodesic-integration content. The test records BE-42 as an `it.todo` with an inline comment block explaining the gap; promoting it to a real assertion would require either (a) restoring explicit horizon/affine-parameter dynamics to BE-42 or (b) a separate Hawking-radiation-spectrum cross-validation distinct from the geodesic-integrator path. 3 passing + 1 todo.
- BE-50 Cramer 1986 retrocausality anchor test (`tests/bridges/be-50-encoding.test.ts`). v0.5.0 Task 19 (Phase 3g). Validates the time-symmetric residual r_TS = (A_ret − A_adv)/(A_ret + A_adv) against (1) the canonical Wheeler-Feynman absorber-boundary identity r_TS ≡ 0 under A_ret = A_adv and (2) the linear-response Cramer 1986 *Rev. Mod. Phys.* 58:647 §VII experimental bound `|r_TS| < 10⁻²` on physical electromagnetic transactions. Linear-response identity (1 + δ, 1 − δ) → r_TS = δ verified to machine precision. Status 'highly-speculative' preserved (absorber boundary condition empirically untested in QFT). Audit recommendation #4.
- BE-46 Weinberg 1987 Λ_obs window probability anchor test (`tests/bridges/be-46-encoding.test.ts`). v0.5.0 Task 18 (Phase 3f). Validates the Weinberg-Vilenkin parameterization `P(Λ) = A · exp(−α/Λ)` at the canonical Weinberg 1987 prediction Λ_obs ~ α (observed cosmological constant within an order of magnitude of the anthropic upper bound set by galaxy formation, Weinberg 1987 *Phys. Rev. Lett.* 59:2607). Recovers P(α) = A · exp(−1) ≈ 0.368 — the order-of-1, non-exponentially-suppressed central success of the anthropic prediction. Tolerance ±10% around exp(−1); status 'highly-speculative' preserved (measure problem unsolved). Audit recommendation #4.
- BE-45 Bedroya-Vafa N_e < 137 Solar-System anchor test (`tests/bridges/be-45-encoding.test.ts`). v0.5.0 Task 17 (Phase 3e). Validates the canonical TCC bound `N_e_max = ln(M_P/H_inf)` evaluated at the present-epoch Hubble scale (H_0 ≈ 1.4e-42 GeV in natural units — the dynamical scale of Solar-System and larger structure today). Achieves N_e ≈ 140 (literature cites 137-140 depending on the low-energy cutoff convention; Bedroya & Vafa 2019 arXiv:1909.11063; Bedroya-Brandenberger-Loverde-Vafa 2020 *Phys. Rev. D* 101:103502). Tolerance: window [60, 145] for the full published range, plus tighter ±5 e-folds around 140 for the canonical anchor. Audit recommendation #4.
- BE-17 neutron-star torsion-density anchor test (`tests/bridges/be-17-encoding.test.ts`). v0.5.0 Task 15 (Phase 3c). Adds an `it('neutron-star spin-polarized torsion density anchor (Hehl 1976 framework)', ...)` that validates the SI-units path of `evaluateBE17SpinDensitySquared` against the textbook spin-polarized NS spin-density-squared scalar `|S|² ≈ 2.78e21 (kg/(m·s))²` (from `|S| = n · (ℏ/2) · f` with n ≈ 1e45 /m³ NS-interior neutron density, ℏ/2 = 5.27e-35 J·s, f = 1 fully polarized worst-case). Order-of-magnitude band ±2 OOM (factor 100) accounts for ~1 OOM EoS uncertainty in n and the upper-bound polarization assumption per Hehl-vonderHeyde-Kerlick-Nester 1976 §V. Round-trip is exact to 10 decimals since the evaluator is pure multiplication of two SI-dimensioned inputs. Closes audit recommendation #2.
- BE-52 structural sibling test (`tests/bridges/be-52-perihelion-precession-structural.test.ts`). v0.5.0 Task 14 (Phase 3b). Closes the audit gap (`docs/architecture/bridge-coverage-audit.md` line 69: BE-52 had NUMERICAL-only coverage). Mirrors Task 13's BE-51 structural-sibling discipline (registry-side `formula_latex` regex against the canonical 6πGM/(a(1−e²)c²) form, `dimensional_signature === '[1]'`, `status === 'established'`, category/bridges/tractability_class/references/notes invariants). **Same plan-deviation as Task 13**: BE-52 has no AST encoding (it lives in `src/bridges/perihelion-precession.ts`, not `src/bridges/equations/`), so the AST-kinds assertion is dropped and replaced with an algebraic-skeleton regex (6π·G·M numerator, a·(1−e²)·c² denominator). 10 tests, all green.
- BE-51 structural sibling test (`tests/bridges/be-51-gravitational-lensing-structural.test.ts`). v0.5.0 Task 13 (Phase 3a). Closes the audit gap (`docs/architecture/bridge-coverage-audit.md` line 68: BE-51 had NUMERICAL-only coverage). Mirrors the BE-37 structural-test discipline adapted for closed-form bridges without an AST encoding: pins `formula_latex` regex against the canonical 4GM/(bc²) form, `dimensional_signature === '[1]'`, `status === 'established'`, category/bridges/tractability_class/references/notes invariants. **Honest plan-deviation**: the plan template (line 1816) listed "tensor-product / metric-layer AST kinds present in the encoded form" as one of four assertions; BE-51 has no AST encoding (it lives in `src/bridges/gravitational-lensing.ts`, not `src/bridges/equations/`), so that assertion is dropped and replaced with a `formula_latex` algebraic-skeleton regex (4·G·M numerator, b·c² denominator). The other three assertions (regex, dim, status) apply directly. 10 tests, all green.

### Changed
- `evaluateBE37CovariantEikonalNumerical` now returns a real `shapiroDelaySec` via GL4 null-geodesic integration (was a documented stub returning 0 in v0.4.0). v0.5.0 Task 12 (Phase 2c). Sets up the null IC on the canonical (x, p) state at `(t=0, r=R_far, θ=π/2, φ=0)` with affine-parameter normalization `p_t = −c²` (so `dt/dτ ≈ 1` far from horizon, τ ≈ coord time), `p_φ = b_m · c` (Killing-vector conservation), and solves `p_r` from the null condition `g^μν p_μ p_ν = 0` at the initial point (negative root for inward motion). Integrates via `integrateGeodesicGL4` with 2048 default steps and `tauMax = 1.5 × (√(R_far²−b²) − √(R_near²−b²))/c`; walks snapshots and linearly interpolates the coord-time `t = x[0]` at `r = R_near_m`. Subtracts the flat-space straight-line transit `(√(R_far²−b²) − √(R_near²−b²))/c` to recover the Shapiro delay. Default impact parameter `b_m = 0` (radial geometry) — reproduces the closed-form `(2GM/c³) · ln(R_far/R_near)` to ≤2×10⁻⁴ relative on solar-scale Earth/Mars geometries (Task 11 cross-check target ±2×10⁻³, actual ~1.8×10⁻⁴ at default steps). New optional `b_m`, `steps` inputs on `BE37CovariantEikonalInputs`. Schwarzschild g^μν and ∂_λ g^μν closures inlined (mirrors `tests/fixtures/schwarzschild.ts`, kept private to avoid src→tests dependency). **Honest plan-deviation from M8/I5:** the plan template's magnitude bound `2e-11 < ... < 3e-10 s` was inconsistent with any standard Shapiro geometry — the same Earth-Mars inputs give ~4 μs against `evaluateShapiroDelay`. The new test uses the geometrically-consistent bracket `[1e-7, 1e-4] s` around the closed-form 4.15 μs for Mars→Earth radial. **Honest plan-deviation on inputs:** plan template had `R_far_m = 1.496e11` (Earth) and `R_near_m = 2.279e11` (Mars) which violates the `R_near ≤ R_far` domain guard; corrected to Mars (R_far) → Earth (R_near). The closed-form cross-check at ±2×10⁻³ tolerance is Task 11's `it.skip` reactivation.
- BE-37 covariant-eikonal Shapiro cross-validation activated (`tests/dimensional/covariant-derivative-preview.test.ts`). Was `it.skip` in v0.4.0; now passes via GL4 null-geodesic integration to ±2×10⁻³ relative (I5 re-relaxation — original v0.4.0 ±1×10⁻⁴ relative was below the double-precision floor: Earth-Mars Shapiro ≈ 2×10⁻¹⁰ s, 1×10⁻⁴ relative = 2×10⁻¹⁴ s absolute, below the ~3×10⁻¹³ s floor on 1500 s coord-time accumulation). v0.5.0 Task 11 (Phase 2b). Empirical `relErr = 1.76×10⁻⁴` at the default 2048 GL4 steps — ~11× tighter than the ±2×10⁻³ I5 gate (residual relErr above the double-precision floor stems primarily from the `c_SI` constant mismatch between `evaluateBE37CovariantEikonalNumerical` at `c_SI = 2.998e8` and `evaluateShapiroDelay` at `c_SI = 299792458` exact; both bridge equations are individually self-consistent against their respective closed forms). Geometry inputs `R_far_m = 1e11`, `R_near_m = 6.96e8` (solar-radius near point, ~Earth-orbit far point) — radial null geodesic (`b_m = 0` default). Both Task 11 (this `it.skip` reactivation) and Task 12 (the underlying `shapiroDelaySec` implementation) compare against the same closed form `(2GM/c³)·ln(R_far/R_near)`. Closes the second v0.4.0 it.skip debt. Best-effort numeric framing per Design §3 Task 2b F20/M6.
- BE-52 Mercury perihelion geodesic cross-validation activated (`tests/bridges/perihelion-precession.test.ts`). Was `it.skip` in v0.4.0; now passes via GL4 + perihelion-finder to ±2×10⁻³ relative (I6). v0.5.0 Task 10 (Phase 2a). Closes the first v0.4.0 it.skip debt. Achieved `relErr = 1.77×10⁻⁷` at 50k GL4 steps (Picard tol=1e-12 default) — ~10⁴× tighter than the I6 target and ~3×10³× tighter than the historical ±5×10⁻⁴ aspiration; the integrator's symplectic Hamiltonian-drift bound + the perihelion-finder's cubic-Hermite root accuracy together far exceed what the 6πGM/(a(1-e²)c²) leading-order closed form can validate against. Newtonian L = √(GM·a(1−e²)) used as the leading-order angular-momentum estimate (GR-corrected L unnecessary at this tolerance — the closed-form bridge is itself leading-order in r_s/a ~ 5×10⁻⁸). Canonical (x, p) initial state from Legendre transform: p_t = −E, p_r = 0, p_θ = 0, p_φ = L, with E = c√((1−r_s/r_p)(c² + L²/r_p²)) (exact from g^μν p_μ p_ν = −c²). Wall-clock: 82s on Windows. M12 deviation: plan asserts `foundPerihelia.length === 2` but `findPerihelion` returns one result by design; the test instead slices snapshots past τ > 0.5·T_orbit and locates the second perihelion only (equivalent guarantee, simpler control flow — documented in the test header).

### Added
- `bianchiResidual(R)` helper in `src/dimensional/curvature.ts` (returns `{residual, evaluate, evaluateMax}`). v0.5.0 Task 9 (Phase 1f). Closes Phase 1 — Foundations. Builds the second-Bianchi-identity cyclic-derivative residual `B_{λμνρσ} = ∇_λ R_{μνρσ} + ∇_μ R_{νλρσ} + ∇_ν R_{λμρσ}` (Carroll Eq. 3.95, ∇_{[λ} R_{μν]ρσ} = 0). **Implementation (Approach 1, full ∇).** Lowering walks the node directly: (1) lowers upper-ρ of R^ρ_{σμν} on the JS side via g_{aρ} (no v0.3.0 `lower()` AST round-trip per FD sample); (2) computes ∂_λ R_{αβγδ} via 4th-order centered FD on the lowered Riemann (h_outer = 1e-4·max(|x|,1) — same step as Task 6's dGamma); (3) builds ∇_λ R_{μνρσ} with four Christoffel-correction terms (one per lower index of R); (4) cyclic-sums over (λ, μ, ν). New `bianchi-residual` ExprNode AST kind (own validator + lowering arms — no AST rewrite into cyclic-op('+') of pderiv products; matches Task 6/7/8 walk-directly philosophy). Validator: 5 free lower indices (synthesised `lambda` + `alpha_lower` + 3 from `R.lowerIndices`); dim L⁻³ (one ∇ added to R's L⁻²). Helper module: new exports in `src/numerical/curvature-lowering-helpers.ts` — `riemannUpperAt`, `lowerFirstIndex`, `riemannLowerAt`, `dRiemannLowerAt`, `covariantDerivRiemannLowerAt`, `bianchiResidualAt`. Quantitative test assertions (M1, no `expect(true).toBe(true)` placeholders): (1) Schwarzschild vacuum — normalized `max|B|/scale` < 1e-5 (scale = max|R|/Lchar), empirical ~1.5e-6 — relaxed from plan's 1e-9 absolute target as the prompt explicitly permits, with the noise-floor compounding documented in the test header (Task-6 Riemann ~8e-10 floor × extra FD layer × 4 Christoffel-correction terms per ∇R); (2) de Sitter — normalized < 1e-5, empirical ~5.7e-6; (3) synthetic JS-side perturbation of clean ∇R at one entry by 10% of scale — confirms cyclic sum jumps to normalized > 0.05, ~4 OOM above vacuum floor (anti-vacuousness, M1 — proves the identity check is NOT trivially passing). **Unitless metric rescaling for vacuum tests.** SI Schwarzschild + de Sitter fixtures carry c² on g_tt; in the Bianchi context, intermediate Γ·R products carry c² and cancellation residuals at IEEE 754 precision swamp the geometric floor by ~10 orders. The Bianchi identity is metric-rescaling-invariant (rescaling g → c²·g rescales R → c²·R and ∇R → c²·∇R; 0=0 survives both sides). Vacuum tests use a unitless (c=1) rescaling of de-Sitter and Schwarzschild — a Bianchi-test-only fixture; SI fixtures remain authoritative for Ricci/Einstein. **evaluateMax convenience + full 5-index evaluate() per F18/M4.** `residual` returns the raw ExprNode for symbolic consumers (validator, equation-homogeneity checks); `evaluate(engine, inputs)` returns the 5-deep nested array; `evaluateMax(engine, inputs)` returns the max-absolute scalar for the common self-consistency check. Public API additions: `bianchiResidual` function-export, `BianchiResidualNode` type-export (both re-exported from `src/index.ts`).
- `einstein(R, g, gInverse)` helper in `src/dimensional/curvature.ts`. Vacuum-Einstein-field-equation scope (Schwarzschild + de Sitter); matter-coupled `G_μν = κ T_μν` deferred to v0.6.0+. Builds an `einstein-tensor` ExprNode wrapping a `RiemannTensorNode` plus the metric pair (g_μν, g^μν). Lowering computes `G_μν = R_μν − ½ R g_μν` by walking the node directly: lowers the inner ricci-tensor (which lowers the inner riemann-tensor → 4×4 R_μν), looks up g_μν and g^μν from `inputs.tensors` (constant raw matrices), computes scalar `R = Σ g^{μν} R_{μν}` on the JS side, then forms G elementwise. No AST rewrite into `op('-', ricci, scale·g)` — the v0.3.5 tensor-product einsum does not natively support a tensor-valued scalar-multiply, and walking the composite node directly mirrors the Task-6/7 philosophy. New `EinsteinTensorNode` AST kind (own validator + lowering arms); validator delegates to `validateRicciTensor` for surviving free-index labels (Einstein and Ricci share `{μ_out, ν_out}` by construction; gLower/gInverse free indices are H1-suppressed, consumed internally). Quantitative test assertions (M1, no `expect(true).toBe(true)` placeholders): (1) Schwarzschild vacuum — max `|G_μν|/scale_local` < 5e-9 (same component-wise normalization as the Task 7 Ricci-vacuum test: `scale_local = |g_μν|` on diagonal, √|g_μμ·g_νν| off-diagonal; empirical floor is ~4.2e-18 — far below the gate); (2) de Sitter — max `|G_μν + Λ g_μν| / |Λ g_μν|` < 5e-10 with Λ=1, r=1 (synthetic values for clean numerics; physical Λ ≈ 1e-52 m⁻² is FD-intractable). Plan target was 1e-10 but the de-Sitter Einstein construction compounds the Task-7 Ricci-floor (1.16e-10) through one extra scalar-trace contraction (`R = g^μν R_μν`, 16 noisy terms) plus the `½ R g_μν` subtraction tensor — total bound ~3·relErr(R) ≈ 3.5e-10. Empirical ~3.13e-10. Relaxed to 5e-10 (same discipline as Task 7's de-Sitter Ricci-scalar relaxation); (3) trace identity `g^μν G_μν = −R` to ≤1e-14 (machine precision — pure algebraic identity since both sides are constructed from the SAME lowered Ricci + metric tensors; empirical 0, exact). Public API additions: `einstein` function-export, `EinsteinTensorNode` type-export (both re-exported from `src/index.ts`). v0.5.0 Task 8 (Phase 1e).
- `ricci(R)` helper in `src/dimensional/curvature.ts` — builds a `ricci-tensor` ExprNode wrapping a `RiemannTensorNode` and contracting it down to R_μν. **Convention:** Carroll Eq. 3.91 — `R_μν = R^λ_{μλν}` contracts upper-ρ against `lowerIndices[1]` (the middle/μ slot). Surviving free indices come from `lowerIndices[0]` (σ slot → Ricci's first free output) and `lowerIndices[2]` (ν slot → Ricci's second free output). **Honest deviation from the Task 7 prompt's stated S1 rule:** the prompt re-introduced "contract upper↔lowerIndices[0] (σ)" as the "fix," but that trace `R^λ_λμν` is identically zero by the lowered Riemann's first-pair antisymmetry — it produces R = 0 for ALL metrics including de Sitter, contradicting the closed-form `R = 4Λ` test target. The de-Sitter Ricci-scalar test is the discriminating fixture (commented inline in `src/dimensional/curvature.ts` and `src/numerical/lowering.ts`). The implementation matches Carroll Eq. 3.91 verbatim, which is the mathematically correct definition. New `RicciTensorNode` AST kind (own validator + lowering arms, no AST-rewrite into `tensor-product` since `RiemannTensorNode` is not contractable in the v0.3.5 einsum sense). New de Sitter fixture (`tests/fixtures/de-sitter.ts`) with full closed-form constant-curvature Riemann `R^ρ_{σμν} = (Λ/3)(δ^ρ_μ g_{σν} − δ^ρ_ν g_{σμ})` populating all 256 entries, mostly-plus −+++ signature, c²-on-g_{tt} SI convention mirroring Schwarzschild. Quantitative test assertions (M1, no `expect(true).toBe(true)` placeholders): (1) tree-structure — `freeIndices.size === 2`, both lower, dim `{L: -2}`; (2) Schwarzschild vacuum — max `|R_μν|/scale_local` < 5e-9 with `scale_local = |g_μν|` for diagonal entries and √|g_μμ·g_νν| for off-diagonals (normalized because Schwarzschild's c²-on-g_tt scales absolute noise on R_tt by c² ≈ 9e16; empirical floor is ~5e-18 normalized — far below the gate); (3) de Sitter — `|R_scalar − 4Λ|/|4Λ|` < 5e-10 with Λ=1, r=1 (synthetic values for clean numerics; the physical Λ ≈ 1e-52 m⁻² is FD-intractable since the curvature signal is many orders of magnitude below the truncation floor); empirical relErr ~1.16e-10 (FD truncation on g→Γ→∂Γ via 4th-order centered stencil, summed through Riemann build, then contracted twice — once for Ricci, once for the scalar trace). Public API additions: `ricci` function-export, `RicciTensorNode` type-export (both re-exported from `src/index.ts`). v0.5.0 Task 7 (Phase 1d).
- Numerical lowering for `RiemannTensorNode` (`src/numerical/lowering.ts` + new `src/numerical/curvature-lowering-helpers.ts`). Direct Γ + ∂Γ via pderiv (M11). `DGammaTensor` type alias pins `dGamma[λ][ρ][σ][ν] = ∂_λ Γ^ρ_{σν}` index order (I3) with a runtime `isFinite(dGamma[1][1][1][1])` assert. Tree size bounded (no AST rewrite into pderiv-of-Γ — walks the node directly per Design §3 Task 1c and §7 R5). Christoffel evaluation reuses the v0.4.0 `computeChristoffelTensor` helper; ∂g (inner FD) and ∂Γ (outer FD) both use **4th-order centered stencils** (truncation O(h⁴)) — the 2nd-order v0.4.0 cov-deriv FD path leaves ~3e-6 relative error on `R^t_{rtr}` because g_{tt} is c²-scaled (~6e16) and cancellation noise propagates through the double FD. 4th-order recovers ≤1e-9. Inner step h_i = 1e-3·max(|x|,1); outer h_o = 1e-4·max(|x|,1). Schwarzschild component match vs the Task 0 analytic fixture: `R^t_{rtr}` relErr ≈ 8.0e-10, `R^θ_{φθφ}` relErr ≈ 8.1e-10 (both clear the ≤1e-9 gate). Lowering surfaces additional non-trivial Schwarzschild Riemann components beyond the Task 0 fixture's two-entry minimum (e.g., `R^r_{trt}` ≈ −2.55e8, `R^r_{θrθ}` ≈ −0.1667, `R^φ_{θφθ}` ≈ 0.333) — all are correct per Carroll Ch. 5; the component-match test's `< 1e-30` zero-skip guard accommodates this scope difference. M1 quantitative antisymmetry on the LOWERED tensor (not the fixture, to avoid vacuity): `R[ρ][σ][μ][ν] + R[ρ][σ][ν][μ]` max-absolute < 1e-14. Inputs contract: `inputs.tensors[xCoord.name]` for the coordinate vector, `inputs.fields[gName]`/`inputs.fields[gInvName]` for coordinate-dependent metric closures (raw constant-tensor metric throws — constant-metric Riemann is identically zero). v0.5.0 Task 6 (Phase 1c-ii).
- `RiemannTensorNode` AST kind in `src/dimensional/connection-validators.ts`; dim = 1/L² (Riemann carries inverse-length-squared units, not dimensionless); Carroll-Ch.3 index convention `R^ρ_{σμν}` with σ in the second lower slot of each Γ (Adam+Eve F4/S3). Validator: dummy/free-index disjointness only on the riemann node's own 4 labels (M9 — legal algebra may reuse labels after explicit raise/lower; we do NOT enforce all-labels-globally-distinct). H1 (v0.4.0 pattern): `gLower` / `gInverse` / `xCoord` sub-nodes are signature-checked but their free indices are NOT propagated (the Riemann formula's contractions consume them internally). Numerical lowering deferred to Task 6 (1c-ii) — the lowering exhaustiveness arm throws `NumericalBackendError` with a Task 6 pointer. v0.5.0 Task 5 (Phase 1c-i). New error path reuses existing `PartialDerivativeIndexVarianceError`, `MetricSignatureError`, `IndexLabelCollisionError`; no new error classes. Public AST + type surface: `RiemannTensorNode`, `UpperIndex`, `validateRiemannTensor`, `RiemannTensorValidationResult` exported from `connection-validators.ts`; `RiemannTensorNode` + `UpperIndex` re-exported from `validator.ts` matching the `CovariantDerivativeNode` precedent. M7 closed-form pin against analytic Schwarzschild was deliberately not duplicated here — the canonical pin lives in `tests/fixtures/schwarzschild.test.ts` (Task 0) using the coordinate-basis Carroll value `R^t_{rtr} = r_s/(r²(r-r_s))`; the plan-template leading-order shorthand `2GM/(6M)³` is off ~33% at finite r and would have been a wrong pin.
- `findPerihelion` bisection finder (`src/numerical/perihelion-finder.ts`) — v0.5.0 Task 4 (Phase 1b). Cubic-Hermite interpolation on cached GL4 snapshots: walks `(τ, x, p)` snapshots, computes `dr/dτ = g^{rν}(x) p_ν` per snapshot, locates the first `− → +` sign-change bracket, fits a cubic Hermite polynomial (4 values: f and f' at both endpoints, endpoint slopes via central differences), then refines the root via bisection **on the polynomial** (not re-integration — Adam+Eve F11/I6: re-integration per bisection step costs a full GL4 sweep and defeats the cached-snapshot approach). Precision floor 1e-9 × T_orbit per Adam+Eve I1 (1e-12 needs ~40 cubic bisections; pointless given the integrator's per-step error). M2 quantitative assertion in test. `PerihelionBracketWidthWarning` emitted via `process.emitWarning` when the bracket width is narrower than the median snapshot Δτ (M3 — documented deviation from the literal `< 2·h_snap` spec: on a uniform-step grid that comparison fires every call since bracket = h_snap exactly; the intent of M3 is to flag *adaptively-compressed* brackets, so we compare against h_snap directly). GL4 + perihelion-finder round-trip integration test (`tests/numerical/perihelion-finder-roundtrip.test.ts`) folded into Task 4 per Adam+Eve M3 (was original Task 5). Round-trip uses Option C1 (flat-space straight-line trajectory with synthetic radial repack) — the physically-faithful Schwarzschild bound-orbit IC are deferred to Task 11 (BE-52 perihelion) where the Legendre transform from orbital E, L lands. Public API surface: `findPerihelion` + types `PerihelionResult`, `FindPerihelionOptions` exported from `src/index.ts` and `src/numerical/index.ts`.
- `integrateGeodesicGL4` symplectic integrator on canonical (x, p) state (`src/numerical/gl4-integrator.ts`). Drives the implicit Picard stage solver per step with **adaptive step-halving on Picard non-convergence** (Adam+Eve I4 — replaces the single-retry R8 design: retry h/2, h/4, … down to `hMin` floor before throwing `GL4ConvergenceError` with a diagnostic message). Cycloid radial-infall match relErr ≈ 8.4e-16 vs the analytic closed form at 5000 steps (`tests/numerical/gl4-integrator.test.ts`, plan target ≤1e-13). Hamiltonian drift ≤ 1e-14 over 1000 steps on a flat-space free particle (symplecticity for non-separable H, demonstrated unambiguously without the curved-spacetime Legendre-transform IC work deferred to Task 11). Domain-violation guard throws `NumericalBackendError` synchronously when `initialState.x[1] < domainMinRadius`. Long-gated `GL4_LONG=1` Mercury 100-orbit Picard-robustness test stubbed per Design §7 R1. Public API surface: `integrateGeodesicGL4` + types `GL4State`, `GL4Snapshot`, `GL4Options` exported from `src/index.ts` and `src/numerical/index.ts`.
- GL4 implicit Picard stage solver in `src/numerical/gl4-integrator.ts` (`solveGL4Stage`, internal). Picard fixed-point iteration (renamed from "simplified Newton" — Adam+Eve S2). Throws `GL4ConvergenceError` (defined in `src/numerical/errors.ts` alongside `EngineCapabilityError`) with specific message `/Picard iteration did not converge/` on non-convergence. Convergence bound ≤40 iterations at tol=1e-12 (flat-space ∂g=0 converges in 2 iterations; Mercury-scale curved spacetime needs 30–40 per Design §3).
- GL4 (Gauss-Legendre 4th-order) integrator scaffold: Butcher tableau constants + canonical (x, p) state types (`src/numerical/gl4-integrator.ts`). Symplectic for the non-separable geodesic Hamiltonian.
- Schwarzschild fixture v0.5.0 API alignment: `gFn`, `gInverseFn`, `dgInverseFn` (TSDoc-pinned index order `dg[λ][μ][ν] = ∂_λ g^{μν}`), `schwarzschildRiemannFn` analytic closed form (scoped to pinning-test components per Task 0 pragmatic-minimum). Index-order guard test added (`tests/fixtures/schwarzschild.test.ts`): asserts `dg[0][1][1] = ∂_t g^{rr} = 0`, `g_μν g^{μν} = 4` round-trip, and M7 Riemann pin `R^t_{rtr}(r=3r_s) = r_s/(r²(r−r_s))` (Adam+Eve M4 + I2 + M7).

### Fixed
- Sign of `dg[1][0][0] = ∂_r g^{tt}` in `tests/fixtures/schwarzschild.ts` (Task 0 regression caught by Task 3 cycloid test). Correct value is `+r_s/(r²(1−r_s/r)²c²)`, not negative — the wrong sign reverses the radial force in the GL4 geodesic flow and causes test particles to drift outward instead of falling inward. Regression-pinned in `tests/fixtures/schwarzschild.test.ts` (`dg[1][0][0]` assertion + `> 0` guard).

## [0.4.6] - 2026-05-17

> Minimize/simplify pass — refactor + dead-code + type-safety + comment-honesty release.
> No new features, no breaking changes, no physics changes (v0.5.0 scope).
> 22 mechanical fixes across 5 tracks (unreachable code, lies in comments, type-safety holes,
> algorithmic simplifications, release). All 32 audit findings addressed (some batched).
> Adam+Eve adversarial reconciliation pass before execution caught 18 plan defects.
> New shared `src/numerical/strides.ts` utility module. No new public API.

### Fixed
- AS-7: einsum `operandFlatIndex` in `float64-engine.ts` now uses precomputed per-operand axis maps (`freeAxesByOp`, `contractAxesByOp`) instead of iterating `spec.free`/`spec.contractions` on every element computation. Reduces inner-loop spec iteration for medium-rank tensor contractions.
- AS-5: tensor.ts Step C Map deletion changed from Array.from(merged.entries()) snapshot to collect-keys-then-delete; allocates only the small contracted-label string[]. Minor allocation reduction per validated tensor product.
- AS-4: `forEachMultiIndex` in `connection-lowering-helpers.ts` no longer spreads `idx` on every `visit` call. Eliminates N^4 array allocations per covariant-derivative lowering (256 per call in N=4 spacetime). Visitor invariant documented.
- AS-8: `computeChristoffelTensor` now precomputes all N metric derivative arrays before the triple loop. For N=4 with 'supplied' strategy: ~96 flattenNA calls reduced to 4 (O(N^4) loop structure unchanged; constant factor reduced).
- AS-2: duplicate `sameShape` function consolidated into `strides.ts` (alongside `rowMajorStrides`/`flatIndex` from AS-3). Both `float64-engine.ts` and `connection-lowering-helpers.ts` now import from the shared module.
- AS-3: `rowMajorStrides` and `flatIndex` (4 duplicated functions total) extracted from `float64-engine.ts` and `connection-lowering-helpers.ts` into new shared module `src/numerical/strides.ts`; both consumer modules now import from there. Regression tests added in `tests/numerical/strides.test.ts`.
- TS-7, TS-8: `isEinsumSpec` and three metric-validator result interfaces annotated to clarify intentional public export vs internal use. Comment-only.
- TS-6: `EXPECTED_DIMENSION_BY_BRIDGE` in `bridge-check.ts` marked `@internal`. Not a breaking change — export preserved, stability guarantee clarified. Comment-only.
- TS-5: `validator.ts` `probeCtx.violations.length === 0` in the `^` exponent inference probe replaced with `okFromViolations(probeCtx.violations)` — warning-severity violations from the probe no longer cause `actualDim` to fall back to `DIMENSIONLESS`. Fix confirmed after precondition audit: `Violation.severity` field and `okFromViolations` helper both exist in the file.
- TS-4: ofIndices structural cast in lowering.ts narrowed from `variance: string` to `variance: 'upper' | 'lower'`; downstream redundant cast removed.
- TS-2: runtime guards added in lowering.ts for CovariantDerivativeNode.of (unknown→ExprNode) and gLower (cast to MetricTensorNode) — throws NumericalBackendError with a clear message for malformed ASTs bypassing validate().
- TS-3: Float64ReferenceEngine AD dispatch (add/sub/mul/scale) replaced duck-typed 'tangent'/'tape' property checks with instanceof EngineDualTensor / EngineTapedTensor — safer and type-discriminated within the module.
- TS-1: mathts-engine.ts autograd typed with a local MathTSAutograd interface instead of 'any'. 4 'as any' casts at call sites eliminated. Single 'as unknown as MathTSAutograd' cast at import site.
- AS-1: pderiv.ts `flattenToNumbers` (identical to `flattenNA` in `connection-lowering-helpers.ts`) removed; three call sites now import `flattenNA`. Reduces flatten implementations from 3 to 2 (`flattenNA` + `flattenNestedArray` wrapper). Regression tests added.
- UC-1: strategy cast in `lowering.ts` narrowed from `'zero' | 'supplied'` to literal `'supplied'` at the `getMetricDerivFlat` call (the `'zero'` arm was unreachable after the line-457 early return).
- UC-2: dead `else` branch (lines 482-486) in `lowering.ts` covariant-derivative partial computation removed; replaced with an explicit `NumericalBackendError` throw documenting the upstream invariant (`of` is always `tensor-symbol` or `metric-tensor` for a validated node).
- LC-2: mathts-engine.ts module-level and class-level JSDoc tense corrected ('becomes' → 'became') — MathTSEngine is already the default since v0.4.0. engine-registry.ts already used past tense; no change needed there. Comment-only.
- LC-1: evaluateBE37CovariantEikonalNumerical function JSDoc rewritten to be honest about its stub nature — it returns {eikonalResidual:0, shapiroDelaySec:0} and does not use the covariant-derivative or lowering infrastructure. Comment-only.
- LC-5: stale 'CRITICAL (finding #1 of v0.3.5 adversarial review)' prefix removed from lowering.ts buildEinsumSpec JSDoc. Also removed 'finding #1' back-reference at line ~249. Comment-only.
- LC-6: Float64ReferenceEngine class JSDoc updated to say 'fallback engine in v0.4.0+' rather than 'v0.3.5's default engine'. Comment-only.
- UC-6/comment: connection-validators.ts comment about gLower/gInverse validation corrected — they are NOT validated via validateChild; signature checks at lines 71-88 are sufficient. Comment-only.
- LC-3, LC-7, LC-8, LC-9: four comment fixes — flattenNA 'canonical' claim updated (duplicate consolidated); connection-validators stale Task-18 ref removed; src/index.ts version comment updated; getMetricDerivFlat key format example corrected. All comment-only.

## [0.4.5] - 2026-05-17

> Pure refactor + benchmark scaffold release. No new features, no bridge work (v0.5.0 scope), no breaking changes. LOC delta: +84 net across 39 bridge test files (helper file +81 LOC; migration net +3 LOC). Benchmarks are correctness-first baselines for v0.5.0+ comparison, not optimization wins.

### Added
- `bench/geodesic.bench.ts`: Schwarzschild radial infall at 1k/5k/10k RK4 steps (Task 9, v0.4.5). Benches `integrateGeodesic` with canonical cycloid-infall inputs (M=M_sun, r₀=100·r_s, η=0.5). Baseline for v0.5.0 symplectic-integrator comparison. `benchmarkTimeout` raised to 30 000 ms (F11). `bench/fixtures/schwarzschild.ts`: bench-local Christoffel closure (isolated from `tests/` for build and publish safety). Raw results in `docs/architecture/benchmarks.md`.
- `bench/be37-eikonal.bench.ts`: BE-37 Shapiro RK4 eikonal end-to-end baseline (Task 8, v0.4.5). Benches `evaluateBE37EikonalNumerical` (4096-step RK4, solar grazing scenario, ~813 hz / 1.2 ms/call) and `evaluateBE37CovariantEikonalNumerical` (v0.4.0 structural preview stub, ~762k hz). `benchmarkTimeout` raised to 30 000 ms (F11). Establishes AST→lowering→RK4 roundtrip baseline for v0.5.0 symplectic integrator comparison. Raw results in `docs/architecture/benchmarks.md`.
- `bench/ad.bench.ts`: forward + reverse AD baseline for `fn(x)=x*x` across 4 tensor shapes (`[10]`, `[100]`, `[10,10]`, `[100,100]`) and both engines (`Float64ReferenceEngine` always; `MathTSEngine` skipped gracefully if optional dep absent). Tensors pre-built outside bench callback (F4 discipline). Establishes v0.4.5 AD performance baseline; no threshold gates. Raw results documented in `docs/architecture/benchmarks.md`.
- `bench/` directory with Vitest bench infrastructure (Task 6, v0.4.5). `npm run bench` runs benchmarks via `vitest bench` (tinybench, already bundled — no new devDependency). `npm run bench:ci` runs benchmarks with verbose reporter for CI log capture (vitest 4.1.4 has no built-in JSON benchmark reporter; `--reporter=json` targets the test reporter, not bench). `bench/sanity.bench.ts` validates the toolchain with `Math.sqrt` (no UPT imports). Honest framing: this establishes baselines, not optimization — no threshold gates in v0.4.5 (gated regression deferred to v0.5.0). `bench/` excluded from npm tarball (verified with `npm pack --dry-run`; implicit via `files` whitelist). Node ≥ 18 required (already enforced by `engines` field).
- `docs/architecture/benchmarks.md`: v0.4.5 baseline results table (hz, median, p99) for all bench suites: sanity, AD [10]/[100]/[10,10]/[100,100], BE-37 Shapiro eikonal, Schwarzschild geodesic 1k/5k/10k.

### Refactored
- Bridge test helpers final migration Parts V-VI + v0.4.0 additions (Task 5c, v0.4.5): migrated 34 bridge test files (`be-28` through `be-50`, including reformulation variants `be-37-r3-disposition`, `be-43-reformulation`, `be-50-reformulation`). All module-scope and describe-scope `BRIDGE_EQUATIONS.find(...)` lookups replaced with `expectBridgeInIndex(id)` calls inside `it()` blocks (F5 constraint). Inline `validate + format` round-trip patterns replaced with `expectDimRoundTrip(rhs, sig)`. Four-line known_issues blocks in reformulation files replaced with `expectHasReformulationIssue(entry)`. Fix-test files (`be-11-fix`, `be-29-fix`, `be-47-fix`, `be-48-fix`) intentionally skipped (non-standard structure). Net LOC delta for Task 5c: 303 insertions / 398 deletions (−95 net) across 34 files. Test count preserved per file; 1061 passing + 1 skipped. Also fixed two partial-migration residuals in `be-25-iit-encoding.test.ts` and `be-28-onsager-encoding.test.ts` where `format` import had been stripped but `format()` calls remained inline — replaced with `expectDimRoundTrip`.
- Bridge test helpers bulk migration Parts II-IV (Task 5b, v0.4.5): expanded `tests/bridges/_helpers.ts` with `expectHasReformulationIssue(entry)` (asserts known_issues non-empty + has severity='phenomenological-ansatz'/fixable='reformulation' entry). Migrated 15 files: 12 reformulation tests (`be-12` through `be-38`) + 3 encoding tests (`be-13`, `be-18`, `be-20`). Module-scope `BRIDGE_EQUATIONS.find(...)` lookups moved inside `it()` blocks per F5 constraint; 4-line known_issues blocks replaced by `expectHasReformulationIssue` in 11 of 12 reformulation files (be-33 uses fixable-only check, kept inline). Test count preserved per file.
- Bridge test helpers pilot (Task 5a, v0.4.5): added `tests/bridges/_helpers.ts` with two helpers — `expectBridgeInIndex(id, status?)` (catalog lookup + optional status pin, returns entry) and `expectDimRoundTrip(rhs, sig)` (validate + format round-trip). Both called INSIDE `it()` blocks only (F5 constraint). Migrated 5 pilot encoding files: `be-19`, `be-22`, `be-26`, `be-27`, `be-35`. All 89 tests pass. Helper API frozen for Tasks 5b/5c bulk migration.

### Fixed
- Misleading JSDoc comment on `flattenNA` in `src/numerical/connection-lowering-helpers.ts`. The comment incorrectly claimed `flattenNestedArray` in `lowering.ts` was removed; the accurate description now explains the size-assertion distinction between the two functions.

### Changed
- `Float64Tensor` class in `float64-engine.ts` is now non-exported (was already `@internal`). Not a breaking change — was never in `src/index.ts` public surface. Use the `EngineTensor` interface and `TensorEngine` contract for all engine-adapter work.

### Removed
- Deprecated `RepeatedDummyLabelError` alias from `src/dimensional/errors.ts` (scheduled since v0.2.0; use `DuplicateIndexLabelError`). Not a breaking change — was never in the `src/index.ts` public surface. Note for sub-path consumers: if you reached into `src/dimensional/errors` directly, migrate to `DuplicateIndexLabelError`.
- Unused dimensional-signature constants from `src/dimensional/constants.ts`: `epsilon_0`, `t_P`, `m_P`, `E_P` (added speculatively in v0.1.0; zero downstream imports verified). Not a breaking change — none were in `src/index.ts` public surface. Note for sub-path consumers: if you reached into `src/dimensional/constants` directly for these symbols, construct the equivalent `Dimension` literal inline (e.g., for ε_0: `{ L: -3, M: -1, T: 4, I: 2, Theta: 0, N: 0, J: 0 }`).

## [0.4.0] - 2026-05-15

### Changed
- Default `getActiveEngine()` is now `async` and returns `Promise<TensorEngine>`. When both `@danielsimonjr/mathts-tensor` AND `@danielsimonjr/mathts-autograd` are installed, it resolves to `MathTSEngine`; otherwise falls back to `Float64ReferenceEngine` with a one-time `console.warn` (suppressible via `UPT_QUIET_FALLBACK=1`). **Honest framing: both engines run the same naive O(n) algorithms in v0.4.0; this default flip is a dep-shape + code-path-signal change, NOT a performance win.** MathTSEngine becomes default because that is where the autograd (AD) capability lives. `setActiveEngine` now wraps its argument in `Promise.resolve` to match the async contract. Concurrent first-time `getActiveEngine()` calls share a single in-flight Promise (I4 race-fix). `process.env` access guarded by `typeof process !== 'undefined'` for browser-bundler compatibility (I5 fix).

### Added
- v0.4.0 public-surface snapshot test (`tests/api/public-surface.test.ts`): runtime + type-only two-pronged guard covering 10 new `@public` entries (`christoffel`, `CovariantDerivativeNode`, `integrateGeodesic`, `evaluateGravitationalLensing`, `evaluatePerihelionPrecession`, `evaluateBE37CovariantEikonalNumerical`, `hasAutogradSupport`, `EngineCapabilityError`, `DuplicateCoordinateWarning`, `ForwardGradResult`, `ReverseGradResult`). Each entry documented with one-line `@public` rationale in `docs/planning/v0.4.0-api-surface.md`. `isChristoffelSymmetric` NOT present — removed per E9 review.
- `evaluateBE37CovariantEikonalNumerical` structural preview (residual=0 by null-wave-covector construction). First v0.3.5 `it.todo` in `covariant-derivative-preview.test.ts` activated and passing; second `it.todo` changed to `it.skip` pending v0.5.0 geodesic-integrated Shapiro cross-check. [v0.4.0 structural-preview only; Shapiro deferred to v0.5.0]
- `evaluatePerihelionPrecession` (BE-52 Einstein 1915). Closed-form Δφ = 6πGM/(a(1−e²)c²) per orbit; reproduces Mercury's ~43 arcsec/century anomalous precession to <0.5". Domain: bound orbits only (0 ≤ e < 1, a > 0, T > 0). Bridge catalog 41 → 42 (IDs 11-52). Geodesic cross-validation (Task 16b [U]): deferred to v0.5.0 — requires symplectic integrator + bisection perihelion finder (see `it.skip` block in `tests/bridges/perihelion-precession.test.ts` for full diagnosis). Root cause: the GR perihelion advance for Mercury (Δφ ≈ 5.02e-7 rad/orbit) is below the perihelion timing resolution achievable with `integrateGeodesic`'s sparse 100-snapshot trajectory; the snapshot-based r-minimum detection introduces ±0.052 rad φ error (∼1e5 × Δφ_GR), making the RK4 cross-validation unmeasurable at the required ±1e-4 relative precision without a bisection finder and a symplectic integrator.
- `evaluateGravitationalLensing` (BE-51 Eddington 1919). Closed-form α = 4GM/(bc²); validated against the canonical grazing-solar-ray result of ~1.75 arcsec. Domain check: b > 0. Geodesic cross-validation (null RK4, 200k steps) confirms to ±1e-4 relative error. Bridge catalog now 40+ entries (41 total, IDs 11-51).
- `integrateGeodesic` RK4 Schwarzschild geodesic integrator (validated vs. cycloid form to ±1e-6). `GeodesicIntegratorInputs.domainMinRadius` explicit option enforces r ≥ 3·r_Schwarz domain restriction (Task 14 [U]).
- HYBRID covariant-derivative coordinate-shadow handling (Task 13 [U]): default throws `MetricSignatureError`; `UPT_ALLOW_COORD_SHADOW=1` downgrades to `DuplicateCoordinateWarning` via `process.emitWarning`. `DuplicateCoordinateWarning` is the canonical class (lives in `src/dimensional/errors.ts`, re-exported from `src/numerical/index.ts`; uses `Object.setPrototypeOf` for correct `instanceof`).
- covariant-derivative lowering path (3 derivativeStrategy modes) in `src/numerical/lowering.ts`; helpers extracted to `src/numerical/connection-lowering-helpers.ts`.
- `tensor-partial-derivative` lowering extended to handle `of.kind === 'metric-tensor'` for 'zero'/'supplied'/'computed' strategies.
- optional `MetricTensorNode.derivativeStrategy` ('computed' | 'zero' | 'supplied', defaults 'computed').
- `covariant-derivative` AST node (`src/dimensional/connection-validators.ts`); dedicated validator case with internally-consumed metric indices.
- `christoffel()` helper in `src/dimensional/connection.ts` — composite builder for Γ^λ_μν as a tree of v0.3.0 AST nodes.
- `NumericalInputs.metricDerivatives` field + `metricDerivSupplied()` helper.
- optional `forwardGrad`/`reverseGrad` methods on `TensorEngine` (always `Promise`-returning per S6 uniform-async reconciliation). `ForwardGradResult` / `ReverseGradResult` result types.
- `EngineCapabilityError` (extends `NumericalBackendError`, `Object.setPrototypeOf` pattern for correct `instanceof`).
- `hasAutogradSupport(engine)` — returns `true` iff engine implements both AD methods.
- `Float64ReferenceEngine.forwardGrad`/`.reverseGrad` (pure-TS dual-number + tape AD).
- `MathTSEngine.forwardGrad`/`.reverseGrad` (adapter over `@danielsimonjr/mathts-autograd`).
- `tests/numerical/ad-conformance.ts` parameterized AD conformance suite (6 cases: capability detect, forward fn=x·x, reverse fn=x·x, default cotangent, rank-2 Jacobian shape, shape-mismatch error) — cross-repo AD contract run against both engines.

## [0.3.5] - 2026-05-14

> Numerical-contraction backend. UPT ASTs now evaluate to concrete numbers:
> a `TensorEngine` interface with a pure-TypeScript, zero-dependency
> `Float64ReferenceEngine` (the default) plus a second `MathTSEngine` backed
> by `@danielsimonjr/mathts-tensor`, both passing an identical parameterized
> conformance suite. Adds AST→engine lowering, two-way numerical partial
> derivatives, `InverseMetricInconsistencyWarning`, and the BE-37
> Shapiro-delay eikonal evaluated end-to-end and cross-checked against the
> closed form to ±1e-9 relative error. Designed via a full brainstorm +
> two-pass Adam/Eve adversarial review; the TensorEngine pivot (away from
> the original TF.js/mathjs hybrid) and every task were adversarially
> reviewed. SemVer MINOR — additive `numericalForm` + `Violation.severity`
> fields, new `src/numerical/` module, no breaking changes.

### Added
- `evaluateBE37EikonalNumerical()`: end-to-end numerical evaluation of the BE-37 Shapiro-delay eikonal, cross-checked against the closed form to ±1e-9.
- `src/numerical/null-ray-integrator.ts`: fixed-step RK4 integrator for affine-parameterized null geodesics.
- `evaluateNumerical` / `evaluateNumericalRaw` public surface +
  `engine-registry.ts`.
- `TensorEngine` interface (`src/numerical/tensor-engine.ts`) and
  parameterized engine-conformance suite.
- `Float64ReferenceEngine` (`src/numerical/float64-engine.ts`), the
  pure-TypeScript zero-dependency `TensorEngine` implementation.
- `Float64ReferenceEngine` einsum / matMul / transpose / reshape; passes the
  full engine-conformance suite.
- optional `Violation.severity` ('error' | 'warning', defaults 'error');
  warnings no longer fail `ValidationResult.ok`.
- optional `TensorSymbolNode.numericalForm` ('symbolic' | 'numerical-fn' |
  'grid', defaults 'symbolic').
- `src/numerical/pderiv.ts` + `GridField`: 'grid' / 'numerical-fn' /
  'symbolic' numerical partial derivative.
- `src/numerical/lowering.ts`: AST → `EngineTensor` lowering with `buildEinsumSpec`.
- `MathTSEngine` (`src/numerical/mathts-engine.ts`): second `TensorEngine`, backed by `@danielsimonjr/mathts-tensor` (optionalDependency).
- `InverseMetricInconsistencyWarning`: `evaluateMetricInverse` (numerical, auto-fires in `evaluateNumerical`) + `validateInverseMetricPair` (opt-in symbolic). Resolves the v0.3.0 deferral.
- numerical-correctness + einsum-property test layers; `numericalForm`-preservation regression test.
- `src/numerical/` re-exported from the root barrel; `public-api-stability.test.ts` extended; `@public`/`@internal` tags across the numerical module.

## [0.3.1] - 2026-05-13

Patch release: 3 verified-real fixes from the v0.3.0 RLM audit (Sonnet
code review + Adam (Gemini 2.5 Pro) / Eve (OpenAI o3-mini) adversarial
cross-check). All changes are additive bug fixes — no API changes, no
spec changes; v0.3.0 callers stay compatible.

### Fixed
- `validateKroneckerDelta` (Part-VIII §VIII.3) now rejects same-label
  indices like `δ^μ_μ` with `IndexLabelCollisionError`. Before this
  fix, the trace form silently collapsed to a single-entry freeIndices
  Map (the second `Map.set` overwrote the first), producing a malformed
  result instead of surfacing the trace-vs-free-index ambiguity.
  `validateMetricTensor` already had the analogous duplicate-label
  check; parity restored.
- `integral` and `derivative` AST cases in `src/dimensional/validator.ts`
  no longer use shallow `{ ...ctx, path }` spreads when recursing into
  child operands. The spread copied top-level fields but
  `ctx.freeIndices` is a `Map` (shared by reference), so a tensor-valued
  integrand or derivand silently leaked its free indices into the
  parent accumulator. Both cases now use the existing `inferArgLocal()`
  helper, which gives each child a fresh local Map. v0.3.0 has no
  tensor-integral / tensor-derivative semantics (those would require
  Part-IX); these operators stay dimensional scalar and child
  free-indices stay local.
- `v030-additive-semver-minor-bump` (Part-VIII §VIII.11) TENSOR-RULE
  now has a real backing test in
  `tests/dimensional/part-viii-spec-vs-impl.test.ts`: asserts
  `package.json` version is in the 0.3.x line and that the Part-VIII
  marker exists in the spec. Previously the rule was satisfied only by
  an orphan-anchor JSDoc comment, so the drift guard was vacuously
  green for this rule. The orphan-anchor reference has been removed
  from the JSDoc block (the `pderiv-of-metric-composes` anchor stays —
  it's still covered by a Task-12-forward `it.todo`).

## [0.3.0] - 2026-05-13

Metric-layer release. UPT now structurally encodes the Lorentzian /
Euclidean metric tensor, the Kronecker delta identity, and the
covariant partial-derivative operator. The first GR-flavored bridge
(BE-37 Shapiro time-delay) is structurally encoded using these
primitives. Load-bearing prerequisite for v0.4.0 (Christoffel symbols,
covariant derivative) and the v0.3.5 mathjs numerical backend.

Two-pass adversarial design review by Adam (Gemini 2.5 Pro) + Eve
(OpenAI o3-mini); execution via subagent-driven 16-task pipeline.

### Added
- AST node type `metric-tensor` with rank-2 same-variance indices, a
  signature string (`'+,-,-,-'` Lorentzian, `'+,+,+'` Euclidean, etc.),
  and per-encoding `dim` field. Validated by `validateMetricTensor` in
  the new `src/dimensional/metric-validators.ts` module.
- AST node type `kronecker-delta` (canonical `δ^μ_ν` identity tensor) —
  rank-2 mixed-variance, dim defaults to `DIMENSIONLESS`. Required for
  v0.4.0 covariant-derivative identities and the deferred
  `InverseMetricInconsistencyWarning`.
- AST node type `tensor-partial-derivative` with always-covariant
  `wrtIndex` (TypeScript-enforced via `CovariantIndex` type). Rank
  increases by 1; `dim = divide(of.dim, wrt.dim)`; `wrt`'s own free
  indices are deliberately discarded (the operator's index is
  supplied separately). Role inherits from `of` when `of` is a
  `tensor-symbol`; defaults to `'field'` otherwise (Design §13 Q1
  locked decision).
- User-facing helpers in new `src/dimensional/metric.ts` module:
  `metric(name, indices, dim, signature)`,
  `kronecker(upperLabel, lowerLabel, dim?)`,
  `pderiv(of, wrt, wrtIndex)`,
  `raise(operand, gInverse, label)`,
  `lower(operand, g, label)`. The raise/lower helpers perform
  **internal alpha-conversion** (Decision 8a): one of the metric's
  labels is renamed to match the operand's contraction label; the
  other is renamed to a deterministic fresh label avoiding all
  collisions with the operand's free indices. Output is a vanilla
  `tensor-product` that flows through the existing `computeContraction`
  algebra unchanged.
- 5 new error subclasses, all subclassing `UPTError`:
  `InvalidMetricRankError`, `MetricSignatureError`,
  `InvalidKroneckerRankError`, `KroneckerVarianceError`,
  `PartialDerivativeIndexVarianceError`. Local-only
  `RaiseLowerInvalidLabelError` for raise/lower validation (private to
  `metric.ts`).
- Spec module `docs/specification/Part-VIII-Metric-Layer.md` with 25
  `<!-- TENSOR-RULE: <id> -->` markers covering metric / Kronecker /
  pderiv invariants, the raise/lower contract, the v0.5.0+
  Faraday-cascade BREAKING-scope flag, and the SemVer posture.
- Drift guard `tests/dimensional/part-viii-spec-vs-impl.test.ts` —
  bidirectional spec↔impl enforcement (every marker referenced; every
  reference points at a real marker). Part-VII guard extended to
  union markers from both spec files (its phantom-marker check now
  accepts Part-VII OR Part-VIII references).
- v0.4.0 covariant-derivative preview test
  `tests/dimensional/covariant-derivative-preview.test.ts`: one
  passing test locking the `∂_μ g_νλ` rank-3 all-covariant
  composition shape (the building block for v0.4.0 Christoffel work)
  plus 2 `it.todo` entries for the Christoffel symbol and covariant
  derivative themselves.
- AST → JSON round-trip serialization test for all three new node
  kinds (including the nested `wrtIndex` object on pderiv).
- **BE-37 Shapiro time-delay** structurally encoded using the
  null-geodesic eikonal form `g^μν (∂_μ S)(∂_ν S) = 0`. New exports
  `BE37_EIKONAL_LHS`, `BE37_EIKONAL_RHS_ZERO`,
  `validateBE37EikonalDimensions` live alongside the preserved v0.2.1
  scalar form. The structural form exposes the tensor-structural
  origin of the Shapiro scalar `Δt = (2GM/c³)·ln(R_far/R_near)`.
  Bridge selection rationale in
  `docs/planning/v0.3.0-Bridge-Selection.md`.

### Changed
- `VarianceMismatchError` message refreshed to suggest
  `raise(operand, gInverse, '<label>')` and `lower(operand, g, '<label>')`
  with the concrete label inlined. The v0.2.0 message ended with
  "v0.2.0 has no metric to raise/lower indices, so this contraction
  is rejected" — historically inaccurate in v0.3.0. Message text is
  not part of the SemVer contract (Part-VIII §VIII.11).
- `validator.ts` `ExprNode` discriminated union extended with three
  new arms (`MetricTensorNode`, `KroneckerDeltaNode`,
  `TensorPartialDerivativeNode`). Total arms: 9.
- `resolveChildForContraction` extended with branches for
  `metric-tensor` and `kronecker-delta` so they can appear directly
  as tensor-product args (lowers to `math.Matrix` in v0.3.5).
- New `resolveChildForPartialDerivative` helper in validator.ts —
  separate from `resolveChildForContraction` because pderiv children
  carry the optional `role` field through the recursion.
- Part-VII §VII.7 (partial-derivative preview) updated to point at
  Part-VIII §VIII.4 for the canonical specification. The 2-field
  shape lock from v0.2.0 remains accurate; v0.3.0 extends it
  additively with the `wrt: ExprNode` field per the preview's own
  authorization.

### Deferred
- `InverseMetricInconsistencyWarning` machinery deferred to v0.3.5.
  Requires a `Violation.severity: 'error' | 'warning'` field on
  `ValidationResult.violations` — a substantive enrichment cleaner
  to bundle with the mathjs numerical-backend introduction. TODO
  marker in `src/dimensional/metric-validators.ts`; two `it.todo`
  entries in new `tests/dimensional/inverse-metric-consistency.test.ts`.
  Per Design §13 Q2 locked decision.

### Forward-compat
- All three new node kinds JSON-round-trip losslessly (v0.3.5 mathjs
  RPC contract per Design §14.1-§14.2).
- `metric-tensor.dim`, `tensor-symbol.dim`, and `kronecker-delta.dim`
  are single-`Dimension` fields — uniform-component-dim assumption
  baked in. Part-VIII §VIII.10 commits future-self to the v0.5.0+
  refactor (Faraday-tensor mixed-component-dim support) with eyes
  open. Three nodes participate in this BREAKING refactor.
- `∂_μ g_νλ` composes cleanly (covariant-derivative-preview.test.ts);
  v0.4.0 Christoffel work activates the two `it.todo` entries
  without retrofitting v0.3.0 ASTs.
- All 5 new error subclasses inherit `UPTError` (per v0.2.0-Design.md
  §14.7 contract); downstream mathjs/threejs consumers can
  discriminate UPT-source errors uniformly via `instanceof UPTError`.

### Documentation
- v0.3.0-Design.md: 16-section design doc with two-pass adversarial
  cross-validation record. Commit `4d7d2d3`.
- v0.3.0-Implementation-Plan.md: 16-task plan with bite-sized TDD
  steps, Bridge / Forward-compat anchors per task. Commit `213c667`.
- v0.3.0-Bridge-Selection.md: BE-37 selection decision record with
  candidate survey, sketch, and "what the sketch tells us" insights.
  Commit `eeb0829`.
- v0.2.0-Design.md §12 roadmap: v0.3.0 row marked shipped 2026-05-13.

## [0.2.1] - 2026-05-13

Patch release: one correctness fix + naming cleanup + documentation
improvements identified by post-v0.2.0 adversarial review (OpenAI
o3-mini + Gemini 2.5 Pro comprehensive pass).

The correctness fix is the load-bearing change: `contract(tsum(A, B), C)`-
style expressions (a tensor-product containing a tensor-aware op '+'
sub-expression) now contract correctly. v0.2.0 silently dropped the
sub-expression's free indices, leaving them un-contracted. Affects any
bridge encoding that combines tensor sums with tensor products.

### Fixed
- `validator.ts` `resolveChildForContraction`: tensor-aware non-tensor-symbol
  / non-tensor-product children (e.g., `op '+'` tensor sums) no longer have
  their `freeIndices` silently discarded when serving as args of a
  `tensor-product`. `contract(tsum(A^μ, B^μ), C_μ)` now correctly contracts
  μ to scalar. Regression test added to `tensor-product.test.ts`. Commit
  `568ade3`. Discovered by post-release OpenAI o3-mini + Gemini 2.5 Pro
  adversarial review.

### Changed
- **BREAKING (deprecation alias retained):** Renamed `RepeatedDummyLabelError`
  → `DuplicateIndexLabelError`. The original name was a misnomer: in
  tensor-calculus convention, a "dummy index" is summed-over (contracted),
  whereas this error fires on declaration-time duplicates of FREE indices
  within a single `tensor-symbol`'s indices list. Backward-compat alias
  `export const RepeatedDummyLabelError = DuplicateIndexLabelError` is
  retained with `@deprecated` and will be removed in v0.3.0. Commit
  `0493cf0`.
- `IndexLabelCollisionError`: optional `sources?: ReadonlyArray<string>`
  constructor parameter for richer error messages when the caller has
  per-operand provenance. Backward-compatible (optional; existing 2-arg
  callers unchanged). Commit `0493cf0`.

### Documentation
- `computeContraction` JSDoc: explicit paragraph on the v0.2.0 implicit-
  identity-metric assumption, flagging that v0.3.0's metric layer will
  generalize the pairing rule. Commit `0493cf0`.
- `TensorSymbolNode.role` field: inline JSDoc per Part-VII §VII.8.
  Commit `0493cf0`.

## [0.2.0] - 2026-05-12

Tensor-algebra layer added. UPT now structurally encodes tensors with
variance-typed index labels and the Einstein summation contraction
rule. Bridges with tensor structure no longer rely on typed-stubs.

### Added
- AST node type `tensor-symbol` with variance-typed indices and an
  optional `role: 'coordinate' | 'field' | 'constant'` field.
- AST node type `tensor-product` with automatic Einstein contraction
  of matched upper/lower index pairs.
- `ValidationResult.freeIndices: Map<string, {upper, lower}>` tracks
  uncontracted indices per subtree.
- `UPTError` base class; all UPT error types now subclass it for
  downstream `instanceof` discrimination.
- New error types: `RepeatedDummyLabelError`, `IndexLabelCollisionError`,
  `VarianceMismatchError`, `TensorInScalarOpError`,
  `FreeIndexMismatchError`.
- User-facing helpers: `tsym(name, indices, dim, role?)`, `scale(s, t)`,
  `contract(...args)`, `tsum(...args)`.
- Pure function `computeContraction(args)` exported for the future
  mathjs numerical backend.
- Spec module `docs/specification/Part-VII-Tensor-Algebra.md` with
  `<!-- TENSOR-RULE: <id> -->` markers and a partial-derivative
  preview section (v0.3.0 implementation pre-locked).
- Drift guard `tests/dimensional/tensor-spec-vs-impl.test.ts`.
- AST → JSON round-trip serialization test.
- Public-API stability snapshot test for TensorJS forward-compat.
- Structured `known_issues[]` arrays for the 16 R4-tier bridges that
  previously had prose-only concerns.

### Changed
- **BREAKING:** removed `T_torsion_squared` typed-stub from BE-17.
  Migration: use `tsym` + `contract` to express the structural form.
  BE-17 is the sole structurally-encoded tensor bridge in v0.2.0;
  Task 12 found that BE-33 / BE-36 / BE-43 reformulated to scalar
  canonical forms during Wave-P and have no tensor structure to
  encode (see v0.2.0-Design.md §13.8).
- `DimensionMismatchError` moved from `algebra.ts` to `errors.ts` (re-
  exported from `algebra.ts` for backward compatibility).
- `op '+' / '-'` now require matching `freeIndices` across all args
  (in addition to matching dimensions). Scalar + scalar behavior
  unchanged.
- `op '*' / '/' / '^'` now reject tensor operands. Use `tensor-product`
  for tensor multiplication.

### Documentation
- v0.2.0-Design.md: design doc with §14 forward-compat checks for
  TensorJS readiness. Cross-validated by OpenAI o3-mini and Gemini 2.5
  Pro.
- v0.2.0-Implementation-Plan.md: this plan.
- Bridge-Remediation-Plan.md: refreshed to post-Wave-Z state.

### TensorJS forward-compat
- AST → JSON round-trip is lossless (sanity check for mathjs RPC).
- `computeContraction` exported for mathjs numerical-backend reuse.
- `BridgeEquation` interface snapshot-tested for stability.
- All UPT errors subclass `UPTError` for cross-layer interop.

## [0.1.0] - 2026-05-12

First tagged release. Marks the transition out of pre-formalization to a
stable scaffold:

- **Dimensional analyzer is sound** — 240+ tests covering arity, switch-
  exhaustiveness, integral/derivative shape guards, with 22 named SI
  dimensions and round-trip `format()`.
- **Bridge index is correct and self-consistent** — 40 entries with
  dispositioned status, cross-field invariants enforced; spec markdown
  and TypeScript index do not drift (`tests/bridges/spec-vs-index.test.ts`).
- **Encoded subset round-trips** — every entry whose RHS lives in
  `src/bridges/equations/` validates back to its registered
  `dimensional_signature` via the catalog test.
- **Tier-5 AST encoding coverage: 40 / 40** — every BE-N (N ∈ 11..50) has
  an AST module, numerical evaluator with input validation, and
  per-bridge tests. Status distribution: 6 established · 31 speculative
  · 3 highly-speculative · 0 invalid.
- **Test suite: 1161 / 1161** across 68 files.

The catalog is closed in the rank-6 / scalar-AST scope at this point.
Further encoding would require AST primitive extensions (deferred per
Wave 2 leverage analysis) or domain-judgment reformulations on bridges
currently dispositioned `speculative`.

Sections below this header document the Wave A → Wave Z arc that
produced this release. Wave-narrative headings (`### Wave X — topic`)
record the chronological work; classical Keep-a-Changelog buckets
(`### Added`, `### Changed`, `### Fixed`, etc.) appear from the older
sections downward.

### Wave Z Gemini cross-validation — three docstring scope-note enhancements (2026-05-11)

After the Wave Z final-review sweep, the `llm-gemini` MCP transport
reconnected (post-`/reload-plugins`) but the Gemini reasoning tool did
not re-register in ToolSearch. Direct-Python invocation of
`google-genai` via the project's `client.generate()` succeeded, giving
us the long-deferred **Gemini Pro independent verdict** on the three
Wave-Z reformulations from `status='invalid'` or contested status.

**Gemini Pro verdicts** (model `gemini-2.5-pro`, thinking_budget 8192,
max_output_tokens 32768):

| Bridge | Reformulation | Verdict | Agreement with OpenAI o3 |
|---|---|---|---|
| BE-16 | Landauer's principle | **STRONGLY-DEFENSIBLE** | Agree |
| BE-37 | Shapiro delay | **STRONGLY-DEFENSIBLE** | Agree |
| BE-28 | Onsager σ | **DEFENSIBLE-WITH-CAVEATS** | Agree with the nuanced later o3 verdict (pragmatism wins between imperfect options) |

**Both reasoners — OpenAI o3 and Gemini Pro — independently confirmed
all three reformulations as defensible.** No reversal, no fundamental
disagreement. The cross-validation closes the asymmetric-LLM-coverage
gap noted at the close of Wave Z-G.

Gemini Pro recommended three specific scope-note enhancements,
applied verbatim to the corresponding module docstrings:

- **BE-16 (`be-16-landauer.ts`):** added clarifying note that
  `E_min = k_B T ln(2)` is a fundamental *lower bound* on the energy
  dissipated — equivalently, on the entropy generated in the
  environment via `ΔS_env = E_min/T = k_B·ln(2)` — during the
  irreversible act of **erasing one bit**. NOT a general
  proportionality for arbitrary information change. NOT an equality
  for non-erasure operations (computation, copying,
  measurement-without-reset). Both reasoners verdicted STRONGLY-
  DEFENSIBLE.

- **BE-37 (`be-37-shapiro-delay.ts`):** added clarifying note that
  the Shapiro delay manifests as an **apparent** coordinate-time
  slowdown of light traversing curved spacetime, NOT a variation in
  the fundamental constant `c` as measured by any local inertial
  observer. By Einstein's equivalence principle, every local
  observer measures the speed of light to be exactly `c` in their
  own inertial frame. The "effective c < c" interpretation is a
  coordinate-system artifact in the global Schwarzschild frame, not
  a physical local effect. This distinction is precisely what makes
  Shapiro survive the Ellis-Uzan critique — vacuum c(t,x)-variation
  is operationally meaningless precisely because it conflates the
  local-measurement and coordinate-system pictures. Both reasoners
  verdicted STRONGLY-DEFENSIBLE.

- **BE-28 (`be-28-onsager-entropy-production.ts`):** upgraded the
  honest-claude warning prefix from "IMPORTANT" to "**⚠ CRITICAL
  WARNING — Definiendum vs. principle**" with the Gemini-Pro-recommended
  wording: "This bridge is retained under the BE-28 label for
  historical continuity, but it represents the **definiendum** of
  MEPP (the quantity MEPP makes a claim about), NOT the maximization
  conjecture itself." The warning makes the relabeling distinction
  unambiguous for any future reader, addressing the Wave-Z-D
  consultation's original concern that "Onsager mislabels MEPP" while
  honoring the user's explicit choice to accept the trade-off.

**MCP transport investigation findings (corrected 2026-05-11 after process-inspection):**

- The `llm-gemini` MCP stdio process disconnected mid-session during
  Wave-Z work. `/reload-plugins` reported "12 plugin MCP servers"
  reloaded, but the `gemini_*` tools did not re-register in
  ToolSearch. The OpenAI MCP tools re-registered cleanly in the same
  reload, ruling out plugin-wide failure.
- **Initial (wrong) diagnosis**: I first wrote that the server
  process existed but its `@mcp.tool()` handlers hadn't propagated.
  That was a guess and it was wrong.
- **Actual diagnosis** (from `wmic process where "name='python.exe'"`
  inspection): **the Gemini MCP server process is not running at all**.
  Two `servers.openai_mcp.server` processes (PIDs 17272, 18836 —
  likely one orphan + one live) exist for the sibling OpenAI server,
  but **zero `servers.gemini_mcp.server` processes**. The reload's
  "12 plugin MCP servers" count tallies config entries reloaded, not
  spawned PIDs. So this is a spawn failure / silent skip, not a
  tool-registration race.
- **What's healthy** (verified):
  - `python -m servers.gemini_mcp.server` starts cleanly when run
    manually (waits on stdin as expected).
  - The `client.generate()` function works first-try when called
    directly — we got a 2028-output-token cross-validation response
    from gemini-2.5-pro in one shot (input 830, thinking 2981,
    output 2028, finish_reason=STOP).
  - `GEMINI_API_KEY` env var is set (39 chars).
- **Likely cause** (lower confidence): a stale-PID-tracking issue in
  the mcp-host plugin's reload path. Hypothesis: when the original
  Gemini server crashed silently mid-session, its PID was orphaned
  from the host's tracking. `/kill-plugins` then killed processes
  the host *knew about* (no longer including the dead Gemini PID),
  and `/reload-plugins` saw "Gemini server: not in active set"
  without distinguishing "needs spawn" from "already running."
  Evidence: 2 OpenAI processes (orphan + live) suggests the host
  is spawn-without-clean-killing in at least some paths.
- **Workaround used this session**: direct-Python `client.generate()`
  invocation, bypassing the MCP transport entirely. This is a
  reliable escape hatch for any future MCP-transport failure where
  the underlying SDK + credentials are healthy.
- **Next-session diagnostics**:
  1. Check process creation timestamps: `wmic process where
     "name='python.exe'" get processid,commandline,creationdate
     /format:list` — if the older OpenAI process predates this
     session's `/reload-plugins`, the host is spawn-without-clean-
     killing; that confirms the stale-tracking hypothesis.
  2. Capture the Gemini server's stderr by wrapping the .mcp.json
     command in a small launcher that redirects `sys.stderr` to a
     log file before importing `servers.gemini_mcp.server`. The
     stdio MCP transport eats stderr by default, hiding crash
     traces.
  3. Full Claude Code restart (end SSH/tmux, reconnect, `claude
     --continue`) to force a clean spawn of all servers. If Gemini
     comes up under a fresh session but fails again after
     `/kill-plugins` + `/reload-plugins`, the issue is specifically
     in the reload path, not the cold-start path.

**Final state (unchanged from Wave Z-G):** 40/40 AST coverage,
0 status='invalid', 0 null dimensional_signature,
0 tractability_class='undefined', 1161/1161 tests passing.
This cross-validation pass adds **three scope-note enhancements** to
the three reformulated bridges' docstrings; no code, test, or index
changes.

### Wave Z final-review sweep — docstring corrections (2026-05-11)

After completing Wave Z-A through Z-G (40/40 catalog coverage), a final
paper-reviewer sweep on all 11 new/reformulated modules surfaced three
high-confidence findings. The sweep also re-verified each module's
physics correctness, dimensional analysis, citation completeness, and
honest-claude scope discipline. Eleven modules reviewed; **all eleven
pass the closure gate** with the three minor corrections below.

**High-confidence corrections applied:**

- **BE-15 (`be-15-emergence.ts`)** — date typo in inline reference:
  `"Kawasaki-Gunton (1978) derived this scaling"` → `(1976)`. The
  references list already cited the correct 1976 *Phys. Rev. A* 13:2294
  paper; the inline date was mistyped.

- **BE-37 (`be-37-shapiro-delay.ts`)** — numerical bracket
  clarification: the docstring previously claimed the Sun-grazing
  one-way delay was `Δt ≈ 0.246 ms`, but that figure is the
  **round-trip** Shapiro 1964 radar-bounce experiment (4GM/c³ form);
  the encoded **one-way** form `2GM/c³·ln(R_far/R_near)` actually
  gives ~53 μs for the same geometry. The docstring bracket-check
  and the evaluator's `@returns` doc are now both corrected, with an
  explicit note that the one-way encoded form is NOT directly
  comparable to the historical round-trip Shapiro result. The
  evaluator implementation and test ranges were already correct (the
  test bracket spans 1e-5 to 5e-4 s, comfortably including 53 μs);
  only the docstring numerical narrative was wrong.

- **BE-25 (`be-25-iit-phi.ts`)** — added IIT 4.0 caveat to
  honest-claude scope notes: the encoded
  `ii(s,s̃) = p(s̃|s)·log₂[p(s̃|s)/p(s̃)]` is the *pointwise-KL* /
  Wikipedia simplified form. IIT 3.0 (Oizumi-Albantakis-Tononi 2014)
  and IIT 4.0 (Albantakis et al. 2023) use the **earth-mover's
  distance** (Wasserstein metric) as the canonical irreducibility
  measure on the cause-effect repertoire. The log-ratio is preferred
  because it has an AST-encodable closed form; Wasserstein would
  require a transport-plan primitive not in the grammar. The two
  metrics agree qualitatively for small systems.

**Minor improvements applied:**

- **BE-16 (`be-16-landauer.ts`)** — precision claim refined: the
  docstring previously cited Bérut 2012 and Jun 2014 jointly as
  "to within ~10%"; updated to specify that Bérut 2012 confirmed
  the relation consistent with the bound (without quoting a specific
  precision figure), and Jun-Gavrilov-Bechhoefer 2014 achieved ~3%
  precision in their follow-up single-electron experiment. Matches
  the literature more accurately.

**Cross-cutting observations (no action required):**

- All 11 modules consistently use the typed-stub idiom across BE-17
  (tensor contraction), BE-25 / BE-37 / BE-45 / BE-46 (log/exp
  stubs), BE-28 (index-collapsed force-flux sum), and BE-15 (kinetic
  coefficient).
- Honest-claude discipline is strong across the board. BE-28 carries
  the most prominent relabeling warning (as required, since it is
  the most aggressive reformulation — the only one that does NOT
  preserve its bridge label).
- All three Wave Z-E/F/G reformulations from `status='invalid'`
  follow the Wave-P-D BE-25 precedent (drop the broken form, replace
  with a canonical literature form). The reformulations are
  internally consistent and dimensionally correct.
- BE-35 is the only Wave-Z module with `status='established'`
  (verified consistent between docstring and index entry); the
  justification is that the crossing-symmetry identity is canonical
  CFT bootstrap content with decades of literature support — the
  *symmetry identity* is established, while the bridge framing
  remains the speculative element absorbed into the catalog label.

**No physics errors detected.** All dimensional arithmetic in the
11 modules was verified by hand against the encoded `dim` literals
and the validator's inference. All citations match canonical
references in the published literature.

**Final closure verdict: Wave Z arc is ready to ship as a clean
milestone.** The catalog is at 40/40 AST coverage with no
status='invalid', no null dimensional_signature, no
tractability_class='undefined', and 1161/1161 tests passing.

### Wave Z-G — Reformulation + AST encoding for BE-28 (Onsager entropy production) — **40/40 FULL COVERAGE** (2026-05-11)

Reformulates BE-28 from MEPP's variational formulation (which requires
variational-δ + Lagrange-multiplier + discrete-sum grammar primitives
the UPT AST does not have) to the **Onsager linear-response
entropy-production scalar** σ = Σᵢ Jᵢ Xᵢ. **User-confirmed design
choice** after the relabeling concern was surfaced via AskUserQuestion;
see Wave Z-G honest-claude scope notes for the full trade-off.

This brings the framework to **40/40 active AST modules — full
catalog coverage**.

- **BE-28 Onsager entropy production** (`be-28-onsager-entropy-production.ts`):
  encodes

      σ = Σᵢ Jᵢ Xᵢ

  as a single typed-stub `force_flux_product` with dim
  `[entropy/time]` = `[L² M T⁻³ Θ⁻¹]` = `[W/K]`. The discrete index
  sum over species (heat-flux/∇T, particle-flux/∇μ, charge-current/
  electric-field, etc.) is collapsed into the typed-stub — the AST
  has no discrete-index sum primitive, so the multi-species content
  is absorbed. Same idiom as BE-17 `T_torsion_squared` (typed-stub
  for tensor contraction) and BE-46 `exp_factor` (typed-stub for
  transcendental). Inferred RHS dim ✓.

  `dimensional_signature` null → `'[L^2 M T^-3 Theta^-1]'`. Status
  `'speculative'` retained. `tractability_class` `'formally-divergent'`
  → `'closed-form'`. Numerical evaluator enforces Second-Law σ ≥ 0
  with RangeError on negative input (with error message guiding
  toward sign-convention check).

  Refs: Onsager 1931 *Phys. Rev.* 37:405 / 38:2265 (foundational
  reciprocal-relations papers); de Groot-Mazur 1962 textbook
  (canonical); Dewar 2003 / 2005 (MEPP, now dropped); Grinstein-
  Linsker 2007 (MEPP rebuttal); Prigogine 1947 (minimum-EP, the
  contrasting principle).

  **⚠ IMPORTANT honest-claude scope (REQUIRED reading):**
  - This reformulation **does NOT capture MEPP's variational
    maximization claim**. Onsager linear-response is canonical,
    uncontested physics that defines the entropy production rate
    but says nothing about NESS selection. MEPP claims that "of all
    admissible NESS, nature selects the one maximizing σ subject
    to constraints" — that claim is the actual MEPP content and is
    NOT preserved by the encoded form.
  - The reformulation is closer to a **renaming** of BE-28 (MEPP →
    Onsager entropy production) than to the BE-25 / BE-16 / BE-37
    reformulations, which preserved their bridge labels
    (consciousness ↔ information; information ↔ thermodynamics;
    modified light propagation). MEPP's bridge label "Why nature
    chooses specific NESS" is NOT preserved by Onsager.
  - The user explicitly chose this reformulation in Wave Z-G after
    the relabeling concern was surfaced via AskUserQuestion,
    accepting the trade-off: **40/40 active bridge encodings at the
    cost of MEPP's variational semantic content**. Future readers
    should understand the encoding answers "what is the entropy
    production rate?" but NOT "why does nature select this rate?"
  - The OpenAI o3 Wave-Z-D consultation cautioned against this
    move ("Onsager mislabels MEPP"); the Wave-Z deferred-bridges
    revisit (Wave-Z-E/F/G consultation) reaffirmed the same caution
    but also offered Onsager as the most-canonical relabeling
    available. Both consultations are cited in the module docstring.
  - Onsager linear-response is **already implicitly used** by BE-21
    (KSS η/s bound), BE-23 (SYK Planckian resistivity), and BE-29
    (Jarzynski). BE-28's distinguishing role is to encode the σ
    scalar itself, not a derived transport coefficient or
    fluctuation theorem.

**Catalog coordination:**

- `EXPECTED_DIMENSION_BY_BRIDGE` (`src/dimensional/bridge-check.ts`):
  added `[28, {L:2, M:1, T:-3, Theta:-1}]` with extensive Wave-Z-G
  honest-claude comment.
- `ENCODED_RHS` (`tests/bridges/dimensional-signature-catalog.test.ts`):
  added BE28_ENTROPY_PRODUCTION_RHS entry.
- Cross-check map size pin (`tests/dimensional/bridge-check.test.ts`):
  bumped 39 → **40 (FULL COVERAGE)**; id allowlist updated.
- Orphan allowlist (`tests/bridges/orphan-dimensional-signature.test.ts`):
  added 28 to `ENCODED_RHS_IDS`.

**Counts (FINAL STATE):**

- AST encodings: 39/40 → **40/40 active modules — FULL COVERAGE**.
- Test suite: 1143/1143 → **1161/1161 passing**.
- `EXPECTED_DIMENSION_BY_BRIDGE`: 39 → 40 entries.
- `status='invalid'` count: **0** (no invalid bridges).
- `tractability_class === 'undefined'` count: **0** (all populated).
- `dimensional_signature === null` count: **0** (all populated).

**Catalog status: 100% coverage.** Every BE-N (N ∈ {11..50}) has:
- a populated `dimensional_signature` matching its AST encoding;
- an AST module in `src/bridges/equations/be-N-*.ts`;
- a numerical evaluator with Second-Law / dimensional / range guards;
- per-bridge encoding test plus participation in the cross-cutting
  catalog round-trip, orphan-invariant, and dimension-map size tests.

**Wave-Z arc summary** (the 8 commits that closed the catalog):
1. Wave Z-A (9cb299f): 4 dimensionless reductions (BE-32, 35, 46, 50).
2. Wave Z-B (8e1a38c): BE-25 IIT inner ii(s,s̃) via log₂-stub.
3. Wave Z-C (1581733): BE-17 Einstein-Cartan + BE-44 soft hair.
4. Wave Z-D (00f4379): BE-15 Kawasaki-Gunton coarsening.
5. Wave Z-E (29932bf): BE-16 reformulated → Landauer.
6. Wave Z-F (05900f3): BE-37 reformulated → Shapiro delay.
7. Wave Z-G (this commit): BE-28 reformulated → Onsager σ.

Reaching 40/40 required **three reformulations from `status='invalid'`
or contested-principle** (BE-16, BE-37, BE-28), each documented with
honest-claude scope notes describing what the reformulation drops
relative to the original framing. BE-28 specifically carries the
strongest honest-claude warning: the encoding does not capture MEPP's
variational maximization claim, only the Onsager linear-response
scalar that NESS theory operates on.

### Wave Z-F — Reformulation + AST encoding for BE-37 (Shapiro gravitational time delay) (2026-05-11)

Reformulates BE-37 from `status='invalid'` (vacuum c(t,x)≠const ansatz
operationally meaningless per Ellis-Uzan 2005 *Am. J. Phys.* 73:240
arXiv:gr-qc/0305099 "c is the speed of light, isn't it?") to
`status='speculative'` via the **Shapiro gravitational time delay** —
the canonical operationally-meaningful "effective-c" effect that
survives the Ellis-Uzan critique. Identified by OpenAI o3 in the
Wave-Z reopened deferred-bridges consultation. Same precedent as
Wave P-D R-D2 BE-25 (Penrose-Hameroff → IIT) and Wave Z-E BE-16
(Complexity-Entropy → Landauer).

- **BE-37 Shapiro delay** (`be-37-shapiro-delay.ts`): encodes

      Δt = (2 G M / c³) · ln(R_far / R_near)

  via the **typed-prefactor + log-stub** idiom. The prefactor 2GM/c³
  is encoded explicitly with G (`[L³M⁻¹T⁻²]`), M (`[mass]`), and c
  via the `^` operator for c³; the validator infers
  `[T³/T²] = [T]` ✓. The log argument `R_far/R_near` is a
  dimensionless ratio of two lengths — exposed as `BE37_LOG_RATIO_ARG`
  for the lemma test (same convention as BE-45 `BE45_LOG_RATIO_ARG_MP_HINF`).
  The ln itself is replaced by a fresh DIMENSIONLESS symbol stub
  `ln_R_ratio`. Inferred RHS dim: `[T] · [1] = [time]` ✓.

  `dimensional_signature` null → `'[time]'`. `status` `'invalid'`
  → `'speculative'`. `tractability_class` `'undefined'` → `'closed-form'`.
  Name updated: "Variable Speed of Light Cosmology" → "Modified
  light-propagation: Shapiro gravitational time delay".

  Refs: Shapiro 1964 *Phys. Rev. Lett.* 13:789 (original prediction);
  Will 1981/2014 textbook (PPN framework); Bertotti-Iess-Tortora
  2003 *Nature* 425:374 (Cassini solar-conjunction measurement of γ
  to ~10⁻⁵); Ellis-Uzan 2005 (the critique that motivated
  reformulation). Albrecht-Magueijo 1999, Moffat 1993, Barrow 1999,
  Magueijo 2003 retained as historical VSL context.

  **Honest-claude scope notes:**
  - The reformulation REPLACES the vacuum c(t,x)-variation ansatz with
    Shapiro delay. Shapiro is general-relativistic gravitational
    physics, NOT a "varying c" in any fundamental sense — light always
    travels at c locally; the delay arises from the integrated path
    length / coordinate-time effects in curved spacetime.
  - The Albrecht-Magueijo / Moffat / Barrow vacuum-c-variation
    proposals (three non-equivalent canonical VSL ansätze) are NOT
    recovered. The Wave Z-F move is to drop VSL entirely in favor of
    the operationally-meaningful gravitational time-delay, not to
    pick one of the three (each of which fails Ellis-Uzan
    independently).
  - The encoded form uses the GR-canonical PPN parameter γ=1 (i.e.,
    coefficient 2GM/c³). A more general PPN encoding would use
    (1+γ)GM/c³ with γ as a free parameter (Bertotti-Iess-Tortora
    2003 constrained |γ-1| < 2.3e-5).
  - Status `'speculative'` is for the **bridge framing** (treating
    Shapiro delay as THE UPT "modified-light-propagation" bridge),
    NOT for Shapiro delay itself, which is canonical.
  - The two original known_issues (operationally-undefined,
    phenomenological-ansatz) are retained for historical record but
    `fixable` updated to `'reformulation'` with
    `[RESOLVED Wave Z-F reformulation 2026-05-11]` prefix in the
    descriptions.

**Catalog coordination:**

- `EXPECTED_DIMENSION_BY_BRIDGE` (`src/dimensional/bridge-check.ts`):
  added `[37, TIME]` with Wave-Z-F comment.
- `ENCODED_RHS` (`tests/bridges/dimensional-signature-catalog.test.ts`):
  added BE37_SHAPIRO_DELAY_RHS entry.
- Cross-check map size pin (`tests/dimensional/bridge-check.test.ts`):
  bumped 38 → 39; id allowlist updated.
- Orphan allowlist (`tests/bridges/orphan-dimensional-signature.test.ts`):
  added 37 to `ENCODED_RHS_IDS`.
- R3-disposition test (`tests/bridges/be-37-r3-disposition.test.ts`):
  rewritten to verify the Wave Z-F reformulation rather than the
  legacy R3 invalid status. Now checks status='speculative',
  formula_latex is the Shapiro form (not the c(t) ansatz), all
  known_issues are `fixable: 'reformulation'`, references cite
  Shapiro 1964 / Bertotti-Iess-Tortora 2003 / Ellis-Uzan, and
  dimensional_signature is `'[time]'`. The historical
  `BE-37-VSL-Disposition-Brief.md` citation is preserved in notes
  for traceability.
- `tractability_class === 'undefined'` invariant test
  (`tests/bridges-index.test.ts`): updated from "at least one
  undefined" to "no undefined" — Wave Z-F was the last bridge with
  `tractability_class === 'undefined'`. All 40 bridges now have an
  explicit `tractability_class`.

**Counts:**

- AST encodings: 38/40 → **39/40 active modules**.
- Test suite: 1114/1114 → **1143/1143 passing**.
- `EXPECTED_DIMENSION_BY_BRIDGE`: 38 → 39 entries.
- `status='invalid'` count: 1 → **0** (BE-37 was the last; both
  historical 'invalid' bridges are now reformulated to 'speculative').
- `tractability_class === 'undefined'` count: 2 → **0** (all 40
  bridges now have a populated tractability_class).

**Remaining gap:**

- **BE-28 (MEPP)**: the ONLY remaining bridge without an AST
  encoding. OpenAI o3's Wave-Z consultation explicitly cautioned
  against reformulating MEPP to Onsager linear-response — "Onsager
  is uncontested established physics; MEPP's unique content is the
  variational maximization claim, which requires variational-δ +
  Lagrange + discrete-sum grammar primitives." Reformulating MEPP
  to a non-MEPP scalar would be relabeling, not the same precedent
  as the BE-25 / BE-16 / BE-37 moves (where the reformulated form
  addresses the same bridge label). MEPP stays deferred pending
  either a grammar extension or a different canonical scalar that
  preserves MEPP's variational content.

**Final realistic state: 39/40 active AST modules.** Reaching 40/40
requires either (a) a grammar extension (variational-δ + Lagrange-
multiplier + discrete-sum), or (b) finding a canonical scalar
reformulation of MEPP that preserves the variational maximization
content. Neither is straightforward; both are research-scale moves
beyond the Wave Z sweep.

### Wave Z-E — Reformulation + AST encoding for BE-16 (Landauer's principle) (2026-05-11)

Reformulates BE-16 from `status='invalid'` (broken `dS/dt = k_B·C(ρ)·∂I/∂t`
ansatz, algebraically self-refuting, C(ρ) undefined) to `status='speculative'`
via Landauer's principle, identified by OpenAI o3 in the Wave-Z reopened
deferred-bridges consultation. Same precedent as Wave P-D R-D2 BE-25
Penrose-Hameroff → IIT reformulation.

- **BE-16 Landauer's principle** (`be-16-landauer.ts`): encodes

      E_min = k_B · T · ln(2)

  the minimum thermodynamic energy per bit of information erased
  (Landauer 1961). k_B has dim `[energy/temperature]`; T has dim
  `[temperature]`; ln(2) is a concrete dimensionless numerical
  constant `[1]`. Product dim: `[energy]` ✓. The ln(2) is encoded as
  a single DIMENSIONLESS symbol `ln_2_constant` (no inner-argument
  lemma test needed — the argument 2 is a literal number, not a
  dimensionful ratio; differs from BE-25 / BE-45 log-stubs where
  arguments are dimensionful ratios).

  `dimensional_signature` null → `'[energy]'`. `status` `'invalid'`
  → `'speculative'`. `tractability_class` `'undefined'` → `'closed-form'`.
  Name updated from "Complexity-Entropy Production Relation" to
  "Information-Thermodynamics Bridge (Landauer's principle)".

  Refs: Landauer 1961 *IBM J. Res. Dev.* 5:183 (canonical original);
  Bennett 1973/1982 (reversible computation); Bérut et al. 2012
  *Nature* 483:187 (first experimental confirmation); Jun-Gavrilov-
  Bechhoefer 2014 *PRL* 113:190601 (precision test ~3%); Yan et al.
  2018 *PRL* 120:080507 (quantum extension); Reeb-Wolf 2014 *NJP*
  16:103011 (rigorous QIT formulation). Susskind 2014 (arXiv:1402.5674)
  and Brown-Roberts-Susskind 2016 (arXiv:1509.07876) retained as
  historical context — they inspired the original (broken) C(ρ)
  ansatz, now dropped.

  **Honest-claude scope notes:**
  - The reformulation REPLACES the algebraically-self-refuting
    original ansatz with Landauer's principle, dropping `C(ρ)`
    entirely. This is the same move pattern as BE-25 (Penrose-
    Hameroff → IIT). Wave P-D-style reformulation.
  - Landauer is a *lower bound* on the *minimum* energy per bit
    erased — NOT a proportionality between *complexity* and
    *entropy-production rate* as the original ansatz claimed. The
    reformulation captures the spirit of the bridge label
    (`microscale → emergent`, information ↔ thermodynamics) but not
    the original formula's intended structure.
  - The three known_issues entries (undefined-quantity,
    sign-convention, self-refuting) are retained for historical
    record but `fixable` updated from `'unfixable-must-mark-invalid'`
    to `'reformulation'` (matching the cross-field invariant —
    a 'speculative' bridge must not carry unfixable issues; we
    document that they WERE addressed via reformulation).
  - Other canonical bridges exist (Margolus-Levitin τ_min ≥ πℏ/(2E);
    Bremermann's limit; Bennett reversible-computation bound). Future
    BE entries could encode these as separate bridges. Landauer was
    chosen because it is the simplest, most-cited, and most directly
    matches the `microscale → emergent` label.
  - Quantum extensions (Reeb-Wolf 2014; Yan 2018) refine the bound
    for non-Markovian / coherent erasure. The encoded form is the
    **classical Landauer bound**; quantum corrections are not in
    scope.

**Catalog coordination:**

- `EXPECTED_DIMENSION_BY_BRIDGE` (`src/dimensional/bridge-check.ts`):
  added `[16, ENERGY]` with Wave-Z-E comment.
- `ENCODED_RHS` (`tests/bridges/dimensional-signature-catalog.test.ts`):
  added BE16_LANDAUER_RHS entry.
- Cross-check map size pin (`tests/dimensional/bridge-check.test.ts`):
  bumped 37 → 38; id allowlist updated.
- Orphan allowlist (`tests/bridges/orphan-dimensional-signature.test.ts`):
  added 16 to `ENCODED_RHS_IDS`.
- Index-level disposition pin (`tests/bridges-index.test.ts`): updated
  from `status === 'invalid'` to `status === 'speculative'` with
  `formula_latex === 'E_{\\min} = k_B T \\ln 2'`, documenting the
  Wave-Z-E reformulation.
- isActiveStatus filter test: BE-16 now INCLUDED in the active set.
- All three BE-16 known_issues: `fixable` changed from
  `'unfixable-must-mark-invalid'` to `'reformulation'`, with
  `[RESOLVED Wave Z-E reformulation 2026-05-11]` prefix in
  descriptions.

**Counts:**

- AST encodings: 37/40 → **38/40 active modules**.
- Test suite: 1092/1092 → **1114/1114 passing**.
- `EXPECTED_DIMENSION_BY_BRIDGE`: 37 → 38 entries.
- `status='invalid'` count: 2 → 1 (BE-16 reformulated; BE-37 next).

### Wave Z-D — AST encoding for BE-15 (Model A Kawasaki-Gunton coarsening) (2026-05-11)

Encodes BE-15 (Universal Emergence Equation — Hohenberg-Halperin
Model A) via the **late-stage coarsening scaling-law reduction**
identified by OpenAI o3 in a dedicated consultation (Wave Z-D, 2026-05-11).
This was previously flagged as "deferred grammar-extension" because the
full Model A Langevin equation requires Dirac-δ correlators, functional
δ-derivatives, and functional integration — none of which are in the
UPT AST grammar.

- **BE-15 Kawasaki-Gunton coarsening** (`be-15-emergence.ts`): encodes
  the squared-form relation

      L(t)² = Γ · t

  as an exact algebraic equality. Γ is the Model A kinetic coefficient
  with dim `[L² T⁻¹]`; t is time `[T]`; the product yields `[area]` =
  `[L²]` = dim(L²). The encoded `L(t)² = Γ·t` is the canonical
  Kawasaki-Gunton (1976) coarsening scaling for non-conserved order
  parameters in the linear (Allen-Cahn 1979) regime and in the scaling
  regime of the nonlinear theory. The z = 2 dynamic critical exponent
  distinguishes Model A from Model B (z ≈ 3, L ~ (Γt)^{1/3}) and Model
  H (fluid corrections).

  `dimensional_signature` null → `'[area]'`. Status `'speculative'`
  not lifted — Model A is canonical condensed-matter physics, but the
  bridge framing (Model A as the UPT microscale-↔-emergent bridge)
  remains the speculative element.

  Refs: Hohenberg-Halperin 1977 *Rev. Mod. Phys.* 49:435 (canonical
  critical-dynamics); Kawasaki-Gunton 1976 *Phys. Rev. A* 13:2294
  (original L ~ √Γt derivation); Allen-Cahn 1979 *Acta Metall.*
  27:1085; Bray 1994 *Adv. Phys.* 43:357 (canonical coarsening review);
  Chaikin-Lubensky 1995 textbook Ch. 8.

  **Why squared-form not root-form.** AST `^` requires dimensionless
  exponents; a non-integer power on a dimensionful base would require
  a `sqrt` primitive the grammar does not provide. The squared form is
  an exact algebraic equality whose dimensions check directly; the
  root `L(t) = √(Γt)` lives in the numerical evaluator
  `evaluateCoarseningLength`. Same precedent: BE-17 squared invariant.

  **Why Kawasaki-Gunton over alternatives** (per OpenAI o3 consultation):
  - **Equipartition `⟨|φ_k|²⟩ = k_BT/(Γω_k)`** is generic statistical
    mechanics (applies to any linearized field theory at equilibrium).
    Encoding it would mislabel BE-15 as generic stat-mech rather than
    Model A dynamics. Rejected.
  - **FDT amplitude `D = 2Γk_BT`** is just the noise-correlator
    coefficient; loses all dynamical content. Rejected.
  - **Equal-time correlation `C(r) ~ exp(-r/ξ)`** requires an exp-stub
    and a typed ξ symbol; acceptable alternative but Kawasaki-Gunton is
    more diagnostic of the z=2 dynamic critical exponent and matches
    the `microscale → emergent` bridge label directly.

  **Honest-claude scope notes:**
  - The encoded relation is the **late-stage asymptotic** coarsening
    law, exact in the Allen-Cahn linear regime and in the scaling
    regime of the nonlinear theory; for early-time transients and
    near-critical behavior, RG corrections (logarithms, anomalous
    dimensions) are not captured.
  - The full Langevin equation — gradient flow `-Γ δH/δφ`,
    FDT-balanced δ-correlated noise `⟨ζζ⟩ = 2Γk_BT δ(x-x')δ(t-t')`,
    and Landau-Ginzburg functional `H[φ] = ∫d³x [½(∇φ)² + V(φ)]` —
    remains outside the AST. Encoding it would require three grammar
    extensions (Dirac δ, functional δ-derivative, functional
    integration over field configurations).

**Catalog coordination:**

- `EXPECTED_DIMENSION_BY_BRIDGE` (`src/dimensional/bridge-check.ts`):
  added `[15, AREA]` with Wave-Z-D comment; AREA newly imported.
- `ENCODED_RHS` (`tests/bridges/dimensional-signature-catalog.test.ts`):
  added `{ id: 15, rhs: BE15_COARSENING_LENGTH_SQUARED_RHS }`.
- Cross-check map size pin (`tests/dimensional/bridge-check.test.ts`):
  bumped 36 → 37; updated id allowlist; commentary documents the
  OpenAI o3 consultation.
- Orphan allowlist (`tests/bridges/orphan-dimensional-signature.test.ts`):
  added 15 to `ENCODED_RHS_IDS` in numeric order.

**Counts:**

- AST encodings: 36/40 → **37/40 active modules**.
- Test suite: 1068/1068 → **1092/1092 passing**.
- `EXPECTED_DIMENSION_BY_BRIDGE`: 36 → 37 entries.

**Remaining gaps (final state):**

- **BE-28 (MEPP)**: deferred indefinitely per OpenAI o3 Wave-Z-D
  consultation. Onsager linear-response quadratic form encoding would
  mislabel MEPP — Onsager is uncontested established physics; MEPP's
  unique content is the *variational* claim that NESS maximizes σ
  subject to constraints, which requires variational-δ + Lagrange-
  multiplier + discrete-index-sum grammar primitives. MEPP itself is
  contested (Grinstein-Linsker 2007); a canonical scalar reduction
  doesn't exist.
- **BE-16, BE-37**: `status='invalid'` by design (BE-16 algebraically
  self-refuting; BE-37 Ellis-Uzan operationally meaningless). Not
  encodable.

**Final realistic ceiling: 37/40 active AST modules** without grammar
extensions. Reaching 38/40 would require a variational δ + Lagrange-
multiplier grammar extension (for MEPP); reaching the catalog total
of 40 is impossible without changing the `status='invalid'` design
decisions for BE-16 and BE-37, both of which are documented as
permanently un-encodable per their published critiques.

### Wave Z-C — AST encoding for BE-17 (Einstein-Cartan) and BE-44 (soft hair) scalar reductions (2026-05-07)

Encodes the two remaining bridges with closed-form scalar reductions
identified in the Wave-Z OpenAI consultation. Both encode SCALAR
REDUCTIONS of operator-valued original formulas — the field equations /
BMS charge themselves cannot be expressed in the UPT AST grammar.

- **BE-17 Einstein-Cartan squared-invariant reduction**
  (`be-17-einstein-cartan.ts`): encodes
  `S²_spin = (c⁴/(8πG))² · T_λμν T^λμν` — the squared norm of the
  spin angular-momentum density tensor obtained by inverting the EC
  algebraic torsion-spin coupling `T^λ_μν = (8πG/c⁴) S^λ_μν`. The
  contraction `T_λμν T^λμν` is encoded as a single typed-stub symbol
  `T_torsion_squared` with dim `[T²·L⁻⁴]` (the AST does not expand the
  index sum); the prefactor `(c⁴/(8πG))²` as a typed-stub
  `c4_over_8piG_squared` with dim `[M²·L²·T⁻⁴]`. Inferred RHS dim
  **`[L⁻² M² T⁻²]`** = (angular-momentum-density)². `dimensional_signature`
  null → `'[L^-2 M^2 T^-2]'`. Status `'speculative'` not lifted —
  encoding does NOT promote (the EC-as-UPT-bridge framing remains
  speculative; the canonical EC equations remain unchanged).

  Refs: Cartan 1922; Hehl-vonderHeyde-Kerlick-Nester 1976 (canonical
  EC review); Trautman 2006 (modern intro, arXiv:gr-qc/0606062);
  Shapiro 2002 (torsion review, arXiv:hep-th/0103093).

  **Honest-claude scope notes:**
  - This is a SCALAR INVARIANT of the EC torsion-spin coupling, NOT
    the full field equations. The Einstein equation
    `R_μν − ½R g_μν + Λ g_μν = (8πG/c⁴) T_μν`, the metric, the
    cosmological term, and the rank-3 torsion index structure all
    remain absent from the AST.
  - The contraction-stub idiom (single typed symbol absorbing an
    unexpressible index sum) is the analog of BE-46's `exp_factor` for
    tensors. Same precedent.

- **BE-44 Soft Hair L²-norm reduction** (`be-44-soft-hair.ts`):
  encodes `Q_soft² = ∫(∂_u C)² du` — the L²-norm of the news at null
  infinity, obtained as the squared-norm of the original BMS
  supertranslation charge. Uses the AST's `integral` primitive (same
  machinery as BE-26's WKB exponent). News tensor `∂_u C` typed as
  `[velocity]` (the L²-norm conventionally interprets the asymptotic
  shear in canonical SI units); squared news `[L² T⁻²]`; integral
  over u-direction `[T]` yields **`[L² T⁻¹]`**.
  `dimensional_signature` null → `'[L^2 T^-1]'`. Status `'speculative'`
  not lifted.

  Refs: Hawking-Perry-Strominger 2016 (arXiv:1601.00921; original
  soft-hair proposal); Hawking-Perry-Strominger 2017 (arXiv:1611.09175;
  BMS supertranslation details); Bondi-vanderBurg-Metzner 1962
  (foundational BMS paper); Strominger 2014 (arXiv:1312.2229);
  Strominger 2018 lecture notes (arXiv:1703.05448).

  **Honest-claude scope notes:**
  - The original BE-44 formula
    `Q_soft^± = ∫_{𝒤^±} ∂_u C_{zz̄} Y^z dz∧dz̄` is operator-valued
    (C is a field, Y^z a BMS parameter; the celestial-2-sphere
    geometry is non-trivial). The encoded L²-reduction integrates
    only over the u-direction with the (dimensionless under
    stereographic conventions) celestial-2-sphere absorbed implicitly.
  - The BMS supertranslation parameter Y^z is dropped — the
    L²-norm extracts the integrated `(news)²` content but loses the
    BMS-charge structure.
  - Numerical evaluator uses trapezoidal quadrature (O(du²) on uniform
    grid), not exact integration. Rejects empty / sub-2 / non-finite
    samples and non-positive du.

**Catalog coordination:**

- `EXPECTED_DIMENSION_BY_BRIDGE` (`src/dimensional/bridge-check.ts`):
  added `[17, SPIN_DENSITY_SQUARED]` and `[44, SOFT_HAIR_L2_SQUARED]`
  with local dim consts.
- `ENCODED_RHS` (`tests/bridges/dimensional-signature-catalog.test.ts`):
  added BE-17 and BE-44 entries.
- Cross-check map size pin (`tests/dimensional/bridge-check.test.ts`):
  bumped 34 → 36; updated id allowlist; added per-bridge BE-17
  positive/negative cross-check block.
- Orphan allowlist (`tests/bridges/orphan-dimensional-signature.test.ts`):
  added 17 and 44 to `ENCODED_RHS_IDS`.

**Counts:**

- AST encodings: 34/40 → **36/40 active modules**.
- Test suite: 1019/1019 → **1068/1068 passing**.
- `EXPECTED_DIMENSION_BY_BRIDGE`: 34 → 36 entries.

**Remaining gaps (the realistic ceiling discussion):**

- **BE-15** (Hohenberg-Halperin Model A): deferred indefinitely.
  Requires grammar extensions for (a) Dirac-delta correlators
  `⟨ζζ⟩ ∝ δ(x-x')δ(t-t')`, (b) functional derivatives `δH/δφ`, and
  (c) functional integration `∫ d³x [...]` over field configurations.
  Partial scalar reductions (FDT amplitude `2Γk_BT`, MSD asymptotic)
  are dimensionally encodable but physics-losing and not canonical.
- **BE-28** (MEPP): deferred indefinitely. Requires grammar extensions
  for (a) variational δ-operator over functionals, (b) Lagrange
  multipliers, (c) discrete-index sum `Σ_i J_i X_i`. MEPP itself is a
  contested principle (Grinstein-Linsker 2007 rebuttal), so the
  canonical scalar to encode is itself unsettled.
- **BE-16, BE-37**: `status='invalid'` by design. Not encodable.
  BE-16 is algebraically self-refuting; BE-37 (VSL) is operationally
  meaningless per Ellis-Uzan 2005.

**Final state:** 36/40 active AST modules is the realistic ceiling
without grammar extensions. Reaching 38/40 would require adding
δ-correlator and variational/multiplier primitives — a substantial
grammar extension worth its own future wave.

### Wave Z-B — AST encoding for BE-25 IIT inner intrinsic information (2026-05-07)

Re-encodes BE-25 (Consciousness ↔ Information Integration) under the
Wave P-D R-D2 IIT reformulation. Wave Q B2 had archived the legacy
Penrose-Hameroff AST `be-25-orch-or.ts` when the bridge was reformulated
to IIT Φ_max; the bridge has been carrying `dimensional_signature: null`
since. Wave Z-B closes the gap with a new AST module encoding the
**inner** intrinsic-information form (the kernel the MIP minimizes).

- **BE-25 IIT inner intrinsic information** (`be-25-iit-phi.ts`):
  encodes `ii(s, s̃) = p(s̃|s) · log₂[p(s̃|s) / p(s̃)]` as DIMENSIONLESS
  via the log-stub idiom. `BE25_LOG2_FACTOR` is a fresh dimensionless
  symbol stub for `log₂(...)`; `BE25_LOG_RATIO_ARG` exposes the
  argument `p_cond / p_marg` for the per-bridge dimensionless-argument
  lemma test (same pattern as BE-45's `BE45_LOG_RATIO_ARG_MP_HINF`).
  `BE25_P_CONDITIONAL` and `BE25_P_MARGINAL` are exposed as lemma
  nodes for direct introspection. `dimensional_signature` null →
  `'[1]'`; ii has units of *bits* when log₂ is used, which is a
  pseudo-unit not in the SI 7-base system and types as DIMENSIONLESS.
  `tractability_class` retained `'numerical-asymptotic'` (Wave Q B1 —
  Φ_max is EXPTIME in substrate size, but each ii(s,s̃) evaluation is
  constant-time). Status `'speculative'` is **not lifted** — IIT
  itself is calculable, but the bridge framing (consciousness ↔
  maximally-integrated information) is contested by Aaronson 2014 and
  Doerig 2019.

  Refs: Tononi 2008; Oizumi-Albantakis-Tononi 2014 IIT 3.0;
  Albantakis et al. 2023 IIT 4.0 (arXiv:2212.14787); Aaronson 2014
  contested-framework critique; Doerig et al. 2019 unfolding-argument
  critique.

  **Honest-claude deferrals:**
  - The outer MIP minimization
    `Φ_max(S) = min_{θ ∈ partitions(S)} [ii − ii_θ]` is **deferred
    grammar-extension** — the UPT AST has no `min`-over-discrete-
    index-set primitive. Same status as BE-15 (stochastic noise) and
    BE-28 (Lagrange multipliers). Encoding the inner ii(s,s̃) kernel
    resolves the dimensional-signature gap; encoding the full Φ_max
    requires extending the AST grammar with a `min` primitive.
  - The partition-conditional `ii_θ(s, s̃)` lemma is not encoded
    (deferred with the MIP).

  **User-confirmed design choice:** the numerical evaluator
  `evaluateIntrinsicInformation` enforces Shannon's
  `0 · log(0/anything) = 0` limit (the canonical
  Oizumi-Albantakis-Tononi 2014 convention) and rejects the
  KL-divergence singularity `p_cond > 0 with p_marg = 0`
  (impossible-joint-event) with RangeError. Confirmed via
  `AskUserQuestion` before encoding.

  The legacy Penrose-Hameroff AST module `be-25-orch-or.ts` remains
  archived (Wave Q B2) for historical traceability. Its archive-
  regression test `tests/bridges/be-25-encoding.test.ts` was updated
  to pin the new `dimensional_signature: '[1]'`. New test file
  `tests/bridges/be-25-iit-encoding.test.ts` covers 26 cases (index
  invariants, dimensional validation, numerical evaluation with
  edge cases, input validation).

**Catalog coordination:**

- `EXPECTED_DIMENSION_BY_BRIDGE` (`src/dimensional/bridge-check.ts`):
  add `[25, DIMENSIONLESS]` with Wave-Z-B comment.
- `ENCODED_RHS` (`tests/bridges/dimensional-signature-catalog.test.ts`):
  add `{ id: 25, rhs: BE25_INTRINSIC_INFORMATION_RHS }`.
- Cross-check map size pin (`tests/dimensional/bridge-check.test.ts`):
  bumped 33 → 34; updated id allowlist; removed legacy
  `has(25) === false` sentinel.
- Orphan allowlist (`tests/bridges/orphan-dimensional-signature.test.ts`):
  BE-25 was already in `ENCODED_RHS_IDS` (placeholder from earlier
  wave); no edit needed.

**Counts:**

- AST encodings: 33/40 → **34/40 active modules** (Wave Z-A 33 + BE-25
  Wave Z-B 1).
- Test suite: 992/992 → **1019/1019 passing**.
- `EXPECTED_DIMENSION_BY_BRIDGE`: 33 → 34 entries.

**Remaining gaps:**

- Wave Z-C (next): BE-17 Einstein-Cartan quadratic invariant
  `S² = (c⁴/(8πG))² · T_λμν T^λμν` (typed energy-density-squared dim);
  BE-44 supertranslation soft-hair charge
  `Q_soft² = ∫(∂_u C)² dμ` via integral primitive.
- Realistic ceiling: 36/40 after Wave Z-C lands; 38/40 if BE-15
  stochastic-noise grammar extension and BE-28 Lagrange-multiplier
  grammar extension are added in a future wave.
- Excluded by design: BE-16 algebraically self-refuting, BE-37
  Ellis-Uzan operationally-meaningless. Both remain `status='invalid'`.

### Wave Z-A — AST encoding for 4 OpenAI-proposed dimensionless reductions (2026-05-07)

Pre-Wave-Z status: 29/40 bridges AST-encoded (Wave Y). The remaining 11
were dispositioned as: 8 "truly unencodable" (BE-15, 17, 28, 32, 35, 44,
46, 50), 2 status='invalid' by design (BE-16, BE-37), and BE-25 IIT
(deferred — encodable as inner ii-form but the MIP `min` is grammar-
extending).

For the 8 unencodable bridges, OpenAI (o3-mini) proposed scalar reductions;
Gemini-Pro independently confirmed the proposals after the
mcp-host:llm-gemini server's max_output_tokens / thinking-budget bug was
patched in `llm-providers-mcp@5440ad6`. Wave Z-A applies the 4 simplest
DIMENSIONLESS reductions; Wave Z-B (BE-25 IIT) and Wave Z-C (BE-17
quadratic invariant + BE-44 supertranslation charge integral) follow.
BE-15 and BE-28 remain deferred — both require grammar extensions
(stochastic noise; Lagrange multipliers).

- **BE-32 Quantum Reference Frames**: original integral form
  `|ψ⟩_B = ∫ dg U(g) |ψ⟩_A ⊗ |g⟩_frame` is operator-valued and formally
  divergent for non-compact groups. Encoded scalar reduction (Wave Z):
  the Born-rule overlap probability
  `P_overlap = |⟨ψ_A|U(g)|ψ_B⟩|² = c² + s²` for a single (implicit)
  group element g. New module
  `src/bridges/equations/be-32-quantum-reference-frame.ts` with `c²`
  and `s²` lemma exports, `evaluateQRFOverlap` numerical evaluator
  (Born-rule `> 1+ε` guard), and `validateBE32Dimensions`.
  `dimensional_signature` null → `'[1]'`. `tractability_class` lifted
  `'formally-divergent'` → `'closed-form'`.
  Refs: Giacomini-Castro-Ruiz-Brukner 2019; Vanrietvelde et al. 2020;
  Bartlett-Rudolph-Spekkens 2007.

- **BE-35 Conformal Bootstrap**: original 4-pt-function expansion
  `⟨O₁O₂O₃O₄⟩ = Σ_{Δ,ℓ} C₁₂^O C₃₄^O g_{Δ,ℓ}(u,v)` is operator-valued.
  Encoded reduction: crossing-symmetry residual
  `R_cross = C²·[g_block(u,v) − g_block(v,u)]` which is identically zero
  at the crossing-symmetric point u=v=1/4 for any consistent CFT. New
  module `src/bridges/equations/be-35-conformal-bootstrap.ts` with
  forward and crossed-block lemmas, `evaluateCrossingResidual`, and
  `validateBE35Dimensions`. `dimensional_signature` null → `'[1]'`.
  Honest-claude scope: single-block reduction (real bootstrap sums
  infinite (Δ,ℓ) tower with positivity / unitarity constraints — that
  spectrum-fitting is the load-bearing numerical content of bootstrap
  papers and is NOT captured here); conformal-block functions encoded
  as dimensionless symbol stubs (no hypergeometric-function AST node).
  Refs: Rattazzi-Rychkov-Tonni-Vichi 2008; Poland-Rychkov-Vichi 2019;
  Dolan-Osborn 2001; Kos-Poland-Simmons-Duffin 2014.

- **BE-46 Multiverse Measure Problem**: original path-integral form
  `P[O] = ∫dμ[g,φ] W[g,φ] δ(O − O[g,φ])` is formally divergent (the
  measure problem is the entry's own subject). Encoded scalar reduction
  (Wave Z): the Weinberg-Vilenkin anthropic probability
  `P(Λ) = A · exp(−α/Λ)` for a cosmological-constant-like landscape
  parameter Λ. New module
  `src/bridges/equations/be-46-multiverse-measure.ts` with exp-argument
  lemma (`(0 − α)/Λ` dimensionless), exp-factor stub, normalization,
  `evaluateWeinbergVilenkinP` (rejects Λ ≤ 0), and
  `validateBE46Dimensions`. `dimensional_signature` null → `'[1]'`.
  `tractability_class` lifted `'formally-divergent'` → `'closed-form'`
  for the encoded scalar; original path-integral form remains formally
  divergent (the 'highly-speculative' status reflects this and is NOT
  lifted by the AST encoding — pinning a Tier-5 AST does not promote
  the bridge framing). Refs: Vilenkin 1995; Weinberg 1987; Linde-Linde-
  Mezhlumian 1994; Garriga-Vilenkin 2001; Freivogel 2011.

- **BE-50 Wheeler-Feynman absorber**: Wave P-A canonical form
  `A_μ(x) = (1/2)[A_μ^ret(x) + A_μ^adv(x)]` preserved in formula_latex.
  Encoded scalar reduction (Wave Z): time-symmetry residual
  `r_TS = (A_ret − A_adv)/(A_ret + A_adv)` — vanishes identically (≡ 0)
  under the absorber boundary condition. New module
  `src/bridges/equations/be-50-wheeler-feynman.ts` with `A_ret`, `A_adv`
  pinned to magnetic-vector-potential dim `{L:1, M:1, T:-2, I:-1}` (V·s/m);
  numerator / denominator / residual lemma exports;
  `evaluateWFTimeSymmetry` (rejects denominator = 0); and
  `validateBE50Dimensions`. `dimensional_signature` null → `'[1]'`.
  `tractability_class` lifted `'numerical-tractable'` → `'closed-form'`.
  Status remains 'highly-speculative' (absorber boundary condition
  empirically untested in QFT). Refs: Wheeler-Feynman 1945, 1949;
  Cramer 1986; Hoyle-Narlikar 1995.

- **`EXPECTED_DIMENSION_BY_BRIDGE` extended** with `[32, DIMENSIONLESS]`,
  `[35, DIMENSIONLESS]`, `[46, DIMENSIONLESS]`, `[50, DIMENSIONLESS]`.
  Map size pin: 29 → 33.

- **`tests/bridges/dimensional-signature-catalog.test.ts`** ENCODED_RHS
  entries added for BE-32, 35, 46, 50; round-trip
  `format(infer(rhs)) === entry.dimensional_signature` now covers 33
  encoded modules.

- **AST encoding count**: 29 → **33** active modules. Remaining encodable
  bridges: BE-25 (Wave Z-B), BE-17 (Wave Z-C quadratic invariant), BE-44
  (Wave Z-C supertranslation-charge integral). BE-15 (stochastic) and
  BE-28 (Lagrange-multiplier stationarity) remain deferred as
  grammar-extending. BE-16 and BE-37 remain status='invalid' by design
  (algebraically self-refuting / operationally meaningless per
  Ellis-Uzan 2005); they are NOT candidates for AST encoding.

- **External LLM second-opinion validation**: OpenAI o3-mini proposed
  the 8 reductions; Gemini 2.5 Pro independently confirmed all 4
  Wave-Z-A reductions as physically meaningful and AST-grammar-compliant
  (verdicts captured in per-bridge `notes` fields).

### Wave Y — BE-17 deferred (honest-claude documented defer; 2026-05-07)
- **BE-17 (Einstein-Cartan torsion-spin coupling) reformulation deferred** in Wave Y. The Einstein-Cartan equations have rank-3 torsion `T^λ_μν` and rank-3 spin-density `S^λ_μν` tensor structures whose canonical scalar reductions all require committing to a specific spin-source profile that goes beyond what a Wave-Y-style "trace and encode" reformulation can defensibly do without research-level physics judgment:
  - The naive trace `T_α := T^αβ_β = (8πG/c⁴) S^αβ_β` is canonical only for specific spin-source models (e.g., Dirac fields), not as a general EC identity.
  - The vacuum-spinless limit (`S = 0`) collapses EC to vacuum GR (`R = 4Λ`), which would make BE-17 identical to BE-13's vacuum case — duplicative.
  - Encoding `|T|² = (8πG/c⁴)² |S|²` as a scalar magnitude relation requires choosing an `|S|²` definition (Killing vs Frobenius vs Hodge norm) which is a framework decision.
- **Per the Wave Y task spec's honest-claude defer clause** ("if any of the 11 reformulations turns out to require physics judgment beyond the canonical-form choice (e.g., BE-17 EC trace if it gets too messy), defer that one with a documented honest note. Don't force."), BE-17 is left at its current Wave P-B R-B3 reformulated state (Einstein-Cartan field equations + algebraic torsion-spin coupling preserved as the canonical formula_latex; dimensional_signature null; tractability_class numerical-tractable). The Wave Y AST-encoding of BE-17 is deferred to a future wave that commits to a specific spin-source profile (e.g., Dirac torsion BE-17a, Maxwell-torsion BE-17b separate entries).

### Wave Y — BE-36 reformulated to GW170817 graviton-speed bound + Tier-5 AST encoding (2026-05-07)
- **BE-36 reformulated**: replaced the operator-valued TeVeS action `S = S_g + S_φ + S_A + S_matter` (Bekenstein 2004; AST-unencodable without committing to a bulk geometry) with the canonical GW170817 dimensionless graviton-photon speed bound `|c_GW − c|/c ≤ 10⁻¹⁵` (Abbott et al. 2017 *ApJ Lett.* 848:L13, arXiv:1710.05832; Boran et al. 2018 *Phys. Rev. D* 97:041501). The TeVeS framework is preserved as bridge framing.
- **BE-36 encoded as 29th active AST module** at `src/bridges/equations/be-36-gw-speed-bound.ts`. Form: signed dimensionless ratio `(c_GW − c)/c`, with absolute-value bound check via `satisfiesGW170817Bound` numerical helper. SI dimension: `[1]`. `GW170817_SPEED_BOUND` constant exported as 1e-15.
- **Bracket-checks**: GR limit (c_GW = c) → ratio = 0; small deviations within bound → satisfiesBound = true; deviations at 10⁻¹⁰ scale → fail bound; signed-symmetric (positive and negative deviations both checked); linearity at small Δ.
- **`tractability_class` lifted** 'numerical-tractable' → 'closed-form'.
- **17-test encoding spec**: catalog round-trip, dimensional structure, 8 numerical bracket-checks, 2 input-validation tests.
- **`be-36-reformulation.test.ts` updated**: TeVeS-action assertions replaced with GW170817-bound assertions; tractability_class assertion changed.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[36, DIMENSIONLESS]`. Map size pin 28 → 29.
- **29 active AST encodings** total: BE-11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24, 26, 27, 29, 30, 31, 33, 34, 36, 38, 39, 40, 41, 42, 43, 45, 47, 48, 49.

### Wave Y — BE-27 reformulated to Cugliandolo-Kurchan effective-temperature scalar + Tier-5 AST encoding (2026-05-07)
- **BE-27 reformulated**: replaced the operator-valued FDT-violation correlator `χ(ω) = (1/(k_BT_eff(ω))) ∫dt e^iωt ⟨δF δx⟩ + Σ_active(ω)` with the canonical Cugliandolo-Kurchan scalar effective temperature `T_eff = T·(1 + Σ_active/(k_B T))` (Cugliandolo-Kurchan 1993 *J. Phys. A* 26:L401; Cugliandolo 2011 review). Full FDT-violation correlator preserved as bridge framing.
- **BE-27 encoded as 28th active AST module** at `src/bridges/equations/be-27-effective-temperature.ts`. Form: `T_eff = T · (1 + Σ_active/(k_B T))`. SI dimension: `[temperature]`. Bracket: passive equilibrium (Σ_active=0) → T_eff = T; Σ_active = k_B T → T_eff = 2T; linearity in Σ_active.
- **`tractability_class` lifted** 'numerical-tractable' → 'closed-form'.
- **18-test encoding spec**: catalog round-trip, dimensional structure, 7 numerical bracket-checks (passive limit, k_BT-scaling, linearity, cooling regime with negative Σ, identity, T-rescaling), 2 input-validation tests.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[27, TEMPERATURE]`. Map size pin 27 → 28.
- **28 active AST encodings** total.

### Wave Y — BE-18 reformulated to Higgs-like Yukawa-VEV mass + Tier-5 AST encoding (2026-05-07)
- **BE-18 reformulated**: replaced the full non-Abelian dark-sector Lagrangian density `L_dark = -(1/4)G^a G^aμν + |D_μΦ|² + ψ̄(...)ψ - V(|Φ|)` (rank-2 tensor + spinor structure unencoded by AST validator; dim_sig was [L^8 M^4 T^-8] = energy^4) with the canonical scalar Yukawa-VEV mass-generation relation `m_dark = g_dark · v_dark` (Peskin-Schroeder §20.1 textbook fermion-mass mechanism). Full Lagrangian preserved as bridge framing / context.
- **BE-18 encoded as 27th active AST module** at `src/bridges/equations/be-18-higgs-mass.ts`. Form: `m_dark = g_dark · v_dark`. SI dimension changed `[L^8 M^4 T^-8]` (Lagrangian density) → `[energy]` (mass in natural units, particle-physics convention). Bracket: SM top-quark m_t ≈ 173 GeV with y_t ≈ 0.99, v_EW = 246 GeV/√2 = 174 GeV → m_t = 0.99·174 ≈ 172 GeV ✓ within 1% of measured value; SM electron y_e ≈ 2.94e-6 → m_e ≈ 0.511 MeV.
- **`tractability_class` lifted** 'numerical-tractable' → 'closed-form'.
- **17-test encoding spec**: catalog round-trip (status, formula_latex pinning m·g·v form and absence of Lagrangian tokens, Peskin-Schroeder reference), dimensional structure, 8 numerical bracket-checks (SM top, SM electron, zero-coupling/zero-VEV, linearity in g/v, full identity, signed coupling), 2 input-validation tests.
- **`be-18-fix.test.ts` updated** from R1-audit-era Lagrangian-form regression to Wave Y archive (formula_latex now scalar mass relation; full Lagrangian assertions removed).
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[18, ENERGY]`. Map size pin 26 → 27. `ORPHAN_DIMENSIONAL_SIGNATURES` reduced from {18} to {} — all dimensional_signatures now AST-backed. Direction-1 test gets a sentinel `expect(ORPHAN_DIMENSIONAL_SIGNATURES.size).toBe(0)` since the for-loop over an empty set produces no test.
- **27 active AST encodings** total: BE-11, 12, 13, 14, 18, 19, 20, 21, 22, 23, 24, 26, 29, 30, 31, 33, 34, 38, 39, 40, 41, 42, 43, 45, 47, 48, 49.

### Wave Y — BE-30 FLM first-law encoded as Tier-5 AST module (2026-05-07)
- **BE-30 encoded as 26th active AST module** at `src/bridges/equations/be-30-flm-first-law.ts`. Form: `δS_EE(R) = δ⟨H_R⟩` (FLM linear-response identity, Faulkner-Lewkowycz-Maldacena 2013 *JHEP* 11:074, arXiv:1307.2892). SI dimension: `[1]` (dimensionless, nats convention).
- **Honest-claude tautology disclosure**: the FLM identity is tautological at the linear-response level (δS_EE/δ⟨H_R⟩ = 1 by construction). The encoding pins the dimensional structure and the scalar relation; the bracket-check tests verify only the trivial linear-response identity, not a non-trivial physical prediction.
- **Bekenstein bound secondary cross-check**: `evaluateBekensteinBound({R_m, E_J})` returns `S ≤ 2π R E / (ℏc)` (Bekenstein 1981 *Phys. Rev. D* 23:287) as a non-trivial physical magnitude check. 1 J in 1 m region → ≈2×10²⁶ nats upper bound.
- **`tractability_class` lifted** 'numerical-tractable' → 'closed-form'.
- **15-test encoding spec**: catalog round-trip, dimensional structure, 3 FLM linear-response checks (tautology, equilibrium, linearity), 4 Bekenstein bound checks (textbook magnitude, R-linearity, E-linearity, positivity), 3 input-validation tests.
- **`be-30-reformulation.test.ts` updated** for the lifted tractability_class.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[30, DIMENSIONLESS]`. Map size pin 25 → 26.
- **26 active AST encodings** total: BE-11, 12, 13, 14, 19, 20, 21, 22, 23, 24, 26, 29, 30, 31, 33, 34, 38, 39, 40, 41, 42, 43, 45, 47, 48, 49.

### Wave Y — BE-13 reformulated to scalar trace of Einstein equations + Tier-5 AST encoding (2026-05-07)
- **BE-13 reformulated**: replaced the full tensor Einstein equation `R_μν - (1/2)R g_μν + Λ g_μν = (8πG/c⁴) T_μν` (rank-2 tensor structure unencoded by the AST validator) with its canonical scalar trace `R = 4Λ - (8πG/c⁴) T` (g^μν contraction; MTW §17.4; Carroll §4.7). The Jacobson 1995 thermodynamic-origin information-physics framing is preserved as the bridge framing; the trace is the AST-encodable scalar.
- **BE-13 encoded as 25th active AST module** at `src/bridges/equations/be-13-einstein-trace.ts`. Form: `R = 4Λ - (8πG/c⁴)T`. SI dimension: `[L^-2]` (Ricci scalar; same as BE-31). Hand-built `RICCI_SCALAR_DIM` literal (not `power(LENGTH, -2)`) to avoid the `-0` deep-equality issue (same pattern as BE-23 RESISTIVITY, BE-31 INV_LENGTH_2).
- **`tractability_class` lifted** 'numerical-tractable' → 'closed-form' (the trace is a single algebraic relation given (Λ, T)).
- **15-test encoding spec**: catalog round-trip (status, formula_latex, Wave Y notes), dimensional structure, 7 numerical bracket-checks (vacuum R=0, pure-CC R=4Λ, matter-dominance T·c² scaling, linearity in Λ and T independently, superposition R(Λ,T) = R(Λ,0) + R(0,T), full algebraic identity), 2 input-validation tests.
- **`be-13-reformulation.test.ts` updated**: formula_latex assertion broadened to accept either tensor or scalar form (both content-equivalent under contraction); tractability_class assertion changed 'numerical-tractable' → 'closed-form'.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[13, INV_LENGTH_2]` (reuses the BE-31 literal). Map size pin 24 → 25.
- **25 active AST encodings** total: BE-11, 12, 13, 14, 19, 20, 21, 22, 23, 24, 26, 29, 31, 33, 34, 38, 39, 40, 41, 42, 43, 45, 47, 48, 49.

### Wave Y — BE-20 reformulated to observed cosmological-constant mass density + Tier-5 AST encoding (2026-05-07)
- **BE-20 reformulated**: replaced the formally-divergent vacuum-fluctuation integral `ρ_vac = ρ_0 + ∫d³k (ℏω_k/2)·ζ(k/k_UV)` (which produces the famous 10¹²⁰-discrepancy cosmological-constant problem) with the canonical FRW observed-CC relation `ρ_Λ = c²Λ/(8πG)` (Carroll 2001 *Living Rev. Relativity* 4:1, arXiv:astro-ph/0004075). The cosmological-constant problem itself is preserved as the famous unfixed problem in known_issues; the Wave Y reformulation does NOT solve it, only encodes the observed scalar that the problem is *about*.
- **BE-20 encoded as 24th active AST module** at `src/bridges/equations/be-20-vacuum-energy.ts`. Form: `ρ_Λ = c²Λ/(8πG)`. SI dimension: `[L^-3 M]` (mass density, kg/m³; `[c²Λ] = T⁻²` and `[1/G] = MT²L⁻³`, product = ML⁻³). Default Λ = 1.1×10⁻⁵² m⁻² (Planck 2018).
- **Bracket-check**: with default Λ, ρ_Λ ≈ 5.9×10⁻²⁷ kg/m³ matching the observed dark-energy mass density (~70% of present-day critical density). Energy-density form ρ_Λc² ≈ 7×10⁻¹⁰ J/m³ recoverable as the alternate convention.
- **`tractability_class` lifted** from 'formally-divergent' to 'closed-form' (the observed-CC form is a single algebraic relation given Λ).
- **20-test encoding spec**: catalog round-trip (status, formula_latex pinning Λ/c²/(8πG) form and absence of ∫d³k integral, Carroll/Planck references, CC problem preserved in known_issues), dimensional structure, 7 numerical bracket-checks (canonical Planck 2018 value, Λ=0 zero-density, linearity in Λ, algebraic identity, positivity, energy-density alternate ≈7×10⁻¹⁰ J/m³), 2 input-validation tests.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[20, MASS_DENSITY]` (new `[L^-3 M]` literal in bridge-check.ts). Map size pin 23 → 24.
- **References overhauled**: dropped off-topic arXiv:1402.5674 / 1509.07876 (Susskind complexity-volume; not BE-20 content); added Carroll 2001 review, Weinberg 1989 CC problem, Planck 2020 measurement, Riess 1998 / Perlmutter 1999 supernova-acceleration.
- **24 active AST encodings** total: BE-11, 12, 14, 19, 20, 21, 22, 23, 24, 26, 29, 31, 33, 34, 38, 39, 40, 41, 42, 43, 45, 47, 48, 49.

### Wave Y — BE-48 reformulated to canonical mass-amplified GRW rate + Tier-5 AST encoding (2026-05-07)
- **BE-48 reformulated**: replaced the full GRW Lindblad master equation `dρ/dt = -(i/ℏ)[H,ρ] + λ ∫d³x [L_x ρ L_x† - (1/2){L_x† L_x, ρ}]` (operator-valued, no clean scalar AST encoding) with the canonical CSL mass-amplified scalar localization rate `λ_GRW(m) = λ_0 · (m/m_0)`. The Lindblad master equation is preserved as the bridge framing / context; the scalar rate is the AST-encoded bridge content (parallel to BE-11 encoding only the Caldeira-Leggett rate γ_k(λ), not the full Lindblad master equation).
- **Status downgraded** 'established' → 'speculative': consistent with the BE-22 / BE-26 / BE-38 precedent (canonical math, bridge framing speculative). The rate formula is canonical CSL physics; using GRW / CSL mass-amplification as a UPT quantum-foundations bridge is the speculative element.
- **BE-48 encoded as 23rd active AST module** at `src/bridges/equations/be-48-grw-localization.ts`. Form: `λ_GRW(m) = λ_0 · (m/m_0)`. SI dimension: `[frequency]` (was orphan; now AST-backed). λ_0 default = 1×10⁻¹⁶ /s (canonical 1986 GRW value); m_0 default = nucleon mass 1.67×10⁻²⁷ kg.
- **Bracket-checks**: single-nucleon m=m_0 → λ=λ_0; electron → ≈5×10⁻²⁰ /s; macroscopic 1 g → ≈6×10⁷ /s (rapid collapse, no Schrödinger-cat states).
- **18-test encoding spec**: catalog round-trip (status 'speculative', formula_latex, references, notes), dimensional structure, 8 numerical bracket-checks (single-nucleon textbook, electron, macroscopic-rapid-collapse, linearity in m / m_0 / λ_0, λ_0=0 zero-rate), 4 input-validation tests.
- **`be-48-fix.test.ts` updated** from R0-audit-era Lindblad-form regression to Wave Y archive: assertions pin the post-reformulation scalar-rate form while preserving R0-audit history (GRW 1986 references retained). Status assertion changed 'established' → 'speculative'.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[48, FREQUENCY]`. Map size pin 22 → 23. `ORPHAN_DIMENSIONAL_SIGNATURES` reduced from {18, 48} to {18}.
- **23 active AST encodings** total: BE-11, 12, 14, 19, 21, 22, 23, 24, 26, 29, 31, 33, 34, 38, 39, 40, 41, 42, 43, 45, 47, 48, 49.

### Wave Y — BE-42 reformulated to canonical Hawking temperature + Tier-5 AST encoding (2026-05-07)
- **BE-42 reformulated**: replaced the firewall complement-principle quantum-state superposition `|ψ⟩ = α|smooth⟩ + β|firewall⟩` (an AST-unencodable Hilbert-space decomposition without operational predictive content) with the canonical Hawking 1975 temperature `T_H = ℏc³/(8π G M k_B)` — the temperature scale at which the firewall paradox lives. The bridge framing (firewall paradox / information paradox resolutions) is preserved as the speculative element documented in known_issues.
- **BE-42 encoded as 22nd active AST module** at `src/bridges/equations/be-42-hawking-temperature.ts`. Form: `T_H = ℏc³/(8π G M k_B)`. SI dimension: `[temperature]`. Numerical bracket: solar-mass BH (M ≈ 1.989×10³⁰ kg) → T_H ≈ 6.17×10⁻⁸ K (textbook Hawking temperature for stellar-mass BH per Wald §14.3.7).
- **18-test encoding spec**: catalog round-trip (status 'highly-speculative', formula_latex, references, notes), dimensional structure (LHS/RHS [temperature]), 8 numerical bracket-checks (solar-mass textbook value, inverse-mass scaling at multiple factors, Planck-mass T_H/T_Planck = 1/(8π) algebraic identity, supermassive-BH ~10⁻¹⁷ K, mini-BH evaporation regime, full algebraic identity, positivity), 2 input-validation tests.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[42, TEMPERATURE]`. Map size pin 21 → 22.
- **22 active AST encodings** total: BE-11, 12, 14, 19, 21, 22, 23, 24, 26, 29, 31, 33, 34, 38, 39, 40, 41, 42, 43, 45, 47, 49.

### Wave Y — BE-29 reformulated to canonical Jarzynski free-energy equality + Tier-5 AST encoding (2026-05-07)
- **BE-29 reformulated**: replaced the curved-spacetime gravity-extension form `⟨exp(-βW)⟩ = exp(-βΔF) · exp(-(β/2c⁴) ∫T^μν δg_μν √(-g) d⁴x)` (gravity-correction integral is operator-valued + AST-unencodable) with the canonical Jarzynski 1997 equality `ΔF = -k_B T ln⟨exp(-W/(k_B T))⟩`. The bridge framing (Jarzynski extension to gravitational work, the original BE-29 motivation) is preserved as the speculative element documented in known_issues; the pure Jarzynski equality is the canonical scalar bridge content. Status remains 'speculative' (gravity-extension framing is the speculative element).
- **BE-29 encoded as 21st active AST module** at `src/bridges/equations/be-29-jarzynski.ts`. Form: `ΔF = -k_B T · ln⟨exp(-βW)⟩`. SI dimension: `[energy]` (was orphan; now backed by AST). Numerical evaluator estimates ⟨exp(-βW)⟩ from a sample of work values; bracket-checks include the equilibrium identity `ΔF = W_rev` when all samples are at the reversible work value.
- **Exp/ln stub pattern** (same as BE-26, BE-41, BE-45): `⟨exp(-βW)⟩` is encoded as a single dimensionless symbol stub `'ln_avg_exp_minus_betaW'`; the exp argument `β·W = W/(k_B T)` is exposed as a separate ExprNode (`BE29_BETAW_ARG`) for direct dimensionlessness verification.
- **20-test encoding spec**: catalog round-trip, dimensional structure (LHS/RHS [energy], exp-arg lemma dimensionless), 7 numerical bracket-checks (reversible-work limit `ΔF = W_rev`, constant-work invariant, zero-work identity, Jensen inequality `ΔF ≤ ⟨W⟩` second-law constraint, T-scaling at fixed β·W, shift linearity), 3 input-validation tests.
- **`be-29-fix.test.ts` updated** from R1-audit-era gravity-form regression (Hilbert action variation, √(-g), T^μν tokens) to Wave Y archive: assertions now pin the post-reformulation pure-Jarzynski form while preserving the audit-trail history (R1 audit notes, MTW/Wald references retained as historical gravity-extension framing context).
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[29, ENERGY]`. Map size pin 20 → 21. `ORPHAN_DIMENSIONAL_SIGNATURES` reduced from {18, 29, 48} to {18, 48} since BE-29 now has an AST module. Catalog round-trip + orphan-signature tests updated accordingly.
- **21 active AST encodings** total: BE-11, 12, 14, 19, 21, 22, 23, 24, 26, 29, 31, 33, 34, 38, 39, 40, 41, 43, 45, 47, 49.

### Wave Y — BE-21 reformulated to KSS viscosity-to-entropy bound + Tier-5 AST encoding (2026-05-07)
- **BE-21 reformulated**: replaced the operator-valued holographic-dictionary retarded Green's function recipe `G_R = -i lim r^(2Δ-d) (g^rr/√g^tt) ∂_r φ / φ_0` (no clean scalar AST encoding without bulk-dual commitment) with the canonical Kovtun-Son-Starinets 2005 saturating value `η/s = ℏ/(4π k_B)` (arXiv:hep-th/0405231). The bridge framing (universal viscosity bound as a UPT condensed-matter ↔ high-energy bridge) is preserved; the operator-valued framing is the AST-unencodable element documented as the reformulation candidate in known_issues. Status remains 'established' (KSS itself is established AdS/CFT result).
- **BE-21 encoded as 20th active AST module** at `src/bridges/equations/be-21-kss-bound.ts`. Form: `η/s = ℏ/(4π k_B)`. SI dimension: `[T Theta]` (K·s; ratio of viscosity [Pa·s] to entropy density [J/(K·m³)]). Numerical value: ≈6.078e-13 K·s.
- **18-test encoding spec**: catalog round-trip (status, formula_latex, references, notes), dimensional structure, 8 numerical bracket-checks (canonical KSS textbook value ≈6.078e-13 K·s, algebraic identity, positivity/finiteness, hand-derived consistency, AST structure pinning).
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[21, TIME_TIMES_TEMPERATURE]` (new `[T Θ]` literal in bridge-check.ts). Map size pin 19 → 20. Catalog round-trip + orphan-signature tests extended.
- **Honest-claude bracket-check finding**: original spec doc proposed ≈8e-13 K·s as the universal lower bound; correct value is ℏ/(4π k_B) ≈ 6.078e-13 K·s (factor ~1.3 difference vs. the 8e-13 estimate; both are in the same order of magnitude). The numerical evaluator and tests pin the exact CODATA-2018 value.
- **20 active AST encodings** total: BE-11, 12, 14, 19, 21, 22, 23, 24, 26, 31, 33, 34, 38, 39, 40, 41, 43, 45, 47, 49.

### Wave X — Tier-5 AST encoding for BE-39 asymptotic safety (2026-05-07)
- **BE-39 β_g encoded as 19th active AST module** at `src/bridges/equations/be-39-asymptotic-safety.ts`. Form: `β_g = 2g + A·g² + B·g³ − C·g²·λ` with all symbols dimensionless (the β-functions of dimensionless couplings are themselves dimensionless). Both LHS (β_g) and RHS infer to DIMENSIONLESS; `dimensional_signature` set to `'[1]'`. Companion β_λ = -2λ + Dλ² - Egλ - Fg² has the same dimensional structure and is numerically evaluable separately via `evaluateBetaLambda`.
- **Reuter-Weyer canonical EH-truncation coefficients** are documented as scheme-dependent in the module docstring; the AST symbol stubs (A, B, C, D, E, F) are preserved as dimensionless symbols rather than fixed numerics, matching the schematic-coefficient convention pinned in the BE-39 known_issues.
- **20-test encoding spec**: catalog round-trip, dimensional structure, 8 numerical bracket-checks (Gaussian fixed-point β_g(0,0) = β_λ(0,0) = 0 to 14 digits; linear response β_g ≈ 2g, β_λ ≈ -2λ near origin to 8 digits; closed-form polynomial agreement at (g,λ)=(0.1, 0.1) to 14 digits; -F·g² isolated contribution; A-coefficient linearity; λ-monotonicity verifying the C-sign convention), 3 input-validation tests.
- **`EXPECTED_DIMENSION_BY_BRIDGE` extended**: `[39, DIMENSIONLESS]`. Map size pin 18 → 19. Catalog round-trip test extended with BE-39. Orphan-signature test set updated.
- **19 active AST encodings** total: BE-11, 12, 14, 19, 22, 23, 24, 26, 31, 33, 34, 38, 39, 40, 41, 43, 45, 47, 49.


### Wave W — Tier-5 AST encoding for BE-31 Benincasa-Dowker discrete Ricci scalar (Encoded 2026-05-07)
- **BE-31 Causal Set Continuum Limit (BD d=4 discrete Ricci scalar) encoded as 18th active Tier-5 AST module** (`src/bridges/equations/be-31-causal-set-bd.ts`). Exports `BE31_CAUSAL_SET_BD_RHS: ExprNode`, `BE31_CAUSAL_SET_BD_LHS`, `evaluateBenincasaDowker({N_0, N_1, N_2, N_3, l_P_m})`, and `validateBE31Dimensions()`.
- **Form**: `R(p) = (4/√6) · ℓ_P^(-2) · [1 + N_0(p) - 9 N_1(p) + 16 N_2(p) - 8 N_3(p)]` (d=4). SI dimension: `[L^-2]` (inverse-area; Ricci scalar). The `(4/√6)` and N_k coefficients are dimension-specific (Benincasa-Dowker 2010); d≠4 generalization requires re-deriving them.
- **Encoding pattern**: dimensionless prefactor `4/√6` and dimensionless polynomial bracket `[1 + N_0 - 9N_1 + 16N_2 - 8N_3]` bundled into a single dimensionless symbol stub multiplied by `ℓ_P^(-2)` (no spurious AST structure for the bracket coefficients). Numerical evaluator computes the bracket explicitly with full coefficient fidelity.
- **Bracket-checks** (19-test encoding spec): all-zero N_k gives `R = (4/√6) · ℓ_P^(-2)` to 12-digit ratio; algebraic-zero point at `(N_0, N_1, N_2, N_3) = (-1, 0, 0, 0)` gives `R = 0` exactly; coefficient extraction at all four unit-vector tuples ((1,0,0,0)→`(4/√6)·2·ℓ_P^-2`; (0,1,0,0)→`(4/√6)·(-8)·ℓ_P^-2`; (0,0,1,0)→`(4/√6)·17·ℓ_P^-2`; (0,0,0,1)→`(4/√6)·(-7)·ℓ_P^-2`); linearity in N_0 holding others zero; (1,1,1,1) → `(4/√6) · 1 · ℓ_P^-2` (bracket = 1+1-9+16-8 = 1); ℓ_P^(-2) scaling (doubling ℓ_P quarters R); 4 input-validation tests. The Minkowski-sprinkling continuum-limit-mean check is intentionally omitted (sensitive to BD's specific sign conventions, not a clean cross-check at the encoding level — flagged in the docstring).
- **BE-31 dimensional_signature updated** `null` → `'[L^-2]'`. AST round-trips through validator to `[L^-2]`.
- **`EXPECTED_DIMENSION_BY_BRIDGE` cross-check map**: added `[31, INV_LENGTH_2]` (with new `INV_LENGTH_2 = power(LENGTH, -2)` literal in bridge-check.ts; same pattern as `T_INV2` for BE-19). Map size pin updated 17 → 18.
- **Hand-built `INV_LENGTH_2` literal** in the AST module (rather than `power(LENGTH, -2)`) because `power()` produces `-0` on unaffected bases, which compares unequal under deep-strict equality even though dimensionally identical. Same pattern as BE-23's RESISTIVITY literal.
- **Catalog round-trip + orphan-signature tests extended**: `ENCODED_RHS` array += BE-31; `ENCODED_RHS_IDS` set += 31.
- **18 active AST encodings** total: BE-11, 12, 14, 19, 22, 23, 24, 26, 31, 33, 34, 38, 40, 41, 43, 45, 47, 49. **Wave W complete.**



### Wave W — Tier-5 AST encoding for BE-45 Trans-Planckian Censorship Conjecture bound (Encoded 2026-05-07)
- **BE-45 TCC e-fold bound encoded as 17th active Tier-5 AST module** (`src/bridges/equations/be-45-tcc.ts`). Exports `BE45_TCC_RHS: ExprNode`, `BE45_TCC_LHS`, `BE45_LOG_RATIO_ARG_MP_HINF` (lemma), `BE45_LOG_RATIO_ARG_R` (lemma), `evaluateTCC({M_P_GeV, H_inf_GeV, r, gamma})`, and `validateBE45Dimensions()`.
- **Form**: `N_e_max = log(M_P/H_inf) - γ · log(r/0.01)`. Encoded in **natural units** (M_P and H_inf both as ENERGY symbols) — TCC literature works in natural units throughout (ℏ = c = 1; M_P/H_inf is then a dimensionless ratio). The honest-claude resolution: the SI ratio `M_P [kg] / H_inf [1/T] = [kg·s]` would NOT be dimensionless, so the natural-units convention is mandatory and explicitly documented.
- **Encoding pattern**: dimensionless-stub for `log()` (the AST has no log primitive), with **TWO** log arguments exposed as separate ExprNodes (`BE45_LOG_RATIO_ARG_MP_HINF` and `BE45_LOG_RATIO_ARG_R`) for direct dimensionlessness verification — same pattern as BE-26 exp(-WKB) and BE-41 exp(...).
- **Bracket-checks** (17-test encoding spec): canonical TCC `M_P = 1.22e19 GeV, H_inf = 1e14 GeV (GUT-scale), r = 0.01, γ = 0 → N_e_max = ln(1.22e5) ≈ 11.71` (textbook 12-e-fold observation window) to 12 digits; reference value `r = 0.01` zeros the γ-correction; `N_e_max` increases as M_P/H_inf increases (lower-energy inflation allows more e-folds); `N_e_max` decreases as γ·log(r/0.01) increases (larger r ⇒ stronger constraint); hand-computed `M_P/H_inf = e → N = 1` to 14 digits; γ-linearity to 12 digits; 4 input-validation tests.
- **BE-45 dimensional_signature updated** `null` → `'[1]'`. AST round-trips through validator to `[1]`.
- **`EXPECTED_DIMENSION_BY_BRIDGE` cross-check map**: added `[45, DIMENSIONLESS]`. Map size pin updated 16 → 17. `tests/dimensional/bridge-check.test.ts` size assertion + member list updated.
- **Catalog round-trip + orphan-signature tests extended**: `ENCODED_RHS` array += BE-45; `ENCODED_RHS_IDS` set += 45.
- **17 active AST encodings** total: BE-11, 12, 14, 19, 22, 23, 24, 26, 33, 34, 38, 40, 41, 43, 45, 47, 49.



### Wave W — Tier-5 AST encoding for BE-49 Quantum Darwinism mutual-information decay (Encoded 2026-05-07)
- **BE-49 Quantum Darwinism mutual-information decay encoded as 16th active Tier-5 AST module** (`src/bridges/equations/be-49-quantum-darwinism.ts`). Exports `BE49_QUANTUM_DARWINISM_RHS: ExprNode`, `BE49_QUANTUM_DARWINISM_LHS`, `evaluateQuantumDarwinism({I_SE, alpha, k, beta})`, and `validateBE49Dimensions()`.
- **Form**: `I(S:F_k) = I(S:E) - α · k^(-β)`. The spec form `I(S:F_k) = I(S:E) - O(k^-α)` is asymptotic-O notation, not a precise formula; the AST commits to the leading-order power-law correction. Spec's overloaded "α" (which denoted the exponent) is renamed to **β = decay exponent**, with **α = dimensionless magnitude prefactor**. AST exponent pinned to **β = 1** (canonical good-information-broadcasting regime per Zurek 2009 review) — same convention as BE-34 Kibble-Zurek's d=ν=z=1 commitment and BE-33 Hertz-Millis's 3D Heisenberg pin. Numerical evaluator remains β-agnostic.
- **Bracket-checks** (19-test encoding spec): identity at `k = 1`: `I(S:F_1) = I(S:E) - α` to 14 digits; `I(S:F_k) → I(S:E)` as `k → ∞` to 10 digits; monotonic increase in k across 6 k-values; hand-computed `I_SE = 1, α = 0.5, k = 2, β = 1 → I = 0.75`; β = 2 sanity check (evaluator β-agnostic); linearity in α; large-k decay-rate ratio `(I_SE - I(2k))/(I_SE - I(k)) = 2^(-β)` for β = 1; 4 input-validation tests.
- **BE-49 dimensional_signature updated** `null` → `'[1]'`. AST round-trips through validator to `[1]`.
- **`EXPECTED_DIMENSION_BY_BRIDGE` cross-check map**: added `[49, DIMENSIONLESS]`. Map size pin updated 15 → 16. `tests/dimensional/bridge-check.test.ts` size assertion + member list updated.
- **Catalog round-trip + orphan-signature tests extended**: `ENCODED_RHS` array += BE-49; `ENCODED_RHS_IDS` set += 49.
- **16 active AST encodings** total: BE-11, 12, 14, 19, 22, 23, 24, 26, 33, 34, 38, 40, 41, 43, 47, 49.



### Wave V — Tier-5 AST encoding for BE-40 Composite Higgs potential (Encoded 2026-05-07)
- **BE-40 Composite Higgs (SILH) potential encoded as 15th active Tier-5 AST module** (`src/bridges/equations/be-40-composite-higgs.ts`). Exports `BE40_COMPOSITE_HIGGS_RHS: ExprNode`, `BE40_COMPOSITE_HIGGS_LHS`, `BE40_HIGGS_DIMLESS_ARG` (lemma), `evaluateCompositeHiggs({h, f, alpha, beta})`, and `validateBE40Dimensions()`.
- **Form**: `V(h) = -α f⁴ sin²(h/f) + β f⁴ [sin⁴(h/f) - sin²(h/f) cos²(h/f)]`. SI dimension: `[energy⁴] = [L^8 M^4 T^-8]` (matches BE-18). The four trig combinations (`sin²`, `cos²`, `sin⁴`, `sin²cos²`) are encoded as dimensionless symbol stubs (the AST has no transcendental primitives); h/f dimensionlessness is verified via lemma `BE40_HIGGS_DIMLESS_ARG`.
- **Bracket-checks** (22-test encoding spec): `V(h=0) = 0` (sin(0) kills both terms); `V(h = π·f, β=0) = 0` (sin(π) = 0); alpha-only minimum `V(h = π/2 · f, β=0) = -α f⁴`; SILH textbook minimum `V_min = -f⁴ (α+β)²/(8β)` at `sin²(h/f) = (α+β)/(4β)`, with α=β=1 giving V_min = -f⁴/2 to 14 digits; f⁴-homogeneity scaling check (V scales as 16 when f→2f at fixed h/f); 4 input-validation tests.
- **BE-40 dimensional_signature updated** `null` → `'[L^8 M^4 T^-8]'`. Numerical evaluator works in natural units (f, h dimensionless, TeV-scale; standard particle-physics convention).
- **`EXPECTED_DIMENSION_BY_BRIDGE`**: added `[40, ENERGY_4]` (with new `ENERGY_4` = `power(ENERGY, 4)` literal in bridge-check.ts). Map size pin updated 14 → 15.
- **15 active AST encodings** total: BE-11, 12, 14, 19, 22, 23, 24, 26, 33, 34, 38, 40, 41, 43, 47. **Wave V complete.**



### Wave V — Tier-5 AST encoding for BE-23 SYK Planckian dissipation (Encoded 2026-05-07)
- **BE-23 SYK / Planckian-dissipation resistivity encoded as 14th active Tier-5 AST module** (`src/bridges/equations/be-23-syk-planckian.ts`). Exports `BE23_SYK_RESISTIVITY_RHS: ExprNode`, `BE23_SYK_RESISTIVITY_LHS`, `BE23_SYK_THERMAL_TERM` (lemma), `evaluateSYKResistivity({rho_0, m_star_kg, n_e_per_m3, T_K, alpha_SYK})`, and `validateBE23Dimensions()`.
- **Form**: `ρ(T) = ρ_0 + (m* · k_B T)/(n_e · e² · ℏ) · α_SYK`. SI dimension: Ω·m = kg·m³/(s³·A²) ≡ `[L^3 M T^-3 I^-2]`.
- **Lemma test**: `BE23_SYK_THERMAL_TERM` exposes the `(m* k_B T)/(n_e e² ℏ)` factor in isolation, providing direct AST-level verification of the Wave Q A1 m* prefactor fix (without m*, the SI dimension was m³/(s·C²) instead of Ω·m).
- **Bracket-checks** (18-test encoding spec): linearity in T `ρ(2T) - ρ_0 = 2·(ρ(T) - ρ_0)`; T = 0 limit `ρ(0) = ρ_0`; copper-density-carrier sanity at 100 K (finite, positive); linear scaling in `α_SYK`; hand-computed thermal-term recompute consistency; 4 input-validation tests.
- **BE-23 dimensional_signature updated** `null` → `'[L^3 M T^-3 I^-2]'` (bracketed-product form; resistivity has no NAMED_DIMENSIONS entry).
- **`EXPECTED_DIMENSION_BY_BRIDGE`**: added `[23, RESISTIVITY]` (with the resistivity Dimension literal added to the bridge-check module). Map size pin updated 13 → 14.
- **14 active AST encodings** total: BE-11, 12, 14, 19, 22, 23, 24, 26, 33, 34, 38, 41, 43, 47.



### Wave V — Tier-5 AST encoding for BE-33 Hertz-Millis correlation length (Encoded 2026-05-07)
- **BE-33 Hertz-Millis correlation length encoded as 13th active Tier-5 AST module** (`src/bridges/equations/be-33-hertz-millis.ts`). Exports `BE33_HERTZ_MILLIS_RHS: ExprNode`, `BE33_HERTZ_MILLIS_LHS`, `evaluateHertzMillis({xi_0_m, T_K, T_0_K, nu, z})`, and `validateBE33Dimensions()`.
- **Form**: `ξ(T) = ξ_0 · (T/T_0)^(-ν/z)`. AST exponent pinned to **3D Heisenberg universality class** (z=1, ν≈0.71 → exponent -0.71); numerical evaluator remains universality-class-agnostic. Same convention as BE-34 Kibble-Zurek's d=ν=z=1 commitment. Alternative classes (3D Ising z=1 ν≈0.63; 3D XY z=1 ν≈0.67; fermionic Hertz-Millis-Moriya z=2-3) would warrant separate BE entries.
- **Bracket-checks** (20-test encoding spec): identity ξ(T_0) = ξ_0; power law `ξ(α·T_0)/ξ_0 = α^(-ν/z)` across 5 alphas to 14 digits; QCP divergence as T → 0; 3D Heisenberg `ξ(2 T_0)/ξ_0 ≈ 2^(-0.71) ≈ 0.611`; alternative-class check (3D Ising ν=0.63); 5 input-validation tests.
- **BE-33 dimensional_signature updated** `null` → `'[length]'`.
- **`EXPECTED_DIMENSION_BY_BRIDGE`**: added `[33, LENGTH]`. Map size pin updated 12 → 13.
- **13 active AST encodings** total: BE-11, 12, 14, 19, 22, 24, 26, 33, 34, 38, 41, 43, 47.



### Wave V — Tier-5 AST encoding for BE-43 ER=EPR wormhole-entropy bound (Encoded 2026-05-07)
- **BE-43 ER=EPR wormhole-entropy bound encoded as 12th active Tier-5 AST module** (`src/bridges/equations/be-43-er-epr.ts`). Exports `BE43_ER_EPR_RHS: ExprNode`, `BE43_ER_EPR_LHS`, `evaluateEREPRBound({area_m2})`, and `validateBE43Dimensions()`.
- **Form**: `S_entanglement = k_B · A_wormhole / (4 ℓ_P²)` (SI form, equivalent to BE-14's `k_B c³ A/(4 G ℏ)` since `ℓ_P² = ℏG/c³`). Mirrors BE-14 Ryu-Takayanagi's [entropy] convention exactly.
- **Bracket-checks** (15-test encoding spec): linearity `S(αA) = α·S(A)` across 5 alphas to 12 digits; `S(0) = 0`; solar-mass black hole (`A = 4π r_s²` with `r_s = 2GM_sun/c²`) gives `S ~ 10⁵⁴-10⁵⁵ J/K` (textbook Bekenstein-Hawking value); cross-check against BE-14 SI form to 6 digits; Planck-area unit `A = ℓ_P²` gives `S = k_B/4`; 3 input-validation tests.
- **BE-43 dimensional_signature updated** `null` → `'[entropy]'`. AST round-trips through validator to `[entropy]`.
- **`EXPECTED_DIMENSION_BY_BRIDGE` cross-check map**: added `[43, ENTROPY]`. Map size pin updated 11 → 12.
- **Catalog round-trip + orphan-signature tests extended**: `ENCODED_RHS` array += BE-43; `ENCODED_RHS_IDS` set += 43.
- **12 active AST encodings** total: BE-11, 12, 14, 19, 22, 24, 26, 34, 38, 41, 43, 47.



### Wave V — Tier-5 AST encoding for BE-24 Förster FRET efficiency (Encoded 2026-05-07)
- **BE-24 Förster FRET transfer efficiency encoded as 11th active Tier-5 AST module** (`src/bridges/equations/be-24-foerster-fret.ts`). Exports `BE24_FRET_EFFICIENCY_RHS: ExprNode`, `BE24_FRET_EFFICIENCY_LHS`, `evaluateFRETEfficiency({R, R_0})`, and `validateBE24Dimensions()`.
- **Form**: η = R_0⁶/(R_0⁶ + R⁶) ≡ 1/(1 + (R/R_0)⁶), the bound-respecting (η ∈ [0,1]) Förster FRET transfer efficiency. BE-24's `formula_latex` carries both this and the dipole-dipole rate `k_FRET = (1/τ_D)·(R_0/R)⁶` (dim [T^-1]); we encode the efficiency since it is the natural FRET observable and round-trips cleanly to dimensionless.
- **Bracket-checks** (22-test encoding spec): Förster radius identity η(R = R_0) = 1/2 (defining relation, to 14 digits); close-range limit η(R << R_0) → 1; long-range limit η(R >> R_0) → 0 (sextic falloff); η(R = 2 R_0) = 1/65 ≈ 0.01538 to 14 digits; η(R = R_0/2) = 64/65 ≈ 0.9846 to 14 digits; bound-respecting η ∈ [0,1] across 7 regimes; monotonic-decreasing in R; scale invariance (only R/R_0 ratio matters); 4 input-validation tests.
- **BE-24 dimensional_signature updated** `null` → `'[1]'`. AST round-trips through validator to `[1]`.
- **`EXPECTED_DIMENSION_BY_BRIDGE` cross-check map**: added `[24, DIMENSIONLESS]`. Map size pin updated 10 → 11. `tests/dimensional/bridge-check.test.ts` size assertion + member list updated.
- **Catalog round-trip + orphan-signature tests extended**: `ENCODED_RHS` array += BE-24; `ENCODED_RHS_IDS` set += 24.
- **11 active AST encodings** total: BE-11, 12, 14, 19, 22, 24, 26, 34, 38, 41, 47 (BE-25 archived under Wave Q B2).



### Wave U — Tier-5 AST encoding for BE-38 Milgrom MOND (2026-05-06)
- **BE-38 Milgrom MOND interpolation encoded as 10th active Tier-5 AST module** (`src/bridges/equations/be-38-mond.ts`). Exports `BE38_MOND_FORCE_RHS: ExprNode`, `BE38_MOND_FORCE_LHS`, `BE38_MOND_NU_ARG`, `evaluateMONDForce({F_N_newton, m_kg, a_0_m_per_s2})`, and `validateBE38Dimensions()`.
- **Form reformulated** from implicit `F = F_N · μ⁻¹(a/a_0)` (Wave I.B C4) to explicit `F = F_N · ν(z)` with `z = F_N/(m·a_0)` and `ν(z) = √[(1+√(1+4/z²))/2]`. Mathematically equivalent (Famaey-McGaugh 2012 *Living Rev. Relativity* 15:10) but the ν-form is directly computable without an implicit-function inversion.
- **Encoding pattern**: dimensionless-stub for ν(z) opaque function, with the dimensionless argument `z = F_N/(m·a_0)` exposed as `BE38_MOND_NU_ARG` for a lemma test (verified to be DIMENSIONLESS via the validator).
- **Bracket-checks** (18-test encoding spec): Newtonian limit (`F_N >> m·a_0` → `F → F_N` to 8 digits); deep-MOND limit (`F_N << m·a_0` → `F → √(m·F_N·a_0)` to 1%); golden-ratio identity at `z = 1` (`F = F_N · √φ` where `φ = (1+√5)/2`, to 12 digits); monotonic `F/F_N` increase as `F_N` decreases; cross-derivation against implicit Milgrom relation `μ(a/a_0)·a = a_N` to 14 digits; 3 input-validation tests.
- **BE-38 dimensional_signature updated** `null` → `'[force]'`. AST round-trips through validator to `[force]`.
- **`EXPECTED_DIMENSION_BY_BRIDGE` cross-check map**: added `[38, FORCE]`. Map size pin updated 9 → 10. `tests/dimensional/bridge-check.test.ts` size assertion + member list updated.
- **Catalog round-trip + orphan-signature tests extended**: `ENCODED_RHS` array += BE-38; `ENCODED_RHS_IDS` set += 38.
- **Wave I.B C4 reformulation test relaxed**: the `formula_latex` regex pin was updated to accept either the original μ-form OR the explicit ν-form (both are canonical Milgrom-class interpolations); the test now pins "canonical Milgrom interpolation" rather than a specific syntactic form.
- **Spec body in `Part-II.md` BE-38 section** updated with the explicit ν-form + bracket-check summary.
- **10 active AST encodings** total: BE-11, 12, 14, 19, 22, 26, 34, 38, 41, 47 (BE-25 archived under Wave Q B2; legacy module preserved for traceability).



### Wave T — Tier-5 AST encoding for BE-12 + numerical-prefactor fix (2026-05-06)
- **BE-12 thermal de Broglie wavelength encoded as 9th Tier-5 AST module** (`src/bridges/equations/be-12-coherence-length.ts`). Exports `BE12_COHERENCE_LENGTH_RHS: ExprNode`, `BE12_COHERENCE_LENGTH_LHS`, `evaluateThermalDeBroglie({m_kg, T_K})`, and `validateBE12Dimensions()`. Both AST and numerical evaluator implement the canonical Pitaevskii-Stringari form `λ_T = √(2π ℏ²/(m k_B T))` ≡ `h/√(2π m k_B T)` (Pathria 2011 *Statistical Mechanics* 3rd ed. eq. 1.4.13). 20-test encoding spec includes catalog round-trip, dimensional structure (LHS = RHS = [length]), 6 numerical bracket-checks (H atom at 300 K → ~100 pm = 1 Å textbook; electron at 300 K → ~4 nm; cross-check identities including h-flavor ↔ ℏ-flavor agreement to 14 digits, λ ∝ 1/√m, λ ∝ 1/√T), and 4 input-validation tests.
- **NUMERICAL-PREFACTOR BUG CAUGHT BY THE AST ENCODING WORK**: the Wave Q A2 form `λ_T = ℏ/√(2π m k_B T)` was dimensionally `[length]` ✓ but numerically off by a factor of 2π from the canonical thermal de Broglie wavelength (gave ~16 pm for H at 300 K instead of the textbook ~100 pm). The canonical form has ℏ² inside the square root: `√(2π ℏ²/(m k_B T))`, equivalent to `h/√(2π m k_B T)` since `h = 2πℏ`. The BE-12 AST encoding's hydrogen-at-300K bracket-check failed against the textbook value, surfacing the bug. Wave Q A2's dimensional consistency fix was correct; the numerical prefactor was wrong. Updates: `formula_latex` in `src/bridges/index.ts`, `dimensional_signature: '[length]'` (was `null`), AST module, numerical evaluator, Part-I.md spec body. **This is exactly the value-add of Tier-5 AST encoding** — bracket-checking against textbook values catches numerical-prefactor errors that dimensional analysis alone misses.
- **`EXPECTED_DIMENSION_BY_BRIDGE` cross-check map updated**: added `[12, LENGTH]`. Map size pin updated 8 → 9 (was: post-Wave-Q-B2 BE-25 archival; now: post-Wave-T BE-12 addition). `tests/dimensional/bridge-check.test.ts` size assertion + member list updated.
- **Catalog round-trip test extended**: `tests/bridges/dimensional-signature-catalog.test.ts` `ENCODED_RHS` array now includes BE-12. `tests/bridges/orphan-dimensional-signature.test.ts` `ENCODED_RHS_IDS` set updated.
- **9 active AST encodings** total: BE-11, 12, 14, 19, 22, 26, 34, 41, 47 (BE-25 archived under Wave Q B2; the legacy Penrose-Hameroff module remains for traceability but doesn't participate in the round-trip catalog).



### Wave S — maximize spec mathematical consistency (2026-05-06)
- **BE-26 status reconciliation** (per Phys iter-7 IMPORTANT): downgraded from `'established'` to `'speculative'`. The WKB tunneling formula itself (Gamow 1928; Landau-Lifshitz QM §50) is canonical and remains so, but the *bridge framing* — that DNA mutations are dominantly explained by tunneling — is contested by ~2-4 orders of magnitude in observed mutation rates (already documented in `known_issues` since Wave I.B C6, but the prior `'established'` label was inconsistent with that gap). Updated `src/bridges/index.ts` BE-26 entry, `docs/specification/Part-II.md` BE-26 section, and `tests/bridges/be-26-encoding.test.ts` status pin (now expects `'speculative'`). Same precedent as BE-22 (Kitaev-Preskill formula canonical, UPT QG bridge framing speculative) and BE-38 (Milgrom MOND canonical, UPT bridge framing speculative).
- **BE-39 add canonical -Fg² term to β_λ** (per Math iter-7 IMP-6): the prior schematic form `β_λ = -2λ + Dλ² - Egλ + O(λ³)` was missing the canonical g²-coupling term required by the Reuter (1998) Einstein-Hilbert truncation to fix the non-Gaussian fixed point's `λ_*` value. Added `-Fg²` term (using F to avoid collision with β_g's B); new form is `β_λ = -2λ + Dλ² - Egλ - Fg² + O(λ³, g³)`. Updated `formula_latex` in `src/bridges/index.ts` BE-39 entry, the SVG-encoded equation in Part-II.md BE-39 section, and added a Wave S `known_issue` documenting the addition. Reference: Reuter 1998 *Phys. Rev. D* 57:971 (arXiv:hep-th/9605030); Reuter-Weyer 2009 *Gen. Rel. Grav.* 41:983.
- **`tractability_class` population**: 7 of the 10 prior `'undefined'` entries classified per literature: BE-18 (non-Abelian dark sector Lagrangian) → `numerical-tractable`; BE-31 (Benincasa-Dowker discrete Ricci scalar) → `numerical-tractable`; BE-38 (Milgrom MOND algebraic) → `closed-form`; BE-40 (composite Higgs polynomial potential) → `closed-form`; BE-42 (Firewall Complement quantum-state superposition) → `numerical-tractable`; BE-45 (Trans-Planckian Censorship algebraic inequality) → `closed-form`; BE-49 (Quantum Darwinism mutual-information decay) → `numerical-tractable`. Plus BE-48 (GRW Lindblad) → `numerical-tractable`. Final distribution: `closed-form` × 12, `numerical-tractable` × 21, `numerical-asymptotic` × 1, `formally-divergent` × 4, `undefined` × 2 (BE-16 + BE-37 only — both genuinely invalid). Comment on the `BridgeTractabilityClass` enum updated to reflect that 'undefined' is now reserved for invalid bridges and entries lacking a literature classification, not just "no AST encoding."
- **Status-count consistency updates**: README, Bridge-Remediation-Plan, CHANGELOG status mix updated 8/27/3/2 → 7/28/3/2 reflecting the BE-26 demotion.



### Wave R — iter-7 closing fixes (2026-05-06)
- **Math iter-7 IMP-1 fix**: Hubble-horizon area `A_H` was missing the `c²` factor required for SI dimensional consistency. The de Sitter horizon at proper radius `c/H₀` gives `A_H = 4π(c/H₀)² = 4π c²/H₀²`. Original Wave L Tier A form `A_H = 4π/H₀²` had dimensions `[T²]`, not `[L²]`. Corrected in 7+ locations across `Part-I.md` (Appendix A glossary), `Part-III.md` (Conjecture 8.1 narrative + LaTeX-encoded SVG + plausibility argument), and `Part-IV.md` (§11.1.2 scope note + holographic-bound list). The numerical claim `A_H/(4ℓ_P²) ~ 10¹²² bits` was already correct (computed using the correct `c²/H₀²` form); only the displayed formula was missing the c² factor.
- **Researcher iter-7 C1 fix**: BE-23 reference corrected — Hartnoll & Hofman 2010 *Phys. Rev. B* 81:155125 ("Generalized Lifshitz-Kosevich scaling at quantum criticality from the holographic correspondence"), NOT *Phys. Rev. D* 81:086004 (a different paper). The arXiv ID 0912.0008 was correct; only the journal/volume was wrong. Fixed in `src/bridges/index.ts` BE-23 references and CHANGELOG line.
- **Researcher iter-7 C2 fix**: BE-43 citation disambiguated — arXiv:1408.2823 is **Susskind & Zhao** "Switchbacks and the Bridge to Nowhere" (no journal); the actual *Phys. Rev. D* 90:126007 is **Stanford & Susskind** "Complexity and Shock Wave Geometries" with arXiv:**1406.2678**. Prior versions had conflated the two papers' identifiers ("Susskind, Stanford 2014 PRD 90:126007 (arXiv:1408.2823)" mixed authors of one paper with arXiv ID of another). Both papers now cited separately with correct authorship and IDs in `src/bridges/index.ts`, `Part-II.md` BE-43 section, `Bridge-Remediation-Plan.md`, and CHANGELOG.
- **CS iter-7 C1 + C2 fix**: Added inline ⚠️-prefixed tag blocks immediately preceding the SVG-encoded pseudocode for Algorithm 1 (`CONSTRUCT_UNIVERSAL_TENSOR`) and Algorithm 3A (`VALIDATE_TENSOR_CONSISTENCY`) in Part-I. Algorithm 1's tag flags `SOLVE_BRIDGE_EQUATION`, `REPAIR_INCONSISTENCY`, `ESTIMATE_THEORETICAL_CONFIDENCE`, and `CHECK_CONSTRAINT(GAUGE/UNITARITY/CORRESPONDENCE)` as ORACLE / SPEC-ONLY in the immediate visual context. Algorithm 3A's tag flags `‖Π - transformed‖_F`, `∫_Ω |ψ|² dμ`, `lim_{ℏ→0} Π_quantum` as schematic / non-load-bearing aggregate operations whose operational form is the per-cell predicates above. Both tags reference Appendix B (Part-IV) for the full per-cell rewrite table.



### Wave Q completion — Tiers D3 + E1 (2026-05-06)
- `docs/planning/Bridge-Remediation-Plan.md` summary table updated to reflect the Wave P pivot's effect on R2 and R3 tiers. R2 count: 7 → 0 (all 12 R2 entries reformulated to canonical literature forms — Caldeira-Leggett, Jacobson, Hohenberg-Halperin, Einstein-Cartan, SYK, Förster, IIT, FLM, Hertz-Millis, TeVeS, Bekenstein-Hawking-on-ER, Wheeler-Feynman). R3 count: 7 → 2 (BE-16 + BE-37 remain genuinely unreformulable; earlier transient promotions of BE-23/25/30/43/50 to R3 were reverted in the Wave P pivot). Per Researcher iter-6 C3.
- `src/dimensional/README.md` adds a "Limitation: `^` operator requires literal-numeric exponents" section documenting the silent-fallthrough footgun for symbolic exponents. Workarounds named: literal value when concrete (e.g., BE-34 Kibble-Zurek `(τ_Q/τ_0)^(-0.5)`), dimensionless-stub for scheme-dependent forms (e.g., BE-21 `r^{2Δ-d}`), and a future AST extension `kind: 'op-pow-symbolic'` filed as Tier-5 followup. Per CS iter-6 C4.
- D2 (IIT 4.0 year disambiguation, per Researcher iter-6 C2) and E2 (Status invariant 4 vacuity hedge, per Phys iter-6 C3) were already addressed at Wave P-D / Wave P-A Tier 0-4 respectively; no additional action required.

### Wave Q — iter-6 comprehensive repair (2026-05-06)

Wave Q addresses the 12 CRITICAL findings identified in the iter-6 paper-
review pass under `~/.claude/playground/upt-paper-review-2026-05-06-iter-6/`.
All findings localized — no systemic regressions to the Wave P pivot.

#### Tier A — Wave P dimensional regressions (HIGHEST priority)

- **A1 (Math iter-6 C1)**: BE-23 add `m*` carrier effective mass.
  The Wave P-C R-C1 form `ρ(T) = ρ_0 + (k_B T/ℏ)·(1/(n_e e²))·α_SYK`
  was missing the `m*` prefactor required by the canonical
  Drude+Planckian decomposition; SI dimensional analysis without
  `m*` yields `m³/(s·C²)` rather than the required `Ω·m`. Canonical
  form is now `ρ(T) = ρ_0 + (m* k_B T)/(n_e e² ℏ)·α_SYK`.
- **A2 (Math iter-6 C2)**: BE-12 drop γ — canonical thermal de Broglie.
  The Wave P-B R-B1 form `ξ = ℏ/√(2 m k_B T γ)` doesn't yield length
  under either γ convention (γ as Ohmic friction with `[γ] = 1/s`
  gives `√s` not `m`; γ as a dimensionless coefficient leaves an
  arbitrary numerical scaling). Reverted to the strictly-canonical
  thermal de Broglie wavelength `λ_T = ℏ / √(2π m k_B T)`, which is
  dimensionally clean.

#### Tier B — BE-25 cleanup residuals

- **B1 (CS iter-6 C1)**: BE-25 `tractability_class` corrected from
  `'formally-divergent'` to `'numerical-asymptotic'`. The prior label
  miscategorized Φ_max as non-Turing-computable; in fact Φ_max IS
  computable — the issue is exponential complexity (EXPTIME), so it is
  asymptotically intractable for systems beyond ~10 elements but
  remains finite, calculable, and well-defined for any finite substrate.
- **B2 (CS iter-6 C2)**: BE-25 stale AST archived. The legacy
  `src/bridges/equations/be-25-orch-or.ts` module encodes the dropped
  Penrose-Hameroff `t_OR` form; under the Wave P-D R-D2 IIT Φ_max
  reformulation, BE-25's `dimensional_signature` is `null` so the AST
  is no longer load-bearing. Module preserved with archive banner for
  historical traceability; removed from `EXPECTED_DIMENSION_BY_BRIDGE`
  cross-check map (size 9 → 8) and from the round-trip
  `dimensional-signature-catalog.test.ts`. The legacy
  `tests/bridges/be-25-encoding.test.ts` archive regression is retained.

#### Tier C — Excise displayed-but-invalid formulas

- **C1 (Phys iter-6 C1)**: BE-16 displayed formula excised from
  `docs/specification/Part-I.md`. The ansatz `dS/dt = k_B C(ρ) ∂I/∂t`
  was still being shown in the spec body even though BE-16's
  invalid disposition is correct (the formula is algebraically
  self-refuting under `I = Tr(ρ log ρ) = -S_vN`). Replaced with a
  disposition note pointing at `src/bridges/index.ts` BE-16 and at
  the Status paragraph's algebraic argument. Formula preserved in
  commit history.
- **C2 (Phys iter-6 C2)**: BE-37 VSL ansatz excised from
  `docs/specification/Part-II.md`. Same pattern as C1 — the
  Ellis-Uzan operational-meaninglessness disposition is correct,
  but the displayed `c(t) = c_0[1 + ε(t/t_P)^n exp(-t/t_c)]` ansatz
  and modified Friedmann equation were still being rendered.
  Replaced with a disposition note pointing at `src/bridges/index.ts`
  BE-37 and `docs/planning/BE-37-VSL-Disposition-Brief.md`.
- **C3 (CS iter-6 C3)**: Part-IV §11.2.1 retracted cardinality
  formula `|𝒞(Π)| < |𝒰(Π)|` excised from the displayed body.
  The formula was retracted in Wave I.B D5 (the cardinality framing
  didn't capture the runtime-vs-shortcut argument) but was retained
  "for traceability" — reader's eye lands on the formula, not the
  hedge. Replaced with a one-paragraph note pointing at the
  Wolfram-irreducibility framing as the canonical statement.

#### Tier D — Wave P-D summary commit drift

- **D1 (Researcher iter-6 C1)**: Wave-P-A summary table fix in
  CHANGELOG. The pivot summary table contradicted the per-bridge
  entries: BE-43 was listed as "FLM" but the canonical Wave P-A
  R-A3 form is Bekenstein-Hawking applied to the ER bridge
  cross-section (`S_entanglement ~ A_wormhole / (4 ℓ_P²)`); BE-50
  was listed as "Israel-Darmois junction" but the canonical Wave P-A
  R-A4 form is Wheeler-Feynman half-retarded-plus-half-advanced
  (`A_μ = ½(A^ret + A^adv)`). Table row corrected.

### Wave P Reformulation Pivot — Final State (2026-05-06)

The Wave P sequence (P-A, P-B, P-C, P-D) implements a strategic pivot in
how UPT handles R3-invalid bridges: rather than preserving them as
historical record (the Wave J/L approach), Wave P **completes** each
bridge to a canonical literature form when one exists. This trades
verbatim-spec preservation for catalog usefulness (every bridge that
admits a canonical form now points at one, with the bridge framing —
not the equation — as the speculative element).

**12 bridges reformulated under the Wave P pivot:**

| Wave | BEs reformulated | Canonical form |
|------|-------------------|------------------|
| P-A (4) | BE-30, 33, 43, 50 | FLM `δS_EE = ⟨δH_R⟩` (BE-30); Hertz-Millis 3D Heisenberg `ξ ~ T^{-ν/z}` (BE-33); Bekenstein-Hawking applied to ER bridge cross-section `S_entanglement ~ A_wormhole / (4 ℓ_P²)` (BE-43); Wheeler-Feynman half-retarded-plus-half-advanced `A_μ = ½(A^ret + A^adv)` (BE-50) |
| P-B (3) | BE-12, 13, 17 | Caldeira-Leggett dephasing length; Jacobson 1995 thermodynamic Einstein eqs; canonical Einstein-Cartan torsion-spin |
| P-C (3) | BE-23, 24, 36 | SYK / Planckian-dissipation linear-in-T; Förster FRET; Bekenstein 2004 TeVeS |
| P-D (2) | BE-15, 25 | Hohenberg-Halperin Model A gradient flow; IIT Φ_max integrated information |

Plus 2 earlier-loop reformulations outside the Wave P sequence (BE-22
Kitaev-Preskill / Levin-Wen TEE, Wave 2; BE-38 Milgrom MOND, Wave I.B
C4) for **14 total reformulations across the project**.

**Final catalog status distribution (40 bridges):**
- `established` × 8
- `speculative` × 27
- `highly-speculative` × 3
- `invalid` × 2

**Final invalid count: 2 (BE-16 + BE-37 only)** — both genuinely
unreformulable:

- **BE-16 (Complexity-Entropy Production Relation)** is algebraically
  self-refuting: combining `I = Tr(ρ log ρ) = -S_vN` with the master
  relation forces `dS/dt = 0` for any `C(ρ) > -1/k_B`, violating the
  Second Law. No reformulation is possible without abandoning the
  framework's anchoring identification of `I` with `-S_vN`.
- **BE-37 (Variable Speed of Light Cosmology)** fails Ellis-Uzan
  operational-meaninglessness (Ellis-Uzan 2005, arXiv:gr-qc/0305099):
  varying `c` is not a falsifiable physical proposal under canonical
  covariance arguments; furthermore the Albrecht-Magueijo / Moffat /
  Barrow VSL frameworks are non-equivalent, with no canonical form to
  commit to. Disposition pinned 2026-05-05 per
  `docs/planning/BE-37-VSL-Disposition-Brief.md`.

**Test count progression across the Wave P sequence:**

- Pre Wave P-A: 437 tests
- Post Wave P-A (R-A1..A4): 446 tests (+9)
- Post Wave P-B (R-B1..B3): 450 tests (+4)
- Post Wave P-C (R-C1..C3): 463 tests (+13)
- Post Wave P-D (R-D1..D2): 477 tests (+14)

**Reformulation pin tests** at
`tests/bridges/be-{12,13,15,17,22,23,24,25,30,33,36,38,43,50}-reformulation.test.ts`
(14 files); R3-invalid pin tests at
`tests/bridges/be-{16,37}-r3-disposition.test.ts` (2 files).

### Added
- **Wave P-D R-D2 — BE-25 reformulated to canonical Integrated Information
  Theory (IIT, Tononi) Φ_max form.**
  - Replaced the Tegmark-falsified Penrose-Hameroff Orch-OR form
    `t_OR = ℏ/(Δm c² Δx/ℓ_P)` — which combined a non-Penrose `Δx/ℓ_P`
    factor (Penrose's canonical gravitational self-energy is
    `E_G ~ G(Δm)²/Δx`) with a microtubule-coherence mechanism that
    Tegmark 2000 *Phys. Rev. E* 61:4194 falsified by ~10 orders of
    magnitude (decoherence ~10⁻¹³ s vs. neural processing ~10⁻³ s
    at biological temperature) — with the canonical Integrated
    Information Theory minimum-information-partition form:

    `Φ_max(S) = min_θ [ ii(s, s̃) - ii_θ(s, s̃) ]`

    with intrinsic information

    `ii(s, s̃) = p(s̃ | s) log₂ [ p(s̃ | s) / p(s̃) ]`

    where θ ranges over bipartitions of S (the MIP is the partition
    that minimally reduces intrinsic information).
  - Status: `invalid` → `speculative`. IIT itself is canonical and
    calculable (Tononi 2008 *Biol. Bull.* 215:216 — original IIT;
    Oizumi-Albantakis-Tononi 2014 *PLoS Comput. Biol.* 10:e1003588 —
    IIT 3.0 with calculable Φ via earth-mover's distance over
    partitions; Albantakis et al. 2023 *PLoS Comput. Biol.*
    19:e1011465 / arXiv:2212.14787 — IIT 4.0 with explicit axiom-
    postulate framework). The bridge framing — treating Φ_max as the
    canonical UPT consciousness ↔ information bridge — is the
    speculative element: (a) Tononi's identification of phenomenal
    consciousness with maximally-integrated information is contested
    by Aaronson 2014 (computational counterexamples) and Doerig
    et al. 2019 *Conscious Cogn.* 72:49 (unfolding argument); (b) the
    original UPT framing of consciousness ↔ *quantum* information is
    dropped — IIT is substrate-agnostic and makes no claim about
    quantum coherence, so the Tegmark and McKemmish Orch-OR
    falsifications are moot under the reformulation.
  - **Important — downstream excisions retained:** Part-IV §12.3,
    Part-V §21.2.2, and Part-VI §28.2 were excised in Wave L Tier B3
    because BE-25 was Penrose-Hameroff. Those excisions are **not
    restored** under this IIT reformulation: the original sections
    were tied to the Penrose-Hameroff cosmic-consciousness /
    clinical-applications framings, and IIT-based clinical applications
    (e.g., perturbational complexity index PCI in disorders of
    consciousness — Casali et al. 2013 *Sci. Transl. Med.* 5:198ra105)
    are an active research area outside UPT's current scope.
  - `tractability_class`: `closed-form` → `formally-divergent`.
    Φ_max computation is exponential in the number of elements
    (intractable beyond ~10 elements); approximate measures (Φ*, Φ^G,
    geometric Φ) exist for larger systems but each gives different
    numbers and is not interchangeable with Φ_max.
  - `dimensional_signature`: `[time]` → `null`. Φ has units of bits
    (information) when log₂ is used; the IIT 3.0/4.0 framework pins
    units separately rather than via SI dimensional analysis.
  - **Stale Tier-5 AST encoding noted:** the legacy module
    `src/bridges/equations/be-25-orch-or.ts` encodes the dropped
    Penrose-Hameroff `t_OR` form. It is preserved for traceability
    and for AST-validator regression coverage but no longer
    participates in the bridge-index dimensional_signature catalog
    (`tests/bridges/dimensional-signature-catalog.test.ts` — BE-25
    removed). A future Tier-5 sweep can retire the module or re-encode
    the IIT Φ_max form (note: Φ is exponential in system size, so
    AST encoding may not be tractable beyond ~10 elements).
  - Test file replacement: `tests/bridges/be-25-r3-disposition.test.ts`
    deleted; `tests/bridges/be-25-reformulation.test.ts` added (15
    tests; honest-archaeology pattern). The legacy
    `tests/bridges/be-25-encoding.test.ts` is rewritten as a stale-AST
    archive (asserts `status === 'speculative'`,
    `dimensional_signature === null`, and exercises the legacy
    AST validator regression on the dropped form).
  - Honest-claude flag: WebFetch on arXiv:2212.14787 (IIT 4.0 preprint)
    returned only abstract content (axiom-postulate framework);
    WebFetch on Wikipedia "Integrated information theory" /
    "Phi (integrated information theory)" provided the canonical
    Φ-via-MIP formula and the intrinsic-information form
    `ii(s,s̃) = p(s̃|s) log₂[p(s̃|s)/p(s̃)]`. The earth-mover's-distance
    / Wasserstein-metric specific computation in IIT 3.0 follows the
    canonical Oizumi-Albantakis-Tononi 2014 *PLoS Comput. Biol.* paper
    rather than a fresh WebFetch.

- **Wave P-D R-D1 — BE-15 reformulated to canonical Hohenberg-Halperin
  Model A purely-dissipative gradient flow.**
  - Replaced the conflated form
    `∂O_macro/∂t = F[{O_micro}] + η∇²O_macro + ζ(∂²S/∂O²)` (LHS an
    observable rate; RHS `F[{O_micro}]` an RG-flow functional that
    evolves a coupling along scale `k`, not an observable along time
    `t` — disjoint physical objects evolving along different parameter
    axes) with the canonical Hohenberg-Halperin Model A purely-dissipative
    gradient flow:

    `∂φ/∂t = -Γ δH/δφ + ζ(x,t)`

    with FDT noise correlator
    `⟨ζ(x,t) ζ(x',t')⟩ = 2 Γ k_B T δ(x-x') δ(t-t')`
    and Landau-Ginzburg Hamiltonian
    `H[φ] = ∫d³x [½(∇φ)² + V(φ)]` with polynomial V(φ).
  - Status: `invalid` → `speculative`. The Hohenberg-Halperin Model A
    Langevin equation is canonical condensed-matter physics
    (Hohenberg-Halperin 1977 *Rev. Mod. Phys.* 49:435 — the Model
    A/B/C/D/E/F/G/H/J taxonomy); the bridge framing — treating Model A
    as the UPT microscale ↔ emergent bridge by committing to a slow-
    mode coarse-graining — is the speculative element.
  - Selecting Model A pins the order parameter as **non-conserved**.
    Conserved-density (Model B), order-parameter-coupled-to-conserved-
    density (Model C), and fluid (Model H) variants each require a
    distinct BE entry; Wetterich exact RG flow and Mori-Zwanzig
    projector-operator alternatives represent different reformulation
    paths covering different physical scenarios. The original
    "universal" framing is dropped — there is no single emergence
    equation that covers all coarse-grainings.
  - `tractability_class`: `undefined` → `numerical-tractable` (Model A
    is a stochastic PDE with established forward-Euler / stochastic-
    Heun numerical methods).
  - Test file replacement: `tests/bridges/be-15-r3-disposition.test.ts`
    deleted; `tests/bridges/be-15-reformulation.test.ts` added (12
    tests; honest-archaeology pattern).
  - Honest-claude flag: WebFetch on the Hohenberg-Halperin RMP itself
    returned 403 (paywall); WebFetch on Wikipedia "Critical phenomena"
    confirmed only the Hohenberg-Halperin nomenclature with one
    numerical Model-H example (`x_η ≃ 0.068, z ≃ 3.068`); the explicit
    Model A Langevin form and FDT noise correlator follow standard
    textbook references (Chaikin-Lubensky 1995 *Principles of Condensed
    Matter Physics* Ch. 8; Goldenfeld 1992 *Lectures on Phase
    Transitions and the Renormalization Group*; Stanley 1971).

- **Wave P-C R-C3 — BE-36 reformulated to canonical Bekenstein 2004 TeVeS
  relativistic MOND.**
  - Replaced the bespoke hybrid linear blend
    `F = F_N μ(a/a_0) + F_DM (1 − μ(a/a_0))` (not in any published MOND
    literature, original to this framework) with the canonical Bekenstein
    2004 TeVeS (Tensor-Vector-Scalar gravity) relativistic completion of
    MOND: action `S = S_g + S_φ + S_A + S_matter` with three dynamical
    fields:
    - `g_μν` — metric (Einstein-Hilbert action)
    - `φ` — scalar field with MOND interpolation function `μ̃(y)`
    - `A^μ` — timelike 4-vector with Lagrange multiplier enforcing
      `A^μ A_μ = -1`
    - `S_matter` couples through the physical metric
      `ĝ_μν = e^{-2φ} g_μν − 2 sinh(2φ) A_μ A_ν`
  - The non-relativistic weak-field limit recovers the canonical MOND
    interpolation `F_eff = F_N · μ̃^{-1}(F_N/(F_N + a_0))`, reducing to
    the Milgrom `μ(x) = x/√(1+x²)` form covered by BE-38.
  - Status: `invalid` → `speculative`. TeVeS is canonical relativistic
    MOND (Bekenstein 2004 *Phys. Rev. D* 70:083509, arXiv:astro-ph/
    0403694; Famaey-McGaugh 2012 *Living Rev. Relativ.* 15:10,
    arXiv:1112.3960; Skordis 2009 *CQG* 26:143001 review); the bridge
    framing — TeVeS as the UPT gravity ↔ dark-sector bridge —
    remains the speculative element.
  - **Known issue documented:** GW170817 graviton-speed bound
    `|c_g − c|/c ≲ 10⁻¹⁵` (Abbott et al. 2017 *ApJ Lett.* 848:L13;
    Boran et al. 2018 *Phys. Rev. D* 97:041501, arXiv:1710.06168)
    strongly constrains original TeVeS variants — only carefully-
    tuned subclasses or successor RMT theories (Skordis-Złośnik 2021
    *Phys. Rev. Lett.* 127:161302, arXiv:2007.00082) survive. Marked
    as severity `other` / fixable `reformulation` for future-work
    refinement.
  - **Relationship to BE-38 clarified:** BE-38 covers the
    non-relativistic Milgrom `μ(x) = x/√(1+x²)` form (Wave I.B C4
    reformulation); BE-36 covers the relativistic completion. Different
    physical content, complementary not duplicative. dependencies:
    `[38]` records this relationship.
  - `tractability_class`: `undefined` → `numerical-tractable` (TeVeS
    PDEs solved numerically for cosmology + galaxy dynamics).
  - Test file replacement: `tests/bridges/be-36-r3-disposition.test.ts`
    deleted; `tests/bridges/be-36-reformulation.test.ts` added (14
    tests; honest-archaeology pattern).
  - Honest-claude flag: WebFetch on arXiv:astro-ph/0403694 returned
    only abstract content (TeVeS as relativistic MOND completion with
    three dynamical fields, Newtonian + MOND limits); the explicit
    action terms `S_g, S_φ, S_A, S_matter` and the physical-metric
    coupling `ĝ_μν` follow standard TeVeS-review references. The
    GW170817 constraint is sourced from review-level information.

- **Wave P-C R-C2 — BE-24 reformulated to canonical Förster (1948) FRET.**
  - Replaced the bound-violating multiplicative form
    `η_classical(1 + κ exp(-t/τ_coh) |⟨ψ_d|ψ_a⟩|²)` (admits η > 1 for
    `κ ∈ [0.1, 0.3]` and `η_classical ≈ 1`) with the canonical Förster
    (1948) FRET formulas:
    - dipole-dipole transfer rate: `k_FRET = (1/τ_D)(R_0/R)⁶`
    - bound-respecting transfer efficiency:
      `η = R_0⁶/(R_0⁶ + R⁶) = 1/(1 + (R/R_0)⁶) ∈ [0,1]` by construction
  - The "quantum enhancement factor" κ is dropped — no canonical
    photosynthesis-FRET literature uses a multiplicative coherent-
    enhancement correction. FRET itself is incoherent: it does not
    encode "quantum-coherent enhancement," and Cao 2020 *Sci. Adv.*
    6:eaaz4888 et al. show that observed long-lived FMO oscillations
    are vibrational rather than electronic.
  - Status: `invalid` → `speculative`. FRET is canonical (Förster
    1948 *Ann. Phys.* 437:55; Lakowicz 2006 textbook); the bridge
    framing — quantum coherence in photosynthesis as a UPT bridge —
    remains the speculative element.
  - `tractability_class`: `undefined` → `closed-form` (single
    algebraic formula given R, R_0, τ_D).
  - HEOM (Ishizaki-Fleming 2009 *J. Chem. Phys.* 130:234111) and
    Lindblad GKSL (Mohseni-Rebentrost-Lloyd-Aspuru-Guzik 2008 *J. Chem.
    Phys.* 129:174106; ENAQT framework) retained as alternative-path
    references for any future coherent-transport reformulation.
  - Test file replacement: `tests/bridges/be-24-r3-disposition.test.ts`
    deleted; `tests/bridges/be-24-reformulation.test.ts` added (10
    tests; honest-archaeology pattern).
  - Honest-claude flag: WebFetch on the Wikipedia "Förster resonance
    energy transfer" article confirmed `k_ET = (R_0/r)⁶/τ_D`,
    `R_0⁶ ∝ κ² Q_D J / n⁴`, and `E = 1/(1 + (r/R_0)⁶)`. The Cao 2020
    contested-coherence consensus is documented from the prior
    R3-disposition record without a separate WebFetch.

- **Wave P-C R-C1 — BE-23 reformulated to canonical SYK / Planckian-dissipation
  linear-in-T resistivity.**
  - Replaced the algebraically-vacuous form `ρ(T) = ρ_0 + AT +
    B √(ℏ/(k_B T τ_P))` (the third term collapses to `B · 1` under the
    definitional identity `τ_P · k_B T = ℏ`) with the canonical
    Planckian-dissipation linear-in-T form
    `ρ(T) = ρ_0 + (k_B T / ℏ) · (1/(n_e e²)) · α_SYK`, where the SYK
    relaxation rate `τ ~ ℏ/(k_B T)` sets the slope and `α_SYK` is a
    dimensionless O(1) coefficient depending on the SYK-q variant (q=4
    most studied; the conformal two-point function is
    `G(τ) ∝ |τ|^{-2/q}`). The "duality" framing connects to
    Maldacena-Stanford 2016 emergent SL(2,R) conformal symmetry in SYK
    and to Hartnoll-Hofman 2010 holographic momentum-relaxed strange
    metals (arXiv:0912.0008).
  - Status: `invalid` → `speculative`. Linear-in-T Planckian
    phenomenology is empirically established (Bruin 2013 *Science*
    339:804; Legros 2019 *Nature Phys.* 15:142) and the SYK
    microscopic origin is canonical (Sachdev-Ye 1993; Kitaev 2015
    KITP; Maldacena-Stanford 2016 *Phys. Rev. D* 94:106002,
    arXiv:1604.07818); the *bridge framing* — treating SYK Planckian
    dissipation as a UPT condensed-matter ↔ holography duality —
    remains the speculative element.
  - `tractability_class`: `undefined` → `numerical-tractable` (SYK
    Schwinger-Dyson equations are solvable on a grid; α_SYK is a
    single dimensionless coefficient given the chosen q).
  - Reference set extended: Sachdev-Ye 1993 PRL 70:3339; Kitaev 2015
    KITP talks; Maldacena-Stanford 2016 PRD 94:106002 (WebFetch-
    confirmed abstract); Hartnoll 2015 *Nature Phys.* 11:54;
    Hartnoll-Hofman 2010 PRB 81:155125; MSS 2016 JHEP 1608:106 (chaos
    bound); Bruin 2013 *Science* 339:804; Legros 2019 *Nature Phys.*
    15:142.
  - Test file replacement: `tests/bridges/be-23-r3-disposition.test.ts`
    deleted; `tests/bridges/be-23-reformulation.test.ts` added (10
    tests; honest-archaeology pattern from Wave-P-B).
  - Honest-claude flag: WebFetch on arXiv:1604.07818 returned only
    abstract content (emergent SL(2,R) conformal symmetry, two- and
    four-point function study); the explicit Green's function form
    `G(τ) ∝ |τ|^{-2/q}` and the resistivity-prefactor commitment
    follow standard SYK textbook references. The α_SYK bundling
    preserves the bridge framing without committing to a specific
    q-value.

- **Wave P-B R-B3 — BE-17 reformulated to canonical Einstein-Cartan torsion-spin coupling.**
  - Replaced the conflated form `R_μν^λρ = R̊_μν^λρ + K_μν^λρ +
    α(F_μν F^λρ − (1/4) g_μν F_αβ F^αβ)` (three orthogonal structural
    defects: rank-4-vs-rank-2 Maxwell-stress-energy mismatch;
    `ℓ_EM = √(ℏc/e²)` dimensionless in Gaussian / not a length in SI;
    non-canonical rank-4 contorsion `K_μν^λρ` vs the canonical rank-3
    EC contorsion `K^ρ_μν`) with the canonical Einstein-Cartan field
    equations: standard Einstein equation `R_μν − (1/2) R g_μν +
    Λ g_μν = (8πG/c⁴) T_μν` together with the algebraic torsion-spin
    coupling `T^λ_μν = (8πG/c⁴) S^λ_μν`, where `T^λ_μν` is the
    canonical rank-3 torsion tensor (antisymmetric in lower indices)
    and `S^λ_μν` is the spin angular momentum density tensor.
  - **The "Electromagnetic-Gravitational Unification via Torsion"
    claim is dropped** — EC torsion is sourced by spin angular
    momentum density, NOT by EM fields. The original BE-17 conflated
    EC theory (with spin-source torsion) with an unrelated unification
    scheme (with EM-source torsion); the EM-source claim is a
    category error. Recovering an EM-gravity bridge would require a
    separate framework (Kaluza-Klein dimensional reduction; non-
    minimal F²·R curvature coupling), each warranting its own BE entry.
  - WebFetch on Trautman 2006 (arXiv:gr-qc/0606062) confirmed the
    abstract: "Einstein-Cartan Theory ... allow[s] space-time to have
    torsion, in addition to curvature, and relating torsion to the
    density of intrinsic angular momentum."
  - References: Cartan 1922 *C. R. Acad. Sci.* 174:593; Hehl-
    vonderHeyde-Kerlick-Nester 1976 *Rev. Mod. Phys.* 48:393 (canonical
    EC review); Trautman 2006 arXiv:gr-qc/0606062 (WebFetch-
    confirmed); Shapiro 2002 *Phys. Rep.* 357:113.
  - Status: invalid → speculative (EC equations established; bridge-
    framing speculative). tractability_class: undefined → numerical-
    tractable.
  - Honest-claude flag: WebFetch returned the Trautman 2006 abstract
    only, not the full tensor-equation derivation; commitment to the
    rank-3 T^λ_μν / S^λ_μν form follows the canonical Hehl et al.
    1976 RMP convention rather than a fresh-fetch verification.
  - Replaced `tests/bridges/be-17-r3-disposition.test.ts` (5
    assertions) with `tests/bridges/be-17-reformulation.test.ts` (9
    assertions). Tests 447 → 450 (+3 net from this commit).

- **Wave P-B R-B2 — BE-13 reformulated to canonical Jacobson 1995 thermodynamic derivation of Einstein equations.**
  - Replaced the Landauer-mis-attributed form `R_μν − (1/2) R g_μν =
    (8πG/c⁴)[T_μν^matter + k_B T ln(2) I_μν]` (Landauer's principle is
    a 0+1-dim erasure-cost bound, not a stress-energy tensor; the I_μν
    term was dimensionally non-closing and double-counted information
    into a separate tensor) with the canonical Jacobson 1995
    thermodynamic-derivation form: standard Einstein field equations
    `R_μν − (1/2) R g_μν + Λ g_μν = (8πG/c⁴) T_μν`, with the
    *interpretation* that they arise as a macroscopic equation of state
    from the Clausius relation `δQ = T dS` applied to all local Rindler
    causal horizons through each spacetime point.
  - WebFetch on arXiv:gr-qc/9504004 confirmed the abstract: "The
    Einstein equation is derived from the proportionality of entropy
    and horizon area together with the fundamental relation δQ = T dS.
    The relation is required to hold for all the local Rindler causal
    horizons through each spacetime point, with δQ and T interpreted
    as the energy flux and Unruh temperature seen by an accelerated
    observer."
  - The spurious `k_B T ln(2) I_μν` term is dropped (Jacobson has no
    such term). Alternative non-equivalent thermodynamic-origin paths
    (Verlinde 2011 entropic gravity arXiv:1001.0785; Padmanabhan 2010
    emergent gravity arXiv:0911.5004) cited as comparison references;
    the Jacobson commitment is a deliberate framework choice.
  - References: Jacobson 1995 PRL 75:1260 (arXiv:gr-qc/9504004,
    WebFetch-confirmed); Einstein 1915; Bekenstein 1973 PRD 7:2333;
    Hawking 1975 CMP 43:199; Verlinde 2011 JHEP 04:029; Padmanabhan
    2010 Rep. Prog. Phys. 73:046901.
  - Status: invalid → speculative (Einstein equations established;
    information-thermodynamic-origin framing speculative).
    tractability_class: undefined → numerical-tractable.
  - Honest-claude flag: WebFetch returned the Jacobson abstract only,
    not the full tensor-equation derivation; commitment to Λ inclusion
    follows the modern convention (Jacobson 1995 derives without Λ; Λ
    is the integration-constant freedom).
  - Replaced `tests/bridges/be-13-r3-disposition.test.ts` (5
    assertions) with `tests/bridges/be-13-reformulation.test.ts` (9
    assertions). Tests 444 → 447 (+3 net from this commit).

- **Wave P-B R-B1 — BE-12 reformulated to canonical Caldeira-Leggett dephasing length.**
  - Replaced the structurally ill-defined `ξ_coh(T,N) = ξ_0 / √(1 +
    N/N_c + (T/T_c)^ν)` ansatz (three undefined quantities: ξ_0,
    ω_decoherence, cube exponent in N_c) with the canonical Caldeira-
    Leggett dephasing length / thermal de Broglie wavelength form:
    `ξ_dephasing(T) = ℏ / √(2 m k_B T γ)` where m is particle mass,
    γ is the Caldeira-Leggett Ohmic friction (dissipation) coefficient,
    and the form is dimensionally consistent with the thermal de
    Broglie wavelength `λ_T = h / √(2π m k_B T)`.
  - WebFetch on Wikipedia "Thermal de Broglie wavelength" confirmed the
    canonical λ_T form. Caldeira-Leggett 1981 *Phys. Rev. Lett.* 46:211
    and Caldeira-Leggett 1983 *Physica A* 121:587 provide the
    γ-dependent dissipation framework.
  - References: Caldeira-Leggett 1981 PRL 46:211 (canonical system-bath
    coupling); Caldeira-Leggett 1983 Physica A 121:587 (full QBM
    derivation); Wikipedia thermal de Broglie wavelength;
    Breuer-Petruccione 2002 §3.6 + §4.5 (weak-coupling dephasing
    review); Zurek 2003 RMP 75:715 (mesoscopic framing extension).
  - Status: invalid → speculative (canonical formula; speculative
    mesoscopic-coherence framing for the N-particle extension).
    tractability_class: undefined → closed-form. Dependency on BE-11
    preserved (γ here is the same Ohmic friction coefficient that
    BE-11's Lindblad rate parametrizes).
  - Honest-claude flag: WebFetch on arXiv:cond-mat/0503100 (the
    candidate Hänggi review) returned a different paper (photonic
    Fano resonators); the γ-prefactor commitment follows the Caldeira-
    Leggett 1983 textbook convention rather than a fresh-fetch
    confirmation. Dimensional consistency with the WebFetch-confirmed
    thermal-de-Broglie form is the validation anchor.
  - Replaced `tests/bridges/be-12-r3-disposition.test.ts` (7
    assertions) with `tests/bridges/be-12-reformulation.test.ts` (9
    assertions). Tests 442 → 444 (+2 net from this commit).

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
    43:199; Stanford-Susskind 2014 PRD 90:126007 (arXiv:1406.2678; complexity-volume; citation corrected Wave R 2026-05-06 per Researcher iter-7 C2 — prior versions conflated arXiv:1408.2823 [Susskind-Zhao "Switchbacks"] with PRD 90:126007 [arXiv:1406.2678 Stanford-Susskind])
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

