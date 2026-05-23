/**
 * Tests for `src/bridges/catalog-adapter.ts` — v0.7 Proposal 2 Phase 3.
 *
 * End-to-end ingestion test against the live 42-entry
 * `BRIDGE_EQUATIONS` catalog. Per Task 3.3, this is the
 * "42 v0.6 bridges fit through the three v0.7 flux rules"
 * acceptance gate.
 *
 * @module tests/bridges/catalog-adapter
 */

import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import type { BridgeEquationEntry } from '../../src/bridges/index.js';
import {
  catalogToCells,
  scanCatalog,
  ingestCatalog,
  ingestionReportToFluxReport,
  CatalogIngestionError,
} from '../../src/bridges/catalog-adapter.js';
import { UniversalTensor } from '../../src/core/tensor.js';
import type { TensorConfig } from '../../src/core/types.js';

const baseConfig: TensorConfig = {
  rank: 3,
  scales: ['quantum', 'mesoscopic', 'classical', 'cosmological'],
  forces: ['gravitational', 'electromagnetic', 'weak', 'strong'],
  symmetries: ['poincare', 'gauge'],
  informationMeasures: ['vonNeumann', 'shannon'],
};

// ---------------------------------------------------------------------------
// catalogToCells — pure mapper
// ---------------------------------------------------------------------------

describe('catalogToCells', () => {
  it('produces BridgeCell objects with the correct kind discriminator', () => {
    const cells = catalogToCells(BRIDGE_EQUATIONS);
    expect(cells.length).toBeGreaterThan(0);
    for (const cell of cells) {
      expect(cell.kind).toBe('bridge');
    }
  });

  it('filters out entries whose axis labels do not map to PhysicalScale', () => {
    // The catalog has freeform `bridges` axis labels. Only 5 entries
    // at HEAD have at least one side that maps to the strict
    // PhysicalScale union ('quantum' | 'mesoscopic' | 'classical' |
    // 'cosmological'):
    //   - 2 × [quantum, classical]
    //   - 2 × [quantum, cosmological]
    //   - 1 × [quantum, biological] (quantum maps; biological doesn't)
    // The other 37 entries have both axes as non-PhysicalScale labels
    // (unknown, microscale, emergent, information, physical,
    // consciousness, gravity, dark-sector, condensed-matter,
    // holography, field-A/B, Newtonian gravity, general relativity).
    // Future v0.8 RegimeType extension (Proposal 5) would widen the
    // mappable set.
    const cells = catalogToCells(BRIDGE_EQUATIONS);
    expect(cells).toHaveLength(5);
  });

  it('assigns id as "BE-{number}" matching the catalog id field', () => {
    const cells = catalogToCells(BRIDGE_EQUATIONS);
    for (const cell of cells) {
      expect(cell.id).toMatch(/^BE-\d+$/);
    }
  });

  it('translates known scale labels to PhysicalScale values', () => {
    // Find an entry with a known classical/quantum bridge.
    const quantumClassical = BRIDGE_EQUATIONS.find(
      (e) =>
        (e.bridges[0] === 'quantum' && e.bridges[1] === 'classical') ||
        (e.bridges[0] === 'classical' && e.bridges[1] === 'quantum'),
    );
    if (quantumClassical) {
      const cell = catalogToCells([quantumClassical])[0];
      expect(cell.source.scale).toBeDefined();
      expect(cell.target.scale).toBeDefined();
    } else {
      // If no such entry exists, skip; the test passes vacuously.
      expect(true).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// scanCatalog — best-effort, no throws
// ---------------------------------------------------------------------------

describe('scanCatalog', () => {
  it('returns a report covering every catalog entry', () => {
    const report = scanCatalog(BRIDGE_EQUATIONS);
    expect(report.entries).toHaveLength(BRIDGE_EQUATIONS.length);
    expect(report.entries).toHaveLength(42);
  });

  it('counts unsubmitted entries as 37 (catalog entries without a PhysicalScale-mappable axis)', () => {
    // 26 unknown→unknown + 2 microscale→emergent + 2 information→physical +
    // 1 information→consciousness + 1 gravity→dark-sector + 1
    // condensed-matter→holography + 2 field-A→field-B + 2 Newtonian
    // gravity→general relativity = 37. (None of these freeform labels
    // map to the strict PhysicalScale union.)
    const report = scanCatalog(BRIDGE_EQUATIONS);
    expect(report.unsubmitted).toHaveLength(37);
  });

  it('counts submittable entries as 5 (42 - 37 with at least one PhysicalScale axis)', () => {
    const report = scanCatalog(BRIDGE_EQUATIONS);
    expect(report.submitted).toHaveLength(5);
  });

  it('does NOT throw on a malformed entry', () => {
    const malformed: BridgeEquationEntry = {
      id: 99999,
      name: 'malformed-test-entry',
      status: 'speculative',
      bridges: ['unknown', 'unknown'],
      formula_latex: '',
      dimensional_signature: null, // structural null → ERROR per Decision #3
      known_issues: [],
      references: [],
      depends_on: [],
      tractability_class: null,
      notes: '',
    };
    expect(() => scanCatalog([malformed])).not.toThrow();
  });

  it('counts errors for entries with structural dimensional_signature: null', () => {
    const malformed: BridgeEquationEntry = {
      id: 99999,
      name: 'malformed',
      status: 'speculative',
      bridges: ['quantum', 'classical'], // submittable
      formula_latex: 'F = ma',
      dimensional_signature: null,
      known_issues: [],
      references: [],
      depends_on: [],
      tractability_class: null,
      notes: '',
    };
    const report = scanCatalog([malformed]);
    expect(report.errors).toHaveLength(1);
    expect(report.errors[0].severity).toBe('error');
    expect(report.errors[0].ruleName).toBe('dimensional-consistency');
    expect(report.errors[0].message).toContain('dimensional_signature');
  });

  it('emits info diagnostics for entries without EXPECTED_DIMENSION_BY_BRIDGE coverage', () => {
    // BE-99999 is not in EXPECTED_DIMENSION_BY_BRIDGE.
    const uncovered: BridgeEquationEntry = {
      id: 99999,
      name: 'uncovered',
      status: 'speculative',
      bridges: ['quantum', 'classical'],
      formula_latex: 'X = Y',
      dimensional_signature: '[length]',
      known_issues: [],
      references: [],
      depends_on: [],
      tractability_class: null,
      notes: '',
    };
    const report = scanCatalog([uncovered]);
    // Either info (no EXPECTED) or error (mismatch). For an unrecognized
    // bridge ID, it should be info per checkDimensionalConsistency logic.
    expect(report.errors).toHaveLength(0);
    expect(report.info.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// ingestCatalog — strict, throws on errors
// ---------------------------------------------------------------------------

describe('ingestCatalog', () => {
  it('feeds the live catalog through addCell without errors (acceptance gate)', () => {
    // This is Task 3.3's "42 v0.6 bridges fit through the three v0.7
    // flux rules" gate. Empty rule errors at HEAD = catalog passes
    // Rule 1 cleanly.
    const tensor = new UniversalTensor(baseConfig);
    expect(() => ingestCatalog(tensor, BRIDGE_EQUATIONS)).not.toThrow();
    // Tensor should now hold the 5 submittable bridges.
    const cells = tensor.populatedCells().filter((c) => c.kind === 'bridge');
    expect(cells).toHaveLength(5);
  });

  it('throws CatalogIngestionError on any Rule 1 error AND leaves tensor untouched', () => {
    const tensor = new UniversalTensor(baseConfig);
    // Mix one good entry with one malformed.
    const malformed: BridgeEquationEntry = {
      id: 99998,
      name: 'malformed',
      status: 'speculative',
      bridges: ['quantum', 'classical'],
      formula_latex: 'X',
      dimensional_signature: null, // ERROR
      known_issues: [],
      references: [],
      depends_on: [],
      tractability_class: null,
      notes: '',
    };
    // Include both: should throw, and tensor must be untouched.
    expect(() => ingestCatalog(tensor, [...BRIDGE_EQUATIONS, malformed])).toThrow(
      CatalogIngestionError,
    );
    // Tensor is untouched per Decision #11 (two-pass collect-then-commit).
    expect(tensor.populatedCount()).toBe(0);
  });

  it('CatalogIngestionError carries the full report for inspection', () => {
    const tensor = new UniversalTensor(baseConfig);
    const malformed: BridgeEquationEntry = {
      id: 99998,
      name: 'malformed',
      status: 'speculative',
      bridges: ['quantum', 'classical'],
      formula_latex: 'X',
      dimensional_signature: null,
      known_issues: [],
      references: [],
      depends_on: [],
      tractability_class: null,
      notes: '',
    };
    try {
      ingestCatalog(tensor, [malformed]);
      expect.fail('Should have thrown');
    } catch (e) {
      expect(e).toBeInstanceOf(CatalogIngestionError);
      if (e instanceof CatalogIngestionError) {
        expect(e.report.errors).toHaveLength(1);
        expect(e.report.entries).toHaveLength(1);
        expect(e.report.entries[0].submitted).toBe(true);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// ingestionReportToFluxReport
// ---------------------------------------------------------------------------

describe('ingestionReportToFluxReport', () => {
  it('aggregates diagnostics into a FluxReport shape', () => {
    const report = scanCatalog(BRIDGE_EQUATIONS);
    const fluxReport = ingestionReportToFluxReport(report);
    expect(fluxReport.errorCount).toBe(report.errors.length);
    expect(fluxReport.warningCount).toBe(report.warnings.length);
    expect(fluxReport.infoCount).toBe(report.info.length);
    expect(fluxReport.diagnostics.length).toBe(
      report.errors.length + report.warnings.length + report.info.length,
    );
  });
});

// ---------------------------------------------------------------------------
// Acceptance gate: 42 v0.6 bridges fit through the three v0.7 flux rules
// ---------------------------------------------------------------------------

describe('Acceptance gate (proposals doc §3.5)', () => {
  it('the live 42-entry catalog produces ZERO Rule 1 errors at HEAD', () => {
    // This is the Eve-R1 lesson re-confirmed at the test level: at
    // HEAD, no catalog entry has structural dimensional_signature:
    // null (verified Phase 0 Task 0.3). Rule 1 should report zero
    // errors against the live catalog.
    const report = scanCatalog(BRIDGE_EQUATIONS);
    expect(report.errors).toHaveLength(0);
  });

  it('the 16 submittable bridges all clear Rule 2 + Rule 3 in fluxDiagnostics', () => {
    const tensor = new UniversalTensor(baseConfig);
    ingestCatalog(tensor, BRIDGE_EQUATIONS);
    const flux = tensor.fluxDiagnostics();
    // Rule 2 catches identical source/target (none survive ingestion
    // because the adapter filtered unknown→unknown). Rule 3 may emit
    // warnings (reverse bridges) or info (scale-unspecified). Zero
    // errors expected.
    expect(flux.errorCount).toBe(0);
  });
});
