/**
 * Wave P-C R-C2 (2026-05-06): BE-24 Quantum Coherence in Photosynthesis
 * reformulated to the canonical Förster (1948) FRET form: dipole-dipole
 * transfer rate k_FRET = (1/τ_D)(R_0/R)⁶ and bound-respecting transfer
 * efficiency η = R_0⁶/(R_0⁶ + R⁶) = 1/(1 + (R/R_0)⁶) ∈ [0,1] by
 * construction. The original η_classical(1 + κ exp(-t/τ_coh) |⟨ψ_d|ψ_a⟩|²)
 * form admitted η > 1 (bound violation) and was not in any cited
 * literature.
 *
 * Replaces tests/bridges/be-24-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1..A4 BE-30/33/43/50; Wave-P-B R-B1..B3
 * BE-12/13/17; Wave-P-C R-C1 BE-23): when a bridge equation undergoes
 * a disposition change (here: R3 invalid → reformulation landed using
 * canonical literature form), the prior disposition-pinning tests are
 * deleted and replaced.
 *
 * Canonical references: Förster 1948 *Ann. Phys. (Leipzig)* 437:55
 * (original); Lakowicz 2006 *Principles of Fluorescence Spectroscopy*
 * 3rd ed. Ch. 13 (textbook); Cao et al. 2020 *Sci. Adv.* 6:eaaz4888
 * (modern review documenting that long-lived FMO oscillations are
 * vibrational, not electronic — supports the FRET incoherent-baseline
 * commitment); HEOM (Ishizaki-Fleming 2009) and Lindblad GKSL
 * (Mohseni-Rebentrost-Lloyd-Aspuru-Guzik 2008) retained as alternative
 * references for any future coherent-transport reformulation.
 *
 * Honest-claude flag: WebFetch on the Wikipedia "Förster resonance
 * energy transfer" article confirmed the canonical formulas
 * k_ET = (R_0/r)⁶/τ_D, R_0⁶ ∝ κ² Q_D J / n⁴, and E = 1/(1 + (r/R_0)⁶).
 * Cao 2020 abstract not separately fetched; the contested-coherence
 * consensus is documented from the prior R3-disposition record.
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-24 Photosynthesis Coherence — Förster FRET (Wave P-C R-C2 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(24);
  });

  it("status is now 'speculative' (FRET formula canonical; bridge framing speculative)", () => {
    expectBridgeInIndex(24, 'speculative');
  });

  it('formula_latex contains the canonical Förster η = R_0^6/(R_0^6 + R^6) and k_FRET = (1/τ_D)(R_0/R)^6 forms', () => {
    const entry = expectBridgeInIndex(24);
    // η transfer formula
    expect(entry.formula_latex).toMatch(/eta_\{?\\?text\{?transfer|\\eta_\{?\\?text\{?transfer/);
    // R_0 (Förster radius) appears
    expect(entry.formula_latex).toMatch(/R_0/);
    // 6th-power dependence
    expect(entry.formula_latex).toMatch(/R_0\^6|R_0\^\{6\}|R\^6|R\^\{6\}/);
    // k_FRET rate with τ_D
    expect(entry.formula_latex).toMatch(/k_\{?\\?text\{?FRET|k_\{?FRET/);
    expect(entry.formula_latex).toMatch(/tau_D|\\tau_D/);
  });

  it('does not retain the bound-violating η_classical(1 + κ exp(...)|⟨ψ_d|ψ_a⟩|²) ansatz', () => {
    const entry = expectBridgeInIndex(24);
    expect(entry.formula_latex).not.toMatch(/eta_\{?\\?text\{?classical/);
    expect(entry.formula_latex).not.toMatch(/\\kappa\b/);
    expect(entry.formula_latex).not.toMatch(/tau_\{?\\?text\{?coh/);
    expect(entry.formula_latex).not.toMatch(/psi_\{?\\?text\{?donor|psi_\{?\\?text\{?acceptor/);
  });

  it('references include Förster 1948 and Lakowicz 2006 textbook plus modern Cao 2020 consensus', () => {
    const entry = expectBridgeInIndex(24);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Förster 1948|Forster 1948/);
    expect(refs).toMatch(/Lakowicz/);
    expect(refs).toMatch(/Cao.*2020|eaaz4888/);
  });

  it('references retain HEOM and Lindblad alternative-path citations for future coherent-transport reformulation', () => {
    const entry = expectBridgeInIndex(24);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Ishizaki.*Fleming|HEOM/);
    expect(refs).toMatch(/Mohseni|Rebentrost|Lindblad|ENAQT/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-C R-C2', () => {
    const entry = expectBridgeInIndex(24);
    expect(entry.notes).toMatch(/Reformulated 2026-05-06/);
    expect(entry.notes).toMatch(/Wave P-C/);
  });

  it('notes commit to FRET as the canonical baseline and document the η ∈ [0,1] bound-respecting structure', () => {
    const entry = expectBridgeInIndex(24);
    expect(entry.notes).toMatch(/FRET|Förster|Forster/i);
    expect(entry.notes).toMatch(/R_0|Förster radius|Forster radius/i);
    expect(entry.notes).toMatch(/\[0,\s*1\]|bound|construction/i);
  });

  it('tractability_class is closed-form (single algebraic formula given R, R_0, τ_D)', () => {
    const entry = expectBridgeInIndex(24);
    expect(entry.tractability_class).toBe('closed-form');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the bridge framing', () => {
    const entry = expectBridgeInIndex(24);
    expectHasReformulationIssue(entry);
  });
});
