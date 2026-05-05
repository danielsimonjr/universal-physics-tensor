import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-37 (Variable Speed of Light Cosmology) — R3 mark-invalid disposition (2026-05-05)', () => {
  const be37 = BRIDGE_EQUATIONS.find((e) => e.id === 37)!;

  it('exists', () => {
    expect(be37).toBeDefined();
  });

  it('status is invalid (R3 disposition)', () => {
    expect(be37.status).toBe('invalid');
  });

  it('has at least one known_issue with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be37.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThan(0);
  });

  it('cites Ellis-Uzan in references or notes (operational-meaninglessness critique)', () => {
    const corpus = [be37.notes, ...be37.references].join(' ');
    expect(corpus).toMatch(/Ellis-Uzan|gr-qc\/0305099/);
  });

  it('notes block leads with INVALID disposition statement', () => {
    expect(be37.notes).toMatch(/INVALID per disposition/i);
  });

  it('notes references the disposition brief', () => {
    expect(be37.notes).toMatch(/BE-37-VSL-Disposition-Brief/);
  });
});
