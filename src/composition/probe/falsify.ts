/**
 * Falsification batteries for probe candidates.
 *
 * Persist counterexamples. Failed limits are fatal only when the candidate
 * claims that domain (see limits.ts). Catalog retrodiction is Product A and
 * is not treated as a candidate-level verdict.
 *
 * @internal
 */

import type { ExprNode } from '../../dimensional/ast-types.js';
import { validate } from '../../dimensional/validator.js';
import { evalExpr } from '../expr-eval.js';
import { checkDeclaredLimits, type LimitCheckResult } from './limits.js';
import type {
  DeclaredLimit,
  FalsificationBattery,
  FalsificationRecord,
  ProbeDataset,
} from './types.js';

export interface FalsifyInput {
  readonly expr: ExprNode;
  readonly dataset?: ProbeDataset;
  readonly prefactor?: number;
  readonly claimedRegimes?: Readonly<Record<string, string>>;
  readonly limits?: readonly DeclaredLimit[];
  readonly observationalBoundIds?: readonly string[];
  readonly skipDimensional?: boolean;
}

export interface FalsifyResult {
  readonly records: readonly FalsificationRecord[];
  readonly survived: boolean;
  readonly counterexamples: readonly Readonly<Record<string, number>>[];
}

function dimBattery(expr: ExprNode): FalsificationRecord {
  const v = validate(expr);
  if (!v.ok || v.inferredDimension === null) {
    return {
      battery: 'dimensional',
      outcome: 'fail',
      detail: 'expression is dimensionally inconsistent',
    };
  }
  return {
    battery: 'dimensional',
    outcome: 'pass',
    detail: 'expression is dimensionally consistent',
  };
}

function finitenessBattery(
  expr: ExprNode,
  dataset: ProbeDataset | undefined,
  prefactor: number,
): { record: FalsificationRecord; counterexamples: Record<string, number>[] } {
  if (!dataset || dataset.rows.length === 0) {
    return {
      record: {
        battery: 'finiteness',
        outcome: 'pass',
        detail: 'no rows to evaluate',
      },
      counterexamples: [],
    };
  }
  const counterexamples: Record<string, number>[] = [];
  for (const row of dataset.rows) {
    let y: number;
    try {
      y = prefactor * evalExpr(expr, row);
    } catch {
      counterexamples.push({ ...row });
      continue;
    }
    if (!Number.isFinite(y)) counterexamples.push({ ...row });
  }
  if (counterexamples.length > 0) {
    return {
      record: {
        battery: 'finiteness',
        outcome: 'fail',
        detail: `${counterexamples.length} observation(s) produced non-finite predictions`,
      },
      counterexamples,
    };
  }
  return {
    record: {
      battery: 'finiteness',
      outcome: 'pass',
      detail: 'all predictions finite',
    },
    counterexamples: [],
  };
}

function limitsBattery(checks: readonly LimitCheckResult[]): FalsificationRecord {
  const fatal = checks.filter((c) => c.fatal);
  if (fatal.length > 0) {
    return {
      battery: 'limits',
      outcome: 'fail',
      detail: fatal.map((c) => c.detail).join('; '),
    };
  }
  const failedNonFatal = checks.filter((c) => !c.passed && !c.fatal);
  if (failedNonFatal.length > 0) {
    return {
      battery: 'limits',
      outcome: 'inconclusive',
      detail: failedNonFatal.map((c) => c.detail).join('; '),
    };
  }
  return {
    battery: 'limits',
    outcome: 'pass',
    detail:
      checks.length === 0
        ? 'no declared limits'
        : 'declared limits held or were out of claimed domain',
  };
}

function retrodictionBattery(): FalsificationRecord {
  return {
    battery: 'retrodiction',
    outcome: 'inconclusive',
    detail:
      'catalog retrodiction is Product A (needs a composition graph + ground truth) — not a probe-candidate verdict',
  };
}

function observationalBoundsBattery(
  ids: readonly string[] | undefined,
): FalsificationRecord {
  if (!ids || ids.length === 0) {
    return {
      battery: 'observational-bounds',
      outcome: 'pass',
      detail: 'no observational bound ids supplied',
    };
  }
  return {
    battery: 'observational-bounds',
    outcome: 'inconclusive',
    detail: `bound ids ${ids.join(', ')} recorded; candidate-level bound evaluation is data-specific`,
  };
}

/** Run the Product B falsification batteries. @internal */
export function runFalsification(input: FalsifyInput): FalsifyResult {
  const prefactor = input.prefactor ?? 1;
  const records: FalsificationRecord[] = [];
  const counterexamples: Record<string, number>[] = [];

  if (!input.skipDimensional) {
    records.push(dimBattery(input.expr));
  }

  const fin = finitenessBattery(input.expr, input.dataset, prefactor);
  records.push(fin.record);
  counterexamples.push(...fin.counterexamples);

  const limitChecks = checkDeclaredLimits(
    input.expr,
    input.dataset,
    prefactor,
    input.limits ?? [],
    input.claimedRegimes ?? {},
  );
  records.push(limitsBattery(limitChecks));

  records.push(retrodictionBattery());
  records.push(observationalBoundsBattery(input.observationalBoundIds));

  const survived = records.every((r) => r.outcome !== 'fail');
  return { records, survived, counterexamples };
}

export const DEFAULT_BATTERIES: readonly FalsificationBattery[] = [
  'dimensional',
  'finiteness',
  'limits',
  'retrodiction',
  'observational-bounds',
];
