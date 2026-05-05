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

The 40 entries in `src/bridges/index.ts` carry `formula_latex` strings;
the `dimensional_signature` field is populated for hand-encoded entries
(currently BE-11, BE-14, BE-18, BE-29, BE-47, BE-48) and `null` for the
rest. As Tier-5 work continues, more entries will be hand-encoded as
`ExprNode` ASTs in `src/bridges/equations/`.

`inferDimensionForBridge(id, expr)` runs the analyzer on a supplied AST
and, if `id` is registered in `EXPECTED_DIMENSION_BY_BRIDGE`, also
cross-checks the inferred dim against the per-bridge expected dim
(returning `null` on mismatch). The two encoded modules (BE-11 and
BE-14) call `validate` / `validateEquation` directly inside their own
`validate*Dimensions()` helpers; `inferDimensionForBridge` is the entry
point recommended for downstream consumers that don't want to import
each per-bridge module separately.

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
