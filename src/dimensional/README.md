# Dimensional Analyzer

A small TypeScript module that walks an expression tree, propagates SI base
dimensions through arithmetic / integral / derivative operators, and reports
homogeneity violations. It exists so future bridge equations can be vetted
against the SI dimension system before entering the bridge-equation index.

## What it does

- Defines a `Dimension` interface — exponents over the seven SI base
  dimensions (`L`, `M`, `T`, `I`, `Theta`, `N`, `J`) per BIPM SI Brochure
  9th edition (2019), Table 3.
- Provides named-dimension constants (LENGTH, ENERGY, ACTION, ENTROPY,
  CHARGE, …) derived per NIST SP 811 (2008) §4.
- Provides dimensional algebra: `multiply`, `divide`, `power`, `add`,
  `subtract`, `equals`, and `format`.
- Provides a typed `ExprNode` AST and a `validate` / `validateEquation`
  pair that walks the tree and reports per-node `Violation` records with
  tree-path locations.

## How to use

```ts
import {
  validateEquation,
  ExprNode,
  MASS, ACCELERATION, FORCE,
} from 'universal-physics-tensor';

const sym = (name: string, dim: any): ExprNode => ({ kind: 'symbol', name, dim });

const lhs = sym('F', FORCE);
const rhs: ExprNode = {
  kind: 'op', op: '*',
  args: [sym('m', MASS), sym('a', ACCELERATION)],
};

const r = validateEquation(lhs, rhs);
console.log(r.ok);                   // true
console.log(r.inferredDimension);    // FORCE
console.log(r.violations);           // []
```

A failure case:

```ts
import { validate, ENERGY, LENGTH } from 'universal-physics-tensor';

const r = validate({
  kind: 'op', op: '+',
  args: [
    { kind: 'symbol', name: 'E', dim: ENERGY },
    { kind: 'symbol', name: 'x', dim: LENGTH },
  ],
});
// r.ok = false
// r.violations[0].note = "Cannot add [length] with running [energy] (dimension mismatch)."
```

## How it consumes the bridge index

The 44-entry catalog in `src/bridges/index.ts` (IDs 11–54) carries
`formula_latex` strings; the `dimensional_signature` field is populated
for AST-encoded entries (now the large majority of the catalog — see
`src/bridges/equations/`) and `null` for the few not yet encoded as
`ExprNode` ASTs.

`inferDimensionForBridge(id, expr)` runs the analyzer on a supplied AST
and, if `id` is registered in `EXPECTED_DIMENSION_BY_BRIDGE`, also
cross-checks the inferred dim against the per-bridge expected dim
(returning `null` on mismatch). `EXPECTED_DIMENSION_BY_BRIDGE` covers 42
entries (IDs 11–50, 53, 54); BE-51/52 are closed-form evaluators without
AST encodings and are not registered there. The two encoded modules
(BE-11 and BE-14) call `validate` / `validateEquation` directly inside
their own `validate*Dimensions()` helpers; `inferDimensionForBridge` is
the entry point recommended for downstream consumers that don't want to
import each per-bridge module separately.

## Encoding transcendental functions (the dimensionless-stub convention)

The current AST has no `exp`, `log`, `sin`, `cos`, `tanh`, etc. as primitives — the validator treats these as opaque scalar functions. To encode a formula like `m₀ · exp(-α|φ-φ₀|/M_P)` honestly:

1. Encode the formula as `m₀ · ε` where `ε` is a dimensionless `symbol` node with `name` set to the rendered function (`'exp(-α|φ-φ₀|/M_P)'` or any human-readable form). The dim is `DIMENSIONLESS`.
2. Expose the inner argument as a separate `ExprNode` export named `<MODULE>_<FN>_ARG`, where `<FN>` is `EXP`, `LOG`, `WKB`, etc. The exposed name acts as the lemma anchor.
3. Add a lemma test `it('<fn> argument <expr> is dimensionless (lemma)', ...)` that runs `validate()` on `<MODULE>_<FN>_ARG` and asserts `format(inferredDimension)` equals `'[1]'`.

This is **honest** in the sense that the AST captures only what it can verify (the multiplicative structure and the dimensional balance of the argument), and **explicit** in the sense that future readers can see what is being treated as opaque vs. structural. Promotion to a real `transcendental` node kind is deferred until at least three independent encodings demand it; until then this stub pattern is the recommended approach.

Used in:

- BE-26 (WKB factor): `DNA_TUNNELING_WKB_ARG` for the WKB integral `(2/ℏ)∫√(2m(V−E))dx`.
- BE-34 (Boltzmann factor): `KIBBLE_ZUREK_EXP_ARG` for `m c²/(k_B T_reh)`.
- BE-41 (Swampland exponential mass): `SWAMPLAND_EXP_ARG` for `α|φ-φ₀|/M_P`.

## Tensor-level layers (v0.2.0–v0.6.0 additions)

The "What it does" section above describes the original Tier-4 **scalar**
dimensional analyzer. Since then the `ExprNode` union has grown well beyond
the four scalar primitives — the live union in `validator.ts` carries **21
node kinds**. The added layers, each with its own per-kind validator module:

- **v0.2.0–v0.3.0 — tensor algebra + metric layer.** `tensor.ts`
  (`tensor-symbol`, `tensor-product`; variance-typed indices, Einstein
  summation), `metric.ts` (`raise()` / `lower()` helpers),
  `metric-validators.ts` (`metric-tensor`, `kronecker-delta`,
  `tensor-partial-derivative`), and `fresh-label.ts` (shared deterministic
  fresh-label utility used by both `metric.ts` and `connection.ts`). Specified
  in `docs/specification/Part-VII` (algebra) and `Part-VIII` (metric).
- **v0.4.0 — connection layer.** `connection.ts` (Christoffel symbols),
  `connection-validators.ts` (`covariant-derivative`, `riemann-tensor`).
- **v0.5.0 — curvature layer.** `curvature.ts` hosts the curvature-derived
  GR objects obtained by contracting a `RiemannTensorNode` — node kinds
  `ricci-tensor`, `einstein-tensor`, `bianchi-residual`.
- **v0.6.0 — Killing / stress-energy / Einstein-equation / Weyl /
  Kretschmann.** `killing-validators.ts` (`killing-vector`,
  `conserved-charge`), `stress-energy-validators.ts` (`stress-energy`,
  `cosmological-constant` — `stress-energy` carries a per-component
  `componentDim` channel), `einstein-equation.ts` (`einstein-field-equation`,
  the `G_μν + Λ g_μν = (8πG/c⁴) T_μν` predicate), `weyl-validators.ts`
  (`weyl-tensor`, the trace-free part of Riemann), and `curvature-invariants.ts`
  (`kretschmann-scalar`, the quadratic curvature invariant). The 4-kind
  parallel-duplication of curvature node construction is consolidated by the
  `curvature-composite.ts` factory.

`buckingham.ts` is a standalone dimensional-analysis tool (not an AST/validator
layer): `buckinghamPi` enumerates the dimensionless π-groups of a variable set
(the null space of the dimension matrix, exact rational arithmetic), and
`dimensionallyDetermines` reports whether a target is fixed up to a
dimensionless constant. It is the principled primitive for the composition
layer's identifiability classifier (exactly-determined case); the result types
carry FORM only — never a value or constant. See
`docs/planning/Bridge-Inference-Epistemics-Note.md`.

`errors.ts` carries the error-class hierarchy for all of the above (e.g.
`DuplicateIndexLabelError` — note the earlier name `RepeatedDummyLabelError`
was removed in v0.4.5). The "What's NOT in MVP" list below is the *original
Tier-4 MVP scope*; the tensor-index / general-tensor-algebra items there have
since been delivered by the v0.2.0–v0.6.0 layers described in this section.

## Limitation: `^` operator requires literal-numeric exponents

Per CS iter-6 paper-review C4: the validator's `^` operator implementation
requires `args[1]` to be a `symbol` whose `name` is a numeric literal
(e.g., `'2'`, `'0.5'`, `'-1'`). Symbolic exponents — for example, encoding
the `^{2Δ-d}` factor in BE-21's AdS/CMT recipe with a `symbol('2Δ-d',
DIMENSIONLESS)` — silently fall through to incorrect dim inference rather
than producing a violation.

**Workarounds for future Tier-5 encoders:**

- When the exponent is concrete in the system being encoded (e.g.,
  `(τ_Q/τ_0)^(-dν/(1+zν))` for canonical 3D Heisenberg with `d=ν=z=1`),
  encode the exponent as the literal value (`-0.5` in this case). See
  `src/bridges/equations/be-34-kibble-zurek.ts` for the working pattern.
- When the exponent is genuinely scheme-dependent (e.g., BE-21's
  `r^{2Δ-d}` where Δ depends on the operator), encode the entire
  `^` factor as a single dimensionless-stub symbol (named like
  `'r^{2Δ-d}'`) rather than as a structural `^` op. The argument's
  dimensionlessness is then verified via the lemma-test pattern
  (see "Encoding transcendental functions" above).
- A future AST extension could add `kind: 'op-pow-symbolic'` that accepts
  a non-literal exponent and tags the result `dim_indeterminate`. Filed
  as a Tier-5 followup.

## What's NOT in MVP

- **Tensor index / rank tracking.** Catching Bridge Eq 17's index-structure
  mismatch (`R_{μν}^{λρ} = … + g_{μν} F_{αβ} F^{αβ}`) requires extending
  `Dimension` with a free-index list. Filed as Tier 4.5 follow-up.
- **Special functions.** `log`, `exp`, `sin`, `cos`, etc., must take
  dimensionless arguments — not yet enforced. Their results are
  dimensionless (when the argument is) but no node kind is provided yet.
- **General tensor algebra.** Contractions, raising/lowering, symmetric/
  antisymmetric parts — out of scope for Tier 4.
- **LaTeX → ExprNode parser.** Bridges in the index are stored as LaTeX;
  consumers must hand-encode the AST. A parser is a separate piece of work
  and is not on the Tier-5 critical path.
- **Serialization** (YAML/JSON load of ExprNode) — deferred.
- **CLI / web UI** — deferred.

## References

- BIPM, *The International System of Units (SI)*, 9th edition, 2019.
- NIST Special Publication 811 (2008).
- Bridgman, *Dimensional Analysis*, Yale University Press, 1922.
- CODATA 2018 / NIST CODATA values: <https://physics.nist.gov/cuu/Constants/>
- Sakurai, *Modern Quantum Mechanics*, 2nd ed. (Schrödinger formulation).
- Goldstein, *Classical Mechanics*, 3rd ed. (Newton II derivation).
- Bekenstein, *PRD* 7 (1973); Hawking, *CMP* 43 (1975) — black-hole entropy
  formula `S = k_B A c^3 / (4 ℏ G)`.
