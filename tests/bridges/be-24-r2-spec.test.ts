/**
 * R2 reformulation gap-spec regression test for BE-24 (Quantum Coherence
 * in Photosynthesis Efficiency).
 *
 * Branch: chore/r2-batch-reformulation-specs (2026-05-04)
 *
 * Pins three documented positivity-preserving reformulation paths
 * (FRET, HEOM/Redfield, Lindblad). Prevents silent promotion before a
 * domain expert (ENAQT specialist) selects.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be24 = BRIDGE_EQUATIONS.find((e) => e.id === 24);

describe('BE-24 R2 reformulation gap-spec', () => {
  it('exists and is speculative', () => {
    expect(be24).toBeDefined();
    expect(be24!.status).toBe('speculative');
  });

  it('all known_issues are reformulation-fixable', () => {
    expect(be24!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be24!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes contain the "What would unblock a real fix" gap-record marker', () => {
    expect(be24!.notes).toMatch(/What would unblock a real fix/);
  });

  it('references include FRET (Förster), HEOM (Ishizaki-Fleming), and consensus update (Cao or Duan)', () => {
    const refs = be24!.references.join(' | ');
    expect(refs).toMatch(/Förster|Forster|FRET/i);
    expect(refs).toMatch(/Ishizaki|HEOM/i);
    expect(refs).toMatch(/Cao|Duan/i);
  });
});
