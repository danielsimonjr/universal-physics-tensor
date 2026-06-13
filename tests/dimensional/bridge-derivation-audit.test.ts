/**
 * Bridge-equation dimensional audit: how many of the catalog's bridge
 * equations can the Buckingham-π engine DERIVE? (research write-up:
 * docs/research/Bridge-Equation-Dimensional-Audit.md).
 *
 * The honest answer is three-way, and this test pins it:
 *
 *   - DERIVED   — a fundamental-constant subset dimensionally closes the
 *     target AND the resulting monomial reproduces the bridge's own
 *     evaluator up to a CONSTANT ratio (so the engine recovers the form,
 *     and the numerical match recovers the dimensionless prefactor that
 *     dimensional analysis cannot supply — ln2, 1/4π, 2, √(2π), 1/8π …).
 *   - DECOY-ONLY — dimensional closures exist, but none match the
 *     evaluator: the same dimensions admit a different physical formula
 *     (e.g. mass·c²/k_B, the rest-mass temperature, instead of the
 *     Hawking temperature ∝ 1/M), or the bridge is additive, not a
 *     monomial.
 *   - UNCLOSABLE — no constant subset closes it: an irreducible free
 *     dimensionless group (genuine multi-parameter physics) or a
 *     dimensionless target.
 *
 * Derivation is by DIMENSIONS — the engine never supplies the constant;
 * the numerical match against the evaluator does.
 */
import { describe, it, expect } from 'vitest';
import {
  buckinghamPi,
  dimensionallyDetermines,
} from '../../src/dimensional/buckingham.js';
import type { DimensionalVariable } from '../../src/dimensional/buckingham.js';
import type { Dimension } from '../../src/dimensional/types.js';
import type { BridgeEdge } from '../../src/composition/index.js';
import {
  be11ZurekEdge,
  be12Edge,
  be16Edge,
  be37Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  lawSchwarzschildRadius,
  be14Edge,
  be19Edge,
  be21Edge,
  be48Edge,
  be53Edge,
  be54Edge,
  CATALOG_FULL_EDGES,
} from '../../src/composition/index.js';

const D = (L = 0, M = 0, T = 0, Theta = 0, I = 0): Dimension => ({
  L,
  M,
  T,
  I,
  Theta,
  N: 0,
  J: 0,
});

// Candidate fundamental constants (with SI values) the search may add.
const CONSTANTS: ReadonlyArray<DimensionalVariable & { si: number }> = [
  { name: 'ℏ', dim: D(2, 1, -1), si: 1.054571817e-34 },
  { name: 'c', dim: D(1, 0, -1), si: 299792458 },
  { name: 'G', dim: D(3, -1, -2), si: 6.6743e-11 },
  { name: 'k_B', dim: D(2, 1, -2, -1), si: 1.380649e-23 },
  { name: 'e', dim: D(0, 0, 1, 0, 1), si: 1.602176634e-19 },
];
const SI: Record<string, number> = Object.fromEntries(
  CONSTANTS.map((k) => [k.name, k.si]),
);

const ALL_EDGES: BridgeEdge[] = [
  be11ZurekEdge,
  be12Edge,
  be16Edge,
  be37Edge,
  be42Edge,
  be42ViaRsEdge,
  be51Edge,
  be52Edge,
  lawSchwarzschildRadius,
  be14Edge,
  be19Edge,
  be21Edge,
  be48Edge,
  be53Edge,
  be54Edge,
  ...CATALOG_FULL_EDGES,
];

/** Subsets of the candidate constants, smallest first (deterministic). */
function subsetsBySize<T>(arr: readonly T[]): T[][] {
  let out: T[][] = [[]];
  for (const x of arr) {
    const n = out.length;
    for (let i = 0; i < n; i++) out.push([...out[i], x]);
  }
  return out.sort((a, b) => a.length - b.length);
}

/** Deterministic, domain-valid input sets with per-source-independent
 *  variation (so a wrong relative power is detectable). */
function makeInputs(e: BridgeEdge): Array<Record<string, number>> {
  if (e.sources.length === 0) return [{}];
  const sets: Array<Record<string, number>> = [];
  for (let j = 0; j < 3; j++) {
    const inp: Record<string, number> = {};
    e.sources.forEach((s, i) => {
      // distinct base per source, distinct exponent per set → independent
      inp[s.name] = Math.pow(1.6 + i, 1 + 0.27 * j);
    });
    try {
      if (e.domain.predicate(inp) && Number.isFinite(e.evaluate(inp))) {
        sets.push(inp);
      }
    } catch {
      /* skip domain/eval failures */
    }
  }
  return sets;
}

type DeriveResult =
  | { status: 'derived'; subset: string[]; prefactor: number }
  | { status: 'decoy-only' }
  | { status: 'unclosable' }
  | { status: 'no-samples' };

/** Attempt to derive a bridge: the first constant-subset that
 *  dimensionally closes the target AND reproduces the evaluator up to a
 *  constant ratio. */
function deriveBridge(e: BridgeEdge): DeriveResult {
  const target = { name: e.target.name, dim: e.target.dim };
  const sources = e.sources.map((s) => ({ name: s.name, dim: s.dim }));
  const inputs = makeInputs(e);
  const need = e.sources.length === 0 ? 1 : 2;

  let anyClosure = false;
  for (const S of subsetsBySize(CONSTANTS)) {
    const r = dimensionallyDetermines(target, [...sources, ...S]);
    if (!r.determined) continue;
    anyClosure = true;
    if (inputs.length < need) continue;
    const ratios = inputs.map((i) => {
      let cand = 1;
      for (const s of e.sources) cand *= Math.pow(i[s.name], r.monomial![s.name] ?? 0);
      for (const k of S) cand *= Math.pow(SI[k.name], r.monomial![k.name] ?? 0);
      return e.evaluate(i) / cand;
    });
    const mean = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const cv =
      Math.sqrt(
        ratios.reduce((a, b) => a + (b - mean) ** 2, 0) / ratios.length,
      ) / Math.abs(mean);
    if (cv < 1e-9) {
      return { status: 'derived', subset: S.map((x) => x.name), prefactor: mean };
    }
  }
  if (inputs.length < need) return { status: 'no-samples' };
  return { status: anyClosure ? 'decoy-only' : 'unclosable' };
}

const byId = new Map(ALL_EDGES.map((e) => [e.id, e] as const));
const derive = (id: string) => deriveBridge(byId.get(id)!);

describe('bridge dimensional audit — genuine derivations (form + recovered prefactor)', () => {
  it('be-16 Landauer: E ∝ k_B·T, prefactor = ln 2', () => {
    const r = derive('be-16');
    expect(r.status).toBe('derived');
    if (r.status === 'derived') {
      expect(r.subset).toEqual(['k_B']);
      expect(r.prefactor).toBeCloseTo(Math.log(2), 6);
    }
  });

  it('be-21 KSS bound: η/s ∝ ℏ/k_B, prefactor = 1/4π', () => {
    const r = derive('be-21');
    expect(r.status).toBe('derived');
    if (r.status === 'derived') expect(r.prefactor).toBeCloseTo(1 / (4 * Math.PI), 6);
  });

  it('be-42-via-rs Hawking: T_H ∝ ℏc/(r_s k_B), prefactor = 1/4π', () => {
    const r = derive('be-42-via-rs');
    expect(r.status).toBe('derived');
    if (r.status === 'derived') {
      expect(r.subset.sort()).toEqual(['c', 'k_B', 'ℏ'].sort());
      expect(r.prefactor).toBeCloseTo(1 / (4 * Math.PI), 6);
    }
  });

  it('law-schwarzschild: r_s ∝ GM/c², prefactor = 2 (NOT the Compton decoy)', () => {
    const r = derive('law-schwarzschild-radius');
    expect(r.status).toBe('derived');
    if (r.status === 'derived') {
      expect(r.subset.sort()).toEqual(['G', 'c'].sort());
      expect(r.prefactor).toBeCloseTo(2, 9);
    }
  });

  it('be-12 thermal de Broglie: λ ∝ ℏ(m k_B T)^-½, prefactor = √(2π)', () => {
    const r = derive('be-12');
    expect(r.status).toBe('derived');
    if (r.status === 'derived') {
      expect(r.subset.sort()).toEqual(['k_B', 'ℏ'].sort());
      expect(r.prefactor).toBeCloseTo(Math.sqrt(2 * Math.PI), 6);
    }
  });

  it('be-20 vacuum energy density: ρ_Λ ∝ Λc²/G, prefactor = 1/8π', () => {
    const r = derive('be-20');
    expect(r.status).toBe('derived');
    if (r.status === 'derived')
      expect(r.prefactor).toBeCloseTo(1 / (8 * Math.PI), 6);
  });
});

describe('bridge dimensional audit — decoys and the irreducible majority', () => {
  it('be-42 (direct, from mass) is a DECOY: only mass·c²/k_B closes, ∝ M not 1/M', () => {
    expect(derive('be-42').status).toBe('decoy-only');
  });

  it('be-27 effective-temperature is a DECOY: additive (T + noise/k_B), not a monomial', () => {
    expect(derive('be-27').status).toBe('decoy-only');
  });

  it('most bridges are dimensionally UNCLOSABLE (irreducible free group)', () => {
    const target = (e: BridgeEdge) => ({ name: e.target.name, dim: e.target.dim });
    const closable = ALL_EDGES.filter((e) => {
      const sources = e.sources.map((s) => ({ name: s.name, dim: s.dim }));
      return subsetsBySize(CONSTANTS).some(
        (S) => dimensionallyDetermines(target(e), [...sources, ...S]).determined,
      );
    });
    // 16 of 41 admit SOME dimensional closure; 25 admit none.
    expect(closable.length).toBe(16);
    expect(ALL_EDGES.length - closable.length).toBe(25);
  });

  it('dimensional analysis is a weak filter: a small minority are genuine monomial derivations', () => {
    const derived = ALL_EDGES.filter((e) => deriveBridge(e).status === 'derived');
    // The form-matching subset (verified against each evaluator).
    expect(derived.length).toBeGreaterThanOrEqual(9);
    expect(derived.length).toBeLessThanOrEqual(11);
  });
});

/**
 * Dimensional complexity (free dimensionless parameters): for each
 * bridge, the minimal constant subset that puts the target's dimension
 * IN SPAN, then the leftover π-group count − 1. 0 = a single dimensionless
 * statement (monomial or dimensionless target); k = the relation is a
 * monomial × F(k dimensionless ratios). This grades the binary
 * "unclosable" into a spectrum, and shows it is ORTHOGONAL to credibility.
 */
function rankOf(vars: DimensionalVariable[]): number {
  return vars.length ? buckinghamPi(vars).rank : 0;
}
function inSpan(t: DimensionalVariable, gov: DimensionalVariable[]): boolean {
  return gov.length === 0
    ? buckinghamPi([t]).rank === 0
    : rankOf([t, ...gov]) === rankOf(gov);
}
function freeParameters(e: BridgeEdge): number {
  const target = { name: e.target.name, dim: e.target.dim };
  const sources = e.sources.map((s) => ({ name: s.name, dim: s.dim }));
  for (const S of subsetsBySize(CONSTANTS)) {
    const gov = [...sources, ...S];
    if (inSpan(target, gov)) return buckinghamPi([target, ...gov]).piGroupCount - 1;
  }
  return Infinity;
}
const free = (id: string) => freeParameters(byId.get(id)!);

describe('bridge dimensional complexity — the spectrum behind "unclosable"', () => {
  it('derivable bridges have 0 free dimensionless parameters', () => {
    expect(free('law-schwarzschild-radius')).toBe(0);
    expect(free('be-16')).toBe(0);
    expect(free('be-21')).toBe(0);
  });

  it('Mercury perihelion AND Shapiro delay are complexity 1 — one ratio from a monomial', () => {
    // Both are ESTABLISHED, codebase-validated GR results, yet "unclosable":
    // they each carry exactly ONE dimensionless ratio (eccentricity / radius
    // ratio). Complexity is not credibility.
    expect(free('be-52')).toBe(1); // perihelion precession
    expect(free('be-37')).toBe(1); // Shapiro delay
  });

  it('the genuinely multi-parameter bridges sit at the top of the spectrum', () => {
    expect(free('be-47')).toBe(6); // primordial nucleosynthesis (8 sources)
    expect(free('be-39')).toBe(5); // asymptotic safety
  });

  it('the spectrum histogram is pinned (16 at 0; max 6)', () => {
    const hist: Record<number, number> = {};
    for (const e of ALL_EDGES) hist[freeParameters(e)] = (hist[freeParameters(e)] ?? 0) + 1;
    expect(hist[0]).toBe(16); // the dimensionally-pinned set (derived + decoy)
    expect(Math.max(...Object.keys(hist).map(Number))).toBe(6);
    // 11 bridges are exactly one dimensionless ratio away from a monomial
    expect(hist[1]).toBe(11);
  });

  it('complexity is ORTHOGONAL to status: an established bridge sits at complexity 1', () => {
    // be-52 (perihelion) is established; many complexity-≥3 bridges are too
    // (be-53 Yang-Mills). Derivability/complexity does not track credibility.
    expect(free('be-52')).toBe(1);
    expect(free('be-53')).toBe(3); // Yang-Mills β-function: established, complexity 3
  });
});
