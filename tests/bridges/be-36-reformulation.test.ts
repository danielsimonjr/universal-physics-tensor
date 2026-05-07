/**
 * Wave P-C R-C3 (2026-05-06): BE-36 MOND — Dark Matter Interpolation
 * Function reformulated to canonical Bekenstein 2004 TeVeS (Tensor-
 * Vector-Scalar gravity). Replaced the bespoke hybrid linear blend
 * F = F_N μ(a/a_0) + F_DM (1 − μ(a/a_0)) (not in any published MOND
 * literature) with the canonical TeVeS relativistic completion of
 * MOND, action S = S_g + S_φ + S_A + S_matter with three dynamical
 * fields (metric g_μν, scalar φ, timelike vector A^μ enforcing
 * A^μ A_μ = -1). Non-relativistic limit recovers Milgrom MOND.
 *
 * Replaces tests/bridges/be-36-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1..A4 BE-30/33/43/50; Wave-P-B R-B1..B3
 * BE-12/13/17; Wave-P-C R-C1 BE-23, R-C2 BE-24): when a bridge
 * equation undergoes a disposition change (here: R3 invalid →
 * reformulation landed using canonical literature form), the prior
 * disposition-pinning tests are deleted and replaced.
 *
 * Canonical references: Bekenstein 2004 *Phys. Rev. D* 70:083509
 * (arXiv:astro-ph/0403694; canonical TeVeS); Famaey-McGaugh 2012
 * *Living Rev. Relativ.* 15:10 (arXiv:1112.3960; MOND review
 * including TeVeS); Skordis 2009 *CQG* 26:143001 (TeVeS review).
 *
 * Known issue: GW170817 graviton-speed constraint |c_g − c|/c ≲ 10^-15
 * (Abbott 2017; Boran et al. 2018 arXiv:1710.06168) strongly
 * constrains original TeVeS variants. Skordis-Złośnik 2021
 * (arXiv:2007.00082) is a successor RMT theory consistent with
 * GW170817. Documented as a known_issue per the disposition brief.
 *
 * Honest-claude flag: WebFetch on arXiv:astro-ph/0403694 returned
 * only abstract content (TeVeS as relativistic MOND completion with
 * three dynamical fields, Newtonian + MOND limits); the explicit
 * action terms S_g, S_φ, S_A, S_matter and the physical-metric
 * coupling ĝ_μν follow standard TeVeS-review references. The
 * GW170817 constraint is sourced from review-level information.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be36 = BRIDGE_EQUATIONS.find((e) => e.id === 36);

describe('BE-36 MOND — TeVeS relativistic completion (Wave P-C R-C3 reformulation)', () => {
  it('exists in the index', () => {
    expect(be36).toBeDefined();
  });

  it("status is now 'speculative' (TeVeS is canonical relativistic MOND; bridge framing speculative)", () => {
    expect(be36!.status).toBe('speculative');
  });

  it('formula_latex displays the GW170817 graviton-speed bound (post Wave Y reformulation)', () => {
    // Wave Y replaced the TeVeS action S = S_g + S_φ + S_A + S_matter
    // (operator-valued; AST-unencodable) with the canonical GW170817
    // dimensionless-ratio bound |c_GW − c|/c ≤ 10⁻¹⁵. The TeVeS framework
    // is preserved in references/notes.
    expect(be36!.formula_latex).toMatch(/c_\{?\\text\{GW\}\}?/);
    expect(be36!.formula_latex).toMatch(/10\^\{?-15\}?|10\^\{-15\}/);
  });

  it('does not retain the bespoke hybrid linear blend F = F_N μ + F_DM (1 − μ) ansatz', () => {
    expect(be36!.formula_latex).not.toMatch(/F_\{?\\?text\{?DM|F_\{?DM/);
    // No (1 − μ(...)) blending term remaining
    expect(be36!.formula_latex).not.toMatch(/1\s*-\s*\\mu\\left/);
  });

  it('references include Bekenstein 2004 TeVeS (arXiv:astro-ph/0403694) and Famaey-McGaugh 2012', () => {
    const refs = be36!.references.join(' | ');
    expect(refs).toMatch(/Bekenstein 2004|astro-ph\/0403694/);
    expect(refs).toMatch(/Famaey.*McGaugh 2012|1112\.3960/);
    expect(refs).toMatch(/TeVeS|Tensor-Vector-Scalar/i);
  });

  it('references document the GW170817 constraint and a post-GW170817 successor candidate', () => {
    const refs = be36!.references.join(' | ');
    expect(refs).toMatch(/GW170817|Abbott.*2017|1710\.05832/);
    expect(refs).toMatch(/Boran|1710\.06168|Skordis.*Złośnik|Zlosnik|2007\.00082/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-C R-C3', () => {
    expect(be36!.notes).toMatch(/Reformulated 2026-05-06/);
    expect(be36!.notes).toMatch(/Wave P-C/);
  });

  it('notes commit to TeVeS framing and document the GW170817 constraint as a known issue', () => {
    expect(be36!.notes).toMatch(/TeVeS|Tensor-Vector-Scalar/);
    expect(be36!.notes).toMatch(/GW170817|graviton.*speed|c_g/i);
  });

  it('notes preserve the relationship to BE-38 (BE-36 is relativistic TeVeS, BE-38 is non-relativistic Milgrom μ)', () => {
    expect(be36!.notes).toMatch(/BE-38/);
    expect(be36!.notes).toMatch(/relativistic|non-relativistic|complementary/i);
  });

  it('dependency on BE-38 is recorded (the non-relativistic Milgrom limit)', () => {
    expect(be36!.dependencies).toContain(38);
  });

  it("tractability_class is 'closed-form' (Wave Y: scalar dimensionless ratio is single-formula evaluable)", () => {
    expect(be36!.tractability_class).toBe('closed-form');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the bridge framing', () => {
    expect(be36!.known_issues.length).toBeGreaterThan(0);
    const hasFramingIssue = be36!.known_issues.some(
      (i) =>
        i.severity === 'phenomenological-ansatz' && i.fixable === 'reformulation',
    );
    expect(hasFramingIssue).toBe(true);
  });

  it('known_issues includes a GW170817 constraint entry', () => {
    const corpus = be36!.known_issues.map((i) => i.description).join(' | ');
    expect(corpus).toMatch(/GW170817|graviton.*speed|c_g/i);
  });
});
