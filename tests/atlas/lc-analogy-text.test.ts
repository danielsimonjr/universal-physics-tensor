/**
 * The spring↔LC and damped↔RLC bridges state their dictionary where a reader looks (persona
 * finding D6, 2026-09-25). The force–voltage map m ↔ L, k ↔ 1/C, b ↔ R, x ↔ q appeared only inside
 * witness W1s/W2s tolerance text, and the ab-spring-lc counterexample said "the same L, C with
 * R = 4 has ζ_RLC = 0.5" without the L and C: ζ = (R/2)√(C/L) = 0.5 needs L/C = 16.
 */
import { describe, it, expect } from 'vitest';
import { ATLAS_FAMILIES } from '../../src/atlas/families.js';

const bridge = (id: string) => ATLAS_FAMILIES.flatMap((f) => f.bridges).find((b) => b.id === id)!;

describe('the LC analogies state their dictionary', () => {
  it('ab-spring-lc: the transformation names m ↔ L, k ↔ 1/C and x ↔ q', () => {
    const t = bridge('ab-spring-lc').transformation;
    for (const pair of ['m ↔ L', 'k ↔ 1/C', 'x ↔ q']) expect(t).toContain(pair);
  });

  it('ab-damped-rlc: the transformation also names b ↔ R', () => {
    const t = bridge('ab-damped-rlc').transformation;
    for (const pair of ['m ↔ L', 'k ↔ 1/C', 'b ↔ R', 'x ↔ q']) expect(t).toContain(pair);
  });

  it('the counterexample names L and C, and ζ = (R/2)√(C/L) = 0.5 follows from them', () => {
    const d = bridge('ab-spring-lc').counterexamples[0]!.description;
    const m = d.match(/L = ([\d.]+), C = ([\d.]+)/);
    expect(m).not.toBeNull();
    const [L, C] = [Number(m![1]), Number(m![2])];
    expect((4 / 2) * Math.sqrt(C / L)).toBe(0.5);
    expect(d).toMatch(/R = 4/);
  });

  it('the L and C it names are the ones witness W2b runs', async () => {
    const { readFileSync } = await import('node:fs');
    const src = readFileSync(new URL('./oscillators-exact.test.ts', import.meta.url), 'utf-8');
    const w2b = src.slice(src.indexOf("describe('W2b"));
    expect(w2b).toMatch(/const \[lL, cC\] = \[2, 0\.125\];/);
  });
});
