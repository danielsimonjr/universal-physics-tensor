/**
 * The canonical prefactor table (Mothership ruling 2026-09-25 on the L2/L7 limit).
 *
 * `src/canonical` records CE-pendulum-period only dimensionally and CE-kinetic-energy only up to a
 * constant, so a formula wrong by 2π or ½ could not be caught. `src/canonical` is a pinned
 * Criterion 3 input tree, so the prefactors live in a table OUTSIDE it,
 * `src/composition/canonical-prefactors.ts`, each with a verbatim source quote and a locator
 * pinned to a revision.
 */
import { describe, it, expect } from 'vitest';
import { CANONICAL_PREFACTORS } from '../../src/composition/canonical-prefactors.js';
import { CANONICAL_EQUATIONS } from '../../src/canonical/registry.js';
import { compareWithCanonical } from '../../src/composition/canonical-compare.js';
import type { ExprNode } from '../../src/dimensional/ast-types.js';

/** Every hand value here is typed from the textbook form, independent of the table. */
const EXPECTED: Record<string, number> = {
  'CE-pendulum-period': 2 * Math.PI,
  'CE-kinetic-energy': 0.5,
  'CE-rotational-kinetic-energy': 0.5,
  'CE-capacitor-energy': 0.5,
  'CE-schwarzschild-radius': 2,
  'CE-kepler-third': 2 * Math.PI,
  'CE-lc-resonance': 1,
  'CE-stokes-drag': 6 * Math.PI,
  'CE-stokes-einstein': 1 / (6 * Math.PI),
};

/** A dimensionless number used as a FACTOR (not as an exponent) anywhere in the AST. */
function hasNumericConstant(n: ExprNode): boolean {
  const isNumber = (x: ExprNode) =>
    x.kind === 'symbol' && Object.values(x.dim).every((e) => e === 0) && /^[\d.]|pi/.test(x.name);
  if (n.kind === 'symbol') return isNumber(n);
  const args = (n as { op?: string; args?: ExprNode[] }).args ?? [];
  if ((n as { op?: string }).op === '^') return hasNumericConstant(args[0]!); // skip the exponent
  return args.some(hasNumericConstant);
}

describe('the canonical prefactor table', () => {
  it('holds exactly the sourced entries, with the textbook prefactors', () => {
    expect(Object.fromEntries(CANONICAL_PREFACTORS.map((p) => [p.id, p.prefactor]))).toEqual(EXPECTED);
  });

  it('every entry names a real canonical equation that does NOT already record its prefactor', () => {
    for (const p of CANONICAL_PREFACTORS) {
      const e = CANONICAL_EQUATIONS.find((x) => x.id === p.id);
      expect(e, p.id).toBeDefined();
      expect(e!.epistemicStatus, p.id).not.toBe('fully-quantitative');
      // The prefactor multiplies the entry's AST or monomial, so neither may carry a constant.
      if (e!.scalarAst) expect(hasNumericConstant(e!.scalarAst), p.id).toBe(false);
      else expect(e!.dimensional.monomial, p.id).not.toBeNull();
    }
  });

  it('every entry carries a verbatim quote and a revision-pinned locator', () => {
    for (const p of CANONICAL_PREFACTORS) {
      expect(p.quote.length, p.id).toBeGreaterThan(5);
      expect(p.locator, p.id).toMatch(/revision \d+, wikitext line \d+/);
    }
  });
});

describe('L2 with the table: the persona cases are caught', () => {
  it('T = π√(ℓ/g) differs from CE-pendulum-period by the factor 0.5', () => {
    const r = compareWithCanonical('period', ['length', 'gravity'], (v) => Math.PI * Math.sqrt(v['length']! / v['gravity']!))
      .find((c) => c.id === 'CE-pendulum-period');
    expect(r?.kind).toBe('factor');
    expect(r?.ratio).toBeCloseTo(0.5, 12);
  });

  it('K = m·v² differs from CE-kinetic-energy by the factor 2', () => {
    const r = compareWithCanonical('kinetic-energy', ['mass', 'speed'], (v) => v['mass']! * v['speed']! ** 2)
      .find((c) => c.id === 'CE-kinetic-energy');
    expect(r?.kind).toBe('factor');
    expect(r?.ratio).toBeCloseTo(2, 12);
  });

  it('controls: the true laws AGREE', () => {
    const pend = compareWithCanonical('period', ['length', 'gravity'], (v) => 2 * Math.PI * Math.sqrt(v['length']! / v['gravity']!))
      .find((c) => c.id === 'CE-pendulum-period');
    const ke = compareWithCanonical('kinetic-energy', ['mass', 'speed'], (v) => 0.5 * v['mass']! * v['speed']! ** 2)
      .find((c) => c.id === 'CE-kinetic-energy');
    expect(pend?.kind).toBe('agrees');
    expect(ke?.kind).toBe('agrees');
  });
});
