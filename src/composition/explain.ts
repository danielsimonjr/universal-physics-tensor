/**
 * "Explain this quantity" — the unified entry point over the three
 * bridge-inference primitives (docs/planning/Bridge-Inference-Epistemics-
 * Note.md). Given a target quantity and a set of knowns (names, or
 * name→value), it composes:
 *
 *   1. the identifiability classifier — CAN the graph compute the target
 *      from the knowns, and via how many independent derivations?
 *   2. the retrodiction harness — when values are supplied, RECOVER the
 *      value via each derivation and (for over-determined targets) check
 *      they agree;
 *   3. the Buckingham-π enumerator — is the known set even DIMENSIONALLY
 *      sufficient to fix the target up to a constant, independent of the
 *      graph's encoded edges?
 *
 * The three answer complementary questions, so the explanation is richer
 * than any one alone: the graph may compute a target whose dimensional
 * closure relies on constants baked into the evaluator (e.g. r_s = 2GM/c²
 * — mass alone is not dimensionally sufficient), and the classifier +
 * Buckingham layer make that explicit together.
 *
 * @module composition/explain
 */

import type { BridgeEdge } from './edge.js';
import type { QuantityIdentification } from './compose.js';
import { QUANTITY_IDENTIFICATIONS } from './compose.js';
import type { IdentifiabilityResult } from './identifiability.js';
import { classifyIdentifiability } from './identifiability.js';
import type { RetrodictionResult } from './retrodiction.js';
import { retrodictNode } from './retrodiction.js';
import type { Dimension } from '../dimensional/types.js';
import type { DimensionalDeterminationResult } from '../dimensional/buckingham.js';
import { dimensionallyDetermines } from '../dimensional/buckingham.js';

/** One structural derivation of the target, with the recovered value when
 *  ground-truth values were supplied. @public */
export interface DerivationExplanation {
  readonly edge: string;
  readonly label: string;
  readonly sources: readonly string[];
  /** Value recovered via this derivation (only when values were given). */
  readonly value?: number;
}

/** Options for {@link explainQuantity}. @public */
export interface ExplainOptions {
  readonly identifications?: readonly QuantityIdentification[];
  /** Consistency tolerance forwarded to the retrodiction harness. */
  readonly tolerance?: number;
  /**
   * Dimensions for known names that are not graph quantities (e.g. raw
   * constants `G`, `c`, `hbar`) — lets the Buckingham layer test a known
   * set richer than the graph's nodes.
   */
  readonly extraDimensions?: Readonly<Record<string, Dimension>>;
}

/** The unified explanation of one quantity. @public */
export interface QuantityExplanation {
  readonly target: string;
  readonly known: readonly string[];
  /** Structural verdict (under/exactly/over-determined or given). */
  readonly identifiability: IdentifiabilityResult;
  /** One entry per independent derivation the classifier found. */
  readonly derivations: readonly DerivationExplanation[];
  /** Retrodiction result, present when ≥2 derivations fired on values. */
  readonly consistency?: RetrodictionResult;
  /** Agreed recovered value (consistent or single), when values supplied. */
  readonly recoveredValue?: number;
  /** Whether the KNOWN set dimensionally fixes the target (Buckingham-π);
   *  absent when the target has no resolvable dimension. */
  readonly dimensional?: DimensionalDeterminationResult;
  /** Upstream gaps for an under-determined target (from the classifier). */
  readonly blockingFrontier: readonly string[];
  /** Plain-language synthesis of the above. */
  readonly summary: string;
}

function buildDimMap(
  edges: readonly BridgeEdge[],
  extra?: Readonly<Record<string, Dimension>>,
): Map<string, Dimension> {
  const m = new Map<string, Dimension>();
  for (const e of edges) {
    for (const s of e.sources) if (!m.has(s.name)) m.set(s.name, s.dim);
    if (!m.has(e.target.name)) m.set(e.target.name, e.target.dim);
  }
  if (extra) for (const [k, v] of Object.entries(extra)) m.set(k, v);
  return m;
}

function formatMonomial(m: Readonly<Record<string, number>>): string {
  const parts = Object.entries(m)
    .filter(([, e]) => e !== 0)
    .map(([n, e]) => (e === 1 ? n : `${n}^${e}`));
  return parts.join('·') || '1';
}

function buildSummary(
  target: string,
  id: IdentifiabilityResult,
  derivations: readonly DerivationExplanation[],
  consistency: RetrodictionResult | undefined,
  recoveredValue: number | undefined,
  dimensional: DimensionalDeterminationResult | undefined,
  knownNames: readonly string[],
): string {
  const known = knownNames.length
    ? `{${knownNames.join(', ')}}`
    : '{} (no inputs)';
  const ids = derivations.map((d) => d.edge).join(', ');
  let s: string;

  switch (id.verdict) {
    case 'given':
      s = `'${target}' is a supplied input.`;
      if (derivations.length) {
        s += ` ${derivations.length} graph derivation(s) (${ids}) can cross-check it`;
        s += consistency
          ? consistency.outcome === 'consistent'
            ? `, and they are consistent (relative spread ${consistency.relativeSpread.toExponential(1)}).`
            : ` — and they are INCONSISTENT (relative spread ${consistency.relativeSpread.toExponential(1)}).`
          : '.';
      }
      break;
    case 'under-determined':
      s = `'${target}' cannot be determined from ${known}: the graph has no derivation path.`;
      if (id.blockingFrontier.length) {
        s += ` Knowing one of {${id.blockingFrontier.join(', ')}} would unblock it.`;
      }
      break;
    case 'exactly-determined':
      s = `'${target}' is determined from ${known} via ${derivations[0]?.edge} (${derivations[0]?.label}).`;
      if (recoveredValue !== undefined) {
        s += ` Recovered value: ${recoveredValue.toExponential(4)}.`;
      }
      break;
    case 'over-determined':
    default:
      s = `'${target}' is over-determined from ${known}: ${derivations.length} independent derivations (${ids}).`;
      if (consistency) {
        s +=
          consistency.outcome === 'consistent'
            ? ` They agree (relative spread ${consistency.relativeSpread.toExponential(1)}) — a passing consistency check.`
            : ` They DISAGREE (relative spread ${consistency.relativeSpread.toExponential(1)}) — a falsification.`;
      } else {
        s += ` The ${id.surplusConstraints} surplus derivation(s) are falsifiable consistency constraints (supply values to check them).`;
      }
      if (recoveredValue !== undefined) {
        s += ` Recovered value: ${recoveredValue.toExponential(4)}.`;
      }
      break;
  }

  if (dimensional?.determined && dimensional.monomial) {
    s += ` Dimensionally, ${known} fix it up to a dimensionless constant: ${target} ∝ ${formatMonomial(dimensional.monomial)}.`;
  } else if (dimensional && !dimensional.determined && knownNames.length) {
    s += ` Dimensionally, those inputs alone do not fix it — the encoded formula carries dimensionful constants.`;
  }
  return s;
}

/**
 * Explain a quantity: synthesize the identifiability verdict, the
 * recovered value + consistency (when values are supplied), and the
 * dimensional sufficiency of the known set into one report.
 *
 * `known` may be a list of names (structural + dimensional analysis only)
 * or a `name → value` map (adds value recovery and the over-determined
 * consistency check).
 *
 * @public
 */
export function explainQuantity(
  edges: readonly BridgeEdge[],
  target: string,
  known: readonly string[] | Readonly<Record<string, number>>,
  opts: ExplainOptions = {},
): QuantityExplanation {
  const identifications = opts.identifications ?? QUANTITY_IDENTIFICATIONS;
  const hasValues = !Array.isArray(known);
  const values = hasValues ? (known as Record<string, number>) : null;
  const knownNames = hasValues
    ? Object.keys(values!)
    : [...new Set(known as string[])];

  const identifiability = classifyIdentifiability(edges, knownNames, target, {
    identifications,
  });

  const byId = new Map(edges.map((e) => [e.id, e] as const));

  let consistency: RetrodictionResult | undefined;
  let recoveredValue: number | undefined;
  const valueByEdge = new Map<string, number>();
  if (values) {
    const references =
      target in values ? { [target]: values[target] } : undefined;
    const retro = retrodictNode(edges, values, target, {
      identifications,
      tolerance: opts.tolerance,
      references,
    });
    for (const p of retro.predictions) valueByEdge.set(p.edge, p.value);
    if (retro.predictions.length >= 2) consistency = retro;
    if (
      (retro.outcome === 'consistent' || retro.outcome === 'single') &&
      retro.predictions.length > 0
    ) {
      recoveredValue =
        retro.predictions.reduce((a, p) => a + p.value, 0) /
        retro.predictions.length;
    }
  }

  const derivations: DerivationExplanation[] = identifiability.derivations.map(
    (eid) => {
      const e = byId.get(eid);
      return {
        edge: eid,
        label: e?.label ?? eid,
        sources: e ? e.sources.map((s) => s.name) : [],
        ...(valueByEdge.has(eid) ? { value: valueByEdge.get(eid) } : {}),
      };
    },
  );

  // Dimensional sufficiency of the KNOWN set, independent of the graph.
  const dimMap = buildDimMap(edges, opts.extraDimensions);
  let dimensional: DimensionalDeterminationResult | undefined;
  const targetDim = dimMap.get(target);
  if (targetDim) {
    const governing = knownNames
      .filter((n) => n !== target && dimMap.has(n))
      .map((n) => ({ name: n, dim: dimMap.get(n)! }));
    dimensional = dimensionallyDetermines({ name: target, dim: targetDim }, governing);
  }

  const summary = buildSummary(
    target,
    identifiability,
    derivations,
    consistency,
    recoveredValue,
    dimensional,
    knownNames,
  );

  return {
    target,
    known: knownNames,
    identifiability,
    derivations,
    ...(consistency ? { consistency } : {}),
    ...(recoveredValue !== undefined ? { recoveredValue } : {}),
    ...(dimensional ? { dimensional } : {}),
    blockingFrontier: identifiability.blockingFrontier,
    summary,
  };
}
