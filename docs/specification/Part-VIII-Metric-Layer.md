# Part VIII — Metric Layer

> **Scope:** v0.3.0 metric layer of UPT's tensor extensions. Defines the `metric-tensor` AST node, the `kronecker-delta` identity tensor, and the `tensor-partial-derivative` operator for spacetime derivatives. Specifies the `raise()` / `lower()` helper contract and the per-kind validation rules. Christoffel symbols, covariant derivatives, and Riemann curvature are explicitly out of scope (deferred to v0.4.0). Faraday-style mixed-component-dim tensors are deferred to v0.5.0+ with a clearly-marked BREAKING flag (see §VIII.10).

## §VIII.1 Grammar

The v0.3.0 metric layer adds three production rules to UPT's ExprNode grammar (on top of v0.2.0's `TensorSymbol` and `TensorProduct`):

```
ExprNode ::= ... existing scalar productions ...
           | TensorSymbol
           | TensorProduct
           | MetricTensor
           | KroneckerDelta
           | TensorPartialDerivative

MetricTensor          ::= "metric-tensor" Identifier IndexList Signature Dimension
                          (* indices: exactly 2, same variance *)
KroneckerDelta        ::= "kronecker-delta" MixedIndexPair Dimension
                          (* exactly 1 upper + 1 lower *)
TensorPartialDerivative ::= "tensor-partial-derivative" ExprNode ExprNode CovariantIndex
                          (* of, wrt, wrtIndex with variance always 'lower' *)
Signature             ::= "+" | "-" ("," ("+" | "-"))*
                          (* e.g., "+,-,-,-" Lorentzian; "+,+,+" Euclidean 3-space *)
CovariantIndex        ::= "{label:" Identifier ", variance: 'lower'}"
MixedIndexPair        ::= "[" "{label:" Identifier ", variance: 'upper'}" ","
                          "{label:" Identifier ", variance: 'lower'}" "]"
```

## §VIII.2 Metric-tensor invariants

<!-- TENSOR-RULE: metric-tensor-rank-2-only -->
A `metric-tensor` node has EXACTLY two indices. Rank-0 and rank-3+ metric-tensors are rejected with `InvalidMetricRankError`. (The metric is fundamentally a rank-2 object in v0.3.0; higher-rank generalizations are out of scope.)

<!-- TENSOR-RULE: metric-tensor-indices-same-variance -->
The two indices of a `metric-tensor` MUST share the same variance — both `upper` (an inverse metric `g^μν`) or both `lower` (a covariant metric `g_μν`). Mixed-variance metrics (`g^μ_ν`) are rejected with `MetricSignatureError`. (Mixed-variance forms correspond to Kronecker delta — see §VIII.3 and `kronecker-delta`.)

<!-- TENSOR-RULE: metric-tensor-signature-required -->
A `metric-tensor` carries a `signature: string` field (e.g., `'+,-,-,-'` for Lorentzian spacetime, `'+,+,+'` for Euclidean 3-space). The signature is structural metadata; v0.3.0 records it on the node but does not enforce per-component sign constraints (the mathjs backend in v0.3.5 will use it). An empty signature string or one whose entries aren't `'+'`/`'-'` is rejected with `MetricSignatureError`.

<!-- TENSOR-RULE: metric-tensor-dim-user-specified -->
A `metric-tensor` carries a `dim: Dimension` field. v0.3.0 imposes no constraint on what the dim is (the user picks per the encoding — `DIMENSIONLESS` for geometrized units, `LENGTH²` for line-element conventions, etc.). This is the same convention as `tensor-symbol.dim`.

## §VIII.3 Kronecker-delta invariants

<!-- TENSOR-RULE: kronecker-delta-rank-2-only -->
A `kronecker-delta` node has EXACTLY two indices. Anything else is rejected with `InvalidKroneckerRankError`.

<!-- TENSOR-RULE: kronecker-delta-mixed-variance-required -->
A `kronecker-delta`'s two indices MUST have OPPOSITE variance — exactly one upper and one lower. Both-upper or both-lower forms are rejected with `KroneckerVarianceError`. (The canonical δ^μ_ν is the identity operator on tangent vectors.)

<!-- TENSOR-RULE: kronecker-delta-dim-default-dimensionless -->
A `kronecker-delta` typically has `dim: DIMENSIONLESS` (the canonical identity). The validator does NOT enforce DIMENSIONLESS — user may specialize per encoding — but the `kronecker()` helper defaults to DIMENSIONLESS when omitted.

## §VIII.4 Tensor-partial-derivative invariants

<!-- TENSOR-RULE: pderiv-rank-equals-of-rank-plus-one -->
A `tensor-partial-derivative` increases the rank of its `of` operand by exactly one — the operator's covariant index `wrtIndex` is the additional free index. If `of` is rank-N, the resulting expression is rank-(N+1).

<!-- TENSOR-RULE: pderiv-wrtIndex-always-lower -->
`tensor-partial-derivative.wrtIndex.variance` is ALWAYS `'lower'`. The differentiation operator `∂/∂x^μ` is fundamentally a covariant (lower) operator regardless of the variance of the coordinate it differentiates with respect to. Upper-variance `wrtIndex` is rejected with `PartialDerivativeIndexVarianceError`.

<!-- TENSOR-RULE: pderiv-dim-divides-by-wrt-dim -->
The output dimension of `tensor-partial-derivative` is `divide(of.dim, wrt.dim)`. (E.g., `∂_μ φ` where φ has units `[V]` and the coordinate `x^μ` has units `[m]` produces output dim `[V/m]`.)

<!-- TENSOR-RULE: pderiv-ignores-wrt-own-indices -->
The `wrt` argument's OWN free indices are deliberately discarded by `tensor-partial-derivative`. The operator's index is supplied separately via `wrtIndex`. This distinguishes the differentiation operator `∂_μ` from the coordinate differential `dx^μ`. (The `wrt` argument is used for its dim only — for the `divide(of.dim, wrt.dim)` rule — and as a structural placeholder for what's being differentiated against. Typical usage: `wrt` is a `tensor-symbol` with `role: 'coordinate'`.)

<!-- TENSOR-RULE: pderiv-label-collision-rejected -->
If `wrtIndex.label` collides with an existing free index in `of`'s free-indices map, the expression is rejected with `IndexLabelCollisionError` (a partial-derivative-aware variant of the v0.2.0 rule).

<!-- TENSOR-RULE: pderiv-role-inherits-from-of -->
A `tensor-partial-derivative` inherits the `role` field from `of` when `of` is a `tensor-symbol`. If `of` lacks an explicit role or is a non-tensor-symbol node (e.g., `metric-tensor`), the inferred role defaults to `'field'`. (Per Design §13 Q1 locked decision.)

## §VIII.5 The raise() / lower() helper contract

<!-- TENSOR-RULE: raise-lower-construct-tensor-product -->
`raise(operand, gInverse, label)` and `lower(operand, g, label)` return a `tensor-product` node containing a (possibly alpha-converted) metric and the operand. The resulting expression is structurally indistinguishable from a hand-written `tensor-product` and validates through the existing `computeContraction` path.

<!-- TENSOR-RULE: raise-lower-internal-alpha-conversion -->
`raise()` and `lower()` perform INTERNAL ALPHA-CONVERSION on the metric's indices: one of the metric's labels is renamed to match `label` (so the Einstein-summation contraction picks it up), and the OTHER label is renamed to a fresh label that does not collide with any free index in `operand`. The fresh label becomes the resulting tensor-product's only new free index.

<!-- TENSOR-RULE: raise-lower-fresh-label-deterministic -->
The fresh-label generator uses a deterministic naming scheme. The exact scheme is implementation-defined (e.g., `<original-metric-label>_<counter>`) but MUST be deterministic so error messages and serialized ASTs are reproducible across runs.

<!-- TENSOR-RULE: raise-requires-upper-variance-inverse-metric -->
`raise(operand, gInverse, label)` requires that `gInverse` is a `metric-tensor` whose indices BOTH have `variance: 'upper'`. Passing a `lower`-variance metric to `raise()` is rejected with `MetricSignatureError`. (Symmetric: `lower()` requires both-lower metric.)

<!-- TENSOR-RULE: raise-requires-label-present-in-operand -->
`raise(operand, gInverse, label)` requires that `label` is one of `operand`'s free indices AND has variance `'lower'` (so raising it is a valid operation). If `label` is absent from operand's free indices or already upper, the helper rejects with a descriptive error.

## §VIII.6 ValidationResult enrichment

The v0.2.0 enrichment (`freeIndices: Map<string, {upper, lower}>`) stands without modification. The three new node kinds populate it the same way:

<!-- TENSOR-RULE: metric-tensor-free-indices-from-decl -->
A `metric-tensor` reports both its indices as free, one contribution per label per variance.

<!-- TENSOR-RULE: kronecker-delta-free-indices-from-decl -->
A `kronecker-delta` reports both its indices as free, one upper + one lower.

<!-- TENSOR-RULE: pderiv-free-indices-union -->
A `tensor-partial-derivative` reports `freeIndices = of.freeIndices ∪ {wrtIndex.label: lower}` (with collision rejection per §VIII.4).

## §VIII.7 Error-message discoverability hints

<!-- TENSOR-RULE: variance-mismatch-suggests-raise-lower -->
The `VarianceMismatchError` message includes a hint suggesting `raise()` / `lower()` for resolving same-variance index pairs via the metric. (Updated v0.3.0 message; v0.2.0's original wording said "v0.2.0 has no metric to raise/lower indices, so this contraction is rejected" — the v0.3.0 update inverts that.)

<!-- TENSOR-RULE: index-collision-includes-helper-context -->
When an `IndexLabelCollisionError` originates from a tensor-product whose call-site provenance is a `raise()` or `lower()` helper, the error message includes that context and suggests using a DIFFERENT inverse metric (not re-using the same metric with the same labels). Implementation: helpers tag their output tensor-product with an internal provenance marker (an optional `_origin?: 'raise' | 'lower'` field on the node) consumed by the validator's error path. The marker is not part of the public ExprNode contract and gets stripped on JSON serialization.

## §VIII.8 Worked example — BE-37 Shapiro gravitational time-delay

See `src/bridges/equations/be-37-shapiro-time-delay.ts` post-v0.3.0 for the canonical structural encoding. Sketch (filled in at Task 13 of the implementation plan, from the Task 1 decision record):

```typescript
// [paste the sketch from Task 1's decision record verbatim]
```

For the current pre-Task-13 sketch and the full BE-37 selection rationale (Pareto-frontier analysis, axis scorecard, alternatives considered), see `docs/planning/v0.3.0-Bridge-Selection.md` (committed at `eeb0829`).

The v0.1.0 / v0.2.x scalar stub form is removed; the structural form is validated by `tests/bridges/be-37-shapiro-time-delay-structural.test.ts` (or whatever the chosen bridge's test file is named).

## §VIII.9 v0.4.0 forward-compat — `∂_μ g_νλ` is well-typed

<!-- TENSOR-RULE: pderiv-of-metric-composes -->
`pderiv(g_lower, x_coord, {label: 'μ', variance: 'lower'})` where `g_lower: metric-tensor` is well-formed and produces a rank-3 expression with free indices `{μ:lower, ν:lower, λ:lower}` (assuming `g_lower` had labels ν, λ both lower). This composition is the building block for the v0.4.0 Christoffel symbol `Γ^λ_μν = (1/2) g^λρ (∂_μ g_ρν + ∂_ν g_ρμ - ∂_ρ g_μν)`. v0.3.0 verifies this composition via a preview test (see `tests/dimensional/covariant-derivative-preview.test.ts`).

## §VIII.10 v0.5.0+ refactor scope — per-component dimension support

> **BREAKING CHANGE SCOPE FLAG.** v0.3.0 commits to a single `dim: Dimension` field per node on `metric-tensor`, `tensor-symbol`, and `kronecker-delta`. This bakes in the **uniform-component-dim assumption** — every component of a given tensor shares the same physical dimension.
>
> Tensors whose components have heterogeneous dimensions cannot be represented in v0.3.0. The canonical example is the Faraday tensor `F_μν`: the spatial components are magnetic field [T], the temporal-spatial components are electric field [V/m].
>
> **v0.5.0+ will refactor `dim` from a single `Dimension` to a structured field** (one viable shape: `dim: Dimension | DimensionMatrix` where `DimensionMatrix` is a per-component-pair lookup). This refactor is **BREAKING** for any consumer that reads `node.dim` as a flat `Dimension`. The refactor is scoped to v0.5.0+ because v0.4.0's Christoffel/covariant-derivative work only needs uniform-dim metrics (the metric in GR has all components of dim `LENGTH²` in line-element convention, or `DIMENSIONLESS` in geometrized units — uniform either way).
>
> All three v0.3.0 node kinds (`metric-tensor`, `tensor-symbol`, `kronecker-delta`) participate in this refactor. The flag lives in the spec so the v0.5.0 design pass starts with this constraint in view.

## §VIII.11 SemVer posture for v0.3.0

<!-- TENSOR-RULE: v030-additive-semver-minor-bump -->
v0.3.0 adds three new ExprNode kinds, five new error subclasses, and one new module (`src/dimensional/metric.ts`). No v0.2.x AST shapes change. No v0.2.x error-type names change (only message texts on `VarianceMismatchError` and `IndexLabelCollisionError` are refreshed — message text is not part of the SemVer contract). v0.3.0 is a SemVer MINOR bump.
