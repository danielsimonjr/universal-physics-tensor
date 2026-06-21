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

const EXPECTED_IDS = [
  'CE-angular-momentum',
  'CE-centripetal-force',
  'CE-gravitational-potential-energy',
  'CE-hooke-law',
  'CE-impulse',
  'CE-kinetic-energy',
  'CE-mass-energy',
  'CE-moment-of-inertia',
  'CE-momentum',
  'CE-newton-second-law',
  'CE-power',
  'CE-rotational-kinetic-energy',
  'CE-simple-harmonic-frequency',
  'CE-spring-potential-energy',
  'CE-torque',
  'CE-work',
];

describe('MECHANICS canonical entries', () => {
  it('has the full foundational + classical mechanics set', () => {
    expect(MECHANICS.length).toBe(EXPECTED_IDS.length);
    expect(MECHANICS.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });

  it('has a determinate monomial iff 0 free dimensionless groups', () => {
    // Two-body laws (e.g. gravitational-potential-energy: m₁/m₂ ratio is a free
    // group, both [M]) are legitimately underdetermined → monomial null, free>0,
    // exactly like the registry's newton-gravitation.
    for (const e of MECHANICS) {
      if (e.freeDimensionlessGroups === 0) {
        expect(e.dimensional.monomial, e.id).not.toBeNull();
      } else {
        expect(e.dimensional.monomial, e.id).toBeNull();
      }
    }
  });

  it("each determinate monomial reproduces the target's dimension", () => {
    for (const e of MECHANICS) {
      if (e.dimensional.monomial === null) continue; // underdetermined (free group)
      const gov = new Map(e.dimensional.governing.map((g) => [g.name, g.dim]));
      let acc: Dimension = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
      for (const [name, exp] of Object.entries(e.dimensional.monomial)) {
        acc = multiply(acc, power(gov.get(name)!, exp));
      }
      expect(equals(acc, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('each has a recognized epistemic status', () => {
    const valid = ['dimensional', 'scalar-up-to-constant', 'fully-quantitative'];
    for (const e of MECHANICS) expect(valid, e.id).toContain(e.epistemicStatus);
  });
});
