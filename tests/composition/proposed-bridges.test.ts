import { describe, it, expect } from 'vitest';
import {
  deriveProposedBridges,
  toMonomial,
  fromMonomial,
  NotAMonomialError,
  promoteProposal,
  MissingEvidenceError,
  type ProposedBridge,
} from '../../src/composition/proposed-bridges.js';
import type { VettedCandidate } from '../../src/composition/discovery.js';
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

// Compile-time firewall: a ProposedBridge is NOT a BridgeEquationEntry.
// (status 'unadjudicated' ∉ BridgeEquationStatus; judgment fields omitted.)
const _firewall: ProposedBridge['status'] = 'unadjudicated';
void _firewall;
