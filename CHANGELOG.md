# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
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

