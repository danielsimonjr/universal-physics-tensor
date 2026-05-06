/**
 * Wave P-B R-B3 (2026-05-06): BE-17 reformulated to canonical
 * Einstein-Cartan torsion-spin coupling. The original BE-17
 * conflated two separate ideas (EC torsion sourced by spin vs. some
 * unification scheme with EM source); the EM-Gravitational unification
 * claim is dropped — EC torsion is sourced by spin angular momentum
 * density, not by EM fields.
 *
 * Canonical form: Einstein-Cartan field equations
 *
 *   R_μν − (1/2) R g_μν + Λ g_μν = (8πG/c⁴) T_μν              (Einstein)
 *   T^λ_μν                       = (8πG/c⁴) S^λ_μν              (torsion)
 *
 * where T^λ_μν is the torsion tensor (rank-3, antisymmetric in lower
 * indices) and S^λ_μν is the spin angular momentum density tensor.
 *
 * Replaces tests/bridges/be-17-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1..A4 BE-30/33/43/50; Wave-P-B R-B1 BE-12,
 * R-B2 BE-13).
 *
 * WebFetch on arXiv:gr-qc/0606062 (Trautman 2006, modern EC
 * introduction) confirmed the abstract framing: "Einstein-Cartan
 * Theory ... allow[s] space-time to have torsion, in addition to
 * curvature, and relating torsion to the density of intrinsic
 * angular momentum." The full tensor equations are not in the
 * abstract; commitment to the canonical EC form follows
 * Hehl-vonderHeyde-Kerlick-Nester 1976 *Rev. Mod. Phys.* 48:393.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be17 = BRIDGE_EQUATIONS.find((e) => e.id === 17);

describe('BE-17 Einstein-Cartan torsion-spin coupling (Wave P-B R-B3 reformulation)', () => {
  it('exists in the index', () => {
    expect(be17).toBeDefined();
  });

  it("status is now 'speculative' (EC theory established; bridge framing speculative)", () => {
    expect(be17!.status).toBe('speculative');
  });

  it('formula_latex contains the canonical Einstein equation and torsion-spin coupling', () => {
    // Must contain the Einstein-equation half (R_μν, g_μν, T_μν, 8πG)
    expect(be17!.formula_latex).toMatch(/R_\{?\\mu\\nu\}?|R_\\mu/);
    expect(be17!.formula_latex).toMatch(/g_\{?\\mu\\nu\}?|g_\\mu/);
    expect(be17!.formula_latex).toMatch(/8\\?pi/);
    // Must contain the torsion-spin half: torsion T^λ_μν = (8πG/c⁴) S^λ_μν
    // The torsion tensor symbol; allow either T or \tau and a spin S
    expect(be17!.formula_latex).toMatch(/T\^\{?\\?lambda|T\^\{?\\lambda|\\tau/);
    expect(be17!.formula_latex).toMatch(/S\^\{?\\?lambda|S_\{?\\mu\\nu/);
  });

  it('does not retain the broken rank-4 R_μν^λρ Riemann form with α(F F − ...) EM coupling', () => {
    expect(be17!.formula_latex).not.toMatch(/R_\{?\\mu\\nu\}?\^\{?\\lambda\\rho/);
    expect(be17!.formula_latex).not.toMatch(/F_\{?\\mu\\nu\}?\s*F\^/);
    // Must not retain the dimensionless ℓ_EM = √(ℏc/e²) artifact
    expect(be17!.formula_latex).not.toMatch(/ell_\{?\\?text\{?EM|l_\{?EM/);
  });

  it('references include canonical Einstein-Cartan literature (Hehl et al. 1976) and Trautman 2006', () => {
    const refs = be17!.references.join(' | ');
    expect(refs).toMatch(/Hehl|Heyde|Kerlick|Nester/);
    expect(refs).toMatch(/Trautman|gr-qc\/0606062/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-B R-B3', () => {
    expect(be17!.notes).toMatch(/Reformulated 2026-05-06/);
    expect(be17!.notes).toMatch(/Wave P-B/);
  });

  it('notes drop the EM-Gravitational unification claim and commit to spin-source torsion', () => {
    expect(be17!.notes).toMatch(/spin/i);
    expect(be17!.notes).toMatch(/Einstein-Cartan|EC/);
    // The original "EM-source for torsion" claim must be explicitly disclaimed
    expect(be17!.notes).toMatch(/not.*EM|drop.*EM|sourced by spin/i);
  });

  it('tractability_class is numerical-tractable (EC equations have known numerical methods)', () => {
    expect(be17!.tractability_class).toBe('numerical-tractable');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the EM-gravity bridge framing', () => {
    expect(be17!.known_issues.length).toBeGreaterThan(0);
    const hasFramingIssue = be17!.known_issues.some(
      (i) =>
        i.severity === 'phenomenological-ansatz' && i.fixable === 'reformulation',
    );
    expect(hasFramingIssue).toBe(true);
  });
});
