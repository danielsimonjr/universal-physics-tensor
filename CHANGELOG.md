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

### Changed
- **BE-22 (Topological Entanglement Entropy — QG Link) reformulated to canonical Kitaev-Preskill / Levin-Wen form (R2 → R5-leaning, 2026-05-05).** Replaced the originally-stated three-term form `S_topo = -γ + α log(ξ/a) + β(T/T_c)^ν log(A/ℓ_P²)` — which had area-law-doubled and finite-T extension issues and was not derivable from any standard TEE construction — with the canonical single-subsystem form `S(R) = α L(R) − γ + O(L^-1)` (Kitaev-Preskill 2006 *Phys. Rev. Lett.* 96:110404, arXiv:hep-th/0510092; Levin-Wen 2006 *Phys. Rev. Lett.* 96:110405, arXiv:cond-mat/0510613). `dimensional_signature` populated `[1]` (dimensionless entropy in nats). `known_issues` collapsed from two `spec-edit` entries to one `phenomenological-ansatz` / `reformulation` entry that documents the remaining QG-link gap. References added (Kitaev-Preskill, Levin-Wen). Status remains `speculative` — the formula itself is established, but the "QG link" framing is original to this catalog and not in either reference. Spec section in `docs/specification/Part-II.md` updated with the new formula and an AST-encoding callout.
- **BE-37 (Variable Speed of Light Cosmology) status: speculative → invalid (R3 disposition, 2026-05-05).** Daniel accepted the Wave-2 disposition brief's recommendation. Two independent obstructions block reformulation: (1) Ellis-Uzan 2005 operational-meaninglessness critique (arXiv:gr-qc/0305099) — bare c(t) has no falsifiable content without specifying which c varies and which dimensionless constant ratio is changing; (2) the three canonical VSL formulations (Albrecht-Magueijo, Moffat, Barrow) are non-equivalent and none cleanly survives the Ellis-Uzan critique. Original c(t) ansatz preserved as historical record. Two known_issues with `fixable: 'unfixable-must-mark-invalid'` (`src/bridges/index.ts`). Spec section in `docs/specification/Part-II.md` and `docs/planning/Bridge-Remediation-Plan.md` updated. Replaces obsolete R2-pin tests `tests/bridges/be-37-{preserve,r2-spec}.test.ts` (deleted) with `tests/bridges/be-37-r3-disposition.test.ts` (added). Honest-archaeology pattern: disposition change requires deleting the prior pins, making the choice explicit.

### Documentation
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
- `src/dimensional/README.md` updated to reflect Tier-5 progress: 6 of
  40 entries now have `dimensional_signature` populated, BE-11/14 have
  full AST encodings, and `inferDimensionForBridge` is now the
  cross-checking entry point.
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

