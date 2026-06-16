# UPT v0.3.0 Consolidated Code Review

---

## Executive Summary

Three **critical** bugs threaten correctness: (1) `raise()`/`lower()` can generate duplicate free-index labels when the metric's own indices collide with operand indices; (2) `integral`/`derivative` validators share a mutable context object, leaking tensor free-indices into parent scopes; (3) `validateKroneckerDelta` silently accepts `δ^μ_μ`, miscounting contracted indices. Two **high-impact spec gaps** block v0.4.0: the `pderiv` label-collision rule contradicts Christoffel requirements, and `contract()` is called with three arguments in the worked example despite being a binary API. Test infrastructure has a **critical self-fulfilling drift guard**: orphan-anchor comments contain literal `TENSOR-RULE:` strings that match the regex, whitelisting untested rules.

---

## Critical Findings

| File : Location | Issue | Fix | Effort |
|---|---|---|---|
| **`src/dimensional/metric.ts:148-149, 196-197`** | `raise()`/`lower()` seed `taken` set without the metric's own index labels. `freshLabel` can return `gInverse.indices[0].label`, producing two free indices with the same name in the output tensor-product. | Seed `taken` with `gInverse.indices.map(i => i.label)` before calling `freshLabel`. | **TRIVIAL** |
| **`src/dimensional/validator.ts:~270-295`** | `integral`/`derivative` cases spread `ctx` shallowly, sharing the same `freeIndices` Map reference. Tensor free-indices from the integrand leak into the parent accumulator. | Replace spread-ctx with `inferArgLocal` helper (same pattern as `op '*'` at line ~200). | **SMALL** |
| **`src/dimensional/metric-validators.ts:~110-130`** | `validateKroneckerDelta` does not reject duplicate labels (e.g., `δ^μ_μ`). `freeIndices` Map silently overwrites first entry; downstream contraction logic miscounts free indices. | Add `if (a.label === b.label) throw new KroneckerVarianceError(...)` before the freeIndices loop. | **TRIVIAL** |
| **`src/bridges/equations/be-37-shapiro-delay.ts:~260-270`** | `pderiv` dimension assumed `DIMENSIONLESS` (LENGTH/LENGTH), but if `pderiv` inherits numerator dim, `dmu_S.dim = LENGTH` and downstream `contract` produces wrong dimension. | Assert `dmu_S.dim === DIMENSIONLESS` at call site; add unit test checking `validate(dmu_S).inferredDimension === DIMENSIONLESS`. | **SMALL** |
| **`tests/dimensional/part-viii-spec-vs-impl.test.ts:14-19, 62-72`** | Orphan-anchor JSDoc contains literal `TENSOR-RULE: pderiv-of-metric-composes` strings. `TEST_REF_RE` matches comments, so the drift guard marks itself as a test reference. Genuinely untested rules can be silently whitelisted by adding them to the comment. | Use a `DEFERRED_RULES` map with syntax `TEST_REF_RE` cannot match (e.g., `{ 'pderiv-of-metric-composes': 'v0.4.0' }`); remove TENSOR-RULE strings from JSDoc; emit `console.warn` for deferred rules. | **SMALL** |
| **`tests/dimensional/part-viii-spec-vs-impl.test.ts:38-44`** | `SPEC_MARKER_RE` and `TEST_REF_RE` declared at module scope with `/g`. `lastIndex` reset fires only once; second call skips markers at the start of the second spec file. | Construct `new RegExp(...)` instances inside `extractSpecRules` and `indexTestReferences`; remove module-level regex constants. | **TRIVIAL** |
| **`tests/dimensional/metric-tensor.test.ts:131-145`** | Duplicate-label test asserts `MetricSignatureError`; should assert `DuplicateIndexError`. Conflates two distinct invariants; will mask missing error class. | Import and assert `DuplicateIndexError`, or add `.message` assertion with `// code: DUPLICATE_INDEX`. | **TRIVIAL** |
| **`Part-VIII-Metric-Layer.md:§VIII.4`** | `wrt.dim` is never defined as node-level vs. per-component; readings diverge for rank-2 `wrt`, making `pderiv-dim-divides-by-wrt-dim` and `pderiv-ignores-wrt-own-indices` contradictory. | Replace `wrt.dim` with "the `dim` field of the `wrt` ExprNode (node-level uniform-component dimension per §VIII.10)." Add note for rank-N `wrt`. | **SMALL** |
| **`Part-VIII-Metric-Layer.md:§VIII.8`** | `contract(g_inverse_eikonal, dmu_S, dnu_S)` — `contract()` is binary in v0.2.0; no variadic overload defined. Worked example is either wrong or introduces unspecified API. | Rewrite as nested binary calls `contract(contract(g_inverse_eikonal, dmu_S), dnu_S)` with associativity note, **or** add §VIII.X specifying variadic `contract(...operands)`. | **SMALL** |

---

## High-Priority Findings

### Index & Free-Index Correctness

| File : Location | Issue | Fix | Effort |
|---|---|---|---|
| `src/dimensional/metric-validators.ts:~175-195` | `validatePartialDerivative` discards `wrt.freeIndices` without checking collision against `of.freeIndices`. Hidden collisions produce ill-formed output. | After computing both results, iterate `wrtResult.freeIndices` and throw `IndexLabelCollisionError` on any key present in `ofResult.freeIndices`. | **SMALL** |
| `src/dimensional/metric.ts:100-109` | `collectFreeIndexLabels` records contracted dummies (counts.upper > 0 AND counts.lower > 0) as free upper indices. `raise()` then throws misleading "already upper" error. | Add `if (counts.upper > 0 && counts.lower > 0) continue;` before the variance branch. | **TRIVIAL** |
| `src/dimensional/validator.ts:~340-365` | `validateEquation` checks dimensional homogeneity but never compares `lhsCtx.freeIndices` vs `rhsCtx.freeIndices`. `T^μν = S^μ` passes with `ok: true`. | Add `freeIndicesEqual` check after dimension check; push violation on mismatch. At minimum add `// TODO(Task 7)` and failing test. | **SMALL** |
| `src/bridges/equations/be-37-shapiro-delay.ts:~290` | `contract(g_inverse_eikonal, dmu_S, dnu_S)` — if `contract` is binary, `dnu_S` is silently dropped, producing rank-2 tensor instead of scalar. | Use sequential binary contractions: `contract(contract(g_inverse_eikonal, dmu_S), dnu_S)`. Add test asserting `BE37_EIKONAL_LHS` has zero free indices. | **TRIVIAL** |
| `tests/dimensional/kronecker-delta.test.ts` (missing) | No test for `δ^μ_μ` (same label, mixed variance). Contraction vs. error behavior undefined; load-bearing for v0.4.0. | Add test documenting intended behavior (scalar with `freeIndices.size === 0`, or typed throw). | **TRIVIAL** |
| `tests/dimensional/raise-lower.test.ts` (missing) | No test for alpha-conversion collision case where `gInverse.indices[1].label` is already a free index in `operand`. | Add test: operand has free index `ν`, gInverse has `indices[1].label = 'ν'`; assert result contains no duplicate `ν`. | **SMALL** |

### Dimension Inference & Validation

| File : Location | Issue | Fix | Effort |
|---|---|---|---|
| `src/dimensional/metric.ts:162, 210` | `raise()`/`lower()` return `TensorProductNode` with no `dim` field. v0.3.5 numerical backend reading `node.dim` will see `undefined`. | Return `{ kind: 'tensor-product', args: [...], dim: operand.dim }`. | **TRIVIAL** |
| `src/bridges/equations/be-37-shapiro-delay.ts:~215` | Guard rejects `R_near_m > R_far_m` but allows `R_near_m === R_far_m`, silently returning `ln(1) = 0`. | Change guard to strict `>=`; update error message to "ratio inside ln must be > 1". | **TRIVIAL** |
| `tests/dimensional/covariant-derivative-preview.test.ts` (missing) | `∂g/∂x` dimension (`LENGTH^{-1}`) never asserted; dimensional regression undetectable. | Assert `result.dimensions` equals `{ L: -1, M: 0, T: 0, ... }`. | **TRIVIAL** |
| `tests/bridges/be-37-shapiro-eikonal-structural.test.ts` (missing) | Index-variance contract (contravariant g^μν, covariant ∂_μ, ∂_ν) never asserted; mis-typed AST passes all tests. | Add test walking AST to find `metric-tensor` node and assert `variance === 'contravariant'` on both indices; same for pderiv nodes. | **SMALL** |

### Error Handling & Reporting

| File : Location | Issue | Fix | Effort |
|---|---|---|---|
| `src/dimensional/validator.ts:~215-230` | `TensorInScalarOpError` is thrown (not recorded as violation) in `op '*'`/`'/'`/`'^'`. Callers checking `result.ok` never see the error. | Catch inside `validate()`/`validateEquation()` and push violation, or document that `validate()` may throw and add try/catch at all call sites. | **MEDIUM** |
| `src/dimensional/validator.ts:~320-330` | `tensor-partial-derivative` case has no try/catch, unlike `tensor-product`. `VarianceMismatchError` from `validatePartialDerivative` propagates uncaught. | Wrap in same try/catch pattern used by `tensor-product`, or convert caught errors to violations. | **SMALL** |
| `src/dimensional/errors.ts:68-73` | Deprecation notice says `RepeatedDummyLabelError` removed in v0.3.0; alias still present. Stale marker will misfire automated cleanup tooling. | Delete alias + add BREAKING CHANGE to CHANGELOG, or update comment to v0.4.0. | **TRIVIAL** |
| `tests/dimensional/metric-validation-errors.test.ts:48-56` | `PartialDerivativeIndexVarianceError` tested only as constructor; throwing site never exercised. | Import partial-derivative validator and assert it throws when given upper `wrtIndex`. | **SMALL** |
| `tests/dimensional/error-message-discoverability.test.ts:1-30` | All three tests construct errors via `new`; `raise()`, `lower()`, and contraction path never verified to actually throw these types. | Add integration-style assertions calling library functions with invalid inputs. | **SMALL** |

### Spec Gaps Blocking v0.4.0

| File : Location | Issue | Fix | Effort |
|---|---|---|---|
| `Part-VIII-Metric-Layer.md:§VIII.9 & §VIII.4` | Collision rule rejects `pderiv(g_lower, x, {label:'ν'})` when `g_lower` already has index ν — but this is exactly the Christoffel building block. | Document that users must alpha-rename `of`'s indices before calling `pderiv` when labels collide (option A, safest for v0.3.0), with explicit example in §VIII.9. | **SMALL** |
| `Part-VIII-Metric-Layer.md:§VIII.2 & §VIII.5` | Single `MetricSignatureError` covers three structurally distinct failures: mixed-variance indices, malformed signature string, wrong-variance metric in `raise()`. Programmatic branching impossible. | Split into `MetricIndexVarianceError`, `MetricSignatureFormatError`, `RaiseLowerMetricVarianceError`. Retire or demote `MetricSignatureError` to base class. | **MEDIUM** |
| `Part-VIII-Metric-Layer.md:§VIII.5` | `raise-requires-label-present-in-operand` names no error class. Not in §VIII.11's subclass list. | Name `RaiseLowerLabelError`; add to §VIII.11; specify distinct messages for "label not found" vs. "label already upper." | **SMALL** |
| `Part-VIII-Metric-Layer.md:§VIII.2 & §VIII.8` | No test file specified for any metric-tensor validation error path (malformed signature, empty signature, mixed-variance, invalid rank). | Add `tests/dimensional/metric-tensor-validation.test.ts` covering cases (a)–(e) with specific error-class assertions; reference in §VIII.2. | **MEDIUM** |

---

## Medium Findings

### Consolidated by Category

**Error message quality**
- `src/dimensional/errors.ts:~52-56` — `DuplicateIndexLabelError` message describes product-level rule, not declaration-time uniqueness. Rewrite: *"Each label must be unique within a single tensor symbol's declaration; to contract, form a tensor-product."*
- `src/dimensional/errors.ts:~107-110` — `VarianceMismatchError` cites "v0.2.0 has no metric tensor" (wrong in v0.3.0). Remove version clause; direct users to `raise()`/`lower()`.
- `src/dimensional/errors.ts:213-222` — `InvalidKroneckerRankError` conflates rank with variance: "(exactly one upper + one lower index)" → "(exactly two indices)"; variance hint belongs only in `KroneckerVarianceError`.

**Validation result schema gaps**
- `src/dimensional/metric-validators.ts:~40-45, 60-85` — `isValidSignature` never validates token count matches tensor dimensionality. Expose `signatureRank: number` in `MetricTensorValidationResult`.
- `src/dimensional/metric-validators.ts` — Parsed signature discarded after validation; v0.4.0 Christoffel validators will need to re-parse. Add `readonly signatureParts: ReadonlyArray<'+' | '-'>` to result type.
- `src/dimensional/validator.ts:~185-195` — `resolveChildForPartialDerivative` reads `typed.role` from raw node rather than from `validateTensorSymbol`'s result, bypassing normalisation.

**Alpha-conversion & fresh-label generation**
- `src/dimensional/metric.ts:~152-159` — Alpha-conversion always uses `index[0]` as contraction dummy regardless of which slot matches `label`. Metric symmetry makes this accidentally correct, but assumption is undocumented. Add: `// INVARIANT: metric symmetry assumed; index[0] is always the contraction dummy.`
- `src/dimensional/metric.ts:~88-92` — `freshLabel` base is always `gInverse.indices[1].label`; if that label is `''`, scheme produces `_1`, `_2`, … which can collide with user labels. Add non-empty label validation to `metric()` constructor.
- `Part-VIII-Metric-Layer.md:§VIII.5` — `raise-lower-fresh-label-deterministic` scoped to single run; no cross-version stability guarantee. Stored ASTs will diverge between v0.3.0 and v0.3.5. Declare fresh labels non-public-contract and require call-site form for storage, **or** pin scheme as `<label>_<zero-based-counter>` as SemVer-minor-stable commitment.

**BE-37 bridge issues**
- `src/bridges/equations/be-37-shapiro-delay.ts:~155` — `THREE_EXP` is `sym('3', DIMENSIONLESS)` (symbol node). If validator's `^` handler requires numeric literal, `BE37_C_CUBED` dimension inference fails silently. Replace with `{ kind: 'number', value: 3, dim: DIMENSIONLESS }`.
- `src/bridges/equations/be-37-shapiro-delay.ts:~195` — PPN parameter γ hardcoded to 1 with no extension point. Add optional `gamma?: number = 1` to `ShapiroInputs`; export `BE37_GAMMA`/`BE37_PPN_PREFACTOR` now.
- `src/bridges/equations/be-37-shapiro-delay.ts:~248-268` — `x_coord` uses label `α` but `pderiv` output uses `μ`/`ν`. If `pderiv` uses `wrt` label as output label, `contract` with `g_inverse` finds no matching pair and produces rank-4. Align labels or add runtime assertion.
- `src/bridges/equations/be-37-shapiro-delay.ts:~230-240, ~300-310` — `validateBE37Dimensions` / `validateBE37EikonalDimensions` return untagged `DimensionValidationReport`; bulk CI sweeps cannot identify which bridge failed. Add `bridgeId: 37` and `form: 'scalar' | 'eikonal'` fields.

**Test coverage gaps**
- `tests/dimensional/metric-tensor.test.ts:95-108` — Mixed-variance test expects `MetricSignatureError`; `metric-tensor-indices-same-variance` is structural index rule, not signature rule. Introduce `MetricVarianceError`.
- `tests/dimensional/metric-tensor.test.ts:50-57` — Contravariant metric test never asserts `result.ok === true` or `result.inferredDimension`. Add both.
- `tests/dimensional/kronecker-delta.test.ts:42-45` — "Lower-then-upper" test checks same expected values as canonical test; cannot distinguish correct implementation from label-keyed lookup bug. Use distinct labels.
- `tests/dimensional/kronecker-delta.test.ts:103-116` — "Allows user-specified non-DIMENSIONLESS dim" blesses physically incorrect contract. Delete test and enforce rejection, or gate behind explicit `allowDimensionOverride: true` flag.
- `tests/dimensional/tensor-partial-derivative.test.ts:84-99` — "Ignores wrt own free indices" test structurally identical to first test. Use `wrt` symbol with free index label distinct from `wrtIndex.label`.
- `tests/dimensional/tensor-partial-derivative.test.ts:101-118` — "Inherits role from of" test asserts only `result.ok === true`; named TENSOR-RULE entirely unverified. Add `inferredRole` to `ValidationResult` and assert it, or replace with `it.todo`.
- `tests/dimensional/metric-helpers.test.ts:8-22` — `metric()` variance constraint never tested; upper-index metric silently accepted. Add negative test.
- `tests/dimensional/metric-helpers.test.ts:41-52` — `pderiv()` `wrtIndex` variance never validated; `'upper'` silently accepted. Add negative test.
- `tests/dimensional/metric-helpers.test.ts:41-52` — `pderiv()` output dimension never checked; `∂φ/∂x` should be `LENGTH^{-1}`, not `DIMENSIONLESS`. Assert `d.dim`.
- `tests/dimensional/raise-lower.test.ts:80-83, 74-77` — Rejection tests use bare `.toThrow()`; any exception passes. Assert specific error classes.
- `tests/dimensional/metric-ast-serialization.test.ts:14-55` — Round-trip tests use `toEqual` on `JSON.parse` output; class instances lose prototype. Add type-guard checks or call `validate()` on all parsed nodes.
- `tests/bridges/be-37-shapiro-eikonal-structural.test.ts:37-50` — `hasKind` silently skips `indices`/`slots` array fields; target kind nested there returns `false`. Rewrite to recurse over all own enumerable properties.

**Spec clarity & forward-compat**
- `Part-VIII-Metric-Layer.md:§VIII.4` — `pderiv-rank-equals-of-rank-plus-one`: rank of `tensor-partial-derivative` node never defined recursively, blocking second-order derivatives. Add: "rank of a `tensor-partial-derivative` node = `rank(of) + 1`."
- `Part-VIII-Metric-Layer.md:§VIII.1` — Signature production rule: `"+" | "-"` outer alternation makes bare `-` match two alternatives; 1-entry signature for rank-2 metric accepted. Fix to `("+" | "-") ("," ("+" | "-"))*`.
- `Part-VIII-Metric-Layer.md:§VIII.10` — `tensor-partial-derivative` omitted from v0.5.0 `DimensionMatrix` refactor list despite having computed output dim. Add it.
- `Part-VIII-Metric-Layer.md:§VIII.7` — `_origin` provenance stripped on JSON serialization with no round-trip contract. Add explicit note that provenance is ephemeral.
- `Part-VIII-Metric-Layer.md:§VIII.4` — `pderiv-role-inherits-from-of` cites "Design §13 Q1 locked decision" — opaque. Replace with `docs/planning/design-decisions.md#metric-layer-q1-role-inheritance`.

---

## Low Findings

- `src/dimensional/errors.ts:143-150` — `FreeIndexMismatchError` takes free-form string; add structured `expected`/`actual` Map fields.
- `src/dimensional/errors.ts:157-168` — `TensorInScalarOpError.op` typed as `string`; narrow to `ScalarOp = '*' | '/' | '^'`.
- `src/dimensional/metric-validators.ts:~145` — `CovariantIndex.variance` declared as string literal `'lower'` rather than `Variance` union; makes `TensorIndex` unassignable without cast.
- `src/dimensional/metric-validators.ts:validatePartialDerivative JSDoc` — Does not document that `wrt.freeIndices` are intentionally discarded. Add note citing §VIII.4.
- `src/dimensional/metric.ts:115-118` — `raise()` JSDoc says "one of gInverse's labels is renamed" without specifying which slot. Specify explicitly; note metric-symmetry assumption.
- `src/dimensional/validator.ts:~305-318` — try/catch in `tensor-product` case is no-op pass-through; remove or replace with TODO.
- `src/dimensional/validator.ts:~180` — `resolveChildForPartialDerivative` parameter typed as `unknown` with immediate `as ExprNode` cast; tighten to `ExprNode`.
- `src/bridges/equations/be-37-shapiro-delay.ts:~220-240` — Multi-paragraph inline comment explaining why `raise()` was not used belongs in ADR (`docs/adr/be-37-eikonal-encoding.md`).
- `tests/dimensional/metric-tensor.test.ts` (missing) — No test for rank-0 metric (`indices: []`) or `signature: undefined` (runtime JSON deserialization path).
- `tests/dimensional/error-message-discoverability.test.ts:13-18` — `VarianceMismatchError` only tested with `variance='upper'`; `'lower'` path unverified. Add parameterized test.
- `tests/dimensional/error-message-discoverability.test.ts:13-24` — `VarianceMismatchError` never checked for `instanceof Error`; broken `super()` call undetectable. Add `expect(err).toBeInstanceOf(Error)`.
- `tests/dimensional/covariant-derivative-preview.test.ts:17-28` — `pderiv` denominator variance inference untested; third argument passed explicitly. Add variant omitting third argument or negative test for explicit `'upper'` wrtIndex.
- `tests/dimensional/inverse-metric-consistency.test.ts:13` — No commented-out import stubs; API renames between now and v0.3.5 caught only at activation time. Add `// v0.3.5: uncomment` stubs.
- `Part-VIII-Metric-Layer.md:§VIII.3` — `kronecker()` helper referenced but never declared in grammar, §VIII.5, or §VIII.11. Add subsection specifying `kronecker(label_upper, label_lower, dim?)`.

---

## Cross-Cutting Patterns

**Shared-context mutation (validator.ts + metric.ts)**
Three distinct sites (`integral`/`derivative` in validator, `collectFreeIndexLabels` in metric) share mutable Map references across recursive calls, leaking state. Pattern: shallow spread of context object without cloning nested collections. Fix: adopt `inferArgLocal` helper pattern consistently; add linter rule flagging shallow spread of objects containing Map/Set fields.

**Error-class taxonomy incomplete (errors.ts + spec + tests)**
Five new error classes added in v0.3.0 lack `instanceof`-chain tests after ES5 transpilation. Spec §VIII.2 and §VIII.5 conflate three distinct failure modes under single `MetricSignatureError`. Tests construct errors via `new` without verifying throwing sites. Pattern: error taxonomy designed late and not propagated. Fix: add `tests/dimensional/error-instanceof.test.ts` covering all UPTError subtypes under both ESM and CJS; audit every spec `MUST reject` clause for named error class; add integration tests calling library functions with invalid inputs.

**Free-index set equality never checked (validator.ts + be-37 + tests)**
`validateEquation` checks dimensional homogeneity but not free-index equality. BE-37 eikonal LHS never asserts rank-0. Multiple tests check `freeIndices.size` but not exact key set. Pattern: free-index validation is incomplete across all layers. Fix: add `freeIndicesEqual(a, b)` helper; call in `validateEquation`; add `expect([...result.freeIndices.keys()].sort()).toEqual([...expected].sort())` to all tensor tests.

**Dimension vs. exponent assertions (tests + be-37)**
Tests rely on `divide()` object equality rather than explicit SI exponent checks. BE-37 `pderiv` dimension convention undocumented and untested. Pattern: dimension arithmetic tested indirectly. Fix: assert individual `dim.L`, `dim.M`, etc. directly; add `tests/bridges/be-37-eikonal.test.ts` checking `pderiv` dim convention.

**Spec cross-references unresolvable (Part-VIII)**
Three rules cite "Design §13 Q1" or test files without case detail. Pattern: internal cross-references opaque or underspecified. Fix: establish convention that every cross-reference must be resolvable relative path or inline rationale; replace "Design §13 Q1" with `docs/planning/design-decisions.md#metric-layer-q1-role-inheritance`.

**Test drift-guard self-fulfillment (part-viii-spec-vs-impl.test.ts)**
Orphan-anchor JSDoc contains literal `TENSOR-RULE:` strings matching `TEST_REF_RE`, whitelisting itself. Hard-coded baseline `>= 19` is floor, not snapshot. Pattern: meta-tests vulnerable to self-reference. Fix: use `DEFERRED_RULES` map with non-matching syntax; change baseline to `toEqual(19)` with update comment.

---

## Strengths

- **Comprehensive error taxonomy**: v0.3.0 adds six new error classes with structured fields (`actualRank`, `expectedRank`, `bothVariance`, etc.), enabling programmatic error handling.
- **Dimensional trace in BE-37**: Worked example in §VIII.8 walks through `divide(LENGTH, LENGTH) = DIMENSIONLESS` step-by-step, making dimension algebra concrete.
- **Spec-to-impl bidirectional drift guard**: `part-viii-spec-vs-impl.test.ts` enforces that every `TENSOR-RULE:` marker has a corresponding test reference, catching orphaned rules (modulo self-fulfillment bug).
- **Alpha-conversion in raise/lower**: Automatic fresh-label generation prevents index-label collisions in common cases, reducing boilerplate for users.
- **Metric signature validation**: `isValidSignature` enforces Lorentzian/Riemannian constraints at construction time, catching malformed metrics early.
- **AST serialization tests**: `metric-ast-serialization.test.ts` verifies JSON round-trip for all three new node kinds, ensuring persistence layer compatibility.

---

## Action Checklist

Ordered by ROI (high-impact / low-effort first). Effort: **TRIVIAL** (< 30 min), **SMALL** (< 2 hr), **MEDIUM** (< 1 day), **LARGE** (> 1 day).

### Immediate (TRIVIAL, high-impact)

- [ ] **`src/dimensional/metric.ts:148-149, 196-197`** — Seed `taken` set with `gInverse.indices.map(i => i.label)` before calling `freshLabel`. (**TRIVIAL**)
- [ ] **`src/dimensional/metric-validators.ts:~110-130`** — Add `if (a.label === b.label) throw new KroneckerVarianceError(...)` before freeIndices loop in `validateKroneckerDelta`. (**TRIVIAL**)
- [ ] **`src/dimensional/metric.ts:100-109`** — Add `if (counts.upper > 0 && counts.lower > 0) continue;` before variance branch in `collectFreeIndexLabels`. (**TRIVIAL**)
- [ ] **`src/dimensional/metric.ts:162, 210`** — Return `{ kind: 'tensor-product', args: [...], dim: operand.dim }` in `raise()`/`lower()`. (**TRIVIAL**)
- [ ] **`src/bridges/equations/be-37-shapiro-delay.ts:~290`** — Replace `contract(g_inverse_eikonal, dmu_S, dnu_S)` with `contract(contract(g_inverse_eikonal, dmu_S), dnu_S)`. (**TRIVIAL**)
- [ ] **`src/bridges/equations/be-37-shapiro-delay.ts:~215`** — Change guard to strict `>=`; update error message to "ratio inside ln must be > 1". (**TRIVIAL**)
- [ ] **`src/dimensional/errors.ts:68-73`** — Delete `RepeatedDummyLabelError` alias + add BREAKING CHANGE to CHANGELOG, or update comment to v0.4.0. (**TRIVIAL**)
- [ ] **`tests/dimensional/part-viii-spec-vs-impl.test.ts:38-44`** — Construct `new RegExp(...)` inside `extractSpecRules` and `indexTestReferences`; remove module-level `/g` regex constants. (**TRIVIAL**)
- [ ] **`tests/dimensional/metric-tensor.test.ts:131-145`** — Import and assert `DuplicateIndexError` (or add `.message` assertion with `// code: DUPLICATE_INDEX`). (**TRIVIAL**)
- [ ] **`tests/dimensional/kronecker-delta.test.ts`** — Add test for `δ^μ_μ` documenting intended behavior (scalar or typed throw). (**TRIVIAL**)
- [ ] **`tests/dimensional/covariant-derivative-preview.test.ts`** — Assert `result.dimensions` equals `{ L: -1, M: 0, T: 0, ... }`. (**TRIVIAL**)
- [ ] **`tests/dimensional/metric-tensor.test.ts:50-57`** — Add `expect(result.ok).toBe(true)` and `expect(result.inferredDimension).toEqual(DIMENSIONLESS)`. (**TRIVIAL**)

### High-Priority (SMALL, high-impact)

- [x] **`src/dimensional/validator.ts:~270-295`** — Replace spread-ctx with `inferArgLocal` helper in `integral`/`derivative` cases