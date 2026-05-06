import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-33 (Quantum-Classical Critical Point Mapping) — R3 mark-invalid disposition (Wave N Tier C6, 2026-05-06)', () => {
  const be33 = BRIDGE_EQUATIONS.find((e) => e.id === 33)!;

  it('exists', () => {
    expect(be33).toBeDefined();
  });

  it('status is invalid (R3 disposition)', () => {
    expect(be33.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be33.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites the Hertz-Millis canonical scaling and the wrong T → 0 limit', () => {
    const corpus = [
      be33.notes,
      ...be33.known_issues.map((i) => i.description),
    ].join(' ');
    expect(corpus).toMatch(/Hertz-Millis|Hertz 1976|Millis 1993/);
    expect(corpus).toMatch(/T\s*->\s*0|T → 0|T \\to 0|wrong.*limit/i);
    expect(corpus).toMatch(/T\^.*-?\s*[νn]\s*\/\s*z|nu\s*\/\s*z|−ν\/z|-nu\/z/);
  });

  it('cites the absent dynamic exponent z as a coupled defect', () => {
    const corpus = [
      be33.notes,
      ...be33.known_issues.map((i) => i.description),
    ].join(' ');
    expect(corpus).toMatch(/dynamic exponent z|exponent\s+z\b|z\s+absent|z\s+is\s+absent/i);
  });

  it('cites universality-class commitment as a physics decision', () => {
    const corpus = [
      be33.notes,
      ...be33.known_issues.map((i) => i.description),
    ].join(' ');
    expect(corpus).toMatch(/Ising|XY|Heisenberg|Hertz-Millis-Moriya|universality class/i);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be33.notes).toMatch(/INVALID per disposition/i);
  });

  it('notes references Wave N Tier C6', () => {
    expect(be33.notes).toMatch(/Wave N Tier C6/);
  });
});
