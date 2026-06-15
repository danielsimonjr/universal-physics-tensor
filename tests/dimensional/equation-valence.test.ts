/**
 * Direction 3 — equation-level valence (free-index) homogeneity.
 *
 * validateEquation already checks dimensional homogeneity across `=`; this
 * pins the newly-added check that the LHS and RHS also share the same
 * free-index (valence/rank) signature. Closes the Task-7 deferral noted in
 * validator.ts and lets the validator catch the spec's "Bridge Eq 17"
 * index-rank mismatch — a rank-2 tensor cannot equal a scalar even when the
 * SI dimensions match.
 */
import { describe, it, expect } from 'vitest';
import { validateEquation } from '../../src/dimensional/validator.js';
import type { ExprNode } from '../../src/dimensional/validator.js';
import { ENERGY, DIMENSIONLESS } from '../../src/dimensional/types.js';

const scalar = (name: string, dim = ENERGY): ExprNode => ({
  kind: 'symbol',
  name,
  dim,
});

/** A rank-1 tensor symbol with one index of the given variance. */
const vec = (
  name: string,
  variance: 'upper' | 'lower',
  label = 'a',
  dim = ENERGY,
): ExprNode => ({
  kind: 'tensor-symbol',
  name,
  indices: [{ label, variance }],
  dim,
});

describe('validateEquation — valence (free-index) homogeneity', () => {
  it('scalar = scalar with matching dimension is valence-homogeneous', () => {
    const r = validateEquation(scalar('E'), scalar('E2'));
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it('rank-1 tensor = scalar is REJECTED even when dimensions match', () => {
    // same SI dimension (energy), but LHS carries a free index and RHS is
    // a scalar — not the same physical object. The pre-Direction-3 validator
    // passed this.
    const r = validateEquation(vec('P', 'upper'), scalar('E'));
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => /valence|free.?index|rank/i.test(v.note))).toBe(
      true,
    );
  });

  it('tensor = tensor with the SAME free-index signature passes', () => {
    const r = validateEquation(vec('A', 'lower', 'mu'), vec('B', 'lower', 'mu'));
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });

  it('tensor = tensor with MISMATCHED variance is rejected', () => {
    // A^mu (upper) vs B_mu (lower): same label, opposite variance — not
    // valence-homogeneous.
    const r = validateEquation(vec('A', 'upper', 'mu'), vec('B', 'lower', 'mu'));
    expect(r.ok).toBe(false);
    expect(r.violations.some((v) => /valence|free.?index|rank/i.test(v.note))).toBe(
      true,
    );
  });

  it('the valence check is independent of the dimensional check (both can fire)', () => {
    // rank-1 energy LHS vs scalar dimensionless RHS: dimension AND valence
    // both disagree.
    const r = validateEquation(vec('P', 'upper'), scalar('x', DIMENSIONLESS));
    expect(r.ok).toBe(false);
    const notes = r.violations.map((v) => v.note).join(' | ');
    expect(notes).toMatch(/homogeneous/); // dimensional
    expect(notes).toMatch(/valence|free.?index|rank/i); // valence
  });
});
