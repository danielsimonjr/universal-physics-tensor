/**
 * The 9 dimensional-derivation classics promoted into the registry (Task 2).
 * Each must still be recovered (exponents only) by the Buckingham-π engine —
 * the same guarantee the standalone benchmark gives, now sourced from the
 * canonical registry. A failure means a promoted entry's declared monomial no
 * longer matches what dimensions actually determine.
 *
 * @module tests/canonical/dimensional-classics
 */
import { describe, it, expect } from 'vitest';
import { dimensionallyDetermines } from '../../src/dimensional/buckingham.js';
import { DIMENSIONAL_CLASSICS } from '../../src/canonical/entries/dimensional-classics.js';

describe('canonical L0 classics — recovered by dimensions', () => {
  it('pins the count so additions are deliberate', () => {
    expect(DIMENSIONAL_CLASSICS.length).toBe(9);
  });

  for (const e of DIMENSIONAL_CLASSICS) {
    it(`derives ${e.id}`, () => {
      const res = dimensionallyDetermines(
        e.dimensional.target,
        e.dimensional.governing,
      );
      expect(res.determined).toBe(true);
      const mono = e.dimensional.monomial;
      expect(mono).not.toBeNull();
      for (const [name, exp] of Object.entries(mono!)) {
        expect(res.monomial![name]).toBeCloseTo(exp, 10);
      }
      for (const [name, exp] of Object.entries(res.monomial!)) {
        if (!(name in mono!)) expect(exp).toBeCloseTo(0, 10);
      }
      // Epistemic invariant: a fully-determined L0 entry has 0 free groups.
      expect(e.freeDimensionlessGroups === 0).toBe(e.dimensional.monomial !== null);
    });
  }
});
