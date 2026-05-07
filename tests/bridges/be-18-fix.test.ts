/**
 * Regression test for BE-18 (Non-Abelian Dark Matter Gauge Theory).
 *
 * **History**:
 *   - 2026-05-01 R1 audit: added the missing |D_μΦ|² kinetic term and
 *     flipped V sign to the canonical L = T − V convention (Peskin-
 *     Schroeder §20.1).
 *   - 2026-05-07 Wave Y reformulation: superseded the full non-Abelian
 *     Lagrangian density `formula_latex` with the canonical Higgs-like
 *     scalar mass-generation relation `m_dark = g_dark · v_dark`. The
 *     full Lagrangian is preserved as the bridge framing / context;
 *     the scalar mass relation is the AST-encoded bridge content.
 *
 * Under the Wave Y reformulation the R1-audit-era Lagrangian-form
 * regression assertions (|D_μΦ|² kinetic term, T − V convention,
 * gauge field strength, Dirac fermion kinetic) are no longer
 * applicable to the displayed `formula_latex`. They are retained
 * here only as **archive guards** that preserve the audit trail.
 *
 * @see tests/bridges/be-18-encoding.test.ts (Wave Y AST encoding)
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be18 = BRIDGE_EQUATIONS.find((e) => e.id === 18);

describe('BE-18 Non-Abelian Dark Matter (R1 audit fix → Wave Y reformulation archive)', () => {
  it('exists in the index', () => {
    expect(be18).toBeDefined();
  });

  it("status remains 'speculative' (dark-sector physics conjecture is the speculative element)", () => {
    expect(be18!.status).toBe('speculative');
  });

  it('formula_latex now displays the canonical Yukawa-VEV mass-generation form (post Wave Y)', () => {
    const f = be18!.formula_latex;
    expect(f).toMatch(/m_\{?\\text\{dark\}\}?/);
    expect(f).toMatch(/g_\{?\\text\{dark\}\}?/);
    expect(f).toMatch(/v_\{?\\text\{dark\}\}?/);
  });

  it('formula_latex no longer carries the full Lagrangian density (Wave Y)', () => {
    const f = be18!.formula_latex;
    expect(f).not.toMatch(/\\mathcal\{L\}/);
    expect(f).not.toMatch(/G\^a_\{\\mu\\nu\}/);
    expect(f).not.toMatch(/\\bar\{\\psi\}/);
  });

  it('notes preserve the R1-audit history (audit trail)', () => {
    const n = be18!.notes;
    expect(n).toMatch(/2026-05-01|R1 audit/);
    expect(n).toMatch(/Peskin-Schroeder|Peskin & Schroeder/i);
  });

  it('notes mention Wave Y reformulation', () => {
    expect(be18!.notes).toMatch(/Wave Y/);
  });

  it('references include the Peskin-Schroeder textbook citation', () => {
    expect(be18!.references.some((r) => /Peskin.*Schroeder/.test(r))).toBe(true);
  });
});
