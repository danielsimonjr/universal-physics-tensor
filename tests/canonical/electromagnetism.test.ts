/**
 * Electromagnetism canonical entries — presence + id smoke test. Dimensional
 * correctness (every determinate monomial reproduces its target dimension) is
 * guarded registry-wide in invariants.test.ts.
 *
 * Batch 3 (2026-07-03) adds 5 more monomial laws (RC time constant, Poynting
 * flux, solenoid field, Larmor radiated power, field-energy density) — each
 * gets the stronger per-entry checks (0 free groups, monomial re-derivation,
 * scalarAst validation) mirroring `condensed-matter.test.ts`. Pre-existing
 * entries (e.g. `CE-coulomb`, which carries a free charge-ratio group) are
 * left to the registry-wide invariants test rather than asserted here.
 *
 * @module tests/canonical/electromagnetism
 */
import { describe, it, expect } from 'vitest';
import { ELECTROMAGNETISM } from '../../src/canonical/entries/electromagnetism.js';
import { multiply, power, equals } from '../../src/dimensional/algebra.js';
import { validate } from '../../src/dimensional/validator.js';
import type { Dimension } from '../../src/dimensional/types.js';

const EXPECTED_IDS = [
  'CE-capacitance-parallel-plate',
  'CE-capacitor-energy',
  // Folded in from the former l1-quantum-em batch file (2026-06-22 god-file
  // split): the two electromagnetism-domain force laws.
  'CE-coulomb',
  'CE-cyclotron-frequency',
  'CE-electrical-power',
  'CE-field-energy-density',
  'CE-inductor-energy',
  'CE-larmor-power',
  'CE-larmor-radius',
  'CE-lc-resonance',
  'CE-lorentz-force',
  'CE-magnetic-field-wire',
  'CE-ohm-law',
  'CE-point-charge-field',
  'CE-poynting-flux',
  'CE-rc-time-constant',
  'CE-resistance-material',
  'CE-solenoid-field',
];

// Batch 3 ids — the stronger checks below are scoped to these (pre-existing
// entries like CE-coulomb are dimensionally unique-*up-to-known-exception* and
// are not renormalized here).
const BATCH_3_IDS = new Set([
  'CE-rc-time-constant',
  'CE-poynting-flux',
  'CE-solenoid-field',
  'CE-larmor-power',
  'CE-field-energy-density',
]);

describe('ELECTROMAGNETISM canonical entries', () => {
  it('has the standard EM/circuit law set', () => {
    expect(ELECTROMAGNETISM.length).toBe(EXPECTED_IDS.length);
    expect(ELECTROMAGNETISM.map((e) => e.id).sort()).toEqual(EXPECTED_IDS);
  });

  it('all are electromagnetism-domain entries', () => {
    for (const e of ELECTROMAGNETISM) expect(e.domain, e.id).toBe('electromagnetism');
  });

  it('batch-3 entries are each a dimensionally unique monomial (0 free groups)', () => {
    for (const e of ELECTROMAGNETISM) {
      if (!BATCH_3_IDS.has(e.id)) continue;
      expect(e.freeDimensionlessGroups, e.id).toBe(0);
      expect(e.dimensional.monomial, e.id).not.toBeNull();
    }
  });

  it("batch-3 entries' monomial reproduces the target's dimension", () => {
    for (const e of ELECTROMAGNETISM) {
      if (!BATCH_3_IDS.has(e.id)) continue;
      const gov = new Map(e.dimensional.governing.map((g) => [g.name, g.dim]));
      let acc: Dimension = { L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0 };
      for (const [name, exp] of Object.entries(e.dimensional.monomial!)) {
        acc = multiply(acc, power(gov.get(name)!, exp));
      }
      expect(equals(acc, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('batch-3 scalarAst validates to the declared target dimension', () => {
    for (const e of ELECTROMAGNETISM) {
      if (!BATCH_3_IDS.has(e.id)) continue;
      expect(e.scalarAst, e.id).toBeDefined();
      const res = validate(e.scalarAst!);
      expect(res.ok, e.id).toBe(true);
      expect(res.inferredDimension, e.id).toBeDefined();
      expect(equals(res.inferredDimension!, e.dimensional.target.dim), e.id).toBe(true);
    }
  });

  it('batch-3 entries cite at least one reference and carry assumptions', () => {
    for (const e of ELECTROMAGNETISM) {
      if (!BATCH_3_IDS.has(e.id)) continue;
      expect(e.references.length, e.id).toBeGreaterThanOrEqual(1);
      expect(e.assumptions.length, e.id).toBeGreaterThanOrEqual(1);
    }
  });
});
