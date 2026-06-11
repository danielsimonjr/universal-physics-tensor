/**
 * Composition graph — the composition operator (v0.8.0 T2/T4, per
 * docs/planning/v0.8.0-Design.md §3 + r2 deltas).
 *
 * `composeEdges(first, second)` pipes `first`'s output quantity into a
 * matching source of `second`, producing a NEW `BridgeEdge` (design
 * D-2 — composition closes over the edge type, so chains nest
 * arbitrarily). Defined iff:
 *
 *   1. `first.target` matches one of `second.sources` — by canonical
 *      name, or via an explicit {@link QuantityIdentification} (the
 *      reviewable physics judgments, e.g. "the Hawking temperature IS
 *      the temperature in Landauer's bound");
 *   2. the junction dimensions are EXACTLY equal (the dimension-functor
 *      check — ℤ⁷ integer-vector equality via the dimensional
 *      calculus's `equals`);
 *   3. domains conjoin THROUGH the pipe (design D-5): the composed
 *      domain checks `first`'s domain on the outer inputs and
 *      `second`'s domain on the piped intermediate value. This
 *      evaluates `first.evaluate` inside the predicate — acceptable
 *      for scalar closed forms.
 *
 * Confidence demotes: `min(first, second)` on
 * established > speculative > highly-speculative. Composition never
 * launders credibility (improvement-plan confidence algebra).
 *
 * Operator is named `composeEdges` (NOT `compose`) — `compose` is the
 * public v0.7 Cell factory in `src/core/cell.ts` (Adam A-1).
 *
 * @module composition/compose
 */

import { equals, format } from '../dimensional/algebra.js';
import type { BridgeEdge, EdgeConfidence } from './edge.js';
import {
  CompositionDimensionError,
  CompositionJunctionError,
  DomainViolationError,
} from './edge.js';

/**
 * A reviewable quantity-identification judgment: the assertion that
 * the quantity named `from` (an edge's target) IS the quantity named
 * `to` (another edge's source), with the physics rationale on record.
 *
 * @public
 */
export interface QuantityIdentification {
  readonly from: string;
  readonly to: string;
  readonly rationale: string;
  readonly citation?: string;
}

/**
 * Registered identifications (v0.8.0 CT-1). Each entry is a physics
 * judgment intended for review — see CONTRIBUTING.md.
 *
 * @public
 */
export const QUANTITY_IDENTIFICATIONS: readonly QuantityIdentification[] = [
  {
    from: 'hawking-temperature',
    to: 'temperature',
    rationale:
      'The Hawking temperature of a black-hole horizon is a genuine ' +
      'thermodynamic temperature — the temperature appearing in ' +
      "Landauer's bound for erasure at the horizon. This is the " +
      'standard identification underlying black-hole thermodynamics ' +
      '(the horizon radiates as a black body at T_H).',
    citation: 'Hawking 1975 CMP 43:199; Bekenstein 1973 PRD 7:2333',
  },
];

const CONFIDENCE_RANK: Record<EdgeConfidence, number> = {
  established: 2,
  speculative: 1,
  'highly-speculative': 0,
};

/**
 * Confidence demotion: the min of the two grades on the ordering
 * established > speculative > highly-speculative.
 *
 * @public
 */
export function minConfidence(
  a: EdgeConfidence,
  b: EdgeConfidence,
): EdgeConfidence {
  return CONFIDENCE_RANK[a] <= CONFIDENCE_RANK[b] ? a : b;
}

/** Options for {@link composeEdges}. @public */
export interface ComposeOptions {
  /** Extra identifications, consulted after the registered ones. */
  readonly identifications?: readonly QuantityIdentification[];
}

function findJunction(
  first: BridgeEdge,
  second: BridgeEdge,
  identifications: readonly QuantityIdentification[],
): { junction: BridgeEdge['sources'][number]; viaIdentification: QuantityIdentification | null } {
  for (const src of second.sources) {
    if (src.name === first.target.name) {
      return { junction: src, viaIdentification: null };
    }
  }
  for (const ident of identifications) {
    if (ident.from !== first.target.name) continue;
    for (const src of second.sources) {
      if (src.name === ident.to) {
        return { junction: src, viaIdentification: ident };
      }
    }
  }
  throw new CompositionJunctionError(
    `Cannot compose ${first.id} -> ${second.id}: target quantity ` +
      `'${first.target.name}' matches none of [${second.sources
        .map((s) => `'${s.name}'`)
        .join(', ')}] by name or registered identification`,
  );
}

/**
 * Compose two edges into a new edge (sequential composition through a
 * shared quantity). See module docs for the definedness conditions.
 *
 * The composed edge's `sources` are `first.sources` followed by
 * `second`'s remaining (non-junction) sources; `kind` is `'law'` only
 * when both operands are laws; `beId` is null (a derived relation has
 * no single catalog row).
 *
 * @public
 */
export function composeEdges(
  first: BridgeEdge,
  second: BridgeEdge,
  opts: ComposeOptions = {},
): BridgeEdge {
  const identifications = [
    ...QUANTITY_IDENTIFICATIONS,
    ...(opts.identifications ?? []),
  ];
  const { junction, viaIdentification } = findJunction(
    first,
    second,
    identifications,
  );

  if (!equals(first.target.dim, junction.dim)) {
    throw new CompositionDimensionError(
      `Cannot compose ${first.id} -> ${second.id}: junction dimension ` +
        `mismatch — ${first.target.name} is ${format(first.target.dim)} ` +
        `but ${junction.name} is ${format(junction.dim)}`,
    );
  }

  const remainingSources = second.sources.filter((s) => s !== junction);

  const composedDomain = {
    description:
      `(${first.domain.description}) AND, on the piped ` +
      `${junction.name}, (${second.domain.description})`,
    // Standalone domain queries evaluate `first` to obtain the piped
    // intermediate (design D-5; acceptable for scalar closed forms).
    // The composed `evaluate` below does NOT call this predicate — it
    // computes the intermediate once and checks both domains inline
    // (v0.8.0 punch-list: removed the double evaluation of `first`).
    predicate: (inputs: Record<string, number>): boolean => {
      if (!first.domain.predicate(inputs)) return false;
      const intermediate = first.evaluate(inputs);
      return second.domain.predicate({
        ...inputs,
        [junction.name]: intermediate,
      });
    },
  };

  const id = `${first.id}>>${second.id}`;

  return {
    id,
    beId: null,
    kind: first.kind === 'law' && second.kind === 'law' ? 'law' : 'bridge',
    label: `${first.label} ∘ ${second.label}`,
    sources: [...first.sources, ...remainingSources],
    target: second.target,
    confidence: minConfidence(first.confidence, second.confidence),
    domain: composedDomain,
    evaluate: (inputs) => {
      if (!first.domain.predicate(inputs)) {
        throw new DomainViolationError(
          `${id}: inputs violate composed validity domain ` +
            `(${composedDomain.description})`,
        );
      }
      const intermediate = first.evaluate(inputs);
      const pipedInputs = { ...inputs, [junction.name]: intermediate };
      if (!second.domain.predicate(pipedInputs)) {
        throw new DomainViolationError(
          `${id}: inputs violate composed validity domain ` +
            `(${composedDomain.description})`,
        );
      }
      return second.evaluate(pipedInputs);
    },
    citation: `${first.citation} | ${second.citation}`,
    ...(viaIdentification !== null
      ? { identificationUsed: viaIdentification }
      : {}),
  };
}
