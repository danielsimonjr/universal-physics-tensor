/**
 * Fluids & waves canonical entries — presence + id smoke test, plus (batch 2)
 * per-entry dimensional/scalarAst checks for the 4 monomial laws added on top
 * of the pilot's registry-wide invariants.test.ts guard. (Reynolds number was
 * dropped from batch 2 — see the fluids-waves.ts module docstring: its 4
 * governing quantities over 3 base dimensions leave a 1-dimensional
 * Buckingham-π null space against a dimensionless target.)
 *
 * @module tests/canonical/fluids-waves
 */
import { describe, it, expect } from 'vitest';
import { FLUIDS_WAVES } from '../../src/canonical/entries/fluids-waves.js';
import { multiply, power, equals } from '../../src/dimensional/algebra.js';
import { validate } from '../../src/dimensional/validator.js';
import type { Dimension } from '../../src/dimensional/types.js';

const EXPECTED_IDS = [
  'CE-buoyant-force',
  'CE-density-definition',
  'CE-dynamic-pressure',
  'CE-hydrostatic-pressure',
  'CE-laplace-pressure',
  'CE-pressure-definition',
  'CE-shear-stress',
  'CE-sound-speed',
  'CE-stokes-drag',
  'CE-volume-flow-rate',
  'CE-wave-speed',
];

const BATCH_2_IDS = new Set([
  'CE-volume-flow-rate',
  'CE-shear-stress',
  'CE-laplace-pressure',
  'CE-dynamic-pressure',
]);

describe('FLUIDS_WAVES canonical entries', () => {
  it('has the fluids/waves law set', () => {
    expect(FLUIDS_WAVES.length).toBe(EXPECTED_IDS.length);
    expect(FLUIDS_WAVES.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });

  it('the 4 batch-2 laws are dimensionally unique monomials (0 free groups)', () => {
    for (const e of FLUIDS_WAVES) {
      if (!BATCH_2_IDS.has(e.id)) continue;
      expect(e.freeDimensionlessGroups, e.id).toBe(0);
      expect(e.dimensional.monomial, e.id).not.toBeNull();
    }
  });

  it("each batch-2 determinate monomial reproduces the target's dimension", () => {
    for (const e of FLUIDS_WAVES) {
      if (!BATCH_2_IDS.has(e.id)) continue;
      const gov = new Map(e.dimensional.governing.map((g) => [g.name, g.dim]));
      let acc: Dimension = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
      for (const [name, exp] of Object.entries(e.dimensional.monomial!)) {
        acc = multiply(acc, power(gov.get(name)!, exp));
      }
      expect(equals(acc, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('every batch-2 entry carries a scalarAst that validates to its target dimension', () => {
    for (const e of FLUIDS_WAVES) {
      if (!BATCH_2_IDS.has(e.id)) continue;
      expect(e.scalarAst, e.id).toBeDefined();
      const res = validate(e.scalarAst!);
      expect(res.ok, e.id).toBe(true);
      expect(res.inferredDimension, e.id).toBeDefined();
      expect(equals(res.inferredDimension!, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('every batch-2 entry cites at least one reference and has assumptions', () => {
    for (const e of FLUIDS_WAVES) {
      if (!BATCH_2_IDS.has(e.id)) continue;
      expect(e.references.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.assumptions.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.domain, e.id).toBe('mechanics');
    }
  });
});
