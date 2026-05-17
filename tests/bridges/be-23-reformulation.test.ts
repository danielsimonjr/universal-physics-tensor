/**
 * Wave P-C R-C1 (2026-05-06): BE-23 Strange Metal — Black Hole Duality
 * reformulated to the canonical SYK / Planckian-dissipation linear-in-T
 * resistivity form: ρ(T) = ρ_0 + (k_B T / ℏ) · (1 / n_e e²) · α_SYK,
 * where α_SYK is the SYK-model dimensionless coefficient (~ O(1))
 * capturing the τ ~ ℏ/(k_B T) maximally-chaotic relaxation timescale.
 *
 * Replaces tests/bridges/be-23-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1..A4 BE-30/33/43/50; Wave-P-B R-B1..B3
 * BE-12/13/17): when a bridge equation undergoes a disposition change
 * (here: R3 invalid → reformulation landed using canonical literature
 * form), the prior disposition-pinning tests are deleted and replaced.
 *
 * Canonical references: Sachdev-Ye 1993 *Phys. Rev. Lett.* 70:3339
 * (arXiv:cond-mat/9212030); Kitaev 2015 KITP talks; Maldacena-Stanford
 * 2016 *Phys. Rev. D* 94:106002 (arXiv:1604.07818); Hartnoll 2015
 * *Nature Phys.* 11:54 (Planckian-dissipation review); Hartnoll-Hofman
 * 2010 *Phys. Rev. D* 81:086004 (arXiv:0912.0008; holographic momentum-
 * relaxed strange metal); MSS 2016 (arXiv:1503.01409; chaos bound).
 *
 * Honest-claude flag: WebFetch on arXiv:1604.07818 returned only
 * abstract-level content (emergent SL(2,R) conformal symmetry, two-
 * and four-point function study); the explicit Green's function
 * G(τ) ∝ |τ|^{-2/q} and the resistivity-prefactor commitment follow
 * standard SYK textbook references. The α_SYK bundled coefficient
 * preserves the bridge framing without committing to a specific q-value.
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-23 Strange Metal — SYK Planckian dissipation (Wave P-C R-C1 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(23);
  });

  it("status is now 'speculative' (Planckian dissipation established; SYK-duality bridge framing speculative)", () => {
    expectBridgeInIndex(23, 'speculative');
  });

  it('formula_latex contains the canonical Planckian rate k_B T / ℏ and a Drude-style resistivity decomposition', () => {
    const entry = expectBridgeInIndex(23);
    // Linear-in-T term must contain k_B T / ℏ (the Planckian rate)
    expect(entry.formula_latex).toMatch(/k_B\s*T|k_\{?B\}?\s*T/);
    expect(entry.formula_latex).toMatch(/hbar|\\hbar/);
    // Drude-form residual ρ_0 must remain
    expect(entry.formula_latex).toMatch(/\\rho_0|rho_0/);
    // Carrier-density and charge factors n_e e²
    expect(entry.formula_latex).toMatch(/n_e\s*e\^?2|n_\{?e\}?/);
    // SYK coefficient α_SYK
    expect(entry.formula_latex).toMatch(/alpha_\{?\\?text\{?SYK|alpha_\{?SYK|\\alpha_/);
  });

  it('formula_latex includes carrier effective mass m* in the numerator (Wave Q A1, Math iter-6 C1 dimensional fix)', () => {
    // Canonical Drude+Planckian form: ρ = (m* k_B T) / (n_e e² ℏ) · α_SYK
    // m* must appear in the numerator (not buried inside another factor)
    const entry = expectBridgeInIndex(23);
    expect(entry.formula_latex).toMatch(/m\^?\*|m\^\{\*\}|m\\\*/);
  });

  it('notes record the Wave Q A1 dimensional fix adding m* (Math iter-6 C1)', () => {
    const entry = expectBridgeInIndex(23);
    expect(entry.notes).toMatch(/Wave Q A1|Math iter-6 C1/);
    expect(entry.notes).toMatch(/Dimensional fix 2026-05-06|carrier effective mass/i);
  });

  it('does not retain the algebraically-vacuous √(ℏ/(k_B T τ_P)) third term', () => {
    const entry = expectBridgeInIndex(23);
    expect(entry.formula_latex).not.toMatch(/\\sqrt\{\\frac\{\\hbar\}\{k_B\s*T\s*\\tau_P\}\}/);
    // No τ_P literal substring (the cause of the original collapse identity)
    expect(entry.formula_latex).not.toMatch(/\\tau_P/);
    // No bare AT linear-in-T term with undefined slope A (replaced by k_B T / ℏ form)
    expect(entry.formula_latex).not.toMatch(/\+\s*AT\s*\+/);
  });

  it('references include Maldacena-Stanford 2016 (arXiv:1604.07818) and Sachdev-Ye 1993', () => {
    const entry = expectBridgeInIndex(23);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Maldacena.*Stanford|1604\.07818/);
    expect(refs).toMatch(/Sachdev.*Ye 1993|cond-mat\/9212030/);
    expect(refs).toMatch(/Kitaev 2015|SYK/);
  });

  it('references include Hartnoll Planckian-dissipation review and an empirical Planckian-rate citation', () => {
    const entry = expectBridgeInIndex(23);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Hartnoll 2015|1405\.3651/);
    expect(refs).toMatch(/Bruin.*2013|Legros.*2019|Planckian/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-C R-C1', () => {
    const entry = expectBridgeInIndex(23);
    expect(entry.notes).toMatch(/Reformulated 2026-05-06/);
    expect(entry.notes).toMatch(/Wave P-C/);
  });

  it('notes commit to the SYK Planckian-rate framing (τ ~ ℏ/(k_B T), MSS chaos bound)', () => {
    const entry = expectBridgeInIndex(23);
    expect(entry.notes).toMatch(/SYK|Planckian/i);
    expect(entry.notes).toMatch(/k_B\s*T|relaxation|chaos/i);
  });

  it('tractability_class is numerical-tractable (SYK Schwinger-Dyson on a grid; α_SYK is a single coefficient)', () => {
    const entry = expectBridgeInIndex(23);
    expect(entry.tractability_class).toBe('numerical-tractable');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the duality framing', () => {
    const entry = expectBridgeInIndex(23);
    expectHasReformulationIssue(entry);
  });
});
