import { describe } from 'vitest';
import { runEngineConformance } from './engine-conformance.js';

// The IDENTICAL suite Float64ReferenceEngine runs (Task 5). Both engines
// passing this is the contract that makes parallel two-repo dev safe.
//
// Gated on the optional peer @danielsimonjr/mathts-tensor — when absent
// (e.g. in CI environments without the sister-repo installed) we skip
// rather than failing to load the file. Same discipline as
// `engine-conformance.test.ts:20`.
try {
  const mathts = await import('../../src/numerical/mathts-engine.js');
  runEngineConformance(() => new mathts.MathTSEngine(), 'full');
} catch {
  describe.skip('Engine conformance — MathTSEngine (skipped: optional dep absent)', () => {});
}
