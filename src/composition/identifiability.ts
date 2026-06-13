/**
 * Identifiability classifier (Consequence 1 of
 * docs/planning/Bridge-Inference-Epistemics-Note.md, designed in
 * docs/planning/Identifiability-Classifier-Design-Note.md).
 *
 * Answers a STRUCTURAL question over the directed hypergraph of
 * `BridgeEdge`s: given a set of known quantities and a target quantity,
 * how many INDEPENDENT ways can the graph compute the target from the
 * knowns? The count drives the epistemics-note trichotomy:
 *
 *   - under-determined — unreachable; needs more inputs or more physics.
 *   - exactly-determined — one derivation; solvable (up to the
 *     dimensionless constant dimensional analysis cannot supply).
 *   - over-determined — ≥2 derivations; the surplus are FALSIFIABLE
 *     consistency constraints (each predicts the target; they must
 *     agree). The headline regime.
 *   - given — the target is itself a known (degenerate); derivations
 *     become cross-checks on the supplied value.
 *
 * This is STRUCTURAL, not parametric: it does not decide whether the
 * resulting nonlinear system has a unique numeric solution (undecidable
 * in general for closed-form evaluators). "Independent derivation" means
 * a structurally distinct edge, NOT a provably-independent formula — two
 * edges encoding the same relation are counted as two (an honest
 * over-count). The classifier PROPOSES; humans filter (Part-VI §XXVII-B),
 * exactly as `enumerateCompositions` does.
 *
 * @module composition/identifiability
 */

import type { BridgeEdge } from './edge.js';
import type { QuantityIdentification } from './compose.js';
import { QUANTITY_IDENTIFICATIONS } from './compose.js';

/** The four-way structural-identifiability verdict. @public */
export type IdentifiabilityVerdict =
  | 'given'
  | 'under-determined'
  | 'exactly-determined'
  | 'over-determined';

/** Options for the classifier. @public */
export interface IdentifiabilityOptions {
  /**
   * Quantity identifications honored when expanding determinability
   * (directed name-equivalences: `from` determinable ⟹ `to` determinable).
   * Defaults to the registered {@link QUANTITY_IDENTIFICATIONS}, mirroring
   * how `composeEdges` connects the graph. Pass `[]` for the pure
   * physical-edge graph.
   */
  readonly identifications?: readonly QuantityIdentification[];
}

/** The result of classifying one target against one known set. @public */
export interface IdentifiabilityResult {
  /** The target quantity name that was classified. */
  readonly target: string;
  /** The known-quantity names (deduplicated). */
  readonly known: readonly string[];
  readonly verdict: IdentifiabilityVerdict;
  /**
   * Ids of the distinct edges that independently derive the target from
   * the known set — sources determinable WITHOUT using any edge into the
   * target (so circular self-support is excluded). Empty ⟺ no physical
   * derivation (under-determined, or determined only by identity).
   */
  readonly derivations: readonly string[];
  /**
   * Redundant derivations = falsifiable consistency constraints. For a
   * non-given target the first derivation pins the value and the rest are
   * checks (`max(0, |derivations| − 1)`); for a given (measured) target
   * every derivation is a check (`|derivations|`).
   */
  readonly surplusConstraints: number;
  /**
   * For under-determined targets: the upstream quantities that block
   * determinability — on some path toward the target, not determinable
   * from the known set, not themselves known. Knowing a sufficient subset
   * moves the target toward determined. Empty when determinable.
   */
  readonly blockingFrontier: readonly string[];
  /** Every quantity determinable from the known set (the forward closure). */
  readonly determinable: readonly string[];
}

/**
 * The monotone forward closure: the least set ⊇ `knownNames` closed under
 * "all of an edge's sources determinable ⟹ its target determinable",
 * with identifications expanding it as directed name-equivalences.
 *
 * A parameter-free edge (empty `sources`) fires unconditionally — its
 * target is in every closure (a constant is always determinable).
 *
 * @public
 */
export function forwardClosure(
  edges: readonly BridgeEdge[],
  knownNames: readonly string[],
  identifications: readonly QuantityIdentification[] = QUANTITY_IDENTIFICATIONS,
): Set<string> {
  const determinable = new Set<string>(knownNames);
  let changed = true;
  while (changed) {
    changed = false;
    for (const ident of identifications) {
      if (determinable.has(ident.from) && !determinable.has(ident.to)) {
        determinable.add(ident.to);
        changed = true;
      }
    }
    for (const e of edges) {
      if (determinable.has(e.target.name)) continue;
      if (e.sources.every((s) => determinable.has(s.name))) {
        determinable.add(e.target.name);
        changed = true;
      }
    }
  }
  return determinable;
}

/** The quantities from which `targetName` is forward-reachable (its
 *  backward cone, target included). */
function backwardCone(
  edges: readonly BridgeEdge[],
  targetName: string,
): Set<string> {
  const cone = new Set<string>([targetName]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const e of edges) {
      if (!cone.has(e.target.name)) continue;
      for (const s of e.sources) {
        if (!cone.has(s.name)) {
          cone.add(s.name);
          changed = true;
        }
      }
    }
  }
  return cone;
}

/**
 * Classify the structural identifiability of `targetName` given
 * `knownNames` over `edges`. See the module docs and
 * docs/planning/Identifiability-Classifier-Design-Note.md.
 *
 * @public
 */
export function classifyIdentifiability(
  edges: readonly BridgeEdge[],
  knownNames: readonly string[],
  targetName: string,
  opts: IdentifiabilityOptions = {},
): IdentifiabilityResult {
  const identifications = opts.identifications ?? QUANTITY_IDENTIFICATIONS;
  const known = [...new Set(knownNames)];

  const determinable = forwardClosure(edges, known, identifications);

  // Derivations must not depend on the target itself: close over the
  // graph with every edge INTO the target removed (excludes circular
  // self-support — see the design note's worked counterexample).
  const edgesMinusIntoTarget = edges.filter(
    (e) => e.target.name !== targetName,
  );
  const dMinusT = forwardClosure(edgesMinusIntoTarget, known, identifications);

  const derivations = edges
    .filter(
      (e) =>
        e.target.name === targetName &&
        e.sources.every((s) => dMinusT.has(s.name)),
    )
    .map((e) => e.id);

  const isGiven = known.includes(targetName);
  let verdict: IdentifiabilityVerdict;
  if (isGiven) {
    verdict = 'given';
  } else if (!determinable.has(targetName)) {
    verdict = 'under-determined';
  } else if (derivations.length >= 2) {
    verdict = 'over-determined';
  } else {
    verdict = 'exactly-determined';
  }

  const surplusConstraints = isGiven
    ? derivations.length
    : Math.max(0, derivations.length - 1);

  let blockingFrontier: string[] = [];
  if (verdict === 'under-determined') {
    const knownSet = new Set(known);
    blockingFrontier = [...backwardCone(edges, targetName)]
      .filter(
        (q) => q !== targetName && !determinable.has(q) && !knownSet.has(q),
      )
      .sort();
  }

  return {
    target: targetName,
    known,
    verdict,
    derivations,
    surplusConstraints,
    blockingFrontier,
    determinable: [...determinable].sort(),
  };
}

/**
 * Classify every quantity that is some edge's target, against one known
 * set. The natural feeder for a retrodiction harness (mask a node, ask
 * whether the graph recovers it). Sorted by target name.
 *
 * @public
 */
export function classifyAll(
  edges: readonly BridgeEdge[],
  knownNames: readonly string[],
  opts: IdentifiabilityOptions = {},
): IdentifiabilityResult[] {
  const targets = [...new Set(edges.map((e) => e.target.name))].sort();
  return targets.map((t) =>
    classifyIdentifiability(edges, knownNames, t, opts),
  );
}
