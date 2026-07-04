/**
 * Statistical-mechanics canonical entries (batch 5 of the L-layer expansion):
 * equipartition, Stokes-Einstein diffusion, kinetic pressure, and the
 * Maxwell-Boltzmann most-probable speed. Each must be a unique dimensional
 * monomial (0 free groups) whose monomial reproduces the target dimension.
 *
 * Mean free path was deliberately excluded (see the module docstring in
 * `statistical-mechanics.ts`) — underdetermined dimensionally.
 *
 * @module tests/canonical/statistical-mechanics
 */
import { describe, it, expect } from 'vitest';
import { STATISTICAL_MECHANICS } from '../../src/canonical/entries/statistical-mechanics.js';
import { multiply, power, equals } from '../../src/dimensional/algebra.js';
import { validate } from '../../src/dimensional/validator.js';
import type { Dimension } from '../../src/dimensional/types.js';

const EXPECTED_IDS = [
  'CE-equipartition',
  'CE-kinetic-pressure',
  'CE-mb-most-probable-speed',
  'CE-stokes-einstein',
];

const SCALAR_AST_IDS = new Set([
  'CE-equipartition',
  'CE-stokes-einstein',
  'CE-kinetic-pressure',
]);

const DIMENSIONAL_ONLY_IDS = new Set([
  'CE-mb-most-probable-speed',
]);

describe('STATISTICAL_MECHANICS canonical entries', () => {
  it('has the full batch of 4 entries', () => {
    expect(STATISTICAL_MECHANICS.length).toBe(EXPECTED_IDS.length);
    expect(STATISTICAL_MECHANICS.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });

  it('every entry is a dimensionally unique monomial (0 free groups)', () => {
    for (const e of STATISTICAL_MECHANICS) {
      expect(e.freeDimensionlessGroups, e.id).toBe(0);
      expect(e.dimensional.monomial, e.id).not.toBeNull();
    }
  });

  it("each determinate monomial reproduces the target's dimension", () => {
    for (const e of STATISTICAL_MECHANICS) {
      const gov = new Map(e.dimensional.governing.map((g) => [g.name, g.dim]));
      let acc: Dimension = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
      for (const [name, exp] of Object.entries(e.dimensional.monomial!)) {
        acc = multiply(acc, power(gov.get(name)!, exp));
      }
      expect(equals(acc, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('the 3 scalar-up-to-constant laws carry a scalarAst', () => {
    for (const e of STATISTICAL_MECHANICS) {
      if (SCALAR_AST_IDS.has(e.id)) {
        expect(e.scalarAst, e.id).toBeDefined();
        expect(e.epistemicStatus, e.id).toBe('scalar-up-to-constant');
      }
    }
    expect(
      STATISTICAL_MECHANICS.filter((e) => e.scalarAst).map((e) => e.id).sort(),
    ).toEqual([...SCALAR_AST_IDS].sort());
  });

  it('the fractional-monomial law omits scalarAst and is dimensional-only', () => {
    for (const e of STATISTICAL_MECHANICS) {
      if (DIMENSIONAL_ONLY_IDS.has(e.id)) {
        expect(e.scalarAst, e.id).toBeUndefined();
        expect(e.epistemicStatus, e.id).toBe('dimensional');
      }
    }
  });

  it('every scalarAst validates to its declared target dimension', () => {
    for (const e of STATISTICAL_MECHANICS) {
      if (!e.scalarAst) continue;
      const res = validate(e.scalarAst);
      expect(res.ok, e.id).toBe(true);
      expect(res.inferredDimension, e.id).toBeDefined();
      expect(equals(res.inferredDimension!, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('every entry cites at least one reference and has assumptions', () => {
    for (const e of STATISTICAL_MECHANICS) {
      expect(e.references.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.assumptions.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.domain, e.id).toBe('statistical');
    }
  });
});
