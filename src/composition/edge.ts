/**
 * Composition graph — edges (bridges and laws) + validity domains
 * (v0.8.0 T1+T2+T3, per docs/planning/v0.8.0-Design.md §3).
 *
 * A `BridgeEdge` is an edge in the composition graph: n-ary source
 * quantities → one target quantity, carrying a closed-form evaluator,
 * a first-class validity domain (G-8), a confidence grade, and a
 * literature citation. `kind: 'law'` marks diagonal-law edges (P-1) —
 * edges whose endpoints share regime attributes, serving as the
 * connective tissue composition chains pass through.
 *
 * @module composition/edge
 */

import type { Quantity } from './quantity.js';

/**
 * First-class validity domain (v0.8.0 G-8). The predicate receives the
 * same keyed inputs as `evaluate` and returns whether the edge's
 * formula applies there (e.g. weak-field, positive mass, bound orbit).
 *
 * @public
 */
export interface ValidityDomain {
  /** Human-readable statement, e.g. 'M > 0 and b ≫ r_s (weak field)'. */
  readonly description: string;
  /** Machine-checkable form of the same statement. */
  readonly predicate: (inputs: Record<string, number>) => boolean;
}

/**
 * Confidence grade — mirrors the catalog's status taxonomy. Composition
 * demotes via {@link minConfidence}; it never promotes.
 *
 * @public
 */
export type EdgeConfidence =
  | 'established'
  | 'speculative'
  | 'highly-speculative';

/**
 * An edge in the composition graph.
 *
 * `evaluate` is keyed by source-quantity `name`s. For catalog-backed
 * edges, `beId` cross-references `BRIDGE_EQUATIONS`; diagonal-law
 * edges have `beId: null` (BE-1–10 are not individually catalogued).
 *
 * @public
 */
export interface BridgeEdge {
  /** Graph id, e.g. 'be-42', 'law-schwarzschild-radius'. */
  readonly id: string;
  /** Catalog cross-reference; null for diagonal laws. */
  readonly beId: number | null;
  /** Bridge (endpoints differ in regime) vs law (endpoints share regime). */
  readonly kind: 'bridge' | 'law';
  /** Human-readable label. */
  readonly label: string;
  /** Input quantities (n-ary). */
  readonly sources: readonly Quantity[];
  /** Output quantity. */
  readonly target: Quantity;
  readonly confidence: EdgeConfidence;
  readonly domain: ValidityDomain;
  /** Closed-form evaluator; keys are source-quantity names. */
  readonly evaluate: (inputs: Record<string, number>) => number;
  readonly citation: string;
  /**
   * Provenance: the quantity identification the junction used, when a
   * composed edge was formed via `QUANTITY_IDENTIFICATIONS` rather than
   * a name match. Absent on primitive edges and name-matched
   * compositions. (v0.8.0 punch-list: surfaced from the previously
   * unused `findJunction` return.)
   */
  readonly identificationUsed?: {
    readonly from: string;
    readonly to: string;
    readonly rationale: string;
    readonly citation?: string;
  };
}

/** Composition failed: no junction quantity matched. @public */
export class CompositionJunctionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompositionJunctionError';
  }
}

/** Composition failed: junction dimensions are not exactly equal. @public */
export class CompositionDimensionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompositionDimensionError';
  }
}

/**
 * Evaluation refused: inputs fall outside an edge's validity domain.
 *
 * Honest deviation from design D-3's "domain-incompatible at compose
 * time": domain predicates are opaque functions, so incompatibility is
 * detectable only at evaluation — this error is thrown by
 * {@link evaluateEdge} (and by composed edges internally), not by
 * `composeEdges`.
 *
 * @public
 */
export class DomainViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainViolationError';
  }
}

/**
 * Domain-checked evaluation: throws {@link DomainViolationError} when
 * `inputs` violate `edge.domain`, otherwise returns `edge.evaluate`.
 *
 * @public
 */
export function evaluateEdge(
  edge: BridgeEdge,
  inputs: Record<string, number>,
): number {
  if (!edge.domain.predicate(inputs)) {
    throw new DomainViolationError(
      `${edge.id}: inputs violate validity domain (${edge.domain.description})`,
    );
  }
  return edge.evaluate(inputs);
}
