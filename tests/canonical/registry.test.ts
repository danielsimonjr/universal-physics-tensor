/**
 * Canonical-equation registry accessors (Sub-project A, Task 1). The registry
 * is the queryable index of canonical (textbook) equations seeded into the
 * tensor L-layer. This test pins the lookup surface; entry content is pinned
 * by later tasks.
 *
 * @module tests/canonical/registry
 */
import { describe, it, expect } from 'vitest';
import {
  CANONICAL_EQUATIONS,
  CANONICAL_BY_ID,
  canonicalById,
  canonicalByDomain,
} from '../../src/canonical/registry.js';

describe('canonical registry accessors', () => {
  it('finds a known entry by id and misses an unknown one', () => {
    const e = canonicalById('CE-pendulum-period');
    expect(e).toBeDefined();
    expect(e?.id).toBe('CE-pendulum-period');
    expect(canonicalById('CE-does-not-exist')).toBeUndefined();
  });

  it('filters by domain', () => {
    const mech = canonicalByDomain('mechanics');
    expect(mech.length).toBeGreaterThanOrEqual(1);
    for (const e of mech) expect(e.domain).toBe('mechanics');
  });

  it('CANONICAL_BY_ID has exactly one entry per array element', () => {
    expect(Object.keys(CANONICAL_BY_ID).length).toBe(CANONICAL_EQUATIONS.length);
    for (const e of CANONICAL_EQUATIONS) {
      expect(CANONICAL_BY_ID[e.id]).toBe(e);
    }
  });
});
