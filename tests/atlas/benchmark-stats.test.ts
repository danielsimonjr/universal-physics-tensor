/**
 * Atlas Phase 5, S5.4 — statistics against values computed INDEPENDENTLY:
 * the plan's textbook Wilson intervals, a hand-computed McNemar table, and a
 * hand-computed κ. Newcombe's paired interval has no textbook value in the
 * repository and is pinned by properties instead — stated, not hidden.
 */

import { describe, expect, it } from 'vitest';
import {
  cohensKappa,
  mcnemar,
  pairedDifferenceInterval,
  powerReport,
  wilsonInterval,
} from '../../src/atlas/benchmark/stats.js';

describe('wilsonInterval — the plan’s textbook values', () => {
  it('48/60 = 0.80 → [0.682, 0.882]', () => {
    const w = wilsonInterval(48, 60);
    expect(w.lower).toBeCloseTo(0.682, 3);
    expect(w.upper).toBeCloseTo(0.882, 3);
  });

  it('160/200 = 0.80 → [0.739, 0.850]', () => {
    const w = wilsonInterval(160, 200);
    expect(w.lower).toBeCloseTo(0.739, 3);
    expect(w.upper).toBeCloseTo(0.850, 3);
  });

  it('stays inside [0, 1] at the extremes and refuses nonsense counts', () => {
    expect(wilsonInterval(0, 10).lower).toBe(0);
    expect(wilsonInterval(10, 10).upper).toBe(1);
    expect(() => wilsonInterval(11, 10)).toThrow();
    expect(() => wilsonInterval(1, 0)).toThrow();
  });
});

describe('mcnemar — a hand-computed table (b = 10, c = 2)', () => {
  it('χ² = (|10 − 2| − 1)²/12 = 49/12; exact p = 2·(1 + 12 + 66)/4096 = 158/4096', () => {
    const r = mcnemar({ a: 0, b: 10, c: 2, d: 0 });
    expect(r.chiSquared).toBeCloseTo(49 / 12, 12);
    expect(r.exactP).toBeCloseTo(158 / 4096, 12);
  });

  it('no discordant pairs ⇒ no evidence: χ² = 0, p = 1', () => {
    expect(mcnemar({ a: 5, b: 0, c: 0, d: 5 })).toEqual({ chiSquared: 0, exactP: 1 });
  });

  it('is symmetric in b and c', () => {
    expect(mcnemar({ a: 1, b: 3, c: 9, d: 1 })).toEqual(mcnemar({ a: 1, b: 9, c: 3, d: 1 }));
  });
});

describe('cohensKappa — a hand-computed matrix', () => {
  it('[[20, 5], [10, 15]]: po = 0.7, pe = 0.5 ⇒ κ = 0.4', () => {
    expect(cohensKappa([[20, 5], [10, 15]])).toBeCloseTo(0.4, 12);
  });

  it('perfect agreement is 1; chance-level agreement is 0', () => {
    expect(cohensKappa([[10, 0], [0, 10]])).toBe(1);
    expect(cohensKappa([[25, 25], [25, 25]])).toBe(0);
  });

  it('κ is undefined (NaN) when chance agreement is 1, never reported as perfect', () => {
    expect(Number.isNaN(cohensKappa([[10, 0], [0, 0]]))).toBe(true);
  });
});

describe('pairedDifferenceInterval — Newcombe method 10, pinned by properties', () => {
  it('contains the point difference (b − c)/n', () => {
    const r = pairedDifferenceInterval({ a: 40, b: 12, c: 3, d: 5 });
    expect(r.diff).toBeCloseTo(9 / 60, 12);
    expect(r.lower).toBeLessThan(r.diff);
    expect(r.upper).toBeGreaterThan(r.diff);
  });

  it('is antisymmetric: swapping the two methods negates and mirrors the interval', () => {
    const ab = pairedDifferenceInterval({ a: 40, b: 12, c: 3, d: 5 });
    const ba = pairedDifferenceInterval({ a: 40, b: 3, c: 12, d: 5 });
    expect(ba.lower).toBeCloseTo(-ab.upper, 12);
    expect(ba.upper).toBeCloseTo(-ab.lower, 12);
  });

  it('with φ = 0 it reduces to the unpaired square-and-add of the two Wilson intervals', () => {
    // a·d = b·c ⇒ φ = 0 (a=4, b=2, c=2, d=1).
    const t = { a: 4, b: 2, c: 2, d: 1 };
    const n = 9;
    const w1 = wilsonInterval(t.a + t.b, n);
    const w2 = wilsonInterval(t.a + t.c, n);
    const p1 = (t.a + t.b) / n;
    const p2 = (t.a + t.c) / n;
    const r = pairedDifferenceInterval(t);
    expect(r.lower).toBeCloseTo(p1 - p2 - Math.hypot(p1 - w1.lower, w2.upper - p2), 12);
    expect(r.upper).toBeCloseTo(p1 - p2 + Math.hypot(w1.upper - p1, p2 - w2.lower), 12);
  });

  it('a clearly better method on 60 paired items excludes zero; an even split does not', () => {
    expect(pairedDifferenceInterval({ a: 40, b: 12, c: 3, d: 5 }).lower).toBeGreaterThan(0);
    const even = pairedDifferenceInterval({ a: 40, b: 6, c: 6, d: 8 });
    expect(even.lower).toBeLessThan(0);
    expect(even.upper).toBeGreaterThan(0);
  });
});

describe('powerReport — the interval the frozen set can afford', () => {
  it('60 per class at 0.8 accuracy: ±10.0 points; 200 per class: ±5.5', () => {
    expect(powerReport(60).halfWidth).toBeCloseTo(0.09977, 4);
    expect(powerReport(200).halfWidth).toBeCloseTo(0.05520, 4);
    expect(powerReport(60).statement).toContain('[68.2%, 88.2%]');
  });
});
