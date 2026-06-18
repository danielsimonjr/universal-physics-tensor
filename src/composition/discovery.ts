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
import { REPRESENTATIVE_VALUES } from './representative-values.js';
import type { RepresentativeValue } from './representative-values.js';

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
   * Orders of magnitude between the representative values of a and b
   * (`|log10|va| − log10|vb||`), or `null` when either has no representative
   * value (the gate abstained — see `magnitudeChecked`).
   */
  readonly ordersApart: number | null;
  /** Both endpoints had a representative value, so the magnitude gate ran. */
  readonly magnitudeChecked: boolean;
  /**
   * - `magnitude-clash` — representative values differ by more than the
   *                       threshold N orders (an independent falsification the
   *                       single-anchor graph cannot make). Checked first.
   * - `contradictory`   — breaks numerical consistency (a graph falsification).
   * - `promising`       — consistent AND connects disconnected physics AND
   *                       unlocks ≥1 quantity. Worth physicist review.
   * - `inert`           — consistent but structurally/numerically idle (a
   *                       dimensional coincidence with no consequence).
   */
  readonly verdict: 'promising' | 'inert' | 'contradictory' | 'magnitude-clash';
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
  /**
   * Max orders of magnitude two identified quantities may differ before the
   * identification is falsified as a `magnitude-clash`. Default 3 — generous
   * enough for O(1) dimensionless prefactors and unit-convention slack, strict
   * enough to kill the scale-clash decoys.
   */
  readonly maxOrdersOfMagnitude?: number;
  /**
   * Sourced order-of-magnitude values for the gate (default
   * `REPRESENTATIVE_VALUES`). Injectable for testing and so the future
   * canonical-equation registry can supply them centrally.
   */
  readonly representativeValues?: Readonly<Record<string, RepresentativeValue>>;
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
  const repVals = opts.representativeValues ?? REPRESENTATIVE_VALUES;
  const maxOrders = opts.maxOrdersOfMagnitude ?? 3;

  // Magnitude gate: an INDEPENDENT falsifier the single-anchor graph can't make.
  // Only fires when both endpoints have a representative value; abstains (and
  // never false-rejects) otherwise.
  const va = repVals[candidate.a];
  const vb = repVals[candidate.b];
  const magnitudeChecked = va !== undefined && vb !== undefined;
  const ordersApart = magnitudeChecked
    ? Math.abs(Math.log10(Math.abs(va.value)) - Math.log10(Math.abs(vb.value)))
    : null;
  const magnitudeClash = ordersApart !== null && ordersApart > maxOrders;

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

  // Verdict precedence: a magnitude clash is the most decisive, most
  // interpretable falsification, so it is checked before the graph contradiction.
  let verdict: VettedCandidate['verdict'];
  if (magnitudeClash) verdict = 'magnitude-clash';
  else if (!numericallyConsistent) verdict = 'contradictory';
  else if (mergesComponents && unlocksFromAnchor.length > 0) verdict = 'promising';
  else verdict = 'inert';

  // Score: both falsifications sink to the bottom; otherwise reward structural
  // merges, unlocks, and the proposer's weak priors.
  let score = 0;
  if (magnitudeClash || !numericallyConsistent) {
    score = -1;
  } else {
    score += mergesComponents ? 4 : 0;
    score += Math.min(unlocksFromAnchor.length, 4);
    score += candidate.touchesCore ? 1 : 0;
    score += candidate.sameKind ? 1 : 0;
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
    ordersApart,
    magnitudeChecked,
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
    'magnitude-clash': 2,
    contradictory: 3,
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
