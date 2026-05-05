/**
 * R2 reformulation gap-spec regression test for BE-33 (Quantum-Classical
 * Critical Point Mapping).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Pins the Hertz-Millis canonical-scaling replacement as the named
 * target. Test ensures z and ν are documented as required exponents and
 * that the quantum-classical mapping d -> d+z (not d -> d+1) is named.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be33 = BRIDGE_EQUATIONS.find((e) => e.id === 33);

describe('BE-33 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be33).toBeDefined();
    expect(be33!.status).toBe('speculative');
  });

  it('all known_issues are reformulation-fixable', () => {
    expect(be33!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be33!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be33!.notes).toMatch(/What would unblock a real fix/);
  });

  it('notes name the Hertz-Millis canonical scaling form xi ~ T^{-nu/z}', () => {
    expect(be33!.notes).toMatch(/Hertz-Millis|Hertz 1976|Millis 1993/);
    expect(be33!.notes).toMatch(/T\^.*-?\s*[νn]\s*\/\s*z|nu\s*\/\s*z/);
  });

  it('references include Hertz, Millis, and Sondhi et al.', () => {
    const refs = be33!.references.join(' | ');
    expect(refs).toMatch(/Hertz/i);
    expect(refs).toMatch(/Millis/i);
    expect(refs).toMatch(/Sondhi|Sachdev/i);
  });
});
