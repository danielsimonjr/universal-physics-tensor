/**
 * Regression test for BE-31 (Causal Set - Continuum Limit) R1 audit
 * preservation as R2.
 *
 * Branch: fix/r1-batch-spec-edits (2026-05-01)
 *
 * Background: BE-31 was originally tagged R1 ('Fix-if-cheap': speculative
 * + spec-edit fixable). On closer inspection during the R1 fix loop, the
 * audit's own recommendation -- 'should be replaced with their published
 * formula' (Benincasa-Dowker) -- is reformulation by definition, not a
 * transcription correction. The two coupled issues:
 *
 *   1. V^{2/4} is a clean typo (numerically equal to V^{1/2}). This part
 *      *is* spec-editable in isolation.
 *   2. The (ρ² ℓ_P⁴)^{1/4} Ricci correction term does not have Ricci
 *      dimensions [L^-2] and structurally differs from the
 *      Benincasa-Dowker discrete formula (which uses dimensionless count
 *      differences (N - 9 N_1 + 16 N_2 - 8 N_3) / V^{2/d}).
 *
 * Applying only fix #1 would leave issue #2 untouched -- the deeper
 * dimensional/structural problem. Per honest-claude: don't ship a
 * partial fix that leaves the headline concern; preserve and re-tier
 * as R2.
 *
 * STOP-style flag for audit accuracy: BE-31 audit description literally
 * said 'replace with their published formula', which is reformulation
 * language. The R1 'spec-edit' tag was inconsistent with the audit's own
 * recommended action.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be31 = BRIDGE_EQUATIONS.find((e) => e.id === 31);

describe('BE-31 Causal Set Continuum Limit (R1 -> R2 preservation)', () => {
  it('exists in the index', () => {
    expect(be31).toBeDefined();
  });

  it("status remains 'speculative' (not promoted)", () => {
    expect(be31!.status).toBe('speculative');
  });

  it('all known_issues are now tagged fixable: reformulation (re-tier R1 -> R2)', () => {
    expect(be31!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be31!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('Benincasa-Dowker citation is preserved', () => {
    expect(be31!.references).toContain('arXiv:1001.2725');
  });

  it('notes record the R1 -> R2 re-tier rationale and reference Benincasa-Dowker', () => {
    const n = be31!.notes;
    expect(n).toMatch(/R1->R2 re-tier 2026-05-01|R1.*R2/);
    expect(n).toMatch(/Benincasa-Dowker/i);
  });
});
