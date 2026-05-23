/**
 * Wiring: installs P5's `RegimeConsistency` rule body into the
 * flux-rules registry. Importing this module activates Rule 4
 * (regime-consistency, WARNING tier) on every `UniversalTensor`.
 *
 * Phase 4 of v0.8 Proposal 5.
 *
 * The rule body checks: for each attached regime on a cell (via
 * `getCellRegimes(cell.id)`), does the regime's axis MATCH a
 * coordinate axis the cell occupies? If not, emit a warning.
 * Example: a `LawCell` with `scales: ['classical']` attached to
 * a regime whose `axis === 'scale'` but `tag === 'quantum'`
 * — the cell sits in classical coords but is tagged with a quantum
 * regime → warning.
 *
 * Per P5 Adam-M2 reconciliation, cells carry PLURAL axis arrays
 * (`LawCell.scales`, `LawCell.forces`); the rule reads any of them
 * and matches against the regime tag.
 *
 * Importing this module installs the rule. Consumers who don't
 * want regime checks can simply skip the import.
 *
 * @module core/regime-rule-install
 */

import { installRegimeConsistencyRule, type FluxRuleResult } from './flux-rules.js';
import { getCellRegimes } from './regime-registry.js';
import type { Cell } from './cell.js';
import type { AxisName } from './universal-index.js';

function cellOccupiesAxisTag(cell: Cell, axis: AxisName, tag: string): boolean {
  switch (cell.kind) {
    case 'law':
      switch (axis) {
        case 'scale': return cell.scales.some((s) => s === tag);
        case 'force': return cell.forces.some((f) => f === tag);
        case 'symmetry': return cell.symmetries.some((s) => s === tag);
        case 'information':
          return cell.informationMeasures?.some((i) => i === tag) ?? false;
        case 'dimension':
          return cell.dimensions?.some((d) => String(d) === tag) ?? false;
        case 'topology':
          return cell.topologies?.some((t) => String(t) === tag) ?? false;
      }
      return false;
    case 'bridge':
      switch (axis) {
        case 'scale': return cell.source.scale === tag || cell.target.scale === tag;
        case 'force': return cell.source.force === tag || cell.target.force === tag;
        case 'symmetry': return cell.source.symmetry === tag || cell.target.symmetry === tag;
        case 'information':
          return cell.source.information === tag || cell.target.information === tag;
        case 'dimension':
          return String(cell.source.dimension) === tag || String(cell.target.dimension) === tag;
        case 'topology':
          return String(cell.source.topology) === tag || String(cell.target.topology) === tag;
      }
      return false;
    case 'emergence':
      return cell.indices.some((ix) => {
        switch (axis) {
          case 'scale': return ix.scale === tag;
          case 'force': return ix.force === tag;
          case 'symmetry': return ix.symmetry === tag;
          case 'information': return ix.information === tag;
          case 'dimension': return String(ix.dimension) === tag;
          case 'topology': return String(ix.topology) === tag;
        }
        return false;
      });
  }
}

installRegimeConsistencyRule((cell: Cell): FluxRuleResult => {
  const regimes = getCellRegimes(cell.id);
  if (!regimes || regimes.length === 0) return { ok: true };

  const mismatches = regimes.filter((r) => !cellOccupiesAxisTag(cell, r.axis, r.tag));
  if (mismatches.length === 0) return { ok: true };

  const m = mismatches[0];
  return {
    ok: true, // WARNING tier — does not throw
    diagnostic: {
      severity: 'warning',
      ruleName: 'regime-consistency',
      cellId: cell.id,
      message:
        `Cell '${cell.id}' is attached to regime '${m.tag}' on axis '${m.axis}' ` +
        `(displayName: '${m.displayName}') but the cell does not occupy any ` +
        `${m.axis} coordinate matching that tag. Either correct the attachment ` +
        `or extend the cell's ${m.axis} coordinates.`,
    },
  };
});
