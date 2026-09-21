/**
 * Atlas Phase 1, S1.3 — evidence tags are DERIVED, and cannot be free.
 *
 * Design note `docs/planning/Atlas-Phase-1-Design.md` §3 and §4.
 *
 * The load-bearing tests here are the ones that try to STEAL a tag:
 *   - the empty-`conventions` regression (§3's confirmed exploit);
 *   - the "no witness is passing by default" pin;
 *   - the 55-row truthful-migration assertion, which fails the moment the
 *     derivation invents evidence on a real row.
 */

import { describe, it, expect } from 'vitest';

import {
  deriveEvidence,
  deriveEvidenceForVerdict,
  type AdjudicationVerdict,
  type EvidenceInput,
  type WitnessLike,
} from '../../src/atlas/derive-evidence.js';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';
import { adjudicateBridgeEntry, type BridgeVerdict } from '../../src/bridges/membership.js';
import { REJECTED_BRIDGE_IDS } from '../../src/bridges/rejected.js';

/**
 * Compile-time pin: the structural union in `derive-evidence.ts` and the real
 * `BridgeVerdict` are the SAME set, both ways. A fourth verdict added to
 * `membership.ts` fails `bun run typecheck` here.
 */
type Mutual<A, B> = [A] extends [B] ? ([B] extends [A] ? true : never) : never;
const VERDICT_UNIONS_AGREE: Mutual<AdjudicationVerdict, BridgeVerdict> = true;

const sorted = (s: ReadonlySet<string>): string[] => [...s].sort();

const symbolic: WitnessLike = { id: 'W-sym', kind: 'symbolic' };
const numeric: WitnessLike = { id: 'W-num', kind: 'numeric' };
const dimensional: WitnessLike = { id: 'W-dim', kind: 'dimensional' };

describe('deriveEvidence — a tag is emitted only when its artifact is present AND passing', () => {
  it('derives {proposed} for a record with nothing at all', () => {
    expect(sorted(deriveEvidence({}))).toEqual(['proposed']);
  });

  it('derives no checked tag when the witness is NOT in the passing set', () => {
    const record: EvidenceInput = { witnesses: [symbolic, numeric, dimensional] };
    expect(sorted(deriveEvidence(record))).toEqual(['proposed']);
    expect(sorted(deriveEvidence(record, new Set(['W-other'])))).toEqual(['proposed']);
  });

  it('derives one checked tag per passing witness kind', () => {
    const record: EvidenceInput = { witnesses: [symbolic, numeric, dimensional] };
    expect(sorted(deriveEvidence(record, new Set(['W-sym'])))).toEqual(['symbolically-checked']);
    expect(sorted(deriveEvidence(record, new Set(['W-num'])))).toEqual(['numerically-supported']);
    expect(sorted(deriveEvidence(record, new Set(['W-dim'])))).toEqual(['dimension-checked']);
    expect(sorted(deriveEvidence(record, new Set(['W-sym', 'W-num', 'W-dim'])))).toEqual([
      'dimension-checked',
      'numerically-supported',
      'symbolically-checked',
    ]);
  });

  it('never emits proposed alongside an earned tag', () => {
    const tags = deriveEvidence({ witnesses: [symbolic] }, new Set(['W-sym']));
    expect(tags.has('proposed')).toBe(false);
  });

  it('derives no tag from reviewStatus or prose (neither is read)', () => {
    const record = {
      reviewStatus: 'reviewed',
      notes: 'dimensionally checked, symbolically verified, numerically confirmed',
    } as unknown as EvidenceInput;
    expect(sorted(deriveEvidence(record, new Set(['W-sym'])))).toEqual(['proposed']);
  });
});

describe('convention-checked — REGRESSION: the empty `conventions` object must NOT earn it', () => {
  /**
   * Design note §3, Adam A1 RED, confirmed by execution: `conventions = {}` is
   * PRESENT, declares NOTHING, and `[].every(…)` is vacuously TRUE — so the
   * first form of this rule handed a "checked" tag to a record with ZERO
   * witnesses. This test exists so that defect cannot return silently.
   */
  it('an empty conventions object with zero witnesses derives {proposed}, not convention-checked', () => {
    const tags = deriveEvidence({ conventions: {}, witnesses: [] });
    expect(tags.has('convention-checked')).toBe(false);
    expect(sorted(tags)).toEqual(['proposed']);
  });

  it('a conventions object whose only field is explicitly undefined declares nothing', () => {
    const tags = deriveEvidence({ conventions: { unitSystem: undefined } });
    expect(tags.has('convention-checked')).toBe(false);
  });

  it('a declared field with NO consuming witness does not earn the tag', () => {
    const tags = deriveEvidence(
      { conventions: { unitSystem: 'SI' }, witnesses: [symbolic] },
      new Set(['W-sym']),
    );
    expect(tags.has('convention-checked')).toBe(false);
  });

  it('a declared field consumed by a PASSING witness earns the tag', () => {
    const w: WitnessLike = { id: 'W-c', kind: 'symbolic', consumes: ['unitSystem'] };
    const tags = deriveEvidence({ conventions: { unitSystem: 'SI' }, witnesses: [w] }, new Set(['W-c']));
    expect(tags.has('convention-checked')).toBe(true);
  });

  it('a declared field consumed only by a NON-passing witness does not earn the tag', () => {
    const w: WitnessLike = { id: 'W-c', kind: 'symbolic', consumes: ['unitSystem'] };
    const tags = deriveEvidence({ conventions: { unitSystem: 'SI' }, witnesses: [w] });
    expect(tags.has('convention-checked')).toBe(false);
  });

  it('two declared fields with only one consumed does not earn the tag (the universal is real)', () => {
    const w: WitnessLike = { id: 'W-c', kind: 'symbolic', consumes: ['unitSystem'] };
    const tags = deriveEvidence(
      { conventions: { unitSystem: 'SI', metricSignature: '-+++' }, witnesses: [w] },
      new Set(['W-c']),
    );
    expect(tags.has('convention-checked')).toBe(false);
  });
});

describe('contradicted — an unresolved counterexample, and only that', () => {
  it('an unresolved counterexample contradicts', () => {
    const tags = deriveEvidence({ counterexamples: [{ description: 'c', witness: 'W2b' }] });
    expect(sorted(tags)).toEqual(['contradicted']);
  });

  it('a resolved counterexample does not contradict', () => {
    const tags = deriveEvidence({ counterexamples: [{ description: 'c', resolvedBy: 'W9' }] });
    expect(tags.has('contradicted')).toBe(false);
    expect(sorted(tags)).toEqual(['proposed']);
  });

  it('an empty counterexample list contradicts nothing (existential, false on empty)', () => {
    expect(deriveEvidence({ counterexamples: [] }).has('contradicted')).toBe(false);
  });
});

describe('adjudication precedence — THREE verdicts, from REAL catalog entries (§4)', () => {
  const rejected = BRIDGE_EQUATIONS.find((e) => e.id === 35);
  const unadjudicated = BRIDGE_EQUATIONS.find(
    (e) => adjudicateBridgeEntry(e) === 'unadjudicated',
  );
  const bridge = BRIDGE_EQUATIONS.find((e) => adjudicateBridgeEntry(e) === 'bridge');

  it('BE-35 is a genuine rejected-but-in-catalog row, read from REJECTED_BRIDGE_IDS', () => {
    expect(rejected).toBeDefined();
    expect(REJECTED_BRIDGE_IDS.has(35)).toBe(true);
    expect(adjudicateBridgeEntry(rejected!)).toBe('not-a-bridge');
  });

  it('a rejected row derives {contradicted} regardless of its witnesses', () => {
    const withEvidence: EvidenceInput = {
      witnesses: [symbolic, numeric, dimensional],
      conventions: { unitSystem: 'SI' },
    };
    const tags = deriveEvidenceForVerdict('not-a-bridge', withEvidence, new Set(['W-sym', 'W-num', 'W-dim']));
    expect(sorted(tags)).toEqual(['contradicted']);
  });

  it('an unadjudicated row derives {proposed} only — no refutation, no support', () => {
    expect(unadjudicated).toBeDefined();
    const tags = deriveEvidenceForVerdict(
      'unadjudicated',
      { witnesses: [symbolic], counterexamples: [{ description: 'c' }] },
      new Set(['W-sym']),
    );
    expect(sorted(tags)).toEqual(['proposed']);
  });

  it('a bridge row runs the normal derivation', () => {
    expect(bridge).toBeDefined();
    const tags = deriveEvidenceForVerdict('bridge', { witnesses: [symbolic] }, new Set(['W-sym']));
    expect(sorted(tags)).toEqual(['symbolically-checked']);
  });

  it('every catalog row adjudicates to one of exactly the three handled verdicts', () => {
    const seen = new Set(BRIDGE_EQUATIONS.map((e) => adjudicateBridgeEntry(e)));
    for (const v of seen) expect(['bridge', 'not-a-bridge', 'unadjudicated']).toContain(v);
    expect(VERDICT_UNIONS_AGREE).toBe(true);
  });
});

describe('TRUTHFUL MIGRATION — the overlay adds evidence to NO existing catalog row', () => {
  it('every one of the 55 rows derives {proposed}, or {contradicted} iff it is rejected', () => {
    expect(BRIDGE_EQUATIONS.length).toBe(55);
    const offenders: string[] = [];
    for (const entry of BRIDGE_EQUATIONS) {
      const verdict = adjudicateBridgeEntry(entry);
      const tags = sorted(deriveEvidenceForVerdict(verdict, entry));
      const expected = REJECTED_BRIDGE_IDS.has(entry.id) ? ['contradicted'] : ['proposed'];
      if (JSON.stringify(tags) !== JSON.stringify(expected)) {
        offenders.push(`BE-${entry.id} (${verdict}) => ${tags.join(',')}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});
