/**
 * Wave P-B R-B1 (2026-05-06): BE-12 Mesoscopic Coherence Length
 * reformulated to the canonical Caldeira-Leggett dephasing length /
 * thermal de Broglie wavelength form: ξ_dephasing(T) = ℏ / √(2 m k_B T γ)
 * where γ is the Caldeira-Leggett dissipation (friction) coefficient.
 *
 * Replaces tests/bridges/be-12-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1..A4 BE-30/33/43/50): when a bridge equation
 * undergoes a disposition change (here: R3 invalid → reformulation
 * landed using canonical literature form), the prior disposition-
 * pinning tests are deleted and replaced.
 *
 * Canonical references: Caldeira-Leggett 1981 *Phys. Rev. Lett.* 46:211
 * (canonical system-bath coupling); Caldeira-Leggett 1983 *Physica A*
 * 121:587 (full quantum Brownian motion derivation); Wikipedia
 * Thermal_de_Broglie_wavelength (canonical λ_T = h/√(2π m k_B T) form).
 *
 * Honest-claude flag: WebFetch on arXiv:cond-mat/0503100 (the cited
 * Hänggi review candidate) returned a different paper (photonic
 * crystal Fano resonators). The Caldeira-Leggett dephasing-length
 * commitment ξ = ℏ/√(2 m k_B T γ) follows the textbook convention
 * (Caldeira-Leggett 1983 Physica A) and is dimensionally consistent
 * with the thermal de Broglie wavelength form λ_T = h/√(2π m k_B T)
 * confirmed via WebFetch on the Wikipedia thermal-de-Broglie article;
 * the precise γ-prefactor is the Caldeira-Leggett friction coefficient.
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-12 Mesoscopic Coherence Length (Wave P-B R-B1 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(12);
  });

  it("status is now 'speculative' (canonical Caldeira-Leggett formula, speculative mesoscopic-coherence framing)", () => {
    expectBridgeInIndex(12, 'speculative');
  });

  it('formula_latex contains the canonical thermal de Broglie wavelength λ_T = ℏ/√(2π m k_B T) form (Wave Q A2 dimensional fix)', () => {
    // After Wave Q A2 (per Math iter-6 C2), γ was dropped — neither γ
    // convention yielded a length, and the canonical thermal de Broglie
    // wavelength has no friction coefficient.
    const entry = expectBridgeInIndex(12);
    expect(entry.formula_latex).toMatch(/lambda|\\lambda|xi|\\xi/i);
    expect(entry.formula_latex).toMatch(/hbar|\\hbar/);
    expect(entry.formula_latex).toMatch(/k_B\s*T|k_\{?B\}?\s*T/);
    expect(entry.formula_latex).toMatch(/2\s*\\?pi|2\\pi/);
    // Must contain particle mass m
    expect(entry.formula_latex).toMatch(/\bm\b|2\s*\\?pi\s*m|pi\s*m/);
  });

  it('does NOT contain the dropped γ friction coefficient (Wave Q A2 dimensional fix)', () => {
    // Math iter-6 C2: ξ = ℏ/√(2 m k_B T γ) doesn't yield length under
    // either γ convention; reverted to canonical thermal de Broglie.
    const entry = expectBridgeInIndex(12);
    expect(entry.formula_latex).not.toMatch(/\\gamma|gamma/);
  });

  it('does not retain the broken (1 + N/N_c + (T/T_c)^ν) ansatz', () => {
    const entry = expectBridgeInIndex(12);
    expect(entry.formula_latex).not.toMatch(/N\s*\/\s*N_c|N_\{?c\}?/);
    expect(entry.formula_latex).not.toMatch(/T\s*\/\s*T_c|T_\{?c\}?/);
  });

  it('notes record the Wave Q A2 dimensional fix dropping γ (Math iter-6 C2)', () => {
    const entry = expectBridgeInIndex(12);
    expect(entry.notes).toMatch(/Wave Q A2|Math iter-6 C2/);
    expect(entry.notes).toMatch(/Dimensional fix 2026-05-06|thermal de Broglie/i);
  });

  it('references include Caldeira-Leggett 1983 Physica A and a thermal-de-Broglie / quantum-Brownian-motion citation', () => {
    const entry = expectBridgeInIndex(12);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Caldeira-Leggett|Caldeira.*Leggett/);
    expect(refs).toMatch(/1983|Physica A|Brownian|de Broglie/i);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-B R-B1', () => {
    const entry = expectBridgeInIndex(12);
    expect(entry.notes).toMatch(/Reformulated 2026-05-06/);
    expect(entry.notes).toMatch(/Wave P-B/);
  });

  it('tractability_class is closed-form (single-formula evaluation given m, T, γ)', () => {
    const entry = expectBridgeInIndex(12);
    expect(entry.tractability_class).toBe('closed-form');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the mesoscopic-coherence framing', () => {
    const entry = expectBridgeInIndex(12);
    expectHasReformulationIssue(entry);
  });

  it('dependency on BE-11 is preserved (the bath-coupling γ originates from BE-11)', () => {
    const entry = expectBridgeInIndex(12);
    expect(entry.dependencies).toContain(11);
  });
});
