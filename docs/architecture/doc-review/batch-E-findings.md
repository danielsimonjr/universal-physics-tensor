# Batch E — specification Part V–VIII — Doc Integrity Findings
**Reviewer**: opus subagent. **Date**: 2026-05-20. **Files**: Part-V, Part-VI, Part-VII-Tensor-Algebra, Part-VIII-Metric-Layer.

## Summary
6 findings: 0 CRITICAL, 3 HIGH, 2 MEDIUM, 1 LOW. Part-VII/VIII grammar specs are accurate for the v0.2.0/v0.3.0 layers they describe and every TENSOR-RULE marker is pinned by the drift-guard tests — but both are STALE: they predate the v0.4.0 connection layer, v0.5.0 curvature layer, and v0.6.0 Killing/stress-energy/Weyl additions, and the live `ExprNode` union now carries 12 node kinds neither part mentions. Part-V/VI are speculative theory/governance prose with no AST claims and are internally honest.

## Findings

### E-1 — HIGH — Part-VII §VII.1 / Part-VIII §VIII.1 (grammar)
- **Claim**: Part-VII §VII.1 "adds two production rules"; Part-VIII §VIII.1 "adds three production rules ... `MetricTensor | KroneckerDelta | TensorPartialDerivative`". Neither part lists any later node kind.
- **Verification**: `src/dimensional/validator.ts:62-83` — the `ExprNode` union.
- **Reality**: The live union has 21 kinds. Beyond the 5 covered by Part-VII/VIII it includes `covariant-derivative`, `riemann-tensor` (v0.4.0), `ricci-tensor`, `einstein-tensor`, `bianchi-residual` (v0.5.0), `killing-vector`, `conserved-charge`, `stress-energy`, `cosmological-constant`, `einstein-equation`, `weyl-tensor`, `kretschmann-scalar` (v0.6.0) — 12 kinds with no grammar spec in Part V–VIII.
- **Verdict**: STALE
- **Suggested fix**: Add a forward-pointer note to Part-VII §VII.1 / Part-VIII §VIII.1 stating that v0.4.0+ connection and curvature node kinds are specified in their own (not-yet-written) parts, and that Part-VII/VIII are frozen at the v0.2.0/v0.3.0 layer they cover. Or create Part-IX (connection) / Part-X (curvature) grammar specs.

### E-2 — HIGH — Part-VIII §VIII.10 (BREAKING CHANGE SCOPE FLAG)
- **Claim**: "**v0.5.0+ will refactor `dim` from a single `Dimension` to a structured field** ... This refactor is **BREAKING** ... All three v0.3.0 node kinds participate."
- **Verification**: `src/dimensional/metric-validators.ts:25-39,122-126`, `src/dimensional/tensor.ts:35-54`; v0.6.0 added `stress-energy-validators.ts` carrying `componentDim` per `validator.ts:673-682`.
- **Reality**: As of v0.6.0 the refactor has NOT happened — `metric-tensor`, `tensor-symbol`, `kronecker-delta` still carry a flat `dim: Dimension`. The Faraday-tensor / per-component-dim support the flag promised "for v0.5.0+" is unshipped two minor versions later. The flag now reads as a stale roadmap item.
- **Verdict**: STALE (vision slipped; flag not updated)
- **Suggested fix**: Re-date the flag — note explicitly that v0.5.0 and v0.6.0 shipped without this refactor and it remains deferred, or move it to `todo.md` as an open carry-forward rather than presenting it as imminent v0.5.0 scope.

### E-3 — HIGH — Part-VII §VII.4 (repeated-dummy-label-in-tensor-symbol-rejected)
- **Claim**: "Within a single `tensor-symbol`, repeated index labels (e.g., `T^μ_μ_μ`) are rejected with `RepeatedDummyLabelError`."
- **Verification**: `src/dimensional/tensor.ts:97` throws `DuplicateIndexLabelError`; `src/dimensional/errors.ts:48-62` — the class is `DuplicateIndexLabelError`, and its docstring states "The earlier name `RepeatedDummyLabelError` was a misnomer; that deprecated alias was removed in v0.4.5."
- **Reality**: `RepeatedDummyLabelError` no longer exists. Code throws `DuplicateIndexLabelError`. Part-VII still names the removed class. (Drift-guard only checks the marker ID `repeated-dummy-label-in-tensor-symbol-rejected`, not the error-class name in prose, so this escaped the guard.)
- **Verdict**: INACCURACY (stale class name)
- **Suggested fix**: In Part-VII §VII.4, change `RepeatedDummyLabelError` → `DuplicateIndexLabelError` (the marker ID can stay; only the prose name is wrong).

### E-4 — MEDIUM — Part-VIII §VIII.11 (v030-additive-semver-minor-bump)
- **Claim**: "v0.3.0 adds three new ExprNode kinds, five new error subclasses, and **one new module (`src/dimensional/metric.ts`)**."
- **Verification**: `src/dimensional/metric.ts`, `src/dimensional/metric-validators.ts` (header: "Per ... Part-VIII §VIII.2-§VIII.4"), `src/dimensional/fresh-label.ts` (header: "Extracted to eliminate ... Task 3 code-quality review").
- **Reality**: The v0.3.0 metric layer is split across at least `metric.ts` AND `metric-validators.ts` (and `fresh-label.ts` was extracted within the v0.3.0 Task-3 work). The "one new module" count understates the actual file structure. The "three node kinds / five error subclasses" portion is accurate (errors.ts:178-267 = 5 new classes).
- **Verdict**: INACCURACY
- **Suggested fix**: Change to "two new modules (`src/dimensional/metric.ts`, `src/dimensional/metric-validators.ts`)" or drop the module count and keep only the SemVer-relevant node-kind / error-subclass counts.

### E-5 — MEDIUM — Part-VII §VII.7 / §VII.3 (v0.2.0-preview framing)
- **Claim**: §VII.7 "The v0.3.0 implementation extends this shape additively by including a `wrt` field"; the locked preview is `{ kind: 'tensor-partial-derivative'; wrtIndex; of }`. §VII.3 says mixed-dimension tensors "cannot be represented in v0.2.0 ... revisited in v0.3.0 with the metric layer."
- **Verification**: `src/dimensional/metric-validators.ts:182-187` — real node is `{ kind, of, wrt, wrtIndex }`; `src/dimensional/tensor.ts:35-54` — `tensor-symbol` still has flat `dim`.
- **Reality**: §VII.7's additive-extension claim is CORRECT (real node = preview + `wrt`). But §VII.3's promise that mixed-component dims are "revisited in v0.3.0" is contradicted by §VIII.10, which explicitly defers them to v0.5.0+ — and E-2 shows even that slipped. The two parts disagree on when per-component dims arrive.
- **Verdict**: CONSISTENCY (Part-VII §VII.3 vs Part-VIII §VIII.10)
- **Suggested fix**: Reword Part-VII §VII.3 — "revisited in v0.3.0" → "revisited later; see Part-VIII §VIII.10 for the deferred scope flag."

### E-6 — LOW — Part-VI Conclusion / Framework Statistics block
- **Claim**: "Algorithm pseudocode blocks across all six parts: ~23 (Part-I: 3, Part-III: 6, Part-IV: 3, Part-V: 8, Part-VI: 3)."
- **Verification**: Part-V contains numbered algorithm-style blocks in §18.1, §18.2, §18.3, §19.3.2, §25.1, §25.2, §25.3 plus governance/protocol blocks; an exact recount was not performed against all six parts.
- **Reality**: The count is self-consistent within Part-VI and explicitly hedged ("~23"), and the off-by-one history is documented. Not independently re-verified end-to-end; flagged only as UNVERIFIED on the exact per-part tallies.
- **Verdict**: FALSE-ALARM-OK (self-hedged; no codebase claim at stake)
- **Suggested fix**: none — the prose is honest and explicitly approximate.

## Notes
- Part-V (advanced math / experimental / governance) and Part-VI (deployment / cosmic-engineering / governance) make NO AST-grammar or implemented-behavior claims; their speculative content is heavily and honestly caveated (EXCISED BE-25 block, cosmic-engineering warning headers). No accuracy findings against the codebase apply to them.
- Part-VII/VIII TENSOR-RULE markers are fully pinned: `tests/dimensional/tensor-spec-vs-impl.test.ts` + `part-viii-spec-vs-impl.test.ts` enforce bidirectional marker↔test coverage; the §VIII.11 marker, fresh-label rule, raise/lower rules, and all per-kind invariants were spot-checked against `tensor.ts`, `metric.ts`, `metric-validators.ts`, `fresh-label.ts`, `errors.ts` and found accurate for the layers they describe.
- The §VIII.8 BE-37 worked example (direct 3-operand contraction over `raise()`) matches `metric.ts` raise()'s alpha-conversion behavior — accurate.
