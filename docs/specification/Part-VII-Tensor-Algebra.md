# Part VII — Tensor Algebra

> **Scope:** v0.2.0 algebra layer of UPT's tensor extensions. Defines variance-typed index labels, the Einstein summation contraction rule, and the strict-boundary semantics for how scalar `op` nodes interact with tensor operands. Metric, raise/lower, covariant derivative, and curvature are explicitly out of scope (deferred to v0.3.0+).

## §VII.1 Grammar

The v0.2.0 tensor extension adds two production rules to UPT's ExprNode grammar:

```
ExprNode ::= ... existing scalar productions ...
           | TensorSymbol
           | TensorProduct

TensorSymbol ::= "tensor-symbol" Identifier IndexList Dimension Role?
IndexList    ::= "[" Index ("," Index)* "]"
Index        ::= Label Variance
Variance     ::= "upper" | "lower"
Label        ::= Identifier (typically a single Greek letter: μ, ν, λ, α, β, ...)
Role         ::= "coordinate" | "field" | "constant"   (* optional, defaults to "field" *)

TensorProduct ::= "tensor-product" "[" ExprNode ("," ExprNode)+ "]"
```

## §VII.2 Storage-order convention

<!-- TENSOR-RULE: storage-order-left-to-right -->
The indices list `[μ, ν, λ]` of a `tensor-symbol` defines numerical storage order: leftmost index is the outermost array dimension. A `tensor-symbol` with indices `[μ, ν, λ]` and component-shape `(d_μ, d_ν, d_λ)` lowers to a mathjs Matrix `M` where `M[i][j][k]` accesses the component at `(μ_idx=i, ν_idx=j, λ_idx=k)`. This convention is locked from v0.2.0 forward for mathjs / TensorJS interop.

## §VII.3 Component-dimension uniformity (v0.2.0 limitation)

<!-- TENSOR-RULE: uniform-component-dimension -->
Every component of a `tensor-symbol` shares the same physical dimension (the `dim` field). Mixed-dimension tensors such as the Faraday tensor `F_μν` (electric field components have `[V/m]`, magnetic field components have `[T]`) cannot be represented in v0.2.0. This limitation is revisited in v0.3.0 with the metric layer.

## §VII.4 Variance and contraction rules

<!-- TENSOR-RULE: einstein-summation-on-matched-pairs -->
In a `tensor-product` over operands, every index label that appears once as `upper` and once as `lower` across the combined index sets of all operands is **automatically contracted** (Einstein summation convention). Contraction reduces the free-index set; the remaining unmatched labels are "free" indices that propagate to the result.

<!-- TENSOR-RULE: label-collision-rejected -->
An index label that appears more than twice across a `tensor-product`'s combined operands is a label collision and is rejected with `IndexLabelCollisionError`. The user must rename one of the offending indices.

<!-- TENSOR-RULE: variance-mismatch-rejected -->
If a label appears exactly twice but both occurrences have the same variance (both `upper` or both `lower`), the expression is not a valid contraction and is rejected with `VarianceMismatchError`. (In v0.2.0 without the metric, mismatched-variance contractions cannot be resolved by raising or lowering; they are simply invalid.)

<!-- TENSOR-RULE: repeated-dummy-label-in-tensor-symbol-rejected -->
Within a single `tensor-symbol`, repeated index labels (e.g., `T^μ_μ_μ`) are rejected with `RepeatedDummyLabelError`. This is detected at validation time before contraction.

## §VII.5 Op-tensor interaction boundaries

<!-- TENSOR-RULE: op-add-requires-matching-shape -->
`op '+'` and `op '-'` accept tensor operands when all arguments share both the same `dim` and the same `freeIndices` map. Mixed scalar + tensor, or tensor + tensor with differing free indices, is rejected with `FreeIndexMismatchError`.

<!-- TENSOR-RULE: op-multiply-divide-rejects-tensors -->
`op '*'` and `op '/'` are strict scalar operators. Any argument with non-empty `freeIndices` is rejected with `TensorInScalarOpError`. Users must use `tensor-product` for tensor multiplication.

<!-- TENSOR-RULE: op-power-rejects-tensors -->
`op '^'` is scalar-only in v0.2.0. The base must have empty `freeIndices`; the exponent must be a DIMENSIONLESS scalar. Tensor exponentiation (e.g., `T^2` meaning `T^μν T_μν`) is not supported; users must write the contraction explicitly.

## §VII.6 ValidationResult enrichment

The v0.2.0 validator returns `{ ok, inferredDimension, freeIndices, violations }`. The `freeIndices` field is a `Map<string, { upper: number; lower: number }>`. Invariants:

<!-- TENSOR-RULE: scalar-has-empty-free-indices -->
A scalar `symbol` node always reports `freeIndices` as an empty Map.

<!-- TENSOR-RULE: tensor-symbol-free-indices-from-decl -->
A `tensor-symbol` with indices `[{label: 'μ', variance: 'upper'}, {label: 'ν', variance: 'lower'}]` reports `freeIndices` as `Map([['μ', {upper: 1, lower: 0}], ['ν', {upper: 0, lower: 1}]])`.

<!-- TENSOR-RULE: contraction-zeros-out-paired-labels -->
After `tensor-product` contraction, fully-contracted labels (both `upper` and `lower` counts reach zero) are removed from the output `freeIndices` Map. Partially-contracted labels retain their remaining count.

## §VII.7 Partial-derivative AST node (preview only — implementation deferred to v0.3.0)

<!-- TENSOR-RULE: partial-derivative-preview-shape -->
The v0.3.0 implementation will add a `tensor-partial-derivative` ExprNode kind. Its shape is locked here for forward-compatibility:

```typescript
{ kind: 'tensor-partial-derivative';
  wrtIndex: { label: string; variance: 'lower' };
  of: ExprNode }
```

Semantics: `∂_μ T^ν` (with `wrtIndex.label='μ', variance='lower'` and `of = T^ν`) yields a tensor with `freeIndices = T^ν.freeIndices ∪ {μ: {upper: 0, lower: 1}}` (one additional lower index). The dimension is `divide(T.dim, coordinate.dim)` where the coordinate's dimension is `[L]` for spatial indices and `[T]` for the time index. The `role: 'coordinate'` field on the differentiating tensor-symbol (the implicit `x^μ`) selects the right dimension.

**v0.2.0 does NOT implement this.** The preview exists to lock the shape so v0.3.0 work is additive.

## §VII.8 The `role` field on tensor-symbol

<!-- TENSOR-RULE: role-field-three-values -->
`tensor-symbol` has an optional `role: 'coordinate' | 'field' | 'constant'` field. Semantics:

- `'field'` (default): a dynamical quantity that depends on coordinates. Most bridge encodings use this.
- `'coordinate'`: a coordinate variable (`x`, `y`, `z`, `t`). Used as the differentiating variable in `tensor-partial-derivative` (v0.3.0+).
- `'constant'`: a physical constant tensor (e.g., the metric `g_μν` in v0.3.0, the Minkowski metric `η_μν`). Not differentiable.

For v0.2.0, `role` is structural metadata; it does not change validator behavior. It exists to enable v0.3.0 partial-derivative semantics without retrofitting the AST.

## §VII.9 Worked example — BE-17 Einstein-Cartan torsion-spin contraction

See `src/bridges/equations/be-17-einstein-cartan.ts` post-v0.2.0 for the canonical structural encoding. Sketch:

```typescript
const T_lower = tsym('T_torsion', [
  { label: 'λ', variance: 'lower' },
  { label: 'μ', variance: 'lower' },
  { label: 'ν', variance: 'lower' },
], TORSION_COMPONENT_DIM);

const T_upper = tsym('T_torsion', [
  { label: 'λ', variance: 'upper' },
  { label: 'μ', variance: 'upper' },
  { label: 'ν', variance: 'upper' },
], TORSION_COMPONENT_DIM);

// Contracted scalar: T_λμν T^λμν
const T_contracted = contract(T_lower, T_upper);
// validator → freeIndices = empty, dim = [T²·L⁻⁴]

// Full RHS: (c⁴/(8πG))² · T_λμν T^λμν
const BE17_RHS = contract(coupling_prefactor_squared, T_contracted);
// validator → freeIndices = empty, dim = [M²·L⁻²·T⁻²]
```

The v0.1.0 `T_torsion_squared` typed-stub is removed; the structural form is validated by `tests/bridges/be-17-structural.test.ts`.
