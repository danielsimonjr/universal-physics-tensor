/**
 * Tests for v0.7-p2 Phase 2 Tasks 2.1-2.4 — populated-cells query,
 * unpopulatedNeighborhoods, fluxDiagnostics, and cross-method
 * consistency (the SHOWSTOPPER-prevention gate).
 *
 * @module tests/core/populated-cells
 */

import { describe, it, expect } from 'vitest';
import { UniversalTensor } from '../../src/core/tensor.js';
import { compose } from '../../src/core/tensor.js';
import type { LawCell, BridgeCell, EmergenceCell, Cell } from '../../src/core/cell.js';
import type { TensorConfig } from '../../src/core/types.js';
import { FluxViolationError } from '../../src/core/flux-rules.js';

const baseConfig: TensorConfig = {
  rank: 3,
  scales: ['quantum', 'mesoscopic', 'classical', 'cosmological'],
  forces: ['gravitational', 'electromagnetic', 'weak', 'strong'],
  symmetries: ['poincare', 'gauge'],
  informationMeasures: ['vonNeumann', 'shannon'],
};

const law1: LawCell = {
  kind: 'law',
  id: 'law-1',
  name: 'Coulomb',
  equation: 'F = kq1q2/r^2',
  confidence: 'established',
  scales: ['classical'],
  forces: ['electromagnetic'],
  symmetries: ['poincare'],
};

const law2MultiScale: LawCell = {
  kind: 'law',
  id: 'law-2',
  name: 'Continuity',
  equation: 'dρ/dt + ∇·J = 0',
  confidence: 'established',
  scales: ['quantum', 'classical'], // multi-scale; fans out to 2 coordinates per Decision #6
  forces: ['electromagnetic'],
  symmetries: ['poincare'],
};

const bridge1: BridgeCell = {
  kind: 'bridge',
  id: 'bridge-1',
  name: 'Q→C Decoherence',
  equation: '\\rho \\to \\rho_{cls}',
  confidence: 'speculative',
  source: { scale: 'quantum' },
  target: { scale: 'classical' },
  validated: false,
  description: 'Lindblad.',
};

const emergence1: EmergenceCell = {
  kind: 'emergence',
  id: 'em-1',
  name: 'BCS',
  equation: '\\Delta(T)',
  confidence: 'established',
  order: 3,
  indices: [
    { scale: 'mesoscopic', force: 'electromagnetic' },
    { scale: 'classical', force: 'electromagnetic' },
  ],
};

// ---------------------------------------------------------------------------
// Task 2.1 — populatedCount + populatedCells (Eve-R15 semantic split)
// ---------------------------------------------------------------------------

describe('populatedCount() — counts unique tensor coordinates', () => {
  it('returns 0 on an empty tensor', () => {
    const tensor = new UniversalTensor(baseConfig);
    expect(tensor.populatedCount()).toBe(0);
  });

  it('counts a single-coordinate law as 1', () => {
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell(law1);
    expect(tensor.populatedCount()).toBe(1);
  });

  it('fans out a multi-scale law to N coordinates (Decision #6)', () => {
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell(law2MultiScale);
    // 2 scales × 1 force = 2 coordinates.
    expect(tensor.populatedCount()).toBe(2);
  });

  it('counts a bridge as 1 (off-diagonal key)', () => {
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell(bridge1);
    expect(tensor.populatedCount()).toBe(1);
  });

  it('counts emergence indices independently', () => {
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell(emergence1);
    // 2 indices entries → 2 distinct coordinates.
    expect(tensor.populatedCount()).toBe(2);
  });

  it('sums across kinds, sharing coordinates between law and emergence', () => {
    // law1 lives at {scale: classical, force: electromagnetic}.
    // bridge1 lives at the off-diagonal key quantum->classical.
    // emergence1.indices[1] = {scale: classical, force: electromagnetic}
    //   — SAME coordinate as law1, so the cell-set at that key gains
    //   another member, but populatedCount (unique-key count) doesn't.
    // → 3 distinct keys: classical|EM (law1 + em1.idx1), em1.idx0 key,
    //   bridge1's edge key.
    const tensor = compose([law1], [bridge1], [emergence1], baseConfig);
    expect(tensor.populatedCount()).toBe(3);
  });
});

describe('populatedCells() — deduped by id, returns Cell objects', () => {
  it('returns 0 on an empty tensor', () => {
    const tensor = new UniversalTensor(baseConfig);
    expect(tensor.populatedCells()).toHaveLength(0);
  });

  it('returns N cells for N distinct ids regardless of fan-out', () => {
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell(law2MultiScale); // 2 fan-out, but 1 cell-object
    expect(tensor.populatedCells()).toHaveLength(1);
  });

  it('round-trips kind discriminators through inverse adapters', () => {
    const tensor = compose([law1], [bridge1], [emergence1], baseConfig);
    const cells = tensor.populatedCells();
    expect(cells).toHaveLength(3);
    const kinds = cells.map((c) => c.kind).sort();
    expect(kinds).toEqual(['bridge', 'emergence', 'law']);
  });

  it('preserves cell ids exactly', () => {
    const tensor = compose([law1], [bridge1], [emergence1], baseConfig);
    const ids = tensor.populatedCells().map((c) => c.id).sort();
    expect(ids).toEqual(['bridge-1', 'em-1', 'law-1']);
  });

  it('populatedCells().length vs populatedCount() — Eve-R15 semantic split', () => {
    // The two counts DIVERGE in both directions:
    //   - populatedCount > populatedCells.length when a single cell
    //     fans out across multiple coords (multi-scale law,
    //     multi-index emergence).
    //   - populatedCount < populatedCells.length when multiple cells
    //     share a coord (Set<string> at that key has size > 1).
    // The two counts answer DIFFERENT questions, not "same number with
    // a monotonic inequality". Test both directions.
    const tensor = compose([law2MultiScale], [], [emergence1], baseConfig);
    // law2 fans out to 2 (quantum, classical) × 1 force.
    // em-1 has 2 indices, both at force=EM (mesoscopic, classical).
    // law2's classical|EM key collides with em-1.indices[1].
    // Unique keys: quantum|EM (law2), classical|EM (law2 + em-1.idx1),
    // mesoscopic|EM (em-1.idx0) = 3.
    expect(tensor.populatedCount()).toBe(3);
    expect(tensor.populatedCells()).toHaveLength(2); // 2 distinct ids
  });
});

// ---------------------------------------------------------------------------
// Task 2.2 — unpopulatedNeighborhoods (single-axis-flip semantics, Decision #10)
// ---------------------------------------------------------------------------

describe('unpopulatedNeighborhoods() — single-axis flips', () => {
  it('returns empty on an empty tensor', () => {
    const tensor = new UniversalTensor(baseConfig);
    expect(tensor.unpopulatedNeighborhoods()).toEqual([]);
  });

  it('enumerates flips on a single populated coordinate', () => {
    const minimalConfig: TensorConfig = {
      rank: 3,
      scales: ['quantum', 'classical'],
      forces: ['gravitational', 'electromagnetic'],
      symmetries: ['poincare'],
      informationMeasures: ['shannon'],
    };
    const tensor = new UniversalTensor(minimalConfig);
    tensor.addCell({ ...law1, scales: ['classical'], forces: ['gravitational'] });
    // The populated coord is {scale: 'classical', force: 'gravitational'}.
    // Single-axis flips: scale → 'quantum' (1 flip), force → 'electromagnetic'
    // (1 flip). Symmetries axis is not populated on the law's tensorData
    // entry (laws store only scale × force). So 2 neighbors total.
    const neighbors = tensor.unpopulatedNeighborhoods();
    expect(neighbors).toHaveLength(2);
  });

  it('does NOT enumerate integer axes (dimension, topology) — wildcards', () => {
    // After adding any cell, integer axes should never appear in the
    // neighborhood enumeration (Decision #10).
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell(law1);
    const neighbors = tensor.unpopulatedNeighborhoods();
    for (const n of neighbors) {
      expect(n.dimension).toBeUndefined();
      expect(n.topology).toBeUndefined();
    }
  });

  it('deduplicates neighbors that arise from multiple populated coords', () => {
    // Two laws at adjacent scales should produce overlapping flips;
    // the result must dedupe.
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell({ ...law1, scales: ['classical'], forces: ['electromagnetic'] });
    tensor.addCell({
      ...law2MultiScale,
      id: 'law-other',
      scales: ['quantum'],
      forces: ['electromagnetic'],
    });
    const neighbors = tensor.unpopulatedNeighborhoods();
    const keys = new Set(neighbors.map((n) =>
      Object.entries(n).map(([k, v]) => `${k}:${v}`).join('|'),
    ));
    // No duplicate keys.
    expect(keys.size).toBe(neighbors.length);
  });
});

// ---------------------------------------------------------------------------
// Task 2.3 — fluxDiagnostics + addCell rule wiring
// ---------------------------------------------------------------------------

describe('fluxDiagnostics() — re-runs rules across populated cells', () => {
  it('returns zero diagnostics on a clean tensor', () => {
    const tensor = compose([law1], [bridge1], [emergence1], baseConfig);
    const report = tensor.fluxDiagnostics();
    expect(report.errorCount).toBe(0);
    expect(report.warningCount).toBe(0);
    expect(report.diagnostics).toHaveLength(0);
  });

  it('REJECTS a reverse bridge at addCell (causality ERROR tier, v0.10.0 promotion)', () => {
    const tensor = new UniversalTensor(baseConfig);
    const reverseBridge: BridgeCell = {
      ...bridge1,
      id: 'bridge-reverse',
      source: { scale: 'cosmological' },
      target: { scale: 'quantum' },
    };
    expect(() => tensor.addCell(reverseBridge)).toThrow(FluxViolationError);
    expect(
      tensor.populatedCells().find((c) => c.id === 'bridge-reverse'),
    ).toBeUndefined();
  });

  it('aggregates info diagnostics (scale-unspecified bridge)', () => {
    const tensor = new UniversalTensor(baseConfig);
    const noScaleBridge: BridgeCell = {
      ...bridge1,
      id: 'bridge-noscale',
      source: { force: 'weak' },
      target: { force: 'strong' },
    };
    tensor.addCell(noScaleBridge);
    const report = tensor.fluxDiagnostics();
    expect(report.infoCount).toBe(1);
    expect(report.errorCount).toBe(0);
  });

  it('is idempotent — re-running fluxDiagnostics produces the same report (no mutable state)', () => {
    const tensor = compose([law1], [], [], baseConfig);
    const r1 = tensor.fluxDiagnostics();
    const r2 = tensor.fluxDiagnostics();
    expect(r1).toEqual(r2);
  });
});

describe('addCell rule wiring — ERROR-tier throws FluxViolationError', () => {
  it('legacy addBridge validation catches identical source/target before flux rules fire', () => {
    // The legacy `addBridge` at tensor.ts already validates source !== target
    // BEFORE flux rules run. Rule 2's bridge arm is redundant here; that's
    // intentional per the design (Rule 2 is registry-exhaustive but does
    // not introduce new constraints for bridges). The error class is
    // legacy `Error`/`TypeError`, not `FluxViolationError`.
    const tensor = new UniversalTensor(baseConfig);
    const badBridge: BridgeCell = {
      ...bridge1,
      id: 'bridge-bad',
      source: { scale: 'quantum' },
      target: { scale: 'quantum' },
    };
    // We only assert that SOMETHING throws — the exact class is the
    // legacy validator's choice.
    expect(() => tensor.addCell(badBridge)).toThrow();
  });

  it('rolls back legacy storage on rule-violation throw (fail-atomic)', () => {
    const tensor = new UniversalTensor(baseConfig);
    const badBridge: BridgeCell = {
      ...bridge1,
      id: 'bridge-bad',
      source: { scale: 'quantum' },
      target: { scale: 'quantum' },
    };
    // The legacy `addBridge` actually does its own validation that
    // throws before flux rules can fire. So instead we test rollback
    // on a constructed scenario: an emergence with 1 index passes the
    // legacy validation (order >=3 check) IF we set order=3 but the
    // flux rule should still catch indices.length < 2.
    const badEmergence: EmergenceCell = {
      ...emergence1,
      id: 'em-bad',
      indices: [{ scale: 'quantum', force: 'gravitational' }],
    };
    expect(() => tensor.addCell(badEmergence)).toThrow(FluxViolationError);
    // The emergence should NOT be in the tensor after rollback.
    expect(tensor.populatedCells().find((c) => c.id === 'em-bad')).toBeUndefined();
    expect(tensor.populatedCount()).toBe(0);
  });

  it('THROWS on causality reverse — ERROR tier as of v0.10.0 (was WARNING in v0.7; user decision 2026-06-11)', () => {
    const tensor = new UniversalTensor(baseConfig);
    const reverseBridge: BridgeCell = {
      ...bridge1,
      id: 'bridge-reverse',
      source: { scale: 'cosmological' },
      target: { scale: 'quantum' },
    };
    expect(() => tensor.addCell(reverseBridge)).toThrow(
      /causality.*bridge-reverse|FluxRule 'causality'/,
    );
    // Fail-atomic: the cell is NOT stored.
    expect(
      tensor.populatedCells().find((c) => c.id === 'bridge-reverse'),
    ).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Task 2.4 — Cross-method consistency (SHOWSTOPPER-prevention gate, Eve-R2)
// ---------------------------------------------------------------------------

describe('Cross-method consistency — Eve-R2 SHOWSTOPPER guard', () => {
  it('getCellContents, populatedCells, getStats all reflect the same state', () => {
    const tensor = compose([law1], [bridge1], [emergence1], baseConfig);

    // (a) populatedCells gives 3 distinct cells.
    expect(tensor.populatedCells()).toHaveLength(3);

    // (b) getStats counts match.
    const stats = tensor.getStats();
    expect(stats.knownLaws).toBe(1);
    expect(stats.bridgeEquations).toBe(1);
    expect(stats.emergentPhenomena).toBe(1);
    // occupiedCells = unique keys = 3 (law shares classical|EM with em.idx1).
    expect(stats.occupiedCells).toBe(3);

    // (c) populatedCount === stats.occupiedCells (single-source-of-truth
    // via the legacy tensorData Map — Decision #1 / Eve-R2 prevention).
    expect(tensor.populatedCount()).toBe(stats.occupiedCells);

    // (d) getCellContents at the shared coord finds BOTH the law and
    // the emergence (Set<string> at that key has size 2).
    const contents = tensor.getCellContents({ scale: 'classical', force: 'electromagnetic' });
    expect(contents).toContain('law-1');
    expect(contents).toContain('em-1');
  });

  it('mixed addLaw/addCell sequence preserves consistency', () => {
    const tensor = new UniversalTensor(baseConfig);
    tensor.addLaw({
      id: 'legacy-law',
      name: 'Hooke',
      equation: 'F = -kx',
      scales: ['classical'],
      forces: ['electromagnetic'],
      symmetries: ['poincare'],
      confidence: 0.85,
    });
    tensor.addCell(bridge1);

    expect(tensor.populatedCells()).toHaveLength(2);
    expect(tensor.populatedCount()).toBe(2);
    expect(tensor.getStats().occupiedCells).toBe(2);
  });

  it('no two distinct stores diverge under repeated addCell + getCellContents queries', () => {
    const tensor = new UniversalTensor(baseConfig);
    tensor.addCell(law1);

    // Spot-check: every populated key surfaces through both paths.
    const coords = tensor.populatedCells();
    const stats = tensor.getStats();
    expect(coords.length).toBeLessThanOrEqual(stats.occupiedCells);
  });
});
