# UPT v0.3.0 — Tests Bucket Code Review Summary

---

## Critical & High Findings

### Critical

**`tests/dimensional/metric-tensor.test.ts:131–145`** — Wrong error class for duplicate-label case
Asserts `MetricSignatureError` for a duplicate-index structural violation; should assert `DuplicateIndexError`. Conflates two distinct invariants; will silently mask a missing error class and produce a misleading failure when `DuplicateIndexError` is introduced in v0.3.5+.
**Fix:** Import and assert `DuplicateIndexError`, or add `.message` assertion with `// code: DUPLICATE_INDEX` if reuse is intentional.

---

**`tests/dimensional/part-viii-spec-vs-impl.test.ts:32` + `extractSpecRules:38–44`** — Stateful module-level regex causes silent marker drops on second call
`SPEC_MARKER_RE` and `TEST_REF_RE` are declared at module scope with `/g`. `lastIndex` reset fires only once before the file loop, not per file. Under any re-entrant or interleaved call, markers at the start of the second spec file are skipped.
**Fix:** Construct `new RegExp(...)` instances inside each function; remove module-level regex constants entirely.

---

**`tests/dimensional/part-viii-spec-vs-impl.test.ts:14–19` + `indexTestReferences:62–72`** — Orphan-anchor comments self-fulfill the bidirectional drift check
The JSDoc block contains literal `TENSOR-RULE: pderiv-of-metric-composes` and `TENSOR-RULE: v030-additive-semver-minor-bump` strings. `TEST_REF_RE` matches comments, so the drift guard marks itself as a test reference for these rules. A genuinely untested rule can be silently whitelisted by adding it to the comment block.
**Fix:** Use a `DEFERRED_RULES` map with a syntax `TEST_REF_RE` cannot match; remove TENSOR-RULE strings from the JSDoc; emit a `console.warn` for deferred rules in the `it.each` callback rather than passing silently.

---

### High

| File & Location | Issue | Fix |
|---|---|---|
| `metric-tensor.test.ts:95–108` | Mixed-variance test expects `MetricSignatureError`; TENSOR-RULE `metric-tensor-indices-same-variance` is a structural index rule, not a signature rule. Swapped code paths would go undetected. | Introduce `MetricVarianceError`; assert `toThrow(MetricVarianceError)` or add `.toThrow(/same-variance/i)` snapshot. |
| `metric-tensor.test.ts:50–57` | Contravariant metric test never asserts `result.ok === true` or `result.inferredDimension`; silent failure possible. | Add `expect(result.ok).toBe(true)` and `expect(result.inferredDimension).toEqual(DIMENSIONLESS)`. |
| `metric-tensor.test.ts` (missing) | No test for rank-0 metric (`indices: []`). Off-by-one in rank check undetectable. | Add `it('rejects rank-0 metric', ...)` asserting `InvalidMetricRankError`. |
| `metric-tensor.test.ts` (missing) | No test for `signature: undefined` (runtime JSON deserialization path). | Add test casting to `unknown as MetricTensorNode` with missing signature field. |
| `kronecker-delta.test.ts:42–45` | "Lower-then-upper" test checks same expected values as canonical test; cannot distinguish correct implementation from label-keyed lookup bug. | Use distinct labels (e.g. `α`/`β`) not present in the canonical test. |
| `kronecker-delta.test.ts` (missing) | No test for `δ^μ_μ` (same label, mixed variance). Contraction vs. error behavior undefined; load-bearing for v0.4.0. | Add test documenting intended behavior (scalar with `freeIndices.size === 0`, or typed throw). |
| `kronecker-delta.test.ts:103–116` | "Allows user-specified non-DIMENSIONLESS dim" blesses a physically incorrect contract. Dimensioned Kronecker delta produces wrong units in any contraction. | Delete test and enforce rejection, or gate behind explicit `allowDimensionOverride: true` flag. |
| `tensor-partial-derivative.test.ts:84–99` | "Ignores wrt own free indices" test is structurally identical to the first test; cannot distinguish correct suppression from accidental propagation. | Use a `wrt` symbol with a free index label distinct from `wrtIndex.label`; assert `freeIndices.size === 1`. |
| `tensor-partial-derivative.test.ts:101–118` | "Inherits role from of" test asserts only `result.ok === true`; the named TENSOR-RULE is entirely unverified. | Add `inferredRole` to `ValidationResult` and assert it, or replace with `it.todo` citing v0.4.0 deferral. |
| `metric-validation-errors.test.ts:38–46` | Only `'upper'` variance path tested for `KroneckerVarianceError`; `'lower'` path silently broken if implementation special-cases `'upper'`. | Add parameterized test for `'lower'`; assert `err.bothVariance === 'lower'` and message contains `'lower'`. |
| `metric-validation-errors.test.ts:48–56` | `PartialDerivativeIndexVarianceError` tested only as a constructor; the throwing site is never exercised. | Import the partial-derivative validator and assert it throws when given an upper `wrtIndex`. |
| `metric-helpers.test.ts:8–22` | `metric()` variance constraint never tested; upper-index metric silently accepted. | Add `it('throws when an upper index is supplied', ...)`. |
| `metric-helpers.test.ts:25–38` | `kronecker()` variance constraint never tested; same-variance pair silently accepted. | Add test asserting throw for `('lower', 'lower')` pairing. |
| `metric-helpers.test.ts:41–52` | `pderiv()` `wrtIndex` variance never validated; `'upper'` silently accepted. | Add negative test for `variance: 'upper'`. |
| `metric-helpers.test.ts:41–52` | `pderiv()` output dimension never checked; `∂φ/∂x` should be `LENGTH^{-1}`, not `DIMENSIONLESS`. | Assert `d.dim` equals `{ L: -1, M: 0, T: 0, ... }`. |
| `raise-lower.test.ts:80–83` | "Rejects raise() when label is already upper" uses bare `.toThrow()`; any exception passes. | Assert `toThrow(RaiseVarianceError)` or `/already upper|variance/i`. |
| `raise-lower.test.ts:74–77` | "Rejects raise() when label is absent" uses bare `.toThrow()`; `TypeError` indistinguishable from `LabelNotFoundError`. | Assert `toThrow(LabelNotFoundError)`. |
| `error-message-discoverability.test.ts:13–18` | TENSOR-RULE `variance-mismatch-suggests-raise-lower` only tested with `variance='upper'`; `'lower'` path unverified. Directional hint correctness untestable. | Add `VarianceMismatchError('ν', 'lower')` test asserting message contains `'raise('`; tighten `'upper'` test to assert `'lower('` is the primary suggestion. |
| `error-message-discoverability.test.ts:13–24` | `VarianceMismatchError` never checked for `instanceof Error`; broken `super()` call would silently break all catch sites. | Add `expect(err).toBeInstanceOf(Error)`, `expect(err.name).toBe('VarianceMismatchError')`. |
| `error-message-discoverability.test.ts:1–30` | All three tests construct errors directly via `new`; `raise()`, `lower()`, and contraction path never verified to actually throw these types. | Add integration-style assertions calling the library functions with invalid inputs. |
| `metric-ast-serialization.test.ts:14–55` | Round-trip tests use `toEqual` on `JSON.parse` output; class instances silently lose prototype. `validate(parsed)` not called for kronecker or pderiv. | Add type-guard checks (`isMetricNode(parsed)`) or document plain-object assumption; call `validate()` on all parsed nodes. |
| `metric-ast-serialization.test.ts:24–28` | `validate()` integration test compares only `ok` and `inferredDimension`; index-variance metadata silently dropped. | Deep-equal the full `validate` result; use non-trivial dimension to exercise comparison. |
| `metric-ast-serialization.test.ts:41–55` | `pderiv` test never calls `validate(dPhi)`; variance mismatch between `x` (upper) and `wrtIndex` (lower) unverified. | Add `validate(dPhi)` with `ok` assertion; add negative variance-mismatch case. |
| `covariant-derivative-preview.test.ts:17–28` | `pderiv` denominator variance inference untested; third argument passed explicitly, so `pderiv` could ignore denominator variance entirely and test still passes. | Add variant omitting third argument (if API supports inference) or negative test for explicit `'upper'` wrtIndex. |
| `covariant-derivative-preview.test.ts` (missing) | `∂g/∂x` dimension (`LENGTH^{-1}`) never asserted; dimensional regression undetectable. | Assert `result.dimensions` equals `{ L: -1, M: 0, T: 0, ... }`. |
| `be-37-shapiro-eikonal-structural.test.ts` (entire) | Index-variance contract (contravariant g^μν, covariant ∂_μ, ∂_ν) never asserted; mis-typed AST passes all tests. | Add test walking AST to find `metric-tensor` node and assert `variance === 'contravariant'` on both indices; same for pderiv nodes. |
| `be-37-shapiro-eikonal-structural.test.ts:37–50` | `hasKind` silently skips `indices`/`slots` array fields; target kind nested there returns `false`. | Rewrite to recurse over all own enumerable properties: `Object.values(n).some(v => hasKind(v, target))`. |
| `inverse-metric-consistency.test.ts:13` | No commented-out import stubs; API renames between now and v0.3.5 will be caught only at activation time, not continuously. | Add `// v0.3.5: uncomment` import stubs for `MetricTensor`, `KroneckerDelta`, `contract`, `ValidationResult`. |

---

## Medium Findings

**Index/free-index assertion gaps** (`metric-tensor.test.ts:51`, `kronecker-delta.test.ts:24–29`, `covariant-derivative-preview.test.ts:24`): `freeIndices.size` checked but exact key set never asserted. A phantom key or leaked denominator index passes silently. Add `expect([...result.freeIndices.keys()].sort()).toEqual([...expected].sort())` and explicit `has(label) === false` guards.

**Missing multi-index / union-rule tests** (`tensor-partial-derivative.test.ts`, `metric-helpers.test.ts:41–52`, `raise-lower.test.ts`): TENSOR-RULE `pderiv-free-indices-union` never tested with `of` carrying 2+ free indices. `lower()` has no multi-index operand test. `pderiv(A^ν, x, μ)` index-union case absent. Add rank-2 `of` test asserting `freeIndices.size === 3`; add symmetric `lower` multi-index test.

**Dimension arithmetic not pinned to exponents** (`tensor-partial-derivative.test.ts:120–143`, `be-37-shapiro-eikonal-structural.test.ts:55–60`): Nested pderiv and eikonal dimension tests rely on `divide()` object equality rather than explicit exponent assertions. A numerically wrong `divide` implementation passes. Assert individual SI exponents (`dim.L`, `dim.M`, etc.) directly.

**Error message content under-specified** (`metric-validation-errors.test.ts:32`, `metric-validation-errors.test.ts:38–45`, `error-message-discoverability.test.ts:26–31`): `MetricSignatureError` message tested for substring of `reason` rather than `reason` itself. `InvalidKroneckerRankError` message never checked to contain the actual rank value. `IndexLabelCollisionError` second argument semantics undocumented. Add `expect(err.message).toContain(err.reason)`, `expect(err.message).toContain(String(err.actualRank))`, and context-aware regex for collision count.

**Missing rank-0 tests** (`metric-tensor.test.ts`, `kronecker-delta.test.ts`): Both rank-rejection suites cover rank-1 and rank-3 but not rank-0 (`indices: []`). A validator checking `length > 2 || length < 1` instead of `length !== 2` is undetected. Add `indices: []` cases asserting the appropriate rank error.

**Signature/index-count mismatch untested** (`metric-helpers.test.ts:8–22`): `metric()` accepts `'+,-,-,-'` (4-component) with 2-index node; mismatch never rejected. Add test asserting throw when signature component count ≠ index count.

**`ValidationResult` schema gaps** (`metric-validation-errors.test.ts`, `kronecker-delta.test.ts`): No test checks `err.stack !== undefined` (broken `super()` call undetectable). `contractedIndices` field on validator result never asserted for Kronecker delta. Add `expect(err.stack).toBeDefined()` to one representative test; add `expect(result.contractedIndices.size).toBe(0)` for `δ^μ_ν`.

**`it.todo` stubs lack skeleton assertions** (`covariant-derivative-preview.test.ts:31–38`, `inverse-metric-consistency.test.ts:15–16`): Christoffel and covariant-derivative todos provide no expected API shape, free-index structure, or dimension. Convert to `it.skip` with commented-out assertions specifying expected `freeIndices` (e.g. `{λ: upper, μ: lower, ν: lower}`) and dimension (`DIMENSIONLESS`). Add missing todo for mixed-variance identity: `g_ij · g^jk` must yield mixed-variance Kronecker delta, not fully covariant/contravariant.

**`part-viii-spec-vs-impl.test.ts` structural gaps**: Hard-coded baseline `>= 19` is a floor, not a snapshot — new rules added silently pass. `listTestFiles` recurses into `node_modules`/`dist` if `TESTS_DIR` is misconfigured. Orphan check does not distinguish Part-VII-only references from Part-VIII references. Fix: use `toEqual(19)` with update comment; add `SKIP_DIRS` set; add informational log for cross-spec refs.

**`be-37-shapiro-eikonal-structural.test.ts` gaps**: RHS zero node never checked for AST `kind` — a raw JS `0` passes. Einstein contraction pairing (upper μ on metric × lower μ on pderiv) never verified; `freeIndices.size === 0` is consistent with a validator that strips all indices without checking pairing. Add `kind` assertion on RHS; expose and assert `contractedIndexPairs` or file as v0.3.5 forward-compat gap.

**`inverse-metric-consistency.test.ts` doc/scope**: Second todo conflates a `ValidationResult` schema change with a behavioral test. Split into three: schema field presence, `severity:'warning'` on numerical mismatch, `severity:'error'` on variance inconsistency. File header does not record the agreed `Violation.severity` shape; add it as a comment.

---

## Low Findings

- `metric-tensor.test.