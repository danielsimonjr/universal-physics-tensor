/**
 * R2 reformulation gap-spec regression test for BE-31 (Causal Set —
 * Continuum Limit).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Complementary to be-31-preserve.test.ts. Pins the BD inclusion-
 * exclusion-count form as the named replacement target so a future
 * contributor cannot promote without verifying dimension-by-dimension
 * constants.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be31 = BRIDGE_EQUATIONS.find((e) => e.id === 31);

describe('BE-31 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be31).toBeDefined();
    expect(be31!.status).toBe('speculative');
  });

  it('all known_issues are reformulation-fixable', () => {
    expect(be31!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be31!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be31!.notes).toMatch(/What would unblock a real fix/);
  });

  it('notes name the BD count-difference form (N_0 - 9N_1 + 16N_2 - 8N_3)', () => {
    // Pin the structural target so anyone editing must keep the
    // citation to the specific replacement form.
    expect(be31!.notes).toMatch(/N_0|9 N_1|16 N_2|8 N_3/);
  });

  it('references include Glaser-Surya numerical study', () => {
    const refs = be31!.references.join(' | ');
    expect(refs).toMatch(/Glaser-Surya|Benincasa-Dowker/i);
  });
});
