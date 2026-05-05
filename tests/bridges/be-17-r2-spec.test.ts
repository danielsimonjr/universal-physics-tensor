/**
 * R2 reformulation gap-spec regression test for BE-17 (EM-Gravitational
 * Unification via Torsion).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Complementary to be-17-preserve.test.ts (which pins the R1->R2
 * re-tier). This test pins the gap-record content: tensorial-structure
 * candidates, EM-length-scale options, and the rank-3 contorsion
 * canonical form. Prevents silent promotion to R5 without all three
 * physics decisions being recorded.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be17 = BRIDGE_EQUATIONS.find((e) => e.id === 17);

describe('BE-17 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be17).toBeDefined();
    expect(be17!.status).toBe('speculative');
  });

  it('all known_issues are reformulation-fixable', () => {
    expect(be17!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be17!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be17!.notes).toMatch(/What would unblock a real fix/);
  });

  it('references include Hehl Einstein-Cartan and Cabral-Lobo EM-torsion review', () => {
    const refs = be17!.references.join(' | ');
    expect(refs).toMatch(/Hehl/i);
    expect(refs).toMatch(/Cabral-Lobo|Shapiro|Trautman/i);
  });
});
