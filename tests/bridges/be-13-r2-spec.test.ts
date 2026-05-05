/**
 * R2 reformulation gap-spec regression test for BE-13 (Landauer-Wheeler
 * Information-Geometry Equation).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Pins the gap-record so a future contributor cannot silently promote
 * BE-13 to R5 without supplying the physics decisions documented in the
 * spec's R2 reformulation gap block (Jacobson vs. Verlinde vs.
 * information-density redefinition).
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be13 = BRIDGE_EQUATIONS.find((e) => e.id === 13);

describe('BE-13 R2 reformulation gap-spec', () => {
  it('exists and is highly-speculative', () => {
    expect(be13).toBeDefined();
    expect(be13!.status).toBe('highly-speculative');
  });

  it('has at least one reformulation-fixable known_issue', () => {
    const refIssues = be13!.known_issues.filter(
      (i) => i.fixable === 'reformulation',
    );
    expect(refIssues.length).toBeGreaterThan(0);
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be13!.notes).toMatch(/What would unblock a real fix/);
  });

  it('references include both Jacobson and Verlinde candidate paths', () => {
    const refs = be13!.references.join(' | ');
    expect(refs).toMatch(/Jacobson|gr-qc\/9504004/i);
    expect(refs).toMatch(/Verlinde|1001\.0785/i);
  });
});
