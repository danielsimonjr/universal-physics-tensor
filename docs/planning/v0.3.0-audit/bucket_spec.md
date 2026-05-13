# UPT v0.3.0 Spec Bucket — Code Review Summary

---

## Critical & High Findings

| Severity | File : Location | Description | Fix |
|---|---|---|---|
| **Critical** | `Part-VIII-Metric-Layer.md` : §VIII.4, rules `pderiv-dim-divides-by-wrt-dim` & `pderiv-ignores-wrt-own-indices` | `wrt.dim` is never defined as node-level vs. per-component; readings diverge for rank-2 `wrt`, making the two rules contradictory for higher-rank cases. | Replace `wrt.dim` with explicit language: "the `dim` field of the `wrt` ExprNode (node-level uniform-component dimension per §VIII.10)." Add a note for rank-N `wrt`. |
| **High** | `Part-VIII-Metric-Layer.md` : §VIII.2 & §VIII.5, `MetricSignatureError` | Single error class covers three structurally distinct failures: mixed-variance indices, malformed signature string, wrong-variance metric in `raise()`. Programmatic branching is impossible. | Split into `MetricIndexVarianceError`, `MetricSignatureFormatError`, `RaiseLowerMetricVarianceError`. Retire or demote `MetricSignatureError` to base class. |
| **High** | `Part-VIII-Metric-Layer.md` : §VIII.5, rule `raise-lower-fresh-label-deterministic` | "Deterministic" is scoped to a single run; no cross-version stability guarantee. Stored/diffed ASTs will diverge between v0.3.0 and v0.3.5 if the naming template changes. | Declare fresh labels non-public-contract and require call-site form for storage, **or** pin scheme as `<label>_<zero-based-counter>` as a SemVer-minor-stable commitment. |
| **High** | `Part-VIII-Metric-Layer.md` : §VIII.8, `contract(g_inverse_eikonal, dmu_S, dnu_S)` | `contract()` is binary in v0.2.0; no variadic overload is defined in v0.3.0. The worked example is either wrong or introduces an unspecified API. | Either rewrite as nested binary calls with an associativity note, **or** add a §VIII.X specifying variadic `contract(...operands)` and update §VIII.11's additive-API list. |
| **High** | `Part-VIII-Metric-Layer.md` : §VIII.9 & §VIII.4, `pderiv-of-metric-composes` / `pderiv-label-collision-rejected` | Collision rule rejects `pderiv(g_lower, x, {label:'ν'})` when `g_lower` already has index ν — but this is exactly the Christoffel building block. Forward-compat blocker for v0.4.0. | Document that users must alpha-rename `of`'s indices before calling `pderiv` when labels collide (option A, safest for v0.3.0), with an explicit example in §VIII.9. |
| **High** | `Part-VIII-Metric-Layer.md` : §VIII.2 & §VIII.8, `metric-tensor-signature-required` | No test file is specified for any metric-tensor validation error path (malformed signature, empty signature, mixed-variance, invalid rank). Primary guard rails are unverified. | Add `tests/dimensional/metric-tensor-validation.test.ts` covering cases (a)–(e) with specific error-class assertions; reference it in §VIII.2. |
| **High** | `Part-VIII-Metric-Layer.md` : §VIII.5, rule `raise-requires-label-present-in-operand` | "Rejects with a descriptive error" names no error class. Not in §VIII.11's subclass list. Implementors will diverge; programmatic handling is impossible. | Name `RaiseLowerLabelError`; add to §VIII.11; specify distinct messages for "label not found" vs. "label already upper." |

---

## Medium Findings

**Spec completeness / recursive definitions**
- `§VIII.4` `pderiv-rank-equals-of-rank-plus-one`: rank of a `tensor-partial-derivative` node is never defined recursively, blocking second-order derivative implementation needed for v0.4.0 wave operator. Add: "rank of a `tensor-partial-derivative` node = `rank(of) + 1`."

**Grammar ambiguity**
- `§VIII.1` Signature production rule: `"+" | "-"` outer alternation makes a bare `-` match two alternatives; 1-entry signature for a rank-2 metric is accepted without warning. Fix to `("+" | "-") ("," ("+" | "-"))*`; add note that length-vs-dimension validation is deferred to v0.3.5.

**Forward-compat scoping gaps**
- `§VIII.10` BREAKING flag: `tensor-partial-derivative` omitted from v0.5.0 `DimensionMatrix` refactor list despite having a computed output dim. Add it; note that `pderiv-dim-divides-by-wrt-dim` will need generalization to `DimensionMatrix / DimensionMatrix`.
- `§VIII.7` `_origin` provenance: stripped on JSON serialization with no round-trip contract. Silent quality degradation in v0.3.5 pipeline. Add explicit note that provenance is ephemeral and best-effort post-deserialization; flag for v0.3.5 evaluation.

**Doc clarity**
- `§VIII.4` `pderiv-role-inherits-from-of`: cites "Design §13 Q1 locked decision" — opaque, unresolvable. Replace with `docs/planning/design-decisions.md#metric-layer-q1-role-inheritance`.
- `§VIII.8` dimensional trace: `divide(LENGTH, LENGTH) = DIMENSIONLESS` asserted without noting it requires Dimension-algebra auto-simplification. Add parenthetical referencing Part II simplification rules.

**Test coverage**
- `§VIII.5` `raise-lower-internal-alpha-conversion`: no named test case verifies that the fresh-label generator increments past a collision with an existing free index in `operand`. Add a required test case to `raise-lower.test.ts` spec: operand pre-has `ν_1`, verify generator produces `ν_2`.

---

## Low Findings

- `§VIII.3` `kronecker-delta-dim-default-dimensionless`: `kronecker()` helper referenced but never declared in grammar, §VIII.5, or §VIII.11. Add a subsection specifying `kronecker(label_upper, label_lower, dim?)` in `src/dimensional/metric.ts`.
- `§VIII.8` dimensional trace: `divide(LENGTH, LENGTH) = DIMENSIONLESS` should cite the Dimension algebra's simplification contract rather than asserting equality inline.

---

## Bucket-Internal Patterns

*(Issues recurring across multiple sections of `Part-VIII-Metric-Layer.md`)*

| Pattern | Locations | Summary |
|---|---|---|
| **Error class underspecification** | §VIII.2, §VIII.5 (`raise-requires-label-present-in-operand`), §VIII.5 (`raise-requires-upper-variance-inverse-metric`) | Three separate rules either share one error class or name no error class at all. Consistent pattern: error taxonomy was designed late and not propagated back through all rules. Audit every `MUST reject` clause in §VIII for a named error class. |
| **"wrt" node-level vs. component-level ambiguity** | §VIII.4 (`pderiv-dim-divides-by-wrt-dim`), §VIII.4 (`pderiv-ignores-wrt-own-indices`), §VIII.8 worked example | The spec conflates node-level `dim` with per-component or per-index dim in multiple places. A single normative definition of "node-level `dim`" in §VIII.1 or §VIII.10 would resolve all instances. |
| **Unresolvable internal cross-references** | §VIII.4 ("Design §13 Q1"), §VIII.8 (test file references without case detail), §VIII.9 (preview test without collision-case coverage) | Several rules and examples cite internal documents or test files that are either opaque or underspecified. Establish a convention: every cross-reference must be a resolvable relative path or an inline rationale. |
| **Forward-compat scope omissions in §VIII.10 BREAKING flag** | §VIII.10 (`tensor-partial-derivative` missing), §VIII.9 (Christoffel collision blocker not flagged as v0.4.0 risk) | The BREAKING flag correctly lists three node kinds but misses at least one participant and one API constraint that will surface in v0.4.0. The flag section should be generated from a checklist applied to every node kind defined in §VIII, not authored manually. |