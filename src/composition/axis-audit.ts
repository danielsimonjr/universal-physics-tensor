/**
 * Axis-discrimination audit — the anti-inert-metadata gate for the extensible
 * axis registry (`axes.ts`).
 *
 * A classification axis is only load-bearing when it actually SEPARATES real
 * candidates. This audit runs the discovery link-candidate enumeration and, for
 * EVERY registry axis (gated or not), measures how often the axis FIRES (both
 * endpoints carry the attribute and they differ → an axis-clash), ABSTAINS (at
 * least one endpoint lacks the attribute), and is CHECKED (both carry it).
 *
 * Use: an axis stays `gated: false` in the registry until this audit shows it
 * fires; an axis that only ever abstains is inert and must not be gated. As the
 * catalog grows into new branches of physics, re-run this and flip the gates the
 * measurement earns. Rank grows on evidence, not vision.
 *
 * @module composition/axis-audit
 */
import type { BridgeEdge } from './edge.js';
import type { RegimeAttributes } from './quantity.js';
import type { QuantityIdentification } from './compose.js';
import { AXES } from './axes.js';
import { proposeLinkCandidates } from './bridge-analysis.js';
import { effectiveAttributes, QUANTITY_IDENTIFICATIONS } from './compose.js';
import { REGISTRY_ATTRIBUTES_BY_NAME } from './discovery.js';

/** Per-axis discrimination measurement over the candidate funnel. @internal */
export interface AxisDiscrimination {
  readonly axis: string;
  /** The registry's current gate flag for this axis. */
  readonly gated: boolean;
  /** Candidate pairs where BOTH endpoints carry the attribute. */
  readonly checked: number;
  /** Of the checked pairs, how many DIFFER (the axis fires → a clash). */
  readonly fires: number;
  /** Pairs where at least one endpoint lacks the attribute (the axis abstains). */
  readonly abstains: number;
  /** fires / checked (0 when nothing is checked). */
  readonly clashRate: number;
  /**
   * A gate is EARNED when the axis fires at all. `false` here on an ungated axis
   * = inert (do not gate); `false` on a gated axis = a regression to investigate.
   */
  readonly discriminates: boolean;
}

/**
 * Audit every registry axis's discrimination over the discovery candidate funnel.
 *
 * @internal
 */
export function auditAxisDiscrimination(
  edges: readonly BridgeEdge[],
  attributesByName: ReadonlyMap<string, RegimeAttributes> = REGISTRY_ATTRIBUTES_BY_NAME,
  identifications: readonly QuantityIdentification[] = QUANTITY_IDENTIFICATIONS,
): AxisDiscrimination[] {
  const candidates = proposeLinkCandidates(edges);
  return AXES.map((spec) => {
    let checked = 0;
    let fires = 0;
    let abstains = 0;
    for (const c of candidates) {
      const attrsA = effectiveAttributes(c.a, attributesByName, identifications) as Record<
        string,
        string | undefined
      >;
      const attrsB = effectiveAttributes(c.b, attributesByName, identifications) as Record<
        string,
        string | undefined
      >;
      const av = attrsA[spec.name];
      const bv = attrsB[spec.name];
      if (av === undefined || bv === undefined) {
        abstains++;
        continue;
      }
      checked++;
      if (av !== bv) fires++;
    }
    return {
      axis: spec.name,
      gated: spec.gated,
      checked,
      fires,
      abstains,
      clashRate: checked > 0 ? fires / checked : 0,
      discriminates: fires > 0,
    };
  });
}
