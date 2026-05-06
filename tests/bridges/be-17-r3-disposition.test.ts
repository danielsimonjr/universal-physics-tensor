import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-17 (EM-Gravitational Torsion) — R3 mark-invalid disposition (Wave N Tier C4, 2026-05-06)', () => {
  const be17 = BRIDGE_EQUATIONS.find((e) => e.id === 17)!;

  it('exists', () => {
    expect(be17).toBeDefined();
  });

  it('status is invalid (R3 disposition)', () => {
    expect(be17.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be17.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites the three orthogonal structural defects', () => {
    const corpus = [
      be17.notes,
      ...be17.known_issues.map((i) => i.description),
    ].join(' ');
    expect(corpus).toMatch(/index|rank-2|rank-4/i);
    expect(corpus).toMatch(/ℓ_EM|l_EM|l_\{EM\}/);
    expect(corpus).toMatch(/contorsion|rank-3/i);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be17.notes).toMatch(/INVALID per disposition/i);
  });

  it('notes references Wave N Tier C4', () => {
    expect(be17.notes).toMatch(/Wave N Tier C4/);
  });
});
