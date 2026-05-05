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
        if (node.args.length !== 2) {
          ctx.violations.push({
            location: ctx.path,
            expected: DIMENSIONLESS,
            actual: DIMENSIONLESS,
            note: `^ requires exactly 2 args (base, exponent), got ${node.args.length}`,
          });
          return null;
        }
        const [baseNode, expNode] = node.args;
        const baseDim = infer(baseNode, { ...ctx, path: joinPath(ctx.path, 'args[0]') });
        if (baseDim === null) return null;
        if (!expNode || expNode.kind !== 'symbol') {
          // Try to recover the exponent expression's inferred dim so the
          // violation is informative (expected ≠ actual). If inference itself
          // fails, fall back to DIMENSIONLESS — but the note still carries
          // the structural reason, so a downstream consumer keying on
          // `equals(expected,actual)` will still see the mismatch in the
          // generic case.
          let actualDim: Dimension = DIMENSIONLESS;
          if (expNode) {
            // Use a throwaway local violation channel so a deeper
            // inference error doesn't double-report — we only want the
            // dim if it can be inferred cleanly.
            const probeCtx: InferContext = { path: joinPath(ctx.path, 'args[1]'), violations: [] };
            const probed = infer(expNode, probeCtx);
            if (probed !== null && probed !== undefined && probeCtx.violations.length === 0) {
              actualDim = probed;
            }
          }
          ctx.violations.push({
            location: joinPath(ctx.path, 'args[1]'),
            expected: DIMENSIONLESS,
            actual: actualDim,
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
      // Guard against malformed nodes loaded from JSON / hand-built test
      // fixtures that omit `integrand` or `over` (TypeScript requires them
      // but `as unknown as ExprNode` casts can bypass the check).
      if (!node.integrand || !node.over) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: DIMENSIONLESS,
          note: `integral requires both 'integrand' and 'over' fields`,
        });
        return null;
      }
      const fDim = infer(node.integrand, { ...ctx, path: joinPath(ctx.path, 'integrand') });
      const xDim = infer(node.over,      { ...ctx, path: joinPath(ctx.path, 'over') });
      if (fDim === null || xDim === null) return null;
      return multiply(fDim, xDim);
    }

    case 'derivative': {
      // d f / d x — result has dim(f) / dim(x).
      // Same shape guard as `integral` above.
      if (!node.of || !node.wrt) {
        ctx.violations.push({
          location: ctx.path,
          expected: DIMENSIONLESS,
          actual: DIMENSIONLESS,
          note: `derivative requires both 'of' and 'wrt' fields`,
        });
        return null;
      }
      const fDim = infer(node.of,  { ...ctx, path: joinPath(ctx.path, 'of') });
      const xDim = infer(node.wrt, { ...ctx, path: joinPath(ctx.path, 'wrt') });
      if (fDim === null || xDim === null) return null;
      return divide(fDim, xDim);
    }

    default: {
      // Exhaustiveness guard: if a future ExprNode arm is added but not
      // handled here, this branch records a shape violation rather than
      // silently returning `undefined` (which validate() would coerce to
      // `ok: true, inferredDimension: undefined` — see silent-failure F1).
      const _exhaustive: never = node;
      void _exhaustive;
      const kind = (node as { kind?: unknown })?.kind;
      ctx.violations.push({
        location: ctx.path,
        expected: DIMENSIONLESS,
        actual: DIMENSIONLESS,
        note: `Validator: unknown ExprNode.kind ${JSON.stringify(kind)}`,
      });
      return null;
    }
  }
}

export function validate(expr: ExprNode): ValidationResult {
  const ctx: InferContext = { path: '', violations: [] };
  const dim = infer(expr, ctx);
  return {
    ok: ctx.violations.length === 0 && dim !== null && dim !== undefined,
    inferredDimension: dim ?? null,
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
