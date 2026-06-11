/**
 * Composition graph — quantity nodes (v0.8.0 T2, per
 * docs/planning/v0.8.0-Design.md §3).
 *
 * A `Quantity` is a node in the composition graph: a named physical
 * quantity with an exact SI dimension (the ℤ⁷ exponent vector) and a
 * SPARSE set of regime attributes. Attributes are deliberately
 * `Partial` — per the v0.8.0 improvement plan, the six catalog axes
 * are unevenly load-bearing, so a quantity records only what is known.
 * The symmetry / dimension / topology axes are intentionally omitted
 * until they become load-bearing.
 *
 * @module composition/quantity
 */

import type { Dimension } from '../dimensional/types.js';

/**
 * Sparse regime attributes — the catalog's label axes demoted from
 * container dimensions to node attributes.
 *
 * @public
 */
export interface RegimeAttributes {
  readonly scale?: 'quantum' | 'mesoscopic' | 'classical' | 'cosmological';
  readonly force?:
    | 'gravitational'
    | 'electromagnetic'
    | 'weak'
    | 'strong'
    | 'emergent';
  readonly information?: 'von-neumann' | 'shannon' | 'kolmogorov' | 'discord';
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
