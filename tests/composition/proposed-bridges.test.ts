import { describe, it, expect } from 'vitest';
import {
  deriveProposedBridges,
  dedupByNormalForm,
  toProposedEntry,
  PROPOSED_BRIDGES,
  toMonomial,
  fromMonomial,
  NotAMonomialError,
  promoteProposal,
  MissingEvidenceError,
  type ProposedBridge,
} from '../../src/composition/proposed-bridges.js';
import { rankDiscoveries, type VettedCandidate } from '../../src/composition/discovery.js';
import { CANONICAL_GRAPH } from '../../src/composition/canonical-graph.js';
import { CATALOG_GRAPH } from '../../src/composition/catalog-graph.js';
import { validate } from '../../src/dimensional/validator.js';
import { format } from '../../src/dimensional/algebra.js';
import { CANONICAL_BY_ID } from '../../src/canonical/registry.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

/** Minimal promising candidate (the generator only reads a/b/dim/verdict). */
const promising = (a: string, b: string, dim = '[energy]'): VettedCandidate =>
  ({ a, b, dim, verdict: 'promising' } as unknown as VettedCandidate);

describe('monomial algebra', () => {
  it('decomposes the Landauer scalarAst to {k_B, T, ln2}', () => {
    const m = toMonomial(CANONICAL_BY_ID['CE-landauer'].scalarAst!);
    expect(new Set(m.keys())).toEqual(new Set(['k_B', 'T', 'ln2']));
    expect(m.get('T')!.exp).toBe(1);
  });

  it('round-trips a monomial through fromMonomial to an equal dimension', () => {
    const ast = CANONICAL_BY_ID['CE-planck-einstein'].scalarAst!;
    const rebuilt = fromMonomial(toMonomial(ast));
    expect(format(validate(rebuilt).inferredDimension!)).toBe(
      format(validate(ast).inferredDimension!),
    );
  });

  it('rejects a non-monomial (sum) AST', () => {
    const sum = {
      kind: 'op' as const,
      op: '+' as const,
      args: [CANONICAL_BY_ID['CE-landauer'].scalarAst!, CANONICAL_BY_ID['CE-landauer'].scalarAst!],
    };
    expect(() => toMonomial(sum)).toThrow(NotAMonomialError);
  });
});

describe('deriveProposedBridges — canonical-only pilot', () => {
  const proposals = deriveProposedBridges();

  it('emits exactly ONE proposal — the Landauer photon', () => {
    expect(proposals).toHaveLength(1);
    const p = proposals[0];
    expect(p.id).toBe('IC-erasure-energy--photon-energy--nu');
    expect(p.target.name).toBe('nu');
    expect(p.dimensionalSignature).toBe('[frequency]');
    expect(p.derivedFrom.sourceEquationIds).toContain('CE-landauer');
    expect(p.derivedFrom.sourceEquationIds).toContain('CE-planck-einstein');
  });

  it('evaluates to ~4.33 THz at T = 300 K (Eve recompute)', () => {
    const nu = proposals[0].evaluate({ T: 300 });
    expect(nu).toBeGreaterThan(4.2e12);
    expect(nu).toBeLessThan(4.45e12);
  });

  it('round-trips: scalarAst validates to its dimensionalSignature', () => {
    for (const p of proposals) {
      expect(format(validate(p.scalarAst).inferredDimension!)).toBe(p.dimensionalSignature);
    }
  });

  it('gates out CE-jarzynski (scalar-up-to-constant) — Adam M3 / Eve E3', () => {
    // The free-energy-difference ≟ photon-energy candidate is `promising` but
    // must yield NO proposal (Jarzynski prefactor is a non-constant stub).
    const only = deriveProposedBridges([
      promising('free-energy-difference', 'photon-energy'),
    ]);
    expect(only).toEqual([]);
    for (const p of proposals) {
      expect(p.derivedFrom.sourceEquationIds).not.toContain('CE-jarzynski');
    }
  });

  it('gates out a monomial:null endpoint (Newton) — gate 1', () => {
    expect(CANONICAL_BY_ID['CE-newton-gravitation'].dimensional.monomial).toBeNull();
    const none = deriveProposedBridges([
      promising('gravitational-force', 'lorentz-force', '[force]'),
    ]);
    expect(none).toEqual([]);
  });
});

describe('epistemic firewall', () => {
  it("every proposal carries the literal status 'unadjudicated'", () => {
    for (const p of deriveProposedBridges()) {
      expect(p.status).toBe('unadjudicated');
    }
  });

  it('does NOT mutate BRIDGE_EQUATIONS (reference identity + content hash)', () => {
    const ref = BRIDGE_EQUATIONS;
    const before = JSON.stringify(BRIDGE_EQUATIONS);
    deriveProposedBridges();
    expect(BRIDGE_EQUATIONS).toBe(ref); // same array reference
    expect(JSON.stringify(BRIDGE_EQUATIONS)).toBe(before); // unchanged content
    expect(BRIDGE_EQUATIONS).toHaveLength(44);
  });
});

describe('promoteProposal — promotion gate (guardrail #5)', () => {
  const p = deriveProposedBridges()[0];

  it('throws unless every human input is present', () => {
    expect(() => promoteProposal(p, { citation: '', status: 'highly-speculative', reviewRef: 'x' }))
      .toThrow(MissingEvidenceError);
    expect(() => promoteProposal(p, { citation: 'c', status: 'highly-speculative', reviewRef: '  ' }))
      .toThrow(MissingEvidenceError);
  });

  it('returns a review-ready request on full evidence', () => {
    const req = promoteProposal(p, {
      citation: 'no known literature — coincidence',
      status: 'highly-speculative',
      reviewRef: 'docs/planning/v0.24.0-Review-Findings.md',
    });
    expect(req.proposal).toBe(p);
    expect(req.evidence.status).toBe('highly-speculative');
  });
});

describe('dedupByNormalForm — cross-proposal dedup (Design §9 #2)', () => {
  const base = deriveProposedBridges()[0];

  it('collapses structurally-equal proposals into one, recording the others', () => {
    // A twin with the SAME derived relation but a different identification.
    const twin: ProposedBridge = {
      ...base,
      id: 'IC-aaa--bbb--nu',
      derivedFrom: {
        ...base.derivedFrom,
        identification: { a: 'aaa', b: 'bbb', dim: base.derivedFrom.identification.dim },
      },
    };
    const deduped = dedupByNormalForm([base, twin]);
    expect(deduped).toHaveLength(1);
    expect(deduped[0].id).toBe(base.id); // first kept (order preserved)
    expect(deduped[0].alsoDerivableFrom).toContain('aaa ≡ bbb');
  });

  it('does NOT collapse different relations', () => {
    const other: ProposedBridge = {
      ...base,
      id: 'IC-other',
      dimensionalSignature: '[energy]', // different target dim ⇒ different key
    };
    expect(dedupByNormalForm([base, other])).toHaveLength(2);
  });
});

describe('widened scope — candidate-set agnostic', () => {
  it('derives the same single proposal from the --source=both candidate set', () => {
    const both = rankDiscoveries([...CATALOG_GRAPH, ...CANONICAL_GRAPH]);
    const proposals = deriveProposedBridges(both);
    // Only canonical-target pairs resolve; bridge-only endpoints are skipped.
    const ids = proposals.map((p) => p.id);
    expect(ids).toContain('IC-erasure-energy--photon-energy--nu');
    // No structural duplicates survive (dedup ran).
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('bridge-source adapter (widened beyond canonical)', () => {
  const both = deriveProposedBridges(rankDiscoveries([...CATALOG_GRAPH, ...CANONICAL_GRAPH]));

  it('derives a proposal from a BRIDGE symbolic form (BE-16 Landauer photon)', () => {
    const be = both.find((p) => p.derivedFrom.sourceEquationIds.includes('BE-16'));
    expect(be).toBeDefined();
    expect(be!.id).toBe('IC-landauer-erasure-energy--photon-energy--nu');
    expect(be!.target.name).toBe('nu');
    expect(be!.dimensionalSignature).toBe('[frequency]');
    expect(be!.evaluate({ temperature: 300 })).toBeGreaterThan(4.2e12);
    expect(be!.provenance).toContain('bridge'); // source kind recorded honestly
  });

  it('skips ambiguous (Hawking, 2 edges) and non-monomial (corr-length) bridge targets', () => {
    const srcIds = both.flatMap((p) => p.derivedFrom.sourceEquationIds);
    expect(srcIds).not.toContain('BE-42'); // hawking-temperature: 2 symbolic edges
    expect(srcIds).not.toContain('BE-33'); // quantum-correlation-length: non-monomial
  });

  it('leaves canonical-only scope unchanged (no bridge sources)', () => {
    for (const p of deriveProposedBridges()) {
      for (const id of p.derivedFrom.sourceEquationIds) expect(id.startsWith('CE-')).toBe(true);
    }
  });
});

describe('PROPOSED_BRIDGES surface (catalog field-shape, separate registry)', () => {
  it('materializes the pilot as an unadjudicated, honest entry', () => {
    expect(PROPOSED_BRIDGES).toHaveLength(1);
    const e = PROPOSED_BRIDGES[0];
    expect(e.status).toBe('unadjudicated');
    expect(e.id).toBe('IC-erasure-energy--photon-energy--nu');
    expect(e.bridges).toEqual(['information', 'quantum']);
    expect(e.dimensional_signature).toBe('[frequency]');
    expect(e.category).toBe('Z');
    expect(e.known_issues[0].severity).toBe('phenomenological-ansatz');
  });

  it('fabricates no literature for the derived relation itself', () => {
    const e = toProposedEntry(deriveProposedBridges()[0]);
    // Every reference is either the honest derivation note or a clearly-tagged
    // SOURCE-equation citation — never an unqualified citation for the new relation.
    for (const r of e.references) {
      expect(r === 'Machine-derived; the combined relation has no independent literature.'
        || /^source (CE|BE)-/.test(r)).toBe(true);
    }
  });

  it('is NOT the catalog — BRIDGE_EQUATIONS stays the faithful 44', () => {
    expect(BRIDGE_EQUATIONS).toHaveLength(44);
    // PROPOSED_BRIDGES ids are string IC-*, never numeric catalog ids.
    for (const e of PROPOSED_BRIDGES) expect(e.id).toMatch(/^IC-/);
  });
});

// Compile-time firewall: a ProposedBridge is NOT a BridgeEquationEntry.
// (status 'unadjudicated' ∉ BridgeEquationStatus; judgment fields omitted.)
const _firewall: ProposedBridge['status'] = 'unadjudicated';
void _firewall;
