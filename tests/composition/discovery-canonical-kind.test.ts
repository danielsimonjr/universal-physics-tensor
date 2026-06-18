/**
 * Discovery canonical-kind annotations (C-T1). Discovery quantity names and
 * canonical variable names live in different namespaces, so the alignable axis
 * is the DIMENSION: `canonicalKinds` lists the standard-physics domains whose
 * canonical TARGET shares the candidate's dimension. `touchesCanonical` is the
 * weaker name-based signal (an endpoint name is a quantity standard physics
 * actually uses). Both are additive — existing verdicts/scores are unchanged.
 *
 * @module tests/composition/discovery-canonical-kind
 */
import { describe, it, expect } from 'vitest';
import { vetLinkCandidate } from '../../src/composition/discovery.js';
import type { LinkCandidate } from '../../src/composition/bridge-analysis.js';
import { format } from '../../src/dimensional/algebra.js';
import { ENERGY } from '../../src/dimensional/types.js';

const cand = (
  a: string,
  b: string,
  dim: string,
): LinkCandidate => ({ a, b, dim, touchesCore: false, sameKind: false, sharedToken: null });

describe('discovery canonical-kind annotations', () => {
  it('canonicalKinds lists standard-physics domains sharing the dimension', () => {
    // [energy] is the canonical target of Landauer (information) and
    // Planck–Einstein (quantum), among others.
    const r = vetLinkCandidate([], cand('foo', 'bar', format(ENERGY)));
    expect(r.canonicalKinds).toContain('information');
    expect(r.canonicalKinds.length).toBeGreaterThanOrEqual(1);
  });

  it('an exotic dimension shared by no canonical target yields no kinds', () => {
    const r = vetLinkCandidate([], cand('foo', 'bar', '[L^7 M^3]'));
    expect(r.canonicalKinds).toEqual([]);
  });

  it('touchesCanonical is true when an endpoint is a canonical quantity name', () => {
    // 'mass' is a governing variable in several canonical entries (Kepler, …).
    const r = vetLinkCandidate([], cand('mass', 'planck-mass', '[mass]'));
    expect(r.touchesCanonical).toBe(true);
  });

  it('touchesCanonical is false for purely graph-specific names', () => {
    const r = vetLinkCandidate(
      [],
      cand('grw-localization-rate', 'hubble-rate', '[frequency]'),
    );
    expect(r.touchesCanonical).toBe(false);
  });
});
