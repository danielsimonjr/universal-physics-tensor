/**
 * MathTS-backed parser (Path A) — behaviors specific to it, beyond the
 * shared conformance suite. Guarded on the optional peer.
 *
 * Pins the one ACCEPTED divergence from Path B (`e` = Euler's number, a
 * MathTS built-in) and the scalar-only seam guard (a non-number result is
 * rejected rather than leaking MathTS types).
 */
import { describe, it, expect } from 'vitest';

let parser: import('../../src/numerical/formula.js').FormulaParser | null = null;
try {
  const { loadMathtsFormulaParser } = await import(
    '../../src/numerical/formula-mathts.js'
  );
  parser = await loadMathtsFormulaParser();
  parser.parse('1+1').evaluate({}); // confirm it assembled
} catch {
  parser = null;
}

const d = parser ? describe : describe.skip;

d('formula-mathts (Path A specifics)', () => {
  it('recognizes Euler `e` as a constant (the accepted divergence from Path B)', () => {
    // Path B treats `e` as a free variable; MathTS knows it.
    expect([...parser!.parse('e * y').variables]).toEqual(['y']);
  });

  it('scalar-only guard: a non-number result is rejected, not leaked', () => {
    // A vector/array expression must throw rather than return a MathTS type.
    expect(() => parser!.parse('[1, 2, 3]').evaluate({})).toThrow();
  });

  it('still recovers a real physics value (Hawking temperature)', () => {
    const T = parser!.parse('hbar*c^3/(8*pi*G*M*k_B)').evaluate({
      hbar: 1.054571817e-34, c: 299792458, G: 6.6743e-11,
      M: 1.989e30, k_B: 1.380649e-23,
    });
    expect(T).toBeGreaterThan(6e-8);
    expect(T).toBeLessThan(6.3e-8);
  });
});
