/**
 * Dimension-adjacency — a review surface for quantities that are absent from a
 * reference vocabulary BY NAME but match a reference quantity BY DIMENSION.
 *
 * Name-based graph linkage misses connections hidden by a name divergence (e.g.
 * the catalog's `thermal-de-broglie-wavelength` vs the canonical L-layer's
 * `thermal-wavelength` — the same physical quantity). This sweep surfaces such
 * candidates so a reviewer can spot true aliases and registry gaps.
 *
 * It is strictly a **review surface, never an auto-merge**: same dimension does
 * NOT imply same quantity (`effective-mass` ≠ `mass`, every dimensionless
 * coupling shares `[dimensionless]`), so dimensionless quantities are excluded
 * and the output is for human adjudication only.
 *
 * @module composition/dimension-adjacency
 */

import type { Dimension } from '../dimensional/types.js';
import { DIMENSIONLESS } from '../dimensional/types.js';
import { equals, format } from '../dimensional/algebra.js';

/** A name-divergent quantity and the reference quantities it dimension-matches. */
export interface DimensionAdjacency {
  /** The quantity name (absent from the reference vocabulary). */
  readonly name: string;
  /** Its formatted dimension. */
  readonly dim: string;
  /** Reference quantities of the SAME dimension — candidates for review. */
  readonly candidates: readonly string[];
}

/**
 * For every distinct quantity whose `name` is absent from `referenceDims` but
 * whose `dim` matches ≥1 reference quantity (dimensionless excluded), list the
 * same-dimension reference candidates. Sorted by quantity name; candidates
 * sorted. A review surface — same dimension ≠ same quantity.
 *
 * @public
 */
export function dimensionAdjacency(
  quantities: Iterable<{ readonly name: string; readonly dim: Dimension }>,
  referenceDims: ReadonlyMap<string, Dimension>,
): DimensionAdjacency[] {
  const refEntries = [...referenceDims.entries()];
  const out = new Map<string, DimensionAdjacency>();
  for (const q of quantities) {
    if (out.has(q.name) || referenceDims.has(q.name)) continue; // dedupe + name-match skip
    if (equals(q.dim, DIMENSIONLESS)) continue; // too generic to be a useful candidate
    const candidates = refEntries
      .filter(([, d]) => equals(d, q.dim))
      .map(([n]) => n)
      .sort();
    if (candidates.length) out.set(q.name, { name: q.name, dim: format(q.dim), candidates });
  }
  return [...out.values()].sort((a, b) => a.name.localeCompare(b.name));
}
