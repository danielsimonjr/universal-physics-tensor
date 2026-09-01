/**
 * Declared-limit checks for probe candidates.
 *
 * A failed limit is **not automatically fatal**. It is fatal only when the
 * candidate claims the domain in which the limit fails.
 *
 * @internal
 */

import type { ExprNode } from '../../dimensional/ast-types.js';
import type { DeclaredLimit, ProbeDataset } from './types.js';
import { evalExpr } from '../expr-eval.js';

export interface LimitCheckResult {
  readonly id: string;
  readonly passed: boolean;
  readonly claimedDomain: boolean;
  readonly fatal: boolean;
  readonly detail: string;
}

/**
 * Evaluate `prefactor · expr` RMSE on `dataset`. When the candidate does not
 * claim `limit.regime`, a failure is recorded but not fatal.
 *
 * @internal
 */
export function checkDeclaredLimit(
  expr: ExprNode,
  dataset: ProbeDataset,
  prefactor: number,
  limit: DeclaredLimit,
  claimsDomain: boolean,
): LimitCheckResult {
  if (dataset.rows.length === 0) {
    return {
      id: limit.id,
      passed: true,
      claimedDomain: claimsDomain,
      fatal: false,
      detail: `no observations for declared-limit ${limit.id}`,
    };
  }
  let sumSq = 0;
  let n = 0;
  for (const row of dataset.rows) {
    let predicted: number;
    try {
      predicted = prefactor * evalExpr(expr, row);
    } catch {
      continue;
    }
    const observed = row[dataset.observable];
    if (!Number.isFinite(predicted) || observed == null || !Number.isFinite(observed)) continue;
    const err = predicted - observed;
    sumSq += err * err;
    n += 1;
  }
  const rmse = n === 0 ? Number.POSITIVE_INFINITY : Math.sqrt(sumSq / n);
  const scale = Math.max(
    ...dataset.rows.map((r) => Math.abs(r[dataset.observable] ?? 0)),
    1e-12,
  );
  const passed = Number.isFinite(rmse) && rmse <= 0.5 * scale;
  const fatal = !passed && claimsDomain;
  return {
    id: limit.id,
    passed,
    claimedDomain: claimsDomain,
    fatal,
    detail: passed
      ? `limit ${limit.id} held (rmse=${rmse})`
      : `limit ${limit.id} failed (rmse=${rmse})${fatal ? ' — fatal because candidate claims this domain' : ' — not fatal (domain not claimed)'}`,
  };
}

/** Run every declared limit. @internal */
export function checkDeclaredLimits(
  expr: ExprNode,
  dataset: ProbeDataset | undefined,
  prefactor: number,
  limits: readonly DeclaredLimit[],
  claimedRegimes: Readonly<Record<string, string>> = {},
): readonly LimitCheckResult[] {
  const rows = dataset ?? {
    id: 'empty',
    role: 'falsification-only' as const,
    rows: [],
    observable: '',
    schemaVersion: '0',
  };
  return limits.map((limit) => {
    const claimsDomain = Object.entries(limit.regime).every(
      ([k, v]) => claimedRegimes[k] === v,
    );
    return checkDeclaredLimit(expr, rows, prefactor, limit, claimsDomain);
  });
}
