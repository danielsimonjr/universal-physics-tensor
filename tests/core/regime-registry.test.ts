/**
 * Tests for `src/core/regime-registry.ts` — v0.8 Proposal 5.
 *
 * Covers Phase 1 (defineRegime, lookupRegime, listRegimesByAxis,
 * provenanceFor), Phase 2 (built-in registrations), Phase 3
 * (per-axis convenience APIs), and Phase 4 (attachRegimesToCell +
 * regime-consistency rule wiring).
 *
 * Per P5 Eve-L1: idempotent re-registration is allowed (same spec
 * is a no-op); mismatched specs throw RegimeCollisionError.
 *
 * @module tests/core/regime-registry
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  defineRegime,
  lookupRegime,
  listRegimesByAxis,
  provenanceFor,
  attachRegimesToCell,
  getCellRegimes,
  defineScale,
  defineForce,
  defineSymmetry,
  defineInformation,
  defineDimension,
  defineTopology,
  RegimeCollisionError,
  _resetRegistryForTesting,
} from '../../src/core/regime-registry.js';
import '../../src/core/regimes-builtins.js'; // Side-effect: registers 18 built-ins
import '../../src/core/regime-rule-install.js'; // Side-effect: installs Rule 4

describe('Phase 1 — defineRegime / lookupRegime', () => {
  it('registers a new regime under (axis, tag)', () => {
    defineRegime({
      axis: 'scale',
      tag: 'planck',
      displayName: 'Planck (< 10^-35 m)',
      provenance: { registeredBy: 'test' },
    });
    const r = lookupRegime('scale', 'planck');
    expect(r).toBeDefined();
    expect(r?.displayName).toBe('Planck (< 10^-35 m)');
  });

  it('returns undefined for unknown (axis, tag)', () => {
    expect(lookupRegime('scale', 'nonexistent')).toBeUndefined();
  });

  it('is idempotent for identical re-registration (Eve-L1)', () => {
    const a = defineRegime({
      axis: 'force',
      tag: 'magneto-electric',
      displayName: 'Magneto-electric',
      provenance: { registeredBy: 'test-mod' },
    });
    const b = defineRegime({
      axis: 'force',
      tag: 'magneto-electric',
      displayName: 'Magneto-electric',
      provenance: { registeredBy: 'test-mod' },
    });
    expect(a).toBe(b); // same canonical object reference
  });

  it('throws RegimeCollisionError on (axis, tag) mismatch (Eve-L1)', () => {
    defineRegime({
      axis: 'force',
      tag: 'tachyonic',
      displayName: 'Tachyonic',
      provenance: { registeredBy: 'mod-A' },
    });
    expect(() => defineRegime({
      axis: 'force',
      tag: 'tachyonic',
      displayName: 'Different name',
      provenance: { registeredBy: 'mod-B' },
    })).toThrow(RegimeCollisionError);
  });

  it('fills in registeredAt timestamp when omitted', () => {
    const r = defineRegime({
      axis: 'symmetry',
      tag: 'crystallographic',
      displayName: 'Crystallographic',
      provenance: { registeredBy: 'test' },
    });
    expect(r.provenance.registeredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});

describe('Phase 1 — listRegimesByAxis + provenanceFor', () => {
  it('lists every regime registered under an axis', () => {
    const scales = listRegimesByAxis('scale');
    // Built-ins shipped 4 scales (quantum, mesoscopic, classical, cosmological).
    expect(scales.length).toBeGreaterThanOrEqual(4);
    expect(scales.map((r) => r.tag)).toContain('quantum');
  });

  it('returns provenance via provenanceFor helper', () => {
    const p = provenanceFor('scale', 'quantum');
    expect(p).toBeDefined();
    expect(p?.registeredBy).toBe('universal-physics-tensor');
  });

  it('returns undefined provenance for unknown regime', () => {
    expect(provenanceFor('scale', 'nonexistent-tag')).toBeUndefined();
  });
});

describe('Phase 2 — built-in registrations (regimes-builtins.ts side effect)', () => {
  it('pre-registers 4 scales', () => {
    const scales = listRegimesByAxis('scale').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor');
    expect(scales.map((r) => r.tag).sort()).toEqual(
      ['classical', 'cosmological', 'mesoscopic', 'quantum'],
    );
  });

  it('pre-registers 5 forces', () => {
    const forces = listRegimesByAxis('force').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor');
    expect(forces.map((r) => r.tag).sort()).toEqual(
      ['electromagnetic', 'emergent', 'gravitational', 'strong', 'weak'],
    );
  });

  it('pre-registers 5 symmetries (Eve-M1: NOT 4+placeholder)', () => {
    const syms = listRegimesByAxis('symmetry').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor');
    expect(syms.length).toBe(5);
    expect(syms.map((r) => r.tag).sort()).toEqual(
      ['conformal', 'emergent', 'gauge', 'poincare', 'susy'],
    );
  });

  it('pre-registers 4 information measures', () => {
    const ims = listRegimesByAxis('information').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor');
    expect(ims.map((r) => r.tag).sort()).toEqual(
      ['kolmogorov', 'quantumDiscord', 'shannon', 'vonNeumann'],
    );
  });

  it('total built-in count is 18 (4 + 5 + 5 + 4) across the 4 enumerable axes', () => {
    const total =
      listRegimesByAxis('scale').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor').length +
      listRegimesByAxis('force').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor').length +
      listRegimesByAxis('symmetry').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor').length +
      listRegimesByAxis('information').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor').length;
    expect(total).toBe(18);
  });

  it('does NOT pre-register dimension or topology axes (integer wildcards)', () => {
    const dims = listRegimesByAxis('dimension').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor');
    const topos = listRegimesByAxis('topology').filter((r) => r.provenance.registeredBy === 'universal-physics-tensor');
    expect(dims).toHaveLength(0);
    expect(topos).toHaveLength(0);
  });
});

describe('Phase 3 — per-axis convenience APIs', () => {
  it('defineScale narrows the axis discriminator', () => {
    const r = defineScale({
      tag: 'sub-planck',
      displayName: 'Sub-Planck',
      provenance: { registeredBy: 'phase-3-test' },
    });
    expect(r.axis).toBe('scale');
  });

  it('defineForce, defineSymmetry, defineInformation all narrow correctly', () => {
    const f = defineForce({ tag: 'aether', displayName: 'Aether', provenance: { registeredBy: 't' } });
    const s = defineSymmetry({ tag: 'galilean', displayName: 'Galilean', provenance: { registeredBy: 't' } });
    const i = defineInformation({ tag: 'fisher', displayName: 'Fisher info', provenance: { registeredBy: 't' } });
    expect(f.axis).toBe('force');
    expect(s.axis).toBe('symmetry');
    expect(i.axis).toBe('information');
  });

  it('defineDimension + defineTopology register on integer axes', () => {
    const d = defineDimension({ tag: '11', displayName: '11D (M-theory)', provenance: { registeredBy: 't' } });
    const t = defineTopology({ tag: '2', displayName: 'Genus-2 surface', provenance: { registeredBy: 't' } });
    expect(d.axis).toBe('dimension');
    expect(t.axis).toBe('topology');
  });
});

describe('Phase 4 — attachRegimesToCell + getCellRegimes', () => {
  it('attaches regimes to a cell by id (sibling registry — Adam-M1)', () => {
    const quantumRegime = lookupRegime('scale', 'quantum')!;
    attachRegimesToCell('test-cell-1', [quantumRegime]);
    const attached = getCellRegimes('test-cell-1');
    expect(attached).toEqual([quantumRegime]);
  });

  it('returns undefined for unattached cells', () => {
    expect(getCellRegimes('never-attached')).toBeUndefined();
  });

  it('is idempotent — re-attaching same regimes is a no-op', () => {
    const r = lookupRegime('force', 'gravitational')!;
    attachRegimesToCell('idem-cell', [r]);
    attachRegimesToCell('idem-cell', [r]);
    expect(getCellRegimes('idem-cell')).toEqual([r]);
  });
});

describe('Phase 4 — regime-consistency flux rule wiring', () => {
  it('emits a WARNING diagnostic when a cell is attached to a regime not in its coords', async () => {
    const { UniversalTensor } = await import('../../src/core/tensor.js');
    const tensor = new UniversalTensor({
      rank: 3,
      scales: ['quantum', 'mesoscopic', 'classical', 'cosmological'],
      forces: ['gravitational', 'electromagnetic', 'weak', 'strong'],
      symmetries: ['poincare', 'gauge'],
    });
    // Add a classical-scale law:
    tensor.addCell({
      kind: 'law',
      id: 'mismatch-law',
      name: 'Mismatch Law',
      equation: 'F = ma',
      confidence: 'established',
      scales: ['classical'],
      forces: ['gravitational'],
      symmetries: ['poincare'],
    });
    // Attach a quantum regime — NOT in cell coords.
    const quantumRegime = lookupRegime('scale', 'quantum')!;
    attachRegimesToCell('mismatch-law', [quantumRegime]);

    const report = tensor.fluxDiagnostics();
    // Should emit a regime-consistency warning.
    const regimeDiags = report.diagnostics.filter((d) => d.ruleName === 'regime-consistency');
    expect(regimeDiags).toHaveLength(1);
    expect(regimeDiags[0].severity).toBe('warning');
    expect(regimeDiags[0].message).toContain('quantum');
  });

  it('does NOT emit when regime matches a cell coord', async () => {
    const { UniversalTensor } = await import('../../src/core/tensor.js');
    const tensor = new UniversalTensor({
      rank: 3,
      scales: ['classical'],
      forces: ['gravitational'],
    });
    tensor.addCell({
      kind: 'law',
      id: 'match-law',
      name: 'Match Law',
      equation: 'F = ma',
      confidence: 'established',
      scales: ['classical'],
      forces: ['gravitational'],
      symmetries: [],
    });
    const classicalRegime = lookupRegime('scale', 'classical')!;
    attachRegimesToCell('match-law', [classicalRegime]);

    const report = tensor.fluxDiagnostics();
    const regimeDiags = report.diagnostics.filter((d) => d.ruleName === 'regime-consistency');
    expect(regimeDiags).toHaveLength(0);
  });
});
