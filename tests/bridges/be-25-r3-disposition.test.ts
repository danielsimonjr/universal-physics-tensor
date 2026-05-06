import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

describe('BE-25 (Penrose-Hameroff Orch-OR) — R3 mark-invalid disposition (2026-05-05, Wave L Tier E3, per Phys C4 iter-3)', () => {
  const be25 = BRIDGE_EQUATIONS.find((e) => e.id === 25)!;

  it('exists', () => {
    expect(be25).toBeDefined();
  });

  it('status is invalid (R3 disposition, Wave L Tier E3 — completes the cascade deferred from Wave J Tier B3)', () => {
    expect(be25.status).toBe('invalid');
  });

  it('has at least two known_issues with fixable: unfixable-must-mark-invalid', () => {
    const unfixable = be25.known_issues.filter(
      (i) => i.fixable === 'unfixable-must-mark-invalid',
    );
    expect(unfixable.length).toBeGreaterThanOrEqual(2);
  });

  it('records the Tegmark falsification (decoherence timescale gap)', () => {
    const corpus = be25.known_issues.map((i) => i.description).join(' ');
    expect(corpus).toMatch(/Tegmark|decoherence.*time|10.*-13|10\^-13|biological temperature/i);
  });

  it('records the non-Penrose form defect (Δm c² Δx / l_P does not match Penrose E_G ~ G(Δm)²/Δx)', () => {
    const corpus = be25.known_issues.map((i) => i.description).join(' ');
    expect(corpus).toMatch(/Penrose|E_G.*G.*Δm|spurious.*factor|non-Penrose/i);
  });

  it('notes block leads with INVALID disposition statement and Wave L Tier E3', () => {
    expect(be25.notes).toMatch(/INVALID per disposition/i);
    expect(be25.notes).toMatch(/Wave L Tier E3/);
  });
});
