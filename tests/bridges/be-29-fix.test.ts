/**
 * Regression test for BE-29 (Jarzynski free-energy equality).
 *
 * **History**:
 *   - 2026-05-01 (R1 audit, branch fix/r1-batch-spec-edits): replaced
 *     the ill-defined `g_{μν} dT^{μν}` integral with the canonical
 *     Hilbert action variation `(1/(2c⁴)) ∫ T^{μν} δg_{μν} √(-g) d⁴x`.
 *   - 2026-05-07 (Wave Y reformulation): superseded the curved-spacetime
 *     gravity-extension form ⟨exp(-βW)⟩ = exp(-βΔF) · exp(-(β/2c⁴)∫...)
 *     with the canonical pure Jarzynski equality
 *     ΔF = -k_B T ln⟨exp(-W/(k_B T))⟩. The gravity-correction term is
 *     dropped as the AST-unencodable speculative element; the bridge
 *     framing (Jarzynski extension to gravitational work) is preserved
 *     in known_issues.
 *
 * Under the Wave Y reformulation the R1-audit-era gravity-form
 * regression assertions (Hilbert action variation tokens, √(-g),
 * d⁴x, 1/(2c⁴) prefactor, MTW/Wald references) are no longer
 * applicable to the displayed `formula_latex`. They are retained
 * here only as **archive guards** that preserve the audit trail:
 * the dropped gravity-correction extension SHOULD be referenced
 * somewhere in the BE-29 entry's notes / references / known_issues
 * (so future readers see why the form changed), but it should NOT
 * appear in `formula_latex` (which now displays the pure Jarzynski
 * equality).
 *
 * @see tests/bridges/be-29-encoding.test.ts (Wave Y AST-encoding tests)
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be29 = BRIDGE_EQUATIONS.find((e) => e.id === 29);

describe('BE-29 Jarzynski (R1 audit fix → Wave Y reformulation archive)', () => {
  it('exists in the index', () => {
    expect(be29).toBeDefined();
  });

  it("status remains 'speculative' (gravity-extension framing is the speculative element)", () => {
    expect(be29!.status).toBe('speculative');
  });

  it('formula_latex now displays the canonical pure Jarzynski equality (post Wave Y)', () => {
    const f = be29!.formula_latex;
    expect(f).toMatch(/\\Delta F/);
    expect(f).toMatch(/\\ln/);
    expect(f).toMatch(/k_B T/);
    expect(f).toMatch(/\\exp/);
  });

  it('formula_latex no longer carries the gravity-correction √(-g) d⁴x integral (Wave Y)', () => {
    const f = be29!.formula_latex;
    expect(f).not.toMatch(/\\sqrt\{-g\}/);
    expect(f).not.toMatch(/T\^\{\\mu\\nu\}/);
  });

  it('formula_latex no longer contains the ill-defined `dT^{μν}` token (preserved from R1 audit)', () => {
    const f = be29!.formula_latex;
    expect(f).not.toMatch(/dT\^\{\\mu\\nu\}/);
  });

  it('notes acknowledge the Wave Y reformulation', () => {
    const n = be29!.notes;
    expect(n).toMatch(/Wave Y/);
    expect(n).toMatch(/2026-05-07/);
  });

  it('notes preserve the R1-audit history (audit trail)', () => {
    const n = be29!.notes;
    expect(n).toMatch(/2026-05-01|R1 audit/);
  });

  it('references include canonical Jarzynski 1997 (the load-bearing reference post-reformulation)', () => {
    const refs = be29!.references.join(' | ');
    expect(refs).toMatch(/Jarzynski/);
    expect(refs).toMatch(/1997/);
  });

  it('references preserve MTW / Wald (now historical, gravity-extension framing)', () => {
    const refs = be29!.references.join(' | ');
    expect(refs).toMatch(/MTW|Misner|Thorne|Wheeler/i);
    expect(refs).toMatch(/Wald/i);
  });

  it('known_issues no longer contains the original "undefined integration measure" R1 issue', () => {
    for (const issue of be29!.known_issues) {
      expect(issue.description).not.toMatch(/undefined integration measure|dT\^\{?mu nu\}? is ambiguous/i);
    }
  });
});
