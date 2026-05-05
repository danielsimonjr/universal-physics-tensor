/**
 * R2 reformulation gap-spec regression test for BE-12 (Mesoscopic
 * Coherence Length Equation).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * This test pins the structured "what would unblock a real fix"
 * specification recorded in the R2 batch documentation pass. It is
 * complementary to be-12-preserve.test.ts: that test asserts the R1->R2
 * re-tier decision; *this* test asserts the gap-record content so a
 * future contributor cannot silently promote BE-12 to R5 without
 * supplying the physics decisions documented here.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be12 = BRIDGE_EQUATIONS.find((e) => e.id === 12);

describe('BE-12 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be12).toBeDefined();
    expect(be12!.status).toBe('speculative');
  });

  it('has at least one reformulation-fixable known_issue', () => {
    const refIssues = be12!.known_issues.filter(
      (i) => i.fixable === 'reformulation',
    );
    expect(refIssues.length).toBeGreaterThan(0);
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be12!.notes).toMatch(/What would unblock a real fix/);
  });

  it('notes record the candidate-form list (ξ_0 length-scale options)', () => {
    // Three named candidates from the gap-spec: thermal de Broglie,
    // BEC healing length, Caldeira-Leggett cutoff. The notes must
    // reference at least one so the gap-record stays self-contained.
    expect(be12!.notes).toMatch(/de Broglie|healing length|Caldeira-Leggett/i);
  });

  it('dependency on BE-11 is preserved (ω_c question hinges on it)', () => {
    expect(be12!.dependencies).toContain(11);
  });
});
