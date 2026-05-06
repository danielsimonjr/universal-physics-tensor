import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-36 (Hybrid Linear Blend MOND) — R3 mark-invalid disposition (Wave N Tier C7, 2026-05-06)', () => {
  const be36 = BRIDGE_EQUATIONS.find((e) => e.id === 36)!;

  it('exists', () => {
    expect(be36).toBeDefined();
  });

  it('status is invalid (R3 disposition)', () => {
    expect(be36.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be36.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites the bespoke-ansatz nature and Milgrom 1983 canonical MOND', () => {
    const corpus = [
      be36.notes,
      ...be36.known_issues.map((i) => i.description),
      ...be36.references,
    ].join(' ');
    expect(corpus).toMatch(/bespoke|not.*standard.*MOND|hybrid.*linear blend/i);
    expect(corpus).toMatch(/Milgrom 1983|Astrophys.*270:365/);
  });

  it('notes the BE-38 canonical MOND coverage and Famaey-McGaugh review', () => {
    const corpus = [
      be36.notes,
      ...be36.known_issues.map((i) => i.description),
      ...be36.references,
    ].join(' ');
    expect(corpus).toMatch(/BE-38/);
    expect(corpus).toMatch(/Famaey.*McGaugh|1112\.3960/);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be36.notes).toMatch(/INVALID per disposition/i);
  });

  it('notes references Wave N Tier C7', () => {
    expect(be36.notes).toMatch(/Wave N Tier C7/);
  });
});
