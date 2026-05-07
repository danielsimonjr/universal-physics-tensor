/**
 * Wave P-B R-B2 (2026-05-06): BE-13 Landauer-Wheeler Information-Geometry
 * reformulated to the canonical Jacobson 1995 thermodynamic derivation
 * of Einstein's equations from the Clausius relation δQ = T dS applied
 * to local Rindler horizons:
 *
 *   R_μν − (1/2) R g_μν + Λ g_μν = (8π G / c⁴) T_μν
 *
 * The "information geometry" content of UPT BE-13 is captured by
 * Jacobson's framing: gravitational field equations are the macroscopic
 * equation of state for the underlying microscopic spacetime degrees
 * of freedom. The spurious k_B T ln(2) I_μν term (Landauer
 * mis-attribution) is dropped — Jacobson's derivation has no such term.
 *
 * Replaces tests/bridges/be-13-r3-disposition.test.ts (deleted).
 *
 * Honest-archaeology pattern (Wave-G precedent, BE-37; Wave-I.B C4
 * BE-38; Wave-P-A R-A1..A4 BE-30/33/43/50; Wave-P-B R-B1 BE-12).
 *
 * WebFetch on arXiv:gr-qc/9504004 confirmed: "The Einstein equation is
 * derived from the proportionality of entropy and horizon area together
 * with the fundamental relation δQ = T dS. The relation is required to
 * hold for all the local Rindler causal horizons through each
 * spacetime point." The abstract describes the derivation method
 * (thermodynamic) but does not reproduce the full tensor equation;
 * commitment to the canonical Einstein-equation form follows standard
 * GR literature with Jacobson's interpretive framing.
 */
import { describe, it, expect } from 'vitest';
import { BRIDGE_EQUATIONS } from '../../src/bridges/index.js';

const be13 = BRIDGE_EQUATIONS.find((e) => e.id === 13);

describe('BE-13 Information-Geometry (Wave P-B R-B2 reformulation, Jacobson 1995)', () => {
  it('exists in the index', () => {
    expect(be13).toBeDefined();
  });

  it("status is now 'speculative' (Einstein equations established; Jacobson information-geometry framing speculative)", () => {
    expect(be13!.status).toBe('speculative');
  });

  it('formula_latex contains the canonical Einstein equations content (Wave Y: scalar trace form)', () => {
    // Wave Y reformulation: formula_latex now displays the scalar trace
    // R = 4Λ - (8πG/c⁴)T (g^μν contraction of the full tensor equation).
    // Both forms preserve the Λ + 8πG + T_or_T_μν content.
    expect(be13!.formula_latex).toMatch(/R\s*=|R_\{?\\mu\\nu\}?/);
    expect(be13!.formula_latex).toMatch(/\\Lambda/);
    expect(be13!.formula_latex).toMatch(/8\\?pi|8\s*\\?pi/);
    expect(be13!.formula_latex).toMatch(/\bG\b|G\s/);
    expect(be13!.formula_latex).toMatch(/\bT\b|T_\{?\\mu\\nu\}?/);
  });

  it('does not retain the spurious k_B T ln(2) I_μν Landauer-attribution term', () => {
    expect(be13!.formula_latex).not.toMatch(/k_B\s*T\s*\\?ln\s*\(?\s*2/i);
    expect(be13!.formula_latex).not.toMatch(/I_\{?\\mu\\nu\}?/);
  });

  it('references include Jacobson 1995 (gr-qc/9504004) and explicit Clausius / equation-of-state framing', () => {
    const refs = be13!.references.join(' | ');
    expect(refs).toMatch(/Jacobson 1995|gr-qc\/9504004/);
    expect(refs).toMatch(/Clausius|equation of state|thermodynamic/i);
  });

  it('notes record the 2026-05-06 reformulation under Wave P-B R-B2', () => {
    expect(be13!.notes).toMatch(/Reformulated 2026-05-06/);
    expect(be13!.notes).toMatch(/Wave P-B/);
  });

  it('notes commit to Jacobson framing (not Verlinde or Padmanabhan)', () => {
    expect(be13!.notes).toMatch(/Jacobson/);
    expect(be13!.notes).toMatch(/Rindler|Clausius|local horizon/i);
  });

  it("tractability_class is 'closed-form' (Wave Y: scalar trace is single algebraic relation; was 'numerical-tractable' for full tensor PDE)", () => {
    expect(be13!.tractability_class).toBe('closed-form');
  });

  it('known_issues retains a phenomenological-ansatz / reformulation entry for the information-geometry framing', () => {
    expect(be13!.known_issues.length).toBeGreaterThan(0);
    const hasFramingIssue = be13!.known_issues.some(
      (i) =>
        i.severity === 'phenomenological-ansatz' && i.fixable === 'reformulation',
    );
    expect(hasFramingIssue).toBe(true);
  });
});
