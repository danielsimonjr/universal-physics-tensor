import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('Public API stability (per v0.2.0-Design.md §14.3)', () => {
  it('BRIDGE_EQUATIONS[0] has the expected schema-required fields', () => {
    const sample = BRIDGE_EQUATIONS[0];
    // Schema fields that must always be present (TensorJS downstream depends on them).
    // Snapshot of the BridgeEquationEntry interface as of v0.2.0.
    expect(sample).toHaveProperty('id');
    expect(sample).toHaveProperty('name');
    expect(sample).toHaveProperty('category');
    expect(sample).toHaveProperty('category_name');
    expect(sample).toHaveProperty('bridges');
    expect(sample).toHaveProperty('status');
    expect(sample).toHaveProperty('context');
    expect(sample).toHaveProperty('formula_latex');
    expect(sample).toHaveProperty('source_part');
    expect(sample).toHaveProperty('source_section');
    expect(sample).toHaveProperty('dimensional_signature');
    expect(sample).toHaveProperty('tractability_class');
    expect(sample).toHaveProperty('notes');
    expect(sample).toHaveProperty('known_issues');
    expect(sample).toHaveProperty('references');
    expect(sample).toHaveProperty('dependencies');
  });

  it('every bridge has a non-null dimensional_signature', () => {
    for (const b of BRIDGE_EQUATIONS) {
      expect(b.dimensional_signature).not.toBeNull();
    }
  });

  it('every bridge has populated tractability_class', () => {
    for (const b of BRIDGE_EQUATIONS) {
      expect(b.tractability_class).not.toBe('undefined');
    }
  });

  it('status distribution matches v0.2.0 invariants', () => {
    const counts = BRIDGE_EQUATIONS.reduce((acc, b) => {
      acc[b.status] = (acc[b.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    expect(counts.invalid ?? 0).toBe(0);
  });
});

// v0.3.5 — the numerical-contraction backend surface. The existing block
// above pins individual schema fields with `toHaveProperty`; a module export
// surface is better pinned by enumerating its keys, so this block uses
// `toMatchSnapshot()` (Vitest writes the snapshot on first run; later runs
// diff against it — a removed/renamed export then fails loudly).
describe('Public API stability — v0.3.5 numerical surface', () => {
  it('the src/numerical/ export surface matches the snapshot', async () => {
    const numerical = await import('../../src/numerical/index.js');
    expect(Object.keys(numerical).sort()).toMatchSnapshot();
  });

  it('the root barrel re-exports the numerical surface', async () => {
    const root = await import('../../src/index.js');
    for (const name of [
      'evaluateNumerical',
      'evaluateNumericalRaw',
      'evaluateMetricInverse',
      'Float64ReferenceEngine',
      'getActiveEngine',
      'setActiveEngine',
      'NumericalBackendError',
    ]) {
      expect(name in root).toBe(true);
    }
  });
});
