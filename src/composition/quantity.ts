/**
 * Composition graph — quantity nodes (v0.8.0 T2, per
 * docs/planning/v0.8.0-Design.md §3).
 *
 * A `Quantity` is a node in the composition graph: a named physical
 * quantity with an exact SI dimension (the ℤ⁷ exponent vector) and a
 * SPARSE set of regime attributes. Attributes are deliberately
 * `Partial` — the classification axes are unevenly load-bearing, so a
 * quantity records only what is known and sourced.
 *
 * The axis TYPES + the classification registry live in `axes.ts` (the
 * single source; `RegimeAttributes` references them). Symmetry, topology,
 * and quantum statistics are now first-class attribute axes (2026-07-05
 * extensible-axis expansion) — but they remain UNGATED in the discovery
 * falsifier until the discrimination audit (`axis-audit.ts`) shows they
 * actually fire on real candidates. The SI `Dimension` axis is separate
 * (the 7-base system in `dimensional/`), not an attribute here.
 *
 * @module composition/quantity
 */

import type { Dimension } from '../dimensional/types.js';
import type {
  ScaleAxis,
  ForceAxis,
  InformationAxis,
  SymmetryAxis,
  TopologyAxis,
  StatisticsAxis,
} from './axes.js';

/**
 * Sparse regime attributes — the classification axes demoted from
 * container dimensions to node attributes. Values + the gated flags live
 * in the `axes.ts` registry.
 *
 * @public
 */
export interface RegimeAttributes {
  readonly scale?: ScaleAxis;
  readonly force?: ForceAxis;
  readonly information?: InformationAxis;
  /** Symmetry class — first-class 2026-07-05; ungated until the audit earns it. */
  readonly symmetry?: SymmetryAxis;
  /** Topological invariant type — populates the Topology axis; ungated until the audit. */
  readonly topology?: TopologyAxis;
  /** Quantum statistics (the 7th axis); ungated until the audit confirms independent discrimination. */
  readonly statistics?: StatisticsAxis;
}

/**
 * A node in the composition graph: a physical quantity.
 *
 * `name` is the canonical graph identity (junction matching is by
 * name or by explicit `QuantityIdentification`); `symbol` is display
 * only. `dim` is the exact SI dimension used by the dimension-functor
 * check at composition junctions.
 *
 * @public
 */
export interface Quantity {
  /** Canonical graph identity, e.g. 'temperature', 'schwarzschild-radius'. */
  readonly name: string;
  /** Display symbol, e.g. 'T_H', 'r_s'. */
  readonly symbol: string;
  /** Exact SI dimension (ℤ⁷ exponent vector). */
  readonly dim: Dimension;
  /** Sparse regime attributes — only what is known. */
  readonly attributes: RegimeAttributes;
}

const REGIME_KEYS = ['scale', 'force', 'information'] as const;

/**
 * Graph-native membership criterion primitive (v0.8.0 G-2): two
 * attribute sets "differ" iff at least one regime axis is stated on
 * BOTH sides with different values. Axes stated on only one side are
 * inconclusive and do not count as a difference.
 *
 * A bridge is an edge whose endpoint quantities differ; a law is an
 * edge whose endpoints share all mutually-stated attributes.
 *
 * @public
 */
export function regimesDiffer(
  a: RegimeAttributes,
  b: RegimeAttributes,
): boolean {
  for (const key of REGIME_KEYS) {
    const av = a[key];
    const bv = b[key];
    if (av !== undefined && bv !== undefined && av !== bv) return true;
  }
  return false;
}
