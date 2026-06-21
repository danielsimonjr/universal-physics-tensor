/**
 * Foundational-mechanics canonical entries (Newton's 2nd, mass–energy,
 * momentum). Each must be a unique dimensional monomial (0 free groups) whose
 * monomial reproduces the target dimension — the dimensional round-trip IS the
 * correctness check for these elementary laws.
 *
 * @module tests/canonical/mechanics
 */
import { describe, it, expect } from 'vitest';
import { MECHANICS } from '../../src/canonical/entries/mechanics.js';
import { multiply, power, equals } from '../../src/dimensional/algebra.js';
import type { Dimension } from '../../src/dimensional/types.js';

describe('MECHANICS canonical entries', () => {
  it('has the three foundational laws', () => {
    expect(MECHANICS.length).toBe(3);
    expect(MECHANICS.map((e) => e.id).sort()).toEqual([
      'CE-mass-energy',
      'CE-momentum',
      'CE-newton-second-law',
    ]);
  });

  it('each is a determinate monomial (0 free dimensionless groups)', () => {
    for (const e of MECHANICS) {
      expect(e.freeDimensionlessGroups, e.id).toBe(0);
      expect(e.dimensional.monomial, e.id).not.toBeNull();
    }
  });

  it("each monomial reproduces the target's dimension", () => {
    for (const e of MECHANICS) {
      const gov = new Map(e.dimensional.governing.map((g) => [g.name, g.dim]));
      let acc: Dimension = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
      for (const [name, exp] of Object.entries(e.dimensional.monomial!)) {
        acc = multiply(acc, power(gov.get(name)!, exp));
      }
      expect(equals(acc, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('are all fully-quantitative (exact, no hidden constant)', () => {
    for (const e of MECHANICS) expect(e.epistemicStatus, e.id).toBe('fully-quantitative');
  });
});
