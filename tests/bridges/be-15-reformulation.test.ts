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
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be15 = BRIDGE_EQUATIONS.find((e) => e.id === 15);

describe('BE-15 Universal Emergence — Hohenberg-Halperin Model A gradient flow (Wave P-D R-D1 reformulation)', () => {
  it('exists in the index', () => {
    expect(be15).toBeDefined();
  });

  it("status is now 'speculative' (Model A canonical; bridge framing speculative)", () => {
    expect(be15!.status).toBe('speculative');
  });

  it('formula_latex contains the canonical Model A gradient flow ∂φ/∂t = -Γ δH/δφ + ζ', () => {
    // Time derivative of phi
    expect(be15!.formula_latex).toMatch(/\\partial\s*\\phi|partial.*phi/);
    // -Γ prefactor
    expect(be15!.formula_latex).toMatch(/-\\Gamma|Gamma/);
    // Functional derivative δH/δφ
    expect(be15!.formula_latex).toMatch(/\\delta\s*H|delta.*H/);
    // Noise term ζ
    expect(be15!.formula_latex).toMatch(/\\zeta|zeta/);
  });

  it('formula_latex contains the FDT noise correlator with 2 Γ k_B T factor', () => {
    expect(be15!.formula_latex).toMatch(/2\s*\\Gamma\s*k_B\s*T|2\s*Gamma\s*k_B\s*T/);
    // Spatial and temporal delta functions
    expect(be15!.formula_latex).toMatch(/\\delta\(x-x'\)|delta.*x.*x'/);
    expect(be15!.formula_latex).toMatch(/\\delta\(t-t'\)|delta.*t.*t'/);
  });

  it('formula_latex contains the Landau-Ginzburg Hamiltonian H = ∫[½(∇φ)² + V(φ)]', () => {
    // Integral
    expect(be15!.formula_latex).toMatch(/\\int\s*d\^3x|int.*d.*3.*x/);
    // (∇φ)² gradient term
    expect(be15!.formula_latex).toMatch(/\\nabla\s*\\phi|nabla.*phi/);
    // V(φ) potential
    expect(be15!.formula_latex).toMatch(/V\(\\phi\)|V\(phi\)/);
  });

  it('does not retain the conflated F[{O_micro}] RG-flow term or the ζ(∂²S/∂O²) ad-hoc term', () => {
    // No F[{O_micro}] functional
    expect(be15!.formula_latex).not.toMatch(/\\mathcal\{F\}\[\\\{O_\{\\text\{micro\}\}/);
    expect(be15!.formula_latex).not.toMatch(/O_\{\\text\{micro\}\}/);
    // No ad-hoc entropy second derivative
    expect(be15!.formula_latex).not.toMatch(/\\partial\^2\s*S|partial.*2.*S/);
    // No η∇²O_macro diffusive term as a separate addition
    expect(be15!.formula_latex).not.toMatch(/\\eta\s*\\nabla\^2\s*O/);
  });

  it('references include Hohenberg-Halperin 1977 RMP and a textbook (Chaikin-Lubensky / Goldenfeld / Stanley)', () => {
    const refs = be15!.references.join(' | ');
    expect(refs).toMatch(/Hohenberg.*Halperin 1977|Rev\.\s*Mod\.\s*Phys\.\s*49:435/);
    expect(refs).toMatch(/Chaikin.*Lubensky|Goldenfeld|Stanley 1971/);
  });

  it('references retain the Wetterich and Mori-Zwanzig alternative-path citations', () => {
    const refs = be15!.references.join(' | ');
    expect(refs).toMatch(/Wetterich 1993|hep-ph\/0005122|Berges/);
    expect(refs).toMatch(/Mori 1965|Zwanzig 1960/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-D R-D1', () => {
    expect(be15!.notes).toMatch(/Reformulated 2026-05-06/);
    expect(be15!.notes).toMatch(/Wave P-D/);
  });

  it('notes commit to the Model A non-conserved-order-parameter pin (drops Model B/C/H)', () => {
    expect(be15!.notes).toMatch(/Model A|non-conserved/i);
    expect(be15!.notes).toMatch(/Model B|conserved density|Model H|fluid/i);
  });

  it('tractability_class is numerical-tractable (Model A is a stochastic PDE with established methods)', () => {
    expect(be15!.tractability_class).toBe('numerical-tractable');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the bridge framing', () => {
    expect(be15!.known_issues.length).toBeGreaterThan(0);
    const hasFramingIssue = be15!.known_issues.some(
      (i) =>
        i.severity === 'phenomenological-ansatz' && i.fixable === 'reformulation',
    );
    expect(hasFramingIssue).toBe(true);
  });

  it('honest-claude: the WebFetch limitation on Hohenberg-Halperin RMP is documented in notes', () => {
    expect(be15!.notes).toMatch(/Honest-claude|WebFetch/i);
  });
});
