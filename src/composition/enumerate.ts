/**
 * Phase-D novel-candidate enumeration (v0.10.0 T3 — Part-IX §6's
 * "novel candidate generated for physicist review").
 *
 * Enumerates every ordered pair of edges that `composeEdges` accepts
 * (junction by name or registered identification; exact dimension
 * functor; the same checks as hand-written compositions) and
 * partitions the results into REGISTERED (the pre-registered CT-*
 * compositions, by composed id) and NOVEL (everything else — the
 * candidates a physicist should look at).
 *
 * The enumerator PROPOSES; it never promotes. Per the Part-VI §XXVII-B
 * protocol, a novel candidate's only output path is human review —
 * `docs/research/v0.10.0-novel-candidates.md` is the review surface.
 *
 * @module composition/enumerate
 */

import type { BridgeEdge } from './edge.js';
import { composeEdges } from './compose.js';
import type { ComposeOptions } from './compose.js';

/** One successful pairwise composition found by the enumerator. @public */
export interface CompositionCandidate {
  readonly first: BridgeEdge;
  readonly second: BridgeEdge;
  /** The composed edge (carries demoted confidence, piped domain). */
  readonly edge: BridgeEdge;
  /** True when the composed id is NOT in the registered set. */
  readonly novel: boolean;
}

/** Enumeration report. @public */
export interface EnumerationReport {
  readonly all: ReadonlyArray<CompositionCandidate>;
  readonly registered: ReadonlyArray<CompositionCandidate>;
  readonly novel: ReadonlyArray<CompositionCandidate>;
}

/**
 * The pre-registered composed ids (the CT-* set at v0.10.0). CT-1b's
 * 3-edge chain appears pairwise as its two links.
 *
 * @public
 */
export const REGISTERED_COMPOSITION_IDS: ReadonlySet<string> = new Set([
  'be-42>>be-16', // CT-1
  'law-schwarzschild-radius>>be-42-via-rs', // CT-1b link 1
  'be-42-via-rs>>be-16', // CT-1b link 2
  'be-12>>be-11-zurek', // CT-3
]);

/**
 * Enumerate all valid ordered pairwise compositions over `edges`.
 *
 * @public
 */
export function enumerateCompositions(
  edges: ReadonlyArray<BridgeEdge>,
  opts: ComposeOptions & {
    readonly registeredIds?: ReadonlySet<string>;
  } = {},
): EnumerationReport {
  const registeredIds = opts.registeredIds ?? REGISTERED_COMPOSITION_IDS;
  const all: CompositionCandidate[] = [];

  for (const first of edges) {
    for (const second of edges) {
      if (first === second) continue;
      let edge: BridgeEdge;
      try {
        edge = composeEdges(first, second, opts);
      } catch {
        continue; // not composable — junction or dimension refusal
      }
      all.push({
        first,
        second,
        edge,
        novel: !registeredIds.has(edge.id),
      });
    }
  }

  return {
    all,
    registered: all.filter((c) => !c.novel),
    novel: all.filter((c) => c.novel),
  };
}
