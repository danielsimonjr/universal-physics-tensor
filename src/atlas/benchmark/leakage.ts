/**
 * Atlas Phase 5, S5.1 — leakage checks for the invalid-bridge benchmark.
 *
 * Design note: `docs/planning/Atlas-Phase-5-Design.md` §3.
 *
 * ## Why not `normalForm` directly
 *
 * The plan said renamed-variable variants "are detected as the same item by
 * normal form". `normalForm` keys symbols by NAME, so `x/t` and `y/s` do not
 * collide (measured). {@link leakageKey} therefore renames every DIMENSIONED
 * symbol to its dimension signature first. That over-merges genuinely different
 * quantities of one dimension, which is the SAFE direction for leakage: a false
 * collision is flagged and reviewed, a missed one contaminates the study.
 *
 * @module atlas/benchmark/leakage
 * @internal
 */

import { normalForm } from '../../canonical/normal-form.js';
import type { ExprNode } from '../../dimensional/ast-types.js';
import type { Dimension } from '../../dimensional/types.js';
import type { BenchmarkItem } from './types.js';

const isDimensionless = (d: Dimension): boolean =>
  d.L === 0 && d.M === 0 && d.T === 0 && d.I === 0 && d.Theta === 0 && d.N === 0 && d.J === 0;

const dimensionName = (d: Dimension): string =>
  `dim[${d.L},${d.M},${d.T},${d.I},${d.Theta},${d.N},${d.J}]`;

/**
 * Rename every dimensioned symbol leaf to its dimension signature. Dimensionless
 * leaves keep their names: `normalForm` already drops recognised constants and
 * tags unknown dimensionless stubs, and a numeric literal must stay a literal.
 */
function renameByDimension(node: ExprNode): ExprNode {
  if (node.kind === 'symbol') {
    return isDimensionless(node.dim) ? node : { ...node, name: dimensionName(node.dim) };
  }
  if (node.kind === 'op') return { ...node, args: node.args.map(renameByDimension) };
  if (node.kind === 'transcendental' || node.kind === 'abs') {
    return { ...node, arg: renameByDimension(node.arg) };
  }
  // Other arms (integral, derivative, tensor nodes) are compared as normalForm
  // compares them — structurally, names included. Stated, not hidden: a renamed
  // variant INSIDE an integral is not caught by this key.
  return node;
}

/**
 * The key under which two items count as the same claim: the normal form of the
 * expression after renaming dimensioned symbols by dimension.
 *
 * @internal
 */
export function leakageKey(expr: ExprNode): string {
  return normalForm(renameByDimension(expr));
}

/** A pair of items that share a leakage key. @internal */
export interface LeakageCollision {
  readonly key: string;
  readonly ids: readonly string[];
  /** The splits the colliding items sit in. More than one ⇒ LEAKAGE. */
  readonly splits: readonly string[];
}

/**
 * Group items by leakage key and report every group whose members span MORE THAN
 * ONE split. Such a group means the held-out split contains a claim the
 * in-distribution split already shows, under the same or different names.
 *
 * @internal
 */
export function findCrossSplitLeakage(items: readonly BenchmarkItem[]): LeakageCollision[] {
  const groups = new Map<string, BenchmarkItem[]>();
  for (const item of items) {
    const key = leakageKey(item.expr);
    const bucket = groups.get(key);
    if (bucket === undefined) groups.set(key, [item]);
    else bucket.push(item);
  }
  const out: LeakageCollision[] = [];
  for (const [key, bucket] of groups) {
    const splits = [...new Set(bucket.map((i) => i.split))].sort();
    if (splits.length > 1) out.push({ key, ids: bucket.map((i) => i.id), splits });
  }
  return out;
}

/** A renamed-variable variant that violates the same-split or same-key rule. @internal */
export interface VariantProblem {
  readonly id: string;
  readonly of: string;
  readonly problem: 'missing-original' | 'different-split' | 'not-same-claim';
}

/**
 * Check every `renamedVariant` link: the original exists, sits in the SAME split,
 * and genuinely has the same leakage key (a "variant" that is a different claim
 * is mislabelled, and the label would hide a real item).
 *
 * @internal
 */
export function checkRenamedVariants(items: readonly BenchmarkItem[]): VariantProblem[] {
  const byId = new Map(items.map((i) => [i.id, i]));
  const out: VariantProblem[] = [];
  for (const item of items) {
    if (item.renamedVariant === undefined) continue;
    const original = byId.get(item.renamedVariant);
    if (original === undefined) {
      out.push({ id: item.id, of: item.renamedVariant, problem: 'missing-original' });
    } else if (original.split !== item.split) {
      out.push({ id: item.id, of: item.renamedVariant, problem: 'different-split' });
    } else if (leakageKey(original.expr) !== leakageKey(item.expr)) {
      out.push({ id: item.id, of: item.renamedVariant, problem: 'not-same-claim' });
    }
  }
  return out;
}
