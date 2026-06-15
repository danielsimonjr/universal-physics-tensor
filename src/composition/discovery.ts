/**
 * Discovery loop — vet link candidates through the verification primitives
 * (Direction 2).
 *
 * `proposeLinkCandidates` surfaces cross-cluster quantity pairs that share a
 * dimension (132 → 36 → ~3) and hands the raw coincidences to a human. This
 * module closes the loop: it HYPOTHESIZES each candidate identification
 * `a ≡ b` and tests it with the machinery that already exists —
 *
 *   - mergesComponents      — does identifying a≡b connect two previously
 *                             disconnected parts of the graph? (structural
 *                             significance)
 *   - unlocksFromAnchor     — what becomes determinable from an anchor input
 *                             set WITH the identification that was not before?
 *                             (`forwardClosure`)
 *   - numericallyConsistent — does retrodiction over the graph stay
 *                             all-consistent once the identification is
 *                             added, or does it introduce a contradiction?
 *                             (`retrodict` — the STRONG filter)
 *
 * so the physicist adjudicates a handful of VETTED, provenance-traced
 * candidates instead of dimensional noise.
 *
 * ⚠ Still a REVIEW SURFACE, never automated discovery (Part-VI §XXVII-B). A
 * shared dimension is a weak prior; the weight is on the numeric and
 * structural signals, and the numeric check only exercises the part of the
 * graph reachable from the anchor. `promising` means "worth a physicist's
 * minute", not "true".
 *
 * INTERNAL — not on the public surface (mirrors bridge-analysis.ts);
 * surfaced via `upt discover`.
 *
 * @module composition/discovery
 */

import type { BridgeEdge } from './edge.js';
import type { QuantityIdentification } from './compose.js';
import { QUANTITY_IDENTIFICATIONS } from './compose.js';
import { forwardClosure } from './identifiability.js';
import { retrodict } from './retrodiction.js';
import { proposeLinkCandidates } from './bridge-analysis.js';
import type { LinkCandidate } from './bridge-analysis.js';
import { M_SUN_KG } from './edges/calibration.js';

/** A candidate after vetting against the inference suite. @hypothesis */
export interface VettedCandidate {
  readonly a: string;
  readonly b: string;
  /** Shared SI dimension (from the proposer). */
  readonly dim: string;
  /** One endpoint is in the anchored (established) cluster. */
  readonly touchesCore: boolean;
  /** The names share a word token (same physical KIND). */
  readonly sameKind: boolean;
  /**
   * Identifying a≡b merges two distinct connected components of the
   * quantity graph — it connects physics the catalog keeps separate.
   */
  readonly mergesComponents: boolean;
  /**
   * Quantities newly determinable from the anchor known-set once the
   * identification is added (structural unlock). Sorted.
   */
  readonly unlocksFromAnchor: readonly string[];
  /**
   * Retrodiction over the graph WITH the hypothesized identification stays
   * all-consistent (introduces no numerical contradiction in the
   * anchor-reachable subgraph). The strong filter.
   */
  readonly numericallyConsistent: boolean;
  /** Nodes that became inconsistent under the identification (the
   *  falsification, when `numericallyConsistent` is false). Sorted. */
  readonly inconsistentNodes: readonly string[];
  /**
   * - `contradictory` — breaks numerical consistency (a falsification).
   * - `promising`     — consistent AND connects disconnected physics AND
   *                     unlocks ≥1 quantity. Worth physicist review.
   * - `inert`         — consistent but structurally/numerically idle (a
   *                     dimensional coincidence with no consequence).
   */
  readonly verdict: 'promising' | 'inert' | 'contradictory';
  /** Composite ranking score (higher = more worth review). */
  readonly score: number;
}

/** Options for the discovery loop. @internal */
export interface DiscoveryOptions {
  /**
   * Numeric anchor for the consistency check (and the closure unlock).
   * Default `{ mass: M_sun }` — the pre-registered retrodiction anchor.
   */
  readonly groundTruth?: Readonly<Record<string, number>>;
  /** Extra identifications honored as the baseline (default registered). */
  readonly identifications?: readonly QuantityIdentification[];
}

/** Union-find over quantity names; merges each edge's endpoints and every
 *  identification's from↔to. Returns name → component-root. */
function quantityComponents(
  edges: readonly BridgeEdge[],
  idents: readonly QuantityIdentification[],
): Map<string, string> {
  const parent = new Map<string, string>();
  const find = (x: string): string => {
    if (!parent.has(x)) parent.set(x, x);
    let r = x;
    while (parent.get(r) !== r) r = parent.get(r)!;
    let cur = x;
    while (parent.get(cur) !== r) {
      const next = parent.get(cur)!;
      parent.set(cur, r);
      cur = next;
    }
    return r;
  };
  const union = (a: string, b: string) => {
    parent.set(find(a), find(b));
  };
  for (const e of edges) {
    const names = [...e.sources.map((s) => s.name), e.target.name];
    for (let i = 1; i < names.length; i++) union(names[0], names[i]);
  }
  for (const id of idents) union(id.from, id.to);
  const roots = new Map<string, string>();
  for (const name of parent.keys()) roots.set(name, find(name));
  return roots;
}

const ANCHOR_DEFAULT: Readonly<Record<string, number>> = { mass: M_SUN_KG };

/**
 * Vet one link candidate by hypothesizing the identification a≡b and
 * measuring its structural and numerical consequences. See module docs.
 *
 * @internal
 */
export function vetLinkCandidate(
  edges: readonly BridgeEdge[],
  candidate: LinkCandidate,
  opts: DiscoveryOptions = {},
): VettedCandidate {
  const baseIdents = opts.identifications ?? QUANTITY_IDENTIFICATIONS;
  const groundTruth = opts.groundTruth ?? ANCHOR_DEFAULT;
  const anchor = Object.keys(groundTruth);

  // The hypothesized identification, added in both directions so a≡b is a
  // full merge (identifications are directional in the engine).
  const rationale = `HYPOTHESIS (unadjudicated): ${candidate.a} ≡ ${candidate.b} — same dimension ${candidate.dim}`;
  const hypothesis: QuantityIdentification[] = [
    { from: candidate.a, to: candidate.b, rationale },
    { from: candidate.b, to: candidate.a, rationale },
  ];
  const withHyp = [...baseIdents, ...hypothesis];

  // Structural: does a≡b merge two components?
  const comps = quantityComponents(edges, baseIdents);
  const mergesComponents =
    comps.has(candidate.a) &&
    comps.has(candidate.b) &&
    comps.get(candidate.a) !== comps.get(candidate.b);

  // Closure unlock: forward closure from the anchor, with vs without.
  const closureBase = forwardClosure(edges, anchor, baseIdents);
  const closureHyp = forwardClosure(edges, anchor, withHyp);
  const unlocksFromAnchor = [...closureHyp]
    .filter((q) => !closureBase.has(q))
    .sort();

  // Numeric: retrodiction must stay all-consistent under the hypothesis.
  const report = retrodict(edges, groundTruth, { identifications: withHyp });
  const numericallyConsistent = report.allConsistent;
  const inconsistentNodes = report.results
    .filter((r) => r.outcome === 'inconsistent')
    .map((r) => r.target)
    .sort();

  let verdict: VettedCandidate['verdict'];
  if (!numericallyConsistent) verdict = 'contradictory';
  else if (mergesComponents && unlocksFromAnchor.length > 0) verdict = 'promising';
  else verdict = 'inert';

  // Score: contradictory sinks to the bottom; otherwise reward structural
  // merges, unlocks, and the proposer's weak priors.
  let score = 0;
  if (numericallyConsistent) {
    score += mergesComponents ? 4 : 0;
    score += Math.min(unlocksFromAnchor.length, 4);
    score += candidate.touchesCore ? 1 : 0;
    score += candidate.sameKind ? 1 : 0;
  } else {
    score = -1;
  }

  return {
    a: candidate.a,
    b: candidate.b,
    dim: candidate.dim,
    touchesCore: candidate.touchesCore,
    sameKind: candidate.sameKind,
    mergesComponents,
    unlocksFromAnchor,
    numericallyConsistent,
    inconsistentNodes,
    verdict,
    score,
  };
}

/**
 * Run the full discovery funnel: propose cross-cluster candidates, vet each
 * against the inference suite, and rank — `promising` first, then by score.
 * The output is the physicist's worklist (vetted, provenance-traced), not a
 * list of discoveries.
 *
 * @internal
 */
export function rankDiscoveries(
  edges: readonly BridgeEdge[],
  opts: DiscoveryOptions = {},
): VettedCandidate[] {
  const VERDICT_RANK: Record<VettedCandidate['verdict'], number> = {
    promising: 0,
    inert: 1,
    contradictory: 2,
  };
  const candidates = proposeLinkCandidates(edges);
  const vetted = candidates.map((c) => vetLinkCandidate(edges, c, opts));
  vetted.sort(
    (x, y) =>
      VERDICT_RANK[x.verdict] - VERDICT_RANK[y.verdict] ||
      y.score - x.score ||
      x.a.localeCompare(y.a) ||
      x.b.localeCompare(y.b),
  );
  return vetted;
}
