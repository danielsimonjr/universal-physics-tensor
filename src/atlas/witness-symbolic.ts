/**
 * Atlas Phase 4, S4.2 — the symbolic witness runner.
 *
 * Design note: `docs/planning/Atlas-Phase-4-Design.md` §2.
 *
 * A symbolic witness claims `lhs = rhs`. The runner forms the DIFFERENCE and
 * asks the optional CAS peer to simplify it: a difference that collapses to a
 * literal zero is `'checked'`; one that collapses to a non-zero literal is
 * `'refuted'`; anything else is `'unresolved'` with the reason it could not
 * decide.
 *
 * ## The simplifier is INJECTED, and no test touches the registry
 *
 * `src/numerical/formula-registry.ts` caches its selection in module scope and
 * exposes no reset hook, so a test that registered a stub would leak it into
 * every later test in the same worker. {@link runSymbolicWitness} therefore
 * takes the simplifier as a PARAMETER, defaulting to `simplifyExpr`. Tests
 * pass a stub for the present path and `null` for the absent path; the
 * registry is never written. One test exercises the real peer under the
 * existing skip-when-absent pattern.
 *
 * `null` means "the peer is absent" and is a first-class argument value, not a
 * forgotten one. `simplifyExpr` itself CANNOT tell absence from "nothing to
 * simplify" — both return `simplified: false` — so when the argument is
 * OMITTED the runner asks `isSimplifierAvailable()` first and maps absence to
 * `null`. Without that step the default path would report a missing peer as
 * `'not-simplified'`, the wrong reason on the one path most callers take.
 *
 * Deviation from the plan's wording, recorded in the design note §2.1: the
 * plan names `getFormulaParser()` as the default. A parser cannot decide
 * `lhs − rhs = 0`; the capability needed is SIMPLIFICATION, which lives in
 * `expr-simplify.ts` (a different peer, `@danielsimonjr/mathts-functions`).
 *
 * @module atlas/witness-symbolic
 * @internal
 */

import type { ExprNode } from '../dimensional/ast-types.js';
import { isSimplifierAvailable, simplifyExpr } from '../composition/expr-simplify.js';
import type { WitnessRunResult } from './witness-result.js';

/**
 * The simplification capability this runner needs, as a function rather than
 * the whole module — so a stub is five lines and cannot accidentally depend on
 * anything else `expr-simplify.ts` exports.
 *
 * @internal
 */
export type SymbolicSimplifier = (
  expr: ExprNode,
) => Promise<{ readonly expr: ExprNode; readonly simplified: boolean }>;

/** What a symbolic witness asserts. @internal */
export interface SymbolicWitnessSpec {
  /** The `Witness.id` (`'W7b'`). */
  readonly id: string;
  readonly lhs: ExprNode;
  readonly rhs: ExprNode;
  /**
   * Wall-clock budget in milliseconds. Default 5000.
   *
   * ⚠ **This bounds how long the RUNNER WAITS, not how long the CAS works.**
   * The peer's `simplify` is synchronous inside its promise, so nothing here
   * can interrupt it; a timeout reports that no answer arrived in time and the
   * underlying work may still be running. Saying otherwise would be the
   * "a running process is not a working one" error in reverse.
   */
  readonly budgetMs?: number;
}

const DEFAULT_BUDGET_MS = 5000;

/** The numeric value of a literal leaf, or `null`. Same rule as `validator.ts`. */
function literalValue(node: ExprNode): number | null {
  if (node.kind !== 'symbol') return null;
  if (node.name.trim() === '') return null;
  const v = Number(node.name);
  return Number.isFinite(v) ? v : null;
}

/** A sentinel the timeout race resolves with; never confusable with a result. */
const TIMED_OUT = Symbol('timed-out');

/**
 * Run one symbolic witness.
 *
 * @param spec - the claim, as two ASTs whose difference should vanish.
 * @param simplifier - the CAS capability, or `null` when the optional peer is
 * absent. When omitted, resolves to `simplifyExpr` if the peer is available and
 * to `null` otherwise. Pass `null` EXPLICITLY to exercise the absent path.
 * @returns a result; **never throws**, because a thrown error forces callers
 * into a `catch` that cannot distinguish "did not run" from "failed".
 * @internal
 */
export async function runSymbolicWitness(
  spec: SymbolicWitnessSpec,
  simplifier?: SymbolicSimplifier | null,
): Promise<WitnessRunResult> {
  const started = Date.now();
  if (simplifier === undefined) {
    simplifier = (await isSimplifierAvailable()) ? simplifyExpr : null;
  }
  const base = { witnessId: spec.id, kind: 'symbolic' as const };
  const elapsed = (): number => Date.now() - started;

  if (simplifier === null) {
    return {
      ...base,
      status: 'unresolved',
      reason: 'peer-absent',
      detail:
        'The optional CAS peer is absent, so the claim was never examined. This is ' +
        'not evidence against it.',
      elapsedMs: elapsed(),
    };
  }

  const difference: ExprNode = { kind: 'op', op: '-', args: [spec.lhs, spec.rhs] };
  const budget = spec.budgetMs ?? DEFAULT_BUDGET_MS;

  let outcome: Awaited<ReturnType<SymbolicSimplifier>> | typeof TIMED_OUT;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    outcome = await Promise.race([
      simplifier(difference),
      new Promise<typeof TIMED_OUT>((resolve) => {
        timer = setTimeout(() => resolve(TIMED_OUT), budget);
      }),
    ]);
  } catch (err) {
    return {
      ...base,
      status: 'unresolved',
      reason: 'parse-error',
      detail:
        `The simplifier threw rather than answering: ${String(err)}. A throw is not a ` +
        'refutation.',
      elapsedMs: elapsed(),
    };
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }

  if (outcome === TIMED_OUT) {
    return {
      ...base,
      status: 'unresolved',
      reason: 'timeout',
      detail:
        `No answer arrived within ${budget} ms. The budget bounds the WAIT, not the ` +
        'CAS: the underlying simplification may still be running.',
      elapsedMs: elapsed(),
    };
  }

  const value = literalValue(outcome.expr);
  if (value === 0) {
    return {
      ...base,
      status: 'checked',
      detail: 'lhs − rhs simplified to literal 0.',
      elapsedMs: elapsed(),
    };
  }
  if (value !== null) {
    return {
      ...base,
      status: 'refuted',
      detail: `lhs − rhs simplified to the non-zero constant ${value}.`,
      elapsedMs: elapsed(),
    };
  }
  return {
    ...base,
    status: 'unresolved',
    reason: 'not-simplified',
    detail:
      'The difference did not reduce to a constant. The claim may still hold; this ' +
      'simplifier could not show it.',
    elapsedMs: elapsed(),
  };
}
