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
import { QUANTITY_IDENTIFICATIONS, effectiveAttributes } from './compose.js';
import type { RegimeAttributes } from './quantity.js';
import { forwardClosure } from './identifiability.js';
import { retrodict, forwardEvaluate } from './retrodiction.js';
import { proposeLinkCandidates } from './bridge-analysis.js';
import type { LinkCandidate } from './bridge-analysis.js';
import { M_SUN_KG } from './edges/calibration.js';
import { REPRESENTATIVE_VALUES } from './representative-values.js';
import type { RepresentativeValue } from './representative-values.js';
import * as REGISTRY_QUANTITIES from './quantities.js';
import { CANONICAL_EQUATIONS } from '../canonical/registry.js';
import { format } from '../dimensional/algebra.js';

// ── registry-only attribute lookup (D1 axis gate; Option-A resolution) ─────
// Built from the centralized `Quantity` nodes ONLY (never canonical
// per-equation stamps — audit adjudication F1). Names that aren't a
// registry node (most bare canonical-equation variables) are simply absent,
// so they always abstain — the canonical-only axis-clash=0 invariant holds
// by construction, not by a special case.
const REGISTRY_ATTRIBUTES_BY_NAME: ReadonlyMap<string, RegimeAttributes> = (() => {
  const m = new Map<string, RegimeAttributes>();
  for (const v of Object.values(REGISTRY_QUANTITIES)) {
    if (v && typeof v === 'object' && 'name' in v && 'attributes' in v) {
      const q = v as { name: string; attributes: RegimeAttributes };
      m.set(q.name, q.attributes);
    }
  }
  return m;
})();

/** The two axes the D1 identity gate falsifies on. Information is
 *  annotation-only this phase (deliberately excluded — see module docs). */
const GATE_AXES = ['scale', 'force'] as const;

// ── canonical-kind indexes (Sub-project C) ──────────────────────────────────
// Discovery quantity names and canonical variable names are different
// namespaces; the alignable axis is the DIMENSION. These are informational
// annotations on each candidate (no verdict/score effect): they give the
// physicist standard-physics context, not a hard filter (the registry is small).
const CANONICAL_KINDS_BY_DIM: ReadonlyMap<string, readonly string[]> = (() => {
  const m = new Map<string, Set<string>>();
  for (const ce of CANONICAL_EQUATIONS) {
    const key = format(ce.dimensional.target.dim);
    (m.get(key) ?? m.set(key, new Set()).get(key)!).add(ce.domain);
  }
  return new Map([...m].map(([k, v]) => [k, [...v].sort()]));
})();

const CANONICAL_QUANTITY_NAMES: ReadonlySet<string> = (() => {
  const s = new Set<string>();
  for (const ce of CANONICAL_EQUATIONS) {
    s.add(ce.dimensional.target.name);
    for (const g of ce.dimensional.governing) s.add(g.name);
  }
  return s;
})();

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
  /** The magnitude gate read at least one endpoint value from the graph at
   *  the anchor (no static table entry) rather than the sourced table. */
  readonly magnitudeUsedAnchor: boolean;
  /**
   * One endpoint name's hyphen-token set is a strict subset of the other's
   * (`mass` ⊂ `reference-mass`) — a generic↔specific identification of the
   * same KIND. Near-tautological (identifying a generic quantity with one of
   * its own specializations), so it is barred from `promising`.
   */
  readonly subsuming: boolean;
  /**
   * - `magnitude-clash` — representative values differ by more than the
   *                       threshold N orders (an independent falsification the
   *                       single-anchor graph cannot make). Checked first.
   * - `contradictory`   — breaks numerical consistency (a graph falsification).
   * - `axis-clash`      — the identification's stated `scale`/`force` regime
   *                       attributes disagree (an IDENTITY falsifier — see D1
   *                       module docs; "identification falsified, stated
   *                       regimes differ", not "no connection possible").
   * - `promising`       — consistent AND connects disconnected physics AND
   *                       unlocks ≥1 quantity. Worth physicist review.
   * - `inert`           — consistent but structurally/numerically idle (a
   *                       dimensional coincidence with no consequence).
   */
  readonly verdict: 'promising' | 'inert' | 'contradictory' | 'magnitude-clash' | 'axis-clash';
  /** Composite ranking score (higher = more worth review). */
  readonly score: number;
  /**
   * At least one of the `scale`/`force` axes had a resolved (non-conflicting)
   * value on BOTH endpoints, so the axis-compatibility gate produced a real
   * comparison (whether or not it clashed). `false` means every gate axis
   * abstained (silent on one/both sides, or a fold conflict) — the gate had
   * nothing to check. Populated on EVERY candidate, independent of verdict.
   */
  readonly axisChecked: boolean;
  /**
   * Per-axis clash descriptions (`'scale: quantum ≠ cosmological'`), sorted.
   * Empty when no gate axis clashed — including when `axisChecked` is
   * `false`, and even when a stronger falsifier (magnitude/contradictory)
   * won the verdict (no falsifier shadows another's annotation).
   */
  readonly axisClashes: readonly string[];
  /**
   * Standard-physics domains whose canonical equation has a TARGET of this
   * candidate's dimension (Sub-project C). Informational context — an empty
   * list means no canonical equation targets this dimension.
   */
  readonly canonicalKinds: readonly string[];
  /** At least one endpoint name is a quantity a canonical equation uses
   *  (weak name-based prior; informational). */
  readonly touchesCanonical: boolean;
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
  /**
   * Registry-only `scale`/`force`/`information` attributes by quantity name,
   * for the D1 axis-compatibility gate (default: every centralized
   * `Quantity.attributes`). Injectable for testing — never canonical
   * per-equation stamps (Option-A resolution).
   */
  readonly quantityAttributes?: ReadonlyMap<string, RegimeAttributes>;
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
 * One name's hyphen-token set is a STRICT subset of the other's
 * (`mass` ⊂ `reference-mass`, `mass` ⊂ `planck-mass`) — i.e. identifying a
 * generic quantity with one of its own specializations of the same kind.
 * Such an identification is near-tautological (it asserts the specialization
 * IS its genus), not a discovered cross-cluster link, so it is barred from
 * `promising`. Returns false for equal token sets and for pairs sharing only
 * a partial token (`schwarzschild-radius` ⊄ `foerster-radius`).
 */
function nameSubsumes(a: string, b: string): boolean {
  const ta = new Set(a.split('-'));
  const tb = new Set(b.split('-'));
  if (ta.size === tb.size) return false;
  const [small, big] = ta.size < tb.size ? [ta, tb] : [tb, ta];
  for (const t of small) if (!big.has(t)) return false;
  return true;
}

/**
 * Candidate-invariant state for the discovery funnel — everything in
 * `vetLinkCandidate` that depends only on `(edges, opts)`, not on the specific
 * candidate. Computed once by `buildDiscoveryContext` and shared across every
 * candidate so `rankDiscoveries` does loop-invariant work once instead of N
 * times. Holds read-only structures — `vetInContext` never mutates them, so
 * sharing is safe (pinned by the equivalence-guard test).
 *
 * @internal
 */
interface DiscoveryContext {
  readonly baseIdents: readonly QuantityIdentification[];
  readonly groundTruth: Readonly<Record<string, number>>;
  /** `Object.keys(groundTruth)` — the anchor known-set names. */
  readonly anchor: readonly string[];
  readonly repVals: Readonly<Record<string, RepresentativeValue>>;
  readonly maxOrders: number;
  /** Registry-only attribute lookup for the D1 axis gate (opts override or
   *  `REGISTRY_ATTRIBUTES_BY_NAME`). */
  readonly attributesByName: ReadonlyMap<string, RegimeAttributes>;
  /** `forwardEvaluate(edges, groundTruth, baseIdents)` — anchor magnitudes. */
  readonly anchorValues: ReadonlyMap<string, number>;
  /** `quantityComponents(edges, baseIdents)` — base component roots. */
  readonly comps: ReadonlyMap<string, string>;
  /** `forwardClosure(edges, anchor, baseIdents)` — base determinable set. */
  readonly closureBase: ReadonlySet<string>;
}

/** Resolve options and compute the candidate-invariant discovery state once.
 *  @internal */
function buildDiscoveryContext(
  edges: readonly BridgeEdge[],
  opts: DiscoveryOptions,
): DiscoveryContext {
  const baseIdents = opts.identifications ?? QUANTITY_IDENTIFICATIONS;
  const groundTruth = opts.groundTruth ?? ANCHOR_DEFAULT;
  const anchor = Object.keys(groundTruth);
  return {
    baseIdents,
    groundTruth,
    anchor,
    repVals: opts.representativeValues ?? REPRESENTATIVE_VALUES,
    maxOrders: opts.maxOrdersOfMagnitude ?? 3,
    attributesByName: opts.quantityAttributes ?? REGISTRY_ATTRIBUTES_BY_NAME,
    // Candidate-invariant: the anchor's forward evaluation, the base component
    // partition, and the base forward closure all depend only on (edges, opts).
    anchorValues: forwardEvaluate(edges, groundTruth, baseIdents),
    comps: quantityComponents(edges, baseIdents),
    closureBase: forwardClosure(edges, anchor, baseIdents),
  };
}

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
  return vetInContext(edges, candidate, buildDiscoveryContext(edges, opts));
}

/**
 * The per-candidate vetting body, given pre-computed candidate-invariant
 * `ctx`. Only the hypothesis-augmented closure and retrodiction are genuinely
 * per-candidate; the anchor magnitudes, base components, and base closure come
 * from `ctx`.
 *
 * @internal
 */
function vetInContext(
  edges: readonly BridgeEdge[],
  candidate: LinkCandidate,
  ctx: DiscoveryContext,
): VettedCandidate {
  const {
    baseIdents,
    groundTruth,
    anchor,
    repVals,
    maxOrders,
    anchorValues,
    comps,
    closureBase,
    attributesByName,
  } = ctx;

  // Magnitude gate: an INDEPENDENT falsifier the single-anchor graph can't make.
  // Only fires when both endpoints have a representative value; abstains (and
  // never false-rejects) otherwise. A value comes from the sourced static table
  // first, else — for graph-derived quantities the table omits by design
  // (schwarzschild-radius, thermal-de-broglie-wavelength) — from the quantity's
  // value AT THE REGISTERED ANCHOR, which is a definite magnitude for this run.
  const magnitudeOf = (
    name: string,
  ): { value: number; fromAnchor: boolean } | undefined => {
    const rv = repVals[name];
    // Both paths apply the same finite-and-nonzero gate: a 0/∞/NaN magnitude
    // would make log10 blow up (log10(0) = -∞), spoofing or silently disabling
    // the falsifier. Symmetric validation across the table and anchor sources.
    if (rv !== undefined && Number.isFinite(rv.value) && rv.value !== 0)
      return { value: rv.value, fromAnchor: false };
    const av = anchorValues.get(name);
    if (av !== undefined && Number.isFinite(av) && av !== 0)
      return { value: av, fromAnchor: true };
    return undefined;
  };
  const va = magnitudeOf(candidate.a);
  const vb = magnitudeOf(candidate.b);
  const magnitudeChecked = va !== undefined && vb !== undefined;
  const magnitudeUsedAnchor =
    magnitudeChecked && (va!.fromAnchor || vb!.fromAnchor);
  const ordersApart = magnitudeChecked
    ? Math.abs(Math.log10(Math.abs(va!.value)) - Math.log10(Math.abs(vb!.value)))
    : null;
  const magnitudeClash = ordersApart !== null && ordersApart > maxOrders;

  // A generic↔specialization identification (mass ≟ reference-mass) is
  // near-tautological — barred from `promising` regardless of structure.
  const subsuming = nameSubsumes(candidate.a, candidate.b);

  // Axis-compatibility gate (D1): a literal identity cannot have endpoints
  // whose STATED scale/force regimes disagree. Either side silent on an
  // axis (including a fold-conflict, resolved as unstated by
  // `effectiveAttributes`) abstains that axis rather than clashing.
  // Populated on every candidate, independent of which verdict wins.
  const attrsA = effectiveAttributes(candidate.a, attributesByName, baseIdents);
  const attrsB = effectiveAttributes(candidate.b, attributesByName, baseIdents);
  const checkedAxes: string[] = [];
  const axisClashes: string[] = [];
  for (const axis of GATE_AXES) {
    const av = attrsA[axis];
    const bv = attrsB[axis];
    if (av === undefined || bv === undefined) continue; // abstain
    checkedAxes.push(axis);
    if (av !== bv) axisClashes.push(`${axis}: ${av} ≠ ${bv}`);
  }
  axisClashes.sort();
  const axisChecked = checkedAxes.length > 0;
  const axisClash = axisClashes.length > 0;

  // The hypothesized identification, added in both directions so a≡b is a
  // full merge (identifications are directional in the engine).
  const rationale = `HYPOTHESIS (unadjudicated): ${candidate.a} ≡ ${candidate.b} — same dimension ${candidate.dim}`;
  const hypothesis: QuantityIdentification[] = [
    { from: candidate.a, to: candidate.b, rationale },
    { from: candidate.b, to: candidate.a, rationale },
  ];
  const withHyp = [...baseIdents, ...hypothesis];

  // Structural: does a≡b merge two components? (base partition from ctx)
  const mergesComponents =
    comps.has(candidate.a) &&
    comps.has(candidate.b) &&
    comps.get(candidate.a) !== comps.get(candidate.b);

  // Closure unlock: forward closure from the anchor, with vs without. The base
  // closure is candidate-invariant (ctx); only the hypothesis closure is fresh.
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
  // interpretable falsification, checked before the graph contradiction;
  // the qualitative identity falsifier (axis-clash) is weaker than both
  // numeric falsifiers but still outranks promising/inert (D1).
  let verdict: VettedCandidate['verdict'];
  if (magnitudeClash) verdict = 'magnitude-clash';
  else if (!numericallyConsistent) verdict = 'contradictory';
  else if (axisClash) verdict = 'axis-clash';
  else if (mergesComponents && unlocksFromAnchor.length > 0 && !subsuming)
    verdict = 'promising';
  else verdict = 'inert';

  // Score: all falsifications sink to the bottom; a subsuming (tautological)
  // identification sinks within `inert`; otherwise reward structural merges,
  // unlocks, and the proposer's weak priors.
  let score = 0;
  if (magnitudeClash || !numericallyConsistent || axisClash) {
    score = -1;
  } else if (subsuming) {
    score = 0;
  } else {
    score += mergesComponents ? 4 : 0;
    score += Math.min(unlocksFromAnchor.length, 4);
    score += candidate.touchesCore ? 1 : 0;
    score += candidate.sameKind ? 1 : 0;
  }

  const canonicalKinds = CANONICAL_KINDS_BY_DIM.get(candidate.dim) ?? [];
  const touchesCanonical =
    CANONICAL_QUANTITY_NAMES.has(candidate.a) ||
    CANONICAL_QUANTITY_NAMES.has(candidate.b);

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
    magnitudeUsedAnchor,
    subsuming,
    verdict,
    score,
    axisChecked,
    axisClashes,
    canonicalKinds,
    touchesCanonical,
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
    'axis-clash': 4,
  };
  const ctx = buildDiscoveryContext(edges, opts);
  const candidates = proposeLinkCandidates(edges);
  const vetted = candidates.map((c) => vetInContext(edges, c, ctx));
  vetted.sort(
    (x, y) =>
      VERDICT_RANK[x.verdict] - VERDICT_RANK[y.verdict] ||
      y.score - x.score ||
      x.a.localeCompare(y.a) ||
      x.b.localeCompare(y.b),
  );
  return vetted;
}
