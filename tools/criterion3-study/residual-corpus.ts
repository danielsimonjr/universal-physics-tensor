/**
 * Criterion 3, EXPLORATORY (pre-registration Amendment 9): the frozen corpus in residual form.
 *
 * The frozen `corpus.json` stores each canonical entry's right-hand side (`scalarAst`). The corrected
 * structural condition compares claims with `target − scalarAst` (`canonicalResidual`). The target is
 * not in the frozen corpus, so it comes from the canonical registry. Each record is first checked
 * against the registry, and the conversion refuses to proceed if the frozen expression differs from
 * the registry's `scalarAst`, because the targets would then come from a different registry.
 */

import type { CorpusRecord } from '../../src/atlas/benchmark/baselines.js';
import type { CanonicalEquation } from '../../src/canonical/canonical-equation.js';
import { canonicalResidual } from '../../src/canonical/residual.js';

/**
 * The corpus with each record's expression replaced by its residual `target − scalarAst`. A record
 * with no expression is unchanged.
 *
 * @throws Error when a record with an expression has no registry entry, or when the frozen expression
 * is not the registry's `scalarAst`.
 */
export function residualCorpus(
  records: readonly CorpusRecord[],
  registry: ReadonlyMap<string, CanonicalEquation>,
): CorpusRecord[] {
  return records.map((r) => {
    if (r.expr === undefined) return r;
    const e = registry.get(r.id);
    if (!e) throw new Error(`corpus record ${r.id} has no registry entry`);
    if (JSON.stringify(e.scalarAst) !== JSON.stringify(r.expr)) {
      throw new Error(`corpus record ${r.id}: the frozen expression is not the registry's scalarAst`);
    }
    return { id: r.id, text: r.text, expr: canonicalResidual(e)! };
  });
}
