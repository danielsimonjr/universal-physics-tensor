/**
 * Behavioural snapshot of `composeEdges` over every ORDERED pair of a graph.
 *
 * Shared by the golden-file generator (run once, BEFORE the Atlas Sprint-1
 * `relation` guard landed) and by `compose-relation.test.ts`, which re-runs it
 * AFTER the guard and deep-equals the result against the committed golden.
 * Two callers of one function is the point: a drift in the serializer changes
 * both sides, so the comparison can only fail on a change in `composeEdges`.
 *
 * The snapshot records BEHAVIOUR, not just shape — each composable pair is
 * probed through `domain.predicate` and `evaluate` at a fixed input point, so a
 * change that preserved the composed edge's fields while altering its numbers
 * would still fail.
 *
 * Not a `.test.ts` file: it contains no tests and must not be collected.
 *
 * @module tests/composition/compose-relation.snapshot
 */

import type { BridgeEdge } from '../../src/composition/edge.js';

/** Deterministic probe point: every source quantity bound to 1. @internal */
function probeInputs(edge: BridgeEdge): Record<string, number> {
  const inputs: Record<string, number> = {};
  for (const s of edge.sources) inputs[s.name] = 1;
  return inputs;
}

/** `String(x)` for a number, but stable for NaN/±Infinity. @internal */
function probe(fn: () => unknown): string {
  try {
    return `ok:${String(fn())}`;
  } catch (e) {
    return `throw:${(e as Error).name}`;
  }
}

/** One ordered pair's outcome. @internal */
export type PairSnapshot =
  | { readonly pair: string; readonly outcome: 'error'; readonly error: string; readonly message: string }
  | {
      readonly pair: string;
      readonly outcome: 'composed';
      readonly id: string;
      readonly beId: number | null;
      readonly kind: string;
      readonly label: string;
      readonly sources: readonly string[];
      readonly target: string;
      readonly confidence: string;
      readonly domainDescription: string;
      readonly citation: string;
      readonly identificationUsed: string | null;
      readonly aliasDispositionsUsed: readonly string[];
      readonly extraKeys: readonly string[];
      readonly predicateAtOnes: string;
      readonly evaluateAtOnes: string;
    };

/**
 * Compose every ordered pair of `edges` and serialize the outcome.
 *
 * `compose` is injected rather than imported so the generator and the test can
 * both pass the live `composeEdges` without this module importing it.
 *
 * @internal
 */
export function snapshotAllPairs(
  edges: readonly BridgeEdge[],
  compose: (a: BridgeEdge, b: BridgeEdge) => BridgeEdge,
): readonly PairSnapshot[] {
  const out: PairSnapshot[] = [];
  for (const first of edges) {
    for (const second of edges) {
      const pair = `${first.id}>>${second.id}`;
      let composed: BridgeEdge;
      try {
        composed = compose(first, second);
      } catch (e) {
        out.push({
          pair,
          outcome: 'error',
          error: (e as Error).name,
          message: (e as Error).message,
        });
        continue;
      }
      const inputs = probeInputs(composed);
      out.push({
        pair,
        outcome: 'composed',
        id: composed.id,
        beId: composed.beId,
        kind: composed.kind,
        label: composed.label,
        sources: composed.sources.map((s) => `${s.name}:${s.symbol}:${JSON.stringify(s.dim)}`),
        target: `${composed.target.name}:${composed.target.symbol}`,
        confidence: composed.confidence,
        domainDescription: composed.domain.description,
        citation: composed.citation,
        identificationUsed: composed.identificationUsed
          ? `${composed.identificationUsed.from}->${composed.identificationUsed.to}`
          : null,
        aliasDispositionsUsed: (composed.aliasDispositionsUsed ?? []).map(
          (d) => `${d.name}:${JSON.stringify(d.treatAs)}`,
        ),
        // Every own key of the composed object, so a NEW field (e.g. an
        // unconditionally-set `relation`) fails the comparison rather than
        // slipping past a hand-listed field set.
        extraKeys: Object.keys(composed).sort(),
        predicateAtOnes: probe(() => composed.domain.predicate(inputs)),
        evaluateAtOnes: probe(() => composed.evaluate(inputs)),
      });
    }
  }
  return out;
}
