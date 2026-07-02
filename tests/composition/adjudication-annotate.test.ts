import { describe, it, expect } from 'vitest';
import { annotateAdjudications } from '../../src/composition/adjudication.js';
import type { VettedCandidate } from '../../src/composition/discovery.js';

/** Minimal, hand-built VettedCandidate — all 17 fields are required
 *  (discovery.ts:73-141). Values are otherwise arbitrary/plausible. */
function makeCandidate(a: string, b: string): VettedCandidate {
  return {
    a,
    b,
    dim: '[length]',
    touchesCore: false,
    sameKind: false,
    mergesComponents: true,
    unlocksFromAnchor: [],
    numericallyConsistent: true,
    inconsistentNodes: [],
    ordersApart: null,
    magnitudeChecked: false,
    magnitudeUsedAnchor: false,
    subsuming: false,
    verdict: 'promising',
    score: 6,
    canonicalKinds: [],
    touchesCanonical: false,
  };
}

describe('annotateAdjudications', () => {
  it('attaches the recorded verdict to a candidate matching a seeded pair', () => {
    // Seeded pair (order-swapped from the registry's own a<=b storage order,
    // to also exercise adjudicationFor's order-insensitivity through the map).
    const cand = makeCandidate('mutation-rate', 'decoherence-rate');
    const [annotated] = annotateAdjudications([cand]);

    expect(annotated.adjudication).toBeDefined();
    expect(annotated.adjudication?.verdict).toBe('decoy');
    // Every VettedCandidate field must survive untouched.
    expect(annotated.a).toBe('mutation-rate');
    expect(annotated.b).toBe('decoherence-rate');
    expect(annotated.verdict).toBe('promising');
  });

  it('leaves an unadjudicated candidate untouched (strict deep-equal, no adjudication key)', () => {
    const cand = makeCandidate('some-unseeded-quantity', 'another-quantity');
    const [annotated] = annotateAdjudications([cand]);

    expect(annotated.adjudication).toBeUndefined();
    expect(annotated).toStrictEqual(cand);
  });

  it('does not throw on non-kebab-case candidate names (real discovery pool has them)', () => {
    // candidateId() intentionally THROWS on non-slug names (the `~`-collision
    // guard) — but the discovery funnel's real candidate pool contains names
    // like 'A' and 'impact_parameter' straight off BridgeEdge/canonical
    // governing sets. annotateAdjudications must not crash on these; a
    // non-slug name can never be a ledger key, so it is simply unadjudicated.
    const cands = [makeCandidate('A', 'impact_parameter'), makeCandidate('mass', 'Bad-Case')];
    expect(() => annotateAdjudications(cands)).not.toThrow();
    const annotated = annotateAdjudications(cands);
    expect(annotated[0].adjudication).toBeUndefined();
    expect(annotated[1].adjudication).toBeUndefined();
  });

  it('is a pure map — preserves order and length', () => {
    const cands = [
      makeCandidate('some-unseeded-quantity', 'another-quantity'),
      makeCandidate('mutation-rate', 'decoherence-rate'),
      makeCandidate('erasure-energy', 'photon-energy'),
    ];
    const annotated = annotateAdjudications(cands);

    expect(annotated).toHaveLength(3);
    expect(annotated[0].adjudication).toBeUndefined();
    expect(annotated[1].adjudication?.verdict).toBe('decoy');
    expect(annotated[2].adjudication?.verdict).toBe('decoy');
    expect(annotated.map((c) => `${c.a}~${c.b}`)).toStrictEqual([
      'some-unseeded-quantity~another-quantity',
      'mutation-rate~decoherence-rate',
      'erasure-energy~photon-energy',
    ]);
  });
});
