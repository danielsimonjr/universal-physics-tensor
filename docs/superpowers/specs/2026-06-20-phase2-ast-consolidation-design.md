# Phase 2 — AST Consolidation (canonical IR + transient frontends)

**Goal:** Make the dimensional `ExprNode` unambiguously the single *semantic* IR
by collapsing the two structurally-parallel transpilers in `formula-dimension.ts`
into one, routing both parse-trees (MathTS AST, built-in `FormulaAstNode`) through
a tiny normalized parse-node. Lower-risk variant: `CompiledFormula`'s interface
and evaluator are untouched (eval/derive numerics unchanged).

**Status:** approved 2026-06-20 (approach pre-chosen in brainstorming; "continue
with phase 2"). Phase 2 of the parser-consolidation program. Implements via
dev-workflow.

## Problem

`formula-dimension.ts` carries two transpilers that do the same dimensional work
over different parse trees:
- `transpileMathts(MathNode, dims)` — `ConstantNode/SymbolNode/ParenthesisNode/
  OperatorNode/FunctionNode`.
- `transpilePathB(FormulaAstNode, dims)` — `num/sym/unary/bin/call`.

They share helpers (`resolveSymbol`, `transpileFunction`, `sym/op/powExpr`) but
duplicate the per-node dispatch and the constant-exponent evaluation
(`mathtsConstant` vs `pathBConstant`). A future grammar change must touch both.

## Design

Introduce a minimal **normalized parse node** and adapt each front-end to it;
transpile once.

```ts
type PNode =
  | { kind: 'num'; value: number }
  | { kind: 'sym'; name: string }
  | { kind: 'neg'; arg: PNode }                 // unary minus (dimension-neutral)
  | { kind: 'op'; op: '+' | '-' | '*' | '/'; args: PNode[] }
  | { kind: 'pow'; base: PNode; exp: PNode }    // exp must evaluate to a constant
  | { kind: 'call'; fn: string; args: PNode[] };

function mathtsToPNode(node: MathNode): PNode;        // thin shape adapter
function pathBToPNode(node: FormulaAstNode): PNode;   // thin shape adapter
function pnodeConstant(node: PNode): number;          // evaluate a constant PNode
function normToExpr(node: PNode, dims): ExprNode;     // the ONE transpiler
```

`normToExpr` owns all the dimensional logic (the `resolveSymbol`, `op`, `^`→
`powExpr`, `sqrt`/`cbrt`/`pow`, and `transpileFunction` dispatch — incl. the v0.26
`transcendental`/`abs` grammar). The two adapters are pure structural maps with
no dimensional knowledge. `pnodeConstant` replaces `mathtsConstant` +
`pathBConstant` (one constant-folder over `num/neg/op/pow`).

Wiring: `createFormulaDimensionChecker` is fed `(expr,dims) => normToExpr(<adapt>(
parse(expr)), dims)` for each front-end (`builtinFormulaDimensionChecker` uses
`pathBToPNode∘parseFormulaToAst`; the MathTS loader uses `mathtsToPNode∘mod.parse`).

**No public-surface change.** `parsePhysics`, `check`, `FormulaDimensionError`,
`ParsedPhysics` are unchanged; `CompiledFormula`/`evalFormulaAst` (the evaluator)
are untouched.

## Behavior preservation

This is a pure refactor **with one deliberate narrowing**: the unified
`pnodeConstant` folds constant exponents only over literal arithmetic
(`num`, unary `neg`, `+ - * / ^`). A *function call* or *named constant* in an
exponent (e.g. `x^sqrt(4)`, `r^pi`) — which the old per-parser evaluators
(`node.evaluate` / `evalFormulaAst`) happened to fold — is now rejected with
`FormulaDimensionError`. This is intentional: real physics exponents are literal
rationals (`2`, `-1`, `1/3`), and re-folding arbitrary functions would
re-duplicate `formula.ts`'s function table. Pinned by a negative test.

The existing tests are the regression guard:
- `tests/numerical/parse-physics.test.ts` (both front-ends: nodes + homogeneity).
- the full `derive --formula` / `eval` suite (dimension checks + evaluation).
- **New test:** for a set of expressions, assert `builtinFormulaDimensionChecker()
  .parse(expr, dims).expr` deep-equals what the MathTS-backed checker produces —
  proving the two front-ends now converge on identical `ExprNode` via the single
  transpiler.

## Documentation

`ARCHITECTURE.md`: a short note that `ExprNode` is the canonical semantic IR; the
MathTS AST and built-in `FormulaAstNode` are transient parse-trees normalized to
`PNode` and transpiled once to `ExprNode` (validate · eval · AD · compose all
operate on `ExprNode`).

## Out of scope (YAGNI)

- Retiring `CompiledFormula`'s evaluator / routing eval through `evalExpr` (the
  higher-risk "full unification" option — explicitly NOT chosen).
- Having the parsers emit `ExprNode` directly (would rewrite the parsers).
- Any new grammar (Phase 1 closed the scalar gap; calculus/tensor stay
  builder-only).
