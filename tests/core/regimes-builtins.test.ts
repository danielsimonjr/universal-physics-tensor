/**
 * Tests for `src/core/regimes-builtins.ts` — the 18 v0.6-shipped
 * closed-union values pre-registered under the regime-registry.
 *
 * `tests/core/regime-registry.test.ts` (Phase 2 block) already pins the
 * per-axis TAG sets and the 18-entry total via a side-effect import of
 * this module. This file imports the module directly (closing the
 * dependency-graph "no direct test" gap) and adds what that file does
 * NOT check: the exact `displayName` string per entry and the
 * `provenance.registeredBy` value, both read verbatim off the source.
 *
 * @module tests/core/regimes-builtins
 */
import { describe, it, expect } from 'vitest';
import { lookupRegime } from '../../src/core/regime-registry.js';
import '../../src/core/regimes-builtins.js'; // module under test — side effect: registers 18 built-ins

const BUILTIN_SOURCE = 'universal-physics-tensor';

describe('regimes-builtins — exact displayName pinning', () => {
  it('scale axis displayNames (4 entries)', () => {
    expect(lookupRegime('scale', 'quantum')?.displayName).toBe('Quantum (< 10^-9 m)');
    expect(lookupRegime('scale', 'mesoscopic')?.displayName).toBe('Mesoscopic (10^-9 to 10^-6 m)');
    expect(lookupRegime('scale', 'classical')?.displayName).toBe('Classical (10^-6 to 10^26 m)');
    expect(lookupRegime('scale', 'cosmological')?.displayName).toBe('Cosmological (> 10^26 m)');
  });

  it('force axis displayNames (5 entries)', () => {
    expect(lookupRegime('force', 'gravitational')?.displayName).toBe('Gravitational');
    expect(lookupRegime('force', 'electromagnetic')?.displayName).toBe('Electromagnetic');
    expect(lookupRegime('force', 'weak')?.displayName).toBe('Weak nuclear');
    expect(lookupRegime('force', 'strong')?.displayName).toBe('Strong nuclear');
    expect(lookupRegime('force', 'emergent')?.displayName).toBe('Emergent (friction, tension, etc.)');
  });

  it('symmetry axis displayNames (5 entries — Eve-M1: NOT 4 + placeholder)', () => {
    expect(lookupRegime('symmetry', 'poincare')?.displayName).toBe('Poincaré (spacetime)');
    expect(lookupRegime('symmetry', 'gauge')?.displayName).toBe('Gauge (U(1), SU(2), SU(3))');
    expect(lookupRegime('symmetry', 'conformal')?.displayName).toBe('Conformal (scale invariance)');
    expect(lookupRegime('symmetry', 'susy')?.displayName).toBe('Supersymmetry');
    expect(lookupRegime('symmetry', 'emergent')?.displayName).toBe('Emergent (effective symmetries)');
  });

  it('information axis displayNames (4 entries)', () => {
    expect(lookupRegime('information', 'vonNeumann')?.displayName).toBe('von Neumann entropy');
    expect(lookupRegime('information', 'shannon')?.displayName).toBe('Shannon entropy');
    expect(lookupRegime('information', 'kolmogorov')?.displayName).toBe('Kolmogorov complexity');
    expect(lookupRegime('information', 'quantumDiscord')?.displayName).toBe('Quantum discord');
  });

  it('every built-in entry carries provenance.registeredBy === "universal-physics-tensor"', () => {
    for (const [axis, tag] of [
      ['scale', 'quantum'], ['force', 'gravitational'],
      ['symmetry', 'poincare'], ['information', 'shannon'],
    ] as const) {
      expect(lookupRegime(axis, tag)?.provenance.registeredBy).toBe(BUILTIN_SOURCE);
    }
  });

  it('dimension and topology axes ship with zero built-ins (integer axes are wildcards)', () => {
    expect(lookupRegime('dimension', '4')).toBeUndefined();
    expect(lookupRegime('topology', '0')).toBeUndefined();
  });
});
