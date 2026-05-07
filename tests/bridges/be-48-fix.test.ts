/**
 * Regression test for BE-48 (GRW objective collapse).
 *
 * **History**:
 *   - 2026-05-04 R0 audit: added the canonical 3D GRW prefactor
 *     `(πσ²)^(-3/4)` to L_x so the master equation closed dimensionally.
 *   - 2026-05-07 Wave Y reformulation: superseded the full GRW Lindblad
 *     master equation as `formula_latex` with the canonical scalar
 *     mass-amplification rate `λ_GRW(m) = λ_0 · (m/m_0)`. The Lindblad
 *     master equation is the bridge framing / context; the scalar rate
 *     is the AST-encoded bridge content (parallel to BE-11 encoding only
 *     the Caldeira-Leggett rate γ_k(λ), not the full Lindblad).
 *
 * Under the Wave Y reformulation:
 *   - status downgraded from 'established' to 'speculative' (consistent
 *     with BE-22, BE-26, BE-38, BE-48 precedent: canonical math, bridge
 *     framing speculative).
 *   - formula_latex no longer carries the Lindblad master equation;
 *     R0 audit's prefactor / commutator / dissipator regression
 *     assertions are no longer applicable to the displayed formula.
 *   - The R0-audit history is preserved in `notes` as audit-trail
 *     traceability.
 *
 * @see tests/bridges/be-48-encoding.test.ts (Wave Y AST-encoding tests)
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be48 = BRIDGE_EQUATIONS.find((e) => e.id === 48);

describe('BE-48 GRW (R0 audit fix → Wave Y reformulation archive)', () => {
  it('exists in the index', () => {
    expect(be48).toBeDefined();
  });

  it("status changed to 'speculative' (Wave Y: bridge framing speculative; same precedent as BE-22, BE-26, BE-38)", () => {
    expect(be48!.status).toBe('speculative');
  });

  it('formula_latex now displays the canonical mass-amplified rate (post Wave Y)', () => {
    expect(be48!.formula_latex).toMatch(/\\lambda_\{?\\text\{GRW\}\}?/);
    expect(be48!.formula_latex).toMatch(/m_0/);
  });

  it('formula_latex no longer carries the Lindblad master equation (Wave Y)', () => {
    const f = be48!.formula_latex;
    expect(f).not.toMatch(/\\frac\{d\\rho\}\{dt\}/);
    expect(f).not.toMatch(/\[H,\\rho\]/);
    expect(f).not.toMatch(/L_x/);
  });

  it("dimensional_signature is '[frequency]' (Wave Y AST encoding)", () => {
    expect(be48!.dimensional_signature).toBe('[frequency]');
  });

  it('notes preserve the R0-audit history (audit trail)', () => {
    const n = be48!.notes;
    expect(n).toMatch(/2026-05-04|R0 audit/);
    expect(n).toMatch(/Ghirardi-Rimini-Weber|GRW 1986|Phys\. Rev\. D 34/);
  });

  it('notes mention Wave Y reformulation', () => {
    const n = be48!.notes;
    expect(n).toMatch(/Wave Y/);
    expect(n).toMatch(/2026-05-07/);
  });

  it('references include canonical GRW 1986 (the load-bearing reference)', () => {
    const refs = be48!.references.join(' | ');
    expect(refs).toMatch(/Ghirardi.*Rimini.*Weber 1986/);
  });
});
