/**
 * The extensible axis registry — union↔registry sync + the derived gate list.
 * @module tests/composition/axes
 */
import { describe, it, expect } from 'vitest';
import {
  AXES,
  GATE_AXES,
  type ScaleAxis,
  type ForceAxis,
  type InformationAxis,
  type SymmetryAxis,
  type TopologyAxis,
  type StatisticsAxis,
} from '../../src/composition/axes.js';

// Compile-time proof the unions and the registry values agree: each of these
// arrays is typed as the union[], so a value not in the union fails tsc, and a
// missing value makes the length assertion below fail.
const SCALE: readonly ScaleAxis[] = ['quantum', 'mesoscopic', 'classical', 'cosmological'];
const FORCE: readonly ForceAxis[] = ['gravitational', 'electromagnetic', 'weak', 'strong', 'emergent'];
const INFO: readonly InformationAxis[] = ['von-neumann', 'shannon', 'kolmogorov', 'discord'];
const SYM: readonly SymmetryAxis[] = ['poincare', 'gauge', 'conformal', 'susy', 'emergent'];
const TOPO: readonly TopologyAxis[] = ['trivial', 'chern', 'winding', 'z2', 'berry'];
const STAT: readonly StatisticsAxis[] = ['bosonic', 'fermionic', 'anyonic', 'parastatistic'];
const UNIONS: Record<string, readonly string[]> = {
  scale: SCALE, force: FORCE, information: INFO,
  symmetry: SYM, topology: TOPO, statistics: STAT,
};

describe('axis registry', () => {
  it('has the six classification axes (Dimension is NOT one — it is the SI system)', () => {
    expect(AXES.map((a) => a.name)).toEqual([
      'scale', 'force', 'information', 'symmetry', 'topology', 'statistics',
    ]);
  });

  it('each axis value set matches its typed union exactly (no drift)', () => {
    for (const a of AXES) {
      expect([...a.values].sort()).toEqual([...UNIONS[a.name]].sort());
      expect(a.values.length).toBeGreaterThan(0);
      expect(new Set(a.values).size).toBe(a.values.length); // unique
    }
  });

  it('GATE_AXES is exactly the gated axes (scale, force) — new axes start ungated', () => {
    expect(GATE_AXES).toEqual(['scale', 'force']);
    for (const name of ['information', 'symmetry', 'topology', 'statistics']) {
      expect(AXES.find((a) => a.name === name)?.gated).toBe(false);
    }
  });
});
