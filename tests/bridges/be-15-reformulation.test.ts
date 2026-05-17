/**
 * Wave P-D R-D1 (2026-05-06): BE-15 Universal Emergence Equation
 * reformulated to the canonical Hohenberg-Halperin Model A purely-
 * dissipative gradient flow:
 *
 *   ∂φ/∂t = -Γ δH/δφ + ζ
 *   ⟨ζ(x,t) ζ(x',t')⟩ = 2 Γ k_B T δ(x-x') δ(t-t')
 *   H[φ] = ∫d³x [½(∇φ)² + V(φ)]
 *
 * Replaces tests/bridges/be-15-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G/I.B/P-A/P-B/P-C precedent): when
 * a bridge equation undergoes a disposition change (here: R3 invalid →
 * reformulation landed using canonical literature form), the prior
 * disposition-pinning tests are deleted and replaced.
 *
 * Canonical references: Hohenberg & Halperin 1977 *Rev. Mod. Phys.*
 * 49:435; Chaikin & Lubensky 1995 *Principles of Condensed Matter
 * Physics* Ch. 8; Goldenfeld 1992 *Lectures on Phase Transitions and
 * the Renormalization Group*; Stanley 1971.
 *
 * Honest-claude flag: WebFetch on the Hohenberg-Halperin RMP itself
 * returned 403 (paywall); WebFetch on Wikipedia "Critical phenomena"
 * confirmed only the Hohenberg-Halperin nomenclature with one numerical
 * Model-H example. The explicit Model A Langevin form and FDT noise
 * correlator follow standard textbook references.
 */
import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex, expectHasReformulationIssue } from './_helpers.js';

describe('BE-15 Universal Emergence — Hohenberg-Halperin Model A gradient flow (Wave P-D R-D1 reformulation)', () => {
  it('exists in the index', () => {
    expectBridgeInIndex(15);
  });

  it("status is now 'speculative' (Model A canonical; bridge framing speculative)", () => {
    expectBridgeInIndex(15, 'speculative');
  });

  it('formula_latex contains the canonical Model A gradient flow ∂φ/∂t = -Γ δH/δφ + ζ', () => {
    const entry = expectBridgeInIndex(15);
    // Time derivative of phi
    expect(entry.formula_latex).toMatch(/\\partial\s*\\phi|partial.*phi/);
    // -Γ prefactor
    expect(entry.formula_latex).toMatch(/-\\Gamma|Gamma/);
    // Functional derivative δH/δφ
    expect(entry.formula_latex).toMatch(/\\delta\s*H|delta.*H/);
    // Noise term ζ
    expect(entry.formula_latex).toMatch(/\\zeta|zeta/);
  });

  it('formula_latex contains the FDT noise correlator with 2 Γ k_B T factor', () => {
    const entry = expectBridgeInIndex(15);
    expect(entry.formula_latex).toMatch(/2\s*\\Gamma\s*k_B\s*T|2\s*Gamma\s*k_B\s*T/);
    // Spatial and temporal delta functions
    expect(entry.formula_latex).toMatch(/\\delta\(x-x'\)|delta.*x.*x'/);
    expect(entry.formula_latex).toMatch(/\\delta\(t-t'\)|delta.*t.*t'/);
  });

  it('formula_latex contains the Landau-Ginzburg Hamiltonian H = ∫[½(∇φ)² + V(φ)]', () => {
    const entry = expectBridgeInIndex(15);
    // Integral
    expect(entry.formula_latex).toMatch(/\\int\s*d\^3x|int.*d.*3.*x/);
    // (∇φ)² gradient term
    expect(entry.formula_latex).toMatch(/\\nabla\s*\\phi|nabla.*phi/);
    // V(φ) potential
    expect(entry.formula_latex).toMatch(/V\(\\phi\)|V\(phi\)/);
  });

  it('does not retain the conflated F[{O_micro}] RG-flow term or the ζ(∂²S/∂O²) ad-hoc term', () => {
    const entry = expectBridgeInIndex(15);
    // No F[{O_micro}] functional
    expect(entry.formula_latex).not.toMatch(/\\mathcal\{F\}\[\\\{O_\{\\text\{micro\}\}/);
    expect(entry.formula_latex).not.toMatch(/O_\{\\text\{micro\}\}/);
    // No ad-hoc entropy second derivative
    expect(entry.formula_latex).not.toMatch(/\\partial\^2\s*S|partial.*2.*S/);
    // No η∇²O_macro diffusive term as a separate addition
    expect(entry.formula_latex).not.toMatch(/\\eta\s*\\nabla\^2\s*O/);
  });

  it('references include Hohenberg-Halperin 1977 RMP and a textbook (Chaikin-Lubensky / Goldenfeld / Stanley)', () => {
    const entry = expectBridgeInIndex(15);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Hohenberg.*Halperin 1977|Rev\.\s*Mod\.\s*Phys\.\s*49:435/);
    expect(refs).toMatch(/Chaikin.*Lubensky|Goldenfeld|Stanley 1971/);
  });

  it('references retain the Wetterich and Mori-Zwanzig alternative-path citations', () => {
    const entry = expectBridgeInIndex(15);
    const refs = entry.references.join(' | ');
    expect(refs).toMatch(/Wetterich 1993|hep-ph\/0005122|Berges/);
    expect(refs).toMatch(/Mori 1965|Zwanzig 1960/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-D R-D1', () => {
    const entry = expectBridgeInIndex(15);
    expect(entry.notes).toMatch(/Reformulated 2026-05-06/);
    expect(entry.notes).toMatch(/Wave P-D/);
  });

  it('notes commit to the Model A non-conserved-order-parameter pin (drops Model B/C/H)', () => {
    const entry = expectBridgeInIndex(15);
    expect(entry.notes).toMatch(/Model A|non-conserved/i);
    expect(entry.notes).toMatch(/Model B|conserved density|Model H|fluid/i);
  });

  it('tractability_class is numerical-tractable (Model A is a stochastic PDE with established methods)', () => {
    const entry = expectBridgeInIndex(15);
    expect(entry.tractability_class).toBe('numerical-tractable');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the bridge framing', () => {
    const entry = expectBridgeInIndex(15);
    expectHasReformulationIssue(entry);
  });

  it('honest-claude: the WebFetch limitation on Hohenberg-Halperin RMP is documented in notes', () => {
    const entry = expectBridgeInIndex(15);
    expect(entry.notes).toMatch(/Honest-claude|WebFetch/i);
  });
});
