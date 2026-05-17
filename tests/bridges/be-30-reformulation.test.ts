/**
 * Wave P-A R-A1 (2026-05-06): BE-30 Entanglement-Geometry reformulated
 * to canonical Faulkner-Lewkowycz-Maldacena 2013 first-law-of-
 * entanglement linear-response form: δS_EE = ⟨δH_R⟩ where H_R is the
 * modular Hamiltonian.
 *
 * Replaces tests/bridges/be-30-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4 BE-38):
 * when a bridge equation undergoes a disposition change (here: R3 invalid
 * → reformulation landed using canonical literature form), the prior
 * disposition-pinning tests are deleted and replaced.
 *
 * Canonical reference verified via WebFetch on Blanco-Casini-Hung-Myers
 * 2013 (arXiv:1305.3182) which states the first law of entanglement
 * "ΔS = ΔH for the first order variation of the entanglement entropy
 * ΔS and the expectation value of the modular Hamiltonian ΔH" —
 * confirming the form δS_EE = ⟨δH_R⟩. Per Math iter-5 / Researcher
 * iter-5 strategic pivot: complete bridges to canonical literature
 * forms when one exists.
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-30 Entanglement-Geometry (Wave P-A R-A1 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(30);
  });

  it("status is now 'speculative' (canonical formula but speculative QG-emergence framing)", () => {
    expectBridgeInIndex(30, 'speculative');
  });

  it('formula_latex contains the canonical FLM first-law form δS_EE = ⟨δH_R⟩', () => {
    const entry = expectBridgeInIndex(30);
    expect(entry.formula_latex).toMatch(/delta\s*S|\\delta\s*S/i);
    expect(entry.formula_latex).toMatch(/H_R|H_\{?R\}?|H_\{?\\text\{?mod\}?\}?|modular/i);
  });

  it('does not retain the broken η_μν + κ Σ_ij ⟨x|Tr_j(...)|x⟩ form', () => {
    const entry = expectBridgeInIndex(30);
    // The old form had |x> position-eigenstate sandwiches around a scalar
    // trace expression — inconsistent with FLM's modular-Hamiltonian form.
    expect(entry.formula_latex).not.toMatch(/eta_\{?\\mu/);
    expect(entry.formula_latex).not.toMatch(/Tr.*rho.*log/);
  });

  it('references include FLM 2013 (1307.2892) and a first-law citation', () => {
    const entry = expectBridgeInIndex(30);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Faulkner-Lewkowycz-Maldacena|FLM|1307\.2892/);
    // The Blanco-Casini-Hung-Myers 2013 paper or analogous first-law cite
    // (1305.3182 or Wong-Klich-Pando-Zayas-Vaman, etc.)
    expect(refs).toMatch(/first law|1305\.3182|Blanco|Casini|modular/i);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-A R-A1', () => {
    const entry = expectBridgeInIndex(30);
    expect(entry.notes).toMatch(/Reformulated 2026-05-06/);
    expect(entry.notes).toMatch(/Wave P-A/);
  });

  it("tractability_class set to 'closed-form' (Wave Y: scalar identity is single dimensionless relation; Bekenstein bound single-formula evaluable)", () => {
    const entry = expectBridgeInIndex(30);
    expect(entry.tractability_class).toBe('closed-form');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the QG-emergence framing', () => {
    const entry = expectBridgeInIndex(30);
    expectHasReformulationIssue(entry);
  });
});
