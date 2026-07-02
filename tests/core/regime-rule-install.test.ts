/**
 * Tests for `src/core/regime-rule-install.ts` — Rule 4 (regime-
 * consistency) installation, v0.8 Proposal 5 Phase 4.
 *
 * `tests/core/regime-registry.test.ts` already exercises this module's
 * side effect (installing the rule) for a LawCell on the `scale` axis
 * (match + mismatch). This file covers what that file does NOT: the
 * `cellOccupiesAxisTag` switch's other 5 axes (force, symmetry,
 * information, dimension, topology) and its `bridge`/`emergence` cell
 * arms — the exhaustive per-axis-per-kind matrix documented in the
 * module's own header comment.
 *
 * Rule 4 is dispatched via `runRules(cell, V07_CELL_RULES)` directly
 * (rather than a full `UniversalTensor.addCell` round-trip) so each
 * test isolates the regime-consistency diagnostic from Rule 2/3 noise;
 * fixtures are built to pass Rule 2 (lbe-coordinate) and Rule 3
 * (causality) cleanly.
 *
 * Cleanup note: `attachRegimesToCell` has no matching "detach" — every
 * fixture below uses an `rri-`-prefixed id unique to this file, so no
 * cross-file/cross-test state collision is possible even without an
 * afterEach reset.
 *
 * @module tests/core/regime-rule-install
 */
import { describe, it, expect } from 'vitest';
import type { LawCell, BridgeCell, EmergenceCell } from '../../src/core/cell.js';
import { runRules, V07_CELL_RULES } from '../../src/core/flux-rules.js';
import {
  attachRegimesToCell,
  lookupRegime,
  defineDimension,
  defineTopology,
} from '../../src/core/regime-registry.js';
import '../../src/core/regimes-builtins.js'; // side effect: 18 built-ins (scale/force/symmetry/information)
import '../../src/core/regime-rule-install.js'; // side effect: installs Rule 4 into flux-rules.js

// Custom dimension/topology regimes (builtins deliberately skip these two
// integer axes per regimes-builtins.ts's trailing comment).
const dim4 = defineDimension({ tag: '4', displayName: '4D spacetime', provenance: { registeredBy: 'rri-test' } });
const dim11 = defineDimension({ tag: '11', displayName: '11D (M-theory)', provenance: { registeredBy: 'rri-test' } });
const topo0 = defineTopology({ tag: '0', displayName: 'Genus-0 (sphere)', provenance: { registeredBy: 'rri-test' } });
const topo2 = defineTopology({ tag: '2', displayName: 'Genus-2 surface', provenance: { registeredBy: 'rri-test' } });

function regimeDiag(cell: LawCell | BridgeCell | EmergenceCell) {
  const report = runRules(cell, V07_CELL_RULES);
  return report.diagnostics.filter((d) => d.ruleName === 'regime-consistency');
}

// ---------------------------------------------------------------------------
// LawCell — force / symmetry / information / dimension / topology axes
// ---------------------------------------------------------------------------

describe('regime-consistency (Rule 4) — LawCell, non-scale axes', () => {
  const baseLaw: LawCell = {
    kind: 'law',
    id: 'rri-law',
    name: 'Test Law',
    equation: 'E = mc^2',
    confidence: 'established',
    scales: ['classical'],
    forces: ['gravitational'],
    symmetries: ['poincare'],
    informationMeasures: ['shannon'],
    dimensions: [4],
    topologies: [0],
  };

  it('force axis: warns when the attached force tag is not in cell.forces', () => {
    const em = lookupRegime('force', 'electromagnetic')!;
    attachRegimesToCell('rri-law-force-mismatch', [em]);
    const diags = regimeDiag({ ...baseLaw, id: 'rri-law-force-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].severity).toBe('warning');
    expect(diags[0].message).toContain("'electromagnetic'");
    expect(diags[0].message).toContain("axis 'force'");
    expect(diags[0].message).toContain('electromagnetic');
  });

  it('force axis: no diagnostic when the attached tag matches cell.forces', () => {
    const grav = lookupRegime('force', 'gravitational')!;
    attachRegimesToCell('rri-law-force-match', [grav]);
    expect(regimeDiag({ ...baseLaw, id: 'rri-law-force-match' })).toHaveLength(0);
  });

  it('symmetry axis: warns on mismatch, silent on match', () => {
    const gauge = lookupRegime('symmetry', 'gauge')!;
    attachRegimesToCell('rri-law-sym-mismatch', [gauge]);
    const diags = regimeDiag({ ...baseLaw, id: 'rri-law-sym-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'symmetry'");

    const poincare = lookupRegime('symmetry', 'poincare')!;
    attachRegimesToCell('rri-law-sym-match', [poincare]);
    expect(regimeDiag({ ...baseLaw, id: 'rri-law-sym-match' })).toHaveLength(0);
  });

  it('information axis: warns on mismatch, silent on match', () => {
    const vn = lookupRegime('information', 'vonNeumann')!;
    attachRegimesToCell('rri-law-info-mismatch', [vn]);
    const diags = regimeDiag({ ...baseLaw, id: 'rri-law-info-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'information'");

    const shannon = lookupRegime('information', 'shannon')!;
    attachRegimesToCell('rri-law-info-match', [shannon]);
    expect(regimeDiag({ ...baseLaw, id: 'rri-law-info-match' })).toHaveLength(0);
  });

  it('information axis: a LawCell with no informationMeasures never matches (optional-chain false branch)', () => {
    const shannon = lookupRegime('information', 'shannon')!;
    attachRegimesToCell('rri-law-info-absent', [shannon]);
    const lawNoInfo: LawCell = { ...baseLaw, id: 'rri-law-info-absent', informationMeasures: undefined };
    const diags = regimeDiag(lawNoInfo);
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'information'");
  });

  it('dimension axis: warns on mismatch, silent on match (numeric dims compared via String())', () => {
    attachRegimesToCell('rri-law-dim-mismatch', [dim11]);
    const diags = regimeDiag({ ...baseLaw, id: 'rri-law-dim-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'dimension'");
    expect(diags[0].message).toContain("'11'");

    attachRegimesToCell('rri-law-dim-match', [dim4]);
    expect(regimeDiag({ ...baseLaw, id: 'rri-law-dim-match' })).toHaveLength(0);
  });

  it('topology axis: warns on mismatch, silent on match', () => {
    attachRegimesToCell('rri-law-topo-mismatch', [topo2]);
    const diags = regimeDiag({ ...baseLaw, id: 'rri-law-topo-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'topology'");

    attachRegimesToCell('rri-law-topo-match', [topo0]);
    expect(regimeDiag({ ...baseLaw, id: 'rri-law-topo-match' })).toHaveLength(0);
  });

  it('reports only the FIRST mismatch when multiple regimes mismatch', () => {
    const em = lookupRegime('force', 'electromagnetic')!;
    const gauge = lookupRegime('symmetry', 'gauge')!;
    attachRegimesToCell('rri-law-multi-mismatch', [em, gauge]);
    const diags = regimeDiag({ ...baseLaw, id: 'rri-law-multi-mismatch' });
    expect(diags).toHaveLength(1); // ok:true tier — WARNING never aggregates beyond one diagnostic
    expect(diags[0].message).toContain("'electromagnetic'"); // mismatches[0]
  });

  it('no diagnostic when no regimes are attached at all', () => {
    // rri-law-unattached is never passed to attachRegimesToCell.
    expect(regimeDiag({ ...baseLaw, id: 'rri-law-unattached' })).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// BridgeCell — source/target OR-match semantics, all 6 axes
// ---------------------------------------------------------------------------

describe('regime-consistency (Rule 4) — BridgeCell', () => {
  const baseBridge: BridgeCell = {
    kind: 'bridge',
    id: 'rri-bridge',
    name: 'Test Bridge',
    equation: 'A \\to B',
    confidence: 'speculative',
    source: { scale: 'quantum', force: 'weak', symmetry: 'gauge', information: 'shannon', dimension: 4, topology: 0 },
    target: { scale: 'classical' },
    validated: false,
    description: 'd',
  };

  it('force axis: matches via source.force even when target.force is unset', () => {
    const weak = lookupRegime('force', 'weak')!;
    attachRegimesToCell('rri-bridge-force-match', [weak]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-force-match' })).toHaveLength(0);
  });

  it('force axis: warns when neither source nor target force matches', () => {
    const strong = lookupRegime('force', 'strong')!;
    attachRegimesToCell('rri-bridge-force-mismatch', [strong]);
    const diags = regimeDiag({ ...baseBridge, id: 'rri-bridge-force-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'force'");
  });

  it('symmetry / information / dimension / topology axes: match via source, mismatch when absent from both', () => {
    const gauge = lookupRegime('symmetry', 'gauge')!;
    attachRegimesToCell('rri-bridge-sym-match', [gauge]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-sym-match' })).toHaveLength(0);

    const susy = lookupRegime('symmetry', 'susy')!;
    attachRegimesToCell('rri-bridge-sym-mismatch', [susy]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-sym-mismatch' })).toHaveLength(1);

    const shannon = lookupRegime('information', 'shannon')!;
    attachRegimesToCell('rri-bridge-info-match', [shannon]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-info-match' })).toHaveLength(0);

    attachRegimesToCell('rri-bridge-dim-match', [dim4]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-dim-match' })).toHaveLength(0);
    attachRegimesToCell('rri-bridge-dim-mismatch', [dim11]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-dim-mismatch' })).toHaveLength(1);

    attachRegimesToCell('rri-bridge-topo-match', [topo0]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-topo-match' })).toHaveLength(0);
    attachRegimesToCell('rri-bridge-topo-mismatch', [topo2]);
    expect(regimeDiag({ ...baseBridge, id: 'rri-bridge-topo-mismatch' })).toHaveLength(1);
  });

  it('matches via target when source lacks the axis entirely', () => {
    const bridgeTargetOnly: BridgeCell = {
      ...baseBridge,
      id: 'rri-bridge-target-only',
      source: { scale: 'quantum' },
      target: { scale: 'classical', force: 'electromagnetic' },
    };
    const em = lookupRegime('force', 'electromagnetic')!;
    attachRegimesToCell('rri-bridge-target-only', [em]);
    expect(regimeDiag(bridgeTargetOnly)).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// EmergenceCell — indices.some(...) across the 6 axes
// ---------------------------------------------------------------------------

describe('regime-consistency (Rule 4) — EmergenceCell', () => {
  const baseEmergence: EmergenceCell = {
    kind: 'emergence',
    id: 'rri-emergence',
    name: 'Test Emergence',
    equation: '\\Delta \\sim T_c',
    confidence: 'established',
    order: 3,
    indices: [
      { scale: 'mesoscopic', force: 'electromagnetic', information: 'kolmogorov' },
      { scale: 'classical', force: 'electromagnetic', dimension: 4, topology: 0 },
    ],
  };

  it('matches when ANY index entry carries the tag on that axis', () => {
    const em = lookupRegime('force', 'electromagnetic')!;
    attachRegimesToCell('rri-emergence-force-match', [em]);
    expect(regimeDiag({ ...baseEmergence, id: 'rri-emergence-force-match' })).toHaveLength(0);

    const kolm = lookupRegime('information', 'kolmogorov')!;
    attachRegimesToCell('rri-emergence-info-match', [kolm]);
    expect(regimeDiag({ ...baseEmergence, id: 'rri-emergence-info-match' })).toHaveLength(0);

    attachRegimesToCell('rri-emergence-dim-match', [dim4]);
    expect(regimeDiag({ ...baseEmergence, id: 'rri-emergence-dim-match' })).toHaveLength(0);

    attachRegimesToCell('rri-emergence-topo-match', [topo0]);
    expect(regimeDiag({ ...baseEmergence, id: 'rri-emergence-topo-match' })).toHaveLength(0);
  });

  it('warns when no index entry carries the tag on that axis', () => {
    const grav = lookupRegime('force', 'gravitational')!;
    attachRegimesToCell('rri-emergence-force-mismatch', [grav]);
    const diags = regimeDiag({ ...baseEmergence, id: 'rri-emergence-force-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'force'");

    const shannon = lookupRegime('information', 'shannon')!;
    attachRegimesToCell('rri-emergence-info-mismatch', [shannon]);
    expect(regimeDiag({ ...baseEmergence, id: 'rri-emergence-info-mismatch' })).toHaveLength(1);

    attachRegimesToCell('rri-emergence-topo-mismatch', [topo2]);
    expect(regimeDiag({ ...baseEmergence, id: 'rri-emergence-topo-mismatch' })).toHaveLength(1);
  });

  it('warns on a symmetry tag when no index entry sets a symmetry at all', () => {
    const gauge = lookupRegime('symmetry', 'gauge')!;
    attachRegimesToCell('rri-emergence-sym-mismatch', [gauge]);
    const diags = regimeDiag({ ...baseEmergence, id: 'rri-emergence-sym-mismatch' });
    expect(diags).toHaveLength(1);
    expect(diags[0].message).toContain("axis 'symmetry'");
  });
});
