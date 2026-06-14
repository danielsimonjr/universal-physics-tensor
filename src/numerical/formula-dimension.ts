/**
 * Formula dimensional check (MathTS Phase 2 — see
 * docs/planning/Formula-Dimensional-Check-Design-Note.md).
 *
 * Transpiles a parsed formula AST into UPT's own dimensional `ExprNode` and
 * runs `validate()`, so the CLI can report whether a user's formula is
 * dimensionally HOMOGENEOUS and what dimension it has — unifying string→AST
 * with AST→dimension.
 *
 * Works with BOTH parsers: the MathTS AST (Path A) and the self-contained
 * Path B AST. Each has its own small transpiler over a shared core
 * (`createFormulaDimensionChecker` + the dimensional helpers), so the check
 * is available WITHOUT the MathTS peer (`builtinFormulaDimensionChecker`).
 *
 * @module numerical/formula-dimension
 */

import type { Dimension } from '../dimensional/types.js';
import { DIMENSIONLESS } from '../dimensional/types.js';
import { equals, format } from '../dimensional/algebra.js';
import type { ExprNode } from '../dimensional/validator.js';
import { validate } from '../dimensional/validator.js';
import type { FormulaAstNode } from './formula.js';
import { parseFormulaToAst, evalFormulaAst } from './formula.js';

/** A formula cannot be dimensionally analyzed (undeclared symbol, variable
 *  exponent, transcendental of a dimensional argument, unsupported node). */
export class FormulaDimensionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaDimensionError';
  }
}

/** Dimensionless math constants both parsers recognize. */
const MATH_CONSTANTS = new Set(['pi', 'tau', 'e', 'phi', 'Infinity', 'NaN']);

/** Transcendental functions: dimensionless argument → dimensionless result. */
const TRANSCENDENTAL = new Set([
  'exp', 'log', 'ln', 'log10', 'log2',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'sec', 'csc', 'cot',
]);

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });
const op = (o: '+' | '-' | '*' | '/' | '^', args: ExprNode[]): ExprNode => ({ kind: 'op', op: o, args });
const powExpr = (base: ExprNode, exp: number): ExprNode => op('^', [base, sym(String(exp), DIMENSIONLESS)]);

/** Resolve a symbol to a dimensioned `ExprNode` (declared dim, or a
 *  dimensionless math constant, else an error). */
function resolveSymbol(name: string, dims: Readonly<Record<string, Dimension>>): ExprNode {
  if (name in dims) return sym(name, dims[name]);
  if (MATH_CONSTANTS.has(name)) return sym(name, DIMENSIONLESS);
  throw new FormulaDimensionError(
    `undeclared symbol '${name}' — declare its dimension (e.g. ${name}:length)`,
  );
}

/** Inferred dimension of an `ExprNode`, or throw if not homogeneous. */
function dimensionOf(node: ExprNode): Dimension {
  const r = validate(node);
  if (!r.ok || r.inferredDimension === null) {
    throw new FormulaDimensionError(
      r.violations[0]?.note ?? 'expression is not dimensionally consistent',
    );
  }
  return r.inferredDimension;
}

/** Transcendental typed-stub: assert the argument is dimensionless, collapse
 *  to a dimensionless symbol (keeps the `ExprNode` grammar unchanged). */
function transcendentalStub(fn: string, argExprNode: ExprNode): ExprNode {
  const argDim = dimensionOf(argExprNode);
  if (!equals(argDim, DIMENSIONLESS)) {
    throw new FormulaDimensionError(
      `${fn}() requires a dimensionless argument, got ${format(argDim)}`,
    );
  }
  return sym(`${fn}(...)`, DIMENSIONLESS);
}

// --- MathTS AST transpiler (Path A) --------------------------------------

/** Structural shape of a MathTS AST node (the bits the transpiler reads). */
interface MathNode {
  readonly type: string;
  readonly value?: number;
  readonly name?: string;
  readonly op?: string;
  readonly args?: MathNode[];
  readonly content?: MathNode;
  readonly fn?: { readonly name?: string };
  evaluate(scope: Record<string, number>): unknown;
}

/** Evaluate a (presumed constant) MathTS exponent subtree. */
function mathtsConstant(node: MathNode): number {
  let v: unknown;
  try {
    v = node.evaluate({});
  } catch {
    throw new FormulaDimensionError('exponent must be a numeric constant');
  }
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new FormulaDimensionError('exponent must be a finite numeric constant');
  }
  return v;
}

function transpileMathts(node: MathNode, dims: Readonly<Record<string, Dimension>>): ExprNode {
  switch (node.type) {
    case 'ConstantNode':
      return sym(String(node.value), DIMENSIONLESS);
    case 'SymbolNode':
      return resolveSymbol(node.name!, dims);
    case 'ParenthesisNode':
      return transpileMathts(node.content!, dims);
    case 'OperatorNode': {
      const args = node.args ?? [];
      if (node.op === '-' && args.length === 1) return transpileMathts(args[0], dims);
      if (node.op === '^') return powExpr(transpileMathts(args[0], dims), mathtsConstant(args[1]));
      if (node.op === '+' || node.op === '-' || node.op === '*' || node.op === '/') {
        return op(node.op, args.map((a) => transpileMathts(a, dims)));
      }
      throw new FormulaDimensionError(`unsupported operator '${node.op}'`);
    }
    case 'FunctionNode': {
      const fn = node.fn?.name ?? node.name ?? '';
      const args = node.args ?? [];
      if (fn === 'sqrt') return powExpr(transpileMathts(args[0], dims), 0.5);
      if (fn === 'cbrt') return powExpr(transpileMathts(args[0], dims), 1 / 3);
      if (fn === 'pow') return powExpr(transpileMathts(args[0], dims), mathtsConstant(args[1]));
      if (fn === 'abs') return transpileMathts(args[0], dims);
      if (TRANSCENDENTAL.has(fn)) return transcendentalStub(fn, transpileMathts(args[0], dims));
      throw new FormulaDimensionError(`unsupported function '${fn}'`);
    }
    default:
      throw new FormulaDimensionError(`unsupported node '${node.type}'`);
  }
}

// --- Path B AST transpiler (built-in, no peer needed) --------------------

/** Evaluate a (presumed constant) Path B exponent subtree. */
function pathBConstant(node: FormulaAstNode): number {
  try {
    const v = evalFormulaAst(node, {});
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  } catch {
    /* free variable in the exponent */
  }
  throw new FormulaDimensionError('exponent must be a numeric constant');
}

function transpilePathB(node: FormulaAstNode, dims: Readonly<Record<string, Dimension>>): ExprNode {
  switch (node.kind) {
    case 'num':
      return sym(String(node.value), DIMENSIONLESS);
    case 'sym':
      return resolveSymbol(node.name, dims);
    case 'unary':
      return transpilePathB(node.arg, dims); // sign is dimension-neutral
    case 'bin': {
      if (node.op === '^') return powExpr(transpilePathB(node.left, dims), pathBConstant(node.right));
      return op(node.op, [transpilePathB(node.left, dims), transpilePathB(node.right, dims)]);
    }
    case 'call': {
      const fn = node.fn;
      const args = node.args;
      if (fn === 'sqrt') return powExpr(transpilePathB(args[0], dims), 0.5);
      if (fn === 'cbrt') return powExpr(transpilePathB(args[0], dims), 1 / 3);
      if (fn === 'pow') return powExpr(transpilePathB(args[0], dims), pathBConstant(args[1]));
      if (fn === 'abs') return transpilePathB(args[0], dims);
      if (TRANSCENDENTAL.has(fn)) return transcendentalStub(fn, transpilePathB(args[0], dims));
      throw new FormulaDimensionError(`unsupported function '${fn}'`);
    }
  }
}

// --- the shared checker ---------------------------------------------------

/** The result of a formula dimensional check. */
export interface FormulaDimensionResult {
  /** True iff the formula is dimensionally homogeneous and well-formed. */
  readonly ok: boolean;
  /** The inferred dimension when `ok`. */
  readonly dim?: Dimension;
  /** Human-readable reason when `!ok`. */
  readonly error?: string;
}

/** A bound checker: `check(expr, dims)`. */
export interface FormulaDimensionChecker {
  check(expr: string, dims: Readonly<Record<string, Dimension>>): FormulaDimensionResult;
}

/** Build a checker from an `(expr, dims) → ExprNode` transpile (parse +
 *  transpile, which may throw a parse error or `FormulaDimensionError`). */
export function createFormulaDimensionChecker(
  toExprNode: (expr: string, dims: Readonly<Record<string, Dimension>>) => ExprNode,
): FormulaDimensionChecker {
  return {
    check(expr, dims) {
      let exprNode: ExprNode;
      try {
        exprNode = toExprNode(expr, dims);
      } catch (e) {
        if (e instanceof FormulaDimensionError) return { ok: false, error: e.message };
        return { ok: false, error: `parse error: ${e instanceof Error ? e.message : String(e)}` };
      }
      const r = validate(exprNode);
      if (!r.ok || r.inferredDimension === null) {
        return { ok: false, error: r.violations[0]?.note ?? 'not dimensionally homogeneous' };
      }
      return { ok: true, dim: r.inferredDimension };
    },
  };
}

/** The built-in (Path B) dimensional checker — always available, no peer. */
export function builtinFormulaDimensionChecker(): FormulaDimensionChecker {
  return createFormulaDimensionChecker((expr, dims) => transpilePathB(parseFormulaToAst(expr), dims));
}

interface MathtsFunctionsModule {
  parse(expr: string): MathNode;
}

/**
 * Dynamically load the optional MathTS peer and build a dimensional checker
 * over its AST. Throws if the peer is absent — the registry catches and
 * falls back to {@link builtinFormulaDimensionChecker}.
 */
export async function loadFormulaDimensionChecker(): Promise<FormulaDimensionChecker> {
  const mod = (await import(
    '@danielsimonjr/mathts-functions'
  )) as unknown as MathtsFunctionsModule;
  if (typeof mod.parse !== 'function') {
    throw new FormulaDimensionError('mathts-functions: no parse() export');
  }
  return createFormulaDimensionChecker((expr, dims) => transpileMathts(mod.parse(expr), dims));
}
