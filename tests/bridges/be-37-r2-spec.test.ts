/**
 * R2 reformulation gap-spec regression test for BE-37 (Variable Speed
 * of Light Cosmology).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Complementary to be-37-preserve.test.ts. Pins the three named VSL
 * frameworks (Albrecht-Magueijo, Moffat, Barrow) and the Ellis-Uzan
 * operational-meaningfulness critique as part of the gap-record.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be37 = BRIDGE_EQUATIONS.find((e) => e.id === 37);

describe('BE-37 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be37).toBeDefined();
    expect(be37!.status).toBe('speculative');
  });

  it('all known_issues are reformulation-fixable', () => {
    expect(be37!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be37!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be37!.notes).toMatch(/What would unblock a real fix/);
  });

  it('notes name all three VSL frameworks (Albrecht-Magueijo, Moffat, Barrow)', () => {
    const n = be37!.notes;
    expect(n).toMatch(/Albrecht-Magueijo|astro-ph\/9811018/);
    expect(n).toMatch(/Moffat/);
    expect(n).toMatch(/Barrow/);
  });

  it('notes flag the Ellis-Uzan operational-meaningfulness critique', () => {
    expect(be37!.notes).toMatch(/Ellis-Uzan|gr-qc\/0305099|operationally meaningless/i);
  });
});
