/**
 * Thermo/nuclear/cosmo canonical entries — presence + id smoke test, plus
 * per-entry dimensional/scalarAst checks for the batch-4 (2026-07-03) trio
 * (latent heat, Clausius entropy change, thermal diffusivity). Dimensional
 * correctness for the rest of the file is guarded registry-wide in
 * invariants.test.ts.
 *
 * @module tests/canonical/thermo-nuclear-cosmo
 */
import { describe, it, expect } from 'vitest';
import { THERMO_NUCLEAR_COSMO } from '../../src/canonical/entries/thermo-nuclear-cosmo.js';
import { multiply, power, equals } from '../../src/dimensional/algebra.js';
import { validate } from '../../src/dimensional/validator.js';
import type { Dimension } from '../../src/dimensional/types.js';

const EXPECTED_IDS = [
  'CE-half-life',
  'CE-heat-capacity',
  'CE-hubble-distance',
  // Folded in from the former l1-gravity-thermo / l1-quantum-em batch files
  // (2026-06-22 god-file split): the thermodynamic / statistical monomials.
  'CE-ideal-gas',
  'CE-jarzynski',
  'CE-landauer',
  'CE-stefan-boltzmann',
  'CE-wien',
  // Batch 4 (2026-07-03): 3 more thermodynamics monomials.
  'CE-latent-heat',
  'CE-clausius-entropy',
  'CE-thermal-diffusivity',
].sort();

const BATCH_4_IDS = new Set([
  'CE-latent-heat',
  'CE-clausius-entropy',
  'CE-thermal-diffusivity',
]);

describe('THERMO_NUCLEAR_COSMO canonical entries', () => {
  it('has the thermo/nuclear/cosmo law set', () => {
    expect(THERMO_NUCLEAR_COSMO.length).toBe(EXPECTED_IDS.length);
    expect(THERMO_NUCLEAR_COSMO.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });

  describe('batch 4 (latent heat / Clausius entropy / thermal diffusivity)', () => {
    const batch4 = THERMO_NUCLEAR_COSMO.filter((e) => BATCH_4_IDS.has(e.id));

    it('all 3 batch-4 entries are present', () => {
      expect(batch4.map((e) => e.id).sort()).toEqual([...BATCH_4_IDS].sort());
    });

    it('every entry is a dimensionally unique monomial (0 free groups)', () => {
      for (const e of batch4) {
        expect(e.freeDimensionlessGroups, e.id).toBe(0);
        expect(e.dimensional.monomial, e.id).not.toBeNull();
      }
    });

    it("each monomial reproduces the target's dimension", () => {
      for (const e of batch4) {
        const gov = new Map(e.dimensional.governing.map((g) => [g.name, g.dim]));
        let acc: Dimension = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
        for (const [name, exp] of Object.entries(e.dimensional.monomial!)) {
          acc = multiply(acc, power(gov.get(name)!, exp));
        }
        expect(equals(acc, e.dimensional.target.dim), e.id).toBe(true);
      }
    });

    it('every scalarAst validates to its declared target dimension', () => {
      for (const e of batch4) {
        expect(e.scalarAst, e.id).toBeDefined();
        const res = validate(e.scalarAst!);
        expect(res.ok, e.id).toBe(true);
        expect(res.inferredDimension, e.id).toBeDefined();
        expect(equals(res.inferredDimension!, e.dimensional.target.dim), e.id).toBe(true);
      }
    });

    it('every entry cites at least one reference, has assumptions, and is thermodynamics', () => {
      for (const e of batch4) {
        expect(e.references.length, e.id).toBeGreaterThanOrEqual(1);
        expect(e.assumptions.length, e.id).toBeGreaterThanOrEqual(1);
        expect(e.domain, e.id).toBe('thermodynamics');
      }
    });
  });
});
