/**
 * Atlas Phase 3 — `Statement`, `Context`, and the CHECKED context union.
 *
 * A `Statement` is a claim IN A CONTEXT, not a string. Design note
 * `docs/planning/Atlas-Phase-3-Design.md` §1: two statements that render
 * identically can be claims about different things when their gauge, frame or
 * assumption set differs, and the poster index will place exactly such pairs
 * next to each other. `context` is therefore the reason this type exists at
 * all rather than reusing `CanonicalEquation`.
 *
 * ## `ast?` is optional ON PURPOSE
 *
 * The poster's hidden supporting nodes — the action principle, Noether, the
 * full Maxwell set, the Lorentz group, the central limit theorem — are
 * valuable because they are NAMED and LINKED, not because they are evaluable.
 * Requiring an `ast` would force either a fabricated encoding or their
 * exclusion, and both are worse than an honest `sourceExpression` with no
 * `ast` (design note §1). Do not make it required.
 *
 * ## The union is CHECKED, never computed
 *
 * {@link contextUnion} does not MERGE contexts. It asks whether a union
 * EXISTS, and returns an explicit refusal when it does not. Two refusals
 * matter, and neither is an error condition:
 *
 * 1. **Convention conflict** — delegated to `checkConventions`, whose contract
 *    is that `undefined` means UNKNOWN and is never a mismatch. An absent
 *    declaration must not read as agreement, so the asymmetry is preserved
 *    here rather than re-derived.
 * 2. **Contradictory assumptions** — Blueprint v2 §5.2 step 2: incompatible
 *    assumptions are NEVER POOLED. A derivation whose premises assume mutually
 *    exclusive conditions has no context union, therefore no composite.
 *
 * The result is a DISCRIMINATED UNION, mirroring `boundPath`'s no-claim
 * (`./path-bound.ts`): a caller cannot read `.context` off a refusal, because
 * a refusal has no `.context`. That is the whole point — the refusal is
 * enforced by the type, so no caller can read a conclusion off a union that
 * was never formed.
 *
 * Pure: no I/O, no registry reads.
 *
 * @module atlas/statement
 */

import { checkConventions } from './conventions.js';
import type { ConventionKey } from './conventions.js';
import type { Conventions } from './types.js';
import type { ModelId } from './model.js';
import type { ExprNode } from '../dimensional/ast-types.js';

/** A {@link Statement} id — `'statement-noether'`, … . @internal */
export type StatementId = string;

/**
 * The context a claim is made in: what it quantifies over, which choices it
 * fixes, and what it assumes.
 *
 * Every field but `assumptions` and `excludes` is optional, and the SAME
 * asymmetry `checkConventions` documents applies to each: a context that
 * declares no `gauge` has not chosen the Lorenz gauge, it has not said.
 * Absence is unknown, never disagreement.
 *
 * `assumptions` and `excludes` are required (possibly empty) because they are
 * the pair that decides poolability, and an optional one would let a caller
 * omit the field that makes a refusal possible.
 *
 * @internal
 */
export interface Context {
  /** Canonical quantity types the claim ranges over — `['energy', 'time']`. */
  readonly quantityTypes?: readonly string[];
  /** `'Lorenz'`, `'Coulomb'` — a fixed gauge choice, when the claim depends on one. */
  readonly gauge?: string;
  /** `'comoving'`, `'lab'` — a fixed frame choice, when the claim depends on one. */
  readonly frame?: string;
  /** Sign and unit choices. Compared by `checkConventions`. */
  readonly conventions?: Conventions;
  /** Stated assumptions — `'isolated system'`, `'weak field'`. */
  readonly assumptions: readonly string[];
  /**
   * Assumption strings this context is INCOMPATIBLE with.
   *
   * Declared per context rather than inferred, because no rule in this repo
   * can decide that `'weak field'` and `'strong field'` exclude each other
   * from the strings alone. A guess here would manufacture refusals out of
   * vocabulary rather than physics.
   *
   * Matching is exact string equality against another context's
   * `assumptions`, and it is SYMMETRIC in effect: it is enough for one side
   * to declare the exclusion.
   */
  readonly excludes: readonly string[];
}

/**
 * A claim in a context.
 *
 * @internal
 */
export interface Statement {
  /** `'statement-noether'`, `'statement-l1-maxwell'`, … */
  readonly id: StatementId;
  /** The load-bearing field — see the module note. */
  readonly context: Context;
  readonly model: ModelId;
  /** OPTIONAL BY DESIGN — see the module note. Absent ⇒ named-and-linked only. */
  readonly ast?: ExprNode;
  /** `'dS = 0'` — the source form, always present even when `ast` is not. */
  readonly sourceExpression: string;
  /** Rendered form for the poster index. */
  readonly display: string;
}

/** Why a set of contexts has NO union. @internal */
export type NoUnionReason =
  /** Two contexts DECLARE different values for a convention key. */
  | 'convention-conflict'
  /** One context excludes an assumption another one states. */
  | 'contradictory-assumptions'
  /** Two contexts DECLARE different gauges or frames. */
  | 'choice-conflict';

/** The contexts DO pool, and this is the pooled context. @internal */
export interface ContextUnionFormed {
  readonly kind: 'union';
  readonly context: Context;
}

/** The contexts do NOT pool, and this is why. @internal */
export interface ContextUnionRefused {
  readonly kind: 'no-union';
  readonly reason: NoUnionReason;
  /** Human-readable specifics: which key, which assumption. */
  readonly detail: string;
}

/**
 * The result of {@link contextUnion}: a pooled context, or an explicit refusal.
 *
 * @internal
 */
export type ContextUnionResult = ContextUnionFormed | ContextUnionRefused;

/** Distinct declared values of one optional choice field, across contexts. */
function declaredChoices(
  contexts: readonly Context[],
  key: 'gauge' | 'frame',
): readonly string[] {
  const seen = new Set<string>();
  for (const c of contexts) {
    const v = c[key];
    if (v !== undefined) seen.add(v);
  }
  return [...seen];
}

/**
 * The union of `contexts`, or an explicit refusal.
 *
 * Three gates, in this order; the FIRST refusal found is the one reported.
 *
 * 1. **Conventions.** Every PAIR is compared with `checkConventions`. Pairwise
 *    rather than folded, because folding would compare each context against a
 *    running merge and a merge has already lost which side declared what —
 *    the exact information the `undefined`-is-unknown rule needs.
 * 2. **Assumptions.** A context's `excludes` entry matching any context's
 *    stated `assumption` refuses the pool. Blueprint v2 §5.2 step 2.
 * 3. **Gauge / frame.** Two DECLARED and different values refuse; one declared
 *    and one absent does not, mirroring gate 1's asymmetry.
 *
 * An empty list has no union: a union over nothing would be a context
 * asserted about no claim, the same reason `boundPath` throws on an empty
 * path. It is a `RangeError`, not a refusal, because it is a caller bug rather
 * than a physical incompatibility.
 *
 * @throws RangeError when `contexts` is empty.
 * @internal
 */
export function contextUnion(contexts: readonly Context[]): ContextUnionResult {
  if (contexts.length === 0) {
    throw new RangeError('contextUnion: no contexts; a union over nothing states nothing');
  }

  // ── Gate 1: no DECLARED convention pair may disagree ──────────────────────
  for (let i = 0; i < contexts.length; i++) {
    for (let j = i + 1; j < contexts.length; j++) {
      const clash: readonly ConventionKey[] = checkConventions(
        contexts[i]!.conventions,
        contexts[j]!.conventions,
      );
      if (clash.length > 0) {
        return {
          kind: 'no-union',
          reason: 'convention-conflict',
          detail:
            `contexts ${i} and ${j} declare different values for ` +
            `${clash.map((k) => `'${k}'`).join(', ')}; they do not pool`,
        };
      }
    }
  }

  // ── Gate 2: incompatible assumptions are NEVER pooled ─────────────────────
  const stated = new Map<string, number>();
  for (let i = 0; i < contexts.length; i++) {
    for (const a of contexts[i]!.assumptions) {
      if (!stated.has(a)) stated.set(a, i);
    }
  }
  for (let i = 0; i < contexts.length; i++) {
    for (const x of contexts[i]!.excludes) {
      const at = stated.get(x);
      if (at !== undefined) {
        return {
          kind: 'no-union',
          reason: 'contradictory-assumptions',
          detail:
            `context ${i} excludes '${x}', which context ${at} assumes; ` +
            'incompatible assumptions are never pooled',
        };
      }
    }
  }

  // ── Gate 3: a declared gauge or frame may not be contradicted ─────────────
  for (const key of ['gauge', 'frame'] as const) {
    const values = declaredChoices(contexts, key);
    if (values.length > 1) {
      return {
        kind: 'no-union',
        reason: 'choice-conflict',
        detail:
          `the contexts declare ${values.length} different ${key}s ` +
          `(${values.map((v) => `'${v}'`).join(', ')}); they do not pool`,
      };
    }
  }

  // ── The pool ──────────────────────────────────────────────────────────────
  // Conventions merge by KEY rather than by object, so a context silent on a
  // key inherits another's declaration instead of erasing it. Gate 1 has
  // already proved no two declarations disagree, so the order of assignment
  // cannot change the result.
  const conventions: Record<string, unknown> = {};
  for (const c of contexts) {
    for (const [k, v] of Object.entries(c.conventions ?? {})) {
      if (v !== undefined) conventions[k] = v;
    }
  }
  const quantityTypes = [...new Set(contexts.flatMap((c) => c.quantityTypes ?? []))];
  const gauge = declaredChoices(contexts, 'gauge')[0];
  const frame = declaredChoices(contexts, 'frame')[0];

  return {
    kind: 'union',
    context: {
      ...(quantityTypes.length > 0 ? { quantityTypes } : {}),
      ...(gauge !== undefined ? { gauge } : {}),
      ...(frame !== undefined ? { frame } : {}),
      ...(Object.keys(conventions).length > 0
        ? { conventions: conventions as Conventions }
        : {}),
      assumptions: [...stated.keys()],
      excludes: [...new Set(contexts.flatMap((c) => c.excludes))],
    },
  };
}

/**
 * The context union of a set of STATEMENTS, by id, resolved through `registry`.
 *
 * @throws RangeError if an id does not resolve. An unresolved id silently
 *   dropped would narrow the union and could turn a refusal into a pool —
 *   precisely the direction that manufactures a false claim.
 * @internal
 */
export function statementContextUnion(
  ids: readonly StatementId[],
  registry: ReadonlyMap<StatementId, Statement>,
): ContextUnionResult {
  const contexts: Context[] = [];
  for (const id of ids) {
    const s = registry.get(id);
    if (s === undefined) {
      throw new RangeError(`statementContextUnion: unknown statement '${id}'`);
    }
    contexts.push(s.context);
  }
  return contextUnion(contexts);
}
