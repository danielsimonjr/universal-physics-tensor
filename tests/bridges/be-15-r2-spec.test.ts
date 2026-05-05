/**
 * R2 reformulation gap-spec regression test for BE-15 (Universal
 * Emergence Equation).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Pins three documented non-equivalent reformulation paths:
 * Hohenberg-Halperin model A/B/C, Wetterich exact RG, Mori-Zwanzig
 * projection. Choice is a physics decision; this test prevents silent
 * promotion before that decision is recorded.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be15 = BRIDGE_EQUATIONS.find((e) => e.id === 15);

describe('BE-15 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be15).toBeDefined();
    expect(be15!.status).toBe('speculative');
  });

  it('all known_issues are now tagged fixable: reformulation', () => {
    expect(be15!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be15!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be15!.notes).toMatch(/What would unblock a real fix/);
  });

  it('references include all three candidate frameworks', () => {
    const refs = be15!.references.join(' | ');
    expect(refs).toMatch(/Hohenberg-Halperin/i);
    expect(refs).toMatch(/Wetterich/i);
    expect(refs).toMatch(/Mori|Zwanzig/i);
  });
});
