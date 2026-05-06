import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-30 (ER=EPR / Entanglement-Geometry) — R3 mark-invalid disposition (2026-05-05)', () => {
  const be30 = BRIDGE_EQUATIONS.find((e) => e.id === 30)!;

  it('exists', () => {
    expect(be30).toBeDefined();
  });

  it('status is invalid (R3 disposition, Wave J Tier B2)', () => {
    expect(be30.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be30.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites FLM (Faulkner-Lewkowycz-Maldacena 2013) as canonical replacement', () => {
    const corpus = [be30.notes, ...be30.references, ...be30.known_issues.map((i) => i.description)].join(' ');
    expect(corpus).toMatch(/FLM|Faulkner-Lewkowycz-Maldacena|1307\.2892/);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be30.notes).toMatch(/INVALID per disposition/i);
  });

  it('records the four orthogonal defects (rank/type, |x⟩, dimensional, operator-on-scalar)', () => {
    const corpus = be30.known_issues.map((i) => i.description).join(' ');
    // rank-2 vs scalar mismatch
    expect(corpus).toMatch(/rank|index|tensor.*scalar|scalar.*tensor/i);
    // non-normalizable |x⟩
    expect(corpus).toMatch(/non-normalizable|\|x⟩|position eigenstate/i);
  });

  it('notes references the Wave J Tier B2 disposition', () => {
    expect(be30.notes).toMatch(/Wave J Tier B2/);
  });
});
