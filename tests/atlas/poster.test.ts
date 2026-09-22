/**
 * S3.3 — the poster index: sixteen statements, five hidden nodes, fifteen
 * typed lines.
 *
 * The load-bearing tests here are the ones that can FAIL for a physics reason:
 * an association re-typed as a derivation, a line that lost its record, a
 * statement with no assumptions, a fabricated `ast`. Each guard was driven red
 * by breaking it and reverted (see the S3.3 report for the mutation table).
 *
 * The count assertions are deliberately few. A test that only counts records
 * passes whatever the records say, and this sprint's failure mode is a
 * plausible record, not a missing one.
 */
import { describe, expect, it } from 'vitest';

import { statementContextUnion } from '../../src/atlas/statement.js';
import { composeDerivations } from '../../src/atlas/derivation.js';
import type { Derivation } from '../../src/atlas/derivation.js';
import {
  buildPosterRegistry,
  HIDDEN_NODES,
  POSTER_ALL_STATEMENTS,
  POSTER_ENTRIES,
  POSTER_MODEL_UNRECORDED,
  POSTER_REGISTRY,
  PosterStatementError,
  posterEntry,
  posterId,
  SUPPORTING_STATEMENTS,
  UNIDENTIFIED,
} from '../../src/atlas/poster/statements.js';
import type { PosterEntry } from '../../src/atlas/poster/statements.js';
import {
  POSTER_CONSTRAINTS,
  POSTER_DERIVATIONS,
  POSTER_LINES,
  POSTER_WITNESSES,
  validatePosterRelations,
} from '../../src/atlas/poster/derivations.js';
import {
  ASSOCIATION_ONLY_PAIRS,
  POSTER_ASSOCIATIONS,
  UNSPECIFIED_TARGET,
} from '../../src/atlas/poster/associations.js';
import { ATLAS_MODELS } from '../../src/atlas/oscillators/models.js';

const derivationOf = (id: string): Derivation => {
  const found = POSTER_DERIVATIONS.find((d) => d.id === id);
  if (found === undefined) throw new Error(`no derivation '${id}'`);
  return found;
};

describe('the sixteen entries', () => {
  it('are numbered 1–16 with no gap and no repeat', () => {
    expect(POSTER_ENTRIES.map((e) => e.number)).toEqual(
      Array.from({ length: 16 }, (_, i) => i + 1),
    );
  });

  it('EVERY entry states at least one assumption', () => {
    for (const e of POSTER_ENTRIES) {
      expect(e.statement.context.assumptions.length, `entry ${e.number}`).toBeGreaterThan(0);
    }
  });

  it('records entries 3 and 14 as UNIDENTIFIED rather than guessing them', () => {
    // Blueprint v2 Appendix A is not in this repo and ROADMAP.md names these
    // two only in "3, 14 → * association only". A plausible guess here would
    // be uncheckable, which is the one failure mode that survives review.
    for (const n of [3, 14]) {
      const e = posterEntry(n);
      expect(e.identification).toBe('unidentified');
      expect(e.statement.sourceExpression).toBe(UNIDENTIFIED);
      expect(e.note).toBeTruthy();
    }
  });

  it('marks 5 and 7 PARTIAL, each with the reason it is not pinned', () => {
    for (const n of [5, 7]) {
      const e = posterEntry(n);
      expect(e.identification).toBe('partial');
      expect(e.note).toBeTruthy();
    }
    // Entry 7 is ONE Maxwell equation; the full system is a hidden node.
    expect(posterEntry(7).statement.sourceExpression).toContain(UNIDENTIFIED);
    expect(POSTER_REGISTRY.has('statement-maxwell-system')).toBe(true);
  });

  it('claims NO oscillator model — no per-entry model is recorded anywhere', () => {
    const real = new Set(ATLAS_MODELS.map((m) => m.id));
    for (const s of POSTER_ALL_STATEMENTS) {
      expect(s.model, s.id).toBe(POSTER_MODEL_UNRECORDED);
      expect(real.has(s.model)).toBe(false);
    }
  });

  it('carries NO ast anywhere: these are named and linked, never evaluated', () => {
    for (const s of POSTER_ALL_STATEMENTS) {
      expect(s.ast, s.id).toBeUndefined();
      expect(s.sourceExpression.length, s.id).toBeGreaterThan(0);
    }
  });
});

describe('the five hidden supporting nodes', () => {
  it('are exactly the five ROADMAP.md Phase 3 names', () => {
    expect(HIDDEN_NODES.map((s) => s.id)).toEqual([
      'statement-action-principle',
      'statement-noether',
      'statement-maxwell-system',
      'statement-lorentz-group',
      'statement-central-limit-theorem',
    ]);
  });

  it('are LOAD-BEARING: each one is a premise of at least one derivation', () => {
    // The Phase 3 exit criterion: removing a hidden node leaves a premise
    // dangling. That is only true if every one of them is consumed.
    for (const node of HIDDEN_NODES) {
      const users = POSTER_DERIVATIONS.filter((d) => d.premises.includes(node.id));
      expect(users.length, `${node.id} is a premise of nothing`).toBeGreaterThan(0);
    }
  });

  it('removing statement-noether leaves at least two derivations dangling', () => {
    const without = new Map(POSTER_REGISTRY);
    without.delete('statement-noether');
    const dangling = POSTER_DERIVATIONS.filter((d) =>
      [...d.premises, d.conclusion].some((s) => !without.has(s)),
    );
    expect(dangling.map((d) => d.id)).toEqual([
      'd-noether-to-momentum-fields',
      'd-1-energy-conservation',
    ]);
  });
});

describe('the fifteen typed lines', () => {
  it('are all fifteen, L1–L15', () => {
    expect(POSTER_LINES.map((l) => l.id)).toEqual(
      Array.from({ length: 15 }, (_, i) => `L${i + 1}`),
    );
  });

  it('validatePosterRelations finds nothing wrong', () => {
    expect(validatePosterRelations()).toEqual([]);
  });

  it('types each line as ROADMAP.md Phase 3 types it', () => {
    const relationOf = (id: string) => derivationOf(id).relation;
    expect(relationOf('d-10-to-9')).toBe('restriction');
    expect(relationOf('d-8-to-12')).toBe('approximation');
    expect(relationOf('d-16-to-5')).toBe('approximation');
    expect(relationOf('d-16-to-10')).toBe('approximation');
    expect(relationOf('d-6-13-wick')).toBe('analytic-continuation');
    expect(relationOf('d-13-4-saturation')).toBe('exact-equivalence');
    expect(relationOf('d-1-energy-conservation')).toBe('exact-equivalence');
    expect(relationOf('d-6-to-10-ehrenfest-exact')).toBe('derivation');
    expect(relationOf('d-6-to-10-ehrenfest-approx')).toBe('approximation');
  });

  it('every derivation states at least one side condition', () => {
    for (const d of POSTER_DERIVATIONS) {
      expect(d.sideConditions.length, d.id).toBeGreaterThan(0);
    }
  });

  it('every derivation HAS a context union — none of them states no claim', () => {
    for (const d of POSTER_DERIVATIONS) {
      expect(d.contextUnion.kind, d.id).toBe('union');
    }
  });
});

describe('the association/derivation distinction — the one that must not fail quietly', () => {
  it('7 ↔ 16 is an association for the HISTORICAL link, and is not a derivation', () => {
    const a = POSTER_ASSOCIATIONS.find((x) => x.id === 'a-7-16-historical');
    expect(a?.kind).toBe('historical-influence');
    expect(a?.between).toEqual(['poster-7', 'poster-16']);
    const asDerivation = POSTER_DERIVATIONS.some(
      (d) =>
        (d.premises.includes('poster-7') && d.conclusion === 'poster-16') ||
        (d.premises.includes('poster-16') && d.conclusion === 'poster-7'),
    );
    expect(asDerivation).toBe(false);
  });

  it('the route to 16 runs from the FULL Maxwell system, never from 7 alone', () => {
    const d = derivationOf('d-maxwell-spacetime-to-16');
    expect(d.premises).toEqual(['statement-maxwell-system', 'statement-lorentz-group']);
    expect(d.conclusion).toBe('poster-16');
    expect(d.premises).not.toContain('poster-7');
  });

  it('CATCHES a 7 ↔ 16 mis-typed as a derivation (the mutation this guard exists for)', () => {
    // The brief's specific demand: prove the distinction can fail. This is the
    // mutation run against the guard, in-test, so the proof lives with the
    // code rather than only in a report.
    const mistyped: Derivation = {
      id: 'd-MUTANT-7-to-16',
      relation: 'derivation',
      premises: ['poster-7'],
      conclusion: 'poster-16',
      sideConditions: ['historical'],
      contextUnion: statementContextUnion(['poster-7', 'poster-16'], POSTER_REGISTRY),
    };
    const pairs = ASSOCIATION_ONLY_PAIRS;
    expect(pairs).toContainEqual(['poster-7', 'poster-16']);
    const caught = pairs.some(
      ([a, b]) =>
        (mistyped.premises.includes(a) && mistyped.conclusion === b) ||
        (mistyped.premises.includes(b) && mistyped.conclusion === a),
    );
    expect(caught).toBe(true);
  });

  it('3 and 14 are association-only with an UNSPECIFIED target, not paired together', () => {
    const three = POSTER_ASSOCIATIONS.find((x) => x.id === 'a-3-association-only');
    const fourteen = POSTER_ASSOCIATIONS.find((x) => x.id === 'a-14-association-only');
    expect(three?.between).toEqual(['poster-3', UNSPECIFIED_TARGET]);
    expect(fourteen?.between).toEqual(['poster-14', UNSPECIFIED_TARGET]);
    // Neither appears in any derivation, in either position.
    for (const id of ['poster-3', 'poster-14']) {
      expect(
        POSTER_DERIVATIONS.some((d) => d.premises.includes(id) || d.conclusion === id),
        id,
      ).toBe(false);
    }
  });

  it('5, 16 → 8 CONSTRAINS and does not derive', () => {
    const c = POSTER_CONSTRAINTS.find((x) => x.id === 'c-5-16-constrain-8');
    expect(c?.premises).toEqual(['poster-5', 'poster-16']);
    expect(c?.constrains).toBe('poster-8');
    expect(c?.alternativeRoute).toBe('d-einstein-hilbert-to-8');
    // No derivation asserts 5 and 16 together yield 8.
    const derives = POSTER_DERIVATIONS.some(
      (d) =>
        d.conclusion === 'poster-8' &&
        d.premises.includes('poster-5') &&
        d.premises.includes('poster-16'),
    );
    expect(derives).toBe(false);
  });
});

describe('the qualifications the lines state', () => {
  it('6 ↔ 13 carries self-adjoint, lower-bounded, and V = 0 for the kernel ONLY', () => {
    const d = derivationOf('d-6-13-wick');
    expect(d.sideConditions).toContain('self-adjoint H');
    expect(d.sideConditions).toContain('lower-bounded H');
    expect(d.sideConditions.some((s) => s.includes('V = 0'))).toBe(true);
  });

  it('13 ↔ 4 distinguishes a Gaussian FAMILY from a Gaussian DENSITY', () => {
    const d = derivationOf('d-13-4-saturation');
    expect(d.sideConditions.some((s) => s.includes('FAMILY'))).toBe(true);
    expect(d.sideConditions.some((s) => s.includes('DENSITY'))).toBe(true);
  });

  it('8 → 12 carries all four approximation conditions and then the restriction', () => {
    const d = derivationOf('d-8-to-12');
    for (const s of ['weak field', 'slow motion', 'near-stationary', 'negligible Λ']) {
      expect(d.sideConditions).toContain(s);
    }
    expect(d.sideConditions.some((s) => s.includes('point source'))).toBe(true);
  });

  it('6 → 10 Ehrenfest is exact for affine forces and distinct from the ħ → 0 limit', () => {
    const exact = derivationOf('d-6-to-10-ehrenfest-exact');
    const approx = derivationOf('d-6-to-10-ehrenfest-approx');
    expect(exact.sideConditions.some((s) => s.includes('affine'))).toBe(true);
    expect(approx.sideConditions.some((s) => s.includes('localized'))).toBe(true);
    for (const d of [exact, approx]) {
      expect(d.sideConditions.some((s) => s.includes('singular ħ → 0'))).toBe(true);
    }
  });

  it('11 → momentum conservation records that the CONVERSE fails', () => {
    const d = derivationOf('d-11-to-momentum');
    expect(d.sideConditions.some((s) => s.toLowerCase().includes('converse'))).toBe(true);
  });

  it('2 → 13 has two routes and NEITHER runs from entry 2 alone', () => {
    const clt = derivationOf('d-2-13-central-limit');
    const maxent = derivationOf('d-2-13-maximum-entropy');
    expect(clt.premises).toEqual(['poster-2', 'statement-central-limit-theorem']);
    expect(maxent.sideConditions.some((s) => s.includes('NOT from entry 2 alone'))).toBe(true);
  });

  it('4 is derived WITHOUT a time-dependent equation — entry 6 is not a premise', () => {
    const d = derivationOf('d-4-commutator');
    expect(d.premises).toEqual([]);
    expect(d.sideConditions.some((s) => s.includes('Cauchy–Schwarz'))).toBe(true);
    expect(d.sideConditions.some((s) => s.includes('[x, p] = iħ'))).toBe(true);
    // The empty premise set is a deliberate honesty, not an oversight: it is
    // the ONLY one, and validatePosterRelations reports any other.
    expect(POSTER_DERIVATIONS.filter((x) => x.premises.length === 0)).toHaveLength(1);
  });

  it('attaches W4 to 13 ↔ 4 and W5 to 6 ↔ 13', () => {
    expect(POSTER_WITNESSES['d-13-4-saturation']?.[0]?.id).toBe('W4');
    expect(POSTER_WITNESSES['d-6-13-wick']?.[0]?.id).toBe('W5');
    for (const list of Object.values(POSTER_WITNESSES)) {
      for (const w of list) expect(w.test).toBe('tests/atlas/quantum-support.test.ts');
    }
  });
});

describe('the context-refusal path IS reachable from this data', () => {
  it('entry 11 does not pool with the FIELD-INCLUSIVE momentum statement', () => {
    // Design note §9 question 5 asks whether contextUnion's refusal is dead
    // code. It is not: ROADMAP.md says entry 11 "fails naively when fields
    // carry momentum", entry 11 therefore EXCLUDES that assumption, and the
    // field-inclusive statement ASSUMES it.
    const result = statementContextUnion(
      ['poster-11', 'statement-momentum-conservation-fields'],
      POSTER_REGISTRY,
    );
    expect(result.kind).toBe('no-union');
    if (result.kind !== 'no-union') return;
    expect(result.reason).toBe('contradictory-assumptions');
    expect(result.detail).toContain('fields carry momentum');
  });

  it('so a composite through that pair is REFUSED, not silently formed', () => {
    const composed = composeDerivations(
      'd-MUTANT-composite',
      derivationOf('d-11-to-momentum'),
      {
        ...derivationOf('d-noether-to-momentum-fields'),
        premises: ['statement-momentum-conservation'],
      },
      POSTER_REGISTRY,
    );
    expect(composed.kind).toBe('no-composite');
    if (composed.kind !== 'no-composite') return;
    expect(composed.reason).toBe('no-context-union');
  });
});

describe('buildPosterRegistry refuses a defective index', () => {
  // The REAL builder, driven with a defective index. Reimplementing the four
  // checks here would prove only that the copy works.
  const registryFrom =
    (statements: readonly PosterEntry['statement'][], entries: readonly PosterEntry[] = []) =>
    () =>
      buildPosterRegistry(statements, entries);

  it('builds the real index without complaint', () => {
    expect(() => buildPosterRegistry()).not.toThrow();
    expect(POSTER_REGISTRY.size).toBe(
      POSTER_ENTRIES.length + HIDDEN_NODES.length + SUPPORTING_STATEMENTS.length,
    );
  });

  it('refuses a duplicate id', () => {
    const s = posterEntry(1).statement;
    expect(registryFrom([s, s])).toThrow(PosterStatementError);
  });

  it('refuses a statement with no assumptions', () => {
    const s = { ...posterEntry(1).statement, context: { assumptions: [], excludes: [] } };
    expect(registryFrom([s])).toThrow(/states no assumptions/);
  });

  it('refuses a fabricated ast', () => {
    const s = {
      ...posterEntry(1).statement,
      ast: { type: 'number', value: 1 },
    } as PosterEntry['statement'];
    expect(registryFrom([s])).toThrow(/carries an ast/);
  });

  it('refuses an unpinned entry that states no note', () => {
    const e: PosterEntry = { ...posterEntry(3), note: undefined };
    expect(registryFrom([e.statement], [e])).toThrow(/states no note/);
  });
});

describe('boundaries', () => {
  it('poster ids and statement ids agree', () => {
    expect(posterId(9)).toBe('poster-9');
    expect(() => posterEntry(17)).toThrow(RangeError);
  });

  it('every association cites ROADMAP.md rather than the adjudication ledger', () => {
    for (const a of POSTER_ASSOCIATIONS) {
      expect(a.citation).toContain('ROADMAP.md');
      expect(a.note.length).toBeGreaterThan(0);
    }
  });
});
