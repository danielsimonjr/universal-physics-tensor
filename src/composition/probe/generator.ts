/**
 * Native bounded grammar enumerator — dimensional monomials via Buckingham-π.
 * Deterministic visit order; seed-independent.
 *
 * @module composition/probe/generator
 */

import type { ExprNode } from '../../dimensional/ast-types.js';
import { DIMENSIONLESS } from '../../dimensional/types.js';
import { sym } from '../../dimensional/ast-builders.js';
import { dimensionallyDetermines } from '../../dimensional/buckingham.js';
import { validate } from '../../dimensional/validator.js';
import type { DimensionalVariableRef, SearchBudget, SearchProblem } from './types.js';
import { canEmitCandidate, type BudgetState } from './search-budget.js';

export interface RawCandidate {
  readonly expression: ExprNode;
  readonly monomial: Readonly<Record<string, number>> | null;
  readonly originNote: string;
}

/** Build `Π governing^exp` as an `ExprNode`. @internal */
export function monomialToExpr(
  monomial: Readonly<Record<string, number>>,
  vars: readonly DimensionalVariableRef[],
): ExprNode {
  const byName = new Map(vars.map((v) => [v.name, v.dim]));
  const factors: ExprNode[] = [];
  for (const name of Object.keys(monomial).sort()) {
    const exp = monomial[name];
    if (exp === 0) continue;
    const dim = byName.get(name);
    if (!dim) throw new RangeError(`monomialToExpr: unknown variable '${name}'`);
    const base = sym(name, dim);
    if (exp === 1) factors.push(base);
    else {
      factors.push({
        kind: 'op',
        op: '^',
        args: [base, sym(String(exp), DIMENSIONLESS)],
      });
    }
  }
  if (factors.length === 0) return sym('1', DIMENSIONLESS);
  if (factors.length === 1) return factors[0];
  return { kind: 'op', op: '*', args: factors };
}

function* extraPrefactors(base: ExprNode): Iterable<ExprNode> {
  yield base;
  // Registered `2pi` leaf (same normalForm as `base` — dimensionless constant).
  yield { kind: 'op', op: '*', args: [sym('2pi', DIMENSIONLESS), base] };
}

/**
 * Yield dimensionally valid monomials for `problem`, honouring the budget.
 * Invalid typed constructions are skipped (never evaluated).
 *
 * @internal
 */
export function* generateNative(
  problem: SearchProblem,
  state: BudgetState,
): Iterable<RawCandidate> {
  const det = dimensionallyDetermines(problem.target, problem.governing);
  if (!det.determined || !det.monomial) return;

  const expr = monomialToExpr(det.monomial, [problem.target, ...problem.governing]);
  const seen = new Set<string>();
  for (const candidate of extraPrefactors(expr)) {
    if (!canEmitCandidate(state)) return;
    if (validate(candidate).ok !== true) continue;
    // Depth / operator caps
    const depth = astDepth(candidate);
    const ops = opCount(candidate);
    if (depth > state.budget.maxAstDepth) continue;
    if (ops > state.budget.maxOperators) continue;
    const key = JSON.stringify(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    state.candidates += 1;
    yield {
      expression: candidate,
      monomial: det.monomial,
      originNote: det.reason,
    };
  }

  if (problem.baseline && problem.discrepancy) {
    yield* generateCorrections(problem, state, seen);
  }
}

function astDepth(node: ExprNode): number {
  if (node.kind === 'op') return 1 + Math.max(0, ...node.args.map(astDepth));
  if (node.kind === 'transcendental' || node.kind === 'abs') return 1 + astDepth(node.arg);
  return 1;
}

function opCount(node: ExprNode): number {
  if (node.kind === 'op') return 1 + node.args.reduce((n, a) => n + opCount(a), 0);
  return 0;
}

/**
 * Additive / relative corrections: search a monomial of the same dimension
 * as the observable to add to (or scale) the baseline.
 */
function* generateCorrections(
  problem: SearchProblem,
  state: BudgetState,
  seen: Set<string>,
): Iterable<RawCandidate> {
  const kind = problem.discrepancy!.kind;
  if (kind !== 'additive' && kind !== 'relative' && kind !== 'standardized') return;
  const det = dimensionallyDetermines(problem.target, problem.governing);
  if (!det.determined || !det.monomial) return;
  if (!canEmitCandidate(state)) return;
  const corr = monomialToExpr(det.monomial, [problem.target, ...problem.governing]);
  const baseline = problem.baseline!;
  const combined: ExprNode =
    kind === 'additive'
      ? { kind: 'op', op: '+', args: [baseline, corr] }
      : { kind: 'op', op: '*', args: [baseline, { kind: 'op', op: '+', args: [sym('1', DIMENSIONLESS), corr] }] };
  if (validate(combined).ok !== true) return;
  const key = JSON.stringify(combined);
  if (seen.has(key)) return;
  seen.add(key);
  state.candidates += 1;
  yield { expression: combined, monomial: det.monomial, originNote: `correction:${kind}` };
}

/** Expose budget type for callers. @internal */
export type { SearchBudget };
