/**
 * Wave P-A R-A2 (2026-05-06): BE-33 Quantum-Classical Critical Point
 * Mapping reformulated to canonical Hertz-Millis scaling form
 * ξ ~ T^{-ν/z} with commitment to 3D Heisenberg universality class
 * (z=1, ν≈0.71) as the canonical reference case.
 *
 * Replaces tests/bridges/be-33-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1 BE-30): when a bridge equation undergoes a
 * disposition change (here: R3 invalid → reformulation landed using
 * canonical literature form), the prior disposition-pinning tests are
 * deleted and replaced.
 *
 * Reference scaling form: Hertz 1976 PRB 14:1165, Millis 1993 PRB
 * 48:7183, Sondhi-Girvin-Carini-Shahar 1997 RMP 69:315, Sachdev
 * 'Quantum Phase Transitions' 2nd ed. (2011) Ch. 11.
 *
 * Honest-claude flag: WebFetch on Sachdev/Wikipedia did not return
 * the canonical scaling form directly (abstract-only fetches);
 * commitment to ξ ~ T^{-ν/z} (rather than the simpler ξ ~ T^{-1/z})
 * follows the textbook convention used by Sondhi et al. 1997 RMP
 * review and Sachdev's 2011 textbook treatment, but the precise
 * convention is not WebFetch-confirmed in this commit.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be33 = BRIDGE_EQUATIONS.find((e) => e.id === 33);

describe('BE-33 Quantum-Classical Critical Point Mapping (Wave P-A R-A2 reformulation)', () => {
  it('exists in the index', () => {
    expect(be33).toBeDefined();
  });

  it("status is now 'speculative' (canonical scaling form, framework-pin to 3D Heisenberg)", () => {
    expect(be33!.status).toBe('speculative');
  });

  it('formula_latex contains the canonical Hertz-Millis ξ ~ T^{-ν/z} form', () => {
    expect(be33!.formula_latex).toMatch(/xi|\\xi/i);
    // Looking for either T^{-ν/z}, T^{-nu/z}, T^{-1/z}, or T/T_0 form raised to -ν/z
    expect(be33!.formula_latex).toMatch(/\bT\b/);
    expect(be33!.formula_latex).toMatch(/\^/);
    // Must contain the dynamic exponent z explicitly
    expect(be33!.formula_latex).toMatch(/\\nu|nu/);
    expect(be33!.formula_latex).toMatch(/\/z\}|\/\s*z/);
  });

  it('does not retain the broken √(1 + (E_0/k_B T)²) denominator form', () => {
    expect(be33!.formula_latex).not.toMatch(/E_0\s*\/\s*k_B\s*T/);
    expect(be33!.formula_latex).not.toMatch(/sqrt\{1\s*\+/);
  });

  it('references include Hertz 1976, Millis 1993, and Sachdev 2011', () => {
    const refs = be33!.references.join(' | ');
    expect(refs).toMatch(/Hertz 1976/);
    expect(refs).toMatch(/Millis 1993/);
    expect(refs).toMatch(/Sachdev/);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-A R-A2', () => {
    expect(be33!.notes).toMatch(/Reformulated 2026-05-06/);
    expect(be33!.notes).toMatch(/Wave P-A/);
  });

  it('notes commit to 3D Heisenberg universality class as canonical reference (z=1, ν≈0.71)', () => {
    expect(be33!.notes).toMatch(/3D Heisenberg|Heisenberg/i);
    expect(be33!.notes).toMatch(/0\.71|nu.*0\.71|ν.*0\.71/);
  });

  it('known_issues retains a reformulation entry for alternative-universality-class extension', () => {
    expect(be33!.known_issues.length).toBeGreaterThan(0);
    const hasFramingIssue = be33!.known_issues.some(
      (i) => i.fixable === 'reformulation',
    );
    expect(hasFramingIssue).toBe(true);
  });
});
