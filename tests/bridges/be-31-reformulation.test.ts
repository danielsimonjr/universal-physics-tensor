/**
 * Wave I.B C3 (2026-05-05): BE-31 Causal Set — Continuum Limit
 * reformulated to canonical Benincasa-Dowker d=4 inclusion-exclusion form.
 *
 * Replaces the prior R1->R2 preserve+gap-spec test pair (deleted):
 *   - tests/bridges/be-31-preserve.test.ts
 *   - tests/bridges/be-31-r2-spec.test.ts
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37): when a bridge
 * equation undergoes a disposition change (here: R2 gap → reformulation
 * landed), the prior gap-pinning tests are deleted and replaced by a
 * test that verifies the new state. This makes the choice explicit
 * rather than carrying obsolete pins forward.
 *
 * Per Mathematician M-I + Physicist I9 (Wave H paper review).
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be31 = BRIDGE_EQUATIONS.find((e) => e.id === 31);

describe('BE-31 Causal Set — Continuum Limit (Wave I.B C3 reformulation)', () => {
  it('exists in the index', () => {
    expect(be31).toBeDefined();
  });

  it("status remains 'speculative' (formula is canonical, framing is original to UPT)", () => {
    expect(be31!.status).toBe('speculative');
  });

  it('formula_latex contains the canonical Benincasa-Dowker d=4 form', () => {
    // (4/√6) ℓ_P^{-2} [1 + N_0 - 9 N_1 + 16 N_2 - 8 N_3]
    expect(be31!.formula_latex).toMatch(/4\}\{\\sqrt\{6\}|\\sqrt\{6\}/);
    expect(be31!.formula_latex).toMatch(/N_0/);
    expect(be31!.formula_latex).toMatch(/9\s*N_1|9N_1/);
    expect(be31!.formula_latex).toMatch(/16\s*N_2|16N_2/);
    expect(be31!.formula_latex).toMatch(/8\s*N_3|8N_3/);
    expect(be31!.formula_latex).toMatch(/ell_P/);
  });

  it('does not retain the obsolete (ρ²ℓ_P⁴)^{1/4} or V^{2/4} structures', () => {
    expect(be31!.formula_latex).not.toMatch(/V\^\{2\/4\}/);
    expect(be31!.formula_latex).not.toMatch(/rho\^2.*l_P\^4/);
  });

  it('Benincasa-Dowker citation is preserved', () => {
    expect(be31!.references).toContain('arXiv:1001.2725');
  });

  it('notes record the 2026-05-05 reformulation', () => {
    expect(be31!.notes).toMatch(/Reformulated 2026-05-05/);
    expect(be31!.notes).toMatch(/Wave I\.B C3/);
  });

  it('known_issues retains a single phenomenological-ansatz / reformulation entry for the framing gap', () => {
    expect(be31!.known_issues.length).toBeGreaterThan(0);
    const hasFramingIssue = be31!.known_issues.some(
      (i) => i.severity === 'phenomenological-ansatz' && i.fixable === 'reformulation',
    );
    expect(hasFramingIssue).toBe(true);
  });
});
