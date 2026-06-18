/**
 * L1 canonical entries — gravitation + thermodynamics (Task 4). Each entry's
 * scalar-AST must validate to its declared target dimension, and its L0 fields
 * (computed from the Buckingham engine) must stay consistent
 * (`monomial !== null ⟺ freeDimensionlessGroups === 0`).
 *
 * @module tests/canonical/l1-gravity-thermo
 */
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { L1_GRAVITY_THERMO } from '../../src/canonical/entries/l1-gravity-thermo.js';

describe('canonical L1 — gravitation + thermodynamics', () => {
  it('pins the count', () => {
    expect(L1_GRAVITY_THERMO.length).toBe(6);
  });

  for (const e of L1_GRAVITY_THERMO) {
    it(`${e.id}: scalarAst validates to the target dimension`, () => {
      expect(e.scalarAst).toBeDefined();
      const res = validate(e.scalarAst!);
      expect(res.ok).toBe(true);
      expect(res.inferredDimension).toEqual(e.dimensional.target.dim);
    });

    it(`${e.id}: L0 fields are self-consistent and status is honest`, () => {
      expect(e.dimensional.monomial !== null).toBe(
        e.freeDimensionlessGroups === 0,
      );
      // an entry with a scalar-AST claims at least the algebraic form
      expect(e.epistemicStatus).not.toBe('dimensional');
    });
  }
});
