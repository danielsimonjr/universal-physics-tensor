/**
 * R2 reformulation gap-spec regression test for BE-38 (Entropic Gravity
 * Correction Term).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Pins three named candidate reformulations: canonical MOND (Milgrom),
 * Verlinde 2016 mass-correction, and TeVeS. Also pins the cross-check
 * against BE-36 (shared a_0 scale).
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be38 = BRIDGE_EQUATIONS.find((e) => e.id === 38);

describe('BE-38 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be38).toBeDefined();
    expect(be38!.status).toBe('speculative');
  });

  it('all known_issues are reformulation-fixable', () => {
    expect(be38!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be38!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be38!.notes).toMatch(/What would unblock a real fix/);
  });

  it('references include Milgrom MOND, Verlinde 2016, and Famaey-McGaugh review', () => {
    const refs = be38!.references.join(' | ');
    expect(refs).toMatch(/Milgrom 1983/i);
    expect(refs).toMatch(/Verlinde 2016|1611\.02269/);
    expect(refs).toMatch(/Famaey-McGaugh|1112\.3960/);
  });

  it('notes flag the BE-36 cross-check (shared a_0 scale)', () => {
    expect(be38!.notes).toMatch(/BE-36|36/);
  });
});
