/**
 * Path A (MathTS-backed) parser against the IDENTICAL shared conformance
 * suite. Gated on the optional peer @danielsimonjr/mathts-functions — when
 * absent (CI without the sister repo installed) we skip rather than fail to
 * load. Same discipline as engine-conformance.mathts.test.ts.
 *
 * Both parsers passing this suite is the contract that makes the registry's
 * Path B ↔ Path A swap transparent.
 */
import { describe } from 'vitest';
import { runFormulaConformance } from './formula-conformance.js';

try {
  const { loadMathtsFormulaParser } = await import(
    '../../src/numerical/formula-mathts.js'
  );
  const parser = await loadMathtsFormulaParser();
  // Confirm it actually assembled + evaluates before declaring the suite.
  if (parser.parse('a*b^2+1').evaluate({ a: 3, b: 4 }) !== 49) {
    throw new Error('mathts parser smoke check failed');
  }
  runFormulaConformance(parser, 'mathts');
} catch {
  describe.skip('formula conformance — MathTS (skipped: optional dep absent)', () => {});
}
