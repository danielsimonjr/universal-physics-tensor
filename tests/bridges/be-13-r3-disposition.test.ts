import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-13 (Landauer-Wheeler Information-Geometry) — R3 mark-invalid disposition (Wave N Tier C2, 2026-05-06)', () => {
  const be13 = BRIDGE_EQUATIONS.find((e) => e.id === 13)!;

  it('exists', () => {
    expect(be13).toBeDefined();
  });

  it('status is invalid (R3 disposition)', () => {
    expect(be13.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be13.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites Jacobson and Verlinde as I_μν-eliminating literature paths', () => {
    const corpus = [
      be13.notes,
      ...be13.known_issues.map((i) => i.description),
      ...be13.references,
    ].join(' ');
    expect(corpus).toMatch(/Jacobson|gr-qc\/9504004/);
    expect(corpus).toMatch(/Verlinde|1001\.0785/);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be13.notes).toMatch(/INVALID per disposition/i);
  });

  it('notes references Wave N Tier C2', () => {
    expect(be13.notes).toMatch(/Wave N Tier C2/);
  });
});
