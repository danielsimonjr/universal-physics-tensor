/**
 * Regression test for BE-47 (BBN Dark Sector Coupling) R1 audit fix.
 *
 * Branch: fix/r1-batch-spec-edits (2026-05-01)
 *
 * Background: BE-47 was flagged R1 (speculative + spec-edit fixable) for
 * two coupled errors in the base Boltzmann equation:
 *   1. Missing the Hubble dilution drag term `+3HY` that must appear in
 *      every species-abundance equation in an FRW background.
 *   2. `<σv>_SM n_b²` used a single-species square where the standard
 *      two-body reaction (p+n → d+γ) requires the unlike-species product
 *      `n_p n_n`. The `n_b²` form is only appropriate when both reactants
 *      are the same species.
 *
 * References:
 *   Kolb & Turner *The Early Universe* (1990) §5.2 Eq. 5.13–5.14 (Hubble
 *     drag in species Boltzmann eqs);
 *   Steigman 2007 ARNPS 57:463 Eq. 27 (canonical p+n→d+γ rate);
 *   Pitrou-Coc-Uzan-Vangioni 2018 Phys. Rep. 754:1 Eq. 2.5 (full BBN
 *     network template).
 *
 * Honest-claude: status remains 'speculative'. The *base* equation form
 * is now canonical Kolb-Turner; the speculative content is the dark-sector
 * coupling `n_χ² ε_transfer` term, which remains unverified.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be47 = BRIDGE_EQUATIONS.find((e) => e.id === 47);

describe('BE-47 BBN Dark Sector Coupling (R1 audit fix)', () => {
  it('exists in the index', () => {
    expect(be47).toBeDefined();
  });

  it("status remains 'speculative' (base form now canonical; dark-sector coupling is the speculative content)", () => {
    expect(be47!.status).toBe('speculative');
  });

  it('formula_latex contains the +3HY Hubble dilution drag on the LHS', () => {
    const f = be47!.formula_latex;
    // The LHS should now read `dY/dt + 3HY`.
    expect(f).toMatch(/\\frac\{dY\}\{dt\}\s*\+\s*3HY/);
  });

  it('formula_latex contains the species-correct n_p n_n product (not n_b^2)', () => {
    const f = be47!.formula_latex;
    // Standard p+n -> d+gamma reaction: rate ∝ n_p · n_n.
    expect(f).toMatch(/n_p\s*n_n/);
    // The original buggy single-species square `n_b^2` must be gone.
    expect(f).not.toMatch(/n_b\^2/);
  });

  it('formula_latex preserves the dark-sector coupling term n_χ² ε_transfer', () => {
    const f = be47!.formula_latex;
    expect(f).toMatch(/n_\\chi\^2/);
    expect(f).toMatch(/\\epsilon_\{\\text\{transfer\}\}/);
  });

  it("known_issues no longer contains the 'missing Hubble drag' or 'n_b^2' issues", () => {
    for (const issue of be47!.known_issues) {
      expect(issue.description).not.toMatch(/missing the Hubble|n_b.{0,3}\^?\s*2|species-identical/i);
    }
  });

  it('notes acknowledge the 2026-05-01 R1 audit correction and cite Kolb-Turner / Pitrou', () => {
    const n = be47!.notes;
    expect(n).toMatch(/2026-05-01|R1 audit/);
    expect(n).toMatch(/Kolb|Turner|Pitrou/i);
  });

  it('references include the canonical BBN textbook citations', () => {
    const refs = be47!.references.join(' | ');
    expect(refs).toMatch(/Kolb-Turner|Kolb & Turner/i);
    expect(refs).toMatch(/Pitrou/i);
    // Original Wagoner-Fowler-Hoyle citation should also be present.
    expect(refs).toMatch(/Wagoner/i);
  });
});
