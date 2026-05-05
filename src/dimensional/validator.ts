/**
 * Validator: walks an ExprNode tree and infers / checks SI dimensions.
 *
 * Honest-claude scope notes:
 *   - This MVP does NOT track tensor index structure (rank, contractions).
 *     Bridge Eq 17's index-rank mismatch from the spec cannot be caught here.
 *     Tier 4.5 follow-up — see README.
 *   - Special functions (log, exp, trig) are out of scope; their arguments
 *     must be dimensionless but the validator does not yet enforce that.
 *
 * @module dimensional/validator
 */

import {
  Dimension,
  DIMENSIONLESS,
} from './types.js';
import {
  multiply,
  divide,
  power,
  add,
  subtract,
  equals,
  format,
  DimensionMismatchError,
} from './algebra.js';

export type ExprNode =
  | { kind: 'symbol'; name: string; dim: Dimension }
  | { kind: 'op'; op: '+' | '-' | '*' | '/' | '^'; args: ExprNode[] }
  | { kind: 'integral'; over: ExprNode; integrand: ExprNode }
  | { kind: 'derivative'; of: ExprNode; wrt: ExprNode };

export interface Violation {
  /** Tree path, e.g. "args[1].args[0]". Empty string for the root. */
  location: string;
  expected: Dimension;
  actual: Dimension;
  note: string;
}

export interface ValidationResult {
  ok: boolean;
  inferredDimension: Dimension | null;
  violations: Violation[];
}

interface InferContext {
  path: string;
  violations: Violation[];
}

function joinPath(path: string, segment: string): string {
  return path === '' ? segment : `${path}.${segment}`;
}

/**
 * Recursive dimension inference. On any sub-expression error we record a
 * violation, return `null`, and let parent ops propagate the null up.
 */
function infer(node: ExprNode, ctx: InferContext): Dimension | null {
  switch (node.kind) {
    case 'symbol':
      return node.dim;

    case 'op': {
      if (node.op === '^') {
        // a^n — base is an arbitrary expression; exponent must be a numeric symbol
        // (we read its `name` as a number). Non-numeric exponents would require
        // the base to be dimensionless; we don't support that yet.
        const [baseNode, expNode] = node.args;
        const baseDim = infer(baseNode, { ...ctx, path: joinPath(ctx.path, 'args[0]') });
        if (baseDim === null) return null;
        if (!expNode || expNode.kind !== 'symbol') {
          ctx.violations.push({
            location: joinPath(ctx.path, 'args[1]'),
            expected: DIMENSIONLESS,
            actual: DIMENSIONLESS,
            note: '^ exponent must be a numeric literal symbol in this MVP',
          });
          return null;
        }
        const n = Number(expNode.name);
        if (!Number.isFinite(n)) {
          ctx.violations.push({
            location: joinPath(ctx.path, 'args[1]'),
            expected: DIMENSIONLESS,
            actual: expNode.dim,
            note: `^ exponent "${expNode.name}" is not a finite number`,
          });
          return null;
        }
        return power(baseDim, n);
      }

      if (node.op === '*' || node.op === '/') {
        if (node.args.length === 0) return DIMENSIONLESS;
        let acc: Dimension | null = null;
        for (let i = 0; i < node.args.length; i++) {
          const childDim = infer(node.args[i], {
            ...ctx,
            path: joinPath(ctx.path, `args[${i}]`),
          });
          if (childDim === null) return null;
          if (i === 0) acc = childDim;
          else if (node.op === '*') acc = multiply(acc!, childDim);
          else acc = divide(acc!, childDim);
        }
        return acc;
      }

      // '+' or '-' — all operands must share a common dimension.
      if (node.args.length === 0) return DIMENSIONLESS;
      let acc: Dimension | null = null;
      for (let i = 0; i < node.args.length; i++) {
        const childDim = infer(node.args[i], {
          ...ctx,
          path: joinPath(ctx.path, `args[${i}]`),
        });
        if (childDim === null) return null;
        if (i === 0) {
          acc = childDim;
        } else {
          try {
            acc = node.op === '+' ? add(acc!, childDim) : subtract(acc!, childDim);
          } catch (err) {
            if (err instanceof DimensionMismatchError) {
              ctx.violations.push({
                location: joinPath(ctx.path, `args[${i}]`),
                expected: acc!,
                actual: childDim,
                note: `Cannot ${node.op === '+' ? 'add' : 'subtract'} ${format(childDim)} with running ${format(acc!)} (dimension mismatch).`,
              });
              return null;
            }
            throw err;
          }
        }
      }
      return acc;
    }

    case 'integral': {
      // ∫ f dx — result has dim(f) * dim(x).
      const fDim = infer(node.integrand, { ...ctx, path: joinPath(ctx.path, 'integrand') });
      const xDim = infer(node.over,      { ...ctx, path: joinPath(ctx.path, 'over') });
      if (fDim === null || xDim === null) return null;
      return multiply(fDim, xDim);
    }

    case 'derivative': {
      // d f / d x — result has dim(f) / dim(x).
      const fDim = infer(node.of,  { ...ctx, path: joinPath(ctx.path, 'of') });
      const xDim = infer(node.wrt, { ...ctx, path: joinPath(ctx.path, 'wrt') });
      if (fDim === null || xDim === null) return null;
      return divide(fDim, xDim);
    }
  }
}

export function validate(expr: ExprNode): ValidationResult {
  const ctx: InferContext = { path: '', violations: [] };
  const dim = infer(expr, ctx);
  return {
    ok: ctx.violations.length === 0 && dim !== null,
    inferredDimension: dim,
    violations: ctx.violations,
  };
}

export function validateEquation(lhs: ExprNode, rhs: ExprNode): ValidationResult {
  const lhsCtx: InferContext = { path: 'lhs', violations: [] };
  const rhsCtx: InferContext = { path: 'rhs', violations: [] };
  const lhsDim = infer(lhs, lhsCtx);
  const rhsDim = infer(rhs, rhsCtx);
  const violations = [...lhsCtx.violations, ...rhsCtx.violations];

  if (lhsDim !== null && rhsDim !== null && !equals(lhsDim, rhsDim)) {
    violations.push({
      location: '<equation>',
      expected: lhsDim,
      actual: rhsDim,
      note: `LHS has ${format(lhsDim)} but RHS has ${format(rhsDim)} — equation is not dimensionally homogeneous.`,
    });
  }

  return {
    ok: violations.length === 0 && lhsDim !== null && rhsDim !== null,
    inferredDimension: lhsDim, // by convention, LHS dimension is the canonical answer
    violations,
  };
}
