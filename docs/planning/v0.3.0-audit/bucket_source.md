# UPT v0.3.0 Code Review — Consolidated Findings

---

## Critical & High Findings

| File : Location | Description | Fix |
|---|---|---|
| `src/dimensional/errors.ts:68-73` | **[HIGH]** Deprecation notice says `RepeatedDummyLabelError` removed in v0.3.0; alias still present in v0.3.0. Stale marker will misfire automated cleanup tooling. | Delete alias + add BREAKING CHANGE to CHANGELOG, or update comment to v0.4.0. |
| `src/dimensional/metric-validators.ts:~110-130` | **[HIGH]** `validateKroneckerDelta` does not reject duplicate labels (e.g., δ^μ_μ). `freeIndices` Map silently overwrites first entry; downstream contraction logic miscounts free indices. | Add `if (a.label === b.label) throw new KroneckerVarianceError(...)` before the freeIndices loop. |
| `src/dimensional/metric-validators.ts:~175-195` | **[HIGH]** `validatePartialDerivative` discards `wrt.freeIndices` without checking collision against `of.freeIndices`. Hidden index-label collisions produce ill-formed output tensors. | After computing both results, iterate `wrtResult.freeIndices` and throw `IndexLabelCollisionError` on any key present in `ofResult.freeIndices`. |
| `src/dimensional/metric-validators.ts:validateKroneckerDelta` | **[HIGH / test]** No test exercises δ^μ_μ duplicate-label path (currently a silent bug). | Add test asserting `validateKroneckerDelta` throws on `[{label:'μ',variance:'upper'},{label:'μ',variance:'lower'}]`. |
| `src/dimensional/metric.ts:148-149, 196-197` | **[CRITICAL]** `taken` set in `raise()`/`lower()` omits the metric's own index labels. `freshLabel` can return a string equal to `gInverse.indices[0].label`, producing two free indices with the same label in the tensor-product. | Seed `taken` with all of `gInverse.indices[*].label` before calling `freshLabel`. |
| `src/dimensional/metric.ts:100-109` | **[HIGH]** `collectFreeIndexLabels` records contracted dummies (counts.upper > 0 AND counts.lower > 0) as free upper indices. `raise()` then throws a misleading "already upper" error. | `if (counts.upper > 0 && counts.lower > 0) continue;` before the variance branch. |
| `src/dimensional/metric.ts:162, 210` | **[HIGH]** `raise()`/`lower()` return `TensorProductNode` with no `dim` field. v0.3.5 numerical backend reading `node.dim` directly will see `undefined`. | Return `{ kind: 'tensor-product', args: [...], dim: operand.dim }`. |
| `src/dimensional/metric.ts:raise/lower` | **[HIGH / test]** No test for alpha-conversion collision case where `gInverse.indices[1].label` is already a free index in `operand`. | Add test: operand has free index `ν`, gInverse has `indices[1].label = 'ν'`; assert result contains no duplicate `ν`. |
| `src/dimensional/validator.ts:~270-295` | **[CRITICAL]** `integral`/`derivative` cases spread `ctx` shallowly into child `infer()` calls, sharing the same `freeIndices` Map reference. Tensor free-indices from the integrand leak into the parent accumulator. | Replace spread-ctx with `inferArgLocal` (same pattern as `op '*'`). |
| `src/dimensional/validator.ts:~215-230` | **[HIGH]** `TensorInScalarOpError` is thrown (not recorded as a violation) in `op '*'`/`'/'`/`'^'`. Callers checking `result.ok` never see the error; they get an uncaught exception. | Either catch inside `validate()`/`validateEquation()` and push a violation, or document explicitly that `validate()` may throw and add try/catch at all call sites. |
| `src/dimensional/validator.ts:~340-365` | **[HIGH]** `validateEquation` checks dimensional homogeneity but never compares `lhsCtx.freeIndices` vs `rhsCtx.freeIndices`. `T^μν = S^μ` passes with `ok: true` if dimensions match. | Add `freeIndicesEqual` check after the dimension check; push a violation on mismatch. At minimum add a `// TODO(Task 7)` and a failing test documenting the gap. |
| `src/dimensional/validator.ts:~320-330` | **[HIGH]** `tensor-partial-derivative` case in `infer()` has no try/catch, unlike `tensor-product`. A `VarianceMismatchError` from `validatePartialDerivative` propagates uncaught through `validate()`, breaking the violations contract. | Wrap in the same try/catch pattern used by `tensor-product`, or convert caught errors to violations. |
| `src/dimensional/validator.ts:infer integral/derivative` | **[HIGH / test]** No test for `integral` + `tensor-symbol` combination that triggers the shared-freeIndices leak. | Add test: `validate({ kind:'integral', integrand: tensor-symbol, over: scalar-symbol })`; assert `result.freeIndices.size === 0`. |
| `src/bridges/equations/be-37-shapiro-delay.ts:~260-270` | **[CRITICAL]** `pderiv` dimension assumed to be `DIMENSIONLESS` (LENGTH/LENGTH), but if `pderiv` inherits numerator dim, `dmu_S.dim = LENGTH` and downstream `contract` produces wrong dimension; `validateBE37EikonalDimensions()` silently returns wrong result. | Assert `dmu_S.dim === DIMENSIONLESS` at call site, or declare `S_eikonal` as `DIMENSIONLESS` with pre-applied cancellation. Add unit test checking `validate(dmu_S).inferredDimension === DIMENSIONLESS`. |
| `src/bridges/equations/be-37-shapiro-delay.ts:~290` | **[HIGH]** `contract(g_inverse_eikonal, dmu_S, dnu_S)` — three-argument form not established in public API. If `contract` is binary, `dnu_S` is silently dropped, producing a rank-2 tensor instead of a scalar. | Use sequential binary contractions: `contract(contract(g_inverse_eikonal, dmu_S), dnu_S)`. Add test asserting `BE37_EIKONAL_LHS` has zero free indices. |
| `src/bridges/equations/be-37-shapiro-delay.ts:~215` | **[HIGH]** Guard rejects `R_near_m > R_far_m` but allows `R_near_m === R_far_m`, silently returning `ln(1) = 0`. | Change guard to strict `>=`; update error message to "ratio inside ln must be > 1". |
| `src/bridges/equations/be-37-shapiro-delay.ts` | **[HIGH / test]** No test verifies `BE37_EIKONAL_LHS` is rank-0, and no test checks `validateBE37EikonalDimensions().ok === true`. | Add `tests/bridges/be-37-eikonal.test.ts`: rank-0 check, dimension-ok check, `pderiv` dim convention check. |

---

## Medium Findings

### `src/dimensional/errors.ts`
- **`~52-56`** `DuplicateIndexLabelError` message describes the product-level "once upper, once lower" rule, not the declaration-time uniqueness rule it actually enforces. Rewrite message to: *"Each label must be unique within a single tensor symbol's declaration; to contract, form a tensor-product."*
- **`~107-110`** `VarianceMismatchError` message cites "v0.2.0 has no metric tensor" — factually wrong in v0.3.0 which adds the metric layer. Remove version clause; direct users to `raise()`/`lower()`.
- **All v0.3.0 additions** (`InvalidMetricRankError`, `MetricSignatureError`, `InvalidKroneckerRankError`, `KroneckerVarianceError`, `PartialDerivativeIndexVarianceError`) — no `instanceof`-chain tests after ES5 transpilation. Add tests asserting `err instanceof UPTError`, `err instanceof <ConcreteClass>`, and `err.name` under both ESM and CJS targets.

### `src/dimensional/metric-validators.ts`
- **`~40-45, 60-85`** `isValidSignature` never validates that signature token count matches tensor dimensionality. Expose `signatureRank: number` in `MetricTensorValidationResult` so callers can cross-check.
- **`~200`** `validatePartialDerivative` always assigns `role = ofResult.role ?? 'field'`; derivative of a `'connection'` should eventually be `'curvature'`. Add explicit TODO guard for the `'connection'` case to prevent silent wrong-role propagation in v0.4.0.
- **`MetricTensorValidationResult`** Parsed signature is discarded after validation; v0.4.0 Christoffel validators will need to re-parse it. Add `readonly signatureParts: ReadonlyArray<'+' | '-'>` to the result type.
- **`validatePartialDerivative`** No test verifies that `wrt.freeIndices` colliding with `of.freeIndices` is caught (the bug doesn't exist yet, but the test must accompany the fix).

### `src/dimensional/metric.ts`
- **`~152-159`** Alpha-conversion always uses `index[0]` as contraction dummy regardless of which slot matches `label`. Metric symmetry makes this accidentally correct, but the assumption is undocumented. Add: `// INVARIANT: metric symmetry assumed; index[0] is always the contraction dummy.`
- **`~88-92`** `freshLabel` base is always `gInverse.indices[1].label`; if that label is `''`, scheme produces `_1`, `_2`, … which can collide with user labels. Add non-empty label validation to `metric()` constructor.
- **`72-80`** `RaiseLowerInvalidLabelError` is unexported; callers cannot `instanceof`-check it. Either export it or document in `raise()`/`lower()` JSDoc that callers should catch `UPTError` and inspect `e.name`.
- **`~60-62`** `pderiv` accepts any `ExprNode` for `wrt` with no structural check. Narrow to `TensorNode` or add runtime guard to make v0.4.0 Christoffel constraint explicit.
- **No test** verifying `raise()` throws `MetricSignatureError` (not `RaiseLowerInvalidLabelError`) when given a covariant metric.

### `src/dimensional/validator.ts`
- **`~185-195`** `resolveChildForPartialDerivative` reads `typed.role` from the raw node rather than from `validateTensorSymbol`'s result, bypassing any normalisation. Make narrowing explicit; consider returning `role` from `validateTensorSymbol`.
- **`~200-215`** In `op '^'`, the tensor-rejection check (`freeIndices.size > 0`) is placed after the `baseDim === null` early-return, so a tensor base that also fails dimension inference skips the `TensorInScalarOpError`. Move the tensor check before the null-return.
- **`~370-390`** `validate()`/`validateEquation()` dual-mode error reporting (violations array + possible throws) forces every consumer to both check `result.ok` and wrap in try/catch. Catch all `UPTError` subtypes inside `validate()` and convert to violations, or add `thrownError?: Error` to `ValidationResult`.
- **No test** verifying `validate()` returns `ok: false` (not throws) for a tensor operand inside `op '*'`.

### `src/bridges/equations/be-37-shapiro-delay.ts`
- **`~155`** `THREE_EXP` is `sym('3', DIMENSIONLESS)` (symbol node). If the validator's `^` handler requires a numeric literal to compute `dim(base)^n`, `BE37_C_CUBED` dimension inference fails silently. Replace with `{ kind: 'number', value: 3, dim: DIMENSIONLESS }`.
- **`~195` + `BE37_PREFACTOR`** PPN parameter γ hardcoded to 1 with no extension point. Adding γ later breaks both the evaluator signature and exported AST nodes. Add optional `gamma?: number = 1` to `ShapiroInputs` and export `BE37_GAMMA`/`BE37_PPN_PREFACTOR` now.
- **`~248-268`** `x_coord` uses label `α` but `pderiv` output indices use `μ`/`ν`. If `pderiv` uses the `wrt` label as output label, `contract` with `g_inverse` (labels `μ`,`ν`) finds no matching pair and produces rank-4. Align labels or add runtime assertion `assert(dmu_S.indices[0].label === 'μ')`.
- **`~230-240, ~300-310`** `validateBE37Dimensions` / `validateBE37EikonalDimensions` return untagged `DimensionValidationReport`; bulk CI sweeps cannot identify which bridge failed. Add `bridgeId: 37` and `form: 'scalar' | 'eikonal'` fields.
- **No test** for canonical Sun-grazing benchmark (expected ≈ 53 μs). Add: `expect(evaluateShapiroDelay({ M_kg:1.989e30, R_far_m:1.496e11, R_near_m:6.957e8 })).toBeCloseTo(53e-6, 1)`.

---

## Low Findings

- `src/dimensional/errors.ts:143-150` — `FreeIndexMismatchError` takes a free-form string; add structured `expected`/`actual` Map fields matching `DimensionMismatchError`'s pattern.
- `src/dimensional/errors.ts:157-168` — `TensorInScalarOpError.op` typed as `string`; narrow to `ScalarOp = '*' | '/' | '^'` before v0.4.0 op enum diverges.
- `src/dimensional/errors.ts:213-222` — `InvalidKroneckerRankError` message conflates rank with variance: "(exactly one upper + one lower index)" → "(exactly two indices)"; variance hint belongs only in `KroneckerVarianceError`.
- `src/dimensional/metric-validators.ts:~145` — `CovariantIndex.variance` declared as string literal `'lower'` rather than `Variance` union; makes `TensorIndex` unassignable without cast and renders the runtime variance guard a type-level tautology.
- `src/dimensional/metric-validators.ts:validatePartialDerivative JSDoc` — Does not document that `wrt.freeIndices` are intentionally discarded. Add note citing §VIII.4.
- `src/dimensional/metric.ts:115-118` — `raise()` JSDoc says "one of gInverse's labels is renamed" without specifying which slot (0 = dummy, 1 = new free). Specify explicitly; note metric-symmetry assumption.
- `src/dimensional/validator.ts:~305-318` — try/catch in `tensor-product` case is a no-op pass-through (`catch (err) { throw err }`); remove it or replace with a TODO for future violation conversion.
- `src/dimensional/validator.ts:~180` — `resolveChildForPartialDerivative` parameter typed as `unknown` with immediate `as ExprNode` cast; tighten to `ExprNode` and remove cast.
- `src/bridges/equations/be-37-shapiro-delay.ts:~220-240` — Multi-paragraph inline comment explaining why `raise()` was not used belongs in an ADR (`docs/adr/be-37-eikonal-encoding.md`