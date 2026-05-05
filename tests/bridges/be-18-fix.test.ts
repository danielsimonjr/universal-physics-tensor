/**
 * Regression test for BE-18 (Non-Abelian Dark Matter Gauge Theory) audit fix.
 *
 * Branch: fix/r1-batch-spec-edits (2026-05-01)
 *
 * Background: BE-18 was flagged R1 (speculative + spec-edit fixable) because
 * the Lagrangian as written had a potential V(|Φ|) but no kinetic term
 * |D_μ Φ|² for the scalar field Φ — without it Φ is non-dynamical and the
 * cited SSB potential V(|Φ|) = λ(|Φ|² − v²)² has no field equation. Also,
 * the original spec wrote `+ V(|Φ|)` whereas the standard QFT convention is
 * L = T − V; the +V form would invert the SSB minimum.
 *
 * Reference: Peskin & Schroeder, *An Introduction to Quantum Field Theory*
 * (1995), §20.1 (non-Abelian + complex-scalar SSB Lagrangian template).
 * Hidden-sector models follow the same form: Essig et al. Snowmass 2013
 * (arXiv:1311.0029) §3.
 *
 * Honest-claude path taken: this is a canonical textbook correction (the
 * form is from Peskin-Schroeder §20.1), so the *form* of the Lagrangian is
 * now canonical. Status REMAINS 'speculative' because what is speculative
 * is not the typesetting but the existence of a hidden non-Abelian dark
 * sector with this field content — that physics conjecture is unverified.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be18 = BRIDGE_EQUATIONS.find((e) => e.id === 18);

describe('BE-18 Non-Abelian Dark Matter Gauge Theory (R1 audit fix)', () => {
  it('exists in the index', () => {
    expect(be18).toBeDefined();
  });

  it("status remains 'speculative' (form is now canonical, but the dark-sector physics conjecture is what is speculative)", () => {
    expect(be18!.status).toBe('speculative');
  });

  it('formula_latex contains the |D_μ Φ|² kinetic term', () => {
    const f = be18!.formula_latex;
    // The corrected Lagrangian must contain `|D_\mu \Phi|^2`. Match the
    // literal token; small whitespace variations are tolerated by the regex.
    expect(f).toMatch(/\|D_\\mu\s*\\Phi\|\^2/);
  });

  it('formula_latex uses the canonical L = T − V convention (V appears with a minus sign)', () => {
    const f = be18!.formula_latex;
    // The corrected Lagrangian subtracts V(|Φ|) (Lagrangian = T − V).
    expect(f).toMatch(/-\s*V\(\|\\Phi\|\)/);
    // It should NOT have `+ V(|Φ|)` anywhere (the original buggy form).
    expect(f).not.toMatch(/\+\s*V\(\|\\Phi\|\)/);
  });

  it('formula_latex still contains the gauge field strength and Dirac kinetic terms', () => {
    const f = be18!.formula_latex;
    // The (-1/4) G^a_{μν} G^{aμν} gauge kinetic term must remain.
    expect(f).toMatch(/-\\frac\{1\}\{4\}\s*G\^a_\{\\mu\\nu\}\s*G\^\{a\\mu\\nu\}/);
    // The Dirac fermion kinetic + mass term must remain.
    expect(f).toMatch(/\\bar\{\\psi\}\(i\\gamma\^\\mu\s*D_\\mu\s*-\s*m_\\psi\)\\psi/);
  });

  it("known_issues no longer contains the 'missing kinetic term' issue", () => {
    // The R1 audit's 'other / spec-edit' issue is resolved.
    for (const issue of be18!.known_issues) {
      expect(issue.description).not.toMatch(/no kinetic term|non-dynamical|missing kinetic/i);
    }
  });

  it('notes acknowledge the 2026-05-01 R1 audit correction and cite Peskin-Schroeder', () => {
    const n = be18!.notes;
    expect(n).toMatch(/2026-05-01|R1 audit/);
    expect(n).toMatch(/Peskin-Schroeder|Peskin & Schroeder/i);
  });

  it('references include the Peskin-Schroeder textbook citation', () => {
    expect(be18!.references.some((r) => /Peskin-Schroeder/.test(r))).toBe(true);
  });
});
