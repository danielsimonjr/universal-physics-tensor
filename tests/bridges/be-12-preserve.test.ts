/**
 * Regression test for BE-12 (Mesoscopic Coherence Length) R1 audit
 * preservation as R2.
 *
 * Branch: fix/r1-batch-spec-edits (2026-05-01)
 *
 * Background: BE-12 was originally tagged R1 by the Tier-3 audit
 * ('Fix-if-cheap': speculative + spec-edit fixable). On closer inspection
 * during the R1 fix loop, the audit's classification was optimistic:
 *
 *   - The cube exponent in `N_c = (E_int / (k_B T))^3` is not motivated
 *     by any specific decoherence model (Zurek, Caldeira-Leggett, BEC
 *     variational); it is a phenomenological ansatz.
 *   - `T_c = ℏ ω_decoherence / k_B` uses `ω_decoherence` self-referentially
 *     -- this scale is not independently defined.
 *   - `ξ_0` is also undefined.
 *
 * No literature interpolation formula of this form exists (the entry
 * itself acknowledges 'novel conjecture'). Identifying `ω_decoherence`
 * with the bath cutoff `ω_c` from BE-11, or motivating the cube, are
 * reformulation tasks (require *inventing* physics with citation), not
 * transcription corrections. Per honest-claude: preserve, don't invent.
 *
 * This test pins the preservation: BE-12 is now an R2 reformulation
 * candidate (fixable: 'reformulation') so a future contributor cannot
 * silently re-promote it back to R1 without addressing the deeper
 * physics work.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be12 = BRIDGE_EQUATIONS.find((e) => e.id === 12);

describe('BE-12 Mesoscopic Coherence Length (R1 -> R2 preservation)', () => {
  it('exists in the index', () => {
    expect(be12).toBeDefined();
  });

  it("status remains 'speculative' (not promoted; underlying physics conjecture is unverified)", () => {
    expect(be12!.status).toBe('speculative');
  });

  it('all known_issues are now tagged fixable: reformulation (re-tier R1 -> R2)', () => {
    // After the R1 audit pass, every issue on this entry must be
    // 'reformulation' -- pinning this prevents accidental re-promotion to
    // R1 'spec-edit' without addressing the actual physics gaps.
    expect(be12!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be12!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('notes record the R1 -> R2 re-tier rationale', () => {
    const n = be12!.notes;
    expect(n).toMatch(/R1->R2 re-tier 2026-05-01|R1.*R2/);
    expect(n).toMatch(/honest-claude|preserve|inventing/i);
  });

  it('dependency on BE-11 is preserved', () => {
    expect(be12!.dependencies).toContain(11);
  });
});
