/**
 * L1-sum-tier PILOT entries (`CE-bernoulli`, `CE-radioactive-decay`) —
 * per-entry checks: `monomial === null` with `freeDimensionlessGroups >= 1`
 * (dimensionally underdetermined — the classic non-monomial state), the exact
 * form carried in `scalarAst` (which validates to the target dimension), each
 * Bernoulli summand shares the pressure dimension, the decay exp-arg dimensionless.
 *
 * @module tests/canonical/nonmonomial
 */
import { describe, it, expect } from 'vitest';
import { NONMONOMIAL } from '../../src/canonical/entries/nonmonomial.js';
import { canonicalById } from '../../src/canonical/registry.js';
import { validate } from '../../src/dimensional/validator.js';
import { equals } from '../../src/dimensional/algebra.js';

describe('NONMONOMIAL pilot entries', () => {
  it('all non-monomial entries are registered', () => {
    expect(NONMONOMIAL.length).toBe(5);
    for (const e of NONMONOMIAL) {
      expect(canonicalById(e.id), e.id).toBeDefined();
    }
  });

  for (const e of NONMONOMIAL) {
    it(`${e.id}: monomial === null with freeGroups >= 1, but carries a scalarAst`, () => {
      // Dimensionally underdetermined (no single monomial), so monomial:null and
      // freeGroups >= 1 — the classic F1-consistent state. The exact form is not
      // lost: it lives in the scalarAst (asserted below).
      expect(e.dimensional.monomial).toBeNull();
      expect(e.freeDimensionlessGroups).toBeGreaterThanOrEqual(1);
      expect(e.scalarAst).toBeDefined();
    });

    it(`${e.id}: scalarAst validates to the declared target dimension`, () => {
      expect(e.scalarAst).toBeDefined();
      const res = validate(e.scalarAst!);
      expect(res.ok, JSON.stringify(res)).toBe(true);
      expect(res.inferredDimension).toBeDefined();
      expect(equals(res.inferredDimension!, e.dimensional.target.dim)).toBe(true);
    });
  }

  it('Bernoulli: each summand independently validates to the pressure dimension', () => {
    const bernoulli = canonicalById('CE-bernoulli')!;
    const rhs = bernoulli.scalarAst!;
    expect(rhs.kind).toBe('op');
    if (rhs.kind !== 'op') throw new Error('unreachable');
    expect(rhs.op).toBe('+');
    expect(rhs.args.length).toBe(3);
    for (const summand of rhs.args) {
      const res = validate(summand);
      expect(res.ok, JSON.stringify(res)).toBe(true);
      expect(equals(res.inferredDimension!, bernoulli.dimensional.target.dim)).toBe(true);
    }
  });

  it('radioactive decay: the exp argument (λt) is dimensionless', () => {
    const decay = canonicalById('CE-radioactive-decay')!;
    const rhs = decay.scalarAst!;
    expect(rhs.kind).toBe('op');
    if (rhs.kind !== 'op') throw new Error('unreachable');
    const expNode = rhs.args.find((a) => a.kind === 'transcendental');
    expect(expNode).toBeDefined();
    if (!expNode || expNode.kind !== 'transcendental') throw new Error('unreachable');
    expect(expNode.fn).toBe('exp');
    const argRes = validate(expNode.arg);
    expect(argRes.ok, JSON.stringify(argRes)).toBe(true);
    expect(
      equals(argRes.inferredDimension!, {
        L: 0, M: 0, T: 0, I: 0, Theta: 0, N: 0, J: 0,
      }),
    ).toBe(true);
  });
});
