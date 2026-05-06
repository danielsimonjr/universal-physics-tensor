import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-12 (Mesoscopic Coherence Length) — R3 mark-invalid disposition (Wave N Tier C1, 2026-05-06)', () => {
  const be12 = BRIDGE_EQUATIONS.find((e) => e.id === 12)!;

  it('exists', () => {
    expect(be12).toBeDefined();
  });

  it('status is invalid (R3 disposition)', () => {
    expect(be12.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be12.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites the three undefined quantities that block reformulation', () => {
    const corpus = [
      be12.notes,
      ...be12.known_issues.map((i) => i.description),
    ].join(' ');
    expect(corpus).toMatch(/ξ_0|xi_0/);
    expect(corpus).toMatch(/ω_decoherence|omega_decoherence/);
    expect(corpus).toMatch(/cube|N_c/);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be12.notes).toMatch(/INVALID per disposition/i);
  });

  it('notes references Wave N Tier C1', () => {
    expect(be12.notes).toMatch(/Wave N Tier C1/);
  });

  it('dependency on BE-11 is preserved (ω_c question hinges on it)', () => {
    expect(be12.dependencies).toContain(11);
  });
});
