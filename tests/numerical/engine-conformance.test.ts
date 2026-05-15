/**
 * Invokes the parameterized AD conformance suite against both engines.
 * Float64ReferenceEngine runs unconditionally; MathTSEngine runs only when
 * the optional @danielsimonjr/mathts-autograd dep is available (else skip).
 *
 * See tests/numerical/ad-conformance.ts for the factory.
 */
import { describe } from 'vitest';
import { Float64ReferenceEngine } from '../../src/numerical/float64-engine.js';
import { runADConformance } from './ad-conformance.js';

runADConformance(new Float64ReferenceEngine(), 'Float64ReferenceEngine');

// MathTS AD requires the optional autograd dep:
try {
  const mathts = await import('../../src/numerical/mathts-engine.js');
  await import('@danielsimonjr/mathts-autograd');
  runADConformance(new mathts.MathTSEngine(), 'MathTSEngine');
} catch {
  describe.skip('AD conformance — MathTSEngine (skipped: optional dep absent)', () => {});
}
