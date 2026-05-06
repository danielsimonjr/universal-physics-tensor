import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-24 (Photosynthesis Coherence) — R3 mark-invalid disposition (Wave N Tier C5, 2026-05-06)', () => {
  const be24 = BRIDGE_EQUATIONS.find((e) => e.id === 24)!;

  it('exists', () => {
    expect(be24).toBeDefined();
  });

  it('status is invalid (R3 disposition)', () => {
    expect(be24.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be24.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites the bound-violation defect and the Cao 2020 vibrational consensus', () => {
    const corpus = [
      be24.notes,
      ...be24.known_issues.map((i) => i.description),
      ...be24.references,
    ].join(' ');
    expect(corpus).toMatch(/η > 1|exceed.*1|bound[- ]?violation/i);
    expect(corpus).toMatch(/Cao.*2020|vibrational/i);
  });

  it('cites the three reformulation paths (FRET / HEOM / Lindblad)', () => {
    const corpus = [
      be24.notes,
      ...be24.known_issues.map((i) => i.description),
    ].join(' ');
    expect(corpus).toMatch(/FRET|Förster|Forster/i);
    expect(corpus).toMatch(/HEOM|Redfield|Ishizaki/i);
    expect(corpus).toMatch(/Lindblad|GKSL/i);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be24.notes).toMatch(/INVALID per disposition/i);
  });

  it('notes references Wave N Tier C5', () => {
    expect(be24.notes).toMatch(/Wave N Tier C5/);
  });
});
