/**
 * Tests for `src/core/axes-registry.ts` — v0.7-p1 Phase 1.
 *
 * Covers: same-object-across-imports singleton invariant (Decision
 * #4), `Object.freeze` enforcement, per-namespace axis-discriminator
 * consistency, the full 18-entry census from baseline Task 0.1.
 *
 * @module tests/core/axes-registry
 */

import { describe, it, expect } from 'vitest';
import { Axes } from '../../src/core/axes-registry.js';
import { Axes as AxesAgain } from '../../src/core/axes-registry.js';

describe('Axes — module-singleton invariant', () => {
  it('returns the same object across two import sites', () => {
    expect(Axes).toBe(AxesAgain);
  });

  it('returns the same per-axis entries across imports', () => {
    expect(Axes.scale.quantum).toBe(AxesAgain.scale.quantum);
    expect(Axes.force.electromagnetic).toBe(AxesAgain.force.electromagnetic);
  });
});

describe('Axes — Object.freeze invariant', () => {
  it('outer object is frozen', () => {
    expect(Object.isFrozen(Axes)).toBe(true);
  });

  it('per-namespace sub-objects are frozen', () => {
    expect(Object.isFrozen(Axes.scale)).toBe(true);
    expect(Object.isFrozen(Axes.force)).toBe(true);
    expect(Object.isFrozen(Axes.symmetry)).toBe(true);
    expect(Object.isFrozen(Axes.information)).toBe(true);
  });

  it('throws in strict mode on outer reassignment attempt', () => {
    expect(() => {
      // @ts-expect-error — Axes is readonly.
      Axes.scale = {} as never;
    }).toThrow();
  });

  it('throws in strict mode on inner entry reassignment attempt', () => {
    expect(() => {
      (Axes.scale as { quantum: unknown }).quantum = {};
    }).toThrow();
  });
});

describe('Axes — axis-discriminator consistency', () => {
  it('every entry under Axes.scale has axis === "scale"', () => {
    for (const entry of Object.values(Axes.scale)) {
      expect(entry.axis).toBe('scale');
    }
  });

  it('every entry under Axes.force has axis === "force"', () => {
    for (const entry of Object.values(Axes.force)) {
      expect(entry.axis).toBe('force');
    }
  });

  it('every entry under Axes.symmetry has axis === "symmetry"', () => {
    for (const entry of Object.values(Axes.symmetry)) {
      expect(entry.axis).toBe('symmetry');
    }
  });

  it('every entry under Axes.information has axis === "information"', () => {
    for (const entry of Object.values(Axes.information)) {
      expect(entry.axis).toBe('information');
    }
  });
});

describe('Axes — entry.name matches sub-namespace key', () => {
  it('Axes.scale.quantum.name === "quantum", etc.', () => {
    for (const [key, entry] of Object.entries(Axes.scale)) {
      expect(entry.name).toBe(key);
    }
    for (const [key, entry] of Object.entries(Axes.force)) {
      expect(entry.name).toBe(key);
    }
    for (const [key, entry] of Object.entries(Axes.symmetry)) {
      expect(entry.name).toBe(key);
    }
    for (const [key, entry] of Object.entries(Axes.information)) {
      expect(entry.name).toBe(key);
    }
  });
});

describe('Axes — census matches Phase 0 Task 0.1', () => {
  it('Axes.scale has 4 entries', () => {
    expect(Object.keys(Axes.scale)).toHaveLength(4);
    expect(Object.keys(Axes.scale).sort()).toEqual(
      ['classical', 'cosmological', 'mesoscopic', 'quantum'],
    );
  });

  it('Axes.force has 5 entries (including emergent)', () => {
    expect(Object.keys(Axes.force)).toHaveLength(5);
    expect(Object.keys(Axes.force).sort()).toEqual(
      ['electromagnetic', 'emergent', 'gravitational', 'strong', 'weak'],
    );
  });

  it('Axes.symmetry has 5 entries (Eve-M1: not 4+placeholder)', () => {
    expect(Object.keys(Axes.symmetry)).toHaveLength(5);
    expect(Object.keys(Axes.symmetry).sort()).toEqual(
      ['conformal', 'emergent', 'gauge', 'poincare', 'susy'],
    );
  });

  it('Axes.information has 4 entries', () => {
    expect(Object.keys(Axes.information)).toHaveLength(4);
    expect(Object.keys(Axes.information).sort()).toEqual(
      ['kolmogorov', 'quantumDiscord', 'shannon', 'vonNeumann'],
    );
  });

  it('total enumerable axis values is 18 (4 + 5 + 5 + 4)', () => {
    const total =
      Object.keys(Axes.scale).length +
      Object.keys(Axes.force).length +
      Object.keys(Axes.symmetry).length +
      Object.keys(Axes.information).length;
    expect(total).toBe(18);
  });
});

describe('Axes — identity across distinct axes (Decision #4 fan-out)', () => {
  it('two namespace entries with the same name string have DIFFERENT ids', () => {
    // Force.emergent and Symmetry.emergent share the .name 'emergent'
    // but are distinct physics axes; their ids must differ.
    expect(Axes.force.emergent.id).not.toBe(Axes.symmetry.emergent.id);
  });

  it('two registry reads of the same entry have the SAME id (singleton)', () => {
    const first = Axes.scale.classical.id;
    const second = Axes.scale.classical.id;
    expect(first).toBe(second);
  });
});
