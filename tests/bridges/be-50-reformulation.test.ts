/**
 * Wave P-A R-A4 (2026-05-06): BE-50 Retrocausal QFT reformulated to
 * the canonical Wheeler-Feynman 1945 absorber-theory form — the gauge
 * field expressed as the half-retarded-plus-half-advanced symmetric
 * sum: A_μ(x) = (1/2)[A_μ^ret(x) + A_μ^adv(x)].
 *
 * Replaces tests/bridges/be-50-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1 BE-30, R-A2 BE-33, R-A3 BE-43).
 *
 * WebFetch on the Wikipedia Wheeler-Feynman_absorber_theory page
 * confirmed the canonical half-retarded-half-advanced field structure:
 * "the resulting field is E_tot(x,t) = Σ_n [E_n^ret(x,t) +
 * E_n^adv(x,t)]/2" — the gauge-field analogue is A_μ(x) =
 * (1/2)[A_μ^ret(x) + A_μ^adv(x)]. The action is direct particle-
 * particle interaction (no independent EM field is postulated; the
 * "absorber" boundary condition makes this physically equivalent to
 * standard retarded-only Maxwell when every emitted radiation is
 * absorbed somewhere).
 *
 * Status remains 'highly-speculative' (the absorber boundary condition
 * is empirically untested in QFT, but the Wheeler-Feynman form itself
 * is rigorously defined).
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-50 Retrocausal QFT (Wave P-A R-A4 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(50);
  });

  it("status is 'highly-speculative' (canonical W-F form, untested absorber boundary condition)", () => {
    expectBridgeInIndex(50, 'highly-speculative');
  });

  it('formula_latex contains the canonical W-F half-retarded-half-advanced A_μ form', () => {
    const be50 = expectBridgeInIndex(50);
    expect(be50.formula_latex).toMatch(/A_\{?\\?mu|A\^?_\{?\\?mu/);
    // Half-retarded-half-advanced: must have both ret and adv markers
    expect(be50.formula_latex).toMatch(/ret|\\text\{?ret/);
    expect(be50.formula_latex).toMatch(/adv|\\text\{?adv/);
    // Factor of 1/2
    expect(be50.formula_latex).toMatch(/frac\{?1\}?\{?2\}?|1\/2|\\tfrac/);
  });

  it('does not retain the broken δ⁴(x - x_m) single-point interaction form', () => {
    const be50 = expectBridgeInIndex(50);
    expect(be50.formula_latex).not.toMatch(/delta\^4|delta\^\{?4\}?\(x|x\s*-\s*x_m/);
    expect(be50.formula_latex).not.toMatch(/lambda.*phi_\+.*phi_-|\\phi_\+\\phi_-/);
  });

  it('references include Wheeler-Feynman 1945 and Cramer 1986 transactional', () => {
    const be50 = expectBridgeInIndex(50);
    const refs = be50.references.join(' | ');
    expect(refs).toMatch(/Wheeler.*Feynman 1945|Wheeler & Feynman 1945/);
    expect(refs).toMatch(/Cramer 1986|transactional/i);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-A R-A4', () => {
    const be50 = expectBridgeInIndex(50);
    expect(be50.notes).toMatch(/Reformulated 2026-05-06/);
    expect(be50.notes).toMatch(/Wave P-A/);
  });

  it('notes flag absorber boundary condition as the speculative element', () => {
    const be50 = expectBridgeInIndex(50);
    expect(be50.notes).toMatch(/absorber|boundary condition/i);
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the absorber boundary condition', () => {
    const be50 = expectBridgeInIndex(50);
    expectHasReformulationIssue(be50);
  });
});
