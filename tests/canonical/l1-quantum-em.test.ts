/**
 * L1 canonical entries — quantum + electromagnetism (Task 5). Each entry's
 * scalar-AST must validate to its declared target dimension, with consistent
 * engine-derived L0 fields.
 *
 * @module tests/canonical/l1-quantum-em
 */
import { describe, it, expect } from 'vitest';
import { validate } from '../../src/dimensional/validator.js';
import { L1_QUANTUM_EM } from '../../src/canonical/entries/l1-quantum-em.js';

describe('canonical L1 — quantum + electromagnetism', () => {
  it('pins the count', () => {
    expect(L1_QUANTUM_EM.length).toBe(6);
  });

  for (const e of L1_QUANTUM_EM) {
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
      expect(e.epistemicStatus).not.toBe('dimensional');
    });
  }
});
