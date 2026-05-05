/**
 * Regression test for BE-17 (Electromagnetic-Gravitational Unification via
 * Torsion) R1 audit preservation as R2.
 *
 * Branch: fix/r1-batch-spec-edits (2026-05-01)
 *
 * Background: BE-17 was originally tagged R1 ('Fix-if-cheap': speculative
 * + spec-edit fixable) for three coupled issues. On closer inspection
 * during the R1 fix loop, all three turned out to require reformulation,
 * not transcription:
 *
 *   1. Index-structure: the Maxwell stress-energy term `(1/4) g_{μν} F²`
 *      has 2 free indices while the LHS Riemann tensor has 4. Promoting
 *      the 2-index Maxwell tensor to a 4-index structure requires
 *      *inventing* a new tensorial form (antisymmetrized δ-products are
 *      one option but not unique), not fixing a typo.
 *   2. Dimensional: `l_EM = sqrt(ℏc/e²)` is dimensionless in Gaussian
 *      units (≈11.7, the inverse-fine-structure square root) and
 *      not-a-length in SI. Replacing it with a physical length is a
 *      physics decision (classical electron radius vs. Compton wavelength
 *      vs. Bohr radius vs. Planck length), each carrying a different
 *      physical interpretation.
 *   3. Index-structure: the contorsion tensor is written rank-4
 *      `K_{μν}^{λρ}` but Einstein-Cartan contorsion is rank-3
 *      `K^ρ_{μν}` (antisymmetric in the lower indices). Rewriting with
 *      rank-3 K changes the gravitational sector structure entirely.
 *
 * Per honest-claude: preserve, don't invent. STOP-style flag for audit
 * accuracy: BE-17's R1 'spec-edit' classification was wrong -- the entry
 * should have been R2 from the start.
 *
 * This test pins the preservation: BE-17 is now an R2 reformulation
 * candidate.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be17 = BRIDGE_EQUATIONS.find((e) => e.id === 17);

describe('BE-17 EM-Gravitational Torsion (R1 -> R2 preservation)', () => {
  it('exists in the index', () => {
    expect(be17).toBeDefined();
  });

  it("status remains 'speculative' (not promoted)", () => {
    expect(be17!.status).toBe('speculative');
  });

  it('all known_issues are now tagged fixable: reformulation (re-tier R1 -> R2)', () => {
    expect(be17!.known_issues.length).toBe(3);
    for (const issue of be17!.known_issues) {
      expect(issue.fixable).toBe('reformulation');
    }
  });

  it('the three known_issues span the three distinct physics gaps (severity coverage)', () => {
    const sevs = new Set(be17!.known_issues.map((i) => i.severity));
    // Index-structure (4-vs-2), dimensional (l_EM not a length), and
    // undefined-quantity (rank-4 vs. canonical rank-3 contorsion) are the
    // three orthogonal gaps the audit identified.
    expect(sevs.has('index-structure')).toBe(true);
    expect(sevs.has('dimensional')).toBe(true);
    expect(sevs.has('undefined-quantity')).toBe(true);
  });

  it('notes record the R1 -> R2 re-tier rationale and the three gaps', () => {
    const n = be17!.notes;
    expect(n).toMatch(/R1->R2 re-tier 2026-05-01|R1.*R2/);
    expect(n).toMatch(/reformulation/i);
  });

  it('Hehl-Einstein-Cartan citation is preserved in references', () => {
    const refs = be17!.references.join(' | ');
    expect(refs).toMatch(/Hehl/i);
  });
});
