/**
 * Regression test for BE-37 (Variable Speed of Light Cosmology) R1 audit
 * preservation as R2.
 *
 * Branch: fix/r1-batch-spec-edits (2026-05-01)
 *
 * Background: BE-37 was originally tagged R1 ('Fix-if-cheap': speculative
 * + spec-edit fixable). The audit's own description ('a corrected
 * formulation should cite a specific VSL paper and reproduce its
 * equations') is reformulation language: replace, not patch.
 *
 * Three observations driving the R1 -> R2 re-tier:
 *
 *   1. The c(t) ansatz `c_0 [1 + ε (t/t_P)^n exp(-t/t_c)]` is original to
 *      this framework -- it does not appear in any cited VSL paper
 *      (Albrecht-Magueijo arXiv:astro-ph/9811018; Moffat 1993; Barrow).
 *   2. Available VSL formulations are not equivalent. Albrecht-Magueijo
 *      vs. Moffat vs. Barrow each give different modified Friedmann
 *      equations; picking among them is a physics decision.
 *   3. 'Reproduce their equations' = structural rewrite, by definition.
 *
 * Per honest-claude: preserve, don't invent. STOP-style flag for audit
 * accuracy: BE-37 audit description was reformulation language tagged as
 * 'spec-edit'.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be37 = BRIDGE_EQUATIONS.find((e) => e.id === 37);

describe('BE-37 Variable Speed of Light Cosmology (R1 -> R2 preservation)', () => {
  it('exists in the index', () => {
    expect(be37).toBeDefined();
  });

  it("status remains 'speculative' (not promoted)", () => {
    expect(be37!.status).toBe('speculative');
  });

  it('all known_issues are now tagged fixable: reformulation (re-tier R1 -> R2)', () => {
    expect(be37!.known_issues.length).toBeGreaterThan(0);
    for (const issue of be37!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('Albrecht-Magueijo citation is preserved', () => {
    expect(be37!.references).toContain('arXiv:astro-ph/9811018');
  });

  it('notes record the R1 -> R2 re-tier rationale', () => {
    const n = be37!.notes;
    expect(n).toMatch(/R1->R2 re-tier 2026-05-01|R1.*R2/);
    expect(n).toMatch(/VSL|Magueijo|Moffat/i);
  });
});
