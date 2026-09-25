/**
 * Compare a user's formula with the canonical (textbook) equation it restates.
 *
 * Dimensional analysis cannot see a dimensionless prefactor, so `T = π√(ℓ/g)`
 * and `K = m v²` pass every dimensional check. When the registry holds an
 * equation with the same target and the same variables, this module evaluates
 * both sides at {@link FIXED_POINT_EXPONENTS}, fixed points documented here, and
 * classifies the ratio `yours / canonical`:
 *
 * - `agrees`  — constant and equal to 1: the prefactor is checked and right.
 * - `factor`  — constant but not 1: the forms agree and the prefactor does not.
 * - `form`    — not constant across the points: a different law.
 * - `prefactor-unchecked` — the forms agree, but the registry records the law
 *   only up to a constant or only dimensionally, so it holds no prefactor to
 *   compare with. That is reported as unchecked, never as agreement.
 * - `not-compared` — the variables could not be aligned, or an evaluation
 *   failed; `detail` says which.
 *
 * The points are fixed so the output is identical on every run.
 *
 * INTERNAL — surfaced by `upt map --equation` and `upt derive --formula`.
 *
 * @module composition/canonical-compare
 */

import type { ExprNode } from '../dimensional/validator.js';
import type { Dimension } from '../dimensional/types.js';
import { equals } from '../dimensional/algebra.js';
import { CANONICAL_EQUATIONS } from '../canonical/registry.js';
import type { CanonicalEquation } from '../canonical/canonical-equation.js';
import { CONSTANTS } from './symbolic-constants.js';
import { evalExpr } from './expr-eval.js';
import { parseUserEquation, resolveToCatalogName } from './user-equation.js';
import { parsePhysics } from '../numerical/formula-registry.js';
import { DIMENSIONLESS } from '../dimensional/types.js';

/**
 * The comparison points: variable `i` (in sorted name order) takes the value
 * `(1.7 + i)^p` at point `p` of this list, the scheme `upt derive` uses to
 * recover a prefactor. Each variable has its own base, so the RATIOS between
 * variables change from point to point too. A common scale factor would leave
 * every ratio such as ℓ/g fixed, and `T ∝ ℓ/g` would then pass as the form of
 * `T ∝ √(ℓ/g)`.
 * @internal
 */
const FIXED_POINT_EXPONENTS: readonly number[] = [1, 1.3, 1.6];

/** Relative tolerance for "the ratio is constant" and "the ratio is 1". @internal */
const RATIO_TOLERANCE = 1e-9;

/** How a user formula compares with one canonical equation. @internal */
export interface CanonicalComparison {
  readonly id: string;
  readonly name: string;
  readonly kind: 'agrees' | 'factor' | 'form' | 'prefactor-unchecked' | 'not-compared';
  /** `yours / canonical`, present only for `agrees` and `factor`. */
  readonly ratio?: number;
  /** Why the prefactor is unchecked, or why no comparison was made. */
  readonly detail?: string;
}

const normalize = (name: string): string => name.replace(/_/g, '-');

/** A governing variable that is a registered physical constant of the same dimension. */
function isConstant(v: { name: string; dim: Dimension }): boolean {
  const c = CONSTANTS[v.name];
  return c !== undefined && equals(c.dim, v.dim);
}

/** The free (non-constant, non-literal) symbols of an AST, with their dimensions. */
function freeSymbols(node: ExprNode, out: Map<string, Dimension>): Map<string, Dimension> {
  if (node.kind === 'symbol') {
    const literal = Number.isFinite(Number(node.name));
    if (!literal && CONSTANTS[node.name] === undefined) out.set(node.name, node.dim);
    return out;
  }
  const args = (node as { args?: readonly ExprNode[] }).args ?? [];
  for (const a of args) freeSymbols(a, out);
  return out;
}

/**
 * Map each free AST symbol to a governing variable: by name first, then by a
 * dimension that exactly one unassigned variable carries. `null` when that fails.
 */
function alignSymbols(
  symbols: ReadonlyMap<string, Dimension>,
  governing: readonly { name: string; dim: Dimension }[],
): Map<string, string> | null {
  if (symbols.size !== governing.length) return null;
  const assignment = new Map<string, string>();
  const free = new Set(governing.map((g) => g.name));
  for (const s of [...symbols.keys()].sort()) {
    if (free.has(s)) {
      assignment.set(s, s);
      free.delete(s);
    }
  }
  for (const [s, dim] of [...symbols.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (assignment.has(s)) continue;
    const candidates = governing.filter((g) => free.has(g.name) && equals(g.dim, dim));
    if (candidates.length !== 1) return null;
    assignment.set(s, candidates[0]!.name);
    free.delete(candidates[0]!.name);
  }
  return assignment;
}

function classify(
  entry: CanonicalEquation,
  ratios: readonly number[],
  recordsPrefactor: boolean,
): CanonicalComparison {
  const base = { id: entry.id, name: entry.name };
  const r0 = ratios[0]!;
  const constant = ratios.every((r) => Math.abs(r / r0 - 1) <= RATIO_TOLERANCE);
  if (!constant) return { ...base, kind: 'form' };
  if (!recordsPrefactor) {
    return {
      ...base,
      kind: 'prefactor-unchecked',
      detail:
        entry.epistemicStatus === 'dimensional'
          ? 'the registry records its dimensional form only'
          : 'the registry records it only up to a constant',
    };
  }
  return Math.abs(r0 - 1) <= RATIO_TOLERANCE
    ? { ...base, kind: 'agrees', ratio: r0 }
    : { ...base, kind: 'factor', ratio: r0 };
}

/**
 * Compare a user formula with every canonical equation that has the same
 * target and the same non-constant variables (names match after `_` → `-`).
 * `evaluateUser` receives values keyed by the CANONICAL variable names.
 * Returns one comparison per matching entry, in registry order; empty when
 * no entry matches.
 *
 * @internal
 */
export function compareWithCanonical(
  target: string,
  sources: readonly string[],
  evaluateUser: (values: Readonly<Record<string, number>>) => number,
  entries: readonly CanonicalEquation[] = CANONICAL_EQUATIONS,
): CanonicalComparison[] {
  const wantTarget = normalize(target);
  const wantSources = [...new Set(sources.map(normalize))].sort();
  const results: CanonicalComparison[] = [];

  for (const entry of entries) {
    const d = entry.dimensional;
    if (normalize(d.target.name) !== wantTarget) continue;
    const variables = d.governing.filter((g) => !isConstant(g));
    const names = variables.map((g) => normalize(g.name)).sort();
    if (names.length !== wantSources.length || names.some((n, i) => n !== wantSources[i])) continue;

    const points = FIXED_POINT_EXPONENTS.map((p) =>
      Object.fromEntries(names.map((n, i) => [n, Math.pow(1.7 + i, p)])),
    );

    let canonicalAt: (p: Readonly<Record<string, number>>) => number;
    if (entry.scalarAst !== undefined) {
      const alignment = alignSymbols(freeSymbols(entry.scalarAst, new Map()), variables);
      if (alignment === null) {
        results.push({
          id: entry.id,
          name: entry.name,
          kind: 'not-compared',
          detail: 'its variables could not be aligned by name or by a unique dimension',
        });
        continue;
      }
      const ast = entry.scalarAst;
      canonicalAt = (p) =>
        evalExpr(ast, Object.fromEntries([...alignment].map(([sym, g]) => [sym, p[normalize(g)]!])));
    } else if (d.monomial !== null) {
      const monomial = d.monomial;
      canonicalAt = (p) =>
        Object.entries(monomial).reduce((acc, [n, e]) => acc * Math.pow(p[normalize(n)] ?? 1, e), 1);
    } else {
      continue;
    }

    let ratios: number[];
    try {
      ratios = points.map((p) => evaluateUser(p) / canonicalAt(p));
    } catch (e) {
      results.push({
        id: entry.id,
        name: entry.name,
        kind: 'not-compared',
        detail: `an evaluation failed (${e instanceof Error ? e.message : String(e)})`,
      });
      continue;
    }
    if (!ratios.every((r) => Number.isFinite(r) && r !== 0)) {
      results.push({ id: entry.id, name: entry.name, kind: 'not-compared', detail: 'a ratio was zero or not finite' });
      continue;
    }
    results.push(classify(entry, ratios, entry.epistemicStatus === 'fully-quantitative'));
  }
  return results;
}

/**
 * Compare a `TARGET = EXPR` user equation (the `upt map --equation` input) with
 * the canonical registry. Names resolve onto `catalogDims` the way
 * `analyzeUserEquation` resolves them; `pi` and `tau` are the only named numbers.
 * Returns `[]` when the equation does not parse or no entry matches.
 *
 * @internal
 */
export async function compareUserEquation(
  equation: string,
  catalogDims: ReadonlyMap<string, Dimension>,
): Promise<CanonicalComparison[]> {
  const eq = await parseUserEquation(equation);
  const catalogNames = new Set(catalogDims.keys());
  const resolved = new Map(eq.sources.map((s) => [s, resolveToCatalogName(s, catalogNames) ?? s]));
  const target = resolveToCatalogName(eq.target, catalogNames) ?? eq.target;
  const dims: Record<string, Dimension> = {};
  for (const [name, c] of Object.entries(CONSTANTS)) dims[name] = c.dim;
  for (const [s, r] of resolved) dims[s] = catalogDims.get(r) ?? DIMENSIONLESS;
  let expr: ExprNode;
  try {
    expr = (await parsePhysics(equation.slice(equation.indexOf('=') + 1), dims)).expr;
  } catch {
    return [];
  }
  return compareWithCanonical(target, [...resolved.values()], (values) =>
    evalExpr(expr, {
      pi: Math.PI,
      tau: 2 * Math.PI,
      ...Object.fromEntries([...resolved].map(([s, r]) => [s, values[normalize(r)]!])),
    }),
  );
}

/**
 * The report lines for a comparison result, shared by `upt map --equation` and
 * `upt derive`. An empty result is itself a line: a dimensional MATCH never
 * checks a prefactor, and the reader must not take silence for a check.
 * @internal
 */
export function describeComparisons(cs: readonly CanonicalComparison[]): string[] {
  return cs.length === 0
    ? ['· no canonical equation has this target and these variables, so the prefactor is NOT checked']
    : cs.map(describeComparison);
}

/** One report line per comparison. @internal */
export function describeComparison(c: CanonicalComparison): string {
  const who = `${c.id} (${c.name})`;
  const n = FIXED_POINT_EXPONENTS.length;
  switch (c.kind) {
    case 'agrees':
      return `✓ agrees with ${who}, prefactor included: yours/canonical = 1 at ${n} fixed points`;
    case 'factor':
      return `⚠ differs from ${who} by a constant factor: yours/canonical = ${c.ratio!.toPrecision(6)} at ${n} fixed points`;
    case 'form':
      return `⚠ differs in FORM from ${who}: yours/canonical is not constant across ${n} fixed points`;
    case 'prefactor-unchecked':
      return `· same form as ${who}, but ${c.detail}, so your prefactor is NOT checked`;
    case 'not-compared':
      return `· ${who} shares your target and variables, but was not compared: ${c.detail}`;
  }
}
