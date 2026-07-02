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
import type { Quantity, RegimeAttributes } from './quantity.js';
import {
  CompositionAliasError,
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
  {
    from: 'de-broglie-wavelength',
    to: 'compton-wavelength',
    rationale:
      'The de Broglie wavelength λ = h/p and the Compton wavelength ' +
      'λ_C = h/(mc) are the SAME matter-wavelength quantity of a massive ' +
      'particle; the Compton wavelength is its value in the relativistic ' +
      'limit p = mc (v → c). They are equal only in that limit, but at the ' +
      'composition graph’s quantity-KIND resolution they name one node. ' +
      'Folded ONTO compton-wavelength (not the reverse) because that node is ' +
      'anchor-determinable (ℏ/mc from a mass) and carries the sourced atomic ' +
      'scale the magnitude gate needs; de-broglie’s own form needs a ' +
      'momentum the single-mass anchor does not supply.',
    citation: 'de Broglie 1924; Compton 1923 Phys. Rev. 21:483',
  },
  {
    from: 'thermal-de-broglie-wavelength',
    to: 'thermal-wavelength',
    rationale:
      'The catalog names the thermal de Broglie wavelength ' +
      'λ_T = √(2πℏ²/(m k_B T)) `thermal-de-broglie-wavelength` (BE-11 Zurek ' +
      'decoherence, BE-12 Caldeira–Leggett coherence length), while the ' +
      'canonical L-layer law `CE-thermal-de-broglie` names the SAME physical ' +
      'quantity `thermal-wavelength`. They are one node. Folded ONTO the ' +
      'canonical `thermal-wavelength` (anchor-determinable: √(2πℏ²/(m k_B T)) ' +
      'from a mass + temperature), reconnecting BE-11 — an ESTABLISHED bridge — ' +
      'to standard physics (surfaced by the bridges-vs-canonical map; the link ' +
      'was hidden purely by the name divergence).',
    citation: 'de Broglie 1924; standard statistical mechanics (λ_T)',
  },
];

/**
 * Effective regime attributes for a candidate NAME, resolved through the
 * `QUANTITY_IDENTIFICATIONS` fold — the SINGLE shared implementation every
 * attribute consumer must use (Eve r3 #2 mandate; the discovery-hardening
 * Phase-2 axis-compatibility gate is the first). `attributesByName` is the
 * REGISTRY-only source (never canonical per-equation stamps — Option-A,
 * audit adjudication F1): callers supply it (production: every centralized
 * `Quantity.attributes`; tests: an injected fixture map), this function only
 * does the fold resolution.
 *
 * Candidate names are already fold-canonicalized (the `to` side of an
 * identification); this additionally pulls in every `from` contributor that
 * folds ONTO `name` and, per axis, unions their stated value with `name`'s
 * own. Where contributors DISAGREE on an axis, the axis counts as UNSTATED
 * (conflict → abstain) rather than picking a side — the fold-conflict rule.
 *
 * @internal
 */
export function effectiveAttributes(
  name: string,
  attributesByName: ReadonlyMap<string, RegimeAttributes>,
  idents: readonly QuantityIdentification[] = QUANTITY_IDENTIFICATIONS,
): RegimeAttributes {
  const contributors: RegimeAttributes[] = [];
  const own = attributesByName.get(name);
  if (own) contributors.push(own);
  for (const id of idents) {
    if (id.to !== name) continue;
    const folded = attributesByName.get(id.from);
    if (folded) contributors.push(folded);
  }

  // One-value-agrees, zero-or-conflicting-values-abstain, per axis. Written
  // out per axis (rather than generically over `keyof RegimeAttributes`) so
  // each axis's value type stays concrete — no cross-axis union widening.
  const scales = new Set(contributors.map((c) => c.scale).filter((v) => v !== undefined));
  const forces = new Set(contributors.map((c) => c.force).filter((v) => v !== undefined));
  const infos = new Set(
    contributors.map((c) => c.information).filter((v) => v !== undefined),
  );

  const result: { scale?: RegimeAttributes['scale']; force?: RegimeAttributes['force']; information?: RegimeAttributes['information'] } = {};
  if (scales.size === 1) result.scale = [...scales][0];
  if (forces.size === 1) result.force = [...forces][0];
  if (infos.size === 1) result.information = [...infos][0];
  return result;
}

/**
 * A recorded aliasing judgment for one duplicate source name in a
 * composition (v0.11 Option D). `'shared'` = one input deliberately
 * feeds both slots (e.g. ST-2: one M is both the lens and the r_s
 * source). `renameSecond` = split the collision: the SECOND operand's
 * quantity is renamed, and the composed evaluator remaps the renamed
 * input key back to the operand's internal name (vet A-4 — without the
 * remap the rename is a no-op).
 *
 * @public
 */
export interface AliasDisposition {
  readonly name: string;
  readonly treatAs: 'shared' | { readonly renameSecond: string };
  readonly rationale: string;
  readonly citation?: string;
}

/**
 * Registered alias dispositions, keyed by composed id
 * (`first.id>>second.id`) — judgments live in reviewable registry
 * data, mirroring {@link QUANTITY_IDENTIFICATIONS} (vet A-6.2).
 *
 * @public
 */
export const SOURCE_ALIAS_DISPOSITIONS: Readonly<
  Record<string, readonly AliasDisposition[]>
> = {
  // ST-2 (stress test, pre-registered v0.10.0 plan §T2): the photon
  // grazes AT r_s of the SAME mass that bends it — one M is both the
  // lensing mass and the r_s source. Deliberate, physical sharing.
  'law-schwarzschild-radius>>be-51': [
    {
      name: 'mass',
      treatAs: 'shared',
      rationale:
        'One gravitating mass M is simultaneously the lens (BE-51) and ' +
        'the source of the Schwarzschild radius the photon grazes — ' +
        'the sharing IS the stress-test physics (ST-2).',
    },
  ],
};

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
  /**
   * Alias dispositions for duplicate source names (v0.11 Option D);
   * consulted after {@link SOURCE_ALIAS_DISPOSITIONS} entries for the
   * composed id.
   */
  readonly aliases?: readonly AliasDisposition[];
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

  // v0.11 Option D (namespacing gate): pure name-collision rule across
  // operands. Intra-operand duplicates (e.g. ['mass','mass'] inherited
  // from a prior 'shared' disposition) are exempt by construction —
  // only names present in BOTH first.sources and second's remaining
  // sources are collisions, and each needs a recorded disposition.
  const firstNames = new Set(first.sources.map((s) => s.name));
  const collisionNames = [
    ...new Set(
      remainingSources
        .filter((s) => firstNames.has(s.name))
        .map((s) => s.name),
    ),
  ];
  const composedId = `${first.id}>>${second.id}`;
  const dispositions: AliasDisposition[] = [
    ...(SOURCE_ALIAS_DISPOSITIONS[composedId] ?? []),
    ...(opts.aliases ?? []),
  ];
  const renameMap: Record<string, string> = {}; // renamed key -> operand-internal name
  const dispositionsUsed: AliasDisposition[] = [];
  let finalRemaining: Quantity[] = [...remainingSources];
  for (const name of collisionNames) {
    const d = dispositions.find((x) => x.name === name);
    if (!d) {
      throw new CompositionAliasError(
        `Cannot compose ${composedId}: source quantity '${name}' appears ` +
          `in BOTH operands (first: [${[...firstNames].join(', ')}]; ` +
          `second remaining: [${remainingSources
            .map((s) => s.name)
            .join(', ')}]). Same name does not imply same physical ` +
          `quantity — record an AliasDisposition ('shared' or ` +
          `{renameSecond}) in SOURCE_ALIAS_DISPOSITIONS or opts.aliases.`,
      );
    }
    dispositionsUsed.push(d);
    if (d.treatAs === 'shared') continue; // one input key feeds both slots
    const renamed = d.treatAs.renameSecond;
    if (
      firstNames.has(renamed) ||
      second.sources.some((s) => s.name === renamed)
    ) {
      throw new CompositionAliasError(
        `Cannot compose ${composedId}: renameSecond target '${renamed}' ` +
          `collides with an existing source name of an operand (vet A-4).`,
      );
    }
    finalRemaining = finalRemaining.map((s) =>
      s.name === name ? { ...s, name: renamed, symbol: s.symbol } : s,
    );
    renameMap[renamed] = name;
  }

  /** Build the second operand's input map: remap renamed keys back to
   *  the operand-internal names (shadowing the first operand's value
   *  for that name — vet A-4's required remap), then pipe the junction. */
  const buildSecondInputs = (
    inputs: Record<string, number>,
    intermediate: number,
  ): Record<string, number> => {
    const si: Record<string, number> = { ...inputs };
    for (const [renamed, original] of Object.entries(renameMap)) {
      si[original] = inputs[renamed];
      delete si[renamed];
    }
    si[junction.name] = intermediate;
    return si;
  };

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
      return second.domain.predicate(buildSecondInputs(inputs, intermediate));
    },
  };

  const id = `${first.id}>>${second.id}`;

  return {
    id,
    beId: null,
    kind: first.kind === 'law' && second.kind === 'law' ? 'law' : 'bridge',
    label: `${first.label} ∘ ${second.label}`,
    sources: [...first.sources, ...finalRemaining],
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
      const pipedInputs = buildSecondInputs(inputs, intermediate);
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
    ...(dispositionsUsed.length > 0
      ? { aliasDispositionsUsed: dispositionsUsed }
      : {}),
  };
}
