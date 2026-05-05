/**
 * Regression test for BE-29 (Jarzynski Equality Extension to Gravity)
 * R1 audit fix.
 *
 * Branch: fix/r1-batch-spec-edits (2026-05-01)
 *
 * Background: BE-29 was flagged R1 (speculative + spec-edit fixable) because
 * the integral `∫ g_{μν} dT^{μν}` was ill-defined as written: T^{μν} is a
 * rank-2 tensor field, not a differential form, so `dT^{μν}` is ambiguous
 * without specifying an integration manifold. The audit recommended the
 * standard Hilbert action variation form `(1/c⁴) ∫ T^{μν} δg_{μν} d⁴x`.
 *
 * Reference: Misner-Thorne-Wheeler *Gravitation* (1973) §21.3 Eq. 21.51;
 * Wald *General Relativity* (1984) §E.1 Eq. E.1.14, defining
 *   T^{μν} := (2/√(-g)) δ(√(-g) L_matter) / δg_{μν}.
 * From this definition the matter-action variation is
 *   δS_matter = (1/2) ∫ T^{μν} δg_{μν} √(-g) d⁴x  (geometric units),
 * so the gravitational work in SI units is
 *   W_grav = (1/(2 c⁴)) ∫ T^{μν} δg_{μν} √(-g) d⁴x.
 *
 * Honest-claude: status remains 'speculative' because the *physics
 * conjecture* (that Jarzynski's flat-spacetime equality extends to
 * curved-spacetime work in this form) is unverified, even though the
 * gravitational-work expression is now canonical GR.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be29 = BRIDGE_EQUATIONS.find((e) => e.id === 29);

describe('BE-29 Jarzynski Gravity Extension (R1 audit fix)', () => {
  it('exists in the index', () => {
    expect(be29).toBeDefined();
  });

  it("status remains 'speculative' (form is now canonical GR; the curved-spacetime Jarzynski conjecture is what is speculative)", () => {
    expect(be29!.status).toBe('speculative');
  });

  it('formula_latex contains the canonical Hilbert action variation T^{μν} δg_{μν}', () => {
    const f = be29!.formula_latex;
    // The corrected form should contain `T^{\mu\nu} \delta g_{\mu\nu}`.
    expect(f).toMatch(/T\^\{\\mu\\nu\}\s*\\delta\s*g_\{\\mu\\nu\}/);
  });

  it('formula_latex uses the covariant volume element √(-g) d⁴x', () => {
    const f = be29!.formula_latex;
    expect(f).toMatch(/\\sqrt\{-g\}/);
    expect(f).toMatch(/d\^4\s*x/);
  });

  it('formula_latex uses the canonical 1/(2 c^4) prefactor (vs. original 1/c^4)', () => {
    const f = be29!.formula_latex;
    // The Hilbert action variation introduces a 1/2 from the T^{μν}
    // definition; with the SI 1/c^4 conversion, the prefactor is 1/(2 c^4).
    expect(f).toMatch(/\\frac\{\\beta\}\{2c\^4\}/);
  });

  it('formula_latex no longer contains the ill-defined `dT^{μν}` token', () => {
    const f = be29!.formula_latex;
    expect(f).not.toMatch(/dT\^\{\\mu\\nu\}/);
  });

  it("known_issues no longer contains the 'undefined integration measure' issue", () => {
    for (const issue of be29!.known_issues) {
      expect(issue.description).not.toMatch(/undefined integration measure|dT\^\{?mu nu\}? is ambiguous/i);
    }
  });

  it('notes acknowledge the 2026-05-01 R1 audit correction and cite MTW / Wald', () => {
    const n = be29!.notes;
    expect(n).toMatch(/2026-05-01|R1 audit/);
    expect(n).toMatch(/MTW|Wald|Hilbert action/i);
  });

  it('references include the textbook citations', () => {
    const refs = be29!.references.join(' | ');
    expect(refs).toMatch(/MTW|Misner|Thorne|Wheeler/i);
    expect(refs).toMatch(/Wald/i);
  });
});
