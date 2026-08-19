/**
 * Search-budget accounting for Product B. Product A (`rankDiscoveries`) is
 * already finite and must not grow AST-depth caps.
 *
 * @module composition/probe/search-budget
 */

import type { SearchBudget, SearchStopReason } from './types.js';
import { DEFAULT_SEARCH_BUDGET } from './types.js';

export { DEFAULT_SEARCH_BUDGET };

/** Mutable counters for one run. @internal */
export interface BudgetState {
  readonly budget: SearchBudget;
  readonly startedAtMs: number;
  candidates: number;
  evaluations: number;
}

/** Open a budget clock. @internal */
export function openBudget(budget: SearchBudget = DEFAULT_SEARCH_BUDGET): BudgetState {
  return {
    budget,
    startedAtMs: Date.now(),
    candidates: 0,
    evaluations: 0,
  };
}

/**
 * First violated stop reason, or `undefined` if the search may continue.
 * @internal
 */
export function budgetStopReason(state: BudgetState): SearchStopReason | undefined {
  const { budget } = state;
  if (state.candidates >= budget.maxCandidates) return 'candidate-limit';
  if (state.evaluations >= budget.maxEvaluations) return 'evaluation-limit';
  if (Date.now() - state.startedAtMs >= budget.maxWallClockMs) return 'time-limit';
  return undefined;
}

/** True when another candidate may be emitted. @internal */
export function canEmitCandidate(state: BudgetState): boolean {
  return budgetStopReason(state) === undefined;
}
