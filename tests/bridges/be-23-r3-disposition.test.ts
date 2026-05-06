import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-23 (Strange Metal — Black Hole Duality) — R3 mark-invalid disposition (2026-05-05)', () => {
  const be23 = BRIDGE_EQUATIONS.find((e) => e.id === 23)!;

  it('exists', () => {
    expect(be23).toBeDefined();
  });

  it('status is invalid (R3 disposition, Wave J Tier B1)', () => {
    expect(be23.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be23.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('records the algebraic-collapse rationale (τ_P · k_B T = ℏ)', () => {
    const corpus = [be23.notes, ...be23.known_issues.map((i) => i.description)].join(' ');
    expect(corpus).toMatch(/τ_P · k_B T = ℏ|τ_P\s*·\s*k_B T\s*=\s*ℏ/);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be23.notes).toMatch(/INVALID per disposition/i);
  });

  it('preserves the original (vacuous) formula verbatim for traceability', () => {
    expect(be23.formula_latex).toBe(
      '\\rho(T) = \\rho_0 + AT + B\\sqrt{\\frac{\\hbar}{k_B T \\tau_P}}',
    );
  });

  it('notes references the Wave J Tier B1 disposition', () => {
    expect(be23.notes).toMatch(/Wave J Tier B1/);
  });
});
