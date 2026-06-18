/**
 * Relativity canonical entries (Task 9): EFE at L2 (its field-equation node must
 * pass the existing structural validator) and Friedmann at L1 (scalar form
 * validates dimensionally).
 *
 * @module tests/canonical/relativity
 */
import { describe, it, expect } from 'vitest';
import { validateEinsteinFieldEquation } from '../../src/dimensional/einstein-equation.js';
import { validate } from '../../src/dimensional/validator.js';
import { canonicalById } from '../../src/canonical/registry.js';

describe('canonical relativity entries', () => {
  it('CE-einstein-field-eq carries a field-equation node that validates (L2)', () => {
    const efe = canonicalById('CE-einstein-field-eq');
    expect(efe).toBeDefined();
    expect(efe?.fieldEquation).toBeDefined();
    const result = validateEinsteinFieldEquation(efe!.fieldEquation!);
    // EFE is a rank-2 lower-lower identity with per-component dim [L⁻²].
    expect(result.dim).toEqual({ L: -2, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 });
    expect(result.freeIndices.size).toBe(2);
  });

  it('CE-friedmann scalar form validates to [T⁻²] (L1)', () => {
    const fr = canonicalById('CE-friedmann');
    expect(fr?.scalarAst).toBeDefined();
    const res = validate(fr!.scalarAst!);
    expect(res.ok).toBe(true);
    expect(res.inferredDimension).toEqual({
      L: 0,
      M: 0,
      T: -2,
      I: 0,
      Theta: 0,
      N: 0,
      J: 0,
    });
  });

  const TEMP = { L: 0, M: 0, T: 0, I: 0, Theta: 1, N: 0, J: 0 };
  const DLESS = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
  const newGR: Array<[string, typeof TEMP]> = [
    ['CE-hawking-temperature', TEMP],
    ['CE-light-deflection', DLESS],
    ['CE-perihelion-precession', DLESS],
  ];
  for (const [id, dim] of newGR) {
    it(`${id} scalar form validates to its target dimension`, () => {
      const e = canonicalById(id);
      expect(e?.scalarAst).toBeDefined();
      const res = validate(e!.scalarAst!);
      expect(res.ok).toBe(true);
      expect(res.inferredDimension).toEqual(dim);
    });
  }
});
