/**
 * Wave P-A R-A3 (2026-05-06): BE-43 ER=EPR Wormhole Dynamics
 * reformulated to the canonical ER=EPR wormhole-entropy-bound form
 * S_entanglement ~ A_wormhole / (4 ℓ_P²) — Bekenstein-Hawking-type
 * bound applied to the wormhole minimal cross-section area, the
 * canonical statement of the ER=EPR equivalence (Maldacena-Susskind
 * 2013 arXiv:1306.0533).
 *
 * Replaces tests/bridges/be-43-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1 BE-30, R-A2 BE-33).
 *
 * WebFetch on arXiv:1306.0533 confirmed the abstract: "two distant
 * black holes are connected through the interior via a wormhole, or
 * Einstein-Rosen bridge. These solutions can be interpreted as
 * maximally entangled states of two black holes that form a complex
 * EPR pair." The Bekenstein-Hawking S = A/(4ℓ_P²) form applied to
 * the wormhole cross-section is the canonical statement of the
 * entanglement-as-wormhole-area equivalence (Susskind-Stanford 2014
 * arXiv:1408.2823 develops complexity-volume duality on top of this).
 *
 * Honest-claude flag: WebFetch returned abstract only, not the precise
 * formula derivation; the S ~ A/(4ℓ_P²) form is canonical Bekenstein-
 * Hawking applied to the ER bridge's minimal cross-section, but the
 * precise ER=EPR-paper equation was not fetched.
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-43 ER=EPR (Wave P-A R-A3 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(43);
  });

  it("status is now 'speculative' (canonical bound, ER=EPR framing remains conjectural)", () => {
    expectBridgeInIndex(43, 'speculative');
  });

  it('formula_latex contains the canonical S_entanglement ~ A_wormhole / (4 ℓ_P²) form', () => {
    const be43 = expectBridgeInIndex(43);
    expect(be43.formula_latex).toMatch(/S_\{?\\?text\{?ent|S_\{?\\?text\{?EE|S_\{?ent|S_E/i);
    expect(be43.formula_latex).toMatch(/A_\{?\\?text\{?wormhole|A_\{?wormhole|A_W|A_\{?\\?text\{?ER/i);
    expect(be43.formula_latex).toMatch(/ell_P|l_P|\\ell|4/);
  });

  it('does not retain the broken dℓ/dt = -γS + δ ∫ T_μν u^μ u^ν dV form', () => {
    const be43 = expectBridgeInIndex(43);
    expect(be43.formula_latex).not.toMatch(/d\s*\\ell.*dt|d\\ell_\{?\\text\{?wormhole/);
    expect(be43.formula_latex).not.toMatch(/T_\{?\\mu\\nu/);
  });

  it('references include Maldacena-Susskind 2013 (1306.0533) and Bekenstein-Hawking', () => {
    const be43 = expectBridgeInIndex(43);
    const refs = be43.references.join(' | ');
    expect(refs).toMatch(/Maldacena.*Susskind|Susskind.*Maldacena|1306\.0533/);
    expect(refs).toMatch(/Bekenstein|Hawking/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-A R-A3', () => {
    const be43 = expectBridgeInIndex(43);
    expect(be43.notes).toMatch(/Reformulated 2026-05-06/);
    expect(be43.notes).toMatch(/Wave P-A/);
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the ER=EPR conjectural framing', () => {
    const be43 = expectBridgeInIndex(43);
    expectHasReformulationIssue(be43);
  });
});
