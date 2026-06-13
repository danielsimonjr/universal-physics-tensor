/**
 * Bridge-analysis — structural triage signals over the composition graph.
 *
 * INTERNAL (deliberately NOT on the public surface — not re-exported from
 * src/index.ts). A meta/analysis layer, like the catalog adjudicator, that
 * combines the dimensional engine with the graph to PRIORITIZE which
 * speculative bridges are closest to being DECIDABLE against established
 * physics — most anchored to the established core and most checkable.
 *
 * ⚠ This is a TRIAGE ranking (review/confrontation priority), NOT a
 * credibility ranking. The dimensional signals are orthogonal to whether a
 * bridge is true (see docs/research/Bridge-Equation-Dimensional-Audit.md:
 * the established Mercury perihelion is "unclosable"; the highly-speculative
 * Hawking-via-r_s derives cleanly). Do not prune, rank, or score the
 * catalog's credibility with this.
 *
 * Three engine signals + one catalog signal:
 *   - grounding   — does the equation re-derive as a recognized monomial
 *                   with a CLEAN dimensionless constant (ln2, 1/4π, √2π)?
 *   - complexity  — free dimensionless parameters (lower = more tractable).
 *   - anchoring   — graph distance to the established-confidence core.
 *   - status / data-confrontation — joined from the catalog (NOT engine).
 *
 * @module composition/bridge-analysis
 */

import { buckinghamPi, dimensionallyDetermines } from '../dimensional/buckingham.js';
import type { Dimension } from '../dimensional/types.js';
import type { BridgeEdge } from './edge.js';
import { BRIDGE_EQUATIONS } from '../bridges/index.js';

const dim = (L = 0, M = 0, T = 0, Theta = 0, I = 0): Dimension => ({
  L,
  M,
  T,
  I,
  Theta,
  N: 0,
  J: 0,
});

/** A fundamental constant the derivation search may add (with SI value). */
export interface NamedConstant {
  readonly name: string;
  readonly dim: Dimension;
  readonly si: number;
}

/** ℏ, c, G, k_B, e — the constants the audit/triage may invoke. */
export const FUNDAMENTAL_CONSTANTS: readonly NamedConstant[] = [
  { name: 'ℏ', dim: dim(2, 1, -1), si: 1.054571817e-34 },
  { name: 'c', dim: dim(1, 0, -1), si: 299792458 },
  { name: 'G', dim: dim(3, -1, -2), si: 6.6743e-11 },
  { name: 'k_B', dim: dim(2, 1, -2, -1), si: 1.380649e-23 },
  { name: 'e', dim: dim(0, 0, 1, 0, 1), si: 1.602176634e-19 },
];

/** Catalog bridge ids with a committed data confrontation (BE-23, BE-36). */
export const DATA_CONFRONTED_BE_IDS: ReadonlySet<number> = new Set([23, 36]);

function subsetsBySize<T>(arr: readonly T[]): T[][] {
  let out: T[][] = [[]];
  for (const x of arr) {
    const n = out.length;
    for (let i = 0; i < n; i++) out.push([...out[i], x]);
  }
  return out.sort((a, b) => a.length - b.length);
}

type DV = { name: string; dim: Dimension };
const asVars = (e: BridgeEdge): { target: DV; sources: DV[] } => ({
  target: { name: e.target.name, dim: e.target.dim },
  sources: e.sources.map((s) => ({ name: s.name, dim: s.dim })),
});

const rankOf = (vars: DV[]): number => (vars.length ? buckinghamPi(vars).rank : 0);
const inSpan = (t: DV, gov: DV[]): boolean =>
  gov.length === 0 ? buckinghamPi([t]).rank === 0 : rankOf([t, ...gov]) === rankOf(gov);

/**
 * Free dimensionless parameters: minimal constant subset that puts the
 * target in span, then the leftover π-group count − 1. 0 = a single
 * dimensionless statement (monomial or decoy); k = monomial × F(k ratios).
 */
export function dimensionalFreedom(e: BridgeEdge): number {
  const { target, sources } = asVars(e);
  for (const S of subsetsBySize(FUNDAMENTAL_CONSTANTS)) {
    const gov = [...sources, ...S];
    if (inSpan(target, gov)) return buckinghamPi([target, ...gov]).piGroupCount - 1;
  }
  return Infinity;
}

/** Deterministic, domain-valid input sets with per-source variation. */
function makeInputs(e: BridgeEdge): Array<Record<string, number>> {
  if (e.sources.length === 0) return [{}];
  const sets: Array<Record<string, number>> = [];
  for (let j = 0; j < 3; j++) {
    const inp: Record<string, number> = {};
    e.sources.forEach((s, i) => {
      inp[s.name] = Math.pow(1.6 + i, 1 + 0.27 * j);
    });
    try {
      if (e.domain.predicate(inp) && Number.isFinite(e.evaluate(inp))) sets.push(inp);
    } catch {
      /* skip */
    }
  }
  return sets;
}

/** Recognizable dimensionless prefactors (small rationals, 1/nπ, √, π). */
const CLEAN_PREFACTORS: readonly number[] = [
  1, 2, 3, 4, 0.5, 0.25, Math.log(2),
  1 / (2 * Math.PI), 1 / (4 * Math.PI), 1 / (8 * Math.PI),
  Math.sqrt(2 * Math.PI), Math.sqrt(Math.PI),
  Math.PI, 2 * Math.PI, 4 * Math.PI, 6 * Math.PI,
];
const isCleanPrefactor = (p: number): boolean =>
  CLEAN_PREFACTORS.some((c) => Math.abs(Math.abs(p) - c) < 1e-3 * c);

/** The outcome of trying to derive a bridge dimensionally + verify it. */
export type DerivationStatus = 'derived' | 'decoy' | 'open' | 'no-samples';
export interface DerivationResult {
  readonly status: DerivationStatus;
  readonly subset?: readonly string[];
  readonly monomial?: Readonly<Record<string, number>>;
  readonly prefactor?: number;
  /** True when derived AND the prefactor is a recognizable constant. */
  readonly cleanPrefactor?: boolean;
}

/**
 * Attempt to derive a bridge: the first constant-subset that dimensionally
 * closes the target AND reproduces the evaluator up to a constant ratio.
 */
export function attemptDerivation(e: BridgeEdge): DerivationResult {
  const { target, sources } = asVars(e);
  const inputs = makeInputs(e);
  const need = e.sources.length === 0 ? 1 : 2;
  let anyClosure = false;
  for (const S of subsetsBySize(FUNDAMENTAL_CONSTANTS)) {
    const r = dimensionallyDetermines(target, [...sources, ...S]);
    if (!r.determined) continue;
    anyClosure = true;
    if (inputs.length < need) continue;
    const ratios = inputs.map((i) => {
      let cand = 1;
      for (const s of e.sources) cand *= Math.pow(i[s.name], r.monomial![s.name] ?? 0);
      for (const k of S) cand *= Math.pow(k.si, r.monomial![k.name] ?? 0);
      return e.evaluate(i) / cand;
    });
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const cv =
      Math.sqrt(ratios.reduce((a, b) => a + (b - mean) ** 2, 0) / ratios.length) /
      Math.abs(mean);
    if (cv < 1e-9) {
      return {
        status: 'derived',
        subset: S.map((x) => x.name),
        monomial: r.monomial,
        prefactor: mean,
        cleanPrefactor: isCleanPrefactor(mean),
      };
    }
  }
  if (inputs.length < need) return { status: 'no-samples' };
  return { status: anyClosure ? 'decoy' : 'open' };
}

/**
 * Graph distance from a bridge's quantities to the established-confidence
 * core (BFS over quantity co-occurrence). 0 = shares a quantity with an
 * established edge; Infinity = structurally isolated from it.
 */
export function anchoringDistance(
  edges: readonly BridgeEdge[],
  e: BridgeEdge,
): number {
  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  const core = new Set<string>();
  for (const edge of edges) {
    const q = [...edge.sources.map((s) => s.name), edge.target.name];
    for (const a of q) for (const b of q) if (a !== b) link(a, b);
    if (edge.confidence === 'established') for (const n of q) core.add(n);
  }
  const distOf = new Map<string, number>();
  const queue = [...core];
  for (const c of core) distOf.set(c, 0);
  while (queue.length) {
    const x = queue.shift()!;
    for (const y of adj.get(x) ?? []) {
      if (!distOf.has(y)) {
        distOf.set(y, distOf.get(x)! + 1);
        queue.push(y);
      }
    }
  }
  const qs = [...e.sources.map((s) => s.name), e.target.name];
  return Math.min(...qs.map((n) => (distOf.has(n) ? distOf.get(n)! : Infinity)));
}

/** How grounded the equation is, as a structural signal. */
export type Grounding = 'grounded' | 'empirical' | 'decoy' | 'open';
/** Review-priority tier (1 = highest structural decidability). */
export type Tier = 1 | 2 | 3;

/** One bridge's triage profile. */
export interface BridgePriorityEntry {
  readonly id: string;
  readonly beId: number | null;
  readonly status: string;
  /** `grounded` (recognized monomial+clean constant) → `open` (multi-param). */
  readonly grounding: Grounding;
  /** Free dimensionless parameters (lower = more tractable). */
  readonly complexity: number;
  /** Graph distance to the established core (Infinity = isolated). */
  readonly anchoring: number;
  /** A committed data confrontation exists (catalog signal, NOT engine). */
  readonly hasDataConfrontation: boolean;
  readonly tier: Tier;
}

function grounding(e: BridgeEdge): Grounding {
  const d = attemptDerivation(e);
  if (d.status === 'derived') return d.cleanPrefactor ? 'grounded' : 'empirical';
  if (d.status === 'decoy') return 'decoy';
  return 'open';
}

const GROUND_RANK: Record<Grounding, number> = {
  grounded: 0,
  empirical: 1,
  decoy: 2,
  open: 3,
};

/**
 * Triage the non-established bridges by structural decidability against the
 * established core. Returns profiles sorted best-first (Tier, then anchoring,
 * grounding, complexity). NOT a credibility ranking — see module docstring.
 */
export function bridgePriority(
  edges: readonly BridgeEdge[],
): BridgePriorityEntry[] {
  const statusOf = new Map<number, string>(
    BRIDGE_EQUATIONS.map((b) => [b.id, b.status]),
  );
  const entries: BridgePriorityEntry[] = [];
  for (const e of edges) {
    if (e.confidence === 'established') continue; // already in the core
    const g = grounding(e);
    const complexity = dimensionalFreedom(e);
    const anchoring = anchoringDistance(edges, e);
    const anchored = Number.isFinite(anchoring);
    const tier: Tier =
      anchored && (g === 'grounded' || complexity <= 1)
        ? 1
        : anchored || g === 'grounded'
          ? 2
          : 3;
    entries.push({
      id: e.id,
      beId: e.beId,
      status: e.beId == null ? 'law' : (statusOf.get(e.beId) ?? 'unknown'),
      grounding: g,
      complexity,
      anchoring,
      hasDataConfrontation: e.beId != null && DATA_CONFRONTED_BE_IDS.has(e.beId),
      tier,
    });
  }
  entries.sort(
    (a, b) =>
      a.tier - b.tier ||
      a.anchoring - b.anchoring ||
      GROUND_RANK[a.grounding] - GROUND_RANK[b.grounding] ||
      a.complexity - b.complexity ||
      a.id.localeCompare(b.id),
  );
  return entries;
}
