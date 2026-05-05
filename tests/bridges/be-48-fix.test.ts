/**
 * Regression test for BE-48 (Objective Collapse Equation / GRW extension)
 * audit fix.
 *
 * Branch: fix/be-48-grw-objective-collapse (2026-05-04)
 *
 * Background: BE-48 was flagged R0 in the Tier-3 audit
 * (docs/planning/Bridge-Remediation-Plan.md) because the localization operator
 * `L_x = exp[-(r-x)^2 / (2 sigma^2)]` was written WITHOUT the canonical 3D
 * GRW prefactor `(pi sigma^2)^(-3/4)`. Without that normalization,
 * `int d^3 x L_x^dagger L_x` is not dimensionless (it injects an unabsorbed
 * `[L^3]` factor) and the master equation's `dρ/dt` does not close to
 * `[T^-1]` as required.
 *
 * Reference: Ghirardi-Rimini-Weber 1986, Phys. Rev. D 34:470 (original);
 * Bassi-Ghirardi 2003, Phys. Rep. 379:257 review (arXiv:quant-ph/0302164).
 *
 * Honest-claude path taken: this is a typesetting correction to a canonical
 * formula (the 1986 GRW master equation), so:
 *   - status remains 'established' (no downgrade — the physics is canonical;
 *     only the rendering was incomplete),
 *   - the prefactor was added directly to formula_latex,
 *   - the "missing prefactor" known_issue was REMOVED (issue is resolved,
 *     not preserved),
 *   - dimensional_signature was set to '[time^-1]' (the canonical Lindblad
 *     rate-form signature; both sides of the master equation are [T^-1]
 *     once the prefactor makes the d^3x integral dimensionless and λ
 *     carries [T^-1]),
 *   - the unsourced rate `lambda ~ 1e-17 s^-1` was simultaneously corrected
 *     to the canonical GRW value `lambda ~ 1e-16 s^-1` (the 1e-17 figure
 *     refers to a specific CSL bound and was not justified in-spec).
 *
 * This test asserts the audit-fix invariants in the index entry.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be48 = BRIDGE_EQUATIONS.find((e) => e.id === 48);

describe('BE-48 Objective Collapse Equation / GRW (audit fix)', () => {
  it('exists in the index', () => {
    expect(be48).toBeDefined();
  });

  it("status remains 'established' (canonical typesetting fix, not a downgrade)", () => {
    // GRW objective collapse is well-established literature. The R0 audit
    // finding was a missing normalization on a canonical formula, not a
    // physics-level concern, so the established status must be preserved.
    expect(be48!.status).toBe('established');
  });

  it('formula_latex contains the canonical (πσ²)^{-3/4} prefactor', () => {
    // The literal LaTeX should encode the prefactor as `(\pi\sigma^2)^{-3/4}`.
    // We assert that π, σ², and the -3/4 power all appear — that combination
    // is unique to the GRW prefactor and will catch a regression that drops
    // the normalization.
    const f = be48!.formula_latex;
    expect(f).toMatch(/\\pi/);
    expect(f).toMatch(/\\sigma\^2|\\sigma\^\{2\}/);
    expect(f).toMatch(/-3\/4|\{-3\/4\}/);
  });

  it("known_issues no longer contains the 'missing prefactor' dimensional issue", () => {
    // The R0 audit's dimensional issue is resolved by the spec-edit. We
    // remove rather than preserve because (a) the formula in the index now
    // shows the corrected form, (b) the spec carries a "Corrected on
    // 2026-05-04" block that records what was changed and why. No issue
    // should remain that complains about the prefactor being absent or the
    // master equation being dimensionally inconsistent.
    for (const issue of be48!.known_issues) {
      expect(issue.severity).not.toBe('dimensional');
      expect(issue.description).not.toMatch(/master equation is dimensionally inconsistent/i);
    }
  });

  it("dimensional_signature is '[frequency]' (Lindblad rate form)", () => {
    // dρ/dt has units [T^-1] (ρ dimensionless, t in seconds). The commutator
    // term (i/ℏ)[H,ρ] reduces to [T^-1] (ℏ in J·s, H in J). The localization
    // term λ ∫ d³x [L_x ρ L_x† − ½{L_x† L_x, ρ}] reduces to [T^-1] only once
    // the (πσ²)^{-3/4} prefactor makes the d³x integral dimensionless and λ
    // carries [T^-1]. The framework's format() emits this as '[frequency]'
    // (NAMED_DIMENSIONS: ['frequency', {T:-1, ...}]); '[time^-1]' is not a
    // form format() ever produces.
    expect(be48!.dimensional_signature).toBe('[frequency]');
    expect(be48!.dimensional_signature).not.toBeNull();
  });

  it('notes acknowledge the 2026-05-04 R0 audit correction and cite GRW 1986', () => {
    const n = be48!.notes;
    expect(n).toMatch(/2026-05-04|R0 audit/);
    // Citation should mention the original GRW paper.
    expect(n).toMatch(/Ghirardi-Rimini-Weber|GRW 1986|Phys\. Rev\. D 34/);
  });

  it('formula_latex still encodes the Lindblad-form master equation structure', () => {
    // We added the prefactor but must NOT have accidentally removed the
    // commutator, the d^3x integral, the L_x ρ L_x† dissipator, or the
    // anticommutator `½{L_x† L_x, ρ}`.
    const f = be48!.formula_latex;
    expect(f).toMatch(/\\frac\{d\\rho\}\{dt\}/);
    expect(f).toMatch(/\[H,\\rho\]/);
    expect(f).toMatch(/\\int d\^3x|\\int d\^\{3\}x/);
    expect(f).toMatch(/L_x \\rho L_x\^\\dagger/);
    // Anticommutator ½{L_x† L_x, ρ} — braces should now be properly escaped.
    expect(f).toMatch(/\\frac\{1\}\{2\}\\\{L_x\^\\dagger L_x, \\rho\\\}/);
  });
});
