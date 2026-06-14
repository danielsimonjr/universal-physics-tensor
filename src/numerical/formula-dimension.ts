/**
 * Formula dimensional check (MathTS Phase 2 — see
 * docs/planning/Formula-Dimensional-Check-Design-Note.md).
 *
 * Transpiles a MathTS formula AST (from the Path A parser) into UPT's own
 * dimensional `ExprNode` and runs `validate()`, so the CLI can report
 * whether a user's formula is dimensionally HOMOGENEOUS and what dimension
 * it has — unifying the string→AST (MathTS) and AST→dimension (UPT) halves.
 *
 * MathTS-only: the check needs the AST, which only the Path A parser
 * exposes; the registry returns `null` when MathTS is absent.
 *
 * @module numerical/formula-dimension
 */

import type { Dimension } from '../dimensional/types.js';
import { DIMENSIONLESS } from '../dimensional/types.js';
import { equals, format } from '../dimensional/algebra.js';
import type { ExprNode } from '../dimensional/validator.js';
import { validate } from '../dimensional/validator.js';

/** A formula cannot be dimensionally analyzed (undeclared symbol, variable
 *  exponent, transcendental of a dimensional argument, unsupported node). */
export class FormulaDimensionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FormulaDimensionError';
  }
}

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

/** Dimensionless math constants MathTS recognizes. */
const MATH_CONSTANTS = new Set(['pi', 'tau', 'e', 'phi', 'Infinity', 'NaN']);

/** Transcendental functions: dimensionless argument → dimensionless result. */
const TRANSCENDENTAL = new Set([
  'exp', 'log', 'ln', 'log10', 'log2',
  'sin', 'cos', 'tan', 'asin', 'acos', 'atan',
  'sinh', 'cosh', 'tanh', 'sec', 'csc', 'cot',
]);

const sym = (name: string, dim: Dimension): ExprNode => ({ kind: 'symbol', name, dim });
const op = (o: '+' | '-' | '*' | '/' | '^', args: ExprNode[]): ExprNode => ({ kind: 'op', op: o, args });

/** Evaluate a (presumed constant) exponent subtree; throw if it has free
 *  variables or is non-finite. */
function constantExponent(node: MathNode): number {
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

/** Transpile a MathTS node into a UPT dimensional `ExprNode`. */
function transpile(node: MathNode, dims: Readonly<Record<string, Dimension>>): ExprNode {
  switch (node.type) {
    case 'ConstantNode':
      return sym(String(node.value), DIMENSIONLESS);

    case 'SymbolNode': {
      const name = node.name!;
      if (name in dims) return sym(name, dims[name]);
      if (MATH_CONSTANTS.has(name)) return sym(name, DIMENSIONLESS);
      throw new FormulaDimensionError(
        `undeclared symbol '${name}' — declare its dimension (e.g. ${name}:length)`,
      );
    }

    case 'ParenthesisNode':
      return transpile(node.content!, dims);

    case 'OperatorNode': {
      const args = node.args ?? [];
      if (node.op === '-' && args.length === 1) {
        return transpile(args[0], dims); // unary minus: dimension-neutral
      }
      if (node.op === '^') {
        const base = transpile(args[0], dims);
        const exp = constantExponent(args[1]);
        return op('^', [base, sym(String(exp), DIMENSIONLESS)]);
      }
      if (node.op === '+' || node.op === '-' || node.op === '*' || node.op === '/') {
        return op(node.op, args.map((a) => transpile(a, dims)));
      }
      throw new FormulaDimensionError(`unsupported operator '${node.op}'`);
    }

    case 'FunctionNode': {
      const fn = node.fn?.name ?? node.name ?? '';
      const args = node.args ?? [];
      if (fn === 'sqrt') return op('^', [transpile(args[0], dims), sym('0.5', DIMENSIONLESS)]);
      if (fn === 'cbrt') return op('^', [transpile(args[0], dims), sym(String(1 / 3), DIMENSIONLESS)]);
      if (fn === 'pow') {
        return op('^', [transpile(args[0], dims), sym(String(constantExponent(args[1])), DIMENSIONLESS)]);
      }
      if (fn === 'abs') return transpile(args[0], dims); // dimension-preserving
      if (TRANSCENDENTAL.has(fn)) {
        const argDim = dimensionOf(transpile(args[0], dims));
        if (!equals(argDim, DIMENSIONLESS)) {
          throw new FormulaDimensionError(
            `${fn}() requires a dimensionless argument, got ${format(argDim)}`,
          );
        }
        return sym(`${fn}(...)`, DIMENSIONLESS); // typed stub
      }
      throw new FormulaDimensionError(`unsupported function '${fn}'`);
    }

    default:
      throw new FormulaDimensionError(`unsupported node '${node.type}'`);
  }
}

/** Inferred dimension of an `ExprNode`, or throw if it is not homogeneous. */
function dimensionOf(node: ExprNode): Dimension {
  const r = validate(node);
  if (!r.ok || r.inferredDimension === null) {
    throw new FormulaDimensionError(
      r.violations[0]?.note ?? 'expression is not dimensionally consistent',
    );
  }
  return r.inferredDimension;
}

/** The result of a formula dimensional check. */
export interface FormulaDimensionResult {
  /** True iff the formula is dimensionally homogeneous and well-formed. */
  readonly ok: boolean;
  /** The inferred dimension when `ok`. */
  readonly dim?: Dimension;
  /** Human-readable reason when `!ok`. */
  readonly error?: string;
}

/** A bound checker: `check(expr, dims)` over a MathTS parse function. */
export interface FormulaDimensionChecker {
  check(expr: string, dims: Readonly<Record<string, Dimension>>): FormulaDimensionResult;
}

/** Build a checker from a MathTS `parse` function. */
export function createFormulaDimensionChecker(
  parse: (expr: string) => MathNode,
): FormulaDimensionChecker {
  return {
    check(expr, dims) {
      let node: MathNode;
      try {
        node = parse(expr);
      } catch (e) {
        return { ok: false, error: `parse error: ${e instanceof Error ? e.message : String(e)}` };
      }
      let exprNode: ExprNode;
      try {
        exprNode = transpile(node, dims);
      } catch (e) {
        if (e instanceof FormulaDimensionError) return { ok: false, error: e.message };
        throw e;
      }
      const r = validate(exprNode);
      if (!r.ok || r.inferredDimension === null) {
        return {
          ok: false,
          error: r.violations[0]?.note ?? 'not dimensionally homogeneous',
        };
      }
      return { ok: true, dim: r.inferredDimension };
    },
  };
}

interface MathtsFunctionsModule {
  parse(expr: string): MathNode;
}

/**
 * Dynamically load the optional MathTS peer and build a dimensional
 * checker. Throws if the peer is absent — the registry catches and
 * returns `null` (Path B has no AST, so the check is unavailable).
 */
export async function loadFormulaDimensionChecker(): Promise<FormulaDimensionChecker> {
  const mod = (await import(
    '@danielsimonjr/mathts-functions'
  )) as unknown as MathtsFunctionsModule;
  if (typeof mod.parse !== 'function') {
    throw new FormulaDimensionError('mathts-functions: no parse() export');
  }
  return createFormulaDimensionChecker((e) => mod.parse(e));
}
