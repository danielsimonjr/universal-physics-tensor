# Phase 1 — `parsePhysics` + Dimensionally-Aware `--equation` — Design

**Goal:** Expose a real public parser from physics text to UPT's dimensional
`ExprNode`, close the scalar grammar gap (faithful `transcendental`/`abs`
nodes), and rewire `upt map --equation` to dimensionally validate the user's
equation and give a dimension-based "did you mean?" via single-unknown
dimensional inference.

**Status:** approved 2026-06-20 (brainstorming). Phase 1 of the
parser-consolidation program; Phase 2 (AST consolidation) is a later spec.
Implements via dev-workflow.

## Background (verified)

`formula-dimension.ts` already parses physics text with BOTH front-ends
(`transpileMathts` over the MathTS AST; `transpilePathB` over the built-in AST)
and transpiles to a dimensional `ExprNode`, then validates it — but it discards
the `ExprNode` after reading its dimension, and it **lossily** collapses
transcendentals (`exp(x)` → a dimensionless stub symbol) and `abs` (→ its arg).
`expr-eval.ts` already evaluates an `ExprNode` numerically. The dimensional
`ExprNode` grammar already has `transcendental` (`fn ∈ {exp, ln, log2, log10,
sin, cos, tan, sinh, cosh, tanh}`, dimensionless→dimensionless) and `abs`
(dimension-preserving) node kinds.

## Components

### 1. Close the scalar grammar gap (`formula-dimension.ts`)

Both transpilers emit **faithful nodes** instead of stubs:
- Functions with a grammar node → `{ kind: 'transcendental', fn, arg }`, mapping
  parser names to `TranscendentalFn` (`log` → `ln`; `exp/ln/log2/log10/sin/cos/
  tan/sinh/cosh/tanh` direct). `validate()` then enforces the dimensionless-arg
  rule (so `exp(energy)` correctly fails).
- `abs(x)` → `{ kind: 'abs', arg }` (dimension-preserving), not `→ arg`.
- The remaining transcendentals without a node kind (`asin/acos/atan/sec/csc/
  cot`) keep the existing dimensionless **stub** (honest: still
  dimensionless→dimensionless, just not a faithful node). Calculus/tensor kinds
  remain builder-only (no text syntax).

### 2. Expose `parsePhysics` (public)

Add a throwing `parse(expr, dims) → { expr: ExprNode; dimension: Dimension }` to
the checker seam (`createFormulaDimensionChecker`); `check()` becomes a
non-throwing wrapper over it. Export `FormulaDimensionError`. In
`formula-registry.ts` add the cached, async public:

```ts
export async function parsePhysics(
  text: string,
  dims: Readonly<Record<string, Dimension>>,
): Promise<{ expr: ExprNode; dimension: Dimension }>;
```

It uses the active checker (MathTS when the peer is installed, else built-in) —
the same registry that already backs `getFormulaParser`/`getFormulaDimensionChecker`.

### 3. Single-unknown dimensional inference (`src/dimensional/dimension-inference.ts`, public, pure)

```ts
export function inferUnknownDimension(
  expr: ExprNode,
  unknown: string,
  targetDim: Dimension,
): Dimension | null;
```

Probe method (no symbolic differentiation):
1. `D0 = dimensionOf(substituteSymbolDim(expr, unknown, DIMENSIONLESS))`;
   `D1 = dimensionOf(substituteSymbolDim(expr, unknown, LENGTH))`. If either is
   non-homogeneous (the unknown is constrained inside a sum) → `null`.
2. `pVec = divide(D1, D0)`. It must be a clean power of the probe: only the `L`
   component nonzero. `p = pVec.L`. If not clean, or `p === 0` → `null`.
3. `unknownDim = power(divide(targetDim, D0), 1 / p)`. Reuses dimensional
   `algebra` (`divide`, `power`). Return it.

`substituteSymbolDim(expr, name, dim)` is a small pure tree rebuild (sibling
helper). Abstains (returns `null`) whenever the dimension is not uniquely pinned
— never guesses.

### 4. Dimension-based suggestions (`src/composition/user-equation.ts`)

```ts
export function suggestByDimension(
  dim: Dimension,
  catalogDims: ReadonlyMap<string, Dimension>,
  k?: number,
): string[];
```

Catalog quantity names whose dimension equals `dim` (via `equals`), capped at `k`.

### 5. Rewire `upt map --equation` (`bin/upt.mjs`)

Build a catalog name→dimension map from the chosen graph's quantities
(`q.dim`). Then:
- Build a `dims` map: matched symbols → their catalog dimension; the (≤1)
  unmatched symbol → a `DIMENSIONLESS` placeholder so `parsePhysics` can parse.
- `parsePhysics(rhs, dims)` → `{ expr, dimension }` (the RHS dimension).
- **Dimensional validation:** if the target resolves to a catalog quantity,
  compare the RHS dimension to it → `✓ [time]` / `⚠ RHS is [energy] but target
  'period' is [time]`. If `parsePhysics` throws (non-homogeneous, e.g.
  `length + time`, or `exp` of a dimensional arg) → report the error and skip the
  graph step (exit 2).
- **Dimension-based hint:** for exactly one unmatched symbol with a known target
  dimension, `inferUnknownDimension` → if non-null, `suggestByDimension` for the
  "did you mean?"; else fall back to the name-similarity `suggestQuantities`.
- The graph landing (cluster / shared quantities) is unchanged.

`--equation` stays free-form; the dims come from the catalog + inference, NOT a
new typed syntax.

## Public surface

`parsePhysics`, `FormulaDimensionError`, `inferUnknownDimension`,
`substituteSymbolDim`, `suggestByDimension` (+ types). Wire through
`composition/index` / `numerical` as appropriate and `src/index.ts`; update the
public-surface test + snapshot.

## Testing

- **grammar gap**: `parsePhysics` emits `transcendental`/`abs` nodes; `exp(energy)`
  rejected; `abs` preserves dimension; `asin` still stubs.
- **parsePhysics**: returns expr + dimension for both front-ends; homogeneity
  errors throw `FormulaDimensionError`.
- **inferUnknownDimension**: pins the unknown for `energy = mass*c^2`
  (→ `[energy]`); abstains on ≥2 unknowns and on sum-constrained unknowns; handles
  a power (`x^2`).
- **suggestByDimension**: returns same-dimension catalog names.
- **CLI**: `--equation` reports `✓`/`⚠` dimensional verdict; a dimensionally-wrong
  equation (`period = mass*c^2`) is flagged; the dimension-based hint fires for a
  single unknown; malformed/non-homogeneous → exit 2; the existing landing still
  prints.
- Firewall unchanged (user junction never written to catalog).

## Out of scope (Phase 2 / YAGNI)

- Retiring the formula parser's own evaluator / full AST unification (Phase 2).
- Parsing calculus/tensor kinds from text (no clean syntax).
- Multi-unknown dimensional inference (abstains; name hint covers it).
