import { describe, it, expect } from 'vitest';
import { expectBridgeInIndex } from './_helpers.js';

/**
 * BE-37 was REFORMULATED 2026-05-11 (Wave Z-F, per OpenAI o3
 * consultation) from `status='invalid'` (R3 disposition 2026-05-05,
 * vacuum c(t,x)≠const ansatz operationally meaningless per Ellis-Uzan
 * 2005) to `status='speculative'` via the Shapiro gravitational time-
 * delay reformulation. Same precedent as Wave P-D R-D2 BE-25 (Penrose-
 * Hameroff → IIT) and Wave Z-E BE-16 (Complexity-Entropy → Landauer).
 *
 * This test file is renamed-in-spirit to "Wave-Z-F reformulation"
 * (the historical R3 disposition is preserved in references[] and
 * notes[] for archival traceability). The test assertions verify the
 * new state, not the legacy invalid status.
 */
describe('BE-37 (Modified light-propagation: Shapiro delay) — Wave Z-F reformulation (2026-05-11)', () => {
  it('exists', () => {
    expectBridgeInIndex(37);
  });

  it("status is 'speculative' under Wave Z-F reformulation (was 'invalid' under R3 disposition)", () => {
    // Reformulated to Shapiro delay per OpenAI o3 consultation. Status
    // 'speculative' (not 'established') because Shapiro itself is
    // canonical and experimentally confirmed but the bridge framing
    // remains speculative.
    expectBridgeInIndex(37, 'speculative');
  });

  it("formula_latex is the Shapiro delay form (not the legacy c(t) ansatz)", () => {
    const be37 = expectBridgeInIndex(37);
    expect(be37.formula_latex).toMatch(/Delta t|2\s*G\s*M|R_{\\text\{far\}\}/);
    expect(be37.formula_latex).not.toMatch(/c\(t\)|epsilon.*t_P/);
  });

  it('all known_issues are now fixable: reformulation (resolved by Wave Z-F)', () => {
    // The R3-era issues (operationally-undefined, phenomenological-ansatz)
    // are retained for historical traceability but `fixable` is now
    // 'reformulation' — they were addressed via reformulation, not by
    // patching the broken ansatz.
    const be37 = expectBridgeInIndex(37);
    for (const iss of be37.known_issues) {
      expect(iss.fixable).toBe('reformulation');
    }
    expect(be37.known_issues.length).toBeGreaterThan(0);
  });

  it('cites Ellis-Uzan in references or notes (the critique that motivated reformulation)', () => {
    const be37 = expectBridgeInIndex(37);
    const corpus = [be37.notes, ...be37.references].join(' ');
    expect(corpus).toMatch(/Ellis-Uzan|gr-qc\/0305099/);
  });

  it('cites Shapiro in references (the canonical reformulation source)', () => {
    const be37 = expectBridgeInIndex(37);
    const corpus = [be37.notes, ...be37.references].join(' ');
    expect(corpus).toMatch(/Shapiro 1964|Bertotti|Cassini/);
  });

  it("notes block documents the Wave Z-F reformulation", () => {
    const be37 = expectBridgeInIndex(37);
    expect(be37.notes).toMatch(/Wave Z-F|Shapiro/i);
  });

  it('notes references the historical disposition brief for traceability', () => {
    const be37 = expectBridgeInIndex(37);
    expect(be37.notes).toMatch(/BE-37-VSL-Disposition-Brief/);
  });

  it("dimensional_signature is '[time]' (Δt is a time delay)", () => {
    const be37 = expectBridgeInIndex(37);
    expect(be37.dimensional_signature).toBe('[time]');
  });
});
